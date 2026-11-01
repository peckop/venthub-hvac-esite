import { createRequire } from 'node:module'
import path from 'node:path'

import { describe, expect, it } from 'vitest'

/**
 * INV-YESIL-PR-1 · Yeşil PR tarayıcı (ARC-170, ARC-167 bulgusu).
 *
 * Ölçülmüş vaka (16 Ekim 2026): 4 yeşil PR 3 saat birleşmeyi bekledi; CI'ın yeşil bitmesi kimseyi
 * uyandırmıyordu. Karar çekirdeği saftır: ağa ve gh'ye dokunmaz, girdiyi bu dosya üretir.
 */

const require_ = createRequire(import.meta.url)
const KOK = path.resolve(__dirname, '..', '..', '..')

interface Kapi {
  name: string
  bucket: string
}
interface Pr {
  number: number
  title: string
  headRefName: string
  isDraft: boolean
  mergeStateStatus: string
  dosyalar: string[] | null
  yorumlar: string[]
  kapilar: Kapi[] | null
  etiketler?: string[]
  govde?: string
}
interface Satir {
  no: number
  sahip: string
  kova: string
  sebep: string
  oneri: string
}

const motor = require_(path.join(KOK, 'scripts', 'hijyen', 'yesil-pr.cjs')) as {
  siniflandir: (pr: Pr, cekirdek: string[], simdi?: number) => { kova: string; sebep: string }
  tara: (prler: Pr[], cekirdek: string[]) => { satirlar: Satir[]; sayim: Record<string, number> }
  sahip: (dal: string) => string
  unknownlariTazele: (
    prler: Pr[],
    oku: (no: number) => Promise<string | null>,
    bekle: (ms: number) => Promise<void>,
    bekleMs?: number,
  ) => Promise<number>
}

const CEKIRDEK = ['ci', 'advisor']
const gecti = (adlar: string[]): Kapi[] => adlar.map((name) => ({ name, bucket: 'pass' }))

function pr(ek: Partial<Pr> = {}): Pr {
  return {
    number: 1,
    title: 't',
    headRefName: 'arac/arc170-x',
    isDraft: false,
    mergeStateStatus: 'CLEAN',
    dosyalar: ['src/a.ts'],
    yorumlar: [],
    kapilar: gecti(CEKIRDEK),
    ...ek,
  }
}

