---
name: notebook-skill
description: Gain access to the Obsidian notebook vault.
---

# Notebook Skill

This skill enables agents to access the user's Obsidian vault, create and edit Obsidian Flavored Markdown.

## Access Path

| Mode | Path |
|------|------|
| **Sandbox** | `/mnt/notebook` |
| **Host** | `$MOUNT_NOTEBOOK` or `cd $MOUNT_NOTEBOOK` |

## Obsidian Markdown Flavor

- [CommonMark](https://commonmark.org/)
- [GitHub Flavored Markdown](https://github.github.com/gfm/)
- [LaTeX](https://www.latex-project.org/) for math
- Obsidian extensions: wikilinks `[[page]]`, callouts, embeds `![[file]]`
