import { spawnSync } from 'node:child_process'
import fs from 'node:fs'
import os from 'node:os'
import path from 'node:path'

import { afterAll, describe, expect, it } from 'vitest'

import { BETIK, commitle, geciciDizin, geciciTemizle, git, GIZLI_AD, GIZLI_ADRES, GIZLI_BIN, GIZLI_EPOSTA, GIZLI_FIYAT, GIZLI_SON4, KANCA, kapi, kapiyiKos, KOK, sahteDepo, temizOrtam, yaz } from './depo-dokum-kapisi.yardimci'

/**
 * INV-DEPO-DOKUM-1 · UÇTAN UCA kollar (yavaş: her kol sahte git deposu kurar ve CLI/kanca süreci başlatır).
 * Hızlı birim kolları depo-dokum-kapisi.test.ts içindedir; ortak yardımcılar depo-dokum-kapisi.yardimci.ts.
 * Kapsam: CLI çıkış kodları ve çıktı (değer basmaz), YENİ NESNELER (sonradan silinen dosya, PR ara commit'i,
 * pre-push stdin'i, tavan), pre-push kancası (gerçek sh), gerçek ağaç taraması. Başlık beyanı (TETİK/YER)
 * ve dürüst sınır: depo-dokum-kapisi.test.ts başlığına bakın; bu dosya aynı sözleşmeyi paylaşır.
 */

afterAll(geciciTemizle)

