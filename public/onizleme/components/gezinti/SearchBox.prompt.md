Katalog araması; sonuçlar seviyeye göre gruplu.

```jsx
<SearchBox deger={q} onDeger={setQ} gruplar={[{ seviye: 'model', ad: 'Ürünler', sonuclar }, { seviye: 'seri', ad: 'Seriler', sonuclar: S }]} />
<SearchBox mobil deger={q} onDeger={setQ} gruplar={G} />
```

- Eşleştirme çağıranda; en az 2 harfte açılır.
- Satış kipinde model satırının sağında fiyat.
