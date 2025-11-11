# Docker Compose Setup

This Docker Compose configuration provides all the infrastructure services needed for Suzent:

- **PostgreSQL 18 + pgvector** - Memory system database
- **Redis (Valkey)** - Cache for SearXNG
- **SearXNG** - Privacy-respecting metasearch engine

## Quick Start

### 1. Configure Environment

The Docker Compose setup uses the `.env` file from the project root. Make sure you have it configured:

```bash
# Copy example if needed
cp .env.example .env

# Edit configuration
nano .env  # or use your preferred editor
```

Key variables for Docker services:

```bash
# PostgreSQL
POSTGRES_HOST=127.0.0.1
POSTGRES_PORT=5430
POSTGRES_DB=suzent
POSTGRES_USER=suzent
POSTGRES_PASSWORD=password

# SearXNG
SEARXNG_BASE_URL=http://127.0.0.1:2077/
SEARXNG_SECRET=  # Generate with: openssl rand -hex 32
```

### 2. Start Services

```bash
# From project root
docker compose -f docker/docker-compose.yml up -d

# Or from docker folder
cd docker
docker compose up -d

# View logs
docker compose -f docker/docker-compose.yml logs -f

# View logs for specific service
docker compose -f docker/docker-compose.yml logs -f postgres
```

### 3. Verify Services

```bash
# Check service status
docker compose -f docker/docker-compose.yml ps

# Test PostgreSQL
docker compose -f docker/docker-compose.yml exec postgres psql -U suzent -d suzent -c "SELECT version();"

# Test pgvector extension
docker compose -f docker/docker-compose.yml exec postgres psql -U suzent -d suzent -c "SELECT extversion FROM pg_extension WHERE extname='vector';"

# Test SearXNG (open in browser or use curl)
# http://localhost:2077/
```

### 4. Initialize Database

The database schema is automatically initialized on first startup from `../src/suzent/memory/schema.sql`.

To manually re-initialize:

```bash
docker compose -f docker/docker-compose.yml exec postgres psql -U suzent -d suzent -f /docker-entrypoint-initdb.d/01-schema.sql
```

## Service Details

### PostgreSQL (suzent-postgres)

- **Port**: 5430 (mapped from internal 5432)
- **Database**: suzent
- **Extensions**: pgvector 0.8.1, pg_trgm
- **Data**: Persisted in `postgres-data` volume
- **Schema**: Auto-initialized from `../src/suzent/memory/schema.sql`

Connection string:
```
postgresql://suzent:ultra_secret@127.0.0.1:5430/suzent
```

**Important:** Use `127.0.0.1` instead of `localhost` to avoid IPv6 timeout issues (~40 second delays).

### SearXNG (suzent-searxng)

- **Port**: 2077
- **URL**: http://localhost:2077/
- **Config**: `searxng/settings.yml` and `searxng/limiter.toml`
- **Cache**: Redis backend
- **Secret**: Set via `SEARXNG_SECRET` environment variable

API endpoint:
```
http://localhost:2077/search?q=query&format=json
```

Configuration files:
- `searxng/settings.yml` - Main SearXNG settings
- `searxng/limiter.toml` - Rate limiting configuration

### Redis (suzent-redis)

- **Port**: Not exposed (internal only)
- **Network**: suzent-network
- **Data**: Persisted in `redis-data` volume

## Management

### Stop Services

```bash
# Stop all services (from project root)
docker compose -f docker/docker-compose.yml down

# Stop and remove volumes (WARNING: deletes all data)
docker compose -f docker/docker-compose.yml down -v
```

### Update Services

```bash
# Pull latest images
docker compose -f docker/docker-compose.yml pull

# Recreate containers with new images
docker compose -f docker/docker-compose.yml up -d --force-recreate
```

### Backup Database

```bash
# Backup PostgreSQL database
docker compose -f docker/docker-compose.yml exec postgres pg_dump -U suzent suzent > backup.sql

# Restore from backup
docker compose -f docker/docker-compose.yml exec -T postgres psql -U suzent -d suzent < backup.sql
```

