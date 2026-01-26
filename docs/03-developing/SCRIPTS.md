# Utility Scripts

This directory contains automation scripts for the Suzent project.

## Development

### `start-tauri-dev`
Starts the full development environment (Python backend + Tauri frontend).

- **Windows**: `scripts\start-tauri-dev.ps1`
- **Linux/macOS**: `scripts/start-tauri-dev.sh`

## Build

### `build_backend.py`
Compiles the Python backend into a standalone executable using Nuitka.

```bash
python scripts/build_backend.py
```

### `build_tauri`
Builds the complete desktop application (frontend + backend bundle).

- **Windows**: `scripts\build_tauri.ps1`
- **Linux/macOS**: `scripts/build_tauri.sh`

## Maintenance

### `bump_version.py`
Updates version numbers across `pyproject.toml`, `package.json`, and Cargo files.

```bash
python scripts/bump_version.py [major|minor|patch]
```

### `fix_timestamps.py`
Utility to fix file timestamps (if needed for build reproducibility).
