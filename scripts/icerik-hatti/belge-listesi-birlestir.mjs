#!/usr/bin/env node
/**
 * BİRLEŞİK BELGE LİSTESİ — aile → PDF → tür → dil → sha256 (REC-145, OPS emri 2026-10-25)
 *
 * ── NİÇİN VAR
 * Ürün PDF'lerinin indirilebilir olması (REC-145) için DB'ye belge tablosu açılacak. Tabloya
 * girecek satırların üç ayrı kaynağı vardı ve üçü de farklı ad uzayı kullanıyordu:
 *   1. paket/belgeler.csv (2026-09-10): aile_slug sütunu "yeni şema" adlarıyla (danfoss-fc102),
 *   2. Design Menü belge envanteri (2026-10-22): Design'ın kendi aile adlarıyla (avens-nimax),
 *   3. canlı DB product_families.slug (casals-nimax, danfoss-vlt-hvac-drive-fc-102).
 * Tablonun yabancı anahtarı yalnız 3'ü tanır. Bu betik bugünkü PDF klasörünü (kaynak dizini
 * katalog envanteri, 97 PDF) canlı aile slug'ına bağlar ve her bağın KANITINI sayfa sayısıyla yazar.
 *
 * ── ⛔BAĞ UYDURULMAZ
 * Bağ elle yazılır (BAG tablosu) ama her bağ PDF metninde o ailenin model simgesi aranarak sınanır.
 * Simge hiç geçmiyorsa satır "KANITSIZ" işaretlenir ve çıkış kodu 1 olur: elle yazılan bağ, metne
 * dayanmıyorsa kabul edilmez.
 *
 * KOŞUM (salt okuma, canlıya yazmaz):
 *   VENTHUB_INGESTOR=<ingestor kökü> node scripts/icerik-hatti/belge-listesi-birlestir.mjs \
 *     --canli=<product_families+products JSON> --cikti=<csv yolu>
 * --canli dosyası: {fam:[{id,slug,name}], prods:[{family_id,status}]} (SELECT ile alınır).
 * Çıkış: 0 tamam · 1 kanıtsız bağ var · 2 ÖLÇÜLEMEDİ.
 */
import { readFileSync, writeFileSync, existsSync } from 'node:fs'
import { createHash } from 'node:crypto'
import { join } from 'node:path'

const arg = (ad) => process.argv.find(a => a.startsWith(`--${ad}=`))?.slice(ad.length + 3)
const ING = process.env.VENTHUB_INGESTOR
const CANLI = arg('canli')
const CIKTI = arg('cikti')
if (!ING || !CANLI || !CIKTI) {
  console.error('ÖLÇÜLEMEDİ — VENTHUB_INGESTOR, --canli ve --cikti gerekli.')
  process.exit(2)
}
const ENV_YOL = join(ING, 'kaynak-dizini', 'katalog-envanteri.json')
const DIZIN = join(ING, 'kaynak-dizini', 'sayfalar.jsonl')
for (const p of [ENV_YOL, DIZIN, CANLI]) if (!existsSync(p)) { console.error(`ÖLÇÜLEMEDİ — yok: ${p}`); process.exit(2) }

const envanter = JSON.parse(readFileSync(ENV_YOL, 'utf8'))
const canli = JSON.parse(readFileSync(CANLI, 'utf8'))
const sayfalar = readFileSync(DIZIN, 'utf8').split('\n').filter(Boolean).map(s => JSON.parse(s))
const hashSayfa = new Map()
for (const r of sayfalar) {
  const t = `${r.metin || ''} ${JSON.stringify(r.tablo || [])}`
  if (!hashSayfa.has(r.pdf_hash)) hashSayfa.set(r.pdf_hash, [])
  hashSayfa.get(r.pdf_hash).push({ s: r.sayfa, t })
}

