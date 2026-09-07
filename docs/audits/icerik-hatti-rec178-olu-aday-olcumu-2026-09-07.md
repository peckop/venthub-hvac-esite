# REC-178 · `generate-sitemap.mjs` ölü aday ölçümü + kalan 3 kalem

**Damga (ölçüldü, `date -u`):** 2026-09-07T07:3xZ · **Şerit:** URUN-KATALOG (sid 3a7976a1)
**Emir:** OPS 07:05Z — *"ölü aday: ölç (çağıran var mı, son 30 gün koşum izi var mı); yoksa karantina
önerisi OPS'a, silme Recep kapısı"*. **YÖNTEM:** elle, **salt ölçüm — kod yazılmadı.**
**Kaynak/cetvel:** kendi filo notum `icerik-hatti-1000-satir-tavani-filo-notu-2026-09-06.md` (PR #1063)
+ hafıza `sessiz-tavan-ve-fail-open-kapi`.
⚠**Şerit sınırı:** `scripts/generate/**`, `scripts/tools/**`, `scripts/media/**`, `scripts/db/product-data/**`
**benim claim'imde değil.** Bu belge ölçüm ve öneridir; o dosyalara **dokunulmadı**.

## 1. Hüküm — ÖLÜ, ve ölüden fazlası: **koşarsa canlı sitemap'i EZER**

`scripts/generate/generate-sitemap.mjs` yalnız kullanılmıyor değil; **çalıştırılırsa zarar verir.**

| Ölçüt | Ölçüm | Sonuç |
|---|---|---|
| Çağıran var mı? | Depo geneli grep (`json,yml,mjs,js,ts,cjs,md,ps1,sh`): kod çağrısı **0**. Tek eşleşme eski bir ajan worktree'sindeki **üretilmiş belge** (`.claude/worktrees/agent-a91c…/…/generate-sitemap.md`) — kod değil | **çağrılmıyor** |
| Son 30 gün commit | **0** | — |
| Son dokunuş | **2026-03-08** (`09202cac`, "write generated sitemap to project public directory") — 6 ay | **bayat** |
| Sitemap gerçekte nereden geliyor? | `src/app/sitemap.ts` (Next.js rotası, 6469 B, son değişim 09-05) | **rota canlı** |
| `public/sitemap.xml` diskte var mı? | **YOK** | betik hiç koşmamış |
| Canlı yüzey | `https://venthub.com.tr/sitemap.xml` → **HTTP 200, application/xml, 70.795 B** | rota üretiyor |

**Çakışma:** betik çıktısını `public/sitemap.xml`'e yazıyor (satır 84–86, hata dalında 96–97).
Next.js'te `public/` altındaki statik dosya, **aynı yol için** `app/sitemap.ts` rotasından **önce**
servis edilir. Yani bu betiği bir kez koşturmak, canlıda 70 KB üreten dinamik sitemap'i
**donmuş bir dosyayla değiştirir** — ve üstelik o dosya kendi 1000/5000 tavanıyla eksik üretilir
(satır 21–22: `categories … .limit(1000)`, `products … .limit(5000)`).

> Bu, filo notundaki tuzağın en pahalı biçimi: betik "başarıyla" koşar, kimse hata görmez,
> arama motoruna eksik ve donmuş bir site haritası gider.

**ÖNERİM (karar OPS/Recep'in, ben silmedim):** **karantina** — `scripts/generate/generate-sitemap.mjs`
kaldırılsın (ya da `.arsiv` uzantısıyla etkisizleştirilsin). Reçeteyle onarmak **gereksiz**: ürettiği
çıktı zaten canlıda daha iyisiyle üretiliyor; onarılmış hâli bile koşarsa aynı ezme riskini taşır.
Silme **Recep kapısı** (kural: silmeden önce canlılık ve tazelik ölçülür — ölçüldü, yukarıda).

## 2. Kalan 3 kalem — satırlar teyit edildi, reçete uygulanmadı (sahibi başkası)

| Dosya:satır | Bugünkü ölçüm | Tavan riski | Öneri |
|---|---|---|---|
| `scripts/tools/extract_brands.py:70` | `supabase.table('products').select('id,name,brand').execute()` — supabase-py, tam tablo, sayım yok | products **375** (tavan altı) → bugün doğru, 1000'i geçince sessizce eksik | reçete: `count=exact` + `.range()` döngüsü + fark KIRMIZI, sayfa boyu 100 ile sınav |
| `scripts/db/product-data/identity-fix.mjs:69` | `rest('products?deleted_at=is.null&select=sku,model_code')` — ham fetch, tam tablo, sayım yok; sonucu **"DEĞİŞMEZ" kapısı** olarak kullanıyor | aynı | aynı reçete; kapı girdisi eksikse kapı yanlış "temiz" der |
| `scripts/media/*` (10 dosya, 2026-08-21) | `rest/v1/products?...&brand=ilike.*X*` — marka başına ≤173 satır, filtreli, sayım yok | marka başına tavan altı | aynı reçete; **filtreli sayım şart** (`kesin_sayi` aynı filtreyle — 09-06'da ölçülen tuzak) |

Üçünde de **bugün yanlış sonuç üretilmiyor**; sınıf **kalıp riski**, gerçek aşım değil.
Referans uygulama: `scripts/icerik-hatti/_veri.py` (`kesin_sayi(yol)` + `tumunu_cek(..., sira="id")`,
`SAYFA_BOYU` ile sınanır) — kopyalanmasın, **çağrılsın** (kopya kapı, biri düzeltilip öteki unutulur).

## 3. Sınırlar

- Ölçüm **salt okuma**; hiçbir dosya değiştirilmedi, hiçbir betik çalıştırılmadı.
- "Çağıran yok" ölçütü grep'tir: **değişken yol / dinamik import** ile çağrılıyorsa bu tarama görmez.
  Karşı kanıt: `public/sitemap.xml` diskte yok — betik fiilen **hiç koşmamış**, yani dinamik bir
  çağıran da yok.
- Canlı sitemap ölçümü tek istek (HTTP 200 + 70.795 B); içeriğinin **doğruluğu** ölçülmedi, yalnız
  rotanın ürettiği doğrulandı.
