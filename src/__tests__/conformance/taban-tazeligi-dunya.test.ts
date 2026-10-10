import { execFileSync } from 'node:child_process'
import fs from 'node:fs'
import path from 'node:path'

import { describe, expect, it } from 'vitest'

/**
 * INV-TABAN-TAZE-1 — şema TABANI, onaylanmış son migration'dan geri kalmamalı. (TAZELİK kolu = DÜNYA DURUMU)
 *
 * ⭐NİÇİN BU DOSYA AYRI (ALT-38, 2026-10-06): bu dosya yalnız TAZELİK kolunu taşır. Cevabı pull request'in
 * koduna değil master'ın o anki durumuna ve tabanın son dökülme tarihine bağlıdır; taban prod'dan elle dökülür
 * (`sema-tabani-uret.yml`), yani suçsuz bir PR'ın yazarı düzeltemez. CI geçmişinde (2026-07-06..10-06) bu kapı
 * 55 kırmızı koşu ve 39 farklı dalda kırmızı verdi: master'a bir migration girince ondan sonra açılan ya da
 * güncellenen HER PR, kendi koduyla ilgisi olmadan kırmızı oldu. Bu yüzden dosya PR kapısından ÇIKARILDI
 * (liste: `scripts/ci/dunya-durumu-testleri.json`): master'a her push'ta (`ci` işi, tam paket) ve zamanlı iş
 * akışında (`dunya-durumu.yml`) koşar; kırmızıyı her mesajdaki `TABAN:` ve `DUNYA:` kanca satırları gösterir.
 * Silinmedi, gevşetilmedi: aynı ölçüt, aynı eşik, yalnız YERİ değişti (cetvel:
 * `docs/standards/test-karnesi-standard.md`).
 *
 * Kapının KENDİ koduna ait kollar (evren boş olamaz, kısmi dosya taban sayılmaz, sabotaj, damga biçimi, README
 * tablosu) pull request kapısında KALDI: `taban-tazeligi.test.ts`. Orası bu dosyayla AYNI yardımcıları taşır ve
 * bir kayma testi ikisinin aynı kalmasını ölçer.
 *
 * ⭐NİÇİN VAR (Recep, 2026-09-16): *"bende DB'de değişiklik yaptığım an senin kendi yedeğin
 * bayat olacak; tekrardan onu tazelemek yine 2 gün mü sürecek?"* Tazelemek iki gün DEĞİL (döküm CI'da 57
 * saniye); iki gün süren şey keşifti. Eksik olan şey ölçüm değil ALARM'dı. Ölçüt repo içindedir ve sır
 * gerektirmez: DB'ye giden her değişiklik onaylanmış bir migration DOSYASIDIR, bayatlık sorusu dosya
 * adlarından cevaplanır: en yeni migration damgası, tabanın tarihinden yeni mi?
 *
 * ⚠BU KAPININ GÖRMEDİĞİ ŞEY, ADIYLA: bir migration merge edilip canlıya uygulanmamış olabilir (2026-09-15'te
 * `20250919_fts_search_products.sql` beş indeks yaratıyor, canlıda yalnız ikisi vardı). Dosya tarihi
 * "uygulandı" demek değildir; o eksiği sayarak doğrulama kapatır (`db-advisor.yml` hattı).
 *
 * Cetvel: `supabase/baselines/README.md` (hangi dosya nedir) ·
 * `docs/standards/ledger-ve-olu-migration-standard.md`.
 */

// ⚠ORTAK YARDIMCILAR (aşağıdaki iki işaret arası): `taban-tazeligi.test.ts` ile BİREBİR aynı kalmak ZORUNDA.
// İki ayrı dosya olduğu için kopyadır; ayrılırlarsa o dosyadaki "ORTAK YARDIMCILAR AYNI" testi kırmızı verir.
// ORTAK-BLOK-BASLA
const KOK = path.resolve(__dirname, '..', '..', '..')
const TABAN_DIZIN = path.join(KOK, 'supabase', 'baselines')
const MIGRATION_DIZIN = path.join(KOK, 'supabase', 'migrations')

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
// ORTAK-BLOK-BITIS

describe('INV-TABAN-TAZE-1 · sema tabani son migration dan geri kalmaz (DUNYA DURUMU: PR kapisinda degil)', () => {
  const tabanlar = tabanlariTopla()
  const tamTabanlar = tabanlar.filter((t) => t.tam)
  const enYeniTaban = tamTabanlar.at(-1)
  const migrationlar = migrationlariTopla()

  it('TAZELIK: en yeni migration damgasi, TABAN tarihinden YENI OLAMAZ', () => {
    // OLCEMEDI ≠ TAZE: evren bos ya da TAM taban yoksa asagidaki karsilastirma anlamsizdir; once bunu soyle.
    expect(
      enYeniTaban,
      'TAM taban yok (hicbir dosyada create policy gecmiyor ya da klasor bos) — olcemedik, bu "taze" DEMEK DEGIL.',
    ).toBeDefined()
    expect(
      migrationlar.length,
      'hic migration bulunamadi — damga bicimi degistiyse bu kapi sessizce yesile doner',
    ).toBeGreaterThan(0)
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
})
