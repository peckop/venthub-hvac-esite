---
domain: general
source_type: doc
namespace_type: module
source_path: C:\Users\alize\venthub-hvac\src\utils\3dModelOffsets.ts
skeleton_hash: daea88c8e1af2853
generated_at: 2026-05-23T22:33:15Z
---

## Genel Bakış
VentHub HVAC platformunda kullanılan 3B cihaz modellerinin sanal ortamdaki doğru şekilde konumlandırılmasını sağlamak amacıyla geliştirilmiş bir yardımcı modüldür. Tüm 3B model konum kaydırma ve yerleştirme işlemlerini merkezi olarak yönetir, farklı model türleri ve kullanım senaryolarına uyum sağlayacak şekilde esnek yapılandırılmıştır.

## Fonksiyon Grupları
### 3B Model Yerleştirme Verisi Üretimi
Modülün tek ana işlevini barındıran bu grup, alınan model tanımlayıcıları ve kullanım bağlamı bilgilerini işleyerek, ilgili modelin 3B ortamdaki doğru konumunu ve ayarlarını içeren yerleştirme verisini üretir. Tüm konumlandırma mantığını tek noktadan çalıştırarak tutarlı yerleştirme sonuçları sunar.
- getModelPlacement

---

## AXIOMS – Mimari Varsayımlar
Bu modül, 3D modellerin sahneye doğru yerleştirilmesi için tanımlı konfigürasyon nesnelerinin ve giriş parametrelerinin geçerli yapıda olmasını zorunlu kılar.

[Aksiyom 1]: Eğer MODEL_CONFIGS sabiti içinde çağrı sırasında gönderilen modelType ve slug değerleriyle eşleşen geçerli konfigürasyon kaydı yoksa, modül yalnızca varsayılan konfigürasyonu kullanır veya geçersiz yerleştirme verisi döndürür.
[Aksiyom 2]: Eğer giriş parametresi olarak gönderilen context nesnesi ModelContext tipinin zorunlu alanlarını içermiyorsa, modelin yerleştirme hesaplaması yapılamaz veya yanlış konumda model oluşturulur.
[Aksiyom 3]: Eğer DEFAULT_CONFIG sabiti geçerli temel offset, ölçek veya konumlandırma değerleri içermiyorsa, özel konfigürasyonu bulunmayan tüm modeller için sistematik olarak yanlış yerleştirme işlemi gerçekleşir.
[Aksiyom 4]: Eğer modelType veya slug parametreleri undefined dışında sistemde tanımlı olmayan geçersiz string değerleri olarak gönderilirse, MODEL_CONFIGS üzerinden konfigürasyon eşleşmesi sağlanamaz ve yerleştirme işlemi beklenmedik şekilde çalışır.

---

## FONKSIYON DETAYLARI

### getModelPlacement
**Ne yapar**: Bir 3D modelin hassas 3D yerleştirme yapılandırmasını (konum, dönüş, ölçek) modelin türü veya ürün slug'ı temelinde belirler. Modelin sahne üzerinde doğru şekilde konumlandırılmasını sağlayacak tüm yerleştirme parametrelerini tek bir yapı altında toplar, farklı model tipleri ve ürün varyantları için tutarlı yerleştirme standartları uygular.
**Nasıl yapar**: İlk olarak kesin eşleşme sağlamak amacıyla açıkça iletilen `modelType` parametresini kullanarak yerleştirme yapılandırmasını arar. Bu ilk eşleşme başarısız olursa, yedekleme mekanizması olarak `slug` üzerinde sıralı, karmaşık bir alt dize eşleşmesi stratejisi uygulayarak doğru yerleştirme yapılandırmasını tahmin eder. Ek olarak `context` parametresindeki renderlama bağlamını kullanarak yerleştirme varyantını sahne koşullarına göre uyumlu hale getirir.
**Parametreler**:
- name: modelType, type: string | undefined — 3D model bileşeninin açık kimliğidir, kesin eşleşme aramada ilk öncelikli olarak kullanılır, örneğin 'AirCurtain' gibi model spesifikleştiriciler içerir, tanımlanmamışsa yedekleme stratejisi devreye girer
- name: slug, type: string | undefined — modelType ile kesin eşleşme sağlanamadığında devreye giren yedekleme çıkarım sürecinde kullanılan ürün slug'ıdır, ürünle ilişkili metinsel tanımlayıcı olarak alt dize eşleştirmeleri için temel oluşturur
- name: context, type: ModelContext — yerleştirme varyantını dikte eden renderlama bağlamıdır, varsayılan olarak standart zemin yerleştirme ('ground') bağlamında çalışacak şekilde yapılandırılmıştır, sahnenin konumsal özelliklerine göre yerleştirmeyi uyarlamak için kullanılır
**Dönüş**: ModelPlacement tipinde, çözümlenmiş model yerleştirme verilerini içeren bir nesne döndürür. Bu nesne içinde konum ve dönüş değerleri zorunlu olarak bulunur, ölçek faktörü ise isteğe bağlı olarak yer alır ve tüm değerler modelin doğru şekilde sahneye yerleştirilmesini sağlar.

