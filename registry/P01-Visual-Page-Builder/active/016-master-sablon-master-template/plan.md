# 📋 Plan: P01-016 Master Şablon (Master Template)

Bu görev, VentHub'ın tüm sayfalarını kapsayacak olan "Mimari Kabuk" yapısının inşasını kapsar.

## ✅ Alt Görevler
- [ ] `src/components/layout/MainLayout.tsx` merkezi şablon bileşeninin oluşturulması.
- [ ] Header, StickyHeader ve Footer bileşenlerinin bu şablona gömülmesi.
- [ ] Sayfa bazlı `PageShell` yardımcı bileşeninin (spacing, max-width yönetimi) yazılması.
- [ ] App Router (`app/layout.tsx`) üzerindeki dağınık yapıların bu yeni şablona taşınması.
- [ ] Sayfa geçişleri için `Framer Motion` veya CSS tabanlı merkezi bir "Layout Transition" altyapısı.
- **Verify:** Herhangi bir sayfanın içeriğinin, sayfa kodunda Header/Footer çağrılmadan otomatik sarmalanması.

## 🏗️ Uygulama Adımları

### Step 1: Layout Consolidation
- **Action:** Projenin ana `layout.tsx` dosyasını temizle ve iş mantığını `MainLayout` bileşenine devret.
- **Verify:** Tüm sayfalarda Header ve Footer'ın tutarlı bir şekilde render edilmesi.

### Step 2: PageShell Deployment
- **Action:** Kategori ve Ürün sayfalarını `PageShell` içine alarak kenar boşluklarını sabitle.
- **Verify:** Mobil ve Desktop görünümlerde hizalamaların doğrulanması.

### Step 3: Global Overlays
- **Action:** Toast bildirimleri, Sepet çekmecesi ve Auth modallarını `MainLayout` seviyesinde tekilleştir.
- **Verify:** Farklı sayfalarda aynı modalın mükemmel çalışması.
