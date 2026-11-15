# Ürün asistanı (hesap yapmayan, ilk dilim) — kapsam ve güvenlik notu

Kart: URN-171 (OPS-287). Tarih: 2026-11-15. Sahibi: ÜRÜN. Durum: TASLAK v2 (plan-challenger hükmü işlendi); Recep'e gösterilmeden kurulum yok.
**KAYNAK/CETVEL:** cetvel yok, yazımı bu işin kapsamında (bu not ilk taslak; onaylanınca `docs/standards/urun-asistani-standard.md` olur). Dayanaklar: claude-api ve data-governance yetenekleri, `urun-yapisal-veri-standard.md`, `arama-standard.md`, `docs/roller/URUN-kurallar.md` (sku gizli, ses sayısı koşulsuz yazılmaz, fiyat görünmüyorsa şemada da yok), `wizard.service.ts`, `sesEtiketi.ts`, `rate_limit.ts`; REC-341 (iptal edilmiş eski çatı, aynen alınmadı).
**Ölçüm tazeliği:** katalog veri kapsamı ve alan tipleri canlı DB, 15 Kasım 2026 (iki bağımsız ölçüm: ben ve plan-challenger/çürütücü, sayılar tuttu).

## 1. Ne yapar, ne yapmaz

Müşteri düz Türkçe yazar ("jet fan tünel için 2000 m³/h, IP55, sessiz olsun"). Asistan katalogdaki teknik veriden aday ürünleri süzer ve yan yana gösterir. Her ürün kartında sayfa bağlantısı vardır.

Yapmaz: hesap/boyutlandırma (basınç kaybı, kanal çapı, çalışma noktası seçimi), fiyat ve stok sözü, katalog dışı bilgi, konu dışı sohbet, "bu iş için uygun" yargısı. Hesap isteyen soruyu teklif formuna ve (kanal fanı için) mevcut seçim sihirbazına yönlendirir. Hesaplayıcılar sitede tam olmadığı için hesap ikinci dilimdir (OPS-287 notu).

## 2. Katalog verisi ne kadarını kaldırıyor (ölçüldü, 431 aktif ürün)

`technical_specs` dolu: 421. IP derecesi 315 · debi m³/h 249 (+ nominal m³/h 95; birlikte 328; l/s 180) · çap mm 248 · maks. statik basınç Pa 149 · gürültü dB(A) 130 (3 m'de dB ayrıca 73) · ATEX bölgesi 36. Debi, çap, basınç, dB alanları sayı tipinde; IP ve ATEX metin tipinde.

Üç sınır katalogdan gelir, modelden değil:
- **Ses:** `noise_level_db_a` 130 üründe dolu ama 125'i Vortice, 5'i SEAT; ölçüm mesafesi ve kaynak alanı yok. "En sessiz" sıralaması iki markayı karıştırırsa kendi yasağımıza girer. Yalnız aynı marka ve aynı anahtar içinde sıralanır; koşulsuz değer `sesEtiketi.ts` kuralıyla (mesafe zorunlu) basılır, mesafesiz değer "karşılaştırılamaz" diye gösterilir ya da hiç gösterilmez (karar ÜRÜN+KATALOG).
- **Debi:** `max_delivery_m3h` serbest üfleme (0 Pa) debisidir; `nominal_delivery_m3h` başka çalışma noktasıdır. Debi süzgeci "serbest üfleme en yüksek debi ≥ X" etiketiyle sunulur; "uygun" kelimesi yasaktır. Çalışma noktası seçimi mühendislik yargısıdır, ikinci dilimdir.
- **Eksik veri:** veri olmayan üründe "bu üründe veri yok" yazılır; sessiz dışlama sıralamayı yanıltır.

## 3. Yollar

**YOL A — model yalnız yapılandırılmış çıktı verir; sayıyı, birimi, ses etiketini ve bağlantıyı SUNUCU basar (ÖNERİLEN).**
Haiku iki yapılandırılmış çıktı üretir: (1) niyet: sınıf (süz / hesap / konu dışı / kötü niyet) + izin listesindeki alanlarla süzgeç; sunucu bunu şema doğrulamasından geçirir; (2) karşılaştırma: yalnız `{urun_id, alan}` başvuruları ve sabit bir gerekçe-kodu kümesi. Sayıyı, birimi, `sesEtiketi` metnini ve ürün bağlantısını sunucu veritabanı satırından şablonla basar; bağlantı tek lokalize yol modülünden gelir; çıktı düz metin render edilir. Model serbest cümlede sayı ya da bağlantı yazmaz. (İlk taslaktaki "cevaptaki sayılar satırda var mı" doğrulaması bırakıldı: ürün adlarındaki devir/güç/gerilim sayıları ("950 d/dk", "0,18 kW") ve ATEX metnindeki "94/9/CE" yanlış sayıyı geçirir, sayısız iddiaları ("en sessiz", "tünel için uygun") denetlemez.)
Efor M-L, risk orta. Artı: uydurma yolu şablonla kapanır, test edilebilir. Eksi: doğal sohbet değil, süzgeçe sığmayan soru "bulamadım" der.
**YOL B — sohbet + getirme, model serbest yazar.** Doğal ama sayı/uygunluk yanlış aktarımı denetlenemez. Efor L, risk yüksek. Önerilmez.
**YOL C — modelsiz: sitedeki seçimi iyileştirmek** (Design D8 sayısal süzgeç, arama sözlüğü, mevcut sihirbazlar: `getWizardCandidates`, `SilentFanWizard`, `ductFanSelection`). Efor S-M, risk düşük, API kredisi harcamaz. A'nın süzgeç RPC'si ve eksen eşlemesi C'ye de hizmet eder.
**Maliyet dürüstlüğü:** A'nın ek maliyeti yalnız model katmanı değildir. İki migration (süzgeç RPC'si, token sayacı), KVKK işi, şablon basıcı, kapı ikiye bölünmesi ve Altyapı payı dahildir; C'nin ek maliyeti sıfıra yakındır. **Gerçek talep kanıtı yok:** sitede gerçek arama trafiği şu an sıfır (URN-165), müşterinin cümleyle ürün istediğine dair ölçülmüş davranış yok. Karar Recep'in iş kararıdır.

