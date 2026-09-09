/**
 * REC-280 — hafıza indeksi bekçisinin DÜZENEĞİNİ korur.
 *
 * NİÇİN VAR (ölçülmüş vaka, 2026-09-07 20:41–20:57Z): `MEMORY.md` 16384 baytı aşınca alt
 * satırlar **sessizce** kırpılıyor; o gece 16510 bayta çıktı ve en alttaki dersler hiçbir
 * oturuma yüklenmedi. Aynı dakikalarda üç şerit ayrı ayrı kısalttı ve **son yazan öncekini
 * ezdi**. İki ayrı kusur: taşma görünmüyordu, kayıp yazım hiç görünmüyordu.
 *
 * Bu paket kancanın "doğru karar verdiğini" değil, **uyarı olarak kaldığını**, **ayırt
 * ettiğini** ve **kimlik sızdırmadığını** ölçer. Davranış kolları gerçek koşumla ölçülür:
 * kaynak taraması, bir kolun sessizce ölmesini görmez.
 */
import { spawnSync } from 'node:child_process'
import fs from 'node:fs'
import os from 'node:os'
import path from 'node:path'

import { describe, expect, it } from 'vitest'

function repoKoku(): string {
  return spawnSync('git', ['rev-parse', '--path-format=absolute', '--show-toplevel'], {
    encoding: 'utf8',
  }).stdout.trim()
}
const KOK = repoKoku()
const oku = (p: string): string => fs.readFileSync(path.join(KOK, p), 'utf8')

const KANCA = '.claude/hooks/hafiza-indeks-bekcisi.cjs'
const PRECOMPACT = '.claude/hooks/precompact-durum-kapisi.cjs'

/** Fikstür hafıza dizini kurar: 40 satırlık indeks + BİRİ katlanmış ders. */
function fiksturKur(): { kok: string; idx: string; transcript: string; ham: string } {
  const kok = fs.mkdtempSync(path.join(os.tmpdir(), 'rec280-'))
  const m = path.join(kok, 'memory')
  fs.mkdirSync(m)
  const satirlar = ['# Memory Index', '']
  for (let i = 1; i <= 40; i++) {
    const n = String(i).padStart(2, '0')
    satirlar.push(`- [Ders Basligi Numara ${n}](ders-${n}.md) — bu satir olcum icin uretildi`)
  }
  const ham = satirlar.join('\n') + '\n'
  const idx = path.join(m, 'MEMORY.md')
  fs.writeFileSync(idx, ham, 'utf8')
  // KATLANMIŞ ders: başlığı bir dizin dosyasında geçiyor → kol SUSMALI
  fs.writeFileSync(path.join(m, 'dizin-ornek.md'), '## Ders Basligi Numara 07\nkatlandi.\n', 'utf8')
  const transcript = path.join(kok, 'sahte.jsonl')
  fs.writeFileSync(transcript, '{}\n', 'utf8')
  return { kok, idx, transcript, ham }
}

function kos(
  transcript: string,
  toolInput: Record<string, unknown>,
): { kod: number | null; cikti: string } {
  const r = spawnSync(process.execPath, [path.join(KOK, KANCA)], {
    input: JSON.stringify({
      session_id: 'sahte',
      transcript_path: transcript,
      tool_name: 'Write',
      tool_input: toolInput,
    }),
    encoding: 'utf8',
  })
  return { kod: r.status, cikti: `${r.stdout ?? ''}${r.stderr ?? ''}` }
}

