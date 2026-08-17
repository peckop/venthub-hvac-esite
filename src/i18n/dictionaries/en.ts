import { admin } from './admin/en'
import { tr } from './tr'

export const en: typeof tr = {
  common: {
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
    loadingApp: 'Loading VentHub... ',
    loading: 'Loading...',
    categories: 'Categories',
    products: 'Products',
    brands: 'Brands',
    about: 'About',
    contact: 'Contact',
    supportCenter: 'Support Center',
    knowledgeHub: 'Knowledge Hub',
    myOrders: 'My Orders',
    signOut: 'Sign Out',
    signIn: 'Sign In',
    signUp: 'Sign Up',
    skipToContent: 'Skip to main content',
    searchHeaderPlaceholder: 'Search product, brand or model...',
    search: 'Search',
    quickSearch: 'Quick search...',
    allCategories: 'All Categories',
    priceRange: 'Price Range',
    languageSwitcher: 'Language Selection',
    turkish: 'Turkish',
    english: 'English',
    discover: 'Discover',
    allProducts: 'All Products',
    exploreProducts: 'Explore Products',
    getQuote: 'Get a Quote',
    addToCart: 'Add to Cart',
    categoryList: {
      residential: 'Residential Ventilation',
      commercial: 'Commercial Ventilation',
      industrial: 'Industrial Ventilation',
      hrv: 'VMC & Heat Recovery',
      'air-treatment': 'Air Treatment',
      hygiene: 'Hygiene and Sanitizer',
      summer: 'Summer Ventilation',
      ac: 'Air Conditioning',
      heating: 'Electric Heating',
      hvls: 'Industrial Ceiling Fans',
      accessories: 'Accessories and Components',
      'smart-home': 'Smart Home',
      'parking-jet': 'Car Park Jet Fans',
      sub: {
        bathroom: 'Bathroom and Toilet Fans',
        window: 'Window and Wall Fans',
        ghost: 'In-line / Duct Fans',
        smoke: 'Smoke Exhaust Fans',
        jet: 'Car Park Jet Fans',
        radial: 'Radial Fans',
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
        'duct-heaters': 'Electric Duct Heaters'
      }
    },
    byApplication: 'Solutions by Application',
    viewAll: 'View all',
    featured: 'Featured Products',
    newProducts: 'New Products',
    whyUs: 'Why VentHub?',
    homeLabel: 'Home',
    discoverPage: 'Discover',
    notFound: 'No results found',
    clearSearch: 'Clear search',
    searchPlaceholder: 'Product name, brand...',
    searchPlaceholderLong: 'Product name, brand, model...',
    selectByNeed: 'Choose by need',
    seeAllProducts: 'See all products',
    back: 'Back',
    backToTop: 'Back to top',
    gotoCategory: 'Go to category',
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
    whatsappAriaLabel: 'Message on WhatsApp',
    whatsappTitle: 'Message on WhatsApp',
    whatsappTooltip: 'Engineering Line',
    whatsappSupportMessage: 'Quick support from website',
    pdf: 'PDF',
    sku: 'SKU',
    pdfDatasheet: 'Technical Datasheet',
    share: 'Share',
    requestQuote: 'Request Quote',
    officialGuarantee: 'Official Guarantee',
    fastDelivery: 'Fast Delivery',
    series: 'Series',
    reset: 'Reset',
    whatsapp: {
      faqSupportMessage: 'I could not find the answer I was looking for on the FAQ page...',
      supportMessageDefault: 'Hello, I would like to contact the VentHub HVAC support team.',
      technicalQuoteMessage: 'I request a technical quote and project design for {{productName}}. Project details: {{projectInfo}}'
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
    goToStore: 'Go to Store',
    id: 'ID',
    no: 'No',
    none: 'None',
    save: 'Save',
    saving: 'Saving...',
    status: 'Status',
    systemPreparing: 'System Preparing...',
    yes: 'Yes'
  },
  search: {
    overlay: {
      enterKey: 'Enter ↵',
      arrowUp: '↑',
      arrowDown: '↓',
      allResultsFor: 'View all results ("{{term}}")',
    },
    recentSearches: 'Recent Searches',
    clearRecent: 'Clear',
    popularCategories: 'Popular Categories',
    noResults: 'No results found',
    detailedSearch: 'detailed search for',
    allResults: 'See all results',
    keyboardHint: 'Navigate with arrow keys',
    enterHint: 'For all results',
    placeholder: 'Search products, categories, brands...',
    placeholderAi: 'Search products, categories, or AI-powered search...',
    noResultsAdvice: 'Try different keywords',
    detailedSearchCta: 'Click for detailed search',
    brandPrefix: 'Brand: ',
    fuzzyMatchNotice: 'No exact match found, showing similar results.'
  },
  resources: {
    title: 'Resources & Guides',
    allGuides: 'All guides',
    teaser: 'Quick tips to get started',
    items: {
      jetFan: 'Parking Jet Fan selection',
      airCurtain: 'Air curtain selection',
      hrv: 'Heat recovery (HRV) guide'
    }
  },
  knowledge: {
    hub: {
      title: 'Knowledge is the Raw Material of Engineering',
      subtitle: 'Discover technical guides, calculation tools, and application scenarios we prepared for right HVAC decisions.',
      eyebrow: 'Technical Intelligence Unit',
      searchPlaceholder: 'Search for topic, technical term or product family...',
      readStart: 'Start Reading',
      heroAlt: 'Engineering Knowledge Hub Visual',
      readTime: '{{count}} min read',
      calculatorsSoon: 'Calculators Soon',
      calculatorsSoonDesc: 'Perform your engineering calculations in seconds.',
      selectorSoon: 'Product Selector Soon',
      selectorSoonDesc: 'Find the most suitable model for your needs with our smart algorithms.',
      inDevelopment: 'In Development',
      inPlanning: 'In Planning',
      notFoundTitle: 'Couldn\'t find the technical info you\'re looking for?',
      notFoundDesc: 'Our engineering team is ready to provide custom documentation support for your complex projects.',
      contactExpert: 'Talk to an Expert',
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
      eyebrow: 'Technical Intelligence',
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
        summary: 'Installed above entrances to preserve comfort and reduce energy loss; device should fully cover door width.',
        steps: ['Door width = device width (unbroken barrier).', 'Nozzle velocity 7–9 m/s; at floor 2–3 m/s target.', 'Nozzle tilted 10–15° inwards; auto speed via door contact.'],
        pitfalls: ['Device too short', 'Too low velocity', 'Tilting nozzle outward']
      },
      'jet-fan': {
        title: 'Jet Fan (Parking)',
        summary: 'Ceiling fans that direct flow to exhaust for CO/NOx and smoke scenarios; layout must avoid dead zones.',
        steps: ['Flow: Volume × ACH (e.g. 7,200 m³ × 8 ACH ≈ 57,600 m³/h).', 'Thrust 50–100 N typical; pick by distance and plan.', 'Layout: axis spacing 25–35 m; drive to exhaust; cover sensor zones.'],
        pitfalls: ['Leaving dead zones', 'Missing sensor coverage'],
        image: '/images/hvac_installation_close_up_premium_3.webp'
      },
      hrv: {
        title: 'Heat Recovery (HRV/ERV)',
        summary: 'Provides fresh air with heat recovery; key criteria are airflow, efficiency/SFP and external static pressure.',
        steps: ['Airflow by occupancy/space (EN 16798-1 / ASHRAE 62.1 ranges).', 'Efficiency/SFP: 70–85% efficiency, low SFP.', 'Pressure: external static matching filter/duct losses.'],
        pitfalls: ['Focusing on efficiency while ignoring external static'],
        image: '/images/hvac_installation_close_up_premium_4.png'
      },
      'air-curtain': {
        image: '/images/hvac_installation_close_up_premium_3.webp',
        pitfalls: ['Device too short', 'Too low velocity', 'Tilting nozzle outward'],
        steps: ['Door width = device width (unbroken barrier).', 'Nozzle velocity 7–9 m/s; at floor 2–3 m/s target.', 'Nozzle tilted 10–15° inwards; auto speed via door contact.'],
        summary: 'For correct air curtain selection, door height, width and usage purpose (comfort/industrial) are decisive.',
        title: 'Air Curtain Selection'
      }
    }
  },
  home: {
    seoTitle: 'VentHub - Premium HVAC Solutions | Fans, Speed Control, Heating & Cooling',
    seoDesc: 'Discover premium ventilation products with VentHub. Engineering-led solutions for parking jet fans, air curtains, heat recovery units, and more.',
    hero: {
      eyebrow: 'Engineering-Guided HVAC Commerce',
      title: 'Enter the right HVAC path from the first screen.',
      titleLineOne: 'Enter the right HVAC',
      titleLineTwo: 'path from the first screen.',
      subtitle: '3D discovery, category flow and quote routing come together in one focused layer.',
      primaryCta: 'Explore Products',
      secondaryCta: 'Get a Fast Quote',
      quickAccessLabel: 'Quick Access',
      visualAlt: 'VentHub industrial HVAC solution visual',
      visualEyebrow: 'Controlled Discovery',
      visualTitle: 'Start the category decision from the first screen with 3D discovery.',
      visualSubtitle: 'The homepage no longer behaves like a simple showcase; it acts like a real decision hub across category, scenario and expert support.',
      visualPoints: {
        selection: 'Fast routing by category and application',
        routing: 'Short access to quote and expert support'
      },
      metrics: {
        coreCategories: 'core categories for a faster start',
        productSeries: '{{count}} series and sub-family routes',
        entryPaths: 'guided decision flow'
      },
      trustStrip: {
        authorizedBrands: 'Authorized premium brands',
        engineeringSupport: 'Engineering guidance',
        nationwideDelivery: 'Nationwide delivery',
        projectGuidance: 'Project-led selection support'
      },
      quickChips: {
        fans: 'Fans',
        airCurtains: 'Air Curtains',
        heatRecovery: 'Heat Recovery',
        speedControl: 'Speed Control',
        quote: 'Request Quote'
      },
      categorySummaries: {
        fans: 'Compare ATEX, industrial and commercial fan families faster.',
        airCurtains: 'Move toward the right air curtain family for entrance comfort and energy-loss control.',
        heatRecovery: 'Evaluate fresh-air and efficiency balance through a heat recovery route.',
        speedControl: 'Select fan control, drive and speed management in the right equipment layer.'
      },
      sinevizyon: {
        altMain: 'VentHub Industrial Ventilation Systems',
        altProduct: 'VentHub Special Product Series',
        slides: [
          {
            eyebrow: 'ADVANCED AERODYNAMIC ENGINEERING',
            title: 'Industrial Ventilation Layers',
            subtitle: 'Statically balanced and acoustically optimized solution axes in high-flow systems.',
            products: [
              {
                label: 'Vortice Lineo',
                subLabel: 'Mixed Flow Duct Fan'
              },
              {
                label: 'Lineo Quiet',
                subLabel: 'Ultra Quiet Performance'
              }
            ]
          },
          {
            eyebrow: 'FUTURISTIC CLIMATE CONTROL',
            title: 'Vortice Lineo Quiet: The Future of Silence',
            subtitle: 'The perfect balance of minimum energy consumption, maximum air transfer efficiency, and premium silent comfort.',
            products: [
              {
                label: 'Air Flow Technology',
                subLabel: 'Laminar Flow Control'
              },
              {
                label: 'EC Motor Efficiency',
                subLabel: 'Low Energy Consumption'
              }
            ]
          },
          {
            eyebrow: 'PRECISION HVAC SYSTEMS',
            title: 'Technical Excellence and Smart Flow',
            subtitle: 'End-to-end deterministic ventilation engineering for industrial kitchens, parking lots, and comfort zones.',
            products: [
              {
                label: 'Industrial Solutions',
                subLabel: 'High Capacity'
              },
              {
                label: 'Smart Control',
                subLabel: 'Automation Integration'
              }
            ]
          }
        ]
      }
    },
    cinematicShowcase: {
      hudStatus: 'System.Data.Live',
      eyebrow: 'ENGINEERING FOCUS',
      title: 'Vortice Lineo Quiet Series',
      subtitle: 'The new digital standard of silence with an aero-acoustic housing design.',
      description: 'Provides ultra-quiet operation efficiency even at high static pressure, thanks to its special silencer-layered outer body and dynamically balanced motor structure.',
      cta: 'Access High-Resolution Technical Data',
      badge: 'INDUSTRIAL FOCUS',
      componentLabel: 'System Component',
      hotspots: {
        motor: 'High Efficiency EC Motor',
        motorDetail: 'EC motor technology providing precise speed and torque management.',
        clamps: 'Anti-Vibration Clamps',
        clampsDetail: 'Vibration damping modules for quick service and assembly.',
        housing: 'Acoustic Composite Housing',
        housingDetail: 'Sound-absorbing layers for minimum acoustic emission.',
        airflow: 'Laminar Flow Vanes',
        airflowDetail: 'Vane design providing maximum air guidance efficiency.'
      }
    },
    quickEntry: {
      eyebrow: 'Starting Layer',
      title: 'Choose the first step without friction.',
      subtitle: 'Start from category, application or support and enter the same premium decision flow.',
      items: {
        category: {
          title: 'Search by Category',
          description: 'Move into the right product family through the core category structure.'
        },
        application: {
          title: 'Find by Application',
          description: 'Select solutions by parking, kitchen, entrance and comfort scenarios.'
        },
        support: {
          title: 'Get Technical Support',
          description: 'Reach FAQs, support flows and the knowledge hub quickly.'
        },
        quote: {
          title: 'Request a Fast Quote',
          description: 'Share your need briefly and get expert guidance toward the right solution.'
        }
      }
    },
    guidedDiscovery: {
      eyebrowLabel: 'DETERMINISTIC SYSTEMS',
      heading: 'The Engineering Aesthetics of Airflow',
      intro: 'Discover industrial-grade ventilation solutions curated by VentHub.',
      cardFallback: 'Professional Ventilation Solutions',
      eyebrow: 'Primary Discovery Layer',
      title: 'See the core category structure at a glance and choose the right entry point.',
      subtitle: 'This section does not repeat the 3D hero. It presents the main product families in a simpler way and moves users toward category, series and product detail with more control.',
      seriesCount: '{{count}} series',
      categoryFallback: 'Premium HVAC solutions designed to accelerate category selection.',
      panelEyebrow: 'Decision Flow',
      panelTitle: 'Move from category selection to product decision faster.',
      panelBody: 'We create a clearer navigation structure that guides users first to the right family, then to the relevant series, and finally to product detail.',
      panelFallback: 'Review product families, sub-series and the next discovery step for this category in one place.',
      primaryCta: 'Open Category',
      secondaryCta: 'View Scenarios',
      seriesEyebrow: 'Series Shortcuts',
      seriesTitle: '{{category}} series',
      seriesFallback: 'Review this product family and its key variations.',
      footerNote: 'Category discovery starts here and makes the series logic easier to understand before entering product detail.',
      steps: {
        select: {
          title: 'Choose the right core category',
          description: 'Start from the main families such as fans, air curtains, heat recovery, or speed control.'
        },
        compare: {
          title: 'Narrow the series logic quickly',
          description: 'Move into the right branch by application, capacity, or technical need through the sub-series structure.'
        },
        convert: {
          title: 'Move to product and quote with control',
          description: 'Once the category and series are clear, product evaluation and quoting move forward with less friction.'
        }
      },
      loading: 'Preparing categories...'
    },
    applicationSolutions: {
      eyebrow: 'Scenario-Led Solutions',
      title: 'You can also start from the use case, not only from the product.',
      subtitle: 'From parking to entrance comfort, from kitchen extraction to commercial comfort, we present HVAC needs through a solution logic.',
      viewAll: 'View All',
      items: {
        parking: {
          eyebrow: 'Parking Scenario',
          title: 'Parking ventilation and jet fan flow',
          description: 'Move quickly into the right fan family for parking projects that require CO control, air circulation and high airflow.',
          point1: 'Jet fan and smoke exhaust entry points',
          point2: 'High airflow and safe routing'
        },
        kitchen: {
          eyebrow: 'Kitchen Scenario',
          title: 'Industrial kitchen exhaust and duct flow',
          description: 'Advance toward the right product family with a scenario-led path when grease vapor, odor control and duct fan needs matter.',
          point1: 'Duct fan-led starting point',
          point2: 'Hood and exhaust alignment logic'
        },
        entrance: {
          eyebrow: 'Entrance Comfort',
          title: 'Store entrance and air curtain solutions',
          description: 'Make air curtain discovery clearer for entrance comfort and reduced energy loss at openings.',
          point1: 'Entrance comfort-led selection',
          point2: 'Structure that reduces energy loss'
        },
        comfort: {
          eyebrow: 'Commercial Comfort',
          title: 'Heat recovery and efficient commercial climate control',
          description: 'Evaluate indoor air quality and energy efficiency needs in commercial spaces through a heat recovery-led route.',
          point1: 'Efficiency-led product family',
          point2: 'Transition to comfort and fresh air balance'
        }
      }
    },
    featuredCommercial: {
      gradeLabel: 'Grade',
      gradeValue: 'A++',
      standardLabel: 'Standard',
      standardValue: 'ERP',
      eyebrow: 'Product Showroom',
      title: 'Industrial Product Portfolio',
      subtitle: 'Discover the most reliable and efficient products in the sector, along with technical details and application advantages.',
      cta: 'Explore Entire Collection',
      panelEyebrow: 'Technical Focus',
      tabs: {
        featured: 'Featured',
        newArrivals: 'New Arrivals',
        bestSellers: 'Best Sellers',
        airCurtains: 'Air Curtains',
        heatRecovery: 'Heat Recovery'
      },
      panelTitles: {
        featured: 'Performance Leaders',
        newArrivals: 'Latest Technologies',
        bestSellers: 'Most Preferred',
        airCurtains: 'Climate Protection Systems',
        heatRecovery: 'Energy Recovery'
      },
      panelDescriptions: {
        featured: 'Flagship project solutions that have received full marks in durability and efficiency tests by our engineering team.',
        newArrivals: 'New generation devices with the highest energy efficiency and modern design, recently added to the VentHub product family.',
        bestSellers: 'Reliable models proven in the field, most ordered by industry professionals and large projects.',
        airCurtains: 'Professional series that protect indoor comfort by creating an invisible thermal barrier at entrance areas.',
        heatRecovery: 'Economic units that recover heat from waste air with up to 90% efficiency while meeting fresh air needs.'
      }
    },
    trustProof: {
      eyebrow: 'Trust and Proof',
      title: 'We build trust with clear operational realities, not decorative promises.',
      subtitle: 'The trust layer on the VentHub homepage should make the verified working model and expert support approach visible.',
      badge: 'VERIFIED',
      visualAlt: 'VentHub Reliability Proof and Quality Certificates',
      items: {
        brands: {
          eyebrow: 'Brand Layer',
          title: 'Premium brand selection',
          description: 'Represented brands are not only visual assets; they carry solution quality and category credibility.'
        },
        guidance: {
          eyebrow: 'Expert Layer',
          title: 'Engineering-guided direction',
          description: 'We aim to move users not only into product lists, but into a more accurate selection flow.'
        },
        delivery: {
          eyebrow: 'Operations Layer',
          title: 'Delivery and supply visibility',
          description: 'Delivery and supply expectations are made clearer, more predictable and more professional.'
        },
        support: {
          eyebrow: 'Continuity Layer',
          title: 'Accessible after-sales support',
          description: 'Support, quoting and knowledge-center flows are not disconnected; they are parts of the same trust architecture.'
        }
      }
    },
    strategicBrands: {
      eyebrow: 'Strategic Brands',
      title: 'The brands we work with are not only logos, but the base of the solution architecture.',
      subtitle: 'We turn the brand area from passive logo wallpaper into a carrier of quality, trust and product positioning.'
    },
    knowledge: {
      headingPrefix: 'Engineering',
      headingAccent: 'Layer',
      statsPipelineLabel: 'Project Pipeline',
      statsOptimization: '92% Optimization',
      eyebrow: 'Knowledge and Support Layer',
      title: 'Make technical decision paths visible and reachable.',
      subtitle: 'Guides, calculators and support-center routes help users reach not only products, but a better decision environment.',
      cta: 'Explore',
      hub: {
        title: 'Knowledge is the Raw Material of Engineering',
        subtitle: 'Discover technical guides, calculation tools, and application scenarios we prepared for right HVAC decisions.',
        searchPlaceholder: 'Search for topic, technical term or product family...',
        readStart: 'Start Reading',
        calculatorsSoon: 'Calculators Soon',
        calculatorsSoonDesc: 'Perform your engineering calculations in seconds.',
        selectorSoon: 'Product Selector Soon',
        selectorSoonDesc: 'Find the most suitable model for your needs with our smart algorithms.',
        inDevelopment: 'In Development',
        inPlanning: 'In Planning',
        notFoundTitle: 'Couldn\'t find the technical info you\'re looking for?',
        notFoundDesc: 'Our engineering team is ready to provide custom documentation support for your complex projects.',
        contactExpert: 'Talk to an Expert',
        readTime: '{{count}} min read',
        categories: {
          comfort: 'Comfort',
          safety: 'Safety',
          efficiency: 'Efficiency'
        }
      },
      items: {
        guides: {
          eyebrow: 'Knowledge Hub',
          title: 'Selection guides and technical content',
          description: 'Use category-based guides and topic pages to make product selection more informed.'
        },
        calculators: {
          eyebrow: 'Calculators',
          title: 'Fast calculation tools',
          description: 'Speed up technical pre-evaluation with HRV, air-curtain and duct tools.'
        },
        support: {
          eyebrow: 'Support',
          title: 'FAQ and operational support flow',
          description: 'Move more comfortably into quote and after-sales processes through FAQs and support paths.'
        }
      }
    },
    finalCta: {
      eyebrow: 'Final Step',
      title: 'Let’s clarify the right HVAC solution together.',
      subtitle: 'Complete the flow we built from category discovery to technical support with expert guidance, quotation and product exploration.',
      primaryCta: 'Request Quote',
      secondaryCta: 'Talk to an Expert',
      tertiaryCta: 'Explore Products'
    },
    features: {
      euQuality: 'European quality standards',
      fastDelivery: 'Fast delivery',
      warranty: '2-year warranty',
      support: '24/7 technical support'
    },
    heroTitle: 'Clean Air, Clean Future',
    heroSubtitle: 'Turkey\'s most trusted HVAC distributor. 6 premium brands, 50+ product types for professional ventilation solutions.',
    bottomCtaTitle: 'Let us help you choose the right product.',
    bottomCtaSubtitle: 'Share your project details, our engineering team will guide you quickly.',
    whyParagraph: 'With 15+ years of experience and world-class products, we are your trusted partner in the HVAC industry.',
    why: {
      premiumTitle: 'Premium Quality',
      premiumText: 'We select only the highest-quality products from globally recognized brands.',
      expertTitle: 'Expert Support',
      expertText: 'Our HVAC experts provide 24/7 technical support to find the best solution.',
      fastTitle: 'Fast Delivery',
      fastText: 'Rapid and reliable delivery across Turkey.'
    },
    whyVentHub: {
      title: 'Why',
      subtitle: 'Turkey\'s trusted HVAC e-commerce platform',
      features: {
        brands: {
          title: 'Premium Brands',
          description: 'Vortice, Casals and industry leading brands products'
        },
        support: {
          title: 'Expert Support',
          description: 'Professional technical consultancy service'
        },
        delivery: {
          title: 'Fast Delivery',
          description: 'Delivered to your door in 2-5 business days across Turkey'
        }
      },
      badges: {
        premium: 'Premium Brands',
        ce: 'CE Certified',
        warranty: '2 Years Warranty',
        shipping: 'Same Day Shipping'
      },
      authorizedDealer: {
        prefix: 'VentHub is the authorized dealer of',
        brand: 'Vortice',
        suffix: 'products in Turkey.'
      }
    },
    stats: {
      premiumBrands: 'Premium Brands',
      productTypes: 'Product Types',
      yearsExperience: 'Years Experience',
      happyCustomers: 'Happy Customers'
    },
    galleryTitle: 'Product Gallery',
    gallerySubtitle: 'Browse featured products',
    caseStudies: {
      title: 'Success Stories',
      subtitle: 'Results from real projects',
      viewDetails: 'View Details',
      items: {
        parking: {
          title: 'Parking Jet Fan Project',
          summary: 'Significant reduction in energy consumption and improvement in air quality with CO sensor control.',
          metrics: {
            energySavings: 'Energy Savings',
            duration: 'Duration'
          }
        },
        airCurtain: {
          title: 'Air Curtain Application',
          summary: 'Increased entrance comfort, reduced heat loss, and temperature stability around the door.',
          metrics: {
            comfortIncrease: 'Comfort Increase',
            roi: 'Return on Investment'
          }
        }
      }
    }
  },
  homeCta: {
    title: 'Let’s Talk About Your Project',
    subtitle: 'Give us brief info, we’ll shape the right solution together.',
    button: 'Get Quote / Expert Support'
  },
  homeProcess: {
    title: 'How We Work',
    subtitle: 'A transparent and predictable process from kickoff to delivery',
    stepPrefix: 'Step',
    steps: {
      need: {
        title: 'Understanding Your Needs',
        desc: 'We clarify the use case via a short call or form.'
      },
      analysis: {
        title: 'Analysis & Calculation',
        desc: 'We review airflow, pressure, acoustics, energy efficiency and regulations.'
      },
      proposal: {
        title: 'Solution / Proposal',
        desc: 'We propose suitable product families, alternatives and lead times.'
      },
      implementation: {
        title: 'Implementation Support',
        desc: 'We streamline with install guides, commissioning and technical support.'
      },
      support: {
        title: 'Support',
        desc: 'After-sales training, spare parts and service network for sustainability.'
      }
    }
  },
  homeTrust: {
    title: 'Trust & Compliance',
    subtitle: 'Our infrastructure, security and processes are transparent and standards-compliant.',
    kvkk: {
      title: 'KVKK Compliant',
      desc: 'Personal data is stored securely and used only where necessary.'
    },
    payment: {
      title: 'Secure Payment (iyzico)',
      desc: '3D Secure and advanced anti-fraud checks.'
    },
    returns: {
      title: 'Easy Returns/Exchanges',
      desc: 'Transparent procedures and fast, result-focused support.'
    }
  },
  homeFaq: {
    title: 'FAQs (Short)',
    subtitle: 'Quick answers to essentials — see our support page for more.',
    readMore: 'Read more →',
    items: {
      airCurtain: {
        q: 'When should I use an air curtain?',
        a: 'Used at entrances to improve comfort and reduce energy loss; creates an air barrier at the opening.'
      },
      jetFan: {
        q: 'How is jet fan selection done?',
        a: 'Calculated by parking volume, CO/NOx sensors, air change rate and layout plan.'
      },
      hrv: {
        q: 'What should I consider when choosing HRV?',
        a: 'Airflow, heat recovery efficiency, pressure loss and noise levels are key.'
      }
    }
  },
  homeSpotlight: {
    title: 'Featured Applications',
    subtitle: 'Move the pointer to spotlight content',
    items: {
      parkingJetFan: {
        title: 'Parking Jet Fan',
        desc: 'CO sensor control and energy saving'
      },
      airCurtain: {
        title: 'Air Curtain',
        desc: 'Entrance comfort and reduced heat loss'
      },
      hrv: {
        title: 'Heat Recovery (HRV)',
        desc: 'Indoor air quality and efficiency'
      },
      smokeExhaust: {
        title: 'Smoke Exhaust',
        desc: 'Emergency management'
      }
    }
  },
  homeGallery: {
    title: 'Application Showcase',
    subtitle: 'Quick look at real-world use cases',
    productsCta: 'View Products',
    guideCta: 'Open Guide',
    items: {
      parking: {
        title: 'Parking Ventilation',
        subtitle: 'Jet fan / CO control'
      },
      airCurtain: {
        title: 'Air Curtain',
        subtitle: 'Entrance comfort'
      },
      heatRecovery: {
        title: 'Heat Recovery',
        subtitle: 'Energy efficiency'
      },
      industrialKitchen: {
        title: 'Industrial Kitchen',
        subtitle: 'Hood and duct'
      },
      smokeExhaust: {
        title: 'Smoke Exhaust',
        subtitle: 'Emergency'
      },
      hvac: {
        title: 'Heating/Cooling',
        subtitle: 'Comfort HVAC'
      }
    }
  },
  homeShowcase: {
    slide1: {
      title: 'Expertise in Industrial Ventilation',
      subtitle: 'Solutions tailored to your project and the right product selection'
    },
    slide2: {
      title: 'Energy Efficiency & Comfort',
      subtitle: 'Better performance at lower cost with proper engineering'
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
    categoryCard: {
      seriesCount: '{{count}} series',
    },
    orbital: {
      dragHint: 'Drag to Spin',
    },
    category3DIcon: {
      dragHint: 'Hold to Rotate',
    },
    smartInference: {
      aiInsightBadge: 'AI INSIGHT V2.1',
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
      projectNamePlaceholder: 'Project Name (e.g. Hilton Hotel Renovation)',
      cancel: 'Cancel',
      footerHint: 'You can manage your projects from the my account page, download product lists as PDF, or request a quote.',
    },
    breadcrumbDiscover: 'Discover',
    heroTitle: 'Discover HVAC products: engineering-led selection, fast quotes',
    heroSubtitle: 'Find the right product quickly with application-guided areas, popular categories and featured products.',
    itemsListed: 'items listed',
    resultsFound: 'results found',
    heroValue1: 'Certified, reliable products',
    heroValue2: 'Engineering support and right selection',
    heroValue3: 'Fast quote / guidance',
    helpCtaTitle: 'Not sure? Let\'s choose the right product by application.',
    helpCtaSubtitle: 'Share your project details; our engineering team will respond quickly.',
    applicationTitle: 'Solutions by Application',
    popularCategories: 'Popular Categories',
    discoverVisual: 'Discover visual area',
    searchResultsTitle: 'Search Results',
    searchSeoTitle: 'Search: {{q}}',
    searchSeoDesc: 'Search results for "{{q}}"',
    discoverSeoDesc: 'Discover products, featured items and popular categories on VentHub.',
    hubBadge: 'Turkey\'s HVAC Expert',
    hubTitle: 'Professional HVAC Solutions',
    hubSubtitle: 'Air curtain, industrial fan and heat recovery systems. Let\'s find the right product for your needs together.',
    searchPlaceholder: 'Search product or model...',
    noResults: 'No Results Found',
    noResultsDesc: 'Please clear filters or try a different term.',
    clearFilters: 'Clear Filters',
    heroAlt: 'HVAC Products Discovery Image',
    searchAriaLabel: 'Search Products',
    searchHelp: 'Start typing for detailed filters.',
    allProductsTitle: 'All Our Products',
    emptyDesc: 'Select one of the categories to see more products.',
    emptyTitle: 'No Products Found',
    systemTotalPrefix: 'All in system',
    viewGrid: 'Grid',
    viewList: 'List'
  },
  applications: {
    parking: {
      title: 'Parking Ventilation',
      subtitle: 'Solutions requiring high airflow and pressure'
    },
    airCurtain: {
      title: 'Mall / Entrance Air Curtain',
      subtitle: 'Entrance solutions that reduce energy loss'
    },
    heatRecovery: {
      title: 'Heat Recovery',
      subtitle: 'Efficient HVAC and energy saving'
    },
    'air-curtain': {
      title: 'Mall / Entrance Air Curtain',
      subtitle: 'Entrance solutions that reduce energy loss'
    },
    'heat-recovery': {
      title: 'Heat Recovery',
      subtitle: 'Efficient HVAC and energy saving'
    }
  },
  megamenu: {
    elite: {
      defaultDescription: 'High-quality ventilation solutions.',
      viewAll: 'View All',
    },
    classic: {
      logoInitial: 'V',
      title: 'Categories',
    },
    categoryHub: {
      featuredTechnology: 'FEATURED TECHNOLOGY',
      defaultDescription: 'High-performance, smart industrial solution.',
      back: 'Go Back',
      subCategoryCount: '{{count}} Subcategories',
    },
    navigation: 'Navigation Menu',
    quickAccess: 'Quick Access',
    myCart: 'My Cart',
    loadingCategories: 'Loading categories...',
    productCategories: 'Product Categories',
    pickCategory: 'Choose a category for premium HVAC solutions',
    subcategories: 'subcategories',
    more: 'more'
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
    quickOrder: 'Quick Order',
    recentlyViewed: 'Recently Viewed',
    favorites: 'Favorites',
    cart: 'Cart',
    brandName: 'VentHub',
    brandTagline: 'HVAC Premium',
    commandSearch: 'Quick search... (/)',
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
    termsTitle: 'Terms of Use (Draft)'
  },
  admin,
  footer: {
    quickLinks: 'Quick Links',
    categories: 'Categories',
    contact: 'Contact',
    workingHours: 'Working Hours',
    weekdays: 'Monday - Friday',
    saturday: 'Saturday',
    rights: 'All rights reserved.',
    address: 'Teknokent Mah. Teknopark Blv.\nNo: 1/4A 34906 Pendik/Istanbul',
    email: 'info@venthub.com.tr',
    phone: '+90 (216) 123-45-67',
    social: {
      facebook: 'Facebook',
      instagram: 'Instagram',
      linkedin: 'LinkedIn',
      twitter: 'Twitter'
    }
  },
  contactPage: {
    form: {
      heroBadge: 'Global Connectivity',
      heroTitle: 'Let\'s Shape Your',
      heroTitleAccent: 'Project Together',
      heroDesc: 'Get in touch directly with our expert engineering team for technical documentation, product selection, or custom quotes.',
      cardPhoneTitle: 'Engineering Line',
      cardPhoneLabel: 'Call Now',
      cardEmailTitle: 'Technical Quote',
      cardEmailLabel: 'Send Email',
      cardOfficeTitle: 'Head Office',
      cardOfficeValue: 'Teknopark İstanbul, Pendik',
      cardOfficeLabel: 'Get Directions',
      directAccessLabel: 'Direct Access',
      supportTitle: 'Technical Support',
      supportTitleAccent: 'By Your Side Anytime',
      supportDesc: 'We deliver fast solutions for your complex HVAC projects. Request technical documentation or get instant support via our WhatsApp line.',
      whatsappCta: 'WhatsApp Engineering Line',
      responseTime: 'Average Response Time: 15 Minutes',
      successTitle: 'Your Message Has Been Sent',
      successDesc: 'Our engineering team will get back to you as soon as possible.',
      newMessage: 'Send a New Message',
      labelName: 'Full Name',
      labelEmail: 'Email',
      labelSubject: 'Subject / Project Name',
      labelMessage: 'Your Message',
      subjectPlaceholder: 'e.g. Car Park Jet Fan Project',
      messagePlaceholder: 'Write your requirements here...',
      submitButton: 'Submit Request',
    },
    title: 'Contact',
    subtitle: 'Contact us for your project or product questions. We will get back to you as soon as possible.',
    addressLabel: 'Address',
    addressLine1: 'Teknokent Mah. Teknopark Blvd.',
    addressLine2: 'No: 1/4A 34906 Pendik/Istanbul',
    phoneLabel: 'Phone',
    emailLabel: 'Email',
    quickTitle: 'Quick Contact',
    quickDesc: 'For urgent matters and quick responses, reach us directly via WhatsApp.',
    quickButton: 'Message on WhatsApp',
    formTitle: 'Quote/Contact Form',
    namePh: 'Full Name',
    emailPh: 'Email',
    subjectPh: 'Subject',
    messagePh: 'Your message / Project details',
    submit: 'Send',
    address: 'Address',
    businessInquiry: 'Business Partnership & Project Proposals',
    email: 'Your Email Address',
    error: 'An error occurred while sending the message. Please try again.',
    message: 'Your Message',
    name: 'Your Full Name',
    officialDistributor: 'Official Distributor & Engineering Partner',
    phone: 'Your Phone Number',
    subject: 'Subject',
    submitting: 'Submitting...',
    success: 'Your message has been successfully delivered. We will contact you as soon as possible.',
    workingHours: 'Working Hours'
  },
  aboutPage: {
    title: 'About VentHub',
    subtitle: 'Your trusted partner for premium HVAC solutions. Corporate supply, engineering-assisted selection and fast quote processes.',
    heroTitle: 'Turkey\'s Trusted HVAC Platform',
    heroSubtitle: 'With over 15 years of experience in professional ventilation solutions, we bring world-class products to Turkey.',
    experienceLabel: 'Since 2009',
    stats: {
      launchYear: 'Launch Year',
      premiumBrands: 'Premium Brands',
      productTypes: 'Product Types',
      deliveryTarget: 'Delivery Target',
      yearsExperience: 'Years experience',
      brands: 'Global Brands',
      clients: 'Happy Customers',
      projects: 'Completed Projects',
      years: 'Years of Experience'
    },
    values: {
      itemsTitle: 'Values That Define Us',
      itemsSubtitle: 'We prioritize our customers\' needs in every decision we make',
      mission: {
        title: 'Our Mission',
        description: 'To make professional HVAC solutions accessible in Turkey, offering world-class products to our B2B customers.'
      },
      vision: {
        title: 'Our Vision',
        description: 'To be Turkey\'s reference e-commerce platform in the ventilation industry, growing as a trusted representative of global brands.'
      },
      values: {
        title: 'Our Values',
        description: 'Quality, reliability, customer satisfaction, and sustainability form the basis of our principles.'
      }
    },
    whyTitle: 'Why VentHub?',
    whySubtitle: 'We work to be worthy of your trust',
    trustBadges: {
      premium: {
        label: 'Premium Brands',
        sublabel: 'Global Manufacturers'
      },
      ce: {
        label: 'CE Certified Products',
        sublabel: 'European Standards'
      },
      original: {
        label: 'Original Products',
        sublabel: 'Quality Guarantee'
      },
      reliable: {
        label: 'Reliable Platform',
        sublabel: 'Professional Service'
      }
    },
    bullets: {
      bullet1: 'Engineering-focused selection support and proper product guidance',
      bullet2: 'Transparent communication in stock, delivery and after-sales',
      bullet3: 'KVKK/iyzico compliant, secure payment and data protection'
    },
    cta: {
      title: 'Let\'s Work Together',
      subtitle: 'Find the most suitable HVAC solution for your project together. Our expert team is ready to help you.',
      primary: 'Explore Products',
      secondary: 'Contact Us'
    },
    experience: 'Years of Experience',
    distributorship: 'Global Distributorship',
    completedProject: 'Completed Projects',
    shippingNetwork: 'Province Delivery Network',
    precisionTitle: 'Engineering Precision',
    precisionDesc: 'We do not just sell products; we offer engineering solutions with project-specific airflow, pressure, and efficiency calculations.',
    standardsTitle: 'Global Standards',
    standardsDesc: 'As the Turkish representative of world-leading HVAC brands, we bring the latest and certified technologies to the local market.',
    trustTitle: 'Operational Trust',
    trustDesc: 'With our Teknopark Istanbul headquarters and wide inventory network, we deliver right on time, remaining loyal to your project schedules.',
    heroBadge: 'Engineering Excellence Since 2009',
    heroTitleText: 'We Redefine',
    heroTitleItalic: 'the Air',
    heroDesc: 'VentHub is the authority in Turkey for highly efficient, technological, and sustainable ventilation systems for modern living and industrial spaces.',
    storyTitle: 'We Build the Climate',
    storyTitleItalic: 'of the Future Today',
    storyDesc1: 'VentHub is positioned not just as a supplier but as a technological solution partner in the ventilation sector. For more than 15 years, we bring Europe\'s most prestigious brands together with Turkey\'s largest projects.',
    storyDesc2: 'In our operations managed from our Teknopark Istanbul headquarters, we prioritize engineering ethics and operational excellence above everything. For us, every product is a component, and every project is a work of ventilation art.',
    teamTitle: '50+ Expert Engineers &',
    teamSubtitle: 'Technical Operations Staff',
    brandTitle: 'Our Authorized Distributor',
    brandTitleItalic: 'Network',
    ctaTitle: 'Are You Ready to Meet',
    ctaTitleItalic: 'Your Engineering Partner?',
    ctaContact: 'Contact Us',
    ctaExplore: 'Explore Products',
    seoDescription: 'VentHub: Premium HVAC distributor of Turkey. 15 years of experience and engineering-oriented ventilation solutions.',
    history: 'Our History',
    mission: 'Our Mission',
    team: 'Our Team',
    vision: 'Our Vision'
  },
  category: {
    family: {
      variantCount: '{{count}} variants',
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
      variantCount: 'Variant count',
    },
    noProductsFound: 'No products found matching these criteria',
    howItWorks: {
      stepNumberLabel: '{{number}}. {{title}}',
      detailIcon: '💡',
    },
    faq: {
      heading: 'Frequently Asked Questions',
      subtitle: 'The most common questions about air curtains',
      moreQuestions: 'Do you have other questions?',
      contactUs: 'Contact us →',
      q1: 'Does an air curtain really save energy?',
      a1: 'Yes, an air curtain preserves the indoor temperature while the door is open and can provide energy savings of up to 30%. This saving is especially pronounced in businesses with frequent door openings (stores, restaurants, markets).',
      q2: 'Should I choose an electric or an ambient-air model?',
      a2: 'This depends on where you use it. If you want heating at the doorway during winter, an electric heated model is ideal. If you have a cold storage room or an existing heating system, an ambient-air model is sufficient and more economical.',
      q3: 'What size should the air curtain be?',
      a3: 'The air curtain width should be equal to or slightly wider than the door width. For example, a 120 cm or 150 cm model is suitable for a 120 cm door. Installation height also matters - pay attention to the maximum height stated in the device\'s technical specifications.',
      q4: 'Is installation difficult?',
      a4: 'Air curtains are usually mounted by hanging them above the door. Professional installation is recommended, but a technician with basic electrical knowledge can easily install one. The installation kit and mounting guide come with the product.',
      q5: 'Does it require maintenance?',
      a5: 'Minimal maintenance is sufficient. Cleaning the filters and dusting the fan blades 1-2 times a year is recommended. Regular maintenance extends the device\'s lifespan and preserves its performance.',
      q6: 'How long is the Vortice warranty?',
      a6: 'Vortice products are sold with a 2-year manufacturer warranty. Under the warranty, faults arising from manufacturing defects are repaired or replaced free of charge. As an authorized dealer, we handle your warranty processes quickly.',
    },
    trustSignals: {
      ce: 'CE',
      iso9001: 'ISO 9001',
      authorizedDealerTitle: 'Authorized Dealer',
      authorizedDealerDesc: 'Official Vortice Türkiye distributor',
      warrantyTitle: '2-Year Warranty',
      warrantyDesc: 'Manufacturer warranty',
      securePaymentTitle: 'Secure Payment',
      securePaymentDesc: 'SSL-encrypted transaction',
      fastShippingTitle: 'Fast Shipping',
      fastShippingDesc: 'Ships from stock',
      installmentTitle: 'Installment Options',
      installmentDesc: 'Up to 12 installments',
      techSupportTitle: 'Technical Support',
      techSupportDesc: 'Expert consultation',
      certified: 'Certified',
      quality: 'Quality',
      compassoDoro: 'Compasso d\'Oro',
      designAward: 'Design Award',
    },
    typeComparison: {
      sectionTitle: 'Which Type of Air Curtain Is Right for You?',
      sectionSubtitle: 'Choose the right type for your needs. Both offer the same quality, designed for different purposes.',
      electricSubtitle: 'Ideal for winter use',
      electricBenefit1: 'Warm air barrier at the entrance',
      electricBenefit2: 'Energy savings during winter months',
      electricBenefit3: 'Improves customer comfort',
      electricBenefit4: 'Thermostat-controlled heating',
      electricBestFor1: 'Store entrances',
      electricBestFor2: 'Restaurant doors',
      electricBestFor3: 'Hotel lobbies',
      electricBestFor4: 'In cold climates',
      electricNotFor1: 'Cold storage rooms',
      electricNotFor2: 'Summer use',
      ambientTitle: 'Ambient Air',
      ambientSubtitle: 'Focused on energy savings',
      ambientBenefit1: 'Low energy consumption',
      ambientBenefit2: 'Cold chain protection',
      ambientBenefit3: 'Hygiene barrier',
      ambientBenefit4: 'Supplement to existing heating system',
      ambientBestFor1: 'Cold storage rooms',
      ambientBestFor2: 'Supermarket aisles',
      ambientBestFor3: 'Hospitals',
      ambientBestFor4: 'Summer venues',
      ambientNotFor1: 'Unheated spaces',
      ambientNotFor2: 'In very cold climates',
      advantagesLabel: 'ADVANTAGES',
      bestForLabel: 'BEST FOR:',
      notForLabel: 'NOT RECOMMENDED:',
      modelsCta: '{{title}} Models',
      stillUndecided: 'Still undecided?',
      wizardPitch: 'Our 2-minute needs analysis wizard will recommend the most suitable type and model for you.',
      helpMe: 'Help Me',
    },
    bottomCta: {
      nextStep: 'Your Next Step',
      helpText: 'Let us help you find the most suitable {{category}}',
      viewAllProducts: 'View all products',
      findFit: 'Find the Right One for Me',
      findFitDesc: 'The right model in 3 steps',
      expertSupport: 'Expert Support',
      expertSupportDesc: 'Get project consulting',
      backToTop: 'Back to Top',
    },
    problemSection: {
      headerTitle: 'How Much Energy Is Escaping Through Your Door?',
      headerSubtitle: 'An open door = an open wallet. Every day you lose energy and money without realizing it.',
      energyLossTitle: 'Energy Loss',
      energyLossDesc: 'The average annual cost of heat escaping through an open door',
      tempDiffTitle: 'Temperature Difference',
      tempDiffDesc: 'The indoor-outdoor temperature difference when the door is opened',
      airflowTitle: 'Airflow',
      airflowDesc: 'Uncontrolled wind and dust entry',
      pestTitle: 'Pest Entry',
      pestDesc: 'Free passage of insects and dust particles',
      crossMark: '❌',
      checkMark: '✓',
      withoutTitle: 'Without an Air Curtain',
      withoutPoint1: 'Continuous heat loss',
      withoutPoint2: 'High energy bills',
      withoutPoint3: 'Low comfort',
      withoutPoint4: 'Easy pest entry',
      withTitle: 'With an Air Curtain',
      withPoint1: 'Invisible energy barrier',
      withPoint2: 'Up to 30% savings',
      withPoint3: 'Comfortable indoor environment',
      withPoint4: 'Shield against pests',
    },
    landing: {
      expertiseArea: 'Area of Expertise',
      descriptionFallback: 'Discover professional solutions with their technical details.',
      detailedReview: 'View Details',
      viewModels: 'View Models',
      dehumidifierTitle: 'Engineering Precision in Humidity Control',
      dehumidifierDesc: 'Maintain ideal air quality with dehumidification technologies optimized for industrial and comfort spaces.',
      dehumidifierCapacityValue: '35L/Day',
      dehumidifierCapacityLabel: 'Capacity',
      dehumidifierNoiseValue: '42dB',
      dehumidifierNoiseLabel: 'Quiet Operation',
      modelsSuffix: 'Models',
      solutionsListed: '{{count}} Technical Solutions Listed',
      filterAll: 'All Models',
      filterQuiet: 'Quietest',
      venthubSolution: 'VentHub Solution',
    },
    series: {
      technicalFamily: 'Technical Product Family',
      heroDefaultDesc: 'Browse professional ventilation solutions by their technical series.',
      seriesDetail: 'Series Detail',
      seriesHeading: '{{name}} SERIES',
      seriesConfigCount: 'A high-efficiency solution family offering {{count}} different technical configurations.',
      showcaseView: 'SHOWCASE',
      matrixView: 'MATRIX',
      startingFrom: 'Starting',
      requestQuote: 'Request a Quote',
      colModel: 'Model',
      colAirflow: 'Airflow (m³/h)',
      colNoise: 'Noise (dB)',
      colPower: 'Power (W)',
      colPrice: 'Price',
      colAction: 'Action',
      skuLabel: 'SKU: {{sku}}',
      trust1Title: 'Technical Performance',
      trust1Desc: 'All data is 100% verified with factory test reports.',
      trust2Title: 'Precision Engineering',
      trust2Desc: 'The most accurate airflow and pressure match for your project.',
      trust3Title: 'Expert Support',
      trust3Desc: 'Instant technical documentation and selection support from our engineers.',
    },
    loading: 'Loading category... ',
    notFound: 'Category Not Found',
    backHome: 'Back to home',
    breadcrumbHome: 'Home',
    premiumCollection: 'Premium Collection',
    findModel: 'Find Suitable Model',
    aboutCategory: 'About Category',
    productCount: 'Product Count',
    goToCategory: 'Go to Category',
    discoverMore: 'Discover More',
    whichAirCurtain: 'Which Air Curtain Should You Choose?',
    airCurtainHelper: 'Let us help you determine the best solution for your needs.',
    ambientAir: 'Ambient Air (Unheated)',
    ambientAirDesc: 'Ideal for areas with little temperature difference between indoor and outdoor or situations where only air isolation is required.',
    electricHeated: 'Electric Heated',
    electricHeatedDesc: 'Increases comfort by blowing warm air inside while breaking the cold air coming from outside in winter months.',
    ambientPoint1: 'Provides minimum energy consumption.',
    ambientPoint2: 'It is the most accurate choice for cold storage rooms.',
    ambientPoint3: 'Used in regions that are cool in summer and mild in winter.',
    electricPoint1: 'Creates a "Warm Welcome" effect at the entrance.',
    electricPoint2: 'Supports the space as an additional heating source.',
    electricPoint3: 'Recommended for Mall, Store and Restaurant entrances.',
    inspectModels: 'Inspect Models',
    modernLiving: 'Modern Living Spaces',
    modernLivingDesc: 'Minimalist design and comfort in whisper quietness.',
    flexibilityEsthetics: 'Flexibility and Aesthetics',
    smartControl: 'Smart Control',
    smartControlDesc: 'Uninterrupted fresh air with automatic speed adjustment according to air quality.',
    longTermInvestment: 'Long Term Investment',
    longTermInvestmentDesc: 'Maintenance-free motor technology and durable polymer body.',
    allSeries: 'All Series',
    chooseSeriesDesc: 'Choose the series that suits your needs',
    inspectSeries: 'Inspect Series',
    whyCategory: 'Why {{category}}?',
    electricVsAmbientAlt: 'Electric vs Ambient Air Comparison',
    modernLoftAlt: 'Modern Loft Application',
    lineoQuietQuote: 'Lineo Quiet ES is not just a fan; it is the silent hero of modern architecture.',
    industrialLabAlt: 'Industrial Laboratory Application',
    lineoTechnicalAlt: 'Lineo Quiet Technical Detail',
    lineoNeonAlt: 'Lineo Quiet Neon Engineering Design',
    vorticeHeritageAlt: 'Vortice Lineo Brand Heritage and History',
    airCurtainDiagramAlt: 'Air Curtain Operating Principle',
    whyCategorySubtitle: 'We add value to your projects with production at industrial standards and high engineering solutions.',
    lineoTechnologyTitle: 'Vortice Lineo Quiet ES Technology',
    howItWorksTitle: 'How It Works',
    lineoTechnologyDesc: 'Perfect harmony of silence and performance. Meet the advanced aerodynamic design.',
    howItWorksDesc: 'The air curtain creates an invisible barrier, separating the indoor and outdoor environments.',
    why1Title: 'High Efficiency',
    why1Desc: 'Energy-saving motor technology in compliance with ErP standards.',
    why2Title: 'Silent Operation',
    why2Desc: 'Special acoustic insulation and aerodynamic fan design.',
    why3Title: 'Long Life',
    why3Desc: 'Corrosion-resistant body and heavy-duty components.',
    filters: 'Filters',
    subcategories: 'Sub-categories',
    priceRange: 'Price Range',
    brands: 'Brands',
    techFilters: 'Technical Filters',
    airflow: 'Airflow (m³/h)',
    showcase: {
      defaultDescription: 'The technical authority on high-performance, intelligent and sustainable ventilation systems.',
      premiumTitle: 'Premium Engineering Solutions',
      catalog: 'Category Catalog',
      subGroups: 'Sub Product Groups',
      exploreSeries: 'Explore Series',
      guarantee: 'VentHub Guarantee',
      discover: 'Discover',
      whyVenthubTitle: 'Why VentHub Engineering?',
      premiumEngineeringAlt: 'Premium Engineering Visual',
      features: [
        { title: 'Industrial Certification', desc: 'Fully approved systems that have passed international tests.' },
        { title: 'High Performance', desc: 'Aerodynamic design with maximum efficiency and low energy consumption.' },
        { title: 'Smart Control', desc: 'Seamless integration with BMS and central automation systems.' }
      ]
    },
    pressure: 'Pressure (Pa)',
    noise: 'Noise [dB(A)] (Max)',
    clearFilters: 'Clear Filters',
    sortByName: 'Sort by Name',
    sortByPriceLow: 'Price: Low to High',
    sortByPriceHigh: 'Price: High to Low',
    noProducts: 'No Products Found',
    noProductsDesc: 'No products match your filters.',
    compareBar: 'Compare',
    open: 'Open',
    clean: 'Clear',
    compareTitle: 'Comparison',
    close: 'Close',
    feature: 'Feature',
    labelBrand: 'Brand',
    labelModel: 'Model',
    labelPrice: 'Price',
    localSearchPlaceholder: 'Search within this category (name/brand/model/SKU)',
    gridViewAria: 'Grid view',
    listViewAria: 'List view',
    minPlaceholder: 'Min',
    maxPlaceholder: 'Max',
    ltePlaceholder: '≤',
    howItWorksAirCurtain: {
      title: 'How an Air Curtain Works?',
      subtitle: 'A simple yet effective principle: Invisible air wall',
      diagramAlt: 'Air Curtain Working Principle',
      steps: [
        {
          title: 'Powerful Airflow',
          description: 'The device creates a controlled airflow at high speed.',
          detail: 'Uniform and strong airflow is provided by specially designed fans and blades.'
        },
        {
          title: 'Invisible Barrier',
          description: 'The airflow creates an invisible curtain at the door opening.',
          detail: 'This air curtain separates the indoor and outdoor environments without a physical barrier.'
        },
        {
          title: 'Isolation',
          description: 'Outdoor air, dust, insects, and odors cannot enter.',
          detail: 'Indoor temperature is preserved, hygiene standards are maintained.'
        },
        {
          title: 'Comfort',
          description: 'Ideal environment is provided for customers and employees.',
          detail: 'Even if the door remains open, indoor comfort is not compromised.'
        }
      ]
    },
    vorticeBrand: {
      compassoDoro: 'Compasso d\'Oro',
      italianEngineering: 'Italian Engineering',
      whyVortice: 'Why Vortice?',
      description1: 'Founded in Milan in 1954, Vortice has been the pioneer of ventilation technology worldwide for over 70 years.',
      description2: 'Founded by Attilio Pagani, the company won Italy\'s most prestigious design award, Compasso d\'Oro, with its very first product. Today, it serves millions of users in more than 90 countries.',
      authorizedDealer: 'Authorized Dealer',
      ceCertified: 'CE Certified',
      warranty2y: '2-Year Warranty',
      premiumComfort: 'Premium Comfort',
      authorizedDealerNotice: 'VentHub is the authorized dealer of Vortice products in Turkey.',
      highlights: [
        {
          value: '70+',
          label: 'Years Experience',
          desc: 'Ventilation since 1954'
        },
        {
          value: '90+',
          label: 'Countries',
          desc: 'Global distribution network'
        },
        {
          value: '3x',
          label: 'Compasso d\'Oro',
          desc: 'Italy\'s most prestigious design award'
        },
        {
          value: '#1',
          label: 'Europe',
          desc: 'Leader in the ventilation sector'
        }
      ]
    }
  },
  pdp: {
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
    loading: 'Loading product...',
    productNotFound: 'Product Not Found',
    backHome: 'Back to home',
    back: 'Go Back',
    featured: 'Featured',
    brand: 'Brand',
    model: 'Model',
    inStock: 'In Stock',
    outOfStock: 'Out of Stock',
    vatIncluded: '(VAT Included)',
    vatExcluded: '(+VAT)',
    qty: 'Quantity:',
    addToCart: 'Add to Cart',
    askStock: 'Ask about stock',
    techQuote: 'Request Technical Offer',
    askPriceButton: 'Request Quote',
    freeShipping: 'Free Shipping',
    warranty2y: '2-Year Warranty',
    support247: '24/7 Support',
    descFallback: 'A detailed description for this product will be added soon.',
    relatedGuide: 'Related Guide',
    statusLabel: 'Status',
    relatedProducts: 'Related Products',
    officialDistributor: 'OFFICIAL DISTRIBUTOR',
    priceAvailability: 'Price & Availability',
    shareCopied: 'Link copied!',
    variantDetails: 'Variant Details',
    messages: {
      pdfStarted: 'Generating PDF...'
    },
    errors: {
      pdfFailed: 'Failed to generate PDF.'
    },
    labels: {
      productFeatures: 'Product Features',
      productDescription: 'Product Description',
      technicalSpecs: 'Technical Specifications',
      category: 'Category',
      price: 'Price',
      physicalDimensions: 'Physical Dimensions',
      performanceMetrics: 'Performance Metrics',
      width: 'Width',
      height: 'Height',
      depth: 'Depth',
      weight: 'Weight',
      airflow: 'Airflow',
      pressure: 'Pressure',
      power: 'Power',
      noise: 'Noise Level',
      noSpecsAvailable: 'No technical specifications available for this product.',
      technicalDatasheet: 'TECHNICAL DATASHEET',
      engineeringAnalysis: 'Engineering Analysis',
      sku: 'SKU',
      datasheetPdf: 'DATASHEET (PDF)'
    },
    features: {
      materialQuality: 'Premium material and manufacturing quality',
      energyEfficient: 'Energy efficient design and low consumption',
      quietOperation: 'Quiet operation and minimal vibration',
      easyMaintenance: 'Easy installation and maintenance',
      durable: 'Long-lasting and durable'
    },
    diagramsExtra: {
      technicalDiagrams: 'Technical Diagrams',
      mounting: 'Mounting Diagram',
      electrical: 'Electrical Diagram',
      threeDViews: '3D Views',
      view3DModel: '3D Model View',
      interactiveModel: 'Interactive Model',
      dimensionedDrawing: 'Dimensioned Drawing',
      cadDwg: 'CAD - DWG Format',
      cadDwgAvailable: 'CAD - DWG Available'
    },
    docs: {
      installationGuide: 'Installation Guide',
      userManual: 'User Manual',
      maintenanceManual: 'Maintenance Manual',
      safetyInfo: 'Safety Information',
      warrantyTerms: 'Warranty Terms',
      technicalSpecsDoc: 'Technical Specifications',
      productCatalog: 'Product Catalog',
      technicalBrochure: 'Technical Brochure',
      productReleaseNotes: 'Product Release Notes',
      troubleshootingGuide: 'Troubleshooting Guide',
      sparePartsList: 'Spare Parts List'
    },
    actions: {
      download: 'Download',
      downloadCatalog: 'Download Catalog',
      downloadBrochure: 'Download Brochure',
      liveDataNotice: 'ℹ️ Data is updated in real-time',
      interactive3D: '3D VIEW',
      addToProject: 'Add to Project',
      removeFromWishlist: 'Remove from Favorites',
      addToWishlist: 'Add to Favorites',
      favorite: 'Favorite',
      share: 'Share'
    },
    cert: {
      ceCertificate: 'CE Certificate',
      iso9001: 'ISO 9001',
      tseCertificate: 'TSE Certificate',
      energyStar: 'Energy Star',
      ulCertificate: 'UL Certificate',
      ecoFriendly: 'Eco Friendly',
      rohsCompliant: 'RoHS Compliant',
      downloadCenter: 'Certificate Download Center',
      downloadAllZip: 'Download All Certificates (ZIP)',
      verify: 'Certificate Verification'
    },
    certLabels: {
      yearSuffix: '-2024',
      standardValue: 'ISO/EN-STD',
      certificateNo: 'Certificate No',
      validity: 'Validity',
      standard: 'Standard',
      efficiency: 'Efficiency'
    },
    sections: {
      general: 'General Info',
      models: 'Models',
      dimensions: 'Dimensions',
      diagrams: 'Diagrams',
      documents: 'Documents',
      brochure: 'Brochure/Catalog',
      certificates: 'Certificates',
      specs: 'Technical Specifications'
    },
    trust: {
      freeShipping: 'Free Shipping',
      securePayment: 'Secure Payment',
      warranty: 'Warranty'
    },
    engineering: {
      noise: {
        ultraQuiet: {
          label: 'Ultra Quiet Operation',
          desc: 'Whisper-quiet performance designed for acoustics-sensitive living and working environments.'
        },
        officeComfort: {
          label: 'Office Comfort Level',
          desc: 'Low noise level suitable for offices, libraries, and study rooms.'
        },
        standard: {
          label: 'Standard Noise Level',
          desc: 'Acceptable sound level for standard comfort zones and commercial spaces.'
        },
        industrial: {
          label: 'Industrial Noise Level',
          desc: 'Noise level designed for high-capacity ventilation in industrial plants.'
        }
      },
      efficiency: {
        diamond: {
          label: 'Diamond Energy Efficiency',
          desc: 'Maximum thermal efficiency minimizing energy consumption.'
        },
        platinum: {
          label: 'Platinum Energy Efficiency',
          desc: 'High thermal recovery rate providing significant energy savings.'
        },
        gold: {
          label: 'Gold Energy Efficiency',
          desc: 'Standard-compliant energy recovery efficiency for modern HVAC designs.'
        }
      },
      motor: {
        ec: {
          label: 'EC Motor Technology',
          desc: 'Brushless motor design with low energy consumption and precise speed control.'
        },
        ac: {
          label: 'AC Motor Technology',
          desc: 'Durable and reliable classic AC motor technology.'
        }
      },
      capacity: {
        highFlow: {
          label: 'High Airflow Capacity',
          desc: 'Ideal performance for medium to large residential and commercial spaces.'
        },
        industrialFlow: {
          label: 'Industrial Airflow Capacity',
          desc: 'High-capacity airflow designed for large industrial plants and warehouses.'
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
    securePayment: 'Protected by a secure payment system',
    itemTotal: 'Total',
    quoteItemsNotice: 'Your cart contains items with no price yet. The total covers priced items only; request a quote for those items to continue to payment.'
  },
  orders: {
    page: {
      showingCount: 'Showing {{shown}} / {{total}} orders',
      orderLabel: 'Order #',
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
    demoNote: 'This is a demo order for testing purposes',
    totalAmount: 'Total Amount',
    reorder: 'Reorder',
    viewReceipt: 'View Receipt',
    copied: 'Copied',
    copyFailed: 'Could not copy',
    reorderedToast: '{{count}} items added to cart',
    reorderNotFound: 'Items not found in stock',
    reorderError: 'Error during reorder',
    /** SKU as of the order date (snapshot) — not the current catalog SKU. */
    skuLabel: 'SKU: {{sku}}',
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
    orderTotal: 'Total Amount'
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
    goToLogin: 'Go to Login',
    registrationComplete: 'Registration Complete!',
    backHome: 'Back to Home',
    emailSentTitle: 'Email Sent!',
    emailSentDesc: 'A password reset link has been sent to {{email}}. Please check your email and click the link to set your new password.',
    backToLogin: 'Back to Login',
    tryAnotherEmail: 'Try Another Email',
    registrationCompleteTitle: 'Registration Complete!',
    registrationCompleteDesc: 'A verification link has been sent to your email. Please verify your account to complete registration.',
    or: 'or',
    googleSignIn: 'Sign in with Google',
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
    whatNext: 'What would you like to do?',
    continue: 'Continue Shopping',
    goToCart: 'Go to Cart',
    autoClose: 'This window will close automatically in 5 seconds'
  },
  checkout: {
    securePayment: {
      brand: 'Venthub HVAC',
      iyzicoSecure: 'Secure payment with iyzico',
    },
    orderSummary: {
      couponPlaceholder: 'Coupon code',
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
      standardEta: '3–5 business days',
      expressName: 'Express',
      expressEta: '1–2 business days',
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
      backToAddress: 'Back to Address'
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
    orderCompletedTitle: 'Your Order is Complete!',
    orderNoLabel: 'Order No',
    orderCompletedDesc: 'Your order has been received successfully. A confirmation email will be sent shortly.',
    dateLabel: 'Date',
    itemsCountLabel: 'Items',
    securedBy3d: 'Secured by 3D',
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
      statGlobal: 'Global',
    },
    sectionTitle: 'Premium HVAC Brands',
    sectionSubtitle: 'As the authorized distributor of leading global HVAC brands in Turkey, we offer top-quality ventilation solutions.',
    subtitlePart1: 'Trusted Partner of',
    subtitlePart2: 'World Giants',
    viewAll: 'See All Brands',
    pageTitle: 'Brands',
    pageSubtitle: 'As the authorized representative of the world\'s most prestigious HVAC manufacturers, we bring engineering masterpieces to your projects.',
    eyebrow: 'Global Signatures of Excellence',
    exploreBrand: 'Explore Brand',
    seoDesc: 'Premium HVAC brands under the VentHub umbrella',
    notFound: 'Brand not found',
    backToAll: 'Back to all brands',
    countryLabel: 'Country:',
    aboutBrand: 'information',
    trust: {
      eyebrow: 'Supply Chain Authority',
      title: 'Guaranteed Supply Directly from Manufacturer',
      description: 'Thanks to our direct strategic partnership with all our brands, you have access to the latest technologies, full technical support, and the most competitive lead times.',
      original: '100% Original Product',
      standard: 'Global Standard Compliance',
      imageAlt: 'Technical Infrastructure and HVAC Installation'
    },
    detail: {
      curatedSolutions: 'Curated Solutions',
      heritage: 'Engineering Heritage',
      authorityTitle: 'Technological Authority of Engineering',
      globalVision: 'Global Vision',
      globalVisionDesc: 'setting standards for efficiency and sustainability in projects worldwide, building the ventilation technologies of the future today.',
      technicalExcellence: 'Technical Excellence',
      technicalExcellenceDesc: 'Each product is tested to withstand the toughest industrial conditions and optimized for acoustic performance.',
      corporateSnapshot: 'Corporate Snapshot',
      headquarters: 'Headquarters',
      webAuthority: 'Web Authority',
      officialSite: 'Official Site',
      requestCatalog: 'Request Brand Catalogs',
      featuredSystems: 'Featured Systems',
      allProductGroups: 'All Product Groups',
      noProducts: 'Products for this brand will be added soon.',
      originSuffix: 'Origin',
      estPrefix: 'EST.'
    }
  },
  categories: {
    title: 'Product Categories',
    subtitle: 'Find professional ventilation solutions with our wide range covering all HVAC areas.',
    subCount: '{{count}} subcategories',
    allTitle: 'All Categories',
    variantCount: '{{count}} types'
  },
  quickView: {
    title: 'Quick View',
    close: 'Close',
    addToCart: 'Add to Cart',
    viewProduct: 'View Product',
    descFallback: 'Product description will be added soon.'
  },
  support: {
    contactCta: {
      title: 'Couldn\'t find the answer you were looking for?',
      subtitle: 'Contact us directly via WhatsApp and we\'ll be happy to help.',
      button: 'Ask on WhatsApp',
    },
    links: {
      faq: 'FAQ',
      returns: 'Returns & Exchanges',
      shipping: 'Shipping & Delivery',
      warranty: 'Warranty & Service'
    },
    home: {
      subtitle: 'Quickly find the information you need.',
      faqDesc: 'Orders, payment, installation and more',
      returnsDesc: 'Right of withdrawal, return process and conditions',
      shippingDesc: 'Delivery time, fees, tracking info',
      warrantyDesc: 'Warranty coverage and authorized service',
      knowledgeDesc: 'Topic-based guides and soon calculators'
    },
    returns: {
      title: 'Returns & Exchanges',
      desc1: 'You may use your right of withdrawal within 14 days. The product must be unused and resalable with invoice and all accessories included.',
      desc2: 'Please contact our support team with your order number for a return request. After approval, shipping instructions will be provided.'
    },
    shipping: {
      desc1: 'Delivery usually takes 1–5 business days and may vary depending on campaigns and stock.',
      desc2: 'Shipping fee/provider is shown at checkout. Tracking number will be sent via email.'
    },
    warranty: {
      desc1: 'Warranty coverage may vary by manufacturer/importer. Please keep the warranty card and user manual.',
      desc2: 'For service info or malfunction records, contact our support team.'
    },
    faq: {
      q1: 'When will my order be shipped?',
      a1: 'Usually within 1–5 business days after payment approval.',
      q2: 'What are the payment methods?',
      a2: 'You can pay securely with credit/debit cards via iyzico.',
      q3: 'Do you provide installation service?',
      a3: 'It may vary by product. Please contact our support team.'
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
      expressDetail: 'Express (1–2 business days)',
      standardDetail: 'Standard (3–5 business days)',
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
      orderNoSuffix: ': #{{code}}',
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
      defaultAddressesTitle: 'Default Addresses',
      shippingAddress: 'Shipping Address',
      billingAddress: 'Billing Address',
      notSetShipping: 'Default shipping address is not set.',
      notSetBilling: 'Default billing address is not set.',
      manageAddresses: 'Manage addresses',
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
      needHelpDesc: 'Get instant help with orders, returns, or balance.',
      customerService: 'Customer Service',
      wave: '👋',
      orderHash: '#{{code}}',
      shipStatus: {
        delivered: 'Delivered',
        shipped: 'Shipped',
        preparing: 'Preparing'
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
      defaultShippingTag: 'Default shipping',
      defaultBillingTag: 'Default billing',
      makeDefaultShipping: 'Set default for shipping',
      makeDefaultBilling: 'Set default for billing',
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
      addNew: 'Add New Profile',
      type: 'Type',
      individual: 'Individual',
      corporate: 'Corporate',
      titleLabel: 'Title (Optional)',
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
      setDefaultSuccess: 'Default profile updated',
      noProfiles: 'No saved invoice profiles'
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
      minLength: 'Password must be at least 8 characters',
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
    subtitle: 'Create quote requests and track the pricing process.',
    empty: 'You have no quote requests yet.',
    emptyHint: 'For products without a visible price, use "Request Quote" to open a request.',
    fetchError: 'Could not load quote records',
    itemsCount: '{{count}} items',
    requestCta: 'Request Quote',
    request: {
      title: 'Request Quote',
      itemsTitle: 'Requested Items',
      qty: 'Qty',
      note: 'Note (optional)',
      notePh: 'A short note about your project/needs (optional)',
      submit: 'Send Quote Request',
      cancel: 'Cancel',
      loginRequired: 'You need to sign in to request a quote',
      successToast: 'Your quote request has been received',
      errorToast: 'Could not create quote request',
      cartQuoteItems: 'Unpriced products in your cart'
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
      awaitingPricing: 'Awaiting pricing — our team is reviewing your request.',
      accept: 'Accept Quote',
      reject: 'Reject Quote',
      acceptConfirm: 'Are you sure you want to accept this quote?',
      rejectConfirm: 'Are you sure you want to reject this quote?',
      decisionSuccess: 'Your decision has been saved',
      decisionError: 'Could not save your decision',
      acceptedNext: 'You accepted the quote. Our team will contact you for the order steps.',
      backToList: 'Back to my quotes',
      notFound: 'Quote not found'
    },
    sourceLabels: {
      pdp: 'Product page',
      cart: 'Cart',
      project: 'Project'
    },
    statusLabels: {
      requested: 'Requested',
      quoted: 'Quoted',
      accepted: 'Accepted',
      rejected: 'Rejected',
      expired: 'Expired'
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
        priceRequired: 'Enter a price for every item before sending the quote'
      }
    }
  },
  lead: {
    message: 'Message',
    title: 'Technical Offer Request',
    product: 'Product',
    contactInfo: 'Contact Information',
    name: 'Full Name',
    company: 'Company',
    companyPlaceholder: 'Your company Inc.',
    cityPlaceholder: 'e.g. Istanbul',
    email: 'Email',
    phone: 'Phone',
    city: 'City',
    projectNeed: 'Project/Need',
    applicationArea: 'Application Area',
    select: 'Select',
    quantity: 'Quantity',
    budgetRange: 'Budget Range',
    timeframe: 'Timeframe',
    contactPref: 'Contact Preference',
    contactTime: 'Available time (e.g., 10:00–12:00)',
    consent: {
      text: 'I have read and agree.'
    },
    submit: 'Submit',
    submitting: 'Submitting...',
    cancel: 'Cancel',
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
      title: 'Professional Solutions\nFor Your Projects',
      description: 'Get special quotes directly with manufacturer/distributor prices for your industrial ventilation needs. Our engineering support team will get back to you quickly.',
      feature1: 'Free Project Support',
      feature2: 'Fast Pricing & Stock Information',
      feature3: 'Exclusive B2B Conditions'
    },
    success: {
      title: 'Request Received!',
      description: 'Your quote request has been successfully sent to our engineering team. We will contact you as soon as possible.'
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
      consent: 'You must accept the KVKK text'
    },
    defaultMessage: 'Detailed technical quote for {{productName}}...',
    aboutPage: {
      stats: {
        yearsExperience: 'Project Pipeline'
      }
    },
    cinematicShowcase: {
      eyebrow: 'TECHNICAL DETAIL',
      title: 'Masterpiece of Engineering',
      subtitle: 'Peak Performance and Efficiency',
      description: 'Each component is optimized to provide uninterrupted airflow in the most demanding industrial conditions.',
      cta: 'Review Technical Catalog',
      badge: 'Industrial Grade',
      componentLabel: 'System Component',
      hotspots: {
        motor: 'EC Motor Technology',
        motorDetail: 'Brushless motor structure providing low energy consumption and high torque.',
        clamps: 'Easy-Fit Clamps',
        clampsDetail: 'Special connection system allowing tool-free fast assembly and maintenance.',
        housing: 'Polymer Housing',
        housingDetail: 'Impact and corrosion-resistant, lightweight aerodynamic exterior surface.',
        airflow: 'Laminar Flow',
        airflowDetail: 'Internal vane design minimizing turbulence and reducing noise levels.'
      }
    },
    trustProof: {
      badge: 'Trusted',
      eyebrow: 'WHY VENTHUB?',
      title: 'Engineering and Trust-Driven Approach',
      subtitle: 'We add value to your projects with industry-leading brands and our expert engineering team.',
      items: {
        brands: {
          eyebrow: 'Competence',
          title: 'Global Brands',
          description: 'Official partner of the world\'s most reliable HVAC manufacturers.'
        },
        guidance: {
          eyebrow: 'Expertise',
          title: 'Project Support',
          description: 'Supporting you at every step from specification to commissioning.'
        },
        delivery: {
          eyebrow: 'Speed',
          title: 'Fast Delivery',
          description: 'On-time delivery across Turkey with our extensive stock network.'
        },
        support: {
          eyebrow: 'Continuity',
          title: 'After-Sales',
          description: 'Uninterrupted operation with technical support and spare parts warranty.'
        }
      }
    }
  },
  calculators: {
    recommendations: 'Recommendations',
    stepIndicator: {
      progress: 'Step {{current}} / {{total}}',
    },
    layout: {
      backLabel: 'Back to Products',
      disclaimer: 'This calculator is intended for preliminary sizing. Consult an HVAC engineer for precise project calculations.',
      contactPrompt: 'For your technical questions',
      contactLink: 'get in touch',
    },
    airCurtain: {
      trafficLowDesc: '< 50 passes/hour',
      trafficMediumDesc: '50-200 passes/hour',
      trafficHighDesc: '> 200 passes/hour',
      newCalculation: 'New Calculation',
      calculate: 'Calculate',
      title: 'Air Curtain Calculator',
      description: 'Ideal air curtain selection based on door dimensions and usage conditions',
      infoText: 'This tool performs pre-sizing in accordance with engineering standards (ISO 27327-1). It calculates required airflow, nozzle velocity, and motor power.',
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
          label: 'Comfort / Energy',
          desc: 'General commercial areas, shops',
          info: 'Provides energy savings for general commercial areas. Nozzle speed: 8-12 m/s'
        },
        insect: {
          label: 'Insect Control',
          desc: 'Food businesses, restaurants',
          info: 'Prevents insect entry for food businesses and restaurants. Nozzle speed: 12-15 m/s'
        },
        coldRoom: {
          label: 'Cold Room',
          desc: 'Cold storage, refrigerated',
          info: 'Minimizes temperature loss in cold storage rooms. Nozzle speed: 15-18 m/s'
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
        efficiencyOptimalDesc: 'Calculated parameters will provide ideal performance',
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
        shape: 'Duct Type',
        round: 'Circular',
        roundDesc: 'Spiral or welded pipe',
        rectangular: 'Rectangular',
        rectangularDesc: 'Angled duct',
        material: 'Material',
        steel: 'Galvanized Steel',
        pvc: 'PVC',
        flex: 'Flex Duct',
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
      infoText: 'Calculates annual energy saving potential of heat recovery units (HRV) or enthalpic recovery units (ERV).',
      form: {
        type: 'Device Type',
        hrv: 'HRV (Heat Recovery)',
        hrvDesc: 'Heat recovery only',
        erv: 'ERV (Energy Recovery)',
        ervDesc: 'Heat + Moisture recovery',
        climate: 'Climate Zone',
        cold: 'Cold',
        temperate: 'Temperate',
        hot: 'Hot',
        usage: 'Space Type',
        office: 'Office',
        commercial: 'Commercial',
        occupancy: 'Number of People',
        workingHours: 'Daily Operation',
        electricityPrice: 'Electricity Unit Price',
        sensibleEfficiency: 'Sensible Efficiency',
        latentEfficiency: 'Latent Efficiency',
        area: 'Area (m²)'
      },
      results: {
        heatingGain: 'Heating Gain',
        coolingGain: 'Cooling Gain',
        co2Reduction: 'CO₂ Reduction',
        co2Desc: 'Annual carbon emission reduction',
        payback: 'Payback Period',
        paybackDesc: 'Estimated return on investment'
      }
    },
    jetFan: {
      pageTitle: 'Jet Fan Calculator',
      pageDescription: 'Parking and tunnel jet fan thrust and ventilation calculation',
      pageInfoText: 'Calculates the required number of jet fans, thrust force, and ventilation airflow in enclosed parking lots or tunnels. Compliant with NFPA 502 and BS 7346 standards.',
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
      achParkingHint: 'Parking: 6-10 ACH recommended',
      achTunnelHint: 'Tunnel: 15+ ACH recommended',
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
      title: 'Jet Fan Calculator',
      description: 'Parking and tunnel jet fan thrust and ventilation calculation',
      infoText: 'Calculates the required number of jet fans, thrust force, and air exchange amount in enclosed parking lots or tunnels.',
      form: {
        appType: 'Application Area',
        parking: 'Parking',
        parkingDesc: 'Enclosed parking ventilation',
        tunnel: 'Tunnel',
        tunnelDesc: 'Road or subway tunnel',
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
        ach: 'Air Change Rate',
        totalThrust: 'Total Thrust Force',
        count: 'Number of Jet Fans'
      }
    }
  },
  categorySilentFan: {
    problem: {
      withoutMark: '✕',
      withMark: '✓',
      eyebrow: 'SOUND AND COMFORT',
      title: 'End Noise That Disrupts Your Peace',
      subtitle: 'Standard duct fans don\'t just move air; they move noise into your living spaces. Discover the new standard of silence with Vortice Lineo Quiet.',
      painPoints: [
        {
          title: 'Acoustic Pollution',
          description: 'The hum created by conventional fans makes it difficult to focus and reduces comfort.'
        },
        {
          title: 'Low Efficiency',
          description: 'Noisy fans are often aerodynamically inefficient and consume more energy.'
        },
        {
          title: 'Vibration Issues',
          description: 'Poorly isolated devices cause vibration and secondary noise on mounting surfaces.'
        },
        {
          title: 'Disrupted Focus',
          description: 'Constant noise can reduce productivity in libraries and offices by 20%.'
        }
      ],
      visual: {
        without: 'With Standard Fan',
        with: 'With Lineo Quiet',
        withoutPoints: ['High decibel levels', 'Mechanical vibration', 'Turbulent airflow', 'Energy loss'],
        withPoints: ['Whisper quiet', '60% energy saving', 'Laminar airflow', 'Vibration-free operation']
      }
    },
    howItWorks: {
      eyebrow: 'TECHNOLOGY',
      title: 'Engineering Behind Silent Power',
      subtitle: 'Vortice Lineo Quiet offers whisper-level performance with its aerodynamically optimized housing and sound-absorbing layers.',
      steps: [
        {
          title: 'Sound-Absorbing Housing',
          description: 'Special composite outer body traps motor noise inside.'
        },
        {
          title: 'Laminar Flow',
          description: 'Air guiding vanes reduce turbulence and cut noise at the source.'
        },
        {
          title: 'Dynamic Balance',
          description: 'High-precision fan impeller ensures vibration-free and silent circulation.'
        }
      ]
    },
    comparison: {
      standardLabel: 'Standard:',
      quietLabel: 'Quiet:',
      title: 'Why Lineo Quiet?',
      standard: 'Standard Fans',
      quiet: 'Vortice Lineo Quiet',
      features: [
        {
          label: 'Noise Level',
          standard: '55-65 dB(A)',
          quiet: '25-30 dB(A)'
        },
        {
          label: 'Energy Consumption',
          standard: 'High (AC Motor)',
          quiet: '60% Saving (ES/EC Motor)'
        },
        {
          label: 'Air Quality',
          standard: 'Turbulent Flow',
          quiet: 'Laminar and Continuous'
        },
        {
          label: 'Mounting',
          standard: 'Complex and Rigid',
          quiet: 'Fast and Vibration Isolated'
        }
      ]
    },
    faq: {
      title: 'Frequently Asked Questions',
      items: [
        {
          q: 'How quiet is it really?',
          a: 'Lineo Quiet is close to whisper sound (approx. 25 dB) at low speed. This is less than half of a normal conversation.'
        },
        {
          q: 'Is it hard to install?',
          a: 'No, thanks to quick-mount clamps, you don\'t need to disconnect the device from the duct for maintenance or installation.'
        },
        {
          q: 'Which areas is it suitable for?',
          a: 'Ideal for anywhere silence is critical, such as libraries, offices, bedrooms, and hotel rooms.'
        }
      ]
    },
    brand: {
      eyebrow: 'ENGINEERING HERITAGE',
      title: 'Italian Silence: The Vortice Legend',
      description: 'Directing the ventilation world since 1954, Vortice represents the pinnacle in the silent duct fan category with the Lineo Quiet series.',
      badges: ['Authorized Distributor', '2 Year Warranty'],
      stats: [
        {
          label: 'Years Experience',
          value: '70+'
        },
        {
          label: 'Countries',
          value: '90+'
        },
        {
          label: 'Compasso d\'Oro',
          value: '3x'
        },
        {
          label: 'Europe',
          value: '#1'
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
    analyzing: 'Analyzing Models...',
    centralSystem: 'If central system is available',
    close: 'Close',
    coldStorage: 'Cold Storage',
    coldStorageDesc: 'Cold chain protection',
    coldStorageTip: 'Provides food safety and energy savings',
    consultUs: 'Consult us',
    customOffer: 'Request Custom Offer',
    doorHeight: 'What is Your Door Height?',
    electricHeater: 'Electric Heater',
    entranceDesc: 'Shop, restaurant, hotel entrance',
    entranceDoor: 'Entrance Door',
    entranceTip: 'Increases customer comfort, prevents energy loss',
    findSuitable: 'Find the Suitable One for Me',
    goBack: 'Go Back',
    heatingNeed: 'Is Heating Needed?',
    heatingNoDesc: 'Air barrier only',
    heatingYesDesc: 'For winter comfort',
    heightMeter: 'Height (Meter)',
    industrial: 'Industrial Facility',
    industrialDesc: 'Factory, warehouse, logistics',
    industrialTip: 'Power suitable for industrial requirements',
    insulation: 'For insulation and savings',
    matchScore: '{{score}}% Match',
    meter: 'Meter',
    mountType: 'How Should the Mounting Type Be?',
    next: 'Continue',
    notSure: 'Not Sure',
    recessedMount: 'Recessed (In-Ceiling)',
    restart: 'Restart',
    retail: 'Market / Supermarket',
    retailDesc: 'Refrigerated aisles',
    retailTip: 'Keeps hot air away from refrigerated aisles',
    standardMount: 'Standard (Wall/Ceiling Suspended)',
    start: 'Start',
    step: 'Step',
    step1Desc: 'To determine the most suitable technical specifications, select the application area first.',
    step1Title: 'Where is the area of use?',
    step2Desc: 'It is critical that the air curtain covers the entire opening.',
    step2Title: 'Enter door dimensions',
    step3Title: 'Is heating needed?',
    step6Desc: 'Recommendations filtered by engineering criteria.',
    step6Title: 'Most Suitable Models for You',
    threeSteps: 'Custom product recommendation in 3 steps',
    waterHeater: 'Water Heated (LPHW)',
    widthMeter: 'Width (Meter)',
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
    description: 'Share your project details with our expert engineers. Let us select the most accurate fan for you in compliance with airflow, pressure losses, and regulations.',
    buttonText: 'Get Expert Support'
  }
};
