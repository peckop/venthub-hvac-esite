'use client'

import { Routes } from '@/utils/routes';
import React from 'react'
import Link from 'next/link'
import Image from 'next/image'
import { motion } from 'framer-motion'
import { useI18n } from '../i18n/I18nProvider'
import { 
  Award, Shield, Target, Globe, Zap, 
  Factory, Microscope
} from 'lucide-react'
import Seo from '../components/Seo'
import { BrandIcon } from '../components/HVACIcons'
import { HVAC_BRANDS } from '../lib/brands'

const AboutPage: React.FC = () => {
  const { t } = useI18n()

  const stats = [
    { value: '15+', label: 'Yıllık Tecrübe', icon: Zap },
    { value: '5', label: 'Global Distribütörlük', icon: Award },
    { value: '500+', label: 'Tamamlanan Proje', icon: Factory },
    { value: '81', label: 'İl Sevkiyat Ağı', icon: Globe }
  ]

  const coreValues = [
    {
      title: 'Mühendislik Hassasiyeti',
      description: 'Sadece ürün satmıyoruz; her projeye özel debi, basınç ve verimlilik hesaplamalarıyla mühendislik çözümü sunuyoruz.',
      icon: Microscope
    },
    {
      title: 'Global Standartlar',
      description: 'Dünya devi HVAC markalarının Türkiye temsilcisi olarak, en güncel ve sertifikalı teknolojileri yerel pazara taşıyoruz.',
      icon: Target
    },
    {
      title: 'Operasyonel Güven',
      description: 'Teknopark İstanbul merkezli yönetimimiz ve geniş stok ağımızla, proje takvimlerinize sadık kalarak tam zamanında teslimat yapıyoruz.',
      icon: Shield
    }
  ]

  return (
    <div className="min-h-screen bg-white">
      <Seo
        title={`${t('aboutPage.title')} | VentHub`}
        description="VentHub: Türkiye'nin premium HVAC distribütörü. 15 yıllık tecrübe ve mühendislik odaklı havalandırma çözümleri."
      />

      {/* Cinematic Hero */}
      <section className="relative h-[70vh] flex items-center justify-center overflow-hidden bg-slate-950 text-white">
        <div className="absolute inset-0 z-0">
          <Image
            src="/images/hvac_installation_close_up_premium_3.png"
            alt="VentHub Engineering"
            fill
            sizes="100vw"
            className="object-cover opacity-30 grayscale brightness-50"
            priority
          />          <div className="absolute inset-0 bg-gradient-to-b from-transparent via-slate-950/60 to-slate-950" />
        </div>

        <div className="relative z-10 max-w-[1600px] mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="inline-flex items-center gap-3 px-4 py-2 bg-cyan-500/10 border border-cyan-500/20 rounded-full mb-8"
          >
            <span className="w-2 h-2 rounded-full bg-cyan-500 animate-pulse" />
            <span className="text-[10px] font-black uppercase tracking-[0.4em] text-cyan-400">Engineering Excellence Since 2009</span>
          </motion.div>
          
          <motion.h1 
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="text-5xl lg:text-8xl font-extralight tracking-tighter leading-[1.1] mb-10"
          >
            Havayı <span className="font-medium text-white italic">Yeniden Tanımlıyoruz</span>
          </motion.h1>
          
          <motion.p 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.2 }}
            className="max-w-2xl mx-auto text-xl text-slate-400 font-light leading-relaxed"
          >
            VentHub, modern yaşam ve endüstriyel alanlar için yüksek verimli, teknolojik ve sürdürülebilir havalandırma sistemlerinin Türkiye'deki otoritesidir.
          </motion.p>
        </div>
      </section>

      {/* Stats Grid */}
      <section className="py-24 bg-slate-50 border-b border-slate-100">
        <div className="max-w-[1600px] mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-12">
            {stats.map((stat, i) => (
              <motion.div 
                key={i}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.1 }}
                className="text-center"
              >
                <div className="text-5xl lg:text-7xl font-bold text-slate-900 tracking-tighter mb-4">{stat.value}</div>
                <div className="text-[10px] font-black uppercase tracking-[0.3em] text-cyan-600">{stat.label}</div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Story & Philosophy */}
      <section className="py-24 lg:py-32 overflow-hidden">
        <div className="max-w-[1600px] mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid lg:grid-cols-2 gap-24 items-center">
            <motion.div 
              initial={{ opacity: 0, x: -50 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              className="relative aspect-square lg:aspect-video rounded-[3rem] overflow-hidden"
            >
              <Image 
                src="/images/ekran/homepage beğendiğim yapı.png" 
                alt="VentHub Story" 
                fill 
                sizes="(max-width: 1024px) 100vw, 50vw"
                className="object-cover grayscale hover:grayscale-0 transition-all duration-1000"
              />
              <div className="absolute inset-0 bg-cyan-500/10 mix-blend-overlay" />
            </motion.div>

            <div>
              <div className="text-cyan-600 text-[10px] font-black uppercase tracking-[0.5em] mb-8">Our Vision</div>
              <h2 className="text-4xl lg:text-6xl font-extralight tracking-tighter leading-[1.1] mb-12 text-slate-900">
                Geleceğin İklimini <br />
                <span className="font-medium text-slate-950 italic">Bugün Kuruyoruz</span>
              </h2>
              <div className="space-y-8 text-lg text-slate-500 font-light leading-relaxed">
                <p>
                  VentHub, havalandırma sektöründe sadece bir tedarikçi değil, teknolojik bir çözüm ortağı olarak konumlanmaktadır. 15 yılı aşkın süredir, Avrupa'nın en prestijli markalarını Türkiye'nin en büyük projeleriyle buluşturuyoruz.
                </p>
                <p>
                  Teknopark İstanbul'daki merkezimizden yönettiğimiz operasyonlarımızda, mühendislik etiği ve operasyonel mükemmeliyeti her şeyin önünde tutuyoruz. Bizim için her ürün bir bileşen, her proje ise bir havalandırma sanatı eseridir.
                </p>
              </div>
              
              <div className="mt-12 flex items-center gap-8">
                <div className="flex -space-x-4">
                  {[1, 2, 3, 4].map(i => (
                    <div key={i} className="w-12 h-12 rounded-full border-4 border-white bg-slate-200 overflow-hidden relative">
                      <Image 
                        src={`/images/hvac_installation_close_up_premium_3.png`} 
                        alt="Team" 
                        fill 
                        sizes="48px"
                        className="object-cover" 
                      />
                    </div>
                  ))}
                </div>
                <div className="text-sm font-bold text-slate-900">
                  50+ Uzman Mühendis & <br /> 
                  <span className="text-slate-400 font-medium tracking-tight">Teknik Operasyon Kadrosu</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Authorized Brands Strip */}
      <section className="py-24 bg-slate-950 text-white">
        <div className="max-w-[1600px] mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-20">
            <div className="text-cyan-400 text-[10px] font-black uppercase tracking-[0.5em] mb-6">Strategic Partnerships</div>
            <h2 className="text-3xl lg:text-5xl font-extralight tracking-tight">Resmi Distribütör <span className="text-cyan-400 font-medium italic">Ağımız</span></h2>
          </div>
          
          <div className="flex flex-wrap justify-center items-center gap-12 lg:gap-24">
            {HVAC_BRANDS.map((brand) => (
              <motion.div 
                key={brand.slug}
                whileHover={{ scale: 1.1 }}
                className="w-32 h-16 lg:w-48 lg:h-24 bg-white/5 backdrop-blur-sm border border-white/10 rounded-2xl p-6 flex items-center justify-center grayscale opacity-50 hover:grayscale-0 hover:opacity-100 transition-all duration-500"
              >
                <BrandIcon brand={brand.name} className="w-full h-full brightness-0 invert" />
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Values Grid */}
      <section className="py-24 lg:py-32 bg-white">
        <div className="max-w-[1600px] mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid lg:grid-cols-3 gap-16">
            {coreValues.map((value, i) => (
              <motion.div 
                key={i}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.1 }}
                className="group"
              >
                <div className="w-16 h-16 rounded-2xl bg-slate-50 flex items-center justify-center mb-8 group-hover:bg-cyan-500 group-hover:text-white transition-all duration-500">
                  <value.icon size={32} strokeWidth={1} />
                </div>
                <h3 className="text-2xl font-bold text-slate-900 mb-6 tracking-tight">{value.title}</h3>
                <p className="text-slate-500 font-light leading-relaxed">{value.description}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Closing CTA */}
      <section className="py-24 bg-slate-50">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-4xl lg:text-6xl font-extralight tracking-tighter text-slate-900 mb-12 leading-tight">
            Mühendislik Ortağınızla <br />
            <span className="font-medium italic">Tanışmaya Hazır mısınız?</span>
          </h2>
          <div className="flex flex-col sm:flex-row gap-6 justify-center">
            <Link 
              href={Routes.contact()} 
              className="bg-slate-950 text-white px-12 py-6 rounded-2xl font-black uppercase text-[11px] tracking-widest hover:bg-cyan-600 transition-all shadow-xl"
            >
              İletişime Geçin
            </Link>
            <Link 
              href={Routes.products()} 
              className="bg-white text-slate-950 border border-slate-200 px-12 py-6 rounded-2xl font-black uppercase text-[11px] tracking-widest hover:bg-slate-50 transition-all"
            >
              Ürünleri Keşfedin
            </Link>
          </div>
        </div>
      </section>
    </div>
  )
}

export default AboutPage
