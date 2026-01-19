# Filesystem

The filesystem module provides secure file access for agents through a virtual filesystem that isolates each chat session's data.

## Virtual Filesystem

Agents access files through virtual paths that map to isolated storage locations:

| Virtual Path | Maps To | Purpose |
|-------------|---------|---------|
| `/persistence` | `data/sandbox-data/sessions/{chat_id}/` | Per-chat storage |
| `/shared` | `data/sandbox-data/shared/` | Shared across all chats |
| `/uploads` | `data/sandbox-data/sessions/{chat_id}/uploads/` | Uploaded files |

**Relative paths** default to `/persistence`:
- `data.csv` → `/persistence/data.csv`

**Custom mounts** let you access host directories:

```yaml
# config/default.yaml
sandbox_volumes:
  - "D:/datasets:/data"
```

Now `/data/file.csv` maps to `D:/datasets/file.csv` on your host.

## File Tools

### ReadFileTool

Read files with automatic format conversion.

```python
ReadFileTool(file_path="/persistence/data.csv")
ReadFileTool(file_path="report.pdf", offset=10, limit=50)
```

**Supports:** Text files, PDFs, DOCX, XLSX, images (with OCR)

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

## Examples

### Basic Operations

```python
# Write and read
WriteFileTool(file_path="/persistence/data.json", content='{"x": 1}')
ReadFileTool(file_path="/persistence/data.json")

# Edit
EditFileTool(
    file_path="/persistence/data.json",
    old_string='"x": 1',
    new_string='"x": 2'
)
```

### Using Custom Mounts

```python
# Read from host directory
ReadFileTool(file_path="/data/dataset.csv")

# Save results back to host
WriteFileTool(file_path="/data/output.csv", content=results)
```

### Search and Discovery

```python
# Find all Python files
GlobTool(pattern="**/*.py")

# Search for specific code
GrepTool(pattern="def process", include="*.py")
```

## Security

All paths are validated to prevent directory traversal:

- ✅ `/persistence/data.csv`
- ✅ `/shared/model.pt`
- ✅ `/data/file.txt` (if mounted)
- ❌ `/etc/passwd`
- ❌ `../../../secret`

## Troubleshooting

**File not found:** Check the file exists in `data/sandbox-data/sessions/{chat_id}/`

**Path traversal error:** Paths must be within `/persistence`, `/shared`, or custom mounts

**Custom volume not accessible:** Verify `sandbox_volumes` in config and Docker volume mapping

## Related

- [Sandbox Module](sandbox.md) - Secure code execution
- [Tools Overview](tools/tools.md) - All available tools
