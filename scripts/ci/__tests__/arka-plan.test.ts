// @vitest-environment node
import { execFileSync, spawnSync } from 'node:child_process'
import { existsSync, mkdirSync, mkdtempSync, readFileSync, rmSync, writeFileSync } from 'node:fs'
import os from 'node:os'
import path from 'node:path'

import { describe, expect, it } from 'vitest'

/**
 * INV-E2E-HIZLI-4 · `scripts/ci/arka-plan.sh` GERÇEK bash ile koşar (ALT-38f).
 *
 * NİÇİN VAR: `admin-smoke` işinde `playwright install-deps` bu betikle Build'e PARALEL arka planda koşar. Betiğin üç sözü vardır ve üçü de sessizce
 * bozulabilir: (1) `baslat` HEMEN döner ve adımın çıktı borusunu TUTMAZ (tutarsa runner adımı komut bitene kadar bitmiş saymaz: paralellik kaybolur),
 * (2) `bekle` komutun çıkış kodunu AYNEN taşır, süre dolarsa 124, hiç başlatılmamışsa 125 verir, (3) arka plan işlemi sonuç yazmadan ölürse komutu
 * ÖN PLANDA yeniden koşar (mekanizma bozulsa bile iş eski sıralı davranışına düşer). Bu dosya üçünü de GERÇEK süreçlerle ölçer ve her söz için
 * bilerek bozulmuş bir betik kopyasının kırmızı verdiğini kanıtlar (sabotaj). bash yoksa (ör. Git Bash'siz Windows) atlanır; CI'da (ubuntu) her zaman koşar.
 */

const KOK = path.resolve(__dirname, '../../..')
const GERCEK_BETIK = path.join(KOK, 'scripts/ci/arka-plan.sh')
const ileri = (p: string): string => p.replace(/\\/g, '/')

/** Windows'ta yalnız Git for Windows'un bash'i kabul edilir (PATH'teki `bash` WSL olabilir: yollar uyuşmaz). */
function bashBul(): string | null {
  const adaylar = process.platform === 'win32' ? ['C:/Program Files/Git/bin/bash.exe'] : ['bash']
  for (const aday of adaylar) {
    try {
      if (path.isAbsolute(aday) && !existsSync(aday)) continue
      execFileSync(aday, ['-c', 'exit 0'], { stdio: 'ignore' })
      return aday
    } catch {
      /* sonraki aday */
    }
  }
  return null
}
const BASH = bashBul()

interface Sonuc {
  status: number
  stdout: string
  stderr: string
  ms: number
}

/** Betiği verilen durum dizini ve ek ortamla koşar. `ZAMAN`: takılırsa test askıda kalmasın. */
function kos(betik: string, dizin: string, args: string[], ekEnv: Record<string, string> = {}): Sonuc {
  const t0 = Date.now()
  const s = spawnSync(BASH as string, [ileri(betik), ...args], {
    encoding: 'utf8',
    timeout: 60_000,
    env: { ...process.env, ARKA_PLAN_DIZIN: ileri(dizin), MSYS_NO_PATHCONV: '1', ...ekEnv },
  })
  return { status: s.status ?? -1, stdout: s.stdout ?? '', stderr: s.stderr ?? '', ms: Date.now() - t0 }
}

const gecici = (onek: string): string => mkdtempSync(path.join(os.tmpdir(), `vh-arka-${onek}-`))
const temizle = (...dizinler: string[]): void => {
  for (const d of dizinler) rmSync(d, { recursive: true, force: true })
}
const bekleMs = (ms: number): Promise<void> => new Promise((r) => setTimeout(r, ms))

type Kontrol = (betik: string) => Promise<string | null>

// ── KONTROLLER: her biri bir SÖZÜ ölçer; null = söz tutuldu, metin = ihlal ───────────────────────────────────────────────

