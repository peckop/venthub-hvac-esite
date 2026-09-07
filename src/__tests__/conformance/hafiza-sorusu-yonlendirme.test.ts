// @vitest-environment node
import { execFileSync } from 'node:child_process'
import fs from 'node:fs'
import path from 'node:path'

import { describe, expect, it } from 'vitest'

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
    ]
    for (const s of sessiz) {
      it(`"${s}" → SESSİZ`, () => {
        expect(kancayiKostur(s), 'kanca gündelik cümlede öttü — her istemde öten kanca görmezden gelinir').toBe('')
      })
    }
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