describe('REC-280 · hafıza indeksi bekçisi UYARI olarak kalıyor ve AYIRT EDİYOR', () => {
  it('settings.json PreToolUse listesinde BAĞLI (bağlanmamış kanca yoktur)', () => {
    const s = JSON.parse(oku('.claude/settings.json')) as {
      hooks: { PreToolUse: Array<{ matcher?: string; hooks: Array<{ command: string }> }> }
    }
    const komutlar = s.hooks.PreToolUse.flatMap((g) =>
      g.hooks.map((h) => `${g.matcher ?? ''}::${h.command}`),
    )
    const bagli = komutlar.find((k) => k.includes('hafiza-indeks-bekcisi.cjs'))
    expect(bagli, 'kanca settings.json PreToolUse altında bağlı değil — koşmayan kanca YOKTUR').toBeTruthy()
    expect(bagli, 'yazma araçlarına bağlanmamış: Edit|Write|MultiEdit eşleştiricisi gerekli').toContain('Write')
  })

  it('⛔BLOKLAMAZ: kaynakta exit 2 YOK ve kendi hatasında da çıkış 0 + tek satır basar', () => {
    const s = oku(KANCA)
    expect(/process\.exit\(2\)/.test(s), 'kanca bloklamaya dönüşmüş — hafıza yazımını durdurmak oturum kaydını kaybettirir').toBe(false)
    // OPS şartı: bekçi kendi hatasında SESSİZ olmasın (fail-open kapı dersi).
    expect(s, 'kendi hatasını söyleyen dal yok — "uyarı gelmedi" ile "bekçi çalışmadı" ayırt edilemez olur').toMatch(/BEKCI CALISAMADI/)
  })

  it('⛔MUTLAK YOL YAZILMAZ (§24 kimlik sızdırma — depo PUBLIC), dizin türetilir', () => {
    const s = oku(KANCA)
    expect(
      /[A-Za-z]:[\\/]Users[\\/]|\/Users\/|\/home\/[a-z]/.test(s),
      'kancada kullanıcı adı taşıyan mutlak yol var — public depoda kimlik sızdırır',
    ).toBe(false)
    expect(s, 'hafıza dizini türetilmiyor (os.homedir + transcript kanıtı)').toMatch(/os\.homedir\(\)/)
  })

  /**
   * ⭐AYIRT EDİCİ ÇİFT — bu koldaki asıl iş. Bir satırın indeksten çıkması MEŞRU olabilir
   * (dizin-*.md dosyasına katlanmıştır). Ayırt etmeyen bir kol, her katlamada yanan bir
   * lamba üretir ve iki günde mobilyaya döner; ayırt etmeyen kol ölçüm değildir.
   */
  it('⭐KATLANMIŞ satır SESSİZ, KATLANMAMIŞ satır UYARIR (ve satırı gösterir)', () => {
    const { idx, transcript, ham } = fiksturKur()
    const satirlar = ham.split('\n')

    const katlanmis = kos(transcript, {
      file_path: idx,
      content: satirlar.filter((s) => !s.includes('Numara 07')).join('\n'),
    })
    expect(katlanmis.kod).toBe(0)
    expect(
      katlanmis.cikti.trim(),
      'katlanmış (dizin dosyasına taşınmış) satır KAYIP sanıldı — kol katlama ile kaybı ayırt etmiyor',
    ).toBe('')

    const silinmis = kos(transcript, {
      file_path: idx,
      content: satirlar.filter((s) => !s.includes('Numara 13')).join('\n'),
    })
    expect(silinmis.kod, 'uyarı bloklamaya dönüşmüş').toBe(0)
    expect(silinmis.cikti, 'gerçekten silinen satır için uyarı YOK — 09-07 kaybı yine görünmez olur').toMatch(/KAYIP YAZIM SUPHESI/)
    expect(silinmis.cikti, 'kaybolan satır GÖSTERİLMİYOR; okuyan neyin gittiğini bilemez').toMatch(/Numara 13/)
  })

  it('NORMALİZE: yalnız boşluk farkı kayıp sayılmaz (yalancı uyarı yasağı — OPS şartı)', () => {
    const { idx, transcript, ham } = fiksturKur()
    const bosluklu = ham
      .split('\n')
      .map((s) => (s.includes('Numara 21') ? `${s}   ` : s))
      .join('\n')
    const r = kos(transcript, { file_path: idx, content: bosluklu })
    expect(r.cikti.trim(), 'boşluk farkı kayıp sayıldı — kol her dokunuşta yalancı uyarı basar').toBe('')
  })

  it('YUMUŞAK EŞİK: 15800 üstünde UYARIR, altında SUSAR (ikinci ayırt edici çift)', () => {
    const { idx, transcript, ham } = fiksturKur()

    const altinda = kos(transcript, { file_path: idx, content: `${ham}- [Yeni](y.md) — eklendi\n` })
    expect(altinda.cikti.trim(), 'eşik altında uyarı basıldı — gürültü').toBe('')

    const buyuk = `${ham}- [Dolgu](d.md) — ${'x'.repeat(13000)}\n`
    fs.writeFileSync(idx, buyuk, 'utf8')
    expect(fs.statSync(idx).size, 'fikstür yumuşak eşiği aşmıyor; kol boş koşar').toBeGreaterThanOrEqual(15800)
    const ustunde = kos(transcript, { file_path: idx, content: `${buyuk}- [Yeni](y.md) — eklendi\n` })
    expect(ustunde.cikti, 'yumuşak eşik uyarısı yok — taşma yine ancak OTOPSİDE görülür').toMatch(/YUMUSAK ESIK/)
  })

  it('PRECOMPACT İKİ EŞİK taşır ve ikisi FARKLI şey söyler (aynı sayıya iki anlam yüklenmez)', () => {
    const s = oku(PRECOMPACT)
    expect(s, 'sert eşik kaybolmuş').toMatch(/MEMORY_ESIK_BAYT = 16384/)
    expect(s, 'yumuşak eşik eklenmemiş').toMatch(/MEMORY_YUMUSAK_ESIK_BAYT = 15800/)
    expect(s, 'sert eşik metni yumuşak eşikle aynı şeyi söylüyor — okuyan aciliyeti ayırt edemez').toMatch(/OTOPSI/)
    expect(s).toMatch(/YUMUSAK esik/)
  })
})
