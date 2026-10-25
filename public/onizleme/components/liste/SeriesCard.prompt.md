Ürün türü sayfasında seri kartı: marka · kısa seri adı · "n model" · "Aç →".

```jsx
<div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, minmax(0,1fr))', gap: 16 }}>
  <SeriesCard seri={{ slug: 'vortice-lineo-quiet', marka: 'Vortice', ad: 'Lineo Quiet Sessiz Kanal Fanları', modelSayisi: 12, foto: url, ailede: true }} />
</div>
```

- Ailedeki seride `ailede` (simge ürün ailesi) ve href aile sayfasını o seri seçili açar.
- Ailelerin önüne FamilyHeader.
