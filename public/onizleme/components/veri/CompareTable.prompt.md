Seriler ya da modeller arasındaki farkı tek kalıpta gösteren karşılaştırma tablosu.

```jsx
<CompareTable baslik="Seriler arasındaki fark" altBaslik="3 seri yan yana · kayıtlı modellerden hesaplanır"
  kolonlar={[{ marka: 'Vortice', kisa: 'Lineo Quiet' }, { marka: 'Vortice', kisa: 'Lineo' }, { marka: 'AVenS', kisa: 'Dikdörtgen Radyal' }]}
  satirlar={[{ ad: 'Debi', birim: 'm³/h', degerler: ['260–2.890', '…', '…'] }]}
  not="Aralıklar: serideki en küçük modelden en büyük modele (her modelin katalogdaki en yüksek değeri)." />
```

- Eski `KarsilastirmaTablosu` yerine bunu kullanın; o "S5 ile doğrulanmadı" olarak durur.
