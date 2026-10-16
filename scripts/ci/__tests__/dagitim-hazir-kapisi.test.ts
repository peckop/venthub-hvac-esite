import { spawnSync } from 'node:child_process'
import { mkdtempSync, readFileSync, rmSync, writeFileSync } from 'node:fs'
import { createRequire } from 'node:module'
import { tmpdir } from 'node:os'
import path from 'node:path'

import { afterAll, describe, expect, it } from 'vitest'

/**
 * INV-DAGITIM-HAZIR-1 · DAĞITIM HAZIR KAPISI (scripts/ci/dagitim-hazir-kapisi.cjs, ALT-82).
 *
 * Kapı master'a her birleşmeden sonra o commit'in Vercel üretim dağıtımının sonucunu GitHub commit durumundan ölçer; birleşmeyi bloklamaz,
 * kırmızıda iş akışını kırmızı yapar. Bir kapı yanlış yönde hata yaparsa ya sahte kırmızı (bakılmayan kapı) ya sessiz yeşil (gerçek hata
 * görünmez) üretir; ikincisi bu kapının var olma sebebini siler. Bloklar:
 *   1. `vercelDurumu`: ÖLÇÜLMÜŞ fikstürler (14 Ekim, gh api commits/<sha>/status) + pending/bağlam yok/tanınmayan durumlar,
 *   2. `hukumVer`: sınıf → seviye/çıkış (notice 0, error 1, warning 0) ve İPTAL'in master ucuna göre ikiye ayrılması,
 *   3. `olc`: yoklama döngüsü (sahte ağ, sahte saat): bekleme, zaman aşımı, kalıcı/geçici HTTP hatası, girdi doğrulaması, URL ve başlıklar,
 *   4. `satirTemizle` + `main`: iş akışı komutu enjeksiyonu, token sızıntısı, iç hata → ÖLÇÜLEMEDİ (çıkış 0),
 *   5. iş akışı dosyası: push-only, bloklamaz, zorunlu çekirdeğe GİRMEZ, sır/self-hosted/install yok,
 *   6. SABOTAJ: kapı kaynağına tek tek hata sokulur; her hatalı kopya en az bir senaryoyu kırmızıya çevirir.
 *
 * Fikstürlerdeki 40 haneli SHA'lar ölçülmüş KISA SHA'nın sıfırla tamamlanmış hâlidir (yalnız kısa SHA ölçüldü; sınıflayıcı SHA'ya bakmaz).
 */

type Kayit = { context?: string; state?: string; description?: string; target_url?: string; updated_at?: string }
type Olcum = { sinif: string; state?: string; aciklama?: string; url?: string; neden?: string; baglamlar?: string[] }
type Hukum = { sinif: string; seviye: string; cikis: number; mesaj: string }
type Sonuc = Hukum & { deneme: number }
type OlcGirdi = {
  repo?: unknown
  sha?: unknown
  token?: unknown
  fetch?: unknown
  uyku: (ms: number) => Promise<void>
  saat: () => number
  aralikMs?: number
  azamiMs?: number
  gunluk?: (m: string) => void
}
type FetchTaklidi = (url: string, init?: { headers?: Record<string, string> }) => Promise<Response>
type Modul = {
  vercelDurumu: (govde: unknown) => Olcum
  hukumVer: (olcum: Olcum, baglam: { sha: string; masterSha?: string | null; masterHata?: string }) => Hukum
  olc: (girdi: OlcGirdi) => Promise<Sonuc>
  main: (ortam: Record<string, string>, yaz: (s: string) => void, dep?: { fetch?: unknown; uyku?: (ms: number) => Promise<void>; saat?: () => number; aralikMs?: number; azamiMs?: number }) => Promise<number>
  satirTemizle: (metin: unknown, azami?: number, gizli?: string) => string
  komutSatiri: (seviye: string, mesaj: string, gizli?: string) => string
}
type MergeRitueli = {
  workflowCoz: (metin: string) => { tetikli: boolean; pathsVar: boolean; joblar: Array<{ id: string; ad: string | null; kosullu: boolean }> }
  turetCekirdek: (kok: string) => { kapilar: string[]; sinirlar: string[]; okunanDosya: number }
}

const require_ = createRequire(import.meta.url)
const KOK = path.resolve(__dirname, '../../..')
const KAPI_YOLU = path.join(KOK, 'scripts/ci/dagitim-hazir-kapisi.cjs')
const KAYNAK = readFileSync(KAPI_YOLU, 'utf8').replace(/\r\n/g, '\n')
const GERCEK = require_(KAPI_YOLU) as Modul
const IS_AKISI = path.join(KOK, '.github/workflows/dagitim-hazir.yml')

function esit(gercek: unknown, beklenen: unknown, ne: string): void {
  if (JSON.stringify(gercek) !== JSON.stringify(beklenen)) throw new Error(`${ne}: beklenen ${JSON.stringify(beklenen)} ama gelen ${JSON.stringify(gercek)}`)
}
function dogru(kosul: boolean, ne: string): void {
  if (!kosul) throw new Error(ne)
}

const REPO = 'peckop/venthub-hvac-esite'
const TOKEN = 'ghs_TESTTOKEN1234567890'
/** Ölçülmüş kısa SHA → 40 haneye sıfırla tamamlanmış. */
function tam(kisa: string): string {
  return kisa.padEnd(40, '0')
}
const SHA = tam('a518d6543')
const MASTER_BASKA = tam('bbbbbbbbb')
const VERCEL_HATA_ACIKLAMASI = 'Deployment has failed — run this Vercel CLI command: npx vercel inspect dpl_ornek'

function vercel(state: string, description: string, ek: Kayit = {}): Kayit {
  return { context: 'Vercel', state, description, target_url: 'https://vercel.com/ornek/proje/dpl_ornek', ...ek }
}
function govde(...statuses: Kayit[]): { state: string; sha: string; statuses: Kayit[] } {
  return { state: 'success', sha: SHA, statuses }
}

