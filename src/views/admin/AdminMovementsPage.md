---
domain: general
source_type: doc
namespace_type: module
source_path: C:\Users\alize\venthub-hvac\src\views\admin\AdminMovementsPage.tsx
skeleton_hash: 6c2543ff27d35a7f
entity_hashes:
  func:AdminMovementsPage: 1f83a4be333ac82c
  overview: 19839cf14aa3d647
  style_tokens: 5e9d7754f938f018
generated_at: 2026-06-19T20:48:51Z
---

## Genel Bakış
Bu modül, VentHub HVAC yönetim platformunun yönetici panelindeki "Hareketler" sayfasını oluşturan React bileşenidir. Tüm hareket kayıtlarını bir tabloda listeleyerek sıralama, filtreleme ve verileri dışa aktarma (CSV/Excel) gibi temel yönetim işlevlerini sunar. Modül, yerelleştirme (çok dillilik) ve dinamik veri yükleme mantığını da içerir.

## Fonksiyon Grupları
### Ana Sayfa Bileşeni (Koordinasyon)
Sayfa düzeyindeki tüm düzeni, durum yönetimini (state) ve alt bileşenlerin yaşam döngüsünü koordine eder. Veri çekme, filtreleme ve sıralama gibi üst düzey iş akışlarını yönetir.
- AdminMovementsPage

### Veri Görüntüleme ve Yerelleştirme
Ham veri değerlerini (hareket nedeni gibi) kullanıcıya gösterilebilir ve okunabilir yerelleştirilmiş etiketlere dönüştürür. API'den gelen anahtarları本地化 bir metne eşler.
- reasonLabel

### Tablo Etkileşim ve Sıralama
Tabloda sıralama yapıldığında ilgili durumu (artan/azalan) günceller ve sıralama durumunu gösterge olarak gösterir. Kullanıcı etkileşimiyle sıralama kriterini değiştirir.
- toggleSort, sortIndicator

### Veri Dışa Aktarma
Tablodaki güncel veri setini alır ve belirli bir dosya formatına (CSV veya Excel) dönüştürerek kullanıcıya sunar. Bu işlem genellikle istemci tarafında dosya oluşturmayı tetikler.
- exportCsv, exportXls

---

## AXIOMS – Mimari Varsayımlar

Bu modül, AdminMovementsPage React bileşeninin doğru çalışması için aşağıdaki mimari varsayımları içerir.

[Aksiyom 1]: Eğer hareket kayıtları (movements) verisi yüklenemez veya boş gelirse, tablo içeriği gösterilemez ve kullanıcıya boş bir tablo sunulur.

[Aksiyom 2]: Eğer `toggleSort` fonksiyonu sıralama durumunu (sort state) doğru güncelleyemezse, `sortIndicator` geçerli sıralama yönünü gösteremez ve tablo varsayılan sıralama ile kalır.

[Aksiyom 3]: Eğer `reasonLabel` fonksiyonu için geçerli bir hareket nedeni (reason) değeri yoksa veya tanımsız bir reason gönderilirse, etiket olarak "bilinmiyor" veya varsayılan bir gösterim döner.

[Aksiyom 4]: Eğer `exportCsv` veya `exportXls` fonksiyonları çağrıldığında tablodaki veri boşsa, oluşturulan dosya içeriği boş olur veya dışa aktarma işlemi anlamsız sonuç verir.

[Aksiyom 5]: Eğer sıralama sütunu (`sortBy`) ve sıralama yönü (`sortDirection`) eşleşmeyen veya tabloda olmayan bir alan olarak ayarlanırsa, veri doğru sıralanamaz.

[Aksiyom 6]: Eğer bileşen props almıyorsa (fonksiyon imzası parametresiz), veri akışı tamamen bileşen içi state yönetimi (useEffect, useState vb.) ile sağlanmalıdır; dış kaynaklı prop verisi beklenmez.

---

## FONKSİYON DETAYLARI

### AdminMovementsPage
**Ne yapar**: Admin panelinde envanter hareketlerini (inventory_movements) görüntülemek için kullanılan salt okunur (READ-ONLY) bir sayfa bileşenidir. Bu bileşen, DataTableKit mimarisine göç edilmiş ve server-mode'da çalışan bir veri tablosu sayfası oluşturarak envanter hareketlerinin listelenmesini sağlar.

**Nasıl yapar**: Sayfa, başlık bölümü ve Suspense ile sarılmış bir ana içerik alanından oluşur. Veri çekme, URL senkronizasyonu ve filtre state yönetimi gibi tüm durum işlemleri `MovementsTableBody` bileşeni tarafından `useAdminTable` hook'u aracılığıyla yürütülür. Arama, sıralama ve kategori filtresi gibi işlemler embedded inner-join sorguları ile sunucu tarafında (server-side) çözülerek performanslı bir veri getirme mekanizması sunar. Bileşen üzerinde herhangi bir mutasyon, seçim veya bulk işlem yetkisi bulunmamaktadır.

**Parametreler**:
Bu bileşen `React.FC` tipi ile tanımlanmış olup herhangi bir props parametresi almamaktadır. Boş bir props nesnesi (`{}`) ile çağrılır.

**Dönüş**: `React.FC` tipinde bir React functional component'i olup, JSX elementi (React.ReactNode) döndürür. Sayfa yapısını oluşturan başlık ve Suspense içindeki tablo bileşenlerini içeren bir React bileşen ağacı 반환ır.

---

## İTHALATLAR (IMPORTS)
- import: ../../components/admin/AdminSkeleton::AdminSkeleton
- import: ../../i18n/I18nProvider::useI18n
- import: ../../utils/adminUi::adminSectionTitleClass
- import: ../../utils/adminUi::adminSubtitleClass
- import: ./MovementsTableBody::MovementsTableBody
- import: react::React
- import: react::Suspense

---

## AST POINTERS

### [N1_NASIL] AST Pointer: src/views/admin/AdminMovementsPage.tsx::AdminMovementsPage
- **params**: () — parametre almaz
- **ic_degiskenler**:
  - `t` — `useI18n()` hook'undan dönen çeviri fonksiyonu; `t('admin.titles.movements')` ve `t('admin.movements.subtitle')` çağrılarıyla sayfa başlık ve alt başlık metinleri lokalize edilir
- **Dönüş**: `JSX.Element` — Admin hareketleri sayfasını render eden React bileşeni; `<div>` sarmalayıcısı içinde `<header>` (h1 başlık + p alt başlık) ve `<Suspense>` sarmalayıcısında `<MovementsTableBody />` bileşeni bulunur; Suspense yüklenme durumunda fallback olarak `<AdminSkeleton variant="table" count={5} rows={8} />` gösterilir

---

## NODE ID STANDARD

  file: src\views\admin\AdminMovementsPage.tsx
  function: src\views\admin\AdminMovementsPage.tsx::AdminMovementsPage

---

## DISA AKTARILANLAR (EXPORTS)
  export: AdminMovementsPage

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