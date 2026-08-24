# Çözüldü (Settled) Standardı — v1.0

> **Bu dosya nedir?** Bir işin ne zaman "çözüldü" sayılacağının ve sonradan bakan bir ajanın onu
> **yeniden ölçmeden** ne zaman doğru kabul edebileceğinin kuralı.
>
> **Neden var?** (Recep, 2026-08-22) "İleride geriye dönük bakıldığında, bir çalışma yapılmış ve
> eksiksizse, o ajanın bunu istisnasız doğru kabul etmesini nasıl sağlarız? Olmazsa mükerrer
> tekrarlar olur." Aynı gün canlı kanıt: ÜRÜN'ün "ağırlık sapması" diye taşıdığı açık kalem
> ölçülünce ne DB'de ne kaynakta çıktı — **hatırdan yazılmış** bir kalemdi; bir geçersizlik-şartına
> bağlı olmasaydı biri onu "düzeltmeye" çalışıp saatler yakardı.

## 0. Gerilim: iki ders çarpışıyor

- **"Tamamlanma kanıtlanır, varsayılmaz"** (completion-proven-not-assumed) → düz bir "BİTTİ" notuna
  güvenme.
- **"Ölçümü kodlayan yorum bayatlar"** (comment-encoding-a-measurement-goes-stale) → "bugün 32 aile"
  yazan bir not yarın yanlış olur.

Uzlaşma: **Güven bedava değildir; güveni bir mekanizma taşır.** Düz "bitti" kaydına güvenilmez;
kendini yeniden kanıtlayan bir **kapı** ya da açık bir **geçersizlik-şartı** taşıyan kayda güvenilir.

## 1. İki meşru "çözüldü" biçimi

### A) BEKÇİLİ çözüldü (tercih edilen)
İş, kendini her CI'da **saniyeler içinde yeniden kanıtlayan** bir teste (INV / conformance /
integrity-check) bağlıdır. Örnek: SEAT birim sözleşmesi → `catalog-integrity` spec-unit değişmezi.

- **Sonradan bakan ajan işi ELLE ÖLÇMEZ. Yeşil kapıya bakar, geçer.** Kapı ölçümün kendisidir;
  biri bozarsa kırmızı olur.
- Kapı varken elle yeniden ölçmek **yasaktır** (mükerrer emek + kapıyla çelişme riski).
- Kapı, "artık buna dönme" demenin **tek meşru yolu**dur — hem insanı hem ajanı geri bakmaktan kurtaran şey odur.

### B) ŞARTLI çözüldü (kapı kurulamayan bir-kerelik işler için)
Her iş testle korunamaz (bir defalık ölçüm, dış-kaynak kararı). Bunlar deftere yazılır ama düz
"BİTTİ" değil — **geçersizlik-şartıyla**:

```
ÇÖZÜLDÜ: <ne kanıtlandı> · KANIT: <ölçüm/dosya:satır/PR> · TARİH: <YYYY-MM-DD>
GEÇERSİZ OLUR EĞER: <bu koşul oluşursa yeniden ölçülür>
```

- Sonradan bakan ajan tek şeye bakar: **geçersizlik-şartı oluştu mu?** Oluşmadıysa güvenir, elle
  ölçmez. Oluştuysa yeniden ölçer.