// ---------------------------------------------------------------------------------------------------------------------------
// SAHTE AĞ ve SAHTE SAAT
// ---------------------------------------------------------------------------------------------------------------------------

type Adim = { status: number; govde?: unknown } | { atar: string }
type Cagri = { url: string; yetki: string | null }

function sahteAg(durum: Adim[], master: Adim[] = []): { fetch: FetchTaklidi; cagrilar: Cagri[] } {
  const cagrilar: Cagri[] = []
  let di = 0
  let mi = 0
  const fetch: FetchTaklidi = async (url, init) => {
    cagrilar.push({ url, yetki: init?.headers?.Authorization ?? null })
    const masterMi = url.includes('/commits/') && !url.includes('/status')
    const liste = masterMi ? master : durum
    const sira = masterMi ? mi++ : di++
    const adim = liste[Math.min(sira, liste.length - 1)]
    if (adim === undefined) return new Response('{}', { status: 404 })
    if ('atar' in adim) throw new Error(adim.atar)
    return new Response(JSON.stringify(adim.govde ?? {}), { status: adim.status })
  }
  return { fetch, cagrilar }
}

function sahteSaat(): { saat: () => number; uyku: (ms: number) => Promise<void>; durum: () => { gecen: number; uykuSayisi: number } } {
  let t = 0
  let n = 0
  return {
    saat: () => t,
    uyku: async (ms) => {
      n += 1
      if (n > 200) throw new Error('yoklama döngüsü sınırsız (200 uykudan fazla)')
      t += ms
    },
    durum: () => ({ gecen: t, uykuSayisi: n }),
  }
}

async function kos(M: Modul, ag: { fetch: FetchTaklidi }, ek: Partial<OlcGirdi> = {}): Promise<{ sonuc: Sonuc; gecen: number; uykuSayisi: number }> {
  const sa = sahteSaat()
  const sonuc = await M.olc({ repo: REPO, sha: SHA, token: TOKEN, fetch: ag.fetch, uyku: sa.uyku, saat: sa.saat, ...ek })
  return { sonuc, ...sa.durum() }
}

async function mainKos(
  M: Modul,
  ortam: Record<string, string>,
  ag: { fetch: unknown },
  ek: { aralikMs?: number; azamiMs?: number } = {},
): Promise<{ cikis: number; cikti: string }> {
  const sa = sahteSaat()
  let cikti = ''
  const cikis = await M.main(ortam, (s) => (cikti += s), { fetch: ag.fetch, uyku: sa.uyku, saat: sa.saat, ...ek })
  return { cikis, cikti }
}

// ---------------------------------------------------------------------------------------------------------------------------
// SENARYOLAR
// ---------------------------------------------------------------------------------------------------------------------------

type Senaryo = { ad: string; kos: (M: Modul) => Promise<void> | void }

