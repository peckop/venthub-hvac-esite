# Departman defter düzeni: ARAÇ'ın kanca görüşü (ARC-287, OPS-258) — 9 Kasım 2026

Durum: görüş, uygulama yok. İstek: OPS (Recep kararı 9 Kasım: her departman alanını yaşayan defterle işletir, kanca/CI/zamanlı görev zorlar). HARİTA'nın tasarım notu (`docs/plans/departman-defter-duzeni-2026-11-09.md`) bu görüş yazılırken depoda yoktu; görüş o notu görmeden, mevcut kancaların okunmasıyla yazıldı. Cetvel: `docs/standards/arac-envanteri-standard.md`, `docs/standards/duzenli-gorevler-standard.md` (kalıp), `docs/standards/fleet-mechanism-standard.md`.

## Okunanlar (mevcut durum)

- `gorev-tazelik-satiri.cjs` (UserPromptSubmit, ARC-216): rolün düzenli görevlerinden eşiği aşan varsa TEK satır, hiçbiri aşmadıysa sessiz; veri `scripts/belge/rol-gorevleri.json`'dan okunur, "ikinci liste tutulmaz".
- `defter-tazelik-satiri.cjs`: NotebookLM defter satırı karar 419 ile kaldırıldı; dosya adıyla duruyor, içinde BAĞIMLILIK/TABAN/SAGE/BELLEK/KİLİT/BAĞLAM/KAYIT/BELGE/WRONGSTACK/DÜNYA/SAHİPSİZ PR/AYAR DEĞİŞTİ satırları var. Tüm satırlar `uyari-susturma.cjs` ile tamponlanıyor: pencere başına yalnız durum değişince basılıyor (ARC-220, karar 420).
- `dizin-acilis.cjs` (ARC-282): yalnız GEO-SEO penceresinde, betiği süre tavanıyla (12 sn) koşup tek satırı (400 karakter tavan) basan ince sarmalayıcı; fail-open, vana var.
- `scripts/arac/onceki-calisma.cjs`: defterleri bir MANİFESTTEN değil, dizin taramasından buluyor (`docs/audits`, `docs/olcum`, hafıza `olcum/`, katalog `katalog-envanteri.md`); tarih dosya adından, yoksa içerikten, yoksa mtime'dan; tazelik eşiği tek ve sabit, 14 gün. Eşleme sorgu kelimeleriyle.
- Bağlam bedeli ölçümü (`docs/olcum/kanca-satiri-onbellek-olcumu.md`): kanca çıktılı turlarda tur başına medyan 1.169 bayt (UTF-8); kanca satırlarının önbelleği bozduğuna dair kanıt yok (916 çağrıda 1 kırılma). Token karşılığı ölçülmedi.

## (a) Açılışta departman başına tek satır defter tazeliği: EVET, ama yeni kanca olarak değil

Öneri: `gorev-tazelik-satiri.cjs` ile aynı kalıpta, aynı susturma sarmalayıcısı altında, rol başına en çok TEK satır: `⚠DEFTER (KATALOG): 2 defter bayat: pim-unopim.md 41 gün (eşik 30), erisim-envanteri.md 12 gün (eşik 7)`. Hiçbiri bayat değilse sessiz (taze olanı söylemek her mesajda bayt yer). Satır 300–400 karakter tavanlı; fazlası "+N defter daha".

