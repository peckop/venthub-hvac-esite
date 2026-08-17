import { execFileSync } from 'node:child_process'

import { describe, expect, it } from 'vitest'

/**
 * INV-DOC-3 · `.cc_docs.yaml` ↔ NotebookLM defteri paritesi (companion-doc-standard §C6).
 *
 * NİÇİN VAR: yaml'da listelenen bir kaynağın deftere gerçekten yüklendiği (ve defterde
 * yaml'da olmayan artık kopya bulunmadığı) hiç ölçülmüyordu. 2026-08-17'de elle ölçüldü ve
 * **5 eksik kaynak** bulundu — yani ikiz, var olduğu sanılan belgeleri hiç görmüyordu.
 * Bayat kopya daha kötüsü: ikiz aynı belgeyi iki sürümde görüp emin biçimde yanlış cevap verir.
 *
 * ÖLÇÜM YOLU — niçin dolaylı: conformance testleri **ağ kullanamaz**, defter durumu ise
 * yalnız ağ üzerinden görünür. Bu yüzden `orion tree --nlm-sync` yüklemelerden SONRA defteri
 * yeniden listeleyip `docs/nlm_sync_manifest.json` yazar; bu bekçi yaml ile o manifest'i
 * karşılaştırır. Manifest **niyetin değil ölçümün** kaydıdır (üretim tarafı: orion
 * `manifest_govdesi`, 7 testle kilitli) — aksi hâlde yarıda kalan bir sync bile
 * "hepsi yüklendi" derdi ve kayıt KANIT gibi görünürdü.
 *
 * ⚠ ÖLÇÜLEMEDİ ≠ GEÇTİ: manifest yoksa ya da `olcum_basarili: false` ise bu bekçi KIRMIZI
 * yanar. Muafiyet yok (`no-grace-mode`): "defteri göremedim ama geçtim" diyen bir parite
 * kapısı, kapının hiç olmamasından daha kötüdür — yeşil görünür.
 */

interface NlmManifest {
  surum?: number
  olculdu?: string
  notebook_id?: string
  olcum_basarili?: boolean
  olcum_hatasi?: string
  beklenen?: string[]
  defterde?: { baslik: string; id: string }[]
  eksik?: string[]
  fazla?: string[]
}

const MANIFEST_YOLU = 'docs/nlm_sync_manifest.json'
const YAML_YOLU = '.cc_docs.yaml'

/** Depo hâlini oku (disk değil git — bkz. §C1: ikize giden şey depo hâlidir). */
function gitDosyasi(yol: string): string | null {
  try {
    return execFileSync('git', ['show', `HEAD:${yol}`], {
      encoding: 'utf8',
      maxBuffer: 40 * 1024 * 1024,
      env: { ...process.env, MSYS_NO_PATHCONV: '1' },
    })
  } catch {
    return null
  }
}

/**
 * `standalone_files` girdilerinin DOSYA ADLARI.
 *
 * Bilinçli olarak yaml ayrıştırıcısı KULLANILMIYOR: tek satırlık bir akış listesi ve
 * bağımlılık eklemek bu bekçiyi kırılganlaştırır. Ama biçim değişirse sessizce boş dönmesin
 * diye aşağıda vacuous-guard var (boş liste = kırmızı).
 */
