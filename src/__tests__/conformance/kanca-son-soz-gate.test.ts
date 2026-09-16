import { spawnSync } from 'node:child_process'
import fs from 'node:fs'
import os from 'node:os'
import path from 'node:path'

import { describe, expect, it } from 'vitest'

/**
 * INV-KANCA-SON-SOZ-1 · `son-soz-gate` kancasının KARARI ölçülür.
 *
 * ÖLÇÜLMÜŞ KUSUR (REC-306, 2026-09-12): kancanın davranışını ölçen hiçbir test yoktu.
 * Kanca `Stop`u `exit 2` ile bloklar, yani turu bitirmeye izin vermez: yanlış pozitifte
 * oturum bitmek istediği hâlde döngüye girer (kullanıcı bekler), yanlış negatifte cevap
 * araç çıktılarının arasına gömülür ve kullanıcı cevabını hiç görmez. Kancanın kendisi
 * Recep'in 10+ kez tekrarlanan şikâyeti üzerine yazıldı; şikâyetin geri gelmemesi bu
 * kapının doğru çalışmasına bağlı.
 *
 * ⭐SENTETİK TRANSKRIPT: kanca kararı transkript dosyasının KUYRUĞUNDAN okur. Vakalar
 * geçici bir `.jsonl` ile kurulur — gerçek oturum kaydına dokunulmaz.
 *
 * Cetvel: `fleet-mechanism-standard.md` (exit 0/2) · `execution-method-standard.md` §8.1.
 */

const KANCA = path.resolve(__dirname, '../../../.claude/hooks/son-soz-gate.cjs')

/** 50 karakter eşiğini rahatça geçen gerçekçi bir kapanış metni. */
const UZUN_METIN =
  'Is bitti: olcum yapildi, kapilar yesil ve sonucu buraya yaziyorum ki cevap gorunur olsun.'

const insan = (metin: string) => ({ type: 'user', message: { content: metin } })
const asistanMetin = (metin: string) => ({ type: 'assistant', message: { content: [{ type: 'text', text: metin }] } })
const asistanArac = () => ({
  type: 'assistant',
  message: { content: [{ type: 'text', text: 'bakiyorum' }, { type: 'tool_use', name: 'Bash', input: {} }] },
})

interface Sonuc {
  kod: number | null
  stderr: string
}

/** Sentetik transkripti yazar ve kancayı koşar. */
function kos(
  kayitlar: unknown[],
  secenek: { ek?: Record<string, unknown>; cwd?: string; hamGirdi?: string; yolYok?: boolean } = {},
): Sonuc {
  const dizin = fs.mkdtempSync(path.join(os.tmpdir(), 'vh-transkript-'))
  const yol = path.join(dizin, 'oturum.jsonl')
  if (!secenek.yolYok) {
    fs.writeFileSync(yol, kayitlar.map((k) => JSON.stringify(k)).join('\n') + '\n', 'utf8')
  }
  const girdi = { transcript_path: yol, ...(secenek.ek ?? {}) }
  const r = spawnSync(process.execPath, [KANCA], {
    input: secenek.hamGirdi ?? JSON.stringify(girdi),
    encoding: 'utf8',
    cwd: secenek.cwd ?? process.cwd(),
  })
  return { kod: r.status, stderr: r.stderr ?? '' }
}

describe('INV-KANCA-SON-SOZ-1 · tur kullanıcıya yazılmış metinle bitmeli', () => {
  it('son blok yeterli uzunlukta METİN ise tur BİTEBİLİR', () => {
    expect(kos([insan('durum ne'), asistanMetin(UZUN_METIN)]).kod).toBe(0)
  })

  it('son blok ARAÇ ÇAĞRISI ise tur BLOKLANIR ve sebep söylenir', () => {
    const r = kos([insan('durum ne'), asistanArac()])
    expect(r.kod, 'araçla biten tur bloklanmadı').toBe(2)
    expect(r.stderr, 'sebep söylenmiyor').toContain('SON SÖZ')
    expect(r.stderr, 'son blok tipi raporlanmıyor').toContain('tool_use')
  })

  it('EŞİK KOLU: metin var ama çok kısaysa (50 karakter altı) tur BLOKLANIR', () => {
    // Eşik bilinçli: "tamam" ya da tek kelimelik bir kapanış, cevap değildir.
    expect(kos([insan('durum ne'), asistanMetin('tamam')]).kod).toBe(2)
    expect(kos([insan('durum ne'), asistanMetin(UZUN_METIN)]).kod, 'eşik yanlış tarafta').toBe(0)
  })

  it('araç çağrısından SONRA metin gelirse tur biter — sıra önemlidir, varlık değil', () => {
    expect(kos([insan('durum ne'), asistanArac(), asistanMetin(UZUN_METIN)]).kod).toBe(0)
  })
})

