Seri sayfasının kapağı: logo, seri adı, aralık değerleri ve model bulma düğmesi.

```jsx
<SeriesHeader marka="Vortice" markaLogo="assets/marka-logolari/vortice-yatay.png" seriAdi="Lineo Quiet" seriTanimi="Sessiz Kanal Fanları"
  degerler={[{ e: 'Çap', v: 'Ø100–315 mm' }, { e: 'Debi', v: '260–2.890 m³/h' }, { e: 'Motor', v: 'AC · EC' }]}
  foto={{ src: url }} onBul={kaydir} />
```

- Seri sayfasında teklif/sepet düğmesi yok (CLAUDE.md eylem kuralı).
- Alt satırdaki çizgi petrol; kiremit değil.
- Konum satırı kapakta yok; kapağın üstüne SectionRail konur.
