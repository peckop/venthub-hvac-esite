Ürünü teklif listesine ya da sepete ekleyen düğme; kart, satır ve ürün sayfasında aynı.

```jsx
<QuoteRequestButton kip="teklif" />
<QuoteRequestButton kip="satis" fiyatVar />
<QuoteRequestButton boyut="etiket" kip="satis" fiyatVar listede={false} />
```

- Kaynak: ds-cevap-2026-10-22 madde 4; ölçü S5 6c-3 (ikon), Ürün Sayfası Alternatifler 5a/9a (etiket).
- Sayfada tek dolu kiremit kuralı (K5) etiket boyutu içindir; kart içi sepet ikonu da kiremittir (CLAUDE.md: aynı eylem her yerde aynı renk).
- Kart/satırdaki ikonlar artılı (belge + artı, araba + artı); header ve mobil alt çubukta artısız (KabukBandi).
- Yanında her zaman `CompareButton` (solda).
