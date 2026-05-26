import React from 'react'
import Link from 'next/link'
import { MessageSquare, ArrowRight } from 'lucide-react'
import { Routes } from '../utils/routes';


export const UndecidedUserCTA: React.FC = () => {
    return (
        <div className="mt-8 mb-12 relative overflow-hidden rounded-2xl bg-gradient-to-r from-primary-navy to-secondary-blue p-6 sm:p-10 text-white shadow-xl">
            {/* Background decoration */}
            <div className="absolute top-0 right-0 w-64 h-64 bg-white/10 rounded-full -translate-y-1/2 translate-x-1/3 blur-3xl" />
            <div className="absolute bottom-0 left-0 w-32 h-32 bg-white/10 rounded-full translate-y-1/2 -translate-x-1/3 blur-2xl" />

            <div className="relative z-10 flex flex-col md:flex-row items-center justify-between gap-6">
                <div className="flex items-start gap-5 max-w-2xl">
                    <div className="w-12 h-12 rounded-xl bg-white/20 flex items-center justify-center shrink-0 backdrop-blur-sm">
                        <MessageSquare size={24} className="text-white" />
                    </div>
                    <div>
                        <h3 className="text-xl sm:text-2xl font-bold mb-2">
                            Hangi ürünün projenize uygun olduğundan emin değil misiniz?
                        </h3>
                        <p className="text-white/80 leading-relaxed text-sm sm:text-base">
                            Projenizin detaylarını uzman mühendislerimizle paylaşın. Hava debisi, basınç kayıpları ve yönetmeliklere uygun en doğru fan seçimini sizin için yapalım.
                        </p>
                    </div>
                </div>

                <Link
                    href={Routes.contact('consulting')}
                    className="group relative inline-flex items-center gap-2 bg-white text-primary-navy px-6 py-3.5 rounded-xl font-bold shadow-lg hover:shadow-xl hover:scale-[1.02] transition-transform whitespace-nowrap"
                >
                    <span>Uzman Desteği Alın</span>
                    <ArrowRight size={18} className="group-hover:translate-x-1 transition-transform" />
                </Link>
            </div>
        </div>
    )
}



