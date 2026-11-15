/**
 * INV-HAFIZA-YEDEK-1 — hafıza deposu PreCompact'ta ve eşik aşılınca yedeklenir; sır kalıbı commit'e girmez (ARC-92).
 *
 * Kanca: .claude/hooks/hafiza-yedek.cjs · modül: scripts/hijyen/hafiza-yedek.cjs · cetvel: hafiza-kancalari-standard.md §9.
 * Deneyler GEÇİCİ git deposunda koşar; gerçek hafıza dizinine dokunmaz.
 */
import { execFileSync, spawnSync } from 'node:child_process'
import fs from 'node:fs'
import { createRequire } from 'node:module'
import os from 'node:os'
import path from 'node:path'

import { afterEach, beforeEach, describe, expect, it } from 'vitest'

const gerek = createRequire(import.meta.url)
const KOK = path.resolve(__dirname, '../../..')
const MODUL = path.join(KOK, 'scripts', 'hijyen', 'hafiza-yedek.cjs')
const KANCA = path.join(KOK, '.claude', 'hooks', 'hafiza-yedek.cjs')

interface Modul {
  ESIK_SN: number
  DENEME_ARALIGI_SN: number
  sirKalibiVar: (fark: string) => boolean
  yedekYasiSn: (dir: string, simdiSn: number) => number | null
  bekleyenVar: (dir: string) => boolean
  yedekle: (a: { dir: string; sebep?: string; simdi?: Date; taramaSonrasi?: () => void; commitOncesi?: () => void; bekleMs?: number }) => { durum: string; push?: boolean; disarida?: string[]; neden?: string }
  karar: (a: { olay: string; yasSn: number | null; bekleyen: boolean; sonDenemeYasSn: number | null; sonBasarisiz?: string | null }) => {
    yedekle: boolean
    satir: string | null
  }
  sonKayit: (dir: string) => { durum: string; push?: boolean; disarida?: string[] } | null
  basarisizNeden: (k: { durum: string; push?: boolean; disarida?: string[]; neden?: string } | null) => string | null
  kancaKos: (girdi: { hook_event_name: string }, o: { dir: string; simdiSn: number }) => { cikti: unknown }
}
const m = gerek(MODUL) as Modul

const git = (dir: string, ...a: string[]) => execFileSync('git', ['-C', dir, ...a], { encoding: 'utf8', windowsHide: true }).trim()
const commitSayisi = (dir: string) => Number(git(dir, 'rev-list', '--count', 'HEAD'))

let dir = ''
beforeEach(() => {
  dir = fs.mkdtempSync(path.join(os.tmpdir(), 'hafiza-yedek-'))
  git(dir, 'init', '-q', '-b', 'master')
  git(dir, 'config', 'user.email', 'test@example.invalid')
  git(dir, 'config', 'user.name', 'test')
  git(dir, 'config', 'commit.gpgsign', 'false')
  fs.writeFileSync(path.join(dir, 'MEMORY.md'), '# indeks\n')
  git(dir, 'add', '--', 'MEMORY.md')
  git(dir, 'commit', '-q', '-m', 'ilk')
})
afterEach(() => {
  fs.rmSync(dir, { recursive: true, force: true })
})

