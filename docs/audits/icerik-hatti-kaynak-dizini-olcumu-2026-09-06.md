# Kaynak dizini fikri — ÖNCE ÖLÇÜM (OPS isteği, 2026-09-06)

**Şerit:** URUN-KATALOG (sid 3a7976a1) · **Durum:** salt-okuma ölçüm. Kod yok, PR bugün yok,
karar Recep'te. Emir açılmadan önce ölçülüyor (CLAUDE.md kural 1).

## KAYNAK / CETVEL

* CLAUDE.md **kural 1** — emir açmadan önce "bu zaten var mı" diye SOR/ölç.
* `docs/standards/catalog-ingestion-standard.md` · `docs/audits/icerik-hatti-*` (bugünkü hat).
* Ölçülen fikir (OPS): PDF sayfa metinleri + tabloları bir kez çıkarılıp kalıcı tutulsun
  (hash + sayfa + metin + tablo); her DB değeri/iddia bir **kanıt satırına** (ürün, alan,
  değer, pdf, sayfa, parça) bağlansın; kapılar ve raporlar PDF yerine dizini okusun.

---

## Soru 1 — Kapı bugün sayfa metnini nasıl çıkarıyor? Önbellek var mı? Kaç PDF/sayfa/bayt?

**Çıkarma:** `scripts/icerik-hatti/taslak-kaynak-kapisi.py:100` `sayfa_metni_getir()` →
PyMuPDF `fitz`, sayfa başına `get_text("text")`. Tablo çıkarımı **yok**; tablo hücreleri düz
metin akışına karışık geliyor (kapının "birim başlık hücresinde" sorunu tam buradan doğuyor).

**Önbellek:** var ama **süreç-içi ve uçucu** — `onbellek = {}` (satır 170), anahtar
`(pdf_adı, sayfa)`. Koşum bitince kaybolur. **Diskte hiçbir kalıcı çıkarım yok.**

**Evren (ölçüldü):**

