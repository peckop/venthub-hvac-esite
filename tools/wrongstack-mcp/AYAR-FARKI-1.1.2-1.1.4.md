# WrongStack ayar farkı: 1.1.2 → 1.1.4 ve bizim değerlerimiz

> Kayıt: ARC-177 · Ölçüm: 2026-10-18 · Yöntem: npm kaydından iki sürümün paketleri `npm pack --ignore-scripts`
> ile ayrı klasörlere indirildi ve `diff` ile karşılaştırıldı; kurulu kopyalara dokunulmadı.
> Cetvel: yok (bu belge ayar cetvelinin ilk taslağıdır). Ayar değiştirme bu belgenin işi değildir;
> öneriler OPS onayına gider.

## 1 · Sürümler arası gerçek farklar

1.1.4 sarmalayıcıları bir önceki sürüme göre aşağıdaki ortak paketlere bağlanıyor:
`kanban` 1.1.0 → 1.1.2, `mcp`/`core`/`tools`/`primitives` 1.1.0 → 1.1.2. `sage` paketinde ve
`sage-mcp` sarmalayıcısında yalnız sürüm numarası değişti (davranış aynı).

| Paket | Değişiklik | Bizi etkiler mi |
|---|---|---|
| kanban-mcp | `list_boards` varsayılan sınırı 20 ve arşivli panolar gelmez; `search_tasks` varsayılan sınırı 10. Sonuç iletisi toplam sayıyı söyler, `limit` verilirse sınır kalkar | Evet. MCP üzerinden "kaç açık kart var" sayan her çağrı `limit` vermezse eksik sayar |
| mailbox-mcp | `mailbox_read` varsayılan 20 ileti, en yeniler önce | Olabilir. Okunmamış ileti 20'den çoksa eskiler görünmez; `posta-kutusu.cjs` sarmalayıcımızın bunu nasıl karşıladığı ölçülmedi |
| kanban (kütüphane) | Pano sınır kurallarında Windows'ta büyük-küçük harf katlama | Pozitif; sınır kuralı kullanmıyoruz |
| mcp | HTTP bağlama denetimi `127.` ile başlayan her adı değil, gerçek IPv4'ü kabul eder | Yok (yalnız stdio kullanıyoruz) |
| primitives | `-password` bayrağı kayıtlarda maskelenir | Yok, güvenlik iyileştirmesi |
| tüm MCP sarmalayıcıları | HTTP jetonu için `WRONGSTACK_MCP_TOKEN` ortam değişkeni tercih edilir | Yok (HTTP kullanmıyoruz) |
| core, tools | Paketlenmiş dosyalarda 400-600 satırlık fark; WrongStack'in kendi ajan ürününü (tarayıcı, bash araçları) ilgilendirir | Okunmadı; MCP sunucularımızın kullandığı kısmı ayırmak için kaynak gerekir |

## 2 · Bizim değerler ve sapmalar

| Ayar | Bizde | Varsayılan ya da önerilen | Sapma | Öneri |
|---|---|---|---|---|
| sage `--writable` | açık | salt okuma | bilerek | kalsın |
| kanban `--writable`, `--destructive` | writable açık, destructive kapalı | aynı | yok | kalsın |
| posta | kendi sarmalayıcı (`posta-kutusu.cjs`) | `--writable` | bilerek | kalsın |
| kod dizini `--writable` | KAPALI (önceki karar: "gerek yok, CodeGraph asıl araç", hafıza defteri `olcum/wrongstack-ozellik-envanteri.md`, REC-345/REC-391 C1) | salt okuma; `codebase_index` aracı yenileme için `--writable` ister | **dizin 17 Eylül'den beri güncellenmemiş (31 gün); 1521 dosya dizinde, git'te 2215 kod dosyası. Sunucunun kendi yönergesi ajanlara "grep'ten önce bunu kullan" diyor; bayat dizin yanlış yola sokar** | karar bekleyen REC-391 C1'e bağla (bkz. 3) |
| sage önerme kipi (`proposals: true`) | yok, tam yetki | `memory_candidates` yalnız listele ve öner | **açılmamış anahtar**; defterde "Değerlendir, kayıt gerekir" duruyor, kayıt açılmamış | pencerelerin yanlış hafıza yazmasını azaltır; ayrı kartla ölçülür |
| `WRONGSTACK_KANBAN_VERIFIER_COMMANDS` | `+gh` | boş (yalnız izin listesindeki komutlar) | bilerek | kalsın; `grep` listede yok, kanıtta `file_matches` kullan |
| pano `wipLimit` | 0 (sınırsız) | yönetilen kipte 5 | bilerek | yönetilen pano pilotuyla (ARC-168) birlikte karar ver |
| yönetilen yaşam döngüsü | kapalı | pano başına açılır | bilerek | pilot, yalıtılmış kopyada |
| atomicity değerlendirmesi | kuralla çalışıyor, çoğu karta "borderline" | kapat ya da uyar | **gürültü** | kapatmayı öner |
| kanban `search_tasks` / `list_boards` sınırı | sınırsız varsayıyoruz | 10 / 20 | **sayım betikleri eksik sayar** | çağrılara açık `limit` ver |

