/**
 * VentHub Enterprise Design System Tokens
 * RENKLER BURADA DEĞİL — src/index.css'te CSS variable olarak tanımlı.
 */

/**
 * Katman ölçeği — SSOT. Tek tek değiştirilmez; biri değişirse hepsi gözden geçirilir
 * (Bootstrap 5.3: "should you change one, you likely need to change them all").
 * Cetvel: docs/standards/admin-design-standard.md §4.9
 *
 * `popover` neden `modal`'ın ÜSTÜNDE? Radix menü/popover içeriği `body`'ye portal
 * ediliyor; `dropdown` (50) < `modal` (100) olduğu sürece bir modal içinden açılan
 * dropdown modalın ARKASINDA render olur. Carbon aynı gerekçeyle dropdown'ı modalın
 * üstüne alır: "Dropdowns that render outside of a Modal should render above a Modal."
 */
export const zIndex = {
  'raised':   '10',
  'dropdown': '50',    // LEGACY — yeni kodda `popover` kullan (ratchet ile eritilecek)
  'sticky':   '90',    // kabuk başlığı / yapışkan toolbar
  'backdrop': '95',    // modal perdesi
  'modal':    '100',   // modal · drawer · dialog
  'popover':  '110',   // menü · popover · dropdown · tooltip — modalın ÜSTÜNDE
  'toast':    '9999',  // bildirim (Bootstrap/Atlassian/MUI: toast > modal)
};

export const maxWidth = {
  'page':    '100rem',     // 1600px
  'content': '56.25rem',   // 900px
  'modal':   '26.25rem',   // 420px
  'prose':   '65ch',       // Cilt 2 / Typography SKILL satır uzunluğu
  '150px':   '150px',
  '140px':   '140px',
  '120px':   '120px',
  '200px':   '200px',
  '640px':   '640px',
  '92vw':    '92vw',
  '90vw':    '90vw',
  '55vh':    '55vh',
  '280px':   '280px',
  '60%':     '60%',
};

export const borderRadius = {
  'hvac-sm':  '0.375rem',  // 6px
  'hvac-md':  '1rem',      // 16px
  'hvac-lg':  '1.5rem',    // 24px
  'hvac-xl':  '2rem',      // 32px
  'hvac-2xl': '2.5rem',    // 40px
  'hvac-3xl': '3rem',      // 48px
  /**
   * Admin ölçeği — vitrin `hvac-*` ölçeği admin için fazla yuvarlak.
   * Kurumsal yakınsama (Radix / Tailwind / shadcn / Polaris): kontrol 4-8px,
   * kart 8-12px, modal 12-16px; 20px+ hiçbir sistemde standart bileşene atanmamış.
   * Cetvel: docs/standards/admin-design-standard.md §3.5
   */
  'admin-sm': '0.375rem',  // 6px  — buton · input · chip · badge
  'admin-md': '0.5rem',    // 8px  — kart · panel
  'admin-lg': '0.75rem',   // 12px — modal · dialog · geniş yüzey
};

export const fontSize = {
  'display': ['var(--font-size-display)', { lineHeight: '1.1' }],
  '7px': '7px',
  '5.5rem': '5.5rem',
};

