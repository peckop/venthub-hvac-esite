/**
 * INV-SIR-BASMA-1 — sır değerini ekrana basan Bash kalıplarını yakalayan kapı.
 *
 * OLAY (2026-09-04, ALTYAPI — kendi hatam): nöbetçinin fail-closed yolunu ölçerken
 * "bu env tanımlı mı" diye `${VAR:-YOK}` kalıbını yazdım. O kalıp, değişken DOLU
 * olduğunda varsayılanı değil DEĞERİN KENDİSİNİ basar — prod veritabanı bağlantı
 * dizesi (parola dahil) komut çıktısına ve oturum transkriptine düştü. Repo'ya
 * yazılmadı, commit'lenmedi. OPS ölçtü: benim oturumumda 2, iki ESKİ oturumda 37
 * eşleşme — sınıf bugünden eski. Recep kararı: parola döndürülmedi (kendi makinesi,
 * kabul edilen risk), yerel transkriptler temizlendi, kapı yazıldı.
 *
 * BU DOSYA kapının DÜZENEĞİNİ ve DAVRANIŞINI ölçer: kayıtlı kancaya bağlı mı, mantık
 * tek kaynakta mı, meşru kullanımı serbest bırakıyor mu.
 */
import { execFileSync } from 'node:child_process'
import fs from 'node:fs'
import { createRequire } from 'node:module'
import path from 'node:path'

import { describe, expect, it } from 'vitest'

function repoKoku(): string {
  return execFileSync('git', ['rev-parse', '--path-format=absolute', '--show-toplevel'], {
    encoding: 'utf8',
  }).trim()
}
const KOK = repoKoku()
const oku = (p: string): string => fs.readFileSync(path.join(KOK, p), 'utf8')

/** JS yorumlarını satır bazlı atar — gerekçe metni kodun yerine geçmesin. */
function jsYorumsuz(metin: string): string {
  return metin
    .split('\n')
    .filter((s) => !/^\s*(\/\/|\/\*|\*)/.test(s))
    .join('\n')
}

const MODUL = '.claude/hooks/sir-basan-kalip.cjs'
const KANCA = '.claude/hooks/bash-write-guard.cjs'

const require_ = createRequire(import.meta.url)
interface Bulgu {
  kalip: string
  ad: string
  neden: string
}
const { sirBasanKaliplar } = require_(path.join(KOK, MODUL)) as {
  sirBasanKaliplar: (komut: string) => Bulgu[]
}

