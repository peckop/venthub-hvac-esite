# Kart Planı Standardı (v1.1 — 2026-10-03)

> **Ne yönetir:** Kanban kartının içindeki PLAN bölümünün nasıl yazıldığı, kimin uyguladığı ve eksiksiz
> olduğunun nasıl ölçüldüğü. İş emri kartının KAYNAK/CETVEL bloğu (CLAUDE.md kural 1) ayrı kalır; bu cetvel
> onun altındaki PLAN'ı yönetir.
> **Niçin var:** Recep 2026-10-02 (karar 241): plan karta yazılır, konuyu hiç bilmeyen biri yalnız o kartı
> okuyarak uygulayabilmelidir; işi planı yazan müdür değil, yeni açılan ekip üyesi yapar. Karar 243:
> müşteriye görünen, veritabanı ya da site yapısı planları Recep'e tek sayfa özetle gider. Karar 244:
> kontrolü yazılamayan kural girmez; bu yüzden kural bir betikle ölçülür.
> **Sahibi:** HARİTA. Kartı Kanban'a taşıma düzeni (`is-kayit-duzeni-standard.md`) OPS'undur, buna dokunulmaz.
> **Son doğrulama:** 2026-10-03.
> **Kayıt:** HRT-14 (OPS-13); v1.1 HRT-26 (OPS-30, ÖNCEKİ ÇALIŞMA satırı). **İlgili:** `execution-method-standard.md` §10 (çalışan tanımları).

## Kural

1. Plan, kartın açıklamasına yazılır; sohbette, hafızada ya da başka dosyada kalan plan plan sayılmaz.
2. Plan, konuyu hiç bilmeyen birinin yalnız o kartı okuyarak uygulayabileceği açıklıkta yazılır: dosya yolu,
   komut, beklenen çıktı ve durma noktası kartta geçer; "bildiğin gibi" ya da "uygun olanı" denmez.
3. İşi planı yazan müdür yapmaz; yeni açılan bir ekip üyesi (alt ajan) yapar. Üye plandaki bir belirsizlikte
   tahminle devam etmez, Sor-noktaları'na göre durur ve müdüre yazar.
4. Plan, kartı okuyan kişinin dışında bir şeye dayanmaz; başka kartın sohbetine ya da bir oturum hafızasına
   atıf yapılırsa atıf edilen bilgi karta da yazılır.

## ŞABLON

Aşağıdaki iskelet kartın açıklamasına satır başı ile yazılır (kod çiti yalnız bu cetvelde örnek içindir;
kartta çit KULLANILMAZ, çünkü kapı çit içindekini saymaz). ŞABLON bu cetvelin İLK kod çitidir; ikinci çit
(istisna satırı) şablon sayılmaz.

```
PLAN
Amaç: bir iki cümle; işin bitince neyi değiştirdiği, kime ne işe yaradığı (en az 20 karakter).
ÖNCEKİ ÇALIŞMA: bulunan kart/commit/dosya ya da yok. Aranan: Kanban search_tasks (Done + arşiv), git log --all --grep, docs/plans, docs/audits, sage, Linear (arşiv). ifade: aranan sözcükler.
Adımlar: sıra numaralı liste; her adım tek eylem, yol/komut/beklenen çıktı ile (en az 2 adım, 40 karakter).
1. İlk adım.
2. İkinci adım.
Dosyalar: YAZILIR ve DOKUNULMAZ yollar, ayrı ayrı (en az 10 karakter).
Bitti ölçütü: ölçülebilir; hangi komut hangi çıktıyı verince iş biter (en az 20 karakter).
Ölçülmeyenler: bu işin kapsamı dışında bıraktığı şeyler ve nedeni (en az 3 karakter; yoksa "yok").
Sor-noktaları: üyenin durup müdüre yazacağı durumlar (en az 3 karakter; yoksa "yok").
Etki alanı: yok | müşteriye-görünen | veritabanı | site-yapısı
Recep özeti: yalnız Etki alanı "yok" değilse; OPS'un sunduğu tek sayfa özetin karar numarası ya da tarihi.
Sınıf: bu-ay | ilk-satistan-once | rafta   (açıklamaya değil, kart açılırken Kanban `labels` alanına tek etiket olarak yazılır)
```

"Sınıf" kapının zorunlu etiketi DEĞİLDİR (karar 244 adım 2): kartın `labels` alanında bu üç değerden TAM BİRİ
bulunmalıdır. Kapı `--kart` ile okunan kartta sınıf etiketi yoksa ya da birden fazlaysa stderr'e UYARI basar
(küçük/büyük harf fark etmez); bu kol YALNIZ uyarıdır, çıkış kodunu değiştirmez (yeni açılan kart sınıfsız doğar).

Her etiketin anlamı:

