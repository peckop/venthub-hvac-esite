# Rehber yazısı mevzuat bağı: şema önerisi ve yayındaki yazıların eşlemesi (BLG-57, OPS-253)

Durum: **ÖNERİ.** Karar sahipleri: yazı şeması BLOG + Design (makale JSON'u), kayıt alanı MEVZUAT, kapı ARAÇ. Eski siteye kod yok (karar 412); bu belge yeni site şemasına girecek alanı tarif eder.
Cetvel: `rehber-yazisi-standard.md` R2.6 ve R5.1 3g (mevzuat cümlesini MEVZUAT kontrol eder), `mevzuat-kaydi-standard.md` M2 (kalem kimliği) ve M6.1 madde 4 (kayıt değişince yazıya "güncelle" bildirimi).
Girdi: MVZ-9 tutarlılık ölçümü (8 Kasım 2026, `docs/mevzuat/kayit.json` v0.5, 47 kalem) ve BLG-53 Design makale JSON'u. Ölçüm tarihi: 8 Kasım 2026, `kayit.json` v0.5 **49 kalem** (MVZ-9'dan sonra 2025/2481 ve TR-YON-GURULTU-BINA-2018-DEG kalemleri eklenmiş; bu belgedeki bütün kimlikler `kayit.json`'a karşı betikle doğrulandı, 22 kimlik, eksik 0).

## 1. Sorun

Mevzuat cümleleri bugün yazıda düz metin ve `[n]` atfıdır. Kayıt kalemi değişince (durum, tarih, değiştiren, son kontrol) hangi yazıların etkilendiği tek yönlü veriden çıkmıyor; MVZ-9 bunu elle 100 satırlık eşlemeyle buldu ve yedi düzeltme önerdi (BLG-56). Yeni siteye yazılar taşınırken bağ alanı şemada olmazsa her yazı sonradan yeniden açılır (MVZ-9 madde 5, karar 412).

## 2. Şema önerisi

Design makale JSON'una (BLG-53) ve ona karşılık gelen yazı kaydına tek yeni alan:

```json
"mevzuat": [
  {
    "kayit": "TR-YON-ATEX-2014/34",
    "madde": "Md 43(1)",
    "bolum": "patlayici-ortamda-hangi-yonetmelikler",
    "kaynak": [7],
    "tur": "atif"
  }
]
```

Alanlar:

| Alan | Zorunlu | Anlam |
|---|---|---|
| `kayit` | evet | `docs/mevzuat/kayit.json` kalem `kimlik`i, **aynen** (ör. `AB-2024/1834`, `TR-SGM-2026/2`, `STD-IEC-61800-3`). Yeni kimlik türetilmez. |
| `madde` | hayır | Yazının atıf yaptığı madde/ek/tablo, metindeki yazımıyla (`Md 13`, `Ek-5 Tablo 5.1`). Kayıt madde düzeyi tutmuyorsa yazı tarafı tutar; kapı yalnız `kayit`ı doğrular. |
| `bolum` | evet | Cümlenin/kutunun bulunduğu bölüm kimliği (Design JSON'daki `bolumlar[].id`). Cümle metni anahtar yapılmaz: cümle değişince bağ kaymaz. |
| `kaynak` | evet | O bağın dayandığı yazı kaynak numaraları (yazıdaki `[n]`). Kapı, numaranın kaynak listesinde olduğunu doğrular. |
| `tur` | evet | `atif` (yazı kalemi anıyor), `tarih` (geçiş/yürürlük tarihi veriyor), `tanim` (madde tanımını aktarıyor), `yok` (kalem kapsamda ama yazı anmıyor: bilinçli boşluk, açıklaması `not`ta). |
| `not` | hayır | İnsan okuması için tek cümle; kapı okumaz. |

**Cümle kimliği yerine bölüm kimliği + madde.** Kartta "her mevzuat cümlesi/kutusu bir kayıt kimliği taşır" deniyordu. Cümle düzeyi kimlik her küçük düzeltmede (R5.1.2 daraltmaları) kayar ve yazıyı tekrar açar; bölüm kimliği Design JSON'unda zaten kararlıdır. Cümle düzeyinde ayrıntı gerekirse Mevzuat gözden geçirmesi bölümün mevzuat cümlelerini okur (R5.1 3g zaten bunu yapıyor). Karar bu noktada Mevzuat ve Araç görüşüne bırakıldı (bölüm 6, soru 1).

**Kimlik biçimi.** Kartın örneği `TR-RG-29758` kayıtta bir kimlik DEĞİLDİR (Resmî Gazete sayısı kalemin `tarihler`indedir); kayıt kimliği `TR-YON-ATEX-2014/34`. Şema `kayit` alanında yalnız `kayit.json` kimliklerini kabul eder.

## 3. Kapı önerisi (sahibi ARAÇ; BLOG yalnız metin tarafını koşar)

| Kapı | Ne ölçer | Renk | Sahip |
|---|---|---|---|
| M-A | `mevzuat[].kayit` her biri `kayit.json`'da var mı; `kaynak` numaraları yazının kaynak listesinde var mı | KIRMIZI | ARAÇ (CI) |
| M-B | Gövdede mevzuat deseni taşıyan cümle (`rehber-denetim.mjs` MEVZUAT deseni: yönetmelik, tebliğ, kanun, zorunlu…) olup yazıda hiç `mevzuat` bağı yoksa | KIRMIZI | BLOG (`rehber-denetim.mjs`) |
| M-C | Kalem `durum`, `tarihler`, `degistirenler` ya da `son_kontrol` alanında değişirse, o kalemi anan her yazıyı "mevzuat gözden geçirmesi gerekli" diye işaretler; işaret kalkmadan yazı yeniden yayımlanmaz | UYARI → pano | ARAÇ + MEVZUAT |
| M-D | `kayit.json` kalemine `atif_yapan_yazilar` alanı yazı bağından **üretilir** (elle yazılmaz) | üretim | ARAÇ |

M-B, bağ olmayan yazıyı yakalar ama bağın doğru olduğunu söylemez: doğruluğu MEVZUAT gözden geçirmesi (R5.1 3g) ve BLG-56 gibi periyodik MVZ-9 ölçümü yargılar.

## 4. Yayındaki 13 yazının mevzuat eşlemesi

Kaynak: MVZ-9 satır tablosu (11 yazı) + BLG-54/55 (yeni). `tur` önerisi ve MVZ-9 hükmü sütunda. Hepsinde `kayit` kimlikleri `kayit.json` v0.5'te var.

| Yazı kimliği | Önerilen `mevzuat` bağları (`kayit` · madde · tür) | MVZ-9 hükmü / not |
|---|---|---|
| frekans-konvertoru | AB-2019/1781 · 0,12-1000 kW, IE2 · tarih; AB-2021/341 · değiştiren · atıf; TR-SGM-2021/16 · tarih; TR-SGM-2021/23 · tarih; STD-IEC-61800-3 · C1-C4 tanımı, 2022 sürümü · tanim | uyuşuyor; EMC kategorisi cümlesi kayıtta doğrulanmıyor (Danfoss kılavuzuna atıf) |
| radyal-aksiyel-fan-secimi | AB-327/2011 · tarih; AB-2024/1834 · kapsam dışı koşulu · atıf; AB-2025/2481 · Md 1(4) · atıf; TR-SGM-2026/2 · tarih; TR-SVGM-2019/15 · tarih; STD-EN-12101-3 · duman fanı belgesi · atıf | AB-2025/2481 kalemi MVZ-9'dan sonra açıldı (bağlanabilir); 2024/1834 kapsam dışı koşulu madde numarasıyla kayda eklenecek |
| sessiz-fan-secimi | TR-YON-GURULTU-BINA-2017 · Md 13, Ek-5 Tablo 5.1, Ek-8 · atıf; TR-YON-GURULTU-BINA-2018-DEG · Md 5 · atıf; AB-1253/2014 · ses gücü beyanı · atıf; TR-SGM-2021/18 · atıf; AB-327/2011 · atıf; AB-2024/1834 · düşük gürültülü fan · tanim; TR-SGM-2026/2 · tarih; TR-SVGM-2019/15 · tarih | 2018 değişiklik kalemi artık kayıtta; Tablo 5.1 değerleri kayıtta yok |
| kanal-tipi-fan-nedir | yok | mevzuat cümlesi yok (kapsam boşluğu değil) |
| isi-geri-kazanim-cihazi-nedir | AB-1253/2014, AB-1254/2014, TR-SGM-2021/18, TR-SGM-2021/19 · tür `yok` | Kayıt bu ailelerin kapsamda olduğunu yazıyor, yazı anmıyor: **kapsam boşluğu**, karar BLOG'da (soru 3) |
| hava-perdesi | AB-2024/1834 · Md 2(17)-(20), (25), Md 9(1), Ek III nokta 4 · tanim (yalnız yorum satırı); AB-327/2011 · atıf | Gövdede cümle yok, yazı 2037 tarihini bilerek daraltmış; kayıt 2037'yi doğruluyor (BLG-56) |
| fan-cesitleri | AB-2024/1834 · Md 2 tür tanımları · tanim; AB-327/2011 · atıf; AB-2025/2481 · Md 9(1) · atıf | Tanım maddeleri kayıtta yok (Mevzuat Md 2'yi kayda alacak) |
| plug-fan-nedir | yok | mevzuat cümlesi yok |
| asit-fani-nedir-korozyona-dayanikli-fan-secimi | AB-2014/34 · Kategori 3 · atıf; AB-94/9 · yerini aldığı · atıf; TR-YON-ATEX-2014/34 · Md 43(1) · tarih; AB-1999/92 · Bölge 2 · atıf; TR-YON-ATEX-1999/92 · Ek-3 · atıf | uyuşuyor |
| cati-tipi-fan-nedir-nasil-secilir | yok | mevzuat cümlesi yok |
| patlayici-ortamda-fan-secimi-atex-bolge-kategori | AB-2014/34 · md 1, 2, 43; Ek I; Ek II 1.0.5, 2.3.1.1 · atıf; AB-94/9 · atıf; AB-1999/92 · atıf; TR-YON-ATEX-2014/34 · Md 4(1)(s)(ğ), Md 41, Md 43(1) · atıf; TR-YON-ATEX-1999/92 · Ek-1, Ek-3 · tanim | atıflar uyuşuyor; bakanlık adı ve "sonraki değişiklikler okunmamıştır" cümlesi bayat (BLG-56); `99/92/AT` ve `1999/92/AT` yazımı tek biçime |
| hucreli-aspirator-nedir-secerken-nelere-bakilir (BLG-54) | yok | mevzuat cümlesi yok (MEVZUAT hükmü gerekmedi) |
| banyo-ve-tuvalet-fani-nasil-secilir (BLG-55) | Planlı Alanlar İmar Yönetmeliği (RG 30113) · md 2, 32/9, 39/6 · atıf; Binalarda Enerji Performansı Yönetmeliği (RG 27075) · md 17/1, 17/10 · atıf | **İki yönetmelik için `kayit.json`'da kalem yok**; bu satırlar `kayit` doldurulamaz. MEVZUAT iki kalemi açmadan M-A geçemez (soru 2) |

Mevzuat cümlesi taşıyan dokuz yazının bağları bugün `kayit.json`'la doldurulabilir; tek istisna BLG-55'in iki yönetmeliğidir (kalem açılması gerekir). İlk toplu doldurmayı Design makale JSON'u dosyalarına (BLG-53, `blog-calisma\design-makale\`) betikle yapmak mümkündür; yazı gövdesi değişmediği için yeni tur gerekmez (yalnız yeni alan eklenir, iddia eklenmez).

## 5. Sıralama önerisi

1. MEVZUAT: şema alanını ve cümle/bölüm düzeyi kararını (soru 1) görüşür; imar ve BEP için iki kalem açar.
2. BLOG: Design JSON'larına `mevzuat` alanını doldurur (13 dosya; mevzuatsız yazılara `[]`), `rehber-denetim.mjs`'e M-B kapısını yazar.
3. ARAÇ: M-A, M-C, M-D kapılarını yazar (CI'da `kayit.json` ↔ Design JSON okuması).
4. HARİTA: yazı ↔ ürün ailesi bağı (`urunler`) ile aynı yapıyı kullanıyorsa `mevzuat` alanını yanına koyar (ortak yükleyici).

## 6. Açık sorular

1. **MEVZUAT:** bağ bölüm düzeyinde mi (öneri), cümle düzeyinde mi? Cümle düzeyi her daraltmada kayar; bölüm düzeyi R5.1 3g okumasını bölüm başına yapar.
2. **MEVZUAT:** Planlı Alanlar İmar Yönetmeliği ve Binalarda Enerji Performansı Yönetmeliği için kalem açılacak mı, kimlikleri ne olacak (öneri `TR-YON-IMAR-PLANLI-ALANLAR`, `TR-YON-BEP`; M2 biçimi MEVZUAT'ın)?
3. **BLOG kararı (ısı geri kazanım):** 1253/2014 ve 1254/2014 yazıda yok; yazıya mevzuat cümlesi eklemek yeni iddiadır (paket + tur gerekir). Öneri: ayrı kartla, ısı geri kazanım yazısının bir sonraki R5.5 revizyonunda.
4. **ARAÇ:** M-C pano işareti hangi yüzeyde görünür (kokpit, Kanban kartı, ya da Design yönetim ekranı)? Bildirim kanalı M6.1 madde 4 ile aynı olabilir.
5. **DESIGN:** `mevzuat` alanı makale JSON'una ve sayfa şablonuna girerse okuyucuya görünür mü (örn. "Bu yazıdaki mevzuat cümleleri şu kayıtlara dayanır")? Öneri: görünmez, yalnız yönetim verisi.

## 7. Sınırlar

- Eşleme MVZ-9 satır tablosuna ve `kayit.json` v0.5'e dayanır; madde numaraları yazıdaki yazımıyla alındı, yönetmelik ham metniyle bu kartta yeniden karşılaştırılmadı (MVZ-9 yalnız RG 31168 için ham okuma yaptı).
- Dört yazı (kanal tipi fan, plug fan, çatı tipi fan, hücreli aspiratör) mevzuat cümlesi taşımıyor; "yok" doğru sonuçtur, boşluk değil. Isı geri kazanım yazısı ise kayıtta kapsamda olduğu halde mevzuat anmıyor (soru 3): bu bir kapsam boşluğudur.
- Bu belge karar değildir; şema alanı Mevzuat ve Araç görüşüyle kesinleşir. Yayın, kapı ya da kod yoktur.
