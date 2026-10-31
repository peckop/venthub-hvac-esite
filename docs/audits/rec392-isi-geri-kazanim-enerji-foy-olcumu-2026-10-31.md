# REC-392 — Konut ısı geri kazanım: enerji sınıfı ve ürün bilgi föyü verisi (ölçüm, 31 Ekim 2026)

Kapsam: yalnız VERİ. Canlıya yazılmadı. Vitrinde gösterim (fiyatın yakınında etiket + föy) bu kartın işi değil; Design/ÜRÜN.
Yöneten cetveller: `catalog-ingestion-standard.md` §6.3 (kaynak dizini), `product-schema-standard.md` (erp_ önekli alanlar), `docs/mevzuat/kayit.json` (AB 1254/2014, TR SGM-2021/19).
Yöntem: elle ölçüm + kaynak dizini (PDF doğrudan taranmadı). 25 Eylül'de yapılan çift bağımsız çıkarım (A metin yolu, B tablo yolu) yeniden kullanıldı; bu turda yeniden çıkarım yapılmadı, iki ürün için kaynak sayfası kaynak dizininden yeniden okundu.

## 1. Canlı ürün listesi (SELECT, 31 Ekim, tenant tek)

Etkilenen ürün 13, kartın "13" sayısı doğru. "Kütükte 11" farkının sebebi: 25 Eylül yazım planı (`duzeltme-rec392.json`) 11 ürünü kapsıyor; VRT-10911 ve VRT-12101 "paylaşımlı föy sütunu" gerekçesiyle plandan tutuldu (aşağıda §3).

| Aile (canlı slug) | Ürün sayısı | SKU |
|---|---|---|
| vortice-vort-hr-isi-geri-kazanim | 5 | VRT-10911, VRT-10930, VRT-12101, VRT-12106, VRT-12219 |
| vortice-vort-mono | 8 | VRT-12431, 12432, 12434, 12435, 12436, 12437, 12443, 12444 |

Kartta geçen eski aile adı `vortice-isi-geri-kazanim` canlıda yok; güncel ad `vortice-vort-hr-isi-geri-kazanim`.
Canlı durum: 13 ürünün hepsi silinmemiş; teknik özelliklerinde erp_ önekli tek anahtar `erp_compliant`; enerji sınıfı (`energy_class`) ve föy alanlarının hiçbiri YOK (13/13).

## 2. Ürün başına kaynak durumu

Kaynak: Vortice broşürleri, kaynak dizini (`kaynak-dizini/sayfalar.jsonl`, 114 belge, 4121 sayfa). Her satırda föy alanı sayısı 19 (SEC üç iklim, birim tipi, tahrik, ısı geri kazanım tipi, verim, azami debi, güç, ses, referans debi/basınç, SPI, kontrol faktörü, iç/dış kaçak, AEC, AHS).

| SKU | Enerji sınıfı (orta iklim) | SEC orta iklim kWh/m²·yıl | AEC kWh/yıl | Kaynak (dosya, sayfa) | Çıkarım durumu |
|---|---|---|---|---|---|
| VRT-10930 | A | −35 | 442 | vortice-brochure-radon-en.pdf s.34 | A=B, 19/19 aynı |
| VRT-12106 | A | −38,4 | 332 | Doc_Pubblicita_Residential_ventilation_vmc_1.pdf s.40 | 18 aynı, 1 fark (ısı geri kazanım tipi: "recovery" / "recuperative", terim farkı) |
| VRT-12219 | A | −35 | 459 | vortice-brochure-radon-en.pdf s.59 | 17 aynı, 2 fark (soğuk/ılık iklim SEC: boşluklu yazım "- 73" / "- 10", değer aynı) |
| VRT-12431 | A+ | −44,5 | 79 | vortice-brochure-radon-en.pdf s.25 | 17 aynı, 2 "uygulanamaz" (iç/dış kaçak NA); soğuk iklim SEC iki broşürde çelişkili |
| VRT-12432 | A+ | −44 | 100 | s.25 | 17 aynı, 2 NA |
| VRT-12434 | A | −41,2 | 157 | s.21 | 17 aynı, 2 NA |
| VRT-12435 | A | −39,7 | 216 | s.22 | 17 aynı, 2 NA |
| VRT-12436 | A+ | −44,4 | 83 | s.21 | 17 aynı, 2 NA |
| VRT-12437 | A+ | −43,7 | 113 | s.22 | 17 aynı, 2 NA |
| VRT-12443 | A+ | −43,8 | 107 | s.23 | 17 aynı, 2 NA |
| VRT-12444 | A+ | −43,0 | 142 | s.24 | 17 aynı, 2 NA |
| VRT-10911 | A | −38,4 | 332 | vortice-brochure-radon-en.pdf s.48 | PAYLAŞIMLI sütun (aşağıda) |
| VRT-12101 | A | −37 | 393 | vortice-brochure-radon-en.pdf s.54 | PAYLAŞIMLI sütun (aşağıda) |

