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
 *     (ölçüldü: `gemini-dispatch`in 7 job'u, `db-advisor`ın 2 job'u).
 *
 * Bu kriterle türetilen küme PR #965'te doğan workflow kapılarının TAM OLARAK aynısı çıktı.
 *
 * ⚠KAPSAM SINIRI, ADIYLA (§21: kabul edilen boşluk SESSİZ olamaz)
 * ===============================================================
 *   · **Vercel kapıları türetilemez** — harici entegrasyondur, hiçbir workflow dosyasında
 *     yoktur. Çekirdeğe KONMAZ; ama görüldüğü hâlde düşerse madde 3 onları sayar.
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
  const kapilar = []
  const sinirlar = []
  for (const f of dosyalar) {
    let metin
    try {
      metin = fs.readFileSync(path.join(dizin, f), 'utf8')
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

// ─────────────────────────────────────────────────────────────────────────────
// DEĞERLENDİRME — saf: ölçülmüş girdiler → beş madde. Ağ/disk YOK, fikstür kurulabilir.
// ─────────────────────────────────────────────────────────────────────────────

/**
 * @param {{pv:object|null, pvHata?:string, kapilar:Array<{name:string,bucket:string}>|null,
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
  const metin = String(ham).trim()
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

  // 3
  if (kapilar === null) {
    ekle(3, 'DUSEN 0 VE BEKLEYEN 0', false, 'kapi tablosu OKUNAMADI')
  } else {
    const dusen = kapilar.filter((c) => DUSEN_KOVALARI.includes(c.bucket))
    const bekleyen = kapilar.filter((c) => BEKLEYEN_KOVALARI.includes(c.bucket))
    if (dusen.length || bekleyen.length) {
      ekle(3, 'DUSEN 0 VE BEKLEYEN 0', false,
        'dusen ' + dusen.length + ' [' + dusen.map((c) => c.name).join(',') + '] · bekleyen ' +
        bekleyen.length + ' [' + bekleyen.map((c) => c.name).join(',') + ']')
    } else {
      ekle(3, 'DUSEN 0 VE BEKLEYEN 0', true, 'skipping DUSEN sayilmadi')
    }
  }

  // 4
  if (pv.mergeable !== 'MERGEABLE' || !['CLEAN', 'BLOCKED'].includes(pv.mergeStateStatus)) {
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
      'state=' + pv.mergeStateStatus + ', sha ' + String(girdi.uzakSha).slice(0, 8) + ' eslesiyor')
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
  } else if (girdi.onay !== undefined && girdi.onay !== null) {
    // Migration YOKKEN onay: kapiyi acmaz (zaten acik), ama SESSIZ de gecmez — gereksiz onay,
    // "onay aliskanligi" doguracak ilk adimdir ve bir sonraki sefer migration'li PR'da refleks olur.
    ekle(5, 'MIGRATION 0', true, '⚠--onay GEREKSIZ verildi: migration 0, acilacak kapi yok')
  } else {
    ekle(5, 'MIGRATION 0', true)
  }

  return { maddeler, kirmizi: maddeler.filter((m) => !m.gecti).length }
}

module.exports = {
  turetCekirdek, workflowCoz, degerlendir, onayGecerli,
  DUSEN_KOVALARI, BEKLEYEN_KOVALARI, ONAY_ASGARI,
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
      '  --onay  : migration\'li PR\'da madde 5\'i acar. Metin RECEP\'IN KENDI SOZU olmali\n' +
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
  const git = (args) => execFileSync('git', ['-C', AGAC, ...args], { encoding: 'utf8' }).trim()
  const gh = (args) => execFileSync('gh', args, { encoding: 'utf8', cwd: AGAC })
  const yaz = (s) => process.stdout.write(s + '\n')

  yaz('== MERGE RITUELI — PR #' + pr + ' / ' + dal + ' ==')

  try { git(['fetch', 'origin', 'master', '-q']) } catch { yaz('  ⚠fetch basarisiz — olcum BAYAT olabilir') }

  let pv = null
  let pvHata
  try {
    pv = JSON.parse(gh(['pr', 'view', pr, '--json', 'mergeable,mergeStateStatus,headRefOid,state']))
  } catch (e) { pvHata = String(e.message).slice(0, 120) }

  let kapilar = null
  try { kapilar = JSON.parse(gh(['pr', 'checks', pr, '--json', 'name,bucket'])) } catch { kapilar = null }

  // Birleşme ref'inin VARLIĞI yalnız REST'ten okunur (§20 dersi 3 + 2026-09-04 ölçümü).
  let mergeCommitSha = null
  try {
    const depo = JSON.parse(gh(['repo', 'view', '--json', 'nameWithOwner'])).nameWithOwner
    const rest = JSON.parse(gh(['api', 'repos/' + depo + '/pulls/' + pr]))
    mergeCommitSha = rest.merge_commit_sha === null || rest.merge_commit_sha === undefined
      ? '' : String(rest.merge_commit_sha)
  } catch { mergeCommitSha = null }

  const { kapilar: cekirdek, sinirlar, okunanDosya } = turetCekirdek(AGAC)

  let uzakSha = null
  try { uzakSha = git(['rev-parse', 'origin/' + dal]) } catch { uzakSha = null }

  let migrationlar = null
  try {
    migrationlar = git(['diff', '--name-only', 'origin/master...origin/' + dal, '--', 'supabase/migrations/'])
      .split('\n').filter(Boolean)
  } catch { migrationlar = null }

  yaz('  turetme: ' + okunanDosya + ' workflow okundu, zorunlu cekirdek ' + cekirdek.length +
    ' kapi: ' + (cekirdek.join(', ') || '(BOS)'))
  // §21: kabul edilen boşluk SESSİZ olamaz.
  yaz('  ⚠sinir : Vercel kapilari harici entegrasyon — TURETILEMEZ, cekirdege konmaz ' +
    '(gorulup duserse madde 3 sayar).')
  for (const s of sinirlar) yaz('  ⚠sinir : ' + s)

  const { maddeler, kirmizi } = degerlendir({
    pv, pvHata, kapilar, cekirdek, uzakSha, migrationlar, mergeCommitSha, onay: ONAY,
  })
  for (const m of maddeler) {
    yaz((m.gecti ? '  YESIL   ' : '  ⛔KIRMIZI ') + m.no + '. ' + m.ad + (m.detay ? '  — ' + m.detay : ''))
  }

  try {
    const geride = git(['rev-list', '--count', 'origin/' + dal + '..origin/master'])
    yaz('  bilgi   geride ' + geride + ' commit' + (geride !== '0' ? '  ⚠taban tazelemesi gerekebilir' : ''))
  } catch { /* bilgi satırı, ölçüt değil */ }

  yaz('')
  yaz(kirmizi === 0
    ? 'SONUC: YESIL — bes madde saglandi, self-merge serbest.'
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
    if (onayGecerli(ONAY).gecerli && migrationlar && migrationlar.length) {
      try {
        gh(['pr', 'comment', pr, '--body',
          'MIGRATION ONAYI (merge-ritueli.cjs --onay) — ' + migrationlar.length +
          ' migration bu PR ile prod\'a OTOMATIK uygulanacak (kural 13).\n\n> ' + ONAY +
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
    } catch (e) {
      process.stderr.write('merge-ritueli: kapi YESIL ama gh pr merge BASARISIZ: ' +
        String(e.message).slice(0, 200) + '\n')
      process.exit(3)
    }
  }
  process.exit(0)
}
