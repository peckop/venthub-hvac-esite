#!/usr/bin/env node
/**
 * KÜME MASTER TAZELİK PARİTESİ — INV-DOC-3 v2 (REC-144).
 *
 * NİÇİN VAR — ve niçin selefi ÖLDÜ: INV-DOC-3 v1 (PR #640) *ad paritesi* ölçüyordu:
 * `.cc_docs.yaml`'daki her dosya adı NotebookLM defterinde AYRI kaynak olarak var mı?
 * O evren 2026-08-26'da öldü — yaml'ın kendi notu ("KÜME MASTER'LARI, T020-OR") defterin
 * tekil dosyadan TOPLAYICI master'a geçtiğini yazıyor (96 kaynak → 20). Silahlandırılsaydı
 * 76 SAHTE KIRMIZI verirdi ve hiçbiri gerçek bir eksiklik olmazdı.
 *
 * ⭐ÖLÇÜT KESKİNDİ, EVREN YANLIŞTI. Bu modül evreni düzeltir: soru "dosya defterde mi"
 * değil, **"dosyayı emen küme master, o dosyadan YENİ mi"**.
 *
 * ÖLÇÜLMÜŞ VAKA (2026-09-05, bu modülü doğuran): `docs/standards_master.md` 09-03'te
 * derlenmiş; `docs/standards/work-tracking-ssot-standard.md` 09-04'te değişmiş (#991 —
 * eklenen şey YÜRÜRLÜK NOTU: *"registry değil, LINEAR"*). Sonuç: ikiz o cetveli hâlâ eski
 * hâliyle görüyor ve **iş takibinin nerede yaşadığı sorusuna eski cevabı** veriyor.
 * Ad paritesi bunu göremez, çünkü ad EŞLEŞİYOR; bozuk olan TAZELİK.
 *
 * ⚠BU MODÜL AĞA ÇIKMAZ. Konformans testleri ağ kullanamaz; v1'in dolaylı manifest yolu
 * tam bu yüzden vardı. Burada ağa hiç ihtiyaç yok: hem master hem kaynak DEPODA, ve
 * "hangisi daha yeni" sorusu git'ten deterministik olarak yanıtlanır.
 *
 * ⚠ÖLÇEMEMEK GEÇMEK DEĞİLDİR: yaml ayrıştırılamazsa ya da hiç küme master bulunamazsa
 * bu modül BOŞ SONUÇ DÖNMEZ, HATA fırlatır. Boş bir "bayat yok" cevabı, "her şey taze"
 * yalanıdır ve tam olarak bu ailenin en pahalı hatasıdır.
 */
'use strict'

const { execFileSync } = require('child_process')

/** Windows'ta `origin/master:path` yolunun ezilmemesi için MSYS dönüşümü kapalı. */
function git(args, kok) {
  return execFileSync('git', args, {
    cwd: kok,
    encoding: 'utf8',
    maxBuffer: 64 * 1024 * 1024,
    env: { ...process.env, MSYS_NO_PATHCONV: '1' },
  })
}

/**
 * `.cc_docs.yaml`'ın `extra_masters` bloğunu + ana master'ı okur.
 *
 * NİÇİN YAML AYRIŞTIRICISI YOK: bu depoda aynı dosyayı okuyan iki bekçi zaten var
 * (`doc-scope.cjs`, `companion-sayim.cjs`) ve ikisi de bağımlılık eklemeden satır
 * tarıyor. Üçüncü bir ayrıştırma BİÇİMİ eklemek, "aynı ölçüt iki uygulama" ailesini
 * büyütürdü — bu depoda ölçülmüş bir hata sınıfı (dört ajan, aynı ölçüt, dört ayrı kusur).
 *
 * ⚠BİÇİM DEĞİŞİRSE SESSİZCE BOŞ DÖNMEZ: çağıran taraf `masterlar.length === 0` hâlini
 * KIRMIZI sayar (vacuous-guard). Sessizce boş dönen bir kapsam okuyucusu, kapının
 * kendisini kör eder.
 */
