
# KVKK seti — teslim notu · DESIGN-BELGE · 2026-09-06

OPS emri `ops-emir-2026-09-06-4-belge.md`, hüküm **153-24**. İki belge, A4, kabuk `dil="tr"`.
`KVKK Basvuru Formu v1.dc.html` · `KVKK Basvuru Yanit Yazisi v1.dc.html`

## Kaynak: migration T063, depodan okundu
`supabase/migrations/20260816120000_kvkk_data_subject_requests.sql` (peckop/venthub-hvac-esite @ master) + `src/lib/kvkk/dueState.ts`. Alan uydurulmadı.

**Tablonun tamamı (16 kolon):** `id` · `user_id` · `applicant_email` · `request_type` · `status` · `received_at` · `due_at` · `identity_verified_at` · `completed_at` · `outcome` · `retained_data_note` · `handled_by` · `tenant_id` · `created_at` · `updated_at`.

Listeler kısıttan geldi, ticari karardan değil:
- `request_type` CHECK → altı tür: access · rectification · erasure · portability · objection · restriction. Formdaki altı kutucuk bunlar.
- `status` CHECK → beş durum: received · identity_pending · in_progress · completed · rejected.

**30 gün belgeye sayı olarak yazılmadı.** Otorite DB `due_at` default'u (`now() + interval '30 days'`); `dueState.ts`'in kendi yorumu "30 GÜN BURADA YOK: son tarih otoritesi DB `due_at`" diyor ve gün aritmetiğini istemciye bağlamayı reddediyor. Belgede `due_at` yuvası var, sayı yok. Gecikme sayacı `TERMINAL_STATUSES` (completed · rejected) hâlinde donar — künye notunda yazılı.

## "Kapalı bekler" etiketi YOK — ölçülmüş gerekçe
KVKK yüzeyi bugün canlı: tablo + RLS + `anonymize_user_personal_data` prod'da (migration'ın kendi uyarısı: "BU MIGRATION PROD'A OTOMATİK UYGULANIR… Merge = uygulama"), `/legal/kvkk` sayfası `sitemap.ts`'te. Satış kipi anahtarıyla (`NEXT_PUBLIC_ODEME_ACIK`) ilgisi yok. K21 deseninin aynısı: bugün de var olan yüzeyin belgesi etiket taşımaz. Ölçüldü: iki belgede "kapalı bekler" ifadesi **0**.

## Belge 1 · Veri Sahibi Başvuru Formu
Alan yerleşimi + kayıt karşılıkları. Bölümler: başvuru no/tarih · başvuran · ilgi sıfatı (kayıtlı / kaydı yok / vekil — `user_id` dolu-boş karşılığı) · kimlik tevsiki · talep türü (altı kutucuk + `request_type` kodu) · talebin konusu · başvuran beyanı + veri sorumlusu kaydı.

**Kimlik tevsiki notu koddan:** sistemde kayıtlı e-postadan gelen başvuruda ek belge istenmez (Tebliğ). Bu, migration'ın `applicant_email` yorumunun aynısı — benim çıkarsamam değil.

**Şemada olmayan alanlar (kâğıtta zorunlu):** ad soyad · kimlik no · adres · telefon (tabloda yalnız `applicant_email` var; kimlik tevsiki eki kâğıtta kalır) · **başvuranın talep metni** (`outcome` yanıtın özeti, `retained_data_note` kısmi ret bildirimi; başvurunun konusunu tutan kolon yok) · başvuru numarası (uuid; K19 taslağında önek **KV**, üretecek kolon yok). `alanAdlari` kipinde altısı "şemada YOK" işaretiyle görünür; uydurma alan konmadı. Soru **153-27** olarak açıldı.

Tweaks: `alanAdlari` · `kayitBlogu` (başvurana verilen kopyada iç kayıt bloğu kapanır).

## Belge 2 · Başvuru Yanıt Yazısı
Muhatap/tarih · başvuru kaydı tablosu (alan · değer · anlam) · sonuç rozeti · gerekçe · işlem dökümü · başvuru yolları + veri sorumlusu · süre notu.

**Üç sonuç hâli tek belgede (K16):** `sonuc` tweak'i kabul / kismi / ret. `kismi` hâlinde başlık "Saklanan veri ve hukuki sebebi" olur ve gerekçe `retained_data_note`'tan gelir.

**Kısmi ret cümlesi Design'ın değil, kodun:** `anonymize_user_personal_data` şu format string'ini yazıyor — "%s adet sipariş/fatura kaydı, VUK/TTK %s yıllık saklama yükümlülüğü nedeniyle silinmemiştir. Süre dolduğunda anonimleştirilir." Belgede sayı yuvalı hâliyle duruyor. Niçini de kodda: saklama yükümlülüğü olan veri KVKK m.7 gereği silinmez, ama kısmi ret veri sahibine **gerekçesiyle** bildirilmek zorundadır; `retained_data_note` o bildirimin kaynağıdır.

**İşlem dökümü** fonksiyonun döndürdüğü jsonb raporun kendi anahtarlarından: silinen (`user_addresses` · `user_invoice_profiles` · `shopping_carts` · `user_projects` · `wizard_selections`) · anonimleştirilen (`user_profiles` · `contact_messages` · `venthub_orders`) · saklanan (`venthub_orders` + sebep + cutoff). Kalem uydurulmadı. `ret` hâlinde çizilmez (`rapor` tweak'iyle ayrıca kapanır).

Tweaks: `alanAdlari` · `sonuc` · `gerekce` (kısa/uzun) · `rapor`.

## Ölçüm
A4 basılabilir kutu 1 358 px.

| Belge | Yüksek. | Sayfa | Taşan hücre |
|---|---|---|---|
| Başvuru Formu | 1 890 px | **1,39** | 0 |
| Yanıt Yazısı · kısa gerekçe | 1 695 px | **1,25** | 0 |
| Yanıt Yazısı · uzun gerekçe (520 karakter, emirdeki stres) | 1 784 px | **1,31** | 0 |

Kapılar (belge gövdesinde, `doc-page` ağacı üzerinden): **ham hex 0 · alfa 0 · Arial 0 · ham turkuaz (`--brand-cyan`) 0 · "kapalı bekler" 0.** Not: sayfa genelinde 10 hex ve 10 alfa eşleşmesi var, hepsi çalışma zamanı kabuğundan (`support.js` · `doc-page.js` gölge DOM'u) — belge gövdesine ait değil; ölçüm bu yüzden `doc-page` alt ağacına daraltıldı.

## Açık kalan
- **153-27 (yeni):** başvuranın talep metni · ad soyad · adres · telefon · başvuru numarası — beşinin de kolonu yok. Kâğıt bunları taşıyor, sistem taşımıyor. Kod işi mi (REC-159 deseninde bir migration) yoksa "kâğıtta kalır" kararı mı?
- Yanıt yazısının hukuki metni ve Kurul'a başvuru yolları bildirimi hukukçudan (153-19 kapsamı).
- Kâğıt provası 153-9'a iki belge daha eklendi → **on beş belge**.

— DESIGN-BELGE (Opus) 2026-09-06