function yamlStandaloneAdlari(yamlIcerik: string): string[] {
  const satir = yamlIcerik.split('\n').find(s => s.trimStart().startsWith('standalone_files:'))
  if (!satir) return []
  const ic = satir.slice(satir.indexOf('[') + 1, satir.lastIndexOf(']'))
  return ic
    .split(',')
    .map(s => s.trim().replace(/^["']|["']$/g, ''))
    .filter(Boolean)
    .map(s => s.split('/').pop() ?? s)
}

describe('INV-DOC-3 · yaml ↔ defter paritesi', () => {
  const manifestHam = gitDosyasi(MANIFEST_YOLU)

  it('manifest VAR olmalı — yoksa parite ÖLÇÜLEMEZ (ölçülemedi ≠ geçti)', () => {
    expect(
      manifestHam,
      `${MANIFEST_YOLU} depoda YOK. Parite ölçülemiyor ve bu "sorun yok" demek DEĞİL: ` +
        'defterde eksik ya da artık kaynak olup olmadığını kimse bilmiyor demek ' +
        '(2026-08-17 elle ölçümünde 5 eksik kaynak vardı).\n' +
        'ÜRETİMİ: orion tree --nlm-sync (yüklemelerden sonra defteri yeniden listeler ve ' +
        'manifest\'i ÖLÇÜMDEN yazar).\n' +
        'DİKKAT: sync CANLI deftere yazar (eski kaynakları silip yeniden yükler) — ' +
        'yani bu kapıyı silahlandırmak bir YETKİ kararıdır, testin kendi işi değil.',
    ).not.toBeNull()
  })

  it('manifest ÖLÇÜM içermeli — olcum_basarili=false ise kapı kırmızıdır', () => {
    if (manifestHam === null) return // ilk test bunu zaten kırmızı raporluyor
    const m = JSON.parse(manifestHam) as NlmManifest

    expect(
      m.olcum_basarili,
      'Manifest "ölçüm yapılamadı" hâlinde yazılmış: ' +
        `${m.olcum_hatasi ?? '(sebep yazılmamış)'}\n` +
        'Bu hâlde eksik/fazla listeleri BOŞ olur ve listelere bakan bir okuyucu bunu ' +
        '"parite tam" sanır — ayırt edici tek alan bu bayraktır. Sync\'i yeniden koş; ' +
        'sebep kimlik düşmesiyse: notebooklm login.',
    ).toBe(true)
  })

  it('yaml\'da listelenen HER kaynak manifest\'in beklenen listesinde olmalı (bayat manifest tespiti)', () => {
    if (manifestHam === null) return
    const m = JSON.parse(manifestHam) as NlmManifest
    const yamlHam = gitDosyasi(YAML_YOLU)
    expect(yamlHam, `${YAML_YOLU} okunamadı — ölçüm yolu bozuk`).not.toBeNull()

    const yamlAdlari = yamlStandaloneAdlari(yamlHam as string)
    expect(
      yamlAdlari.length,
      'yaml standalone listesi BOŞ ayrıştırıldı — biçim değişmiş olabilir; bu bekçi hiçbir ' +
        'şey ölçmüyor olurdu (vacuous)',
    ).toBeGreaterThan(10)

    const beklenen = new Set(m.beklenen ?? [])
    const manifestteYok = yamlAdlari.filter(a => !beklenen.has(a))

    expect(
      manifestteYok,
      'Bu dosyalar yaml\'a EKLENMİŞ ama son sync onları hiç görmemiş — yani manifest BAYAT ' +
        've defterde bu kaynaklar YOK. İkiz onları hiç bilmiyor.\n' +
        'ÇÖZÜM: orion tree --nlm-sync (sonra chat_ask ile teyit: yüklendi ≠ sorgulanabilir).\n' +
        `Eksikler:\n  ${manifestteYok.join('\n  ')}`,
    ).toEqual([])
  })

  it('defterde EKSİK kaynak olmamalı', () => {
    if (manifestHam === null) return
    const m = JSON.parse(manifestHam) as NlmManifest
    if (m.olcum_basarili !== true) return // ikinci test bunu kırmızı raporluyor

    expect(
      m.eksik ?? [],
      'Bu kaynaklar yüklenmesi gerektiği hâlde defterde YOK. İkiz "bu kural nerede yazılı" ' +
        'sorusuna eksik cevap verir ve eksikliğini bilmez.\n' +
        `  ${(m.eksik ?? []).join('\n  ')}`,
    ).toEqual([])
  })

  it('defterde ARTIK (fazla) kaynak olmamalı', () => {
    if (manifestHam === null) return
    const m = JSON.parse(manifestHam) as NlmManifest
    if (m.olcum_basarili !== true) return

    expect(
      m.fazla ?? [],
      'Bu kaynaklar defterde duruyor ama yaml onları listelemiyor — silinmemiş eski kopyalar. ' +
        'Etkisi eksiklikten KÖTÜ: ikiz aynı belgeyi iki sürümde görür ve emin biçimde yanlış ' +
        'cevap verir (bayat bilgi yanlış güven yaratır).\n' +
        `  ${(m.fazla ?? []).join('\n  ')}`,
    ).toEqual([])
  })
})
