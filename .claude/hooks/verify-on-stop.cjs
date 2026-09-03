#!/usr/bin/env node
/**
 * Stop hook (async) — verify-on-stop.
 * Bu turda JS/TS düzenlendiyse:
 *   1) `pnpm exec eslint --fix <dosyalar>`  (format + autofix — VentHub'da Prettier yok)
 *   2) `pnpm exec tsc --noEmit --pretty false`  (proje-geneli tip kontrolü)
 * Sonra tip hatalarını YALNIZCA bu turda düzenlenen dosyalara filtreler ve
 * varsa kullanıcıya systemMessage olarak gösterir. Bloklamaz (exit 0).
 *
 * Neden filtre: projede önceden var olan tip hataları sonsuz uyarıya yol açmasın
 * diye sadece bu turda dokunulan dosyalardaki hatalar raporlanır.
 */
const fs = require('fs');
const os = require('os');
const path = require('path');
const { spawnSync } = require('child_process');

function readStdin() {
  try { return fs.readFileSync(0, 'utf8'); } catch { return ''; }
}

let input = {};
try { input = JSON.parse(readStdin() || '{}'); } catch { /* yoksay */ }
const sessionId = (input && input.session_id) || 'nosession';

/**
 * ⭐§28 · TUR-SONU AĞAÇ AYRIŞMA UYARISI — Recep onaylı hüküm: KAPI DEĞİL, UYARI + SAYIM.
 *
 * NİÇİN TUR SONU: tehlike ölçüm komutunun kendisinde değil, ARADAKİ masum yardımcı
 * komutta (URUN ölçtü, 6. vaka): `node scripts/board/board.cjs` GÖRELİ yolla çağrılınca
 * bulunduğun dizindeki kopya koşar ve kabuğun cwd'sini oraya ÇEKER. Yani komut başına
 * beyan YETMEZ — beyan eden komut doğru koşar, ondan SONRAKİ komut kayar. Durumu tur
 * başına ölçmek, komut başına ölçmekten bu yüzden üstündür.
 *
 * NİÇİN SAYIM: altı vakanın BEŞİNDE zarar sıfırdı ve tam bu yüzden hiçbiri bir mekanizma
 * doğurmadı — bedelsiz hata en uzun yaşayandır (§27). Sayaç, sınıfı GÖRÜNÜR kılar:
 * "N. vaka" yazısı, zararsız tekrarların da bir maliyeti olduğunu gösterir.
 *
 * NİÇİN BU KANCAYA EKLENDİ, yeni kanca kaydedilmedi: yeni kanca `.claude/settings.json`
 * düzenlemek demektir, yani CONFIG. Bu iş akran iletisiyle geldi ve config'e akran sözüyle
 * dokunulmaz. Zaten kayıtlı olan Stop kancasını genişletmek aynı sonucu verir.
 */
let konumUyarisi = '';
try {
  const board = require(path.join(__dirname, '..', '..', 'scripts', 'board', 'board.cjs'));
  const konum = board.agacKonumu(process.cwd());
  if (!konum.olculdu) {
    // ÖLÇEMEMEK GEÇMEK DEĞİLDİR — sessiz kalmaz.
    konumUyarisi = `⚠️ §28: çalışma dizini ÖLÇÜLEMEDİ (${konum.sebep}). Bu satır alarmdır, "temiz" demek değil.`;
  } else if (konum.anaMi) {
    const talepler = (board.tumTalepler ? board.tumTalepler() : []) || [];
    const benim = talepler.filter((c) => String(c.sid) === String(sessionId));
    if (benim.length > 0) {
      /**
       * SAYIM: pano dizininde birikir, filo geneli görünür olsun.
       *
       * ⭐SAYIM MANTIĞI BURADA DEĞİL, `board.ayrismaSay`da (§26 TEK KAYNAK). Bu kanca onun
       * TÜKETİCİSİDİR — sayı iki yerde iki kez hesaplanırsa ikisi sessizce ayrışır.
       *
       * ⚠VAKA ile TUR AYRI BİRİMLER: ilk hâlinde bu sayaç her tur sonu artıyordu ama metin
       * "N. kayıtlı VAKA" diyordu. Ölçüldü: "6. vaka" → iki saat sonra "32. vaka", arada
       * 26 yeni ayrışma OLMADI, 26 TUR geçti. Alan adı BİRİMİ taahhüt eder.
       */
      const sayacYolu = path.join(board.BOARD_DIR, '.cwd-ayrisma-sayaci.json');
      let onceki = null;
      try { onceki = JSON.parse(fs.readFileSync(sayacYolu, 'utf8')); } catch { onceki = null; }
      const sayim = board.ayrismaSay(onceki, sessionId, process.cwd(), new Date().toISOString());
      // Yazılamazsa uyarı YİNE verilir: sayaç bir kolaylık, uyarı ise asıl iş.
      try { fs.writeFileSync(sayacYolu, JSON.stringify(sayim), 'utf8'); } catch { /* yoksay */ }
      konumUyarisi =
        `⚠️ §28 AĞAÇ AYRIŞMASI (${sayim.vaka}. vaka · ${sayim.tur}. tur) — ŞU AN PAYLAŞILAN ANA DİZİNDESİN.\n` +
        `   dizin: ${process.cwd()}\n` +
        `   Şerit talebin var (${benim.map((c) => c.lane).join(', ')}) ve şerit işi kendi worktree'sinde koşar.\n` +
        `   VAKA = ayrışmanın kendisi (aynı yerde kaldıkça artmaz) · TUR = ne kadar sürdüğü.\n` +
        `   Zarar OLMAMIŞ olabilir — vakaların beşinde olmadı, ve kapı doğmamasının sebebi tam buydu.\n` +
        `   Kanonik biçim: komutlarda MUTLAK yol, git için daima "git -C <ağaç>".`;
    }
  }
} catch { /* kanca hiçbir koşulda turu düşürmez */ }

