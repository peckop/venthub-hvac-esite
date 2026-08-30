---
domain: general
source_type: doc
namespace_type: module
source_path: C:\tmp\vh-altyapi-851\.claude\hooks\verify-on-stop.cjs
skeleton_hash: c09ef9df4e102ca6
entity_hashes:
  func:readStdin: f92f520ff76bb41d
  overview: c12df99cb346a75d
generated_at: 2026-08-27T17:58:57Z
---

## Genel Bakış

Bu modül, `.claude/hooks/` dizininde yer alan bir Claude Code hook dosyasıdır. Modül, bir işlem durduğunda çalışan bir doğrulama mekanizması olarak konumlandırılmıştır. Modülde yalnızca tek bir fonksiyon tanımlıdır.

## Fonksiyon Grupları

### Standart Girdi Okuma

Modülün tek fonksiyonu olan `readStdin`, standart girdi akışından veri okuma işlemini gerçekleştirir. Bu fonksiyon, hook mekanizmasının dışarıdan (Claude Code tarafından) iletilen veriyi alabilmesini sağlar.

- readStdin

---

## AXIOMS – Mimari Varsayımlar

Bu modül için özel aksiyom tanımlanmamıştır.

**Gerekçe:** Fonksiyon gövdesi sağlanmadığından (yalnızca `readStdin()` imzası ve modül sabitleri mevcut), davranışsal çıkarım yapılamaz. Modül sabitlerinin (`fs`, `os`, `path`, `sessionId`, `acc`, `repoRoot`, `uniq`, `tsc`, `out`, `editedRel`, `typeErrors`) nasıl kullanıldığı fonksiyon gövdesi olmadan belirlenemez.

---

## FONKSİYON DETAYLARI

### readStdin
**Ne yapar**: Standart girdi (stdin) akışından UTF-8 formatında veri okuyan bir yardımcı fonksiyondur. Okuma başarısız olursa boş bir string döndürerek programın çökmesini engeller.

**Nasıl yapar**: Node.js'in `fs` modülündeki `readFileSync` fonksiyonunu dosya tanımlayıcı `0` (stdin) ile çağırarak eşzamanlı (synchronous) biçimde veri okur. Okuma işlemi `try-catch` bloğu içine alınmıştır; herhangi bir hata oluştuğunda (örneğin stdin'den veri gelmiyorsa) yakalama bloğu devreye girer ve boş string `''` döndürülür.

**Parametreler**:
- Bu fonksiyon parametre almaz.

**Dönüş**: Fonksiyon iki durumda değer döndürür: başarılı okuma durumunda `fs.readFileSync` tarafından sağlanan string değerini, hata durumunda ise boş string `''` döndürür. Kaynak kodda açık bir dönüş tipi bildirimi (type annotation) bulunmamaktadır.

---

## SABİTLER
- **fs** (call) — `require('fs')`
- **os** (call) — `require('os')`
- **path** (call) — `require('path')`
- **sessionId** (binary_expression) — `(input && input.session_id) || 'nosession'`
- **acc** (call) — `path.join(os.tmpdir(), `venthub-edited-${sessionId}.txt`)`
- **repoRoot** (call) — `process.cwd()`
- **uniq** (call) — `[...new Set(raw.split('\n').map((s) => s.trim()).filter(Boolean))]
  .filter...`
- **tsc** (call) — `spawnSync('pnpm', ['exec', 'tsc', '--noEmit', '--pretty', 'false'], {
  shel...`
- **out** (call) — `((tsc.stdout || '') + (tsc.stderr || '')).toString()`
- **editedRel** (new_expression) — `new Set(uniq.map((f) => path.relative(repoRoot, f).replace(/\\/g, '/')))`
- **typeErrors** (call) — `out
  .split('\n')
  .map((line) => line.replace(/\r$/, ''))
  .filter((li...`

---

## AST POINTERS

### [N1_NASIL] AST Pointer: .claude/hooks/verify-on-stop.cjs::readStdin
- **params**: (parametre yok)
- **ic_degiskenler**: (iç değişken yok)
- **Dönüş**: string — `fs.readFileSync(0, 'utf8')` ile stdin'den okunan metin; okuma hatası durumunda boş string (`''`)

### [N2_NASIL] AST Pointer: .claude/hooks/verify-on-stop.cjs::(anonim arrow fonksiyon)
- **params**: `line` — tek satır metin, TypeScript derleyici çıktısından bir satır
- **ic_degiskenler**:
  - `m` — `line.match(/^(.+?)\(\d+,\d+\):\s+error TS/)` sonucu; eşleşme yoksa `null`, eşleşirse yakalanan dosya yolu `m[1]` içinde saklanır
- **Dönüş**: boolean — satır bir TS hata satırı değilse `false`; hata satırıysa ve `m[1]` içindeki dosya yolu (ters eğik çizgiler düzeltildikten sonra) `editedRel` kümesinde mevcutsa `true`, aksi halde `false`

---

## NODE ID STANDARD

  file: .claude\hooks\verify-on-stop.cjs
  function: .claude\hooks\verify-on-stop.cjs::readStdin

---

## DISA AKTARILANLAR (EXPORTS)
  export: readStdin