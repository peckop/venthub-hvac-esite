'use strict'
/**
 * SQL ETKİ ÖZETİ — sql-yazma-kapisi.cjs'in onay sorusunda SQL yerine ETKİYİ Türkçe gösterir
 * (Ops 09-28, Recep: "SQL okuyamam; onay ancak etkiyi görürsem anlamlı").
 *
 * ── NE YAPAR ──
 *
 * Yazma sorgusunu deyimlere böler; her deyim için "tablo X · işlem SİL/GÜNCELLE/EKLE · etkilenecek satır N"
 * satırı üretir. UPDATE/DELETE için aynı WHERE ile önce `SELECT count(*)` KURU KOŞUMU yapılır:
 *   · `BEGIN READ ONLY` işlemi içinde — WHERE yazan bir fonksiyon çağırsa bile Postgres reddeder;
 *   · `statement_timeout` 3 sn, bağlantı 4 sn; aşılırsa "satır sayısı ölçülemedi".
 * Ölçülemeyen her şey (FROM'lu UPDATE, CTE içi yazma, DO bloğu, INSERT … SELECT) açıkça "ölçülemedi"
 * yazar — sayı UYDURULMAZ.
 *
 * ── HANGİ VERİTABANI ──
 *
 * Aracın kendi `project_id`'si — sorgu hangi projeye gidecekse sayım da oraya (bkz. `say`).
 */
const ISLEM = { update: 'GÜNCELLE', delete: 'SİL', insert: 'EKLE', truncate: 'TABLOYU BOŞALT', merge: 'BİRLEŞTİR' }

/** Metin sabitleri, tırnaklı adlar, dolar gövdeleri ve yorumlar dışında `;` ile böler. */
function deyimlereBol(sql) {
  const out = []
  let bas = 0
  let i = 0
  const s = String(sql)
  while (i < s.length) {
    const c = s[i]
    if (c === "'" || c === '"') {
      const j = s.indexOf(c, i + 1)
      i = j < 0 ? s.length : j + 1
      continue
    }
    if (c === '-' && s[i + 1] === '-') {
      const j = s.indexOf('\n', i)
      i = j < 0 ? s.length : j
      continue
    }
    if (c === '/' && s[i + 1] === '*') {
      const j = s.indexOf('*/', i + 2)
      i = j < 0 ? s.length : j + 2
      continue
    }
    if (c === '$') {
      const m = s.slice(i).match(/^\$([A-Za-z_]*)\$/)
      if (m) {
        const j = s.indexOf(m[0], i + m[0].length)
        i = j < 0 ? s.length : j + m[0].length
        continue
      }
    }
    if (c === ';') {
      out.push(s.slice(bas, i))
      bas = i + 1
    }
    i++
  }
  out.push(s.slice(bas))
  return out.map((d) => d.replace(/^(\s|--[^\n]*\n)+/, '').trim()).filter(Boolean)
}

/** Üst düzeyde (parantez dışı, sabit dışı) anahtar kelimelerin konumları. */
function ustDuzey(deyim, kelimeler) {
  const bulunan = {}
  let derinlik = 0
  const s = deyim
  for (let i = 0; i < s.length; i++) {
    const c = s[i]
    if (c === "'" || c === '"') {
      const j = s.indexOf(c, i + 1)
      i = j < 0 ? s.length : j
      continue
    }
    if (c === '(') derinlik++
    else if (c === ')') derinlik--
    else if (derinlik === 0 && /[A-Za-z]/.test(c) && (i === 0 || !/[\w.]/.test(s[i - 1]))) {
      const m = s.slice(i).match(/^[A-Za-z_]+/)
      const k = m[0].toLowerCase()
      if (kelimeler.includes(k) && !(k in bulunan)) bulunan[k] = i
      i += m[0].length - 1
    }
  }
  return bulunan
}

