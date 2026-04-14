import { Routes } from '@/utils/routes';
import React from 'react'
import Link from 'next/link'
import Image from 'next/image'

interface SolutionItem {
  id: 'parking' | 'kitchen' | 'entrance' | 'comfort'
  href: string
  image: string
  span: string
}

const solutions: SolutionItem[] = [
  { 
    id: 'parking', 
    href: '/category/industrial-ventilation/jet-fans', 
    image: '/images/bento/parking.jpg',
    span: 'sm:col-span-2 lg:col-span-2'
  },
  { 
    id: 'kitchen', 
    href: '/category/industrial-ventilation/duct-type-fans', 
    image: '/images/bento/kitchen.jpg',
    span: 'sm:col-span-1 lg:col-span-1'
  },
  { 
    id: 'entrance', 
    href: '/category/commercial-ventilation/air-curtains', 
    image: '/images/bento/entrance.jpg',
    span: 'sm:col-span-1 lg:col-span-1'
  },
  { 
    id: 'comfort', 
    href: '/category/heat-recovery-vmc', 
    image: '/images/bento/comfort.jpg',
    span: 'sm:col-span-2 lg:col-span-2'
  }
]

interface LocalizedDict {
  eyebrow: string;
  title: string;
  subtitle: string;
  viewAll: string;
  items: Record<string, {
    title: string;
    eyebrow: string;
    description: string;
    point1: string;
    point2: string;
  }>;
}

interface ApplicationSolutionsProps {
  dictionary: LocalizedDict;
}

const ApplicationSolutions: React.FC<ApplicationSolutionsProps> = ({ dictionary: t }) => {
  return (
    <section className="relative py-24 lg:py-32 overflow-hidden bg-white">
      {/* Background Decorative Elements */}
      <div className="absolute top-0 right-0 w-1/2 h-full bg-slate-50/50 -skew-x-12 translate-x-1/4" />
      
      <div className="max-w-[1600px] mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        <div className="flex flex-col md:flex-row md:items-end justify-between mb-16 gap-8">
          <div className="max-w-2xl">
            <div 
              data-observe="fade-up"
              className="opacity-0 -translate-x-4 data-[in-view=true]:opacity-100 data-[in-view=true]:translate-x-0 transition-[opacity,transform] duration-700 ease-out text-[11px] font-bold uppercase tracking-[0.3em] text-cyan-600 mb-4"
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

        <div 
          className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6"
        >
          {solutions.map((item, index) => {
            const itemDict = t.items[item.id] || { title: '', eyebrow: '', description: '', point1: '', point2: '' };
            // Calculate delay based on index for stagger effect (0ms, 150ms, 300ms...)
            const delayClass = [
              'delay-0', 
              'delay-150', 
              'delay-300', 
              'delay-500', 
              'delay-700'
            ][index % 5];

            return (
              <div
                key={item.id}
                data-observe="fade-up"
                className={`opacity-0 translate-y-4 data-[in-view=true]:opacity-100 data-[in-view=true]:translate-y-0 transition-[opacity,transform] duration-700 ease-out ${delayClass} group relative overflow-hidden rounded-3xl bg-slate-100 h-[300px] sm:h-[400px] lg:h-[450px] ${item.span}`}
              >
                <Link href={item.href as import('next').Route} className="block w-full h-full relative">
                  <Image
                    src={item.image}
                    alt={itemDict.title}
                    fill
                    sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
                    className="object-cover transition-transform duration-1000 group-hover:scale-110"
                  />
                  
                  {/* Overlay Gradient */}
                  <div className="absolute inset-0 bg-gradient-to-t from-slate-950/90 via-slate-950/20 to-transparent opacity-60 group-hover:opacity-80 transition-opacity duration-700" />
                  
                  <div className="absolute inset-0 p-8 flex flex-col justify-end">
                    <div className="mb-4 overflow-hidden">
                      <div className="text-[10px] font-bold uppercase tracking-widest text-cyan-400 mb-2 translate-y-4 group-hover:translate-y-0 transition-[transform] duration-500">
                        {itemDict.eyebrow}
                      </div>
                      <h3 className="text-2xl font-bold text-white tracking-tight">
                        {itemDict.title}
                      </h3>
                    </div>
                    
                    <p className="text-sm text-slate-300 font-light leading-relaxed mb-6 opacity-0 group-hover:opacity-100 transition-[opacity] duration-500 line-clamp-2">
                      {itemDict.description}
                    </p>
                    
                    <div className="flex flex-wrap gap-2 opacity-0 group-hover:opacity-100 transition-[opacity] duration-700 delay-100">
                      <span className="px-3 py-1 rounded-full bg-white/10 backdrop-blur-md border border-white/10 text-[10px] text-white font-medium">
                        {itemDict.point1}
                      </span>
                      <span className="px-3 py-1 rounded-full bg-white/10 backdrop-blur-md border border-white/10 text-[10px] text-white font-medium">
                        {itemDict.point2}
                      </span>
                    </div>
                  </div>

                  {/* Corner Arrow */}
                  <div className="absolute top-8 right-8 w-12 h-12 rounded-full bg-white/10 backdrop-blur-xl border border-white/20 flex items-center justify-center opacity-0 -translate-y-4 group-hover:opacity-100 group-hover:translate-y-0 transition-[opacity,transform] duration-500">
                    <svg className="w-5 h-5 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 8l4 4m0 0l-4 4m4-4H3" />
                    </svg>
                  </div>
                </Link>
              </div>
            )
          })}
        </div>

        <div className="mt-16 text-center">
          <Link 
            href={Routes.products()}
            className="inline-flex items-center gap-4 group"
          >
            <span className="text-sm font-bold uppercase tracking-widest text-slate-400 group-hover:text-cyan-600 transition-colors">
              {t.viewAll}
            </span>
            <div className="w-12 h-[1px] bg-slate-200 group-hover:w-20 group-hover:bg-cyan-600 transition-all duration-500" />
          </Link>
        </div>
      </div>
    </section>
  )
}

export default ApplicationSolutions
