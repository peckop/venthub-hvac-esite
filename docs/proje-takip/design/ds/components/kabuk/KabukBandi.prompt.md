
Sayfanın üstündeki ve altındaki koyu lacivert bandı kurar; sayfanın geri kalanı aydınlık kalır.

```jsx
<KabukBandi rol="header" logoSrc="assets/logo/venthub-kilit-yatay-tamrenk-koyu.svg">
  <nav style={{ display: 'flex', gap: '20px', marginLeft: 'auto' }}>…</nav>
</KabukBandi>
<KabukBandi rol="footer">…</KabukBandi>
```

- Ölçülen bant değerleri (Menü v15 ekran 01): yükseklik **74 px** · iç oluk **40 px** · öğe arası **30 px**. Bant tam genişlikte durur; **1060 px içerik sütunudur, bandın oluğu değil**.
- Kabuk dışında ikinci bir koyu bölge açılmaz (mobil örtü perdesi ayrı hâldir).
- Band içinde ikon gerekiyorsa `assets/icons/…-koyu.svg` kullanılır.
- Kiremit bandın içinde yalnız logonun üst diliminde bulunur; band içi düğme `CerceveliDugme koyuZemin` olur.
- **v17 header sırası (ölçüm):** 1 Ürünler ▾ `--text-on-dark` · 2 Ürün Seçici `--text-on-dark-muted` · 3 Bilgi Merkezi `--text-on-dark-muted` · 4 arama alanı · 5 TR/EN · 6 İletişim (ikon + metin, `--text-on-dark`) · 7 Teklif sayaç rozeti · 8 hesap ikonu `--text-on-dark-muted`. Rozetten sonrası `sonEk` slotuna girer.
- **Arayüz ikonları DS'te yok** (sahibi MENU, K23-a): İletişim ve hesap ikonu örnekte inline durur, `assets/`a kopyalanmaz.
- Bant içindeki arama alanı `--surface-dark-inset` zeminli, metni beyaz; bant tonundan 1.22 ayrıldığı için 1 px `--surface-dark` kenar taşır.
- Teklif sayacı `sayac` prop'uyla verilir — çerçeveli düğme olarak yazılmaz. Rozet zemini `--brand-cyan-ink`, metni beyaz (5.65:1); turkuaz metin kullanılmaz (K25).
- Footer'daki marka satırı **5 + 2, iki satır, etiketli**: ürün grubu olan beş marka, ardından "Temsil edilen markalar" etiketiyle Casals · Flexiva. Sayı ve "ürün bekliyor" yazılmaz — sayılar kod/DB'nin.