| | |
|---|---|
| PDF dosyası | **24** |
| Ayrı belge (hash'e göre) | **23** — ikisi birebir aynı, aşağıda |
| Toplam sayfa | **1201** |
| Çıkarılan düz metin | **1.469.265 bayt (1,40 MB)** |
| Sayfa başına ortalama | ~1.223 bayt |

Yani tüm külliyatın düz metni **1,4 MB**. Kalıcı dizin, boyut açısından önemsiz.

### ⛔ Bulgu 1.1 — İki dosya BİREBİR AYNI (aynı MD5, farklı ad, farklı klasör)

```
5a109c61…  markalar/vortice/isi-geri-kazanim/01-input/vortice-brochure-mev.pdf
5a109c61…  markalar/vortice/konut-fanlari/vort-mono/01-input/vortice_vort_mono_range_new.pdf
```

İkisi de 30 sayfa, 30.706 bayt. Kapının kaynak haritasında `MONO` ikincisine bağlı; birincisi
hiç kullanılmıyor. **Kaynak dizini kurulacaksa tekilleştirme (hash) ilk gün gerekli** — yoksa
aynı sayfa iki ayrı "kaynak" gibi görünür ve iki farklı ada referans veren iki iddia,
aslında aynı sayfayı gösterirken farklı sayılır.

## Soru 2 — venthub-pdf-ingestor'da zaten böyle bir çıktı var mı?

**Yetenek VAR, artefakt YOK.**

* `src/docling_parser.py` — `--output-json` bayrağıyla ayrıştırma sonucunu JSON yazabiliyor
  (satır 388, 412–413). Sayfa metnini `fitz` ile alıyor (satır 140).
* `src/pipeline.py:172` — **sayfa HASH'i anahtarlı kalıcı önbellek** tanımlı:
  `.pipeline_cache.json`, `new_cache[page_hash] = {...}` (satır 247, 254–255).
  **Yani "hash + sayfa" fikri bu depoda zaten tasarlanmış.**
* **AMA diskte tek bir çıkarım dosyası yok:** `.pipeline_cache.json` yok, `*_parsed.json` yok;
  depoda (`.venv` hariç) çıkarılmış metin/tablo artefaktı **bulunamadı**.

**Fark önemli:** mevcut önbellek sayfa hash'ine karşı **çıkarılmış ÜRÜN kayıtlarını** tutuyor,
**ham sayfa metnini/tablosunu değil**. OPS'un tarif ettiği dizin ham katmanı ister. Yani
"sıfırdan yazılacak" değil, **mevcut ardışık düzenin bir katman aşağısı**.

## Soru 3 — Bugünkü 279 iddianın kanıt satırı ÜRETİLEBİLİR Mİ? Kapı çıktısı taşıyor mu?

**Hesaplanıyor, basılıyor, SAKLANMIYOR.**

Kapıda `--ayrinti` kipi zaten her doğrulanan iddia için kaynak+sayfa+jeton basıyor
(`taslak-kaynak-kapisi.py:322`). Ölçtüm — 16 taslak dosyasında:

| | |
|---|---|
| `--ayrinti` ile basılan kanıt satırı | **328** |
| Aile bloklarına düşen (sunumdaki sayı) | **279** |

Fark, taslakların karşılaştırma/bulgu bölümlerindeki referanslardan geliyor; onlar vitrine
çıkmıyor. Örnek satırlar:

```
OK [RAD s.23] 200 mm
OK [RAD s.23] IPX7
OK [RAD s.24] 200 mm
```

**Eksik olan alanlar:** satırda *kaynak, sayfa, jeton* var; *ürün/aile* ve *alan (hangi blok)*
**yok** — ikisi de kapının o anki döngüsünde elde mevcut, sadece çıktıya yazılmıyor.
Ayrıca çıktı **metin**; makine okunur değil.

**Hüküm:** bugünün 279 iddiası için kanıt tablosu **bugün üretilebilir** ve maliyeti bir dizin
kurmak değil, kapının çıktısına iki alan eklemek + JSON/CSV yazdırmaktır. Kaynak dizini
fikrinin *bu parçası* zaten %80 hazır.

## Soru 4 — Taranmış (metin çıkmayan) PDF sayısı

| | |
|---|---|
| Hiç metin çıkmayan PDF | **0** |
| Sayfa başına <50 bayt metin veren PDF | **0** |

**24 PDF'in tamamı metin katmanı taşıyor.** OCR ihtiyacı yok. En zayıfı
`vortice-bravo-s.pdf` (1 sayfa, 272 bayt) — küçük ama gerçek metin.

Sayfa düzeyinde boş/az metinli sayfa toplamı 19/1201 (kapak, ayraç, tam sayfa görsel);
en yüksek `LINEO_QUITE_KATALOG.pdf` 6/40.

---

## Ölçümün söylediği (yorum, karar değil)

1. **Boyut engel değil:** 1,40 MB düz metin, 1201 sayfa. Kalıcı dizin ucuz.
2. **OCR gerekmiyor:** taranmış PDF sıfır.
3. **"Sıfırdan" değil:** ingestor'da hash-anahtarlı önbellek tasarımı zaten var; eksik olan
   **ham metin/tablo katmanının kalıcılığı**.
4. **Kanıt satırı fikri en hazır parça:** kapı bunu bugün hesaplıyor, yalnız saklamıyor;
   ürün/alan iki ek alanla tamamlanır.
5. **Tablo çıkarımı asıl kazanç olabilir:** kapının bugünkü en büyük zaafı (zayıf eşleşme,
   birim başlık hücresinde) düz metin akışından doğuyor. `get_text("blocks")`/tablo çıkarımı
   dizine girerse "sayı ile birimi AYNI SATIRDA gördüm" denebilir ve **zayıf eşleşme sınıfı
   büyük ölçüde kapanır**. Bugün 54 zayıf iddia var; bu sınıfın ne kadarının kapanacağı
   **ölçülmedi** — tahmin vermiyorum.
6. **Tekilleştirme ilk gün gerekli:** 24 dosya = 23 belge.

## Bu ölçümün kapatmadığı

* Tablo çıkarımının zayıf eşleşmelerin **kaçını** kapatacağı (ölçülmedi).
* Dizinin nerede duracağı (repo mu, ingestor mu) ve tazelik kapısı — karar konusu.
* Kanıt satırlarının DB'ye mi yoksa dosyaya mı yazılacağı.
