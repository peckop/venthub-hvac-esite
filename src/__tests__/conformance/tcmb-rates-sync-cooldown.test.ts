/**
 * INV-TCMB-COOLDOWN-1 (OPS-293 D5) — `tcmb-rates-sync` kimliksizdir (verify_jwt=false); yetkisiz çağrı sahte kur
 * YAZDIRAMAZ ama her çağrı TCMB'ye giderdi (kaynak tüketimi). Sertleştirme: son TCMB satırı 30 dk'dan yeniyse ya da
 * isolate yakın zamanda TCMB'ye gittiyse TCMB'ye HİÇ gitmeden `carried:true` döner.
 *
 * Statik ölçüm (Deno ucu vitest'te koşmaz): (1) sabit 30 dk, (2) cooldown dönüşü TCMB `fetch`'inden ÖNCE,
 * (3) DB kolu `fetched_at`'e bakar, (4) okuma hatası fail-open. Sabotaj: cooldown kontrolü `fetch`'ten sonraya
 * taşınırsa ya da sabit değişirse kırmızı (aşağıdaki saf karar fonksiyonu bunu kanıtlar).
 */
import { readFileSync } from 'node:fs'
import { join } from 'node:path'

import { describe, expect, it } from 'vitest'

const KOD = readFileSync(join(process.cwd(), 'supabase', 'functions', 'tcmb-rates-sync', 'index.ts'), 'utf8')

/** Saf karar: kaynak metninde cooldown dönüşü TCMB istek satırından önce mi ve sabit 30 dk mı. */
function cooldownSorunlari(kod: string): string[] {
  const sorun: string[] = []
  if (!/const COOLDOWN_MS = 30 \* 60 \* 1000\b/.test(kod)) sorun.push('COOLDOWN_MS 30 dk degil')
  const fetchKonum = kod.indexOf('await fetch(TCMB_URL')
  const donusKonum = kod.search(/return cooldownYanit\(\)/)
  if (fetchKonum < 0) sorun.push('TCMB fetch satiri bulunamadi')
  if (donusKonum < 0) sorun.push('cooldown donusu yok')
  if (fetchKonum >= 0 && donusKonum >= 0 && donusKonum > fetchKonum) sorun.push('cooldown donusu TCMB fetch ten SONRA')
  if (!/\.select\('fetched_at'\)[\s\S]{0,120}\.eq\('source', 'tcmb'\)/.test(kod)) sorun.push('DB kolu fetched_at/source=tcmb okumuyor')
  if (!/reason: 'cooldown'/.test(kod)) sorun.push("yanit nedeni 'cooldown' degil")
  if (!/cooldown okunamadi/.test(kod)) sorun.push('okuma hatasi loglanmiyor (fail-open kaniti)')
  return sorun
}

describe('INV-TCMB-COOLDOWN-1 · tcmb-rates-sync cooldown', () => {
  it('⭐karne kilidi: cooldown, TCMB isteğinden ÖNCE ve 30 dk', () => {
    expect(cooldownSorunlari(KOD)).toEqual([])
  })

  it('dedektör sabotajı: cooldown fetch’ten sonraya taşınırsa, sabit değişirse ya da DB kolu kalkarsa KIRMIZI', () => {
    const fetchSatiri = "const res = await fetch(TCMB_URL, { headers: { Accept: 'application/xml' } })"
    // (a) donus fetch'ten sonra
    const sonraya = KOD.replaceAll('return cooldownYanit()', '/* kaldirildi */').replace(fetchSatiri, `${fetchSatiri}\nreturn cooldownYanit()`)
    expect(cooldownSorunlari(sonraya).join('|')).toContain('SONRA')
    // (b) sabit
    expect(cooldownSorunlari(KOD.replace('30 * 60 * 1000', '1000')).join('|')).toContain('30 dk degil')
    // (c) DB kolu
    expect(cooldownSorunlari(KOD.replace(".select('fetched_at')", ".select('id')")).join('|')).toContain('fetched_at')
    // (d) cooldown tamamen yok
    expect(cooldownSorunlari(KOD.replaceAll('return cooldownYanit()', '')).join('|')).toContain('cooldown donusu yok')
  })

  it('yanıt gövdesinde iç hata metni yok (S4 ile uyumlu): cooldown yanıtı sabit koddur', () => {
    expect(KOD).toMatch(/reason: 'cooldown'/)
    expect(KOD).not.toMatch(/reason: 'cooldown'[^}]*\.message/)
  })
})
