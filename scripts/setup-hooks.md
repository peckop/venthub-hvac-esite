---
domain: general
source_type: doc
namespace_type: module
source_path: C:\tmp\vh-t088\scripts\setup-hooks.mjs
skeleton_hash: 69608313dd9cc97c
entity_hashes:
  func:git: b7c7e992855e4267
  overview: 49028efded1fa85a
generated_at: 2026-08-27T12:52:16Z
---

## Genel Bakış
Bu modül, Git hook'larını kurmaya yönelik bir betiktir. Modülde yalnızca tek bir dışa açık fonksiyon bulunur ve bu fonksiyon Git komutlarını çalıştırmak için bir yardımcı işlev olarak tanımlanmıştır.

## Fonksiyon Grupları
### Git Komutu Çalıştırma
Git işlemlerini yürütmek için kullanılan yardımcı fonksiyondur; dışarıdan aldığı argümanları bir Git komutuna aktararak çalıştırır.
- git

### Notlar
- Modülde yalnızca `git` fonksiyonu tanımlıdır; başka fonksiyon veya dışa aktarım bilgisi mevcut değildir.
- Dış bağımlılıklar ve dinamik yüklenen modüller hakkında kaynakta bilgi bulunmamaktadır.

---

## AXIOMS – Mimari Varsayımlar

Bu modül için fonksiyon gövdeleri sağlanmadığından, yalnızca mevcut imza ve sabit bilgilerinden çıkarım yapılabilir.

[Aksiyom 1]: Eğer `repoRoot` çağrı sonucu üretilemezse, modülün çalışması için gerekli kök dizin bilgisi elde edilemez ve hook kurulumu gerçekleştirilemez.

[Aksiyom 2]: Eğer `hooksDir` çağrı sonucu üretilemezse, hook dosyalarının hedef dizini belirlenemez.

[Aksiyom 3]: Eğer `SRC_DIR` çağrı sonucu üretilemezse, kaynak dosyaların konumu bilinemez.

[Aksiyom 4]: Eğer `commonDir` çağrı sonucu üretilemezse, ortak dizin yolu bilinemez.

[Aksiyom 5]: Eğer `names` çağrı sonucu üretilemezse, kurulacak hook isimleri bilinemez.

[Aksiyom 6]: Eğer `git(args)` fonksiyonu mevcut değilse, git komutları çalıştırılamaz ve hook kurulumu için gerekli git işlemleri yapılamaz.

**Not:** Fonksiyon gövdeleri sağlanmadığından, bu aksiyomlar yalnızca modül sabitlerinin ve fonksiyon imzasının varlığına dayalı yüzeysel varsayımlardır. Daha detaylı aksiyomlar için fonksiyon gövdelerinin incelenmesi gerekmektedir.

---

## FONKSİYON DETAYLARI

### git
**Ne yapar**: Verilen argümanlarla `git` komutunu çalıştırır ve komutun standart çıktısını temizlenmiş (trimmed) bir metin olarak döndürür. Komut başarısız olursa `null` döndürür.

**Nasıl yapar**: Node.js'in `child_process` modülündeki `execFileSync` fonksiyonunu kullanarak `git` komutunu eşzamanlı (synchronous) olarak çalıştırır. Çalışma dizini olarak `repoRoot` değişkenini kullanır. Çıktıyı UTF-8 kodlamasıyla okur ve standart hata akışını (`stderr`) yok sayar (`'ignore'`). Başarılı çalıştırma sonucunda elde edilen metin üzerinde `trim()` işlemi uygulayarak baştaki ve sondaki boşlukları temizler. `try-catch` bloğu ile herhangi bir hata oluştuğunda (örneğin geçersiz git komutu, bulunamayan depo) istisnayı yakalar ve sessizce `null` döndürür.

**Parametreler**:
- args: string[] — `git` komutuna aktarılacak argüman dizisi. Her bir eleman, komut satırında ayrı bir argüman olarak iletilir (örneğin `['log', '--oneline']` veya `['status']`).

**Dönüş**: string | null — Komut başarıyla çalıştırılırsa, `git` komutunun standart çıktısı baştaki ve sondaki boşluklardan arındırılmış şekilde döndürülür. Komut çalıştırılamaz veya bir hata oluşursa `null` döndürülür.

---

## İTHALATLAR (IMPORTS)
- import: node:child_process::execFileSync
- import: node:path::path
- import: node:url::fileURLToPath

---

## SABİTLER
- **repoRoot** (call) — `path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..')`
- **SRC_DIR** (call) — `path.join(repoRoot, '.githooks')`
- **commonDir** (call) — `git(['rev-parse', '--git-common-dir'])`
- **hooksDir** (call) — `path.resolve(repoRoot, commonDir, 'hooks')`
- **names** (call) — `readdirSync(SRC_DIR).filter((f) => !f.endsWith('.md') && !f.startsWith('.'))`

---

## AST POINTERS

### [N1_NASIL] AST Pointer: scripts/setup-hooks.mjs::git
- **params**: `args` — çalıştırılacak git alt komutu ve argümanlarını içeren dizi
- **ic_degiskenler**:
  - `execFileSync('git', args, ...)` — `node:child_process` modülünden import edilen fonksiyon; `git` komutunu `args` argümanlarıyla çalıştırır
  - `repoRoot` — modül seviyesinde tanımlı sabit; `cwd` olarak kullanılır, komutun çalıştırılacağı kök dizini belirtir
  - `{ cwd: repoRoot, encoding: 'utf8', stdio: ['ignore', 'pipe', 'ignore'] }` — `execFileSync` seçenekleri: çalışma dizini `repoRoot`, çıktı UTF-8 olarak kodlanır, stdin yok sayılır, stdout pipe ile yakalanır, stderr yok sayılır
  - `.trim()` — yakalanan stdout çıktısının başındaki ve sonundaki boşluk karakterlerini temizler
- **Dönüş**: başarılıysa `string` (git komutunun trimlenmiş stdout çıktısı), hata yakalanırsa `null`

---

## NODE ID STANDARD

  file: scripts\setup-hooks.mjs
  function: scripts\setup-hooks.mjs::git

---

## DISA AKTARILANLAR (EXPORTS)
  export: git