/** SÖZ 1 · `baslat` komut bitmeden döner ve çıktı borusunu tutmaz; `bekle` sonra sonucu toplar. */
const hemenDoner: Kontrol = async (betik) => {
  const d = gecici('hemen')
  try {
    const b = kos(betik, d, ['baslat', 'h', '--', 'bash', '-c', 'sleep 2; echo bitti-h'])
    if (b.status !== 0) return `baslat çıkış kodu ${b.status}`
    if (b.ms >= 1500) return `baslat ${b.ms} ms sürdü: komut bitene kadar döndü ya da çıktı borusunu tuttu (paralellik yok)`
    const w = kos(betik, d, ['bekle', 'h', '30'])
    if (w.status !== 0 || !w.stdout.includes('bitti-h')) return `bekle başarısız ya da günlük yok (çıkış ${w.status})`
    return null
  } finally {
    temizle(d)
  }
}

/** SÖZ 2a · komutun çıkış kodu AYNEN taşınır ve günlük yazdırılır. */
const cikisKodu: Kontrol = async (betik) => {
  const d = gecici('kod')
  try {
    kos(betik, d, ['baslat', 'k', '--', 'bash', '-c', 'echo "a b"; exit 7'])
    const w = kos(betik, d, ['bekle', 'k', '30'])
    if (w.status !== 7) return `bekle çıkış kodu ${w.status}, beklenen 7 (komutun kodu kayboldu: başarısız apt yeşil görünür)`
    if (!w.stdout.includes('a b')) return 'günlük yazdırılmadı'
    return null
  } finally {
    temizle(d)
  }
}

/** SÖZ 2b · süre dolarsa 124 (komut ÖLDÜRÜLMEZ), hiç başlatılmamışsa 125, geçersiz kullanımda 2. */
const sureVeHatalar: Kontrol = async (betik) => {
  const d = gecici('sure')
  try {
    kos(betik, d, ['baslat', 's', '--', 'bash', '-c', 'sleep 4'])
    const w = kos(betik, d, ['bekle', 's', '1'])
    if (w.status !== 124) return `süre dolunca çıkış ${w.status}, beklenen 124`
    if (w.ms >= 3500) return `süre aşımı ${w.ms} ms sonra döndü: komutun bitmesi beklendi`
    if (!w.stdout.includes('::warning')) return 'süre aşımında uyarı yok'
    const yok = kos(betik, d, ['bekle', 'hic-baslamadi', '5'])
    if (yok.status !== 125) return `hiç başlatılmamış iş için çıkış ${yok.status}, beklenen 125`
    const kotu = kos(betik, d, ['bekle', 'Kotu/Ad', '5'])
    if (kotu.status !== 2) return `geçersiz ad için çıkış ${kotu.status}, beklenen 2`
    return null
  } finally {
    temizle(d)
  }
}

/** SÖZ 3 · arka plan işlemi sonuç yazmadan ÖLDÜRÜLÜRSE komut kabuk-güvenli alıntıyla ÖN PLANDA yeniden koşar. */
const oluYedek: Kontrol = async (betik) => {
  const d = gecici('olu')
  try {
    const isaret = ileri(path.join(d, 'isaret'))
    const komut = `if [ -e "${isaret}" ]; then printf '%s|' "$@"; echo; echo "RTEMIZLE=$RETRY_APT_TEMIZLE"; exit 4; else : > "${isaret}"; sleep 5; fi`
    kos(betik, d, ['baslat', 'o', '--', 'bash', '-c', komut, '_', 'a b', 'c"d', '$HOME'])
    for (let i = 0; i < 50 && !existsSync(path.join(d, 'isaret')); i++) await bekleMs(100)
    if (!existsSync(path.join(d, 'isaret'))) return 'arka plan komutu hiç başlamadı'
    const pid = readFileSync(path.join(d, 'o.pid'), 'utf8').trim()
    spawnSync(BASH as string, ['-c', `kill -9 ${pid}`], { env: { ...process.env, MSYS_NO_PATHCONV: '1' } })
    await bekleMs(200)
    const w = kos(betik, d, ['bekle', 'o', '30'], { RETRY_APT_TEMIZLE: '1' })
    if (w.status !== 4) return `öldürülen iş için çıkış ${w.status}, beklenen 4 (yedek ön plan koşusu yapılmadı ya da kodu kayboldu)`
    if (!w.stdout.includes('a b|c"d|$HOME|')) return 'yedek koşuda argümanlar kabuk-güvenli korunmadı'
    if (!w.stdout.includes('RTEMIZLE=1')) return 'yedek koşu bekle adımının ortamını miras almadı'
    if (!w.stdout.includes('::warning')) return 'yedek koşuya geçilirken uyarı verilmedi (sessiz düşüş)'
    return null
  } finally {
    temizle(d)
  }
}

