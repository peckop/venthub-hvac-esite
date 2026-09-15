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

    expect(r.stdout, `satir hala uyarili: ${r.stdout}`).toMatch(/^DEFTER:/)
    expect(r.stdout).not.toMatch(/⚠/)
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
    const depo = depoKur(1, new Date().toISOString().slice(0, 10))
    const r = kos(SATIR_KANCA, depo, panoKur(TAZE_ONBELLEK))
    expect(r.sureMs, `sure ${r.sureMs} ms, tavan ${BUTCE_MS} ms`).toBeLessThan(BUTCE_MS)

    // Kaynakta NotebookLM'e çıkış izi OLMAMALI: eşitlemeyi insan tetikler (cetvel kuralı).
    const kaynak = fs.readFileSync(SATIR_KANCA, 'utf8')
    for (const yasak of ['notebooklm ', 'fetch(', 'https://']) {
      expect(kaynak.split('\n').filter((s) => !s.trim().startsWith('*') && !s.trim().startsWith('//')).join('\n'), `kaynakta dis cagri izi: ${yasak}`).not.toContain(yasak)
    }
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
