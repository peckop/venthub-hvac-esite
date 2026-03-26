## Goal
Next.js 15 ve React 19 standartlar?na uygun olarak projedeki dinamik rotalardaki (params, searchParams) asenkron gereklilikleri sa?lamak ve eslint-plugin-react-compiler'?n g?c?nden faydalanarak projeyi gereksiz useMemo ve useCallback hook'lar?ndan ar?nd?rmak.

## Constraints
- **Next.js 15 Strictness:** Next.js 15'te params ve searchParams prop'lar? **asenkron** (Promise) yap?s?na ge?ti. Senkron (do?rudan) eri?imler terminalde uyar?/hata ?retebilir veya Hydration/Render hatalar?na yol a?abilir.
- **React 19 Compiler:** React 19 compiler re-render'lar? otomatik optimize etti?i i?in, manuel yaz?lan useCallback ve useMemo'lar kod karma?as?n? art?r?r ve compiler'?n native mekanizmalar?yla ?ak??abilir.
- **Proje B?t?nl???:** Routing yap?s?nda k?r?lma olmadan wait params.id vb. kullan?mlar?n?n dikkatli yap?lmas? gereklidir. Rota (Page/Layout) bile?enleri sunucu bile?eniyse (Server Components) asenkron fonksiyonlara d?nd?r?lmelidir; e?er Client Component iseler React use() hook'u kullan?larak resolve edilmelidir.

## Known context
- VentHub bir e-ticaret uygulamas?, yani bolca dinamik rota ([slug], [id]) bar?nd?r?yor.
- src/app/ alt?ndaki sayfalardaki (?rn: src/app/products/[id]/page.tsx veya src/app/category/[slug]/page.tsx) k?k yap? ta?lar?n?n elden ge?irilmesi gerekiyor.
- Daha ?nce veritaban? yans?malar?ndan kaynaklanan sorunlar? ViewModel katman? sayesinde ??zd?k; ?u anki derlemeler (%100 Build Success) bize React ve Next.js'in saf API de?i?ikliklerine odaklanabilece?imiz m?kemmel bir zemin sa?l?yor.

## Risks
- **Build veya Hydration Hatalar?:** Senkron b?rak?lan component'lerin production build a?amas?nda gizli hata b?rakmas? veya Cloudflare/Vercel da??t?m?nda ?al??ma an?nda ??kmelere (Runtime crash) yol a?ma riski.
- **Client Component Karma?as?:** Sunucu bile?eni yerine istemci bile?eni ("use client") olarak i?aretlenen Page'lerin hata vermesi. Client Components async Arrow / Function olamazlar; mecbur Promise ??z?mlemesi i?in React.use(params) hook'u gereklidir.
- **Fazla De?i?iklik Hatas? (Scope Creep):** Projede ?ok fazla useMemo/useCallback k?rlemesine s?k?l?rse, useEffect ba??ml?l?k dizileri (dependency array) etkilenebilir.

## Options (2-4)
1. **Oto-Tarama & Kritik Temizlik:** ?ncelikle src/app/ i?inde [param_name] klas?rlerindeki page'leri tespit edip ilgili bile?enleri Next.js 15 asenkron prop uyumlu hale getirmek (Server ise async prop, Client ise use(params) entegrasyonu yapmak). Ard?ndan React 19 compiler uyar?lar?n? ve Lint ??kt?lar?n? baz alarak kullan??s?z hale gelen useMemo/useCallback kal?nt?lar?n? g?venli olan yerlerden s?k?p temizlemek. (Dengeli ve g?venli)
2. **Kapsaml? T?m Proje Refactoring:** Regex veya ?zel bir kod analiz arac? (AST script) kullanarak t?m useMemo, useCallback'leri k?k?nden silmek. T?m rotalar? bir hamlede asenkron hale getirmek. (Son derece riskli, referans e?itli?ine (
eference equality) ba?l? ?al??an useEffect zincirlerini k?rabilir).

## Recommendation
**Option 1** son derece mant?kl? ve tavsiye edilendir. ??nk? React 19 compiler ne kadar ak?ll? olursa olsun, b?y?k kod bloklar?nda toplu manip?lasyon yan etki yaratabilir. ?nceli?imiz Next.js 15 params mecburiyetini dinamik rotalarda kusursuz oturtmakt?r. Sonras?nda linter / compiler'?n y?nlendirdi?i a?ikar refactor i?lemlerini tekil mod?ller ?zerinde yapaca??z.

## Acceptance criteria
1. App router i?indeki t?m dinamik Page ve Layout'lar?n params okumas?n?n Next.js 15 standartlar?na asenkron olarak uymas? (Server'da wait, Client component'lerde use()).
2. Manuel useMemo/useCallback varl?klar?n?n linter kural-setine uygun ?ekilde ay?klanmas? ve tip g?venli?inin s?rd?r?lmesi.
3. D?n???m sonras? pnpm run build komutunun "0" hata ile ??k?? yapmas? (Statik render, dinamik render hatalar? vs olmamal?).
