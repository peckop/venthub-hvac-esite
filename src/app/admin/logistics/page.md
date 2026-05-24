---
domain: general
source_type: doc
namespace_type: module
source_path: C:\Users\alize\venthub-hvac\src\app\admin\logistics\page.tsx
skeleton_hash: 517c236f99fadd9e
generated_at: 2026-05-23T21:48:03Z
---

## Genel Bakış
Bu modül, yönetim panelindeki Lojistik sayfasının kök bileşenini tanımlar. Sayfanın temel düzenini oluşturur, gerekli veri akışını yönetir ve lojistik işlemlerine ait arayüzü alt bileşenler aracılığıyla sunar. Uygulamada lojistik yönetimi için tek bir giriş noktası görevi görür.

## Fonksiyon Grupları
### Sayfa Yapılandırma ve Sunum
Sayfanın iskeletini oluşturur, gerekli yapılandırmaları yapar ve içeriği ilgili alt görünüme yönlendirerek kullanıcı arayüzünü sağlar.
- LogisticsPage

---

## AXIOMS – Mimari Varsayımlar
Bu bileşenin hatasız çalışması, React tabanlı sunum ortamına ve dinamik yüklenen `AdminLogisticsPage` bileşeninin sorunsuz içe aktarılmasına bağlıdır.

[Aksiyom 1]: Eğer dinamik olarak yüklenmeye çalışılan AdminLogisticsPage bileşeni belirlenen yolda mevcut değilse, dinamik yükleme işlemi başarısız olur ve sayfa yükleme hatası alınır.
[Aksiyom 2]: Eğer istemci tarafında dynamic import'ları çözümleyecek bir Next.js çalışma zamanı ortamı yoksa, kod tarayıcıda çalışmaz.

---

## FONKSIYON DETAYLARI

### LogisticsPage
**Ne yapar**: Uygulamanın lojistik yönetim sayfasını oluşturan React bileşenidir. `AdminLogisticsPage` bileşenini döndürerek sayfanın görüntülenmesini sağlar.
**Nasıl yapar**: Herhangi bir prop veya state kullanmaz; doğrudan `AdminLogisticsPage` bileşenini render eder. Bu sayede lojistik modülü ile ilgili içerik ana uygulamaya eklenir.
**Parametreler**: Yok.
**Dönüş**: `AdminLogisticsPage` adlı React bileşeni (JSX öğesi).

---

## SABİTLER
- **AdminLogisticsPage** (call) — `dynamic(
  () => import('../../../views/admin/AdminLogisticsPage'),
  { ssr...`

---

## AST POINTERS

### [N1_NASIL] AST Pointer: src/app/admin/logistics/page.tsx::LogisticsPage
- **params**: (parametre yok)
- **ic_degiskenler**: (yok)
- **Dönüş**: yok

---

## NODE ID STANDARD

  file: src\app\admin\logistics\page.tsx
  function: src\app\admin\logistics\page.tsx::LogisticsPage

---

## DISA AKTARILANLAR (EXPORTS)
  export: LogisticsPage