#!/usr/bin/env node
/**
 * ETKİ DEFTERİ GERİYE DÖNÜK DOLDURMA (Kanban SEO-147; cetvel docs/standards/dizin-sistemleri-standard.md D8.1). Tek seferlik ama İDEMPOTENT alt komut:
 * `node scripts/seo/dizin-takip.mjs --etki-doldur [--baslangic 2026-08-28] [--kuru]`.
 *
 * İKİ İŞ (AĞSIZ; yalnız yerel git geçmişi okunur):
 *  1. Defterdeki 'degisim' satırlarının `kart` ve `pr` alanları git geçmişinden doldurulur (varsa; dolu alan ezilmez).
 *  2. --baslangic'tan (varsayılan 2026-08-28) bu yana, defterde OLMAYAN yazı değişiklikleri 'degisim' satırı olarak eklenir (kaynak 'git-gecmisi').
 *
 * ADRES ve DEĞİŞİKLİK KAYNAĞI: Bilgi Merkezi yazıları `src/data/bilgiMerkezi/yazilar.ts` içindedir. Her commit için yazının TR kaydı (yorum satırları
 * ve EN bloğu çıkarılmış, kimlik başına) önceki sürümle karşılaştırılır; fark varsa o yazının adresi değişmiş sayılır. Adres kodla aynı kuraldan
 * (`bilgiMerkeziRotalari.yazi` + `localizedHref`: `/tr/bilgi-merkezi/<slug>`; `scripts/rehber/yazi-envanteri.mjs` aynı kuralı kullanır) kurulur.
 * Liste sayfası (`/tr/bilgi-merkezi`) yazı eklenince/çıkınca ya da kart metni/başlık değişince değişmiş sayılır.
 * KATEGORİ/ÜRÜN/MARKA METİNLERİ git'te DEĞİL, veritabanındadır (kategori metni `categories` tablosu); bu sayfaların satırları yalnız mevcut kayıttan gelir
 * ve kart/pr yalnız site geneli bir kod değişikliğinin commit saatiyle birebir (±2 sn) örtüşüyorsa bağlanır (örn. URN-164 konum yolu, 14 Kasım).
 * Bağlanamayan satırın kart/pr alanı BOŞ kalır, sayılır ve raporlanır; tahmin yazılmaz.
 *
 * BAĞLAMA KURALI (satır × commit):
 *   a. Satır saati bir commit saatiyle ±2 sn örtüşüyorsa (site geneli içe aktarım, git-gecmisi satırı) o commit.
 *   b. Aksi hâlde aynı adreste [satır saati - 48 saat, satır saati + 2 dk] aralığındaki, henüz başka satırın üstlenmediği değişiklikler bu satırın
 *      kaydı sayılır; kart/pr bunların EN YENİSİNDEN gelir. Pencerede değişiklik yoksa satır BAĞLANAMAZ (eski commit'e düşme yok).
 *   c. Hiçbir satırın üstlenmediği değişiklik yeni 'git-gecmisi' satırı olur (tarih = commit saati). Adres bugünkü kayıtta yoksa (yazı yeniden adlandırıldı/kalktı) atlanır.
 * `git-gecmisi` satırı `degisenDefterden`'e GİRMEZ (dizin-takip.mjs): geçmiş commit saati "kod yayını bugün" sinyali olmasın, karar tablosu kaymasın.
 *
 * Güvenlik: yazımdan önce yedek `<defter klasörü>/hareketler.yedek-<tarih>.jsonl`; eşzamanlı eklemede kuyruk korunur; depo içi defter yolu REDDEDİLİR.
 * Çıkış: 0 tamam · 1 defter koşu sırasında değişti · 2 araç koşmadı.
 */
import { execFileSync } from 'node:child_process'
import { createHash } from 'node:crypto'
import { existsSync, readFileSync } from 'node:fs'
import { resolve } from 'node:path'
import { fileURLToPath } from 'node:url'

