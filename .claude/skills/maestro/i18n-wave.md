---
domain: general
source_type: doc
namespace_type: module
source_path: C:\tmp\vh-t088\.claude\skills\maestro\i18n-wave.mjs
skeleton_hash: 7746991230810ac9
entity_hashes:
  func:judgePrompt: d9821cd7b2e3ef9e
  func:migratePrompt: ba7f6b3be2f6201d
  overview: 0642545b0620105b
generated_at: 2026-08-27T12:16:43Z
---

## Genel Bakış
Bu modül, uluslararasılaştırma (i18n) süreçlerinde kullanılan dalgalar (wave) için yapay zeka promptları oluşturmaya odaklanır. Modül, göç ve değerlendirme gibi i18n operasyonları için gerekli prompt metinlerini üretir.

## Fonksiyon Grupları
### Göç (Migration) Prompt Oluşturma
Bu grup, uluslararasılaştırma verilerinin göçü (migration) işlemi için gerekli prompt metnini oluşturur.
- `migratePrompt`

### Değerlendirme (Judgment) Prompt Oluşturma
Bu grup, uluslararasılaştırma ile ilgili bir birleştirme isteğinin (merge request) değerlendirilmesi için gerekli prompt metnini oluşturur.
- `judgePrompt`

---

## AXIOMS – Mimari Varsayımlar

Bu modül için özel aksiyom tanımlanmamıştır.

**Gerekçe:** Fonksiyon gövdeleri verilmediğinden, sadece imzalardan (`migratePrompt(t)`, `judgePrompt(t, mr)`) ve sabit adlarından (`meta`, `PATTERN`, `TARGETS`, `MIGRATE_SCHEMA`, `JUDGE_SCHEMA`, `results`) davranışsal çıkarım yapılamaz. Aksiyom üretimi yalnızca fonksiyon gövdelerinden yapılır; imza ve sabit adları bilgi kaynağı olarak kullanılmaz.

---

## FONKSİYON DETAYLARI

### migratePrompt

**Ne yapar**: Verilen görev tanımı (`t`) nesnesinden yola çıkarak, bir dosyanın uluslararasılaştırılması (i18n) işlemi için bir LLM prompt metni oluşturur ve döndürür. Oluşturulan prompt, bir "göç ajanına" (migration agent) dosyadaki kullanıcıya görünen metinleri `t()` fonksiyonu ile değiştirmesi ve yeni i18n anahtarları üretmesi talimatını verir.

**Nasıl yapar**: Parametre olarak gelen `t` nesnesinin `ns` (namespace) özelliğini nokta (`.`) karakterinden bölerek ilk parçasını `surface` (üst-yüzey) değişkenine atar. Ardından bir template literal kullanarak yapılandırılmış bir prompt metni üretir. Bu prompt; hedef dosya yolunu (`t.file`), namespace bilgisini (`t.ns`), üst-yüzey adını ve sabit bir `PATTERN` değişkenini içerir. Prompt içinde dört adımlık bir talimat sırası tanımlıdır: (1) hedef dosyayı oku, (2) `src/i18n/dictionaries/tr.ts` dosyasındaki mevcut üst-yüzey anahtarlarını okuyarak birebir eşleşenleri yeniden kullan ve `reusedKeys` listesine yaz, (3) `react/jsx-no-literals` kuralını tetikleyen her kullanıcı metnini `t()` çağrısıyla değiştir ve yeni anahtarları belirtilen namespace altında düz (flat) olarak topla, (4) bulunan anahtarları döndür.

**Parametreler**:
- `t`: object — Görev tanımı nesnesi. Aşağıdaki özellikleri içerir:
  - `t.file`: string — Uluslararasılaştırılacak hedef dosyanın yolu.
  - `t.ns`: string — Yeni oluşturulacak i18n anahtarlarının namespace'i (örneğin `"pages.home.title"`). Nokta ile ayrılmış hiyerarşik yapıdadır.

**Dönüş**: string — LLM'e verilecek talimat metni. Template literal ile üretilen, çok satırlı bir prompt string'idir.

### judgePrompt
**Ne yapar**: Geliştirildi ancak detay üretilemedi.

---

## SABİTLER
- **meta** (object) — `{
  name: 'i18n-wave',
  description: 'Generic i18n extraction wave. args =...`
- **PATTERN** (template) — ``
KURALLAR (i18n çıkarımı — VentHub):
- Motor: useI18n() -> { lang, t }. Im...`
- **TARGETS** (array) — `[
  // Wave E1 — tail metin dosyaları (mevcut top-level ns'lere map; navigat...`
- **MIGRATE_SCHEMA** (object) — `{
  type: 'object',
  required: ['file', 'namespace', 'keys', 'literalsRepl...`
- **JUDGE_SCHEMA** (object) — `{
  type: 'object',
  required: ['file', 'pass', 'issues', 'parityOk', 'mis...`
- **results** (await_expression) — `await pipeline(
  TARGETS,
  (t) => agent(migratePrompt(t), { label: 'migra...`

---

## AST POINTERS

### [N1_NASIL] AST Pointer: i18n-wave.mjs::migratePrompt
- **params**: `t` — dosya ve namespace bilgilerini içeren nesne (`t.file`, `t.ns` alanlarına sahip)
- **ic_degiskenler**:
  - `surface` — `t.ns` değerinin nokta (`.`) ile bölünmesinden elde edilen ilk parça; üst-yüzey namespace olarak template literal içinde kullanılır
- **Dönüş**: string — uluslararasılaştırma (i18n) göç talimatlarını içeren template literal; `t.file`, `t.ns`, `surface` ve `PATTERN` sabitini birleştirir

### [N2_NASIL] AST Pointer: i18n-wave.mjs::judgePrompt
- **params**: `t` — dosya ve namespace bilgilerini içeren nesne (`t.file`, `t.ns` alanlarına sahip), `mr` — göç ajanının rapor nesnesi (`mr.keys` alanına erişilir; yoksa boş obje kullanılır)
- **ic_degiskenler**: yok (tüm erişimler doğrudan parametreler ve `JSON.stringify` üzerinden yapılır)
- **Dönüş**: string — i18n göçünü adversaryal olarak çürütmek için talimatları içeren template literal; `t.file`, `t.ns`, `mr.keys` ve `JSON.stringify` sonucunu birleştirir

---

## NODE ID STANDARD

  file: .claude\skills\maestro\i18n-wave.mjs
  function: .claude\skills\maestro\i18n-wave.mjs::migratePrompt
  function: .claude\skills\maestro\i18n-wave.mjs::judgePrompt

---

## DISA AKTARILANLAR (EXPORTS)
  export: judgePrompt
  export: meta
  export: migratePrompt