"""
Agent serialization module for persisting and restoring agent state.

This module handles:
- Serializing agent state to bytes for storage
- Deserializing and restoring agent state from bytes
- Sanitizing agent memory to remove non-serializable objects
"""

import pickle
from typing import Optional, Dict, Any

from smolagents import CodeAgent

from suzent.logger import get_logger

logger = get_logger(__name__)


def _sanitize_memory(memory):
    """
    Sanitize agent memory to remove non-serializable objects like AgentError.
    AgentError contains a logger which can't be pickled, and its signature may change
    between library versions causing unpickling to fail.

    Args:
        memory: Agent memory (list of message dicts or other structure).

    Returns:
        Sanitized memory safe for pickling.
    """
    from smolagents.memory import ActionStep

    # First pass: clear all error fields from ActionStep objects IN-PLACE
    # This must be done before any copy attempts
    errors_cleared = 0

    def clear_errors(value):
        """Clear error fields from ActionStep objects."""
        nonlocal errors_cleared
        if isinstance(value, ActionStep):
            if hasattr(value, "error") and value.error is not None:
                logger.debug(
                    f"Clearing error from ActionStep: {type(value.error).__name__}"
                )
                value.error = None
                errors_cleared += 1
        elif isinstance(value, list):
            for item in value:
                clear_errors(item)
        elif isinstance(value, dict):
            for v in value.values():
                clear_errors(v)
        elif hasattr(value, "steps"):  # Memory object with steps attribute
            logger.debug(f"Sanitizing Memory object with {len(value.steps)} steps")
            clear_errors(value.steps)

    try:
        # Clear errors in-place first (safe because errors are not needed for restoration)
        clear_errors(memory)

        if errors_cleared > 0:
            logger.debug(
                f"Cleared {errors_cleared} AgentError objects from memory before serialization"
            )

        # Now return the cleaned memory
        return memory

    except Exception as e:
        logger.error(f"Error sanitizing memory: {e}")
        # Return empty memory rather than risk corrupt state
        return []


def serialize_agent(agent: CodeAgent) -> Optional[bytes]:
    """
    Serialize an agent and its complete state to bytes.
    This preserves all memory, configuration, and internal state.

    Args:
        agent: The agent instance to serialize.

    Returns:
        Serialized agent state as bytes, or None if serialization fails.
    """
    try:
        # Extract only the serializable parts we need
        tool_attr = getattr(agent, "_tool_instances", None)
        if tool_attr is None:
            raw_tools = getattr(agent, "tools", None)
            if isinstance(raw_tools, dict):
                tool_iterable = raw_tools.values()
            elif isinstance(raw_tools, (list, tuple)):
                tool_iterable = raw_tools
            elif raw_tools is None:
                tool_iterable = []
            else:
                tool_iterable = [raw_tools]
        else:
            tool_iterable = tool_attr

        tool_names = []
        for tool in tool_iterable:
            try:
                name = tool.__class__.__name__
            except AttributeError:
                continue
            if name not in tool_names:
                tool_names.append(name)

        # Sanitize memory to remove AgentError objects that can't be pickled
        logger.debug(
            f"Sanitizing memory before serialization (type: {type(agent.memory)})"
        )
        sanitized_memory = _sanitize_memory(agent.memory)
        logger.debug("Memory sanitization complete")

        serializable_state = {
            "memory": sanitized_memory,
            "model_id": getattr(agent.model, "model_id", None)
            if hasattr(agent, "model")
            else None,
            "instructions": getattr(agent, "instructions", None),
            "step_number": getattr(agent, "step_number", 1),
            "max_steps": getattr(agent, "max_steps", 10),
            # Store tool names/types instead of tool instances
            "tool_names": tool_names,
            # Store managed agent info if any
            "managed_agents": getattr(agent, "managed_agents", []),
        }

        # Serialize to bytes
        return pickle.dumps(serializable_state)
    except Exception as e:
        logger.error(f"Error serializing agent: {e}")
        return None


def deserialize_agent(
    agent_data: bytes, config: Dict[str, Any], create_agent_fn
) -> Optional[CodeAgent]:
    """
    Deserialize agent state and restore it to a new agent instance.

    Args:
        agent_data: Serialized agent state as bytes.
        config: Configuration dictionary for creating the agent.
        create_agent_fn: Function to create a new agent (to avoid circular imports).

    Returns:
        Restored agent instance, or None if deserialization fails.
    """
    if not agent_data:
        return None

    try:
        # Try to deserialize the state
        try:
            # Use standard pickle first
            state = pickle.loads(agent_data)
        except (TypeError, AttributeError, pickle.UnpicklingError) as unpickle_error:
            import traceback

            logger.error(f"Failed to unpickle agent state: {unpickle_error}")
            logger.debug(f"Unpickling traceback:\n{traceback.format_exc()}")

            error_msg = str(unpickle_error)
            if "AgentError" in error_msg or "logger" in error_msg:
                logger.info(
                    "Agent state contains incompatible AgentError, will be cleared"
                )
            else:
                logger.warning(f"Unpickling failed for unknown reason: {error_msg}")
            return None

        # Log what we got to help debug
        logger.debug(f"Unpickled state type: {type(state)}")
        if isinstance(state, dict):
            logger.debug(f"State dict keys: {list(state.keys())}")
        else:
            logger.warning(
                f"Agent state is not a dict (type: {type(state).__name__}), expected old format with dict. Creating fresh agent."
            )
            return None

        # Create a new agent with the config that was passed in
        # This allows config changes (tool changes, model changes) to take effect
        # We only restore memory, not the configuration
        agent = create_agent_fn(config)

        # Restore the memory and state
        if "memory" in state:
            agent.memory = state["memory"]

        # Restore other important state
        if "step_number" in state:
            agent.step_number = state["step_number"]
        if "max_steps" in state:
            agent.max_steps = state["max_steps"]

        return agent

    except Exception as e:
        logger.warning(
            f"Error deserializing agent state: {e}. Starting with fresh agent."
        )
        return None
