# public/fonts — yazı tipi kaynağı ve lisans

Bu dizindeki iki dosya, ürün föyü PDF'inde (`src/lib/pdfGenerator.ts`) Türkçe karakterleri çizmek için
tarayıcıda jsPDF'e gömülür. Yol tanımı: `src/lib/pdfAssets.ts` (`PDF_FONTS`).

| Dosya | Sürüm | Bayt | SHA-256 |
|---|---|---|---|
| `Roboto-Regular.ttf` | Version 2.137; 2017 | 171676 | `79e851404657dac2106b3d22ad256d47824a9a5765458edb72c9102a45816d95` |
| `Roboto-Bold.ttf` | Version 2.137; 2017 | 170760 | `7d0b991ee3e0be7af01ad7ea8cd2beea6c00a25e679a0226b6737f079aafff86` |

**Telif:** Copyright 2011 Google Inc. All Rights Reserved. (yazı tipi ad tablosu, nameID 0)

**Lisans:** Apache License, Version 2.0 (yazı tipi ad tablosu, nameID 13 ve 14). Tam metin bu dizindeki
`LICENSE` dosyasıdır; Apache-2.0 §4(a) gereği yazı tipleriyle birlikte dağıtılır.

**Kaynak:** PostgreSQL 17 kurulumundaki pgAdmin 4 paketinin statik yazı tipi dizininden alınan yerel kopya
(`pgadmin/static/fonts/Roboto-Regular.ttf` ve `Roboto-Bold.ttf`). İndirme yapılmadı. Dosyalar değiştirilmeden,
bayt bayt kopyalanmıştır.

**Geçmiş:** Bu iki dosya 7 Haziran 2026'dan 11 Ekim 2026'ya kadar yazı tipi değil, ilk baytları satır sonu ve
`<!DOCTYPE html>` olan HTML'di (URN-123). Aynı kusurun geri gelmesini `src/__tests__/conformance/foy-yazi-tipi-imza.test.ts`
(INV-FOY-FONT-1) ve çalışma anında `yaziTipiDenetle` engeller; yeni bir `.ttf` eklenirse kapı onu da denetler.
