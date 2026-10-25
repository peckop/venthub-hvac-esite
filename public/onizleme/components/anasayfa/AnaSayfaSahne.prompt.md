Ana sayfanın üst sahnesi; ürün gruplarını döner bir sahnede gösterir. Sayfanın tek dolu kiremit düğmesi buradaki "Teklif iste"dir.

```jsx
<AnaSayfaSahne metin={sozluk} kip="teklif" urunler={gruplar} onTeklif={teklifAc} />
```

- Yalnız ana sayfada; kendi kendine dönme başka yerde yok.
- Zemin geçişi gradyan istisnasıdır.
