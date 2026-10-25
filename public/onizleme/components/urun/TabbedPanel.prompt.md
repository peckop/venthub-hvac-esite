Ürün sayfasında teknik özellikler, performans, ürün hakkında ve belgeler bölümlerini tek kartta sekmeyle gösterir.

```jsx
<TabbedPanel bolumler={[
  { id: 'teknik', baslik: 'Teknik özellikler', icerik: <TeknikTablo … /> },
  { id: 'performans', baslik: 'Performans', icerik: <Performance … /> },
]} mobil={mobil} />
```

- Bütün bölümler DOM'da kalır (hidden); SectionRail bağlantıları id ile çalışır.
