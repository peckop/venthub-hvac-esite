Mobil ürün sayfasında seçim, fiyat ve ana eylemi taşıyan alt çubuk.

```jsx
<div style={{ position: 'sticky', bottom: 0 }}>
  <MobileBuyBar secimEtiketi="Ø100 · EC" eksenler={eksenler} secim={s} onSecim={setS}
    degerler={[{ e: 'Debi', v: '300 m³/h' }, { e: 'Basınç', v: '243,2 Pa' }, { e: 'Ses', v: '27,4 dB(A)' }]} kip="satis" fiyat={27218.08} />
</div>
```

- Seçim çipi görünürde 28 px, dokunma hedefi 44 px.
- Teklif kipinde fiyat yok, eylem "Teklif listesine ekle".
