# BLG-5 — Sözlük madde kalıbı ve ilk dalga terim seçimi (2026-10-09, BLOG) — TASLAK

> **DURUM: TASLAK — onaysız, uygulanmaz.** Yalnız belge: kod, sayfa, adres, şema, çeviri anahtarı yok. Sözlük için bugüne dek cetvel yoktu (`rehber-yazisi-standard.md` satır 142 sözlüğü SONRAYA bırakıyor; bilgi mimarisi kararı TASARIM'dan sonra gelir); bu belge o cetvelin taslağıdır.
> **KAYNAK / CETVEL:** `rehber-yazisi-standard.md` (R1.1 kaynaklar, R1.3 konu başına tek yazı, R2 kaynak, R2.3 ham kaynak, R3 iç bağlantı kimlikle, R4 yasaklar, R4.8 taslak metin depoya girmez), `vitrin-genel-metin-standard.md` (M8 marka olgusu), `category-taxonomy-standard.md` (kategori ve aile adları), `catalog-ingestion-standard.md` §6.3 (kaynak dizini).
> **Kapsam sınırı (OPS onaylı düzen, 2026-10-09):** depoya yalnız kalıp, terim ADLARI ve özet sayılar girer. Tanım cümleleri, kaynaklardan birebir alıntılar ve arama önerisi sorguları **depo dışında** durur (R4.8 delinmez; depo public).
> **Kart:** BLG-5 (Kanban, VentHub BLOG panosu). **Sahibi:** BLOG. **Son doğrulama:** 2026-10-09 (ölçümler aşağıda; her ölçüm betikle tekrarlanabilir).

## 1. Amaç ve bitiş ölçüsü

Sözlüğün amacı arama ve yanıt motoru görünürlüğüdür: "X nedir" türü bilgi sorgularında sitenin kaynaklı, kısa ve alıntılanabilir bir cevabı olması. Terim listesi tek başına bitiş değildir. Bitiş ölçüsünü GEO-SEO koyar: yayından 4 hafta sonra sözlük sayfalarının Search Console gösterim ve tıklama sayıları ile terim sorgularındaki sıra raporlanır; yayın öncesi taban o gün ölçülür.

## 2. Madde kalıbı

Her madde aynı alanları taşır; hiçbiri boş bırakılmaz (bilinmeyen alanın yazılması için kaynak gerekir, kaynak yoksa madde yayınlanmaz).

| Alan | Kural |
|---|---|
| Terim | Sitede ve kaynaklarda geçen Türkçe yazım. Yazım varyantları ve eş anlamlılar ayrı alandadır. |
| Yazım ve eş anlamlılar | Varyantlar maddede yan yana verilir; ilk geçişte "invertör (İngilizcesi inverter)" biçimi, rehber yazılarında uygulanan kuralla aynıdır. |
| Kısa tanım | 1-2 cümle, terimin kendisiyle başlar ("Terim, ... cihazdır"); kaynaklıdır; yanıt motorunun tek başına alıntılayabileceği uzunlukta ve kendi cümlemizdir (kaynaktan kopya değil). |
| Açıklama | En çok 3 kısa paragraf. Bu sitedeki ürünle ilişki yalnız olgu olarak yazılır ("sitede X kategorisinde listelenir"); üstünlük, vaat, fiyat, rakip adı yoktur. |
| Karıştırılan terimler | Varsa "X ile Y farkı" tek cümle; ikisi de sözlükte maddedir. |
| Kaynaklar | Sıra: TDK → TS EN/IEC → üretici belgesi → sektör kullanımı. Her iddia numaralı kaynağa bağlıdır; birebir alıntı kaynak dizinindeki (belge, sayfa) noktasıyla kayıtlıdır. Yapay zekâ özeti kanıt değildir (R2.3). |
| İlgili sayfalar | İlgili kategori, ürün ailesi ve rehber yazısı. Bağlantı kimlikle yazılır (`vh:<tür>/<anahtar>`, R3). Karşı yön: kategori ve ürün sayfaları da terime bağlanır. |
| İngilizce karşılık | EN sayfada İngilizce terim ve kaynaklı karşılık; çeviri değil, kaynakta geçen karşılık. |
| Yapısal veri | schema.org DefinedTerm, bir DefinedTermSet içinde. GEO-SEO uygunluğu doğrular. |

## 3. Yasaklar (rehber R4'ten sözlüğe uyarlanmış)

- Üstünlük, vaat, fiyat ve rakip adı yazılmaz.
- Marka ve üretici olgusu (kuruluş yılı, ülke, merkez) yalnız `docs/standards/marka-olgu-kaydi.json` içindeki YAZILABİLİR olgudan alınır (M8).
- Kaynakta birebir yoksa yazılmaz. Olumsuz iddia ("... değildir") açık alıntı ister (R4.5).
- Sitenin terim düzeni bozulmaz: ana kategori, alt kategori, ürün ailesi, model.
- Tanım cümlesi kaynaktan kopya olmaz; alıntı kısa ve etiketlidir ve depo dışı kayıtta durur.

## 4. Terim seçimi

### 4.1 Aday havuzu (tekrarlanabilir)

Havuz, sitenin kendi sözlüğünden kurulur: canlı site haritasındaki 82 sayfanın başlığı (28 kategori, 47 ürün ailesi, 6 marka, 1 rehber yazısı), `tr.ts` içindeki 80 teknik özellik etiketi ve rehber yazısı gövdesi. Bu havuzdan 46 aday kavram çıkarıldı; her adayın sitede geçtiği betikle kanıtlandı (46/46). Sitede geçmeyen terim ilk dalgaya girmez.

### 4.2 Dış talep ve sınırı

Dış talep için Google arama önerisi kullanıldı (R1.1; ücretsiz, hacim vermez). Her aday için 5 bilgi niyetli sonek denendi ("nedir", "ne demek", "ne işe yarar", "nasıl çalışır", "farkı"). Ölçüm iki kez koşuldu; 46 terimde fark 0.

**Ham sayı yanıltıcıdır.** Çok anlamlı başlıklarda öneriler başka alanlara gider (yedi başlık: vmc (kontrollü mekanik havalandırma), atex, debi, erp (ekotasarım), bypass, pervane, devir hızı (rpm)). Bağlam sözcüğü eklenerek (fan, havalandırma, klima) yapılan ikinci ölçüm 25 terimin 20'unda sıfır döndü: bu yöntem teknik kavramın HVAC talebini AYIRT EDEMİYOR. Bu terimler için kanıt Search Console (ve varsa Ads hacmi) ile aranır; ölçümü GEO-SEO yapar.

### 4.3 Dalga kuralı (hesaplanır; GEO-SEO teyit eder)

| Dalga | Kural | Terim sayısı |
|---|---|---|
| D1 | OPS emriyle zorunlu (frekans konvertörü, invertör, evirici) YA DA sitede geçer VE bilgi niyetli öneri ≥ 4 ve çok anlamlı değil | 14 |
| D2-ANLAM | Ham öneri sayısı HVAC talebi göstermiyor; kanıt GEO-SEO Search Console ölçümünden gelir | 7 |
| D2-ZAYIF | Bilgi niyetli öneri < 4; kanıt bulunana dek ilk dalgaya girmez | 25 |

Çok anlamlı baş kuralı: örnek önerilerin en az ikisi HVAC dışı alan sözcüğü taşır (tıp, tarih, finans, yazılım gibi; liste `terim-adaylari.json` içinde, depo dışı).

### 4.4 İlk 10 terim (önerilen)

1. frekans konvertörü
2. invertör
3. evirici
4. hava perdesi
5. jet fan
6. nem alma cihazı
7. statik basınç
8. radyal (santrifüj) fan
9. aksiyel fan
10. ısı geri kazanım

Önceki geçici listeden iki terim düştü: plug fan (talep 2, eşik altı) ve değişken hızlı sürücü/VFD (sitede geçmiyor; frekans konvertörü maddesinde eş anlamlı olarak, kaynağı varsa yer alır). Yerlerine statik basınç ve nem alma cihazı girdi. Dalga 1'in kalan dört terimi: ip koruma sınıfı, anma gücü, ses basıncı, hava hızı.

### 4.5 Aday tablosu (özet sayılarla)

Sütunlar: sitede = o terimi taşıyan farklı sayfa/etiket sayısı; talep = bilgi niyetli arama önerisi sayısı (hacim değil); üretici belgesi = belge sayısı (Türkçe sayfa/İngilizce sayfa).

| No | Terim | Grup | Sitede | Talep | Talep sınıfı | TDK | Üretici belgesi | Dalga |
|---|---|---|---|---|---|---|---|---|
| 1 | frekans konvertörü (zorunlu) | cihaz | 3 | 8 | KANITLI | yok | 27 (3/233) | D1 (karar 325) |
| 2 | invertör (zorunlu) | cihaz | 1 | 22 | KANITLI | yok | 34 (0/115) | D1 (karar 325) |
| 3 | evirici (zorunlu) | cihaz | 1 | 6 | KANITLI | yok | 0 (0/0) | D1 (karar 325) |
| 4 | radyal (santrifüj) fan | cihaz | 10 | 6 | KANITLI | yok | 33 (18/438) | D1 |
| 5 | aksiyel fan | cihaz | 2 | 4 | KANITLI | yok | 5 (6/38) | D1 |
| 6 | plug fan | cihaz | 3 | 2 | ZAYIF | yok | 4 (32/32) | D2-ZAYIF |
| 7 | kanal tipi fan | cihaz | 6 | 2 | ZAYIF | yok | 6 (8/45) | D2-ZAYIF |
| 8 | jet fan | cihaz | 3 | 8 | KANITLI | yok | 4 (22/22) | D1 |
| 9 | çatı fanı | cihaz | 3 | 1 | ZAYIF | yok | 9 (4/19) | D2-ZAYIF |
| 10 | hücreli aspiratör | cihaz | 3 | 2 | ZAYIF | yok | 2 (1/10) | D2-ZAYIF |
| 11 | duman egzoz fanı | cihaz | 2 | 0 | ZAYIF | yok | 18 (3/68) | D2-ZAYIF |
| 12 | hava perdesi | cihaz | 6 | 16 | KANITLI | yok | 2 (3/6) | D1 |
| 13 | ısı geri kazanım | cihaz | 4 | 4 | KANITLI | yok | 12 (8/300) | D1 |
| 14 | vmc (kontrollü mekanik havalandırma) | cihaz | 1 | 8 | BELIRSIZ-ANLAM | yok | 6 (26/33) | D2-ANLAM |
| 15 | sığınak havalandırma | cihaz | 2 | 0 | ZAYIF | yok | 1 (2/0) | D2-ZAYIF |
| 16 | nem alma cihazı | cihaz | 3 | 7 | KANITLI | yok | 4 (1/17) | D1 |
| 17 | hvls (endüstriyel tavan vantilatörü) | cihaz | 2 | 1 | ZAYIF | yok | 2 (22/26) | D2-ZAYIF |
| 18 | şömine ve baca fanı | cihaz | 2 | 0 | ZAYIF | yok | 2 (1/2) | D2-ZAYIF |
| 19 | elektrikli kanal ısıtıcısı | cihaz | 2 | 0 | ZAYIF | yok | 4 (0/14) | D2-ZAYIF |
| 20 | sulu batarya | cihaz | 2 | 1 | ZAYIF | yok | 2 (1/7) | D2-ZAYIF |
| 21 | hız anahtarı (fan hız kontrolü) | cihaz | 2 | 1 | ZAYIF | yok | 23 (18/87) | D2-ZAYIF |
| 22 | korozyona dayanımlı fan | cihaz | 2 | 0 | ZAYIF | yok | 22 (9/73) | D2-ZAYIF |
| 23 | tekil oda ünitesi | cihaz | 1 | 0 | ZAYIF | yok | 1 (0/1) | D2-ZAYIF |
| 24 | atex | kavram | 5 | 22 | BELIRSIZ-ANLAM | yok | 38 (121/121) | D2-ANLAM |
| 25 | ptc sensörü | kavram | 1 | 2 | ZAYIF | yok | 17 (22/44) | D2-ZAYIF |
| 26 | ec motor | kavram | 1 | 3 | ZAYIF | yok | 20 (68/74) | D2-ZAYIF |
| 27 | statik basınç | kavram | 3 | 7 | KANITLI | yok | 21 (3/50) | D1 |
| 28 | toplam basınç | kavram | 1 | 3 | ZAYIF | yok | 21 (0/43) | D2-ZAYIF |
| 29 | debi | kavram | 6 | 26 | BELIRSIZ-ANLAM | VAR | 47 (50/402) | D2-ANLAM |
| 30 | basınç-debi eğrisi (fan eğrisi) | kavram | 1 | 0 | ZAYIF | yok | 26 (0/260) | D2-ZAYIF |
| 31 | ip koruma sınıfı | kavram | 2 | 4 | KANITLI | yok | 44 (4/167) | D1 |
| 32 | erp (ekotasarım) | kavram | 1 | 30 | BELIRSIZ-ANLAM | yok | 22 (64/76) | D2-ANLAM |
| 33 | motor verim sınıfı | kavram | 1 | 0 | ZAYIF | yok | 9 (0/25) | D2-ZAYIF |
| 34 | yalıtım sınıfı | kavram | 1 | 1 | ZAYIF | yok | 12 (1/86) | D2-ZAYIF |
| 35 | motor kutup sayısı | kavram | 1 | 3 | ZAYIF | yok | 11 (0/98) | D2-ZAYIF |
| 36 | anma gücü | kavram | 1 | 7 | KANITLI | yok | 13 (0/21) | D1 |
| 37 | ısıl verim | kavram | 2 | 1 | ZAYIF | yok | 7 (1/75) | D2-ZAYIF |
| 38 | bypass | kavram | 1 | 32 | BELIRSIZ-ANLAM | yok | 9 (55/55) | D2-ANLAM |
| 39 | higrostat | kavram | 1 | 3 | ZAYIF | VAR | 5 (0/19) | D2-ZAYIF |
| 40 | voc sensörü | kavram | 1 | 1 | ZAYIF | yok | 4 (5/2) | D2-ZAYIF |
| 41 | pm2.5 | kavram | 1 | 2 | ZAYIF | yok | 3 (3/3) | D2-ZAYIF |
| 42 | co2 sensörü | kavram | 1 | 3 | ZAYIF | yok | 7 (17/16) | D2-ZAYIF |
| 43 | pervane | kavram | 1 | 38 | BELIRSIZ-ANLAM | VAR | 44 (4/304) | D2-ANLAM |
| 44 | ses basıncı | kavram | 2 | 4 | KANITLI | yok | 37 (6/267) | D1 |
| 45 | devir hızı (rpm) | kavram | 2 | 45 | BELIRSIZ-ANLAM | yok | 55 (3/221) | D2-ANLAM |
| 46 | hava hızı | kavram | 2 | 5 | KANITLI | yok | 8 (0/19) | D1 |

## 5. Kaynak sırasının bugünkü kapsamı

### 5.1 TDK (Güncel Türkçe Sözlük)

46 adaydan yalnız 3 terimin tam adı TDK'de madde olarak var: debi, higrostat, pervane. Frekans konvertörü, invertör ve evirici TDK'de yok (OPS'un 2026-10-08 ölçümüyle aynı). Yani bu terimlerde birinci basamak boş; dayanak sonraki basamaklardan gelir.

### 5.2 TS EN / IEC

Sonuç (2026-10-09): 14 terimin 14'ü ERİŞİLEMEDİ, 0 BULUNDU, 0 BULUNAMADI. Birincil kaynak Electropedia (IEV) bot doğrulaması (AWS WAF challenge) arkasında; doğrulama aşılmadı ve aşılmaya çalışılmadı. Bu yüzden hiçbir terim için 'IEV'de yok' denemez. Arama özetlerinden gelen aday IEV numaraları Electropedia'dan doğrulanmadığı için bu belgeye YAZILMADI. Ücretli standart metni (TS EN 60529 gibi) ayrıca erişilemez. TS EN/IEC basamağı insan erişimi ya da izinli kurumsal erişim olmadan doldurulamıyor.

Kapsanan terimler (14): frekans konvertörü (ERİŞİLEMEDİ); invertör (ERİŞİLEMEDİ); evirici (ERİŞİLEMEDİ); radyal (santrifüj) fan (ERİŞİLEMEDİ); aksiyel fan (ERİŞİLEMEDİ); jet fan (ERİŞİLEMEDİ); hava perdesi (ERİŞİLEMEDİ); ısı geri kazanım (ERİŞİLEMEDİ); nem alma cihazı (ERİŞİLEMEDİ); statik basınç (ERİŞİLEMEDİ); IP koruma sınıfı (ERİŞİLEMEDİ); anma gücü (ERİŞİLEMEDİ); ses basıncı (ERİŞİLEMEDİ); hava hızı (ERİŞİLEMEDİ).

### 5.3 Üretici belgesi

Kaynak dizininde 86 belge, 2211 sayfa var. Terim başına belge sayısı tabloda. Belge dili ayrıca sınıflandırılmadı; ölçülen, Türkçe kalıplarla eşleşen sayfa sayısının çoğu terimde İngilizce kalıplarla eşleşenden çok düşük olmasıdır (tablodaki TR/EN sütunu, ör. statik basınç 3/50, ses basıncı 6/267). Bu nedenle Türkçe tanımın tek dayanağı üretici belgesi olamaz; Türkçe karşılığın kaynağı TS EN/IEC ya da TDK olmalıdır, üretici belgesi teknik içeriği doğrular.

## 6. Açık sorular ve çakışmalar

1. **Rehber yazısıyla aynı sorguda yarışma (R1.3).** "Frekans konvertörü nedir" rehber yazısı ile sözlük maddesi aynı sorguyu hedefler. Öneri: madde kısa tanımı verir ve yazıya bağlanır, yazı ayrıntıyı taşır; GEO-SEO iki sayfanın sıralamasını izler. Karar GEO-SEO ölçümüne bağlı.
2. **Sayfa adresi yapısal karardır.** Recep'e tek başına sorulur. Öneri adres çifti BLG-5 kartında yazılı; bu belge adres belirlemez.
3. **Sayfa düzeni TASARIM'ın, kod URUN'ündür** ve 11 Ekim adres yayınından sonra yazılır.
4. **D2-ANLAM yedi terimin** talep kanıtı GEO-SEO'dan gelmeden ilk dalgaya girmez.

## 7. Madde yazım akışı

1. Kaynak noktası bulunur: kaynak dizini (belge, sayfa), TDK ya da IEV. Alıntı depo dışı kayda yazılır.
2. `scripts/rehber/alinti-dogrula.mjs` ile alıntı ham kaynakta doğrulanır.
3. Metin `scripts/rehber/rehber-denetim.mjs` desenlerinden geçer (üstünlük, vaat, fiyat, rakip, olumsuz iddia).
4. Recep önizleme görür (R5.6); onay olmadan yayın yoktur.
5. Sözlük için ayrı kalıp kapısı yazılır; kapı onu gerektiren PR'da doğar (R8.1).

## 8. Ölçüm

Yayın günü taban ve 4 hafta sonrası rapor GEO-SEO'dadır (bölüm 1). Sorgu listeleri depoya girmez, yalnız özet sayılar girer.