const SENARYOLAR: Senaryo[] = [
  {
    ad: 'vercelDurumu: ölçülmüş fikstürler (READY, ATLANDI, İPTAL, HATA x2) ve pending',
    kos: (M) => {
      const tablo: Array<[string, Kayit, string]> = [
        ['a518d6543 success Deployment has completed', vercel('success', 'Deployment has completed'), 'READY'],
        ['8796c0d73 success Canceled by Ignored Build Step', vercel('success', 'Canceled by Ignored Build Step'), 'ATLANDI'],
        ['f1c8a7529 failure Canceled from the Vercel Dashboard', vercel('failure', 'Canceled from the Vercel Dashboard'), 'IPTAL'],
        ['5d82ca6dc failure Deployment has failed', vercel('failure', VERCEL_HATA_ACIKLAMASI), 'HATA'],
        ['17212fba1 failure Deployment has failed', vercel('failure', VERCEL_HATA_ACIKLAMASI), 'HATA'],
        ['pending (açıklama metnine bağımlı değil: boş)', vercel('pending', ''), 'BEKLIYOR'],
        ['pending (başka metin)', vercel('pending', 'Building'), 'BEKLIYOR'],
        ['error state failure gibi: HATA', vercel('error', 'Deployment errored'), 'HATA'],
        ['error + Canceled: İPTAL', vercel('error', 'Canceled by newer deployment'), 'IPTAL'],
        ['state büyük harfle gelirse de tanınır', vercel('SUCCESS', 'Deployment has completed'), 'READY'],
      ]
      for (const [ad, kayit, beklenen] of tablo) esit(M.vercelDurumu(govde(kayit)).sinif, beklenen, ad)
      esit(M.vercelDurumu(govde(vercel('success', 'Deployment has completed'))).url, 'https://vercel.com/ornek/proje/dpl_ornek', 'hedef URL taşınır')
    },
  },
  {
    ad: 'vercelDurumu: bağlam yok → YOK (başka bağlamlar sayılmaz), tanınmayan state/açıklama/yanıt → BELIRSIZ, çok kayıtta en yenisi',
    kos: (M) => {
      const yok = M.vercelDurumu(govde({ context: 'ci', state: 'failure', description: 'CI kırmızı' }, { context: 'admin-smoke', state: 'success', description: 'ok' }))
      esit(yok.sinif, 'YOK', 'yalnız başka bağlamlar')
      esit(yok.baglamlar, ['ci', 'admin-smoke'], 'görülen bağlamlar raporlanır')
      esit(M.vercelDurumu(govde()).sinif, 'YOK', 'statuses boş')
      esit(M.vercelDurumu(govde(vercel('weird', 'x'))).sinif, 'BELIRSIZ', 'beklenmeyen state')
      esit(M.vercelDurumu(govde(vercel('', 'x'))).sinif, 'BELIRSIZ', 'boş state')
      esit(M.vercelDurumu(govde(vercel('success', 'Something else entirely'))).sinif, 'BELIRSIZ', 'tanınmayan success açıklaması sessiz yeşil değildir')
      esit(M.vercelDurumu(null).sinif, 'BELIRSIZ', 'null gövde')
      esit(M.vercelDurumu({ statuses: 'x' }).sinif, 'BELIRSIZ', 'statuses dizi değil')
      esit(M.vercelDurumu('metin').sinif, 'BELIRSIZ', 'metin gövde')
      const eskiHata = vercel('failure', VERCEL_HATA_ACIKLAMASI, { updated_at: '2026-10-12T10:00:00Z' })
      const yeniBasari = vercel('success', 'Deployment has completed', { updated_at: '2026-10-12T10:05:00Z' })
      esit(M.vercelDurumu(govde(eskiHata, yeniBasari)).sinif, 'READY', 'eski hata + yeni başarı: yeni kazanır')
      esit(M.vercelDurumu(govde(yeniBasari, eskiHata)).sinif, 'READY', 'sıra fark etmez')
    },
  },
  {
    ad: 'hukumVer: sınıf → seviye ve çıkış (yalnız HATA ve yerine geçen olmayan İPTAL çıkış 1)',
    kos: (M) => {
      const b = { sha: SHA }
      const ready = M.hukumVer({ sinif: 'READY', aciklama: 'Deployment has completed' }, b)
      esit([ready.sinif, ready.seviye, ready.cikis], ['READY', 'notice', 0], 'READY')
      dogru(ready.mesaj.includes('a518d65'), 'READY mesajı kısa SHA taşır')
      const atlandi = M.hukumVer({ sinif: 'ATLANDI', aciklama: 'Canceled by Ignored Build Step' }, b)
      esit([atlandi.sinif, atlandi.seviye, atlandi.cikis], ['ATLANDI', 'notice', 0], 'ATLANDI')
      dogru(/site kodu içermiyor/.test(atlandi.mesaj) && /kırmızı değil/.test(atlandi.mesaj), 'ATLANDI mesajı kırmızı olmadığını söyler')
      const hata = M.hukumVer({ sinif: 'HATA', aciklama: VERCEL_HATA_ACIKLAMASI, url: 'https://vercel.com/o/p/d' }, b)
      esit([hata.sinif, hata.seviye, hata.cikis], ['HATA', 'error', 1], 'HATA')
      dogru(hata.mesaj.includes('git_info_fail') && hata.mesaj.includes('npx vercel inspect') && hata.mesaj.includes('karar 342'), 'HATA mesajı ipucunu taşır')
      const bel = M.hukumVer({ sinif: 'BELIRSIZ', neden: 'beklenmeyen state: weird' }, b)
      esit([bel.sinif, bel.seviye, bel.cikis], ['OLCULEMEDI', 'warning', 0], 'BELIRSIZ → ÖLÇÜLEMEDİ')
      dogru(/ÖLÇÜLEMEDİ/.test(bel.mesaj) && /YEŞİL DEĞİL/.test(bel.mesaj), 'ÖLÇÜLEMEDİ açıkça yazılır')
    },
  },
  {
    ad: 'hukumVer: İPTAL master ucuna göre — farklı uç → yerine geçildi (0), aynı uç → yerine geçen yok (1), uç okunamadı → ÖLÇÜLEMEDİ (0)',
    kos: (M) => {
      const iptal: Olcum = { sinif: 'IPTAL', aciklama: 'Canceled from the Vercel Dashboard' }
      const gecildi = M.hukumVer(iptal, { sha: SHA, masterSha: MASTER_BASKA })
      esit([gecildi.sinif, gecildi.seviye, gecildi.cikis], ['IPTAL_YERINE_GECILDI', 'notice', 0], 'farklı uç')
      const yok = M.hukumVer(iptal, { sha: SHA, masterSha: SHA })
      esit([yok.sinif, yok.seviye, yok.cikis], ['IPTAL_YERINE_GECEN_YOK', 'error', 1], 'aynı uç')
      dogru(yok.mesaj.includes('elle dağıtım gerekir') && yok.mesaj.includes('karar 342'), 'yerine geçen yok mesajı elle dağıtımı ve kararı söyler')
      const buyuk = M.hukumVer(iptal, { sha: SHA, masterSha: SHA.toUpperCase().replace(/0/g, '0') })
      esit(buyuk.cikis, 1, 'SHA büyük/küçük harf farkı aynı uç sayılır')
      for (const kotu of [null, undefined, '', 'abc', 'g'.repeat(40)]) {
        const o = M.hukumVer(iptal, { sha: SHA, masterSha: kotu as string | null, masterHata: 'GitHub API HTTP 500' })
        esit([o.sinif, o.seviye, o.cikis], ['OLCULEMEDI', 'warning', 0], `master ucu geçersiz (${String(kotu)}): sessiz yerine-geçildi YOK`)
      }
    },
  },
  {
    ad: 'satirTemizle: kontrol karakteri → boşluk, % silinir, :: tek olur, uzun metin kesilir, token maskelenir',
    kos: (M) => {
      const kirli = M.satirTemizle('a\nb\r\n::error::sahte %0A\u2028::warning::x\u0085y\u0000z')
      dogru(!new RegExp('[\\n\\r\\u2028\\u0085\\u0000%]').test(kirli), `kontrol karakteri ya da % kaldı: ${JSON.stringify(kirli)}`)
      dogru(!kirli.includes('::'), `:: kaldı: ${JSON.stringify(kirli)}`)
      esit(M.satirTemizle('x'.repeat(500)).length, 161, 'kesme (160 + …)')
      esit(M.satirTemizle(null), '', 'null boş')
      esit(M.satirTemizle(`hata ${TOKEN} sonu`, 160, TOKEN), 'hata *** sonu', 'token maskelenir')
      dogru(M.satirTemizle('abc', 160, 'abc') === 'abc', 'çok kısa gizli (<4) maskelenmez')
    },
  },
  {
    ad: 'olc: ilk okumada READY → tek deneme, uyku yok, notice/0',
    kos: async (M) => {
      const ag = sahteAg([{ status: 200, govde: govde(vercel('success', 'Deployment has completed')) }])
      const { sonuc, uykuSayisi } = await kos(M, ag)
      esit([sonuc.sinif, sonuc.seviye, sonuc.cikis, sonuc.deneme, uykuSayisi], ['READY', 'notice', 0, 1, 0], 'READY ilk okuma')
    },
  },
  {
    ad: 'olc: pending sürer, sonra success → bekler (20 sn aralık), terminalde durur',
    kos: async (M) => {
      const ag = sahteAg([
        { status: 200, govde: govde(vercel('pending', 'Building')) },
        { status: 200, govde: govde() },
        { status: 200, govde: govde(vercel('success', 'Deployment has completed')) },
      ])
      const { sonuc, gecen, uykuSayisi } = await kos(M, ag)
      esit([sonuc.sinif, sonuc.deneme, uykuSayisi, gecen], ['READY', 3, 2, 40000], 'pending → bağlam yok → READY')
    },
  },
  {
    ad: 'olc: hata ve ATLANDI terminal sayılır (bekleme yok)',
    kos: async (M) => {
      const hata = await kos(M, sahteAg([{ status: 200, govde: govde(vercel('failure', VERCEL_HATA_ACIKLAMASI)) }]))
      esit([hata.sonuc.sinif, hata.sonuc.cikis, hata.sonuc.deneme], ['HATA', 1, 1], 'HATA')
      const atl = await kos(M, sahteAg([{ status: 200, govde: govde(vercel('success', 'Canceled by Ignored Build Step')) }]))
      esit([atl.sonuc.sinif, atl.sonuc.cikis, atl.sonuc.deneme], ['ATLANDI', 0, 1], 'ATLANDI')
    },
  },
  {
    ad: 'olc: bağlam hiç gelmezse 12 dk sonra ZAMAN_AŞIMI (37 deneme, 36 uyku, 720 sn), warning ve çıkış 0, görülen bağlamlar yazılır',
    kos: async (M) => {
      const ag = sahteAg([{ status: 200, govde: govde({ context: 'ci', state: 'success', description: 'ok' }) }])
      const { sonuc, gecen, uykuSayisi } = await kos(M, ag)
      esit([sonuc.sinif, sonuc.seviye, sonuc.cikis], ['ZAMAN_ASIMI', 'warning', 0], 'zaman aşımı bloklamaz')
      esit([sonuc.deneme, uykuSayisi, gecen], [37, 36, 720000], 'yoklama sınırı')
      dogru(sonuc.mesaj.includes('12 dk') && sonuc.mesaj.includes('ci'), 'mesaj süreyi ve görülen bağlamı yazar')
    },
  },
  {
    ad: 'olc: süresi dolarken hâlâ pending → ZAMAN_AŞIMI (son: pending)',
    kos: async (M) => {
      const { sonuc } = await kos(M, sahteAg([{ status: 200, govde: govde(vercel('pending', 'Building')) }]))
      esit([sonuc.sinif, sonuc.cikis], ['ZAMAN_ASIMI', 0], 'pending sonsuz')
      dogru(sonuc.mesaj.includes('pending'), 'son durum pending yazılır')
    },
  },
  {
    ad: 'olc: kalıcı HTTP hatası (401/403/404/422) yoklamayı DURDURUR: ÖLÇÜLEMEDİ, warning, çıkış 0, tek deneme',
    kos: async (M) => {
      for (const kod of [401, 403, 404, 422]) {
        const { sonuc, uykuSayisi } = await kos(M, sahteAg([{ status: kod }]))
        esit([sonuc.sinif, sonuc.seviye, sonuc.cikis, sonuc.deneme, uykuSayisi], ['OLCULEMEDI', 'warning', 0, 1, 0], `HTTP ${kod}`)
        dogru(/ÖLÇÜLEMEDİ/.test(sonuc.mesaj) && sonuc.mesaj.includes(String(kod)), `HTTP ${kod} mesajda`)
      }
    },
  },
  {
    ad: 'olc: geçici hata (500, ağ) yoklamayı sürdürür; sonra success → READY',
    kos: async (M) => {
      const ag = sahteAg([{ status: 500 }, { atar: 'ECONNRESET' }, { status: 200, govde: govde(vercel('success', 'Deployment has completed')) }])
      const { sonuc } = await kos(M, ag)
      esit([sonuc.sinif, sonuc.deneme], ['READY', 3], 'geçici hatalar')
    },
  },
  {
    ad: 'olc: durum sürekli okunamazsa ZAMAN_AŞIMI DEĞİL ÖLÇÜLEMEDİ (sessiz yeşil değil, "okunamadı" açık)',
    kos: async (M) => {
      const { sonuc } = await kos(M, sahteAg([{ atar: 'ETIMEDOUT' }]))
      esit([sonuc.sinif, sonuc.seviye, sonuc.cikis, sonuc.deneme], ['OLCULEMEDI', 'warning', 0, 37], 'sürekli ağ hatası')
      dogru(sonuc.mesaj.includes('ETIMEDOUT') && /ÖLÇÜLEMEDİ/.test(sonuc.mesaj), 'son hata ve ÖLÇÜLEMEDİ yazılır')
      const bozuk = await kos(M, sahteAg([{ status: 200, govde: 'metin' }]))
      esit(bozuk.sonuc.sinif, 'OLCULEMEDI', 'tanınmayan gövde')
    },
  },
  {
    ad: 'olc: İPTAL ve master ucu başka → yerine geçildi (notice, 0); master ucu bu commit → yerine geçen yok (error, 1); uç okunamadı → ÖLÇÜLEMEDİ (0)',
    kos: async (M) => {
      const iptal: Adim = { status: 200, govde: govde(vercel('failure', 'Canceled from the Vercel Dashboard')) }
      const gecildi = await kos(M, sahteAg([iptal], [{ status: 200, govde: { sha: MASTER_BASKA } }]))
      esit([gecildi.sonuc.sinif, gecildi.sonuc.seviye, gecildi.sonuc.cikis], ['IPTAL_YERINE_GECILDI', 'notice', 0], 'yerine geçildi')
      const yok = await kos(M, sahteAg([iptal], [{ status: 200, govde: { sha: SHA } }]))
      esit([yok.sonuc.sinif, yok.sonuc.seviye, yok.sonuc.cikis], ['IPTAL_YERINE_GECEN_YOK', 'error', 1], 'yerine geçen yok')
      const okunamadi = await kos(M, sahteAg([iptal], [{ status: 500 }]))
      esit([okunamadi.sonuc.sinif, okunamadi.sonuc.seviye, okunamadi.sonuc.cikis], ['OLCULEMEDI', 'warning', 0], 'master ucu 500')
      const shaYok = await kos(M, sahteAg([iptal], [{ status: 200, govde: {} }]))
      esit(shaYok.sonuc.sinif, 'OLCULEMEDI', 'master yanıtında sha yok')
      const agHata = await kos(M, sahteAg([iptal], [{ atar: 'ECONNRESET' }]))
      esit(agHata.sonuc.sinif, 'OLCULEMEDI', 'master ucu ağ hatası')
    },
  },
  {
    ad: 'olc: istek yolları ve başlıkları — durum ucu per_page=100, master ucu commits/master, Authorization taşınır',
    kos: async (M) => {
      const ag = sahteAg([{ status: 200, govde: govde(vercel('failure', 'Canceled from the Vercel Dashboard')) }], [{ status: 200, govde: { sha: MASTER_BASKA } }])
      await kos(M, ag)
      esit(
        ag.cagrilar.map((c) => c.url),
        [`https://api.github.com/repos/${REPO}/commits/${SHA}/status?per_page=100`, `https://api.github.com/repos/${REPO}/commits/master`],
        'uç noktalar',
      )
      esit(
        ag.cagrilar.map((c) => c.yetki),
        [`Bearer ${TOKEN}`, `Bearer ${TOKEN}`],
        'her istek yetkili',
      )
    },
  },
  {
    ad: 'olc: girdi doğrulaması — geçersiz repo/sha, eksik token → ağa HİÇ gidilmez, ÖLÇÜLEMEDİ (0)',
    kos: async (M) => {
      const kotu: Array<Partial<OlcGirdi>> = [
        { sha: 'abc' },
        { sha: `${'a'.repeat(39)}/` },
        { sha: undefined },
        { repo: 'peckop' },
        { repo: '../../x/y' },
        { repo: undefined },
        { token: '' },
        { token: undefined },
      ]
      for (const ek of kotu) {
        const ag = sahteAg([{ status: 200, govde: govde(vercel('success', 'Deployment has completed')) }])
        const { sonuc } = await kos(M, ag, ek)
        esit([sonuc.sinif, sonuc.cikis, sonuc.deneme, ag.cagrilar.length], ['OLCULEMEDI', 0, 0, 0], `girdi ${JSON.stringify(ek)}`)
      }
      const fetchYok = await M.olc({ repo: REPO, sha: SHA, token: TOKEN, fetch: undefined, ...sahteSaat() })
      esit([fetchYok.sinif, fetchYok.cikis], ['OLCULEMEDI', 0], 'fetch yok')
    },
  },
  {
    ad: 'main: READY → ::notice:: ve çıkış 0; HATA → ::error:: ve çıkış 1; tek komut satırı',
    kos: async (M) => {
      const ortam = { GITHUB_REPOSITORY: REPO, GITHUB_SHA: SHA, GITHUB_TOKEN: TOKEN, GITHUB_REF: 'refs/heads/master' }
      const ok = await mainKos(M, ortam, sahteAg([{ status: 200, govde: govde(vercel('success', 'Deployment has completed')) }]))
      esit(ok.cikis, 0, 'READY çıkış')
      dogru(ok.cikti.includes('::notice::Vercel üretim dağıtımı hazır (a518d65): Deployment has completed'), `READY satırı: ${ok.cikti}`)
      const kotu = await mainKos(M, ortam, sahteAg([{ status: 200, govde: govde(vercel('failure', VERCEL_HATA_ACIKLAMASI)) }]))
      esit(kotu.cikis, 1, 'HATA çıkış')
      dogru(kotu.cikti.includes('::error::Vercel üretim dağıtımı BAŞARISIZ (a518d65)'), `HATA satırı: ${kotu.cikti}`)
      esit(kotu.cikti.split('\n').filter((s) => s.startsWith('::')).length, 1, 'tam bir komut satırı')
    },
  },
  {
    ad: 'main: dışarıdan gelen açıklama/URL iş akışı komutu üretemez (enjeksiyon), token çıktıya sızmaz',
    kos: async (M) => {
      const ortam = { GITHUB_REPOSITORY: REPO, GITHUB_SHA: SHA, GITHUB_TOKEN: TOKEN }
      const kirli = vercel('failure', 'bozuk\n::error::sahte komut %0A\n::set-output name=x::y', { target_url: 'https://x/\n::warning::url' })
      const { cikti } = await mainKos(M, ortam, sahteAg([{ status: 200, govde: govde(kirli) }]))
      const komutlar = cikti.split('\n').filter((s) => s.startsWith('::'))
      esit(komutlar.length, 1, 'yalnız kapının kendi komut satırı')
      dogru(komutlar[0].startsWith('::error::'), 'kapının komutu error')
      dogru(!komutlar[0].slice('::error::'.length).includes('::'), `komut gövdesinde :: kaldı: ${komutlar[0]}`)
      dogru(!cikti.includes('%'), '% kaldı')
      const sizinti = await mainKos(M, ortam, sahteAg([{ atar: `baglanti ${TOKEN} reddedildi` }]), { aralikMs: 1, azamiMs: 2 })
      dogru(!sizinti.cikti.includes(TOKEN), `token çıktıya sızdı: ${sizinti.cikti}`)
      dogru(sizinti.cikti.includes('***'), 'token maskelenir')
      // Token kesme sınırına denk gelirse yarım token sızabilir: maskeleme KESMEDEN ÖNCE (kaynakta) olmalı.
      // 58 karakterlik "son 0 dk ... ağ hatası: " önekinden sonra token 148. indekste başlar; 160'ta kesilince 12 karakteri görünür.
      const sinirda = await mainKos(M, ortam, sahteAg([{ atar: `${'x'.repeat(89)} ${TOKEN} sonu` }]), { aralikMs: 1, azamiMs: 2 })
      dogru(!sinirda.cikti.includes(TOKEN.slice(0, 8)), `token (yarım da olsa) çıktıya sızdı: ${sinirda.cikti}`)
    },
  },
  {
    ad: 'main: master dışı ref ölçülmez (notice, 0, ağ yok); iç hata ÖLÇÜLEMEDİ (warning, 0) — birleşmeyi bloklamaz',
    kos: async (M) => {
      const dis = sahteAg([{ status: 200, govde: govde(vercel('failure', VERCEL_HATA_ACIKLAMASI)) }])
      const r = await mainKos(M, { GITHUB_REPOSITORY: REPO, GITHUB_SHA: SHA, GITHUB_TOKEN: TOKEN, GITHUB_REF: 'refs/heads/altyapi/x' }, dis)
      esit([r.cikis, dis.cagrilar.length], [0, 0], 'master dışı ref')
      dogru(r.cikti.startsWith('::notice::') && r.cikti.includes('ölçülmedi'), `master dışı çıktı: ${r.cikti}`)
      const patlak = { fetch: async () => ({ get ok(): boolean { throw new Error('beklenmeyen') } }) }
      const c = await mainKos(M, { GITHUB_REPOSITORY: REPO, GITHUB_SHA: SHA, GITHUB_TOKEN: TOKEN }, patlak)
      esit(c.cikis, 0, 'iç hata çıkış 0')
      dogru(c.cikti.includes('::warning::') && /ÖLÇÜLEMEDİ/.test(c.cikti) && /YEŞİL DEĞİL/.test(c.cikti), `iç hata çıktısı: ${c.cikti}`)
    },
  },
  {
    ad: 'main: ortam değişkenleri yoksa ÖLÇÜLEMEDİ (warning, 0), ağa gidilmez',
    kos: async (M) => {
      const ag = sahteAg([{ status: 200, govde: govde(vercel('success', 'Deployment has completed')) }])
      const r = await mainKos(M, {}, ag)
      esit([r.cikis, ag.cagrilar.length], [0, 0], 'boş ortam')
      dogru(r.cikti.includes('::warning::ÖLÇÜLEMEDİ') && r.cikti.includes('GITHUB_REPOSITORY'), `boş ortam çıktısı: ${r.cikti}`)
    },
  },
]

