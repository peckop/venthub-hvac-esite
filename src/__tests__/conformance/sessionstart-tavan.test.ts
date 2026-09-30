import { spawnSync } from 'node:child_process'
import fs from 'node:fs'
import { createRequire } from 'node:module'
import os from 'node:os'
import path from 'node:path'

import { afterAll, beforeAll, describe, expect, it } from 'vitest'

/**
 * INV-SESSIONSTART-TAVAN-1 · SessionStart çıktısı ≤ 9.000 karakter (REC-433 alt işi, Ops 09-29).
 *
 * ÖLÇÜLEN KUSUR: bir SessionStart kancasının `additionalContext` çıktısı 10.000 karakteri aşınca bağlama
 * YALNIZ ilk ~2.000 karakter + "Output too large" + dosya yolu girer. `session-board.cjs` compact açılışında
 * 11.458 karakter basıyordu (durum bloğu ve son konuşma dökümü büyüdükçe 21–39 KB): Recep'in aynen sözü ve
 * durum dosyası pencereye HİÇ girmedi.
 *
 * DÜZENEK: hermetik geçici proje dizini — şişirilmiş durum dosyası (~21k karakterlik son blok) + şişirilmiş
 * döküm (30 Recep mesajı, 5 uzun cevap). Kanca dört açılış türünde gerçekten çalıştırılır.
 *
 * ⭐BU KAPI ÇIKTI BOYUTUNU ölçer; içeriğin ANLAMLI olduğunu değil. İçerik kolları ayrıca sabitlenir: son Recep
 * mesajı AYNEN görünür, cevaplar girmez, durum bloğu kırpıldığında yol yazılır.
 *
 * Cetvel: `execution-method-standard.md` §9 (ölçüm) · kanca `.claude/hooks/session-board.cjs`.
 */

const KOK = path.resolve(__dirname, '../../..')
const KANCA = path.join(KOK, '.claude/hooks/session-board.cjs')
const TAVAN = 9000
const SID = '0dfe070e-0000-4000-8000-tavan0000001'
const SON_MESAJ_BASI = 'SON-MESAJ-ANAHTARI Recep bu sozu aynen gormek istiyor'
const CEVAP_ANAHTARI = 'CEVAP-KOKU-ANAHTARI'

let gecici = ''
let memoryDir = ''
let kayitYolu = ''

beforeAll(() => {
  gecici = fs.mkdtempSync(path.join(os.tmpdir(), 'vh-sstart-'))
  memoryDir = path.join(gecici, 'memory')
  fs.mkdirSync(memoryDir)
  kayitYolu = path.join(gecici, `${SID}.jsonl`)
  fs.writeFileSync(kayitYolu, '')

  // Durum dosyası: kimlik frontmatter'da, son blok ~21k karakter.
  const satirlar: string[] = []
  for (let i = 0; i < 55; i++) satirlar.push(`- SATIR-${i} ` + 'x'.repeat(370))
  fs.writeFileSync(
    path.join(memoryDir, 'arac-serit-durumu-state.md'),
    `---\nname: durum\noriginSessionId: ${SID}\n---\n## eski blok\nkisa\n\n## SON BLOK BASLIGI\n${satirlar.join('\n')}\n`,
  )

  // Döküm: 30 Recep mesajı (uzun), 5 uzun cevap.
  const parcalar: string[] = []
  for (let i = 0; i < 30; i++) {
    const son = i === 29
    const metin = (son ? SON_MESAJ_BASI + ' ' : `mesaj-${i} `) + 'y'.repeat(1400)
    let p = `### Recep (2026-09-29T09:${String(i).padStart(2, '0')}:00.000Z)\n${metin}\n`
    if (i >= 25) p += `\n#### Cevap\n${CEVAP_ANAHTARI}-${i} ` + 'z'.repeat(2800) + '\n'
    parcalar.push(p)
  }
  fs.writeFileSync(
    path.join(memoryDir, `son-konusma-${SID}.md`),
    `# Son konuşma dökümü (özetsiz)\nyazildi: 2026-09-29T09:30:00.000Z · kaynak Stop · Recep mesajı 30 · cevap 5\n\n${parcalar.join('\n')}`,
  )
})

