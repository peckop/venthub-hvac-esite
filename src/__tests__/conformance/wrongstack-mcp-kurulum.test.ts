// @vitest-environment node
import { execFileSync } from 'node:child_process'
import fs from 'node:fs'
import path from 'node:path'

import { describe, expect, it } from 'vitest'

/**
 * INV-WRONGSTACK-MCP-1 — üçüncü taraf MCP sunucuları KİLİTLİ, BETİKSİZ ve DAR yüzeyle kalır.
 *
 * NİÇİN VAR (REC-345 Kova C, 2026-09-17): WrongStack sage-mcp + codebase-index-mcp her Claude
 * penceresinde çalışan başkasının kodu. `npx -y paket@sürüm` üst paketi sabitler ama 25 geçişli
 * bağımlılığı her çözümde yeniden çözer ve kurulum betiklerini çalıştırır. Kurulum bu yüzden
 * lock commit'li + `npm ci --ignore-scripts`. Bu kapı o kararın geri kaçmasını engeller:
 *   1. sürümler caret/tilde'siz, lock var ve package.json ile aynı sürümü kilitliyor
 *   2. lock'ta kurulum betikli paket YOK (çıkarsa bilinçli karar ister)
 *   3. .mcp.json npx/uzak paket çağırmıyor, yerel kilitli yolu çağırıyor
 *   4. `--writable` YALNIZ sage'de; kod dizini salt-okuma
 *   5. kayıtlı sunucu = envanter satırı (envantersiz araç bitmemiş araçtır)
 */
const KOK = process.cwd()
const ARAC = path.join(KOK, 'tools', 'wrongstack-mcp')

type Paket = { dependencies?: Record<string, string> }
type Kilit = { packages: Record<string, { version?: string; hasInstallScript?: boolean }> }
type McpSunucu = { command?: string; args?: string[] }
type Mcp = { mcpServers?: Record<string, McpSunucu> }

const json = <T>(p: string): T => JSON.parse(fs.readFileSync(p, 'utf8')) as T