// ── Aile model simgesi: kanıt sayfası sayımı bununla yapılır (canlı ürün adlarından türetildi).
const SIMGE = {
  'casals-kentalfan-plug': /KENTALFAN/i,
  'casals-enkelfan-ec-plug': /ENKELFAN/i,
  'casals-nimus': /NIMUS/i,
  'casals-nimax': /NIMAX/i,
  'danfoss-vlt-hvac-basic-drive-fc-101': /FC\s*-?\s*101/i,
  'danfoss-vlt-hvac-drive-fc-102': /FC\s*-?\s*102/i,
  'danfoss-vlt-micro-drive-fc-51': /FC\s*-?\s*51\b|Micro\s*Drive/i,
  'nicotra-gebhardt-adh-sik-kanatli-radyal-fanlar': /\bADH\b/,
  'nicotra-gebhardt-at-cift-emisli-radyal-fanlar': /\bAT\s*\d{1,2}\s*[-/]\s*\d/,
  'nicotra-gebhardt-dd-direkt-akuple-radyal-fanlar': /\bDD\s*\d{1,2}\s*[-/]\s*\d/,
  'nicotra-gebhardt-rdh-seyrek-kanatli-radyal-fanlar': /\bRDH\b/,
  'seat-serisi': /\bSEAT\s*(15|20|25|30|35|50)\b/,
  'jet-serisi': /\bJET\s*(20|25|30|SERIES)\b/i,
  'storm-serisi': /\bSTORM\b/i,
  'vortice-vort-e-atex-fanlar': /E-?\s*ATEX|\bE\s*\d{3}\s*[MT]\b.*ATEX/i,
  'vortice-aksiyel-endustriyel-fanlar': /\bE\s*\d{3}\s*[MT]\b/,
  'vortice-heatmaster-duman-egzoz-fanlari': /HEATMASTER/i,
  'vortice-slimroof-cati-fanlari': /SLIMROOF/i,
  'vortice-nordik-hvls-hyperblade': /NORDIK/i,
  'vortice-vort-qbk-sal-kc-evo': /QBK/i,
  'vortice-vort-commercial-in-line-yuvarlak-kanal-fanlari': /\bCA\s*\d{3}\s*(Q\s*)?MD\b/i,
  'vortice-vort-commercial-in-line-dikdortgen-kanal-fanlari': /CA[\s-]*IL\s*\d{4}|RECT/i,
  'vortice-ad-isiticisiz-hava-perdeleri': /\bAD\s*(900|1200|1500)\b/,
  'vortice-h-ad-elektrikli-isiticili-hava-perdeleri': /\bH\s*AD\s*\d/,
  'vortice-vort-hr-isi-geri-kazanim': /\b(AVEL|NETI|INVISIBLE)\b/i,   // \b: "magNETIc" içindeki NETI yanlış pozitifti (bağımsız doğrulayıcı, KTL-59)
  'vortice-deumido-nem-alma-cihazlari': /DEUMIDO\s*NG|\bNG\s*(10|16|20)\b/i,
  'vortice-lineo-kanal-fanlari': /LINEO\s*\d{3}(?!\s*QUIET)/i,
  'vortice-lineo-quiet-sessiz-kanal-fanlari': /QUIET/i,
  'vortice-punto-evo-flexo-banyo-fanlari': /FLEXO/i,
  'vortice-radon-serisi-kanal-fanlari': /CA[\s-]?RM\s*(\d{3}\s*)?ES/i,
  'vortice-radon-serisi-cati-fanlari': /CA[\s-]?RM\s*(\d{3}\s*)?RF/i,
  'vortice-vort-mono': /MONO/i,
  'vortice-vort-quadro-evo': /QUADRO/i,
  'vortice-bravo-s': /BRA\.?\s*VO/i,
  'vortice-vorticent-cms-atex-santrifuj-fanlar': /CMS\s*ATEX/i,
}

