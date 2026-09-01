# Vaat Bütünlüğü Standardı — vitrin neyi vaat edebilir

**Kapsam:** müşteriye görünen vitrin yüzeylerinde (ürün, kategori, seri, sepet, destek,
ana sayfa) yazılı **ticari vaatler** — ödeme, taksit, kargo, teslim süresi, iade, garanti,
sertifika. **Kapsam dışı:** admin, hesap/sipariş geçmişi, hukuki metinler (KVKK, mesafeli
satış), ödeme akışının kendi içi.

**Kapı:** `INV-VAAT-SIZINTI-1` → `src/__tests__/conformance/vaat-sizintisi.test.ts`

---

## 0) Niçin var — ölçülmüş olay (2026-09-01, REC-104)

Site **teklif modundaydı** ve bunu kendi de söylüyordu: `/checkout` canlıda *"Ödeme yakında
açılıyor — Mağazamız kuruluş aşamasında"* basıyordu. Aynı anda:

- Her ürün sayfasında tek CTA **"TEKNİK TEKLİF İSTE"** iken, hemen altında
  **"ÜCRETSİZ KARGO · GÜVENLİ ÖDEME · GARANTİ"** rozetleri duruyordu.
- Hava perdeleri iniş sayfasında **"Taksit İmkanı — 12 aya varan taksit"** ve
  **"Güvenli Ödeme — SSL şifreli işlem"** yazıyordu.
- `/destek/sss` *"iyzico aracılığıyla kredi/banka kartları ile güvenli ödeme
  yapabilirsiniz"* diyordu.
- `/destek/teslimat-kargo` *"Kargo ücreti/firması **ödeme adımında** gösterilir"* diyerek
  var olmayan bir adıma atıf yapıyordu.

Dayanak ölçümü: **23 aktif kategorinin 23'ünde `hide_price=true`**; çevrimiçi ödeme
`NEXT_PUBLIC_ODEME_ACIK` ile kapalı. Yani vaatlerin hiçbirinin arkasında yetenek yoktu.

**Sınıf:** kusur tek bir metinde değil, **iki yüzeyin birbirinden habersiz konuşmasında**.
Ödemeyi kapatan değişiklik `checkout/` içinde doğru davrandı; vitrin metinleri hiç
haber almadı. Hiçbir tip, lint ya da test bunu görmedi — çünkü hepsi **tek dosyaya** bakar,
vaat ise **dosyalar arası bir tutarlılık** iddiasıdır.

---

## 1) Kural

> **Bir vitrin yüzeyi, arkasında bugün çalışan bir yetenek olmayan hiçbir ticari vaadi
> yazamaz.** Yetenek kapalıysa vaat de kapanır; vaat yetenekten önce açılamaz.

Uygulaması üç maddede:

1. **Ödeme/taksit/ödeme-güvenliği vaadi** yalnız ödeme akışının kendi ağacında
   (`views/checkout/**`, `PaymentSuccessPage`) yazılabilir — orası zaten
   `NEXT_PUBLIC_ODEME_ACIK` kapısının arkasındadır. Vitrinde yazılamaz.
2. **Kargo ücreti / teslim vaadi** ancak siparişin oluştuğu kanalın dilinde yazılır.
   Teklif modunda doğru cümle "teklifinizde belirtilir"dir, "ödeme adımında gösterilir"
   değil.
3. **Sertifika ve garanti** iddiaları markaya bağlıdır; "tüm kategorilerde" basılan
   marka-özel bir iddia (ör. tek markanın Compasso d'Oro ödülü) vaat sızıntısıdır.
   Bu sınıf **karar gerektirir** — kapı onu kırmızı yapmaz, envantere yazar.

## 2) Vaat kapatılırken düzen de kapatılır

Rozet/kart listesinden kalem silmek **ızgarayı sessizce bozar** (2026-08-31'de ana
sayfada ölçüldü: 6 sütunluk şeritten kalem silinince yarısı boş satır kaldı). Bu yüzden:

- Rozet listeleri **veri-güdümlü** olur; sütun sınıfı kalem sayısından türetilir.
- Tailwind sınıfları **statik** yazılır (`grid-cols-3`), şablonla üretilmez —
  `grid-cols-${n}` üretim CSS'ine hiç girmez ve ızgara tek sütuna düşer.

## 3) Sözlük anahtarı da vaadin parçasıdır

Bir vaat kaldırılınca sözlükteki anahtarı da kaldırılır. Bırakılan anahtar
`INV-6` (ölü anahtar) kapısını kırmızı yapar — ve daha kötüsü, bir sonraki geliştirici
için "bu vaat hâlâ geçerli" sinyali olur. Geri gelmesi muhtemel anahtar için doğru yol
anahtarı bırakmak değil, **niçin kaldırıldığını yorumda yazmaktır**.

## 4) Kapının sınırı (gizlenmiyor)

`INV-VAAT-SIZINTI-1` **kaynak metni** ölçer: vitrin ağacındaki bileşenlerin çağırdığı
sözlük anahtarlarının değerlerinde vaat terimi arar. Ölçmediği iki şey var:

- **DB'den gelen içerik** (kategori `hero_description`, ürün açıklaması). Oraya yazılmış
  bir taksit vaadini bu kapı görmez; o katmanın kapısı katalog tarafındadır.
- **Yeteneğin gerçekten kapalı olduğu.** Kapı "vitrin ödeme vaadi yazmaz" kuralını
  test eder, `NEXT_PUBLIC_ODEME_ACIK`'ın değerini değil. Ödeme açıldığında kural
  gevşetilmez; vaat, ödeme akışının ağacından vitrine **açıkça taşınarak** açılır.

Terim listesi **ayırt edici** olmak zorundadır. Tek kelime `ödeme` ile taranmaz —
"ödeme" kelimesi hukuki metinlerde ve admin'de meşru olarak geçer ve ölçüt hiçbir şeyi
ayırt etmez. Liste, vaadi tek başına taşıyan öbeklerden kurulur ("taksit", "ücretsiz
kargo", "güvenli ödeme", "SSL", "3D Secure", "PCI DSS").

## 5) İlgili

- `docs/standards/quote-standard.md` — teklif modunun kendi semantiği
- `docs/standards/checkout-payment-standard.md` — ödeme akışı
- `src/__tests__/conformance/storefront-fiyat-sizintisi.test.ts` — **kardeş kapı**:
  fiyat sızıntısı. Bu kapı vaadi, o kapı rakamı korur; ikisi aynı ailedendir.
- `src/__tests__/conformance/promise-backing-behavior.test.tsx` (INV-PROMISE-1) +
  `docs/audits/t104-vaat-dayanagi-olcumu-2026-08-20.md` — **ayrı eksen, karıştırılmasın.**
  Orada soru "bu EYLEM vaadi gerçekten çalışıyor mu" (davranışsal ölçüm zorunlu);
  burada soru "bu YETENEK iddiası yazılabilir mi" (metin ölçümü yeterli).
