Seri ve ürün sayfasında bölümler arası gezinme şeridi; header'ın altında yapışık durur.

```jsx
<SectionRail konum="Anasayfa › … › Kanal Tipi Fanlar › Lineo Quiet" bolumler={[{ id: 'modeller', ad: 'Modeller' }, { id: 'ses', ad: 'Ses' }, { id: 'sorular', ad: 'Sorular' }, { id: 'rehber', ad: 'İlgili rehberler', kisa: 'Rehber' }]} etkin={aktif} onSec={kaydir} />
<SectionRail mobil geri={{ ad: 'Lineo Quiet' }} sayfaAdi="Lineo 100 Quiet ES" bolumler={…} etkin={aktif} onSec={kaydir} />
```