## 3 · Öneriler (OPS onayına)

1. Kod dizini için iki yoldan biri seçilmeli, ikisi de olmadan bayat dizin ajanları yanıltır:
   (a) dizini tut: tek seferlik artımlı yenilemeyi yalıtılmış çalıştırmayla dene, sonra düzenli
   yenileme yolu kur (`--writable` her pencereye tam yeniden dizinleme tetikleme gücü verir, o
   yüzden pencerelere açmak önerilmez); (b) dizini bırak: `.mcp.json` girişini kaldır, CodeGraph
   tek araç kalsın. Önerim (b)'yi REC-345 kıyası belirlesin; kıyas bitene kadar giriş durur ama
   yönergesi "önce bunu kullan" dediği için ajanların bayat sonuca güvenmemesi hatırlatılır.
2. Panoyu sayan her çağrıya `limit` ver (5N1K eksik sayımı ARC-174, kokpit uyum paneli ARC-153).
3. Atomicity değerlendirmesini kapat; ayar kartı ayrı açılır.
4. `wipLimit` ve yönetilen yaşam döngüsü kararını ARC-168 pilotuna bağla.
5. 1.1.4 sonrası çıkan sürümler (1.1.5, 1.1.7) için aynı karşılaştırma yapılmadan yükseltme önerilmez.

## 4 · 1.1.4 → 1.1.7 (18 Ekim ölçümü, OPS ek isteği)

Aynı yöntem: 1.1.7 paketleri `npm pack --ignore-scripts` ile indirilip 1.1.4 kümesiyle `diff` edildi.

| Paket | Fark | Okuma |
|---|---|---|
| sage-mcp, kanban-mcp, mailbox-mcp, codebase-index-mcp (sarmalayıcılar) | 6-12 satır, yalnız sürüm numarası | davranış aynı |
| kanban kütüphanesi (1.1.2 → 1.1.7) | 10 dosya, yaklaşık 2200 satır | ağırlıkla yeniden düzenleme: pano normalleştirme, doğrulayıcı komut çözümü ve masaüstü vitest çözümü ayrı modüllere taşınmış; anlamı aynı görünüyor (`normalizeBoard` sıra ve varsayılan doldurma, `resolveConfiguredExecutable` yerel bin çözümü) |
| sage kütüphanesi (1.1.2 → 1.1.7) | 4 dosya, yaklaşık 1000 satır | arama dosyası bölünmüş; hafıza geri bildirimi aracında eski daemon uyarı iletisi eklenmiş |
| mcp, primitives | 60 ve 8 satır | küçük |
| core, tools | 278 ve 154 dosya | paketlenmiş parça adları değişmiş; okunmadı |

Hüküm: aradığımız bir özellik (sınır, ayar, anahtar) çıkmadı; yükseltmenin kazancı gösterilemiyor, bedeli bir pencere
kapatma penceresi (yaklaşık 10 dakika) ve yeni yama doğrulaması. Önerim: 1.1.4'te kal; core ve tools farkı okunmadığı
için "güvenli" denmez. Sürüm notu pakette yok, davranış testi koşulmadı.

## 5 · Ölçülmeyenler

- core ve tools paketlerindeki değişikliklerin MCP sunucularımızı ne kadar etkilediği.
- `mailbox_read` 20 ileti sınırının `posta-kutusu.cjs` ile birlikte davranışı.
- Kod dizini daemon'unun kendiliğinden yenilenip yenilenmediği (son dizinleme tarihine bakarak "yenilenmiyor" diyoruz, nedenini ölçmedik).
