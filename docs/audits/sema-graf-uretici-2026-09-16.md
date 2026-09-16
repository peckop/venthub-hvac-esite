# Şema graf üreticisi — tasarım kararları ve aşama 1 ölçümü

**Tarih:** 2026-09-16 · **Şerit:** ALTYAPI · **Kapı:** `INV-SEMA-GRAF-1`
**İsteyen:** Recep — *"bu supabase tarafının bir haritasını çıkartmamız lazım, bu şekilde
olmayacak, codegraph gibi bir şey lazım."*

---

## 1. Niçin graphify bu işi yapmıyor — ölçüldü, üç adımda

Graphify'a SQL eklentisi kuruldu (`uv tool install "graphifyy[sql]"`), grafik **9.122 → 10.410
düğüme** çıktı ve tablolar görünmeye başladı. Ama veritabanı haritası için **yetmedi**:

| Nesne | Canlı gerçek | Graphify gördü |
|---|---|---|
| tablo (taze tabandan) | 66 | **39** |
| politika | 163 | **1** |
| indeks | 113 | **0** |

**Sebep ayar değil, deneyle ayrıldı:**

1. Dosya **yarıda kesiliyor** — 8616 satırlık dökümde düğümler `L2988–L5775` arasında;
   politikalar `L6365`'te başlıyor, yani hiç sıraya gelmiyor.
2. **Bölmek kesilmeyi çözüyor ama nesne eksiğini çözmüyor:** döküm 2900 satırlık üç parçaya
   bölündü → ilk iki parça **sonuna kadar** işlendi (düğüm 210 → 275). Ama indeks+politika
   taşıyan **üçüncü parça yalnız 4 düğüm** verdi (L3–L11) — boyut sınırının **altında**.
3. Yani extractor `CREATE INDEX` ve `CREATE POLICY` nesnelerini **modellemiyor.**
   (`--token-budget` semantik/LLM kısmı içindir, AST için değil.) Araç derlenmiş olduğu için
   içi değiştirilemez.

**Hüküm:** graphify **kod tarafında** kalır (orada iyi ve artık tabloları da görüyor);
veritabanı yarısını **biz üretiriz** ve onun kendi `merge-graphs` komutuyla ekleriz.

---

## 2. Tasarım — Recep'in dört sorusuna dört cevap

Recep'in sorusu: *"yama gibi mi olacak yoksa AST gibi mi olacak, bu bağlamları nasıl çekecek…
bir ürün geliştirir gibi geliştirip bir başkası da kursaydı sağlıklı çalışır mantığı mı olacak?"*

### 2.1 ⛔Metin taraması YOK — o yama olurdu

SQL düzenli bir metin değildir: tırnaklama değişir, politika gövdesinde alt sorgu olur, satır
sonu keyfîdir. Bugün bir dosyada çalışan desen yarın başka dökümde **sessizce yanlış sayı**
verir. Kanıtı §1'de: graphify'ın kendi tarayıcısı tam bunu yaptı ve kimse fark etmedi.

### 2.2 ⭐Kaynak veritabanının KENDİ KATALOĞU

PostgreSQL *"bende hangi tablolar, hangi kısıtlar var"* sorusunun cevabını `pg_class`,
`pg_constraint`, `pg_namespace` içinde tutar. **Otoriteye sorulur** — tahmin edilmez,
ayrıştırılmaz. Üç üstünlüğü:

- **Eksiksizlik tanım gereği** gelir; sayıyı veren şeyin kendisidir.
- **Bağlantılar doğru** gelir: yabancı anahtarlar gerçek kısıt kayıtlarından, adıyla
  (`products_brand_fkey`).
- **Kayamaz**, çünkü kaynak gerçeğin kendisidir.

### 2.3 Canlıya bağlanmak ZORUNLU değil — tek kod yolu, iki girdi

Araç bir **bağlantı dizesi** alır. O dizenin ucundaki veritabanı canlı da olabilir, dökümden
kurulmuş geçici bir küme de. **İkinci bir ayrıştırıcı yazılmaz** — iki girdi de aynı kataloğa
aynı soruları sorar. (Dökümü boş bir kümeye uygulama yöntemi 2026-09-15'te ölçüldü: 0 hata,
canlıyla 8/8 parite.)

