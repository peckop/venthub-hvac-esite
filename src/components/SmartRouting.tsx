import React from 'react'
import { Link } from 'react-router-dom'
import { Building2, Wrench, MessageSquare, ArrowRight } from 'lucide-react'
import { useScrollAnimation, scrollAnimationClasses } from '../hooks/useScrollAnimation'

interface RouteOption {
    icon: React.ElementType
    title: string
    subtitle: string
    description: string
    href: string
    color: string
    bgColor: string
    borderColor: string
    isScroll?: boolean
}

/**
 * SmartRouting - Niyet tabanlı yönlendirme bileşeni
 * Proje tema renklerine uyumlu, profesyonel tasarım
 */
const SmartRouting: React.FC = () => {
    const [sectionRef, isVisible] = useScrollAnimation<HTMLElement>()

    const routes: RouteOption[] = [
        {
            icon: Building2,
            title: 'Yeni Kurulum',
            subtitle: 'Proje bazlı çözümler',
            description: 'Yeni tesis, mağaza veya işyeri için profesyonel HVAC sistemleri',
            href: '#categories',
            color: 'text-primary-navy',
            bgColor: 'bg-air-blue hover:bg-blue-100',
            borderColor: 'border-primary-navy/20 hover:border-primary-navy/40',
            isScroll: true
        },
        {
            icon: Wrench,
            title: 'Yedek Parça',
            subtitle: 'Mevcut sisteme uygun',
            description: 'Havalandırma ve klima sistemleri için orijinal yedek parçalar',
            href: '/category/aksesuarlar',
            color: 'text-gold-accent',
            bgColor: 'bg-orange-50 hover:bg-orange-100',
            borderColor: 'border-warning-orange/20 hover:border-warning-orange/40'
        },
        {
            icon: MessageSquare,
            title: 'Teknik Danışmanlık',
            subtitle: 'Uzman desteği',
            description: 'Proje planlama, ürün seçimi ve kurulum danışmanlığı',
            href: '/contact',
            color: 'text-success-green',
            bgColor: 'bg-green-50 hover:bg-green-100',
            borderColor: 'border-success-green/20 hover:border-success-green/40'
        }
    ]

    const handleClick = (route: RouteOption, e: React.MouseEvent) => {
        if (route.isScroll) {
            e.preventDefault()
            const target = document.getElementById('categories')
            if (target) {
                target.scrollIntoView({ behavior: 'smooth', block: 'start' })
            }
        }
    }

    return (
        <section ref={sectionRef} className="py-12 sm:py-16 bg-gradient-to-b from-white to-light-gray overflow-hidden">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                {/* Header */}
                <div className={`text-center mb-8 sm:mb-12 ${scrollAnimationClasses.fadeUp(isVisible)}`}>
                    <h2 className="text-2xl sm:text-3xl md:text-4xl font-bold text-industrial-gray mb-3">
                        Size Nasıl Yardımcı Olabiliriz?
                    </h2>
                    <p className="text-base sm:text-lg text-steel-gray max-w-2xl mx-auto">
                        İhtiyacınıza göre doğru yola yönlendirelim
                    </p>
                </div>

                {/* Route Cards */}
                <div className="grid md:grid-cols-3 gap-4 sm:gap-6">
                    {routes.map((route, index) => {
                        const Icon = route.icon
                        const cardClasses = `group relative rounded-2xl p-6 sm:p-8 border transition-all duration-300 ${route.bgColor} ${route.borderColor} ${scrollAnimationClasses.fadeUp(isVisible)} cursor-pointer hover:shadow-hvac-lg hover:-translate-y-1`

                        const cardContent = (
                            <>
                                {/* Icon */}
                                <div className={`w-14 h-14 rounded-xl bg-white shadow-sm flex items-center justify-center mb-5 group-hover:scale-110 group-hover:shadow-hvac transition-all duration-300 ${route.color}`}>
                                    <Icon size={28} />
                                </div>

                                {/* Content */}
                                <h3 className="text-xl font-bold text-industrial-gray mb-1">
                                    {route.title}
                                </h3>
                                <p className={`text-sm font-medium ${route.color} mb-3`}>
                                    {route.subtitle}
                                </p>
                                <p className="text-sm text-steel-gray mb-4">
                                    {route.description}
                                </p>

                                {/* Arrow */}
                                <div className={`flex items-center gap-2 text-sm font-semibold ${route.color} group-hover:gap-3 transition-all`}>
                                    <span>Keşfet</span>
                                    <ArrowRight size={16} className="group-hover:translate-x-1 transition-transform" />
                                </div>
                            </>
                        )

                        if (route.isScroll) {
                            return (
                                <button
                                    key={index}
                                    onClick={(e) => handleClick(route, e)}
                                    className={cardClasses}
                                    style={{ transitionDelay: `${index * 100}ms` }}
                                >
                                    {cardContent}
                                </button>
                            )
                        }

                        return (
                            <Link
                                key={index}
                                to={route.href}
                                className={cardClasses}
                                style={{ transitionDelay: `${index * 100}ms` }}
                            >
                                {cardContent}
                            </Link>
                        )
                    })}
                </div>
            </div>
        </section>
    )
}

export default SmartRouting
