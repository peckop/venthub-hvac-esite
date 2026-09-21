# REC-357 · Katalog için PIM çözümü — kurulum ve aktarım planı (ALTYAPI kolu)

> **Kayıt:** Linear REC-357 (üst: REC-206) · **Karar:** 35 (başlat), 36 (hat sorusu) · **Tarih:** 2026-09-21
> **Yöneten cetvel:** **cetvel yok — PIM hattı cetveli yazımı bu işin kapsamında** (kabul 5-6 sonrası;
> taslak adı `docs/standards/pim-hatti-standard.md`). Komşu cetveller: `product-schema-standard.md`,
> `catalog-ingestion-standard.md`, `csv-import-export-standard.md`.
> **YÖNTEM:** şerit (ALTYAPI kurulum + köprü · URUN aile kurulumu + değerlendirme · OPS kıyas + karar sorusu);
> plan-challenger bağımsız red-team (`rec357-katalog-pim-cozumu-red-team.md`).
> **Çerçeve (Recep 09-18):** bu iş "UnoPim denemesi" DEĞİL — *"PIM sistemine hâkim değiliz… çözüm lazım."*
> UnoPim **ilk aday**; ölçüm onu elerse sıradaki aday denenir.

## 1 · Ölçülenler (2026-09-21, bu planın zemini)

### 1.1 Aday araçlar — lisans ve sağlık (GitHub API + lisans dosyası okundu)

| aday | lisans (dosyadan) | ★ | son push | açık issue | hüküm |
|---|---|---|---|---|---|
| **unopim/unopim** | **MIT** | 10.982 | 2026-09-21 | 58 | **ilk aday** — serbest, ticari kullanım dahil; son sürüm **3.1.1** (2026-09-17) |
| akeneo/pim-community-dev | **OSL-3.0** (GitHub "NOASSERTION" gösteriyor) | 1.045 | 2026-09-04 | 470 | ikinci sıra değil — OSL ağ üzerinden sunulan türevde kaynak açma yükümlülüğü; bakım yükü (470 issue) |
| pimcore/pimcore | **POCL** (Pimcore Open Core License, 2025-06) | 3.849 | 2026-09-21 | 363 | **ELENDİ** — yıllık ciro €5M altı ücretsiz, üstü lisans; "üretim kullanımı" geliştirmenin **ilk gününden** sayılıyor (§1.2.2); barındırılan hizmet olarak sunma ve **yeniden dağıtım/çatal** yasak (§1.3.1). Büyüdükçe ücretli olur. *(Red-team B9 düzeltmesi: "değişiklik yasak" yazmıştım — yanlış; iç kullanım için değişiklik serbest, yasak olan dağıtım.)* |
| atrocore/atropim | GPL-3.0 | 203 | 2026-09-15 | 2 | yedek aday — küçük topluluk |
| openpim/server | Apache-2.0 | 78 | 2026-09-17 | 15 | yedek aday — çok küçük topluluk |

⭐Lisans ≠ barındırma (hafıza: *hazır açık kaynak önce aranır*): MIT, "ücretli sunucu gerekir" demek değildir.
PIM arka ofis aracıdır; müşteriye açılmaz, yerel makinede koşar.

### 1.2 Makine ve veri

| ölçüt | değer |
|---|---|
| Docker motoru | **28.3.2 çalışıyor** · 16 CPU · 15,5 GB (motor açma yetkisi bizde, Recep 09-19) |
| UnoPim imajı | `webkul/unopim:3.1.1` Docker Hub'da **VAR** (imaj etiketi `v`siz) — ⚠git etiketi ise **`v3.1.1`** (red-team B8: `?ref=3.1.1` 404) |
| UnoPim yığını (`compose.yaml@v3.1.1`) | **7 konteyner**: `unopim` + `unopim-queue` + `unopim-scheduler` + `postgres:16-alpine` + redis + elasticsearch + (ES hazırlık). ⚠README "ES varsayılan kapalı" diyor ama **compose'ta varsayılan AÇIK** ve uygulama ES'in sağlıklı olmasını bekliyor (red-team B1) → ES **açık kalır** ("olduğu gibi kur"; bellek yetiyor) |
| bellek | bugün ~1,9 GiB kullanımda; UnoPim ~2–2,5 GiB ekler → 15,5 GiB'a **sığar** (red-team ölçtü) |
| port 8000 | **boş** (UnoPim yönetim ekranı) |
| yerel Supabase | 11 konteyner ayakta (54321-54327); `postgres` DB'si **boş şema** |
| **gölge DB `arama_golge`** | **442 ürün · 31 kategori · 47 aile** (`product_families`) · teknik özelliği dolu **369/442** |