### View Resource Usage

```bash
docker compose -f docker/docker-compose.yml stats
```

## Troubleshooting

### PostgreSQL Connection Issues

If you see "localhost" connection delays (~40s), ensure you're using `127.0.0.1` instead:

```bash
POSTGRES_HOST=127.0.0.1  # Not "localhost"
```

This avoids IPv6 timeout issues on Windows.

### SearXNG Not Starting

1. Check Redis is running:
   ```bash
   docker compose -f docker/docker-compose.yml ps redis
   ```

2. Check SearXNG logs:
   ```bash
   docker compose -f docker/docker-compose.yml logs searxng
   ```

3. Verify config files exist:
   ```bash
   ls -la docker/searxng/
   ```

4. Generate a secret key if missing:
   ```bash
   openssl rand -hex 32
   # Add to .env: SEARXNG_SECRET=<generated-secret>
   ```

### Database Already Exists

If you need to recreate the database:

```bash
# Stop services
docker compose -f docker/docker-compose.yml down

# Remove postgres volume
docker volume rm docker_postgres-data

# Start fresh
docker compose -f docker/docker-compose.yml up -d postgres
```

### Port Conflicts

If ports 5430 or 2077 are already in use, change them in `.env`:

```bash
POSTGRES_PORT=5431
SEARXNG_PORT=2078
```

Then restart:
```bash
docker compose -f docker/docker-compose.yml down
docker compose -f docker/docker-compose.yml up -d
```

### Container Name Conflicts

If you get "container name already in use" errors:

```bash
# Remove old containers
docker rm -f suzent-postgres suzent-redis suzent-searxng

# Or stop and remove all
docker compose -f docker/docker-compose.yml down
docker compose -f docker/docker-compose.yml up -d
```

## Production Considerations

### Security

1. **Change default passwords**:
   ```bash
   POSTGRES_PASSWORD=$(openssl rand -hex 32)
   SEARXNG_SECRET=$(openssl rand -hex 32)
   ```

2. **Don't expose ports publicly** - Use reverse proxy (Nginx/Caddy)

3. **Use Docker secrets** for sensitive data in production

### Performance

1. **Adjust PostgreSQL memory settings**:
   ```yaml
   # In docker-compose.yml
   command: postgres -c shared_buffers=256MB -c max_connections=200
   ```

2. **Enable connection pooling** - Use PgBouncer if needed

3. **Monitor resource usage**:
   ```bash
   docker compose -f docker/docker-compose.yml stats
   ```

### Backup Strategy

1. **Automated backups**:
   ```bash
   # Add to crontab (Linux/WSL)
   0 2 * * * cd /path/to/suzent && docker compose -f docker/docker-compose.yml exec -T postgres pg_dump -U suzent suzent | gzip > backups/suzent-$(date +\%Y\%m\%d).sql.gz
   ```

2. **Volume backups**:
   ```bash
   docker run --rm -v docker_postgres-data:/data -v $(pwd)/backups:/backup alpine tar czf /backup/postgres-data.tar.gz /data
   ```

## File Structure

```
docker/
├── docker-compose.yml    # Main compose configuration
├── README.md            # This file
└── searxng/            # SearXNG configuration
    ├── settings.yml    # Main settings
    └── limiter.toml    # Rate limiting
```

## Network Architecture

```
External Access
      ↓
127.0.0.1:5430 → PostgreSQL (suzent-postgres)
127.0.0.1:2077 → SearXNG (suzent-searxng)
      ↓
suzent-network (internal bridge)
      ↓
Redis (suzent-redis) - internal cache
```

## See Also

- [Memory System Setup](docs/MEMORY_QUICKSTART.md)
- [SearXNG Documentation](https://docs.searxng.org/)
- [pgvector Documentation](https://github.com/pgvector/pgvector)