export const boxShadow = {
  // Mevcut korunanlar
  'hvac':                  '0 4px 6px -1px rgba(30,64,175,0.1), 0 2px 4px -1px rgba(30,64,175,0.06)',
  'hvac-lg':               '0 10px 15px -3px rgba(30,64,175,0.1), 0 4px 6px -2px rgba(30,64,175,0.05)',
  'glass':                 '0 8px 32px 0 rgba(31,38,135,0.37)',
  // MD3 Elevation
  'elevation-1':           '0 1px 3px rgba(0,0,0,0.12), 0 1px 2px rgba(0,0,0,0.08)',
  'elevation-2':           '0 4px 12px rgba(0,0,0,0.15)',
  'elevation-3':           '0 10px 30px rgba(0,0,0,0.25)',
  'elevation-4':           '0 20px 50px rgba(0,0,0,0.35)',
  'elevation-5':           '0 30px 60px rgba(0,0,0,0.5)',
  // Admin yükseklik ölçeği — Y-KAYMASI OLAN gerçek gölgeler.
  // Admin kartlarında `shadow-[0_0_40px_rgba(0,0,0,0.3)]` kullanılıyordu:
  // Y-offset'i SIFIR, yani ışık kaynağı yok — bu gölge değil GLOW'dur ve
  // dört resmi token setinin (MD3, Tailwind, Radix, Polaris) hiçbirinde yok.
  // Açık zeminde ayrıca kirli bir hale bırakır. Cetvel §3.3 (yüzey/gölge) ve §3.8.1.
  'admin-sm':              '0 1px 2px rgba(16,24,40,0.06), 0 1px 3px rgba(16,24,40,0.10)',
  'admin-md':              '0 2px 4px -1px rgba(16,24,40,0.06), 0 4px 8px -2px rgba(16,24,40,0.10)',
  'admin-lg':              '0 4px 6px -2px rgba(16,24,40,0.05), 0 12px 16px -4px rgba(16,24,40,0.10)',
  'admin-overlay':         '0 8px 8px -4px rgba(16,24,40,0.04), 0 20px 24px -4px rgba(16,24,40,0.10)',
  // Glow (Dinamik CSS variable ile beslenen renkler - Kütüphaneci Onaylı)
  'glow-sm':               '0 0 10px var(--glow-color, rgba(34,211,238,0.3))',
  'glow-md':               '0 0 20px var(--glow-color, rgba(34,211,238,0.4))',
  'glow-lg':               '0 0 40px var(--glow-color, rgba(34,211,238,0.5))',
  // Utility
  'inset-deep':            'inset 0 0 100px rgba(0,0,0,0.5)',
  'ring':                  '0 0 0 2px',
  // Enterprise custom shadows
  'hvac-3d-glow':          '0 0 40px -10px rgba(56,189,248,0.25)',
  'access-denied-black':   '0 0 50px rgba(0,0,0,0.4)',
  'access-denied-rose':    '0 0 30px rgba(244,63,94,0.1)',
  'hvac-rail-1':           '0 18px 35px -30px rgba(15,23,42,0.45)',
  'hvac-rail-2':           '0 22px 40px -28px rgba(37,99,235,0.45)',
  'hvac-card-hover':       '0 40px 80px -20px rgba(0,0,0,0.08)',
  'hvac-card-hover-lg':    '0 40px 80px -20px rgba(0,0,0,0.06)',
  'hvac-light-shadow':     '0 2px 4px rgba(0,0,0,0.02)',
  'hvac-stat-card-hover':  '0 0 30px rgba(0,0,0,0.5)',
  'drawer-left':           '-20px 0 50px rgba(0,0,0,0.5)',
  'mega-menu':             '0 2px 10px rgba(0,0,0,0.1)',
  'mega-menu-viewport':    '0 38.5px 64.1px -10px rgba(0,0,0,0.1), 0 20.1px 33.5px -10px rgba(0,0,0,0.07)',
  'hvac-nav-rail':         '0 14px 30px -26px rgba(15,23,42,0.45)',
  'white-glow':            '0 0 40px rgba(255,255,255,0.2)',
  'white-glow-md':         '0 0 20px rgba(255,255,255,0.2)',
  'white-glow-lg':         '0 0 50px rgba(255,255,255,0.1)',
  'login-btn':             '0 20px 40px -15px rgba(37,99,235,0.4)',
  'login-btn-hover':       '0 25px 50px -15px rgba(37,99,235,0.5)',
  'series-card-hover':     '0 20px 40px -15px rgba(30,41,59,0.1)',
  'admin-categories-glow': '0 0 8px rgba(34,211,238,0.6)',
  'admin-coupons-glow-1':  '0 0 8px rgba(6,182,212,0.6)',
  'admin-coupons-glow-2':  '0 0 6px rgba(16,185,129,0.5)',
  'admin-orders-board-glow':'0 20px 60px rgba(34,211,238,0.4)',
  'admin-orders-glow-1':   '0 0 50px rgba(34,211,238,0.2)',
  'admin-orders-glow-2':   '0 0 20px rgba(34,211,238,0.2)',
  'admin-orders-glow-3':   '0 0 8px rgba(16,185,129,0.4)',
};

export const height = {
  // Admin kabuk başlığı — kurumsal yakınsamada yalnız iki değer var: 48px ve 56px
  // (Carbon 48 · Atlassian 48/56 · Polaris 56). Cetvel §2.4
  'admin-header': '3.5rem',  // 56px
  'hvac-input':   '40px',   // 5×8
  'hvac-thumb':   '72px',   // 9×8
  'hvac-card':    '300px',  
  'hvac-panel':   '400px',  
  'hvac-section': '500px',  
  'hvac-hero':    '600px',  
  'hvac-hero-lg': '700px',
  '500px':        '500px',
  '300px':        '300px',
  '42px':         '42px',
  '120%':         '120%',
  '150%':         '150%',
  '73px':         '73px',
  '400px':        '400px',
  '450px':        '450px',
  '800px':        '800px',
  '80vh':         '80vh',
  '90vh':         '90vh',
  '550px':        '550px',
  '70vh':         '70vh',
  '60vh':         '60vh',
  '568px':        '568px',
  '75vh':         '75vh',
};

export const minHeight = {
  'hvac-input':   '40px',
  'hvac-card':    '160px',  // 20×8
  'hvac-panel':   '300px',
  'hvac-section': '400px',
  'hvac-hero':    '600px',
  '300px':        '300px',
  '400px':        '400px',
  '120px':        '120px',
  '160px':        '160px',
  '140px':        '140px',
  '50vh':         '50vh',
  '88px':         '88px',
  '250px':        '250px',
  '320px':        '320px',
  '60vh':         '60vh',
  '100px':        '100px',
  '500px':        '500px',
  '220px':        '220px',
  '20vh':         '20vh',
  '30vh':         '30vh',
  '520px':        '520px',
  '700px':        '700px',
  '650px':        '650px',
  '600px':        '600px',
};

