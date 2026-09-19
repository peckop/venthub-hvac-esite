import { execFileSync, spawnSync } from 'node:child_process'
import fs from 'node:fs'
import os from 'node:os'
import path from 'node:path'

import { describe, expect, it } from 'vitest'

/**
 * INV-KANCA-DEFTER-1 · defter tazelik satırının KARARI ölçülür (REC-342).
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
const OLCUM_KANCA = path.resolve(__dirname, '../../../.claude/hooks/defter-bayatlik-olcumu.cjs')

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

describe('INV-KANCA-DEFTER-1 · defter tazelik satiri', () => {
  it('⭐ASIL İDDİA — defter BAYATSA satır ⚠ ile başlar ve GÜN SAYISINI yazar', () => {
    const depo = depoKur(7, new Date().toISOString().slice(0, 10))
    const pano = panoKur(TAZE_ONBELLEK)
    const r = kos(SATIR_KANCA, depo, pano)

    expect(r.kod, 'kanca turu BLOKLAMAMALI (fail-open)').toBe(0)
    expect(r.stdout).toMatch(/^⚠DEFTER:/)
    expect(r.stdout, 'gun sayisi yazili olmali').toMatch(/son esitleme \d{4}-\d{2}-\d{2} \(7 gun\)/)
  })

  it('⭐DÖNÜŞ YÖNÜ — defter TAZEYSE satır ⚠ TAŞIMAZ (kapı iki yönlü)', () => {
    // Yalnız kırmızı veren bir kapı ölçüm değildir: eşitleme koşunca satırın yeşile
    // döndüğü ÖLÇÜLÜR. Dönmezse ekip satırı gürültü sayıp görmezden gelir.
    const depo = depoKur(0, new Date().toISOString().slice(0, 10))
    const pano = panoKur(TAZE_ONBELLEK)
    const r = kos(SATIR_KANCA, depo, pano)

    // ⚠YALNIZ DEFTER SATIRI ÖLÇÜLÜR: kanca REC-345'te ikinci bir satır (BAĞIMLILIK) daha
    // basmaya başladı. Tüm stdout'ta ⚠ aramak, KOMŞU satırın uyarısını bu kolun kusuru
    // sayardı — ölçüt doğru, evren yanlış olurdu. Kol bu yüzden satırı ADIYLA seçer.
    const defterSatiri = r.stdout.split('\n').find((s) => s.includes('DEFTER:')) ?? ''
    expect(defterSatiri, `satir hala uyarili: ${r.stdout}`).toMatch(/^DEFTER:/)
    expect(defterSatiri).not.toMatch(/⚠/)
  })

  it('DEĞİŞEN DEMET ≥ 1 tek başına UYARI sebebidir (yaş taze olsa bile)', () => {
    // İki eşik VE ile değil VEYA ile bağlı: defter bugün eşitlenmiş olsa bile içerik
    // kaymışsa "taze" demek yanlış olur.
    const depo = depoKur(0, new Date().toISOString().slice(0, 10))
    const pano = panoKur({ ts: new Date().toISOString(), degisen: 14, toplam: 22, hata: null })
    const r = kos(SATIR_KANCA, depo, pano)

    expect(r.stdout).toMatch(/^⚠DEFTER:/)
    expect(r.stdout).toContain('olc 14 degisen/22')
  })

  it('⭐ÖLÇEMEDİ ≠ TAZE — önbellek yoksa satır SEBEBİ YAZAR, sessiz kalmaz', () => {
    const depo = depoKur(0, new Date().toISOString().slice(0, 10))
    const pano = panoKur(null)
    const r = kos(SATIR_KANCA, depo, pano)

    expect(r.kod).toBe(0)
    expect(r.stdout).toMatch(/^⚠DEFTER:/)
    expect(r.stdout, 'sebep yazilmali').toContain('olc OLCULMEDI (onbellek yok)')
  })

  it('⭐BAYAT ÖNBELLEK SAYI OLARAK KULLANILMAZ — eski sayı taze gibi gösterilmez', () => {
    // Bu kol olmasa kanca 10 gün önceki "0 degisen" sayısını bugünmüş gibi basar ve
    // yanlış GÜVEN üretir. Eski sayıyı göstermemek, göstermekten iyidir.
    const depo = depoKur(0, new Date().toISOString().slice(0, 10))
    const pano = panoKur({
      ts: new Date(Date.now() - 10 * 86_400_000).toISOString(),
      degisen: 0,
      toplam: 22,
      hata: null,
    })
    const r = kos(SATIR_KANCA, depo, pano)

    expect(r.stdout).toContain('olc OLCULMEDI (onbellek bayat)')
    expect(r.stdout).not.toContain('0 degisen')
  })

  it('KARARLAR KOPYASI ölçülüyor ve yokluğu SEBEBİYLE yazılıyor', () => {
    const depo = depoKur(0, null)
    const pano = panoKur(TAZE_ONBELLEK)
    const r = kos(SATIR_KANCA, depo, pano)

    expect(r.stdout).toMatch(/Kararlar kopyasi OLCULEMEDI/)
  })

  it('GIT ÖLÇÜMÜ BAŞARISIZSA sebep yazılır (origin/master ref yok)', () => {
    // Boş bir dizin: `git log origin/master` sonuç vermez. Kanca "taze" DEMEZ.
    const bos = fs.mkdtempSync(path.join(os.tmpdir(), 'vh-bos-'))
    const r = kos(SATIR_KANCA, bos, panoKur(TAZE_ONBELLEK))
    expect(r.kod).toBe(0)
    expect(r.stdout).toMatch(/son esitleme OLCULEMEDI/)
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
 * INV-KANCA-DEFTER-2 — Stop kancasının `olc` ÇIKIŞ 3 sözleşmesi.
 *
 * Bu bölüm tek bir şeyi ölçer ve o şey bu işin en sessiz kusuruydu: çıkış kodu 3 bir
 * CEVAPTIR, arıza değil. Kol, sözleşmenin hem BETİKTE hem CETVELDE yazılı olduğunu da
 * ölçer — çünkü kod bir sözleşmeye dayanıyorsa, sözleşmenin yazılı olduğu da ölçülmelidir.
 * Yazılı olmayan bir sözleşmeye dayanan kod, bir sonraki okuyucu için tuzaktır.
 */
