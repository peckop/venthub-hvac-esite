Ürün sayfası kapağında alt kategorinin ayırt edici değerini (ses, genişlik) büyük sayı ve çizgiyle gösterir. Kutusuzdur, doğrudan kapak zemininde durur.

```jsx
<FeatureSlot deger="27,4" birim="dB(A)" etiket="katalog ses seviyesi, 3 m"
  olcek={{ min: 20, max: 60, etiketler: ['20', '30', '40', '50', '60 dB(A)'] }} isaret={{ tur: 'nokta', deger: 27.4 }} />
<FeatureSlot deger="900" birim="mm" etiket="perde genişliği" olcek={{ min: 0, max: 2000, etiketler: ['0','1000','2000 mm'] }} isaret={{ tur: 'bolum', bas: 0, son: 900 }} />
```

- SoundCard ve WidthCard bu bileşenin iki dolumudur.
- Mekân yazısı, sınır çizgisi ve seri noktaları yoktur (mekân uygunluğu iptal).
- Sayı yalnız kaynaktan; verisi olmayan üründe yuva çizilmez.
