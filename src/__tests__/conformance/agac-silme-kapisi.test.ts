import { execFileSync, spawnSync } from 'node:child_process'
import fs from 'node:fs'
import os from 'node:os'
import path from 'node:path'

import { afterAll, beforeAll, describe, expect, it, vi } from 'vitest'

/**
 * INV-AGAC-SILME-1 · worktree silme kapısı (scripts/hijyen/agac-silme-kapisi.cjs) — ALT-125, Harita HRT-53.
 *
 * Kapı karar üretir, silmez; asıl emniyeti K2 (kayıp) ve K3 (kir) koşullarıdır (cetvel §30: "dal origin'de
 * var ≠ iş yedekli"). Bu test kapıyı GERÇEK geçici depolarda koşar (fikstür değil; uzak + worktree kurulur):
 *   · YÖN: yerel ileri (itilmemiş commit) = kayıp riski; yerel GERİ (uzakta fazla commit) kayıp DEĞİL.
 *   · "Dal origin'de var" yedek sayılmaz: dal uzakta varken yerelde fazladan commit K2'yi düşürür.
 *   · Commit BAŞKA bir uzak ref'te varsa yedeklidir (dal-başı karşılaştırmanın yanlış pozitifi, kapı başlığı).
 *   · K3 izlenmeyen dizinin içindeki dosyaları tek tek sayar (-uall).
 * Sabotaj kolları kapının kopyasını bozar (rev-list yönü ters, -uall yok) ve aynı ölçütün KIRMIZI verdiğini görür;
 * sabotajsız yeşil kanıt sayılmaz (cetvel §8).
 * Kapsam sınırı: K1 (kimlik dosyası) ve K4 (ilan penceresi) burada ölçülmez; ilan dosyası betiğin kendi
 * dizinine yazıldığı için test --ilan KOŞMAZ (gerçek silme-ilani.json'a dokunmamak için).
 */

// Ağır sınıf (§13): ~20 git süreci + 3 betik koşusu; ölçülmüş yerel süre birkaç saniye, 60 sn tavan.
vi.setConfig({ testTimeout: 60_000, hookTimeout: 60_000 })

const KOK = path.resolve(__dirname, '../../..')
const KAPI = path.join(KOK, 'scripts/hijyen/agac-silme-kapisi.cjs')

type Sonuc = {
  ad: string
  karar: string
  erisilemeyenCommit: number | null
  kirli: number | null
  kosullar: { k2_uzakta_var: boolean; k3_temiz: boolean }
}

let tmp = ''
let ana = ''
const bosKanca = () => path.join(tmp, 'kancasiz')

function git(cwd: string, ...args: string[]): string {
  return execFileSync('git', ['-c', `core.hooksPath=${bosKanca()}`, ...args], {
    cwd,
    encoding: 'utf8',
    windowsHide: true,
    env: {
      ...process.env,
      GIT_AUTHOR_NAME: 'test',
      GIT_AUTHOR_EMAIL: 'test@example.invalid',
      GIT_COMMITTER_NAME: 'test',
      GIT_COMMITTER_EMAIL: 'test@example.invalid',
    },
  })
}

function commit(cwd: string, dosya: string): void {
  fs.writeFileSync(path.join(cwd, dosya), dosya + '\n')
  git(cwd, 'add', dosya)
  git(cwd, 'commit', '-q', '-m', dosya)
}

function worktree(ad: string, dal: string, baz: string): string {
  const yol = path.join(tmp, ad)
  git(ana, 'worktree', 'add', '-q', '-b', dal, yol, baz)
  return yol
}

function kos(betik: string, agaclar: string[]): Sonuc[] {
  const r = spawnSync(process.execPath, [betik, '--agac', agaclar.join(','), '--json'], {
    cwd: ana,
    encoding: 'utf8',
    windowsHide: true,
  })
  // Çıkış 1 = "hiçbiri silinebilir değil" (K4 ilan yok); 2 = kullanım hatası → testin kendisi bozuk.
  expect(r.status, r.stderr).not.toBe(2)
  return (JSON.parse(r.stdout) as { sonuclar: Sonuc[] }).sonuclar
}

const bul = (s: Sonuc[], ad: string) => {
  const x = s.find((y) => y.ad === ad)
  if (!x) throw new Error(`sonuçta ${ad} yok`)
  return x
}

/** Kapının kopyasını temp'e yazar; `bozan` metni değiştirir. Değişmezse sabotaj sessizce boşa gider → hata. */
function sabotajliKopya(ad: string, bozan: (s: string) => string): string {
  const orijinal = fs.readFileSync(KAPI, 'utf8')
  const bozuk = bozan(orijinal)
  if (bozuk === orijinal) throw new Error(`sabotaj ${ad}: kaynakta hedef metin bulunamadı (kapı değişmiş olabilir)`)
  const yol = path.join(tmp, `sabotaj-${ad}.cjs`)
  fs.writeFileSync(yol, bozuk)
  return yol
}

const AGACLAR = ['wt-ileri', 'wt-geri', 'wt-baska-ref', 'wt-temiz', 'wt-kirli']

