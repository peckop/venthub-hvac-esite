# VentHub HVAC Bütünsel Refactoring ve Enterprise Tip Güvenliği Master Planı

Bu plan, **BackToTopButton (Yukarı Git)** ve **LanguageSwitcher (Dil Seçici)** bileşenlerinin dynamic JS koordinat hesaplamalarından (Reflow/Layout thrashing zafiyetlerinden) arındırılarak saf CSS Flexbox ile **MainLayout.tsx** içinde dikey sütunda birleştirilmesini (Yaklaşım B) ve NotebookLM kütüphanecisinin işaret ettiği **7 kritik teknik borç ile ölü bağımlılıkların** en yüksek kurumsal standartlarla çözülmesini hedefler.

---

## 🛡️ Enterprise Tip Güvenliği ve Sıfır Gevşek Tip (Zero `any`) Taahhüdü

Kurumsal mimaride tip güvenliği, platform kararlılığının bir numaralı kalkanıdır. Bu çalışmada uygulanacak mutlak kurallar şunlardır:

> [!IMPORTANT]
> **SIKI TYPESCRIPT DİSİPLİNİ VE ZERO-ANY GARANTİSİ**:
> 1. Proje genelinde kesinlikle hiçbir değişken, parametre veya dönüş değerinde gevşek tip tanımlaması (`any`) kullanılmayacaktır.
> 2. `useScrollThrottle` hook'undan dönen değerler `boolean` olarak sıkı tiplemeye tabi tutulacak, hook parametreleri ise `ScrollThrottleOptions` arayüzü (interface) üzerinden beslenecektir.
> 3. Odak sıfırlama (Focus Reset) fonksiyonlarında, DOM elemanları `HTMLDivElement` ve `HTMLElement` tiplerine güvenli bir şekilde atanarak (Type Guard) işlenecektir.
> 4. Kodda kesinlikle hiçbir geçici yama ("hack"), spagetti kod veya uydurma çözüm uygulanmayacaktır. Değişiklikler projenin mimarisine pürüzsüz bir şekilde entegre edilecektir.

---

## 🔍 Detaylı Satır Satır Kodlama Analizi (Line-by-Line Code Analysis)

Kırılma veya çakışmaları engellemek için, kod tabanındaki hedef dosyaların satır bazlı derinlik analizi şu şekildedir:

### 1. [MODIFY] [MainLayout.tsx](file:///c:/Users/alize/venthub-hvac/src/components/layout/MainLayout.tsx)
*   **Değişecek Satır Aralığı**: Satır 86 - 98 arası.
*   **Mevcut Durum**:
    ```tsx
    <div className="fixed bottom-6 right-6 z-50 flex flex-col gap-3">
        <BackToTopButton />
        
        {enableWhatsApp && (
            <Suspense fallback={null}>
                <WhatsAppFloat />
            </Suspense>
        )}
    </div>

    <PaymentWatcher />
    <LanguageSwitcher />
    ```
*   **Kırılma / Çakışma Analizi**: `LanguageSwitcher`'ın bu Flexbox'ın dışında olması ve kendi içinde `fixed bottom-4 right-4 z-50` stilini barındırması, ekran genişliği değiştiğinde butonların üst üste binmesine (overlapping) veya mobil cihazlarda tıklama alanlarının bloke olmasına sebep olmaktadır.
*   **Uygulanacak Değişiklik (Satır Satır)**:
    Konumlandırma tamamen ebeveyn konteynere devredilir. Semantik Z-Index token'ımız olan `z-toast` uygulanır. WhatsApp butonu ve Dil seçici de bu ortak Flexbox içine alınarak akış CSS motoruna bırakılır. Tıklamaların alt katmandaki sayfa elemanlarına ulaşmasını engellememek için flex konteynere `pointer-events-none`, butonların kendilerine ise `pointer-events-auto` uygulanır.
    ```tsx
    <div className="fixed bottom-6 right-6 z-toast flex flex-col items-end gap-3 pointer-events-none">
        <div className="pointer-events-auto">
            <BackToTopButton />
        </div>
        
        {enableWhatsApp && (
            <div className="pointer-events-auto">
                <Suspense fallback={null}>
                    <WhatsAppFloat />
                </Suspense>
            </div>
        )}

        <div className="pointer-events-auto">
            <LanguageSwitcher />
        </div>
    </div>

    <PaymentWatcher />
    ```

---

