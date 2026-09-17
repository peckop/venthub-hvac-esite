# REC-356 — ilk adım: sınıflı merge kapısı Recep'in yükünü ne kadar azaltır? (2026-09-17)

**Soru (kaydın kendisi, "Ölçülmeyen" bölümü):** son 30 günde kaç migration'lı PR merge edildi
ve kaçı EKLEME sınıfı olurdu? Kayıt şunu yazıyordu: *"beklenti: çoğunluk ekleme; değilse kazanç
küçük, Recep'e söylenir."*

**Cevap: beklenti TUTMADI.** 33 migration'ın **en çok 2'si** ekleme sınıfına girebiliyor, o
ikisi de sınırda. Kazanç küçük.

## 1. Evren

`git log origin/master --since=2026-08-17 --diff-filter=A -- supabase/migrations/` →
**33 migration dosyası, 33 ayrı commit** (her PR tek migration taşıyor).

## 2. Birinci geçiş — kaba işaret taraması (yorumlar atılarak)

Kaydın YIKICI ölçütlerinden türetilmiş yedi işaret aranarak:

| İşaret | Dosya sayısı |
|---|---|
| DML (INSERT/UPDATE/DELETE) | 17 |
| DROP | 15 |
| CREATE OR REPLACE FUNCTION/VIEW | 15 |
| ALTER TABLE/TYPE/FUNCTION | 12 |
| GRANT/REVOKE | 12 |
| SECURITY DEFINER | 9 |
| RENAME | 1 |
| **Hiç işaret taşımayan (EKLEME adayı)** | **0** |

⚠**Bu geçiş bilerek SERT:** işaret var diye yıkıcı sayıyor. Şartname bazı işaretleri
serbest bırakıyor (yeni tabloya GRANT, yeni tabloya seed), yani sert tarama fikri haksız
yere öldürebilir. Bu yüzden ikinci geçiş yapıldı.

## 3. İkinci geçiş — tek işaretli dosyalar satır satır

Tek bir işaretle yıkıcı sayılan dosyalar açıldı ve şartnameye göre elle değerlendirildi:

| Dosya | İşaret satırı | Şartnameye göre |
|---|---|---|
| `20260916113803_arama_fonksiyon_yetki_daraltma` | `revoke execute ... from public, anon, authenticated` | ⚠**SINIRDA** — şartname "GRANT/REVOKE **genişletme**" diyor; bu DARALTMA. Ama var olan fonksiyonların yetkisine dokunuyor. |
| `20260817204312_render_dalga1_missing_webhook_triggers` | `drop trigger if exists` + yeniden yarat | ⚠**SINIRDA** — yeni tetik ekliyor ama VAR OLAN tabloların davranışını değiştiriyor. |
| `20260901155000_products_name_i18n` | `alter table products add column if not exists` | YIKICI — şartname: var olan tabloya dokunmaz. |
| `20260826220000_search_suggestions_family_route` | `create or replace function get_search_suggestions` | YIKICI — var olan fonksiyonun gövdesi değişiyor. |
| `20260819103000_view_grant_hygiene` | `GRANT SELECT ON <var olan view>` | YIKICI — genişletme. |
| `20260914080000_jwt_role_emekli_ve_olu_storage_politikalari` | `drop policy`, `drop function jwt_role` | YIKICI. |
| `20260913182000_error_groups_yazma_politikasi` | `drop policy if exists` | YIKICI. |
| `20260823130000_product_families_name_i18n_en` | `update public.product_families` | YIKICI — var olan tabloya DML. |
| `20260831110000_kategori_gorselleri` | `UPDATE categories` | YIKICI — var olan tabloya DML. |

Çok işaretli 24 dosyanın hepsi en az bir kesin yıkıcı işaret taşıyor (DROP, var olan tabloya
DML, SECURITY DEFINER ya da CREATE OR REPLACE).

⭐**Kaydın "ekleme sınıfının ilk örneği" dediği arama migration'ı**
(`20260916093000_arama_indeksi_ve_govde`) altı işaretin altısını da taşıyor: DROP, ALTER,
CREATE OR REPLACE, DML, GRANT, SECURITY DEFINER. Şartnameye göre **yıkıcı**.

## 4. Sonuç

| | Sayı | Oran |
|---|---|---|
| Migration'lı PR (30 gün) | 33 | — |
| Kesin YIKICI | 31 | %94 |
| Sınırda (şartname netleşirse EKLEME olabilir) | 2 | %6 |
| Kesin EKLEME | **0** | **%0** |

**Niçin böyle:** bu projenin migration'ları neredeyse hiç "yeni bir şey ekle" değil. Katalog
verisi güncelleniyor (DML), fonksiyonlar yeniden yazılıyor (CREATE OR REPLACE), politikalar
düzeltiliyor (DROP + CREATE). Saf ekleme nadir.

## 5. Hüküm ve öneri

⛔**Sınıflandırma betiğini bu kazanç için yazmak kendini ödemiyor:** ayda en iyi ihtimalle
iki soru Recep'ten düşer, bedeli bir SQL ayrıştırıcı, bir konformans takımı ve kural 13'ün
yeniden yazılması. Kayıt da tam bu durumda "Recep'e söylenir" diyor.

⭐**AMA kaydın İKİNCİ yarısı kazancın asıl kaynağı:** Recep'in derdi soru SAYISI değil, soruyu
**anlamadığı için süreci uzatması** (kendi sözü: *"konuyu tam anlamadığım için süreci
uzatıyorum"*). Kaydın yıkıcı sınıf için tarif ettiği **üç ölçülmüş satır** —
(1) gölgede ne oldu, (2) geri alma yolu, (3) kilit süresi — sınıftan BAĞIMSIZ olarak her
migration sorusunu kısaltır ve 33'ün 33'üne uygulanır.

**Önerim:** sınıf ayrımını değil, **üç satırı** yap. Ritüel migration'lı her PR'da o üç satırı
kendisi üretsin (gölge kurucu zaten var, parmak izi betiği 09-16'da yazıldı); Recep'e giden
soru her seferinde aynı biçimde, ölçülmüş olarak gelsin. Sınıf ayrımı ancak ekleme oranı
anlamlı hâle gelirse yeniden ölçülür.

Bu bir kapsam DEĞİŞİKLİĞİ önerisidir ve karar Recep'indir (karar 33'ün kendisini daraltıyor).

## 6. Sınırlar, adıyla

1. İkinci geçiş yalnız tek işaretli 9 dosyada satır satır yapıldı; çok işaretli 24 dosyada
   "en az bir kesin yıkıcı işaret" ölçütüyle hükmedildi. Bu 24'ün hükmünü değiştirecek bir
   yorum yok (her birinde DROP ya da var olan tabloya DML ya da SECURITY DEFINER var), ama
   satır satır okunmadı.
2. Tarama düz regex; gerçek SQL ayrıştırıcı değil. `DO $$ ... $$` blokları içindeki dinamik
   SQL görülür ama anlamı çözülmez.
3. Evren 30 gün. Katalog yoğun bir dönemdi (DML ağırlığı bu yüzden yüksek olabilir); sakin bir
   dönemde oran farklı çıkabilir.
