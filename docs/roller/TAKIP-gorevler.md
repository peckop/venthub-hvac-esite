# DÜZENLİ GÖREVLER: TAKIP

> Üretilmiştir (`scripts/belge/rol-karti-uret.cjs`, veri: `scripts/belge/rol-gorevleri.json`); elle düzenleme. Yöneten cetvel: `docs/standards/duzenli-gorevler-standard.md`. Rol kartı: `docs/roller/TAKIP.md`.

## Amaç
Kullandığımız dış araçların (Claude Code, WrongStack, notebooklm-py) yeni sürümünü ve bağlantı kopukluğunu işimizi aksatmadan yakalar; faydasını, riskini ve işin kime düştüğünü ölçüp yazar, böylece yükseltme sürpriz, kopukluk sessiz kalmaz.

## Görevler
| Görev | Sıklık | Tetik | Bağlı mı | Çıktı | Eşik |
|---|---|---|---|---|---|
| WrongStack sürüm farkı: kurulu sürümle GitHub son etiketini karşılaştır, yeni sürümün faydasını, riskini ve işin kime düştüğünü yaz | olay | istem satırı tazelik: .claude/hooks/wrongstack-satiri.cjs ⚠WRONGSTACK satırı farkı gösteriyor (ARC-24, karar 257; ağ ölçümü günde en çok bir kez, önbellekli); ikinci tetik Actions günlük etiket kontrolü: iş akışı PR'ı ARC-74'te hazırlanıyor, birleşmedi (kuracak: ARAÇ) | evet | OPS'a tek tablo (ne çıktı · bize faydası · risk · kime iş); yükseltme hazırlığı için ARAÇ panosuna kart | TASLAK: fark 0 ise rapor yok; son etiket kurulu sürümden büyükse rapor; GitHub'da olup npm'de olmayan etiket ayrı yazılır (1.0.30, 1.0.31, 1.0.34 örneği) |
| Claude Code sürümü: kurulu sürümle npm latest'i karşılaştır, değişiklik kaydından bize dokunan maddeleri ayıkla (claude --version, npm view @anthropic-ai/claude-code dist-tags) | olay | istem satırı tazelik: Claude Code için istem satırı yok; ⚠WRONGSTACK gibi bir sürüm satırı kurulacak (satır tasarımı HARİTA, kanca altyapısı gerekirse ARAÇ) | hayır (kuracak: HARITA) | OPS'a tek tablo; güncelleme kartı ARAÇ'a (pencereler kapalıyken yapılır) | TASLAK: kurulu sürüm latest'ten küçükse rapor; güvenlik etiketli madde varsa aynı gün, yoksa beklet |
| MCP bağlantı sağlığı: bağlanamayan ya da kimlik bekleyen sunucuyu bul, sebebini ölç, sahibine kart aç (claude mcp list) | olay | istem satırı tazelik: Tekrarlanan satır ya da kapı yok: Claude Code açılışta "bağlanamadı" bildirimini bir kez gösteriyor; notebooklm-py bu yüzden 09-09'dan beri kopuk kaldı ve kimse sebebini aramadı (ARC-70); pencere açılışında koşması hedeflenir | hayır (kuracak: ARAC) | Sahibine sebebi ölçülmüş Kanban kartı | TASLAK: bağlanamayan sunucu 0; kimlik bekleyen ayrı sayılır |
| Bağımlılık güncelleme önerileri: her açık güncelleme PR'ı için birleştir / önce sına / kapat hükmü yaz | olay | istem satırı tazelik: ⚠BAGIMLILIK satırı son tarama süresini ve high sayısını gösteriyor, açık güncelleme PR sayısını göstermiyor (TAKİP satır metninden çıkardı, kanca okunmadı); sayıyı gösteren satırı HARİTA tasarlayacak, kanca altyapısı gerekirse ARAÇ | hayır (kuracak: HARITA) | PR'a hüküm notu ve OPS'a tek tablo; birleştirmeyi ya da kapatmayı ARAÇ ya da OPS yapar, TAKİP yapmaz | TASLAK: hükümsüz açık güncelleme PR'ı 0 |

4 görev, tetiğe bağlı 1. Tetiğin kurulmasını bekleyen: HARITA 2 · ARAC 1.
