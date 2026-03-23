## Hedef
Projedeki `id` ve `_id` isimlendirme uyu?mazl???n? gidermek, `process.env` eri?im hatalar?n? d?zeltmek ve tip g?venli?ini sa?layarak uygulaman?n kararl? ?al??mas?n? sa?lamak.

## K?s?tlamalar
- VentHub "Clean Code" standartlar?na uyulmal?.
- `any` tipi kesinlikle kullan?lmamal?.
- Next.js 15 asenkron `params` yap?s?na uyulmal?.
- T?m metinler `useI18n()` ile yerelle?tirilmelidir.

## Bilinen Ba?lam
- Veritaban? (Supabase) ?emas?nda birincil anahtarlar `id` (UUID) olarak tan?ml?.
- `database.types.ts` ve `db-rows.ts` dosyalar?nda bu alanlar `_id` olarak ge?iyor (b?y?k ihtimalle hatal? bir override veya eski bir d?n???m kal?nt?s?).
- `process.env` kullan?m? istemci taraf?nda (Next.js client components) tip hatas?na yol a??yor.

## Riskler
- `_id` alan?n? `id` olarak de?i?tirmek, bu alana g?venen t?m bile?enlerde (admin, products, categories) k?r?lmalara yol a?abilir.
- `database.types.ts` dosyas? otomatik olu?turulmu?sa, manuel d?zenlemeler gelecekte ezilebilir.

## Se?enekler
1. **Se?enek 1 (Radikal D?zeltme):** T?m `_id` kullan?mlar?n? `id` olarak de?i?tirerek veritaban?yla tam uyum sa?lamak.
2. **Se?enek 2 (D?n??t?r?c? Katman?):** Veritaban?ndan gelen `id`'yi `mapDatabaseCategoryToDomain` gibi fonksiyonlarda `_id`'ye d?n??t?rmeye devam etmek (mevcut hatal? yap?y yamamak).
3. **Se?enek 3 (Hibrit):** `DbCategory` gibi temel tiplerde `id: string` ve `_id: string` (alias) ikilisini bir s?re beraber sunmak.

## ?neri
**Se?enek 1** ?nerilir. Teknik bor? biriktirmemek ad?na, veritaban? ger?e?i neyse (yani `id`) TypeScript tiplerinin de bunu yans?tmas? gerekir. `_id` kullan?m? projede kafa kar???kl??? yaratmaktad?r.

## Kabul Kriterleri
- `src/` alt?ndaki hi?bir dosyada `id` ve `_id` uyu?mazl???na ba?l? `tsc` hatas? kalmamal?.
- Admin panelindeki kategori listeleme, ekleme ve d?zenleme i?lemleri sorunsuz ?al??mal?.
- `process.env` hatalar? (do?ru tip tan?mlar? veya Next.js standartlar? ile) giderilmeli.

