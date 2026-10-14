'use strict'
/**
 * PENCERE KİMLİĞİ — yeni düzen (OPS-122, ARC-124).
 *
 * NİÇİN VAR (ölçüldü, 2026-10-13, dört pencerede): yeni düzende departman penceresi kendi worktree klasöründe,
 * `settings.local.json` `agent` anahtarıyla açılır ve HER açılışta yeni oturum kimliği alır. Eski düzen kimliği
 * ŞERİT ADINDAN (claim) ya da pencere başlığından çıkarıyordu; yeni düzende ikisi de bu pencereyi tanıtmıyor:
 *  · rol kartı "bilinmiyor" diyordu (agent anahtarı rol için hiç okunmuyordu, yalnız OPS için ops-oturumu.cjs),
 *  · PreCompact kapısı durum dosyasını `originSessionId` ile arıyor; dosya ESKİ kimliği taşıyor → compact durdu,
 *  · eski kimliğe adreslenmiş posta yeni kimliğe görünmüyor.
 *
 * KURAL: kimlik üç şeyden gelir, bu sırayla: kancaya gelen `agent_type`, yoksa `cwd`'den yukarı ilk
 * `.claude/settings.local.json`'daki `agent`. Yalnız `<ad>-pencere` biçimi pencere kimliğidir (alt ajan tipleri
 * `<ad>-arastirmaci` vb. rol sayılmaz). Rol = `<AD>` büyük harf (arac-pencere → ARAC, geo-seo-pencere → GEO-SEO).
 *
 * SAF + FAIL-OPEN: hiçbir işlev fırlatmaz; okunamayan şey boş değer verir. Kimlik kaydı (önceki oturum
 * kimlikleri) tek JSON dosyasında tutulur; dosya yolu test için `VENTHUB_ROL_KIMLIK_DOSYASI` ile değişir.
 */

const fs = require('node:fs')
const os = require('node:os')
const path = require('node:path')

const PENCERE_SONEKI = /-pencere$/i
const UUID = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i
/** Rolün önceki kimlik listesi bu kadar uzar; eskiler düşer (kayıt şişmesin). */
const ONCEKI_TAVAN = 5

/** `<ad>-pencere` mi? Dönüş: küçük harf ad ya da ''. */
function pencereAjani(deger) {
  const s = typeof deger === 'string' ? deger.trim().toLowerCase() : ''
  return PENCERE_SONEKI.test(s) && s.length > '-pencere'.length ? s : ''
}

/** cwd'den yukarı (en çok 6 basamak) ilk settings.local.json'daki `agent`. Bulunamazsa ''. */
function agentAnahtari(cwd) {
  // cwd verilmediyse SÜREÇ dizinine DÜŞÜLMEZ: çalıştığı dizin pencereyi tanıtmaz (testler, elle koşan betikler); kanca
  // girdisi her zaman `cwd` taşır. Düşseydik, kapıyı gerçek bir worktree'de koşturan her test o pencerenin rolünü alırdı.
  if (!cwd) return ''
  try {
    let d = path.resolve(cwd)
    for (let i = 0; i < 6; i += 1) {
      const f = path.join(d, '.claude', 'settings.local.json')
      if (fs.existsSync(f)) {
        const j = JSON.parse(fs.readFileSync(f, 'utf8'))
        return j && typeof j.agent === 'string' ? pencereAjani(j.agent) : ''
      }
      const ust = path.dirname(d)
      if (ust === d) break
      d = ust
    }
  } catch {
    /* okunamadı: kimlik yok */
  }
  return ''
}

/** Pencerenin agent adı (`arac-pencere`) ya da ''. Kancaya gelen `agent_type` önce, ayar dosyası sonra. */
function agentAdi({ cwd, agentType } = {}) {
  // `VENTHUB_PENCERE_AGENT` TANIMLIYSA (boş dize dahil) yalnız o geçerlidir: kancayı gerçek bir worktree'de koşturan
  // testler, o worktree'nin settings.local.json'ından bağımsız kalsın diye kimliği buradan sabitler/kapatır.
  if (process.env.VENTHUB_PENCERE_AGENT !== undefined) return pencereAjani(process.env.VENTHUB_PENCERE_AGENT)
  return pencereAjani(agentType) || agentAnahtari(cwd)
}

