# Yayın günü runbook'u — Pazar 11 Ekim 2026 (yeni adres şeması)

**Sürüm 0.1 (taslak, OPS incelemesi için) · 2026-10-09 · Sahibi: ALTYAPI · Kaynak: Kanban ALT-37 (OPS emri 2026-10-09) · Dayanak: `docs/plans/rec-adres-agac-tek-yayin-2026-09-07.md` Faz 3-C/4/5, §6, §7, §11 · `docs/plans/rec-300-plan-tazeleme-2026-10-08.md` §3 · `docs/standards/rota-dili-standard.md` R2, R3, §3**

> **Bu dosya niçin var.** Yayın gününde "şimdi ne yapıyorduk" sorusu hatırlanarak cevaplanmasın. Her adımın komutu, beklenen çıktısı, durma ölçütü ve geri alma yolu burada yazılıdır. Komutların hepsi mevcut betiklerdir; bu belgeyi yazarken **kapalı durumdaki canlı siteye** yalnız GET atan iki ölçüm denendi (§3.1, §9). Bir komutun çıktısı burada yazılı beklentiden saparsa **durulur ve OPS'a sorulur**; beklenti sessizce değiştirilmez.

## 0. Bir bakışta

| Konu | Karar |
|---|---|
| **Açılan** | (1) `NEXT_PUBLIC_ADRES_DILI=1`: statik sayfa adresleri (`/tr/hakkimizda`, `/tr/about` → 308). (2) `ADRES_SEMASI_K3B=true` (3-C PR'ı): kategori, aile ve marka adresleri, eski adresler tek sıçrama. |
| **Açılmayan** | `EN_YAYIN` kapalı kalır (hreflang ve site haritasında EN yok). Model sayfaları kapalı: "yayındaki modeller" listesi **boş** (`src/config/yayindaModeller.veri.json`), yeni model adresi 404, eski model adresi tek 308 ile ailenin sayfasına. Sepet, ödeme, hesap (Aşama 2) dokunulmaz. |
| **Sıra** | taban ölçümü → env değişkeni → 3-C birleştirme → dağıtım → doğrulama → karar kapısı → IndexNow → GSC ve haberler. |
| **Geri dönüşsüz adımlar** | 3-C birleştirme (dizine girmeden önce geri alınabilir) ve IndexNow gönderimi (geri alınamaz). IndexNow **en sona** konur. |
| **Çıktı klasörü** | `C:/tmp/yayin-11-ekim/` (depo dışı; ölçüm çıktısı depoya girmez). |

**Roller.** OPS: pencereyi açar/kapatır, 3-C'yi birleştirir, karar kapısını verir, Recep'e haber verir. ALTYAPI: ölçümler, Vercel değişkeni, doğrulama, geri alma yürütmesi. URUN: 3-C PR'ının içeriği. GEO-SEO: IndexNow, GSC, `llms.txt`. KATALOG: karar 157 haberi.

**Saatler (ÖNERİ, OPS onaylar).** Hazırlık Cumartesi akşamı. Pencere Pazar **10:00–11:30**: 10:00 duyuru + T0 matrisi · 10:10 env değişkeni · 10:12 3-C birleştirme · ~10:20 dağıtım hazır · 10:20–10:45 doğrulama · **10:45 karar kapısı** · 11:00 IndexNow · 11:20 GSC ve haberler.

## 1. Ön koşullar (hepsi ✔ olmadan pencere açılmaz)

| # | Ön koşul | Nasıl doğrulanır | Sahibi | Durum (09 Ekim 15:40) |
|---|---|---|---|---|
| 1 | Recep'in Cuma önizleme onayı ("gördüm, tamam", karar 68) | OPS'un Recep'ten aldığı yanıt | OPS | bekliyor |
| 2 | **3-C PR'ı hazır ve CI yeşil**: `ADRES_SEMASI_K3B = true` + eski adres haritası + `next.config`'ten 19 satırın silinmesi (+ #1738 tek gövde bayrağı, karar 298 şartı) | `gh pr view <no> --repo peckop/venthub-hvac-esite --json mergeable,statusCheckRollup`; PR açıklamasında **beklenen site haritası sayısı** ve **harita dosyasının yolu** yazılı | URUN / OPS | **PR henüz açık değil** (bkz. §10 madde 1) |
| 3 | Birleştirme dondurması: pencere boyunca başka PR birleşmez (her birleşme Production dağıtımı başlatır; env değişkeni `1` iken erken açılış riski) | OPS duyurusu | OPS | planlanacak |
| 4 | Taban ölçümleri alındı (§3) | `C:/tmp/yayin-11-ekim/` dosyaları | ALTYAPI | Cumartesi akşamı |
| 5 | Geri alma hedefi bilinir: şimdiki Production dağıtımı READY ve **dağıtım numarası not edildi** | Vercel → Deployments (ya da Vercel MCP `list_deployments`) | ALTYAPI | Cumartesi akşamı |
| 6 | Production `NEXT_PUBLIC_ADRES_DILI` şimdi `0` (ya da tanımsız); Preview `1` | Vercel → Settings → Environment Variables | ALTYAPI | Cumartesi akşamı |
| 7 | IndexNow anahtar dosyası yayında: `curl -s https://venthub.com.tr/$INDEXNOW_KEY.txt \| wc -c` → **32** | komutun kendisi | ALTYAPI / GEO-SEO | Cumartesi akşamı |
| 8 | `EN_YAYIN` kararı: kapalı (OPS'ta bekleyen karar; bu runbook kapalı varsayar) | OPS | OPS | bekliyor |

## 2. Hazırlık: taban ölçümleri (Cumartesi akşamı; hepsi **kapalı** durumda)

Komutlar çalışma ağacı `C:/tmp/vh-alt38-s27` (ya da güncel `master`) içinde koşar; hepsi yalnız GET atar.

| # | Ölçüm | Komut | Beklenen | Dur ölçütü |
|---|---|---|---|---|
| 2.1 | Kapalı matris (canlı) | `node scripts/adres/matris.cjs --taban https://venthub.com.tr --cikti C:/tmp/yayin-11-ekim/matris-kapali-once.json` | çıkış 0; özet satırı `adresSayisi` ≈ **241**, `hataSayisi` **0**. 09 Ekim denemesi: `200: 180, 404: 61`, dilsiz hop dağılımı `{0:2, 1:16, 2:1, 3:17, 4:9}` (bugünkü 4 hop'a kadar zincirler) | `hataSayisi` > 0 → ağ/site sorunu, pencere ertelenir |
| 2.2 | **Açık beklenen matris** (yayından sonra canlının eşleşeceği şey) | Cuma önizlemesi ayaktaysa: `node scripts/adres/matris.cjs --taban http://localhost:3100 --cikti C:/tmp/yayin-11-ekim/matris-acik-beklenen.json`. Ayakta değilse önce `node scripts/onizleme.mjs --adres` ile yeniden kurulur (derleme ≈ 25 dk) | çıkış 0 | önizleme ağacı 3-C'nin içeriğini taşımıyorsa (bayrak yaması ≠ 3-C PR'ı) beklenen matris yanlış olur: OPS'a söyle |
| 2.3 | Eski adres evreni (bugünkü site haritası) | `node scripts/seo/adres-yayin-denetim.mjs --taban https://venthub.com.tr --cikti C:/tmp/yayin-11-ekim/taban` | çıkış 0; `C:/tmp/yayin-11-ekim/taban/eski-adresler.json` yazılır | çıkış 3 (EVREN-BOS) → site haritası boş okundu, durulur |
| 2.4 | Canlı kapı tabanı | 09 Ekim tabanını alan komutun aynısı (`docs/audits/rec-300-taban-2026-10-09.md` §4); kayıt durumu için `--kayit-durum` JSON'u | 09 Ekim: KIRMIZI 92 = yeni 82 + bilinen 10, UYARI 74, çıkış 1 (JSON-LD ve `llms.txt` sayıları) | yeni kırmızı kod yoksa devam; olan taban sayısı bu tablodan farklıysa tabanı yeniden yaz |
| 2.5 | Bağlantı taraması | `node scripts/seo/link-tara.mjs --taban https://venthub.com.tr --cikti C:/tmp/yayin-11-ekim/link-once` | 09 Ekim: 92 sayfa, 1139 tekil adres, **kırık 0** | kırık > 0 → önce nedeni (REC-493 notu: iç bağlantı 308'lerini bu sayaç görmez, `canli-kapi` görür) |

## 3. Pencere (T0 ve sonrası)

| Adım | Saat | Kim | Eylem / komut | Beklenen | Geri alma / dur |
|---|---|---|---|---|---|
| A1 | 10:00 | OPS | Pencere açıldı, birleştirme dondurması başladı | duyuru | — |
| A2 | 10:00 | ALTYAPI | **T0 matrisi**: `node scripts/adres/matris.cjs --taban https://venthub.com.tr --cikti C:/tmp/yayin-11-ekim/matris-kapali-t0.json`, sonra `node scripts/adres/matris.cjs --karsilastir C:/tmp/yayin-11-ekim/matris-kapali-once.json C:/tmp/yayin-11-ekim/matris-kapali-t0.json` | çıkış 0 (**fark ∅**; bayrak kapalıyken canlı değişmemiş) | çıkış 1 → fark listesi OPS'a; sebep bulunmadan açılmaz |
| A3 | 10:10 | ALTYAPI (OPS "şimdi" der) | Vercel → Production → `NEXT_PUBLIC_ADRES_DILI` = **`1`** (tam `1`; `true` açmaz). Bu adım tek başına dağıtım başlatmaz | değişken `1`, Preview `1` | geri alma: değişkeni `0` yap |
| A4 | 10:12 | OPS | **3-C PR'ını birleştir** (`ADRES_SEMASI_K3B = true` + harita + config). Production dağıtımı kendiliğinden başlar | dağıtım "Building" | A5'te kırmızı → §7 |
| A5 | ≈10:20 | ALTYAPI | Production dağıtımı **READY** ve commit = 3-C birleştirme commit'i (Vercel Deployments) | READY, derleme günlüğünde hata yok | READY olmadı / 15 dk'yı aştı → §7 seviye 2 |
| A6 | 10:20–10:45 | ALTYAPI | **Doğrulama** (§4), sırayla | hepsi yeşil | §4'teki dur ölçütleri |
| A7 | **10:45** | **OPS** | **Karar kapısı:** devam (IndexNow) ya da geri al (§7) | yazılı karar | — |
| A8 | 11:00 | ALTYAPI + GEO-SEO | IndexNow (§5) | 200/202 | gönderim geri alınamaz |
| A9 | 11:20 | GEO-SEO / OPS | GSC ve haberler (§6) | — | — |
| A10 | 11:30 | OPS | Kapanış: dondurma kalkar, Recep'e özet | — | — |

## 4. Doğrulama (A6)

| # | Ölçüm | Komut | Beklenen | Dur ölçütü |
|---|---|---|---|---|
| 4.1 | Açık matris = beklenen | `node scripts/adres/matris.cjs --taban https://venthub.com.tr --cikti C:/tmp/yayin-11-ekim/matris-acik-sonra.json --dilsiz-hop-en-cok 1`, sonra `node scripts/adres/matris.cjs --karsilastir C:/tmp/yayin-11-ekim/matris-acik-sonra.json C:/tmp/yayin-11-ekim/matris-acik-beklenen.json` | ilk komut çıkış 0 (dilsiz adreslerde **en çok 1 hop**; kapalıyken 4'e çıkıyordu); ikinci komut çıkış 0 (**fark ∅**) | fark varsa liste OPS'a; **kritik** (aşağıdaki 4.4) → geri al, kritik değil → ileri düzeltme kararı OPS'ta |
| 4.2 | Önizleme taraması, **canlıya karşı** (247 adres) | `node scripts/adres/onizleme-tarama.cjs --taban https://venthub.com.tr --cikti C:/tmp/yayin-11-ekim/tarama-canli.json` | çıkış 0, her satır "tamam". Yeni model adresleri 404, eski model adresleri **tek 308 → ailenin sayfası**, yeni statik adresler 200, eski dilli adresler tek 308 | kırmızı satır → liste OPS'a |
| 4.3 | Yayın denetimi (eski adresin tamamı, harita, sayfa) | `node scripts/seo/adres-yayin-denetim.mjs --taban https://venthub.com.tr --cikti C:/tmp/yayin-11-ekim/sonra --eski C:/tmp/yayin-11-ekim/taban/eski-adresler.json --harita <3-C PR'ının eski→yeni haritası> --model-beklenen 0 --sayfa-denetimi --en-harita-disi-bilincli` | çıkış 0: her eski adres 200 ya da **tek 308 → 200**, haritadaki her adres yönlendirmesiz 200, canonical = kendi adresi, hreflang tr + x-default | çıkış 1 → KIRMIZI satırlar OPS'a; çıkış 3 → evren boş |
| 4.4 | **Kritik elle kontrol** | `curl -s -o /dev/null -w "%{http_code}\n" https://venthub.com.tr/tr/cart` ve `.../tr/checkout` ve `.../tr` | hepsi **200** | biri 200 değil → **hemen geri al (§7 seviye 2)** |
| 4.5 | Tek sıçrama örneği | `curl -s -o /dev/null -w "%{http_code} %{redirect_url}\n" https://venthub.com.tr/category/fanlar` | 307/308 ve hedef yeni adres; hedef `-w "%{http_code}"` ile 200 | hedef 404 ya da ikinci sıçrama → liste OPS'a |
| 4.6 | Site haritası | `curl -s https://venthub.com.tr/sitemap.xml \| grep -c "<loc>"` | **3-C PR'ında yazılı beklenen sayı** (EN alternatif yok; model adresi 0) | sayı farklı → OPS |
| 4.7 | Canlı kapı + bağlantı | 2.4 ve 2.5'in aynı komutları, çıktı klasörleri `canli-kapi-sonra`, `link-sonra` | kapı: KIRMIZI kod kümesi tabandakinden **büyümez** (JSON-LD ve `llms.txt` kodları başka kayıtlarda); bağlantı: kırık **0**, zincir **0** | yeni kırmızı kod ya da kırık → liste OPS'a |
| 4.8 | Hata gözlemi | Vercel runtime günlüğü (5xx), Sentry yeni issue (son 15 dk) | 5xx artışı yok, yeni issue yok | belirgin artış → geri al kararı OPS'ta |

## 5. IndexNow (A8; yalnız karar kapısı "devam" dedikten sonra)

IndexNow **geri alınamayan dış eylemdir**: Bing'e eski adresler gitmesin diye (karar 164 A, K4) yayından sonra, doğrulamadan sonra gönderilir.

| # | Adım | Komut | Beklenen |
|---|---|---|---|
| 5.1 | Anahtar dosyası | `curl -s https://venthub.com.tr/$INDEXNOW_KEY.txt \| wc -c` | 32 |
| 5.2 | Yerel kopya 3-C'yi içerir (kapı bayrağı `src/config/features.ts` metninden okur) | `git -C C:/tmp/vh-alt38-s27 fetch origin && git -C C:/tmp/vh-alt38-s27 merge --ff-only origin/master` ve `grep -n "ADRES_SEMASI_K3B = " src/config/features.ts` | `= true` |
| 5.3 | Kuru koşum | `INDEXNOW_KEY=<anahtar> node scripts/seo/indexnow-bildir.mjs --kuru` | bulunan URL sayısı **beklenen sayıya eşit** (§10 madde 5); `EN_YAYIN` kapalı olduğundan site haritasında EN adresi yok, yani gönderilecek liste kendiliğinden yalnız TR |
| 5.4 | Gönderim (TEK kez) | 5.3'ün `--kuru`suz hâli | 200 ya da 202 (202: anahtar doğrulaması bekliyor, kabul edildi) |

## 6. Yayın sonrası (A9)

1. **GSC:** `sc-domain:venthub.com.tr` site haritasını yeniden gönder (arayüz; hizmet hesabının yazma yetkisi ölçülmedi); 5 örnek adres için indeksleme iste. İsteğe bağlı: `node scripts/seo/gsc-url-denetim.mjs --cikti C:/tmp/yayin-11-ekim/gsc` (Googlebot gözüyle son getirme).
2. **`public/llms.txt`:** statik adresler (`/tr/contact`, `/tr/about`) yeni adreslere güncellenir (GEO-SEO; eski adres 308 verir, kırık değildir; rota dili standardı §3).
3. **Haberler (karar 157):** KATALOG ve OPS'a "katalog paketi canlı DB'den yeniden üretilir".
4. **İki hafta izleme:** `docs/plans/rec-adres-agac-tek-yayin-2026-09-07.md` §8 (GSC "bulunamadı" birikimi 0, eski adres örneklemi tek hop, karar 86 şartı tıklama karşılaştırması).

## 7. Geri alma merdiveni

| Seviye | Ne zaman | Eylem | Süre | Sonrası |
|---|---|---|---|---|
| **1 — yalnız statik sayfa adresleri** | Sorun rota dilindeki (`/tr/hakkimizda` gibi) adreslerde, kategori/aile tarafı sağlam | Vercel: `NEXT_PUBLIC_ADRES_DILI` = `0` + **yeniden dağıt** (kod değişmez) | ≈ 6 dk (yeni derleme) | Kategori/aile (3-C) açık kalır; yalnız rota dili kapanır |
| **2 — her şey (ilk 30 dk, IndexNow gitmeden)** | Kritik kontrol (4.4) kırmızı, derleme hatalı, 5xx artışı, matris farkı büyük | Vercel → Deployments → ön koşul 5'te not edilen **önceki Production dağıtımı** → hemen geri döndür (Instant Rollback / Promote). **Sonra** `NEXT_PUBLIC_ADRES_DILI` = `0` yap | saniyeler (derleme yok); derleme çıktısı eski olduğundan iki bayrak da kapanır | Vercel'in domain atama durumunu panelde kontrol et. `matris.cjs` ile yeni matris `matris-kapali-once.json` ile **fark ∅**. 3-C için revert PR'ı açılır; açılana kadar dondurma sürer |
| **3 — kitlesel hata (IndexNow/GSC sonrası)** | Yayından saatler/günler sonra | Plan §11: **yalnız Recep kararıyla**; revert PR'ı + env `0`. Yeni adresler dizine girmişse 404 olur: kayıp, o yüzden ileri düzeltme esastır | — | harita ve envanter commit'li; yanlış satır düzeltilir, yeniden derlenir |

Faz 1-B (kategori ağacı, 40 aile) 6 Ekim'de birleşti (#1352); yayın günü listesinde veritabanı adımı yoktur ve geri alma merdivenine veritabanı girmez.

## 8. "Kapalıyken fark 0" kanıtı

`onizleme-tarama.cjs` yalnız **açık** davranışı bekler (yeni adres 200, eski adres tek 308); kapalı canlıya karşı koşarsa kırmızı çıkar, bu bir kusur değildir. Bayrak kapalıyken "canlıda hiçbir şey değişmedi" kanıtı **matris karşılaştırmasıdır** (A2: T0 ile önceki matris, geri alma sonrası: önceki matris ile yeni matris, ikisi de çıkış 0). Kapalı kip için tarama betiğine ayrı bir bayrak eklemek bu belgenin kapsamında değildir.

## 9. Bu belge yazılırken ölçülenler (09 Ekim, kapalı canlı, yalnız GET)

- `matris.cjs --taban https://venthub.com.tr`: 43 sn, çıkış 0, `adresSayisi` 241, `hataSayisi` 0, durum dağılımı `200: 180, 404: 61`, dilsiz hop dağılımı `{0:2, 1:16, 2:1, 3:17, 4:9}`.
- `onizleme-tarama.cjs --liste` (ağ yok): beklenen adres sayısı **247**; `matris.cjs --liste`: 241.
- Henüz **koşulmayanlar:** §2.2–2.5, §4 (açma olmadan anlamsız), §5 (IndexNow anahtarı gerekir).

## 10. Açık noktalar (OPS)

1. **3-C PR'ını kim hazırlıyor?** Açık PR yok. PR açıklamasında şu üçü yazılı olmalı: beklenen site haritası sayısı, eski→yeni harita dosyasının yolu, #1738'in aynı yayında olup olmadığı (karar 298 özeti şartı).
2. Pencere saati: öneri Pazar 10:00; Recep'e önceden haber verilip verilmeyeceği.
3. **Vercel değişkenini kim değiştirir?** Öneri: ALTYAPI, OPS "şimdi" dedikten sonra (üretim ayarı değişikliği, açık onay).
4. `EN_YAYIN`: kapalı (24/28 kategori EN açıklaması eksik; karar OPS'ta).
5. **Karar 327** ("IndexNow yalnız TR") metni depoda yok. Bu belge `EN_YAYIN` kapalıyken site haritasında EN bulunmadığı için toplu betiğin kendiliğinden yalnız TR göndereceğini varsayar; beklenen URL sayısını OPS/GEO-SEO verir (5.3). Plan tazelemesi §3 ölçüt 3 pilotta bildirim sayısını **0** diyordu; karar 327 bunun yerine geçiyorsa 5.3 sayısı buna göre.
6. Canlı kapının kayıt durumunu hâlâ Linear API'sinden okuması (SEO-19 kapsamı): 2.4 için `--kayit-durum` JSON'u hazırlanmalı.
