/**
 * ⛔ADMIN SÖZLÜĞÜ BURADAN İMPORT EDİLMEZ — gerekçesi `tr.ts` başındaki notta (REC-59 Faz 2).
 * Kısaca: admin sözlüğü müşteri paketine giriyordu (ölçüldü: 356.040 baytlık parça, ana
 * sayfa indiriyordu). Artık yalnız admin ekranlarında dinamik import ile yükleniyor.
 */
import { tr } from './tr'

export const en: typeof tr = {
  whatsappMessages: {
    greeting: 'Hello!',
    stockInquiry: 'Hello! Could I get stock availability information for {{product}}?',
    stockInquiryWithSku: 'Hello! Could I get stock availability information for {{product}} (SKU: {{sku}})?',
    support: 'Hello! How can we help you?',
    subjectLine: 'Subject: {{subject}}',
    quoteIntro: 'Hello! Technical quote request:',
    quoteProduct: 'Product: {{product}}',
    quoteProjectInfo: 'Project details: {{info}}',
    quoteAskProject: 'Could you share your project details?',
    faqSupport: 'Hello! I could not find what I was looking for on the FAQ page. Could you help me?',
    contactIntro: 'Hello! I am {{name}}.',
    contactHelp: 'How can we help you?',
  },
  common: {
    technicalDrawing: 'Technical Drawing',
    imagePreparing: 'Product image is being prepared',
    errorGeneric: 'An error occurred',
    devMode: 'Developer Mode',
    userFallback: 'User',
    paginationLabel: 'Pagination',
    paginationPrevious: 'Previous',
    paginationNext: 'Next',
    paginationStatus: 'Page {{page}} of {{pageCount}}',
    update: 'Update',
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
    decrease: 'Decrease',
    increase: 'Increase',
    listingPrice: 'List Price',
    quickDetails: 'Quick Details',
    scrollTo: 'go to section',
    loading: 'Loading...',
    categories: 'Categories',
    products: 'Products',
    brands: 'Brands',
    about: 'About',
    contact: 'Contact',
    knowledgeHub: '',
    signOut: 'Sign Out',
    signIn: 'Sign In',
    signUp: 'Sign Up',
    skipToContent: 'Skip to main content',
    search: 'Search',
    allCategories: 'All Categories',
    languageSwitcher: 'Language Selection',
    turkish: 'Turkish',
    english: 'English',
    discover: 'Discover',
    allProducts: 'All Products',
    exploreProducts: 'Explore Products',
    getQuote: 'Get a Quote',
    addToCart: 'Add to quote list',
    categoryList: {
      residential: 'Residential Ventilation',
      commercial: 'Commercial Ventilation',
      industrial: 'Industrial Ventilation',
      hrv: 'VMC & Heat Recovery',
      'air-treatment': 'Air Treatment',
      hygiene: 'Hygiene and Sanitation',
      summer: 'Summer Ventilation',
      ac: 'Air Conditioning',
      heating: 'Electric Heating',
      hvls: 'Industrial Ceiling Fans',
      accessories: 'Accessories and Components',
      'smart-home': 'Control Systems',
      'parking-jet': 'Car Park Jet Fans',
      // REC-103: see tr.ts — 8 of the 23 active DB categories had no key here at all,
      // so /en pages silently fell back to the Turkish `menu_label`.
      fans: 'Fans',
      'control-systems': 'Control Systems',
      sub: {
        bathroom: 'Bathroom and Toilet Fans',
        window: 'Window and Wall Fans',
        ghost: 'In-line / Duct Fans',
        smoke: 'Smoke Exhaust Fans',
        jet: 'Car Park Jet Fans',
        // Decision 288 (Recep, OPS-76): matches the TR name 'Radyal (Santrifüj) Fanlar'; address and key are unchanged.
        radial: 'Radial (Centrifugal) Fans',
        roof: 'Roof Fans',
        'axial-ind': 'Industrial Axial Fans',
        'air-curtain': 'Air Curtains',
        conditioning: 'Air Conditioning Solutions',
        'rect-duct': 'Rectangular Duct Fans',
        'round-duct': 'Circular Duct Fans',
        exproof: 'Ex-Proof (ATEX) Fans',
        shelter: 'Shelter Ventilation Systems',
        'acid-fans': 'Acid-Resistant Fans',
        'freq-converters': 'Frequency Converters',
        'duct-heaters': 'Electric Duct Heaters',
        dehumidifier: 'Dehumidifiers',
        // REC-103: the six missing sub-categories.
        // ⭐"Duct Type Fans" deliberately differs from `ghost` ("In-line / Duct Fans").
        // ⭐"Water Coil Duct Heaters" deliberately differs from `duct-heaters` (electric).
        chimney: 'Chimney and Flue Fans',
        'duct-fans': 'Duct Type Fans',
        'ducted-central-hrv': 'Ducted Central Units',
        'single-room-hrv': 'Single Room Units',
        'speed-controllers': 'Speed Controllers',
        'water-coils': 'Water Coil Duct Heaters',
        // REC-300 Faz 1-B: bound by the DB migration; the corrosion branch moves to a NEW key.
        // Decision 287 (Recep, OPS-74): matches the TR name; the old `acid-fans` key stays for rollback and the deploy window.
        'corrosion-fans': 'Corrosion- and Acid-Resistant Fans',
        'plug-fans': 'Plug Fans',
        'cabinet-fans': 'Cabinet Fans',
        'unheated-curtain': 'Unheated Air Curtains',
        'electric-curtain': 'Electrically Heated Air Curtains',
        'spare-parts': 'Spare Parts and Sensors'
      }
    },
    viewAll: 'View all',
    featured: 'Sample Product Families',
    homeLabel: 'Home',
    notFound: 'No results found',
    searchPlaceholder: 'Product name, brand...',
    seeAllProducts: 'See all products',
    back: 'Back',
    backToTop: 'Back to top',
    cancel: 'Cancel',
    close: 'Close',
    noVisuals: 'No Visual Available',
    noImage: 'No Image',
    viewFullscreen: 'View fullscreen',
    view3D: 'View 3D',
    prev: 'Previous',
    next: 'Next',
    remove: 'Remove',
    more: 'More',
    whatsappAriaLabel: 'Write by email',
    whatsappTitle: 'Write by email',
    whatsappTooltip: '',
    whatsappSupportMessage: 'Contact us by form or email',
    pdf: 'PDF',
    sku: 'SKU',
    share: 'Share',
    requestQuote: 'Request Quote',
    // REC-115: removed with the dead CategoryHero component (INV-6 dead key).
    // NOTE: `category.trustSignals.fastDelivery` is a DIFFERENT key and is alive.
    series: 'Product family',
    reset: 'Reset',
    whatsapp: {
      faqSupportMessage: 'I could not find the answer I was looking for on the FAQ page...',
      supportMessageDefault: 'Hello, I would like to get in touch with VentHub HVAC.',
    },
    actions: 'Actions',
    addToProject: 'Add to Project List',
    adminPanel: 'Admin Panel',
    all: 'All',
    amount: 'Amount',
    backToSite: 'Back to Site',
    date: 'Date',
    delete: 'Delete',
    edit: 'Edit',
    id: 'ID',
    no: 'No',
    none: 'None',
    save: 'Save',
    saving: 'Saving...',
    status: 'Status',
    yes: 'Yes'
  },
  search: {
    overlay: {
      enterKey: 'Enter ↵',
      arrowUp: '↑',
      arrowDown: '↓',
    },
    recentSearches: 'Recent Searches',
    clearRecent: 'Clear',
    popularCategories: 'Main Categories',
    noResults: 'No results found',
    keyboardHint: 'Navigate with arrow keys',
    // REC-340: Enter now goes to the SELECTED item, not to a second "all results" step.
    enterHint: 'To select',
    // `placeholderAi` removed (REC-340 Phase 0) — see the TR dictionary for the measurement.
    placeholder: 'Search products, categories, brands...',
    noResultsAdvice: 'Try different keywords',
    failed: 'Search is unavailable right now.',
    retry: 'Try again',
    brandPrefix: 'Brand: ',
    fuzzyMatchNotice: 'No exact match found, showing similar results.',
    slowHint: 'Searching, results on the way…'
  },
  knowledge: {
    hub: {
      title: 'Choosing Ventilation Products',
      subtitle: 'Read the guide articles and use the Product Selector for a preliminary assessment from your volume and airflow values.',
      eyebrow: 'Guide Articles',
      searchPlaceholder: 'Search the guide articles...',
      readStart: 'Start Reading',
      heroAlt: 'Image for the ventilation guide articles page',
      readTime: '{{count}} min read',
      // ⛔OLD KEYS REMOVED (2026-09-05): calculatorsSoon · selectorSoon · inDevelopment ·
      // inPlanning. All of them announced something that ALREADY EXISTS as "coming soon":
      // the four calculators are live and the Product Selector entry shipped the same day.
      // K1: no "coming soon", no promise boxes — the storefront shows only what exists.
      selectorTitle: 'Product Selector',
      selectorDesc: 'Duct, heat recovery, air curtain and jet fan sizing in one place.',
      selectorCta: 'Open the Product Selector',
      notFoundTitle: 'Couldn\'t find the technical info you\'re looking for?',
      notFoundDesc: 'You can send your question through the contact form or to info@venthub.com.tr.',
      contactExpert: 'Get in Touch',
      categories: {
        comfort: 'Comfort',
        safety: 'Safety',
        efficiency: 'Efficiency'
      }
    },
    tags: {
      all: 'All',
      havaPerdesi: 'Air Curtain',
      jetFan: 'Jet Fan',
      hrv: 'HRV/ERV'
    },
    topic: {
      warnBadge: '!',
      eyebrow: 'Technical Information',
      notFoundTitle: 'Topic not found',
      notFoundDesc: 'The topic you are looking for may not be added yet.',
      backToHub: 'Back to hub',
      stepsTitle: '3-step selection',
      pitfallsTitle: 'Common pitfalls',
      toProducts: 'Go to related products',
      getQuote: 'Get a Quote'
    },
    topics: {
      'hava-perdesi': {
        title: 'Air Curtain',
        summary: 'An air curtain creates downward airflow across the door opening; store and market entrances are typical uses.',
        steps: ['Measure the door width; the selection is based on it.', 'Measure the door height from the floor and check whether mounting above the door is possible.', 'Decide whether you need entrance heating: unheated models create airflow only, electrically heated models also heat the entrance.'],
        pitfalls: ['Choosing without checking door width', 'Expecting heating from an unheated model', 'Choosing without checking door height']
      },
      'jet-fan': {
        title: 'Jet Fan (Parking)',
        summary: 'Jet fans direct air in enclosed spaces. The catalogue has no jet fan product; the calculator is in the Product Selector.',
        steps: ['Flow: Volume × ACH (e.g. 7,200 m³ × 8 ACH ≈ 57,600 m³/h).', 'Thrust depends on distance and layout; see the Product Selector.', 'The result is a preliminary assessment; request a quote for final selection.'],
        pitfalls: ['Leaving dead zones', 'Missing sensor coverage'],
        image: '/images/hvac_installation_close_up_premium_3.webp'
      },
      hrv: {
        title: 'Heat Recovery (HRV/ERV)',
        summary: 'Provides fresh air with heat recovery; key criteria are airflow, efficiency/SFP and external static pressure.',
        steps: ['Set the airflow (m³/h) with the volume and flow inputs of the heat recovery (HRV) calculator in the Product Selector.', 'Compare efficiency and SFP values in the product\'s technical datasheet.', 'Pressure: external static matching filter/duct losses.'],
        pitfalls: ['Focusing on efficiency while ignoring external static'],
        image: '/images/heat_recovery_ventilator_hrv_system_diagram.jpg'
      },
      'air-curtain': {
        image: '/images/hvac_installation_close_up_premium_3.webp',
        pitfalls: ['Choosing without checking door width', 'Expecting heating from an unheated model', 'Choosing without checking door height'],
        steps: ['Measure the door width; the selection is based on it.', 'Measure the door height from the floor and check whether mounting above the door is possible.', 'Decide whether you need entrance heating: unheated models create airflow only, electrically heated models also heat the entrance.'],
        summary: 'Door width, door height and whether you need entrance heating determine the air curtain choice.',
        title: 'Air Curtain Selection'
      }
    }
  },
  // KNOWLEDGE HUB (decision 92, 2026-09-24) — template texts only; article bodies live elsewhere.
  bilgiMerkezi: {
    ad: 'Knowledge Hub',
    anaSayfa: 'Home',
    liste: {
      seoBaslik: 'Knowledge Hub — Ventilation Guides | VentHub',
      seoAciklama: 'Answers to the questions asked when selecting ventilation products: how they work, how to select them, what to watch out for.',
      baslik: 'Knowledge Hub',
      altBaslik: 'Answers to the questions asked when selecting ventilation products: how they work, how to select them, what to watch out for.',
      aramaEtiketi: 'Search articles',
      aramaYerTutucu: 'Type a topic or term',
      sonucYok: 'No article matches your search.',
      oku: 'Read the article',
      bosBaslik: 'Guides',
      bosAciklama: 'Guides continue to be published. You can run duct, heat recovery, air curtain and jet fan calculations with the Product Selector.',
      seciciBaslik: 'Product Selector',
      seciciAciklama: 'Duct, heat recovery, air curtain and jet fan sizing in one place.',
      seciciDugme: 'Open the Product Selector',
    },
    yazi: {
      yazar: 'VentHub',
      okumaSuresi: '{{count}} min read',
      guncelleme: 'Updated',
      icindekiler: 'Contents',
      urunlerBaslik: 'Related product families',
      urunDugme: 'View family',
      ilgiliBaslik: 'Related articles',
      teklifBaslik: 'Get a quote for your project',
      teklifAciklama: 'Describe your needs in the contact form; we will prepare a quote for the right product.',
      teklifDugme: 'Request a quote',
      listeyeDon: 'Back to the Knowledge Hub',
    },
    // REC-452: guide links under category and family pages + home knowledge block.
    ilgiliRehberler: 'Guides on this topic',
    sonRehberler: 'Latest guides',
    konular: {
      konfor: 'Comfort',
      guvenlik: 'Safety',
      verimlilik: 'Efficiency',
    },
  },
  meta: {
    siteTitle: 'VentHub | Industrial Ventilation and HVAC Engineering Solutions',
    siteDesc: 'Duct fans, air curtains and heat recovery units; engineering-led product selection. Product Selector sizing for duct fans, HRV, air curtains and jet fans.',
  },

  sayfaBulunamadi: {
    baslik: 'Page not found',
    aciklama: 'The page you are looking for may have been moved or removed. You can browse our products or return to the home page.',
    anaSayfa: 'Back to home',
    urunler: 'Browse products',
  },

  home: {
    seoTitle: 'VentHub | Fan, Air Curtain and Heat Recovery Product Catalogue',
    seoDesc: 'Technical specifications for fans, air curtains and heat recovery units, plus duct fan, HRV, air curtain and jet fan calculators for engineering-backed selection. Request a quote.',
    hero: {
      eyebrow: 'Engineering-Guided HVAC Product Catalogue',
      title: 'Find the right product family by category.',
      titleLineOne: 'Find the right product',
      titleLineTwo: 'family by category.',
      subtitle: 'Move from the category list to a product family and reach the quote form.',
      primaryCta: 'Explore Products',
      secondaryCta: 'Request a Quote',
      quickAccessLabel: 'Quick Access',
      visualAlt: 'VentHub industrial HVAC solution visual',
      visualEyebrow: 'Category Selection',
      visualTitle: 'Start with a category, then move to a product family.',
      visualSubtitle: 'Reach product families by category, run a preliminary assessment with the Product Selector, request a quote.',
      visualPoints: {
        selection: 'Access to product families by category',
        routing: 'Contact form and email for quotes'
      },
      metrics: {
        coreCategories: 'start from a main category',
        productSeries: 'routes to {{count}} product families',
        entryPaths: 'from application to product family'
      },
      trustStrip: {
        authorizedBrands: 'Brand and model catalogue',
        engineeringSupport: 'Product Selector tools',
        nationwideDelivery: 'Orders by quotation',
        projectGuidance: 'Technical specification tables'
      },
      quickChips: {
        fans: 'Fans',
        airCurtains: 'Air Curtains',
        heatRecovery: 'Heat Recovery',
        speedControl: 'Speed Control',
        quote: 'Request Quote'
      },
      categorySummaries: {
        fans: 'Compare ATEX, industrial and commercial fan families side by side.',
        airCurtains: 'Move toward the right air curtain family for entrance comfort and energy-loss control.',
        heatRecovery: 'Compare ducted central and single-room heat recovery families.',
        speedControl: 'Speed switches and frequency converters.'
      },
      sinevizyon: {
        altMain: 'VentHub Industrial Ventilation Systems',
        altProduct: 'VentHub Product Family',
        slides: [
          {
            eyebrow: 'VORTICE DUCT FANS',
            title: 'Vortice Lineo and Lineo Quiet',
            subtitle: 'Mixed flow duct fans: Lineo, and Lineo Quiet with a sound-absorbing lining.',
            products: [
              {
                label: 'Lineo Quiet',
                subLabel: 'Mixed Flow Duct Fan'
              },
              {
                label: 'Lineo Quiet',
                subLabel: 'Quiet Duct Fan'
              }
            ]
          },
          {
            eyebrow: 'QUIET DUCT FANS',
            title: 'Vortice Lineo Quiet: Two Motor Options',
            subtitle: 'LINEO QUIET with an AC induction motor and LINEO QUIET ES with a brushless EC motor, in one duct fan family.',
            products: [
              {
                label: 'Sound-Absorbing Lining',
                subLabel: 'Built into the Housing'
              },
              {
                label: 'Brushless EC Motor',
                subLabel: 'Per the manufacturer, low energy use in EC motor models'
              }
            ]
          },
          {
            eyebrow: 'VORTICE LINEO DUCT FANS',
            title: 'Residential, Commercial and Industrial Use',
            subtitle: 'A mixed flow fan that mounts inside a duct, horizontally or vertically, with a three-speed induction motor.',
            products: [
              {
                label: 'In-Duct Mounting',
                subLabel: 'Horizontal or Vertical'
              },
              {
                label: 'Three-Speed Motor',
                subLabel: 'Induction Motor'
              }
            ]
          }
        ]
      }
    },
    cinematicShowcase: {
      hudStatus: 'Product family',
      eyebrow: 'MIXED FLOW DUCT FAN',
      title: 'Vortice Lineo Quiet Product Family',
      subtitle: 'A mixed flow duct fan with the sound-absorbing lining integrated into the outer housing.',
      description: 'LINEO QUIET has an AC induction motor and LINEO QUIET ES a brushless EC motor; per the manufacturer, the brushless EC model provides low energy consumption.',
      cta: 'View Technical Data',
      badge: 'AC / EC MOTOR',
      componentLabel: 'System Component',
      // URN-80: image alt texts — say what the image shows, carry no superiority claim.
      imageAlt: {
        airflow: 'Vortice Lineo series in-line duct fan, with airflow lines',
        side: 'Vortice Lineo series in-line duct fan, side view'
      },
      hotspots: {
        motor: 'EC and AC Motor Options',
        motorDetail: 'Per the manufacturer, EC brushless LINEO QUIET ES offers low energy consumption.',
        clamps: 'Duct Connection',
        clampsDetail: 'Models are offered in different diameters.',
        housing: 'Sound-Absorbing Lining',
        housingDetail: 'Sound-absorbing lining is fully integrated into the outer housing.',
        airflow: 'Mixed Flow Fan',
        airflowDetail: 'Lineo Quiet is a duct-type mixed flow fan.'
      }
    },
    quickEntry: {
      eyebrow: 'Starting Point',
      title: 'Start with a category, a calculation or a quote',
      subtitle: 'Browse categories, use the Product Selector for a preliminary assessment, or request a quote.',
      items: {
        category: {
          title: 'Browse by Category',
          description: 'From ATEX fans to quiet duct fans, browse the product families with their technical data.'
        },
        application: {
          title: 'Find by Application',
          description: 'Air curtains for doorways, PP fans for corrosive gas extraction, duct fans.'
        },
        support: {
          title: 'Product Selector',
          description: 'Run duct fan, heat recovery, air curtain and jet fan sizing.'
        },
        quote: {
          title: 'Request a Project Quote',
          description: 'Send your requirements through the contact form or to info@venthub.com.tr.'
        }
      }
    },
    guidedDiscovery: {
      eyebrowLabel: 'VENTILATION SOLUTIONS',
      heading: 'Ventilation Products by Category',
      intro: 'Browse the fan, air curtain, heat recovery and control system families and models.',
      cardFallback: 'Ventilation Products',
      eyebrow: 'VENTILATION SOLUTIONS',
      title: 'Ventilation Products by Category',
      subtitle: 'Choose a category, browse its product families; for a quote, use the contact form or email.',
      seriesCount: '{{count}} product families',
      categoryFallback: 'Browse the product families and models in this category.',
      panelEyebrow: 'STEP BY STEP',
      panelTitle: 'From category to product and quote',
      panelBody: 'Product pages include technical specification tables. Send quote requests and questions through the contact form or info@venthub.com.tr.',
      panelFallback: 'View the product families in this category and the models in each.',
      primaryCta: 'Open Category',
      secondaryCta: 'View Scenarios',
      seriesEyebrow: 'FAMILY QUICK ACCESS',
      seriesTitle: '{{category}} product families',
      seriesFallback: 'Review the models and technical specifications of this product family.',
      footerNote: 'Category selection starts here; model details are on the product page.',
      steps: {
        select: {
          title: 'Choose a category',
          description: 'Start from a main category such as fans, air curtains, heat recovery or control systems.'
        },
        compare: {
          title: 'Choose a Product Family',
          description: 'For fans, for example, choose one of the duct, roof, axial and ATEX product families.'
        },
        convert: {
          title: 'Pick a product and request a quote',
          description: 'Check the technical specification table on the product page, then request a quote for the model you need.'
        }
      },
      loading: 'Preparing categories...'
    },
    applicationSolutions: {
      eyebrow: 'Scenario-Led Solutions',
      title: 'You can also start from the use case, not only from the product.',
      subtitle: 'Air curtains for store entrances; ducted central or single room units for heat recovery.',
      viewAll: 'View All',
      items: {
        entrance: {
          eyebrow: 'Entrance Comfort',
          title: 'Store entrance and air curtain solutions',
          description: 'A downward airflow across the doorway separates indoor air from outside at store, restaurant and warehouse doors.',
          point1: 'Selection by door size',
          point2: 'Unheated or electrically heated'
        },
        comfort: {
          eyebrow: 'Heat Recovery',
          title: 'Ducted central and single room units',
          description: 'The Product Selector sizes heat recovery (HRV); results are a pre-assessment.',
          point1: 'Ducted central heat recovery product families',
          point2: 'Single-room heat recovery product families'
        }
      }
    },
    featuredCommercial: {
      eyebrow: 'Product Showcase',
      title: 'Fans and Ventilation Products',
      subtitle: 'Use the tabs to browse models from the catalogue.',
      cta: 'Browse All Product Families',
      panelEyebrow: 'Technical Focus',
      tabs: {
        featured: 'Models',
        newArrivals: 'More Models',
        bestSellers: 'Further Models',
        airCurtains: 'Air Curtains',
        heatRecovery: 'Heat Recovery'
      },
      panelTitles: {
        featured: 'Models from the Catalogue',
        newArrivals: 'Models from the Catalogue',
        bestSellers: 'Models from the Catalogue',
        airCurtains: 'Air Curtain Models',
        heatRecovery: 'Heat Recovery'
      },
      panelDescriptions: {
        featured: 'Models from the catalogue and their technical specifications; details are on the product page.',
        newArrivals: 'Models from the catalogue and their technical specifications; details are on the product page.',
        bestSellers: 'Models from the catalogue and their technical specifications; details are on the product page.',
        airCurtains: 'Air curtains that separate indoor air from outside with an airflow along the doorway; unheated and electrically heated models.',
        heatRecovery: 'Heat recovery units in ducted central and single-room types.'
      }
    },
    trustProof: {
      eyebrow: 'Catalogue and Tools',
      title: 'Catalogue, Product Selector and Quote',
      subtitle: 'Browse fan, air curtain, heat recovery and frequency converter models, run a pre-assessment from your volume, airflow and pressure inputs, and request a quote.',
      badge: 'ON VENTHUB',
      visualAlt: 'Rectangular and round ventilation ducts suspended from a ceiling',
      items: {
        brands: {
          eyebrow: 'Catalogue',
          title: 'Brands and Models',
          description: 'Product families and models from AVenS, Casals, Danfoss, Nicotra Gebhardt, SEAT and Vortice, with technical specification tables.'
        },
        guidance: {
          eyebrow: 'Calculation',
          title: 'Pre-sizing with the Product Selector',
          description: 'Enter values such as volume, airflow and pressure; the duct fan, heat recovery, air curtain and jet fan calculators give a preliminary assessment.'
        },
        delivery: {
          eyebrow: 'Logistics',
          title: 'Delivery planning',
          description: 'Delivery time and shipping terms are settled at the quotation stage, according to your project.'
        },
        support: {
          eyebrow: 'Contact',
          title: 'Request a Quote, Ask a Question',
          description: 'Send quote requests and questions through the contact form or info@venthub.com.tr. Technical specifications are on the product pages.'
        }
      }
    },
    strategicBrands: {
      eyebrow: 'Catalogue Brands',
      title: 'Brands for fans, air curtains, heat recovery and frequency converters',
      subtitle: 'Brands and product families have their own pages; product pages include data sheets and specification tables.'
    },
    knowledge: {
      headingPrefix: 'Guides and',
      headingAccent: 'Sizing',
      statsPipelineLabel: 'In the Catalogue',
      eyebrow: 'Guides and Support',
      title: 'Guides and Sizing',
      subtitle: 'Read the guides (published in Turkish) and use the calculators before choosing a product; check the FAQ and delivery information before requesting a quote.',
      cta: 'Explore',
      hub: {
        title: 'Ventilation Guide Articles',
        subtitle: 'Every guide article has a Sources section, and guide articles are published in Turkish. Use the Product Selector for calculations.',
        searchPlaceholder: 'Search...',
        readStart: 'Start Reading',
        // ⛔DUPLICATE "coming soon" COPY REMOVED (2026-09-05). This block lives under
        // `home.knowledge.hub` and was NEVER rendered — `KnowledgeBlock`'s props type has no
        // `hub`, and nothing in the repo reads `home.knowledge`. The same untruth existed
        // twice: once on screen, once dead. The dead one is gone too, so nobody restores it.
        notFoundTitle: 'Couldn\'t find the technical info you\'re looking for?',
        notFoundDesc: 'You can send your question through the contact form or by email.',
        contactExpert: 'Get in Touch',
        readTime: '{{count}} min read',
        categories: {
          comfort: 'Comfort',
          safety: 'Safety',
          efficiency: 'Efficiency'
        }
      },
      items: {
        guides: {
          eyebrow: '',
          title: '',
          description: 'Guide articles are published in Turkish; each article has a Sources section.'
        },
        // "Product Selector", not "Calculators" (decision K17): one name, one destination.
        calculators: {
          eyebrow: 'Product Selector',
          title: 'Preliminary assessment: volume, flow, pressure',
          description: 'Duct, HRV, air-curtain and jet fan sizing in one place.'
        },
        support: {
          eyebrow: 'Support',
          title: 'FAQ, delivery, returns, warranty pages',
          description: 'Orders start with a quote request. You can send questions through the contact form or by email.'
        }
      }
    },
    finalCta: {
      eyebrow: 'Final Step',
      title: 'Send your requirements, request a quote.',
      subtitle: 'Run a preliminary assessment with the Product Selector, browse the product families, and use the contact form or email to request a quote.',
      primaryCta: 'Request Quote',
      secondaryCta: 'Get in Touch',
      tertiaryCta: 'Explore Products'
    },
    heroTitle: 'Clean Air, the Right Product Family',
    heroSubtitle: 'Engineering-driven ventilation product catalogue and calculators: fans, air curtains, heat recovery and frequency converters.',
    bottomCtaTitle: 'Let us help you choose the right product.',
    bottomCtaSubtitle: 'Send your project details through the contact form or by email.',
    whyParagraph: 'Browse duct fan, air curtain and heat recovery models, pre-size with the Product Selector and request a quote.',
    why: {
      premiumTitle: 'Brands',
      premiumText: 'Products from {marka} brands; product pages carry datasheets and specification tables.',
      expertTitle: 'Pre-assessment',
      expertText: 'The Product Selector runs duct fan, heat recovery, air curtain and jet fan sizing.',
      fastTitle: 'Order by Quote',
      fastText: 'Delivery terms are stated in the quote.'
    },
    stats: {
      premiumBrands: 'Brands',
      productTypes: 'Product Families',
      yearsExperience: 'Models',
      happyCustomers: 'Main Categories'
    },
    galleryTitle: 'Product Gallery',
    gallerySubtitle: 'Browse product families',
    caseStudies: {
      title: 'Application Areas',
      subtitle: 'Air curtain use areas and jet fan sizing',
      viewDetails: 'View Details',
      items: {
        parking: {
          title: 'Jet Fan Sizing',
          summary: 'Jet fan sizing in the Product Selector takes volume, flow and pressure inputs; the result is a preliminary assessment.',
          metrics: {
            energySavings: '',
            duration: ''
          }
        },
        airCurtain: {
          title: 'Air Curtain Application',
          summary: 'An air curtain creates a downward airflow across the door opening that limits the passage of hot and cold air.',
          metrics: {
            comfortIncrease: '',
            roi: ''
          }
        }
      }
    }
  },
  homeCta: {
    title: 'Let’s Talk About Your Project',
    subtitle: 'Send a short project description via the contact form or email.',
    button: 'Request a Quote'
  },
  homeProcess: {
    title: 'How We Work',
    subtitle: 'From catalogue to quote: delivery terms are clarified at the quote stage',
    stepPrefix: 'Step',
    steps: {
      need: {
        title: 'Understanding Your Needs',
        desc: 'Share your intended use through the contact form or at info@venthub.com.tr.'
      },
      analysis: {
        title: 'Preliminary Calculation',
        desc: 'Enter volume, flow and pressure in the Product Selector for a preliminary calculation. The results are preliminary assessments.'
      },
      proposal: {
        title: 'Solution / Proposal',
        desc: 'We propose suitable product families, alternatives and lead times.'
      },
      implementation: {
        title: 'Installation and Maintenance',
        desc: 'For installation and maintenance, refer to the product\'s user manual and manufacturer documentation.'
      },
      support: {
        title: 'FAQ and Contact',
        desc: 'For technical questions, you can use the contact form or email.'
      }
    }
  },
  homeShowcase: {
    slide1: {
      title: 'Fans, air curtains and heat recovery',
      subtitle: 'Run a preliminary assessment with the Product Selector'
    },
    slide2: {
      title: 'Fans, Converters, Heat Recovery',
      subtitle: 'Examples from the models in the catalogue'
    },
    slide3: {
      title: 'Guided by Your Needs',
      subtitle: 'Explore by application and quickly reach the right category'
    },
    prevAria: 'Previous',
    playAria: 'Play',
    pauseAria: 'Pause',
    nextAria: 'Next'
  },
  products: {
    // REC-338 — see the TR dictionary for the measurement that motivated these keys.
    discovery: {
      seoTitle: 'All Products | Industrial Ventilation and HVAC — VentHub',
      seoDesc: 'Product families in one list: fans, heat recovery, air curtains, frequency converters and accessories. Engineering-led selection; request a quote to order.',
    },
    orbital: {
      dragHint: 'Drag to Spin',
      tapProductHint: 'Tap a Product',
      swipeHint: 'Swipe Left-Right',
      pickCategoryHint: 'Pick a Category',
      discoverTitle: 'Discover Our Product Range',
      subcategoriesTitle: '{{name}} Subcategories',
      openMainDesktop: 'Click: Open Category • Double-click: Go to Page',
      openMainTouch: 'Tap: Open • Double Tap: Go',
      openSubDesktop: 'Click to Open the Product Page',
      openSubTouch: 'Tap to Open the Page',
    },
    radialMenu: {
      subcategoriesCount: 'Subcategories ({{count}})',
      noSubcategories: 'No Subcategories',
      viewProducts: 'View Products',
    },
    category3DIcon: {
      dragHint: 'Hold to Rotate',
    },
    smartInference: {
      aiInsightBadge: 'PRODUCT INFO',
    },
    blueprint: {
      scanning: 'Scanning Blueprint...',
      objectReference: 'Object Reference: P-501',
      cinematicMode: 'Cinematic Mode',
    },
    addToProject: {
      closeModal: 'Close modal',
      existingProjects: 'My Projects',
      noProjects: 'You don\'t have any projects yet.',
      createNewProject: 'Create New Project',
      projectNamePlaceholder: 'Project Name (e.g. Office Building Ventilation)',
      cancel: 'Cancel',
      footerHint: 'You can manage your projects from the my account page.',
    },
    heroTitle: 'Discover fans, air curtains, heat recovery and control products: engineering-led selection',
    heroSubtitle: 'Reach a product family from the categories or brand pages, or type a model name or code in the search box.',
    itemsListed: 'items listed',
    // REC-115: removed with the dead CategoryHero component.
    popularCategories: 'Main Categories',
    hubTitle: 'HVAC Product Families',
    searchPlaceholder: 'Search product or model...',
    noResults: 'No Results Found',
    clearFilters: 'Clear Filters',
    heroAlt: 'HVAC Products Discovery Image',
    searchAriaLabel: 'Search Products',
    searchHelp: 'Start typing for detailed filters.',
    allProductsTitle: 'All Our Products',
    emptyDesc: 'Select one of the categories to see more products.',
    emptyTitle: 'No Products Found',
    systemTotalPrefix: 'All in catalogue',
    viewGrid: 'Grid',
    viewList: 'List'
  },
  megamenu: {
    elite: {
      defaultDescription: 'Browse ventilation product families.',
      viewAll: 'View All',
    },
    classic: {
      logoInitial: 'V',
      title: 'Categories',
    },
    categoryHub: {
      featuredTechnology: 'TECHNOLOGY',
      defaultDescription: 'Subcategories and product families are listed here.',
      back: 'Go Back',
      subCategoryCount: '{{count}} Subcategories',
    },
    productCategories: 'Product Categories',
  },
  teklifPaneli: {
    // REC-129 Faz 1c — header "Quote" element and panel (design v13, screen 12).
    teklif: 'Quote',
    kalemSayisi: '{n} items in quote list',
    baslik: 'Quote list · {n} items',
    bosBaslik: 'Quote list is empty',
    bosAciklama: 'Add items from products.',
    urunlereGit: 'Go to products',
    tumListe: 'See all ({n})',
    tekliflerim: 'My quotes',
    projelerim: 'My projects',
    favorilerim: 'My favourites',
    girisDaveti: 'Sign in to see your quotes and projects',
  },
  altSekme: {
    // REC-129 Faz 1b — mobile bottom tab bar (design v13, screens 01/02/12).
    // Keys are NESTED: `getDictValue` cannot resolve a flat dotted key and would
    // render the raw key (CLAUDE.md rule 7 · i18n-dead-key gate).
    etiket: 'Bottom navigation',
    anasayfa: 'Home',
    urunler: 'Products',
    teklif: 'Quote',
    // Also states the badge number in WORDS (screen readers). The badge alone
    // carries no meaning — colour/position cannot be the only information carrier.
    teklifSayisi: '{n} items in quote list',
    destek: 'Support',
    hesap: 'Account',
    tumUrunler: 'All products',
    markalar: 'Brands',
    teknikDestek: 'Technical support',
    iletisim: 'Contact',
    // Account sheet (REC-129 Faz 1c): the floating language switcher was removed;
    // on mobile this sheet's top row is the only entry point for language.
    dil: 'Language',
    hesabim: 'My account',
    girisYapin: 'Sign in',
    kilitli: '(sign-in required)',
  },
  header: {
    adminBar: {
      brand: 'VH / ADMIN',
      backToSite: 'Back to Site',
    },
    syncing: 'Syncing',
    roleLabel: 'Role',
    account: 'My Account',
    adminPanel: 'Admin Panel',
    menu: 'Menu',
    // REC-94: `quickOrder` removed — it promised ordering on a site that cannot take
    // orders (promise-integrity standard §1.4). The key was deliberately deleted rather
    // than left behind; what must return with it is listed in the standard's §4.5 table.
    recentlyViewed: 'Recently Viewed',
    favorites: 'Favorites',
    cart: 'Cart',
    brandName: 'VentHub',
    brandTagline: 'HVAC Catalogue',
    commandSearchCompact: 'Search...'
  },
  roles: {
    superadmin: 'Super Admin',
    super_admin: 'Super Admin',
    admin: 'Admin',
    moderator: 'Moderator',
    warehouse: 'Warehouse',
    sales: 'Sales',
    viewer: 'Viewer',
    user: 'User'
  },
  legalLinks: {
    kvkk: 'KVKK Privacy Notice',
    distanceSales: 'Distance Sales Agreement',
    preInformation: 'Pre-Information Form',
    cookies: 'Cookie Policy',
    privacy: 'Privacy Policy',
    terms: 'Terms of Use'
  },
  cookieConsent: {
    title: 'Cookie Consent',
    description: 'We use strictly necessary cookies to run the site. Non-essential cookies are used only with your consent.',
    policyLink: 'Cookie Policy',
    acceptAll: 'Accept All',
    rejectOptional: 'Necessary Only',
    manage: 'Manage Preferences',
    saveSelection: 'Save Selection',
    changePreferences: 'Change my cookie preferences',
    categories: {
      necessary: 'Strictly necessary',
      necessaryDesc: 'Required for sign-in, basket and security; cannot be switched off.',
      functional: 'Functional',
      functionalDesc: 'Remembers your language and display preferences.',
      analytics: 'Analytics',
      analyticsDesc: 'Lets us measure how the site is used.',
      marketing: 'Marketing',
      marketingDesc: 'Allows promotions tailored to your interests.'
    }
  },
  legal: {
    kvkkTitle: 'KVKK Clarification Text (Draft)',
    draftWarning: 'This text is a draft and for testing purposes. Please update it with your company\'s actual details and confirm with a legal expert before going live.',
    disclaimer: 'This text does not constitute legal advice. It is recommended to seek professional counsel for the final text.',
    privacyTitle: 'Privacy Policy (Draft)',
    cookieTitle: 'Cookie Policy (Draft)',
    distanceSalesTitle: 'Distance Sales Agreement (Draft)',
    preInformationTitle: 'Pre-Information Form (Draft)',
    termsTitle: 'Terms of Use (Draft)',
    // Page metadata (meta description) — see tr.ts.
    seo: {
      kvkk: 'Clarification text on the processing of personal data under Turkish Law No. 6698 (KVKK).',
      privacy: 'How personal data is collected, used and protected on the VentHub website.',
      cookie: 'Cookies used on the VentHub website and how to manage cookie preferences.',
      terms: 'Terms of use of the VentHub website.',
      distanceSales: 'Distance sales agreement for purchases made through VentHub.',
      preInformation: 'Pre-information form provided to the consumer before a distance sale.',
    }
  },
  footer: {
    quickLinks: 'Quick Links',
    categories: 'Categories',
    contact: 'Contact',
    workingHours: 'Quotes and Questions',
    weekdays: 'For quotes and questions, send an email or fill in the contact form.',
    saturday: '',
    rights: 'All rights reserved.',
    // address/phone DELIBERATELY ABSENT (2026-08-28): no fabricated address or number
    // is published. Restored together with the TR dictionary (parity) once real.
    email: 'info@venthub.com.tr',
    // social DELIBERATELY ABSENT (REC-285, 2026-09-24): links pointed at platform home pages.
    // Restored together with the TR dictionary (parity) once real account URLs exist.
  },
  contactPage: {
    form: {
      heroBadge: 'Quotes and Questions',
      heroTitle: 'Let\'s Shape Your',
      heroTitleAccent: 'Project Together',
      heroDesc: 'For product selection, technical questions and quote requests, fill in the form or send an email.',
      cardPhoneTitle: '',
      cardPhoneLabel: 'Write via the form',
      cardEmailTitle: 'Technical Quote',
      cardEmailLabel: 'Send Email',
      // cardOffice* REMOVED (2026-08-28): no real office address, so no card.
      directAccessLabel: 'Contact Options',
      supportTitle: 'Technical Questions',
      supportTitleAccent: 'By Form and Email',
      supportDesc: 'Product pages carry technical datasheets and specification tables; if you have a further technical question, you can send it by email.',
      whatsappCta: 'Send a Technical Question',
      responseTime: 'Request a quote to place an order',
      successTitle: 'Your Message Has Been Sent',
      successDesc: 'If you have anything to add, you can send an email.',
      newMessage: 'Send a New Message',
      labelName: 'Full Name',
      labelEmail: 'Email',
      labelSubject: 'Subject / Project Name',
      labelMessage: 'Your Message',
      subjectPlaceholder: 'e.g. Duct Fan Project Quote',
      messagePlaceholder: 'Write your requirements here...',
      submitButton: 'Submit Request',
      consentText: 'I have read and agree.',
      consentRequired: 'You must accept the KVKK text',
      submitFailed: 'We could not send your message. Please try again; if the problem persists, contact us directly.',
    },
    title: 'Contact',
    subtitle: 'Contact us for product selection, technical questions or quote requests. Use the form or write to us by email.',
  },
  aboutPage: {
    title: 'About VentHub',
    heroTitle: 'Ventilation products:',
    whySubtitle: 'Brands listed in the product catalogue',
    experience: 'Brands with Products',
    distributorship: 'Product Families',
    completedProject: 'Active Models',
    shippingNetwork: 'Product Selector Tools',
    precisionTitle: 'Product Selector Tools',
    precisionDesc: 'Run a pre-assessment for duct fans, heat recovery (HRV), air curtains and jet fans from your volume, airflow and pressure inputs.',
    standardsTitle: 'Sourced Guides',
    standardsDesc: 'Guide articles are published in Turkish; each one carries its own Sources section.',
    trustTitle: 'Orders by Quote',
    trustDesc: 'Online sales are currently closed; orders start with a quote request. The quote states the shipping fee and carrier; the tracking number is sent by email.',
    heroBadge: 'Catalogue and Quotation Site',
    heroTitleItalic: 'catalogue and selection tools',
    heroDesc: 'VentHub lists products such as fans, air curtains, heat recovery units and frequency converters by brand, product family and model.',
    storyTitle: 'Find, Calculate,',
    storyTitleItalic: 'Request a Quote',
    storyDesc1: 'The catalogue has brand pages, product family pages and product pages; the product pages carry technical specification tables. You can browse products by brand or by product family.',
    storyDesc2: 'Product Selector results are a pre-assessment; to request a quote, use the contact form or email. Guide articles are published in Turkish.',
    teamTitle: 'Product Selector &',
    teamSubtitle: 'Guide Articles (Turkish)',
    brandTitle: 'Brands in',
    brandTitleItalic: 'the Catalogue',
    ctaTitle: 'For a Quote or a Question,',
    ctaTitleItalic: 'Use the Contact Form',
    ctaContact: 'Contact Us',
    ctaExplore: 'Explore Products',
    seoDescription: 'VentHub lists fans, air curtains, heat recovery units and frequency converters. For engineering-oriented selection, use the Product Selector for a pre-assessment and request a quote.',
    vision: 'Catalogue, Sizing, Quote'
  },
  category: {
    // REC-497: used when the category has no description of its own (metadata.description_i18n).
    // No unverifiable "highest quality / most economical" claim; sales mode is quote-based, no price promise.
    seoYedekAciklama: 'Browse the product families, models and technical specifications in the {{ad}} category in the VentHub catalog.',
    family: {
      variantCount: '{{count}} models',
      count: '{{count}} product families',
      viewFamily: 'Explore',
    },
    view: {
      grid: 'Grid View',
      list: 'List View',
    },
    sort: {
      title: 'Sort',
      name: 'By Name',
      variantCount: 'Model count',
    },
    noProductsFound: 'No products found matching these criteria',
    howItWorks: {
      stepNumberLabel: '{{number}}. {{title}}',
      detailIcon: '💡',
    },
    faq: {
      heading: 'Frequently Asked Questions',
      subtitle: 'Choosing, installing and maintaining air curtains',
      moreQuestions: 'Do you have other questions?',
      contactUs: 'Contact us →',
      q1: 'What does an air curtain do?',
      a1: 'An air curtain separates indoor air from outdoor air with a stream of air blown downwards across the door, limiting air exchange while the door is open. Shop and supermarket entrances, restaurants and warehouse doors are typical applications.',
      q2: 'Should I choose an electric or an ambient-air model?',
      a2: 'This depends on where you use it. Unheated (ambient-air) models only create an airflow; electrically heated models also heat the entrance. If you want heating at the entrance, choose an electrically heated model; if not, choose an unheated one.',
      q3: 'What size should the air curtain be?',
      a3: 'An air curtain is chosen according to the door width. The door\'s height above the floor and whether the unit can be mounted above the door also affect the choice. For details, see the technical specifications on the product page.',
      q4: 'How is an air curtain installed?',
      a4: 'Whether the unit can be mounted above the door affects the choice of model. For installation, see the product\'s user manual and the manufacturer\'s documentation.',
      q5: 'How is it maintained?',
      a5: 'For maintenance, see the product\'s user manual and the manufacturer\'s documentation.',
      q6: 'What does the Vortice warranty cover?',
      a6: 'Warranty coverage may vary depending on the manufacturer or importer. Please keep your warranty document and user manual. For questions, you can write to info@venthub.com.tr.',
    },
    trustSignals: {
      // REC-104: see tr.ts — brand-specific wording, the fixed "2-year" claim and the
      // certification row were removed.
      authorizedDealerTitle: 'Technical Datasheet',
      authorizedDealerDesc: 'Specification tables on product pages',
      warrantyTitle: 'Warranty Information',
      warrantyDesc: 'Subject to manufacturer/importer terms',
      // REC-104: see tr.ts — payment/shipping promise keys removed.
      techSupportTitle: 'Enquiry and Quote',
      techSupportDesc: 'By form or email',
    },
    typeComparison: {
      sectionTitle: 'Which Type of Air Curtain Is Right for You?',
      sectionSubtitle: 'Choose the type according to whether you want heating at the entrance.',
      electricSubtitle: 'For heating the entrance',
      electricBenefit1: 'Warm air barrier at the entrance',
      electricBenefit2: 'Also heats the entrance area',
      electricBenefit3: 'Airflow and heating in one unit',
      electricBenefit4: 'Chosen if heating is wanted',
      electricBestFor1: 'Entrances to heat',
      electricBestFor2: '',
      electricBestFor3: '',
      electricBestFor4: '',
      electricNotFor1: 'Entrances not to heat',
      electricNotFor2: '',
      ambientTitle: 'Unheated',
      ambientSubtitle: 'Unheated models',
      ambientBenefit1: 'Creates an airflow only',
      ambientBenefit2: 'Downward air stream',
      ambientBenefit3: 'Vortice AD family',
      ambientBenefit4: 'Chosen if heating is not wanted',
      ambientBestFor1: 'Entrances not to heat',
      ambientBestFor2: '',
      ambientBestFor3: '',
      ambientBestFor4: '',
      ambientNotFor1: 'Entrances needing heating',
      ambientNotFor2: '',
      advantagesLabel: 'FEATURES',
      bestForLabel: 'SUITABLE:',
      notForLabel: 'NOT RECOMMENDED:',
      modelsCta: '{{title}} Models',
      stillUndecided: 'Still undecided?',
      wizardPitch: 'If you are undecided, enter your door size and heating preference for a preliminary assessment.',
      helpMe: 'Help Me',
    },
    bottomCta: {
      nextStep: 'Your Next Step',
      helpText: 'You can send your questions about {{category}}.',
      viewAllProducts: 'View all products',
      findFit: 'Open the Selection Wizard',
      findFitDesc: 'Run a preliminary calculation',
      expertSupport: 'Contact Form',
      expertSupportDesc: 'Submit a project enquiry',
      backToTop: 'Back to Top',
    },
    problemSection: {
      headerTitle: 'Air and Heat Exchange at an Open Door',
      headerSubtitle: 'When a door stays open, indoor and outdoor air mix.',
      energyLossTitle: 'Energy Loss',
      energyLossDesc: 'Heat transfer between indoors and outdoors while the door is open',
      tempDiffTitle: 'Temperature Difference',
      tempDiffDesc: 'Heat is transferred between indoors and outdoors once the door is open',
      airflowTitle: 'Airflow',
      airflowDesc: 'Outdoor air entering through an open door',
      pestTitle: 'Dust and Insect Entry',
      pestDesc: 'Dust and insects entering through an open door',
      crossMark: '❌',
      checkMark: '✓',
      withoutTitle: 'Without an Air Curtain',
      withoutPoint1: 'Indoor and outdoor air mix',
      withoutPoint2: 'Hot and cold air can pass through',
      withoutPoint3: 'Dust can enter',
      withoutPoint4: 'Dust and insects can enter',
      withTitle: 'With an Air Curtain',
      withPoint1: 'Invisible air barrier',
      withPoint2: 'Limits air and heat exchange',
      withPoint3: 'Limits dust entry',
      withPoint4: 'Per the manufacturer, prevents dust and insect entry',
    },
    landing: {
      expertiseArea: 'Product Category',
      descriptionFallback: 'Browse product families with their technical specifications.',
      detailedReview: 'View Details',
      viewModels: 'View Models',
      dehumidifierTitle: 'Dehumidifiers',
      dehumidifierDesc: 'The catalogue lists Vortice Deumido dehumidifiers; technical specifications are given on the product pages.',
      dehumidifierCapacityValue: '',
      dehumidifierCapacityLabel: 'Capacity',
      dehumidifierNoiseValue: '',
      dehumidifierNoiseLabel: 'Sound Level',
      modelsSuffix: 'Models',
      filterAll: 'All Models',
      venthubSolution: 'VentHub Solution',
    },
    series: {
      technicalFamily: 'Subcategory',
      heroDefaultDesc: 'Browse products by technical product families; specification tables are on the product pages.',
      seriesDetail: 'Subcategory Detail',
      requestQuote: 'Request a Quote',
      colModel: 'Model',
      colPrice: 'Price',
      colAction: 'Action',
      skuLabel: 'SKU: {{sku}}',
      trust1Title: 'Technical Datasheet',
      trust1Desc: 'Product pages include datasheets and specification tables.',
      trust2Title: 'Product Selector',
      trust2Desc: 'Gives a preliminary assessment from volume, flow rate and pressure inputs.',
      trust3Title: 'Enquiry and Quote',
      trust3Desc: 'You can send your questions by form or email.',
    },
    loading: 'Loading category... ',
    notFound: 'Category Not Found',
    backHome: 'Back to home',
    breadcrumbHome: 'Home',
    breadcrumbAria: 'Breadcrumb',
    premiumCollection: 'Lineo Quiet Family',
    findModel: 'Find Suitable Model',
    productCount: 'Product Count',
    discoverMore: 'Discover More',
    whichAirCurtain: 'Which Air Curtain Should You Choose?',
    airCurtainHelper: 'Door size and the need for heating at the entrance determine the choice.',
    ambientAir: 'Ambient Air (Unheated)',
    ambientAirDesc: 'Unheated models (Vortice AD) create an air flow across the door opening only and do not heat the entrance.',
    electricHeated: 'Electric Heated',
    electricHeatedDesc: 'Electrically heated models heat the air flow passing through the door, providing heating at the entrance.',
    ambientPoint1: 'Creates an airflow only.',
    ambientPoint2: 'Choose this type if no heating is wanted at the entrance.',
    ambientPoint3: 'Uses an air flow to block hot and cold air at the door opening.',
    electricPoint1: 'Creates a heated air flow across the door opening.',
    electricPoint2: 'Heating applies only to the air passing through the door.',
    electricPoint3: 'A typical use at store and restaurant entrances.',
    inspectModels: 'Inspect Models',
    modernLiving: 'Modern Living Spaces',
    modernLivingDesc: 'Duct fan with sound-absorbing lining built into the casing.',
    flexibilityEsthetics: 'Size and Motor Options',
    smartControl: 'Smart Control',
    smartControlDesc: 'According to the manufacturer, the brushless EC LINEO QUIET ES offers low energy consumption.',
    longTermInvestment: 'Selection by door size',
    longTermInvestmentDesc: 'The manufacturer states low energy use for EC brushless LINEO QUIET ES.',
    allSeries: 'All Subcategories',
    chooseSeriesDesc: 'Choose the subcategory that suits your needs.',
    inspectSeries: 'Explore',
    whyCategory: 'Why {{category}}?',
    electricVsAmbientAlt: 'Electric vs Ambient Air Comparison',
    modernLoftAlt: 'Illustration of a Vortice Lineo Quiet duct fan in an interior space',
    lineoQuietQuote: 'Lineo Quiet ES is a mixed-flow duct fan with sound-absorbing cladding and an EC brushless motor.',
    industrialLabAlt: 'Industrial Laboratory Application',
    lineoTechnicalAlt: 'Lineo Quiet Technical Detail',
    lineoNeonAlt: 'Vortice Lineo Quiet image',
    vorticeHeritageAlt: 'Vortice brand and its Tribiano (Italy) headquarters',
    airCurtainDiagramAlt: 'Air Curtain Operating Principle',
    whyCategorySubtitle: 'The catalogue includes product families, product pages and technical specification tables.',
    lineoTechnologyTitle: 'Vortice Lineo Quiet ES Technology',
    howItWorksTitle: 'How It Works',
    lineoTechnologyDesc: 'Mixed-flow duct fan; available with AC induction or EC brushless motors.',
    howItWorksDesc: 'The air curtain creates an invisible barrier, separating the indoor and outdoor environments.',
    why1Title: 'Datasheets',
    why1Desc: 'Technical values (motor, airflow and pressure) are listed in the technical table on each product page.',
    why2Title: 'Noise Values',
    why2Desc: 'Noise level information is listed in the technical table on the product page.',
    why3Title: 'Documents and Manuals',
    why3Desc: 'The product manual and manufacturer documents are the reference for installation and maintenance.',
    filters: 'Filters',
    subcategories: 'Subcategories',
    brands: 'Brands',
    airflow: 'Airflow (m³/h)',
    showcase: {
      defaultDescription: 'Product families, models and technical specification tables in this category.',
      premiumTitle: 'Product Catalogue',
      catalog: 'Category Catalogue',
      subGroups: 'Subcategories',
      exploreSeries: 'Explore',
      guarantee: 'VentHub Catalogue',
      discover: 'Discover',
      whyVenthubTitle: 'What the Catalogue Offers',
      premiumEngineeringAlt: 'Category image',
      features: [
        { title: 'Technical Datasheet', desc: 'Product pages include datasheets and specification tables.' },
        { title: 'Product Selector', desc: 'Preliminary calculators for duct fans, heat recovery, air curtains and jet fans.' },
        { title: 'Orders by Quote', desc: 'Delivery terms are clarified at the quotation stage, based on your project.' }
      ]
    },
    pressure: 'Pressure (Pa)',
    noise: 'Noise [dB(A)] (Max)',
    clearFilters: 'Clear Filters',
    noProducts: 'No Products Found',
    open: 'Open',
    clean: 'Clear',
    close: 'Close',
    feature: 'Feature',
    localSearchPlaceholder: 'Search within this category (name/brand/model/SKU)',
    howItWorksAirCurtain: {
      title: 'How Does an Air Curtain Work?',
      subtitle: 'A stream of air blown downwards across the door',
      diagramAlt: 'Air Curtain Working Principle',
      steps: [
        {
          title: 'Airflow',
          description: 'The device blows a stream of air downwards across the door.',
          detail: 'Unheated models only create an airflow; electrically heated models also heat the entrance.'
        },
        {
          title: 'Invisible Barrier',
          description: 'The airflow creates an invisible curtain at the door opening.',
          detail: 'This air curtain separates the indoor and outdoor environments without a physical barrier.'
        },
        {
          title: 'Separation',
          description: 'Limits the entry of outdoor air and dust.',
          detail: 'The transfer of heat between indoor and outdoor spaces is limited.'
        },
        {
          title: 'Where It Is Used',
          description: 'Shop and supermarket entrances, restaurants and warehouse doors are typical applications.',
          detail: 'Door size and the need for heating determine the choice.'
        }
      ]
    },
    vorticeBrand: {
      compassoDoro: '',
      italianEngineering: 'Italy-Based Brand',
      whyVortice: 'Why Vortice?',
      description1: 'Vortice is an Italy-based ventilation brand; the catalogue lists its fans, air curtains and heat recovery units.',
      description2: 'Models, technical datasheets and specification tables are on the product pages; for duct fans, air curtains and heat recovery, you can run a preliminary calculation in the Product Selector.',
      authorizedDealer: 'Technical Data',
      ceCertified: 'Calculators',
      // REC-104 second pass: see tr.ts — the fixed two-year claim survived here.
      warranty: 'Ordering by Quote',
      premiumComfort: 'Air curtain above a door',
      authorizedDealerNotice: 'Request a quote for Vortice models by form or email.',
      highlights: [
        {
          value: '',
          label: '',
          desc: 'An Italy-based brand'
        },
        {
          value: '{aile}',
          label: 'Vortice Product Families',
          desc: 'Listed in the catalogue'
        },
        {
          value: '{model}',
          label: 'Vortice Active Models',
          desc: 'Vortice models in the catalogue'
        },
        {
          value: 'Italy',
          label: 'Country',
          desc: 'Headquarters: Tribiano (Milan)'
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
      absorbed_current_a: 'Absorbed Current',
      airflow_speed_max_ms: '2nd Stage Air Velocity',
      airflow_speed_min_ms: '1st Stage Air Velocity',
      atex_marking: 'ATEX Marking',
      atex_zone: 'ATEX Zone',
      blade_diameter_mm: 'Blade Diameter',
      co2_sensor: 'CO2 Sensor',
      compatible_model: 'Compatible Model',
      connection_height_mm: 'Connection Height',
      connection_width_mm: 'Connection Width',
      diameter_mm: 'Diameter',
      discharge_type: 'Discharge Direction',
      discharge_velocity_curve: 'Discharge Velocity Curve',
      drive_code: 'Drive Code',
      enclosure_class: 'Enclosure Type',
      enclosure_size: 'Enclosure Size',
      electrical_protection_class: 'Electrical Protection Class',
      erp_compliant: 'ErP Compliant',
      filter_classes: 'Filter Class',
      fire_rating: 'Fire Rating',
      frequency_hz: 'Frequency',
      has_bypass: 'Bypass',
      has_humidistat: 'Humidistat',
      has_timer: 'Timer',
      heating_capacity_kw: 'Heating Capacity',
      heating_power_w: 'Heater Power',
      height_mm: 'Height',
      humidity_removed_l_24h: 'Moisture Removal (24h)',
      insulation_class: 'Insulation Class',
      ip_rating: 'IP Rating',
      length_mm: 'Length',
      max_absorbed_power_w: 'Max. Absorbed Power',
      max_ambient_temp_c: 'Max. Ambient Temperature',
      max_current_a: 'Max. Current',
      max_delivery_ls: 'Max. Airflow (l/s)',
      max_delivery_m3h: 'Max. Airflow (m³/h)',
      max_operating_temperature_c: 'Max. Operating Temperature',
      max_static_pressure_pa: 'Max. Static Pressure',
      max_total_pressure_pa: 'Max. Total Pressure',
      max_voltage_v: 'Max. Voltage',
      min_delivery_m3h: 'Min. Airflow',
      min_operating_temperature_c: 'Min. Operating Temperature',
      min_static_pressure_pa: 'Min. Static Pressure',
      min_voltage_v: 'Min. Voltage',
      motor_efficiency_class: 'Motor Efficiency Class',
      motor_poles: 'Motor Poles',
      motor_type: 'Motor Type',
      noise_level_db_a: 'Sound level (manufacturer\'s declaration)',
      noise_lpa_3m_db: 'Sound Pressure (3 m)',
      nominal_delivery_m3h: 'Nominal Airflow',
      nominal_static_pressure_pa: 'Nominal Static Pressure',
      number_of_blades: 'Number of Blades',
      number_of_speeds: 'Number of Speeds',
      operating_temperature_c: 'Operating Temperature',
      optional_heater_power_w: 'Optional Heater Power',
      permissible_motor_power_w: 'Max. Permissible Motor Power',
      phase: 'Phase',
      pm10_sensor: 'PM10 Sensor',
      pm2_5_sensor: 'PM2.5 Sensor',
      pq_curve: 'P-Q Curve',
      rated_output_current_a: 'Rated Output Current',
      rated_power_w: 'Rated Power',
      refrigerant_type: 'Refrigerant Type',
      relative_humidity_sensor: 'Humidity Sensor',
      reversible: 'Reversible',
      rpm_max: 'Max. Speed',
      size_a_mm: 'Width (A)',
      size_b_mm: 'Depth (B)',
      size_c_mm: 'Height (C)',
      size_d_mm: 'Dimension (D)',
      tank_capacity_l: 'Tank Capacity',
      temp_sensor: 'Temperature Sensor',
      thermal_efficiency_curve: 'Thermal Efficiency Curve',
      thermal_efficiency_pct: 'Thermal Efficiency',
      voc_sensor: 'VOC Sensor',
      voltage_alt_v: 'Alternative Voltage',
      voltage_v: 'Voltage',
      weight_kg: 'Weight',
      width_mm: 'Width',
      wiring: 'Wiring Type'
    },
    // Teknik ozellik DEGER metinleri (URN-58) — formatSpecValue mantiksal (true/false) degeri buradan basar.
    // Ham "true"/"false" musteriye gitmez; canli kapi SPEC-HAM-DEGER yayindaki sayfada bunu olcer.
    specValues: {
      yes: 'Yes',
      no: 'No'
    },
    // Teknik ozellik GRUP basliklari — specLabel.ts 'pdp.specGroups.<grup>' yolunu arar.
    // Bunlar yoksa groupTechnicalSpecs'in HARDCODED Turkce etiketi kullaniliyordu:
    // EN sayfada da Turkce basiyordu (CLAUDE.md Kural 7 ihlali).
    specGroups: {
      performance: 'Performance Specifications',
      physical: 'Physical Dimensions',
      electrical: 'Electrical Specifications',
      other: 'Other Specifications'
    },
    variant: {
      heading: 'Model Selection',
      count: '{{count}} models',
      searchPlaceholder: 'Search model (SKU / code)',
      noMatch: 'No matching model',
      viewList: 'List',
      viewMatrix: 'Compare',
      colModel: 'Model',
      colPrice: 'Price',
      quote: 'Quote',
      selectAria: 'Select model: {{model}}',
      selectedModel: 'Selected model',
      showAll: 'View all models ({{count}})',
      singleModel: 'This family has a single model.',
    },
    videoAuthority: {
      unsupportedProvider: 'Unsupported Provider',
    },
    authorityRenderer: {
      unknownBlockType: 'Unknown Block Type:',
    },
    threeDAuthority: {
      interactiveView: '3D Interactive View',
      clickToInitialize: 'Click to Initialize Engine',
      loadingModel: 'Loading 3D Model',
      dragToRotate: 'Drag to Rotate',
    },
    productNotFound: 'Product Not Found',
    backHome: 'Back to home',
    back: 'Go Back',
    featured: 'Models',
    brand: 'Brand',
    model: 'Model',
    inStock: 'Confirmed by quote',
    outOfStock: 'Request Quote',
    vatIncluded: '(VAT Included)',
    vatExcluded: '(+VAT)',
    qty: 'Quantity:',
    addToCart: 'Get a Quote',
    techQuote: 'Request Technical Offer',
    // ⛔descFallback REMOVED (REC-148 A4, 2026-09-05) — it was a promise; the card is now
    // simply not rendered when there is no description.
    relatedProducts: 'Related Products',
    officialDistributor: 'MANUFACTURER DATA',
    priceAvailability: 'Price and Quote',
    quoteLabel: 'Quote',
    shareCopied: 'Link copied!',
    messages: {
      pdfStarted: 'Generating PDF...'
    },
    errors: {
      pdfFailed: 'Failed to generate PDF.'
    },
    labels: {
      productDescription: 'Product Description',
      category: 'Category',
      noSpecsAvailable: 'No technical specifications available for this product.',
      technicalDatasheet: 'TECHNICAL DATASHEET',
      engineeringAnalysis: 'Technical Summary',
      /** Label of the product-page code line: the value is `model_code`, not the internal SKU (URN-32). */
      modelCode: 'Model Code',
      datasheetPdf: 'DATASHEET (PDF)'
    },
    actions: {
      interactive3D: '3D VIEW',
      addToProject: 'Add to Project',
      removeFromWishlist: 'Remove from Favorites',
      addToWishlist: 'Add to Favorites',
      favorite: 'Favorite',
      share: 'Share'
    },
    certLabels: {
      standard: 'Standard',
    },
    sections: {
      general: 'General Info',
      models: 'Models',
      specs: 'Technical Specifications'
    },
    trust: {
      // REC-104: see tr.ts — freeShipping / securePayment removed.
      warranty: 'Warranty Information'
    },
    engineering: {
      noise: {
        ultraQuiet: {
          label: 'Low Noise Level',
          desc: 'Models with a sound level of {{esik1}} dB(A) or below.'
        },
        officeComfort: {
          label: 'Medium-Low Noise Level',
          desc: 'Models with a sound level between {{esik1}} and {{esik2}} dB(A).'
        },
        standard: {
          label: 'Standard Noise Level',
          desc: 'Models with a sound level between {{esik2}} and {{esik3}} dB(A).'
        },
        industrial: {
          label: 'Noise level: 60 dB(A) and above',
          desc: 'Models with a sound level above {{esik3}} dB(A).'
        }
      },
      efficiency: {
        diamond: {
          label: 'Thermal Efficiency {{esik1}}% and Above',
          desc: 'Models with a thermal efficiency of {{esik1}}% or above.'
        },
        platinum: {
          label: 'Thermal Efficiency {{esik2}}–{{esik1}}%',
          desc: 'Models with a thermal efficiency between {{esik2}}% and {{esik1}}%.'
        },
        gold: {
          label: 'Thermal Efficiency {{esik3}}–{{esik2}}%',
          desc: 'Models with a thermal efficiency between {{esik3}}% and {{esik2}}%.'
        }
      },
      motor: {
        ec: {
          label: 'EC Motor Technology',
          desc: 'Model with a brushless (EC) motor.'
        },
        ac: {
          label: 'AC Motor Technology',
          desc: 'Model with an AC motor.'
        }
      },
      capacity: {
        highFlow: {
          label: 'Airflow Capacity',
          desc: 'Models with an airflow between {{esik1}} and {{esik2}} m³/h.'
        },
        industrialFlow: {
          label: 'Airflow: above 2,000 m³/h',
          desc: 'Models with an airflow above {{esik2}} m³/h.'
        }
      }
    }
  },
  cart: {
    emptyTitle: 'Your cart is empty',
    emptyDesc: 'You haven\'t added any products yet. Explore our products to start shopping.',
    startShopping: 'Start Shopping',
    title: 'Shopping Cart',
    countLabel: '{{count}} item(s) in your cart',
    decreaseQty: 'Decrease quantity',
    increaseQty: 'Increase quantity',
    removeItem: 'Remove item',
    clearCart: 'Clear Cart',
    summary: 'Order Summary',
    subtotal: 'Subtotal',
    shipping: 'Shipping',
    free: 'Free',
    vatIncluded: 'VAT (20%, included)',
    total: 'Total',
    checkout: 'Proceed to Checkout',
    continueShopping: 'Continue Shopping',
    // REC-104: see tr.ts — securePayment removed.
    itemTotal: 'Total',
    quoteItemsNotice: 'Your cart contains items with no price yet. The total covers priced items only; request a quote for those items to continue to payment.'
  },
  orders: {
    page: {
      showingCount: 'Showing {{shown}} / {{total}} orders',
      orderLabel: 'Order',
      demoBadge: 'DEMO',
    },
    title: 'My Orders',
    subtitle: 'View and track your past orders',
    viewAll: 'View all',
    tabs: {
      overview: 'Overview',
      items: 'Items',
      shipping: 'Shipping',
      invoice: 'Invoice'
    },
    filters: 'Filters',
    status: 'Status',
    all: 'All',
    pending: 'Pending',
    paid: 'Paid',
    processing: 'Preparing',
    statusUnknown: 'Status Updating',
    shipped: 'Shipped',
    delivered: 'Delivered',
    failed: 'Failed',
    cancelled: 'Cancelled',
    refunded: 'Refunded',
    partialRefunded: 'Partial Refunded',
    startDate: 'Start Date',
    endDate: 'End Date',
    orderNumber: 'Order No',
    orderCode: 'Order Code (last 8)',
    orderCodePlaceholder: 'e.g. 7016DD05',
    noImage: 'No Image',
    unexpectedError: 'An unexpected error occurred',
    fetchError: 'Failed to load orders',
    product: 'Product',
    productSearchPlaceholder: 'Search by product name',
    clearFilters: 'Clear Filters',
    noOrdersTitle: 'No orders yet',
    noOrdersDesc: 'Discover products to place your first order',
    exploreProducts: 'Explore Products',
    details: 'Details',
    customerInfo: 'Customer Information',
    deliveryAddress: 'Delivery Address',
    orderInfo: 'Order Information',
    name: 'Name',
    email: 'Email',
    orderId: 'Order ID',
    copy: 'Copy',
    conversationId: 'Conversation ID',
    orderDetails: 'Order Details',
    productCol: 'Product',
    imageCol: 'Image',
    qtyCol: 'Qty',
    unitPriceCol: 'Unit Price',
    totalCol: 'Total',
    grandTotal: 'Grand Total',
    noItems: 'No item details found',
    totalAmount: 'Total Amount',
    reorder: 'Reorder',
    copied: 'Copied',
    copyFailed: 'Could not copy',
    reorderedToast: '{{count}} items added to cart',
    reorderNotFound: 'Items not found in stock',
    reorderError: 'Error during reorder',
    /** The item's CURRENT catalog model code (not an order-time snapshot); never the raw SKU. */
    modelCodeLabel: 'Model Code: {{code}}',
    shippingInfo: 'Shipping / Tracking',
    carrier: 'Carrier',
    trackingNumber: 'Tracking Number',
    trackingLink: 'Tracking Link',
    openLink: 'Open link',
    shippedAt: 'Shipped At',
    deliveredAt: 'Delivered At',
    noShippingInfo: 'No shipping info available.',
    invoicePdf: 'Proforma (PDF)',
    empty: 'You have no orders yet.',
    orderDate: 'Order Date',
    orderNo: 'Order No',
  },
  auth: {
    pwStrength: {
      weak: 'Weak',
      fair: 'Fair',
      good: 'Good',
      strong: 'Strong',
      label: 'Strength',
    },
    pwRule: {
      length: 'At least 8 characters',
      upper: 'At least 1 uppercase letter',
      digit: 'At least 1 digit',
      special: 'At least 1 special character',
      allRequired: 'Your password must meet all security requirements',
    },
    forgot: {
      spamHint: '💡 If the email doesn\'t arrive, don\'t forget to check your spam folder',
    },
    callback: {
      loadingTitle: 'Verifying Email...',
      loadingDesc: 'Please wait while your account is being verified.',
      successTitle: 'Verification Successful!',
      errorTitle: 'Verification Error',
      successRedirect: 'Email verified successfully! Redirecting you to the homepage...',
      successToast: 'Email verified successfully!',
      verifyError: 'An error occurred during email verification: {{message}}',
      invalidLink: 'The verification link is invalid or has expired',
      recoveryRedirect: 'Link verified! Redirecting you to the new password screen...',
    },
    reset: {
      title: 'Set a New Password',
      subtitle: 'Create a new password for your account',
      checking: 'Verifying link...',
      invalidTitle: 'Invalid Link',
      invalidDesc: 'The password reset link is invalid or has expired. Please request a new one.',
      requestNew: 'Request New Link',
      submit: 'Update Password',
      updating: 'Updating...',
      success: 'Your password has been updated successfully',
      updateError: 'Could not update the password. Please try again.',
    },
    registerForm: {
      requiredMark: '*',
    },
    loginForm: {
      googleButton: 'Sign in with Google',
    },
    back: 'Back',
    loginTitle: 'Sign In',
    loginSubtitle: 'Sign in to your VentHub account',
    email: 'Email Address',
    password: 'Password',
    forgotPassword: 'Forgot Password',
    resetSubtitle: 'Enter your email to reset your password. We will send you a link.',
    sendResetLink: 'Send Reset Link',
    loggingIn: 'Signing in...',
    submitting: 'Submitting...',
    login: 'Sign In',
    rememberMe: 'Remember me',
    noAccount: 'Don\'t have an account?',
    register: 'Sign Up',
    validEmailPassRequired: 'Email and password are required',
    required: 'is required',
    emailInvalid: 'Invalid email address',
    invalidCreds: 'Email or password is incorrect',
    emailNotConfirmed: 'You need to confirm your email address',
    genericLoginError: 'An error occurred during sign in',
    loginSuccess: 'Login successful!',
    orContinueWith: 'or continue with',
    registerNow: 'Register Now',
    unexpectedError: 'An unexpected error occurred',
    sessionExpired: 'Your session has expired. Please sign in again.',
    userNotFound: 'User not found with this email',
    resetError: 'Failed to send reset request',
    resetEmailSent: 'Reset password email sent',
    registerTitle: 'Sign Up',
    registerSubtitle: 'Join VentHub and enjoy exclusive benefits',
    name: 'Full Name',
    confirmPassword: 'Confirm Password',
    passwordMin: 'Password must be at least 8 characters',
    passwordsDontMatch: 'Passwords do not match',
    passwordPwned: 'This password has appeared in data breaches. Please choose a different, stronger password.',
    registrationEmailSent: 'A verification link has been sent to your email. Please verify your account.',
    registering: 'Signing up...',
    alreadyHave: 'Already have an account?',
    emailAlready: 'This email address is already in use',
    registrationComplete: 'Registration Complete!',
    backHome: 'Back to Home',
    emailSentTitle: 'Email Sent!',
    emailSentDesc: 'A password reset link has been sent to {{email}}. Please check your email and click the link to set your new password.',
    backToLogin: 'Back to Login',
    tryAnotherEmail: 'Try Another Email',
    registrationCompleteTitle: 'Registration Complete!',
    registrationCompleteDesc: 'A verification link has been sent to your email. Please verify your account to complete registration.',
    or: 'or',
    googleSignInFail: 'Could not start Google sign-in',
    googleSignInError: 'Unexpected error during Google sign-in',
    features: {
      secure: 'Secure',
      fast: 'Fast',
      mobile: 'Mobile Friendly'
    },
    errors: {
      nameRequired: 'Full name is required'
    }
  },
  cartToast: {
    added: 'Product added to cart!',
    continue: 'Continue Shopping',
    goToCart: 'Go to Cart',
    autoClose: 'This window will close automatically in 5 seconds'
  },
  checkout: {
    // Shown when the payment path is CLOSED.
    // The decision lives in one place: app/[lang]/checkout/page.tsx. The CARRIER of that
    // decision is deliberately not named here, so this line does not go quietly stale.
    kapali: {
      // REC-148 A7 — OPS ruling, K1a: the sales mode is CLOSED, not absent.
      baslik: 'We are in quote mode; ordering and payment are closed.',
      aciklama: 'Online payment is not open yet; you can request a quote to place an order.',
      whatsappCta: 'Request a quote on WhatsApp',
      emailCta: 'Request a quote by email',
    },
    securePayment: {
      brand: 'Venthub HVAC',
      iyzicoSecure: 'Secure payment with iyzico',
    },
    orderSummary: {
      couponPlaceholder: 'Coupon code',
      couponApplyFailed: 'Could not apply coupon',
      applyCoupon: 'Apply',
      removeCoupon: 'Remove',
    },
    invoiceModal: {
      title: 'Saved Invoice Profiles',
    },
    addressModal: {
      defaultOpen: '(',
      defaultClose: ')',
      empty: '—',
    },
    addressStep: {
      standardName: 'Standard',
      standardEta: 'Clarified at the quote stage',
      expressName: 'Express',
      expressEta: 'Clarified at the quote stage',
    },
    saved: {
      title: 'Saved Addresses',
      address: 'Address',
      labelPlaceholder: 'Home, Work etc.',
      default: 'Default',
      use: 'Use this address',
      manage: 'Manage addresses',
      seeAll: 'See all addresses',
      select: 'Select address',
      close: 'Close',
      edit: 'Edit',
      delete: 'Delete',
      save: 'Save',
      cancel: 'Cancel',
      defaultShipping: 'Default for shipping',
      defaultBilling: 'Default for billing',
      updated: 'Address updated',
      deleted: 'Address deleted',
      updateError: 'Error during update',
      deleteError: 'Error during delete',
      confirmDelete: 'Are you sure you want to delete this address?'
    },
    title: 'Checkout',
    backToCart: 'Back to Cart',
    securePaymentBrand: 'Secure payment • {{brand}}',
    securePaymentProvider: '{{provider}} with 256‑bit SSL encryption',
    summaryTitle: 'Order Summary',
    summaryThumb: 'Item',
    couponDiscount: 'Coupon discount ({{code}})',
    paymentSectionTitle: 'Payment',
    paymentLoading: 'Payment form is loading. Please complete 3D verification. This page will refresh automatically when finished.',
    formPreparing: 'Preparing form...',
    paymentSuccess: '🎉 Payment completed successfully!',
    paymentError: 'An error occurred during payment',
    steps: {
      step1: 'Personal Info',
      step2: 'Address Info',
      step3: 'Review',
      step4: 'Payment'
    },
    overlay: {
      dialogLabel: 'Starting secure payment',
      header: 'Starting secure payment…',
      starting: 'Starting payment',
      secureForm: 'Loading secure form',
      bank3d: 'Bank 3D verification',
      stageInit: 'Starting',
      stageForm: 'Secure form',
      stageBank: 'Bank 3D',
      dontClose: 'Do not close this page or go back during this process. It may take a few seconds.'
    },
    help: {
      smsTitle: 'Didn\'t receive the code?',
      tip1: 'Wait 30–60s and try again (your bank may send SMS with delay).',
      tip2: 'If no signal/airplane mode issues, try a different card/device.',
      tip3: 'Verify your phone number and contact your bank.'
    },
    personal: {
      title: 'Your Personal Information',
      nameLabel: 'Full Name *',
      namePlaceholder: 'Your full name',
      emailLabel: 'Email Address *',
      emailPlaceholder: 'name@example.com',
      phoneLabel: 'Phone Number *',
      phonePlaceholder: '+90 (5xx) xxx xx xx',
      idLabel: 'National ID (Optional)',
      idPlaceholder: '12345678901'
    },
    shipping: {
      methodTitle: 'Delivery Method',
      title: 'Shipping Address',
      addressLabel: 'Address *',
      addressPlaceholder: 'Street, building, door no, apartment no',
      cityLabel: 'City *',
      cityPlaceholder: 'Istanbul',
      districtLabel: 'District *',
      districtPlaceholder: 'District',
      postalLabel: 'Postal Code *',
      postalPlaceholder: 'Postal code'
    },
    billing: {
      title: 'Billing Address',
      sameAsShipping: 'Same as shipping address',
      addressLabel: 'Billing Address *',
      addressPlaceholder: 'Billing address',
      cityLabel: 'City *',
      cityPlaceholder: 'City',
      districtLabel: 'District *',
      districtPlaceholder: 'District',
      postalLabel: 'Postal Code *',
      postalPlaceholder: 'Postal code'
    },
    invoice: {
      title: 'Invoice Type & Details',
      individual: 'Individual',
      corporate: 'Corporate',
      tcknLabel: 'National ID *',
      tcknPlaceholder: '11-digit ID',
      companyLabel: 'Company Name *',
      companyPlaceholder: 'e.g., Venthub Engineering Inc.',
      vknLabel: 'Tax ID (VKN) *',
      vknPlaceholder: '10-digit Tax ID',
      taxOfficeLabel: 'Tax Office *',
      taxOfficePlaceholder: 'e.g., Kadikoy',
      eInvoice: 'I am an e-Invoice taxpayer',
      noProfile: 'No invoice profile added yet.'
    },
    consents: {
      title: 'Legal Consents',
      readAcceptPrefix: 'I have read and accept the ',
      readAcceptSuffix: '',
      orderConfirmText: 'I confirm the order and accept the accuracy of product and delivery information.',
      marketingText: 'I consent to receive commercial communications (optional).'
    },
    review: {
      tckn: 'ID No: {{value}}',
      cityLine: '{{district}}, {{city}} {{postal}}',
      vkn: 'Tax No: {{value}}',
      eInvoice: 'e‑Invoice',
      title: 'Review your order',
      edit: 'Edit'
    },
    nav: {
      back: 'Back',
      next: 'Continue',
      proceedPayment: 'Proceed to Payment',
    },
    security: {
      secureNote: 'Your payment information is securely encrypted'
    },
    emptyCart: {
      title: 'Your cart is empty',
      desc: 'You need items in your cart to access the checkout page.',
      startShopping: 'Start Shopping'
    },
    priceUpdated: 'Prices have been updated; the payment is continuing.',
    errors: {
      priceVerificationFailed: 'Payment could not be started because prices cannot be verified right now. Please try again in a few minutes.',
      nameRequired: 'Full name is required',
      emailInvalid: 'Please enter a valid email address',
      phoneRequired: 'Phone number is required',
      addressRequired: 'Address is required',
      consentsRequired: 'To continue, please tick the KVKK, Distance Sales Agreement, Pre-Information Form and order confirmation boxes.',
      locationRequired: 'Please enter your city and district',
      cityRequired: 'City is required',
      districtRequired: 'District is required',
      postalRequired: 'Postal code is required',
      tcknRequired: 'For orders above {{limit}} the invoice must carry the buyer\'s national ID number. Please enter yours.',
      tcknFormat: 'Enter a valid national ID number (11 digits). Your invoice is issued using this detail.',
      companyRequired: 'Company name is required for corporate invoice',
      vknRequired: 'Tax ID (VKN) is required for corporate invoice',
      vknFormat: 'Enter a valid tax ID (VKN, 10 digits). Your invoice is issued using this detail.',
      taxOfficeRequired: 'Tax office is required for corporate invoice',
      kvkkRequired: 'KVKK consent is required',
      distanceSalesRequired: 'Distance sales agreement consent is required',
      preInfoRequired: 'Pre-information form consent is required',
      orderConfirmRequired: 'Please confirm the order',
      paymentInit: 'An error occurred while starting payment',
      paymentFormRenderTitle: 'Payment form could not be opened',
      paymentFormRender: 'The secure payment form failed to load. Your card has NOT been charged. Please try again; if the problem persists, contact us.',
      paymentRetry: 'Try again',
      validation: 'Some form fields are missing or invalid. Please check.',
      database: 'Database error. Please try again.',
      paymentError: 'An error occurred during payment',
      itemPriceMissing: 'Payment could not be started because your cart contains items with no price. Please request a quote for those items.'
    }
  },
  payment: {
    verifyingTitle: 'Verifying payment...',
    verifyingDesc: 'We are confirming the transaction with your bank. Please wait a moment.',
    failedTitle: 'Payment Failed',
    retry: 'Try Again',
    // REC-355 Phase 1: payment captured but order match unverified (needs_review).
    // This screen NEVER offers "try again" — the money is taken; a retry risks a double charge.
    reviewTitle: 'Payment Received, Verification in Progress',
    reviewDesc: 'Your payment was received from your bank. Your order stays pending until the payment is matched to it and confirmed.',
    reviewWarning: 'Please do not pay again. For any questions, you can write to info@venthub.com.tr.',
    reviewBackHome: 'Back to Home',
    orderCompletedTitle: 'Your Order is Complete!',
    orderNoLabel: 'Order No',
    orderCompletedDesc: 'Your order has been received successfully. A confirmation email will be sent shortly.',
    dateLabel: 'Date',
    itemsCountLabel: 'Items',
    securedBy3d: '',
    viewOrderDetails: 'View Order Details',
    failedGeneric: 'Payment could not be completed',
    failedToast: 'Payment failed: {{msg}}',
    verifyError: 'Verification error',
    errorDuring: 'Error: {{msg}}',
    unverified: 'Payment could not be verified',
    unexpected: 'An unexpected error occurred'
  },
  brands: {
    page: {
      statGlobal: '{marka}',
    },
    sectionTitle: 'Brands in the Catalogue',
    sectionSubtitle: 'Browse AVenS, Casals, Danfoss, Nicotra Gebhardt, SEAT and Vortice products and their specifications.',
    subtitlePart1: 'Our',
    subtitlePart2: 'Brands',
    viewAll: 'See All Brands',
    pageTitle: 'Brands',
    pageSubtitle: 'Explore the product families, models and technical specifications of the brands that have products in the catalogue.',
    eyebrow: 'Brand Catalogue',
    exploreBrand: 'Explore Brand',
    seoDesc: 'Industrial ventilation and HVAC brands in the VentHub catalog. Browse the product families, models and technical specifications of each brand.',
    seoYedekUzmanlik: 'Browse {{uzmanlik}} products in the VentHub catalogue.',
    seoYedek: 'Browse the product families, models and technical specifications of {{ad}} in the VentHub catalog.',
    // OPS-51: meta description of the brand page without products (same fact as the page body; no product/time promise).
    seoUrunsuz: '{{ad}} products are not yet in the VentHub catalog; contact us for product information and a quote.',
    notFound: 'Brand not found',
    backToAll: 'Back to all brands',
    aboutBrand: 'information',
    trust: {
      eyebrow: 'Ordering',
      title: 'Ordering by Quotation',
      description: 'Online payment is not open yet; request a quote to place an order. Delivery time and shipping terms are settled at the quotation stage.',
      original: 'Technical specification tables',
      standard: 'Brands with products in the catalogue',
      imageAlt: 'Technical Infrastructure and HVAC Installation'
    },
    detail: {
      curatedSolutions: 'Catalogue Products',
      heritage: 'Brand Information',
      authorityTitle: 'About the Brand',
      globalVision: 'In the Catalogue',
      globalVisionDesc: '{{ad}} has {aile} product families and {model} models in the VentHub catalogue.',
      technicalExcellence: 'Technical Data',
      technicalExcellenceDesc: 'Product pages carry datasheets and specification tables.',
      corporateSnapshot: 'Corporate Snapshot',
      headquarters: 'Headquarters',
      webAuthority: 'Website',
      officialSite: 'Official Site',
      requestCatalog: 'Request a Quote',
      featuredSystems: 'Product Families',
      allProductGroups: 'All Product Families',
      // REC-148 A6: was "will be added soon" — a promise with no guarantee behind it.
      noProducts: 'This brand has no products in the catalogue yet.',
      // OPS-51 (decision 265 + OPS ruling): ONLY for a brand with zero active products in the DB (currently Flexiva); the
      // decision is derived on the server from the active product count (`markaUrunDurumu.ts`), no static flag.
      // NO time promise (INV-VAAT-SIZINTI-2 / REC-148): fact + action — not in the catalogue, request a quote.
      productsOnRequest: '{{ad}} products are not in the catalogue yet; you can use the contact form for questions.',
      productsOnRequestCta: 'Go to the contact form',
      // URN-79: brand page summary sentences derived from the DB (instead of manufacturer praise). Placeholders: {{ad}} brand
      // name, {{sayi}} number of families with active products, {{kategoriler}} / {{aileler}} comma-separated names,
      // {{diger}} number of families not listed. None of the sentences makes a superiority/benchmark claim — catalogue facts only.
      catalogSummary: 'Product families of {{ad}} in the VentHub catalog: {{sayi}}.',
      catalogCategories: 'Categories: {{kategoriler}}.',
      catalogFamilies: 'Product families: {{aileler}}.',
      catalogFamiliesMore: 'Product families: {{aileler}} and {{diger}} more.',
      originSuffix: 'Origin',
      estPrefix: 'EST.',
      // REC-98: "Corporate Snapshot" satirlarinin ETIKETLERI. Deger tarafi veri olarak
      // `BRAND_DETAILS` icinde tasinir; etiket burada, cunku arayuz metnidir.
      statCountries: '',
      statGroup: 'Group',
      statProduction: 'Manufacturing',
      statWarranty: 'Models',
      statExperience: 'Product Families',
      statExpertise: 'Product Type',
      statQuality: 'Category'
    }
  },
  quickView: {
    title: 'Quick View',
    close: 'Close',
    addToCart: 'Add to quote list',
    viewProduct: 'View Product',
    // ⛔descFallback REMOVED (REC-148 A5) — no description, no paragraph.
  },
  support: {
    contactCta: {
      title: 'Couldn\'t find the answer you were looking for?',
      subtitle: 'Send your question via the contact form or info@venthub.com.tr.',
      button: 'Ask by email',
    },
    links: {
      faq: 'FAQ',
      returns: 'Returns & Exchanges',
      shipping: 'Shipping & Delivery',
      warranty: 'Warranty & Service'
    },
    home: {
      subtitle: 'Quickly find the information you need.',
      warrantyDesc: 'Coverage may vary by manufacturer or importer',
    },
    // Page metadata (meta description) — see tr.ts.
    seo: {
      faqTitle: 'Frequently Asked Questions',
      faq: 'Frequently asked questions about quotes, payment and installation, with answers.',
      shipping: 'Information on delivery times, shipping costs and shipment tracking.',
      returns: 'Right of withdrawal, return conditions and how to request a return.',
      warranty: 'Warranty coverage and keeping your warranty documents.',
    },
    returns: {
      title: 'Returns & Exchanges',
      // REC-104: see tr.ts — status note above the legal terms.
      onlineKapaliNotu: 'Online sales are currently closed; the terms below apply once online sales open.',
      desc1: 'You may use your right of withdrawal within 14 days. The product must be unused and resalable with invoice and all accessories included.',
      desc2: 'For a return request, please write via the contact form or email with your order number.'
    },
    shipping: {
      desc1: 'Delivery time and shipping terms are clarified at the quote stage, depending on your project.',
      // REC-104: see tr.ts — checkout reference replaced with the quote.
      desc2: 'The shipping fee and carrier are stated in your quote. Tracking number will be sent via email.'
    },
    warranty: {
      desc1: 'Warranty coverage may vary by manufacturer/importer. Please keep the warranty card and user manual.',
      desc2: 'You can send service and fault questions via the contact form or email.'
    },
    faq: {
      // REC-104: see tr.ts — aligned with the checkout.kapali copy.
      q1: 'How can I submit a request for a quote?',
      a1: 'You can request a quote through the contact form or by email.',
      q2: 'What are the payment methods?',
      a2: 'Our store is still being set up, so online payment is not open yet. You can request a quote from us to place an order.',
      q3: 'How can I send an installation question?',
      a3: 'You can send installation questions via the contact form or email.'
    }
  },
  account: {
    tabs: {
      overview: 'Overview',
      orders: 'Orders',
      shipments: 'Shipments',
      addresses: 'Addresses',
      invoices: 'Invoices',
      returns: 'Returns',
      quotes: 'My Quotes',
      profile: 'Profile',
      security: 'Security',
      ordersGroup: 'Orders & Shipping',
      accountGroup: 'Account Management',
      listsGroup: 'My Lists',
      favorites: 'Favorites',
      projects: 'Projects',
      dataRequests: 'KVKK Request'
    },
    dataRequests: {
      title: 'My KVKK Request',
      subtitle: 'Submit requests about your personal data here and follow the process',
      typeLabel: 'Request Type',
      submit: 'Submit Request',
      submitted: 'Your request has been received',
      submitError: 'Could not submit the request',
      authRequired: 'You need to sign in to submit a request',
      loadError: 'Could not load your requests',
      myRequests: 'My Requests',
      emptyDesc: 'You have no requests yet.',
      receivedAt: 'Received: {{date}}',
      daysLeft: '{{days}} days left to respond',
      overdue: 'Statutory deadline exceeded',
      finalized: 'Finalized',
      retainedLabel: 'Retained data',
      noticeTitle: 'What you should know',
      noticeBody: 'Your request is recorded with the email address on your account and will be resolved free of charge within 30 days at the latest. For erasure requests, order and invoice records we are legally required to keep are not deleted; they are anonymised so they can no longer be linked to you, and you are informed in writing which data was retained and why.',
      types: {
        access: 'I want to access / learn about my data',
        rectification: 'I want my data corrected',
        erasure: 'I want my data erased',
        portability: 'I want my data transferred',
        objection: 'I object to the processing',
        restriction: 'I want the processing restricted',
      },
      statuses: {
        received: 'Received',
        identity_pending: 'Awaiting identity verification',
        in_progress: 'Under review',
        completed: 'Completed',
        rejected: 'Rejected',
      },
    },
    favorites: {
      title: 'My Favorites',
      subtitle: 'Keep the products you like in one place',
      emptyTitle: 'No favorites yet',
      emptyDesc: 'Use the heart icon on product pages to add favorites.',
      browseCta: 'Browse Products',
      remove: 'Remove from favorites',
      loadError: 'Could not load favorites',
    },
    projects: {
      title: 'My Projects',
      subtitle: 'Manage your project lists and group products by project',
      create: 'Create',
      emptyTitle: 'No projects yet',
      emptyDesc: 'Create a new project above, or start with "Add to Project" on a product page.',
      deleteProject: 'Delete project',
      deleteConfirm: 'Are you sure you want to delete this project and its product list?',
      noItems: 'No products in this project yet.',
      removeItem: 'Remove from project',
      qty: 'Qty: {{count}}',
      toasts: {
        authRequired: 'You need to sign in.',
        created: 'Project created successfully.',
        createError: 'Could not create the project.',
        deleted: 'Project deleted.',
        deleteError: 'Could not delete the project.',
        itemAdded: 'Product added to the project.',
        itemAddError: 'Could not add the product.',
        itemRemoved: 'Product removed from the project.',
        itemRemoveError: 'Could not remove the product.',
      },
    },
    orderDetail: {
      shippingMethod: 'Shipping Method',
      express: 'Express',
      standard: 'Standard',
      expressDetail: 'Express (timing in your quote)',
      standardDetail: 'Standard (timing in your quote)',
      invoiceInfo: 'Invoice Details',
      typeLabel: 'Type:',
      companyTitleLabel: 'Title:',
      vknLabel: 'Tax No (VKN):',
      taxOfficeLabel: 'Tax Office:',
      tcknLabel: 'ID No (TCKN):',
      legalConsents: 'Legal Consents',
      consentAccepted: 'Accepted',
      consentNone: 'No Consent',
      consentDistanceSales: 'Distance Sales',
      consentPreInfo: 'Preliminary Information',
      consentOrderConfirm: 'Order Confirmation',
      consentMarketing: 'Marketing Consent',
      orderNoSuffix: ': {{code}}',
      demoBadge: 'DEMO',
    },
    returns: {
      subtitle: 'Create your return requests and track their status.',
      filterStatus: 'Status:',
      filterAll: 'All ({{count}})',
      emptyTitle: 'You have no return requests yet',
      orderLabel: 'Order {{code}}',
      reasonField: 'Return Reason',
      descriptionField: 'Description',
      processTitle: 'Return Process',
      reasonWrongProduct: 'Wrong product/missing part',
      reasonDamaged: 'Damaged product',
      reasonIncompatible: 'Incompatible/not as specified',
      reasonChangedMind: 'Changed my mind',
      reasonOther: 'Other',
      timelineRequested: 'Request Received',
      timelineApproved: 'Approved',
      timelineInTransit: 'In Transit (Return)',
      timelineReceived: 'Return Received',
      timelineRefunded: 'Refund Paid',
    },
    overview: {
      shippingAddress: 'Shipping Address',
      billingAddress: 'Billing Address',
      activeOrders: 'Active Orders',
      completedOrders: 'Completed',
      greeting: 'Hello,',
      totalVolume: 'Total Volume',
      welcomeMessage: 'Welcome to your B2B portal. You can manage your operations here.',
      defaultPartnerName: 'Valued Partner',
      loadingDashboard: 'Preparing Dashboard...',
      liveTracking: 'Live Shipment Tracking',
      orderPrefix: 'Order',
      inTransitSuffix: 'is on the way.',
      noActiveShipment: 'You currently have no active shipments on the way.',
      viewAllShipments: 'View All Shipments',
      noDeliveryHint: 'You have no active deliveries. When you place a new order, you can track its shipping live from here.',
      browseCatalog: 'Browse Catalog',
      recentOrders: 'Your Recent Orders',
      viewAll: 'View All',
      noOrders: 'You have no past orders yet.',
      orderNumber: 'Order {{code}}',
      shippingBillingTitle: 'Shipping & Billing',
      defaultShipping: 'Default Shipping',
      defaultBilling: 'Default Billing',
      noShippingAddress: 'No shipping address defined.',
      noBillingAddress: 'No billing address defined.',
      manageAddressesBtn: 'Manage Addresses',
      securityCenter: 'Security Center',
      securityCenterDesc: 'Securely manage your password, 2FA settings, and session information.',
      viewSecurity: 'View',
      needHelp: 'Need support?',
      needHelpDesc: 'For orders, returns or balance, write to info@venthub.com.tr.',
      customerService: 'Customer Service',
      wave: '👋',
      orderHash: '{{code}}',
      shipStatus: {
        delivered: 'Delivered',
        shipped: 'Shipped',
        preparing: 'Preparing',
        awaitingPayment: 'Awaiting Payment'
      },
      shipSteps: {
        preparing: 'Prepared',
        shipped: 'Shipped',
        delivered: 'Delivered'
      }
    },
    addresses: {
      fields: {
        label: 'Address Label',
        fullName: 'Full Name / Company',
        phone: 'Phone',
        addressLine: 'Full Address',
        city: 'City',
        district: 'District',
      },
      placeholders: {
        label: 'Home, Work, Warehouse, etc.',
        fullName: 'Person or Company name',
        addressLine: 'Neighborhood, street, building and apartment no...',
      },
      subtitle: 'Manage your addresses to easily select them in your orders.',
      loading: 'Loading addresses...',
      emptyTitle: 'No Address Added Yet',
      emptyDescription: 'You can add a new shipping or billing address using the form in the right panel.',
      shipping: 'Shipping',
      billing: 'Billing',
      defaultTag: 'Default',
      cityLine: '{{district}}, {{city}} {{postal}}',
      title: 'My Addresses',
      addressLabel: 'Address',
      noItems: 'No addresses added yet.',
      formTitleEdit: 'Edit Address',
      formTitleNew: 'New Address',
      ph: {
        label: 'Label (Home, Office)',
        fullName: 'Full Name',
        phone: 'Phone',
        address: 'Address',
        city: 'City',
        district: 'District',
        postalCode: 'Postal Code'
      },
      toggle: {
        shippingDefault: 'Default for shipping',
        billingDefault: 'Default for billing'
      },
      makeDefault: 'Make Default',
      unregistered: 'Unregistered Title',
      cancel: 'Cancel',
      submit: {
        update: 'Update',
        add: 'Add'
      },
      toasts: {
        loadError: 'Failed to load addresses',
        requiredFields: 'Please fill in required fields',
        updated: 'Address updated',
        created: 'Address created',
        saveError: 'Error while saving',
        confirmDelete: 'Are you sure you want to delete this address?',
        deleted: 'Address deleted',
        deleteError: 'Error while deleting',
        defaultSetShipping: 'Default shipping address set',
        defaultSetBilling: 'Default billing address set',
        updateError: 'Error while updating'
      }
    },
    invoices: {
      loadError: 'Failed to load invoice profiles',
      requiredFields: 'Please fill in the required fields',
      profileUpdated: 'Profile updated',
      profileCreated: 'Profile created',
      operationFailed: 'Operation failed',
      confirmDeleteShort: 'Are you sure you want to delete?',
      profileDeleted: 'Profile deleted',
      deleteFailed: 'Deletion failed',
      madeDefault: 'Set as default profile',
      editProfile: 'Edit Profile',
      newProfile: 'New Invoice Profile',
      firstNamePlaceholder: 'First Name',
      lastNamePlaceholder: 'Last Name',
      companyNamePlaceholder: 'Company Name',
      tcknPlaceholder: 'National ID (TCKN)',
      vknPlaceholder: 'Tax Number (VKN)',
      cityPlaceholder: 'City',
      districtPlaceholder: 'District',
      addressPlaceholder: 'Address Details',
      makeDefaultLabel: 'Set as Default Profile',
      pageTitle: 'My Invoice Profiles',
      pageSubtitle: 'Manage your invoice information here.',
      empty: 'No profiles added yet',
      title: 'Invoice Profiles',
      type: 'Type',
      individual: 'Individual',
      corporate: 'Corporate',
      tcknLabel: 'National ID',
      companyLabel: 'Company Name',
      vknLabel: 'Tax ID (VKN)',
      taxOfficeLabel: 'Tax Office',
      eInvoice: 'I am an e‑Invoice taxpayer',
      setDefault: 'Make Default',
      default: 'Default',
      save: 'Save',
      delete: 'Delete',
      cancel: 'Cancel',
      confirmDelete: 'Are you sure you want to delete this invoice profile?',
      created: 'Invoice profile created',
      updated: 'Invoice profile updated',
      deleted: 'Invoice profile deleted',
    },
    profile: {
      title: 'Profile Information',
      subtitle: 'You can update your basic personal information here.',
      fullName: 'Full Name',
      fullNamePlaceholder: 'Ex: John Doe',
      phone: 'Phone Number',
      phonePlaceholder: 'Ex: +1 555 123 4567',
      saving: 'Saving...',
      save: 'Save Changes',
      toastSuccess: 'Profile updated',
      toastError: 'Error during update'
    },
    security: {
      pageSubtitle: 'Keep your password up to date and manage your linked sign-in methods for account security.',
      changePasswordDesc: 'Choose a strong password with letters, numbers and special characters for account security.',
      strengthPrefix: 'Strength:',
      strengthWeak: 'Weak',
      strengthMedium: 'Medium',
      strengthGood: 'Good',
      strengthStrong: 'Strong',
      ruleLength: 'At least 8 characters',
      ruleUpper: 'At least 1 uppercase letter',
      ruleDigit: 'At least 1 number',
      ruleSpecial: 'At least 1 special character',
      googleLabel: 'Google',
      title: 'Change Password',
      currentLabel: 'Current password',
      newLabel: 'New password',
      confirmLabel: 'New password (confirm)',
      save: 'Save',
      currentRequired: 'Please enter your current password',
      mismatch: 'Passwords do not match',
      pwned: 'This password has appeared in data breaches. Please choose a different, stronger password.',
      wrongCurrent: 'Current password is incorrect',
      updated: 'Your password has been updated',
      updateError: 'An error occurred while updating password',
      connect: 'Connect',
      connected: 'Connected',
      disconnect: 'Disconnect',
      disconnected: 'Disconnected',
      emailPassword: 'Email & Password',
      linkedAccountsNote: 'Different login methods with the same email may create separate accounts. You can link your Google account to your current account here to manage your accounts in a single center.',
      linkedAccountsSubtitle: 'You can link your social accounts for one-click login.',
      linkedAccountsTitle: 'Linked Login Methods',
      oneClickLogin: 'One-click login',
      rulesNotMet: 'Your password must meet all security rules',
      saving: 'Updating...',
      standardMethod: 'Standard login method',
      toasts: {
        cannotRemoveLast: 'You cannot remove the last login method',
        googleIdNotFound: 'Google ID not found',
        googleLinkFailed: 'Google linking failed',
        googleLinkStarted: 'Google account linking process started',
        googleUnlinkFailed: 'Failed to unlink Google account',
        googleUnlinked: 'Google account unlinked',
        unlinkUnsupported: 'unlinkIdentity API is not supported'
      }
    },
    shipments: {
      statusDelivered: 'Delivered',
      statusShipped: 'In Transit',
      statusPreparing: 'Preparing',
      statusAwaitingPayment: 'Awaiting Payment',
      stepShipped: 'Shipped',
      stepDelivered: 'Delivered',
      subtitle: 'Track the shipping status and tracking details of your orders here.',
      statusFilterLabel: 'Status:',
      filterAll: 'All ({{count}})',
      filterShipped: 'In Transit ({{count}})',
      filterDelivered: 'Delivered ({{count}})',
      emptyTitle: 'No shipping information yet',
      noFilterMatch: 'No shipments match this filter.',
      orderTitle: 'Order {{code}}',
      detail: 'Detail',
      copy: 'Copy',
      trackShipment: 'Track Shipment',
      goToOrders: 'Go to My Orders',
      preparingLabel: 'Prepared'
    }
  },
  returns: {
    title: 'Return Requests',
    new: 'New Return Request',
    empty: 'You have no return requests yet.',
    order: 'Order',
    reason: 'Reason',
    status: 'Status',
    created: 'Created',
    selectOrder: 'Select order',
    selectReason: 'Select reason',
    description: 'Description (optional)',
    descriptionPh: 'Briefly describe the issue (optional)',
    submit: 'Create Request',
    required: 'Please select order and reason',
    createdToast: 'Return request created',
    createError: 'Could not create return request',
    fetchError: 'Could not load return records',
    requestReturn: 'Request Return',
    statusLabels: {
      requested: 'Requested',
      approved: 'Approved',
      rejected: 'Rejected',
      in_transit: 'In transit',
      received: 'Received',
      refunded: 'Refunded',
      cancelled: 'Cancelled'
    }
  },
  quotes: {
    title: 'My Quote Requests',
    subtitle: 'Track your quote requests and their status here.',
    empty: 'You have no quote requests yet.',
    emptyHint: 'For products without a visible price, use "Request Quote" to open a request.',
    fetchError: 'Could not load quote records',
    itemsCount: '{{count}} items',
    requestCta: 'Request Quote',
    request: {
      title: 'Request Quote',
      itemsTitle: 'Requested Items',
      qty: 'Qty',
      contactName: 'Full name',
      contactNamePh: 'Person the quote will be issued to',
      contactPhone: 'Phone',
      contactPhonePh: '+90 5xx xxx xx xx',
      contactEmailNote: 'The quote will be sent to this email address',
      contactEmail: 'Email',
      contactEmailPh: 'you@company.com',
      contactEmailGuestNote: 'Your quote and updates will be sent to this address',
      contactRequired: 'Full name, phone and email are required — a quote must name its recipient',
      kvkkConsent: 'I have read the privacy notice',
      kvkkRequired: 'Please confirm you have read the privacy notice to continue',
      duplicateToast: 'You have just sent this request; it has been received.',
      rateLimitToast: 'Too many requests sent; please try again a little later',
      guestSignupInvite: 'Create an account to track this request and your future quotes.',
      guestSignupCta: 'Create Account',
      note: 'Note (optional)',
      notePh: 'A short note about your project/needs (optional)',
      submit: 'Send Quote Request',
      cancel: 'Cancel',
      successToast: 'Your quote request has been received',
      errorToast: 'Could not create quote request',
    },
    detail: {
      title: 'Quote Detail',
      requestedAt: 'Requested At',
      itemsTitle: 'Items',
      product: 'Product',
      qty: 'Qty',
      unitPrice: 'Unit Price',
      lineTotal: 'Amount',
      validUntil: 'Valid Until',
      total: 'Total',
      note: 'Note',
      awaitingPricing: 'Your request has been received; pricing is pending.',
      accept: 'Accept Quote',
      reject: 'Reject Quote',
      acceptConfirm: 'Are you sure you want to accept this quote?',
      rejectConfirm: 'Are you sure you want to reject this quote?',
      decisionSuccess: 'Your decision has been saved',
      decisionError: 'Could not save your decision',
      acceptedNext: 'You accepted the quote. For questions, write to info@venthub.com.tr.',
      backToList: 'Back to my quotes',
      notFound: 'Quote not found'
    },
    sourceLabels: {
      pdp: 'Product page',
      cart: 'Cart',
      project: 'Project'
    },
    statusLabels: {
      draft: 'Draft',
      requested: 'Requested',
      quoted: 'Quoted',
      accepted: 'Accepted',
      rejected: 'Rejected',
      expired: 'Expired',
      cancelled: 'Cancelled',
      superseded: 'Superseded',
      converted: 'Converted to order'
    },
    admin: {
      title: 'Quote Queue',
      navLabel: 'Quotes',
      subtitle: 'Price customer quote requests and manage the process.',
      searchPlaceholder: 'Search by product name...',
      columnsButton: 'Columns',
      emptyTitle: 'No quote requests',
      emptyDescription: 'When customers request quotes for unpriced products, they are listed here.',
      filterEmptyDescription: 'No quote requests match your filters.',
      emailUnavailable: 'email unavailable',
      prospectBadge: 'no account — acceptance locked',
      table: {
        customer: 'Customer',
        items: 'Items',
        source: 'Source',
        status: 'Status',
        date: 'Date',
        actions: 'Actions'
      },
      detail: {
        itemsTitle: 'Requested Items',
        qty: 'Qty',
        note: 'Customer note',
        unitPrice: 'Unit Price',
        currency: 'Currency',
        validUntil: 'Valid Until',
        savePrices: 'Save Prices'
      },
      actions: {
        markAs: 'Mark as {{status}}'
      },
      toasts: {
        statusUpdated: 'Quote status updated: {{status}}',
        statusUpdateFailed: 'Could not update quote status',
        noPermission: 'You do not have permission for this action',
        pricesSaved: 'Prices saved',
        pricesSaveFailed: 'Could not save prices',
        priceRequired: 'Before sending the quote, give every item a price, the same currency and a future validity date'
      }
    }
  },
  lead: {
    companyPlaceholder: 'Your company Inc.',
    cityPlaceholder: 'e.g. Istanbul',
    consent: {
      text: 'I have read and agree.'
    },
    appAreas: {
      parking: 'Parking Ventilation',
      kitchen: 'Industrial Kitchen',
      cleanroom: 'Hospital/Clean Room',
      retail: 'Mall/Retail',
      office: 'Office/Plaza',
      warehouse: 'Warehouse/Production Facility',
      other: 'Other'
    },
    valueProp: {
      badge: 'VENTHUB B2B',
      title: 'Request a Quote for Your Projects',
      description: 'Send your product and project details through the contact form or to info@venthub.com.tr. Orders start with a quote request.',
      feature1: 'Product Selector Sizing',
      feature2: 'Shipping and Delivery Terms in the Quote',
      feature3: 'Datasheets on Product Pages'
    },
    success: {
      title: 'Request Received!',
      description: 'Your quote request has been received. For questions, write to info@venthub.com.tr.'
    },
    form: {
      title: 'Get a Quote',
      nameLabel: 'Full Name *',
      companyLabel: 'Company Name',
      emailLabel: 'Email',
      phoneLabel: 'Phone',
      cityLabel: 'City',
      appAreaLabel: 'Application Area',
      selectPlaceholder: 'Select...',
      messageLabel: 'Project / Request Details',
      messagePlaceholder: 'Products you need...',
      submit: 'Submit',
      productContext: 'quote is being generated',
      productLabel: 'Product of Interest:',
      corporateContact: 'Corporate Contact'
    },
    errors: {
      name: 'Full Name is required',
      contact: 'You must provide an email or phone number',
      consent: 'You must accept the KVKK text',
      submitFailed: 'We could not save your request. Please try again; if the problem persists, contact us directly.'
    },
    defaultMessage: 'Detailed technical quote for {{productName}}...',
  },
  // PRODUCT SELECTOR entry page (decision K17, 2026-09-04). Deliberately not "fan
  // selector": other product groups will get engines later. One name, one destination.
  urunSecici: {
    ustBaslik: 'Product Selector',
    baslik: 'Run a pre-assessment for your space',
    // ⛔"Results carry over into your quote request" REMOVED (2026-09-05, code review):
    // no such hand-off exists. The PR that removes promise boxes was introducing a new promise.
    aciklama: 'Run a pre-assessment from volume, airflow and pressure inputs.',
    // REC-497: search-result description (page copy is unchanged).
    seoDescription: 'Run a pre-assessment for duct fans, heat recovery, air curtains and jet fans from your volume, airflow and pressure inputs.',
    araclar: {
      kanal: {
        ad: 'Duct fan sizing',
        aciklama: 'Derive the required airflow and pressure from room volume and air change rate.',
      },
      hrv: {
        ad: 'Heat recovery (HRV) sizing',
        aciklama: 'Determine fresh-air demand and unit size for homes and offices.',
      },
      havaPerdesi: {
        ad: 'Air curtain sizing',
        aciklama: 'Calculate the required curtain airflow from door dimensions and operating conditions.',
      },
      jetFan: {
        ad: 'Jet fan sizing',
        aciklama: 'Calculate the thrust demand and fan count for car parks and similar spaces.',
      },
    },
    not: 'These are pre-assessments; for a final selection, write via the contact form or by email.',
  },
  calculators: {
    recommendations: 'Recommendations',
    stepIndicator: {
      progress: 'Step {{current}} / {{total}}',
    },
    layout: {
      // Label follows the target (REC-148 B2): the tools now return to the Product Selector,
      // not to Products — the loop closes so trying a second tool no longer strands the visitor.
      backLabel: 'Back to the Product Selector',
      disclaimer: 'This calculator is intended for preliminary sizing. Consult an HVAC engineer for precise project calculations.',
      contactPrompt: 'For your technical questions',
      contactLink: 'get in touch',
    },
    airCurtain: {
      trafficLowDesc: 'Infrequent passage',
      trafficMediumDesc: 'Moderate passage',
      trafficHighDesc: 'Frequent passage',
      newCalculation: 'New Calculation',
      calculate: 'Calculate',
      title: 'Air Curtain Calculator',
      description: 'Air curtain calculation based on door dimensions and operating conditions',
      infoText: 'This tool is the air curtain calculator in the Product Selector. Calculations are a preliminary assessment.',
      steps: {
        dimensions: 'Door Dimensions',
        dimensionsDesc: 'Width and height',
        application: 'Application',
        applicationDesc: 'Purpose of use',
        conditions: 'Conditions',
        conditionsDesc: 'Wind and traffic',
        results: 'Results',
        resultsDesc: 'Calculation results'
      },
      form: {
        doorWidth: 'Door Width',
        doorHeight: 'Door Height',
        doorWidthTooltip: 'Internal opening width of the door (0.5 - 10 m)',
        doorHeightTooltip: 'Internal opening height of the door (1.5 - 6 m)',
        applicationLabel: 'Select Application',
        applicationPurpose: 'Select the purpose of the air curtain',
        environmentalConditions: 'Environmental Conditions',
        windStatus: 'Wind Status',
        windTooltip: 'Expected wind intensity outside the door',
        trafficIntensity: 'Traffic Intensity',
        trafficTooltip: 'Estimated hourly passage count',
        inputSummary: 'Input Summary'
      },
      applications: {
        comfort: {
          label: 'Stores and Markets',
          desc: 'Store and market entrance',
          info: 'A typical application at store, market and restaurant entrances.'
        },
        insect: {
          label: 'Insect Entry',
          desc: 'Restaurant entrance',
          info: 'According to the manufacturer\'s description, aimed at preventing insect entry.'
        },
        coldRoom: {
          label: 'Warehouse Door',
          desc: 'Warehouse door entrance',
          info: 'Uses an air flow to block hot and cold air at a warehouse door.'
        }
      },
      conditions: {
        wind: {
          none: 'None',
          light: 'Light',
          moderate: 'Moderate',
          strong: 'Strong'
        },
        traffic: {
          low: 'Low',
          medium: 'Medium',
          high: 'High'
        }
      },
      results: {
        title: 'Calculation Results',
        subtitle: 'Recommended air curtain specifications',
        gridTitle: 'Calculated Values',
        airflow: 'Required Airflow',
        airflowDesc: 'Total flow required for an effective air barrier',
        velocity: 'Nozzle Velocity',
        velocityDesc: 'Air speed at the air curtain outlet',
        floorVelocity: 'Floor Velocity (Estimated)',
        floorVelocityDesc: 'Expected air speed at floor level',
        power: 'Recommended Motor Power',
        powerDesc: 'Minimum motor power requirement',
        nozzleWidth: 'Nozzle Width',
        nozzleHeight: 'Nozzle Height',
        efficiency: 'Efficiency',
        efficiencyOptimal: 'Optimal',
        efficiencyAcceptable: 'Acceptable',
        efficiencyWarning: 'Borderline',
        efficiencyOptimalDesc: 'Results are a preliminary assessment; request a quote for final selection.',
        efficiencyAcceptableDesc: 'Performance is acceptable, improvement can be considered if needed',
        efficiencyWarningDesc: 'A more powerful model or additional measures may be required',
        efficiencyMarginal: 'Marginal',
        efficiencyMarginalDesc: 'Consider a more powerful model for better performance'
      },
      diagram: {
        unit: 'Air Curtain',
        doorDimensions: 'Door dimensions diagram'
      }
    },
    duct: {
      title: 'Duct Pressure Loss Calculator',
      description: 'Air duct velocity calculation and pressure drop estimation',
      infoText: 'Calculates air velocity and estimated pressure loss based on flow rate and duct dimensions.',
      form: {
        inputTitle: 'Duct Details',
        inputDesc: 'Enter airflow and duct dimensions',
        shape: 'Duct Type',
        round: 'Circular',
        roundDesc: 'Spiral or welded pipe',
        rectangular: 'Rectangular',
        rectangularDesc: 'Rectangular-section duct',
        material: 'Material',
        steel: 'Galvanized Steel',
        steelDesc: 'Standard',
        pvc: 'PVC',
        pvcDesc: 'Plastic duct material',
        flex: 'Flex Duct',
        flexDesc: 'Flexible',
        airflow: 'Airflow',
        airflowTooltip: 'Amount of air that needs to pass through the duct',
        diameter: 'Duct Diameter',
        diameterTooltip: 'Inner diameter (50-2000 mm)',
        width: 'Width (a)',
        height: 'Height (b)',
        length: 'Duct Length',
        lengthTooltip: 'Total duct length'
      },
      results: {
        title: 'Calculation Results',
        subtitle: 'Air velocity and pressure loss values',
        velocity: 'Air Velocity',
        specificLoss: 'Pressure Loss (Specific)',
        totalLoss: 'Total Pressure Loss',
        equivDiameter: 'Equivalent Diameter',
        equivDiameterDesc: 'Circular duct equivalent'
      }
    },
    hrv: {
      title: 'HRV Energy Saving Calculator',
      description: 'Heat recovery unit efficiency and energy saving calculation',
      infoText: 'Calculates the annual energy saving potential of heat recovery (HRV) or energy recovery (ERV) units.',
      form: {
        type: 'Device Type',
        typeDesc: 'Select the heat recovery system',
        hrv: 'HRV (Heat Recovery)',
        hrvDesc: 'Sensible heat only',
        erv: 'ERV (Energy Recovery)',
        ervDesc: 'Heat + Moisture recovery',
        climate: 'Climate Zone',
        cold: 'Cold',
        coldDesc: 'Cold climate conditions',
        temperate: 'Temperate',
        temperateDesc: 'Temperate climate conditions',
        hot: 'Hot',
        hotDesc: 'Hot climate conditions',
        usage: 'Space Type',
        usageDesc: 'Building, climate and usage details',
        residential: 'Residential',
        residentialDesc: 'Domestic use',
        office: 'Office',
        officeDesc: 'Workplace',
        commercial: 'Commercial',
        commercialDesc: 'Commercial use area',
        occupancy: 'Number of People',
        unitPeople: 'people',
        workingHours: 'Daily Operation',
        electricityPrice: 'Electricity Unit Price',
        sensibleEfficiency: 'Sensible Efficiency',
        latentEfficiency: 'Latent Efficiency',
        area: 'Area (m²)'
      },
      results: {
        title: 'Calculation Results',
        subtitle: 'Estimated annual energy savings',
        savingsTitle: 'Annual Savings',
        annualEnergySaving: 'Annual Energy Saving',
        annualCostSaving: 'Annual Cost Saving',
        unitKwhPerYear: 'kWh/y',
        unitCostPerYear: '₺/y',
        unitKgPerYear: 'kg/y',
        unitYears: 'years',
        heatingGain: 'Heating Gain',
        coolingGain: 'Cooling Gain',
        co2Reduction: 'CO₂ Reduction',
        co2Desc: 'Annual carbon emission reduction',
        payback: 'Payback Period',
        paybackDesc: 'Estimated investment payback'
      }
    },
    jetFan: {
      pageTitle: 'Jet Fan Calculator',
      pageDescription: 'Jet fan calculation',
      pageInfoText: 'This tool is the jet fan calculator in the Product Selector. Calculations are a preliminary assessment.',
      smokeWarning: 'The smoke exhaust calculation is for preliminary design purposes. Professional fire engineer consultancy is required.',
      parkingShortDesc: 'Enclosed parking ventilation',
      tunnelShortDesc: 'Road or subway tunnel',
      appTypeTitle: 'Application Type',
      appTypeSubtitle: 'Select the space type',
      applicationLabel: 'Application',
      spaceInfoTitle: 'Space Information',
      spaceInfoSubtitle: 'Dimension and capacity values',
      lengthLabel: 'Length',
      trafficLabel: 'Hourly Traffic',
      unitVehicle: 'vehicles',
      unitVehiclePerHour: 'vehicles/h',
      capacityTooltip: 'Total number of parking spaces',
      trafficTooltip: 'Vehicle movement during peak hour',
      resetValues: 'Reset Values',
      layoutSchema: 'Layout Diagram',
      diagramLegend: 'Jet Fan',
      resultsTitle: 'Calculation Results',
      resultsSubtitle: 'Recommended jet fan configuration',
      ventilationMetrics: 'Ventilation Metrics',
      requiredAirflow: 'Required Airflow',
      airChangeRate: 'Air Change Rate',
      achParkingHint: 'Enter the air change rate',
      achTunnelHint: 'Tunnel: take ACH from the specification or regulations',
      fanRequirements: 'Jet Fan Requirements',
      fanCountTitle: 'Jet Fan Count',
      unitPiece: 'units',
      placementTitle: 'Placement Recommendations',
      recommendedSpacing: 'Recommended Spacing:',
      mountingHeight: 'Mounting Height:',
      volume: 'Volume:',
      thrustPerFan: 'Thrust Per Fan:',
      smokeSystemTitle: 'Smoke Exhaust System',
      smokeSystemDesc: 'This calculation is for preliminary sizing purposes. For final design, CFD analysis and fire safety expert consultancy are required.',
      emptyStateLine1: 'Enter valid values to',
      emptyStateLine2: 'view the results',
      form: {
        parking: 'Parking',
        tunnel: 'Tunnel',
        mode: 'Ventilation Mode',
        normal: 'Normal',
        normalDesc: 'Daily ventilation',
        smoke: 'Smoke Exhaust',
        smokeDesc: 'Fire scenario',
        capacity: 'Vehicle Capacity',
        width: 'Width',
        height: 'Height'
      },
      results: {
        totalThrust: 'Total Thrust Force',
      }
    }
  },
  categorySilentFan: {
    problem: {
      withoutMark: '•',
      withMark: '•',
      eyebrow: 'SOUND AND COMFORT',
      title: 'Duct Fan with Sound-Absorbing Lining',
      subtitle: 'The Vortice Lineo Quiet family consists of duct-type, mixed-flow fans; the sound-absorbing lining is integrated into the outer casing.',
      painPoints: [
        {
          title: 'Sound-Absorbing Lining',
          description: 'The lining is designed to reduce the noise emitted into the room.'
        },
        {
          title: 'Mixed-Flow Fan',
          description: 'A duct-type fan. Diameter and flow-rate values are listed in the model datasheet.'
        },
        {
          title: 'Two Motor Options',
          description: 'Available with an AC induction motor (LINEO QUIET) or an EC brushless motor (LINEO QUIET ES).'
        },
        {
          title: 'Quiet Settings',
          description: ''
        }
      ],
      visual: {
        without: 'AC Motor Model',
        with: 'EC Motor Model',
        withoutPoints: ['LINEO QUIET', 'AC induction motor', 'Mixed-flow fan', 'Sound-absorbing casing lining'],
        withPoints: ['LINEO QUIET ES', 'EC brushless motor', 'Mixed-flow fan', 'Sound-absorbing casing lining']
      }
    },
    howItWorks: {
      eyebrow: 'TECHNOLOGY',
      title: 'Vortice Lineo Quiet Construction',
      subtitle: 'Vortice Lineo Quiet is a mixed-flow duct fan with a sound-absorbing lining integrated into its outer casing.',
      steps: [
        {
          title: 'Sound-Absorbing Housing',
          description: 'The sound-absorbing lining is integrated into the outer casing.'
        },
        {
          title: 'Mixed Flow',
          description: 'A duct-type mixed-flow fan; technical specifications are on the product page.'
        },
        {
          title: 'Motor Options',
          description: 'LINEO QUIET with AC induction motor and LINEO QUIET ES with brushless EC motor.'
        }
      ]
    },
    comparison: {
      standardLabel: 'AC:',
      quietLabel: 'EC:',
      title: 'Motor Options',
      standard: 'LINEO QUIET (AC)',
      quiet: 'LINEO QUIET ES (EC)',
      features: [
        {
          label: 'Casing',
          standard: 'Sound-absorbing lining',
          quiet: ''
        },
        {
          label: 'Energy Consumption',
          standard: 'See the model datasheet',
          quiet: ''
        },
        {
          label: 'Motor Type',
          standard: 'AC induction',
          quiet: 'EC brushless'
        },
        {
          label: 'Flow',
          standard: 'Mixed',
          quiet: 'Mixed'
        }
      ]
    },
    faq: {
      title: 'Frequently Asked Questions',
      items: [
        {
          q: 'How quiet is it really?',
          a: 'The sound-absorbing lining is integrated into the outer casing, designed to reduce emitted noise. Specifications are on the product page.'
        },
        {
          q: 'Is it hard to install?',
          a: 'For installation and maintenance, refer to the product\'s user manual and the manufacturer\'s documentation. Please keep the manual.'
        },
        {
          q: 'What is Vortice Lineo Quiet?',
          a: 'A duct-type, mixed-flow fan with two model groups: the AC-motor LINEO QUIET and the EC-motor LINEO QUIET ES.'
        }
      ]
    },
    brand: {
      eyebrow: 'ITALY-BASED BRAND',
      title: 'Vortice Lineo Quiet Duct Fans',
      description: 'Lineo Quiet is a family of mixed-flow duct fans with a sound-absorbing lining built into the casing, offered as LINEO QUIET (AC motor) and LINEO QUIET ES (EC motor).',
      badges: ['AC / EC Motor', 'Mixed-Flow Fan Family'],
      stats: [
        {
          label: '',
          value: ''
        },
        {
          label: 'Vortice Product Families',
          value: '{aile}'
        },
        {
          label: 'Vortice Active Models',
          value: '{model}'
        },
        {
          label: 'Country',
          value: 'Italy'
        }
      ]
    }
  },
  product3d: {
    loadError: 'Failed to load 3D model',
    back: 'BACK',
    view: 'VIEW',
    reset: 'RESET',
    orbit: 'ORBIT',
    free: 'FREE',
    auto: 'AUTO',
    front: 'Front',
    backLabel: 'Back',
    left: 'Left',
    right: 'Right',
    top: 'Top',
    bottom: 'Bottom'
  },
  error: {
    chunkTitle: 'Page Update Required',
    chunkDesc: 'The application appears to have been updated. Please refresh the page and try again.',
    errorTitle: 'Page Failed to Load',
    errorDesc: 'An error occurred while loading this page. Please try again.',
    refresh: 'Refresh Page',
    retry: 'Try Again',
    devDetails: 'Error Details (Development)'
  },
  silentFanWizard: {
    headerTitle: 'Silent Fan Selector',
    goBack: 'Previous step',
    continue: 'Continue',
    skipToResult: 'Show result',
    defaultsHint: 'All steps are pre-filled — you can jump to the result anytime',
    step1Title: 'Where will the fan go?',
    step1Desc: 'The room type determines how many air changes per hour are needed.',
    step2Title: 'How big is the room?',
    step2Desc: 'A rough idea is enough — we calculate the volume and required airflow.',
    areaLabel: 'Floor area',
    ceilingLabel: 'Ceiling height',
    step3Title: 'How does the duct run?',
    step3Desc: 'The longer and more winding the duct, the harder the fan works.',
    routeLabel: 'Duct route',
    materialLabel: 'Duct material',
    diameterLabel: 'Duct diameter',
    diameterUnknown: 'I don\'t know',
    diameterHint: 'Leave it blank if unsure — we evaluate each model at its own diameter.',
    step4Title: 'How important is quietness?',
    step4Desc: 'This changes the ranking; underpowered models are still eliminated.',
    calculating: 'Calculating models for your installation…',
    resultTitle: 'Three recommendations for you',
    resultNeed: 'Your room is about {hacim} m³ — this space needs {debi} m³ of air per hour.',
    badgeBest: 'Ranked 1st',
    badgeQuietest: 'Lowest dB(A)',
    badgeEfficient: 'EC motor',
    cardDelivers: 'Calculated in your duct',
    cardNoise: 'Noise level',
    cardDiameter: 'Connection diameter',
    cardCta: 'View product',
    showDetails: 'Show the calculation',
    hideDetails: 'Hide the calculation',
    detailVolume: 'Room volume',
    detailAch: 'Air changes per hour',
    detailNeed: 'Required airflow',
    detailMinApplied: '(standard minimum applied)',
    detailPressure: 'Estimated system resistance',
    detailEliminated: 'Models ruled out',
    noMatchTitle: 'No suitable model for these conditions',
    noMatchDesc: 'Try leaving the diameter open, or shortening the duct route.',
    errorTitle: 'Couldn\'t load the models',
    errorDesc: 'Something went wrong. Please try again.',
    restart: 'Start over',
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
      bathroom: 'Bathroom',
      kitchen: 'Kitchen',
      bedroom: 'Bedroom',
      living: 'Living room',
      office: 'Office',
      shop: 'Shop / café',
    },
    roomHint: {
      bathroom: 'Moisture and odour must clear fast',
      kitchen: 'Check the airflow rating for cooking fumes',
      bedroom: 'Night-time quiet is decisive',
      living: 'Continuous, calm ventilation',
      office: 'Fresh air for occupancy',
      shop: 'Heavy use, high airflow',
    },
    route: {
      short: 'Short and straight',
      medium: 'Medium',
      long: 'Long or winding',
    },
    routeHint: {
      short: 'About 3 m, one bend',
      medium: 'About 6 m, two or three bends',
      long: 'Over 10 m, many bends',
    },
    material: {
      galvanized: 'Rigid metal duct',
      pvc: 'Rigid plastic duct',
      flex: 'Flexible duct',
    },
    materialHint: {
      galvanized: 'Friction is included in the calculation',
      pvc: 'Friction is included in the calculation',
      flex: 'Friction is evaluated in the calculation',
    },
    quiet: {
      normal: 'Not a priority',
      important: 'Important',
      critical: 'Critical',
    },
    quietHint: {
      normal: 'Performance first',
      important: 'Balance quiet and power',
      critical: 'Bedroom, night-time use',
    },
  },
  needsWizard: {
    stepOf: '/ {{total}}',
    enhanced: {
      iconHeat: '🔥',
      iconAmbient: '🌬️',
      iconUnsure: '❓',
      headerTitle: 'Needs Analysis Wizard',
      meterUnit: 'm',
    },
    ambient: 'Ambient (Unheated)',
    analyzing: 'Analysing Models...',
    centralSystem: 'If central system is available',
    close: 'Close',
    coldStorage: 'Warehouse',
    coldStorageDesc: 'Warehouse doors',
    coldStorageTip: 'Limits air exchange through the open door',
    consultUs: 'Consult us',
    customOffer: 'Request Custom Offer',
    doorHeight: 'What is Your Door Height?',
    electricHeater: 'Electric Heater',
    entranceDesc: 'Shop, market and restaurant entrance',
    entranceDoor: 'Entrance Door',
    entranceTip: 'Unheated or electrically heated models can be chosen',
    findSuitable: 'Find the Suitable One for Me',
    goBack: 'Go Back',
    heatingNeed: 'Is Heating Needed?',
    heatingNoDesc: 'Air barrier only',
    heatingYesDesc: 'For winter comfort',
    heightMeter: 'Height (Metre)',
    industrial: 'Industrial Facility',
    industrialDesc: 'Warehouse door',
    industrialTip: 'Limits dust entry at open doors',
    insulation: 'For airflow only',
    matchScore: 'Fit score: {{score}}/100',
    meter: 'Metre',
    mountType: 'Which mounting type is needed?',
    next: 'Continue',
    notSure: 'Not Sure',
    recessedMount: 'Recessed (In-Ceiling)',
    restart: 'Restart',
    retail: 'Market / Supermarket',
    retailDesc: 'Supermarket entrance',
    retailTip: 'Supermarket entrances are a typical use',
    standardMount: 'Standard (Wall/Ceiling Suspended)',
    start: 'Start',
    step: 'Step',
    step1Desc: 'To start choosing an air curtain, select the application area first.',
    step1Title: 'Where is the area of use?',
    step2Desc: 'The air curtain is chosen according to the door width.',
    step2Title: 'Enter door dimensions',
    step3Title: 'Is heating needed?',
    step6Desc: 'Models listed as a result of the preliminary assessment.',
    step6Title: 'Models for Your Inputs',
    threeSteps: 'Model suggestion based on size and heating',
    waterHeater: 'Water Heated (LPHW)',
    widthMeter: 'Width (Metre)',
    winterComfort: 'For winter comfort',
    wizardTitle: 'Needs Analysis Wizard'
  },
  beforeAfterSlider: {
    title: 'Before / After',
    subtitle: 'See the application impact quickly',
    ariaLabel: 'Before / after comparison',
    rangeAriaLabel: 'Comparison position'
  },
  undecidedUserCta: {
    title: 'Not sure which product is right for your project?',
    description: 'Run a preliminary assessment in the Product Selector with your volume, airflow and pressure values, and send questions through the contact form.',
    buttonText: 'Open Product Selector'
  }
};
