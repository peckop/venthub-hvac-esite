# DÜZENLİ GÖREVLER: OPS

> Üretilmiştir (`scripts/belge/rol-karti-uret.cjs`, veri: `scripts/belge/rol-gorevleri.json`); elle düzenleme. Yöneten cetvel: `docs/standards/duzenli-gorevler-standard.md`. Rol kartı: `docs/roller/OPS.md`.

## Amaç
Filo tek yönle ilerler: sıra, öncelik ve verilen sözler yazılı tutulur; Recep'e giden her cümle kaynağıyla ve tek yüzle gider.

## Nasıl
execution-method-standard.md, is-kayit-duzeni-standard.md, filo-tuzugu.md

## Görevler
| Görev | Sıklık | Tetik | Bağlı mı | Çıktı | Eşik |
|---|---|---|---|---|---|
| Haftalık öz-değerlendirme (OPS-168 O9): çürütücü haftanın kartlarını ve PR'larını rol kartına, kurallara ve Dosyalar satırına karşı okur; müdür en çok 3 iyileştirme önerir | haftalık | istem satırı tazelik: istem satırında "öz-değerlendirme: N gün" (7 gün eşik); satırı ARAÇ kuruyor (OPS-168 O6) | hayır (kuracak: ARAC) | OPS'a tek mesaj (O1); onaylanan uygulanır ya da metni HARİTA'ya bırakılır | En çok 3 öneri; aynı hata iki kez döndüyse hafta beklenmez, o gün yapılır |
| Haftalık filo raporu (tüzük Madde 7): departman karnesi (scripts/board/kanban-uyum.cjs) ve açık kalan işler tek tabloda Recep'e | haftalık | istem satırı tazelik: istem satırında "filo raporu: N gün" (7 gün eşik); satırı ARAÇ kuruyor (OPS-169) | hayır (kuracak: ARAC) | Recep'e tek tablo (Cuma); karne eşiğini aşan departman satırı kırmızıdır | Kanıtsız Done 0; kırmızı karne satırı aynı raporda sahibine kartla bağlanır |
| Açılış raporu (tüzük Madde 7): Recep'in ilk mesajında kırmızılar, onay bekleyenler ve günün sırası | olay | istem satırı tazelik: Recep'in günün ilk mesajı; oturum açılış kancası tetikler, satırı ARAÇ kuruyor (OPS-169) | hayır (kuracak: ARAC) | Tek tablo: Onayında satırları en üstte; değişen yoksa tek cümle | İlk mesajdan sonraki ilk cevapta; gün içinde yinelenmez |

3 görev, tetiğe bağlı 0. Tetiğin kurulmasını bekleyen: ARAC 3.
