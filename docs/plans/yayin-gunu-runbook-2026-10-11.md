# Yayın günü runbook'u — Pazar 11 Ekim 2026 (yeni adres şeması)

**Sürüm 0.3.1 (v0.3 master'da: #1808) · 2026-10-10 · Sahibi: ALTYAPI · Kaynak: Kanban ALT-37 (OPS emri 2026-10-09), ALT-50 · Dayanak: `docs/plans/rec-adres-agac-tek-yayin-2026-09-07.md` Faz 3-C/4/5, §6, §7, §11 · `docs/plans/rec-300-plan-tazeleme-2026-10-08.md` §3 · `docs/standards/rota-dili-standard.md` R2, R3, §3 · `docs/plans/rec300-model-adres-kategori-tr-adlari-2026-10-10.md` (URN-85)**

**0.2'den 0.3'e değişenler (10 Ekim).** (1) URN-85 veri migration'ı (#1802) prod'a indi: sekiz kategorinin TR adı değişti; taban ölçümleri **migration sonrası** alınır, `eski-adresler.json`'a sekiz eski adres **elle** eklenir (§2.3, §2.6). (2) Adres haritası artefaktı migration'dan sonra üretilir; ilk koşu düştü, düzeltme #1804 (§1 madde 3, §10). (3) §7 "veritabanı adımı yoktur" cümlesi kalktı: veritabanı geri alma betiği ayrıdır. (4) §5: `--yalniz-yeni` master'da; A8 anahtar yolu yazıldı (GEO-SEO). (5) 3-C kural sayısı 25 (v0.2'de 19). (6) #1738 3-C'nin ardından aynı yayında (§4.7). **0.3 → 0.3.1 (10 Ekim, öğleden sonra):** (7) adres haritası üretildi ve URUN'a verildi, 3-C taslak PR'ı #1811'e bağlandı (§1 madde 3, §10 madde 10); (8) harita artık **commit'lenir** (plan §4.1 karar notu); (9) `?sku=` adreslerinin davranışı URUN'un ölçümüyle yazıldı (§10 madde 17, tıklama listesi satır 18); (10) #1804, #1803 ve #1808 birleşti, #1807 çift olduğu için kapandı.

> **Bu dosya niçin var.** Yayın gününde "şimdi ne yapıyorduk" sorusu hatırlanarak cevaplanmasın. Her adımın komutu, beklenen çıktısı, durma ölçütü ve geri alma yolu burada yazılıdır. Komutların hepsi mevcut betiklerdir; bu belgeyi yazarken **kapalı durumdaki canlı siteye** yalnız GET atan ölçümler denendi (§9). Bir komutun çıktısı burada yazılı beklentiden saparsa **durulur ve OPS'a sorulur**; beklenti sessizce değiştirilmez.

## 0. Bir bakışta

| Konu | Karar |
|---|---|
| **Açılan** | (1) `NEXT_PUBLIC_ADRES_DILI=1`: statik sayfa adresleri (`/tr/hakkimizda`, `/tr/about` → 308). (2) `ADRES_SEMASI_K3B=true` (3-C PR'ı): kategori, aile ve marka adresleri, eski adresler tek sıçrama. |
| **Açılmayan** | `EN_YAYIN` kapalı kalır (hreflang ve site haritasında EN yok). Model sayfaları kapalı: "yayındaki modeller" listesi **boş** (`src/config/yayindaModeller.veri.json`), yeni model adresi 404, eski model adresi tek 308 ile ailenin sayfasına. Sepet, ödeme, hesap (Aşama 2) dokunulmaz. |
| **Veritabanı** | Pazar günü listede veritabanı adımı **yoktur**. Sekiz kategorinin TR adı Cumartesi sabahı (10 Ekim 07:34Z) #1802 ile **prod'a indi**; bu yüzden geri alma merdiveninde veritabanı notu vardır (§7). |
| **Sıra** | taban ölçümü (migration sonrası) → env değişkeni → 3-C birleştirme → dağıtım → doğrulama → karar kapısı → IndexNow → GSC ve haberler. |
| **Geri dönüşsüz adımlar** | 3-C birleştirme (dizine girmeden önce geri alınabilir) ve IndexNow gönderimi (geri alınamaz). IndexNow **en sona** konur. |
| **Çıktı klasörü** | `C:/tmp/yayin-11-ekim/` (depo dışı; ölçüm çıktısı depoya girmez). |

**Roller.** OPS: pencereyi açar/kapatır, 3-C'yi birleştirir, karar kapısını verir, Recep'e haber verir. ALTYAPI: ölçümler, Vercel değişkeni, doğrulama, geri alma yürütmesi. URUN: 3-C PR'ının içeriği ve kategori adı migration'ı. GEO-SEO: IndexNow gönderimi (A8), GSC, `llms.txt`. KATALOG: karar 157 haberi.

**Saatler (OPS onayladı, 09 Ekim).** Hazırlık Cumartesi akşamı. Pencere Pazar **10:00–11:30**: 10:00 duyuru + T0 matrisi · 10:10 env değişkeni · 10:12 3-C birleştirme · ~10:20 dağıtım hazır · 10:20–10:45 doğrulama · **10:45 karar kapısı** · 11:00 IndexNow · 11:20 GSC ve haberler.

## 1. Ön koşullar (hepsi ✔ olmadan pencere açılmaz)

| # | Ön koşul | Nasıl doğrulanır | Sahibi | Durum (10 Ekim, öğle) |
|---|---|---|---|---|
| 1 | Recep'in Cuma önizleme onayı ("gördüm, tamam", karar 68) | OPS'un Recep'ten aldığı yanıt | OPS | ölçülmedi (OPS'ta) |
| 2 | **3-C PR'ı hazır ve CI yeşil**: `ADRES_SEMASI_K3B = true` + eski adres haritası + `next.config`'ten **25 kuralın** silinmesi (13 dilsiz kategori + 6 Lineo + 6 ürün; v0.2'de 19 yazıyordu, PR açıklamasından teyit edilir) + #1738 tek gövde bayrağı (karar 298 şartı, **3-C'nin hemen ardından aynı yayında**) | `gh pr view <no> --repo peckop/venthub-hvac-esite --json mergeable,statusCheckRollup`; PR açıklamasında **beklenen site haritası sayısı** ve **harita dosyasının yolu** yazılı | URUN / OPS | Taslak PR **#1811** açık (dal `urun/urn85-adres-acilis-3c-2`, uç `2a441fd67`; bayrak satırı onay gelene kadar taslak); URUN'un son vadesi **Cumartesi 14:00** |
| 3 | **Slug migration prod'da ve adres haritası ondan SONRA üretildi.** Sıra bağlayıcıdır: önce üretilen harita eski adı taşır ve çift sıçrama olur | (a) `supabase-migrate` koşumu success; (b) sekiz kategorinin TR adı yeni değerde; (c) `harita-uret.yml` migration commit'inden (`c3358bc19`) **sonraki** master'da koşmuş ve artefakt `eski-adres-haritasi` indirilmiş | URUN (migration), ALTYAPI (harita), OPS (birleştirme) | (a) ✔ koşum 38034894433, 07:34Z · (b) ✔ OPS ölçtü: 8/8 · (c) ✔ ilk koşu (run 38035691052) doğrulama adımında düştü, düzeltme **#1804** birleşti (`1d1d7e7b7`); yeniden koşu **38037549974 başarılı** (26 sn, master `518673b4f`), artefakt URUN'a verildi ve 3-C taslak PR'ına (#1811, uç `2a441fd67`) bağlandı: sha256 `030ae646f8dbdca9…` birebir, `--dogrula` tamam (URUN bildirdi). Katalog DB'yi değiştirirse harita yeniden üretilir |
| 4 | Taban ölçümleri alındı (§2), hepsi **migration sonrası** | `C:/tmp/yayin-11-ekim/` dosyaları | ALTYAPI | Cumartesi akşamı |
| 5 | Geri alma hedefi bilinir: şimdiki Production dağıtımı READY ve **dağıtım numarası not edildi** | Vercel → Deployments (ya da Vercel MCP `list_deployments`) | ALTYAPI | Cumartesi akşamı. **Erişim yolu (OPS kararı, 10 Ekim): Vercel MCP ile ALTYAPI penceresi** (`list_deployments`, `get_project_env`, yazım için `edit_project_env`). Cumartesi akşamı salt-okuma denemesi yapılır (değişken adı okunur, **değeri rapora yazılmaz**); sonucu OPS'a tek satır. Pazar'daki yazımı izin denetimi canlıya dağıtım sayıp durdurabilir: **durdurursa Recep'in sözü ALTYAPI penceresinde alınır; panel yolu yedektir, Recep yapar** |
| 6 | Production `NEXT_PUBLIC_ADRES_DILI` şimdi `0` (ya da tanımsız); Preview `1` | Vercel → Settings → Environment Variables (ya da Vercel CLI `vercel --scope peckops-projects env ls <ortam> --project venthub-hvac-esite`; değer okunmaz) | ALTYAPI | **Ölçüldü (10 Ekim, öğle, CLI; değerler okunmadı):** `NEXT_PUBLIC_ADRES_DILI` Production'da **tanımsız** (= kapalı ✔) ve Preview'da da **tanımsız** (v0.2'deki "Preview `1`" beklentisi karşılanmıyor; 3-C PR'ının Vercel önizlemesi statik sayfa adreslerini açmaz). Değişken yok olduğu için A3'te **oluşturulur** (`create_project_env`), düzenlenmez. MCP ile `filter_project_envs` **403** verdi (env okuma yetkisi yok); yazma yetkisi **denenmedi** (403 beklenir): Pazar'dan önce OPS/Recep ile yol netleşmeli |
| 7 | IndexNow anahtar dosyası yayında: anahtar depo sabitinden okunur ve canlı dosyayla karşılaştırılır (§5.1) | `export INDEXNOW_KEY=$(grep -oE "'[0-9a-f]{32}'" src/config/indexnow.ts \| tr -d "'")` sonra `curl -s https://venthub.com.tr/$INDEXNOW_KEY.txt \| wc -c` → **32** | GEO-SEO / ALTYAPI | Cumartesi akşamı. GEO-SEO 10 Ekim öğle denedi: anahtar 32 karakter, canlı dosya gövdesine eşit |
| 8 | `EN_YAYIN` **kapalı**. Karar 327: İngilizce vitrin 18 Ekim'de açılacak; Pazar günü açılmaz | OPS kararı; master'da `EN_YAYIN = false` | OPS | karar verildi; master'da `false` (ölçüldü 10 Ekim 08:45) |
| 9 | Pencere açılırken **master CI yeşil**: `INV-TABAN-TAZE-1` migration sonrası master push CI'ını kırmızı yaktı (şema tabanı 09 Ekim'de kalmıştı) | `gh run list --branch master --event push -L 3`; kırmızıysa ALT-50 şema tabanı PR'ı | ALTYAPI / OPS | şema tabanı OPS'un **#1806**'sıyla yenilendi (`518673b4f`), #1807 çift olduğu için kapandı; **master push CI sonucu ölçülmedi**: `4200646b8`'in CI'ı sonraki push (`f9b083de1`) ile iptal edildi, `f9b083de1`'inki sürüyor (11:47). Pencere açılırken yeniden okunur |
| 10 | Birleştirme dondurması: pencere boyunca başka PR birleşmez (her birleşme Production dağıtımı başlatır; env değişkeni `1` iken erken açılış riski) | OPS duyurusu | OPS | planlanacak |

