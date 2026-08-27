---
domain: general
source_type: doc
namespace_type: module
source_path: C:\tmp\ops-t165\supabase\functions\_shared\return_transitions.ts
skeleton_hash: da1baae346bd8120
entity_hashes:
  func:canCarrierTransition: 319f7f80006cd5c4
  func:isTerminalReturnStatus: b970cffbe2eea904
  overview: e4a16fc5919e804b
generated_at: 2026-08-27T07:09:18Z
---

## Genel Bakış
Bu modül, iade (return) süreçlerindeki durum geçişlerini doğrulayan paylaşımlı bir yardımcı modüldür. `_shared` klasöründe yer aldığı için birden fazla Supabase Edge Function tarafından ortak kullanılır. Bir iade durumunun süreç akışında son nokta olup olmadığını ve taşıyıcının belirli bir durumdan başka bir duruma geçiş yapıp yapamayacağını kontrol eder.

## Fonksiyon Grupları

### Durum Sınıflandırma
Bir iade durumunun terminal (son) durum olup olmadığını belirleyerek sürecin sonlanıp sonlanmadığını tespit eder.
- isTerminalReturnStatus

### Geçiş Kontrolü
Taşıyıcının mevcut iade durumundan hedef duruma geçişinin kurallara uygun olup olmadığını değerlendirir ve bir geçiş kararı (verdict) döndürür.
- canCarrierTransition

## Bağımlılıklar ve Mimari Notlar

- `TransitionVerdict` tipi bu modülde tanımlı değildir; dışarıdan sağlanan bir türdür.
- Fonksiyonlar arasındaki çağrı ilişkisi verilen kaynakta belirtilmemiştir; bilinmiyor.
- Modül `_shared` altında konumlandığından, iadeyle ilgili tüm Edge Function'lar tarafından kullanılması amaçlanmıştır.

---

## AXIOMS – Mimari Varsayımlar

Bu modül için özel aksiyom tanımlanmamıştır.

**Neden:** Fonksiyon gövdeleri verilmediği için, modülün doğru çalışması için gerekli koşullar belirlenememektedir. Yalnızca fonksiyon imzaları ve sabit adları mevcut olup, bu bilgilerden aksiyom üretimi mümkün değildir.

---

## FONKSİYON DETAYLARI

### isTerminalReturnStatus
**Ne yapar**: Verilen bir iade durumunun (return status) terminal (son) durum olup olmadığını kontrol eder. Terminal durumlar, artık başka bir duruma geçiş yapılamayacak noktaları ifade eder.

**Nasıl yapar**: `TERMINAL_RETURN_STATUSES` sabit dizisini `readonly string[]` tipine dönüştürerek, verilen `status` parametresinin bu dizide yer alıp almadığını `includes` metoduyla sorgular. Durum dizide varsa `true`, yoksa `false` döner.

**Parametreler**:
- status: string — Kontrol edilecek iade durumu değeri

**Dönüş**: boolean — Durum terminal bir durumsa `true`, değilse `false` döner.

### canCarrierTransition
**Ne yapar**: Geliştirildi ancak detay üretilemedi.

---

## TYPE ALIASES

### ReturnStatus
```typescript
type ReturnStatus = (typeof RETURN_STATUSES)[number]
```

### TransitionVerdict
```typescript
type TransitionVerdict = | { allowed: true }
  | { allowed: false; reason: 'terminal' | 'not_allowed' | 'unknown_current' | 'unknown_next' }
```

---

## SABİTLER
- **RETURN_STATUSES** (as_expression) — `[
  'requested',
  'approved',
  'rejected',
  'in_transit',
  'received...`
- **CARRIER_ALLOWED_TRANSITIONS** (object) — `{
  requested: ['cancelled'],
  approved: ['in_transit', 'cancelled'],
  i...`

---

## AST POINTERS

### [N1_NASIL] AST Pointer: _shared/return_transitions.ts::isTerminalReturnStatus
- **params**: `status` (string)
- **ic_degiskenler**:
  - `TERMINAL_RETURN_STATUSES` — `as readonly string[]` ile tür dönüşümü uygulanmış sabit dizi; `status` parametresinin bu dizide bulunup bulunmadığı kontrol edilir
- **Dönüş**: boolean — `status` terminal dönüş durumlarından biriyse `true`, değilse `false`