### 2. [MODIFY] [BackToTopButton.tsx](file:///c:/Users/alize/venthub-hvac/src/components/BackToTopButton.tsx)
*   **Değişecek Satır Aralığı**: Satır 1 - 70 arası (Bileşenin tamamı optimize ve tip güvenli hale getirilecektir).
*   **Mevcut Durum**:
    ```tsx
    // State, setInterval, computePos ve DOM ölçümleri içeren eski kod.
    // Her 500ms'de bir setInterval çalıştırarak getBoundingClientRect() okuması yapmakta,
    // bu durum tarayıcıda Layout Thrashing (Reflow) oluşturarak scroll FPS değerini düşürmektedir.
    ```
*   **Kırılma / Çakışma Analizi**: Dynamic JS koordinat hesabı kaldırıldığında inline `style={{ bottom: pos.bottom, right: pos.right }}` bağımlılığı tamamen kalkacaktır.
*   **Uygulanacak Değişiklik (Satır Satır)**:
    Eski dynamic JS koordinat matematiği silinir. Yerine projenin yerleşik ve throttle edilmiş `useScrollThrottle` hook'u entegre edilir. Klavye sekmelerinde premium odak çizgilerini korumak amacıyla `focus-visible:` standartları uygulanır ve tıklama sonrası odak `#main-content`'e taşınır.
    ```tsx
    'use client'

    import React from 'react'
    import { useI18n } from '../i18n/I18nProvider'
    import { useScrollThrottle } from '../hooks/useScrollThrottle'

    const BackToTopButton: React.FC = () => {
      const { t } = useI18n()
      
      // requestAnimationFrame ve 16ms throttle ile korunan scroll dinleyicisi
      const visible: boolean = useScrollThrottle({ 
        showAt: 400, 
        hideBelow: 300, 
        throttleMs: 16 
      })

      const handleScrollToTop = (): void => {
        const isReduced: boolean = typeof window !== 'undefined' && window.matchMedia('(prefers-reduced-motion: reduce)').matches
        window.scrollTo({
          top: 0,
          behavior: isReduced ? 'auto' : 'smooth'
        })
        
        // Focus Reset: Klavye navigasyonu odağını ana içeriğe taşır (Erişilebilirlik)
        const mainContent: HTMLElement | null = document.getElementById('main-content')
        if (mainContent) {
          mainContent.setAttribute('tabindex', '-1')
          mainContent.focus({ preventScroll: true })
        }
      }

      return (
        <button
          aria-label={t('common.backToTop')}
          onClick={handleScrollToTop}
          className={`bg-primary-navy hover:bg-secondary-blue text-white p-3 rounded-full shadow-lg transition-all duration-300 border border-white/20 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-primary-navy ${
            visible ? 'opacity-100 scale-100' : 'opacity-0 scale-75 pointer-events-none invisible'
          }`}
          tabIndex={visible ? 0 : -1}
          aria-hidden={!visible}
        >
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" aria-hidden="true">
            <polyline points="18 15 12 9 6 15" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
        </button>
      )
    }

    export default BackToTopButton
    ```

---

### 3. [MODIFY] [LanguageSwitcher.tsx](file:///c:/Users/alize/venthub-hvac/src/components/LanguageSwitcher.tsx)
*   **Değişecek Satır Aralığı**: Satır 44 - 46 arası.
*   **Mevcut Durum**:
    ```tsx
    <div
      id="language-switcher"
      className="fixed bottom-4 right-4 z-50 bg-white/90 backdrop-blur border border-light-gray rounded-full shadow-sm p-1 flex items-center gap-1"
      role="group"
      aria-label={t('common.languageSwitcher')}
    >
    ```
*   **Kırılma / Çakışma Analizi**: `fixed bottom-4 right-4 z-50` sınıfları bileşeni zorla sağ alta sabitlediği için flex akışına girmesini engelliyordu.
*   **Uygulanacak Değişiklik (Satır Satır)**:
    Bileşendeki `fixed bottom-4 right-4 z-50` konumlandırıcı sınıfları silinerek bileşen flex akışına bırakılır.
    ```tsx
    <div
      id="language-switcher"
      className="bg-white/90 backdrop-blur border border-light-gray rounded-full shadow-sm p-1 flex items-center gap-1"
      role="group"
      aria-label={t('common.languageSwitcher')}
    >
    ```

---

### 4. [MODIFY] [index.css](file:///c:/Users/alize/venthub-hvac/src/index.css)
*   **Değişecek Satır Aralığı**: Satır 237 - 245 arası.
*   **Mevcut Durum**:
    ```css
    .whatsapp-float {
      @apply fixed z-toast bg-emerald-500 text-white rounded-full shadow-2xl transition-[width,background-color,border-radius] duration-500 ease-in-out flex items-center justify-center border-2 border-white;
      bottom: 110px;
      right: 20px;
      width: 56px;
      height: 56px;
      overflow: hidden;
    }
    ```
