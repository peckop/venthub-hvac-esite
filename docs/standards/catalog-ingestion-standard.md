# VentHub Katalog İçe-Alım Standardı (Cetvel) — v1.0

> **Bu dosya nedir?** PDF kataloglardan **hatasız ürün verisi** üretip Supabase'e almanın cetveli.
> Worker (Antigravity CLI, `.agent/skills/venthub-catalog-importer`) **bunu izler**; çıktı = insan-doğrulanabilir
> CSV. "Hatasız" demek, CSV kolonlarının + kategori eşlemesinin + fiyat kuralının **önceden sabit** olması demektir.
>
> **Neden var?** `venthub-pdf-ingestor` (ağır Docling/pydantic hattı) görsel-çıkarım yöntemine **kafa-kafaya kaybetti
> ve EMEKLİ** (12 ürüne 48 dosya, boş kit kodları, 105 kritik jidoka). Diriltilmez. Yöntem = görsel çıkarım + NotebookLM hakem.

---

## 0. Hızlı başlangıç — worker ilk işler (proje: `venthub-pdf-ingestor`)

1. **PDF'leri indir → `avensair.com/kataloglar`** (24 katalog: Vortice broşürleri **+** Avensair fiyat listesi, **hepsi burada**).
   Klasör yapısına yerleştir (§2 workspace tree): spec katalogları `markalar/<marka>/<katalog>/01-input/`,
   fiyat listesi `ticaret/avensair-fiyat-listesi-2026/01-input/`.
   *(Vortice.com orijinalleri **opsiyonel** — yalnız azami spec hassasiyeti gerekirse; Avensair kopyaları sadıktır.)*
2. **Skill HAZIR** — `<ingestor>/.agent/skills/venthub-catalog-importer/` zaten **CSV-akışına güncel** (controller yaptı, standartla birebir). Düzenleme gerekmez; sadece çalıştır.
3. **Pilot ile başla:** TEK katalog (ör. `vortice/konut-fanlari`) + fiyat listesi → 1 CSV → Recep teyit eder. Tuttuysa kalanı batch-batch.

> Tüm kurallar aşağıda (§1–§8) — **tekrar yok.** Kademe 1'de DB'ye **YAZMA** (Kademe 2 = controller).

---

## 1. Çekirdek model: Vortice (üretici) → Avensair (bayi)

| Ne | Kaynak | Defter ID |
|---|---|---|
| **Spec / içerik** (debi, basınç, güç, ses, ölçü, açıklama, görsel) | **Vortice** (üretici, otoriter) | `0e5d2a83-e94f-433a-90e2-4c45b1e3730a` |
| **Ticaret** (ne satıyoruz, TR-KOD, **€ alış**, KDV, kur) | **Avensair** (TR bayi, satış otoritesi) | `e3b18fa3-6310-4067-9873-2deb847d15a8` |

- **Köprü = model kodu** (Vortice `cod. 61121` = Avensair `KOD 61121`). İki kaynağı bu bağlar.
- **Mağaza = Avensair'in sattığı küme.** Vortice'de olup Avensair'in satmadığı kalemler (ev tipi yaz vantilatörü,
  mutfak davlumbaz, Ariett/Vort Press, gelişmiş HRV, VMC kanal, Vorticel MPC) **CSV'ye girmez**.
- **Avensair ticari şartları (sabit):** fiyatlar **Euro** · **%20 KDV hariç** · **TCMB Efektif Satış Kuru** · AVenS depo teslim.

---

## 2. İKİ KADEME — çıkarım ↔ yükleme (CSV = DB-agnostik sınır)

Süreç **iki bağımsız kademeye** ayrılır. Aralarındaki **CSV/Excel = sözleşme + tek kaynak gerçeği.**
Bir kademe diğerini bilmez → ayrı ayrı tekrar-koşulur veya değiştirilir.

**KADEME 1 — ÇIKARIM (PDF → CSV).** Ingestor projesi (Python runtime). **DB'ye DOKUNMAZ.**
İstenen seviyeye gelene kadar **tekrar koşulur**; Recep CSV'yi **onaylar/iterasyonlar.** Çıktı = kanonik CSV.
```
PDF → görsel çıkarım + çapraz-sorgu → CSV/Excel → [Recep teyit ↻ iterasyon]
```

**KADEME 2 — YÜKLEME (CSV → DB).** Ayrı çalıştırma, **yalnız onaydan sonra.** DB hedefi = **ADAPTÖR/parametre:**
bugün **Supabase** (MCP / `supabase_writer`), yarın **yerel Postgres** veya başka — **CSV değişmez, yalnız hedef değişir.**
Controller yapar; fiyat + taksonomi modeli **burada** uygulanır (taksonomi+fiyat kilitliyken).
```
Onaylı CSV → loader(--target supabase|local) → DB
```

