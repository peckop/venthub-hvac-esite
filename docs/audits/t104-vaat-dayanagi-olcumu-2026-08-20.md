# Vaat ↔ dayanak kapısı — ölçüm ve tasarım kararı (2026-08-20)

> Şerit: LEGAL-SEO · İş emri: OPS-AUDIT 09:40 ("`legal-promise-backing` kapısını TEK
> DOSYADAN SINIFA genişlet — vaat eden her yüzey arkasındaki yazma ya da ağ çağrısıyla
> eşleşiyor mu ölçen **davranışsal** kapı")
> **KAYNAK/CETVEL:** `docs/standards/legal-compliance-standard.md` §1 sicil + T104 karar
> paketi. Bu sınıf için ayrı cetvel **henüz yok**; yazılması T104'ün kapsamındadır.

Bu belge bir kapının kendisini değil, **kapının nasıl yazılmaması gerektiğini** kaydeder.
Üç tasarım denendi, üçü de ölçümle çürütüldü. Kaydediliyor ki aynı yollar tekrar yürünmesin.

## 0. Sorulan ilk soru: mevcut kapı LeadModal'ı niçin görmedi

**Cevap: kapsam, desen değil.** `INV-LEGAL-3` şunlara bakıyor —
`src/views/legal/components/{tr,en}/**` altındaki yasal **metin** bileşenleri, `legal.ts`
konfigürasyonu, fatura kimliği kuralı, KVKK migration'ı ve cetvelin kendisi. LeadModal
(`src/components/LeadModal.tsx`) bu kümelerin hiçbirinde değil ve olması da gerekmiyordu.

İki ayrı sınıf var, karıştırılmamalı:

| Sınıf | Soru | Bekçi |
|---|---|---|
| Konfigürasyon dayanağı | Metnin dayandığı alan dolu ve tutarlı mı | INV-LEGAL-3 (var) |
| **Davranış dayanağı** | Vaadi veren yüzey gerçekten bir şey yapıyor mu | **yok — bu iş** |

İkincisi birincinin geniş hâli değildir; **başka bir soru sorar.** Kapsamı büyüterek
elde edilemez.

## 1. Sınıfın büyüklüğü

Sözlüklerde (`tr/en` + `admin/**`) kullanıcıya "işin oldu" diyen **67 anahtar** var;
bunları basan **41 yüzey** bulundu. Ama bugün gerçekten dayanaksız olan **tek** yüzey var:
`LeadModal.tsx`. Kodun kendisi bunu yazıyor:

```
// Simulate API Call for better UX instead of "mailto"
setTimeout(() => { setIsSuccess(true) ... }, 1200)
```

Ağ çağrısı taraması (`fetch` / `supabase` / `invoke` / `axios` / `insert` / `rpc` /
`sendBeacon` / `XMLHttpRequest`): **sıfır eşleşme**. Kullanıcıdan **zorunlu rıza** alınıyor,
"Talebiniz Alındı!" deniyor ve veri hiçbir yere gitmiyor.

> Not: LeadModal I18N-SWEEP şeridinde ve **onarımı T104'ün işidir** (planı onaylı).
> Bu ölçüm onların bulgusunu tekrar etmiyor, kapı tasarımı için kullanıyor.

## 2. Çürütülen üç tasarım

### (a) Anahtar ADINA bakmak — %75 sahte pozitif

`t('...success')`, `...sent`, `...saved` gibi anahtar adlarını aramak 4 aday üretti,
**3'ü sahteydi**: `checkout.saved.title` = **"Kayıtlı Adresler"**. "saved" burada sıfat,
vaat değil. Vaat anahtar adında değil **metinde** yaşar.

### (b) Dosyada ağ çağrısı aramak — iki yönde de yanlış

Metin-tabanlı ikinci tur, "bu dosyada herhangi bir yazma var mı" sorusuna geçti. Ölçüm:

| Dosya | Verdiği hüküm | Gerçek | Sebep |
|---|---|---|---|
| `RegisterPage.tsx` | DAYANAKLI | doğru sonuç, **yanlış gerekçe** | eşleşen `fetch`, parola sızıntı kontrolündeydi (`passwordSecurity.ts`) — vaatle ilgisi yok |
| `ForgotPasswordPage.tsx` | DAYANAKSIZ | **yanlış** | gerçek çağrı iki seviye aşağıda: `useAuth` → `AuthContext` |

`useAuth.ts` içinde yazma deseni **sıfır** (ölçüldü) — o yalnız bir bağlam tüketicisi.
Yani dosya düzeyi bir **vekildir** ve asıl şeyi ölçmez: alakasız bir çağrı yüzünden
aklar, devredilmiş bir çağrıyı göremediği için suçlar.

### (c) Düzenli ifadeyle "başarıyı açan fonksiyonu" bulmak — bilinen doğruyu kaçırdı

Üçüncü tur `setIsSuccess(true)` gibi açıcıları bulup kapsayan fonksiyonda `await` aradı.
41 yüzeyin **40'ı** "fonksiyon sınırı bulunamadı" diye atlandı — **LeadModal dahil**, ki o
zaten sınıfın bilinen tek üyesi. Sebep: fonksiyon başlangıcı düzenli ifadeyle güvenilir
biçimde bulunamıyor; ayrıca admin yüzeylerinin çoğu başarıyı state ile değil `toast` ile
gösteriyor, yani "açıcı state" modeli onlara hiç uymuyor.

**Bilinen doğru vakayı kaçıran bir dedektör, yeşil verdiğinde hiçbir şey söylemez.**

## 3. Karar: kapı DAVRANIŞSAL olacak

Üç turun ortak dersi: "vaat dayanaklı mı" sorusu **metinsel değildir**. Statik tarama
yüzeyin ne *söylediğini* görebilir, ne *yaptığını* göremez. OPS'un iş emri de zaten
davranışsal diyordu; ölçüm bunu doğruladı.

**Tasarım:** kayıtlı her vaat yüzeyi için — bileşeni render et, zorunlu alanları doldur,
gönder, ve **ağ/yazma katmanının çağrıldığını** doğrula. Depoda bu deseni taşıyan sağlam
bir örnek var (`AdminRealtimeNotifications.test.tsx`: `vi.mock` ile supabase istemcisi
sahte, çağrılar sayılıyor).

**Kendini temizleyen taban çizgisi.** LeadModal bugün kusurludur ve onarımı başka şeritte.
Kapı onu "muaf" diye atlamaz — **bugünkü kusurlu davranışı ADIYLA doğrular**: gönderimde
hiçbir çağrı yapılmadığını iddia eder. T104 onarımı indiği an bu iddia **kırmızıya döner**
ve kaydın güncellenmesini zorlar. Böylece muafiyet unutulamaz; sessizce kalıcılaşamaz.

## 4. KVKK görüşü — hiç saklanmayan veri için alınan zorunlu rıza

OPS'un sorusu. Kısa cevap: **asıl sorun rızanın geçersizliği değil, beyanın yanlışlığıdır.**

1. **Rıza konusuzdur.** KVKK'da rıza bir *işleme faaliyeti* için alınır. Ortada işleme
   yoksa rıza hukuken bir şeye izin vermiyor demektir — ama bu, tek başına, kullanıcıya
   verilen zararı anlatmaz.
2. **Asıl kusur "alındı" demektir.** Kullanıcı talebinin iletildiğine inanır ve beklemeye
   geçer. Ticari iletişim açısından bu, gerçeğe aykırı bir beyandır; hukuki riski rıza
   kutusundan daha ağırdır.
3. **Gecikmeli ve sinsi sonuç:** kullanıcı KVKK m.11 ile "hakkımda hangi veriyi
   işliyorsunuz" diye sorduğunda şirket **gösterecek kayıt bulamaz**. "Kaydımız yok"
   cevabı, kullanıcının rıza verdiğini hatırladığı bir yerde, uyum sorusunu büyütür.
4. **Doğru düzeltme iki yoldan biridir**, ve seçim ticari: ya vaat gerçeğe çekilir
   (gönderim yok, doğrudan iletişim kanalı gösterilir), ya da yazma gerçekten yapılır.
   **Rıza kutusu, ancak yazma gerçekleştiği anda anlam kazanır** — önce kutuyu meşru
   kılıp sonra yazmayı eklemek sıralamayı tersine çevirir.

Cetvel tarafı: `legal-compliance-standard.md` §1 siciline "form gönderimi" satırı
eklenmelidir; bugün o taahhüdün sicilde karşılığı **yok** — yani bu sınıf, cetvelin
kendisinin de görmediği bir boşlukta yaşıyor.

## 5. Açık kalan

- Davranışsal kapının kendisi (kayıt + donanım) — sıradaki iş, bu ölçümün üstüne.
- `form-submission-standard.md` T104'ün kapsamında; kapı ona atıf yapacak.
- LeadModal onarımı **bu şeritte değil** (I18N-SWEEP / T104).
