import fs from 'node:fs'
import os from 'node:os'
import path from 'node:path'

import { describe, expect, it } from 'vitest'

/**
 * INV-SKILL-CAKISMA-1 — bir skill adı iki kapsamda aynı anda durmamalı.
 *
 * ⭐KUSUR SINIFI (ölçülmüş, REC-314 / 2026-09-14): aynı skill adı HEM depo
 * kapsamında (`.claude/skills`) HEM kullanıcı kapsamında (`~/.claude/skills`)
 * varsa, oturum listesinde YALNIZ BİRİ görünür. Diğeri GÖLGELENİR: dosya
 * yerinde durur, ama yönlendirme onu adıyla seçemez ve kullanım sayacı onu
 * "hiç çağrılmamış" gösterir.
 *
 * Sahadaki ölçüm: diskteki proje skilli **38**, oturuma yüklenen **36**.
 * Fark iki kalem — `_ortak` (SKILL.md'si yok, skill değil) ve `investigate`.
 * `investigate` her iki kapsamda var; `/skill-doctor` onu yalnız
 * `userSettings` kaynağıyla listeliyor (0×, never) ve depo sürümü listede hiç
 * geçmiyor.
 *
 * ⚠NİÇİN BU KAPI ÖNCE GELDİ: "hiç çağrılmamış" listesi, atıl araç temizliğinin
 * girdisi. Gölgelenmiş bir skill o listede "işe yaramaz" gibi görünür, oysa
 * sorun dosyada değil YERLEŞİMDE. Ölçüm evrenini düzeltmeden sökme kararı
 * vermek, yanlış şeyi ölçmek olur. (Aynı sınıf: REC-319'da eval `plugins:`
 * beyanıyla DEPO sürümünü yüklüyordu, gerçek oturumda ise kullanıcı sürümü
 * listeliydi — sınav DOSYAYI ölçer, YERLEŞİMİ ölçmez.)
 *
 * ⛔KAPININ SINIRLARI, ADIYLA:
 *  1. Kullanıcı kapsamı YALNIZ OKUNUR. Bu kapı oraya asla yazmaz.
 *  2. CI'da kullanıcı ağacı YOKTUR → kapı OLCEMEDI der ve GEÇER (fail-open),
 *     gerekçesini stderr'e tek satır yazar. Yani CI'daki yeşili "çakışma yok"
 *     kanıtı DEĞİLDİR; anlamlı olduğu yer yerel geliştirme makinesidir.
 *  3. Çakışma YALNIZ AD üzerinden aranır; içerik benzerliği ölçülmez.
 *  4. `.agent/skills` KAPSAM DIŞI: o ağaç Antigravity/worker tarafıdır, Claude
 *     Code'un sistem istemine hiç girmez ve `~/.claude` ile ad uzayı
 *     paylaşmaz. `.claude` ile `.agent`ta aynı adın bulunması ÇAKIŞMA DEĞİL,
 *     KASITLI çift ağaçtır (CLAUDE.md: "İKİSİ DE AKTİF ve KASITLI").
 *  5. Mutlak yol GÖMÜLMEZ — depo PUBLIC, kullanıcı adı içeren yol kimlik
 *     sızıntısıdır. Yol `CLAUDE_CONFIG_DIR` ya da `os.homedir()` ile türetilir.
 */

const KOK = path.resolve(__dirname, '../../..')
const DEPO_SKILL = path.join(KOK, '.claude', 'skills')
const ILAN_YOLU = path.join(KOK, 'docs', 'skill-ad-cakismasi-ilani.json')

/** Kullanıcı kapsamındaki skill dizini — mutlak yol GÖMÜLMEZ, türetilir. */
function kullaniciSkillDizini(): string {
  const yapilandirma = process.env.CLAUDE_CONFIG_DIR
  if (yapilandirma && yapilandirma.trim()) return path.join(yapilandirma.trim(), 'skills')
  return path.join(os.homedir(), '.claude', 'skills')
}

/**
 * Bir dizinin skill olup olmadığını ÖLÇER: `SKILL.md` var mı?
 *
 * ⭐Alt çizgi kuralına GÜVENİLMEZ. `_ortak` bugün skill değil çünkü içinde
 * `SKILL.md` yok (`bitis-durumu.md` var) — adı alt çizgiyle başladığı için
 * değil. Adlandırma geleneği bir gün değişebilir, ölçüt değişmez.
 */
function skillAdlari(dizin: string): string[] {
  let girdiler: fs.Dirent[]
  try {
    girdiler = fs.readdirSync(dizin, { withFileTypes: true })
  } catch {
    return []
  }
  return girdiler
    .filter((g) => g.isDirectory())
    .map((g) => g.name)
    .filter((ad) => fs.existsSync(path.join(dizin, ad, 'SKILL.md')))
    .sort()
}