afterAll(() => {
  if (gecici) fs.rmSync(gecici, { recursive: true, force: true })
})

function calistir(source: string, ekEnv: Record<string, string> = {}): { ek: string; durum: number | null } {
  const girdi = JSON.stringify({
    session_id: SID,
    source,
    transcript_path: kayitYolu,
    cwd: KOK,
    hook_event_name: 'SessionStart',
  })
  const r = spawnSync(process.execPath, [KANCA], {
    input: girdi,
    encoding: 'utf8',
    cwd: KOK,
    // CC_LANE / üretici / toplam-tavan geçersiz kılmaları her zaman açıkça verilir: geliştiricinin kendi
    // kabuğundaki değerler testi etkilemesin.
    env: { ...process.env, CLAUDE_PROJECT_DIR: KOK, VH_SESSIONSTART_TOPLAM_TEST: '', CC_LANE: '', VH_ROL_KARTI_URETICI: '', ...ekEnv },
    windowsHide: true,
    timeout: 60_000,
  })
  const ham = r.stdout || ''
  let ek = ham
  try {
    const j = JSON.parse(ham) as { hookSpecificOutput?: { additionalContext?: string } }
    ek = j.hookSpecificOutput?.additionalContext ?? ''
  } catch {
    /* JSON değilse ham metin ölçülür ve aşağıdaki kontroller başarısız olur */
  }
  return { ek, durum: r.status }
}

describe('INV-SESSIONSTART-TAVAN-1 · çıktı ≤ 9.000 karakter (şişirilmiş girdiyle)', () => {
  for (const source of ['startup', 'resume', 'clear', 'compact']) {
    it(
      `${source}: additionalContext ${TAVAN} karakteri aşmaz ve kimlik ilk satırdadır`,
      () => {
        const { ek, durum } = calistir(source)
        expect(durum).toBe(0)
        expect(ek.length, `${source} çıktısı ${ek.length} karakter`).toBeLessThanOrEqual(TAVAN)
        expect(ek.startsWith(`Oturum kimliğin: ${SID}`)).toBe(true)
        expect(ek).toContain('ROL KARTI:')
      },
      60_000,
    )
  }

  it(
    "compact: Recep'in SON mesajı aynen görünür, cevaplar girmez, durum bloğu kırpılınca yol yazılır",
    () => {
      const { ek } = calistir('compact')
      expect(ek).toContain(SON_MESAJ_BASI)
      expect(ek).not.toContain(CEVAP_ANAHTARI)
      expect(ek).toContain('KIRPILDI')
      expect(ek).toContain('arac-serit-durumu-state.md')
      expect(ek).toContain(`son-konusma-${SID}.md`)
    },
    60_000,
  )

  it(
    'compact: ajan KÖR bırakılmaz — uzun talimat SONUNA kadar aynen, durum bloğundan ≥10 satır görünür (Recep 09-29 endişesi)',
    () => {
      const { ek } = calistir('compact')
      // Son mesaj 1.400 karakterlik gövde taşıyor; eski mesajTavan=600 bunu ortadan kırpardı.
      expect(ek).toContain('y'.repeat(1400))
      // Eski DURUM_TAVAN=3000 ile ~7 satır görünürdü; 4.500 ile en az 10.
      const gorunen = (ek.match(/- SATIR-\d+ /g) ?? []).length
      expect(gorunen, `durum bloğundan ${gorunen} satır göründü`).toBeGreaterThanOrEqual(9)
    },
    60_000,
  )

  it(
    'toplam tavan AŞILINCA durum bloğu ve Recep sözü orantılı DARALIR — toptan işaretçiye dönmez (CI 09-29 kırmızısı)',
    () => {
      // Daralma yolunu zorlamak için toplam tavan 6.500'e çekilir (CI'da en kötü durum bunu kendiliğinden yapıyordu).
      const { ek } = calistir('compact', { VH_SESSIONSTART_TOPLAM_TEST: '6500' })
      expect(ek.length, `çıktı ${ek.length} karakter`).toBeLessThanOrEqual(6500)
      // Recep'in EN YENİ sözü toptan düşmedi: aynen görünür, işaretçi metni yok.
      expect(ek).toContain(SON_MESAJ_BASI)
      expect(ek).toContain('--- SON KONUSMA (ozetsiz; Recep sozu burada AYNEN) ---')
      expect(ek).not.toContain('SON KONUSMA dokumu (Recep sozu AYNEN):')
      // Durum bloğu da toptan düşmedi: baş + son parça ve yol duruyor.
      expect(ek).toContain('--- SON BLOK ---')
      expect(ek).not.toContain('son blok tavan yuzunden yok')
      expect((ek.match(/- SATIR-\d+ /g) ?? []).length).toBeGreaterThanOrEqual(4)
    },
    60_000,
  )

  it(
    'çok dar bütçede bile Recep sözü ve durum bloğu EN SON düşer: önce daraltılamayan bilgi satırları işaretçiye döner',
    () => {
      // 4.600 (ölçüldü): durum+döküm taban değerlerine daralınca hâlâ sığmaz; ancak compact kolu/şerit/tazelik gibi
      // daraltılamayan satırlar da düşerse sığar → bunlar ÖNCE gitmeli, Recep sözü ve durum bloğu yerinde kalmalı.
      // (Eski sıra yalnız öncelik numarasına bakıyordu ve bu bütçede Recep sözünü toptan işaretçiye çeviriyordu.)
      const { ek } = calistir('compact', { VH_SESSIONSTART_TOPLAM_TEST: '4600' })
      expect(ek.length, `çıktı ${ek.length} karakter`).toBeLessThanOrEqual(4600)
      expect(ek).not.toContain('COMPACT DONUSU')
      expect(ek).toContain(SON_MESAJ_BASI)
      expect(ek).not.toContain('SON KONUSMA dokumu (Recep sozu AYNEN):')
      expect(ek).toContain('--- SON BLOK ---')
    },
    60_000,
  )

  it(
    'startup/resume/clear: durum bloğu ve döküm bağlama girmez (yalnız compact)',
    () => {
      for (const source of ['startup', 'resume', 'clear']) {
        const { ek } = calistir(source)
        expect(ek, source).not.toContain('SON BLOK BASLIGI')
        expect(ek, source).not.toContain(SON_MESAJ_BASI)
      }
    },
    120_000,
  )
})

