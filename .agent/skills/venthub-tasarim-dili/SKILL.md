---
name: venthub-tasarim-dili
description: 'VentHub''in KENDI tasarim dili: Kararlar belgelerinden K numarali sert
  kurallar, tek kaynak adresleri, kare kabul olcum satiri ve OPS->Design emir/cevap
  kalibi. Vitrin/menu/urun sayfasi/kurumsal belge tasarimi, Claude Design emri yazma
  ve kare kabulu icin. Yabanci stil recetesi ya da gorsel uretim DEGILDIR.'
category: guards
metadata:
  triggers:
  - tasarim dili
  - vitrin tasarimi
  - menu tasarimi
  - urun sayfasi tasarimi
  - kurumsal belge tasarimi
  - Claude Design emri
  - kare kabul olcumu
  - design system kurali
  inputs:
  - docs/proje-takip/linear/kararlar-*.md
  - src/design-system/tokens.js
  outputs:
  - kare kabul/ret hukmu + olcum satiri
  - ops-emir-<tarih>-<n>-<proje>.md
  recovery:
    Kararlar ayna BAYAT: python scripts/nlm/kararlar_disa_aktar.py --tarih <bugun>
  sahip: OPS (Kararlar'i OPS tutar; Design seritleri yazar, OPS olcer ve kabul eder)
  kaynak: REC-173 adim 3 (2026-09-06, Recep: tasarimlar bizim tarafimizda koruma altina alinmali; yarin baska bir AI araci kullanilabilir)
---

# VentHub tasarım dili — bizim skill'imiz

> 2026-09-06'da yazıldı. Kaynağı **Kararlar belgeleri**dir; buradaki her kural oradaki bir K numarasına bağlıdır.
> Çelişirse Kararlar kazanır. Kararlar'da olmayan bir kural buraya eklenmez (kural 1: karar yazılmadan verilmiş sayılmaz).
> Araçtan bağımsızdır: Claude Code, Antigravity ya da başka bir AI kod aracı aynı dosyayı okur.

## When to Use
- Vitrin, menü, ürün sayfası, liste/karşılaştırma, kurumsal belge (kartvizit, e-posta, föy) tasarımı yapılırken ya da incelenirken.
- Claude Design projelerine (MENU · BELGE · LOGO/MARKA · DS) emir yazarken, gelen kareyi kabul/ret ederken.
- "Bu renk / yarıçap / gölge / kiremit / kip anahtarı doğru mu" sorusunda.
- KULLANMA: kod refactor, git, test koşumu, veri tabanı işi, görsel üretimi (yetenek yok), hazır tema arayışı.

## 1. Tek kaynaklar (önce bunlara bak)

| Ne | Nerede | Not |
|---|---|---|
| Vitrin/menü/ürün sayfası kararları (K1–K39) | Linear belge "Kararlar — Vitrin 15A" `061e6113-0f57-4296-a327-4e0f1a07cd76`; ayna `docs/proje-takip/linear/kararlar-vitrin-15a-<tarih>.md` | Ayna gün kapanışında yenilenir; eski tarihli ayna BAYAT (recovery komutu) |
| Kurumsal belge kararları | Linear belge "Kararlar — Kurumsal Belgeler" `9e95d258-98a2-4c51-9a2d-40576c87a7bf`; ayna `kararlar-kurumsal-belgeler-<tarih>.md` | |
| Katalog / ürün verisi kararları (K1–K8: teknik alan, aile föyü) | Linear belge "Kararlar — Katalog ve Ürün Verisi" `935079bf-b265-49d2-854a-a334abea07af`; ayna `kararlar-katalog-<tarih>.md` | Vitrinde görünen her teknik değer buradan |
| Tasarım token'ları | `src/design-system/tokens.js` + Tailwind ayarı | Kural 8: arbitrary Tailwind değeri YASAK; renk HEX değil CSS custom property (HSL); a11y `focus-visible:` |
| Claude Design projeleri (kum havuzu; kod değil) | MENU `be615496…` · BELGE `4e491d28…` · LOGO/MARKA `670f9f75…` · DS `31b0824c…` | Onaylanan tasarım koda geçince gerçek değer depodadır (REC-173 günlük arşiv) |
| Marka kılavuzu | LOGO projesinde `1 Venthub Marka Kilavuzu.dc.html` (K32–K35: bölüm F5–F8) + `brand/logo/*.svg` | Logo elle çizilmez (K23) |

## 2. Sert kurallar (K numarasıyla; ihlal = kare RET)

- **K21 · Her şey veriden.** Karede görünen ürün adı, kod, sayı gerçek veridir (Supabase'den ölçülmüş). Olmayan ürün çizilmez ("SEAT 40" dersi, vaat bütünlüğü). Örnek ürün değişirse kimlik + çip + anlatım + eksen aynı turda değişir.
- **K7 · Teknik satır kaynaklı.** Teknik tabloya yalnız `technical_specs`'te olan alan girer; şemada olmayan bilgi (malzeme gibi) teknik satır olmaz, anlatımda kalır ve o da kaynağa bağlanır.
- **K18a · Değerlendirilemeyen gizlenmez.** Eğrisi/verisi olmayan ürün "değerlendirilemedi" hükmüyle görünür; "uymaz" denmez, saklanmaz.
- **K5 · Kiremit ve düğme.** Kartta tek dolu kiremit yok; kart eylemleri çerçeveli. Kiremit sayfada tek (ana eylem).
- **K37-c · Kip anahtarı tek kaynaktan.** Teklif kipi / satış kipi kabuğu tek kaynaktan döner (`kipSayacAdi`, `kipSekmeAdi`); ekranlarda elle yazılmaz.
- **K38 · Satış kipi kimliği.** ₺ ve "Sepete ekle" yalnız satış kipinde; teklif kipinde ₺ 0.
- **K39 · Fiyatsız ürün satış kipinde "Teklif iste".** Gizlenmez, sepete eklenmez, fiyat satırı yok; "fiyat yok / —" yazılmaz. Karma ailede "…'den başlayan" yalnız fiyatlı üyelerden.
- **K22 · Durum alfa ile anlatılmaz;** pasif hâl opaklıkla değil, dosyadan gelen tonla (K23-b).
- **K25 · Turkuaz metin rengi değildir;** metinde `--brand-cyan-ink`. **K25-b:** sayaç ve kiremit düğme zemini koyulaşır.
- **K28 · Ham hex 0.** Karede ham renk kodu sayısı sıfır; renk token'dan gelir.
- **K26 / K27 · Değer emri kaynağa gider, DS türetir; tekrar eden desen DS'e çıkar, ekran DS'e girmez.**
- **K23 / K23-a · Logo elle çizilmez; ikon kontur kalınlığı sözleşmedir.**
- **K37 · Dinamik, statik değil.** Tasarım kararı çalıştırılarak verilir (Ürün Seçici prototipi); kural motoru tek kaynak (`secim-kurallari.json`).
- **Yapısal karar tek başına sorulur.** Menü yeri, URL şeması, sayfa mimarisi, panel/kalıcı sütun gibi kararlar toplu onaya gömülmez; Recep'e tek soru olarak gider (K37-a U3 örneği).

## 3. Kare kabul ölçümü (Instructions — OPS böyle ölçer, Design böyle raporlar)

1. Kararlar aynasının tarihini kontrol et; bayatsa recovery komutuyla yenile.
2. Kareyi indir (`design_dl.py <proje-uuid> "<kare>.dc.html" <hedef>`), metnini çıkar, §2 kurallarını tek tek say.
3. **Ölçüm satırı** yaz: sayılabilir, tekrarlanabilir, DOM ya da dosya üzerinden. Örnek:
   `kip=Satış DOM'da fiyatsız üründe "Sepete ekle" 0 · "Teklif iste" ≥1 · ₺ 0 · "fiyat yok/—" 0 · ham hex 0 · kırık görsel 0`.
4. Hüküm: KABUL / KISMEN (tek düzeltme, ölçüm satırıyla) / RET (K numarası + sayı). "Güven" ölçü değildir.
5. Ölçülmemiş sayı karede duramaz: koşullu cümle motorla sınanır ya da sayısız yazılır.

## 4. OPS → Design emir/cevap kalıbı

- Emir dosyası: `ops-emir-<YYYY-MM-DD>-<n>-<proje>.md` (proje köküne `design_push.py <PROJ> <dosya>` ile); başlık `# OPS EMRİ → DESIGN-<PROJE> · <tarih> · #<n> · <tek cümle>`; gövde: önceki teslimin kabul/ret ölçümü → sıradaki iş (tek tur) → ölçüm satırı → "Recep'e soru var mı" (yoksa açıkça "Recep'e soru yok").
- Cevap dosyası: `ops-cevap-<tarih>-<proje>-<konu>.md`. Design'ın notu: `emir-<n>-notlar.md` ya da `<kare>-notlar.md`.
- Devir: yeni sohbet önce `DEVIR.md`, sonra `ops-devir-eki-*.md`. Design kendiliğinden tetiklenmez; Recep "Linear'a bak" der.
- Design projeleri kum havuzudur: Design **koda ve canlıya yazmaz**; API anahtarı proje dosyasına girmez; kare dış ağa çıkmaz (K18-c madde 3 RET).

## 5. Bu skill NE DEĞİLDİR

Hazır tema, stil reçetesi, "pahalı görünüm" tarifi, görsel üretim yeteneği değildir (2026-09-06'da 20 yabancı skill bu yüzden karantinaya alındı: `docs/audits/skill-envanteri-2026-09-05.md`). Yeni bir tasarım kuralı gerekiyorsa önce Kararlar'a K numarasıyla girer, sonra buraya satır eklenir.
