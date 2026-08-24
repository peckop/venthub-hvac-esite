'use strict'

/**
 * .claude/hooks/bash-write-targets.cjs — bir Bash komutundan YAZMA HEDEFLERİNİ çıkarır.
 *
 * NİÇİN VAR — ölçülmüş kusur (2026-08-23; URUN buldu, OPS iş emri verdi, ALTYAPI ölçtü):
 * `lane-guard.cjs` ve `protect-config.cjs` PreToolUse kancaları `matcher: "Edit|Write|MultiEdit"`
 * ile bağlıydı. Bash ile yazılan dosya HİÇBİR kapıdan geçmiyordu. Üstelik "auto mode" talimatı
 * herkese açıkça "dosyaları sed/heredoc ile düzenle, Edit yerine Bash kullan" diyor — yani kapı,
 * en çok kullanılan yolda kapalı değil YOK'tu. URUN'un cümlesiyle: bu bir kapı değil, bir tavsiye.
 *
 * ÜÇ KOLLU ÖLÇÜM (kapının kendisine sentetik yük verilerek koşuldu):
 *   Edit + başka şeridin dosyası -> exit 2 BLOKLANDI   (kapı görüyor)
 *   Bash + aynı dosyaya sed -i   -> exit 0 GEÇTİ       (kusur)
 *   Edit + kendi dosyam          -> exit 0 GEÇTİ       (kapı vacuous değil)
 *
 * KUSUR İKİ KATMANLI — ve ikincisi sahte-yeşil üretir:
 *   (a) matcher'da Bash yok;
 *   (b) kancalar `tool_input.file_path` okuyor, Bash yükünde o alan YOK. Yani matcher'a yalnızca
 *       "Bash" eklemek hiçbir şeyi değiştirmez: kanca sessizce exit 0 döner ve kapı KURULMUŞ SANILIR.
 *
 * SINIRINI ADIYLA YAZIYORUM — bu modül deliği KAPATMAZ, DARALTIR:
 * Bir komut metni yalnızca kendi gösterdiği kadarını ele verir. `node betik.cjs` biçimindeki bir
 * çağrının içindeki yazma STATİK OLARAK GÖRÜLEMEZ. Mekanik güvenceyi PostToolUse'taki "git status
 * ile claim dışı değişiklik" alarmı taşır; burası ön eleme katmanıdır. Bunu yazıyorum çünkü
 * "kapıyı Bash'e de bağladım" cümlesi, vermediği bir güvenceyi verdiğini sandırır.
 */

/** Yazma hedefi sayılmayan yollar — bunları bloklamak filoyu durdurur ve hiçbir şey korumaz. */
const HEDEF_SAYILMAZ = new Set(['/dev/null', '/dev/stdout', '/dev/stderr', 'nul', 'NUL', '&1', '&2'])

