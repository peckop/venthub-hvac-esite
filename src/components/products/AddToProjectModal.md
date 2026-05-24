---
domain: general
source_type: doc
namespace_type: module
source_path: C:\Users\alize\venthub-hvac\src\components\products\AddToProjectModal.tsx
skeleton_hash: 587dc4c4140069f6
generated_at: 2026-05-23T22:25:42Z
---

## Genel Bakış
Venthub HVAC platformunda kullanılan bu React modülü, ürünleri kullanıcının mevcut projelerine ekleme işlemini yöneten bir modal kullanıcı arayüzü bileşeni barındırır. Dışarıdan gelen tetikleyicilerle açılıp kapanabilen modal, seçilen ürün bilgilerini alarak projeye ekleme iş akışını kullanıcıya sunar.

## Fonksiyon Grupları
### Ana Modal Bileşeni
Modülün tüm temel sorumluluklarını üstlenen ana React bileşenidir, modalın açılıp kapanma durumunu, seçilen ürün verisini ve kapanma tetikleyicisini yönetmek için dışarıdan iletilen prop'ları kullanır.
- AddToProjectModal

---

## AXIOMS – Mimari Varsayımlar
Bu React tabanlı modal bileşeni, ürünleri mevcut projelere ekleme işlemini yönetmek için üst bileşenlerden iletilen zorunlu tüm prop'ların geçerli, doğru formatta ve işlevsel olmasına bağlıdır, tüm çalışma akışı bu prop'ların üst bileşenler tarafından düzgün yönetilmesi üzerine kuruludur.

[Aksiyom 1]: Eğer product prop'u geçerli bir ürün nesnesi olarak üst bileşen tarafından iletilmezse, modalda ürün bilgileri görüntülenemez ve projeye ekleme işlemi hiçbir şekilde gerçekleştirilemez.
[Aksiyom 2]: Eğer isOpen boolean değeri üst bileşenin state yönetimi ile doğru şekilde senkronize edilip iletilmezse, modalın görünürlüğü kontrol edilemez, ya sürekli açık kalır ya hiçbir zaman açılamaz.
[Aksiyom 3]: Eğer onClose tıklama işlevi üst bileşen tarafından tanımlanıp iletilmezse, modal kullanıcı tarafından tetiklenen kapatma işlemleriyle kapatılamaz, uygulama kullanıcı akışı bu noktada tıkanır.

---

## FONKSIYON DETAYLARI

### AddToProjectModal
**Ne yapar**: VentHub HVAC platformunun ürün kataloğunda yer alan ürünleri kullanıcının mevcut projelerine eklemesi için kullanılan modal penceresini oluşturan React fonksiyonel bileşenidir. Ürün bilgilerini modal içinde güvenli şekilde gösterir, kullanıcının proje seçimi ve ekleme işlemlerini sorunsuz gerçekleştirebileceği bir arayüz sunar.
**Nasıl yapar**: Üst bileşenden aldığı prop'lar aracılığıyla modalın görünürlük durumunu tam olarak kontrol eder, sadece isOpen prop'u true olduğunda ekranda görünür hale gelir. Modal açıldığında ilişkili ürünün tüm detaylarını içeriğine aktarır, kullanıcının modalı kapatma veya işlemini tamamlama eylemlerinde üst bileşene bildirim göndererek uygulama state'inin senkron kalmasını sağlar.
**Parametreler**:
- product: AddToProjectModalProps ile tanımlı nesne tipi — Projeye eklenecek olan HVAC ürününün kimlik, isim, teknik özellikler gibi tüm bilgilerini içeren veri nesnesidir
- isOpen: boolean — Modal penceresinin ekranda görünür olup olmadığını belirten ikili durum flag'idir, tüm yönetimi üst bileşen tarafından gerçekleştirilir
- onClose: () => void — Kullanıcı modalı kapattığında tetiklenen geri çağırma fonksiyonudur, üst bileşende isOpen state'ini false'a çekerek modalın kapanma sürecini başlatır
**Dönüş**: React.FC<AddToProjectModalProps> tipiinde, yani projeye ürün ekleme işlemleri için özel olarak tasarlanmış, içeriğinde ürün detayları, proje seçim listesi, ekleme ve iptal kontrollerini barındıran bir React fonksiyonel bileşeni döndürür.

---

## INTERFACES

### AddToProjectModalProps
- `product: Product`
- `isOpen: boolean`
- `onClose: () => void`

---

## AST POINTERS

