"""
Tool registry module for auto-discovery of tool classes.

This module provides:
- Convention-based discovery of tool classes from suzent/tools/*.py
- Mapping of tool class names to their module paths
- Functions to get tool classes by name and list available tools
"""

import importlib
import pkgutil
from typing import Dict, Type, Optional, List

from smolagents.tools import Tool

from suzent.logger import get_logger

logger = get_logger(__name__)

# Cache for discovered tools: {ClassName: module_name}
_tool_registry: Optional[Dict[str, str]] = None


def _discover_tools() -> Dict[str, str]:
    """
    Discover all Tool subclasses in the suzent.tools package.

    Returns:
        Dict mapping tool class names to their module file names.
    """
    global _tool_registry

    if _tool_registry is not None:
        return _tool_registry

    _tool_registry = {}

    try:
        import suzent.tools as tools_package

        # Iterate over all modules in the tools package
        for importer, modname, ispkg in pkgutil.iter_modules(tools_package.__path__):
            # Skip certain modules that aren't tools
            if modname in ("registry", "path_resolver", "__pycache__"):
                continue

            try:
                module = importlib.import_module(f"suzent.tools.{modname}")

                # Find all Tool subclasses in the module
                for attr_name in dir(module):
                    attr = getattr(module, attr_name)
                    if (
                        isinstance(attr, type)
                        and issubclass(attr, Tool)
                        and attr is not Tool
                        and attr_name.endswith(
                            "Tool"
                        )  # Convention: tool classes end with "Tool"
                    ):
                        _tool_registry[attr_name] = modname
                        logger.debug(f"Discovered tool: {attr_name} in {modname}")

            except Exception as e:
                logger.warning(f"Could not inspect module suzent.tools.{modname}: {e}")

    except Exception as e:
        logger.error(f"Failed to discover tools: {e}")

    logger.info(f"Tool registry initialized with {len(_tool_registry)} tools")
    return _tool_registry


def get_tool_module(tool_name: str) -> Optional[str]:
    """
    Get the module file name for a tool class.

    Args:
        tool_name: The tool class name (e.g., "WebSearchTool")

    Returns:
        The module file name (e.g., "websearch_tool"), or None if not found.
    """
    registry = _discover_tools()
    return registry.get(tool_name)


def get_tool_class(tool_name: str) -> Optional[Type[Tool]]:
    """
    Get a tool class by name.

    Args:
        tool_name: The tool class name (e.g., "WebSearchTool")

    Returns:
        The tool class, or None if not found.
    """
    module_name = get_tool_module(tool_name)
    if not module_name:
        return None

    try:
        module = importlib.import_module(f"suzent.tools.{module_name}")
        return getattr(module, tool_name, None)
    except (ImportError, AttributeError) as e:
        logger.error(f"Could not load tool {tool_name}: {e}")
        return None


def list_available_tools() -> List[str]:
    """
    List all available tool class names.

    Returns:
        List of tool class names.
    """
    registry = _discover_tools()
    return list(registry.keys())


def get_tool_registry() -> Dict[str, str]:
    """
    Get the full tool registry mapping.

    Returns:
        Dict mapping tool class names to module file names.
    """
    return _discover_tools().copy()
