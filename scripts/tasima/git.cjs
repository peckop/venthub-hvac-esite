'use strict'
/**
 * MAKİNE TAŞIMA — GİT YARDIMCILARI (ALT-165). Cetvel: docs/standards/makine-tasima-standard.md.
 *
 * Eski makinede: uzakta olmayan işi (yerel dal, push edilmemiş commit, stash) `git bundle` ile taşır.
 * Stash'ler reflog'dadır; `bundle --all` yalnız üstteki `refs/stash`i alır. Bu yüzden her stash GEÇİCİ bir
 * ref'e (refs/tasima-stash/NNNN) bağlanır, bundle alınır, ref'ler HER DURUMDA silinir (finally).
 * Yeni makinede: klon (uzak varsa uzaktan, yoksa bundle'dan) + bundle'dan dallar/etiketler/stash'ler.
 *
 * Eski makinedeki depoya yazılan tek şey geçici ref'lerdir ve bundle bitince silinir; çalışma ağacına,
 * dallara, indekse DOKUNULMAZ.
 */
const fs = require('node:fs')
const path = require('node:path')
const { spawnSync } = require('node:child_process')

const STASH_REF_ONEKI = 'refs/tasima-stash/'
const GECICI_BUNDLE_ONEKI = 'refs/tasima-bundle'

/** git çağrısı; hata atmaz, { ok, cikti, hata } döner. */
function git(args, cwd, { input = null } = {}) {
  const r = spawnSync('git', args, {
    cwd,
    encoding: 'utf8',
    input: input === null ? undefined : input,
    maxBuffer: 1 << 28,
    windowsHide: true,
  })
  return { ok: !r.error && r.status === 0, cikti: (r.stdout || '').replace(/\r?\n$/, ''), hata: (r.stderr || '').trim() || (r.error ? r.error.message : '') }
}

/** 'refname sha' satırları -> [{ ref, sha }] */
function refListesiAyir(metin) {
  return String(metin)
    .split(/\r?\n/)
    .map((s) => s.trim())
    .filter(Boolean)
    .map((s) => {
      const i = s.lastIndexOf(' ')
      return { ref: s.slice(0, i), sha: s.slice(i + 1) }
    })
    .filter((r) => r.ref && /^[0-9a-f]{40,64}$/.test(r.sha))
}

/** 'sha<TAB>özet' satırları (yeniden eskiye) -> [{ sha, ozet }] */
function stashListesiAyir(metin) {
  return String(metin)
    .split(/\r?\n/)
    .filter((s) => /^[0-9a-f]{40,64}\t/.test(s))
    .map((s) => {
      const i = s.indexOf('\t')
      return { sha: s.slice(0, i), ozet: s.slice(i + 1) }
    })
}

/** `git status --porcelain` çıktısındaki satırlar (boş = temiz). */
function kirliSatirlar(metin) {
  return String(metin).split(/\r?\n/).filter((s) => s.trim())
}

/**
 * Deponun taşıma durumu. Yalnız OKUR.
 * @returns {{var:boolean, hata?:string, dal, head, uzaklar:Object, ahead:number, stash:{sha,ozet}[], kirli:string[], refs:{ref,sha}[], boyutBayt:number}}
 */
function depoDurumu(dizin) {
  if (!fs.existsSync(path.join(dizin, '.git'))) return { var: false }
  const k = (...a) => git(a, dizin)
  const uzakSatirlar = k('remote', '-v').cikti.split(/\r?\n/).filter((s) => /\(fetch\)/.test(s))
  const uzaklar = {}
  for (const s of uzakSatirlar) {
    const m = /^(\S+)\s+(\S+)\s+\(fetch\)/.exec(s.trim())
    if (m) uzaklar[m[1]] = m[2]
  }
  const ahead = Number(k('rev-list', '--count', '--branches', '--not', '--remotes').cikti) || 0
  const stash = stashListesiAyir(k('stash', 'list', '--format=%H%x09%gs').cikti)
  const sayim = k('count-objects', '-v').cikti
  const topla = (alan) => Number((new RegExp(`^${alan}: (\\d+)`, 'm').exec(sayim) || [0, 0])[1]) * 1024
  return {
    var: true,
    dal: k('rev-parse', '--abbrev-ref', 'HEAD').cikti,
    head: k('rev-parse', 'HEAD').cikti,
    uzaklar,
    ahead,
    stash,
    kirli: kirliSatirlar(k('status', '--porcelain').cikti),
    refs: refListesiAyir(k('for-each-ref', '--format=%(refname) %(objectname)').cikti),
    boyutBayt: topla('size') + topla('size-pack'),
  }
}

