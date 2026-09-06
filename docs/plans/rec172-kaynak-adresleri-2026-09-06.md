# REC-172 · Teknik kaynak adresleri (Recep, 2026-09-06) — TEK KAYIT

> **Amaç:** Recep'in verdiği her kaynak adresi burada; hiçbiri kaybolmaz. Faz 2 iş akışı (`rec172-faz2-workflow.js`) ajanları bu dosyayı okur, önce bu adresleri indirir, sonra gerekirse arar.
> **Kural:** İndirilen her dosya ingestor deposunda `venthub/markalar/<marka>/<aile>/01-input/` altına konur; sha256 + URL + tarih aynı klasördeki `KAYNAKLAR.md`'ye yazılır. `kaynak-dizini/**` Katalog şeridinindir, dokunulmaz. Aynı belge iki adreste varsa sha256 karşılaştırılır, **bir kez** indirilir. Mükerrer adres burada silinmez, "mükerrer" diye işaretlenir (kayıt kaybolmasın diye).
> **Durum sütunu:** `hedef` = değer çekilecek · `ayrım` = yalnız seri ayrımı için, değer çekilmez · `şüpheli` = marka/kapsam kapaktan doğrulanacak · `mükerrer` = daha önce verildi.

Partiler: **P1** 17:55 TR (10 adres) · **P2** 18:20 TR (24 adres) · **P3** 18:30 TR (7 adres, 4 yeni). Toplam tekil: **38**.

## 1. Nicotra Gebhardt (aileler: ADH 8 · AT 8 · DD 13 · RDH 6 ürün)

| Aile | Adres | Tür | Parti | Durum |
|---|---|---|---|---|
| ADH | https://eu.nicotra-gebhardt.com/en/products/fans-for-ventilation-and-air-conditioning/278-adh.html | ürün sayfası | P2 | hedef |
| ADH | https://eu.nicotra-gebhardt.com/en/infocenter/downloadcenter/catalogues/belt-driven-centrifugal-fans/479-series-adh/file.html | katalog PDF (doğrudan) | P2 | hedef |
| AT | https://www.nicotra-gebhardt.com/products/Centrifugal-Fans/AT | ürün sayfası | P2 | hedef |
| AT | https://eu.nicotra-gebhardt.com/en/infocenter/downloadcenter/catalogues/belt-driven-centrifugal-fans/480-series-at/file.html | katalog PDF | P2 | hedef |
| DD | https://www.nicotra-gebhardt.com/en-it/products/Centrifugal-Fans/DD | ürün sayfası | P2 | hedef |
| DD | https://eu.nicotra-gebhardt.com/en/infocenter/downloadcenter/catalogues/centrifugal-fans-double-inlet-with-direct-drive-forward-curved-blades/493-series-dd/file.html | katalog PDF (motor tablosu: 13 varyant buradan) | P2 | hedef |
| RDH | https://eu.nicotra-gebhardt.com/en/products/fans-for-ventilation-and-air-conditioning/276-rdh.html | ürün sayfası | P2 | hedef |
| RDH | https://eu.nicotra-gebhardt.com/en/infocenter/downloadcenter/catalogues/belt-driven-centrifugal-fans/481-series-rdh/file.html | katalog PDF | P2 | hedef |
| genel | https://eu.nicotra-gebhardt.com/en/infocenter/downloadcenter/catalogues.html | katalog dizini | P1, P2 | hedef (dizin) |
| genel | https://www.nicotra-gebhardt.com/Resources/Download-Center | indirme merkezi | P1 | hedef (dizin) |

## 2. Danfoss (aile: FC-51, 2 ürün — 220 V ve 230 V 0,37 kW)

| Adres | Tür | Parti | Durum |
|---|---|---|---|
| https://store.danfoss.com/fr/en/Drives/DrivePro%C2%AE-services/Exchange-Units/FC-051PK37S2E20H3XXCXXXSXXX/p/132F0002 | mağaza sayfası, PK37 S2 = 0,37 kW tek faz 200–240 V (Exchange Units sayfası; değerler föyle doğrulanır) | P2 | hedef |
| https://store.danfoss.com/en/Drives/Low-voltage-drives/VLT%C2%AE-Micro-Drive-FC-51/FC-051PK37T4E20H3XXCXXXSXXX/p/132F0017 | mağaza sayfası, PK37 T4 = 0,37 kW üç faz 380–480 V (DB'de var mı ölçülür) | P2 | hedef |
| https://store.danfoss.com/tr/tr/S%C3%BCr%C3%BCc%C3%BC/D%C3%BC%C5%9F%C3%BCk-Gerilim-S%C3%BCr%C3%BCc%C3%BCleri/VLT%C2%AE-Micro-Drive-FC-51/FC-051P22KT4E20HXBXCXXXSXXX/p/136N8941 | mağaza sayfası, P22K T4 (22 kW örneği; sayfa kalıbı için) | P1 | ayrım |
| https://afi-systems.com/catalog/view/theme/servoplc/documents/pages/vendors/danfoss/vlt_micro_drive_fc51/FC51-DataSheet.pdf | data sheet PDF (üçüncü taraf ayna; belge no. PDF içinden) | P2 | hedef |
| https://desteknoloji.com.tr/wp-content/uploads/2016/08/fc51Design-Guide.pdf | design guide PDF (Türk dağıtıcı aynası, 2016) | P2 | hedef |
| https://assets.danfoss.com/documents/latest/272400/AJ275648114271en-US1001.pdf | resmi belge (türü kapaktan okunacak) | P2 | hedef |
| https://assets.danfoss.com/documents/latest/357510/AD449962666883en-010201.pdf | resmi belge (türü kapaktan okunacak) | P2 | hedef |
| https://www.danfoss.com/en/service-and-support/documentation/ | belge arama sayfası | P1 | hedef (dizin) |
| https://motorcontrol.pt/site/public/loja_produtos/MG16Z102-Guia-Design-FC102-355-800K-E-Ing.pdf | FC-102 355–800 kW design guide | P2 | ayrım |
| https://www.danfoss.com/en/products/dds/low-voltage-drives/vlt-drives/vlt-hvac-basic-drive-fc-101/ | FC-101 ürün sayfası | P1 | ayrım |
| https://www.danfoss.com/en/products/dds/low-voltage-drives/vlt-drives/vlt-hvac-drive-fc-102/ | FC-102 ürün sayfası | P1 | ayrım |

