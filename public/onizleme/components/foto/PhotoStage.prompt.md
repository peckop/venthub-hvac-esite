Ürün fotoğrafının durduğu tek sahne; kart, satır, kapak ve ürün sayfasında aynı, yalnız boy değişir.

```jsx
<PhotoStage src={url} alt="Lineo 100 Quiet ES" boy="kart" />
<PhotoStage src={url} boy="satir" />
<PhotoStage src={url} boy="urun" mobil={mobil} sahneZemini={false} />
```

- Kaynak: foto-ve-kart-kurali-2026-10-23 §1. Supabase `product-images` görselleri CORS ile okunur.
- `zemin` ile elle ezilebilir; dosyaya dokunulmaz.
