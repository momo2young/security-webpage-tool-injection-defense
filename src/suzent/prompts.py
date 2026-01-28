"""
Prompt formatting utilities for Suzent agents.

Provides functions to format and enhance agent instructions with dynamic context.
"""

from datetime import datetime

SUZENT_AGENT_INSTRUCTIONS = """# Role
You are Suzent, a digital coworker.

# Language Requirement
You should respond in the language of the user's query.

# Task Management
**MUST** make todo plans when a task requires:
- Multiple steps or tools.
- Information synthesis from several sources.
- Breaking down an ambiguous goal into action items.

# Date Context
Today's date: {current_date}

{custom_volumes_section}

{base_instructions_section}

{memory_context}
"""

CUSTOM_VOLUMES_SECTION = """# Custom Volumes
The following custom volumes are mounted and available:
{volumes_list}
"""

BASE_INSTRUCTIONS_SECTION = """# Base Instructions
{base_instructions}
"""


def format_instructions(
    base_instructions: str, memory_context: str = "", custom_volumes: list[str] = None
) -> str:
    """
    Format agent instructions by adding current date, custom volumes, and other dynamic context.

    Args:
        base_instructions: The base instruction text
        memory_context: Context string from memory system
        custom_volumes: List of custom volume mount strings

    Returns:
        Formatted instructions with date and volumes appended
    """
    current_date = datetime.now().strftime("%A, %B %d, %Y")

    volumes_section = ""
    if custom_volumes:
        volumes_list = "\n".join([f"- {v}" for v in custom_volumes])
        volumes_section = CUSTOM_VOLUMES_SECTION.format(volumes_list=volumes_list)

    base_instructions_section = ""
    if base_instructions:
        base_instructions_section = BASE_INSTRUCTIONS_SECTION.format(
            base_instructions=base_instructions
        )

    suzent_instructions = SUZENT_AGENT_INSTRUCTIONS.format(
        current_date=current_date,
        custom_volumes_section=volumes_section,
        base_instructions_section=base_instructions_section,
        memory_context=memory_context,
    )
    return suzent_instructions
