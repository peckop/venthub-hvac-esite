# Arama sorgu sayacı — karar 64 (1 hafta) + sonuçsuz arama günlüğü (K10.1)

> **REC-340 · URUN · 2026-09-23 · PLAN (kod yok, migration yok).** Uygulama plan-challenger'dan
> sonra; migration'lı PR yalnız Recep onayıyla merge edilir (kural 13; onay URUN penceresinde).

**KAYNAK/CETVEL:**
- **Karar 64** (Recep EVET, 2026-09-22): 1 haftalık arama sorgu sayacı, kişi verisi yok, migration;
  amaç sunucu önbellek planının (REC-340 yorumu 2026-09-22 10:06, "(2) sunucu önbellek planı —
  UYGULANMADI") işe yarayıp yaramayacağını ölçmek: **aynı sorgu ne sıklıkla tekrar geliyor?**
- `docs/standards/arama-standard.md` **K10** (arama günlüğü: K10.1 sıfır sonuç kaydedilir, K10.2 anonim
  yazma yüzeyi RLS + kötüye kullanım sınırı olmadan açılmaz, K10.3 günlüksüz davranış cümlesi kurulmaz)
  · **K9.1/K9.3** (hata sıfıra dönüşmez — günlük hatayı "sıfır sonuç" diye yazmaz) · K14.7 (iptal).
- `docs/plans/rec340-faz1-plan-2026-09-15.md` **Adım 6** (arama günlüğü, ön şartı K9.1 — K9.1 #1304 ile
  canlıda: hata ekranı ayrı).
- Kural 12 (kiracı), kural 13 (migration = prod), KVKK (REC-294: ham IP saklanmaz).
- **Ölçüm tazeliği (2026-09-23, canlı DB SELECT):** `public` şemasında arama günlüğü tablosu **YOK**
  (yalnız `product_search_index`, `search_reindex_queue`); `rate_limits` ham IP tutuyor (REC-294).

**YÖNTEM:** şerit (URUN) · plan-challenger (migration zorunlu) · `create-migration` · gölgede senaryolar
· PR `diff-review` · Recep merge (kural 13).

## 0. Düzeltme — önceki notum yanlıştı

2026-09-22 REC-340 yorumunda "tekrar oranı ölçülemiyor (günlük yalnız sıfır sonuç tutuyor, K10.1)"
yazdım. **Yanlış:** K10.1 cetvelde yazılı ama **hiç kurulmadı** — Faz 1 Adım 6 yapılmadı, DB'de tablo yok.
Yani bugün ne tekrar oranı ne sıfır sonuç ölçülüyor. Bu plan ikisini tek tabloda kurar (fark birkaç
satır → tam olan seçilir, kural 14).

## 1. Ne ölçülecek

| soru | kimin kararına girdi | sütun |
|---|---|---|
| Aynı (normalize) sorgu bir saat içinde kaç kez tekrar geliyor? | sunucu önbelleği yapılsın mı (REC-340 (2)) | `adet` / satır sayısı, saatlik kova |
| Hangi sorgular sıfır sonuç döndürüyor? | K10.1, arama kalitesi, katalog eksikleri | `durum = 'bos'` |
| Arama ne sıklıkla hata veriyor? | K9, Nano duraklaması (karar 59 ölçümü) | `durum = 'hata'` |

**Önbellek sorusunun eşiği (ölçümden önce yazılır ki sonuca göre eğilmesin):** 7 günde istek başına
beklenen önbellek isabeti ≈ `1 − (tekil (saat, dil, sorgu) / toplam istek)`. **%30'un altındaysa önbellek
planı uygulanmaz** (soğuk başlangıç riski kazançtan büyük); %30–60 arası OPS/Recep'e kıyas tablosuyla
gider; %60 üstü plan uygulanır. Saatlik kova önbellek ömrünün (etiketle tazelenen `unstable_cache` +
CDN 60 sn) kaba üst sınırıdır — isabet tahmini **iyimser** okunur, bu açıkça raporda yazılır.

## 2. Veri modeli (migration 1)

```
arama_sayaci(
  tenant_id  uuid        not null,           -- kural 12
  saat       timestamptz not null,           -- date_trunc('hour', now()); kişi izi yok
  dil        text        not null check (dil in ('tr','en')),
  sorgu      text        not null check (char_length(sorgu) between 1 and 100),  -- arama_normalize() çıktısı
  durum      text        not null check (durum in ('sonuc','bos','hata')),
  adet       integer     not null default 1 check (adet > 0),
  primary key (tenant_id, saat, dil, sorgu, durum)
)
arama_sayaci_ayar(tenant_id uuid primary key, acik_bitis timestamptz not null)  -- tek satır
```

- **Kişi verisi yok:** IP, oturum, kullanıcı kimliği, tarayıcı bilgisi **yazılmaz**; satır saatlik
  toplamdır. Sorgu metninde kişisel veri olasılığı (biri kutuya e-posta/telefon yazarsa): `@` içeren
  ya da `(\+?90|0)?5\d{9}` telefon kalıbına uyan sorgu **yazılmaz** (SKU'lar 8 hane rakam taşıyabildiği
  için genel "uzun rakam" süzgeci konmaz — `SEA-51151000` gibi SKU aramaları ölçülmeli).
- **RLS:** tabloda `anon`/`authenticated` için hiçbir politika yok → doğrudan okuma/yazma kapalı. Okuma
  yalnız servis rolü ve admin raporu (`admin_audit_log` gerekmez; ürün verisi değil).
- **Yazma yolu tek:** `arama_sayaci_yaz(p_sorgu text, p_dil text, p_durum text)` — `SECURITY DEFINER`,
  `SET search_path = public, pg_temp`, `EXECUTE` yalnız `anon, authenticated`'a. İçinde:
  1. `tenant_id` = istek başlığından değil **sabit `DEFAULT_TENANT_ID`** (tek kiracı, REC-59 kalıbı;
     çok kiracı açılınca `jwt_tenant_id()`'ye döner — cetvele not).
  2. `now() >= acik_bitis` → **hiçbir şey yazmadan döner** (1 haftalık süre veriyle kapanır, kod
     deploy'u gerekmez; uzatma = ayar satırı güncellemesi, prod yazımı → Recep kapısı).
  3. `sorgu := arama_normalize(p_sorgu)`, 100 karaktere kırpılmaz — **uzunsa yazılmaz** (kırpılmış
     sorgu yanlış anahtar olur).
  4. Kişisel veri kalıbı → yazılmaz.
  5. **Kötüye kullanım sınırı (K10.2), IP'siz:** o saatte o kiracı için tekil satır sayısı ≥ 2000 ise
     **yeni satır açılmaz**, yalnız var olan satırın `adet`'i artar. Tablo büyümesi sınırlıdır
     (7 gün × 24 saat × 2000 = 336 bin satır tavanı; gerçek beklenti bunun binde biri). Sayıları
     şişirme saldırısı ölçümü bozar ama zarar vermez; raporda "tek saatte olağandışı adet" satırı
     işaretlenir.
  6. `insert … on conflict (tenant_id, saat, dil, sorgu, durum) do update set adet = arama_sayaci.adet + 1`.
- `VOLATILE`, `STRICT`; arama RPC'lerine (**`fts_search_products` STABLE kalır**) dokunulmaz — okuma
  fonksiyonunu yazan fonksiyona çevirmek PostgREST GET yolunu kırar.

## 3. İstemci (kod, aynı PR)

- `src/lib/services/aramaSayaci.service.ts`: `aramaSayaciYaz(supabase, q, lang, durum)` — DI (kural 2),
  **ateşle ve unut**: hata yutulur (sayaç aramayı asla bozmaz), `await` edilmez, `keepalive` gerekmez.
- `SearchOverlay.tsx` ana etkisi: iki RPC **başarıyla** dönünce (iptal edilmemiş) →
  `rows.length > 0 ? 'sonuc' : 'bos'`; `catch` dalında iptal değilse → `'hata'`. İptal edilen istek
  **sayılmaz** (kullanıcı yazmayı sürdürdü; sunucuya gitmiş olsa da önbellek anahtarı olarak ömrü yok —
  sayım bu yüzden sunucu yükünü **alttan** tahmin eder, raporda yazılır).
- Sayılan birim = sunucuya giden **debounce'lu** sorgu (tuş vuruşu değil) — önbelleğin anahtarı da bu.
- Bayrak yok: süre DB'deki `acik_bitis` ile kapanır; kapandıktan sonra istemci çağrısı sunucuda boş
  döner (7 gün sonra kaldırma PR'ı §5).

## 4. Kapılar

- **INV-ARAMA-SAYACI-1** (birim): sayaç yalnız (a) başarılı ve iptal edilmemiş yanıt, (b) iptal edilmemiş
  hata sonrası çağrılır; iptal edilen istek sayılmaz; sayaç hatası arama durumunu değiştirmez.
- **Gölge (migration):** temiz · ikinci koşum · anon yazar, anon okuyamaz · süre dolunca yazmaz ·
  e-posta/telefon kalıbı yazılmaz · 101 karakter yazılmaz · saatlik 2000 tavanı · aynı anahtar iki kez →
  `adet = 2` · kiracı sütunu dolu. Çıkış kodlarıyla.
- `pnpm build` + tam birim takımı + `diff-review` + tip üretimi (`pnpm supabase:gen`).

## 5. Bir hafta sonra (sonlandırma yolu — karar 64 şartı)

1. **Rapor** (`docs/audits/rec340-arama-sayaci-2026-09-XX.md`): toplam istek, tekil anahtar, §1 eşiğine
   göre önbellek isabet tahmini (iyimser olduğu yazılı), en sık 20 sorgu, sıfır sonuçlu ilk 30 sorgu
   (K10.1 — katalog/eşanlam eksiği için KATALOG'a), hata oranı ve saat dağılımı (Nano duraklaması).
2. **Karar** (OPS → Recep, numara OPS'tan): önbellek planı uygula/uygulama; sıfır sonuç günlüğü
   **kalıcı** olsun mu (K10.1 kalıcı ister — öneri: `durum='bos'` kalıcı, `'sonuc'` sayımı kapansın).
3. **Temizlik:** kalıcılık kararına göre ya ayar satırı süresi uzatılır (yalnız `bos` yazılır — istemci
   değişikliği) ya da ikinci migration tabloyu ve fonksiyonu kaldırır + istemci çağrısı silinir. Satırlar
   saatlik toplam olduğu için silme bir KVKK zorunluluğu değildir; tutma süresi yine cetvele yazılır
   (öneri 90 gün).

## 6. Neyi ölçmedim

- Gerçek günlük arama sayısı (ölçümün kendisi bu) — tablo boyutu tahmini bu yüzden tavanla verildi.
- `arama_normalize()`'nin 100 karakter sınırında davranışı (gölgede ölçülecek).
- İstemcide ek RPC'nin arama gecikmesine etkisi: ateşle-unut ve yanıttan SONRA → ekran etkilenmez;
  Nano duraklamasında ek bağlantı yükü ihmal edilebilir sayıldı, ölçülmedi.

*Yazan: URUN şeridi, 2026-09-23.*
