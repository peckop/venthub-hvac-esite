---
domain: general
source_type: doc
namespace_type: module
source_path: C:\Users\alize\venthub-hvac\src\components\home\FinalCTA.tsx
skeleton_hash: 35632ddf2d507e9e
generated_at: 2026-05-23T22:05:46Z
---

## Genel Bakış
Bu modül, sayfanın son kısmında kullanıcıya bir teklif alma teşviki sunan bir çağrı‑eylem (CTA) bileşenini tanımlar. Bileşen, dışarıdan gelen bir işlev üzerinden kullanıcı etkileşimini yöneterek, teklif butonuna tıklandığında istenen eylemi tetikler.

## Fonksiyon Grupları
### Görüntüleme ve Etkileşim
Bu grup, bileşenin ekrana nasıl yerleşeceğini ve kullanıcıyla nasıl iletişim kuracağını belirler.  
- FinalCTA (props üzerinden onQuoteClick işlevini alır, buton görüntüler ve tıklandığında ilgili işlevi çağırır)

---

## AXIOMS – Mimari Varsayımlar
Bu modülün doğru çalışması için bazı temel varsayımlar gereklidir.

[Aksiyom 1]: Eğer `onQuoteClick` prop'u bir fonksiyon değilse veya sağlanmazsa, Quote butonuna tıklandığında beklenen işlev (örneğin, teklif formunun açılması) gerçekleşmez veya çalışma‑zamanı hatası oluşur.  
[Aksiyom 2]: Eğer `revealVariants` sabiti bir obje değilse, Framer Motion (veya benzeri animasyon kütüphanesi) tarafından animasyon tanımları uygulanamaz ve görsel geçiş efektleri beklenildiği gibi çalışmayabilir.  
[Aksiyom 3]: Eğer `onQuoteClick` fonksiyonu bir hata fırlatırsa, bu hata FinalCTA bileşeninin içinde yakalanmadığı sürece UI'nin render edilmesi kesintiye uğrar ve kullanıcı etkileşimi kesilebilir.

---

## FONKSIYON DETAYLARI

### FinalCTA
**Ne yapar**: FinalCTA bileşeni, verilen `onQuoteClick` fonksiyonunu kullanarak bir çağrı-eylem bölümü render eder.  
**Nasıl yapar**: Props olarak alınan `onQuoteClick` işlevini bir düğme veya bağlantıya bağlayarak, kullanıcı etkileşimi olduğunda ilgili fonksiyonu tetikler.  
**Parametreler**:
- onQuoteClick: () => void — Quote butonuna tıklandığında çağrılacak fonksiyon.  
**Dönüş**: React.FC<FinalCTAProps> — FinalCTA bileşeninin render ettiği JSX elementi.

---

## INTERFACES

### FinalCTAProps
- `onQuoteClick?: () => void`

---

## SABİTLER
- **revealVariants** (object) — `{
  hidden: { opacity: 0, y: 20 },
  visible: (i: number) => ({
    opacit...`

---

## AST POINTERS

### [N1_NASIL] AST Pointer: src/components/home/FinalCTA.tsx::revealVariantFn
- **params**: i (number)
- **ic_degiskenler**: yok
- **Dönüş**: object

### [N2_NASIL] AST Pointer: src/components/home/FinalCTA.tsx::FinalCTA
- **params**: onQuoteClick (function)
- **ic_degiskenler**:
  - `t` — çeviri fonksiyonu, useI18n hookundan elde edilen t, home sayfasındaki metinleri çevirmek için kullanılır
- **Dönüş**: JSX.Element

### [N3_NASIL] AST Pointer: src/components/home/FinalCTA.tsx::handleQuoteClick
- **params**: yok
- **ic_degiskenler**: yok
- **Dönüş**: yok

---

## NODE ID STANDARD

  file: src\components\home\FinalCTA.tsx
  function: src\components\home\FinalCTA.tsx::FinalCTA

---

## DISA AKTARILANLAR (EXPORTS)
  export: FinalCTA

---

## STİL TOKENLERİ

### Arbitrary Değerler (token'a geçirilmemiş)
- **shadow:** (yok)
- **height:** `h-[600px]`, `h-[800px]`
- **width:** `w-[600px]`, `w-[800px]`
- **spacing:** (yok)
- **diğer:** `blur-[120px]`, `blur-[150px]`, `hover:shadow-[0_0_40px_rgba(255,255,255,0.2)]`, `opacity-[0.03]`, `skew-x-[45deg]`, `tracking-[0.2em]`, `tracking-[0.3em]`, `tracking-[0.4em]`

### Kullanılan Token'lar (zaten token'a geçirilmiş)
- `rounded-hvac-3xl`

### Tailwind Sınıf Özeti
- **Renkler:** `bg-cyan-400`, `bg-cyan-500/10`, `bg-emerald-500`, `bg-gradient-to-r`, `bg-indigo-500/10`, `bg-slate-950`, `bg-white`, `bg-white/5`, `bg-white/[0.02]`, `border-b`, `border-cyan-500/30`, `border-l`, `border-l-2`, `border-r`, `border-t`
- **Layout:** `absolute`, `backdrop-blur-3xl`, `bottom-0`, `bottom-6`, `flex`, `flex-1`, `flex-col`, `flex-wrap`, `from-cyan-600`, `gap-10`, `gap-12`, `gap-4`, `gap-6`, `gap-8`, `grid`
- **Responsive:** `lg:`, `md:`, `sm:` prefix kullanımları
