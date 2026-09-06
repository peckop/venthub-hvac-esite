
# DESIGN-MARKA → OPS · 2026-09-05 · logo seti tamamlandı, iki hata düzeltildi

Recep prova sayfasında bir hata gördü ("temizlik ifade eden logoda 2 şerit beyaz görünürken
şimdi tek beyaz") ve başka eksik olup olmadığını sordu. **Haklıydı, ve arkasından iki hata
daha çıktı.** Üçü de kapandı.

## Hata 1 · Koyu zemin dizilimi yanlıştı — Recep'in bulduğu

Kılavuzdaki bütün logo örneklerini renk dizilimine göre saydım (44 kök):

| Dizilim | Kaç yerde |
|---|---|
| kiremit · lacivert · turkuaz · turkuaz | 11 (açık zemin) |
| **kiremit · beyaz · beyaz · turkuaz** | **14** (koyu zemin: 26 · 30 · 34 · 62 · 70 · 72 px) |
| lacivert ×4 · beyaz ×4 · turkuaz ×4 · siyah ×4 | tek renk sürümler |
| lacivert · lacivert · turkuaz · turkuaz | iki renk |

Koyu zeminde **ikinci VE üçüncü** dilim beyaza döner. Benim kuralım "koyu zeminde lacivert
dilimler beyaza döner" yazıyordu ve tek beyaz üretiyordu. Yalnız laciverti çevirmek yetmiyor:
turkuaz çift sıra hâlinde ağırlaşıyor, işaret dengesini kaybediyor. Kılavuz zaten doğrusunu
yapıyordu, kural metni eksik yazılmıştı — CLAUDE.md'de düzeltildi.

## Hata 2 · Prova sayfası eski dosyaları gösteriyordu

Adlandırmayı kılavuzun Bölüm D düzenine çevirdim (\`venthub-isaret-tamrenk.svg\`), ama prova
sayfası eski \`-14a3-\` adlarını çağırmaya devam ediyordu. Eski dosyalar silindi, sayfa yeniden
yazıldı. Recep'in gördüğü tek beyaz dilim aslında eski dosyaydı.

## Hata 3 · SVG kırpma dairesi iki kez ötelenmişti

\`clip-path\` bir öğenin **kendi** \`transform\`'undan da etkilenir. Kırpma dairesini mutlak
koordinatta tanımlayıp aynı \`<g>\`'ye \`translate\` verince daire iki kat ötelendi ve işaret
kırpma alanının dışına kaydı. Dikey kilit, uygulama simgesi, iki avatar ve paylaşım görseli
etkilenmişti. Daire artık işaretin kendi koordinatında tanımlı.

## Eksik olan ne varsa üretildi — 28 dosya

Kılavuzun Bölüm D'si 28 dosya adı sayıyordu; bende yalnız işaretin 7 sürümü vardı.
\`brand/logo/\` şimdi tam:

| Grup | Adet | Not |
|---|---|---|
| İşaret | 7 | viewBox 200×200 |
| Yatay kilit | 7 | işaret 40 · aralık 12 · wordmark 24 px / −0.03em |
| Dikey kilit | 7 | işaret 40 · aralık 10 · wordmark 17 px / −0.02em |
| Favicon | 4 | 16 · 32 (düz dilim, ızgaraya oturur) · 180 (tam profil) · 180-zemin (%69) |
| Avatar | 2 | 512×512, işaret %58, yarıçap yok |
| Paylaşım | 1 | 1200×630, güvenli alan 81 px, kiremit şerit sabit |

Bütün ölçüler kılavuzun kendi çizimlerinden **ölçülerek** alındı: kilit aralıkları ve wordmark
puntoları, favicon'un 16/32 px düz dilim adımları (yükseklik 3/adım 4 ve 6/adım 8), uygulama
simgesinin %69'u, avatarın %58'i, paylaşım görselinin 74 px güvenli alanı (1200'e ölçeklenince
81 px). Hiçbiri yeniden yorumlanmadı.

**Wordmark yola çevrilmedi.** Kilitlerde \`<text>\` öğesi: Archivo 700. Archivo yüklü olmayan
ortamda yedek yazı tipine düşer — kilidi kullanan yer Archivo'yu da yüklemek zorundadır.
Gerekçe: yola çevirmek "VentHub" yazım kuralını denetlenemez hâle getirirdi.

Prova sayfası: \`logo-svg-provasi.html\` — açık/koyu zemin, iki kilit dizilimi, favicon, avatar,
paylaşım görseli, ölçek satırı, ve koyu zeminde yanlış sürümün nasıl göründüğü.

## Açık kalan tek karar sorusu

Ana çizimlerde (40 · 72 · 90 · 200 px) dilimler bitişik; kılavuzun 16 ve 32 px örnekleri 1–2 px
aralık bırakıyor. Favicon dosyaları bu aralığı uyguluyor, işaret ve kilit dosyaları ana çizimi
izliyor. Başka bir boyda aralık istenirse söyleyin — çizim hatası değil, karar sorusu.

## Kılavuz Bölüm D'de sayılan ama üretilmeyen üç dosya

\`venthub-kanit-kenar-200.svg\` · \`venthub-kanit-tekrenk.svg\` · \`venthub-yanlis-kullanim.svg\`
— bunlar **kanıt/belgeleme sayfaları**, kullanılacak varlık değil. Prova sayfası aynı işi
yapıyor (koyu zeminde yanlış sürüm örneği dahil). Ayrı SVG olarak istenirse üretirim.

## Durum

Bu projede girdi bekleyen iş kalmadı. Sıra: **DS projesinde Create design system**
(\`31b0824c-8d7e-4a4c-94c7-8c094a1c62b7\`). Logo seti artık DS'e girmeye hazır.

**Kullanılan \`/\` yeteneği:** bu turda yok (SVG üretimi ve ölçüm).

— DESIGN-MARKA (Opus) 2026-09-05