/** SÖZ 4 · aynı ad ikinci kez başlatılınca ESKİ sonuç yeni koşuya karışmaz. */
const eskiSonucKarismaz: Kontrol = async (betik) => {
  const d = gecici('eski')
  try {
    kos(betik, d, ['baslat', 'e', '--', 'bash', '-c', 'exit 5'])
    const ilk = kos(betik, d, ['bekle', 'e', '30'])
    if (ilk.status !== 5) return `ilk koşu çıkışı ${ilk.status}, beklenen 5`
    kos(betik, d, ['baslat', 'e', '--', 'bash', '-c', 'sleep 1; exit 0'])
    const ikinci = kos(betik, d, ['bekle', 'e', '30'])
    if (ikinci.status !== 0) return `ikinci koşu çıkışı ${ikinci.status}, beklenen 0 (eski sonuç dosyası yeni koşuya karıştı)`
    return null
  } finally {
    temizle(d)
  }
}

const KONTROLLER: Array<[string, Kontrol]> = [
  ['baslat hemen döner ve çıktı borusunu tutmaz', hemenDoner],
  ['bekle komutun çıkış kodunu aynen taşır ve günlüğü yazdırır', cikisKodu],
  ['bekle: süre dolunca 124, başlatılmamışsa 125, geçersiz adda 2', sureVeHatalar],
  ['öldürülen arka plan işlemi ön planda yeniden koşar (alıntı + ortam korunur, uyarı verir)', oluYedek],
  ['aynı ad yeniden başlatılınca eski sonuç karışmaz', eskiSonucKarismaz],
]

