#!/usr/bin/env node
/**
 * COMMIT ÖNCESİ İKİ UYARI — REC-267. ⛔BLOKLAMAZ, daima çıkış 0.
 *
 * ⭐NİÇİN UYARI, NİÇİN KAPI DEĞİL: `pre-commit` 2026-08-15'te tam bu sebeple bloklamaz
 * hâle getirildi — rastgele reddediyordu (aynı dosya 80/100 ↔ 100/100) ve `--no-verify`
 * alışkanlığı kazandırıyordu; o alışkanlık i18n paritesi gibi GERÇEK kapıları da atlatır.
 * O karar geri alınmıyor. Buradaki iki kol yalnız SÖYLER.
 *
 * ⭐NİÇİN VAR (ikisi de 2026-09-08'de ÖLÇÜLDÜ, tahmin değil):
 *
 * KOL 1 — İLAN EDİLMEMİŞ BETİK. `INV-ARAC-1` kapısı, yeni bir betiğin araç envanterinde
 * ilan edilmesini ister. O kapı CI'da koşuyor, yani kusur commit'ten SONRA görünüyor.
 * Bir günde DÖRT ayrı şerit buna takıldı ve dördüncüsü kapıyı YAZAN kişiydi — bu,
 * "dikkatsizlik" açıklamasını bitirdi: eksik olan dikkat değil, kapının UYARMA ayağıydı.
 * ⭐Uyarı satırı betiğin ADINI ve KOŞULACAK KOMUTU yazar (URUN-KATALOG'un şartı): o gün
 * dördü de kırmızıyı görüp komutu ARAMAKLA vakit kaybetti. "Envanter eksik" demek yetmez.
 *
 * KOL 2 — ŞERİT DALI ANA REPO AĞACINDAN. Aynı gün iki şeritte çalışma ağacı kaydı:
 * URUN'ün çalışma dizini şerit ağacından ana repoya kaydı (boş commit pushlandı, push
 * başarılı göründü, içerik yoktu); ALTYAPI'da rebase sonrası dal/ağaç ayrımı oluştu.
 * Daha ağır bir vaka da vardı: ana repoda `git add -A`, o an ağaçta duran BAŞKA şeritlerin
 * beş ekran görüntüsünü yabancı bir commit'e hapsetti (§28). İkisi de DİSİPLİNLE yakalandı,
 * araçla değil — bu kol o boşluğu kapatıyor.
 *
 * CETVEL: docs/standards/hafiza-kancalari-standard.md (kanca çevrimdışı ve hızlı olur) ·
 * docs/standards/collaboration-protocol.md (worktree izolasyonu) · REC-267 yorumları.
 *
 * ⛔ÜRETİLMİŞ ENVANTERE YAZMAZ (AXIOM 3): kanca "elle"nin otomatiği değildir; yalnız
 * koşulacak komutu söyler. Ağ yok, LLM yok, DB yok.
 */
const fs = require('node:fs')
const path = require('node:path')
const { execFileSync } = require('node:child_process')

/** Şerit dal önekleri — pano şerit adlarıyla aynı küme. */
const SERIT_ONEKLERI = ['urun/', 'urun-katalog/', 'altyapi/', 'ops/', 'design/']

/**
 * ⭐İLAN BEKLEYEN EVREN — "araç" YALNIZ BETİK DEĞİL. Bu liste bir ölçümle genişledi.
 *
 * İlk hâli yalnız `scripts/**` betiklerine bakıyordu. Aynı gün OPS ölçtü: envanter kapısı
 * (`arac-envanteri.cjs`) ALTI evren sayıyor ve **cetvelleri de** (`docs/standards/*.md`)
 * ilan bekletiyor — yeni bir cetvel ekleyen BEŞİNCİ şerit tam bu yüzden kırmızı aldı
 * (#1131). Yani kolun dar evreni, uyarmak için yazıldığı vakanın kendisini kaçırıyordu:
 * "ölçüt keskin, evren yanlış" sınıfının bir örneği daha.
 *
 * ⚠SINIRI ADIYLA: bu liste üreticinin evrenini TEKRAR EDİYOR, ondan TÜRETMİYOR. Üretici
 * yeni bir evren eklerse burası sessizce eksik kalır. Türetmek üreticiyi require etmeyi
 * ve onun depo-genişi taramasını commit anında koşturmayı gerektirirdi — kanca cetveli
 * "hızlı ve çevrimdışı" diyor, o tarama saniyeler sürüyor. Bilinçli takas; kopyanın
 * ayrışması bir konformans koluyla değil, bu satırla insana bırakılıyor.
 */
const ILAN_BEKLEYEN = [
  /^scripts\/.+\.(mjs|cjs|js|ts|py|ps1|sh)$/, // §3.2 betikler (.ts DAHİL — tsx ile koşanlar var)
  /^\.claude\/hooks\/.+\.cjs$/, // §3.1 kancalar
  /^\.githooks\/(?!.*\.md$).+$/, // §3.4 git kancaları (md hariç)
  /^\.github\/workflows\/.+\.yml$/, // §3.5 iş akışları
  /^docs\/standards\/.+\.md$/, // §3.6 cetveller — BEŞİNCİ vakanın evreni
]

