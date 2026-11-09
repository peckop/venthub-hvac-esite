#!/usr/bin/env node
'use strict'

/**
 * DEPARTMAN DEFTER MANİFESTİ — okuyucu, doğrulayıcı, rol kartı satırı (HRT-126, OPS-258).
 *
 * Cetvel: docs/standards/departman-defter-standard.md D6; şema: docs/defter/README.md. Tek liste
 * `docs/defter/manifest.json`; açılış satırı (ARAÇ), PR kapısı (ALTYAPI), rol kartı satırı ve Recep sayfası (HRT-127)
 * aynı dosyayı okur, ikinci liste tutulmaz.
 *
 * Saf işlevler: dosya sistemi `varMi` ile enjekte edilir (test geçici dizin kullanmadan sabote eder). Okunamayan manifest
 * "boş" sayılmaz: `oku` null döner, çağıran karar verir (rol kartı üretici boş satır üretir, test KIRMIZI verir).
 */

const fs = require('node:fs')
const path = require('node:path')

const KOK = path.resolve(__dirname, '..', '..')
const MANIFEST_YOLU = path.join('docs', 'defter', 'manifest.json')

const DURUMLAR = ['planli', 'pilot', 'aktif', 'kontrolsuz', 'emekli']
const TETIKLER = ['kart-kapanisi', 'sure', 'dis-kaynak']
const DIS_KAYNAKLAR = ['gsc', 'unopim', 'design']
/** Rol kartında görünen durumlar: dosyası var ve yaşıyor. `planli` (dosya henüz yok) ve `emekli` görünmez. */
const KARTTA_GORUNEN = ['pilot', 'aktif', 'kontrolsuz']
const KARTTA_EN_COK_AD = 2
const AD_KALIBI = /^[a-z0-9]+(-[a-z0-9]+)*$/
const TAZELIK_UST = 365

/** Manifesti okur; yok ya da bozuksa null (sessizce boş sayılmaz). */
function oku(kok = KOK) {
  try {
    return JSON.parse(fs.readFileSync(path.join(kok, MANIFEST_YOLU), 'utf8'))
  } catch {
    return null
  }
}

