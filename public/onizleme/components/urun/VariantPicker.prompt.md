Ürün sayfasında çap/motor gibi eksenlerle model seçimi.

```jsx
<VariantPicker eksenler={[
  { id: 'cap', ad: 'Çap (mm)', secenekler: ['100','125','150','200','250','315'].map(d => ({ deger: d, ad: d })) },
  { id: 'motor', ad: 'Motor', secenekler: [{ deger: 'AC', ad: 'AC' }, { deger: 'EC', ad: 'EC' }] },
]} onSecim={setSecim} />
```

- Çip 44 px (kaynak masaüstünde 40/36 px; 44 px dokunma kuralı uygulandı).
