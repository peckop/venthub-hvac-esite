# Ürün Asistanı Cetveli (`urun-asistani-standard.md`)

> **Bu cetvel neyi yönetir:** sitedeki ürün seçim asistanının (dil modeli destekli, hesap YAPMAYAN) neyi yapıp
> neyi yapmayacağı, modele hangi verinin gidip gitmeyeceği, çıktının nasıl basıldığı, istek sınırı, KVKK ve
> canlıya çıkış kapısı.
>
> **Niçin var:** OPS-287 (Recep 15 Kasım 2026: kullanılmayan API kredisi, müşterinin ürün bulmakta zorlanması).
> İlk taslak plan-challenger'dan KOŞULLU döndü: "cevaptaki sayılar satırda var mı" doğrulaması sızdırıyordu
> (ürün adlarında "950 d/dk", ATEX metninde "94/9/CE"), kiracıyı istek başlığından almak RLS ile çelişiyordu.
> Bu cetvel o dersleri kural yapar. Ayrıntı ve ölçümler: `docs/plans/urun-asistani-kapsam-guvenlik-notu-2026-11-15.md`.
>
> **Sahibi:** URUN şeridi. **Son doğrulama:** 2026-11-15 (katalog kapsamı canlı DB; KVKK maddeleri MVZ-17).
> Prompt-engineering yeteneğinde enjeksiyon ve konu dışı ret bölümü yok (YETENEK ölçtü, 15 Kasım); bu kurallar burada yaşar.

## A1. Kapsam

- **A1.1** Asistan katalogdaki teknik veriden süzer ve yan yana gösterir. Hesap, boyutlandırma ve çalışma noktası
  seçimi YAPMAZ; hesap isteyen soru teklif formuna (kanal fanı için mevcut seçim sihirbazına) yönlenir.
- **A1.2** "Bu iş için uygun" yargısı yazılmaz; "uygun" kelimesi hiçbir asistan çıktısında geçmez.
- **A1.3** Fiyat, stok, teslim süresi, katalog dışı bilgi ve konu dışı sohbet yok. Konu dışı → kısa ret.
- **A1.4** Recep kararı (15 Kasım): Yol A (model + sunucu şablonu) ve Yol C (modelsiz süzgeç, URN-172) birlikte yürür;
  süzgeç RPC'si ve eksen eşlemesi ortaktır.

## A2. Modele giden veri (izin listesi)

- **A2.1** Modele giden satır İZİN LİSTESİYLE kurulur, kara listeyle değil. İzinli: ürün kimliği, görünen ad, slug ve
  `technical_specs` içinden izinli eksen anahtarları. Bilinmeyen her anahtar düşer.
- **A2.2** `sku`, `model_code`, barkod, `price`, `purchase_price`, `stock_qty` ve `description_i18n` modele HİÇBİR ZAMAN gitmez
  (açıklama enjeksiyon yüzeyidir ve niyet çözmek için gerekmez).
- **A2.3** Recep kararı (15 Kasım): görünen ad model kodu taşısa da ("ADH-225 E2") kullanıcıya gösterilir;
  bu, A2.2'yi gevşetmez: `sku` ve `model_code` ALANLARI yine modele gitmez.
- **A2.4** Eksen eşlemesinin tek kaynağı `src/lib/services/wizard.service.ts`; asistan ve süzgeç RPC'si eşlemeyi yeniden yazmaz.
- **A2.5** Kapı: `INV-ASISTAN-1` (modele giden satırda yasak alan yok).

## A3. Çıktı (sayı ve bağlantıyı model yazmaz)

- **A3.1** Model yalnız yapılandırılmış çıktı üretir: (a) niyet sınıfı + süzgeç, (b) `{urunId, alan}` başvuruları ve sabit
  gerekçe kodları. İkisi de sunucuda katı şemadan geçer; geçmezse tipli hata döner.
- **A3.2** Sayıyı, birimi, ses etiketini ve ürün bağlantısını SUNUCU, veritabanı satırından şablonla basar. Bağlantı tek
  lokalize yol modülünden gelir (manuel `/tr/` yok). Çıktı düz metin render edilir (markdown/HTML yok).
- **A3.3** Debi süzgeci "serbest üfleme (0 Pa) en yüksek debi" etiketiyle sunulur (`max_delivery_m3h`); başka çalışma noktası
  (`nominal_delivery_m3h`) ayrı etiketlenir.