/** Glob'un sabit öneki (ilk joker öncesi dizin yolu); joker yoksa yolun kendisi. */
function sabitOnek(yol) {
  const i = yol.search(/[*?[{]/)
  if (i === -1) return { onek: yol, glob: false }
  const dizin = yol.slice(0, i)
  return { onek: dizin.slice(0, dizin.lastIndexOf('/') + 1).replace(/\/$/, ''), glob: true }
}

/** İzlenen yol kuralı: somut dosya ya da dar glob; sabit önek en az iki yol parçası olmalı (`docs/**` geniştir). */
function izlenenSorunu(yol, varMi) {
  if (typeof yol !== 'string' || !yol.trim()) return 'izlenen yol boş ya da metin değil'
  if (yol.startsWith('/') || /^[A-Za-z]:/.test(yol) || yol.includes('..')) return `izlenen yol depo göreli olmalı: ${yol}`
  const { onek, glob } = sabitOnek(yol)
  if (glob && onek.split('/').filter(Boolean).length < 2) return `izlenen glob çok geniş (sabit önek en az iki parça): ${yol}`
  if (!onek || !varMi(onek)) return `izlenen yol depoda yok: ${yol}`
  return null
}

/**
 * Manifest sorunları (boş dizi = temiz). `roller`: geçerli rol kodları, `varMi(depoGöreliYol)`: dosya/dizin var mı.
 * Kuralların hepsi cetvel D2/D6 ve README şemasından gelir.
 */
function sorunlar(manifest, { roller, varMi }) {
  const s = []
  if (!manifest || typeof manifest !== 'object') return ['manifest okunamadı ya da nesne değil']
  if (manifest.sema !== 1) s.push(`sema 1 olmalı (bulundu: ${JSON.stringify(manifest.sema)})`)
  if (!Array.isArray(manifest.defterler)) return [...s, 'defterler dizi olmalı']
  const adlar = new Set()
  const dosyalar = new Set()
  manifest.defterler.forEach((d, i) => {
    const k = `defterler[${i}]${d && d.ad ? ` (${d.ad})` : ''}`
    if (!d || typeof d !== 'object') return void s.push(`${k}: nesne değil`)
    if (typeof d.ad !== 'string' || !AD_KALIBI.test(d.ad)) s.push(`${k}: ad küçük harf/rakam/tire olmalı`)
    else if (adlar.has(d.ad)) s.push(`${k}: ad tekrar ediyor`)
    else adlar.add(d.ad)
    if (typeof d.dosya !== 'string' || !d.dosya.startsWith('docs/') || d.dosya.includes('..')) s.push(`${k}: dosya docs/ altında depo göreli yol olmalı`)
    else {
      if (dosyalar.has(d.dosya)) s.push(`${k}: aynı dosya iki kayıtta (${d.dosya})`)
      dosyalar.add(d.dosya)
      if (d.durum !== 'planli' && !varMi(d.dosya)) s.push(`${k}: dosya yok (${d.dosya}); dosyasız kayıt durum "planli" olmalı`)
    }
    if (typeof d.sahip !== 'string' || !roller.includes(d.sahip)) s.push(`${k}: sahip geçerli bir rol kodu değil (${JSON.stringify(d.sahip)})`)
    if (typeof d.ozet !== 'string' || d.ozet.trim().length < 10) s.push(`${k}: ozet en az bir cümle olmalı`)
    if (!Array.isArray(d.izlenen) || d.izlenen.length === 0) s.push(`${k}: izlenen boş olamaz (PR kapısı bakacak yol bulamaz)`)
    else for (const y of d.izlenen) {
      const e = izlenenSorunu(y, varMi)
      if (e) s.push(`${k}: ${e}`)
    }
    if (!Number.isInteger(d.tazelikGun) || d.tazelikGun < 1 || d.tazelikGun > TAZELIK_UST) s.push(`${k}: tazelikGun 1-${TAZELIK_UST} tam sayı olmalı`)
    if (!Array.isArray(d.tetik) || d.tetik.length < 2 || d.tetik.some((t) => !TETIKLER.includes(t)) || new Set(d.tetik).size !== d.tetik.length) {
      s.push(`${k}: tetik ${TETIKLER.join('/')} değerlerinden en az iki tekil değer olmalı`)
    }
    if (!(d.olcum === null || (typeof d.olcum === 'string' && d.olcum.trim()))) s.push(`${k}: olcum null ya da komut metni olmalı`)
    // ARC-291: kaynakIzi (isteğe bağlı) = ucuz parmak izi komutu; olcum olmadan anlamsız.
    if ('kaynakIzi' in d) {
      if (!(typeof d.kaynakIzi === 'string' && d.kaynakIzi.trim())) s.push(`${k}: kaynakIzi yoksa alan hiç olmamalı, varsa boş olmayan komut metni olmalı`)
      else if (!(typeof d.olcum === 'string' && d.olcum.trim())) s.push(`${k}: kaynakIzi varsa olcum de dolu olmalı (izi olmayan ölçüm yok, ölçümsüz iz anlamsız)`)
    }
    if (!(d.disKaynak === null || DIS_KAYNAKLAR.includes(d.disKaynak))) s.push(`${k}: disKaynak null ya da ${DIS_KAYNAKLAR.join('/')} olmalı`)
    if (!DURUMLAR.includes(d.durum)) s.push(`${k}: durum ${DURUMLAR.join('/')} olmalı`)
    if (d.durum === 'aktif' && !(typeof d.olcum === 'string' && d.olcum.trim())) s.push(`${k}: aktif defterin olcum komutu dolu olmalı`)
    if (d.disKaynak && Array.isArray(d.tetik) && !d.tetik.includes('dis-kaynak')) s.push(`${k}: disKaynak varsa tetik dis-kaynak içermeli`)
  })
  return s
}

/**
 * Rol kartı "Sürekli defterler" bölümü (cetvel D2; tasarım notu §4.2): yalnız o rolün, kartta görünen durumdaki defterleri.
 * En çok iki ad, fazlası "+N"; defteri olmayan rolde boş dize. Açılış özetine GİRMEZ.
 */
function kartBolumu(rol, manifest) {
  const liste = (manifest && Array.isArray(manifest.defterler) ? manifest.defterler : []).filter(
    (d) => d && d.sahip === rol && KARTTA_GORUNEN.includes(d.durum),
  )
  if (!liste.length) return ''
  // Kart baytı dar (en büyük kartta ~12 B pay, URUN'da ~40 B): satır en kısa biçimde, dosya yolu adın kendisinden türer.
  const gorunen = liste.slice(0, KARTTA_EN_COK_AD).map((d) => d.ad)
  const fazla = liste.length - gorunen.length
  // Dosya yolu ve manifest işareti yazılmaz: bölüm başlığı + ad yeter, yol manifestte (cetvel D6). URUN kartında pay 40 B.
  return ['## Sürekli defterler', `- ${gorunen.join(', ')}${fazla > 0 ? ` +${fazla}` : ''}`].join('\n')
}

module.exports = { KOK, MANIFEST_YOLU, DURUMLAR, TETIKLER, DIS_KAYNAKLAR, KARTTA_GORUNEN, KARTTA_EN_COK_AD, oku, sorunlar, izlenenSorunu, kartBolumu }