- Şartı bayatlatan **zaman değil, öncüllerin değişmesidir** (Recep 08-22: "sadece zaman geçti =
  bayat değil; elektrik kesintisi gibi düşün"). Şart, zaman değil **değişim** cümlesidir.
- Örnek (08-22, gerçek):
  - `ÇÖZÜLDÜ: pilot migration prod'da (kolon/tetik/check/indeks 1/1/1/1, sabotajla kanıtlı).
    GEÇERSİZ OLUR EĞER: product_families şeması değişirse.`
  - STORM 18 ağırlığı BİLE BİLE buraya KONMADI — o kalem "çözüldü" DEĞİL, hâlâ açık (prod-GO
    bekliyor). İlk yazdığım şart ("OEM föyü repoya girerse geçersiz") daha baştan yanlıştı; bkz §5.

## 2. GEÇERSİZ ÖNCÜL — üçüncü sonuç (kritik)
Bir kalem sonradan ölçülünce **dayanağı bulunamıyorsa** (hatırdan yazılmış, korpusta yok), o kalem
"çözüldü" DEĞİL, **"geçersiz öncül"** olarak kapatılır ve farkı işaretlenir — ki aynı tuzağa
düşülmesin. Bu bir başarısızlık değil, dürüstlüktür. (Kaynak: 08-22 ağırlık-sapması kalemi.)

## 2.1 AÇIK kalemler de öncül taşır (ÜRÜN önerisi, 08-22)
Bu cetvel yalnız "çözüldü"yü değil **"açık"**ı da kapsar. Bir kalem `open` taşınıyor olsa bile,
**üzerine iş başlamadan önce** öncülünün ölçüm dayanağı sorulur:

- Kalem, öncülünü (kaç ürün, hangi değer, nerede) taşıyan bir **ölçüm referansı** (DB sorgusu /
  `dosya:satır` / katalog s.N) içeriyor mu?
- İçermiyorsa (hatırdan yazılmış) → **iş başlamadan ölç.** Aksi halde geçersiz bir öncül üzerine
  saatler harcanır — "düzeltme" diye var olmayan bir şey aranır.

Aynı gün iki canlı örnek, ikisi de açık kalemdi ve ölçülünce dayanaksız çıktı:
`23,7↔37,8 ağırlık sapması` (37,8 ne DB'de ne 74-CSV korpusunda var) · `Danfoss 17 ürün`
(doğrusu **34**: FC-101 17 + FC-102 17). Kural: **açık kalem = ölçülmüş öncül + kanıt; yoksa önce ölç.**

## 3. Registry bağı (uygulama)
Bir iş `completed` durumuna geçerken **ya bekçisini (A) ya geçersizlik-şartını (B)** kaydına yazmak
ZORUNLUDUR. İkisi de yoksa `completed` sayılmaz — `open` kalır ya da "kanıtsız-tamam" olarak işaretlenir.
Bu, "doküman commit'lendi ≠ iş bitti" (doc-committed-not-work-done) dersinin registry karşılığıdır.

## 4. Sonradan bakan ajanın kuralı (özet karar akışı)
```
Bir kalem "çözüldü" görünüyor mu?
 ├─ Bekçisi (INV/gate) var mı?  → EVET: yeşilse GÜVEN, elle ölçme. Kırmızıysa o kırmızı senin işin.
 ├─ Geçersizlik-şartı var mı?   → EVET: şart oluşmadıysa GÜVEN. Oluştuysa yeniden ölç.
 └─ İkisi de yok (düz "bitti")  → GÜVENME. Ölç ve çözüldüyse bu cetvele göre yeniden kaydet.
```

## 5. Bilinen sınırlar
- Bekçi kurmak maliyetlidir; her kalem hak etmez. Küçük/nadir kalemler için (B) yeterli.
- Geçersizlik-şartı **iyi yazılmalı** — çok darsa yanlış-güven, çok genişse hiç güvenilmez. Şart,
  ölçülebilir bir olguya bağlanır ("X tablosuna satır eklenirse", "kademe-2 tekrar koşarsa").
- **Kapanış şartının kendisi de yanlış yazılabilir** (ÜRÜN, 08-22). STORM 18 örneği: şart "OEM föyü
  repoya girerse geçersiz" yazıldı; oysa föy zaten repodaydı (`seat-content-manifest.json:140`, doğru
  değer 70.4/77 kg) → şart **daha baştan karşılanmıştı**, kalem "çözüldü" değil hâlâ AÇIK. Kural:
  kapanış şartını yazarken önkoşulun **şu an** karşılanıp karşılanmadığını da ölç.
- Bu cetvel "çözüldü mü" sorusunu yönetir; "doğru mu" sorusunu değil — doğruluğu (A)'daki kapı ya da
  (B)'deki kanıt taşır.

İlgili: [[completion-proven-not-assumed]] · [[comment-encoding-a-measurement-goes-stale]] ·
[[standard-plus-enforcing-test-is-control]] · [[work-tracking-ssot-model]] ·
`measurement-discipline-standard.md` · `execution-method-standard.md`
