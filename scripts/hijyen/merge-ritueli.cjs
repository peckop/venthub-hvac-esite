#!/usr/bin/env node
/**
 * MERGE RİTÜELİ — beş maddelik self-merge ölçümü (ALTYAPI, REC-131).
 *
 * NİÇİN VAR
 * =========
 * 2026-09-04'te bir PR'ın kapı tablosu *"9 kapı, düşen 0"* dedi ve bu YANLIŞTI: PR çakışmalı
 * (`DIRTY`) olduğu için birleşme ref'i üretilemiyordu, `ci` **hiç doğmamıştı** ve izleyici
 * yalnız Vercel kapılarını görüp "bitti" ilan etti. **Var olmayan kapı "bekleyen" görünmez** —
 * yani *"bekleyen 0"* tek başına bir bitiş ölçütü DEĞİLDİR. O gün merge edilseydi hiç
 * ölçülmemiş bir PR inecekti.
 *
 * Ritüel elle koşulurken bir kez daha kurtardı: izleyici yeşil dedikten SONRA PR yeniden
 * `DIRTY` olmuştu. Ama betik `scratchpad/`te yaşıyordu — **oturum ölür, araç ölür.** Filo
 * standardı olan bir ölçüm aracının repo dışında yaşaması, "kural yazmak kuralı uygulamak
 * değildir" sınıfının araç tarafıdır.
 *
 * NİÇİN BETİK, NİÇİN "DİKKAT ET" DEĞİL
 * ====================================
 * Beş maddeyi hatırlamaya bırakmak, kuralı İNSANA gömmektir. Ev dersi (URUN, 2026-09-04):
 * *"beyan hatırlanması gereken bir şey, `git -C` hatırlanmayan bir şey."* Sırayı ben
 * hatırlamıyorum — araç soruyor.
 *
 * ⭐BEKLENEN KAPI KÜMESİ ELLE YAZILMAZ, TÜRETİLİR — ama NAİF türetme çalışmaz
 * ==========================================================================
 * Ölçüldü (2026-09-04): `pull_request` tetikli **9** workflow'da **18** job var, ama PR
 * #965'te gerçekten doğan kapı **9** (ikisi Vercel, yani hiçbir workflow dosyasında YOK).
 * "Tüm job'ları bekle" demek 18 kapı beklemek, 7'sini görmek ve **her koşuda yanlış alarm**
 * vermektir. Yanlış alarm veren kapı, bir süre sonra OKUNMAYAN kapıdır (§25).
 *
 * Bu yüzden türetilen küme "tüm job'lar" değil **ZORUNLU ÇEKİRDEK**. Bir job çekirdektedir ⇔
 *   · workflow `on.pull_request` ile tetiklenir, VE
 *   · `types:` ya hiç yok ya `synchronize` içerir — yoksa job yalnız PR AÇILIŞINDA doğar
 *     (ölçüldü: `auto-label` `[opened, edited]`, `auto-reviewer` `[opened]`), VE
 *   · `paths:`/`paths-ignore:` süzgeci YOK — varsa ilgisiz bir PR'da doğmaması DOĞRUdur
 *     (ölçüldü: `rls-guard`, `edge-shared-input-drift`), VE
 *   · job'da `if:` YOK — koşullu job `skipping` kovasına düşer ve **`skipping` düşen değildir**
 *     (ölçüldü: `gemini-dispatch`in 7 job'u — 2026-09-17 REC-353 ile silindi —, `db-advisor`ın 2 job'u).
 *
 * Bu kriterle türetilen küme PR #965'te doğan workflow kapılarının TAM OLARAK aynısı çıktı.
 *
 * ⚠KAPSAM SINIRI, ADIYLA (§21: kabul edilen boşluk SESSİZ olamaz)
 * ===============================================================
 *   · **Harici kapılar türetilemez** — entegrasyondur, hiçbir workflow dosyasında yoktur.
 *     Çekirdeğe KONMAZ; görüldüğü hâlde düşerse madde 3 onları sayar. TEK İSTİSNA:
 *     `EMEKLI_HARICI_KAPILAR` (tam ad; 15 Kasım 2026'dan beri Vercel, ALT-199) sayımdan çıkar ama
 *     detayda görünür kalır; işlevi `İmaj derle` + `ci` eşdeğeriyle korunur (madde 2).
 *   · **YAML düz regex ile okunur**, gerçek çözücüyle değil. Desteklenen biçimler ölçüldü:
 *     `types: [a, b]`, çok satırlı `types:` + `- a`, `paths:` blok, ve `on: pull_request`
 *     kısayolu. Bunların dışında bir biçim çıkarsa türetme O DOSYAYI atlamaz — `sinirlar`
 *     dizisine yazar ve çağıran bunu RAPOR EDER. Sessiz atlama yok.
 *   · Migration sayımı `origin/master...origin/<dal>` diff'inden okunur; PR dosya listesinden
 *     değil. İkisi ayrışırsa (ör. dal itilmemişse) madde 4 sha karşılaştırmasıyla yakalar.
 *
 * Yöneten cetvel: `docs/standards/fleet-mechanism-standard.md` §20 (self-merge ritüeli),
 * §21 (kabul edilen boşluk), §25 (gürültülü kapı okunmaz), §28 (`git -C`, konum).
 */

'use strict'

const { execFileSync } = require('child_process')
const fs = require('fs')
const path = require('path')

/** `skipping` DÜŞEN DEĞİLDİR: koşulu tutmayan ajan workflow'ları bu kovaya düşer ve onları
 *  düşen saymak günde altı yanlış alarm okutturdu (2026-09-03 ölçümü). */
const DUSEN_KOVALARI = ['fail']
const BEKLEYEN_KOVALARI = ['pending']

/**
 * ⭐EMEKLİ HARİCİ KAPILAR (ALT-199, OPS onaylı DEĞİŞİM — gevşetme değil).
 * 15 Kasım 2026'da site DigitalOcean + Coolify'a taşındı; Vercel hesabı engelli, her PR'da commit durumu
 * `Vercel: failure — Account is blocked` düşüyor (16 Kasım ölçümü, #2571: 19 kapı SUCCESS/SKIPPED, yalnız Vercel
 * failure, mergeStateStatus=UNSTABLE). Bu kapı artık kod hakkında HİÇBİR ŞEY söylemez.
 *
 * KURAL: yalnız TAM AD eşleşmesi (alt dize/regex YOK) ve yalnız bu listedeki adlar; liste dışı hiçbir harici kapı
 * muaf olmaz. Muaf kapı SESSİZ düşmez: madde 3 ve 4 detayında "emekli kapi sayilmadi: Vercel(fail)" görünür.
 * Listeye ad eklemek bilinçli güncelleme ister (ratchet: merge-ritueli.test.ts literal küme sayar).
 * Vercel'in işlevi (önizleme derlemesi kırık mı) kaldırılmadı, EŞDEĞERİNE devredildi: bkz. `imajKapisiTuret`.
 */
const EMEKLI_HARICI_KAPILAR = Object.freeze([
  Object.freeze({
    ad: 'Vercel',
    tarih: '2026-11-15',
    gerekce: 'Site Coolify\'a tasindi, Vercel hesabi engelli (Account is blocked); eslegi: ci + Imaj derle (ALT-187, ALT-199)',
  }),
  Object.freeze({
    ad: 'Vercel Preview Comments',
    tarih: '2026-11-15',
    gerekce: 'Vercel on izleme yorum entegrasyonu; ayni hesapla birlikte emekli (ALT-187, ALT-199)',
  }),
])

/** Tam ad eşleşmesi: `Set.has`. `includes`/regex KULLANILMAZ ('Vercel' içeren her ad muaf OLMAZ). */
const EMEKLI_AD_KUMESI = new Set(EMEKLI_HARICI_KAPILAR.map((k) => k.ad))
function emekliMi(ad) {
  return EMEKLI_AD_KUMESI.has(ad)
}

/**
 * ⭐TEK emeklilik ölçütü (madde 3 süzgeci, `emekliNot`, madde 4 `sorunlu.every` HEPSİ bunu kullanır).
 * Ad sahteciliği kapatıldı: bir Actions job'ına `name: Vercel` yazan workflow muaf OLMAZ. Gerçek harici Vercel
 * durumu canlıda `{name:'Vercel',bucket:'fail',event:'',workflow:''}` (16 Kasım ölçümü, #2571); Actions kapılarında
 * `workflow` dolu. KATI: yalnız `workflow === ''` (undefined/başka değer = muaf DEĞİL, fail-closed) VE tam ad.
 */
function emekliKapi(c) {
  return Boolean(c) && c.workflow === '' && emekliMi(c.name)
}

// ─────────────────────────────────────────────────────────────────────────────
// TÜRETME — saf: girdi bir DİZİN, çıktı kapı adları + adıyla yazılmış sınırlar.
// Saf olması fikstür kurulabilmesi içindir (§25): kol kendi workflow dizinini yazar.
// ─────────────────────────────────────────────────────────────────────────────

