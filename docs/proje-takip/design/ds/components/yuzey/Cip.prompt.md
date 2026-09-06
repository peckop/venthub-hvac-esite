
Süzgeç ve bağlam etiketleri için çip; yatay kaydırılan şerit hâlinde de kullanılır.

```jsx
<Cip rol="baglam">Sığınak havalandırma</Cip>
<Cip secili>ATEX</Cip>
<Cip>UL-94</Cip>
```

- Turkuaz `baglam` rolü bağlamı gösterir; eylem için kullanılmaz.
- Rozet/sertifika işareti çip değildir — tıklanmaz, 44 px hedef taşımaz.

Varyant seçici ve niyet/mekân şeridi aynı bileşenin rolleridir — ayrı bileşen yazılmaz:

```jsx
<Cip rol="varyant" secili>Ø 150 mm</Cip>
<Cip rol="varyant">Ø 200 mm</Cip>
<Cip rol="varyant" kapsamDisi>Ø 250 mm</Cip>
<Cip rol="niyet">Sığınak havalandırma</Cip>
```

- `varyant`/`niyet` seçili hâli **1.5 px lacivert kenar**; dolu zemin kullanılmaz (dolu zemin süzgeç çipinin hâli).
- Niyet şeridi yatay kaydırılır ve **ikon taşımaz**.
- Kapsam dışı varyant silinmez, `kapsamDisi` ile gösterilir — hangi seçeneğin var olduğunu da anlatır.