---

## INTERFACES

### ModelConfig
- `grounded: { position: ModelOffset; rotation?: ModelOffset; scale?: number }`
- `centered: { position: ModelOffset; rotation?: ModelOffset; scale?: number }`
- `orbital: { position: ModelOffset; rotation?: ModelOffset; scale?: number }`

### ModelPlacement
- `position: ModelOffset`
- `rotation: ModelOffset`
- `scale?: number`

---

## TYPE ALIASES

### ModelOffset
3D Model Offsets Utility Centralizes positioning logic for models in different contexts. Contexts: - 'grounded': Ürün Detay Sayfası (Model tabanı zemine oturur) - 'centered': Kategori Kartları / Overlay (Geometrik merkez y=0) - 'orbital':  Anasayfa Orbital Vitrin (Bağımsız ayarlanabilir)
```typescript
type ModelOffset = [number, number, number]
```

### ModelContext
```typescript
type ModelContext = 'grounded' | 'centered' | 'orbital'
```

---

## SABİTLER
- **DEFAULT_CONFIG** (object) — `{
    grounded: { position: [0, -0.55, 0], scale: 1 },
    centered: { posi...`
- **MODEL_CONFIGS** (object) — `{
    // ---------------------------------------------------------
    // 1...`

---

## AST POINTERS

### [N1_NASIL] AST Pointer: C:\Users\alize\venthub-hvac\src\utils\3dModelOffsets.ts::getModelPlacement
- **params**: modelType (string | undefined), slug (string | undefined), context (ModelContext, varsayılan değeri 'grounded')
- **ic_degiskenler**: 
  - `MODEL_CONFIGS` — Tüm 3D model tipleri için yerleşim ayarlarını barındıran proje sabiti nesnesi
  - `DEFAULT_CONFIG` — Hiçbir model eşleşmesi sağlanamadığında kullanılacak varsayılan yerleşim konfigürasyonu sabiti
  - `p` — Doğrudan modelType ile eşleşen modelin context'e ait yerleşim verilerini tutan, ilk koşul bloğunda tanımlanan geçici değişken
  - `s` — Gelen slug değerini küçük harfe çevirerek normalize eden, tüm string eşleşme kontrollerinde kullanılan string değişken
  - `config` — Slug bazlı eşleşmeler sonucu seçilen modelin yerleşim konfigürasyonunu tutan, varsayılan olarak DEFAULT_CONFIG ile başlatılan değişken
  - `placement` - Nihai olarak seçilen konfigürasyondan mevcut context'e ait yerleşim verilerini çıkaran, dönüş nesnesini oluşturmak için kullanılan son geçici değişken
- **Dönüş**: ModelPlacement tipinde, 3D modelin sahne üzerindeki konumunu, dönüşünü ve ölçeğini içeren {position, rotation, scale} yapısına sahip nesne

---

## NODE ID STANDARD

  file: src\utils\3dModelOffsets.ts
  function: src\utils\3dModelOffsets.ts::getModelPlacement

---

## DISA AKTARILANLAR (EXPORTS)
  export: ModelContext
  export: ModelPlacement
  export: getModelPlacement