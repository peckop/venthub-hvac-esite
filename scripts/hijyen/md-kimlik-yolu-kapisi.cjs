#!/usr/bin/env node
/**
 * MD KİMLİK YOLU KAPISI (ARC-303, OPS 13 Kasım, ARC-299 öneri 1): itilecek farkta EKLENEN .md satırlarında
 * kullanıcı kimliği sızdıran mutlak yol varsa push'u durdurur.
 *
 * NİÇİN: INV-MUTLAK-YOL-1 prose mandalı (src/__tests__/conformance/mutlak-yol-sizintisi.test.ts) .md dosyalarında
 * kimlik yolu taşıyan satır SAYISININ artmasını CI'da kırmızı sayar. Bu hafta iki belge PR'ı (#2485, #2489) bunu
 * ancak CI'da gördü; "yalnız belge, test etkilenmez" beyanı yanlıştı. Aynı ölçüt itmeden önce yerelde koşar.
 *
 * ÖLÇÜT = testteki KIMLIK_DESENI (aynı desen; `md-kimlik-yolu-kapisi.test.ts` kaynağını testle karşılaştırır, kopya sapamaz).
 * Yalnız EKLENEN satırlar (`+` satırları) ve yalnız .md; `.archive/` ve companion `source_path:` satırı kapsam dışı
 * (test aynısını sayım dışı bırakır). Mevcut satırlar mandalın işi: burada dokunulmaz.
 *
 * KULLANIM (pre-push, stdin: `<yerel ref> <yerel sha> <uzak ref> <uzak sha>` satırları):
 *   çıkış 1 = ihlal (dosya:satır listesi stderr'de), çıkış 0 = temiz ya da ölçülemedi.
 * FAIL-OPEN: git yok/diff okunamadı → uyarı basar, GEÇİRİR (kesin kapı CI'daki mutlak-yol testidir).
 * Bilinçli geçiş: VH_MD_KIMLIK_IZIN=1 git push ...  (uyarı yine basılır).
 */
const { execFileSync } = require('node:child_process')

const KIMLIK_DESENI =
  /(?:[A-Za-z]:[\\/]Users[\\/][A-Za-z0-9._-]+|(?<![A-Za-z0-9._\-/])\/(?:home|Users)\/[A-Za-z0-9._-]+)/
const SIFIR = /^0+$/
const AZAMI_LISTE = 20

/** `git diff --unified=0` çıktısından EKLENEN .md satırlarını çıkarır: [{dosya, no, metin}]. */
function eklenenSatirlar(diff) {
  const sonuc = []
  let dosya = ''
  let no = 0
  for (const satir of String(diff).split('\n')) {
    if (satir.startsWith('+++ ')) {
      dosya = satir.startsWith('+++ b/') ? satir.slice(6).trim() : ''
      continue
    }
    const kafa = /^@@ -\d+(?:,\d+)? \+(\d+)(?:,\d+)? @@/.exec(satir)
    if (kafa) {
      no = Number(kafa[1])
      continue
    }
    if (satir.startsWith('+') && !satir.startsWith('+++')) {
      if (dosya.endsWith('.md')) sonuc.push({ dosya, no, metin: satir.slice(1) })
      no += 1
    }
  }
  return sonuc
}

/** Kimlik yolu taşıyan eklenen satırlar; `.archive/` ve companion `source_path:` satırı kapsam dışı. */
function ihlaller(satirlar) {
  return satirlar.filter(
    (s) => !s.dosya.startsWith('.archive/') && !/^\s*source_path\s*:/.test(s.metin) && KIMLIK_DESENI.test(s.metin),
  )
}

function git(args) {
  return execFileSync('git', args, { encoding: 'utf8', stdio: ['ignore', 'pipe', 'ignore'], maxBuffer: 64 * 1024 * 1024, windowsHide: true })
}

/** Bir push satırının karşılaştırma tabanı: uzak sha varsa o; yeni dalsa origin/master ile ortak ata. */
function taban(yerelSha, uzakSha) {
  if (!SIFIR.test(uzakSha)) return uzakSha
  return git(['merge-base', yerelSha, 'origin/master']).trim()
}

function calistir(stdin, ortam = process.env) {
  const bulunan = []
  let olculemedi = null
  for (const satir of String(stdin).split('\n')) {
    const [, yerelSha, , uzakSha] = satir.trim().split(/\s+/)
    if (!yerelSha || SIFIR.test(yerelSha)) continue // silme push'u
    try {
      const diff = git(['diff', '--unified=0', '--no-color', '--diff-filter=AM', taban(yerelSha, uzakSha || '0'), yerelSha])
      bulunan.push(...ihlaller(eklenenSatirlar(diff)))
    } catch (hata) {
      olculemedi = (hata && (hata.code || hata.message)) || 'bilinmeyen'
    }
  }
  if (olculemedi && bulunan.length === 0) {
    return { kod: 0, mesaj: `[md-kimlik-yolu] UYARI: fark okunamadı (${olculemedi}); kontrol YAPILMADI, kesin kapı CI'daki INV-MUTLAK-YOL-1.` }
  }
  if (bulunan.length === 0) return { kod: 0, mesaj: '' }
  const liste = bulunan.slice(0, AZAMI_LISTE).map((s) => `  ${s.dosya}:${s.no}: ${s.metin.trim().slice(0, 160)}`)
  const fazla = bulunan.length > AZAMI_LISTE ? `\n  ... ve ${bulunan.length - AZAMI_LISTE} satır daha` : ''
  const baslik = `[md-kimlik-yolu] ${bulunan.length} eklenen .md satırı kimlik yolu taşıyor (CI'daki INV-MUTLAK-YOL-1 prose mandalı bunu kırmızı sayar):\n${liste.join('\n')}${fazla}`
  if (ortam.VH_MD_KIMLIK_IZIN === '1') return { kod: 0, mesaj: `${baslik}\n[md-kimlik-yolu] !!! UYARI !!! VH_MD_KIMLIK_IZIN=1 ile GEÇİLİYOR.` }
  return {
    kod: 1,
    mesaj: `${baslik}\n[md-kimlik-yolu] PUSH ENGELLENDİ. Yolu göreli yaz (docs/..., scripts/...) ya da depo dışı ise "ana depo" gibi adla anlat. Bilinçli geçiş: VH_MD_KIMLIK_IZIN=1 git push ...`,
  }
}

module.exports = { KIMLIK_DESENI, eklenenSatirlar, ihlaller, calistir }

if (require.main === module) {
  let girdi = ''
  process.stdin.setEncoding('utf8')
  process.stdin.on('data', (b) => (girdi += b))
  process.stdin.on('end', () => {
    const { kod, mesaj } = calistir(girdi)
    if (mesaj) process.stderr.write(mesaj + '\n')
    process.exit(kod)
  })
}
