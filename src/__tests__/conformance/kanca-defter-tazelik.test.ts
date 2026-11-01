import { execFileSync, spawnSync } from 'node:child_process'
import fs from 'node:fs'
import os from 'node:os'
import path from 'node:path'

import { describe, expect, it } from 'vitest'

/**
 * KARAR 419 (2026-10-26, ARC-216 eki): NotebookLM defterleri emekli → DEFTER satırı ve onu besleyen
 * Stop kancası (defter-bayatlik-olcumu) kaldırıldı. Aşağıdaki tarihçe o satırın NİÇİN VAR OLDUĞUNU anlatır;
 * INV-KANCA-DEFTER-1 bölümü artık "geri gelmez" kolunu ölçer, DEFTER-2 (olc çıkış 3) silindi. DEFTER-3 ve -4 sürer.
 *
 * INV-KANCA-DEFTER-1 (eski) · defter tazelik satırının KARARI ölçülür (REC-342).
 *
 * ── ÖLÇÜLMÜŞ KUSUR VE KAYDIN YANLIŞ VARSAYIMI ──
 *
 * Kayıt "kural var, KAPI YOK" diyordu. Ölçüm başka söyledi: kapı VAR
 * (`.claude/hooks/defter-bayatlik-olcumu.cjs`), settings'te BAĞLI ve elle koşturulduğunda
 * doğru cevabı veriyor ("178 saat önce"). Eksik olan ölçüm değil, ölçümün GÖRÜNDÜĞÜ
 * YÜZEYDİ: o kanca **Stop** olayında, `async: true` ile, **stderr**'e yazıyor — yani
 * kararın verildiği yerde (turun BAŞI) kimse görmüyor.
 *
 * ⭐DERS: **bir kapının var olması, kararın verildiği yerde GÖRÜNDÜĞÜ anlamına gelmez.**
 * 2026-09-15'te defter 7 gün bayattı, kanca bunu ölçüyordu, kimse görmedi.
 *
 * ── İKİNCİ VE DAHA SESSİZ KUSUR (bu işte bulundu) ──
 *
 * Stop kancası `olc` fiilinin **çıkış kodu 3**'ünü ARIZA sayıyordu. Oysa 3, betiğin
 * CEVABIDIR ("değişen demet var") ve hem betiğin başlığında hem cetvelde yazılı. Sonuç:
 * **tam sayının gerektiği anda** "OLCULMEDI" basıyordu; defter tazeyken (çıkış 0) sorun
 * görünmüyordu. Yani kusur yalnız bayat hâlde ortaya çıkıyordu — en kötü zamanlama.
 *
 * ⭐SINIF: "çıkış kodu kanıt değil" dersinin TERS hâli. Sözleşmesi YAZILI bir betik için
 * çıkış kodu bir CEVAPTIR; sözleşmesi olmayan bir komut için yalnız bir işarettir.
 *
 * ⭐CANLI PANOYA VE CANLI DEPOYA DOKUNULMAZ: her vaka kendi geçici deposunu ve panosunu
 * kurar (`VENTHUB_REPO`, `VENTHUB_BOARD_DIR`). Bu projede testin paylaşılan canlı kayda
 * yazması ölçülmüş bir kusur sınıfıdır.
 *
 * Cetvel: `docs/standards/proje-takip-defteri-standard.md` · `hafiza-kancalari-standard.md` ·
 * `fleet-mechanism-standard.md` (çıkış sözleşmesi).
 */

const SATIR_KANCA = path.resolve(__dirname, '../../../.claude/hooks/defter-tazelik-satiri.cjs')

/** Bütçe: kaydın koyduğu tavan. Ölçülen node açılışı ~187 ms, kancanın kendi işi ~80-110 ms. */
const BUTCE_MS = 900

interface Sonuc {
  kod: number | null
  stdout: string
  stderr: string
  sureMs: number
}

