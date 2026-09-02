import { admin } from './admin/tr'

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
    brandLegalName: 'VentHub HVAC Solutions.',
    vortice: 'Vortice',
    comma: ',',
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
    addToCart: 'Sepete Ekle',
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
      'smart-home': 'Akıllı Ev Sistemleri',
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
        radial: 'Radyal Fanlar',
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
        'water-coils': 'Sulu Batarya Kanal Tipi'
      }
    },
    viewAll: 'Tümü',
    featured: 'Öne Çıkan Ürünler',
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
    whatsappTooltip: 'Mühendislik Hattı',
    whatsappSupportMessage: 'Web sitesinden hızlı destek',
    pdf: 'PDF',
    sku: 'SKU',
    share: 'Paylaş',
    requestQuote: 'Teklif İste',
    // REC-115: `common.officialGuarantee` ve `common.fastDelivery` KALDIRILDI —
    // tek tüketicileri ölü bileşen CategoryHero'ydu, o da silindi (INV-6 ölü anahtar).
    // NOT: `category.trustSignals.fastDelivery` AYRI bir anahtardır ve YAŞIYOR.
    series: 'Seri',
    reset: 'Sıfırla',
    whatsapp: {
      faqSupportMessage: 'Sıkça Sorulan Sorular sayfasında aradığım cevabı bulamadım...',
      supportMessageDefault: 'Merhaba, VentHub HVAC destek ekibiyle iletişime geçmek istiyorum.',
    }
  },
  homeShowcase: {
    slide1: {
      title: 'Endüstriyel Havalandırmada Uzmanlık',
      subtitle: 'Projenize özel çözümler ve doğru ürün seçimi'
    },
    slide2: {
      title: 'Enerji Verimliliği & Konfor',
      subtitle: 'Doğru mühendislik ile daha düşük maliyetle daha iyi performans'
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
    orbital: {
      dragHint: 'Tut Çevir',
    },
    category3DIcon: {
      dragHint: 'Tut Çevir',
    },
    smartInference: {
      aiInsightBadge: 'YZ İÇGÖRÜ V2.1',
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
      projectNamePlaceholder: 'Proje Adı (Örn: Hilton Otel Renovasyonu)',
      cancel: 'İptal Et',
      footerHint: 'Projelerinizi hesabım sayfasından yönetebilir, ürün listelerini PDF olarak indirebilir veya teklif isteyebilirsiniz.',
    },
    allProductsTitle: 'Tüm Ürünlerimiz',
    systemTotalPrefix: 'Sistemdeki tüm',
    viewGrid: 'Izgara',
    viewList: 'Liste',
    emptyTitle: 'Ürün Bulunamadı',
    emptyDesc: 'Daha fazla ürün görmek için kategorilerden birini seçin.',
    heroTitle: 'HVAC ürünlerini keşfedin: mühendislik odaklı seçim, hızlı teklif',
    heroSubtitle: 'Uygulama yönlendirmeli alanlar, popüler kategoriler ve öne çıkan ürünlerle aradığınızı hızla bulun.',
    itemsListed: 'ürün listeleniyor',
    // REC-115: `products.resultsFound` KALDIRILDI — tek tüketicisi CategoryHero'ydu.
    popularCategories: 'Popüler Kategoriler',
    hubTitle: 'Profesyonel HVAC Çözümleri',
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
      allResultsFor: 'Tüm sonuçları gör ("{{term}}")',
    },
    recentSearches: 'Son Aramalar',
    clearRecent: 'Temizle',
    popularCategories: 'Popüler Kategoriler',
    noResults: 'Sonuç bulunamadı',
    detailedSearch: 'için detaylı ara',
    keyboardHint: 'Ok tuşları ile gezinebilirsiniz',
    enterHint: 'Tüm sonuçlar için',
    placeholder: 'Ürün, kategori veya marka ara...',
    placeholderAi: 'Ürün, kategori veya yapay zeka destekli arama...',
    noResultsAdvice: 'Farklı anahtar kelimeler deneyin',
    brandPrefix: 'Marka: ',
    fuzzyMatchNotice: 'Tam eşleşme bulunamadı, benzer sonuçlar gösteriliyor.'
  },
  knowledge: {
    hub: {
      title: 'Bilgi, Mühendisliğin Ham Maddesidir',
      subtitle: 'Doğru HVAC kararları için hazırladığımız teknik rehberler, hesaplama araçları ve uygulama senaryolarını keşfedin.',
      // REC-113: TR yüzeyde EN sızıntısıydı. Komşu üst-başlıkların üslubu büyük harfli
      // Türkçe ('MÜHENDİSLİK ODAK NOKTASI'); karşılık ona uyduruldu.
      eyebrow: 'TEKNİK BİLGİ MERKEZİ',
      searchPlaceholder: 'Konu, teknik terim veya ürün ailesi ara...',
      readStart: 'Okumaya Başla',
      heroAlt: 'Mühendislik Bilgi Merkezi Görseli',
      readTime: '{{count}} dk okuma',
      calculatorsSoon: 'Hesaplayıcılar Yakında',
      calculatorsSoonDesc: 'Mühendislik hesaplamalarınızı saniyeler içinde yapın.',
      selectorSoon: 'Ürün Seçici Yakında',
      selectorSoonDesc: 'İhtiyacınıza en uygun modeli akıllı algoritmalarımızla bulun.',
      inDevelopment: 'Geliştirme Aşamasında',
      inPlanning: 'Planlama Aşamasında',
      notFoundTitle: 'Aradığınız teknik bilgiyi bulamadınız mı?',
      notFoundDesc: 'Mühendislik ekibimiz karmaşık projeleriniz için özel dökümantasyon desteği sağlamaya hazırdır.',
      contactExpert: 'Uzmanla Görüşün',
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
        summary: 'Doğru hava perdesi seçimi için kapı yüksekliği, genişliği ve kullanım amacı (konfor/endüstriyel) belirleyicidir.',
        steps: ['Kapı genişliği = cihaz genişliği (bariyer kesintisiz olmalı).', 'Çıkış hızı 7–9 m/s; zeminde 2–3 m/s hedef.', 'Nozül 10–15° iç mekâna eğimli; kapı kontağı ile otomatik hız.'],
        pitfalls: ['Kısa cihaz kullanımı', 'Çok düşük hız', 'Nozülü dışa doğru eğmek']
      },
      'jet-fan': {
        title: 'Jet Fan (Otopark)',
        image: '/images/hvac_installation_close_up_premium_3.webp',
        summary: 'CO/NOx ve duman senaryosu için akışı egzoza yönlendiren tavan fanları; kör nokta bırakmadan yerleşim gerekir.',
        steps: ['Debi: Hacim × ACH (ör. 7.200 m³ × 8 ACH ≈ 57.600 m³/h).', 'İtme kuvveti 50–100 N tipik; mesafe ve plana göre belirlenir.', 'Yerleşim: eksen aralığı 25–35 m; egzoza sürükleme; sensör zonları kapsansın.'],
        pitfalls: ['Kör hacim bırakmak', 'Sensör kapsamasını atlamak']
      },
      hrv: {
        title: 'Isı Geri Kazanım (HRV/ERV)',
        image: '/images/hvac_installation_close_up_premium_4.png',
        summary: 'Taze havayı ısı geri kazanımı ile sağlayan cihazlar; seçimde debi, verim/SFP ve harici statik basınç kritik.',
        steps: ['Debi: kişi/mahale göre toplam m³/h (EN 16798-1/ASHRAE 62.1 aralıkları).', 'Verim/SFP: %70–85 verim, düşük SFP (işletme maliyeti).', 'Basınç: filtre/kanal kayıplarına uygun harici statik basınç.'],
        pitfalls: ['Yüksek verime bakıp harici statik basıncı atlamak']
      },
      'hava-perdesi': {
        pitfalls: ['Kısa cihaz kullanımı', 'Çok düşük hız', 'Nozülü dışa doğru eğmek'],
        steps: ['Kapı genişliği = cihaz genişliği (bariyer kesintisiz olmalı).', 'Çıkış hızı 7–9 m/s; zeminde 2–3 m/s hedef.', 'Nozül 10–15° iç mekâna eğimli; kapı kontağı ile otomatik hız.'],
        summary: 'Konforu korumak ve enerji kaybını azaltmak için girişlerin üzerine kurulur; cihaz kapı genişliğini tamamen kapatmalıdır.',
        title: 'Hava Perdesi'
      }
    }
  },
  meta: {
    siteTitle: 'VentHub — Premium HVAC Çözümleri',
    siteDesc: 'Otopark jet fanı, hava perdesi, ısı geri kazanım cihazı ve kanal fanı çözümleri; mühendislik destekli ürün seçimi ve teknik danışmanlık.',
  },

  home: {
    seoTitle: 'VentHub | Endüstriyel Havalandırma ve HVAC Mühendislik Çözümleri',
    seoDesc: 'Doğru ürün, doğru hesap, doğru çözüm. Otopark havalandırmasından ısı geri kazanımına, mühendislik destekli seçim VentHub\'da.',
    hero: {
      eyebrow: 'Mühendislik Odaklı HVAC Ticareti',
      title: 'Doğru HVAC seçimine ilk ekranda girin.',
      titleLineOne: 'Doğru HVAC',
      titleLineTwo: 'seçimine ilk ekranda girin.',
      subtitle: '3D keşif, kategori akışı ve teklif yönlendirmesi tek odakta birleşir.',
      primaryCta: 'Ürünleri Keşfet',
      secondaryCta: 'Hızlı Teklif Al',
      quickAccessLabel: 'Hızlı Erişim',
      visualAlt: 'VentHub endüstriyel HVAC çözüm görseli',
      visualEyebrow: 'Kontrollü Keşif',
      visualTitle: '3D keşif ile kategori kararını ilk ekranda başlatın.',
      visualSubtitle: 'Ana sayfa artık yalnızca vitrin değil; kategori, senaryo ve uzman desteği arasında gerçek bir karar merkezi gibi davranır.',
      visualPoints: {
        selection: 'Kategori ve uygulama bazlı hızlı yönlendirme',
        routing: 'Teklif ve uzman desteğine kısa yol erişimi'
      },
      metrics: {
        coreCategories: 'çekirdek kategori üzerinden hızlı başlangıç',
        productSeries: '{{count}} seri ve alt aileye geçiş',
        entryPaths: 'akıllı yönlendirme akışı'
      },
      trustStrip: {
        authorizedBrands: 'Dünyaca tanınan markalar',
        engineeringSupport: 'Mühendislik yönlendirmesi',
        nationwideDelivery: 'Türkiye geneli sevkiyat',
        projectGuidance: 'Proje odaklı seçim desteği'
      },
      quickChips: {
        fans: 'Fanlar',
        airCurtains: 'Hava Perdeleri',
        heatRecovery: 'Isı Geri Kazanım',
        speedControl: 'Hız Kontrol',
        quote: 'Teklif İste'
      },
      categorySummaries: {
        fans: 'ATEX, endüstriyel ve ticari fan ailelerini daha hızlı karşılaştırın.',
        airCurtains: 'Giriş konforu ve enerji kaybı kontrolü için doğru hava perdesi ailesine yaklaşın.',
        heatRecovery: 'Taze hava ve verimlilik dengesini ısı geri kazanım ekseninde değerlendirin.',
        speedControl: 'Fan kontrol, sürücü ve hız yönetimini doğru ekipman katmanında seçin.'
      },
      sinevizyon: {
        altMain: 'VentHub Endüstriyel Havalandırma Sistemleri',
        altProduct: 'VentHub Özel Ürün Serisi',
        slides: [
          {
            eyebrow: 'İLERİ AERODİNAMİK MÜHENDİSLİĞİ',
            title: 'Endüstriyel Havalandırma Katmanları',
            subtitle: 'Yüksek debili sistemlerde statik balanslı ve akustik optimize edilmiş çözüm eksenleri.',
            products: [
              {
                label: 'Vortice Lineo',
                subLabel: 'Kanal Tipi Karma Akışlı Fan'
              },
              {
                label: 'Lineo Quiet',
                subLabel: 'Ultra Sessiz Performans'
              }
            ]
          },
          {
            eyebrow: 'FÜTÜRİSTİK İKLİMLENDİRME',
            title: 'Vortice Lineo Quiet: Sessizliğin Geleceği',
            subtitle: 'Minimum enerji tüketimi, maksimum hava transfer verimliliği ve premium sessiz konforun kusursuz dengesi.',
            products: [
              {
                label: 'Hava Akış Teknolojisi',
                subLabel: 'Laminer Akış Kontrolü'
              },
              {
                label: 'EC Motor Verimi',
                subLabel: 'Düşük Enerji Tüketimi'
              }
            ]
          },
          {
            eyebrow: 'HASSAS HVAC SİSTEMLERİ',
            title: 'Teknik Mükemmeliyet ve Akıllı Akış',
            subtitle: 'Endüstriyel mutfak, otopark ve konfor alanları için uçtan uca determisitik havalandırma mühendisliği.',
            products: [
              {
                label: 'Endüstriyel Çözümler',
                subLabel: 'Yüksek Kapasite'
              },
              {
                label: 'Akıllı Kontrol',
                subLabel: 'Otomasyon Entegrasyonu'
              }
            ]
          }
        ]
      }
    },
    cinematicShowcase: {
      // REC-113: dekoratif HUD metni ama YİNE DE ekranda okunan Türkçe-sayfa metnidir.
      // Noktalı "makine" üslubu korunarak çevrildi.
      hudStatus: 'Sistem.Veri.Canlı',
      eyebrow: 'MÜHENDİSLİK ODAK NOKTASI',
      title: 'Vortice Lineo Quiet Serisi',
      subtitle: 'Aero-akustik gövde tasarımı ile sessizliğin yeni dijital standardı.',
      description: 'Özel susturucu katmanlara sahip dış gövdesi ve dinamik balanslı motor yapısı ile yüksek statik basınçta bile ultra sessiz operasyon verimliliği sunar.',
      cta: 'Yüksek Çözünürlüklü Teknik Verilere Ulaş',
      badge: 'ENDÜSTRİYEL ODAK',
      componentLabel: 'Sistem Bileşeni',
      hotspots: {
        motor: 'Yüksek Verimli EC Motor',
        motorDetail: 'Hassas devir ve tork yönetimi sağlayan EC motor teknolojisi.',
        clamps: 'Vibrasyon Önleyici Kelepçeler',
        clampsDetail: 'Hızlı servis ve montaj imkanı sunan titreşim sönümleyici modüller.',
        housing: 'Akustik Kompozit Gövde',
        housingDetail: 'Minimum akustik yayılım için ses absorbe edici katmanlar.',
        airflow: 'Laminer Akış Kanatları',
        airflowDetail: 'Maksimum hava yönlendirme verimliliği sağlayan kanat tasarımı.'
      }
    },
    quickEntry: {
      eyebrow: 'MÜHENDİSLİK GİRİŞ NOKTASI',
      title: 'İhtiyacınıza En Uygun Teknik Ekseni Seçin',
      subtitle: 'Ürün kategorisi, spesifik uygulama senaryosu veya teknik destek katmanı üzerinden profesyonel çözüme ilerleyin.',
      items: {
        category: {
          title: 'Ürün Gruplarını İncele',
          description: 'Atex fanlardan sessiz kanal tiplerine, ana ürün ailelerini teknik verileriyle keşfedin.'
        },
        application: {
          title: 'Uygulama Senaryoları',
          description: 'Otopark jet fan sistemleri, mutfak egzoz çözümleri ve hassas iklimlendirme projeleri.'
        },
        support: {
          title: 'Mühendislik Desteği',
          description: 'Boyutlandırma, hesaplama araçları ve sistem entegrasyonu için teknik bilgi merkezine ulaşın.'
        },
        quote: {
          title: 'Proje Bazlı Teklif Al',
          description: 'Teknik şartnamenizi bizimle paylaşın, optimize edilmiş özel fiyatlandırma akışını başlatın.'
        }
      }
    },
    guidedDiscovery: {
      eyebrowLabel: 'DETERMİNİSTİK SİSTEMLER',
      heading: 'Hava Akışının Mühendislik Estetiği',
      intro: 'VentHub kürasyonu ile endüstriyel standartlarda havalandırma çözümlerini keşfedin.',
      cardFallback: 'Profesyonel Havalandırma Çözümleri',
      eyebrow: 'DETERMİNİSTİK SİSTEMLER',
      title: 'Hava Akışının Mühendislik Estetiği',
      subtitle: 'VentHub kürasyonu ile endüstriyel standartlarda havalandırma çözümlerini keşfedin. Proje tipinize göre en verimli giriş noktasını seçin.',
      seriesCount: '{{count}} Seri',
      categoryFallback: 'Premium HVAC çözümleri ile sistem verimliliğinizi maksimize edin.',
      panelEyebrow: 'KARAR MATRİSİ',
      panelTitle: 'Kategori Seçiminden Teknik Karara Net Geçiş',
      panelBody: 'Kullanıcıyı önce doğru ürün ailesine, ardından spesifik seri katmanına ve nihayetinde aerodinamik detaylara taşıyan profesyonel navigasyon.',
      panelFallback: 'Kategoriye ait ürün serilerini ve teknik varyasyonları net biçimde analiz edin.',
      primaryCta: 'TEKNİK KOLEKSİYONU İNCELE',
      secondaryCta: 'Uygulama Senaryolarına Bak',
      seriesEyebrow: 'SERİ HIZLI ERİŞİM',
      seriesTitle: '{{category}} Mühendislik Serileri',
      seriesFallback: 'Bu seri için performans eğrilerini ve varyasyonları inceleyin.',
      footerNote: 'Kategori keşfi burada başlar; karmaşık sistem yapılarını seri mantığıyla basitleştiriyoruz.',
      steps: {
        select: {
          title: 'Primer Kategoriyi Belirleyin',
          description: 'Fan, hava perdesi veya ısı geri kazanım gibi ana mühendislik gruplarından başlayın.'
        },
        compare: {
          title: 'Seri Seviyesinde Filtreleyin',
          description: 'Kapasite, akustik izole veya Atex gereksinimine göre doğru ürün koluna geçin.'
        },
        convert: {
          title: 'Ürün ve Teklif Seviyesine İnin',
          description: 'Teknik parametreler netleşince veri dökümanlarına ve proje teklifine odaklanın.'
        }
      },
      loading: 'Sistem katmanları hazırlanıyor...'
    },
    applicationSolutions: {
      eyebrow: 'Senaryo Odaklı Çözümler',
      title: 'Üründen değil, kullanım senaryosundan da başlayabilirsiniz.',
      subtitle: 'Mağaza girişindeki konfordan ticari alan konforuna kadar farklı HVAC ihtiyaçlarını çözüm mantığıyla sunuyoruz.',
      viewAll: 'Tümü Gör',
      items: {
        entrance: {
          eyebrow: 'Giriş Konforu',
          title: 'Mağaza girişi ve hava perdesi çözümleri',
          description: 'Kapı açıklıklarında konforu artırmak ve enerji kaybını azaltmak için hava perdesi keşfini daha anlaşılır hale getirin.',
          point1: 'Giriş konforu odaklı seçim',
          point2: 'Enerji kaybını azaltan yapı'
        },
        comfort: {
          eyebrow: 'Ticari Alan Konforu',
          title: 'Isı geri kazanım ve verimli ticari iklimlendirme',
          description: 'Ticari alanlarda iç hava kalitesi ve enerji verimliliği ihtiyacını ısı geri kazanım ekseninde değerlendirin.',
          point1: 'Verimlilik odaklı ürün ailesi',
          point2: 'Konfor ve taze hava dengesine geçiş'
        }
      }
    },
    featuredCommercial: {
      gradeLabel: 'Sınıf',
      gradeValue: 'A++',
      standardLabel: 'Standart',
      standardValue: 'ERP',
      eyebrow: 'Ürün Showroom',
      title: 'Endüstriyel Ürün Portföyü',
      subtitle: 'Sektörün en güvenilir ve verimli ürünlerini, teknik detayları ve uygulama avantajlarıyla birlikte keşfedin.',
      cta: 'Tüm Koleksiyonu İncele',
      panelEyebrow: 'Teknik Odak',
      tabs: {
        featured: 'Öne Çıkanlar',
        newArrivals: 'Yeni Gelenler',
        bestSellers: 'Çok Satanlar',
        airCurtains: 'Hava Perdeleri',
        heatRecovery: 'Isı Geri Kazanım'
      },
      panelTitles: {
        featured: 'Performans Liderleri',
        newArrivals: 'En Yeni Teknolojiler',
        bestSellers: 'En Çok Tercih Edilenler',
        airCurtains: 'İklim Koruma Sistemleri',
        heatRecovery: 'Enerji Geri Kazanımı'
      },
      panelDescriptions: {
        featured: 'Mühendislik ekibimiz tarafından dayanıklılık ve verimlilik testlerinden tam not almış, projelerin amiral gemisi çözümleri.',
        newArrivals: 'VentHub ürün ailesine yeni katılan, enerji verimliliği en yüksek ve modern tasarımlı yeni nesil cihazlar.',
        bestSellers: 'Sektör profesyonelleri ve büyük projeler tarafından en çok sipariş edilen, güvenilirliği sahada kanıtlanmış modeller.',
        airCurtains: 'Giriş alanlarında görünmez bir termal bariyer oluşturarak iç mekan konforunu koruyan profesyonel seriler.',
        heatRecovery: 'Taze hava ihtiyacını karşılarken atık havadaki ısıyı %90\'a varan verimle geri kazanan ekonomik üniteler.'
      }
    },
    trustProof: {
      eyebrow: 'Güven ve Uzmanlık',
      title: 'Mühendislik Hassasiyeti, Operasyonel Güven',
      subtitle: 'Havalandırma projelerinizde sadece bir tedarikçi değil, teknik çözüm ortağınızız. Her adımda doğrulanabilir kalite ve uzman desteği sunuyoruz.',
      badge: 'ONAYLI',
      visualAlt: 'Teknik Kurulum',
      items: {
        brands: {
          eyebrow: 'Güvence',
          title: 'Marka ve Garanti Güvencesi',
          description: 'Dünya devi HVAC markalarının en güncel ve sertifikalı ürün gamını marka güvencesiyle sunuyoruz.'
        },
        guidance: {
          eyebrow: 'Analiz',
          title: 'Mühendislik Odaklı Seçim',
          description: 'İhtiyacınızı sadece ürünle değil, debi ve basınç hesaplamaları içeren teknik analizlerle en verimli şekilde çözüyoruz.'
        },
        delivery: {
          eyebrow: 'Lojistik',
          title: 'Hızlı ve Güvenli Sevkiyat',
          description: 'Geniş stok ağımız ve profesyonel lojistik partnerlerimizle, proje takviminizi aksatmadan tam zamanında teslimat yapıyoruz.'
        },
        support: {
          eyebrow: 'Süreklilik',
          title: 'Kesintisiz Teknik Destek',
          description: 'Satış sonrası teknik dökümantasyon, montaj rehberliği ve uzman kadromuzla sisteminizin ömrü boyunca yanınızdayız.'
        }
      }
    },
    strategicBrands: {
      eyebrow: 'Stratejik Markalar',
      title: 'Çalıştığımız markalar sadece logo değil, çözüm mimarisinin temelidir.',
      subtitle: 'Marka alanını pasif logo vitrini olmaktan çıkarıp kalite, güven ve ürün yaklaşımının taşıyıcısı haline getiriyoruz.'
    },
    knowledge: {
      headingPrefix: 'Mühendislik',
      headingAccent: 'Katmanı',
      statsPipelineLabel: 'Proje Hattı',
      statsOptimization: '%92 Optimizasyon',
      eyebrow: 'Bilgi ve Destek Katmanı',
      title: 'Mühendislik Estetiği',
      subtitle: 'Rehberler, hesaplayıcılar ve destek merkezi sayesinde kullanıcı yalnızca ürüne değil, doğru karar ortamına da sonuçları saniyeler içinde ulaşır.',
      cta: 'İncele',
      hub: {
        title: 'Bilgi, Mühendisliğin Ham Maddesidir',
        subtitle: 'Doğru HVAC kararları için hazırladığımız teknik rehberler, hesaplama araçları ve uygulama senaryolarını keşfedin.',
        searchPlaceholder: 'Konu, teknik terim veya ürün ailesi ara...',
        readStart: 'Okumaya Başla',
        calculatorsSoon: 'Hesaplayıcılar Yakında',
        calculatorsSoonDesc: 'HRV, hava perdesi ve jet fan hesaplamalarınızı saniyeler içinde yapın.',
        selectorSoon: 'Ürün Seçici Yakında',
        selectorSoonDesc: 'İhtiyacınıza en uygun modeli akıllı algoritmalarımızla bulun.',
        inDevelopment: 'Geliştirme Aşamasında',
        inPlanning: 'Planlama Aşamasında',
        notFoundTitle: 'Aradığınız teknik bilgiyi bulamadınız mı?',
        notFoundDesc: 'Mühendislik ekibimiz karmaşık projeleriniz için özel dökümantasyon desteği sağlamaya hazırdır.',
        contactExpert: 'Uzmanla Görüşün',
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
          title: 'Seçim rehberleri ve teknik içerikler',
          description: 'Kategori bazlı rehberler ve konu sayfaları ile ürün seçimini daha bilinçli hale getirin.'
        },
        calculators: {
          eyebrow: 'Hesaplayıcılar',
          title: 'Hızlı hesaplama araçları',
          description: 'HRV, hava perdesi ve kanal gibi araçlarla teknik ön değerlendirmeyi hızlandırın.'
        },
        support: {
          eyebrow: 'Destek',
          title: 'SSS ve operasyonel destek akışı',
          description: 'Sık sorulan sorular ve destek yolları ile teklif ve satış sonrası süreçlere daha rahat geçin.'
        }
      }
    },
    finalCta: {
      eyebrow: 'Son Adım',
      title: 'Doğru HVAC çözümünü birlikte netleştirelim.',
      subtitle: 'Kategori keşfinden teknik desteğe kadar kurduğumuz bu akışı şimdi uzman görüşü, teklif ve ürün keşfi ile tamamlayın.',
      primaryCta: 'Teklif İste',
      secondaryCta: 'Uzmanla Görüş',
      tertiaryCta: 'Ürünleri Keşfet'
    },
    features: {
      euQuality: 'Avrupa kalite standartları',
      fastDelivery: 'Hızlı teslimat',
      warranty: '2 yıl garanti',
      support: '7/24 teknik destek'
    },
    heroTitle: 'Temiz Hava, Temiz Gelecek',
    heroSubtitle: 'Mühendislik odaklı havalandırma platformu. 6 önde gelen marka, 50+ ürün çeşidiyle profesyonel havalandırma çözümleri.',
    bottomCtaTitle: 'Doğru ürünü seçmenize yardımcı olalım.',
    bottomCtaSubtitle: 'Proje detayınızı paylaşın, mühendislik ekibimiz hızlıca yönlendirsin.',
    whyParagraph: '15+ yıllık deneyimimiz ve dünya standartlarındaki ürünlerimizle HVAC sektöründe güvenilir partneriniziz.',
    why: {
      premiumTitle: 'Premium Kalite',
      premiumText: 'Avrupa standartlarında, dünya çapında tanınan markalardan sadece en kaliteli ürünleri seçiyoruz.',
      expertTitle: 'Uzman Destek',
      expertText: 'HVAC uzmanlarımız size en uygun çözümü bulmak için 7/24 teknik destek sağlar.',
      fastTitle: 'Hızlı Teslimat',
      fastText: 'Türkiye genelinde hızlı ve güvenli teslimat.'
    },
    whyVentHub: {
      title: 'Neden',
      subtitle: 'Türkiye\'nin güvenilir HVAC e-ticaret platformu',
      features: {
        brands: {
          title: 'Premium Markalar',
          description: 'Vortice, Casals ve sektörün lider markalarının ürünleri'
        },
        support: {
          title: 'Uzman Desteği',
          description: 'Profesyonel teknik danışmanlık hizmeti'
        },
        delivery: {
          title: 'Hızlı Teslimat',
          description: 'Türkiye geneli 2-5 iş günü içinde kapınızda'
        }
      },
      badges: {
        premium: 'Premium Markalar',
        ce: 'CE Sertifikalı',
        warranty: '2 Yıl Garanti',
        shipping: 'Aynı Gün Kargo'
      },
      authorizedDealer: {
        prefix: 'VentHub,',
        brand: 'Vortice',
        suffix: 'ürünlerini marka güvencesiyle sunar.'
      }
    },
    stats: {
      premiumBrands: 'Premium Marka',
      productTypes: 'Ürün Çeşidi',
      yearsExperience: 'Yıl Deneyim',
      happyCustomers: 'Mutlu Müşteri'
    },
    galleryTitle: 'Ürün Galerisi',
    gallerySubtitle: 'Öne çıkan ürünlere göz atın',
    caseStudies: {
      title: 'Başarı Hikayeleri',
      subtitle: 'Gerçek projelerden elde edilen sonuçlar',
      viewDetails: 'Detayları İncele',
      items: {
        parking: {
          title: 'Otopark Jet Fan Projesi',
          summary: 'CO sensörlü kontrol ile enerji tüketiminde belirgin azalma ve hava kalitesinde iyileşme.',
          metrics: {
            energySavings: 'Enerji Tasarrufu',
            duration: 'Süre'
          }
        },
        airCurtain: {
          title: 'Hava Perdesi Uygulaması',
          summary: 'Giriş konforunda artış, ısı kaybında azalma ve kapı çevresinde sıcaklık stabilitesi.',
          metrics: {
            comfortIncrease: 'Konfor Artışı',
            roi: 'Geri Dönüş'
          }
        }
      }
    }
  },
  megamenu: {
    elite: {
      defaultDescription: 'Yüksek kaliteli havalandırma çözümleri.',
      viewAll: 'Tümünü Gör',
    },
    classic: {
      logoInitial: 'V',
      title: 'Kategoriler',
    },
    categoryHub: {
      featuredTechnology: 'ÖNE ÇIKAN TEKNOLOJİ',
      defaultDescription: 'Yüksek performanslı, akıllı endüstriyel çözüm.',
      back: 'Geri Dön',
      subCategoryCount: '{{count}} Alt Kategori',
    },
    productCategories: 'Ürün Kategorileri',
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
    quickOrder: 'Hızlı Sipariş',
    recentlyViewed: 'Son Görüntülenen',
    favorites: 'Favoriler',
    cart: 'Sepet',
    brandName: 'VentHub',
    brandTagline: 'HVAC Premium',
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
    draftWarning: 'Bu metin taslaktır ve test amaçlıdır. Canlıya çıkmadan önce şirketinizin gerçek bilgileri ile güncelleyiniz ve bir hukukçudan teyit alınız.',
    disclaimer: 'Bu metin hukuki danışmanlık niteliği taşımaz. Nihai metin için uzman görüşü almanız tavsiye edilir.',
    privacyTitle: 'Gizlilik Politikası (Taslak)',
    cookieTitle: 'Çerez Politikası (Taslak)',
    distanceSalesTitle: 'Mesafeli Satış Sözleşmesi (Taslak)',
    preInformationTitle: 'Ön Bilgilendirme Formu (Taslak)',
    termsTitle: 'Kullanım Koşulları (Taslak)'
  },
  footer: {
    quickLinks: 'Hızlı Linkler',
    categories: 'Kategoriler',
    contact: 'İletişim',
    workingHours: 'Çalışma Saatleri',
    weekdays: 'Hafta İçi',
    saturday: 'Cumartesi',
    rights: 'Tüm hakları saklıdır.',
    // address/phone BİLİNÇLİ YOK (2026-08-28): uydurma adres ve numara yayınlanmaz.
    // Gerçek bilgi olunca EN sözlüğüyle BİRLİKTE geri eklenir (parite).
    email: 'info@venthub.com.tr',
    social: {
      facebook: 'Facebook',
      twitter: 'Twitter',
      linkedin: 'LinkedIn',
      instagram: 'Instagram'
    }
  },
  admin,
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
    page: {
      statGlobal: 'Küresel',
    },
    sectionTitle: 'Premium HVAC Markaları',
    sectionSubtitle: 'Dünyanın önde gelen HVAC markalarının ürünlerini marka güvencesiyle sunuyoruz.',
    subtitlePart1: 'Dünya Devlerinin',
    subtitlePart2: 'Güvenilir Partneri',
    viewAll: 'Tüm Markaları Gör',
    pageTitle: 'Markalar',
    pageSubtitle: 'Dünyanın en prestijli HVAC üreticilerinin mühendislik harikası çözümlerini projelerinizle buluşturuyoruz.',
    eyebrow: 'Mükemmelliğin Global İmzaları',
    exploreBrand: 'Markayı Keşfedin',
    seoDesc: 'VentHub çatısı altındaki endüstriyel havalandırma markaları',
    notFound: 'Marka bulunamadı',
    backToAll: 'Tüm markalara dön',
    aboutBrand: 'hakkında bilgi',
    trust: {
      eyebrow: 'Tedarik Zinciri',
      title: 'Güvenceli Tedarik',
      description: 'Kurulu tedarik ağımız sayesinde en yeni teknolojilere, tam teknik desteğe ve rekabetçi termin sürelerine sahip olursunuz.',
      original: 'Marka Güvencesi',
      standard: 'Global Standart Uyumu',
      imageAlt: 'Teknik Altyapı ve HVAC Kurulumu'
    },
    detail: {
      curatedSolutions: 'Seçkin Çözümler',
      heritage: 'Mühendislik Mirası',
      authorityTitle: 'Mühendisliğin Teknolojik Otoritesi',
      globalVision: 'Küresel Vizyon',
      globalVisionDesc: 'dünya çapındaki projelerde verimlilik ve sürdürülebilirlik standartlarını belirleyerek, geleceğin havalandırma teknolojilerini bugün inşa ediyor.',
      technicalExcellence: 'Teknik Mükemmeliyet',
      technicalExcellenceDesc: 'Her bir ürün, en zorlu endüstriyel koşullara dayanacak şekilde test edilmiş ve akustik performans açısından optimize edilmiştir.',
      corporateSnapshot: 'Kurumsal Özet',
      headquarters: 'Merkez',
      webAuthority: 'Web Otoritesi',
      officialSite: 'Resmi Web Sitesi',
      requestCatalog: 'Marka Kataloglarını İste',
      featuredSystems: 'Öne Çıkan Sistemler',
      allProductGroups: 'Tüm Ürün Grupları',
      noProducts: 'Bu markaya ait ürünler yakında eklenecektir.',
      originSuffix: 'Menşei',
      estPrefix: 'Kuruluş',
      // REC-98: "Kurumsal Özet" satırlarının ETİKETLERİ. Değer tarafı veri olarak
      // `BRAND_DETAILS` içinde taşınır; etiket burada, çünkü arayüz metnidir.
      statCountries: 'Ülke Sayısı',
      statGroup: 'Grup',
      statProduction: 'Üretim',
      statWarranty: 'Garanti',
      statExperience: 'Deneyim',
      statExpertise: 'Uzmanlık',
      statQuality: 'Kalite'
    }
  },
  contactPage: {
    form: {
      heroBadge: 'Küresel Bağlantı',
      heroTitle: 'Projenizi',
      heroTitleAccent: 'Birlikte Şekillendirelim',
      heroDesc: 'Teknik dökümantasyon, ürün seçimi veya özel teklifler için uzman mühendislik kadromuzla doğrudan iletişime geçin.',
      cardPhoneTitle: 'Mühendislik Hattı',
      cardPhoneLabel: 'Şimdi Ara',
      cardEmailTitle: 'Teknik Teklif',
      cardEmailLabel: 'E-posta Gönder',
      // cardOffice* KALDIRILDI (2026-08-28): gerçek ofis adresi yok, kart da yok.
      directAccessLabel: 'Doğrudan Erişim',
      supportTitle: 'Teknik Destek',
      supportTitleAccent: 'Her An Yanınızda',
      supportDesc: 'Karmaşık HVAC projeleriniz için hızlı çözümler üretiyoruz. WhatsApp hattımız üzerinden teknik döküman isteyebilir veya anlık destek alabilirsiniz.',
      whatsappCta: 'WhatsApp Mühendislik Hattı',
      responseTime: 'Ortalama Yanıt Süresi: 15 Dakika',
      successTitle: 'Mesajınız İletildi',
      successDesc: 'Mühendislik ekibimiz en kısa sürede size dönüş yapacaktır.',
      newMessage: 'Yeni Mesaj Gönder',
      labelName: 'Ad Soyad',
      labelEmail: 'E-posta',
      labelSubject: 'Konu / Proje Adı',
      labelMessage: 'Mesajınız',
      subjectPlaceholder: 'Örn: Otopark Jet Fan Projesi',
      messagePlaceholder: 'İhtiyaçlarınızı buraya yazın...',
      submitButton: 'Talebi Gönder',
      consentText: 'okudum ve kabul ediyorum.',
      consentRequired: 'KVKK metnini onaylamalısınız',
      submitFailed: 'Mesajınız gönderilemedi. Lütfen tekrar deneyin; sorun sürerse bize doğrudan ulaşın.',
    },
    title: 'İletişim',
    subtitle: 'Size her konuda yardımcı olmaktan mutluluk duyarız.',
  },
  aboutPage: {
    title: 'Hakkımızda',
    vision: 'Vizyonumuz',
    experience: 'Yıllık Tecrübe',
    distributorship: 'Küresel Marka Ağı',
    completedProject: 'Ürün Çeşidi',
    shippingNetwork: 'İl Sevkiyat Ağı',
    precisionTitle: 'Mühendislik Hassasiyeti',
    precisionDesc: 'Sadece ürün satmıyoruz; her projeye özel debi, basınç ve verimlilik hesaplamalarıyla mühendislik çözümü sunuyoruz.',
    standardsTitle: 'Global Standartlar',
    standardsDesc: 'Dünya devi HVAC markalarının en güncel ve sertifikalı teknolojilerini yerel pazara taşıyoruz.',
    trustTitle: 'Operasyonel Güven',
    trustDesc: 'Tedarik ve operasyon süreçlerimizi proje takvimlerinize sadık kalacak şekilde titizlikle yönetiyor, zamanında teslimatı hedefliyoruz.',
    heroBadge: '15+ Yıl Mühendislik Deneyimi',
    heroTitle: 'Havayı',
    heroTitleItalic: 'Yeniden Tanımlıyoruz',
    heroDesc: 'VentHub, modern yaşam ve endüstriyel alanlar için yüksek verimli, teknolojik ve sürdürülebilir havalandırma sistemlerini Türkiye pazarına sunar.',
    storyTitle: 'Geleceğin İklimini',
    storyTitleItalic: 'Bugün Kuruyoruz',
    storyDesc1: 'VentHub, havalandırma sektöründe sadece bir tedarikçi değil, teknolojik bir çözüm ortağı olarak konumlanmaktadır. 15 yılı aşkın saha deneyimimizle, Avrupa\'nın en prestijli markalarını Türkiye\'nin büyük projeleriyle buluşturuyoruz.',
    storyDesc2: 'Operasyonlarımızda mühendislik etiğini ve operasyonel mükemmeliyeti her şeyin önünde tutuyoruz. Bizim için her ürün bir bileşen, her proje ise bir havalandırma sanatı eseridir.',
    teamTitle: 'Mühendislik &',
    teamSubtitle: 'Teknik Destek Yaklaşımımız',
    brandTitle: 'Marka',
    brandTitleItalic: 'Portföyümüz',
    ctaTitle: 'Mühendislik Ortağınızla',
    ctaTitleItalic: 'Tanışmaya Hazır mısınız?',
    ctaContact: 'İletişime Geçin',
    ctaExplore: 'Ürünleri Keşfedin',
    seoDescription: 'VentHub: mühendislik odaklı havalandırma çözümleri. 15 yıllık saha tecrübesiyle endüstriyel havalandırmada doğru ürün seçimi.',
    whySubtitle: 'Güveninize layık olmak için çalışıyoruz',
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
    // Ödeme yolu ENV bayrağıyla KAPALI olduğunda gösterilen metinler
    // (bkz. app/[lang]/checkout/page.tsx — NEXT_PUBLIC_ODEME_ACIK).
    kapali: {
      baslik: 'Ödeme yakında açılıyor',
      aciklama: 'Mağazamız kuruluş aşamasında. Fiyatlar günceldir; sipariş için bizden teklif isteyebilirsiniz — aynı gün dönüş yapıyoruz.',
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
      standardEta: '3–5 iş günü',
      expressName: 'Ekspres',
      expressEta: '1–2 iş günü',
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
    orderCompletedTitle: 'Siparişiniz Tamamlandı!',
    orderNoLabel: 'Sipariş No',
    orderCompletedDesc: 'Siparişiniz başarıyla alındı. Onay e-postası kısa süre içinde gönderilecektir.',
    dateLabel: 'Tarih',
    itemsCountLabel: 'Ürünler',
    securedBy3d: '3D Secure ile korundu',
    viewOrderDetails: 'Sipariş Detaylarını Gör',
    failedGeneric: 'Ödeme tamamlanamadı',
    failedToast: 'Ödeme hatası: {{msg}}',
    verifyError: 'Doğrulama hatası',
    errorDuring: 'Hata: {{msg}}',
    unverified: 'Ödeme doğrulanamadı',
    unexpected: 'Beklenmedik bir hata oluştu'
  },
  category: {
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
      subtitle: 'Hava perdeleri hakkında en çok merak edilenler',
      moreQuestions: 'Başka sorularınız mı var?',
      contactUs: 'Bize ulaşın →',
      q1: 'Hava perdesi gerçekten enerji tasarrufu sağlar mı?',
      a1: 'Evet, hava perdesi kapı açıkken iç ortamın sıcaklığını koruyarak %30\'a varan enerji tasarrufu sağlayabilir. Özellikle sık kapı açılışı olan işletmelerde (mağaza, restoran, market) bu tasarruf çok belirgindir.',
      q2: 'Elektrikli mi yoksa ortam havalı mı tercih etmeliyim?',
      a2: 'Bu, kullanım yerinize bağlıdır. Kış aylarında kapı önünde ısıtma istiyorsanız elektrikli isıtıcılı model idealdir. Soğuk hava deposu veya mevcut ısıtma sisteminiz varsa ortam havalı model yeterlidir ve daha ekonomiktir.',
      q3: 'Hava perdesi hangi boyutta olmalı?',
      a3: 'Hava perdesi genişliği, kapı genişliğine eşit veya biraz daha geniş olmalıdır. Örneğin 120 cm\'lik bir kapı için 120 cm veya 150 cm\'lik model uygundur. Montaj yüksekliği de önemlidir - cihazın teknik özelliklerinde belirtilen maksimum yüksekliğe dikkat edin.',
      q4: 'Kurulum zor mu?',
      a4: 'Hava perdeleri genellikle kapı üstüne asılarak monte edilir. Profesyonel montaj önerilir ancak temel elektrik bilgisi olan bir teknisyen kolayca kurabilir. Kurulum kiti ve montaj kılavuzu ürünle birlikte gelir.',
      q5: 'Bakım gerektirir mi?',
      a5: 'Minimal bakım yeterlidir. Yılda 1-2 kez filtrelerin temizlenmesi ve fan kanatlarının toz alınması önerilir. Düzenli bakım, cihazın ömrünü uzatır ve performansını korur.',
      q6: 'Vortice garantisi ne kadar?',
      a6: 'Vortice ürünleri 2 yıl üretici garantisi ile satılmaktadır. Garanti kapsamında üretim hatalarından kaynaklanan arızalar ücretsiz onarılır veya değiştirilir. Garanti işlemlerinizi marka güvencesi kapsamında hızlıca yönetiyoruz.',
    },
    trustSignals: {
      // REC-104 (Recep hükmü 2026-09-01):
      // · "Marka Güvencesi / Marka güvenceli Vortice ürünleri" TÜM kategorilerde tek
      //   markanın adını geçiriyordu → markaya özgü cümle kalktı, genel-doğru metin geldi.
      // · "2 Yıl Garanti" rakamı kalktı: kendi destek sayfamız "garanti kapsamı
      //   üretici/ithalatçıya göre değişebilir" diyor, rozet ise sabit süre vaat ediyordu.
      // · ce / iso9001 / compassoDoro sertifika satırı KALDIRILDI (marka sertifikaları
      //   tüm kategorilerde basılıyordu); 15A'da marka sayfasında ele alınacak.
      authorizedDealerTitle: 'Yetkili Distribütörlük',
      authorizedDealerDesc: 'Orijinal ürün, resmi tedarik zinciri',
      warrantyTitle: 'Üretici Garantisi',
      warrantyDesc: 'Üretici/ithalatçı koşullarına tabi',
      // REC-104: securePayment* / fastShipping* / installment* anahtarları KALDIRILDI —
      // çevrimiçi ödeme kapalıyken "SSL şifreli işlem" ve "12 aya varan taksit" karşılığı
      // olmayan vaatlerdi. Bkz. docs/standards/vaat-butunlugu-standard.md
      techSupportTitle: 'Teknik Destek',
      techSupportDesc: 'Uzman danışmanlık',
    },
    typeComparison: {
      sectionTitle: 'Hangi Tip Hava Perdesi Size Uygun?',
      sectionSubtitle: 'İhtiyacınıza göre doğru tipi seçin. İkisi de aynı kalitede, farklı amaçlar için tasarlandı.',
      electricSubtitle: 'Kış kullanımı için ideal',
      electricBenefit1: 'Kapı önünde sıcak hava bariyeri',
      electricBenefit2: 'Kış aylarında enerji tasarrufu',
      electricBenefit3: 'Müşteri konforunu artırır',
      electricBenefit4: 'Termostat kontrollü ısıtma',
      electricBestFor1: 'Mağaza girişleri',
      electricBestFor2: 'Restoran kapıları',
      electricBestFor3: 'Otel lobileri',
      electricBestFor4: 'Soğuk iklimlerde',
      electricNotFor1: 'Soğuk hava depoları',
      electricNotFor2: 'Yaz mevsimi kullanımı',
      ambientTitle: 'Ortam Havalı',
      ambientSubtitle: 'Enerji tasarrufu odaklı',
      ambientBenefit1: 'Düşük enerji tüketimi',
      ambientBenefit2: 'Soğuk zincir koruması',
      ambientBenefit3: 'Hijyen bariyeri',
      ambientBenefit4: 'Mevcut ısıtma sistemine ek',
      ambientBestFor1: 'Soğuk hava depoları',
      ambientBestFor2: 'Market reyonları',
      ambientBestFor3: 'Hastaneler',
      ambientBestFor4: 'Yazlık mekanlar',
      ambientNotFor1: 'Isıtmasız mekanlar',
      ambientNotFor2: 'Çok soğuk iklimlerde',
      advantagesLabel: 'AVANTAJLARI',
      bestForLabel: 'EN UYGUN:',
      notForLabel: 'TERCİH EDİLMEZ:',
      modelsCta: '{{title}} Modelleri',
      stillUndecided: 'Hala kararsız mısınız?',
      wizardPitch: '2 dakikalık ihtiyaç analizi sihirbazımız size en uygun tipi ve modeli önerecek.',
      helpMe: 'Bana Yardım Et',
    },
    bottomCta: {
      nextStep: 'Sıradaki Adımınız',
      helpText: 'Size en uygun {{category}} için yardımcı olalım',
      viewAllProducts: 'Tüm ürünleri görüntüle',
      findFit: 'Bana Uygun Olanı Bul',
      findFitDesc: '3 adımda doğru model',
      expertSupport: 'Uzman Desteği',
      expertSupportDesc: 'Proje danışmanlığı al',
      backToTop: 'Başa Dön',
    },
    problemSection: {
      headerTitle: 'Kapınızdan Ne Kadar Enerji Kaçıyor?',
      headerSubtitle: 'Açık kapı = Açık cüzdan. Her gün farkında olmadan enerji ve para kaybediyorsunuz.',
      energyLossTitle: 'Enerji Kaybı',
      energyLossDesc: 'Açık kapıdan kaçan ısının yıllık ortalama maliyeti',
      tempDiffTitle: 'Sıcaklık Farkı',
      tempDiffDesc: 'Kapı açıldığında iç-dış ortam sıcaklık farkı',
      airflowTitle: 'Hava Akışı',
      airflowDesc: 'Kontrolsüz rüzgar ve toz girişi',
      pestTitle: 'Zararlı Girişi',
      pestDesc: 'Böcek ve toz partiküllerinin serbest geçişi',
      crossMark: '❌',
      checkMark: '✓',
      withoutTitle: 'Hava Perdesi Olmadan',
      withoutPoint1: 'Isı kaybı sürekli',
      withoutPoint2: 'Enerji faturası yüksek',
      withoutPoint3: 'Konfor düşük',
      withoutPoint4: 'Zararlı girişi kolay',
      withTitle: 'Hava Perdesi İle',
      withPoint1: 'Görünmez enerji bariyeri',
      withPoint2: '%30\'a varan tasarruf',
      withPoint3: 'Konforlu iç ortam',
      withPoint4: 'Zararlılara karşı kalkan',
    },
    landing: {
      expertiseArea: 'Uzmanlık Alanı',
      descriptionFallback: 'Profesyonel çözümleri teknik detaylarıyla keşfedin.',
      detailedReview: 'Detaylı İncele',
      viewModels: 'Modelleri Gör',
      dehumidifierTitle: 'Nem Kontrolünde Mühendislik Hassasiyeti',
      dehumidifierDesc: 'Endüstriyel ve konfor alanları için optimize edilmiş nem alma teknolojileri ile ideal hava kalitesini koruyun.',
      dehumidifierCapacityValue: '35L/Gün',
      dehumidifierCapacityLabel: 'Kapasite',
      dehumidifierNoiseValue: '42dB',
      dehumidifierNoiseLabel: 'Sessiz Operasyon',
      modelsSuffix: 'Modelleri',
      filterAll: 'Tüm Modeller',
      venthubSolution: 'VentHub Çözümü',
    },
    series: {
      technicalFamily: 'Teknik Ürün Ailesi',
      heroDefaultDesc: 'Profesyonel havalandırma çözümlerini teknik serilerine göre inceleyin.',
      seriesDetail: 'Seri Detayı',
      requestQuote: 'Teklif Alın',
      colModel: 'Model',
      colPrice: 'Fiyat',
      colAction: 'İşlem',
      skuLabel: 'SKU: {{sku}}',
      trust1Title: 'Teknik Performans',
      trust1Desc: 'Tüm veriler fabrikasyon test raporlarıyla %100 doğrulanmıştır.',
      trust2Title: 'Hassas Mühendislik',
      trust2Desc: 'Projeniz için en doğru hava debisi ve basınç eşleşmesi.',
      trust3Title: 'Uzman Desteği',
      trust3Desc: 'Mühendislerimizden anlık teknik döküman ve seçim desteği.',
    },
    loading: 'Kategoriler hazırlanıyor...',
    notFound: 'Kategori bulunamadı',
    backHome: 'Ana Sayfaya Dön',
    breadcrumbHome: 'Ana Sayfa',
    premiumCollection: 'Premium Koleksiyon',
    findModel: 'Bana Uygun Modeli Bul',
    productCount: 'Ürün Sayısı',
    showcase: {
      defaultDescription: 'Yüksek performanslı, akıllı ve sürdürülebilir havalandırma sistemlerinin teknik otoritesi.',
      // REC-113: TR yüzeyde EN sızıntısıydı. Aynı sözlükte zaten 'Premium Kalite'
      // örneği var — 'Premium' Türkçede yerleşik, çevrilen kısım geri kalanı.
      premiumTitle: 'Premium Mühendislik Çözümleri',
      catalog: 'Kategori Katalogu',
      subGroups: 'Alt Ürün Grupları',
      exploreSeries: 'Serileri İncele',
      guarantee: 'VentHub Güvencesi',
      discover: 'Keşfet',
      whyVenthubTitle: 'Neden VentHub Mühendisliği?',
      premiumEngineeringAlt: 'Premium Mühendislik Görseli',
      features: [
        { title: 'Endüstriyel Sertifikasyon', desc: 'Uluslararası testlerden geçmiş, tam onaylı sistemler.' },
        { title: 'Yüksek Performans', desc: 'Aerodinamik tasarım ile maksimum verimlilik ve düşük enerji tüketimi.' },
        { title: 'Akıllı Kontrol', desc: 'BMS ve merkezi otomasyon sistemleriyle kusursuz entegrasyon.' }
      ]
    },
    discoverMore: 'Devamını Keşfet',
    whichAirCurtain: 'Hangi Hava Perdesini Seçmelisiniz?',
    airCurtainHelper: 'İhtiyacınıza en uygun çözümü belirlemenize yardımcı olalım.',
    ambientAir: 'Ortam Havası (Isıtıcısız)',
    ambientAirDesc: 'İç ve dış ortam sıcaklık farkının az olduğu bölgeler veya sadece hava izolasyonu gereken durumlar için idealdir.',
    electricHeated: 'Elektrikli Isıtıcılı',
    electricHeatedDesc: 'Kış aylarında dışarıdan gelen soğuk havayı kırarken, içeriye sıcak hava üfleyerek konforu artırır.',
    ambientPoint1: 'Minimum enerji tüketimi sağlar.',
    ambientPoint2: 'Soğuk hava depoları için en doğru tercihtir.',
    ambientPoint3: 'Yazın serin, kışın ılık bölgelerde kullanılır.',
    electricPoint1: 'Giriş kapısında "Sıcak Karşılama" etkisi yaratır.',
    electricPoint2: 'Ek ısıtma kaynağı olarak mekana destek olur.',
    electricPoint3: 'AVM, Mağaza ve Restoran girişleri için önerilir.',
    inspectModels: 'Modelleri İncele',
    modernLiving: 'Modern Yaşam Alanları',
    modernLivingDesc: 'Minimalist tasarım ve fısıltı sessizliğinde konfor.',
    flexibilityEsthetics: 'Esneklik ve Estetik',
    smartControl: 'Akıllı Kontrol',
    smartControlDesc: 'Hava kalitesine göre otomatik hız ayarı ile kesintisiz taze hava.',
    longTermInvestment: 'Uzun Ömürlü Yatırım',
    longTermInvestmentDesc: 'Bakım gerektirmeyen motor teknolojisi ve dayanıklı polimer gövde.',
    allSeries: 'Tüm Seriler',
    chooseSeriesDesc: 'İhtiyacınıza uygun seriyi seçin',
    inspectSeries: 'Seriyi İncele',
    whyCategory: 'Neden {{category}}?',
    electricVsAmbientAlt: 'Elektrikli vs Ortam Havalı Karşılaştırma',
    modernLoftAlt: 'Modern Loft Uygulaması',
    lineoQuietQuote: 'Lineo Quiet ES, sadece bir fan değil; modern mimarinin sessiz kahramanıdır.',
    industrialLabAlt: 'Endüstriyel Laboratuvar Uygulaması',
    lineoTechnicalAlt: 'Linieo Quiet Teknik Detay',
    lineoNeonAlt: 'Lineo Quiet Neon Mühendislik Tasarımı',
    vorticeHeritageAlt: 'Vortice Lineo Marka Mirası ve Geçmişi',
    airCurtainDiagramAlt: 'Hava Perdesi Çalışma Prensibi',
    whyCategorySubtitle: 'Endüstriyel standartlarda üretim ve yüksek mühendislik çözümleriyle projelerinize değer katıyoruz.',
    lineoTechnologyTitle: 'Vortice Lineo Quiet ES Teknolojisi',
    howItWorksTitle: 'Nasıl Çalışır?',
    lineoTechnologyDesc: 'Sessizlik ve performansın mükemmel uyumu. Gelişmiş aerodinamik tasarım ile tanışın.',
    howItWorksDesc: 'Hava perdesi, görünmez bir bariyer oluşturarak iç ve dış ortamı birbirinden ayırır.',
    why1Title: 'Yüksek Verimlilik',
    why1Desc: 'ErP standartlarına uygun enerji tasarrufu sağlayan motor teknolojisi.',
    why2Title: 'Sessiz Çalışma',
    why2Desc: 'Özel akustik izolasyon ve aerodinamik fan tasarımı.',
    why3Title: 'Uzun Ömür',
    why3Desc: 'Korozyona dayanıklı gövde ve ağır hizmet tipi bileşenler.',
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
      subtitle: 'Basit ama etkili bir prensip: Görünmez hava duvarı',
      diagramAlt: 'Hava Perdesi Çalışma Prensibi',
      steps: [
        {
          title: 'Güçlü Hava Akışı',
          description: 'Cihaz, yüksek hızda kontrollü bir hava akışı oluşturur.',
          detail: 'Özel tasarımlı fan ve kanatlar sayesinde düzgün ve güçlü bir hava akımı sağlanır.'
        },
        {
          title: 'Görünmez Bariyer',
          description: 'Hava akışı, kapı açıklığında görünmez bir perde oluşturur.',
          detail: 'Bu hava perdesi, iç ve dış ortamı fiziksel bir engel olmadan birbirinden ayırır.'
        },
        {
          title: 'İzolasyon',
          description: 'Dış hava, toz, böcek ve koku içeri giremez.',
          detail: 'İç ortam sıcaklığı korunur, hijyen standartları sağlanır.'
        },
        {
          title: 'Konfor',
          description: 'Müşteriler ve çalışanlar için ideal ortam sağlanır.',
          detail: 'Kapı açık kalsa bile iç mekan konforu bozulmaz.'
        }
      ]
    },
    vorticeBrand: {
      compassoDoro: 'Compasso d\'Oro',
      italianEngineering: 'İtalyan Mühendisliği',
      whyVortice: 'Neden Vortice?',
      description1: '1954 yılında Milano\'da kurulan Vortice, 70 yılı aşkın süredir dünya genelinde havalandırma teknolojisinin öncüsü olmuştur.',
      description2: 'Attilio Pagani tarafından kurulan şirket, ilk ürünüyle İtalya\'nın en prestijli tasarım ödülü Compasso d\'Oro\'yu kazanmıştır. Bugün 90\'dan fazla ülkede milyonlarca kullanıcıya hizmet vermektedir.',
      authorizedDealer: 'Marka Güvencesi',
      ceCertified: 'CE Sertifikalı',
      // REC-104 ikinci tur: "2 Yıl Garanti" rakamı Recep hükmüyle kalkmıştı ama YALNIZ
      // güven şeridinden kaldırılmıştı; AYNI SAYFADAKI bu Vortice rozeti gözden kaçtı ve
      // canlıda ölçülünce görüldü. Kendi destek sayfamız "garanti kapsamı üretici/
      // ithalatçıya göre değişebilir" diyor — sabit süre vaat edilemez.
      // Anahtar adı `warranty2y` yanıltıcı hale geldiği için `warranty` oldu.
      warranty: 'Üretici Garantisi',
      premiumComfort: 'Premium Konfor',
      authorizedDealerNotice: 'VentHub, Vortice ürünlerini marka güvencesiyle sunar.',
      highlights: [
        {
          value: '70+',
          label: 'Yıl Deneyim',
          desc: '1954\'ten beri havalandırma'
        },
        {
          value: '90+',
          label: 'Ülke',
          desc: 'Global dağıtım ağı'
        },
        {
          value: '3x',
          label: 'Compasso d\'Oro',
          desc: 'İtalya\'nın en prestijli tasarım ödülü'
        },
        {
          value: '#1',
          label: 'Avrupa',
          desc: 'Havalandırma sektöründe lider'
        }
      ]
    }
  },
  pdp: {
    // Teknik ozellik ALAN adlari — specLabel.ts 'pdp.specs.<anahtar>' yolunu arar.
    // Kaynak: canli DB technical_specs anahtarlari (2026-08-22, 73 tekil anahtar).
    // Birim etikete GIRMEZ — deger tarafi formatSpecValue ile birimi kendi ekler.
    // TEK ISTISNA: max_delivery_m3h / max_delivery_ls ayni 180 uründe BIRLIKTE bulunur;
    // birim yazilmazsa iki satir ayni etiketle farkli sayi gosterir ve celiskili okunur.
    specs: {
      absorbed_current_a: 'Çekilen Akım',
      airflow_speed_max_ms: '2. Kademe Hava Hızı',
      airflow_speed_min_ms: '1. Kademe Hava Hızı',
      atex_marking: 'ATEX İşareti',
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
      max_static_pressure_pa: 'Maksimum Statik Basınç',
      max_voltage_v: 'Maksimum Voltaj',
      min_delivery_m3h: 'Minimum Debi',
      min_static_pressure_pa: 'Minimum Statik Basınç',
      min_voltage_v: 'Minimum Voltaj',
      motor_poles: 'Motor Kutup Sayısı',
      motor_type: 'Motor Tipi',
      noise_level_db_a: 'Ses Seviyesi',
      noise_lpa_3m_db: 'Ses Basıncı (3 m)',
      nominal_delivery_m3h: 'Nominal Debi',
      nominal_static_pressure_pa: 'Nominal Statik Basınç',
      number_of_blades: 'Kanat Sayısı',
      number_of_speeds: 'Hız Kademesi Sayısı',
      operating_temperature_c: 'Çalışma Sıcaklığı',
      optional_heater_power_w: 'Opsiyonel Isıtıcı Gücü',
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
    inStock: 'Stokta Var',
    outOfStock: 'Stokta Yok',
    vatIncluded: '(KDV Dahil)',
    vatExcluded: '(+KDV)',
    qty: 'Adet:',
    addToCart: 'Sepete Ekle',
    techQuote: 'Teknik Teklif İste',
    descFallback: 'Bu ürün için detaylı açıklama yakında eklenecektir.',
    relatedProducts: 'İlgili Ürünler',
    officialDistributor: 'MARKA GÜVENCESİ',
    priceAvailability: 'Fiyat & Stok',
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
      technicalDatasheet: 'TEKNİK VERİ SAYFASI',
      engineeringAnalysis: 'Mühendislik Analizi',
      sku: 'SKU',
      datasheetPdf: 'TEKNİK DÖKÜMAN (PDF)'
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
      warranty: 'Üretici Garantisi'
    },
    engineering: {
      noise: {
        ultraQuiet: {
          label: 'Ultra Sessiz Çalışma',
          desc: 'Akustik hassasiyeti yüksek yaşam ve çalışma alanları için tasarlanmış fısıltı sessizliğinde performans.'
        },
        officeComfort: {
          label: 'Ofis Konfor Seviyesi',
          desc: 'Ofis, kütüphane ve çalışma odaları için uygun düşük ses seviyesi.'
        },
        standard: {
          label: 'Standart Ses Seviyesi',
          desc: 'Standart konfor alanları ve ticari mekanlar için kabul edilebilir ses seviyesi.'
        },
        industrial: {
          label: 'Endüstriyel Ses Seviyesi',
          desc: 'Endüstriyel tesislerde yüksek kapasiteli havalandırma için tasarlanmış ses seviyesi.'
        }
      },
      efficiency: {
        diamond: {
          label: 'Elmas Enerji Verimliliği',
          desc: 'Enerji tüketimini minimuma indiren maksimum ısıl verimlilik.'
        },
        platinum: {
          label: 'Platin Enerji Verimliliği',
          desc: 'Önemli ölçüde enerji tasarrufu sağlayan yüksek ısıl geri kazanım oranı.'
        },
        gold: {
          label: 'Altın Enerji Verimliliği',
          desc: 'Modern HVAC tasarımları için standartlara uygun enerji geri kazanım verimliliği.'
        }
      },
      motor: {
        ec: {
          label: 'EC Motor Teknolojisi',
          desc: 'Düşük enerji tüketimi ve hassas hız kontrolü sağlayan fırçasız motor tasarımı.'
        },
        ac: {
          label: 'AC Motor Teknolojisi',
          desc: 'Dayanıklı ve güvenilir klasik AC motor teknolojisi.'
        }
      },
      capacity: {
        highFlow: {
          label: 'Yüksek Hava Debisi',
          desc: 'Orta ve büyük ölçekli konut ve ticari alanlar için ideal performans.'
        },
        industrialFlow: {
          label: 'Endüstriyel Hava Debisi',
          desc: 'Büyük endüstriyel tesisler ve depolar için tasarlanmış yüksek kapasiteli hava akışı.'
        }
      }
    }
  },
  quickView: {
    title: 'Hızlı Bakış',
    close: 'Kapat',
    addToCart: 'Sepete Ekle',
    viewProduct: 'Ürünü Gör',
    descFallback: 'Ürün açıklaması yakında eklenecektir.'
  },
  support: {
    contactCta: {
      title: 'Aradığınız cevabı bulamadınız mı?',
      subtitle: 'WhatsApp üzerinden direkt bizimle iletişime geçin, size yardımcı olalım.',
      button: 'WhatsApp\'tan Sorun',
    },
    links: {
      faq: 'SSS',
      returns: 'İade ve Değişim',
      shipping: 'Kargo ve Teslimat',
      warranty: 'Garanti ve Servis'
    },
    home: {
      subtitle: 'İhtiyacınız olan bilgilere hızlıca ulaşın.',
      warrantyDesc: 'Garanti kapsamı ve yetkili servis bilgileri',
    },
    returns: {
      title: 'İade ve Değişim',
      // REC-104: koşullar yasal metin, kalıyor; ama çevrimiçi satış kapalıyken
      // hangi durumda geçerli olduklarını sayfanın kendisi söylemeli.
      onlineKapaliNotu: 'Online satış şu an kapalıdır; aşağıdaki koşullar online satış açıldığında geçerlidir.',
      desc1: '14 gün içinde cayma hakkınızı kullanabilirsiniz. Ürün kullanılmamış, faturası ve tüm aksesuarlarıyla birlikte yeniden satılabilir durumda olmalıdır.',
      desc2: 'İade talebi için lütfen sipariş numaranızla birlikte destek ekibimize ulaşın. Onay sonrası kargo talimatları paylaşılacaktır.'
    },
    shipping: {
      desc1: 'Teslimat süresi genellikle 1–5 iş günüdür; kampanya ve stok durumuna göre değişebilir.',
      // REC-104: "ödeme adımında gösterilir" cümlesi var olmayan bir adıma atıf yapıyordu
      // (çevrimiçi ödeme kapalı). Bilgi teklifte veriliyor.
      desc2: 'Kargo ücreti ve firması teklifinizde belirtilir. Takip numarası e-posta ile iletilir.'
    },
    warranty: {
      desc1: 'Garanti kapsamı üretici/ithalatçı firmaya göre değişiklik gösterebilir. Lütfen garanti belgesi ve kullanım kılavuzunu saklayınız.',
      desc2: 'Servis bilgisi veya arıza kaydı için destek ekibimizle iletişime geçin.'
    },
    faq: {
      // REC-104: q1/a1 ve a2 çevrimiçi ödeme varmış gibi yazılmıştı. Metinler
      // checkout.kapali bloğuyla AYNI gerçeği söyleyecek şekilde hizalandı
      // ("aynı gün dönüş" vaadi oradan alındı, yeni vaat üretilmedi).
      q1: 'Teklif talebime ne zaman dönüş yapılır?',
      a1: 'Genellikle aynı iş günü içinde dönüş yapıyoruz.',
      q2: 'Ödeme yöntemleri nelerdir?',
      a2: 'Mağazamız kuruluş aşamasında olduğu için çevrimiçi ödeme henüz açık değil. Sipariş için bizden teklif isteyebilirsiniz.',
      q3: 'Kurulum hizmeti veriyor musunuz?',
      a3: 'Ürüne göre değişiklik gösterebilir. Lütfen destek ekibimizle görüşün.'
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
      expressDetail: 'Ekspres (1–2 iş günü)',
      standardDetail: 'Standart (3–5 iş günü)',
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
      orderNoSuffix: ': #{{code}}',
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
      needHelpDesc: 'Sipariş, iade veya bakiye konularında anında yardım alın.',
      customerService: 'Müşteri Hizmetleri',
      wave: '👋',
      orderHash: '#{{code}}',
      shipStatus: {
        delivered: 'Teslim Edildi',
        shipped: 'Kargoda',
        preparing: 'Hazırlanıyor'
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
      orderLabel: 'Sipariş #',
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
    /** Sipariş anındaki SKU (snapshot) — katalogtaki güncel SKU değil. */
    skuLabel: 'SKU: {{sku}}',
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
    subtitle: 'Teklif taleplerinizi oluşturun ve fiyatlama sürecini takip edin.',
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
      contactRequired: 'Ad soyad ve telefon zorunludur — teklif belgesinde muhatap yazmalıdır',
      note: 'Not (opsiyonel)',
      notePh: 'Projeniz/ihtiyacınız hakkında kısa not (opsiyonel)',
      submit: 'Teklif Talebi Gönder',
      cancel: 'Vazgeç',
      loginRequired: 'Teklif istemek için giriş yapmalısınız',
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
      awaitingPricing: 'Fiyatlama bekleniyor — ekibimiz talebinizi inceliyor.',
      accept: 'Teklifi Kabul Et',
      reject: 'Teklifi Reddet',
      acceptConfirm: 'Teklifi kabul etmek istediğinize emin misiniz?',
      rejectConfirm: 'Teklifi reddetmek istediğinize emin misiniz?',
      decisionSuccess: 'Kararınız kaydedildi',
      decisionError: 'Karar kaydedilemedi',
      acceptedNext: 'Teklifi kabul ettiniz. Ekibimiz sipariş adımları için sizinle iletişime geçecek.',
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
        priceRequired: 'Teklif göndermeden önce tüm kalemlere fiyat girin'
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
      title: 'Projeleriniz İçin\nProfesyonel Çözümler',
      description: 'Endüstriyel havalandırma ihtiyaçlarınız için rekabetçi fiyatlarla özel teklif alın. Mühendislik destek ekibimiz hızlıca size dönecektir.',
      feature1: 'Ücretsiz Projelendirme Desteği',
      feature2: 'Hızlı Fiyatlandırma ve Stok Bilgisi',
      feature3: 'B2B\'ye Özel Avantajlı Koşullar'
    },
    success: {
      title: 'Talebiniz Alındı!',
      description: 'Teklif talebiniz mühendislik ekibimize başarıyla ulaştı. Sizinle en kısa sürede iletişime geçeceğiz.'
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
  calculators: {
    recommendations: 'Öneriler',
    stepIndicator: {
      progress: 'Adım {{current}} / {{total}}',
    },
    layout: {
      backLabel: 'Ürünlere Dön',
      disclaimer: 'Bu hesap makinesi ön boyutlandırma amaçlıdır. Kesin proje hesapları için bir HVAC mühendisine danışın.',
      contactPrompt: 'Teknik sorularınız için',
      contactLink: 'iletişime geçin',
    },
    airCurtain: {
      trafficLowDesc: '< 50 geçiş/saat',
      trafficMediumDesc: '50-200 geçiş/saat',
      trafficHighDesc: '> 200 geçiş/saat',
      newCalculation: 'Yeni Hesaplama',
      calculate: 'Hesapla',
      title: 'Hava Perdesi Hesaplayıcı',
      description: 'Kapı ölçüleri ve kullanım koşullarına göre ideal hava perdesi seçimi',
      infoText: 'Bu araç mühendislik standartlarına (ISO 27327-1) uygun ön boyutlandırma yapar. Gerekli hava debisi, üfleme hızı ve motor gücü değerlerini hesaplar.',
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
          label: 'Konfor / Enerji',
          desc: 'Genel ticari alanlar, mağazalar',
          info: 'Genel ticari alanlar için enerji tasarrufu sağlar. Nozul hızı: 8-12 m/s'
        },
        insect: {
          label: 'Sinek Kontrolü',
          desc: 'Gıda işletmeleri, restoranlar',
          info: 'Gıda işletmeleri ve restoranlar için sinek girişini engeller. Nozul hızı: 12-15 m/s'
        },
        coldRoom: {
          label: 'Soğuk Oda',
          desc: 'Soğuk depolar, buzhane',
          info: 'Soğuk hava depolarında ısı kaybını minimize eder. Nozul hızı: 15-18 m/s'
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
        efficiencyOptimalDesc: 'Hesaplanan parametreler ideal performans sağlayacaktır',
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
      infoText: 'Debi ve kanal ölçülerinize göre hava hızını ve tahmini basınç kaybını hesaplar.',
      form: {
        shape: 'Kanal Tipi',
        round: 'Yuvarlak',
        roundDesc: 'Spiral veya kaynaklı boru',
        rectangular: 'Dikdörtgen',
        rectangularDesc: 'Köşeli kanal',
        material: 'Malzeme',
        steel: 'Galvaniz Saç',
        pvc: 'PVC',
        flex: 'Flex Kanal',
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
      infoText: 'Isı geri kazanım cihazlarının (IGK) veya entalpi geri kazanım cihazlarının (ERV) yıllık enerji tasarruf potansiyelini hesaplar.',
      form: {
        type: 'Cihaz Tipi',
        hrv: 'HRV (Isı Geri Kazanım)',
        hrvDesc: 'Sadece duyulur ısı',
        erv: 'ERV (Enerji Geri Kazanım)',
        ervDesc: 'Isı + Nem geri kazanımı',
        climate: 'İklim Bölgesi',
        cold: 'Soğuk',
        temperate: 'Ilıman',
        hot: 'Sıcak',
        usage: 'Mahal Tipi',
        office: 'Ofis',
        commercial: 'Ticari',
        occupancy: 'Kişi Sayısı',
        workingHours: 'Günlük Çalışma',
        electricityPrice: 'Elektrik Birim Fiyatı',
        sensibleEfficiency: 'Duyulur Verim',
        latentEfficiency: 'Gizli Verim',
        area: 'Alan (m²)'
      },
      results: {
        heatingGain: 'Isıtma Kazancı',
        coolingGain: 'Soğutma Kazancı',
        co2Reduction: 'CO₂ Azaltımı',
        co2Desc: 'Yıllık karbon salınım düşüşü',
        payback: 'Geri Ödeme Süresi',
        paybackDesc: 'Tahmini yatırım geri dönüşü'
      }
    },
    jetFan: {
      pageTitle: 'Jet Fan Hesap Makinesi',
      pageDescription: 'Otopark ve tünel jet fan itki ve havalandırma hesabı',
      pageInfoText: 'Kapalı otopark veya tünellerde gerekli jet fan sayısı, itki kuvveti ve havalandırma debisini hesaplar. NFPA 502 ve BS 7346 standartlarına uygun.',
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
      achParkingHint: 'Otopark: 6-10 ACH önerilen',
      achTunnelHint: 'Tünel: 15+ ACH önerilen',
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
      withoutMark: '✕',
      withMark: '✓',
      eyebrow: 'SES VE KONFOR',
      title: 'Huzurunuzu Bozan Seslere Son Verin',
      subtitle: 'Standart kanal fanları sadece havayı değil, gürültüyü de yaşam alanlarınıza taşır. Vortice Lineo Quiet ile sessizliğin yeni standardını keşfedin.',
      painPoints: [
        {
          title: 'Akustik Kirlilik',
          description: 'Konvansiyonel fanların yarattığı uğultu, odaklanmayı zorlaştırır ve konforu düşürür.'
        },
        {
          title: 'Düşük Verimlilik',
          description: 'Gürültülü fanlar genellikle aerodinamik olarak verimsizdir ve daha fazla enerji harcar.'
        },
        {
          title: 'Titreşim Sorunları',
          description: 'İzole edilmemiş cihazlar montaj yüzeylerinde titreşim ve ikincil gürültüye sebep olur.'
        },
        {
          title: 'Bölünen Odak',
          description: 'Sürekli gürültü, kütüphane ve ofislerde verimliliği %20 oranında düşürebilir.'
        }
      ],
      visual: {
        without: 'Standart Fan İle',
        with: 'Lineo Quiet İle',
        withoutPoints: ['Yüksek desibel seviyeleri', 'Mekanik titreşim', 'Türbülanslı hava akışı', 'Enerji kaybı'],
        withPoints: ['Fısıltı düzeyinde sessizlik', '%60 enerji tasarrufu', 'Laminar hava akışı', 'Titreşimsiz çalışma']
      }
    },
    howItWorks: {
      eyebrow: 'TEKNOLOJİ',
      title: 'Sessiz Gücün Arkasındaki Mühendislik',
      subtitle: 'Vortice Lineo Quiet, aerodinamik olarak optimize edilmiş gövdesi ve ses emici katmanları ile fısıltı seviyesinde performans sunar.',
      steps: [
        {
          title: 'Ses Emici Gövde',
          description: 'Özel kompozit dış gövde, motor sesini içeride hapseder.'
        },
        {
          title: 'Laminar Akış',
          description: 'Hava yönlendirici kanatlar türbülansı azaltır ve sesi kaynağında keser.'
        },
        {
          title: 'Dinamik Balans',
          description: 'Yüksek hassasiyetli fan pervanesi, titreşimsiz ve sessiz bir sirkülasyon sağlar.'
        }
      ]
    },
    comparison: {
      standardLabel: 'Standart:',
      // REC-113: karşılığı 'Standart:' olan ETİKET; İngilizce kalması tabloyu iki dilli
      // gösteriyordu. Ürün hattı adı ('Vortice Lineo Quiet') AYNEN kalır — çevrilen şey
      // etiket, özel ad değil.
      quietLabel: 'Sessiz:',
      title: 'Neden Lineo Quiet?',
      standard: 'Standart Fanlar',
      quiet: 'Vortice Lineo Quiet',
      features: [
        {
          label: 'Ses Seviyesi',
          standard: '55-65 dB(A)',
          quiet: '25-30 dB(A)'
        },
        {
          label: 'Enerji Tüketimi',
          standard: 'Yüksek (AC Motor)',
          quiet: '%60 Tasarruf (ES/EC Motor)'
        },
        {
          label: 'Hava Kalitesi',
          standard: 'Türbülanslı Akış',
          quiet: 'Laminar ve Sürekli'
        },
        {
          label: 'Montaj',
          standard: 'Karmaşık ve Sert',
          quiet: 'Hızlı ve Titreşim İzole'
        }
      ]
    },
    faq: {
      title: 'Sıkça Sorulan Sorular',
      items: [
        {
          q: 'Gerçekten ne kadar sessiz?',
          a: 'Lineo Quiet, düşük hızda fısıltı sesine (yaklaşık 25 dB) yakındır. Bu, normal bir konuşmanın yarısından daha azdır.'
        },
        {
          q: 'Montajı zor mu?',
          a: 'Hayır, hızlı montaj kelepçeleri sayesinde bakım veya kurulum için cihazı kanaldan ayırmanız gerekmez.'
        },
        {
          q: 'Hangi alanlar için uygundur?',
          a: 'Kütüphaneler, ofisler, yatak odaları ve otel odaları gibi sessizliğin kritik olduğu her yer için idealdir.'
        }
      ]
    },
    brand: {
      eyebrow: 'MÜHENDİSLİK MİRASI',
      title: 'İtalyan Sessizliği: Vortice Efsanesi',
      description: '1954\'ten beri havalandırma dünyasına yön veren Vortice, Lineo Quiet serisi ile sessiz kanal fanı kategorisinde zirveyi temsil ediyor.',
      badges: ['Marka Güvencesi', '2 Yıl Üretici Garantisi'],
      stats: [
        {
          label: 'Yıllık Deneyim',
          value: '70+'
        },
        {
          label: 'Ülke',
          value: '90+'
        },
        {
          label: 'Compasso d\'Oro',
          value: '3x'
        },
        {
          label: 'Avrupa',
          value: '#1'
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
    resultNeed: 'Odanız yaklaşık {hacim} m³ — bu mahal için saatte {debi} m³ hava taşınması gerekiyor.',
    badgeBest: 'En uygun',
    badgeQuietest: 'En sessiz',
    badgeEfficient: 'En verimli',
    cardDelivers: 'Sizin kanalınızda',
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
      kitchen: 'Yağ buharı için en yüksek debi',
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
      galvanized: 'En yaygın; düşük sürtünme',
      pvc: 'En düşük sürtünme',
      flex: 'Kolay montaj ama sürtünme çok yüksek',
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
    coldStorage: 'Soğuk Hava Deposu',
    coldStorageDesc: 'Soğuk zincir koruması',
    industrial: 'Endüstriyel Tesis',
    retail: 'Market / Süpermarket',
    retailDesc: 'Soğutucu reyonlar',
    retailTip: 'Soğutucu reyonlardan sıcak havayı uzak tutar',
    step1Title: 'Kullanım alanı neresi?',
    step1Desc: 'Size en uygun teknik özellikleri belirlemek için önce uygulama alanını seçin.',
    step2Title: 'Kapı ölçülerini girin',
    step2Desc: 'Hava perdesinin tüm açıklığı kapatması kritik önemdedir.',
    widthMeter: 'Genişlik (Metre)',
    heightMeter: 'Yükseklik (Metre)',
    step3Title: 'Isıtıcı ihtiyacı var mı?',
    heatingYesDesc: 'Kışın konfor için',
    heatingNoDesc: 'Sadece hava bariyeri',
    notSure: 'Emin Değilim',
    consultUs: 'Bize danışın',
    step6Title: 'Size En Uygun Modeller',
    step6Desc: 'Mühendislik kriterlerine göre filtrelenmiş öneriler.',
    analyzing: 'Modeller Analiz Ediliyor...',
    matchScore: '% {{score}} Uyum',
    restart: 'Yeniden Başla',
    customOffer: 'Özel Teklif İste',
    entranceDoor: 'Giriş Kapısı',
    next: 'Devam Et',
    entranceDesc: 'Mağaza, restoran, otel girişi',
    entranceTip: 'Müşteri konforunu artırır, enerji kaybını önler',
    start: 'Başla',
    close: 'Kapat',
    insulation: 'İzolasyon ve tasarruf için',
    centralSystem: 'Merkezi sistem varsa',
    goBack: 'Geri Dön',
    findSuitable: 'Bana Uygun Olanı Bul',
    threeSteps: '3 adımda size özel ürün önerisi',
    wizardTitle: 'İhtiyaç Analizi Sihirbazı',
    doorHeight: 'Kapı Yüksekliğiniz Nedir?',
    meter: 'Metre',
    heatingNeed: 'Isıtma İhtiyacı Var mı?',
    electricHeater: 'Elektrikli Isıtıcı',
    winterComfort: 'Kış konforu için',
    ambient: 'Isıtıcısız (Ortam)',
    waterHeater: 'Sıcak Su Bataryalı',
    mountType: 'Montaj Tipi Nasıl Olmalı?',
    standardMount: 'Standart (Duvar/Tavan Asılı)',
    recessedMount: 'Ankastre (Asma Tavan İçi)',
    step: 'Adım'
  },
  product3d: {
    loadError: '3D Model Yüklenemedi',
    back: 'GERİ',
    view: 'GÖRÜNÜM',
    reset: 'RESET',
    orbit: 'ORBİT',
    free: 'FREE',
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
    button: 'Teklif Al / Uzman Desteği',
    subtitle: 'Bize kısa bilgi verin, doğru çözümü birlikte şekillendirelim.',
    title: 'Projeniz Hakkında Konuşalım'
  },
  homeProcess: {
    stepPrefix: 'Adım',
    steps: {
      analysis: {
        desc: 'Hava debisi, basınç, akustik, enerji verimliliği ve yönetmelikleri inceliyoruz.',
        title: 'Analiz & Hesaplama'
      },
      implementation: {
        desc: 'Kurulum kılavuzları, devreye alma ve teknik destek ile süreci kolaylaştırıyoruz.',
        title: 'Uygulama Desteği'
      },
      need: {
        desc: 'Kısa bir telefon görüşmesi veya form aracılığıyla kullanım amacını netleştiriyoruz.',
        title: 'İhtiyaçlarınızı Anlamak'
      },
      proposal: {
        desc: 'Uygun ürün ailelerini, alternatifleri ve temin sürelerini öneriyoruz.',
        title: 'Çözüm / Teklif'
      },
      support: {
        desc: 'Sürdürülebilirlik için satış sonrası eğitim, yedek parça ve servis ağı sunuyoruz.',
        title: 'Satış Sonrası Destek'
      }
    },
    subtitle: 'Başlangıçtan teslimata kadar şeffaf ve öngörülebilir bir süreç',
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
    description: 'Projenizin detaylarını uzman mühendislerimizle paylaşın. Hava debisi, basınç kayıpları ve yönetmeliklere uygun en doğru fan seçimini sizin için yapalım.',
    buttonText: 'Uzman Desteği Alın'
  }
};
