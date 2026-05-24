# 🌡️ CİLT 5: HVAC DOMAIN BİLGİSİ, ENTEGRASYONLAR VE YERELLEŞTİRME (DOMAIN KNOWLEDGE)

Bu kitap, VentHub HVAC e-ticaret platformunun mühendislik hesaplayıcı formüllerini (debi, hava perdeleri, jet fanlar, ERV/HRV standartları), WhatsApp & SMS entegrasyon ayarlarını, Resend e-posta şablonlarını ve iki dilli (TR/EN) SEO / i18n kılavuzlarını barındırır.

---

# VentHub Bilgi ve Kılavuz Merkezi — Gelişmiş Mimari ve Hesaplayıcı Planı
> **Status: 🚧 PARTIALLY ACTIVE (Jan 2026)**
> Hesaplayıcı arayüzleri (`src/pages/calculators`) mevcuttur. Hesaplama motoru (v2) geliştirmeleri backlog'dadır.


Amaç
- Kullanıcıyı (tüketici + teknik) kafasında soru bırakmadan doğru ürüne yönlendirmek.
- Bilimsel gerçekliğe uygun, sahada kullanılan “ön-boyutlandırma (v1)” + “mühendislik (v2)” hesaplayıcıları.
- VentHub e‑ticaret mimarisi (bkz. WARP.md) ile tam uyum: bilgi → hesapla/seç → filtreli ürün listesi → ürün → teklif.

1) Bilgi Mimarisi (hub‑and‑spoke)
- Hub: /destek/merkez
  - Özet kartlar (Hava Perdesi, Jet Fan, HRV) → konu sayfaları
  - E‑ticaret SSS kısaltmaları, İndirme Merkezi, Sözlük (ileride)
- Konu sayfaları: /destek/konular/{slug}
  - Şablon: Kısa cevap (tüketici), 3 adımda seçim, teknik özet (mühendis), örnek senaryo, mikro SSS, Çift CTA
- Hesaplayıcılar: /destek/hesaplayicilar/{slug} (v1→v2 evrimi)
- Ürün Seçici (wizard): /destek/secici (v2)
- E‑ticaret SSS: /destek/sss
- İndirme Merkezi & Sözlük: /destek/indir, /destek/sozluk (v3)

2) Bölge Profili ve Standart Eşleşmesi
- Profil seçimi: EU / US (kullanıcı seçimi veya geoloc) → varsayılan katsayılar ve sınırlar o profile göre gelir.
- EU/UK başlıca referanslar
  - EN 16798‑1 (IAQ/OA debileri), EN 308 (HRV eşanjör test), EN 13053 (AHU), ISO 12759 (FEI/enerji), EN ISO 5801 (fan test), ISO 5136 (ses), ISO 27327 (air curtain), BS 7346‑7 (otopark jet fan), EN 12101 (duman).
- US başlıca referanslar
  - ASHRAE 62.1 (OA), AHRI 1060 + ANSI/ASHRAE 84 (ERV/HRV derecelendirme/test), AMCA 210/ASHRAE 51 (fan), ANSI/AMCA 208 (FEI), AMCA 300 (ses), NFPA 88A/92 (otopark/duman), AMCA 220 (air curtain).

3) Hesaplayıcılar (v1 → v2)
3.1 HRV/ERV — Debi ve Isı Geri Kazanımı
- v1 (ön‑boyutlandırma)
  - Girdiler: Kişi sayısı/alan, kişi başı OA (25–40 m³/h·kişi), T_dış/T_iç, verim η (%), SFP, HSP hedef.
  - Çıktılar:
    - Debi Q [m³/h]; ısı geri kazanım Q_th [kW] ≈ η · ρ · c_p · (Q[m³/s]) · ΔT / 1000
    - Tahmini elektrik P_el ≈ SFP · Q[l/s]
  - Standart notu: EU→EN 16798‑1, EN 308; US→ASHRAE 62.1, AHRI 1060/ASHRAE 84
  - Uyarı: “Ön boyutlandırmadır; proje doğrulaması gerekir.”
- v2 (mühendislik)
  - Psikrometri (kuru/yaş termometre, mutlak nem), duyulur/gizli ısı ayrıştırma
  - Eşanjör tipine göre etkinlik (ε‑NTU yaklaşımı, üretici verisi)
  - Akustik/filtre sınıfı etkisi (özet)
  - FEI/etiket kıyası (ISO 12759 / AMCA 208)

