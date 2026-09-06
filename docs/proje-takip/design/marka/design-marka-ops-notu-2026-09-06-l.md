
# DESIGN-MARKA → OPS · 2026-09-06 · emir #8 KAPANDI · iki Tailwind eşlemesi

Değer üretilmedi; yalnız eşleme. İki ad `brand/tokens.css`'te zaten vardı, `tailwind-brand.js`'te
yoktu.

## Yapılan

`brand/tailwind-brand.js` → `theme.extend.colors` sonuna, dosyadaki kalıbın birebir aynısıyla:

```js
'text-on-dark':      'hsl(var(--text-on-dark) / <alpha-value>)',
'text-on-dark-muted': 'hsl(var(--text-on-dark-muted) / <alpha-value>)',
```

## Ölçüm satırı

| Ölçüm | Sonuç |
|---|---|
| `tailwind-brand.js` · `text-on-dark` | 1 |
| `tailwind-brand.js` · `text-on-dark-muted` | 1 |
| `tokens.css` renk tokeni ↔ Tailwind eşlemesi | **tam** — eksik eşleme 0 |
| Eşleme sayısı | 19 → **21** renk |

Eşlenen 21 ad: `primary-navy` · `brand-cyan` · `brand-cyan-ink` · `action-terracotta` ·
`action-terracotta-deep` · `accent-air-green` · `warn-amber` · `surface-page` · `surface-card` ·
`surface-inset` · `surface-subtle` · `surface-dark` · `surface-dark-inset` · `border-hairline` ·
`border-control` · `border-row` · `text-strong` · `text-body` · `text-muted` ·
**`text-on-dark`** · **`text-on-dark-muted`**.

Değerler: `--text-on-dark` `0 0% 100%` (beyaz) · `--text-on-dark-muted` `215 26% 65%` (#8FA2BD;
lacivert bantta 5.42 · `#0F1723` üstünde 6.92). Ham hex yazılmadı, ikisi de HSL üçlüsü üzerinden
okunuyor — yeni ham-hex ölçütüyle uyumlu.

## `brand/README.md` damgası

Depoya alma 2. maddesine eklendi: eşleme `tokens.css` ile tam, koyu zemin metin adları da
eşlenmiş — K22'nin soluk hâli depoda Tailwind sınıfıyla yazılabilir, ham hex gerekmez
(REC-165 köprüsünün beklediği iki ad).

## Aynı turda alınan iki kalem (çip tazelemesinden, emir dışı)

Recep çipi yeniledi; bağlı kopyada benim kaydımda eksik olan iki şey vardı:

1. **K5 eki — kiremitin üç izinli kullanımı:** logo üst dilimi · sayfanın tek ana eylemi ·
   **P-Q çalışma noktası**. Üçüncüsü K35 ile fiilen açılmıştı, K5 satırı güncellenmemişti;
   tutarsızlık kapandı. Dördüncü kullanım açılmaz. Kılavuz F8 kartına da yazıldı.
2. **Ham hex etikettir, ölçüt HSL üçlüsüdür** (`#24395C` → `#24385C` render sapması ölçülmüş).
   Karar kaydına palet başlığının altına girdi; ham-hex denetimi hex eşitliği aramaz.

Teyit: bağlı kopyada `PQEgrisi` **520×260 · 330×200** + "verisi yoksa çizilmez" ile duruyor —
F8/K35 birebir inmiş, ayrışma yok.

## Sırada bende iş yok

DS türev alır (ikinci çipten sonra). Kimlik tarafında açık kalem yok; F5–F8 kapandı,
K32–K36 kayıtta.

**Kullanılan `/` yeteneği:** bu turda yok.

— DESIGN-MARKA (Opus) 2026-09-06

