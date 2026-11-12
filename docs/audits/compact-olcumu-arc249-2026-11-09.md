# Otomatik compact ölçümü (ARC-249, ARC-77 kalanı) — 9 Kasım 2026

Durum: ölçüm. Cetvel: `docs/standards/fleet-mechanism-standard.md` (compact dönüşü), karar 321 (`CLAUDE_AUTOCOMPACT_PCT_OVERRIDE`), `docs/audits/compact-esik-olcumu-2026-11-09.md` (ARC-192, aynı konu). Kaynak: `~/.claude/projects/*/*.jsonl` içindeki `compact_boundary` satırları (alanlar: `trigger`, `preTokens`, `postTokens`, `durationMs`, `preservedSegment`) ve her olaydan sonraki ilk asistan `usage` değeri. Ölçüm betikleri depoda değil (oturum geçici klasöründe); yöntem aşağıda yazılı, yeniden koşulabilir.

## Bulgular

**1. Compact sıklığı ve pencere dağılımı (8 Kasım 00:00 UTC sonrası, 39 olay, hepsi `auto`).**

| Pencere | Olay | Aralıklar (dk) |
|---|---|---|
| blog | 13 | 82, 173, 98, 120, 53, 44, 67, 117, 62, 53, 160 |
| ops | 9 | 60, 51, 43, 167, 170, 40, 139, 128 |
| araç | 5 | 517, 83, 119 (+ 9 Kasım'da 1) |
| geo-seo | 3 | 387, 138 |
| altyapı | 2 | 134 |
| harita | 2 | 216 |
| katalog | 2 | 51 |
| diğer (2 çalışma kopyası + 1 ana dizin) | 3 | 176 (bir kopyada) |

Saatlik yoğunluk 8 Kasım 06:00–21:00 UTC arasında 33 olay, saatte ortalama 2,1 olay (tüm pencereler toplamı; pencere başına saatte 0,2–0,4). Yoğun iki pencerede (blog, ops) en kısa aralıklar 40–44 dk; ARC-249 bitiş ölçüsü olan "yoğun işte aralık ≥45 dk" 28 aralığın 25'inde tutuyor; tutmayan üçü: blog 44 dk, ops 43 ve 40 dk.

**2. Eşik teke inmiş.** 39 olayın 37'si 489–498k aralığında (medyan 490,6k). Tek istisnalar: araç penceresinde 236k (8 Kasım 23:31) ve 397k (9 Kasım 03:31), blog'da 358k ve 474k. Bunlardan yalnız araç penceresindeki ikisinin `durationMs` değeri 26 ve 77 ms (diğer tüm olaylarda 25–98 sn); `compactMetadata` içinde bazı olaylarda `precomputed` alanı var, bu iki olayın nedenini ayırt etmedim. Blog'daki 358k ve 474k için süre bakılmadı.

**3. Kesmeyi kim yapıyor: Claude Code'un kendisi, eklenti değil (sınırlı kanıt).** `compact_boundary` satırı `trigger: auto` ile Claude Code çalışma zamanı tarafından yazılıyor. 13 Ekim–1 Kasım 14:16 arasında iki kayıt türü var: ~1 sn süren, `preservedSegment` olmayan, `postTokens` 60–135k kayıt (eski "özetsiz kesme", ARC-77'nin gördüğü), ardından gelen 28–64 sn süren, `postTokens` ~27k kayıt (gerçek özet). 1 Kasım 15:09'dan itibaren yalnız ikinci tür var: `durationMs` 25–98 sn, `postTokens` 41–51k, `preservedSegment` dolu. Yani özetsiz kesme 1 Kasım'dan beri görülmüyor. Geçiş anı ile fast-jev eklentisinin kapatılması (kayıtta 16:41) arasında 90 dk fark var ve Claude Code sürümü o günler sabit (2.1.309); geçişi kapatmaya bağlamak için kanıtım yok, açıklayamadım. Claude Code sürüm notları bu ölçümde okunmadı.