- **Amaç:** işin sonunda neyin değişeceği ve bunun neye yaradığı.
- **Adımlar:** sırayla yapılacaklar; her adım tek eylem, komutu ve beklenen çıktısıyla.
- **Dosyalar:** hangi yollar yazılır, hangileri DOKUNULMAZ; üye bu listenin dışında yola dokunmaz.
- **Bitti ölçütü:** "bitti" demenin ölçülebilir koşulu; yalnız komut ve beklenen çıktı.
- **Ölçülmeyenler:** bu işte bilerek yapılmayan ya da ölçülmeyen şeyler; sonradan "neden bakılmadı" denmesin.
- **Sor-noktaları:** durup müdüre yazılacak durumlar; üye bu noktalarda tahmin yürütmez.
- **Etki alanı:** işin dışarıya etkisi; dört değerden biri (aşağıda).

## Önceki çalışma (HRT-26, OPS-30)

Niçin var: 2026-10-03'te depoda ve Kanban'da zaten duran 441 adreslik liste (09-23'te üretilmişti) iş başında aranmadığı için
sıfırdan üretilmeye başlandı. Kart araması kart dışı dosyaları (listeler, ölçüm defterleri) göremez; bu yüzden aranacak yerler
yalnız Kanban değil, depo ve hafıza da. Plan "önce bu iş daha önce yapıldı mı" sorusunun yazılı cevabıyla başlar.

Kural: PLAN'da `ÖNCEKİ ÇALIŞMA:` etiketi bulunur ve şunları yazar:

- **Aranan yerler (beşi de):** Kanban `search_tasks` (`includeCompletedTasks` + `includeArchived`, tüm panolar), `git log --all --grep`,
  `docs/plans` ve `docs/audits`, sage, Linear (donuk arşiv; yalnız 10-01 öncesi kayıtlar için okunur). Aynı beş yer
  `wrongstack-kanban` skill'inin §B.1'inde ve ARC-30 iş başı tarama komutunda (ARAÇ) geçer; üç yerde ifade aynıdır.
- **Arama ifadesi:** `ifade: <aranan sözcükler>` (en az 3 karakter). İfadesiz sonuç geçersizdir.
- **Sonuç:** bulunan kart numarası, commit özeti ya da dosya yolu; hiçbiri yoksa `yok`. "yok" yalnız beş yer ve ifade yazılıysa geçer.
  Bulunan şey varsa plan onu nasıl kullandığını (devam, yenileme, çürütme) Amaç ya da Adımlar'da söyler.

Örnek (yok): `ÖNCEKİ ÇALIŞMA: yok. Aranan: Kanban search_tasks (Done + arşiv, tüm panolar), git log --all --grep, docs/plans, docs/audits, sage, Linear; ifade: adres listesi 441.`
Örnek (bulundu; kart numarası ve dosya adı uydurmadır, yalnız biçimi gösterir): `ÖNCEKİ ÇALIŞMA: HRT-99 kartı ve docs/audits/ornek-liste.md bulundu. Aranan: Kanban search_tasks, git log --all --grep, docs/plans, docs/audits, sage, Linear; ifade: adres listesi.`

Yürürlük: 2026-10-04 (UTC). Kapı, kartın `createdAt` alanı bu tarihten ÖNCE ise eksik satırı yalnız UYARI olarak basar ve çıkış
kodunu değiştirmez; yeni kartta ve `--dosya` ile verilen metinde (tarihsiz) satır zorunludur (çıkış 1). Mevcut açık kartlar
toplu düzeltilmez (OPS 10-03). Kapı satırın İSKELETİNİ ölçer: aramanın gerçekten yapıldığını değil, yazıldığını. ARC-30 komutu
çıktısını bu satıra yazmayı kolaylaştırır; komut yoksa arama elle (`kanban_read search_tasks`, `git log`, `grep`, sage) yapılır.

## Etki alanı ve Recep özeti (karar 243)

"Etki alanı:" değeri yalnız şunlardan biridir: `yok`, `müşteriye-görünen`, `veritabanı`, `site-yapısı`.
Değer `yok` değilse kartta ayrıca dolu bir "Recep özeti:" satırı bulunur; içeriği, OPS'un Recep'e sunduğu tek
sayfa özetin karar numarası ya da tarihidir ("Recep özeti: karar 243 sunuldu" gibi). Özet Recep'e gitmeden
ekip üyesi dosyaya dokunmaz. Özeti Recep'e sunmak OPS'un işidir; departman müdürü kartı hazırlar, özeti
Recep'e doğrudan götürmez.

## Kontrol: kart-plan kapısı

Betik: `scripts/belge/kart-plan-kapisi.cjs`. Kimliği INV-KART-PLAN-1, testi
`src/__tests__/conformance/belge-kart-plan-kapisi.test.ts`.

- Kartın açıklamasında satır başında "PLAN" başlığı aranır; kod çitleri ve HTML yorumları içindeki satırlar
  sayılmaz (şablon örneği kapıyı geçirmesin; `scripts/board/pr-kayit-kapisi.cjs` ile aynı mantık).
- Başlıktan sonra yedi etiket bulunmalıdır: Amaç, Adımlar, Dosyalar, Bitti ölçütü, Ölçülmeyenler,
  Sor-noktaları, Etki alanı; sekizincisi `ÖNCEKİ ÇALIŞMA` yeni kartlarda zorunludur (§Önceki çalışma; büyük/küçük ve
  noktalı/noktasız yazım tolere edilir, eksiği ya da geçersizi çıkış 1 verir, yürürlükten önceki kartta yalnız uyarı).
- Asgari uzunluk (boşluksuz karakter): Amaç 20, Adımlar 40 ve en az iki numaralı adım ("1." "2." ile
  başlayan satır), Dosyalar 10, Bitti ölçütü 20, Ölçülmeyenler 3, Sor-noktaları 3.
- Etki alanı dört izinli kelimeden biri olmalı; `yok` değilse "Recep özeti:" dolu olmalı ve en az bir
  rakam içermeli (karar numarası ya da tarih; "gönderildi" gibi rakamsız metin geçmez). Değer YALNIZ
  etiketin kendi satırıdır; "yok." noktalı ve büyük harfli (VERİTABANI) yazım kabul, çoklu etki virgülle
  yazılır ("veritabanı, site-yapısı"); `yok` başka değerle birleşmez.
- Markdown süsü tolere edilir: `## PLAN`, `**PLAN**`, `**Amaç:** metin`, `- Amaç: metin` kabul edilir.
  Numaralı adım sayımı ham satırlarda yapılır (satır `1.` ile başlamalı).
- PLAN başlığı ile "PLAN: gerekmez — ..." satırı birlikte varsa PLAN değerlendirilir, istisna yok sayılır.
- Kartı bulma: önce başlığın BAŞINDAki numara (`HRT-14 · ...`); bulunamazsa başlığın ilk 60 karakterinde
  numara aranır ("URUN REC-411: ..."). Her aşamada tek eşleşme gerekir; birden fazlası "belirsiz" sayılır
  ve çıkış 2 verir.
- Linear numarası: PR başlığında ve gövdesinde kapanmaması gereken Linear numarası (REC-nn) geçmez, yalnız
  `Kanban: <no>` satırı yazılır (Linear'a bağlı PR birleşince kayıt kendiliğinden Done olur, REC-508 böyle
  kapandı). `--pr-govde-dosyasi` gövdede REC-nn görürse stderr'e UYARI basar; bu kol YALNIZ uyarıdır, çıkış
  kodunu değiştirmez (karar 187 ile geçiş döneminde kasıtlı `Fixes REC-nn` meşrudur). `Kanban: REC-411`
  satırının kendisindeki REC-nn geçerli bir kart numarasıdır (taşınan Linear kaydı) ve uyarı vermez; yalnız
  diğer satırlardaki REC-nn uyarır.
- Çıkış kodu: 0 geçti ya da plan-gerekmez; 1 eksik var (her eksik ayrı satırda); 2 Kanban veri dosyası
  okunamadı ya da kart bulunamadı/belirsiz (sessizlik geçti sayılmaz). Betik hiçbir şey yazmaz.

Koşum yeri: yerelde, `node scripts/belge/kart-plan-kapisi.cjs --kart HRT-14` (Kanban veri dosyası
`VENTHUB_KANBAN_DB` ortam değişkeniyle, yoksa ana deponun `.wrongstack/kanbans/_kanban.sqlite` dosyasıyla
bulunur, salt okunur açılır; şema: tablo `kanban_boards(id, payload, revision, updated_at)`, kartlar
`payload` JSON'unda `tasks[]` içindedir). `--dosya <yol>` açıklamayı düz metin dosyasından, `--pr-govde-dosyasi <yol>`
PR gövdesindeki "Kanban: <NO>" satırından kartı okur. CI'da KOŞMAZ: Kanban verisi git dışıdır ve depo
public'tir. Kapıyı birleştirme ritüeline bağlamak ARAÇ'ın ayrı işidir.

## Sınır: plansız iş

Gelişigüzel kısa kart ya da plan gerektirmeyen iş için tek istisna satırı vardır:

```
PLAN: gerekmez — <sebep, en az 8 karakter>
```

Bu satır kapıdan geçer ama "plan-gerekmez" olarak ayrıca sayılır; sebep kısa ya da boşsa kapı reddeder.
İstisna, planın zahmetinden kaçmak için değil, plan yazmanın iş kadar uzun olacağı küçük işler içindir.
Etki alanı "yok" değilse ya da sebep bu etkileri anıyorsa gerekmez istisnası kullanılmaz: sebepte veritabanı,
şema, migration, müşteri, vitrin, site yapısı, rota, url, menü, fiyat ya da ödeme kökü geçerse (ASCII katlamalı,
sözcük başı eşleşmesi) kapı reddeder; bu işler Recep özetli tam PLAN ister (karar 243).
Olumsuzlama da reddedilir ("fiyata dokunmaz" gibi bir sebep de kök içerdiği için ret alır): kapı cümlenin anlamını
değil kökün varlığını ölçer, bilerek güvenli taraftadır; ilk takılan tam PLAN yazar.

## Ölçülmeyenler

- Kapının CI'ya ya da birleştirme ritüeline bağlanması (ARAÇ).
- Mevcut kartların toplu taranması (bu cetvel yeni kartları yönetir).
- Üyenin plan onayı olmadan dosyaya dokunamaması (karar 242; URUN'da deneme).
