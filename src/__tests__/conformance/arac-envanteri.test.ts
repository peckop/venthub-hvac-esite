// @vitest-environment node
//
// Kapı saf Node'dur; DOM ortamı yalnız maliyet ve kırılganlıktır.
import { execFileSync } from 'node:child_process'
import fs from 'node:fs'
import { createRequire } from 'node:module'
import os from 'node:os'
import path from 'node:path'

import { describe, expect, it } from 'vitest'

/**
 * INV-ARAC-1..3 — `scripts/hijyen/arac-envanteri.cjs`
 * Cetvel: `docs/standards/arac-envanteri-standard.md` (§2 kapı tanımı) · Kayıt: REC-185.
 *
 * NİÇİN VAR: cetvelin AXIOM 1'i "envantere yazılmayan araç YOKTUR" der. Cetvel tek başına
 * "hatırlarsam uygularım"dır ve ölçüm bunu AYNI GÜN çürüttü: envanter 2026-09-07 11:22Z'de
 * master'a indi; altı saat sonra dosya sistemiyle **28 yerde** ayrışmıştı (11 `.ts` betik
 * evrene hiç girmemiş · 1 karantina taşıması satırda eski yolla duruyor · 12 dosya o gün
 * doğmuş · envanter KENDİ CETVELİNİ yazmamış). Kimse ihmal etmedi; envanteri elle taze
 * tutmak insan işi değil. INV-ARAC-1 unutmayı mekanik olarak yakalar.
 *
 * ⛔BU DOSYADAKİ EN ÖNEMLİ TASARIM KARARI — İKİ KOL NİÇİN FİKSTÜRLE KOŞUYOR:
 * Gerçek belgede bugün **0 `sahipsiz` satır ve 0 `OLU-ADAY` satırı** var (ölçtüm). Yani
 * INV-ARAC-2 ve INV-ARAC-3'ün gerçek belge üzerindeki kolları **BOŞ EVREN** üzerinde koşar:
 * ölçüt tamamen bozuk olsa bile yeşil yanarlar ve hiçbir şey kanıtlamazlar (hafıza:
 * ayirt-etmeyen-gosterge-olcum-degildir · var-olmayan-kapi-pending-gorunmez). Bu yüzden
 * her ikisinin ölçütü AYRICA fikstür belgesiyle sınanır: fikstürde kırmızı vermeyen bir
 * ölçüt, gerçek belgede yeşil yanmayı hak etmez.
 */

const KOK = process.cwd()
const BETIK = path.join(KOK, 'scripts', 'hijyen', 'arac-envanteri.cjs')
const GERCEK_ENVANTER = 'docs/audits/arac-envanteri-2026-09-07.md'

type Cikti = { kod: number; stdout: string; stderr: string }

/** Betiği koşturur; çıkış kodunu ASLA yutmaz (kod da bir ölçümdür). */
function kostur(args: string[]): Cikti {
  try {
    const stdout = execFileSync(process.execPath, [BETIK, ...args], {
      cwd: KOK,
      encoding: 'utf8',
      stdio: ['ignore', 'pipe', 'pipe'],
      env: { ...process.env, VENTHUB_REPO: KOK },
    })
    return { kod: 0, stdout, stderr: '' }
  } catch (e) {
    const h = e as { status?: number; stdout?: string; stderr?: string }
    return { kod: h.status ?? -1, stdout: String(h.stdout ?? ''), stderr: String(h.stderr ?? '') }
  }
}

/** Gerçek envanteri geçici bir dosyaya kopyalar; sabotaj ORİJİNALE DOKUNMAZ. */
function fiksturBelgesi(donustur: (metin: string) => string): string {
  const kaynak = path.join(KOK, GERCEK_ENVANTER)
  const dizin = fs.mkdtempSync(path.join(os.tmpdir(), 'inv-arac-'))
  const hedef = path.join(dizin, 'arac-envanteri-2026-09-07.md')
  fs.writeFileSync(hedef, donustur(fs.readFileSync(kaynak, 'utf8')), 'utf8')
  return hedef
}

