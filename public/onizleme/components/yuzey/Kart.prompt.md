Ürün kartı ve genel içerik kartı; 16 px köşe, üstüne gelince gölge.

```jsx
<Kart href="/urun/lineo-100-q" gorsel="lineo.png" marka="Vortice" baslik="Lineo 100 Q" ozet="175 m³/h · 34 dB(A)" />
<Kart marka="AVenS" baslik="AKF 315 M" ozet="2 400 m³/h · 400 Pa" />
<Kart>Serbest içerik</Kart>
```

- Fotoğraf yoksa kutu çizilmez; kart 2 px petrol üst kuralla başlar. "Görsel yok" yazılmaz.
- Fotoğrafa rozet ya da yazı bindirilmez.
- Büyük blok ve panel için 24 px (`--radius-kart-buyuk`) kabı elle kurun; kart 16 px kalır.
