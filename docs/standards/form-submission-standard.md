# Form Gönderim Cetveli (müşteri yüzü)

> **Kapsam:** Ziyaretçinin/müşterinin doldurup gönderdiği **her** form.
> Admin içi formlar bu cetvelin dışındadır (onlar `admin-design-standard.md`'ye tabidir).
> **SSOT:** bu dosya. Bekçi: `src/__tests__/conformance/form-submission-integrity.test.ts` (INV-FORM-1).

## 0. Niçin bu cetvel yazıldı (ölçüm, 2026-08-19)

Cetvel **yoktu** ve boşlukta iki kusur yaşadı — ikisi de aynı sınıftan:

| dosya | ne yapıyor | sonuç |
|---|---|---|
| `src/components/LeadModal.tsx:53-70` | `setTimeout(1200ms)` → başarı ekranı | ad, e-posta, telefon, firma, şehir, mesaj **ve KVKK rızası** hiçbir yere yazılmıyor |
| `src/views/ContactPage.tsx:46` | yorum: *"Form submission logic using supabase would go here"* | aynı sınıf |

LeadModal ana sayfada canlıdır ve dört tetikleyicisi vardır (`CaseStudySection`,
`ClientLeadButton`, `HomeSinevizyon`, `MagneticCTA`). Yani sitenin en görünür talep
toplama yüzeyi, müşteriye "aldık" derken hiçbir şey almıyordu.

**Sınıfın adı: sahte-başarı.** Kod çalışıyor, ekran doğru, test yeşil, veri yok. Bu cetvel
tam olarak bu boşluğu kapatmak için yazıldı; kural, ekranın kanıta bağlanmasıdır.

## 1. Temel sözleşme — başarı ekranı KANITA bağlıdır

> **Başarı ekranı yalnızca kalıcı kayıt döndüğünde açılır.**

- "Kalıcı kayıt döndü" = yazma çağrısı hatasız sonuçlandı **ve** yazılan satırın kimliği
  (`id`) geri alındı. Dönüşü kullanılmayan yazma, kanıtlanmamış yazmadır.
- **Niçin id şart:** hatasızlık tek başına zayıf kanıttır; geri dönen kimlik, satırın
  gerçekten oluştuğunu gösteren tek pozitif işarettir.
- Zamanlayıcı, animasyon süresi, `Promise.resolve()` ya da iyimser (optimistic) durum
  **başarı kanıtı değildir**.
- Başarı ekranı ile yazma arasında hiçbir koşul bulunmamalıdır: yazma başarılıysa ekran
  açılır, değilse açılmaz. Üçüncü bir dal yoktur.

## 2. Dürüst hata yolu

- Yazma hata verirse kullanıcıya **hata gösterilir**; form açık kalır, girdiler korunur.
- Hata metni sözlükten gelir (`i18n`), TR **ve** EN karşılığı bulunur — ham dize yasaktır.
- Kullanıcıya teknik hata gövdesi (`error.message`) gösterilmez; teşhis kaydı
  `errorReporter`/console'a gider, ekrana yalnız insanca cümle çıkar.
- **Sessiz yutma yasak:** `catch {}` ile hatayı yutup ekranı değiştirmemek, sahte-başarının
  ikinci biçimidir.

## 3. KVKK rızası kayıtla BİRLİKTE saklanır

- Rıza kutusu bir gönderim ön koşuluysa (`consent` zorunlu), rızanın kendisi de **kayıtla
  aynı satırda** saklanır: rıza bayrağı + rıza zamanı.
- Rıza toplayıp saklamamak, rıza almamış olmakla aynı kapıya çıkar — kanıtı yoktur.
- Rıza alanları `legal-compliance-standard.md` ile birlikte okunur.

## 4. Spam asgarî önlemi

Anonim ziyaretçiye açık her form için **en az** şu üçü:

1. Zorunlu alanlar veritabanı tarafında da boş geçilemez (`WITH CHECK` ile).
2. Rıza `true` olmadan satır yazılamaz (yine `WITH CHECK`).
3. Rol yetkileri asgarî: anon rolünün hedef tablo üzerinde **hiçbir** yetkisi olmaz;
   yalnız yazma fonksiyonunu çalıştırma (`EXECUTE`) yetkisi verilir. (Ölçüm 2026-08-19:
   `contact_messages` üzerinde anon'un `DELETE`, `UPDATE`, `TRUNCATE` yetkisi **vardı**;
   tek engel izin veren politikanın bulunmamasıydı. Politika ekleyen kişi `FOR ALL`
   yazsaydı anonim ziyaretçi tabloyu boşaltabilirdi.)

Hız sınırı (aynı IP'den N/dakika) bu cetvelin **kapsamı dışındadır** ve ayrı bir iş olarak
kuyruktadır; yukarıdaki üç madde onun yokluğunda da zorunludur.

## 5. Hangi form hangi tabloya yazar

| form | dosya | tablo | yazan rol |
|---|---|---|---|
| Talep/lead modalı | `src/components/LeadModal.tsx` | `public.contact_messages` (RPC: `submit_contact_message`) | anon + authenticated |
| İletişim sayfası | `src/views/ContactPage.tsx` | `public.contact_messages` (RPC: `submit_contact_message`) | anon + authenticated |
| Teklif talebi (RFQ) | `src/components/quotes/QuoteRequestModal.tsx` | `public.venthub_quotes` (+ `venthub_quote_items`) | authenticated |

Yeni bir müşteri-yüzü form eklenirse **bu tabloya satır eklemek zorunludur**; hedefi
yazılmamış form, sahte-başarının açık davetidir.

## 6. Yazma katmanı

- Yazma **`lib/services/` altındaki bir servisten** yapılır; bileşen doğrudan
  `supabase.from(...)` çağırmaz.
- Servis, projedeki DI kuralına uyar: ilk parametre `supabase: SupabaseClient<Database>`
  (CLAUDE.md §2).
- Var olan desen budur — `QuoteRequestModal` → `createQuoteRequest(supabaseBrowserClient, ...)`.
  Müşteri-yüzü yazma için Edge Function **gerekmez**.
- **Anonim ziyaretçiye açık formlar** tabloya doğrudan yazmaz; `SECURITY DEFINER` bir
  veritabanı fonksiyonundan geçer (`public.submit_contact_message`). Sebebi ölçülmüş bir
  kısıttır: `insert().select()` = `INSERT ... RETURNING` ve `RETURNING`, tablo üzerinde
  `SELECT` yetkisi ister — bunu anon'a vermek ziyaretçiye **başkalarının mesajlarını**
  okutmak olurdu. Fonksiyon hem id döndürür (§1'deki kanıt) hem de anon'u tablodan tümüyle
  uzak tutar.

## 7. Yasak desenler (bekçi bunları arar)

1. `setTimeout` / `setInterval` ardından doğrudan başarı durumu kurmak.
2. "Simulate API call", "would go here" türü, yazma yerine geçen yorum.
3. Başarı durumunu yazma çağrısından **önce** kurmak.
4. Yazma sonucunu (`error`) hiç okumamak.

## 8. Bekçi: INV-FORM-1

Bekçi iki koldan ölçer:

- **Statik:** §7'deki desenler müşteri-yüzü form dosyalarında bulunmaz. Muafiyet ancak
  **adıyla** yazılır ve gerekçesi satırda durur.
- **Davranışsal:** yazma çağrısı hata döndüğünde başarı ekranının **açılmadığı** gösterilir.

Kapı eklendiğinde **bilerek bozulur**: sahte-başarı deseni geri konur, bekçinin kırmızı
verdiği görülür, sonra geri alınır. Yakalamayan bekçi kapı sayılmaz.