**Öneri:** A (modelsiz C ile birlikte ilerler), çünkü boşta duran krediyi ürün seçimine bağlar ve sayıların kaynağı katalog kalır. Karar bu tam maliyetle Recep'e gider.

## 4. Güvenlik ve kapsam kuralları (zorunlu)

1. **Sayı ve bağlantıyı model yazmaz** (3. bölüm). Sunucu satırdan basar.
2. **Modele giden sütunlar İZİN LİSTESİYLE seçilir:** görünen ad, slug ve izinli `technical_specs` anahtarları. SKU, `model_code`, barkod, `price`, `purchase_price`, `stock_qty` ve `description_i18n` (enjeksiyon yüzeyi; niyet çözmek için gerekmez) hiçbir zaman gitmez. Anon rolü bugün `price` ve `stock_qty` okuyabildiği için kara liste değil izin listesi şart; `getWizardCandidates` sonucu `sku` taşıyor, asistan bu servisi aynen kullanamaz.
3. **Sku ve model kodu kuralı:** `INV-SKU-GORUNMEZ-1` vitrin bileşenlerini tarar, model çıktısını kapsamaz; asistan için ayrı kapı gerekir. Açık karar sorusu (OPS üzerinden): canlı ürün adlarının çoğu model kodu taşıyor ("ADH-225 E2", "Vortice MP 504 T"); görünen ad gösterilir mi? Ölçüm: 431 aktif üründe SKU metni adlarda geçmiyor, ama ad desenleri model kodu taşıyor.
4. **Fiyat ve stok yok.** Asistanın okuduğu RPC bu sütunları hiç döndürmez.
5. **Eksen eşlemesinin tek kaynağı `wizard.service.ts`:** süzgeç RPC'si eşlemeyi yeniden yazmaz; ortak sabite taşınır ve `spec-axis-gate.test.ts` yeni ekseni kapsar. İki doğruluk kaynağı olmaz.
6. **Konu dışı ve hesap:** niyet sınıfı sunucu şemasından geçer; hesap → teklif formu (ve uygunsa kanal fanı sihirbazı); konu dışı → kısa ret.
7. **Prompt enjeksiyonu:** kullanıcı metni modele ayrı alanda "veri" olarak gider (bu riski azaltır, sıfırlamaz); asıl savunma çıktı yolunun kapalı olmasıdır: model bağlantı ve sayı yazamaz, çıktı düz metin render edilir, model araç çağıramaz, veritabanına yazma yetkisi yoktur.
8. **İstek sınırı fail-closed:** emsalin IP sırası kullanılır (`x-forwarded-for` ilk öğesi istemcinin yazabildiği öğedir, o sırayla alınmaz); sayaç ölçülemezse ya da cevap boşsa 503 ve arama kutusuna geri düşüş (mevcut `checkRateLimit` boş cevapta izin veriyor, bu asistan için kabul edilmez). Sayaç anahtarı oturum/IP bazlıdır, paylaşılan genel anahtar yok (anon bunu doldurup herkes için kapatabilir; bu iddia ölçülemedi, PLAUSIBLE). Günlük token tavanı için sayaç **ikinci bir migration**'dır (kural 13); sağlayıcı tarafında harcama tavanı ayrıca kurulur (Altyapı). Servis Edge Function mı Next route handler mı: açık karar (`checkRateLimit` yalnız Deno edge'de çalışıyor).
9. **Tanımlı hata yolları (aynı adımın kapsamında):** süzgeç boş döndü, süzgeç çok geniş (kaç satır modele gider, üst sınır), model geçersiz JSON/şema dışı kategori, API kesintisi/zaman aşımı, sayaç ölçülemedi. Her biri ayrı mesaj; "hata" sessizce boş liste olmaz.
10. **KVKK:** konuşma kaydı varsayılan KAPALI. Kullanıcının serbest metni ad/telefon/firma adı içerebilir ve her istekte yurt dışındaki işleyiciye (Anthropic API) gider: bu, kayıt tutulmasa da bir aktarımdır. Modele göndermeden önce deterministik maskeleme (telefon, e-posta, ad kalıpları; test edilebilir); aydınlatma metninde işleyici ve yurt dışına aktarım beyanı; sağlayıcının saklama/eğitim koşullarının doğrulanması. Hukuki değerlendirme **MEVZUAT'a ayrı kayıt** olarak gider; teknik maskeleme bu işin kapsamındadır.
11. **Kiracı başlıktan değil RLS'ten gelir:** servis anon ya da kullanıcı JWT'siyle `SECURITY INVOKER` RPC çağırır; `jwt_tenant_id()` kapsamı uygular. Service role yalnız sayaç için. İstek başlığındaki tenantId'ye güvenilmez (ayrı servis middleware'in başlık korumasını devralmaz; service role RLS'i atlar). Kalıcı kapı: `INV-ASISTAN-TENANT` ("asistan ucu tenant'ı istek başlığından okumaz"). Bugün canlıda tek kiracı var; sızıntı ikinci kiracı geldiği gün açılır.
12. **Kabul kapısı iki kümeye bölünür:** (a) deterministik, CI'da: şablon basıcı, izin listesi, maskeleme, IP çözücü, bağlantı kurucu, boş/geniş/geçersiz JSON yolları, gerçek ürün adı örnekleri ("950 d/dk", "0,18 kW", "94/9/CE"; sentetik veriyle sahte-yeşil olmasın); (b) model çağıran değerlendirme (en az 30 vaka: süzgeç doğruluğu, "veri yok" der, hesap yönlendirme, konu dışı ret, enjeksiyon kullanıcı metninde, sku/fiyat isteme, iki üretici dB karşılaştırma) CI dışında elle ya da zamanlanmış koşar, sonucu dosya olarak kapıya girer (repo herkese açık; fork PR'ına sır gelmez, `pull_request_target` ile sır verilmez).

