// @vitest-environment node
import { spawnSync } from 'node:child_process'
import fs from 'node:fs'
import os from 'node:os'
import path from 'node:path'

import { describe, expect, it } from 'vitest'

/**
 * INV-GOZCU-OZ-ELEME-1 — gözcü, KENDİ sid'inin yazdığı notu kendine bildirmez.
 *
 * NİÇİN VAR — ve bu kapı bir ONARIM DEĞİL, ayakta duran bir garantinin KİLİDİ:
 *
 * #1100 (REC-192) bağımsız probda jetonun ATANIN EKRANINA basılmasını kaldırdı. Gerekçesi
 * şuydu: *"değer atanın ekranındaysa atan onu hedefe iletebilir ve kapı bunu BAĞIMSIZ TANIK
 * sanar."* Bağımsız tanıklığın tüm dayanağı, jetonun **yalnızca hedefin bildiriminde**
 * görülebilmesi.
 *
 * 2026-09-07 22:2xZ'de bu garantinin DELİK olduğunu rapor ettim ve YANILDIM: bir prob attım,
 * ~30 saniye sonra kendi gözcü bildirimimde bir prob jetonu gördüm ve "benimki" sandım. Aynı
 * dakikalarda aynı hedefe başka şeritler de prob atıyordu; gördüğüm jeton başkasınındı. Atfı
 * kimliğe değil ZAMANLAMAYA bakarak yaptım. Ölçünce çıkan gerçek şu:
 *
 *   `scripts/board/gozcu.cjs` → `if (o.sid && String(o.sid).startsWith(kisaSid)) continue`
 *
 * Gözcü kendi notunu **dosya adına bakmadan** eliyor (`d.includes(kisaSid)` atlaması ikinci
 * savunma, tek savunma değil). Prob notu `MEKANIZMA-PROBU` takma şeridiyle ORTAK bir dosyaya
 * yazılır — dosya adı atlaması onu kapsamaz, ama sid elemesi kapsar.
 *
 * ⭐O HÂLDE NİÇİN KAPI: garanti **yazılıydı ama ölçülmüyordu**. O tek satır bir gün "gürültü
 * elemesi" sanılıp silinirse delik GERÇEKTEN açılır ve bugün hiçbir kapı bunu görmez —
 * #1100'ün bütün gerekçesi sessizce çürür. Bu dosya tam o satırı kilitler.
 *
 * ⭐DAVRANIŞ ÖLÇÜLÜR, METİN TARANMAZ: gözcü izole bir pano dizininde GERÇEKTEN koşulur ve
 * stdout'u okunur. Kaynakta satırı arayan bir kol, satır dururken çalışmayan bir hâli yeşil
 * geçirirdi.
 */

const KOK = process.cwd()
const GOZCU = path.join(KOK, 'scripts', 'board', 'gozcu.cjs')

const ATAN = '11111111-1111-4111-8111-111111111111'
const HEDEF = '22222222-2222-4222-8222-222222222222'
const JETON = 'PROB-2222-ZQ7K1M'
const PROB_DOSYA = 'events.mekanizma-probu.jsonl'

/** Gözcüyü tek tarama boyunca koştur ve öldür: `tara()` sonrası setInterval'e girer. */
function gozcuKostur(pano: string, sid: string, betik: string = GOZCU): string {
  const r = spawnSync(process.execPath, [betik, '--sid', sid, '--aralik', '3600'], {
    cwd: KOK,
    env: { ...process.env, VENTHUB_BOARD_DIR: pano },
    encoding: 'utf8',
    // Gözcü `tara()` sonrası setInterval'e girer ve KENDİ KENDİNE ÇIKMAZ; her koşum bu
    // süreyi doldurur. Erken öldürme riski VAR ama YÖNÜ GÜVENLİ: tarama yetişmezse çıktı
    // boşalır ve bu, "atan görmedi" kolunu sahte-yeşile değil, evren sağlığı kolunu
    // KIRMIZIYA götürür (hedef de göremez). Yani yavaş makine sessiz geçmez, gürültü yapar.
    timeout: 6000,
  })
  const cikti = String(r.stdout || '') + String(r.stderr || '')
  // Önkoşul kapısı çıkış 2 ile ölür; onu "not yok" sanmak, ölçememeyi geçmek saymak olurdu.
  expect(cikti, 'gozcu ONKOSUL-HATASI verdi: ' + cikti).not.toContain('GOZCU-ONKOSUL-HATASI')
  return cikti
}

/**
 * İmleç kurulumu ŞART: ilk çalıştırma imleci dosya SONUNA kurar ve geçmişi basmaz. Notu önce
 * yazıp sonra gözcü kurmak "hiçbir şey basılmadı" ile sonuçlanır ve kapı, elemeyi değil
 * imleç davranışını ölçmüş olurdu.
 */