/** `on:` bloğunun gövdesini döndürür; `on: pull_request` kısayolunu da tanır. */
function onBlogu(metin) {
  const kisayol = /^on:[ \t]*(\S.*)$/m.exec(metin)
  if (kisayol) return { govde: kisayol[1], kisayolMu: true }
  const blok = /^on:[ \t]*\r?\n([\s\S]*?)(?=^\S)/m.exec(metin)
  return { govde: blok ? blok[1] : '', kisayolMu: false }
}

/** `pull_request:` alt bloğu — kendisinden daha girintili satırlar. */
function pullRequestBlogu(onGovde) {
  const bas = /^([ \t]*)pull_request:[ \t]*\r?\n?/m.exec(onGovde)
  if (!bas) return null
  const girinti = bas[1].length
  const satirlar = onGovde.slice(bas.index + bas[0].length).split(/\r?\n/)
  const govde = []
  for (const s of satirlar) {
    if (s.trim() === '') { govde.push(s); continue }
    const g = s.length - s.trimStart().length
    if (g <= girinti) break
    govde.push(s)
  }
  return govde.join('\n')
}

/**
 * Bir workflow dosyasını çözer.
 * @returns {{tetikli:boolean, sychronizeVar:boolean, pathsVar:boolean, joblar:Array, sinir:string|null}}
 */