// ══════════════════════════════════════════════════════════════════════════════════════════════
describe('INV-DEPO-DOKUM-1 · uçtan uca: sahte git deposunda CLI (DEĞER BASMAZ)', () => {
  it('TEMİZ depo: çıkış 0, ihlal yok, yalnız CREATE TABLE içeren migration geçer', { timeout: 60_000 }, () => {
    const d = sahteDepo({
      'README.md': '# proje',
      'package.json': '{"name":"x"}',
      'veri/ornek.json': JSON.stringify({ a: 1, customer_email: '' }),
      'supabase/migrations/20260101000000_siparis.sql':
        'create table public.siparisler (id uuid primary key, customer_email text, customer_phone text, customer_name text, billing_address jsonb, shipping_address jsonb);\n',
    })
    const r = kapiyiKos(d)
    expect(r.kod, r.cikti).toBe(0)
    expect(r.cikti).toMatch(/ihlal 0/)
    expect(r.cikti).not.toContain('IHLAL')
  })

  it('R1 KIRMIZI: çıkış 1, DOSYA ADI + KURAL ADI + ALAN ADI basılır, değer BASILMAZ', { timeout: 60_000 }, () => {
    const d = sahteDepo({
      'veri/siparisler.json': JSON.stringify([{ id: 1, customer_email: GIZLI_EPOSTA, customer_name: GIZLI_AD, billing_address: { fullAddress: GIZLI_ADRES } }]),
    })
    const r = kapiyiKos(d)
    expect(r.kod).toBe(1)
    expect(r.cikti).toContain('veri/siparisler.json')
    expect(r.cikti).toContain('kisisel-alan-dolu')
    expect(r.cikti).toContain('customer_email')
    for (const deger of [GIZLI_EPOSTA, GIZLI_AD, GIZLI_ADRES, 'gizli.kisi', '7f3a']) expect(r.cikti).not.toContain(deger)
  })

  it("R2 KIRMIZI: INSERT'li SQL; değer basılmaz", { timeout: 60_000 }, () => {
    const d = sahteDepo({
      'seed/dokum.sql': `INSERT INTO public.siparisler (id, customer_email) VALUES (1, '${GIZLI_EPOSTA}');\n`,
    })
    const r = kapiyiKos(d)
    expect(r.kod).toBe(1)
    expect(r.cikti).toContain('seed/dokum.sql')
    expect(r.cikti).toContain('sql-veri-ifadesi-kisisel-alan')
    expect(r.cikti).not.toContain('gizli.kisi')
  })

  it('R3 KIRMIZI: fiyat dökümü; fiyat değeri basılmaz', { timeout: 60_000 }, () => {
    const d = sahteDepo({
      'veri/urunler.json': JSON.stringify(Array.from({ length: 6 }, (_, i) => ({ id: `p${i}`, sku: `S${i}`, price: Number(GIZLI_FIYAT) + i }))),
    })
    const r = kapiyiKos(d)
    expect(r.kod).toBe(1)
    expect(r.cikti).toContain('veri/urunler.json')
    expect(r.cikti).toContain('fiyat-dokumu')
    expect(r.cikti).not.toContain(GIZLI_FIYAT)
  })

  it('R4 KIRMIZI: yol kuralı içerikten bağımsız (boş dosya bile kırmızı)', { timeout: 60_000 }, () => {
    const d = sahteDepo({ 'docs/archive/db-backup-2026/notlar.txt': 'hiçbir şey', 'x/yedek.sql.gz': 'x' })
    const r = kapiyiKos(d)
    expect(r.kod).toBe(1)
    expect(r.cikti).toContain('docs/archive/db-backup-2026/notlar.txt')
    expect(r.cikti).toContain('x/yedek.sql.gz')
    expect(r.cikti).toContain('dokum-yolu')
  })

  it('R5 KIRMIZI: ödeme parçası; BIN ve son dört basılmaz', { timeout: 60_000 }, () => {
    const d = sahteDepo({ 'veri/yanit.json': JSON.stringify({ binNumber: GIZLI_BIN, lastFourDigits: GIZLI_SON4 }) })
    const r = kapiyiKos(d)
    expect(r.kod).toBe(1)
    expect(r.cikti).toContain('odeme-parcasi')
    expect(r.cikti).not.toContain(GIZLI_BIN)
    expect(r.cikti).not.toContain(GIZLI_SON4)
  })

  it('başlıksız CSV: ölçülemedi → çıkış 2 (ihlal DEĞİL, yeşil de DEĞİL), değer basılmaz', { timeout: 60_000 }, () => {
    const d = sahteDepo({ 'veri/d.csv': `${GIZLI_EPOSTA},Ad,5\nb@ornek.test,Ad2,6\n` })
    const r = kapiyiKos(d)
    expect(r.kod).toBe(2)
    expect(r.cikti).toContain('OLCULEMEDI')
    expect(r.cikti).toContain('veri/d.csv')
    expect(r.cikti).not.toContain('gizli.kisi')
  })

  it('ihlal + ölçülemedi birlikte: ihlal baskın (çıkış 1), ikisi de listelenir', { timeout: 60_000 }, () => {
    const d = sahteDepo({ 'veri/d.csv': 'a@ornek.test,Ad\n', 'veri/s.json': JSON.stringify({ customer_email: 'x' }) })
    const r = kapiyiKos(d)
    expect(r.kod).toBe(1)
    expect(r.cikti).toContain('IHLAL')
    expect(r.cikti).toContain('OLCULEMEDI')
  })

  it('GitHub Actions kipinde ek açıklama biçimi: dosya + kural, yine değer yok', { timeout: 60_000 }, () => {
    const d = sahteDepo({ 'veri/s.json': JSON.stringify([{ customer_email: GIZLI_EPOSTA }]) })
    const r = kapiyiKos(d, [], { GITHUB_ACTIONS: 'true' })
    expect(r.kod).toBe(1)
    expect(r.cikti).toMatch(/::error file=veri\/s\.json,title=Depo d/)
    expect(r.cikti).not.toContain('gizli.kisi')
  })

  it('ÇIKIŞ 2: git deposu olmayan dizin (ölçülemedi) — yeşil DEĞİL', { timeout: 60_000 }, () => {
    const d = geciciDizin('depo-dokum-depo-degil-')
    const r = kapiyiKos(d)
    expect(r.kod).toBe(2)
    expect(r.cikti).toContain('Çalıştırma hatası')
  })

  it('ÇIKIŞ 2: olmayan dizin, bilinmeyen argüman, eksik --kok/--yeni-nesneler/--haric değeri, --haric tek başına', { timeout: 60_000 }, () => {
    expect(kapiyiKos(path.join(os.tmpdir(), 'depo-dokum-yok-', String(process.pid))).kod).toBe(2)
    const kos = (...args: string[]) => spawnSync(process.execPath, [BETIK, ...args], { env: temizOrtam(), encoding: 'utf8', cwd: KOK }).status
    expect(kos('--bilinmeyen')).toBe(2)
    expect(kos('--kok')).toBe(2)
    expect(kos('--yeni-nesneler')).toBe(2)
    expect(kos('--haric')).toBe(2)
    expect(kos('--haric', 'HEAD')).toBe(2)
  })

  it('ÇIKIŞ 2: boş evren (hiç izlenen dosya yok) yeşil vermez', { timeout: 60_000 }, () => {
    const d = geciciDizin('depo-dokum-bos-')
    git(d, 'init', '-q')
    const r = kapiyiKos(d)
    expect(r.kod).toBe(2)
    expect(r.cikti).toContain('boş evren')
  })

  it('izlenmeyen (.gitignore ile dışlanmış) dosya taranmaz: kapı İZLENEN ağaca bakar', { timeout: 60_000 }, () => {
    const d = sahteDepo({
      '.gitignore': 'yerel/\n',
      'README.md': 'x',
      'yerel/siparisler.json': JSON.stringify([{ customer_email: GIZLI_EPOSTA }]),
    })
    const r = kapiyiKos(d)
    expect(r.kod, r.cikti).toBe(0)
  })
})