describe.skipIf(BASH === null)('INV-E2E-HIZLI-4 · arka-plan.sh gerçek bash ile', () => {
  it('betik var ve ayrıştırılabilir (boş betik "geçti" sayılmaz)', () => {
    const metin = readFileSync(GERCEK_BETIK, 'utf8')
    expect(metin).toContain('baslat()')
    expect(metin).toContain('bekle()')
    expect(spawnSync(BASH as string, ['-n', ileri(GERCEK_BETIK)], { encoding: 'utf8' }).status).toBe(0)
  })

  it.concurrent.each(KONTROLLER)('GERÇEK betik: %s', async (_ad, kontrol) => {
    expect(await kontrol(GERCEK_BETIK)).toBeNull()
  }, 90_000)

  it('RUNNER_TEMP varsayılan durum dizinidir ve ortam komuta miras kalır (ARKA_PLAN_DIZIN verilmediğinde)', () => {
    const runnerTemp = gecici('rt')
    try {
      const env = { ARKA_PLAN_DIZIN: '', RUNNER_TEMP: ileri(runnerTemp), RETRY_APT_TEMIZLE: '1' }
      const b = spawnSync(BASH as string, [ileri(GERCEK_BETIK), 'baslat', 'rt', '--', 'bash', '-c', 'echo "TEMIZLE=$RETRY_APT_TEMIZLE"'], { encoding: 'utf8', env: { ...process.env, ...env, MSYS_NO_PATHCONV: '1' } })
      expect(b.status).toBe(0)
      const w = spawnSync(BASH as string, [ileri(GERCEK_BETIK), 'bekle', 'rt', '30'], { encoding: 'utf8', env: { ...process.env, ...env, MSYS_NO_PATHCONV: '1' } })
      expect(w.status).toBe(0)
      expect(readFileSync(path.join(runnerTemp, 'arka-plan', 'rt.log'), 'utf8')).toContain('TEMIZLE=1')
    } finally {
      temizle(runnerTemp)
    }
  }, 60_000)

  // ── SABOTAJ: bilerek bozulmuş betik kopyası ilgili sözü İHLAL ETMELİ ────────────────────────────────────────────────
  const MUTANTLAR: Array<{ ad: string; boz: (m: string) => string; kontrol: Kontrol; beklenen: string }> = [
    {
      ad: 'arka plan alt kabuğu adımın çıktı borusunu miras alır (runner adımı bitmiş saymaz)',
      boz: (m) => m.replace(') > /dev/null 2>&1 < /dev/null &', ') &'),
      kontrol: hemenDoner,
      beklenen: 'çıktı borusunu tuttu',
    },
    {
      ad: 'komut ön planda koşar (başlat bloklar, Build bekler)',
      boz: (m) => m.replace(') > /dev/null 2>&1 < /dev/null &\n', ') > /dev/null 2>&1 < /dev/null\n'),
      kontrol: hemenDoner,
      beklenen: 'baslat',
    },
    {
      ad: 'çıkış kodu taşınmaz (başarısız apt yeşil görünür)',
      boz: (m) => m.replaceAll('return "$kod"', 'return 0'),
      kontrol: cikisKodu,
      beklenen: 'komutun kodu kayboldu',
    },
    {
      ad: 'süre sınırı yok sayılır (bekle komut bitene kadar bekler: takılma kuyruğu geri gelir)',
      boz: (m) => m.replace('if [ "$(date +%s)" -ge "$son" ]; then', 'if false; then'),
      kontrol: sureVeHatalar,
      beklenen: 'süre dolunca çıkış',
    },
    {
      ad: 'hiç başlatılmamış iş sessizce başarılı sayılır',
      boz: (m) => m.replace('    return 125\n', '    return 0\n'),
      kontrol: sureVeHatalar,
      beklenen: 'beklenen 125',
    },
    {
      ad: 'yedek ön plan koşusu kaldırılır (ölen iş sessizce kaybolur)',
      boz: (m) => m.replace('yedek_kos || yedek_kodu=$?', 'yedek_kodu=125'),
      kontrol: oluYedek,
      beklenen: 'yedek ön plan koşusu yapılmadı',
    },
    {
      ad: 'yedek koşu komutu kabuk-güvenli alıntı olmadan saklar (boşluklu argüman bölünür)',
      boz: (m) => m.replace("printf '%q ' \"$@\"", "printf '%s ' \"$@\""),
      kontrol: oluYedek,
      beklenen: 'beklenen 4',
    },
    {
      ad: 'eski sonuç dosyası temizlenmez (aynı ad yeniden başlatılınca bayat kod okunur)',
      boz: (m) => m.replace('  rm -f "$ONEK.komut" "$ONEK.baslangic" "$ONEK.pid" "$ONEK.log" "$ONEK.cikis" "$ONEK.cikis.tmp"\n', ''),
      kontrol: eskiSonucKarismaz,
      beklenen: 'eski sonuç dosyası yeni koşuya karıştı',
    },
  ]

  it.concurrent.each(MUTANTLAR)('⛔SABOTAJ betik: $ad', async ({ boz, kontrol, beklenen }) => {
    const asil = readFileSync(GERCEK_BETIK, 'utf8')
    const bozuk = boz(asil)
    expect(bozuk, 'bozucu hiçbir şeyi değiştirmedi (çapa kayıp)').not.toBe(asil)
    const d = gecici('mutant')
    try {
      const yol = path.join(d, 'arka-plan.sh')
      mkdirSync(d, { recursive: true })
      writeFileSync(yol, bozuk)
      const sonuc = await kontrol(yol)
      expect(sonuc, 'sabotaj kontrolü geçti: kontrol bu bozulmayı ÖLÇMÜYOR').not.toBeNull()
      expect(sonuc).toContain(beklenen)
    } finally {
      temizle(d)
    }
  }, 90_000)
})
