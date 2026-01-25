# Quick Start Guide

Get SUZENT running in development mode in under 2 minutes.

## Two Development Modes

| Mode | What opens | Rust required |
|------|------------|---------------|
| Desktop app | Native window | Yes |
| Browser | Web browser tab | No |

## Desktop App Mode

Requires Rust. Opens a native desktop window.

**Terminal 1** - Start backend:
```bash
python src/suzent/server.py
```

**Terminal 2** - Start Tauri:
```bash
cd src-tauri
npm run dev
```

A desktop window will open automatically.

## Browser Mode

No Rust needed. Opens in your web browser.

**Terminal 1** - Start backend:
```bash
python src/suzent/server.py
```

**Terminal 2** - Start frontend:
```bash
cd frontend
npm run dev
```

Open http://localhost:5173 in your browser.

## Quick Reference

```
Desktop App Mode:
  Terminal 1: python src/suzent/server.py
  Terminal 2: cd src-tauri && npm run dev

Browser Mode:
  Terminal 1: python src/suzent/server.py
  Terminal 2: cd frontend && npm run dev
```

## Troubleshooting

**"cargo: command not found"**

Install Rust first:
```bash
# Windows
winget install --id Rustlang.Rustup

# Or download from https://rustup.rs/
```
Restart your terminal after installation.

**Backend connection errors**

Verify the backend is running:
```bash
curl http://localhost:8000/api/config
```
Should return JSON, not an error.

**App opened in browser instead of desktop window**

You ran `cd frontend && npm run dev` instead of `cd src-tauri && npm run dev`.

---

For detailed information, see [DEV_GUIDE.md](./DEV_GUIDE.md).