⚠`arama_golge` **URUN'un REC-340 arama gölgesidir — bu iş ona YAZMAZ ve onu YENİDEN KOPYALAMAZ**
(red-team B4: `golge-kur.mjs` "var olan DB ezilmez" kuralı, 09-16 olayı). Red-team tazeliği ölçtü: içerik
(`technical_specs` md5) canlıyla **aynı**, ama gölgede 2 ürün yerelde değiştirilmiş → `max(updated_at)`
tazelik kanıtı DEĞİL. **Tazelik ölçütü = seçilen ailenin satırlarının md5'i canlıyla eşit** (canlıda yalnız SELECT).

## 2 · Kabul — REC-357'nin 09-18 altı adımı, bu planın karşılığı

| # | kabul (09-18) | sahip | bu plandaki adım | kanıt |
|---|---|---|---|---|
| 1 | UnoPim yerelde kalkar | ALTYAPI | §3.1 | `docker compose ps` 6/6 sağlıklı + `/admin` 200 |
| 2 | BİR gerçek aile aile+nitelik şablonuyla kurulur, ürünler CSV ile girer | URUN (aile seçimi + şablon) · ALTYAPI (CSV üretici) | §3.2 | içe alım raporu: kaç satır girdi / düştü / neden |
| 3 | tamlık % ekranda, eksik alan listesi | URUN | — (UnoPim'in kendi ekranı) | ekran görüntüsü + dışa aktarılan tamlık listesi |
| 4 | UnoPim → Supabase TEK YÖN (gölge) | ALTYAPI | §3.3 | tek ürün uçtan uca: UnoPim'de değiştir → gölge DB'de gör |
| 5 | yan yana veri modeli tablosu | OPS (ALTYAPI veri verir) | §4 | tablo |
| 6 | Recep'e TEK soru | OPS | — | ölçümle, seçenek listesi değil |

## 3 · ALTYAPI adımları

### 3.1 Kurulum (üçüncü taraf kuralları: sabit sürüm, yalıtılmış, sırlar ayıklı)

1. Çalışma dizini **depo DIŞI**: `C:/tmp/pim-unopim/` (repo public; `.env` ve DB dökümleri depoya girmez).
2. `compose.yaml` **git etiketi `v3.1.1`**'den indirilir (`3.x` dalından değil) ve **`UNOPIM_TAG=3.1.1`**
   (imaj etiketi) sabitlenir — `latest` yasak (INV-DEP-1 ruhu: sürüm zamana bırakılmaz).
3. **Yönetici kimliği (red-team B2):** `compose.yaml@v3.1.1` `INSTALLER_ADMIN_*` değişkenlerini hiçbir servise
   geçirmiyor → `.env`'e yazmak işe YARAMAZ; kurulum rastgele parola üretip konteyner içinde
   `admin-credentials.txt`'ye yazıyor. Yol: kurulumdan sonra dosya `docker cp` ile
   `C:/tmp/pim-unopim/.sirlar/` altına alınır, konteynerdeki kopya silinir, parola ilk girişte değiştirilir.
   Parola hiçbir mesaja, deftere, çıktıya yazılmaz (yalnız uzunluğu raporlanır).
4. **Ağ yalıtımı (red-team B3):** compose satırı `"${APP_PORT:-8000}:80"` → varsayılan **0.0.0.0**. Motora
   dokunmadan **`compose.override.yaml`** ile port `127.0.0.1:8000:80`'e bağlanır ve **`APP_URL=http://127.0.0.1:8000`
   ayrıca verilir** (yalnız `APP_PORT=127.0.0.1:8000` vermek APP_URL'i `http://localhost:127.0.0.1:8000`
   yapıp bozuyor). Ölçüt: `netstat` 8000 yalnız 127.0.0.1'de. UnoPim Supabase ağına bağlanmaz; kendi
   Postgres'i dışarı açılmaz.
5. Elasticsearch **açık** kalır (bkz. §1.2; kapatmak compose'u değiştirmek demek).
6. Ölçüt: 7/7 konteyner sağlıklı, `http://127.0.0.1:8000/admin` 200, TR dil paketi seçilebiliyor.
7. **Durdurma yolu yazılır** (`docker compose down`; veri hacmi kalır) — kalıcı servis ilanı, araç envanteri satırı.

### 3.2 CSV üretici (gölge DB → UnoPim içe alım biçimi)

- Kaynak **`arama_golge`**, yalnız **SELECT** (red-team B4: ona yazılmaz). Seçilen ailenin satırları önce
  canlıyla md5 ile eşlenir (§1.2 tazelik ölçütü).
- URUN'un seçtiği **tek aile** için: ürün satırları + `technical_specs` anahtarları → UnoPim nitelik kodları.
- **Ölçü niteliği biçimi (red-team B6):** UnoPim CSV'de ölçü niteliği **iki sütun** ister — `<kod>_value` +
  `<kod>_unit` — ve biri eksikse satırı **hata vermeden atlıyor** (`MeasurementProductImport.php`). Yani
  "araç birim-gömülü hücreyi reddediyor mu" sorusu bu kurulumda **CSV eşlemesini** ölçer, aracı değil.
  Kabul 2'nin sorusu bu yüzden ikiye ayrılır ve ikisi de sayıyla raporlanır:
  (a) **bizim ayrıştırıcı** 38 birim-gömülü hücreden kaçını `value`+`unit`'e ayırabildi, kaçını ayıramadı
  (ayrılamayan = gerçek veri kusuru listesi); (b) **UnoPim'in sessiz atlaması:** içe alım sonrası
  UnoPim'deki ölçü değeri sayısı CSV'deki dolu hücre sayısıyla karşılaştırılır — fark = sessizce düşen.
  Sessiz atlama tek başına bir **bulgudur** (hat cetveline "içe alımdan sonra sayım eşitliği zorunlu" kuralı).
- **HVAC birimleri (red-team B7):** UnoPim'in hazır ölçü ailelerinde **m³/h yok**. Birim, UnoPim'in yönetim
  ekranından ölçü ailesine eklenir (yapılandırma, motor değişikliği değil); eklenen her birim rapora yazılır.
  Ekrandan eklenemiyorsa bu da bulgudur.
- Çıktı: içe alım raporu (girdi / düştü / sessiz atlanan / neden). Betik `scripts/pim/` altında, testli.

### 3.3 Aktarım köprüsü (UnoPim REST → gölge Supabase)

- UnoPim REST API — OAuth **password grant** (red-team B5): istemci kimliği + sırrı **ve** bir kullanıcı adı +
  parolası gerekiyor (dört sır). Köprü için yönetici değil, **yalnız okuma yetkili ayrı API kullanıcısı**
  açılır; dört sır `C:/tmp/pim-unopim/.sirlar/kopru.env`'de durur (depo dışı, `C:/tmp` git deposu değil —
  red-team ölçtü).
- Hedef: **ayrı gölge DB `pim_golge`** (red-team B4) — `arama_golge`'den bir kez kopyalanır, köprü yalnız
  onun `pim_onizleme` şemasına yazar. `arama_golge`'ye ve **canlıya hiç yazılmaz** (kural 13'ün ruhu: prod
  yazımı Recep kapısı). `pim_golge` zaten varsa ezilmez (golge-kur kuralı), önce sorulur.