import { defterSatirlari, defterYaz, etkiYoluKontrol, KOK, onYedekAl } from './dizin-etki.mjs'
import { GIT_GECMISI, satirYaz, SITE, tarihAl, VARSAYILAN_DEFTER, yedekAl } from './dizin-takip.mjs'

export const YAZILAR_YOLU = 'src/data/bilgiMerkezi/yazilar.ts'
export const VARSAYILAN_BASLANGIC = '2026-08-28'
export const TAM_ESLESME_MS = 2000
export const KAPSAMA_MS = 48 * 3600 * 1000
export const ILERI_TOLERANS_MS = 2 * 60 * 1000
const LISTE_ADRESI = `${SITE}/tr/bilgi-merkezi`
/** Kart numarası sanılan ama kart olmayan öneklar (commit başlığında "UTF-8", "SHA-256" geçebilir). */
const KART_DISI_ONEK = new Set(['UTF', 'SHA', 'CVE', 'ISO', 'TLS', 'RFC', 'AES', 'SSL', 'MD', 'EN', 'TR', 'HTTP', 'WCAG', 'PR', 'KARAR', 'ADIM', 'FAZ', 'AB', 'TS', 'DIN', 'IEC', 'EU', 'BS', 'VDI'])
/** Kart numarası: yönetmelik/standart numarası ("AB-327/2011", "TS-1234/5") olmamalı: arkasında `/rakam` gelen eşleşme kart değildir. */
const KART_DESENI = /\b([A-Z]{2,6})-(\d+)\b(?!\/\d)/g

/**
 * Commit başlığı + gövdesinden kart ve PR. PR: başlıktaki SON `(#nnn)`. Kart: BAŞLIKTAKİ ilk kart numarası (PR başlığı PR'ın kendi kartıdır);
 * başlıkta yoksa gövdedeki `Kanban: XXX-nn` satırlarının en sık geçeni (eşitlikte sonuncusu). Neden başlık önce: squash birleştirmede gövde, PR'ın
 * İÇİNDEKİ bütün commit'lerin mesajını art arda taşır; ilk `Kanban:` satırı başka işe ait olabilir (ölçüldü: #2606 başlığı BLG-82, gövdenin ilk satırı BLG-9).
 * Bulunamayan null.
 */