// ── BAĞ TABLOSU: dosya adı → bağ kararı. yayin: evet | hayir (sebep) . tur: OPS planındaki
// doc_type değerleri (teknik_foy, katalog, cad, ce_erp, diger) + önerilen kilavuz.
const Y = 'evet'
const BAG = {
  'avens_fiyat_listesi_2026_HQ.pdf': { a: [], tur: 'diger', yayin: 'hayir: fiyat listesi, müşteriye belge olarak verilmez', not: 'marka geneli' },
  '82f7f-cata-logo-plug-fans_casals.pdf': { a: ['casals-kentalfan-plug', 'casals-enkelfan-ec-plug'], tur: 'katalog', yayin: Y },
  '77854-ns-nx-casals-en.pdf': { a: ['casals-nimus', 'casals-nimax'], tur: 'katalog', yayin: Y },
  'AF-Catalogo-tecnico-2024-Casals-kesit-s29_31-33-37_38-73_74-76-79_80-82-246_260-414_419-524_529-773_775-1017-1021-1056_1058-1065-1072-1076-1078-1083-1085-1098-1102.pdf':
    { a: ['casals-nimus', 'casals-nimax'], tur: 'katalog', yayin: 'hayir: üretici kataloğundan bizim kestiğimiz parça; tam katalog casals.com görüntüleyicisinde' },
  'AD397545239678en-000101.pdf': { a: ['danfoss-vlt-micro-drive-fc-51'], tur: 'katalog', yayin: Y, not: 'seçim kılavuzu' },
  'AD449962666883en-010201.pdf': { a: ['danfoss-vlt-hvac-basic-drive-fc-101'], tur: 'katalog', yayin: Y, not: 'seçim kılavuzu; belgeler.csv marka geneli diyordu' },
  'AJ275648114271en-001201.pdf': { a: ['danfoss-vlt-hvac-basic-drive-fc-101'], tur: 'kilavuz', yayin: Y, not: 'tasarım kılavuzu' },
  'AJ275648114271en-US1001.pdf': { a: ['danfoss-vlt-hvac-basic-drive-fc-101'], tur: 'kilavuz', yayin: 'hayir: eski baskı (ABD), yerini AJ275648114271en-001201 aldı' },
  'AJ361178983102en-000401.pdf': { a: ['danfoss-vlt-micro-drive-fc-51'], tur: 'kilavuz', yayin: Y, not: 'tasarım kılavuzu' },
  'AM447245614445en-000101.pdf': { a: ['danfoss-vlt-micro-drive-fc-51'], tur: 'teknik_foy', yayin: 'dogrulanacak: 2014.09 fact sheet; Danfoss'+"'"+'ta 31 Mart 2023 fact sheet var, kodla eşleşmedi', not: 'FC51-DataSheet.pdf ile aynı ürünün iki eski fact sheet baskısı' },
  'AQ276736419659en-000101.pdf': { a: ['danfoss-vlt-micro-drive-fc-51'], tur: 'kilavuz', yayin: Y, not: 'kullanım kılavuzu; belgeler.csv marka geneli diyordu' },
  'FC51-DataSheet.pdf': { a: ['danfoss-vlt-micro-drive-fc-51'], tur: 'teknik_foy', yayin: 'dogrulanacak: 2019.11 datasheet (afi-systems aynası); Danfoss'+"'"+'ta 31 Mart 2023 fact sheet var', not: 'AM447245614445 ile aynı ürünün iki eski fact sheet baskısı' },
  'fc51Design-Guide.pdf': { a: ['danfoss-vlt-micro-drive-fc-51'], tur: 'kilavuz', yayin: 'hayir: eski baskı, yerini AJ361178983102en-000401 aldı' },
  'AJ361178969194en-000301.pdf': { a: ['danfoss-vlt-hvac-drive-fc-102'], tur: 'kilavuz', yayin: Y, not: '110–800 kW' },
  'FC102_1.1-90kW_DesignGuide_AJ299549559248en-002001.pdf': { a: ['danfoss-vlt-hvac-drive-fc-102'], tur: 'kilavuz', yayin: Y, not: '1,1–90 kW' },
  'MG16Z102-Guia-Design-FC102-355-800K-E-Ing.pdf': { a: ['danfoss-vlt-hvac-drive-fc-102'], tur: 'kilavuz', yayin: 'hayir: eski baskı, 355–800 kW aralığını AJ361178969194en-000301 kapsıyor' },
  '493-series-dd.pdf': { a: ['nicotra-gebhardt-dd-direkt-akuple-radyal-fanlar'], tur: 'katalog', yayin: Y, not: 'baskı 2012' },
  'Katalog-DDMB-DDM-DD-eng.pdf': { a: ['nicotra-gebhardt-dd-direkt-akuple-radyal-fanlar'], tur: 'katalog', yayin: Y },
  'MCC-NIG-DDMP_Catalog_EN.pdf': { a: [], tur: 'katalog', yayin: 'hayir: DDMP tek faz serisi; canlıdaki DD modelleri bu katalogda yok', not: 'marka geneli' },
  'MCC_NIG_DDDDM_Catalog-EN.pdf': { a: [], tur: 'katalog', yayin: 'hayir: metinde yalnız DDM modelleri var, canlıdaki DD modelleri yok', not: 'marka geneli' },
  '480-series-at.pdf': { a: ['nicotra-gebhardt-at-cift-emisli-radyal-fanlar'], tur: 'katalog', yayin: Y },
  'MCC_NIG_ADH-AT-RDE-RZR_Catalog_EN.pdf': { a: ['nicotra-gebhardt-adh-sik-kanatli-radyal-fanlar', 'nicotra-gebhardt-at-cift-emisli-radyal-fanlar', 'nicotra-gebhardt-rdh-seyrek-kanatli-radyal-fanlar'], tur: 'katalog', yayin: Y },
  '481-series-rdh.pdf': { a: ['nicotra-gebhardt-rdh-seyrek-kanatli-radyal-fanlar'], tur: 'katalog', yayin: Y },
  '479-series-adh.pdf': { a: ['nicotra-gebhardt-adh-sik-kanatli-radyal-fanlar'], tur: 'katalog', yayin: Y },
  'FXQejq7tfTOtLQypNJrYMGjORsBaF6yz0G208fqW.pdf': { a: ['seat-serisi'], tur: 'teknik_foy', yayin: 'dogrulanacak: SEAT serisi özellik föyü ama üreticideki karşılığı bulunamadı (kimlik ve baskı belirsiz, sha 8f5bd46b…)', not: 'dosya adı anlamsız; belgeler.csv marka geneli diyordu' },
  'Installation-guide_ATEX_fans_english1.pdf': { a: [], tur: 'kilavuz', yayin: 'dogrulanacak: SEAT ATEX fan kurulum kılavuzu (2011); envanter "eski" diyor, yerine geçen kılavuz ölçülmedi (2024 broşürü kurulum içeriği taşımayabilir)', not: 'marka geneli, güvenlik (ATEX) içerikli; yayından önce üreticide güncel kılavuz aranmalı' },
  'JET-20-Specifications.pdf': { a: ['jet-serisi'], tur: 'teknik_foy', yayin: 'hayir: eski baskı, yerini seat-brochure-2024-11 aldı' },
  'JET-25-Specifications.pdf': { a: ['jet-serisi'], tur: 'teknik_foy', yayin: 'hayir: eski baskı, yerini seat-brochure-2024-11 aldı' },
  'JET-30-Specifications.pdf': { a: ['jet-serisi'], tur: 'teknik_foy', yayin: 'hayir: eski baskı, yerini seat-brochure-2024-11 aldı' },
  'JET.pdf': { a: ['jet-serisi'], tur: 'katalog', yayin: 'hayir: eski baskı (net ağırlıklar KTL-55 ile düzeltildi), yerini seat-brochure-2024-11 aldı' },
  'SEAT-CATALOGUE.pdf': { a: [], tur: 'katalog', yayin: 'hayir: eski baskı, yerini seat-brochure-2024-11 aldı', not: 'marka geneli' },
  'SEAT.pdf': { a: ['seat-serisi'], tur: 'teknik_foy', yayin: 'hayir: eski baskı, yerini seat-brochure-2024-11 aldı' },
  'Seat_V5-catalogue_lr.pdf': { a: [], tur: 'katalog', yayin: 'hayir: resmi değil (üçüncü taraf Fantech Trade baskısı)', not: 'marka geneli' },
  'Storm_series.pdf': { a: ['storm-serisi'], tur: 'katalog', yayin: 'hayir: eski baskı, yerini seat-brochure-2024-11 aldı' },
  'seat-15-fiche-technique-en-03-2024.pdf': { a: ['seat-serisi'], tur: 'teknik_foy', yayin: Y, not: 'SEAT 15 model föyü 2024-03' },
  'seat-20-fiche-technique-gb-03-2024.pdf': { a: ['seat-serisi'], tur: 'teknik_foy', yayin: Y, not: 'SEAT 20 model föyü 2024-03' },
  'seat-25-fiche-technique-gb-03-2024.pdf': { a: ['seat-serisi'], tur: 'teknik_foy', yayin: Y, not: 'SEAT 25 model föyü 2024-03' },
  'seat-30-fiche-technique-gb-03-2024.pdf': { a: ['seat-serisi'], tur: 'teknik_foy', yayin: Y, not: 'SEAT 30 model föyü 2024-03' },
  'seat-35-fiche-technique-gb-03-2024.pdf': { a: ['seat-serisi'], tur: 'teknik_foy', yayin: Y, not: 'SEAT 35 model föyü 2024-03' },
  'seat-50-fiche-technique-gb-03-2024.pdf': { a: ['seat-serisi'], tur: 'teknik_foy', yayin: Y, not: 'SEAT 50 model föyü 2024-03' },
  'seat-brochure-2024-11.pdf': { a: ['seat-serisi', 'jet-serisi', 'storm-serisi'], tur: 'katalog', yayin: Y, not: 'üç seriyi kapsar (Design: doğrulanacak)' },
  'seat-katalog.pdf': { a: [], tur: 'katalog', yayin: 'hayir: eski baskı, yerini seat-brochure-2024-11 aldı', not: 'marka geneli' },
  'Doc_Pubblicita_Industrial_ventilation_vort_jet_fan_system_1.pdf': { a: [], tur: 'katalog', yayin: 'hayir: canlıda bu ürünün ailesi yok (jet fan sistemi)', not: 'marka geneli' },
  'Commercial_Ventilation_in_Line_1.pdf': { a: ['vortice-vort-commercial-in-line-yuvarlak-kanal-fanlari', 'vortice-vort-commercial-in-line-dikdortgen-kanal-fanlari'], tur: 'katalog', yayin: 'hayir: eski baskı, yerini In-Line Fans Range 191875 aldı' },
  'Doc_Pubblicita_Commercial_ventilation_in_line_fans_1.pdf': { a: ['vortice-vort-commercial-in-line-yuvarlak-kanal-fanlari', 'vortice-vort-commercial-in-line-dikdortgen-kanal-fanlari'], tur: 'katalog', yayin: 'hayir: eski baskı, yerini In-Line Fans Range 191875 aldı' },
  'Doc_Pubblicita_In-Line_Fans_Range_191875.pdf': { a: ['vortice-vort-commercial-in-line-yuvarlak-kanal-fanlari', 'vortice-vort-commercial-in-line-dikdortgen-kanal-fanlari', 'vortice-lineo-kanal-fanlari', 'vortice-lineo-quiet-sessiz-kanal-fanlari'], tur: 'katalog', yayin: Y },
  'E_ATEX_Range_yeni_2025.pdf': { a: ['vortice-vort-e-atex-fanlar'], tur: 'katalog', yayin: Y, not: 'Design: PDF yok diyordu; s.7 tablo ↔ s.12 grafik 506 T/606 T ters eşleşmesi üreticiye soruldu (KTL-57)' },
  'heat-master-slimroof-cati-fanlari-yeni.pdf': { a: ['vortice-heatmaster-duman-egzoz-fanlari', 'vortice-slimroof-cati-fanlari'], tur: 'katalog', yayin: Y, not: 'Design: PDF yok diyordu' },
  'industrial_Ventilation.pdf': { a: ['vortice-aksiyel-endustriyel-fanlar'], tur: 'katalog', yayin: Y, not: 'belgeler.csv Tiracamino ailesine de bağlıyordu; katalogda TIRACAMINO 0 sayfa, bağ kaldırıldı' },
  'Doc_Pubblicita_Industrial_ceiling_fans_HVLS_194582.pdf': { a: ['vortice-nordik-hvls-hyperblade'], tur: 'katalog', yayin: Y },
  'nordik-hvls-industrial-ceiling-fans-181471.pdf': { a: ['vortice-nordik-hvls-hyperblade'], tur: 'katalog', yayin: 'hayir: eski baskı, yerini 194582 aldı' },
  'Doc_Pubblicita_Vort_QBK_SAL-KC_EVO_190829.pdf': { a: ['vortice-vort-qbk-sal-kc-evo'], tur: 'katalog', yayin: Y },
  'qbk-sal-kc-evo-en-yeni-2025.pdf': { a: ['vortice-vort-qbk-sal-kc-evo'], tur: 'katalog', yayin: 'hayir: eski baskı, yerini 190829 aldı' },
  'Air_Conditioning_Air_Door_2.pdf': { a: ['vortice-ad-isiticisiz-hava-perdeleri', 'vortice-h-ad-elektrikli-isiticili-hava-perdeleri'], tur: 'katalog', yayin: 'hayir: eski baskı, yerini Air Door Range 189461 aldı' },
  'Doc_Pubblicita_Air_Door_Range_189461.pdf': { a: ['vortice-ad-isiticisiz-hava-perdeleri', 'vortice-h-ad-elektrikli-isiticili-hava-perdeleri'], tur: 'katalog', yayin: Y },
  'Doc_Pubblicita_NRG_Range_178104.pdf': { a: [], tur: 'katalog', yayin: 'hayir: canlıdaki VORT HR modelleri (Avel, Neti, Invisible) bu katalogda yok', not: 'Design eşlemesi doğrulanmadı' },
  'Doc_Pubblicita_Residential_ventilation_vmc_1.pdf': { a: ['vortice-vort-hr-isi-geri-kazanim'], tur: 'katalog', yayin: 'hayir: eski baskı, aynı modelleri güncel MEV 188510 kapsıyor' },
  'Doc_Pubblicita_VORT_HR_W-ALL_100_DF_193392.pdf': { a: [], tur: 'katalog', yayin: 'hayir: canlıdaki VORT HR modelleri bu katalogda yok', not: 'Design eşlemesi doğrulanmadı' },
  'nrg-range-175696-isi-geri-kazanim.pdf': { a: [], tur: 'katalog', yayin: 'hayir: eski baskı ve canlı modeller yok' },
  'vort-hr-w-all-100-df.pdf': { a: [], tur: 'katalog', yayin: 'hayir: eski baskı ve canlı modeller yok' },
  'vortice-brochure-mev.pdf': { a: ['vortice-vort-mono'], tur: 'katalog', yayin: 'hayir: eski baskı (VORT MONO RANGE), yerini vortice-vort-mono-wifi-189860 aldı; vortice_vort_mono_range_new.pdf ile aynı bayt', not: 'dosya adı yanlış: içerik MEV değil VORT MONO; KTL-59 doğrulayıcısı düzeltti (önceki sürüm VORT HR bağı kurmuştu, regex "magNETIc" yanlış pozitifi)' },
  'vortice-mev-iot-188510.pdf': { a: ['vortice-vort-hr-isi-geri-kazanim'], tur: 'katalog', yayin: Y, not: 'Design bu dosyayı iki parçaya bölmüş (s.1–82, s.83–164); yayında tek dosya' },
  'Doc_Pubblicita_Residential_Ventilation2024_186926.pdf': { a: ['vortice-punto-evo-flexo-banyo-fanlari', 'vortice-vort-quadro-evo'], tur: 'katalog', yayin: Y, not: 'Design Bravo S ailesine de bağlıyordu; katalogda BRA.VO 0 sayfa, bağ kaldırıldı' },
  'ResidentialVentilation.pdf': { a: [], tur: 'katalog', yayin: 'hayir: eski baskı, yerini Residential Ventilation 2024 186926 aldı', not: 'marka geneli' },
  'Why-Ventilate-Brochure.pdf': { a: [], tur: 'diger', yayin: Y, not: 'marka geneli: genel bilgilendirme broşürü, Bilgi Merkezi ya da marka sayfası' },
  'vortice-brochure-radon-en.pdf': { a: ['vortice-vort-hr-isi-geri-kazanim'], tur: 'katalog', yayin: 'hayir: dosya adı yanlış (içerik MEV ısı geri kazanım broşürü, radon değil); güncel MEV 188510 varken yayınlanmaz' },
  'Doc_Pubblicita_Air_treatment_Deumido_Range_1.pdf': { a: ['vortice-deumido-nem-alma-cihazlari'], tur: 'katalog', yayin: Y, not: 'canlıdaki DEUMIDO NG modelleri bu baskıda' },
  'Doc_Pubblicita_Deumido_Evo_Range_177678.pdf': { a: [], tur: 'katalog', yayin: 'hayir: Deumido Evo kataloğu; canlıdaki NG 10/16/20 modelleri bu katalogda yok', not: 'Design eşlemesi doğrulanmadı' },
  'Doc_Pubblicita_Lineo_Range_193047.pdf': { a: ['vortice-lineo-kanal-fanlari', 'vortice-lineo-quiet-sessiz-kanal-fanlari'], tur: 'katalog', yayin: Y },
  'LINEO_QUITE_KATALOG.pdf': { a: ['vortice-lineo-quiet-sessiz-kanal-fanlari'], tur: 'katalog', yayin: 'hayir: eski baskı (2020-12), yerini Lineo Range 193047 aldı' },
  'Doc_Pubblicita_Residential_ventilation_Punto_Evo_Flexo_2.pdf': { a: ['vortice-punto-evo-flexo-banyo-fanlari'], tur: 'katalog', yayin: Y },
  '2022-11-en-ca-rm-es-radon.pdf': { a: ['vortice-radon-serisi-kanal-fanlari', 'vortice-radon-serisi-cati-fanlari'], tur: 'katalog', yayin: 'hayir: eski baskı (2022-11), yerini CA RADON 178112 aldı' },
  'Doc_Pubblicita_CA_RADON_178112.pdf': { a: ['vortice-radon-serisi-kanal-fanlari', 'vortice-radon-serisi-cati-fanlari'], tur: 'katalog', yayin: Y },
  'vortice-vort-mono-wifi-189860.pdf': { a: ['vortice-vort-mono'], tur: 'katalog', yayin: Y, not: 'Design bu dosyayı iki parçaya bölmüş; yayında tek dosya' },
  'vortice_vort_mono_range_new.pdf': { a: ['vortice-vort-mono'], tur: 'katalog', yayin: 'hayir: eski baskı (VORT MONO RANGE), yerini vortice-vort-mono-wifi-189860 aldı; vortice-brochure-mev.pdf ile aynı bayt' },
  'Doc_Pubblicita_Residential_ventilation_vort_quadro_evo_179649.pdf': { a: ['vortice-vort-quadro-evo'], tur: 'katalog', yayin: Y },
  'Doc_Pubblicita_Residential_ventilation_vort_quadro_evo_4.pdf': { a: ['vortice-vort-quadro-evo'], tur: 'katalog', yayin: 'hayir: eski baskı, yerini 179649 aldı' },
  'vortice-bravo-s.pdf': { a: ['vortice-bravo-s'], tur: 'teknik_foy', yayin: 'dogrulanacak: tek sayfalık hava kalitesi ölçer broşürü; envanter de üreticide karşılığını ölçemedi (OPS-119)', kanit: 'dosya adı ve dizin adı (tek sayfa, model adı görselde, metinde yok)' },
  'Doc_Pubblicita_VORTICENT_CMS_RANGE_193646.pdf': { a: [], tur: 'katalog', yayin: 'hayir: standart CMS kataloğu; canlıdaki ailenin tamamı ATEX ve katalogda ATEX 0 sayfa', not: 'Design eşlemesi doğrulanmadı' },
}
// Vorticent CMS ATEX model föyleri (10 dosya, 11 üründen 10'u): ürün düzeyi föy, aileye de bağlanır.
for (const s of envanter.satirlar) {
  if (/VORTICENT-CMS-ATEX-/.test(s.dosya)) BAG[s.dosya] = { a: ['vortice-vorticent-cms-atex-santrifuj-fanlar'], tur: 'teknik_foy', yayin: Y, not: 'model föyü (baskı 2026-03-05); Design: PDF yok diyordu' }
  if (/^avensair-ADH-/.test(s.dosya)) BAG[s.dosya] = { a: ['nicotra-gebhardt-adh-sik-kanatli-radyal-fanlar'], tur: 'teknik_foy', yayin: 'hayir: Recep kararı (25 Ekim 2026): avensair-ADH föyleri iptal, yayınlanmaz' }
}

