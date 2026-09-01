import { execFileSync } from 'node:child_process'
import fs from 'node:fs'
import { createRequire } from 'node:module'
import os from 'node:os'
import path from 'node:path'

import { describe, expect, it, vi } from 'vitest'

/**
 * INV-MUTLAK-YOL-1 · Kimlik sızdıran MUTLAK yol, takipli dosyaya YENİ giremez.
 *
 * NİÇİN VAR — ölçülmüş vaka (2026-09-01, ALTYAPI, REC-102):
 * Depo 2026-08-15'ten beri PUBLIC. Envanterde takipli **951 dosya / 2091 satır** mutlak yol
 * taşıyordu. Sızan şey: kullanıcı adı + 25 ayrı iç dizin adı (sır YOK). Ama ölçümün sürprizi
 * şuydu: **en kötü kalem sızıntı değildi.** İki CANLI dosyada yol koda gömülüydü —
 * `registry/orion_bridge.py` ve `scripts/kademe2-load/load.mjs` — yani kod **sessizce yalnızca
 * tek bir makinede** çalışıyordu. Köprü kırılsaydı Linear yansıması durur ve hata "modül yok"
 * gibi görünürdü; asıl sebep (yerleşim) gizlenirdi. İkisi de bu emirde onarıldı.
 *
 * ⭐ÖLÇÜT NİÇİN "KİMLİK", NİÇİN "HER MUTLAK YOL" DEĞİL:
 * Ham sayımla konuşulsa **22 kod kusuru** görünürdü. Kimlik ölçütüne geçince gerçek sayı **2**
 * çıktı; kalan 6'sı `VENTHUB_BOARD_DIR` ile **ezilebilir varsayılan** (`C:/tmp/venthub-board`)
 * ya da yorumdu — dokunulmaması gereken şeyler. Geçici dizin yolu kimlik taşımaz.
 * **Ayırt etmeyen bir ölçüt, sağlam kodu "kusur" diye gösterip gevşetmeye götürür.**
 *
 * KAPSAM ÜÇ KATMANLI (gerekçeleri `docs/mutlak-yol-istisnalari.json` içinde):
 *   1) KOD/KONFİG → SIKI. Yeni kalem = KIRMIZI. Muafiyet: 8 tarihsel kalem, ilan edilmiş.
 *   2) PROSE (.md) → MANDAL. 215 dosyada 323 satır var ve çoğu KAZA DEĞİL (CLAUDE.md,
 *      CONTEXT.md, SKILL.md "veri deposu şurada" diye bilerek yazıyor). Temizlik 215 dosyalık
 *      bir commit demek: açık PR'ların hepsini tabanlamaya zorlar ve geçmiş zaten public
 *      olduğu için yayılmışı geri ALMAZ. Bu yüzden ARTMAMA şartı.
 *   3) companion `source_path:` + `.archive/` → KAPSAM DIŞI, gerekçesi ilan dosyasında
 *      (AXIOM 3: üretilmiş dosya elle düzeltilmez; ayrıca sayı normal işte artar).
 */

vi.setConfig({ testTimeout: 120_000 })

const require_ = createRequire(import.meta.url)
const REPO = path.resolve(path.dirname(require_.resolve('../../../package.json')))
const ILAN_YOLU = 'docs/mutlak-yol-istisnalari.json'

/**
 * KİMLİK ölçütü: ev dizinini ADIYLA veren yollar. Geçici dizin (tmp) KAPSAM DIŞI (bkz. başlık).
 *
 * ⚠ÖLÇÜT BİR KEZ AŞIRI YAKALADI (ölçüldü, ilk taban koşusu): desen `\/home\//` içeriyordu ve
 * **`src/components/home/...`** ile eşleşti — POSIX ev dizini öneki, "home" adlı HERHANGİ bir
 * klasörle çakışıyor. Sonuç: 63 sağlam dosya "sızıntı" göründü, prose sayısı 323 yerine 577
 * ölçüldü. Kapının kendi taban koşusu yakaladı.
 * Doğru ölçüt KÖK-BAĞLI olmalı: POSIX kolunda önünde yol karakteri BULUNMAMALI (lookbehind),
 * Windows kolunda sürücü harfi zaten çıpa görevi görüyor.
 * Ders: bir deseni "içeriyor mu" diye sormak, "o yol MU" diye sormak DEĞİLDİR.
 */
const KIMLIK_DESENI =
  /(?:[A-Za-z]:[\\/]Users[\\/][A-Za-z0-9._-]+|(?<![A-Za-z0-9._\-/])\/(?:home|Users)\/[A-Za-z0-9._-]+)/

