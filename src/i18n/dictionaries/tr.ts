export const tr = {
  common: {
    loadingApp: 'VentHub yükleniyor... ',
    // Navigation & generic
    categories: "Kategoriler",
    products: "Ürünler",
    brands: "Markalar",
    about: "Hakkımızda",
    contact: "İletişim",
    supportCenter: "Destek Merkezi",
    knowledgeHub: "Bilgi Merkezi",
    myOrders: "Siparişlerim",
    signOut: "Çıkış Yap",
    signIn: "Giriş Yap",
    signUp: "Kayıt Ol",
    skipToContent: "Ana içeriğe geç",
    searchHeaderPlaceholder: "Ürün, marka veya model ara...",
    search: "Ara",
    quickSearch: "Hızlı ara...",

    // Existing
    discover: "Keşfet",
    allProducts: "Tüm Ürünler",
    exploreProducts: "Ürünleri Keşfet",
    getQuote: "Teklif Al",
    byApplication: "Uygulamaya Göre Çözümler",
    viewAll: "Tümü",
    featured: "Öne Çıkan Ürünler",
    newProducts: "Yeni Ürünler",
    whyUs: "Neden VentHub?",
    home: "Ana Sayfa",
    discoverPage: "Keşfet",
    notFound: "Sonuç bulunamadı",
    clearSearch: "Aramayı Temizle",
    searchPlaceholder: "Ürün adı, marka...",
    searchPlaceholderLong: "Ürün adı, marka, model...",
    selectByNeed: "İhtiyacına Göre Seç",
    seeAllProducts: "Tüm Ürünleri Gör",
    backToTop: "Başa dön",
    gotoCategory: "Kategoriye git",
    cancel: "İptal",
  },
  resources: {
    title: 'Kaynaklar ve Kılavuzlar',
    allGuides: 'Tüm kılavuzlar',
    teaser: 'Hızlı başlangıç için pratik ipuçları',
    items: {
      jetFan: 'Otopark Jet Fan seçimi',
      airCurtain: 'Hava perdesi seçimi',
      hrv: 'Isı geri kazanım (HRV) rehberi'
    }
  },
  knowledge: {
    hub: {
      title: 'Bilgi ve Kılavuz Merkezi',
      subtitle: 'Doğru ürüne rahatça ulaşmanız için konu bazlı rehberler, (yakında) hesaplayıcılar ve seçim sihirbazı.',
      searchPlaceholder: 'Konu ara…',
      readMore: 'Devamını oku',
      calculatorsSoon: 'Hesaplayıcılar (Yakında)',
      calculatorsSoonDesc: 'HRV debi, jet fan kapsama, hava perdesi hız/debi ve kanal basınç kaybı.',
      selectorSoon: 'Ürün Seçici (Yakında)',
      selectorSoonDesc: '4–6 soruda ihtiyacınıza uygun ürün listesini oluşturun.'
    },
    tags: {
      all: 'Tümü',
      havaPerdesi: 'Hava Perdesi',
      jetFan: 'Jet Fan',
      hrv: 'HRV/ERV'
    },
    topic: {
      notFoundTitle: 'Bilgi bulunamadı',
      notFoundDesc: 'Aradığınız konu henüz eklenmemiş olabilir.',
      backToHub: 'Merkeze dön',
      stepsTitle: '3 adımda seçim',
      pitfallsTitle: 'Sık hatalar',
      toProducts: 'İlgili ürünlere git',
      getQuote: 'Teklif Al'
    },
    topics: {
      'hava-perdesi': {
        title: 'Hava Perdesi',
        summary: 'Girişlerde konforu korumak ve enerji kaybını azaltmak için kapı üstüne yerleştirilir; kapı genişliğini tam kapsamalıdır.',
        steps: [
          'Kapı genişliği = cihaz genişliği (bariyer kesintisiz olmalı).',
          'Çıkış hızı 7–9 m/s; zeminde 2–3 m/s hedef.',
          'Nozül 10–15° iç mekâna eğimli; kapı kontağı ile otomatik hız.'
        ],
        pitfalls: ['Kısa cihaz kullanımı', 'Çok düşük hız', 'Nozülü dışa doğru eğmek']
      },
      'jet-fan': {
        title: 'Jet Fan (Otopark)',
        summary: 'CO/NOx ve duman senaryosu için akışı egzoza yönlendiren tavan fanları; kör nokta bırakmadan yerleşim gerekir.',
        steps: [
          'Debi: Hacim × ACH (ör. 7.200 m³ × 8 ACH ≈ 57.600 m³/h).',
          'İtme kuvveti 50–100 N tipik; mesafe ve plana göre belirlenir.',
          'Yerleşim: eksen aralığı 25–35 m; egzoza sürükleme; sensör zonları kapsansın.'
        ],
        pitfalls: ['Kör hacim bırakmak', 'Sensör kapsamasını atlamak']
      },
      hrv: {
        title: 'Isı Geri Kazanım (HRV/ERV)',
        summary: 'Taze havayı ısı geri kazanımı ile sağlayan cihazlar; seçimde debi, verim/SFP ve harici statik basınç kritik.',
        steps: [
          'Debi: kişi/mahale göre toplam m³/h (EN 16798-1/ASHRAE 62.1 aralıkları).',
          'Verim/SFP: %70–85 verim, düşük SFP (işletme maliyeti).',
          'Basınç: filtre/kanal kayıplarına uygun harici statik basınç.'
        ],
        pitfalls: ['Yüksek verime bakıp harici statik basıncı atlamak']
      }
    }
  },
  home: {
    features: {
      euQuality: "Avrupa kalite standartları",
      fastDelivery: "Hızlı teslimat",
      warranty: "2 yıl garanti",
      support: "7/24 teknik destek",
    },
    heroTitle: "Temiz Hava, Temiz Gelecek",
    heroSubtitle: "Türkiye'nin en güvenilir HVAC distributörü. 6 premium marka, 50+ ürün çeşidi ile profesyonel havalandırma çözümleri.",
    bottomCtaTitle: "Doğru ürünü seçmenize yardımcı olalım.",
    bottomCtaSubtitle: "Proje detayınızı paylaşın, mühendislik ekibimiz hızlıca yönlendirsin.",
    whyParagraph: "15+ yıllık deneyimimiz ve dünya standartlarındaki ürünlerimizle HVAC sektöründe güvenilir partneriniziz.",
    why: {
      premiumTitle: "Premium Kalite",
      premiumText: "Avrupa standartlarında, dünya çapında tanınan markalardan sadece en kaliteli ürünleri seçiyoruz.",
      expertTitle: "Uzman Destek",
      expertText: "HVAC uzmanlarımız size en uygun çözümü bulmak için 7/24 teknik destek sağlar.",
      fastTitle: "Hızlı Teslimat",
      fastText: "Türkiye genelinde hızlı ve güvenli teslimat.",
    },
    stats: {
      premiumBrands: "Premium Marka",
      productTypes: "Ürün Çeşidi",
      yearsExperience: "Yıl Deneyim",
      happyCustomers: "Mutlu Müşteri",
    },
    galleryTitle: 'Ürün Galerisi',
    gallerySubtitle: 'Öne çıkan ürünlere göz atın'
  },
  homeCta: {
    title: 'Projenizi Konuşalım',
    subtitle: 'Kısa bir bilgi verin, doğru çözümü birlikte şekillendirelim.',
    button: 'Teklif / Uzman Desteği'
  },
  homeProcess: {
    title: 'Nasıl Çalışırız?',
    subtitle: 'Başlangıçtan teslimata, şeffaf ve öngörülebilir bir süreç',
    stepPrefix: 'Adım',
    steps: {
      need: { title: 'İhtiyacınızı Anlıyoruz', desc: 'Kısa bir görüşme veya form ile kullanım senaryosunu netleştiriyoruz.' },
      analysis: { title: 'Analiz ve Hesap', desc: 'Debi, basınç, akustik, enerji verimliliği ve yönetmelikleri gözden geçiriyoruz.' },
      proposal: { title: 'Çözüm / Teklif', desc: 'Uygun ürün aileleri, alternatifler ve teslim süresiyle teklif sunuyoruz.' },
      implementation: { title: 'Uygulama Desteği', desc: 'Montaj kılavuzları, devreye alma ve teknik destekle süreci kolaylaştırıyoruz.' },
      support: { title: 'Destek', desc: 'Satış sonrası eğitim, yedek parça ve servis ağı ile sürdürülebilir çözüm.' }
    }
  },
  homeTrust: {
    title: 'Güven ve Uygunluk',
    subtitle: 'Altyapı, güvenlik ve süreçlerimiz şeffaf ve standartlara uygundur.',
    kvkk: { title: 'KVKK Uyumlu', desc: 'Kişisel veriler güvenle saklanır, yalnızca gerekli süreçlerde kullanılır.' },
    payment: { title: 'Güvenli Ödeme (iyzico)', desc: '3D Secure ve ileri dolandırıcılık önleme kontrolleri.' },
    returns: { title: 'İade/Değişim Kolaylığı', desc: 'Şeffaf prosedür ve hızlı sonuç odaklı destek.' }
  },
  homeFaq: {
    title: 'Sık Sorulanlar (Kısa)',
    subtitle: 'Temel konulara hızlı cevaplar — daha fazla bilgi için destek sayfamıza göz atın.',
    readMore: 'Daha fazla oku →',
    items: {
      airCurtain: {
        q: 'Hava perdesi hangi durumlarda kullanılır?',
        a: 'Girişlerde konforu artırmak ve enerji kaybını azaltmak için kullanılır. Kapı açıklığında hava bariyeri oluşturur.'
      },
      jetFan: {
        q: 'Jet fan seçimi nasıl yapılır?',
        a: 'Otopark hacmi, CO/NOx sensörleri, hava değişim sayısı ve yerleşim planına göre hesap yapılır.'
      },
      hrv: {
        q: 'HRV seçerken nelere dikkat etmeliyim?',
        a: 'Hava debisi, ısı geri kazanım verimi, basınç kaybı ve ses seviyeleri ana kriterlerdir.'
      }
    }
  },
  homeSpotlight: {
    title: 'Öne Çıkan Uygulamalar',
    subtitle: 'İmleci gezdirin; odak içeriği vurgulayın',
    items: {
      parkingJetFan: { title: 'Otopark Jet Fan', desc: 'CO sensörlü kontrol ve enerji tasarrufu' },
      airCurtain: { title: 'Hava Perdesi', desc: 'Giriş konforu ve ısı kaybı azaltımı' },
      hrv: { title: 'Isı Geri Kazanım (HRV)', desc: 'İç hava kalitesi ve verimlilik' },
      smokeExhaust: { title: 'Duman Egzozu', desc: 'Acil durum yönetimi' }
    }
  },
  homeGallery: {
    title: 'Uygulama Vitrini',
    subtitle: 'Gerçek kullanım senaryolarına hızlı bakış',
    productsCta: 'Ürünlere Git',
    guideCta: 'Kılavuzu Aç',
    items: {
      parking: { title: 'Otopark Havalandırma', subtitle: 'Jet fan / CO kontrol' },
      airCurtain: { title: 'Hava Perdesi', subtitle: 'Giriş konforu' },
      heatRecovery: { title: 'Isı Geri Kazanım', subtitle: 'Enerji verimliliği' },
      industrialKitchen: { title: 'Endüstriyel Mutfak', subtitle: 'Davlumbaz ve kanal' },
      smokeExhaust: { title: 'Duman Egzozu', subtitle: 'Acil durum' },
      hvac: { title: 'Isıtma/Soğutma', subtitle: 'Konfor iklimi' }
    }
  },
  homeShowcase: {
    slide1: { title: 'Endüstriyel Havalandırmada Uzmanlık', subtitle: 'Projenize uygun çözümler ve doğru ürün seçimi' },
    slide2: { title: 'Enerji Verimliliği ve Konfor', subtitle: 'Doğru mühendislik ile daha düşük maliyet, daha iyi performans' },
    slide3: { title: 'İhtiyacına Göre Yönlendirme', subtitle: 'Uygulamaya göre keşfet, hızlıca doğru kategoriye ilerle' },
    prevAria: 'Önceki',
    playAria: 'Oynat',
    pauseAria: 'Durdur',
    nextAria: 'Sonraki'
  },
  products: {
    itemsListed: "ürün listeleniyor",
    resultsFound: "sonuç bulundu",
    heroValue1: "Sertifikalı, güvenilir ürünler",
    heroValue2: "Mühendislik desteği ve doğru seçim",
    heroValue3: "Hızlı teklif / yönlendirme",
    helpCtaTitle: "Kararsız mısınız? Uygulamaya göre doğru ürünü seçelim.",
    helpCtaSubtitle: "Kısa bir form ile proje detayınızı paylaşın, mühendislik ekibimiz hızlıca dönüş yapsın.",
    breadcrumbDiscover: "Keşfet",
    heroTitle: "HVAC ürünlerini keşfet: Mühendislik odaklı seçim, hızlı teklif",
    heroSubtitle: "Uygulamaya göre alanlar, popüler kategoriler ve öne çıkan ürünlerle doğru ürüne hızlıca ulaş.",
    applicationTitle: "Uygulamaya Göre Çözümler",
    popularCategories: "Popüler Kategoriler",
    discoverVisual: 'Keşfet görsel alanı',
    searchResultsTitle: 'Arama Sonuçları',
    searchSeoTitle: 'Arama: {{q}}',
    searchSeoDesc: '"{{q}}" arama sonuçları',
    discoverSeoDesc: 'VentHub keşfet: ürünleri, öne çıkanları ve popüler kategorileri görüntüleyin.'
  },
  applications: {
    parking: {
      title: "Otopark Havalandırma",
      subtitle: "Yüksek debi ve basınç gerektiren çözümler",
    },
    airCurtain: {
      title: "AVM / Giriş Hava Perdesi",
      subtitle: "Enerji kaybını azaltan giriş çözümleri",
    },
    heatRecovery: {
      title: "Isı Geri Kazanım",
      subtitle: "Verimli iklimlendirme ve enerji tasarrufu",
    },
    "air-curtain": {
      title: "AVM / Giriş Hava Perdesi",
      subtitle: "Enerji kaybını azaltan giriş çözümleri",
    },
    "heat-recovery": {
      title: "Isı Geri Kazanım",
      subtitle: "Verimli iklimlendirme ve enerji tasarrufu",
    }
  },
  megamenu: {
    navigation: 'Navigasyon Menüsü',
    quickAccess: 'Hızlı Erişim',
    myCart: 'Sepetim',
    loadingCategories: 'Kategoriler yükleniyor...',
    productCategories: 'Ürün Kategorileri',
    pickCategory: 'Premium HVAC çözümleri için kategori seçiminizi yapın',
    subcategories: 'alt kategori',
    more: 'daha fazla',
  },
  header: {
    syncing: 'Senkronize ediliyor',
    roleLabel: 'Yetki',
    account: 'Hesabım',
    adminPanel: 'Admin Paneli',
    menu: 'Menü',
    quickOrder: 'Hızlı Sipariş',
    recentlyViewed: 'Son Görüntülenen',
    favorites: 'Favoriler',
    cart: 'Sepet'
  },
  roles: {
    superadmin: 'Superadmin',
    admin: 'Admin',
    moderator: 'Moderatör',
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
  admin: {
    dashboard: {
      subtitle: 'Hızlı bakış ve son hareketler',
      rangeToday: 'Bugün',
      range7d: '7 Gün',
      range30d: '30 Gün',
      kpis: {
        ordersCount: 'Sipariş Adedi',
        salesTotal: 'Satış Toplamı',
        pendingReturns: 'Bekleyen İade',
        pendingShipments: 'Bekleyen Kargo',
        avgBasket: 'Ortalama Sepet'
      },
      trend: 'Son {{days}} gün sipariş trendi',
      recent: { title: 'Son Siparişler' },
      table: { order: 'Sipariş', date: 'Tarih', amount: 'Tutar', status: 'Durum' }
    },
    errors: {
      levelTitle: 'Seviye',
      envTitle: 'Ortam',
      detailsTitle: 'Detaylar',
      table: { date: 'Tarih', level: 'Seviye', message: 'Mesaj', url: 'URL' }
    },
    toolbar: {
      searchPlaceholder: 'Ara',
      clear: 'Temizle',
      records: 'kayıt'
    },
    menu: {
      dashboard: 'Dashboard',
      coupons: 'Kuponlar',
      webhookEvents: 'Webhook Olayları',
      orders: 'Siparişler',
      inventory: 'Stok Özeti',
      movements: 'Hareket Defteri',
      inventorySettings: 'Eşik & Ayarlar',
      returns: 'İadeler',
      users: 'Kullanıcılar',
      logs: 'Kayıtlar',
      errors: 'Hatalar',
      errorGroups: 'Hata Grupları',
      products: 'Ürünler',
      categories: 'Kategoriler'
    },
    titles: {
      dashboard: 'Dashboard',
      orders: 'Siparişler',
      inventory: 'Stok Özeti',
      movements: 'Hareket Defteri',
      returns: 'İade Yönetimi',
      users: 'Kullanıcı Yönetimi',
      audit: 'Denetim Kayıtları',
      errors: 'Hata Kayıtları',
      errorGroups: 'Hata Grupları',
      products: 'Ürünler',
      categories: 'Kategoriler',
      coupons: 'Kuponlar'
    },
    ui: {
      prev: 'Önceki',
      next: 'Sonraki',
      refresh: 'Yenile',
      loading: 'Yükleniyor…',
      loadingShort: 'Yükleniyor…',
      noRecords: 'Kayıt yok',
      apply: 'Uygula',
      clear: 'Temizle',
      close: 'Kapat',
      save: 'Kaydet',
      add: 'Ekle',
      delete: 'Sil',
      details: 'Detay',
      hide: 'Gizle',
      all: 'Tümü',
      pageLabel: 'Sayfa {{page}} / {{pages}}',
      startDate: 'Başlangıç',
      endDate: 'Bitiş',
      failed: 'İşlem başarısız'
    },
    search: {
      audit: 'Tablo adı, PK veya not ara',
      errors: 'URL veya mesaj ara',
      coupons: 'Kod veya tip ile ara',
      movements: 'Ürün adı/SKU ara',
      orders: 'Sipariş ID veya Conversation ID'
    },
    orders: {
      statusLabels: {
        all: 'Tümü',
        paid: 'Ödendi',
        confirmed: 'Onaylı',
        shipped: 'Kargolandı',
        cancelled: 'İptal',
        refunded: 'İade',
        partialRefunded: 'Kısmi İade'
      },
      table: {
        orderId: 'Sipariş ID',
        status: 'Durum',
        conversationId: 'Konuşma ID',
        amount: 'Tutar',
        created: 'Oluşturma Tarihi',
        actions: 'İşlemler'
      },
      filters: {
        status: 'Durum',
        pendingShipments: 'Kargolanmamışlar',
        startDate: 'Başlangıç',
        endDate: 'Bitiş'
      },
      bulk: {
        selected: 'Seçili: {{count}}',
        shipSelected: 'Seçilenleri Kargoya Ver',
        cancelShipping: 'Seçilenlerin Kargosunu İptal Et',
        clearSelection: 'Temizle',
        noShippableSelected: 'Kargosu iptal edilebilir seçim yok',
        confirmCancelShipping: '{{count}} siparişin kargosunu iptal etmek istediğinize emin misiniz?',
        cancelSuccess: '{{count}} sipariş iptal edildi',
        cancelPartialFail: 'Bazı iptaller başarısız: {{failed}}',
        cancelFailed: 'Toplu iptal başarısız'
      },
      export: {
        csvLabel: 'CSV (Excel uyumlu UTF‑8 BOM)',
        xlsLabel: 'Excel (.xls — HTML tablo)',
        headers: {
          orderId: 'Sipariş ID',
          status: 'Durum',
          conversationId: 'Konuşma ID',
          amount: 'Tutar',
          created: 'Oluşturulma'
        }
      },
      columns: {
        orderId: 'Sipariş ID',
        status: 'Durum',
        conversationId: 'Konuşma ID',
        amount: 'Tutar',
        created: 'Oluşturma'
      },
      actions: {
        shipping: 'Kargo',
        logs: 'Loglar',
        notes: 'Notlar',
        cancel: 'İptal'
      },
      tooltips: {
        shipping: 'Kargo bilgisi ekle / düzenle',
        logs: 'E‑posta loglarını görüntüle',
        notes: 'Sipariş notlarını görüntüle/ekle',
        cancelShipping: 'Kargoyu iptal et',
        cancelBulkShipping: 'Seçilenlerde kargoyu iptal et (yalnızca kargolanmış siparişler)'
      },
      modals: {
        shipping: {
          title: 'Kargoya Ver / Takip No',
          bulkTitle: 'Toplu: Kargoya Ver',
          carrierLabel: 'Kargo Firması',
          carrierSelect: 'Seçiniz…',
          trackingLabel: 'Takip Numarası',
          trackingPlaceholder: 'Takip numarası',
          sendEmailLabel: 'Müşteriye e-posta bildirimi gönder',
          advancedLabel: 'Gelişmiş: sipariş bazlı carrier/tracking gir',
          advancedTable: {
            orderId: 'Sipariş ID',
            carrier: 'Kargo',
            tracking: 'Takip'
          },
          carriers: {
            yurtici: 'Yurtiçi',
            aras: 'Aras',
            mng: 'MNG',
            ptt: 'PTT',
            ups: 'UPS',
            fedex: 'FedEx',
            dhl: 'DHL',
            other: 'Diğer'
          },
          otherPlaceholder: 'Diğer (elle yazın)',
          cancel: 'İptal',
          save: 'Kaydet',
          saving: 'Kaydediliyor...'
        },
        logs: {
          title: 'E‑posta Kayıtları',
          orderLabel: 'Sipariş:',
          table: {
            date: 'Tarih',
            to: 'Kime',
            subject: 'Konu',
            carrier: 'Kargo',
            tracking: 'Takip No',
            messageId: 'Mesaj ID'
          },
          noRecords: 'Kayıt yok',
          close: 'Kapat'
        },
        notes: {
          title: 'Sipariş Notları',
          inputPlaceholder: 'Yeni not yazın',
          add: 'Ekle',
          adding: 'Kaydediliyor…',
          delete: 'Sil',
          noRecords: 'Kayıt yok',
          close: 'Kapat'
        }
      },
      toasts: {
        loadError: 'Yüklenemedi',
        emailLogsFailed: 'E‑posta kayıtları alınamadı',
        notesFailed: 'Notlar alınamadı',
        noteAddFailed: 'Not eklenemedi',
        noteDeleteSuccess: 'Not silindi',
        noteDeleteFailed: 'Not silinemedi',
        shippingCancelConfirm: 'Kargo iptal edilsin mi? Bu işlem durumu "Onaylı" yapar ve takip bilgilerini siler.',
        shippingCancelSuccess: 'Kargo iptal edildi',
        shippingCancelFailed: 'Kargo iptali yapılamadı',
        shippingUpdateSuccess: 'Kargo bilgileri kaydedildi',
        shippingCreateSuccess: 'Sipariş kargoya verildi',
        shippingUpdateFailed: 'Kargo güncellenemedi',
        bulkShippingSuccess: '{{count}} sipariş kargolandı',
        bulkShippingFailed: 'Toplu kargo güncellenemedi',
        missingFields: 'Kargo firması ve takip numarası gerekli',
        missingAdvancedFields: 'Eksik alanlar var: {{count}} satır'
      },
      states: {
        loading: 'Yükleniyor...',
        noRecords: 'Kayıt bulunamadı'
      }
    }
  },
  footer: {
    quickLinks: 'Hızlı Bağlantılar',
    categories: 'Kategoriler',
    contact: 'İletişim',
    workingHours: 'Mesāi Saatleri',
    weekdays: 'Pazartesi - Cuma',
    saturday: 'Cumartesi',
    rights: 'Tüm hakları saklıdır.'
  },
  contactPage: {
    title: 'İletişim',
    subtitle: 'Projeniz veya ürünlerle ilgili sorularınız için bize ulaşın. En kısa sürede dönüş yaparız.',
    addressLabel: 'Adres',
    addressLine1: 'Teknokent Mah. Teknopark Blv.',
    addressLine2: 'No: 1/4A 34906 Pendik/İstanbul',
    phoneLabel: 'Telefon',
    emailLabel: 'E‑posta',
    quickTitle: 'Hızlı İletişim',
    quickDesc: "Acil durumlar ve hızlı yanıt gereken konular için WhatsApp'tan direkt ulaşın.",
    quickButton: "WhatsApp'tan Yaz",
    formTitle: 'Teklif/İletişim Formu',
    namePh: 'Ad Soyad',
    emailPh: 'E‑posta',
    subjectPh: 'Konu',
    messagePh: 'Mesajınız / Proje bilgileri',
    submit: 'Gönder'
  },
  aboutPage: {
    title: 'VentHub Hakkında',
    subtitle: 'Premium HVAC çözümlerinde güvenilir iş ortağınız. Kurumsal tedarik, mühendislik destekli seçim ve hızlı teklif süreçleriyle yanınızdayız.',
    stats: {
      premiumBrands: 'Premium Marka',
      productTypes: 'Ürün Çeşidi',
      yearsExperience: 'Yıl Deneyim'
    },
    whyTitle: 'Neden VentHub?',
    bullets: {
      bullet1: 'Mühendislik odaklı seçim desteği ve doğru ürün yönlendirmesi',
      bullet2: 'Stok, teslimat ve satış sonrası süreçlerde şeffaf iletişim',
      bullet3: 'KVKK/iyzico uyumlu, güvenli ödeme ve veri koruması'
    }
  },
  category: {
    loading: 'Kategori yükleniyor...',
    notFound: 'Kategori Bulunamadı',
    backHome: 'Ana sayfaya dön',
    breadcrumbHome: 'Ana Sayfa',
    filters: 'Filtreler',
    subcategories: 'Alt Kategoriler',
    priceRange: 'Fiyat Aralığı',
    brands: 'Markalar',
    techFilters: 'Teknik Filtreler',
    airflow: 'Debi (m³/h)',
    pressure: 'Basınç (Pa)',
    noise: 'Ses [dB(A)] (Maks)',
    clearFilters: 'Filtreleri Temizle',
    sortByName: 'Ada Göre Sırala',
    sortByPriceLow: 'Fiyat: Düşükten Yükseğe',
    sortByPriceHigh: 'Fiyat: Yüksekten Düşüğe',
    noProducts: 'Ürün Bulunamadı',
    noProductsDesc: 'Seçtiğiniz filtrelere uygun ürün bulunamadı.',
    compareBar: 'Karşılaştır',
    open: 'Aç',
    clean: 'Temizle',
    compareTitle: 'Karşılaştırma',
    close: 'Kapat',
    feature: 'Özellik',
    labelBrand: 'Marka',
    labelModel: 'Model',
    labelPrice: 'Fiyat',
    localSearchPlaceholder: 'Bu kategoride ara (ad/marka/model/SKU)',
    gridViewAria: 'Izgara görünümü',
    listViewAria: 'Liste görünümü',
    minPlaceholder: 'Min',
    maxPlaceholder: 'Maks',
    ltePlaceholder: '≤'
  },
  pdp: {
    loading: 'Ürün yükleniyor...',
    productNotFound: 'Ürün Bulunamadı',
    backHome: 'Ana sayfaya dön',
    back: 'Geri Dön',
    featured: 'Öne Çıkan',
    brand: 'Marka',
    model: 'Model',
    inStock: 'Stokta Var',
    outOfStock: 'Stokta Yok',
    vatIncluded: '(KDV Dahil)',
    qty: 'Miktar:',
    addToCart: 'Sepete Ekle',
    askStock: 'Stok sorunuz',
    techQuote: 'Teknik teklif al',
    freeShipping: 'Bedava Kargo',
    warranty2y: '2 Yıl Garanti',
    support247: '7/24 Destek',
    descFallback: 'Bu ürün için detaylı açıklama yakında eklenecektir.',
    relatedGuide: 'İlgili Rehber',
    statusLabel: 'Durum',
    relatedProducts: 'Benzer Ürünler',
    labels: {
      productFeatures: 'Ürün Özellikleri',
      productDescription: 'Ürün Açıklaması',
      technicalSpecs: 'Teknik Özellikler',
      category: 'Kategori',
      price: 'Fiyat',
      physicalDimensions: 'Fiziksel Ölçüler',
      performanceMetrics: 'Performans Ölçüleri',
      width: 'Genişlik',
      height: 'Yükseklik',
      depth: 'Derinlik',
      weight: 'Ağırlık',
      airflow: 'Hava Debisi',
      pressure: 'Basınç',
      power: 'Güç',
      noise: 'Gürültü Seviyesi'
    },
    features: {
      materialQuality: 'Premium kalite malzeme ve üretim',
      energyEfficient: 'Enerji verimli tasarım ve düşük tüketim',
      quietOperation: 'Sessiz çalışma ve minimum titreşim',
      easyMaintenance: 'Kolay montaj ve bakım',
      durable: 'Uzun ömürlü ve dayanıklı'
    },
    diagramsExtra: {
      technicalDiagrams: 'Teknik Şemalar',
      mounting: 'Montaj Şeması',
      electrical: 'Elektrik Şeması',
      threeDViews: '3D Görünümler',
      view3DModel: '3D Model Görünümü',
      interactiveModel: 'Interaktif Model',
      dimensionedDrawing: 'Ölçülü Çizim',
      cadDwg: 'CAD - DWG Format'
    },
    docs: {
      installationGuide: 'Kurulum Kılavuzu',
      userManual: 'Kullanım Kılavuzu',
      maintenanceManual: 'Bakım Kılavuzu',
      safetyInfo: 'Güvenlik Bilgileri',
      warrantyTerms: 'Garanti Koşulları',
      technicalSpecsDoc: 'Teknik Özellikler',
      productCatalog: 'Ürün Kataloğu',
      technicalBrochure: 'Teknik Broşür',
      productReleaseNotes: 'Ürün Güncelleme Notları',
      troubleshootingGuide: 'Sorun Giderme Rehberi',
      sparePartsList: 'Yedek Parça Listesi'
    },
    actions: {
      download: 'İndir',
      downloadCatalog: 'Kataloğu İndir',
      downloadBrochure: 'Broşürü İndir'
    },
    cert: {
      ceCertificate: 'CE Sertifikası',
      iso9001: 'ISO 9001',
      tseCertificate: 'TSE Belgesi',
      energyStar: 'Energy Star',
      ulCertificate: 'UL Belgesi',
      ecoFriendly: 'Çevre Dostu',
      rohsCompliant: 'RoHS Uyumlu',
      downloadCenter: 'Sertifika İndirme Merkezi',
      downloadAllZip: 'Tüm Sertifikaları İndir (ZIP)',
      verify: 'Sertifika Doğrulama'
    },
    certLabels: {
      certificateNo: 'Sertifika No',
      validity: 'Geçerlilik',
      standard: 'Standart',
      efficiency: 'Verimlilik'
    },
    sections: {
      general: 'Genel Bilgiler',
      models: 'Modeller',
      dimensions: 'Ölçüler',
      diagrams: 'Diyagramlar',
      documents: 'Dökümanlar',
      brochure: 'Katalog/Broşür',
      certificates: 'Sertifikalar'
    }
  },
  cart: {
    emptyTitle: 'Sepetiniz Boş',
    emptyDesc: 'Henüz sepetinize ürün eklemediniz. Alışverişe başlamak için ürünlerimizi inceleyin.',
    startShopping: 'Alışverişe Başla',
    title: 'Alışveriş Sepeti',
    countLabel: '{{count}} ürün sepetinizde',
    removeItem: 'Ürünü Kaldır',
    clearCart: 'Sepeti Temizle',
    summary: 'Sipariş Özeti',
    subtotal: 'Ara Toplam',
    shipping: 'Kargo',
    free: 'Bedava',
    vatIncluded: 'KDV (%20, dahil)',
    total: 'Toplam',
    checkout: 'Siparişi Tamamla',
    continueShopping: 'Alışverişe Devam Et',
    securePayment: '🔒 Güvenli ödeme sistemi ile korunmaktadır',
    itemTotal: 'Toplam'
  },
  orders: {
    title: 'Siparişlerim',
    subtitle: 'Geçmiş siparişlerinizi görüntüleyin ve takip edin',
    viewAll: 'Tümünü gör',
    tabs: {
      overview: 'Özet',
      items: 'Ürünler',
      shipping: 'Kargo Takibi',
      invoice: 'Fatura'
    },
    filters: 'Filtreler',
    status: 'Durum',
    all: 'Hepsi',
    pending: 'Beklemede',
    paid: 'Ödendi',
    shipped: 'Kargoda',
    delivered: 'Teslim Edildi',
    failed: 'Başarısız',
    cancelled: 'İptal Edildi',
    refunded: 'İade Edildi',
    partialRefunded: 'Kısmi İade',
    startDate: 'Başlangıç',
    endDate: 'Bitiş',
    orderCode: 'Sipariş No (son 8)',
    orderCodePlaceholder: 'örn. 7016DD05',
    product: 'Ürün',
    productSearchPlaceholder: 'Ürün adına göre ara',
    clearFilters: 'Filtreleri Temizle',
    noOrdersTitle: 'Henüz siparişiniz yok',
    noOrdersDesc: 'İlk siparişinizi vermek için ürünleri keşfedin',
    exploreProducts: 'Ürünleri Keşfet',
    details: 'Detaylar',
    customerInfo: 'Müşteri Bilgileri',
    deliveryAddress: 'Teslimat Adresi',
    orderInfo: 'Sipariş Bilgileri',
    name: 'Ad',
    email: 'E-posta',
    orderId: 'Sipariş ID',
    copy: 'Kopyala',
    conversationId: 'Conversation ID',
    orderDetails: 'Sipariş Detayları',
    productCol: 'Ürün',
    imageCol: 'Görsel',
    qtyCol: 'Adet',
    unitPriceCol: 'Birim Fiyat',
    totalCol: 'Toplam',
    grandTotal: 'Genel Toplam',
    noItems: 'Ürün detayları bulunamadı',
    demoNote: 'Bu demo siparişi test amaçlıdır',
    totalAmount: 'Toplam Tutar',
    reorder: 'Tekrar Satın Al',
    viewReceipt: 'Makbuzu Gör',
    copied: 'Kopyalandı',
    copyFailed: 'Kopyalanamadı',
    reorderedToast: '{{count}} adet ürün sepete eklendi',
    reorderNotFound: 'Ürünler stokta bulunamadı',
    reorderError: 'Tekrar satın alma sırasında hata',
    shippingInfo: 'Kargo Takibi',
    carrier: 'Kargo Firması',
    trackingNumber: 'Takip Numarası',
    trackingLink: 'Takip Linki',
    openLink: 'Bağlantıyı aç',
    shippedAt: 'Kargoya Verildi',
    deliveredAt: 'Teslim Edildi',
    noShippingInfo: 'Kargo bilgisi bulunmuyor.',
    invoicePdf: 'Proforma (PDF)'
  },
  auth: {
    back: 'Geri Dön',
    loginTitle: 'Giriş Yap',
    loginSubtitle: 'VentHub hesabınıza giriş yapın',
    email: 'E-posta Adresi',
    password: 'Şifre',
    forgotPassword: 'Şifremi Unuttum',
    loggingIn: 'Giriş Yapılıyor...',
    login: 'Giriş Yap',
    rememberMe: 'Beni hatırla',
    noAccount: 'Hesabınız yok mu?',
    register: 'Kayıt Ol',
    validEmailPassRequired: 'E-posta ve şifre alanları zorunludur',
    invalidCreds: 'E-posta veya şifre hatalı',
    emailNotConfirmed: 'E-posta adresinizi doğrulamanız gerekiyor',
    genericLoginError: 'Giriş sırasında hata oluştu',
    unexpectedError: 'Beklenmeyen bir hata oluştu',
    registerTitle: 'Kayıt Ol',
    registerSubtitle: "VentHub'a katılın ve özel avantajlardan yararlanın",
    name: 'Ad Soyad',
    confirmPassword: 'Şifre Tekrarı',
    passwordMin: 'Şifre en az 8 karakter olmalıdır',
    passwordsDontMatch: 'Şifreler eşleşmiyor',
    passwordPwned: 'Bu şifre veri sızıntılarında tespit edildi, lütfen farklı ve güçlü bir şifre kullanın',
    registering: 'Kayıt Yapılıyor...',
    alreadyHave: 'Zaten hesabınız var mı?',
    goToLogin: 'Giriş Sayfasına Dön',
    registrationComplete: 'Kayıt Tamamlandı!',
    registrationEmailSent: 'E-posta adresinize doğrulama linki gönderildi. Lütfen e-postanızı kontrol ederek hesabınızı doğrulayın.',
    backHome: 'Ana Sayfaya Dön',
  },
  cartToast: {
    added: 'Ürün sepete eklendi! ',
    whatNext: 'Ne yapmak istiyorsunuz?',
    continue: 'Alışverişe Devam Et',
    goToCart: 'Sepete Git',
    autoClose: 'Bu pencere 5 saniye sonra otomatik kapanacak'
  },
  checkout: {
    saved: {
      title: 'Kayıtlı Adresler',
      address: 'Adres',
      default: 'Varsayılan',
      use: 'Bu adresi kullan',
      manage: 'Adresleri yönet',
      seeAll: 'Tüm adresleri gör',
      select: 'Adres seçimi',
      close: 'Kapat',
      edit: 'Düzenle',
      delete: 'Sil',
      save: 'Kaydet',
      cancel: 'İptal',
      defaultShipping: 'Kargoda varsayılan',
      defaultBilling: 'Faturada varsayılan',
      updated: 'Adres güncellendi',
      deleted: 'Adres silindi',
      updateError: 'Güncelleme sırasında hata',
      deleteError: 'Silme sırasında hata',
      confirmDelete: 'Bu adresi silmek istediğinize emin misiniz?'
    },
    title: 'Ödeme',
    backToCart: 'Sepete Dön',
    securePaymentBrand: 'Güvenli ödeme • {{brand}}',
    securePaymentProvider: "{{provider}} altyapısı ile 256‑bit SSL şifreleme",
    summaryTitle: 'Sipariş Özeti',
    summaryThumb: 'Ürün',
    paymentSectionTitle: 'Ödeme İşlemi',
    paymentLoading: 'Ödeme formu yükleniyor. Lütfen 3D doğrulamayı tamamlayın. İşlem bittiğinde bu sayfa otomatik olarak güncellenecektir.',
    formPreparing: 'Form hazırlanıyor...',
    paymentSuccess: '🎉 Ödeme başarıyla tamamlandı!',
    paymentError: 'Ödeme sırasında hata oluştu',
    steps: { step1: 'Kişisel Bilgiler', step2: 'Adres Bilgileri', step3: 'Gözden Geçir', step4: 'Ödeme' },
    overlay: {
      dialogLabel: 'Güvenli ödeme başlatılıyor',
      header: 'Güvenli ödeme başlatılıyor…',
      starting: 'Ödeme başlatılıyor',
      secureForm: 'Güvenli form yükleniyor',
      bank3d: 'Banka 3D doğrulaması',
      stageInit: 'Başlatılıyor',
      stageForm: 'Güvenli form',
      stageBank: 'Banka 3D',
      dontClose: 'Bu işlem sırasında sayfayı kapatmayın veya geri tuşuna basmayın. İşlem birkaç saniye sürebilir.'
    },
    help: {
      smsTitle: 'Kod gelmedi mi?',
      tip1: '30–60 sn bekleyip tekrar deneyin (bankanız gecikmeli SMS gönderebilir).',
      tip2: 'Telefonunuzda uçak modu/sinyal sorunları yoksa farklı karta/cihaza deneyebilirsiniz.',
      tip3: 'Numara doğruluğunu kontrol edin ve bankanızla iletişime geçin.'
    },
    personal: {
      title: 'Kişisel Bilgileriniz',
      nameLabel: 'Ad Soyad *',
      namePlaceholder: 'Adınız ve soyadınız',
      emailLabel: 'E-posta Adresi *',
      emailPlaceholder: 'ornek@email.com',
      phoneLabel: 'Telefon Numarası *',
      phonePlaceholder: '+90 (5xx) xxx xx xx',
      idLabel: 'T.C. Kimlik No (Opsiyonel)',
      idPlaceholder: '12345678901'
    },
    shipping: {
      methodTitle: 'Teslimat Yöntemi',
      title: 'Teslimat Adresi',
      addressLabel: 'Adres *',
      addressPlaceholder: 'Mahalle, sokak, apartman/site adı, kapı no, daire no',
      cityLabel: 'Şehir *',
      cityPlaceholder: 'İstanbul',
      districtLabel: 'İlçe *',
      districtPlaceholder: 'Pendik',
      postalLabel: 'Posta Kodu *',
      postalPlaceholder: '34890'
    },
    billing: {
      title: 'Fatura Adresi',
      sameAsShipping: 'Teslimat adresi ile aynı',
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
      title: 'Fatura Tipi ve Bilgileri',
      individual: 'Bireysel',
      corporate: 'Ticari',
      tcknLabel: 'T.C. Kimlik No *',
      tcknPlaceholder: '11 haneli TCKN',
      companyLabel: 'Şirket Ünvanı *',
      companyPlaceholder: 'Ör: Venthub Mühendislik A.Ş.',
      vknLabel: 'VKN *',
      vknPlaceholder: '10 haneli Vergi Kimlik No',
      taxOfficeLabel: 'Vergi Dairesi *',
      taxOfficePlaceholder: 'Ör: Kadıköy',
      eInvoice: 'e-Fatura mükellefiyim'
    },
    consents: {
      title: 'Yasal Onaylar',
      readAcceptPrefix: '',
      readAcceptSuffix: "'ni okudum ve kabul ediyorum.",
      orderConfirmText: 'Siparişi onaylıyor, ürün ve teslimat bilgilerinin doğruluğunu kabul ediyorum.',
      marketingText: 'Kampanya ve fırsatlardan haberdar olmak için ticari ileti izni veriyorum. (Opsiyonel)'
    },
    review: {
      title: 'Siparişi Gözden Geçir',
      edit: 'Düzenle'
    },
    nav: {
      back: 'Geri',
      next: 'Devam Et',
      proceedPayment: 'Ödemeye Geç',
      backToAddress: 'Adres Bilgilerine Dön'
    },
    security: {
      secureNote: 'Ödeme bilgileriniz güvenli bir şekilde şifrelenmektedir'
    },
    emptyCart: {
      title: 'Sepetiniz Boş',
      desc: 'Ödeme sayfasına erişmek için sepetinizde ürün bulunması gerekir.',
      startShopping: 'Alışverişe Başla'
    },
    errors: {
      nameRequired: 'Ad Soyad alanı zorunludur',
      emailInvalid: 'Geçerli bir e-posta adresi giriniz',
      phoneRequired: 'Telefon numarası zorunludur',
      addressRequired: 'Adres alanı zorunludur',
      cityRequired: 'Şehir alanı zorunludur',
      districtRequired: 'İlçe alanı zorunludur',
      postalRequired: 'Posta kodu zorunludur',
      tcknRequired: 'Bireysel fatura için TCKN zorunludur',
      tcknFormat: 'TCKN 11 haneli olmalıdır',
      companyRequired: 'Ticari fatura için Şirket Ünvanı zorunludur',
      vknRequired: 'Ticari fatura için VKN zorunludur',
      vknFormat: 'VKN 10 haneli olmalıdır',
      taxOfficeRequired: 'Ticari fatura için Vergi Dairesi zorunludur',
      kvkkRequired: 'KVKK Aydınlatma Metni onayı zorunludur',
      distanceSalesRequired: 'Mesafeli Satış Sözleşmesi onayı zorunludur',
      preInfoRequired: 'Ön Bilgilendirme Formu onayı zorunludur',
      orderConfirmRequired: 'Siparişi onaylıyorum kutusunu işaretleyin',
      paymentInit: 'Ödeme başlatma sırasında hata oluştu',
      validation: 'Form bilgilerinde eksiklik var. Lütfen kontrol edin.',
      database: 'Veritabanı hatası. Lütfen tekrar deneyin.'
    }
  },
  payment: {
    verifyingTitle: 'Ödeme doğrulanıyor...',
    verifyingDesc: 'İşleminiz bankanızla doğrulanıyor. Lütfen bekleyin.',
    failedTitle: 'Ödeme Başarısız',
    retry: 'Tekrar Dene',
    orderCompletedTitle: 'Siparişiniz Tamamlandı!',
    orderNoLabel: 'Sipariş No',
    orderCompletedDesc: 'Siparişiniz başarıyla alındı. Kısa süre içinde e‑posta ile bilgilendirme yapılacaktır.',
    dateLabel: 'Tarih',
    itemsCountLabel: 'Ürün Adedi',
    securedBy3d: '3D ile Güvenli',
    viewOrderDetails: 'Sipariş Detaylarını Gör',

    failedGeneric: 'Ödeme tamamlanamadı',
    failedToast: 'Ödeme başarısız: {{msg}}',
    verifyError: 'Doğrulama hatası',
    errorDuring: 'Hata: {{msg}}',
    unverified: 'Ödeme doğrulanamadı',
    unexpected: 'Beklenmeyen bir hata oluştu'
  },
  brands: {
    sectionTitle: 'Premium HVAC Markaları',
    sectionSubtitle: 'Dünyanın önde gelen HVAC markalarının Türkiye distribütörü olarak en kaliteli havalandırma çözümlerini sunuyoruz.',
    viewAll: 'Tüm Markaları Gör',
    pageTitle: 'Markalar',
    seoDesc: 'VentHub çatısı altındaki premium HVAC markaları',
    notFound: 'Marka bulunamadı',
    backToAll: 'Tüm markalara dön',
    countryLabel: 'Ülke:',
    aboutBrand: 'hakkında bilgi'
  },
  categories: {
    title: 'Ürün Kategorileri',
    subtitle: 'HVAC sektörünün her alanına yönelik geniş ürün yelpazemizle profesyonel çözümleri keşfedin.',
    subCount: '{{count}} alt kategori',
    allTitle: 'Tüm Kategoriler',
    variantCount: '{{count}} çeşit'
  },
  quickView: {
    title: 'Hızlı Bakış',
    close: 'Kapat',
    addToCart: 'Sepete Ekle',
    viewProduct: 'Ürünü Gör',
    descFallback: 'Ürün açıklaması yakında eklenecektir.'
  },
  support: {
    links: { faq: 'SSS', returns: 'İade & Değişim', shipping: 'Teslimat & Kargo', warranty: 'Garanti & Servis' },
    home: {
      subtitle: 'İhtiyacınız olan bilgiyi hızlıca bulun.',
      faqDesc: 'Sipariş, ödeme, kurulum ve daha fazlası',
      returnsDesc: 'Cayma hakkı, iade süreçleri ve koşullar',
      shippingDesc: 'Kargo süresi, ücretler, takip bilgileri',
      warrantyDesc: 'Garanti kapsamı ve yetkili servis bilgiler',
      knowledgeDesc: 'Konu bazlı rehberler ve yakında hesaplayıcılar'
    },
    returns: {
      title: 'İade & Değişim',
      desc1: '14 gün içinde cayma hakkınızı kullanabilirsiniz. Ürün, faturası ve tüm aksesuarları ile birlikte, kullanılmamış ve yeniden satılabilir durumda olmalıdır.',
      desc2: 'İade talebinizi sipariş numarası ile destek ekibimize iletin. Onay sonrasında kargo yönlendirmesi sağlanacaktır.'
    },
    shipping: {
      desc1: 'Kargo süreci genellikle 1–5 iş günü sürer; kampanyalara ve stok durumuna göre değişebilir.',
      desc2: 'Kargo ücreti ve sağlayıcı bilgileri ödeme adımında gösterilir. Takip numarası e‑posta ile iletilir.'
    },
    warranty: {
      desc1: 'Garanti kapsamı üretici/ithalatçı şartlarına göre değişebilir. Garanti belgesi ve kullanım kılavuzunu saklayınız.',
      desc2: 'Yetkili servis bilgisi ve arıza kaydı için destek ekibimizle iletişime geçebilirsiniz.'
    },
    faq: {
      q1: 'Siparişim ne zaman kargoya verilir?',
      a1: 'Genellikle ödeme onayından itibaren 1–5 iş günü içinde kargoya verilir.',
      q2: 'Ödeme yöntemleri nelerdir?',
      a2: 'Kredi/Banka kartıyla iyzico altyapısı üzerinden güvenli ödeme yapabilirsiniz.',
      q3: 'Kurulum hizmeti sağlıyor musunuz?',
      a3: 'Ürün bazında değişebilir. Destek ekibimizle iletişime geçin.'
    }
  },
  account: {
    tabs: {
      overview: 'Özet',
      orders: 'Siparişler',
      shipments: 'Kargo Takibi',
      addresses: 'Adresler',
      invoices: 'Faturalar',
      returns: 'İadeler',
      profile: 'Profil',
      security: 'Güvenlik'
    },
    overview: {
      defaultAddressesTitle: 'Varsayılan Adresler',
      shippingAddress: 'Kargo Adresi',
      billingAddress: 'Fatura Adresi',
      notSetShipping: 'Varsayılan kargo adresi ayarlanmamış.',
      notSetBilling: 'Varsayılan fatura adresi ayarlanmamış.',
      manageAddresses: 'Adresleri yönet'
    },
    addresses: {
      title: 'Adreslerim',
      addressLabel: 'Adres',
      defaultShippingTag: 'Kargo varsayılan',
      defaultBillingTag: 'Fatura varsayılan',
      makeDefaultShipping: 'Kargoda varsayılan yap',
      makeDefaultBilling: 'Faturada varsayılan yap',
      noItems: 'Henüz adres eklenmemiş.',
      formTitleEdit: 'Adresi Düzenle',
      formTitleNew: 'Yeni Adres',
      ph: {
        label: 'Etiket (Ev, Ofis)',
        fullName: 'Ad Soyad',
        phone: 'Telefon',
        address: 'Adres',
        city: 'İl',
        district: 'İlçe',
        postalCode: 'Posta Kodu'
      },
      toggle: {
        shippingDefault: 'Kargoda varsayılan',
        billingDefault: 'Faturada varsayılan'
      },
      submit: {
        update: 'Güncelle',
        add: 'Ekle'
      },
      toasts: {
        loadError: 'Adresler yüklenemedi',
        requiredFields: 'Zorunlu alanları doldurun',
        updated: 'Adres güncellendi',
        created: 'Adres eklendi',
        saveError: 'Kaydetme sırasında hata',
        confirmDelete: 'Bu adresi silmek istediğinize emin misiniz?',
        deleted: 'Adres silindi',
        deleteError: 'Silme sırasında hata',
        defaultSetShipping: 'Varsayılan kargo adresi ayarlandı',
        defaultSetBilling: 'Varsayılan fatura adresi ayarlandı',
        updateError: 'Güncelleme sırasında hata'
      }
    },
    invoices: {
      title: 'Fatura Profilleri',
      addNew: 'Yeni Profil Ekle',
      type: 'Tip',
      individual: 'Bireysel',
      corporate: 'Ticari',
      titleLabel: 'Başlık (Opsiyonel)',
      tcknLabel: 'TCKN',
      companyLabel: 'Şirket Ünvanı',
      vknLabel: 'VKN',
      taxOfficeLabel: 'Vergi Dairesi',
      eInvoice: 'e‑Fatura mükellefiyim',
      setDefault: 'Varsayılan Yap',
      default: 'Varsayılan',
      save: 'Kaydet',
      delete: 'Sil',
      cancel: 'İptal',
      confirmDelete: 'Bu fatura profilini silmek istediğinize emin misiniz?',
      created: 'Fatura profili oluşturuldu',
      updated: 'Fatura profili güncellendi',
      deleted: 'Fatura profili silindi',
      setDefaultSuccess: 'Varsayılan profil güncellendi',
      noProfiles: 'Kayıtlı fatura profili bulunmuyor'
    },
    security: {
      title: 'Parola Değiştir',
      currentLabel: 'Mevcut şifre',
      newLabel: 'Yeni şifre',
      confirmLabel: 'Yeni şifre (tekrar)',
      save: 'Kaydet',
      currentRequired: 'Mevcut şifrenizi girin',
      minLength: 'Şifre en az 8 karakter olmalı',
      mismatch: 'Şifreler eşleşmiyor',
      pwned: 'Bu şifre veri sızıntılarında tespit edildi, lütfen farklı ve güçlü bir şifre kullanın',
      wrongCurrent: 'Mevcut şifre hatalı',
      updated: 'Şifreniz güncellendi',
      updateError: 'Şifre güncelleme sırasında hata'
    }
  },
  returns: {
    title: 'İade Talepleri',
    new: 'Yeni İade Talebi',
    empty: 'Henüz iade talebiniz yok.',
    order: 'Sipariş',
    reason: 'Sebep',
    status: 'Durum',
    created: 'Oluşturulma',
    selectOrder: 'Sipariş seçin',
    selectReason: 'Sebep seçin',
    description: 'Açıklama (opsiyonel)',
    descriptionPh: 'Sorunu kısaca açıklayın (opsiyonel)',
    submit: 'Talep Oluştur',
    required: 'Lütfen sipariş ve sebep seçin',
    createdToast: 'İade talebiniz oluşturuldu',
    createError: 'İade talebi oluşturulamadı',
    fetchError: 'İade kayıtları yüklenemedi',
    requestReturn: 'İade Talebi',
    statusLabels: {
      requested: 'Talep Alındı',
      approved: 'Onaylandı',
      rejected: 'Reddedildi',
      in_transit: 'Kargoda',
      received: 'İade Teslim Alındı',
      refunded: 'İade Ücreti Ödendi',
      cancelled: 'İptal Edildi'
    }
  },

  lead: {
    message: 'Mesaj',
    title: 'Teknik Teklif Talebi',
    product: 'Ürün',
    contactInfo: 'İletişim Bilgileri',
    name: 'Ad Soyad',
    company: 'Firma',
    email: 'E-posta',
    phone: 'Telefon',
    city: 'Şehir',
    projectNeed: 'Proje/İhtiyaç',
    applicationArea: 'Uygulama Alanı',
    select: 'Seçin',
    quantity: 'Adet',
    budgetRange: 'Bütçe Aralığı',
    timeframe: 'Zamanlama',
    contactPref: 'İletişim Tercihi',
    contactTime: 'Uygun zaman (örn. 10:00–12:00)',
    consent: 'Aydınlatma metnini okudum ve kabul ediyorum. ',
    submit: 'Gönder',
    submitting: 'Gönderiliyor...',
    cancel: 'Vazgeç',
    errors: {
      name: 'Lütfen ad soyad girin',
      contact: 'E-posta veya telefon zorunludur',
      consent: 'Aydınlatma metni onayı zorunludur'
    }
  }
}
