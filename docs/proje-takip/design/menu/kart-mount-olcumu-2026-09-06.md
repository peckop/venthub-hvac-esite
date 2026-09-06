
# `Kart` mount ölçümü — kısmi mount neden yapılmadı (DESIGN-MENU, 2026-09-06)

Emir #6 madde 2: "mevcut üçü mount et: `TeknikTablo` · `Kart` · faset/bağlam `Cip`". `TeknikTablo` mount
edildi (8 satır, hiza doğrulandı). Bu dosya `Kart`'ın **neden mount edilmediğini** sayıyla anlatıyor.

## Ölçüm · `Menü Tasarımı v17.dc.html`

**Kart adayı: 204** kutu (`--surface-card` zemin + `1px --border-hairline` kenar taşıyan her `<div>`).

`Kart` bileşeninin bugünkü imzası:
```
Kart({ children, baslik, secili, kapsamDisi, ustKural, genis, style })
  → padding: genis ? '20px' : '16px'
```

Dolgu iki değerden birini alıyor. Çizimdeki dağılım:

| Dolgu | Sayı | `Kart` karşılıyor mu |
|---|---|---|
| `16px` · `20px` | **13** | ✅ |
| dolgu yok (kapsayıcı kart, satırlar kendi dolgusunu taşır) | **65** | ❌ |
| `14px` | 28 | ❌ |
| `14px 15px` | 12 | ❌ |
| `12px 13px` · `20px 22px` · `26px 22px` · `16px 14px` · `12px 14px` | 37 | ❌ |
| diğer 9 değer | 49 | ❌ |

**Toplam: 13 uyuyor · 191 uymuyor.** Çizimde **14 farklı dolgu değeri** var (tek sayılar bilinçli —
sözleşme v1 `spacing` ölçümü: "tek sayılı boşluklar 7 · 9 · 11 · 13 optik sıkılık için bilinçlidir").

Diğer prop'ların karşılığı sağlam: `secili` **27** · `kapsamDisi` **41** · `ustKural` **3**.

## Neden 13'ü mount etmedim

13'ü mount etmek dosyada **13 bileşen kart + 191 elle çizilmiş kart** bırakır. Bu, bu turda iki kez
kaydettiğim hatanın aynısı:

- **32 kiremit düğme:** `AnaEylemDugmesi` 6 yerde doğru koyu zemini render ediyordu, yanındaki 32 elle
  yazılmış düğme düz kiremitte kalmıştı → aynı dosyada aynı düğmenin iki kontrastı.
- **`TeknikTablo` başlığı:** gövde bileşenden, başlık elle → üç kolon 18/34/50 px kaymıştı.

Her ikisinin dersi tek cümle: **bileşen bir şeyi render ediyorsa, yanındaki elle yazılmış kardeşi aynı şeyi
render etmek zorundadır; fark, bileşeni kullanmadığımın kanıtıdır.** %6 kapsamla mount etmek o farkı 191
yerde kurumsallaştırır.

Emrin kendi kuralı da bu yöne işaret ediyor: *"tablo varyantı bileşende yoksa DS'e varyant isteği yaz,
kendin genişletme."* Dolgu varyantı bileşende yok.

## DS isteği · `Kart`'a dolgu varyantı

| Öneri | Neden |
|---|---|
**`dolgu` prop'u** — `'yok' \| 'kucuk' \| 'orta' \| 'genis'` = `0` / `14px` / `16px` / `20px` | Dört değer 204 kartın **106'sını** kapatır (65 dolgusuz + 28 `14px` + 13 mevcut). Ölçülmüş dağılıma göre seçildi, uydurma değil |
| Çift değerli dolgular (`14px 15px` · `12px 13px` …) | Ya `dolgu` serbest string kabul eder, ya da bu 98 kart ekranın kendi işi kalır — **karar DS'te** |

`dolgu` yayınlanınca tek geçişte **106 kart** mount edilir; kalan 98 için ikinci karar gerekir.

## Bekleyen üç DS işi (bu dosya dahil)

| İstek | Etki | Durum |
|---|---|---|
| `Kart.dolgu` | 106 kart mount edilebilir | **bu dosyada** |
| `Cip.baglam` → `--brand-cyan-ink` | 15 bağlam çipi mount edilebilir; bugünkü rol K25'i ihlal ediyor (turkuaz metin, 4,02:1) | 09-06 yazıldı |
| `TeknikTablo.basliklar[]` + karşılaştırma varyantı | başlık bileşene girer (hiza bir daha kaymaz) + 17 karşılaştırma satırı | 09-06 yazıldı |
| `--surface-dark-inset` · `--border-input` · `--border-row` · `--surface-subtle` | ham hex B kümesi 676 → 32 | 09-05/06 yazıldı |

— DESIGN-MENU (Fable) 2026-09-06

