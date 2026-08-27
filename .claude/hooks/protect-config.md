---
domain: general
source_type: doc
namespace_type: module
source_path: C:\tmp\vh-altyapi-851\.claude\hooks\protect-config.cjs
skeleton_hash: 3525849f888df672
entity_hashes:
  func:readStdin: f92f520ff76bb41d
  overview: c12df99cb346a75d
generated_at: 2026-08-27T17:49:18Z
---

## Genel Bakış
Bu modül, `.claude/hooks/` dizininde yer alan bir Claude hook dosyasıdır. Modülün dosya adı `protect-config.cjs` olup, yalnızca tek bir fonksiyon içerir.

## Fonksiyon Grupları

### Standart Girdi Okuma
Standart girdi akışından veri okuma işlemini gerçekleştirir.
- readStdin

## Notlar
- Modülde yalnızca bir fonksiyon bulunduğu için fonksiyonlar arası çağrı ilişkisi bulunmamaktadır.
- Dış bağımlılıklar ve dinamik yüklenen modüller hakkında verilen kaynakta bilgi yer almamaktadır.

---

## AXIOMS – Mimari Varsayımlar

Bu modül için özel aksiyom tanımlanmamıştır.

**Gerekçe:** Fonksiyon gövdeleri sağlanmadığı için `readStdin()` fonksiyonunun çalışma mantığı, koşulları ve bağımlılıkları belirlenememektedir. Modül sabitlerinin (`fs`, `path`, `FORBIDDEN`, `hits` vb.) nasıl kullanıldığı fonksiyon gövdesi olmadan çıkarılamaz.

---

## FONKSİYON DETAYLARI

### readStdin
**Ne yapar**: Standart girdi (stdin) akışından UTF-8 kodlamasında veri okur ve okunan içeriği string olarak döndürür. Okuma başarısız olursa boş string döndürerek hata fırlatmaz.

**Nasıl yapar**: Node.js'in `fs` modülündeki `readFileSync` fonksiyonunu dosya tanımlayıcısı `0` (stdin) ile çağırarak eşzamanlı (synchronous) biçimde stdin akışını okur. `try-catch` bloğu içinde çalıştırılır; herhangi bir hata oluşursa (örneğin stdin mevcut değilse veya okunamıyorsa) yakalanır ve sessizce boş string (`''`) döndürülür. Bu sayede fonksiyon hiçbir zaman hata fırlatmaz.

**Parametreler**:
- Bu fonksiyon herhangi bir parametre almaz.

**Dönüş**: Gövdedeki `return` ifadelerinden anlaşılacağı üzere string türünde değer döndürür. Başarılı okuma durumunda stdin'den okunan UTF-8 metni, hata durumunda ise boş string (`''`) döndürür.

---

## SABİTLER
- **fs** (call) — `require('fs')`
- **path** (call) — `require('path')`
- **ti** (binary_expression) — `(input && input.tool_input) || {}`
- **filePath** (binary_expression) — `ti.file_path || ''`
- **base** (call) — `path.basename(filePath).toLowerCase()`
- **rel** (call) — `filePath.replace(/\\/g, '/').toLowerCase()`
- **protectedExact** (new_expression) — `new Set(['eslint.config.cjs', '.lintstagedrc.json'])`
- **isTsconfig** (call) — `/(^|\/)tsconfig(\.[\w.-]+)?\.json$/.test(rel)`
- **isCodeFile** (call) — `/\.(ts|tsx|js|jsx|cjs|mjs)$/i.test(rel)`
- **isUnderClaude** (binary_expression) — `rel.includes('/.claude/') || rel.startsWith('.claude/')`
- **FORBIDDEN** (array) — `[
  { name: 'as any',            re: /\bas\s+any\b/,              why: 'stri...`
- **hits** (call) — `FORBIDDEN.filter((p) => p.re.test(incoming))`

---

## AST POINTERS

### [N1_NASIL] AST Pointer: .claude\hooks\protect-config.cjs::readStdin
- **params**: (parametre yok)
- **ic_degiskenler**:
  - `fs.readFileSync(0, 'utf8')` — stdin (dosya tanımlayıcısı 0) üzerinden UTF-8 kodlamasıyla veri okur; başarılı olursa okunan string değerini döndürür
  - `''` — `catch` bloğunda, okuma başarısız olduğunda döndürülen boş string
- **Dönüş**: string — stdin'den okunan metin veya hata durumunda boş string

---

## NODE ID STANDARD

  file: .claude\hooks\protect-config.cjs
  function: .claude\hooks\protect-config.cjs::readStdin

---

## DISA AKTARILANLAR (EXPORTS)
  export: readStdin