## 5. Ölçülmedi / açık

- Haiku sınıfı modelin güncel kimliği ve birim fiyatı: claude-api yeteneğinden doğrulanacak. Kredinin gerçek tutarı ve son kullanma tarihi Anthropic konsolundan (OPS kartı). Sağlayıcının saklama ve harcama tavanı koşulları: ölçülmedi.
- Müşterinin cümleyle ürün isteyip istemediği: gözlem yok.
- Mevcut sihirbazlardan hangisinin canlıda açık olduğu: ölçülmedi.
- anon'un paylaşılan sayaç anahtarını doldurup dolduramayacağı: ölçülmedi (yalnız SELECT yetkisi).
- Gecikme: arama RPC'sinde zaten yavaş kuyruk var (sıcak p95 1257 ms, URN-165 ek verisi); asistan model gecikmesini ekler. Ölçülmedi.

## 6. Sonraki adım

OPS → Recep'e gösterim (karar: A / C / ikisi, tam maliyetle). Onaydan sonra sırayla: kapı (a) kümesi → izin listeli süzgeç RPC'si (migration, Recep onayı) → şablon basıcı ve niyet servisi (Altyapı payı: anahtar, sınır, harcama tavanı; sayaç migration'ı) → arayüz (Design). MEVZUAT'a KVKK aktarımı kaydı ayrı açılır. **Ödev (Recep):** son iki haftada bayi/müşteriden WhatsApp ya da telefonla gelen "şu işe hangi fan" türü üç somut soruyu bize ilet; model kolu vaka kümesi gerçek sorulardan kurulur.
