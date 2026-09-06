
# Zorunlu içerik haritası — AFS kalemleri VentHub'da nerede yaşar (DESIGN, 2026-09-04, madde 70)

Kaynak: Recep'in AFS mobil arayüz incelemesi (esinlenme, kopya değil). Kural: Hesap yaprağı 4–5 satırı geçmez; hukuki
metinler footer'da tek "Yasal" grubu; "Diğer" torba başlığı yok. Footer karesi `Ürün Seçimi Alternatifleri v1.dc.html` madde 70.
Yer sözlüğü: **Footer** (Ürünler · Şirket · Yasal · iletişim satırı) · **Hesap yaprağı** (52b/53) · **İletişim yaprağı** (ekran 12) ·
**Ekran 14** (uzun-metin şablonu, `/tr/legal/*`, `/tr/destek/konular/*`) · **Bilgi Merkezi** (ekran 14 ikinci kare) · **SATIŞ KİPİ** (çizilir, kapalı bekler) · **HİÇ YOK**.
Madde 80 (GB9): önceki sürümdeki "YOK (K1)" satırları düzeltildi — K1a: satış kipi kapalı, yok değil.

| AFS kalemi | Bizde yer | Nasıl / neden |
|---|---|---|
| Giriş yap | Hesap yaprağı (girişsiz hâl, çerçeveli düğme) | 53'te çizili. Masaüstünde header hesap simgesi → aynı panel. |
| Üye ol | Hesap yaprağı (girişsiz, "Kayıt olun" bağlantı) | 53'te çizili; ayrı satır değil, giriş düğmesinin altında tek satır bağlantı. Kayıt/giriş kabuğu Faz 4. |
| Şifremi unuttum | Giriş formunun içinde bağlantı | Yaprağa girmez; giriş ekranında yaşar (Faz 4 kabuğu). |
| Müşteri hizmetleri (telefon, e-posta) | İletişim yaprağı (Ara · E-posta) + Footer iletişim satırı | 68 karesi + footer sol sütun. Aynı bilgi iki yerde: yaprak eylem, footer referans. |
| Hakkımızda | Footer → Şirket · Ekran 14 şablonu | Uzun metin; tek sayfa. Menüye girmez (K9). |
| Gizlilik ve güvenlik | Footer → Yasal · Ekran 14 (`/legal/gizlilik`) | "Gizlilik politikası" adıyla; "güvenlik" ayrı sayfa değil, gizlilik metninin bölümü. |
| Kullanım sözleşmesi | Footer → Yasal · Ekran 14 (`/legal/kullanim-kosullari`) | "Kullanım koşulları" adıyla; sözleşme dili satış kipine ait. |
| İletişim | **header sağında simge → alt panel** (K19) + Footer → Şirket | K19 ile alt çubuk sekmesi kalktı; sekme yuvası Hesap'a geçti. Alt panel satırları niyetle adlanır: "Teklif ve sipariş" · "Ürün seçimi ve teknik soru" · "Arıza ve garanti" (satış kipi). Tam sayfa `/contact` kodda var, çizilmedi. |
| Mesafeli satış sözleşmesi | **SATIŞ KİPİ** — Footer → Yasal · Ekran 14 | Sayfa kodda var (`/legal/mesafeli-satis-sozlesmesi`), anahtar kapalı. Şimdi çizilir, kapalı bekler; "yakında" yazılmaz. |
| İptal ve iade şartları | **SATIŞ KİPİ** — Footer → Yasal · Ekran 14 (`/legal/on-bilgilendirme-formu`, `/destek/iade-degisim`) | İki sayfa da kodda var, anahtar kapalı. Teklif kipinde görünmez. |
| Kişisel verilerin korunması | Footer → Yasal · Ekran 14 (`/legal/kvkk`) | Çizili örnek (KVKK aydınlatma metni). Teklif formunun altında da tek satır bağlantı ("verileriniz KVKK metnine göre işlenir"). |
| Çerez politikası | Footer → Yasal · Ekran 14 (`/legal/cerez`) + ilk ziyarette alt şerit | Alt şerit: tek satır + "Kabul" çerçeveli + "Ayarlar" bağlantı; kiremit değil. Analitik açılırsa (Vercel) şerit zorunlu. |
| Sipariş takip | Teklif kipinde **Tekliflerim** (`/account/quotes`) · satış kipinde **Siparişlerim** (`/account/orders`, `/account/shipments`) | Aynı yuva iki kip: teklif durumu (alındı · hazırlanıyor · gönderildi) ↔ sipariş + kargo. İletişim panelinde "Kargo takibi" satırı satış hâlinde açılır. |
| Havale bildirimleri | **SATIŞ KİPİ** — Hesap → Sipariş & Kargo | Ödeme akışıyla açılır (`/checkout`, `/payment-success` kodda var). |
| Yayınlar | **HENÜZ VERİ YERİ YOK** — hedef Bilgi Merkezi "Katalog" etiketi | Ölçüldü (09-05): şemada belge/dosya tablosu yok; tek dosya tablosu `product_images` (yalnız görsel, 339/375 ürün). Ürün sayfasındaki belge düğmeleri bugün hiçbir dosyaya bağlanamıyor (K7 gereği görünmezler). Kataloglar sayfası bu tablo açılınca çizilir. |
| Özel kampanya | **HİÇ YOK** | Fiyat yok (K1) → kampanya yok. Teklif kipinde karşılığı yok; satış kipinde bile marka kılavuzu "kiremit tek sıcak nokta" derken kampanya bandı Apple çizgisini bozar. Recep isterse Bilgi Merkezi "Duyuru" etiketi. |
| S.S.S. | Footer → Şirket ("Sık sorulan sorular") · Ekran 14 şablonu, akordeon varyantı | Tek sayfa, soru başlıkları katlı (44 px satır). Bilgi Merkezi'nden ayrı: SSS "nasıl teklif alırım, kaç günde döner, kargo kim öder" gibi süreç soruları; Bilgi Merkezi teknik yazı. |
| Nasıl teklif alınır (AFS'te yok, bizde gerekli) | Footer → Şirket · Ekran 14 | Teklif kipinin "nasıl alışveriş yapılır" karşılığı; 3 adım. |

## Hesap yaprağı sayımı (kural: 4–5 satır)
Girişsiz: Dil (52b) · Giriş yapın · Kayıt olun (bağlantı) · Tekliflerim / Projelerim (kilitli, tek satır) = **4 satır**.
Girişli: ad · Tekliflerim · Projelerim · Favorilerim · Profil · Çıkış = 5 satır + ad. Kural içinde.

## Footer sayımı
Ürünler 7 + 1 (Tüm ürün ağacı · Markalar · Ürün Seçici tek satır) · Şirket 5 · Yasal 4 · iletişim satırı 3 · markalar 5 · dil · telif.
Yasal'a satış kipinde 2 kalem eklenir (mesafeli satış, ön bilgilendirme) → 6; grup adı değişmez. Marka logoları footer'dan kalktı (GB8 m.76): "Markalar" metin bağlantısı yeter, logo bloğu yalnız ana sayfada.

## Kapanan soru
Çerez şeridi: **çizilmez** (GB8 m.75). Canlıda üç kategorili çerez onayı bileşeni zaten var; Vercel Web Analytics çerez kullanmıyor. Faz 3'te mevcut bileşen K9 sadeliğine uyarlanır, ayrı kare gerekmiyor.

## Terim
"Yaprak" yerine **"alt panel"** (K19 dili). Bu dosyadaki eski "yaprak" geçişleri aynı şeyi anlatır.

