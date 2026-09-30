# skills-hazir — uyarlanmış ama ETKİN OLMAYAN skill'ler

Bu klasör Claude Code'un skill tarayıcısına GÖRÜNMEZ (`.claude/skills/` altında değil). Buraya, uyarlaması bitmiş ama çalışması için gereken bir parça (sunucu, araç, ayar) henüz bizde olmayan skill'ler konur. Neden ayrı klasör: çalışmayan komut anlatan bir skill oturum açıklama yükünü boşuna artırır ve modeli olmayan bir araca yönlendirir.

## Kural

1. Her skill künyesinde `metadata.durum: "HAZIR - …"` alanı ve NEDEN etkin olmadığı yazılıdır (ne eksik, kim kuracak).
2. Aynı ad `.claude/skills/` altında bulunamaz (çift yükleme; kapı `INV-SKILLS-HAZIR-1`).
3. Dış kaynaklıysa `NOTICE.md`'de satırı vardır (kapı `INV-NOTICE-KAPSAM-1` bu klasörü de tarar).
4. **Etkinleştirme = klasörü `.claude/skills/<ad>/` altına taşımak.** Eksik parçanın gerçekten çalıştığı ÖLÇÜLDÜKTEN sonra yapılır; taşımayı yapan PR künyedeki `durum` alanını kaldırır ve o skill'e bağlı ek kuralları günceller.

## İçindekiler

| Skill | Eksik parça | Sahibi | Taşınınca güncellenecek |
|---|---|---|---|
| `mailbox-bridge` | `wstack mailbox serve` (wstack CLI kurulu değil; köprü kodu kurulu paketlerde yok) | ARAÇ | `wrongstack-mailbox-mcp` ek kural 9 ("mailbox-bridge kullanılmaz") |
| `wrongstack-mailbox` | `mailbox-bridge` sunucusu (istemci rehberi) | ARAÇ | `mailbox-bridge` ile birlikte taşınır; değer notu skill başında |

İnceleme kaydı: `docs/audits/` altında WrongStack skill incelemesi (REC-519); kaynak: `@wrongstack/core` 1.0.26, MIT.
