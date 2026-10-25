Ürün sayfasında kullanıcının debi ve basınç değerleriyle modelin hangi kademede yettiğini gösteren P-Q bölümü.

```jsx
<Performance kademeler={[
  { ad: '1. hız', pq: [[0,103.1],[127.5,42.2],[255.1,0.1]], pw: [[0,21.7],[255.1,24.1]] },
  { ad: '3. hız', pq: [[0,210.7],[255,127.2],[509.9,0.1]], pw: [[0,38],[509.9,50.5]] },
]} />
```

- Kaynak: S5 `parca/Performance.dc.html`; hesap `veri/katalog.js` hesap bloğu ile aynı.
- Komşu model önerileri çağırandan gelir: `seriBuyugu`, `seriKucugu`, `yuksekBasinc`.
- Tek P-Q çizimi için (girdi yok) `PQEgrisi`.
