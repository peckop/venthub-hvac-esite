Sitenin açık header'ı ve petrol alt bilgisi; her sayfa bu iki bantla sarılır.

```jsx
<KabukBandi rol="header" logoSrc="assets/logo/venthub-kilit-yatay-tamrenk.svg" sayac={3} onIletisim={panelAc} onHesap={giris} onMenu={menuAc} yapiskan />
<KabukBandi rol="footer" logoSrc="assets/logo/venthub-kilit-yatay-tamrenk-koyu.svg">© 2026 VentHub</KabukBandi>
```

- Varsayılan header tek bant: İletişim, Hesap ve Menü yalnız simge; Teklif/Sepet simge + yazı. Bilgi Merkezi ve "Ürünler" header'a konmaz.
- `ikiKat` yalnız "İki kat" header seçeneği içindir (≥1180 px'te yazılı kalemler + ürün grubu şeridi).
- Alt bilgi petrol; orada ikonlar `-koyu` sürüm.
