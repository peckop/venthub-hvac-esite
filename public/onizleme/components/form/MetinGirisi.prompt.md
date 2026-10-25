Etiketli metin giriş kutusu; teklif bilgileri (proje adı, not) ve teklif formu alanları için.

```jsx
<MetinGirisi metin={sozluk} etiket={A('ds.proje-adi')} deger={ad} onDeger={setAd} zorunlu aciklama={A('ds.proje-adi-aciklama')} />
<MetinGirisi metin={sozluk} etiket={A('t.not')} cokSatir deger={not} onDeger={setNot} yerTutucu={A('t.ornek-tavan-arasi-montaj-gece-calisacak-mevcut-k')} />
```

- Kutu 44 px, köşe 12; odakta 2 px petrol halka. Çok satır en az 3 satır.
- Yazılar çağırandan (sözlük); parça yalnız "Zorunlu" sözcüğünü `metin`den alır.
