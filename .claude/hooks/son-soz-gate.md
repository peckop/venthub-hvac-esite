---
domain: general
source_type: doc
namespace_type: module
source_path: C:\tmp\vh-altyapi-851\.claude\hooks\son-soz-gate.cjs
skeleton_hash: e7e92f2d8f65ebd3
entity_hashes:
  overview: f404047b54d190b2
generated_at: 2026-08-27T17:58:29Z
---

## Genel Bakış

Bu dosya, `.claude\hooks\` dizininde yer alan bir Claude hook betiğidir. Dosya `fs` modülünü içe aktarır; ancak tanımlı herhangi bir fonksiyon içermez — tüm işlevsellik doğrudan modül seviyesindeki betik ifadeleriyle gerçekleştirilir. Dosya adından anlaşılacağı üzere, bir "son söz" (son-soz) kontrol/gate mekanizması olarak çalışması amaçlanmıştır.

## Fonksiyon Grupları

Bu dosyada fonksiyon tanımlanmadığından fonksiyon gruplandırması yapılmaz. Dosya yalnızca modül seviyesindeki betik ifadelerinden oluşur ve `fs` modülü aracılığıyla dosya sistemi işlemlerini kullanır.

---

## AXIOMS – Mimari Varsayımlar

Bu modül için fonksiyon gövdesi verilmediğinden (fonksiyon imzaları boş), fonksiyon gövdesinden türetilen aksiyom üretilememektedir.

Modül sabitleri yalnızca `fs` modülünün çağrıldığını göstermektedir; ancak bu çağrının hangi dosya sistemi işlemi için yapıldığı, hangi dosya yollarının kullanıldığı veya hangi koşullar altında çağrıldığı bilinmemektedir.

**Bilinen tek durum:** Bu modül bir CommonJS modülüdür (.cjs uzantısı) ve `fs` modülüne çağrı yapmaktadır. Bunun ötesinde mimari varsayım üretilecek kaynak bilgi mevcut değildir.

---

## FONKSİYON DETAYLARI

---

## SABİTLER
- **fs** (call) — `require('fs')`

---

## AST POINTERS

### [N1_NASIL] AST Pointer: son-soz-gate.cjs::(anonim ok fonksiyonu)
- **params**: (parametre yok — dışarıdan `raw`, `fs`, `process` erişilir)
- **ic_degiskenler**:
  - `input` — `JSON.parse(raw)` sonucu elde edilen hook girdi objesi; `stop_hook_active` ve `transcript_path` alanlarına erişilir
  - `tp` — `input.transcript_path` değeri; transkript dosya yolu, `fs.existsSync` ile varlığı kontrol edilir
  - `satirlar` — `fs.readFileSync(tp, 'utf8')` ile okunan dosya içeriğinin `.trim().split('\n').slice(-400)` ile elde edilen son 400 satırı
  - `kayitlar` — `satirlar` dizisindeki her satırın `JSON.parse` ile ayrıştırılmasıyla oluşan kayıt dizisi; parse hataları yutulur
  - `insanMesaji` — ok fonksiyonu; bir kaydın gerçek insan mesajı olup olmadığını kontrol eder (parametre: `k`)
  - `sonInsan` — `kayitlar` dizisinde `insanMesaji` koşulunu sağlayan son kaydın indeksi; bulunamazsa `-1` kalır
  - `sonAsistan` — `sonInsan` indeksinden sonra dizinin sonundan geriye doğru taranarak bulunan ilk `type === 'assistant'` kaydı; bulunamazsa `null` kalır
  - `icerik` — `sonAsistan.message.content` değeri; yoksa boş dizi `[]` atanır
  - `sonBlok` — `icerik` dizisi ise `icerik[icerik.length - 1]`; dizi değilse `null`
  - `metinle_bitti` — `sonBlok` varsa, `sonBlok.type === 'text'` ve `String(sonBlok.text || '').trim().length >= 50` koşullarının her ikisi doğruysa `true`; aksi halde `false`
- **Dönüş**: yok (`process.exit(0)` ile çıkılır; `metinle_bitti` false ise `console.error` ile uyarı yazdırıp `process.exit(2)` ile çıkılır)

---

### [N2_NASIL] AST Pointer: son-soz-gate.cjs::insanMesaji (ok fonksiyonu)
- **params**: `k` — transkript kaydı objesi
- **ic_degiskenler**:
  - `c` — `k.message && k.message.content` değeri; mesaj içeriği, `typeof` ile türü kontrol edilir
- **Dönüş**: boolean — `k` kaydının gerçek bir insan mesajı olup olmadığını belirtir; `k.type !== 'user'` veya `k.isMeta` true ise `false`; `c` string ise `<local-command-caveat>` ile başlamıyor ve `[SYSTEM NOTIFICATION` içermiyorsa `true`; `c` dizi ise en az bir `type === 'text'` bloğu varsa ve hiç `type === 'tool_result'` bloğu yoksa `true`; diğer durumlarda `false`

---

## NODE ID STANDARD

  file: .claude\hooks\son-soz-gate.cjs