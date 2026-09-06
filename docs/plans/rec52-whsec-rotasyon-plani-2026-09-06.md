# REC-52 — Supabase webhook sırrı (whsec) rotasyonu: kalan 5 adım Recep'te

> **Durum:** PLAN (uygulama YOK) · **Şerit:** ALTYAPI · **Tarih:** 2026-09-06
> ⛔**SIR İŞİ:** bu planı yazan şerit sırrı **DÖNDÜRMEZ**. Beş adımın tamamı Recep'in
> elindedir (Vercel + Supabase Vault panelleri). Bu belge **nasıl güvenli koşulacağını** ve
> **bittiğinin nasıl kanıtlanacağını** yazar.
> **KAYNAK/CETVEL:** `docs/audits/secret-exposure-audit-2026-08-15.md` §4.1 (5 adımlık runbook) ·
> CLAUDE.md kural 11 (webhook HMAC + replay guard) · kural 13 (migration merge = prod) ·
> `repo PUBLIC` taban çizgisi. **PDF/sır cetveli:** rotasyon runbook'u audit'te yaşıyor,
> ayrı cetvel açılmasına gerek yok — bu plan ona atıf yapar.
> **YÖNTEM:** elle (tek belge) + Recep kapısı. Kod PR'ı YOK, migration YOK.

---

## ⭐ÖNCE: KAYITTAKİ ÇELİŞKİ ÇÖZÜLDÜ — çelişki değil, TERİM KARIŞIKLIĞIYDI

`docs/kayitlar_master.md` iki farklı şey söylüyordu:

| satır | ne diyor | hangi katman |
|---|---|---|
| 3055 (08-26 derlemesi, **"✅ YAPILMIŞ"** başlığı altında) | *"PR #584 … Vault taşıma+rotasyon penceresi canlı doğrulanmış"* | **KOD** tarafı |
| 15101 (08-15 oturum kaydı) | *"T031 whsec rotasyonu **yarım**"* | **DEĞER** tarafı |
| 3364 (aynı dosya, Bulgu #4) | *"**Bu bir TAŞIMA'dır, ROTASYON DEĞİL** … Gerçek kapanış … **Recep'e ait**"* | ayrımı zaten yazmış |

⭐**İkisi çelişmiyor: farklı katmanı anlatıyorlar.** Kod tarafı 2026-08-17'de bitti ve indi;
**sır değerinin kendisi** hâlâ dönmedi.

**Kanıt zinciri (repo içi, ölçüldü):**
1. Commit `ba01937a`'nın kendi mesajı: *"Runbook: audit 4.1 (rotasyonun 5 adımı **Recep'te**)"* —
   yazar merge anında bile işi tamamlanmamış işaretlemiş.
2. `git log --all -- supabase/migrations/*vault* src/app/api/webhook/supabase/` →
   `ba01937a` (08-17) **sonrası bu yollara dokunan commit YOK**.
3. `secret-exposure-audit-2026-08-15.md:106` → *"**Kalan (Recep):** yukarıdaki 5 adım.
   Kod tarafında yapılacak bir şey yok."*
4. `kayitlar_master.md` **2026-09-03**'te derlenmiş, yani 17 günlük veriye sahip — ve içinde
   *"rotasyon tamamlandı / Vault değeri değişti"* diyen **hiçbir kayıt yok**.

⛔**KAYIT KUSURU, ADIYLA:** satır 3055'in **"✅ YAPILMIŞ"** başlığı altında durması yanıltıcı —
*"kod tarafı yapılmış"* ile *"iş bitmiş"* karışmış. Bu, audit'in kendi uyardığı sınıf:
**"iş bitti ≠ iş erişilebilir."** ⚠Düzeltme **bu dosyada yapılmaz**: `kayitlar_master.md`
ÜRETİLMİŞ bir masterdır (AXIOM 3 — üretilen dosya elle düzenlenmez); düzeltme **kaynak
kayıtta** yapılır ve master yeniden derlenir. Sahibi ALTYAPI değil → **OPS'a bildirildi.**

## KOD NE DURUMDA — hazır, bekliyor