describe('INV-YESIL-PR-1 yeşil PR tarayıcı', () => {
  it('çekirdeği geçmiş, CLEAN, sıradan dosyalı PR hazırdır', () => {
    expect(motor.siniflandir(pr(), CEKIRDEK).kova).toBe('hazir')
  })

  it('düşen kapı kırmızıdır; skipping düşen sayılmaz', () => {
    const k = [...gecti(CEKIRDEK), { name: 'lint', bucket: 'fail' }]
    expect(motor.siniflandir(pr({ kapilar: k }), CEKIRDEK)).toEqual({ kova: 'kirmizi', sebep: 'lint' })
    const s = [...gecti(CEKIRDEK), { name: 'ajan', bucket: 'skipping' }]
    expect(motor.siniflandir(pr({ kapilar: s }), CEKIRDEK).kova).toBe('hazir')
  })

  it('çekirdek kapı doğmamışsa ya da bekliyorsa yeşil sayılmaz (sabotaj: boş kapı listesi hazır olamaz)', () => {
    expect(motor.siniflandir(pr({ kapilar: [] }), CEKIRDEK).kova).toBe('ci-suruyor')
    const b = [{ name: 'ci', bucket: 'pending' }, { name: 'advisor', bucket: 'pass' }]
    expect(motor.siniflandir(pr({ kapilar: b }), CEKIRDEK)).toEqual({ kova: 'ci-suruyor', sebep: 'ci' })
  })

  it('DIRTY çakışma, BEHIND eski taban, UNKNOWN ölçülemedi, okunamayan kapı ölçülemedi', () => {
    expect(motor.siniflandir(pr({ mergeStateStatus: 'DIRTY' }), CEKIRDEK).kova).toBe('cakisma')
    expect(motor.siniflandir(pr({ mergeStateStatus: 'BEHIND' }), CEKIRDEK).kova).toBe('eski-taban')
    expect(motor.siniflandir(pr({ mergeStateStatus: 'UNKNOWN' }), CEKIRDEK).kova).toBe('olculemedi')
    expect(motor.siniflandir(pr({ kapilar: null }), CEKIRDEK).kova).toBe('olculemedi')
  })

  it('migration içeren yeşil PR Recep onayına düşer, hazır sayılmaz (kural 13)', () => {
    const m = pr({ dosyalar: ['supabase/migrations/20261101000000_x.sql'] })
    expect(motor.siniflandir(m, CEKIRDEK).kova).toBe('recep-onayi')
  })

  it('kanca/ayar farkı OPS UYGUN yorumu yoksa OPS onayına düşer, varsa hazırdır', () => {
    const k = pr({ dosyalar: ['.claude/hooks/x.cjs'] })
    expect(motor.siniflandir(k, CEKIRDEK).kova).toBe('ops-onayi')
    expect(motor.siniflandir({ ...k, yorumlar: ['OPS: tam fark UYGUN'] }, CEKIRDEK).kova).toBe('hazir')
  })

  it('bekletiliyor etiketi ya da tarihi geçmemiş bekle: satırı hazır saymaz; tarihi geçmiş satır saymaz', () => {
    const simdi = Date.parse('2026-11-01T12:00:00Z')
    expect(motor.siniflandir({ ...pr(), etiketler: ['bekletiliyor'] }, CEKIRDEK, simdi).kova).toBe('bekletilen')
    const govde = 'Kanban: URN-85\nbekle: 2026-11-20 urun icerigiyle birlikte acilir'
    expect(motor.siniflandir({ ...pr(), govde }, CEKIRDEK, simdi).kova).toBe('bekletilen')
    const eski = 'bekle: 2026-10-01 eski engel'
    expect(motor.siniflandir({ ...pr(), govde: eski }, CEKIRDEK, simdi).kova).toBe('hazir')
  })

  it('UNKNOWN PR bir kez beklenip yeniden sorulur; taslak ve bilinen durum sorulmaz; okunamazsa eski değer kalır', async () => {
    const beklemeler: number[] = []
    const sorulan: number[] = []
    const prler = [
      pr({ number: 1, mergeStateStatus: 'UNKNOWN' }),
      pr({ number: 2, mergeStateStatus: 'UNKNOWN' }),
      pr({ number: 3, mergeStateStatus: 'CLEAN' }),
      pr({ number: 4, mergeStateStatus: 'UNKNOWN', isDraft: true }),
    ]
    const n = await motor.unknownlariTazele(
      prler,
      async (no) => {
        sorulan.push(no)
        if (no === 2) throw new Error('ag yok')
        return 'CLEAN'
      },
      async (ms) => {
        beklemeler.push(ms)
      },
    )
    expect(n).toBe(2)
    expect(beklemeler).toEqual([5000])
    expect(sorulan.sort()).toEqual([1, 2])
    expect(prler.map((p) => p.mergeStateStatus)).toEqual(['CLEAN', 'UNKNOWN', 'CLEAN', 'UNKNOWN'])
    const bos = await motor.unknownlariTazele([pr()], async () => 'CLEAN', async (ms) => {
      beklemeler.push(ms)
    })
    expect(bos).toBe(0)
    expect(beklemeler).toEqual([5000])
  })

  it('taslak ayrı kovadadır; sahip dal adından okunur', () => {
    expect(motor.siniflandir(pr({ isDraft: true, kapilar: null }), CEKIRDEK).kova).toBe('taslak')
    expect(motor.sahip('urun/urn85-x')).toBe('URUN')
    expect(motor.sahip('master')).toBe('?')
  })

  it('tara hazırları başa dizer, sayar ve sahibe öneri yazar', () => {
    const s = motor.tara(
      [pr({ number: 9, mergeStateStatus: 'DIRTY', headRefName: 'blog/b' }), pr({ number: 3 })],
      CEKIRDEK,
    )
    expect(s.satirlar.map((r) => r.no)).toEqual([3, 9])
    expect(s.sayim.hazir).toBe(1)
    expect(s.sayim.cakisma).toBe(1)
    expect(s.satirlar[0].oneri).toContain('ARAC: #3')
    expect(s.satirlar[1].oneri).toContain('BLOG: #9')
  })
})
