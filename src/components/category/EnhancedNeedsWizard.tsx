import React, { useState, useEffect } from 'react'
import { useNavigate, Link } from 'react-router-dom'
import {
    X, ChevronRight, ChevronLeft,
    DoorOpen, Snowflake, Factory, ShoppingCart,
    Store, UtensilsCrossed, HeartPulse, Truck, Building2,
    Ruler, Wind, Zap,
    HelpCircle, MapPin, Clock, Home,
    CheckCircle2, ArrowRight, Lightbulb, Package, ExternalLink
} from 'lucide-react'
import { supabase, Product } from '../../lib/supabase'

// Types
interface WizardState {
    step: 1 | 2 | 3 | 4 | 5
    usageLocation: 'entrance' | 'cold-storage' | 'industrial' | 'retail' | null
    sector: string | null
    doorWidth: number
    doorHeight: number
    heatingNeeded: 'yes' | 'no' | 'unsure' | null
    climateZone: 'cold' | 'moderate' | 'warm' | null
    doorFrequency: 'low' | 'medium' | 'high' | null
    hasHeating: boolean | null
}

interface EnhancedWizardProps {
    isOpen: boolean
    onClose: () => void
    parentSlug: string
}

interface MatchedProduct extends Product {
    matchScore: number
    matchReason: string
}

// Data
const USAGE_LOCATIONS = [
    {
        id: 'entrance',
        title: 'Giriş Kapısı',
        description: 'Mağaza, restoran, otel girişi',
        icon: DoorOpen,
        tip: 'Müşteri konforunu artırır, enerji kaybını önler'
    },
    {
        id: 'cold-storage',
        title: 'Soğuk Hava Deposu',
        description: 'Soğuk zincir koruması',
        icon: Snowflake,
        tip: 'Soğuk zinciri KORUR, ürün bozulmasını engeller'
    },
    {
        id: 'industrial',
        title: 'Endüstriyel Tesis',
        description: 'Fabrika, lojistik tesisi',
        icon: Factory,
        tip: 'Toz, duman ve zararlı madde izolasyonu sağlar'
    },
    {
        id: 'retail',
        title: 'Market / Süpermarket',
        description: 'Soğutucu reyonlar',
        icon: ShoppingCart,
        tip: 'Soğutucu reyonlardan sıcak havayı uzak tutar'
    }
]

const SECTORS = [
    { id: 'retail', title: 'Perakende', subtitle: 'Mağaza, AVM', icon: Store, defaultHeating: true },
    { id: 'food', title: 'Gıda & Restoran', subtitle: 'Hijyen öncelikli', icon: UtensilsCrossed, defaultHeating: true },
    { id: 'health', title: 'Sağlık', subtitle: 'Hastane, Klinik', icon: HeartPulse, defaultHeating: false },
    { id: 'logistics', title: 'Lojistik & Depo', subtitle: 'Yüksek debi', icon: Truck, defaultHeating: false },
    { id: 'hospitality', title: 'Otel & Konaklama', subtitle: 'Sessiz çalışma', icon: Building2, defaultHeating: true }
]

const CLIMATE_ZONES = [
    { id: 'cold', title: 'Soğuk İklim', description: 'Doğu Anadolu, Karadeniz iç kesimler', icon: '❄️' },
    { id: 'moderate', title: 'Ilıman İklim', description: 'Marmara, Ege, Akdeniz', icon: '🌤️' },
    { id: 'warm', title: 'Sıcak İklim', description: 'Güneydoğu, yaz mevsimi', icon: '☀️' }
]

// Helper: Extract numeric value from technical spec
const extractNumber = (value: unknown): number | null => {
    if (typeof value === 'number') return value
    if (typeof value === 'string') {
        // Try to extract number from strings like "120 cm", "1200mm", "120-150 cm"
        const match = value.match(/(\d+)/);
        return match ? parseInt(match[1]) : null
    }
    return null
}

// Helper: Get product width from technical_specs
const getProductWidth = (product: Product): number | null => {
    const specs = product.technical_specs
    if (!specs) return null

    // Try common field names for width
    const widthKeys = ['genislik', 'genişlik', 'width', 'en', 'boyut', 'uzunluk', 'length', 'size', 'Genişlik', 'Width']
    for (const key of widthKeys) {
        if (specs[key]) {
            const num = extractNumber(specs[key])
            if (num) return num
        }
    }

    // Try to extract from product name (e.g., "Model 120", "HP-150")
    const nameMatch = product.name.match(/(\d{2,3})/);
    if (nameMatch) {
        const num = parseInt(nameMatch[1])
        // Only accept if it looks like a reasonable width (60-300 cm)
        if (num >= 60 && num <= 300) return num
    }

    return null
}

