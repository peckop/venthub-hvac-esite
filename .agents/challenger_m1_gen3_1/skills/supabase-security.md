# Supabase Security Skill Copy
(Copied from c:\Users\alize\venthub-hvac\.agent\skills\supabase-security\SKILL.md)

## 🛫 Prerequisites (Ön Koşul Kontrolü)
1. Supabase Proje Bağlantısı
2. Migration Dizini
3. Yıkıcı SQL Kontrolü

## RLS (Row Level Security) Prensipleri
- Tüm tablolarda RLS AÇIK olmalı
- Public tablolar için SELECT policy var
- Yazma işlemleri admin/service_role gerektirir
- Kullanıcı verisi sadece kendi sahibine görünür (`auth.uid() = user_id`)

## SECURITY DEFINER Fonksiyon Erişim Kontrolü
- Postgres'te public şemasında oluşturulan tüm fonksiyonlara varsayılan olarak EXECUTE yetkisi PUBLIC rolüne verilir.
- Kural: REVOKE EXECUTE ON FUNCTION public.my_function() FROM anon, public;

## Supabase 2026 Data API Güncellemesi: Altın Üçlü (Golden Triad) Kuralı
1. Açık İzinler (GRANT)
2. RLS Aktifleştirme (ENABLE RLS)
3. RLS Politikaları (CREATE POLICY)

## Webhook Güvenlik Standartları
- x-webhook-secret (HMAC-SHA256) başlığıyla korunmalı ve x-timestamp kontrolü yapılmalı.

## Postgres View RLS Güvenliği (Security Invoker)
- security_invoker = true ayarı zorunlu.

## JWT & Metadata
- user_metadata YASAK — JWT yetkilendirme kararlarında raw_user_meta_data kullanılamaz. Her zaman app_metadata kullan.
- RBAC için Auth Hook kullan.