// ---------------------------------------------------------------------------------------------------------------------------
// SABOTAJ
// ---------------------------------------------------------------------------------------------------------------------------

type Sabotaj = { ad: string; eski: string; yeni: string }

const SABOTAJLAR: Sabotaj[] = [
  { ad: 'Vercel bağlamı süzgeci kalkar (başka bağlamın durumu okunur)', eski: 's.context === VERCEL_BAGLAMI', yeni: 'true' },
  { ad: 'çok kayıtta en yenisi yerine ilki alınır', eski: 'const kayit = vercel.reduce((a, b) => (zaman(b) >= zaman(a) ? b : a));', yeni: 'const kayit = vercel[0];' },
  { ad: 'Ignored Build Step ayrımı kalkar (ATLANDI görülmez)', eski: "if (/Ignored Build Step/i.test(aciklama)) return { sinif: 'ATLANDI', ...ayrinti };", yeni: '' },
  { ad: 'tanınmayan success açıklaması READY sayılır (sessiz yeşil)', eski: "return { sinif: 'BELIRSIZ', neden: 'success ama açıklama tanınmadı', ...ayrinti };", yeni: "return { sinif: 'READY', ...ayrinti };" },
  { ad: '`error` state HATA sayılmaz', eski: "if (state === 'failure' || state === 'error') {", yeni: "if (state === 'failure') {" },
  { ad: 'Canceled ayrımı kalkar (İPTAL hep HATA)', eski: "if (/^\\s*cancell?ed/i.test(aciklama)) return { sinif: 'IPTAL', ...ayrinti };", yeni: '' },
  { ad: 'pending yalnız state ile beklenmez', eski: "if (state === 'pending') return { sinif: 'BEKLIYOR', ...ayrinti };", yeni: '' },
  { ad: 'beklenmeyen state READY sayılır', eski: "return { sinif: 'BELIRSIZ', neden: `beklenmeyen state: ", yeni: "return { sinif: 'READY', neden: `beklenmeyen state: " },
  { ad: 'İPTAL: master ucu karşılaştırması ters', eski: 'if (master !== String(baglam.sha).toLowerCase()) {', yeni: 'if (master === String(baglam.sha).toLowerCase()) {' },
  { ad: 'İPTAL: yerine geçen yok çıkış 0 olur (elle dağıtım gerektiği görünmez)', eski: "sinif: 'IPTAL_YERINE_GECEN_YOK',\n        seviye: 'error',\n        cikis: 1,", yeni: "sinif: 'IPTAL_YERINE_GECEN_YOK',\n        seviye: 'error',\n        cikis: 0," },
  { ad: 'İPTAL: master ucu okunamazsa sessizce "yerine geçildi" sayılır', eski: 'baglam.masterSha.toLowerCase() : null;', yeni: "baglam.masterSha.toLowerCase() : 'f'.repeat(40);" },
  { ad: 'HATA çıkış 0 olur (dağıtım hatası iş akışını kırmızı yapmaz)', eski: "sinif: 'HATA',\n        seviye: 'error',\n        cikis: 1,", yeni: "sinif: 'HATA',\n        seviye: 'error',\n        cikis: 0," },
  { ad: 'ZAMAN_AŞIMI çıkış 1 olur (bloklamaz kuralı çiğnenir)', eski: '    cikis: 0,\n    mesaj: `Vercel dağıtımı ${dk} dk', yeni: '    cikis: 1,\n    mesaj: `Vercel dağıtımı ${dk} dk' },
  { ad: 'terminal durumda yoklama durmaz (sonuç zaman aşımına kadar sürer)', eski: "if (sonOlcum.sinif !== 'YOK' && sonOlcum.sinif !== 'BEKLIYOR') return", yeni: 'if (false) return' },
  { ad: 'kalıcı HTTP kodu geçici sayılır (403 12 dk yoklanır)', eski: 'const KALICI_HTTP = new Set([401, 403, 404, 422]);', yeni: 'const KALICI_HTTP = new Set([]);' },
  { ad: 'yoklama sınırı bir eksik (>=)', eski: 'if (saat() - baslangic + aralikMs > azamiMs) break;', yeni: 'if (saat() - baslangic + aralikMs >= azamiMs) break;' },
  { ad: 'yoklama aralığı uygulanmaz (uyku 0)', eski: 'await uyku(aralikMs);', yeni: 'await uyku(0);' },
  { ad: 'durum ucu sayfalanmaz (per_page yok)', eski: '?per_page=100', yeni: '' },
  { ad: 'master ucu yanlış dal', eski: '/commits/master`;', yeni: '/commits/main`;' },
  { ad: 'Authorization başlığı gönderilmez', eski: 'Authorization: `Bearer ${token}`,', yeni: '' },
  { ad: 'repo doğrulaması kalkar', eski: "if (typeof repo !== 'string' || !REPO_DESENI.test(repo)) return", yeni: 'if (false) return' },
  { ad: 'SHA doğrulaması kalkar (URL enjeksiyonu)', eski: "if (typeof sha !== 'string' || !SHA_DESENI.test(sha)) return", yeni: 'if (false) return' },
  { ad: 'token yokluğu ölçülemedi sayılmaz', eski: "if (typeof token !== 'string' || token === '') return", yeni: 'if (false) return' },
  { ad: 'satır temizliği: kontrol karakteri kalır', eski: "temiz += kontrolKodu(kisa.charCodeAt(i)) ? ' ' : kisa.charAt(i);", yeni: 'temiz += kisa.charAt(i);' },
  { ad: 'satır temizliği: U+2028/2029 satır ayırıcı kontrol sayılmaz', eski: ' || kod === 0x2028 || kod === 0x2029', yeni: '' },
  { ad: 'satır temizliği: % silinmez', eski: "return temiz.split('%').join('').replace(/:{2,}/g, ':');", yeni: "return temiz.replace(/:{2,}/g, ':');" },
  { ad: 'satır temizliği: :: tek olmaz', eski: "return temiz.split('%').join('').replace(/:{2,}/g, ':');", yeni: "return temiz.split('%').join('');" },
  { ad: 'satır temizliği: uzun metin kesilmez', eski: "const kisa = ham.length > azami ? `${ham.slice(0, azami)}…` : ham;", yeni: 'const kisa = ham;' },
  { ad: 'token hiçbir yerde maskelenmez', eski: "return typeof gizli === 'string' && gizli.length >= 4 ? metin.split(gizli).join('***') : metin;", yeni: 'return metin;' },
  { ad: 'token son satırda maskelenmez', eski: "const ham = maskele(metin === null || metin === undefined ? '' : String(metin), gizli);", yeni: "const ham = metin === null || metin === undefined ? '' : String(metin);" },
  { ad: 'ağ hatası metni kaynakta maskelenmez (kesme token yarısını sızdırır)', eski: 'neden: `ağ hatası: ${maskele(hataMetni(e), token)}`', yeni: 'neden: `ağ hatası: ${hataMetni(e)}`' },
  { ad: 'master dışı ref de ölçülür', eski: '&& ortam.GITHUB_REF !== GEREKEN_REF) {', yeni: '&& false) {' },
  { ad: 'iç hata çıkış 1 olur (birleşmeyi bloklayan kapı)', eski: 'elle bak`, token));\n    return 0;', yeni: 'elle bak`, token));\n    return 1;' },
  { ad: 'main hükmün çıkış kodunu yutar (hep 0)', eski: 'return sonuc.cikis;', yeni: 'return 0;' },
]

