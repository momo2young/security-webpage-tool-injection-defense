"""
API routes for skill management.
"""

from typing import List, Dict, Any
from starlette.responses import JSONResponse
from suzent.skills import get_skill_manager
from suzent.tools.path_resolver import PathResolver

async def get_skills(request):
    """
    Get list of available skills with metadata.
    """
    manager = get_skill_manager()
    skills = manager.loader.list_skills()

    response_data = [
        {
            "name": skill.metadata.name,
            "description": skill.metadata.description,
            "path": PathResolver.get_skill_virtual_path(skill.metadata.name)
        }
        for skill in skills
    ]

    return JSONResponse(response_data)

async def reload_skills(request):
    """
    Force reload of all skills from disk.
    """
    manager = get_skill_manager()
    manager.reload()
    
    # Return updated list
    return await get_skills(request)