### [N1_NASIL] AST Pointer: C:\Users\alize\venthub-hvac\src\components\products\AddToProjectModal.tsx::AddToProjectModal
- **params**: product, isOpen, onClose
- **ic_degiskenler**:
  - `t` — useI18n hook'undan alınan çeviri fonksiyonu, arayüz metinlerini yerelleştirmek için kullanılır
  - `projects` — useProjectLists hook'undan alınan kullanıcının mevcut projelerini içeren liste
  - `addProject` — useProjectLists'ten gelen yeni proje oluşturma API çağrısı fonksiyonu
  - `addItemToProject` — useProjectLists'ten gelen ürünü seçili projeye ekleme API çağrısı fonksiyonu
  - `newProjectName` — useState ile yönetilen, oluşturulacak yeni projenin adını tutan state değişkeni
  - `setNewProjectName` — newProjectName state'ini güncellemek için kullanılan setter fonksiyonu
  - `isCreating` — Yeni proje oluşturma formunun görünürlük durumunu takip eden state değişkeni
  - `setIsCreating` — isCreating state'ini güncelleyen setter fonksiyonu
  - `selectedProjectId` - Ürün eklenirken seçilen mevcut projenin ID'sini tutan state değişkeni
  - `setSelectedProjectId` — selectedProjectId state'ini güncelleyen setter fonksiyonu
  - `isAdding` — Ürün projeye eklenirken yüklenme durumunu takip eden state değişkeni
  - `setIsAdding` — isAdding state'ini güncelleyen setter fonksiyonu
  - `handleCreateAndAdd` — Yeni proje oluşturup ürünü o projeye ekleyen async iç fonksiyon
  - `handleAddToExisting` — Ürünü mevcut seçilen projeye ekleyen async iç fonksiyon
- **Dönüş**: Modal kapalıysa `null`, açıkysa React JSX modal arayüzü elementi

---

### [N2_NASIL] AST Pointer: C:\Users\alize\venthub-hvac\src\components\products\AddToProjectModal.tsx::handleCreateAndAdd
- **params**: (parametre yok)
- **ic_degiskenler**:
  - `newProjectName.trim()` — Girilen yeni proje adının boşluklardan arındırılmış hali, boş olup olmadığını kontrol etmek için kullanılır
  - `setIsAdding` — Yükleme durumunu aktifleştirmek için kullanılan state setter'ı
  - `addProject` — Yeni proje oluşturmak için çağrılan API fonksiyonu
  - `project` — addProject çağrısından dönen oluşturulan yeni proje nesnesi
  - `addItemToProject` — Ürünü yeni oluşturulan projeye eklemek için çağrılan API fonksiyonu
  - `project.id` — Oluşturulan yeni projenin benzersiz kimliği
  - `product.id` - Eklenecek ürünün benzersiz kimliği
  - `onClose` — İşlem başarılı olduktan sonra modalı kapatmak için ana bileşenden gelen callback
  - `error` — API çağrıları sırasında oluşan hatayı tutan değişken
  - `setIsAdding(false)` — İşlem sonunda (başarılı/başarısız) yükleme durumunu kapatmak için kullanılan setter
- **Dönüş**: void

---

### [N3_NASIL] AST Pointer: C:\Users\alize\venthub-hvac\src\components\products\AddToProjectModal.tsx::handleAddToExisting
- **params**: projectId: string
- **ic_degiskenler**:
  - `projectId` — Ürünün ekleneceği mevcut projenin benzersiz kimliği, parametre olarak alınır
  - `setSelectedProjectId` — Seçilen proje ID'sini state'e kaydetmek için kullanılan setter
  - `setIsAdding` — Yükleme durumunu aktifleştirmek için kullanılan state setter'ı
  - `addItemToProject` — Ürünü seçili projeye eklemek için çağrılan API fonksiyonu
  - `product.id` — Eklenecek ürünün benzersiz kimliği
  - `onClose` — İşlem başarılı olduktan sonra modalı kapatmak için ana bileşenden gelen callback
  - `error` — API çağrısı sırasında oluşan hatayı tutan değişken
  - `setIsAdding(false)` — İşlem sonunda yükleme durumunu kapatmak için kullanılan setter
- **Dönüş**: void

---

### [N4_NASIL] AST Pointer: C:\Users\alize\venthub-hvac\src\components\products\AddToProjectModal.tsx::projects.map callback
- **params**: project
- **ic_degiskenler**:
  - `project` — Listelenen her bir proje nesnesi, map fonksiyonuna parametre olarak gelir
  - `project.id` — Projenin benzersiz kimliği, buton key'i ve tıklama olayında kullanılır
  - `isAdding` — Ürün ekleme işleminin yüklenme durumunu, buton disabled durumu için kullanılır
  - `handleAddToExisting` — Projeye tıklandığında ürünü o projeye eklemek için çağrılan iç fonksiyon
  - `project.name` — Projenin görünen adı, arayüzde listelemek için kullanılır
  - `selectedProjectId` — Şu anda işlem yapılan projenin ID'si, yükleme göstergesini sadece ilgili proje için göstermek için kullanılır
- **Dönüş**: Mevcut projeleri listeleyen React JSX buton elementi

---

## NODE ID STANDARD

  file: src\components\products\AddToProjectModal.tsx
  function: src\components\products\AddToProjectModal.tsx::AddToProjectModal

---

## DISA AKTARILANLAR (EXPORTS)
  export: AddToProjectModal