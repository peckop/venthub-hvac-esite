// @vitest-environment node
import { execFileSync } from 'node:child_process'
import fs from 'node:fs'
import os from 'node:os'
import path from 'node:path'

import { afterAll, beforeAll, describe, expect, it } from 'vitest'

/**
 * INV-HAFIZA-SORUSU — `.claude/hooks/hafiza-sorusu-yonlendirme.cjs`
 *
 * NİÇİN VAR: "bunu konuşmuş muyduk / ne karar vermiştik" sorusunun doğru cevabı ÖLÇMEKTİR;
 * yapılan ise sık sık bağlamdan cevap vermek oldu ve bağlam compact'le kırpıldığı için cevap
 * eksik çıktı (2026-09-04'te aynı gün üç kez).
 *
 * ⭐BU KAPININ İKİ İŞİ VAR ve ikincisi daha kolay kaçar:
 *   1. Kanca EŞLEŞMELİ (soru geldiğinde adresi hatırlatsın).
 *   2. Kanca EŞLEŞMEMELİ (gündelik cümlede ötmesin) — çünkü her istemde öten bir kanca
 *      üç günde görmezden gelinir ve o andan sonra VAR ama YOK sayılır.
 */

const KOK = process.cwd()
const KANCA = path.join(KOK, '.claude', 'hooks', 'hafiza-sorusu-yonlendirme.cjs')

function kancayiKostur(prompt: string): string {
  const cikti = execFileSync(process.execPath, [KANCA], {
    input: JSON.stringify({ session_id: 'aaaaaaaa-1111-4111-8111-111111111111', prompt }),
    encoding: 'utf8',
    stdio: ['pipe', 'pipe', 'pipe'],
  })
  if (!cikti.trim()) return ''
  const j = JSON.parse(cikti) as { hookSpecificOutput?: { additionalContext?: string } }
  return j.hookSpecificOutput?.additionalContext ?? ''
}

describe('INV-HAFIZA-SORUSU: hafıza sorusu ADRESE yönlendirilir, cevap ÜRETİLMEZ', () => {
  it('kanca dosyası VAR (kapı kör koşmasın)', () => {
    expect(fs.existsSync(KANCA)).toBe(true)
  })

  describe('EŞLEŞMELİ — karar/geçmiş soruları', () => {
    const sorular = [
      'bunu konuşmuş muyduk?',
      'dün ne karar vermiştik bu konuda',
      'hatırlıyor musun sepeti niye kapatmıştık',
      'nerede kalmıştık?',
      'bu kural nereden geliyor',
      'niçin böyle karar aldık',
      'neden böyle yaptık',
      'bunu daha önce konuşmuştuk',
      'önce söylemiştin bunu',
    ]
    for (const s of sorular) {
      it(`"${s}" → yönlendirme`, () => {
        const c = kancayiKostur(s)
        expect(c, 'kanca sessiz kaldı — hafıza sorusu bağlamdan cevaplanır').toContain('HAFIZA SORUSU ALGILANDI')
        expect(c, 'takip defterinin adresi verilmemiş').toContain('a5f382a4')
        // ⭐Sıra söylenmeli: defter → Linear → kod. "Deftere bak" tek başına yetmez,
        // çünkü defter snapshot'tır ve drift eder; hangi kaynağın kazandığı yazılı olmalı.
        expect(c, 'çelişki hâlinde hangi kaynağın kazandığı yazılmamış').toMatch(/KOD\/KAYIT kazanır|kod\/kayıt kazanır/i)
      })
    }
  })

  describe('EŞLEŞMEMELİ — gündelik cümle (kanca ötmemeli)', () => {
    const sessiz = [
      'bu testi çalıştır',
      'geçen dosyayı aç',
      'önce build al sonra deploy et',
      'PR açabilir misin',
      'hatırlatıcı kur',
      'merge içeren her şekilde bana gelecek zaten',
      // 2026-09-25 yanlış alarmları: hata ayıklama ve talimat cümleleri (boş seçenekli kalıp)
      'neden böyle olmuş, test niye kırmızı',
      'neden böyle bir hata veriyor',
      'önce karar metnini oku sonra yaz',
      'önce konuşalım sonra karar veririz',
    ]
    for (const s of sessiz) {
      it(`"${s}" → SESSİZ`, () => {
        expect(kancayiKostur(s), 'kanca gündelik cümlede öttü — her istemde öten kanca görmezden gelinir').toBe('')
      })
    }
  })

  it('makine mesajı taranmaz: alt ajan bildirimi ve oturumlar arası mesaj içinde kalıp olsa da SESSİZ', () => {
    expect(kancayiKostur('<task-notification>\nRapor: bunu konuşmuş muyduk diye sordum, neden böyle yaptık\n</task-notification>')).toBe('')
    expect(kancayiKostur('<cross-session-message from="x">OPS: daha önce konuşmuştuk</cross-session-message>')).toBe('')
  })

  it('KOD sorusu ayrı sınıf: CodeGraph önce, takip defteri DEĞİL', () => {
    const c = kancayiKostur('bu fonksiyonu hangi dosya çağırıyor')
    expect(c).toContain('KOD/YAPI')
    expect(c, 'kod sorusu CodeGraph yerine deftere yönlendirilmiş').toContain('CodeGraph')
  })

  it('KANCA AĞ ÇAĞRISI YAPMAZ — yalnız metin üretir', () => {
    // Ölçüt: kaynakta ağ/komut koşturma izi olmasın. Bir kanca her isteme binerse
    // gecikmesi ve hata yüzeyi de her isteme biner.
    const kaynak = fs.readFileSync(KANCA, 'utf8')
    for (const yasak of ['execFileSync', 'execSync', 'spawn', 'fetch(', 'http']) {
      expect(kaynak.includes(yasak), `kanca ${yasak} kullanıyor — her isteme gecikme ve hata yüzeyi biner`).toBe(false)
    }
  })

  it('CEVAP ÜRETMEZ, KAYNAK İSTER: "bilmiyorum, bakıyorum" hükmü metinde', () => {
    const c = kancayiKostur('bunu konuşmuş muyduk')
    expect(c, 'ölçemediğinde ne diyeceği yazılmamış — uydurulmuş geçmiş kaynaksızlıktan kötüdür').toMatch(/bilmiyorum, bak[iı]yorum/i)
  })
})

