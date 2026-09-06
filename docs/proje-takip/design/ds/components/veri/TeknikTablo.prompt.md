
Ürün ve model verisini üç kolonda gösteren teknik tablo; ölçülen her değerin yanında ne anlama geldiği yazar.

```jsx
<TeknikTablo satirlar={[
  { alan: 'Debi', deger: '1.200 m³/h', anlam: 'Serbest üfleme' },
  { alan: 'Basınç', deger: '320 Pa', anlam: 'Kanal uzadıkça bu payı tüketirsiniz' },
  { alan: 'Ses gücü', deger: null }
]} />
```

- Üçüncü satır çizilmez: değeri yok. Satır uydurmak yerine satır düşer (K7).
- Tablo 3 satırla da 12 satırla da durur; başlık satırı zorunlu değildir.
- Sayılar mono ve tabular; alan adları Archivo 400.
- Uzun değer dizeleri (föy, sipariş kodu listesi) için kolon genişliği verilir; **değer kısaltılmaz**: `kolonlar={{ deger: '240px' }}`. Hücreler `overflow-wrap: anywhere` taşıdığı için değer sarar, anlam sütununun üstüne basmaz.
- Başlık satırı gerekiyorsa `basliklar={['Alan','Değer','Ne anlama gelir']}` verilir — tablonun üstüne elle başlık çizilmez, hiza kayar.
- Model **karşılaştırması** bu bileşenle yapılmaz: transpoze düzen (satır = alan, kolon = model) `KarsilastirmaTablosu`'nun işidir; K7 kuralı orada farklıdır.

