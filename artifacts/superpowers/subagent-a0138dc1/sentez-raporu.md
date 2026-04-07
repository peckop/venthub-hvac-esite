# Sentez Plan??: VentHub'da Sepet Verisi Mimarisi (Supabase vs Redis)

**Tarih:** 2026-04-05  
**Durum:** KONSENSUS SA??LANDI  
**Kat??l??mc??lar:** Ajan A (superpowers-plan), Ajan B (paralel-review)

---

## B??l??m 1 ??? Ortak Kararlar
Tart????ma sonucunda her iki ajan??n da mutab??k kald?????? temel mimari prensipler:

- **Hibrit Veri Saklama:** Kal??c??l??k gerektiren (Login olmu?? kullanıcı) veriler i??in **Supabase (PostgreSQL)**, h??z ve ge??icilik gerektiren (Anonim sepet, Rate-limit) veriler i??in **Redis (Upstash)** kullan??lmal??d??r.
- **Performans Katman??:** Kullan??c??ya anl??k tepki vermek i??in **Optimistic UI** uygulanmal??, sunucuyla senkronizasyon arka planda **Debounced Sync** ile y??netilmelidir.
- **Next.js 15 Standartlar??:** T??m veri eri??imlerinde Next.js 15 'Window Safety' kurallar??na (useEffect i??inde eri??im) ve native caching (`unstable_cache`) mekanizmalar??na uyulmal??d??r.
- **Otomatik Temizlik:** Anonim sepetlerin veritaban??nda y??????lma (bloat) yapmamas?? i??in Redis taraf??nda **TTL (Time-To-Live)** mekanizması aktif edilmelidir.

## B??l??m 2 ??? ????z??ms??z Noktalar
Gelecek fazlarda netle??tirilmesi gereken teknik detaylar:

- **Sepet Birle??tirme (Merge Logic):** Anonim bir kullanıcı login oldu??unda Redis'teki sepetin Supabase'deki eski sepetle nas??l ??ak????madan birle??ece??inin (ezme mi, ekleme mi?) detaylı algoritmas?? hen??z belirlenmedi.
- **Redis Maliyet Kontrol??:** Upstash Redis kullanımının (okuma/yazma limiti) y??ksek trafikli d??nemlerdeki maliyet etkisi i??in bir limitasyon (cap) belirlenmedi.

## B??l??m 3 ??? Eylem Plan??
A??a????daki ad??mlar ??ncelik s??ras??na g??re dizilmi??tir:

1. **Supabase Sepet ??emas?? ve RLS G??ncellemesi**
   - **Dosya/Servis:** `supabase/migrations/`, `src/types/db-rows.ts`
   - **Eylem:** `shopping_carts` ve `cart_items` tablolar??n?? `auth.uid()` ile RLS z??rh??na al. Tip g??venli??i i??in `jsonb` kolonlar??na Check Constraints ekle.
   - **Do??rulama:** `mcp_supabase_execute_sql` ile farkl?? user_id'lerin birbirinin sepetine eri??emedi??ini test et.

2. **Upstash Redis Entegrasyonu**
   - **Dosya/Servis:** `src/lib/redis.ts`, `.env.local`
   - **Eylem:** Redis ba??lant??s??n?? kur. Anonim sepetler i??in `setEx` komutuyla 24 saatlik TTL tan??mla.
   - **Do??rulama:** `pnpm test src/lib/redis.test.ts` ile ba??lant?? h??z??n?? (target < 50ms) do??rula.

3. **Hybrid Cart Hook (useCart) Geli??tirilmesi**
   - **Dosya/Servis:** `src/hooks/useCart.ts`
   - **Eylem:** `isLoggedIn` durumuna g??re veriyi Supabase veya Redis'ten ceken, i??lem s??ras??nda Optimistic UI g??ncellemesi yapan hook'u yaz.
   - **Do??rulama:** Taray??c??da login/logout yap??ld??????nda sepet i??eri??inin do??ru kaynaktan geldi??ini Network tab'dan izle.

4. **Next.js 15 SSR & Window Safety Uyumu**
   - **Dosya/Servis:** `src/components/cart/CartProvider.tsx`
   - **Eylem:** LocalStorage veya Redis cache okumalar??n?? `useEffect` i??ine alarak Hydration mismatch hatalar??n?? engelle.
   - **Do??rulama:** `pnpm run build` komutunun hatas??z tamamland??????n?? g??r.

## B??l??m 4 ??? Kabul Kriterleri
Bu plan??n ba??ar?? kriterleri:

- [ ] Giri?? yapm???? kullanıcı sepeti F5 sonras?? 1 saniyeden k??sa s??rede y??kleniyor mu?
- [ ] Anonim kullanıcı verileri Redis'te TTL ile tutuluyor mu (PostgreSQL'e yaz??lm??yor mu)?
- [ ] Sepet i??lemleri (ekle/sil) s??ras??nda kullanıcı aray??z??nde hi??bir gecikme (jank) hissedilmiyor mu?
- [ ] `pnpm run lint` ve `pnpm test` sonu??lar?? tertemiz mi?
