import { spawnSync } from 'node:child_process'
import { resolve } from 'node:path'

import { describe, expect, it } from 'vitest'

import {
  anahtar,
  bagimsizOlc,
  c4EnEskiBeklenen,
  c4EsikIci,
  C5_TABAN,
  c5Kesisim,
  c5MdDisi,
  companionYolu,
  girdileriOku,
  git,
  KAPI_BASLANGIC,
  MESAJ,
  prDegisenleri,
  prKisitliSayim,
  sayac,
  TASIYICI,
  UYKUDA,
  YAS_ESIGI_GUN,
} from './companion-parity-coverage.yardimci'

/**
 * SAYAÇ MODÜLÜ — kullanıcıya görünen METİN ve panonun SAYISI buradan gelir (§26).
 *
 * NİÇİN AYRI MODÜL: C4 artık BLOKLAMIYOR, SAYIYOR (Recep kararı 2026-08-31: companion
 * üretici taşıyıcı KAPALI kalır). Sayı iki yerde gösterilecek — bu kolun çıktısında ve
 * `board.cjs yoklama` satırında. İki yere iki ayrı sayım yazmak §26'nın yasağıdır:
 * kullanıcıya görünen metin ölçütü TEKRAR ETMEZ, ondan ÜRETİLİR.
 *
 * ⭐NİÇİN TESTİN KENDİ HESABI YİNE DURUYOR (emirden bilinçli SAPMA, gerekçesi burada):
 * Emir "test ve board modülü çağırsın" diyordu; saf devretme tek uygulama bırakırdı ve
 * modül yanlış sayarsa kapı ile pano BİRLİKTE ve SESSİZCE yanlış olurdu — çapraz kontrol
 * kalmazdı. Bu depoda ölçülmüş ders şudur: paylaşılan tek ölçüt İKİ YÖNLÜ yanıltır
 * (dört ajan aynı ölçütü benimsedi, günde dört kez düzeltildi). Bu yüzden testin
 * bağımsız hesabı REFERANS olarak korunuyor ve modülle UYUŞTUĞU ölçülüyor. Modül
 * bozulursa bu kol kırmızı verir; ikisi sessizce ayrışamaz.
 * Eşik DEĞERLERİ tek kaynaktır (modülden okunur) — ayrışabilecek şey sayı değil, hesap.
 */