/** Bundle gerekir mi: yalnız uzakta olmayan iş (push edilmemiş commit ya da stash) ya da uzağı olmayan depo. */
function bundleGerekli(durum) {
  return durum.ahead > 0 || durum.stash.length > 0 || Object.keys(durum.uzaklar).length === 0
}

/**
 * `git bundle create --all` (+ stash ref'leri). Ref'ler finally'de silinir. Önce `.tmp`, doğrulanınca asıl ad.
 * @returns {{ok:boolean, hata?:string}}
 */
function bundleOlustur(dizin, hedefDosya, stashler) {
  const gecici = `${hedefDosya}.tmp`
  const olusan = []
  try {
    fs.rmSync(gecici, { force: true })
    stashler.forEach((s, i) => {
      const ref = `${STASH_REF_ONEKI}${String(i).padStart(4, '0')}`
      const r = git(['update-ref', ref, s.sha], dizin)
      if (!r.ok) throw new Error(`stash ref'i yazılamadı: ${r.hata}`)
      olusan.push(ref)
    })
    const b = git(['bundle', 'create', gecici, '--all'], dizin)
    if (!b.ok) throw new Error(`bundle oluşmadı: ${b.hata.slice(0, 300)}`)
    const v = git(['bundle', 'verify', gecici], dizin)
    if (!v.ok) throw new Error(`bundle doğrulanamadı: ${v.hata.slice(0, 300)}`)
    fs.renameSync(gecici, hedefDosya)
    return { ok: true }
  } catch (e) {
    fs.rmSync(gecici, { force: true })
    return { ok: false, hata: e.message }
  } finally {
    if (olusan.length) git(['update-ref', '--stdin'], dizin, { input: olusan.map((r) => `delete ${r}\n`).join('') })
  }
}

/**
 * Yeni makinede bir depoyu kurar. Hedef dizin VAR ve boş değilse DURUR (üstüne yazılmaz).
 * @param {{ad:string, hedef:string, uzak:string|null, bundle:string|null, refs:{ref,sha}[], stash:{sha,ozet}[]}} g
 * @returns {{ok:boolean, notlar:string[], hata?:string}}
 */
