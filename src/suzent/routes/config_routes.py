"""
Configuration-related API routes.

This module handles configuration endpoints that provide
frontend-consumable application settings.
"""

from starlette.requests import Request
from starlette.responses import JSONResponse

from suzent.config import CONFIG


async def get_config(request: Request) -> JSONResponse:
    """
    Return frontend-consumable configuration derived from Config class.
    
    Returns:
        JSONResponse with application configuration including:
        - title: Application title
        - models: Available model options
        - agents: Available agent types
        - tools: Available tool options
        - defaultTools: Default tools to enable
        - codeTag: Code tag identifier
    """
    data = {
        "title": CONFIG.title,
        "models": CONFIG.model_options,
        "agents": CONFIG.agent_options,
        "tools": CONFIG.tool_options,
        "defaultTools": CONFIG.default_tools,
        "codeTag": CONFIG.code_tag,
        "userId": CONFIG.user_id,
    }
    return JSONResponse(data)