/**
 * Geçici bir git deposu kurar: `docs/proje-takip/state.json` dosyasını verilen gün kadar
 * geriye damgalayıp `master` dalına commit'ler ve `origin/master` ref'ini kendine kurar.
 *
 * NİÇİN GERÇEK GIT: kanca yaşı `git log origin/master` ile ölçüyor — dosya damgasıyla
 * DEĞİL, çünkü eşitleme başka bir worktree'de koşabilir ve yerel damga yanıltır. Testin
 * bunu taklit etmesi gerekir, yoksa ölçülen şey kancanın gerçek ölçütü olmaz.
 */
function depoKur(gunOnce: number, kararlarTarihi: string | null): string {
  const kok = fs.mkdtempSync(path.join(os.tmpdir(), 'vh-defter-'))
  const g = (...a: string[]): void => {
    execFileSync('git', ['-C', kok, ...a], { stdio: 'ignore' })
  }
  g('init', '-q', '-b', 'master')
  g('config', 'user.email', 'test@example.invalid')
  g('config', 'user.name', 'test')

  fs.mkdirSync(path.join(kok, 'docs', 'proje-takip', 'linear'), { recursive: true })
  fs.writeFileSync(path.join(kok, 'docs', 'proje-takip', 'state.json'), '{"demetler":{}}\n', 'utf8')
  if (kararlarTarihi) {
    fs.writeFileSync(
      path.join(kok, 'docs', 'proje-takip', 'linear', `kararlar-vitrin-${kararlarTarihi}.md`),
      '# kopya\n',
      'utf8',
    )
  }

  const damga = new Date(Date.now() - gunOnce * 86_400_000).toISOString()
  g('add', 'docs/proje-takip/state.json')
  execFileSync('git', ['-C', kok, 'commit', '-q', '-m', 'state'], {
    stdio: 'ignore',
    env: { ...process.env, GIT_AUTHOR_DATE: damga, GIT_COMMITTER_DATE: damga },
  })
  // `origin/master` ref'ini kendine kur: kanca PAYLAŞILAN gerçeğe bakar, yerel dala değil.
  g('update-ref', 'refs/remotes/origin/master', 'master')
  return kok
}

function panoKur(onbellek: unknown | null): string {
  const dizin = fs.mkdtempSync(path.join(os.tmpdir(), 'vh-pano-defter-'))
  if (onbellek !== null) {
    fs.writeFileSync(path.join(dizin, '.defter-olc-onbellek.json'), JSON.stringify(onbellek), 'utf8')
  }
  return dizin
}

function kos(kanca: string, depo: string, pano: string, ek: Record<string, string> = {}): Sonuc {
  const t0 = Date.now()
  const r = spawnSync(process.execPath, [kanca], {
    input: JSON.stringify({ session_id: 'test1234' }),
    encoding: 'utf8',
    env: { ...process.env, VENTHUB_REPO: depo, VENTHUB_BOARD_DIR: pano, ...ek },
    timeout: 30_000,
  })
  return { kod: r.status, stdout: r.stdout ?? '', stderr: r.stderr ?? '', sureMs: Date.now() - t0 }
}

const TAZE_ONBELLEK = { ts: new Date().toISOString(), degisen: 0, toplam: 22, hata: null }

