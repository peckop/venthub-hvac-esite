# Lansman öncesi dayanıklılık planı — 2026-09-08

> **Durum:** PLAN (Recep: "sen istiyorsan yap", 2026-09-08). Kod değişikliği içermez; her madde ayrı
> iş emri olur. **KAYNAK/CETVEL:** `execution-method-standard.md` (yöntem satırları) ·
> `collaboration-protocol.md` (şerit) · `rendering-cache-standard.md` (sessiz arıza vakası) ·
> `supabase-security` (RLS) · **cetvel yok** "dayanıklılık / olay yönetimi" için — bu plan o
> cetvelin ilk taslağıdır; kabul edilirse `docs/standards/dayaniklilik-standard.md` olur.
> **YÖNTEM:** plan elle; uygulama maddelerinde satır satır. Migration yok → plan-challenger
> zorunlu değil, ama 3 ve 6 kod dokunduğu için emir açılırken koşulur.

## Niçin bu plan

2026-09-08 ölçümü (`git grep` + workflow listesi, tahmin değil):

| Kalem | Durum | Kanıt |
|---|---|---|
| Yedekten geri dönüş tatbikatı | **YOK** | hiçbir belgede yok |
| Sessiz arıza alarmı (iş sinyali) | **YOK** | Sentry yalnız hata görür; 2026-08-15 fiyat vakası hiçbir kapıya görünmedi |
| Olay defteri (runbook) | **YOK** | bilgi Recep'te ve dağınık belgelerde |
| Hız sınırı (Edge) | Kısmen | `_shared/rate_limit.ts`; yalnız apply-coupon, iyzico-payment, shipping-status |
| Harici uptime izleme | YOK | `ssr-duman-alarmi.yml` var (SSR gövdesi), dışarıdan erişim izleme yok |
| RLS DB-düzeyi testi | Kısmen | konformans testi kapsamı sayıyor; "bu kullanıcı bu satırı göremez" testi yok |
| Bağımlılık taraması | Kısmen | `jules-security-audit.yml`; Dependabot yok |
| Staging ortamı | Belirsiz | strix ve yük testi için ön koşul |
| Dinamik pentest / yük testi / mutasyon testi | YOK | Stryker, k6, fast-check yok |
| WAF | YOK | |

**Sıralama ilkesi:** geri alınamazlık → sessizlik → tek operatör riski → saldırı yüzeyi → ölçüm araçları.

## Maddeler (her biri bir iş emri)

### 1. Yedekten geri dönüş tatbikatı — İLK
- **Niçin ilk:** listedeki tek geri alınamaz arıza. "Supabase yedekliyor" varsayım; hiç ölçülmedi.
- **Ne:** Supabase panelinde yedek/PITR durumunu oku → test projesine (ya da branch) geri yükle →
  ürün sayısı (374 beklenen), fiyat satırı (1044), son 10 sipariş, RLS politikaları, Edge sırları
  karşılaştır → süre ve adımları yaz.
- **Çıktı:** `docs/audits/yedek-tatbikati-<tarih>.md`: RTO (kaç dakikada döneriz), RPO (kaç
  dakikalık veri kaybı), takılan adımlar, tekrar aralığı (öneri: 3 ay).
- **YÖNTEM:** elle, Recep + bir şerit; prod'a DOKUNMAZ. **Süre:** yarım gün.

### 2. Sessiz arıza alarmı
- **Niçin:** kod çalışırken iş durabiliyor (fiyat vakası). Sentry susar.
- **Ne:** üç iş sinyali, tek cron (mevcut `*-cron.yml` deseni), eşik aşımında e-posta/WhatsApp
  (Resend/Twilio zaten var): (a) 24 saatte sıfır sipariş ve sıfır teklif · (b) `display_price > 0`
  ürün sayısı bir önceki güne göre %10+ düştü · (c) checkout 1. adıma gelen / 3. adıma geçen oranı
  7 günlük ortalamanın yarısının altına indi. Eşikler ilk ay ölçülüp ayarlanır.
- **Çıktı:** `supabase/functions/is-sinyali-alarmi` + workflow + `docs/standards/` alarm satırı.
- **YÖNTEM:** tek şerit, plan-challenger (Edge kısıtı + tenant-scope), migration yoksa doğrudan PR.

