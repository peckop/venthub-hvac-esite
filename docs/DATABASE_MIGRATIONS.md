# Database Migrations - VentHub HVAC

**Son güncelleme:** 2025-09-03

## 📋 Migration Dosyaları

### 🔧 Incremental Fix Migration
**Dosya:** `supabase/migrations/20250903_fix_payment_system.sql`

**Amacı:** Mevcut tablolara eksik kolonları ekler
**Ne zaman kullan:** Tablolar mevcut ama bazı kolonlar eksikse

**Ekledikleri:**
- `venthub_orders.customer_phone` (TEXT)
- `venthub_orders.payment_debug` (JSONB)
- `venthub_orders.payment_status` (TEXT + constraint)
- `venthub_order_items` nullable field'ları düzeltir

### 🚑 Disaster Recovery Migration  
**Dosya:** `supabase/migrations/20250903_complete_payment_system.sql`

**Amacı:** Payment sistemini sıfırdan oluşturur
**Ne zaman kullan:** Tablolar silinmiş/bozulmuşsa

**Oluşturdukları:**
- `venthub_orders` tablosu (tüm kolonlar)
- `venthub_order_items` tablosu (tüm kolonlar)
- RLS policies (güvenlik kuralları)
- Indexes (performans)
- Triggers (updated_at otomatik güncelleme)
- Constraints (veri doğrulama)

## 🛠️ Kullanım Senaryoları

### Senaryo 1: Normal Geliştirme
**Durum:** Yeni kolon eklenmeli, şema güncellenmeli
**Çözüm:** Yeni migration dosyası oluştur, incremental fix'i referans al

### Senaryo 2: Eksik Kolon Sorunu
**Durum:** "column does not exist" hatası
**Çözüm:** 
```sql
-- Supabase SQL Editor'da çalıştır
\i supabase/migrations/20250903_fix_payment_system.sql
```

### Senaryo 3: Tablolar Silindi/Bozuldu
**Durum:** "table does not exist" hatası veya tamamen bozuk şema
**Çözüm:**
```sql
-- Supabase SQL Editor'da çalıştır  
\i supabase/migrations/20250903_complete_payment_system.sql
```

### Senaryo 4: Yeni Environment Setup
**Durum:** Temiz Supabase instance, hiç tablo yok
**Çözüm:** Önce complete migration, sonra gerekirse diğer migrations

## 📊 Migration Çalıştırma Rehberi

### Supabase Dashboard'dan
1. **Supabase Dashboard'a git** → https://supabase.com/dashboard
2. **SQL Editor'ı aç**
3. **Migration dosyasının içeriğini kopyala/yapıştır**
4. **"Run" butonuna bas**
5. **Success/error mesajlarını kontrol et**

### Supabase CLI'dan (İleride)
```bash
# Tüm migration'ları çalıştır
supabase db push

# Belirli migration çalıştır  
supabase db reset --linked
```

## ⚠️ Önemli Notlar

### Güvenlik
- **Complete migration:** Mevcut tablolar varsa DROP yapmaz, CREATE IF NOT EXISTS kullanır
- **RLS policies:** Otomatik olarak güvenlik kuralları eklenir
- **Data loss:** Migration'lar veriyi silmez, sadece şema değişikliği yapar

### Test Etme
```sql
-- Migration sonrası test sorguları
SELECT table_name, column_name 
FROM information_schema.columns 
WHERE table_name IN ('venthub_orders', 'venthub_order_items');

-- RLS kontrolü
SELECT schemaname, tablename, rowsecurity 
FROM pg_tables 
WHERE tablename LIKE 'venthub_%';
```

### Troubleshooting
**Problem:** Migration çalışmıyor
**Çözüm:** 
1. Error mesajını oku
2. Database permissions kontrol et  
3. Conflicting constraints varsa manuel düzelt
4. Support'a başvur: error + migration dosyası

## 🔄 Migration Geliştirme Best Practices

### Yeni Migration Oluştururken
1. **Naming:** `YYYYMMDD_descriptive_name.sql` formatı
2. **Idempotent:** IF NOT EXISTS, IF EXISTS kullan
3. **Rollback:** Mümkünse geri alma script'i de yaz
4. **Test:** Development'da test et, sonra production'a geç
5. **Documentation:** Bu dosyayı güncelle

### Template
```sql
-- Migration: [Description]
-- Date: YYYY-MM-DD
-- Purpose: [What this migration does]

DO $$ 
BEGIN 
    -- Check conditions and add changes
    IF NOT EXISTS (conditions) THEN
        -- Make changes
        RAISE NOTICE 'Changes applied successfully';
    ELSE
        RAISE NOTICE 'Already applied, skipping';
    END IF;
END $$;

-- Add comments for documentation
COMMENT ON TABLE table_name IS 'Updated on YYYY-MM-DD - what changed';
```

## 📞 Support

**Migration sorunları için:**
- **Dosyalar:** `supabase/migrations/` klasöründe
- **Logs:** Supabase dashboard > SQL Editor'da error mesajları
- **Rollback:** Gerekirse tabloları drop edip complete migration çalıştır
- **Backup:** Önemli veriler varsa önce export al

---
*Bu belge migration stratejisini ve kullanımını açıklar. Her yeni migration için güncellenir.*
