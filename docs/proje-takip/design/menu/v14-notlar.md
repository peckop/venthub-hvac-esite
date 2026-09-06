
# v14 notları — geri bildirim 5 (DESIGN, 2026-09-04)

Dosyalar: `Menü Tasarımı v14.dc.html` (27 kare; v13 ARSIV) · `Venthub Ana Sayfa v8.dc.html` (v7 ARSIV).
Kaynak: geri-bildirim-5.md + Linear "Kararlar — Vitrin 15A" (K17 dahil, 15:45 ve 15:55 kararları belgede — fark yok).

| Madde | Durum | Not / ölçüm / soru |
|---|---|---|
| 48 Seçici sayfası | **Yapıldı** — ekran 13 (1440 + 390) | `/tr/secici`. Mekân çipleri (8 senaryo dili) → mahal girdileri → tek kiremit "Hesapla" → 4 model kartı ("Ürüne git" + "Teklif listesine ekle", ikisi çerçeveli; Karşılaştır yok). Hava perdesi ikinci sekme başlığı çizili, iç yüzü 07b girdileriyle aynı (ayrı kare çizilmedi). Giriş noktaları: ana sayfa düğmesi hedefi, ekran 09'a "Bu senaryo için fan seçin" çerçeveli düğme, ekran 10 "Hesapla" zaten vardı. **Soru:** mobilde "Hesapla" kiremit mi kalsın, yoksa masaüstündeki gibi "değer değiştikçe kendiliğinden" notuyla ikincil mi? Şimdilik kiremit. |
| 49 ₺ kalkar | **Yapıldı** — 07 ve 07d | Kutu "Aylık enerji · 90 kWh/ay · güç payı %34". ₺ dosyada tek yerde kaldı: ekran 13 Satış kipi ARŞİV bloğu (K6 "eylem bloğu iki kip" gereği). |
| 50 Animasyon / koyu mod | **Kayıt** | CLAUDE.md envanterine "Recep onayı: düştü (2026-09-04)" yazıldı. |
| 51 Teklif listesi adresi | **Yapıldı** — altyazı | Ekran 10 başlığına `/tr/teklif-listesi · /en/quote-list`; altyazıda `/cart` kuralı (silinmez, sitemap'ten çıkar, yönlenir). |
| 52 Mobil üst şerit | **Yapıldı** — 52a / 52b yan yana | Her ikisinde logo satırı 44 px, hesap simgesi 44×44, 52a'da "TR \| EN" 44×44; arama kutusu 44 px tam genişlik. Alt çubuk 4 sekme. Görünen etkileşimli öğe (madde 60 tanımı): 52a = 8, 52b = 7. **Varsayılan olarak tüm mobil karelere 52b uygulandı** (17 alt çubuk 5→4; ana şeride hesap simgesi); Recep 52a'yı seçerse tek satır. İç sayfaların "‹ geri + başlık" şeridi değişmedi — orada hesap yok, geri var. |
| 53 Hesap yaprağı | **Yapıldı** — iki hâl (52 karesinde) | Girişsiz: (52b'de Dil satırı TR/EN) · "Giriş yapın" çerçeveli · "Kayıt olun" bağlantı · Tekliflerim / Projelerim gri + kilit, bağlantı değil. Girişli: ad · Tekliflerim · Projelerim · Favorilerim · Profil · Çıkış. "Siparişlerim" kalktı. Ekran 12'deki eski yaprak kaldırıldı. |
| 54 Kategori üç mod | **Yapıldı** — 04 (VİTRİN) + 04·mod 2 (ANLATIM, Isı Geri Kazanım) + 04·mod 3 (SERİ LİSTESİ, Hava Perdeleri) | Mod dal sayısından: ≥3 vitrin · 1 anlatım · 0 seri listesi. Eşleme altyazıda: Fanlar/Kontrol/Şartlandırma → vitrin; VMC/Sığınak → anlatım; Hava Perdeleri/Aksesuarlar → seri listesi. **Soru:** Hava Şartlandırma 2 dal — "≥3 vitrin" kuralında 2 dal nereye düşer? Vitrin saydım; OPS 2'yi anlatım sayarsa altyazı değişir. |
| 55 Kısa kabuk | **Yapıldı** — ekran 07e (1440) | Danfoss FC 051: 3 satır tablo, seçici yok, çağrı yok, iki belge düğmesi, eylem bloğu; altta "Uyumlu ürünler" (3 fan). Görsel 380 px, sağ sütunla dengeli. |
| 56 Panel görünürlüğü | **Ölçüldü, kaydırma gerekmedi** | 07c'de çağrı satırı v10'dan beri teknik tablonun DEĞİL anahtar değer gridinin üstünde, kimlik bloğunun hemen altında. Statik ölçüm (1440 genişlik): header 74 + breadcrumb 45 + üst boşluk 30 + marka 20 + h1 34 + kod 20 + boşluklar 34 + sertifika çipleri 30 + kullanım alanları 32 + boşluk 18 → satır üstü ≈ **355 px**, satır 44 px, alt kenar ≈ **399 px**. 900 px ilk ekranda tamamen görünür. Canlı DOM ölçümü alınamadı (27 kareli önizleme zaman aşımı); OPS gözcüyle doğrulayabilir. |
| 57 Uzun-metin şablonu | **Yapıldı** — ekran 14 (iki kare) | KVKK örneği: Archivo başlık 38, Source Serif 17/1.65, 720 ölçü, sol yapışkan içindekiler 240. İkinci kare Bilgi Merkezi girişi: 3 sütun görselsiz kart. Mesafeli satış / ön bilgilendirme K1 gereği yayında değil, altyazıda. |
| 58 Masaüstü Destek | **Yapıldı** — ekran 58 | Header "İletişim" altında 360 px panel: WhatsApp · Ara · Teknik destek iste (çerçeveli) · Kargo takibi · İletişim formu. |
| 59 Küçük düzeltmeler | **Yapıldı** | 06b süzgeç başına sayı ("34 / 27 modeli saklıyor") · 21 faset başlığı Archivo 11/600 · 05 ATEX çipi altyazısı · 07 "oturum boyu tutulur" · 12 "ayrı yaprak" · **18 "Ürünü incele" düğmesi kaldırıldı** (06, 08, masaüstü + mobil), kart = Karşılaştır + Teklif listesine ekle · "Tüm ürünler 375" kaldı (K9 istisnası) · 10 adres. |
| 60 Kural tanımları | Okundu | Marka sayfası ayrı kare yok; şablon tablosu K18 bekleniyor. |

Yapılmayanlar (brief gereği): giriş/kayıt/hesap kabuğu (Faz 4), matris (Faz 3), ana sayfa içerik değişikliği.

Ana Sayfa v8: içerik v7 ile aynı; yalnız mobil kabuk 52b (hesap sağ üst, 4 sekme) ve "Doğru fanı seçin" hedefi `/tr/secici`.