// ══════════════════════════════════════════════════════════════════════════════════════════════
describe('INV-DEPO-DOKUM-1 · YENİ NESNELER: sonradan silinen dosya, PR ara commit\'i, pre-push (bulgu 1)', () => {
  /** base commit → dal: dökümü ekle → dökümü SİL. Uçtaki ağaç TEMİZ; ara commit kirli. */
  function silinmisDokumluDepo() {
    const d = geciciDizin('depo-dokum-nesne-')
    git(d, 'init', '-q')
    yaz(d, 'README.md', '# proje')
    const taban = commitle(d, 'taban')
    yaz(d, 'veri/siparisler.json', JSON.stringify([{ id: 1, customer_email: GIZLI_EPOSTA }]))
    const dokumlu = commitle(d, 'dokum eklendi')
    fs.rmSync(path.join(d, 'veri/siparisler.json'))
    const uc = commitle(d, 'dokum silindi')
    return { d, taban, dokumlu, uc }
  }

  it('AĞAÇ taraması TEMİZ (döküm uçta silinmiş), ama --yeni-nesneler KIRMIZI: sonradan silinen dosya yakalanır', { timeout: 90_000 }, () => {
    const { d, taban, uc } = silinmisDokumluDepo()
    expect(kapiyiKos(d).kod).toBe(0)
    const r = kapiyiKos(d, ['--yeni-nesneler', uc, '--haric', taban])
    expect(r.kod).toBe(1)
    expect(r.cikti).toContain('veri/siparisler.json')
    expect(r.cikti).toContain('kisisel-alan-dolu')
    expect(r.cikti).not.toContain('gizli.kisi')
  })

  it('--yeni-nesneler: yeni nesne yoksa (uç = hariç) çıkış 0', { timeout: 90_000 }, () => {
    const { d, taban } = silinmisDokumluDepo()
    const r = kapiyiKos(d, ['--yeni-nesneler', taban, '--haric', taban])
    expect(r.kod, r.cikti).toBe(0)
    expect(r.cikti).toMatch(/0 nesne/)
  })

  it('--yeni-nesneler: yol kuralı (R4) sonradan silinmiş .zip için de çalışır', { timeout: 90_000 }, () => {
    const d = geciciDizin('depo-dokum-nesne-')
    git(d, 'init', '-q')
    yaz(d, 'README.md', '# proje')
    const taban = commitle(d, 'taban')
    yaz(d, 'yedek/arsiv.zip', 'x')
    commitle(d, 'zip eklendi')
    fs.rmSync(path.join(d, 'yedek/arsiv.zip'))
    const uc = commitle(d, 'zip silindi')
    const r = kapiyiKos(d, ['--yeni-nesneler', uc, '--haric', taban])
    expect(r.kod).toBe(1)
    expect(r.cikti).toContain('yedek/arsiv.zip')
    expect(r.cikti).toContain('dokum-yolu')
  })

  it('--yeni-nesneler: ölçülemeyen blob (başlıksız CSV) ölçülemedi → çıkış 2', { timeout: 90_000 }, () => {
    const d = geciciDizin('depo-dokum-nesne-')
    git(d, 'init', '-q')
    yaz(d, 'README.md', '# proje')
    const taban = commitle(d, 'taban')
    yaz(d, 'veri/d.csv', 'a@ornek.test,Ad\n')
    const uc = commitle(d, 'csv')
    const r = kapiyiKos(d, ['--yeni-nesneler', uc, '--haric', taban])
    expect(r.kod).toBe(2)
    expect(r.cikti).toContain('OLCULEMEDI')
  })

  it('nesne tavanı ve okuma tavanı aşılırsa FIRLATIR (çağıran çıkış 2 döner)', { timeout: 90_000 }, () => {
    const { d, taban, uc } = silinmisDokumluDepo()
    expect(() => kapi.yeniNesneleriTara({ kok: d, ucler: [uc], haric: [taban], nesneTavani: 1 })).toThrow(/tavanı aştı/)
    expect(() => kapi.yeniNesneleriTara({ kok: d, ucler: [uc], haric: [taban], okumaTavani: 1 })).toThrow(/tavanı aştı/)
  })

  it('itilecekUclar: silme satırı (0000…) ve bozuk satır atlanır, tekil uç döner', () => {
    const a = 'a'.repeat(40)
    const b = 'b'.repeat(40)
    const stdin = [`refs/heads/x ${a} refs/heads/x ${'0'.repeat(40)}`, `refs/heads/y ${a} refs/heads/y ${b}`, `(delete) ${'0'.repeat(40)} refs/heads/z ${b}`, 'bozuk', ''].join('\n')
    expect(kapi.itilecekUclar(stdin)).toEqual([a])
    expect(kapi.itilecekUclar('')).toEqual([])
  })

  it('--pre-push: uzak izleme dalında OLMAYAN nesneler taranır (sonradan silinen dahil) → çıkış 1', { timeout: 120_000 }, () => {
    const { d, taban, uc } = silinmisDokumluDepo()
    const uzak = geciciDizin('depo-dokum-uzak-')
    git(uzak, 'init', '-q', '--bare')
    git(d, 'remote', 'add', 'origin', uzak)
    git(d, 'update-ref', 'refs/heads/ana', taban)
    git(d, 'push', '-q', 'origin', 'ana')
    const stdin = `refs/heads/pr ${uc} refs/heads/pr ${'0'.repeat(40)}\n`
    const r = kapiyiKos(d, ['--pre-push'], {}, stdin)
    expect(r.kod, r.cikti).toBe(1)
    expect(r.cikti).toContain('kisisel-alan-dolu')
    expect(r.cikti).not.toContain('gizli.kisi')
  })

  it('--pre-push: nesneler zaten uzakta (remote-tracking) ise yeniden taranmaz → çıkış 0', { timeout: 120_000 }, () => {
    const { d, uc } = silinmisDokumluDepo()
    const uzak = geciciDizin('depo-dokum-uzak-')
    git(uzak, 'init', '-q', '--bare')
    git(d, 'remote', 'add', 'origin', uzak)
    git(d, 'update-ref', 'refs/heads/pr', uc)
    git(d, 'push', '-q', 'origin', 'pr')
    const stdin = `refs/heads/pr ${uc} refs/heads/pr ${'0'.repeat(40)}\n`
    const r = kapiyiKos(d, ['--pre-push'], {}, stdin)
    expect(r.kod, r.cikti).toBe(0)
  })

  it('--pre-push: silme itmesi (yalnız 0000… yerel uç) ve boş girdi → taranacak şey yok, çıkış 0', { timeout: 60_000 }, () => {
    const { d } = silinmisDokumluDepo()
    expect(kapiyiKos(d, ['--pre-push'], {}, `(delete) ${'0'.repeat(40)} refs/heads/x ${'b'.repeat(40)}\n`).kod).toBe(0)
    expect(kapiyiKos(d, ['--pre-push'], {}, '').kod).toBe(0)
  })

  /** GitHub'ın `refs/pull/N/merge` biçimi: HEAD = birleşme commit'i, HEAD^1 = taban, HEAD^2 = PR ucu. */
  function prBirlesmeDeposu() {
    const { d, taban, uc } = silinmisDokumluDepo()
    git(d, 'checkout', '-q', '--detach', taban)
    git(d, 'merge', '-q', '--no-ff', '-m', 'birlesme', uc)
    return d
  }

  it('CI (GitHub Actions pull_request, tam geçmiş, birleşme commit\'i): ara commit\'teki döküm yakalanır → çıkış 1', { timeout: 120_000 }, () => {
    const d = prBirlesmeDeposu()
    expect(kapiyiKos(d).kod).toBe(0) // yalnız ağaç taraması: PR olayı değilse temiz görünür
    const r = kapiyiKos(d, [], { GITHUB_EVENT_NAME: 'pull_request' })
    expect(r.kod, r.cikti).toBe(1)
    expect(r.cikti).toContain('veri/siparisler.json')
    expect(r.cikti).toContain('kisisel-alan-dolu')
    expect(r.cikti).not.toContain('gizli.kisi')
  })

  it('CI pull_request ama birleşme commit\'i değil (ya da sığ): ara commit taraması atlandığı SÖYLENİR, çıkış 0', { timeout: 90_000 }, () => {
    const { d } = silinmisDokumluDepo()
    const r = kapiyiKos(d, [], { GITHUB_EVENT_NAME: 'pull_request' })
    expect(r.kod, r.cikti).toBe(0)
    expect(r.cikti).toContain('ara commit taraması atlandı')
  })

  it('pull_request olmayan olayda (push) ara commit taraması YAPILMAZ', { timeout: 90_000 }, () => {
    const d = prBirlesmeDeposu()
    expect(kapiyiKos(d, [], { GITHUB_EVENT_NAME: 'push' }).kod).toBe(0)
  })
})

