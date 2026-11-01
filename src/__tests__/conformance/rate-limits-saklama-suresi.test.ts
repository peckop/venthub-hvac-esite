/**
 * REC-294 düzeneği — public.rate_limits ham IP anahtarlarını süresiz tutmaz.
 *
 * Migration metnine bakan statik kapı (DB'siz). Korunan: (1) temizlik fonksiyonu alt sınır freniyle ve yalnız
 * service_role yetkisiyle var, (2) pg_cron günlük işi kuruluyor, (3) migration kendini sınıyor, (4) geri alma var,
 * (5) SONRAKİ bir migration cron işini sessizce kaldırmıyor (ya da fonksiyonu düşürmüyor).
 */
import { execFileSync } from 'node:child_process'
import fs from 'node:fs'
import path from 'node:path'

import { describe, expect, it } from 'vitest'

function repoKoku(): string {
  return execFileSync('git', ['rev-parse', '--path-format=absolute', '--show-toplevel'], {
    encoding: 'utf8',
  }).trim()
}
const KOK = repoKoku()
const MIG = '20261101160000_rec294_rate_limits_saklama_suresi.sql'
const MIG_DIZIN = path.join(KOK, 'supabase', 'migrations')
const GERI_AL = 'scripts/db/rollback/20261101160000_rec294_rate_limits_saklama_suresi_geri_al.sql'

const sqlYorumsuz = (m: string): string =>
  m
    .split('\n')
    .map((s) => s.replace(/--.*$/, ''))
    .join('\n')

/** Saf fonksiyon: SQL cron işini kaldırıyor ya da temizlik fonksiyonunu düşürüyor mu? */
export function temizligiKaldiriyor(sql: string): boolean {
  const kod = sqlYorumsuz(sql)
  return (
    /cron\.unschedule\(\s*'rate-limits-temizle'\s*\)/i.test(kod) ||
    /drop\s+function\s+(?:if\s+exists\s+)?(?:public\.)?rate_limits_temizle/i.test(kod)
  )
}

describe('REC-294 migration', () => {
  const kod = sqlYorumsuz(fs.readFileSync(path.join(MIG_DIZIN, MIG), 'utf8'))

  it('temizlik fonksiyonu alt sınır freniyle var, silme bucket süresine bağlı', () => {
    expect(/function public\.rate_limits_temizle\(p_saklama interval/i.test(kod)).toBe(true)
    expect(/p_saklama < interval '2 hours'/i.test(kod), 'alt sınır freni yok').toBe(true)
    expect(/delete from public\.rate_limits where bucket < now\(\) - p_saklama/i.test(kod)).toBe(true)
  })

  it('yalnız service_role çalıştırır (public, anon, authenticated kapalı)', () => {
    expect(/revoke all on function public\.rate_limits_temizle\(interval\) from public/i.test(kod)).toBe(true)
    expect(/revoke all on function public\.rate_limits_temizle\(interval\) from anon, authenticated/i.test(kod)).toBe(true)
    expect(/grant execute on function public\.rate_limits_temizle\(interval\) to service_role/i.test(kod)).toBe(true)
    expect(/rate_limits_temizle\(interval\) to [^;]*\b(anon|authenticated|public)\b/i.test(kod)).toBe(false)
  })

  it('pg_cron günlük işi kuruluyor ve migration kendini sınıyor', () => {
    expect(/cron\.schedule\(\s*'rate-limits-temizle'/i.test(kod)).toBe(true)
    expect(/'17 3 \* \* \*'/.test(kod)).toBe(true)
    expect(/1 günden eski % satır kaldı/.test(kod), 'Guard E (kalan satır) yok').toBe(true)
    expect(/begin;/i.test(kod) && /commit;/i.test(kod)).toBe(true)
    expect(/set lock_timeout/i.test(kod)).toBe(true)
  })

  it('geri alma betiği cron işini kaldırır ve fonksiyonu düşürür', () => {
    const geri = sqlYorumsuz(fs.readFileSync(path.join(KOK, GERI_AL), 'utf8'))
    expect(temizligiKaldiriyor(geri)).toBe(true)
    expect(/cron\.unschedule\('rate-limits-temizle'\)/i.test(geri)).toBe(true)
    expect(/drop function if exists public\.rate_limits_temizle\(interval\)/i.test(geri)).toBe(true)
  })
})

describe('REC-294 temizliği sonradan kimse kaldırmaz', () => {
  it('SABOTAJ: cron kaldıran ya da fonksiyonu düşüren SQL yakalanır', () => {
    expect(temizligiKaldiriyor("select cron.unschedule('rate-limits-temizle');")).toBe(true)
    expect(temizligiKaldiriyor('DROP FUNCTION IF EXISTS public.rate_limits_temizle(interval);')).toBe(true)
    expect(temizligiKaldiriyor("-- cron.unschedule('rate-limits-temizle') yorum")).toBe(false)
    expect(temizligiKaldiriyor('select 1;')).toBe(false)
  })

  it('REC-294 sonrası hiçbir migration temizliği kaldırmıyor', () => {
    const sonrasi = fs
      .readdirSync(MIG_DIZIN)
      .filter((f) => /^\d{14}_/.test(f) && f.slice(0, 14) > MIG.slice(0, 14) && f.endsWith('.sql'))
    const kirli = sonrasi.filter((f) => temizligiKaldiriyor(fs.readFileSync(path.join(MIG_DIZIN, f), 'utf8')))
    expect(kirli, 'rate_limits günlük temizliğini kaldıran migration (KVKK saklama borcu geri gelir)').toEqual([])
  })
})
