
# OPS EMRİ → DESIGN-BELGE · 2026-09-06 · #4 · 153-23…26 hükümleri — kuyruk yeniden açıldı: KVKK seti (2 belge) → 6. adım

`sorular-2026-09-06.md` dört soru; hepsi hüküm. "Kuyruk bitti" hükmü K3'ün ("liste = şemada canlı olan her tablo") sonucuyla çelişiyordu: canlı tablosu
olup belgesi olmayan yüzey varken kuyruk bitmiş sayılmaz. Bu emir o boşluğu kapatır; iş uydurma değil, sıranın kendi kalanı.

| No | Hüküm |
|---|---|
| **153-23** sevk irsaliyesi · garanti belgesi | **(c) şema/veri bekler, listeden DÜŞMEZ.** İkisinin de kolon karşılığı yok (senin ölçümün). Sevk irsaliyesi bugün kargo bildirimiyle karşılanıyor (e-irsaliye GİB'den, e-fatura gibi); garanti belgesi ürün/marka verisine bağlı, şema kararı satış kipiyle. Bekleyen tabloda "şema bekler" olarak kalır, çizilmez. |
| **153-24** `data_subject_requests` | **EVET, bu şeridin işi — kuyruğa girer, sıradaki iş.** İki belge: (1) **KVKK Veri Sahibi Başvuru Formu** (basılı/PDF; alanlar `data_subject_requests` kolonlarından, `alanAdlari` kipi; kimlik doğrulama satırı; başvuru no = `belge_no` yuvası, K19 öneki taslak **KV**), (2) **KVKK Başvuru Yanıt Yazısı** (30 gün süre, sonuç: kabul/kısmi/ret + gerekçe; kabuk `dil` prop'u, TR birincil). Kaynak: migration `T063` (ca537d87), `data_subject_requests` şeması, mevcut KVKK metni (`src/views/legal`). Uydurma alan yok; şemada olmayan "şemada YOK" işareti. Stres: 1 uzun gerekçe. |
| **153-25** `payment_transactions` | **Bugün belge YOK; satış kipi açılınca "Tahsilat Makbuzu / Ödeme Bildirimi" adayı** K1a kapalı-bekler listesine girer. Şimdi çizilmez. Bekleyen tabloda "satış kipi" olarak kalır. |
| **153-26** 6. adım sırası | **153-24 (KVKK 2 belge) → 6. adım: antetli kâğıt + e-posta imzası** (kabuk kimliğiyle, Marka logo paketi dosyadan, K23). **Kartvizit Recep kararı** (basılı ürün, ticari) — çizilmez, sorulur. Baskı provasından (153-9) bağımsız. |

Kararlar — Kurumsal Belgeler'e K17 olarak yazıldı. Teslim: iki KVKK belgesi + notlar dosyası + proje yorumu tam metin; bekleyen tabloyu güncelle.

— OPS · 2026-09-06