/**
 * ROL KARTI SATIRI (REC-433 Faz 1.2). Satır KİMLİĞİN HEMEN ALTINDA (3. satır) ve her açılış türünde görünür;
 * üretici (HARİTA, `scripts/belge/rol-karti-uret.cjs --ozet <ROL>`) yok/rol tanımsız/bozuksa oturum yine
 * açılır ve satır SEBEBİ yazar (fail-open). Testler gerçek üreticiye BAĞLI DEĞİL: kanca `VH_ROL_KARTI_URETICI`
 * ile geçici bir sahte üreticiyi çağırır (HARİTA'nın PR'ı önce/sonra gelse de aynı sonuç).
 */
describe('ROL KARTI satırı · kimliğin hemen altında, fail-open', () => {
  let sahte = ''
  let bozuk = ''
  /** Rol = CC_LANE ortam değişkeni (sahte sid'in pano talebi yok); üretici yolu isteğe bağlı geçersiz kılınır. */
  const rolCalistir = (source: string, lane: string, uretici = '') =>
    calistir(source, { CC_LANE: lane, VH_ROL_KARTI_URETICI: uretici })
  beforeAll(() => {
    sahte = path.join(gecici, 'sahte-uretici.cjs')
    // ARAC → özet basar; HATA → çıkış 1; başka rol → boş çıktı (gerçek üreticinin bilinmeyen rol davranışı).
    fs.writeFileSync(
      sahte,
      "const r=(process.argv[process.argv.indexOf('--ozet')+1]||'').toUpperCase();" +
        "if(r==='ARAC')process.stdout.write('SAHTE-GOREV kanca ve serit araci altyapisi');" +
        "if(r==='HATA')process.exit(1)\n",
    )
    bozuk = path.join(gecici, 'yok-boyle-bir-uretici.cjs')
  })

  it('her açılış türünde kimlikten HEMEN sonra (3. satır); rol bilinmiyorsa sebebi yazılır', () => {
    for (const source of ['startup', 'resume', 'clear', 'compact']) {
      const { ek } = calistir(source)
      const satirlar = ek.split('\n')
      expect(satirlar[0], source).toBe(`Oturum kimliğin: ${SID}`)
      expect(satirlar[2], source).toContain('ROL KARTI:')
      expect(satirlar[2], source).toContain('bilinmiyor')
    }
  }, 240_000)

  it('üretici özet veriyorsa: rol adı, özet ve tam kart yolu tek satırda görünür', () => {
    const { ek } = rolCalistir('startup', 'ARAC', sahte)
    expect(ek.split('\n')[2]).toBe('ROL KARTI: ARAC — SAHTE-GOREV kanca ve serit araci altyapisi (tamami: docs/roller/ARAC.md)')
  }, 60_000)

  it('GERÇEK üretici (HARİTA, docs/roller): her rol için kart özeti + tam kart yolu; kartlar diskte var', () => {
    for (const rol of ['ARAC', 'OPS', 'HARITA']) {
      const { ek } = rolCalistir('startup', rol)
      const satir = ek.split('\n')[2]
      expect(satir, rol).toMatch(new RegExp(`^ROL KARTI: ${rol} — .{20,} \\(tamami: docs/roller/${rol}\\.md\\)$`))
      expect(fs.existsSync(path.join(KOK, 'docs/roller', `${rol}.md`)), `docs/roller/${rol}.md`).toBe(true)
    }
  }, 120_000)

  it('rol küçük harfle gelse de büyütülür (pano şerit adı ile CC_LANE farkı)', () => {
    const { ek } = rolCalistir('startup', 'arac', sahte)
    expect(ek.split('\n')[2]).toContain('ROL KARTI: ARAC — SAHTE-GOREV')
  }, 60_000)

  it('rol tanımsızsa (üretici boş basar): "kart yok" yazılır, çıktı tavan altında', () => {
    const { ek, durum } = rolCalistir('compact', 'YOKROL', sahte)
    expect(durum).toBe(0)
    expect(ek.split('\n')[2]).toContain('bu rol icin kart yok')
    expect(ek.length).toBeLessThanOrEqual(TAVAN)
  }, 60_000)

  it('üretici hata verirse (çıkış 1): oturum açılır, sebep satırda', () => {
    const { ek, durum } = rolCalistir('startup', 'HATA', sahte)
    expect(durum).toBe(0)
    expect(ek.split('\n')[2]).toContain('kart okunamadi')
  }, 60_000)

  it('üretici dosyası yoksa: oturum açılır, "uretici yok" yazılır', () => {
    const { ek, durum } = rolCalistir('startup', 'ARAC', bozuk)
    expect(durum).toBe(0)
    expect(ek.split('\n')[2]).toContain('kart uretici bu agacta yok')
  }, 60_000)
})

