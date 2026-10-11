import { existsSync, readFileSync } from 'node:fs'
import path from 'node:path'

import { describe, expect, it } from 'vitest'

/**
 * INV-CI-KAYIT-KAPISI-1 — karar 187 kayıt kapısı `ci` iş akışına DOĞRU bağlı olmalı.
 *
 * NİÇİN VAR (2026-09-29)
 *
 * Karar 187: her PR bir Linear kaydına bağlanır (`Fixes REC-nn` ya da `Kayıtsız: <sebep>`).
 * Kapının MANTIĞI ve testi `scripts/board/pr-kayit-kapisi.cjs` içinde (ARAÇ). Bu dosya yalnız
 * BAĞLANTIYI korur; bağlantı bozulursa mantık ne kadar doğru olursa olsun kapı hiç koşmaz.
 * Dört ayrı bozulma yolu var, dördü de sessiz:
 *
 *   1. `edited` türü düşerse: yazar gövdeye `Fixes` ekler, kapı yeniden koşmaz, kırmızı kalır
 *      ve tek çare boş commit olur. (Varsayılan tür listesi `edited` İÇERMEZ.)
 *   2. Adımın `if:` koşulu düşerse: push/master ve elle koşumda PR gövdesi yoktur, kapı
 *      boş gövdeyle KIRMIZI verir ve master'ı kilitler.
 *   3. PR gövdesi `run:` satırına gömülürse: gövdeyi herkes yazar, komut enjeksiyonudur.
 *      Yalnız `env:` altında geçmeli.
 *   4. `ci` işine `pull-requests: write` girerse: PR'ın kendi kodunu koşturan iş gereksiz
 *      yere PR'a yazma yetkisi alır (least privilege).
 *
 * Betiğin varlığı da denetlenir: iş akışı, betikten ÖNCE ana dala girerse her PR kırmızı verir.
 *
 * ── ÖLÇÜM YÜZEYİ ────────────────────────────────────────────────────────────
 * `node:fs` + satır taraması (YAML ayrıştırıcı bağımlılığı yok). Ölçüm dosyanın kendisi;
 * bu test ci.yml'i DEĞİŞTİRMEZ.
 */
const KOK = path.resolve(__dirname, '../../..')
const CI_YOLU = path.join(KOK, '.github/workflows/ci.yml')
const BETIK_YOLU = 'scripts/board/pr-kayit-kapisi.cjs'
const ADIM_ADI = 'PR kayıt kapısı'

/** Adımın başlangıç satırından sonraki adımın başlangıcına kadar olan satırlar. */
function adimBlogu(satirlar: string[], ad: string): string[] {
  const bas = satirlar.findIndex((s) => /^\s+- name:/.test(s) && s.includes(ad))
  if (bas < 0) return []
  const sonraki = satirlar.findIndex((s, i) => i > bas && /^\s+- name:/.test(s))
  return satirlar.slice(bas, sonraki < 0 ? undefined : sonraki)
}

