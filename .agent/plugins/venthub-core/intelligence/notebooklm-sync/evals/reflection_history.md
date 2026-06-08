

## [2026-05-11 09:54:00] Iteration 1 (Model: openai/gpt-oss-20b:free)

**Old Description:** `Projedeki Markdown (.md) dosyalarını NotebookLM ile otonom olarak senkronize etmek (Hard Reset) için kullanın. TETİKLE: ...`

**Failed Evals Count:** 2

### LLM Reflection & Insights:
**[MY THOUGHTS]**  
I mistakenly triggered the skill because I interpreted the user requests as requests for a *global refresh* of the NotebookLM environment. In the first test, the user simply wants to retrieve the ID of an existing notebook; this is an informational query that should be handled locally by the NotebookLM API, not by re‑synchronizing the entire Markdown repository. In the second test, the user is requesting the source code of a helper module (`docs_tree.py`). This is a local file request, not a change that affects the Markdown documentation structure, so a full reset is unnecessary. My attention mechanism mis‑identified the intent due to the presence of keywords like “ID” or “kod” that can sometimes appear in synchronization prompts, and I over‑generalized the rule that “any reference to NotebookLM” requires a hard reset.

**[NEW DESCRIPTION]**  
Use this skill to perform a full hard reset sync of the entire Markdown (.md) repository with NotebookLM only when a complete project refresh is truly needed. Trigger it when the user explicitly says or implicitly means: “Update NotebookLM”, “Refresh sync”, “Sync docs/ folder”, “Rebuild Master MD”, or when an architectural or documentation overhaul demands a reset. Never trigger it when the user is only: looking up a notebook ID, querying a notebook’s content or metadata, requesting code snippets from local scripts, adding a single file to Drive or local storage, or asking about NotebookLM’s voice summary, summary‑as‑podcast, or other non‑sync features. The skill must avoid any action that wipes or re‑uploads the whole project unless the user’s intent clearly specifies a full rewrite or architectural change.
---


## AXIOMS
Bu modül için henüz özel bir aksiyom tanımlanmamıştır.