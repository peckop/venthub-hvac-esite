bu-- Shopping carts tablosunun yanlış kolonlarını düzelt
-- Bu SQL'i Supabase Dashboard SQL Editor'da çalıştır

-- 1. Önce mevcut shopping_carts yapısını kontrol et
SELECT 
    column_name,
    data_type,
    is_nullable,
    column_default
FROM information_schema.columns 
WHERE table_name = 'shopping_carts' 
  AND table_schema = 'public'
ORDER BY ordinal_position;

-- 2. Yanlış kolonları kaldır (quantity, price olmamalı)
ALTER TABLE public.shopping_carts 
DROP COLUMN IF EXISTS quantity CASCADE;

ALTER TABLE public.shopping_carts 
DROP COLUMN IF EXISTS price CASCADE;

-- 3. Shopping carts tablosunu doğru şekle getir
-- (Sadece id, user_id, created_at, updated_at olmalı)

-- Eğer user_id kolonu yoksa ekle
DO $$ 
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'shopping_carts' 
        AND column_name = 'user_id' 
        AND table_schema = 'public'
    ) THEN
        ALTER TABLE public.shopping_carts 
        ADD COLUMN user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE;
    END IF;
END $$;

-- Eğer created_at kolonu yoksa ekle
DO $$ 
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'shopping_carts' 
        AND column_name = 'created_at' 
        AND table_schema = 'public'
    ) THEN
        ALTER TABLE public.shopping_carts 
        ADD COLUMN created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW();
    END IF;
END $$;

-- Eğer updated_at kolonu yoksa ekle
DO $$ 
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'shopping_carts' 
        AND column_name = 'updated_at' 
        AND table_schema = 'public'
    ) THEN
        ALTER TABLE public.shopping_carts 
        ADD COLUMN updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW();
    END IF;
END $$;

-- 4. RLS ayarları (eğer yoksa)
ALTER TABLE public.shopping_carts ENABLE ROW LEVEL SECURITY;

-- Kullanıcılar sadece kendi sepetlerini görebilir
DROP POLICY IF EXISTS "Users can manage their own shopping carts" ON public.shopping_carts;
CREATE POLICY "Users can manage their own shopping carts" ON public.shopping_carts
FOR ALL USING (user_id = auth.uid());

-- 5. Unique constraint: her kullanıcının sadece bir sepeti olsun
DROP INDEX IF EXISTS idx_shopping_carts_user_unique;
CREATE UNIQUE INDEX idx_shopping_carts_user_unique ON public.shopping_carts(user_id);

-- 6. Updated at trigger (eğer yoksa)
DROP TRIGGER IF EXISTS shopping_carts_updated_at ON public.shopping_carts;
CREATE TRIGGER shopping_carts_updated_at
    BEFORE UPDATE ON public.shopping_carts
    FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();

-- 7. Son kontrol - düzeltilmiş tablo yapısını görüntüle
SELECT 
    column_name,
    data_type,
    is_nullable,
    column_default
FROM information_schema.columns 
WHERE table_name = 'shopping_carts' 
  AND table_schema = 'public'
ORDER BY ordinal_position;
