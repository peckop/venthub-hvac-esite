# KURALLAR: KATALOG

> Üretilmiştir (`scripts/belge/rol-karti-uret.cjs`); elle düzenleme. Rol kartı: `docs/roller/KATALOG.md`. K = tam listedeki madde no; gerekçeli tam metin: `docs/standards/gelistirme-kurallari-tam-liste.md`.

- K1 Plan önce: Değişiklikten önce plan çıkar, onay al; plan kendisini hangi cetvelin yönettiğini söyler (dosya adı ya da açıkça "cetvel yok").
- K3 RLS-first: Her tablo RLS politikasıyla korunur.
- K16 ISR + webhook: Statik vitrinde görünen her tablonun DB tetiği VE webhook handler dalı olur; HMAC geçince `revalidatePath`/`revalidateTag`; secret yoksa fail-closed (cetvel: `rendering-cache-standard.md` §3).
- K30 Storage RLS: Tenant bucket'larında `tenant_id = jwt_tenant_id()` RLS kontrolü. (Faz 2 park: tasarım kuralı, kodda ölçülmedi)
