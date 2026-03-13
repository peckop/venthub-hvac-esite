export const en = {
  common: {
    loadingApp: 'Loading VentHub... ',
    // Navigation & generic
    categories: "Categories",
    products: "Products",
    brands: "Brands",
    about: "About",
    contact: "Contact",
    supportCenter: "Support Center",
    knowledgeHub: "Knowledge Hub",
    myOrders: "My Orders",
    signOut: "Sign Out",
    signIn: "Sign In",
    signUp: "Sign Up",
    skipToContent: "Skip to main content",
    searchHeaderPlaceholder: "Search product, brand or model...",
    search: "Search",
    quickSearch: "Quick search...",
    allCategories: "All Categories",
    priceRange: "Price Range",

    // Existing
    discover: "Discover",
    allProducts: "All Products",
    exploreProducts: "Explore Products",
    getQuote: "Get a Quote",
    byApplication: "Solutions by Application",
    viewAll: "View all",
    featured: "Featured Products",
    newProducts: "New Products",
    whyUs: "Why VentHub?",
    home: "Home",
    discoverPage: "Discover",
    notFound: "No results found",
    clearSearch: "Clear search",
    searchPlaceholder: "Product name, brand...",
    searchPlaceholderLong: "Product name, brand, model...",
    selectByNeed: "Choose by need",
    seeAllProducts: "See all products",
    back: "Back",
    backToTop: "Back to top",
    gotoCategory: "Go to category",
    cancel: "Cancel",
    close: "Close",
    viewFullscreen: "View fullscreen",
    view3D: "View 3D",
    prev: "Previous",
    next: "Next",
    remove: "Remove",
    more: "More",
  },
  search: {
    recentSearches: "Recent Searches",
    clearRecent: "Clear",
    popularCategories: "Popular Categories",
    noResults: "No results found",
    detailedSearch: "detailed search for",
    allResults: "See all results",
    keyboardHint: "Navigate with arrow keys",
    enterHint: "For all results",
    placeholder: "Search products, categories, brands...",
    noResultsAdvice: "Try different keywords",
    detailedSearchCta: "Click for detailed search",
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
      title: 'Knowledge & Guides Center',
      subtitle: 'Topic-based guides with (coming soon) calculators and a selection wizard to help you choose the right product.',
      searchPlaceholder: 'Search topic…',
      readMore: 'Read more',
      calculatorsSoon: 'Calculators (Coming Soon)',
      calculatorsSoonDesc: 'HRV airflow, jet fan coverage, air curtain velocity/flow and duct pressure drop.',
      selectorSoon: 'Product Selector (Coming Soon)',
      selectorSoonDesc: 'Build a product list in 4–6 questions.'
    },
    tags: {
      all: 'All',
      havaPerdesi: 'Air Curtain',
      jetFan: 'Jet Fan',
      hrv: 'HRV/ERV'
    },
    topic: {
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
        steps: [
          'Door width = device width (unbroken barrier).',
          'Nozzle velocity 7–9 m/s; at floor 2–3 m/s target.',
          'Nozzle tilted 10–15° inwards; auto speed via door contact.'
        ],
        pitfalls: ['Device too short', 'Too low velocity', 'Tilting nozzle outward']
      },
      'jet-fan': {
        title: 'Jet Fan (Parking)',
        summary: 'Ceiling fans that direct flow to exhaust for CO/NOx and smoke scenarios; layout must avoid dead zones.',
        steps: [
          'Flow: Volume × ACH (e.g. 7,200 m³ × 8 ACH ≈ 57,600 m³/h).',
          'Thrust 50–100 N typical; pick by distance and plan.',
          'Layout: axis spacing 25–35 m; drive to exhaust; cover sensor zones.'
        ],
        pitfalls: ['Leaving dead zones', 'Missing sensor coverage']
      },
      hrv: {
        title: 'Heat Recovery (HRV/ERV)',
        summary: 'Provides fresh air with heat recovery; key criteria are airflow, efficiency/SFP and external static pressure.',
        steps: [
          'Airflow by occupancy/space (EN 16798-1 / ASHRAE 62.1 ranges).',
          'Efficiency/SFP: 70–85% efficiency, low SFP.',
          'Pressure: external static matching filter/duct losses.'
        ],
        pitfalls: ['Focusing on efficiency while ignoring external static']
      }
    }
  },
  home: {
    seoTitle: "VentHub - Premium HVAC Solutions | Fans, Speed Control, Heating & Cooling",
    seoDesc: "Discover premium ventilation products with VentHub. Engineering-led solutions for parking jet fans, air curtains, heat recovery units, and more.",
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
        slides: [
          {
            eyebrow: 'ADVANCED AERODYNAMIC ENGINEERING',
            title: 'Industrial Ventilation Layers',
            subtitle: 'Statically balanced and acoustically optimized solution axes in high-flow systems.'
          },
          {
            eyebrow: 'FUTURISTIC CLIMATE CONTROL',
            title: 'Vortice Lineo Quiet: The Future of Silence',
            subtitle: 'The perfect balance of minimum energy consumption, maximum air transfer efficiency, and premium silent comfort.'
          },
          {
            eyebrow: 'PRECISION HVAC SYSTEMS',
            title: 'Technical Excellence and Smart Flow',
            subtitle: 'End-to-end deterministic ventilation engineering for industrial kitchens, parking lots, and comfort zones.'
          }
        ]
      }
    },
        cinematicShowcase: {
      eyebrow: 'ENGINEERING FOCUS',
      title: 'Vortice Lineo Quiet Series',
      subtitle: 'The new digital standard of silence with an aero-acoustic housing design.',
      description: 'Provides ultra-quiet operation efficiency even at high static pressure, thanks to its special silencer-layered outer body and dynamically balanced motor structure.',
      hotspots: {
        motor: 'High Efficiency EC Motor - Precise Speed and Torque Management',
        clamps: 'Anti-Vibration Clamps - Quick Service and Assembly Module',
        housing: 'Sound-Absorbing Composite Housing - Minimum Acoustic Emission',
        airflow: 'Air Guiding Vane Structure - Maximum Laminar Flow Efficiency'
      },
      cta: 'Access High-Resolution Technical Data'
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
      eyebrow: 'Commercial Product Showcase',
      title: 'Bring the commerce layer forward with real product data.',
      subtitle: 'Move faster from category discovery to buying intent by switching between featured products and strong product families.',
      cta: 'View All Products',
      panelEyebrow: 'Focus Panel',
      tabs: {
        featured: 'Featured',
        newArrivals: 'New Arrivals',
        bestSellers: 'Best Sellers',
        airCurtains: 'Air Curtains',
        heatRecovery: 'Heat Recovery'
      },
      panelTitles: {
        featured: 'Featured selection',
        newArrivals: 'New arrivals focus',
        bestSellers: 'Most preferred',
        airCurtains: 'Climate Protection Systems',
        heatRecovery: 'Energy Recovery'
      },
      panelDescriptions: {
        featured: 'We present featured products powered by real data in a way that helps users evaluate faster.',
        newArrivals: 'Discover our latest additions to the HVAC inventory, featuring newest technology.',
        bestSellers: 'Explore products that set the industry standard for reliability and performance.',
        airCurtains: 'Professional series that maintain indoor comfort by creating an invisible thermal barrier at entrances.',
        heatRecovery: 'Economical units that recover heat from exhaust air with up to 90% efficiency while supplying fresh air.'
      }
    },
    trustProof: {
      eyebrow: 'Trust and Proof',
      title: 'We build trust with clear operational realities, not decorative promises.',
      subtitle: 'The trust layer on the VentHub homepage should make the verified working model and expert support approach visible.',
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
      eyebrow: 'Knowledge and Support Layer',
      title: 'Make technical decision paths visible and reachable.',
      subtitle: 'Guides, calculators and support-center routes help users reach not only products, but a better decision environment.',
      cta: 'Explore',
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
      euQuality: "European quality standards",
      fastDelivery: "Fast delivery",
      warranty: "2-year warranty",
      support: "24/7 technical support",
    },
    heroTitle: "Clean Air, Clean Future",
    heroSubtitle: "Turkey's most trusted HVAC distributor. 6 premium brands, 50+ product types for professional ventilation solutions.",
    bottomCtaTitle: "Let us help you choose the right product.",
    bottomCtaSubtitle: "Share your project details, our engineering team will guide you quickly.",
    whyParagraph: "With 15+ years of experience and world-class products, we are your trusted partner in the HVAC industry.",
    why: {
      premiumTitle: "Premium Quality",
      premiumText: "We select only the highest-quality products from globally recognized brands.",
      expertTitle: "Expert Support",
      expertText: "Our HVAC experts provide 24/7 technical support to find the best solution.",
      fastTitle: "Fast Delivery",
      fastText: "Rapid and reliable delivery across Turkey.",
    },
    stats: {
      premiumBrands: "Premium Brands",
      productTypes: "Product Types",
      yearsExperience: "Years Experience",
      happyCustomers: "Happy Customers",
    },
    galleryTitle: 'Product Gallery',
    gallerySubtitle: 'Browse featured products'
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
      need: { title: 'Understanding Your Needs', desc: 'We clarify the use case via a short call or form.' },
      analysis: { title: 'Analysis & Calculation', desc: 'We review airflow, pressure, acoustics, energy efficiency and regulations.' },
      proposal: { title: 'Solution / Proposal', desc: 'We propose suitable product families, alternatives and lead times.' },
      implementation: { title: 'Implementation Support', desc: 'We streamline with install guides, commissioning and technical support.' },
      support: { title: 'Support', desc: 'After-sales training, spare parts and service network for sustainability.' }
    }
  },
  homeTrust: {
    title: 'Trust & Compliance',
    subtitle: 'Our infrastructure, security and processes are transparent and standards-compliant.',
    kvkk: { title: 'KVKK Compliant', desc: 'Personal data is stored securely and used only where necessary.' },
    payment: { title: 'Secure Payment (iyzico)', desc: '3D Secure and advanced anti-fraud checks.' },
    returns: { title: 'Easy Returns/Exchanges', desc: 'Transparent procedures and fast, result-focused support.' }
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
      parkingJetFan: { title: 'Parking Jet Fan', desc: 'CO sensor control and energy saving' },
      airCurtain: { title: 'Air Curtain', desc: 'Entrance comfort and reduced heat loss' },
      hrv: { title: 'Heat Recovery (HRV)', desc: 'Indoor air quality and efficiency' },
      smokeExhaust: { title: 'Smoke Exhaust', desc: 'Emergency management' }
    }
  },
  homeGallery: {
    title: 'Application Showcase',
    subtitle: 'Quick look at real-world use cases',
    productsCta: 'View Products',
    guideCta: 'Open Guide',
    items: {
      parking: { title: 'Parking Ventilation', subtitle: 'Jet fan / CO control' },
      airCurtain: { title: 'Air Curtain', subtitle: 'Entrance comfort' },
      heatRecovery: { title: 'Heat Recovery', subtitle: 'Energy efficiency' },
      industrialKitchen: { title: 'Industrial Kitchen', subtitle: 'Hood and duct' },
      smokeExhaust: { title: 'Smoke Exhaust', subtitle: 'Emergency' },
      hvac: { title: 'Heating/Cooling', subtitle: 'Comfort HVAC' }
    }
  },
  homeShowcase: {
    slide1: { title: 'Expertise in Industrial Ventilation', subtitle: 'Solutions tailored to your project and the right product selection' },
    slide2: { title: 'Energy Efficiency & Comfort', subtitle: 'Better performance at lower cost with proper engineering' },
    slide3: { title: 'Guided by Your Needs', subtitle: 'Explore by application and quickly reach the right category' },
    prevAria: 'Previous',
    playAria: 'Play',
    pauseAria: 'Pause',
    nextAria: 'Next'
  },
  products: {
    breadcrumbDiscover: "Discover",
    heroTitle: "Discover HVAC products: engineering-led selection, fast quotes",
    heroSubtitle: "Find the right product quickly with application-guided areas, popular categories and featured products.",
    itemsListed: "items listed",
    resultsFound: "results found",
    heroValue1: "Certified, reliable products",
    heroValue2: "Engineering support and right selection",
    heroValue3: "Fast quote / guidance",
    helpCtaTitle: "Not sure? Let's choose the right product by application.",
    helpCtaSubtitle: "Share your project details; our engineering team will respond quickly.",
    applicationTitle: "Solutions by Application",
    popularCategories: "Popular Categories",
    discoverVisual: 'Discover visual area',
    searchResultsTitle: 'Search Results',
    searchSeoTitle: 'Search: {{q}}',
    searchSeoDesc: 'Search results for "{{q}}"',
    discoverSeoDesc: 'Discover products, featured items and popular categories on VentHub.',
    // Hub Section
    hubBadge: "Turkey's HVAC Expert",
    hubTitle: "Professional HVAC Solutions",
    hubSubtitle: "Air curtain, industrial fan and heat recovery systems. Let's find the right product for your needs together.",
    searchPlaceholder: "Search product or model..."
  },
  applications: {
    parking: {
      title: "Parking Ventilation",
      subtitle: "Solutions requiring high airflow and pressure",
    },
    airCurtain: {
      title: "Mall / Entrance Air Curtain",
      subtitle: "Entrance solutions that reduce energy loss",
    },
    heatRecovery: {
      title: "Heat Recovery",
      subtitle: "Efficient HVAC and energy saving",
    },
    "air-curtain": {
      title: "Mall / Entrance Air Curtain",
      subtitle: "Entrance solutions that reduce energy loss",
    },
    "heat-recovery": {
      title: "Heat Recovery",
      subtitle: "Efficient HVAC and energy saving",
    }
  },
  megamenu: {
    navigation: 'Navigation Menu',
    quickAccess: 'Quick Access',
    myCart: 'My Cart',
    loadingCategories: 'Loading categories...',
    productCategories: 'Product Categories',
    pickCategory: 'Choose a category for premium HVAC solutions',
    subcategories: 'subcategories',
    more: 'more',
  },
  header: {
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
  admin: {
    dashboard: {
      subtitle: 'Quick glance and latest activity',
      rangeToday: 'Today',
      range7d: '7 Days',
      range30d: '30 Days',
      kpis: {
        ordersCount: 'Orders Count',
        salesTotal: 'Sales Total',
        pendingReturns: 'Pending Returns',
        pendingShipments: 'Pending Shipments',
        avgBasket: 'Average Basket'
      },
      trend: 'Order trend for last {{days}} days',
      recent: { title: 'Recent Orders' },
      table: { order: 'Order', date: 'Date', amount: 'Amount', status: 'Status' }
    },
    errors: {
      levelTitle: 'Level',
      envTitle: 'Environment',
      detailsTitle: 'Details',
      labels: { stack: 'Stack', ua: 'UA', release: 'Release', env: 'Env' },
      table: { date: 'Date', level: 'Level', message: 'Message', url: 'URL' }
    },
    toolbar: {
      searchPlaceholder: 'Search',
      clear: 'Clear',
      records: 'records'
    },
    menu: {
      groupMain: 'Main Menu',
      groupSales: 'Sales & Operations',
      groupCatalog: 'Catalog Management',
      groupStock: 'Stock & Inventory',
      groupSystem: 'System & Management',
      dashboard: 'Dashboard',
      coupons: 'Coupons',
      webhookEvents: 'Webhook Events',
      orders: 'Orders',
      inventory: 'Inventory',
      movements: 'Movements',
      inventoryReport: 'Inventory Report',
      inventorySettings: 'Thresholds & Settings',
      returns: 'Returns',
      users: 'Users',
      logs: 'Logs',
      errors: 'Errors',
      errorGroups: 'Error Groups',
      products: 'Products',
      categories: 'Categories',
      logistics: 'Shipping & Logistics',
      settings: 'Settings'
    },
    titles: {
      dashboard: 'Dashboard',
      orders: 'Orders',
      inventory: 'Inventory',
      movements: 'Movements',
      returns: 'Return Management',
      users: 'User Management',
      audit: 'Audit Logs',
      errors: 'Error Logs',
      errorGroups: 'Error Groups',
      products: 'Products',
      categories: 'Categories',
      coupons: 'Coupons',
      settings: 'Admin Settings'
    },
    settings: {
      siteName: 'Site Name',
      tagline: 'Tagline',
      contactEmail: 'Contact Email',
      supportPhone: 'Support Phone',
      headquarters: 'Headquarters Address',
      logo: 'Logo',
      dropLogo: 'Drop logo here',
      paymentTitle: 'Payment Configuration',
      iyzicoMode: 'iyzico Mode',
      iyzicoApiKey: 'iyzico API Key',
      iyzicoSecretKey: 'iyzico Secret Key',
      saveSuccess: 'Settings saved successfully',
      saveError: 'An error occurred while saving settings',
      generalTab: 'General Settings',
      paymentTab: 'Payment Settings',
      adminsTab: 'Admin Management',
      systemTab: 'System Status',
      platformIdentity: 'Platform Identity',
      platformIdentityDesc: 'Manage your store name, logo, and contact details.',
      adminsTitle: 'Administrator List',
      adminsDesc: 'You can manage platform administrators here.',
      systemTitle: 'System Status',
      systemDesc: 'Monitor server and infrastructure status in real-time.',
      dbStatus: 'Database Status',
      apiLatency: 'API Latency',
      versionInfo: 'Version Info',
      lastUpdate: 'Last Update',
      addAdmin: 'Add New Administrator',
      systemLogs: 'System Logs'
    },
    products: {
      toolbar: {
        categoryTitle: 'Category',
        allCategories: 'All Categories'
      },
      toggles: { featuredOnly: 'Only: Featured' },
      statusLabels: { active: 'Active', inactive: 'Inactive', out_of_stock: 'Out of Stock' },
      table: { image: 'Image', name: 'Name', sku: 'SKU', category: 'Category', status: 'Status', price: 'Price', stock: 'Stock', actions: 'Actions' },
      export: { csvLabel: 'CSV (UTF-8 BOM)' },
      import: {
        button: 'Import (beta)',
        previewTitle: 'CSV Preview (first 10 rows) — Total: {{total}}',
        close: 'Close',
        dryRun: 'Dry-run',
        dryRunResult: 'Dry-run: required fields are {{status}}. Valid rows: {{ok}}/{{total}}',
        statusComplete: 'complete',
        statusMissing: 'missing',
        writeButton: 'Write (upsert by SKU)',
        needCsv: 'Select a CSV first',
        minColumns: 'At least sku and name columns are required',
        noneFound: 'No valid rows found',
        done: 'Import finished: {{ok}} rows processed, {{fail}} rows failed',
        error: 'Import error: {{msg}}'
      },
      edit: {
        editing: 'Editing',
        new: 'New Product',
        tabs: { info: 'Info', pricing: 'Pricing', stock: 'Stock', images: 'Images', seo: 'SEO' },
        actions: { new: 'New', save: 'Save', delete: 'Delete' },
        info: {
          name: 'Name',
          sku: 'SKU',
          modelCode: 'Model Code (MPN)',
          modelPlaceholder: 'e.g., AD-H-900-T',
          brand: 'Brand',
          status: 'Status',
          category: 'Category',
          categoryUnset: '(Not selected)',
          featured: 'Featured'
        },
        pricing: {
          salePrice: 'Sale Price',
          purchasePrice: 'Purchase Cost',
          salePlaceholder: 'e.g., 1999.90',
          purchasePlaceholder: 'e.g., 1499.50'
        },
        stock: {
          stock: 'Stock',
          lowThreshold: 'Low Stock Threshold',
          stockPlaceholder: 'e.g., 50',
          lowPlaceholder: 'e.g., 5',
          hintBase: 'If empty, default threshold in Settings is used',
          defaultSuffix: ' (Default: {{default}})'
        },
        images: {
          saveFirst: 'Save the product first.',
          none: 'No images yet. Select files to upload.',
          altPlaceholder: 'Alt text',
          up: 'Up',
          down: 'Down',
          makeCover: 'Make Cover',
          delete: 'Delete'
        },
        seo: {
          slug: 'Slug',
          slugPlaceholder: 'sample-product',
          slugRequired: 'Slug cannot be empty',
          slugInUse: 'This slug is already in use',
          metaTitle: 'Meta Title',
          metaDesc: 'Meta Description',
          chars: '{{count}} characters'
        }
      },
      toasts: {
        loadFailed: 'Could not load',
        altSaveFailed: 'Could not save alt text: {{msg}}',
        imagesSaved: 'Images saved',
        imagesSaveFailed: 'Could not save images: {{msg}}',
        orderNotChanged: 'Order not changed',
        seoSaveFailed: 'Could not save SEO: {{msg}}',
        productLoadFailed: 'Could not load product: {{msg}}',
        saveFailed: 'Could not save: {{msg}}',
        priceSaveFailed: 'Could not save price: {{msg}}',
        stockSaveFailed: 'Could not save stock: {{msg}}',
        deleteFailed: 'Could not delete: {{msg}}'
      },
      confirm: {
        deleteImage: 'Do you want to delete the image?',
        deleteProduct: 'Do you want to delete this product?'
      }
    },
    ui: {
      prev: 'Previous',
      next: 'Next',
      refresh: 'Refresh',
      loading: 'Loading…',
      loadingShort: 'Loading…',
      noRecords: 'No records',
      apply: 'Apply',
      clear: 'Clear',
      close: 'Close',
      save: 'Save',
      add: 'Add',
      delete: 'Delete',
      edit: 'Edit',
      details: 'Details',
      hide: 'Hide',
      all: 'All',
      total: 'Total',
      pageLabel: 'Page {{page}} / {{pages}}',
      startDate: 'Start Date',
      endDate: 'End Date',
      failed: 'Operation failed',
      accessDeniedTitle: 'Access Denied',
      accessDeniedDesc: 'Admin privileges are required to access this page.'
    },
    search: {
      audit: 'Search by table, PK or note',
      errors: 'Search by URL or message',
      coupons: 'Search by code or type',
      movements: 'Search by product name/SKU',
      orders: 'Search by Order ID or Conversation ID',
      products: 'Search by product name/SKU/brand/slug'
    },
    movements: {
      toolbar: {
        categoryTitle: 'Category',
        allCategories: 'All Categories'
      },
      table: {
        date: 'Date',
        product: 'Product',
        delta: 'Delta',
        reason: 'Reason',
        ref: 'Reference'
      },
      export: {
        csvLabel: 'CSV (with visible filters)',
        headers: { date: 'Date', product: 'Product', sku: 'SKU', delta: 'Delta', reason: 'Reason', ref: 'Reference' }
      },
      batchFilterPrefix: 'Filter: Batch',
      pageLabel: 'Page {{page}}',
      reasons: {
        undo: 'Undo',
        sale: 'Sale',
        po_receipt: 'PO Receipt',
        manual_in: 'Manual In',
        manual_out: 'Manual Out',
        adjust: 'Adjustment',
        return_in: 'Return In',
        transfer_out: 'Transfer Out',
        transfer_in: 'Transfer In'
      }
    },
    orders: {
      view_list: 'List View',
      view_board: 'Board View',
      statusLabels: {
        all: 'All',
        pending: 'Pending',
        paid: 'Paid',
        confirmed: 'Confirmed',
        shipped: 'Shipped',
        delivered: 'Delivered',
        cancelled: 'Cancelled',
        refunded: 'Refunded',
        partialRefunded: 'Partial Refunded'
      },
      table: {
        orderId: 'Order ID',
        status: 'Status',
        conversationId: 'Conversation ID',
        amount: 'Amount',
        created: 'Created At',
        actions: 'Actions'
      },
      filters: {
        status: 'Status',
        pendingShipments: 'Pending Shipments',
        startDate: 'Start Date',
        endDate: 'End Date'
      },
      bulk: {
        selected: 'Selected: {{count}}',
        shipSelected: 'Ship Selected',
        cancelShipping: 'Cancel Shipping for Selected',
        clearSelection: 'Clear',
        noShippableSelected: 'No selectable shipments to cancel',
        confirmCancelShipping: 'Are you sure to cancel shipping for {{count}} orders?',
        cancelSuccess: '{{count}} orders cancelled',
        cancelPartialFail: 'Some cancellations failed: {{failed}}',
        cancelFailed: 'Bulk cancel failed'
      },
      export: {
        csvLabel: 'CSV (Excel-compatible UTF‑8 BOM)',
        xlsLabel: 'Excel (.xls — HTML table)',
        headers: {
          orderId: 'Order ID',
          status: 'Status',
          conversationId: 'Conversation ID',
          amount: 'Amount',
          created: 'Created'
        }
      },
      columns: {
        orderId: 'Order ID',
        status: 'Status',
        conversationId: 'Conversation ID',
        amount: 'Amount',
        created: 'Created'
      },
      actions: {
        shipping: 'Shipping',
        logs: 'Logs',
        notes: 'Notes',
        cancel: 'Cancel'
      },
      tooltips: {
        shipping: 'Add / edit shipping info',
        logs: 'View email logs',
        notes: 'View/add order notes',
        cancelShipping: 'Cancel shipment',
        cancelBulkShipping: 'Cancel shipping for selected (only shipped orders)'
      },
      modals: {
        shipping: {
          title: 'Ship / Tracking No',
          bulkTitle: 'Bulk: Ship Orders',
          carrierLabel: 'Carrier',
          carrierSelect: 'Select…',
          trackingLabel: 'Tracking Number',
          trackingPlaceholder: 'Tracking number',
          sendEmailLabel: 'Send email notification to customer',
          advancedLabel: 'Advanced: per-order carrier/tracking',
          advancedTable: {
            orderId: 'Order ID',
            carrier: 'Carrier',
            tracking: 'Tracking'
          },
          carriers: {
            yurtici: 'Yurtiçi',
            aras: 'Aras',
            mng: 'MNG',
            ptt: 'PTT',
            ups: 'UPS',
            fedex: 'FedEx',
            dhl: 'DHL',
            other: 'Other'
          },
          otherPlaceholder: 'Other (type manually)',
          cancel: 'Cancel',
          save: 'Save',
          saving: 'Saving...'
        },
        logs: {
          title: 'Email Logs',
          orderLabel: 'Order:',
          table: {
            date: 'Date',
            to: 'To',
            subject: 'Subject',
            carrier: 'Carrier',
            tracking: 'Tracking No',
            messageId: 'Message ID'
          },
          noRecords: 'No records',
          close: 'Close'
        },
        notes: {
          title: 'Order Notes',
          inputPlaceholder: 'Write a new note',
          add: 'Add',
          adding: 'Saving…',
          delete: 'Delete',
          noRecords: 'No records',
          close: 'Close'
        }
      },
      toasts: {
        loadError: 'Could not load',
        emailLogsFailed: 'Failed to load email logs',
        notesFailed: 'Failed to load notes',
        noteAddFailed: 'Could not add note',
        noteDeleteSuccess: 'Note deleted',
        noteDeleteFailed: 'Could not delete note',
        shippingCancelConfirm: 'Cancel shipping? This will set status to "Confirmed" and remove tracking.',
        shippingCancelSuccess: 'Shipping cancelled',
        shippingCancelFailed: 'Could not cancel shipping',
        shippingUpdateSuccess: 'Shipping info saved',
        shippingCreateSuccess: 'Order shipped',
        shippingUpdateFailed: 'Could not update shipping',
        bulkShippingSuccess: '{{count}} orders shipped',
        bulkShippingFailed: 'Bulk shipping update failed',
        missingFields: 'Carrier and tracking number are required',
        missingAdvancedFields: 'Missing fields: {{count}} rows'
      },
      states: {
        loading: 'Loading...',
        noRecords: 'No records found'
      }
    },
    webhooks: {
      title: 'Webhook Events',
      tabs: { returns: 'Returns', shipping: 'Shipping Emails' },
      search: { returns: 'event_id, order_id, return_id, carrier, status_mapped', shipping: 'order_id, email, subject, provider' },
      tip: { rowAction: 'Click a row to open details and reprocess menu.' },
      returnsTable: { eventId: 'Event ID', order: 'Order', carrier: 'Carrier', statusMapped: 'Status (mapped)', received: 'Received' },
      emailsTable: { order: 'Order', to: 'To', subject: 'Subject', provider: 'Provider', date: 'Date' }
    },
    errorGroups: {
      searchPlaceholder: 'search signature/message',
      filter: { statusAll: 'Status: All', assignedAll: 'Assigned: All', unassigned: '(unassigned)' },
      export: { csvLabel: 'CSV (UTF-8 BOM)' },
      table: { lastSeen: 'Last Seen', level: 'Level', signature: 'Signature', lastMsg: 'Last Message', count: 'Count', status: 'Status', assigned: 'Assigned', actions: 'Actions' },
      bulk: { selected: 'Selected groups: {{count}}', statusTitle: 'Status:' },
      assigned: { none: '(none)' },
      details: {
        latest: 'Latest Records',
        notes: 'Notes',
        notesPlaceholder: 'Leave a note about this group...',
        sampleUrl: 'Sample URL',
        top5: 'Top‑5 Distributions',
        urlTitle: 'URL',
        releaseTitle: 'Release',
        envTitle: 'Env',
        userAgentTitle: 'User Agent',
        stackSummary: 'stack'
      }
    },
    returns: {
      total: 'Total: {{count}} return requests',
      searchPlaceholder: 'Search by order no, customer name, email or reason',
      export: {
        csvLabel: 'CSV (with visible filters)',
        xlsLabel: 'Excel (.xls — HTML table)',
        headers: { order: 'Order', customer: 'Customer', email: 'Email', reason: 'Reason', status: 'Status', date: 'Date', amount: 'Amount' }
      },
      table: { order: 'Order', customer: 'Customer', reason: 'Reason', status: 'Status', date: 'Date', actions: 'Actions' },
      empty: { filtered: 'No return requests match the filters.', none: 'No return requests yet.' },
      actions: { markAs: 'Mark as {{status}}' },
      toasts: {
        returnsLoadFailed: 'Could not load return requests',
        statusUpdated: 'Return status updated to "{{status}}"',
        emailNotifySent: 'Customer notification email sent',
        emailNotifyFailed: 'Email could not be sent, but the status was updated',
        statusUpdateFailed: 'Could not update return status'
      },
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
    users: {
      subtitle: 'Manage system users and their roles.',
      tabs: { admins: 'Admin Users ({{count}})', all: 'All Users ({{count}})' },
      searchPlaceholder: 'Search by email or name',
      table: { user: 'User', company: 'Company & B2B', role: 'Role', created: 'Created', actions: 'Actions' },
      empty: { filtered: 'No users match your search.', admins: 'No admin users yet.', all: 'User list is empty.' },
      actions: { superadmin: 'Superadmin', admin: 'Admin', moderator: 'Mod', user: 'User' },
      actionTitles: { superadmin: 'Make superadmin', admin: 'Make admin', moderator: 'Make moderator', user: 'Make user', cannotDemoteSelf: "You can't demote yourself" },
      toasts: {
        adminsLoadFailed: 'Failed to load admin users',
        allLoadFailed: 'Failed to load users',
        roleUpdated: 'User role updated to "{{role}}"',
        roleNotUpdated: 'Role could not be updated',
        roleUpdateError: 'Role update error'
      },
      info: {
        title: 'User Role System',
        items: {
          superadmin: 'Superadmin: All privileges + role assignments (limited visibility for security)',
          admin: 'Admin: Access to operations panel (inventory, returns, shipping, users)',
          moderator: 'Moderator: Limited admin privilege (inventory and returns)',
          user: 'User: Regular user (only manages own account)'
        }
      }
    }
  },
  footer: {
    quickLinks: 'Quick Links',
    categories: 'Categories',
    contact: 'Contact',
    workingHours: 'Working Hours',
    weekdays: 'Monday - Friday',
    saturday: 'Saturday',
    rights: 'All rights reserved.'
  },
  contactPage: {
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
    submit: 'Send'
  },
  aboutPage: {
    title: 'About VentHub',
    subtitle: 'Your trusted partner for premium HVAC solutions. Corporate supply, engineering-assisted selection and fast quote processes.',
    stats: {
      premiumBrands: 'Premium Brands',
      productTypes: 'Product Types',
      yearsExperience: 'Project Pipeline'
    },
    whyTitle: 'Why VentHub?',
    bullets: {
      bullet1: 'Engineering-focused selection support and proper product guidance',
      bullet2: 'Transparent communication in stock, delivery and after-sales',
      bullet3: 'KVKK/iyzico compliant, secure payment and data protection'
    }
  },
  category: {
    loading: 'Loading category... ',
    notFound: 'Category Not Found',
    backHome: 'Back to home',
    breadcrumbHome: 'Home',
    filters: 'Filters',
    subcategories: 'Sub-categories',
    priceRange: 'Price Range',
    brands: 'Brands',
    techFilters: 'Technical Filters',
    airflow: 'Airflow (m³/h)',
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
    ltePlaceholder: '≤'
  },
  pdp: {
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
      noise: 'Noise Level'
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
      cadDwg: 'CAD - DWG Format'
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
      liveDataNotice: "ℹ️ Data is updated in real-time",
      interactive3D: "3D View"
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
      certificates: 'Certificates'
    }
  },
  cart: {
    emptyTitle: 'Your cart is empty',
    emptyDesc: 'You haven\'t added any products yet. Explore our products to start shopping.',
    startShopping: 'Start Shopping',
    title: 'Shopping Cart',
    countLabel: '{{count}} item(s) in your cart',
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
    itemTotal: 'Total'
  },
  orders: {
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
    shippingInfo: 'Shipping / Tracking',
    carrier: 'Carrier',
    trackingNumber: 'Tracking Number',
    trackingLink: 'Tracking Link',
    openLink: 'Open link',
    shippedAt: 'Shipped At',
    deliveredAt: 'Delivered At',
    noShippingInfo: 'No shipping info available.',
    invoicePdf: 'Proforma (PDF)'
  },
  auth: {
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
    noAccount: "Don't have an account?",
    register: 'Sign Up',
    validEmailPassRequired: 'Email and password are required',
    required: 'is required',
    emailInvalid: 'Invalid email address',
    invalidCreds: 'Email or password is incorrect',
    emailNotConfirmed: 'You need to confirm your email address',
    genericLoginError: 'An error occurred during sign in',
    unexpectedError: 'An unexpected error occurred',
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
    saved: {
      title: 'Saved Addresses',
      address: 'Address',
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
    paymentSectionTitle: 'Payment',
    paymentLoading: 'Payment form is loading. Please complete 3D verification. This page will refresh automatically when finished.',
    formPreparing: 'Preparing form...',
    paymentSuccess: '🎉 Payment completed successfully!',
    paymentError: 'An error occurred during payment',
    steps: { step1: 'Personal Info', step2: 'Address Info', step3: 'Review', step4: 'Payment' },
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
      smsTitle: "Didn't receive the code?",
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
      eInvoice: 'I am an e-Invoice taxpayer'
    },
    consents: {
      title: 'Legal Consents',
      readAcceptPrefix: 'I have read and accept the ',
      readAcceptSuffix: '',
      orderConfirmText: 'I confirm the order and accept the accuracy of product and delivery information.',
      marketingText: 'I consent to receive commercial communications (optional).'
    },
    review: {
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
    errors: {
      nameRequired: 'Full name is required',
      emailInvalid: 'Please enter a valid email address',
      phoneRequired: 'Phone number is required',
      addressRequired: 'Address is required',
      cityRequired: 'City is required',
      districtRequired: 'District is required',
      postalRequired: 'Postal code is required',
      tcknRequired: 'National ID is required for individual invoice',
      tcknFormat: 'National ID must be 11 digits',
      companyRequired: 'Company name is required for corporate invoice',
      vknRequired: 'Tax ID (VKN) is required for corporate invoice',
      vknFormat: 'Tax ID (VKN) must be 10 digits',
      taxOfficeRequired: 'Tax office is required for corporate invoice',
      kvkkRequired: 'KVKK consent is required',
      distanceSalesRequired: 'Distance sales agreement consent is required',
      preInfoRequired: 'Pre-information form consent is required',
      orderConfirmRequired: 'Please confirm the order',
      paymentInit: 'An error occurred while starting payment',
      validation: 'Some form fields are missing or invalid. Please check.',
      database: 'Database error. Please try again.'
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
    sectionTitle: 'Premium HVAC Brands',
    sectionSubtitle: "As Turkey's distributor of leading HVAC brands, we offer top-quality ventilation solutions.",
    viewAll: 'See all brands',
    pageTitle: 'Brands',
    seoDesc: 'Premium HVAC brands under VentHub',
    notFound: 'Brand not found',
    backToAll: 'Back to all brands',
    countryLabel: 'Country:',
    aboutBrand: 'information'
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
    links: { faq: 'FAQ', returns: 'Returns & Exchanges', shipping: 'Shipping & Delivery', warranty: 'Warranty & Service' },
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
      profile: 'Profile',
      security: 'Security'
    },
    overview: {
      defaultAddressesTitle: 'Default Addresses',
      shippingAddress: 'Shipping Address',
      billingAddress: 'Billing Address',
      notSetShipping: 'Default shipping address is not set.',
      notSetBilling: 'Default billing address is not set.',
      manageAddresses: 'Manage addresses'
    },
    addresses: {
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
    security: {
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
      updateError: 'An error occurred while updating password'
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

  lead: {
    message: 'Message',
    title: 'Technical Offer Request',
    product: 'Product',
    contactInfo: 'Contact Information',
    name: 'Full Name',
    company: 'Company',
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
    consent: 'I have read and accept the privacy statement. ',
    submit: 'Submit',
    submitting: 'Submitting...',
    cancel: 'Cancel',
    errors: {
      name: 'Please enter full name',
      contact: 'Email or phone is required',
      consent: 'Consent is required'
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
      brands: { eyebrow: 'Competence', title: 'Global Brands', description: 'Official partner of the world\'s most reliable HVAC manufacturers.' },
      guidance: { eyebrow: 'Expertise', title: 'Project Support', description: 'Supporting you at every step from specification to commissioning.' },
      delivery: { eyebrow: 'Speed', title: 'Fast Delivery', description: 'On-time delivery across Turkey with our extensive stock network.' },
      support: { eyebrow: 'Continuity', title: 'After-Sales', description: 'Uninterrupted operation with technical support and spare parts warranty.' }
    }
  }
}