/**
 * ÖLÇÜM DEFTERİ ESLEMESİ (Recep 2026-09-29): konu istemde geçince kanca defterin yolunu söyler.
 * Kapı üç şeyi kilitler: (1) doğru konu doğru deftere eşleşir, (2) gündelik cümlede (özellikle
 * `git checkout`) ötmez, (3) defter dosyası yoksa SESSİZ KALMAZ. Gerçek dosya sistemi geçici
 * klasörde kurulur; ne depo ne gerçek hafıza klasörü okunur.
 */
describe('INV-HAFIZA-SORUSU: ölçüm defteri eşlemesi', () => {
  let kok = ''
  let depo = ''
  let proje = ''

  const DEFTERLER = [
    'e-fatura-muhasebe-erp.md',
    'crm-erp-alan-kararlari.md',
    'admin-panel-altyapisi.md',
    'pim-unopim.md',
    'satis-hazirligi.md',
  ]

  beforeAll(() => {
    kok = fs.mkdtempSync(path.join(os.tmpdir(), 'olcum-defteri-'))
    depo = path.join(kok, 'depo')
    proje = path.join(kok, 'proje')
    fs.mkdirSync(path.join(proje, 'memory', 'olcum'), { recursive: true })
    fs.mkdirSync(path.join(depo, 'docs', 'olcum'), { recursive: true })
    // Beş defterin dördü hafıza klasöründe, biri (pim) yalnız depoda: iki yolun ikisi de denenir.
    for (const d of DEFTERLER) {
      if (d === 'pim-unopim.md') fs.writeFileSync(path.join(depo, 'docs', 'olcum', d), '# pim\n')
      else if (d !== 'satis-hazirligi.md') fs.writeFileSync(path.join(proje, 'memory', 'olcum', d), '# defter\n')
    }
    // satis-hazirligi.md İKİ YERDE DE YOK: adı eşleşip dosya bulunamama kolunu sınar.
  })

  afterAll(() => {
    fs.rmSync(kok, { recursive: true, force: true })
  })

  function kostur(prompt: string): string {
    const cikti = execFileSync(process.execPath, [KANCA], {
      input: JSON.stringify({
        session_id: 'aaaaaaaa-1111-4111-8111-111111111111',
        prompt,
        transcript_path: path.join(proje, 'aaaaaaaa-1111-4111-8111-111111111111.jsonl'),
      }),
      encoding: 'utf8',
      stdio: ['pipe', 'pipe', 'pipe'],
      env: { ...process.env, CLAUDE_PROJECT_DIR: depo },
    })
    if (!cikti.trim()) return ''
    const j = JSON.parse(cikti) as { hookSpecificOutput?: { additionalContext?: string } }
    return j.hookSpecificOutput?.additionalContext ?? ''
  }

  const eslesen: Array<[string, string]> = [
    ['e-fatura zorunlu mu bize', 'e-fatura-muhasebe-erp.md'],
    ['e-arşiv entegratörü seçelim', 'e-fatura-muhasebe-erp.md'],
    ['Paraşüt ile ön muhasebe olur mu', 'e-fatura-muhasebe-erp.md'],
    ['ERP kuralım mı', 'e-fatura-muhasebe-erp.md'],
    ['CRM modülünü konuşalım', 'crm-erp-alan-kararlari.md'],
    ['satınalma ve stok modülü nasıl olacak', 'crm-erp-alan-kararlari.md'],
    ['admin panel için Refine mı shadcn mi', 'admin-panel-altyapisi.md'],
    ['tablo kütüphanesi seçimi', 'admin-panel-altyapisi.md'],
    ['UnoPIM durumu ne', 'pim-unopim.md'],
    ['Akeneo alternatif mi', 'pim-unopim.md'],
  ]
  for (const [istem, dosya] of eslesen) {
    it(`"${istem}" → ${dosya}`, () => {
      const c = kostur(istem)
      expect(c, 'kanca ölçüm defterini söylemedi — konu yeniden ölçülür').toContain('ÖLÇÜM DEFTERİ VAR')
      expect(c).toContain(dosya)
      expect(c, 'yeniden ölçme şartı yazılmamış').toContain('yeniden ölçme yalnız tetikleyici oluşunca')
    })
  }

  it('YOL: hafıza klasöründeki defter da, depodaki (docs/olcum) defter da bulunur', () => {
    const duz = (p: string) => p.split(path.sep).join('/')
    expect(kostur('CRM modülünü konuşalım')).toContain(duz(path.join(proje, 'memory', 'olcum')))
    expect(kostur('UnoPIM durumu ne')).toContain(duz(path.join(depo, 'docs', 'olcum')))
  })

  it('İKİ konu tek satırda: "ERP modül" hem e-fatura hem CRM defterini verir', () => {
    const c = kostur('ERP modül seçimi')
    const satirlar = c.split('\n').filter((s) => s.startsWith('ÖLÇÜM DEFTERİ VAR'))
    expect(satirlar, 'iki defter tek satırda olmalı').toHaveLength(1)
    expect(satirlar[0]).toContain('e-fatura-muhasebe-erp.md')
    expect(satirlar[0]).toContain('crm-erp-alan-kararlari.md')
  })

  it('DOSYA YOK: adı eşleşip defter bulunamazsa SESSİZ KALMAZ, eksik dosyayı söyler', () => {
    const c = kostur('satış hazırlığı nerede')
    expect(c).toContain('DOSYA BULUNAMADI')
    expect(c).toContain('satis-hazirligi.md')
    expect(c, 'bulunamayan defter "VAR" diye söylenmiş').not.toContain('ÖLÇÜM DEFTERİ VAR')
  })

  describe('SESSİZ — gündelik cümle', () => {
    const sessiz = [
      'git checkout ile dala geç',
      'checkout yap ve pull et',
      'refine et bu metni',
      'pim yok, sanırım yazım hatası bile değil', // "pim" küçük harf ama tek başına kelime: kalıp KASITLI büyük/küçük duyarsız
      'PR açabilir misin',
      'bu testi çalıştır',
    ]
    for (const s of sessiz) {
      it(`"${s}"`, () => {
        // "pim" kalıbı büyük/küçük duyarsız; bu satır o kararı kilitler: ötmesi KABUL, sessizlik beklenmez.
        if (s.startsWith('pim yok')) {
          expect(kostur(s)).toContain('pim-unopim.md')
          return
        }
        expect(kostur(s), 'kanca gündelik cümlede öttü').toBe('')
      })
    }
  })

  it('makine mesajı taranmaz: oturumlar arası mesajdaki e-fatura sözü ölçüm defterini tetiklemez', () => {
    expect(kostur('<cross-session-message from="x">OPS: e-fatura ve CRM konuları</cross-session-message>')).toBe('')
  })

  it('hem hafıza sorusu hem ölçüm defteri: iki çıktı BİRLİKTE gelir, defter satırı başta', () => {
    const c = kostur('e-fatura konusunu daha önce konuşmuştuk')
    expect(c.split('\n')[0]).toContain('ÖLÇÜM DEFTERİ VAR')
    expect(c).toContain('HAFIZA SORUSU ALGILANDI')
  })
})
