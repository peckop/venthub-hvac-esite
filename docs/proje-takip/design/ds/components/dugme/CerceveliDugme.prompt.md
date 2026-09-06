
Kiremit dışındaki her eylem için çerçeveli düğme; aynı sayfada birden çok kullanılabilir.

```jsx
<CerceveliDugme onClick={indir}>Teknik belgeyi indir</CerceveliDugme>
<CerceveliDugme koyuZemin>TR / EN</CerceveliDugme>
```

- Boş durumda iki çerçeveli çıkış düğmesi verilir, kiremit kullanılmaz.
- Koyu kabuk bandı içinde `koyuZemin` kullanılır (lacivert kenar koyu zeminde okunmaz).
- Etiket **tek satırdır**: taban `white-space: nowrap` + `flex-shrink: 0` taşır, düğme dar bir flex satırında küçültülüp sarmaz. Uzun etiket gerekiyorsa metin kısaltılır, düğme daraltılmaz.