describe('INV-KANCA-DEFTER-2 · olc cikis 3 bir CEVAPTIR, ariza degil', () => {
  const KOK = path.resolve(__dirname, '../../..')

  it('STOP KANCASI kod 3 ü gecerli cevap sayiyor', () => {
    const src = fs.readFileSync(OLCUM_KANCA, 'utf8')
    expect(src, 'gecerli kod listesi yok').toMatch(/OLC_GECERLI_KODLAR\s*=\s*\[\s*0\s*,\s*3\s*\]/)
    expect(src, 'kod 3 te stdout okunmuyor').toMatch(/e\.status.*e\.stdout|e\.stdout/)
    expect(src, 'OZET satiri sozlesme olarak okunmuyor').toMatch(/OZET/)
  })

  it('STOP KANCASI onbellegi OTURUMDAN BAGIMSIZ yaziyor', () => {
    // Oturuma bağlı bir önbellek, açılış satırı başka oturumda koştuğunda okunamaz.
    const src = fs.readFileSync(OLCUM_KANCA, 'utf8')
    expect(src).toContain('.defter-olc-onbellek.json')
    const satir = src.split('\n').find((s) => s.includes('.defter-olc-onbellek.json')) ?? ''
    expect(satir, 'onbellek adinda oturum kimligi var').not.toContain('sid')
  })

  it('SOZLESME BETIKTE VE CETVELDE YAZILI (koda gomulu varsayim kalmasin)', () => {
    const betik = fs.readFileSync(path.join(KOK, 'scripts', 'nlm', 'proje_takip_sync.py'), 'utf8')
    expect(betik, 'betik cikis 3 sozlesmesini yazmiyor').toMatch(/3\s*=\s*degisen var/i)

    const cetvel = fs.readFileSync(
      path.join(KOK, 'docs', 'standards', 'proje-takip-defteri-standard.md'),
      'utf8',
    )
    expect(cetvel, 'cetvel cikis 3 sozlesmesini yazmiyor').toMatch(/çıkış 3 = değişen var/i)
  })
})

/**
 * INV-KANCA-DEFTER-4 — ŞEMA TABANI satırı (Recep sorusu, 2026-09-16).
 *
 * Recep aynen: *"bende DB'de değişiklik yaptığım an senin kendi yedeğin bayat olacak;
 * tekrardan onu tazelemek yine 2 gün mü sürecek?"*
 *
 * ⭐SATIR NİÇİN BU KANCADA: aynı ölçümü yapan bir CI kapısı var (`taban-tazeligi.test.ts`)
 * ama o yalnız PR'da konuşur. Recep'in sorduğu an PR anı DEĞİL, **karar anıdır** — REC-342'nin
 * dersi tam buydu. Ayrıca yeni bir kanca eklemek node açılışını (170-292 ms) ikinci kez
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
    // Satır karar anında konuşur, kapı PR'da bloklar. Biri silinirse öteki yalnız kalır;
    // bu kol ikisinin de VAR olduğunu ölçer.
    const kapi = path.resolve(__dirname, 'taban-tazeligi.test.ts')
    expect(fs.existsSync(kapi), `CI kapisi YOK: ${kapi}`).toBe(true)
    const kapiMetin = fs.readFileSync(kapi, 'utf8')
    expect(kapiMetin, 'kapi ayni olcutu (create policy) kullanmiyor').toMatch(/create\\s\+policy/i)
    const kanca = fs.readFileSync(SATIR_KANCA, 'utf8')
    expect(kanca, 'kanca ayni olcutu kullanmiyor').toMatch(/create\\s\+policy/i)
  })
})