describe('INV-WRONGSTACK-MCP-1 · ucuncu taraf MCP kilitli ve dar', () => {
  const paket = json<Paket>(path.join(ARAC, 'package.json'))
  const deps = paket.dependencies ?? {}

  it('surumler sabit ve lock ayni surumu kilitliyor', () => {
    const adlar = Object.keys(deps)
    expect(adlar.sort(), 'beklenen paket kumesi degil').toEqual([
      '@wrongstack/codebase-index-mcp',
      '@wrongstack/kanban-mcp',
      '@wrongstack/mailbox-mcp',
      '@wrongstack/sage-mcp',
    ])
    for (const [ad, surum] of Object.entries(deps)) {
      expect(surum, `${ad} surumu sabit degil (caret/tilde/aralik)`).toMatch(/^\d+\.\d+\.\d+$/)
    }
    const kilitYolu = path.join(ARAC, 'package-lock.json')
    expect(fs.existsSync(kilitYolu), 'package-lock.json YOK — gecisli bagimliliklar kilitsiz').toBe(true)
    const kilit = json<Kilit>(kilitYolu)
    for (const [ad, surum] of Object.entries(deps)) {
      expect(kilit.packages[`node_modules/${ad}`]?.version, `${ad} lock ta farkli surum`).toBe(surum)
    }
  })

  it('lock ta kurulum betikli paket YOK', () => {
    const kilit = json<Kilit>(path.join(ARAC, 'package-lock.json'))
    const betikli = Object.entries(kilit.packages)
      .filter(([ad, p]) => ad !== '' && p.hasInstallScript)
      .map(([ad]) => ad)
    expect(betikli, 'kurulum betikli paket girdi — --ignore-scripts ile calisiyor mu OLC, sonra bilincli karar').toEqual([])
  })

  it('.mcp.json yerel kilitli yolu cagiriyor, npx yok, writable yalniz sage', () => {
    const mcp = json<Mcp>(path.join(KOK, '.mcp.json'))
    const s = mcp.mcpServers ?? {}
    const sage = s['wrongstack-sage']
    const dizin = s['wrongstack-codebase-index']
    expect(sage, 'wrongstack-sage kaydi yok').toBeDefined()
    expect(dizin, 'wrongstack-codebase-index kaydi yok').toBeDefined()
    for (const [ad, sunucu] of [['wrongstack-sage', sage], ['wrongstack-codebase-index', dizin]] as const) {
      const cagri = [sunucu?.command ?? '', ...(sunucu?.args ?? [])].join(' ')
      expect(cagri, `${ad} npx/uzak paket cagiriyor`).not.toMatch(/\bnpx\b|\bpnpm dlx\b|\bbunx\b/)
      expect(cagri, `${ad} kilitli yerel yolu cagirmiyor`).toContain('tools/wrongstack-mcp/node_modules/@wrongstack/')
      expect(cagri, `${ad} mutlak yol tasiyor (kimlik sizintisi)`).not.toMatch(/[A-Za-z]:[\\/]|\/Users\/|\/home\//)
    }
    expect(sage?.args, 'sage --writable degil — hafiza yazamaz').toContain('--writable')
    expect(dizin?.args, 'kod dizini --writable — salt-okuma karari geri kacti').not.toContain('--writable')
  })

  it('⭐KANBAN kaydi: writable AMA destructive DEGIL, dogrulayici izni +gh ile GENISLETILMIS', () => {
    /**
     * Pano pilotu (karar 46, Recep onayi 2026-09-18 ALTYAPI penceresinde). Üç ölçüm bu kolu
     * yazdırdı:
     *  1. `--destructive` silme/birleştirme/devretme açar; pilot bunu İSTEMEZ — kart silmek
     *     kaydı sessizce yok etmektir, bizim kural "kayıt yalnız küçülebilir ve GEREKÇEYLE".
     *  2. Doğrulayıcının varsayılan izin listesi ÇOK DAR ölçüldü:
     *     `DEFAULT_ALLOWED_COMMANDS = ["pwd","true","false","test"]`. Yani "Done = kanıt"
     *     kuralı, izin genişletilmeden HİÇBİR gerçek kanıt komutu koşturamaz.
     *  3. Genişletme dilbilgisi ölçüldü: `+x` ekler, `-x` çıkarır, çıplak `x` de ekler; ve
     *     `BLOCKED_COMMANDS` (rm, curl, wget, npm/npx/pnpm/yarn/bun, node, kill …) HER HÂLDE
     *     üstündür. `gh` yasak listesinde YOK, bu yüzden `+gh` geçerli ve dar bir genişletme.
     */
    const mcp = json<Mcp>(path.join(KOK, '.mcp.json'))
    const kanban = (mcp.mcpServers ?? {})['wrongstack-kanban'] as
      | (McpSunucu & { env?: Record<string, string> })
      | undefined
    expect(kanban, 'wrongstack-kanban kaydi yok').toBeDefined()
    const cagri = [kanban?.command ?? '', ...(kanban?.args ?? [])].join(' ')
    expect(cagri, 'kanban npx/uzak paket cagiriyor').not.toMatch(/\bnpx\b|\bpnpm dlx\b|\bbunx\b/)
    expect(cagri, 'kanban kilitli yerel yolu cagirmiyor').toContain(
      'tools/wrongstack-mcp/node_modules/@wrongstack/kanban-mcp',
    )
    expect(cagri, 'kanban kaydinda mutlak yol var (kimlik sizintisi)').not.toMatch(/[A-Za-z]:[\\/]|\/Users\/|\/home\//)
    expect(kanban?.args, 'kanban --writable degil — kart acilamaz').toContain('--writable')
    expect(kanban?.args, '--destructive ACIK: silme/birlestirme/devretme yuzeyi pilot kapsaminda DEGIL').not.toContain(
      '--destructive',
    )
    expect(
      kanban?.env?.WRONGSTACK_KANBAN_VERIFIER_COMMANDS,
      'dogrulayici izni genisletilmemis — varsayilan liste pwd/true/false/test, gercek kanit kosamaz',
    ).toBe('+gh')
  })

  it('⭐MAILBOX kaydi: kimlik PENCERE BASINA (oturum kimligi), varsayilansiz, admin DEGIL', () => {
    /**
     * Karar 54 (Recep ilk elden teyit 2026-09-21, ALTYAPI penceresi). `.mcp.json` ÜÇ PENCERENİN
     * PAYLAŞTIĞI tek dosyadır: sabit bir `--actor` yazılırsa bütün pencereler AYNI kimlikle
     * konuşur ve mesajlar yanlış pencereye düşer — bir mesaj kutusu için en kötü arıza. Bu yüzden
     * kimlik `${CLAUDE_CODE_SESSION_ID}` ile pencere başına verilir.
     *
     * ⭐VARSAYILAN YASAK (`${CLAUDE_CODE_SESSION_ID:-x}`): değişken sürece ulaşmazsa varsayılan
     * sessizce devreye girer ve bütün pencereler `x` olur — tam da önlenen arıza. Varsayılansız
     * yazımda değişken yoksa YALNIZ bu sunucu açılmaz (fail-closed), diğerleri etkilenmez.
     *
     * Ölçülen (2026-09-21, sahte iki kimlikle gerçek sunucu): A gönderip KAPANDI, B sonra açıldı
     * ve okunmamış 1 gördü; C'ye giden mesaj B'nin kutusuna DÜŞMEDİ (B 0, C 1). Pencere içinden
     * genişlemenin ve kimliğin ulaştığı ölçümü kapat-aç sonrasına kalır (README madde 8).
     * `--admin` KAPALI: toplu silme / kimlik bilgisi yönetimi pilot kapsamında değil.
     */
    const kilit = json<Kilit>(path.join(ARAC, 'package-lock.json'))
    expect(kilit.packages['node_modules/@wrongstack/mailbox-mcp']?.version, 'mailbox paketi kurulu degil').toBe('1.0.19')
    const mcp = json<Mcp>(path.join(KOK, '.mcp.json'))
    const kutu = (mcp.mcpServers ?? {})['wrongstack-mailbox']
    expect(kutu, 'wrongstack-mailbox kaydi yok (karar 54)').toBeDefined()
    const args = kutu?.args ?? []
    const cagri = [kutu?.command ?? '', ...args].join(' ')
    expect(cagri, 'mailbox npx/uzak paket cagiriyor').not.toMatch(/\bnpx\b|\bpnpm dlx\b|\bbunx\b/)
    expect(cagri, 'mailbox kilitli yerel yolu cagirmiyor').toContain(
      'tools/wrongstack-mcp/node_modules/@wrongstack/mailbox-mcp',
    )
    expect(cagri, 'mailbox kaydinda mutlak yol var (kimlik sizintisi)').not.toMatch(/[A-Za-z]:[\\/]|\/Users\/|\/home\//)
    const deger = (bayrak: string): string | undefined => {
      const i = args.indexOf(bayrak)
      return i >= 0 ? args[i + 1] : undefined
    }
    expect(
      deger('--actor'),
      '--actor pencere basina degil — sabit ya da varsayilanli kimlik butun pencereleri AYNI kimlik yapar',
    ).toBe('${CLAUDE_CODE_SESSION_ID}')
    expect(deger('--session-id'), '--session-id oturum kimligi degil').toBe('${CLAUDE_CODE_SESSION_ID}')
    expect(args, 'mailbox --writable degil — gonderemez').toContain('--writable')
    expect(args, '--admin ACIK: toplu silme/kimlik yonetimi pilot kapsaminda DEGIL').not.toContain('--admin')
  })

  it('sage verisi (.wrongstack/) git DISI: her derinlikte yok sayilir ve izlenen dosya YOK', () => {
    // 09-17 olculdu: sage.db ana agacin ICINDE (.wrongstack/memories/), .gitignore eslesmesi 0 idi.
    // Git disi cunku: ikili SQLite (uc pencere yazar → cakisir, diff okunmaz) · secret-scan ikili
    // dosyanin icini goremez · icerik PR gozunden gecmez. Repo PUBLIC → yayin geri donussuz.
    const git = (...a: string[]) =>
      execFileSync('git', ['-C', KOK, ...a], { encoding: 'utf8', stdio: ['ignore', 'pipe', 'pipe'] })
    for (const yol of ['.wrongstack/memories/sage.db', '.wrongstack/memories/server.json', 'tools/wrongstack-mcp/.wrongstack/memories/sage.db']) {
      // check-ignore eşleşirse 0 döner; eşleşmezse 1 ile FIRLATIR → test kırmızı.
      expect(git('check-ignore', '--no-index', yol).trim(), `${yol} yok sayilmiyor`).toBe(yol)
    }
    const izlenen = git('ls-files').split('\n').filter((f) => /(^|\/)\.wrongstack\//.test(f))
    expect(izlenen, 'depoda izlenen .wrongstack dosyasi var').toEqual([])
  })

  it('envanterde satiri ve README de KAYNAK blogu var', () => {
    const env = fs.readFileSync(path.join(KOK, 'docs', 'audits', 'arac-envanteri-2026-09-07.md'), 'utf8')
    expect(env, 'envanterde tools/wrongstack-mcp satiri yok').toContain('tools/wrongstack-mcp/')
    const oku = fs.readFileSync(path.join(ARAC, 'README.md'), 'utf8')
    for (const b of ['**KAYNAK**', '**ALINAN**', '**BİZDEN**', '**ALINMAYAN**', 'MIT']) {
      expect(oku, `README de ${b} yok`).toContain(b)
    }
  })
})