*   **Kırılma / Çakışma Analizi**: `.whatsapp-float` içindeki hardcoded `bottom`, `right`, `fixed` ve `z-index` tanımları flex dikey sıralamasını bozmaktaydı.
*   **Uygulanacak Değişiklik (Satır Satır)**:
    Söz konusu tanımlar kaldırılarak dikey flex yapısına ve genişleme animasyonuna uyumlu hale getirilir.
    ```css
    .whatsapp-float {
      @apply bg-emerald-500 text-white rounded-full shadow-2xl transition-[width,background-color,border-radius] duration-500 ease-in-out flex items-center justify-center border-2 border-white;
      width: 56px;
      height: 56px;
      overflow: hidden;
    }
    ```

---

## 📦 Paket Temizliği, Sonner Entegrasyonu ve Intl Tarih Standardizasyonu

Platformun hafifletilmesi ve kurumsal standartların yakalanması için aşağıdaki 3 optimizasyon adım adım uygulanacaktır:

### 1. `react-error-boundary` Kaldırma
*   **Durum**: Projemizin kaynak kodundaki `src/components/ErrorBoundary.tsx` dosyası incelendiğinde; hata yakalama mantığının tamamen React'in yerleşik `Component` sınıfı (`getDerivedStateFromError`, `componentDidCatch` metotları) kullanılarak **tamamen el ile yazıldığı** doğrulanmıştır. Proje bu paketi **fiilen kullanmamaktadır**.
*   **Aksiyon**: `pnpm uninstall react-error-boundary` komutuyla temizlenecektir. Sıfır regresyon riski taşır.

### 2. `sonner` Entegrasyonu ve `react-hot-toast` Temizliği
*   **Durum**: Eski `react-hot-toast` kütüphanesi aktif olarak bildirimler için kullanılmaktadır.
*   **Aksiyon**: 
    1. `pnpm add sonner` kurulumu yapılacaktır.
    2. `src/components/layout/MainLayout.tsx` içindeki `<Toaster />` (react-hot-toast) kaldırılır ve yerine `sonner` kütüphanesinden import edilen `<Toaster richColors position="top-right" />` eklenir.
    3. Proje genelindeki tüm `import toast from 'react-hot-toast'` satırları `import { toast } from 'sonner'` olarak güncellenir. `toast.success()` ve `toast.error()` API'leri birebir uyumludur.
    4. Eski paket `pnpm uninstall react-hot-toast` ile tamamen silinir.

### 3. Yerleşik `Intl.DateTimeFormat` Tarih Standardizasyonu
*   **Durum**: Admin panelinde ve bazı arayüzlerde tarih formatlamak için harici kütüphaneler yerine native standart getirilmesi.
*   **Aksiyon**: `src/utils/formatDate.ts` adında optimize ve yerleşik bir yardımcı oluşturulacaktır:
    ```typescript
    export const formatDate = (date: string | Date, lang: string = 'tr'): string => {
      const locale = lang === 'en' ? 'en-US' : 'tr-TR';
      return new Intl.DateTimeFormat(locale, {
        day: 'numeric',
        month: 'long',
        year: 'numeric'
      }).format(new Date(date));
    };
    ```

---

## 🛠️ Regresyon Önleme ve Kontrol/Entegrasyon Planı (Integrity Verification)

Herhangi bir kırılma veya çakışma (regression) oluşmadığından %100 emin olmak amacıyla kod tabanında aşağıdaki kurumsal denetimler yapılacaktır:

1. **Tip Güvenliği Kontrolü (TSC)**:
   ```bash
   pnpm run type-check
   ```
   *Değiştirilen tüm bileşenlerin TypeScript derleme kurallarına tam uyduğu, zero-any ihlali olmadığı doğrulanır.*

2. **Statik Kod Analizi (ESLint)**:
   ```bash
   pnpm run lint
   ```
   *Kod standartlarımızın, özellikle Tailwind arbitrary value ve React 19 Compiler kurallarımızın ihlal edilmediği denetlenir.*

3. **Production Derleme Testi (Next.js Build)**:
   ```bash
   pnpm run build
   ```
   *Bütün sayfaların SSG/SSR bütünlüğü ve dynamic chunk'ların hatasız derlendiği garanti altına alınır.*

4. **Manuel Görsel ve Fonksiyonel Testler**:
   - Sayfa aşağı kaydırıldığında yukarı git butonunun akıcı bir şekilde belirmesi.
   - Tıklandığında odağı `#main-content`'e resetleyerek klavye odak düzenini bozmadan en yukarı çıkması.
   - Mobil görünümde Dil Seçici, WhatsApp ve Yukarı Git butonlarının üst üste çakışmadan düzgünce dikey flex hizalanması.
   - Reduced-motion desteğinin doğrulunması.
