/** @.agent\claude_leak_analysis\source\src\utils\generatedFiles.ts by VentHub-Subagent - DO NOT EDIT MANUALLY **/

# Sepet Verisi Mimarisi Analizi (Ajan A - superpowers-plan)

VentHub projesinde sepet verisinin nerede tutulması gerektiği konusunda, mevcut mimariyi ve mühendislik disiplinlerini göz önüne alarak **Supabase (PostgreSQL)** çözümünü savunuyorum.

### 1. Temel Gerekçeler (Neden Supabase?)
*   **Tek Gerçeklik Kaynağı (Source of Truth):** `shopping_carts` ve `cart_items` tabloları zaten veritabanında mevcut. Redis eklemek, veriyi senkronize tutma yükü ve mimari karmaşa (Scope Creep) yaratacaktır.
*   **İlişkisel Güç:** Sepetteki ürünlerin stok durumu, fiyat güncellemeleri ve kampanya (`coupons`) eşleşmeleri için `JOIN` sorguları vazgeçilmezdir. Redis'te bu verileri uygulama katmanında birleştirmek hem hata payını artırır hem de performansı olumsuz etkileyebilir.
*   **Güvenlik ve RLS:** Supabase'in `Row Level Security` (RLS) altyapısı sayesinde, sepet verisini `auth.uid()` ile doğrudan eşleştirerek ek bir kod yazmadan güvenli hale getirebiliyoruz.
*   **Kalıcılık:** HVAC müşterileri (B2B veya kurumsal) sepetlerini hemen tamamlamayabilir. PostgreSQL, sepetin günler sonra bile farklı cihazlarda (cross-device) hazır bulunmasını garanti eder.

### 2. Gündelik Hayat Örneği
Bir restoranda olduğunuzu hayal edin. **Redis**, garsonun elindeki küçük not defteridir; hızlıdır ama garson değişirse veya defter ıslanırsa sipariş kaybolur. **Supabase** ise mutfağın ana sipariş panosudur; kalıcıdır, aşçı stokla (buzdolabıyla) panoyu anlık kıyaslayabilir ve dükkan yarın açıldığında "kim ne sipariş etmişti" bilgisi hala ordadır.

### 3. Önerilen Yaklaşım ve Riskler
*   **Risk:** Her sepet güncellemesinde veritabanına yazmak, yoğun trafikte gecikme hissi yaratabilir.
*   **Planlı Çözüm:** Client-side tarafında **Optimistic UI** ve **Debounced Sync** kullanarak kullanıcıya anlık hız hissi verilmeli, gerçek yazma işlemi arka planda asenkron yürütülmelidir.

### 4. Sonuç
Proje anayasasına (Bütünlük ve Standartlar) sadık kalarak, mevcut Supabase yapısını optimize etmek, yeni bir teknoloji (Redis) entegre etmekten daha güvenli ve sürdürülebilirdir.
