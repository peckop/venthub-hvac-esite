# DÜZENLİ GÖREVLER: TAKIP

> Üretilmiştir (`scripts/belge/rol-karti-uret.cjs`, veri: `scripts/belge/rol-gorevleri.json`); elle düzenleme. Yöneten cetvel: `docs/standards/duzenli-gorevler-standard.md`. Rol kartı: `docs/roller/TAKIP.md`.

## Amaç
Kullandığımız dış araçların (Claude Code, WrongStack, notebooklm-py) yeni sürümünü ve bağlantı kopukluğunu işimizi aksatmadan yakalar; faydasını, riskini ve işin kime düştüğünü ölçüp yazar, böylece yükseltme sürpriz, kopukluk sessiz kalmaz.

## Nasıl
cetvel yok — yazımı kapsamda (WrongStack sürüm ve özellik ölçümü; ölçüm defteri docs/olcum/wrongstack-ozellik-envanteri.md)

## Görevler
| Görev | Sıklık | Tetik | Bağlı mı | Çıktı | Eşik |
|---|---|---|---|---|---|
| WrongStack sürüm farkı: kurulu sürümle GitHub son etiketini karşılaştır, yeni sürümün faydasını, riskini ve işin kime düştüğünü yaz | olay | istem satırı tazelik: .claude/hooks/wrongstack-satiri.cjs ⚠WRONGSTACK satırı farkı gösteriyor (ARC-24, karar 257; ağ ölçümü günde en çok bir kez, önbellekli); ikinci tetik Actions günlük etiket kontrolü: iş akışı PR'ı ARC-74'te hazırlanıyor, birleşmedi (kuracak: ARAÇ) | evet | OPS'a tek tablo (ne çıktı · bize faydası · risk · kime iş); yükseltme hazırlığı için ARAÇ panosuna kart | TASLAK: fark 0 ise rapor yok; son etiket kurulu sürümden büyükse rapor; GitHub'da olup npm'de olmayan etiket ayrı yazılır (1.0.30, 1.0.31, 1.0.34 örneği) |
| Claude Code sürümü: kurulu sürümle npm latest'i karşılaştır, değişiklik kaydından bize dokunan maddeleri ayıkla (claude --version, npm view @anthropic-ai/claude-code dist-tags) | olay | istem satırı tazelik: Claude Code için istem satırı yok; ⚠WRONGSTACK gibi bir sürüm satırı kurulacak (satır tasarımı HARİTA, kanca altyapısı gerekirse ARAÇ) | hayır (kuracak: HARITA) | OPS'a tek tablo; güncelleme kartı ARAÇ'a (pencereler kapalıyken yapılır) | TASLAK: kurulu sürüm latest'ten küçükse rapor; güvenlik etiketli madde varsa aynı gün, yoksa beklet |
| Haftalık öz-değerlendirme (OPS-168 O9): çürütücü haftanın kartlarını ve PR'larını rol kartına, kurallara ve Dosyalar satırına karşı okur; müdür en çok 3 iyileştirme önerir | haftalık | istem satırı tazelik: .claude/hooks/gorev-tazelik-satiri.cjs istem satırında "öz-değerlendirme: N gün" (7 gün eşik); damga scripts/hijyen/gorev-damga.cjs (ARC-216 A kolu) | evet | OPS'a tek mesaj (O1); onaylanan uygulanır ya da metni HARİTA'ya bırakılır | En çok 3 öneri; aynı hata iki kez döndüyse hafta beklenmez, o gün yapılır |

3 görev, tetiğe bağlı 2. Tetiğin kurulmasını bekleyen: HARITA 1.
