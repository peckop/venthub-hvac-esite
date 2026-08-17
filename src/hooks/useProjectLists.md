---
domain: general
source_type: doc
namespace_type: module
source_path: C:\Users\alize\venthub-hvac\src\hooks\useProjectLists.ts
skeleton_hash: ec9603d0175eb421
entity_hashes:
  func:useProjectLists: e1f5d498634d6db5
  overview: b42bbc25ae784887
generated_at: 2026-06-19T20:47:53Z
---

## Genel Bakış
VentHub HVAC projesinin React tabanlı kullanıcı arayüzü için geliştirilen bu modül, proje listeleri yönetimini kolaylaştıran özel React hook'u barındırır. Uygulama içindeki tüm tüketen bileşenlerin proje listesi verilerine tutarlı bir şekilde erişmesini sağlayacak state ve iş mantığını merkezi hale getirir.

## Fonksiyon Grupları
### Proje Listesi Yönetim Hook'u
Tüm proje listesiyle ilgili veri erişimi, state yönetimi ve temel iş mantığını tek bir yapı altında toplayarak, kullanıcı arayüzü bileşenlerinin hazır olarak kullanabileceği bir arayüz sunar.
- useProjectLists

---

## AXIOMS – Mimari Varsayımlar
Bu custom React hook olan useProjectLists, proje listelerinin uygulamada sorunsuz bir şekilde listelenmesi, yönetilmesi ve güncellenmesi için React çalışma zamanı, proje verilerini sağlayan veri kaynağı ve tüm dahili bağımlılıkların erişilebilir ve çalışır durumda olmasına bağlıdır.

[Aksiyom 1]: Eğer en az React 16.8 sürümünü destekleyen React çalışma zamanı ortamı yoksa, custom hook yapısı gereği useProjectLists hiç çalışmaz, proje listeleri hiçbir şekilde kullanıcıya sunulamaz.
[Aksiyom 2]: Eğer hook'un proje verilerini çektiği merkezi state yönetim sistemi veya harici proje API servisi erişilebilir değilse, güncel proje listeleri yüklenemez, kullanıcıya boş veya eski verili bir arayüz sunulur.
[Aksiyom 3]: Eğer hook'un çalışması için gereken kimlik doğrulama servisi, veri önbellekleme veya hata yönetimi gibi dahili bağımlılıkları kurulu veya çalışır durumda değilse, hook beklendiği gibi çalışmaz, uygulama kararsız hale gelir.

---

## FONKSİYON DETAYLARI

### useProjectLists

**Ne yapar**: React uygulaması içinde proje listesi verisini ve proje yönetim fonksiyonlarını tüketmek için kullanılan özel bir React hook'udur. ProjectProvider kapsamında olmadığında bile uygulamanın çökmesini engelleyen güvenli bir fallback (yedek) mekanizması sunar. Bu sayede statik build'lerde veya izole test ortamlarında bile hatasız çalışabilir.

**Nasıl yapar**: React'ın `useContext` hook'unu kullanarak `ProjectContext` değerini okur. Eğer okunan bağlam değeri (`context`) `null` veya `undefined` ise — yani hook bir `ProjectProvider` kapsamında çağrılmamışsa — önceden tanımlanmış sabit bir `PROJECT_FALLBACK` nesnesini döndürür. Bu fallback nesnesi, tüm proje listesi özelliklerini ve yönetim fonksiyonlarını güvenli, işlem yapmayan (no-op) karşılıklarla (boş arrays, noop fonksiyonlar vb.) içerir. Bağlam mevcutsa doğrudan orijinal context nesnesini döndürerek proje verilerine, yükleme durumuna ve yönetim fonksiyonlarına erişim sağlar.

**Parametreler**:

Bu fonksiyon herhangi bir parametre almamaktadır.

**Dönüş**: `ProjectContext` tipinde bir nesne döndürür. Bu nesne şu bileşenleri içerir:
- Proje listesi verisi (kullanıcının projeleri)
- Yükleme durumu (`loading state`)
- Proje yönetim fonksiyonları (oluştur, düzenle, sil vb.)

Bağlam bulunamadığında ise `PROJECT_FALLBACK` sabiti döndürülür; bu değer aynı tipte ancak tüm fonksiyonları no-op (işlem yapmayan) karşılıklarla dolu güvenli bir nesnedir.

---

## İTHALATLAR (IMPORTS)
- import: ../contexts/ProjectContext::ProjectContext
- import: react::useContext

---

## SABİTLER
- **PROJECT_FALLBACK** (object) — `{
  projects: [],
  loading: false,
  refreshProjects: async () => {},
  ...`

---

## AST POINTERS

### [N1_NASIL] AST Pointer: src/hooks/useProjectLists.ts::useProjectLists
- **params**: ()
- **ic_degiskenler**:
  - `context` — `useContext(ProjectContext)` hook çağrısıyla ProjectContext'ten alınan değer; Proje verisini veya bağlam nesnesini tutar, eğer bağlam tanımsızsa `null`/`undefined` olabilir
- **Dönüş**: `context` (ProjectContext değeri) veya `PROJECT_FALLBACK` sabiti; bağlam mevcutsa bağlam nesnesi, aksi halde fallback nesne döner

---

## NODE ID STANDARD

  file: src\hooks\useProjectLists.ts
  function: src\hooks\useProjectLists.ts::useProjectLists

---

## DISA AKTARILANLAR (EXPORTS)
  export: useProjectLists