describe('INV-KANCA-DEFTER-1 · KARAR 419: DEFTER satırı emekli, kanca diğer satırları basmaya devam eder', () => {
  /** Eski satırın üç ölçüm girdisinden her birini en kötü hâle getirir: satır geri gelirse hiçbiri onu gizleyemez. */
  const kotuHaller: Array<[string, () => string, () => string]> = [
    ['defter 7 gün bayat + önbellek yok', () => depoKur(7, new Date().toISOString().slice(0, 10)), () => panoKur(null)],
    ['değişen demet 14', () => depoKur(0, new Date().toISOString().slice(0, 10)), () => panoKur({ ts: new Date().toISOString(), degisen: 14, toplam: 22, hata: null })],
    ['git ölçümü yok (boş dizin)', () => fs.mkdtempSync(path.join(os.tmpdir(), 'vh-bos-')), () => panoKur(TAZE_ONBELLEK)],
  ]

  for (const [ad, depoFn, panoFn] of kotuHaller) {
    it(`⭐DEFTER satırı GERİ GELMEZ — ${ad}`, () => {
      const r = kos(SATIR_KANCA, depoFn(), panoFn())
      expect(r.kod, 'kanca turu BLOKLAMAMALI (fail-open)').toBe(0)
      expect(r.stdout, `DEFTER satırı basıldı: ${r.stdout}`).not.toMatch(/DEFTER:/)
      expect(r.stdout, 'eski ölçüm parçaları duruyor').not.toMatch(/son esitleme|Kararlar kopyasi|olc \d+ degisen/)
    })
  }

  it('kanca diğer açılış satırlarını BASMAYA DEVAM EDER (kaldırma kancayı susturmadı)', () => {
    const r = kos(SATIR_KANCA, depoKur(0, null), panoKur(TAZE_ONBELLEK))
    expect(r.stdout).toContain('BAGIMLILIK:')
    expect(r.stdout).toContain('TABAN:')
  })

  it('Stop kancası defter-bayatlik-olcumu EMEKLİ: dosya yok ve settings.json kaydı yok', () => {
    const kok = path.resolve(__dirname, '../../..')
    expect(fs.existsSync(path.join(kok, '.claude/hooks/defter-bayatlik-olcumu.cjs')), 'emekli kanca dosyası geri geldi').toBe(false)
    const ayar = fs.readFileSync(path.join(kok, '.claude/settings.json'), 'utf8')
    expect(ayar, 'settings.json emekli kancayı hâlâ çağırıyor').not.toContain('defter-bayatlik-olcumu')
  })

  it('BÜTÇE — kanca dış servise çıkmaz ve süre tavanın altında', () => {
    /**
     * ⭐ÖLÇÜT EN İYİ SÜRE, ORTALAMA DEĞİL (2026-09-18 ölçüldü).
     *
     * Tek koşumun duvar saati bu kolu KIRILGAN yapıyordu: aynı kol tek başına 27/27 geçerken
     * tam konformans paketinde (aynı anda ~236 dosya + docker yüklü) 1383 ms ölçüldü ve
     * tavanı aştı. Ölçülen şey kancanın maliyeti değil, o anki makine yüküydü. Kardeş kapı
     * `ana-agac-tazelik` aynı sınıftan düşmüştü (çözüm: cömert zaman aşımı) — kırılgan kapı,
     * kırmızısına bakılmayan kapıdır.
     *
     * Üç koşumun EN KÜÇÜĞÜ alınır: yük bulaşmasını eler ama tavanı GEVŞETMEZ. Kanca gerçekten
     * yavaşlarsa en iyi koşum da tavanı aşar — yani kolun yakaladığı gerileme sınıfı aynı kalır.
     * Tavan 900 ms'de DURUYOR; yükselen tek şey ölçümün dayanıklılığıdır.
     */
    const depo = depoKur(1, new Date().toISOString().slice(0, 10))
    const pano = panoKur(TAZE_ONBELLEK)
    const sureler = [1, 2, 3].map(() => kos(SATIR_KANCA, depo, pano).sureMs)
    const enIyi = Math.min(...sureler)
    expect(enIyi, `en iyi sure ${enIyi} ms (kosumlar: ${sureler.join(', ')}), tavan ${BUTCE_MS} ms`).toBeLessThan(
      BUTCE_MS,
    )

    // Kaynakta NotebookLM'e çıkış izi OLMAMALI: eşitlemeyi insan tetikler (cetvel kuralı).
    const kaynak = fs.readFileSync(SATIR_KANCA, 'utf8')
    for (const yasak of ['notebooklm ', 'fetch(', 'https://']) {
      expect(kaynak.split('\n').filter((s) => !s.trim().startsWith('*') && !s.trim().startsWith('//')).join('\n'), `kaynakta dis cagri izi: ${yasak}`).not.toContain(yasak)
    }
  })
})

