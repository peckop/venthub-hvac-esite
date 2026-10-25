Seri sayfasında Modeller listesinin üstündeki ihtiyaç girdisi (debi + statik basınç); değerler listeyi sıralar ve satırlara sonuç yazar.

```jsx
<DutyPointGate deger={ih} onDegisim={setIh} metin={sozluk} />
{modeller.map(m => <ModelRow key={m.sku} urun={m} sonuc={sonucHesapla(m, ih)} metin={sozluk} />)}
```

- Mekân çipleri yok (mekân uygunluğu iptal, Recep 10-24).
