import { execFileSync } from 'node:child_process'

import { describe, expect, it, vi } from 'vitest'

/**
 * AĞIR-SINIF ZAMAN AŞIMI EŞİĞİ — 60 sn (global varsayılan 20 sn, `vitest.config.ts`).
 *
 * ⭐BU DOSYA SINIFIN ÖLÇÜM KAYNAĞIDIR. 2026-08-30: boş makinede gövde **1,47 sn**, ama filo
 * yükü altında (aynı makinede ikinci bir tam takım + `pnpm install`) **39,9 sn** ölçüldü ve
 * 20 sn'de kesildi — yani **~27× amplifikasyon**. Kırmızı bir assertion değil, ZAMAN AŞIMIYDI.
 * ÜRÜN aynı olguyu bağımsız olarak, farklı ağaç ve dalda doğruladı.
 *
 * 27× çarpanı işte bu tek gözlemden gelir; sınıfın diğer dosyalarındaki eşik bu sayıya
 * dayanır. **60 sn'yi aşan bir kırmızı GERÇEK aşımdır.**
 * Adı konmuş artık risk: `docs/standards/fleet-mechanism-standard.md` §13.
 */
vi.setConfig({ testTimeout: 60_000 })

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
 *     yapısal olarak fantom üretemez. **ÖLÇÜLDÜ (2026-08-18, AUTH bildirdi + doğrulandı):
 *     bu muafiyet şu an SIFIR dosya kapsıyor** — `i/crlf` olup `w/-text` olan dosya yok
 *     (40 arşiv `.ps1`'in hepsi `i/crlf w/crlf`, onları dışarıda tutan şey 1. maddedeki
 *     önek). Yani madde ÖLÜ bir dal. KALDIRMADIM çünkü davranışı doğru: yarın index'i CRLF
 *     olan gerçek bir binary eklenirse onu ihlal saymak YANLIŞ olurdu. Ama "yük taşıyor"
 *     sanılmasın — 1. madde ile karıştırılırsa biri onu gereksiz görüp SİLER ve 40 kırmızı
 *     alır (o muafiyet YÜK TAŞIYOR, bu taşımıyor).
 *
 * ⚠ BU BEKÇİ CANLI GİT DURUMUNU OKUR — YANLIŞ-KIRMIZI ÜRETEBİLİR (I18N-SWEEP bildirdi,
 * 2026-08-18). `git ls-files --eol` **çalışılan kopyanın index'ini** okur, depoyu değil.
 * Yani `git add --renormalize` gibi bir komut koşulduktan sonra (henüz commit'lenmeden)
 * bu test GERÇEK bir AssertionError verir ama ihlal DEPODA yoktur, yalnız o oturumun lokal
 * index'indedir. "Bir turda kırmızı, bir turda yeşil" deseninin bir açıklaması da budur.
 * Kırmızı görürsen ilk ölçüm: `git status --short` ile lokal index'in temiz olduğunu
 * doğrula, sonra TEMİZ bir klonda tekrar koş. Yanlış-kırmızı da bir kusurdur; bu satır o
 * yüzden burada.
 *
 * NOT: `.ps1`/`.bat`/`.cmd` burada muaf DEĞİL. Onlar `.gitattributes`'ta `text eol=crlf`
 * ile beyan edildi → index LF, diske CRLF. Yani Windows betiği CRLF'ini korur AMA index
 * temiz kalır. Doğru durum `i/lf w/crlf`'tir.
 */

/**
 * MUAFİYET LİSTESİ BOŞ — ve bu bir eksiklik değil, kapanmış bir borç (2026-08-28, REC-84).
 *
 * Burada `.archive/` vardı ve dosya başındaki yorum onu "YÜK TAŞIYOR: kaldıran 40 kırmızı
 * görür" diye kilitlemişti. Doğruydu: o 40 dosya (36 `.ps1` + 4 `.bat`) `i/crlf w/crlf` idi
 * ve muafiyet kaldırılsa kapı haklı olarak kırmızı yanacaktı. Muafiyeti kaldırmak için
 * VERİYİ düzeltmek gerekiyordu, testi değil — ki bu turda yapılan tam olarak budur:
 * `git add --renormalize .archive/legacy_superpowers_artifacts/`.
 *
 * ÖLÇÜLDÜ (commit SONRASI — commit ÖNCESİ ölçüm bu kapı için geçersizdir, aşağıdaki
 * yanlış-kırmızı notuna bakın): depoda `i/crlf` 0, `i/mixed` 0. İçerik korundu:
 * `git diff --cached -w --numstat` ile satır düzeyinde değişen 40 arşiv dosyası YOK.
 *
 * ⚠ ÖLÇÜT SEÇİMİ, aynı turda tökezleyip düzelttiğim yer: `--ignore-all-space --name-only`
 * 41 dosya listeliyor, `--numstat -w` ise yalnız 1. İkisi ZIT cevap veriyor çünkü
 * `--name-only` blob farkına bakıp dosyayı değişmiş sayıyor, hunk üretimini beklemiyor.
 * "İçerik değişmedi" iddiasının dayanağı `--numstat -w`'dir; `--name-only` ile bakan biri
 * içeriğin değiştiği sonucuna varır ve renormalize'i haksız yere geri alır.
 *
 * Bir sonraki muafiyet eklenecekse: gerekçesini ÖLÇÜMLE yaz ve yanına onu kilitleyen bir
 * test koy — kaldırılabilir hâle geldiğinde kapının kendisi haber verir. Bu turda tam
 * olarak öyle oldu: veriyi düzelttim, o test kırmızı yandı ve "artık beni sil" dedi.
 */
const MUAF_ONEKLER: string[] = []

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
  it('hiçbir izlenen metin dosyasının index\'i CRLF ya da KARISIK olmamalı', () => {
    const kayitlar = eolKayitlari()
    const kirli = kayitlar
      // `i/crlf` TEK BASINA YETMEZ - 2026-08-19'da olculdu. `git ls-files --eol` ucuncu bir
      // deger daha uretir: `i/mixed`, yani blob'un ICINDE hem CRLF hem LF satir var. Belirti
      // `i/crlf` ile BIREBIR AYNI (dosya sonsuza dek modified, `checkout --` temizlemez), ama
      // bu kapi `=== 'i/crlf'` diye baktigi icin onu HIC gormedi. Olcum: depoda 4 dosya
      // `i/mixed` idi (iki admin companion + iki i18n companion) ve tam o dort dosya aylardir
      // her git komutundan sonra kirli gorunuyordu. Kok sebep sanilan post-commit kancasi
      // DEGILDI: `git add --renormalize` diff'i SIFIRLADI, uretici hic kosmadan.
      .filter(k => k.index === 'i/crlf' || k.index === 'i/mixed')
      .filter(k => k.worktree !== 'w/-text') // binary algılanan dosya fantom üretemez
      .filter(k => !MUAF_ONEKLER.some(onek => k.yol.startsWith(onek)))
      .map(k => k.yol)

    expect(
      kirli,
      `Bu dosyaların INDEX'i CRLF ya da KARIŞIK (i/mixed). Sonucu: git onları sonsuza dek "modified" gösterir, ` +
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

  it('.archive/ artık KAPSAM İÇİNDE — muafiyet kaldırıldı, kapı orayı gerçekten görüyor', () => {
    // Buradaki eski test muafiyetin GEREKÇESİNİ kilitliyordu ve işini yaptı: veri
    // düzeltilince kırmızı yanıp "artık beni sil" dedi (2026-08-28, REC-84). Yerine bu kol
    // geldi, çünkü muafiyeti kaldırmak TEK BAŞINA yeterli değil — birisi yarın onu geri
    // ekleyebilir ya da `.archive` izlemeden düşebilir; iki hâlde de kapı sessizce daralır.
    //
    // NİÇİN AYRI KOL: ilk iddia (i/crlf yok) `.archive` hiç izlenmiyorken de YEŞİL kalır —
    // yani hiçbir şey ölçmeden geçer. Bu kol o boş-geçişi kapatıyor: hem dosyaların VAR
    // olduğunu hem muafiyet listesinin onları DIŞLAMADIĞINI ölçer.
    const arsiv = eolKayitlari().filter(k => k.yol.startsWith('.archive/'))
    expect(
      arsiv.length,
      '.archive/ altında hiç izlenen dosya yok — ya arşiv silindi ya ölçüm yolu bozuldu. ' +
        'Her iki hâlde de aşağıdaki "i/crlf yok" iddiası orayı ölçmediği hâlde yeşil kalır.',
    ).toBeGreaterThan(100)

    const dislanan = arsiv.filter(k => MUAF_ONEKLER.some(onek => k.yol.startsWith(onek)))
    expect(
      dislanan.map(k => k.yol),
      '.archive/ yeniden MUAF_ONEKLER kapsamına girmiş. O muafiyet 40 dosyalık gerçek bir ' +
        'ihlali gizliyordu; veri renormalize ile düzeltildi ve muafiyet KALDIRILDI. ' +
        'Geri eklemek yerine sebebi ölçün: git ls-files --eol | grep -E "^i/(crlf|mixed)".',
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