function depoyuKur(g) {
  const notlar = []
  try {
    if (fs.existsSync(g.hedef) && fs.readdirSync(g.hedef).length > 0) {
      return { ok: false, notlar, hata: `hedef dolu, klonlanmadı: ${g.hedef}` }
    }
    const kaynak = g.uzak || g.bundle
    if (!kaynak) return { ok: false, notlar, hata: 'ne uzak adres ne bundle var' }
    fs.mkdirSync(path.dirname(g.hedef), { recursive: true })
    const c = git(['clone', kaynak, g.hedef], path.dirname(g.hedef))
    if (!c.ok) return { ok: false, notlar, hata: `klon başarısız (${g.uzak ? 'uzak' : 'bundle'}): ${c.hata.slice(0, 300)}` }
    notlar.push(`klon: ${g.uzak ? 'uzak adresten' : 'bundle\'dan'}`)

    if (g.bundle) {
      const f = git(['fetch', '--quiet', g.bundle, `+refs/*:${GECICI_BUNDLE_ONEKI}/*`], g.hedef)
      if (!f.ok) return { ok: false, notlar, hata: `bundle alınamadı: ${f.hata.slice(0, 300)}` }
      const gelen = refListesiAyir(git(['for-each-ref', '--format=%(refname) %(objectname)', GECICI_BUNDLE_ONEKI], g.hedef).cikti)
      const mevcut = new Map(refListesiAyir(git(['for-each-ref', '--format=%(refname) %(objectname)', 'refs/heads', 'refs/tags'], g.hedef).cikti).map((r) => [r.ref, r.sha]))
      const mevcutDal = git(['rev-parse', '--abbrev-ref', 'HEAD'], g.hedef).cikti
      const komut = []
      let ileri = 0
      let ayri = 0
      for (const r of gelen) {
        const m = /^refs\/tasima-bundle\/(heads|tags)\/(.+)$/.exec(r.ref)
        if (!m) continue
        const hedefRef = `refs/${m[1]}/${m[2]}`
        const var_ = mevcut.get(hedefRef)
        if (var_ === undefined) komut.push(`create ${hedefRef} ${r.sha}\n`)
        else if (var_ !== r.sha && m[1] === 'heads') {
          const ata = git(['merge-base', '--is-ancestor', var_, r.sha], g.hedef)
          if (ata.ok) {
            if (m[2] === mevcutDal) git(['merge', '--ff-only', '--quiet', r.sha], g.hedef)
            else komut.push(`update ${hedefRef} ${r.sha} ${var_}\n`)
            ileri += 1
          } else {
            komut.push(`create refs/heads/tasima/${m[2]} ${r.sha}\n`)
            ayri += 1
          }
        }
      }
      if (komut.length) {
        const u = git(['update-ref', '--stdin'], g.hedef, { input: komut.join('') })
        if (!u.ok) return { ok: false, notlar, hata: `dallar yazılamadı: ${u.hata.slice(0, 300)}` }
      }
      notlar.push(`bundle'dan: ${komut.length} ref işlendi, ${ileri} dal ileri alındı, ${ayri} dal AYRIŞTI (refs/heads/tasima/ altında)`)
      // Stash'ler eskiden yeniye store edilir ki sıra korunsun.
      let stashN = 0
      for (const s of [...g.stash].reverse()) {
        const st = git(['stash', 'store', '-m', s.ozet, s.sha], g.hedef)
        if (st.ok) stashN += 1
        else notlar.push(`stash alınamadı: ${s.sha.slice(0, 8)} ${st.hata.slice(0, 100)}`)
      }
      if (g.stash.length) notlar.push(`stash: ${stashN}/${g.stash.length} geri kondu`)
      const sil = gelen.map((r) => `delete ${r.ref}\n`).join('')
      if (sil) git(['update-ref', '--stdin'], g.hedef, { input: sil })
    }

    // Adı bundle'a girmemiş ama commit'i klonda olan yerel dallar (refs.txt)
    const var2 = new Set(refListesiAyir(git(['for-each-ref', '--format=%(refname) %(objectname)', 'refs/heads'], g.hedef).cikti).map((r) => r.ref))
    const adaylar = g.refs.filter((r) => r.ref.startsWith('refs/heads/') && !var2.has(r.ref))
    if (adaylar.length) {
      const kontrol = git(['cat-file', '--batch-check'], g.hedef, { input: adaylar.map((r) => `${r.sha}\n`).join('') })
      const satirlar = kontrol.cikti.split(/\r?\n/)
      const komut = adaylar.filter((r, i) => !/missing/.test(satirlar[i] || 'missing')).map((r) => `create ${r.ref} ${r.sha}\n`)
      if (komut.length) git(['update-ref', '--stdin'], g.hedef, { input: komut.join('') })
      notlar.push(`refs listesinden ${komut.length}/${adaylar.length} yerel dal kuruldu`)
    }
    return { ok: true, notlar }
  } catch (e) {
    return { ok: false, notlar, hata: e.message }
  }
}

module.exports = {
  git,
  refListesiAyir,
  stashListesiAyir,
  kirliSatirlar,
  depoDurumu,
  bundleGerekli,
  bundleOlustur,
  depoyuKur,
  STASH_REF_ONEKI,
}