3.2 Hava Perdesi — Hız/Debi/Isıtma
- v1
  - Girdiler: W (genişlik), H (yükseklik), v_nozül hedef (7–9 m/s), zeminde 2–3 m/s hedef, ΔT (opsiyonel)
  - Çıktılar: Q ≈ v_nozül · W · a_nozül (nozül açıklığına göre), P_ısı ≈ ρ·c_p·Q·ΔT
  - Standart notu: EU→ISO 27327; US→AMCA 220
- v2
  - Kapı rüzgârı/termal çekiş etkisi için güvenlik katsayısı
  - Giriş holü/döner kapı özel durumları
  - Enerji karşılaştırması (kapı açık/kapı+perde)

3.3 Jet Fan — Otopark Ön‑Boyutlandırma (Debi ve Yerleşim)
- v1
  - Girdiler: L×W×H, V, ACH hedef (6–10 tipik), egzoz/temiz hava noktaları
  - Çıktılar: Q_total = V · ACH, zon/aks önerisi, fan adedi yaklaşımı (kapsama esası), sensör örnek yerleşimi
  - Standart notu: EU/UK→BS 7346‑7, EN 12101; US→NFPA 88A, NFPA 92
- v2
  - Fan eğrisi + sistem eğrisi kesişimi (Δp = k·Q²), itme kuvveti (N) → üretici eğrisi
  - Yangın senaryosunda yön/sürükleme kontrolü, BMS entegrasyonu

3.4 Kanal — Hız ve Tahmini Basınç Kaybı
- v1
  - Girdiler: Q (m³/h), kanal tipi/ebadı/uzunluğu, hedef hız aralığı
  - Çıktılar: v = Q/A; Δp ≈ f · (L/D) · (ρ·v²/2) + yerel kayıplar (muhafazakâr katsayılı)
  - Standart notu: ASHRAE Fundamentals / CIBSE rehberleri (yaklaşım)
- v2
  - Friction factor (Moody), fitting K değerleri; sistem eğrisi k katsayısı çıkarımı
  - Gürültü/akustik özet

3.5 (v2) Fan Eğrisi Motoru
- Girdi: Üretici CSV/JSON (Q–Δp–η–P), hız/kademeler
- Sistem eğrisi: Δp = k·Q² (tasarım noktasından k), hız değişimlerinde fan affinities (Q∝N, Δp∝N², P∝N³)
- Kesişim çözümü: bisection/newton; çıktı: Q, Δp, η, P, uyarılar (NPSH/akustik)
- Standart notu: EN ISO 5801/AMCA 210 (test), ISO 12759/AMCA 208 (FEI)

4) Arayüz (React) ve Deneyim
- Her hesaplayıcı: “Hızlı” (tüketici) / “Gelişmiş” (teknik) sekmeleri
- Sonuç kartı: birimler net, kısa formül görünümü, “Standart referansı” (2–3 madde), “Ürünleri göster” (filtreli URL), “Teklif Al”
- Paylaşılabilir link (girdiler querystring); i18n (TR/EN); erişilebilirlik; analytics (calc_start, calc_result, to_products, to_quote)
- Görsel/etkileşim: hafif motion (framer‑motion), reduced‑motion’a saygı; hesap sonuçlarına “öneri çipi” (ör. “HRV 400–600 m³/h”)

5) E‑ticaret ile Eşleme (WARP.md uyumu)
- Ürün listesi filtre eşlemeleri (örnek)
  - HRV: airflow_min≤Q≤airflow_max, recovery_type, efficiency_class, HSP
  - Hava Perdesi: width≈W, heating=none/electrical/water, nozzle_velocity class
  - Jet Fan: thrust≥N, reversible=true/false, voltage, protection
  - Kanal fanı: airflow, Δp/HSP aralığı
- URL örneği: /products?application=jet-fan&thrust_min=50&reversible=true
- CTA her zaman çift: “İlgili ürünlere git” ve “Teklif Al”
- Uygulama: PDP ve Kategori sayfalarında konuya bağlanan “İlgili Rehber” linkleri canlıdır (slug eşleme ile).