// ══════════════════════════════════════════════════════════════════════════════════════════════
describe('INV-DEPO-DOKUM-1 · pre-push kancası (bulgu 1)', () => {
  const kanca = () => fs.readFileSync(KANCA, 'utf8')

  it('kanca döküm kapısını --pre-push ile çağırıyor, çıkış 1 push\'u ENGELLİYOR, çıkış 2 uyarıp geçiriyor', () => {
    const k = kanca()
    expect(k.startsWith('#!/bin/sh')).toBe(true)
    expect(k).toMatch(/scripts\/security\/depo-dokum-kapisi\.cjs/)
    expect(k).toMatch(/--pre-push/)
    expect(k).toMatch(/exit 1/)
    expect(k).toMatch(/OLCULEMEDI/)
    expect(k).toMatch(/--no-verify/) // dürüst sınır kancanın kendi başlığında yazılı
    expect(k).toMatch(/scripts\/hijyen\/kapali-dal-push\.cjs/) // mevcut kapı korunuyor
  })

  /** Kancayı SAHTE depoda gerçek `sh` ile koşturur; kapı betiği yerine koşulan taslak çıkış kodu verir. */
  function kancayiKos(kapiCikis: number | null, girdi = 'refs/heads/x aaaa refs/heads/x bbbb\n') {
    const d = geciciDizin('depo-dokum-kanca-')
    git(d, 'init', '-q')
    yaz(d, '.githooks/pre-push', kanca())
    yaz(d, 'scripts/hijyen/kapali-dal-push.cjs', "process.stdin.resume(); process.stdin.on('end', () => process.exit(0))\n")
    if (kapiCikis !== null) {
      yaz(d, 'scripts/security/depo-dokum-kapisi.cjs', `process.stdin.resume(); process.stdin.on('end', () => process.exit(${kapiCikis}))\n`)
    }
    const r = spawnSync('sh', ['.githooks/pre-push'], { cwd: d, env: temizOrtam(), encoding: 'utf8', input: girdi })
    return { kod: r.status, cikti: `${r.stdout ?? ''}${r.stderr ?? ''}` }
  }

  it('kapı çıkış 0 → kanca 0 (kapalı-dal kapısı da koşar)', { timeout: 60_000 }, () => {
    expect(kancayiKos(0).kod).toBe(0)
  })

  it('kapı çıkış 1 → kanca 1 ve "PUSH ENGELLENDI" basar', { timeout: 60_000 }, () => {
    const r = kancayiKos(1)
    expect(r.kod).toBe(1)
    expect(r.cikti).toContain('PUSH ENGELLENDI')
  })

  it('kapı çıkış 2 (ölçülemedi) → kanca 0 ama YÜKSEK SESLE uyarır', { timeout: 60_000 }, () => {
    const r = kancayiKos(2)
    expect(r.kod).toBe(0)
    expect(r.cikti).toContain('UYARI')
    expect(r.cikti).toContain('OLCULEMEDI')
  })

  it('kapı betiği yoksa kanca geçer (kapalı-dal kapısına düşer)', { timeout: 60_000 }, () => {
    expect(kancayiKos(null).kod).toBe(0)
  })

  it('stdin kapıya ve kapalı-dal kapısına BİR KEZ okunup İKİSİNE de verilir', { timeout: 60_000 }, () => {
    const d = geciciDizin('depo-dokum-kanca-')
    git(d, 'init', '-q')
    yaz(d, '.githooks/pre-push', kanca())
    const kayit = (ad: string) => `require('node:fs').writeFileSync(${JSON.stringify(path.join(d, ad))}, require('node:fs').readFileSync(0, 'utf8'))\n`
    yaz(d, 'scripts/hijyen/kapali-dal-push.cjs', kayit('kapali.txt'))
    yaz(d, 'scripts/security/depo-dokum-kapisi.cjs', kayit('dokum.txt'))
    const girdi = 'refs/heads/x aaaa refs/heads/x bbbb\nrefs/heads/y cccc refs/heads/y dddd\n'
    const r = spawnSync('sh', ['.githooks/pre-push'], { cwd: d, env: temizOrtam(), encoding: 'utf8', input: girdi })
    expect(r.status).toBe(0)
    expect(fs.readFileSync(path.join(d, 'dokum.txt'), 'utf8').trim()).toBe(girdi.trim())
    expect(fs.readFileSync(path.join(d, 'kapali.txt'), 'utf8').trim()).toBe(girdi.trim())
  })
})