const TABLO = /^(?:only\s+)?((?:"[^"]+"|[A-Za-z_][\w]*)(?:\s*\.\s*(?:"[^"]+"|[A-Za-z_][\w]*))?)(?:\s+(?:as\s+)?(?!set\b|where\b|using\b|returning\b|values\b|default\b|select\b|on\b|\()([A-Za-z_]\w*))?/i

/** Deyimin planı: { islem, tablo, sayimSql|null, not } */
function plan(deyim) {
  const ilk = (deyim.match(/^[A-Za-z]+/) || [''])[0].toLowerCase()
  if (ilk === 'update') {
    const t = deyim.slice(6).trim().match(TABLO)
    if (!t) return { islem: ISLEM.update, tablo: '?', sayimSql: null, not: 'tablo çözülemedi' }
    const k = ustDuzey(deyim, ['set', 'from', 'where', 'returning'])
    const alanlar = k.set !== undefined ? alanAdlari(deyim.slice(k.set + 3, k.from ?? k.where ?? k.returning ?? deyim.length)) : []
    const ek = alanlar.length ? ' (değişen alan: ' + alanlar.join(', ') + ')' : ''
    if (k.from !== undefined) return { islem: ISLEM.update, tablo: t[1], sayimSql: null, not: 'başka tabloya bağlı güncelleme' + ek }
    const kosul = k.where !== undefined ? deyim.slice(k.where + 5, k.returning ?? deyim.length) : null
    return { islem: ISLEM.update, tablo: t[1], sayimSql: sayim(t[1], t[2], kosul), not: (kosul ? '' : 'KOŞULSUZ — tablonun TAMAMI') + ek }
  }
  if (ilk === 'delete') {
    const m = deyim.match(/^delete\s+from\s+/i)
    const t = m && deyim.slice(m[0].length).match(TABLO)
    if (!t) return { islem: ISLEM.delete, tablo: '?', sayimSql: null, not: 'tablo çözülemedi' }
    const k = ustDuzey(deyim, ['using', 'where', 'returning'])
    if (k.using !== undefined) return { islem: ISLEM.delete, tablo: t[1], sayimSql: null, not: 'başka tabloya bağlı silme' }
    const kosul = k.where !== undefined ? deyim.slice(k.where + 5, k.returning ?? deyim.length) : null
    return { islem: ISLEM.delete, tablo: t[1], sayimSql: sayim(t[1], t[2], kosul), not: kosul ? '' : 'KOŞULSUZ — tablonun TAMAMI' }
  }
  if (ilk === 'insert') {
    const t = deyim.replace(/^insert\s+into\s+/i, '').match(TABLO)
    const k = ustDuzey(deyim, ['values', 'select', 'on'])
    let not = 'eklenecek satır sayısı ölçülemedi'
    let n = null
    if (k.values !== undefined && k.select === undefined) {
      const govde = deyim.slice(k.values + 6, k.on ?? deyim.length)
      n = satirGrubuSay(govde)
      not = ''
    }
    const catisma = /on\s+conflict[\s\S]*do\s+update/i.test(deyim) ? ' (varsa GÜNCELLE)' : ''
    return { islem: ISLEM.insert + catisma, tablo: t ? t[1] : '?', sayimSql: null, sabit: n, not }
  }
  if (ilk === 'truncate') {
    const t = deyim.replace(/^truncate\s+(table\s+)?/i, '').split(/[\s,]+/)[0]
    return { islem: ISLEM.truncate, tablo: t, sayimSql: sayim(t, null, null), not: 'TÜM satırlar' }
  }
  const yapi = deyim.match(
    /^(create|alter|drop|grant|revoke|comment)\s+(?:or\s+replace\s+)?(?:unique\s+)?(table|index|view|materialized\s+view|function|trigger|policy|schema|type|sequence|extension|role|column|on)?\s*(?:if\s+(?:not\s+)?exists\s+)?([^\s(;]+)?/i,
  )
  if (yapi) {
    const fiil = { create: 'OLUŞTUR', alter: 'DEĞİŞTİR', drop: 'KALDIR', grant: 'YETKİ VER', revoke: 'YETKİ AL', comment: 'AÇIKLAMA YAZ' }[yapi[1].toLowerCase()]
    const tur = { table: 'tablo', index: 'dizin', view: 'görünüm', function: 'fonksiyon', trigger: 'tetik', policy: 'erişim politikası', schema: 'şema', type: 'tür', sequence: 'sayaç', extension: 'eklenti', role: 'rol' }[(yapi[2] || '').toLowerCase()] || (yapi[2] || '').toLowerCase()
    return { islem: 'YAPI ' + fiil + (tur ? ' (' + tur + ')' : ''), tablo: yapi[3] || '?', sayimSql: null, not: 'veri satırı değil, veritabanı yapısı değişir' }
  }
  if (ilk === 'do') return { islem: 'KOD BLOĞU', tablo: '-', sayimSql: null, not: 'içindeki işlemler önceden sayılamaz' }
  if (ilk === 'with') return { islem: 'YAZMA (WITH içinde)', tablo: '?', sayimSql: null, not: 'satır sayısı ölçülemedi' }
  if (ilk === 'select') return { islem: 'FONKSİYON ÇAĞRISI', tablo: (deyim.match(/([A-Za-z_][\w.]*)\s*\(/) || ['', '?'])[1], sayimSql: null, not: 'fonksiyonun ne yazdığı önceden sayılamaz' }
  return { islem: ilk.toUpperCase() || '?', tablo: '?', sayimSql: null, not: 'tanınmayan işlem' }
}

function alanAdlari(setGovde) {
  const out = []
  let derinlik = 0
  let parca = ''
  for (const c of setGovde) {
    if (c === '(') derinlik++
    if (c === ')') derinlik--
    if (c === ',' && derinlik === 0) {
      out.push(parca)
      parca = ''
    } else parca += c
  }
  out.push(parca)
  return out.map((p) => (p.split('=')[0] || '').trim().replace(/"/g, '')).filter(Boolean).slice(0, 6)
}

function satirGrubuSay(govde) {
  let derinlik = 0
  let n = 0
  for (let i = 0; i < govde.length; i++) {
    const c = govde[i]
    if (c === "'") {
      const j = govde.indexOf("'", i + 1)
      i = j < 0 ? govde.length : j
      continue
    }
    if (c === '(') {
      if (derinlik === 0) n++
      derinlik++
    } else if (c === ')') derinlik--
  }
  return n
}

function sayim(tablo, takma, kosul) {
  return 'select count(*)::bigint as n from ' + tablo + (takma ? ' ' + takma : '') + (kosul ? ' where ' + kosul : '')
}

/** URL'deki proje kimliği (pooler: kullanıcı `postgres.<ref>`, doğrudan: `db.<ref>.supabase.co`). */
function projeKimligi(url) {
  try {
    const u = new URL(url)
    const a = u.username.match(/^postgres\.([a-z0-9]+)$/)
    const b = u.hostname.match(/^db\.([a-z0-9]+)\.supabase\.co$/)
    return (a && a[1]) || (b && b[1]) || null
  } catch {
    return null
  }
}

/**
 * Sayımlar Supabase Management API'nin `read_only: true` kipiyle koşar (MCP aracının kendi yolu).
 * ÖLÇÜLDÜ 09-28: bu kipte `create temp table` → "cannot execute CREATE TABLE in a read-only
 * transaction" (400) — yazma Postgres tarafından reddedilir, WHERE içindeki yazan fonksiyon da.
 * Yerel `SUPABASE_DB_URL` bu makinede parola hatası veriyor (ölçüldü), o yüzden pg sürücüsü değil.
 * Her sayım 5 sn'de kesilir.
 */
const EN_COK_SAYIM = 5 // onay sorusu en fazla ~25 sn bekler; fazlası "ölçülemedi"

async function say(sayimlar, ref, env = process.env) {
  const sonuc = []
  for (const q of sayimlar) {
    if (sonuc.length >= EN_COK_SAYIM) {
      sonuc.push({ hata: 'ilk ' + EN_COK_SAYIM + ' işlemden sonrası sayılmadı' })
      continue
    }
    const ac = new AbortController()
    const zaman = setTimeout(() => ac.abort(), 5000)
    try {
      const r = await fetch(`https://api.supabase.com/v1/projects/${ref}/database/query`, {
        method: 'POST',
        headers: { Authorization: 'Bearer ' + env.SUPABASE_ACCESS_TOKEN, 'Content-Type': 'application/json' },
        body: JSON.stringify({ query: q, read_only: true }),
        signal: ac.signal,
      })
      const govde = await r.text()
      if (!r.ok) {
        let m = govde
        try {
          m = JSON.parse(govde).message || govde
        } catch {
          // gövde JSON değil; ham metin kullanılır
        }
        sonuc.push({ hata: String(m).replace(/^.*?ERROR:\s*\w*:?\s*/s, '').split('\n')[0].trim() })
      }
      else sonuc.push(Number(JSON.parse(govde)[0].n))
    } catch (e) {
      sonuc.push({ hata: e && e.name === 'AbortError' ? '5 sn zaman aşımı' : (e && e.message) || 'bilinmeyen' })
    } finally {
      clearTimeout(zaman)
    }
  }
  return sonuc
}

/** Onay sorusunda gösterilecek Türkçe özet (çok satırlı). Hiçbir durumda fırlatmaz. */
async function ozet(sql, projectId, env = process.env) {
  const planlar = deyimlereBol(sql)
    .filter((d) => !/^(begin|start\s+transaction|commit|rollback|set\s|reset\s)/i.test(d))
    .map(plan)
  if (!planlar.length) return null
  let sayilar = []
  let genelNot = ''
  const sorgular = planlar.filter((p) => p.sayimSql).map((p) => p.sayimSql)
  if (sorgular.length) {
    if (!env.SUPABASE_ACCESS_TOKEN) genelNot = 'erişim anahtarı yok'
    else if (!projectId || !/^[a-z0-9]{20}$/.test(projectId)) genelNot = 'proje kimliği yok'
    else sayilar = await say(sorgular, projectId, env)
  }
  let s = 0
  const satirlar = planlar.map((p) => {
    let adet
    if (p.sayimSql) {
      const v = sayilar[s++]
      const sebep = genelNot || (v && v.hata ? v.hata.slice(0, 70) : '')
      adet = typeof v === 'number' ? v + ' satır' : 'satır sayısı ölçülemedi' + (sebep ? ' (' + sebep + ')' : '')
    } else if (typeof p.sabit === 'number') adet = p.sabit + ' satır'
    else adet = null
    const not = String(p.not || '').trim()
    return '• ' + p.tablo + ' → ' + p.islem + (adet ? ' · ' + adet : '') + (not ? ' · ' + not : '')
  })
  return 'CANLI VERİTABANINDA DEĞİŞİKLİK:\n' + satirlar.join('\n')
}

module.exports = { deyimlereBol, plan, ozet, projeKimligi, ustDuzey }
