# 🌙 VentHub Night Shift Protocol (Gece Vardiyası Rehberi)

Ajanları toplu olarak veya sırayla sahaya sürmek istediğinde ezberlemene gerek yok. Bu dosya senin otonom ordunu yönetme el kitabındır. 

Sıralama mantığı **"Bina Tadilatı"** (Yıkım -> İskelet -> İnce İşçilik -> Ruhsat) analojisine dayanır. Manuel çalıştırmak için aşağıdaki komutları sırasıyla terminale kopyala yapıştır yapabilirsin. Her bir adımın bir öncekinin açtığı PR (Pull Request) tamamlandıktan (veya merge edildikten) sonra çalıştırılması tavsiye edilir.

---

### FAZ 1: Hafriyat ve Yıkım (Kaba Temizlik)
Çöpleri, kullanılmayan kodları ve borçları temizlemeden binayı boyamayız.

1. **⚰️ Üst Düzey Temizlik (Undertaker):**
   *Açıklama: Kullanılmayan fonksiyonları, importları ve atıl dosyaları siler.*
   ```bash
   gh workflow run jules-undertaker.yml
   ```

2. **🧹 Teknik Borç (Janitor):**
   *Açıklama: TODO, FIXME ve HACK notlarını bularak kökünden çözer.*
   ```bash
   gh workflow run jules-janitor.yml
   ```

---

### FAZ 2: Taşıyıcı Kolonlar (Güvenlik ve Mimari)
Kod temizlendikten sonra güvenliği kilitleyip tipleri çelik gibi sağlamlaştırmalıyız.

3. **💉 Tip Güvenliği (Surgeon):**
   *Açıklama: Kod içindeki "any" ve tip kaçamaklarını kapatır.*
   ```bash
   gh workflow run jules-lint-fix.yml
   ```

4. **🛡️ Güvenlik ve RLS (Sentinel):**
   *Açıklama: Supabase veritabanı politikalarını ve backend açıklarını kapatır.*
   ```bash
   gh workflow run jules-security-audit.yml
   ```

---

### FAZ 3: İnce İşçilik (Optimizasyon & UX)
İskelet sağlam. Artık performans darboğazlarını çözüp, arayüzü güzelleştirme zamanı.

5. **⚡ Performans (Bolt):**
   *Açıklama: React render sorunlarını ve yavaş DB sorgularını hızlandırır.*
   ```bash
   gh workflow run jules-performance.yml
   ```

6. **🌍 Çeviri ve Metinler (Consul):**
   *Açıklama: Uygulamadaki çıplak metinleri useI18n dil dosyalarına bağlar.*
   ```bash
   gh workflow run jules-i18n-sync.yml
   ```

7. **🎨 UX & Erişim (Palette):**
   *Açıklama: Görme engelliler için etiketlemeleri (ARIA) ve arayüz kontrastını düzeltir.*
   ```bash
   gh workflow run jules-a11y.yml
   ```

---

### FAZ 4: Ruhsat ve Kullanım Kılavuzu (Kalite Güvence)
Kod optimize edildiğine göre, artık mühür vurup belgeleyebiliriz. Cila burada atılır.

8. **📚 Dokümantasyon (Scribe):**
   *Açıklama: Karmaşık fonksiyonlara detaylı JSDoc/TSDoc yorumları yazar.*
   ```bash
   gh workflow run jules-scribe.yml
   ```

9. **🧪 Test Mühendisi (Darwin):**
   *Açıklama: Artık değişmeyecek kodlara unit test (Vitest) yazar.*
   ```bash
   gh workflow run jules-test-coverage.yml
   ```

---
**💡 İpucu:** Spesifik bir sorunu anlık çözmek istersen (sıraya uymadan) herhangi birini tekil olarak tetikleyebilirsin. Yukarıdaki sıra sadece "Sistem Çapında Genel Yenileme" yapılacaksa izlenmelidir.
