# implementation_plan.md
# Goal: Sepet Verisi Ä°Ã§in Supabase Entegrasyonu

Analoji: Redis bir garsonun sipariÅŸi aklÄ±nda tutmasÄ± gibidir; garson deÄŸiÅŸirse sipariÅŸ uÃ§ar. Supabase ise sipariÅŸin mutfak fiÅŸine yazÄ±lmasÄ±dÄ±r. VentHub'Ä±n profesyonel yapÄ±sÄ± iÃ§in "fiÅŸli" (DB) yapÄ± ÅŸarttÄ±r.

## Plan
1. **Åžema Analizi:** `mcp_supabase_list_tables` ile mevcut tablolarÄ± doÄŸrula.
2. **SQL Migrasyonu:** `cart_items` tablosu oluÅŸturulmasÄ± ve RLS aktif edilmesi.
3. **Type-Safe KatmanÄ±:** `src/types/db-rows.ts` gÃ¼ncellenmesi.
4. **UI Senkronizasyonu:** `useOptimistic` ile hÄ±zlÄ± geri bildirim saÄŸlanmasÄ±.

## Risks
* DB yazma gecikmesi -> Optimistic UI ile Ã§Ã¶zÃ¼lecek.
