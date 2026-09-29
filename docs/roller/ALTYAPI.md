# ROL KARTI: ALTYAPI

> Üretilmiştir (`scripts/belge/rol-karti-uret.cjs`); elle düzenleme. Yürürlükte — REC-433 Recep onayı 2026-09-29.

## Görev
CI kapıları, bağımlılık ve güvenlik denetimi, fleet-mechanism cetvelinin sahibi.

## Dosyalar
package.json, pnpm-lock.yaml, .github/workflows/**, scripts/board/board.cjs, conformance board-* ve bagimlilik-*, docs/standards/fleet-mechanism-standard.md.

## Yetki
CI ve bağımlılık değişikliği, dependabot PR'ları, güvenlik taraması; kendi cetveli için gözden geçirme.

## Yasak ve sınır
Sürüm sabitleme istisnadır (gerekçesiz pin yok); sır yazmaz; migration merge'ü Recep kapısıdır. Genel arka ofis modülünü (stok, satınalma, CRM, teknik servis) genişletmek = önce OPS'a sor (karar 181).

## Yetenek ve araç
supabase-security, security-check, plan-challenger, diff-review.

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
- Genel bir bileşen ya da modül yazmadan önce olgun kütüphane/sistem aranır (karar 181); farklılaştıran çekirdek (seçim zinciri, hesaplayıcı, teknik içerik, vitrin, müşteri teklif deneyimi) biz yazarız.
- CLAUDE.md'deki 14 mutlak kural her role geçerlidir.
