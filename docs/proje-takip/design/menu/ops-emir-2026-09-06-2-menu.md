
# OPS EMRİ → DESIGN-MENU · 2026-09-06 · #2 · B4 KARARI + dört renk eşleşmesi hükmü + kare sayım tanımı

OPS'un açığı: B4 hükmü Recep'e söylendi ama sana ve Kararlar'a yazılmadı; "hâlâ Recep'te" demen doğruydu. Düzeltildi, bu dosya + Kararlar 15A K24.

## 1 · B4 KARAR (Kararlar 15A **K24**): Ürün Seçici girişi = **header** (kendi girişi, bugünkü hâl)
Recep kararı OPS'a devretti, OPS hükmü header. "Izgara" alternatifi (senaryo ızgarasında 8. kutu) ÇİZİLMEZ; B4 karesinde ızgara
alternatifi ARSIV etiketiyle kalır ya da kaldırılır (senin tercihin, tur sonu yorumuna yaz). Mobilde karşılığı M2 Ürünler sayfasındaki
"Ürün Seçici" satırı (zaten çizili). Altyazı: "K24 · giriş header'da".

## 2 · Dört renk eşleşmesi (20:45Z ölçümün) — hüküm, çizimde uygula
| Eşleşme | Hüküm |
|---|---|
| beyaz / `--brand-cyan` @11 px (Teklif sayacı "3") | sayaç zemini `--brand-cyan` KALIR, metin BEYAZ değil **`--primary-navy`** (lacivert üstüne değil, turkuaz üstüne lacivert: ≥7:1). Kabuk bileşeninde prop değişikliği gerekirse DS'e not (KabukBandi sayaç metin rengi). |
| `--brand-cyan` / açık zemin @11 px (mono bölüm etiketi) | metin rengi **`--brand-cyan-ink`** (yeni DS tokeni, Marka üretir: turkuaz ailesinden, beyaz ve `#F4F4F2` üstünde ≥4,5:1, hedef ≈`#00708F`); token gelene kadar `--text-body`, notta "geçici". |
| `--brand-cyan` / `--primary-navy` @9 px ("▼") | metin dışı işaret, 3:1 yeter ama 3,47 sınırda ve 9 px küçük: **`--text-on-dark`** (beyaz), boy 10 px. |
| `--action-terracotta` / sayfa @12 px (kare etiketi "EKRAN 01") | artboard açıklama katmanı, ürün arayüzü değil: **`--text-body`** yap, kiremit yalnız kiremit düğmede kalsın (K5). |
Ölçüm satırı tur sonu: dört eşleşmenin yeni oranları + `--brand-cyan` metin olarak kullanım sayısı (hedef 0, yalnız zemin/kenar).

## 3 · Kare sayım tanımı
Cevabın kabul: fark sayım tanımından (DOM etiketi 26 + 3 adlı alt kare = 29). Bundan sonra sayım = **DOM etiketi** (kabuk-v2-notlar'daki
kural), OPS da öyle sayar. Kayıp kare yok, kapandı.

## Sıradaki
Recep v17'yi inceler (onun turu). Prototip "olur" sonrası. Marka'ya `--brand-cyan-ink` emri aynı turda gitti (REC-149).

— OPS · 2026-09-06

