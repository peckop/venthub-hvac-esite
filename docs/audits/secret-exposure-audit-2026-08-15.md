# Sır İfşa Denetimi — 2026-08-15

> **Bu dosya niçin var.** "Repoyu public yapabilir miyiz?" sorusu üç kez soruldu ve her seferinde
> baştan tartışıldı, çünkü elde **ölçüm** değil **hatıra** vardı. Bu belge o tartışmayı kapatır:
> her satır bir komutla üretildi, komut da yazılı. Gelecekte biri "riskimiz var mı?" derse
> cevap burada, ve **yeniden taramak yerine tarama betiğini koşmak** yeterli.
>
> **Yöntem:** `scripts/security/secret-scan.py` (repoda) — 18 sır imzası × **tüm git geçmişi**
> (`git log --all -S<sabit dize>` → eşleşen her commit'te regex ile tam değer çıkarımı).
> Ham değerler `TAM-RAPOR.txt`'de tutuldu; **o dosya git'te DEĞİL**, yalnız yerel diskte.
> Bu belgeye hiçbir sırrın tam değeri yazılmadı — maskeli önek/sonek ve **canlılık testi sonucu** var.

---

## 1. Sonuç — tek cümle

**Canlı ve tehlikeli hiçbir sır git geçmişinde kalmadı.** Bulunan 4 kalemin 3'ü ölü/kapalı,
1'i (webhook secret) canlı ama etkisi "sayfa cache'ini tazelet" ile sınırlı.

---

## 2. Bulgular ve KANITLARI

| # | Sır | Geçmişte | Canlılık testi | Verdikt |
|---|---|---|---|---|
| 1 | Supabase access token `sbp_05659fab…a94f` (44 kr) | 2025-12-01 … 12-03, 2 commit | `GET api.supabase.com/v1/projects` → **HTTP 403** | ✅ **ÖLÜ** — iptal edilmiş |
| 2 | GitHub klasik PAT `ghp_NfxM89k0…ugCG` (40 kr) | 2025-12-01 … 12-03, 2 commit | `GET api.github.com/user` → **HTTP 401** | ✅ **ÖLÜ** — iptal edilmiş |
| 3 | OpenRouter `sk-or-v1-e64aed…94e2` (73 kr) | 2026-04-08, 1 commit | OpenRouter otomatik iptal etti; **Recep tam değeri birebir karşılaştırıp teyit etti** (2026-08-15) | ✅ **KAPANDI** |
| 4 | Supabase webhook secret `whsec_venthub_…` (46 kr) + kısa ikinci değer | `supabase/baselines/2026-08-13_public_schema.sql:1887` — **HEAD'de, takip edilen dosyada** | test edilmedi (canlı kabul) | 🟡 **AÇIK — düşük etki** |

### Temiz çıkanlar (yeniden aranmasına gerek YOK)
`service_role` JWT · GitHub fine-grained PAT · GitHub OAuth/Server token · Google/Gemini (`AIza`) ·
Slack webhook · Slack bot token · Resend · Twilio (AC/SK SID) · Anthropic · OpenAI ·
özel anahtar blokları (`BEGIN … PRIVATE KEY`) · Cloudflare API token · `E2E_ADMIN_PASSWORD` · Jules API key.

> **`service_role` özellikle önemli:** daha önceki bir notta *"sızan service_role"* yazıyordu ve
> buna dayanarak "Supabase legacy anahtar geçişi" iş olarak açılmıştı. **Ölçüm bunu çürüttü:**
> anahtarı bilmeye gerek kalmadan payload imzasıyla arandı
> (`InNlcnZpY2Vfcm9sZSI` = base64 `"service_role"`) → **0 commit**. O iş kalemi **düştü**.

### Yanlış-pozitif olarak elenenler
`tests/e2e/*.test.ts` içindeki `eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.anon` — kırpılmış **sahte
stub**, gerçek anahtar değil. Betik `test|mock|dummy|example|placeholder|fake|sample|REMOVED`
desenlerini ayıklıyor.

---

## 3. Zaten kapanmış olan iki şey (tekrar açılmasın)

- **Superuser DB şifresi:** 2026-08-15'te Recep **yeniden rotate etti**. HEAD'de sabit-kodlu şifre
  YOK — kalan tüm `postgres://` satırları `${password}` şablonu, değer env'den geliyor.
- **Geçmiş temizliği:** **zaten yapılmış.** `.git/filter-repo/` mevcut, **2026-06-07**'de koşmuş;
  23 commit'te `***REMOVED***` yer tutucusu duruyor. Bu borç ödenmişti ve bilmiyorduk.

---

## 4. Public yapma kararı — karar verirken bakılacak yer

**2026-08-15 itibarıyla teknik engel yok.** Tek canlı sır (whsec) düşük etkili ve zaten
düzeltme kuyruğunda. Karar teknik değil, ticari/mahremiyet eksenine kaydı.

Public'in **teyit edilmiş** getirisi: GitHub Actions **public repolarda ücretsiz ve sınırsız**;
private repoda dakika ölçülüyor ve 2026-08-15'te hesap iş başlatmayı reddetti
(*"recent account payments have failed or your spending limit needs to be increased"*, koşu
`31871474549`, **sıfır adım** çalıştı).

Public'in alternatifi **self-hosted runner**: özel repoda ücretsiz/sınırsız, ama makinenin açık
olmasını ve CPU'sunu gerektirir; **public repoda kullanılmamalı** (fork PR'ı yabancı kodu senin
makinende çalıştırır).