// ── Dil: TÜM sayfalar tek tek sınıflanır (REC-145 devamı, KTL-59). Her sayfada altı dilin işlev
// kelimeleri sayılır; en yüksek sayı en az 4 ve ikincisinin en az 1,5 katı ise sayfa o dildedir,
// değilse "belirsiz" (tablo ve sayı yoğun sayfa). Belgenin dili = sınıflanan sayfaların en az %10'unu
// tutan diller (çoktan aza). Dağılım sütunu ham sayıyı yazar: hüküm okunabilir, tahmin gizlenmez.
const DIL = {
  tr: /\b(ve|için|ile|bir|veya|olarak|daha|kadar|fiyat|liste|adet|ürün|tip)\b/gi,
  en: /\b(the|and|with|for|of|to|is|are|can|this|that|from|by|on|technical|data)\b/gi,
  es: /\b(los|las|el|para|del|con|una|por|que|más|técnico|ventiladores)\b/gi,
  it: /\b(della|delle|degli|per|con|il|gli|sono|che|ventilatori|più)\b/gi,
  fr: /\b(les|des|pour|avec|dans|est|sont|une|et|ventilateur|technique)\b/gi,
  de: /\b(und|der|die|das|mit|für|ist|nicht|von|auf|zu|ventilator)\b/gi,
}
const dilOlc = (pg) => {
  const say = {}
  let sinif = 0
  for (const p of pg) {
    const sk = Object.entries(DIL).map(([k, re]) => [k, (p.t.match(re) || []).length]).sort((a, b) => b[1] - a[1])
    if (sk[0][1] >= 4 && sk[0][1] >= sk[1][1] * 1.5) { say[sk[0][0]] = (say[sk[0][0]] || 0) + 1; sinif++ }
  }
  const diller = Object.entries(say).sort((a, b) => b[1] - a[1]).filter(([, n]) => n >= sinif * 0.1).map(([k]) => k)
  return {
    dil: diller.join('+') || 'belirsiz',
    dagilim: Object.entries(say).sort((a, b) => b[1] - a[1]).map(([k, n]) => `${k}:${n}`).join('|') + `|belirsiz:${pg.length - sinif}`,
  }
}