type IlanKaydi = { ad: string; golgelenen: string; karar: string; sahibi: string }
type Ilan = { cakismalar: IlanKaydi[] }

function ilaniOku(): Ilan {
  return JSON.parse(fs.readFileSync(ILAN_YOLU, 'utf8')) as Ilan
}

describe('INV-SKILL-CAKISMA-1 — skill adı iki kapsamda aynı anda durmamalı', () => {
  it('ilan dosyası okunabilir ve her kaydı zorunlu alanları taşır', () => {
    const ilan = ilaniOku()
    expect(Array.isArray(ilan.cakismalar)).toBe(true)
    for (const k of ilan.cakismalar) {
      expect(typeof k.ad, `ilan kaydında 'ad' yok: ${JSON.stringify(k)}`).toBe('string')
      expect(k.ad.length).toBeGreaterThan(0)
      // Sahibi ve kararı yazılmayan bir istisna, istisna değil GÖRMEZDEN GELMEDİR.
      expect(k.sahibi, `'${k.ad}' kaydında sahibi yok`).toBeTruthy()
      expect(k.karar, `'${k.ad}' kaydında karar tarafı yok`).toBeTruthy()
    }
  })

  it('depo kapsamındaki her skill dizininin SKILL.md dosyası var (ölçüt: dosya, ad değil)', () => {
    const adlar = skillAdlari(DEPO_SKILL)
    // Bu kol, sayım evrenini sabitler: kapının "depo skilli" saydığı şey budur.
    expect(adlar.length).toBeGreaterThan(0)
    for (const ad of adlar) {
      expect(fs.existsSync(path.join(DEPO_SKILL, ad, 'SKILL.md'))).toBe(true)
    }
  })

  it('İLAN EDİLMEMİŞ ad çakışması YOK (kullanıcı kapsamı okunamazsa OLCEMEDI — fail-open)', () => {
    const kullaniciDizin = kullaniciSkillDizini()

    if (!fs.existsSync(kullaniciDizin)) {
      // ⭐FAIL-OPEN AMA SESSİZ DEĞİL: yokluk, "çakışma yok" kanıtı değildir.
      console.error(
        `[INV-SKILL-CAKISMA-1] OLCEMEDI — kullanici kapsamindaki skill dizini yok, ` +
          `cakisma taramasi KOSULMADI (CI'da beklenen durum). Bu satir yoksa kapi gercekten olctu.`
      )
      return
    }

    const depo = new Set(skillAdlari(DEPO_SKILL))
    const kullanici = skillAdlari(kullaniciDizin)
    const cakisanlar = kullanici.filter((ad) => depo.has(ad)).sort()

    const ilanEdilen = new Set(ilaniOku().cakismalar.map((k) => k.ad))
    const ilansiz = cakisanlar.filter((ad) => !ilanEdilen.has(ad))

    expect(
      ilansiz,
      `İLAN EDİLMEMİŞ ad çakışması: ${ilansiz.join(', ')}\n` +
        `Bu adlar hem .claude/skills hem kullanıcı kapsamında var → biri GÖLGELENİYOR ve ` +
        `atıl listesinde yanlış görünür.\n` +
        `Onarım: adlardan birini değiştir, ya da ölçümü docs/skill-ad-cakismasi-ilani.json'a ` +
        `gerekçesi + sahibi + karar tarafıyla yaz.`
    ).toEqual([])
  })

  it('BAYAT ilan yok — ilan edilen her çakışma gerçekten duruyor (kullanıcı ağacı varsa)', () => {
    const kullaniciDizin = kullaniciSkillDizini()
    if (!fs.existsSync(kullaniciDizin)) {
      console.error(
        `[INV-SKILL-CAKISMA-1] OLCEMEDI — bayatlik kolu kosulmadi (kullanici kapsami yok).`
      )
      return
    }

    const depo = new Set(skillAdlari(DEPO_SKILL))
    const kullanici = new Set(skillAdlari(kullaniciDizin))
    const ilan = ilaniOku().cakismalar.map((k) => k.ad)

    // ⭐Çözülmüş bir çakışmanın ilanda kalması, kapıyı sessizce körleştirir:
    // o ad artık serbest olur ama kapı onu "bilinen istisna" sayıp geçirir.
    const bayat = ilan.filter((ad) => !(depo.has(ad) && kullanici.has(ad)))

    expect(
      bayat,
      `BAYAT ilan kaydı: ${bayat.join(', ')}\n` +
        `Bu adlar artık iki kapsamda birlikte DEĞİL — çakışma çözülmüş. ` +
        `Kaydı ilan dosyasından çıkar, yoksa kapı o ad için kör kalır.`
    ).toEqual([])
  })
})
