
Teklif listesindeki model adedini değiştiren `− n +` kontrolü.

```jsx
<AdetKontrolu adet={3} birim="adet" onDegisim={setAdet} />
<AdetKontrolu adet={1} enAz={1} enCok={50} onDegisim={setAdet} />
```

- **44 px dokunma hedefi bileşende sabit**, ezilmez. Görsel olarak daha küçük istenirse tasarım değişir, hedef küçülmez.
- Alt sınırda `−` kapanır; satırı silmek ayrı bir eylemdir, bu kontrolün işi değil.
- Sayı mono ve tabular; 9 → 10 geçişinde kontrol genişliği oynamaz.
- Değer hücresi tek satırdır (`nowrap`): birimli hâlde ("3 adet") ikinci satıra kırılmaz, hücre genişler.
- Kenar `--border-control` (etkileşimli öğe kademesi); kart kenarı kullanılmaz.