### 2.4 "Başkası kursa çalışır mı" — dört şart, dördü de kapıya bağlandı

| Şart | Nasıl sağlandı | Hangi kol ölçüyor |
|---|---|---|
| Hiçbir proje adı gömülü olmasın | şema listesi `--semalar` ile dışarıdan; kodda tablo/şema adı yok | ⭐TASINABILIR kolu (kodda `venthub_`, `products`, `categories`, `iyzico` arar — **yorumda değil**) |
| Bağlantı bilgisi kodda olmasın | yalnız **ortam değişkeni ADI** okunur; değer basılmaz, varlık **uzunlukla** ölçülür | ⭐SIR DEGERI BASILMAZ kolu |
| Çıktı standart biçimde olsun | graphify node-link (`nodes` + `links` + `directed`/`multigraph`) | CIKTI graphify BICIMINDE kolu |
| Çıkış kodları anlamlı olsun | 0 üretildi/atlandı · 1 parite tutmadı · 2 ölçemedi — **betiğin kendi başlığında yazılı** | ⭐CIKIS KODU SOZLESMESI kolu |

### 2.5 Düğüm kimlikleri KENDİ AD ALANINDA (`db_` öneki)

Gerekçe ölçülmüş: graphify SQL dosyalarından **da** tablo düğümü üretiyor ve kendi
şartnamesinde *"aynı varlık her zaman aynı kimliği üretmeli, yoksa orphan ghost-duplicate
düğüm doğar"* diye uyarıyor. Biçimde en küçük fark hayalet ikiz demek. Bizimkiler ayrı ad
alanında durur: yan yana görünür, karışmaz, bir gün ayırmak istersek tek satırla ayrılır.

---

## 3. Aşama 1 ölçümü — yerel yığında koşuldu

**Hedef:** yerel Supabase yığını (Docker, `127.0.0.1:54322`). **Prod'a dokunulmadı.**

```
sema-graf-uret: sir MEVCUT (uzunluk 55 karakter, deger BASILMADI).
sema-graf-uret: hedef YEREL (TLS yok)
sema-graf-uret: semalar=public · tablo=18 · fk=13
sema-graf-uret: kapsam DISI fk=6 (hedef public disinda — cizilmedi)
sema-graf-uret: DOGRULAMA TUTTU (tablo 18=18 · fk 13=13)
```

**Birleştirme kabul sınavı geçti:**

```
graphify merge-graphs graphify-out/graph.json graphify-out/db-graph.json
→ Merged 2 graphs -> 10428 nodes, 19517 edges      (+18 düğüm / +13 kenar, tam beklenen)
```

**Ve veritabanı sorusu cevaplanıyor** — bu, işin asıl çıktısı:

```
graphify explain "repo-2::db_public_products"
  Node: public.products      Source: db://public kolon=13 rls=on      Degree: 8
  --> public.categories [references]      <-- public.cart_items [references]
  --> public.brands [references]          <-- public.inventory_movements [references]
                                          <-- public.venthub_order_items [references]
                                          <-- public.product_documents [references]
                                          <-- public.product_images [references]
                                          <-- public.technical_specifications [references]
```

⚠**`merge-graphs` kimlikleri yeniden etiketliyor** (`repo-2::` öneki) çünkü onu iki AYRI depo
grafiği sanıyor. Ölçüldü, sorun değil ama **bilinmesi gerekiyor**: birleşik grafta sorgu
etiketli kimlikle yapılır. `explain "public.products"` dört adaya çıkar ve ayırt etmeyi ister.

---

## 4. ⭐ÜRETİCİ KENDİ HATASINI YAKALADI — doğrulama kolu ödedi

İlk koşumda üretici **13** kenar verdi, doğrulama sorgusu **19** dedi. Kol kırmızı yandı.

