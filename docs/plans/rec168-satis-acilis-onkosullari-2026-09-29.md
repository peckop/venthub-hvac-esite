# REC-168 — Satış açılış önkoşulları: betik, önkoşul sağlanmadan canlıya "aç" yazmaz (PLAN v2)

Sahibi: URUN · Tarih: 2026-09-29 · Emir: OPS (karar 190 sonrası, Recep: "satış açmak istediğimizde ne olacak, bunu kim hatırlayacak?")
Yöneten cetvel: `docs/standards/satis-kipi-gecis-standard.md` (§6 betik, §8 açılış günü listesi, §9 kapılar) · ölçüm defteri `docs/olcum/satis-hazirligi.md` (10 adım, sahibi OPS).
YÖNTEM: elle (tek dosya çifti + test) + plan-challenger 1 ajan (sonnet); sapma yok.

## 0. v2: plan-challenger (KOŞULLU, 8 bulgu) ve işlenişi

| # | Bulgu | İşlem |
|---|---|---|
| 1 KRİTİK | K2: `healthz` `verify_jwt=true` → kimliksiz GET 401 → K2 hep RET. Ayrıca `odemeOrtami='prod'` yalnız konak adında "sandbox" geçmemesi; anahtar çiftinin canlı olduğunu kanıtlamaz | K2 **anon JWT** ile çağrılır; testler gerçek 401/200/503 gövde fixture'larıyla. "prod" ölçütünün sınırı §6'da yazılı; canlı İyzico sözleşmesi K2'nin işi DEĞİL |
| 2 KRİTİK | K7: fatura katmanı kalıcı RET → satış kodla hiç açılamaz; iş kararı | K7 = **Recep damgalı beyanı** (`--fatura-beyani "<Recep sözü · tarih>"`, ≥20 karakter); beyan yoksa RET. Beyan metni rapora ve `site_settings` satırına damgalanır. Beyanın verilip verilmeyeceği **Recep kararı** (OPS'a soruldu) |
| 3 KRİTİK | K8: `tutarliMi` şimdiki durumu ölçer; yarım kalmış `--yon ac` sonrası TUTARSIZ → onarım kilitlenir. K3 de anahtar açıkken 409 döner | K8 önkoşuldan **çıkarıldı**; yerine "hedef plan tutarlılığı" (planla() sonrası beklenen durum tutarlı mı, saf hesap). K3 yalnız anahtar KAPALIyken uygulanır (açıksa `--yon ac` zaten no-op) |
| 4 ORTA | "Atlama bayrağı yok" gerçek değil (service-role elle yazım atlatır); K1 satış kapısından katı (etbis/iys/verbis) | Yalnız **ölçüm-kalitesi kalemleri K1 ve K6** için `--muaf K1 --muaf-gerekce "<≥20 karakter>"`, rapora ve satıra damgalı. K2–K5, K7 muaf OLAMAZ |
| 5 ORTA | K4/K5 zayıf (yalnız ad; yanlış tabloda aynı ad geçer; INSERT politikası ifadesi `with_check`'te) | K5: `tgrelid`+`tgenabled='O'`+BEFORE+`not prosecdef`. K4: politika adı+cmd+`RESTRICTIVE`+roller, ayrıca `satis_kipi_oku()` RPC'si ve 3 webhook tetiği (`on_site_settings_satis_kipi_*`, `tgenabled='O'`); mümkünse `satis-kipi-canli.mjs` 2a–2e davranış kolları yeniden kullanılır |
| 6 ORTA | TOCTOU/sıra: `olc` önkoşuldan önce alınıyor | Sıra: **önkoşul → taze `olc` → yedek → yazma**; K2/K4/K5 yazımdan hemen önce **yeniden** ölçülür (yazma öncesi son kapı) |
| 7 ORTA | `degerlendir([])` = geçti; sabit sayı testi yetmez; K1 anchorsız desen yanlış-kırmızı verebilir; 12 URL listesi yok | `sonuclar.length === KALEMLER.length` ve id kümesi eşit değilse RET; K1 yalnız yasal sayfa GÖVDESİNİ tarar (`<main>`), 12 URL `Routes.legal.*` × `tr`/`en` listesinden |
| 8 DÜŞÜK | Sır/kapsam: env izin listesi; hata mesajı süzme; eksik ölçülebilir kalemler (`legalReviewCompleted`, KDV, iade şeması, webhook sırrı, durum monotonluğu tetiği) | Env yalnız izin listesindeki adlardan okunur; hata/gövde ham basılmaz (ilk 120 karakter, bağlantı dizesi süzülür). Kapsam dışı kalemler §6'da **adıyla** listelenir (kapı bunları söylemez); `legalReviewCompleted` ve durum monotonluğu tetiği bir sonraki sürümde eklenecek kalemler olarak kayda geçer |

## 1. Sorun, tek cümle

Bugün `--yon ac --uygula --onay "..."` yalnız bir **söze** dayanır; betik onayı doğrulayamaz, kaydeder (§6). Açılış günü listesi (§8) ise **insan hafızasına** bağlı bir tablo. Hafıza unutur, betik unutmaz: açılışta eksik bir şey (yer tutucu, sandbox ödeme, kapısız edge fonksiyonu…) müşteriye ödeme açar.

## 2. Karar

`scripts/kip/satis-kipine-gec.mjs`, yönü **AÇ** olan her yazımdan önce (ve kuru koşumda da) bir **önkoşul tablosu** ölçer ve basar. **Tek bir kalem "GEÇTİ" değilse `--uygula` canlıya hiçbir şey yazmadan çıkış 1 verir.** "Ölçülemedi" = **RET** (hiçbir kalem varsayılanla geçmez).

- Kuru koşum (`--yon ac`): tablo + mevcut plan basılır, çıkış 0; en altta `AÇILAMAZ: n kalem` ya da `AÇILABİLİR`.
- `--onkosul` (yeni, salt okuma): yalnız tablo; çıkış 0 = hepsi geçti, 2 = geçmeyen var. `satis-hazirligi.md`'nin "yeniden ölçme tetikleyicisi" bunu çağırır: hatırlayan sistemdir.
- `--yon kapat`, `--dogrula` ve hedefi KAPALI olan `--geri-al` önkoşula **tabi değil** (kapatmak her zaman serbest). Hedefi AÇIK olan `--geri-al` açma sayılır → önkoşula tabi.
- **Genel atlama bayrağı YOK**; yalnız K1 ve K6 için gerekçeli, damgalı muafiyet (bulgu 4). Ölçüt yanlış-kırmızı veriyorsa çare ölçütü PR ile düzeltmektir.

## 3. Kalemler (her birinin sahibi ve kanıtı tabloda basılır)

| # | Kalem | Ölçüm (otomatik) | Sahip | Bugün beklenen |
|---|---|---|---|---|
| K1 | Yasal sayfalarda yer tutucu/sahte metin yok | Canlı 12 yasal sayfa (`Routes.legal.*` × tr/en) gövdesi: ham `\[[A-Z0-9_]{3,}\]` = 0 **VE** görünüm metni (TR/EN) = 0. (Görünüm metni #1526 ile ham yer tutucuyu gizler; yalnız ham=0 bugün de yeşil verirdi.) Muaf olabilir | Recep (şirket bilgisi) + URUN | RET |
| K2 | Ödeme ortamı canlı | `healthz` **anon JWT ile**: `durum=saglikli` **VE** `config.odeme_ortami='prod'` (`sandbox`/`bilinmiyor`/401/503/ulaşılamadı = ret). Sınır: 'prod' yalnız konak adı ölçütüdür (§6) | Recep (İyzico canlı anahtar) + ALTYAPI | RET (sandbox) |
| K3 | Edge satış kapısı canlıda | ALTYAPI'nın plan v2 §5 probu: kimlikli, boş sepetle `iyzico-payment` POST → anahtar KAPALIyken `403 SALES_CLOSED` (`409 VALIDATION_EMPTY_CART` = kapı yok = ret). Yalnız anahtar KAPALIyken uygulanır. Kimlik yoksa **ölçülemedi = ret** | ALTYAPI (REC-355) | RET |
| K4 | `site_settings` kilidi + RPC + webhook tetikleri | Politika adı+cmd+RESTRICTIVE+roller; `satis_kipi_oku()` RPC var; 3 tetik `on_site_settings_satis_kipi_*` `tgenabled='O'`. `SUPABASE_DB_URL` yoksa ölçülemedi = ret | URUN | GEÇER (#1536 sonrası, canlıda ölçüldü) |
| K5 | Sipariş bekçisi tetikleri var | `pg_trigger`: `orders_istemci_yazma_bekcisi`, `order_items_istemci_yazma_bekcisi`, `iade_istemci_kayit_bekcisi`; `tgrelid` doğru tablo, `tgenabled='O'`, BEFORE, `not prosecdef` (#1454) | ALTYAPI | GEÇER |
| K6 | E-posta göndericisi doğrulanmış | Resend `GET /domains`: `venthub.com.tr` `status='verified'`. `RESEND_API_KEY` yoksa ölçülemedi = ret. Muaf olabilir | Recep + ALTYAPI (REC-368) | RET (anahtar yok/ölçülmedi) |
| K7 | Fatura yolu | Varsayılan **RET**. Tek açık yol: **Recep damgalı beyanı** `--fatura-beyani "<Recep sözü · tarih>"` (≥20 karakter), metin **"e-arşiv faturaları `<yöntem>` ile kesilecek (mali müşavir teyitli)"** kalıbında; `<yöntem>` boş/genel ("ilerde", "bakılacak") ise RET. Beyan `site_settings` damgasına yazılır. Entegratör bağlanınca sahibi otomatik ölçücü ekler | Recep | RET (açılış günü Recep'e sorulur; OPS hükmü: şimdi sorulmaz) |

**K7 cetvel cümlesi (OPS hükmü, olduğu gibi cetvele geçer):** e-arşiv faturası yasal zorunluluktur. Beyan **faturasız satışa izin DEĞİLDİR**; faturanın otomasyon dışı (elle/mali müşavir aracılığıyla) kesileceğinin taahhüdüdür.
| K8 | Hedef plan tutarlılığı | `planla()` sonrası beklenen durum tutarlı (saf hesap; şimdiki durum DEĞİL: yarım kalmış açılış onarılabilsin) | URUN | GEÇER |
| K9 | Müşteri e-postası gerçekten gidiyor (OPS 09-29 eki, ALTYAPI ölçümü) | Son 30 günde `order_email_events`/`quote_email_events` `status='sent'` + `provider_message_id` **veya** `shipping_email_events` `provider_message_id` (bu tabloda `status` kolonu YOK, ölçüldü) satırı; üç tablodan toplam ≥ 1. K6 alan doğrulamasını, K9 **gönderim kanıtını** ölçer. DB yoksa ölçülemedi = ret | ALTYAPI (REC-368) | RET (üç tablo bugün 0 satır; ilk deneme e-postası gidene dek) |

Kısa devre yok: tablo hepsini basar, Recep tek koşumda **tüm** eksikleri görür.

## 4. Yapı

- Yeni modül `scripts/kip/acilis-onkosullari.mjs`: `KALEMLER = [{ id, ad, sahip, kanit, muaf: bool, olc? }]` + saf `degerlendir(sonuclar)`. `olc` yoksa `RET (ölçüt yok)`; `olc` hata fırlatırsa/`undefined` dönerse `OLCULEMEDI` = ret. `sonuclar.length === KALEMLER.length` ve id kümesi eşleşmezse RET; **sabit kalem sayısı (9)**: sessiz silme test kırmızısı.
- `satis-kipine-gec.mjs` yalnız bu modülü import eder. `--uygula` yolunda sıra: önkoşul → taze `olc` → yedek → **K2/K4/K5 yeniden ölç** → yazma. Ret ise DB'ye yazma yok, yedek yazma bile yok.
- Ölçücüler enjekte edilebilir (mock istemci/`fetch`): kapı canlıya bağlanmadan sınanır (INV-SATIS-KIPI-4 ile aynı desen). Env yalnız izin listesinden okunur (`SUPABASE_DB_URL`, `RESEND_API_KEY`, `KIP_PROBE_EPOSTA`/`KIP_PROBE_PAROLA`, anon anahtar); hata metni süzülür.
- Cetvel: `satis-kipi-gecis-standard.md` §8'e "otomatik ölçülen kalemler betikte; bu liste belgedir, kapı betiktir" notu + yeni **§8.1 Açılış önkoşulları** + §9'a **INV-SATIS-KIPI-7**. (Numara 6 ödeme kapısında kullanıldı.)
- Araç envanteri: yeni betik `arac-envanteri.cjs --yaz` ile eklenir (üretici komut; envanter çakışırsa `--theirs` + yeniden üret).

## 5. Test (INV-SATIS-KIPI-7) ve sabotaj

Dosya: `src/__tests__/conformance/satis-kipi-acilis-onkosullari.test.ts`.

1. Hepsi geçti (ya da muaf) + `--uygula` → yazma çağrısı **yapılır** (pozitif kontrol).
2. Tek kalem RET → yazma çağrısı **0**, çıkış 1 (her kalem için tek tek: 9 kol; muaf olamayanlar muafiyet istese de RET).
3. Ölçücü hata fırlatır / `undefined` döner → ret (ölçülemedi geçmez).
4. Ölçücüsü olmayan kalem → ret; `degerlendir([])` → ret; id kümesi eksik → ret.
5. Kuru koşum: tablo basılır, yazma 0, çıkış 0; `--onkosul` çıkış 0/2.
6. `--yon kapat` önkoşulsuz çalışır; hedefi açık `--geri-al` önkoşula tabi.
7. Kalem sayısı = 9 (sessiz kalem silme kırmızı).
8. K1: ham=0 ama görünüm metni ≥1 sayfada → RET (gizleme yeşil sayılmaz). K2: gerçek gövde fixture'ları (401, 200 sandbox, 200 prod, 503). K5: yanlış tabloda aynı adlı tetik → RET.
9. TOCTOU: önkoşul geçtikten sonra K5 yazımdan önceki yeniden ölçümde düşerse yazma **0**.

**Sabotaj (kırmızı gösterilir, sonra geri alınır):** (a) `if (!onkosulGecti) return` satırını sil → 2. madde kırmızı; (b) `ölçülemedi`'yi geçer say → 3. madde kırmızı; (c) K1'de yalnız ham desen ölç → 8. madde kırmızı; (d) yeniden-ölçüm adımını sil → 9. madde kırmızı. Sınıflayıcı kapı-devre-dışı sabotajını engellerse birim testle kanıt PR'a yazılır (#1487 emsali).

## 6. Sınırlar — dürüstlük

- K2 'prod' yalnız konak adı ölçütüdür (`config_audit.ts`); İyzico canlı anahtar çiftinin **geçerliliğini** kanıtlamaz. Bunu ancak ilk gerçek ödeme/canlı sözleşme gösterir; kapı bunu iddia etmez.
- K3 kimlikli probe ister: kimlik bugün **yok** → tablo "ölçülemedi" basar. Bu plan kimlik **üretmez** (ALTYAPI sahibi; çalışma anında test kullanıcısıyla oturum açılır, JWT saklanmaz).
- K6 `RESEND_API_KEY` ister (bugün `.env`'de yok); yerel anahtar edge'deki anahtarla aynı olmayabilir.
- "Hepsi geçti" **satışa hazır** demek değildir: yalnız *otomatik ölçülebilen* açılış koşullarını söyler. Bu tabloda OLMAYAN, adıyla: hukukçu teyidi (`legalReviewCompleted`, sonraki sürüm), KDV `tax_rate` ölçümü (§8 m.4), iade şeması (REC-159/57), İyzico webhook sırrı (`auditConfig` yalnız 5 kalem), durum monotonluğu tetiği (defter #3, sonraki sürüm), e-posta içerik testi. `satis-hazirligi.md` ve §8 belge listesi bunları taşır.
- Betiği kullanmadan `site_settings`'e service-role ile elle yazım bu kapıyı **atlar**; panelden yazımı #1536'nın kısıtlayıcı politikası kapatır, service-role için ayrı kayıt (REC-355).

## 7. Sıra

1. #1536 birleşti ve canlıda ölçüldü ✓.
2. Bu plan v2 → OPS onayı (K7 kararı Recep'ten).
3. Kod + test + cetvel + envanter (tek PR, migration yok) → OPS onayı ile birleşir.
4. Şerit talebi: `scripts/kip/**` + `src/__tests__/conformance/satis-kipi-*` claim'e eklenir (kod başlamadan).
