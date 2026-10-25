İki ya da daha çok modelin teknik değerlerini yan yana gösterir.

```jsx
<KarsilastirmaTablosu modeller={['Lineo 100 Q','Lineo 125 V0']} sabitKolon={1} satirlar={[
  { alan: 'Debi', degerler: ['175 m³/h', '280 m³/h'] },
  { alan: 'Ses basıncı', degerler: ['34 dB(A)', null] },
]} />
```

- Boş hücre boş kalır; tire yazılmaz.
- `sabitKolon` seçili modeli kaydırmada sabitler.