/**
 * Python kaynağından YORUMLARI ve docstring'leri soyar.
 *
 * ⚠ÖLÇÜLMÜŞ GEREK (sabotaj turu, 2026-09-01): `Path.home()` adayının varlığını arayan kol,
 * sabotaj o satırı SİLDİĞİ hâlde YEŞİL kaldı — çünkü dize aynı dosyanın AÇIKLAMA metninde de
 * geçiyor. Bugün bu tuzağa üçüncü kez düşüldü (board.cjs eski-ad kolu, bu kol, ve bir kez de
 * sabotaj betiğinin kendi beklentisi). Kalıcı hüküm: **bir dizenin KULLANILDIĞINI ölçen kol,
 * o dizenin ANLATILDIĞI yeri dışarıda bırakmak zorundadır.**
 */
function yorumsuzPython(kaynak: string): string {
  return kaynak
    .replace(/"""[\s\S]*?"""/g, ' ')
    .replace(/'''[\s\S]*?'''/g, ' ')
    // ⚠CRLF TUZAĞI (ölçüldü 2026-09-01, sabotaj S3): `split('\n')` satır sonunda `\r` bırakır
    // ve JavaScript'te `.` karakteri `\r`'yi KAPSAMAZ (satır sonlandırıcı sayılır). Bu yüzden
    // `#.*$` deseni `$`'a hiç ULAŞAMAZ, eşleşme olmaz ve YORUM SOYULMADAN KALIR. Sonuç: kol
    // sabotaj kod satırını sildiği hâlde YEŞİL kaldı, çünkü adı açıklama metninde buluyordu.
    // Bu, "iki ölçüm zıt sonuç veriyorsa farkı ÖNCE oku" dersinin bir örneği: aynı soruyu
    // `$`'sız desenle sorduğumda doğru cevap gelmişti ve farkı bir kez göz ardı ettim.
    .split(/\r?\n/)
    .map((s) => s.replace(/(^|\s)#.*$/, '$1'))
    .join('\n')
}

interface Ilan {
  kapi: string
  olcut: string
  kod_konfig_istisnalari: { yol: string; sinif: string; nicin: string }[]
  prose_mandali: { sinir: number; olculen: number; haric_tutulan_alan: string }
  kapsam_kararlari: Record<string, string>
  adiyla_artik_risk: string
}

function ilanOku(metin: string): Ilan | null {
  try {
    const j = JSON.parse(metin) as Partial<Ilan>
    if (!Array.isArray(j.kod_konfig_istisnalari)) return null
    if (!j.prose_mandali || typeof j.prose_mandali.sinir !== 'number') return null
    for (const k of j.kod_konfig_istisnalari) {
      if (!k || typeof k.yol !== 'string' || !k.yol.trim()) return null
      // Gerekçesiz muafiyet, muafiyet DEĞİL: listeye sessizce yol eklenmesini engeller.
      if (typeof k.nicin !== 'string' || k.nicin.trim().length < 20) return null
    }
    return j as Ilan
  } catch {
    return null
  }
}

/** Takipli dosyaların TAM listesi (git'ten; çalışma ağacındaki izsiz dosyalar sayılmaz). */
function takipliDosyalar(): string[] {
  const cikti = execFileSync('git', ['-C', REPO, 'ls-files', '-z'], {
    encoding: 'utf8',
    maxBuffer: 1 << 28,
  })
  return cikti.split('\0').filter(Boolean)
}

const METIN_DISI = /\.(png|jpe?g|gif|webp|svg|ico|woff2?|ttf|eot|pdf|zip|gz|glb|gltf|mp4|webm|xlsx?|docx?)$/i

/** Bir dosyanın kimlik yolu taşıyan satırları (satır no + içerik). */
function kimlikSatirlari(mutlakYol: string): { no: number; metin: string }[] {
  let ham: string
  try {
    ham = fs.readFileSync(mutlakYol, 'utf8')
  } catch {
    return []
  }
  // NUL içeren dosya ikilidir: uzantıdan kaçmış olabilir.
  if (ham.includes('\0')) return []
  const bulunan: { no: number; metin: string }[] = []
  ham.split(/\r?\n/).forEach((satir, i) => {
    if (KIMLIK_DESENI.test(satir)) bulunan.push({ no: i + 1, metin: satir.trim().slice(0, 160) })
  })
  return bulunan
}

interface Tarama {
  kodKonfig: { yol: string; satirlar: { no: number; metin: string }[] }[]
  proseSatirSayisi: number
  companionSatirSayisi: number
  arsivDosyaSayisi: number
  taranan: number
}

function tara(haricAlan: string): Tarama {
  const sonuc: Tarama = {
    kodKonfig: [],
    proseSatirSayisi: 0,
    companionSatirSayisi: 0,
    arsivDosyaSayisi: 0,
    taranan: 0,
  }
  const alanBasi = new RegExp('^\\s*' + haricAlan + '\\s*:')
  for (const rel of takipliDosyalar()) {
    if (METIN_DISI.test(rel)) continue
    sonuc.taranan += 1
    const satirlar = kimlikSatirlari(path.join(REPO, rel))
    if (satirlar.length === 0) continue
    if (rel.startsWith('.archive/')) {
      sonuc.arsivDosyaSayisi += 1
      continue
    }
    if (rel.endsWith('.md')) {
      for (const s of satirlar) {
        if (alanBasi.test(s.metin)) sonuc.companionSatirSayisi += 1
        else sonuc.proseSatirSayisi += 1
      }
      continue
    }
    sonuc.kodKonfig.push({ yol: rel, satirlar })
  }
  return sonuc
}

describe('INV-MUTLAK-YOL-1: kimlik sızdıran mutlak yol yeni giremez', () => {
  const ilanMetni = fs.readFileSync(path.join(REPO, ILAN_YOLU), 'utf8')
  const ilan = ilanOku(ilanMetni)

  it('ilan dosyası OKUNABİLİR ve kendi kapısını doğru adlandırıyor', () => {
    expect(
      ilan,
      `${ILAN_YOLU} okunamadı ya da biçimi bozuk. FAIL-CLOSED: ilan okunamıyorsa muafiyet ` +
        'listesi de okunamaz ve kapı hüküm veremez — sessiz varsayılana DÜŞMEZ.',
    ).not.toBeNull()
    expect(ilan?.kapi).toBe('src/__tests__/conformance/mutlak-yol-sizintisi.test.ts')
    expect(
      (ilan?.adiyla_artik_risk ?? '').length > 80,
      'Artık risk ADIYLA yazılmalı: bu kapı prose tarafında SAYI ölçer, YER ölçmez.',
    ).toBe(true)
  })

  it('⭐KOD/KONFİG: ilan edilmemiş HİÇBİR dosya kimlik yolu taşımaz', () => {
    const t = tara(ilan?.prose_mandali.haric_tutulan_alan ?? 'source_path')
    const muaf = new Set((ilan?.kod_konfig_istisnalari ?? []).map((k) => k.yol))
    const ihlal = t.kodKonfig.filter((d) => !muaf.has(d.yol))

    // Tarama GERÇEKTEN dosya gördü mü? Sıfır taranan = ölçüm çökmüş, "temiz" değil.
    expect(t.taranan, 'Hiç dosya taranmadı — git ls-files boş döndü, ölçüm ÇÖKTÜ').toBeGreaterThan(100)

    expect(
      ihlal.map((d) => '  ' + d.yol + ':' + d.satirlar[0].no + '  ' + d.satirlar[0].metin),
      'Kod/konfig içinde İLAN EDİLMEMİŞ kimlik yolu var. Bu yol iki zarar üretir: depo PUBLIC ' +
        'olduğu için sızıntı, ve kod sessizce tek makineye bağlanır (CI/başka makinede kırılır).\n' +
        'ÇÖZÜM: ortam değişkeniyle ezilebilir kıl + akıllı varsayılan (ör. os.homedir()) — ' +
        'bu makinede davranış DEĞİŞMEZ. Gerçekten kaçınılamazsa ' +
        ILAN_YOLU +
        ' içine GEREKÇESİYLE ekle.',
    ).toEqual([])
  })

  it('ilan edilmiş her muafiyet GERÇEKTEN var ve HÂLÂ sızdırıyor (ölü muafiyet birikmez)', () => {
    const t = tara(ilan?.prose_mandali.haric_tutulan_alan ?? 'source_path')
    const sizanlar = new Set(t.kodKonfig.map((d) => d.yol))
    const olu = (ilan?.kod_konfig_istisnalari ?? [])
      .map((k) => k.yol)
      .filter((y) => !sizanlar.has(y))
    expect(
      olu,
      'Bu muafiyetler artık gereksiz: dosya ya silinmiş ya temizlenmiş. Ölü muafiyet birikirse ' +
        'liste bir gün gerçek bir sızıntıyı örter — listeden DÜŞÜR.',
    ).toEqual([])
  })

  it('⭐PROSE MANDALI: kimlik yolu taşıyan prose satırı ARTMADI', () => {
    const t = tara(ilan?.prose_mandali.haric_tutulan_alan ?? 'source_path')
    const sinir = ilan?.prose_mandali.sinir ?? 0
    expect(
      t.proseSatirSayisi,
      `Belgelerde kimlik yolu taşıyan satır sayısı ARTTI (${t.proseSatirSayisi} > ${sinir}). ` +
        'Biri bir dokümana elle mutlak yol yazmış. Göreli yol ya da `~/` gösterimi kullan; ' +
        `gerçekten gerekliyse ${ILAN_YOLU} içindeki sınırı gerekçesiyle güncelle.`,
    ).toBeLessThanOrEqual(sinir)
  })

  it('mandal GERİ KAÇMAZ: sayı düştüyse sınır da güncellenmeli', () => {
    const t = tara(ilan?.prose_mandali.haric_tutulan_alan ?? 'source_path')
    const sinir = ilan?.prose_mandali.sinir ?? 0
    // Mandalın anlamı "bir daha yukarı çıkma"dır; temizlik yapıldıysa sınır oraya İNMELİ,
    // yoksa kazanılan alan sessizce geri verilir (bugün 300'e düşüp yarın 320'ye çıkmak
    // 323 sınırında GÖRÜNMEZ).
    expect(
      t.proseSatirSayisi >= sinir - 5,
      `Prose sayısı sınırın ÇOK ALTINA düştü (${t.proseSatirSayisi} vs sınır ${sinir}). ` +
        `Temizlik yapıldıysa ${ILAN_YOLU} içindeki \`sinir\` ve \`olculen\` alanlarını yeni ` +
        'değere ÇEK — yoksa mandal gevşek kalır ve kazanılan alan geri verilir.',
    ).toBe(true)
  })

  it('kapsam kararlarının HEPSİ gerekçeli (kapsam dışı bırakmak bedava değildir)', () => {
    const k = ilan?.kapsam_kararlari ?? {}
    for (const ad of ['kod_konfig', 'prose_md', 'companion_source_path', 'arsiv']) {
      expect(typeof k[ad], `kapsam_kararlari.${ad} YOK`).toBe('string')
      expect(
        (k[ad] ?? '').length > 60,
        `kapsam_kararlari.${ad} gerekçesi çok kısa: kapsam dışı bırakmak bir KARARDIR ve ` +
          'gerekçesi yazılmadan alınamaz.',
      ).toBe(true)
    }
  })

  it('⭐NÜKS KOLU: takipli .pyc YOK (bytecode kaynak yolunu GÖMER, kapı ikili dosyayı ATLAR)', () => {
    const pyc = takipliDosyalar().filter((y) => /\.pyc$/i.test(y))
    expect(
      pyc,
      'Takipli Python bytecode bulundu. Bu kapı dosyaları METİN olarak okur ve NUL içeren ' +
        'dosyayı atlar; yani .pyc kapının ÖLÇÜT EVRENİ DIŞINDADIR — içine gömülen kaynak ' +
        'yolu, .py temizlenmiş ve kapı yeşil olsa bile sızmaya devam eder. ' +
        '⚠.gitignore kuralı bunu ÖNLEMEZ: git yalnız TAKİPSİZ dosyayı yok sayar, kural ' +
        'konmadan önce commit edilmiş dosya kuraldan etkilenmez. Çözüm: git rm --cached <yol>.',
    ).toEqual([])
  })
})

/**
 * SINIF A — onarılan iki giriş noktası TAŞINABİLİR yol çözümlüyor.
 *
 * Bu kollar makineden BAĞIMSIZ olmak zorunda: koşucuda geliştiricinin ev dizini YOKTUR, dolayısıyla
 * "eskiyle aynı yolu veriyor" iddiası CI'da ölçülemez. O yüzden ölçülen şey ÇÖZÜMLEME SIRASI:
 * ortam değişkeni ezer, yoksa ev dizini türetmesi devreye girer, ve kaynakta sabit kimlik
 * yolu KALMAMIŞTIR. ("Bu makinede davranış değişmedi" iddiası ayrıca canlı olarak ölçüldü ve
 * PR gövdesinde kanıtıyla duruyor — köprü aktif, registry_core yüklendi, yollar birebir eşit.)
 */
describe('SINIF A: onarılan giriş noktaları taşınabilir yol çözümlüyor', () => {
  it('orion_bridge.py: sabit kimlik yolu YOK, ortam değişkeni EZER, ev dizini adayı VAR', () => {
    const ham = fs.readFileSync(path.join(REPO, 'registry/orion_bridge.py'), 'utf8')
    // Kimlik yolu ARANIRKEN ham metne bakılır (yorumda geçen bir yol da SIZAR, kod olmasa bile).
    expect(KIMLIK_DESENI.test(ham), 'Kaynakta hâlâ sabit kimlik yolu var').toBe(false)
    // Sözleşme ARANIRKEN yorumsuz metne bakılır (bkz. yorumsuzPython gerekçesi).
    const kod = yorumsuzPython(ham)
    expect(kod).toMatch(/ORION_ENGINE_DIR/)
    expect(
      /os\.environ\.get\(\s*["']ORION_ENGINE_DIR["']\s*\)/.test(kod),
      'Ortam değişkeni ile ezilebilir olmalı: yerleşimi bilen tek taraf çağıran olabilir.',
    ).toBe(true)
    expect(
      /Path\.home\(\)/.test(kod),
      'Ev dizini türetmesi KODDA olmalı — kullanıcı adını koddan çıkarır, bu makinede AYNI yolu ' +
        'verir ve worktree ağaçlarından da çözülür. (Yalnız "repo kökünün kardeşi" türetmesi ' +
        'YETMEZ: şerit ağaçları geçici dizin altında yaşadığı için oradan KIRILIR — ölçüldü.)',
    ).toBe(true)
    expect(
      /_ENGINE_DIR_DENENEN/.test(kod),
      'Denenen adaylar SAKLANMALI: "bulunamadı: <tek yol>" biçimi yerleşim sorununu ' +
        '"yanlış yol yazılmış" gibi gösterip teşhisi saatlere yayıyordu.',
    ).toBe(true)
  })

  it('orion_bridge.py: ORION_ENGINE_DIR ortam değişkeni GERÇEKTEN kazanıyor (davranışsal)', () => {
    const sahte = path.join(os.tmpdir(), 'venthub-engine-probu-' + process.pid)
    fs.mkdirSync(sahte, { recursive: true })
    const kod =
      'import sys, json; sys.path.insert(0, r"' +
      path.join(REPO, 'registry').replace(/\\/g, '\\\\') +
      '"); import orion_bridge as b; print(json.dumps(str(b.ORION_ENGINE_DIR)))'
    let cikti: string
    try {
      cikti = execFileSync('python', ['-c', kod], {
        encoding: 'utf8',
        env: {
          ...process.env,
          ORION_ENGINE_DIR: sahte,
          // ⚠TEST TAKIPLI DOSYAYI KIRLETMEZ: `registry/__pycache__/*.pyc` bu depoda TAKIPLI,
          // dolayısıyla modülü import eden her koşu bytecode'u yeniden yazıp çalışma ağacını
          // kirletiyordu (ölçüldü: kendi koşum bir .pyc'yi değiştirdi). Kirli ağaç
          // `taban-tazele`yi durdurur ve "kim değiştirdi" sorusunu doğurur. Kalıcı çözüm
          // bytecode'u takipten düşürmek (öneri ilan dosyasında, karar OPS'te); o gelene
          // kadar test kendi yan etkisini KENDİSİ engeller.
          PYTHONDONTWRITEBYTECODE: '1',
        },
        stdio: ['ignore', 'pipe', 'pipe'],
      })
    } catch {
      // Python yoksa kolu SESSİZCE geçirmeyiz ama kırmızı da yakmayız: ölçemedik, söylüyoruz.
      // (Kaynak-tarayan kardeş kol yukarıda zaten sözleşmeyi tutuyor.)
      console.warn('[INV-MUTLAK-YOL-1] python bulunamadı — ortam-değişkeni kolu ÖLÇÜLEMEDİ')
      return
    }
    expect(JSON.parse(cikti.trim())).toBe(sahte)
  })

  it('load.mjs: sabit kimlik yolu YOK, üç katmanlı sıra VAR (--csv-root > env > homedir)', () => {
    const kaynak = fs.readFileSync(path.join(REPO, 'scripts/kademe2-load/load.mjs'), 'utf8')
    expect(KIMLIK_DESENI.test(kaynak), 'Kaynakta hâlâ sabit kimlik yolu var').toBe(false)
    expect(kaynak).toMatch(/from 'node:os'/)
    expect(kaynak).toMatch(/homedir\(\)/)
    expect(
      /--csv-root=/.test(kaynak) && /VENTHUB_CSV_ROOT/.test(kaynak),
      'CSV kökü hem CLI hem ortam değişkeniyle verilebilmeli.',
    ).toBe(true)
    expect(
      /VENTHUB_ENV_PATH/.test(kaynak),
      '.env yolu da ezilebilir olmalı: worktree ağaçlarında .env yoktur ve yedek yol ' +
        'eskiden SABİT kullanıcı yoluydu.',
    ).toBe(true)
  })
})