6) Birimler ve Varsayımlar
- ρ=1.2 kg/m³, c_p=1.005 kJ/kg·K (varsayılan); profil ve psikrometri ile güncellenebilir
- ΔT, ACH, verim aralıkları profil ve konuya göre hazır setlerden seçilir
- Tüm hesaplayıcıların altında “Varsayımlar ve sınırlar” kısa bloğu

7) Kabul Kriterleri (v1)
- Hesap girdileri validasyonlu (boş/negatif yok, aralık ipuçları)
- EU/US profili değiştiğinde varsayılanlar güncellenir; sonuç farkı anlaşılır
- Sonuçtan ürün listesine geçişte doğru filtre uygulanır (en az 1 isabet kontrolü)
- Standart referansları görünür (2–3 madde), dipnotta “ön boyutlandırma” uyarısı
- Analytics event’leri tetiklenir; link paylaşımı girdileri geri yükler

8) Yol Haritası
- Sprint 1: Hub + 3 konu sayfası (Hava Perdesi, Jet Fan, HRV) + v1 hesaplayıcılar + ürün filtre eşlemeleri
- Sprint 2: Ürün Seçici (wizard) + konu sayfalarına bağlama
- Sprint 3: Fan Eğrisi Motoru (v2) + sistem eğrisi + kesişim + FEI görünümü
- Sprint 4: İndirme Merkezi, Sözlük, ek konu sayfaları

9) Risk ve Azaltım
- Aşırı basitleştirme → v2 ile derinleştirme; hesaplayıcı altında varsayım şeffaflığı
- Ürün datası eksikliği → minimum alan seti ile filtre (airflow, thrust, type), eksiklerde “yakın eşleşme” etiketi
- Mobil deneyim → tek sütun, sticky sonuç kartı, input ipuçları

10) Kısa Referans Listesi
- EU/UK: EN 16798‑1, EN 308, EN 13053, EN ISO 5801, ISO 12759, ISO 5136, ISO 27327, BS 7346‑7, EN 12101
- US: ASHRAE 62.1, AHRI 1060, ANSI/ASHRAE 84, AMCA 210/ASHRAE 51, ANSI/AMCA 208, AMCA 300, NFPA 88A/92, AMCA 220



---

# 📱 WhatsApp & SMS Bildirim Sistemi Kurulum Rehberi

## 🎯 Genel Bakış

Bu rehber VentHub için WhatsApp ve SMS bildirim altyapısının nasıl kurulacağını açıklar. Sistem şu anda **hazır durumda** ancak kurumsal numara ve Twilio hesabı gereklidir.

## 📋 Mevcut Durum

✅ **HAZIR OLAN:**
- WhatsApp bildirim altyapısı (Edge Functions)
- SMS bildirim altyapısı
- Stok uyarı sistemi
- Template yönetimi
- Idempotency koruması
- Çoklu kanal desteği

❌ **EKSİK OLAN:**
- Kurumsal telefon numarası
- Twilio hesabı
- WhatsApp Business onayı
- Environment variables

## 🚀 Kurulum Adımları

### 1. Twilio Hesabı Oluşturma
```bash
1. https://twilio.com adresine git
2. "Sign up" ile hesap oluştur
3. Console'dan Account SID ve Auth Token'ı al
```

### 2. WhatsApp Sandbox Kurulumu (Test için)
```bash
1. Twilio Console > Messaging > WhatsApp sandbox
2. Sandbox number'ı kaydet: whatsapp:+14155238886
3. Test telefonunu sandbox'a ekle
```

### 3. Kurumsal Numara Onayı (Production için)
```bash
1. WhatsApp Business API başvurusu yap
2. Meta Business hesabı oluştur
3. Numara doğrulama işlemini tamamla
4. Twilio ile WhatsApp Business entegrasyonu
```

### 4. Environment Variables Ayarlama
```bash
# Supabase Dashboard > Settings > Edge Functions > Environment Variables

TWILIO_ACCOUNT_SID=AC...
TWILIO_AUTH_TOKEN=...
TWILIO_WHATSAPP_NUMBER=whatsapp:+14155238886  # Test için
TWILIO_PHONE_NUMBER=+905551234567  # Kurumsal numara
RESEND_API_KEY=re_...  # Email için
STOCK_ALERT_RECIPIENTS=[{...}]  # JSON konfigürasyon
```

