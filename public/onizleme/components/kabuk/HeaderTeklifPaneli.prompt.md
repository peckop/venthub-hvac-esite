Header'daki Teklif/Sepet sayacına basınca açılan liste paneli.

```jsx
<HeaderTeklifPaneli acik={acik} onKapat={() => setAcik(false)} kip="teklif"
  urunler={[{ sku: 'VRT-17170', ad: 'Lineo 100 Quiet ES', kod: 'VRT-17170', foto: url, adet: 1 }]} onAdet={setAdet} onSil={sil} />
```

- Mobilde alt sekme çubuğundaki "Teklif (n)" açar. İletişim panel değil, sayfadır.
