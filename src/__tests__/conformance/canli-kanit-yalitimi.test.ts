import fs from 'node:fs'
import path from 'node:path'

import { describe, expect, it } from 'vitest'

/**
 * INV-CANLI-KANIT-1 · canlıya YAZAN tek seferlik spec'ler yalıtılmış kalır (karar 104, 2026-09-24).
 *
 * NİÇİN: `e2e-smoke.yml` her PR'da ve master push'unda kök Playwright ayarını koşar; o işin Supabase
 * adresi CANLI proje (ölçüldü). Canlıya yazan spec kök ayarın evrenine sızarsa her PR aynı yazımı
 * tekrarlar — sessizce, çünkü testler yeşil geçer. Bu kapı yalıtımın dört ayağını ölçer:
 *   1) canlı kanıt iş akışı yalnız elle tetiklenir ve onay girdisini kontrol eder;
 *   2) kök ayarın `testDir`'i `./e2e` — `e2e-canli/` onun dışında;
 *   3) `e2e-canli` ayarında yeniden deneme yok (tekrar = ikinci yazım);
 *   4) trace kapalı ve artefakt yüklenmiyor (repo PUBLIC, trace parolayı kaydeder).
 */

const KOK = path.resolve(__dirname, '../../..')
const oku = (g: string) => fs.readFileSync(path.join(KOK, g), 'utf8').replace(/\r\n/g, '\n')

const IS_AKISI = '.github/workflows/canli-kanit-tek-sefer.yml'
const CANLI_AYAR = 'e2e-canli/playwright.config.ts'

/** `on:` bloğundaki tetik anahtarlarını döndürür (girinti 2 olan satırlar). */
function tetikler(yml: string): string[] {
  const satirlar = yml.split(/\r?\n/)
  const bas = satirlar.findIndex((s) => /^on:\s*$/.test(s))
  if (bas < 0) return []
  const out: string[] = []
  for (const s of satirlar.slice(bas + 1)) {
    if (/^\S/.test(s)) break
    const m = /^ {2}([a-z_]+):/.exec(s)
    if (m) out.push(m[1])
  }
  return out
}

describe('INV-CANLI-KANIT-1 · canlı yazım yalıtımı', () => {
  const yml = oku(IS_AKISI)
  const ayar = oku(CANLI_AYAR)
  const kokAyar = oku('playwright.config.ts')

  it('iş akışı YALNIZ workflow_dispatch ile tetiklenir', () => {
    expect(tetikler(yml)).toEqual(['workflow_dispatch'])
  })

  it('onay kilidi ve master kilidi ilk adımda', () => {
    const ilkAdim = yml.split(/\n\s+- name:/)[1] ?? ''
    expect(ilkAdim).toContain('Onay kilidi')
    expect(ilkAdim).toContain('"$ONAY" != "karar-104-canli-yazim"')
    expect(ilkAdim).toContain('"${GITHUB_REF_NAME}" != "master"')
    expect(yml, 'girdi run: içine doğrudan gömülmez (enjeksiyon)').not.toMatch(/run:[^\n]*\$\{\{\s*inputs\./)
  })

  it('kanıt adımı canlı ayarı ve SABİT spec yolunu kullanır', () => {
    expect(yml).toContain('--config e2e-canli/playwright.config.ts e2e-canli/karar104-teklif-yayim.e2e.ts')
    expect(yml).toContain('E2E_BASE_URL: https://venthub.com.tr')
  })

  it('artefakt yüklenmez', () => {
    expect(yml).not.toMatch(/upload-artifact/)
  })

  it('kök ayar e2e-canli/ klasörünü toplamaz', () => {
    expect(kokAyar).toMatch(/testDir:\s*'\.\/e2e'/)
  })

  it('e2e-smoke başlığı "adres canlı proje" gerçeğini yazıyor (yazılı değilse biri e2e/ altına yazan spec koyar)', () => {
    expect(oku('.github/workflows/e2e-smoke.yml')).toMatch(/E2E_SUPABASE_URL` = CANLI proje/)
  })

  it('canlı ayarda yeniden deneme yok, trace/video/ekran görüntüsü kapalı', () => {
    expect(ayar).toMatch(/retries:\s*0\b/)
    expect(ayar).toMatch(/trace:\s*'off'/)
    expect(ayar).toMatch(/video:\s*'off'/)
    expect(ayar).toMatch(/screenshot:\s*'off'/)
    expect(ayar).not.toMatch(/webServer/)
  })

  it('SABOTAJ: push tetiği eklenen iş akışı yakalanır', () => {
    const bozuk = yml.replace('on:\n  workflow_dispatch:', 'on:\n  push:\n    branches: [master]\n  workflow_dispatch:')
    expect(bozuk).not.toBe(yml)
    expect(tetikler(bozuk)).not.toEqual(['workflow_dispatch'])
  })
})
