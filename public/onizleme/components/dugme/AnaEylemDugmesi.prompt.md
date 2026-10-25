Sayfanın işini bitiren tek dolu kiremit düğme; sayfada yalnız bir tane kullanın.

```jsx
<AnaEylemDugmesi onClick={gonder}>Teklif iste</AnaEylemDugmesi>
<AnaEylemDugmesi tam>Ödemeye geç</AnaEylemDugmesi>
```

- Fiiller: teklif kipinde "Teklif iste", satış kipinde "Sepete ekle", panelde "Ödemeye geç". "Teklif al" yazılmaz.
- `tam` tam genişlik, `disabled` inset zemin + muted metin, `href` bağlantı.
- Öteki fiil her zaman `CerceveliDugme` olur.
