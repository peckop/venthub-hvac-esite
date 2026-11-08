#!/usr/bin/env node
/**
 * REHBER YAZISI ENVANTERİ — betikle üretilen TEK tablo (BLG-58, OPS-254; rehber-yazisi-standard.md R1.3 "önceki çalışma").
 *
 * Satır = yazı. Sütunlar: yazı × konu × yayın/güncelleme × mevzuat kalemleri × ürün ailesi × kategori × dizin/sıra × durum.
 * Elle tutulmaz: yeni yazı emrinde "ÖNCEKİ ÇALIŞMA" satırı bu tabloya bakar (Kanban'daki "ne yaptık / sırada" kaydıyla birlikte).
 *
 * Kaynaklar (hepsi depoda, ağsız):
 *   - src/data/bilgiMerkezi/yazilar.ts       → kimlik, konu, tarihler, urunler, ilgiliKategoriler, slug, gövde
 *   - docs/mevzuat/kayit.json                → kalem kimlikleri (mevzuat sütununun doğrulaması)
 *   - isteğe bağlı --dizin <json>            → Geo-SEO dizin/sıra tablosu (DEPO DIŞI: sorgu/arama verisi depoya girmez, P6);
 *                                              biçim: { "<yazı kimliği>": { "bing": "...", "google": "...", "yandex": "...", "sira": "..." } }
 *
 * ⚠Mevzuat sütunu BETİKLE TAHMİNDİR: gövdede kalem desenini (ör. "2024/1834", "RG 29758") arar. Kesin bağ BLG-57 şemasındaki
 * `mevzuat[]` alanıdır; o gelene kadar bu sütun "gövdede anılan" demektir, "doğru anılmış" demek DEĞİLDİR (doğruluk MVZ-9 / MEVZUAT).
 * Kayıtta kalemi OLMAYAN ama yazıda anılan mevzuat (ör. Planlı Alanlar İmar Yönetmeliği) "kayıtta yok" olarak ayrı listelenir.
 * "Dizin ölçülmedi" ile "dizinde yok" ayrı sonuçlardır: --dizin verilmezse sütun ÖLÇÜLMEDİ yazar, boş bırakılmaz.
 *
 * Kullanım:
 *   node scripts/rehber/yazi-envanteri.mjs                       # markdown tablo (stdout)
 *   node scripts/rehber/yazi-envanteri.mjs --json                # makine okunur
 *   node scripts/rehber/yazi-envanteri.mjs --dizin <dosya.json>  # dizin/sıra sütununu doldurur
 *   node scripts/rehber/yazi-envanteri.mjs --yaz <dosya.md>      # tabloyu dosyaya yazar
 * Çıkış: 0 · 1 hata (bilinmeyen kalem deseni kayıtta yok, ayrıştırma sıfır yazı).
 */
import { readFileSync, writeFileSync } from 'node:fs'
import { dirname, join, resolve } from 'node:path'
import { fileURLToPath, pathToFileURL } from 'node:url'

const KOK = resolve(dirname(fileURLToPath(import.meta.url)), '..', '..')

