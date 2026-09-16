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
/**
 * ⭐REC-130 · İKİ KUSUR ONARILDI (2026-09-07) — lamba artık AYIRT EDİYOR.
 *
 * KUSUR 1 — EVREN YANLIŞTI: bu blok `board.agacKonumu(process.cwd())` ile KENDİ cwd'sini
 * okuyordu. Cetvel §9.1 tam bunu yasaklıyor: kabuk cwd'si sessizce ana çalışma dizinine
 * resetlenir, yani kancanın gördüğü dizin komutların KOŞTUĞU dizin değildir. Ana dizinde
 * açılmış bir şerit oturumu için lamba HİÇBİR KOŞULDA sönmüyordu.
 * ÖLÇÜLDÜ, iki şerit BAĞIMSIZ (2026-09-07): ALTYAPI bütün komutlarını `vh-altyapi-envanter`,
 * OPS bütün komutlarını `ops-gun-kapanisi` ağacında koştu; lamba İKİSİNE DE yandı ve aynı
 * "752. vaka"yı gösterdi. Her şeyi doğru yapan oturumu yanlış yapandan ayırt edemeyen bir
 * gösterge ölçüm değildir — ve sürekli yanan lamba birkaç gün içinde mobilyaya döner.
 * ONARIM: hüküm artık BU TURDA GERÇEKTEN KOŞAN komutlara dayanıyor. `bash-write-audit.cjs`
 * her Bash çağrısında komut metnini ölçer ve dizinini BEYAN ETMEYEN ölçüm komutlarını
 * kaydeder; burada o kayıt okunur. Kayıt boşsa lamba SUSAR — yani doğru davranmakla
 * söndürülebilir hâle geldi.
 *
 * KUSUR 2 — SAYAÇ FİLO-GENELİ PAYLAŞILIYORDU: tek dosyada tek `son` alanı vardı ve
 * `ayrismaSay`ın "aynı yer mi" kontrolü `son.sid`e bağlı. Dört şerit dönüşümlü tur bitirdiği
 * için `son.sid` neredeyse her turda değişiyor, `vaka` da her turda artıyordu. Ölçüldü:
 * 752 vaka / 1322 tur — gerçekte 752 ayrı ayrışma YOK, `vaka` şerit DEĞİŞİMİNİ sayıyordu.
 * Bu, #977'nin kardeşi: o PR `vaka` ile `tur`un BİRİMİNİ ayırdı, sayacın PAYLAŞILDIĞINI
 * görmedi. Birim düzeldi, evren düzelmedi.
 * ONARIM: durum dosya İÇİNDE şerit başına ayrıldı (`seritler[sid]`). Dosya ADI korunuyor —
 * `docs/audits/arac-envanteri-*.md` bu adı verify-on-stop'un koşum izi olarak gösteriyor ve
 * o üretilmiş belgeye elle dokunulmaz (AXIOM 3); ayrıca tek dosya filo görünürlüğünü sürdürür.
 *
 * ⭐SAYIM MANTIĞI YİNE `board.ayrismaSay`da (§26 TEK KAYNAK) — imzası DEĞİŞMEDİ. Burada
 * yalnız ona verilen dilim şerit-özel oldu. Sayı iki yerde iki kez hesaplanırsa ikisi
 * sessizce ayrışır.
 *
 * ⚠VAKA ile TUR AYRI BİRİMLER: ilk hâlinde sayaç her tur sonu artıyordu ama metin "N. kayıtlı
 * VAKA" diyordu. Alan adı BİRİMİ taahhüt eder (#977).
 *
 * ⚠TUR BAŞINA ÖLÇÜM KORUNDU: yukarıdaki gerekçe hâlâ geçerli — tehlike beyan eden komutta
 * değil, ondan SONRAKİ göreli komutta. O yüzden hüküm komut başına verilmiyor, tur sonunda
 * veriliyor; komut kaydı yalnızca KANIT. Ve o göreli komut (`node scripts/...`) kaydedicinin
 * ölçüm kalıbının tam içindedir, yani 6. vakanın kendisi artık görünür.
 */