/** `arac-pencere` → `ARAC`; pencere ajanı değilse ''. */
function rolAdi(agent) {
  const a = pencereAjani(agent)
  return a ? a.replace(PENCERE_SONEKI, '').toUpperCase() : ''
}

/** Durum dosyası ön eki için rol sluğu: `GEO-SEO` → `geoseo` (dosyalar `geoseo-lane-state.md`). */
function rolSlug(rol) {
  return String(rol || '').toLowerCase().replace(/[^a-z0-9]+/g, '')
}

function kayitDosyasi() {
  return process.env.VENTHUB_ROL_KIMLIK_DOSYASI || path.join(os.homedir(), '.claude', 'mod-durum', 'rol-kimlikleri.json')
}

/** { ROL: { sid, oncekiler: [sid...], guncelleme } } — okunamazsa {}. */
function kayitOku(dosya = kayitDosyasi()) {
  try {
    const j = JSON.parse(fs.readFileSync(dosya, 'utf8'))
    return j && typeof j === 'object' && !Array.isArray(j) ? j : {}
  } catch {
    return {}
  }
}

/** Bir rolün ÖNCEKİ kimlikleri (güncel sid hariç, tekil, en yeni önce). */
function oncekiKimlikler(rol, sidGuncel, dosya = kayitDosyasi()) {
  const k = kayitOku(dosya)[rol]
  const liste = k && Array.isArray(k.oncekiler) ? k.oncekiler : []
  const guncel = String(sidGuncel || '').toLowerCase()
  const gorulen = new Set()
  return liste.filter((s) => {
    const x = String(s || '').toLowerCase()
    if (!UUID.test(x) || x === guncel || gorulen.has(x)) return false
    gorulen.add(x)
    return true
  })
}

/**
 * Rolün güncel kimliğini yazar; `eski` verilmişse önceki kimlikler listesine EN BAŞA eklenir.
 * Atomik (tmp + rename). Dönüş: { yazildi, oncekiler } — hata fırlatmaz.
 */
function kimlikKaydet({ rol, sid, eski, simdi = Date.now(), dosya = kayitDosyasi() } = {}) {
  try {
    if (!rol || !UUID.test(String(sid || ''))) return { yazildi: false, oncekiler: [] }
    const tum = kayitOku(dosya)
    const onceki = tum[rol] && Array.isArray(tum[rol].oncekiler) ? tum[rol].oncekiler : []
    // Sıra: açıkça verilen eski kimlik, bir önceki GÜNCEL kimlik (pencere yeniden açıldı), sonra eski liste. Önceki güncel
    // kimlik en yeni "önceki"dir; sona koyulsa tavanla ilk düşen o olurdu (test yakaladı).
    const aday = [eski, tum[rol] && tum[rol].sid, ...onceki]
      .map((s) => String(s || '').toLowerCase())
      .filter((s) => UUID.test(s) && s !== String(sid).toLowerCase())
    const oncekiler = [...new Set(aday)].slice(0, ONCEKI_TAVAN)
    tum[rol] = { sid: String(sid).toLowerCase(), oncekiler, guncelleme: new Date(simdi).toISOString() }
    fs.mkdirSync(path.dirname(dosya), { recursive: true })
    const gecici = dosya + '.' + process.pid + '.tmp'
    fs.writeFileSync(gecici, JSON.stringify(tum, null, 2) + '\n', 'utf8')
    fs.renameSync(gecici, dosya)
    return { yazildi: true, oncekiler }
  } catch {
    return { yazildi: false, oncekiler: [] }
  }
}

/**
 * Bu oturum kimliği hâlâ canlı bir pencere kaydında mı (`~/.claude/sessions/*.json`)? Canlıysa başka pencere hâlâ
 * onu kullanıyor demektir: durum dosyasının kimliği ondan ALINMAZ. Okunamazsa false (devir engellenmez).
 */