- **A3.4** Ses: mesafesi bilinmeyen değer "karşılaştırılamaz (ölçüm koşulu yok)"; mesafeli değer `sesEtiketi` kuralıyla basılır;
  farklı markaların sesi aynı sıralamada karşılaştırılmaz (URUN kuralları madde 4).
- **A3.5** Eksik veri "bu üründe veri yok" yazılır; sessizce dışlanmaz.
- **A3.6** Kapı: `INV-ASISTAN-2` (şablon çıktısında "uygun" yok; her sayı satırdan).

## A4. Güvenlik

- **A4.1** Kullanıcı metni modele ayrı alanda veri olarak gider; bu riski azaltır, sıfırlamaz. Asıl savunma çıktı yolunun
  kapalı olmasıdır (A3): model bağlantı ve sayı yazamaz, araç çağıramaz, veritabanına yazamaz.
- **A4.2** Kiracı istek başlığından OKUNMAZ. Servis anon ya da kullanıcı JWT'siyle `SECURITY INVOKER` RPC çağırır, kapsamı
  `jwt_tenant_id()` uygular (mutlak kural 12). Service role yalnız sayaç için. Kapı: `INV-ASISTAN-TENANT`.
- **A4.3** İstek sınırı FAIL-CLOSED: sayaç ölçülemezse ya da boş dönerse istek reddedilir, arama kutusuna geri düşülür.
  IP sırası `quote-request-guest` emsalindeki gibi alınır (`x-forwarded-for` ilk öğesi istemci tarafından yazılabilir).
  Sayaç anahtarı oturum/IP bazlıdır; paylaşılan genel anahtar yok. Günlük token tavanı + sağlayıcı tarafı harcama tavanı (ALTYAPI).
- **A4.4** Hata yolları ayrı mesajla: süzgeç boş, süzgeç çok geniş (üst sınır), geçersiz model çıktısı, API kesintisi/zaman aşımı,
  sayaç ölçülemedi. Hata sessizce boş liste olmaz.
- **A4.5** API anahtarı yalnız sunucuda; tarayıcıya, depoya, günlüğe girmez.

## A5. KVKK (MVZ-17, 15 Kasım)

- **A5.1** Konuşma kaydı varsayılan KAPALI.
- **A5.2** Modele gitmeden önce e-posta, telefon ve kimlik numarası benzeri dizgeler deterministik olarak maskelenir.
  **Maskelemeden sonra kalan metin de yurt dışına aktarım sayılır**: dolaylı bilgi ("X Bey'in firması") kişisel veri olabilir;
  aktarım ihtimali sıfır kabul edilmez.
- **A5.3** Sağlayıcı verileri en kötü durumda 30 gün saklar (iki resmî sayfa çelişiyor, kötü olan esas alınır); eğitimde kullanılmaz.
- **A5.4** Aydınlatma metninde alıcı kategorisi, ülke ve amaç yazılır; asistan bu metin gösterilmeden açılmaz.

## A6. Canlı kapısı

- **A6.1** Geliştirme (kapılar, RPC, servis, arayüz) sürebilir; **asistan canlıya ancak şu üçü tamamlanınca açılır:**
  (1) KVKK kararı: standart sözleşme imzalanıp 5 iş günü içinde Kurum'a bildirildi YA DA danışmanın gösterdiği başka yol
  uygulandı (karar Recep'in); (2) A5.4 aydınlatma metni yayında; (3) A2.5, A3.6 ve A4.2 kapıları yeşil.
- **A6.2** Canlıya açma özellik bayrağıyladır ve acil kapatma anahtarı vardır; bayrak varsayılan KAPALI.

## A7. Kabul kapısı

- **A7.1** Deterministik küme CI'da koşar (izin listesi, şemalar, şablon basıcı, maskeleme, IP çözücü, bağlantı kurucu, hata yolları),
  gerçek ürün adı örnekleriyle ("950 d/dk", "0,18 kW", "94/9/CE"); sentetik veriyle sahte-yeşil olmaz.
- **A7.2** Model çağıran değerlendirme (en az 30 vaka) CI dışında elle ya da zamanlanmış koşar; sonucu dosya olarak kapıya girer
  (depo herkese açık, fork PR'ına sır verilmez).
- **A7.3** Migration'lı her adımda: Recep onayı (kural 13), birleşince tip PR'ı aynı gün.