function bildirimiOku(metin) {
  const satirlar = metin.split('\n').map((s) => s.replace(/\r$/, ''))

  const tekil = (anahtar) => {
    const m = new RegExp(`^${anahtar}:\\s*"?([^"\\n]+)"?\\s*$`, 'm').exec(metin)
    return m ? m[1].trim() : null
  }
  const listeAyikla = (ham) => {
    const ic = ham.trim()
    if (ic.startsWith('[')) {
      return ic.slice(1, ic.lastIndexOf(']')).split(',')
        .map((x) => x.trim().replace(/^["']|["']$/g, '')).filter(Boolean)
    }
    const tek = ic.replace(/^["']|["']$/g, '')
    return tek ? [tek] : []
  }

  const masterlar = []
  let i = satirlar.findIndex((s) => /^extra_masters:\s*$/.test(s))
  if (i >= 0) {
    let simdiki = null
    for (i += 1; i < satirlar.length; i++) {
      const s = satirlar[i]
      if (!s.trim()) continue
      if (/^\S/.test(s)) break // blok bitti (girintisiz satır)
      if (s.trim().startsWith('#')) continue
      const yeni = /^\s*-\s*name:\s*"?([^"\n]+)"?\s*$/.exec(s)
      if (yeni) {
        simdiki = { ad: yeni[1].trim(), kaynakDizinleri: [], ekDosyalar: [], cikti: null }
        masterlar.push(simdiki)
        continue
      }
      if (!simdiki) continue
      const sd = /^\s*source_dirs:\s*(.+)$/.exec(s)
      if (sd) { simdiki.kaynakDizinleri = listeAyikla(sd[1]); continue }
      const inc = /^\s*include_files:\s*(.+)$/.exec(s)
      if (inc) { simdiki.ekDosyalar = listeAyikla(inc[1]); continue }
      const out = /^\s*output:\s*"?([^"\n]+)"?\s*$/.exec(s)
      if (out) { simdiki.cikti = out[1].trim() }
    }
  }

  // Ana master ayrı bir anahtarda yaşar (`master_md`) ve kaynağı genel `source_dirs`'tür.
  const anaCikti = tekil('master_md')
  const anaKaynak = (() => {
    const m = /^source_dirs:\s*\[([^\]]*)\]/m.exec(metin)
    return m ? m[1].split(',').map((x) => x.trim().replace(/^["']|["']$/g, '')).filter(Boolean) : []
  })()

  return {
    masterlar,
    anaMaster: anaCikti ? { ad: anaCikti.split('/').pop(), kaynakDizinleri: anaKaynak, ekDosyalar: [], cikti: anaCikti } : null,
  }
}

/**
 * SAF ÇEKİRDEK — git'e DOKUNMAZ, fikstürle beslenir.
 *
 * ⭐NİÇİN SAF: bu kapı BLOKLAMIYOR (K8: toplamalar donduruldu). Bloklamayan bir kolun tek
 * gerçek kanıtı, sayımın AYIRT ETTİĞİdir: bayat bir çift verildiğinde görünmeli, taze
 * verildiğinde görünmemeli. Bunu ancak fikstür verilebilen saf bir fonksiyonda
 * kanıtlayabilirsin. Git okuyan bir fonksiyona fikstür veremezsin — yani kanıt da veremezsin.
 *
 * @param masterlar  [{ad, cikti, kaynakDizinleri, ekDosyalar}]
 * @param masterTarihi   Map<cikti, ISO>   — master en son NE ZAMAN üretildi (commit)
 * @param sonrakiKaynaklar Map<cikti, string[]> — master üretildikten SONRA değişen kaynaklar
 */
function tazelikCekirdegi({ masterlar, masterTarihi, sonrakiKaynaklar }) {
  const bayat = []
  const taze = []
  const ciktisiYok = []

  for (const m of masterlar) {
    const tarih = masterTarihi.get(m.cikti) ?? null
    if (!tarih) { ciktisiYok.push(m.cikti); continue }
    const sonra = sonrakiKaynaklar.get(m.cikti) ?? []
    if (sonra.length > 0) bayat.push({ master: m.cikti, uretildi: tarih, bayatlatan: sonra })
    else taze.push({ master: m.cikti, uretildi: tarih })
  }
  return { bayat, taze, ciktisiYok, toplam: masterlar.length }
}

/** GİT AYAĞI — depo hâlini okur ve saf çekirdeği besler. */
function olc({ kok, ref = 'HEAD' }) {
  const yaml = git(['show', `${ref}:.cc_docs.yaml`], kok)
  const { masterlar, anaMaster } = bildirimiOku(yaml)
  const hepsi = anaMaster ? [anaMaster, ...masterlar] : masterlar

  if (hepsi.length === 0) {
    throw new Error('.cc_docs.yaml okundu ama HIC kume master bulunamadi — bicim degismis olabilir. Bos sonuc DONDURULMUYOR.')
  }

  const masterTarihi = new Map()
  const sonrakiKaynaklar = new Map()

  for (const m of hepsi) {
    let sha = ''
    let tarih = ''
    try {
      const cikti = git(['log', '-1', '--format=%H %cI', '--', m.cikti], kok).trim()
      if (cikti) { sha = cikti.split(' ')[0]; tarih = cikti.split(' ')[1] }
    } catch { /* dosya hic commitlenmemis */ }
    if (!sha) continue
    masterTarihi.set(m.cikti, tarih)

    // Master'ın son üretiminden SONRA, onun emdiği kaynaklarda değişen dosyalar.
    // ⚠`--` sonrası pathspec: dizinler + ADIYLA istenen dosyalar birlikte verilir.
    const yollar = [...m.kaynakDizinleri.filter((d) => d !== '.'), ...m.ekDosyalar]
    if (yollar.length === 0) continue
    let degisenler = []
    try {
      const log = git(['log', `${sha}..HEAD`, '--name-only', '--format=', '--', ...yollar], kok)
      degisenler = [...new Set(log.split('\n').map((s) => s.trim()).filter(Boolean))]
    } catch { /* pathspec bulunamadi */ }
    // Master'ın KENDİSİ kaynak dizininin içindeyse (docs/ altı), onu bayatlatan saymayız.
    sonrakiKaynaklar.set(m.cikti, degisenler.filter((f) => f !== m.cikti && !f.endsWith('_master.md')))
  }

  return { ...tazelikCekirdegi({ masterlar: hepsi, masterTarihi, sonrakiKaynaklar }), bildirilen: hepsi }
}

/** İnsan-okunur rapor — kapı kolunun bastığı metin. */
function rapor(s) {
  const satir = []
  satir.push(`[kume-master] bildirilen master: ${s.toplam} · taze: ${s.taze.length} · BAYAT: ${s.bayat.length}`)
  for (const b of s.bayat) {
    satir.push(`  BAYAT ${b.master} (uretildi ${b.uretildi.slice(0, 10)}) — ${b.bayatlatan.length} kaynak daha yeni:`)
    for (const k of b.bayatlatan.slice(0, 8)) satir.push(`     · ${k}`)
    if (b.bayatlatan.length > 8) satir.push(`     · … (+${b.bayatlatan.length - 8})`)
  }
  if (s.ciktisiYok.length) satir.push(`  ⚠CIKTISI HIC COMMITLENMEMIS: ${s.ciktisiYok.join(', ')}`)
  return satir.join('\n')
}

module.exports = { bildirimiOku, tazelikCekirdegi, olc, rapor }

if (require.main === module) {
  const kok = git(['rev-parse', '--show-toplevel'], process.cwd()).trim()
  process.stdout.write(rapor(olc({ kok })) + '\n')
}
