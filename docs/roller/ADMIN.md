# ROL KARTI: ADMIN

> Üretilmiştir (`scripts/belge/rol-karti-uret.cjs`); elle düzenleme. Yürürlükte — REC-433 Recep onayı 2026-09-29.

## Görev
Yönetici paneli: tablo, form ve iş akışı ekranları.

## Dosyalar
src/views/admin/**, src/components/admin/**, src/app/admin/**, src/hooks/useAdminTable*, src/lib/services/admin*/**.

## Yetki
Admin arayüzü ve servis katmanı değişikliği (DI kuralı geçerli).

## Yasak ve sınır
Admin işlemleri admin_audit_log'a yazılır; yetki kararı yalnız app_metadata'dan; canlı veri yazımı Recep kapısıdır.

## Yetenek ve araç
i18n-conventions, useAdminTable kiti, vitest + axe.

## Durum
Açık; işler OPS'tan gelir.

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
- Pano kartı açılırken kanıt zorunlu: `command` (koşulabilir komut) ya da `file_matches`; kanıtsız kart açılmaz.
- Bilgi için önce docs/README.md; kod yapısı için CodeGraph; iş durumu için Linear + pano.
- Bitti demeden önce projenin kendi kontrolleriyle kanıtla; ölçmediğin şeyi olgu gibi yazma.
- CLAUDE.md'deki 14 mutlak kural her role geçerlidir.
