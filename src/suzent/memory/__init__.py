"""
Memory system for Suzent - provides long-term memory with automatic extraction.
"""

from .manager import MemoryManager
from .lancedb_store import LanceDBMemoryStore
from .tools import MemorySearchTool, MemoryBlockUpdateTool
from . import memory_context
from .models import (
    Message,
    AgentAction,
    AgentStepsSummary,
    ConversationTurn,
    ConversationContext,
    ExtractedFact,
    MemoryExtractionResult,
    FactExtractionResponse,
)
from .lifecycle import (
    init_memory_system,
    shutdown_memory_system,
    get_memory_manager,
    get_main_event_loop,
    create_memory_tools,
)

__all__ = [
    "MemoryManager",
    "LanceDBMemoryStore",
    "MemorySearchTool",
    "MemoryBlockUpdateTool",
    "memory_context",
    # Lifecycle management
    "init_memory_system",
    "shutdown_memory_system",
    "get_memory_manager",
    "get_main_event_loop",
    "create_memory_tools",
    # Pydantic models
    "Message",
    "AgentAction",
    "AgentStepsSummary",
    "ConversationTurn",
    "ConversationContext",
    "ExtractedFact",
    "MemoryExtractionResult",
    "FactExtractionResponse",
]
