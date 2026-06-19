-- get_category_counts(): müşteri navigasyonunda "ürünü olmayan" kategorileri gizlemek için
-- her kategorinin alt-ağaç (distinct) AKTİF ürün sayısını döndürür.
-- Boş iskele kategoriler (gelecekteki ürün aileleri için) DB'de KALIR; yalnız count=0 ise
-- müşteriye gösterilmez — filtre uygulama katmanında (CategoryContext), veri katmanı sadece sayar.
--
-- SaaS / multi-tenant uyumu:
--   SECURITY INVOKER (varsayılan) → fonksiyon ÇAĞIRANIN RLS'i ile çalışır. Faz-2'de
--   products/categories RLS tenant-scoped olduğunda bu sayım da OTOMATİK tenant-scoped olur
--   (yeniden yazım gerekmez). Tenant mantığı burada DEĞİL, RLS'te = RLS-first.
--   search_path = '' + şema-nitelikli isimler → Supabase advisor "mutable search_path" uyumlu.

CREATE OR REPLACE FUNCTION public.get_category_counts()
RETURNS TABLE (category_id uuid, product_count integer)
LANGUAGE sql
STABLE
SECURITY INVOKER
SET search_path = ''
AS $$
  SELECT c.id AS category_id,
         COUNT(DISTINCT p.id) FILTER (WHERE p.status = 'active')::int AS product_count
  FROM public.categories c
  LEFT JOIN public.products p
    ON p.category_id = c.id
       OR p.subcategory_id = c.id
       OR p.category_id IN (SELECT ch.id FROM public.categories ch WHERE ch.parent_id = c.id)
       OR p.subcategory_id IN (SELECT ch.id FROM public.categories ch WHERE ch.parent_id = c.id)
  GROUP BY c.id;
$$;

GRANT EXECUTE ON FUNCTION public.get_category_counts() TO anon, authenticated;
