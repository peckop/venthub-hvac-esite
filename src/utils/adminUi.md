---
domain: general
source_type: doc
namespace_type: module
source_path: C:\tmp\wt-supurme\src\utils\adminUi.ts
skeleton_hash: 990fbeb0bf9239c1
entity_hashes:
  overview: d13e94e1526b35ae
generated_at: 2026-08-25T07:28:46Z
---

## Genel Bakış

`adminUi.ts` modülü, admin paneli arayüzü için önceden tanımlanmış CSS sınıf sabitlerini barındıran bir stil yardımcı dosyasıdır. Modül, fonksiyon veya dış bağımlılık içermez; yalnızca modül seviyesinde sabit tanımlamalarından oluşur. Bu sabitler, admin arayüzündeki kartlar, tablolar, butonlar, form alanları, modal pencereler, stepper çizgileri ve sipariş tahtası gibi bileşenlerin Tailwind CSS sınıf tanımlamalarını merkezi olarak sunar.

Dosyada ortam değişkeni kullanımı veya API/veritabanı sorgusu bulunmamaktadır. Tüm sabitler derleme anında belirlenen statik CSS sınıf string'lerinden oluşur ve admin arayüzündeki bileşenlerin tutarlı görünümünü sağlamak amacıyla diğer modüller tarafından import edilerek kullanılır.

---

## AXIOMS – Mimari Varsayımlar

Bu modül için özel aksiyom tanımlanmamıştır.

**Gerekçe:** Modül yalnızca sabit (constant) tanımlamalarından oluşmaktadır. Fonksiyon gövdesi bulunmadığından, AXIOMS SADECE fonksiyon gövdesinden üretilir kuralı uyarınca mimari varsayım türetilememektedir.

---

## FONKSİYON DETAYLARI

---

