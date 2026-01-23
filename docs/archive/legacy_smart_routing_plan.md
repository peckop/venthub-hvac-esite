# Ana Sayfa: Akıllı Yönlendirme Bölümü

## Problem
Farklı kullanıcı tipleri farklı şeyler istiyor:
- Merak eden vs etmeyen
- Bilgi almak isteyen vs istemeyen  
- Direk fiyat görmek isteyen vs istemeyen
- Teknik özellik merak eden vs etmeyen

**Şu an:** Ana sayfa güzel ama "niyete göre yönlendirme" eksik.

---

## Çözüm: "Nasıl İlerlemek İstersiniz?" Bölümü

Hero Carousel'den hemen sonra, kullanıcıya **açık seçenekler** sunmak:

```
┌─────────────────────────────────────────────────────────────────┐
│                  🎯 Size Nasıl Yardımcı Olalım?                 │
├─────────────────────────────────────────────────────────────────┤
│                                                                 │
│  ┌────────────────┐  ┌────────────────┐  ┌────────────────┐    │
│  │  📚 ÖĞRENMEK   │  │  🔍 KEŞİF      │  │  💰 FİYAT AL   │    │
│  │                │  │                │  │                │    │
│  │  Havalandırma  │  │  Kategorilere  │  │  Doğrudan ürün │    │
│  │  rehberleri,   │  │  göz at,       │  │  listesi,      │    │
│  │  teknik bilgi  │  │  karşılaştır   │  │  teklif iste   │    │
│  │                │  │                │  │                │    │
│  │  [Bilgi Merkezi]│  │ [Kategoriler] │  │  [Ürünler]     │    │
│  └────────────────┘  └────────────────┘  └────────────────┘    │
│                                                                 │
└─────────────────────────────────────────────────────────────────┘
```

---

## Proposed UI Design

### Seçenek 1: 3 Kart Yapısı (Önerilen)

| Kart | Başlık | Açıklama | Link | Hedef Persona |
|------|--------|----------|------|---------------|
| 📚 | "Öğrenmek İstiyorum" | Teknik rehberler, wizard, FAQ | `/destek/merkez` | Mühendis |
| 🔍 | "Keşfetmek İstiyorum" | Kategori kartları, ürün grupları | Scroll/MegaMenu | Genel |
| 💰 | "Fiyat Almak İstiyorum" | Ürün listesi, arama, teklif | `/products` | B2B |

### Seçenek 2: 2 Kart Yapısı (Minimal)

| Kart | Başlık | Link |
|------|--------|------|
| 🎓 "Bana Yol Göster" | CategoryLanding + Wizard |
| ⚡ "Doğrudan Ürünlere Git" | ProductsPage |

---

## Code Structure

```tsx
// src/components/SmartRouting.tsx

const SmartRouting = () => {
  const { t } = useI18n()
  
  const routes = [
    {
      icon: BookOpen,
      title: t('routing.learn.title'),      // "Öğrenmek İstiyorum"
      desc: t('routing.learn.desc'),        // "Teknik rehberler..."
      href: '/destek/merkez',
      accent: 'blue',
    },
    {
      icon: Compass,
      title: t('routing.explore.title'),    // "Keşfetmek İstiyorum"
      desc: t('routing.explore.desc'),      // "Kategorilere göz at..."
      href: '#categories',                  // Scroll or MegaMenu trigger
      accent: 'green',
    },
    {
      icon: BadgeDollarSign,
      title: t('routing.price.title'),      // "Fiyat Almak İstiyorum"
      desc: t('routing.price.desc'),        // "Doğrudan ürünlere git..."
      href: '/products?all=1',
      accent: 'orange',
    },
  ]
  
  return (
    <section className="py-12 bg-gradient-to-b from-white to-gray-50">
      <div className="max-w-5xl mx-auto px-4">
        <h2 className="text-center text-2xl font-bold mb-8">
          {t('routing.heading')}
        </h2>
        <div className="grid md:grid-cols-3 gap-6">
          {routes.map(route => (
            <RouteCard key={route.href} {...route} />
          ))}
        </div>
      </div>
    </section>
  )
}
```

---

## Implementation Steps

### Phase 1: Minimal (Bugün)
1. ⬜ `SmartRouting.tsx` bileşeni oluştur
2. ⬜ `HomePage.tsx`'e HeroCarousel sonrasına ekle
3. ⬜ i18n çevirilerini ekle

### Phase 2: Enhanced (Hafta Sonu)
1. ⬜ Hover animasyonları
2. ⬜ İkon animasyonları
3. ⬜ Analytics tracking

### Phase 3: Personalized (Gelecek)
1. ⬜ Returning visitor detection
2. ⬜ Role-based suggestions
3. ⬜ A/B testing

---

## Alternatif: Mevcut BentoGrid'i Akıllı Yönlendirici Olarak Kullanmak

Şu an BentoGrid hover video gösteriyor. Bu bölümü dönüştürebiliriz:

```
Mevcut: Görsel showcase
Yeni: Görsel showcase + Yönlendirme kartları

┌────────────────────────────────────────────────┐
│  [Fan Video]  [Hava Perdesi Video]  [IGK Video] │ ← Görsel
├────────────────────────────────────────────────┤
│  "Hangisini    "Rehberli Seçim"   "Doğrudan    │ ← Yönlendirme CTA
│   inceleyelim?"                    Ürünlere"   │
└────────────────────────────────────────────────┘
```

---

## Onay Gerekli

Bu planı onaylıyor musunuz? Hangisini tercih edersiniz:

1. **Seçenek A:** Yeni "SmartRouting" bölümü ekle (Hero sonrası)
2. **Seçenek B:** BentoGrid'i akıllı yönlendirici olarak güncelle
3. **Seçenek C:** Her ikisi de (fazla mı olur?)
4. **Başka bir fikir?**
