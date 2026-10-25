Tek ürünün teknik değerleri için alan · değer · anlam tablosu.

```jsx
<TeknikTablo basliklar={['Alan','Değer','Anlam']} satirlar={[
  { alan: 'Debi', deger: '175 m³/h', anlam: 'Serbest üflemede' },
  { alan: 'Ses basıncı', deger: '34 dB(A)', anlam: '3 m mesafede' },
]} />
```

- Boş değerli satır kendiliğinden düşer; tire ya da "belirtilmemiş" yazılmaz.
- Çok modelli karşılaştırma için `KarsilastirmaTablosu`.