**4. Compact sonrası ilk model çağrısı (39 ölçümün hepsinde).** İlk çağrının toplam girdisi medyan 164k (en az 149k, en çok 198k). Bunun `postTokens`'ı medyan ~45k (özet + korunan bölüm); aradaki ~115k, her çağrıda yeniden gönderilen sabit taban: sistem istemi, araç şemaları, MCP talimatları, CLAUDE.md ve kural dosyaları, SessionStart kancası çıktısı. Ops penceresi en yüksek (175–198k; MCP/araç listesi en geniş pencere). `yeni-yazılan` önbellek 93–156k, `okunan` 0–65k: compact sonrası önbellek büyük ölçüde yeniden yazılıyor. Taban kalemlerinin tek tek kırılımı bu ölçümde YOK (ayrı bir sistem istemi dökümü gerekir); yalnız toplam doğrulandı.

**5. Ara mesaj kaybı (34 compact, 8 Kasım sonrası, her pencere).** Yöntem: her özet mesajından önceki 120 dakikadaki kullanıcı tarafı mesajları (Recep'in yazdıkları ve pencereler arası `cross-session-message` iletileri) toplandı; her mesajın kart/PR numarası ve dosya yolu gibi kimlikleri özet metninde aranıyor. Kelime örtüşmesi kullanılmadı (özet kısaltıyor, alıntılamıyor; ilk denemede %87 sahte "kayıp" verdi).
- Toplam 227 mesaj, 208'i kimlik taşıyor. 190'ının en az bir kimliği özette var. 18'inde yok; 4'ü yalnız `CLAUDE.md` adı taşıyan sistem metni (sahte), 14'ü gerçek aday: altyapı 1, araç 2 (SEO-98 ve #2408; ARC-280), blog 8, katalog 2 (KTL-82, KTL-76), OPS 1 (`linear-okundu.cjs`, otomatik uyarı).
- Bu 14, "özette yok" demektir, "kayıp" demek değil: özet açık işleri yazar, o sırada kapanmış kart/PR'ı yazmayabilir. Tek tek kapanış/devam kanıtı aranmadı; sonuç üst sınırdır.
- Recep'in kendi yazdığı mesaj: pencerelerde yalnız OPS'ta 1 tane (8 Kasım 06:47, "ERF analizini tekrar yapacak mıyız" sorusu). Özet bunu taşımıyor, ama (a) OPS compact'tan 1 saat önce cevaplamış ve ölçüm defterine yazmış, (b) açılış kancası Recep'in son mesajlarını compact sonrası dökümde AYNEN geri veriyor (dökümde `### Recep (…)` blokları görüldü). Yani Recep ara mesajı kaybı bu örnekte 0.
- Sınır: yalnız 1 doğrudan Recep mesajı vardı; "kayıp 0" bu tek örnekle ve kancanın varlığıyla desteklenir, istatistiksel güven vermez. Pencereler arası mesajlarda kancanın aynen geri verme güvencesi yok; 14 adayın gerçek kayıp olup olmadığı açık.

## Hüküm ve öneri

- Bitiş ölçüsünün aralık yarısı büyük ölçüde sağlanıyor: 28 aralığın 25'i ≥45 dk; kalan üçü 40–44 dk (blog ve ops). Eşik 490k'da sabit ve bir kez daha düşürmek aralığı kısaltır; yükseltmek (ör. 600k) pencere sınırına yaklaşır. Eşik/ayar değişikliği Recep kararıdır; bu belge değişiklik önermiyor.
- Süreklilik kaynağı: özetsiz kesme 1 Kasım'dan beri yok, gerçek özet 25–98 sn sürüyor ve `postTokens` 45k kadar bilgi taşıyor. Durum dosyası enjeksiyonu (ARC-69) bu özetin üstüne ek kaynak; ikisinin çakışması (aynı bilginin iki kez yüklenmesi) ölçülmedi.
- Taban ~115k her pencerede her compact'tan sonra yeniden yazılıyor. Bunu küçültmek (MCP talimat/araç listesi, kural dosyaları) compact başına yeniden yazılan önbelleği ve ilk çağrı maliyetini düşürür; kalem kırılımı çıkmadan öneri yazılamaz → ayrı ölçüm.

## Ölçülmeyenler

Pencereler arası 14 aday mesajın gerçek kayıp olup olmadığı (madde 5); taban kalemlerinin kırılımı (madde 4); 1 Kasım 15:09 geçişinin nedeni (madde 3); 25 Ekim öncesi dökümler; compact/saat için ayar değişikliği öncesi–sonrası karşılaştırması (eşik değişmedi). Salt-okuma ölçümdür; yerel dökümler tek makineye aittir.
