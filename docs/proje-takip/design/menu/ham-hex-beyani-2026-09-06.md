
# Ham hex beyanı — ölçüt ve sınıflandırma (DESIGN-MENU, 2026-09-06)

Emir #5 ek bulgusu: bağımsız ölçüm `Menü Tasarımı v17.dc.html`'de **999 ham 6-haneli hex** saydı, en sık
`#d8d8d4` (426). Eşik verilmemişti, yalnız sayı. Ölçütümü yazıyorum.

## Ölçüt

**Ham hex ihlaldir ancak ve ancak DS'te (bugün yayınlanmış) bir token karşılığı varsa.** DS'in ölçüp
tanımladığı ama **token yayınlamadığı** değer ham kalmak zorundadır — uydurma token adı yazmak
(`--border-strong` gibi) çözülmeyen değişkene ve sessiz boya kaybına yol açar; 09-05'te bunu bir kez yaptım,
geri aldım.

Bu yüzden "ham hex 0" **teknik olarak imkânsız** bir hedef. Doğru beyan: **A kümesi 0.**

## Dört küme

| Küme | Ne | Sayı | Durum |
|---|---|---|---|
| **A · Token karşılığı var, ham yazılmış** | `#ffffff` · `#1a2b4a` · `#eeeeea` · `#e2e2de` · `#f4f4f2` · `#0088b0` · `#6b7280` · `#d95d0e` | **132 → 0** | ✅ **gerçek ihlaldi, düzeltildi** |
| **B · DS ölçtü, token YAYINLAMADI** | `#d8d8d4` 426 · `#f2f2ee` 142 · `#fbfbf9` 74 · `#f6f6f3` 23 · `#dcdcd6` 6 · `#f0f0eb` 2 · `#cfcfc9` 2 · `#e6e6e2` 1 | **676** | ⛔ **DS boşluğu** — aşağıda |
| **C · Kabuk v2 eklemeleri** | `#24395c` 45 (arama alanı zemini) · `#7a8290` 4 (soluk logo) · `#35507b` 4 · `#c9cdd2` 4 · `#5c6470` 4 · `#c8d3e0` 3 | **64** | sözleşme v1.2'de yazılı, DS'te token yok |
| **D · Semantik kutular** | yeşil `#256540`/`#2e7d4f`/`#eaf4ee` 40 · kırmızı `#a8443e`/`#f8eae9` 18 · bilgi `#e5f3f8`/`#0a5a72`/`#2c6b82`/`#b3dcea` 50 · amber `#faf1e2`/`#c9822b`/`#8a5f18`/`#8a5a13` 10 · `#2d3748` 7 | **125** | DS'in **"bilinçli eksik"** listesinde |

Toplam kalan: **867** (999 → 867; A kümesinin 132'si tokene döndü).

## B kümesi · en büyük tek kalem, DS'in kendi belgesinde duruyor

`tokens/kenar.css`'in başındaki ölçüm bloğu aynen şunu yazıyor:

```
1 px solid #D8D8D4  düğme ve giriş kenarı (318 kullanım)
1 px solid #E2E2DE  kart kenarı (162)  → --border-hairline
1 px solid #1A2B4A  çerçeveli düğme (113) → --primary-navy
1 px solid #EEEEEA  blok ayırıcı → --surface-inset
```

Dört satırın **üçü token adına bağlanmış, `#D8D8D4` bağlanmamış** — en çok kullanılan kenar rengi (DS'in
kendi ölçümünde 318, bu dosyada 426) tokensiz. Aynı durum `#F2F2EE` (satır ayırıcı) ve `#FBFBF9` (ikincil
zemin) için de geçerli: kılavuz metni ikisini de anlatıyor, `tokens/` dosyalarında karşılığı yok.

**İstek (Marka, REC-149 kalıbıyla):** üç token yayınlanırsa B kümesi 676 → 32'ye iner.

| Öneri | Değer | Kullanım | Gerekçe |
|---|---|---|---|
| `--border-input` | `#D8D8D4` | 426 | DS ölçümünde adı zaten yazılı: "düğme ve giriş kenarı" |
| `--border-row` | `#F2F2EE` | 142 | Kart içi satır ayırıcı; `--surface-inset` (#EEEEEA) blok ayırıcı, ikisi ayrı iş |
| `--surface-subtle` | `#FBFBF9` | 74 | Kılavuzda "ikincil zemin"; ölçümde ayrı yüzey |

K25-b'de olduğu gibi: Marka yayınlarsa tek turda uygulanır.

## C kümesi
`#24395C` sözleşme v1.2'ye `color.text_on_search_field` olarak yazıldı (arama alanı zemini, beyaz metinle
6,9:1). Diğer beşi tek-kullanım varyant (soluk logo dosyasının kendi rengi, kısılmış kabuk çizgileri). Token
istenmiyor — sözleşme kuralı "baskın değer token, tek kullanım varyant".

## D kümesi
DS kılavuzu **"Semantik renk çiftleri (başarı · uyarı · hata · bilgi) — sözleşmede ölçüldü, marka paletine
ait değil"** diyor ve hüküm kutusunu bileşen kapsamı dışında bırakıyor. Bu 125 kullanım o kararın sonucu,
ihlali değil. Değerler 09-05'te AA'ya çekildi (`#4C8BA1`→`#2C6B82` · `#B4761F`→`#8A5A13` · `#2E7D4F`→`#256540`).

— DESIGN-MENU (Fable) 2026-09-06