describe('INV-KANCA-SON-SOZ-1 · YANLIŞ-POZİTİF kolları (kapı turu kilitlememeli)', () => {
  it('turda GERÇEK kullanıcı mesajı yoksa kapı KARIŞMAZ', () => {
    // Bildirim/cron turları: kimse cevap beklemiyor. Burada bloklamak oturumu sonsuz
    // döngüye sokar — kapının en pahalı yanlış pozitifi budur.
    const bildirim = { type: 'user', message: { content: '[SYSTEM NOTIFICATION] arka plan isi bitti' } }
    const yerelKomut = { type: 'user', message: { content: '<local-command-caveat>x</local-command-caveat>' } }
    expect(kos([bildirim, asistanArac()]).kod, 'bildirim turunda bloklandı').toBe(0)
    expect(kos([yerelKomut, asistanArac()]).kod, 'yerel komut turunda bloklandı').toBe(0)
  })

  it('araç SONUCU taşıyan kullanıcı kaydı insan mesajı sayılmaz', () => {
    const aracSonucu = { type: 'user', message: { content: [{ type: 'tool_result', content: 'cikti' }] } }
    expect(kos([aracSonucu, asistanArac()]).kod).toBe(0)
  })

  it('kancanın kendisi devredeyken (döngü koruması) karışmaz', () => {
    expect(kos([insan('durum ne'), asistanArac()], { ek: { stop_hook_active: true } }).kod).toBe(0)
  })

  it('insan mesajından sonra hiç asistan kaydı yoksa karışmaz', () => {
    expect(kos([insan('durum ne')]).kod).toBe(0)
  })
})

describe('INV-KANCA-SON-SOZ-1 · sözleşme sınırları', () => {
  it('bozuk girdi / olmayan transkript KARIŞMAZ', () => {
    expect(kos([], { hamGirdi: 'bu JSON degil' }).kod, 'bozuk JSON bloklandı').toBe(0)
    expect(kos([], { hamGirdi: '{}' }).kod, 'transkript yolu yokken bloklandı').toBe(0)
    expect(kos([insan('x'), asistanArac()], { yolYok: true }).kod, 'olmayan dosyada bloklandı').toBe(0)
  })

  it('⭐bozuk / boş girdide SESSİZ KALMAZ — stderr tek satır (cetvel §9.7)', () => {
    expect(kos([], { hamGirdi: 'bu JSON degil' }).stderr).toContain('stdin okunamadi')
    expect(kos([], { hamGirdi: '' }).stderr).toContain('stdin okunamadi')
    // Geçerli JSON, kapının karışmadığı normal hâl: uyarı üretmemeli.
    expect(kos([insan('durum ne'), asistanMetin(UZUN_METIN)]).stderr, 'normal hâlde gürültü').toBe('')
  })

  it('bozuk transkript satırı yutulur, karar yine verilir', () => {
    const dizin = fs.mkdtempSync(path.join(os.tmpdir(), 'vh-transkript-'))
    const yol = path.join(dizin, 'oturum.jsonl')
    fs.writeFileSync(
      yol,
      ['{bu satir bozuk', JSON.stringify(insan('durum ne')), JSON.stringify(asistanArac())].join('\n') + '\n',
      'utf8',
    )
    const r = spawnSync(process.execPath, [KANCA], {
      input: JSON.stringify({ transcript_path: yol }),
      encoding: 'utf8',
    })
    expect(r.status, 'bozuk satır kararı düşürdü').toBe(2)
  })

  it('KARAR CWD\'DEN BAĞIMSIZ — depo dışından koşarken de aynı', () => {
    const disari = os.tmpdir()
    expect(kos([insan('durum ne'), asistanArac()], { cwd: disari }).kod).toBe(2)
    expect(kos([insan('durum ne'), asistanMetin(UZUN_METIN)], { cwd: disari }).kod).toBe(0)
  })
})
