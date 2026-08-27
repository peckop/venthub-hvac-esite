---
domain: general
source_type: doc
namespace_type: module
source_path: C:\tmp\vh-t088\.claude\skills\maestro\i18n-wave-account.mjs
skeleton_hash: f757f838cf6e1ab6
entity_hashes:
  func:judgePrompt: 31b2fb148bb82b86
  func:migratePrompt: 992444e5619542f8
  overview: 0642545b0620105b
generated_at: 2026-08-27T12:16:03Z
---

## Genel Bakış

Bu modül, i18n (uluslararasılaştırma) kapsamında wave-account ile ilgili AI/LLM prompt'ları oluşturmaya yönelik iki fonksiyon içerir. Modül, hesap taşıma ve değerlendirme süreçleri için uygun prompt şablonları üretme sorumluluğuna sahiptir.

## Fonksiyon Grupları

### Prompt Üretimi

Modüldeki her iki fonksiyon da farklı kullanım amaçlarına yönelik prompt'lar oluşturur. Fonksiyonlar arasındaki kesin çağrı ilişkisi bilinmiyor.

- `migratePrompt` — Hesap taşıma (migration) işlemi için bir prompt üretir.
- `judgePrompt` — Değerlendirme (judge) işlemi için bir prompt üretir.

---

## AXIOMS – Mimari Varsayımlar

Bu modül için özel aksiyom tanımlanmamıştır.

**Gerekçe:** Fonksiyon gövdeleri (`migratePrompt` ve `judgePrompt`) sağlanmadığından, modülün iç davranışına ilişkin varsayımlar üretilememektedir. Mevcut bilgiler yalnızca fonksiyon imzaları ve sabit tanımlarıdır; bunlar fonksiyon gövdesi içermez.

---

## FONKSİYON DETAYLARI

### migratePrompt
**Ne yapar**: Verilen dosya ve namespace bilgisine dayanarak, bir dil modeline (LLM) gönderilecek bir uluslararasılaştırma (i18n) talimat metni oluşturur. Oluşturulan metin, belirtilen dosyadaki kullanıcıya görünen metinlerin `t()` çağrılarıyla değiştirilmesi için adım adım yönlendirme içerir.

**Nasıl yapar**: Parametre olarak aldığı `t` nesnesinden `t.file` (dosya yolu) ve `t.ns` (hedef namespace) bilgilerini alır. Ayrıca kapsam dışından gelen `PATTERN` değişkenini de metne ekler. Bu üç bilgiyi ve sabit talimat metnini bir template literal (şablon dizesi) içinde birleştirerek tek bir string döndürür. Döndürülen metin, bir LLM ajanına verilecek bir prompt niteliğindedir ve şu talimatları içerir: (1) hedef dosyayı oku, (2) `src/i18n/dictionaries/tr.ts` dosyasındaki mevcut anahtarları gör, (3) `react/jsx-no-literals` kuralını tetikleyen kullanıcı metinlerini `t('${t.ns}.<key>')` ile değiştir, (4) yeni anahtarları döndür.

**Parametreler**:
- `t`: object — Uluslararasılaştırılacak dosya bilgisini içeren nesne. `t.file` (string, işlem görecek dosya yolu) ve `t.ns` (string, hedef i18n namespace adı) alt alanlarına erişilir.

**Dönüş**: Template literal ile oluşturulan bir string. Kesin dönüş tipi kaynakta belirtilmemiştir; kod gövdesinde `return` ile bir template literal döndürüldüğü görülmektedir.

### judgePrompt
**Ne yapar**: Geliştirildi ancak detay üretilemedi.

---

## SABİTLER
- **meta** (object) — `{
  name: 'i18n-wave-account',
  description: 'i18n extraction wave — accou...`
- **PATTERN** (template) — ``
KURALLAR (i18n çıkarımı — VentHub):
- Motor: useI18n() -> { lang, t }. Im...`
- **TARGETS** (array) — `[
  { file: 'src/views/account/AccountAddressesPage.tsx', ns: 'account.addre...`
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

### [N1_NASIL] AST Pointer: i18n-wave-account.mjs::migratePrompt
- **params**: `t` — dosya ve namespace bilgilerini içeren nesne
- **ic_degiskenler**: (yok)
- **Dönüş**: string — uluslararasılaştırma talimatlarını ve hedef namespace'i içeren bir prompt metni

### [N2_NASIL] AST Pointer: i18n-wave-account.mjs::judgePrompt
- **params**: `t` — dosya ve namespace bilgilerini içeren nesne, `mr` — göç ajanının raporunu içeren nesne (opsiyonel, `mr.keys` özelliğine erişilir)
- **ic_degiskenler**: (yok)
- **Dönüş**: string — i18n göçünü denetlemek için kullanılan bir prompt metni

---

## NODE ID STANDARD

  file: .claude\skills\maestro\i18n-wave-account.mjs
  function: .claude\skills\maestro\i18n-wave-account.mjs::migratePrompt
  function: .claude\skills\maestro\i18n-wave-account.mjs::judgePrompt

---

## DISA AKTARILANLAR (EXPORTS)
  export: judgePrompt
  export: meta
  export: migratePrompt