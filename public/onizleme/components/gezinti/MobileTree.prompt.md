Mobil katalog ağacı: ad → sayfa, sağdaki ⌄ yalnız o dalı açar. FloatingNav'ın sol parçası açar.

```jsx
<MobileTree panel acik={acik} onKapat={kapat} dugumler={agac} bulunulan="lineo-quiet" filtre={<FiltreGruplari ... />} sekme={s} onSekme={setS} />
```

- Ürün ailesi düğümü yalnız 2+ seride çizilir (tek seride seri türün altına çıkar).
- Seri altında en çok 12 model.