## 📧 E-mail Konfigürasyonu

### Resend.dev Kurulumu
```bash
1. https://resend.com hesabı oluştur
2. Domain doğrulama yap
3. API Key al ve environment variable'a ekle
```

## 🔧 Test Etme

### WhatsApp Test
```bash
curl -X POST https://your-project.supabase.co/functions/v1/notification-service \
  -H "Authorization: Bearer YOUR_SERVICE_ROLE_KEY" \
  -H "Content-Type: application/json" \
  -d '{
    "type": "whatsapp",
    "to": "whatsapp:+905551234567",
    "message": "Test mesajı",
    "priority": "medium"
  }'
```

### SMS Test
```bash
curl -X POST https://your-project.supabase.co/functions/v1/notification-service \
  -H "Authorization: Bearer YOUR_SERVICE_ROLE_KEY" \
  -H "Content-Type: application/json" \
  -d '{
    "type": "sms",
    "to": "+905551234567",
    "message": "Test SMS mesajı",
    "priority": "high"
  }'
```

### Stok Uyarı Test
```bash
curl -X POST https://your-project.supabase.co/functions/v1/stock-alert \
  -H "Authorization: Bearer YOUR_SERVICE_ROLE_KEY" \
  -H "Content-Type: application/json" \
  -d '{
    "productId": "dcb242f3-f56c-4c3f-8c39-246552c4d403"
  }'
```

## 📊 Stok Uyarı Konfigürasyonu

### Threshold Ayarlama
```sql
-- Tüm ürünler için genel eşik
UPDATE products SET low_stock_threshold = 5;

-- Belirli ürün için özel eşik
UPDATE products 
SET low_stock_threshold = 10 
WHERE name LIKE '%Critical Product%';
```

### Recipients Konfigürasyonu
```json
[
  {
    "name": "Stok Yöneticisi",
    "phone": "+905551234567",
    "email": "stok@venthub.com",
    "whatsapp": "+905551234567",
    "role": "manager",
    "notifications": {
      "low_stock": true,
      "out_of_stock": true,
      "sms": true,
      "whatsapp": true,
      "email": true
    }
  }
]
```

## 🔐 Güvenlik ve Maliyet

### Maliyet Tahmini
- **WhatsApp**: ~$0.0065 per mesaj
- **SMS**: ~$0.0075 per mesaj  
- **Email**: Ücretsiz (ilk 100/gün)

### Güvenlik
- ✅ Environment variables ile gizli bilgi koruması
- ✅ Service Role Key yetkilendirmesi
- ✅ Rate limiting (Twilio tarafında)
- ✅ Idempotency koruması

## 📈 Monitoring ve Logging

### Logları Görüntüleme
```bash
# Supabase Dashboard > Edge Functions > Logs
# Başarılı/başarısız bildirimleri takip edebilirsiniz
```

### Metrics
- Günlük mesaj sayısı
- Başarı oranı
- Error rate
- Response time

## 🛠️ Troubleshooting

### Yaygın Sorunlar
1. **"WhatsApp configuration missing"**: Environment variables eksik
2. **"Phone number not verified"**: WhatsApp sandbox'a numara eklenmemiş  
3. **"Rate limit exceeded"**: Çok fazla mesaj gönderilmiş, bekleme gerekli

### Debug Yöntemleri
```bash
# Edge Function loglarını kontrol et
# Network bağlantısını test et
# API key'lerin geçerliliğini kontrol et
```

## 🔄 Kurumsal Numara Geçişi

### Hazırlık Listesi
- [ ] WhatsApp Business API onayı
- [ ] Meta Business hesabı
- [ ] Kurumsal telefon numarası
- [ ] Domain doğrulaması
- [ ] Environment variables güncelleme

### Geçiş Adımları
1. Production ortamında test
2. Environment variables güncelle
3. Sandbox'dan kurumsal numaraya geçiş
4. End-to-end test
5. Kullanıcılara duyuru

## 📞 Destek

Kurulum sırasında sorun yaşarsanız:
- Edge Function loglarını kontrol edin
- Test endpoint'lerini kullanın
- Environment variables'ı doğrulayın

