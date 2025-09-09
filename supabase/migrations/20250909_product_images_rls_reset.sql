begin;

-- Kesin reset: product_images tabloundaki TÜM politikaları düşür ve doğru politikaları yeniden oluştur
-- Amaç: claim (jwt role) tabanlı eski politikalar kalmışsa temizlemek ve user_profiles + auth.uid() ile net izin vermek

-- RLS açık olsun
alter table if exists public.product_images enable row level security;

-- Var olan tüm politikaları kaldır
DO $$
DECLARE pol record;
BEGIN
  FOR pol IN
    SELECT policyname
    FROM pg_policies
    WHERE schemaname='public' AND tablename='product_images'
  LOOP
    EXECUTE format('DROP POLICY %I ON public.product_images', pol.policyname);
  END LOOP;
END $$;

-- Herkese SELECT (katalog görüntüleme; zaten storage public read var)
CREATE POLICY product_images_select_all ON public.product_images
  FOR SELECT
  USING (true);

-- Yalnızca admin/moderator (user_profiles) yazabilir/güncelleyebilir/silebilir
-- Not: TO authenticated — istemci gerçekten oturumlu ise kullanılır.
CREATE POLICY product_images_insert_admin ON public.product_images
  FOR INSERT TO authenticated
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM public.user_profiles up
      WHERE up.id = auth.uid() AND up.role IN ('admin','moderator')
    )
  );

CREATE POLICY product_images_update_admin ON public.product_images
  FOR UPDATE TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM public.user_profiles up
      WHERE up.id = auth.uid() AND up.role IN ('admin','moderator')
    )
  )
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM public.user_profiles up
      WHERE up.id = auth.uid() AND up.role IN ('admin','moderator')
    )
  );

CREATE POLICY product_images_delete_admin ON public.product_images
  FOR DELETE TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM public.user_profiles up
      WHERE up.id = auth.uid() AND up.role IN ('admin','moderator')
    )
  );

commit;