### 3. Olay defteri (runbook)
- **Niçin:** tek operatör; gece ikide ödeme düşerse ilk beş dakika kimsede yazılı değil.
- **Ne:** tek sayfa, senaryo başına 5-8 adım: ödeme düşük (İyzico) · sipariş takılı (webhook
  gelmedi) · vitrin boş (ISR/önbellek) · admin açılmıyor · DB erişilemiyor · sır sızdı. Her
  senaryoda: belirti → ilk kontrol (hangi log) → geçici çözüm → kalıcı çözüm → kimi ara.
- **Çıktı:** `docs/standards/olay-defteri.md`; ilk tatbikat: bir senaryoyu masabaşı oyna, süre yaz.
- **YÖNTEM:** elle; NotebookLM ikizine sync (milestone).

### 4. Hız sınırını tüm Edge fonksiyonlarına yay
- **Ne:** `_shared/rate_limit.ts` → kalan fonksiyonlar; kimlikli uçlarda kullanıcı, anonim
  uçlarda IP anahtarı; eşikler fonksiyon başına tabloda.
- **YÖNTEM:** **maestro** (aynı değişiklik çok hedefe) + `security-reviewer`.

### 5. Harici uptime izleme
- **Ne:** dışarıdan dakikada bir `/tr`, bir ürün sayfası, `/api/health` (yoksa eklenir); 2 ardışık
  hata → alarm. Ücretsiz katman yeter (Vercel checks ya da bağımsız servis; karar Recep'in).
- **YÖNTEM:** elle; 1 saat.

### 6. RLS'in DB düzeyinde testi
- **Ne:** pgTAP ya da `supabase test db`: her tenant-scoped tablo için "A kullanıcısı B'nin
  satırını göremez/yazamaz" testi; CI'da koşar. Mevcut konformans testi kapsamı sayar, bu davranışı
  ölçer.
- **YÖNTEM:** tek şerit, plan-challenger ZORUNLU (test şeması migration ister).

### 7. Staging + dinamik pentest (strix)
- **Ön koşul:** staging (Vercel preview + Supabase branch, prod anahtarsız, test İyzico).
- **Ne:** strix staging'e, Recep'in yazılı iziyle, `docs/audits/pentest-<tarih>.md`; bulgular
  şiddetle emir olur. **Prod'a ASLA.** Lansmandan önce bir kez, sonra ödeme/auth değişimlerinde.
- **YÖNTEM:** elle + security-reviewer; LLM token maliyeti önceden yazılır.

### 8. Yük testi (k6, staging)
- **Ne:** sepet/checkout ve kategori listeleme; hedef: 50 eşzamanlı kullanıcıda p95 < 2 sn,
  hata 0. Sonuç ISR/önbellek cetveline geri beslenir.

### 9. Test kalitesi ölçümü
- **Ne:** Stryker ile fiyat motoru + durum makineleri (sipariş/iade) + `order-validate`; mutant
  hayatta kalma oranı yazılır. fast-check ile "tutar sunucudan gelir", "durum geri gitmez"
  özellikleri. 790 testin kaçının gerçek hata yakaladığı ilk kez ölçülür.

### 10. Mekanizma budaması (üç ayda bir)
- **Ne:** son 30 günde hiç tetiklenmeyen hook, hiç çağrılmayan skill, hiç okunmayan cetvel;
  `task-observer` "sadeleştirme" gözlemleriyle birleştirilir; silme kararı Recep'in.
- **Niçin:** 70 skill + 18 hook + pano; ekleme ölçülüyor, silme ölçülmüyor (2026-09-08 tespiti).

## Kapsam dışı (bilinçli)
WAF (lansman sonrası trafik ölçülünce) · hata ödül programı (staging + runbook olmadan erken) ·
headroomlabs sıkıştırma (kayıplı) · claude-mem (ayrı deneme planı var).

## Sonraki adım
Recep onayı → 1 ve 3 doğrudan emir (kod yok) → 2, 4 emir + plan-challenger → 5 → 6-9 staging
kurulunca. Her emirde KAYNAK/CETVEL bloğu bu belgeyi gösterir.