let konumUyarisi = '';
try {
  const board = require(path.join(__dirname, '..', '..', 'scripts', 'board', 'board.cjs'));
  const kisaSid = String(sessionId).slice(0, 8);
  const beyansizYolu = path.join(board.BOARD_DIR, '.beyansiz-olcum.' + kisaSid + '.json');

  let beyansiz = [];
  try {
    const o = JSON.parse(fs.readFileSync(beyansizYolu, 'utf8'));
    if (Array.isArray(o)) beyansiz = o;
  } catch { beyansiz = []; }
  // Kayıt TUR BAŞINA tüketilir: bu turun ölçümü bir sonraki tura sarkmasın, yoksa lamba
  // tek bir vakadan sonra yine sürekli yanar hâle gelirdi.
  try { fs.unlinkSync(beyansizYolu); } catch { /* yoksay */ }

  const talepler = (board.tumTalepler ? board.tumTalepler() : []) || [];
  const benim = talepler.filter((c) => String(c.sid) === String(sessionId));

  if (benim.length > 0 && beyansiz.length > 0) {
    // Komutun KOŞTUĞU dizin ölçülür, kancanın kendi cwd'si DEĞİL (§9.1).
    const olculenDizin = String((beyansiz[beyansiz.length - 1] || {}).cwd || '');
    const konum = board.agacKonumu(olculenDizin);
    if (!konum.olculdu) {
      // ÖLÇEMEMEK GEÇMEK DEĞİLDİR — sessiz kalmaz.
      konumUyarisi = `⚠️ §28: ölçüm komutunun dizini ÖLÇÜLEMEDİ (${konum.sebep}). Bu satır alarmdır, "temiz" demek değil.`;
    } else if (konum.anaMi) {
      const sayacYolu = path.join(board.BOARD_DIR, '.cwd-ayrisma-sayaci.json');
      let dosya = null;
      try { dosya = JSON.parse(fs.readFileSync(sayacYolu, 'utf8')); } catch { dosya = null; }
      const kok = dosya && typeof dosya === 'object' ? dosya : {};
      const seritler = kok.seritler && typeof kok.seritler === 'object' ? kok.seritler : {};
      const sayim = board.ayrismaSay(seritler[sessionId] || null, sessionId, olculenDizin, new Date().toISOString());
      // Yazılamazsa uyarı YİNE verilir: sayaç bir kolaylık, uyarı ise asıl iş.
      try {
        fs.writeFileSync(sayacYolu, JSON.stringify({ ...kok, seritler: { ...seritler, [sessionId]: sayim } }), 'utf8');
      } catch { /* yoksay */ }

      const ornekler = beyansiz.slice(-2).map((k) => '     · ' + String(k.komut || '')).join('\n');
      konumUyarisi =
        `⚠️ §28 BEYANSIZ ÖLÇÜM (${sayim.vaka}. vaka · ${sayim.tur}. tur · bu turda ${beyansiz.length} komut) — ANA DİZİNDE KOŞTU.\n` +
        `   dizin: ${olculenDizin}\n` +
        `   Şerit talebin var (${benim.map((c) => c.lane).join(', ')}) ve şerit işi kendi worktree'sinde koşar.\n` +
        `   Dizinini BEYAN ETMEYEN ölçüm komutları:\n${ornekler}\n` +
        `   VAKA = ayrışmanın kendisi (aynı yerde kaldıkça artmaz) · TUR = ne kadar sürdüğü.\n` +
        `   Zarar OLMAMIŞ olabilir — vakaların beşinde olmadı, ve kapı doğmamasının sebebi tam buydu.\n` +
        `   Kanonik biçim: komutlarda MUTLAK yol, git için daima "git -C <ağaç>". Beyan edersen BU SATIR SUSAR.`;
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

/**
 * ⭐3) YAZILDIĞI ANDA TEST KOŞUMU (Recep kararı 2026-09-16; WrongStack `test-runner-gate`
 * fikri, uygulama bizden).
 *
 * NİÇİN: hatayı yazıldığı anda bulmanın tek deterministik yolu, düzenlenen dosyanın testini
 * o turda koşmaktır. Bu kanca bugüne dek lint+tsc koşuyordu; tip hatası olmayan mantık hatası
 * ancak PR'da (kapı botu) ya da hiç görünüyordu. Ayrıca repoda "test-önce" diye hiçbir kural
 * veya sayı YOKTU (2026-09-16 ölçüldü: CLAUDE.md ve 70 cetvelde geçmiyor). Kural koymak yerine
 * ÖLÇÜYORUZ: "testsiz değişiklik" sayılır; sayı bir ay düşmezse kapıya çevrilir (Recep kararı).
 *
 * NASIL: `vitest related <src dosyaları> --run` — vitest import grafiğinden o dosyayı çeken
 * test dosyalarını bulur ve yalnız onları koşar (2026-09-16 ölçüldü: tek dosya ~11 sn;
 * testi olmayan dosyada "No test files found"). Adla eşleme YAPILMAZ; `__tests__/x.test.ts`
 * de, `conformance/*.test.ts` de import ediyorsa gelir.
 * "Testsiz" sayımı ayrı ve ucuz: hiçbir test dosyası bu modülü import etmiyorsa testsizdir
 * (`git grep` ile statik; vitest'i dosya başına koşmak N×11 sn olurdu).
 *
 * SINIR: yalnız `src/**` kaynak dosyaları (test, d.ts, __tests__ hariç). BLOKLAMAZ (exit 0):
 * kanca bir kalite ağıdır, kapı değil — kapı PR'dadır. 120 sn zaman aşımı: aşarsa "ölçemedim"
 * yazar, "temiz" DEMEZ (ölçememek geçmek değildir).
 */
let testOzeti = '';
try {
  const srcFiles = uniq
    .map((f) => path.relative(repoRoot, f).replace(/\\/g, '/'))
    .filter((f) => /^src\//.test(f) && /\.(ts|tsx)$/.test(f) && !/\.test\.tsx?$/.test(f) && !/\.d\.ts$/.test(f) && !/__tests__\//.test(f));
  if (srcFiles.length > 0) {
    // (a) testsiz dosyalar — statik: hiçbir *.test.ts(x) bu modülü import etmiyor.
    // Eşleme "üst dizin/ad" ya da "./ad" ile — yalnız ad ile eşleme çok gevşek (2026-09-16
    // ölçüldü: `app/layout.tsx` için `components/layout` import eden test "var" sayıldı).
    const esc = (s) => s.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
    const testsiz = [];
    for (const f of srcFiles) {
      const base = path.basename(f).replace(/\.(ts|tsx)$/, '');
      const ust = path.basename(path.dirname(f));
      const desen = `from ['"]([^'"]*/${esc(ust)}/${esc(base)}|\\.\\.?/${esc(base)})(\\.tsx?)?['"]`;
      const g = spawnSync('git', ['grep', '-l', '-E', desen, '--', '*.test.ts', '*.test.tsx'], { encoding: 'utf8' });
      if (!(g.stdout || '').trim()) testsiz.push(f);
    }
    // (b) ilgili testleri koş
    const vt = spawnSync('pnpm', ['exec', 'vitest', 'related', ...srcFiles, '--run', '--reporter=dot'], {
      shell: true, encoding: 'utf8', timeout: 120_000,
      env: Object.assign({}, process.env, { CI: '1' }),
    });
    const vo = ((vt.stdout || '') + (vt.stderr || '')).toString();
    const kosulanM = vo.match(/Test Files\s+(.+)/);
    const kaldi = vo.split('\n').filter((l) => /^\s*(FAIL|×|✗)\s/.test(l) || /\bFAIL\b.*\.test\.tsx?/.test(l)).slice(0, 10);
    let satir;
    if (vt.error && vt.error.code === 'ETIMEDOUT') satir = '🧪 tur-sonu test: ÖLÇEMEDİM (120 sn aşıldı) — bu satır "temiz" demek değil.';
    else if (/No test files found/.test(vo)) satir = `🧪 tur-sonu test: ${srcFiles.length} kaynak dosya düzenlendi, HİÇBİRİNİN testi yok.`;
    else if (kosulanM) satir = `🧪 tur-sonu test (vitest related): Test Files ${kosulanM[1].trim()}` + (kaldi.length ? '\n' + kaldi.map((l) => '   ' + l.trim()).join('\n') : '');
    else satir = '🧪 tur-sonu test: çıktı ayrıştırılamadı — ÖLÇEMEDİM (vitest exit ' + vt.status + ').';
    if (testsiz.length) satir += `\n   testsiz değişiklik: ${testsiz.length}/${srcFiles.length} — ${testsiz.slice(0, 8).join(', ')}${testsiz.length > 8 ? ' …' : ''}`;
    testOzeti = satir;
    // (c) sayaç — şerit başına, pano dizininde (ölçüm; bir ay sonra kapı kararı Recep'in)
    try {
      const board = require(path.join(__dirname, '..', '..', 'scripts', 'board', 'board.cjs'));
      const sayacYolu = path.join(board.BOARD_DIR, '.test-kosum-sayaci.json');
      let kok = {};
      try { kok = JSON.parse(fs.readFileSync(sayacYolu, 'utf8')) || {}; } catch { kok = {}; }
      const s = (kok[sessionId] && typeof kok[sessionId] === 'object') ? kok[sessionId] : { tur: 0, kaynak: 0, testsiz: 0, kalan: 0 };
      s.tur += 1; s.kaynak += srcFiles.length; s.testsiz += testsiz.length; s.kalan += kaldi.length; s.son = new Date().toISOString();
      fs.writeFileSync(sayacYolu, JSON.stringify({ ...kok, [sessionId]: s }), 'utf8');
    } catch { /* sayaç kolaylıktır, uyarı asıl iş */ }
  }
} catch { /* kanca hiçbir koşulda turu düşürmez */ }

const parcalar = [];
if (konumUyarisi) parcalar.push(konumUyarisi);
if (typeErrors.length > 0) {
  parcalar.push(
    `⚠️ verify-on-stop: bu turda düzenlenen dosyalarda tip hatası var:\n` +
    typeErrors.slice(0, 20).join('\n') +
    (typeErrors.length > 20 ? `\n… (+${typeErrors.length - 20} daha)` : ''),
  );
}
if (testOzeti) parcalar.push(testOzeti);
// BİRDEN ÇOK UYARI VARSA HEPSİ GÖRÜNÜR: tek JSON satırında birleştirilir, yoksa biri
// diğerini bastırır ve "sessizce kaybolan uyarı" sınıfı doğar.
if (parcalar.length > 0) {
  process.stdout.write(JSON.stringify({ systemMessage: parcalar.join('\n\n') }) + '\n');
}
process.exit(0);
