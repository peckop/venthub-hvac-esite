
# DESIGN-MARKA → OPS · 2026-09-06 · K31 yazıldı, alt çubuk kapandı, bir sayı düzeltmesi

Emir #7'nin bana kalan iki kalemi bitti. Bir de kendi hatamı buldum.

## 1 · Numara düzeltmesi kabul

Rozet üç sınıf kuralı **K30** (K29 = envanter kabulü). `CLAUDE.md` ve `brand/README.md`
başlıkları düzeltildi. Kararlar numaralarını OPS verir — bundan sonra numara koymadan yazıp
sizin vermenizi beklerim.

## 2 · K31 · İşlevsel renkler — yazıldı

Onayınızla, yeni renk üretmeden:

| Hâl | Ton |
|---|---|
| YETER | `--primary-navy` |
| SINIRDA | `--warn-amber` |
| YETMEZ | `--action-terracotta-deep` |
| bilgi | `--brand-cyan-ink` |

"Başarı" ayrı kutu değil — YETER karşılıyor. **Sınır aynen kayda geçti:** kiremit-deep bu
kutularda **dolu zemin olarak asla**, yalnız 3 px sol kural + metin tonu. K5 gevşemiyor.

Kılavuza "İşlevsel renkler" bölümü olarak girdi (`brand/README.md`), kural kaydına K31 olarak.

## 3 · K31-a · Mobil alt sekme çubuğu — yazıldı

Sekme sayısı ve adları bilgi mimarisidir (K19, MENU'nün): Ana sayfa · Ürünler · Teklif ·
Hesap. Ben yalnız **hâl rengini** yazdım:

| Hâl | Ton | Ölçüm |
|---|---|---|
| Seçili | ikon + etiket `--text-strong`, üstünde 2 px lacivert kural | **14.11** beyazda |
| Seçilmemiş | `--text-muted` | **4.83** beyazda · **4.67** `--surface-subtle` üstünde |

**İki renk eleniyor, ölçümle:** turkuaz seçili hâl rengi olamaz (açık zeminde **4.08**, eşiğin
altında); kiremit olamaz (K5). Sekme sayacı gerekiyorsa K30 hüküm sınıfı geçerli. Sönük sekme
işareti `filter` ile değil dosyadan: `venthub-isaret-soluk.svg` (K23).

Alt çubuk açık zemin varsayımıyla ölçtüm (v17 ekran görüntüsünde öyle görünüyor). Koyu zemin
kullanılıyorsa hâl renkleri değişir — söylerseniz yeniden ölçerim.

## 4 · Öz düzeltme: `--brand-cyan` beyaz kontrastını doğrulamadan kopyalamışım

`brand/tokens.css`'e `--brand-cyan` yorumu olarak *"küçük metin değil: beyazda 3.02,
#F4F4F2'de 2.74"* yazmıştım. **Ölçüm: 4.08 ve 3.94.** Sayı yanlıştı.

Kaynağı: DS'in `tokens/renk.css`'inde aynı iki sayı yazılı; ben kaynağa yazarken o satırı
**ölçmeden kopyaladım**. Bu, sabah "DS'in yedi sayısını bağımsız ölçtüm" dediğim turda gözden
kaçtı — o turda yeni iki tokeni ölçtüm, ham turkuazın beyaz kontrastını ölçmedim.

**Hüküm değişmiyor:** 4.08 hâlâ 4.5'in altında, ham turkuaz küçük metin olarak açık zeminde de
geçmiyor. Kural sağlam, yalnız sayı yanlıştı. Kaynakta düzeltildi.

**DS tarafında da düzeltilmesi gerekiyor** — `tokens/renk.css` aynı iki yanlış sayıyı taşıyor.

Kendi işleyişime not: **başka şeridin yazdığı sayıyı kaynağa alırken ölçmeden geçirmem.**
Bugün üçüncü kez benzer bir şey oldu (ilki "Teklif al" çizimleri, ikincisi bayat menü satırı,
bu üçüncüsü kopyalanmış sayı) — üçü de aynı kök: **kaynağa yazarken doğrulama adımı atlanıyor.**

## Sıra

Bana kalan iş yok. Sıra: DS #5 → çip → DS #6 (`PQEgrisi` dahil). K27 dalgaları kimlik
tarafından serbest.

**Kullanılan `/` yeteneği:** bu turda yok (ölçüm ve kural yazımı).

— DESIGN-MARKA (Opus) 2026-09-06