describe('enjeksiyonKisa · Recep mesajları aynen ama sınırlı', () => {
  const istek = createRequire(path.join(KOK, 'package.json'))
  const dokum = istek('./.claude/hooks/son-konusma-dokumu.cjs') as {
    enjeksiyonKisa: (dir: string, sid: string, o?: { sonN?: number; mesajTavan?: number; tavan?: number }) => string | null
  }

  it('döküm yoksa null', () => {
    expect(dokum.enjeksiyonKisa(memoryDir, 'yok-boyle-bir-sid')).toBeNull()
  })

  it('toplam tavanı aşmaz, en yeni mesaj kalır, cevap girmez', () => {
    const m = dokum.enjeksiyonKisa(memoryDir, SID, { sonN: 30, mesajTavan: 600, tavan: 2500 }) ?? ''
    expect(m.length).toBeLessThanOrEqual(2500 + 200)
    expect(m).toContain(SON_MESAJ_BASI)
    expect(m).not.toContain(CEVAP_ANAHTARI)
  })

  it("tek mesaj mesajTavan'dan uzunsa kırpıldığı yazılır", () => {
    const m = dokum.enjeksiyonKisa(memoryDir, SID, { sonN: 1, mesajTavan: 200, tavan: 3600 }) ?? ''
    expect(m).toContain('mesaj kırpıldı')
  })
})
