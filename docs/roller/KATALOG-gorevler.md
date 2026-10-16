# DÜZENLİ GÖREVLER: KATALOG

> Üretilmiştir (`scripts/belge/rol-karti-uret.cjs`, veri: `scripts/belge/rol-gorevleri.json`); elle düzenleme. Yöneten cetvel: `docs/standards/duzenli-gorevler-standard.md`. Rol kartı: `docs/roller/KATALOG.md`.

## Amaç
Sitedeki ürün sayıları (ses, ağırlık, devir, fiyat) üreticinin güncel kataloğuyla birebir tutsun; bozulursa müşteri yanlış fan seçer, iade ve güven kaybı olur; her değer kaynak sayfasına dayanır, canlı yazımı KATALOG hazırlar, Recep onayıyla OPS koşar.

## Görevler
| Görev | Sıklık | Tetik | Bağlı mı | Çıktı | Eşik |
|---|---|---|---|---|---|
| Kaynak dizini tazelik kapısı: dizin PDF'lerle ve çıktı CSV'leriyle örtüşüyor mu (kardeş depo scripts/kaynak_dizini/tazelik.py ve cikti_tazelik.py) | her dağıtım | Actions: venthub-pdf-ingestor/.github/workflows/kaynak-kapilari.yml (kardeş depoda her push ve PR) | evet | Kırmızıda PR durur; kusur sahibi KATALOG, Kanban kartı | Kapı çıkışı 0 (dizin diskle örtüşüyor, çıktı CSV'ler taze) |
| Katalog bütünlük kapısı: canlı katalog tutarlılığı tabana karşı; iş akışı dosyasının sahibi ALTYAPI, KATALOG yalnız katalog açısından kırmızıyı okur (`scripts/db/checks/catalog-integrity.mjs`) | her dağıtım | Actions: .github/workflows/db-advisor.yml (catalog-integrity işi) | evet | Kırmızıda Kanban kartı; katalog verisi tarafını KATALOG okur, iş akışı kusurunu ALTYAPI düzeltir | Taban dosyasına (scripts/db/checks/catalog-integrity-baseline.json) karşı yeni ihlal 0 |
| Veri çıkarım kapısı: Design'ın teslim ettiği CSV kaynağa karşı doğrulanır (venthub-pdf-ingestor veri_cikarim_kapisi.py --csv <yol>) | olay | kart kapısı: Design teslimini işleyen kartta kapı satırı (henüz yok); o zamana dek OPS teslimi bildirince elle | hayır (kuracak: HARITA) | OPS'a tek tablo; ihlaller Design'a | Kapı çıkışı 0; tablo hücresi kaynakta birebir yoksa yazılmaz |
| Baskı tazelik taraması: canlı değer ile üreticinin SON baskısı aile aile karşılaştırılır; önce ses, ağırlık, devir, sonra diğer alanlar (KTL-51) | aylık | istem satırı tazelik: istem satırında "katalog baskı: N gün" (30 gün eşik); satırı ARAÇ kuracak; üreticiden yeni baskı gelince de koşar | hayır (kuracak: ARAC) | Sapma tablosu (aile, alan, canlı değer, güncel baskı ve tarihi) ve her sapma için düzeltme betiği kartı | TASLAK: sapma 0 ya da her sapma bir kartla; eşiği KATALOG belirler |
| Yazım sonrası canlı sayfa ölçümü: OPS canlı yazımı bitirince yazılan değerin sayfada göründüğünü ölç (sunucu HTML'in veri yükü ve tarayıcıda model seçimi) | olay | kart kapısı: yazım kartında ölçüm notu satırı (henüz yok); OPS canlı yazımı sonrası | hayır (kuracak: HARITA) | Karta ölçüm notu (neyi, nasıl ölçtüm, sonuç) | Yazılan alanların tamamı sayfada beklenen değerde; sapma 0 |
| Haftalık öz-değerlendirme (OPS-168 O9): çürütücü haftanın kartlarını ve PR'larını rol kartına, kurallara ve Dosyalar satırına karşı okur; müdür en çok 3 iyileştirme önerir | haftalık | istem satırı tazelik: istem satırında "öz-değerlendirme: N gün" (7 gün eşik); satırı ARAÇ kuruyor (OPS-168 O6) | hayır (kuracak: ARAC) | OPS'a tek mesaj (O1); onaylanan uygulanır ya da metni HARİTA'ya bırakılır | En çok 3 öneri; aynı hata iki kez döndüyse hafta beklenmez, o gün yapılır |

6 görev, tetiğe bağlı 2. Tetiğin kurulmasını bekleyen: HARITA 2 · ARAC 2.
