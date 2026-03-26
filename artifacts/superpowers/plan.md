# Uygulama Plan?: Next.js 15 Async Params & React 19 Optimizasyonu

## Hedef
Next.js 15'in getirdi?i asenkron params / searchParams zorunlulu?unu projedeki t?m App Router (src/app/) sayfalar?na uygulamak ve React 19 Compiler dostu manuel useMemo / useCallback temizlikleri yapmak.

## Varsay?mlar
- Client Component'lerdeki useParams() ?a?r?lar? Next.js 15'te k?smen g?venli kalsa da, Page props'lar? KES?NL?KLE Promise'dir ve wait edilmek (Server) / use() ile ??z?lmek (Client) zorundad?r.
- T?m temizlik i?lemleri Linter'?n ve sa?lam mimarinin izin verdi?i d?zeyde tutulacakt?r.

## Plan

### Ad?m 1: Server Components Dynamic Params & Metadata Refactoring
- **Model ?nerisi:** ?? **Claude Sonnet / Opus** veya ?? **Gemini High** *(Routing'deki k?k bile?enler oldu?u ve mimari k?r?lma riski bar?nd?rd??? i?in y?ksek mant?kl? model ?artt?r).*
- **Dosyalar:** 
  - src/app/products/[id]/page.tsx
  - src/app/destek/konular/[slug]/page.tsx
  - src/app/category/[categorySlug]/[subCategorySlug]/page.tsx
  - src/app/category/[categorySlug]/page.tsx
  - src/app/brands/[slug]/page.tsx
- **De?i?iklik:** 
  - generateMetadata ve Page i?indeki params tiplerini Promise<{ paramAd?: string }> s?zdizimi ile modernize et. 
  - const { paramAd? } = await params format?nda Promise a?ma (await) operasyonunu kodla.
- **Do?rulama:** pnpm exec tsc -b tsconfig.build.json --noEmit ?al??t?rarak asenkron await tip uyumsuzluklar?n?n (Promise is missing vb.) bulunmad???n? tam denetle.

### Ad?m 2: Client Components Parameter Refactoring (React 19 Hooks)
- **Model ?nerisi:** ?? **Gemini High** *(Next.js 15 / React 19 Client Component karma?as?n? ay?rt edebilecek g?ncel bir modele ihtiya? var).*
- **Dosyalar:** 
  - src/app/admin/categories/[id]/builder/page.tsx 
  - Ve dinamik params alan muhtemel di?er Client Container rotalar?.
- **De?i?iklik:** 
  - Props'tan gelen dinamik params Promise objesi, bir Client Component ("use client") i?ine ak?yorsa onu asenkron ??zmek i?in React 19 use(props.params) hook'una ge?ir (Client'ta await yasakt?r).
- **Do?rulama:** pnpm run lint:ci ge?i?i.

### Ad?m 3: Gereksiz useMemo / useCallback Temizli?i
- **Model ?nerisi:** ?? **Gemini Flash** *(Linter'?n hata f?rlatt??? dosyalar ?zelinde "kald?rma/silme" yap?laca?? i?in basit bir amelelik (Rutin ??) i?lemidir. Pahal? modellere gerek yoktur).*
- **Dosyalar:** Proje genelindeki manuel hook kullan?mlar? (src/views/admin/ vb.).
- **De?i?iklik:** 
  - ESLint 
eact-compiler kurallar? do?rultusunda warning atan useMemo'lar?n do?rudan const ile yeniden hesaplanacak ?ekilde optimize edilmesi.
- **Do?rulama:** pnpm run lint:ci sonucu "0" hataya ula??lmas?.

### Ad?m 4: Build Stability ve Hydration Test
- **Model ?nerisi:** ?? **Gemini Flash** *(Sadece komut ?al??t?rma ve sonu? okuma i?lemi yapacakt?r).*
- **De?i?iklik:** T?m pass s?re?leri biti?iyle beraber uygulaman?n final statik-dinamik render s?re?lerinin test edilmesi.
- **Do?rulama:** pnpm run build komutunun "0" hata (tamamlanan Page Generate a?amalar?) ile ??k?? yapmas?.

## Riskler ve Azaltmalar
- **Risk:** Client page'lerde prop bazl? wait kullan?m? veya useEffect i?inde hatal? veri ?ekimi crash'e yol a?ar.
  - **Azaltma:** Yaln?zca React 19'un use() hook'u kullan?larak client bazl? param Promise'leri bypass edilecektir.

## Geri D?n?? (Rollback) Plan?
- Rotalarda Build ??kmesi durumuyla kar??la??l?rsa git restore operasyonuyla src/app mod?lleri base commit'e geri al?nacak ve hata izole de?erlendirilecektir.