function canliKayitVarMi(sid, dizin = process.env.VENTHUB_SESSIONS_DIZINI || path.join(os.homedir(), '.claude', 'sessions')) {
  try {
    const hedef = String(sid || '').toLowerCase()
    if (!hedef) return false
    for (const f of fs.readdirSync(dizin)) {
      if (!f.endsWith('.json')) continue
      try {
        const j = JSON.parse(fs.readFileSync(path.join(dizin, f), 'utf8'))
        if (j && String(j.sessionId || '').toLowerCase() === hedef) return true
      } catch {
        /* bozuk kayıt atlanır */
      }
    }
  } catch {
    /* dizin yok */
  }
  return false
}

/**
 * ⭐MODEL SAPMASI (ARC-124, 13 Ekim): `geo-seo-pencere` tanımı `model: claude-sonnet-5-5` diyordu ama oturum Opus
 * koştu. OPS ölçümü: `start_session` model verilmezse AÇANIN modelini devralıyor; tanımdaki `model` alanı o halde
 * uygulanmıyor. Bunu açılışta GÖRÜNÜR kılarız (Opus Sonnet'in çok üstünde maliyettir, sessiz sapma kota yer).
 * Tanım: cwd'den yukarı `.claude/agents/<agent>.md` frontmatter `model:`. Oturum modeli kanca girdisindeki `model`
 * alanıdır; YOKSA ya da tanımda alan yoksa sessiz geçilir (ölçülemeyen şey için uyarı uydurulmaz).
 * @returns {string} uyarı satırı ya da ''
 */
function modelUyarisi({ cwd, agent, oturumModeli } = {}) {
  try {
    const ag = pencereAjani(agent)
    const oturum = typeof oturumModeli === 'string' ? oturumModeli.trim() : ''
    if (!ag || !oturum || !cwd) return ''
    let d = path.resolve(cwd)
    let tanim = ''
    for (let i = 0; i < 6 && !tanim; i += 1) {
      const f = path.join(d, '.claude', 'agents', ag + '.md')
      if (fs.existsSync(f)) {
        const baslik = fs.readFileSync(f, 'utf8').slice(0, 1500)
        const m = baslik.match(/^model:[ \t]*([^\s#]+)/m)
        tanim = m ? m[1].replace(/^["']|["']$/g, '') : ''
        break
      }
      const ust = path.dirname(d)
      if (ust === d) break
      d = ust
    }
    if (!tanim) return ''
    const sade = (s) => String(s).toLowerCase().replace(/\[[^\]]*\]/g, '').trim()
    const a = sade(tanim)
    const b = sade(oturum)
    if (a === b || a.startsWith(b) || b.startsWith(a)) return ''
    return `⚠MODEL SAPMASI: ${ag} tanımı ${tanim}, bu oturum ${oturum} koşuyor (start_session model vermeyince açanın modelini devralır); doğru modelle yeniden aç ya da OPS'a yaz.\n`
  } catch {
    return ''
  }
}

// Elle tohumlama (geçiş öncesi kimlik başka yolla güncellenmişse): `node scripts/board/pencere-kimligi.cjs --devret
// <ROL> <ESKİ_SID> <YENİ_SID>` eski kimliği rolün "önceki kimlikler" listesine yazar (posta sayacı onu da sayar).
if (require.main === module) {
  const [, , komut, rol, eski, yeni] = process.argv
  if (komut === '--devret' && rol && UUID.test(String(eski)) && UUID.test(String(yeni))) {
    process.stdout.write(JSON.stringify(kimlikKaydet({ rol: rol.toUpperCase(), sid: yeni, eski })) + '\n')
  } else {
    process.stdout.write('kullanim: node scripts/board/pencere-kimligi.cjs --devret <ROL> <ESKI_SID> <YENI_SID>\n')
    process.exitCode = 2
  }
}

module.exports = {
  pencereAjani,
  agentAnahtari,
  agentAdi,
  rolAdi,
  rolSlug,
  kayitDosyasi,
  kayitOku,
  oncekiKimlikler,
  kimlikKaydet,
  canliKayitVarMi,
  modelUyarisi,
  ONCEKI_TAVAN,
}
