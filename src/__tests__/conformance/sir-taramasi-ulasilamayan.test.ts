import { spawnSync } from 'node:child_process'
import { createHash } from 'node:crypto'
import fs from 'node:fs'
import os from 'node:os'
import path from 'node:path'

import { afterAll, describe, expect, it } from 'vitest'

/**
 * INV-SIR-TARAMA-1 · Geçmiş sır taraması, hiçbir daldan erişilemeyen (dangling) commit'leri de görsün ve
 * kapatılmış (döndürülmüş) bulguyu uyarı saymasın, YENİ değeri ise kırmızı saysın (ALT-102, ALT-103).
 *
 * Cetvel: yok — yazımı bu işin kapsamında; yöntem `docs/audits/secret-exposure-audit-2026-08-15.md` (tekrar
 *         yordamı) ve `scripts/security/secret-scan.py` başlık yorumu. Kapatma listesi:
 *         `scripts/security/secret-scan-kapatildi.json`.
 *
 * NE ÖLÇER (geçici git deposunda, gerçek betik, gerçek git):
 *   1. Yalnız reflog'da kalan commit'teki değer varsayılan taramada GÖRÜNMEZ (`--all` bunu görmez) — kör noktanın kanıtı.
 *   2. `--ulasilamayan` o değeri bulur → çıkış 1, "ACIK".
 *   3. Konsola ve rapora DEĞER yazılmaz (yalnız sha256 öneki); `--tam-deger` yalnız rapora yazar.
 *   4. Kapatma listesindeki (imza + parmak izi) bulgu uyarı üretmez (çıkış 0); aynı parmak izi başka imza adıyla
 *      kapatılmış SAYILMAZ; listede olmayan YENİ değer yine kırmızıdır.
 *   5. Bozuk kapatma listesi çıkış 2 verir (sessizce yeşil/kırmızı olmaz).
 *   6. Postgres bağlantı dizesi ve SUPABASE_DB_PASSWORD ataması imzaları gerçek değeri yakalar, yer tutucuyu
 *      (`${{ secrets.X }}`) yakalamaz.
 *   7. Depodaki gerçek kapatma listesi biçimce sağlam: değer taşımaz, her imza betikte tanımlı.
 *
 * SABOTAJ: betikte `if (ad, k) not in kapatilmis` koşulunu kaldırınca (4) ve (2) kırmızı olur; `--no-reflogs`
 * bayrağını silince (2) kırmızı olur.
 */

const KOK = process.cwd()
const BETIK = path.join(KOK, 'scripts', 'security', 'secret-scan.py')
const KAPATMA_LISTESI = path.join(KOK, 'scripts', 'security', 'secret-scan-kapatildi.json')

function pythonBul(): string {
  for (const aday of ['python3', 'python']) {
    const r = spawnSync(aday, ['--version'], { encoding: 'utf8' })
    if (r.status === 0) return aday
  }
  throw new Error('python bulunamadı: betik python3 ya da python ister')
}
const PY = pythonBul()

// Rastgele görünen ama sabit değerler: depoda gerçek bir sır gibi durmaz, test süresince üretilir.
// Onaltılık (0-9a-f): imza regex'lerinin karakter sınıflarına tam oturur ve gürültü süzgecindeki sözcüklerden
// ('test', 'mock', ...) hiçbirini içeremez.
function uret(tohum: string, uzunluk: number): string {
  return createHash('sha256').update(tohum).digest('hex').slice(0, uzunluk)
}
const DEGER_A = 'sbp_' + uret('alt103-a', 40)
const DEGER_B = 'sbp_' + uret('alt103-b', 40)
const SIFRE_PG = uret('alt103-pg', 24)
const SIFRE_DB = uret('alt103-db', 24)
const IMZA_SBP = 'Supabase access token (sbp_)'

function parmakIzi(v: string): string {
  return createHash('sha256').update(v).digest('hex').slice(0, 8)
}

const gecici: string[] = []
afterAll(() => {
  for (const d of gecici) fs.rmSync(d, { recursive: true, force: true })
})

function git(repo: string, ...args: string[]): void {
  const r = spawnSync('git', ['-C', repo, '-c', 'user.email=t@t', '-c', 'user.name=t', '-c', 'commit.gpgsign=false', ...args], {
    encoding: 'utf8',
  })
  if (r.status !== 0) throw new Error(`git ${args.join(' ')} başarısız: ${r.stderr}`)
}

