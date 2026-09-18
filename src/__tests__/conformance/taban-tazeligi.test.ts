import { execFileSync } from 'node:child_process'
import fs from 'node:fs'
import path from 'node:path'

import { describe, expect, it } from 'vitest'

/**
 * INV-TABAN-TAZE-1 — şema TABANI, onaylanmış son migration'dan geri kalmamalı.
 *
 * ⭐NİÇİN VAR (Recep, 2026-09-16): *"bende DB'de değişiklik yaptığım an senin kendi yedeğin
 * bayat olacak; tekrardan onu tazelemek yine 2 gün mü sürecek?"*
 *
 * Cevabın ölçülmüş hâli: tazelemek **iki gün DEĞİL** — döküm CI'da 57 saniyede alınıyor
 * (koşum 34950954930). İki gün süren şey KEŞİFTİ: hangi dosyanın taban olduğunu bulmak,
 * birinin KISMİ olduğunu görmek, gölge kümeyi elle kurmak. O keşif bir kez yapıldı.
 *
 * ⛔EKSİK OLAN ŞEY ÖLÇÜM DEĞİL, **ALARM**: bugüne kadar tabanın bayatladığını söyleyen
 * hiçbir şey yoktu. Fark edildiği gün yeniden keşfe başlanır ve **o zaman** gerçekten iki gün
 * gider. Bu kapı o alarmdır.
 *
 * ⭐OLCUT REPO ICINDE, SIR GEREKTIRMEZ — ve bu Recep'in kendi düzeltmesinden çıktı:
 * *"ben kendim bir müdahale ile yapmıyorum, size yaptırıyorum ve gerekirse migration onayı
 * veriyorum."* Yani DB'ye giden her değişiklik **onaylanmış bir migration dosyasıdır**. O
 * zaman bayatlık sorusu tamamen dosya adlarından cevaplanır: **en yeni migration damgası,
 * tabanın tarihinden yeni mi?** Ne bağlantı, ne şifre, ne ağ.
 *
 * ⚠BU KAPININ GÖRMEDİĞİ ŞEY, ADIYLA: bir migration merge edilip **canlıya uygulanmamış**
 * olabilir — 2026-09-15'te ölçüldü: `20250919_fts_search_products.sql` beş indeks yaratıyor,
 * canlıda yalnız ikisi var ve hiçbir kapı görmemişti. Yani dosya tarihi "uygulandı" demek
 * değildir. O eksiği kapatan şey **sayarak doğrulama**dır (canlı sayım ↔ taban sayımı) ve o
 * AYRI bir adımdır (`db-advisor.yml` hattı). Bu kapı yalnız "taban geride mi" der.
 *
 * Cetvel: `supabase/baselines/README.md` (hangi dosya nedir) ·
 * `docs/standards/ledger-ve-olu-migration-standard.md`.
 */

const KOK = path.resolve(__dirname, '..', '..', '..')
const TABAN_DIZIN = path.join(KOK, 'supabase', 'baselines')
const MIGRATION_DIZIN = path.join(KOK, 'supabase', 'migrations')
const README = path.join(TABAN_DIZIN, 'README.md')

/**
 * ⭐TAM/KISMİ AYRIMI ÖLÇÜLMÜŞ BİR ÖLÇÜTLE YAPILIR, DOSYA ADIYLA DEĞİL.
 *
 * README'nin kendi dersi: *"en yeni dosya bir seçim kuralı değildir."* 2026-09-14'te bu klasörden
 * en yeni dosya alınıp taban sanıldı; o dosya `pg_dump` değildi. Ölçülmüş ayırt edici: **tam
 * döküm RLS politikası taşır** (2026-06-12 → 101, 2026-09-15 → 163), kısmi olan **taşımaz**
 * (2026-08-13 → 0).
 */
const POLITIKA_DESENI = /create\s+policy/i

interface Taban {
  dosya: string
  tarih: string
  politika: number
  tam: boolean
}

function tabanlariTopla(): Taban[] {
  if (!fs.existsSync(TABAN_DIZIN)) return []
  return fs
    .readdirSync(TABAN_DIZIN)
    .filter((d) => /^\d{4}-\d{2}-\d{2}_public_schema\.sql$/.test(d))
    .map((dosya) => {
      const ham = fs.readFileSync(path.join(TABAN_DIZIN, dosya), 'utf8')
      const politika = (ham.match(new RegExp(POLITIKA_DESENI.source, 'gi')) ?? []).length
      return {
        dosya,
        tarih: dosya.slice(0, 10),
        politika,
        tam: politika > 0,
      }
    })
    .sort((a, b) => a.tarih.localeCompare(b.tarih))
}

