# OPS-52 spike — `rewrites()` sonrası `usePathname()` ve dil değiştirici ne görüyor?

> 2026-10-04 · Şerit: ALTYAPI · Kart: OPS-52 PR-A · **Durum: ölçüldü (dev sunucusu), kalıcı kod değil.**
> Plan: `docs/plans/ops52-adres-dili-mekanizma-plani-2026-10-04.md` §4 (ilk risk satırı).

## Soru

`/tr/hakkimizda` adresi `rewrites()` ile `/tr/about` klasörüne iniyor. İstemci bileşenleri (`usePathname()`, dil
değiştirici, menü) tarayıcıda hangi yolu görüyor: dış adres (`/tr/hakkimizda`) mi, iç klasör (`/tr/about`) mi?
Yanlışsa yedek: klasörü fiziksel yeniden adlandırma.

## Ne denendi

Ortam (geçici, depoya yazılmadı): `NEXT_PUBLIC_ADRES_DILI=1`, `NEXT_PUBLIC_SUPABASE_URL=https://dummy.supabase.co`
(CI'nin sahte-DB kipi), sahte anon anahtar; `pnpm exec next dev -p 3217` (build değil, bellek için). Tarayıcı
ölçümü Playwright ile gerçek Chromium'da. Sunucu işin sonunda öldürüldü (3217 portu dinleyen yok).

Ölçülen sayfalar: `/tr/hakkimizda`, `/tr/iletisim` (rewrite hedefleri `/tr/about`, `/tr/contact`).

## Ham sonuç

### (a)+(b) HTTP (curl, `Accept-Language: tr-TR`)

| İstek | Durum | Location |
|---|---|---|
| `/tr/hakkimizda` | 200 | — (başlık `Hakkımızda \| VentHub`, gövde 88 KB) |
| `/tr/iletisim` | 200 | — (başlık `İletişim \| VentHub`) |
| `/tr/about` | **308** | `/tr/hakkimizda` |
| `/tr/contact` | **308** | `/tr/iletisim` |
| `/en/about`, `/en/contact` | 200 | — (EN değişmedi) |
| `/about` (dilsiz) | 307 | `/tr/about` → ikinci sıçrama 308 `/tr/hakkimizda` |
| `/contact` (dilsiz) | 307 | `/tr/contact` → ikinci sıçrama 308 `/tr/iletisim` |

Sonuç: rewrite hedefi gerçek sayfayı üretiyor (404 değil), eski adres tek hop 308. Dilsiz eski adres **2 sıçrama**
(307 sonra 308): plan §2.2 öngörüsü ölçüyle doğrulandı, A9 bütçesi (1) için PR-C'deki dilsiz kol (`rotaDiliEsle`) gerekli.

### (c) İstemci tarafı (tarayıcı, hidrasyon sonrası)

| Ölçüm | Sonuç |
|---|---|
| `/tr/iletisim` açıkken dil değiştirici `EN` tıklanınca | tarayıcı `/en/iletisim` adresine gitti, **404** |
| `/en/about` açıkken `TR` tıklanınca | `/tr/about` istendi, 308 ile `/tr/hakkimizda` açıldı, sorunsuz |
| `/tr/hakkimizda` sayfasındaki `<a href>` değerleri | `/tr/about`, `/tr/contact` (menü ve altbilgi bağlantıları eski adreste) |
| `aria-current` işareti | sayfada hiç yok (menü aktif durumu bu işaretle yapılmıyor) |
| `<link rel="canonical">` / `og:url` | `/tr/about` (sayfa üst verisi `Routes` üzerinden, yani eski adres) |
| Konsol | hidrasyon uyuşmazlığı uyarısı yok; hatalar yalnız sahte DB'nin DNS çözülememesi (beklenen) |

## SONUÇ

1. **`usePathname()` rewrite sonrası DIŞ adresi görüyor** (`/tr/iletisim`), iç klasörü (`/tr/contact`) değil.
   Kanıt: dil değiştirici `dilDegistirYolu(pathname, 'en')` ile `/en/iletisim` üretti; iç yol görseydi `/en/contact` olurdu.
   Yani pathname'e bağlı aktif menü / sekme çubuğu kodu dış adresle çalışır, klasör adlarını bilmesi gerekmez.
2. **Dil değiştirici bugünkü haliyle KIRIK**: yalnız dil segmentini değiştiriyor (`/tr/iletisim` → `/en/iletisim`),
   oysa EN karşılık `/en/contact`. `/en/iletisim` 404. Bu bir spike kusuru değil, beklenen boşluk: dil değiştirme ve
   iç bağlantılar `rotaDili` tablosundan adres üretmeli. Tersi yön (EN → TR) 308 sayesinde "çalışıyor" ama fazladan sıçrama yapıyor.
3. **Üç yüzey hâlâ eski adresi basıyor** ve PR-C'nin işi: iç bağlantılar (`/tr/about`, `/tr/contact`), kanonik ve
   `og:url` (`/tr/about`, 308 veren adres, canonical-url-standard'a aykırı), hreflang. Tek kaynak `yuzeyYolu(id, dil)`
   olmalı; `dilDegistirYolu` da tabloyu okumalı.

**Yedek (klasörü fiziksel yeniden adlandırma) GEREKMİYOR.** Rewrite yaklaşımı çalışıyor; kırık olan şey adres üretimi,
o da PR-C kapsamında.

## Sınırlar (ölçülmedi)

- Ölçüm `next dev` ile; `next build && next start` ile `usePathname()` davranışı aynı API olsa da ayrıca ölçülmedi.
- `/en/*` yeni yol yok (EN adresleri değişmiyor); EN'de farklı yol çıkacak satırlar (Design listesi) bu spike'ta denenmedi.
- Middleware `/tr/hakkimizda` yolunda sorun çıkarmadı (200); ama `Routes`'tan türeyen "bilinen yol" kontrolleri
  başka yerde varsa (örn. breadcrumb) ayrıca taranmadı.
