/**
 * INV-STORAGE-YAZMA-1 düzeneği — nöbetçinin KOŞABİLİRLİĞİNİ korur (REC-442).
 *
 * Nöbetçinin kendisi DB'ye bağlanır ve bu konformans paketi DB'siz koşar; ölçülen şey nöbetçinin
 * BULGUSU değil DÜZENEĞİ: doğru işe bağlı mı, fail-closed mı, sorgu doğru evreni ve doğru kapı
 * belirteçlerini kullanıyor mu, ilan dosyası tutarlı mı. Kardeşi: anon-yazma-nobetcisi.test.ts
 * (aynı ölçüt dersleri: yorum ile kod ayrı evrendir, varlık ölçütü sabotajı geçirir).
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
const oku = (p: string): string => fs.readFileSync(path.join(KOK, p), 'utf8')

/** Satır başı `#` yorumlarını atar. */
function yorumsuz(metin: string): string {
  return metin
    .split('\n')
    .filter((s) => !/^\s*#/.test(s))
    .join('\n')
}

/** JS/TS yorumlarını satır bazlı atar (gerekçe metni kodun yerine geçmesin). */
function jsYorumsuz(metin: string): string {
  return metin
    .split('\n')
    .filter((s) => !/^\s*(\/\/|\/\*|\*)/.test(s))
    .join('\n')
}

/** SQL `--` yorumlarını atar. */
function sqlYorumsuz(metin: string): string {
  return metin
    .split('\n')
    .filter((s) => !/^\s*--/.test(s))
    .join('\n')
}

/** Bir workflow İŞ BLOĞUNU girintiye göre çıkarır (depoda YAML ayrıştırıcı yok). */
function isBlogu(ham: string, isAdi: string): string | null {
  const satirlar = ham.split('\n')
  const bas = satirlar.findIndex((s) => new RegExp(`^ {2}${isAdi}:\\s*$`).test(s))
  if (bas === -1) return null
  const govde: string[] = []
  for (let i = bas + 1; i < satirlar.length; i++) {
    const s = satirlar[i]
    if (s.trim() === '') {
      govde.push(s)
      continue
    }
    const girinti = s.length - s.trimStart().length
    if (girinti <= 2) break
    govde.push(s)
  }
  return govde.join('\n')
}

const WF = '.github/workflows/db-advisor.yml'
const BETIK = 'scripts/db/checks/storage-yazma-nobetcisi.mjs'
const SORGU = 'scripts/db/checks/storage-yazma-nobetcisi.sql'
const ILAN = 'scripts/db/checks/storage-yazma-politika-ilani.json'

interface Ilan {
  olcut: string
  sinir: string
  nicin_ilan_ve_mandal: string
  ilan_edilen_politikalar: {
    politika: string
    cmd: string
    nicin_mesru: string
    dogrulandi: string
  }[]
}

describe('INV-STORAGE-YAZMA-1: nöbetçi GERÇEKTEN durdurabilen bir işte koşar', () => {
  it('nöbetçi rls-role-coverage işine bağlı, advisor işine DEĞİL', () => {
    const ham = oku(WF)
    expect(yorumsuz(ham).includes(BETIK), 'nöbetçi hiçbir adımda çağrılmıyor').toBe(true)
    const rlsBlok = isBlogu(ham, 'rls-role-coverage')
    const advisorBlok = isBlogu(ham, 'advisor')
    expect(rlsBlok, 'rls-role-coverage işi bulunamadı').toBeTruthy()
    expect((rlsBlok as string).includes(BETIK), 'nöbetçi rls-role-coverage işinde değil').toBe(true)
    expect(
      (advisorBlok ?? '').includes(BETIK),
      'nöbetçi advisor işine konmuş — o iş continue-on-error taşıyor, kırmızı vermez'
    ).toBe(false)
  })

  it('taşıyıcı iş DÜŞEBİLİR: continue-on-error YOK ve pipefail VAR', () => {
    const rlsBlok = yorumsuz(isBlogu(oku(WF), 'rls-role-coverage') as string)
    expect(/continue-on-error/.test(rlsBlok), 'taşıyıcı işe continue-on-error girmiş').toBe(false)
    expect(/set -Eeuo pipefail/.test(rlsBlok), 'pipefail yok: betik düşse adım yeşil kalabilir').toBe(true)
  })

  it('FAIL-CLOSED: env yoksa nöbetçi çıkış kodu != 0 (DAVRANIŞ ölçümü)', () => {
    let kod = 0
    try {
      execFileSync(process.execPath, [path.join(KOK, BETIK)], {
        cwd: KOK,
        encoding: 'utf8',
        stdio: 'pipe',
        env: { ...process.env, SUPABASE_DB_URL: '' },
      })
    } catch (e) {
      kod = (e as { status?: number }).status ?? 1
    }
    expect(kod, 'SUPABASE_DB_URL boşken nöbetçi YEŞİL döndü — ölçmemek geçmek değildir').not.toBe(0)
  })

  it('nöbetçi atlama (Skipping) yolu taşımaz ve İHLAL dalında exit 1 vardır', () => {
    const b = jsYorumsuz(oku(BETIK))
    expect(/Skipping/i.test(b), 'nöbetçi atlama yolu taşıyor — güvenlik kapısı sessizce atlanamaz').toBe(false)
    // Ölçüt İHLAL BLOĞUNUN KENDİ METNİNE bağlı: `YAPILACAK:` yalnız o dalda geçer, çıkış ondan sonra gelir.
    expect(
      /YAPILACAK:[\s\S]{0,300}process\.exit\(1\)/.test(b),
      'ihlal dalında exit 1 YOK — nöbetçi ihlali bulur ama koşum yeşil kalır'
    ).toBe(true)
  })
})

describe('INV-STORAGE-YAZMA-1: sorgu doğru evreni ve doğru kapı belirteçlerini ölçer', () => {
  it('sorgu storage.objects YAZMA komutlarını ve üç rolü hedefler', () => {
    const s = sqlYorumsuz(oku(SORGU))
    expect(/schemaname\s*=\s*'storage'/.test(s), 'sorgu storage şemasına bakmıyor').toBe(true)
    expect(/tablename\s*=\s*'objects'/.test(s), 'sorgu objects tablosuna bakmıyor').toBe(true)
    expect(/'INSERT'/.test(s) && /'UPDATE'/.test(s) && /'DELETE'/.test(s) && /'ALL'/.test(s), 'yazma komutlarından biri eksik').toBe(true)
    expect(/'public'/.test(s) && /'anon'/.test(s) && /'authenticated'/.test(s), 'rol evreninden biri eksik').toBe(true)
  })

  it('kapı belirteçleri user_profiles / is_admin / jwt_tenant_id; owner KAPI SAYILMAZ', () => {
    const s = sqlYorumsuz(oku(SORGU))
    const m = s.match(/!~\*\s*'\(([^)]*)\)'/)
    expect(m, 'kapı belirteci ifadesi (!~*) bulunamadı').toBeTruthy()
    const belirtecler = (m as RegExpMatchArray)[1].split('|')
    expect(belirtecler.sort()).toEqual(['is_admin', 'jwt_tenant_id', 'user_profiles'])
    expect(belirtecler.includes('owner'), 'owner kapı sayılmış — herkese açık yükleme yüzeyini gizler').toBe(false)
  })

  it('sorgu SAYI değil DÖKÜM döndürür', () => {
    const s = oku(SORGU)
    expect(/select\s+count\(\*\)\s*from/i.test(s), 'sorgu agrega sayı döndürüyor').toBe(false)
    expect(/policyname/.test(s) && /with_check/.test(s) && /qual/.test(s), 'döküm politika adını/koşulunu taşımıyor').toBe(true)
  })

  it('nöbetçi CANLI KATALOĞU okur, migration dosyalarını taramaz', () => {
    const b = jsYorumsuz(oku(BETIK))
    expect(/pg\.Client/.test(b), 'nöbetçi DB istemcisi kurmuyor').toBe(true)
    expect(/supabase\/migrations/.test(b), 'nöbetçi migration metnine bakıyor — panelden açılan politikayı göremez').toBe(false)
  })
})

describe('INV-STORAGE-YAZMA-1: ilan GEREKÇELİ ve iki yönlü', () => {
  it('ilan dosyasındaki HER kalem gerekçeli ve ELLE DOĞRULANMIŞ; sınır ve mandal yazılı', () => {
    const i = JSON.parse(oku(ILAN)) as Ilan
    expect(Array.isArray(i.ilan_edilen_politikalar)).toBe(true)
    for (const k of i.ilan_edilen_politikalar) {
      expect(k.nicin_mesru?.length ?? 0, `${k.politika} gerekçesiz ilan edilmiş`).toBeGreaterThan(40)
      expect(k.dogrulandi?.length ?? 0, `${k.politika} elle doğrulama kaydı yok`).toBeGreaterThan(10)
    }
    expect(i.sinir?.length ?? 0, 'ilan dosyasında SINIR yazılı değil').toBeGreaterThan(80)
    expect(i.nicin_ilan_ve_mandal?.length ?? 0, 'ilan+mandal gerekçesi yazılı değil').toBeGreaterThan(80)
  })

  it('nöbetçi ilanı GERÇEKTEN okur ve ölü kalemi de bildirir', () => {
    const b = jsYorumsuz(oku(BETIK))
    expect(
      /ILAN_YOLU\s*=\s*path\.join\([^)]*storage-yazma-politika-ilani\.json'\)/.test(b),
      'ilan dosyasının yolu ILAN_YOLU olarak kurulmuyor'
    ).toBe(true)
    expect(/readFileSync\(ILAN_YOLU/.test(b), 'nöbetçi ilan dosyasını GERÇEKTEN okumuyor').toBe(true)
    expect(/olu|ölü/i.test(b), 'ilanda kalkmış kalem bildirilmiyor — ilan sessizce bayatlar').toBe(true)
  })
})
