import { spawnSync } from 'node:child_process'
import fs from 'node:fs'
import os from 'node:os'
import path from 'node:path'

import { afterEach, beforeEach, describe, expect, it } from 'vitest'

/**
 * INV-GUN-KAPANISI-BELGE-1 · gün kapanışı BELGELER defterini her kapanışta tazeler (REC-473, HARİTA sözleşmesi).
 *
 * NİÇİN: belgeler defteri elle yüklenince bayat kalıyordu; BELGE satırı "belgeler defteri N gün" gösterir ama tazeleyen
 * adım kapanışa bağlı değildi. Adım 13 `belge-defteri.cjs yukle` çalıştırır ve `olc` ile taze olduğunu ölçer.
 *
 * SÖZLEŞME (REC-473 yorumu): yukle → 0 tam · 1 oturum/ağ ölçülemedi, hiçbir şey yazılmadı (KIRMIZI) · 2 kısmi (KIRMIZI) ·
 * 3 --kuru; olc → 0 taze · 1 bayat · 2 ölçülemedi. `tara` (LLM) kapanışa BAĞLANMAZ.
 *
 * Betik `scripts/nlm/gun_kapanisi.py` Python'dur; CI'da Python kurulu değilse davranış testleri atlanır, kaynak testleri
 * her yerde koşar. Yerelde ikisi de koşar (sabotaj kanıtı: çıkış kodu eşlemesini bozunca kaynak VE davranış testi kırılır).
 */

const KOK = path.resolve(__dirname, '../../..')
const BETIK = path.join(KOK, 'scripts/nlm/gun_kapanisi.py')
const kaynak = fs.readFileSync(BETIK, 'utf8')

function pythonBul(): string | null {
  for (const ad of ['python', 'python3', 'py']) {
    const r = spawnSync(ad, ['--version'], { encoding: 'utf8' })
    if (r.status === 0) return ad
  }
  return null
}
const PY = pythonBul()

/** adim13 gövdesi (sonraki `def`e kadar). */
function adim13Govde(): string {
  const bas = kaynak.indexOf('def adim13(')
  expect(bas).toBeGreaterThan(-1)
  const son = kaynak.indexOf('\ndef ', bas + 10)
  return kaynak.slice(bas, son === -1 ? undefined : son)
}

