Ürün sayfasının ilk ekranı: başlık, öne çıkan değer, model seçimi, fiyat ve ana eylem.

```jsx
<ProductCover marka="Vortice" markaLogo="assets/marka-logolari/vortice-yatay.png" ad="Lineo 100 Quiet ES" altSatir="Sessiz kanal fanı · VRT-17170"
  gorseller={[g0, g1, g2]} yuva={<FeatureSlot deger="27,4" birim="dB(A)" … />}
  eksenler={eksenler} kip="satis" fiyat={27218.08} />
{mobil ? <MobileBuyBar … /> : null}
```

- Sayfanın tek dolu kiremit düğmesi buradaki ana eylemdir.
- Fiyat yalnız satış kipinde ve kaynaktan; DB'de fiyat yoksa `fiyat` verilmez, "Teklif iste" kalır.
- Ses değeri kutusuz (FeatureSlot), fotoğraf 400 px sağda (mobil 300, üstte).
- Konum satırı kapakta yok; kapağın üstüne SectionRail konur.
- Fotoğraf varsayılan solda (`fotoTaraf: 'sol'`), seçim, fiyat ve ana eylem sağda; seri kapağıyla aynı hiza. Gezinme sayfalarında (ürün grubu, ürün türü) PageCover fotoğrafı sağda kalır.
