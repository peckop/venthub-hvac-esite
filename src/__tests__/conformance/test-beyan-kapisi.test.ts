import { createRequire } from 'node:module'
import path from 'node:path'

import { describe, expect, it } from 'vitest'

/**
 * INV-TEST-BEYAN-1 · HER TEST NEYİ DEĞİŞİNCE KOŞACAĞINI (TETİK) VE NEREDE KOŞACAĞINI (YER) KENDİSİ SÖYLER (ALT-38).
 *
 * NİÇİN VAR: Recep sordu: "kapıları oluşturuyoruz, bu kapılar yine çalışacak mı, test süresini yakacak mı?" Cevabın
 * mekanik karşılığı: her yeni test başlığında hangi dosyalar değişince koşması gerektiğini ve hangi yerde (PR kapısı ya da
 * zamanlı koşu) koştuğunu yazar. Beyansız yeni test birleşmez; böylece "değişikliğe göre test seçimi" (cetvel
 * docs/standards/test-karnesi-standard.md) beyan edilmemiş testi sessizce atlamaz. Eski testler beyan tabanındadır
 * (`scripts/test-karnesi/beyan-tabani.json`); taban yalnız KÜÇÜLÜR (beyanı yazılan dosya tabandan çıkarılır, yeni dosya
 * eklenemez, sayı tavanı aşağıda sabittir).
 *
 * Ölçüm yüzeyi: `git ls-files` + dosya başlığı (ilk 80 satır). Hiçbir dosyayı DEĞİŞTİRMEZ. Mantık: scripts/test-karnesi/beyan.cjs.
 *
 * TETİK: scripts/test-karnesi/beyan.cjs, scripts/test-karnesi/beyan-tabani.json, scripts/ci/dunya-durumu-testleri.json, src/__tests__/, scripts/test-karnesi/__tests__/, supabase/functions/, tests/
 * YER: PR
 */

const require_ = createRequire(import.meta.url)
const KOK = path.resolve(__dirname, '../../..')

interface Denetim {
  hatalar: string[]
  ozet: { test: number; beyanli: number; tabanda: number }
}
interface Girdi {
  dosyalar: string[]
  oku: (yol: string) => string
  taban: string[]
  dunya: string[]
}
const B = require_(path.join(KOK, 'scripts/test-karnesi/beyan.cjs')) as {
  beyanOku: (metin: string) => { tetik: string[] | null; yer: string | null; hatalar: string[] }
  ogeEslesir: (oge: string, dosyalar: string[]) => boolean
  denetle: (g: Girdi & { tavan?: number }) => Denetim
  depoGirdisi: () => Girdi
}

/** Bu dosya yazıldığı gün beyanı olmayan test sayısı; taban bunu AŞAMAZ (artırmak görünür, gerekçeli bir diff olmalı). */
const TABAN_TAVANI = 700

const TEMIZ = '/**\n * TETİK: src/a/**, docs/x.md\n * YER: PR\n */\n'
/** Eşleşme testleri için sabit "izlenen dosya" evreni. */
const DOSYALAR = ['src/a/b/c.ts', 'docs/x.md', 'src/yeni.test.ts', 'package.json']
/** Test dosyası OLMAYAN ama TETİK'in eşleşeceği dosyalar (denetim fikstürü). */
const DESTEK = ['src/a/b/c.ts', 'docs/x.md', 'package.json']

/**
 * Fikstür: izlenen dosyalar = destek dosyaları + `metinler` anahtarları + `taban` girdileri (`yetim` olanlar HARİÇ).
 * Böylece her senaryo yalnız kendi dosyalarını taşır.
 */
function denetim(
  metinler: Record<string, string>,
  ek: { taban?: string[]; dunya?: string[]; tavan?: number; yetim?: string[] } = {},
): Denetim {
  const taban = ek.taban ?? []
  const dosyalar = [...new Set([...DESTEK, ...Object.keys(metinler), ...taban.filter((t) => !(ek.yetim ?? []).includes(t))])]
  return B.denetle({
    dosyalar,
    oku: (y) => metinler[y] ?? '',
    taban,
    dunya: ek.dunya ?? [],
    tavan: ek.tavan,
  })
}

