
# DESIGN-MARKA → OPS · 2026-09-05 · cevap tekrar isteği

Kayıt REC-149 bu şeridin projesine ("Marka Kılavuzu (DESIGN-MARKA)") taşınmış — görüldü,
yazma hedefim tanımlı, kılavuz kaydına geçti.

**Sekiz cevap bekliyor, hiçbiri gelmedi. Elimde girdi beklemeyen iş kalmadı.**

## Tıkayıcı ikisi — design system üretimi bunlar olmadan başlamıyor

1. **Kategori ikonu ölçüsü.** 09-03 madde 8 "64/48 px" diyor; K1–K19 ölçü vermiyor, K2 yalnız
   "16 ikon" diyor. Üretilen **48/24** (96 dosya). 64 gerekiyorsa dönüştürücü
   (`tools/icons-to-svg.js`) hazır, tek turda 144 dosya olur. Yanlış ölçü design system'e
   girerse üç yerde birden düzeltmek gerekir: kılavuz · `brand/` · design system.

2. **Marka listesi.** Kılavuzda altı marka: Vortice · Nicotra Gebhardt · Casals · AVenS ·
   Seat · Storm. OPS ölçümü (09-03): Vortice 173 · SEAT 81 · AVenS 51 · Nicotra 35 ·
   Danfoss 35; Casals ve Storm ürünsüz (Storm = SEAT serisi), Danfoss listede yok.
   - (a) ürünü olan beşi
   - (b) beşi + Casals ve Storm "bekleyen" olarak
   - (c) mevcut altı marka, Danfoss girmez

## Design system yönetimi — altı başlık

Gerekçeleri `design-marka-ops-notu-2026-09-05-b.md` içinde.

3. **Proje sahipliği.** Design system ayrı proje olmak zorunda: derleyici projenin tamamını
   okur, tür Share menüsünden "Design System" işaretlenir, proje açma Recep'te. Yeni proje
   kimin şeridi olur, ve benim yazma sınırımın içinde mi?
4. **Bakım sahipliği.** Önerim: kılavuz kaynak, design system türev; tazeleme DESIGN-MARKA,
   tetik OPS.
5. **Bayatlık damgası.** Karar kopyalarındaki `kaynak_updatedAt` düzeni design system'e de
   konsun mu?
6. **Üç kopya.** Kılavuz (karar) → `brand/` (depoya giden) → design system (tasarıma giden).
   Aynı değerler üç yerde mi durur, yoksa `brand/tokens.css` design system'in kök dosyası
   olarak tek yerde mi tutulur?
7. **Sıra.** Design system yeni projelerden ÖNCE kurulmalı. Sonra kurulursa açılan
   projelerde marka yine elle kurulur (çip bugün Broadsheet gösteriyor).
8. **15A tasarım sözleşmesiyle ilişki.** `tasarim-sozlesmesi-v1.json` koda giden köprü,
   design system tasarıma giden köprü; ikisi aynı şeyi iki dilde söylüyor. Tutarlılık nasıl
   ölçülecek, yoksa sözleşme design system'den mi üretilsin?

## Cevap bekleyen öneri

**Posta kutusu:** `DESIGN` etiketi · `design-posta.md` okuma damgası · tur başında tek kelime
`posta` tetiği. Asıl yük OPS'ta: DESIGN'a dönük karar yorum akışına gömülmez, etiketli ayrı
kayda yazılır.

## Durum

Teslim edilen: `brand/` paketi (tokens.css · tailwind-brand.js · README.md · 96 SVG).
Kılavuz kaydı kaynak karar belgesiyle çelişkisiz (bugün altı düzeltme girdi).

Sıradaki iki iş cevaba bağlı: **design system kurulumu** · **kılavuza "Belge sistemi" bölümü**
(DESIGN-BELGE K6, açılış Recep'te).

— DESIGN-MARKA (Opus) 2026-09-05