**Sistem tamamen hazır, sadece hesap kurulumu ve konfigürasyon gerekli!** 🚀


---

# Email Templates (Shipping + Order Confirmation)

Last updated: 2025-09-16

Purpose
- Define a consistent, branded HTML template for shipping emails.
- Document how emails are generated today and how we will migrate to file-based templates when the corporate domain is ready.

Current implementation (today)
- Sender: EMAIL_FROM (fallback retry with "VentHub Test <onboarding@resend.dev>" if domain not verified)
- Generator: shipping-notification Edge Function builds a simple inline HTML string.
- Recipient derivation: Auth Admin API with service-role; no dependency on admin_users view.
- Resend integration: direct POST to https://api.resend.com/emails with RESEND_API_KEY; BCC supported via SHIP_EMAIL_BCC.
- Test flags: EMAIL_TEST_MODE / EMAIL_TEST_TO; NOTIFY_DEBUG for safe server logs.

Planned implementation (file-based templates)
- Status: INITIALIZED (template file added and code reads it if present)
- Template path: templates/email/shipping.html (see placeholder below)
- Placeholders:
  - {{customer_name}}
  - {{order_number}} (pretty format, e.g., #ABCD1234)
  - {{carrier}}
  - {{tracking_number}}
  - {{tracking_url}} (optional)
  - {{brand_name}}, {{brand_primary_color}}, {{brand_logo_url}} (branding)
- Strategy options:
  1) Simple string replace in Edge Function (no new deps)
  2) Tiny template helper (e.g., Mustache) bundled into the function
- Styling: Use inline CSS for email client compatibility. Avoid external CSS.

Testing checklist
- Sandbox: set EMAIL_TEST_MODE=true and EMAIL_TEST_TO=delivered@resend.dev, then trigger shipping.
- Production-like: set EMAIL_TEST_MODE=false and use onboarding@resend.dev until domain is verified.
- Verify in Resend > Emails: check To, Subject, Delivered status.

Migration steps when corporate email is ready
1) Resend > Domains: add and verify domain (SPF/DKIM per Resend instructions)
2) Update environment:
   - EMAIL_FROM="<Brand Name> <no-reply@yourdomain.com>"
   - EMAIL_TEST_MODE=false
3) Optional: switch shipping-notification to load and render templates/email/shipping.html instead of inline HTML.
4) Add brand logo URL and colors to the template (see comments inside HTML file).

Notes
- Keep RESEND_API_KEY only in Supabase Functions env (never in repo).
- Keep the plain-text part (text) in addition to HTML for deliverability and a11y.

Order Confirmation (Payment Success)
- Status: UPDATED (copy clarified in Turkish)
- Sender: EMAIL_FROM (same policy as shipping)
- Generator: order-confirmation Edge Function builds an inline HTML string (text fallback included).
- Copy (tr): Ödemeniz başarıyla alınmıştır. Siparişiniz kargoya hazırlanmaya alınacaktır. Sipariş detaylarını aşağıda bulabilirsiniz.
- Placeholders:
  - {{customer_name}}
  - {{order_number}}
  - {{order_date}}
  - {{payment_method}}
  - {{shipping_address}} (optional summary)
  - {{brand_name}}, {{brand_primary_color}}, {{brand_logo_url}}
- File-based template (optional, future): templates/email/order-confirmation.html (similar strategy to shipping template)
- Testing: trigger order-confirmation after a successful payment in sandbox; verify Delivered in Resend dashboard.

Related docs
- docs/DEPLOYMENT.md → Resend env vars and flows
- docs/ROADMAP.md → E‑posta / Bildirim altyapısı
- docs/CHANGELOG.md → 2025-09-16 entry


---

# SEO ve i18n Standartları (VentHub)
> **Status: ✅ ACTIVE & VERIFIED (Jan 2026)**
> Proje genelinde dil ve SEO standartları bu belgeye göre yapılandırılmıştır.


Son güncelleme: 2025-09-19

Bu belge; dil ve SEO metadatalarının uygulama genelinde nasıl üretildiğini ve geliştirici rehberini içerir.

## 1) HTML lang ve yön
- I18nProvider, `document.documentElement.lang` özniteliğini anlık dile göre günceller (`tr` veya `en`).
- `dir` LTR olarak sabitlenmiştir.

