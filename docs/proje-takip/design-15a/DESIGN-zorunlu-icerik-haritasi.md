# Zorunlu içerik haritası — AFS kalemleri VentHub'da nerede yaşar (DESIGN, 2026-09-04, madde 70)

Kaynak: Recep'in AFS mobil arayüz incelemesi (esinlenme, kopya değil). Kural: Hesap yaprağı 4–5 satırı geçmez; hukuki
metinler footer'da tek "Yasal" grubu; "Diğer" torba başlığı yok. Footer karesi `Ürün Seçimi Alternatifleri v1.dc.html` madde 70.
Yer sözlüğü: **Footer** (Ürünler · Şirket · Yasal · iletişim satırı) · **Hesap yaprağı** (52b/53) · **İletişim yaprağı** (ekran 12) ·
**Ekran 14** (uzun-metin şablonu, `/tr/legal/*`, `/tr/destek/konular/*`) · **Bilgi Merkezi** (ekran 14 ikinci kare) · **YOK (K1)** · **HİÇ YOK**.

| AFS kalemi | Bizde yer | Nasıl / neden |
|---|---|---|
| Giriş yap | Hesap yaprağı (girişsiz hâl, çerçeveli düğme) | 53'te çizili. Masaüstünde header hesap simgesi → aynı panel. |
| Üye ol | Hesap yaprağı (girişsiz, "Kayıt olun" bağlantı) | 53'te çizili; ayrı satır değil, giriş düğmesinin altında tek satır bağlantı. Kayıt/giriş kabuğu Faz 4. |
| Şifremi unuttum | Giriş formunun içinde bağlantı | Yaprağa girmez; giriş ekranında yaşar (Faz 4 kabuğu). |
| Müşteri hizmetleri (telefon, e-posta) | İletişim yaprağı (Ara · E-posta) + Footer iletişim satırı | 68 karesi + footer sol sütun. Aynı bilgi iki yerde: yaprak eylem, footer referans. |
| Hakkımızda | Footer → Şirket · Ekran 14 şablonu | Uzun metin; tek sayfa. Menüye girmez (K9). |
| Gizlilik ve güvenlik | Footer → Yasal · Ekran 14 (`/legal/gizlilik`) | "Gizlilik politikası" adıyla; "güvenlik" ayrı sayfa değil, gizlilik metninin bölümü. |
| Kullanım sözleşmesi | Footer → Yasal · Ekran 14 (`/legal/kullanim-kosullari`) | "Kullanım koşulları" adıyla; sözleşme dili satış kipine ait. |
| İletişim | Alt çubuk sekmesi + header + Footer → Şirket | Üç giriş, tek yaprak. Ayrı "iletişim sayfası" adres olarak var (`/tr/iletisim`, adres + harita + form), yaprak ona da bağlanır. |
| Mesafeli satış sözleşmesi | **YOK (K1)** | Satış yok → sözleşme yok. Satış kipi açılınca Yasal grubuna girer; metin hazır tutulur, yayınlanmaz ("yakında" yazılmaz). |
| İptal ve iade şartları | **YOK (K1)** | Aynı gerekçe. Teklif kipinde iade edilecek sipariş yok. |
| Kişisel verilerin korunması | Footer → Yasal · Ekran 14 (`/legal/kvkk`) | Çizili örnek (KVKK aydınlatma metni). Teklif formunun altında da tek satır bağlantı ("verileriniz KVKK metnine göre işlenir"). |
| Çerez politikası | Footer → Yasal · Ekran 14 (`/legal/cerez`) + ilk ziyarette alt şerit | Alt şerit: tek satır + "Kabul" çerçeveli + "Ayarlar" bağlantı; kiremit değil. Analitik açılırsa (Vercel) şerit zorunlu. |
| Sipariş takip | **YOK (K1)** | Sipariş yok. Teklif kipinde karşılığı "Tekliflerim" (Hesap yaprağı, girişli) — teklif durumu (alındı · hazırlanıyor · gönderildi). |
| Havale bildirimleri | **YOK (K1)** | Ödeme yok. |
| Yayınlar | Bilgi Merkezi (kataloglar konu etiketi) | Marka katalogları PDF olarak Bilgi Merkezi'nde "Katalog" etiketiyle; ürün sayfasındaki belge düğmeleri (07c) aynı dosyalara bağlanır. Ayrı "Yayınlar" sayfası yok. |
| Özel kampanya | **HİÇ YOK** | Fiyat yok (K1) → kampanya yok. Teklif kipinde karşılığı yok; satış kipinde bile marka kılavuzu "kiremit tek sıcak nokta" derken kampanya bandı Apple çizgisini bozar. Recep isterse Bilgi Merkezi "Duyuru" etiketi. |
| S.S.S. | Footer → Şirket ("Sık sorulan sorular") · Ekran 14 şablonu, akordeon varyantı | Tek sayfa, soru başlıkları katlı (44 px satır). Bilgi Merkezi'nden ayrı: SSS "nasıl teklif alırım, kaç günde döner, kargo kim öder" gibi süreç soruları; Bilgi Merkezi teknik yazı. |
| Nasıl teklif alınır (AFS'te yok, bizde gerekli) | Footer → Şirket · Ekran 14 | Teklif kipinin "nasıl alışveriş yapılır" karşılığı; 3 adım. |

## Hesap yaprağı sayımı (kural: 4–5 satır)
Girişsiz: Dil (52b) · Giriş yapın · Kayıt olun (bağlantı) · Tekliflerim / Projelerim (kilitli, tek satır) = **4 satır**.
Girişli: ad · Tekliflerim · Projelerim · Favorilerim · Profil · Çıkış = 5 satır + ad. Kural içinde.

## Footer sayımı
Ürünler 7 + 1 (Tüm ürün ağacı · Markalar · Ürün Seçici tek satır) · Şirket 5 · Yasal 4 · iletişim satırı 3 · markalar 5 · dil · telif.
Yasal'a satış kipinde 2 kalem eklenir (mesafeli satış, iptal/iade) → 6; grup adı değişmez.

## Recep'e soru
Çerez şeridi analitikle birlikte zorunlu olur; çizilsin mi (tek kare, 390 + 1440)? Bugün K1 kapsamı dışında ama K9 sadeliğine dokunur.