/**
 * INV-DOC-2 · Companion KAPSAM paritesi — eksik ve bayat companion birikmesin. PR KOLU.
 *
 * INV-DOC-1 (companion-doc-parity.test.ts) ters yönü kapatıyor: kaynağı olmayan
 * companion = ikize giden AKTİF YANLIŞ BİLGİ. Bu bekçi bu yönü kapatıyor:
 *   • C4 — kaynağı var, companion'ı YOK  → ikiz o dosyayı hiç bilmez (bilgi boşluğu)
 *   • C5 — companion var ama kaynaktan ESKİ → ikiz dosyanın eski hâlini bilir
 *
 * NİÇİN AYRI BEKÇİ VE NİÇİN ŞİMDİ MÜMKÜN:
 * Cetvelin §C3'ü bu yönü bilerek kapsam dışı bırakmıştı ve gerekçesi SAĞLAMDI:
 * companion üretimi `post-commit`te ASENKRON, dolayısıyla "her kaynağın companion'ı
 * olmalı" kuralı taze commit'lerde yanlış-kırmızı üretir. Gerekçeyi çürütmüyoruz,
 * ÖLÇTÜK (2026-08-17) ve tasarımla aşıyoruz:
 *
 *   C4 eksik companion : 36 toplam →  1 tanesi 7 günden eski
 *   C5 bayat companion : 189 toplam → 34 tanesi 7 günden eski (34'ü 30 günden de eski)
 *
 * Yani gürültünün tamamı taze pencerede. YAŞ EŞİĞİ (7 gün) asenkron üretim penceresini
 * muaf tutar; eşiğin ötesinde kalan şey artık "henüz üretilmedi" değil, GERÇEK borçtur.
 * 34 dosyanın 30 günden eski olması bunu doğruluyor — o companion'lar üretilmeyi
 * beklemiyor, unutulmuş.
 *
 * NİÇİN RATCHET (sıfır değil):
 * Mevcut borç kapatılmadan kural tam-kapalı kurulamaz; tam-kapalı kurmak bekçiyi
 * ilk günden kırmızı bırakır ve kırmızı bekçi görmezden gelinir (bu depoda yaşandı:
 * rastgele patlayan pre-commit `--no-verify` alışkanlığı doğurdu). Ratchet borcu
 * DONDURUR: yeni borç eklenemez, azalınca taban düşürülür (stale-guard bunu zorlar).
 *
 * ÖLÇÜM KAYNAĞI = GIT, disk DEĞİL.
 * INV-DOC-1'in dersi burada da geçerli: "diskten sildim/ürettim ama commit etmedim"
 * durumunda disk taraması yanlış cevap verir; ikize giden şey DEPO hâlidir. Ayrıca
 * bugün ölçüldü: 17 companion diskte güncel ama git'te eskiydi. Bu AYRIŞMA kendisi
 * bir bulgu — ama bu bekçinin sorusu değil; bu bekçi depoyu ölçer.
 *
 * KAPSAM = `.cc_docs.yaml`'ın GERÇEK kapsamı (SSOT).
 * Bekçi kendi listesini uydurmaz; yaml'ın `source_dirs` + `extra_masters` −
 * `skip_dirs` − `skip_files` kümesini uygular. Niçin kritik: ilk ölçümümde `.agent/`
 * altındaki betikleri saydım ve 84/211 çıktı — oysa `.agent` yaml'da `skip_dirs`
 * içinde, yani doküman hattı oraya hiç bakmıyor. Bekçi üreticiden FARKLI kapsam
 * kullanırsa ölçtüğü şey gerçek değildir.
 *
 * ⭐BÖLÜNDÜ (ALT-38i parça 2, OPS hükmü 2026-10-09). Karne ölçümü (docs/audits/test-karnesi-2026-10-09.json, CI
 * geçmişi 2026-07-06..10-07): bu dosya 13 kırmızı koşuda, 10 farklı dalda kırmızı verdi; 7'si dünya olayı
 * kümesinde (aynı test ≥3 dalda 12 saat içinde), 6'sı izole (PR'ın kendi hatası). Sebep: C4/C5 TAM sayımı ve
 * "taze bulgu > 0" ile "tarihsel borç > 0" kolları SAATE ve dokunulmamış kaynakların takvimle olgunlaşan
 * borcuna bağlı; suçsuz PR'ın yazarı bunu düzeltemez. Dosya iki kola ayrıldı, ölçüm kodu ortak yardımcıda
 * (`companion-parity-coverage.yardimci.ts`, kopya yok):
 *
 *   PR KOLU (bu dosya, PR kapısında KALIR): ÖNKOŞUL (tam git geçmişi), C4 ve C5 tutarlılık denetimleri (ayrı `it`ler),
 *     SAYIM AYIRT EDER, TEK KAYNAK, pano satırı, ratchet (C5_TABAN=0), vacuous kapsam; ve ⭐PR-KISITLI C4/C5 BLOK:
 *     yalnız PR'ın DEĞİŞTİRDİĞİ kaynaklar sayılır (modülün `sayimCekirdegi`si daraltılmış girdiyle çağrılır; modül
 *     tek kaynak kalır), taşıyıcı AÇIK iken bloklar. Yani PR'ın kendi bıraktığı eksik/bayat companion, PR'ın
 *     kendi kapısında kırmızı verir.
 *   DÜNYA KOLU (`companion-parity-coverage-dunya.test.ts`, master push + zamanlı koşu): C4 ve C5 TAM blok,
 *     tarihsel borç görünürlüğü, uyku kipi anahtarı, "yaş eşiği iş görüyor". Taşıyıcı anahtarını ya da okuyucusunu
 *     değiştiren PR'da (`yolFiltresi`, scripts/ci/dunya-durumu-testleri.json) bu kol PR kapısında da koşar.
 *
 * FAIL-CLOSED: PR'ın değişen dosya listesi okunamazsa (`prDegisenleri() === null`) PR-kısıtlı kollar TAM sayıma
 * düşer; "ölçemedim" asla "dokunulmadı"ya çevrilmez. Boş küme yalnız "liste okundu ve hiçbir kaynağa dokunulmadı"
 * iken oluşur.
 */

/**
 * ÖLÇÜM ÖNKOŞULU: TAM GİT GEÇMİŞİ.
 *
 * Bu bekçi yaşı `git log` üzerinden hesaplıyor. Sığ (shallow) bir klonda `git log`
 * yalnız son commit(ler)i görür, tarih haritası boşalır ve bekçi SESSİZCE yanlış
 * ölçer. 2026-08-17'de tam bu yaşandı: `actions/checkout@v4` `fetch-depth`
 * belirtilmediği için varsayılan **1** ile çalışıyor: CI'da C4 borcu **0** göründü,
 * oysa tam geçmişte **1**. Kapı yeşil kalsaydı hiç ölçmediği hâlde "geçti" derdi —
 * kendi stale-guard'ı yakaladığı için fark edildi.
 *
 * AYNI TUZAĞA BEN DE DÜŞTÜM: ara ölçümde `git merge --no-commit` ile ağacı birleştirip
 * C4=8 okudum ve bunu gerçek sandım. Ağaç birleşmişti ama GEÇMİŞ birleşmemişti, yani
 * master'ın commit tarihleri haritada yoktu ve o 7 taze dosya "tarihsiz = çok eski"
 * sayıldı. Gerçek merge sonrası sayı 1'e döndü. Ders: yaş ölçen bir bekçi için
 * "hangi dosyalar var" ile "hangi commit'ler görünüyor" AYRI sorulardır.
 *
 * Bu yüzden önkoşul AÇIKÇA doğrulanıyor ve karşılanmıyorsa test KIRMIZI olur.
 * "Ölçemedim, o hâlde geçtim" (fail-open / uyar-geç modu) bu depoda yasak: yeni
 * kapıya muafiyet tanımak kapıyı dekoratif yapar. Çözüm testte değil CI'da:
 * checkout adımına `fetch-depth: 0`.
 */
