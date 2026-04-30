## 2024-06-25 - [TSDoc Hook Documentation]
**Learning:** React custom hooks in VentHub (`src/hooks/*`) often return complex states alongside mutative functions. When documenting them, ensuring accurate descriptions of how functions interact with the internal state and UI side effects (like toasts) creates a significantly better Developer Experience.
**Action:** Always include a detailed `@returns` tag explaining the shape of the returned object and an `@example` tag demonstrating a realistic implementation pattern within a component, especially for hooks involving asynchronous side effects like `useApiCall`.
## 2026-04-13 - [TSDoc Data Formatting]
**Learning:** VentHub uses suffix-based type inference (e.g., '_mm', '_kg', '_v') within translation keys to automatically format strings with the correct engineering units. Documenting these hidden conventions directly on the formatting functions prevents developers from reinventing the wheel or hardcoding strings elsewhere.
**Action:** When documenting data transformation utilities in , explicitly mention any implicit business logic like suffix-matching in the  descriptions and provide concrete s demonstrating the suffix behavior.
## 2025-02-23 - [TSDoc Data Formatting]
**Learning:** VentHub uses suffix-based type inference (e.g., '_mm', '_kg', '_v') within translation keys to automatically format strings with the correct engineering units. Documenting these hidden conventions directly on the formatting functions prevents developers from reinventing the wheel or hardcoding strings elsewhere.
**Action:** When documenting data transformation utilities in `src/utils/`, explicitly mention any implicit business logic like suffix-matching in the `@param` descriptions and provide concrete `@example`s demonstrating the suffix behavior.

## 2024-05-18 - [Loose Number Parsing in safeNumber]
**Learning:** `safeNumber` relies on `parseFloat` for strings, which extracts valid numbers even if the string ends with non-numeric characters (e.g., `'42px'` -> `42`, `'3.14.15'` -> `3.14`).
**Action:** When documenting type converters, explicitly mention if loose string parsing (`parseFloat`/`parseInt`) is used instead of strict `Number()` coercion, as this affects CSS parsing, multi-decimal values, and potential invalid data.
## 2024-05-18 - Batch documentation truncation limits
**Learning:** When reading files in bash with commands like `cat`, output will be truncated if the file size exceeds roughly 1000 characters. Trying to document these files based on partial knowledge violates the groundedness rule.
**Action:** Use specific read tools (`read_file`) or specific line limits in bash (`sed -n '1,30p' <file>`) to ensure the entire function structure and return statements are explicitly verified before generating accurate TSDocs.

## 2026-04-22 - [Multiple Documentation Blocks]
**Learning:** When adding TSDoc comments to a function, check if the function already has a documentation block. Adding a new `/** ... */` block above an existing one creates consecutive, redundant comments which are messy.
**Action:** If a function already has a JSDoc/TSDoc block, update or replace it rather than appending a new block directly above it.
## $(date +%Y-%m-%d) - Documenting Category and Invoice Services
**Learning:** Adding TSDoc comments requires checking both the beginning and end of previously defined functions or objects closely, particularly in large service files with chained promises or DB logic, to avoid accidental syntax errors during Git Merge diff replacements.
**Action:** Always read the full file or correctly scoped slice of the file before determining where to place TSDoc blocks.