## 2. Hazırlık: taban ölçümleri (Cumartesi akşamı; hepsi **kapalı** durumda ve **migration sonrası**)

Komutlar güncel `master`'dan açılmış bir çalışma ağacında koşar (`git fetch origin && git merge --ff-only origin/master`); hepsi yalnız GET atar. Tek taban zamanı kuralı (URUN teyit etti): `matris-kapali-once`, `matris-kapali-t0` ve `eski-adresler.json` **migration sonrası** ve aynı akşam alınır; böylece "kapalı önce ≡ kapalı T0" farkı ∅ kalır.

| # | Ölçüm | Komut | Beklenen | Dur ölçütü |
|---|---|---|---|---|
| 2.1 | Kapalı matris (canlı) | `node scripts/adres/matris.cjs --taban https://venthub.com.tr --cikti C:/tmp/yayin-11-ekim/matris-kapali-once.json` | çıkış 0; özet satırı `adresSayisi` ≈ **241**, `hataSayisi` **0** (09 Ekim denemesi, migration öncesi: `200: 180, 404: 61`, dilsiz hop dağılımı `{0:2, 1:16, 2:1, 3:17, 4:9}`; migration sonrası sayı **yeniden ölçülür**, kategori sayısı değişmediği için aynı beklenir) | `hataSayisi` > 0 → ağ/site sorunu, pencere ertelenir |
| 2.2 | **Açık beklenen matris** (yayından sonra canlının eşleşeceği şey) | **3-C PR'ının kendi dalından** önizleme derlemesi (≈ 25 dk): `node scripts/onizleme.mjs --adres`, sonra `node scripts/adres/matris.cjs --taban http://localhost:3100 --cikti C:/tmp/yayin-11-ekim/matris-acik-beklenen.json`. 3-C önizlemesi prod veritabanını okur: migration sonrası kökler yeni adla beklenir | çıkış 0 | önizleme ağacı 3-C'nin içeriğini taşımıyorsa (bayrak yaması ≠ 3-C PR'ı) beklenen matris yanlış olur: OPS'a söyle |
| 2.3 | Eski adres evreni (migration sonrası site haritası) **+ sekiz eski adres elle** | `node scripts/seo/adres-yayin-denetim.mjs --taban https://venthub.com.tr --cikti C:/tmp/yayin-11-ekim/taban`, sonra §2.6'daki sekiz eski adresi `C:/tmp/yayin-11-ekim/taban/eski-adresler.json` dizisinin sonuna ekle (tam adres, `https://venthub.com.tr/tr/category/<eski>`; dosya JSON dizisi ya da satır satır metin olabilir) | çıkış 0; `eski-adresler.json` yazılır; sekiz adres eklendikten sonra dizi uzunluğu = üretilen + 8 | çıkış 3 (EVREN-BOS) → site haritası boş okundu, durulur. Sekiz adres eklenmezse §4.3 bu sekizin "tek 308 → 200" olduğunu **ölçmez** |
| 2.4 | Canlı kapı tabanı | 09 Ekim tabanını alan komutun aynısı (`docs/audits/rec-300-taban-2026-10-09.md` §4); kayıt durumu için `--kayit-durum` JSON'u | 09 Ekim: KIRMIZI 92 = yeni 82 + bilinen 10, UYARI 74, çıkış 1 (JSON-LD ve `llms.txt` sayıları) | yeni kırmızı kod yoksa devam; olan taban sayısı bu tablodan farklıysa tabanı yeniden yaz |
| 2.5 | Bağlantı taraması | `node scripts/seo/link-tara.mjs --taban https://venthub.com.tr --cikti C:/tmp/yayin-11-ekim/link-once` | 09 Ekim: 92 sayfa, 1139 tekil adres, **kırık 0** | kırık > 0 → önce nedeni (REC-493 notu: iç bağlantı 308'lerini bu sayaç görmez, `canli-kapi` görür) |
| 2.6 | **Sekiz kategori adı (URN-85), kapalı kip, elle** | Aşağıdaki döngü (sekiz çift tablonun altında) | OPS 10 Ekim ölçtü: sekiz eski adres **tek 308** ile `/tr/category/<yeni>`'ye gider, sekiz yeni adres **200**. Taban aynı akşam yeniden alınır | herhangi biri farklıysa dur, OPS'a: bu sekiz adres Pazar günü matriste 200 → 308 farkı üretir |

**Sekiz çift** (kaynak: URUN planı `docs/plans/rec300-model-adres-kategori-tr-adlari-2026-10-10.md`, "Yapılacak" tablosu; EN kanonik ad değişmez):

| EN kanonik | Eski TR adı | Yeni TR adı (Design CSV) |
|---|---|---|
| control-systems | kontrol-sistemleri | kontrol-ve-suruculer |
| air-treatment | iklimlendirme-ve-hava-sartlandirma | hava-sartlandirma |
| water-coil-duct-heaters | sulu-batarya-kanal-tipi | sulu-bataryalar |
| single-room-hrv | tekil-oda-uniteleri | tek-oda-uniteleri |
| axial-industrial-fans | aksiyel-sanayi-fanlari | aksiyel-fanlar |
| spare-parts-sensors | yedek-parca-ve-sensorler | yedek-parcalar-ve-sensorler |
| bathroom-toilet-fans | banyo-ve-tuvalet-fanlari | banyo-tuvalet-fanlari |
| industrial-ceiling-fans | endustriyel-tavan-vantilatorleri | tavan-vantilatorleri |

Elle ölçüm döngüsü (`<yol>` kapalı kipte `category`, Pazar açık kipte `kategori`):

```
while read eski yeni; do
  a=$(curl -s -o /dev/null -w "%{http_code} %{redirect_url}" "https://venthub.com.tr/tr/category/$eski")
  b=$(curl -s -o /dev/null -w "%{http_code}" "https://venthub.com.tr/tr/<yol>/$yeni")
  echo "$eski -> [$a] ; yeni: $b"
done <<'EOF'
kontrol-sistemleri kontrol-ve-suruculer
iklimlendirme-ve-hava-sartlandirma hava-sartlandirma
sulu-batarya-kanal-tipi sulu-bataryalar
tekil-oda-uniteleri tek-oda-uniteleri
aksiyel-sanayi-fanlari aksiyel-fanlar
yedek-parca-ve-sensorler yedek-parcalar-ve-sensorler
banyo-ve-tuvalet-fanlari banyo-tuvalet-fanlari
endustriyel-tavan-vantilatorleri tavan-vantilatorleri
EOF
```

## 3. Pencere (T0 ve sonrası)

| Adım | Saat | Kim | Eylem / komut | Beklenen | Geri alma / dur |
|---|---|---|---|---|---|
| A1 | 10:00 | OPS | Pencere açıldı, birleştirme dondurması başladı | duyuru | — |
| A2 | 10:00 | ALTYAPI | **T0 matrisi**: `node scripts/adres/matris.cjs --taban https://venthub.com.tr --cikti C:/tmp/yayin-11-ekim/matris-kapali-t0.json`, sonra `node scripts/adres/matris.cjs --karsilastir C:/tmp/yayin-11-ekim/matris-kapali-once.json C:/tmp/yayin-11-ekim/matris-kapali-t0.json` | çıkış 0 (**fark ∅**; bayrak kapalıyken canlı değişmemiş; `matris-kapali-once` migration sonrası alındığı için sekiz adres farkı çıkmaz) | çıkış 1 → fark listesi OPS'a; sebep bulunmadan açılmaz |
| A3 | 10:10 | ALTYAPI (OPS "şimdi" der) | Vercel → Production → `NEXT_PUBLIC_ADRES_DILI` = **`1`** (tam `1`; `true` açmaz). Bu adım tek başına dağıtım başlatmaz. Yol: Vercel MCP `edit_project_env` (ALTYAPI penceresi); izin denetimi durdurursa Recep'in sözü ALTYAPI penceresinde alınır, panel yedektir (§10 karar 8a) | değişken `1`, Preview `1` | geri alma: değişkeni `0` yap |
| A4 | 10:12 | OPS | **3-C PR'ını birleştir** (`ADRES_SEMASI_K3B = true` + harita + config). Production dağıtımı kendiliğinden başlar | dağıtım "Building" | A5'te kırmızı → §7 |
| A5 | ≈10:20 | ALTYAPI | Production dağıtımı **READY** ve commit = 3-C birleştirme commit'i (Vercel Deployments) | READY, derleme günlüğünde hata yok | READY olmadı / 15 dk'yı aştı → §7 seviye 2 |
| A6 | 10:20–10:45 | ALTYAPI | **Doğrulama** (§4), sırayla | hepsi yeşil | §4'teki dur ölçütleri |
| A7 | **10:45** | **OPS** | **Karar kapısı:** devam (IndexNow) ya da geri al (§7) | yazılı karar | — |
| A8 | 11:00 | GEO-SEO (yürütür) + ALTYAPI (5.1 ve sayıyı teyit eder) | IndexNow (§5) | 200/202 | gönderim geri alınamaz |
| A9 | 11:20 | GEO-SEO / OPS | GSC ve haberler (§6) | — | — |
| A10 | 11:30 | OPS | Kapanış: dondurma kalkar, Recep'e özet | — | — |

## 4. Doğrulama (A6)

| # | Ölçüm | Komut | Beklenen | Dur ölçütü |
|---|---|---|---|---|
| 4.1 | Açık matris = beklenen | `node scripts/adres/matris.cjs --taban https://venthub.com.tr --cikti C:/tmp/yayin-11-ekim/matris-acik-sonra.json --dilsiz-hop-en-cok 1`, sonra `node scripts/adres/matris.cjs --karsilastir C:/tmp/yayin-11-ekim/matris-acik-sonra.json C:/tmp/yayin-11-ekim/matris-acik-beklenen.json` | ilk komut çıkış 0 (dilsiz adreslerde **en çok 1 hop**; kapalıyken 4'e çıkıyordu); ikinci komut çıkış 0 (**fark ∅**) | fark varsa liste OPS'a; **kritik** (aşağıdaki 4.4) → geri al, kritik değil → ileri düzeltme kararı OPS'ta |
| 4.2 | Önizleme taraması, **canlıya karşı** (247 adres) | `node scripts/adres/onizleme-tarama.cjs --taban https://venthub.com.tr --cikti C:/tmp/yayin-11-ekim/tarama-canli.json` | çıkış 0, her satır "tamam". Yeni model adresleri 404, eski model adresleri **tek 308 → ailenin sayfası**, yeni statik adresler 200, eski dilli adresler tek 308 | kırmızı satır → liste OPS'a |
| 4.3 | Yayın denetimi (eski adresin tamamı, harita, sayfa) | `node scripts/seo/adres-yayin-denetim.mjs --taban https://venthub.com.tr --cikti C:/tmp/yayin-11-ekim/sonra --eski C:/tmp/yayin-11-ekim/taban/eski-adresler.json --harita <3-C PR'ının eski→yeni haritası> --model-beklenen 0 --sayfa-denetimi --en-harita-disi-bilincli` | çıkış 0: her eski adres 200 ya da **tek 308 → 200** (taban dosyasına elle eklenen sekiz eski adres dahil), haritadaki her adres yönlendirmesiz 200, canonical = kendi adresi, hreflang tr + x-default | çıkış 1 → KIRMIZI satırlar OPS'a; çıkış 3 → evren boş |
| 4.4 | **Kritik elle kontrol** | `curl -s -o /dev/null -w "%{http_code}\n" https://venthub.com.tr/tr/cart` ve `.../tr/checkout` ve `.../tr` | hepsi **200** | biri 200 değil → **hemen geri al (§7 seviye 2)** |
| 4.5 | Tek sıçrama örneği | `curl -s -o /dev/null -w "%{http_code} %{redirect_url}\n" https://venthub.com.tr/category/fanlar` | 307/308 ve hedef yeni adres; hedef `-w "%{http_code}"` ile 200 | hedef 404 ya da ikinci sıçrama → liste OPS'a |
| 4.6 | Site haritası | `curl -s https://venthub.com.tr/sitemap.xml \| grep -c "<loc>"` | **3-C PR'ında yazılı beklenen sayı** (EN alternatif yok; model adresi 0) | sayı farklı → OPS |
| 4.7 | Canlı kapı + bağlantı (+ #1738 `CIFT-GOVDE`) | 2.4 ve 2.5'in aynı komutları, çıktı klasörleri `canli-kapi-sonra`, `link-sonra` | kapı: KIRMIZI kod kümesi tabandakinden **büyümez** (JSON-LD ve `llms.txt` kodları başka kayıtlarda; #1738 aynı yayında olduğu için `CIFT-GOVDE` yeni kırmızı vermez); bağlantı: kırık **0**, zincir **0** | yeni kırmızı kod ya da kırık → liste OPS'a |
| 4.8 | Hata gözlemi | Vercel runtime günlüğü (5xx), Sentry yeni issue (son 15 dk) | 5xx artışı yok, yeni issue yok | belirgin artış → geri al kararı OPS'ta |
| 4.9 | **Sekiz kategori adı (URN-85), açık kip, elle** | §2.6'daki döngü, `<yol>` = `kategori` | sekiz eski adres (`/tr/category/<eski>`) **tek 308** ile `/tr/kategori/<yeni>`; sekiz yeni adres (`/tr/kategori/<yeni>`) **200**. Ara yol `/tr/category/<yeni>` de tek 308 ile `/tr/kategori/<yeni>`'ye gider (URUN planı, "Zamanlama") | ikinci sıçrama ya da 404 → liste OPS'a |

## 5. IndexNow (A8; yalnız karar kapısı "devam" dedikten sonra)

IndexNow **geri alınamayan dış eylemdir**: Bing'e eski adresler gitmesin diye (karar 164 A, K4) yayından sonra, doğrulamadan sonra gönderilir.

**Karar 327 (OPS, 09 Ekim):** İngilizce vitrin 18 Ekim'de açılacak; Pazar günü `EN_YAYIN` kapalı, IndexNow yalnız TR. Pilottaki "bildirim 0" hükmünün yerine geçmez: Pazar günü yalnız adresi değişen TR sayfalar bildirilir. Beklenen URL sayısını GEO-SEO verir. GEO-SEO listesi migration sonrası **yeniden üretildi** (10 Ekim 10:43; `origin/master` `c3358bc19` + gerçek `sitemap.ts` + canlı veri): `C:/tmp/vh-arsiv/geo-seo/pazar-indexnow-yeni-tr-2026-10-10-v89b.txt`, 89 tekil satır; önceki listeye göre 12 kategori adresi farklıdır (8 ad değişikliği, iki üst kategori altlarını da taşıdı). **N koşulu:** kod bugün **88** adres üretir; +1 = `/tr/markalar` (kodda henüz yok, URUN'un 3-C PR'ına bağlı). 3-C PR'ı `/tr/markalar`'ı getirirse N = **89**, getirmezse **88**; 5.3'teki sayı bu ikisiyle karşılaştırılır, fark çıkarsa nedeni yazılır.

**Anahtarın kaynağı (GEO-SEO, 10 Ekim).** `scripts/seo/indexnow-bildir.mjs` anahtarı yalnız `INDEXNOW_KEY` ortam değişkeninden okur, betikte sabit yedek **yoktur**. Anahtar sır değildir (`src/config/indexnow.ts` başlık notu: protokol gereği kamuya açık, canlıda `https://venthub.com.tr/<anahtar>.txt` olarak durur). Aynı kabukta, komutlardan önce:

```
export INDEXNOW_KEY=$(grep -oE "'[0-9a-f]{32}'" src/config/indexnow.ts | tr -d "'")
```

Komut A8'i yürüten kişinin ağacında (master'a `--ff-only` çekilmiş) koşar. Betiğe sabit yedek eklemek **Pazar öncesi önerilmez** (kod değişikliği yayın arifesinde).

| # | Adım | Komut | Beklenen |
|---|---|---|---|
| 5.1 | Anahtar dosyası | `curl -s https://venthub.com.tr/$INDEXNOW_KEY.txt \| wc -c` | **32**; 32 değilse 5.3 ve 5.4 **koşulmaz** |
| 5.2 | Yerel kopya 3-C'yi içerir (kapı bayrağı `src/config/features.ts` metninden okur) | `git fetch origin && git merge --ff-only origin/master` ve `grep -n "ADRES_SEMASI_K3B = " src/config/features.ts` | `= true` |
| 5.3 | Kuru koşum (`--yalniz-yeni` kipi master'da: #1787, `970176ad3`; bayrak testi `indexnowBetikKapisi`) | `node scripts/seo/indexnow-bildir.mjs --kuru --yalniz-yeni C:/tmp/yayin-11-ekim/taban/eski-adresler.json` (anahtar yukarıdaki `export` ile gelir) | "bildirilecek URL (yeni/degisen TR): N" satırında **N, GEO-SEO'nun verdiği beklenen sayıya eşit** (**88**; 3-C PR'ı `/tr/markalar`'ı getirdiyse **89**); liste yalnız TR (`EN_YAYIN` kapalı, site haritasında EN yok) ve yalnız adresi değişen sayfalar. **Taban dosyası yayından önce, migration sonrası yeniden alınmış olmalı** (§2.3) |
| 5.4 | Gönderim (TEK kez) | 5.3'ün `--kuru`suz hâli | 200 ya da 202 (202: anahtar doğrulaması bekliyor, kabul edildi). 03 Ekim gönderimi de aynı yolla (ortam değişkeni komut başında) 202 almıştı (GEO-SEO) |

N eşit değilse **GÖNDERME**; nedeni yaz (yeni ya da silinen aile, liste eskimiş, taban eskimiş).

## 6. Yayın sonrası (A9)

1. **GSC:** `sc-domain:venthub.com.tr` site haritasını yeniden gönder (arayüz; hizmet hesabının yazma yetkisi ölçülmedi); 5 örnek adres için indeksleme iste. İsteğe bağlı: `node scripts/seo/gsc-url-denetim.mjs --cikti C:/tmp/yayin-11-ekim/gsc` (Googlebot gözüyle son getirme).
2. **`public/llms.txt`:** statik adresler (`/tr/contact`, `/tr/about`) yeni adreslere güncellenir (GEO-SEO; eski adres 308 verir, kırık değildir; rota dili standardı §3).
3. **Haberler (karar 157):** KATALOG ve OPS'a "katalog paketi canlı DB'den yeniden üretilir".
4. **İki hafta izleme:** `docs/plans/rec-adres-agac-tek-yayin-2026-09-07.md` §8 (GSC "bulunamadı" birikimi 0, eski adres örneklemi tek hop, karar 86 şartı tıklama karşılaştırması).

## 7. Geri alma merdiveni

| Seviye | Ne zaman | Eylem | Süre | Sonrası |
|---|---|---|---|---|
| **1 — yalnız statik sayfa adresleri** | Sorun rota dilindeki (`/tr/hakkimizda` gibi) adreslerde, kategori/aile tarafı sağlam | Vercel: `NEXT_PUBLIC_ADRES_DILI` = `0` + **yeniden dağıt** (kod değişmez) | ≈ 6 dk (yeni derleme) | Kategori/aile (3-C) açık kalır; yalnız rota dili kapanır |
| **2 — her şey (ilk 30 dk, IndexNow gitmeden)** | Kritik kontrol (4.4) kırmızı, derleme hatalı, 5xx artışı, matris farkı büyük | Vercel → Deployments → ön koşul 5'te not edilen **önceki Production dağıtımı** → hemen geri döndür (Instant Rollback / Promote). **Sonra** `NEXT_PUBLIC_ADRES_DILI` = `0` yap | saniyeler (derleme yok); derleme çıktısı eski olduğundan iki bayrak da kapanır | Vercel'in domain atama durumunu panelde kontrol et. `matris.cjs` ile yeni matris `matris-kapali-once.json` ile **fark ∅** (taban migration sonrası alındığı için veritabanı adları geri alınmasa da fark çıkmaz). 3-C için revert PR'ı açılır; açılana kadar dondurma sürer |
| **3 — kitlesel hata (IndexNow/GSC sonrası)** | Yayından saatler/günler sonra | Plan §11: **yalnız Recep kararıyla**; revert PR'ı + env `0`. Yeni adresler dizine girmişse 404 olur: kayıp, o yüzden ileri düzeltme esastır | — | harita ve envanter commit'li; yanlış satır düzeltilir, yeniden derlenir |

**Veritabanı adları (URN-85, #1802) bu merdivenle GERİ ALINMAZ.** Instant Rollback ve env `0` yalnız kodu ve bayrakları geri alır. Bu gerekli de değildir: eski kod yeni veritabanı adıyla çalışır (bayrak kapalıyken `/tr/category/<eski>` tek 308 ile `/tr/category/<yeni>`, o 200; URUN planı, "Ölçümler" madde 3). Geri alma betiği yalnız **adların kendisi yanlışsa** uygulanır: `scripts/db/geri-alma/20261010090000_kategori_tr_adlari_design_csv.geri-al.sql` (tek işlem, sekiz satır, sayı kontrollü; sayı tutmazsa betik kendisi durur). Bu canlı veritabanı yazımıdır (kural 13 ve karar 224). **Geri alma: OPS koşar, OPS penceresinde, Recep'in o penceredeki sözüyle** (OPS kararı, 10 Ekim). Betik kendi işlemini yönetir (`begin;` … `commit;`); emsaldeki çalıştırma biçimi: `psql "$DATABASE_URL" -v ON_ERROR_STOP=1 -f scripts/db/geri-alma/20261010090000_kategori_tr_adlari_design_csv.geri-al.sql`; bağlantı dizesi OPS'tadır, bu belgeye yazılmaz. Betik yolu: `scripts/db/geri-alma/20261010090000_kategori_tr_adlari_design_csv.geri-al.sql`. Betik uygulanırsa `matris-kapali-once.json` yeniden alınır (sekiz adres farkı çıkar) ve §2.6 döngüsü eski adlarla koşulur.

Faz 1-B (kategori ağacı, 40 aile) 6 Ekim'de birleşti (#1352). Yayın günü listesinde veritabanı adımı yoktur; ama sekiz kategori adı 10 Ekim'de ayrıca değişti (yukarıdaki not).

## 8. "Kapalıyken fark 0" kanıtı

`onizleme-tarama.cjs` yalnız **açık** davranışı bekler (yeni adres 200, eski adres tek 308); kapalı canlıya karşı koşarsa kırmızı çıkar, bu bir kusur değildir. Bayrak kapalıyken "canlıda hiçbir şey değişmedi" kanıtı **matris karşılaştırmasıdır** (A2: T0 ile önceki matris, geri alma sonrası: önceki matris ile yeni matris, ikisi de çıkış 0). Kapalı kip için tarama betiğine ayrı bir bayrak eklemek bu belgenin kapsamında değildir.

## 9. Bu belge yazılırken ölçülenler

**09 Ekim (kapalı canlı, yalnız GET, migration öncesi):**

- `matris.cjs --taban https://venthub.com.tr`: 43 sn, çıkış 0, `adresSayisi` 241, `hataSayisi` 0, durum dağılımı `200: 180, 404: 61`, dilsiz hop dağılımı `{0:2, 1:16, 2:1, 3:17, 4:9}`.
- `onizleme-tarama.cjs --liste` (ağ yok): beklenen adres sayısı **247**; `matris.cjs --liste`: 241.

**10 Ekim:**

- #1802 (URN-85) birleşti: `c3358bc19`, `supabase-migrate` koşumu 38034894433 success (07:34Z). OPS ölçümü: sekiz kategorinin TR adı yeni değerde 8/8; sekiz eski adres tek 308; sekiz yeni adres 200 (8/8).
- Harita iş akışı ilk kez koşturuldu (run 38035691052, 07:48Z): üretim adımı geçti, doğrulama adımı `Cannot find module '@/utils/categoryHelpers'` ile düştü (`JITI_ALIAS` yalnız üretim adımındaydı), artefakt yüklenmedi. Düzeltme ve koruyan test: **#1804**. Harita üretecinin dosya kapanışı 12 dosya; #1793 (URN-82) ve #1800 (URN-83) ile kesişim **0**, ikisinde de migration ve rota ekleyen dosya yok: harita bu iki PR'a bağlı değildir.
- Master push CI kırmızı (run 38034894473): tek kırmızı test `taban-tazeligi-dunya` (şema tabanı 09 Ekim, en yeni migration 10 Ekim). Şema tabanı 10 Ekim'de yenilendi (`sema-tabani-uret.yml`, koşum 38036439867): sayılar 09 Ekim ile aynı (60 tablo, 167 politika); düzeltme **#1807**.
- `--yalniz-yeni` kipi master'da (#1787, `970176ad3`).
- Henüz **koşulmayanlar:** §2.2–2.6'nın tamamı (taban akşam alınır), §4 (açma olmadan anlamsız), §5 (kuru koşum yayından sonra).

## 10. OPS kararları ve açık kalanlar

**Karar verildi**

1. 3-C PR'ını **URUN** hazırlıyor, **Cumartesi 14:00'e kadar**. Açıklamasında beklenen site haritası sayısı, eski→yeni harita dosyasının yolu ve #1738'in aynı yayında olup olmadığı yazılı olacak (OPS URUN'a yazdı).
2. Pencere **Pazar 10:00–11:30** onaylandı; Recep'e önceden OPS haber verir.
3. Vercel değişkenini (`NEXT_PUBLIC_ADRES_DILI`) **ALTYAPI** değiştirir, **Pazar günü OPS'un "şimdi" mesajından sonra**.
4. **Karar 327:** İngilizce vitrin 18 Ekim'de açılacak; Pazar günü `EN_YAYIN` kapalı, IndexNow yalnız TR. Pilottaki "bildirim 0" hükmünün yerine geçmez: Pazar günü yalnız adresi değişen TR sayfalar bildirilir. Beklenen URL sayısını GEO-SEO verir.
5. **Kategori adı yöntemi (OPS, 10 Ekim):** sekiz TR slug'ı veritabanında Design CSV adına çekilir (URN-85, ayrı migration); takma ad tetiği eski adı yazar, eski adres tek 308. Harita yeniden adlandırma tablosu yoluna **gidilmedi**.
6. **Harita (ALT-50) ALTYAPI'da kalır** ve Pazar öncesi biter (OPS, 10 Ekim); URN-82/URN-83 birleşmesini **beklemez** (bağımlılık ölçüldü: kesişim 0).
7. **Tek taban zamanı** = migration sonrası; `eski-adresler.json`'a sekiz eski adres elle eklenir (URUN teyit etti, 10 Ekim).
8. **A8 anahtar yolu** (GEO-SEO önerisi, OPS isteğiyle): anahtar `src/config/indexnow.ts`'ten `export` edilir; betik değişikliği Pazar öncesi **yapılmaz**.
8a. **Vercel değişkeni (OPS, 10 Ekim):** `NEXT_PUBLIC_ADRES_DILI`'i ALTYAPI penceresi **Vercel MCP** ile (`edit_project_env`) değiştirir; izin denetimi durdurursa Recep'in sözü ALTYAPI penceresinde alınır, panel yolu yedektir ve Recep yapar. Cumartesi akşamı salt-okuma denemesi yapılır.
8b. **Veritabanı geri alma (OPS, 10 Ekim):** OPS koşar, OPS penceresinde, Recep'in o penceredeki sözüyle (canlı yazım: kural 13 ve karar 224); betik yolu §7'de.

**Açık**

9. **3-C PR'ı** (URUN, Cumartesi 14:00): taslak **#1811** açık (bayrak satırı onay gelene kadar taslak); kural sayısı 25, #1738 aynı yayında, beklenen site haritası sayısı PR açıklamasından teyit edilir (**henüz teyit edilmedi**); harita yolu `src/data/generated/eski-adres-haritasi.json` (✔ bağlandı).
10. **Harita yeniden koşusu — ✔ yapıldı (10 Ekim):** #1804 birleşti; `gh workflow run harita-uret.yml --repo peckop/venthub-hvac-esite --ref master -f not="ALT-50 harita"` koşusu **38037549974 başarılı** (26 sn; ilk başarılı koşunun süresi ölçüldü), `gh run download 38037549974 -n eski-adres-haritasi -D C:/tmp/yayin-11-ekim/`; dosya URUN'a verildi ve `src/data/generated/eski-adres-haritasi.json` olarak 3-C taslak PR'ına (#1811) bağlandı. **Yenileme gerekirse** (Katalog DB'yi değiştirirse): aynı komut yeniden koşulur ve URUN'a verilir; harita değişirse `harita-3c-karsiliklari.test.ts` bilerek kırmızı olur.
11. ✔ **#1804** birleşti (`1d1d7e7b7`); şema tabanı #1807 kapandı (OPS'un #1806'sı aynı işi yaptı, `518673b4f`); #1803 (test haritası) ve #1808 (bu belge, v0.3) birleşti.
12. **Açık beklenen matris** (§2.2) 3-C PR'ının **kendi dalından** (`urun/urn85-adres-acilis-3c-2`) üretilmelidir. URUN: bayrak satırı gelene kadar dalın önizleme derlemesi bayrak yamasıyla (`onizleme-adres.mjs`) koşar, yani **bayrak yaması ≠ 3-C PR'ı**; bayrak commit'i gelince URUN haber verir ve matris **o uçtan** alınır (şimdiki uç `2a441fd67` bayrak commit'inden öncedir). Derleme ≈ 25 dk.
13. Canlı kapının kayıt durumunu hâlâ Linear API'sinden okuması (SEO-19 kapsamı): 2.4 için `--kayit-durum` JSON'u hazırlanmalı.
14. **Vercel salt-okuma denemesi** (ön koşul 5, 6): Cumartesi akşamı; yöntem OPS kararı 8a'da (yukarıda), yetkinin çalışıp çalışmadığı **ölçülmedi**.
15. **Veritabanı geri alma:** yürütücü belli (OPS kararı 8b); betiğin canlıda hiç koşulmadığı **ölçülmedi** (yalnız yerel/ledger testleri).
16. **Recep'in Cuma önizleme onayı** (ön koşul 1): OPS'ta, ölçülmedi.
17. **Faz 4 önizleme listesine "aile sayfasında varyant seçimi ve eski `?sku=` adresleri" satırı** (OPS emri, ALT-50) — ✔ yazıldı: `docs/plans/onizleme-tiklama-listesi-2026-10-09.md` **satır 18** (okuyucu testi 18 adres bekler). Adres ve davranış URUN'un ölçümüdür (URN-85, #1811): `/tr/products/storm-serisi?sku=SEA-61143003` → **tek 308** → `/tr/urun/storm-serisi` (aile sayfası, sorgusuz; **varyant seçili gelmez**, sorgu bilinçli düşer; model sayfaları Pazar'da kapalı; hedef yeniden eşleşmiyor); küçük harfli sku aynı. **ALTYAPI ölçmedi:** bu adresi önizleme sunucusunda ben denemedim; 3-C dalının önizlemesinde ön kontrol bu satırı sınar. Cuma önizlemesinde kural yoktur, satır orada KIRMIZI verir.