- Kanıt: bir ürünün bir niteliği UnoPim'de değişir → köprü koşar → `pim_onizleme`'de yeni değer; ikinci
  koşum **idempotent** (aynı veri, değişiklik 0).
- Köprü tek yönlüdür; gölgeden UnoPim'e geri yazma yok.

## 4 · Kıyas için veri (OPS'un tablosuna ALTYAPI katkısı)

| kavram | UnoPim | bizde bugün |
|---|---|---|
| aile | family → attribute group → attribute | `product_families` (47) — nitelik şablonu **yok** |
| nitelik tipi + birim | measurement {amount, unit}, select, text… | `technical_specs` JSONB — tip/birim **yok**, 38 hücre birim-gömülü metin |
| tamlık % | aileden hesaplanır, ekranda | elle sayım (REC-206 tablosu) |
| belge (PDF, sertifika) | DAM | `product_documents` tablosu **yok** |
| çok dil | TR/EN locale | `name_i18n`, `metadata->>lang` |

## 5 · Riskler (adıyla) — red-team'in çürütmesi için

*(Red-team 2026-09-21: **KOŞULLU** — `rec357-katalog-pim-cozumu-red-team.md`. B1–B9 yukarıda plana işlendi;
B10 tazelik ölçütü §1.2'de. Kritik bulgu yok.)*

1. **Gölge tazeliği:** md5 eşitliği ölçülmeden içe alım yapılmaz (§1.2).
2. **Bellek:** ölçüldü, sığıyor (§1.2); kurulum sonrası `docker stats` ile yeniden ölçülür.
3. **"Olduğu gibi kur" ilkesi:** motora dokunulmaz; uyumsuzluk çıkarsa uyarlama değil **ölçüm notu**.
4. **Lisans yorumu:** MIT açık; ama UnoPim eklentileri/tema paketleri ayrı lisanslı olabilir → kurulan her paket listelenir.
5. **Kapsam kayması:** tek aile, tek ürün uçtan uca. Bütün katalog göçü bu planın **dışında** (karar 36 sonrası).

## 6 · Sıra

ALTYAPI §3.1 (şimdi) → URUN aile seçimi (#1289 görsel doğrulamasından sonra) → ALTYAPI §3.2 → URUN §2 kabul 2-3 →
ALTYAPI §3.3 → OPS §4 tablo + karar 36 sorusu → PIM hattı cetveli.
