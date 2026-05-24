---
domain: general
source_type: doc
namespace_type: module
source_path: C:\Users\alize\venthub-hvac\src\app\robots.ts
skeleton_hash: d7f5ac351db900a3
generated_at: 2026-05-23T21:50:07Z
---

## Genel Bakış
`robots.ts` modülü, Next.js uygulamasının `robots.txt` dosyasını dinamik olarak oluşturan tek bir rota işleyicisi sunar. Bu modül sayesinde arama motoru botlarının siteyi nasıl tarayacağı (izin verilen ve engellenen yollar) ve site haritasının yeri belirlenir.

## Fonksiyon Grupları
### Robots Metadata Üretimi
Bu grup, `robots.txt` dosyasının yapılandırmasını oluşturup döndürmekle sorumludur.  
- robots

---

## AXIOMS – Mimari Varsayımlar
Bu modül için özel aksiyom tanımlanmamıştır.

---

---

## FONKSIYON DETAYLARI

### robots
**Ne yapar**: Bu fonksiyon, Venthub HVAC uygulamasının arama motoru optimizasyonu (SEO) için kritik olan `robots.txt` dosyasının içeriğini programatik olarak tanımlar. Web tarayıcılarının sitenin hangi alanlarına erişebileceğini ve hangi sayfaları indeksleyebileceğini belirleyerek tarama trafiğini yönetir.

**Nasıl yapar**: Next.js 13+ App Router mimarisinde yerleşik bir convention olarak çalışır. Uygulama derlendiğinde veya sunucu tarafında çalıştırıldığında, Next.js bu fonksiyonun döndürdüğü `MetadataRoute.Robots` nesnesini otomatik olarak `/robots.txt` rotasına yönlendirir. Herhangi bir ek route tanımı veya özel sunucu mantığı gerektirmez.

**Parametreler**: Bu fonksiyon herhangi bir parametre almaz.

**Dönüş**: `MetadataRoute.Robots`
- Geriye, arama motoru botlarına yönelik tarama politikalarını içeren bir `MetadataRoute.Robots` nesnesi döndürür. Bu nesne, hangi user-agent'ların hangi dizinlere erişebileceğini tanımlayan `rules` dizisini ve isteğe bağlı olarak site haritası URL'lerini listeleyen `sitemap` alanını barındırır.

---

## AST POINTERS

### [N1_NASIL] AST Pointer: src/app/robots.ts::robots
- **params**: (parametre yok)
- **ic_degiskenler**: 
  - `SITE_URL` — import edilen sabit değişken, sitemap URL'sini oluşturmak için kullanılır (`${SITE_URL}/sitemap.xml`)
- **Dönüş**: MetadataRoute.Robots

---

## NODE ID STANDARD

  file: src\app\robots.ts
  function: src\app\robots.ts::robots

---

## DISA AKTARILANLAR (EXPORTS)
  export: robots