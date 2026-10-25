Ürün ailesi sayfasında seri seçimi; seçince seri kısmı değişir.

```jsx
<SeriesPicker seriler={[{ id: 'lineo', ad: 'Lineo', href: '/tr/urun/vortice-lineo' }, { id: 'lineo-quiet', ad: 'Lineo Quiet', href: '…' }]} secili="lineo-quiet" onSec={setSeri} />
```

- Tek serili ailede çizilmez; veride olmayan seri listeye konmaz.
- Mobilde FloatingNav `seriGecis` ile aynı `secili`.
