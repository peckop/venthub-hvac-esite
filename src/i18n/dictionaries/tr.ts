/**
 * ⛔ADMIN SÖZLÜĞÜ BURADAN İMPORT EDİLMEZ (REC-59 Faz 2, karar 47).
 *
 * Eskiden `import { admin } from './admin/tr'` satırı buradaydı ve sonucu canlıda ölçüldü
 * (2026-09-18): yönetim panelinin sözlüğü, müşteri sayfalarının indirdiği JS paketinin
 * içine giriyordu — `static/chunks/7681-*.js` 356.040 bayt ve ana sayfa bunu indiriyordu.
 * Müşteri "Kuponlar", "Stok Hareketleri", "Denetim Kaydı" gibi hiç görmeyeceği yazıları
 * her sayfada taşıyordu.
 *
 * Admin sözlüğü artık YALNIZ admin ekranlarında, dinamik import ile yükleniyor
 * (`I18nProvider.ensureAdminDict`). Tip tarafı kaybolmuyor: `I18nContext.ts` admin
 * sözlüğünü `import type` ile alır — tip-only import derlemede SİLİNİR, pakete girmez.
 *
 * Kapı: `src/i18n/__tests__/admin-sozlugu-vitrin-paketine-girmez.test.ts` (INV-ADMIN-SOZLUK-2).
 */

