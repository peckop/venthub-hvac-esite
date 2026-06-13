---
domain: general
source_type: doc
namespace_type: module
source_path: C:\Users\alize\venthub-hvac\src\views\admin\AdminProductsPage.tsx
skeleton_hash: 831331e270b305dc
entity_hashes:
  func:AdminProductsPage: c722f6b673f81dbe
  overview: cbed9cc55e7501a7
  style_tokens: 5e9d7754f938f018
generated_at: 2026-06-13T21:06:16Z
---

## Genel Bakış
AdminProductsPage, yönetici panelinde ürün kataloğunun kapsamlı bir şekilde yönetildiği ana bileşendir. Tekil ve toplu ürün CRUD işlemlerinin yanı sıra sıralama, seçim ve satır içi düzenleme gibi interaktif özelliklerin merkezi yönetimini sağlar. Teknik özellik modalleri, durum göstergeleri ve fiyat ayarlama gibi işlevsel araçları bir arada sunar.

## Fonksiyon Grupları

### Sayfa Temeli ve Seçim Yönetimi
Ana bileşeni oluşturarak sayfa yaşam döngüsünü yönetir; ürün seçim durumlarını, sıralama tercihlerini ve satır genişleme/küçültme akışlarını kontrol eder.
- AdminProductsPage, toggleSelect, toggleSelectAll, toggleSort, toggleExpand, sortIndicator, statusBadge

### Tekil Ürün İşlemleri
Bireysel ürünler için oluşturma, düzenleme, satır içi kayıt ve silme işlemlerini başlatır; modal başarı回调'larını ve teknik özellik yükleme mantığını yönetir.
- handleCreate, handleEdit, handleModalSuccess, saveInlineEdit, remove, loadTechSpecs

### Toplu İşlemler
Birden fazla seçili ürün üzerinde eş zamanlı durum değiştirme, öne çıkarma, fiyat ayarlama ve silme gibi toplu veri operasyonlarını yürütür.
- bulkStatusChange, bulkFeatureToggle, bulkPriceAdjust, bulkDelete

---

## AXIOMS – Mimari Varsayımlar

Bu modül için verilen fonksiyon gövdesi ve detaylı implementasyon bilgisi mevcut olmadığından, mimari varsayımlar sınırlıdır. Sadece fonksiyon imzasından türetilen çıkarımlar yapılmıştır.

**[Aksiyom 1]**: Eğer `AdminProductsPage` bir React.FC olarak tanımlıysa, bu modülün bir React bileşeni olarak render edilmesi beklenir; React runtime ortamının mevcut olması zorunludur.

**[Aksiyom 2]**: Eğer `AdminProductsPage` parametresiz (`()`) tanımlıysa, bileşenin props almadığı ve kendi iç state'i ile veri yönettiği varsayılır.

**[Aksiyom 3]**: Eğer bileşen `React.FC` dönüş tipine sahipse, JSX döndürmesi veya null döndürmesi gerekir; geçersiz dönüş türü hata üretir.

---

> **Not**: Modül sabitleri, fonksiyon gövdeleri ve detaylı implementasyon bilgisi (örn: API çağrıları, state yönetimi, prop bağımlılıkları) paylaşılmadığı için kapsamlı aksiyon üretilememektedir. Daha detaylı mimari varsayımlar için fonksiyon gövdeleri ile birlikte yeniden analiz yapılması gerekmektedir.

---

## FONKSİYON DETAYLARI

### AdminProductsPage

**Ne yapar**: Ürünler yönetim sayfasını render eder. Bu bileşen, admin panelindeki en karmaşık veri tablosu olan ürün listesini sunar. Sayfa, DataTableKit yapısına göç edilmiş "thin-page" mimarisiyle yalnızca başlık ve Suspense sarıcısını barındırır; tüm karmaşık mantık alt bileşenlere devredilmiştir.

**Nasıl yapar**: Bileşen minimal bir "thin-page" (ince sayfa) yapısına sahiptir; sunum mantığını mümkün olduğunca alt bileşenlere aktarmıştır. Sayfa yapısı temel olarak iki bölümden oluşur: üst kısımda yer alan sayfa başlığı ve alt kısımda Suspense sarıcısı içinde sarılmış `ProductsTableBody` bileşeni. `ProductsTableBody`, `useAdminTable` hook'unu kullanarak sunucu tarafı (server-mode) çalışan bir tabloyu yönetir. Bu hook içinde veri çekme işlemleri, hibrit full-text search (FTS) ve query parametrelerini birleştiren arama mantığı, sıralama (sort), filtreleme (filter), satır içi düzenleme (inline-edit), genişletilebilir satırlar (expand) ve toplu işlemler (bulk) gibi tüm interaktif özellikler merkezileştirilmiştir. Ayrıca 6 farklı yazma kapısı (create, update, delete vb.) bu yapı üzerinden yönlendirilir. Sayfa, "Yeni Ürün" butonu ile ürün ekleme akışını başlatır ve `ProductFormModal` bileşeniyle modal tabanlı bir form sunar. Ek olarak CSV import (içe aktarma) işlevselliği de sayfa seviyesinde erişilebilir durumdadır.

**Parametreler**:

Bileşen props almaz (React.FC tanımı ile parametresiz bir functional component olarak tanımlanmıştır).

**Dönüş**: `React.FC` — İşlevsel React bileşeni. Ürünler yönetim sayfasının JSX yapısını döndürür; sayfa başlığı, Suspense ile sarılmış `ProductsTableBody`, "Yeni Ürün" tetikleyici butonu, `ProductFormModal` ve CSV import bileşenlerini içeren bir arayüz yapısı oluşturur.

---

## NODE ID STANDARD

  file: src\views\admin\AdminProductsPage.tsx
  function: src\views\admin\AdminProductsPage.tsx::AdminProductsPage

---

## DISA AKTARILANLAR (EXPORTS)
  export: AdminProductsPage

---

## STİL TOKENLERİ

### Arbitrary Değerler (token'a geçirilmemiş)
Yok — tüm stiller token'a geçirilmiş. ✅

### Kullanılan Token'lar (zaten token'a geçirilmiş)
- (yok)

### Tailwind Sınıf Özeti
- **Renkler:** (yok)
- **Layout:** (yok)
- **Varyant/Responsive:** (yok)
- **Yardımcı Sınıflar:** `pb-20`, `space-y-6`