**Neden böyle:** (a) Kademe 1'i DB'ye hiç dokunmadan defalarca koş; (b) DB hedefini değiştir (Supabase ↔ yerel)
**yeniden çıkarmadan**; (c) CSV insan-okunur + versiyonlanabilir + tek gerçek. Eski skill'in "çıkar→JSON→doğrudan DB"
**füzyonu** bu yüzden ikiye bölünür — kaynak (PDF) ile hedef (DB) birbirine bağlı kalmaz.

### 📁 Workspace klasör yapısı (kırılımlı tree — TEMPLATE, örnek alın)

Klasörler **kaynağa göre** düzenlenir (marka → katalog); CSV'deki `category_slug` ise **hedefe göre**
(Avensair kategorisi). Source ile target **ayrı eksenler** — klasörü Avensair kategorisine göre değil
**markaya/kataloğa** göre kır. Bir katalog = bir klasör → kendi input + output'u izlenir, re-run temiz, batch karışmaz.

```
venthub/                                   # workspace kökü (ingestor projesi içinde)
│
├── markalar/                              # SPEC kaynakları — üretici markaları
│   ├── vortice/
│   │   ├── konut-fanlari/
│   │   │   ├── 01-input/                  # ham PDF (Vortice-Konut-Fanlari.pdf)
│   │   │   ├── 02-work/                   # sayfa PNG'leri + scratch (ara çıktı)
│   │   │   └── 03-output/                 # spec CSV (vortice-konut.csv)
│   │   ├── endustriyel-fan-serisi/        { 01-input · 02-work · 03-output }
│   │   ├── isi-geri-kazanim/              { 01-input · 02-work · 03-output }
│   │   └── hava-perdesi/                  { 01-input · 02-work · 03-output }
│   ├── nicotra-gebhardt/
│   │   └── radyal-fanlar/                 { 01-input · 02-work · 03-output }   # DD/AT/ADH/RDH
│   ├── danfoss/
│   │   └── frekans-konvertorleri/         { 01-input · 02-work · 03-output }   # VLT FC101/FC102
│   └── avens/                             # AVenS kendi üretimi
│       ├── siginak-bvu/                   { 01-input · 02-work · 03-output }
│       ├── hucreli-aspirator/             { 01-input · 02-work · 03-output }
│       └── isi-geri-kazanim/              { 01-input · 02-work · 03-output }
│
├── ticaret/                              # COMMERCE kaynağı — bayi (markalar-üstü, çapraz keser)
│   └── avensair-fiyat-listesi-2026/
│       ├── 01-input/                      # Avensair 2026 fiyat listesi PDF
│       └── 03-output/                     # avensair-fiyat.csv (model_code → KOD + € fiyat)
│
└── _birlesik/                            # MERGE — Kademe 2 (yükleme) girdisi
    └── venthub-products-master.csv        # spec + ticaret, model_code ile birleşmiş, yüklemeye hazır
```
> `{ 01-input · 02-work · 03-output }` = aynı 3 alt-klasör (yer için kısaltıldı).

**Kurallar:** klasör adı kebab-case + **ASCII** (ş/ı/ç/ğ → s/i/c/g); `01/02/03` önekleri pipeline sırasına dizer
(ham→ara→final); `markalar/`=spec · `ticaret/`=Avensair € fiyat · `_birlesik/`=birleşmiş final (`_` öneki en üste sıralar).

---

## 3. CSV şeması (SÖZLEŞME) → **`csv-import-export-standard.md` (FORMAT SSOT)**

> ⚠️ **CSV'nin biçimi bu cetvelde TANIMLANMAZ — tek SSOT `csv-import-export-standard.md`.** Bu dosya *yöntem*
> cetvelidir (kaynak, hakem, kategori-harita, kapılar); CSV'nin kolonları/kodlaması/kalite-kapısı **format
> cetvelinindir.** Mükerrerlik = drift = kontrol kaybı; o yüzden burada şema **tekrarlanmaz**, oraya bakılır.

Worker'ın üreteceği CSV'nin **tam kolon listesi + kodlama (`utf-8-sig`, `;` ayraç) + flat `spec_` mimarisi +
slug kuralı + Jidoka kalite kapısı** → **`csv-import-export-standard.md`**. Özet hatırlatma (otorite orada):

- **Teknik özellikler flat `spec_` kolonları** halinde yazılır (DB'de JSONB; loader Kademe-2'de flat→JSON katlar).
  *(Eski "tek `specs_json` kolonu" önerisi emekli — gerekçe format cetveli §0.)*
- `model_code` = köprü (zorunlu); `purchase_price_eur` = **€ alış, TL gömme yok** (fiyat motoru → `pricing-standard.md`).
- `category_slug`/`subcategory_slug` = **canlı DB slug'ı, birebir** (icat etme; eşleme anahtarı `avensair_section`, bkz format §3).
- `confidence` (`ok`/`conflict`/`missing`) → `ok` dışı = insana işaretli.

