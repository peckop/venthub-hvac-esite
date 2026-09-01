# i18n Ters Yön Standardı — Türkçe yüzeyde İngilizce metin

**Kapsam:** müşteriye görünen yüzeylerde (`src/i18n/dictionaries/tr.ts`) Türkçe olması
gereken metinlerin İngilizce kalması. **Kapsam dışı:** `admin.*` (müşteri yüzeyi değil,
ayrı şerit), DB'den gelen içerik (kendi kapısı katalog tarafında).

**Kapı:** `INV-I18N-TERS-1` → `src/__tests__/conformance/i18n-ters-yon.test.ts`

---

## 0) Niçin var — ölçülmüş boşluk (2026-09-01, REC-113)

Bugüne kadarki bütün dil ölçümleri **tek yönlüydü**: İngilizce sayfada Türkçe metin
(REC-103 kategori adları, REC-108 aile adları). Aynası hiç ölçülmedi. Recep sorduğunda
ölçtük ve çıktı: 4200 anahtarın **6'sında** Türkçe yüzeyde İngilizce metin vardı —
bilgi merkezi üst başlığı *"Technical Intelligence Unit"*, kategori vitrini
*"Premium Engineering Solutions"*, ana sayfa HUD'u *"System.Data.Live"*, karşılaştırma
etiketi *"Quiet:"* ve 3D görüntüleyicinin iki düğmesi.

⭐**Sınıf:** kusur değil, **ölçülmemiş yön**. Envanteri tek yönlü kurmak, öbür yöndeki
her şeyi görünmez yapar — ve görünmeyen şey "yok" sanılır.

## 1) Kural

> **Türkçe sözlükteki bir değer, İngilizce sözlükteki değeriyle aynıysa, bunun
> MEŞRU bir sebebi olmalıdır ve o sebep bu dosyada YAZILI olmalıdır.**

Aynılık tek başına kusur değildir: "Model", "PVC", "SKU" Türkçede de aynen kullanılır.
Kusur, **aynılığın gerekçesiz** olmasıdır.

## 2) Ölçüt

**Birincil:** `tr[key] === en[key]`.
**İkincil:** `tr[key] !== en[key]` ama TR değeri Türkçe'ye özgü karakter (`çğıöşüÇĞİÖŞÜ`)
taşımıyor **ve** İngilizce işlev kelimesi (`the`, `and`, `for`, `with`, `your`…) içeriyor.

⭐**Ölçüt tek başına hiçbir şeyi ayırt etmez.** 4200 anahtarın ham aday sayısı 124'tü;
gerçek bulgu 6. Aradaki farkı **aşağıdaki liste** kapatıyor. Liste olmadan bu kapı ya
sürekli kırmızı verir ya da eşiği düşürülüp işe yaramaz hale gelir.

## 3) MEŞRU AYNILIK LİSTESİ (kapı bunu okur)

| Sınıf | Örnek | Niçin meşru |
|---|---|---|
| Marka ve ürün hattı adları | Vortice · Danfoss · AVenS · Nicotra Gebhardt · SEAT · VentHub · Lineo · Punto · Quadro · Nordik · VORT · TIRACAMINO | Özel ad — çevrilmez |
| Teknik kısaltma / standart | HVAC · ATEX · CE · ISO 9001 · IP44 · SSL · PCI DSS · 3D Secure · PDF · CSV · SKU · EAN · ID · KDV · IBAN · KVKK · ERP · HRV/ERV · B2B · PVC · Jet Fan | Türkçe teknik dilde aynen kullanılır |
| Türkçeye yerleşmiş terim | Model · Bypass · Normal · Optimal · Premium · Proforma · Demo · DEMO · Standart | TDK/sektör kullanımı aynı |
| Ölçü birimi ve sembol | m · mm · cm · m² · m³ · m³/h · Pa · dB(A) · kW · Hz · °C · % · ₺ | Dilden bağımsız |
| Enerji/verim sınıfı | A++ · A+ · A · B · C | Sınıf işareti, sözcük değil |
| Ürün/hizmet sağlayıcı adı | Google · Apple · Microsoft | Özel ad |
| Logo harfi ve yönetim rozeti | V · VH / ADMIN · VENTHUB B2B | Marka kısaltması / iç rozet |
| Şablon-only değer | `{{v}} m` · `SKU: {{sku}}` · `{{l}}m × {{w}}m × {{h}}m` | Çevrilecek kelime içermez |
| Varlık yolu / adres | `/images/...` · `info@venthub.com.tr` | Metin değil kaynak |
| Sosyal ağ ve kargo firması | Facebook · Twitter · X · LinkedIn · Instagram · YouTube · WhatsApp · Yurtiçi · Aras · MNG · PTT · UPS · FedEx · DHL | Özel ad |
| Ödül / kurum adı | Compasso d'Oro | İtalyanca özel ad |
| Klavye tuşu | `Enter ↵` | Tuş adı |
| Telefon biçim maskesi | `+90 (5xx) xxx xx xx` | Biçim, metin değil |

