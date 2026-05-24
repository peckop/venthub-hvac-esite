---
domain: general
source_type: doc
namespace_type: module
source_path: C:\Users\alize\venthub-hvac\src\app\admin\categories\[id]\builder\page.tsx
skeleton_hash: 6f66d930456963ac
generated_at: 2026-05-23T21:47:44Z
---

## Genel Bakış
`CategoryBuilderPage`, yönetim panelinde belirli bir kategori kimliğine göre sayfa düzenleyiciyi (page builder) görüntüleyen ana bileşendir. URL'den alınan `id` parametresini asenkron olarak çözümleyerek alt bileşenlere iletir ve kullanıcıya kategori bazında içerik oluşturma veya düzenleme arayüzü sunar.

## Fonksiyon Grupları
### Sayfa Render ve Veri Hazırlama
Bu grup, sayfanın render edilmesi ve gerekli verilerin işlenmesinden sorumludur. Tek fonksiyonu olan `CategoryBuilderPage`, gelen kategori kimliğini çözümleyip ilgili alt bileşenlere prop olarak aktararak sayfanın oluşturulmasını sağlar.
- CategoryBuilderPage

---

## AXIOMS – Mimari Varsayımlar
Bu modül için özel aksiyom tanımlanmamıştır.

[Aksiyom 1]: Eğer `params` bir `Promise` değilse, fonksiyon çalıştırılamaz ve hata oluşur.  
[Aksiyom 2]: Eğer `params` çözülürken bir hata fırlatılırsa, sayfa yüklenemez ve hata sayfası gösterilir.  
[Aksiyom 3]: Eğer `params` nesnesi `{ id: string }` şeklinde değilse (örneğin `id` alanı yoksa veya string değilse), fonksiyonun içindeki işlemler beklenmeyen sonuçlar doğurur.  
[Aksiyom 4]: Eğer `id` değeri boş string (`""`) ise, kategori oluşturma veya düzenleme işlemleri geçersiz kabul edilir.  
[Aksiyom 5]: Eğer `id` değeri geçerli bir UUID veya sayısal kimlik formatına uymuyorsa, veri tabanı sorguları başarısız olur.  

Bu aksiyomlar, `CategoryBuilderPage` fonksiyonunun doğru çalışması için gerekli temel koşulları tanımlar.

---

---

## FONKSIYON DETAYLARI

### CategoryBuilderPage
**Ne yapar**: Belirli bir kategori kimliği (`id`) için tam ekran bir Page Builder (Otorite Editörü) rotası sağlar. Kullanıcının bu sayfa üzerinden ilgili kategorinin yapısal düzenlemelerini gerçekleştirmesine olanak tanır.
**Nasıl yapar**: Next.js App Router'ın dinamik rota yapısını (`[id]`) kullanarak çalışır. Gelen `params` Promise'ini çözümler, `id` değerini alır ve bu değeri, asıl sayfa içeriğini ve düzenleme mantığını barındıran `CategoryBuilderView` alt bileşenine prop olarak iletir.
**Parametreler**:
- `params`: `Promise<{ id: string }>` — Next.js tarafından sağlanan, sayfanın dinamik rota parametrelerini içeren bir Promise. `id` alanı, düzenlenecek kategorinin benzersiz tanımlayıcısını belirtir.
**Dönüş**:
- `JSX.Element` — `categoryId` prop'u ile yapılandırılmış `CategoryBuilderView` bileşenini döndürür. Bu bileşen, tarayıcıda ilgili kategori için Page Builder arayüzünü oluşturur.

---

## AST POINTERS

### [N1_NASIL] AST Pointer: src/app/admin/categories/[id]/builder/page.tsx::CategoryBuilderPage
- **params**: `params` — React bileşenine geçirilen Promise tipinde parametre; `use()` ile çözümlenerek `id` alınır.
- **ic_degiskenler**:
  - `id` — `use(params)` çağrısıyla elde edilen kategori kimlik değeri; eğer `null` veya `undefined` ise geçersiz kimlik uyarısı gösterilir.
- **Dönüş**: JSX.Element — `id` geçersizse sabit bir hata div'i, geçerliyse `CategoryBuilderView` bileşeni döndürülür.

---

## NODE ID STANDARD

  file: src\app\admin\categories\[id]\builder\page.tsx
  function: src\app\admin\categories\[id]\builder\page.tsx::CategoryBuilderPage

---

## DISA AKTARILANLAR (EXPORTS)
  export: CategoryBuilderPage