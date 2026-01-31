# Social Messaging Integration

Suzent supports integration with social messaging platforms, allowing you to control the agent remotely, share files, and maintain long-running conversations with persistent memory.

## Supported Platforms

-   **Telegram**: Full support for text, photos, and files.
-   **(Planned) Discord, Slack, WhatsApp, Feishu**: Architecture supports adding drivers.

## Configuration

You can configure social channels using `config/social.json` or Environment Variables.

### 1. `config/social.json` (Recommended)

Create a file at `config/social.json` in your workspace root. You can copy `config/social.example.json` as a starting point.

```json
{
  "allowed_users": ["GLOBAL_ADMIN_ID"],
  "telegram": {
    "enabled": true,
    "token": "YOUR_TELEGRAM_BOT_TOKEN",
    "allowed_users": ["TELEGRAM_USER_ID"]
  },
  "discord": {
    "enabled": false,
    "token": "",
    "allowed_users": []
  }
}
```

-   **Global `allowed_users`**: List of user IDs authorized to access the bot from *any* platform.
-   **Platform `allowed_users`**: List of user IDs authorized *only* for that specific platform.

### 2. Environment Variables

-   `TELEGRAM_TOKEN`: Your Telegram Bot API Token.
-   `ALLOWED_SOCIAL_USERS`: Comma-separated list of allowed User IDs (Global).

*Note: `config/social.json` settings are merged with environment variables.*

## Features

### 1. Access Control
By default, the bot is restricted. You must explicitly add your User ID (e.g., your Telegram ID) to the `allowed_users` list. Messages from unauthorized users are rejected with an "Access Denied" message.

### 2. Persistent Memory
Conversations on social platforms are treated as persistent sessions. Suzent creates a specific chat session (e.g., `social-telegram-12345`) and stores:
-   Conversation history.
-   Agent state (working memory).
-   Long-term memories (extracted facts stored in vector database).

You can stop the server and restart it, and Suzent will remember the context of your conversation.

### 3. File & Image Handling
You can send files and images to Suzent via social chats.

-   **Images**: Automatically processed by the agent's vision capabilities (if the LLM supports it).
-   **Files**: Downloaded to the agent's **Sandbox** at `/persistence/uploads/`.
    -   The agent is informed of the file's location.
    -   The agent can read, analyze, or modify these files using standard tools (`ReadFile`, `Bash`).

### 4. Sandbox Integration
Social chats share the same Sandbox environment as the web UI. You can ask Suzent to:
-   "Create a file named report.md" -> It will be created in the workspace.
-   "List files in uploads" -> It will show files you uploaded via Telegram.

## Architecture

The system uses a driver-based architecture:
1.  **ChannelManager**: Central hub that manages platform drivers.
2.  **SocialChannel (Driver)**: Platform-specific implementation (e.g., `TelegramChannel`). Handles API polling and format conversion.
3.  **UnifiedMessage**: comprehensive internal message format.
4.  **SocialBrain**: Core logic that bridges the social message queue to the AI Agent. Handles:
    -   Security checks.
    -   Attachment processing (downloading to sandbox).
    -   Agent instantiation (`get_or_create_agent`).
    -   Response streaming.
