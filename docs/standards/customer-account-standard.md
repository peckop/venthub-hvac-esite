# Müşteri Hesap Yüzeyi Standardı (cetvel) — v0.1

> **Kapsam:** `/account/*` müşteri-hesap yüzeyleri — sayfa anatomisi, favori/proje
> ayrımı, adres alanı SSOT'u, e-posta doğrulama politikası.
> **Kardeş cetvel:** `auth-account-standard.md` (giriş/şifre/callback zinciri).
> **Bekçi:** `src/__tests__/conformance/auth-account-surface.test.ts` (INV-AUTH-2).
> **Doğuş sebebi:** T059 (2026-08-16) — header'ın favoriler butonu var olmayan sayfaya
> gidiyordu (garantili 404); "projeye ekle" modalı kopuk context teli yüzünden sessiz
> no-op'tu; overview'un okuduğu `full_address` alanını hiçbir form yazmıyordu (hep boş
> kart). DURUM-TAKIP'te "EKSİK STANDART" olarak işaretliydi — hata tam o boşlukta yaşadı.

## B1 — Rotası olan her hesap yolunun sayfası olur

`Routes.account.*`'a eklenen her yol için `/src/app/[lang]/account/<yol>/page.tsx`
**aynı PR'da** eklenir. Merkezi rota tanımı UI'da link üretir; sayfasız rota tanımı
"derlenen 404"tür ve hiçbir statik kapı görmez — INV-AUTH-2 R1 tüm listeyi tarar.

## B2 — Hesap sayfası anatomisi

Her `/account/*` liste sayfası dört durumu da tanımlar (FavoritesPage/ProjectsPage
referans desendir):

1. **Başlık bloğu:** ikon + `h2` başlık + bir cümlelik alt metin (sözlükten).
2. **Yükleme:** ortalanmış spinner (`Loader2`) — boş ekran değil.
3. **Boş durum:** ikon + başlık + açıklama + kullanıcıyı İLERİ götüren CTA
   (ör. "Ürünlere Göz At"). Boş liste asla çıplak bırakılmaz — boş durum,
   özelliğin nasıl kullanılacağının öğretildiği yerdir.
4. **Liste:** kart satırları; yıkıcı eylem (sil/çıkar) ikincil görünümde ve
   `aria-label`'lıdır; sayfa içi durum değişimi toast ile onaylanır.

## B3 — Favori ≠ Proje (iki ayrı kavram, birleştirme)

- **Favori** = TEKİL ürün işareti. Kimlik listesi; kalp simgesi; ad/yapı taşımaz.
  **v1 sözleşmesi:** `localStorage['venthub:favorites:v1']`, senkron `storage` +
  `venthub:favorites-changed` olayları; kalp `useFavorites`'e bağlanır, yerel
  `useState` ile favori tutmak yasaktır (yenilemede kaybolur = sahte özellik).
  DB'ye (`user_favorites`) geçiş Recep kararıdır (migration → kural 13); geçişte
  hook arayüzü sabit kalır.
- **Proje** = ADLANDIRILMIŞ ürün listesi (BOM): ad + açıklama + (ürün, adet)
  satırları; DB'de yaşar (`user_projects` + `project_items`), oturum gerektirir.
  Teklife (RFQ) dönüşmeye adaydır — teklif modülü mimarisi için SSOT:
  `quote-standard.md` (T067). Proje context'i TEK yerde yaratılır
  (`contexts/ProjectContext.tsx`); ikinci `createContext` yasaktır — iki ayrı
  nesne tüketiciyi sessizce fallback'e düşürür (T059'da olan buydu).
- Yeni "listeleme" ihtiyacı gelirse önce bu ikisinden birine eşlenir; üçüncü bir
  liste kavramı ancak cetvel güncellenerek açılır.

## B4 — Adres alanı SSOT: `full_address` türetilmiştir

Karar (T059): `full_address` AYRI tutulmuş bir alan DEĞİL, türetilmiş görünümdür.
Adres formu yapısal alanları yazar (`address_line`, `district`, `city`, ...);
`full_address`'i hiçbir form yazmaz. Gösteren her yüzey şu fallback'i uygular:

```
full_address || [address_line, district, city].filter(Boolean).join(', ')
```

(checkout `useCheckoutOrchestrator` da aynı davranışı uygular). Genel kural:
bir yüzeye alan eklerken "bu alanı hangi form yazıyor?" sorusunun cevabı yoksa
fallback zorunludur. `full_address`'i yazan form eklemek bu cetvelin
güncellenmesini gerektirir (çift-kaynak riski).

## B5 — E-posta doğrulama politikası: DASHBOARD'A EMANET

Doğrulama zorunluluğu Supabase GoTrue ayarıdır, kodda kapı YOKTUR — bilinçli:
2026-08-16'da canlıda ölçüldü (`/auth/v1/settings` → `mailer_autoconfirm: false`),
sunucu doğrulanmamış girişi zaten reddediyor; istemci kontrolü ikinci bir yalancı
kapı olurdu. **Bağımlılık açık yazılsın:** bu ayar Dashboard'dan gevşetilirse
(autoconfirm açılırsa) doğrulanmamış hesaplar içeri girer ve kodda hiçbir şey
onları durdurmaz — ayarı değiştiren, bu cetveli ve kapı ihtiyacını yeniden
değerlendirmek zorundadır.

## B6 — Favoriler yüzeyinde fiyat (bilinçli yok)

Favoriler v1 fiyat GÖSTERMEZ. Fiyat yüzeyi eklemek `rendering-cache-standard.md`'nin
fiyat-yüzeyi kurallarına (INV-PRICE ailesi) tabidir; eklenecekse `display_price`
hattından gelir, ham `price` kolonu çekilmez.

## Kapsam dışı (bilerek)

- Misafir checkout — Recep kararı (T059 notunda açık bırakıldı).
- `/account/*` middleware guard'ı — ortak mülk, ayrı iş.
- `user_favorites` DB kalıcılığı — migration, Recep kararı (B3).

## Muafiyetler

Yok. Muafiyet gerekirse buraya **adla** yazılır ve INV-AUTH-2'de aynı adla sabitlenir.
