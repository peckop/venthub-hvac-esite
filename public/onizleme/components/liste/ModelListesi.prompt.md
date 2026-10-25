Model listesi 4c: masaüstü filtre solda, mobilde alttan "Filtrele" paneli; 24 model/sayfa, numaralı.

```jsx
<ModelListesi baslik="Modeller" modeller={M} gruplar={G} sutunlar={['Debi','Basınç','Ses']} kip="satis" />
<ModelListesi modeller={M} gruplar={G} serit="seri" mobil panelAcik={acik} onPanel={setAcik} />
```

- Ürün grubu sayfasında başlık "Tüm modeller".
- Satır yerinde açılır, kart sayfa açar.
- Arayüzde "Filtrele"; "Süzgeç" yazılmaz.
