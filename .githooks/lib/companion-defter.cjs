#!/usr/bin/env node
'use strict'

/**
 * `.githooks/lib/companion-defter.cjs` — companion üretiminin BAŞARISIZLIĞINI kalıcı kaydeder.
 *
 * ⭐NİÇİN VAR — ölçülmüş üç katmanlı sessizlik (2026-08-31, REC-67):
 *
 * Companion üreteci 2026-08-28'de durdu (model sağlayıcının anahtarı 401 verdi ve havuzdan
 * KALICI olarak elendi). Üç gün fark edilmedi. Sebebi tek bir arıza değil, üç bağımsız
 * görünürlük kusuruydu — üçü de ölçüldü:
 *
 *   1. `doc batch` ÇIKIŞ KODU 0 döner ve `"status": "SUCCESS"` basar, AYNI ÇIKTIDA
 *      `Basarili: 0, Basarisiz: 1` yazarken. Yani çağıran, çıkış kodundan arızayı GÖREMEZ.
 *   2. `.git/orion-doc.log` her commit'te SIFIRLANIYORDU (`: > log`) → başarısız commit'in
 *      kanıtı bir SONRAKİ commit tarafından yok ediliyordu.
 *   3. ⭐Bu iş için YAZILMIŞ koruma YANLIŞ YOLDAYDI: orion'da `orion-belgesiz.jsonl` defteri
 *      ve *"Bu, taşıyıcısız geçen N. commit"* sayacı VAR — ama yalnız `run_hook` komutunda
 *      (`orion/cli/commands/doc.py:654,777`). `post-commit` ise `batch` çağırıyor ve `batch`
 *      gövdesinde o iki çağrıya SIFIR referans var. Ölçüldü: defter dosyası HİÇBİR ağaçta
 *      yok — yani koruma HİÇ KOŞMADI. Geçiş (`run-hook` → `batch`) yapılırken görünürlük
 *      mekanizması eski yolda kaldı. ("Mekanizma var, çağrı yoluna bağlanmamış" sınıfı.)
 *
 * ⚠BU BETİK ÜRETİMİ GERİ GETİRMEZ. Taşıyıcı KAPALI ve bu **Recep'in kararı** (2026-08-31):
 * Haiku taşıyıcısı yeni anahtar gerektirmiyor ama onun aboneliğini harcıyor, açma kararı onun
 * ve *"kapalı kalsın"* dedi. Yani companion bayatlığı artık **bilinen ve kabul edilmiş eksik**.
 * Bu betiğin tek işi o eksiği **SESSİZ OLMAKTAN** çıkarmak.
 *
 * ⭐DEFTER ADI VE ŞEMASI ORION'UNKİYLE AYNI, BİLEREK: `orion-belgesiz.jsonl`,
 * `{ts, dosya, sebep}`. Yeni bir ad seçmek, orion'un ölü yolu bir gün canlanırsa İKİ AYRI
 * defter üretirdi ve sayaç ikiye bölünürdü. Aynı adı kullanmak kayıtları birleştirir.
 *
 * KULLANIM: `doc batch` çıktısı stdin'den verilir.
 *   node companion-defter.cjs --git-dir <yol> --dosya <sayi>
 * Çıkış kodu DAİMA 0: bu bir kapı değil, bir KAYITÇI. Commit'i bloklamak bu betiğin işi değil.
 */

const fs = require('fs')
const path = require('path')

const DEFTER_ADI = 'orion-belgesiz.jsonl'

/** Ledger'ı şişirmemek için: aynı sebep art arda yazılır ama satır sayısı sınırsız değil. */
const AZAMI_SATIR = 2000

function bayrak(ad, varsayilan) {
  const i = process.argv.indexOf('--' + ad)
  return i > -1 && process.argv[i + 1] ? process.argv[i + 1] : varsayilan
}

/**
 * Çıktıyı SEBEBE çevirir.
 *
 * ⭐SIRA ÖNEMLİ ve FAIL-CLOSED: en belirleyici sebep önce aranır, ve hiçbiri eşleşmezse
 * "başarılı" VARSAYILMAZ. Sessizlik başarı kanıtı değildir — bu deponun tekrar tekrar
 * ödediği ders. Yalnız ÇIKTIDA AÇIKÇA `Basarisiz: 0` görülürse başarı sayılır.
 *
 * @returns {{sebep: string|null, ayrinti: string}} sebep null ise KAYIT YAZILMAZ (başarı).
 */
function sinifla(cikti) {
  const s = String(cikti || '')

  if (!s.trim()) {
    // Boş çıktı: üreteç hiç konuşmadıysa ne olduğunu BİLMİYORUZ.
    return { sebep: 'olculemedi', ayrinti: 'cikti bos' }
  }
  if (/TASIYICI YOK|ANAHTAR HAVUZU BOS/i.test(s)) {
    const uc = (s.match(/uc\s*:\s*(\S+)/i) || [])[1] || ''
    return { sebep: 'tasiyici-yok', ayrinti: uc ? 'uc=' + uc : 'anahtar havuzu bos' }
  }
  const basarisiz = (s.match(/Basarisiz:\s*(\d+)/i) || [])[1]
  if (basarisiz && Number(basarisiz) > 0) {
    return { sebep: 'uretim-basarisiz', ayrinti: 'basarisiz=' + basarisiz }
  }
  if (/Skipping write/i.test(s)) {
    return { sebep: 'yazma-atlandi', ayrinti: 'kalite kontrolu gecmedi' }
  }
  if (/Basarisiz:\s*0/i.test(s)) return { sebep: null, ayrinti: '' }

  // Buraya düşmek = çıktı var ama TANIDIK BİR SONUÇ SATIRI YOK. Başarı SAYMIYORUZ.
  return { sebep: 'olculemedi', ayrinti: 'tanidik sonuc satiri yok' }
}

