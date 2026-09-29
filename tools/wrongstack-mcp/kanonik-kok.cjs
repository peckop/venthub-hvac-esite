'use strict'
/**
 * KANONİK KÖK SARMALAYICISI — WrongStack MCP sunucusunu `--project-root` KANONİK köke çevrilmiş
 * olarak AYNI süreçte başlatır (karar 158, 2026-09-27).
 *
 * ⭐NİÇİN VAR (ÖLÇÜLDÜ 2026-09-27): WrongStack proje deposunu kök yolunun karmasından türetir ve
 * karma sürücü harfinin büyük/küçüğüne DUYARLI. Kod dizini İKİ kopyaya bölünmüştü:
 * `~/.wrongstack/projects/venthub-hvac-7e017f/codebase-index` (küçük `c:`, pencereler, 50 MB,
 * belgeler dahil) ve `…-1088d5/codebase-index` (büyük `C:`, terminal/worktree, 17 MB). Hangi
 * pencerenin hangi kopyayı okuduğu açılış biçimine bağlıydı; biri 09-17'den tazelenmemişti.
 * Posta kutusu aynı arızayı 09-21'de yaşadı ve `posta-kutusu.cjs` içindeki `kanonikKok` ile çözüldü
 * (sürücü harfi KÜÇÜK, worktree → ANA AĞAÇ). Burada AYNI işlev yeniden kullanılır — iki ayrı kural
 * iki ayrı kanonik üretirse ikiz kopya geri gelir.
 *
 * KULLANIM (.mcp.json):
 *   node tools/wrongstack-mcp/kanonik-kok.cjs \
 *        tools/wrongstack-mcp/node_modules/@wrongstack/<paket>/dist/cli.js --project-root . --stdio
 * İlk argüman sunucunun kilitli yerel yoludur (INV-WRONGSTACK-MCP-1 bu yolu .mcp.json'da arar).
 * Yalnız `node_modules/@wrongstack/*\/dist/cli.js` kabul edilir; başka dosya ÇALIŞTIRILMAZ (çıkış 1).
 * Sarmalayıcı bayrak EKLEMEZ ve çıkarmaz: --writable kararı .mcp.json'da görünür kalır.
 */

const path = require('node:path')
const { pathToFileURL } = require('node:url')
const { kokuKanonikle } = require('./posta-kutusu.cjs')

const PAKET_KOKU = path.join(__dirname, 'node_modules', '@wrongstack')

/** Verilen yolu çözer; kilitli @wrongstack paketinin dist/cli.js'i değilse null. */
function cliDogrula(verilen, cwd = process.cwd()) {
  if (typeof verilen !== 'string' || !verilen) return null
  const mutlak = path.resolve(cwd, verilen)
  const goreli = path.relative(PAKET_KOKU, mutlak)
  if (!goreli || goreli.startsWith('..') || path.isAbsolute(goreli)) return null
  const parca = goreli.split(path.sep)
  if (parca.length !== 3 || parca[1] !== 'dist' || parca[2] !== 'cli.js') return null
  return mutlak
}

/** Sunucuya verilecek argv; cli geçersizse null. Yan etkisiz — test bunu çağırır. */
function argvKur(argv0, args, cwd = process.cwd()) {
  const cli = cliDogrula(args[0], cwd)
  if (!cli) return null
  return [argv0, cli, ...kokuKanonikle(args.slice(1))]
}

async function calistir() {
  const argv = argvKur(process.argv[0], process.argv.slice(2))
  if (!argv) {
    process.stderr.write(
      'kanonik-kok: ilk arguman tools/wrongstack-mcp/node_modules/@wrongstack/<paket>/dist/cli.js degil — sunucu ACILMADI\n',
    )
    process.exit(1)
  }
  const i = argv.indexOf('--project-root')
  process.stderr.write(`kanonik-kok: ${path.basename(path.dirname(path.dirname(argv[1])))} kok=${i >= 0 ? argv[i + 1] : '(yok)'}\n`)
  process.argv = argv
  await import(pathToFileURL(argv[1]).href)
}

if (require.main === module) {
  calistir().catch((e) => {
    process.stderr.write(`kanonik-kok: ${e && e.stack ? e.stack : e}\n`)
    process.exit(1)
  })
}

module.exports = { cliDogrula, argvKur, PAKET_KOKU }