/** Yorum satırlarını at: gerekçe metni deseni "içeriyor" gibi göstermesin. */
function yorumsuz(satirlar: string[]): string[] {
  return satirlar.filter((s) => !/^\s*#/.test(s))
}

function kapiBaglantisiniDenetle(ciMetni: string): string[] {
  const ihlaller: string[] = []
  const satirlar = ciMetni.split(/\r?\n/)
  const kod = yorumsuz(satirlar)

  const turSatiri = kod.find((s) => /^\s+types:\s*\[/.test(s))
  if (!turSatiri || !/\bedited\b/.test(turSatiri)) {
    ihlaller.push('pull_request türlerinde `edited` yok: gövde düzeltmesi kapıyı yeniden koşturmaz')
  }

  const blok = yorumsuz(adimBlogu(satirlar, ADIM_ADI))
  if (blok.length === 0) {
    ihlaller.push(`\`${ADIM_ADI}\` adımı ci.yml içinde yok`)
    return ihlaller
  }
  if (!blok.some((s) => /^\s+if:\s*github\.event_name == 'pull_request'\s*$/.test(s))) {
    ihlaller.push("adımın `if: github.event_name == 'pull_request'` koşulu yok: push/master'da boş gövdeyle kırmızı verir")
  }
  if (!blok.some((s) => s.includes(`run: node ${BETIK_YOLU}`))) {
    ihlaller.push(`adım \`node ${BETIK_YOLU}\` komutunu koşturmuyor`)
  }

  const govdeSatirlari = kod.filter((s) => s.includes('github.event.pull_request.body'))
  if (govdeSatirlari.length === 0) ihlaller.push('PR gövdesi adıma hiç geçmiyor')
  for (const s of govdeSatirlari) {
    if (!/^\s+PR_GOVDE:\s*\$\{\{\s*github\.event\.pull_request\.body\s*\}\}\s*$/.test(s)) {
      ihlaller.push(`PR gövdesi env dışında geçiyor (enjeksiyon): ${s.trim()}`)
    }
  }

  const kurulum = satirlar.findIndex((s) => /^\s+- name: Install dependencies/.test(s))
  const kapi = satirlar.findIndex((s) => /^\s+- name:/.test(s) && s.includes(ADIM_ADI))
  if (kurulum >= 0 && kapi > kurulum) {
    ihlaller.push('kapı adımı bağımlılık kurulumundan SONRA: boşuna kurulum bekletir')
  }

  if (kod.some((s) => /pull-requests:\s*write/.test(s))) {
    ihlaller.push('ci.yml `pull-requests: write` içeriyor: PR kodunu koşturan işe gereksiz yetki')
  }
  return ihlaller
}

describe('INV-CI-KAYIT-KAPISI-1 — karar 187 kapısı ci iş akışına doğru bağlı', () => {
  // Satır sonu normalleştirilir: Windows çalışma kopyası CRLF getirir, sabotajın metin değiştirmeleri LF varsayar
  // (normalleştirmeden değişiklik hiç uygulanmaz ve sabotaj testi sessizce boşa geçerdi).
  const ciMetni = readFileSync(CI_YOLU, 'utf8').replace(/\r\n/g, '\n')

  it('bugünkü ci.yml bağlantı kurallarına uyuyor', () => {
    expect(kapiBaglantisiniDenetle(ciMetni)).toEqual([])
  })

  it('kapı betiği depoda var (iş akışı betikten önce girerse her PR kırmızı verir)', () => {
    expect(existsSync(path.join(KOK, BETIK_YOLU))).toBe(true)
  })

  // ── SABOTAJ: her bozulma yolu GERÇEKTEN yakalanıyor mu ─────────────────────
  it('sabotaj 1: `edited` türü silinirse yakalanır', () => {
    const bozuk = ciMetni.replace('types: [opened, synchronize, reopened, edited]', 'types: [opened, synchronize, reopened]')
    expect(bozuk).not.toBe(ciMetni)
    expect(kapiBaglantisiniDenetle(bozuk).join('|')).toContain('`edited` yok')
  })

  it("sabotaj 2: adımın `if:` koşulu silinirse yakalanır", () => {
    const bozuk = ciMetni.replace(
      /(- name: PR kayıt kapısı \(karar 187\)\n)\s+if: github\.event_name == 'pull_request'\n/,
      '$1',
    )
    expect(bozuk).not.toBe(ciMetni)
    expect(kapiBaglantisiniDenetle(bozuk).join('|')).toContain('koşulu yok')
  })

  it('sabotaj 3: PR gövdesi run satırına gömülürse yakalanır', () => {
    const bozuk = ciMetni.replace(
      'run: node scripts/board/pr-kayit-kapisi.cjs',
      'run: echo "${{ github.event.pull_request.body }}" && node scripts/board/pr-kayit-kapisi.cjs',
    )
    expect(bozuk).not.toBe(ciMetni)
    const ihlal = kapiBaglantisiniDenetle(bozuk).join('|')
    expect(ihlal).toContain('env dışında')
  })

  it('sabotaj 4: kapı adımı kurulumdan sonraya taşınırsa yakalanır', () => {
    const satirlar = ciMetni.split('\n')
    const bas = satirlar.findIndex((s) => s.includes('- name: PR kayıt kapısı'))
    const bitis = satirlar.findIndex((s, i) => i > bas && /^\s+- name:/.test(s))
    const adim = satirlar.slice(bas, bitis)
    const kalan = [...satirlar.slice(0, bas), ...satirlar.slice(bitis)]
    const kurulum = kalan.findIndex((s) => s.includes('- name: Install dependencies'))
    const bozuk = [...kalan.slice(0, kurulum + 3), ...adim, ...kalan.slice(kurulum + 3)].join('\n')
    expect(kapiBaglantisiniDenetle(bozuk).join('|')).toContain('SONRA')
  })

  it('sabotaj 5: ci işine pull-requests: write girerse yakalanır', () => {
    // Çapa `runs-on` satırı (tek iş): `timeout-minutes` satırı ALT-38'de ifadeye döndü ve çapayı sessizce kırdı.
    const bozuk = ciMetni.replace('    runs-on: ubuntu-latest\n', '    runs-on: ubuntu-latest\n    permissions:\n      pull-requests: write\n')
    expect(bozuk).not.toBe(ciMetni)
    expect(kapiBaglantisiniDenetle(bozuk).join('|')).toContain('pull-requests: write')
  })
})
