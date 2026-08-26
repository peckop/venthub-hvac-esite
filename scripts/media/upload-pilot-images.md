---
domain: general
source_type: doc
namespace_type: module
source_path: C:\Users\alize\venthub-wt-gorsel\scripts\media\upload-pilot-images.mjs
skeleton_hash: 0673342c36d650df
entity_hashes:
  func:arg: 2c0d857f38523903
  func:saveInv: acdf329c66227d74
  overview: 1253cba202bd6f9f
generated_at: 2026-08-21T07:12:44Z
---

## Genel Bakış

Bu modül, pilot görsellerinin medya ortamına yüklenmesini sağlayan bir komut satırı scriptidir. Script, komut satırı argümanlarını okur ve yükleme sonrası envanter bilgilerini kalıcı olarak kaydeder.

## Fonksiyon Grupları

### Komut Satırı Yardımcıları
Komut satırından gelen parametrelerin güvenli bir şekilde okunmasını sağlar.
- arg, saveInv

---

## AXIOMS – Mimari Varsayımlar

Bu modül, pilot görselleri Supabase'e yükleyen bir medya yükleme betiğidir.

[Aksiyom 1]: Eğer `supabase` bağlantısı (call) çalışmıyorsa veya geçersizse, görseller Supabase'e yüklenemez ve hata oluşur.

[Aksiyom 2]: Eğer `manifestPath` veya `invPath` (call) için geçerli bir dosya yolu çözümlenemezse, manifest veya envanter dosyası okunamaz/yazılamaz.

[Aksiyom 3]: Eğer `outDir` (call) dizini mevcut değilse veya yazma izni yoksa, çıktı dosyaları kaydedilemez.

[Aksiyom 4]: Eğer `key` (member_expression) erişim anahtarı tanımsız veya geçersizse, Supabase depolama alanına yetkisiz erişim denemesi yapılır ve yükleme başarısız olur.

[Aksiyom 5]: Eğer `arg(name, fallback)` için `name` parametresi olarak beklenen ortam değişkeni tanımlı değilse, `fallback` değeri kullanılır; fallback de tanımsızsa ilgili işlem gerçekleştirilemez.

[Aksiyom 6]: Eğer `inv` (ternary_expression) tarafından hesaplanan envanter durumu yüklenemez (manifest veya envanter dosyası bozuksa), `saveInv()` çağrısı geçersiz veri kaydeder veya hata fırlatır.

[Aksiyom 7]: Eğer `url` (binary_expression) ile oluşturulacak yükleme hedefi geçerli bir Supabase Storage bucket ve dosya yolu içermiyorsa, yükleme hedefi geçersizdir.

[Aksiyom 8]: Eğer `rollback` (call) geri alma mekanizması tetiklendiğinde daha önce başarılı olan yükleme işlemleri tersine çevrilemezse (ör. dosya zaten silinmiş), tutarsızlık oluşur.

---

## FONKSİYON DETAYLARI

### arg
**Ne yapar**: Komut satırı argümanlarının değerlerini okumak için yardımcı bir fonksiyondur. `--name` formatında belirtilen bir argümanı `process.argv` dizisi içinde arar ve değerini döndürür.

**Nasıl yapar**: Fonksiyon, `process.argv` dizisinde `--${name}` kalıbında bir eleman olup olmadığını kontrol eder. `indexOf` metodu ile argümanın indeksi bulunur. Eğer indeks `-1`'den büyükse (yani argüman mevcutsa), bir sonraki eleman (`process.argv[i + 1]`) argümanın değeri olarak alınır. Argüman bulunamazsa, belirtilen `fallback` değeri varsayılan olarak döndürülür.

**Parametreler**:
- name: `string` — Aranacak komut satırı argümanının adı (örneğin `filename` ise `--filename` aranır)
- fallback: `any` — Argüman bulunamadığında döndürülecek varsayılan değer

**Dönüş**: Bulunan argümanın değeri (`string`) veya `fallback` değeri

### saveInv
**Ne yapar**: Geliştirildi ancak detay üretilemedi.

---

## İTHALATLAR (IMPORTS)
- import: @supabase/supabase-js::createClient
- import: node:fs::fs
- import: node:path::path

---

## SABİTLER
- **outDir** (call) — `arg('out')`
- **rollback** (call) — `process.argv.includes('--rollback')`
- **url** [env-backed] (binary_expression) — `process.env.SUPABASE_URL || process.env.NEXT_PUBLIC_SUPABASE_URL`
- **key** [env-backed] (member_expression) — `process.env.SUPABASE_SERVICE_ROLE_KEY`
- **supabase** (call) — `createClient(url, key, { auth: { persistSession: false } })`
- **manifestPath** (call) — `path.join(outDir, 't139-manifest.json')`
- **invPath** (call) — `path.join(outDir, 't139-upload-inventory.json')`
- **manifest** (call) — `JSON.parse(fs.readFileSync(manifestPath, 'utf8'))`
- **inv** (ternary_expression) — `fs.existsSync(invPath)
  ? JSON.parse(fs.readFileSync(invPath, 'utf8'))
  : {...`

---

## AST POINTERS

### [N1_NASIL] AST Pointer: scripts/media/upload-pilot-images.mjs::arg
- **params**: (`name`, `fallback`)
  - `name` — komut satırı argümanı adı (ör: "dir" → `--dir` aranır)
  - `fallback` — argüman bulunamazsa döndürülecek varsayılan değer
- **ic_degiskenler**:
  - `i` — `process.argv` dizisinde `--${name}` kalıbının bulunduğu indeks; `-1` ise argüman mevcut değildir
- **Dönüş**: `process.argv[i + 1]` (argüman bulunduysa bir sonraki eleman) veya `fallback` (bulunamadıysa)

---

### [N2_NASIL] AST Pointer: scripts/media/upload-pilot-images.mjs::saveInv
- **params**: (parametre yok)
- **ic_degiskenler**: (gövde sağlanmadı; modül üst düzeyinde şu değişkenler mevcut)
  - `outDir` — çekim çıktı dizini
  - `rollback` — (call) geri alma/rollback değeri
  - `supabase` — (call) `createClient(url, key)` ile oluşturulan Supabase istemcisi
  - `manifestPath` — (call) manifest dosyasının tam yolu
  - `invPath` — (call) inventory dosyasının tam yolu
  - `manifest` — (call) manifest verisi (okunan/yüklenen)
  - `inv` — (ternary_expression) inventory verisi (koşullu atama)
- **Dönüş**: (gövde sağlanmadı)

---

## NODE ID STANDARD

  file: scripts\media\upload-pilot-images.mjs
  function: scripts\media\upload-pilot-images.mjs::arg
  function: scripts\media\upload-pilot-images.mjs::saveInv

---

## DISA AKTARILANLAR (EXPORTS)
  export: arg
  export: saveInv