
Fanın debi/basınç karakteristiği — ürün sayfasında modelin ne kadar kanala dayandığını gösterir.

```jsx
<PQEgrisi
  noktalar={[{ q: 0, p: 420 }, { q: 400, p: 380 }, { q: 800, p: 300 }, { q: 1200, p: 180 }, { q: 1500, p: 0 }]}
  calismaNoktasi={{ q: 800, p: 300 }}
/>
<PQEgrisi noktalar={egri} boyut="kisa" />
```

- **Verisi olmayan model için bölüm hiç çizilmez** — bileşen `null` döner, "eğri yakında" yazılmaz (K7).
- Çalışma noktası kesikli kılavuz çizgileriyle iki eksene bağlanır; okuyucu değeri eksenden okur.
- Çizim dili kılavuz F8: **ana eğri 2 px** lacivert, ikincil seri 1.5 px turkuaz, ızgara 1 px `--border-row`, eksen 1 px `--border-control`, çalışma noktası **kiremit**. Dolgu ve gradyan yok.
- Kiremit çalışma noktası, kiremidin üçüncü ve **son** izinli kullanımıdır (K35 eki); dördüncüsü açılmaz.
- İkincil seri (sistem direnci) `ikincilNoktalar` ile verilir; iki noktadan azsa çizilmez.
- `kisa` boyut mobil ve kart içi kullanım için.

