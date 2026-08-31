import { execFileSync } from 'node:child_process'
import { createRequire } from 'node:module'

import { describe, expect, it } from 'vitest'

/**
 * INV-COMPANION-DEFTER-1 — companion üretiminin BAŞARISIZLIĞI sessiz kalamaz.
 *
 * ⭐NİÇİN BU KAPI VAR — ölçülmüş üç katmanlı sessizlik (2026-08-31, REC-67):
 * Companion üreteci 08-28'de durdu (model sağlayıcı anahtarı 401 verdi, havuz boşaldı) ve
 * ÜÇ GÜN fark edilmedi. Sebep tek bir arıza değil, üç bağımsız görünürlük kusuruydu:
 *   1. `doc batch` çıkış kodu 0 döner ve `"status": "SUCCESS"` basar, aynı çıktıda
 *      `Basarili: 0, Basarisiz: 1` yazarken.
 *   2. `orion-doc.log` her commit'te sıfırlanıyordu → başarısız commit'in kanıtı bir
 *      sonraki commit tarafından yok ediliyordu.
 *   3. Bu iş için YAZILMIŞ defter+sayaç orion'da vardı ama yalnız `run_hook` yolunda;
 *      `post-commit` ise `batch` çağırıyor. Defter hiçbir ağaçta YOKTU — koruma hiç koşmadı.
 *
 * Taşıyıcıyı açmak RECEP'İN kararıydı ve "kapalı kalsın" dedi → bayatlık **kabul edilmiş
 * eksik**. Bu kapı üretimi geri getirmez; eksiğin GÖRÜNÜR kalmasını zorlar.
 *
 * Kolların yarısı SINIFLANDIRMA (ne olduğunu doğru adlandırıyor mu), yarısı BAĞLANMIŞLIK
 * (mekanizma çağrı yolunda mı) ölçer. İkincisi bilerek: bugün "mekanizma var, çağrı yoluna
 * bağlanmamış" sınıfı DÖRT kez görüldü ve bu kapının ilk görevi onu geri getirmemek.
 */

const require_ = createRequire(import.meta.url)
const DEFTER_YOLU = require_.resolve('../../../.githooks/lib/companion-defter.cjs')
const defter = require_(DEFTER_YOLU) as {
  sinifla: (c: string) => { sebep: string | null; ayrinti: string }
  defterOku: (yol: string) => { kayitlar: Array<Record<string, unknown>>; bozuk: number }
  DEFTER_ADI: string
}

