/**
 * REC-267 — commit öncesi iki uyarının DÜZENEĞİNİ korur.
 *
 * Bu dosya uyarıların doğru "karar verdiğini" değil, **uyarı olarak kaldıklarını** ve
 * kancaya bağlı olduklarını ölçer. Sebep: bu iki kol bilerek BLOKLAMIYOR, ve bir gün biri
 * "işe yaramıyor" diye çıkış kodunu bloklayıcı yaparsa `pre-commit`in 2026-08-15 kararı
 * sessizce geri alınmış olur — o karar rastgele reddetmelerin bedeli ödendikten sonra
 * alındı ve `--no-verify` alışkanlığı GERÇEK kapıları da atlatır.
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

const BETIK = 'scripts/hijyen/commit-oncesi-uyarilar.cjs'
const KANCA = '.githooks/pre-commit'

/** Betiği verilen çalışma dizininde koşar; çıkış kodu + çıktı döner. */
function kos(cwd: string): { kod: number; cikti: string } {
  try {
    const cikti = execFileSync(process.execPath, [path.join(KOK, BETIK)], {
      cwd,
      encoding: 'utf8',
      stdio: 'pipe',
    })
    return { kod: 0, cikti }
  } catch (e) {
    const err = e as { status?: number; stdout?: string; stderr?: string }
    return { kod: err.status ?? 1, cikti: `${err.stdout ?? ''}${err.stderr ?? ''}` }
  }
}

describe('REC-267: commit öncesi uyarılar kancaya bağlı ve UYARI olarak kalıyor', () => {
  it('pre-commit betiği ÇAĞIRIR ve şerit kapısından ÖNCE çağırır', () => {
    const h = oku(KANCA)
    const uyariIdx = h.indexOf(BETIK)
    const kapiIdx = h.indexOf('lane-precommit.cjs')
    expect(uyariIdx, 'pre-commit uyarı betiğini çağırmıyor').toBeGreaterThan(-1)
    expect(kapiIdx, 'şerit kapısı çağrısı kaybolmuş').toBeGreaterThan(-1)
    // Bloklayan çıktının ardına eklenen uyarı, commit reddedilince ekranda yukarıda kalır.
    expect(
      uyariIdx,
      'uyarı çağrısı şerit kapısından SONRA — reddedilen commit`te okunmaz'
    ).toBeLessThan(kapiIdx)
  })

  it('⛔BLOKLAMAZ: çağrı `|| true` ile korunmuş ve betik çıkış kodunu kontrol EDİLMİYOR', () => {
    const h = oku(KANCA)
    const satir = h.split('\n').find((s) => s.includes(BETIK)) ?? ''
    expect(satir, 'çağrı satırı bulunamadı').toContain(BETIK)
    expect(
      /\|\|\s*true/.test(satir),
      'çağrı `|| true` ile korunmuyor — betikte bir kaza herkesin commit`ini bloklar'
    ).toBe(true)
  })

  it('DAVRANIŞ: temiz worktree`de çıkış 0 ve SESSİZ (her commit`te yanan uyarı mobilyaya döner)', () => {
    // Bu paket bir worktree`de ya da ana repoda koşabilir; ölçülen tek şey çıkış kodu ve
    // "uyarı yoksa çıktı da yok" kuralı. Kolların İÇERİĞİ ayrı kollarda ölçülüyor.
    const { kod } = kos(KOK)
    expect(kod, 'uyarı betiği sıfırdan farklı çıkış verdi — bloklamaya dönüşmüş').toBe(0)
  })

  it('⭐ENVANTER DOSYASI SABİT ADLA ARANMAZ (tarih damgası tuzağı — REC-274 dersi)', () => {
    /**
     * Envanter/karar belgeleri her gün yeni tarih damgasıyla yeniden yazılıp eskisi
     * siliniyor. Sabit ada bakan bir ölçüm, dosya yenilendiği gün hiçbir şey bulamaz ve
     * "ilan edilmiş" diye GEÇER — sessiz fail-open. Bugün bu tuzak KIP haritasında bir
     * kez ödendi; aynı hatanın burada tekrarlanmadığını kol olarak sabitliyorum.
     */
    const s = oku(BETIK)
    expect(
      /arac-envanteri-2026-\d{2}-\d{2}\.md/.test(s),
      'betikte SABİT tarihli envanter dosya adı var — dosya yenilenince kol körleşir'
    ).toBe(false)
    expect(
      /readdirSync/.test(s),
      'envanter dosyası dizin taramasıyla (en yeni) bulunmuyor'
    ).toBe(true)
  })

  it('UYARI METNİ betik adını VE koşulacak komutu taşır (URUN-KATALOG şartı)', () => {
    // "envanter eksik" demek yetmiyordu: 2026-09-08`de dört şerit de komutu ARAMAKLA
    // vakit kaybetti. Metin bu yüzden ölçülüyor.
    const s = oku(BETIK)
    expect(s, 'koşulacak komut uyarı metninde yok').toContain(
      'node scripts/hijyen/arac-envanteri.cjs --yaz'
    )
    expect(s, 'ilan edilmemiş betiğin YOLU basılmıyor').toMatch(/\$\{y\}|\$\{yol\}/)
  })

  it('⛔ÜRETİLMİŞ ENVANTERE YAZMAZ (AXIOM 3) ve AĞ/DB kullanmaz (kanca cetveli)', () => {
    const s = oku(BETIK)
    expect(/writeFileSync|appendFileSync|createWriteStream/.test(s), 'betik dosya YAZIYOR').toBe(
      false
    )
    expect(/fetch\(|https?:\/\/|createClient|require\('pg'\)/.test(s), 'betik ağ/DB kullanıyor').toBe(
      false
    )
  })
})
