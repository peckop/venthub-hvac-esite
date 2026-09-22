# Üretici ↔ bizim veri fark tablosu — ilk koşum (2026-09-22)

> Karar **71c** (Recep, OPS aktarımı): kaynak önceliği üretici; bizim verimiz üreticiyle yan yana
> konur, AVenS'e gönderilebilir bir fark tablosu çıkar. İş kaydı REC-370 (REC-172 eki).
> **Canlıya hiçbir şey yazılmadı.** Tablo karar girdisidir.

## KAYNAK/CETVEL

- `docs/standards/catalog-ingestion-standard.md` §6.3 — kaynak dizini tek kaynaktır, PDF açılmaz.
  Tazelik 2026-09-22: YEŞİL (70 PDF + 17 web, 2211 sayfa). Bugün dizine giren 26 dosya (karar 71):
  Casals teknik katalog 15 sayfa (NIMUS/NIMAX), Casals plug-fan kataloğu, Vorticent CMS ATEX 10 föy.
- `docs/standards/product-schema-standard.md` — alan adı birimi taahhüt eder: `max_absorbed_power_w`
  çekilen güçtür, motor (plaka) gücü değildir.
- Fark tablosunun kendi cetveli yoktu; hüküm kuralı bu belgede ve aracın başlığında yazılıdır.

## YÖNTEM

Elle, tek araç: `scripts/icerik-hatti/uretici-fark-tablosu.mjs`. Test:
`scripts/icerik-hatti/__tests__/uretici-fark-tablosu.test.ts` (3/3).

1. **Üretici değeri elle yazılmaz.** Her kaynak türü için bir okuyucu, dizindeki sayfadan satırı
   okur ve satırın kendisini alıntı olarak taşır. Tablo yazılmadan önce her alıntı dizindeki
   sayfada yeniden aranır; bulunamayan satır varsa tablo hiç yazılmaz.
2. **Bizim değer** üç yerden gelir ve her satırda hangisi olduğu yazılır: canlı ürün adı, canlı
   teknik veri (`technical_specs`), AVenS fiyat listesi 2026 (bize verilen veri, dizinde).
3. **Bizde karşılaştırılacak değer yoksa satır uydurulmaz**; bu durum özette ayrı sayılır.
4. İki koşum bayt-eşit çıktı verir.

Koşum:
```
node scripts/icerik-hatti/urun-veri-cek.mjs <urunler.json>
node scripts/icerik-hatti/uretici-fark-tablosu.mjs --veri <urunler.json> --cikti <fark.csv>
```

## Hüküm kuralı

| Hüküm | Ne zaman |
|---|---|
| aynı | fark yok (%0,5 tolerans; kodlarda boşluk farkı yok sayılır) |
| üretici | aynı büyüklük, kaynak üretici, değer farklı → üreticinin değeri alınır |
| belirsiz | büyüklükler farklı ya da kaynak üretici değil (distribütör) ya da kod farkı |

## Sonuç

69 ürün, 138 satır: **aynı 114 · üretici 2 · belirsiz 22.** Tam tablo:
`icerik-hatti-uretici-fark-tablosu-2026-09-22.csv`.

| Aile | Ürün | Alan | Aynı | Üretici | Belirsiz |
|---|---|---|---|---|---|
| NIMAX | 15 | motor gücü | 15 | 0 | 0 |
| NIMAX | 15 | en yüksek debi | 14 | 1 | 0 |
| NIMAX | 15 | üretici kodu | 1 | 0 | 14 |
| NIMUS | 15 | motor gücü | 15 | 0 | 0 |
| NIMUS | 15 | en yüksek debi | 15 | 0 | 0 |
| NIMUS | 15 | üretici kodu | 14 | 0 | 1 |
| Enkelfan EEC | 9 | en yüksek debi | 9 | 0 | 0 |
| Enkelfan EEC | 9 | üretici kodu | 9 | 0 | 0 |
| Vorticent CMS ATEX | 10 | motor gücü | 9 | 1 | 0 |
| STORM | 20 | güç (bizde çekilen, kaynakta motor) | 13 | 0 | 7 |

### Üreticinin değeri alınması gereken 2 satır

| Ürün | Alan | Bizim | Üretici | Kaynak |
|---|---|---|---|---|
| AVE-NX313290 NIMAX 314 T2 1,5kW | en yüksek debi | 5240 m³/h (AVenS listesi s.48) | 5500 m³/h | Casals teknik katalog, flipbook s.200 |
| VRT-253490106XN VORTICENT CMS ATEX 35/14 T4 4kW | motor gücü | 4 kW (ürün adı) | 3 kW | Vorticent föyü 35/14 T4 3kW, s.2 |

İkincisi müşteriye görünen ürün adındadır; düzeltme ad ve adres değişikliği demektir (Recep kararı).

### Belirsiz 22 satır

- **NIMAX/NIMUS kodları (15):** AVenS listesindeki kod ile Casals kodu farklı; model adı, güç ve
  debi tutuyor. Örnek: NIMAX 314 T2 — AVenS `NX313290`, Casals `NX314290`; NIMAX 1004 T4 —
  `NX10034250` / `NX10044250`. Desen sistematik (üçüncü-dördüncü hane). Sürüm farkı mı, AVenS'in
  kendi kodlaması mı — **AVenS'e sorulur.**
- **STORM gücü (7):** bizde `max_absorbed_power_w` (çekilen güç), AVenS listesinde motor gücü.
  Üretici (SEAT) web sayfasında güç yok (ölçüldü). STORM 10 (4 ürün): bizim 0,09/0,12 kW, liste
  0,06/0,09 kW; STORM 12 1400 d/dk (3 ürün): bizim 0,18 kW, liste 0,25 kW. İki büyüklük farklı
  olduğu için ikisi de doğru olabilir — **SEAT föyü ya da AVenS'e soru.**

### Kaynakta bulunmayan 1 ürün

- VRT-253100106XN VORTICENT CMS ATEX 14/5 T2 0,25kW — AVenS sayfasında bu ürünün föyü yok.
  **AVenS'ten istenir.**

## Kapsamın sınırı (dürüst)

- Bugün yalnız yeni kaynağı gelen 4 aile + STORM okunuyor. Kalan 372 ürünün ailesi için okuyucu
  yok; kaynakları dizinde olsa bile tabloya girmediler. Bitti ölçütü: bu sayı raporlu ve tek yönlü
  azalıyor.
- NIMAX/NIMUS/Enkelfan/CMS ATEX'in canlıda teknik verisi yok (49 ürün); karşılaştırma ürün adı ve
  AVenS listesiyle yapıldı. Bu ailelerin teknik verisinin yüklenmesi ayrı iştir (REC-172).
- AVenS'teki dikdörtgen kanal radyal (7) ve sulu batarya (6) aileleri için web'de föy yok —
  AVenS'ten istenecek (karar 71).
