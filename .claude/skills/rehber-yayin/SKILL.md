---
name: rehber-yayin
description: Rehber ya da blog yazısının yayın akışını yönlendirir. Yeni blog yazısı yayınlıyoruz, yazı yayınlandı, rehber yazısı yayına çıkıyor, dizine ekle, doğrulama turu cümlelerinde kullan. Basamağı, sahibini ve kapıyı söyler (cetvel R10). Yazı yazmak için write-seo-geo-content.
category: orchestration
metadata:
  kaynak: "docs/standards/rehber-yazisi-standard.md R10 (v0.8), BLG-11, OPS emri 13 Ekim 2026"
  sahibi: "BLOG (B1–B10, B16), GEO-SEO (B11–B15)"
---

# Rehber yazısı yayın akışı

> **Tek kaynak: `docs/standards/rehber-yazisi-standard.md` → `## R10`.** Bu skill kuralı tekrar yazmaz; yazının
> hangi basamakta olduğunu bulur, o basamağın sahibini, kapısını ve kaydını söyler, sıradaki adımı verir.
> Cetvelle çelişirse cetvel kazanır.

## Önce

1. Cetvelde `## R10` bölümünü aç ve tabloyu baştan sona oku. B numaraları (B1–B16) o tablodandır; ezberden yazma.
2. Yazının Kanban kartını (BLG-n) aç. Hangi basamakta olduğunu kartın son tur notundan ve kayıtlarından oku, tahminle değil.

## Nerede olduğunu bul

| Yazının durumu | Basamak | Sahibi |
|---|---|---|
| Konu, kaynak, taslak, iddia tablosu, yayın yolu ölçümü | B1–B4 | BLOG (+ MEVZUAT paketi) |
| Doğrulama turu, düzeltme, tam yeniden tur | B5–B6 | BLOG (hüküm BLOG'da; 3g MEVZUAT) |
| Önizleme gitti, onay bekliyor | B7 | BLOG sunar, Recep onaylar |
| PR açık ya da birleşti, canlıda ölçülmedi | B8–B10 | BLOG; birleşmeyi OPS onaylar |
| Canlı 200, dizin isteği ya da IndexNow yok | B11–B12 | GEO-SEO |
| Yayın sonrası ölçüm, kaynak bakımı | B13–B16 | GEO-SEO ölçer, BLOG yorumlar |

## Her basamakta üç şeyi söyle

1. **Sahibi** kim (kendi işin değilse mesajla ilet, yapma).
2. **Kapısı** ne: hangi komut, test ya da kayıt. Cetvelde "aday" yazan kapı (K0, K0b, K1–K5) **yazılmamıştır**;
   var gibi anılmaz, yerine elle yapılan kontrol söylenir.
3. **Kaydı** nerede: yazının Kanban kartına not (adres, komut, çıktı); sorgu listeleri ve ham raporlar depo dışı.

## Sahada düşülen yanlışlar (ölçüldü; tekrar etme)

1. **"IndexNow anahtarı yok" sanıldı.** Anahtar `public/<anahtar>.txt` olarak depoda ve canlıda 200'dür; Bing/IndexNow adımı atlanmaz (B12).
2. **Liste kartı ve ters bağlantı ham HTML'le onaylanmaz.** Görünüm tarayıcı bölmesiyle ölçülür (B10).
3. **Kart doğrulayıcısı `curl` ve kabuk operatörünü reddeder.** "Canlı 200" ölçütü elle işaretlenir; kanıt kart notundadır.
4. **Birleşmiş PR'ın dalına commit atılmaz.** Kapalı PR yeni commit almaz; düzeltme yeni dal ve yeni PR olur (R5.5 revizyonu).
5. **Onay sorusu gitmeden önce yayın yolu ölçülür** (R5.7): bağlanan kimlikler güncel slug'a çözülmüyorsa metin yayına giremez, onay sorulmaz.
6. **Doğrulanan metin tek karakter değişirse** durum taslağa düşer ve tüm metin yeniden tura girer (R5.1 adım 5).
7. **Zincir bitmeden kart kapanmaz.** B10, B11 ve B12 kayıtları kartta olmadan yazı kartı Done'a taşınmaz (R10.3).

## Sınır

- Yazı yazmaz (biçim için `write-seo-geo-content` ve `docs/roller/BLOG-kurallar.md`); yayın yetkisi vermez, yetki Recep'in B7 onayıdır.
- Google isteği ve IndexNow gönderimini BLOG yapmaz, GEO-SEO'nundur (SEO-39); Recep'ten ayrıca onay istenmez.
- Çalışan alt ajan bu akışı yürütmez; müdür çalıştırır, çalışan yalnız görev metnindeki işi yapar.

<!-- ORTAK-BITIS-BASLANGIC (kaynak: .claude/skills/_ortak/bitis-durumu.md) -->
## Bitiş Durumu, Karışıklık ve Kanıtsız Kısıt

**Bitiş durumu — son satırda `DURUM: <kelime>` biçiminde söylenir.** Kelime **yalnız şu dörtten
biri** olabilir: `BITTI` (istenen yapıldı ve ölçüldü) · `CEKINCELI` (yapıldı ama adı konmuş bir
çekince var) · `ENGELLI` (dışarıdan bir şey bekliyor) · `BAGLAM-EKSIK` (soru cevaplanmadan devam
edilemez).

⚠**Beşinci kelime uydurulmaz.** "BEKLEMEDE", "KISMEN", "DEVAM EDIYOR" gibi kelimeler bu listede
yoktur; beklemek `ENGELLI`dir, yarım kalmak `CEKINCELI`dir. Kapalı liste bilinçli: kelime serbest
kalırsa her çağrı kendi sözlüğünü yazar ve durum makine tarafından okunamaz hâle gelir.

`BITTI` dışındaki her durum şu üçünü de yazar: **SEBEP** (tek cümle) · **DENENEN** (ne denendi,
sonucu ne oldu) · **ÖNERİ** (bir sonraki somut adım, kimde).

**Karışıklık:** yüksek riskli bir belirsizlikte tahminle devam edilmez — **DURULUR**, iki üç
seçenek gerekçesiyle yazılır ve biri önerilir. Yüksek risk: geri alınması pahalı olan, prod'a
dokunan, başka şeridin dosyasını değiştiren, para veya sır ilgilendiren iş.

**Kanıtsız kısıt yoktur:** *"olmuyor / erişemiyorum / araç desteklemiyor"* tek başına sonuç
değildir. Kısıt iddiası **birebir hata metni**, **belgeden alıntı** ya da **canlı ölçüm** ile
gelir. Kanıt yoksa doğru cümle *"ölçemedim"*dir, *"yapılamaz"* değil.

⚠**Ölçemedim ile ihlal ayrı sonuçlardır.** İkisini aynı kovaya koymak, bozuk bir ölçümü
gerçek bir kusur gibi raporlar.
<!-- ORTAK-BITIS-SON -->
