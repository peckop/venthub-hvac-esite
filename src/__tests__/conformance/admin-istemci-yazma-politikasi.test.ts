import { describe, expect, it } from 'vitest'
import fs from 'node:fs'
import path from 'node:path'

/**
 * INV-ADMIN-YAZMA-1 — admin panelinin TARAYICI istemcisiyle yazdığı her tablo,
 * karşılık gelen RLS politikası ölçülerek İLAN EDİLMİŞ olmalı.
 *
 * ⭐KUSUR SINIFI (ölçülmüş, REC-321 / 2026-09-13): `public.error_groups`
 * tablosunda RLS AÇIK ve tek politika var, o da SELECT. Admin paneli o tabloya
 * tarayıcı istemcisiyle DÖRT yerden `.update(...)` yapıyor
 * (ErrorGroupsTableBody.tsx 313 / 346 / 377 / 408). Dördü de RLS'e takılıyor:
 * kullanıcı "kaydedilemedi" görüyor, `tsc` / `lint` / `test` hiçbiri bunu
 * GÖRMÜYOR. Çünkü hata TypeScript'te değil, veritabanı yetkisinde yaşıyor.
 *
 * ⛔KAPININ SINIRI, ADIYLA: bu kapı CANLI VERİTABANINA BAKAMAZ — CI'da kimlik
 * yok ve bir konformans testinin prod'a sorgu atması istenmez. O yüzden
 * ölçtüğü şey politikanın VARLIĞI değil, İLANIN varlığı ve tutarlılığıdır.
 * Yani kapı "politika var" demiyor; "bu yazma ölçülmüş ve yazılmış" diyor.
 * Yeni bir istemci yazması eklendiğinde kırmızı verir ve yazarı ölçmeye
 * zorlar — işlevin canlıda sessizce düşmesini beklemek yerine.
 */

const KOK = path.resolve(__dirname, '..', '..', '..')
const ENVANTER_YOLU = path.join(KOK, 'docs', 'admin-istemci-yazma-envanteri.json')
const TARANAN_DIZINLER = ['src/views/admin', 'src/components/admin']

/** Yazma sayılan Supabase çağrıları. `upsert` yazmadır: INSERT + UPDATE ister. */
const YAZMA_ISLEMLERI = ['update', 'insert', 'delete', 'upsert'] as const

type Envanter = {
  olcum_damgasi: string
  tablolar: Record<
    string,
    {
      istemci_islemleri: string[]
      prod_politika_islemleri: string[]
      kural_var: boolean
      bekleyen_migration?: string
      kaynak: string
    }
  >
}

function tsDosyalari(): string[] {
  const cikti: string[] = []
  const yur = (d: string) => {
    if (!fs.existsSync(d)) return
    for (const g of fs.readdirSync(d, { withFileTypes: true })) {
      const tam = path.join(d, g.name)
      if (g.isDirectory()) yur(tam)
      else if (/\.(ts|tsx)$/.test(g.name) && !/\.test\.tsx?$/.test(g.name)) cikti.push(tam)
    }
  }
  for (const d of TARANAN_DIZINLER) yur(path.join(KOK, d))
  return cikti
}

/**
 * `.from('tablo')` ile onu izleyen yazma çağrısını eşler.
 *
 * ⚠TEK SATIR YETMEZ: zincir çok satıra bölünebilir ve gerçekte bölünüyor
 * (ErrorGroupsTableBody.tsx 345-346: `.from('error_groups')` bir satırda,
 * `.update({ assigned_to })` sonraki satırda). Bu yüzden eşleme, `.from(...)`
 * sonrasındaki PENCERE içinde aranır. Pencere, araya giren bir başka
 * `.from(...)` görülünce kapanır — yoksa bir tablonun yazması komşusuna
 * yazılır.
 */
