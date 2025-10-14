import re
from dataclasses import dataclass, field
from pathlib import Path
from typing import Optional

# Keep for backward compatibility and migration
TODO_FILE = Path("TODO.md")

STATUS_MAP = {
    "pending": " ",
    "in_progress": ">",
    "completed": "x",
    "failed": "!",
}
REVERSE_STATUS_MAP = {v: k for k, v in STATUS_MAP.items()}


@dataclass
class Task:
    """Represents a single task in the plan."""
    number: int
    description: str
    status: str = "pending"
    note: Optional[str] = None

    def __str__(self):
        note_str = f" - Note: {self.note}" if self.note else ""
        return f"- [{STATUS_MAP[self.status]}] {self.number}. {self.description}{note_str}\n"


@dataclass
class Plan:
    """Represents the overall plan."""
    objective: str
    tasks: list[Task] = field(default_factory=list)
    chat_id: Optional[str] = None

    def to_markdown(self, hide_completed: bool = False, newly_completed_step: Optional[int] = None) -> str:
        """Converts the plan to a markdown string."""
        markdown = f"### Current Plan for Objective: {self.objective}\n\n"
        visible_tasks = []
        for task in self.tasks:
            if hide_completed and task.status == "completed" and task.number != newly_completed_step:
                continue
            task_item = f"- Step {task.number}: {task.description} - **{task.status.upper()}**"
            if task.note:
                task_item += f" (Note: {task.note})"
            visible_tasks.append(task_item)
        markdown += "\n".join(visible_tasks)
        return markdown

    def first_pending(self) -> Optional['Task']:
        for t in self.tasks:
            if t.status == "pending":
                return t
        return None

    def first_in_progress(self) -> Optional['Task']:
        for t in self.tasks:
            if t.status == "in_progress":
                return t
        return None


def read_plan_from_database(chat_id: str) -> Optional[Plan]:
    """Reads the plan from the database for a specific chat."""
    from suzent.database import get_database
    
    db = get_database()
    plan_data = db.get_plan(chat_id)
    
    if not plan_data:
        return None
    
    tasks = []
    for task_data in plan_data['tasks']:
        tasks.append(Task(
            number=task_data['number'],
            description=task_data['description'],
            status=task_data['status'],
            note=task_data['note']
        ))
    
    return Plan(
        objective=plan_data['objective'],
        tasks=tasks,
        chat_id=chat_id
    )


def write_plan_to_database(plan: Plan):
    """Writes the plan to the database."""
    from suzent.database import get_database
    
    if not plan.chat_id:
        raise ValueError("Plan must have a chat_id to be saved to database")
    
    db = get_database()
    tasks_data = []
    for task in plan.tasks:
        tasks_data.append({
            'number': task.number,
            'description': task.description,
            'status': task.status,
            'note': task.note
        })
    
    db.update_plan(plan.chat_id, plan.objective, tasks_data)


def auto_mark_in_progress(chat_id: str):
    """If no task is in progress, mark the first pending as in_progress."""
    plan = read_plan_from_database(chat_id)
    if not plan:
        return
    if plan.first_in_progress():
        return
    pending = plan.first_pending()
    if pending:
        from suzent.database import get_database
        db = get_database()
        db.update_task_status(chat_id, pending.number, "in_progress")


def auto_complete_current(chat_id: str):
    """Mark the current in_progress task as completed."""
    plan = read_plan_from_database(chat_id)
    if not plan:
        return
    cur = plan.first_in_progress()
    if cur:
        from suzent.database import get_database
        db = get_database()
        db.update_task_status(chat_id, cur.number, "completed")


# Legacy functions for backward compatibility and migration
def read_plan_from_file() -> Optional[Plan]:
    """Reads the plan from the TODO.md file (legacy function)."""
    if not TODO_FILE.exists():
        return None

    content = TODO_FILE.read_text()
    objective_match = re.search(r"# Plan for: (.*)", content)
    objective = objective_match.group(1).strip() if objective_match else "Unknown Objective"

    tasks = []
    for match in re.finditer(r"- \[(.)\] (\d+)\. (.*?)(?: - Note: (.*))?$", content, re.MULTILINE):
        status_char, num_str, desc, note = match.groups()
        tasks.append(Task(
            number=int(num_str),
            description=desc.strip(),
            status=REVERSE_STATUS_MAP.get(status_char, "unknown"),
            note=note.strip() if note else None
        ))
    return Plan(objective=objective, tasks=tasks)


def write_plan_to_file(plan: Plan):
    """Writes the plan to the TODO.md file (legacy function)."""
    with open(TODO_FILE, "w") as f:
        f.write(f"# Plan for: {plan.objective}\n\n")
        for task in plan.tasks:
            f.write(str(task))


def migrate_plan_to_database(chat_id: str) -> bool:
    """Migrate an existing TODO.md plan to the database for a specific chat."""
    plan = read_plan_from_file()
    if not plan:
        return False
    
    plan.chat_id = chat_id
    try:
        write_plan_to_database(plan)
        return True
    except Exception as e:
        print(f"Error migrating plan to database: {e}")
        return False