> ⚠️ Görünürlük değişimi **tek yönlü kapıdır** — geri alındığında klonlar ve arşivler dışarıda kalır.
> Bu yüzden bu belgenin tarihi önemli: **bu tarihten SONRA** commit'lenmiş bir sır varsa bu denetim
> onu kapsamaz. Görünürlük değiştirmeden önce betiği **yeniden koş**.

### 4.1 Bulgu #4 (whsec) — kapanış durumu ve ROTASYON SIRASI

**2026-08-16 · Kod tarafı KAPANDI (T031-VH).** Ölçüldü: `public.handle_supabase_webhook()`
gövdesinde `webhook_secret text := '<düz metin>'` satırı duruyordu ve bu fonksiyon tanımı
baseline SQL'e de girmişti. Yapılanlar:

- `20260816160245_webhook_secret_to_vault.sql` — sır Vault'a taşındı, fonksiyon
  `vault.decrypted_secrets`'ten okuyor. **Sır migration dosyasında YAZILI DEĞİL:**
  değeri veritabanı kendi fonksiyon tanımından okuyup aktarır; dosya sırrı hiç görmez
  (yazsaydık sorunu çözmek yerine yeniden üretirdik — dosya da public repoya gider).
  Taşıma **fail-closed**: sır çıkarılamazsa migration durur. Sessizce devam etseydi
  fonksiyon Vault'u okumaya geçer, Vault boş olur ve **sayfa yenileme sessizce ölürdü.**
- `/api/webhook/supabase` — rotasyon penceresi (`SUPABASE_WEBHOOK_SECRET_NEXT`).
- INV-WEBHOOK-1 — kapı statik taramadan **davranışsal** teste yükseltildi (gerçek istek,
  gerçek yanıt) + **R2**: kaynakta düz-metin `whsec_` literali yasak.

> **Bu bir TAŞIMA'dır, ROTASYON DEĞİL.** Değer aynı kaldığı için kesinti yoktur; ama sır
> hâlâ deponun GEÇMİŞİNDE okunabilir. Gerçek kapanış aşağıdaki rotasyondur — **Recep'e ait.**

**Rotasyon sırası (bu sırayla — yanlış sıra sayfa yenilemeyi sessizce durdurur):**