/** Gövdede kalem anan desenler. `kayit` = kayit.json kimliği; `kayit: null` = kayıtta kalemi olmayan ama anılan mevzuat. */
export const KALEM_DESENLERI = [
  { kayit: 'AB-2019/1781', desen: /2019\/1781/ },
  { kayit: 'AB-2021/341', desen: /2021\/341/ },
  { kayit: 'TR-SGM-2021/16', desen: /SGM-2021\/16|(?<![\d/])2021\/16(?!\d)|31468/ },
  { kayit: 'TR-SGM-2021/23', desen: /SGM-2021\/23|(?<![\d/])2021\/23(?!\d)|31526/ },
  { kayit: 'AB-327/2011', desen: /327\/2011/ },
  { kayit: 'AB-2024/1834', desen: /2024\/1834/ },
  { kayit: 'AB-2025/2481', desen: /2025\/2481/ },
  { kayit: 'TR-SVGM-2019/15', desen: /SVGM-2019\/15|(?<![\d/])2019\/15(?!\d)|SVGM/ },
  { kayit: 'TR-SGM-2026/2', desen: /SGM-2026\/2/ },
  { kayit: 'AB-2014/34', desen: /2014\/34/ },
  { kayit: 'TR-YON-ATEX-2014/34', desen: /29758/ },
  { kayit: 'AB-1999/92', desen: /(?:19)?99\/92/ },
  { kayit: 'TR-YON-ATEX-1999/92', desen: /28633/ },
  { kayit: 'AB-94/9', desen: /94\/9\/(?:CE|AT)|94\/9\b/ },
  { kayit: 'STD-IEC-61800-3', desen: /61800-3/ },
  { kayit: 'STD-EN-12101-3', desen: /12101-3/ },
  { kayit: 'AB-1253/2014', desen: /1253\/2014/ },
  { kayit: 'AB-1254/2014', desen: /1254\/2014/ },
  { kayit: 'TR-SGM-2021/18', desen: /SGM-2021\/18/ },
  { kayit: 'TR-SGM-2021/19', desen: /SGM-2021\/19/ },
  { kayit: 'TR-YON-GURULTU-BINA-2017', desen: /30082|Binaların Gürültüye Karşı Korunması/ },
  { kayit: 'TR-YON-GURULTU-BINA-2018-DEG', desen: /30437/ },
  // Kayıtta kalemi olmayan, yazıda anılan mevzuat (BLG-57 bulgusu: MEVZUAT kalem açmadan bağ kurulamaz)
  { kayit: null, ad: 'Planlı Alanlar İmar Yönetmeliği (RG 30113)', desen: /30113|Planlı Alanlar İmar Yönetmeliği/ },
  { kayit: null, ad: 'Binalarda Enerji Performansı Yönetmeliği (RG 27075)', desen: /27075|Binalarda Enerji Performansı/ },
]

/** `[ ... ]` dizi gövdesinden tırnaklı dizgeleri çıkarır (tek satır ya da çok satır). */
function dizgeDizisi(segment, alan) {
  const m = segment.match(new RegExp(`${alan}:\\s*\\[([\\s\\S]*?)\\]`))
  if (!m) return []
  return [...m[1].matchAll(/'([^']+)'|"([^"]+)"/g)].map((x) => x[1] ?? x[2])
}

/**
 * yazilar.ts metninden kayıtları çıkarır. Kayıt sınırı `kimlik: '…'` satırıdır; gövde `govde: \`…\`,` aralığıdır.
 * (TS içe aktarılmaz: betik saf Node, derleyicisiz çalışır; yazı kaydı biçimi `yazilar.ts` RehberYazisi arayüzüdür.)
 */
export function yazilariAyristir(kaynak) {
  const t = kaynak.replace(/\r\n/g, '\n')
  const baslar = [...t.matchAll(/^\s{4}kimlik:\s*'([^']+)'/gm)]
  const kayitlar = []
  for (const [i, m] of baslar.entries()) {
    const bas = m.index
    const son = i + 1 < baslar.length ? baslar[i + 1].index : t.length
    const seg = t.slice(bas, son)
    const al = (alan) => seg.match(new RegExp(`${alan}:\\s*'([^']*)'`))?.[1] ?? ''
    const govde = seg.match(/govde:\s*`([\s\S]*?)`,?\s*\n\s*\},?\s*\n\s*\},/)?.[1] ?? seg.match(/govde:\s*`([\s\S]*?)`/)?.[1] ?? ''
    kayitlar.push({
      kimlik: m[1],
      konu: al('konu'),
      yayinTarihi: al('yayinTarihi'),
      guncellemeTarihi: al('guncellemeTarihi'),
      slug: al('slug'),
      urunler: dizgeDizisi(seg, 'urunler'),
      kategoriler: dizgeDizisi(seg, 'ilgiliKategoriler'),
      govde,
      h1: govde.match(/^#\s+(.+)$/m)?.[1] ?? '',
    })
  }
  return kayitlar
}

/** Bir yazının gövdesinde anılan kalemler. kayitKimlikleri verilirse desendeki kimliğin kayıtta olması ZORUNLU (yoksa fırlatır). */
export function mevzuatKalemleri(govde, kayitKimlikleri) {
  const kalemler = []
  const kayitta_yok = []
  // Kaynaklar listesi de taranır: kalem yalnız kaynakçada anılmış olabilir (örn. RG numarası). Desenler özgüldür (numara/kod).
  const taranan = govde
  for (const d of KALEM_DESENLERI) {
    if (!d.desen.test(taranan)) continue
    if (d.kayit === null) kayitta_yok.push(d.ad)
    else {
      if (kayitKimlikleri && !kayitKimlikleri.has(d.kayit)) throw new Error(`desen kimliği kayıtta yok: ${d.kayit}`)
      kalemler.push(d.kayit)
    }
  }
  return { kalemler, kayitta_yok }
}