describe('INV-ARAC-1..3: arac envanteri gercekle esit, sahipli ve taze', () => {
  it('betik ve envanter belgesi VAR (kapi KOR kosmasin)', () => {
    expect(fs.existsSync(BETIK), 'kapi betigi yok — kapi hicbir sey olcmuyor ama yesil yanardi').toBe(true)
    expect(fs.existsSync(path.join(KOK, GERCEK_ENVANTER)), 'envanter belgesi yok').toBe(true)
  })

  // ───────────────────────────────────────────────────────────────────────────
  // INV-ARAC-1 — evren eşitliği
  // ───────────────────────────────────────────────────────────────────────────

  it('INV-ARAC-1: dosya sistemi ile envanter arasinda fark 0', () => {
    const r = kostur(['--bugun', '2026-09-07'])
    expect(
      r.kod,
      'Envanter ile disk ayrismis. Cetvel AXIOM 1: envantere yazilmayan arac YOKTUR.\n' +
        'Onarim: node scripts/hijyen/arac-envanteri.cjs --yaz\n' + r.stdout,
    ).toBe(0)
  })

  /**
   * ⭐ASIL SABOTAJ (emirdeki 1. kabul ölçütü). Bu kol düşerse kapının varlık sebebi ölmüştür:
   * yeni bir betik envantere yazılmadan PR'a girer ve hiçbir şey görmez.
   */
  it('SABOTAJ 1 — yeni betik envantere yazilmazsa INV-ARAC-1 KIRMIZI', () => {
    const sahte = path.join(KOK, 'scripts', 'zz-sabotaj-gecici.mjs')
    fs.writeFileSync(sahte, '// gecici sabotaj dosyasi (INV-ARAC-1 kolu)\n', 'utf8')
    try {
      const r = kostur(['--bugun', '2026-09-07'])
      expect(r.kod, 'envantere YAZILMAMIS yeni betik kapidan GECTI — kapi fail-open').toBe(1)
      expect(r.stdout, 'kirmizi verdi ama SEBEBI yazmadi (okuyan neyi onaracagini bilemez)').toContain(
        'scripts/zz-sabotaj-gecici.mjs',
      )
      expect(r.stdout).toContain('INV-ARAC-1 KIRMIZI')
    } finally {
      fs.unlinkSync(sahte)
    }
    // ⭐SABOTAJIN GERİ ALINDIĞI DA ÖLÇÜLÜR: temizlenmemiş sabotaj sonraki kolları kirletir.
    expect(fs.existsSync(sahte), 'sabotaj dosyasi silinmedi').toBe(false)
    expect(kostur(['--bugun', '2026-09-07']).kod, 'sabotaj geri alindi ama kapi hala kirmizi').toBe(0)
  })

  /**
   * ⭐KİMLİK TUZAĞI — bu kapının en pahalı kusuru burada yaşardı.
   * Tablolar bölüm bölüm FARKLI biçimde yazılmış: §3.1/3.2/3.4 backtick'li TAM yol,
   * §3.5 backtick'li YALNIZ taban ad (`ci.yml`), §3.6 backtick'siz ve UZANTISIZ
   * (`3d-scene-lighting-research`), §3.3'te kimlik yol değil (Ad × Ağaç). Tek bir "yolu oku"
   * kuralı yazılsaydı §3.6'nin 67 satırı KAYIP + 67 dosya YENİ görünür, kapı ilk gününde
   * 134 sahte bulguyla gürültüye boğulur ve kapatılırdı (hafıza: olcut-keskin-ama-evren-yanlis).
   * Bu kol her bölümün GERÇEKTEN eşleştiğini ölçer — yani hiçbir bölüm "hepsi yeni" demiyor.
   */
  it('AYIRT EDER: her bolum kendi kimlik bicimiyle eslesiyor (hicbiri toptan YENI/KAYIP degil)', () => {
    const r = kostur(['--json', '--bugun', '2026-09-07'])
    const j = JSON.parse(r.stdout) as {
      bolumler: Array<{
        bolum: string
        tur: string
        envanterSatir: number
        uclasmisSatir: number
        fsAdet: number
      }>
    }
    expect(j.bolumler.length, 'alti bolumun hepsi ayristirilmadi').toBe(6)
    for (const b of j.bolumler) {
      expect(b.envanterSatir, `bolum ${b.bolum} (${b.tur}) HIC satir ayristirilamadi`).toBeGreaterThan(0)
      /**
       * ⭐DEĞİŞMEZ, TARİHÇE SATIRLARI DÜŞÜLEREK YAZILIR. İlk yazımda `envanterSatir === fsAdet`
       * demiştim; kol §3.2'de "142 satır ↔ 141 dosya" ile düştü. Sebep kimlik okuma DEĞİL:
       * KAYIP/SİLİNDİ satırı envanterde tarihçe olarak DURUR ama karşılığı diskte OLMAZ
       * (cetvel AXIOM 3). Düzeltilmemiş değişmez, doğru kapıyı yanlış yerde kızartıyordu.
       */
      expect(
        b.envanterSatir - b.uclasmisSatir,
        `bolum ${b.bolum} (${b.tur}): envanter ${b.envanterSatir} satir (${b.uclasmisSatir} tarihce), ` +
          `fs ${b.fsAdet} arac — kimlik bicimi yanlis okunuyor olabilir (backtick / uzanti / taban-ad farki)`,
      ).toBe(b.fsAdet)
    }
  })

  // ───────────────────────────────────────────────────────────────────────────
  // INV-ARAC-2 — sahip zorunlu (gerçek evren BOŞ → fikstür şart)
  // ───────────────────────────────────────────────────────────────────────────

  it('INV-ARAC-2: gercek belgede sahipsiz satir 0', () => {
    const r = kostur(['--bugun', '2026-09-07'])
    expect(r.stdout, 'sahipsiz satir bulundu').not.toContain('INV-ARAC-2 KIRMIZI')
  })

  it('SABOTAJ 2 — sahip alani bosaltilirsa INV-ARAC-2 KIRMIZI (FIKSTUR: gercek evren BOS)', () => {
    // `.claude/hooks/accumulate-edits.cjs` satirinin `sahip` hucresini bozuyoruz.
    const belge = fiksturBelgesi((m) =>
      m.replace(
        /(\| `\.claude\/hooks\/accumulate-edits\.cjs` \| hook \| [^|]*\| )ALTYAPI( \|)/,
        '$1sahipsiz$2',
      ),
    )
    // ⭐SABOTAJIN ETKİLİ OLDUĞU AYRICA ÖLÇÜLÜR: uygulanmayan sabotajın yeşili "kapı geçti"
    // diye okunur. Bugün bunu iki kez yaşadım (etkisiz sabotaj "geçti" sayıldı).
    expect(fs.readFileSync(belge, 'utf8'), 'SABOTAJ UYGULANMADI — bu kol hicbir sey olcmuyor').toContain(
      '| sahipsiz |',
    )
    const r = kostur(['--envanter', belge, '--bugun', '2026-09-07'])
    expect(r.kod, '"sahipsiz" degeri kapidan GECTI — cetvel AXIOM 2 ihlali gorulmuyor').toBe(1)
    expect(r.stdout).toContain('INV-ARAC-2 KIRMIZI')
    expect(r.stdout, 'hangi satir oldugu yazilmadi').toContain('.claude/hooks/accumulate-edits.cjs')
  })

  // ───────────────────────────────────────────────────────────────────────────
  // INV-ARAC-3 — ölü aday tazeliği (gerçek evren BOŞ → fikstür şart)
  // ───────────────────────────────────────────────────────────────────────────

  it('INV-ARAC-3: gercek belgede bayat OLU-ADAY yok', () => {
    const r = kostur(['--bugun', '2026-09-07'])
    expect(r.stdout, 'bayat olu aday bulundu').not.toContain('INV-ARAC-3 KIRMIZI')
  })

  it('SABOTAJ 3 — 14 gunden eski OLU-ADAY satiri INV-ARAC-3 KIRMIZI (FIKSTUR)', () => {
    const belge = fiksturBelgesi((m) =>
      m.replace(
        // §3.1 satırı 8 sütun: yol | tur | ne_yapar | sahip | tetik | kanıt | kapı | durum
        // → `durum`dan önce ALTI hücre var. İlk yazımda {5} demiştim ve sabotaj UYGULANMADI;
        // "sabotaj uygulandı mı" kolu olmasaydı bu, sessizce YEŞİL bir sahte kanıt olurdu.
        /(\| `\.claude\/hooks\/board-release\.cjs` \|(?:[^|]*\|){6} )KAL( \|)/,
        '$1OLU-ADAY 2026-08-01$2',
      ),
    )
    expect(fs.readFileSync(belge, 'utf8'), 'SABOTAJ UYGULANMADI — kol hicbir sey olcmuyor').toContain(
      'OLU-ADAY 2026-08-01',
    )
    const r = kostur(['--envanter', belge, '--bugun', '2026-09-07'])
    expect(r.kod, '37 gunluk OLU-ADAY kapidan GECTI').toBe(1)
    expect(r.stdout).toContain('INV-ARAC-3 KIRMIZI')
    expect(r.stdout, 'yas yazilmadi — okuyan sayinin nereden geldigini goremez').toMatch(/3[0-9] gun/)
  })

  /**
   * ⭐AYIRT ETME KOLU: aynı satır TAZE tarihle kırmızı VERMEMELİ. Yoksa ölçüt "OLU-ADAY
   * kelimesi var mı"ya çöker ve her ölü aday, daha o gün yazılmışken kapıyı kızartır —
   * takvimle kızaran kapı (hafıza: takvimle-kirmiziya-donen-kapi).
   */
  it('AYIRT EDER: TAZE OLU-ADAY (2 gunluk) kirmizi VERMEZ', () => {
    const belge = fiksturBelgesi((m) =>
      m.replace(
        // §3.1 satırı 8 sütun: yol | tur | ne_yapar | sahip | tetik | kanıt | kapı | durum
        // → `durum`dan önce ALTI hücre var. İlk yazımda {5} demiştim ve sabotaj UYGULANMADI;
        // "sabotaj uygulandı mı" kolu olmasaydı bu, sessizce YEŞİL bir sahte kanıt olurdu.
        /(\| `\.claude\/hooks\/board-release\.cjs` \|(?:[^|]*\|){6} )KAL( \|)/,
        '$1OLU-ADAY 2026-09-05$2',
      ),
    )
    expect(fs.readFileSync(belge, 'utf8')).toContain('OLU-ADAY 2026-09-05')
    const r = kostur(['--envanter', belge, '--bugun', '2026-09-07'])
    expect(r.stdout, 'iki gunluk olu aday BAYAT sayildi — olcut tarihi degil kelimeyi okuyor').not.toContain(
      'INV-ARAC-3 KIRMIZI',
    )
    expect(r.kod, 'taze olu aday kapiyi kizartti').toBe(0)
  })

  // ───────────────────────────────────────────────────────────────────────────
  // FAIL-CLOSED — "ölçemedim" asla "geçti" değildir
  // ───────────────────────────────────────────────────────────────────────────

  it('FAIL-CLOSED: envanter belgesi YOKSA kapi KIRMIZI (cikis 2), sessizce gecmez', () => {
    const yok = path.join(os.tmpdir(), 'inv-arac-boyle-bir-belge-yok', 'arac-envanteri-2026-09-07.md')
    const r = kostur(['--envanter', yok, '--bugun', '2026-09-07'])
    expect(r.kod, 'belge yokken kapi GECTI — olcemedigi hal "fark yok" diye okundu').toBe(2)
    expect(r.stderr).toContain('OLCULEMEDI')
  })

  it('FAIL-CLOSED: tablo bozulursa (ayrac satiri silinirse) kapi KIRMIZI', () => {
    /**
     * ⭐BELGE CRLF'Lİ. İlk yazımda deseni `\n|---|...|\n` diye yazmıştım ve HİÇBİR ŞEY
     * eşleşmedi: dosyada satır sonu `\r\n`. Sabotaj uygulanmadığı için kapı doğal olarak
     * yeşil kaldı ve kol "kapı fail-open" diye kırmızı verdi — yani hata kapıda değil
     * sabotajdaydı. Ders (bugün üçüncü kez): ETKİSİZ SABOTAJIN YEŞİLİ, KAPININ GEÇMESİ
     * DEĞİLDİR; o yüzden aşağıda sabotajın uygulandığı AYRICA ölçülüyor.
     */
    const ayrac = /\r?\n\|---\|---\|---\|---\|---\|---\|---\|---\|\r?\n/
    const sayHepsi = /\r?\n\|---\|---\|---\|---\|---\|---\|---\|---\|\r?\n/g
    const kaynak = fs.readFileSync(path.join(KOK, GERCEK_ENVANTER), 'utf8')
    const onceAdet = (kaynak.match(sayHepsi) || []).length
    const belge = fiksturBelgesi((m) => m.replace(ayrac, '\n'))
    const sonraAdet = (fs.readFileSync(belge, 'utf8').match(sayHepsi) || []).length
    /**
     * ⭐SABOTAJIN ETKİSİ SAYIYLA ÖLÇÜLÜR, VARLIK/YOKLUK'LA DEĞİL. İlk yazımda "artık hiç
     * 8 sütunlu ayraç kalmadı" diye ölçmüştüm ve kol düştü — oysa sabotaj UYGULANMIŞTI:
     * belgede iki tane 8 sütunlu ayraç var (§3.1 ve §6 sayım tablosu), `replace` ilkini
     * siliyor, ikincisi duruyordu. Ölçütüm sabotajı değil belgenin başka bir yerini
     * ölçüyordu — "ölçüt keskin, evren yanlış"ın küçük bir yüzü, kendi testimde.
     */
    expect(onceAdet, 'kaynak belgede 8 sutunlu ayrac YOK — kol bos evrende kosuyor').toBeGreaterThan(0)
    expect(sonraAdet, 'SABOTAJ UYGULANMADI — ayrac satiri sayisi degismedi').toBe(onceAdet - 1)
    const r = kostur(['--envanter', belge, '--bugun', '2026-09-07'])
    expect(r.kod, 'ayristirilamayan tablo kapidan GECTI').toBe(2)
    expect(r.stderr).toContain('OLCULEMEDI')
  })

  // ───────────────────────────────────────────────────────────────────────────
  // YAZMA KİPİ — kabul ölçütü: elle yazılan alanlar KAYBOLMUYOR
  // ───────────────────────────────────────────────────────────────────────────

  /**
   * ⭐EMRIN 2. KABUL ÖLÇÜTÜ: "envanter betikten yeniden üretildiğinde OPS'un elle yazdığı
   * alanlar kaybolmuyor (diff 0)". Bunu sağlayan tasarım kararı: betik satırları ayrıştırıp
   * GERİ YAZMAZ; dokunmadığı satırın metnine hiç dokunmaz. Ayrıştır-ve-geri-yaz tasarımı
   * italik notları (`OPS *(devir adayı: URUN)*`), kaçışlı boruları ve hizalamayı sessizce yer.
   */
  it('YAZMA KIPI IDEMPOTENT: fark 0 iken --yaz belgeyi BIR BAYT degistirmez', () => {
    const belge = fiksturBelgesi((m) => m)
    const once = fs.readFileSync(belge, 'utf8')
    const r = kostur(['--yaz', '--envanter', belge])
    expect(r.kod).toBe(0)
    expect(r.stdout).toContain('fark YOK')
    expect(fs.readFileSync(belge, 'utf8'), 'fark yokken belge degisti — diff 0 vaadi bozuldu').toBe(once)
  })

  it('YAZMA KIPI KORUR: yeni satir eklenirken MEVCUT satirlar bayt bayt ayni kalir', () => {
    const belge = fiksturBelgesi((m) => m)
    const oncekiSatirlar = fs.readFileSync(belge, 'utf8').split(/\r?\n/)
    const sahte = path.join(KOK, 'scripts', 'zz-koruma-gecici.mjs')
    fs.writeFileSync(sahte, '// gecici koruma kolu dosyasi\n', 'utf8')
    try {
      const r = kostur(['--yaz', '--envanter', belge])
      expect(r.kod).toBe(0)
      const sonrakiSatirlar = fs.readFileSync(belge, 'utf8').split(/\r?\n/)
      expect(sonrakiSatirlar.length, 'yeni satir EKLENMEDI — yazma kipi calismiyor').toBeGreaterThan(
        oncekiSatirlar.length,
      )
      // Elle yazilan zengin alanlar (italik devir notu) aynen duruyor mu?
      const sonrakiMetin = sonrakiSatirlar.join('\n')
      const ornekler = oncekiSatirlar.filter((s) => s.includes('*(devir adayı:')).slice(0, 20)
      expect(ornekler.length, 'fikstur "devir adayi" satiri icermiyor — kol bos evrende').toBeGreaterThan(0)
      for (const s of ornekler) {
        expect(sonrakiMetin, 'elle yazilan italik devir notu KAYBOLDU: ' + s.slice(0, 80)).toContain(s)
      }
    } finally {
      fs.unlinkSync(sahte)
    }
  })

  /**
   * ⛔BETİK HÜKÜM VERMEZ. Cetvel AXIOM 3'e göre KAL/OLU-ADAY/KARANTINA hükmü insanındır;
   * betik yalnız gözlemi (`YENI`) yazar. Bu kol düşerse betik sessizce karar veren bir şeye
   * dönüşmüştür ve envanterin "insan hükmeder" ilkesi ölmüştür.
   */
  it('BETIK HUKUM VERMEZ: eklenen satirin durumu daima YENI', () => {
    const belge = fiksturBelgesi((m) => m)
    const sahte = path.join(KOK, 'scripts', 'zz-hukum-gecici.mjs')
    fs.writeFileSync(sahte, '// gecici hukum kolu dosyasi\n', 'utf8')
    try {
      kostur(['--yaz', '--envanter', belge])
      const satir = fs
        .readFileSync(belge, 'utf8')
        .split(/\r?\n/)
        .find((s) => s.includes('zz-hukum-gecici.mjs'))
      expect(satir, 'yeni satir eklenmedi').toBeTruthy()
      expect(satir, 'betik KAL/OLU-ADAY gibi bir HUKUM yazdi — karar insanin').toMatch(/\|\s*YENI\s*\|$/)
      expect(satir, '"olcemedim" yerine "yok" yazilmis — olculmemis yokluk iddia ediliyor').toContain(
        'olculemedi',
      )
    } finally {
      fs.unlinkSync(sahte)
    }
  })

  /**
   * ⭐ANILMAK ≠ ÇAĞRILMAK. `tetik` sütunu bir denetim belgesindeki ANMAYI çağıran sayarsa,
   * ölü betik "çağıranı var" görünür ve kapı fail-open olur. İlk yazımda tam bunu yapıyordu:
   * `scripts/db/migrations/*.ts` satırları `docs/audits/vibe-coding-...md` dosyasını çağıran
   * gösteriyordu. Hüküm `cagiran-yok` kalmalı, anma yanına BİLGİ olarak yazılmalı.
   */
  it('AYIRT EDER: denetim belgesindeki ANMA cagiran sayilmaz', () => {
    const req = createRequire(import.meta.url)
    const mod = req(BETIK) as { cagiranSinifi: (y: string) => string }
    const f = mod.cagiranSinifi
    expect(f('docs/audits/vibe-coding-20-madde-denetimi-2026-08-13.md'), 'denetim belgesi cagiran sayildi').toBe(
      'anma',
    )
    expect(f('docs/plans/rec168-migration-taslagi-2026-09-06.md')).toBe('anma')
    expect(f('registry/P04/plan.json')).toBe('anma')
    // Gerçek çağıran kanalları (cetvel AXIOM 3) anma sayılmamalı — ölçüt ters yöne kaymasın.
    expect(f('package.json'), 'package.json anma sayildi — gercek cagiran kanali kor kaldi').toBe('cagiran')
    expect(f('.github/workflows/ci.yml')).toBe('cagiran')
    expect(f('.claude/settings.json')).toBe('cagiran')
    expect(f('docs/standards/arac-envanteri-standard.md')).toBe('cagiran')
    expect(f('scripts/hijyen/merge-ritueli.cjs')).toBe('cagiran')
  })

  /**
   * ⛔KAPI AĞA VE DEPO DIŞINA ÇIKMAZ. Pano JSONL (`C:/tmp/venthub-board`) ve
   * `gh workflow list` bilerek kapsam dışı: ilki CI'da yok, ikincisi ağ ister. Kapı onlara
   * bağlanırsa CI'da sessizce "iz yok" der ve makineye bağlanır — bugün defter-bayatlık
   * kancasında tam bu yüzden üç kol kırmızı verdi.
   */
  it('KAPI AGA CIKMAZ ve PANOYA BAKMAZ (kaynak taramasi)', () => {
    const kaynak = fs.readFileSync(BETIK, 'utf8')
    const kod = kaynak.replace(/\/\*[\s\S]*?\*\//g, '').replace(/^\s*\/\/.*$/gm, '')
    expect(kod, 'kapi ag istegi yapiyor — konformans testi aga cikamaz').not.toMatch(/\bfetch\s*\(|https?:\/\//)
    expect(kod, "kapi pano dizinine bakiyor — CI'da o dizin YOK, kapi makineye baglanir").not.toMatch(
      /venthub-board|VENTHUB_BOARD_DIR/,
    )
    expect(kod, 'kapi `gh` cagiriyor — ag ve kimlik gerektirir').not.toMatch(/['"]gh['"]/)
  })

  it('CIKTI DETERMINISTIK: ayni agacta iki kosum ayni ciktiyi verir', () => {
    const a = kostur(['--json', '--bugun', '2026-09-07']).stdout
    const b = kostur(['--json', '--bugun', '2026-09-07']).stdout
    expect(b, 'ciktida zaman damgasi ya da sirasiz kume olabilir').toBe(a)
  })
})