## 2) Hreflang Alternates
- Seo bileşeni her sayfa render’ında (başlık/açıklama/canonical değişiminde) şu link etiketlerini üretir:
  - `rel="alternate" hreflang="tr-TR"` → URL + `?lang=tr`
  - `rel="alternate" hreflang="en-US"` → URL + `?lang=en`
  - `rel="alternate" hreflang="x-default"` → dil parametresi olmadan canonical URL
- İleride /tr, /en yol ön eki stratejisine geçilirse aynı mantık base path’lerle uygulanır.

## 3) Open Graph / Twitter
- `og:title`, `og:description`, `og:type`, `og:url`, `og:image`, `og:site_name` ve `og:locale` dinamik.
- `og:locale:alternate`: mevcut dil dışındaki diller (tr_TR/en_US) meta olarak eklenir.
- `twitter:card`, `twitter:title`, `twitter:description`, `twitter:image` dinamik.

## 4) Para ve Tarih Formatı
- Para: `formatCurrency(value, lang, options)` TRY bazlı; dil sadece biçim içindir.
- Tarih/Saat: `formatDate(input, lang)`, `formatDateTime(input, lang)`, `formatTime(input, lang)`.
- Kullanım rehberi:
  - Görsel UI: her yerde helper kullanın; `toLocaleString`/`Intl.NumberFormat` çağrılarını bırakın.
  - Export (CSV/XLS): Görsel uyum için locale‑aware kalabilir; analitik/işlem için ham değer gerekiyorsa ek kolon ekleyin (ör. `amount_raw`).

## 5) Sayfalar ve Bileşenler
- Seo bileşeni: HomePage, ProductsPage, CategoryPage, ProductDetailPage, BrandsPage, BrandDetailPage’de aktif.
- Admin ve Hesap sayfalarında tüm tutar/tarih alanları helper’larla yönetilir.

## 6) Geliştirici Notları
- Yeni stringler için i18n sözlüğüne anahtar ekleyin (tr/en).
- Tarih/saat için backend ISO 8601 tercih edilir; helper’lar Date’e dönüştürüp güvenli biçimler.
- OG görseli verilmezse `/images/hvac_heat_recovery_7.png` varsayılandır.

## 7) Dosya Konumları ve Kullanım Örnekleri (TR/EN)
- Sözlük dosyaları: `src/i18n/dictionaries/tr.ts`, `src/i18n/dictionaries/en.ts`
- Para formatı: `src/i18n/format.ts` → `formatCurrency(value, lang, options?)`
- Tarih/Saat formatı: `src/i18n/datetime.ts` → `formatDate`, `formatDateTime`, `formatTime`

Örnek kullanım (bileşen içinde):
```tsx path=null start=null
import { useI18n } from '@/i18n/I18nProvider'
import { formatCurrency } from '@/i18n/format'
import { formatDateTime } from '@/i18n/datetime'

export function PriceAndDate({ total, createdAt }: { total: number; createdAt: string }) {
  const { lang, t } = useI18n()
  return (
    <div>
      <span>{t('orders.total')}: {formatCurrency(total, lang)}</span>
      <span>{formatDateTime(createdAt, lang)}</span>
    </div>
  )
}
```

Seo bileşeni (hreflang + OG locale):
```tsx path=null start=null
import { Seo } from '@/components/Seo'
import { useI18n } from '@/i18n/I18nProvider'

export default function Page() {
  const { lang, t } = useI18n()
  return (
    <Seo
      title={t('seo.home.title')}
      description={t('seo.home.description')}
      lang={lang}
    />
  )
}
```

## 8) QA/Checklist
- [x] HTML `<html lang>` dinamik: tr/en
- [x] Hreflang: tr-TR, en-US, x-default (x-default → dil parametresiz canonical)
- [x] OG locale ve `og:locale:alternate` set ediliyor
- [x] Tüm `toLocaleString` / `Intl.NumberFormat` doğrudan kullanımları kaldırıldı (helper’lara geçirildi)
- [x] Admin ve Hesap sayfalarındaki metinler sözlüğe taşındı (butonlar, tablo başlıkları, durumlar, toasts)
- [x] CSV/XLS export’larda görünür sütunlar locale-aware; gerekiyorsa `*_raw` ham değer ek kolonu