export function kartPrCikar({ konu = '', govde = '' }) {
  const pr = [...String(konu).matchAll(/\(#(\d{1,7})\)/g)].pop()
  let kart = null
  for (const m of String(konu).matchAll(KART_DESENI)) if (!KART_DISI_ONEK.has(m[1])) { kart = `${m[1]}-${m[2]}`; break }
  if (!kart) {
    const sayim = new Map()
    for (const m of String(govde).matchAll(/^\s*Kanban:\s*([A-Z]{2,6}-\d+)\b/gm)) sayim.set(m[1], (sayim.get(m[1]) ?? 0) + 1)
    let en = 0
    for (const [k, n] of sayim) if (n >= en) { en = n; kart = k }
  }
  return { kart, pr: pr ? Number(pr[1]) : null }
}

const sha1 = (s) => createHash('sha1').update(s).digest('hex')

/**
 * yazilar.ts metni → Map<kimlik, { slug, imza, kartImza }>. TS içe aktarılmaz (saf Node). İmza: yazı kaydının YORUMSUZ ve EN bloğu çıkarılmış metni;
 * yalnız yorum değişirse imza değişmez (sayfa değişmedi). kartImza: liste sayfasında görünen H1 + kart metni.
 */
export function yaziImzalari(kaynak) {
  const t = String(kaynak ?? '').replace(/\r\n/g, '\n')
  const baslar = [...t.matchAll(/^ {4}kimlik:\s*'([^']+)'/gm)]
  const harita = new Map()
  baslar.forEach((m, i) => {
    // Kayıt, kendi kapanışında biter (`  },` 2 boşluk girintili ilk satır). Sonraki kayda ya da dosya sonuna kadar uzatılırsa SON yazıya dizinin kapanışı ve
    // yardımcı işlevler girer: yeni yazı eklemek ya da bir işlevi değiştirmek önceki yazıyı yanlış "değişti" gösterirdi.
    const sonrasi = t.slice(m.index)
    const kapanis = /^ {2}\},?[ \t]*$/m.exec(sonrasi)
    const seg = kapanis ? sonrasi.slice(0, kapanis.index) : t.slice(m.index, i + 1 < baslar.length ? baslar[i + 1].index : t.length)
    const tr = []
    let enIcinde = false
    for (const s of seg.split('\n')) {
      if (/^\s*\/\//.test(s)) continue
      if (!enIcinde && /^ {6}en:\s*\{/.test(s)) { enIcinde = true; continue }
      if (enIcinde) { if (/^ {6}\},?\s*$/.test(s)) enIcinde = false; continue }
      tr.push(s.replace(/\s+$/, ''))
    }
    const metin = tr.join('\n')
    const slug = /^\s*slug:\s*'([a-z0-9-]+)'/m.exec(metin)?.[1]
    if (!slug) return
    const kartOzeti = /kartOzeti:\s*('(?:[^'\\]|\\.)*'|`(?:[^`\\]|\\.)*`)/.exec(metin)?.[1] ?? ''
    const h1 = /^# (.+)$/m.exec(metin)?.[1] ?? ''
    harita.set(m[1], { slug, imza: sha1(metin), kartImza: sha1(`${h1}\n${kartOzeti}`) })
  })
  return harita
}

/** İki sürüm arasında hangi yazı adresleri değişti? @returns {{ yazilar: Array<{ slug: string, tur: 'yeni'|'degisti' }>, liste: boolean }} */
export function yaziFarki(onceki, sonraki) {
  const yazilar = []
  let liste = false
  for (const [kimlik, s] of sonraki) {
    const o = onceki.get(kimlik)
    if (!o) yazilar.push({ slug: s.slug, tur: 'yeni' })
    else if (o.imza !== s.imza) yazilar.push({ slug: s.slug, tur: 'degisti' })
    if (!o || o.slug !== s.slug || o.kartImza !== s.kartImza) liste = true
  }
  for (const kimlik of onceki.keys()) if (!sonraki.has(kimlik)) liste = true
  return { yazilar, liste }
}

const konuTemizle = (konu) => String(konu).replace(/\s*\(#\d+\)\s*$/, '').trim()

/**
 * Commit dizisinden (eski → yeni) değişiklik olayları. `oku(ref, yol)` o sürümün metnini ya da null döner (git'in soyutlaması: testte sahte).
 * Olay: { adres, t, sha, tur: 'yeni'|'degisti'|'liste', kart, pr, neden }.
 */
export function gecmisOlaylari({ commitler, oku, yol = YAZILAR_YOLU }) {
  const olaylar = []
  for (const c of commitler) {
    const sonraki = yaziImzalari(oku(c.sha, yol) ?? '')
    const onceki = yaziImzalari(oku(`${c.sha}^`, yol) ?? '')
    const { yazilar, liste } = yaziFarki(onceki, sonraki)
    const { kart, pr } = kartPrCikar(c)
    const ortak = { t: c.t, sha: c.sha, kart, pr, neden: konuTemizle(c.konu) }
    for (const y of yazilar) olaylar.push({ ...ortak, adres: `${SITE}/tr/bilgi-merkezi/${y.slug}`, tur: y.tur })
    if (liste) olaylar.push({ ...ortak, adres: LISTE_ADRESI, tur: 'liste' })
  }
  return olaylar
}

const olayAnahtari = (e) => `${e.adres}|${e.sha}`

/**
 * Satırları commit olaylarına bağlar (kural dosya başında). Saf işlev.
 * @param {{ satirlar: Array<{ satirNo: number, h: any, ms: number }>, olaylar: any[], commitler: any[], gecerliAdresler?: Set<string> }} p
 * @returns {{ atamalar: Map<number, { kart: string|null, pr: number|null, commit: string, tur: string } | null>, yeni: any[], eskiAdres: number }}
 */
export function bagla({ satirlar, olaylar, commitler, gecerliAdresler = null }) {
  const adreseGore = new Map()
  for (const e of [...olaylar].sort((a, b) => a.t - b.t)) adreseGore.set(e.adres, [...(adreseGore.get(e.adres) ?? []), e])
  const ustlenilen = new Set()
  const atamalar = new Map()
  const sirali = [...satirlar].sort((a, b) => a.ms - b.ms || a.satirNo - b.satirNo)
  for (const s of sirali) {
    const c = commitler.filter((x) => Math.abs(x.t - s.ms) <= TAM_ESLESME_MS).sort((a, b) => Math.abs(a.t - s.ms) - Math.abs(b.t - s.ms))[0]
    if (!c) continue
    atamalar.set(s.satirNo, { ...kartPrCikar(c), commit: c.sha.slice(0, 7), tur: 'tam' })
    const e = (adreseGore.get(s.h.adres) ?? []).find((x) => x.sha === c.sha)
    if (e) ustlenilen.add(olayAnahtari(e))
  }
  for (const s of sirali) {
    if (atamalar.has(s.satirNo)) continue
    const aday = (adreseGore.get(s.h.adres) ?? []).filter((e) => e.t <= s.ms + ILERI_TOLERANS_MS && e.t >= s.ms - KAPSAMA_MS && !ustlenilen.has(olayAnahtari(e)))
    if (!aday.length) { atamalar.set(s.satirNo, null); continue }
    const son = aday[aday.length - 1]
    for (const e of aday) ustlenilen.add(olayAnahtari(e))
    atamalar.set(s.satirNo, { kart: son.kart, pr: son.pr, commit: son.sha.slice(0, 7), tur: 'pencere' })
  }
  const var_ = new Set(satirlar.filter((s) => s.h.commit).map((s) => `${s.h.adres}|${s.h.commit}`))
  const yeni = []
  let eskiAdres = 0
  for (const [adres, liste] of adreseGore) {
    for (const e of liste) {
      if (ustlenilen.has(olayAnahtari(e)) || var_.has(`${adres}|${e.sha.slice(0, 7)}`)) continue
      if (gecerliAdresler && !gecerliAdresler.has(adres)) { eskiAdres++; continue }
      yeni.push({
        tarih: new Date(e.t).toISOString(), motor: 'google', eylem: 'degisim', adres, kaynak: GIT_GECMISI, neden: e.neden,
        ...(e.kart ? { kart: e.kart } : {}), ...(e.pr ? { pr: e.pr } : {}), commit: e.sha.slice(0, 7),
        // Yeni yazı: sayfa değişiklikten önce yoktu; karşılaştırma tabanı belli (görünmüyordu). Diğerlerinin `once`'ı --etki ile arşivden hesaplanır.
        ...(e.tur === 'yeni' ? { once: { sayfa: 'yeni', gorunme: 'gorunmedi', sira: null, kaynak: 'git' } } : {}),
      })
    }
  }
  yeni.sort((a, b) => Date.parse(a.tarih) - Date.parse(b.tarih) || a.adres.localeCompare(b.adres))
  return { atamalar, yeni, eskiAdres }
}

// ---------------------------------------------------------------- git (yalnız yerel, salt okur)
export function gitCommitleri({ kok = KOK, baslangic = VARSAYILAN_BASLANGIC, yol = null } = {}) {
  const arg = ['log', '--reverse', `--since=${baslangic}T00:00:00+03:00`, '--format=%H%x1f%cI%x1f%s%x1f%b%x1e', ...(yol ? ['--', yol] : [])]
  const cikti = execFileSync('git', arg, { cwd: kok, encoding: 'utf8', maxBuffer: 256 * 1024 * 1024 })
  return cikti.split('\x1e').map((b) => b.replace(/^\n+/, '')).filter((b) => b.trim()).map((blok) => {
    const [sha, tarih, konu, govde = ''] = blok.split('\x1f')
    return { sha: sha.trim(), t: Date.parse(tarih), konu: konu ?? '', govde }
  }).filter((c) => /^[0-9a-f]{40}$/.test(c.sha) && Number.isFinite(c.t))
}

export function gitOku(kok, ref, yol) {
  try { return execFileSync('git', ['show', `${ref}:${yol}`], { cwd: kok, encoding: 'utf8', maxBuffer: 64 * 1024 * 1024, stdio: ['ignore', 'pipe', 'ignore'] }) } catch { return null }
}

/** Ana işlem. `git` verilirse (test) gerçek git kullanılmaz. */
export function doldurKos({ defter, baslangic = VARSAYILAN_BASLANGIC, kuru = false, simdi = Date.now(), kok = KOK, git = null, gunlukYedek = true }) {
  const k = etkiYoluKontrol(defter, kok)
  if (!k.gecerli) return { kod: 2, mesajlar: [], hata: `--hareket: ${k.neden}` }
  if (!existsSync(defter)) return { kod: 2, mesajlar: [], hata: `defter yok: ${defter}` }
  if (tarihAl(`${baslangic}T00:00:00Z`) === null) return { kod: 2, mesajlar: [], hata: '--baslangic YYYY-MM-DD olmalı' }
  const adaptor = git ?? {
    tumCommitler: () => gitCommitleri({ kok, baslangic }),
    yaziCommitleri: () => gitCommitleri({ kok, baslangic, yol: YAZILAR_YOLU }),
    oku: (ref, yol) => gitOku(kok, ref, yol),
  }
  const okunan = readFileSync(defter, 'utf8')
  const hamSatirlar = defterSatirlari(okunan)
  const degisimler = []
  hamSatirlar.forEach((s, satirNo) => { if (s.h?.eylem === 'degisim') degisimler.push({ satirNo, h: s.h, ms: tarihAl(s.h.tarih) }) })

  const tumCommitler = adaptor.tumCommitler()
  const yaziCommitleri = adaptor.yaziCommitleri()
  const olaylar = gecmisOlaylari({ commitler: yaziCommitleri, oku: adaptor.oku })
  const bugunku = yaziImzalari(adaptor.oku('HEAD', YAZILAR_YOLU) ?? '')
  const gecerliAdresler = new Set([LISTE_ADRESI, ...[...bugunku.values()].map((y) => `${SITE}/tr/bilgi-merkezi/${y.slug}`)])
  const { atamalar, yeni, eskiAdres } = bagla({ satirlar: degisimler, olaylar, commitler: tumCommitler, gecerliAdresler })

  const sonSatirlar = hamSatirlar.map((s) => s.ham)
  let kartDolan = 0, prDolan = 0, commitDolan = 0, kartDuzelen = 0
  const kartYok = []
  const prYok = []
  const olayIndeks = new Map(olaylar.map((e) => [`${e.adres}|${e.sha.slice(0, 7)}`, e]))
  for (const d of degisimler) {
    const a = atamalar.get(d.satirNo) ?? null
    const h = { ...d.h }
    const e = h.kaynak === GIT_GECMISI && h.commit ? olayIndeks.get(`${h.adres}|${h.commit}`) : null
    if (e) {
      // Makinenin kendi yazdığı satır: kart/pr commit'ten YENİDEN türetilir (türetme kuralı düzelince satır da düzelir; ilk koşuda "AB-327/2011" yönetmelik numarası kart sanılmıştı).
      // Elle ya da başka yoldan yazılmış satırın dolu alanına dokunulmaz.
      if ((e.kart ?? null) !== (h.kart ?? null)) kartDuzelen++
      if (e.kart) h.kart = e.kart; else delete h.kart
      if (e.pr) h.pr = e.pr; else delete h.pr
    }
    if (!h.kart && a?.kart) { h.kart = a.kart; kartDolan++ }
    if (!h.pr && a?.pr) { h.pr = a.pr; prDolan++ }
    if (!h.commit && a?.commit) { h.commit = a.commit; commitDolan++ }
    if (!h.kart) kartYok.push(`${d.h.tarih} ${d.h.adres.replace(`${SITE}/`, '/')}`)
    if (!h.pr) prYok.push(d.h.adres)
    if (satirYaz(h) !== satirYaz(d.h)) sonSatirlar[d.satirNo] = satirYaz(h)
  }
  const eklenecek = yeni.map(satirYaz)
  const guncellenen = sonSatirlar.filter((s, i) => s !== hamSatirlar[i].ham).length
  const yeniYazi = yeni.filter((y) => y.once?.sayfa === 'yeni').length
  const mesajlar = [
    `degisim satırı: ${degisimler.length} · kart doldu ${kartDolan} · kart düzeltildi ${kartDuzelen} · pr doldu ${prDolan} · commit doldu ${commitDolan} · kart bulunamadı (null kaldı) ${kartYok.length} · pr bulunamadı ${prYok.length} · yeni satırda kart yok ${yeni.filter((y) => !y.kart).length}`,
    `git geçmişi (${baslangic}→): commit ${tumCommitler.length} (yazilar.ts: ${yaziCommitleri.length}) · yazı/liste olayı ${olaylar.length} · yeni satır ${yeni.length} (ilk yayın ${yeniYazi}, değişiklik ${yeni.length - yeniYazi}) · bugünkü kayıtta olmayan adres atlandı ${eskiAdres}`,
  ]
  if (kartYok.length) mesajlar.push(`kart bulunamayan satırlar (ilk 20): ${kartYok.slice(0, 20).join(' · ')}`)
  if (kuru) { mesajlar.push(`KURU: yazılmadı (güncellenecek satır ${guncellenen}, eklenecek ${eklenecek.length})`); return { kod: 0, mesajlar, rapor: { kartYok, prYok, yeni, guncellenen } } }
  if (!guncellenen && !eklenecek.length) { mesajlar.push('defter değişmedi (idempotent: her şey zaten dolu)'); return { kod: 0, mesajlar, rapor: { kartYok, prYok, yeni, guncellenen: 0 } } }

  const yedek = onYedekAl(defter, simdi)
  if (eklenecek.length) {
    const sonBos = sonSatirlar.length && sonSatirlar[sonSatirlar.length - 1] === ''
    sonSatirlar.splice(sonBos ? sonSatirlar.length - 1 : sonSatirlar.length, 0, ...eklenecek)
  }
  const y = defterYaz({ defter, okunan, yeni: sonSatirlar.join('\n') })
  if (y.hata) return { kod: 1, mesajlar, hata: y.hata }
  if (gunlukYedek) yedekAl(defter, new Date(simdi))
  mesajlar.push(`yazıldı: ${guncellenen} satır güncellendi, ${eklenecek.length} satır eklendi · yedek ${yedek.split(/[\\/]/).pop()}`)
  return { kod: 0, mesajlar, rapor: { kartYok, prYok, yeni, guncellenen } }
}

export function cli(arg = process.argv.slice(2)) {
  const deger = (b) => { const i = arg.indexOf(b); return i >= 0 ? arg[i + 1] : undefined }
  const defter = resolve(deger('--hareket') || process.env.DIZIN_TAKIP_DEFTER || VARSAYILAN_DEFTER)
  const r = doldurKos({ defter, baslangic: deger('--baslangic') || VARSAYILAN_BASLANGIC, kuru: arg.includes('--kuru') })
  for (const m of r.mesajlar) console.log(m)
  if (r.hata) console.error(`HATA: ${r.hata}`)
  return r.kod
}

if (process.argv[1] && resolve(process.argv[1]) === fileURLToPath(import.meta.url)) process.exit(cli())
