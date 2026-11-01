# DÜZENLİ GÖREVLER: OPS

> Üretilmiştir (`scripts/belge/rol-karti-uret.cjs`, veri: `scripts/belge/rol-gorevleri.json`); elle düzenleme. Yöneten cetvel: `docs/standards/duzenli-gorevler-standard.md`. Rol kartı: `docs/roller/OPS.md`.

## Amaç
Filo tek yönle ilerler: sıra, öncelik ve verilen sözler yazılı tutulur; Recep'e giden her cümle kaynağıyla ve tek yüzle gider.

## Nasıl
execution-method-standard.md, is-kayit-duzeni-standard.md, filo-tuzugu.md

## Görevler
| Görev | Sıklık | Tetik | Bağlı mı | Çıktı | Eşik |
|---|---|---|---|---|---|
| Haftalık öz-değerlendirme (OPS-168 O9): çürütücü haftanın kartlarını ve PR'larını rol kartına, kurallara ve Dosyalar satırına karşı okur; müdür en çok 3 iyileştirme önerir | haftalık | istem satırı tazelik: .claude/hooks/gorev-tazelik-satiri.cjs istem satırında "öz-değerlendirme: N gün" (7 gün eşik); damga scripts/hijyen/gorev-damga.cjs (ARC-216 A kolu) | evet | OPS'a tek mesaj (O1); onaylanan uygulanır ya da metni HARİTA'ya bırakılır | En çok 3 öneri; aynı hata iki kez döndüyse hafta beklenmez, o gün yapılır |
| Haftalık filo raporu (tüzük Madde 7): departman karnesi (scripts/board/kanban-uyum.cjs) ve açık kalan işler tek tabloda Recep'e | haftalık | istem satırı tazelik: .claude/hooks/gorev-tazelik-satiri.cjs istem satırında "filo raporu: N gün" (7 gün eşik); damga scripts/hijyen/gorev-damga.cjs (ARC-216 A kolu) | evet | Recep'e tek tablo (Cuma); karne eşiğini aşan departman satırı kırmızıdır | Kanıtsız Done 0; kırmızı karne satırı aynı raporda sahibine kartla bağlanır |

2 görev, tetiğe bağlı 2.
