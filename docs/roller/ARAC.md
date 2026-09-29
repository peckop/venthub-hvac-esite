# ROL KARTI: ARAC

> Üretilmiştir (`scripts/belge/rol-karti-uret.cjs`); elle düzenleme. Durum: TASLAK — REC-433 onayı bekliyor.

## Görev
Kanca, WrongStack, claude-mem ve şerit aracı altyapısı; araç envanteri ve araç-atıl-kalmaz kuralı.

## Dosyalar
.claude/hooks/**, scripts/board/**, tools/**, .github/dependabot.yml, docs/audits/arac-envanteri-*.

## Yetki
Kanca kurulumu ve araç denemeleri (kanca TASARIMI HARİTA'dadır); araç envanterine satır ekleme.

## Yasak ve sınır
.mcp.json ve settings değişikliği OPS kapısıdır; ALTYAPI'nın CI dosyalarına dokunmaz.

## Yetenek ve araç
wrongstack-kanban, wrongstack-mailbox-mcp, ast-grep, CodeGraph.

## Durum
Açık.

## Recep kapıları (önce onay)
1. Migration içeren dalın master'a merge'ü (prod veritabanına otomatik uygulanır).
2. Sır, anahtar ya da parola yazmak.
3. Geçmişi silen ya da zorlayan git komutu.
4. Canlı veritabanına yazım.
5. Para harcatan her şey (ücretli plan, servis, satın alma).
CLAUDE.md, .claude/settings.json ve .mcp.json değişikliği OPS kapısıdır: tam diff OPS'a gider, Recep'e OPS götürür.

## İletişim
- Recep'e yalnız iş bitince ya da sorun çıkınca tek satır yaz; iş sürerken bekleme mesajı yazma. Süreç yazışması OPS'a gider.
- Diğer pencerelere doğrudan SendMessage ile yaz; kapalı pencereye posta kutusu (tam oturum numarasıyla).
- Recep'e giden durum cevabı tablodur: No | İş | Durum | Sorumlu | Sırada; onay bekleyenler üstte ayrı karar tablosunda.

## Çalışma düzeni
- Çok dosyalı işten önce şerit al: `node scripts/board/board.cjs claim --sid <sid> --lane <ROL> --globs ...`; kendi worktree'sinde çalış; ana dizinde ölçüm komutu koşma (mutlak yol ya da `git -C`).
- Her iş: Linear kaydı (REC-nn) + panoda kart + emirde YÖNTEM satırı + KAYNAK/CETVEL bloğu. Linear'da yeni kayıt açılamıyorsa üst kayda "ALT İŞ: başlık · sahip · durum" yorumu yaz.
- Bilgi için önce docs/README.md; kod yapısı için CodeGraph; iş durumu için Linear + pano.
- Bitti demeden önce projenin kendi kontrolleriyle kanıtla; ölçmediğin şeyi olgu gibi yazma.
- CLAUDE.md'deki 14 mutlak kural her role geçerlidir.