export const tr = {
  whatsappMessages: {
    greeting: 'Merhaba!',
    stockInquiry: 'Merhaba! {{product}} ürünü için stok durumu hakkında bilgi alabilir miyim?',
    stockInquiryWithSku: 'Merhaba! {{product}} (SKU: {{sku}}) ürünü için stok durumu hakkında bilgi alabilir miyim?',
    support: 'Merhaba! Size nasıl yardımcı olabilirim?',
    subjectLine: 'Konu: {{subject}}',
    quoteIntro: 'Merhaba! Teknik teklif talebi:',
    quoteProduct: 'Ürün: {{product}}',
    quoteProjectInfo: 'Proje Bilgileri: {{info}}',
    quoteAskProject: 'Proje detaylarınızı paylaşabilir misiniz?',
    faqSupport: 'Merhaba! SSS sayfasında aradığım bilgiyi bulamadım. Bana yardımcı olabilir misiniz?',
    contactIntro: 'Merhaba! Ben {{name}}.',
    contactHelp: 'Size nasıl yardımcı olabilirim?',
  },
  common: {
    technicalDrawing: 'Teknik Çizim',
    imagePreparing: 'Ürün görseli hazırlanıyor',
    errorGeneric: 'Bir hata oluştu',
    devMode: 'Geliştirici Modu',
    userFallback: 'Kullanıcı',
    paginationLabel: 'Sayfalama',
    paginationPrevious: 'Önceki',
    paginationNext: 'Sonraki',
    paginationStatus: 'Sayfa {{page}} / {{pageCount}}',
    update: 'Güncelle',
    unitMeters: '{{v}} m',
    unitCubicMeters: '{{v}} m³',
    unitNewton: '{{v}} N',
    dimensions3D: '{{l}}m × {{w}}m × {{h}}m',
    dimensions2D: '{{w}}m × {{h}}m',
    brand: 'VentHub',
    brandTagline: 'Ventilation & HVAC',
    // URN-83: şirket henüz kurulmadı; yasal unvan ("… Solutions." gibi) yazılmaz. Unvan kesinleşince bu değer
    // tescilli unvanla DEĞİŞİR (anahtar adı bu yüzden "LegalName" kaldı). Kullanan: giriş sayfası alt yazısı.
    brandLegalName: 'VentHub',
    vortice: 'Vortice',
    decrease: 'Azalt',
    increase: 'Artır',
    listingPrice: 'Liste Fiyatı',
    quickDetails: 'Hızlı Detaylar',
    scrollTo: 'bölümüne git',
    addToProject: 'Proje Listesine Ekle',
    loading: 'Yükleniyor...',
    categories: 'Kategoriler',
    products: 'Ürünler',
    brands: 'Markalar',
    about: 'Hakkımızda',
    contact: 'İletişim',
    knowledgeHub: 'Bilgi Merkezi',
    signOut: 'Çıkış Yap',
    signIn: 'Giriş Yap',
    signUp: 'Kayıt Ol',
    skipToContent: 'Ana içeriğe geç',
    search: 'Ara',
    allCategories: 'Tüm Kategoriler',
    adminPanel: 'Yönetim Paneli',
    backToSite: 'Siteye Dön',
    languageSwitcher: 'Dil Seçimi',
    turkish: 'Türkçe',
    english: 'İngilizce',
    discover: 'Keşfet',
    allProducts: 'Tüm Ürünler',
    exploreProducts: 'Ürünleri Keşfet',
    getQuote: 'Teklif Al',
    addToCart: 'Teklif için listeye ekle',
    categoryList: {
      residential: 'Konut Tipi Havalandırma',
      commercial: 'Ticari Havalandırma',
      industrial: 'Endüstriyel Havalandırma',
      hrv: 'Isı Geri Kazanım Üniteleri (VMC)',
      'air-treatment': 'Hava Şartlandırma',
      hygiene: 'Hijyen ve Sanitasyon',
      summer: 'Yaz Havalandırması (Vantilatörler)',
      ac: 'İklimlendirme (Klima)',
      heating: 'Elektrikli Isıtma',
      hvls: 'Endüstriyel Tavan Vantilatörleri',
      accessories: 'Aksesuarlar ve Bileşenler',
      'smart-home': 'Kontrol Sistemleri',
      'parking-jet': 'Otopark Jet Fanları',
      // REC-104/REC-103 (2026-09-01): DB'deki 23 aktif kategorinin 8'inin
      // `translation_key`'i bu sözlükte HİÇ YOKTU; ad çözümü sessizce `menu_label`/`name`
      // fallback'ine düşüyor ve /en sayfalarında TÜRKÇE ad basıyordu (canlıda ölçüldü:
      // /en ana sayfada "Fanlar" ve "Kontrol Sistemleri" Türkçe, anahtarı olan
      // "Air Curtains"/"Accessories" İngilizce). TR değerleri uydurma DEĞİL — DB'deki
      // mevcut `menu_label`'ların birebir kendisi, yani görünen TR ad değişmiyor.
      fans: 'Fanlar',
      'control-systems': 'Kontrol Sistemleri',
      sub: {
        bathroom: 'Banyo ve Tuvalet Fanları',
        window: 'Cam ve Pencere Tipi Fanlar',
        ghost: 'Kanal İçi Hayalet Fanlar',
        smoke: 'Duman Egzoz Fanları',
        jet: 'Otopark Jet Fanları',
        // Karar 288 (Recep, OPS-76): ad `categories.name`/`menu_label` ile aynı dize; adres (`radyal-fanlar`) ve anahtar değişmez.
        radial: 'Radyal (Santrifüj) Fanlar',
        roof: 'Çatı Tipi Fanlar',
        'axial-ind': 'Aksiyel Sanayi Fanları',
        'air-curtain': 'Hava Perdeleri',
        conditioning: 'İklimlendirme Çözümleri',
        'rect-duct': 'Dikdörtgen Kanal Tipi Fanlar',
        'round-duct': 'Yuvarlak Kanal Tipi Fanlar',
        exproof: 'Ex-Proof (ATEX) Fanlar',
        shelter: 'Sığınak Havalandırma Sistemleri',
        'acid-fans': 'Asit Dayanımlı Fanlar',
        'freq-converters': 'Frekans Konvertörleri',
        'duct-heaters': 'Elektrikli Kanal Isıtıcıları',
        dehumidifier: 'Nem Alma Cihazları',
        // REC-103: eksik 6 alt kategori (bkz. üstteki not).
        // ⭐`duct-fans` ile `ghost` AYRI: ghost = "Kanal İçi Hayalet Fanlar".
        // ⭐`water-coils` ile `duct-heaters` AYRI: biri sulu batarya, diğeri elektrikli.
        chimney: 'Şömine ve Baca Fanları',
        'duct-fans': 'Kanal Tipi Fanlar',
        'ducted-central-hrv': 'Kanallı Merkezi Üniteler',
        'single-room-hrv': 'Tekil Oda Üniteleri',
        'speed-controllers': 'Hız Anahtarları',
        'water-coils': 'Sulu Batarya Kanal Tipi',
        // REC-300 Faz 1-B (K17 ağacı, karar 78b + 84): anahtarı veritabanı migration'ı bağlar.
        // Korozyon dalı YENİ anahtara geçer (`acid-fans` değişmez) → ad ile adres aynı anda döner.
        // Karar 287 (Recep, OPS-74): ad `categories.name`/`menu_label` ve TR adresiyle (`korozyona-ve-aside-dayanimli-fanlar`) aynı.
        // Eski `acid-fans` anahtarı geri alma ve dağıtım penceresi için DURUR (canlıda yalnız bu dal kullanıyordu).
        'corrosion-fans': 'Korozyona ve Aside Dayanımlı Fanlar',
        'plug-fans': 'Plug Fanlar',
        'cabinet-fans': 'Hücreli Aspiratörler',
        'unheated-curtain': 'Isıtıcısız Hava Perdeleri',
        'electric-curtain': 'Elektrikli Isıtıcılı Hava Perdeleri',
        'spare-parts': 'Yedek Parça ve Sensörler'
      }
    },
    viewAll: 'Tümü',
    featured: 'Ürün Ailelerinden Örnekler',
    homeLabel: 'Ana Sayfa',
    notFound: 'Sonuç bulunamadı',
    searchPlaceholder: 'Ürün adı, marka...',
    seeAllProducts: 'Tüm Ürünleri Gör',
    back: 'Geri',
    backToTop: 'Başa dön',
    cancel: 'İptal',
    close: 'Kapat',
    noVisuals: 'Görsel Mevcut Değil',
    noImage: 'Görsel Yok',
    viewFullscreen: 'Tam ekran görüntüle',
    view3D: '3D görüntüle',
    prev: 'Önceki',
    next: 'Sonraki',
    remove: 'Kaldır',
    more: 'Daha Fazla',
    save: 'Kaydet',
    saving: 'Kaydediliyor...',
    edit: 'Düzenle',
    delete: 'Sil',
    actions: 'İşlemler',
    status: 'Durum',
    date: 'Tarih',
    amount: 'Tutar',
    id: 'ID',
    all: 'Tümü',
    none: 'Yok',
    yes: 'Evet',
    no: 'Hayır',
    whatsappAriaLabel: 'WhatsApp ile yaz',
    whatsappTitle: 'WhatsApp ile yaz',
    whatsappTooltip: '',
    whatsappSupportMessage: 'Web sitesinden destek talebi',
    pdf: 'PDF',
    sku: 'SKU',
    share: 'Paylaş',
    requestQuote: 'Teklif İste',
    // REC-115: `common.officialGuarantee` ve `common.fastDelivery` KALDIRILDI —
    // tek tüketicileri ölü bileşen CategoryHero'ydu, o da silindi (INV-6 ölü anahtar).
    // NOT: `category.trustSignals.fastDelivery` AYRI bir anahtardır ve YAŞIYOR.
    series: 'Ürün Ailesi',
    reset: 'Sıfırla',
    whatsapp: {
      faqSupportMessage: 'Sıkça Sorulan Sorular sayfasında aradığım cevabı bulamadım...',
      supportMessageDefault: 'Merhaba, VentHub HVAC ile iletişime geçmek istiyorum.',
    }
  },
  homeShowcase: {
    slide1: {
      title: 'Fan, hava perdesi ve ısı geri kazanım',
      subtitle: 'Ürün Seçici ile ön değerlendirme yapın'
    },
    slide2: {
      title: 'Fan, Konvertör, Isı Geri Kazanım',
      subtitle: 'Katalogdaki modellerden örnekler'
    },
    slide3: {
      title: 'İhtiyaçlarınıza Göre Yönlendirme',
      subtitle: 'Uygulama alanına göre keşfedin ve doğru kategoriye hızla ulaşın'
    },
    prevAria: 'Önceki',
    playAria: 'Oynat',
    pauseAria: 'Duraklat',
    nextAria: 'Sonraki'
  },
  products: {
    // REC-338 — keşif listesinin (`/[lang]/products`) KENDİ başlığı ve açıklaması.
    // Eskiden bu rotanın `generateMetadata`'sı HİÇ YOKTU: canlı ölçümde (2026-09-14)
    // `/tr/products` ve `/en/products` kök layout'un varsayılan başlığını basıyordu
    // ve `rel="canonical"` etiketi de yoktu.
    discovery: {
      seoTitle: 'Tüm Ürünler | Endüstriyel Havalandırma ve HVAC — VentHub',
      seoDesc: 'Ürün aileleri tek listede: fanlar, ısı geri kazanım, hava perdeleri, frekans konvertörleri ve aksesuarlar. Mühendislik destekli seçim; sipariş için teklif istenir.',
    },
    orbital: {
      dragHint: 'Tut Çevir',
      tapProductHint: 'Ürüne Tıkla',
      swipeHint: 'Sol-Sağ Çevir',
      pickCategoryHint: 'Kategoriyi Seç',
      discoverTitle: 'Ürün Yelpazemizi Keşfedin',
      subcategoriesTitle: '{{name}} Alt Kategorileri',
      openMainDesktop: 'Tek tık: Kategoriyi Aç • Çift tık: Sayfaya Git',
      openMainTouch: 'Dokun: Aç • Çift Dokun: Git',
      openSubDesktop: 'Tıklayarak Ürün Sayfasına Gidin',
      openSubTouch: 'Dokunarak Sayfaya Gidin',
    },
    radialMenu: {
      subcategoriesCount: 'Alt Kategoriler ({{count}})',
      noSubcategories: 'Alt Kategori Yok',
      viewProducts: 'Ürünleri Gör',
    },
    category3DIcon: {
      dragHint: 'Tut Çevir',
    },
    smartInference: {
      aiInsightBadge: 'ÜRÜN BİLGİSİ',
    },
    blueprint: {
      scanning: 'Şablon taranıyor...',
      objectReference: 'Nesne Referansı: P-501',
      cinematicMode: 'Sinematik Mod',
    },
    addToProject: {
      closeModal: 'Modalı kapat',
      existingProjects: 'Mevcut Projelerim',
      noProjects: 'Henüz bir projeniz bulunmuyor.',
      createNewProject: 'Yeni Proje Oluştur',
      projectNamePlaceholder: 'Proje Adı (Örn: Ofis Binası Havalandırması)',
      cancel: 'İptal Et',
      footerHint: 'Projelerinizi hesabım sayfasından yönetebilirsiniz.',
    },
    allProductsTitle: 'Tüm Ürünlerimiz',
    systemTotalPrefix: 'Katalogdaki tüm',
    viewGrid: 'Izgara',
    viewList: 'Liste',
    emptyTitle: 'Ürün Bulunamadı',
    emptyDesc: 'Daha fazla ürün görmek için kategorilerden birini seçin.',
    heroTitle: 'Fan, hava perdesi, ısı geri kazanım ve kontrol ürünlerini keşfedin: mühendislik odaklı seçim',
    heroSubtitle: 'Kategorilerden ya da marka sayfalarından ürün ailesine ulaşın; arama alanına model adı ya da kodu yazın.',
    itemsListed: 'ürün listeleniyor',
    // REC-115: `products.resultsFound` KALDIRILDI — tek tüketicisi CategoryHero'ydu.
    popularCategories: 'Ana Kategoriler',
    hubTitle: 'HVAC Ürün Aileleri',
    searchPlaceholder: 'Ürün veya model ara...',
    noResults: 'Sonuç Bulunamadı',
    clearFilters: 'Filtreleri Temizle',
    heroAlt: 'HVAC Ürünleri Keşif Görseli',
    searchAriaLabel: 'Ürün Arama',
    searchHelp: 'Detaylı filtreler için yazmaya başlayın.'
  },
  search: {
    overlay: {
      enterKey: 'Enter ↵',
      arrowUp: '↑',
      arrowDown: '↓',
    },
    recentSearches: 'Son Aramalar',
    clearRecent: 'Temizle',
    popularCategories: 'Ana Kategoriler',
    noResults: 'Sonuç bulunamadı',
    keyboardHint: 'Ok tuşları ile gezinebilirsiniz',
    // REC-340: Enter artık "tüm sonuçlar"a değil, SEÇİLİ kaleme gider — arama tek aşamalı.
    enterHint: 'Seçmek için',
    // `placeholderAi` SİLİNDİ (REC-340 Faz 0) — "yapay zeka destekli arama" diyordu ve
    // arkasında yapay zeka yoktu. Ölü bırakılmadı, kaldırıldı; tek tüketicisi
    // `SearchOverlay` artık aşağıdaki doğru metni kullanıyor.
    placeholder: 'Ürün, kategori veya marka ara...',
    noResultsAdvice: 'Farklı anahtar kelimeler deneyin',
    // Arama isteği HATA verdiğinde (boş sonuçtan ayrı): müşteriye "ürün yok" denmez.
    failed: 'Arama şu an yapılamadı.',
    retry: 'Tekrar dene',
    brandPrefix: 'Marka: ',
    fuzzyMatchNotice: 'Tam eşleşme bulunamadı, benzer sonuçlar gösteriliyor.',
    // Arama 600 ms'yi geçince (karar 59 ölçümü: sunucu ara sıra 1–3 sn duraklıyor) önceki
    // sonuçlar ekranda kalır, üstünde bu satır belirir — boş ekran + dönen yuvarlak yerine.
    slowHint: 'Aranıyor, sonuçlar geliyor…'
  },
  knowledge: {
    hub: {
      title: 'Havalandırma Ürünü Seçerken',
      subtitle: 'Rehber yazılarını okuyun, Ürün Seçici ile hacim ve debi değerlerinizden ön değerlendirme yapın.',
      // REC-113: TR yüzeyde EN sızıntısıydı. Komşu üst-başlıkların üslubu büyük harfli
      // Türkçe ('MÜHENDİSLİK ODAK NOKTASI'); karşılık ona uyduruldu.
      eyebrow: 'REHBER YAZILARI',
      searchPlaceholder: 'Rehber yazılarında ara...',
      readStart: 'Okumaya Başla',
      heroAlt: 'Havalandırma rehber yazıları sayfası görseli',
      readTime: '{{count}} dk okuma',
      // ⛔ESKİ ANAHTARLAR KALDIRILDI (2026-09-05): calculatorsSoon · selectorSoon ·
      // inDevelopment · inPlanning. Hepsi VAR OLAN bir şeyi "yakında" diye ilan ediyordu:
      // dört hesaplayıcı canlıda çalışıyor, Ürün Seçici girişi de aynı gün yayına girdi.
      // K1: "'Yakında', boş dal, vaat kutusu YOK; vitrin yalnız var olanı gösterir."
      selectorTitle: 'Ürün Seçici',
      selectorDesc: 'Kanal, ısı geri kazanım, hava perdesi ve jet fan hesaplarını tek yerden yapın.',
      selectorCta: 'Ürün Seçici’yi aç',
      notFoundTitle: 'Aradığınız teknik bilgiyi bulamadınız mı?',
      notFoundDesc: 'Sorunuzu iletişim formu ya da info@venthub.com.tr üzerinden iletebilirsiniz.',
      contactExpert: 'İletişime Geçin',
      categories: {
        comfort: 'Konfor',
        safety: 'Güvenlik',
        efficiency: 'Verimlilik'
      }
    },
    tags: {
      all: 'Tümü',
      havaPerdesi: 'Hava Perdesi',
      jetFan: 'Jet Fan',
      hrv: 'HRV/ERV'
    },
    topic: {
      warnBadge: '!',
      eyebrow: 'Teknik Bilgi',
      notFoundTitle: 'Bilgi bulunamadı',
      notFoundDesc: 'Aradığınız konu henüz eklenmemiş olabilir.',
      backToHub: 'Merkeze dön',
      stepsTitle: '3 adımda seçim',
      pitfallsTitle: 'Sık hatalar',
      toProducts: 'İlgili ürünlere git',
      getQuote: 'Teklif Al'
    },
    topics: {
      'air-curtain': {
        title: 'Hava Perdesi Seçimi',
        image: '/images/hvac_installation_close_up_premium_3.webp',
        summary: 'Hava perdesi seçimini kapı genişliği, kapının yerden yüksekliği ve girişte ısıtma isteyip istemediğiniz belirler.',
        steps: ['Kapı genişliğini ölçün; seçim kapı genişliğine göre yapılır.', 'Kapının yerden yüksekliğini ölçün; montajın kapı üstüne yapılıp yapılamayacağını kontrol edin.', 'Girişte ısıtma isteyip istemediğinize karar verin: ısıtmasız modeller yalnızca hava akımı oluşturur, elektrikli ısıtıcılı modeller girişi ayrıca ısıtır.'],
        pitfalls: ['Kapı genişliğini dikkate almadan seçim', 'Isıtmasız modelden ısıtma beklemek', 'Montaj yüksekliğini kontrol etmeden seçmek']
      },
      'jet-fan': {
        title: 'Jet Fan (Otopark)',
        image: '/images/hvac_installation_close_up_premium_3.webp',
        summary: 'Jet fanlar kapalı alanlarda havayı yönlendirir. Katalogda jet fan ürünü yok; hesaplayıcı Ürün Seçici\'dedir.',
        steps: ['Debi: Hacim × ACH (ör. 7.200 m³ × 8 ACH ≈ 57.600 m³/h).', 'İtme kuvveti mesafe ve plana göre seçilir; hesaplayıcı Ürün Seçici\'dedir.', 'Hesap sonucu ön değerlendirmedir; kesin seçim için teklif isteyin.'],
        pitfalls: ['Kör hacim bırakmak', 'Sensör kapsamasını atlamak']
      },
      hrv: {
        title: 'Isı Geri Kazanım (HRV/ERV)',
        image: '/images/heat_recovery_ventilator_hrv_system_diagram.jpg',
        summary: 'Taze havayı ısı geri kazanımı ile sağlayan cihazlar; seçimde debi, verim/SFP ve harici statik basınç kritik.',
        steps: ['Debiyi (m³/h) Ürün Seçici\'nin ısı geri kazanım (HRV) hesabında hacim ve debi girdileriyle belirleyin.', 'Verim ve SFP değerlerini ürünün teknik föyünden karşılaştırın.', 'Basınç: filtre/kanal kayıplarına uygun harici statik basınç.'],
        pitfalls: ['Yüksek verime bakıp harici statik basıncı atlamak']
      },
      'hava-perdesi': {
        pitfalls: ['Kapı genişliğini dikkate almadan seçim', 'Isıtmasız modelden ısıtma beklemek', 'Montaj yüksekliğini kontrol etmeden seçmek'],
        steps: ['Kapı genişliğini ölçün; seçim kapı genişliğine göre yapılır.', 'Kapının yerden yüksekliğini ölçün; montajın kapı üstüne yapılıp yapılamayacağını kontrol edin.', 'Girişte ısıtma isteyip istemediğinize karar verin: ısıtmasız modeller yalnızca hava akımı oluşturur, elektrikli ısıtıcılı modeller girişi ayrıca ısıtır.'],
        summary: 'Hava perdesi kapı açıklığı boyunca aşağı doğru hava akımı üretir; mağaza ve market girişi tipik kullanım alanıdır.',
        title: 'Hava Perdesi'
      }
    }
  },
  // BİLGİ MERKEZİ (karar 92, 2026-09-24) — rehber yazılarının liste ve yazı sayfası şablonu.
  // Yazıların kendi metni sözlükte DEĞİL (src/data/bilgiMerkezi/yazilar.ts; ileride DB tablosu):
  // burada yalnız şablonun sabit metinleri durur (rehber-yazisi-standard.md R3).
  bilgiMerkezi: {
    ad: 'Bilgi Merkezi',
    anaSayfa: 'Ana sayfa',
    liste: {
      seoBaslik: 'Bilgi Merkezi — Havalandırma Rehber Yazıları | VentHub',
      seoAciklama: 'Havalandırma ürünlerini seçerken sorulan soruların cevapları: nasıl çalışır, nasıl seçilir, nelere dikkat edilir.',
      baslik: 'Bilgi Merkezi',
      altBaslik: 'Havalandırma ürünlerini seçerken sorulan soruların cevapları: nasıl çalışır, nasıl seçilir, nelere dikkat edilir.',
      aramaEtiketi: 'Yazılarda ara',
      aramaYerTutucu: 'Konu ya da terim yazın',
      sonucYok: 'Aramanıza uyan yazı bulunamadı.',
      oku: 'Yazıyı oku',
      bosBaslik: 'Rehber yazıları',
      bosAciklama: 'Rehber yazıları yayımlanmaya devam ediyor. Ürün Seçici ile kanal, ısı geri kazanım, hava perdesi ve jet fan hesaplarını yapabilirsiniz.',
      seciciBaslik: 'Ürün Seçici',
      seciciAciklama: 'Kanal, ısı geri kazanım, hava perdesi ve jet fan hesaplarını tek yerden yapın.',
      seciciDugme: 'Ürün Seçici’yi aç',
    },
    yazi: {
      yazar: 'VentHub',
      okumaSuresi: '{{count}} dakika okuma',
      guncelleme: 'Güncelleme',
      icindekiler: 'İçindekiler',
      urunlerBaslik: 'İlgili ürün aileleri',
      urunDugme: 'Aileyi incele',
      ilgiliBaslik: 'İlgili yazılar',
      teklifBaslik: 'Projeniz için teklif alın',
      teklifAciklama: 'İhtiyacınızı iletişim formundan yazın; uygun ürün için teklif hazırlayalım.',
      teklifDugme: 'Teklif iste',
      listeyeDon: 'Bilgi Merkezi’ne dön',
    },
    // REC-452: kategori ve aile sayfasının altındaki rehber bağlantıları + ana sayfa bilgi bloğu.
    ilgiliRehberler: 'Bu konudaki rehber yazıları',
    sonRehberler: 'Son rehber yazıları',
    konular: {
      konfor: 'Konfor',
      guvenlik: 'Güvenlik',
      verimlilik: 'Verimlilik',
    },
  },
  meta: {
    siteTitle: 'VentHub | Endüstriyel Havalandırma ve HVAC Mühendislik Çözümleri',
    siteDesc: 'Kanal fanı, hava perdesi ve ısı geri kazanım ürünleri; mühendislik destekli ürün seçimi. Ürün Seçici ile kanal fanı, HRV, hava perdesi ve jet fan hesapları.',
  },

  // 404 sayfası (src/app/not-found.tsx). Next.js'in hazır sayfası İngilizce metin + ikinci bir
  // <title> basıyordu (2026-09-24 canlı ölçüm: /tr/... adresinde iki başlık).
  sayfaBulunamadi: {
    baslik: 'Sayfa bulunamadı',
    aciklama: 'Aradığınız sayfa taşınmış ya da kaldırılmış olabilir. Ürünlere göz atabilir ya da ana sayfaya dönebilirsiniz.',
    anaSayfa: 'Ana sayfaya dön',
    urunler: 'Ürünlere göz at',
  },

  home: {
    seoTitle: 'VentHub | Fan, Hava Perdesi ve Isı Geri Kazanım Ürün Kataloğu',
    seoDesc: 'Fan, hava perdesi ve ısı geri kazanım ürünlerinin teknik özellikleri; mühendislik destekli seçim için kanal fanı, HRV, hava perdesi ve jet fan hesaplayıcıları. Teklif isteyin.',
    hero: {
      eyebrow: 'Mühendislik Odaklı HVAC Ürün Kataloğu',
      title: 'Doğru ürün ailesini kategoriden bulun.',
      titleLineOne: 'Doğru ürün ailesini',
      titleLineTwo: 'kategoriden bulun.',
      subtitle: 'Kategori listesinden ürün ailesine geçin ve teklif formuna ulaşın.',
      primaryCta: 'Ürünleri Keşfet',
      secondaryCta: 'Teklif İste',
      quickAccessLabel: 'Hızlı Erişim',
      visualAlt: 'VentHub endüstriyel HVAC çözüm görseli',
      visualEyebrow: 'Kategori Seçimi',
      visualTitle: 'Kategoriden başlayın, ürün ailesine geçin.',
      visualSubtitle: 'Ürün ailelerine kategoriye göre ulaşın, Ürün Seçici ile ön değerlendirme yapın, teklif isteyin.',
      visualPoints: {
        selection: 'Ürün ailelerine kategoriye göre erişim',
        routing: 'Teklif için iletişim formu ve e-posta'
      },
      metrics: {
        coreCategories: 'ana kategoriden başlayın',
        productSeries: '{{count}} ürün ailesine geçiş',
        entryPaths: 'uygulamadan ürün ailesine geçiş'
      },
      trustStrip: {
        authorizedBrands: 'Marka ve model kataloğu',
        engineeringSupport: 'Ürün Seçici araçları',
        nationwideDelivery: 'Teklif üzerinden sipariş',
        projectGuidance: 'Teknik özellik tabloları'
      },
      quickChips: {
        fans: 'Fanlar',
        airCurtains: 'Hava Perdeleri',
        heatRecovery: 'Isı Geri Kazanım',
        speedControl: 'Hız Kontrol',
        quote: 'Teklif İste'
      },
      categorySummaries: {
        fans: 'ATEX, endüstriyel ve ticari fan ailelerini yan yana karşılaştırın.',
        airCurtains: 'Giriş konforu ve enerji kaybı kontrolü için doğru hava perdesi ailesine yaklaşın.',
        heatRecovery: 'Kanallı merkezi ve tekil oda tipi ısı geri kazanım ailelerini karşılaştırın.',
        speedControl: 'Hız anahtarları ve frekans konvertörleri.'
      },
      sinevizyon: {
        altMain: 'VentHub Endüstriyel Havalandırma Sistemleri',
        altProduct: 'VentHub Ürün Ailesi',
        slides: [
          {
            eyebrow: 'VORTICE · AERODİNAMİK TASARIM',
            title: 'Vortice Lineo ve Lineo Quiet',
            subtitle: 'Kanal içine takılan karma akışlı fanlar: standart Lineo ve ses emici kaplamalı Lineo Quiet.',
            products: [
              {
                label: 'Vortice Lineo',
                subLabel: 'Kanal Tipi Karma Akışlı Fan'
              },
              {
                label: 'Lineo Quiet',
                subLabel: 'Ses Emici Kaplamalı'
              }
            ]
          },
          {
            eyebrow: 'SESSİZ ÇALIŞMA',
            title: 'Vortice Lineo Quiet: Ses Emici Gövde',
            subtitle: 'Ses emici kaplama dış gövdeye entegre; AC motorlu LINEO QUIET ve EC motorlu LINEO QUIET ES olarak iki seçenek.',
            products: [
              {
                label: 'Ses Emici Kaplama',
                subLabel: 'Dış Gövdeye Entegre'
              },
              {
                label: 'EC Fırçasız Motor',
                subLabel: 'LINEO QUIET ES modellerinde'
              }
            ]
          },
          {
            eyebrow: 'MONTAJ VE KULLANIM',
            title: 'Konut, Ticari ve Endüstriyel Kullanım',
            subtitle: 'Kanal içine yatay ya da dikey monte edilebilen karma akışlı fan; üç hızlı endüksiyon motoru vardır.',
            products: [
              {
                label: 'Kanal İçi Montaj',
                subLabel: 'Yatay veya Dikey'
              },
              {
                label: 'Üç Hızlı Motor',
                subLabel: 'Endüksiyon Motorlu'
              }
            ]
          }
        ]
      }
    },
    cinematicShowcase: {
      // REC-113: dekoratif HUD metni ama YİNE DE ekranda okunan Türkçe-sayfa metnidir.
      // Noktalı "makine" üslubu korunarak çevrildi.
      hudStatus: 'Ürün ailesi',
      eyebrow: 'KANAL TİPİ KARMA AKIŞLI FAN',
      title: 'Vortice Lineo Quiet Ürün Ailesi',
      subtitle: 'Ses emici kaplaması dış gövdeye entegre, karma akışlı kanal fanı.',
      description: 'AC endüksiyon motorlu LINEO QUIET ve EC fırçasız motorlu LINEO QUIET ES modelleri vardır; üreticiye göre EC fırçasız model düşük enerji tüketimi sağlar.',
      cta: 'Teknik Verileri İncele',
      badge: 'AC / EC MOTOR',
      componentLabel: 'Sistem Bileşeni',
      // URN-80: görsel alt metinleri — görselin ne gösterdiğini söyler, üstünlük iddiası taşımaz.
      imageAlt: {
        airflow: 'Vortice Lineo serisi kanal tipi fan, hava akışı çizgileriyle',
        side: 'Vortice Lineo serisi kanal tipi fan, yandan görünüm'
      },
      hotspots: {
        motor: 'EC ve AC Motor Seçenekleri',
        motorDetail: 'Üreticiye göre EC fırçasız LINEO QUIET ES düşük enerji tüketimi sağlar.',
        clamps: 'Kanal Bağlantısı',
        clampsDetail: 'Modeller farklı çap seçenekleriyle sunulur.',
        housing: 'Ses Emici Kaplama',
        housingDetail: 'Ses emici kaplama dış gövdeye tamamen entegre edilmiştir.',
        airflow: 'Karma Akışlı Fan',
        airflowDetail: 'Lineo Quiet, kanal tipi karma akışlı bir fandır.'
      }
    },
    quickEntry: {
      eyebrow: 'BAŞLANGIÇ NOKTASI',
      title: 'Kategori, hesap ya da teklifle başlayın',
      subtitle: 'Ürün kategorilerine göz atın, Ürün Seçici ile ön değerlendirme yapın ya da teklif isteyin.',
      items: {
        category: {
          title: 'Kategoriye Göre İncele',
          description: 'ATEX fanlardan sessiz kanal fanlarına, ürün ailelerini teknik verileriyle inceleyin.'
        },
        application: {
          title: 'Uygulama Senaryoları',
          description: 'Kapı girişleri için hava perdeleri, korozif gaz tahliyesi için PP fanlar, kanal fanları.'
        },
        support: {
          title: 'Ürün Seçici',
          description: 'Kanal fanı, ısı geri kazanım, hava perdesi ve jet fan hesaplarını yapın.'
        },
        quote: {
          title: 'Proje Bazlı Teklif Al',
          description: 'İhtiyacınızı iletişim formundan ya da info@venthub.com.tr adresinden iletin.'
        }
      }
    },
    guidedDiscovery: {
      eyebrowLabel: 'HAVALANDIRMA ÇÖZÜMLERİ',
      heading: 'Kategoriye Göre Havalandırma Ürünleri',
      intro: 'Fan, hava perdesi, ısı geri kazanım ve kontrol sistemi ürün ailelerini ve modellerini inceleyin.',
      cardFallback: 'Havalandırma Ürünleri',
      eyebrow: 'HAVALANDIRMA ÇÖZÜMLERİ',
      title: 'Kategoriye Göre Havalandırma Ürünleri',
      subtitle: 'Kategoriyi seçin, ürün ailelerini inceleyin; teklif için iletişim formunu ya da e-postayı kullanın.',
      seriesCount: '{{count}} Ürün Ailesi',
      categoryFallback: 'Bu kategorideki ürün ailelerini ve modelleri inceleyin.',
      panelEyebrow: 'ADIM ADIM',
      panelTitle: 'Kategoriden ürüne ve teklife',
      panelBody: 'Ürün sayfalarında teknik özellik tabloları bulunur. Teklif ve sorularınızı iletişim formu ya da info@venthub.com.tr ile iletebilirsiniz.',
      panelFallback: 'Bu kategorideki ürün ailelerini ve her ailenin modellerini görüntüleyin.',
      primaryCta: 'KATEGORİYİ AÇ',
      secondaryCta: 'Uygulama Senaryolarına Bak',
      seriesEyebrow: 'AİLE HIZLI ERİŞİM',
      seriesTitle: '{{category}} kategorisindeki ürün aileleri',
      seriesFallback: 'Bu ürün ailesinin modellerini ve teknik özelliklerini inceleyin.',
      footerNote: 'Kategori seçimi burada başlar; model ayrıntıları ürün sayfasındadır.',
      steps: {
        select: {
          title: 'Kategoriyi Seçin',
          description: 'Fanlar, hava perdeleri, ısı geri kazanım veya kontrol sistemleri gibi ana kategorilerden başlayın.'
        },
        compare: {
          title: 'Ürün Ailesini Seçin',
          description: 'Örneğin fanlarda kanal, çatı, aksiyel ve ATEX ürün ailelerinden birini seçin.'
        },
        convert: {
          title: 'Ürünü Seçin, Teklif İsteyin',
          description: 'Ürün sayfasındaki teknik özellik tablosuna bakın; uygun modeli bulunca teklif isteyin.'
        }
      },
      loading: 'Kategoriler hazırlanıyor...'
    },
    applicationSolutions: {
      eyebrow: 'Senaryo Odaklı Çözümler',
      title: 'Yalnız üründen değil, kullanım senaryosundan da başlayabilirsiniz.',
      subtitle: 'Mağaza girişi için hava perdesi; ısı geri kazanım için kanallı merkezi veya tekil oda üniteleri.',
      viewAll: 'Tümünü Gör',
      items: {
        entrance: {
          eyebrow: 'Giriş Konforu',
          title: 'Mağaza girişi ve hava perdesi çözümleri',
          description: 'Mağaza, restoran ve depo kapılarında kapı boyunca aşağı üflenen hava akımı, içerideki havayı dışarıdan ayırır.',
          point1: 'Kapı ölçüsüne göre seçim',
          point2: 'Isıtmasız veya elektrikli ısıtıcılı'
        },
        comfort: {
          eyebrow: 'Isı Geri Kazanım',
          title: 'Kanallı merkezi ve tekil oda üniteleri',
          description: 'Ürün Seçici\'de ısı geri kazanım (HRV) hesabı yapılır; sonuç ön değerlendirmedir.',
          point1: 'Kanallı merkezi ısı geri kazanım ürün aileleri',
          point2: 'Tekil oda ısı geri kazanım ürün aileleri'
        }
      }
    },
    featuredCommercial: {
      eyebrow: 'Ürün Vitrini',
      title: 'Fanlar ve Havalandırma Ürünleri',
      subtitle: 'Katalogdan modelleri sekmelerden seçerek inceleyin.',
      cta: 'Tüm Ürün Ailelerini İncele',
      panelEyebrow: 'Teknik Odak',
      tabs: {
        featured: 'Modeller',
        newArrivals: 'Diğer Modeller',
        bestSellers: 'Daha Fazla Model',
        airCurtains: 'Hava Perdeleri',
        heatRecovery: 'Isı Geri Kazanım'
      },
      panelTitles: {
        featured: 'Katalogdan Modeller',
        newArrivals: 'Katalogdan Modeller',
        bestSellers: 'Katalogdan Modeller',
        airCurtains: 'Hava Perdesi Modelleri',
        heatRecovery: 'Isı Geri Kazanımı'
      },
      panelDescriptions: {
        featured: 'Katalogdan modeller ve teknik özellikleri; ayrıntılar ürün sayfasında.',
        newArrivals: 'Katalogdan modeller ve teknik özellikleri; ayrıntılar ürün sayfasında.',
        bestSellers: 'Katalogdan modeller ve teknik özellikleri; ayrıntılar ürün sayfasında.',
        airCurtains: 'Kapı boyunca üflenen hava akımıyla içerideki havayı dışarıdan ayıran hava perdeleri; ısıtıcısız ve elektrikli ısıtıcılı modeller.',
        heatRecovery: 'Kanallı merkezi ve tekil oda tipinde ısı geri kazanım üniteleri.'
      }
    },
    trustProof: {
      eyebrow: 'Katalog ve Araçlar',
      title: 'Katalog, Ürün Seçici ve Teklif',
      subtitle: 'Fan, hava perdesi, ısı geri kazanım ve frekans konvertörü modellerini inceleyin; hacim, debi ve basınç değerlerinizle ön değerlendirme yapın; teklif isteyin.',
      badge: 'VENTHUB\'DA',
      visualAlt: 'Tavana asılı dikdörtgen ve yuvarlak havalandırma kanalları',
      items: {
        brands: {
          eyebrow: 'Katalog',
          title: 'Markalar ve Modeller',
          description: 'AVenS, Casals, Danfoss, Nicotra Gebhardt, SEAT ve Vortice ürün aileleri ve modelleri, teknik özellik tablolarıyla.'
        },
        guidance: {
          eyebrow: 'Hesap',
          title: 'Ürün Seçici ile Ön Hesap',
          description: 'Hacim, debi ve basınç gibi değerlerinizi girin; kanal fanı, ısı geri kazanım, hava perdesi ve jet fan hesaplayıcıları ön değerlendirme yapar.'
        },
        delivery: {
          eyebrow: 'Lojistik',
          title: 'Teslimat Planlaması',
          description: 'Teslimat süresi ve sevkiyat koşulları, teklif aşamasında projenize göre netleştirilir.'
        },
        support: {
          eyebrow: 'İletişim',
          title: 'Teklif İsteyin, Soru Sorun',
          description: 'Teklif ve sorularınızı iletişim formu ya da info@venthub.com.tr ile iletebilirsiniz. Teknik özellikler ürün sayfalarında yer alır.'
        }
      }
    },
    strategicBrands: {
      eyebrow: 'Katalogdaki Markalar',
      title: 'Fan, hava perdesi, ısı geri kazanım ve frekans konvertörü markaları',
      subtitle: 'Marka ve ürün ailesi için ayrı sayfalar bulunur; ürün sayfalarında teknik föy ve özellik tabloları yer alır.'
    },
    knowledge: {
      headingPrefix: 'Rehberler ve',
      headingAccent: 'Hesaplar',
      eyebrow: 'Bilgi Merkezi ve Destek',
      title: 'Rehberler ve Hesaplar',
      subtitle: 'Ürün seçmeden önce rehber yazılarını okuyun ve hesaplayıcıları kullanın; teklif istemeden önce SSS ve teslimat bilgilerine göz atın.',
      cta: 'İncele',
      hub: {
        title: 'Havalandırma Rehber Yazıları',
        subtitle: 'Her rehber yazısı bir Kaynaklar bölümü taşır. Hesaplamalar için Ürün Seçici\'yi kullanın.',
        searchPlaceholder: 'Yazılarda ara...',
        readStart: 'Okumaya Başla',
        // ⛔MÜKERRER "yakında" KOPYASI KALDIRILDI (2026-09-05). Bu blok `home.knowledge.hub`
        // altındaydı ve HİÇ ÇİZİLMİYORDU — `KnowledgeBlock` props tipinde `hub` yok, depoda
        // `home.knowledge` ile çağrı yok. Yani aynı yalan iki yerde duruyordu: biri ekranda,
        // biri ölü. Ölü olanı da sildim; yarın biri "burada duruyor" deyip geri koymasın.
        notFoundTitle: 'Aradığınız teknik bilgiyi bulamadınız mı?',
        notFoundDesc: 'Sorunuzu iletişim formu veya e-posta ile iletebilirsiniz.',
        contactExpert: 'İletişime Geçin',
        readTime: '{{count}} dk okuma',
        categories: {
          comfort: 'Konfor',
          safety: 'Güvenlik',
          efficiency: 'Verimlilik'
        }
      },
      items: {
        guides: {
          eyebrow: 'Bilgi Merkezi',
          title: 'Seçim rehberi ve teknik içerik',
          description: 'Bilgi Merkezi\'nde rehber yazıları yayımlanır; her yazıda bir Kaynaklar bölümü bulunur.'
        },
        // Ad "Hesaplayıcılar" değil "Ürün Seçici" (karar K17): tek ad, tek hedef.
        // Kart artık tek bir araca değil, dört aracı toplayan giriş sayfasına gidiyor.
        calculators: {
          eyebrow: 'Ürün Seçici',
          title: 'Ön değerlendirme: hacim, debi, basınç',
          description: 'Kanal, HRV, hava perdesi ve jet fan hesaplarını tek yerden yapın.'
        },
        support: {
          eyebrow: 'Destek',
          title: 'SSS, teslimat, iade, garanti sayfaları',
          description: 'Siparişler teklif talebiyle başlar. Sorularınızı iletişim formu ya da e-posta ile iletebilirsiniz.'
        }
      }
    },
    finalCta: {
      eyebrow: 'Son Adım',
      title: 'İhtiyacınızı iletin, teklif isteyin.',
      subtitle: 'Ön değerlendirmenizi Ürün Seçici ile yapın, ürün ailelerini inceleyin, teklif için iletişim formunu ya da e-postayı kullanın.',
      primaryCta: 'Teklif İste',
      secondaryCta: 'İletişime Geç',
      tertiaryCta: 'Ürünleri Keşfet'
    },
    heroTitle: 'Temiz Hava, Doğru Ürün Ailesi',
    heroSubtitle: 'Mühendislik odaklı havalandırma ürünleri kataloğu ve hesaplayıcılar: fan, hava perdesi, ısı geri kazanım ve frekans konvertörü.',
    bottomCtaTitle: 'Doğru ürünü seçmenize yardımcı olalım.',
    bottomCtaSubtitle: 'Proje detayınızı iletişim formu ya da e-posta ile iletin.',
    whyParagraph: 'Kanal fanı, hava perdesi ve ısı geri kazanım modellerini inceleyin; Ürün Seçici ile ön hesap yapın, teklif isteyin.',
    why: {
      premiumTitle: 'Markalar',
      premiumText: 'Katalogda birden çok markanın ürünleri yer alır; ürün sayfalarında teknik föy ve özellik tabloları bulunur.',
      expertTitle: 'Ön Değerlendirme',
      expertText: 'Ürün Seçici; kanal fanı, ısı geri kazanım, hava perdesi ve jet fan için hesap yapar.',
      fastTitle: 'Teklifle Sipariş',
      fastText: 'Teslimat koşulları teklifte belirtilir.'
    },
    galleryTitle: 'Ürün Galerisi',
    gallerySubtitle: 'Ürün ailelerine göz atın',
    caseStudies: {
      title: 'Uygulama Alanları',
      subtitle: 'Hava perdesi kullanım alanları ve jet fan hesabı',
      viewDetails: 'Detayları İncele',
      items: {
        parking: {
          title: 'Jet Fan Hesabı',
          summary: 'Jet fan hesabı Ürün Seçici\'de hacim, debi ve basınç girdileriyle yapılır; hesap ön değerlendirmedir.',
          metrics: {
            energySavings: '',
            duration: ''
          }
        },
        airCurtain: {
          title: 'Hava Perdesi Uygulaması',
          summary: 'Hava perdesi, kapı açıklığında sıcak ve soğuk havanın geçişini engelleyen aşağı yönlü bir hava akımı oluşturur.',
          metrics: {
            comfortIncrease: '',
            roi: ''
          }
        }
      }
    }
  },
  megamenu: {
    elite: {
      defaultDescription: 'Havalandırma ürün ailelerini görün.',
      viewAll: 'Tümünü Gör',
    },
    classic: {
      logoInitial: 'V',
      title: 'Kategoriler',
    },
    categoryHub: {
      featuredTechnology: 'TEKNOLOJİ',
      defaultDescription: 'Alt kategoriler ve ürün aileleri burada listelenir.',
      back: 'Geri Dön',
      subCategoryCount: '{{count}} Alt Kategori',
    },
    productCategories: 'Ürün Kategorileri',
  },
  teklifPaneli: {
    // REC-129 Faz 1c — header "Teklif" ögesi ve paneli (tasarım v13, ekran 12).
    teklif: 'Teklif',
    kalemSayisi: 'teklif listesinde {n} kalem',
    baslik: 'Teklif listesi · {n} kalem',
    bosBaslik: 'Teklif listesi boş',
    bosAciklama: 'Ürünlerden ekleyin.',
    urunlereGit: 'Ürünlere git',
    tumListe: 'Tümünü gör ({n})',
    tekliflerim: 'Tekliflerim',
    projelerim: 'Projelerim',
    favorilerim: 'Favorilerim',
    girisDaveti: 'Tekliflerinizi ve projelerinizi görmek için giriş yapın',
  },
  altSekme: {
    // REC-129 Faz 1b — mobil alt sekme çubuğu (tasarım v13, ekran 01/02/12).
    // Anahtarlar NESTED: `getDictValue` nokta içeren düz anahtarı çözemez ve ham
    // anahtarı ekrana basar (CLAUDE.md kural 7 · i18n-dead-key kapısı).
    etiket: 'Alt gezinme',
    anasayfa: 'Ana sayfa',
    urunler: 'Ürünler',
    teklif: 'Teklif',
    // Rozetteki sayıyı SÖZLE de söyler (ekran okuyucu). Rozet tek başına anlam
    // taşımaz — renk/konum tek bilgi taşıyıcı olamaz.
    teklifSayisi: 'teklif listesinde {n} kalem',
    destek: 'Destek',
    hesap: 'Hesap',
    tumUrunler: 'Tüm ürünler',
    markalar: 'Markalar',
    teknikDestek: 'Teknik destek',
    iletisim: 'İletişim',
    // Hesap yaprağı (REC-129 Faz 1c, Recep hükmü 2026-09-04): yüzen dil seçici
    // kaldırıldı; mobilde dilin tek girişi bu yaprağın en üstüdür.
    dil: 'Dil',
    hesabim: 'Hesabım',
    girisYapin: 'Giriş yapın',
    kilitli: '(giriş gerekir)',
  },
  header: {
    adminBar: {
      brand: 'VH / ADMIN',
      backToSite: 'Siteye Dön',
    },
    syncing: 'Senkronize ediliyor',
    roleLabel: 'Yetki',
    account: 'Hesabım',
    adminPanel: 'Yönetim Paneli',
    menu: 'Menü',
    // REC-94: `quickOrder` KALDIRILDI — sipariş verilemeyen bir sitede sipariş vaadiydi
    // (vaat-bütünlüğü cetveli §1.4). Anahtar bilerek bırakılmadı; geri dönüşte ne
    // gerektiği cetvelin §4.5 tablosunda yazılı.
    recentlyViewed: 'Son Görüntülenen',
    favorites: 'Favoriler',
    cart: 'Sepet',
    brandName: 'VentHub',
    brandTagline: 'HVAC Kataloğu',
    commandSearchCompact: 'Ara...'
  },
  roles: {
    superadmin: 'Süper Admin',
    super_admin: 'Süper Admin',
    admin: 'Yönetici',
    moderator: 'Moderatör',
    warehouse: 'Depo',
    sales: 'Satış',
    viewer: 'İzleyici',
    user: 'Kullanıcı'
  },
  legalLinks: {
    kvkk: 'KVKK Aydınlatma Metni',
    distanceSales: 'Mesafeli Satış Sözleşmesi',
    preInformation: 'Ön Bilgilendirme Formu',
    cookies: 'Çerez Politikası',
    privacy: 'Gizlilik Politikası',
    terms: 'Kullanım Koşulları'
  },
  cookieConsent: {
    title: 'Çerez İzni',
    description: 'Sitenin çalışması için zorunlu çerezleri kullanıyoruz. Zorunlu olmayan çerezler yalnızca sizin onayınızla çalışır.',
    policyLink: 'Çerez Politikası',
    acceptAll: 'Tümünü Kabul Et',
    rejectOptional: 'Yalnızca Zorunlu',
    manage: 'Tercihleri Yönet',
    saveSelection: 'Seçimi Kaydet',
    changePreferences: 'Çerez tercihlerimi değiştir',
    categories: {
      necessary: 'Zorunlu',
      necessaryDesc: 'Üye girişi, sepet ve güvenlik için gereklidir; kapatılamaz.',
      functional: 'İşlevsel',
      functionalDesc: 'Dil ve görüntüleme tercihlerinizi hatırlar.',
      analytics: 'Analitik',
      analyticsDesc: 'Sitenin nasıl kullanıldığını ölçmemizi sağlar.',
      marketing: 'Pazarlama',
      marketingDesc: 'İlgi alanlarınıza göre tanıtım gösterilmesini sağlar.'
    }
  },
  legal: {
    kvkkTitle: 'KVKK Aydınlatma Metni (Taslak)',
    draftWarning: 'Satıcı ve iletişim bilgileri bu metne eklenecektir.',
    disclaimer: 'Bu metin hukuki danışmanlık niteliği taşımaz. Nihai metin için uzman görüşü almanız tavsiye edilir.',
    privacyTitle: 'Gizlilik Politikası (Taslak)',
    cookieTitle: 'Çerez Politikası (Taslak)',
    distanceSalesTitle: 'Mesafeli Satış Sözleşmesi (Taslak)',
    preInformationTitle: 'Ön Bilgilendirme Formu (Taslak)',
    termsTitle: 'Kullanım Koşulları (Taslak)',
    // Sayfa üst verisi (meta açıklama) — bot karnesi 2026-09-24: yasal sayfalar varsayılan site
    // açıklamasını basıyordu. Yalnız belgenin konusu adlandırılır.
    seo: {
      kvkk: '6698 sayılı KVKK kapsamında kişisel verilerin işlenmesine ilişkin aydınlatma metni.',
      privacy: 'VentHub web sitesinde kişisel verilerin nasıl toplandığı, kullanıldığı ve korunduğu.',
      cookie: 'VentHub web sitesinde kullanılan çerezler ve çerez tercihlerinin yönetimi.',
      // SEO-32 (URN-91): üç belgenin açıklaması sayfanın kendi bölüm başlıklarından yazıldı (110-155 karakter).
      // "taslak" sözcüğü açıklamada YOKTUR: taslak durumunu `yasalBaslik` başlıkta kendiliğinden izler
      // (hukukçu teyidi gelince "(Taslak)" kalkar); sabit yazılan sözcük o gün yanlış kalırdı.
      terms: 'VentHub web sitesinin kullanım koşulları: hizmet kapsamı, üyelik ve hesap güvenliği, fiyat ve stok, fikri mülkiyet, sorumluluk reddi.',
      distanceSales: 'VentHub satışlarına ilişkin mesafeli satış sözleşmesi: taraflar, ödeme ve teslimat, cayma hakkı, iade, ayıplı mal ve uyuşmazlık.',
      preInformation: 'Mesafeli satış öncesi ön bilgilendirme formu: ürünün nitelikleri, toplam bedel, ödeme, teslimat, cayma hakkı ve iade masrafı.',
    }
  },
  footer: {
    quickLinks: 'Hızlı Linkler',
    categories: 'Kategoriler',
    contact: 'İletişim',
    workingHours: 'Teklif ve Sorular',
    weekdays: 'Teklif ve sorularınız için e-posta gönderin ya da iletişim formunu doldurun.',
    // URN-82: `workingHours`/`weekdays` anahtar ADLARI tarihsel (Blog tablosu bu adlarla yazar); değerleri artık saat değil,
    // "Teklif ve Sorular" başlığı ve yönlendirme cümlesidir. `saturday` boştu ve tüketicisi yoktu → kalktı.
    contactForm: 'İletişim formu',
    rights: 'Tüm hakları saklıdır.',
    // address/phone BİLİNÇLİ YOK (2026-08-28): uydurma adres ve numara yayınlanmaz.
    // Gerçek bilgi olunca EN sözlüğüyle BİRLİKTE geri eklenir (parite).
    email: 'info@venthub.com.tr',
    // social BİLİNÇLİ YOK (REC-285, 2026-09-24): bağlantılar platform ana sayfasına gidiyordu.
    // Gerçek hesap adresleri gelince EN sözlüğüyle BİRLİKTE geri eklenir (parite).
  },
  auth: {
    pwStrength: {
      weak: 'Zayıf',
      fair: 'Orta',
      good: 'İyi',
      strong: 'Güçlü',
      label: 'Güvenlik',
    },
    pwRule: {
      length: 'En az 8 karakter',
      upper: 'En az 1 büyük harf',
      digit: 'En az 1 rakam',
      special: 'En az 1 özel karakter',
      allRequired: 'Şifreniz tüm güvenlik kurallarını karşılamalıdır',
    },
    forgot: {
      spamHint: '💡 E-posta gelmezse spam klasörünüzü kontrol etmeyi unutmayın',
    },
    callback: {
      loadingTitle: 'E-posta Doğrulanıyor...',
      loadingDesc: 'Lütfen bekleyin, hesabınız doğrulanıyor.',
      successTitle: 'Doğrulama Başarılı!',
      errorTitle: 'Doğrulama Hatası',
      successRedirect: 'E-posta başarıyla doğrulandı! Anasayfaya yönlendiriliyorsunuz...',
      successToast: 'E-posta başarıyla doğrulandı!',
      verifyError: 'E-posta doğrulama sırasında hata oluştu: {{message}}',
      invalidLink: 'Doğrulama linki geçersiz veya süresi dolmuş',
      recoveryRedirect: 'Bağlantı doğrulandı! Yeni şifre ekranına yönlendiriliyorsunuz...',
    },
    reset: {
      title: 'Yeni Şifre Belirle',
      subtitle: 'Hesabınız için yeni bir şifre oluşturun',
      checking: 'Bağlantı doğrulanıyor...',
      invalidTitle: 'Bağlantı Geçersiz',
      invalidDesc: 'Şifre sıfırlama bağlantısı geçersiz veya süresi dolmuş. Lütfen yeni bir bağlantı isteyin.',
      requestNew: 'Yeni Bağlantı İste',
      submit: 'Şifreyi Güncelle',
      updating: 'Güncelleniyor...',
      success: 'Şifreniz başarıyla güncellendi',
      updateError: 'Şifre güncellenemedi. Lütfen tekrar deneyin.',
    },
    registerForm: {
      requiredMark: '*',
    },
    loginForm: {
      googleButton: 'Google ile Giriş Yap',
    },
    back: 'Geri',
    loginTitle: 'Giriş Yap',
    loginSubtitle: 'VentHub hesabınıza giriş yapın',
    email: 'E-posta Adresi',
    password: 'Şifre',
    forgotPassword: 'Şifremi Unuttum',
    resetSubtitle: 'Şifrenizi sıfırlamak için e-posta adresinizi girin. Size bir bağlantı göndereceğiz.',
    sendResetLink: 'Sıfırlama Bağlantısı Gönder',
    loggingIn: 'Giriş yapılıyor...',
    submitting: 'Gönderiliyor...',
    login: 'Giriş Yap',
    rememberMe: 'Beni hatırla',
    noAccount: 'Hesabınız yok mu?',
    register: 'Kayıt Ol',
    validEmailPassRequired: 'E-posta ve şifre gereklidir',
    required: 'gereklidir',
    emailInvalid: 'Geçersiz e-posta adresi',
    invalidCreds: 'E-posta veya şifre hatalı',
    emailNotConfirmed: 'E-posta adresinizi onaylamanız gerekiyor',
    genericLoginError: 'Giriş sırasında bir hata oluştu',
    loginSuccess: 'Giriş başarılı!',
    orContinueWith: 'veya şununla devam edin',
    registerNow: 'Hemen Kayıt Ol',
    unexpectedError: 'Beklenmeyen bir hata oluştu',
    sessionExpired: 'Oturumunuzun süresi doldu. Lütfen tekrar giriş yapın.',
    userNotFound: 'Bu e-posta ile kayıtlı kullanıcı bulunamadı',
    resetError: 'Sıfırlama isteği gönderilemedi',
    resetEmailSent: 'Şifre sıfırlama e-postası gönderildi',
    registerTitle: 'Kayıt Ol',
    registerSubtitle: 'VentHub\'a katılın ve ayrıcalıklardan yararlanın',
    name: 'Ad Soyad',
    confirmPassword: 'Şifreyi Onayla',
    passwordMin: 'Şifre en az 8 karakter olmalıdır',
    passwordsDontMatch: 'Şifreler eşleşmiyor',
    passwordPwned: 'Bu şifre daha önce veri sızıntılarında görülmüş. Lütfen daha güçlü bir şifre seçin.',
    registrationEmailSent: 'E-posta adresinize bir doğrulama bağlantısı gönderildi. Lütfen hesabınızı doğrulayın.',
    registering: 'Kayıt yapılıyor...',
    alreadyHave: 'Zaten hesabınız var mı?',
    emailAlready: 'Bu e-posta adresi zaten kullanımda',
    registrationComplete: 'Kayıt Tamamlandı!',
    backHome: 'Ana Sayfaya Dön',
    emailSentTitle: 'E-posta Gönderildi!',
    emailSentDesc: '{{email}} adresine bir şifre sıfırlama bağlantısı gönderildi. Lütfen e-postanızı kontrol edin.',
    backToLogin: 'Giriş Sayfasına Dön',
    tryAnotherEmail: 'Başka Bir E-posta Dene',
    registrationCompleteTitle: 'Kayıt Tamamlandı!',
    registrationCompleteDesc: 'E-postanıza bir doğrulama bağlantısı gönderildi. Kaydı tamamlamak için lütfen doğrulayın.',
    or: 'veya',
    googleSignInFail: 'Google ile giriş başlatılamadı',
    googleSignInError: 'Google ile giriş sırasında beklenmeyen hata',
    features: {
      secure: 'Güvenli',
      fast: 'Hızlı',
      mobile: 'Mobil Uyumlu'
    },
    errors: {
      nameRequired: 'Ad soyad gereklidir'
    }
  },
  brands: {
    sectionTitle: 'Katalogdaki Markalar',
    sectionSubtitle: 'AVenS, Casals, Danfoss, Nicotra Gebhardt, SEAT ve Vortice ürünlerini teknik özellikleriyle inceleyin.',
    subtitlePart1: 'Sunduğumuz',
    subtitlePart2: 'Markalar',
    viewAll: 'Tüm Markaları Gör',
    pageTitle: 'Markalar',
    pageSubtitle: 'Ürünü olan markaların ürün ailelerini, modellerini ve teknik özelliklerini inceleyin.',
    eyebrow: 'Marka Kataloğu',
    exploreBrand: 'Markayı Keşfedin',
    seoDesc: 'VentHub kataloğundaki endüstriyel havalandırma ve HVAC markaları. Her markanın ürün ailelerini, modellerini ve teknik özelliklerini inceleyin.',
    // REC-497: marka kaydındaki üretici övgüsü ("dünya lideri" vb.) arama açıklamasından atılınca kalan metin
    // kısa kalırsa ya da hiç kalmazsa kullanılır. Yalnız kayıttaki doğrulanabilir alan (uzmanlık) konuşur.
    seoYedekUzmanlik: 'VentHub kataloğunda {{uzmanlik}} alanındaki ürünleri inceleyin.',
    seoYedek: '{{ad}} markasının ürün ailelerini, modellerini ve teknik özelliklerini VentHub kataloğunda inceleyin.',
    // OPS-51: ürünsüz marka sayfasının meta açıklaması (sayfa gövdesiyle aynı olgu; ürün/zaman vaadi yok).
    seoUrunsuz: '{{ad}} ürünleri henüz VentHub kataloğunda yer almıyor; ürün bilgisi ve teklif için bizimle iletişime geçin.',
    notFound: 'Marka bulunamadı',
    backToAll: 'Tüm markalara dön',
    aboutBrand: 'hakkında bilgi',
    trust: {
      eyebrow: 'Sipariş',
      title: 'Teklifle Sipariş',
      description: 'Çevrimiçi ödeme henüz açık değil; sipariş için teklif isteyin. Teslimat süresi ve sevkiyat koşulları teklif aşamasında netleştirilir.',
      imageAlt: 'Teknik Altyapı ve HVAC Kurulumu'
    },
    detail: {
      curatedSolutions: 'Katalog Ürünleri',
      heritage: 'Marka Bilgisi',
      authorityTitle: 'Marka Hakkında',
      globalVision: 'Katalogda',
      globalVisionDesc: '{{ad}}, VentHub kataloğunda {{aile}} ürün ailesi ve {{model}} model ile yer alıyor.',
      technicalExcellence: 'Teknik Veriler',
      technicalExcellenceDesc: 'Ürün sayfalarında teknik föy ve özellik tabloları bulunur.',
      corporateSnapshot: 'Kurumsal Özet',
      headquarters: 'Merkez',
      webAuthority: 'Web Sitesi',
      officialSite: 'Resmi Web Sitesi',
      requestCatalog: 'Teklif İste',
      featuredSystems: 'Ürün Aileleri',
      allProductGroups: 'Tüm Ürün Aileleri',
      // REC-148 A6: eskiden "yakında eklenecektir" idi — eklenip eklenmeyeceği belli
      // olmayan bir VAAT. Artık olgu: marka katalogda var, ürünleri henüz yok.
      noProducts: 'Bu markanın ürünleri henüz katalogda değil.',
      // OPS-51 (karar 265 + OPS hükmü): YALNIZ DB'de aktif ürünü 0 olan marka (şu an Flexiva) için; karar sunucuda
      // aktif ürün sayısından türer (`markaUrunDurumu.ts`), statik bayrak yok.
      // ZAMAN VAADİ YOK (INV-VAAT-SIZINTI-2 / REC-148): olgu + eylem — ürün katalogda yok, teklif istenir.
      productsOnRequest: '{{ad}} ürünleri henüz katalogda yok; sorularınız için iletişim formunu kullanabilirsiniz.',
      productsOnRequestCta: 'İletişim formuna git',
      // URN-79: marka sayfasının DB'den türeyen özet cümleleri (üretici övgüsü yerine). Şablon yer tutucuları: {{ad}} marka
      // adı, {{sayi}} aktif ürünlü aile sayısı, {{kategoriler}} / {{aileler}} virgülle ayrılmış adlar, {{diger}} listede
      // gösterilmeyen aile sayısı. Cümlelerin hiçbiri üstünlük/ölçüt iddiası taşımaz — yalnız katalogdaki olgu.
      catalogSummary: 'VentHub kataloğunda {{ad}} markasının ürün ailesi sayısı: {{sayi}}.',
      catalogCategories: 'Kategoriler: {{kategoriler}}.',
      catalogFamilies: 'Ürün aileleri: {{aileler}}.',
      catalogFamiliesMore: 'Ürün aileleri: {{aileler}} ve {{diger}} aile daha.',
      originSuffix: 'Menşei',
      estPrefix: 'Kuruluş',
      // REC-98: "Kurumsal Özet" satırlarının ETİKETLERİ. Değer tarafı veri olarak
      // `BRAND_DETAILS` içinde taşınır; etiket burada, çünkü arayüz metnidir.
      statCountries: '',
      statGroup: 'Grup',
      statProduction: 'Üretim',
      statWarranty: 'Model',
      statExperience: 'Ürün Ailesi',
      statExpertise: 'Ürün Türü',
      statQuality: 'Kategori'
    }
  },
  contactPage: {
    form: {
      heroBadge: 'Teklif ve Soru',
      heroTitle: 'Projenizi',
      heroTitleAccent: 'Birlikte Şekillendirelim',
      heroDesc: 'Ürün seçimi, teknik sorular ve teklif talepleriniz için formu doldurun ya da e-posta ile yazın.',
      cardPhoneTitle: '',
      cardPhoneLabel: 'Formla Yazın',
      cardEmailTitle: 'Teknik Teklif',
      cardEmailLabel: 'E-posta Gönder',
      // cardOffice* KALDIRILDI (2026-08-28): gerçek ofis adresi yok, kart da yok.
      directAccessLabel: 'İletişim Yolları',
      supportTitle: 'Teknik Sorular',
      supportTitleAccent: 'Form ve E-posta ile',
      supportDesc: 'Ürün sayfalarında teknik föy ve özellik tabloları bulunur; ek bir teknik sorunuz varsa e-posta ile iletebilirsiniz.',
      whatsappCta: 'Teknik Soru Gönderin',
      responseTime: 'Sipariş için teklif isteyin',
      successTitle: 'Mesajınız İletildi',
      successDesc: 'Eklemek istediğiniz bir bilgi olursa e-posta ile yazabilirsiniz.',
      newMessage: 'Yeni Mesaj Gönder',
      labelName: 'Ad Soyad',
      labelEmail: 'E-posta',
      labelSubject: 'Konu / Proje Adı',
      labelMessage: 'Mesajınız',
      subjectPlaceholder: 'Örn: Kanal Fanı Proje Teklifi',
      messagePlaceholder: 'İhtiyaçlarınızı buraya yazın...',
      submitButton: 'Talebi Gönder',
      consentText: 'okudum ve kabul ediyorum.',
      consentRequired: 'KVKK metnini onaylamalısınız',
      submitFailed: 'Mesajınız gönderilemedi. Lütfen tekrar deneyin; sorun sürerse bize doğrudan ulaşın.',
    },
    title: 'İletişim',
    // REC-497: bu metnin TEK tüketicisi sayfanın üst verisi (arama sonucu açıklaması); eski metin
    // 51 karakterdi ("Size her konuda yardımcı olmaktan mutluluk duyarız.") ve sayfayı anlatmıyordu.
    subtitle: 'VentHub ile iletişime geçin: ürün seçimi, teknik sorular ve teklif talepleriniz için formu doldurun ya da e-posta ile yazın.',
  },
  aboutPage: {
    title: 'Hakkımızda',
    vision: 'Katalog, Hesap, Teklif',
    // Sayaç etiketleri KART SIRASINA göre (src/views/AboutPage.tsx `stats`): her anahtarın canlı değer kaynağı
    // `hakkimizda-sayac.test.ts` içinde SABİTLENMİŞTİR (anahtar-kart kayması kırmızı verir). Anahtar adları tarihseldir:
    // `distributorship` = ürünü olan marka sayısı (bayilik DEĞİL), `completedProject` = aktif model sayısı (proje DEĞİL).
    distributorship: 'Ürünü Olan Marka',
    completedProject: 'Aktif Model',
    productFamilies: 'Ürün Ailesi',
    precisionTitle: 'Ürün Seçici Araçları',
    precisionDesc: 'Hacim, debi ve basınç girdilerinizle kanal fanı, ısı geri kazanım (HRV), hava perdesi ve jet fan için ön değerlendirme yapabilirsiniz.',
    standardsTitle: 'Kaynaklı Rehberler',
    standardsDesc: 'Bilgi Merkezi’nde yayımlanan her rehber yazısı bir Kaynaklar bölümü taşır.',
    trustTitle: 'Teklifle Sipariş',
    trustDesc: 'Çevrimiçi satış şu an kapalıdır; sipariş için teklif istenir. Kargo ücreti ve firması teklifte belirtilir, takip numarası e-posta ile iletilir.',
    heroBadge: 'Katalog ve Teklif Sitesi',
    heroTitle: 'Havalandırma ürünleri:',
    heroTitleItalic: 'katalog ve seçim araçları',
    heroDesc: 'VentHub’da fanlar, hava perdeleri, ısı geri kazanım cihazları ve frekans konvertörleri gibi ürünler marka, ürün ailesi ve model düzeyinde listelenir.',
    storyTitle: 'Bulun, Hesaplayın,',
    storyTitleItalic: 'Teklif İsteyin',
    storyDesc1: 'Katalogda marka sayfaları, ürün ailesi sayfaları ve ürün sayfaları bulunur; ürün sayfalarında teknik özellik tabloları yer alır. Ürünleri markaya ya da ürün ailesine göre inceleyebilirsiniz.',
    storyDesc2: 'Ürün Seçici’deki hesaplar ön değerlendirmedir; teklif için iletişim formu ya da e-posta kullanılır. Bilgi Merkezi’nde rehber yazıları yayımlanır.',
    teamTitle: 'Ürün Seçici &',
    teamSubtitle: 'Bilgi Merkezi Rehberleri',
    brandTitle: 'Katalogdaki',
    brandTitleItalic: 'Markalar',
    ctaTitle: 'Teklif ya da Sorunuz İçin',
    ctaTitleItalic: 'İletişim Formunu Kullanın',
    ctaContact: 'İletişime Geçin',
    ctaExplore: 'Ürünleri Keşfedin',
    seoDescription: 'VentHub’da fan, hava perdesi, ısı geri kazanım ve frekans konvertörü ürünleri listelenir; mühendislik odaklı seçim için Ürün Seçici ile ön değerlendirme yapılır, teklif istenebilir.',
    whySubtitle: 'Ürün kataloğunda listelenen markalar',
  },
  cartToast: {
    added: 'Ürün sepete eklendi!',
    continue: 'Alışverişe Devam Et',
    goToCart: 'Sepete Git',
    autoClose: 'Bu pencere 5 saniye içinde otomatik olarak kapanacak'
  },
  cart: {
    emptyTitle: 'Sepetiniz boş',
    emptyDesc: 'Henüz bir ürün eklemediniz. Alışverişe başlamak için ürünlerimizi keşfedin.',
    startShopping: 'Alışverişe Başla',
    title: 'Alışveriş Sepeti',
    countLabel: 'Sepetinizde {{count}} ürün var',
    removeItem: 'Ürünü kaldır',
    decreaseQty: 'Miktarı azalt',
    increaseQty: 'Miktarı artır',
    clearCart: 'Sepeti Temizle',
    summary: 'Sipariş Özeti',
    subtotal: 'Ara Toplam',
    shipping: 'Kargo',
    free: 'Ücretsiz',
    vatIncluded: 'KDV (%20, dahil)',
    total: 'Toplam',
    checkout: 'Ödemeye Geç',
    continueShopping: 'Alışverişe Devam Et',
    // REC-104: securePayment KALDIRILDI — ödeme kapalıyken korunacak ödeme yok.
    itemTotal: 'Toplam',
    quoteItemsNotice: 'Sepetinizde fiyatı henüz belirlenmemiş ürün var. Toplam yalnızca fiyatlı ürünleri kapsar; ödemeye geçmek için bu ürünler için teklif alın.'
  },
  checkout: {
    // Ödeme yolu KAPALI olduğunda gösterilen metinler.
    // Karar tek yerde: app/[lang]/checkout/page.tsx. Kapalılığın TAŞIYICISI burada
    // yazılmıyor — taşıyıcı değiştiğinde bu satır sessizce yanlış kalmasın.
    kapali: {
      // REC-148 A7 — OPS hükmü, K1a: satış kipi KAPALI, YOK değil. Eski başlık
      // "Ödeme yakında açılıyor" bir TARİH vaat ediyordu; o tarih kimsede yok.
      // Yeni cümle durumu söylüyor ve ziyaretçiye ne YAPABİLECEĞİNİ altındaki metin veriyor.
      baslik: 'Şu an teklif kipindeyiz; sipariş ve ödeme kapalı.',
      aciklama: 'Çevrimiçi ödeme henüz açık değil; sipariş için teklif isteyebilirsiniz.',
      whatsappCta: 'WhatsApp\'tan teklif iste',
      emailCta: 'E-posta ile teklif iste',
    },
    securePayment: {
      brand: 'Venthub HVAC',
      iyzicoSecure: 'iyzico ile güvenli ödeme',
    },
    orderSummary: {
      couponPlaceholder: 'Kupon kodu',
      couponApplyFailed: 'Kupon uygulanamadı',
      applyCoupon: 'Uygula',
      removeCoupon: 'Kaldır',
    },
    invoiceModal: {
      title: 'Kayıtlı Fatura Profilleri',
    },
    addressModal: {
      defaultOpen: '(',
      defaultClose: ')',
      empty: '—',
    },
    addressStep: {
      standardName: 'Standart',
      standardEta: 'Teklif aşamasında netleşir',
      expressName: 'Ekspres',
      expressEta: 'Teklif aşamasında netleşir',
    },
    saved: {
      title: 'Kayıtlı Adresler',
      address: 'Adres',
      labelPlaceholder: 'Ev, İş vb.',
      default: 'Varsayılan',
      use: 'Bu adresi kullan',
      manage: 'Adresleri yönet',
      seeAll: 'Tüm adresleri gör',
      select: 'Adres seç',
      close: 'Kapat',
      edit: 'Düzenle',
      delete: 'Sil',
      save: 'Kaydet',
      cancel: 'İptal',
      defaultShipping: 'Kargo için varsayılan',
      defaultBilling: 'Fatura için varsayılan',
      updated: 'Adres güncellendi',
      deleted: 'Adres silindi',
      updateError: 'Güncelleme hatası',
      deleteError: 'Silme hatası',
      confirmDelete: 'Bu adresi silmek istediğinizden emin misiniz?'
    },
    title: 'Ödeme',
    backToCart: 'Sepete Dön',
    securePaymentBrand: 'Güvenli ödeme • {{brand}}',
    securePaymentProvider: '{{provider}} ve 256‑bit SSL şifreleme',
    summaryTitle: 'Sipariş Özeti',
    summaryThumb: 'Ürün',
    couponDiscount: 'Kupon indirimi ({{code}})',
    paymentSectionTitle: 'Ödeme Bilgileri',
    paymentLoading: 'Ödeme formu yükleniyor. Lütfen 3D doğrulamasını tamamlayın. İşlem bitince bu sayfa otomatik yenilenecektir.',
    formPreparing: 'Form hazırlanıyor...',
    paymentSuccess: '🎉 Ödeme başarıyla tamamlandı!',
    paymentError: 'Ödeme sırasında bir hata oluştu',
    steps: {
      step1: 'Kişisel Bilgiler',
      step2: 'Adres Bilgileri',
      step3: 'Özet',
      step4: 'Ödeme'
    },
    overlay: {
      dialogLabel: 'Güvenli ödeme başlatılıyor',
      header: 'Güvenli ödeme başlatılıyor…',
      starting: 'Ödeme başlatılıyor',
      secureForm: 'Güvenli form yükleniyor',
      bank3d: 'Banka 3D doğrulaması',
      stageInit: 'Başlatılıyor',
      stageForm: 'Güvenli form',
      stageBank: 'Banka 3D',
      dontClose: 'İşlem sırasında bu sayfayı kapatmayın veya geri gitmeyin. Birkaç saniye sürebilir.'
    },
    help: {
      smsTitle: 'Kod gelmedi mi?',
      tip1: '30–60 saniye bekleyin ve tekrar deneyin (bankanız SMS\'i gecikmeli gönderebilir).',
      tip2: 'Sinyal yoksa veya uçuş modu gibi sorunlar varsa, farklı bir cihaz deneyin.',
      tip3: 'Telefon numaranızı kontrol edin ve bankanızla iletişime geçin.'
    },
    personal: {
      title: 'Kişisel Bilgileriniz',
      nameLabel: 'Ad Soyad *',
      namePlaceholder: 'Tam adınız',
      emailLabel: 'E-posta Adresi *',
      emailPlaceholder: 'ad@orneksite.com',
      phoneLabel: 'Telefon Numarası *',
      phonePlaceholder: '+90 (5xx) xxx xx xx',
      idLabel: 'T.C. Kimlik No (Opsiyonel)',
      idPlaceholder: '12345678901'
    },
    shipping: {
      methodTitle: 'Teslimat Yöntemi',
      title: 'Teslimat Adresi',
      addressLabel: 'Açık Adres *',
      addressPlaceholder: 'Sokak, bina, kapı no, daire no',
      cityLabel: 'Şehir *',
      cityPlaceholder: 'İstanbul',
      districtLabel: 'İlçe *',
      districtPlaceholder: 'İlçe giriniz',
      postalLabel: 'Posta Kodu *',
      postalPlaceholder: 'Posta kodu'
    },
    billing: {
      title: 'Fatura Adresi',
      sameAsShipping: 'Teslimat adresiyle aynı',
      addressLabel: 'Fatura Adresi *',
      addressPlaceholder: 'Fatura adresi',
      cityLabel: 'Şehir *',
      cityPlaceholder: 'Şehir',
      districtLabel: 'İlçe *',
      districtPlaceholder: 'İlçe',
      postalLabel: 'Posta Kodu *',
      postalPlaceholder: 'Posta kodu'
    },
    invoice: {
      title: 'Fatura Türü ve Detaylar',
      individual: 'Bireysel',
      corporate: 'Kurumsal',
      tcknLabel: 'T.C. Kimlik No *',
      tcknPlaceholder: '11 haneli T.C. No',
      companyLabel: 'Şirket Ünvanı *',
      companyPlaceholder: 'Örn: VentHub Mühendislik A.Ş.',
      vknLabel: 'Vergi Numarası (VKN) *',
      vknPlaceholder: '10 haneli VKN',
      taxOfficeLabel: 'Vergi Dairesi *',
      taxOfficePlaceholder: 'Örn: Kadıköy',
      eInvoice: 'e-Fatura mükellefiyim',
      noProfile: 'Henüz fatura profili eklenmemiş.'
    },
    consents: {
      title: 'Yasal Onaylar',
      readAcceptPrefix: '',
      readAcceptSuffix: ' okudum ve kabul ediyorum.',
      orderConfirmText: 'Siparişi onaylıyorum ve ürün/teslimat bilgilerinin doğruluğunu kabul ediyorum.',
      marketingText: 'Ticari elektronik ileti almayı kabul ediyorum (opsiyonel).'
    },
    review: {
      tckn: 'TCKN: {{value}}',
      cityLine: '{{district}}, {{city}} {{postal}}',
      vkn: 'VKN: {{value}}',
      eInvoice: 'e‑Fatura',
      title: 'Siparişi gözden geçir',
      edit: 'Düzenle'
    },
    nav: {
      back: 'Geri',
      next: 'Devam Et',
      proceedPayment: 'Ödemeye Geç',
    },
    security: {
      secureNote: 'Ödeme bilgileriniz güvenli bir şekilde şifrelenmektedir'
    },
    emptyCart: {
      title: 'Sepetiniz boş',
      desc: 'Ödeme sayfasına erişmek için sepetinizde ürün bulunmalıdır.',
      startShopping: 'Alışverişe Başla'
    },
    priceUpdated: 'Fiyatlar güncellendi, ödeme devam ediyor.',
    errors: {
      priceVerificationFailed: 'Fiyatlar şu anda doğrulanamadığı için ödeme başlatılamadı. Lütfen birkaç dakika sonra tekrar deneyin.',
      paymentError: 'Ödeme sırasında bir hata oluştu',
      itemPriceMissing: 'Sepetinizde fiyatı belirlenmemiş ürün olduğu için ödeme başlatılamadı. Lütfen bu ürünler için teklif alın.',
      nameRequired: 'Ad Soyad gereklidir',
      emailInvalid: 'Lütfen geçerli bir e-posta adresi girin',
      phoneRequired: 'Telefon numarası gereklidir',
      addressRequired: 'Adres gereklidir',
      consentsRequired: 'Devam etmek için KVKK, Mesafeli Satış Sözleşmesi, Ön Bilgilendirme Formu ve sipariş onayı kutularını işaretlemeniz gerekir.',
      locationRequired: 'Lütfen şehir ve ilçe bilgilerini girin',
      cityRequired: 'Şehir gereklidir',
      districtRequired: 'İlçe gereklidir',
      postalRequired: 'Posta kodu gereklidir',
      tcknRequired: '{{limit}} üzerindeki siparişlerde fatura, alıcının T.C. Kimlik No\'su ile düzenlenmek zorundadır. Lütfen numaranızı girin.',
      tcknFormat: 'Geçerli bir T.C. Kimlik No girin (11 hane). Fatura bu bilgiyle düzenlenir.',
      companyRequired: 'Kurumsal fatura için şirket ünvanı gereklidir',
      vknRequired: 'Kurumsal fatura için VKN gereklidir',
      vknFormat: 'Geçerli bir Vergi Kimlik No girin (10 hane). Fatura bu bilgiyle düzenlenir.',
      taxOfficeRequired: 'Vergi dairesi gereklidir',
      kvkkRequired: 'KVKK onayı gereklidir',
      distanceSalesRequired: 'Mesafeli satış sözleşmesi onayı gereklidir',
      preInfoRequired: 'Ön bilgilendirme formu onayı gereklidir',
      orderConfirmRequired: 'Lütfen siparişi onaylayın',
      paymentInit: 'Ödeme başlatılırken bir hata oluştu',
      paymentFormRenderTitle: 'Ödeme formu açılamadı',
      paymentFormRender: 'Güvenli ödeme formu yüklenemedi. Kartınızdan herhangi bir tahsilat YAPILMADI. Lütfen tekrar deneyin; sorun sürerse bizimle iletişime geçin.',
      paymentRetry: 'Tekrar dene',
      validation: 'Formdaki bazı alanlar eksik veya hatalı. Lütfen kontrol edin.',
      database: 'Veritabanı hatası. Lütfen tekrar deneyin.'
    }
  },
  payment: {
    verifyingTitle: 'Ödeme doğrulanıyor...',
    verifyingDesc: 'İşlemi bankanızla teyit ediyoruz. Lütfen bekleyin.',
    failedTitle: 'Ödeme Başarısız',
    retry: 'Tekrar Dene',
    // REC-355 Faz 1: ödeme alındı ama sipariş eşleşmesi doğrulanamadı (needs_review).
    // Bu ekranda ASLA "tekrar dene" gösterilmez — para çekilmiştir, ikinci ödeme riski doğar.
    reviewTitle: 'Ödemeniz Alındı, Doğrulama Sürüyor',
    reviewDesc: 'Ödemeniz bankanızdan alındı. Ödeme siparişinizle eşleştirilip doğrulanana kadar siparişiniz beklemede kalır.',
    reviewWarning: 'Lütfen tekrar ödeme yapmayın. Sorularınız için info@venthub.com.tr adresine yazabilirsiniz.',
    reviewBackHome: 'Ana Sayfaya Dön',
    // BELİRSİZ sonuç (doğrulama hatası, ağ yok, "bekliyor"): ödemenin alındığı SÖYLENMEZ, alınmadığı da. Para çekilmiş
    // olabilir; bu yüzden "başarısız" ekranı ve "tekrar dene" yok (çift tahsilat). Güvenlik incelemesi 10-10, bulgu 1.
    pendingTitle: 'Ödemeniz Kontrol Ediliyor',
    pendingDesc: 'Ödemenizin sonucunu şu an doğrulayamadık. Ödeme alınmış olabilir; durumu kontrol ediyoruz.',
    pendingWarning: 'Lütfen tekrar ödeme yapmayın. Durumu siparişlerim sayfasından izleyebilirsiniz.',
    pendingContactLabel: 'Sorularınız için',
    orderCompletedTitle: 'Siparişiniz Tamamlandı!',
    orderNoLabel: 'Sipariş No',
    orderCompletedDesc: 'Siparişiniz başarıyla alındı. Onay e-postası kısa süre içinde gönderilecektir.',
    dateLabel: 'Tarih',
    itemsCountLabel: 'Ürünler',
    securedBy3d: '',
    viewOrderDetails: 'Sipariş Detaylarını Gör',
    failedGeneric: 'Ödeme tamamlanamadı',
    failedToast: 'Ödeme hatası: {{msg}}',
    verifyError: 'Doğrulama hatası',
    unexpected: 'Beklenmedik bir hata oluştu'
  },
  category: {
    // REC-497: kategorinin KENDİ açıklaması (metadata.description_i18n) yoksa arama sonucu açıklaması.
    // "en kaliteli/ekonomik" gibi sitede doğrulanamayan iddia YOK; satış modu teklif usulü, fiyat vaadi YOK.
    seoYedekAciklama: '{{ad}} kategorisindeki ürün ailelerini, modelleri ve teknik özellikleri VentHub kataloğunda inceleyin.',
    family: {
      variantCount: '{{count}} model',
      count: '{{count}} ürün ailesi',
      viewFamily: 'İncele',
    },
    view: {
      grid: 'Izgara Görünümü',
      list: 'Liste Görünümü',
    },
    sort: {
      title: 'Sıralama',
      name: 'İsme Göre',
      variantCount: 'Model sayısı',
    },
    noProductsFound: 'Bu kriterlere uygun ürün bulunamadı',
    howItWorks: {
      stepNumberLabel: '{{number}}. {{title}}',
      detailIcon: '💡',
    },
    faq: {
      heading: 'Sık Sorulan Sorular',
      subtitle: 'Hava perdesinin seçimi, montajı ve bakımı',
      moreQuestions: 'Başka sorularınız mı var?',
      contactUs: 'Bize ulaşın →',
      q1: 'Hava perdesi ne işe yarar?',
      a1: 'Hava perdesi, kapı boyunca aşağı doğru üflenen hava akımıyla içerideki havayı dışarıdan ayırır ve kapı açıkken iç ile dış ortam arasındaki hava geçişini sınırlar. Mağaza ve market girişleri, restoran ve depo kapıları tipik uygulama alanlarıdır.',
      q2: 'Elektrikli mi yoksa ortam havalı mı tercih etmeliyim?',
      a2: 'Bu, kullanım yerinize bağlıdır. Isıtmasız (ortam havalı) modeller yalnızca hava akımı oluşturur; elektrikli ısıtıcılı modeller girişi ayrıca ısıtır. Girişte ısıtma istiyorsanız elektrikli ısıtıcılı, istemiyorsanız ısıtmasız model seçilir.',
      q3: 'Hava perdesi hangi boyutta olmalı?',
      a3: 'Hava perdesi, kapı genişliğine göre seçilir. Kapının yerden yüksekliği ve montajın kapı üstüne yapılıp yapılamayacağı da seçimi belirler. Ayrıntılar için ürün sayfasındaki teknik özelliklere bakın.',
      q4: 'Montaj nasıl yapılır?',
      a4: 'Montajın kapı üstüne yapılıp yapılamayacağı model seçimini etkiler. Montaj için ürünün kullanım kılavuzuna ve üretici belgesine bakın.',
      q5: 'Bakım nasıl yapılır?',
      a5: 'Bakım için ürünün kullanım kılavuzuna ve üretici belgesine bakın.',
      q6: 'Vortice garanti kapsamı nedir?',
      a6: 'Garanti kapsamı üretici/ithalatçı firmaya göre değişiklik gösterebilir. Lütfen garanti belgesi ve kullanım kılavuzunu saklayınız. Sorularınız için info@venthub.com.tr adresine yazabilirsiniz.',
    },
    trustSignals: {
      // REC-104 (Recep hükmü 2026-09-01):
      // · "Marka Güvencesi / Marka güvenceli Vortice ürünleri" TÜM kategorilerde tek
      //   markanın adını geçiriyordu → markaya özgü cümle kalktı, genel-doğru metin geldi.
      // · "2 Yıl Garanti" rakamı kalktı: kendi destek sayfamız "garanti kapsamı
      //   üretici/ithalatçıya göre değişebilir" diyor, rozet ise sabit süre vaat ediyordu.
      // · ce / iso9001 / compassoDoro sertifika satırı KALDIRILDI (marka sertifikaları
      //   tüm kategorilerde basılıyordu); 15A'da marka sayfasında ele alınacak.
      authorizedDealerTitle: 'Teknik Föy',
      authorizedDealerDesc: 'Ürün sayfalarında özellik tabloları',
      warrantyTitle: 'Garanti Bilgisi',
      warrantyDesc: 'Üretici/ithalatçı koşullarına tabi',
      // REC-104: securePayment* / fastShipping* / installment* anahtarları KALDIRILDI —
      // çevrimiçi ödeme kapalıyken "SSL şifreli işlem" ve "12 aya varan taksit" karşılığı
      // olmayan vaatlerdi. Bkz. docs/standards/vaat-butunlugu-standard.md
      techSupportTitle: 'Soru ve Teklif',
      techSupportDesc: 'Form veya e-posta ile',
    },
    typeComparison: {
      sectionTitle: 'Hangi Tip Hava Perdesi Size Uygun?',
      sectionSubtitle: 'Tipi, girişte ısıtma isteyip istemediğinize göre seçin.',
      electricSubtitle: 'Girişi ısıtmak için',
      electricBenefit1: 'Kapı önünde sıcak hava bariyeri',
      electricBenefit2: 'Giriş bölgesini ayrıca ısıtır',
      electricBenefit3: 'Hava akımı ve ısıtma tek cihazda',
      electricBenefit4: 'Isıtma isteniyorsa seçilir',
      electricBestFor1: 'Isıtılacak girişler',
      electricBestFor2: '',
      electricBestFor3: '',
      electricBestFor4: '',
      electricNotFor1: 'Isıtılmayacak girişler',
      electricNotFor2: '',
      ambientTitle: 'Isıtıcısız',
      ambientSubtitle: 'Isıtmasız modeller',
      ambientBenefit1: 'Yalnızca hava akımı oluşturur',
      ambientBenefit2: 'Aşağı yönlü hava akımı',
      ambientBenefit3: 'Vortice AD ailesi',
      ambientBenefit4: 'Isıtma istenmiyorsa seçilir',
      ambientBestFor1: 'Isıtılmayacak girişler',
      ambientBestFor2: '',
      ambientBestFor3: '',
      ambientBestFor4: '',
      ambientNotFor1: 'Isıtma istenen girişler',
      ambientNotFor2: '',
      advantagesLabel: 'ÖZELLİKLERİ',
      bestForLabel: 'UYGUN:',
      notForLabel: 'TERCİH EDİLMEZ:',
      modelsCta: '{{title}} Modelleri',
      stillUndecided: 'Hala kararsız mısınız?',
      wizardPitch: 'Kararsızsanız kapı ölçüsü ve ısıtma isteğinizi girerek ön değerlendirme yapabilirsiniz.',
      helpMe: 'Bana Yardım Et',
    },
    bottomCta: {
      nextStep: 'Sıradaki Adımınız',
      helpText: 'Sorularınızı {{category}} için iletebilirsiniz.',
      viewAllProducts: 'Tüm ürünleri görüntüle',
      findFit: 'Seçim Sihirbazını Aç',
      findFitDesc: 'Ön hesap yapın',
      expertSupport: 'İletişim Formu',
      expertSupportDesc: 'Proje sorusu iletin',
      backToTop: 'Başa Dön',
    },
    problemSection: {
      headerTitle: 'Açık Kapıda Hava ve Isı Geçişi',
      headerSubtitle: 'Kapı açık kaldığında iç ve dış ortam havası birbirine karışır.',
      energyLossTitle: 'Enerji Kaybı',
      energyLossDesc: 'Kapı açıkken iç ve dış ortam arasında ısı geçişi',
      tempDiffTitle: 'Sıcaklık Farkı',
      tempDiffDesc: 'Kapı açıldığında iç ve dış ortam arasında ısı geçişi olur',
      airflowTitle: 'Hava Akışı',
      airflowDesc: 'Açık kapıdan dış hava girişi',
      pestTitle: 'Toz ve Böcek Girişi',
      pestDesc: 'Kapı açıkken içeri toz ve böcek girişi',
      crossMark: '❌',
      checkMark: '✓',
      withoutTitle: 'Hava Perdesi Olmadan',
      withoutPoint1: 'İç ve dış hava karışır',
      withoutPoint2: 'Sıcak ve soğuk hava geçebilir',
      withoutPoint3: 'Toz içeri girebilir',
      withoutPoint4: 'Toz ve böcek girebilir',
      withTitle: 'Hava Perdesi İle',
      withPoint1: 'Görünmez hava bariyeri',
      withPoint2: 'Hava ve ısı geçişini sınırlar',
      withPoint3: 'Toz girişini sınırlar',
      withPoint4: 'Üreticiye göre toz ve böcek girişini önler',
    },
    landing: {
      expertiseArea: 'Ürün Kategorisi',
      descriptionFallback: 'Ürün ailelerini teknik özellikleriyle inceleyin.',
      detailedReview: 'Detaylı İncele',
      viewModels: 'Modelleri Gör',
      dehumidifierTitle: 'Nem Alma Cihazları',
      dehumidifierDesc: 'Katalogda Vortice Deumido nem alma cihazları yer alır; teknik özellikler ürün sayfalarında verilir.',
      dehumidifierCapacityValue: '',
      dehumidifierCapacityLabel: 'Kapasite',
      dehumidifierNoiseValue: '',
      dehumidifierNoiseLabel: 'Ses Seviyesi',
      modelsSuffix: 'Modelleri',
      filterAll: 'Tüm Modeller',
      venthubSolution: 'VentHub Çözümü',
    },
    series: {
      technicalFamily: 'Teknik Ürün Ailesi',
      heroDefaultDesc: 'Ürünleri teknik ürün ailelerine göre inceleyin; özellik tabloları ürün sayfalarındadır.',
      seriesDetail: 'Ürün Ailesi Detayı',
      requestQuote: 'Teklif Alın',
      colModel: 'Model',
      colPrice: 'Fiyat',
      colAction: 'İşlem',
      skuLabel: 'SKU: {{sku}}',
      trust1Title: 'Teknik Föy',
      trust1Desc: 'Ürün sayfalarında teknik föy ve özellik tabloları yer alır.',
      trust2Title: 'Ürün Seçici',
      trust2Desc: 'Hacim, debi ve basınç girdileriyle ön değerlendirme yapar.',
      trust3Title: 'Soru ve Teklif',
      trust3Desc: 'Sorularınızı form ya da e-posta ile iletebilirsiniz.',
    },
    loading: 'Kategoriler hazırlanıyor...',
    notFound: 'Kategori bulunamadı',
    backHome: 'Ana Sayfaya Dön',
    breadcrumbHome: 'Ana Sayfa',
    breadcrumbAria: 'Sayfa yolu',
    premiumCollection: 'Lineo Quiet Ailesi',
    findModel: 'Bana Uygun Modeli Bul',
    productCount: 'Ürün Sayısı',
    showcase: {
      defaultDescription: 'Bu kategorideki ürün aileleri, modeller ve teknik özellik tabloları.',
      // REC-113: TR yüzeyde EN sızıntısıydı. Aynı sözlükte zaten 'Premium Kalite'
      // örneği var — 'Premium' Türkçede yerleşik, çevrilen kısım geri kalanı.
      premiumTitle: 'Ürün Kataloğu',
      catalog: 'Kategori Kataloğu',
      subGroups: 'Alt Kategoriler',
      exploreSeries: 'Ürün Ailelerini İncele',
      guarantee: 'VentHub Kataloğu',
      discover: 'Keşfet',
      whyVenthubTitle: 'Katalogda Neler Var?',
      premiumEngineeringAlt: 'Kategori görseli',
      features: [
        { title: 'Teknik Föy', desc: 'Ürün sayfalarında teknik föy ve özellik tabloları yer alır.' },
        { title: 'Ürün Seçici', desc: 'Kanal fanı, ısı geri kazanım, hava perdesi ve jet fan için ön hesaplar.' },
        { title: 'Teklifle Sipariş', desc: 'Teslimat koşulları teklif aşamasında projenize göre netleştirilir.' }
      ]
    },
    discoverMore: 'Devamını Keşfet',
    whichAirCurtain: 'Hangi Hava Perdesini Seçmelisiniz?',
    airCurtainHelper: 'Seçimi kapı ölçüsü ve girişte ısıtma isteği belirler.',
    ambientAir: 'Ortam Havası (Isıtıcısız)',
    ambientAirDesc: 'Isıtmasız modeller (Vortice AD) yalnızca kapı açıklığında hava akımı oluşturur ve girişi ısıtmaz.',
    electricHeated: 'Elektrikli Isıtıcılı',
    electricHeatedDesc: 'Elektrikli ısıtıcılı modeller, kapıdan geçen hava akımını ısıtır; girişte ısıtma sağlar.',
    ambientPoint1: 'Yalnızca hava akımı oluşturur.',
    ambientPoint2: 'Girişte ısıtma istenmiyorsa bu tip seçilir.',
    ambientPoint3: 'Kapı açıklığında hava akımıyla sıcak ve soğuk havanın geçişini engeller.',
    electricPoint1: 'Kapı açıklığında ısıtılmış hava akımı oluşturur.',
    electricPoint2: 'Isıtma yalnızca kapıdan geçen hava akımına uygulanır.',
    electricPoint3: 'Mağaza ve restoran girişlerinde tipik uygulama alanıdır.',
    inspectModels: 'Modelleri İncele',
    modernLiving: 'Modern Yaşam Alanları',
    modernLivingDesc: 'Dış gövdeye entegre ses emici kaplamalı kanal fanı.',
    flexibilityEsthetics: 'Ölçü ve Motor Seçeneği',
    smartControl: 'Akıllı Kontrol',
    smartControlDesc: 'Üreticiye göre EC fırçasız motorlu LINEO QUIET ES düşük enerji tüketir.',
    longTermInvestment: 'Kapı ölçüsüne göre seçim',
    longTermInvestmentDesc: 'Üretici, EC fırçasız LINEO QUIET ES için düşük enerji tüketimi belirtiyor.',
    allSeries: 'Tüm Alt Kategoriler',
    chooseSeriesDesc: 'İhtiyacınıza uygun alt kategoriyi seçin.',
    inspectSeries: 'Alt Kategoriyi İncele',
    whyCategory: 'Neden {{category}}?',
    electricVsAmbientAlt: 'Elektrikli vs Ortam Havalı Karşılaştırma',
    modernLoftAlt: 'Vortice Lineo Quiet kanal fanının iç mekânda gösterildiği çizim',
    lineoQuietQuote: 'Lineo Quiet ES, ses emici kaplamalı, EC fırçasız motorlu karma akışlı bir kanal fanıdır.',
    industrialLabAlt: 'Endüstriyel Laboratuvar Uygulaması',
    lineoTechnicalAlt: 'Lineo Quiet Teknik Detay',
    vorticeHeritageAlt: 'Vortice markası ve Tribiano (İtalya) merkezi',
    airCurtainDiagramAlt: 'Hava Perdesi Çalışma Prensibi',
    whyCategorySubtitle: 'Katalogda ürün aileleri, ürün sayfaları ve teknik özellik tabloları bulunur.',
    lineoTechnologyTitle: 'Vortice Lineo Quiet ES Teknolojisi',
    howItWorksTitle: 'Nasıl Çalışır?',
    lineoTechnologyDesc: 'Karma akışlı kanal fanı; AC endüksiyon ve EC fırçasız motor seçenekleriyle.',
    howItWorksDesc: 'Hava perdesi, görünmez bir bariyer oluşturarak iç ve dış ortamı birbirinden ayırır.',
    why1Title: 'Teknik Föyler',
    why1Desc: 'Teknik değerler (motor, debi ve basınç) ürün sayfasındaki teknik tabloda yer alır.',
    why2Title: 'Ses Değerleri',
    why2Desc: 'Ses seviyesi bilgisi ürün sayfasındaki teknik tabloda yer alır.',
    why3Title: 'Belge ve Kılavuz',
    why3Desc: 'Ürün kullanım kılavuzu ve üretici belgesi, montaj ve bakım için başvuru kaynağıdır.',
    airflow: 'Hava Debisi (m³/h)',
    brands: 'Markalar',
    clean: 'Temizle',
    clearFilters: 'Filtreleri Temizle',
    close: 'Kapat',
    feature: 'Özellik',
    filters: 'Filtreler',
    localSearchPlaceholder: 'Bu kategori içinde ara (ad/marka/model/SKU)',
    noProducts: 'Ürün Bulunamadı',
    noise: 'Ses Seviyesi [dB(A)] (Maks)',
    open: 'Aç',
    pressure: 'Basınç (Pa)',
    subcategories: 'Alt Kategoriler',
    howItWorksAirCurtain: {
      title: 'Hava Perdesi Nasıl Çalışır?',
      subtitle: 'Kapı boyunca aşağı doğru üflenen bir hava akımı',
      diagramAlt: 'Hava Perdesi Çalışma Prensibi',
      steps: [
        {
          title: 'Hava Akımı',
          description: 'Cihaz, kapı boyunca aşağı doğru bir hava akımı üfler.',
          detail: 'Isıtmasız modeller yalnızca hava akımı oluşturur; elektrikli ısıtıcılı modeller girişi ayrıca ısıtır.'
        },
        {
          title: 'Görünmez Bariyer',
          description: 'Hava akışı, kapı açıklığında görünmez bir perde oluşturur.',
          detail: 'Bu hava perdesi, iç ve dış ortamı fiziksel bir engel olmadan birbirinden ayırır.'
        },
        {
          title: 'Ayrım',
          description: 'Dış havanın ve tozun içeri girmesini sınırlar.',
          detail: 'İç ve dış ortam arasındaki ısı geçişi sınırlanır.'
        },
        {
          title: 'Kullanım Yerleri',
          description: 'Mağaza, market girişi, restoran ve depo kapıları tipik uygulama alanlarıdır.',
          detail: 'Seçimi kapı ölçüsü ve ısıtma isteği belirler.'
        }
      ]
    },
    vorticeBrand: {
      compassoDoro: '',
      italianEngineering: 'İtalya Merkezli Marka',
      whyVortice: 'Neden Vortice?',
      description1: 'Vortice, İtalya merkezli bir havalandırma markasıdır; katalogda fan, hava perdesi ve ısı geri kazanım ürünleriyle yer alır.',
      description2: 'Modeller, teknik föy ve özellik tabloları ürün sayfalarında yer alır; kanal fanı, hava perdesi ve ısı geri kazanım için Ürün Seçici’de ön hesap yapabilirsiniz.',
      authorizedDealer: 'Teknik Veriler',
      ceCertified: 'Hesaplayıcılar',
      // REC-104 ikinci tur: "2 Yıl Garanti" rakamı Recep hükmüyle kalkmıştı ama YALNIZ
      // güven şeridinden kaldırılmıştı; AYNI SAYFADAKI bu Vortice rozeti gözden kaçtı ve
      // canlıda ölçülünce görüldü. Kendi destek sayfamız "garanti kapsamı üretici/
      // ithalatçıya göre değişebilir" diyor — sabit süre vaat edilemez.
      // Anahtar adı `warranty2y` yanıltıcı hale geldiği için `warranty` oldu.
      warranty: 'Teklifle Sipariş',
      premiumComfort: 'Kapı üstünde hava perdesi',
      authorizedDealerNotice: 'Vortice modelleri için form ya da e-posta ile teklif isteyin.',
      highlights: [
        {
          value: '',
          label: '',
          desc: 'İtalya merkezli marka'
        },
        {
          // URN-95: değer sözlükte DEĞİL sunucudan gelen katalog sayısıdır (`vorticeSayac.ts`, 1. kart = ürün ailesi,
          // 2. kart = aktif model); sayı yoksa kart çizilmez. Yer tutucu (`{aile}`/`{model}`) YAZILMAZ.
          value: '',
          label: 'Vortice Ürün Ailesi',
          desc: 'Katalogda yer alan'
        },
        {
          value: '',
          label: 'Vortice Aktif Model',
          desc: 'Katalogdaki Vortice modelleri'
        },
        {
          value: 'İtalya',
          label: 'Ülke',
          desc: 'Merkez: Tribiano (Milano)'
        }
      ]
    }
  },
  pdp: {
    // Teknik ozellik ALAN adlari — specLabel.ts 'pdp.specs.<anahtar>' yolunu arar.
    // Kaynak: canli DB technical_specs anahtarlari (2026-08-22, 73 tekil anahtar; 2026-09-23 77 —
    // atex_zone, max_total_pressure_pa, permissible_motor_power_w eklendi, product-schema-standard).
    // Birim etikete GIRMEZ — deger tarafi formatSpecValue ile birimi kendi ekler.
    // TEK ISTISNA: max_delivery_m3h / max_delivery_ls ayni 180 uründe BIRLIKTE bulunur;
    // birim yazilmazsa iki satir ayni etiketle farkli sayi gosterir ve celiskili okunur.
    specs: {
      absorbed_current_a: 'Çekilen Akım',
      airflow_speed_max_ms: '2. Kademe Hava Hızı',
      airflow_speed_min_ms: '1. Kademe Hava Hızı',
      atex_marking: 'ATEX İşareti',
      atex_zone: 'ATEX Kullanım Bölgesi',
      blade_diameter_mm: 'Pervane Çapı',
      co2_sensor: 'CO2 Sensörü',
      compatible_model: 'Uyumlu Model',
      connection_height_mm: 'Bağlantı Yüksekliği',
      connection_width_mm: 'Bağlantı Genişliği',
      diameter_mm: 'Çap',
      discharge_type: 'Hava Çıkış Yönü',
      discharge_velocity_curve: 'Üfleme Hızı Eğrisi',
      drive_code: 'Sürücü Kodu',
      enclosure_class: 'Muhafaza Tipi',
      enclosure_size: 'Muhafaza Boyutu',
      electrical_protection_class: 'Elektrik Koruma Sınıfı',
      erp_compliant: 'ErP Uyumlu',
      filter_classes: 'Filtre Sınıfı',
      fire_rating: 'Yangın Sınıfı',
      frequency_hz: 'Frekans',
      has_bypass: 'Bypass',
      has_humidistat: 'Higrostat',
      has_timer: 'Zamanlayıcı',
      heating_capacity_kw: 'Isıtma Kapasitesi',
      heating_power_w: 'Isıtıcı Gücü',
      height_mm: 'Yükseklik',
      humidity_removed_l_24h: 'Nem Alma Kapasitesi (24 Saat)',
      insulation_class: 'Yalıtım Sınıfı',
      ip_rating: 'Koruma Sınıfı (IP)',
      length_mm: 'Uzunluk',
      max_absorbed_power_w: 'Maksimum Çekilen Güç',
      max_ambient_temp_c: 'Maksimum Ortam Sıcaklığı',
      max_current_a: 'Maksimum Akım',
      max_delivery_ls: 'Maksimum Debi (l/s)',
      max_delivery_m3h: 'Maksimum Debi (m³/h)',
      max_operating_temperature_c: 'Maksimum Çalışma Sıcaklığı',
      max_static_pressure_pa: 'Maksimum Statik Basınç',
      max_total_pressure_pa: 'Maksimum Toplam Basınç',
      max_voltage_v: 'Maksimum Voltaj',
      min_delivery_m3h: 'Minimum Debi',
      min_operating_temperature_c: 'Minimum Çalışma Sıcaklığı',
      min_static_pressure_pa: 'Minimum Statik Basınç',
      min_voltage_v: 'Minimum Voltaj',
      motor_efficiency_class: 'Motor Verim Sınıfı',
      motor_poles: 'Motor Kutup Sayısı',
      motor_type: 'Motor Tipi',
      noise_level_db_a: 'Ses seviyesi (üretici beyanı)',
      noise_lpa_3m_db: 'Ses Basıncı (3 m)',
      nominal_delivery_m3h: 'Nominal Debi',
      nominal_static_pressure_pa: 'Nominal Statik Basınç',
      number_of_blades: 'Kanat Sayısı',
      number_of_speeds: 'Hız Kademesi Sayısı',
      operating_temperature_c: 'Çalışma Sıcaklığı',
      optional_heater_power_w: 'Opsiyonel Isıtıcı Gücü',
      permissible_motor_power_w: 'İzin Verilen En Yüksek Motor Gücü',
      phase: 'Faz',
      pm10_sensor: 'PM10 Sensörü',
      pm2_5_sensor: 'PM2.5 Sensörü',
      pq_curve: 'Basınç-Debi Eğrisi',
      rated_output_current_a: 'Anma Çıkış Akımı',
      rated_power_w: 'Anma Gücü',
      refrigerant_type: 'Soğutucu Gaz Tipi',
      relative_humidity_sensor: 'Nem Sensörü',
      reversible: 'Ters Dönüş',
      rpm_max: 'Maksimum Devir Hızı',
      size_a_mm: 'Genişlik (A)',
      size_b_mm: 'Derinlik (B)',
      size_c_mm: 'Yükseklik (C)',
      size_d_mm: 'Boyut (D)',
      tank_capacity_l: 'Su Tankı Kapasitesi',
      temp_sensor: 'Sıcaklık Sensörü',
      thermal_efficiency_curve: 'Isıl Verim Eğrisi',
      thermal_efficiency_pct: 'Isıl Verim',
      voc_sensor: 'VOC Sensörü',
      voltage_alt_v: 'Alternatif Voltaj',
      voltage_v: 'Voltaj',
      weight_kg: 'Ağırlık',
      width_mm: 'Genişlik',
      wiring: 'Bağlantı Tipi'
    },
    // Teknik ozellik DEGER metinleri (URN-58) — formatSpecValue mantiksal (true/false) degeri buradan basar.
    // Ham "true"/"false" musteriye gitmez; canli kapi SPEC-HAM-DEGER yayindaki sayfada bunu olcer.
    specValues: {
      yes: 'Var',
      no: 'Yok'
    },
    // Teknik ozellik GRUP basliklari — specLabel.ts 'pdp.specGroups.<grup>' yolunu arar.
    // Bunlar yoksa groupTechnicalSpecs'in HARDCODED Turkce etiketi kullaniliyordu:
    // EN sayfada da Turkce basiyordu (CLAUDE.md Kural 7 ihlali).
    specGroups: {
      performance: 'Performans Ölçüleri',
      physical: 'Fiziksel Ölçüler',
      electrical: 'Elektriksel Veriler',
      other: 'Diğer Özellikler'
    },
    variant: {
      heading: 'Model Seçimi',
      count: '{{count}} model',
      searchPlaceholder: 'Model ara (SKU / kod)',
      noMatch: 'Eşleşen model yok',
      viewList: 'Liste',
      viewMatrix: 'Karşılaştır',
      colModel: 'Model',
      colPrice: 'Fiyat',
      quote: 'Teklif',
      selectAria: 'Modeli seç: {{model}}',
      selectedModel: 'Seçili model',
      showAll: 'Tüm modelleri gör ({{count}})',
      singleModel: 'Bu ailede tek model bulunuyor.',
    },
    videoAuthority: {
      unsupportedProvider: 'Desteklenmeyen Sağlayıcı',
    },
    authorityRenderer: {
      unknownBlockType: 'Bilinmeyen Blok Tipi:',
    },
    threeDAuthority: {
      interactiveView: '3D Interaktif Görünüm',
      clickToInitialize: 'Motoru Başlatmak İçin Tıklayın',
      loadingModel: '3D Model Yükleniyor',
      dragToRotate: 'Döndürmek İçin Sürükleyin',
    },
    productNotFound: 'Ürün Bulunamadı',
    backHome: 'Ana Sayfaya Dön',
    back: 'Geri Dön',
    featured: 'Öne Çıkan',
    brand: 'Marka',
    model: 'Model',
    inStock: 'Teklifle netleşir',
    outOfStock: 'Teklif İste',
    vatIncluded: '(KDV Dahil)',
    vatExcluded: '(+KDV)',
    qty: 'Adet:',
    addToCart: 'Teklif İste',
    techQuote: 'Teknik Teklif İste',
    // ⛔descFallback KALDIRILDI (REC-148 A4, 2026-09-05): "yakında eklenecektir" bir vaatti.
    // Açıklama yoksa artık kart HİÇ çizilmiyor (K7: varsa satır, yoksa satır hiç yok).
    relatedProducts: 'İlgili Ürünler',
    officialDistributor: 'ÜRETİCİ VERİSİ',
    priceAvailability: 'Fiyat ve Teklif',
    quoteLabel: 'Teklif',
    shareCopied: 'Link kopyalandı!',
    messages: {
      pdfStarted: 'PDF üretiliyor...'
    },
    errors: {
      pdfFailed: 'PDF üretilemedi.'
    },
    labels: {
      productDescription: 'Ürün Açıklaması',
      category: 'Kategori',
      noSpecsAvailable: 'Bu ürün için teknik özellik bulunmamaktadır.',
      approxCurve: 'Yaklaşık eğri — üretici grafiğinden ayrıntılandırılıyor.',
      technicalDatasheet: 'TEKNİK VERİ SAYFASI',
      engineeringAnalysis: 'Teknik Özet',
      /** Ürün sayfasındaki kod satırının etiketi: değer `model_code`'dur, iç SKU değil (URN-32). */
      modelCode: 'Model Kodu',
      datasheetPdf: 'TEKNİK DOKÜMAN (PDF)'
    },
    actions: {
      interactive3D: '3D GÖRÜNÜM',
      addToProject: 'Projeye Ekle',
      removeFromWishlist: 'Favorilerden Kaldır',
      addToWishlist: 'Favorilere Ekle',
      favorite: 'Favori',
      share: 'Paylaş'
    },
    certLabels: {
      standard: 'Standart',
    },
    sections: {
      general: 'Genel Bilgiler',
      models: 'Modeller',
      specs: 'Teknik Özellikler'
    },
    trust: {
      // REC-104: freeShipping ve securePayment KALDIRILDI — PDP'de tek CTA
      // "Teknik Teklif İste" iken hemen altında "Ücretsiz Kargo · Güvenli Ödeme"
      // yazıyordu. Bkz. docs/standards/vaat-butunlugu-standard.md
      // Kalan rozet "Garanti" değil "Üretici Garantisi" — garantiyi veren biz değiliz.
      warranty: 'Garanti Bilgisi'
    },
    engineering: {
      noise: {
        ultraQuiet: {
          label: 'Düşük Ses Seviyesi',
          desc: 'Ses seviyesi {{esik1}} dB(A) altında olan modeller.'
        },
        officeComfort: {
          label: 'Orta-Düşük Ses Seviyesi',
          desc: 'Ses seviyesi {{esik1}}–{{esik2}} dB(A) aralığında olan modeller.'
        },
        standard: {
          label: 'Standart Ses Seviyesi',
          desc: 'Ses seviyesi {{esik2}}–{{esik3}} dB(A) aralığında olan modeller.'
        },
        industrial: {
          label: 'Ses seviyesi: {{esik3}} dB(A) ve üzeri',
          desc: 'Ses seviyesi {{esik3}} dB(A) ve üzerinde olan modeller.'
        }
      },
      efficiency: {
        diamond: {
          label: 'Isıl Verim %{{esik1}} ve Üzeri',
          desc: 'Isıl verimi %{{esik1}} ve üzerinde olan modeller.'
        },
        platinum: {
          label: 'Isıl Verim %{{esik2}}–{{esik1}}',
          desc: 'Isıl verimi %{{esik2}} ile %{{esik1}} arasında olan modeller.'
        },
        gold: {
          label: 'Isıl Verim %{{esik3}}–{{esik2}}',
          desc: 'Isıl verimi %{{esik3}} ile %{{esik2}} arasında olan modeller.'
        }
      },
      motor: {
        ec: {
          label: 'EC Motor Teknolojisi',
          desc: 'Fırçasız (EC) motorlu model.'
        },
        ac: {
          label: 'AC Motor Teknolojisi',
          desc: 'AC motorlu model.'
        }
      },
      capacity: {
        highFlow: {
          label: 'Hava Debisi Kapasitesi',
          desc: 'Hava debisi {{esik1}}–{{esik2}} m³/h aralığında olan modeller.'
        },
        industrialFlow: {
          label: 'Debi: {{esik2}} m³/h üzeri',
          desc: 'Hava debisi {{esik2}} m³/h üzerinde olan modeller.'
        }
      }
    }
  },
  quickView: {
    title: 'Hızlı Bakış',
    close: 'Kapat',
    addToCart: 'Teklif için listeye ekle',
    viewProduct: 'Ürünü Gör',
    // ⛔descFallback KALDIRILDI (REC-148 A5) — açıklama yoksa paragraf hiç çizilmiyor.
  },
  support: {
    contactCta: {
      title: 'Aradığınız cevabı bulamadınız mı?',
      subtitle: 'Sorunuzu iletişim formu ya da info@venthub.com.tr ile iletin.',
      button: 'E-posta ile sorun',
    },
    links: {
      faq: 'SSS',
      returns: 'İade ve Değişim',
      shipping: 'Kargo ve Teslimat',
      warranty: 'Garanti ve Servis'
    },
    home: {
      subtitle: 'İhtiyacınız olan bilgilere hızlıca ulaşın.',
      warrantyDesc: 'Garanti kapsamı üretici/ithalatçıya göre değişebilir',
    },
    // Sayfa üst verisi (meta açıklama) — bot karnesi 2026-09-24: bu dört sayfa varsayılan site
    // açıklamasını basıyordu. Yeni vaat YOK: yalnız sayfanın zaten anlattığı konu adlandırılır.
    //
    // SEO-32 (URN-91): açıklamalar sayfa gövdesinin kendi cümlelerinden yazıldı (110-155 karakter).
    // Başlık anahtarları (`*Title`) YALNIZ <title> içindir: `support.links.*` menüde ve sayfa H1'inde,
    // `support.returns.title` iade sayfası H1'inde okunur; ayrı anahtar olmasaydı görünür başlık da değişirdi.
    seo: {
      // Sekme başlığı: sayfa H1'i "SSS" kısaltmasıdır; arama sonucunda kısaltma ve tam ad birlikte okunur.
      faqTitle: 'SSS: Sık Sorulan Sorular',
      faq: 'Teklif talebinin ve kurulum sorularının nasıl iletileceği, ödeme yöntemleri hakkında sık sorulan sorular ve cevapları. VentHub destek sayfası.',
      shippingTitle: 'Kargo ve Teslimat Bilgileri',
      shipping: 'Teslimat süresi ve sevkiyat koşulları teklif aşamasında netleştirilir. Kargo ücreti ve firması teklifte belirtilir; takip numarası e-posta ile iletilir.',
      returnsTitle: 'İade ve Değişim Koşulları',
      returns: 'Cayma hakkı, iade koşulları ve iade talebinin sipariş numarasıyla iletişim formu ya da e-posta ile nasıl iletileceği hakkında bilgi.',
      warrantyTitle: 'Garanti ve Servis: Kapsam ve Arıza Soruları',
      warranty: 'Garanti kapsamı üretici/ithalatçıya göre değişebilir. Garanti belgesini ve kılavuzu saklayın; servis ve arıza sorularını form ya da e-posta ile iletin.',
    },
    returns: {
      title: 'İade ve Değişim',
      // REC-104: koşullar yasal metin, kalıyor; ama çevrimiçi satış kapalıyken
      // hangi durumda geçerli olduklarını sayfanın kendisi söylemeli.
      onlineKapaliNotu: 'Online satış şu an kapalıdır; aşağıdaki koşullar online satış açıldığında geçerlidir.',
      desc1: '14 gün içinde cayma hakkınızı kullanabilirsiniz. Ürün kullanılmamış, faturası ve tüm aksesuarlarıyla birlikte yeniden satılabilir durumda olmalıdır.',
      desc2: 'İade talebi için lütfen sipariş numaranızla birlikte iletişim formu ya da e-posta ile yazın.'
    },
    shipping: {
      desc1: 'Teslimat süresi ve sevkiyat koşulları, teklif aşamasında projenize göre netleştirilir.',
      // REC-104: "ödeme adımında gösterilir" cümlesi var olmayan bir adıma atıf yapıyordu
      // (çevrimiçi ödeme kapalı). Bilgi teklifte veriliyor.
      desc2: 'Kargo ücreti ve firması teklifinizde belirtilir. Takip numarası e-posta ile iletilir.'
    },
    warranty: {
      desc1: 'Garanti kapsamı üretici/ithalatçı firmaya göre değişiklik gösterebilir. Lütfen garanti belgesi ve kullanım kılavuzunu saklayınız.',
      desc2: 'Servis ve arıza sorularınızı iletişim formu ya da e-posta ile iletebilirsiniz.'
    },
    faq: {
      // REC-104: q1/a1 ve a2 çevrimiçi ödeme varmış gibi yazılmıştı. Metinler
      // checkout.kapali bloğuyla AYNI gerçeği söyleyecek şekilde hizalandı
      // ("aynı gün dönüş" vaadi oradan alındı, yeni vaat üretilmedi).
      q1: 'Teklif talebimi nasıl iletebilirim?',
      a1: 'İletişim formu ya da e-posta ile teklif isteyebilirsiniz.',
      q2: 'Ödeme yöntemleri nelerdir?',
      a2: 'Çevrimiçi ödeme henüz açık değil. Sipariş için bizden teklif isteyebilirsiniz.',
      q3: 'Kurulum sorusunu nasıl iletebilirim?',
      a3: 'Kurulum sorularınızı iletişim formu ya da e-posta ile iletebilirsiniz.'
    }
  },
  account: {
    tabs: {
      overview: 'Genel Bakış',
      orders: 'Siparişlerim',
      shipments: 'Kargolarım',
      addresses: 'Adreslerim',
      invoices: 'Fatura Profilleri',
      returns: 'İade Taleplerim',
      quotes: 'Tekliflerim',
      profile: 'Profilim',
      security: 'Güvenlik',
      // GRUP başlıkları (sekme değil): sol menüde öğeleri toplayan ara başlıklar.
      // `listsGroup` deseninin devamı — REC-125'te iki grup başlığı koda SABİT
      // yazılmıştı ('Sipariş & Kargo', 'Hesap Yönetimi'), yani EN kullanıcıya da
      // Türkçe düşüyordu ve hiçbir kapı görmüyordu (sözlükte olmayan metin,
      // parite testinin de INV-5'in de evreni dışındadır).
      ordersGroup: 'Sipariş & Kargo',
      accountGroup: 'Hesap Yönetimi',
      listsGroup: 'Listelerim',
      favorites: 'Favorilerim',
      projects: 'Projelerim',
      dataRequests: 'KVKK Başvurum'
    },
    dataRequests: {
      title: 'KVKK Başvurum',
      subtitle: 'Kişisel verilerinize ilişkin taleplerinizi buradan iletin, süreci izleyin',
      typeLabel: 'Talep Türü',
      submit: 'Başvuruyu Gönder',
      submitted: 'Başvurunuz alındı',
      submitError: 'Başvuru gönderilemedi',
      authRequired: 'Başvuru için giriş yapmanız gerekiyor',
      loadError: 'Başvurularınız yüklenemedi',
      myRequests: 'Başvurularım',
      emptyDesc: 'Henüz bir başvurunuz yok.',
      receivedAt: 'Alındı: {{date}}',
      daysLeft: 'Yanıt için {{days}} gün kaldı',
      overdue: 'Yasal süre aşıldı',
      finalized: 'Sonuçlandı',
      retainedLabel: 'Saklanan veri',
      noticeTitle: 'Bilmeniz gerekenler',
      noticeBody: 'Başvurunuz hesabınızdaki e-posta adresiyle kaydedilir ve en geç 30 gün içinde ücretsiz sonuçlandırılır. Silme talebinde, kanunen saklamak zorunda olduğumuz sipariş ve fatura kayıtları silinmez; kişiyle bağı koparılarak anonimleştirilir ve size hangi verinin neden saklandığı yazılı olarak bildirilir.',
      types: {
        access: 'Verilerime erişmek / öğrenmek istiyorum',
        rectification: 'Verilerimin düzeltilmesini istiyorum',
        erasure: 'Verilerimin silinmesini istiyorum',
        portability: 'Verilerimin aktarılmasını istiyorum',
        objection: 'İşlemeye itiraz ediyorum',
        restriction: 'İşlemenin kısıtlanmasını istiyorum',
      },
      statuses: {
        received: 'Alındı',
        identity_pending: 'Kimlik doğrulaması bekleniyor',
        in_progress: 'İnceleniyor',
        completed: 'Sonuçlandı',
        rejected: 'Reddedildi',
      },
    },
    favorites: {
      title: 'Favorilerim',
      subtitle: 'Beğendiğiniz ürünleri burada saklayın',
      emptyTitle: 'Henüz favori ürününüz yok',
      emptyDesc: 'Ürün sayfalarındaki kalp simgesiyle favorilerinize ekleyin.',
      browseCta: 'Ürünlere Göz At',
      remove: 'Favorilerden çıkar',
      loadError: 'Favoriler yüklenemedi',
    },
    projects: {
      title: 'Projelerim',
      subtitle: 'Proje listelerinizi yönetin, ürünleri projelere göre gruplayın',
      create: 'Oluştur',
      emptyTitle: 'Henüz bir projeniz yok',
      emptyDesc: 'Yukarıdan yeni bir proje oluşturun veya ürün sayfasındaki "Projeye Ekle" ile başlayın.',
      deleteProject: 'Projeyi sil',
      deleteConfirm: 'Bu projeyi ve içindeki ürün listesini silmek istediğinize emin misiniz?',
      noItems: 'Bu projede henüz ürün yok.',
      removeItem: 'Projeden çıkar',
      qty: 'Adet: {{count}}',
      toasts: {
        authRequired: 'Oturum açmanız gerekiyor.',
        created: 'Proje başarıyla oluşturuldu.',
        createError: 'Proje oluşturulamadı.',
        deleted: 'Proje silindi.',
        deleteError: 'Proje silinemedi.',
        itemAdded: 'Ürün projeye eklendi.',
        itemAddError: 'Ürün eklenemedi.',
        itemRemoved: 'Ürün projeden çıkarıldı.',
        itemRemoveError: 'Ürün çıkarılamadı.',
      },
    },
    orderDetail: {
      shippingMethod: 'Teslimat Yöntemi',
      express: 'Ekspres',
      standard: 'Standart',
      expressDetail: 'Ekspres (süre teklifte)',
      standardDetail: 'Standart (süre teklifte)',
      invoiceInfo: 'Fatura Bilgileri',
      typeLabel: 'Tip:',
      companyTitleLabel: 'Ünvan:',
      vknLabel: 'VKN:',
      taxOfficeLabel: 'Vergi Dairesi:',
      tcknLabel: 'TCKN:',
      legalConsents: 'Yasal Onaylar',
      consentAccepted: 'Kabul Edildi',
      consentNone: 'Onay Yok',
      consentDistanceSales: 'Mesafeli Satış',
      consentPreInfo: 'Ön Bilgilendirme',
      consentOrderConfirm: 'Sipariş Onayı',
      consentMarketing: 'Pazarlama İzni',
      orderNoSuffix: ': {{code}}',
      demoBadge: 'DEMO',
    },
    returns: {
      subtitle: 'İade taleplerinizi oluşturun ve süreç durumunu takip edin.',
      filterStatus: 'Durum:',
      filterAll: 'Tümü ({{count}})',
      emptyTitle: 'Henüz hiç iade talebiniz yok',
      orderLabel: 'Sipariş {{code}}',
      reasonField: 'İade Sebebi',
      descriptionField: 'Açıklama',
      processTitle: 'İade Süreci',
      reasonWrongProduct: 'Yanlış ürün/eksik parça',
      reasonDamaged: 'Hasarlı ürün',
      reasonIncompatible: 'Uyumsuz/istenen özelliklerde değil',
      reasonChangedMind: 'Fikrim değişti',
      reasonOther: 'Diğer',
      timelineRequested: 'Talep Alındı',
      timelineApproved: 'Onaylandı',
      timelineInTransit: 'Kargoda (İade)',
      timelineReceived: 'İade Teslim Alındı',
      timelineRefunded: 'İade Ücreti Ödendi',
    },
    overview: {
      greeting: 'Merhaba,',
      welcomeMessage: 'B2B portalinize hoş geldiniz. Operasyonlarınızı buradan yönetebilirsiniz.',
      activeOrders: 'Aktif Sipariş',
      completedOrders: 'Tamamlanan',
      totalVolume: 'Toplam Hacim',
      shippingAddress: 'Teslimat Adresi',
      billingAddress: 'Fatura Adresi',
      defaultPartnerName: 'Değerli İş Ortağımız',
      loadingDashboard: 'Dashboard Hazırlanıyor...',
      liveTracking: 'Canlı Kargo Takibi',
      orderPrefix: 'Sipariş',
      inTransitSuffix: 'yolda.',
      noActiveShipment: 'Şu anda yolda olan aktif bir siparişiniz bulunmuyor.',
      viewAllShipments: 'Tüm Kargoları Görüntüle',
      noDeliveryHint: 'Aktif bir teslimatınız yok. Yeni bir sipariş verdiğinizde kargo süreçlerini buradan canlı olarak izleyebilirsiniz.',
      browseCatalog: 'Kataloğu İncele',
      recentOrders: 'Son Siparişleriniz',
      viewAll: 'Tümünü Gör',
      noOrders: 'Henüz geçmiş bir siparişiniz bulunmuyor.',
      orderNumber: 'Sipariş {{code}}',
      shippingBillingTitle: 'Teslimat & Fatura',
      defaultShipping: 'Varsayılan Teslimat',
      defaultBilling: 'Varsayılan Fatura',
      noShippingAddress: 'Tanımlı teslimat adresi yok.',
      noBillingAddress: 'Tanımlı fatura adresi yok.',
      manageAddressesBtn: 'Adresleri Yönet',
      securityCenter: 'Güvenlik Merkezi',
      securityCenterDesc: 'Şifrenizi, 2FA ayarlarınızı ve oturum bilgilerinizi güvenli bir şekilde yönetin.',
      viewSecurity: 'Göz At',
      needHelp: 'Desteğe mi ihtiyacınız var?',
      needHelpDesc: 'Sipariş, iade veya bakiye için info@venthub.com.tr adresine yazın.',
      customerService: 'Müşteri Hizmetleri',
      wave: '👋',
      orderHash: '{{code}}',
      shipStatus: {
        delivered: 'Teslim Edildi',
        shipped: 'Kargoda',
        preparing: 'Hazırlanıyor',
        awaitingPayment: 'Ödeme Bekleniyor'
      },
      shipSteps: {
        preparing: 'Hazırlandı',
        shipped: 'Kargoda',
        delivered: 'Teslim Edildi'
      }
    },
    shipments: {
      statusDelivered: 'Teslim Edildi',
      statusShipped: 'Kargoda',
      statusPreparing: 'Hazırlanıyor',
      statusAwaitingPayment: 'Ödeme Bekleniyor',
      stepShipped: 'Kargoya Verildi',
      stepDelivered: 'Teslim Edildi',
      subtitle: 'Siparişlerinizin kargo durumunu ve takip bilgilerini buradan izleyebilirsiniz.',
      statusFilterLabel: 'Durum:',
      filterAll: 'Tümü ({{count}})',
      filterShipped: 'Kargoda ({{count}})',
      filterDelivered: 'Teslim Edildi ({{count}})',
      emptyTitle: 'Henüz kargo bilgisi yok',
      noFilterMatch: 'Bu filtreye uygun kargo bulunmuyor.',
      orderTitle: 'Sipariş {{code}}',
      detail: 'Detay',
      copy: 'Kopyala',
      trackShipment: 'Kargoyu Takip Et',
      preparingLabel: 'Hazırlandı',
      goToOrders: 'Siparişlerime Git'
    },
    addresses: {
      fields: {
        label: 'Adres Başlığı',
        fullName: 'Ad Soyad / Firma',
        phone: 'Telefon',
        addressLine: 'Açık Adres',
        city: 'İl',
        district: 'İlçe',
      },
      placeholders: {
        label: 'Ev, İş, Depo vb.',
        fullName: 'Kişi veya Firma adı',
        addressLine: 'Mahalle, sokak, bina ve daire no...',
      },
      subtitle: 'Siparişlerinizde kolayca seçmek için adreslerinizi yönetin.',
      loading: 'Adresler yükleniyor...',
      emptyTitle: 'Henüz Adres Eklenmemiş',
      emptyDescription: 'Sağ paneldeki formu kullanarak yeni bir teslimat veya fatura adresi ekleyebilirsiniz.',
      shipping: 'Teslimat',
      billing: 'Fatura',
      defaultTag: 'Varsayılan',
      cityLine: '{{district}}, {{city}} {{postal}}',
      title: 'Adreslerim',
      addressLabel: 'Adres',
      noItems: 'Henüz adres eklenmemiş.',
      formTitleEdit: 'Adresi Düzenle',
      formTitleNew: 'Yeni Adres Ekle',
      ph: {
        label: 'Adres Başlığı (Ev, İş)',
        fullName: 'Ad Soyad',
        phone: 'Telefon',
        address: 'Adres',
        city: 'Şehir',
        district: 'İlçe',
        postalCode: 'Posta Kodu'
      },
      toggle: {
        shippingDefault: 'Teslimat için varsayılan',
        billingDefault: 'Fatura için varsayılan'
      },
      makeDefault: 'Varsayılan Yap',
      unregistered: 'Kayıtsız Başlık',
      cancel: 'İptal',
      submit: {
        update: 'Güncelle',
        add: 'Ekle'
      },
      toasts: {
        loadError: 'Adresler yüklenemedi',
        requiredFields: 'Lütfen zorunlu alanları doldurun',
        updated: 'Adres güncellendi',
        created: 'Adres oluşturuldu',
        saveError: 'Kaydetme hatası',
        confirmDelete: 'Bu adresi silmek istediğinizden emin misiniz?',
        deleted: 'Adres silindi',
        deleteError: 'Silme hatası',
        defaultSetShipping: 'Varsayılan teslimat adresi ayarlandı',
        defaultSetBilling: 'Varsayılan fatura adresi ayarlandı',
        updateError: 'Güncelleme hatası'
      }
    },
    invoices: {
      loadError: 'Fatura profilleri yüklenemedi',
      requiredFields: 'Lütfen zorunlu alanları doldurun',
      profileUpdated: 'Profil güncellendi',
      profileCreated: 'Profil oluşturuldu',
      operationFailed: 'İşlem başarısız',
      confirmDeleteShort: 'Silmek istediğinize emin misiniz?',
      profileDeleted: 'Profil silindi',
      deleteFailed: 'Silme başarısız',
      madeDefault: 'Varsayılan profil yapıldı',
      editProfile: 'Profili Düzenle',
      newProfile: 'Yeni Fatura Profili',
      firstNamePlaceholder: 'Ad',
      lastNamePlaceholder: 'Soyad',
      companyNamePlaceholder: 'Firma Ünvanı',
      tcknPlaceholder: 'TCKN',
      vknPlaceholder: 'VKN',
      cityPlaceholder: 'İl',
      districtPlaceholder: 'İlçe',
      addressPlaceholder: 'Adres Detayı',
      makeDefaultLabel: 'Varsayılan Profil Yap',
      pageTitle: 'Fatura Profillerim',
      pageSubtitle: 'Fatura bilgilerini burada yönetebilirsiniz.',
      empty: 'Henüz profil eklenmemiş',
      title: 'Fatura Profilleri',
      type: 'Tür',
      individual: 'Bireysel',
      corporate: 'Kurumsal',
      tcknLabel: 'T.C. Kimlik No',
      companyLabel: 'Şirket Ünvanı',
      vknLabel: 'Vergi Numarası (VKN)',
      taxOfficeLabel: 'Vergi Dairesi',
      eInvoice: 'e-Fatura mükellefiyim',
      setDefault: 'Varsayılan Yap',
      default: 'Varsayılan',
      save: 'Kaydet',
      delete: 'Sil',
      cancel: 'İptal',
      confirmDelete: 'Bu fatura profilini silmek istediğinizden emin misiniz?',
      created: 'Fatura profili oluşturuldu',
      updated: 'Fatura profili güncellendi',
      deleted: 'Fatura profili silindi',
    },
    profile: {
      title: 'Profil Bilgileri',
      subtitle: 'Hesabınıza ait temel kişisel bilgileri buradan güncelleyebilirsiniz.',
      fullName: 'Ad Soyad',
      fullNamePlaceholder: 'Örn: Ahmet Yılmaz',
      phone: 'Telefon Numarası',
      phonePlaceholder: 'Örn: +90 555 123 4567',
      saving: 'Kaydediliyor...',
      save: 'Değişiklikleri Kaydet',
      toastSuccess: 'Profil güncellendi',
      toastError: 'Güncelleme sırasında hata'
    },
    security: {
      pageSubtitle: 'Hesap güvenliğiniz için şifrenizi güncel tutun ve bağlı giriş yöntemlerinizi yönetin.',
      changePasswordDesc: 'Hesap güvenliğiniz için harf, rakam ve özel karakter içeren güçlü bir şifre seçin.',
      strengthPrefix: 'Güvenlik:',
      strengthWeak: 'Zayıf',
      strengthMedium: 'Orta',
      strengthGood: 'İyi',
      strengthStrong: 'Güçlü',
      ruleLength: 'En az 8 karakter',
      ruleUpper: 'En az 1 büyük harf',
      ruleDigit: 'En az 1 rakam',
      ruleSpecial: 'En az 1 özel karakter',
      googleLabel: 'Google',
      title: 'Şifre Değiştir',
      currentLabel: 'Mevcut şifre',
      newLabel: 'Yeni şifre',
      confirmLabel: 'Yeni şifre (tekrar)',
      save: 'Kaydet',
      currentRequired: 'Lütfen mevcut şifrenizi girin',
      mismatch: 'Şifreler eşleşmiyor',
      pwned: 'Bu şifre veri sızıntılarında görülmüş. Lütfen daha güçlü bir şifre seçin.',
      wrongCurrent: 'Mevcut şifre hatalı',
      updated: 'Şifreniz güncellendi',
      updateError: 'Şifre güncellenirken bir hata oluştu',
      rulesNotMet: 'Şifreniz tüm güvenlik kurallarını karşılamalıdır',
      saving: 'Güncelleniyor...',
      linkedAccountsTitle: 'Bağlı Giriş Yöntemleri',
      linkedAccountsSubtitle: 'Tek tıkla giriş yapabilmek için sosyal hesaplarınızı bağlayabilirsiniz.',
      emailPassword: 'E-posta ve Şifre',
      standardMethod: 'Standart giriş yöntemi',
      connected: 'Bağlı',
      disconnected: 'Pasif',
      oneClickLogin: 'Tek tıkla giriş',
      disconnect: 'Bağlantıyı Kaldır',
      connect: 'Bağla',
      linkedAccountsNote: 'Aynı e‑posta ile farklı giriş yöntemleri ayrı hesaplar oluşturabilir. Buradan Google hesabınızı mevcut hesabınıza bağlayarak hesap yönetimini tek bir merkezde toplayabilirsiniz.',
      toasts: {
        cannotRemoveLast: 'Son giriş yöntemini kaldıramazsınız',
        googleIdNotFound: 'Google kimliği bulunamadı',
        unlinkUnsupported: 'unlinkIdentity API desteklenmiyor',
        googleUnlinked: 'Google bağlantısı kaldırıldı',
        googleUnlinkFailed: 'Google bağlantısı kaldırılamadı',
        googleLinkStarted: 'Google hesabı bağlama işlemi başlatıldı',
        googleLinkFailed: 'Google bağlama başarısız'
      }
    }
  },
  orders: {
    page: {
      showingCount: '{{shown}} / {{total}} sipariş gösteriliyor',
      orderLabel: 'Sipariş',
      demoBadge: 'DEMO',
    },
    title: 'Siparişlerim',
    empty: 'Henüz siparişiniz bulunmuyor.',
    orderDate: 'Sipariş Tarihi',
    status: 'Durum',
    orderNo: 'Sipariş No',
    orderCode: 'Sipariş Kodu (son 8)',
    orderCodePlaceholder: 'Örn: 7016DD05',
    noImage: 'Görsel Yok',
    unexpectedError: 'Beklenmedik bir hata oluştu',
    fetchError: 'Siparişler alınamadı',
    product: 'Ürün',
    productSearchPlaceholder: 'Ürün adına göre ara',
    clearFilters: 'Filtreleri Temizle',
    noOrdersTitle: 'Henüz sipariş yok',
    noOrdersDesc: 'İlk siparişinizi vermek için ürünleri keşfedin',
    exploreProducts: 'Ürünleri Keşfet',
    details: 'Detaylar',
    customerInfo: 'Müşteri Bilgileri',
    deliveryAddress: 'Teslimat Adresi',
    orderInfo: 'Sipariş Bilgileri',
    name: 'İsim',
    email: 'E-posta',
    orderId: 'Sipariş ID',
    copy: 'Kopyala',
    conversationId: 'İşlem ID',
    orderDetails: 'Sipariş Detayları',
    productCol: 'Ürün',
    imageCol: 'Görsel',
    qtyCol: 'Adet',
    unitPriceCol: 'Birim Fiyat',
    totalCol: 'Toplam',
    grandTotal: 'Genel Toplam',
    noItems: 'Ürün detayı bulunamadı',
    totalAmount: 'Toplam Tutar',
    reorder: 'Tekrar Sipariş Et',
    copied: 'Kopyalandı',
    copyFailed: 'Kopyalanamadı',
    reorderedToast: '{{count}} ürün sepete eklendi',
    reorderNotFound: 'Ürünler stokta bulunamadı',
    reorderError: 'Tekrar sipariş sırasında hata',
    /** Kalemin GÜNCEL katalog model kodu (sipariş-anı snapshot'ı değil); ham SKU değildir. */
    modelCodeLabel: 'Model Kodu: {{code}}',
    shippingInfo: 'Kargo / Takip',
    carrier: 'Kargo Firması',
    trackingNumber: 'Takip Numarası',
    trackingLink: 'Takip Linki',
    openLink: 'Linki aç',
    shippedAt: 'Kargoya Veriliş',
    deliveredAt: 'Teslim Tarihi',
    noShippingInfo: 'Kargo bilgisi henüz girilmemiş.',
    invoicePdf: 'Proforma (PDF)',
    all: 'Tümü',
    cancelled: 'İptal Edildi',
    delivered: 'Teslim Edildi',
    endDate: 'Bitiş Tarihi',
    failed: 'Başarısız',
    filters: 'Filtreler',
    orderNumber: 'Sipariş No',
    paid: 'Ödendi',
    partialRefunded: 'Kısmi İade Edildi',
    pending: 'Beklemede',
    processing: 'Hazırlanıyor',
    statusUnknown: 'Durum Güncelleniyor',
    refunded: 'İade Edildi',
    shipped: 'Sevk Edildi',
    startDate: 'Başlangıç Tarihi',
    subtitle: 'Geçmiş siparişlerinizi görüntüleyin ve takip edin',
    tabs: {
      invoice: 'Fatura',
      items: 'Ürünler',
      overview: 'Genel Bakış',
      shipping: 'Sevkiyat'
    },
    viewAll: 'Tümünü görüntüle'
  },
  returns: {
    title: 'İade Taleplerim',
    new: 'Yeni İade Talebi',
    empty: 'Henüz bir iade talebiniz bulunmuyor.',
    order: 'Sipariş',
    reason: 'Neden',
    status: 'Durum',
    created: 'Oluşturulma',
    selectOrder: 'Sipariş seçin',
    selectReason: 'Neden seçin',
    description: 'Açıklama (opsiyonel)',
    descriptionPh: 'Sorunu kısaca tarif edin (opsiyonel)',
    submit: 'Talep Oluştur',
    required: 'Lütfen sipariş ve neden seçin',
    createdToast: 'İade talebi oluşturuldu',
    createError: 'İade talebi oluşturulamadı',
    fetchError: 'İade kayıtları yüklenemedi',
    requestReturn: 'İade Talebi Et',
    statusLabels: {
      requested: 'Talep Edildi',
      approved: 'Onaylandı',
      rejected: 'Reddedildi',
      in_transit: 'Kargoda',
      received: 'Teslim Alındı',
      refunded: 'İade Edildi',
      cancelled: 'İptal Edildi'
    }
  },
  quotes: {
    title: 'Teklif Taleplerim',
    subtitle: 'Teklif taleplerinizi ve durumlarını buradan takip edin.',
    empty: 'Henüz bir teklif talebiniz bulunmuyor.',
    emptyHint: 'Fiyatı görünmeyen ürünlerde "Teklif İste" ile talep açabilirsiniz.',
    fetchError: 'Teklif kayıtları yüklenemedi',
    itemsCount: '{{count}} kalem',
    requestCta: 'Teklif İste',
    request: {
      title: 'Teklif İste',
      itemsTitle: 'Talep Kalemleri',
      qty: 'Adet',
      contactName: 'Ad Soyad',
      contactNamePh: 'Teklifin düzenleneceği kişi',
      contactPhone: 'Telefon',
      contactPhonePh: '05xx xxx xx xx',
      contactEmailNote: 'Teklif bu e-posta adresine iletilecek',
      contactEmail: 'E-posta',
      contactEmailPh: 'ornek@firmaniz.com',
      contactEmailGuestNote: 'Teklifiniz ve bilgilendirmeler bu adrese gönderilecek',
      contactRequired: 'Ad soyad, telefon ve e-posta zorunludur — teklif belgesinde muhatap yazmalıdır',
      kvkkConsent: 'aydınlatma metnini okudum',
      kvkkRequired: 'Devam etmek için aydınlatma metnini okuduğunuzu onaylayın',
      duplicateToast: 'Bu talebi az önce gönderdiniz; talebiniz alındı.',
      rateLimitToast: 'Çok fazla talep gönderildi, lütfen bir süre sonra tekrar deneyin',
      guestSignupInvite: 'Hesap oluşturursanız bu talebi ve sonraki tekliflerinizi hesabınızdan takip edebilirsiniz.',
      guestSignupCta: 'Hesap Oluştur',
      note: 'Not (opsiyonel)',
      notePh: 'Projeniz/ihtiyacınız hakkında kısa not (opsiyonel)',
      submit: 'Teklif Talebi Gönder',
      cancel: 'Vazgeç',
      successToast: 'Teklif talebiniz alındı',
      errorToast: 'Teklif talebi oluşturulamadı',
    },
    detail: {
      title: 'Teklif Detayı',
      requestedAt: 'Talep Tarihi',
      itemsTitle: 'Kalemler',
      product: 'Ürün',
      qty: 'Adet',
      unitPrice: 'Birim Fiyat',
      lineTotal: 'Tutar',
      validUntil: 'Geçerlilik',
      total: 'Toplam',
      note: 'Not',
      awaitingPricing: 'Talebiniz alındı; fiyatlama bekleniyor.',
      accept: 'Teklifi Kabul Et',
      reject: 'Teklifi Reddet',
      acceptConfirm: 'Teklifi kabul etmek istediğinize emin misiniz?',
      rejectConfirm: 'Teklifi reddetmek istediğinize emin misiniz?',
      decisionSuccess: 'Kararınız kaydedildi',
      decisionError: 'Karar kaydedilemedi',
      acceptedNext: 'Teklifi kabul ettiniz. Sorularınız için info@venthub.com.tr adresine yazabilirsiniz.',
      backToList: 'Tekliflerime dön',
      notFound: 'Teklif bulunamadı'
    },
    sourceLabels: {
      pdp: 'Ürün sayfası',
      cart: 'Sepet',
      project: 'Proje'
    },
    statusLabels: {
      draft: 'Taslak',
      requested: 'Talep Alındı',
      quoted: 'Teklif Verildi',
      accepted: 'Kabul Edildi',
      rejected: 'Reddedildi',
      expired: 'Süresi Doldu',
      cancelled: 'İptal Edildi',
      superseded: 'Yerine Yenisi Geçti',
      converted: 'Siparişe Dönüştü'
    },
    admin: {
      title: 'Teklif Kuyruğu',
      navLabel: 'Teklifler',
      subtitle: 'Müşteri teklif taleplerini fiyatlayın ve süreci yönetin.',
      searchPlaceholder: 'Ürün adına göre ara...',
      columnsButton: 'Kolonlar',
      emptyTitle: 'Teklif talebi yok',
      emptyDescription: 'Müşteriler fiyatı görünmeyen ürünlerde teklif istediğinde burada listelenir.',
      filterEmptyDescription: 'Filtrelerinize uyan teklif talebi bulunamadı.',
      emailUnavailable: 'e-posta gösterilemiyor',
      prospectBadge: 'hesapsız muhatap — kabul kilitli',
      table: {
        customer: 'Müşteri',
        items: 'Kalemler',
        source: 'Kaynak',
        status: 'Durum',
        date: 'Tarih',
        actions: 'Aksiyonlar'
      },
      detail: {
        itemsTitle: 'Talep Kalemleri',
        qty: 'Adet',
        note: 'Müşteri notu',
        unitPrice: 'Birim Fiyat',
        currency: 'Para Birimi',
        validUntil: 'Geçerlilik',
        savePrices: 'Fiyatları Kaydet'
      },
      actions: {
        markAs: '{{status}} olarak işaretle'
      },
      toasts: {
        statusUpdated: 'Teklif durumu güncellendi: {{status}}',
        statusUpdateFailed: 'Teklif durumu güncellenemedi',
        noPermission: 'Bu işlem için yetkiniz yok',
        pricesSaved: 'Fiyatlar kaydedildi',
        pricesSaveFailed: 'Fiyatlar kaydedilemedi',
        priceRequired: 'Teklif göndermeden önce tüm kalemlere fiyat, aynı para birimi ve ileri tarihli geçerlilik girin'
      }
    }
  },
  lead: {
    companyPlaceholder: 'Şirketiniz A.Ş.',
    cityPlaceholder: 'Örn: İstanbul',
    consent: {
      text: 'okudum ve kabul ediyorum.'
    },
    appAreas: {
      parking: 'Otopark Havalandırma',
      kitchen: 'Endüstriyel Mutfak',
      cleanroom: 'Hastane/Temiz Oda',
      retail: 'AVM/Perakende',
      office: 'Ofis/Plaza',
      warehouse: 'Depo/Üretim Tesisi',
      other: 'Diğer'
    },
    valueProp: {
      badge: 'VENTHUB B2B',
      title: 'Projeleriniz İçin Teklif İsteyin',
      description: 'Ürün ve proje bilgilerinizi iletişim formu ya da info@venthub.com.tr üzerinden iletin; sipariş için teklif istenir.',
      feature1: 'Ürün Seçici Hesapları',
      feature2: 'Teklifte Kargo ve Teslimat Koşulları',
      feature3: 'Ürün Sayfalarında Teknik Föy'
    },
    success: {
      title: 'Talebiniz Alındı!',
      description: 'Teklif talebiniz alındı. Sorularınız için info@venthub.com.tr adresine yazabilirsiniz.'
    },
    form: {
      title: 'Teklif Al',
      nameLabel: 'Ad Soyad *',
      companyLabel: 'Firma Adı',
      emailLabel: 'E-Posta',
      phoneLabel: 'Telefon',
      cityLabel: 'Şehir',
      appAreaLabel: 'Uygulama Alanı',
      selectPlaceholder: 'Seçiniz...',
      messageLabel: 'Proje / Talep Detayı',
      messagePlaceholder: 'İhtiyacınız olan ürünler...',
      submit: 'Gönder',
      productContext: 'için teklif oluşturuluyor',
      productLabel: 'İlgilenilen Ürün:',
      corporateContact: 'Kurumsal İletişim'
    },
    errors: {
      name: 'Ad Soyad zorunludur',
      contact: 'E-posta veya telefon numarası girmelisiniz',
      consent: 'KVKK metnini onaylamalısınız',
      submitFailed: 'Talebiniz kaydedilemedi. Lütfen tekrar deneyin; sorun sürerse bize doğrudan ulaşın.'
    },
    defaultMessage: '{{productName}} için detaylı teknik teklif...',
  },
  // ÜRÜN SEÇİCİ giriş sayfası (karar K17 · "Ürün Seçici", 2026-09-04).
  // Ad KASITLI: "fan seçici" değil "ürün seçici" — karar metni fan demiyor, çünkü ileride
  // fan dışı gruplar da motor kazanacak. Tek ad, tek hedef.
  urunSecici: {
    ustBaslik: 'Ürün Seçici',
    baslik: 'Mahalliniz için ön değerlendirme yapın',
    // ⛔"Sonuçlar teklif talebinize taşınır" CÜMLESİ KALDIRILDI (2026-09-05, kod incelemesi):
    // böyle bir aktarım YOK — hesaplayıcılar sonucu teklif akışına taşımıyor. Vaat kutularını
    // temizleyen PR'ın kendisi yeni bir vaat getiriyordu; aynı K1 hatası, bu kez benden.
    aciklama: 'Hacim, debi ve basınç girdilerinizle ön değerlendirme yapın.',
    // REC-497: arama sonucu açıklaması (60 karakterlik sayfa metni çok kısaydı; sayfa metni değişmez).
    seoDescription: 'Hacim, debi ve basınç değerlerinizle kanal fanı, ısı geri kazanım, hava perdesi ve jet fan için ön değerlendirme yapın.',
    araclar: {
      kanal: {
        // URN-83: kart "hacim ve hava değişim sayısından debi" diyordu ama bağlantı KANAL BASINÇ KAYBI hesaplayıcısına
        // gider (hedef: `calculators.duct` — debi + kanal ölçüsü girilir, hava hızı ve tahmini basınç kaybı çıkar).
        // Kart metni hedef sayfanın kendi cümlesine çekildi; ondan fazlası söylenmez.
        ad: 'Kanal basınç kaybı hesabı',
        aciklama: 'Debi ve kanal ölçülerinize göre hava hızını ve tahmini basınç kaybını hesaplayın.',
      },
      hrv: {
        ad: 'Isı geri kazanım (HRV) hesabı',
        aciklama: 'Konut ve ofis mahalleri için taze hava ihtiyacını ve ünite büyüklüğünü belirleyin.',
      },
      havaPerdesi: {
        ad: 'Hava perdesi hesabı',
        aciklama: 'Kapı ölçülerine ve kullanım koşullarına göre gerekli perde debisini hesaplayın.',
      },
      jetFan: {
        ad: 'Jet fan hesabı',
        aciklama: 'Kapalı otopark ve benzeri hacimlerde itki ihtiyacını ve fan sayısını hesaplayın.',
      },
    },
    not: 'Hesaplar ön değerlendirmedir; kesin seçim için iletişim formu ya da e-posta ile yazın.',
  },
  calculators: {
    recommendations: 'Öneriler',
    stepIndicator: {
      progress: 'Adım {{current}} / {{total}}',
    },
    layout: {
      // Etiket hedefle birlikte değişti (REC-148 B2): araçtan çıkış artık Ürünler'e değil
      // Ürün Seçici'ye dönüyor; halka kapansın, ikinci aracı denemek isteyen kaybolmasın.
      backLabel: 'Ürün Seçici’ye dön',
      disclaimer: 'Bu hesap makinesi ön boyutlandırma amaçlıdır. Kesin proje hesapları için bir HVAC mühendisine danışın.',
      contactPrompt: 'Teknik sorularınız için',
      contactLink: 'iletişime geçin',
    },
    airCurtain: {
      trafficLowDesc: 'Seyrek geçiş',
      trafficMediumDesc: 'Orta yoğunlukta geçiş',
      trafficHighDesc: 'Sık geçiş',
      newCalculation: 'Yeni Hesaplama',
      calculate: 'Hesapla',
      title: 'Hava Perdesi Hesaplayıcı',
      description: 'Kapı ölçüsü ve kullanım koşullarına göre hava perdesi hesabı',
      // SEO-32 (URN-91): arama sonucu açıklaması. `description` sayfanın GÖRÜNÜR alt başlığıdır, ona dokunulmaz.
      metaDescription: 'Kapı ölçüleri, uygulama, rüzgar ve trafik koşullarına göre gerekli hava debisini, üfleme hızını ve motor gücünü hesaplayın.',
      infoText: 'Bu araç, Ürün Seçici\'deki hava perdesi hesabıdır. Hesaplar ön değerlendirmedir.',
      steps: {
        dimensions: 'Kapı Ölçüleri',
        dimensionsDesc: 'Genişlik ve yükseklik',
        application: 'Uygulama',
        applicationDesc: 'Kullanım amacı',
        conditions: 'Koşullar',
        conditionsDesc: 'Rüzgar ve trafik',
        results: 'Sonuçlar',
        resultsDesc: 'Hesaplama çıktıları'
      },
      form: {
        doorWidth: 'Kapı Genişliği',
        doorHeight: 'Kapı Yüksekliği',
        doorWidthTooltip: 'Kapının iç net açıklık genişliği (0.5 - 10 m)',
        doorHeightTooltip: 'Kapının iç net açıklık yüksekliği (1.5 - 6 m)',
        applicationLabel: 'Uygulama Seçin',
        applicationPurpose: 'Hava perdesinin kullanım amacını seçin',
        environmentalConditions: 'Çevresel Koşullar',
        windStatus: 'Rüzgar Durumu',
        windTooltip: 'Kapı dışındaki beklenen rüzgar şiddeti',
        trafficIntensity: 'Trafik Yoğunluğu',
        trafficTooltip: 'Saatlik tahmini geçiş sayısı',
        inputSummary: 'Giriş Özeti'
      },
      applications: {
        comfort: {
          label: 'Mağaza ve Market',
          desc: 'Mağaza, market girişi',
          info: 'Mağaza, market ve restoran girişlerinde tipik bir uygulama alanıdır.'
        },
        insect: {
          label: 'Böcek Girişi',
          desc: 'Restoran girişi',
          info: 'Üreticinin tarifine göre böcek girişini önlemeye yöneliktir.'
        },
        coldRoom: {
          label: 'Depo Kapısı',
          desc: 'Depo kapısı girişi',
          info: 'Depo kapısında hava akımıyla sıcak ve soğuk havanın geçişini engeller.'
        }
      },
      conditions: {
        wind: {
          none: 'Yok',
          light: 'Hafif',
          moderate: 'Orta',
          strong: 'Şiddetli'
        },
        traffic: {
          low: 'Düşük',
          medium: 'Orta',
          high: 'Yoğun'
        }
      },
      results: {
        title: 'Hesaplama Sonuçları',
        subtitle: 'Önerilen hava perdesi özellikleri',
        gridTitle: 'Hesaplanan Değerler',
        airflow: 'Gerekli Hava Debisi',
        airflowDesc: 'Etkili bir hava bariyeri için gereken toplam debi',
        velocity: 'Nozul Üfleme Hızı',
        velocityDesc: 'Hava perdesi çıkışındaki hava hızı',
        floorVelocity: 'Taban Hızı (Tahmini)',
        floorVelocityDesc: 'Zemin seviyesinde beklenen hava hızı',
        power: 'Önerilen Motor Gücü',
        powerDesc: 'Minimum motor gücü gereksinimi',
        nozzleWidth: 'Nozul Genişliği',
        nozzleHeight: 'Nozul Yüksekliği',
        efficiency: 'Verimlilik',
        efficiencyOptimal: 'Optimal',
        efficiencyAcceptable: 'Kabul Edilebilir',
        efficiencyWarning: 'Sınırda',
        efficiencyOptimalDesc: 'Hesaplar ön değerlendirmedir; kesin seçim için teklif isteyin.',
        efficiencyAcceptableDesc: 'Performans yeterlidir, ihtiyaç halinde iyileştirme düşünülebilir',
        efficiencyWarningDesc: 'Daha güçlü bir model veya ek önlemler gerekebilir',
        efficiencyMarginal: 'Sınırda',
        efficiencyMarginalDesc: 'Daha güçlü bir model düşünülmesi önerilir'
      },
      diagram: {
        unit: 'Hava Perdesi',
        doorDimensions: 'Kapı ölçüleri diyagramı'
      }
    },
    duct: {
      title: 'Kanal Basınç Kaybı Hesaplayıcı',
      description: 'Hava kanalı hız hesaplaması ve basınç düşümü tahmini',
      // SEO-32 (URN-91): arama sonucu açıklaması; `description` görünür alt başlıktır, değişmez.
      metaDescription: 'Hava debisi ve kanal ölçülerinize göre hava hızını ve tahmini basınç kaybını hesaplayın. Kanal tipi, malzeme ve ölçüler girilir.',
      infoText: 'Debi ve kanal ölçülerinize göre hava hızını ve tahmini basınç kaybını hesaplar.',
      form: {
        inputTitle: 'Kanal Bilgileri',
        inputDesc: 'Debi ve kanal ölçülerini girin',
        shape: 'Kanal Tipi',
        round: 'Yuvarlak',
        roundDesc: 'Spiral veya kaynaklı boru',
        rectangular: 'Dikdörtgen',
        rectangularDesc: 'Dikdörtgen kesitli kanal',
        material: 'Malzeme',
        steel: 'Galvaniz Saç',
        steelDesc: 'Standart',
        pvc: 'PVC',
        pvcDesc: 'Plastik kanal malzemesi',
        flex: 'Flex Kanal',
        flexDesc: 'Esnek',
        airflow: 'Hava Debisi',
        airflowTooltip: 'Kanaldan geçmesi gereken hava miktarı',
        diameter: 'Kanal Çapı',
        diameterTooltip: 'İç çap (50-2000 mm)',
        width: 'Genişlik (a)',
        height: 'Yükseklik (b)',
        length: 'Kanal Uzunluğu',
        lengthTooltip: 'Toplam kanal boyu'
      },
      results: {
        title: 'Hesaplama Sonuçları',
        subtitle: 'Hava hızı ve basınç kaybı değerleri',
        velocity: 'Hava Hızı',
        specificLoss: 'Basınç Kaybı (Spesifik)',
        totalLoss: 'Toplam Basınç Kaybı',
        equivDiameter: 'Eşdeğer Çap',
        equivDiameterDesc: 'Yuvarlak kanal karşılığı'
      }
    },
    hrv: {
      title: 'Isı Geri Kazanım Tasarruf Hesaplayıcı',
      description: 'Isı geri kazanım cihazı verimliliği ve enerji tasarrufu hesabı',
      // SEO-32 (URN-91): arama sonucu açıklaması; `description` görünür alt başlıktır, değişmez.
      metaDescription: 'Isı geri kazanım (HRV) ve enerji geri kazanım (ERV) cihazlarının yıllık enerji tasarruf potansiyelini cihaz tipi ve mahal tipine göre hesaplayın.',
      infoText: 'Isı geri kazanım (HRV) veya enerji geri kazanım (ERV) cihazlarının yıllık enerji tasarruf potansiyelini hesaplar.',
      form: {
        type: 'Cihaz Tipi',
        typeDesc: 'Isı geri kazanım sistemini seçin',
        hrv: 'HRV (Isı Geri Kazanım)',
        hrvDesc: 'Sadece duyulur ısı',
        erv: 'ERV (Enerji Geri Kazanım)',
        ervDesc: 'Isı + Nem geri kazanımı',
        climate: 'İklim Bölgesi',
        cold: 'Soğuk',
        coldDesc: 'Soğuk iklim koşulu',
        temperate: 'Ilıman',
        temperateDesc: 'Ilıman iklim koşulu',
        hot: 'Sıcak',
        hotDesc: 'Sıcak iklim koşulu',
        usage: 'Mahal Tipi',
        usageDesc: 'Bina, iklim ve kullanım bilgileri',
        residential: 'Konut',
        residentialDesc: 'Ev kullanımı',
        office: 'Ofis',
        officeDesc: 'İş yeri',
        commercial: 'Ticari',
        commercialDesc: 'Ticari kullanım alanı',
        occupancy: 'Kişi Sayısı',
        unitPeople: 'kişi',
        workingHours: 'Günlük Çalışma',
        electricityPrice: 'Elektrik Birim Fiyatı',
        sensibleEfficiency: 'Duyulur Verim',
        latentEfficiency: 'Gizli Verim',
        area: 'Alan (m²)'
      },
      results: {
        title: 'Hesaplama Sonuçları',
        subtitle: 'Tahmini yıllık enerji tasarrufu',
        savingsTitle: 'Yıllık Tasarruf',
        annualEnergySaving: 'Yıllık Enerji Tasarrufu',
        annualCostSaving: 'Yıllık Maliyet Tasarrufu',
        unitKwhPerYear: 'kWh/yıl',
        unitCostPerYear: '₺/yıl',
        unitKgPerYear: 'kg/yıl',
        unitYears: 'yıl',
        heatingGain: 'Isıtma Kazancı',
        coolingGain: 'Soğutma Kazancı',
        co2Reduction: 'CO₂ Azaltımı',
        co2Desc: 'Yıllık karbon salınım düşüşü',
        payback: 'Geri Ödeme Süresi',
        paybackDesc: 'Tahmini yatırım geri dönüşü'
      }
    },
    jetFan: {
      // REC-148 B1 / K17 — TEK AD: üç kardeşi "… Hesaplayıcı" derken bu tek başına
      // "Hesap Makinesi" diyordu. İngilizcede dördü de "Calculator" idi; ayrışma yalnız
      // Türkçedeydi ve tam da bu yüzden kimse fark etmemişti.
      pageTitle: 'Jet Fan Hesaplayıcı',
      pageDescription: 'Jet fan hesabı',
      // SEO-32 (URN-91): arama sonucu açıklaması; `pageDescription` görünür alt başlıktır, değişmez.
      metaDescription: 'Kapalı otopark ve tünellerde gerekli jet fan sayısını, itki kuvvetini ve havalandırma debisini hesaplayın; uygulama ve mekan bilgilerini girin.',
      pageInfoText: 'Bu araç, Ürün Seçici\'deki jet fan hesabıdır. Hesaplar ön değerlendirmedir.',
      smokeWarning: 'Duman tahliye hesabı ön tasarım amaçlıdır. Profesyonel yangın mühendisi danışmanlığı gereklidir.',
      parkingShortDesc: 'Kapalı otopark havalandırma',
      tunnelShortDesc: 'Yol veya metro tüneli',
      appTypeTitle: 'Uygulama Tipi',
      appTypeSubtitle: 'Mekan türünü seçin',
      applicationLabel: 'Uygulama',
      spaceInfoTitle: 'Mekan Bilgileri',
      spaceInfoSubtitle: 'Boyut ve kapasite değerleri',
      lengthLabel: 'Uzunluk',
      trafficLabel: 'Saatlik Trafik',
      unitVehicle: 'araç',
      unitVehiclePerHour: 'araç/sa',
      capacityTooltip: 'Toplam park yeri sayısı',
      trafficTooltip: 'Pik saatteki araç hareketi',
      resetValues: 'Değerleri Sıfırla',
      layoutSchema: 'Yerleşim Şeması',
      diagramLegend: 'Jet Fan',
      resultsTitle: 'Hesaplama Sonuçları',
      resultsSubtitle: 'Önerilen jet fan konfigürasyonu',
      ventilationMetrics: 'Havalandırma Metrikleri',
      requiredAirflow: 'Gerekli Debi',
      airChangeRate: 'Hava Değişim Hızı',
      achParkingHint: 'Hava değişim hızını girin',
      achTunnelHint: 'Tünel: ACH değerini şartnameden veya mevzuattan alın',
      fanRequirements: 'Jet Fan Gereksinimleri',
      fanCountTitle: 'Jet Fan Sayısı',
      unitPiece: 'adet',
      placementTitle: 'Yerleşim Önerileri',
      recommendedSpacing: 'Önerilen Aralık:',
      mountingHeight: 'Montaj Yüksekliği:',
      volume: 'Hacim:',
      thrustPerFan: 'Fan Başına İtki:',
      smokeSystemTitle: 'Duman Tahliye Sistemi',
      smokeSystemDesc: 'Bu hesaplama ön boyutlandırma amaçlıdır. Kesin tasarım için CFD analizi ve yangın güvenlik uzmanı danışmanlığı gereklidir.',
      emptyStateLine1: 'Geçerli değerler girerek',
      emptyStateLine2: 'sonuçları görüntüleyin',
      form: {
        parking: 'Otopark',
        tunnel: 'Tünel',
        mode: 'Havalandırma Modu',
        normal: 'Normal',
        normalDesc: 'Günlük havalandırma',
        smoke: 'Duman Tahliye',
        smokeDesc: 'Yangın senaryosu',
        capacity: 'Araç Kapasitesi',
        width: 'Genişlik',
        height: 'Yükseklik'
      },
      results: {
        totalThrust: 'Toplam İtki Kuvveti',
      }
    }
  },
  categorySilentFan: {
    problem: {
      withoutMark: '•',
      withMark: '•',
      eyebrow: 'SES VE KONFOR',
      title: 'Ses Emici Kaplamalı Kanal Fanı',
      subtitle: 'Vortice Lineo Quiet ailesi, kanal tipi karma akışlı fanlardan oluşur; ses emici kaplama dış gövdeye entegredir.',
      painPoints: [
        {
          title: 'Ses Emici Kaplama',
          description: 'Kaplama, ortama yayılan ses emisyonunu azaltmak üzere tasarlanmıştır.'
        },
        {
          title: 'Karma Akışlı Fan',
          description: 'Kanal tipi bir fandır. Çap ve debi değerleri model föyünde yer alır.'
        },
        {
          title: 'İki Motor Seçeneği',
          description: 'AC endüksiyon motorlu (LINEO QUIET) ya da EC fırçasız motorlu (LINEO QUIET ES) seçilebilir.'
        }
      ],
      visual: {
        without: 'AC Motorlu Model',
        with: 'EC Motorlu Model',
        withoutPoints: ['LINEO QUIET', 'AC endüksiyon motor', 'Karma akışlı fan', 'Ses emici gövde kaplaması'],
        withPoints: ['LINEO QUIET ES', 'EC fırçasız motor', 'Karma akışlı fan', 'Ses emici gövde kaplaması']
      }
    },
    howItWorks: {
      eyebrow: 'TEKNOLOJİ',
      title: 'Vortice Lineo Quiet\'in Yapısı',
      subtitle: 'Vortice Lineo Quiet, ses emici kaplaması dış gövdeye entegre, karma akışlı bir kanal fanıdır.',
      steps: [
        {
          title: 'Ses Emici Gövde',
          description: 'Ses emici kaplama dış gövdeye entegredir.'
        },
        {
          title: 'Karma Akış',
          description: 'Kanal tipi karma akışlı bir fandır; teknik özellikler ürün sayfasındadır.'
        },
        {
          title: 'Motor Seçenekleri',
          description: 'AC endüksiyon motorlu LINEO QUIET ve EC fırçasız motorlu LINEO QUIET ES.'
        }
      ]
    },
    // 'comparison' (Motor Seçenekleri tablosu) kalktı — Blog BLG-6 son tablosu (OPS hükmü b, 10-09): iki
    // hücresi aynı kalan satırlar kalkınca tablo tümden kalkar; iki motor seçeneği problem.painPoints[2]
    // ve problem.visual içinde zaten anlatılıyor.
    faq: {
      title: 'Sıkça Sorulan Sorular',
      items: [
        {
          q: 'Gerçekten ne kadar sessiz?',
          a: 'Ses emici kaplama dış gövdeye entegredir; ortama yayılan sesi azaltmak üzere tasarlanmıştır. Teknik özellikler ürün sayfasındadır.'
        },
        {
          q: 'Montajı zor mu?',
          a: 'Montaj ve bakımda başvuru kaynağı, ürünün kullanım kılavuzu ve üretici belgesidir. Kılavuzu saklayınız.'
        },
        {
          q: 'Vortice Lineo Quiet nedir?',
          a: 'Kanal tipi karma akışlı bir fandır; AC motorlu LINEO QUIET ve EC motorlu LINEO QUIET ES olmak üzere iki model grubu vardır.'
        }
      ]
    },
    brand: {
      eyebrow: 'İTALYA MERKEZLİ MARKA',
      title: 'Vortice Lineo Quiet Kanal Fanları',
      description: 'Lineo Quiet, ses emici kaplaması dış gövdeye entegre karma akışlı bir kanal fanı ailesidir; AC motorlu LINEO QUIET ve EC motorlu LINEO QUIET ES olarak sunulur.',
      badges: ['AC / EC Motor', 'Karma Akışlı Fan Ailesi'],
      stats: [
        {
          label: '',
          value: ''
        },
        {
          // URN-95: değer sözlükte DEĞİL sunucudan gelen katalog sayısıdır (`vorticeSayac.ts`, 1. kart = ürün ailesi,
          // 2. kart = aktif model); sayı yoksa kart çizilmez. Yer tutucu (`{aile}`/`{model}`) YAZILMAZ.
          label: 'Vortice Ürün Ailesi',
          value: ''
        },
        {
          label: 'Vortice Aktif Model',
          value: ''
        },
        {
          label: 'Ülke',
          value: 'İtalya'
        }
      ]
    }
  },
  silentFanWizard: {
    headerTitle: 'Sessiz Fan Seçim Asistanı',
    goBack: 'Önceki adım',
    continue: 'Devam et',
    skipToResult: 'Sonucu göster',
    defaultsHint: 'Tüm adımlar dolu — istediğiniz an sonuca geçebilirsiniz',
    step1Title: 'Fan nereye takılacak?',
    step1Desc: 'Mahal tipi, saatte kaç kez hava değişmesi gerektiğini belirler.',
    step2Title: 'Oda ne kadar büyük?',
    step2Desc: 'Kabaca bilmeniz yeterli; hacmi ve gereken debiyi biz hesaplıyoruz.',
    areaLabel: 'Taban alanı',
    ceilingLabel: 'Tavan yüksekliği',
    step3Title: 'Kanal nasıl gidiyor?',
    step3Desc: 'Kanal ne kadar uzun ve dolambaçlıysa fan o kadar zorlanır.',
    routeLabel: 'Kanal güzergâhı',
    materialLabel: 'Kanal malzemesi',
    diameterLabel: 'Kanal çapı',
    diameterUnknown: 'Bilmiyorum',
    diameterHint: 'Bilmiyorsanız boş bırakın — her modeli kendi çapına göre değerlendiririz.',
    step4Title: 'Sessizlik sizin için ne kadar önemli?',
    step4Desc: 'Bu tercih sıralamayı değiştirir; yetersiz modeller yine de elenir.',
    calculating: 'Modeller sizin tesisatınıza göre hesaplanıyor…',
    resultTitle: 'Sizin için üç öneri',
    resultNeed: 'Odanız yaklaşık {{hacim}} m³ — bu mahal için saatte {{debi}} m³ hava taşınması gerekiyor.',
    badgeBest: '1. sırada',
    badgeQuietest: 'En düşük dB(A)',
    badgeEfficient: 'EC motorlu',
    cardDelivers: 'Kanalınızda hesaplanan',
    cardDeliversApprox: 'Kanalınızda hesaplanan (yaklaşık)',
    cardApproxCurve: 'Yaklaşık eğri — üretici grafiğinden ayrıntılandırılıyor. Bu modelin yeterliliğini üreticiyle doğrulayın.',
    cardNoise: 'Ses seviyesi',
    cardDiameter: 'Bağlantı çapı',
    cardCta: 'Ürünü incele',
    showDetails: 'Hesabı göster',
    hideDetails: 'Hesabı gizle',
    detailVolume: 'Oda hacmi',
    detailAch: 'Saatlik hava değişimi',
    detailNeed: 'Gereken debi',
    detailMinApplied: '(standart alt sınır uygulandı)',
    detailPressure: 'Tahmini sistem direnci',
    detailEliminated: 'Yetersiz kalan model',
    noMatchTitle: 'Bu koşullarda uygun model çıkmadı',
    noMatchDesc: 'Kanal çapını serbest bırakmayı ya da güzergâhı kısaltmayı deneyin.',
    errorTitle: 'Modeller getirilemedi',
    errorDesc: 'Bağlantıda bir sorun oluştu. Lütfen tekrar deneyin.',
    restart: 'Baştan başla',
    unitM: 'm',
    unitM2: 'm²',
    unitM3: 'm³',
    unitM3h: 'm³/h',
    unitMm: 'mm',
    unitPa: 'Pa',
    unitDbA: 'dB(A)',
    unitTimes: '×',
    approx: '≈',
    room: {
      bathroom: 'Banyo',
      kitchen: 'Mutfak',
      bedroom: 'Yatak odası',
      living: 'Oturma odası',
      office: 'Ofis',
      shop: 'Dükkân / kafe',
    },
    roomHint: {
      bathroom: 'Nem ve koku hızlı atılmalı',
      kitchen: 'Yağ buharı için debi değerine bakın',
      bedroom: 'Gece sessizliği belirleyici',
      living: 'Sürekli, sakin havalandırma',
      office: 'Kişi yoğunluğuna göre taze hava',
      shop: 'Yoğun kullanım, yüksek debi',
    },
    route: {
      short: 'Kısa ve düz',
      medium: 'Orta',
      long: 'Uzun / dolambaçlı',
    },
    routeHint: {
      short: 'Yaklaşık 3 m, tek dirsek',
      medium: 'Yaklaşık 6 m, iki-üç dirsek',
      long: '10 m üzeri, çok dirsek',
    },
    material: {
      galvanized: 'Sert metal kanal',
      pvc: 'Sert plastik kanal',
      flex: 'Esnek spiral boru',
    },
    materialHint: {
      galvanized: 'Sürtünme hesaba katılır',
      pvc: 'Sürtünme hesaba katılır',
      flex: 'Sürtünme hesapta ayrıca değerlendirilir',
    },
    quiet: {
      normal: 'Fark etmez',
      important: 'Önemli',
      critical: 'Çok önemli',
    },
    quietHint: {
      normal: 'Performans önce gelsin',
      important: 'Sessizlik ve güç dengeli',
      critical: 'Yatak odası, gece kullanımı',
    },
  },
  needsWizard: {
    stepOf: '/ {{total}}',
    enhanced: {
      iconHeat: '🔥',
      iconAmbient: '🌬️',
      iconUnsure: '❓',
      headerTitle: 'İhtiyaç Analiz Sihirbazı',
      meterUnit: 'm',
    },
    coldStorage: 'Depo',
    coldStorageDesc: 'Depo kapıları',
    coldStorageTip: 'Kapı açıkken iç ve dış hava geçişini sınırlar',
    industrial: 'Endüstriyel Tesis',
    industrialDesc: 'Depo kapısı',
    industrialTip: 'Açık kalan kapılarda toz girişini sınırlar',
    retail: 'Market / Süpermarket',
    retailDesc: 'Market girişi',
    retailTip: 'Market girişi tipik uygulama alanıdır',
    step1Title: 'Kullanım alanı neresi?',
    step1Desc: 'Hava perdesi seçimine başlamak için önce uygulama alanını seçin.',
    step2Title: 'Kapı ölçülerini girin',
    step2Desc: 'Hava perdesi kapı genişliğine göre seçilir.',
    widthMeter: 'Genişlik (Metre)',
    heightMeter: 'Yükseklik (Metre)',
    step3Title: 'Isıtıcı ihtiyacı var mı?',
    heatingYesDesc: 'Kışın konfor için',
    heatingNoDesc: 'Sadece hava bariyeri',
    notSure: 'Emin Değilim',
    consultUs: 'Bize danışın',
    step6Title: 'Girdilerinize Göre Modeller',
    step6Desc: 'Ön değerlendirme sonucunda listelenen modeller.',
    analyzing: 'Modeller Analiz Ediliyor...',
    matchScore: 'Uyum puanı: {{score}}/100',
    restart: 'Yeniden Başla',
    customOffer: 'Özel Teklif İste',
    entranceDoor: 'Giriş Kapısı',
    next: 'Devam Et',
    entranceDesc: 'Mağaza, market ve restoran girişi',
    entranceTip: 'Isıtmasız veya elektrikli ısıtıcılı model seçilebilir',
    start: 'Başla',
    close: 'Kapat',
    insulation: 'Yalnızca hava akımı için',
    centralSystem: 'Merkezi sistem varsa',
    goBack: 'Geri Dön',
    findSuitable: 'Bana Uygun Olanı Bul',
    threeSteps: 'Ölçü ve ısıtmaya göre model önerisi',
    wizardTitle: 'İhtiyaç Analizi Sihirbazı',
    doorHeight: 'Kapı Yüksekliğiniz Nedir?',
    meter: 'Metre',
    heatingNeed: 'Isıtma İhtiyacı Var mı?',
    electricHeater: 'Elektrikli Isıtıcı',
    winterComfort: 'Kış konforu için',
    ambient: 'Isıtıcısız (Ortam)',
    waterHeater: 'Sıcak Su Bataryalı',
    mountType: 'Montaj tipi hangisi?',
    standardMount: 'Standart (Duvar/Tavan Asılı)',
    recessedMount: 'Ankastre (Asma Tavan İçi)',
    step: 'Adım'
  },
  product3d: {
    loadError: '3D Model Yüklenemedi',
    back: 'GERİ',
    view: 'GÖRÜNÜM',
    reset: 'SIFIRLA',
    orbit: 'YÖRÜNGE',
    free: 'SERBEST',
    auto: 'OTO',
    front: 'Ön',
    backLabel: 'Arka',
    left: 'Sol',
    right: 'Sağ',
    top: 'Üst',
    bottom: 'Alt'
  },
  error: {
    chunkTitle: 'Sayfa Güncellemesi Gerekli',
    chunkDesc: 'Uygulama güncellenmiş görünüyor. Sayfayı yenileyip tekrar deneyin.',
    errorTitle: 'Sayfa Yüklenemedi',
    errorDesc: 'Bu sayfa yüklenirken bir hata oluştu. Lütfen tekrar deneyin.',
    refresh: 'Sayfayı Yenile',
    retry: 'Tekrar Dene',
    devDetails: 'Hata Detayları (Geliştirme)'
  },
  homeCta: {
    button: 'Teklif İste',
    subtitle: 'Projenizin kısa bir tanımını iletişim formu veya e-posta ile iletin.',
    title: 'Projeniz Hakkında Konuşalım'
  },
  homeProcess: {
    stepPrefix: 'Adım',
    steps: {
      analysis: {
        desc: 'Ürün Seçici\'de hacim, debi ve basınç girerek ön hesap yapılır. Hesaplar ön değerlendirmedir.',
        title: 'Ön Hesaplama'
      },
      implementation: {
        desc: 'Montaj ve bakım için ürünün kullanım kılavuzu ve üretici belgesine başvurulur.',
        title: 'Montaj ve Bakım'
      },
      need: {
        desc: 'Kullanım amacınızı iletişim formu veya info@venthub.com.tr üzerinden paylaşın.',
        title: 'İhtiyaçlarınızı Anlamak'
      },
      proposal: {
        desc: 'Uygun ürün ailelerini, alternatifleri ve temin sürelerini öneriyoruz.',
        title: 'Çözüm / Teklif'
      },
      support: {
        desc: 'Teknik sorularınız için iletişim formunu ya da e-postayı kullanabilirsiniz.',
        title: 'SSS ve İletişim'
      }
    },
    subtitle: 'Katalogdan teklife: teslimat koşulları teklif aşamasında netleşir',
    title: 'Nasıl Çalışıyoruz'
  },
  beforeAfterSlider: {
    title: 'Öncesi / Sonrası',
    subtitle: 'Uygulama etkisini hızlıca görün',
    ariaLabel: 'Öncesi / sonrası karşılaştırma',
    rangeAriaLabel: 'Karşılaştırma konumu'
  },
  undecidedUserCta: {
    title: 'Hangi ürünün projenize uygun olduğundan emin değil misiniz?',
    description: 'Hacim, debi ve basınç değerlerinizle Ürün Seçici’de ön değerlendirme yapın; sorularınızı iletişim formuyla iletin.',
    buttonText: 'Ürün Seçici’yi Aç'
  }
};
