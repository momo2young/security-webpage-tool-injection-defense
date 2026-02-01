# Suzent Changelog

## v0.2.0

### New Feature: Social Messaging
Suzent now supports full integration with major social platforms!
- **Telegram, Slack, Discord, Feishu (Lark) Support**: Chat with your agent directly in your favorite apps.
- **Smart Routing**: The agent respects context—replying inside Threads, Channels, or Groups automatically.
- **Multi-Modal**: Send text and files/images to the agent.
- **Access Control**: Configure allowed users via `social.json`.

### Improvements
- **Configuration**: Unified credentials management in `config/social.json`.
- **Core**: Enhanced driver stability for connection handling (Socket Mode for Slack, Polling for others).

### Fix
- fix: "Reply in DM" routing bug.
- fix: Privacy mode documentation for Telegram.
- fix: Linting and formatting improvements.

## v0.1.4

### New
- new: bash tool support in host mode
- UI: add open in file explorer in file view

### Update
- update: inject selected context folder to system prompt

### Fix
- fix: upgrade workflow
- fix: markdown code block rendering
- fix: macos path not found
- fix: optimize path resolver logic for sandbox/host mode

## v0.1.3

### Packaging
- exclude heavy unused modules to prevent C compiler heap exhaustion
- release executable.

## v0.1.2

### Desktop App
- desktop app releases
- UI: add API Models/Keys configuration
- UI: add memory configuration
- UI: add context selector in chat box
- UI/backend: allow unified file uploads


### Breaking
- browser mode deprecated

### Packaging
- add distribution packages
- add one-click scripts for Windows, Mac, Linux