/** Uyarıyı KAYBETMEDEN çık: erken çıkışlar da bu kapıdan geçer. */
function cikis(kod) {
  if (konumUyarisi) {
    try { process.stdout.write(JSON.stringify({ systemMessage: konumUyarisi }) + '\n'); } catch { /* geç */ }
  }
  process.exit(kod);
}

const acc = path.join(os.tmpdir(), `venthub-edited-${sessionId}.txt`);
let raw = '';
try { raw = fs.readFileSync(acc, 'utf8'); } catch { cikis(0); } // accumulator yok → bu turda TS edit yok
try { fs.unlinkSync(acc); } catch { /* geç */ }

const repoRoot = process.cwd();
const uniq = [...new Set(raw.split('\n').map((s) => s.trim()).filter(Boolean))]
  .filter((f) => /\.(ts|tsx|js|jsx|cjs|mjs)$/i.test(f) && fs.existsSync(f));
if (uniq.length === 0) cikis(0);

// 1) eslint --fix (best-effort; hook'u asla düşürmesin)
spawnSync('pnpm', ['exec', 'eslint', '--fix', ...uniq], { shell: true, stdio: 'ignore' });

// 2) tsc --noEmit --pretty false (8GB; parse edilebilir tek-satır hata çıktısı)
const tsc = spawnSync('pnpm', ['exec', 'tsc', '--noEmit', '--pretty', 'false'], {
  shell: true,
  encoding: 'utf8',
  env: Object.assign({}, process.env, { NODE_OPTIONS: '--max-old-space-size=8192' }),
});

const out = ((tsc.stdout || '') + (tsc.stderr || '')).toString();
const editedRel = new Set(uniq.map((f) => path.relative(repoRoot, f).replace(/\\/g, '/')));

const typeErrors = out
  .split('\n')
  .map((line) => line.replace(/\r$/, ''))
  .filter((line) => {
    const m = line.match(/^(.+?)\(\d+,\d+\):\s+error TS/);
    if (!m) return false;
    return editedRel.has(m[1].replace(/\\/g, '/'));
  });

if (typeErrors.length > 0) {
  const summary =
    `⚠️ verify-on-stop: bu turda düzenlenen dosyalarda tip hatası var:\n` +
    typeErrors.slice(0, 20).join('\n') +
    (typeErrors.length > 20 ? `\n… (+${typeErrors.length - 20} daha)` : '');
  // İKİ UYARI VARSA İKİSİ DE GÖRÜNÜR: tek JSON satırında birleştirilir, yoksa biri
  // diğerini bastırır ve "sessizce kaybolan uyarı" sınıfı doğar.
  process.stdout.write(JSON.stringify({
    systemMessage: konumUyarisi ? konumUyarisi + '\n\n' + summary : summary,
  }) + '\n');
  process.exit(0);
}
cikis(0);
