# supabase/baselines

Bu klasör, production `public` şemasının **zaman damgalı tam anlık görüntülerini** (snapshot) tutar.
Bunlar **çalıştırılabilir migration DEĞİLDİR** — felaket-kurtarma referansı ve drift görünürlüğü içindir.

## Neden var?

5 tablo (`organizations`, `price_lists`, `product_prices`, `user_projects`, `project_items`)
Supabase panelinden **elle** kuruldu; hiçbir migration'da `CREATE TABLE`'ları yoktu. Ayrıca
`migrations/` zinciri ile canlı şema arasında drift birikmişti (ör. `price_list_id_snapshot`
migration'da `text`, canlıda `uuid`). Bu snapshot'lar **gerçeğin tek kaydını** git'e sokar.

## Nasıl üretilir?

```bash
# .env içindeki DATABASE_URL (pooler) kullanılır; Docker GEREKMEZ
export DATABASE_URL=$(grep -E '^DATABASE_URL=' .env | head -1 | cut -d= -f2- | tr -d '"'\''')
pg_dump "$DATABASE_URL" --schema-only --schema=public --no-owner \
  -f supabase/baselines/$(date +%Y-%m-%d)_public_schema.sql
```

## migrations/ ile ilişki

- **baselines/** = "production ŞU AN tam olarak böyle görünüyor" (snapshot, replay edilmez).
- **migrations/** = ileriye dönük, idempotent, çalıştırılabilir değişiklik adımları (R0→B2 planı).

İkisi çelişirse **baseline (canlı gerçek) kazanır**; migration onu yakalayacak şekilde düzeltilir.

## Geçmiş

| Tarih | Dosya | Not |
|---|---|---|
| 2026-06-12 | `2026-06-12_public_schema.sql` | İlk tam baseline. 38 tablo, 101 RLS politikası, 237 GRANT. pg_dump 17.4 → server 17.6. |
