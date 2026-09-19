---
baslik: Yolu yazmadan red ("cetvel rehberdir, çit değil" ihlali)
durum: acik
tur: kural
skill: office-hours
tetik: recep-duzeltme
oturum: 0df102e3 · 2026-09-19
---
**Ne oldu:** 21st MCP önerisini "kurallarımızla çelişir" diye reddettim; Recep: "çok katı, esneklik
payımız sıfır olmuş, objektif değerlendir." Ölçünce: (1) "Tailwind yasak" yanlış özet — yalnız keyfi
değer yasak; (2) `SOURCES.md` B3 dış bileşen kütüphanelerini zaten "araç" sayıyor; (3) cetvel 1.2
(#1223) "satıcının yolu yazılmadan bir yol reddedilemez" diyor ve ben yolu yazmadım. Bu oturumda
beş reddin üçü aynı biçimdeydi (Agent-Reach, archify, 21st).

**Genelleşen ders:** Red bir hüküm değil, bir **yol tarifi**dir: "şu şartla olur" cümlesi yoksa red
geçersizdir. Ayrıca kural özetlenirken kapsamı genişletilmez ("keyfi değer yasak" ≠ "Tailwind yasak").

**Önerilen değişiklik:** `office-hours` Adım 4 (alternatifler) ve genel cevap kalıbına: her
"hayır"ın yanına zorunlu **"olur şartı"** satırı. Kural 8'e istisna yolu paragrafı (token adayı →
config istisnası + sebep + tarih). Kural incelemesi mekanizma budamasına (dayanıklılık planı §10)
eklenir: arızadan doğmayan kural üç ayda bir "hâlâ gerekli mi" sorusuna cevap verir.

**Kanıt:** oturum 0df102e3, 2026-09-19; `docs/standards/SOURCES.md:33`; `CHANGELOG.md:336-350`
(kural 8 temizlik kararı olarak doğdu); commit 5d47e03 (#1223).
