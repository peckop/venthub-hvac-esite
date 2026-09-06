
İki ya da daha fazla modeli aynı alanlar üzerinden karşılaştıran transpoze tablo.

```jsx
<KarsilastirmaTablosu
  modeller={['CA 150 MD E', 'CA 200 MD E', 'CA 250 MD E']}
  satirlar={[
    { alan: 'Debi', degerler: ['1.200 m³/h', '1.850 m³/h', '2.400 m³/h'] },
    { alan: 'Statik basınç', degerler: ['320 Pa', '410 Pa', null] },
    { alan: 'Ses gücü', degerler: [null, null, null] }
  ]}
/>
```

- Üçüncü satır çizilmez: hiçbir modelde değer yok. İkinci satır **çizilir**, üçüncü modelin hücresi boş kalır — tire ya da "belirtilmemiş" yazılmaz.
- Tek modelin verisi için bu bileşen kullanılmaz; o `TeknikTablo`'dur (alan · değer · anlam).
- İlk kolon yatay kaydırmada yerinde kalır; mobilde satır sayısı ekran tarafında kısaltılır (ölçüm: masaüstü 11, mobil 6).
- Model sayısı 2–5. Daha fazlası kolonları okunmaz hâle getirir; o durumda ekran seçim yapar, bileşen genişletilmez.

