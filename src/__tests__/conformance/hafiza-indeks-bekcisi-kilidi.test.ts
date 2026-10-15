/**
 * REC-280 — hafıza indeksi bekçisinin DÜZENEĞİNİ korur.
 *
 * NİÇİN VAR (ölçülmüş vaka, 2026-09-07 20:41–20:57Z): `MEMORY.md` 16384 baytı aşınca alt
 * satırlar **sessizce** kırpılıyor; o gece 16510 bayta çıktı ve en alttaki dersler hiçbir
 * oturuma yüklenmedi. Aynı dakikalarda üç şerit ayrı ayrı kısalttı ve **son yazan öncekini
 * ezdi**. İki ayrı kusur: taşma görünmüyordu, kayıp yazım hiç görünmüyordu.
 *
 * Bu paket kancanın "doğru karar verdiğini" değil, **uyarı olarak kaldığını**, **ayırt
 * ettiğini** ve **kimlik sızdırmadığını** ölçer. Davranış kolları gerçek koşumla ölçülür:
 * kaynak taraması, bir kolun sessizce ölmesini görmez.
 */
import { spawnSync } from 'node:child_process'
import fs from 'node:fs'
import os from 'node:os'
import path from 'node:path'

import { describe, expect, it } from 'vitest'

function repoKoku(): string {
  return spawnSync('git', ['rev-parse', '--path-format=absolute', '--show-toplevel'], {
    encoding: 'utf8',
  }).stdout.trim()
}
const KOK = repoKoku()
const oku = (p: string): string => fs.readFileSync(path.join(KOK, p), 'utf8')

const KANCA = '.claude/hooks/hafiza-indeks-bekcisi.cjs'
const PRECOMPACT = '.claude/hooks/precompact-durum-kapisi.cjs'

/** Fikstür hafıza dizini kurar: 40 satırlık indeks + BİRİ katlanmış ders. */
function fiksturKur(): { kok: string; idx: string; transcript: string; ham: string } {
  const kok = fs.mkdtempSync(path.join(os.tmpdir(), 'rec280-'))
  const m = path.join(kok, 'memory')
  fs.mkdirSync(m)
  const satirlar = ['# Memory Index', '']
  for (let i = 1; i <= 40; i++) {
    const n = String(i).padStart(2, '0')
    satirlar.push(`- [Ders Basligi Numara ${n}](ders-${n}.md) — bu satir olcum icin uretildi`)
  }
  const ham = satirlar.join('\n') + '\n'
  const idx = path.join(m, 'MEMORY.md')
  fs.writeFileSync(idx, ham, 'utf8')
  // KATLANMIŞ ders: başlığı bir dizin dosyasında geçiyor → kol SUSMALI
  fs.writeFileSync(path.join(m, 'dizin-ornek.md'), '## Ders Basligi Numara 07\nkatlandi.\n', 'utf8')
  const transcript = path.join(kok, 'sahte.jsonl')
  fs.writeFileSync(transcript, '{}\n', 'utf8')
  return { kok, idx, transcript, ham }
}

function kos(
  transcript: string,
  toolInput: Record<string, unknown>,
  kanca: string = path.join(KOK, KANCA),
): { kod: number | null; cikti: string } {
  const r = spawnSync(process.execPath, [kanca], {
    input: JSON.stringify({
      session_id: 'sahte',
      transcript_path: transcript,
      tool_name: 'Write',
      tool_input: toolInput,
    }),
    encoding: 'utf8',
  })
  return { kod: r.status, cikti: `${r.stdout ?? ''}${r.stderr ?? ''}` }
}

