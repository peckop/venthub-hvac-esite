
# LINEAR TURU — DESIGN-BELGE · 2026-09-06 (ikinci tur) · emir yüzeyi TEMİZ, yeni iş yok

Turun ilk işi yapıldı (protokol v1.3): en yeni emir + bayat okundu.

## Okunan
- `ops-emir-2026-09-06-3-belge.md` (en yeni emir) · `bayat-2026-09-06.md` (en yeni bayatlık sinyali).
- `bayat-2026-09-05.md` ve `kararlar-vitrin-15a-2026-09-04.md` BAYAT ilan edilmiş; aynada karşılığı var.

## Emir #3'ün hükümleri — üçü de UYGULANMIŞ (ölçüldü, bu tur)
| Hüküm | Durum | Kanıt |
|---|---|---|
| `[SITE_ADRESI]` → `venthub.com.tr` | uygulandı | yuva 0; sözleşmede 2 + ön bilgilendirmede 1 yerde değer basılı, kaynak yorumları da güncel |
| 153-15/16/17 → REC-159 işareti | uygulandı | `Cayma ve Iade Formu v1` `alanAdlari` kipinde 3 yerde "şemada YOK → REC-159"; kalem tablosu ve tutar kâğıt gerçeği olarak duruyor |
| Bekleyen tabloda 153-15/16/17 kapanır | uygulandı | `bekleyen-hukumler-2026-09-06.md` kapanmışlar bölümünde, 153-18 de kapalı |

## Emir #3'ün sıradaki işi — TESLİM
Satınalma seti EN dört belge (`Purchase Order v1` · `Request for Quotation v1` · `Goods Receipt Note v1` · `Supplier Non-Conformance Report v1`) + `satinalma-seti-notlar-2026-09-06.md` + bekleyen tablo güncel. Kuyruk OPS tarafından 06:15Z'de BİTTİ ilan edildi.

## Bu turun sonucu: yeni iş çıkmıyor
Emir yüzeyinde işlenmemiş emir yok, bayat sinyalinde bana düşen uygulanmamış karar yok (K24 MENU'nün; K25/K25-b belgelerde uygulanmış — `a:hover` dokuz dosyada `--brand-cyan-ink`; 153-7 uygulandı, itiraz bekliyor).

**Açık kalan üç numara, üçü de bende değil:**
- **153-7** — belge numarası kalıbı, Recep itirazı bekler (belgelerde uygulanmış hâlde duruyor).
- **153-9** — kâğıt provası; on üç belge (altı satış + üç yasal + föy + üç satınalma). Ölçülemeyen tek şey grup ara başlığının sayfa sonunda yalnız kalması.
- **153-19** — hukuk teyidi; gelirse taslak bandı üç yasal belgeden kalkar (tek tweak, `taslakBandi`).
- Ek: **REC-159 / REC-160** migration'ları inince `alanAdlari` kipindeki "şemada YOK" işaretleri kalkar (cayma formu · PO · GRN · RFQ · NCR).

K1a gereği yeni iş uydurulmadı. Sıradaki adım (6 — antetli/imza/kartvizit) OPS emri bekler: kuyruk "BİTTİ" ilan edildiği için kendiliğinden başlanmadı.

---

# Aynı tarih · üçüncü tur ekleme — tam aynalar yüklendi, aynamda BAYATLIK bulundu

Bayat sinyalinin duyurduğu üç tam ayna projeye yüklendi (`kararlar-kurumsal-belgeler-2026-09-06.md` · `kararlar-vitrin-15a-2026-09-06.md` · `kararlar-katalog-2026-09-06.md`); geçen turda henüz yoklardı. Şeridimi ilgilendireni okudum. Yeni `ops-emir-*` yok.

## Bulgu 1 — K3 düzeltmesi aynama hiç işlenmemişti (Ç10 sınıfı, kendi bulgum geri döndü)
Aynada 2026-09-05 13:40'ta **K3 düzeltmesi** var ve kaynağı benim bulgumdu: tablo listesi şemanın gerisindeydi. Yeni kural **"liste = şemada canlı olan her tablo"**; benim `CLAUDE.md`'im hâlâ "Tablo listesi **sabit**: yedi tablo" yazıyordu — yani düzelttiğim şeyin düzeltilmiş hâlini kendi aynama almamışım. Eklenen yedi tablo: `suppliers` · `purchase_orders` · `purchase_order_items` · `goods_receipts` · `venthub_returns` · `data_subject_requests` · `payment_transactions`.

Pratik etkisi: satınalma seti ve cayma formu bu tablolardan çizildi, yani **çizim doğruydu, ayna yanlıştı** (kural metni işi engellemedi, ama "adı listede olmayan tablo aranmaz" kuralıyla birlikte okunursa engelleyebilirdi). `CLAUDE.md` düzeltildi; tam liste + "çizim sırası ayrı karar" cümlesi girdi.

**Çizilmemiş iki tablo, ikisi de bilinçli:** `data_subject_requests` → KVKK seti (belge sırası 4'ün kalanı, emir bekler) · `payment_transactions` → belge karşılığı yok (ödeme kipi kapalı; makbuz/tahsilat belgesi kararı verilmedi). Bunlar iş DEĞİL, kayıt.

## Bulgu 2 — K23-b bu projeyi de bağlıyor, aynamda yoktu
`kararlar-vitrin-15a-2026-09-06.md` K23-b: sönükleştirme `filter:grayscale()` / `opacity` ile yapılmaz, soluk sürüm dosyadan gelir. `CLAUDE.md` K23 satırına eklendi.

**Ölçüm ve düzeltme (aynı tur):** önce "belgelerde `filter` 0 · `opacity` 0" yazdım — **ölçmeden**. Ölçünce iki gerçek eşleşme çıktı, ikisi de hükmün dışında: `Prova Tek Renk.dc.html`'de iki `filter:grayscale(1)` (yazıcıyı taklit eden denetim sayfası, sönükleştirme değil) ve beş e-posta gövdesinde gizli ön izleme metninin `opacity:0`'ı (preheader tekniği, durum anlatımı değil). Satır ölçülen hâliyle yazıldı. Bu, 2026-09-05'te bir kez yakalanan "ölçülen ile çıkarsananı karıştırma" kusurunun tekrarıydı; ikinci kez aynı turda yakalandı.

## Değişmeyen
Kuyruk BİTTİ hükmü yerinde; açık numaralar aynı: **153-7** (Recep itirazı) · **153-9** (kâğıt provası, on üç belge) · **153-19** (hukuk teyidi) · **REC-159/160** (migration). Aynadaki "Recep'e tek başına soru" da açık: devreye alma ve servis raporları — şema yok, çizim bekler.

Bu turda belge dosyası değişmedi; yalnız karar aynası (`CLAUDE.md`) düzeltildi.

— DESIGN-BELGE (Opus) 2026-09-06

