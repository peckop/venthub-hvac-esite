---
baslik: Uyarlanan skill'de "kaynak / alınan / bizden" görünür olmalı
durum: acik
tur: kural
skill: skills-creator
tetik: recep-duzeltme
oturum: 0df102e3 · 2026-09-08
---
**Ne oldu:** gstack ve karpathy/llm-council'dan üç skill uyarladım. Recep: "içeriği mi
alıyorsun, bizdekini mi anlatıyorsun, kullanıcı olarak ayırt edemiyorum." Haklıydı: başlıkta
"kaynaktan uyarlandı" yazıyordu ama **ne kadarının** alındığı yoktu (office-hours'ta 90 KB
kaynak okundu, council'da yalnız README özeti).

**Genelleşen ders:** Dış kaynaktan uyarlanan her skill/betik başlığında üç satır: **KAYNAK**
(repo, lisans, okunan dosyalar) · **ALINAN** (yöntem/fikir olarak ne geldi) · **BİZDEN** (ne
yeni yazıldı, ne bilinçli alınmadı). Lisans gereği atıf (CC BY, MIT) buna dahil.

**Önerilen değişiklik:** `skills-creator` şablonuna zorunlu "KAYNAK / ALINAN / BİZDEN" bloğu;
`arac-envanteri` "amaç" sütununa kaynak etiketi. Bu oturumda üç skill'e blok eklendi (PR #1116).

**Kanıt:** oturum 0df102e3, 2026-09-08; Recep mesajı "sen içeriği mi alıyorsun…".
