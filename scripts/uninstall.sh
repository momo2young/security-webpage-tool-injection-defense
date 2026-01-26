#!/bin/bash

SHIM_PATH="$HOME/.local/bin/suzent"

if [ -f "$SHIM_PATH" ]; then
    echo -e "\033[0;33mRemoving '$SHIM_PATH'...\033[0m"
    rm "$SHIM_PATH"
    echo -e "\033[0;32m✅ Removed 'suzent' command\033[0m"
else
    echo -e "\033[0;36mℹ️ 'suzent' command not found at $SHIM_PATH\033[0m"
fi

echo ""
echo "To completely remove the project, delete this directory:"
echo "  $(pwd)"
