/** @.agent\claude_leak_analysis\source\src\utils\generatedFiles.ts by VentHub-Subagent - DO NOT EDIT MANUALLY **/

# VentHub Sepet Verisi Analizi: Supabase (PostgreSQL) Tercihi

**Görüş:** "superpowers-plan" perspektifinden, VentHub için sepet verilerinin **Supabase (PostgreSQL)** üzerinde tutulmasını öneriyorum. Mevcut mimariyi korumak ve veri tutarlılığını garanti altına almak için en disiplinli yaklaşım budur.

**Gerekçeler:**
1. **Mimari Bütünlük ve Sürdürülebilirlik:** Stack içerisinde halihazırda bulunan Supabase, veritabanı yönetim yükünü minimize eder. Redis eklemek, yeni bir altyapı bağımlılığı ve maliyet kalemi demektir.
2. **Veri İlişkiselliği ve Dönüşüm Kolaylığı:** Sepet verisi; ürün stokları, fiyatlar ve kullanıcı oturumlarıyla doğrudan ilişkilidir. Misafir kullanıcı giriş yaptığında (login), sepetin kullanıcı hesabına aktarılması (merge) PostgreSQL üzerinde tek bir `UPDATE` sorgusu ile atomik olarak gerçekleştirilebilir.
3. **Güvenlik (RLS):** Supabase'in Row Level Security (RLS) özelliği, sepet güvenliğini kod karmaşasına girmeden veritabanı seviyesinde sağlar. Her kullanıcı sadece kendi `user_id` veya `session_id` değerine ait veriyi görür.

**Riskler ve Mitigasyon:**
* **Yazma Gecikmesi (Latency):** PostgreSQL, bellek tabanlı Redis kadar hızlı değildir. Ancak e-ticaret sepet işlemleri milisaniyelik hız kritikliği taşımaz.
* **Bağlantı Sınırları:** Yüksek trafikte veritabanı bağlantı havuzu (connection pool) zorlanabilir; bu durum Supabase'in yerleşik Transaction modu ile aşılır.

### Uygulama Planı

**0. Şema Doğrulama (Pre-flight)**
- **İşlem:** `mcp_supabase_list_tables` ile çakışan tablo varlığını kontrol et.
- **Dosya:** `registry/PULSE.md`

**1. DB Şeması ve Migration**
- **Dosyalar:** `supabase/migrations/20260405_cart_schema.sql`
- **İşlem:** `cart_items` tablosunu `id`, `user_id` (null-ok), `session_id`, `product_id` ve `quantity` ile oluştur. RLS politikalarını ekle.
- **Doğrulama:** `mcp_supabase_execute_sql` ile tabloyu sorgula.

**2. Tip Tanımları ve Entegrasyon**
- **Dosyalar:** `src/types/db-rows.ts`, `src/lib/actions/cart.ts`
- **İşlem:** `CartItem` tipini ekle ve temel `syncCart` action'larını yaz.
- **Doğrulama:** `pnpm run type-check`.

**3. Test ve Onay**
- **Dosyalar:** `src/lib/actions/__tests__/cart.test.ts`
- **İşlem:** Ürün ekleme/çıkarma senaryolarını Vitest ile doğrula.
- **Doğrulama:** `pnpm test`.

**Risk Kontrolü & Rollback:** Hata durumunda migration geri alınır ve sepet mantığı geçici olarak `localStorage` fallback moduna çekilir.