/**
 * Migration damgası → `YYYY-MM-DD`.
 *
 * ⭐SAHADA **ÜÇ** BİÇİM VAR ve bunu bu kapı YAZILIRKEN ölçtüm (2026-09-16):
 * · **14 hane** `YYYYMMDDHHMMSS_` — CLAUDE.md'nin istediği kanonik biçim
 * · **12 hane** `YYYYMMDDHHMM_` — **13 dosya** (`202508240001_enable_pgcrypto.sql` … )
 * · **8 hane** `YYYYMMDD_` — tarihsel
 *
 * İlk yazdığımda yalnız 14 ve 8'i tanıyordum; 12 haneli **13 dosya sessizce karşılaştırmadan
 * düşüyordu** ve kapı yanlış yeşil verecekti. "Damga biçimi sessizce değişemez" kolu bunu
 * yakaladı — kol kendi yazarını yakaladı.
 *
 * ⛔BU FONKSİYON BİÇİMİ ONAYLAMAZ, yalnız TARİHİ okur. Biçim kuralı (14 hane zorunlu) başka
 * bir kapıda: `INV-MIGRATION-2`. Burada 12/8 haneliyi ayrıştırmak "biçim serbest" demek
 * değildir — tarihini okuyamazsam dosya bayatlık ölçümünden düşer, ki o daha kötüdür.
 */
function migrationTarihi(dosya: string): string | null {
  const m = /^(\d{8})(\d{4}|\d{6})?_/.exec(dosya)
  if (!m) return null
  const g = m[1]
  return `${g.slice(0, 4)}-${g.slice(4, 6)}-${g.slice(6, 8)}`
}

function migrationlariTopla(): Array<{ dosya: string; tarih: string }> {
  if (!fs.existsSync(MIGRATION_DIZIN)) return []
  const out: Array<{ dosya: string; tarih: string }> = []
  for (const dosya of fs.readdirSync(MIGRATION_DIZIN)) {
    if (!dosya.endsWith('.sql')) continue
    const tarih = migrationTarihi(dosya)
    if (tarih) out.push({ dosya, tarih })
  }
  return out.sort((a, b) => a.dosya.localeCompare(b.dosya))
}

