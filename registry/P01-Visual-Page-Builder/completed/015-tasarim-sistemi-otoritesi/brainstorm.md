# 🧠 Brainstorm: P01-015 Tasarım Sistemi Otoritesi

## 🎯 Hedef
VentHub'ın görsel dilini (renk, boşluk, gölge, yuvarlatma) ve temel UI bileşenlerini bir "Sistem" haline getirmek. Page Builder'ın kullanacağı "Atomik Bileşenler"i mühürlemek.

## 🔍 Mevcut Durum
- Renkler Tailwind config'de var ama bileşenlerdeki kullanım tutarsız (Primary vs. Secondary kullanımı).
- Gölgeler ve border-radius değerleri projeye yayılmış durumda.
- Butonlar ve Badge'ler farklı sayfalarda farklı CSS'lere sahip.

## 💡 Mimari Çözüm

### 1. Tokenization (Tasarım Tokenları)
- `tailwind.config.ts` içinde `colors`, `boxShadow`, `borderRadius` alanlarını VentHub markasına göre standardize etmek.
- Örn: `primary-navy`, `secondary-blue`, `air-blue`, `industrial-gray`.

### 2. Props-Safe UI Library
- `src/components/ui/` altındaki bileşenlerin (Button, Input, Badge, Skeleton) Radix UI veya benzeri bir temel üzerine, VentHub stilleriyle oturtulması.
- Tüm bileşenlerin TypeScript `interface`'leri ile kesinleştirilmesi.

### 3. State-Aware Styles
- Hover, Active, Disabled, Loading durumlarının tüm projede aynı görsel tepkiyi vermesi.

## ✅ Başarı Kriterleri
- Herhangi bir UI değişikliğinin sadece Config üzerinden tüm projeye yansıması.
- Kod tabanındaki "Magic Number" (manuel px değerleri) kullanımının minimuma inmesi.
- Page Builder için hazır "Lego Parçaları"nın oluşması.