describe('INV-TEST-BEYAN-1 · test beyanı (TETİK + YER)', () => {
  it('DEPO: her test dosyası beyan eder ya da beyan tabanındadır; taban yalnız küçülür', () => {
    const { hatalar, ozet } = B.denetle({ ...B.depoGirdisi(), tavan: TABAN_TAVANI })
    expect(hatalar, `beyan hataları:\n  - ${hatalar.slice(0, 20).join('\n  - ')}`).toEqual([])
    // Kör çalışma kanaryası: evren boşsa hiçbir şey denetlenmemiştir ve kapı sessizce yeşil kalırdı.
    expect(ozet.test, 'test evreni beklenenden çok küçük: git ls-files okunamadı mı?').toBeGreaterThan(300)
  })

  it('beyanOku: iki satırı okur, tek satırlık blok yorumu ve CRLF dahil', () => {
    expect(B.beyanOku(TEMIZ)).toEqual({ tetik: ['src/a/**', 'docs/x.md'], yer: 'PR', hatalar: [] })
    expect(B.beyanOku('/** TETİK: a/b.ts; c/d.ts */\n// YER: zamanlı\n')).toEqual({ tetik: ['a/b.ts', 'c/d.ts'], yer: 'zamanli', hatalar: [] })
    expect(B.beyanOku(TEMIZ.replace(/\n/g, '\r\n')).hatalar).toEqual([])
    expect(B.beyanOku(' * TETIK: *\n * YER: pr\n')).toEqual({ tetik: ['*'], yer: 'PR', hatalar: [] })
  })

  it('beyanOku: eksik, boş, yinelenen, geçersiz değer ve 80. satırdan sonrası HATA', () => {
    expect(B.beyanOku('/** YER: PR */').hatalar).toContain('TETİK satırı yok')
    expect(B.beyanOku('/** TETİK: a.ts */').hatalar).toContain('YER satırı yok')
    expect(B.beyanOku('/** TETİK: */\n/** YER: PR */').hatalar).toContain('TETİK satırı boş')
    expect(B.beyanOku('/** TETİK: a.ts */\n/** TETİK: b.ts */\n/** YER: PR */').hatalar).toContain('TETİK satırı birden çok kez yazılmış')
    expect(B.beyanOku('/** TETİK: a.ts */\n/** YER: master */').hatalar.join(' ')).toContain('YER değeri geçersiz')
    expect(B.beyanOku('/** TETİK: a b.ts */\n/** YER: PR */').hatalar.join(' ')).toContain('boşluk')
    expect(B.beyanOku('/** TETİK: ../x.ts */\n/** YER: PR */').hatalar.join(' ')).toContain('göreli')
    const gec = `${'// dolgu\n'.repeat(80)}// TETİK: a.ts\n// YER: PR\n`
    expect(B.beyanOku(gec).hatalar.length, 'ilk 80 satırdan sonraki beyan SAYILMAMALI').toBeGreaterThan(0)
  })

  it('ogeEslesir: dizin, glob ve tam yol eşleşir; kapsam dışı ve boş eşleşme eşleşmez', () => {
    expect(B.ogeEslesir('*', [])).toBe(true)
    expect(B.ogeEslesir('src/a/', DOSYALAR)).toBe(true)
    expect(B.ogeEslesir('src/a/**', DOSYALAR)).toBe(true)
    expect(B.ogeEslesir('src/**/c.ts', DOSYALAR)).toBe(true)
    expect(B.ogeEslesir('docs/x.md', DOSYALAR)).toBe(true)
    expect(B.ogeEslesir('src/*.ts', DOSYALAR)).toBe(true)
    expect(B.ogeEslesir('src/*/c.ts', DOSYALAR), 'tek `*` iki yol parçasını eşlememeli').toBe(false)
    expect(B.ogeEslesir('src/b/**', DOSYALAR)).toBe(false)
    expect(B.ogeEslesir('docs/y.md', DOSYALAR)).toBe(false)
  })

  it('SABOTAJ: beyansız YENİ test, yazım hatalı TETİK, çelişen YER, şişen/yetim taban KIRMIZI yapar', () => {
    expect(denetim({ 'src/yeni.test.ts': TEMIZ }, { taban: ['src/eski.test.ts'] }).hatalar).toEqual([])
    expect(denetim({ 'src/yeni.test.ts': '// hiçbir şey' }, { taban: ['src/eski.test.ts'] }).hatalar.join(' ')).toContain('src/yeni.test.ts: TETİK/YER beyanı eksik')
    expect(
      denetim({ 'src/yeni.test.ts': TEMIZ.replace('src/a/**', 'src/yok-dizin/**') }, { taban: ['src/eski.test.ts'] }).hatalar.join(' '),
    ).toContain('hiçbir izlenen dosyayla eşleşmiyor')
    expect(
      denetim({ 'src/yeni.test.ts': TEMIZ, 'src/dunya.test.ts': TEMIZ }, { taban: ['src/eski.test.ts'], dunya: ['src/dunya.test.ts'] }).hatalar.join(' '),
    ).toContain('dünya durumu listesinde')
    expect(
      denetim({ 'src/yeni.test.ts': TEMIZ.replace('PR', 'zamanlı') }, { taban: ['src/eski.test.ts'] }).hatalar.join(' '),
    ).toContain('YOK (PR kapısında koşuyor)')
    expect(
      denetim({ 'src/yeni.test.ts': TEMIZ, 'src/eski.test.ts': TEMIZ }, { taban: ['src/eski.test.ts'] }).hatalar.join(' '),
    ).toContain('tabandan çıkarılmalı')
    expect(
      denetim({ 'src/yeni.test.ts': TEMIZ }, { taban: ['src/eski.test.ts', 'src/hayalet.test.ts'], yetim: ['src/hayalet.test.ts'] }).hatalar.join(' '),
    ).toContain('yetim kayıt')
    expect(denetim({ 'src/yeni.test.ts': TEMIZ }, { taban: ['src/eski.test.ts', 'src/baska.test.ts'], tavan: 1 }).hatalar.join(' ')).toContain('tavan 1')
  })

  it('zamanlı beyan + listede olan test geçer (PR kapısından çıkmış testin doğru beyanı)', () => {
    const r = denetim(
      { 'src/yeni.test.ts': TEMIZ, 'src/dunya.test.ts': TEMIZ.replace('PR', 'zamanlı') },
      { taban: ['src/eski.test.ts'], dunya: ['src/dunya.test.ts'] },
    )
    expect(r.hatalar).toEqual([])
    expect(r.ozet.beyanli).toBe(2)
  })
})
