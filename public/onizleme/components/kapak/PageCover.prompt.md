Kategori ve alt kategori sayfalarının kapağı; SeriesHeader ve ProductCover da bunun üstüne kurulur.

```jsx
<SectionRail konum="Anasayfa › Fanlar" bolumler={[]} />
<PageCover baslik="Fanlar"
  altSatir="Ürün grubu · alt kategoriler aşağıda"
  cipler={[{ ad: 'Kanal Tipi Fanlar' }, { ad: 'Çatı Tipi Fanlar' }]} tumu={{ ad: 'Tümü ↓' }}
  foto={{ src: url }} />
```

- Çip 44 px (kaynakta 40; dokunma kuralı).
- Teklif/sepet düğmesi kapakta yok (yalnız ürün sayfasında).

- Konum satırı kapakta çizilmez; yalnız üstteki SectionRail'de (mobil "‹ geri" dahil).