beforeAll(() => {
  tmp = fs.mkdtempSync(path.join(os.tmpdir(), 'agac-silme-'))
  fs.mkdirSync(bosKanca())
  const uzak = path.join(tmp, 'uzak.git')
  ana = path.join(tmp, 'ana')
  execFileSync('git', ['init', '-q', '--bare', uzak], { windowsHide: true })
  execFileSync('git', ['init', '-q', '-b', 'master', ana], { windowsHide: true })
  commit(ana, 'a.txt')
  git(ana, 'remote', 'add', 'origin', uzak)
  git(ana, 'push', '-q', 'origin', 'master')

  // wt-ileri: dal origin'de VAR ama yerelde 2 itilmemiş commit (yönlü kayıp: yerel ileri).
  const ileri = worktree('wt-ileri', 'ileri', 'master')
  commit(ileri, 'i1.txt')
  git(ileri, 'push', '-q', 'origin', 'ileri')
  commit(ileri, 'i2.txt')
  commit(ileri, 'i3.txt')

  // wt-geri: yerel GERİDE (uzakta fazladan commit var), yerelin her commit'i uzakta → kayıp YOK.
  const geri = worktree('wt-geri', 'geri', 'master')
  commit(geri, 'g1.txt')
  commit(geri, 'g2.txt')
  git(geri, 'push', '-q', 'origin', 'geri')
  git(geri, 'reset', '-q', '--hard', 'HEAD~1')

  // wt-baska-ref: commit kendi upstream'inde yok ama BAŞKA uzak dalda var → yedekli (kayıp 0).
  const baska = worktree('wt-baska-ref', 'baska', 'master')
  commit(baska, 'b1.txt')
  git(baska, 'push', '-q', 'origin', 'HEAD:refs/heads/yedek/baska')

  // wt-temiz: master'dan, hiç değişiklik yok.
  worktree('wt-temiz', 'temiz', 'master')

  // wt-kirli: izlenmeyen BİR dizin içinde 3 dosya (-uall'sız tek satıra katlanır).
  const kirli = worktree('wt-kirli', 'kirli', 'master')
  fs.mkdirSync(path.join(kirli, 'yeni'))
  for (const d of ['x', 'y', 'z']) fs.writeFileSync(path.join(kirli, 'yeni', d + '.txt'), d)
})

afterAll(() => {
  if (tmp) fs.rmSync(tmp, { recursive: true, force: true, maxRetries: 3 })
})

describe('INV-AGAC-SILME-1 · agac-silme-kapisi K2 yönlü kayıp + K3 -uall', () => {
  let s: Sonuc[] = []
  beforeAll(() => {
    s = kos(KAPI, AGACLAR)
  })

  it('dal origin\'de var ama yerel ileri → K2 düşer, 2 commit risk altında', () => {
    const r = bul(s, 'wt-ileri')
    expect(r.erisilemeyenCommit).toBe(2)
    expect(r.kosullar.k2_uzakta_var).toBe(false)
    expect(r.karar).toBe('SILINEMEZ')
  })

  it('yerel geride (uzakta fazla commit) → kayıp değil, K2 geçer', () => {
    const r = bul(s, 'wt-geri')
    expect(r.erisilemeyenCommit).toBe(0)
    expect(r.kosullar.k2_uzakta_var).toBe(true)
  })

  it('commit başka bir uzak ref\'te → yedekli, K2 geçer (dal-başı karşılaştırmanın yanlış pozitifi yok)', () => {
    const r = bul(s, 'wt-baska-ref')
    expect(r.erisilemeyenCommit).toBe(0)
    expect(r.kosullar.k2_uzakta_var).toBe(true)
  })

  it('K3: izlenmeyen dizindeki 3 dosya tek tek sayılır; temiz ağaç 0', () => {
    expect(bul(s, 'wt-kirli').kirli).toBe(3)
    expect(bul(s, 'wt-kirli').kosullar.k3_temiz).toBe(false)
    expect(bul(s, 'wt-temiz').kirli).toBe(0)
    expect(bul(s, 'wt-temiz').kosullar.k3_temiz).toBe(true)
  })

  it('K4 ilan yokken hiçbir ağaç SILINEBILIR değil (kapı tek başına silme yetkisi vermez)', () => {
    for (const r of s) expect(r.karar).toBe('SILINEMEZ')
  })
})

describe('INV-AGAC-SILME-1 · sabotaj: kapı bozulunca aynı ölçüt KIRMIZI', () => {
  it('rev-list yönü ters çevrilirse yerel-ileri kaybı görünmez ve geride ağaç yanlış alarm verir', () => {
    const betik = sabotajliKopya('yon', (k) =>
      k.replace("['rev-list', '--count', 'HEAD', '--not', '--remotes']", "['rev-list', '--count', '--remotes', '--not', 'HEAD']"),
    )
    const s = kos(betik, ['wt-ileri', 'wt-geri'])
    // Doğru kapıda 2 ve 0; bozukta iki ölçüt de tutmaz → yukarıdaki kollar kırmızı verir.
    expect(bul(s, 'wt-ileri').erisilemeyenCommit).not.toBe(2)
    expect(bul(s, 'wt-geri').erisilemeyenCommit).not.toBe(0)
  })

  it('--remotes yerine yalnız upstream (dal-başı) ölçülürse başka ref\'teki commit yanlış kayıp sayılır', () => {
    const betik = sabotajliKopya('dalbasi', (k) =>
      k.replace("['rev-list', '--count', 'HEAD', '--not', '--remotes']", "['rev-list', '--count', 'HEAD', '--not', '--remotes=origin/baska', '--remotes=origin/ileri', '--remotes=origin/geri']"),
    )
    const s = kos(betik, ['wt-baska-ref'])
    expect(bul(s, 'wt-baska-ref').erisilemeyenCommit).not.toBe(0)
  })

  it('-uall kaldırılırsa izlenmeyen dizin tek satıra katlanır (3 yerine 1)', () => {
    const betik = sabotajliKopya('uall', (k) => k.replace("['status', '--porcelain', '--untracked-files=all']", "['status', '--porcelain']"))
    const s = kos(betik, ['wt-kirli'])
    expect(bul(s, 'wt-kirli').kirli).not.toBe(3)
  })
})