---

## 4. Avensair 27-bölüm → 2-seviye kategori haritası (gruplama rehberi)

> Worker ürünü **Avensair bölümüne** göre gruplar. Nihai slug'lar `category-taxonomy-standard.md` ile kesinleşir;
> aşağısı çalışan eşleme (üst → alt).

| Üst kategori | Avensair bölümleri (no) |
|---|---|
| **Konut Tipi Havalandırma** | 08 Mini Aksiyal · 15 Santrifüj · 16 Çift Yönlü Aksiyel · 18 Duvar/Tavan Radyal |
| **Kanal Tipi Fanlar** | 22 Sessiz Yuvarlak · 24 Yuvarlak · 26 Kanal · 27 Dikdörtgen |
| **Çatı Tipi Fanlar** | 32 Yatay Atışlı · 35 Dikey Atışlı |
| **Endüstriyel Havalandırma** | 28 Hücreli · 29 Şömine-Baca · 30 Aksiyel · 36 Davlumbaz |
| **Radyal / Santrifüj Fanlar** | 41 Santrifüj · 46 Plug · 52–55 Nicotra Gebhardt (DD/AT/ADH/RDH) |
| **Ex-Proof (ATEX) Fanlar** | 38 Ex-Proof · 40 Ex-Proof Çatı |
| **Endüstriyel Tavan + Hava Perdesi** | 62 Nordik HVLS + Air Door · 64 Hava Perdesi |
| **Isı Geri Kazanım (VMC)** | 66 Isı Geri Kazanım |
| **Özel / Kontrol** | 56 Sığınak · 58 Frekans Konvertörü |

⚠️ **"Otopark Jet Fanları" ŞÜPHELİ:** Avensair "JET" = asit-ortam plastik çatı santrifüj fanı (41 altında), otopark jet
fanı DEĞİL. Worker bu serileri 41'e koyar; "otopark jet" diye ayrı kategori AÇMAZ (Vortice Vort Jet-A/R Avensair'de yok).

---

## 5. Çıkarım yöntemi (skill + hakem — tek AI'ya güvenme)

1. **Görsel ajan** Vortice broşürünü GÖZLE okur → o sayfadaki **TÜM** ürünleri eksiksiz çıkarır (enümerasyonda güçlü).
2. **NotebookLM hakem** her ürünü **atıfla** doğrular (kesin tek-değer + citation). Avensair defteri = satılıyor mu + € fiyat.
3. **Çelişki / eksik / tuhaf** → `confidence != ok` → **Recep'e işaretlenir** (CSV'de görünür).
4. **Kör güven YOK:** kanıt — AD900 kumandası, görsel ajan DOĞRU (RVG 1A/12835), NLM YANLIŞ (RVG 2A). Çelişince **ham atıf (katalog) hakem.**

---

## 6. Kapılar (zorunlu — ihlal = satır reddi)

- [ ] **Kategori = Avensair 27-iskelet** (§4); Vortice-şekilli kategori üretme.
- [ ] **Fiyat = € alış** (`purchase_price_eur` + `currency=EUR`); **TL gömme YASAK** (fiyat motoru hesaplar — `pricing-standard.md`).
- [ ] `model_code` her satırda dolu (köprü); boşsa flag.
- [ ] Avensair'in **satmadığı** kalem CSV'ye girmez (Vortice-only düş).
- [ ] `price=0` / eksik spec → satırı atma, `confidence` ile **flag**.
- [ ] **DB yazımı yok** — worker yalnız CSV üretir; Supabase yükleme controller + Recep onayı (dry-run default).

---

## 7. Provenance / ilişki

Kaynak: çapraz-sorgu (`cross_notebook_query` Vortice-Full + Avensair, 2026-06-19) → Avensair'in 27 gerçek bölümü atıfla.

> ⚠️ **2026-08-17 — YETENEK KAYBI:** ürün değişti (`notebooklm-py`) ve yeni MCP setinde
> **`cross_notebook_query` YOK** (33 aracın hiçbiri çapraz-defter sorgusu yapmıyor).
> Yukarıdaki bulgu geçerli kalır ama **aynı yöntemle tekrar üretilemez**. Geçici yol:
> her defteri `chat_ask` ile ayrı ayrı sorgula, sonuçları elle birleştir.
İlişki: `pricing-standard.md` (€ alış → satış motoru) · `category-taxonomy-standard.md` (2-seviye nihai slug) ·
skill `.agent/skills/venthub-catalog-importer` (çıkarım aracı) · memory `catalog-ingestion-system` · `category-taxonomy-state`.

---

> v1.0 · 2026-06-19 · İlk sürüm. Eksik cetvel boşluğu kapatıldı (skill vardı, cetvel yoktu).
