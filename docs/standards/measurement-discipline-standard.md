# Ölçüm Disiplini Standardı (Measurement Discipline)

Durum: **v1.0 TASLAK** (2026-08-19, OPS-AUDIT). Kaynak: 2026-08 boyunca yaşanmış ve
panoda/hafızada kanıtlı vakalar. Her kuralın yanında onu doğuran vaka adıyla durur —
kural, vakası unutulunca keyfî görünmesin diye.

## 1. Amaç ve kapsam

Bu cetvel kod değil **hüküm kurma** davranışını bağlar: bir oturum "X oldu / X yok /
X çalışıyor" demeden önce hangi ölçüm yükümlülüklerini taşır. Tüm oturumlar (insan ve
ajan) için geçerlidir. Davranışsal INV kapısı üretmez; gözcü yazımı hariç (§4) insan
disiplinidir ve ihlali kod incelemesinde adıyla anılır.

## 2. Hüküm kurma kuralları

**K1 — Vekil değil, asıl şey ölçülür.** "Kurulum adımı geçti" ≠ "araç çalışıyor".
Hüküm, asıl yeteneğin kanıtıyla kurulur. *(Vaka: apt adımı yeşildi ama hiçbir şey
kurmuyordu; asıl soru "Chromium açılıyor mu" idi — #678 probu.)*

**K2 — Yokluk, kanıt değildir.** Boş sonuç iki şeyden biridir: iddia yanlış YA DA
sorgu yanlış yere bakıyor. İkisi ayırt edilmeden hüküm kurulmaz. *(Vakalar: "davlumbaz"
araması boş döndü — veri `product_families`'teydi; boş commit-status listesi "bekliyor"
sanıldı — status hiç postlanmamıştı; kapıların hiç başlamaması kırmızı sanılmadı —
merge ref üretilememişti: "eksik kapı kırmızı kapı değildir".)*

**K3 — Araç, ayırt ediciliğini kanıtlamalı.** İki farklı gerçek durum aynı çıktıyı
veriyorsa araç kördür ve o çıktıyla hüküm kurulamaz. Yeni ölçüm aracı, bilerek
bozulmuş girdiyle KIRMIZI gördüğü kanıtlanmadan güvenilir sayılmaz. *(Vaka:
`deployments?sha=` sorgusu hem gerçek yoklukta hem dağıtım varken sıfır döndü.)*

**K4 — Eşik, ölçümüyle yazılır.** Zaman/adet eşiği ancak gözlenmiş dağılım cetvele
yazılarak konur; "makul görünen" sayı yasak. Eşiğin kaynağı yazılmazsa sonraki kişi
onu keyfî sanıp oynatır. *(Vaka: dağıtım-kaydı gecikmesi 3 sn – 6 dk 49 sn ölçüldü;
10 dk eşiği = gözlenen en kötünün ~1,5 katı diye yazıldı. Karşıt vaka: kemer
aritmetiği — 3 deneme × 5 dk iç bekleme, 12 dk dış kemerin içine sığmıyordu.)*

**K5 — Platform metinleri model değildir.** "Retry in 24 hours" gibi platform
mesajları hüküm kaynağı olamaz; sıfırlanma/açılma ancak ölçümle bilinir. *(Vaka:
aynı metin daha önce ertesi sabah erken açılmayla çürüdü.)*

**K6 — Çıkış kodu haberdir, sonuç değildir.** Bir komutun hatası, işlemin
olmadığının kanıtı değildir; retry etmeden önce hedef durumun kendisi ölçülür.
*(Vaka: `gh pr merge` hata döndürdü ama merge OLMUŞTU — retry ikinci merge olurdu.)*

**K7 — Kritik hüküm iki bağımsız kaynak ister.** Geri alınamaz işlem ya da
filo-genelini bağlayan ilan, tek sorguya dayandırılmaz. *(Vaka: f8649378 yokluğu
Vercel listesi + ayırt-edici canlılık gözlemiyle kanıtlandı; tek kaynağı sonradan
kör çıkan GitHub sorgusuydu.)*

**K8 — Ölçüm bayatlar.** Hükümle eylem arasına başka olay girdiyse (master hareket
etti, dosya değişti) ölçüm tekrarlanır; "az önce bakmıştım" hüküm değildir.
*(Vaka: #679 merge'inden önce master iki kez ilerlemişti; PRICING baştan ölçtü.)*

**K9 — Ata-sorusu: doğrusal tarihçede içerme, eşitlik değil.** "Benim değişikliğim
canlıda mı" sorusu, canlı kaydın sha'sının benimkine EŞİT olmasıyla değil, canlı
kaydın benim commit'imi İÇERMESİYLE ölçülür — eşitlik testi hızlı kuyruklarda yanlış
negatif verir. *(Vaka: dört merge dört dakikada indi; sonraki merge'in başarılı
dağıtımı öncekilerin içeriğini taşıdı.)*

**K10 — Aynı belirti ≠ aynı mekanizma.** Bir belirtinin ("SUCCESS satırı yok") birden
fazla mekanizması olabilir ve tepkileri farklıdır; mekanizma ayırt edilmeden reçete
yazılmaz. *(Vaka: dağıtım hiç-yaratılmadı → tazele; INACTIVE'e geçildi → içerik zaten
canlı, hiçbir şey yapma.)*

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
   KIRMIZI der. *(Vakalar: jq yokken 1 saat sessiz izleyici; kör pano filtresi.)*
2. **İptal ≠ boşluk:** kaydın varlığı ile sonucu ayrı ölçülür; bilinçli iptal
   (örn. Ignored Build Step) boşluk sayılmaz.
3. **Sessizliği kendisi bozar:** beklenen olay tanımlı sürede gelmezse gözcü sussuz
   kalmaz, "hâlâ yok" bildirir; ve yazıldığı gün bilerek-boz ile KIRMIZI görebildiği
   kanıtlanır. *(Vaka: kayıt hiç doğmazsa sonsuza dek susacak üretim gözcüsü, sahibi
   tarafından yakalanıp düzeltildi.)*

## 5. İlişkili cetveller

`commerce-domain-map-standard.md` (kavram otoriteleri) · `ci-runner-install-standard.md`
(K1/K4 vakalarının CI tarafı) · `deploy-build-skip-standard.md` (iptal ≠ boşluk).