function workflowCoz(metin) {
  const { govde, kisayolMu } = onBlogu(metin)
  if (!/pull_request(?![_\w])/.test(govde)) {
    return { tetikli: false, sychronizeVar: false, pathsVar: false, joblar: [], sinir: null }
  }
  let sinir = null
  let synchronizeVar = true // `types` YOKSA tüm tipler ateşler → synchronize dahil
  let pathsVar = false

  if (!kisayolMu) {
    const pr = pullRequestBlogu(govde)
    if (pr === null) {
      sinir = 'pull_request adı `on:` içinde görüldü ama alt blok çözülemedi'
    } else {
      pathsVar = /^[ \t]*paths(-ignore)?:/m.test(pr)
      const tipSatiri = /^[ \t]*types:[ \t]*(.*)$/m.exec(pr)
      if (tipSatiri) {
        const satirIci = tipSatiri[1].trim()
        if (satirIci !== '') {
          // `types: [opened, synchronize]`
          synchronizeVar = /\bsynchronize\b/.test(satirIci)
        } else {
          // çok satırlı: `types:` + `  - opened`
          const kalan = pr.slice(tipSatiri.index + tipSatiri[0].length)
          const liste = []
          for (const s of kalan.split(/\r?\n/)) {
            const m = /^[ \t]*-[ \t]*(\S+)/.exec(s)
            if (m) { liste.push(m[1]); continue }
            if (s.trim() !== '') break
          }
          if (liste.length === 0) {
            sinir = '`types:` bulundu ama listesi çözülemedi — türetme bu dosyada KÖRDÜR'
            synchronizeVar = false // fail-closed: çözemediğim tipi "vardır" saymam
          } else {
            synchronizeVar = liste.includes('synchronize')
          }
        }
      }
    }
  }

  const joblar = []
  const jm = /^jobs:[ \t]*\r?\n([\s\S]*)/m.exec(metin)
  if (jm) {
    let cur = null
    for (const satir of jm[1].split(/\r?\n/)) {
      const id = /^ {2}([A-Za-z0-9_.-]+):[ \t]*$/.exec(satir)
      if (id) { cur = { id: id[1], ad: null, kosullu: false }; joblar.push(cur); continue }
      if (!cur) continue
      const ad = /^ {4}name:[ \t]*(.+?)[ \t]*$/.exec(satir)
      if (ad && cur.ad === null) { cur.ad = ad[1].replace(/^['"]|['"]$/g, ''); continue }
      if (/^ {4}if:/.test(satir)) cur.kosullu = true
    }
  } else if (joblar.length === 0) {
    sinir = sinir || '`jobs:` bloğu bulunamadı'
  }

  return { tetikli: true, sychronizeVar: synchronizeVar, pathsVar, joblar, sinir }
}

/**
 * `.github/workflows` altından ZORUNLU ÇEKİRDEĞİ türetir.
 * @param {string} kok repo kökü
 * @returns {{kapilar:string[], sinirlar:string[], okunanDosya:number}}
 */
function turetCekirdek(kok) {
  const dizin = path.join(kok, '.github', 'workflows')
  let dosyalar = []
  try {
    dosyalar = fs.readdirSync(dizin).filter((f) => /\.ya?ml$/i.test(f)).sort()
  } catch (e) {
    return { kapilar: [], sinirlar: ['workflow dizini OKUNAMADI: ' + String(e.message).slice(0, 100)], okunanDosya: 0 }
  }
  return cekirdekCoz(dosyalar, (f) => fs.readFileSync(path.join(dizin, f), 'utf8'))
}

/**
 * ALT-201: çekirdek TABANDAN (origin/master) türetilir, PR ağacından DEĞİL. PR ağacından türetilince bir PR çekirdek
 * bir işi silerek/yeniden adlandırarak/`if:` ekleyerek çekirdeği küçültebilir ve küçülmüş çekirdekle yeşil alırdı
 * (ci.yml sınıflayıcısı bilerek tabandan okur; ritüel okumuyordu). Taban çekirdeği KALDIRILMIŞ bir iş tabloda
 * bulunmayacağı için madde 2 KIRMIZI verir: çekirdeği bilerek değiştiren PR OPS/ARAÇ yolundan (elle) geçer.
 * `listele()` tabandaki workflow dosya adlarını, `oku(ad)` bir dosyanın metnini verir; ikisi de HATA FIRLATIRSA
 * fail-closed: çekirdek BOŞ döner ve madde 2 "CEKIRDEK BOS" ile KIRMIZI olur.
 * @param {() => string[]} listele
 * @param {(ad:string) => string} oku
 */
function turetCekirdekTabandan(listele, oku) {
  let dosyalar
  try {
    dosyalar = listele().map((d) => String(d).split(/[\\/]/).pop()).filter((f) => /\.ya?ml$/i.test(f)).sort()
  } catch (e) {
    return { kapilar: [], sinirlar: ['taban (origin/master) workflow listesi OKUNAMADI: ' + String(e.message).slice(0, 100)], okunanDosya: 0 }
  }
  return cekirdekCoz(dosyalar, oku)
}

/** Ortak çözümleyici: dosya adları + metin okuyucudan çekirdek kapıları üretir. SAF (okuyucu dışarıdan). */
function cekirdekCoz(dosyalar, oku) {
  const kapilar = []
  const sinirlar = []
  for (const f of dosyalar) {
    let metin
    try {
      metin = oku(f)
    } catch (e) {
      sinirlar.push(f + ': okunamadi (' + String(e.message).slice(0, 60) + ')')
      continue
    }
    const c = workflowCoz(metin)
    if (c.sinir) sinirlar.push(f + ': ' + c.sinir)
    if (!c.tetikli) continue
    if (!c.sychronizeVar || c.pathsVar) continue
    for (const j of c.joblar) {
      if (j.kosullu) continue
      kapilar.push(j.ad || j.id)
    }
  }
  return { kapilar: [...new Set(kapilar)].sort(), sinirlar, okunanDosya: dosyalar.length }
}

/** Yayın imajı workflow'u (Vercel önizleme derlemesinin eşdeğeri). Yollar bu dosyadan TÜRETİLİR. */
const IMAJ_WORKFLOW_DOSYASI = 'yayin-imaji.yml'

/**
 * `yayin-imaji.yml` metninden imaj kapısını türetir. SAF.
 * @returns {{ad:string, yollar:string[]}|{hata:string}}
 */
function imajKapisiCoz(metin) {
  const { govde, kisayolMu } = onBlogu(metin)
  if (kisayolMu) return { hata: 'on: kisayol bicimi — paths: okunamaz' }
  const pr = pullRequestBlogu(govde)
  if (pr === null) return { hata: 'on.pull_request blogu bulunamadi' }
  const yollar = []
  const bas = /^[ \t]*paths:[ \t]*(.*)$/m.exec(pr)
  if (!bas) return { hata: 'on.pull_request.paths bulunamadi' }
  const satirIci = bas[1].trim()
  if (satirIci.startsWith('[')) {
    for (const p of satirIci.replace(/^\[|\]$/g, '').split(',')) {
      const t = p.trim().replace(/^['"]|['"]$/g, '')
      if (t) yollar.push(t)
    }
  } else {
    for (const s of pr.slice(bas.index + bas[0].length).split(/\r?\n/)) {
      const m = /^[ \t]*-[ \t]*(\S.*?)[ \t]*$/.exec(s)
      if (m) { yollar.push(m[1].replace(/^['"]|['"]$/g, '')); continue }
      if (s.trim() !== '') break
    }
  }
  if (yollar.length === 0) return { hata: 'paths: listesi bos/cozulemedi' }
  // Desteklenmeyen glob karakteri fail-closed: yanlış eşleşen desen "imaj yolu değişmedi" diyip kapıyı düşürebilir.
  const desteksiz = yollar.find((p) => /^!|[?[{]/.test(p))
  if (desteksiz) return { hata: 'desteklenmeyen glob karakteri (? [ { ya da bas ! ) paths icinde: ' + desteksiz }
  const c = workflowCoz(metin)
  const is = c.joblar.find((j) => j.ad) || c.joblar[0]
  if (!is) return { hata: 'jobs: icinde job bulunamadi' }
  // Üst düzey workflow adı (gh pr checks `workflow` alanı: canlıda "Yayın İmajı (GHCR)", 16 Kasım #2571). Yoksa fail-closed.
  const wm = /^name:[ \t]*(\S.*?)[ \t]*\r?$/m.exec(metin)
  const workflow = wm ? wm[1].replace(/^['"]|['"]$/g, '') : ''
  if (!workflow) return { hata: 'ust duzey workflow `name:` bulunamadi' }
  return { ad: is.ad || is.id, workflow, yollar }
}

/**
 * Repo kökünden imaj kapısını türetir. Okunamaz/çözülemezse `null` + sınır (çağıran fail-closed KIRMIZI verir).
 * @param {string} kok repo kökü (`metinOku` verilmezse dosya buradan okunur)
 * @param {() => string} [metinOku] verilirse yayin-imaji.yml metnini bu işlev döndürür (CLI: tabandan `git show`)
 * @returns {{kapi:{ad:string,yollar:string[]}|null, sinir:string|null}}
 */
function imajKapisiTuret(kok, metinOku) {
  let metin
  try {
    // ⭐CLI `metinOku`yu TABANDAN (git show origin/master:...) verir: yollar PR'ın kendi ağacından okunsaydı PR, kendi
    // zorunlu kapısını `paths:` listesini daraltarak kaldırabilirdi. Varsayılan (enjeksiyon yok) kök altındaki dosyadır.
    metin = typeof metinOku === 'function'
      ? metinOku()
      : fs.readFileSync(path.join(kok, '.github', 'workflows', IMAJ_WORKFLOW_DOSYASI), 'utf8')
    if (typeof metin !== 'string' || metin.trim() === '') throw new Error('bos metin')
  } catch (e) {
    return { kapi: null, sinir: IMAJ_WORKFLOW_DOSYASI + ' OKUNAMADI: ' + String(e.message).slice(0, 80) }
  }
  const c = imajKapisiCoz(metin)
  if (c.hata) return { kapi: null, sinir: IMAJ_WORKFLOW_DOSYASI + ': ' + c.hata }
  return { kapi: c, sinir: null }
}

/** Basit glob → regex (`**`, `*`); düz yollar tam eşleşir. SAF. */
function yolDeseniEslesir(desen, yol) {
  const d = String(desen).replace(/\\/g, '/')
  const y = String(yol).replace(/\\/g, '/')
  // `**/` SIFIR dizin de eşler (GitHub gibi): `**/Dockerfile` ≙ `Dockerfile`, `a/**/b` ≙ `a/b`.
  const re = '^' + d.replace(/[.+^${}()|[\]\\?]/g, '\\$&')
    .replace(/\*\*\//g, '\u0001').replace(/\*\*/g, '\u0000').replace(/\*/g, '[^/]*')
    .replace(/\u0001/g, '(?:.*/)?').replace(/\u0000/g, '.*') + '$'
  return new RegExp(re).test(y)
}

// ─────────────────────────────────────────────────────────────────────────────
// DEĞERLENDİRME — saf: ölçülmüş girdiler → beş madde. Ağ/disk YOK, fikstür kurulabilir.
// ─────────────────────────────────────────────────────────────────────────────

/**
 * @param {{pv:object|null, pvHata?:string, kapilar:Array<{name:string,bucket:string,workflow?:string}>|null,
 *          cekirdek:string[], uzakSha:string|null, migrationlar:string[]|null,
 *          mergeCommitSha:string|null}} girdi
 *   `mergeCommitSha`: REST'ten okunan `merge_commit_sha`. `null` = OKUNAMADI (fail-closed),
 *   `''` = GitHub üretmemiş. `gh pr view --json mergeCommit` bu ölçüm için KULLANILMAZ:
 *   açık PR'da her zaman null döner ve ayırt etmeyi bırakır.
 * @returns {{maddeler:Array<{no:number,ad:string,gecti:boolean,detay:string}>, kirmizi:number}}
 */
/** `--onay` metninin en kısa kabul uzunluğu. Sebep aşağıda, `onayGecerli` başlığında. */
const ONAY_ASGARI = 20

/**
 * ⭐ONAY GECERLILIGI — TEK UYGULAMA. Hem çekirdek hem CLI buradan sorar; iki yerde iki
 * eşik yazmak bu depoda ölçülmüş bir hata sınıfıdır ("aynı ölçüt iki uygulama").
 *
 * NİÇİN UZUNLUK EŞİĞİ: onay metni bir KANITTIR, bayrak değil. `--onay=ok` ya da `--onay=evet`
 * hiçbir şeyi kanıtlamaz — kimin, nerede, ne zaman dediğini taşımaz ve PR'a yazıldığında
 * okuyana hiçbir şey söylemez. 20 karakter, *"Recep · <yer> · <tarih>"* biçimindeki en kısa
 * gerçek alıntının altına düşmez. Eşik metnin DOĞRULUĞUNU ölçmez (ölçemez); yalnız
 * refleks-onayı pahalılaştırır: yazmak zorunda kalan, ne yazdığına bakar.
 */
function onayGecerli(ham) {
  if (ham === undefined || ham === null) return { gecerli: false, sebep: 'verilmedi', metin: '' }
  // Tek satıra indirilir: PR yorumuna "> " ile yazılan çok satırlı onayın 2. satırı çıplak kalır ve madde 7'nin bulgu/kapanış
  // işaretini taşıyabilir (denetçi, ARC-262).
  const metin = String(ham).replace(/\s*[\r\n\u2028\u2029]+\s*/g, ' ').trim()
  if (!metin) return { gecerli: false, sebep: 'BOS', metin: '' }
  if (metin.length < ONAY_ASGARI) {
    return {
      gecerli: false,
      metin,
      sebep: metin.length + ' karakter (asgari ' + ONAY_ASGARI + ') — onay bir KANIT olmali: ' +
        'kimin sozu, nerede, ne zaman',
    }
  }
  return { gecerli: true, sebep: '', metin }
}

function degerlendir(girdi) {
  const maddeler = []
  const ekle = (no, ad, gecti, detay) => maddeler.push({ no, ad, gecti, detay: detay || '' })

  // ÖLÇEMEMEK GEÇMEK DEĞİLDİR — PR okunamadıysa hepsi kırmızı, tek tek uydurulmaz.
  if (!girdi.pv) {
    ekle(0, 'PR OKUNDU', false,
      'pr view basarisiz: ' + (girdi.pvHata || 'sebep yok') +
      ' — OLCULEMEDI, "gecti" DEGIL (fail-closed)')
    return { maddeler, kirmizi: 1 }
  }
  const pv = girdi.pv

  // 1 — İKİ ölçüm: durum ETİKETİ (dolaylı) + birleşme sha'sının VARLIĞI (yapısal).
  // ⚠Niçin ikisi: §20'nin ölçümü, `gh pr view --json mergeCommit`in AÇIK PR'da HER ZAMAN
  // `null` döndüğünü gösterdi — o alana bakan biri her açık PR'ı "çakışık" sanır. Bugün
  // (2026-09-04) ölçüldü: açık PR #966'da `mergeCommit=null` ama REST `merge_commit_sha`
  // gerçek bir sha. Yani birleşme ref'inin varlığı YALNIZ REST'ten okunur; `mergeStateStatus`
  // ise ayırt ediyor (DIRTY→MERGEABLE geçişi aynı gün ölçüldü). İkisi ayrı eksen, ikisi de aranır.
  if (pv.mergeStateStatus === 'DIRTY') {
    ekle(1, 'BIRLESME REF\'I VAR', false,
      'PR CAKISMALI (mergeStateStatus=DIRTY). Birlesme ref\'i uretilemez -> kapilar DOGMAZ, ' +
      'kapi tablosu (yesil dahil) ANLAMSIZDIR. Cozum: taban-tazele.cjs, sonra it.')
  } else if (girdi.mergeCommitSha === null) {
    ekle(1, 'BIRLESME REF\'I VAR', false,
      'REST merge_commit_sha OKUNAMADI — olculemedi, "var" sayilmaz (fail-closed). ' +
      'Olcum: gh api repos/{owner}/{repo}/pulls/{n} -> merge_commit_sha')
  } else if (girdi.mergeCommitSha === '') {
    ekle(1, 'BIRLESME REF\'I VAR', false,
      'merge_commit_sha BOS — GitHub birlesme ref\'ini URETMEMIS. Kapilar planlanmaz; ' +
      'durum etiketi DIRTY olmasa bile bu hâlde merge SIFIR KAPIYLA yapilir.')
  } else {
    ekle(1, 'BIRLESME REF\'I VAR', true,
      'mergeStateStatus=' + pv.mergeStateStatus + ', merge_commit_sha=' +
      String(girdi.mergeCommitSha).slice(0, 8))
  }

  // 2 — türetilen çekirdeğin HER üyesi listede
  const kapilar = girdi.kapilar
  if (kapilar === null) {
    ekle(2, 'ZORUNLU CEKIRDEK LISTEDE', false, 'kapi tablosu OKUNAMADI — olculemedi')
  } else {
    const adlar = new Set(kapilar.map((c) => c.name))
    const eksik = girdi.cekirdek.filter((g) => !adlar.has(g))
    if (girdi.cekirdek.length === 0) {
      ekle(2, 'ZORUNLU CEKIRDEK LISTEDE', false,
        'CEKIRDEK BOS — turetme hicbir kapi bulamadi. Bos beklenti her seyi gecirir, ' +
        'yani bu KIRMIZIDIR (bos kume ile olcum yapilmis SAYILMAZ).')
    } else if (kapilar.length === 0) {
      ekle(2, 'ZORUNLU CEKIRDEK LISTEDE', false, 'HIC kapi yok — olcum YAPILMAMIS')
    } else if (eksik.length) {
      ekle(2, 'ZORUNLU CEKIRDEK LISTEDE', false,
        'EKSIK: ' + eksik.join(', ') + '  (gorulen ' + kapilar.length + ': ' +
        [...adlar].sort().join(', ') + ')  — var olmayan kapi "bekleyen" GORUNMEZ')
    } else {
      ekle(2, 'ZORUNLU CEKIRDEK LISTEDE', true,
        kapilar.length + ' kapi gorundu, cekirdegin ' + girdi.cekirdek.length + ' uyesi VAR')
    }
  }

  // 2b — EŞDEĞER KAPI (ALT-199): Vercel'in işlevi "önizleme derlemesi kırık mı" idi. Emekli edildi ama işlev DÜŞMEDİ:
  // PR imaj yolunu (yayin-imaji.yml `on.pull_request.paths`'ten TÜRETİLEN) değiştiriyorsa `İmaj derle` kapısı tabloda
  // VAR ve SUCCESS (`pass`) olmak ZORUNDA. Yolu değişmeyen PR'da yokluk sorun değil (workflow zaten tetiklenmez).
  // `undefined` = çağıran bu ölçümü vermedi (eski fikstürler); `null` = türetilemedi/okunamadı → fail-closed.
  // ⚠`ci` (Lint-Build) ayrıca çekirdekte: ama `Build (blocking)` adımı dar sınıfta (belge/edge/betik/karma) ATLANIR (ci.yml,
  // ALT-38c); imaj kapısı bu yüzden yalnız imaj yolu değişince değil, ürün derlemesi için `ci`nin kendi kararına bırakılır.
  if (girdi.imajKapisi !== undefined) {
    const m2 = maddeler.find((m) => m.no === 2)
    const iptal = (neden) => { if (m2) { m2.gecti = false; m2.detay = (m2.detay ? m2.detay + ' · ' : '') + neden } }
    if (girdi.imajKapisi === null) {
      iptal('IMAJ KAPISI TURETILEMEDI (yayin-imaji.yml paths/job okunamadi) — olculemedi, fail-closed')
    } else if (!Array.isArray(girdi.degisenDosyalar)) {
      iptal('PR degisen dosya listesi OKUNAMADI — imaj yolu degisti mi bilinmiyor, fail-closed')
    } else {
      const imajYoluDegisti = girdi.degisenDosyalar.some((d) =>
        girdi.imajKapisi.yollar.some((desen) => yolDeseniEslesir(desen, d)))
      if (!imajYoluDegisti) {
        if (m2 && m2.gecti) m2.detay += ' · imaj yolu degismedi, "' + girdi.imajKapisi.ad + '" beklenmez'
      } else if (kapilar === null) {
        iptal('imaj yolu degisti ama kapi tablosu OKUNAMADI')
      } else {
        // Ad + WORKFLOW birlikte: baska bir workflow'daki ayni adli job imaj kapisi SAYILMAZ.
        const imaj = kapilar.filter((c) => c.name === girdi.imajKapisi.ad && c.workflow === girdi.imajKapisi.workflow)
        if (imaj.length === 0) {
          iptal('IMAJ YOLU DEGISTI ama "' + girdi.imajKapisi.ad + '" kapisi (workflow "' + girdi.imajKapisi.workflow +
            '") tabloda YOK — Vercel\'in yerini tutan derleme hic kosmamis (var olmayan kapi "bekleyen" gorunmez)' +
            (kapilar.some((c) => c.name === girdi.imajKapisi.ad) ? '; ayni adli kapi BASKA workflow\'da, sayilmadi' : ''))
        } else if (!imaj.every((c) => c.bucket === 'pass')) {
          iptal('IMAJ YOLU DEGISTI ve "' + girdi.imajKapisi.ad + '" SUCCESS degil (' +
            imaj.map((c) => c.bucket).join(',') + ')')
        } else if (m2 && m2.gecti) {
          m2.detay += ' · imaj yolu degisti, "' + girdi.imajKapisi.ad + '" VAR ve SUCCESS (Vercel eslegi)'
        }
      }
    }
  }

  // 3 — emekli harici kapılar (Vercel) düşen/bekleyen sayımından ÇIKAR ama detayda GÖRÜNÜR kalır (sessiz değil).
  const emekliNot = (liste) => liste.length
    ? 'emekli kapi sayilmadi: ' + liste.map((c) => c.name + '(' + c.bucket + ')').join(', ')
    : ''
  if (kapilar === null) {
    ekle(3, 'DUSEN 0 VE BEKLEYEN 0', false, 'kapi tablosu OKUNAMADI')
  } else {
    const sayilacak = (kovalar) => kapilar.filter((c) => kovalar.includes(c.bucket))
    const dusenHepsi = sayilacak(DUSEN_KOVALARI)
    const bekleyenHepsi = sayilacak(BEKLEYEN_KOVALARI)
    const dusen = dusenHepsi.filter((c) => !emekliKapi(c))
    const bekleyen = bekleyenHepsi.filter((c) => !emekliKapi(c))
    const emekliler = [...dusenHepsi, ...bekleyenHepsi].filter((c) => emekliKapi(c))
    const not = emekliNot(emekliler)
    if (dusen.length || bekleyen.length) {
      ekle(3, 'DUSEN 0 VE BEKLEYEN 0', false,
        'dusen ' + dusen.length + ' [' + dusen.map((c) => c.name).join(',') + '] · bekleyen ' +
        bekleyen.length + ' [' + bekleyen.map((c) => c.name).join(',') + ']' + (not ? ' · ' + not : ''))
    } else {
      ekle(3, 'DUSEN 0 VE BEKLEYEN 0', true, 'skipping DUSEN sayilmadi' + (not ? ' · ' + not : ''))
    }
  }

  // 4 — `UNSTABLE` YALNIZ şu koşulda kabul (ALT-199): mergeable=MERGEABLE VE kapı tablosunda düşen/bekleyen en az bir
  // kapı var VE hepsi emekli harici listesinde (GitHub'ın UNSTABLE'ı yalnız emekli Vercel'den geliyor). Düşen/bekleyen
  // emekli-dışı kapı varsa, tablo okunamadıysa ya da UNSTABLE'ı AÇIKLAYAN emekli kapı yoksa KIRMIZI (açıklanamayan UNSTABLE geçmez).
  // DIRTY/BEHIND/UNKNOWN/HAS_HOOKS vb. önceki kuralla aynı: CLEAN ve BLOCKED dışı kırmızı.
  let unstableEmekliden = false
  if (pv.mergeable === 'MERGEABLE' && pv.mergeStateStatus === 'UNSTABLE' && kapilar !== null) {
    // HER kapi ya pass/skipping ya emekli olmali: fail, pending, cancel ve BILINMEYEN kova emekli degilse sorunludur
    // (cancel hicbir sayima girmediginden eskiden UNSTABLE'a gizlenebiliyordu — ARC-331).
    const sorunlu = kapilar.filter((c) => !['pass', 'skipping'].includes(c.bucket))
    unstableEmekliden = sorunlu.length > 0 && sorunlu.every((c) => emekliKapi(c))
  }
  if (pv.mergeable !== 'MERGEABLE' || (!['CLEAN', 'BLOCKED'].includes(pv.mergeStateStatus) && !unstableEmekliden)) {
    ekle(4, 'MERGEABLE + hesaplanmis durum', false,
      'mergeable=' + pv.mergeable + ' state=' + pv.mergeStateStatus +
      (pv.mergeable === 'UNKNOWN' || pv.mergeStateStatus === 'UNKNOWN'
        ? '  (GitHub HESAPLIYOR — TEKRAR OLC, VARSAYMA)' : ''))
  } else if (girdi.uzakSha === null) {
    ekle(4, 'MERGEABLE + hesaplanmis durum', false, 'uzak dal sha OKUNAMADI')
  } else if (pv.headRefOid !== girdi.uzakSha) {
    ekle(4, 'MERGEABLE + hesaplanmis durum', false,
      'PR head ' + String(pv.headRefOid).slice(0, 8) + ' ile uzak dal ' +
      String(girdi.uzakSha).slice(0, 8) + ' AYRISIYOR — kapilar BASKA commit\'i olcmus olabilir')
  } else {
    ekle(4, 'MERGEABLE + hesaplanmis durum', true,
      'state=' + pv.mergeStateStatus + ', sha ' + String(girdi.uzakSha).slice(0, 8) + ' eslesiyor' +
      (unstableEmekliden ? ' · UNSTABLE yalniz emekli Vercel\'den (pass/skipping disindaki kapilarin — fail, pending, cancel, bilinmeyen — TAMAMI emekli listesinde)' : ''))
  }

  // 5
  const onay = onayGecerli(girdi.onay)
  if (girdi.migrationlar === null) {
    // ⛔ONAY OLCULEMEYENI ACMAZ. Onay "n migration'i biliyorum ve kabul ediyorum" demektir;
    // n bilinmiyorken verilen onay NEYIN onayi oldugunu soylemez. Fail-closed korunur.
    ekle(5, 'MIGRATION 0', false, 'migration diff\'i OKUNAMADI — olculemedi' +
      (girdi.onay ? '  (--onay verildi ama SAYI BILINMEDEN onay ACMAZ)' : ''))
  } else if (girdi.migrationlar.length) {
    if (onay.gecerli) {
      ekle(5, 'MIGRATION ' + girdi.migrationlar.length + ' — RECEP ONAYI KANITLI', true,
        onay.metin)
    } else {
      ekle(5, 'MIGRATION 0', false,
        girdi.migrationlar.length + ' migration — MERGE RECEP KAPISI (kural 13: merge = prod\'a ' +
        'OTOMATIK uygulama). Serit KENDI indirmez.' +
        (girdi.onay !== undefined && girdi.onay !== null ? '  ⚠--onay REDDEDILDI: ' + onay.sebep : ''))
    }
  } else if (girdi.onay !== undefined && girdi.onay !== null &&
    !(Array.isArray(girdi.functionsDegisen) && girdi.functionsDegisen.length)) {
    // (Edge değişikliği varsa onay madde 6'nın; burada "gereksiz" denmez.)
    // Migration YOKKEN onay: kapiyi acmaz (zaten acik), ama SESSIZ de gecmez — gereksiz onay,
    // "onay aliskanligi" doguracak ilk adimdir ve bir sonraki sefer migration'li PR'da refleks olur.
    ekle(5, 'MIGRATION 0', true, '⚠--onay GEREKSIZ verildi: migration 0, acilacak kapi yok')
  } else {
    ekle(5, 'MIGRATION 0', true)
  }

  // 6 — EDGE FUNCTIONS (ARC-259, OPS 6 Kasım): supabase/functions/** değişikliği EDGE/OPS tam okuma ister.
  // `undefined` = çağıran ölçmedi (eski fikstürler); `null` = OKUNAMADI (fail-closed); dizi = ölçüldü.
  if (girdi.functionsDegisen === null) {
    ekle(6, 'EDGE FUNCTIONS 0', false, 'functions diff\'i OKUNAMADI — olculemedi (fail-closed)')
  } else if (Array.isArray(girdi.functionsDegisen)) {
    if (girdi.functionsDegisen.length) {
      const dosyalar = girdi.functionsDegisen.length + ' dosya: ' +
        girdi.functionsDegisen.slice(0, 3).join(', ') + (girdi.functionsDegisen.length > 3 ? ' …' : '')
      if (onay.gecerli) {
        // ARC-262: Recep onaylı Edge değişikliği de ritüelden geçer (madde 5 ile aynı --onay kuralı, tek ölçüt).
        ekle(6, 'EDGE FUNCTIONS ' + girdi.functionsDegisen.length + ' — RECEP ONAYI KANITLI', true,
          onay.metin + ' · ' + dosyalar)
      } else {
        ekle(6, 'EDGE FUNCTIONS 0', false,
          'Edge degisikligi: EDGE/OPS tam okuma · ' + dosyalar +
          '  (autoMode kurali functions degisikligini reddeder; #2272 bu bosluktan gecmisti)' +
          (girdi.onay !== undefined && girdi.onay !== null ? '  ⚠--onay REDDEDILDI: ' + onay.sebep : ''))
      }
    } else {
      ekle(6, 'EDGE FUNCTIONS 0', true)
    }
  }

  // 7 — AÇIK İNCELEME BULGUSU (ARC-259): kapanmamış "DÜZELTME GEREKİR" / MEDIUM-HIGH bulgusu son commit'ten SONRA.
  if (girdi.inceleme === null) {
    ekle(7, 'ACIK INCELEME BULGUSU 0', false, 'PR yorumlari/commit tarihi OKUNAMADI — olculemedi (fail-closed)')
  } else if (girdi.inceleme !== undefined) {
    const acik = acikIncelemeBulgusu(girdi.inceleme)
    ekle(7, 'ACIK INCELEME BULGUSU 0', !acik.acik, acik.acik ? acik.detay : '')
  }

  // 8 — TABAN TAZELIGI (ALT-200): `git fetch origin master` basarisizsa origin/master bayat olabilir; bayat tabanla
  // alinan her fark/kapi olcumu "gecmis" dedirtebilir. `undefined` = cagiran olcmedi (eski fikstur) -> madde eklenmez;
  // yalniz `false` KIRMIZI verir (fetch denendi ve patladi). Basarili fetch'te madde gorunmez (7 maddelik cikti degismez).
  if (girdi.fetchTamam === false) {
    ekle(8, 'TABAN TAZE (fetch)', false,
      'git fetch origin master BASARISIZ — origin/master BAYAT olabilir, migration/edge/imaj farki ve kapi tablosu ' +
      'guvenilmez (fail-closed). Aga/kimlige bak, sonra ritueli tekrar kos.')
  }

  // 9 — WORKFLOW DOKUNUSU (ALT-203, ARC-334): PR kapinin KENDI tanimini degistirebilir (`if: false` skipping gecer,
  // ayni adla baska workflow'a tasima, ici bosaltma). Cekirdek tabandan turese de bu uc yol acik kalir; kok neden tek:
  // `.github/workflows/**` degisiyor. ISTISNA YOK: workflow PR'i = kapi PR'i, birlestirme OPS-192 yolundan (tam fark okunur,
  // ARAC hukmu, elle gh pr merge). `undefined` = cagiran olcmedi (eski fikstur) -> madde eklenmez; `null` = OKUNAMADI
  // (fail-closed KIRMIZI); bos dizi = dokunmuyor -> madde GORUNMEZ (cikti degismez).
  if (girdi.workflowDegisen === null) {
    ekle(9, 'WORKFLOW DOKUNUSU 0', false, 'degisen dosya listesi OKUNAMADI — olculemedi (fail-closed)')
  } else if (Array.isArray(girdi.workflowDegisen) && girdi.workflowDegisen.length) {
    ekle(9, 'WORKFLOW DOKUNUSU 0', false,
      'workflow degisikligi = kapi degisikligi · ' + girdi.workflowDegisen.length + ' dosya: ' +
      girdi.workflowDegisen.slice(0, 3).join(', ') + (girdi.workflowDegisen.length > 3 ? ' …' : '') +
      '  — birlestirme OPS-192 yolundan: tam fark okunur, ARAC hukmu, elle gh pr merge (--admin YOK). Istisna yok.')
  }

  return { maddeler, kirmizi: maddeler.filter((m) => !m.gecti).length }
}

// ─────────────────────────────────────────────────────────────────────────────
// ARC-259 — Edge functions ve açık inceleme bulgusu (saf yardımcılar)
// ─────────────────────────────────────────────────────────────────────────────

/** İnceleme yorumundaki bulgu işareti: "DÜZELTME GEREKİR" ya da satır başında MEDIUM/HIGH başlığı. */
const BULGU_ISARETI = /D[ÜUüu]ZELTME GEREK[İIiı]R/i
/** Denetçi sözlüğü: ENGELLEYİCİ-VAR yalnız satır başında bulgudur (hüküm yorumu cümle içinde andığında tetiklemesin). */
const ENGELLEYICI_VAR = /^[\s>*#|\-\d.)[(]*\**\s*ENGELLEY[İIiı]C[İIiı]-VAR/i
/** Satır başında (liste/numara/köşeli parantez/tablo/kalın süsünden sonra) MEDIUM ya da HIGH; ya da "Bulgu 1 (HIGH)". */
const SIDDET_BASLIGI = /^[\s>*#|\-\d.)[(]*\**\s*(MEDIUM|HIGH)\b|^[^.\n]{0,30}\((MEDIUM|HIGH)\)/
/** "yok / bulunmadı / 0" geçen şiddet satırı bulgu değildir ("HIGH: yok", "MEDIUM/HIGH bulgu yok"). */
const OLUMSUZ = /(?<![\p{L}\d])(yok|bulunmuyor|bulunmad[ıi]|s[ıi]f[ıi]r|0)(?![\p{L}\d])/iu
/**
 * Bulguların kapandığını bildiren yorum işareti: SATIR BAŞINDA olmalı. Sebep: ritüelin KIRMIZI mesajı bu ifadeyi
 * cümle ortasında taşır; çıktı PR'a yapıştırılırsa kendi bulgusunu kapatmasın. "KAPANDI DEĞİL" kapatmaz.
 */
const KAPANIS_ISARETI = /^[\s>*#-]*(?:[İIiı]NCELEME KAPAND[İIiı]|B[UuÜüİIiı]LGULAR G[İIiı]DER[İIiı]LD[İIiı])(?!\s*DE[ĞG][İIiı]L)/im

/** Yorum gövdesi bulgu içeriyor mu? NBSP/NFD normalleştirilir; şiddet başlığı satır satır ve olumsuzluk dışlanarak ölçülür. */
function bulguVarMi(govde) {
  const metin = String(govde || '').normalize('NFC').replace(/ /g, ' ')
  if (BULGU_ISARETI.test(metin)) return true
  return metin.split(/\r?\n/).some((s) => ENGELLEYICI_VAR.test(s) || (SIDDET_BASLIGI.test(s) && !OLUMSUZ.test(s)))
}

/**
 * Edge değişikliği: `supabase/functions/` altındaki yollar. SAF.
 * @param {string[]|null|undefined} dosyalar
 */
function edgeDegisiklikleri(dosyalar) {
  return (dosyalar || []).filter((d) => String(d).replace(/\\/g, '/').startsWith('supabase/functions/'))
}

/**
 * Workflow dokunuşu (ALT-203): `.github/workflows/` altındaki yollar. SAF. Girdi `--no-renames` listesidir
 * (taşınan dosyanın ESKİ yolu da görünür). Ters bölü normalleştirilir.
 * @param {string[]|null|undefined} dosyalar
 */
function workflowDegisiklikleri(dosyalar) {
  return (dosyalar || []).filter((d) => String(d).replace(/\\/g, '/').startsWith('.github/workflows/'))
}

/**
 * Açık inceleme bulgusu mu? SAF.
 * @param {{yorumlar:Array<{govde:string,tarih:string}>, sonCommit:string}} girdi
 *   `yorumlar`: PR yorumları + inceleme gövdeleri; `sonCommit`: son commit tarihi (ISO). Satır içi (diff) inceleme
 *   iş parçacıkları `gh pr view --json` ile gelmez: bu ölçümün bilinen sınırıdır.
 * Kural: bulgu işaretli yorum son commit'ten SONRAYSA (düzeltme gelmemiş) ve ondan sonra kapanış yorumu yoksa AÇIK.
 */
function acikIncelemeBulgusu(girdi) {
  const son = Date.parse(girdi.sonCommit)
  if (!Number.isFinite(son)) return { acik: true, detay: 'son commit tarihi OKUNAMADI (fail-closed)' }
  const yorumlar = (girdi.yorumlar || [])
    .map((y) => ({ govde: String(y.govde || ''), t: Date.parse(y.tarih) }))
    .filter((y) => Number.isFinite(y.t))
  for (const y of yorumlar) {
    if (y.t <= son || !bulguVarMi(y.govde)) continue
    const kapandi = yorumlar.some((k) => k.t > y.t && KAPANIS_ISARETI.test(k.govde.normalize('NFC').replace(/ /g, ' ')))
    if (!kapandi) {
      return {
        acik: true,
        detay: 'son commit\'ten SONRA yazilmis kapanmamis inceleme bulgusu (' + new Date(y.t).toISOString() +
          '): once duzelt ve it, ya da yeni bir yorumun BIRINCI satirina kapanis ifadesini yaz (docs/roller/ARAC-kurallar.md)',
      }
    }
  }
  return { acik: false, detay: '' }
}

// ─────────────────────────────────────────────────────────────────────────────
// OKUMA SORUSU (ARC-110, OPS-120 madde 2) — MADDE DEĞİL, hatırlatma.
// ─────────────────────────────────────────────────────────────────────────────
// 2026-10-12 13:07 olayı: kanca/MCP PR'ı farkı okunurken "başka sürümün canlı sage.db'ye
// ulaşması" sorusu HİÇ sorulmadı; kod kapısı (ARC-103) sonradan korudu, gözden geçirme sorusu
// yoktu. Ritüelin beş maddesi ÖLÇER; okuyanın aklına gelmesi gereken soru ölçülmez. Bu yüzden
// değişen dosyalar kanca / ayar / MCP sınıfındaysa çıktıya SABİT bir soru satırı basılır.
// Kırmızı VERMEZ (merge kararını değiştirmez), yalnız okuyana hatırlatır; sınıf dışında basılmaz.

/** Sorunun sorulacağı yol sınıfı: önek eşleşir (`.claude/settings*` için ad öneki). */
const OKUMA_SORUSU_YOLLARI = [
  '.claude/hooks/',
  '.claude/settings',
  '.mcp.json',
  'tools/wrongstack-mcp/',
  'scripts/board/',
]

const OKUMA_SORUSU_METNI =
  'OKUMA SORUSU: bu degisiklik baska surumun/agacin canli veriye ulasmasini mumkun kiliyor mu? ' +
  '(cevap PR govdesine yazilir)'

/** Değişen yollardan en az biri kanca/ayar/MCP sınıfındaysa true. Saf fonksiyon. */
function okumaSorusuGerekli(dosyalar) {
  if (!Array.isArray(dosyalar)) return false
  return dosyalar.some((d) => typeof d === 'string' &&
    OKUMA_SORUSU_YOLLARI.some((onek) => d.replace(/\\/g, '/').startsWith(onek)))
}

/**
 * ÖZ-DOĞRULAMA (ARC-194 öneri 3b, Recep OPS-198): `--merge` YALNIZ master'daki betikle koşar. İzin kuralı ritüeli
 * ADIYLA güveniyor; oturumda düzenlenmiş (kapıyı gevşetmiş) bir kopya aynı adla koşmasın. Saf: iki metin alır.
 * CRLF/LF farkı sayılmaz (Windows checkout'u). master metni yoksa (çevrimdışı/okunamadı) fail-closed.
 * @returns {{tamam:boolean, sebep:string}}
 */
function ozDogrulama(yerelMetin, masterMetin) {
  if (typeof masterMetin !== 'string' || masterMetin.length === 0) {
    return { tamam: false, sebep: 'origin/master\'daki betik okunamadi (cevrimdisi mi?) — fail-closed' }
  }
  const norm = (s) => String(s).replace(/\r\n/g, '\n').trimEnd() // git() cikisi kirpilmis gelir
  if (norm(yerelMetin) === norm(masterMetin)) return { tamam: true, sebep: '' }
  return {
    tamam: false,
    sebep: 'bu betik origin/master\'dakinden FARKLI (oturumda duzenlenmis ya da ritueli degistiren bir dalda). ' +
      '--merge reddedildi; ritueli degistiren PR\'i OPS-192 yolundan (OPS tam fark UYGUN) gh pr merge ile birlestir',
  }
}

module.exports = {
  ozDogrulama,
  turetCekirdek, turetCekirdekTabandan, workflowCoz, workflowDegisiklikleri, degerlendir, onayGecerli, okumaSorusuGerekli, edgeDegisiklikleri, acikIncelemeBulgusu,
  imajKapisiCoz, imajKapisiTuret, yolDeseniEslesir, emekliMi, emekliKapi, EMEKLI_HARICI_KAPILAR,
  DUSEN_KOVALARI, BEKLEYEN_KOVALARI, ONAY_ASGARI, OKUMA_SORUSU_YOLLARI, OKUMA_SORUSU_METNI,
}

// ─────────────────────────────────────────────────────────────────────────────
// CLI
// ─────────────────────────────────────────────────────────────────────────────

if (require.main === module) {
  const argv = process.argv.slice(2)
  const [pr, dal] = argv.filter((a) => !a.startsWith('--'))
  const agacBayragi = argv.find((a) => a.startsWith('--agac='))
  // 2026-09-06 (Katalog ihlal bildirimi): `ritual | tail && gh pr merge` kalibi cikis kodunu
  // YUTTU, KIRMIZI'ya ragmen merge oldu. Kapi ile eylem ayni surecte olmali: --merge verilirse
  // merge'i BU betik yapar, yalniz kirmizi === 0 ise. Ayri "gh pr merge" cagrisi YASAK (cetvel §20.1).
  const MERGE = argv.includes('--merge')
  // --onay="<Recep'in sozu · yer · tarih>": migration'li PR'da madde 5'i ACAN TEK yol.
  // Kural 13 kalkmiyor — kapi hala Recep'te; degisen sey, onayin AGIZDAN degil YAZIDAN
  // gecmesi ve PR'da KALMASI. (2026-09-06, REC-156/#1032: Recep "sen merge et" dedi, betik
  // kirmizi verdi, is istisnayla `gh pr merge` ile indi — yani kapi dolanildi. Bir daha olmasin.)
  const onayBayragi = argv.find((a) => a.startsWith('--onay='))
  const ONAY = onayBayragi ? onayBayragi.slice('--onay='.length) : null
  if (!pr || !dal) {
    process.stderr.write(
      'MERGE RITUELI — bes maddelik self-merge olcumu.\n\n' +
      'KULLANIM\n  node scripts/hijyen/merge-ritueli.cjs <PR> <dal> [--agac=<yol>] [--merge] [--onay="..."]\n' +
      '  --merge : bes madde YESIL ise merge\'i bu betik yapar (gh pr merge --squash --delete-branch).\n' +
      '            Kapi ve eylem AYNI surecte; pipe/&& zincirine kapi konmaz (cikis kodu yutulur).\n' +
      '  --onay  : migration\'li PR\'da madde 5\'i, supabase/functions degisen PR\'da madde 6\'yi acar (ARC-262). Metin RECEP\'IN KENDI SOZU olmali\n' +
      '            (kim · nerede · ne zaman), asgari ' + ONAY_ASGARI + ' karakter. --merge ile\n' +
      '            birlikte verilirse metin PR\'a YORUM olarak yazilir (kanit PR\'da kalir).\n' +
      '            Diger dort madde kirmizi ise --onay HICBIR SEYI acmaz.\n\n' +
      'CIKIS\n  0 = bes madde saglandi (self-merge serbest / --merge ile merge YAPILDI)\n' +
      '  1 = saglanmadi ya da OLCULEMEDI (fail-closed; --merge verilse de merge YAPILMAZ)\n' +
      '  2 = kullanim hatasi\n  3 = --merge: kapi yesil ama gh pr merge basarisiz\n',
    )
    process.exit(2)
  }
  // Bicimsel ret CLI'da ve ERKEN: gecersiz onayla olcume girip "kirmizi" gormek, kullaniciya
  // sebebi soylemez. Olcut TEK yerden sorulur (onayGecerli), burada yalniz CAGRILIR.
  if (onayBayragi) {
    const kontrol = onayGecerli(ONAY)
    if (!kontrol.gecerli) {
      process.stderr.write('merge-ritueli: --onay REDDEDILDI — ' + kontrol.sebep + '\n' +
        '  Ornek: --onay="Recep, kendi penceresinde: \'1032 icin merge et\' · 2026-09-06"\n')
      process.exit(2)
    }
  }
  // Sabit yol YAZILMAZ (depo PUBLIC, INV-MUTLAK-YOL-1): agac bayraktan ya da cwd'den.
  const AGAC = agacBayragi ? agacBayragi.slice('--agac='.length) : process.cwd()

  /** git DAİMA `-C` ile: beyan hatırlanır, `-C` hatırlanmaz (§28). */
  const git = (args) => execFileSync('git', ['-C', AGAC, ...args], { encoding: 'utf8', timeout: 120000 }).trim()
  const gh = (args) => execFileSync('gh', args, { encoding: 'utf8', cwd: AGAC })
  const yaz = (s) => process.stdout.write(s + '\n')

  yaz('== MERGE RITUELI — PR #' + pr + ' / ' + dal + ' ==')

  // ALT-200: fetch patlarsa origin/master BAYAT olabilir; "uyari yaz, devam et" bayat tabanla YESIL verdirirdi. Madde 8 KIRMIZI.
  let fetchTamam = true
  try { git(['fetch', 'origin', 'master', '-q']) } catch { fetchTamam = false; yaz('  ⚠fetch basarisiz — olcum BAYAT olabilir (madde 8 KIRMIZI)') }

  // ÖZ-DOĞRULAMA (ARC-194 3b): --merge yalniz master'daki betikle. Okuma olcumunden ONCE, eylemden hep once.
  if (MERGE) {
    let masterMetin = null
    try { masterMetin = git(['show', 'origin/master:scripts/hijyen/merge-ritueli.cjs']) } catch { /* fail-closed asagida */ }
    const oz = ozDogrulama(fs.readFileSync(__filename, 'utf8'), masterMetin)
    if (!oz.tamam) {
      yaz('  KIRMIZI OZ-DOGRULAMA: ' + oz.sebep)
      yaz('SONUC: KIRMIZI — --merge verildi ama MERGE YAPILMADI.')
      process.exit(1)
    }
  }

  let pv = null
  let pvHata
  try {
    pv = JSON.parse(gh(['pr', 'view', pr, '--json', 'mergeable,mergeStateStatus,headRefOid,state']))
  } catch (e) { pvHata = String(e.message).slice(0, 120) }

  let kapilar = null
  // `workflow` ALANI ŞART (ALT-199): emeklilik `workflow === ''` ister; Actions job'ı aynı adı taşısa muaf olmaz.
  try { kapilar = JSON.parse(gh(['pr', 'checks', pr, '--json', 'name,bucket,workflow'])) } catch { kapilar = null }

  // Birleşme ref'inin VARLIĞI yalnız REST'ten okunur (§20 dersi 3 + 2026-09-04 ölçümü).
  let mergeCommitSha = null
  try {
    const depo = JSON.parse(gh(['repo', 'view', '--json', 'nameWithOwner'])).nameWithOwner
    const rest = JSON.parse(gh(['api', 'repos/' + depo + '/pulls/' + pr]))
    mergeCommitSha = rest.merge_commit_sha === null || rest.merge_commit_sha === undefined
      ? '' : String(rest.merge_commit_sha)
  } catch { mergeCommitSha = null }

  // ALT-201: çekirdek TABANDAN (origin/master) türetilir; PR ağacı çekirdeği küçültemez. `--no-pager` ve ağaç `git()` ile.
  const { kapilar: cekirdek, sinirlar, okunanDosya } = turetCekirdekTabandan(
    () => git(['ls-tree', '--name-only', 'origin/master', '.github/workflows/']).split('\n').filter(Boolean),
    (ad) => git(['show', 'origin/master:.github/workflows/' + ad]),
  )

  let uzakSha = null
  try { uzakSha = git(['rev-parse', 'origin/' + dal]) } catch { uzakSha = null }

  let migrationlar = null
  try {
    // --no-renames (ALT-200): migration/functions disina TASINAN dosyanin ESKI yolu da listede gorunsun; yoksa
    // supabase/migrations/x.sql -> baska/yol.sql tasimasi migration sayacini atlatir.
    migrationlar = git(['diff', '--name-only', '--no-renames', 'origin/master...origin/' + dal, '--', 'supabase/migrations/'])
      .split('\n').filter(Boolean)
  } catch { migrationlar = null }

  // ARC-259: Edge functions değişikliği + açık inceleme bulgusu. Ölçülemezse null (fail-closed, KIRMIZI).
  let functionsDegisen = null
  try {
    functionsDegisen = edgeDegisiklikleri(
      git(['diff', '--name-only', '--no-renames', 'origin/master...origin/' + dal, '--', 'supabase/functions/']).split('\n').filter(Boolean),
    )
  } catch { functionsDegisen = null }

  let inceleme = null
  try {
    const j = JSON.parse(gh(['pr', 'view', pr, '--json', 'comments,reviews,commits']))
    const yorumlar = [
      ...(j.comments || []).map((c) => ({ govde: c.body, tarih: c.createdAt })),
      ...(j.reviews || []).map((r) => ({ govde: r.body, tarih: r.submittedAt })),
    ]
    const sonCommit = (j.commits || []).map((c) => c.committedDate).filter(Boolean).sort().pop()
    inceleme = sonCommit ? { yorumlar, sonCommit } : null
  } catch { inceleme = null }

  // ALT-199: imaj kapisi yayin-imaji.yml'den TURETILIR; degisen dosyalar tek yerden okunur (okuma sorusu da kullanir).
  // Yollar ve is adi TABANDAN (origin/master) okunur, PR agacindan degil: PR kendi zorunlu kapisini daraltamasin.
  const imaj = imajKapisiTuret(AGAC, () => git(['show', 'origin/master:.github/workflows/' + IMAJ_WORKFLOW_DOSYASI]))
  let degisenDosyalar = null
  try {
    // --no-renames: tasinan dosyanin ESKI yolu da listede gorunsun (Dockerfile -> baska ad tasimasi imaj yolunu atlatamaz).
    degisenDosyalar = git(['diff', '--name-only', '--no-renames', 'origin/master...origin/' + dal]).split('\n').filter(Boolean)
  } catch { degisenDosyalar = null }

  yaz('  turetme: ' + okunanDosya + ' workflow okundu (TABANDAN origin/master), zorunlu cekirdek ' + cekirdek.length +
    ' kapi: ' + (cekirdek.join(', ') || '(BOS)'))
  // §21: kabul edilen boşluk SESSİZ olamaz.
  yaz('  ⚠sinir : harici kapilar TURETILEMEZ, cekirdege konmaz; yalniz EMEKLI listesindekiler (tam ad: ' +
    EMEKLI_HARICI_KAPILAR.map((k) => k.ad + ' ' + k.tarih).join(', ') + ') madde 3/4 sayimindan cikar ' +
    've detayda gorunur; liste disi harici kapi duserse madde 3 KIRMIZI.')
  yaz('  bilgi   imaj kapisi (Vercel eslegi): ' + (imaj.kapi
    ? '"' + imaj.kapi.ad + '" — yollar: ' + imaj.kapi.yollar.join(', ')
    : 'TURETILEMEDI (' + imaj.sinir + ') — imaj yolu degisen PR\'da fail-closed'))
  for (const s of sinirlar) yaz('  ⚠sinir : ' + s)

  const { maddeler, kirmizi } = degerlendir({
    pv, pvHata, kapilar, cekirdek, uzakSha, migrationlar, mergeCommitSha, onay: ONAY, functionsDegisen, inceleme,
    imajKapisi: imaj.kapi, degisenDosyalar, fetchTamam,
    workflowDegisen: degisenDosyalar === null ? null : workflowDegisiklikleri(degisenDosyalar),
  })
  for (const m of maddeler) {
    yaz((m.gecti ? '  YESIL   ' : '  ⛔KIRMIZI ') + m.no + '. ' + m.ad + (m.detay ? '  — ' + m.detay : ''))
  }

  try {
    const geride = git(['rev-list', '--count', 'origin/' + dal + '..origin/master'])
    yaz('  bilgi   geride ' + geride + ' commit' + (geride !== '0' ? '  ⚠taban tazelemesi gerekebilir' : ''))
  } catch { /* bilgi satırı, ölçüt değil */ }

  // ARC-110: kanca/ayar/MCP sınıfı PR'da sabit okuma sorusu. Madde DEĞİL: kırmızı sayısına
  // girmez, çıkış kodunu değiştirmez; ölçülemezse sessizce atlanır (hatırlatma, kapı değil).
  try {
    const degisen = git(['diff', '--name-only', '--no-renames', 'origin/master...origin/' + dal]).split('\n').filter(Boolean)
    if (okumaSorusuGerekli(degisen)) yaz('  ' + OKUMA_SORUSU_METNI)
  } catch { /* hatırlatma, ölçüt değil */ }

  yaz('')
  yaz(kirmizi === 0
    ? 'SONUC: YESIL — maddeler saglandi (5 + Edge functions + acik inceleme bulgusu), self-merge serbest.'
    : 'SONUC: ⛔KIRMIZI — ' + kirmizi + ' madde saglanmadi. MERGE ETME.')
  if (kirmizi !== 0) {
    // Kirmizi STDERR'e de yazilir: `| tail` ile kirpilan stdout'ta kaybolmasin.
    process.stderr.write('merge-ritueli: KIRMIZI (' + kirmizi + ' madde)' +
      (MERGE ? ' — --merge verildi ama MERGE YAPILMADI.' : '') + '\n')
    process.exit(1)
  }
  if (MERGE) {
    // ⭐KANIT MERGE'DEN ONCE PR'A YAZILIR. Sebep: merge sonrasi yazilan bir kanit, merge
    // patlarsa hic yazilmaz — oysa onayin verildigi o zaman da dogrudur. Ayrica bu yorum
    // "merge edildi" DEMEZ, "onay sudur" der; sirasi yuzunden yanlis bir sey iddia etmez.
    // ⚠Yorum YALNIZ --merge ile yazilir: --onay tek basina bir OLCUMDUR, eylem degil.
    const edgeSayisi = Array.isArray(functionsDegisen) ? functionsDegisen.length : 0
    if (onayGecerli(ONAY).gecerli && ((migrationlar && migrationlar.length) || edgeSayisi)) {
      try {
        gh(['pr', 'comment', pr, '--body',
          (migrationlar && migrationlar.length
            ? 'MIGRATION ONAYI (merge-ritueli.cjs --onay) — ' + migrationlar.length +
              ' migration bu PR ile prod\'a OTOMATIK uygulanacak (kural 13).'
            : '') +
          (edgeSayisi ? (migrationlar && migrationlar.length ? '\n' : '') +
            'EDGE ONAYI (merge-ritueli.cjs --onay) — ' + edgeSayisi + ' supabase/functions dosyasi degisiyor.' : '') +
          '\n\n> ' + onayGecerli(ONAY).metin +
          '\n\nBu satir betik tarafindan, merge\'den ONCE yazildi; kanit PR\'da kalir.'])
        yaz('  bilgi   onay metni PR\'a yorum olarak yazildi')
      } catch (e) {
        // Kanit yazilamiyorsa MERGE ETME: kanitsiz acilan kapi, acilmamis sayilir.
        process.stderr.write('merge-ritueli: onay yorumu PR\'a YAZILAMADI, merge IPTAL: ' +
          String(e.message).slice(0, 160) + '\n')
        process.exit(3)
      }
    }
    // Kapi ve eylem AYNI surecte: kirmizi burada olamaz (yukarida cikildi).
    try {
      // Ilk gercek kosum (#1029) olctu: worktree icinden `--delete-branch` yerel master'i checkout
      // etmeye kalkiyor ve "master is already used by worktree" ile patliyor. Merge uzakta olur:
      // cwd depo DISI (os.tmpdir) + --repo, gh yerel git'e dokunmaz.
      const depo = JSON.parse(gh(['repo', 'view', '--json', 'nameWithOwner'])).nameWithOwner
      const cikti = execFileSync('gh',
        ['pr', 'merge', pr, '--squash', '--delete-branch', '--repo', depo],
        { encoding: 'utf8', cwd: require('os').tmpdir() })
      yaz('MERGE YAPILDI (bu betik, --merge, uzak dal silindi): ' + (cikti.trim().split('\n')[0] || depo + '#' + pr))
      // ⭐GERÇEK MERGE COMMIT'İ AYRICA BASILIR (2026-09-21, iki kez ölçüldü): 1. maddedeki
      // `merge_commit_sha` GitHub'ın birleştirme ÖNİZLEME ref'idir (refs/pull/N/merge) —
      // birleştirmeden ÖNCEKİ sınama commit'i. Squash merge master'da BAŞKA bir commit üretir.
      // #1276'da 2571399f ≠ b26dbce8, #1277'de 38051b8c ≠ 24b0959c; ikisinde de ritüelin
      // çıktısı "merge commit" diye akrana ve karta yanlış SHA taşıttı. Okunamazsa yazılır.
      try {
        const mc = JSON.parse(gh(['pr', 'view', pr, '--repo', depo, '--json', 'mergeCommit'])).mergeCommit
        yaz('MERGE COMMIT (master\'daki gercek commit — 1. maddedeki on-izleme ref\'i DEGIL): ' +
          (mc && mc.oid ? mc.oid.slice(0, 9) : 'OKUNAMADI'))
      } catch (e) {
        yaz('MERGE COMMIT: OKUNAMADI — ' + String(e.message).split('\n')[0].slice(0, 120))
      }
      // ARC-235: PR birleşince kartı kapatmayı tetikleyen adım yoktu. Satır YALNIZ hatırlatır (otomatik Done yok);
      // ayrı try: bu blok patlarsa "gh pr merge BASARISIZ" demesin, merge zaten yapıldı.
      try {
        const govde = JSON.parse(gh(['pr', 'view', pr, '--repo', depo, '--json', 'body'])).body
        for (const s of require(path.join(__dirname, '..', 'board', 'kart-kapat.cjs')).kartKapatSatirlari(pr, govde, depo)) yaz(s)
      } catch (e) {
        yaz('KART KAPAT: OLCEMEDI — ' + String(e.message).split('\n')[0].slice(0, 120) + ' (PR govdesindeki Kanban: satirina elle bak)')
      }
    } catch (e) {
      process.stderr.write('merge-ritueli: kapi YESIL ama gh pr merge BASARISIZ: ' +
        String(e.message).slice(0, 200) + '\n')
      process.exit(3)
    }
    // ANA AĞAÇ İLERİ SARMA (REC-345, karar 44, cetvel §20.2). Kancalar/CLAUDE.md/.mcp.json ana
    // ağaçtan yüklenir; 09-17'de ana ağaç 50 commit gerideydi ve dört merge'lü düzenek hiçbir
    // pencerede etkin değildi. Merge ZATEN yapıldı: buradaki hiçbir sonuç çıkış kodunu değiştirmez,
    // ama sonuç her koşulda GÖRÜNÜR yazılır. Yalnız ff-only; stash/reset/checkout yok.
    try {
      const tazelik = require(path.join(__dirname, 'ana-agac-tazelik.cjs'))
      // ARC-272 (OPS 7 Kasım): ff HER birleştirmeden sonra yapılır, yalnız ayar yoluna değen PR'dan sonra değil. Eskiden
      // belge PR'ında ana ağaç geride kalıyor, ana ağaçtan okunan file_exists kanıtı kartı sahte kırmızıya düşürüyordu (ARC-120).
      // Kirli ağaçta/ff olmazsa ileriSar durur; satır ⚠ ile uyarır, zorlamaz.
      let ayar = false
      try { ayar = tazelik.ayarYolunaDeger(JSON.parse(gh(['pr', 'view', pr, '--json', 'files'])).files.map((f) => f.path)) } catch { /* ipucu yalnız mesajdır */ }
      let fetchTamam = true
      try { git(['fetch', 'origin', 'master', '-q']) } catch { fetchTamam = false }
      // fetch patlarsa bayat origin/master "güncel" dedirtir (ARC-120 deseni): ileri sarma denenmez, ölçülemedi yazılır.
      yaz(fetchTamam
        ? tazelik.anaAgacSatiri(tazelik.ileriSar(tazelik.anaAgacYolu(AGAC)), ayar)
        : '⚠ANA AGAC: OLCEMEDI — fetch basarisiz, ana agac ileri sarilmadi; elle: git fetch + ana-agac-tazelik --ileri-sar (merge etkilenmedi)')
    } catch (e) {
      yaz('⚠ANA AGAC: OLCEMEDI — ' + String((e && e.message) || e).slice(0, 160) + ' (merge etkilenmedi)')
    }
  }
  process.exit(0)
}
