
Bilgi gruplayan her yüzey için kart; kutu içinde kutu en çok iki kademe olur.

```jsx
<Kart baslik="Kanal tipi fan">Debi 1.200 m³/h · basınç 320 Pa</Kart>
<Kart secili>Seçili varyant</Kart>
<Kart ustKural baslik="Fotoğrafı olmayan model">…</Kart>
```

- Gölge eklenmez, köşe yuvarlanmaz — yarıçap ve gölge sistemde yoktur.
- Kapsam dışı hâl **alfa ile anlatılmaz** (K22): zemin `--surface-inset`, metin `--text-body`, kenar aynı kalır. Zemin ve metin aynı yönde soluklaştırılmaz — `--text-muted` bu zeminde 4.16:1'e düşer.
- **Kapsam dışı kartta çocuk öğelere mutlak metin rengi verilmez** — renk kökten miras alınır. `color: var(--text-muted)` taşıyan bir alt metin kartın düzeltmesini ezer ve soluk zeminde 4.16:1'e düşer.
- Boş kart çizilmez: verisi olmayan blok hiç görünmez ("yakında" yazılmaz).
- Fotoğraf kutusu ayrı bir beyaz + 1 px kenarlı alandır; fotoğraf yoksa kutu kaldırılır ve `ustKural` kullanılır.
- Dolgu dört kademedir: `dolgu="yok"` 0 · `kucuk` 14 · `orta` 16 (varsayılan) · `genis` 20 px. Serbest px değeri verilmez.