/** Geçici depo: ilk commit temiz; sonra `dosyalar` commit'lenir ve commit reflog'a düşecek biçimde GERİ ALINIR. */
function danglingDepo(dosyalar: Record<string, string>): string {
  const repo = fs.mkdtempSync(path.join(os.tmpdir(), 'sir-tarama-'))
  gecici.push(repo)
  git(repo, 'init', '-q')
  fs.writeFileSync(path.join(repo, 'a.txt'), 'temiz\n')
  git(repo, 'add', '.')
  git(repo, 'commit', '-q', '-m', 'ilk')
  for (const [ad, icerik] of Object.entries(dosyalar)) fs.writeFileSync(path.join(repo, ad), icerik)
  git(repo, 'add', '.')
  git(repo, 'commit', '-q', '-m', 'sizdi')
  git(repo, 'reset', '-q', '--hard', 'HEAD~1')
  return repo
}

function tara(repo: string, ek: string[] = [], kapatildi?: string) {
  const rapor = path.join(repo, '..', path.basename(repo) + '-rapor.txt')
  gecici.push(rapor)
  const liste = kapatildi ?? path.join(repo, '..', path.basename(repo) + '-yok.json')
  const r = spawnSync(PY, ['-I', BETIK, '--repo', repo, '--out', rapor, '--kapatildi', liste, ...ek], {
    encoding: 'utf8',
    maxBuffer: 16 * 1024 * 1024,
  })
  const raporMetni = fs.existsSync(rapor) ? fs.readFileSync(rapor, 'utf8') : ''
  return { kod: r.status, konsol: (r.stdout ?? '') + (r.stderr ?? ''), rapor: raporMetni }
}

function listeYaz(repo: string, kayitlar: unknown[]): string {
  const yol = path.join(repo, '..', path.basename(repo) + '-kapatildi.json')
  gecici.push(yol)
  fs.writeFileSync(yol, JSON.stringify({ surum: 1, kayitlar }))
  return yol
}

