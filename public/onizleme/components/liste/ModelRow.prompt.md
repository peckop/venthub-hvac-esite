Seri sayfası "Modeller" ve kategori "Tüm modeller" listesinde tek model satırı.

```jsx
<div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
  <ModelRow kip="satis" urun={{ sku: 'VRT-17160', ad: 'Lineo 100 Quiet', kod: 'VRT-17160', degerler: [{ v: '260', birim: 'm³/h' }, { v: '26,1', birim: 'dB(A)' }], gorseller: [url], fiyat: 8962.05 }} />
  <ModelRow urun={u} sonuc={{ metin: '3. hız · 28,5 dB(A)', durum: 'yeter', sinirAlti: 30 }} />
</div>
```

- Satırlar arası 8 px.
- Sıra (sonuç varken): yetenler (en sessiz başta) → sınırda → yetmez; sıralama çağıranın.
