---
domain: general
source_type: doc
namespace_type: module
source_path: C:\tmp\vh-t088\scripts\docs\sync_supabase_docs.cjs
skeleton_hash: c11a2d04281efea2
entity_hashes:
  func:download: aec45eb4690a2eff
  func:sync: 2ba41cb02d0baeab
  overview: 79a5ac627266047b
generated_at: 2026-08-27T12:37:57Z
---

## Genel Bakış

Bu modül, Supabase dokümanlarını harici bir kaynaktan yerel sisteme indirip senkronize etmekten sorumludur. Modül, dosya indirme ve senkronizasyon olmak üzere iki temel işlem sunar.

## Fonksiyon Grupları

### Dosya İndirme
Belirtilen URL'den dosya indirip hedef konuma kaydetme işlemini gerçekleştirir.
- download

### Senkronizasyon
Asenkron olarak Supabase dokümanlarının senkronizasyon sürecini yönetir ve ana iş akışını koordine eder.
- sync

---

## AXIOMS – Mimari Varsayımlar

Bu modül, belirtilen dokümanları uzak sunucudan yerel dosya sistemine indirerek senkronize eder.

[Aksiyom 1]: Eğer `docsToFetch` dizisi mevcut değilse veya boşsa, `sync` fonksiyonunun indireceği dosya listesi bilinmez ve senkronizasyon gerçekleştirilemez.

[Aksiyom 2]: Eğer `targetDir` tanımlı değilse, indirilen dosyaların yazılacağı hedef dizin bilinmez ve dosya kaydetme işlemi başarısız olur.

[Aksiyom 3]: Eğer `https` modülü mevcut değilse, uzak sunucuya güvenli bağlantı kurulamaz ve `download` fonksiyonu dosya indiremez.

[Aksiyom 4]: Eğer `fs` modülü mevcut değilse, dosya sistemi okuma/yazma işlemleri gerçekleştirilemez ve indirilen içerik diske yazılamaz.

[Aksiyom 5]: Eğer `path` modülü mevcut değilse, dosya yolları doğru şekilde birleştirilemez ve hedef dosya konumu oluşturulamaz.

[Aksiyom 6]: Eğer `download` fonksiyonuna geçerli bir `url` parametresi sağlanmazsa, hangi kaynaktan indirme yapılacağı bilinmez ve HTTP isteği gönderilemez.

[Aksiyom 7]: Eğer `download` fonksiyonuna geçerli bir `dest` parametresi

---

## FONKSİYON DETAYLARI

### download
**Ne yapar**: Verilen URL'den HTTPS protokolü kullanarak dosya indirir ve belirtilen hedef konuma kaydeder. İndirme işlemini bir Promise içinde gerçekleştirerek asenkron yapı sağlar.

**Nasıl yapar**: `https.get` ile verilen URL'ye HTTP GET isteği gönderir. Yanıt durum kodu 200 değilse hata fırlatır. Durum kodu 200 ise `fs.createWriteStream` ile hedef dosya için bir yazma akışı oluşturur ve gelen veriyi bu akışa yönlendirir (`pipe`). Dosya yazma işlemi tamamlandığında (`finish` olayı) akışı kapatıp Promise'i çözümler. Ağ hatası durumunda Promise reddedilir.

**Parametreler**:
- url: string — İndirilecek dosyanın HTTPS URL adresi
- dest: string — İndirilen dosyanın kaydedileceği dosya sistemi yolu

**Dönüş**: Bilinmiyor. Gövdede `new Promise` ile oluşturulan bir Promise döndürülmektedir; ancak bu Promise'in çözüm değeri belirtilmemiştir.

### sync
**Ne yapar**: Geliştirildi ancak detay üretilemedi.

---

## SABİTLER
- **fs** (call) — `require('fs')`
- **path** (call) — `require('path')`
- **https** (call) — `require('https')`
- **targetDir** (call) — `path.join(__dirname, '../../docs/reference/supabase')`
- **docsToFetch** (array) — `[
  {
    name: 'row-level-security.md',
    url: 'https://raw.githubuserc...`

---

## AST POINTERS

### [N1_NASIL] AST Pointer: scripts/docs/sync_supabase_docs.cjs::download
- **params**: `url`, `dest`
- **ic_degiskenler**:
  - `resolve` — Promise'in başarıyla tamamlandığında çağrılan callback fonksiyonu
  - `reject` — Promise'in hata ile reddedildiğinde çağrılan callback fonksiyonu
  - `res` — `https.get` ile yapılan HTTP isteğinin yanıt nesnesi; `res.statusCode` ile durum kodu kontrol edilir
  - `file` — `fs.createWriteStream(dest)` ile oluşturulan dosya yazma akışı; `dest` parametresindeki yola yazma işlemi yapar
  - `err` — `https.get` isteğinde oluşan hata nesnesi; `reject(err)` ile Promise reddedilir
- **Dönüş**: Promise — başarılı olursa `resolve()` ile çözülür, hata olursa `reject(err)` ile reddedilir

### [N2_NASIL] AST Pointer: scripts/docs/sync_supabase_docs.cjs::sync
- **params**: (parametre yok)
- **ic_degiskenler**:
  - `doc` — `docsToFetch` dizisi üzerinde `for...of` döngüsüyle iterasyon yapılan her bir doküman nesnesi; `doc.name` dosya adını, `doc.url` indirme URL'sini temsil eder
  - `dest` — `path.join(targetDir, doc.name)` ile oluşturulan tam hedef dosya yolu
  - `err` — `try/catch` bloğunda yakalanan hata nesnesi; `err.message` ile hata mesajı konsola yazdırılır
- **Dönüş**: yok — async fonksiyon olmasına rağmen açık bir `return` ifadesi içermez; yan etki olarak konsola log yazar ve `download` fonksiyonunu çağırarak dosyaları indirir

---

## NODE ID STANDARD

  file: scripts\docs\sync_supabase_docs.cjs
  function: scripts\docs\sync_supabase_docs.cjs::download
  function: scripts\docs\sync_supabase_docs.cjs::sync

---

## DISA AKTARILANLAR (EXPORTS)
  export: download
  export: sync