/** Komut metninde "burada bir yazma var" diyen imzalar (yorumlayıcı gövdeleri için). */
const YAZMA_IMZASI =
  /writeFileSync|appendFileSync|createWriteStream|copyFileSync|renameSync|unlinkSync|rmSync|mkdirSync|\.write\s*\(|open\s*\([^)]*['"][wa]/

/** Kabuk sözcüklerine ayırır; tırnak içindeki boşlukları BÖLMEZ. */
function parcala(segment) {
  const tokenlar = []
  let cari = ''
  let tirnak = null
  for (const ch of String(segment)) {
    if (tirnak) {
      if (ch === tirnak) tirnak = null
      else cari += ch
      continue
    }
    if (ch === '"' || ch === "'") {
      tirnak = ch
      continue
    }
    if (/\s/.test(ch)) {
      if (cari) {
        tokenlar.push(cari)
        cari = ''
      }
      continue
    }
    cari += ch
  }
  if (cari) tokenlar.push(cari)
  return tokenlar
}

/**
 * Komutu segmentlere böler. Heredoc varsa BÖLMEZ: heredoc gövdesindeki `;` ve `|` kabuk ayracı
 * değildir; bölmek yanlış segment üretir ve yanlış karar doğurur.
 */
function segmentle(komut) {
  const k = String(komut)
  if (k.includes('<<')) return { segmentler: [k], heredoc: true }
  return { segmentler: k.split(/&&|\|\||[;\n|]/).filter((s) => s.trim()), heredoc: false }
}

const bayrakMi = (t) => t.startsWith('-')

/** `>`, `>>`, `1>`, `2>>` biçimlerinin hedefi. `2>&1` akış birleştirmesidir, hedef değildir. */
function yonlendirmeHedefleri(tokenlar) {
  const bulunan = []
  for (let i = 0; i < tokenlar.length; i++) {
    const m = /^\d*>>?(.*)$/.exec(tokenlar[i])
    if (!m) continue
    if (m[1]) bulunan.push(m[1])
    else if (tokenlar[i + 1]) {
      bulunan.push(tokenlar[i + 1])
      i++
    }
  }
  return bulunan
}

/**
 * @returns {{yazmaVar:boolean, hedefler:string[], cozulemeyen:string[], sebepler:string[]}}
 *   yazmaVar    : komutta yazma KALIBI görüldü mü (okuma komutlarında daima false)
 *   hedefler    : statik olarak çıkarılabilen yollar
 *   cozulemeyen : yazma var ama hedef çıkarılamadı — çağıran taraf FAIL-CLOSED davranmalı
 */
function yazmaHedefleri(komut) {
  const hedefler = []
  const cozulemeyen = []
  const sebepler = []
  let yazmaVar = false

  const { segmentler, heredoc } = segmentle(komut)

  for (const segment of segmentler) {
    const tokenlar = parcala(segment)
    if (!tokenlar.length) continue

    const komutAdi = (tokenlar[0].split(/[\\/]/).pop() || '').toLowerCase()
    const digerleri = tokenlar.slice(1)
    const bayraksiz = digerleri.filter((t) => !bayrakMi(t) && !/^\d*>>?/.test(t))

    const ekle = (yol, sebep) => {
      yazmaVar = true
      sebepler.push(sebep)
      const temiz = String(yol).trim()
      if (!temiz || HEDEF_SAYILMAZ.has(temiz)) return
      hedefler.push(temiz)
    }
    const cozulemedi = (sebep) => {
      yazmaVar = true
      sebepler.push(sebep)
      cozulemeyen.push(segment.trim())
    }

    for (const y of yonlendirmeHedefleri(tokenlar)) ekle(y, 'yonlendirme')

    if (komutAdi === 'sed' && digerleri.some((t) => t === '-i' || t.startsWith('-i') || t === '--in-place')) {
      // sed -i <script> <dosya...> — ilk bayraksız token script, kalanı dosyadır.
      if (bayraksiz.length < 2) cozulemedi('sed -i hedefi cikarilamadi')
      else bayraksiz.slice(1).forEach((y) => ekle(y, 'sed -i'))
    } else if (komutAdi === 'tee') {
      if (!bayraksiz.length) cozulemedi('tee hedefi cikarilamadi')
      else bayraksiz.forEach((y) => ekle(y, 'tee'))
    } else if (komutAdi === 'cp' || komutAdi === 'mv') {
      if (bayraksiz.length >= 2) ekle(bayraksiz[bayraksiz.length - 1], komutAdi)
      else if (bayraksiz.length) cozulemedi(komutAdi + ' hedefi cikarilamadi')
    } else if (komutAdi === 'dd') {
      const of = digerleri.find((t) => t.startsWith('of='))
      if (of) ekle(of.slice(3), 'dd of=')
    } else if (komutAdi === 'truncate') {
      bayraksiz.forEach((y) => ekle(y, 'truncate'))
    } else if (komutAdi === 'rm') {
      // Silme de yazmadır: başka şeridin dosyasını silmek, ona yazmaktan beterdir.
      if (!bayraksiz.length) cozulemedi('rm hedefi cikarilamadi')
      else bayraksiz.forEach((y) => ekle(y, 'rm'))
    } else if (komutAdi === 'git') {
      const ayrac = digerleri.indexOf('--')
      if (digerleri[0] === 'checkout' && ayrac > -1) {
        digerleri.slice(ayrac + 1).forEach((y) => ekle(y, 'git checkout --'))
      } else if (digerleri[0] === 'restore') {
        digerleri
          .slice(1)
          .filter((t) => !bayrakMi(t))
          .forEach((y) => ekle(y, 'git restore'))
      }
    } else if (/^(node|python|python3|perl|ruby|pwsh|powershell)$/.test(komutAdi)) {
      const satirIci = digerleri.some((t) => t === '-e' || t === '-c' || t === '-Command')
      if ((satirIci || heredoc) && YAZMA_IMZASI.test(segment)) {
        // Gövdedeki yol çoğu zaman değişken/ifadedir — statik çıkarım YAPILAMAZ, TAHMİN EDİLMEZ.
        cozulemedi('yorumlayici govdesinde yazma')
      }
    }
  }

  // Heredoc gövdesi bir dosyaya akıtılıyorsa yönlendirme kolu zaten yakalar; yakalamadıysa
  // ve gövdede yazma imzası varsa çözülemeyen sayılır — sessizce geçirmeyiz.
  if (heredoc && YAZMA_IMZASI.test(komut) && !cozulemeyen.length && !hedefler.length) {
    yazmaVar = true
    sebepler.push('heredoc govdesinde yazma')
    cozulemeyen.push(String(komut).trim())
  }

  return { yazmaVar, hedefler, cozulemeyen, sebepler }
}

module.exports = { yazmaHedefleri, parcala, segmentle, YAZMA_IMZASI, HEDEF_SAYILMAZ }
