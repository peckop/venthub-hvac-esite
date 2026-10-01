# KURALLAR: ALTYAPI

> Üretilmiştir (`scripts/belge/rol-karti-uret.cjs`); elle düzenleme. Rol kartı: `docs/roller/ALTYAPI.md`. K = tam listedeki madde no; gerekçeli tam metin: `docs/standards/gelistirme-kurallari-tam-liste.md`.

- K1 Plan önce: Değişiklikten önce plan çıkar, onay al; plan kendisini hangi cetvelin yönettiğini söyler (dosya adı ya da açıkça "cetvel yok").
- K2 Tip güvenliği: `any` yasak, strict TypeScript.
- K3 RLS-first: Her tablo RLS politikasıyla korunur.
- K4 Monoton durum: Sipariş ve iade durumları yalnız ileri gider, geri dönüş engellenir.
- K6 HMAC: Webhook uçları HMAC-SHA256 ile korunur.
- K8 Replay koruması: Webhook'ta HMAC'e ek olarak zaman damgası (`x-timestamp`) ya da idempotency.
- K15 Önbellek anahtarı: dil: `unstable_cache` anahtar dizisine aktif dil kodu (`lang`) eklenir.
- K16 ISR + webhook: Statik vitrinde görünen her tablonun DB tetiği VE webhook handler dalı olur; HMAC geçince `revalidatePath`/`revalidateTag`; secret yoksa fail-closed (cetvel: `rendering-cache-standard.md` §3).
- K18 Edge dil izolasyonu: Sipariş anında kullanıcı dili (`user_locale`) kaydedilir; e-posta şablonu ürün adını o dile göre süzer.
- K20 CSP 3D CDN: `connect-src` beyaz listesinde `raw.githubusercontent.com` ve `raw.githack.com` kalıcıdır; kaldırmak yasak.
- K24 Tenant izolasyonu: Okuma/yazma, Edge API ve Realtime kanalları tenant-scoped olur; data bleeding kabul edilmez.
- K25 Middleware Edge: `middleware.ts` Edge'de DB sorgusu atmaz; tenant çözümü header/Edge Config ile, URL rewrite yok.
- K26 app_metadata: Yetki kararı `app_metadata` üzerinden verilir; kullanıcının kendi düzenleyebildiği meta veriden asla.
- K28 Önbellek anahtarı: tenant: `unstable_cache`/`revalidateTag` anahtarına `tenantId` de girer (`['key', lang, tenantId]`).
- K29 Tenant-aware iletişim: E-posta logo ve unvanı global `.env`'den değil `tenants.config`'ten gelir. (Faz 2 park: tasarım kuralı, kodda ölçülmedi)
- K30 Storage RLS: Tenant bucket'larında `tenant_id = jwt_tenant_id()` RLS kontrolü. (Faz 2 park: tasarım kuralı, kodda ölçülmedi)
- K31 super_admin pivotu: Çapraz kiracı `super_admin` için 1-N FK yerine `tenant_users` pivot tablosu. (Faz 2 park: tasarım kuralı, kodda ölçülmedi)

## Recep'e mesaj kuralları (ayrıntı; yöneten metin `~/.claude/output-styles/recep.md`)
- Durum mesajı TEK TABLO: `| No: Kanban numarası · karar no | İş | Durum | Önerim | Sorumlu | Sırada |`; onay bekleyenler en üst satırlardır, ayrı tablo yok. Recep'e giden durum cevabı tek tablodur.
- (OPS hariç) tabloya yalnız KENDİ kartların girer; çok departmanlı genel resmi OPS verir; çok elzemse tablo dışında tek cümle hatırlat.
- Başka pencereden (OPS dahil) gelen mesajla açılan turda cevap o pencereye SendMessage ile gider, Recep'e ANLATILMAZ; Recep'e görünen metin tek cümle, yalnız kendi kartın (değişen yoksa tablo yok).
- Değişen yoksa tablo yok: Recep "devam et" dediğinde ya da durum sorduğunda son rapordan beri kartında değişen yoksa cevap TEK cümledir; bekleyen kartlar her cevapta yeniden dökülmez, tabloya yalnız durumu değişen ya da Recep'in adıyla sorduğu kart girer. İşi kalmayan departman bunu Recep'e değil OPS'a yazar.
- İşin başkasını bekliyorsa yalnız "başka bir departmanın işini bekliyor" yaz (adı/işi/sırası yok); Sorumlu = "ben" (OPS hariç).
- 2+ kalem madde işaretli liste olur (tablo dışında, cümle içinde (a) (b) şık dizilmez); compact hazırlık notu 3 maddelik listedir; "Onayında" yalnız Recep kararı bekleyen iştir; tur sonunda "devam edeyim mi" sorma, sırası belli işe geç.
