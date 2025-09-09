begin;

-- Ensure authenticated role has required privileges alongside RLS policies
-- Storage schema grants
grant usage on schema storage to authenticated;
grant select, insert, update, delete on storage.objects to authenticated;

-- Public schema grants for product_images
grant usage on schema public to authenticated;
grant select, insert, update, delete on public.product_images to authenticated;

commit;

