# Ölçüm defteri: PostCompact kancası — çıktısı compact sonrası bağlama giriyor mu

Sahibi: ARAÇ · Son doğrulama: 2026-10-14 · Kaynak: OPS emri 12 Ekim (REC-529 madde 2), kart ARC-119
Hüküm: **HAYIR, PostCompact yazılmaz.** Compact dönüşünde bağlam enjeksiyonu için doğru yol zaten `SessionStart` (matcher `compact`), bizde `session-board.cjs`.

## Ne ölçüldü, nasıl

| Soru | Cevap | Kanıt |
|---|---|---|
| PostCompact olayı var mı | Evet; "compact bittikten sonra" çalışır, matcher `manual` ya da `auto` | code.claude.com/docs/en/hooks (14 Ekim, ham sayfa metne çevrildi) |
| Girdi alanları | ortak alanlar + `trigger` + `compact_summary` (compact'in ürettiği özet) | aynı belge, örnek JSON |
| Karar kontrolü | Yok: "compaction sonucunu etkileyemez"; `systemMessage` ve `continue` yok sayılır | aynı belge |
| Çıktısı bağlama giriyor mu | Belgede açık cümle YOK. Stdout'un bağlama girdiği olaylar sayılırken (UserPromptSubmit, UserPromptExpansion, SessionStart, PostModelSwitch) PostCompact listede değil | belge; ÇIKARIM, açık ifade değil |
| Compact dönüşünde bağlam veren yol | `SessionStart` matcher `compact`; stdout bağlama girer | belge + bizim kanca bunu 14 Ekim'de zaten yapıyor |

## Sınırlar (dürüst)

- Karttaki "yalıtılmış deneme" YAPILMADI: PostCompact kancasını denemek canlı ayara kayıt ve gerçek bir compact ister. Hüküm belge okumasına ve istisna listesinden çıkarıma dayanır; olay belgede "çıktı bağlama girer" diye hiçbir yerde geçmiyor.
- Belge 10.000 karakter tavanını söylüyor (aşarsa dosya + 2.000 karakter önizleme); bizim kanca zaten daha dar: toplam 9.000, durum bloğu 4.500 karakter, kırpma %40 baş + %60 son.

## Kırpma sorunu için asıl kök sebep

Kartın amacı "durum bloğu kırpıldı geldi" şikâyetiydi. PostCompact bunu çözmez (girişi yok). Çözüm yeri SessionStart kolu: blok tavanı, kısa biçim ve "ayrıntı dosyada" işareti (hafızadaki "Compact = /compact metni" kararıyla uyumlu: ayrıntı dosyada, metin yalnız işaret). Ayrı iş: ARC-131 (compact sistemi).

## Yan not (ENOENT)

Aynı araştırmada compact dönüşünde "son konuşma dökümü YOK" uyarısının kökü bulundu: döküm yazıcı hedef klasörü oluşturmuyordu (pencere worktree'sinde `memory/` yok). Düzeltildi: #1930 (d4ad7d4b8).