function git(args, opts = {}) {
  return execFileSync('git', args, { encoding: 'utf8', stdio: ['ignore', 'pipe', 'ignore'], ...opts }).trim()
}

/**
 * ⭐ENVANTER DOSYASI GLOB İLE BULUNUR, SABİT ADLA DEĞİL — bugün ödenmiş ders (REC-274).
 *
 * Envanter/karar belgeleri her gün yeni TARİH DAMGASIYLA yeniden yazılıp eski kopya
 * siliniyor (`...-2026-09-07.md` → `...-09-08.md`). Sabit ada bakan bir ölçüm, dosya
 * yenilendiği gün SESSİZCE hiçbir şey bulamaz hâle gelir — ve "ilan edilmiş" diye geçer.
 * Bu yüzden en YENİ eşleşen dosya seçilir; hiç yoksa kol susar (yokluk uyarı üretmez,
 * çünkü envanterin kendisi yoksa söylenecek komut da yanlış olurdu).
 */
function envanterDosyasi(kok) {
  const dizin = path.join(kok, 'docs', 'audits')
  let adlar
  try {
    adlar = fs.readdirSync(dizin).filter((a) => /^arac-envanteri-\d{4}-\d{2}-\d{2}\.md$/.test(a))
  } catch {
    return null
  }
  if (adlar.length === 0) return null
  adlar.sort()
  return path.join(dizin, adlar[adlar.length - 1])
}

function kol1IlanEdilmemisBetik(kok, eklenen) {
  const adaylar = eklenen.filter((y) => ILAN_BEKLEYEN.some((d) => d.test(y)))
  if (adaylar.length === 0) return []

  const dosya = envanterDosyasi(kok)
  if (!dosya) return []
  const envanter = fs.readFileSync(dosya, 'utf8')

  // Ölçüt: betiğin YOLU envanter metninde geçiyor mu. Yol araması ad aramasından
  // daha sıkı — iki dizinde aynı adlı betik varsa biri diğerini ilan etmiş saymaz.
  return adaylar.filter((y) => !envanter.includes(y))
}

function kol2SeritDaliAnaAgacta(kok) {
  let gitDir
  try {
    gitDir = git(['rev-parse', '--git-dir'], { cwd: kok })
  } catch {
    return null
  }
  // ⭐AYRIM ÖLÇÜLDÜ (2026-09-08): ana repoda `--git-dir` = `.git`; worktree'de
  // `<ana>/.git/worktrees/<ad>`. Yani "worktrees" segmenti worktree'nin imzasıdır.
  const worktreeIcinde = gitDir.replace(/\\/g, '/').includes('/.git/worktrees/')
  if (worktreeIcinde) return null

  let dal
  try {
    dal = git(['rev-parse', '--abbrev-ref', 'HEAD'], { cwd: kok })
  } catch {
    return null
  }
  const onek = SERIT_ONEKLERI.find((o) => dal.startsWith(o))
  return onek ? dal : null
}

function main() {
  let kok
  try {
    kok = git(['rev-parse', '--show-toplevel'])
  } catch {
    // Kimlik ölçülemedi: FAIL-OPEN ama SESSİZ DEĞİL (kanca cetvelinin şartı).
    console.log('[commit-uyari] git kokleri okunamadi — uyarilar ATLANDI (commit engellenmedi).')
    process.exit(0)
  }

  let eklenen = []
  try {
    eklenen = git(['diff', '--cached', '--name-only', '--diff-filter=A'])
      .split('\n')
      .map((s) => s.trim())
      .filter(Boolean)
  } catch {
    eklenen = []
  }

  const ilansiz = kol1IlanEdilmemisBetik(kok, eklenen)
  for (const y of ilansiz) {
    // Betik ADI ve KOMUT yazılır — "envanter eksik" demek vakit kaybettiriyordu.
    console.log(`[commit-uyari] ⚠ ${y} arac envanterinde ILAN EDILMEMIS (INV-ARAC-1 CI'da KIRMIZI verir).`)
    console.log('[commit-uyari]   kos: node scripts/hijyen/arac-envanteri.cjs --yaz')
    console.log('[commit-uyari]   sonra YENI satirin durum/sahip alanlarini ELLE doldur (AXIOM 3).')
  }

  const seritDali = kol2SeritDaliAnaAgacta(kok)
  if (seritDali) {
    console.log(`[commit-uyari] ⚠ serit dali '${seritDali}' ANA REPO agacinda — worktree mi olmaliydi?`)
    console.log('[commit-uyari]   ana agacta serit isi: olcum yanlis agaci gosterir, `git add -A` BASKA')
    console.log('[commit-uyari]   seritlerin kirli dosyalarini da commitler (2026-09-08 vakasi, §28).')
    console.log('[commit-uyari]   kanonik: git -C <serit-agaci> ... · cetvel collaboration-protocol.')
  }

  if (ilansiz.length === 0 && !seritDali) {
    // Sessiz geçmek doğru: her commit'te yanan uyarı iki günde mobilyaya döner.
    process.exit(0)
  }
  console.log('[commit-uyari] Bu bir UYARI — commit ENGELLENMEDI.')
  process.exit(0)
}

main()