describe('INV-TABAN-TAZE-1 · sema tabani son migration dan geri kalmaz', () => {
  const tabanlar = tabanlariTopla()
  const tamTabanlar = tabanlar.filter((t) => t.tam)
  const enYeniTaban = tamTabanlar.at(-1)
  const migrationlar = migrationlariTopla()

  it('OLCEMEDI ≠ TAZE: taban ve migration EVRENI bos olamaz', () => {
    expect(fs.existsSync(TABAN_DIZIN), `taban dizini YOK: ${TABAN_DIZIN}`).toBe(true)
    expect(
      tabanlar.length,
      'hic taban dosyasi bulunamadi — kapi KOR kosuyor, yesili anlamsiz',
    ).toBeGreaterThan(0)
    expect(
      tamTabanlar.length,
      'TAM taban yok (hicbir dosyada create policy gecmiyor) — ' +
        'ya klasor bos ya olcut bozuldu. Ikisi de "taze" DEMEK DEGIL.',
    ).toBeGreaterThan(0)
    expect(
      migrationlar.length,
      'hic migration bulunamadi — damga bicimi degistiyse bu kapi sessizce yesile doner',
    ).toBeGreaterThan(0)
  })

  it('⭐KISMI DOSYA TABAN SAYILMAZ (2026-09-14 hatasi kapiya yazildi)', () => {
    const kismi = tabanlar.filter((t) => !t.tam)
    // Kismi dosya VAR olabilir (tarihsel kayit); olmamasi gereken sey onun SECILMESI.
    for (const k of kismi) {
      expect(
        enYeniTaban?.dosya,
        `KISMI dosya taban olarak secildi: ${k.dosya} (create policy = 0). ` +
          `README'nin kendi dersi: "en yeni dosya bir secim kurali degildir".`,
      ).not.toBe(k.dosya)
    }
    expect(enYeniTaban?.politika ?? 0, 'secilen taban politika tasimiyor').toBeGreaterThan(0)
  })

  it('TAZELIK: en yeni migration damgasi, TABAN tarihinden YENI OLAMAZ', () => {
    const tabanTarih = enYeniTaban!.tarih
    /**
     * ⭐DALIN KENDİ MIGRATION'I SAYILMAZ (REC-351 hükmü (a), 2026-09-18'de uygulandı).
     *
     * Ölçülmüş tasarım kusuru: taban ancak migration prod'a UYGULANDIKTAN sonra tazelenebilir
     * (README Yol A: dökümü CI canlıdan alır). Dolayısıyla migration içeren HER PR kendi kapısını
     * kırmızı yapıyordu — 09-17'de karar 40, 09-18'de URUN'un karar 45 PR'ı aynı yere takıldı ve
     * tek çıkış yolu ya kapıyı görmezden gelmek ya tabanı elle uydurmaktı; ikisi de kapının
     * anlamını öldürür.
     *
     * Kural: `origin/master` ile birleşme tabanından SONRA bu dalda EKLENEN (ve çalışma ağacında
     * henüz commit edilmemiş) migration'lar sayılmaz. Master'a inince aynı dosyalar sayılır ve
     * taban tazelenmezse kapı yine kırmızıdır — yani alarm kaybolmuyor, PR'dan master'a ÖTELENİYOR.
     * Git okunamazsa HİÇBİR ŞEY dışlanmaz (fail-closed): ölçemediğimizde taze saymayız.
     */
    const git = (...a: string[]) =>
      execFileSync('git', a, { cwd: KOK, encoding: 'utf8', timeout: 20000, stdio: ['ignore', 'pipe', 'pipe'] })
    let dalinKendisi: string[] = []
    try {
      const taban = git('merge-base', 'HEAD', 'origin/master').trim()
      const eklenen = git('diff', '--name-only', '--diff-filter=A', taban, '--', 'supabase/migrations')
      // ⚠Commit edilmemiş dosya da dalın kendisidir: `git diff` izlenmeyeni görmez ve ilk sürüm
      // tam bu yüzden yine kırmızı verdi (2026-09-18). CI'da bu küme boştur.
      const calisma = git('status', '--porcelain', '--', 'supabase/migrations')
      dalinKendisi = Array.from(
        new Set(
          [
            ...eklenen.split('\n').map((s) => s.trim()),
            ...calisma
              .split('\n')
              .map((s) => s.trim())
              .filter((s) => /^(\?\?|A |AM|M )/.test(s))
              .map((s) => s.replace(/^\S+\s+/, '')),
          ]
            .filter(Boolean)
            .map((s) => s.split('/').pop() as string),
        ),
      )
    } catch {
      dalinKendisi = []
      console.warn('[INV-TABAN-TAZE-1] git okunamadi — hicbir dosya DISLANMADI (fail-closed)')
    }
    if (dalinKendisi.length > 0) {
      // Sessiz dışlama YOK: neyin sayılmadığı çıktıda görünür.
      console.warn(
        `[INV-TABAN-TAZE-1] dalin KENDI migration'lari sayilmadi (${dalinKendisi.length}): ` +
          `${dalinKendisi.join(', ')} — master'a inince taban TAZELENMELI (README Yol A).`,
      )
    }
    const geride = migrationlar.filter((m) => m.tarih > tabanTarih && !dalinKendisi.includes(m.dosya))
    expect(
      geride.map((m) => m.dosya),
      `⚠TABAN BAYAT. Secilen taban: ${enYeniTaban!.dosya} (${tabanTarih}).\n` +
        `      Ondan SONRA gelen migration sayisi: ${geride.length}\n` +
        `      Dosyalar: ${geride.map((m) => m.dosya).join(', ')}\n` +
        `      ONARIM: .github/workflows/sema-tabani-uret.yml elle tetiklenir (salt-okuma\n` +
        `      supabase db dump, olculmus sure 57 sn), cikti artefakt olarak iner, INSAN PR acar.\n` +
        `      Depoya dogrudan commit EDILMEZ. Ayrintli: supabase/baselines/README.md Yol A.`,
    ).toEqual([])
  })

  it('⭐SABOTAJ: tabandan YENI bir migration damgasi kapiyi KIRMIZI yapar (kor olmadigi kaniti)', () => {
    // Gercek dosya YAZMAZ — canli agaca yazan kapi kardes kapilarla yarisa girer (olculdu).
    const tabanTarih = enYeniTaban!.tarih
    const yil = Number(tabanTarih.slice(0, 4)) + 1
    const uydurma = `${yil}0101000000_sabotaj_olcumu.sql`
    const uydurmaTarih = migrationTarihi(uydurma)
    expect(uydurmaTarih, 'sabotaj fiksturunun damgasi cozulemedi').not.toBeNull()
    expect(
      uydurmaTarih! > tabanTarih,
      'sabotajli damga tabandan yeni GORULMEDI — karsilastirma kor',
    ).toBe(true)
  })

  it('⭐DAMGA BICIMI SESSIZCE DEGISEMEZ: her migration dosyasinin tarihi COZULEBILIYOR', () => {
    const tumSql = fs.existsSync(MIGRATION_DIZIN)
      ? fs.readdirSync(MIGRATION_DIZIN).filter((d) => d.endsWith('.sql'))
      : []
    const cozulemeyen = tumSql.filter((d) => migrationTarihi(d) === null)
    expect(
      cozulemeyen,
      `damgasi cozulemeyen migration(lar): ${cozulemeyen.join(', ')}\n` +
        `      Bu kapi tarihi DOSYA ADINDAN okur; ad bicimi degisirse dosya SESSIZCE\n` +
        `      karsilastirmadan duser ve kapi yanlis yesil verir.`,
    ).toEqual([])
  })

  it('README GECMIS TABLOSU dosya sistemiyle ayni evrende (klasorun haritasi bayatlamasin)', () => {
    expect(fs.existsSync(README), `README YOK: ${README}`).toBe(true)
    const ham = fs.readFileSync(README, 'utf8')
    const eksik = tabanlar.filter((t) => !ham.includes(t.dosya))
    expect(
      eksik.map((t) => t.dosya),
      `README gecmis tablosunda ANILMAYAN taban dosyasi: ${eksik.map((t) => t.dosya).join(', ')}\n` +
        `      Klasorun kendi haritasi bayatladi. 2026-09-14 hatasinin sebebi tam buydu:\n` +
        `      yanlis secilen dosya tabloda HIC YOKTU.`,
    ).toEqual([])
  })
})
