Kategori ve alt kategori sayfalarının sol süzgeç paneli: arama, kategori ağacı, marka/çap/motor çipleri.

```jsx
<CategoryFilters
  agac={[{ ad: 'Fanlar', n: 357, acik: true }, { ad: 'Kanal tipi fanlar', n: 43, seviye: 1, secili: true }]}
  gruplar={[{ id: 'marka', baslik: 'Marka', secenekler: [{ deger: 'vortice', ad: 'Vortice', n: 28 }, { deger: 'seat', ad: 'SEAT', n: 15 }] }]}
  onSuzgec={setSuzgec} />
```

- Kaynak: S5 `parca/CategoryFilters.dc.html`. Sayımlar çağırandan gelir.
- `mobil`: tetik düğmesi + alt panel (perde, 24 px üst köşe, "N modeli göster").