1. Yeni bir değer üret (ör. `openssl rand -hex 24`, başına `whsec_`).
2. **Vercel** → `SUPABASE_WEBHOOK_SECRET_NEXT` = yeni değer (eskiye DOKUNMA) → deploy.
   Artık iki değer de kabul ediliyor.
3. **Supabase** → Vault'taki `supabase_webhook_secret` kaydını yeni değerle güncelle
   (`vault.update_secret`). DB artık yeni değeri gönderiyor, Vercel onu tanıyor.
4. **Doğrula:** bir ürünü admin'den güncelle → PDP'nin tazelendiğini gör. Bu adım
   atlanamaz; arıza sessizdir (yenileme durursa kimse fark etmez, vitrin bayatlar).
5. **Vercel** → `SUPABASE_WEBHOOK_SECRET` = yeni değer, `SUPABASE_WEBHOOK_SECRET_NEXT`'i SİL
   → deploy. Pencere kapandı, eski değer artık hiçbir yerde geçerli değil.

**Kalan (Recep):** yukarıdaki 5 adım. Kod tarafında yapılacak bir şey yok.

---

## 5. Bu denetim nasıl tekrarlanır

```bash
python scripts/security/secret-scan.py
```

Çıktı: konsola **maskeli** özet, `TAM-RAPOR.txt`'ye tam değerler.
Rapor `.gitignore`'da — commit edilemez, ama yine de kontrol edip **sil**.

> **Betik 2026-08-15'te repoya alındı.** Önceden yalnız `C:/Users/alize/venthub-secret-tarama/`
> altında duruyordu; yani bu belgenin "nasıl tekrarlanır" yordamı **tek makinede** çalışıyordu
> ve taze bir klon denetimi yineleyemezdi. Ölçümü betiğe dönüştürüp betiği repo dışında
> bırakmak, ölçümü hiç betiğe dönüştürmemekle aynı kapıya çıkar (aynı sınıf: `.git/hooks`).
> Port doğrulandı: yeni yol, orijinalle **birebir aynı 5 değeri** buldu.
Bulunan bir token'ın hâlâ geçerli olup olmadığını **tahmin etme, çağır**:

```
Supabase : GET https://api.supabase.com/v1/projects   Authorization: Bearer <sbp_…>
GitHub   : GET https://api.github.com/user            Authorization: Bearer <ghp_…>
401/403 = ölü · 200 = CANLI
```

Yeni bir sır türü eklemek için `scan.py` içindeki `SIGS` listesine
`(ad, git -S için sabit dize, tam değeri çıkaran regex)` üçlüsü ekle.

---

## 6. Metodolojik dersler (asıl kalıcı kısım)

1. **"Geçmişte var" ≠ "hâlâ geçerli".** Bu denetimde 4 bulgunun 3'ü ölü çıktı. Canlılık testi tek
   HTTP çağrısı; yapılmadan kullanıcıya rotasyon işi çıkarmak **iki kez** yapıldı (OpenRouter, sonra
   `sbp_`+`ghp_`) ve ikisinde de gereksizdi.
2. **"Yetkisi fazla" ≠ "sızmış".** Klasik PAT'in geniş kapsamlı olması bir *hijyen* sorunudur;
   ifşa edilmedikçe *güvenlik olayı* değildir. İkisini aynı cümlede birleştirmek yanlış aciliyet üretir.
3. **Güvenlik gerekçesiyle iş açmadan önce ifşayı KANITLA.** Aksi hâlde çürük gerekçe, kalıcı
   nota dönüşüp aylarca gerçek sanılıyor (`service_role` vakası).
4. **Ölçüm betiğe dönüşmezse tartışma geri gelir.** Bu dosyanın varlık sebebi budur.

İlişki: `docs/standards/edge-function-security-standard.md` ·
`.claude/skills/venthub-20-eksen-denetimi/references/kapanmis-bulgular.md`
