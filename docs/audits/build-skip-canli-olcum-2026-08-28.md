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

## Sonuç — 2026-08-28 06:48, ÜÇ ÖLÇÜT DE TUTTU

Push `06:48:17Z` (`2d4dce40`, dal `i18n/d83-canli-olcum`, PR #882).

| # | Ölçüt | Ölçülen | Hüküm |
|---|-------|---------|-------|
| 1 | Dağıtım kaydı | `CANCELED` (`dpl_DPk54eQ…`) | atlama ÇALIŞTI |
| 2 | GitHub `Vercel` damgası | `success` — *Canceled by Ignored Build Step* | kapı YEŞİL |
| 3 | `mergeStateStatus` | `CLEAN`, kırmızı 0, `MERGEABLE` | merge engellenmiyor |

**Karar tablosunun ilk satırı: atlama çalışıyor VE kapı geçiliyor.** D8.3'te yazılı
"kilit takası" riski ölçümle çürüdü; geri alma planına gerek kalmadı.

### Onarım gerçekten sınandı — zincir 2 koştu

Build günlüğü, on gün önce tam burada ölen zincirin devamını gösteriyor:

```
ignore-build: VERCEL_GIT_PREVIOUS_SHA bos (dalin ilk dagitimi) -> ortak ataya dusuyorum
ignore-build: origin uzagi yok, URL ortamdan kuruldu (https://github.com/peckop/venthub-hvac-esite.git)
ignore-build: taban = origin/master ile ortak ata (d937fa8c)
ignore-build: tum degisiklikler build-disi sinifta -> ATLA
```

Eski hâli: `origin/master bu klonda yok -> BUILD`, üstelik hata `2>/dev/null || true`
ile yutuluyordu.

**Aynı gün master koşumu bunu sınamamıştı** (`e4557793`): orada taban zincir 1'den
(`VERCEL_GIT_PREVIOUS_SHA`) çözülmüştü, çünkü master'ın önceki dağıtımı vardı.
Onarımın gerektiği vaka **dalın ilk dağıtımı**dır ve bu deney tam onu kurdu.

### Yanlış hükmün eşiğinden dönülen yer

`06:51`'de üçüncü ölçüt `BLOCKED` okunuyordu ve "kilit takası var" diye yazılabilirdi.
**Yanlış olurdu:** `BLOCKED`'in sebebi Vercel değil, henüz koşan `ci`/`admin-smoke`
idi. Ayırt eden şey durumun kendisi değil, **kırmızı listesinin içeriği**.

> `BLOCKED` tek başına "zorunlu kapı geçilmiyor" demek DEĞİLDİR.

### Sınır — adıyla

Bu vaka **tek dosyalıydı** ve `docs/audits/` altındaydı. Karışık bir PR'da tek bir
kaynak dosyası bile BUILD ettirir; doğru davranış budur. Bu sonuç, atlama listesini
genişletmek için gerekçe DEĞİLDİR (D2: bilmiyorsak BUILD).

### Filo için pratik karşılık

%100 atlanabilir push'lar artık **slot yakmıyor ve kapıyı geçiyor** — companion,
artefakt ve cetvel-dışı `.md` push'ları pencere beklemeden gidebilir. Kaynak dosyaya
dokunan push'larda pencere disiplini aynen sürer.