"A=B" = iki bağımsız çıkarım aynı değeri verdi. Her alan için alıntı ve sayfa: `venthub-pdf-ingestor/venthub/icerik-hatti/rec392-erp/kiyas-ab.csv`; yazım planı: `duzeltme-rec392.json` (11 ürün, 16–19 alan).

## 3. Paylaşımlı föy sütunu (VRT-10911, VRT-12101)

Kaynak sayfada (s.48 ve s.54) föy tek bir değer sütunudur ve sütunun altında iki model kodu birlikte yazılıdır:

- s.48: "VORT HR 350 AVEL — code 12106" ve "VORT HR 350 AVEL H — code 10911" (aynı sütun).
- s.54: "VORT HR 450 AVEL D — Code 12101" ve "VORT HR 450 AVEL D H — Code 10910" (aynı sütun).

Yani üretici aynı değerleri "ısıtıcılı (H)" ve ısıtıcısız model için birlikte beyan ediyor. 10911 için değerler 12106'nın değerleriyle birebir aynı (A, −38,4, 332 kWh). Bu tutarlı görünüyor ama ısıtıcılı modelde AEC'nin ısıtıcıyı içerip içermediği kaynakta yazmıyor: ölçülmedi. Karar noktası: "ortak beyan değeri iki koda da yazılır mı?" Bu bir MEVZUAT yorumudur, KATALOG karar vermez. Aynı sütundaki VRT-10910 (450 AVEL D H) canlıda bu iki ailedeki 13 üründe yok; başka ailede kayıtlı mı: ölçülmedi.

## 4. Bulunamayan / ölçülmeyen

- Enerji etiketi GÖRSELİ (A/A+ ölçekli AB etiketi grafiği) üretici belgelerinde ayrı dosya olarak aranmadı: ölçülmedi. Veri (sınıf, SEC, AEC, föy alanları) var; grafik veriden üretilebilir mi karar Design'ındır.
- VRT-12431'in soğuk iklim SEC değeri iki broşürde çelişkili: yazılmadan önce çözüm gerekir (yazım planında tutulan alan).
- Kaçak oranı (iç/dış) VRT-12431…12444'te kaynakta "NA*" (uygulanamaz): "bulunamadı" değil "uygulanamaz"; vitrinde ayrı gösterilmeli.
- `energy_class` ve föy alanlarının şema adı: `product-schema-standard.md` erp_ önekli satırı geçerli; `energy_class` adı şemada YOK, plan erp_sec_class_average kullanıyor.
- Avens ısı geri kazanım ailesi (`avens-isi-geri-kazanim-cihazlari`, AVE-13010/13011/13013) konut tipi mi, kapsamda mı: ölçülmedi (MEVZUAT kapsam kontrolü işi).

## 5. Sıradaki adım (bu kartın dışında)

Canlıya yazım planı hazır (11 ürün); 2 paylaşımlı ürün ve VRT-12431 soğuk iklim değeri karar bekliyor. Yazım Recep "yaz" sözüyle OPS penceresinde; şema/RLS değişikliği yok, yalnız technical_specs anahtarları. Yazımdan sonra canlı sayfa ölçümü KATALOG'da.
