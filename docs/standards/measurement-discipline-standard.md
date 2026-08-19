# Ölçüm Disiplini Standardı (Measurement Discipline)

Durum: **v1.1 TASLAK** (2026-08-19, OPS-AUDIT). Kaynak: 2026-08 boyunca yaşanmış ve
panoda/hafızada kanıtlı vakalar. Her kuralın yanında onu doğuran vaka adıyla durur —
kural, vakası unutulunca keyfî görünmesin diye. v1.1 = I18N itirazları: 4.1 vakası
sahibinin anlatımıyla düzeltildi, K5 sıra-kuralıyla genişledi, K7'ye şans-vakası,
yeni K13.

## 1. Amaç ve kapsam

Bu cetvel kod değil **hüküm kurma** davranışını bağlar: bir oturum "X oldu / X yok /
X çalışıyor" demeden önce hangi ölçüm yükümlülüklerini taşır. Tüm oturumlar (insan ve
ajan) için geçerlidir. Davranışsal INV kapısı üretmez; gözcü yazımı hariç (§4) insan
disiplinidir ve ihlali kod incelemesinde adıyla anılır.

## 2. Hüküm kurma kuralları

**K1 — Vekil değil, asıl şey ölçülür.** Kapı, vekilin (kurulum adımının çıkış kodu)
değil asıl yeteneğin sorusunu sormalı. *(Vaka: apt adımı DÜŞTÜĞÜ için iş kırmızı
yanıyordu, oysa asıl soru tarayıcının açılıp açılmadığıydı; kütüphaneler imajda
olsaydı testler pekâlâ koşacaktı — kapı yanlış şeyi soruyordu. #678 Chromium probu.
Aynı olayın ikinci, AYRI dersi — "önce kaldır, kaldıramıyorsan sınırla" — bu cetvelin
değil `ci-runner-install-standard.md` §2.6'nın maddesidir.)*

**K2 — Yokluk, kanıt değildir.** Boş sonuç iki şeyden biridir: iddia yanlış YA DA
sorgu yanlış yere bakıyor. İkisi ayırt edilmeden hüküm kurulmaz. *(Vakalar: "davlumbaz"
araması boş döndü — veri `product_families`'teydi; boş commit-status listesi "bekliyor"
sanıldı — status hiç postlanmamıştı; kapıların hiç başlamaması kırmızı sanılmadı —
merge ref üretilememişti: "eksik kapı kırmızı kapı değildir".)*

**K3 — Araç, ayırt ediciliğini kanıtlamalı; kimliği HİÇ kısaltma.** İki farklı
gerçek durum aynı çıktıyı veriyorsa o ölçüm kördür ve hüküm kuramaz; yeni ölçüm
aracı bilerek-bozulmuş girdiyle KIRMIZI gördüğü kanıtlanmadan güvenilir sayılmaz.
Ve körlük çoğu kez araçta değil ARGÜMANDADIR: kısaltılmış kimlik sessizce yanlış
cevap üretir — biri fazladan eşleşir, diğeri hiç eşleşmez. *(Vakalar:
`deployments?sha=` ucu KISA sha ile çağrılınca dağıtım VAR OLSA BİLE boş liste
döndürüyor, hata vermiyor; tam 40 karakterle üç ayrımın üçünü doğru yapıyor — aynı
sorgu, argümanın biçimine göre kör ya da ayırt edici. Kardeş vaka: panoda 8
karakterlik önek iki oturumla eşleşti, biri fantomdu.)*

**K4 — Eşik, ölçümüyle yazılır.** Zaman/adet eşiği ancak gözlenmiş dağılım cetvele
yazılarak konur; "makul görünen" sayı yasak. Eşiğin kaynağı yazılmazsa sonraki kişi
onu keyfî sanıp oynatır. *(Vaka: dağıtım-kaydı gecikmesi 3 sn – 6 dk 49 sn ölçüldü;
10 dk eşiği = gözlenen en kötünün ~1,5 katı diye yazıldı. Karşıt vaka: kemer
aritmetiği — 3 deneme × 5 dk iç bekleme, 12 dk dış kemerin içine sığmıyordu.)*

**K5 — Platform metinleri model değildir; hüküm ölçümün SIRASIYLA kurulur.**
"Retry in 24 hours" gibi platform mesajları hüküm kaynağı olamaz; sıfırlanma/açılma
ancak ölçümle bilinir. Ve sıra belirleyicidir: reddin ÖNCESİNDEKİ başarı hiçbir şey
kanıtlamaz — "açıldı" hükmü yalnız reddin SONRASINDAKİ başarıyla kurulur. Ayrıca
"redden sonra başarı var" cümlesi yalnızca "filo çapında dondurma haksız" demektir;
"benim gönderimim geçer" DEMEZ — ikisi ayrılmazsa prob yeşil-ışık sanılır, peş peşe
gönderim sınırı yeniden doldurur. *(Vakalar: aynı metin daha önce ertesi sabah erken
açılmayla çürüdü; 10:14:11 success → 10:14:22 rate-limit → 10:17:57 success — 11
saniyelik kesintililik, bugüne kadarki en dar örnek.)*

**K6 — Çıkış kodu haberdir, sonuç değildir.** Bir komutun hatası, işlemin
olmadığının kanıtı değildir; retry etmeden önce hedef durumun kendisi ölçülür.
*(Vaka: `gh pr merge` hata döndürdü ama merge OLMUŞTU — retry ikinci merge olurdu.)*

**K7 — Kritik hüküm iki bağımsız kaynak ister.** Geri alınamaz işlem ya da
filo-genelini bağlayan ilan, tek sorguya dayandırılmaz. Doğru hüküm yanlış kaynaktan
gelirse yine ŞANSTIR — kurtaran şey ikinci bağımsız kaynakla örtüşmedir. *(Vakalar:
f8649378 yokluğu Vercel listesi + ayırt-edici canlılık gözlemiyle kanıtlandı — zayıf
kolu, kısa-sha argümanıyla yapılan GitHub sorgusuydu; #683 ön-koşulü kör biçimde
ölçüldü, hüküm doğru çıktı ama kanıtı ADMIN'in bağımsız READY satırı kurtardı;
#685'in preview kaydını Vercel listesi GÖSTERMEDİ, GitHub deployments gösterdi —
iki otorite aynı olaya farklı cevap verdi: dağıtım-varlığı sorusunda tek kaynak
yetmez.)*

**K8 — Ölçüm bayatlar; kurala dönüşen ölçümün bayatlığı görünmez olur.** Hükümle
eylem arasına başka olay girdiyse (master hareket etti, dosya değişti) ölçüm
tekrarlanır; "az önce bakmıştım" hüküm değildir. Tek gözlemden çıkarılıp KURAL diye
yayılan ölçüm en tehlikelisidir — kural bayatladığında kimse ölçüm olduğunu
hatırlamaz. *(Vakalar: #679 merge'inden önce master iki kez ilerlemişti, PRICING
baştan ölçtü; "preview'lar çalışıyor" cümlesi 10:18'de doğruydu, 10:21'de değildi —
kota HAT'a değil ZAMANA göre davranıyordu, kural diye yayılınca bayatlığı
görünmezleşti.)*

**K9 — Ata-sorusu: doğrusal tarihçede içerme, eşitlik değil.** "Benim değişikliğim
canlıda mı" sorusu, canlı kaydın sha'sının benimkine EŞİT olmasıyla değil, canlı
kaydın benim commit'imi İÇERMESİYLE ölçülür — eşitlik testi hızlı kuyruklarda yanlış
negatif verir. *(Vaka: dört merge dört dakikada indi; sonraki merge'in başarılı
dağıtımı öncekilerin içeriğini taşıdı.)*

**K13 — Varlık ölçümü, kullanım ölçümü değildir.** "X yazıldı mı" ile "X çağrılıyor
mu" iki ayrı sorudur; ilkine yeşil cevap ikincisini gizler. K1'in kardeşi ama ayrı:
K1 yanlış ŞEYİ ölçmeyi, K13 doğru şeyin YARISINI ölçmeyi anlatır. *(Vaka: T098
çözücüsü yazıldı, testleri yeşildi, ama hiçbir yerden ÇAĞRILMIYORDU — vitrin hiç
değişmedi ve hiçbir kapı görmedi; düzeltmede kapıya çağrı-yeri bloğu eklendi.)*

**K10 — Aynı belirti ≠ aynı mekanizma.** Bir belirtinin ("SUCCESS satırı yok") birden
fazla mekanizması olabilir ve tepkileri farklıdır; mekanizma ayırt edilmeden reçete
yazılmaz. *(Vakalar: dağıtım hiç-yaratılmadı → tazele; INACTIVE'e geçildi → içerik
zaten canlı, hiçbir şey yapma; kota reddi GÜRÜLTÜLÜ (commit status'a failure yazar),
atlanma SESSİZ (hiçbir status doğmaz) — aynı "dağıtım yok" belirtisi, üç mekanizma.)*

## 3. Bildirim ve kapsam kuralları

**K11 — Sınır adıyla yazılır.** Ölçülemeyen şey "ölçülemedi" diye, kapsam dışı kalan
yüzey adıyla rapora girer; "temiz" hükmü yalnız ölçülen kapsam için kurulur.
*(Vaka: T111 raporu "canlı veriyle ölçemedim, prod'da 0 iade var" sınırını başa koydu.)*

**K12 — Bir sınıf bir yerde onarılınca, bildiren taraf kendi yüzeyinde arar.**
Kusuru bildirmek muafiyet değildir. *(Vaka: apt-asılması iki kez bildirildi; aynı
sınırsız-timeout riski bildirenin kendi işlerinde duruyordu.)*

## 4. Gözcü yazım şartları (bağlayıcı üçlü)

Her izleme/gözcü mekanizması üç şartı taşır:

1. **Ön-koşulunu doğrular:** veri kaynağı boş/ulaşılamaz dönerse "boşluk yok" değil
   KIRMIZI der. *(Vakalar: jq yokken 1 saat sessiz izleyici; damga-eşikli izleyici —
   "son gördüğüm damgadan büyüğü bas" mantığı, saati GERİYE yazılmış olayı KALICI
   olarak kaçırır; çözüm görülen-kimlik kümesidir.)*
2. **İptal ≠ boşluk:** kaydın varlığı ile sonucu ayrı ölçülür; bilinçli iptal
   (örn. Ignored Build Step) boşluk sayılmaz.
3. **Sessizliği kendisi bozar:** beklenen olay tanımlı sürede gelmezse gözcü sussuz
   kalmaz, "hâlâ yok" bildirir; ve yazıldığı gün bilerek-boz ile KIRMIZI görebildiği
   kanıtlanır. *(Vaka: kayıt hiç doğmazsa sonsuza dek susacak üretim gözcüsü, sahibi
   tarafından yakalanıp düzeltildi.)*

## 5. İlişkili cetveller

`commerce-domain-map-standard.md` (kavram otoriteleri) · `ci-runner-install-standard.md`
(K1/K4 vakalarının CI tarafı) · `deploy-build-skip-standard.md` (iptal ≠ boşluk).