**Sebep, bu projede tekrar eden sınıf: ölçüt doğruydu, EVREN yanlıştı.** İlk doğrulama sorgusu
`information_schema.table_constraints` kullanıyordu; o, **kaynak** tablosu kapsamda olan HER
yabancı anahtarı sayar — hedefi `auth` gibi başka bir şemada olsa bile. Üretici ise **iki ucu
da** kapsamda olanları çiziyor (bir ucu düğümsüz kalan kenar graphify'da orphan üretir).

**Düzeltme iki parçalı:** parite **aynı evrende** ölçülür, **ve** kapsam dışına giden anahtarlar
ayrı bir sayı olarak **raporlanır** (`kapsam DISI fk=6`). Gizlenmesi *"ilişki yok"* izlenimi
verirdi. 13 + 6 = 19 → eski tutarsızlık **tam olarak** açıklandı.

⭐**Bu kol olmasaydı araç sessizce yarım veri üretmeye başlayacaktı** ve biz aylar sonra
öğrenecektik — bu depoda ölçülmüş bir kusur sınıfı.

## 4.1 TLS kararı: sessiz geri düşme YASAK

İlk koşumda kök sertifika dosyası varsa koşulsuz TLS veriyordum; yerel küme *"The server does
not support SSL connections"* ile reddetti. **Akla gelen kolay çözüm — "hata alırsan SSL'siz
tekrar dene" — reddedildi**, çünkü uzak bir sunucu TLS'i düşürdüğünde de aynı yola girer ve
şifreleme **sessizce** kaybolur. Bu, `sslmode` tuzağının başka bir biçimi olurdu.

Karar **hedefe** bakar: yerel döngü adresi → TLS yok (trafiğin makineyi terk etmediği
ölçülebilir bir olgu). Başka her hedef → kök sertifika **zorunlu**; sertifika yoksa bağlanmayı
**denemez** ve sebebini yazar. Kapının bir kolu bu geri düşmenin **yokluğunu** ölçüyor.

## 4.2 Kapının kendisi de iki kez yanlış kırmızı verdi (yazılırken)

1. *"Yasak kalıp"* arayan kol, o kalıbın **yasak olduğunu anlatan yorumun** üstünde tetiklendi
   — yani kapı kendi belgesini ihlal sandı. Düzeltme: kalıp **kodda** aranır, yorumda değil.
   (Aynı sınıf: `protect-config` kancası bu dosyayı yazarken **beni de bir kez durdurdu**,
   çünkü yorumda bir tip-kaçış kalıbının adını anmıştım. Kanca doğru davrandı.)
2. Çıkış kodu sözleşmesini arayan kol `uretildi` deseniyle yazılmıştı; betik `üretildi` diyor
   ve **eşleşmedi**. Bu, Türkçe harf körlüğünün üçüncü sahada görülüşü.

---

## 5. Sınırlar, adıyla

1. **Aşama 1 yalnız tablolar ve yabancı anahtarlar.** Politikalar aşama 2, fonksiyon/tetik
   aşama 3, indeksler henüz kapsamda değil. Aşamalı olması bilinçli: her aşama kendi kapısıyla
   iner (CLAUDE.md kural 14).
2. **`INV-SEMA-GRAF-1` grafın DOĞRULUĞUNU ölçmez** — sözleşmeyi ölçer (sır, TLS, taşınabilirlik,
   çıkış kodu, çıktı biçimi). Doğruluk ölçümü canlı/yerel bir veritabanı ister ve o ayrı bir
   koşumdur. Bu ayrım kapının başlığında da yazılı; aksi hâlde *"kapı yeşil"* cümlesi
   *"graf doğru"* gibi okunur.
3. **Ölçüm yerel yığında yapıldı ve o yığın BAYAT** (18 tablo; canlıda 66). Yani sayılar aracın
   **çalıştığını** kanıtlar, **canlı şemayı** anlatmaz. Canlı koşum ayrı bir adımdır.
4. **`merge-graphs` etiketleme davranışı** bizim kontrolümüzde değil (`repo-2::`). Bir sonraki
   graphify sürümü bunu değiştirirse birleşik graftaki kimlikler değişir.
5. **Tazelik bağı henüz KURULMADI.** Tasarım kararı şudur: bu graf, taban tazeleme yoluna
   bağlanacak (tek komut ikisini birden üretsin), yoksa **kendi başına bayatlar** ve bugün üç
   kez bulduğumuz "atıl araç" hatasının dördüncüsü doğar. Bağ aşama 2'nin kapsamındadır.
