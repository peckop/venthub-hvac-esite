// @vitest-environment node
import { execFileSync } from 'node:child_process'
import fs from 'node:fs'
import { createRequire } from 'node:module'
import os from 'node:os'
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

  it('⭐MAILBOX kaydi: SARMALAYICI uzerinden, .mcp.json da kimlik YAZILMAZ, admin DEGIL', () => {
    /**
     * Karar 54 (Recep ilk elden teyit 2026-09-21, ALTYAPI penceresi). `.mcp.json` BÜTÜN PENCERELERİN
     * PAYLAŞTIĞI tek dosyadır: dosyaya yazılan her `--actor` bütün pencerelere AYNI kimliği verir ve
     * mesajlar yanlış pencereye düşer — bir mesaj kutusu için en kötü arıza.
     *
     * ⭐ÖLÇÜLDÜ (2026-09-21, #1287 sonrası kapat-aç): `--actor ${CLAUDE_CODE_SESSION_ID}` GENİŞLEMEDİ;
     * iki pencerede de agentId düz metin "${CLAUDE_CODE_SESSION_ID}" geldi ve sunucu buna rağmen AÇILDI.
     * Bu yüzden kimlik dosyada değil, sarmalayıcıda (`tools/wrongstack-mcp/posta-kutusu.cjs`) çözülür.
     * Bu kol, dosyaya herhangi bir `--actor` / `${` geri yazılmasını KIRMIZI yapar.
     */
    const kilit = json<Kilit>(path.join(ARAC, 'package-lock.json'))
    expect(kilit.packages['node_modules/@wrongstack/mailbox-mcp']?.version, 'mailbox paketi kurulu degil').toBe('1.0.19')
    const mcp = json<Mcp>(path.join(KOK, '.mcp.json'))
    const kutu = (mcp.mcpServers ?? {})['wrongstack-mailbox']
    expect(kutu, 'wrongstack-mailbox kaydi yok (karar 54)').toBeDefined()
    const args = kutu?.args ?? []
    const cagri = [kutu?.command ?? '', ...args].join(' ')
    expect(cagri, 'mailbox npx/uzak paket cagiriyor').not.toMatch(/\bnpx\b|\bpnpm dlx\b|\bbunx\b/)
    expect(cagri, 'mailbox sarmalayiciyi cagirmiyor — kimlik dosyada cozulmeye kalkar').toContain(
      'tools/wrongstack-mcp/posta-kutusu.cjs',
    )
    expect(cagri, 'mailbox kaydinda mutlak yol var (kimlik sizintisi)').not.toMatch(/[A-Za-z]:[\\/]|\/Users\/|\/home\//)
    expect(args, '--actor .mcp.json a YAZILMIS — butun pencereler ayni kimlik olur').not.toContain('--actor')
    expect(args, '--session-id .mcp.json a YAZILMIS').not.toContain('--session-id')
    expect(cagri, '.mcp.json da ${…} var — bu dosyada GENISLEMEDIGI olculdu').not.toContain('${')
    expect(args, 'mailbox --writable degil — gonderemez').toContain('--writable')
    expect(args, '--admin ACIK: toplu silme/kimlik yonetimi pilot kapsaminda DEGIL').not.toContain('--admin')
  })

  it('⭐SARMALAYICI kimligi AYIRT EDER: gecerli UUID alir, duz metni reddeder, bulamazsa null', () => {
    const { kimlikBul } = createRequire(import.meta.url)(path.join(ARAC, 'posta-kutusu.cjs')) as {
      kimlikBul: (a: { env: Record<string, string | undefined>; ppid: number; oturumDizini: string }) =>
        | { kimlik: string; kaynak: string }
        | null
    }
    const A = 'ac03ce11-c975-478d-bf30-66afb7c00f15'
    const B = 'cb0467f1-0000-4000-8000-000000000001'
    const dizin = fs.mkdtempSync(path.join(os.tmpdir(), 'posta-kutusu-'))
    try {
      fs.writeFileSync(path.join(dizin, '4242.json'), JSON.stringify({ pid: 4242, sessionId: B }))
      fs.writeFileSync(path.join(dizin, '5151.json'), JSON.stringify({ pid: 5151, sessionId: '${CLAUDE_CODE_SESSION_ID}' }))
      // (1) ortam değişkeni geçerli → o kazanır
      expect(kimlikBul({ env: { CLAUDE_CODE_SESSION_ID: A }, ppid: 4242, oturumDizini: dizin })).toEqual({
        kimlik: A,
        kaynak: 'ortam',
      })
      // (2) BUGÜNKÜ VAKA: değişken düz metin → reddedilir, ebeveyn dosyasına düşülür
      expect(
        kimlikBul({ env: { CLAUDE_CODE_SESSION_ID: '${CLAUDE_CODE_SESSION_ID}' }, ppid: 4242, oturumDizini: dizin }),
      ).toEqual({ kimlik: B, kaynak: 'oturum-dosyasi' })
      // (3) iki farklı ebeveyn → iki farklı kimlik (pencereler ayrışır)
      fs.writeFileSync(path.join(dizin, '4343.json'), JSON.stringify({ sessionId: A }))
      expect(kimlikBul({ env: {}, ppid: 4343, oturumDizini: dizin })?.kimlik).toBe(A)
      // (4) dosya da düz metin taşıyorsa → null (fail-closed)
      expect(kimlikBul({ env: {}, ppid: 5151, oturumDizini: dizin })).toBeNull()
      // (5) hiçbir kaynak yok → null
      expect(kimlikBul({ env: {}, ppid: 9999, oturumDizini: dizin })).toBeNull()
    } finally {
      fs.rmSync(dizin, { recursive: true, force: true })
    }
  })

  it('⭐KANONIK KOK: surucu harfi KUCUK, worktree ANA AGACA cozulur — iki kutu olusmaz', () => {
    /**
     * ÖLÇÜLDÜ 2026-09-21: WrongStack kutu deposunu kök yolunun karmasından türetiyor ve karma
     * sürücü harfinin büyük/küçüğüne duyarlı: `c:\…` → venthub-hvac-7e017f (pencereler),
     * `C:\…` → venthub-hvac-1088d5. Terminalden başlayan sayaç ilk hâliyle BOŞ kutuyu sayıp
     * "0" dedi, pencere 1 görüyordu. Worktree ise sunucu tarafından git ile ana ağaca çevrilip
     * büyük `C:` alıyordu. İkisi de burada kilitli.
     */
    const { kanonikKok } = createRequire(import.meta.url)(path.join(ARAC, 'posta-kutusu.cjs')) as {
      kanonikKok: (p: string) => string
    }
    const kok = kanonikKok(KOK)
    expect(kok, 'surucu harfi kucuge cevrilmedi — pencereler ile ayri kutu').not.toMatch(/^[A-Z]:/)
    if (process.platform === 'win32') {
      expect(kanonikKok(KOK.replace(/^[a-z]:/, (h) => h.toUpperCase())), 'buyuk harfli ayni kok FARKLI kutuya gidiyor').toBe(kok)
    }
    // Ana ağaç = git ortak dizininin üstü; worktree'den çağrılsa da aynı kök çıkmalı.
    const ortak = execFileSync('git', ['-C', KOK, 'rev-parse', '--path-format=absolute', '--git-common-dir'], {
      encoding: 'utf8',
    }).trim()
    expect(kok.toLowerCase(), 'worktree ana agaca cozulmedi').toBe(path.dirname(path.resolve(ortak)).toLowerCase())
  })

  it('⭐ACILIS SAYACI: 0 → SESSIZ, n>0 → satir, olculemedi → UYARI (temiz sayilmaz)', async () => {
    const sayac = createRequire(import.meta.url)(path.join(KOK, 'scripts', 'hijyen', 'posta-kutusu-sayac.cjs')) as {
      acilisSatiri: (s: { durum: string; n?: number; sebep?: string }) => string
      okunmamis: (sid: string, o: { kok: string }) => Promise<{ durum: string; sebep?: string }>
    }
    expect(sayac.acilisSatiri({ durum: 'sayildi', n: 0 })).toBe('')
    expect(sayac.acilisSatiri({ durum: 'sayildi', n: 3 })).toContain('OKUNMAMIS 3')
    expect(sayac.acilisSatiri({ durum: 'olculemedi', sebep: 'x' }), 'olculemeyen kutu SESSIZ gecti').toContain('OLCULEMEDI')
    // Geçersiz kimlik sunucuya HİÇ gitmez (ortak kimlikle açılan kutu = yanlış kutu).
    expect((await sayac.okunmamis('${CLAUDE_CODE_SESSION_ID}', { kok: KOK })).durum).toBe('olculemedi')
    const kanca = fs.readFileSync(path.join(KOK, '.claude', 'hooks', 'session-board.cjs'), 'utf8')
    expect(kanca, 'acilis kancasi sayaci cagirmiyor').toContain('posta-kutusu-sayac.cjs')
    // Yorum satırları eski metni ALINTILAYABİLİR (niçin değiştiği yazılı kalsın); basılan dize yapamaz.
    const basilan = kanca.split('\n').filter((s) => !/^\s*\/\//.test(s) && /cron KURULMAZ/i.test(s))
    expect(basilan, 'karar 53: "cron KURULMAZ" genel yasak DEGIL — eski metin acilisa geri geldi').toEqual([])
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