// ── Üretici baskı kıyası (KTL-59): --baski=<json>; anahtar dosya adı. Yoksa sütunlar boş kalır.
const BASKI_YOL = arg('baski')
const BASKI = BASKI_YOL && existsSync(BASKI_YOL) ? JSON.parse(readFileSync(BASKI_YOL, 'utf8')).kayitlar : {}

const urunSay = new Map()
for (const p of canli.prods) urunSay.set(p.family_id, (urunSay.get(p.family_id) || 0) + 1)
const aileler = new Map(canli.fam.map(f => [f.slug, { ...f, urun: urunSay.get(f.id) || 0 }]))

const cikti = []
let kanitsiz = 0, eksikBag = 0, shaFark = 0
for (const s of envanter.satirlar) {
  const yol = join(ING, 'venthub', s.yol)
  const sha = createHash('sha256').update(readFileSync(yol)).digest('hex')
  if (sha !== s.sha256) shaFark++
  const b = BAG[s.dosya]
  if (!b) { eksikBag++; console.error(`BAĞ KARARI YOK: ${s.dosya}`); continue }
  const pg = hashSayfa.get(s.sha256) || []
  const { dil, dagilim } = dilOlc(pg)
  const hedefler = b.a.length ? b.a : ['']
  for (const slug of hedefler) {
    let kanit = 'marka geneli'
    if (slug) {
      if (!aileler.has(slug)) { console.error(`CANLIDA AİLE YOK: ${slug}`); process.exit(2) }
      const re = SIMGE[slug]
      const n = pg.filter(p => re.test(p.t)).length
      kanit = `${n}/${pg.length} sayfada model simgesi`
      if (n === 0 && b.kanit) kanit = `ELLE: ${b.kanit}`
      else if (n === 0) { kanitsiz++; kanit = `KANITSIZ (0/${pg.length})` }
    }
    cikti.push({
      aile_slug: slug, aile_urun: slug ? aileler.get(slug).urun : '', marka: s.marka,
      tur: b.tur, dil, dil_sayfa_dagilimi: dagilim, sayfa: s.sayfa, baski_durumu: s.durum,
      baski_kiyasi: (BASKI[s.dosya] || {}).hukum || '', baski_kiyasi_kanit: (BASKI[s.dosya] || {}).kanit || '',
      yayin_onerisi: b.yayin, kanit, sha256: s.sha256, boyut_bayt: s.boyut_bayt,
      kaynak_yol: `venthub/${s.yol}`, not: b.not || '',
    })
  }
}
cikti.sort((x, y) => (x.aile_slug || '~').localeCompare(y.aile_slug || '~') || x.kaynak_yol.localeCompare(y.kaynak_yol))
const kol = Object.keys(cikti[0])
const hucre = (v) => { const t = String(v ?? '').replace(/\r?\n/g, ' '); return /[;"]/.test(t) ? `"${t.replace(/"/g, '""')}"` : t }
writeFileSync(CIKTI, '﻿' + [kol.join(';'), ...cikti.map(r => kol.map(k => hucre(r[k])).join(';'))].join('\r\n') + '\r\n')

const yayinAile = new Set(cikti.filter(r => r.aile_slug && r.yayin_onerisi === Y).map(r => r.aile_slug))
const bossuz = [...aileler.values()].filter(f => !yayinAile.has(f.slug))
console.log(`satır ${cikti.length} · PDF ${envanter.satirlar.length} · sha farkı ${shaFark} · bağ kararı eksik ${eksikBag} · kanıtsız bağ ${kanitsiz}`)
console.log(`yayınlanabilir belgesi olan aile ${yayinAile.size}/${aileler.size} · ürün ${[...yayinAile].reduce((t, s) => t + aileler.get(s).urun, 0)}/${canli.prods.length}`)
console.log(`yayınlanabilir belgesi OLMAYAN aile (${bossuz.length}): ${bossuz.map(f => `${f.slug} (${f.urun})`).join(' · ')}`)
process.exit(eksikBag || shaFark ? 2 : kanitsiz ? 1 : 0)
