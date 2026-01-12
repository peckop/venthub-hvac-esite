import React from 'react'
import { Link } from 'react-router-dom'
import { Utensils, Factory, Car, Building2, ArrowRight } from 'lucide-react'

interface ApplicationCard {
    id: string
    title: string
    description: string
    icon: React.ReactNode
    href: string
}

const applications: ApplicationCard[] = [
    {
        id: 'restoran',
        title: 'Restoran Uygulamaları',
        description: 'Konforlu hava kalitesi ve enerji tasarrufu.',
        icon: <Utensils size={24} />,
        href: '/category/hava-perdeleri'
    },
    {
        id: 'fabrika',
        title: 'Fabrika ve Üretim',
        description: 'Zorlu endüstriyel ortamlar için optimize edilmiş çözümler.',
        icon: <Factory size={24} />,
        href: '/category/fanlar'
    },
    {
        id: 'otopark',
        title: 'Otopark Havalandırma',
        description: 'Güvenli ve temiz hava sirkülasyonu.',
        icon: <Car size={24} />,
        href: '/category/fanlar'
    },
    {
        id: 'ofis',
        title: 'Ofis ve Ticari Binalar',
        description: 'Verimli çalışma ortamları için ideal havalandırma.',
        icon: <Building2 size={24} />,
        href: '/category/isi-geri-kazanim-cihazlari'
    }
]

/**
 * Application area cards for Products Hub
 * Matches the mockup design with 4 smaller cards in a row
 */
const ApplicationCards: React.FC = () => {
    return (
        <section className="py-6">
            <h2 className="text-lg font-bold text-industrial-gray mb-4">Uygulamaya Göre Çözümler</h2>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                {applications.map((app) => (
                    <Link
                        key={app.id}
                        to={app.href}
                        className="group bg-white border border-gray-200 rounded-xl p-5 hover:shadow-lg hover:border-primary-navy/30 transition-all"
                    >
                        {/* Icon */}
                        <div className="w-12 h-12 rounded-lg bg-gray-100 group-hover:bg-primary-navy/10 flex items-center justify-center text-gray-500 group-hover:text-primary-navy mb-3 transition-colors">
                            {app.icon}
                        </div>

                        {/* Title */}
                        <h3 className="font-semibold text-industrial-gray text-sm mb-1.5 group-hover:text-primary-navy transition-colors">
                            {app.title}
                        </h3>

                        {/* Description */}
                        <p className="text-xs text-gray-500 leading-relaxed mb-3">
                            {app.description}
                        </p>

                        {/* CTA */}
                        <div className="flex items-center gap-1 text-xs font-medium text-steel-gray group-hover:text-primary-navy transition-colors">
                            <span>Keşfet</span>
                            <ArrowRight size={14} className="group-hover:translate-x-0.5 transition-transform" />
                        </div>
                    </Link>
                ))}
            </div>
        </section>
    )
}

export default ApplicationCards
