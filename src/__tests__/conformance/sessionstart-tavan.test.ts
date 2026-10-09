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
const MUTLAK_TAVAN = 9900 // OPS'ta harita özeti için genişlemiş tavan (kancanın kendi sınırı 10.000)
const SID = '0dfe070e-0000-4000-8000-tavan0000001'
const SON_MESAJ_BASI = 'SON-MESAJ-ANAHTARI Recep bu sozu aynen gormek istiyor'
const CEVAP_ANAHTARI = 'CEVAP-KOKU-ANAHTARI'

let gecici = ''
let memoryDir = ''
let kayitYolu = ''
let oturumKayitDizini = '' // pid kaydı (~/.claude/sessions) taklidi; boş = gerçek kayıtlar teste sızmaz

beforeAll(() => {
  gecici = fs.mkdtempSync(path.join(os.tmpdir(), 'vh-sstart-'))
  memoryDir = path.join(gecici, 'memory')
  fs.mkdirSync(memoryDir)
  kayitYolu = path.join(gecici, `${SID}.jsonl`)
  fs.writeFileSync(kayitYolu, '')
  oturumKayitDizini = path.join(gecici, 'oturum-kayitlari')
  fs.mkdirSync(oturumKayitDizini)

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

function calistir(source: string, ekEnv: Record<string, string> = {}, ekGirdi: Record<string, string> = {}): { ek: string; durum: number | null } {
  const girdi = JSON.stringify({
    session_id: SID,
    source,
    transcript_path: kayitYolu,
    cwd: KOK,
    hook_event_name: 'SessionStart',
    ...ekGirdi,
  })
  const r = spawnSync(process.execPath, [KANCA], {
    input: girdi,
    encoding: 'utf8',
    cwd: KOK,
    // CC_LANE / üretici / toplam-tavan geçersiz kılmaları her zaman açıkça verilir: geliştiricinin kendi
    // kabuğundaki değerler testi etkilemesin.
    env: { ...process.env, CLAUDE_PROJECT_DIR: KOK, VH_SESSIONSTART_TOPLAM_TEST: '', CC_LANE: '', VH_ROL_KARTI_URETICI: '', VENTHUB_OTURUM_KAYIT_DIZINI: oturumKayitDizini, ...ekEnv },
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

describe('HRT-29 · rol OPS ise açılışta departman haritası kısa özeti gelir', () => {
  const HARITA_TAVANI = 2048
  const ROLLER = ['OPS', 'ARAC', 'ALTYAPI', 'HARITA', 'URUN', 'ADMIN', 'KATALOG', 'GEO-SEO', 'BLOG', 'MARKA', 'MEVZUAT', 'SATIS', 'TASARIM', 'EDGE', 'I18N', 'YETENEK']

  it('CC_LANE=OPS: 16 departman satırı ve açılış harfleri görünür, çıktı tavanı yalnız özet kadar genişler', () => {
    const { ek, durum } = calistir('startup', { CC_LANE: 'OPS' })
    expect(durum).toBe(0)
    expect(ek).toContain('DEPARTMAN HARİTASI')
    for (const ad of ROLLER) expect(ek, `${ad} satırı yok`).toContain(`${ad} · `)
    expect(ek).toMatch(/ · M\/T\n/)
    expect(ek.length).toBeLessThanOrEqual(TAVAN + HARITA_TAVANI)
    expect(ek.startsWith(`Oturum kimliğin: ${SID}`)).toBe(true)
  }, 60_000)

  // OPS denetimi (#1690 bulgu 1): tavan 9.000 + özet 1.855 = 10.855'e çıkıyor, compact açılışı 10.719 oluyordu → kancanın 10.000
  // sınırında kırpılıyordu. Eski üst sınır (TAVAN+2048) yalnız startup'ı deniyor ve bu kusuru yakalamıyordu.
  for (const source of ['startup', 'resume', 'clear', 'compact']) {
    it(`${source}: OPS + şişirilmiş durum/döküm → additionalContext ${MUTLAK_TAVAN} karakteri aşmaz, kancanın 10.000 sınırı altında`, () => {
      const { ek, durum } = calistir(source, { CC_LANE: 'OPS' })
      expect(durum).toBe(0)
      expect(ek.length, `${source} çıktısı ${ek.length} karakter`).toBeLessThanOrEqual(MUTLAK_TAVAN)
      expect(ek).toContain('DEPARTMAN HARİTASI')
      expect(ek).not.toContain('SessionStart tavani: cikti kirpildi')
    }, 60_000)
  }

  it('OPS compact: harita özeti bütünüyle durur ve Recep sözü hâlâ aynen görünür (taşan pay durum bloğundan alınır)', () => {
    const { ek } = calistir('compact', { CC_LANE: 'OPS' })
    for (const ad of ROLLER) expect(ek, `${ad} satırı yok`).toContain(`${ad} · `)
    expect(ek).toContain(SON_MESAJ_BASI)
  }, 60_000)

  it('OPS olmayan rolde tavan 9.000 kalır (genişleme yalnız OPS)', () => {
    const { ek } = calistir('compact', { CC_LANE: 'ARAC' })
    expect(ek.length).toBeLessThanOrEqual(TAVAN)
  }, 60_000)

  describe('üretici sınırı çalışma anında ölçülür (bulgu 2) ve sebep yazılır (bulgu 4)', () => {
    /** Verilen gövdeyle geçici bir sahte üretici yazar (kanca VH_ROL_KARTI_URETICI ile bunu çağırır). */
    const sahteUretici = (ad: string, govde: string): string => {
      const yol = path.join(gecici, ad)
      fs.writeFileSync(yol, govde)
      return yol
    }

    it('20.000 karakter basan üretici: ham metin GİRMEZ, işaretçi + sınır sebebi yazılır, çıktı tavan altında', () => {
      const uretici = sahteUretici(
        'kacak-uretici.cjs',
        "if(process.argv.includes('--harita-ozet'))process.stdout.write('KACAK-HARITA '+'x'.repeat(20000));" +
          "else process.stdout.write('SAHTE-GOREV')\n",
      )
      const { ek, durum } = calistir('compact', { CC_LANE: 'OPS', VH_ROL_KARTI_URETICI: uretici })
      expect(durum).toBe(0)
      expect(ek).not.toContain('KACAK-HARITA')
      expect(ek).toContain('DEPARTMAN HARITASI: docs/roller/DEPARTMAN-HARITASI.md')
      expect(ek).toMatch(/kisa ozet uretilemedi \([^)]+\)/)
      expect(ek.length).toBeLessThanOrEqual(MUTLAK_TAVAN)
    }, 60_000)

    it('2.100 bayt sınırının hemen altı kabul edilir, hemen üstü reddedilir (sınır tam yerinde)', () => {
      const uretim = (n: number) =>
        sahteUretici(
          `sinir-${n}.cjs`,
          `if(process.argv.includes('--harita-ozet'))process.stdout.write('SINIR-OZET '+'y'.repeat(${n - 11}));else process.stdout.write('SAHTE-GOREV')\n`,
        )
      expect(calistir('startup', { CC_LANE: 'OPS', VH_ROL_KARTI_URETICI: uretim(2100) }).ek).toContain('SINIR-OZET')
      const ust = calistir('startup', { CC_LANE: 'OPS', VH_ROL_KARTI_URETICI: uretim(2101) }).ek
      expect(ust).not.toContain('SINIR-OZET')
      expect(ust).toMatch(/ozet 2101 bayt > 2100 sinir/)
    }, 120_000)

    it('üretici hata verirse (çıkış 1): işaretçide sebep yazılır, oturum açılır', () => {
      const uretici = sahteUretici('hatali-uretici.cjs', "if(process.argv.includes('--harita-ozet'))process.exit(1)\n")
      const { ek, durum } = calistir('startup', { CC_LANE: 'OPS', VH_ROL_KARTI_URETICI: uretici })
      expect(durum).toBe(0)
      expect(ek).toMatch(/kisa ozet uretilemedi \(.+\)/)
    }, 60_000)

    it('üretici boş basarsa: sebep "bos cikti"', () => {
      const uretici = sahteUretici('bos-uretici.cjs', "if(process.argv.includes('--harita-ozet'))process.stdout.write('  ')\n")
      expect(calistir('startup', { CC_LANE: 'OPS', VH_ROL_KARTI_URETICI: uretici }).ek).toContain('uretici bos cikti verdi')
    }, 60_000)

    it('üretici dosyası yoksa: sebep "uretici bu agacta yok"', () => {
      const { ek } = calistir('startup', { CC_LANE: 'OPS', VH_ROL_KARTI_URETICI: path.join(gecici, 'yok-boyle-bir-uretici.cjs') })
      expect(ek).toContain('kisa ozet uretilemedi (uretici bu agacta yok)')
    }, 60_000)
  })

  // OPS denetimi (#1690 bulgu 5): compact/clear girdisinde session_title yok; rol pid kaydındaki addan (`~/.claude/sessions`) çıkar.
  describe("claim'siz pencerede rol başlıktan çıkar: compact ve clear dahil, pid kaydı yedeği", () => {
    const kayitYaz = (ad: string) =>
      fs.writeFileSync(path.join(oturumKayitDizini, '4242.json'), JSON.stringify({ sessionId: SID, name: ad }))
    afterAll(() => fs.rmSync(path.join(oturumKayitDizini, '4242.json'), { force: true }))

    for (const source of ['compact', 'clear']) {
      it(`${source}: session_title gelmese de pid kaydındaki "Ops" adı → rol OPS, harita gelir`, () => {
        kayitYaz('Ops')
        const { ek } = calistir(source)
        expect(ek).toContain('ROL KARTI: OPS')
        expect(ek).toContain('DEPARTMAN HARİTASI')
        expect(ek.length).toBeLessThanOrEqual(MUTLAK_TAVAN)
      }, 60_000)
    }

    it('pid kaydındaki ad tabloda yoksa rol tanınmaz (tahmin yok)', () => {
      kayitYaz('Baska Bir Ad')
      const { ek } = calistir('compact')
      expect(ek).toContain('ROL KARTI: (bu oturumun seridi/rolu bilinmiyor')
      expect(ek).not.toContain('DEPARTMAN HARİTASI')
    }, 60_000)

    it("tablo rollerinin hepsinde (yalnız OPS değil) başlıktan rol kartı gelir; harita yalnız OPS'ta", () => {
      kayitYaz('Araç')
      const { ek } = calistir('startup')
      expect(ek).toContain('ROL KARTI: ARAC')
      expect(ek).not.toContain('DEPARTMAN HARİTASI')
    }, 60_000)
  })

  it('claim YOK ve CC_LANE yok: pencere başlığı "Ops" ise rol OPS tanınır, harita ve rol kartı gelir', () => {
    const { ek } = calistir('startup', {}, { session_title: 'Ops' })
    expect(ek).toContain('ROL KARTI: OPS')
    expect(ek).toContain('DEPARTMAN HARİTASI')
  }, 60_000)

  it('AYIRT EDİCİLİK: OPS olmayan rolde ve başlıksız/tanımsız başlıkta harita GELMEZ, rol kartı bilinmiyor der', () => {
    expect(calistir('startup', { CC_LANE: 'ARAC' }).ek).not.toContain('DEPARTMAN HARİTASI')
    const bos = calistir('startup', {}, { session_title: '' }).ek
    expect(bos).not.toContain('DEPARTMAN HARİTASI')
    expect(bos).toContain('ROL KARTI: (bu oturumun seridi/rolu bilinmiyor')
    expect(calistir('startup', {}, { session_title: 'Baska Bir Ad' }).ek).not.toContain('DEPARTMAN HARİTASI')
  }, 120_000)

  it('FAIL-OPEN: üretici yoksa oturum açılır, harita yerine işaretçi satırı yazılır', () => {
    const { ek, durum } = calistir('startup', { CC_LANE: 'OPS', VH_ROL_KARTI_URETICI: path.join(gecici, 'yok-boyle-bir-uretici.cjs') })
    expect(durum).toBe(0)
    expect(ek).toContain('DEPARTMAN HARITASI: docs/roller/DEPARTMAN-HARITASI.md')
    expect(ek).not.toContain('GEO-SEO · ')
  }, 60_000)
})
