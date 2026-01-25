# Tauri Icons

This directory should contain application icons in the following formats:

- `32x32.png` - 32x32 pixels
- `128x128.png` - 128x128 pixels
- `128x128@2x.png` - 256x256 pixels (2x retina)
- `icon.icns` - macOS icon file
- `icon.ico` - Windows icon file

You can generate these from a single source image using:
```bash
npx @tauri-apps/cli icon path/to/source-icon.png
```

For now, the build will work without icons but will use default Tauri icons.