describe('INV-GUN-KAPANISI-BELGE-1 · kaynak (Python gerekmez)', () => {
  it('adım 13 tanımlı ve koşum sırasında 12\'den SONRA, state (10) yazımından ÖNCE', () => {
    expect(kaynak).toMatch(/ADIM_ADI = \{[\s\S]*13: "Belgeler defteri/)
    expect(kaynak).toMatch(/KOSUM_SIRASI = \[1, 2, 3, 4, 5, 6, 8, 7, 11, 9, 12, 13, 10\]/)
    expect(kaynak).toMatch(/12: adim12, 13: adim13\}/)
  })

  it('adım 13 belge-defteri.cjs `yukle` çalıştırır, sonucu `olc` ile ölçer; `tara` (LLM) BAĞLANMAZ', () => {
    const g = adim13Govde()
    expect(g).toContain('"yukle"')
    expect(g).toContain('"olc"')
    expect(g).not.toMatch(/"tara"/)
    expect(kaynak).not.toMatch(/belge-defteri\.cjs["'\], ]+"?tara/)
  })

  it('çıkış kodu sözleşmesi: 1, 2, 124 KIRMIZI; kuru yalnız 3 kabul; sıfır dönünce olc sıfır beklenir', () => {
    const g = adim13Govde()
    expect(g).toMatch(/rc == 124/)
    expect(g).toMatch(/rc == 1:/)
    expect(g).toMatch(/rc == 2:/)
    expect(g).toMatch(/rc != 3/)
    expect(g).toMatch(/rc2 != 0/)
    expect(g).toContain('HICBIR SEY yazilmadi')
  })

  it('--kuru bayrağı betiğe iletilir; adım 5 auth KIRMIZI ise ATLANDI (kuru DAHİL, ağa çıkılmaz)', () => {
    const g = adim13Govde()
    expect(g).toContain('"--kuru"')
    expect(g).toMatch(/auth_ok"\) is False:/)
    expect(g).not.toMatch(/auth_ok"\) is False and not c\["kuru"\]/)
    expect(g).toContain('ATLANDI')
  })

  it('betik ya da node yoksa KIRMIZI (ATLANDI sessiz yeşil bırakırdı)', () => {
    const g = adim13Govde()
    expect(g).toMatch(/not node:\s*\n\s*return kirmizi\(/)
    expect(g).toMatch(/not os\.path\.exists\(betik_yolu\):[^\n]*\n\s*return kirmizi\(/)
  })

  it('varsayılan zaman aşımı betiğin kendi bekleme süresinden (900 sn) UZUN', () => {
    const m = /BELGE_ZAMAN = int\(os\.environ\.get\("VENTHUB_BELGE_ZAMAN"\) or (\d+)\)/.exec(kaynak)
    expect(m).not.toBeNull()
    expect(Number(m?.[1])).toBeGreaterThan(900)
  })

  it('anahtar hiçbir çıktıya girmez ve çıktı satırları `temiz` süzgecinden geçer', () => {
    const g = adim13Govde()
    expect(g).not.toMatch(/LINEAR_API_KEY|GSC_SA_ANAHTAR/)
    expect(g).toContain('temiz(')
  })
})

describe.skipIf(!PY)('INV-GUN-KAPANISI-BELGE-1 · davranış (sahte belge-defteri betiği)', () => {
  let dir: string
  let sahte: string
  beforeEach(() => {
    dir = fs.mkdtempSync(path.join(os.tmpdir(), 'gun-kapanisi-belge-'))
    sahte = path.join(dir, 'sahte-belge-defteri.cjs')
    // argv[2] = yukle | olc. Çıkış kodu: olc → FAKE_OLC_RC; yukle --kuru → FAKE_KURU_RC (vars. 3, GERÇEK betik gibi
    // YALNIZ --kuru gelirse); yukle → FAKE_YUKLE_RC. FAKE_UYKU_SN>0 önce uyur (zaman aşımı dalı). Ağa ÇIKMAZ.
    fs.writeFileSync(
      sahte,
      "const k=process.argv[2];const kuru=process.argv.includes('--kuru');" +
        "const u=Number(process.env.FAKE_UYKU_SN||0);if(u>0)Atomics.wait(new Int32Array(new SharedArrayBuffer(4)),0,0,u*1000);" +
        "const rc=k==='olc'?Number(process.env.FAKE_OLC_RC??0):(kuru?Number(process.env.FAKE_KURU_RC??3):Number(process.env.FAKE_YUKLE_RC??0));" +
        "console.log(k==='olc'?'BELGELER DEFTERI: son esitleme 2026-09-30 (0 gun) · 15 kaynak':'sahte '+k+' '+process.argv.slice(3).join(' '));process.exit(rc)",
    )
  })
  afterEach(() => {
    fs.rmSync(dir, { recursive: true, force: true })
  })

  function kos(env: Record<string, string>, ...ek: string[]) {
    const r = spawnSync(PY as string, [BETIK, '--adimlar', '13', '--hedef', dir, ...ek], {
      encoding: 'utf8',
      env: { ...process.env, PYTHONIOENCODING: 'utf-8', VENTHUB_BELGE_DEFTERI_BETIK: sahte, ...env },
    })
    return { kod: r.status, cikti: `${r.stdout}${r.stderr}` }
  }

  it('yukle 0 + olc 0 → YEŞİL, çıkış 0, olc satırı ölçüm metninde', () => {
    const r = kos({ FAKE_YUKLE_RC: '0', FAKE_OLC_RC: '0' })
    expect(r.kod).toBe(0)
    expect(r.cikti).toContain('YESIL')
    expect(r.cikti).toContain('yukle: tam')
    expect(r.cikti).toContain('15 kaynak')
  })

  it('yukle 1 (oturum/ağ ölçülemedi) → KIRMIZI, çıkış 3', () => {
    const r = kos({ FAKE_YUKLE_RC: '1' })
    expect(r.kod).toBe(3)
    expect(r.cikti).toContain('KIRMIZI')
    expect(r.cikti).toContain('HICBIR SEY yazilmadi')
  })

  it('yukle 2 (kısmi) → KIRMIZI, çıkış 3, eskiler korunur notu', () => {
    const r = kos({ FAKE_YUKLE_RC: '2' })
    expect(r.kod).toBe(3)
    expect(r.cikti).toContain('KISMI')
    expect(r.cikti).toContain('eski kaynaklar korundu')
  })

  it('yukle 0 ama olc 1 (bayat) → KIRMIZI: "yüklendi" demek taze demek DEĞİLDİR', () => {
    const r = kos({ FAKE_YUKLE_RC: '0', FAKE_OLC_RC: '1' })
    expect(r.kod).toBe(3)
    expect(r.cikti).toContain('olc cikis 1')
  })

  it('beklenmeyen çıkış kodu (7) KIRMIZI', () => {
    const r = kos({ FAKE_YUKLE_RC: '7' })
    expect(r.kod).toBe(3)
    expect(r.cikti).toContain('beklenmeyen cikis 7')
  })

  it('--kuru: kod bayrağı İLETİRSE sahte betik 3 döner → YEŞİL (iletmezse canlı 0 döner → KIRMIZI: regresyonu yakalar)', () => {
    const iyi = kos({}, '--kuru')
    expect(iyi.kod).toBe(0)
    expect(iyi.cikti).toContain('YUKLENMEDI')
  })

  it('--kuru ama betik 3 dönmezse KIRMIZI', () => {
    const kotu = kos({ FAKE_KURU_RC: '0' }, '--kuru')
    expect(kotu.kod).toBe(3)
    expect(kotu.cikti).toContain('beklenen cikis 3')
  })

  it('olc çıkış 2 (ölçülemedi) yukle 0 olsa da KIRMIZI', () => {
    const r = kos({ FAKE_YUKLE_RC: '0', FAKE_OLC_RC: '2' })
    expect(r.kod).toBe(3)
    expect(r.cikti).toContain('olc cikis 2')
  })

  it('zaman aşımı (124) KIRMIZI: betik uyur, sınır 1 sn', () => {
    const r = kos({ FAKE_UYKU_SN: '5', VENTHUB_BELGE_ZAMAN: '1' })
    expect(r.kod).toBe(3)
    expect(r.cikti).toContain('zaman asimi')
  })

  it('betik dosyası yoksa KIRMIZI (sessiz yeşil değil), çıkış 3', () => {
    const r = kos({ VENTHUB_BELGE_DEFTERI_BETIK: path.join(dir, 'yok.cjs') })
    expect(r.kod).toBe(3)
    expect(r.cikti).toContain('belge-defteri.cjs yok')
  })
})
