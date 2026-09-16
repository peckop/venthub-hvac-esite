# Hüküm-Kaynak Cetveli — her hükmün arkasında bugün koşulmuş bir ölçüm olur

> **Doğuran olay:** 2026-09-16, URUN şeridi Recep'e **aynı oturumda dört yanlış hüküm** verdi.
> Dördünün de cevabı elimizdeki belgelerde yazılıydı ve okunmadı. Recep'in sözü:
> *"ben bu senin bug'ından çok sıkıldım"* · *"tekrar eden döngülerdeyiz… patinaj yapıyoruz."*
>
> **Recep kararı 27 (2026-09-16): KABUL** — *"ölçüm olmalı evet."*
> **Recep kararı 26 (aynı gün): RED** — *"bunu size bırakıyorum ve bıraktığım zaman işe
> bugünkü durum oluyor… bu önerin benim için anlamsız. var ise tersini ispatla!"*
> Yani karar yetkisi şeride devredilmedi ve devredilmesi **ispata bağlandı.** Bu cetvel o
> ispatın nasıl ölçüleceğini tanımlar.

---

## 1 · KURAL

Recep'e giden her **hüküm cümlesi** — "şu bozuk", "şu boş", "şu sayı şudur", "şu çalışmıyor",
"şu değerli değil" — yanında **kaynağını taşır.** Üç kaynak sınıfı vardır ve karıştırılamaz:

| Sınıf | Nasıl yazılır | Örnek |
|---|---|---|
| **A · Kendi ölçümüm** | "bugün ölçtüm: …" + komut/sorgu | *"bugün ölçtüm: 441 aktif üründen 433'ü alt kategorili"* |
| **B · Başkasının ölçümü** | "şu belgede yazılı, ölçen ben değilim" | *"REC-313 belgesinde yazılı, ölçümü ALTYAPI üç gün önce yaptı"* |
| **C · Ölçmedim** | "bilmiyorum, bakıyorum" | — |

⛔**B'yi A gibi sunmak yasak.** 2026-09-16'da graphify hükmü tam bu şekilde verildi: başka
şeridin üç gün önceki ölçümü kendi hükmüm gibi aktarıldı, üstelik özetlenirken bozuldu.

⛔**Simülasyon sayısı ölçüm sayısı değildir.** Aynı gün "jet fan 0→61" denildi; gerçek ölçüm
21 çıktı. Bir sorgunun *tahmini* çıktısı, o sorgunun *koşulmuş* çıktısı değildir.

---

## 2 · VERİTABANI HÜKMÜ İÇİN EK ŞART (bugünkü hatanın doğrudan kapatılması)

Bir tablonun **verisi** hakkında hüküm vermeden önce o tablonun **alan listesi** okunur:

```sql
SELECT column_name, data_type FROM information_schema.columns
WHERE table_schema='public' AND table_name='<tablo>';
```

Bir **ilişki** ölçülüyorsa (kategori, aile, marka, üst/alt) o ilişkiyi taşıyabilecek **her
alan** aranır: `%categ%` · `%family%` · `%parent%` · `%sub%` · `%group%`.

**Niçin:** 2026-09-16'da `products.category_id`'ye bakılıp *"441 ürünün 360'ı tek kategoride,
kategori ağacı kullanılmıyor, veri bozuk"* hükmü verildi. Tabloda `subcategory_id` diye
**ikinci bir alan** vardı ve 441 ürünün **433'ü** dolu. Katalog sağlamdı.

⭐**Ve cevap zaten yazılıydı:** `docs/database_schema_master.md` satır 370 `subcategory_id`'yi
listeliyor; aynı belgenin 969-970. satırları `ON p.category_id = c.id OR p.subcategory_id = c.id`
diyen mevcut bir sorguyu gösteriyor. Yani eksik olan araç değil, **var olan haritanın
okunmasıydı** → `docs/README.md` "hangi soru → hangi dosya" haritası bu iş için var.

---

## 3 · KARNE — "tersini ispatla" buradan ölçülür

Recep karar 26'yı reddederken ispat istedi. İspat söz değil **sayı** olacak: her geri alınan
hüküm buraya yazılır. Sayı düşerse devir tartışılabilir; düşmezse tartışılmaz.

### Taban çizgisi — 2026-09-16 (URUN, tek oturum): **4 geri alınan hüküm**

| # | Verilen hüküm | Gerçek | Kök sebep |
|---:|---|---|---|
| 1 | "jet fan 0→61 sonuç" | ürün adında "jet" 21, JET Serisi ailesi 21 | simülasyon sayısı ölçüm gibi sunuldu |
| 2 | "kategoriler boş, veri bozuk, plan değişsin" | 433/441 alt kategorili, katalog sağlam | tek alana bakıldı, şema okunmadı |
| 3 | "graphify'ın komutu bozuk" | komut yanlış kullanılmış; `affected` ile **doğru** cevap veriyor | B sınıfı kaynak A gibi sunuldu ve bozularak özetlendi |
| 4 | "kurulum kural dosyasına kalıcı blok yazıyor, kurmayalım" | üç satırlık ad kaydı; tehlikeli olan `--strict` ve o **opsiyonel** | kurulumun ne yaptığı ölçülmeden hüküm verildi |

⭐**2 numara en pahalısı:** yanlış sayı yalnız yanlış bilgi değil, **iş sırasını da değiştirdi** —
Recep'e "bu adımı yapma, önce kataloğu düzelt" denildi. Ölçüm yanlışsa plan da yanlış kurulur.

### Aynı gün doğru yapılan tek şey — kayda geçer, çünkü kural bundan çıktı

Taze derleme ölçümünde `products/<slug>` HTML'i yok görünüyordu. **Bulgu diye yazılmadı,
"soru işareti" diye yazıldı ve ölçüldü** — bayat derleme çıktı. Bulgu yazılsaydı olmayan bir
arıza için iş emri doğacaktı. Doğru davranış budur: *ölçülmemiş şey hükme dönüşmez.*

### Kayıt usulü

Bir hüküm geri alındığında satır **aynı oturumda** eklenir; "sonra yazarım" yoktur.
Satır: tarih · şerit · verilen hüküm · gerçek · kök sebep (yukarıdaki dört sınıftan biri).
Karne **yalnız büyüyebilir**; bir satır silinmez, çünkü silinebilen karne karne değildir.

---

## 4 · BU CETVELİN SINIRLARI (adıyla)

1. **Otomatik kapı YOK.** Bu cetvel bugün bir alışkanlık sözleşmesidir; "hüküm cümlesi"ni
   makine tespit etmiyor. Ölçülebilir tek şey §3'teki karnedir.
2. **§2'nin kapıya bağlanması ayrı iştir** ve `.claude/hooks/**` ALTYAPI şeridindedir —
   bu şerit oraya yazmaz. Şartname §2'de hazır; kolu ALTYAPI yazar.
3. **Karnenin tek oturumluk tabanı vardır.** Dört sayısı bir gündür, eğilim değil. İkinci
   ölçüm noktası olmadan "iyileşti/kötüleşti" denemez.
4. **Bu cetvel kendi kuralına tabidir:** içindeki her sayı bu belgede ölçümüyle yazılı
   (441/433, satır 370, 21, üç satır). Kaynaksız sayı buraya da giremez.

İlgili: REC-340 · REC-313 · REC-310
