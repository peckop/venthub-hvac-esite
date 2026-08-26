import fs from 'node:fs'
import path from 'node:path'

import { describe, expect, it } from 'vitest'

/**
 * INV-EDGE-DRIFT-1 — paylaşılan girdiye dokunan PR, prod'u master'a karşı ölçmeden geçmesin.
 *
 * NİÇİN VAR: `supabase/config.toml` ya da `_shared/**` değişince merge TÜM uçları yeniden
 * dağıtır (ölçüldü: 28 fonksiyon seçildi) ve prod'da master'dan sapmış bir uç varsa onu
 * SESSİZCE ezer. Kapının kendisi `.github/workflows/edge-shared-input-drift.yml`; bu dosya
 * o kapının BAĞLI ve DOĞRU KURULMUŞ kaldığını sabitler.
 *
 * Cetvel: docs/standards/edge-function-security-standard.md §3.12 (E15)
 */
const KOK = path.resolve(__dirname, '../../..')
const WF = path.join(KOK, '.github/workflows/edge-shared-input-drift.yml')
const CETVEL = path.join(KOK, 'docs/standards/edge-function-security-standard.md')

/** Yorumlar SIYRILIR: gerekçe metninde geçen bir ad, kurulmuş bir yapılandırma DEĞİLDİR. */
function yorumsuz(metin: string): string {
  return metin
    .replace(/\r\n/g, '\n')
    .split('\n')
    .filter((s) => !/^\s*#/.test(s))
    .join('\n')
}

describe('INV-EDGE-DRIFT-1 — paylaşılan girdi sapma kapısı', () => {
  const ham = fs.readFileSync(WF, 'utf8')
  const wf = yorumsuz(ham)

  it('KAPSAM KANARYASI — sıyırıcı dosyayı GERÇEKTEN okuyor', () => {
    // "0 ihlal" ile "bakmadım" aynı görünür. Sıyırıcı her şeyi silerse aşağıdaki
    // iddialar sessizce anlamsızlaşırdı.
    expect(wf.length, 'yorum sıyırıcı workflow metnini boşalttı').toBeGreaterThan(400)
    expect(wf).toMatch(/^on:/m)
    expect(wf).toMatch(/^jobs:/m)
  })

  it('yalnız PAYLAŞILAN girdilerde tetikler', () => {
    expect(wf).toMatch(/pull_request:/)
    expect(wf).toContain('supabase/config.toml')
    expect(wf).toContain('supabase/functions/_shared/**')
  })

  it('KANARYA 2 — PR kendi değişikliğini SAPMA saymaz: checkout MASTER', () => {
    // Bu, kapının en kolay bozulacak yeri. `ref: master` düşerse kapı PR dalını prod ile
    // karşılaştırır ve PR'ın KENDİ diff'i "sapma" görünür -> her paylaşılan-girdi PR'ı
    // yanlış kırmızı olur. O hâlde kapı gürültüye döner ve kapatılır.
    const bas = wf.indexOf('sapma-master:')
    expect(bas, 'kapı işi YOK').toBeGreaterThan(-1)
    const govde = wf.slice(bas)
    expect(govde).toMatch(/ref:\s*master/)
    expect(govde).toContain('node scripts/edge/drift-check.mjs')
  })

  it('KANARYA 3 — sır yoksa ATLANIR ve atlanmış iş YEŞİL sayılmaz', () => {
    expect(wf).toMatch(/needs:\s*sapma-on-kontrol/)
    expect(wf).toMatch(/if:\s*needs\.sapma-on-kontrol\.outputs\.ready == 'true'/)
    expect(wf).toContain('ATLANMIS IS YESIL DEGILDIR')
    expect(wf).toContain('secrets.SUPABASE_ACCESS_TOKEN')
  })

  it('sapma KIRMIZI yapar — çıkış kodu yutulmuyor', () => {
    // `set +e` + `exit "$rc"` ikilisi olmadan rapor basılmadan ölür ya da kod yutulur.
    expect(wf).toContain('set +e')
    expect(wf).toMatch(/exit "\$rc"/)
    expect(wf).not.toMatch(/drift-check\.mjs[^\n]*\|\s*tee/)
  })

  it('iş SINIRSIZ değil', () => {
    const bas = wf.indexOf('sapma-master:')
    expect(wf.slice(bas)).toMatch(/timeout-minutes:\s*\d+/)
  })

  it('cetvel bu kapıyı ADIYLA tarif ediyor (kural + zorlayan test = kontrol)', () => {
    const cetvel = fs.readFileSync(CETVEL, 'utf8')
    expect(cetvel).toContain('INV-EDGE-DRIFT-1')
    expect(cetvel).toContain('edge-shared-input-drift.yml')
    expect(cetvel).toMatch(/###\s*3\.12/)
  })
})
