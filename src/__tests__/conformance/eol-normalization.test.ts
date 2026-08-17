import { execFileSync } from 'node:child_process'

import { describe, expect, it } from 'vitest'

/**
 * INV-EOL-1 · Satır-sonu fantomu geri gelmesin (T017-VH).
 *
 * NİÇİN VAR: 2026-08-17'ye kadar depoda 113 dosyanın index'i CRLF idi. `.gitattributes`
 * `*.md text` diyor, yani git check-in'de LF'e normalize eder — sonuç: çalışma kopyası
 * **sonsuza dek** "modified" görünüyordu. `git checkout -- <dosya>` bile temizlemiyordu,
 * çünkü fark checkout'un KENDİSİNDEN doğuyordu (kendi kendini düzeltmeyen kararlı durum).
 * Bedeli görünürdü: pull/merge/dal-değiştirme bloklanıyor, herkes stash atarak aşıyor
 * (15+ birikmiş stash), ana çalışma dizini günlerce master'a çıkamıyor.
 *
 * ÖLÇÜM ARACI — `git ls-files --eol`, `git grep` DEĞİL:
 * İlk sürümde `git grep -I -l $'\r' HEAD` kullandım ve **yanlıştı**: o, satır sonu olmayan
 * gömülü tek CR'ları da sayıyor (üretilmiş companion `.md`'lerin içindeki kod parçacıklarında
 * var, 19 dosya) ve bunlar fantom ÜRETMİYOR. `ls-files --eol` index'i (`i/`) ve çalışma
 * kopyasını (`w/`) ayrı ayrı söyler; aradığımız koşul tam olarak "index CRLF".
 *
 * MUAFİYET ADLA (geniş kaçış deliği YOK):
 *  1. `.archive/` — dokunulmayan arşiv. Buradaki 40 `.ps1` git tarafından çalışma
 *     kopyasında **metin olarak algılanmıyor** (`w/-text`), bu yüzden dönüştürülmüyor ve
 *     fantom da üretmiyorlar. Normalize edilemezler; kapsam dışıdırlar.
 *  2. `w/-text` — çalışma kopyası binary algılanan her dosya. Dönüşüm uygulanmadığı için
 *     yapısal olarak fantom üretemez.
 *
 * NOT: `.ps1`/`.bat`/`.cmd` burada muaf DEĞİL. Onlar `.gitattributes`'ta `text eol=crlf`
 * ile beyan edildi → index LF, diske CRLF. Yani Windows betiği CRLF'ini korur AMA index
 * temiz kalır. Doğru durum `i/lf w/crlf`'tir.
 */

const MUAF_ONEKLER = ['.archive/']

interface EolKaydi {
  index: string
  worktree: string
  yol: string
}

function eolKayitlari(): EolKaydi[] {
  const ham = execFileSync('git', ['ls-files', '--eol'], {
    encoding: 'utf8',
    maxBuffer: 40 * 1024 * 1024,
  })
  const kayitlar: EolKaydi[] = []
  for (const satir of ham.split('\n')) {
    if (!satir.trim()) continue
    // Biçim: "i/lf    w/crlf  attr/text eol=crlf    \t<yol>"
    const [solTaraf, yol] = satir.split('\t')
    if (!yol) continue
    const parcalar = solTaraf.trim().split(/\s+/)
    const index = parcalar.find(p => p.startsWith('i/')) ?? ''
    const worktree = parcalar.find(p => p.startsWith('w/')) ?? ''
    kayitlar.push({ index, worktree, yol: yol.trim() })
  }
  return kayitlar
}

describe('INV-EOL-1 · index satır sonu', () => {
  it('hiçbir izlenen metin dosyasının index\'i CRLF olmamalı', () => {
    const kayitlar = eolKayitlari()
    const kirli = kayitlar
      .filter(k => k.index === 'i/crlf')
      .filter(k => k.worktree !== 'w/-text') // binary algılanan dosya fantom üretemez
      .filter(k => !MUAF_ONEKLER.some(onek => k.yol.startsWith(onek)))
      .map(k => k.yol)

    expect(
      kirli,
      `Bu dosyaların INDEX'i CRLF. Sonucu: git onları sonsuza dek "modified" gösterir, ` +
        `"git checkout --" temizlemez ve pull/merge/dal-değiştirme BLOKLANIR ` +
        `(2026-08-17 öncesi 113 dosya böyleydi; ana dizin günlerce master'a çıkamadı).\n` +
        `ÇÖZÜM: git add --renormalize <dosya> && commit.\n` +
        `İçeriğin DEĞİŞMEDİĞİNİ doğrula: git diff --cached --ignore-all-space (boş çıkmalı).\n` +
        `Windows betiği (.ps1/.bat/.cmd) ekliyorsan .gitattributes'ta "text eol=crlf" zaten ` +
        `beyan edilmiş; renormalize yeter — doğru sonuç "i/lf w/crlf".\n` +
        `Kirli dosyalar:\n  ${kirli.join('\n  ')}`,
    ).toEqual([])
  })

  it('Windows betikleri CRLF\'ini KORUYOR (aşırı-düzeltme koruması)', () => {
    // Fantomu kapatmak adına .ps1'leri diske LF yazmaya başlamak REGRESYON olur.
    // Doğru durum: index LF (temiz) + çalışma kopyası CRLF (Windows mutlu).
    const betikler = eolKayitlari().filter(
      k => /\.(ps1|bat|cmd)$/i.test(k.yol) && !MUAF_ONEKLER.some(o => k.yol.startsWith(o)),
    )
    expect(betikler.length, 'hiç .ps1/.bat/.cmd bulunamadı — ölçüm yolu bozulmuş olabilir').toBeGreaterThan(0)

    const yanlisEol = betikler.filter(k => k.worktree === 'w/lf').map(k => k.yol)
    expect(
      yanlisEol,
      'Bu Windows betikleri çalışma kopyasında LF ile duruyor. .gitattributes\'taki ' +
        '"*.ps1 text eol=crlf" beyanı kaldırılmış/bozulmuş olabilir; bazı Windows kabukları ' +
        've imza doğrulamaları CRLF bekler.\n  ' + yanlisEol.join('\n  '),
    ).toEqual([])
  })

  it('ölçüm aracı GERÇEKTEN çalışıyor (vacuous-pass koruması)', () => {
    // En büyük risk bu testin sessizce "hep yeşil" olması: `ls-files --eol` çıktı biçimi
    // değişirse veya ayrıştırma bozulursa yukarıdaki iddialar HİÇBİR ŞEY ölçmeden geçer.
    const kayitlar = eolKayitlari()
    expect(kayitlar.length, 'ls-files --eol hiç kayıt döndürmedi → ayrıştırma bozuk').toBeGreaterThan(500)
    expect(
      kayitlar.filter(k => k.index === 'i/lf').length,
      'hiçbir dosyanın index\'i i/lf değil → alan ayrıştırması bozuk (biçim değişmiş olabilir)',
    ).toBeGreaterThan(100)
  })
})
