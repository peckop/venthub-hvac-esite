# Geri bildirim 7 — ürün seçimi alternatif çalışması + zorunlu içerik haritası (OPS, 2026-09-04 akşam)

Kaynak: v15-notlar.md, sogukgiris-oneriler.md, mobil-kisayol-oneriler.md; Recep 18:30 kararları. Numaralar 69'dan başlar.
Çıktı: `Ürün Seçimi Alternatifleri v1.dc.html` (AYRI dosya; Menü Tasarımı v15 ve Ana Sayfa v9 DEĞİŞMEZ) +
`zorunlu-icerik-haritasi.md` + `v16-notlar.md` yok — bu tur menü dosyasına dokunmaz. İmza ve erişim kuralları aynen.

## Kesinleşenler (Recep, 18:30)
- Alt çubuk sekmesi ve yaprak adı **"İletişim"** — KARAR. v15 doğru; K9'a işlenir.
- Ürün sayfası paneli sorusu **karar dışı bırakıldı**: "hafif panel mi, açık kalsın mı" Recep'in cevaplayabileceği bir soru
  değil; alternatifler AYRI AYRI çizilip yan yana görülmeden karar yok (madde 69).

## 69 — Ürün seçimi: üç alternatif, üç ayrı akış, aynı örnek üzerinde  [ÇİZ, ayrı dosya]
Recep'in kaygısı: "Hafif seçimden yanlış ürün çıkarsa sorumlu oluruz." Bu kaygı her alternatifte AÇIKÇA cevaplanır.
Örnek senaryo hepsinde aynı: kimya laboratuvarı, 90 m², 3,2 m tavan, saatte 8 hava değişimi; hiçbir şey bilmeyen
ziyaretçi (mühendis değil, tesis sorumlusu). Her alternatif 3–4 kare (mobil 390), akışın başı→sonu; son karede
"sorumluluk" satırının nasıl göründüğü.

- **A · Tek sayfa seçici + bağlantı.** Ürün sayfasında panel YOK, yalnız "Bu ürün mahalinize uyar mı? → Ürün Seçici"
  satırı. Seçici tam girdi ister (mekân · alan · yükseklik · hava değişimi · gürültü sınırı · montaj). Sonuç: 3–5
  model, her birinde "uyar / sınırda / uymaz" ve NEDEN (hangi girdi belirledi). Sorumluluk: sonuç kartında
  "Bu bir ön seçimdir; proje onayı için Teknik destek iste" satırı + çerçeveli düğme.
- **B · Hafif panel (Design önerisi, sogukgiris a.3).** Ürün sayfasında 3 girdi + tek hüküm; hüküm ASLA "uyar" demez,
  "ön değerlendirme: yeterli görünüyor · kesin seçim için Ürün Seçici" der. Tam hesap seçicide. Sorumluluk: hafif
  panel yalnız "devam et / etme" sinyali verir, model seçmez.
- **C · Rehberli seçim ("benim yerime seç") — bugünkü canlı sihirbazın ruhu.** Ziyaretçi ürün bilmez; adım adım soru
  (nerede? ne kadar büyük? gürültü önemli mi? montaj nereye?), her adımda tek soru, sonda tek öneri + 2 alternatif ve
  "neden bu" açıklaması; sonda "Bu öneriyi mühendisimizle doğrulayın" çerçeveli düğme (form ürün ve girdilerle dolu).
  Sorumluluk: her adım "ön seçim" diliyle; öneri kartında "kesin seçim proje verisiyle yapılır" satırı; teklif
  isteğine girdiler otomatik eklenir, satış tarafı doğrular.
Her alternatif için altyazıda: kim için (mühendis / bilmeyen), kaç dokunuş, yanlış seçim riski nerede kapatılıyor,
kod bedeli (kaba: küçük/orta/büyük). Design'ın kendi görüşü en sonda tek paragraf; ama üçü de EŞİT özenle çizilir,
Recep yan yana görüp seçer. A ve C birlikte de seçilebilir (C = seçicinin "bilmiyorum" kipi); bunu da bir cümleyle
değerlendir.

## 69b — Seçici mimarisi: tek KABUK + ürün grubu MODÜLÜ (Recep, 19:00)  [madde 69'a çerçeve]
Hesaplayıcı/seçim mantığı ürün grubuna göre ayrıdır (kanal fanı · endüstriyel fan · hava perdesi · ısı geri kazanım ·
jet fan · sığınak · kontrol); mahal listesi ve ortam düzeltmeleri (sıcaklık · nem · deniz kenarı tuz · rakım · ATEX)
her grupta farklı çalışır. Bugün yalnız kanal fanı motoru var. Bu yüzden üç alternatif de (A/B/C) KANAL FANI örneğiyle
çizilir ve arayüz motor-bağımsız olur: ortak kabuk (grup seçimi/otomatik grup, mekân çipleri, sonuç kartı, sorumluluk
satırı, teklife aktar) + gruba göre takılan girdi bloğu. Design: kabukta "grup" nasıl seçilir (sekme / ilk soru /
kategori sayfasından gelince otomatik) ve ortam düzeltmeleri girdi bloğunda nerede durur (varsayılan gizli, "ortam
koşulları" katlanır satırı) — bunu her alternatifte göster. Kurallar ve katsayılar Design'ın işi DEĞİL; OPS+Recep
`secim-motoru-kapsam-haritasi-taslak.md` ile yazıyor (projeye yüklendi, okuma için).

## 70 — Zorunlu içerik haritası: AFS'in dağıttığı, bizim de sunmamız gereken içerikler  [YAZ + 1 kare]
Recep AFS mobil arayüzünü esinlenme için inceledi (kopya değil). AFS "Hesabım" penceresi ve menüsünde şunlar var:
Giriş yap · Üye ol · Şifremi unuttum · Müşteri hizmetleri (telefon, e-posta) · Hakkımızda · Gizlilik ve güvenlik ·
Kullanım sözleşmesi · İletişim · Mesafeli satış sözleşmesi · İptal ve iade şartları · Kişisel verilerin korunması ·
Çerez politikası · Sipariş takip · Havale bildirimleri · Yayınlar · Özel kampanya · S.S.S.
Soru: bunların her biri bizde NEREDE yaşar, Apple çizgisini bozmadan? Çıktı tablo: AFS kalemi → bizde yer
(footer / Hesap yaprağı / İletişim yaprağı / uzun-metin şablonu ekran 14 / Bilgi Merkezi / satış kipine kadar YOK
(K1) / hiç yok + sebep). Kural: Hesap yaprağı 4–5 satırı geçmez; hukuki metinler footer'da tek "Yasal" grubu;
"Diğer" gibi torba başlık yok. Ekran: FOOTER (mobil + masaüstü, tek kare) — v15'te footer çizili mi ölç, değilse
bu turda çizilir: 3 sütun (Ürünler · Şirket · Yasal) + iletişim satırı + marka logoları + dil.

## 71 — Ana sayfa kategori kartları (OPS düzeltme)
OPS "ana sayfaya kategori kutuları" önerdi; v9'da ZATEN var (7 kart, 64 px ikon, dal sayısı). Öneri düştü, kayıt.

## Yapılmayacaklar
Menü v15 / Ana Sayfa v9 bu turda değişmez; İletişim adı sabit; Faz 3–4 kalemleri yok.