describe('REC-280 · hafıza indeksi bekçisi UYARI olarak kalıyor ve AYIRT EDİYOR', () => {
  it('settings.json PreToolUse listesinde BAĞLI (bağlanmamış kanca yoktur)', () => {
    const s = JSON.parse(oku('.claude/settings.json')) as {
      hooks: { PreToolUse: Array<{ matcher?: string; hooks: Array<{ command: string }> }> }
    }
    const komutlar = s.hooks.PreToolUse.flatMap((g) =>
      g.hooks.map((h) => `${g.matcher ?? ''}::${h.command}`),
    )
    const bagli = komutlar.find((k) => k.includes('hafiza-indeks-bekcisi.cjs'))
    expect(bagli, 'kanca settings.json PreToolUse altında bağlı değil — koşmayan kanca YOKTUR').toBeTruthy()
    expect(bagli, 'yazma araçlarına bağlanmamış: Edit|Write|MultiEdit eşleştiricisi gerekli').toContain('Write')
  })

  it('⛔ENGEL YALNIZ SERT EŞİKTE: exit 2 tek bir yerde (KOL C), bekçinin KENDİ hatası yazımı engellemez', () => {
    const s = oku(KANCA)
    // REC-433 1.9 (Ops kararı): "uyarı yetmedi" — sert eşikte yazım ENGELLENİR. Engel dalı tektir; başka
    // yerde exit 2 çıkarsa bekçi her uyarıda yazımı durdurmaya başlar (hafıza kaydı kaybı).
    expect((s.match(/process\.exit\(2\)/g) ?? []).length, 'exit 2 tam bir yerde olmalı (sert eşik dalı)').toBe(1)
    // OPS şartı: bekçi kendi hatasında SESSİZ olmasın (fail-open kapı dersi) ve YAZIMI ENGELLEMESİN.
    expect(s, 'kendi hatasını söyleyen dal yok — "uyarı gelmedi" ile "bekçi çalışmadı" ayırt edilemez olur').toMatch(/BEKCI CALISAMADI/)
    const catchGovdesi = s.slice(s.lastIndexOf('BEKCI CALISAMADI'))
    expect(catchGovdesi, 'bekçinin kendi hatası yazımı engelliyor — bozuk kapı hafıza yazımını durdurur').toMatch(/process\.exit\(0\)/)
  })

  /**
   * ⛔MUTLAK KULLANICI YOLU YASAĞI KALIR; gevşeyen tek şey `projeDiziniBul` adı.
   *
   * 2026-09-30 HARİTA kararı 4: departman hafızası ortak aday işlevi ister, mutlak kullanıcı yolu
   * yasağı kalır. Yani `projeDiziniBul` yalnız ORTAK (paylaşılan modülden `require` edilen) aday işlevi
   * olarak serbesttir; kancanın İÇİNDE yerel türetim (oturumun proje dizinine bakan eski kusurlu
   * yol: başka projenin indeksinde yalancı uyarı + worktree kör noktası) YASAK kalır. Bu PR ortak
   * işlevi YAZMAZ (bekçi hedefi yazılan dosyanın yolundan türetir, aday kümesi gerekmez); test yalnız
   * hazırlığı yapar: işlev sonradan gelirse hangi biçimde gelebileceğini bugünden kilitler.
   *
   * Dedektörler tek yerde tanımlı ve aşağıda SABOTAJ testiyle dişleri kanıtlanır: yasağı gevşetirken
   * testin gerçek koruma gücü düşmesin (kullanıcı yolu gömülürse hâlâ kırmızı).
   */
  // `[\\/]+`: kaynakta Windows yolu ÇİFT ters bölüyle yazılır (`'C:\\Users\\x'`); tek bölülü kalıp bunu kaçırırdı.
  const kullaniciYoluVar = (s: string): boolean => /[A-Za-z]:[\\/]+Users[\\/]|\/Users\/|\/home\/[a-z]/.test(s)
  // Kullanıcı yolu türevi SABİT: modül düzeyinde (satır başı) `os.homedir()` ile kurulan değişken.
  const evDiziniSabiti = (s: string): boolean => /^(?:const|let|var)\s+\w+\s*=[^\n]*os\.homedir\(\)/m.test(s)
  const yorumDegil = (s: string): string[] => s.split('\n').filter((l) => !/^\s*(?:\/\/|\/?\*)/.test(l))
  // `projeDiziniBul` yerel TANIMLANMIŞ mı (function ya da atama)? `require` ile alınması tanım değildir.
  const yerelProjeDiziniTanimi = (s: string): boolean =>
    yorumDegil(s).some(
      (l) =>
        /\bfunction\s+projeDiziniBul\b/.test(l) ||
        (/\bprojeDiziniBul\s*=/.test(l) && !/\brequire\(/.test(l)),
    )
  // Kullanıldıysa (yorum dışı) en az bir satırda `require(` ile paylaşılan modülden gelmeli.
  const projeDiziniBulRequiredsiz = (s: string): boolean => {
    const satirlar = yorumDegil(s).filter((l) => /\bprojeDiziniBul\b/.test(l))
    return satirlar.length > 0 && !satirlar.some((l) => /\brequire\(/.test(l))
  }

  it('⛔MUTLAK KULLANICI YOLU YAZILMAZ (§24 kimlik sızdırma — depo PUBLIC), dizin yazılan dosyanın yolundan türetilir', () => {
    const s = oku(KANCA)
    expect(kullaniciYoluVar(s), 'kancada kullanıcı adı taşıyan mutlak yol var — public depoda kimlik sızdırır').toBe(false)
    // Oturumun proje dizini KULLANILMAZ: yazılan dosyanın kendisi ölçülür (yanlış pozitif + worktree kör noktası).
    expect(s, 'hafıza dizini yazılan dosyanın yolundan türetilmiyor').toMatch(/path\.dirname\(hedef\)/)
    // Kancanın kendisi ev dizinine hiç bakmaz (aday işlevi ortak modülde yaşayacak, kancada değil).
    expect(s, 'kanca os.homedir() kullanıyor — kullanıcı yolu türetimi ortak aday işlevine aittir').not.toMatch(/os\.homedir\(\)/)
    expect(
      yerelProjeDiziniTanimi(s),
      'kancada YEREL projeDiziniBul tanımı var — oturumun proje dizinine bakan eski türetim geri gelmiş (başka projenin indeksinde yalancı uyarı)',
    ).toBe(false)
    expect(
      projeDiziniBulRequiredsiz(s),
      'projeDiziniBul kullanılıyor ama paylaşılan modülden require edilmiyor — yalnız ORTAK aday işlevi serbesttir',
    ).toBe(false)
  })

  it('⛔ORTAK aday işlevi (yazılırsa): hafıza yardımcı modüllerinde kullanıcı yolu SABİTİ yok (yol çalışma anında türetilir)', () => {
    const lib = path.join(KOK, '.claude/hooks/lib')
    const adaylar = fs.existsSync(lib)
      ? fs.readdirSync(lib).filter((a) => a.endsWith('.cjs') && /hafiza|aday/.test(a))
      : []
    // Bu PR ortak işlevi yazmaz: liste boş olabilir. Yazıldığı gün bu test onu OTOMATİK kapsar.
    for (const a of adaylar) {
      const s = fs.readFileSync(path.join(lib, a), 'utf8')
      expect(kullaniciYoluVar(s), `${a}: kullanıcı adı taşıyan mutlak yol gömülü`).toBe(false)
      expect(evDiziniSabiti(s), `${a}: os.homedir() ile türetilmiş MODÜL SABİTİ var (yol çalışma anında, işlev içinde türetilir)`).toBe(false)
    }
  })

  it('⭐SABOTAJ: yasağı gevşetmek dedektörlerin dişini almadı — gömülü kullanıcı yolu / ev dizini sabiti / yerel projeDiziniBul HÂLÂ yakalanır', () => {
    // Örnek yollar PARÇALI kurulur: gerçek kimlik-yolu kalıbı bu dosyanın kendi metnine girmesin (mutlak-yol-sizintisi kapısı tarar).
    const KULLANICILAR = 'Us' + 'ers'
    const EV = 'ho' + 'me'
    const gomuluYol = `const HAFIZA = 'C:/${KULLANICILAR}/biri/.claude/projects/x/memory'\n`
    expect(kullaniciYoluVar(gomuluYol), 'Windows kullanıcı yolu yakalanmadı').toBe(true)
    expect(kullaniciYoluVar(`const H = 'C:\\\\${KULLANICILAR}\\\\biri\\\\x'`), 'ters bölülü kullanıcı yolu yakalanmadı').toBe(true)
    expect(kullaniciYoluVar(`const H = '/${KULLANICILAR}/biri/x'`), 'macOS kullanıcı yolu yakalanmadı').toBe(true)
    expect(kullaniciYoluVar(`const H = '/${EV}/biri/x'`), 'Linux kullanıcı yolu yakalanmadı').toBe(true)

    const sabit = "const os = require('os')\nconst HAFIZA = path.join(os.homedir(), '.claude', 'projects')\n"
    expect(evDiziniSabiti(sabit), 'os.homedir() ile türetilmiş modül sabiti yakalanmadı').toBe(true)
    // İşlev İÇİNDE (girintili) ev dizini kullanımı sabit değildir: ortak aday işlevi bunu yapabilir.
    expect(evDiziniSabiti('function adaylar() {\n  const ev = os.homedir()\n  return ev\n}\n'), 'işlev içi kullanım sabit sayıldı').toBe(false)

    expect(yerelProjeDiziniTanimi('function projeDiziniBul(t) { return path.dirname(t) }\n'), 'yerel function tanımı yakalanmadı').toBe(true)
    expect(yerelProjeDiziniTanimi('const projeDiziniBul = (t) => path.dirname(t)\n'), 'yerel atama tanımı yakalanmadı').toBe(true)
    expect(projeDiziniBulRequiredsiz('const d = projeDiziniBul(transcript)\n'), 'require edilmeyen kullanım yakalanmadı').toBe(true)

    const mesru = "const { projeDiziniBul } = require('./lib/hafiza-aday.cjs')\nconst d = projeDiziniBul(t)\n// function projeDiziniBul yorumdur\n"
    expect(yerelProjeDiziniTanimi(mesru), 'paylaşılan modülden require yerel tanım sayıldı').toBe(false)
    expect(projeDiziniBulRequiredsiz(mesru), 'require edilen ortak işlev yasaklandı').toBe(false)
    expect(kullaniciYoluVar(mesru) || evDiziniSabiti(mesru)).toBe(false)
  })

  /**
   * ⭐AYIRT EDİCİ ÇİFT — bu koldaki asıl iş. Bir satırın indeksten çıkması MEŞRU olabilir
   * (dizin-*.md dosyasına katlanmıştır). Ayırt etmeyen bir kol, her katlamada yanan bir
   * lamba üretir ve iki günde mobilyaya döner; ayırt etmeyen kol ölçüm değildir.
   */
  it('⭐KATLANMIŞ satır SESSİZ, KATLANMAMIŞ satır UYARIR (ve satırı gösterir)', () => {
    const { idx, transcript, ham } = fiksturKur()
    const satirlar = ham.split('\n')

    const katlanmis = kos(transcript, {
      file_path: idx,
      content: satirlar.filter((s) => !s.includes('Numara 07')).join('\n'),
    })
    expect(katlanmis.kod).toBe(0)
    expect(
      katlanmis.cikti.trim(),
      'katlanmış (dizin dosyasına taşınmış) satır KAYIP sanıldı — kol katlama ile kaybı ayırt etmiyor',
    ).toBe('')

    const silinmis = kos(transcript, {
      file_path: idx,
      content: satirlar.filter((s) => !s.includes('Numara 13')).join('\n'),
    })
    expect(silinmis.kod, 'uyarı bloklamaya dönüşmüş').toBe(0)
    expect(silinmis.cikti, 'gerçekten silinen satır için uyarı YOK — 09-07 kaybı yine görünmez olur').toMatch(/KAYIP YAZIM SUPHESI/)
    expect(silinmis.cikti, 'kaybolan satır GÖSTERİLMİYOR; okuyan neyin gittiğini bilemez').toMatch(/Numara 13/)
  })

  /**
   * MODELE ULAŞIR (2026-09-25 denetimi): Claude Code çıkış 0'da stderr'i modele göstermez.
   * Uyarı stdout'ta additionalContext olarak da çıkmalı; sessiz durumda stdout boş kalmalı.
   */
  it('⭐uyarı modelin kanalına da gider (stdout JSON additionalContext), sessizken stdout boş', () => {
    const { idx, transcript, ham } = fiksturKur()
    const satirlar = ham.split('\n')
    const girdi = (content: string) =>
      JSON.stringify({ session_id: 'sahte', transcript_path: transcript, tool_name: 'Write', tool_input: { file_path: idx, content } })

    const silinmis = spawnSync(process.execPath, [path.join(KOK, KANCA)], {
      input: girdi(satirlar.filter((s) => !s.includes('Numara 13')).join('\n')),
      encoding: 'utf8',
    })
    expect(silinmis.status).toBe(0)
    const j = JSON.parse(silinmis.stdout) as { hookSpecificOutput?: { hookEventName?: string; additionalContext?: string } }
    expect(j.hookSpecificOutput?.hookEventName).toBe('PreToolUse')
    expect(j.hookSpecificOutput?.additionalContext, 'uyarı yalnız stderr de — model görmez').toMatch(/KAYIP YAZIM SUPHESI/)

    const sessiz = spawnSync(process.execPath, [path.join(KOK, KANCA)], { input: girdi(ham), encoding: 'utf8' })
    expect(sessiz.stdout.trim(), 'uyarı yokken modele boş bağlam gönderildi').toBe('')
  })

  /**
   * OTURUM BAŞINA BİR KEZ (2026-09-25 yan etkisi): aynı uyarı her çağrıda modele gitseydi
   * "her turda tekrar eden metin" olurdu. Aynı oturumda ikinci kez stdout boş, stderr yine dolu;
   * farklı oturumda yeniden gider.
   */
  it('⭐aynı uyarı aynı oturumda modele BİR KEZ gider; stderr her seferinde yazılır', () => {
    const { idx, transcript, ham } = fiksturKur()
    const onbellek = fs.mkdtempSync(path.join(os.tmpdir(), 'modele-ilet-'))
    const icerik = ham.split('\n').filter((s) => !s.includes('Numara 13')).join('\n')
    const kostur = (sid: string) =>
      spawnSync(process.execPath, [path.join(KOK, KANCA)], {
        input: JSON.stringify({ session_id: sid, transcript_path: transcript, tool_name: 'Write', tool_input: { file_path: idx, content: icerik } }),
        encoding: 'utf8',
        env: { ...process.env, VENTHUB_MODELE_ILET_DIR: onbellek },
      })
    const A = 'aaaaaaaa-1111-4111-8111-111111111111'
    const B = 'bbbbbbbb-2222-4222-8222-222222222222'

    const ilk = kostur(A)
    expect(ilk.stdout, 'ilk çağrıda uyarı modele gitmedi').toMatch(/KAYIP YAZIM SUPHESI/)
    const ikinci = kostur(A)
    expect(ikinci.stdout.trim(), 'aynı uyarı aynı oturumda ikinci kez modele gitti — her turda tekrar').toBe('')
    expect(ikinci.stderr, 'stderr kopyası da kesildi — oturum kaydı kör kalır').toMatch(/KAYIP YAZIM SUPHESI/)
    expect(kostur(B).stdout, 'başka oturum uyarıyı hiç görmedi').toMatch(/KAYIP YAZIM SUPHESI/)
  })

  /**
   * ⭐SATIR DÜZEYİNDE TEKİLLEŞTİRME (2026-09-25, ikinci ölçüm): bütün-metin özeti, araya
   * değişken bir satır karışınca (git uyarısı, büyüyen liste) aynı ana uyarıyı her çağrıda
   * yeniden gönderiyordu — Ops oturumunda "KIMLIK YOK" her Bash'te geldi. Doğrudan modülü
   * koşan küçük bir süreçle ölçülür: yalnız YENİ satırlar gider, madde başlığıyla gider.
   */
  it('⭐değişen yan satır ana uyarıyı yeniden göndermez; büyüyen listede yalnız yeni madde gider', () => {
    const onbellek = fs.mkdtempSync(path.join(os.tmpdir(), 'modele-ilet-satir-'))
    const modul = path.join(KOK, '.claude/hooks/modele-ilet.cjs')
    const kostur = (sid: string, metin: string) =>
      spawnSync(
        process.execPath,
        [
          '-e',
          `const m=require(${JSON.stringify(modul)}).stderrModeleIlet('PostToolUse');m.oturum(${JSON.stringify(sid)});process.stderr.write(${JSON.stringify(metin)})`,
        ],
        { encoding: 'utf8', env: { ...process.env, VENTHUB_MODELE_ILET_DIR: onbellek } },
      )
    const A = 'aaaaaaaa-5555-4555-8555-555555555555'
    const B = 'bbbbbbbb-6666-4666-8666-666666666666'
    const kimlik = '[k] KIMLIK YOK (sebep) — denetlendi.\n  Onarim: oturum acilisi yap.\n'

    expect(kostur(A, kimlik).stdout).toMatch(/KIMLIK YOK/)
    const karisik = kostur(A, "warning: unable to access '.git/config'\n" + kimlik)
    expect(karisik.stdout, 'değişken yan satır yeni sayılmadı').toMatch(/unable to access/)
    expect(karisik.stdout, 'ana uyarı yan satır yüzünden yeniden gitti').not.toMatch(/KIMLIK YOK|Onarim/)
    expect(karisik.stderr, 'stderr kopyası kesildi').toMatch(/KIMLIK YOK/)

    kostur(A, '[k] PENCERE DISI 2 kalem\n  · a.md\n  · b.md\n')
    const buyuyen = JSON.parse(kostur(A, '[k] PENCERE DISI 3 kalem\n  · a.md\n  · b.md\n  · c.md\n').stdout)
      .hookSpecificOutput.additionalContext as string
    expect(buyuyen, 'yeni madde başlıksız ya da hiç gitmedi').toMatch(/PENCERE DISI 3 kalem\n {2}· c\.md/)
    expect(buyuyen, 'eski maddeler yeniden gitti').not.toMatch(/a\.md|b\.md/)

    // Ayırt edici kol: başka oturum hepsini görür (tekilleştirme oturumlar arası sızmaz).
    expect(kostur(B, "warning: unable to access '.git/config'\n" + kimlik).stdout).toMatch(/KIMLIK YOK/)
  })

  it('NORMALİZE: yalnız boşluk farkı kayıp sayılmaz (yalancı uyarı yasağı — OPS şartı)', () => {
    const { idx, transcript, ham } = fiksturKur()
    const bosluklu = ham
      .split('\n')
      .map((s) => (s.includes('Numara 21') ? `${s}   ` : s))
      .join('\n')
    const r = kos(transcript, { file_path: idx, content: bosluklu })
    expect(r.cikti.trim(), 'boşluk farkı kayıp sayıldı — kol her dokunuşta yalancı uyarı basar').toBe('')
  })

  it('YUMUŞAK EŞİK (bayt): 20000 üstünde UYARIR, altında SUSAR — ve YAZIMIN SONUCU ölçülür (ikinci ayırt edici çift)', () => {
    const { idx, transcript, ham } = fiksturKur()

    const altinda = kos(transcript, { file_path: idx, content: `${ham}- [Yeni](y.md) — eklendi\n` })
    expect(altinda.cikti.trim(), 'eşik altında uyarı basıldı — gürültü').toBe('')

    const buyuk = `${ham}- [Dolgu](d.md) — ${'x'.repeat(17500)}\n`
    fs.writeFileSync(idx, buyuk, 'utf8')
    expect(fs.statSync(idx).size, 'fikstür yumuşak eşiği aşmıyor; kol boş koşar').toBeGreaterThanOrEqual(20000)
    const ustunde = kos(transcript, { file_path: idx, content: `${buyuk}- [Yeni](y.md) — eklendi\n` })
    expect(ustunde.kod, 'yumuşak eşik yazımı engelledi — engel yalnız sert eşikte').toBe(0)
    expect(ustunde.cikti, 'yumuşak eşik uyarısı yok — taşma yine ancak OTOPSİDE görülür').toMatch(/YUMUSAK ESIK/)
  })

  it('YUMUŞAK EŞİK (SATIR): 160 satır UYARIR — bayt küçük olsa da (gerçek sınır bayt DEĞİL, satır da)', () => {
    const { idx, transcript, ham } = fiksturKur() // 42 satır
    expect(fs.statSync(idx).size).toBeLessThan(20000)
    const altmis = ham + Array.from({ length: 120 }, (_, i) => `- [Ek ${i}](e-${i}.md) — kisa ek`).join('\n') + '\n'
    const r = kos(transcript, { file_path: idx, content: altmis }) // 162 satır
    expect(r.kod).toBe(0)
    expect(r.cikti, '160 satır aşıldı ama uyarı yok — satır sınırı hiç izlenmiyordu (eski 16384 bayt ölçümünün kör noktası)').toMatch(/YUMUSAK ESIK/)
    const altinda = ham + Array.from({ length: 100 }, (_, i) => `- [Ek ${i}](e-${i}.md) — kisa ek`).join('\n') + '\n'
    expect(kos(transcript, { file_path: idx, content: altinda }).cikti.trim(), '142 satırda uyarı basıldı — gürültü').toBe('')
  })

  describe('KOL C — SERT EŞİK: yazım ENGELLENİR (REC-433 1.9, Ops: "uyarı yetmedi")', () => {
    const uzun = (n: number) => Array.from({ length: n }, (_, i) => `- [Ders ${i}](d-${i}.md) — indeks satiri uretildi`).join('\n') + '\n'

    it('⭐SATIR sert eşiği: 201 satırlık sonuç ENGELLENİR (çıkış 2, sebep + yapılacak metinde), 200 satır GEÇER', () => {
      const { idx, transcript } = fiksturKur()
      const engel = kos(transcript, { file_path: idx, content: uzun(201) })
      expect(engel.kod, '201 satırlık yazım engellenmedi — kırpma yine sessiz olur').toBe(2)
      expect(engel.cikti).toMatch(/YAZIM ENGELLENDI/)
      expect(engel.cikti, 'sebep söylenmiyor').toMatch(/201 satir/)
      expect(engel.cikti, 'ne yapılacağı söylenmiyor — model körlemesine yeniden dener').toMatch(/KATLA/)
      const sinirda = kos(transcript, { file_path: idx, content: uzun(200) })
      expect(sinirda.kod, '200 satır (sınırın kendisi) engellendi — sınır dahil değil').toBe(0)
    })

    it('⭐BAYT sert eşiği: 25.000 baytı aşan sonuç ENGELLENİR, altı GEÇER', () => {
      const { idx, transcript, ham } = fiksturKur()
      const buyuk = `${ham}- [Dolgu](d.md) — ${'x'.repeat(22500)}\n` // ~25,4 KB
      expect(Buffer.byteLength(buyuk)).toBeGreaterThan(25000)
      expect(kos(transcript, { file_path: idx, content: buyuk }).kod, 'bayt sert eşiği aşıldı ama yazım geçti').toBe(2)
      const altinda = `${ham}- [Dolgu](d.md) — ${'x'.repeat(19000)}\n` // ~22,7 KB: yumuşakta uyarır, engellemez
      expect(kos(transcript, { file_path: idx, content: altinda }).kod).toBe(0)
    })

    it('⭐KÜÇÜLTEN yazım ENGELLENMEZ: zaten sert eşiğin üstündeki dosyada katlama adımı geçer (kapı kilitlenmez)', () => {
      const { idx, transcript } = fiksturKur()
      fs.writeFileSync(idx, uzun(230), 'utf8') // sınırın üstünde bir indeks
      const kucultur = kos(transcript, { file_path: idx, content: uzun(215) }) // hâlâ 200'ün üstünde ama KÜÇÜLÜYOR
      expect(kucultur.kod, 'küçülten yazım engellendi — şişmiş indeksi kimse onaramaz').toBe(0)
      const buyutur = kos(transcript, { file_path: idx, content: uzun(231) })
      expect(buyutur.kod, 'şişmiş indekse satır eklemek engellenmedi').toBe(2)
      const ayni = kos(transcript, { file_path: idx, content: uzun(230) })
      expect(ayni.kod, 'aynı boyutta yazım (küçültmüyor) engellenmedi').toBe(2)
    })

    it('⭐EDIT sonucu da ölçülür: mevcut dosyaya satır ekleyen Edit sert eşiği aşıyorsa ENGELLENİR, aşmıyorsa geçer', () => {
      const { idx, transcript } = fiksturKur()
      fs.writeFileSync(idx, uzun(200), 'utf8')
      const eski = '- [Ders 199](d-199.md) — indeks satiri uretildi'
      const ekle = kos(transcript, { file_path: idx, old_string: eski, new_string: `${eski}\n- [Yeni](y.md) — bir satir daha eklendi` })
      expect(ekle.kod, 'Edit ile 201. satır eklendi ve engellenmedi').toBe(2)
      const degistir = kos(transcript, { file_path: idx, old_string: eski, new_string: '- [Ders 199](d-199.md) — degistirilmis satir metni' })
      expect(degistir.kod, 'satır sayısını değiştirmeyen Edit engellendi').toBe(0)
    })

    it('MultiEdit: düzenlemeler sırayla uygulanıp SONUÇ ölçülür', () => {
      const { idx, transcript } = fiksturKur()
      fs.writeFileSync(idx, uzun(199), 'utf8')
      const e1 = '- [Ders 0](d-0.md) — indeks satiri uretildi'
      const e2 = '- [Ders 1](d-1.md) — indeks satiri uretildi'
      const iki = kos(transcript, {
        file_path: idx,
        edits: [
          { old_string: e1, new_string: `${e1}\n- [A](a.md) — birinci ek satir` },
          { old_string: e2, new_string: `${e2}\n- [B](b.md) — ikinci ek satir` },
        ],
      })
      expect(iki.kod, 'MultiEdit toplamı 201 satır ama engellenmedi').toBe(2)
    })

    it('ENGEL YALNIZ İNDEKSE: memory/ dışındaki MEMORY.md ve başka dosyalar etkilenmez', () => {
      const { kok, transcript } = fiksturKur()
      const baska = path.join(kok, 'docs')
      fs.mkdirSync(baska)
      const dep = path.join(baska, 'MEMORY.md') // klasörü `memory` DEĞİL
      expect(kos(transcript, { file_path: dep, content: uzun(300) }).kod, 'memory/ dışındaki MEMORY.md engellendi').toBe(0)
      const dizin = path.join(kok, 'memory', 'dizin-ornek.md')
      expect(kos(transcript, { file_path: dizin, content: uzun(300) }).kod, 'dizin dosyası engellendi (indeks değil)').toBe(0)
    })
  })

  it('⭐YANLIŞ POZİTİF YOK: başka projenin memory/MEMORY.md yazılırken oturumun kendi indeksinden "satır siliniyor" denmez', () => {
    const a = fiksturKur() // oturumun proje dizini (transcript buna işaret eder)
    // Oturumun indeksi BAŞKA satırlar taşır: eski kanca yazılan içeriği bununla kıyaslayıp "40 satır siliniyor" derdi.
    const aSatirlari = Array.from({ length: 40 }, (_, i) => `- [Oturum Dersi ${i}](o-${i}.md) — oturumun kendi indeks satiri`)
    fs.writeFileSync(a.idx, aSatirlari.join('\n') + '\n', 'utf8')
    const b = fiksturKur() // BAŞKA projenin indeksi; yazılan dosya bu
    const degismeyen = kos(a.transcript, { file_path: b.idx, content: b.ham })
    expect(degismeyen.kod).toBe(0)
    expect(
      degismeyen.cikti.trim(),
      'başka projenin indeksine DEĞİŞMEYEN içerik yazıldı ama uyarı çıktı — oturumun kendi indeksi ölçülüyor (HARİTA yanlış pozitifi)',
    ).toBe('')
    // Ayırt edici çift: B'nin GERÇEK kaybı yine görünür, ve uyarı B'nin satırını söyler, A'nınkini değil.
    const kayip = kos(a.transcript, { file_path: b.idx, content: b.ham.split('\n').filter((s) => !s.includes('Numara 13')).join('\n') })
    expect(kayip.cikti, 'B indeksinin gerçek kaybı görünmedi').toMatch(/KAYIP YAZIM SUPHESI/)
    expect(kayip.cikti).toMatch(/Numara 13/)
    expect(kayip.cikti, 'uyarı oturumun kendi indeksinin satırlarını gösteriyor').not.toMatch(/Oturum Dersi/)
  })

  it('worktree oturumu (kendi proje dizininde memory/ YOK) ortak indeksi yine korur: ölçülen yazılan dosyadır', () => {
    const { idx, ham } = fiksturKur()
    const bos = fs.mkdtempSync(path.join(os.tmpdir(), 'rec280-wt-'))
    const transcript = path.join(bos, 'sahte.jsonl') // bu proje dizininde memory/ yok
    fs.writeFileSync(transcript, '{}\n', 'utf8')
    const r = kos(transcript, { file_path: idx, content: ham.split('\n').filter((s) => !s.includes('Numara 13')).join('\n') })
    expect(r.cikti, 'worktree oturumunda bekçi kör: kendi proje dizininde memory/ yok diye hiç ölçmedi').toMatch(/KAYIP YAZIM SUPHESI/)
  })

  /**
   * ⭐DEPARTMAN GENİŞLEMESİ (2026-09-30 HARİTA kararı 4, hafiza-yazma-duzeni §7). Departman indeksi
   * SessionStart enjeksiyonuyla yüklenir ve enjeksiyon 60 satır / 8 KB'ta KESER: bekçi aynı sayıyı
   * YUMUŞAK eşik yapar (uyarır, ENGELLEMEZ); sert eşik ana indeksle ortaktır (200 satır / 25 KB).
   * Ana MEMORY.md davranışı DEĞİŞMEZ.
   */
  describe('DEPARTMAN GENİŞLEMESİ — memory/departman/<ROL>/MEMORY.md (60 satır / 8 KB YUMUŞAK)', () => {
    const numara = (i: number): string => String(i).padStart(3, '0')
    const depSatir = (i: number): string => `- [Departman Dersi ${numara(i)}](d-${i}.md) — departman satiri`
    const dep = (n: number): string => `${Array.from({ length: n }, (_, i) => depSatir(i + 1)).join('\n')}\n`
    const anaSatirlari = (n: number): string =>
      `${Array.from({ length: n }, (_, i) => `- [Ana Dersi ${numara(i + 1)}](a-${i}.md) — ana indeks satiri`).join('\n')}\n`

    /**
     * kok/memory/MEMORY.md (ana) + kok/memory/departman/TEST/{MEMORY.md,konu.md} + kok/memory/dizin-ana.md.
     * `konu.md` Ders 007'yi DOĞRU yerde (departmanın kendi dizininde), `dizin-ana.md` Ders 013'ü YANLIŞ
     * yerde (ana hafıza dizininde) katlanmış gösterir: ayırt edici çift.
     */
    function depFiksturu(): { kok: string; ana: string; klasor: string; idx: string; anaIdx: string; ham: string; transcript: string } {
      const kok = fs.mkdtempSync(path.join(os.tmpdir(), 'rec280-dep-'))
      const ana = path.join(kok, 'memory')
      const klasor = path.join(ana, 'departman', 'TEST')
      fs.mkdirSync(klasor, { recursive: true })
      const ham = dep(30)
      const idx = path.join(klasor, 'MEMORY.md')
      fs.writeFileSync(idx, ham, 'utf8')
      const anaIdx = path.join(ana, 'MEMORY.md')
      fs.writeFileSync(anaIdx, anaSatirlari(30), 'utf8')
      fs.writeFileSync(path.join(klasor, 'konu.md'), '## Departman Dersi 007\nkatlandi.\n', 'utf8')
      fs.writeFileSync(path.join(ana, 'dizin-ana.md'), '## Departman Dersi 013\nyanlis yerde (ana dizinde) katlandi.\n', 'utf8')
      const transcript = path.join(kok, 'sahte.jsonl')
      fs.writeFileSync(transcript, '{}\n', 'utf8')
      return { kok, ana, klasor, idx, anaIdx, ham, transcript }
    }
    const sessiz = (r: { kod: number | null; cikti: string }): boolean => r.kod === 0 && r.cikti.trim() === ''
    const yumusakUyari = (r: { kod: number | null; cikti: string }): boolean => r.kod === 0 && /YUMUSAK ESIK/.test(r.cikti)

    /** Bütün ölçülebilir davranışlar tek tabloda: mutasyon testi aynı senaryoyu mutantta koşar. */
    function senaryo(kanca: string): Record<string, boolean> {
      const f = depFiksturu()
      const k = (idx: string, toolInput: Record<string, unknown>) => kos(f.transcript, { file_path: idx, ...toolInput }, kanca)
      const dolgu = (n: number): string => `- [Dolgu](d.md) — ${'x'.repeat(n)}\n`
      const satirsiz = (no: string): string => f.ham.split('\n').filter((s) => !s.includes(`Dersi ${no}`)).join('\n')
      return {
        d59Sessiz: sessiz(k(f.idx, { content: dep(59) })),
        d60Sessiz: sessiz(k(f.idx, { content: dep(60) })),
        d61Uyarir: yumusakUyari(k(f.idx, { content: dep(61) })),
        dBaytUyarir: yumusakUyari(k(f.idx, { content: dep(30) + dolgu(8100) })),
        dBaytSessiz: sessiz(k(f.idx, { content: dep(30) + dolgu(5500) })),
        d200Gecer: k(f.idx, { content: dep(200) }).kod === 0,
        d201Engel: k(f.idx, { content: dep(201) }).kod === 2,
        dKatlanmisSessiz: sessiz(k(f.idx, { content: satirsiz('007') })),
        dYanlisYerKatlamaUyarir: /KAYIP YAZIM SUPHESI/.test(k(f.idx, { content: satirsiz('013') }).cikti),
        ana61Sessiz: sessiz(k(f.anaIdx, { content: anaSatirlari(61) })),
        anaBayt8100Sessiz: sessiz(k(f.anaIdx, { content: anaSatirlari(30) + dolgu(8100) })),
        ana160Uyarir: yumusakUyari(k(f.anaIdx, { content: anaSatirlari(160) })),
        ana201Engel: k(f.anaIdx, { content: anaSatirlari(201) }).kod === 2,
      }
    }

    it('⭐EŞİK ÇİFTİ: 59 ve 60 satır SESSİZ, 61 satır UYARIR (ENGEL DEĞİL — çıkış 0), uyarı departmanı ve enjeksiyon sınırını söyler', () => {
      const f = depFiksturu()
      expect(sessiz(kos(f.transcript, { file_path: f.idx, content: dep(59) })), '59 satırda uyarı — gürültü').toBe(true)
      expect(sessiz(kos(f.transcript, { file_path: f.idx, content: dep(60) })), '60 satır enjeksiyona SIĞAR; uyarı yalancıdır').toBe(true)
      const r = kos(f.transcript, { file_path: f.idx, content: dep(61) })
      expect(r.kod, 'departman yumuşak eşiği yazımı ENGELLEDİ — yalnız uyarır').toBe(0)
      expect(r.cikti, '61. satırda uyarı yok — enjeksiyon o satırı sessizce keser').toMatch(/YUMUSAK ESIK 60 satir \/ 8000 bayt/)
      expect(r.cikti, 'uyarı hangi indeks olduğunu söylemiyor').toMatch(/Departman MEMORY\.md \(TEST\)/)
      expect(r.cikti, 'enjeksiyon kırpması söylenmiyor — okuyan eşiğin niçinini bilemez').toMatch(/enjeksiyon/)
      expect(r.cikti, 'departmana ana indeksin katlama yolu (dizin-*.md) söyleniyor').not.toMatch(/dizin-\*\.md/)
      expect(r.cikti).toMatch(/konu dosyalarina/)
      expect(r.cikti, 'uyarı satırı engelmiş gibi konuşuyor').toMatch(/yazma ENGELLENMEDI/)
    })

    it('⭐BAYT eşiği: 8000 bayt üstü UYARIR (satır sayısı küçük olsa da), altı SUSAR', () => {
      const f = depFiksturu()
      const buyuk = `${dep(30)}- [Dolgu](d.md) — ${'x'.repeat(8100)}\n` // 31 satır, > 8000 bayt
      expect(Buffer.byteLength(buyuk)).toBeGreaterThan(8000)
      expect(yumusakUyari(kos(f.transcript, { file_path: f.idx, content: buyuk })), '8 KB aşıldı ama uyarı yok').toBe(true)
      const kucuk = `${dep(30)}- [Dolgu](d.md) — ${'x'.repeat(5500)}\n`
      expect(Buffer.byteLength(kucuk)).toBeLessThan(8000)
      expect(sessiz(kos(f.transcript, { file_path: f.idx, content: kucuk })), '8 KB altında uyarı — gürültü').toBe(true)
    })

    it('⭐YAZIMIN SONUCU ölçülür: mevcut 60 satırlık indekse satır ekleyen Edit uyarır, satır sayısını değiştirmeyen Edit susar', () => {
      const f = depFiksturu()
      fs.writeFileSync(f.idx, dep(60), 'utf8')
      const eski = depSatir(60)
      const ekle = kos(f.transcript, { file_path: f.idx, old_string: eski, new_string: `${eski}\n${depSatir(61)}` })
      expect(yumusakUyari(ekle), 'Edit ile 61. satır eklendi, uyarı yok').toBe(true)
      const degistir = kos(f.transcript, { file_path: f.idx, old_string: eski, new_string: '- [Departman Dersi 060](d-60.md) — degistirilmis satir' })
      expect(degistir.kod).toBe(0)
      expect(degistir.cikti, 'satır sayısını değiştirmeyen Edit yumuşak eşik uyarısı verdi').not.toMatch(/YUMUSAK ESIK/)
    })

    it('⭐SERT EŞİK ana indeksle ORTAK: departmanda 201 satır ENGELLENİR (sebep + yapılacak metinde), 200 satır geçer; KÜÇÜLTEN yazım geçer', () => {
      const f = depFiksturu()
      const engel = kos(f.transcript, { file_path: f.idx, content: dep(201) })
      expect(engel.kod, 'departmanda 201 satırlık yazım engellenmedi').toBe(2)
      expect(engel.cikti).toMatch(/YAZIM ENGELLENDI/)
      expect(engel.cikti).toMatch(/Departman MEMORY\.md \(TEST\)/)
      expect(engel.cikti).toMatch(/201 satir/)
      expect(engel.cikti, 'ne yapılacağı söylenmiyor').toMatch(/KATLA/)
      expect(engel.cikti).toMatch(/konu dosyalarina/)
      const sinirda = kos(f.transcript, { file_path: f.idx, content: dep(200) })
      expect(sinirda.kod, '200 satır (sınırın kendisi) engellendi — sınır dahil değil').toBe(0)
      expect(sinirda.cikti, '200 satırlık departman indeksi yumuşak eşiği de aşar: uyarı beklenir').toMatch(/YUMUSAK ESIK/)

      const bayt = `${dep(30)}- [Dolgu](d.md) — ${'x'.repeat(25000)}\n`
      expect(kos(f.transcript, { file_path: f.idx, content: bayt }).kod, 'departmanda 25 KB üstü yazım engellenmedi').toBe(2)

      fs.writeFileSync(f.idx, dep(230), 'utf8')
      expect(kos(f.transcript, { file_path: f.idx, content: dep(215) }).kod, 'küçülten yazım engellendi — şişmiş indeks onarılamaz').toBe(0)
      expect(kos(f.transcript, { file_path: f.idx, content: dep(231) }).kod, 'şişmiş departman indeksine satır eklemek engellenmedi').toBe(2)
    })

    it('⭐ANA MEMORY.md REGRESYON: departman eşiği (60/8 KB) ana indekse SIZMAZ; ana yumuşak 160/20 KB ve sert 200/25 KB aynen', () => {
      const f = depFiksturu()
      expect(sessiz(kos(f.transcript, { file_path: f.anaIdx, content: anaSatirlari(61) })), '61 satırlık ana indekste uyarı — departman eşiği sızdı').toBe(true)
      expect(sessiz(kos(f.transcript, { file_path: f.anaIdx, content: anaSatirlari(159) })), '159 satırda ana indeks uyardı').toBe(true)
      const uyari = kos(f.transcript, { file_path: f.anaIdx, content: anaSatirlari(160) })
      expect(yumusakUyari(uyari), 'ana indeks 160. satırda (>=) uyarmadı').toBe(true)
      expect(uyari.cikti, 'ana indeks uyarısı departman diliyle konuşuyor').not.toMatch(/Departman|enjeksiyon/)
      expect(uyari.cikti).toMatch(/YUMUSAK ESIK 160 satir \/ 20000 bayt/)
      expect(kos(f.transcript, { file_path: f.anaIdx, content: anaSatirlari(201) }).kod).toBe(2)
      expect(kos(f.transcript, { file_path: f.anaIdx, content: anaSatirlari(200) }).kod).toBe(0)
    })

    it('⭐KOL B departmanın KENDİ dizininde arar: konu dosyasına katlanmış satır SESSİZ; yalnız ANA dizinde geçen satır UYARIR', () => {
      const f = depFiksturu()
      const satirsiz = (no: string): string => f.ham.split('\n').filter((s) => !s.includes(`Dersi ${no}`)).join('\n')
      const katlanmis = kos(f.transcript, { file_path: f.idx, content: satirsiz('007') })
      expect(sessiz(katlanmis), 'departman/TEST/konu.md içinde katlanmış satır KAYIP sanıldı').toBe(true)
      const yanlisYer = kos(f.transcript, { file_path: f.idx, content: satirsiz('013') })
      expect(yanlisYer.kod).toBe(0)
      expect(yanlisYer.cikti, 'yalnız ana dizinde geçen satır katlanmış sayıldı — departman başka bir departmanın/ana dizinin dosyasına yaslanamaz').toMatch(/KAYIP YAZIM SUPHESI/)
      expect(yanlisYer.cikti).toMatch(/Dersi 013/)
    })

    it('TANIMA SINIRLARI: yalnız memory/departman/<ROL>/MEMORY.md tanınır; başka yerler, alt klasör ve konu dosyaları SUSAR (300 satır bile engellenmez)', () => {
      const f = depFiksturu()
      const yaz300 = (yol: string): { kod: number | null; cikti: string } => {
        fs.mkdirSync(path.dirname(yol), { recursive: true })
        return kos(f.transcript, { file_path: yol, content: dep(300) })
      }
      const dosya = (...p: string[]): string => path.join(f.kok, ...p)
      const yabanci: Array<[string, string]> = [
        ['memory dışında departman/ (docs/departman/TEST/MEMORY.md)', dosya('docs', 'departman', 'TEST', 'MEMORY.md')],
        ['ROL segmenti yok (memory/departman/MEMORY.md)', dosya('memory', 'departman', 'MEMORY.md')],
        ['alt klasör (memory/departman/TEST/alt/MEMORY.md)', dosya('memory', 'departman', 'TEST', 'alt', 'MEMORY.md')],
        ['konu dosyası (memory/departman/TEST/konu.md)', dosya('memory', 'departman', 'TEST', 'konu.md')],
        ['departman adı farklı (memory/departmanlar/TEST/MEMORY.md)', dosya('memory', 'departmanlar', 'TEST', 'MEMORY.md')],
      ]
      for (const [ad, yol] of yabanci) {
        const r = yaz300(yol)
        expect(sessiz(r), `${ad}: tanındı ya da engellendi — kapsam yalnız departman indeksi olmalı`).toBe(true)
      }
      // Ayırt edici çift: TAM yol aynı 300 satırda ENGELLENİR.
      expect(yaz300(f.idx).kod, 'gerçek departman indeksi 300 satırda engellenmedi').toBe(2)
    })

    it('HARF DUYARSIZ + `..` GİDERİLMİŞ (NTFS): memory/Departman/<ROL>/MEMORY.md ve dolambaçlı yol da departman indeksidir', () => {
      const f = depFiksturu()
      const buyukHarf = path.join(f.ana, 'Departman', 'TEST', 'MEMORY.md')
      fs.mkdirSync(path.dirname(buyukHarf), { recursive: true })
      expect(yumusakUyari(kos(f.transcript, { file_path: buyukHarf, content: dep(61) })), 'Departman (büyük harf) tanınmadı').toBe(true)
      const dolambacli = path.join(f.ana, 'baska', '..', 'departman', 'TEST', 'MEMORY.md')
      expect(yumusakUyari(kos(f.transcript, { file_path: dolambacli, content: dep(61) })), '`..` içeren yol tanınmadı').toBe(true)
    })

    it('⭐FAIL-OPEN: boş/bozuk girdi, okunamayan hedef ve boş dosya ENGELLEMEZ; bekçinin kendi hatası SESSİZ değildir', () => {
      const f = depFiksturu()
      const dogrudan = (input: string): { status: number | null; cikti: string } => {
        const r = spawnSync(process.execPath, [path.join(KOK, KANCA)], { input, encoding: 'utf8' })
        return { status: r.status, cikti: `${r.stdout ?? ''}${r.stderr ?? ''}` }
      }
      expect(dogrudan('')).toEqual({ status: 0, cikti: '' }) // boş stdin
      expect(dogrudan('{bozuk json')).toEqual({ status: 0, cikti: '' }) // bozuk stdin
      expect(dogrudan('{}')).toEqual({ status: 0, cikti: '' }) // file_path yok
      expect(dogrudan(JSON.stringify({ tool_input: { file_path: 42, content: 'x' } })).status, 'sayı file_path').toBe(0)
      const bosGovde = dogrudan('null') // gövde null: kendi hatası — çıkış 0 ama SESSİZ DEĞİL
      expect(bosGovde.status).toBe(0)
      expect(bosGovde.cikti, '"uyarı gelmedi" ile "bekçi çalışmadı" ayırt edilemiyor').toMatch(/BEKCI CALISAMADI/)

      // Boş içerik yazımı: 30 satırı siler → kayıp UYARISI olur ama ENGEL yoktur.
      const bosYazim = kos(f.transcript, { file_path: f.idx, content: '' })
      expect(bosYazim.kod, 'boş içerik yazımı engellendi').toBe(0)
      // Dosya yoksa (ilk yazım) ve küçükse sessiz.
      const yeni = path.join(f.ana, 'departman', 'YENI', 'MEMORY.md')
      expect(sessiz(kos(f.transcript, { file_path: yeni, content: dep(5) })), 'ilk yazım (dosya yok) uyardı ya da engellendi').toBe(true)
      // Mevcut dosya OKUNAMIYOR (MEMORY.md yerinde bir DİZİN var): ölçüm mevcutsuz sürer, çökmez, engellemez.
      const dizinOlan = path.join(f.ana, 'departman', 'DIZIN', 'MEMORY.md')
      fs.mkdirSync(dizinOlan, { recursive: true })
      const okunamaz = kos(f.transcript, { file_path: dizinOlan, content: dep(5) })
      expect(okunamaz.kod, 'okunamayan hedef yazımı engelledi').toBe(0)
      expect(okunamaz.cikti, 'okunamayan hedefte küçük yazım yalancı uyarı verdi').not.toMatch(/YUMUSAK|ENGELLENDI/)
      // Mevcut dosya BOZUK (geçersiz UTF-8): çökmez, engellemez.
      fs.writeFileSync(f.idx, Buffer.from([0xff, 0xfe, 0x00, 0xc3, 0x28, 0x0a, 0xff]))
      expect(kos(f.transcript, { file_path: f.idx, content: dep(5) }).kod, 'bozuk (geçersiz UTF-8) mevcut dosya yazımı engelledi').toBe(0)
      // Edit uygulanamıyor (old_string yok): sonuç bilinmez → mevcut ölçülür, ENGEL YOK (eski davranış).
      fs.writeFileSync(f.idx, dep(230), 'utf8')
      const uygulanamaz = kos(f.transcript, { file_path: f.idx, old_string: 'YOK-BOYLE-BIR-SATIR', new_string: 'x' })
      expect(uygulanamaz.kod, 'uygulanamayan Edit engellendi — sonuç bilinmiyorsa engel verilmez').toBe(0)
    })

    /**
     * ⭐MUTASYON TABLOSU (kalıcı sabotaj): kancanın kritik satırı bozulunca senaryo KIRMIZI olmalı.
     * Mutant, kancanın geçici kopyasıdır (repodaki dosyaya dokunulmaz). Her mutasyon hedef anahtarı
     * düşürmeli; özgün kanca TÜM anahtarları geçmeli. Bir mutant sağ kalırsa test o davranışı
     * korumuyor demektir.
     */
    it('⭐MUTASYON: kritik satır bozulunca ilgili senaryo KIRMIZI (özgün kanca yeşil)', () => {
      const kaynak = oku(KANCA).replace(/\r\n/g, '\n') // Windows çıkışı CRLF olabilir; mutasyon satır sonundan bağımsız
      const ozgun = senaryo(path.join(KOK, KANCA))
      expect(
        Object.entries(ozgun).filter(([, gecti]) => !gecti).map(([ad]) => ad),
        'özgün kanca kendi senaryosunu geçemiyor',
      ).toEqual([])

      const mutasyonlar: Array<{ ad: string; eski: string; yeni: string; dusen: string[] }> = [
        { ad: 'departman satır eşiği 60 → 600', eski: 'const DEPARTMAN_YUMUSAK_SATIR = 60', yeni: 'const DEPARTMAN_YUMUSAK_SATIR = 600', dusen: ['d61Uyarir'] },
        { ad: 'departman bayt eşiği 8000 → 80000', eski: 'const DEPARTMAN_YUMUSAK_BAYT = 8000', yeni: 'const DEPARTMAN_YUMUSAK_BAYT = 80000', dusen: ['dBaytUyarir'] },
        { ad: 'departman satır ölçütü > yerine >=', eski: 'satir > DEPARTMAN_YUMUSAK_SATIR', yeni: 'satir >= DEPARTMAN_YUMUSAK_SATIR', dusen: ['d60Sessiz'] },
        { ad: 'departman tanınmıyor (klasör adı bozuk)', eski: "s[n - 3].toLowerCase() === 'departman'", yeni: "s[n - 3].toLowerCase() === 'departmanX'", dusen: ['d61Uyarir', 'd201Engel', 'dBaytUyarir'] },
        { ad: 'departmana sert eşik uygulanmıyor', eski: 'if (sonuc !== null) {', yeni: 'if (sonuc !== null && !departman) {', dusen: ['d201Engel'] },
        { ad: 'ana indeks departman eşiğini kullanıyor (sızıntı)', eski: '} else if (bayt >= YUMUSAK_BAYT || satir >= YUMUSAK_SATIR) {', yeni: '} else if (bayt >= DEPARTMAN_YUMUSAK_BAYT || satir >= DEPARTMAN_YUMUSAK_SATIR) {', dusen: ['ana61Sessiz', 'anaBayt8100Sessiz'] },
        { ad: 'ana yumuşak eşik bozuldu (160 → 1600)', eski: 'const YUMUSAK_SATIR = 160', yeni: 'const YUMUSAK_SATIR = 1600', dusen: ['ana160Uyarir'] },
        { ad: 'ana sert eşik bozuldu (200 → 2000)', eski: 'const SERT_SATIR = 200', yeni: 'const SERT_SATIR = 2000', dusen: ['d201Engel', 'ana201Engel'] },
        { ad: 'katlanmış arama departman yerine ana dizinde', eski: 'katlanmisMi(s, memoryDir, indeksAdi)', yeni: 'katlanmisMi(s, path.dirname(path.dirname(memoryDir)), indeksAdi)', dusen: ['dKatlanmisSessiz', 'dYanlisYerKatlamaUyarir'] },
      ]
      const gecici = fs.mkdtempSync(path.join(os.tmpdir(), 'rec280-mutant-'))
      for (const m of mutasyonlar) {
        expect(kaynak.includes(m.eski), `mutasyon "${m.ad}" kancada eşleşmiyor — kaynak değişmiş, tablo bayat`).toBe(true)
        const mutant = path.join(gecici, 'hafiza-indeks-bekcisi.cjs')
        fs.writeFileSync(mutant, kaynak.replace(m.eski, () => m.yeni), 'utf8')
        const sonuc = senaryo(mutant)
        for (const anahtar of m.dusen) {
          expect(sonuc[anahtar], `mutant SAĞ KALDI: "${m.ad}" → "${anahtar}" senaryosu yine yeşil; test bu davranışı korumuyor`).toBe(false)
        }
      }
    })
  })

  it('PRECOMPACT İKİ EŞİK taşır ve ikisi FARKLI şey söyler (aynı sayıya iki anlam yüklenmez)', () => {
    const s = oku(PRECOMPACT)
    expect(s, 'sert bayt eşiği yanlış (gerçek sınır ~25.000)').toMatch(/MEMORY_ESIK_BAYT = 25000/)
    expect(s, 'sert satır eşiği yok (gerçek sınır 200 satır)').toMatch(/MEMORY_ESIK_SATIR = 200/)
    expect(s, 'yumuşak bayt eşiği yanlış').toMatch(/MEMORY_YUMUSAK_ESIK_BAYT = 20000/)
    expect(s, 'yumuşak satır eşiği yok').toMatch(/MEMORY_YUMUSAK_ESIK_SATIR = 160/)
    expect(s, 'sert eşik metni yumuşak eşikle aynı şeyi söylüyor — okuyan aciliyeti ayırt edemez').toMatch(/OTOPSI/)
    expect(s).toMatch(/YUMUSAK esik/)
    // Yorum sıyırmadan (şema-güvensiz sıyırıcı yasak, INV-SCRUB-1): eşik ATAMALARI aranır, yorum metni değil.
    expect(/MEMORY_(YUMUSAK_)?ESIK_BAYT\s*=\s*(16384|15800)/.test(s), 'eski yanlış eşik (16384/15800) sabit olarak kalmış').toBe(false)
  })
})
