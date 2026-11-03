// @vitest-environment node
import fs from 'node:fs'
import os from 'node:os'
import path from 'node:path'
import { createRequire } from 'node:module'

import { afterAll, describe, expect, it } from 'vitest'

/**
 * Döküm sır taraması (güvenlik karnesi 2026-11 S3, OPS-211) — `scripts/security/dokum-sir-taramasi.cjs`.
 *
 * Korunan kusur sınıfları:
 *  (a) tarayıcı kördür: fonksiyon gövdesine gömülü JWT / parolalı bağlantı dizesi / webhook sırrı geçer;
 *  (b) tarayıcı ölçemediğinde yeşil verir: dosya yok ya da boşken çıkış 0;
 *  (c) tarayıcı değeri basar: bulgu satırı sırrın kendisini günlüğe yazar (public depoda günlük de açıktır);
 *  (d) tarayıcı bugünkü temiz tabanlarda yanlış alarm verir ve iş akışı kalıcı kırmızıya döner.
 *
 * Fikstür sırları SAHTEDİR ve kaynakta parçalı kurulur: dosyanın kendisi depo tarayıcılarına takılmasın.
 */

const require_ = createRequire(import.meta.url)
const { calistir, dokumTara } = require_('../dokum-sir-taramasi.cjs') as {
  calistir: (argv: string[], ortam?: { yaz?: (s: string) => void; hata?: (s: string) => void }) => 0 | 1 | 2
  dokumTara: (metin: string) => string[]
}

const GECICI = fs.mkdtempSync(path.join(os.tmpdir(), 'dokum-sir-'))
afterAll(() => fs.rmSync(GECICI, { recursive: true, force: true }))

function yaz(ad: string, icerik: string): string {
  const yol = path.join(GECICI, ad)
  fs.writeFileSync(yol, icerik)
  return yol
}

function kos(argv: string[]) {
  const cikti: string[] = []
  const kod = calistir(argv, { yaz: (s) => cikti.push(s), hata: (s) => cikti.push(s) })
  return { kod, cikti: cikti.join('\n') }
}

// Sahte değerler: parçalı kurulur, gerçek değil.
const SAHTE_JWT = ['eyJ', 'hbGciOiJIUzI1NiJ9', '.', 'eyJ', 'yb2xlIjoic2VydmljZV9yb2xlIn0', '.', 'c2FodGVpbXphc2FodGVpbXph'].join('')
const SAHTE_PAROLA = ['Sahte', 'Parola', '1234'].join('')
const SAHTE_BAGLANTI = `postgres${'ql'}://postgres:${SAHTE_PAROLA}@db.ornek.supabase.co:5432/postgres`
const SAHTE_WHSEC = ['wh', 'sec_', 'SahteSirSahteSir1234'].join('')

const TEMIZ_SEMA = `CREATE TABLE public.urunler (id uuid PRIMARY KEY, ad text NOT NULL);
CREATE POLICY urun_okuma ON public.urunler FOR SELECT USING (true);
CREATE FUNCTION public.f() RETURNS void LANGUAGE plpgsql AS $$ BEGIN PERFORM 1; END $$;
-- postgres://localhost/yerel (parolasiz baglanti dizesi takilmaz)
`

describe('dokum-sir-taramasi (S3)', () => {
  it('temiz şema dökümü: çıkış 0', () => {
    expect(kos([yaz('temiz.sql', TEMIZ_SEMA)]).kod).toBe(0)
  })

  it.each([
    ['JWT (fonksiyon gövdesinde)', `CREATE FUNCTION f() AS $$ select net.http_post(headers := '{"Authorization":"Bearer ${SAHTE_JWT}"}') $$;`, 'JWT'],
    ['parolalı bağlantı dizesi', `-- ${SAHTE_BAGLANTI}`, 'Postgres'],
    ['webhook sırrı', `ALTER TABLE t ALTER COLUMN s SET DEFAULT '${SAHTE_WHSEC}';`, 'Webhook'],
  ])('KÖR DEĞİL: %s yakalanır, çıkış 1', (_ad, satir, imza) => {
    const { kod, cikti } = kos([yaz('kirli.sql', TEMIZ_SEMA + satir + '\n')])
    expect(kod).toBe(1)
    expect(cikti).toContain(imza)
  })

  it('DEĞER BASMAZ: bulgu çıktısında sırrın kendisi yok', () => {
    const { cikti } = kos([yaz('kirli2.sql', `${SAHTE_JWT}\n${SAHTE_BAGLANTI}\n${SAHTE_WHSEC}\n`)])
    for (const deger of [SAHTE_JWT, SAHTE_PAROLA, SAHTE_WHSEC]) expect(cikti).not.toContain(deger)
  })

  it('ÖLÇÜLEMEDİ = 2: dosya yok, dosya boş, argüman yok', () => {
    expect(kos([path.join(GECICI, 'olmayan.sql')]).kod).toBe(2)
    expect(kos([yaz('bos.sql', '  \n')]).kod).toBe(2)
    expect(kos([]).kod).toBe(2)
  })

  it('YANLIŞ ALARM YOK: depodaki tüm şema tabanları temiz (bugünkü ölçüm 19 dosya)', () => {
    const dizin = path.join(process.cwd(), 'supabase', 'baselines')
    const dosyalar = fs.readdirSync(dizin).filter((f) => f.endsWith('.sql'))
    expect(dosyalar.length).toBeGreaterThan(0)
    const kirli = dosyalar.filter((f) => dokumTara(fs.readFileSync(path.join(dizin, f), 'utf8')).length > 0)
    expect(kirli, 'taban dosyasında bulgu: ya gerçek sızıntı ya imza fazla geniş').toEqual([])
  })
})