describe('INV-SIR-TARAMA-1 · ulaşılamayan commit taraması ve kapatma listesi', () => {
  it('örnek değerler betiğin gürültü süzgecinden geçecek biçimde üretilmiş', () => {
    for (const v of [DEGER_A, DEGER_B, SIFRE_PG, SIFRE_DB]) {
      expect(v).not.toMatch(/(test|mock|dummy|example|placeholder|fake|sample)/i)
    }
  })

  it('varsayılan tarama yalnız reflog\'da kalan commit\'i GÖRMEZ (kör nokta kanıtı), --ulasilamayan görür', () => {
    const repo = danglingDepo({ 'x.env': `TOKEN=${DEGER_A}\n` })
    const varsayilan = tara(repo)
    expect(varsayilan.kod).toBe(0)
    expect(varsayilan.konsol).not.toContain('ACIK')

    const derin = tara(repo, ['--ulasilamayan'])
    expect(derin.kod).toBe(1)
    expect(derin.konsol).toContain('ACIK')
    expect(derin.konsol).toContain(`parmak_izi=${parmakIzi(DEGER_A)}`)
  })

  it('değer ne konsola ne rapora yazılır; --tam-deger yalnız rapora yazar', () => {
    const repo = danglingDepo({ 'x.env': `TOKEN=${DEGER_A}\n` })
    const normal = tara(repo, ['--ulasilamayan'])
    expect(normal.konsol).not.toContain(DEGER_A)
    expect(normal.konsol).not.toContain(DEGER_A.slice(0, 12))
    expect(normal.rapor).not.toContain(DEGER_A)
    expect(normal.rapor).not.toContain(DEGER_A.slice(0, 12))

    const tam = tara(repo, ['--ulasilamayan', '--tam-deger'])
    expect(tam.rapor).toContain(DEGER_A)
    expect(tam.konsol).not.toContain(DEGER_A)
  })

  it('kapatma listesindeki bulgu uyarı üretmez; YENİ değer ve başka imza adıyla kapatılmış parmak izi KIRMIZI kalır', () => {
    const repo = danglingDepo({ 'x.env': `TOKEN=${DEGER_A}\n` })
    const kapali = listeYaz(repo, [
      { imza: IMZA_SBP, parmak_izi: parmakIzi(DEGER_A), durum: 'KAPATILDI (döndürüldü, deneme)' },
    ])
    const yesil = tara(repo, ['--ulasilamayan'], kapali)
    expect(yesil.kod).toBe(0)
    expect(yesil.konsol).toContain('KAPATILDI')
    expect(yesil.konsol).not.toContain('ACIK')

    // aynı parmak izi, YANLIŞ imza adıyla: kapatılmış sayılmaz
    const yanlisImza = listeYaz(repo, [
      { imza: 'Resend API key', parmak_izi: parmakIzi(DEGER_A), durum: 'KAPATILDI (deneme)' },
    ])
    expect(tara(repo, ['--ulasilamayan'], yanlisImza).kod).toBe(1)

    // listede OLMAYAN yeni değer: yine kırmızı
    const yeni = danglingDepo({ 'y.env': `TOKEN=${DEGER_B}\n` })
    const sadeceA = listeYaz(yeni, [
      { imza: IMZA_SBP, parmak_izi: parmakIzi(DEGER_A), durum: 'KAPATILDI (deneme)' },
    ])
    const kirmizi = tara(yeni, ['--ulasilamayan'], sadeceA)
    expect(kirmizi.kod).toBe(1)
    expect(kirmizi.konsol).toContain(`parmak_izi=${parmakIzi(DEGER_B)}`)
  })

  it('bozuk kapatma listesi çıkış 2 verir', () => {
    const repo = danglingDepo({ 'x.env': `TOKEN=${DEGER_A}\n` })
    const bozuk = path.join(repo, '..', path.basename(repo) + '-bozuk.json')
    gecici.push(bozuk)
    fs.writeFileSync(bozuk, '{ bu json degil')
    expect(tara(repo, ['--ulasilamayan'], bozuk).kod).toBe(2)
  })

  it('Postgres bağlantı dizesi ve SUPABASE_DB_PASSWORD ataması yakalanır; yer tutucu yakalanmaz', () => {
    const repo = danglingDepo({
      'db.env': `DATABASE_URL=postgresql://postgres:${SIFRE_PG}@db.example.supabase.co:5432/postgres\n`,
      'ci.env': `SUPABASE_DB_PASSWORD=${SIFRE_DB}\n`,
    })
    const r = tara(repo, ['--ulasilamayan'])
    expect(r.kod).toBe(1)
    expect(r.konsol).toContain(`parmak_izi=${parmakIzi(SIFRE_PG)}`)
    expect(r.konsol).toContain(`parmak_izi=${parmakIzi(SIFRE_DB)}`)
    expect(r.konsol).not.toContain(SIFRE_PG)
    expect(r.konsol).not.toContain(SIFRE_DB)

    const yerTutucu = danglingDepo({
      'wf.yml': 'env:\n  SUPABASE_DB_PASSWORD: ${{ secrets.SUPABASE_DB_PASSWORD }}\n',
    })
    expect(tara(yerTutucu, ['--ulasilamayan']).kod).toBe(0)
  })

  it('depodaki gerçek kapatma listesi biçimce sağlam: değer taşımaz, her imza betikte tanımlı', () => {
    const veri = JSON.parse(fs.readFileSync(KAPATMA_LISTESI, 'utf8')) as {
      surum: number
      kayitlar: { imza: string; parmak_izi: string; durum: string }[]
    }
    expect(veri.surum).toBe(1)
    expect(veri.kayitlar.length).toBeGreaterThan(0)
    const betik = fs.readFileSync(BETIK, 'utf8')
    const gorulen = new Set<string>()
    for (const k of veri.kayitlar) {
      expect(k.parmak_izi).toMatch(/^[0-9a-f]{8}$/)
      expect(k.durum.length).toBeGreaterThan(5)
      expect(betik).toContain(`"${k.imza}"`)
      const anahtar = `${k.imza}|${k.parmak_izi}`
      expect(gorulen.has(anahtar)).toBe(false)
      gorulen.add(anahtar)
      // değer taşıma yasağı: yalnız bu dört alan olabilir; parmak izi 8 hane sınırını yukarıda zorlandı
      for (const alan of Object.keys(k)) expect(['durum', 'imza', 'not', 'parmak_izi']).toContain(alan)
    }
  })
})
