#!/bin/bash

# Memory System Database Setup Script
# This script helps you set up PostgreSQL with pgvector for the memory system
# Supports both native PostgreSQL and Docker

set -e  # Exit on error

echo "============================================================"
echo "Suzent Memory System Database Setup"
echo "============================================================"
echo ""

# Load .env file if it exists
SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
ENV_FILE="$SCRIPT_DIR/../.env"

if [ -f "$ENV_FILE" ]; then
    echo "✓ Loading configuration from .env file..."
    # Export variables from .env, skipping comments and empty lines
    set -a
    source <(grep -v '^#' "$ENV_FILE" | grep -v '^$')
    set +a
else
    echo "⚠ No .env file found at: $ENV_FILE"
    echo "  Using default values or existing environment variables"
fi

# Get values from environment (set by .env or existing env vars)
DB_USER="${POSTGRES_USER:-suzent}"
DB_PASSWORD="${POSTGRES_PASSWORD:-password}"
DB_NAME="${POSTGRES_DB:-suzent}"
DB_HOST="${POSTGRES_HOST:-localhost}"
DB_PORT="${POSTGRES_PORT:-5430}"

echo ""
echo "Configuration:"
echo "  Host: $DB_HOST"
echo "  Port: $DB_PORT"
echo "  Database: $DB_NAME"
echo "  User: $DB_USER"
echo ""

# Check if Docker is available and if there's a postgres container
USE_DOCKER=false

if command -v docker &> /dev/null; then
    POSTGRES_CONTAINER=$(docker ps --filter "name=postgres" --format "{{.Names}}" 2>/dev/null | head -n 1)
    if [ -n "$POSTGRES_CONTAINER" ]; then
        echo "✓ Found PostgreSQL Docker container: $POSTGRES_CONTAINER"
        USE_DOCKER=true
        DB_HOST="localhost"
    fi
fi

# If not using Docker, check if psql is available
if [ "$USE_DOCKER" = false ]; then
    if ! command -v psql &> /dev/null; then
        echo "❌ PostgreSQL (psql) not found and no Docker container detected!"
        echo ""
        echo "Installation options:"
        echo "  1. Install PostgreSQL:"
        echo "     Ubuntu/Debian: sudo apt install postgresql postgresql-contrib"
        echo "     macOS: brew install postgresql"
        echo "  2. Or use Docker (recommended):"
        echo ""
        echo "     docker run -d --name suzent-postgres \\"
        echo "       -e POSTGRES_USER=$DB_USER \\"
        echo "       -e POSTGRES_PASSWORD=$DB_PASSWORD \\"
        echo "       -e POSTGRES_DB=$DB_NAME \\"
        echo "       -p $DB_PORT:5432 \\"
        echo "       pgvector/pgvector:pg18"
        echo ""
        exit 1
    fi
    
    echo "✓ PostgreSQL client found"
fi

# Check if database exists and create if needed
echo ""
echo "Checking database..."

if [ "$USE_DOCKER" = true ]; then
    # For Docker, use docker exec
    if docker exec "$POSTGRES_CONTAINER" psql -U "$DB_USER" -lqt | cut -d \| -f 1 | grep -qw "$DB_NAME"; then
        echo "✓ Database '$DB_NAME' exists"
    else
        echo "Creating database '$DB_NAME'..."
        docker exec "$POSTGRES_CONTAINER" createdb -U "$DB_USER" "$DB_NAME"
        echo "✓ Database created"
    fi
else
    # Native PostgreSQL
    if PGPASSWORD=$DB_PASSWORD psql -h "$DB_HOST" -p "$DB_PORT" -U "$DB_USER" -lqt | cut -d \| -f 1 | grep -qw "$DB_NAME"; then
        echo "✓ Database '$DB_NAME' exists"
    else
        echo "Creating database '$DB_NAME'..."
        PGPASSWORD=$DB_PASSWORD createdb -h "$DB_HOST" -p "$DB_PORT" -U "$DB_USER" "$DB_NAME"
        echo "✓ Database created"
    fi
fi

# Run schema
SCHEMA_FILE="$SCRIPT_DIR/../src/suzent/memory/schema.sql"

if [ ! -f "$SCHEMA_FILE" ]; then
    echo "❌ Schema file not found: $SCHEMA_FILE"
    echo "Please run this script from the project root directory"
    exit 1
fi

echo ""
echo "Running schema.sql..."

if [ "$USE_DOCKER" = true ]; then
    cat "$SCHEMA_FILE" | docker exec -i "$POSTGRES_CONTAINER" psql -U "$DB_USER" -d "$DB_NAME"
else
    PGPASSWORD=$DB_PASSWORD psql -h "$DB_HOST" -p "$DB_PORT" -U "$DB_USER" -d "$DB_NAME" -f "$SCHEMA_FILE"
fi

if [ $? -eq 0 ]; then
    echo "✓ Schema applied successfully"
else
    echo "⚠ Schema may have been partially applied (some errors occurred)"
fi

# Verify pgvector extension
echo ""
echo "Verifying pgvector extension..."

if [ "$USE_DOCKER" = true ]; then
    VERSION=$(docker exec "$POSTGRES_CONTAINER" psql -U "$DB_USER" -d "$DB_NAME" -tAc "SELECT extversion FROM pg_extension WHERE extname = 'vector';" 2>/dev/null)
else
    VERSION=$(PGPASSWORD=$DB_PASSWORD psql -h "$DB_HOST" -p "$DB_PORT" -U "$DB_USER" -d "$DB_NAME" -tAc "SELECT extversion FROM pg_extension WHERE extname = 'vector';" 2>/dev/null)
fi

if [ -n "$VERSION" ]; then
    echo "✓ pgvector extension version: $VERSION"
    
    # Check if version is below 0.7.0 (basic comparison)
    if [ "$(printf '%s\n' "0.7.0" "$VERSION" | sort -V | head -n1)" = "$VERSION" ] && [ "$VERSION" != "0.7.0" ]; then
        echo "⚠ pgvector version is below 0.7.0 (has 2000 dimension limit for indexes)"
        echo "  Consider upgrading to pgvector 0.7.0+ for >2000 dimension support"
    fi
else
    echo "⚠ Could not verify pgvector version"
fi

echo ""
echo "============================================================"
echo "✓ Memory system database setup complete!"
echo "============================================================"
echo ""
echo "Connection string:"
echo "  postgresql://$DB_USER:****@$DB_HOST:$DB_PORT/$DB_NAME"
echo ""
echo "Environment variables (add to .env):"
echo "  POSTGRES_HOST=$DB_HOST"
echo "  POSTGRES_PORT=$DB_PORT"
echo "  POSTGRES_DB=$DB_NAME"
echo "  POSTGRES_USER=$DB_USER"
echo "  POSTGRES_PASSWORD=your_secure_password"
echo ""
echo "Next steps:"
echo "  1. Ensure Python dependencies are installed: uv sync"
echo "  2. Configure your embedding model in config/default.yaml"
echo "  3. Test the setup: python -m suzent.memory.demo"
echo ""
