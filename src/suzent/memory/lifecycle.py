"""
Memory system lifecycle management.

This module handles the initialization, shutdown, and global state
for the memory system. The actual memory implementation (MemoryManager,
LanceDBMemoryStore, tools, models) lives in the other files in this package.
"""

import asyncio

from suzent.config import CONFIG
from suzent.logger import get_logger

logger = get_logger(__name__)

# --- Memory System State ---
memory_manager = None
memory_store = None
main_event_loop = None  # Store reference to main event loop for async operations


async def init_memory_system() -> bool:
    """
    Initialize the memory system if enabled in configuration.

    Returns:
        True if memory system initialized successfully, False otherwise.
    """
    global memory_manager, memory_store, main_event_loop

    # Store reference to main event loop
    main_event_loop = asyncio.get_running_loop()

    if not CONFIG.memory_enabled:
        logger.info("Memory system disabled in configuration")
        return False

    try:
        # Import memory modules (local imports to avoid circular deps)
        from suzent.memory import MemoryManager, LanceDBMemoryStore

        # Initialize LanceDB store
        memory_store = LanceDBMemoryStore(
            CONFIG.lancedb_uri, embedding_dim=CONFIG.embedding_dimension
        )
        await memory_store.connect()

        # Initialize memory manager
        memory_manager = MemoryManager(
            store=memory_store,
            embedding_model=CONFIG.embedding_model,
            embedding_dimension=CONFIG.embedding_dimension,
            llm_for_extraction=CONFIG.extraction_model,
        )

        logger.info(
            f"Memory system initialized successfully (extraction: {'LLM' if CONFIG.extraction_model else 'heuristic'})"
        )

        # Add memory tools to CONFIG.tool_options so they appear in frontend
        if "MemorySearchTool" not in CONFIG.tool_options:
            CONFIG.tool_options.extend(["MemorySearchTool", "MemoryBlockUpdateTool"])
            logger.info("Added memory tools to config")

        return True

    except Exception as e:
        logger.error(f"Failed to initialize memory system: {e}")
        memory_manager = None
        memory_store = None
        return False


async def shutdown_memory_system():
    """Shutdown memory system and close connections."""
    global memory_store

    if memory_store:
        try:
            await memory_store.close()
            logger.info("Memory system shutdown complete")
        except Exception as e:
            logger.error(f"Error shutting down memory system: {e}")


def get_memory_manager():
    """
    Get the global memory manager instance.

    Returns:
        MemoryManager instance or None if not initialized.
    """
    return memory_manager


def get_main_event_loop():
    """
    Get the main event loop reference.

    Returns:
        The main event loop or None if not initialized.
    """
    return main_event_loop


def create_memory_tools() -> list:
    """
    Create memory tool instances.

    Returns:
        List of memory tool instances, or empty list if memory not initialized.
    """
    if memory_manager is None:
        logger.warning("Memory system not initialized, skipping memory tools")
        return []

    try:
        from suzent.memory import MemorySearchTool, MemoryBlockUpdateTool

        tools = []

        # Create MemorySearchTool
        search_tool = MemorySearchTool(memory_manager)
        search_tool._main_loop = main_event_loop
        tools.append(search_tool)

        # Create MemoryBlockUpdateTool
        update_tool = MemoryBlockUpdateTool(memory_manager)
        update_tool._main_loop = main_event_loop
        tools.append(update_tool)

        logger.info("Memory tools equipped")
        return tools

    except Exception as e:
        logger.error(f"Failed to create memory tools: {e}")
        return []