/** Defteri okur; bozuk satırları ATLAR ama SAYAR (sessiz veri kaybı olmasın). */
function defterOku(yol) {
  try {
    const satirlar = fs.readFileSync(yol, 'utf8').split(/\r?\n/).filter((x) => x.trim())
    const kayitlar = []
    let bozuk = 0
    for (const s of satirlar) {
      try {
        kayitlar.push(JSON.parse(s))
      } catch {
        bozuk++
      }
    }
    return { kayitlar, bozuk }
  } catch {
    return { kayitlar: [], bozuk: 0 }
  }
}

function main() {
  const gitDir = bayrak('git-dir', '')
  const dosya = Number(bayrak('dosya', '0')) || 0
  let cikti = ''
  try {
    cikti = fs.readFileSync(0, 'utf8')
  } catch {
    cikti = ''
  }

  const { sebep, ayrinti } = sinifla(cikti)
  if (!sebep) return // başarılı üretim: defter büyümez, sayaç anlamını korur

  if (!gitDir) {
    console.log('[companion-defter] --git-dir verilmedi, KAYIT YAZILAMADI (sebep: ' + sebep + ')')
    return
  }

  const yol = path.join(gitDir, DEFTER_ADI)
  const kayit = { ts: new Date().toISOString(), dosya, sebep, ayrinti }
  try {
    fs.appendFileSync(yol, JSON.stringify(kayit) + '\n', 'utf8')
  } catch (e) {
    console.log('[companion-defter] defter YAZILAMADI (' + (e && e.code) + ') — sebep: ' + sebep)
    return
  }

  const { kayitlar, bozuk } = defterOku(yol)
  // Budama: en yeni AZAMI_SATIR kaydı tutulur. Sayaç için ilk tarih KORUNUR (aşağıda ilkTs).
  if (kayitlar.length > AZAMI_SATIR) {
    try {
      fs.writeFileSync(yol, kayitlar.slice(-AZAMI_SATIR).map((k) => JSON.stringify(k)).join('\n') + '\n', 'utf8')
    } catch {
      /* budama başarısızsa defter büyür — kayıp değil */
    }
  }

  const ilkTs = String((kayitlar[0] || {}).ts || '').slice(0, 10)
  const tasiyicisiz = kayitlar.filter((k) => k.sebep === 'tasiyici-yok').length
  const dosyaToplam = kayitlar.reduce((a, k) => a + (Number(k.dosya) || 0), 0)

  console.log(
    '[companion-defter] ⚠ COMPANION URETILMEDI — sebep: ' + sebep + (ayrinti ? ' (' + ayrinti + ')' : '') +
      '\n  Bu, belgesiz gecen ' + kayitlar.length + '. commit' + (ilkTs ? ' (ilk: ' + ilkTs + ')' : '') +
      '; bunlarin ' + tasiyicisiz + " tanesi TASIYICISIZLIK." +
      '\n  Toplam belgelenmemis dosya: ' + dosyaToplam +
      (bozuk ? '\n  UYARI: defterde ' + bozuk + ' bozuk satir ATLANDI (sayima girmedi).' : '') +
      '\n  Tasiyici KAPALI ve bu Recep in karari (2026-08-31) — bayatlik BILINEN EKSIK,' +
      '\n  bu kayit onu SESSIZ olmaktan cikarir. Defter: ' + yol,
  )
}

/**
 * ⭐YALNIZ DOĞRUDAN KOŞULDUĞUNDA ÇALIŞIR — ölçülmüş kusur, kendi kapım yakaladı.
 *
 * İlk yazımda `main()` koşulsuz çağrılıyordu. `session-board.cjs` bu modülü `require` edince
 * `main()` de koştu, stdin boş olduğu için "olculemedi" sınıfladı ve **stdout'a** yazdı — yani
 * SessionStart kancasının JSON sözleşmesini BOZDU (`{hookSpecificOutput:…}` yerine önce bu
 * satır düştü ve çıktı ayrıştırılamaz oldu). Kanca sözleşmesi bozulunca bağlam enjeksiyonu
 * BÜTÜNÜYLE kaybolurdu — üstelik sessizce.
 *
 * Bunu yakalayan şey, kolun DAVRANIŞ ölçmesiydi: aynı kolun ilk hâli kaynak metninde dize
 * arıyordu ve bu kusuru göremezdi. Kayıt için: sözleşme bozan hatayı kapı buldu, ben bulmadım.
 */
if (require.main === module) main()

module.exports = { sinifla, defterOku, DEFTER_ADI }
