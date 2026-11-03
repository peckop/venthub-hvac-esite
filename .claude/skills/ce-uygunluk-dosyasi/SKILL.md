---
name: ce-uygunluk-dosyasi
description: 'CE uygunluk dosyası taslağı: yazışma ve ekleri okur, rejimi doğrulatır; uygunluk beyanı taslağı, risk çerçevesi ve eksik belge listesi üretir. Tetik: "CE dosyası", "uygunluk beyanı", "risk değerlendirmesi". İmza ve değer uydurmaz.'
category: research
metadata:
  kaynak: "MEVZUAT taslağı (MVZ-2, OPS emri 3 Kasım 2026); YETENEK standardına uyarlandı, YTN-26"
  sahibi: "MEVZUAT (içerik), YETENEK (bağlama ve bütçe)"
---

# CE uygunluk dosyası hazırlama

> Bu skill **taslak üretir**; imzalamaz, kuruma göndermez, hukuki görüş vermez. Müdür çekirdeğindedir (MEVZUAT): müdür penceresi çağırır, çalışan tanımına ön yüklenmez. Depo herkese açıktır: firma adı, kişi, adres, telefon ve seri numarası skill'e, karta, PR'a ve depodaki hiçbir dosyaya girmez; örnekler genel kalır.

## Ne zaman

Bir kurum ya da müşteri, firma ürünü için CE belgesi, uygunluk beyanı, test raporu ya da risk değerlendirmesi istediğinde ve elde firmanın mevcut belgeleri ile yazışma varsa.

## Ne zaman DEĞİL

- Ürün sayfası ve ürün verisi yazımı: KATALOG.
- Mevzuat kaydına kalem eklemek: `docs/standards/mevzuat-kaydi-standard.md`.
- KVKK, mesafeli satış, fatura: OPS.
- Kuruma yazışma göndermek ya da imza atmak: dış yazışma Recep'in, imza yetkilisi üreticidir.
- Yalnız bir PDF'i okumak ya da özetlemek: `pdf` skill'i yeter.

## Diğer skill'lerle ilişki

| Skill | Rolü bu işte |
|---|---|
| `pdf` | Girdi tarafı: ekleri okur, taranmış sayfaları metne çevirir. MEVZUAT araştırmacısına zaten ön yüklü; müdür penceresi gerekirse adıyla çağırır. |
| `docx` | Çıktı tarafı: üç taslak belge Word olarak yazılır. Depo dışı kullanıcı skill'idir, bu depodaki setlerde yer almaz; yoksa python-docx ile elle yazılır. |
| `research-web` | 4. adımdaki mevzuat araştırması için yöntem; kaynak sırası ve kaynak gösterme kuralı orada. |
| `verify-before-done` | 7. adımdan önce kontrol listesini kanıtla işletir. |

## Adımlar

1. **Kart.** MEVZUAT panosunda kart aç (KAYNAK/CETVEL, YÖNTEM, ÖNCEKİ ÇALIŞMA). Kartsız başlama.
2. **Girdi topla.** Yazışma gövdelerini ve ekleri al. Posta aracı gövdeyi verir, ek içeriğini vermez; ek indirmek için OPS'tan izin al, yalnız istenen dosyaları indir ve depo dışı çalışma klasörüne koy (`<is>/girdi/`). Taranmış PDF'te sayfaları görüntüye çevirip oku.
3. **Girdi özeti yaz** (`00-girdi-ozeti.md`, iç not): yazışma özeti, kurumun talep maddeleri, ürün (ad, marka, model aileleri, etiket verisi), her ekin ne olduğu (belge türü, tarih, kapsam, hangi model, hangi madde), çelişkiler.
4. **Rejimi belirle ve doğrulat.** Hangi mevzuat uygulanır (Makine, LVD, EMC, RoHS ve benzeri)? Bugün yürürlükte olan hangisi, yaklaşan değişiklik ve geçiş tarihi ("piyasaya arz" kuralı) nedir? Araştırmacı çalışan AB metnini (CELEX servisi) ve TR metnini (Resmî Gazete) bulur; doğrulayıcı çalışan bağımsız yeniden ölçer. Doğrulanamayan "doğrulanamadı" kalır.
5. **Üç belgeyi hazırla** (Word):
   - `01-uygunluk-beyani-taslagi`: resmî alan listesi, TR ve EN.
   - `02-risk-degerlendirme-cercevesi`: ürün sınırları, tehlike listesi, risk tahmin tablosu, azaltma sırası, soru listesi (EN ISO 12100 çerçevesi).
   - `03-eksik-belge-listesi`: talep maddesi × mevcut durum × kimden alınır × not.
6. **Boş alanları işaretle:** `[BOŞ ...]`, `[DOĞRULANACAK ...]`, `[SORU ...]`, `[KARAR ...]` (sarı vurgu). Uydurma değer yok.
7. **Rapor.** OPS'a tek mesaj: dosya yolları, doldurulamayan alanlar, Recep'e en çok üç soru. Kartı Review'a taşı, manuel kanıt notuna dosya listesini yaz.

## Kontrol listesi (bitmeden)

- [ ] Beyan alanları resmî metindeki alan sayısıyla eşleşiyor (kaynak ve tarih yazılı).
- [ ] Üçüncü kişi belgesinin ne olduğu kendi metninden okundu (gönüllü onay ≠ beyan).
- [ ] Adres, tarih ve model kapsamı tutarsızlıkları listelendi.
- [ ] İmza, seri no, tarih, standart yılı, onaylanmış kuruluş no uydurulmadı.
- [ ] Standart gövdesinden cümle, tablo ya da sayı kopyalanmadı.
- [ ] Firma, kişi, telefon ve adres depoda, Kanban notunda ve PR'da yok.
- [ ] Dış kişiye e-posta, taslak ya da yanıt gönderilmedi.
- [ ] Belgelerde "imzasız taslak" bandı var ve bağlantı yolları doğru.

## Çıktı biçimleri

- `00-girdi-ozeti.md` (iç not), `01`, `02`, `03` Word taslakları, OPS raporu (düz metin, en çok üç soru).
- Klasör: depo dışı çalışma alanında `<is-adi>/` altında `girdi/`, `sayfa/` ve belgeler.

## Sınırlar

Dış yazışma Recep'tedir. İmza yetkilisi üreticidir. Hukuki danışmanlık verilmez: kapsam kararı gereken yerde soru işareti bırakılır, karar verilmez.

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
