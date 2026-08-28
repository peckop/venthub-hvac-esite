# Build-skip canlı ölçümü — D8.3 deneyi (2026-08-28)

> **Cetvel:** `docs/standards/deploy-build-skip-standard.md` §D8.3 (bilinen bilinmeyen)
> **Şerit:** I18N · **Kanıt kolu sahibi:** I18N (OPS devretti, 2026-08-27 20:33)
> **Durum:** ölçüt YAZILDI, sonuç BEKLENİYOR

## Niçin bu belge var

`#875` 2026-08-27 20:37:54Z'de indi (`d937fa8c`) ve build-skip zincirinin on gündür
ölü olan 2. adımını onardı. **Ama onarımın canlıda çalıştığı ÖLÇÜLMEDİ.** Merge
sonrası master dağıtımı kota reddine takıldı (`rate limited`, 20:37:58Z), yani
onarılmış betik bir kez bile koşmadı.

Bu belge, "indi = çalışıyor" beyanını imkânsız kılmak için ölçütleri **sonuç
gelmeden önce** yazar. Ölçütü sonradan seçmek, sonuca göre ölçüt seçmektir.

## Deneyin kendisi

Bu dosyanın kendisi deneydir: `docs/audits/**` altında **yeni** bir `.md`, yani
betiğin pozitif sınıf listesindeki `*.md` ve `docs/*` kalıplarının ikisine birden
giriyor. Tek dosyalık, %100 atlanabilir bir push.

**Tuzak, adıyla:** deney dosyası olarak mevcut bir cetveli seçmek YANLIŞ olurdu —
`docs/standards/*.md` manifest kaynağıdır, değiştirilirse INV-DOC-4b artefaktı
bayatlatır ve `ci` kırmızı yanar (2026-08-27'de tam bu yaşandı). Bu yüzden
**yeni** bir dosya seçildi: manifest onu kaynak olarak izlemiyor.

## Ölçütler (sonuç gelmeden yazıldı)

Üçü BİRLİKTE okunur. Tek ölçüt yanıltır.

| # | Ölçüt | Nasıl | Ne anlama gelir |
|---|-------|-------|-----------------|
| 1 | Dağıtım kaydı | Vercel `list_deployments`, bu dalın SHA'sı | `CANCELED` = atlama ÇALIŞTI · `READY` = atlama çalışmadı, build koştu · kayıt YOK = tetiklenmedi ya da reddedildi |
| 2 | GitHub damgası | `commits/<sha>/statuses`, context `Vercel` | `success` · `failure` + `rate limited` = kota reddi · damga YOK = hiç tetiklenmedi |
| 3 | Merge edilebilirlik | `gh pr view --json mergeStateStatus` | `BLOCKED` = zorunlu Vercel kapısı geçilmiyor |

### Ölçüt 1 ve 2 birlikte okunmalı — ayırt eden budur

2026-08-27'de neredeyse yanlış hüküm kuruldu: master dağıtımının kaydı yoktu ve
"kayıt yok → demek ki atlandı → çalışıyor" denebilirdi. **Yanlış olurdu.**

- **Atlanan** dağıtım `CANCELED` kaydı BIRAKIR.
- **Reddedilen** (rate limit) dağıtım HİÇ kayıt bırakmaz, ama GitHub'a kırmızı yazar.

Yani "kayıt yok" tek başına iki farklı dünyayla uyumludur; ayıran şey damganın
rengidir.

## Karar tablosu — hangi sonuç ne demek

| Kayıt | Damga | mergeState | Hüküm |
|-------|-------|------------|-------|
| `CANCELED` | `success` | temiz | ✅ **Atlama çalışıyor VE kapı geçiliyor** — hedeflenen durum |
| `CANCELED` | `failure`/yok | `BLOCKED` | ⚠ **Kilit takası** — kotayı kazandık, merge'i kaybettik; D8.3 riski gerçekleşti |
| `READY` | `success` | temiz | ❌ Atlama çalışmadı, build koştu — onarım yetersiz |
| yok | `failure` + rate limit | `BLOCKED` | ⏸ Deney KOŞMADI, kota reddi; tekrar dene |

## "Kilit takası" çıkarsa ne yapılacak (geri alma planı, önceden yazılı)

Kapıyı susturmak **seçenek değildir**. Sırayla:
1. Atlamayı daralt (yalnız `docs/audits/**` gibi en güvenli sınıflar).
2. Yetmezse `scripts/vercel-ignore-build.sh` değişikliğini geri al.
3. Zorunlu `Vercel` check'ini dal korumasından ÇIKARMAK önerilmez — o, ölçüyü
   kaybetmek pahasına kırmızıyı yok saymaktır.

## Sonuç

_(push sonrası doldurulacak — üç ölçüt de yazılacak, biri eksikse hüküm YOK)_
