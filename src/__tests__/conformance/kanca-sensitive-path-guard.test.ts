import { spawnSync } from 'node:child_process'
import os from 'node:os'
import path from 'node:path'

import { describe, expect, it } from 'vitest'

/**
 * INV-KANCA-HASSAS-YOL-1 · `sensitive-path-guard` kancasının KARARI ölçülür.
 *
 * ÖLÇÜLMÜŞ KUSUR (REC-306, 2026-09-12): bu kancanın davranışını ölçen hiçbir test yoktu.
 * Kanca iki sınıfı ayırır ve ayrımı YANLIŞ yapması iki yönde de pahalıdır:
 *   · `.env` ailesi → **deny**. Repo 2026-08-15'ten beri PUBLIC ve geçmiş silinemez; bir sır
 *     commit'lenirse geri dönüşü yok. Kanca burada kaçırırsa hasar kalıcıdır.
 *   · `supabase/migrations/**` → **ask**. Kural 13: migration içeren dal master'a merge
 *     edilince prod DB'ye OTOMATİK uygulanır. Dosyayı yazmak masum görünür, zincirin ucu prod.
 *
 * ⭐SÖZLEŞME FARKI, ADIYLA: bu kanca çıkış KODUYLA konuşmaz. Karar verirken stdout'a
 * `hookSpecificOutput.permissionDecision` basar ve **daima exit 0** verir. "Exit 0 = izin
 * verdi" varsayımı bu kancada YANLIŞTIR — ölçüt stdout'taki karardır. Bu, `exit 2` kullanan
 * kardeş kancalardan (lane-guard, protect-config) bilinçli bir ayrılıktır.
 *
 * Cetvel: `docs/standards/fleet-mechanism-standard.md` · CLAUDE.md kural 13 ·
 * `execution-method-standard.md` §8.1.
 */

const KANCA = path.resolve(__dirname, '../../../.claude/hooks/sensitive-path-guard.cjs')

interface Sonuc {
  kod: number | null
  karar: string | null
  sebep: string
}

/** Kancayı koşar ve stdout'taki KARARI çözer (yoksa karar = null, yani karışmadı). */
function kos(file_path: string, secenek: { cwd?: string; hamGirdi?: string } = {}): Sonuc {
  const r = spawnSync(process.execPath, [KANCA], {
    input: secenek.hamGirdi ?? JSON.stringify({ tool_name: 'Write', tool_input: { file_path } }),
    encoding: 'utf8',
    cwd: secenek.cwd ?? process.cwd(),
  })
  const ham = (r.stdout ?? '').trim()
  if (!ham) return { kod: r.status, karar: null, sebep: '' }
  const j = JSON.parse(ham) as {
    hookSpecificOutput?: { permissionDecision?: string; permissionDecisionReason?: string }
  }
  return {
    kod: r.status,
    karar: j.hookSpecificOutput?.permissionDecision ?? null,
    sebep: j.hookSpecificOutput?.permissionDecisionReason ?? '',
  }
}

describe('INV-KANCA-HASSAS-YOL-1 · sır dosyaları', () => {
  it('.env ailesi REDDEDİLİR ve sebep dosyayı ADIYLA söyler', () => {
    for (const dosya of ['.env', '.env.local', '.env.production', '.env.development.local']) {
      const r = kos(`C:/repo/${dosya}`)
      expect(r.karar, `reddedilmedi: ${dosya}`).toBe('deny')
      expect(r.sebep, `sebep dosya adını söylemiyor: ${dosya}`).toContain(dosya)
      expect(r.kod, 'bu kanca çıkış kodu 0 vermeli — karar stdout\'ta').toBe(0)
    }
  })

  it('ŞABLON MUAFİYETİ: `.env.example` serbest — sır taşımaz, yazımı kapatmak işi durdurur', () => {
    expect(kos('C:/repo/.env.example').karar).toBeNull()
    expect(kos('C:/repo/.env.local.example').karar).toBeNull()
  })

  it('alt dizindeki `.env` de yakalanır — kök dosya sanılmamalı', () => {
    expect(kos('C:/repo/supabase/functions/x/.env').karar).toBe('deny')
  })
})

describe('INV-KANCA-HASSAS-YOL-1 · migration yolu', () => {
  it('`supabase/migrations/**` ONAY İSTER (deny değil) ve sebep kural 13\'ü hatırlatır', () => {
    const r = kos('C:/repo/supabase/migrations/20260912120000_ornek.sql')
    expect(r.karar, 'migration yolunda onay istenmedi').toBe('ask')
    expect(r.sebep.toLowerCase(), 'sebep prod zincirini söylemiyor').toContain('prod')
  })

  it('ters bölü ile yazılmış Windows yolu da yakalanır', () => {
    expect(kos('C:\\repo\\supabase\\migrations\\20260912120000_ornek.sql').karar).toBe('ask')
  })

  it('YANLIŞ-POZİTİF KOLU: benzer ama hassas OLMAYAN yollar serbest', () => {
    // `migrations` kelimesi geçen her yol hassas değildir; aksi halde belge ve tip
    // dosyalarına yazım durur ve kapı "her şeyi sor" hâline gelir.
    for (const dosya of [
      'docs/plans/migrations-notlari.md',
      'src/types/database.types.ts',
      'scripts/db/migrations-listesi.mjs',
      'src/lib/services/urunServisi.ts',
    ]) {
      expect(kos(`C:/repo/${dosya}`).karar, `masum yol için karar üretti: ${dosya}`).toBeNull()
    }
  })
})

describe('INV-KANCA-HASSAS-YOL-1 · sözleşme sınırları', () => {
  it('bozuk / boş / dosyasız girdi KARIŞMAZ — karar üretmez, exit 0', () => {
    const bozuk = kos('', { hamGirdi: 'bu JSON degil' })
    expect(bozuk.karar, 'bozuk girdide karar uydurdu').toBeNull()
    expect(bozuk.kod).toBe(0)
    expect(kos('', { hamGirdi: '{}' }).karar, 'dosya yolu yokken karar uydurdu').toBeNull()
    expect(kos('', { hamGirdi: '' }).karar).toBeNull()
  })

  it('KARAR CWD\'DEN BAĞIMSIZ — depo dışından koşarken de aynı', () => {
    // 2026-09-12: göreli yol sınıfı bir kancayı depo dışı klasörde düşürdü ve kapı
    // "çalışmış gibi" göründü. Bu kol o sınıfı ölçer.
    const disari = os.tmpdir()
    expect(kos('C:/repo/.env', { cwd: disari }).karar).toBe('deny')
    expect(kos('C:/repo/supabase/migrations/20260912120000_x.sql', { cwd: disari }).karar).toBe('ask')
    expect(kos('C:/repo/src/lib/x.ts', { cwd: disari }).karar).toBeNull()
  })
})
