Ürün ailesi sayfasının katalog kipi; kapaktaki "Katalog modu" çipi açar. Sayfa PDF görünümüyle: yazısız zemin + konumlu gerçek metin + tıklanır model adları.

```jsx
{katalog ? <CatalogMode metin={sozluk} baslik="Lineo · katalog" toplam={40} sayfalar={aile.katalog.sayfalar} atlamalar={[{ ad: 'Tablo', no: 28 }, { ad: 'Eğri', no: 30 }]} onModel={modeliAc} onSiteyeDon={() => setKatalog(false)} /> : <AileSayfasi />}
```

- Bizim dilde yalnız çerçeve; sayfa katalog gibi kalır (595×842).
- Katman dile göre ayrı (`<aile>.<dil>` verisi); eksikse yazı çizilmez.
