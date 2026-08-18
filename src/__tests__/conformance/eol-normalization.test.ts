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
 *  1. `.archive/` — dokunulmayan arşiv. **DÜZELTME (2026-08-17, ölçüldü):** bu satır önce
 *     "buradaki 40 `.ps1` `w/-text` olduğu için zaten kapsam dışı" diyordu; YANLIŞTI.
 *     Gerçek ölçüm (`git ls-files --eol -- .archive`): 40 dosya `i/crlf w/crlf` · 67 dosya
 *     `i/lf w/crlf` · 1 dosya `i/-text w/-text`. O 40 `.ps1` **`w/-text` DEĞİL**; onları
 *     kapsam dışında tutan tek şey bu önek muafiyetidir — yani YÜK TAŞIYAN bir muafiyet,
 *     kaldıran 40 kırmızı görür. Yanlış gerekçe koda yazılınca kalıcı olur ve sonradan
 *     okuyanı "bu muafiyet gereksiz" diye yanıltır; aşağıdaki test gerçeği kilitliyor.
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

/**
 * Ölçüm TEK KEZ yapılır ve üç iddia arasında paylaşılır.
 *
 * NİÇİN: bu dosya 2026-08-17'de iki ayrı oturumda tam-takım koşumunda kırmızı yandı, izole
 * koşumda ve ikinci tam koşumda yeşil kaldı. "flake" denip geçilmemesi gerekiyordu, çünkü
 * bir kapının rastgele kırmızı yanması tüm filoda `--no-verify` alışkanlığı doğurur.
 *
 * ÖLÇÜLEN VE ÇÜRÜTÜLEN HİPOTEZLER (kayda geçsin, biri tekrar denemesin):
 *  · "Paralel git süreçleri index kilidinde yarışıyor" → 20 paralel okuyucu + 20 eşzamanlı
 *    `update-index --refresh`: okuyucuların 20/20'si exit 0, çıktı satır sayısı bit-bit aynı,
 *    kirli liste hepsinde boş.
 *  · "Çalışma kopyasına CRLF yazılması `i/` kolonunu kirletiyor" → temiz bir scratch repoda
 *    ölçüldü: diskteki CRLF `i/`'ye SIZMIYOR (`i/lf w/crlf` kalıyor, refresh sonrası da).
 *    Eksik dosya `i/lf w/`, yarım/NUL'lu yazım `i/lf w/-text` verir — ikisi de kırmızı yapmaz.
 *  · "Çakışma çözümünde `--theirs` + `add` CRLF'i stage ediyor" → `git add` check-in
 *    normalizasyonunu uyguluyor, sonuç `i/lf`. Bu yol da kirletmiyor.
 *  · GERÇEKTEN kirletebilen tek yol: index'e CRLF blob girmesi — ki #589 ÖNCESİ doğmuş bir
 *    dalda index zaten öyledir (labda ölçüldü). Ama flake'i bildiren dört dal da #589'u
 *    12:45'te almıştı, kırmızılar 17:10'daydı. Yani o da açıklamıyor.
 *
 * KÖK SEBEP HÂLÂ KANITLI DEĞİL. Bu yüzden buradaki değişiklik bir "düzeltme" değil
 * ENSTRÜMANTASYONDUR: (a) üç süreç yerine tek süreç — maruziyeti azaltır, (b) ölçümün
 * kendisi başarısız olursa bu KENDİ dalında, git'in çıkış kodu ve stderr'i ile bildirilir.
 * Böylece bir sonraki kırmızı "sebebini kendisi söyleyen" bir kırmızı olur; şu an elimizde
 * yalnız "kırmızıydı" bilgisi var ve arama alanını daraltan hiçbir kayıt yok.
 *
 * Muafiyet YOK: ölçüm yapılamadıysa test GEÇMEZ (bkz. no-grace-mode kuralı). Tekrar da
 * denenmez — retry gerçek bir ihlali maskeleyebilir.
 */
let onbellek: { kayitlar: EolKaydi[] } | { hata: string } | null = null

function eolKayitlari(): EolKaydi[] {
  if (onbellek && 'kayitlar' in onbellek) return onbellek.kayitlar
  if (onbellek && 'hata' in onbellek) throw new Error(onbellek.hata)

  let ham: string
  try {
    ham = execFileSync('git', ['ls-files', '--eol'], {
      encoding: 'utf8',
      maxBuffer: 40 * 1024 * 1024,
    })
  } catch (e) {
    const f = e as { status?: number; stderr?: string; message?: string }
    const mesaj =
      'ÖLÇÜM YAPILAMADI (ihlal bulundu DEĞİL): "git ls-files --eol" başarısız oldu.\n' +
      `  çıkış kodu: ${f.status ?? '(yok)'}\n` +
      `  git stderr : ${(f.stderr ?? '').trim() || '(boş)'}\n` +
      `  hata       : ${(f.message ?? '').split('\n')[0]}\n` +
      'Bu satırı gördüysen INV-EOL-1 flake\'inin kök sebebi BUDUR — mesajı olduğu gibi ' +
      'ALTYAPI şeridine ilet. Ölçemediği hâlde geçen bir kapı yoktur (fail-open yasak).'
    onbellek = { hata: mesaj }
    throw new Error(mesaj)
  }

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
  onbellek = { kayitlar }
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

  it('.archive/ muafiyeti YÜK TAŞIYOR — gerekçesi ölçümle sabit', () => {
    // Bu test bir İHLALİ değil, muafiyetin GEREKÇESİNİ kilitliyor. Dosya başındaki yorum
    // uzun süre ".archive'daki .ps1'ler w/-text olduğu için zaten kapsam dışı" diyordu ve bu
    // yanlıştı — yani muafiyet kaldırılsa 40 dosya kırmızı yanacaktı, oysa yorumu okuyan
    // "gereksiz, kaldırabilirim" sonucuna varırdı. Ölçüm gerçeği söylüyor.
    const arsiv = eolKayitlari().filter(k => k.yol.startsWith('.archive/'))
    expect(arsiv.length, '.archive/ altında hiç izlenen dosya yok — ölçüm yolu bozulmuş olabilir').toBeGreaterThan(0)

    const gizlenen = arsiv.filter(k => k.index === 'i/crlf' && k.worktree !== 'w/-text')
    expect(
      gizlenen.length,
      'İYİ HABER olabilir: .archive/ altında artık "i/crlf" dosya YOK. Öyleyse bu önek ' +
        'muafiyeti gereksizleşti — MUAF_ONEKLER listesinden çıkar ve bu testi sil. ' +
        'Muafiyeti gerekçesiz taşımak, ileride oraya giren gerçek bir ihlali gizler.',
    ).toBeGreaterThan(0)

    // Yanlış gerekçeyi bir daha yazmamak için: bu dosyalar w/-text DEĞİL.
    expect(
      gizlenen.filter(k => k.worktree === 'w/-text').length,
      'ölçüm çelişkili: filtre w/-text olmayanları seçti ama içinde w/-text var',
    ).toBe(0)
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