describe('INV-SIR-BASMA-1: kapı DAVRANIŞI — tehlikeliyi yakalar, meşruyu bırakır', () => {
  /**
   * ⭐DAVRANIŞ ÖLÇÜMÜ, METİN DEĞİL. Kapının değeri "yazılmış olması" değil, doğru
   * ayrımı yapması. Ölçüldü: ilk hâlinde `${SIR:+VAR}` (yalnız varlık bildirir)
   * TEHLİKELİ sayılıyordu — meşru kullanımı reddeden bir kapı kısa sürede kapatılır.
   */
  const TEHLIKELI: [string, string][] = [
    ['olayın kendisi: dolu varsayılan', 'echo "${SUPABASE_DB_URL:-YOK}"'],
    ['tireli biçim', 'echo "${SUPABASE_DB_URL-YOK}"'],
    ['doğrudan basma', 'echo $SUPABASE_DB_URL'],
    ['printf ile', 'printf "%s" "${DATABASE_URL}"'],
    ['token', 'echo "token: $AGENTS_GITHUB_TOKEN"'],
    ['varlık kalıbı ama değeri basıyor', 'echo "${SUPABASE_DB_URL:+$SUPABASE_DB_URL}"'],
    /**
     * ⭐BU VAKA SABOTAJLA BULUNDU — kolda BOŞLUK vardı.
     *
     * Sabotaj: modülün birinci kalıbını (dolu-varsayılan kontrolü) devre dışı bıraktım
     * ve kol YEŞİL kaldı. Sebep: bütün tehlikeli vakalarım `echo` içeriyordu, yani
     * ikinci kalıp (doğrudan basma) hepsini örtüyordu ve birinci kalıbın ölümü
     * GÖRÜNMÜYORDU. Oysa `echo` olmadan da değer sızar: değişkene atanıp başka bir
     * komuta (curl, bir dosyaya, bir günlüğe) verilebilir. Bu vaka birinci kalıbı
     * TEK BAŞINA ölçer.
     */
    ['echo YOK, yalnız atama (birinci kalıbı tek başına ölçer)', 'X="${SUPABASE_DB_URL:-YOK}"'],
  ]
  const GUVENLI: [string, string][] = [
    ['boş varsayılan (yaygın deyim)', 'if [ -z "${SUPABASE_DB_URL:-}" ]; then echo yok; fi'],
    ['uzunluk', 'echo "uzunluk: ${#SUPABASE_DB_URL}"'],
    ['yalnız varlık', 'echo "${SUPABASE_DB_URL:+VAR}"'],
    ['NEXT_PUBLIC_ muaf (tanımı gereği public)', 'echo $NEXT_PUBLIC_SUPABASE_ANON_KEY'],
    ['ilgisiz değişken', 'echo $HOME'],
    ['env geçişi (basma yok)', 'SUPABASE_DB_URL="$SUPABASE_DB_URL" node betik.mjs'],
  ]

  for (const [ad, komut] of TEHLIKELI) {
    it(`TEHLİKELİ yakalanır: ${ad}`, () => {
      expect(sirBasanKaliplar(komut).length, `yakalanmadı: ${komut}`).toBeGreaterThan(0)
    })
  }
  for (const [ad, komut] of GUVENLI) {
    it(`MEŞRU serbest: ${ad}`, () => {
      const b = sirBasanKaliplar(komut)
      expect(b.length, `yanlış pozitif: ${komut} -> ${b.map((x) => x.neden).join(' | ')}`).toBe(0)
    })
  }

  it('bulgu NE YAPILACAĞINI söyler (yalnız "hayır" demez)', () => {
    const b = sirBasanKaliplar('echo "${SUPABASE_DB_URL:-YOK}"')
    expect(b[0].neden.length, 'gerekçe/yönlendirme yok').toBeGreaterThan(60)
    expect(/\$\{#/.test(b[0].neden), 'güvenli alternatif (uzunluk) önerilmiyor').toBe(true)
  })
})

describe('INV-SIR-BASMA-1: düzenek — kayıtlı kancaya bağlı ve TEK KAYNAK', () => {
  it('kapı KAYITLI bir kancadan çağrılır (yeni kanca = config, ajan eli değmez)', () => {
    const k = jsYorumsuz(oku(KANCA))
    expect(k.includes('sir-basan-kalip.cjs'), 'kayıtlı kanca kalıp modülünü çağırmıyor').toBe(true)
    /**
     * ⭐ÖLÇÜT SIR BLOĞUNA BAĞLI — varlık ölçütü ayırt etmiyordu.
     *
     * `/process\.exit\(2\)/` yazmıştım; kancada DÖRT ayrı `exit(2)` var (yazma hedefi
     * çözülemedi / korunan config / muafiyet ihlali / sır basma). Sır bloğundakini
     * `exit(0)` yapınca kol YEŞİL kalırdı çünkü öteki üçü "bir exit(2) var" diyordu.
     * Bugün bu sınıfı dördüncü kez ödedim (INV-DUMAN-4, nöbetçi exit ölçütü, bu).
     * Kural: ölçüt bir DALIN davranışını ölçecekse, o dalın kendi metnine bağlanır.
     */
    expect(
      /SIR DEGERI EKRANA BASILIYOR[\s\S]{0,600}process\.exit\(2\)/.test(k),
      'sır bloğu reddetmiyor (exit 2 o dalda değil) — kapı bulur ama komutu geçirir'
    ).toBe(true)
    // Kanca, settings.json'da GERÇEKTEN kayıtlı olmalı — dosya var diye çağrılıyor sanmak
    // "kapı var, koşum yok" sınıfıdır.
    const ayar = oku('.claude/settings.json')
    expect(ayar.includes('bash-write-guard.cjs'), 'taşıyıcı kanca settings.json\'da kayıtlı değil').toBe(
      true
    )
  })

  it('mantık MODÜLDE, kancada kopya YOK (§26)', () => {
    const k = jsYorumsuz(oku(KANCA))
    // Kalıp regex'i kancaya kopyalanmışsa iki yer sessizce ayrışır.
    expect(
      /SECRET\|TOKEN\|PASSWORD/.test(k),
      'kalıp deseni kancaya kopyalanmış — mantık tek kaynakta durmalı'
    ).toBe(false)
    const m = oku(MODUL)
    expect(/module\.exports\s*=\s*\{[^}]*sirBasanKaliplar/.test(m), 'modül fonksiyonu dışa vermiyor').toBe(
      true
    )
  })

  it('NEXT_PUBLIC_ muafiyeti GEREKÇELİ ve kayıtlı', () => {
    const m = oku(MODUL)
    expect(/NEXT_PUBLIC_/.test(m), 'public muafiyeti yok — kapı meşru komutları reddeder').toBe(true)
    // Muafiyet bedava değil: niçin'i yazılı olmalı.
    expect(
      /taniml? gere[gğ]i|tan[ıi]m[ıi] gere[gğ]i/i.test(m),
      'muafiyetin gerekçesi yazılmamış (kapsam dışı bırakmak bedava değildir)'
    ).toBe(true)
  })
})