function sabotajliModul(sabotaj: Sabotaj, dizin: string, sira: number): Modul {
  const parca = KAYNAK.split(sabotaj.eski)
  if (parca.length !== 2) throw new Error(`sabotaj noktası kaynakta TAM BİR KEZ bulunmalı (${parca.length - 1} kez): ${sabotaj.ad}`)
  const hedef = path.join(dizin, `dagitim-hazir-kapisi-sabotaj-${sira}.cjs`)
  writeFileSync(hedef, parca.join(sabotaj.yeni), 'utf8')
  return createRequire(hedef)(hedef) as Modul
}

async function senaryoHatalari(M: Modul): Promise<string[]> {
  const hatalar: string[] = []
  for (const s of SENARYOLAR) {
    try {
      await s.kos(M)
    } catch (e) {
      hatalar.push(`${s.ad} → ${e instanceof Error ? e.message.slice(0, 120) : String(e)}`)
    }
  }
  return hatalar
}

describe('INV-DAGITIM-HAZIR-1 · 1-4. kapı senaryoları (gerçek modül)', () => {
  it.each(SENARYOLAR.map((s) => [s.ad, s] as const))('%s', async (_ad, senaryo) => {
    await senaryo.kos(GERCEK)
  })

  it('betik ortam olmadan çalıştırıldığında (gerçek süreç, ağ yok) ÖLÇÜLEMEDİ der ve çıkış 0 verir', () => {
    const r = spawnSync(process.execPath, [KAPI_YOLU], { env: { PATH: process.env.PATH ?? '' }, encoding: 'utf8', timeout: 20000 })
    expect(r.status).toBe(0)
    expect(r.stdout).toContain('::warning::ÖLÇÜLEMEDİ')
    expect(r.stdout).toContain('YEŞİL DEĞİL')
  })
})

