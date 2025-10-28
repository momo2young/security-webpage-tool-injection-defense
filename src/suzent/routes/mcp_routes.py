"""
MCP server management API routes.
"""

from starlette.requests import Request
from starlette.responses import JSONResponse
from suzent.config import Config

# In-memory store for MCP servers (replace with persistent storage as needed)
MCP_SERVERS = {
    "urls": dict(Config.MCP_URLS),
    "stdio": dict(Config.MCP_STDIO_PARAMS),
    "enabled": {k: True for k in Config.MCP_URLS.keys()}
}

async def list_mcp_servers(request: Request) -> JSONResponse:
    """
    List all MCP servers (URLs and stdio params).
    """
    return JSONResponse({
        "urls": MCP_SERVERS["urls"],
        "stdio": MCP_SERVERS["stdio"],
        "enabled": MCP_SERVERS["enabled"]
    })

async def add_mcp_server(request: Request) -> JSONResponse:
    """
    Add a new MCP server (URL or stdio).
    Body: {"name": str, "url": str} or {"name": str, "stdio": dict}
    """
    data = await request.json()
    name = data.get("name")
    url = data.get("url")
    stdio = data.get("stdio")
    if not name or (not url and not stdio):
        return JSONResponse({"error": "Missing name and url/stdio"}, status_code=400)
    if url:
        MCP_SERVERS["urls"][name] = url
        MCP_SERVERS["enabled"][name] = True
    elif stdio:
        MCP_SERVERS["stdio"][name] = stdio
        MCP_SERVERS["enabled"][name] = True
    return JSONResponse({"success": True})

async def remove_mcp_server(request: Request) -> JSONResponse:
    """
    Remove an MCP server by name (URL or stdio).
    Body: {"name": str}
    """
    data = await request.json()
    name = data.get("name")
    found = False
    if name in MCP_SERVERS["urls"]:
        MCP_SERVERS["urls"].pop(name)
        found = True
    if name in MCP_SERVERS["stdio"]:
        MCP_SERVERS["stdio"].pop(name)
        found = True
    MCP_SERVERS["enabled"].pop(name, None)
    if found:
        return JSONResponse({"success": True})
    return JSONResponse({"error": "Not found"}, status_code=404)

async def set_mcp_server_enabled(request: Request) -> JSONResponse:
    """
    Enable or disable an MCP server (URL or stdio).
    Body: {"name": str, "enabled": bool}
    """
    data = await request.json()
    name = data.get("name")
    enabled = data.get("enabled")
    if (name in MCP_SERVERS["urls"] or name in MCP_SERVERS["stdio"]) and isinstance(enabled, bool):
        MCP_SERVERS["enabled"][name] = enabled
        return JSONResponse({"success": True})
    return JSONResponse({"error": "Invalid request"}, status_code=400)