### [N2_NASIL] AST Pointer: _shared/return_transitions.ts::canCarrierTransition
- **params**: `current` (string), `next` (string)
- **ic_degiskenler**:
  - `current` — mevcut dönüş durumu; `next` ile aynı olup olmadığı kontrol edilir, `RETURN_STATUSES` dizisinde yer alıp almadığı denetlenir, `isTerminalReturnStatus` fonksiyonuna argüman olarak gönderilir, `CARRIER_ALLOWED_TRANSITIONS` nesnesinde anahtar olarak kullanılır
  - `next` — hedef dönüş durumu; `RETURN_STATUSES` dizisinde yer alıp almadığı denetlenir, `allowed` dizisinde `includes` ile aranır
  - `RETURN_STATUSES` — `as readonly string[]` ile tür dönüşümü uygulanmış sabit dizi; hem `current` hem `next` parametrelerinin geçerli birer dönüş durumu olup olmadığını denetlemek için kullanılır
  - `isTerminalReturnStatus(current)` — `current` parametresinin terminal bir dönüş durumu olup olmadığını döndüren fonksiyon çağrısı; terminal ise geçişe izin verilmez
  - `allowed` — `CARRIER_ALLOWED_TRANSITIONS[current as ReturnStatus]` ifadesiyle elde edilen dizi; `current` durumundan izin verilen hedef durumları içerir
  - `CARRIER_ALLOWED_TRANSITIONS` — `current` durumunu anahtar olarak alan nesne; her anahtarın değeri, o durumdan geçiş yapılabilecek hedef durumların dizisidir
- **Dönüş**: TransitionVerdict — `{ allowed: true }` veya `{ allowed: false, reason: string }` biçiminde nesne; `reason` değerleri: `'unknown_current'`, `'unknown_next'`, `'terminal'`, `'not_allowed'`

---

## NODE ID STANDARD

  file: supabase\functions\_shared\return_transitions.ts
  function: supabase\functions\_shared\return_transitions.ts::isTerminalReturnStatus
  function: supabase\functions\_shared\return_transitions.ts::canCarrierTransition

---

## DISA AKTARILANLAR (EXPORTS)
  export: CARRIER_ALLOWED_TRANSITIONS
  export: RETURN_STATUSES
  export: ReturnStatus
  export: TransitionVerdict
  export: canCarrierTransition
  export: isTerminalReturnStatus

## Tasarım Gerekçeleri (kaynaktan BİREBİR)

> Bu bölüm LLM tarafından **yazılmadı**; kaynaktaki işaretli bloklardan
> birebir kopyalandı. Özetlenmesi veya yeniden ifade edilmesi YASAKTIR —
> gerekçenin değeri tam olarak kelimelerindedir.


```text
NİÇİN VAR (T057-VH · 2026-08-15 operasyon döngüsü denetimi §3)

Denetim, iade statüsü için **üç çelişen otorite** buldu:

1. `src/lib/admin/returnStatusMachine.ts` — istemci geçiş tablosu (admin UI'ı üretir)
2. `returns-webhook/index.ts` — bir SIRALAMA (rank) haritası
3. Veritabanı — hiçbir geçiş trigger'ı yok; PostgREST'ten her geçiş mümkün

İkincisi bu dosyanın kapattığı yerdir. Eski kod statüleri sayısal bir sıraya diziyordu:

{ requested:0, approved:1, rejected:1, in_transit:2, received:3, refunded:4, cancelled:4 }
if (nextRank < curRank) -> engelle

Buradaki hata, **iade akışının bir sıra olmadığıdır.** `rejected` bir SONLANMA durumudur
ama sıralamada ortada (1) durur; dolayısıyla kargo firmasının gönderdiği bir `in_transit`
(2) mesajı "ilerleme" sayılır ve REDDEDİLMİŞ bir iadeyi yeniden canlandırır. Aynı şekilde
`refunded` ve `cancelled` eşit rütbededir (4 = 4) ve `4 < 4` yanlış olduğu için parası
iade edilmiş bir iade `cancelled`'a çevrilebilir. İkisi de ölçüldü, ikisi de guard'dan
geçiyordu.

Doğrusu bir sıra değil, AÇIK bir geçiş tablosudur; sonlanma durumları SOĞURUCUDUR:
oradan çıkış yoktur, ne ileri ne geri.

── Kargo firması neyi söyleyebilir, neyi söyleyemez ────────────────────────────
Bu tablo, istemci makinesinin İZİN VERDİKLERİNİN BİR ALT KÜMESİDİR ve bilinçli olarak
daha dardır. Fark tek bir yerde: `received -> refunded` istemcide vardır, burada YOKTUR.
Çünkü `refunded` bir PARA kararıdır; onu admin verir, kargo firması değil. Bir kargo
webhook'unun "iade edildi" diyebilmesi, dış bir sistemin ödeme durumunu ilan etmesi
demek olurdu. Bu ayrım INV-RETURN-1 testiyle sabitlenmiştir.
```
