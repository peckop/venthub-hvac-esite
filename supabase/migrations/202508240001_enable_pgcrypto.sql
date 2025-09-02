-- Ensure pgcrypto extension exists before any migration uses gen_random_uuid()
BEGIN;
CREATE EXTENSION IF NOT EXISTS pgcrypto;
COMMIT;
