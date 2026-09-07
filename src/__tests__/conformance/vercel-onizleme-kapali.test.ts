// @vitest-environment node
import fs from 'node:fs'
import path from 'node:path'

import { describe, expect, it } from 'vitest'

/**
 * INV-VERCEL-ONIZLEME-1 — `vercel.json`: yalnız `master` deploy üretir (REC-217).
 *
 * NİÇİN VAR — ölçülmüş vaka, 2026-09-07:
 * Hobby planında günlük deploy kotası PR önizlemeleri ile üretim yayınını AYIRMIYOR.
 * O gün ölçtüm (Vercel API, 00:00Z sonrası): **40+ deploy, yarısı önizleme**. Beş şerit
 * paralel çalışırken her dal push'u bir önizleme doğuruyor; kota tükenince sıradaki
 * **master yayını** da reddediliyor. Aynı gün iki kez yaşandı: 14:22Z master merge'i
 * yayına çıkmadı ve #1099 için Vercel `Deployment rate limited, retry in 24 hours` dedi.
 * Yani önizlemeler, müşterinin gördüğü yayını yiyor.
 *
 * KARAR RECEP'İN (2026-09-07 13:58Z): PR önizleme denemeleri kapanır, kota master'a kalır.
 * Bana OPS aktarımıyla ulaştı ve kaynağını gizlemiyorum; Recep aynı akşam migration
 * dışındaki işlerin onay/sırasını açıkça OPS'a devretti.
 *
 * ⚠BEDELİ YAZILI, ÇÜNKÜ ÖLÇÜLDÜ: önizleme URL'i, bir PR'ı **merge'den önce gözle görme**
 * yeteneğidir ve o yetenek bugün gerçek bir kusur yakaladı — #1088'de sekiz konformans kolu
 * YEŞİLDİ, kategori bloğu DOM'da VARDI, ekranda YOKTU. Bu kapıdan sonra o sınıf kusur ancak
 * merge SONRASI canlıda görülebilir. Ölçümü ve daha dar bir alternatifi (yalnız görsel
 * yüzeyi olmayan değişikliklerde atlama) OPS'a yazdım; karar tam kapatma oldu ve uyguladım.
 * Bedeli burada duruyor ki geri açma tartışması bir dahakine sıfırdan başlamasın.
 *
 * ⭐NİÇİN `ignoreCommand` DEĞİL (OPS'un hükmü, kabul): "Ignored Build Step" ile atlanan bir
 * derleme YİNE bir deployment kaydı açar; kotayı sayıp saymadığı belirsizdir. `deploymentEnabled`
 * ise deployment'ı HİÇ doğurmaz. Belirsiz olanı değil, ölçülebilir olanı seçtik.
 * Panelde tanımlı `scripts/vercel-ignore-build.sh` atlaması KALDIRILMADI ve çakışmaz: artık
 * yalnız master için anlamlı (belge-only master push'u hâlâ "Canceled by Ignored Build Step").
 */

const KOK = process.cwd()
const YOL = path.join(KOK, 'vercel.json')

type VercelConfig = { git?: { deploymentEnabled?: Record<string, boolean> } }

describe('INV-VERCEL-ONIZLEME-1: yalniz master deploy uretir', () => {
  it('vercel.json VAR ve ayristirilabiliyor (kapi KOR kosmasin)', () => {
    expect(fs.existsSync(YOL), 'vercel.json yok — ayar panele geri kaymis olabilir').toBe(true)
    expect(() => JSON.parse(fs.readFileSync(YOL, 'utf8'))).not.toThrow()
  })

  /**
   * ⭐İKİ ANAHTAR BİRLİKTE ANLAM TAŞIR. Vercel örtüşen kurallarda "biri true ise deploy olur"
   * kuralını uygular; yani `"*": false` tek başına master'ı da susturur, `"master": true`
   * tek başına diğer dalları susturmaz. Kol İKİSİNİ AYRI AYRI ölçer — biri sessizce
   * düşerse sonuç ya yayın yok ya kota yine yanıyor demektir ve ikisi de sessizdir.
   */
  it('deploymentEnabled: yildiz FALSE ve master TRUE (ikisi ayri olculur)', () => {
    const cfg = JSON.parse(fs.readFileSync(YOL, 'utf8')) as VercelConfig
    const harita = cfg.git?.deploymentEnabled
    expect(harita, '`git.deploymentEnabled` YOK — kural kaldirilmis').toBeTruthy()

    expect(
      harita?.['*'],
      'Yildiz kurali FALSE degil: dal push\'lari yine onizleme dogurur ve kota master ' +
        'yayinini yemeye devam eder (2026-09-07: gunun 40+ deploy\'unun yarisi onizlemeydi).',
    ).toBe(false)

    expect(
      harita?.master,
      'master TRUE degil: YAYIN HIC CIKMAZ. Bu, kotadan daha pahali bir arizadir — ' +
        'musteri merge edilen hicbir seyi gormez.',
    ).toBe(true)
  })

  it('KAPSAM DAR: git ayari disinda bir sey EZILMIYOR', () => {
    const cfg = JSON.parse(fs.readFileSync(YOL, 'utf8')) as Record<string, unknown>
    // ⛔`vercel.json` icindeki her anahtar panel ayarini EZER. Bu dosya tek bir is icin
    // acildi; buraya sessizce eklenen bir `buildCommand`/`headers` panelde yasayan
    // yapilandirmayi gorunmez bicimde degistirir. Yeni anahtar bilincli bir karardir ve
    // bu kolu guncellemeyi gerektirir.
    const izinli = new Set(['$schema', 'git'])
    const fazla = Object.keys(cfg).filter((k) => !izinli.has(k))
    expect(
      fazla,
      'vercel.json\'a yeni ust anahtar eklenmis: ' + fazla.join(', ') + '. Her anahtar PANEL ' +
        'ayarini ezer; bu dosya yalniz deployment kapsami icin acildi. Bilincliyse bu kolu guncelle.',
    ).toEqual([])
  })
})