const ASGARI_COMMIT_SAYISI = 50

/** Aynı dosyadaki tüm hesaplar AYNI saati kullanır (gece yarısı sınırında iki ayrı `new Date()` ayrışırdı). */
const BUGUN = new Date()

describe('INV-DOC-2 · companion kapsam paritesi', () => {
  const g = girdileriOku()
  const b = bagimsizOlc(g, BUGUN)
  /** PR'ın değişen dosyaları (kanonik); `null` = okunamadı. Tek okuma: tüm PR-kısıtlı kollar aynı listeyi görür. */
  const degisen = prDegisenleri()
  const pr = prKisitliSayim({ ...g, degisen, bugun: BUGUN })
  const prKapsamSatiri = pr.tam
    ? 'PR değişen dosya listesi OKUNAMADI: TAM sayım (fail-closed, daraltma yapılmadı)'
    : `PR ${(degisen ?? []).length} dosyaya dokundu; bunların ${pr.prKaynak}'ı kapsamdaki kaynak`

  let modulOnbellek: ReturnType<typeof sayac.olc> | null = null
  /** Modülün TAM sayımı (tek kez, testle aynı saat). */
  const modul = () => (modulOnbellek ??= sayac.olc({ bugun: BUGUN }))

  it('ÖNKOŞUL: git geçmişi TAM (sığ klonda bu bekçi ölçemez, o hâlde geçmiş de sayılmaz)', () => {
    const sigMi = git(['rev-parse', '--is-shallow-repository']).trim() === 'true'
    const commitSayisi = git(['rev-list', '--count', 'HEAD']).trim()

    expect(
      sigMi,
      'Depo SIĞ klonlanmış (shallow). Bu bekçi yaşı `git log` ile hesaplıyor; sığ klonda ' +
      'tarih haritası boşalır ve bekçi SESSİZCE yanlış ölçer — 2026-08-17\'de yerelde 8 ' +
      'ölçülen borç CI\'da 0 göründü. ÇÖZÜM TESTTE DEĞİL CI\'DA: checkout adımına ' +
      '`fetch-depth: 0` ekle (.github/workflows/ci.yml). "Ölçemedim ama geçtim" kabul edilmez.',
    ).toBe(false)

    expect(
      Number(commitSayisi),
      `Git geçmişinde yalnız ${commitSayisi} commit görünüyor (asgari ${ASGARI_COMMIT_SAYISI}). ` +
      'Geçmiş budanmışsa yaş hesabı anlamsızdır; `fetch-depth: 0` gerekli.',
    ).toBeGreaterThan(ASGARI_COMMIT_SAYISI)
  })

  it('C4 tutarlılığı: eşik içi (taze) dosya borç listesine girmez ve enEskiYasGun listeyle uyuşur', () => {
    // BLOKLAMAYAN KOL, BOŞ KOL DEĞİLDİR: sayının kendi içinde tutarlı olduğu ölçülür.
    // Assert'i tümden silip yerine yalnız bir yazdırma koymak, kolu ÖLÇMEYEN bir şeye
    // çevirir ve biz "kapı var" sanardık — bu depoda adı konmuş sınıf. Bu tutarlılık dünya
    // durumuna bağlı DEĞİLDİR (hesabın kendi içinde bölüntü olması): PR kolunda koşar.
    const m = modul()
    expect(c4EsikIci(m), MESAJ.c4EsikIci).toEqual([])
    expect(m.enEskiYasGun, MESAJ.c4EnEski).toBe(c4EnEskiBeklenen(m))
  })

  it('C5 tutarlılığı: sınıflandırma bir BÖLÜNTÜdür (eksik ∩ bayat boş) ve listelenen her şey bir .md', () => {
    // (1) aynı dosya hem "eksik" hem "bayat" sayılamaz (sayılırsa borç iki kez raporlanır ve sayı
    //     gerçeği anlatmaz), (2) listelenen her şey gerçekten bir companion (.md) olmalı — C4/C5 karışırsa
    //     "eksik" borcu "bayat" gibi görünür ve uyanışta yanlış iş üretilir.
    expect(c5Kesisim(b), MESAJ.c5Kesisim).toEqual([])
    expect(c5MdDisi(b), MESAJ.c5MdDisi).toEqual([])
  })

  it('⭐SAYIM AYIRT EDER: companion\'sız dosya eklenince sayı ARTAR ve ad listeye girer', () => {
    // Bloklamayan bir kolun tek gerçek kanıtı budur. Fikstür ŞART: gerçek depoya dayanan
    // ölçüm "bugün sıfır" olduğunda sayacın ÇALIŞTIĞINI kanıtlamaz — sıfır, hem "borç yok"un
    // hem "sayaç ölü"nün cevabıdır. Ayırt etmeyen gösterge ölçüm değildir.
    const kapsam = {
      koklerRecursive: ['src'],
      skipDirs: new Set<string>(),
      skipBasenames: new Set<string>(),
    }
    const bugun = new Date('2026-09-03T00:00:00Z')
    const eski = '2026-08-20' // demir sonrası VE eşiği aşmış (14 gün)

    const taban = sayac.sayimCekirdegi({
      izlenen: ['src/a/Var.tsx', 'src/a/Var.md'],
      kapsam,
      tarihler: new Map([['src/a/Var.tsx', eski], ['src/a/Var.md', eski]]),
      bugun,
      yasEsigiGun: YAS_ESIGI_GUN,
      kapiBaslangici: KAPI_BASLANGIC,
    })
    expect(taban.eksik.length, 'FİKSTÜR ÖNKOŞULU: companion\'ı OLAN dosya borç sayılmamalı').toBe(0)

    const sonra = sayac.sayimCekirdegi({
      izlenen: ['src/a/Var.tsx', 'src/a/Var.md', 'src/a/Yok.tsx'],
      kapsam,
      tarihler: new Map([
        ['src/a/Var.tsx', eski], ['src/a/Var.md', eski], ['src/a/Yok.tsx', eski],
      ]),
      bugun,
      yasEsigiGun: YAS_ESIGI_GUN,
      kapiBaslangici: KAPI_BASLANGIC,
    })
    expect(
      sonra.eksik.length,
      'Companion\'sız ESKİ dosya eklendi ama sayı ARTMADI — sayaç ölü. Bloklamayan kolun tüm ' +
      'değeri sayının ayırt etmesindedir; ayırt etmeyen sayı rapor değil dekordur.',
    ).toBe(taban.eksik.length + 1)
    expect(
      sonra.eksik.map(e => e.yol),
      'Sayı arttı ama AD listede yok — "N dosya" demek ama hangileri olduğunu söylememek ' +
      'borcu kapatılamaz kılar.',
    ).toContain('src/a/Yok.tsx')
    expect(sonra.enEskiYasGun, 'en eski yaş hesaplanmadı').toBe(14)

    // TERS YÖN — muafiyet CANLI mı: eşik İÇİ (taze) companion'sız dosya borç SAYILMAZ.
    // Bu kol olmasa "her şeyi borç sayan" bir sayaç da yukarıdaki iddiaları geçerdi.
    const taze = sayac.sayimCekirdegi({
      izlenen: ['src/a/Yeni.tsx'],
      kapsam,
      tarihler: new Map([['src/a/Yeni.tsx', '2026-09-01']]), // 2 gün
      bugun,
      yasEsigiGun: YAS_ESIGI_GUN,
      kapiBaslangici: KAPI_BASLANGIC,
    })
    expect(
      taze.eksik.length,
      'Taze (eşik içi) dosya borç SAYILDI — asenkron üretim penceresi muafiyeti ölmüş; bu, ' +
      'kapının ilk günden yanlış-kırmızı üretmesine geri dönerdi.',
    ).toBe(0)
    expect(taze.eksikTaze, 'taze sayaç dolmadı — muafiyet görünmez oldu').toBe(1)
  })

  it('⭐TEK KAYNAK (§26): modülün sayısı, testin BAĞIMSIZ hesabıyla uyuşur', () => {
    // Emirdeki "test modülü çağırsın" saf devretmesinden bilinçli SAPMA (gerekçe dosya
    // başında): testin kendi hesabı REFERANS olarak duruyor. Modül bozulursa burası kırmızı
    // verir; paylaşılan TEK ölçüt iki yönlü yanıltır (bu depoda ölçülmüş ders).
    const m = modul()
    expect(
      m.eksik.map(e => e.yol).sort(),
      'Modülün C4 listesi, testin BAĞIMSIZ hesabıyla AYRIŞTI. İkisi de aynı kapsamı ' +
      '(.cc_docs.yaml SSOT) ve aynı eşiği ölçmek zorunda; ayrışma ya kapsam süzgecinde ya ' +
      'yaş hesabında kusur demektir.',
    ).toEqual([...b.eksik].sort())
    expect(
      m.bayat.slice().sort(),
      'Modülün C5 listesi testin bağımsız hesabıyla ayrıştı',
    ).toEqual([...b.bayat].sort())
    expect(
      m.kaynakSayisi,
      'Modülün kapsam EVRENİ testin evreninden farklı — biri yaml\'ı yanlış okuyor',
    ).toBe(b.kaynakSayisi)
  })

  it('⭐panodaki satır MODÜLDEN gelir, board.cjs onu YENİDEN YAZMAZ (§26)', () => {
    const kok = process.cwd()
    const board = resolve(kok, 'scripts/board/board.cjs')
    const beklenen = sayac.ozetSatiri(sayac.olc())

    /**
     * FİKSTÜR, ÖLÇÜLEN DURUMU ÜRETMEK ZORUNDA (§25 — bu tuzağa bir kez düşüldü).
     * `yoklama` panoda TALEP YOKSA "panoda talep yok" deyip ERKEN DÖNER ve alt satırların
     * hiçbirini basmaz. Gerçek panoya bakmak da olmaz: CI'da o dizin yoktur, yerelde ise
     * başka şeritlerin verisi teste sızar. Bu yüzden İZOLE bir pano dizini kurulur ve
     * içine gerçek `claim` fiiliyle bir talep yazılır.
     */
    const tmp = (
      process.env.RUNNER_TEMP || process.env.TMPDIR || process.env.TEMP || process.env.TMP || '/tmp'
    ).replace(/\\/g, '/').replace(/\/$/, '')
    const boardDir = `${tmp}/companion-sayim-yoklama-${Date.now()}-${Math.random().toString(36).slice(2)}`
    const env = { ...process.env, VENTHUB_BOARD_DIR: boardDir }
    // Sabit ve GEÇERLİ uuid: board.cjs kimliğin BİÇİMİNİ doğruluyor (INV-BOARD-3).
    const sid = '5a1c0000-1111-4222-8333-444455556666'

    const talep = spawnSync(
      process.execPath,
      [board, 'claim', '--sid', sid, '--lane', 'SAYIM-SINAMA', '--globs', 'src/sayim-sinama/**'],
      { encoding: 'utf8', cwd: kok, env, timeout: 120_000 },
    )
    expect(
      talep.status,
      `FİKSTÜR ÖNKOŞULU: claim yazılamadı (${talep.stderr || talep.stdout || talep.error?.message})`,
    ).toBe(0)

    const r = spawnSync(process.execPath, [board, 'yoklama'], {
      encoding: 'utf8', cwd: kok, env, timeout: 120_000,
    })
    expect(r.error, `board.cjs yoklama koşturulamadı: ${r.error?.message ?? ''}`).toBeUndefined()
    expect(
      r.stdout.includes('panoda talep yok'),
      'FİKSTÜR ÖNKOŞULU: yoklama erken döndü — talep yazılmamış, alt satırlar hiç basılmadı.',
    ).toBe(false)
    expect(
      r.stdout,
      'Yoklama çıktısı, sayaç modülünün ÜRETTİĞİ cümleyi birebir içermiyor. §26: kullanıcıya ' +
      'görünen metin ölçütü TEKRAR ETMEZ, ondan ÜRETİLİR. Pano kendi cümlesini yazarsa iki ' +
      'metin ayrışır ve hangisinin hüküm olduğu belirsizleşir.',
    ).toContain(beklenen)
  })

  it('ratchet geri kaymasın: tabanlar SIFIR kalmalı (yükseltmek yeni borca izin verir)', () => {
    // Sayı-tabanlı ratchet'in yerini bu aldı. Eski sürümde "borç azaldıysa tabanı düşür"
    // diyordu; taban artık 0 olduğu için düşürülecek bir şey yok — korunması gereken şey
    // tabanın YÜKSELTİLMEMESİ. Biri kırmızıyı susturmak için sayıyı büyütürse burası yanar.
    // C4_TABAN kaldırıldı (C4 artık bloklamıyor, sayıyor — gerekçe yardımcı dosyada). C4'ün
    // ratchet'inin yerini "SAYIM AYIRT EDER" kolu aldı: taban yerine sayacın canlılığı
    // korunuyor.
    //
    // ⭐C5 ARTIK KOŞULLU BLOKLAR (REC-142, Recep kararı 2026-09-05). Eski hüküm şuydu:
    // "C5 bloklamaya devam eder, çünkü çaresi taşıyıcıya bağlı değil — companion
    // silinebilir." Tek dosyada doğruydu; ÖLÇEKTE düştü: 09-05'te bloklayan 8'in
    // arkasında 7 gün penceresinde 49 tane daha vardı, yani "çare" 57 belgeyi silmek ve
    // ikizi o dosyalarda tamamen kör bırakmaktı. Recep kararı: üretim bir süre durur,
    // dönüşte kaldığımız yerden devam edilir → companion'lar YERİNDE KALIR.
    //
    // ⚠TABAN YİNE 0 VE YÜKSELTİLEMEZ: uyku kipi tabanı gevşetmez, tabanın ne zaman
    // HÜKÜM KURDUĞUNU değiştirir. Taşıyıcı açıldığı an sıfır tavan geri gelir; biri
    // uyku kipini fırsat bilip tabanı büyütürse burası yanar.
    // Sabit TEK yerde yaşar (yardımcı dosya); hem bu dosyanın PR-kısıtlı C5 kolu hem dünya kolunun TAM C5 kolu onu okur.
    expect(C5_TABAN, 'C5_TABAN yükseltilmiş — kırmızıyı susturmak için taban büyütmek, kapıyı sökmektir').toBe(0)
  })

  it('vacuous-guard: kapsam gerçekten dolu (yaml/kapsam bozulunca test sessizce yeşile kaçmasın)', () => {
    // En sinsi arıza biçimi: yaml okuması bozulur, kapsam boşalır, iki iddia da
    // "0 <= taban" ile YEŞİL kalır ve bekçi ölür. Bu iddia o yolu kapatır.
    expect(
      b.kaynakSayisi,
      `Kapsamda yalnız ${b.kaynakSayisi} kaynak dosya bulundu — .cc_docs.yaml okuması ` +
      `ya da kapsam süzgeci bozulmuş olabilir (2026-08-17'de 606 ölçüldü).`,
    ).toBeGreaterThan(400)
  })

  it('⭐PR-KISITLI KOL: yalnız companion\'ı SİLEN PR, eski kaynakta C4 üretir (denetçi Ö1, #2370); ilgisiz PR üretmez', () => {
    const kapsam = {
      koklerRecursive: ['src'],
      skipDirs: new Set<string>(),
      skipBasenames: new Set<string>(),
    }
    const bugun = new Date('2026-09-03T00:00:00Z')
    // PR `src/a/Silinen.md`'yi sildi: HEAD'de (birleşme sonrası) yok, ama değişen listede görünür (`--no-renames`).
    const izlenen = ['src/a/Silinen.tsx', 'src/a/Eski.tsx', 'src/a/Eski.md']
    const tarihler = new Map<string, string>([
      ['src/a/Silinen.tsx', '2026-08-20'], // eşiği aşmış (14 gün)
      ['src/a/Eski.tsx', '2026-08-20'],
      ['src/a/Eski.md', '2026-08-20'],
    ])
    const girdi = { izlenen, tarihler, kapsam, bugun }

    const silen = prKisitliSayim({ ...girdi, degisen: ['src/a/Silinen.md'] })
    expect(silen.tam).toBe(false)
    expect(
      silen.sayim.eksik.map(e => e.yol),
      'companion\'ı silen PR, kaynağı değişmediği için kapsam dışı kaldı: eski cetvelin C5 "çaresi" PR kapısından geçerdi',
    ).toEqual(['src/a/Silinen.tsx'])
    expect(silen.prKaynak).toBe(1)

    const ilgisiz = prKisitliSayim({ ...girdi, degisen: ['README.md'] })
    expect(ilgisiz.sayim.eksik, 'ilgisiz PR eksik üretmemeli').toEqual([])
    expect(ilgisiz.prKaynak).toBe(0)
  })

  it('⭐PR-KISITLI KOL AYIRT EDER: yalnız PR\'ın dokunduğu eski kaynak sayılır; liste okunamazsa TAM sayıma düşer', () => {
    // Fikstür ŞART: gerçek depoda PR'ın değiştirdiği kaynak her zaman TAZEDİR (son commit'i PR'ın kendisi), yani
    // PR-kısıtlı kol bugün yapısal olarak sessizdir. "Sıfır" hem "PR borç bırakmadı"nın hem "daraltma ölü"nün
    // cevabıdır; ayırt eden tek kanıt, eşiği aşmış bir kaynağın PR'a dahil/hariç olduğu fikstürdür.
    const kapsam = {
      koklerRecursive: ['src'],
      skipDirs: new Set<string>(),
      skipBasenames: new Set<string>(),
    }
    const bugun = new Date('2026-09-03T00:00:00Z')
    const eski = '2026-08-20' // demir sonrası VE eşiği aşmış (14 gün)
    const kaynaktanEski = '2026-08-19' // companion kaynaktan bir gün eski
    const taze = '2026-09-01' // 2 gün: asenkron üretim penceresinde
    const izlenen = [
      'src/a/PrEksik.tsx', // PR'ın dokunduğu, eski, companion'sız  → C4
      'src/a/BaskaEksik.tsx', // PR'ın dokunMADIĞI, eski, companion'sız → yalnız TAM sayımda görünür
      'src/a/PrBayat.tsx', 'src/a/PrBayat.md', // PR'ın dokunduğu, eski, companion kaynaktan eski → C5
      'src/a/BaskaBayat.tsx', 'src/a/BaskaBayat.md', // PR'ın dokunMADIĞI bayat çift
      'src/a/PrTaze.tsx', // PR'ın dokunduğu, TAZE, companion'sız → asenkron pencere muafiyeti
    ]
    const tarihler = new Map<string, string>([
      ['src/a/PrEksik.tsx', eski],
      ['src/a/BaskaEksik.tsx', eski],
      ['src/a/PrBayat.tsx', eski], ['src/a/PrBayat.md', kaynaktanEski],
      ['src/a/BaskaBayat.tsx', eski], ['src/a/BaskaBayat.md', kaynaktanEski],
      ['src/a/PrTaze.tsx', taze],
    ])
    const sirali = (x: string[]) => [...x].sort()
    const girdi = { izlenen, tarihler, kapsam, bugun }

    // (1) Liste OKUNAMADI (null): daraltma YOK, tüm depo sayılır. Fikstür önkoşulu: tam sayım iki eksik + iki bayat görür.
    const tam = prKisitliSayim({ ...girdi, degisen: null })
    expect(tam.tam, 'degisen=null iken TAM sayıma düşülmedi — ölçemedik ama "dokunulmadı" saydık (fail-open)').toBe(true)
    expect(sirali(tam.sayim.eksik.map(e => e.yol))).toEqual(['src/a/BaskaEksik.tsx', 'src/a/PrEksik.tsx'])
    expect(sirali(tam.sayim.bayat)).toEqual(['src/a/BaskaBayat.md', 'src/a/PrBayat.md'])

    // (2) Liste okundu, PR dört dosyaya dokundu (üçü kaynak): yalnız KENDİ eski kaynakları sayılır.
    const prDosyalari = ['src/a/PrEksik.tsx', 'src/a/PrBayat.tsx', 'src/a/PrTaze.tsx', 'README.md']
    const kisitli = prKisitliSayim({ ...girdi, degisen: prDosyalari })
    expect(kisitli.tam).toBe(false)
    expect(kisitli.prKaynak, 'PR\'ın dokunduğu kapsamdaki kaynak sayısı (README kaynak değil)').toBe(3)
    expect(
      kisitli.sayim.eksik.map(e => e.yol),
      'PR-kısıtlı C4: PR\'ın dokunduğu eski, companion\'sız kaynak listede olmalı; dokunmadığı (BaskaEksik) olmamalı',
    ).toEqual(['src/a/PrEksik.tsx'])
    expect(
      kisitli.sayim.bayat,
      'PR-kısıtlı C5: PR\'ın dokunduğu bayat çift listede olmalı; dokunmadığı (BaskaBayat) olmamalı',
    ).toEqual(['src/a/PrBayat.md'])
    expect(kisitli.sayim.eksikTaze, 'taze (eşik içi) kaynak muaf kalmalı ve görünür sayılmalı').toBe(1)
    expect(kisitli.sayim.kaynakSayisi, 'evren PR\'ın dokunduğu kaynaklara indi').toBe(3)

    // (3) PR başka bir yere dokundu: eşiği aşmış borç var ama PR'ın değil → sayım boş (SABOTAJ B'nin saf karşılığı).
    const baskaYer = prKisitliSayim({ ...girdi, degisen: ['src/a/BaskaYer.tsx'] })
    expect(baskaYer.tam).toBe(false)
    expect(baskaYer.sayim.eksik).toEqual([])
    expect(baskaYer.sayim.bayat).toEqual([])

    // (4) Liste okundu ve BOŞ ("hiçbir dosyaya dokunulmadı") ≠ liste okunamadı (null): ikisi AYRI sonuç verir.
    const bos = prKisitliSayim({ ...girdi, degisen: [] })
    expect(bos.tam, 'boş liste "okundu, dokunulmadı"dır; tam sayıma düşmemeli').toBe(false)
    expect(bos.sayim.eksik.length + bos.sayim.bayat.length).toBe(0)

    // (5) Companion'a dokunan PR (kaynağa değil) çifti KAPSAMINA alır (denetçi Ö1, #2370: silme ya da bırakma da PR'ın işidir):
    //     companion'ı tazelemiyorsa (tarihi eski kalıyorsa) çift bayat görünür; tazeliyorsa (gerçek veride güncellenen
    //     companion'ın tarihi yenidir) borç ÜRETMEZ.
    const mdyeDokunduTazelemedi = prKisitliSayim({ ...girdi, degisen: ['src/a/BaskaBayat.md'] })
    expect(mdyeDokunduTazelemedi.sayim.bayat).toEqual(['src/a/BaskaBayat.md'])
    const mdTazelendi = prKisitliSayim({
      ...girdi,
      tarihler: new Map([...tarihler, ['src/a/BaskaBayat.md', '2026-08-25']]),
      degisen: ['src/a/BaskaBayat.md'],
    })
    expect(mdTazelendi.sayim.bayat, 'companion tazelendi: borç kalmamalı').toEqual([])

    // (6) Silinen kaynak (izlenmiyor) listede olsa da sayılmaz; kapsamdaki HER kaynağa dokunan PR tam sayımla AYNI sonucu verir.
    const hepsi = prKisitliSayim({
      ...girdi,
      degisen: ['src/a/Silinmis.tsx', ...izlenen.filter(f => f.endsWith('.tsx'))],
    })
    expect(sirali(hepsi.sayim.eksik.map(e => e.yol))).toEqual(sirali(tam.sayim.eksik.map(e => e.yol)))
    expect(sirali(hepsi.sayim.bayat)).toEqual(sirali(tam.sayim.bayat))
  })

  it('C4 PR-KISITLI — PR\'ın değiştirdiği, companion\'ı olmayan ESKİ kaynak: taşıyıcı AÇIK ise bloklar, UYKUDA ise sayar', () => {
    const s = pr.sayim
    // NİÇİN `process.stdout.write`: bu dosyada `no-console` yalnız `warn`/`error`a izin
    // veriyor ve rapor bir uyarı değil. Kuralı inline kapatmak yerine gerçek mekanizma
    // kullanıldı — kural bükülmedi.
    process.stdout.write(
      `[INV-DOC-2 · C4 · PR] ${prKapsamSatiri}\n` +
      `[INV-DOC-2 · C4 · PR] ${sayac.ozetSatiri(s)}\n` +
      (s.eksik.length ? s.eksik.map(e => `  ${String(e.yasGun).padStart(5)} gün  ${e.yol}\n`).join('') : '') +
      `[INV-DOC-2 · C4 · PR] ${anahtar.durumSatiri(process.cwd())}\n` +
      `[INV-DOC-2 · C4 · PR] Bu sayı ${UYKUDA ? 'BLOKLAMAZ' : 'BLOKLAR'}. Tüm depodaki C4 borcu ` +
      `(dünya kolu: companion-parity-coverage-dunya.test.ts, master push + zamanlı) PR'ın değil takvimin ` +
      `işidir; burada yalnız PR'ın KENDİ dokunduğu kaynaklar sayılır.\n`,
    )

    // KISITLAMA GERÇEKTEN ETKİN Mİ (uyku kipinde de ölçülür — bloklamayan kol boş kol değildir):
    // evren PR'ın dokunduğu kaynaklara inmiş olmalı ve listedeki her ad PR'ın değişen listesinde olmalı.
    expect(s.kaynakSayisi, 'PR-kısıtlı evren, daraltılan kaynak sayısıyla uyuşmuyor').toBe(pr.prKaynak)
    if (!pr.tam) {
      const prKume = new Set(degisen)
      expect(
        s.eksik.map(e => e.yol).filter(y => !prKume.has(y)),
        'PR-kısıtlı C4 listesinde PR\'ın DEĞİŞTİRMEDİĞİ kaynak var — daraltma çalışmıyor; PR kendi yapmadığı borçtan sorumlu tutuluyor.',
      ).toEqual([])
    }

    if (!UYKUDA) {
      expect(
        s.eksik.length,
        `Companion'ı olmayan ${s.eksik.length} kaynak var, eşik yaşı (${YAS_ESIGI_GUN} gün) aşıldı ` +
        `ve taşıyıcı AÇIK (${TASIYICI.yol}) — companion üretilebiliyor, yani bu borç ÖDENEBİLİR ve bloklar. ` +
        `Sayım kapsamı: ${prKapsamSatiri}.\nDosyalar:\n  ${s.eksik.map(e => e.yol).join('\n  ')}`,
      ).toBe(0)
    }
  })

  it('C5 PR-KISITLI — PR\'ın değiştirdiği kaynağından ESKİ companion: taşıyıcı AÇIK ise bloklar, UYKUDA ise sayar', () => {
    const s = pr.sayim
    process.stdout.write(
      `[INV-DOC-2 · C5 · PR] ${prKapsamSatiri}\n` +
      `[INV-DOC-2 · C5 · PR] ${anahtar.durumSatiri(process.cwd())}\n` +
      `[INV-DOC-2 · C5 · PR] bayat companion: ${s.bayat.length} (eşik dışı) + ${s.bayatTaze} ` +
      `(${YAS_ESIGI_GUN} gün penceresinde, sıradaki borç)\n` +
      (s.bayat.length ? s.bayat.map(y => `  ${y}\n`).join('') : '') +
      `[INV-DOC-2 · C5 · PR] Bu sayı ${UYKUDA ? 'BLOKLAMAZ' : 'BLOKLAR'} — kaynak: ${TASIYICI.yol}\n`,
    )

    // Kısıtlama etkin mi: listelenen her companion, PR'ın dokunduğu bir kaynağa ait olmalı.
    if (!pr.tam) {
      const prCompanionlari = new Set((degisen ?? []).map(y => companionYolu(y)))
      expect(
        s.bayat.filter(y => !prCompanionlari.has(y)),
        'PR-kısıtlı C5 listesinde PR\'ın DEĞİŞTİRMEDİĞİ kaynağın companion\'ı var — daraltma çalışmıyor.',
      ).toEqual([])
    }

    if (!UYKUDA) {
      // TAŞIYICI AÇIK: eski davranış AYNEN, PR'ın dokunduğu kaynaklarla sınırlı. Companion üretilebiliyorsa bayat
      // companion gerçek bir ihmaldir ve ikize EMİN BİÇİMDE YANLIŞ cevap verdirir.
      expect(
        s.bayat.length,
        `Kaynağından eski companion sayısı ${s.bayat.length}, taban ${C5_TABAN}. ` +
        `Taşıyıcı AÇIK (${TASIYICI.yol}) — companion üretilebilir, yani bu borç ÖDENEBİLİR ve bloklar. ` +
        `Sayım kapsamı: ${prKapsamSatiri}.\nDosyalar:\n  ${s.bayat.join('\n  ')}`,
      ).toBeLessThanOrEqual(C5_TABAN)
    }
  })
})