// Helper: Get max installation height from technical_specs
const getMaxHeight = (product: Product): number | null => {
    const specs = product.technical_specs
    if (!specs) return null

    const heightKeys = ['max_yukseklik', 'maksimum_yukseklik', 'max_height', 'montaj_yuksekligi', 'asma_yuksekligi', 'yükseklik', 'height']
    for (const key of heightKeys) {
        if (specs[key]) {
            const num = extractNumber(specs[key])
            if (num) return num
        }
    }
    return null
}

// Helper function to calculate recommendation
const calculateRecommendation = (state: WizardState): {
    series: 'elektrikli-isitici' | 'ortam-havali'
    reason: string
    tips: string[]
} => {
    // Cold storage always needs ambient
    if (state.usageLocation === 'cold-storage') {
        return {
            series: 'ortam-havali',
            reason: 'Soğuk hava depolarında ısıtıcı kullanmak mantıksızdır. Ortam havalı model, içerideki soğuğu korur.',
            tips: ['Yüksek hava debisi tercih edin', 'Kapı boyutuna uygun genişlik seçin']
        }
    }

    // Health sector prefers ambient for sterile environment
    if (state.sector === 'health') {
        return {
            series: 'ortam-havali',
            reason: 'Sağlık tesislerinde steril ortam önceliklidir. Isıtma genellikle merkezi sistemden gelir.',
            tips: ['Hijyen sertifikalı model tercih edin', 'Sessiz çalışma özelliğine dikkat edin']
        }
    }

    // If user explicitly said no heating
    if (state.heatingNeeded === 'no') {
        return {
            series: 'ortam-havali',
            reason: 'Isıtma ihtiyacınız olmadığını belirttiniz. Ortam havalı model enerji tasarrufu sağlar.',
            tips: ['Sadece izolasyon için yeterli hava debisi seçin']
        }
    }

    // If user said yes to heating
    if (state.heatingNeeded === 'yes') {
        return {
            series: 'elektrikli-isitici',
            reason: 'Kış aylarında kapı önünde sıcak karşılama sağlar ve enerji kaybını minimize eder.',
            tips: ['Termostat kontrollü model seçin', 'Güç tüketimine dikkat edin']
        }
    }

    // "Unsure" logic based on climate and frequency
    if (state.heatingNeeded === 'unsure') {
        if (state.climateZone === 'cold' || state.doorFrequency === 'high') {
            return {
                series: 'elektrikli-isitici',
                reason: `${state.climateZone === 'cold' ? 'Soğuk iklim bölgesinde' : 'Kapının sık açılması nedeniyle'} elektrikli ısıtıcılı model önerilir.`,
                tips: ['Kış aylarında konfor sağlar', 'Mevcut ısıtma sistemine destek olur']
            }
        }

        if (state.climateZone === 'warm' || state.hasHeating === true) {
            return {
                series: 'ortam-havali',
                reason: state.hasHeating
                    ? 'Mevcut ısıtma sisteminiz olduğu için ortam havalı model yeterlidir.'
                    : 'Sıcak iklim bölgesinde ısıtıcıya genellikle ihtiyaç duyulmaz.',
                tips: ['Enerji tasarrufu sağlar', 'Daha düşük işletme maliyeti']
            }
        }

        return {
            series: 'elektrikli-isitici',
            reason: 'Ilıman iklimde bile kış aylarında kapı önü soğuk olabilir. Elektrikli model daha konforlu bir deneyim sunar.',
            tips: ['Termostatla enerji kontrolü yapabilirsiniz', 'Yazın ısıtıcıyı kapatabilirsiniz']
        }
    }

    // Default fallback
    return {
        series: 'elektrikli-isitici',
        reason: 'Genel kullanım için elektrikli ısıtıcılı model önerilir.',
        tips: []
    }
}

