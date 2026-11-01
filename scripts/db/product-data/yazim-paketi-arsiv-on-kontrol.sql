-- KTL-68 — SABLON ADIM 0: ürün arşivleyen / silen / status değiştiren HER canlı yazım paketinin başına konur.
-- Sebep: REC-397 arşiv yazımı (31 Ekim 15:44-15:46Z) kanal tipi fan rehberini 500'e düşürdü; rehberin vh:aile bağı
-- aktif ürünü 0 kalan aileyi bulamadı. Bu adım yazmaz. Çıktı betiğe verilir, betik kırmızı verirse YAZILMAZ.
--
-- KULLANIM: aşağıdaki SKU listesini paketin yazacağı listeyle AYNI yap; sonuçtaki slug'ları betiğe ver:
--   node scripts/db/product-data/rehber-bagi-onkontrol.mjs --aile <slug1,slug2> --kategori <slug>
-- Çıkış 0 = temiz (yaz); 1 = rehber bağı bu kimlikleri kullanıyor (önce rehber değişir, BLOG/URUN); 2 = kullanım hatası.
-- Satır dönmezse (hiçbir aile/kategori boşalmıyor) betik çağrısı gerekmez, yine de "0 satır" çıktısı karta yazılır.

-- 0a) Yazımdan sonra AKTİF ürünü 0 kalacak aileler (arşivlenecek SKU'lar çıkarıldığında)
select f.slug as aile_slug,
       count(*) filter (where p.status = 'active')                                  as simdi_aktif,
       count(*) filter (where p.status = 'active' and p.sku not in (
         /* YAZILACAK SKU LISTESI */ 'VRT-0000'))                                   as yazimdan_sonra_aktif
from public.product_families f
join public.products p on p.family_id = f.id and p.deleted_at is null
group by f.slug
having count(*) filter (where p.status = 'active' and p.sku not in (/* YAZILACAK SKU LISTESI */ 'VRT-0000')) = 0
   and count(*) filter (where p.status = 'active') > 0
order by f.slug;

-- 0b) Yazımdan sonra aktif ürünü 0 kalacak kategoriler (aile üzerinden değil, products.category_id/subcategory_id)
select c.slug as kategori_slug
from public.categories c
where exists (select 1 from public.products p
              where p.deleted_at is null and p.status = 'active'
                and (p.category_id = c.id or p.subcategory_id = c.id))
  and not exists (select 1 from public.products p
                  where p.deleted_at is null and p.status = 'active'
                    and p.sku not in (/* YAZILACAK SKU LISTESI */ 'VRT-0000')
                    and (p.category_id = c.id or p.subcategory_id = c.id))
order by c.slug;
