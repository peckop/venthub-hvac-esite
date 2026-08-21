#!/usr/bin/env node
/**
 * SessionStart hook — OTURUM KİMLİĞİ + PANO DURUMU bağlama enjekte edilir.
 *
 * Neden: ajan "ben hangi oturumum" sorusunu tahmin etmemeli. Claude Code oturum kimliğini
 * hook'a stdin ile verir; buradan bağlama yazılınca ajan onu OKUR. Kimlik compact'ten de
 * sağ çıkar (bağlam sıfırlansa bile SessionStart yeniden koşar).
 *
 * Ayrıca panonun o anki hâli (kim hangi şeritte, okunmamış notlar) ilk turda görünür olur —
 * böylece kullanıcı mesaj taşıyıcısı olmaktan kurtulur.
 *
 * stdin: { session_id, cwd, ... }
 * stdout: { hookSpecificOutput: { hookEventName, additionalContext } }
 */
const fs = require('fs')
const path = require('path')
const { spawn } = require('child_process')

function readStdin() {
  try { return fs.readFileSync(0, 'utf8') } catch { return '' }
}

let input = {}
try { input = JSON.parse(readStdin() || '{}') } catch { input = {} }

const sid = input.session_id || ''
if (!sid) process.exit(0)

/**
 * Registry oto-senkronu — KOPARILMIŞ süreç olarak başlatılır.
 *
 * Neden burada: `post-merge` kancası yalnız yerel `git pull/merge`'de koşar, biz ise PR'ları
 * `gh pr merge` ile GitHub üzerinden kapatıyoruz → senkron hiç çalışmıyordu. CI'a taşımak
 * ÇÖZÜM DEĞİL: registry `~/.orion/registry.db`, yani bu makinedeki yerel bir dosya; runner'da
 * boş bir DB yaratılır ve silinir (yeşil yanar, hiçbir şey senkronlanmaz). Üç oturum da aynı
 * makinede olduğu için doğru yer oturum açılışıdır.
 *
 * Neden koparılmış: `git fetch` ağ işidir; oturum açılışını bekletmemeli. Çıktı
 * `~/.orion/registry-autosync.log`'a düşer.
 */
try {
  const child = spawn(process.execPath, [path.join(__dirname, '..', '..', 'scripts', 'board', 'registry-autosync.cjs')], {
    detached: true,
    stdio: 'ignore',
  })
  child.unref()
} catch { /* senkron başlatılamadıysa oturumu bloklama — bir sonraki açılışta tekrar denenir */ }

let context = `Oturum kimliğin: ${sid}\n`

try {
  const board = require(path.join(__dirname, '..', '..', 'scripts', 'board', 'board.cjs'))
  const live = board.liveClaims()
  const mine = live.find(c => c.sid === sid)

  context += mine
    ? `Şeridin: ${mine.lane} — ${mine.globs.join(', ')}\n`
    : `Şeridin: TALEP EDİLMEMİŞ. Çok dosyalı bir işe başlamadan önce şeridi al:\n` +
      `  node scripts/board/board.cjs claim --sid ${sid} --lane <ad> --globs "src/**"\n`

  // MEKANİZMA (T115-VH) — oturumun İLK işi.
  //
  // Gözcü (Monitor), cron ve tur-sonu uyanışı ÜÇÜ DE bu oturumun içinde yaşar ve oturumla
  // birlikte ÖLÜR; yeni oturum onları devralmaz. 2026-08-20 sabahı dört oturum tam bu yüzden
  // SAĞIR açıldı ve Recep her birini elle dürtmek zorunda kaldı. Talimat dört kanaldan
  // ulaşmıştı; kurulum üretmedi. O yüzden hatırlatma artık oturumun kendi açılışına gömülü.
  try {
    const durum = board.gozcuDurumu ? board.gozcuDurumu(sid, Date.now()) : 'KANITSIZ'
    if (durum === 'CANLI') {
      context += 'MEKANIZMA: gozcun CANLI (imlec taze).\n'
    } else {
      context +=
        'MEKANIZMA — ILK IS BU (' + durum + '): uc katmani kur ve KANITLA.\n' +
        '  node scripts/board/mechanism-setup.cjs plan --sid ' + sid + ' --serit <SERIT>\n' +
        '  Kurulumdan sonra: mechanism-setup.cjs prob --sid ' + sid + '\n' +
        '  prob AYIRT EDICI testtir: gozcu olu olsaydi sonuc FARKLI olurdu. Beyan yeterli degil.\n'
    }
  } catch {
    /* ölçüm aracının kendisi patlarsa oturum yine açılır (fail-open, lane-guard ile aynı ilke) */
  }

  context += board.summary(sid) + '\n'

  const notes = board.notesFor(sid, mine && mine.lane)
  if (notes.length > 0) {
    context += 'OKUNMAMIŞ NOTLAR:\n' +
      notes.map(n => `  · ${String(n.sid).slice(0, 8)} → ${n.to || 'herkes'}: ${n.text}`).join('\n') + '\n'
  }
} catch (e) {
  // Pano okunamazsa oturum yine de açılır — koordinasyon katmanı fail-open (bkz. lane-guard).
  context += `(pano okunamadı: ${e && e.message})\n`
}

// YÖNTEM GÖSTERGESİ (T144-VH, Recep 08-21): ajan panoya baktığında cetveli de görsün —
// tarayıcıda ayrı sayfa değil, bakılan yerin yanında. Öneri, dayatma değil; sapma yazılır.
context += 'YÖNTEM CETVELİ (docs/standards/execution-method-standard.md): iş emrinde YÖNTEM: satırı ' +
  'ZORUNLU, seçim SERBEST (ölç, seç, sapmayı bir cümleyle yaz). Kısa harita: günler süren sahipli prod-kapılı iş=ŞERİT · ' +
  'çok-eksen salt-okuma ölçüm=Sonnet alt-ajan ×N · bağımsız çürütme/çok-eksen denetim=Workflow (emirde "workflow kullan") · ' +
  'aynı değişiklik çok hedefe=maestro · geniş tarama=agy-orchestrate · plan→plan-challenger (migration/veri göçü ZORUNLU) · ' +
  'PR=diff-review · tek dosya=elle. İkiz şerit açılmaz; canlı şerit tavanı 2-3.\n'

process.stdout.write(JSON.stringify({
  hookSpecificOutput: {
    hookEventName: 'SessionStart',
    additionalContext: context,
  },
}))
