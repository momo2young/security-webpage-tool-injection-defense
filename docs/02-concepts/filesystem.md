# Filesystem & Execution

Suzent provides secure file access and code execution through two modes: **Sandbox Mode** (isolated MicroVM) and **Host Mode** (direct execution with restrictions).

## Execution Modes

| Mode | BashTool | File Tools | Path Style |
|------|----------|------------|------------|
| **Sandbox** | Runs in MicroVM | Virtual filesystem | `/persistence`, `/shared`, `/mnt/*` |
| **Host** | Runs on host | Host filesystem | `$PERSISTENCE_PATH`, `$SHARED_PATH`, `$MOUNT_*` |

Toggle sandbox in the chat settings when creating a conversation.

---

## Virtual Filesystem (Both Modes)

| Virtual Path | Maps To | Purpose |
|-------------|---------|---------|
| `/persistence` | `.suzent/sandbox/sessions/{chat_id}/` | Per-chat storage |
| `/shared` | `.suzent/sandbox/shared/` | Shared across all chats |
| `/uploads` | `.suzent/sandbox/sessions/{chat_id}/uploads/` | Uploaded files |
| `/mnt/*` | Custom volumes | Host directories |

**Relative paths** default to `/persistence`: `data.csv` → `/persistence/data.csv`

### Custom Volume Mounts

```yaml
# config/default.yaml
sandbox_volumes:
  - "D:/datasets:/data"
  - "D:/skills:/mnt/skills"
```

Now `/data/file.csv` maps to `D:/datasets/file.csv` on your host.

---

## Sandbox Mode

Uses **Microsandbox** (Firecracker MicroVMs) for isolated execution.

### Features
- **Isolation**: Each session runs in its own MicroVM
- **Auto-Healing**: Automatically restarts crashed sessions
- **Multi-language**: Python, Node.js, shell commands

### Setup

1. **Docker**: Required to run `microsandbox` service
2. **Configure** `docker/sandbox-compose.yml`:

```yaml
services:
  microsandbox:
    image: microsandbox/microsandbox:latest
    privileged: true
    volumes:
      - microsandbox-data:/root/.local/share/microsandbox
      - ..:/workspace
      # Windows: Map for custom volumes
      - C:/Users:/mnt/c/Users
```

3. **Configure** `config/default.yaml`:

```yaml
sandbox_enabled: true
sandbox_server_url: "http://localhost:7263"
```

---

## Host Mode

Executes directly on the host machine with path restrictions.

### Environment Variables

In host mode, use these environment variables in bash commands:

| Variable | Points To |
|----------|-----------|
| `$PERSISTENCE_PATH` | Session directory (same as `pwd`) |
| `$SHARED_PATH` | Shared directory |
| `$MOUNT_SKILLS` | Skills directory |
| `$MOUNT_*` | Other mounted volumes |

### Security

- Working directory (`pwd`) is the session's persistence folder
- Only paths within `.suzent/`, `/persistence`, `/shared`, and custom mounts are allowed
- Source code directories are **blocked** by default

---

## File Tools

### ReadFileTool
Read files with automatic format conversion (text, PDF, DOCX, XLSX, images with OCR).

```python
ReadFileTool(file_path="/persistence/data.csv")
ReadFileTool(file_path="report.pdf", offset=10, limit=50)
```

### WriteFileTool
Create or overwrite files.

```python
WriteFileTool(file_path="/persistence/output.txt", content="Hello")
```

> [!WARNING]
> Overwrites entire file. Use `EditFileTool` for small changes.

### EditFileTool
Make precise text replacements.

```python
EditFileTool(
    file_path="config.json",
    old_string='"debug": false',
    new_string='"debug": true'
)
```

### GlobTool
Find files by pattern.

```python
GlobTool(pattern="**/*.py")  # All Python files
GlobTool(pattern="*.csv", path="/data")  # CSVs in /data
```

### GrepTool
Search file contents.

```python
GrepTool(pattern="def.*:", path="/persistence")  # Find functions
GrepTool(pattern="TODO", include="*.py")  # TODOs in Python files
```

---

## Security

All paths are validated to prevent directory traversal:

- ✅ `/persistence/data.csv`
- ✅ `/shared/model.pt`
- ✅ `/data/file.txt` (if mounted)
- ❌ `/etc/passwd`
- ❌ `../../../secret`
- ❌ Project source code (in host mode)

---

## Troubleshooting

| Issue | Solution |
|-------|----------|
| **File not found** | Check `.suzent/sandbox/sessions/{chat_id}/` |
| **Path traversal error** | Ensure path is within allowed directories |
| **Volume not accessible** | Verify `sandbox_volumes` in config |
| **Timeout/ConnectionRefused** | Check `sandbox_server_url` and Docker status |
| **WSL issues** | Use WSL IP instead of `localhost` |
