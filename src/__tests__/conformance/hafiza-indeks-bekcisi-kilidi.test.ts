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
): { kod: number | null; cikti: string } {
  const r = spawnSync(process.execPath, [path.join(KOK, KANCA)], {
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

  it('⛔MUTLAK YOL YAZILMAZ (§24 kimlik sızdırma — depo PUBLIC), dizin yazılan dosyanın yolundan türetilir', () => {
    const s = oku(KANCA)
    expect(
      /[A-Za-z]:[\\/]Users[\\/]|\/Users\/|\/home\/[a-z]/.test(s),
      'kancada kullanıcı adı taşıyan mutlak yol var — public depoda kimlik sızdırır',
    ).toBe(false)
    // Oturumun proje dizini KULLANILMAZ: yazılan dosyanın kendisi ölçülür (yanlış pozitif + worktree kör noktası).
    expect(s, 'hafıza dizini yazılan dosyanın yolundan türetilmiyor').toMatch(/path\.dirname\(hedef\)/)
    expect(s, 'oturumun proje dizinine bakan eski türetim geri gelmiş — başka projenin indeksinde yalancı uyarı verir').not.toMatch(/projeDiziniBul|os\.homedir\(\)/)
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
