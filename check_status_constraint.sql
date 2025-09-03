-- Status constraint'ini kontrol et
SELECT 
    conname AS constraint_name,
    pg_get_constraintdef(oid) AS constraint_definition
FROM pg_constraint 
WHERE conrelid = (SELECT oid FROM pg_class WHERE relname = 'venthub_orders')
  AND contype = 'c'
  AND conname LIKE '%status%';
