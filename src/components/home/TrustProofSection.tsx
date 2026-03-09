'use client'

import React from 'react'
import { useI18n } from '../../i18n/I18nProvider'

type ProofCard = {
  id: string
  key: string
  icon: React.ReactNode
}

const PROOFS: ProofCard[] = [
  {
    id: 'brands',
    key: 'home.trustProof.proofs.brands',
    icon: (
      <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 12l2 2 4-4M7.835 4.697a3.42 3.42 0 001.946-.806 3.42 3.42 0 014.438 0 3.42 3.42 0 001.946.806 3.42 3.42 0 013.138 3.138 3.42 3.42 0 00.806 1.946 3.42 3.42 0 010 4.438 3.42 3.42 0 00-.806 1.946 3.42 3.42 0 01-3.138 3.138 3.42 3.42 0 00-1.946.806 3.42 3.42 0 01-4.438 0 3.42 3.42 0 00-1.946-.806 3.42 3.42 0 01-3.138-3.138 3.42 3.42 0 00-.806-1.946 3.42 3.42 0 010-4.438 3.42 3.42 0 00.806-1.946 3.42 3.42 0 013.138-3.138z" />
      </svg>
    )
  },
  {
    id: 'engineering',
    key: 'home.trustProof.proofs.engineering',
    icon: (
      <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
      </svg>
    )
  },
  {
    id: 'delivery',
    key: 'home.trustProof.proofs.delivery',
    icon: (
      <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M13 10V3L4 14h7v7l9-11h-7z" />
      </svg>
    )
  },
  {
    id: 'support',
    key: 'home.trustProof.proofs.support',
    icon: (
      <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M18.364 5.636l-3.536 3.536m0 5.656l3.536 3.536M9.172 9.172L5.636 5.636m3.536 9.192l-3.536 3.536M21 12a9 9 0 11-18 0 9 9 0 0118 0zm-5 0a4 4 0 11-8 0 4 4 0 018 0z" />
      </svg>
    )
  }
]

export const TrustProofSection: React.FC = () => {
  const { t } = useI18n()

  const mainTitle = t('home.trustProof.title') || "Endüstriyel HVAC Çözümlerinde Güvenilir İş Ortağınız"
  const mainSubtitle = t('home.trustProof.subtitle') || "Yılların deneyimi, yetkili mühendislik desteği ve Avrupa standartlarında ürün kalitesi ile projenizi güvence altına alın."
  const networkLabel = t('home.trustProof.distributorNetwork') || "Yetkili Dağıtıcı Ağı"

  return (
    <section className="py-20 bg-primary-navy relative overflow-hidden text-white border-y border-gray-100">
      {/* Decorative subtle background pattern */}
      <div className="absolute inset-0 opacity-10 bg-[radial-gradient(#fff_1px,transparent_1px)] [background-size:20px_20px]" />
      <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-secondary-blue/30 blur-[100px] rounded-full mix-blend-screen pointer-events-none" />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 lg:gap-8 items-center">

          {/* Left: Strong Brand Promise (No fake numbers) */}
          <div className="col-span-1 lg:col-span-5 flex flex-col justify-center">
            <h2 className="text-3xl md:text-4xl font-bold leading-tight mb-6">
              {mainTitle}
            </h2>
            <p className="text-blue-100 text-lg md:text-xl leading-relaxed max-w-lg font-light">
              {mainSubtitle}
            </p>

            <div className="mt-8 flex items-center gap-4">
              <div className="flex -space-x-3">
                 <div className="w-10 h-10 rounded-full bg-white/10 backdrop-blur border border-white/20 flex items-center justify-center">
                   <svg className="w-5 h-5 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" /></svg>
                 </div>
                 <div className="w-10 h-10 rounded-full bg-white/10 backdrop-blur border border-white/20 flex items-center justify-center">
                   <svg className="w-5 h-5 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" /></svg>
                 </div>
                 <div className="w-10 h-10 rounded-full bg-white/10 backdrop-blur border border-white/20 flex items-center justify-center">
                   <svg className="w-5 h-5 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" /></svg>
                 </div>
              </div>
              <span className="text-sm font-medium text-blue-200">
                {networkLabel}
              </span>
            </div>
          </div>

          {/* Right: Concrete Proof Tiles (No fake metrics) */}
          <div className="col-span-1 lg:col-span-7">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {PROOFS.map((proof) => {
                const title = t(`${proof.key}.title`) || "Kanıtlanmış Değer"
                const desc = t(`${proof.key}.desc`) || "Kalite standartlarına uygunluk"

                return (
                  <div key={proof.id} className="bg-white/5 backdrop-blur-sm border border-white/10 rounded-2xl p-6 hover:bg-white/10 transition-colors">
                    <div className="w-12 h-12 rounded-xl bg-blue-500/20 text-blue-300 flex items-center justify-center mb-4 border border-blue-400/20">
                      {proof.icon}
                    </div>
                    <h3 className="text-xl font-bold text-white mb-2">{title}</h3>
                    <p className="text-blue-200/80 text-sm leading-relaxed">
                      {desc}
                    </p>
                  </div>
                )
              })}
            </div>
          </div>

        </div>
      </div>
    </section>
  )
}