describe('INV-HAFIZA-YEDEK-1', () => {
  it('sır kalıbı: tam değerler yakalanır, kırpılmış ve kısa değerler yakalanmaz', () => {
    const uzun = (onek: string, n: number, set = 'a') => onek + set.repeat(n)
    expect(m.sirKalibiVar(uzun('sk-ant-', 70))).toBe(true)
    expect(m.sirKalibiVar(uzun('ghp_', 36))).toBe(true)
    expect(m.sirKalibiVar(uzun('lin_api_', 40))).toBe(true)
    expect(m.sirKalibiVar(uzun('sbp_', 40, 'f'))).toBe(true)
    // Bağlantı dizesi parçalardan kurulur: CI'daki sabit-bağlantı-dizesi taraması (ci.yml Secret guard) sahte örneği de yakalar.
    expect(m.sirKalibiVar(['postgresql', '://kullanici:parola@sunucu/veritabani'].join(''))).toBe(true)
    expect(m.sirKalibiVar('sk-ant-...kirpilmis')).toBe(false)
    expect(m.sirKalibiVar(uzun('ghp_', 10))).toBe(false)
    expect(m.sirKalibiVar('düz hafıza notu')).toBe(false)
  })

  it('değişiklik yoksa sessiz: yeni commit YOK', () => {
    const once = commitSayisi(dir)
    expect(m.yedekle({ dir, sebep: 'test' }).durum).toBe('degisiklik-yok')
    expect(commitSayisi(dir)).toBe(once)
  })

  it('yeni not commit olur, push yoksa (uzak yok) sessiz kalır', () => {
    fs.writeFileSync(path.join(dir, 'ders.md'), 'bir ders\n')
    const once = commitSayisi(dir)
    const r = m.yedekle({ dir, sebep: 'precompact' })
    expect(r.durum).toBe('commit')
    expect(r.push).toBe(false)
    expect(commitSayisi(dir)).toBe(once + 1)
    expect(git(dir, 'log', '-1', '--format=%s')).toMatch(/^hafiza: precompact /)
  })

  it('sır kalıbı varsa commit ATILMAZ, günlüğe yazılır, indeks temizlenir', () => {
    const once = commitSayisi(dir)
    fs.writeFileSync(path.join(dir, 'sizinti.md'), 'anahtar ' + 'sk-ant-' + 'a'.repeat(70) + '\n')
    const r = m.yedekle({ dir, sebep: 'test' })
    expect(r.durum).toBe('sir-kalibi')
    expect(commitSayisi(dir)).toBe(once)
    expect(git(dir, 'diff', '--cached', '--name-only')).toBe('')
    expect(fs.readFileSync(path.join(dir, '.hafiza-commit-uyari.log'), 'utf8')).toContain('SIR KALIBI')
  })

  it('ARC-319: sır kalıbı yalnız KENDİ dosyasını dışarıda bırakır, temiz dosya yine commit olur (6 gün sessiz düşme)', () => {
    const once = commitSayisi(dir)
    fs.writeFileSync(path.join(dir, 'sizinti.md'), 'anahtar ' + 'sk-ant-' + 'a'.repeat(70) + '\n')
    fs.writeFileSync(path.join(dir, 'temiz.md'), 'sıradan ders\n')
    const r = m.yedekle({ dir, sebep: 'test' })
    expect(r.durum).toBe('commit')
    expect(r.disarida).toEqual(['sizinti.md'])
    expect(commitSayisi(dir)).toBe(once + 1)
    expect(git(dir, 'show', '--name-only', '--format=', 'HEAD')).toBe('temiz.md')
    expect(git(dir, 'diff', '--cached', '--name-only')).toBe('')
    expect(fs.readFileSync(path.join(dir, '.hafiza-commit-uyari.log'), 'utf8')).toContain('sizinti.md')
    // Sır içeren dosya hiçbir commit'e sızmadı.
    expect(git(dir, 'log', '--all', '--format=', '--name-only')).not.toContain('sizinti.md')
  })

  it('ARC-319: son deneme kaydı yazılır; başarısız neden okunur, başarıda null', () => {
    fs.writeFileSync(path.join(dir, 'sizinti.md'), 'anahtar ' + 'sk-ant-' + 'a'.repeat(70) + '\n')
    m.yedekle({ dir, sebep: 'test' })
    const k = m.sonKayit(dir)
    expect(k?.durum).toBe('sir-kalibi')
    expect(m.basarisizNeden(k)).toContain('hiçbir şey yedeklenemedi (sizinti.md')
    expect(m.basarisizNeden({ durum: 'commit', push: false })).toContain('push düştü')
    expect(m.basarisizNeden({ durum: 'hata', neden: 'x' })).toContain('yedek hata verdi: x')
    expect(m.basarisizNeden({ durum: 'commit', push: true })).toBeNull()
    expect(m.basarisizNeden({ durum: 'degisiklik-yok' })).toBeNull()
    expect(m.basarisizNeden(null)).toBeNull()
    expect(m.sonKayit(path.join(dir, 'yok'))).toBeNull()
    // Kayıt md değil: commit'e girmez, bekleyen saymaz.
    fs.rmSync(path.join(dir, 'sizinti.md'))
    expect(m.bekleyenVar(dir)).toBe(false)
  })

  it('ARC-319: kanca satırı "başlatıldı" yalnız başlatıldıysa der; başarısız son deneme neden ile görünür', () => {
    const k = (o: Partial<Parameters<Modul['karar']>[0]>) =>
      m.karar({ olay: 'UserPromptSubmit', yasSn: 5000, bekleyen: true, sonDenemeYasSn: null, ...o })
    expect(k({}).satir).toContain('başlatıldı')
    // Deneme aralığı dolmadı: yedek başlatılmadı, satır "başlatıldı" DEMEZ.
    expect(k({ sonDenemeYasSn: 60 }).satir).not.toContain('başlatıldı')
    const b = k({ sonDenemeYasSn: 60, sonBasarisiz: 'hiçbir şey yedeklenemedi (a.md sır kalıbı nedeniyle dışarıda)' })
    expect(b.satir).toContain('⛔SON YEDEK BAŞARISIZ: hiçbir şey yedeklenemedi (a.md')
    expect(b.satir).not.toContain('başlatıldı')
    // Bekleyen yoksa eski başarısızlık satırı kirletmez.
    expect(k({ bekleyen: false, sonBasarisiz: 'x' }).satir).toBeNull()
    const s = m.karar({ olay: 'SessionStart', yasSn: 9000, bekleyen: true, sonDenemeYasSn: 60, sonBasarisiz: 'y' })
    expect(s.satir).toContain('⛔SON YEDEK BAŞARISIZ: y')
  })

  const SIR = 'anahtar ' + 'sk-ant-' + 'a'.repeat(70) + '\n'
  const sonCommitDosyalari = () => git(dir, 'show', '--name-only', '--format=', 'HEAD').split('\n').filter(Boolean)
  const gecmisteVar = (ad: string) => git(dir, 'log', '--all', '--format=', '--name-only', '--', ad).includes(ad.replace(/^.*\//, ''))

  it('ARC-319 denetçi B2: Türkçe karakterli ve boşluklu adlı sırlı dosya da dışarıda kalır (-z, alıntısız ad)', () => {
    fs.writeFileSync(path.join(dir, 'gizli türkçe not.md'), SIR)
    fs.writeFileSync(path.join(dir, 'temiz.md'), 'ders\n')
    const r = m.yedekle({ dir, sebep: 'test' })
    expect(r.durum).toBe('commit')
    expect(r.disarida).toEqual(['gizli türkçe not.md'])
    expect(sonCommitDosyalari()).toEqual(['temiz.md'])
    expect(git(dir, 'log', '--all', '--format=', '--name-only').includes('gizli')).toBe(false)
  })

  it('ARC-319 denetçi N1: UTF-16 ve NUL baytlı md de taranır (sır geçmişe girmez)', () => {
    fs.writeFileSync(path.join(dir, 'u16.md'), Buffer.from('﻿' + SIR, 'utf16le'))
    fs.writeFileSync(path.join(dir, 'ikili.md'), Buffer.concat([Buffer.from([0, 1, 0, 2]), Buffer.from(SIR)]))
    fs.writeFileSync(path.join(dir, 'temiz.md'), 'ders\n')
    const r = m.yedekle({ dir, sebep: 'test' })
    expect(r.durum).toBe('commit')
    expect((r.disarida ?? []).sort()).toEqual(['ikili.md', 'u16.md'])
    expect(sonCommitDosyalari()).toEqual(['temiz.md'])
  })

  it('ARC-319 denetçi N2: sırrı SİLEN değişiklik ve sırlı dosyanın silinmesi yedeklenir (yalnız eklenen satırlar taranır)', () => {
    fs.writeFileSync(path.join(dir, 'eski.md'), 'x\n' + SIR)
    fs.writeFileSync(path.join(dir, 'silinecek.md'), SIR)
    git(dir, 'add', '--', 'eski.md', 'silinecek.md') // geçmişte kalmış sır (bu modül dışında girdi)
    git(dir, 'commit', '-q', '-m', 'eski sır')
    fs.writeFileSync(path.join(dir, 'eski.md'), 'x\n')
    fs.rmSync(path.join(dir, 'silinecek.md'))
    const r = m.yedekle({ dir, sebep: 'test' })
    expect(r.durum).toBe('commit')
    expect(r.disarida).toEqual([])
    expect(sonCommitDosyalari().sort()).toEqual(['eski.md', 'silinecek.md'])
  })

  it('ARC-319 denetçi N3: köşeli parantezli ad glob sayılmaz (a[1].md temiz, a1.md sırlı → yalnız a[1].md girer)', () => {
    fs.writeFileSync(path.join(dir, 'a1.md'), SIR)
    fs.writeFileSync(path.join(dir, 'a[1].md'), 'temiz\n')
    const r = m.yedekle({ dir, sebep: 'test' })
    expect(r.disarida).toEqual(['a1.md'])
    expect(sonCommitDosyalari()).toEqual(['a[1].md'])
  })

  it('ARC-319 denetçi B1: eşzamanlı koşunun indekse geri koyduğu sırlı dosya commit’e giremez; taze kilit varken koşu çıkar, bayat kilit düşer', () => {
    fs.writeFileSync(path.join(dir, 'gizli.md'), SIR)
    fs.writeFileSync(path.join(dir, 'temiz.md'), 'ders\n')
    git(dir, 'add', '--', 'gizli.md') // öteki koşunun git add'inin bıraktığı indeks: başlangıçta temizlenir
    const once = commitSayisi(dir)
    expect(m.yedekle({ dir, sebep: 'test' }).durum).toBe('commit')
    expect(sonCommitDosyalari()).toEqual(['temiz.md'])
    expect(gecmisteVar('gizli.md')).toBe(false)
    // Taze kilit: koşu hiçbir şey yapmaz, kaydı ezmez.
    fs.writeFileSync(path.join(dir, 'yeni.md'), 'n\n')
    const kilit = path.join(dir, '.hafiza-yedek-kilit')
    fs.mkdirSync(kilit)
    const sayi = commitSayisi(dir)
    expect(m.yedekle({ dir, sebep: 'test' }).durum).toBe('mesgul')
    expect(commitSayisi(dir)).toBe(sayi)
    // Bayat kilit (>120 sn): düşürülür, koşu ilerler ve kilidi bırakır.
    const eski = new Date(Date.now() - 300000)
    fs.utimesSync(kilit, eski, eski)
    expect(m.yedekle({ dir, sebep: 'test' }).durum).toBe('commit')
    expect(fs.existsSync(kilit)).toBe(false)
    expect(commitSayisi(dir)).toBe(sayi + 1)
    expect(once).toBeLessThan(sayi)
  })

  it('ARC-319 denetçi B1 (derinlemesine): tarama ile git add arasında dosyaya sır yazılırsa commit öncesi indeks taraması yakalar', () => {
    fs.writeFileSync(path.join(dir, 'temiz.md'), 'ders\n')
    const once = commitSayisi(dir)
    const r = m.yedekle({
      dir,
      sebep: 'test',
      taramaSonrasi: () => fs.writeFileSync(path.join(dir, 'temiz.md'), SIR),
    })
    expect(r.durum).toBe('sir-kalibi')
    expect(commitSayisi(dir)).toBe(once)
    expect(git(dir, 'diff', '--cached', '--name-only')).toBe('')
  })

  it('ARC-319 denetçi E1: izlenen dosyaya eklenen "++" ya da "+++" ile başlayan sırlı satır da yakalanır (başlık sanılıp atlanmaz)', () => {
    fs.writeFileSync(path.join(dir, 'not.md'), 'ilk\n')
    git(dir, 'add', '--', 'not.md')
    git(dir, 'commit', '-q', '-m', 'not')
    for (const onek of ['++', '++ ', '+++ b/x ', '+']) {
      fs.writeFileSync(path.join(dir, 'not.md'), 'ilk\n' + onek + SIR)
      const once = commitSayisi(dir)
      const r = m.yedekle({ dir, sebep: 'test' })
      expect(r.durum, 'önek ' + JSON.stringify(onek)).toBe('sir-kalibi')
      expect(r.disarida).toEqual(['not.md'])
      expect(commitSayisi(dir)).toBe(once)
    }
  })

  it('ARC-319 denetçi M11: izlenen a[1].md temiz değişince glob a1.md’ye taşmaz (diff de literal pathspec)', () => {
    fs.writeFileSync(path.join(dir, 'a[1].md'), 'bir\n')
    fs.writeFileSync(path.join(dir, 'a1.md'), 'iki\n')
    git(dir, 'add', '--', 'a[1].md', 'a1.md')
    git(dir, 'commit', '-q', '-m', 'iki dosya')
    fs.writeFileSync(path.join(dir, 'a[1].md'), 'bir\ntemiz ek\n')
    fs.writeFileSync(path.join(dir, 'a1.md'), 'iki\n' + SIR)
    const r = m.yedekle({ dir, sebep: 'test' })
    expect(r.disarida).toEqual(['a1.md'])
    expect(sonCommitDosyalari()).toEqual(['a[1].md'])
  })

  it('ARC-319 denetçi N-A: kilitsiz dış yazar son tarama ile commit arasında sırlı dosyayı indekse sokarsa commit geri alınır, uzağa gitmez', () => {
    const uzak = fs.mkdtempSync(path.join(os.tmpdir(), 'hafiza-uzak-'))
    try {
      execFileSync('git', ['init', '-q', '--bare', uzak], { windowsHide: true })
      git(dir, 'remote', 'add', 'origin', uzak)
      fs.writeFileSync(path.join(dir, 'gizli.md'), SIR)
      fs.writeFileSync(path.join(dir, 'temiz.md'), 'ders\n')
      const once = commitSayisi(dir)
      const ilk = git(dir, 'rev-parse', 'HEAD')
      const r = m.yedekle({ dir, sebep: 'test', commitOncesi: () => git(dir, 'add', '--', 'gizli.md') })
      expect(r.durum).toBe('sir-kalibi')
      expect(r.disarida).toContain('(commit sonrası taramada)')
      expect(commitSayisi(dir)).toBe(once)
      expect(git(dir, 'rev-parse', 'HEAD')).toBe(ilk)
      expect(git(dir, 'diff', '--cached', '--name-only')).toBe('')
      // Uzakta hiçbir şey yok: push yapılmadı.
      expect(() => execFileSync('git', ['-C', uzak, 'rev-parse', 'master'], { stdio: 'pipe', windowsHide: true })).toThrow()
    } finally {
      fs.rmSync(uzak, { recursive: true, force: true })
    }
  })

  it('ARC-319 denetçi N-B: kilidi bayat düşüp başkasına geçmişse bitirenin finally’si başkasının kilidini silmez; N-H: bekleMs kilit boşalmazsa mesgul döner', () => {
    fs.writeFileSync(path.join(dir, 'ders.md'), 'bir\n')
    const kilit = path.join(dir, '.hafiza-yedek-kilit')
    const r = m.yedekle({ dir, sebep: 'test', commitOncesi: () => fs.writeFileSync(path.join(kilit, 'sahip'), 'baska-surec') })
    expect(r.durum).toBe('commit')
    expect(fs.existsSync(kilit)).toBe(true)
    expect(fs.readFileSync(path.join(kilit, 'sahip'), 'utf8')).toBe('baska-surec')
    const t0 = Date.now()
    expect(m.yedekle({ dir, sebep: 'test', bekleMs: 400 }).durum).toBe('mesgul')
    expect(Date.now() - t0).toBeGreaterThanOrEqual(350)
    fs.rmSync(kilit, { recursive: true, force: true })
  })

  it('ARC-319 denetçi N-C ve N-E: push iki koşuda da düşse üçüncü koşu yine dener; hata nedeninde / ve \\ yolu maskelenir', () => {
    fs.writeFileSync(path.join(dir, 'ders.md'), 'bir\n')
    expect(m.yedekle({ dir, sebep: 'test' }).push).toBe(false)
    expect(m.yedekle({ dir, sebep: 'test' })).toMatchObject({ durum: 'push-tekrar', push: false })
    expect(m.yedekle({ dir, sebep: 'test' })).toMatchObject({ durum: 'push-tekrar', push: false })
    // index.lock varken git yolu ileri eğik çizgiyle yazar; neden mutlak yol taşımamalı.
    fs.writeFileSync(path.join(dir, '.git', 'index.lock'), '')
    fs.writeFileSync(path.join(dir, 'yeni.md'), 'n\n')
    const r = m.yedekle({ dir, sebep: 'test' })
    expect(r.durum).toBe('hata')
    expect(r.neden).not.toContain(dir)
    expect(r.neden).not.toContain(dir.replace(/\\/g, '/'))
    fs.rmSync(path.join(dir, '.git', 'index.lock'))
  })

  it('ARC-319 denetçi N7: push düşünce kayıt yazılır, uzak sonradan eklenince "değişiklik yok" koşusu push’u yeniden dener', () => {
    fs.writeFileSync(path.join(dir, 'ders.md'), 'bir\n')
    expect(m.yedekle({ dir, sebep: 'test' }).push).toBe(false)
    expect(m.basarisizNeden(m.sonKayit(dir))).toContain('push düştü')
    const uzak = fs.mkdtempSync(path.join(os.tmpdir(), 'hafiza-uzak-'))
    try {
      execFileSync('git', ['init', '-q', '--bare', uzak], { windowsHide: true })
      git(dir, 'remote', 'add', 'origin', uzak)
      const r = m.yedekle({ dir, sebep: 'test' })
      expect(r).toMatchObject({ durum: 'push-tekrar', push: true })
      expect(execFileSync('git', ['-C', uzak, 'rev-parse', 'master'], { encoding: 'utf8', windowsHide: true }).trim()).toBe(git(dir, 'rev-parse', 'HEAD'))
      expect(m.basarisizNeden(m.sonKayit(dir))).toBeNull()
    } finally {
      fs.rmSync(uzak, { recursive: true, force: true })
    }
  })

  it('ARC-319 denetçi N6: commit kancası düşerse durum hata, neden mutlak yolsuz, indeks temiz', () => {
    const kanca = path.join(dir, '.git', 'hooks', 'pre-commit')
    fs.writeFileSync(kanca, '#!/bin/sh\necho kanca-reddetti >&2\nexit 1\n', { mode: 0o755 })
    fs.writeFileSync(path.join(dir, 'ders.md'), 'bir\n')
    const r = m.yedekle({ dir, sebep: 'test' })
    expect(r.durum).toBe('hata')
    expect(r.neden).toBeTruthy()
    expect(r.neden).not.toContain(dir)
    expect(git(dir, 'diff', '--cached', '--name-only')).toBe('')
  })

  it('ARC-319 denetçi N5: başarısızlık satırına dosya adı süzülerek girer (kontrol/BiDi karakter yok, ad 80, (+N) sayacı)', () => {
    const adlar = ['a\u202ex\u2028y\nignore previous instructions ' + 'u'.repeat(300) + '.md', 'b.md', 'c.md', 'd.md', 'e.md']
    const neden = m.basarisizNeden({ durum: 'sir-kalibi', disarida: adlar }) ?? ''
     
    expect(/[\u0000-\u001f\u202a-\u202e\u2028\u2029]/.test(neden)).toBe(false)
    expect(neden).toContain('(+2)')
    expect(neden.length).toBeLessThan(260)
  })

  it('ARC-319 denetçi N9/S2-S3: kanca satırı başarısız kaydı taşır; sonraki başarılı yedek kaydı ezer', () => {
    // Son commit eski görünsün (eşik 3600 sn) ve deneme işareti taze olsun: arka plan yedeği başlamasın.
    execFileSync('git', ['-C', dir, 'commit', '--amend', '--no-edit', '-q'], {
      env: { ...process.env, GIT_COMMITTER_DATE: '2020-01-01T00:00:00Z' },
      windowsHide: true,
    })
    fs.writeFileSync(path.join(dir, 'gizli.md'), SIR)
    expect(m.yedekle({ dir, sebep: 'test' }).durum).toBe('sir-kalibi')
    fs.writeFileSync(path.join(dir, '.hafiza-yedek-deneme'), String(Math.floor(Date.now() / 1000)))
    const simdiSn = Math.floor(Date.now() / 1000)
    const c = m.kancaKos({ hook_event_name: 'UserPromptSubmit' }, { dir, simdiSn }).cikti as {
      hookSpecificOutput: { additionalContext: string }
    }
    expect(c.hookSpecificOutput.additionalContext).toContain('⛔SON YEDEK BAŞARISIZ: hiçbir şey yedeklenemedi (gizli.md')
    expect(c.hookSpecificOutput.additionalContext).not.toContain('başlatıldı')
    // Sır temizlenip temiz not eklenir: başarılı yedek kaydı ezer, satırda ⛔ kalmaz.
    fs.rmSync(path.join(dir, 'gizli.md'))
    fs.writeFileSync(path.join(dir, 'temiz.md'), 'ders\n')
    expect(m.yedekle({ dir, sebep: 'test' }).durum).toBe('commit')
    expect(m.sonKayit(dir)?.durum).toBe('commit')
    expect(m.basarisizNeden(m.sonKayit(dir))).toBe('commit atıldı ama push düştü')
  })

  it('yaş ve bekleyen: son commit yaşı sn olarak ölçülür, izlenmeyen md bekleyen sayılır', () => {
    const ct = Number(git(dir, 'log', '-1', '--format=%ct'))
    expect(m.yedekYasiSn(dir, ct + 4000)).toBe(4000)
    expect(m.yedekYasiSn(path.join(dir, 'yok'), ct)).toBeNull()
    expect(m.bekleyenVar(dir)).toBe(false)
    fs.writeFileSync(path.join(dir, 'yeni.md'), 'x\n')
    expect(m.bekleyenVar(dir)).toBe(true)
    fs.rmSync(path.join(dir, 'yeni.md'))
    fs.writeFileSync(path.join(dir, 'ilgisiz.txt'), 'x\n')
    expect(m.bekleyenVar(dir)).toBe(false)
  })

  it('karar: PreCompact her zaman yedekler; eşik ve bekleyen şartı; deneme aralığı', () => {
    const k = (o: Partial<Parameters<Modul['karar']>[0]>) =>
      m.karar({ olay: 'UserPromptSubmit', yasSn: 5000, bekleyen: true, sonDenemeYasSn: null, ...o })
    expect(k({ olay: 'PreCompact', yasSn: 1, bekleyen: false }).yedekle).toBe(true)
    expect(k({}).yedekle).toBe(true)
    expect(k({}).satir).toContain('⚠HAFIZA YEDEK')
    expect(k({ yasSn: m.ESIK_SN }).yedekle).toBe(false) // eşik tam sınır: ">" 3600
    expect(k({ yasSn: m.ESIK_SN + 1 }).yedekle).toBe(true)
    expect(k({ bekleyen: false }).yedekle).toBe(false)
    expect(k({ bekleyen: false }).satir).toBeNull()
    expect(k({ sonDenemeYasSn: 60 }).yedekle).toBe(false)
    expect(k({ sonDenemeYasSn: m.DENEME_ARALIGI_SN }).yedekle).toBe(true)
    expect(k({ yasSn: null }).yedekle).toBe(false)
    expect(k({ olay: 'Stop' }).yedekle).toBe(false)
  })

  it('SessionStart yaş satırını HER ZAMAN söyler (bekleyen yokken de)', () => {
    const r = m.karar({ olay: 'SessionStart', yasSn: 120, bekleyen: false, sonDenemeYasSn: null })
    expect(r.satir).toContain('son commit 2 dk önce')
    expect(r.satir).toContain('bekleyen değişiklik yok')
    expect(r.yedekle).toBe(false)
    // Eski commit olsa bile bekleyen yoksa arka plan yedeği BAŞLAMAZ (yedeklenecek bir şey yok).
    const eskiAmaTemiz = m.karar({ olay: 'SessionStart', yasSn: 9000, bekleyen: false, sonDenemeYasSn: null })
    expect(eskiAmaTemiz.yedekle).toBe(false)
    expect(eskiAmaTemiz.satir).toContain('150 dk')
    const eskiVeBekleyen = m.karar({ olay: 'SessionStart', yasSn: 9000, bekleyen: true, sonDenemeYasSn: null })
    expect(eskiVeBekleyen.yedekle).toBe(true)
    expect(eskiVeBekleyen.satir).toContain('⚠')
  })

  it('kancaKos PreCompact: elde yedek alır ve sessizdir', () => {
    fs.writeFileSync(path.join(dir, 'compact-oncesi.md'), 'kayboldu mu\n')
    const once = commitSayisi(dir)
    const r = m.kancaKos({ hook_event_name: 'PreCompact' }, { dir, simdiSn: Math.floor(Date.now() / 1000) })
    expect(r.cikti).toBeNull()
    expect(commitSayisi(dir)).toBe(once + 1)
  })

  it('kanca süreç olarak: hafıza dizini yoksa sessiz çıkış 0; SessionStart satır basar', () => {
    const kos = (girdi: unknown, hafiza: string) =>
      spawnSync('node', [KANCA], {
        input: JSON.stringify(girdi),
        encoding: 'utf8',
        windowsHide: true,
        env: { ...process.env, HAFIZA_DIZINI: hafiza },
      })
    const yok = kos({ hook_event_name: 'SessionStart' }, path.join(dir, 'yok-dizin'))
    expect(yok.status).toBe(0)
    expect(yok.stdout).toBe('')
    const var_ = kos({ hook_event_name: 'SessionStart' }, dir)
    expect(var_.status).toBe(0)
    const c = JSON.parse(var_.stdout) as { hookSpecificOutput: { hookEventName: string; additionalContext: string } }
    expect(c.hookSpecificOutput.hookEventName).toBe('SessionStart')
    expect(c.hookSpecificOutput.additionalContext).toContain('HAFIZA YEDEK')
    const bozuk = spawnSync('node', [KANCA], { input: '{bozuk', encoding: 'utf8', windowsHide: true })
    expect(bozuk.status).toBe(0)
  })
})

describe('INV-YEDEK-UYARI-1 · yedek-uyari.txt açılış satırı (ARC-292)', () => {
  const kos = (olay: string, env: Record<string, string>, hafiza = dir) =>
    spawnSync('node', [KANCA], {
      input: JSON.stringify({ hook_event_name: olay }),
      encoding: 'utf8',
      windowsHide: true,
      env: { ...process.env, HAFIZA_DIZINI: hafiza, ...env },
    })
  const baglam = (c: { stdout: string }) =>
    c.stdout ? (JSON.parse(c.stdout) as { hookSpecificOutput: { additionalContext: string } }).hookSpecificOutput.additionalContext : ''
  const dosya = () => path.join(dir, 'yedek-uyari.txt')

  it('dosya varsa SessionStart satırına tek satır eklenir (yalnız ilk dolu satır)', () => {
    fs.writeFileSync(dosya(), '\nUnoPIM yedeği atlandı: sürücü yok\nikinci satır\n')
    const c = baglam(kos('SessionStart', { VENTHUB_YEDEK_UYARI_DOSYA: dosya() }))
    expect(c).toContain('⚠YEDEK UYARI: UnoPIM yedeği atlandı: sürücü yok')
    expect(c).not.toContain('ikinci satır')
    expect(c).toContain('HAFIZA YEDEK')
  })
  it('hafıza dizini yokken de uyarı basar', () => {
    fs.writeFileSync(dosya(), 'yedek düştü\n')
    const c = baglam(kos('SessionStart', { VENTHUB_YEDEK_UYARI_DOSYA: dosya() }, path.join(dir, 'yok')))
    expect(c).toBe('⚠YEDEK UYARI: yedek düştü')
  })
  it('sabotaj: dosya yok / boş / okunamaz (dizin) → uyarı satırı yok, çıkış 0', () => {
    for (const yol of [path.join(dir, 'yok.txt'), dosya(), dir]) {
      if (yol === dosya()) fs.writeFileSync(yol, ' \n\n')
      const r = kos('SessionStart', { VENTHUB_YEDEK_UYARI_DOSYA: yol })
      expect(r.status).toBe(0)
      expect(baglam(r)).not.toContain('YEDEK UYARI')
    }
  })
  it('sabotaj: vana ve SessionStart dışı olaylar susar', () => {
    fs.writeFileSync(dosya(), 'yedek düştü\n')
    expect(baglam(kos('SessionStart', { VENTHUB_YEDEK_UYARI_DOSYA: dosya(), VENTHUB_YEDEK_UYARI_KAPAT: '1' }))).not.toContain('YEDEK UYARI')
    expect(baglam(kos('UserPromptSubmit', { VENTHUB_YEDEK_UYARI_DOSYA: dosya() }))).not.toContain('YEDEK UYARI')
  })
  it('sabotaj: kontrol karakterleri (ESC, U+2028) bağlama girmez', () => {
    fs.writeFileSync(dosya(), 'yedek \u001b[31mdüştü\u2028son\u0000\n')
    const satirlar = baglam(kos('SessionStart', { VENTHUB_YEDEK_UYARI_DOSYA: dosya() })).split('\n')
    const son = satirlar[satirlar.length - 1]
    expect(son).toBe('⚠YEDEK UYARI: yedek  [31mdüştü son')
     
    expect(/[\u0000-\u001f\u2028]/.test(son)).toBe(false)
  })
  it('uzun içerik 200 karaktere kırpılır', () => {
    fs.writeFileSync(dosya(), 'x'.repeat(500) + '\n')
    const satirlar = baglam(kos('SessionStart', { VENTHUB_YEDEK_UYARI_DOSYA: dosya() })).split('\n')
    expect(satirlar[satirlar.length - 1]).toBe('⚠YEDEK UYARI: ' + 'x'.repeat(200))
  })
})
