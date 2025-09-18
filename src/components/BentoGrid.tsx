import React, { useRef } from 'react'
import { useI18n } from '../i18n/I18nProvider'

interface BentoItem {
  title: string
  subtitle?: string
  image: string
  video?: string
}

const BentoCard: React.FC<{ item: BentoItem; large?: boolean }> = ({ item, large }) => {
  const videoRef = useRef<HTMLVideoElement | null>(null)
  const isCoarse = typeof window !== 'undefined' && window.matchMedia && window.matchMedia('(pointer: coarse)').matches
  return (
    <div
      className={`relative overflow-hidden rounded-2xl border border-light-gray shadow-sm group ${large ? 'md:col-span-2 md:row-span-2' : ''}`}
    >
      <img src={item.image} alt={item.title} className="w-full h-full object-cover object-center" loading="lazy" />
      {item.video && !isCoarse && (
        <video
          ref={videoRef}
          src={item.video}
          muted
          playsInline
          preload="metadata"
          className="absolute inset-0 w-full h-full object-cover opacity-0 group-hover:opacity-100 transition-opacity duration-500"
          onMouseEnter={() => videoRef.current?.play().catch(()=>{})}
          onMouseLeave={() => { videoRef.current?.pause(); if (videoRef.current) videoRef.current.currentTime = 0 }}
        />
      )}
      <div className="absolute inset-0 bg-gradient-to-t from-black/40 via-black/10 to-transparent" />
      <div className="absolute bottom-3 left-3 right-3 text-white">
        <div className="text-lg font-semibold drop-shadow">{item.title}</div>
        {item.subtitle && <div className="text-sm text-white/90">{item.subtitle}</div>}
      </div>
    </div>
  )
}

const BentoGrid: React.FC = () => {
  const { t } = useI18n()
  const items: BentoItem[] = [
    { title: t('homeGallery.items.parking.title'), subtitle: t('homeGallery.items.parking.subtitle'), image: '/images/bento/parking.jpg', video: '/videos/parking.mp4' },
    { title: t('homeGallery.items.airCurtain.title'), subtitle: t('homeGallery.items.airCurtain.subtitle'), image: '/images/bento/air-curtain.jpg', video: '/videos/air-curtain.mp4' },
    { title: t('homeGallery.items.heatRecovery.title'), subtitle: t('homeGallery.items.heatRecovery.subtitle'), image: '/images/bento/hrv.jpg', video: '/videos/hrv.mp4' },
    { title: t('homeGallery.items.industrialKitchen.title'), subtitle: t('homeGallery.items.industrialKitchen.subtitle'), image: '/images/bento/kitchen.jpg', video: '/videos/kitchen.mp4' },
    { title: t('homeGallery.items.smokeExhaust.title'), subtitle: t('homeGallery.items.smokeExhaust.subtitle'), image: '/images/bento/smoke.jpg', video: '/videos/smoke.mp4' },
    { title: t('homeGallery.items.hvac.title'), subtitle: t('homeGallery.items.hvac.subtitle'), image: '/images/bento/hvac.jpg', video: '/videos/hvac.mp4' },
  ]
  // 2x3 grid, bir büyük karo
  return (
    <section className="py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="mb-4">
          <h2 className="text-2xl md:text-3xl font-bold text-industrial-gray">{t('homeGallery.title')}</h2>
          <p className="text-steel-gray">{t('homeGallery.subtitle')}</p>
        </div>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3 auto-rows-[140px] sm:auto-rows-[160px] md:auto-rows-[180px]">
          <BentoCard item={items[0]} large />
          <BentoCard item={items[1]} />
          <BentoCard item={items[2]} />
          <BentoCard item={items[3]} />
          <BentoCard item={items[4]} />
          <BentoCard item={items[5]} />
        </div>
      </div>
    </section>
  )
}

export default BentoGrid