**Listeye ekleme kuralı:** yeni bir aynılık meşruysa buraya **sınıfıyla ve gerekçesiyle**
yazılır. "Kapı kırmızı verdi, listeye ekleyeyim" yeterli gerekçe DEĞİLDİR — sınıfı
adlandıramıyorsan büyük ihtimalle çeviri eksiktir.

## 4) Kapatılan bulgular (2026-09-01)

| Anahtar | Eski | Yeni |
|---|---|---|
| `knowledge.hub.eyebrow` | Technical Intelligence Unit | TEKNİK BİLGİ MERKEZİ |
| `category.showcase.premiumTitle` | Premium Engineering Solutions | Premium Mühendislik Çözümleri |
| `home.cinematicShowcase.hudStatus` | System.Data.Live | Sistem.Veri.Canlı |
| `categorySilentFan.comparison.quietLabel` | Quiet: | Sessiz: |

Çeviride komşu metnin üslubu esas alındı: üst başlıklar büyük harfli (`MÜHENDİSLİK ODAK
NOKTASI`), HUD'un noktalı "makine" üslubu korundu, karşılaştırma etiketi kardeşiyle
(`Standart:`) hizalandı. Ürün hattı adı `Vortice Lineo Quiet` **çevrilmedi** — etiket
çevrilir, özel ad çevrilmez.

## 5) ERTELENENLER — sessiz eksik olmasın

- **`product3d.reset` ("RESET") ve `product3d.free` ("FREE")** — GERÇEK bulgudur, kabul
  edilmiştir, ama **3D kararına ertelenmiştir**. 3D kapatma işi frende (`stash@{0}`) ve
  o iş inerse bu iki anahtar zaten ölür; şimdi çevirmek boş çakışma üretir.
  ⭐Bu satır kayıttır: 3D kararı verildiğinde bu iki anahtar YA çevrilir YA silinir —
  üçüncü seçenek (unutulmak) yoktur.
- **Marka sloganları** (`common.brandTagline` = "Ventilation & HVAC",
  `header.brandTagline` = "HVAC Premium") — **karar sınıfı, ölçümle çözülmez.** Birçok
  Türk markası sloganını bilerek İngilizce tutar. Recep'in kararı bu dosyaya yazılana
  kadar kapı bunları meşru sayar; karar geldiğinde ya §3'e sınıfıyla girer ya çevrilir.

## 6) Kapının sınırı (gizlenmiyor)

- **Yalnız sözlüğü ölçer.** Bileşene gömülü İngilizce metni görmez — onun kapısı
  `i18n-attribute-literals` ve sert-kodlu metin yasağıdır.
- **DB içeriğini ölçmez.** 2026-09-01'de aktif kategoriler ve aileler İngilizce-görünümlü
  Türkçe ad için tarandı: **0 satır**. Yani bugün o eksen temiz; yarın bozulursa bu kapı
  görmez, katalog tarafındaki kapı görmelidir.
- **Anlam doğruluğunu ölçmez.** "TR değeri Türkçe mi" sorar, "doğru Türkçe mi" sormaz.

## 7) İlgili

- `docs/plans/rec108-aile-adi-dil-zinciri-2026-09-01.md` — ters yönün aynası (EN yüzeyde TR)
- `src/__tests__/conformance/kategori-adi-tek-kaynak.test.ts` (INV-KATEGORI-ADI-1)
- `src/__tests__/conformance/aile-adi-tek-kaynak.test.ts` (INV-AILE-ADI-1)