function istemciYazmalari(icerik: string): Array<{ tablo: string; islem: string }> {
  const bulunan: Array<{ tablo: string; islem: string }> = []
  const fromDeseni = /\.from\(\s*['"`]([a-z0-9_]+)['"`]\s*\)/g
  const eslesmeler = [...icerik.matchAll(fromDeseni)]

  for (let i = 0; i < eslesmeler.length; i++) {
    const m = eslesmeler[i]
    const bas = (m.index ?? 0) + m[0].length
    // Pencere: bir sonraki `.from(` ya da 400 karakter — hangisi önce gelirse.
    const sonrakiFrom = eslesmeler[i + 1]?.index ?? icerik.length
    const son = Math.min(bas + 400, sonrakiFrom)
    const pencere = icerik.slice(bas, son)
    for (const islem of YAZMA_ISLEMLERI) {
      if (new RegExp(`\\.${islem}\\s*\\(`).test(pencere)) {
        bulunan.push({ tablo: m[1], islem })
      }
    }
  }
  return bulunan
}

const envanter: Envanter = JSON.parse(fs.readFileSync(ENVANTER_YOLU, 'utf8'))
const dosyalar = tsDosyalari()
const tumYazmalar = dosyalar.flatMap((d) =>
  istemciYazmalari(fs.readFileSync(d, 'utf8')).map((y) => ({ ...y, dosya: path.relative(KOK, d) })),
)

describe('INV-ADMIN-YAZMA-1 · admin istemci yazmasi = ilan edilmis RLS politikasi', () => {
  it('taranan dosya ve bulunan yazma SAYISI anlamli (kor tarama degil)', () => {
    // Sıfır dosya ya da sıfır yazma bulmak "temiz" değil, ÖLÇÜM BOZUK demektir:
    // dizin adı değişmiş ya da desen kaymış olabilir. Sessiz yeşil buradan girer.
    expect(dosyalar.length).toBeGreaterThanOrEqual(20)
    expect(tumYazmalar.length).toBeGreaterThanOrEqual(10)
  })

  it('her istemci yazmasi envanterde ILAN EDILMIS', () => {
    const ilansiz = tumYazmalar
      .filter((y) => {
        const kayit = envanter.tablolar[y.tablo]
        return !kayit || !kayit.istemci_islemleri.includes(y.islem)
      })
      .map((y) => `${y.tablo}.${y.islem}  (${y.dosya})`)

    expect(
      [...new Set(ilansiz)],
      'Bu yazmalar docs/admin-istemci-yazma-envanteri.json icinde YOK.\n' +
        'Yapilacak: pg_policies ile o tablonun ilgili islem icin politikasi VAR MI diye OLC,\n' +
        'sonucu envantere damgasiyla yaz. Politika yoksa istemci yazmasi CANLIDA SESSIZCE\n' +
        'reddedilir ve bunu hicbir statik kapi gormez (olculmus vaka: error_groups, REC-321).',
    ).toEqual([])
  })

  it('kural_var=false olan tablo bir BEKLEYEN MIGRATION gostermek zorunda', () => {
    // "Politika yok" bilmek yetmez; kapanma yolu da yazili olmali. Yoksa kayit,
    // cozumu olmayan bir bilgi notuna doner ve kimse kapatmaz.
    const acikta = Object.entries(envanter.tablolar)
      .filter(([, k]) => k.kural_var === false && !k.bekleyen_migration)
      .map(([t]) => t)
    expect(acikta, 'kural_var=false ise bekleyen_migration alani ZORUNLU').toEqual([])
  })

  it('bekleyen migration dosyasi DISKTE var', () => {
    const eksik = Object.entries(envanter.tablolar)
      .filter(([, k]) => k.bekleyen_migration && !fs.existsSync(path.join(KOK, k.bekleyen_migration!)))
      .map(([t, k]) => `${t} -> ${k.bekleyen_migration}`)
    expect(eksik, 'Envanter var olmayan bir migration dosyasini gosteriyor').toEqual([])
  })

  it('envanterde BAYAT satir yok (ilan var, kodda yazma yok)', () => {
    // Envanterin dogru kalmasi, eksigi yakalamak kadar onemli: kodda artik
    // olmayan bir yazma icin "politika gerekli" demek, sonraki okuyucuyu yanlis
    // yere bakmaya gonderir.
    const kodda = new Set(tumYazmalar.map((y) => `${y.tablo}.${y.islem}`))
    const bayat: string[] = []
    for (const [tablo, kayit] of Object.entries(envanter.tablolar)) {
      for (const islem of kayit.istemci_islemleri) {
        if (!kodda.has(`${tablo}.${islem}`)) bayat.push(`${tablo}.${islem}`)
      }
    }
    expect(bayat, 'Envanterde ilan edilmis ama admin istemci kodunda bulunmayan yazma').toEqual([])
  })

  it('olcum damgasi VAR ve bicimi dogru', () => {
    // Damgasiz bir olcum, ne zaman dogru oldugu bilinmeyen bir iddiadir.
    expect(envanter.olcum_damgasi).toMatch(/^\d{4}-\d{2}-\d{2}$/)
  })

  it('OLCULMUS VAKA korunuyor: error_groups ilan edilmis ve istemci yazmasi gorulmus', () => {
    // Bu kol, kapinin dogdugu vakayi kilitler. error_groups yazmasi koddan
    // kaldirilirsa "bayat satir" kolu kirmizi verir; envanterden kaldirilirsa
    // "ilan edilmis" kolu kirmizi verir. Ikisi birden sessizce kaybolamaz.
    expect(envanter.tablolar.error_groups).toBeDefined()
    expect(tumYazmalar.filter((y) => y.tablo === 'error_groups' && y.islem === 'update').length).toBeGreaterThanOrEqual(3)
  })
})