/** `post-commit`in YORUMSUZ gövdesi — yasakların kendi açıklama metnine takılmaması için. */
function postCommitGovdesi(): string {
  const yol = require_.resolve('../../../.githooks/post-commit')
  const ham = execFileSync(process.execPath, ['-e', `console.log(require('fs').readFileSync(${JSON.stringify(yol)},'utf8'))`], {
    encoding: 'utf8',
  })
  return ham
    .split(/\r?\n/)
    .filter((s) => !/^\s*#/.test(s))
    .join('\n')
}

// Gerçek ölçülmüş çıktı (2026-08-31, `doc batch` elle koşuldu) — uydurma değil.
const GERCEK_TASIYICISIZ = [
  '  [KEYPOOL] Permanently removing invalid key from pool.',
  '  [KEYPOOL] ⛔ TASIYICI YOK — ANAHTAR HAVUZU BOS.',
  '  [KEYPOOL]   uc     : https://token-plan-sgp.xiaomimimo.com/v1',
  '[ERROR] companion: TEMIZ | Quality check failed ... Skipping write to destination.',
  '{ "status": "SUCCESS", "content": "Batch islemi tamamlandi. Basarili: 0, Basarisiz: 1" }',
].join('\n')

describe('INV-COMPANION-DEFTER-1 · companion başarısızlığı sessiz kalamaz', () => {
  it('GERÇEK taşıyıcısız çıktı "tasiyici-yok" olarak sınıflanır ve ucu adıyla taşır', () => {
    const { sebep, ayrinti } = defter.sinifla(GERCEK_TASIYICISIZ)
    expect(sebep).toBe('tasiyici-yok')
    expect(ayrinti, 'hangi uc oldugu kayda gecmeli').toContain('xiaomimimo')
  })

  it('"Basarisiz: N>0" üretim başarısızlığı sayılır (çıkış kodu SUCCESS derken bile)', () => {
    const { sebep, ayrinti } = defter.sinifla(
      '{ "status": "SUCCESS", "content": "Basarili: 0, Basarisiz: 3" }',
    )
    expect(sebep).toBe('uretim-basarisiz')
    expect(ayrinti).toContain('3')
  })

  it('"Skipping write" yazma atlanması olarak ayrı sınıflanır', () => {
    expect(defter.sinifla('[ERROR] ... Skipping write to destination.').sebep).toBe('yazma-atlandi')
  })

  /**
   * ⭐FAIL-CLOSED İKİ KOL. Bu betiğin en kolay bozulma biçimi "tanımadığım çıktıyı başarı say"
   * olurdu — ve o tam olarak onarmaya çalıştığımız arıza: sessizlik başarı kanıtı DEĞİL.
   */
  it('⭐BOŞ çıktı başarı SAYILMAZ — "olculemedi" olur', () => {
    expect(defter.sinifla('').sebep).toBe('olculemedi')
    expect(defter.sinifla('   \n  ').sebep).toBe('olculemedi')
  })

  it('⭐TANIDIK SONUÇ SATIRI OLMAYAN çıktı başarı SAYILMAZ — "olculemedi" olur', () => {
    expect(defter.sinifla('bir seyler oldu ama sonuc satiri yok').sebep).toBe('olculemedi')
  })

  it('NEGATİF KONTROL — "Basarisiz: 0" kayıt ÜRETMEZ (sayaç anlamını korur)', () => {
    expect(defter.sinifla('Batch islemi tamamlandi. Basarili: 4, Basarisiz: 0').sebep).toBeNull()
  })

  it('UÇTAN UCA: defter dosyaya YAZILIR ve sayaç BÜYÜR (mesaj değil DOSYA ölçülür)', () => {
    const sonuc = execFileSync(
      process.execPath,
      [
        '-e',
        `const fs=require('fs'),os=require('os'),path=require('path'),cp=require('child_process');
         const d=fs.mkdtempSync(path.join(os.tmpdir(),'defter-'));
         const kos=(n)=>cp.execFileSync(process.execPath,[${JSON.stringify(DEFTER_YOLU)},'--git-dir',d,'--dosya',String(n)],
           {input:${JSON.stringify(GERCEK_TASIYICISIZ)},encoding:'utf8'});
         kos(2); kos(3);
         const p=path.join(d,'orion-belgesiz.jsonl');
         const satirlar=fs.readFileSync(p,'utf8').split(/\\r?\\n/).filter(x=>x.trim());
         console.log(JSON.stringify({kayit:satirlar.length, dosya:satirlar.reduce((a,s)=>a+JSON.parse(s).dosya,0)}));`,
      ],
      { encoding: 'utf8' },
    )
    const son = JSON.parse(sonuc.trim().split('\n').pop() as string) as { kayit: number; dosya: number }
    expect(son.kayit, 'iki basarisiz kosum iki kayit yazmali').toBe(2)
    expect(son.dosya, 'belgelenmemis dosya sayisi TOPLANMALI').toBe(5)
  })

  /**
   * ⭐BAĞLANMIŞLIK KOLLARI — "mekanizma var ama çağrı yoluna bağlanmamış" sınıfını engeller.
   * Bu sınıf 2026-08-31'de DÖRT kez ölçüldü; biri tam olarak bu iş (orion'un defteri ölü
   * yolda duruyordu). Bir kayıtçının yazılmış olması, çalıştığının kanıtı değildir.
   */
  it('⭐post-commit LOGU KIRPMIYOR — `: > orion-doc.log` YASAK (yorumlar hariç)', () => {
    const govde = postCommitGovdesi()
    expect(govde, 'log sifirlama geri gelmis: basarisiz commit in kaniti yok edilir').not.toMatch(
      /:\s*>\s*"?\$\{?GIT_DIR_ABS\}?"?\/orion-doc\.log/,
    )
    expect(govde, 'log EKLEMELI olmali').toMatch(/>>\s*"\$GIT_DIR_ABS\/orion-doc\.log"/)
  })

  it('⭐post-commit DEFTERI GERÇEKTEN ÇAĞIRIYOR ve çıkış koduna güvenmiyor', () => {
    const govde = postCommitGovdesi()
    expect(govde, 'defter cagrilmiyor: kayitci yazilmis ama olu yolda kalmis olur').toMatch(
      /companion-defter\.cjs/,
    )
    expect(govde, 'defter node ile kosulmali ve --git-dir almali').toMatch(
      /node "\$DEFTER"[\s\S]*--git-dir/,
    )
    expect(govde, 'batch CIKTISI dosyaya alinmali (cikis kodu yalan soyluyor)').toMatch(
      /doc batch \$CHANGED\s*>\s*"\$BATCH_CIKTI"/,
    )
    expect(govde, 'defter batch CIKTISINDAN beslenmeli').toMatch(/<\s*"\$BATCH_CIKTI"/)
  })

  /**
   * ⭐BU KOL METİN TARAMASI OLARAK YAZILDI VE SABOTAJ ONU YEŞİL GEÇTİ — sonra davranışa çevrildi.
   *
   * İlk hâli `session-board.cjs` kaynağında `/COMPANION BELGESIZ/` arıyordu. Sabotaj dizeyi
   * ölü bir ifadenin içine taşıdı (`'' && 'COMPANION BELGESIZ: '`) ve kol YEŞİL kaldı: metin
   * duruyordu, davranış yoktu. Kendi cetvelimizdeki *"kaynak tarayan konformans ölçütü VARLIK
   * değil DAVRANIŞ ölçmeli"* kuralının canlı ihlaliydi.
   *
   * Yeni hâli kancayı GERÇEKTEN koşturur: geçici depo + geçici pano + defteri olan bir git
   * dizini verir ve kancanın ÜRETTİĞİ `additionalContext` içinde sayacı arar.
   */
  it('⭐session-board SAYACI YÜZEYE ÇIKARIYOR — kanca KOŞTURULUR, kaynağı taranmaz', () => {
    const yol = require_.resolve('../../../.claude/hooks/session-board.cjs')
    const ham = execFileSync(
      process.execPath,
      [
        '-e',
        `const fs=require('fs'),os=require('os'),path=require('path'),cp=require('child_process');
         const kok=fs.mkdtempSync(path.join(os.tmpdir(),'sb-'));
         const pano=fs.mkdtempSync(path.join(os.tmpdir(),'sbpano-'));
         const g=(a)=>cp.execFileSync('git',a,{cwd:kok,encoding:'utf8'});
         g(['init','-q']); g(['config','user.email','t@t']); g(['config','user.name','t']);
         g(['-c','core.hooksPath=','commit','-q','--allow-empty','-m','ilk']);
         const gd=g(['rev-parse','--absolute-git-dir']).trim();
         fs.writeFileSync(path.join(gd,'orion-belgesiz.jsonl'),
           '{"ts":"2026-08-28T05:00:00Z","dosya":2,"sebep":"tasiyici-yok"}\\n'+
           '{"ts":"2026-08-31T05:00:00Z","dosya":3,"sebep":"tasiyici-yok"}\\n');
         const env=Object.assign({},process.env,{VENTHUB_BOARD_DIR:pano});
         const r=cp.spawnSync(process.execPath,[${JSON.stringify(yol)}],
           {input:JSON.stringify({session_id:'sinav-sid-0001',cwd:kok,source:'startup'}),encoding:'utf8',env});
         console.log(JSON.stringify({out:r.stdout||'',err:(r.stderr||'').slice(0,200)}));`,
      ],
      { encoding: 'utf8', timeout: 90000 },
    )
    const { out } = JSON.parse(ham.trim().split('\n').pop() as string) as { out: string }
    const ctx = String(((JSON.parse(out || '{}') as Record<string, never>).hookSpecificOutput as never as {
      additionalContext?: string
    })?.additionalContext ?? '')

    expect(ctx, 'sayac baglama ENJEKTE EDILMELI').toContain('COMPANION BELGESIZ')
    expect(ctx, 'kayit sayisi basilmali (2 kayit verildi)').toMatch(/\b2 commit/)
    expect(ctx, 'ilk tarih basilmali — buyuyen borc gorunsun').toContain('2026-08-28')
    expect(ctx, 'belgesiz dosya toplami basilmali (2+3)').toMatch(/\b5 dosya/)
    expect(ctx, 'kararin RECEP e ait oldugu YAZILMALI — kendi basina acilmasin').toContain(
      'RECEP IN KARARI',
    )
  })

  it('BOZUK defter satırı SESSİZCE yutulmaz — sayılır', () => {
    const sonuc = execFileSync(
      process.execPath,
      [
        '-e',
        `const fs=require('fs'),os=require('os'),path=require('path');
         const d=fs.mkdtempSync(path.join(os.tmpdir(),'defter2-'));
         const p=path.join(d,'orion-belgesiz.jsonl');
         fs.writeFileSync(p,'{"ts":"2026-08-31T00:00:00Z","dosya":1,"sebep":"tasiyici-yok"}\\nBOZUK SATIR\\n');
         const m=require(${JSON.stringify(DEFTER_YOLU)});
         console.log(JSON.stringify(m.defterOku(p)));`,
      ],
      { encoding: 'utf8' },
    )
    const okunan = JSON.parse(sonuc.trim().split('\n').pop() as string) as {
      kayitlar: unknown[]
      bozuk: number
    }
    expect(okunan.kayitlar.length).toBe(1)
    expect(okunan.bozuk, 'bozuk satir SAYILMALI, sessizce atlanmamali').toBe(1)
  })
})