function panoKur(sidler: string[]): string {
  const pano = fs.mkdtempSync(path.join(os.tmpdir(), 'vh-oz-eleme-'))
  fs.writeFileSync(path.join(pano, PROB_DOSYA), '', 'utf8')
  for (const s of sidler) gozcuKostur(pano, s)
  return pano
}

function probYaz(pano: string) {
  const olay = {
    type: 'note',
    ts: new Date().toISOString(),
    sid: ATAN,
    lane: 'MEKANIZMA-PROBU',
    to: HEDEF,
    text:
      'MEKANIZMA PROBU — DIGER SERITLER YOK SAYIN. Jeton: ' + JETON +
      '. Bu not bir gozcunun canli olup olmadigini olcmek icin yazildi; is emri degil.',
  }
  fs.appendFileSync(path.join(pano, PROB_DOSYA), JSON.stringify(olay) + '\n', 'utf8')
}

describe('INV-GOZCU-OZ-ELEME-1: gozcu kendi sid inin notunu kendine bildirmez', () => {
  /**
   * TEK PANO, İKİ GÖZCÜ — evren sağlığı ve iddia AYNI koşumda ölçülür. Ayrı panolarda
   * ölçülseydi "atan görmedi" sonucu, elemeyi değil boş bir panoyu kanıtlayabilirdi.
   */
  it('ATAN kendi probunun jetonunu GORMEZ; ayni panoda HEDEF GORUR', () => {
    const pano = panoKur([ATAN, HEDEF])
    probYaz(pano)

    const hedefCikti = gozcuKostur(pano, HEDEF)
    const atanCikti = gozcuKostur(pano, ATAN)

    // ⛔EVREN SAĞLIĞI ÖNCE: not gerçekten okunabilir durumda mı? Bu kol düşerse aşağıdaki
    // "atan gormedi" iddiasi hicbir sey kanitlamaz (vakumda yesil).
    expect(
      hedefCikti,
      'HEDEF prob notunu GORMEDI — pano/imlec kurulumu bozuk. Bu durumda "atan gormedi" ' +
        'sonucu elemeyi degil BOS EVRENI olcer.',
    ).toContain(JETON)

    expect(
      atanCikti,
      'ATAN kendi probunun JETONUNU GORDU: #1100 in bagimsiz taniklik gerekcesi coker — ' +
        'atan jetonu hedefe iletebilir ve kapi bunu bagimsiz taniklik sanar.',
    ).not.toContain(JETON)

    fs.rmSync(pano, { recursive: true, force: true })
  }, 60_000)

  /**
   * ⭐SABOTAJ TESTİN İÇİNDE: `gozcu.cjs`'in bir KOPYASINDAN sid eleme satırı çıkarılır ve
   * kopya koşulur. Böylece kolun "duyarlı olduğu" iddiası ölçülür, beyan edilmez.
   * ⛔Sabotajın UYGULANDIĞI ayrıca doğrulanır — bugün iki kez etkisiz sabotajın yeşiline
   * yakalandım; uygulanmamış sabotajın yeşili, kapının geçtiği anlamına gelmez.
   */
  it('SABOTAJ: sid elemesi cikarilirsa ATAN jetonu GORUR (kol duyarli)', () => {
    const kaynak = fs.readFileSync(GOZCU, 'utf8')
    const ELEME = /^.*o\.sid.*startsWith\(kisaSid\).*continue.*$\r?\n/m

    expect(
      ELEME.test(kaynak),
      'sid eleme satiri gozcu.cjs te BULUNAMADI. Ya satir degisti ya kaldirildi; ' +
        'ikinci hal INV-GOZCU-OZ-ELEME-1 in korudugu deligin ta kendisidir.',
    ).toBe(true)

    const sabote = kaynak.replace(ELEME, '')
    // SABOTAJ UYGULANDI MI: uzunluk degismeli ve satir gitmis olmali.
    expect(sabote.length, 'sabotaj UYGULANMADI — kaynak degismedi').toBeLessThan(kaynak.length)
    expect(ELEME.test(sabote), 'sabotaj UYGULANMADI — satir hala duruyor').toBe(false)

    const pano = panoKur([ATAN])
    const saboteYol = path.join(pano, 'gozcu-sabote.cjs')
    fs.writeFileSync(saboteYol, sabote, 'utf8')
    probYaz(pano)

    const atanCikti = gozcuKostur(pano, ATAN, saboteYol)
    expect(
      atanCikti,
      'sid elemesi CIKARILDIGI HALDE atan jetonu gormedi — demek ki ustteki kol o satiri ' +
        'degil baska bir seyi olcuyor ve INV-GOZCU-OZ-ELEME-1 sahte guven veriyor.',
    ).toContain(JETON)

    fs.rmSync(pano, { recursive: true, force: true })
  }, 60_000)
})