/** Satırları üretir. dizin: { [kimlik]: { bing, google, yandex, sira } } ya da null (ölçülmedi). */
export function envanterSatirlari(yazilar, kayitKimlikleri, dizin = null) {
  return yazilar.map((y) => {
    const m = mevzuatKalemleri(y.govde, kayitKimlikleri)
    const d = dizin ? dizin[y.kimlik] || null : null
    return {
      kimlik: y.kimlik,
      adres: y.slug ? `/tr/bilgi-merkezi/${y.slug}` : '',
      h1: y.h1,
      konu: y.konu,
      yayinTarihi: y.yayinTarihi,
      guncellemeTarihi: y.guncellemeTarihi,
      mevzuat: m.kalemler,
      mevzuatKayittaYok: m.kayitta_yok,
      urunler: y.urunler.map((u) => u.replace(/^vh:/, '')),
      kategoriler: y.kategoriler.map((u) => u.replace(/^vh:/, '')),
      dizin: dizin === null ? 'ÖLÇÜLMEDİ' : d ? d : 'KAYITSIZ (dizin dosyasında bu yazı yok)',
      durum: 'yayında (yazilar.ts kaydı var)',
    }
  })
}

const hucre = (dizi) => (dizi.length ? dizi.join(', ') : '—')
const dizinMetni = (d) => (typeof d === 'string' ? d : [d.google && `G: ${d.google}`, d.bing && `B: ${d.bing}`, d.yandex && `Y: ${d.yandex}`, d.sira && `sıra: ${d.sira}`].filter(Boolean).join(' · ') || '—')

export function markdownTablo(satirlar) {
  const baslik = '| Yazı | Konu | Yayın / güncelleme | Mevzuat kalemleri (gövdede anılan) | Kayıtta kalemi yok | Ürün ailesi | Kategori | Dizin / sıra | Durum |'
  const ayrac = '|---|---|---|---|---|---|---|---|---|'
  const govde = satirlar.map((s) =>
    `| ${s.kimlik}<br>${s.adres} | ${s.konu} | ${s.yayinTarihi} / ${s.guncellemeTarihi} | ${hucre(s.mevzuat)} | ${hucre(s.mevzuatKayittaYok)} | ${hucre(s.urunler)} | ${hucre(s.kategoriler)} | ${dizinMetni(s.dizin)} | ${s.durum} |`,
  )
  return [baslik, ayrac, ...govde].join('\n') + '\n'
}

export function calistir(argv, kok = KOK) {
  const arg = (ad) => {
    const i = argv.indexOf(ad)
    return i === -1 ? null : argv[i + 1]
  }
  const kaynak = readFileSync(join(kok, 'src/data/bilgiMerkezi/yazilar.ts'), 'utf8')
  const yazilar = yazilariAyristir(kaynak)
  if (yazilar.length === 0) throw new Error('yazilar.ts içinde yazı kaydı ayrıştırılamadı (biçim değişmiş olabilir)')
  const kayit = JSON.parse(readFileSync(join(kok, 'docs/mevzuat/kayit.json'), 'utf8'))
  const kimlikler = new Set(kayit.kalemler.map((k) => k.kimlik))
  const dizinYolu = arg('--dizin')
  const dizin = dizinYolu ? JSON.parse(readFileSync(dizinYolu, 'utf8')) : null
  const satirlar = envanterSatirlari(yazilar, kimlikler, dizin)
  const cikti = argv.includes('--json') ? `${JSON.stringify(satirlar, null, 1)}\n` : markdownTablo(satirlar)
  const yaz = arg('--yaz')
  if (yaz) writeFileSync(yaz, cikti, 'utf8')
  else process.stdout.write(cikti)
  return 0
}

if (process.argv[1] && import.meta.url === pathToFileURL(process.argv[1]).href) {
  try {
    process.exitCode = calistir(process.argv.slice(2))
  } catch (e) {
    console.error(`yazi-envanteri.mjs: ${e.message}`)
    process.exitCode = 1
  }
}
