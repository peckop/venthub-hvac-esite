## 2025-02-23 - Edge Function Error Exposure Patch
**Learning:** Detailed database errors (`_e.message`) were being exposed directly to clients via `return new Response` catch blocks in multiple Supabase Edge Functions, risking internal schema leakage and failing security boundaries. Furthermore, `console.error` was missing in some, hindering internal debuggability while exposing errors publicly.
**Action:** Always replace dynamic error messages returned to clients in Catch blocks with generic fallback messages (e.g. 'Internal server error') and ensure that `console.error(e)` is always called before returning the Response to safely log the details for administrators.

## 2025-02-23 - Edge Function Error Exposure Patch
**Learning:** Detailed database errors (`_e.message`) were being exposed directly to clients via `return new Response` catch blocks in multiple Supabase Edge Functions, risking internal schema leakage and failing security boundaries. Furthermore, `console.error` was missing in some, hindering internal debuggability while exposing errors publicly.
**Action:** Always replace dynamic error messages returned to clients in Catch blocks with generic fallback messages (e.g. 'Internal server error') and ensure that `console.error(e)` is always called before returning the Response to safely log the details for administrators.