// Main Component
const EnhancedNeedsWizard: React.FC<EnhancedWizardProps> = ({ isOpen, onClose, parentSlug }) => {
    const navigate = useNavigate()

    const [state, setState] = useState<WizardState>({
        step: 1,
        usageLocation: null,
        sector: null,
        doorWidth: 120,
        doorHeight: 250,
        heatingNeeded: null,
        climateZone: null,
        doorFrequency: null,
        hasHeating: null
    })

    const [showUnsureQuestions, setShowUnsureQuestions] = useState(false)
    const [matchedProducts, setMatchedProducts] = useState<MatchedProduct[]>([])
    const [loadingProducts, setLoadingProducts] = useState(false)

    // Fetch matching products when reaching step 5
    useEffect(() => {
        if (state.step === 5 && isOpen) {
            fetchMatchingProducts()
        }
    }, [state.step, isOpen])

    const fetchMatchingProducts = async () => {
        setLoadingProducts(true)
        try {
            const recommendation = calculateRecommendation(state)

            // Get category ID for the recommended series
            const { data: category } = await supabase
                .from('categories')
                .select('id')
                .eq('slug', recommendation.series)
                .single()

            if (!category) {
                setMatchedProducts([])
                setLoadingProducts(false)
                return
            }

            // Fetch products from this category
            const { data: products } = await supabase
                .from('products')
                .select('*')
                .eq('category_id', category.id)
                .eq('status', 'active')
                .order('is_featured', { ascending: false })

            if (!products || products.length === 0) {
                setMatchedProducts([])
                setLoadingProducts(false)
                return
            }

            // Score and filter products based on door dimensions
            const scored: MatchedProduct[] = products.map(product => {
                let score = 50 // Base score
                let reason = ''

                const productWidth = getProductWidth(product)
                const maxHeight = getMaxHeight(product)

                // Width matching (most important)
                if (productWidth) {
                    const widthDiff = productWidth - state.doorWidth
                    if (widthDiff >= 0 && widthDiff <= 20) {
                        score += 40
                        reason = `${productWidth} cm genişlik - kapınız için ideal`
                    } else if (widthDiff >= -10 && widthDiff <= 50) {
                        score += 25
                        reason = `${productWidth} cm genişlik - uygun`
                    } else if (widthDiff < -10) {
                        score += 5
                        reason = `${productWidth} cm genişlik - kapıdan dar`
                    } else {
                        score += 15
                        reason = `${productWidth} cm genişlik`
                    }
                } else {
                    reason = 'Genişlik bilgisi mevcut değil'
                }

                // Height matching
                if (maxHeight) {
                    const heightCm = state.doorHeight
                    if (maxHeight >= heightCm) {
                        score += 10
                    }
                }

                // Featured products get a boost
                if (product.is_featured) {
                    score += 5
                }

                return {
                    ...product,
                    matchScore: score,
                    matchReason: reason
                }
            })

            // Sort by score and take top 3
            const topMatches = scored
                .sort((a, b) => b.matchScore - a.matchScore)
                .slice(0, 3)

            setMatchedProducts(topMatches)
        } catch (error) {
            console.error('Error fetching products:', error)
            setMatchedProducts([])
        }
        setLoadingProducts(false)
    }

    if (!isOpen) return null

    const updateState = (updates: Partial<WizardState>) => {
        setState(prev => ({ ...prev, ...updates }))
    }

    const nextStep = () => {
        if (state.step < 5) {
            updateState({ step: (state.step + 1) as WizardState['step'] })
        }
    }

    const prevStep = () => {
        if (state.step > 1) {
            updateState({ step: (state.step - 1) as WizardState['step'] })
            setShowUnsureQuestions(false)
        }
    }

    const handleClose = () => {
        setState({
            step: 1,
            usageLocation: null,
            sector: null,
            doorWidth: 120,
            doorHeight: 250,
            heatingNeeded: null,
            climateZone: null,
            doorFrequency: null,
            hasHeating: null
        })
        setShowUnsureQuestions(false)
        setMatchedProducts([])
        onClose()
    }

    const goToResults = () => {
        const recommendation = calculateRecommendation(state)
        navigate(`/category/${parentSlug}/${recommendation.series}`)
        handleClose()
    }

    const recommendation = state.step === 5 ? calculateRecommendation(state) : null

    return (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
            <div className="bg-white rounded-2xl shadow-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto animate-fadeIn">
                {/* Header */}
                <div className="sticky top-0 bg-white border-b border-gray-100 px-6 py-4 flex justify-between items-center z-10">
                    <div>
                        <h2 className="text-xl font-bold text-primary-navy">İhtiyaç Analizi Sihirbazı</h2>
                        <p className="text-sm text-gray-500">Adım {state.step} / 5</p>
                    </div>
                    <button onClick={handleClose} className="p-2 hover:bg-gray-100 rounded-full transition-colors">
                        <X size={20} className="text-gray-500" />
                    </button>
                </div>

                {/* Progress Bar */}
                <div className="px-6 pt-4">
                    <div className="flex gap-1">
                        {[1, 2, 3, 4, 5].map(i => (
                            <div
                                key={i}
                                className={`h-1 flex-1 rounded-full transition-colors ${i <= state.step ? 'bg-secondary-blue' : 'bg-gray-200'
                                    }`}
                            />
                        ))}
                    </div>
                </div>

                {/* Content */}
                <div className="p-6">
                    {/* Step 1: Usage Location */}
                    {state.step === 1 && (
                        <div className="space-y-6">
                            <div className="text-center mb-8">
                                <h3 className="text-2xl font-bold text-gray-800 mb-2">Hava perdesini nerede kullanacaksınız?</h3>
                                <p className="text-gray-500">Kullanım yerine göre en uygun çözümü belirlememize yardımcı olun</p>
                            </div>

                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                {USAGE_LOCATIONS.map(location => {
                                    const Icon = location.icon
                                    const isSelected = state.usageLocation === location.id
                                    return (
                                        <button
                                            key={location.id}
                                            onClick={() => {
                                                updateState({ usageLocation: location.id as WizardState['usageLocation'] })
                                                setTimeout(() => nextStep(), 300)
                                            }}
                                            className={`p-5 rounded-xl border-2 text-left transition-all ${isSelected
                                                ? 'border-secondary-blue bg-blue-50'
                                                : 'border-gray-200 hover:border-secondary-blue/50 hover:bg-gray-50'
                                                }`}
                                        >
                                            <div className="flex items-start gap-4">
                                                <div className={`p-3 rounded-lg ${isSelected ? 'bg-secondary-blue text-white' : 'bg-gray-100 text-gray-600'}`}>
                                                    <Icon size={24} />
                                                </div>
                                                <div>
                                                    <h4 className="font-bold text-gray-800">{location.title}</h4>
                                                    <p className="text-sm text-gray-500">{location.description}</p>
                                                </div>
                                            </div>
                                            {isSelected && (
                                                <div className="mt-3 p-3 bg-blue-100 rounded-lg flex items-start gap-2">
                                                    <Lightbulb size={16} className="text-secondary-blue mt-0.5 flex-shrink-0" />
                                                    <p className="text-sm text-secondary-blue">{location.tip}</p>
                                                </div>
                                            )}
                                        </button>
                                    )
                                })}
                            </div>
                        </div>
                    )}

                    {/* Step 2: Sector */}
                    {state.step === 2 && (
                        <div className="space-y-6">
                            <div className="text-center mb-8">
                                <h3 className="text-2xl font-bold text-gray-800 mb-2">Hangi sektördesiniz?</h3>
                                <p className="text-gray-500">Sektörünüze özel ihtiyaçları belirleyelim</p>
                            </div>

                            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                                {SECTORS.map(sector => {
                                    const Icon = sector.icon
                                    const isSelected = state.sector === sector.id
                                    return (
                                        <button
                                            key={sector.id}
                                            onClick={() => {
                                                updateState({ sector: sector.id })
                                                setTimeout(() => nextStep(), 300)
                                            }}
                                            className={`p-4 rounded-xl border-2 text-left transition-all flex items-center gap-4 ${isSelected
                                                ? 'border-secondary-blue bg-blue-50'
                                                : 'border-gray-200 hover:border-secondary-blue/50'
                                                }`}
                                        >
                                            <div className={`p-2 rounded-lg ${isSelected ? 'bg-secondary-blue text-white' : 'bg-gray-100 text-gray-600'}`}>
                                                <Icon size={20} />
                                            </div>
                                            <div>
                                                <h4 className="font-semibold text-gray-800">{sector.title}</h4>
                                                <p className="text-xs text-gray-500">{sector.subtitle}</p>
                                            </div>
                                            {isSelected && <CheckCircle2 className="ml-auto text-secondary-blue" size={20} />}
                                        </button>
                                    )
                                })}
                            </div>
                        </div>
                    )}

                    {/* Step 3: Door Dimensions */}
                    {state.step === 3 && (
                        <div className="space-y-6">
                            <div className="text-center mb-8">
                                <h3 className="text-2xl font-bold text-gray-800 mb-2">Kapı Boyutlarını Girin</h3>
                                <p className="text-gray-500">Hava perdesi kapı genişliğine eşit veya daha geniş olmalıdır</p>
                            </div>

                            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                                {/* Door Width */}
                                <div className="space-y-3">
                                    <label className="flex items-center gap-2 font-medium text-gray-700">
                                        <Ruler size={18} />
                                        Kapı Genişliği
                                    </label>
                                    <div className="flex items-center gap-3">
                                        <input
                                            type="range"
                                            min="60"
                                            max="300"
                                            step="10"
                                            value={state.doorWidth}
                                            onChange={(e) => updateState({ doorWidth: parseInt(e.target.value) })}
                                            className="flex-1 h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer accent-secondary-blue"
                                        />
                                        <div className="w-20 text-center">
                                            <input
                                                type="number"
                                                value={state.doorWidth}
                                                onChange={(e) => updateState({ doorWidth: parseInt(e.target.value) || 100 })}
                                                className="w-full text-center border rounded-lg py-2 font-bold text-secondary-blue"
                                            />
                                            <span className="text-xs text-gray-500">cm</span>
                                        </div>
                                    </div>
                                </div>

                                {/* Door Height */}
                                <div className="space-y-3">
                                    <label className="flex items-center gap-2 font-medium text-gray-700">
                                        <Ruler size={18} className="rotate-90" />
                                        Kapı Yüksekliği (Montaj)
                                    </label>
                                    <div className="flex items-center gap-3">
                                        <input
                                            type="range"
                                            min="200"
                                            max="500"
                                            step="10"
                                            value={state.doorHeight}
                                            onChange={(e) => updateState({ doorHeight: parseInt(e.target.value) })}
                                            className="flex-1 h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer accent-secondary-blue"
                                        />
                                        <div className="w-20 text-center">
                                            <input
                                                type="number"
                                                value={state.doorHeight}
                                                onChange={(e) => updateState({ doorHeight: parseInt(e.target.value) || 250 })}
                                                className="w-full text-center border rounded-lg py-2 font-bold text-secondary-blue"
                                            />
                                            <span className="text-xs text-gray-500">cm</span>
                                        </div>
                                    </div>
                                </div>
                            </div>

                            {/* Visual Representation */}
                            <div className="mt-8 flex justify-center">
                                <div className="relative bg-gray-100 rounded-lg p-4">
                                    <div
                                        className="bg-blue-200 border-4 border-blue-400 rounded flex items-center justify-center"
                                        style={{
                                            width: `${Math.min(state.doorWidth / 2, 150)}px`,
                                            height: `${Math.min(state.doorHeight / 3, 150)}px`
                                        }}
                                    >
                                        <span className="text-blue-600 font-medium text-sm text-center">
                                            {state.doorWidth} x {state.doorHeight} cm
                                        </span>
                                    </div>
                                    <div className="absolute -top-3 left-1/2 -translate-x-1/2 bg-secondary-blue text-white text-xs px-2 py-1 rounded">
                                        Hava Perdesi
                                    </div>
                                </div>
                            </div>

                            <button
                                onClick={nextStep}
                                className="w-full mt-6 bg-secondary-blue text-white py-3 rounded-xl font-bold hover:bg-blue-600 transition-colors flex items-center justify-center gap-2"
                            >
                                Devam Et
                                <ChevronRight size={20} />
                            </button>
                        </div>
                    )}

                    {/* Step 4: Heating Need */}
                    {state.step === 4 && (
                        <div className="space-y-6">
                            <div className="text-center mb-8">
                                <h3 className="text-2xl font-bold text-gray-800 mb-2">Isıtma ihtiyacınız var mı?</h3>
                                <p className="text-gray-500">Kış aylarında kapı önünde ısıtma gerekiyor mu?</p>
                            </div>

                            {!showUnsureQuestions ? (
                                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                                    <button
                                        onClick={() => {
                                            updateState({ heatingNeeded: 'yes' })
                                            setTimeout(() => updateState({ step: 5 }), 300)
                                        }}
                                        className={`p-5 rounded-xl border-2 text-center transition-all ${state.heatingNeeded === 'yes'
                                            ? 'border-orange-500 bg-orange-50'
                                            : 'border-gray-200 hover:border-orange-300'
                                            }`}
                                    >
                                        <div className="p-3 bg-orange-100 rounded-full w-fit mx-auto mb-3">
                                            <Zap size={24} className="text-orange-500" />
                                        </div>
                                        <h4 className="font-bold text-gray-800">Evet</h4>
                                        <p className="text-xs text-gray-500 mt-1">Elektrikli ısıtıcı istiyorum</p>
                                    </button>

                                    <button
                                        onClick={() => {
                                            updateState({ heatingNeeded: 'no' })
                                            setTimeout(() => updateState({ step: 5 }), 300)
                                        }}
                                        className={`p-5 rounded-xl border-2 text-center transition-all ${state.heatingNeeded === 'no'
                                            ? 'border-blue-500 bg-blue-50'
                                            : 'border-gray-200 hover:border-blue-300'
                                            }`}
                                    >
                                        <div className="p-3 bg-blue-100 rounded-full w-fit mx-auto mb-3">
                                            <Wind size={24} className="text-blue-500" />
                                        </div>
                                        <h4 className="font-bold text-gray-800">Hayır</h4>
                                        <p className="text-xs text-gray-500 mt-1">Sadece izolasyon yeterli</p>
                                    </button>

                                    <button
                                        onClick={() => {
                                            updateState({ heatingNeeded: 'unsure' })
                                            setShowUnsureQuestions(true)
                                        }}
                                        className={`p-5 rounded-xl border-2 text-center transition-all ${state.heatingNeeded === 'unsure'
                                            ? 'border-purple-500 bg-purple-50'
                                            : 'border-gray-200 hover:border-purple-300'
                                            }`}
                                    >
                                        <div className="p-3 bg-purple-100 rounded-full w-fit mx-auto mb-3">
                                            <HelpCircle size={24} className="text-purple-500" />
                                        </div>
                                        <h4 className="font-bold text-gray-800">Bilmiyorum</h4>
                                        <p className="text-xs text-gray-500 mt-1">Bana yardım et</p>
                                    </button>
                                </div>
                            ) : (
                                <div className="space-y-6 animate-fadeIn">
                                    <div className="p-4 bg-purple-50 rounded-xl border border-purple-200">
                                        <p className="text-sm text-purple-700 flex items-center gap-2">
                                            <Lightbulb size={16} />
                                            Birkaç soru daha sorarak size en uygun çözümü belirleyeceğiz
                                        </p>
                                    </div>

                                    {/* Climate Zone */}
                                    <div className="space-y-3">
                                        <label className="flex items-center gap-2 font-medium text-gray-700">
                                            <MapPin size={18} />
                                            Bulunduğunuz iklim bölgesi
                                        </label>
                                        <div className="grid grid-cols-3 gap-2">
                                            {CLIMATE_ZONES.map(zone => (
                                                <button
                                                    key={zone.id}
                                                    onClick={() => updateState({ climateZone: zone.id as WizardState['climateZone'] })}
                                                    className={`p-3 rounded-lg border-2 text-center transition-all ${state.climateZone === zone.id
                                                        ? 'border-secondary-blue bg-blue-50'
                                                        : 'border-gray-200 hover:border-gray-300'
                                                        }`}
                                                >
                                                    <span className="text-2xl">{zone.icon}</span>
                                                    <p className="text-sm font-medium mt-1">{zone.title}</p>
                                                </button>
                                            ))}
                                        </div>
                                    </div>

                                    {/* Door Frequency */}
                                    <div className="space-y-3">
                                        <label className="flex items-center gap-2 font-medium text-gray-700">
                                            <Clock size={18} />
                                            Kapı günde ne sıklıkla açılıyor?
                                        </label>
                                        <div className="grid grid-cols-3 gap-2">
                                            {[
                                                { id: 'low', label: 'Az', desc: '< 20 kez' },
                                                { id: 'medium', label: 'Orta', desc: '20-100 kez' },
                                                { id: 'high', label: 'Çok', desc: '> 100 kez' }
                                            ].map(freq => (
                                                <button
                                                    key={freq.id}
                                                    onClick={() => updateState({ doorFrequency: freq.id as WizardState['doorFrequency'] })}
                                                    className={`p-3 rounded-lg border-2 text-center transition-all ${state.doorFrequency === freq.id
                                                        ? 'border-secondary-blue bg-blue-50'
                                                        : 'border-gray-200 hover:border-gray-300'
                                                        }`}
                                                >
                                                    <p className="font-medium">{freq.label}</p>
                                                    <p className="text-xs text-gray-500">{freq.desc}</p>
                                                </button>
                                            ))}
                                        </div>
                                    </div>

                                    {/* Has Central Heating */}
                                    <div className="space-y-3">
                                        <label className="flex items-center gap-2 font-medium text-gray-700">
                                            <Home size={18} />
                                            İç mekanda ısıtma sistemi var mı?
                                        </label>
                                        <div className="grid grid-cols-2 gap-2">
                                            {[
                                                { id: true, label: 'Evet, var' },
                                                { id: false, label: 'Hayır, yok' }
                                            ].map(option => (
                                                <button
                                                    key={String(option.id)}
                                                    onClick={() => updateState({ hasHeating: option.id })}
                                                    className={`p-3 rounded-lg border-2 text-center transition-all ${state.hasHeating === option.id
                                                        ? 'border-secondary-blue bg-blue-50'
                                                        : 'border-gray-200 hover:border-gray-300'
                                                        }`}
                                                >
                                                    <p className="font-medium">{option.label}</p>
                                                </button>
                                            ))}
                                        </div>
                                    </div>

                                    <button
                                        onClick={() => updateState({ step: 5 })}
                                        disabled={!state.climateZone || !state.doorFrequency || state.hasHeating === null}
                                        className="w-full mt-4 bg-secondary-blue text-white py-3 rounded-xl font-bold hover:bg-blue-600 transition-colors flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
                                    >
                                        Sonucu Gör
                                        <ChevronRight size={20} />
                                    </button>
                                </div>
                            )}
                        </div>
                    )}

                    {/* Step 5: Result with Product Recommendations */}
                    {state.step === 5 && recommendation && (
                        <div className="space-y-6">
                            <div className="text-center mb-6">
                                <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
                                    <CheckCircle2 size={32} className="text-green-500" />
                                </div>
                                <h3 className="text-2xl font-bold text-gray-800 mb-2">Size Özel Önerimiz</h3>
                            </div>

                            {/* Recommendation Card */}
                            <div className={`p-5 rounded-2xl border-2 ${recommendation.series === 'elektrikli-isitici'
                                ? 'border-orange-300 bg-gradient-to-br from-orange-50 to-amber-50'
                                : 'border-blue-300 bg-gradient-to-br from-blue-50 to-cyan-50'
                                }`}>
                                <div className="flex items-center gap-4 mb-3">
                                    <div className={`p-3 rounded-xl ${recommendation.series === 'elektrikli-isitici'
                                        ? 'bg-orange-100 text-orange-500'
                                        : 'bg-blue-100 text-blue-500'
                                        }`}>
                                        {recommendation.series === 'elektrikli-isitici'
                                            ? <Zap size={28} />
                                            : <Wind size={28} />
                                        }
                                    </div>
                                    <div>
                                        <h4 className="text-lg font-bold text-gray-800">
                                            {recommendation.series === 'elektrikli-isitici'
                                                ? 'Elektrikli Isıtıcılı'
                                                : 'Ortam Havalı'
                                            } Hava Perdesi
                                        </h4>
                                        <p className="text-sm text-gray-500">Sizin için en uygun çözüm</p>
                                    </div>
                                </div>

                                <p className="text-gray-700 text-sm mb-3">{recommendation.reason}</p>

                                {recommendation.tips.length > 0 && (
                                    <div className="space-y-1">
                                        {recommendation.tips.map((tip, i) => (
                                            <div key={i} className="flex items-start gap-2 text-xs text-gray-600">
                                                <Lightbulb size={12} className="mt-0.5 text-amber-500 flex-shrink-0" />
                                                <span>{tip}</span>
                                            </div>
                                        ))}
                                    </div>
                                )}
                            </div>

                            {/* Matched Products Section */}
                            <div className="border-t pt-6">
                                <div className="flex items-center gap-2 mb-4">
                                    <Package size={20} className="text-secondary-blue" />
                                    <h4 className="font-bold text-gray-800">Boyutlarınıza Uygun Modeller</h4>
                                </div>

                                {loadingProducts ? (
                                    <div className="flex items-center justify-center py-8">
                                        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-secondary-blue"></div>
                                        <span className="ml-3 text-gray-500">Modeller yükleniyor...</span>
                                    </div>
                                ) : matchedProducts.length > 0 ? (
                                    <div className="space-y-3">
                                        {matchedProducts.map((product, index) => (
                                            <Link
                                                key={product.id}
                                                to={`/product/${product.id}`}
                                                onClick={handleClose}
                                                className="block p-4 border rounded-xl hover:border-secondary-blue hover:bg-blue-50/50 transition-all group"
                                            >
                                                <div className="flex items-center gap-4">
                                                    {/* Product Image or Placeholder */}
                                                    <div className="w-16 h-16 bg-gray-100 rounded-lg flex items-center justify-center flex-shrink-0 overflow-hidden">
                                                        {product.image_url ? (
                                                            <img
                                                                src={`${(import.meta as unknown as { env?: Record<string, string> }).env?.VITE_SUPABASE_URL}/storage/v1/object/public/product-images/${product.image_url}`}
                                                                alt={product.name}
                                                                className="w-full h-full object-contain"
                                                            />
                                                        ) : (
                                                            <Package size={24} className="text-gray-400" />
                                                        )}
                                                    </div>

                                                    <div className="flex-1 min-w-0">
                                                        <div className="flex items-center gap-2">
                                                            {index === 0 && (
                                                                <span className="px-2 py-0.5 bg-green-100 text-green-700 text-xs font-medium rounded-full">
                                                                    En Uygun
                                                                </span>
                                                            )}
                                                            <h5 className="font-semibold text-gray-800 truncate">{product.name}</h5>
                                                        </div>
                                                        <p className="text-sm text-gray-500">{product.brand}</p>
                                                        <p className="text-xs text-secondary-blue mt-1">{product.matchReason}</p>
                                                    </div>

                                                    <div className="text-right flex-shrink-0">
                                                        <ExternalLink size={18} className="text-gray-400 group-hover:text-secondary-blue" />
                                                    </div>
                                                </div>
                                            </Link>
                                        ))}
                                    </div>
                                ) : (
                                    <div className="text-center py-6 text-gray-500">
                                        <Package size={32} className="mx-auto mb-2 opacity-50" />
                                        <p className="text-sm">Boyutlarınıza özel model bulunamadı.</p>
                                        <p className="text-xs">Tüm modelleri inceleyebilirsiniz.</p>
                                    </div>
                                )}
                            </div>

                            {/* Technical Summary */}
                            <div className="bg-gray-50 p-4 rounded-xl">
                                <h5 className="font-semibold text-gray-700 mb-3 text-sm">Teknik Özet</h5>
                                <div className="grid grid-cols-2 gap-3 text-xs">
                                    <div>
                                        <span className="text-gray-500">Kapı Boyutu:</span>
                                        <p className="font-medium">{state.doorWidth} x {state.doorHeight} cm</p>
                                    </div>
                                    <div>
                                        <span className="text-gray-500">Önerilen Min. Genişlik:</span>
                                        <p className="font-medium">{state.doorWidth} cm</p>
                                    </div>
                                    <div>
                                        <span className="text-gray-500">Kullanım Yeri:</span>
                                        <p className="font-medium">
                                            {USAGE_LOCATIONS.find(l => l.id === state.usageLocation)?.title || '-'}
                                        </p>
                                    </div>
                                    <div>
                                        <span className="text-gray-500">Sektör:</span>
                                        <p className="font-medium">
                                            {SECTORS.find(s => s.id === state.sector)?.title || '-'}
                                        </p>
                                    </div>
                                </div>
                            </div>

                            {/* CTA Buttons */}
                            <div className="flex flex-col sm:flex-row gap-3">
                                <button
                                    onClick={goToResults}
                                    className="flex-1 bg-secondary-blue text-white py-4 rounded-xl font-bold hover:bg-blue-600 transition-colors flex items-center justify-center gap-2"
                                >
                                    Tüm Modelleri Göster
                                    <ArrowRight size={20} />
                                </button>
                                <button
                                    onClick={handleClose}
                                    className="px-6 py-4 border border-gray-300 rounded-xl font-medium text-gray-600 hover:bg-gray-50 transition-colors"
                                >
                                    Kapat
                                </button>
                            </div>
                        </div>
                    )}
                </div>

                {/* Footer Navigation (for steps 2-4) */}
                {state.step > 1 && state.step < 5 && !showUnsureQuestions && (
                    <div className="sticky bottom-0 bg-white border-t border-gray-100 px-6 py-4">
                        <button
                            onClick={prevStep}
                            className="flex items-center gap-2 text-gray-500 hover:text-gray-700 transition-colors"
                        >
                            <ChevronLeft size={18} />
                            Geri
                        </button>
                    </div>
                )}
            </div>
        </div>
    )
}

export default EnhancedNeedsWizard
