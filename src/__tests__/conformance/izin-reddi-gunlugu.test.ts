import { execFileSync, spawnSync } from 'node:child_process'
import { createRequire } from 'node:module'

import { describe, expect, it, vi } from 'vitest'

/**
 * AĞIR-SINIF ZAMAN AŞIMI EŞİĞİ — 60 sn (global 20 sn). Gerekçe: fleet-mechanism §13.
 * Bu dosya fikstür transkriptleri yazar ve 7+ alt süreç doğurur.
 */
vi.setConfig({ testTimeout: 60_000 })

/**
 * INV-BOARD-10 · İzin-reddi günlüğü — DOĞRU SINIFI sayar, insan kararını ANOMALİ SAYMAZ.
 *
 * NİÇİN VAR (ölçülmüş boşluk, 2026-08-31): bir sabahta üç *normalde serbest* eylem
 * reddedildi (`CronCreate`, `gh pr merge`, `npx vitest`) ve aynı komut ikinci denemede
 * geçti. Bu sınıf yalnız o şeridin transkriptinde yaşıyordu; filo genelinde kimse
 * ölçmüyordu ve dalgalı ret bir şeridi SESSİZCE durdurdu (mekanizmanın cron ayağı
 * kurulmadan kaldı).
 *
 * ⭐İLK ÖLÇÜT YANLIŞ EVRENİ ÖLÇTÜ — bu testin varlık sebebi de o: metin taraması
 * (`Permission to use ... has been denied`) 109 kayıt buldu ve HEPSİ `Bash`ti; aranan
 * `CronCreate` reddini hiç görmüyordu, çünkü o sınıfın metni farklı. Metin ölçütüyle
 * kurulan bir günlük **kör kapı** olurdu: sayı üretir, sınıfı kaçırır.
 * Doğru ölçüt YAPISAL: `toolDenialKind` alanı.
 *
 * ⚠ DÖRT TÜRÜ AYIRMAK BU KAPININ ASIL İŞİ. `user-rejected` = İNSAN reddetti; bu bir
 * KARAR, arıza değil. Anomali sayısına katılırsa günlük her gün ötmeye başlar ve
 * "gürültü kapıyı körleştirir" sınıfına düşer (fleet-mechanism §15'in aynısı).
 */

const require = createRequire(import.meta.url)
const BETIK = require.resolve('../../../scripts/board/izin-reddi-gunlugu.cjs')

function tmpRoot(): string {
  const raw =
    process.env.RUNNER_TEMP || process.env.TMPDIR || process.env.TEMP || process.env.TMP || '/tmp'
  return raw.replace(/\\/g, '/').replace(/\/$/, '')
}

let sayac = 0
function dizin(onek: string): string {
  sayac += 1
  return `${tmpRoot()}/${onek}-${Date.now()}-${Math.random().toString(36).slice(2)}-${sayac}`
}

/** `node:fs` KULLANILMIYOR (board-invariants.test.ts ortam notu) — çocuk süreç yazar. */
function dosyaYaz(yol: string, icerik: string): void {
  execFileSync(process.execPath, [
    '-e',
    'const fs=require("fs"),p=require("path");fs.mkdirSync(p.dirname(process.argv[1]),{recursive:true});fs.writeFileSync(process.argv[1],process.argv[2])',
    yol,
    icerik,
  ])
}

const GUN = '2026-08-31'

/** Bir assistant `tool_use` kaydı + ona bağlı bir ret kaydı üretir. */
function ciftSatir(uuid: string, arac: string, komut: string, tur: string, saat: string): string {
  const cagri = {
    type: 'assistant',
    uuid,
    timestamp: `${GUN}T${saat}.000Z`,
    message: { role: 'assistant', content: [{ type: 'tool_use', name: arac, input: { command: komut } }] },
  }
  const ret = {
    type: 'user',
    uuid: uuid + '-ret',
    timestamp: `${GUN}T${saat}.500Z`,
    toolDenialKind: tur,
    sourceToolAssistantUUID: uuid,
    message: { role: 'user', content: [{ type: 'tool_result', content: 'denied', is_error: true }] },
  }
  return JSON.stringify(cagri) + '\n' + JSON.stringify(ret) + '\n'
}

interface Kosum { kod: number; out: string; err: string }

function kos(transkriptDir: string, args: string[], panoDir?: string): Kosum {
  const env = { ...process.env, VENTHUB_TRANSKRIPT_DIR: transkriptDir } as NodeJS.ProcessEnv
  if (panoDir) env.VENTHUB_BOARD_DIR = panoDir
  const r = spawnSync(process.execPath, [BETIK, ...args], { encoding: 'utf8', env })
  return { kod: typeof r.status === 'number' ? r.status : -1, out: r.stdout ?? '', err: r.stderr ?? '' }
}