Veri tek yerde olmalı: rol başına defter listesi (yol, sahip, eşik gün, tazelik kaynağı) tek bir manifestte (`rol-gorevleri.json` kalıbı; ikinci liste tutulmaz). Eşik defter başına değişir (HARİTA'nın örneği: sıra ölçümü 30 gün, yapı ölçümü 90 gün).

Tazelik kaynağı sırası: (1) defterin kendi "Son doğrulama: YYYY-MM-DD" satırı, (2) dosya adındaki tarih, (3) git'te son içerik commit'i. mtime'a güvenme: format/yeniden yazma commit'i bayat defteri taze gösterir.

Bağlam bedeli (ölçülen tabana göre): tek satır ≈ 150–250 bayt. Tur başına medyan 1.169 bayta göre en kötü durumda +%13–20, ama yalnız defter bayat olduğu süre ve susturma sayesinde yalnız durum değişince (oturumda bir kez, compact sonrası bir kez). Taze durumda 0 bayt. Önbellek etkisi: ölçülen veride kanca satırıyla ilişkili kırılma yok; yeni satır için ayrıca ölçüm gerekmez, ama ilk haftada tur başına kanca baytı 2.000'i geçerse `kanca-satiri-onbellek-olcumu.md` yeniden ölçme tetikleyicisi devreye girer. Token karşılığı hâlâ ölçülmedi.

SessionStart'ta tek seferlik satır yetmez: bayatlık oturum ortasında oluşmaz ama compact sonrası unutulur; susturma sarmalayıcısı zaten compact sonrası yeniden basar.

Gecikme: satır yalnız yerel dosya/`git log` okur; ağ ve Kanban çağrısı yok (ARC-28 gecikme eşiği 300 ms medyan).

## (b) `onceki-calisma.cjs` defter manifestini de taramalı: EVET

Manifest şu an tek eksik: tarama dizin sınırlı (departman defteri başka klasöre konursa görülmez) ve eşik sabit 14 gün. Manifest kaynak olursa: (1) dizin sınırı kalkar, (2) tazelik eşiği defter başına gelir, (3) açılış satırı ile "ÖNCEKİ ÖLÇÜM" kapısı AYNI veriden beslenir, iki ayrı liste ayrışıp çelişmez, (4) sahibi olmayan defter görünür olur. Mevcut dizin taraması fallback olarak kalır (manifestte olmayan eski defterler kaybolmasın). Çıktı biçimi değişmez; test: manifest defteri sorguyla eşleşince "ÖNCEKİ ÖLÇÜM:" satırında çıkar, bayatsa BAYAT damgası defter eşiğine göre.

## (c) ARC-220 hatırlatma defteriyle ilişki

Defter satırı ARC-220 sarmalayıcısına girer: aynı hash aynı oturumda tekrar basılmaz (gürültü kontrolü ücretsiz gelir). Asıl kazanç ölçüm tarafı: ARC-220'nin etki ölçümü "hatırlatma sonrası konuya dokunuldu mu" sorusunu eşleme tablosuyla cevaplıyor; defter satırı için eşleme doğal: ⚠DEFTER sonrası ilgili defter dosyası düzenlendi ya da "Son doğrulama" damgası ilerledi mi. Böylece "kanca zorlar" kararının işleyip işlemediği ölçülür, varsayılmaz. Bunun için manifest yolu ARC-220 eşleme tablosuna beslenmeli; bu görüş ARC-220 kayıt biçimine dokunmuyor.

## (d) Neyi kanca YAPMAMALI

1. Defter içeriğini bağlama basmak (özet, tablo, son satırlar): bayt maliyeti her turda; defter okunur, kancayla taşınmaz.
2. Departmanda birden çok satır ya da taze defterleri saymak: tek satır, yalnız bayat.
3. Bloklayan kanca ile "defter güncel değil, işi durdur": 15 Ağustos'ta pre-commit'in rastgele reddi (aynı dosya 80/100 ↔ 100/100) bunu gösterdi; hatırlatma uyarır, bloklamaz (çıkış hep 0).
4. İçerik doğruluğunu LLM ya da kelime örtüşmesiyle yargılamak: bu hafta ARC-249'da kelime örtüşmesi %87 sahte "kayıp" verdi; kimlik tabanlı kontrol işe yaradı. Tazelik tarih okur, doğruluk yargılamaz.
5. Tazeliği mtime ile saymak (yukarıda).
6. Zamanlayıcı/cron/loop ile defter yoklamak: karar 53, önce Recep. Açılış kancası zamanlayıcı gerektirmez.
7. Açılışta ağ ya da Kanban çağrısı yapmak.
8. Başka departmanın defterini sahibine sormadan kancayla güncellemek ya da "damgalamak"; damga yalnız sahibin açık komutudur (`gorev-damga.cjs` kalıbı).

## Zorlama sırası (kanca tek başına yetmez)

- CI testi (bloklar): manifestteki her defterin dosyası var, sahibi var, eşiği var, "Son doğrulama" satırı biçimli; "Son doğrulama" tarihi değiştiyse gövde de değişmiş olmalı (yalnız tarih ilerletip içeriğe dokunmamak sahte tazelik üretir; bunu kanca göremez, diff görür).
- Kanca (hatırlatır): bayat defter satırı.
- Kanban kartı (iş açar): bayat defter kendiliğinden kart açmaz (gürültü, tekrar); kart sahibinin kararıdır.

## Sınırlar

HARİTA'nın notu okunmadı; uyuşmazlık varsa onun kararı bu görüşün önüne geçer. Bayt maliyeti belge ölçümünün tabanından türetildi, yeni satırın gerçek baytı uygulamada ölçülür. Token karşılığı ölçülmedi. Uygulama kanca PR kuralına tabidir (değişikliği yazmamış denetçi tam farkı okur).