/**
 * INV-KANCA-DEFTER-3 — BAĞIMLILIK satırı (REC-345).
 *
 * NİÇİN AYNI KANCADA: ölçüm zaten yazılı bir kayıtta duruyordu
 * (`docs/audits/bagimlilik-YYYY-MM-DD.md`) ve REC-342'nin dersi tam buydu — ölçümün var
 * olması, kararın verildiği yerde göründüğü anlamına gelmez.
 *
 * ⭐BU BÖLÜMÜN EN ÖNEMLİ KOLU "high ≥ 1 TEK BAŞINA UYARI DEĞİL" kolu. Bugün 11 yüksek kayıt
 * var ve hepsi bilinen, kayda geçmiş, insan kararı bekleyen kalemler. Her turda kırmızı
 * yanan bir satır üç günde görmezden gelinir (bu projede ölçülmüş bir kusur sınıfı). Kapı
 * TARAMA TAZELİĞİNİ ölçer; sayı yine de yazılır, çünkü gizlenmesi de yanlış olurdu.
 */
describe('INV-KANCA-DEFTER-3 · bagimlilik tarama tazeligi satiri', () => {
  /** Denetim kaydı yazan geçici depo: yaş ölçütü DOSYA ADINDAKİ tarihtir. */
  function kayitliDepoKur(gunOnce: number, high: number | null): string {
    const kok = depoKur(0, new Date().toISOString().slice(0, 10))
    const gun = new Date(Date.now() - gunOnce * 86_400_000).toISOString().slice(0, 10)
    const dizin = path.join(kok, 'docs', 'audits')
    fs.mkdirSync(dizin, { recursive: true })
    const tablo =
      high === null
        ? '| Bir sey | 5 |\n'
        : `| Yüksek önemde güvenlik kaydı (prod) | **${high}** | \`pnpm audit\` |\n`
    fs.writeFileSync(path.join(dizin, `bagimlilik-${gun}.md`), '# kayit\n\n' + tablo, 'utf8')
    return kok
  }

  it('⭐ASIL İDDİA — tarama TAZEYSE satır ⚠ TAŞIMAZ ve high sayısını YAZAR', () => {
    const r = kos(SATIR_KANCA, kayitliDepoKur(0, 11), panoKur(TAZE_ONBELLEK))
    const satir = r.stdout.split('\n').find((s) => s.includes('BAGIMLILIK')) ?? ''
    expect(satir, `satir yok: ${r.stdout}`).toMatch(/^BAGIMLILIK: son tarama 0 gun · high 11$/)
  })

  it('⭐DEPODAKİ EN YENİ KAYIT GERÇEKTEN OKUNABİLİYOR (kurgu değil, asıl dosya)', () => {
    /**
     * ⭐NİÇİN VAR — 2026-09-19'da sahada yaşandı. Yukarıdaki kollar KURGU kayıtlarla koşuyor;
     * hepsi yeşilken depoya yazılan GERÇEK kayıt, tablo başlığı farklı olduğu için okunamadı
     * ve satır "high OKUNAMADI" dedi. Kanca dürüsttü (K4: ölçemedim ≠ geçti), ama hiçbir kapı
     * bunu yakalamıyordu: kurgu fikstürü her zaman doğru biçimde yazılır, gerçek dosya yazılmaz.
     *
     * Bu kol, kayıt biçimi ile kancayı okuyan desen arasındaki SÖZLEŞMEYİ asıl dosyada ölçer.
     * Yeni bir bağımlılık kaydı yazan herkes, satırı sessizce kör etmeden önce burada durur.
     */
    const dizin = path.join(process.cwd(), 'docs', 'audits')
    const kayitlar = fs
      .readdirSync(dizin)
      .filter((a) => /^bagimlilik-\d{4}-\d{2}-\d{2}\.md$/.test(a))
      .sort()
    expect(kayitlar.length, 'hic bagimlilik kaydi yok — kol kor').toBeGreaterThan(0)

    const enYeni = kayitlar[kayitlar.length - 1]
    const metin = fs.readFileSync(path.join(dizin, enYeni), 'utf8')
    const m = /Yüksek önemde güvenlik kaydı[^|]*\|\s*\*\*(\d+)\*\*/.exec(metin)
    expect(
      m === null ? null : m[1],
      `EN YENI kayit (${enYeni}) istem satirinin desenine UYMUYOR → satir "high OKUNAMADI" der. ` +
        'Tabloya su bicimde bir satir yaz: "| Yüksek önemde güvenlik kaydı (prod) | **N** | ..."',
    ).not.toBeNull()
  })

  it('⭐high ≥ 1 TEK BAŞINA UYARI SEBEBİ DEĞİLDİR (her turda kırmızı = görmezden gelinen kapı)', () => {
    // Bu kol gevşeklik değil, TASARIM KARARININ ölçümü. Kaldırılırsa satır her turda ⚠
    // yanar ve üç günde okunmaz hale gelir — bu projede ölçülmüş bir kusur sınıfı.
    const r = kos(SATIR_KANCA, kayitliDepoKur(1, 99), panoKur(TAZE_ONBELLEK))
    const satir = r.stdout.split('\n').find((s) => s.includes('BAGIMLILIK')) ?? ''
    expect(satir).toContain('high 99')
    expect(satir, 'high tek basina uyari uretmis').not.toContain('⚠')
  })

  it('EŞİK AŞILIRSA ⚠ (varsayılan 14 gün)', () => {
    const r = kos(SATIR_KANCA, kayitliDepoKur(20, 0), panoKur(TAZE_ONBELLEK))
    const satir = r.stdout.split('\n').find((s) => s.includes('BAGIMLILIK')) ?? ''
    expect(satir).toMatch(/^⚠BAGIMLILIK: son tarama 20 gun/)
  })

  it('EN YENİ KAYIT ölçülüyor — eski bir kayıt tazeliği gizlemez', () => {
    // Dizinde hem eski hem yeni kayıt varsa ölçüt EN YENİSİ olmalı; en eskiye bakan bir
    // ölçüt her taramadan sonra bile "bayat" derdi ve kapı gürültüye boğulurdu.
    const kok = kayitliDepoKur(40, 3)
    const bugun = new Date().toISOString().slice(0, 10)
    fs.writeFileSync(path.join(kok, 'docs', 'audits', `bagimlilik-${bugun}.md`), '# k\n\n| Yüksek önemde güvenlik kaydı (prod) | **7** | x |\n', 'utf8')
    const satir = kos(SATIR_KANCA, kok, panoKur(TAZE_ONBELLEK)).stdout.split('\n').find((s) => s.includes('BAGIMLILIK')) ?? ''
    expect(satir).toMatch(/^BAGIMLILIK: son tarama 0 gun · high 7$/)
  })

  it('⭐ÖLÇEMEDİ ≠ TAZE — kayıt hiç yoksa satır SEBEBİ YAZAR', () => {
    const r = kos(SATIR_KANCA, depoKur(0, new Date().toISOString().slice(0, 10)), panoKur(TAZE_ONBELLEK))
    const satir = r.stdout.split('\n').find((s) => s.includes('BAGIMLILIK')) ?? ''
    expect(satir).toMatch(/^⚠BAGIMLILIK: OLCULEMEDI \(bagimlilik-\*\.md kaydi yok\)/)
  })

  it('KAYITTA high TABLOSU OKUNAMAZSA ⚠ ve sebep yazılır (sessiz sıfır YOK)', () => {
    // En sinsi hâl: tablo biçimi değişir, regex tutmaz ve satır "high 0" der. Sıfır, ölçüm
    // gibi görünen bir yokluktur; o yüzden okunamama AÇIKÇA yazılır.
    const r = kos(SATIR_KANCA, kayitliDepoKur(0, null), panoKur(TAZE_ONBELLEK))
    const satir = r.stdout.split('\n').find((s) => s.includes('BAGIMLILIK')) ?? ''
    expect(satir).toMatch(/^⚠BAGIMLILIK:/)
    expect(satir).toContain('high OKUNAMADI')
    expect(satir).not.toContain('high 0')
  })

  it('KANCA pnpm KOŞTURMAZ — ağ isteyen komut kaynakta GEÇMEZ', () => {
    // `pnpm outdated`/`pnpm audit` saniyeler sürer ve ağ ister; satırın içinde koşarsa her
    // tur yavaşlar ve çevrimdışıyken ölçüm kaybolur. Sayı KAYITTAN okunur.
    const kaynak = fs
      .readFileSync(SATIR_KANCA, 'utf8')
      .split('\n')
      .filter((s) => !s.trim().startsWith('*') && !s.trim().startsWith('//'))
      .join('\n')
    for (const yasak of ['pnpm outdated', 'pnpm audit', 'npm audit']) {
      expect(kaynak, `kaynakta ag isteyen komut: ${yasak}`).not.toContain(yasak)
    }
  })

  it('⭐CETVEL SIKLIĞI ile KAPININ EŞİĞİ HİZALI — ayrışırsa kapı cetveli değil KENDİNİ ölçer', () => {
    // Recep kararı 13 (2026-09-15, kendi sözü "13 ve 14 evet"): iki haftada bir tam tarama,
    // eşik 14 gün SABİT. Bu kol iki sayının ayrışmasını engeller: cetvel "iki haftada bir"
    // derken kapı 7 ya da 30 günde uyarıyorsa, kapı yazılı kuralı DEĞİL kendi varsayılanını
    // ölçüyor olur ve kimse farkı görmez.
    const cetvel = fs.readFileSync(
      path.resolve(__dirname, '../../../docs/standards/bagimlilik-guvenlik-yukseltme-standard.md'),
      'utf8',
    )
    expect(cetvel, 'sıklık revizyonu bölümü yok').toMatch(/SIKLIK REVİZYONU/i)
    expect(cetvel, 'karar verildigi yazilmamis').toMatch(/KARAR VERİLDİ/i)
    expect(cetvel, 'yeni siklik cetvelde yazili degil').toMatch(/iki haftada bir tam\s*\n?\s*tarama/i)
    expect(cetvel, 'esik cetvelde SABIT olarak yazili degil').toMatch(/Eşik:\s*14 gün,\s*SABİT/)

    // Kancanın varsayılanı da 14 olmalı — cetveldeki sayı ile kod ayrışmasın.
    const kaynak = fs.readFileSync(SATIR_KANCA, 'utf8')
    expect(kaynak, 'kancanin varsayilan esigi 14 degil').toMatch(
      /VENTHUB_BAGIMLILIK_ESIK_GUN\s*\|\|\s*14/,
    )
  })

  it('⭐GEVŞETME OLDUĞU ve ÖNERİNİN REDDEDİLDİĞİ kayıtta DURUYOR', () => {
    // İki yön de yazılı kalmalı: (a) kuralın hangi yönde değiştiği, (b) ALTYAPI'nın aksi
    // yöndeki önerisinin reddedildiği. İkincisi olmazsa aynı yol bir sonraki tartışmada
    // ikinci kez önerilir; birincisi olmazsa cetvel kendi geçmişini siler.
    const cetvel = fs.readFileSync(
      path.resolve(__dirname, '../../../docs/standards/bagimlilik-guvenlik-yukseltme-standard.md'),
      'utf8',
    )
    expect(cetvel, 'gevsetme oldugu yazilmamis').toMatch(/GEVŞET/i)
    expect(cetvel, 'eski satirin ne oldugu yazilmamis').toMatch(/haftada bir/i)
    expect(cetvel, 'reddedilen oneri kayitta degil').toMatch(/ALTYAPI'NIN ÖNERİSİ AKSİ YÖNDEYDİ/i)
  })
})

/**
 * INV-KANCA-DEFTER-4 — ŞEMA TABANI satırı (Recep sorusu, 2026-09-16).
 *
 * Recep aynen: *"bende DB'de değişiklik yaptığım an senin kendi yedeğin bayat olacak;
 * tekrardan onu tazelemek yine 2 gün mü sürecek?"*
 *
 * ⭐SATIR NİÇİN BU KANCADA: aynı ölçümü yapan bir kapı var (`taban-tazeligi-dunya.test.ts`)
 * ama o yalnız master'a her push'ta ve zamanlı koşuda konuşur (ALT-38: PR kapısından çıktı).
 * Recep'in sorduğu an PR anı DEĞİL, **karar anıdır** — REC-342'nin dersi tam buydu. Ayrıca yeni bir kanca eklemek node açılışını (170-292 ms) ikinci kez
 * öder; satır MEVCUT kancaya eklendi.
 *
 * ⭐ÖLÇÜT SIR GEREKTİRMEZ ve bunu Recep'in kendi düzeltmesi mümkün kıldı: *"ben kendim bir
 * müdahale ile yapmıyorum, size yaptırıyorum ve gerekirse migration onayı veriyorum."*
 * Yani DB'ye giden her değişiklik onaylanmış bir migration DOSYASIDIR → bayatlık sorusu
 * tamamen dosya adlarından cevaplanır.
 */
describe('INV-KANCA-DEFTER-4 · sema tabani tazeligi satiri', () => {
  /** Taban + migration taşıyan geçici depo. `politika` = taban TAM mı (create policy var mı). */
  function tabanliDepoKur(
    tabanTarih: string | null,
    migrationAdlari: string[],
    opts: { politika?: boolean; ekTaban?: { tarih: string; politika: boolean } } = {},
  ): string {
    const kok = depoKur(0, new Date().toISOString().slice(0, 10))
    const tabanDizin = path.join(kok, 'supabase', 'baselines')
    const migDizin = path.join(kok, 'supabase', 'migrations')
    fs.mkdirSync(tabanDizin, { recursive: true })
    fs.mkdirSync(migDizin, { recursive: true })

    const govde = (tam: boolean): string =>
      tam
        ? 'CREATE TABLE "public"."x" (id int);\nCREATE POLICY "p" ON "public"."x" USING (true);\n'
        : 'CREATE TABLE "public"."x" (id int);\n'

    if (tabanTarih) {
      fs.writeFileSync(
        path.join(tabanDizin, `${tabanTarih}_public_schema.sql`),
        govde(opts.politika !== false),
        'utf8',
      )
    }
    if (opts.ekTaban) {
      fs.writeFileSync(
        path.join(tabanDizin, `${opts.ekTaban.tarih}_public_schema.sql`),
        govde(opts.ekTaban.politika),
        'utf8',
      )
    }
    for (const ad of migrationAdlari) {
      fs.writeFileSync(path.join(migDizin, ad), 'select 1;\n', 'utf8')
    }
    return kok
  }

  const tabanSatiri = (cikti: string): string =>
    cikti.split('\n').find((s) => s.includes('TABAN')) ?? ''

  it('⭐ASIL İDDİA — taban TAZEYSE satır ⚠ TAŞIMAZ ve TARİHİ yazar', () => {
    const kok = tabanliDepoKur('2026-09-15', ['20260914090000_bir_sey.sql'])
    const satir = tabanSatiri(kos(SATIR_KANCA, kok, panoKur(TAZE_ONBELLEK)).stdout)
    expect(satir, 'TABAN satiri hic basilmadi').toContain('TABAN:')
    expect(satir, 'taze tabanda ⚠ var').not.toContain('⚠')
    expect(satir).toContain('2026-09-15')
    expect(satir).toContain('sonrasinda migration yok')
  })

  it('⭐DÖNÜŞ YÖNÜ — tabandan SONRA migration varsa ⚠ ve SAYI yazılır (kapı iki yönlü)', () => {
    const kok = tabanliDepoKur('2026-09-15', [
      '20260916120000_yeni_bir_sey.sql',
      '20260917130000_baska_sey.sql',
    ])
    const r = kos(SATIR_KANCA, kok, panoKur(TAZE_ONBELLEK))
    const satir = tabanSatiri(r.stdout)
    expect(satir).toContain('⚠TABAN:')
    expect(satir, 'sonradan gelen migration SAYISI yazilmamis').toContain('SONRASINDA 2 migration')
    // Kırmızı gören kişinin NE YAPACAĞI satırda olmalı; yoksa uyarı bir bilmeceye döner.
    expect(r.stdout, 'ONARIM yolu yazilmamis').toContain('sema-tabani-uret.yml')
  })

  it('⭐KISMİ TABAN SEÇİLMEZ — "en yeni dosya bir seçim kuralı değildir" (2026-09-14 hatası)', () => {
    // Daha YENİ ama KISMİ (create policy YOK) bir dosya var; kanca ESKİ ama TAM olanı seçmeli.
    const kok = tabanliDepoKur('2026-09-15', ['20260916120000_yeni.sql'], {
      politika: true,
      ekTaban: { tarih: '2026-09-20', politika: false },
    })
    const satir = tabanSatiri(kos(SATIR_KANCA, kok, panoKur(TAZE_ONBELLEK)).stdout)
    expect(satir, 'KISMI dosya taban secilmis (2026-09-20)').not.toContain('2026-09-20')
    expect(satir, 'TAM taban secilmemis').toContain('2026-09-15')
    // Ve seçim doğru yapıldığı için 09-16'lı migration BAYAT olarak görünmeli.
    expect(satir).toContain('⚠TABAN:')
  })

  it('⭐ÖLÇEMEDİ ≠ TAZE — TAM taban yoksa satır SEBEBİ YAZAR, sessiz kalmaz', () => {
    const kok = tabanliDepoKur('2026-09-15', ['20260914090000_bir_sey.sql'], { politika: false })
    const satir = tabanSatiri(kos(SATIR_KANCA, kok, panoKur(TAZE_ONBELLEK)).stdout)
    expect(satir).toContain('⚠TABAN: OLCULEMEDI')
    expect(satir, 'sebep yazilmamis').toMatch(/TAM taban yok/i)
  })

  it('⭐ÜÇ DAMGA BİÇİMİ DE GÖRÜLÜR — 12 haneli dosya sessizce düşmez (yazarını yakalayan kol)', () => {
    // Sahada ÜÇ biçim var: 14, 12 ve 8 hane. Bu kapı ilk yazıldığında 12 hane TANINMIYORDU ve
    // 13 dosya karşılaştırmadan sessizce düşüyordu — kol o kusuru yakaladı.
    const kok = tabanliDepoKur('2026-09-15', ['202609161200_oniki_haneli.sql'])
    const satir = tabanSatiri(kos(SATIR_KANCA, kok, panoKur(TAZE_ONBELLEK)).stdout)
    expect(satir, '12 haneli damga GORULMEDI — kapi yanlis yesil verir').toContain(
      'SONRASINDA 1 migration',
    )

    const kok8 = tabanliDepoKur('2026-09-15', ['20260916_sekiz_haneli.sql'])
    const satir8 = tabanSatiri(kos(SATIR_KANCA, kok8, panoKur(TAZE_ONBELLEK)).stdout)
    expect(satir8, '8 haneli damga GORULMEDI').toContain('SONRASINDA 1 migration')
  })

  it('DAMGASI ÇÖZÜLEMEYEN dosya SESSİZ GEÇMEZ — sayısı satıra yazılır', () => {
    const kok = tabanliDepoKur('2026-09-15', ['damgasiz_dosya.sql'])
    const satir = tabanSatiri(kos(SATIR_KANCA, kok, panoKur(TAZE_ONBELLEK)).stdout)
    expect(satir).toContain('⚠TABAN:')
    expect(satir, 'cozulemeyen damga sayisi yazilmamis').toContain('damgasi cozulemeyen 1')
  })

  it('CI KAPISI ile BU SATIR AYNI ÖLÇÜTÜ paylaşır — ikisi de orphan değil', () => {
    // Satır karar anında konuşur, kapı master'a her push'ta ve zamanlı koşuda kırmızı verir (PR'ı bloklamaz;
    // ALT-38). Biri silinirse öteki yalnız kalır; bu kol ikisinin de VAR olduğunu ölçer.
    const kapi = path.resolve(__dirname, 'taban-tazeligi-dunya.test.ts')
    expect(fs.existsSync(kapi), `CI kapisi YOK: ${kapi}`).toBe(true)
    const kapiMetin = fs.readFileSync(kapi, 'utf8')
    expect(kapiMetin, 'kapi ayni olcutu (create policy) kullanmiyor').toMatch(/create\\s\+policy/i)
    const kanca = fs.readFileSync(SATIR_KANCA, 'utf8')
    expect(kanca, 'kanca ayni olcutu kullanmiyor').toMatch(/create\\s\+policy/i)
  })
})
