import Image from 'next/image'
import React from 'react'

const proofItems = [
  { 
    key: 'brands', 
    icon: (
      <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
        <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z" />
      </svg>
    )
  },
  { 
    key: 'guidance', 
    icon: (
      <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
        <path d="M21 16V8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16z" />
        <polyline points="3.27 6.96 12 12.01 20.73 6.96" />
        <line x1="12" y1="22.08" x2="12" y2="12" />
      </svg>
    )
  },
  { 
    key: 'delivery', 
    icon: (
      <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
        <rect x="1" y="3" width="15" height="13" />
        <polygon points="16 8 20 8 23 11 23 16 16 16 16 8" />
        <circle cx="5.5" cy="18.5" r="2.5" />
        <circle cx="18.5" cy="18.5" r="2.5" />
      </svg>
    )
  },
  { 
    key: 'support', 
    icon: (
      <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
        <path d="M21 11.5a8.38 8.38 0 0 1-.9 3.8 8.5 8.5 0 0 1-7.6 4.7 8.38 8.38 0 0 1-3.8-.9L3 21l1.9-5.7a8.38 8.38 0 0 1-.9-3.8 8.5 8.5 0 0 1 4.7-7.6 8.38 8.38 0 0 1 3.8-.9h.5a8.48 8.48 0 0 1 8 8v.5z" />
      </svg>
    )
  },
] as const

const trustStripKeys = ['authorizedBrands', 'engineeringSupport', 'nationwideDelivery', 'projectGuidance'] as const

interface TrustProofDict {
  eyebrow?: string;
  title?: string;
  subtitle?: string;
  visualAlt?: string;
  badge?: string;
  items?: Record<string, {
    eyebrow?: string;
    title?: string;
    description?: string;
  }>;
}

interface TrustStripDict {
  [key: string]: string;
}

interface TrustProofSectionProps {
  dictionary: TrustProofDict;
  trustStripDict: TrustStripDict;
}

const TrustProofSection: React.FC<TrustProofSectionProps> = ({ dictionary: t, trustStripDict: stripDict }) => {
  return (
    <section className="relative overflow-hidden bg-white py-24 sm:py-32">
      <div className="mx-auto max-w-page px-4 sm:px-6 lg:px-8">
        <div className="flex flex-col md:flex-row md:items-end justify-between mb-16 gap-6">
          <div className="max-w-3xl">
            <div 
              data-observe="fade-up"
              className="opacity-0 -translate-x-4 data-[in-view=true]:opacity-100 data-[in-view=true]:translate-x-0 transition-opacity-transform duration-700 ease-out text-xs font-bold uppercase tracking-hvac-relaxed text-cyan-600 mb-4"
            >
              {t.eyebrow}
            </div>
            <h2 
              data-observe="fade-up"
              className="opacity-0 translate-y-4 data-[in-view=true]:opacity-100 data-[in-view=true]:translate-y-0 transition-opacity-transform duration-700 ease-out delay-200 text-4xl font-light tracking-tighter text-slate-950 sm:text-6xl"
            >
              {t.title}
            </h2>
          </div>
          <p 
            data-observe="fade-up"
            className="opacity-0 data-[in-view=true]:opacity-100 transition-opacity duration-700 ease-out delay-300 max-w-md text-lg text-slate-500 font-light leading-relaxed"
          >
            {t.subtitle}
          </p>
        </div>

        <div className="grid gap-16 lg:grid-cols-2 lg:items-center">
          {/* Left Side: Visual & Badges */}
          <div
            data-observe="fade-up"
            className="opacity-0 -translate-x-4 data-[in-view=true]:opacity-100 data-[in-view=true]:translate-x-0 transition-opacity-transform duration-700 ease-out"
          >
            <div className="relative aspect-video w-full overflow-hidden rounded-hvac-2xl border border-slate-200 shadow-2xl">
              <Image
                src="/images/hvac_installation_close_up_premium_3.webp"
                alt={t.visualAlt || 'Visual'}
                fill
                sizes="(max-width: 1024px) 100vw, 50vw"
                className="h-full w-full object-cover transition-transform duration-700 hover:scale-105"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-slate-900/60 via-transparent to-transparent" />
              
              {/* Technical Overlay */}
              <div className="absolute inset-0 opacity-20 pointer-events-none" style={{ backgroundImage: 'linear-gradient(#fff 1px, transparent 1px), linear-gradient(90deg, #fff 1px, transparent 1px)', backgroundSize: '40px 40px' }} />
            </div>

            <div className="mt-8 grid grid-cols-2 gap-3 sm:grid-cols-4 lg:grid-cols-2 xl:grid-cols-4">
              {trustStripKeys.map((key) => (
                <div key={key} className="flex flex-col items-center justify-center rounded-2xl border border-slate-100 bg-slate-50/50 p-4 text-center transition-shadow hover:bg-white hover:shadow-xl hover:shadow-slate-200/50">
                  <div className="text-xs font-bold uppercase tracking-wider text-slate-400">
                    {t.badge || 'Trusted'}
                  </div>
                  <div className="mt-1 text-xs font-bold text-slate-900 leading-tight">
                    {stripDict[key]}
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Right Side: Detailed Cards */}
          <div className="grid gap-6 sm:grid-cols-2 lg:gap-8">
            {proofItems.map((item, index) => {
              const itemDict = t.items?.[item.key] || { eyebrow: '', title: '', description: '' };
              const delayClass = ['delay-0', 'delay-100', 'delay-200', 'delay-300'][index % 4];
              
              return (
                <div
                  key={item.key}
                  data-observe="fade-up"
                  className={`opacity-0 translate-y-4 data-[in-view=true]:opacity-100 data-[in-view=true]:translate-y-0 transition-opacity-transform duration-500 ease-out ${delayClass} group relative rounded-hvac-xl border border-slate-100 bg-white p-8 shadow-sm hover:-translate-y-2 hover:border-primary-navy/10 hover:shadow-2xl hover:shadow-primary-navy/5`}
                >
                  <div className="inline-flex h-12 w-12 items-center justify-center rounded-2xl bg-slate-50 text-primary-navy transition-transform duration-300 group-hover:bg-primary-navy group-hover:text-white group-hover:rotate-6">
                    {item.icon}
                  </div>
                  
                  <div className="mt-6">
                    <div className="text-xs font-bold uppercase tracking-hvac-normal text-slate-400">
                      {itemDict.eyebrow}
                    </div>
                    <h3 className="mt-2 text-xl font-bold text-slate-950">
                      {itemDict.title}
                    </h3>
                    <p className="mt-3 text-base leading-relaxed text-slate-500 font-light">
                      {itemDict.description}
                    </p>
                  </div>

                  {/* Decorative Element */}
                  <div className="absolute top-6 right-6 h-2 w-2 rounded-full bg-slate-100 group-hover:bg-primary-navy/20" />
                </div>
              )
            })}
          </div>
        </div>
      </div>
    </section>
  )
}

export default TrustProofSection