Rotasyon penceresi **kodda mevcut ve çalışır**: `src/app/api/webhook/supabase/route.ts:234-237`
iki değeri birden kabul ediyor (`SUPABASE_WEBHOOK_SECRET` **ve** `..._NEXT`), yani rotasyon
**kesintisiz** yapılabilir. Migration (`20260816160245_webhook_secret_to_vault.sql`) sırrı
Vault'a taşıdı ve kendi başlık yorumunda *"ROTASYON DEĞİLDİR"* diye yazıyor.

**Yani kod tarafında yapılacak bir şey yok — ve bu planın kod PR'ı da yok.**

## KALAN 5 ADIM — Recep'te (audit §4.1, birebir)

1. Yeni değer üret (`openssl rand -hex 24`, başına `whsec_`).
2. **Vercel** → `SUPABASE_WEBHOOK_SECRET_NEXT` = yeni değer (**eskiye DOKUNMA**) → deploy.
3. **Supabase** → Vault'taki `supabase_webhook_secret` kaydını yeni değerle güncelle.
4. **Doğrula:** admin'den bir ürün güncelle → PDP'nin tazelendiğini gör.
5. **Vercel** → `SUPABASE_WEBHOOK_SECRET` = yeni değer, `..._NEXT`'i **SİL** → deploy.

⭐**Sıra kritiktir ve sebebi yazılı:** 2. adımda eskiye dokunulmadığı için **kesinti olmaz**;
5. adım pencereyi kapatır. Adımlar atlanır ya da sırası bozulursa webhook **sessizce** düşer —
sipariş/stok tetikleri durur ve bu, kırmızı bir kapı üretmez.

## BENDEN İSTENEN — ölçüm ve kanıt tarafı (sır DEĞİL)

| # | iş | sahibi |
|---|---|---|
| B1 | Rotasyon **öncesi** durum ölçümü: webhook'un bugün çalıştığının kanıtı (admin güncelleme → PDP tazelenme) | Recep tetikler, ölçümü ben yazarım |
| B2 | Rotasyon **sonrası** aynı ölçüm — *"eski sır ile imzalı istek 401"* kanıtı | Recep |
| B3 | Kayıt düzeltmesi: `kayitlar_master.md` 3055'in yanıltıcı yerleşimi → **kaynak kayıtta** düzeltilir, master yeniden derlenir | OPS |
| B4 | Bitince REC-52 kapanış yorumu: 5 adımın hangisinin ne zaman koşulduğu + 401 kanıtı | ben yazarım |

## SINIRLAR — adıyla

- ⛔**Sır değeri hiçbir yere yazılmaz** (repo PUBLIC; yeni bir sır commit'lenirse geri dönüşü YOK).
  Bu belgede yalnız **değişken adları** geçer.
- ⛔**Ben döndürmem.** Vercel ve Vault panelleri Recep'te; ALTYAPI'nın bu panellere erişimi
  yoktur ve **istenmez**.
- ⚠**Repo içi kanıtla ölçülemeyen:** Vercel env'in ve Vault kaydının **bugünkü** değeri.
  Yani *"5 adım sessizce yapılmış olabilir"* ihtimali **dışlanamaz** — bu planın hükmü
  **"git/dosya kanıtına göre"** sınırlıdır. Rotasyonun yapıldığını **yalnız Recep** doğrulayabilir.
- ⚠`whsec_` biçimindeki bu sır, dört ayrı Edge webhook sırrından (`QUOTE_`, `ORDER_PAID_`,
  `RETURNS_`, `SHIPPING_WEBHOOK_SECRET`) **farklıdır**; bu plan yalnız T031-VH'yi kapsar.

## KABUL ÖLÇÜTÜ

- 5 adım koşuldu ve **eski sır ile imzalı bir istek 401** aldı (davranışsal kanıt, beyan değil).
- Rotasyon penceresi kapandı: `SUPABASE_WEBHOOK_SECRET_NEXT` **silindi**.
- REC-52 kapanış yorumunda adım-adım zaman damgaları + 401 kanıtı yazılı.
- Kayıt düzeltmesi yapıldı: *"kod tarafı bitti"* ile *"rotasyon bitti"* bir daha karışmıyor.