// ══════════════════════════════════════════════════════════════════════════════════════════════
describe('INV-DEPO-DOKUM-1 · GERÇEK AĞAÇ taraması', () => {
  it('izlenen ağaç YEŞİL ve evren BOŞ DEĞİL', { timeout: 120_000 }, () => {
    const r = kapiyiKos(KOK)
    expect(r.kod, `kapı kırmızı:\n${r.cikti}`).toBe(0)
    const m = /(\d+) izlenen dosya, (\d+) veri dosyası tarandı/.exec(r.cikti)
    expect(m, 'özet satırı yok').not.toBeNull()
    // Kanarya: boş evren geçerli ölçüm değildir. Gerçek ağaçta binlerce dosya, yüzlerce veri dosyası var.
    expect(Number(m?.[1])).toBeGreaterThan(1000)
    expect(Number(m?.[2])).toBeGreaterThan(200)
  })

  it('gerçek ağaçta döküm yolu kalıplı (R4) izlenen dosya YOK; izin listesindekiler dışında R5/R6 isabeti de yok', { timeout: 120_000 }, () => {
    const izlenen = (spawnSync('git', ['ls-files', '-z'], { cwd: KOK, env: temizOrtam(), encoding: 'utf8', maxBuffer: 256 * 1024 * 1024 }).stdout ?? '')
      .split('\0')
      .filter(Boolean)
    expect(izlenen.filter((y) => kapi.yolIhlali(y).length > 0)).toEqual([])
  })
})
