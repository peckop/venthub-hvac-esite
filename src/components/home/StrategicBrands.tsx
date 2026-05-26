import React from 'react'
import BrandsShowcase from '../BrandsShowcase'

interface StrategicBrandsProps {
  dictionary: {
    eyebrow: string
    title: string
    subtitle: string
  }
}

const StrategicBrands: React.FC<StrategicBrandsProps> = ({ dictionary: t }) => {
  return (
    <section className="bg-white py-24 sm:py-32">
      <div className="mx-auto max-w-page px-4 sm:px-6 lg:px-8">
        <div className="flex flex-col md:flex-row md:items-end justify-between mb-16 gap-6">
          <div className="max-w-3xl">
            <div 
              data-observe="fade-up"
              className="opacity-0 -translate-x-4 data-[in-view=true]:opacity-100 data-[in-view=true]:translate-x-0 transition-[opacity,transform] duration-700 ease-out text-xs font-bold uppercase tracking-[0.3em] text-cyan-600 mb-4"
            >
              {t.eyebrow}
            </div>
            <h2 
              data-observe="fade-up"
              className="opacity-0 translate-y-4 data-[in-view=true]:opacity-100 data-[in-view=true]:translate-y-0 transition-[opacity,transform] duration-700 ease-out delay-200 text-4xl font-light tracking-tighter text-slate-950 sm:text-6xl"
            >
              {t.title}
            </h2>
          </div>
          <p 
            data-observe="fade-up"
            className="opacity-0 data-[in-view=true]:opacity-100 transition-[opacity] duration-700 ease-out delay-300 max-w-md text-lg text-slate-500 font-light leading-relaxed"
          >
            {t.subtitle}
          </p>
        </div>
      </div>

      <BrandsShowcase />
    </section>
  )
}

export default StrategicBrands
