# Ağır Komut Kilidi Standardı (ARC-81)

> **Kapsam:** aynı anda birden çok pencerenin ağır komut (type-check, build, tam test, install)
> koşmasını sınırlayan kanca ve istem satırı. Tek pencerenin kendi bellek kuralı
> (`.claude/rules/filo-ortak.md` "Test ve bellek") bu cetvelin DIŞINDA; bu cetvel o kuralı
> **makine düzeyinde** zorlar.
> **Sürüm:** v1.0 · 2026-10-10
> **Sahibi:** ARAÇ
> **Son doğrulama:** 2026-10-10 (kanca, test ve bozma ölçüldü; canlı kabul ayar kaydından sonra)
> **Niçin bu cetvel doğdu:** kart ARC-81 "ağır komut kilidi için cetvel yok: yazımı bu işin
> kapsamında" dedi (kural 1). Kanca: `.claude/hooks/agir-komut-kilidi.cjs`; test:
> `src/__tests__/conformance/kanca-agir-komut-kilidi.test.ts`.

---

## §1 Niçin var — ölçülmüş kayıp

2026-10-09 19:57'de uygulama bellek bittiği için kapandı: 32,6 GB'ın 123 MB'ı boştu, dokuz pencere
14,9 GB tutuyordu, 399 süreç vardı, 19:58-20:02 arasında beş yeniden başlama oldu. Her pencere
kendi kuralına uyuyordu; makineyi bağlayan bir şey yoktu. Pencereler birbirinin ne koştuğunu bilmiyordu.

## §2 Kurallar

1. **Ağır sayılan komutlar:** type-check / `tsc`, `build` / `next build`, tam test (dosya argümansız
   `vitest` ya da `pnpm test`), tam `pnpm lint`, `knip`, `install` / `add` / `ci`, `docker`.
   `pnpm test:ilgili` ve dosya argümanlı `vitest` / `eslint` HAFİFTİR, kilitlenmez.
2. **Yuva:** ağır komut için `<pano>/agir-kilit/yuva-<i>` dizini atomik `mkdir` ile alınır.
   Varsayılan yuva sayısı **1**. Yuva doluysa komut REDDEDİLİR; cevap sahibi (pencere, komut, kaç dk
   önce) söyler ve "döngü kurma, bir kez daha dene" der.
3. **Bırakma:** PostToolUse(Bash) `--birak` yuvayı verir. Arka plan komutu (`run_in_background`) yuvayı
   BIRAKMAZ; komut hâlâ koşuyordur.
4. **Bayat yuva:** 20 dakikadan eski yuva ölü sayılır ve bir sonraki deneyen onu siler (pencere
   kapanır, iptal edilir, PostToolUse gelmez).
5. **Açık kalır:** kilit dizini yazılamıyor, girdi bozuk ya da beklenmeyen hata varsa komut GEÇER.
   Kilit emniyet kemeridir; bozulunca işi durdurmamalı.
6. **İstem satırı:** yuva doluyken `⚠KILIT: agir komut 1/1 dolu (<pencere> <komut> <dk> dk)`;
   kendi pencerende tutan sensin ise "sende". Boşken susar (eşikli satır, `bellek-yoklama` gibi).
7. **Pencere başına süreç sayımı** `bellek-yoklama.cjs` önbelleğindedir (`pencereler`,
   `pencereToplam`); `⚠BELLEK` satırı pencere başına 80 ya da pencereler toplamı 400 süreci
   aşınca "KALABALIK" der.

## §3 Eşikler ve nasıl ölçüldü

| Eşik | Değer | Dayanak | Ayar |
|---|---|---|---|
| Yuva sayısı (N) | 1 | boş bellek 2 GB civarı; tek type-check ~730 MB, tam test ve build bunun katı | `VENTHUB_AGIR_KILIT_N` |
| Bayat yuva (TTL) | 20 dk | tam test 10+ dk sürebilir; PostToolUse gelmezse en çok 20 dk bekletir | `VENTHUB_AGIR_KILIT_TTL_DK` |
| Pencere başı süreç | 80 | 2026-10-10 ölçümü: 7 pencere, 32-56 alt süreç (en çok 56); eşik gözlenen dağılımın üstünde | `VENTHUB_BELLEK_PENCERE_SUREC` |
| Pencereler toplamı | 400 | aynı ölçüm: toplam ~260-310; 10-09 olayında toplam süreç 399 idi | `VENTHUB_BELLEK_PENCERE_TOPLAM` |

**Sınır:** süreç eşikleri tek günün ölçümüdür; kullanımla yeniden ayarlanır (karne tarihi 2026-10-10).
Aynı ölçümde 124 `conhost.exe` ve 46 `python.exe` görüldü; hangi kancanın/sunucunun bıraktığı bu
cetvelin kapsamı dışında, ayrı ölçüm işidir.

## §4 Ayar kaydı (OPS kapısı)

`.claude/settings.json` değişikliği OPS'tadır; metin ARAÇ'tan gelir, OPS uygular.

PreToolUse → `matcher: "Bash"` grubuna eklenecek kanca:

```json
{
  "type": "command",
  "command": "node \"${CLAUDE_PROJECT_DIR:-.}/.claude/hooks/agir-komut-kilidi.cjs\"",
  "statusMessage": "agir-komut-kilidi"
}
```

PostToolUse → yeni grup:

```json
{
  "matcher": "Bash",
  "hooks": [
    {
      "type": "command",
      "command": "node \"${CLAUDE_PROJECT_DIR:-.}/.claude/hooks/agir-komut-kilidi.cjs\" --birak"
    }
  ]
}
```

**Geri alma:** iki kaydı sil. Yuva dizinini silmek gerekmez (20 dk içinde bayatlar). Kancayı
geçici kapatmak için `VENTHUB_AGIR_KILIT_N=99` yeter.

## §5 Kabul

- Test: `INV-AGIR-KILIT-1..3` (sınıflama tablosu, yuva dışlama/bırakma/bayat, kanca protokolü,
  istem satırı, pencere sayımı). Bozma: 18 mutasyonun 18'i yakalandı (2026-10-10).
- Canlı kabul (ayar kaydından sonra): iki pencerede aynı anda `pnpm type-check` denenince ikincisi
  `AGIR KOMUT KILIDI` ile reddedilir ve istem satırında `⚠KILIT` görünür. Bu ölçüm kayıttan sonra
  karta yazılır; ölçülmeden "çalışıyor" denmez.
