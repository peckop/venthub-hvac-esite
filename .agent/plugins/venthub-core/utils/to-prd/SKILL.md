---
name: to-prd
description: Turn the current conversation context into a PRD. Use when the user wants to create a PRD from the current context.
---

# To PRD

This skill takes the current conversation context and codebase understanding and produces a PRD (Product Requirements Document). Do NOT interview the user — just synthesize what you already know.

## Process

1. Explore the repo to understand the current state of the codebase. Use the project's domain glossary vocabulary throughout the PRD.
2. Sketch out the seams at which you're going to test the feature.
3. Write the PRD using the template below and save it to `artifacts/superpowers/prd.md`.

### Template:
- **Problem Statement**: The problem from the user's perspective.
- **Solution**: The proposed solution.
- **User Stories**: A numbered list of user stories.
- **Technical Specs**: Seams, APIs, and RLS rules impacted.
