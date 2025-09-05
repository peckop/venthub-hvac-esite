import React, { useRef } from 'react'

interface BentoItem {
  title: string
  subtitle?: string
  image: string
  video?: string
}

const ITEMS: BentoItem[] = [
  { title: 'Otopark Havalandırma', subtitle: 'Jet fan / CO kontrol', image: '/images/bento/parking.jpg', video: '/videos/parking.mp4' },
  { title: 'Hava Perdesi', subtitle: 'Giriş konforu', image: '/images/bento/air-curtain.jpg', video: '/videos/air-curtain.mp4' },
  { title: 'Isı Geri Kazanım', subtitle: 'Enerji verimliliği', image: '/images/bento/hrv.jpg', video: '/videos/hrv.mp4' },
  { title: 'Endüstriyel Mutfak', subtitle: 'Davlumbaz ve kanal', image: '/images/bento/kitchen.jpg', video: '/videos/kitchen.mp4' },
  { title: 'Duman Egzozu', subtitle: 'Acil durum', image: '/images/bento/smoke.jpg', video: '/videos/smoke.mp4' },
  { title: 'Isıtma/Soğutma', subtitle: 'Konfor iklimi', image: '/images/bento/hvac.jpg', video: '/videos/hvac.mp4' },
]

const BentoCard: React.FC<{ item: BentoItem; large?: boolean }> = ({ item, large }) => {
  const videoRef = useRef<HTMLVideoElement | null>(null)
  return (
    <div
      className={`relative overflow-hidden rounded-2xl border border-light-gray shadow-sm group ${large ? 'md:col-span-2 md:row-span-2' : ''}`}
    >
      <img src={item.image} alt={item.title} className="w-full h-full object-cover" loading="lazy" />
      {item.video && (
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
  // 2x3 grid, bir büyük karo
  return (
    <section className="py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="mb-4">
          <h2 className="text-2xl md:text-3xl font-bold text-industrial-gray">Uygulama Vitrini</h2>
          <p className="text-steel-gray">Gerçek kullanım senaryolarına hızlı bakış</p>
        </div>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3 auto-rows-[140px] sm:auto-rows-[160px] md:auto-rows-[180px]">
          <BentoCard item={ITEMS[0]} large />
          <BentoCard item={ITEMS[1]} />
          <BentoCard item={ITEMS[2]} />
          <BentoCard item={ITEMS[3]} />
          <BentoCard item={ITEMS[4]} />
          <BentoCard item={ITEMS[5]} />
        </div>
      </div>
    </section>
  )
}

export default BentoGrid

