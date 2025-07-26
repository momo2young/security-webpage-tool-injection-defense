"""
This module provides a unified tool for creating and managing a plan in a TODO.md file.

The tool is inspired by the smolagents style, providing a single class to interact
with the plan. It supports creating a plan, checking its status, and updating steps.
"""

import re
from pathlib import Path
from typing import Optional

from smolagents.tools import Tool

TODO_FILE = Path("TODO.md")

STATUS_MAP = {
    "pending": " ",
    "in_progress": ">",
    "completed": "x",
    "failed": "!",
}
REVERSE_STATUS_MAP = {v: k for k, v in STATUS_MAP.items()}


class PlanningTool(Tool):
    """
    A tool for managing a project plan in a TODO.md file.
    """
    description: str = "A tool for managing a project plan in a TODO.md file."
    name: str = "PlanningTool"
    is_initialized: bool = False
    def __init__(self):
        pass
    inputs: dict[str, dict[str, str | type | bool]] = {
        "action": {"type": "string", "description": "The operation to perform. Must be one of 'create_plan', 'status', 'update_plan', or 'mark_step'."},
        "objective": {"type": "string", "description": "The high-level objective for the plan. Required for the 'create_plan' action.", "nullable": True},
        "action_items": {"type": "array", "description": "A list of action items for the plan. Required for the 'create_plan' action.", "nullable": True},
        "overwrite_plan_items": {"type": "array", "description": "A list of action items to overwrite the current plan. Required for the 'update_plan' action.", "nullable": True},
        "step_number": {"type": "integer", "description": "The number of the step to mark. Required for the 'mark_step' action.", "nullable": True},
        "status": {"type": "string", "description": "The new status for the step. Required for the 'mark_step' action. Valid statuses are: pending, in_progress, completed, failed.", "nullable": True},
        "step_note": {"type": "string", "description": "A note to add or update for the step.", "nullable": True},
    }
    output_type: str = "string"

    def forward(
        self,
        action: str,
        objective: Optional[str] = None,
        action_items: Optional[list[str]] = None,
        overwrite_plan_items: Optional[list[str]] = None,
        step_number: Optional[int] = None,
        status: Optional[str] = None,
        step_note: Optional[str] = None,
    ) -> str:
        """
        Manages a project plan in a TODO.md file.

        Args:
            action: The operation to perform. Must be one of 'create_plan', 'status', 'update_plan', or 'mark_step'.
            objective: The high-level objective for the plan. Required for the 'create_plan' action.
            action_items: A list of action items for the plan. Required for the 'create_plan' action.
            overwrite_plan_items: A list of action items to overwrite the current plan. Required for the 'update_plan' action.
            step_number: The number of the step to mark. Required for the 'mark_step' action.
            status: The new status for the step. Required for the 'mark_step' action. Valid statuses are: pending, in_progress, completed, failed.
            step_note: A note to add or update for the step.

        Returns:
            A string indicating the result of the action.
        """
        if action == "create_plan":
            if not objective or not action_items:
                return "Error: 'objective' and 'action_items' are required for the 'create_plan' action."
            return self._initialize_plan(objective, action_items)
        elif action == "status":
            return self._get_plan_status()
        elif action == "update_plan":
            if not overwrite_plan_items:
                return "Error: 'overwrite_plan_items' is required for the 'update_plan' action."
            return self._overwrite_plan(overwrite_plan_items)
        elif action == "mark_step":
            if not step_number or not status:
                return "Error: 'step_number' and 'status' are required for the 'mark_step' action."
            return self._mark_step_status(step_number, status, step_note)
        else:
            return "Error: Invalid action. Must be one of 'create_plan', 'status', 'update_plan', or 'mark_step'."

    def _initialize_plan(self, objective: str, action_items: list[str]) -> str:
        """Creates a TODO.md file with a plan to achieve the objective and provided action items."""
        with open(TODO_FILE, "w") as f:
            f.write(f"# Plan for: {objective}\n\n")
            for i, step in enumerate(action_items):
                f.write(f"- [ ] {i+1}. {step}\n")
        
        return f"Successfully created plan for Objective: {objective}\nAction Items:\n" + "\n".join([f"- {item}" for item in action_items])

    def _get_plan_status(self) -> str:
        """Reads and parses the TODO.md file to return a status string."""
        if not TODO_FILE.exists():
            return "No plan found. Please create a plan first using the 'create_plan' action."
        
        with open(TODO_FILE, "r") as f:
            content = f.read()

        objective_match = re.match(r"# Plan for: (.*)\n", content)
        objective = objective_match.group(1).strip() if objective_match else "Unknown Objective"

        tasks = []
        for match in re.finditer(r"- \[(.)\] (\d+)\. (.*)", content):
            status_char = match.group(1)
            status = REVERSE_STATUS_MAP.get(status_char, "unknown")
            tasks.append(f"Step {match.group(2)}: {match.group(3).strip()} - **{status.upper()}**")

        if not tasks:
            return "The plan is empty or in an invalid format."

        return f"Current Plan for Objective: {objective}\n" + "\n".join(tasks)

    def _overwrite_plan(self, overwrite_plan_items: list[str]) -> str:
        """Overwrites the current plan in TODO.md with new action items."""
        if not TODO_FILE.exists():
            return "No plan found to update. Please create a plan first."

        # Preserve the objective if it exists
        objective = "Unknown Objective"
        with open(TODO_FILE, "r") as f:
            content = f.read()
            objective_match = re.match(r"# Plan for: (.*)\n", content)
            if objective_match:
                objective = objective_match.group(1).strip()

        with open(TODO_FILE, "w") as f:
            f.write(f"# Plan for: {objective}\n\n")
            for i, step in enumerate(overwrite_plan_items):
                f.write(f"- [ ] {i+1}. {step}\n")
        
        return f"Successfully updated plan in {TODO_FILE}"

    def _mark_step_status(self, step_number: int, status: str, step_note: Optional[str] = None) -> str:
        """Marks a step in the TODO.md file with a new status."""
        if status not in STATUS_MAP:
            return f"Invalid status. Valid statuses are: {list(STATUS_MAP.keys())}"

        if not TODO_FILE.exists():
            return "TODO.md file not found."

        with open(TODO_FILE, "r") as f:
            lines = f.readlines()

        updated = False
        for i, line in enumerate(lines):
            if re.match(rf"- \[(.)\] {step_number}\.", line.strip()):
                new_line = re.sub(r"- \[(.)\]", f"- [{STATUS_MAP[status]}]", line)
                if step_note:
                    new_line = re.sub(r"\s*-\s*Note:.*", "", new_line).rstrip()
                    new_line += f" - Note: {step_note}\n"
                lines[i] = new_line
                updated = True
                break

        if not updated:
            return f"Step {step_number} not found."

        with open(TODO_FILE, "w") as f:
            f.writelines(lines)

        return f"Updated step {step_number} to {status}.\n\n" + self._get_plan_status()