export const maxHeight = {
  /**
   * Admin modal tavanı. `svh` çünkü `vh` ≡ `lvh` — mobil araç çubuğu görünürken
   * `70vh`/`90vh` ile boyutlanan modal viewport'u taşar ve ortalanmış `fixed`
   * kutunun ÜST kısmı erişilemez hâle gelir (2026-08-15 taraması: 5 modalda ölçüldü).
   * Cetvel: docs/standards/admin-design-standard.md §2.2, §4.10
   */
  'admin-modal':  'calc(100svh - 2rem)',
  'hvac-menu':    '300px',
  'hvac-panel':   '480px',  // 60×8
  'hvac-modal':   '85vh',
  'hvac-drawer':  '90vh',
  'hvac-screen':  '100dvh',
  '90vh':         '90vh',
  '2000px':       '2000px',
  '85vh':         '85vh',
  '70vh':         '70vh',
  '450px':        '450px',
  '60vh':         '60vh',
  '300px':        '300px',
  '400px':        '400px',
  '500px':        '500px',
  '80vh':         '80vh',
  '50vh':         '50vh',
  '40vh':         '40vh',
};

export const width = {
  /**
   * Admin kabuk ölçüleri — kaynak yakınsaması (Carbon 256/48 · shadcn 256/288/48 ·
   * Polaris 240 · Atlassian 320 · M3 rail 80-96dp / drawer 360dp).
   * Cetvel: docs/standards/admin-design-standard.md §2.4
   */
  'admin-nav':    '16rem',  // 256px — genişletilmiş sol nav
  'admin-rail':   '3rem',   // 48px  — ikon rayı (collapsed)
  'admin-drawer': '18rem',  // 288px — mobil overlay drawer
  'hvac-menu':    '360px',  // 45×8 (toast, küçük panel)
  'hvac-modal':   '480px',  // 60×8
  'hvac-mega-sm': '500px',  
  'hvac-mega-md': '600px',  
  'hvac-mega-lg': '700px',
  '360px':        '360px',
  '500px':        '500px',
  '300px':        '300px',
  '600px':        '600px',
  '280px':        '280px',
  '150%':         '150%',
  '480px':        '480px',
  '320px':        '320px',
  '380px':        '380px',
  '400px':        '400px',
  '58%':          '58%',
  '420px':        '420px',
  '800px':        '800px',
  '3px':          '3px',
};

export const minWidth = {
  // Admin açılır menüsü — kural 8 gereği arbitrary değer (`min-w-[9rem]`) yasak.
  'admin-menu':   '9rem',   // 144px — üç seçenekli tema menüsünün rahat genişliği
  'hvac-btn':     '120px',  // 15×8
  'hvac-menu':    '140px',
  'hvac-select':  '200px',
  'hvac-sidebar': '240px',
  'hvac-panel':   '280px',
  '80px':         '80px',
  '200px':        '200px',
  '120px':        '120px',
  '280px':        '280px',
  '240px':        '240px',
  '1000px':       '1000px',
  '800px':        '800px',
  '900px':        '900px',
  '140px':        '140px',
  '160px':        '160px',
  '90px':         '90px',
  '320px':        '320px',
  '420px':        '420px',
  '220px':        '220px',
  '28px':         '28px',
  '40px':         '40px',
  '100px':        '100px',
  '1200px':       '1200px',
  '700px':        '700px',
  '110px':        '110px',
};

export const transitionDuration = {
  'hvac-fast':   '150ms',
  'hvac-normal': '250ms',
  'hvac-slow':   '600ms',
  'hvac-glacial':'2000ms',
  '1.5s':        '1500ms',
};

export const transitionTimingFunction = {
  'hvac-ease':   'cubic-bezier(0.16, 1, 0.3, 1)',
  'hvac-spring': 'cubic-bezier(0.34, 1.56, 0.64, 1)',
};

export const blur = {
  '80':  '80px',
  '100': '100px',
  '120': '120px',
  '150': '150px',
  '2':   '2px',
  '1':   '1px',
};

export const transitionProperty = {
  'opacity-transform':           'opacity, transform',
  'opacity-only':                'opacity',
  'filter-transform':            'filter, transform, opacity',
  'width-bg':                    'width, background-color',
  'width-height':                'width, height',
  'transform-shadow':            'transform, box-shadow',
  'border-shadow':               'border-color, box-shadow',
  'bg-transform-shadow':         'background-color, transform, box-shadow',
  'bg-transform':                'background-color, transform',
  'bg-shadow':                   'background-color, box-shadow',
  'bg-opacity-shadow-transform': 'background-color, opacity, box-shadow, transform',
  'border-transform':            'border-color, transform',
  'top-shadow':                  'top, box-shadow',
  'color-bg-shadow':             'color, background-color, box-shadow',
  'max-height-opacity':          'max-height, opacity',
  'width':                       'width',
};
