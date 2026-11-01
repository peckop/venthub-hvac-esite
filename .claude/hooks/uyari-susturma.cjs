#!/usr/bin/env node
'use strict'

/**
 * AÇILIŞ SATIRLARI SUSTURMA (ARC-220, OPS-181, karar 420 — Recep 26-27 Ekim: "ilgisiz uyarı dikkati düşürüyor").
 *
 * Genel durum satırları (BAGIMLILIK, TABAN, BELGE, WRONGSTACK, KAYIT, BAGLAM, SAGE-YAZIM...) her mesajda aynı
 * şeyi söylüyordu. Bu yardımcı satırı, o PENCERENİN (oturumun) son gördüğü durumdan FARKLIYSA bir kez geçirir; aynı durum
 * tekrar etmez. Durum normale dönüp yeniden bozulursa satır tekrar konuşur (kayıt yalnız o an görünen anahtarları tutar).
 *
 * ⛔KAPSAM SINIRI: yalnız BİLGİ satırları süzülür. Eşikler ve kapılar DEĞİŞMEZ: satırı üreten kanca eşiği aynen hesaplar,
 * bu yardımcı yalnız "bu pencere bu durumu zaten gördü mü" diye bakar. Engelleyen kapılar (deny) bu yoldan geçmez.
 * ⛔FAIL-OPEN: kayıt okunamaz/yazılamazsa hepsi basılır (sessiz kaybolmaktan iyi). Oturum kimliği yoksa (elle koşu, test) süzme YOK.
 * ⛔COMPACT: metinde "compact sonrasi" varsa pencere önceki bağlamı kaybetmiştir; kayıt silinir ve hepsi yeniden basılır.
 * Ayrıca kayıt 6 saatte bir kendini yeniler (uzun oturumda unutulmuş satır geri gelsin).
 *
 * İmza: satırın ⚠/⛔ işareti ve metni; oynak miktarlar çıkarılır ("11 gun", "184 MB", "18:37Z"). SAYI_YOK anahtarlarında
 * (sayaç ağırlıklı satırlar) tüm rakamlar çıkarılır: "9 → 10 yeni kayıt" yeni durum değildir.
 */

const fs = require('fs')
const path = require('path')

const YENILEME_MS = 6 * 3600 * 1000
const SAYI_YOK = new Set(['SAGE-YAZIM', 'BAGLAM', 'PANO'])

/** "  ONARIM:" gibi girintili devam satırları önceki satıra bağlanır. */
function grupla(metin) {
  const gruplar = []
  for (const s of String(metin).split('\n')) {
    if (s === '') continue
    if (/^\s/.test(s) && gruplar.length > 0) gruplar[gruplar.length - 1].push(s)
    else gruplar.push([s])
  }
  return gruplar
}

function anahtarVeImza(satir) {
  const isaret = (/^(⚠|⛔)+/.exec(satir) || [''])[0]
  const govde = satir.slice(isaret.length)
  const anahtar = govde.split(':')[0].trim().slice(0, 40)
  let imza = govde
  if (SAYI_YOK.has(anahtar)) imza = imza.replace(/\d+/g, '#')
  else imza = imza.replace(/\d+(?:[.,]\d+)?\s*(?:gun|dk|saat|MB|GB|k\/\d+M)\b/gi, '#').replace(/\b\d{1,2}:\d{2}Z?\b/g, '#')
  return { anahtar, imza: isaret + imza }
}

/**
 * @param {string} metin kancanın bastığı tüm çıktı
 * @param {string} sid oturum kimliği
 * @param {string} pano kayıt klasörü (dışarıda, depoya yazılmaz)
 * @param {number} [simdi]
 * @param {string} [ad] kayıt adı (kanca başına ayrı)
 * @returns {string} basılacak metin
 */
function suz(metin, sid, pano, simdi = Date.now(), ad = 'ana') {
  const kimlik = String(sid || '').replace(/[^0-9a-z-]/gi, '').slice(0, 40)
  if (!kimlik || !pano || !metin) return metin
  // Her kanca kendi kayıt adıyla yazar: biri ötekinin anahtarlarını silip satırını geri getirmesin.
  const yol = path.join(pano, '.uyari-gosterildi.' + String(ad).replace(/[^0-9a-z-]/gi, '') + '.' + kimlik + '.json')
  let kayit = {}
  let t0 = simdi
  try {
    const j = JSON.parse(fs.readFileSync(yol, 'utf8'))
    if (j && typeof j === 'object' && !Array.isArray(j) && j.t && simdi - j.t < YENILEME_MS && j.k && typeof j.k === 'object') {
      kayit = j.k
      t0 = j.t
    }
  } catch {
    /* kayıt yok ya da bozuk: hepsi basılır */
  }
  const gruplar = grupla(metin)
  const compactSonrasi = /compact sonrasi/.test(metin)
  if (compactSonrasi) kayit = {}
  const yeni = {}
  const bas = []
  for (const g of gruplar) {
    const { anahtar, imza } = anahtarVeImza(g[0])
    yeni[anahtar] = imza
    if (kayit[anahtar] !== imza) bas.push(g.join('\n'))
  }
  try {
    fs.mkdirSync(pano, { recursive: true })
    fs.writeFileSync(yol, JSON.stringify({ t: t0, k: yeni }))
  } catch {
    /* yazılamadı: bir sonraki mesajda yeniden basılır */
  }
  return bas.length ? bas.join('\n') + '\n' : ''
}

module.exports = { suz, grupla, anahtarVeImza, YENILEME_MS }
