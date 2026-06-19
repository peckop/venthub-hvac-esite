# VentHub Katalog İçe-Alım Standardı (Cetvel) — v1.0

> **Bu dosya nedir?** PDF kataloglardan **hatasız ürün verisi** üretip Supabase'e almanın cetveli.
> Worker (Antigravity CLI, `.agent/skills/venthub-catalog-importer`) **bunu izler**; çıktı = insan-doğrulanabilir
> CSV. "Hatasız" demek, CSV kolonlarının + kategori eşlemesinin + fiyat kuralının **önceden sabit** olması demektir.
>
> **Neden var?** `venthub-pdf-ingestor` (ağır Docling/pydantic hattı) görsel-çıkarım yöntemine **kafa-kafaya kaybetti
> ve EMEKLİ** (12 ürüne 48 dosya, boş kit kodları, 105 kritik jidoka). Diriltilmez. Yöntem = görsel çıkarım + NotebookLM hakem.

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

---

## 3. CSV şeması (SÖZLEŞME — worker tam bunu üretir)

Tek satır = tek ürün (renk/varyant ayrı satır). UTF-8, virgül ayraç, başlık satırı zorunlu.

| Kolon | Tip | Kaynak | Açıklama / kural |
|---|---|---|---|
| `model_code` | text **(zorunlu)** | köprü | Vortice cod. = Avensair KOD. Boşsa satır **flag**. |
| `name` | text | Avensair | Ürün adı (TR isim Avensair'e hizalı). |
| `brand` | text | Avensair | Vortice / Nicotra Gebhardt / Danfoss / AVenS. |
| `avensair_kod` | text | Avensair | TR satış kodu. |
| `avensair_section` | text | Avensair | 27-bölüm no+ad (ör. "08 Mini Aksiyal"). |
| `category_slug` | text | **Avensair taksonomi** | üst kategori (§4 harita). Vortice-şekilli DEĞİL. |
| `subcategory_slug` | text | **Avensair taksonomi** | alt kategori (§4). |
| `purchase_price_eur` | numeric | **Avensair** | **€ alış. TL GÖMME YOK.** Yoksa **flag**, 0 yazma. |
| `currency` | text | sabit | daima `EUR`. |
| `specs_json` | json | **Vortice** | `{airflow_m3h, pressure_pa, power_w, noise_db, diameter_mm, dims_mm, ...}`. |
| `description_tr` / `description_en` | text | Vortice→üretilmiş | i18n; TR Türkçeleştirilmiş, EN deyimsel. |
| `image_url` | text | Vortice | opsiyonel. |
| `src_vortice` | text | atıf | Vortice sayfa/citation. |
| `src_avensair` | text | atıf | Avensair fiyat listesi citation. |
| `confidence` | enum | worker | `ok` / `conflict` / `missing` → `ok` dışı = **insana işaretli**. |

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
İlişki: `pricing-standard.md` (€ alış → satış motoru) · `category-taxonomy-standard.md` (2-seviye nihai slug) ·
skill `.agent/skills/venthub-catalog-importer` (çıkarım aracı) · memory `catalog-ingestion-system` · `category-taxonomy-state`.

---

> v1.0 · 2026-06-19 · İlk sürüm. Eksik cetvel boşluğu kapatıldı (skill vardı, cetvel yoktu).
