// @vitest-environment node
import { createRequire } from 'node:module'
import path from 'node:path'

import { describe, expect, it } from 'vitest'

/**
 * INV-PROB-KUYRUK — `scripts/board/mechanism-setup.cjs` teslimat kanıtı (REC-192).
 *
 * NİÇİN VAR: 2026-09-07'de ÜÇ ŞERİT (URUN 4a8eaf9c, URUN-KATALOG 3a7976a1, ALTYAPI ac03ce11)
 * bağımsız olarak aynı belirtiyi bildirdi: *"beklenen olarak benim atmadığım ya da çoktan
 * kapattığım bir jeton tutuluyor, kendi taze kanıtım kırmızı veriyor."* Üç oturum saatlerce
 * kendi gözcülerinde hata aradı; hata gözcüde değil bu karşılaştırmadaydı.
 *
 * Aşağıdaki fikstürler UYDURMA DEĞİL: üçünün de canlı durum dosyasından okundu
 * (`C:/tmp/venthub-board/.mekanizma-durum.<sid>.json`). Bir kapının en iyi kolu, sahada
 * ölçülmüş bir arızanın birebir kopyasıdır.
 */

const req = createRequire(import.meta.url)
const BETIK = path.join(process.cwd(), 'scripts', 'board', 'mechanism-setup.cjs')
const mod = req(BETIK) as {
  teslimatKaniti: (a: {
    damga: unknown
    gordum: string
    kendiSid: string
    simdiMs: number
    esikSn?: number
  }) => { sinif: string; sebep: string; gecenSn: number | null }
  TESLIM_TAZELIK_SN: number
}

const BEN = 'ac03ce11-c975-478d-bf30-66afb7c00f15'
const OPS = 'cb0467f1-f1a3-437d-bc15-52c0bd90feb3'
const URUN = '4a8eaf9c-9b4f-4470-9761-69c58e2a926a'
const T0 = Date.parse('2026-09-07T18:23:14.139Z')
const simdi = T0 + 60_000

function olc(damga: unknown, gordum: string, kendiSid = BEN, ms = simdi) {
  return mod.teslimatKaniti({ damga, gordum, kendiSid, simdiMs: ms })
}

