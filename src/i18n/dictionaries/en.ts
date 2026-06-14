import { admin } from './admin/en'
import { tr } from './tr'

export const en: typeof tr = {
  common: {
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
        conditioning: 'Air Conditioning Solutions'
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
    recentSearches: 'Recent Searches',
    clearRecent: 'Clear',
    popularCategories: 'Popular Categories',
    noResults: 'No results found',
    detailedSearch: 'detailed search for',
    allResults: 'See all results',
    keyboardHint: 'Navigate with arrow keys',
    enterHint: 'For all results',
    placeholder: 'Search products, categories, brands...',
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
  legal: {
    kvkkTitle: 'KVKK Clarification Text (Draft)',
    draftWarning: 'This text is a draft and for testing purposes. Please update it with your company\'s actual details and confirm with a legal expert before going live.',
    disclaimer: 'This text does not constitute legal advice. It is recommended to seek professional counsel for the final text.'
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
    pa_id: 'Paid',
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
    invoicePdf: 'Proforma (PDF)',
    empty: 'You have no orders yet.',
    orderDate: 'Order Date',
    orderNo: 'Order No',
    orderTotal: 'Total Amount'
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
    noAccount: 'Don\'t have an account?',
    register: 'Sign Up',
    validEmailPassRequired: 'Email and password are required',
    required: 'is required',
    emailInval_id: 'Invalid email address',
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
      emailInval_id: 'Please enter a valid email address',
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
      database: 'Database error. Please try again.',
      paymentError: 'An error occurred during payment'
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
      profile: 'Profile',
      security: 'Security'
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
    airCurtain: {
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
        subtitle: 'Recommended air curtain _specifications',
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
        efficiencyWarningDesc: 'A more powerful model or additional measures may be required'
      },
      diagram: {
        unit: 'Air Curtain'
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
        electricityPrice: 'Electricity Unit Price'
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
