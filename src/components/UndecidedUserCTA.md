---
domain: general
source_type: doc
namespace_type: module
source_path: C:\Users\alize\venthub-hvac\src\components\UndecidedUserCTA.tsx
skeleton_hash: 0a3483208ef6d9f8
generated_at: 2026-05-23T22:28:09Z
---

## Genel Bakış
Venthub HVAC platformunda henüz platformdaki adımlara karar verememiş kararsız kullanıcılar için özel olarak tasarlanmış bir React kullanıcı arayüzü bileşeni barındırır. Bu bileşen, kullanıcıları uygun yönlendirmelere sevk eden eyleme çağrı içeriklerini ve etkileşimli öğeleri ekrana sunmak üzere geliştirilmiştir.

## Fonksiyon Grupları
### Ana Kullanıcı Arayüzü Bileşeni
Modülün tek ve ana işlevi olarak, tüm arayüz render işlemini üstlenir. Proje içinde başka bileşenlerden çağrıldığında kararsız kullanıcılar için hazırlanmış özel çağrı metinlerini ve etkileşim öğelerini ekrana yükler.
- UndecidedUserCTA

---

## AXIOMS – Mimari Varsayımlar
Bu istemci tarafı React bileşeni, kararsız kullanıcılara yönelik harekete geçirici çağrı mesajlarını (CTA) görüntülemek için tasarlanmıştır, çalışması için React çalışma zamanı ve DOM erişiminin sürekli olarak mevcut olması zorunludur.

[Aksiyom 1]: Eğer React çalışma zamanı ortamı mevcut değilse, bileşen hiçbir şekilde başlatılamaz ve kullanıcıya hiçbir zaman sunulamaz.
[Aksiyom 2]: Eğer bileşen geçerli bir DOM ortamında (veya sunucu taraflı render durumunda hydration işlemi tamamlanmış bir ortamda) çalıştırılmazsa, render hatası oluşur, kullanıcıya CTA içeriği gösterilemez.
[Aksiyom 3]: Eğer bu bileşen ana (parent) React bileşeni tarafından uygulama component tree yapısına dahil edilmezse, hiçbir zaman tetiklenmez ve kullanıcıya sunulmaz.
[Aksiyom 4]: Eğer bileşenin çalışması için gereken tüm React bağlamları (tema, çeviri, global uygulama durumu vb.) üst bileşen tarafından sağlanmazsa, bileşen hatalı render olur veya beklenen görsel/işlevsel özellikleri sunamaz.
[Aksiyom 5]: Eğer kullanıcının "kararsız" durumu üst bileşen tarafından doğru şekilde tespit edilip bu CTA'nın gösterim koşulu tetiklenmezse, hedef kullanıcı grubuna hiçbir zaman sunulamaz.

---

## FONKSIYON DETAYLARI

### UndecidedUserCTA
**Ne yapar**: VentHub HVAC projesinin kullanıcı arayüzünde, henüz herhangi bir işlem yapmamış veya karar vermemiş kararsız kullanıcılar için harekete geçirme çağrısı (CTA) sunan bir React fonksiyonel bileşenidir. Kullanıcıları ilgili aksiyonlara yönlendiren içerikler ve etkileşimli öğeler barındıran, projenin genelinde yeniden kullanılabilir bir arayüz katmanı oluşturur.
**Nasıl yapar**: Projenin src/components klasöründe konumlanan, yeniden kullanılabilir React bileşi standartlarında yapılandırılmıştır. Kendi iç yapısını bağımsız olarak yönetir, gerekli kullanıcı arayüzü öğelerini import ederek kararsız kullanıcı profiline özel içerikleri ekranda render eder. Herhangi bir harici durum bağımlılığı olmadan, çağrıldığı her yerde tutarlı bir CTA deneyimi sunar.
**Parametreler**:
- Bu fonksiyon herhangi bir giriş parametresi almaz, bağımsız çalışacak şekilde tasarlanmıştır.
**Dönüş**: React.FC türünde bir React fonksiyonel bileşeni döndürür. Döndürülen bu bileşen, tarayıcıda kullanıcıya görünür şekilde render edilebilen, kararsız kullanıcıları yönlendiren tüm CTA öğelerini içeren React node'larını barındırır. Proje içindeki tüm ilgili sayfalarda bu dönüş değeri kullanılarak bileşen ilgili yere yerleştirilir.

---

## AST POINTERS

### [N1_NASIL] AST Pointer: C:\Users\alize\venthub-hvac\src\components\UndecidedUserCTA.tsx::UndecidedUserCTA
- **params**: (parametre yok)
- **ic_degiskenler**:
  - `Link` — Next.js yönlendirme bileşeni, kullanıcıyı danışmanlık için iletişim sayfasına yönlendirmek üzere kullanılır
  - `MessageSquare` — Lucide-react ikon bileşeni, CTA bloğunda mesaj temalı simge olarak görüntülenir
  - `ArrowRight` — Lucide-react ikon bileşeni, buton içindeki hareketli sağ ok simgesi olarak kullanılır
  - `Routes` — Proje rota yardımcı nesnesi, 'consulting' etiketli iletişim rotasını oluşturmak için çağrılır
- **Dönüş**: Kararsız kullanıcıları uzman mühendis danışmanlığına yönlendiren React JSX elementi

---

## NODE ID STANDARD

  file: src\components\UndecidedUserCTA.tsx
  function: src\components\UndecidedUserCTA.tsx::UndecidedUserCTA

---

## DISA AKTARILANLAR (EXPORTS)
  export: UndecidedUserCTA

---

## STİL TOKENLERİ

### Arbitrary Değerler (token'a geçirilmemiş)
- **shadow:** (yok)
- **height:** (yok)
- **width:** (yok)
- **spacing:** (yok)
- **diğer:** `hover:scale-[1.02]`

### Kullanılan Token'lar (zaten token'a geçirilmiş)
- (yok)

### Tailwind Sınıf Özeti
- **Renkler:** `bg-gradient-to-r`, `bg-white`, `bg-white/10`, `bg-white/20`, `from-primary-navy`, `sm:text-2xl`, `sm:text-base`, `text-primary-navy`, `text-sm`, `text-white`, `text-white/80`, `text-xl`, `to-secondary-blue`
- **Layout:** `absolute`, `backdrop-blur-sm`, `bottom-0`, `flex`, `flex-col`, `from-primary-navy`, `gap-2`, `gap-5`, `gap-6`, `group-hover:translate-x-1`, `h-12`, `h-32`, `h-64`, `hover:shadow-xl`, `inline-flex`
- **Responsive:** `md:`, `sm:` prefix kullanımları