## SABİTLER
- **adminCardClass** (str) — `'bg-admin-surface border border-admin-border rounded-admin-lg shadow-admin-sm...`
- **adminCardPaddedClass** (template) — ``${adminCardClass} p-6``
- **adminTableHeadCellClass** (binary_expression) — `'text-left px-4 py-2.5 text-xs font-medium text-admin-fg-muted uppercase trac...`
- **adminTableCellClass** (binary_expression) — `'px-4 py-2.5 text-sm text-admin-fg align-middle border-b border-admin-border ...`
- **adminTableContainerClass** (str) — `'relative overflow-hidden bg-admin-surface rounded-admin-lg border border-adm...`
- **buttonBaseClass** (binary_expression) — `'inline-flex justify-center items-center gap-2 px-4 h-9 rounded-admin-md text...`
- **adminButtonPrimaryClass** (template) — ``${buttonBaseClass} bg-admin-accent text-admin-accent-fg hover:bg-admin-accen...`
- **adminButtonSecondaryClass** (binary_expression) — ``${buttonBaseClass} bg-admin-surface border border-admin-border text-admin-fg...`
- **tableActionBaseClass** (binary_expression) — `'inline-flex justify-center items-center gap-1.5 px-2.5 h-8 rounded-admin-sm ...`
- **adminTableActionClass** (binary_expression) — ``${tableActionBaseClass} bg-admin-surface border border-admin-border text-adm...`
- **adminTableActionDangerClass** (binary_expression) — ``${tableActionBaseClass} bg-admin-danger-weak border border-admin-danger/25 t...`
- **adminTableActionPrimaryClass** (template) — ``${tableActionBaseClass} bg-admin-accent text-admin-accent-fg hover:bg-admin-...`
- **adminTableActionWarningClass** (binary_expression) — ``${tableActionBaseClass} bg-admin-warning-weak border border-admin-warning/25...`
- **fieldBaseClass** (binary_expression) — `'w-full bg-admin-surface border border-admin-border rounded-admin-md text-sm ...`
- **adminInputClass** (template) — ``${fieldBaseClass} px-3 py-2``
- **adminInputWithIconClass** (template) — ``${fieldBaseClass} pl-10 pr-3 py-2``
- **adminSelectClass** (template) — ``${fieldBaseClass} pl-3 pr-9 py-2 cursor-pointer appearance-none bg-no-repeat...`
- **adminSelectStyle** (object) — `{
  backgroundImage: `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.or...`
- **adminSettingsLabelClass** (str) — `'block text-xs font-medium text-admin-fg-muted uppercase tracking-wide mb-2'`
- **adminStepperLineBgClass** (str) — `'absolute left-10% right-10% top-1/2 -translate-y-1/2 h-0.5 bg-admin-border -...`
- **adminStepperLineFillClass** (str) — `'absolute left-10% top-1/2 -translate-y-1/2 h-0.5 bg-admin-accent -z-10 trans...`
- **adminModalContentClass** (binary_expression) — `'fixed left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 z-modal ' +
  'fle...`
- **adminColumnContainerClass** (binary_expression) — `'flex flex-col w-full md:w-320px shrink-0 bg-admin-surface-2 border border-ad...`
- **adminOrderCardClass** (str) — `'bg-admin-surface border border-admin-border rounded-admin-md p-4 space-y-3 s...`
- **adminNoteItemClass** (str) — `'p-3 bg-admin-surface-2 rounded-admin-md border border-admin-border group hov...`
- **adminOrderBoardItemClass** (str) — `'bg-admin-surface border-admin-border hover:border-admin-border-strong hover:...`

---

## AST POINTERS

Bu dosyada (`src/utils/adminUi.ts`) fonksiyon tanımlanmamıştır. Dosya yalnızca CSS sınıf adlarını tutan sabit değişken tanımlarından oluşur:

- `adminCardClass` — `str` türünde sabit
- `adminCardPaddedClass` — template literal ile oluşturulmuş sabit
- `adminTableHeadCellClass` — binary expression (birleştirme) ile oluşturulmuş sabit
- `adminTableCellClass` — binary expression ile oluşturulmuş sabit
- `adminTableContainerClass` — `str` türünde sabit
- `buttonBaseClass` — binary expression ile oluşturulmuş sabit
- `adminButtonPrimaryClass` — template literal ile oluşturulmuş sabit
- `adminButtonSecondaryClass` — binary expression ile oluşturulmuş sabit
- `tableActionBaseClass` — binary expression ile oluşturulmuş sabit
- `adminTableActionClass` — binary expression ile oluşturulmuş sabit
- `adminTableActionDangerClass` — binary expression ile oluşturulmuş sabit
- `adminTableActionPrimaryClass` — template literal ile oluşturulmuş sabit
- `adminTableActionWarningClass` — binary expression ile oluşturulmuş sabit
- `fieldBaseClass` — binary expression ile oluşturulmuş sabit
- `adminInputClass` — template literal ile oluşturulmuş sabit
- `adminInputWithIconClass` — template literal ile oluşturulmuş sabit
- `adminSelectClass` — template literal ile oluşturulmuş sabit
- `adminSelectStyle` — `object` türünde sabit (inline stil tanımları)
- `adminSettingsLabelClass` — `str` türünde sabit
- `adminStepperLineBgClass` — `str` türünde sabit
- `adminStepperLineFillClass` — `str` türünde sabit
- `adminModalContentClass` — binary expression ile oluşturulmuş sabit
- `adminColumnContainerClass` — binary expression ile oluşturulmuş sabit
- `adminOrderCardClass` — `str` türünde sabit
- `adminNoteItemClass` — `str` türünde sabit
- `adminOrderBoardItemClass` — `str` türünde sabit

Fonksiyon gövdesi bulunmadığından AST Pointer üretilmemiştir.

---

## NODE ID STANDARD

  file: adminUi.ts

---

## DISA AKTARILANLAR (EXPORTS)
  export: adminButtonPrimaryClass
  export: adminButtonSecondaryClass
  export: adminCardClass
  export: adminCardPaddedClass
  export: adminColumnContainerClass
  export: adminInputClass
  export: adminInputWithIconClass
  export: adminModalContentClass
  export: adminNoteItemClass
  export: adminOrderBoardItemClass
  export: adminOrderCardClass
  export: adminSelectClass
  export: adminSelectStyle
  export: adminSettingsLabelClass
  export: adminStepperLineBgClass
  export: adminStepperLineFillClass
  export: adminTableActionClass
  export: adminTableActionDangerClass
  export: adminTableActionPrimaryClass
  export: adminTableActionWarningClass
  export: adminTableCellClass
  export: adminTableContainerClass
  export: adminTableHeadCellClass