## 3. SEAT Ventilation (aileler: SEAT 40 · STORM 20 · JET 21 ürün; K13 boşlukları)

| Aile | Adres | Tür | Parti | Durum |
|---|---|---|---|---|
| hepsi | https://seat-ventilation.com/pages/download-catalogs | resmi katalog indirme sayfası (BİRİNCİ kaynak) | P1 | hedef |
| hepsi | https://seat-ventilation.fr/en/pages/download-catalogs | resmi katalog indirme (FR site) | P1 | hedef |
| SEAT | https://seat-ventilation.com/collections/seat-30-series | Shopify koleksiyon (`/products.json` ile yapılandırılmış) | P1 | hedef |
| STORM | https://seat-ventilation.com/collections/storm-series | Shopify koleksiyon | P1 | hedef |
| SEAT/STORM | https://fantechtrade.com.au/wp-content/uploads/2026/01/Seat_V5-catalogue_lr.pdf | katalog V5 (Fantech AU aynası, 2026-01); P3'te `?product=SEAT%20Extraction%20Fans` sorgulu hâli aynı dosya | P2, P3 | hedef · P3 mükerrer |
| SEAT/STORM | https://www.baltspektr.lv/data/user_files/uploaded_files/SEAT%20CATALOGUE.pdf | katalog (Letonya aynası); P3'te iki kez | P2, P3 | hedef · P3 mükerrer ×2 |
| SEAT/STORM | https://vent-park.ru/files/seat/seat-katalog.pdf | katalog (Rusya aynası) | P2 | hedef |
| SEAT/STORM | https://www.kaffe.gr/pdf/SEAT.pdf | katalog (Yunanistan aynası; sürüm kapaktan) | P3 | hedef |
| SEAT | https://slingerlandtechniek.nl/shop/storage/uploads/categories/seat-serie-1/FXQejq7tfTOtLQypNJrYMGjORsBaF6yz0G208fqW.pdf | SEAT serisi föy (Hollanda dağıtıcı) | P3 | hedef |
| STORM | https://science2medical.com.au/wp-content/uploads/2018/01/Storm_series.pdf | STORM serisi föy (AU, 2018-01; eski sürüm olabilir → en yeniyle çapraz) | P3 | hedef |
| JET | https://venttech.co.nz/assets/Fan/JET.pdf | JET serisi föy (NZ dağıtıcı) | P2 | hedef |
| JET | https://chemicalexhaustfans.com.au/wp-content/uploads/2022/10/JET-20-Specifications.pdf | JET 20 föy | P2 | hedef |
| JET | https://chemicalexhaustfans.com.au/wp-content/uploads/2022/10/JET-25-Specifications.pdf | JET 25 föy | P2 | hedef |
| JET | https://chemicalexhaustfans.com.au/wp-content/uploads/2022/10/JET-30-Specifications.pdf | JET 30 föy (DB'de JET 30 yok) | P2 | ayrım / çapraz |
| ATEX | https://chemicalexhaustfans.com.au/wp-content/uploads/2022/10/Installation-guide_ATEX_fans_english1.pdf | ATEX fan kurulum kılavuzu (atex_marking alanı için; performans değeri beklenmez) | P3 | hedef (yalnız ATEX işareti) |
| JET? | https://hvacdirect.com/media/pdf/Plastec-JET-Series-IOM.pdf | "Plastec JET Series" IOM — Plastec Ventilation (ABD) ayrı üretici olabilir; kapaktan üretici okunur, SEAT değilse değer çekilmez | P2 | şüpheli |

## 4. Kapsam dışı (Recep kararı)

- **AVenS 8 aile / 34 ürün:** dış web kaynağı yok (bizim markamız); kaynak Recep arşivi. Bu iş akışında yok, ayrı koşum.

## 5. Sayım

| Parti | Verilen | Yeni tekil | Mükerrer |
|---|---|---|---|
| P1 | 10 | 10 | 0 |
| P2 | 24 | 24 | 0 |
| P3 | 7 | 4 | 3 (fantechtrade sorgulu, baltspektr ×2) |
| **Toplam** | **41** | **38** | **3** |
