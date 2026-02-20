-- user_profiles tablosundaki sonsuz döngü politikasını düzelt
-- Önce tüm politikaları kaldır
DROP POLICY IF EXISTS "Users can read own profile" ON user_profiles;
DROP POLICY IF EXISTS "Users can update own profile" ON user_profiles;
DROP POLICY IF EXISTS "Users can insert own profile" ON user_profiles;

-- Basit ve güvenli politikalar oluştur
CREATE POLICY "Enable read access for authenticated users" ON user_profiles
    FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Enable insert for authenticated users" ON user_profiles
    FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Enable update for users based on user_id" ON user_profiles
    FOR UPDATE USING (auth.uid() = user_id);

-- Ürünler tablosu için de basit okuma politikası
DROP POLICY IF EXISTS "Enable read access for all users" ON products;
CREATE POLICY "Enable read access for all users" ON products
    FOR SELECT USING (true);