describe('INV-PROB-KUYRUK: bekleyen jeton KUYRUKTUR, tek slot DEGIL', () => {
  /**
   * ⭐ALTYAPI VAKASI (ölçüldü 2026-09-07 18:2xZ): OPS bana İKİ prob attı (2Y5YEB sonra
   * OS4P8W). Eski kodda `bekleyenler[atanSid]` TEK KAYITTI; ikinci atış birincisini sildi.
   * 2Y5YEB'yi BİLDİRİMDE GÖRMÜŞTÜM ama artık hiçbir yerde yoktu ve doğrulama "jeton
   * eşleşmedi" dedi — okuyan bunu "TESLİMAT KIRIK" diye anlar.
   * Eski tasarımın gerekçesi yazılıydı: "kendi eski kaydını ezmek kimsenin kanıtını silmez."
   * O cümle yanlıştı: HEDEF o jetonu çoktan görmüş olabilir.
   */
  it('AYNI ATANIN IKI PROBU: ikisi de dogrulanabilir (ezilme YOK)', () => {
    const damga = {
      bekleyenler: {
        [OPS]: [
          { jeton: 'PROB-ac03-2Y5YEB', atildiTs: new Date(T0 - 30_000).toISOString() },
          { jeton: 'PROB-ac03-OS4P8W', atildiTs: new Date(T0).toISOString() },
        ],
      },
    }
    expect(olc(damga, 'PROB-ac03-OS4P8W').sinif, 'yeni jeton dogrulanamadi').toBe('YESIL')
    expect(
      olc(damga, 'PROB-ac03-2Y5YEB').sinif,
      'ONCEKI jeton kayboldu — ayni atanin ikinci probu birincisini EZIYOR (asil kusur)',
    ).toBe('YESIL')
  })

  it('ESKI TEK-NESNE bicimi hala okunur (filo bir anda kor kalmaz)', () => {
    const damga = {
      bekleyenler: { [OPS]: { jeton: 'PROB-ac03-TEKNESNE', atildiTs: new Date(T0).toISOString() } },
    }
    expect(olc(damga, 'PROB-ac03-TEKNESNE').sinif).toBe('YESIL')
  })

  /**
   * ⭐URUN VAKASI (canlı dosyadan birebir, 2026-09-07): şema ESKİ DÜZ biçim —
   * `bekleyenler` yok, `tuketildi` alanı yok, `bekleyenJeton` doğrulandıktan sonra da duruyor.
   * URUN'un ölçümü: U0RNX4'ü başarıyla doğruladı (yeşil), ama sonra KENDİ geçerli jetonu
   * VWD2IQ ile koştuğunda hâlâ "beklenen U0RNX4" diyerek kırmızı aldı — yani tüketilmiş bir
   * bekleyen, oturumun kendi kanıtını SÜRESİZ gölgeliyordu.
   * Beklenen doğru davranış: kendi jetonu ZAYIF sayılmalı (ki sebebi doğrudur), "beklenen
   * şu jeton" diye YANLIŞ SEBEPLE kırmızı DEĞİL.
   */
  it('URUN VAKASI: tuketilmis ESKI bekleyen, kendi kanitini GOLGELEMEZ', () => {
    const damga = {
      sid: URUN,
      jeton: 'PROB-4a8e-VWD2IQ',
      bekleyenJeton: 'PROB-4a8e-U0RNX4',
      atanSid: BEN,
      atildiTs: '2026-09-07T17:14:36.035Z',
      teslimDogrulandiTs: '2026-09-07T17:15:40.758Z',
    }
    const r = olc(damga, 'PROB-4a8e-VWD2IQ', URUN, Date.parse('2026-09-07T18:30:00Z'))
    expect(
      r.sinif,
      'tuketilmis bekleyen hala golgeliyor — sebep: ' + r.sebep,
    ).toBe('ZAYIF')
    expect(r.sebep, 'sebep YANLIS: "beklenen <jeton>" degil "KENDI probun" olmali').toContain('KENDI probunun')
  })

  it('URUN VAKASI ters yon: tuketilmis jeton IKINCI kez yesil VERMEZ', () => {
    const damga = {
      sid: URUN,
      bekleyenJeton: 'PROB-4a8e-U0RNX4',
      atanSid: BEN,
      atildiTs: '2026-09-07T17:14:36.035Z',
      teslimDogrulandiTs: '2026-09-07T17:15:40.758Z',
    }
    const r = olc(damga, 'PROB-4a8e-U0RNX4', URUN, Date.parse('2026-09-07T18:30:00Z'))
    expect(r.sinif, 'ayni kanit iki kez sayildi').toBe('KIRMIZI')
    expect(r.sebep).toContain('ZATEN dogrulandi')
  })

  describe('SEBEP DOGRU OLMALI — yanlis sebeple kirmizi, kapiyi olcut olmaktan cikarir', () => {
    it('hic eslesmeyen jeton: "ULASMADI" der, canli bekleyen sayisini soyler, DEGERINI basmaz', () => {
      const damga = {
        bekleyenler: { [OPS]: [{ jeton: 'PROB-ac03-GIZLI', atildiTs: new Date(T0).toISOString() }] },
      }
      const r = olc(damga, 'PROB-ac03-YOKBOYLE')
      expect(r.sinif).toBe('KIRMIZI')
      expect(r.sebep, 'canli bekleyen sayisi soylenmedi').toMatch(/1 CANLI bekleyen/)
      // ⛔SINAVIN CEVABI EKRANA YAZILMAZ: bildirimi hic gormemis ajan o satiri geri yazip
      // gecerli damga uretebilirdi. Kanitin butun dayanagi "bunu ancak bildirimde gorursun".
      expect(r.sebep, 'BEKLENEN JETON DEGERI BASILDI — kanit taklidine kapi acilir').not.toContain('GIZLI')
    })

    it('BAYAT bekleyen (tazelik penceresi disi) kanit sayilmaz ve sebebi YAZILIR', () => {
      const damga = {
        bekleyenler: {
          [OPS]: [{ jeton: 'PROB-ac03-BAYAT', atildiTs: new Date(T0 - 75 * 60_000).toISOString() }],
        },
      }
      const r = olc(damga, 'PROB-ac03-BAYAT')
      expect(r.sinif, '75 dakikalik olu jeton TAZE gibi yesil verdi').toBe('KIRMIZI')
      expect(r.sebep, 'bayatlik sebebi yazilmadi').toMatch(/eski|DUSTU|bayat/i)
    })

    it('KENDI attigi jeton bagimsiz sayilmaz', () => {
      const damga = {
        bekleyenler: { [BEN]: [{ jeton: 'PROB-ac03-KENDIM', atildiTs: new Date(T0).toISOString() }] },
      }
      const r = olc(damga, 'PROB-ac03-KENDIM')
      expect(r.sinif).toBe('KIRMIZI')
      expect(r.sebep).toContain('ATAN da SEN')
    })

    /**
     * ⛔KİMLİK TAKLİDİ: sentetik `00000000-0000-4000-8000-<hedefin son 12 hanesi>` sid'i
     * `atanSid !== kendiSid` şartını GEÇER ama bağımsız değildir. Ölçüt son 12 hane.
     */
    it('SENTETIK KIMLIK (son 12 hane ayni) bagimsiz sayilmaz', () => {
      const sahte = '00000000-0000-4000-8000-' + BEN.slice(-12)
      const damga = {
        bekleyenler: { [sahte]: [{ jeton: 'PROB-ac03-SAHTE', atildiTs: new Date(T0).toISOString() }] },
      }
      const r = olc(damga, 'PROB-ac03-SAHTE')
      expect(r.sinif).toBe('KIRMIZI')
      expect(r.sebep).toContain('KIMLIK TAKLIDI')
    })
  })

  it('--gordum verilmediyse OLCULEMEDI (sessiz gecis yok)', () => {
    expect(olc({ bekleyenler: {} }, '').sinif).toBe('KIRMIZI')
  })

  /**
   * ⛔KANIT HIJYENI DISIPLINE DEGIL ARACA YAZILIR (REC-192, 2026-09-07).
   * Bagimsiz probda jeton ATANIN ekranina basilirsa atan onu hedefe iletebilir; hedef
   * `--gordum` ile geri yazar ve kapi "BAGIMSIZ TANIK" der — oysa hedef hicbir bildirim
   * gormemistir. Kanitin butun dayanagi "bu degeri ancak bildirimde gorursun" varsayimi.
   * Olculmus vaka: bu turda ben o satiri elle `grep -v jeton` ile gizlemek zorunda kaldim.
   * Davranis elle olculdu (bagimsiz probun ciktisinda jeton 0 kez gecti, oz-probda 1 kez);
   * bu kol o davranisin GERI ALINMASINI yakalar.
   */
  it('BAGIMSIZ PROBDA jeton ATANIN ekranina BASILMAZ (oz-probda basilir)', () => {
    const kaynak = req('node:fs').readFileSync(BETIK, 'utf8') as string
    const bagimsizDal = kaynak.slice(kaynak.indexOf('BAGIMSIZ PROB — hedef'))
    expect(
      bagimsizDal.slice(0, 400),
      'bagimsiz prob dalinda jeton DEGERI basiliyor — aklama yolu acik',
    ).toContain('BASILMADI')
    // Oz-prob yolu jetonu basmaya DEVAM etmeli: atan ile hedef ayni kisi, gizlemek anlamsiz
    // ve o kanit zaten ZAYIF isaretleniyor. Bu kol asiri duzeltmeyi yakalar.
    expect(kaynak, 'oz-probda da gizlenmis — o kanit yolu tamamen kullanilamaz olur').toContain(
      "', jeton ' + jeton",
    )
  })
})