describe('INV-DAGITIM-HAZIR-1 · 5. iş akışı dosyası (.github/workflows/dagitim-hazir.yml)', () => {
  const metin = readFileSync(IS_AKISI, 'utf8').replace(/\r\n/g, '\n')
  // Yorumlar atılır: başlıktaki "pull_request YOK" gibi anlatım gerçek yapılandırma sayılmaz.
  const yaml = metin
    .split('\n')
    .filter((s) => !/^\s*#/.test(s))
    .join('\n')

  it('yalnız master push ve elle tetik; pull_request ve schedule YOK (birleşmeyi bloklamaz)', () => {
    const onBlogu = /^on:\n((?:[ \t]+.*\n?|\n)+)/m.exec(yaml)
    expect(onBlogu, 'on: bloğu okunamadı').not.toBeNull()
    const on = onBlogu?.[1] ?? ''
    expect(on).toMatch(/^\s+push:\s*\n\s+branches:\s*\[master\]/m)
    expect(on).toMatch(/^\s+workflow_dispatch:/m)
    expect(on).not.toMatch(/pull_request/)
    expect(on).not.toMatch(/schedule/)
  })

  it('izinler: contents read + statuses read (başka yazma izni yok); eşzamanlılık commit başına ve iptal etmez; 20 dk sınır', () => {
    expect(yaml).toMatch(/^permissions:\n\s+contents: read\n\s+statuses: read\n/m)
    expect(yaml).not.toMatch(/:\s*write\b/)
    expect(yaml).toMatch(/group: dagitim-hazir-\$\{\{ github\.sha \}\}/)
    expect(yaml).toMatch(/cancel-in-progress: false/)
    expect(yaml).toMatch(/timeout-minutes: 20\b/)
  })

  it('tek iş, needs yok, self-hosted yok, sır yok, pnpm install yok; betiği çağırır ve token olarak github.token kullanır', () => {
    expect(yaml).not.toMatch(/\bneeds:/)
    expect(yaml).not.toMatch(/self-hosted/)
    expect(yaml).not.toMatch(/\bsecrets\./)
    expect(yaml).not.toMatch(/pnpm\s+(install|i)\b/)
    expect(yaml).not.toMatch(/\bpnpm\/action-setup/)
    expect(yaml).toMatch(/run: node scripts\/ci\/dagitim-hazir-kapisi\.cjs/)
    expect(yaml).toMatch(/GITHUB_TOKEN: \$\{\{ github\.token \}\}/)
    expect(yaml).toMatch(/node-version: '24'/)
    const isSayisi = (yaml.match(/^ {2}[A-Za-z0-9_.-]+:\s*$/gm) ?? []).length
    // jobs altındaki iş kimlikleri ile (concurrency/permissions/defaults alt anahtarları 2 boşluk girintili de olabilir) karışmasın diye jobs bloğu ayrı sayılır.
    const jobs = /^jobs:\n((?:[ \t]+.*\n?|\n)+)/m.exec(yaml)?.[1] ?? ''
    expect((jobs.match(/^ {2}[A-Za-z0-9_.-]+:\s*$/gm) ?? []).length).toBe(1)
    expect(isSayisi).toBeGreaterThan(0)
  })

  it('merge-ritueli türetmesi bu iş akışını zorunlu çekirdeğe KATMAZ (push-only; PR kapısı olmaz), türetme gerçekten çalışıyor', () => {
    const M = require_(path.join(KOK, 'scripts/hijyen/merge-ritueli.cjs')) as MergeRitueli
    const c = M.workflowCoz(metin)
    expect(c.tetikli).toBe(false)
    const cekirdek = M.turetCekirdek(KOK)
    expect(cekirdek.kapilar, 'türetme boş: kör yeşil').toContain('ci')
    expect(cekirdek.kapilar).not.toContain('dagitim-hazir')
    expect(cekirdek.kapilar.some((k) => /dagitim/i.test(k))).toBe(false)
  })

  it('aksiyonlar commit SHA ile sabit (etiket ya da dal yok)', () => {
    const uses = yaml.split('\n').filter((s) => /^\s*-?\s*uses:/.test(s))
    expect(uses.length).toBeGreaterThanOrEqual(2)
    for (const s of uses) expect(s, s).toMatch(/@[0-9a-f]{40}\s+#\s*v\d+(\.\d+){0,2}\s*$/)
  })
})

describe('INV-DAGITIM-HAZIR-1 · 6. sabotaj: kapı kaynağına konan her tek hata en az bir senaryoyu KIRMIZIYA çevirir', () => {
  const dizin = mkdtempSync(path.join(tmpdir(), 'dagitim-hazir-sabotaj-'))
  afterAll(() => rmSync(dizin, { recursive: true, force: true }))
  it.each(SABOTAJLAR.map((s, i) => [s.ad, s, i] as const))('%s', async (_ad, sabotaj, sira) => {
    const kopya = sabotajliModul(sabotaj, dizin, sira)
    const hatalar = await senaryoHatalari(kopya)
    expect(hatalar.length, `sabotaj HİÇBİR senaryoyu kırmızıya çevirmedi: "${sabotaj.ad}" — bu karar testle korunmuyor`).toBeGreaterThan(0)
  })
})
