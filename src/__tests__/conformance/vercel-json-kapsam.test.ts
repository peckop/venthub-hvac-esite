// @vitest-environment node
import fs from 'node:fs'
import path from 'node:path'

import { describe, expect, it } from 'vitest'

/**
 * INV-VERCEL-KAPSAM-1 — `vercel.json` DAR kalır: her üst anahtar panel ayarını EZER.
 *
 * ─────────────────────────────────────────────────────────────────────────────
 * BU DOSYA BİR KAPININ ENKAZINDAN DOĞDU — ve niçini yazılı kalmalı
 * ─────────────────────────────────────────────────────────────────────────────
 * Önceki hâli `INV-VERCEL-ONIZLEME-1` idi ve şunu şart koşuyordu:
 *
 *     git.deploymentEnabled = { "*": false, "master": true }
 *
 * ⛔BU KURAL ÇALIŞMIYOR, ve kapı bunu göremiyordu. Vercel belgesi
 * (`project-configuration/git-configuration`) nesne biçimi için aynen şöyle der:
 * *"map **specific branch names** to boolean values"* ve **"unspecified branches
 * default to true"**. **JOKER YOKTUR** — `"*"` literal bir dal adı sanılır,
 * hiçbir şeyle eşleşmez ve geri kalan HER dal açık kalır.
 *
 * Kapının kendi yorumu ise şunu iddia ediyordu: *"Vercel örtüşen kurallarda
 * 'biri true ise deploy olur' kuralını uygular"*. Bu cümle **ölçülmemiş bir
 * varsayımdı ve yanlıştı**; belgede örtüşme diye bir kavram yok.
 *
 * ⭐KUSURUN SINIFI — bu depoda dördüncü kez: kapı **dosyanın İÇERİĞİNE** bakıp
 * **SONUCUNA** bakmıyordu. Doğru dizeyi görüp yeşil yanıyor, kural ise hiç
 * işlemiyordu. 2026-09-07 gecesi kuralı TAŞIYAN dört dal (#1107, #1108,
 * rec121, #1109) yine önizleme üretti; dokuz saatte 60+ dağıtım birikti, kota
 * 21:14Z'de doldu ve master'ın üç commit'i `Deployment rate limited` ile
 * reddedildi. Kapı o gece boyunca YEŞİLDİ.
 *
 * ⭐İKİNCİ KUSUR, AYNI DOSYADA: kök dizini `process.cwd()`'den çözüyordu. Filo
 * çok-worktree çalışır ve bu ortamda kabuğun cwd'si ana dizine dönebilir
 * (`fleet-mechanism-standard.md` §9.1) — yani kapı, onardığın ağacın değil
 * ANA AĞACIN dosyasını ölçebilirdi. Artık `__dirname` kullanılıyor.
 *
 * ─────────────────────────────────────────────────────────────────────────────
 * ASIL SÖZLEŞME NEREYE TAŞINDI
 * ─────────────────────────────────────────────────────────────────────────────
 * "PR dalları derleme yakmaz" garantisi artık `scripts/vercel-ignore-build.sh`
 * içindeki DAL KAPISI'nda yaşıyor ve `INV-BUILD-SKIP-DAL` ile ölçülüyor
 * (altı kol, hepsi betiği ÇALIŞTIRIP çıkış kodunu okur — metin taraması değil).
 * Cetvel: `docs/standards/deploy-build-skip-standard.md` §D15.
 *
 * ⚠SINIR, ADIYLA YAZILI: dal kapısı derlemeyi atlar; Vercel yine bir dağıtım
 * KAYDI açar (iptal). İptal kaydının günlük kotaya sayılıp sayılmadığı
 * 2026-09-08 itibariyle ÖLÇÜLMEMİŞTİR (§D15.1). Bu yüzden hiçbir kapı
 * "REC-217 çözüldü" DEMEZ.
 *
 * ─────────────────────────────────────────────────────────────────────────────
 * GERİYE KALAN GERÇEK KORUMA
 * ─────────────────────────────────────────────────────────────────────────────
 * `vercel.json`'daki her üst anahtar, panelde yaşayan ayarı GÖRÜNMEZ biçimde
 * ezer. Dosya tek bir iş için açıldı; buraya sessizce eklenen bir
 * `buildCommand`/`headers`/`ignoreCommand` panelin ayarını devre dışı bırakır
 * ve kimse fark etmez. Aşağıdaki kol tam bunu ölçer — ve bu kol, silinen
 * ikisinin aksine, DOĞRULUĞU ölçülebilir bir şey iddia eder.
 */

/**
 * ⚠️ MUTLAK YOL: `process.cwd()` YASAK (yukarıdaki ikinci kusur). `__dirname`
 * dosyanın kendi konumudur; cwd ne olursa olsun doğru ağacı gösterir.
 */
const KOK = path.resolve(__dirname, '../../..')
const YOL = path.join(KOK, 'vercel.json')

describe('INV-VERCEL-KAPSAM-1: vercel.json dar kalir', () => {
  it('vercel.json VAR ve ayristirilabiliyor (kapi KOR kosmasin)', () => {
    expect(fs.existsSync(YOL), `vercel.json bulunamadi: ${YOL}`).toBe(true)
    expect(() => JSON.parse(fs.readFileSync(YOL, 'utf8'))).not.toThrow()
  })

  it('KAPSAM DAR: panel ayarini ezecek yeni ust anahtar YOK', () => {
    const cfg = JSON.parse(fs.readFileSync(YOL, 'utf8')) as Record<string, unknown>
    const izinli = new Set(['$schema'])
    const fazla = Object.keys(cfg).filter((k) => !izinli.has(k))
    expect(
      fazla,
      'vercel.json\'a yeni ust anahtar eklenmis: ' + fazla.join(', ') + '. Her anahtar PANEL ' +
        'ayarini ezer. Bilincli bir kararsa bu kolu gerekcesiyle guncelle; ' +
        'dal kapsami icin dogru yer scripts/vercel-ignore-build.sh (bkz. D15).',
    ).toEqual([])
  })

  /**
   * ⭐ÇÜRÜYEN İDDİANIN GERİ SIZMASINI ENGELLER. Biri "önizlemeleri kapatalım"
   * diye `deploymentEnabled` haritasını geri yazarsa, D15'te belgelenmiş
   * ölçüm sessizce çöpe gider ve aynı gece bir daha yaşanır. Geri yazmak
   * yasak değil — ama ÖLÇÜLMEDEN yazmak yasak: bu kol onu görünür kılar.
   */
  it('joker iceren deploymentEnabled haritasi GERI YAZILMAMIS', () => {
    const cfg = JSON.parse(fs.readFileSync(YOL, 'utf8')) as {
      git?: { deploymentEnabled?: unknown }
    }
    const harita = cfg.git?.deploymentEnabled
    if (harita && typeof harita === 'object') {
      expect(
        Object.keys(harita as Record<string, unknown>),
        'deploymentEnabled haritasina "*" yazilmis. Vercel belgesi: nesne bicimi YALNIZ ' +
          'adi verilen dallari esler, "unspecified branches default to true" — JOKER YOK. ' +
          '2026-09-07 gecesi bu yanilgi 60+ dagitim ve dokuz saatlik yayin kaybi uretti ' +
          '(bkz. deploy-build-skip-standard.md D15).',
      ).not.toContain('*')
    }
  })
})
