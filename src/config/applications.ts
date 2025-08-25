// Central configuration for application-driven cards used across Home and Products pages
// This allows enabling/disabling and editing cards from a single source.

export type ApplicationIcon = 'building' | 'wind' | 'layers' | 'factory'
export type ApplicationAccent = 'blue' | 'navy' | 'emerald' | 'gray'

export type ApplicationCard = {
  key: 'parking' | 'air-curtain' | 'heat-recovery' | 'kitchen'
  title: string
  subtitle: string
  href: string
  icon: ApplicationIcon
  accent: ApplicationAccent
  active: boolean
}

export const APPLICATION_CARDS: ApplicationCard[] = [
  {
    key: 'parking',
    title: 'Otopark Havalandırma',
    subtitle: 'Yüksek debi ve basınç gerektiren çözümler',
    href: '/category/fanlar',
    icon: 'building',
    accent: 'blue',
    active: true,
  },
  {
    key: 'air-curtain',
    title: 'AVM / Giriş Hava Perdesi',
    subtitle: 'Enerji kaybını azaltan giriş çözümleri',
    href: '/category/hava-perdeleri',
    icon: 'wind',
    accent: 'navy',
    active: true,
  },
  {
    key: 'heat-recovery',
    title: 'Isı Geri Kazanım',
    subtitle: 'Verimli iklimlendirme ve enerji tasarrufu',
    href: '/category/isi-geri-kazanim-cihazlari',
    icon: 'layers',
    accent: 'emerald',
    active: true,
  },
  // Future expansion: not visible until activated
  {
    key: 'kitchen',
    title: 'Endüstriyel Mutfak',
    subtitle: 'Yağ buharı/koku kontrolü, standart uyumu',
    href: '/solutions/kitchen-ventilation',
    icon: 'factory',
    accent: 'gray',
    active: false,
  },
]

export function getActiveApplicationCards(): ApplicationCard[] {
  return APPLICATION_CARDS.filter((c) => c.active)
}