describe('INV-BOARD-10 · izin-reddi gunlugu dogru sinifi sayar', () => {
  it('ON KOSUL: betik kosuyor ve yardim basiyor (olculemedi != gecti)', () => {
    const r = kos(dizin('bos-transkript'), ['yardim'])
    expect(r.kod).toBe(0)
    expect(r.out).toMatch(/kullanim/)
  })

  it('⭐ARAC ADI sourceToolAssistantUUID uzerinden COZULUR (ret kaydinda YOK)', () => {
    const d = dizin('t-arac')
    dosyaYaz(
      `${d}/aaaaaaaa-1111-2222-3333-444444444444.jsonl`,
      ciftSatir('u1', 'CronCreate', '9,29,49 * * * *', 'automode-blocked', '07:10:00') +
        ciftSatir('u2', 'Bash', 'gh pr merge 909', 'automode-blocked', '07:12:00'),
    )
    const r = kos(d, ['olc', '--gun', GUN])
    expect(r.kod, r.err).toBe(0)
    expect(r.out, 'arac adi cozulemedi — OPS un istedigi en eyleme donuk kolon bos kalir').toMatch(
      /CronCreate:1/,
    )
    expect(r.out).toMatch(/Bash:1/)
  })

  it('⭐user-rejected ANOMALI SAYILMAZ — insan karari ariza degildir', () => {
    const d = dizin('t-insan')
    dosyaYaz(
      `${d}/bbbbbbbb-1111-2222-3333-444444444444.jsonl`,
      ciftSatir('r1', 'Bash', 'rm -rf x', 'user-rejected', '08:00:00') +
        ciftSatir('r2', 'Edit', 'y', 'user-rejected', '08:01:00'),
    )
    const r = kos(d, ['olc', '--gun', GUN])
    expect(r.kod).toBe(0)
    expect(r.out, 'toplam 2 ret gorunmeli').toMatch(/toplam 2 ret/)
    expect(
      r.out,
      'insan karari ANOMALI sayildi — gunluk her gun oter ve gurultu kapiyi korlestirir (§15)',
    ).toMatch(/ANOMALI ADAYI 0/)
  })

  it('permission-rule de ANOMALI SAYILMAZ (yazili kural, beklenen davranis)', () => {
    const d = dizin('t-kural')
    dosyaYaz(
      `${d}/cccccccc-1111-2222-3333-444444444444.jsonl`,
      ciftSatir('k1', 'Bash', 'curl x', 'permission-rule', '09:00:00'),
    )
    const r = kos(d, ['olc', '--gun', GUN])
    expect(r.out).toMatch(/ANOMALI ADAYI 0/)
  })

  it('TEKRAR heuristigi: ayni oturum+arac 10 dk icinde 2 ret ISARETLENIR', () => {
    const d = dizin('t-tekrar')
    dosyaYaz(
      `${d}/dddddddd-1111-2222-3333-444444444444.jsonl`,
      ciftSatir('x1', 'Bash', 'npx vitest run a', 'automode-blocked', '10:00:00') +
        ciftSatir('x2', 'Bash', 'npx vitest run a', 'automode-blocked', '10:03:00'),
    )
    const r = kos(d, ['olc', '--gun', GUN])
    expect(r.out).toMatch(/TEKRAR/)
    // "Sonra gecti" BU KAYNAKTAN bilinemez — cikti bunu IDDIA ETMEMELI.
    expect(r.out, 'gunluk kaynagin soylemedigi bir seyi soyluyor').toMatch(/bilinemez/)
  })

  it('⭐--tum BAYRAGI: gun suzgeci ACIKCA kaldirilir ("--gun \'\'" sessizce bugune dusuyordu)', () => {
    const d = dizin('t-tum')
    // GECEN gune ait kayit: gun suzgeci acikken GORUNMEZ, --tum ile GORUNUR.
    const eski = ciftSatir('e1', 'Bash', 'eski', 'automode-blocked', '11:00:00').replace(
      new RegExp(GUN, 'g'),
      '2026-08-20',
    )
    dosyaYaz(`${d}/eeeeeeee-1111-2222-3333-444444444444.jsonl`, eski)

    const bugun = kos(d, ['olc', '--gun', GUN])
    expect(bugun.out, 'gun suzgeci calismiyor — gecmis kayit bugune sizdi').toMatch(/toplam 0 ret/)

    const tum = kos(d, ['olc', '--tum'])
    expect(tum.out, '--tum gun suzgecini kaldirmadi — kullanici gecmis sanip BUGUNU olcer').toMatch(
      /toplam 1 ret/,
    )
  })

  it('bildir KIMLIKSIZ kosmaz (panoya yazan fiil, fail-closed)', () => {
    const d = dizin('t-kimlik')
    dosyaYaz(
      `${d}/ffffffff-1111-2222-3333-444444444444.jsonl`,
      ciftSatir('z1', 'Bash', 'x', 'automode-blocked', '12:00:00'),
    )
    const ciftler = Object.entries(process.env).filter(([a]) => a !== 'CLAUDE_SESSION_ID' && a !== 'CLAUDE_CODE_SESSION_ID')
    ciftler.push(['VENTHUB_TRANSKRIPT_DIR', d])
    const env = Object.fromEntries(ciftler) as NodeJS.ProcessEnv
    const r = spawnSync(process.execPath, [BETIK, 'bildir', '--gun', GUN], { encoding: 'utf8', env })

    expect(r.status, 'kimliksiz yazma GECTI — pano kaydi yanlis/hayalet sahibe baglanir').toBe(1)
    expect(r.stderr).toMatch(/--sid zorunlu/)
  })

  it('bildir ESIK ALTINDA panoya YAZMAZ (gurultu uretmez)', () => {
    const d = dizin('t-esik')
    const pano = dizin('t-esik-pano')
    dosyaYaz(
      `${d}/99999999-1111-2222-3333-444444444444.jsonl`,
      ciftSatir('q1', 'Bash', 'x', 'user-rejected', '13:00:00'),
    )
    const r = kos(d, ['bildir', '--sid', 'sinav-sid', '--gun', GUN, '--esik', '1'], pano)
    expect(r.kod).toBe(0)
    expect(r.out, 'esik asilmadigi halde pano notu yazildi').toMatch(/YAZILMADI/)
  })
})
