import { describe, expect, it } from 'vitest'

/**
 * INV-RLS-INITPLAN-2 (ALT-146) — auth.<fn>() cagrisi alt sorguda TEK BASINA durur.
 *
 * NICIN: #2226 sonrasi Performance Advisor `auth_rls_initplan` uyarisini p_dsr_insert icin
 * vermeye devam etti. `(select auth.jwt() ->> 'email')` Postgres'te
 * `( SELECT (auth.jwt() ->> 'email'))` olarak saklanir; advisor alt sorgunun icinde cagrinin
 * kendisini arar, ->> operatoruyle sarilmis cagriyi satir basi sayar. alt142 testi yalniz
 * "onunde (select var mi" diye baktigi icin bunu gormedi. Dogru bicim:
 * `((select auth.jwt()) ->> 'email')`.
 *
 * KAPSAM: bu migration ve sonrasi (damga >= 20261103180000) — eski migration'lar tarihtir,
 * canlidaki son hali bu migration duzeltir.
 * SABOTAJ: asagidaki testler kasitli bozuk kopyada kapinin KIRMIZI verdigini olcer.
 */

declare global {
  interface ImportMeta {
    glob(
      pattern: string,
      options: { query: string; import: string; eager: true },
    ): Record<string, string>
  }
}

const MIGRATIONLAR: Record<string, string> = import.meta.glob('/supabase/migrations/*.sql', {
  query: '?raw',
  import: 'default',
  eager: true,
})

const ESIK = '20261103180000'
const BU_YOL = '/supabase/migrations/20261103180000_alt146_dsr_insert_initplan.sql'

const yorumsuz = (s: string): string => s.replace(/--[^\n]*/g, '')

/**
 * Yalniz RLS politika ifadeleri (create/alter policy) initplan kapsamindadir: advisor auth_rls_initplan politika
 * USING/WITH CHECK ifadesine bakar. FONKSIYON GOVDESINDEKI auth.<fn>() cagrisi satir basi degil cagri basina
 * calisir ve plpgsql'de (select ...) sarmasi anlamsizdir; dollar-quote govdeleri atilir. Bilinen kor nokta:
 * DO blogu icinde execute ile kurulan dinamik politika (bu depoda yok).
 */
function politikaIfadeleri(sql: string): string {
  // Tek geciste soldan saga okunur (sozcuk cozumleyici gibi): dollar-quote govdesi (etiket rakam icerebilir: $f1$),
  // tek tirnakli literal ('a;b' ya da 'a--b' ifadeyi bolmesin) ve -- yorumu (Turkce yorumdaki kesme isareti literal
  // sanilmasin). Hangisi once baslarsa o kazanir; ayri ayri sirali replace bu ikisinden birini yanlis yutar.
  return sql
    .replace(/\$(\w*)\$[\s\S]*?\$\1\$|'(?:[^']|'')*'|--[^\n]*/g, (m) => (m.startsWith("'") ? "''" : ''))
    .split(';')
    .filter((s) => /^\s*(?:create|alter)\s+policy\b/i.test(s))
    .join(';')
}

/** auth.<fn>() cagrisi alt sorguda tek basina degilse ihlal: `(select auth.x() ->> ...)` ya da ciplak. */
function initplanIhlalleri(sql: string): string[] {
  const govde = politikaIfadeleri(sql)
  const ihlal: string[] = []
  const tumCagrilar = govde.match(/auth\.\w+\(\)/gi) ?? []
  const tekBasina = govde.match(/\(\s*select\s+auth\.\w+\(\)\s*\)/gi) ?? []
  if (tumCagrilar.length !== tekBasina.length) {
    ihlal.push(`alt sorguda tek başına olmayan auth çağrısı: ${tumCagrilar.length - tekBasina.length} adet`)
  }
  return ihlal
}

describe('INV-RLS-INITPLAN-2 — auth.<fn>() alt sorguda tek başına (ALT-146)', () => {
  const kapsam = Object.entries(MIGRATIONLAR).filter(([yol]) => {
    const ad = yol.split('/').pop() ?? ''
    return ad.slice(0, 14) >= ESIK
  })

  it('boş evren koruması: bu migration okundu ve kapsamda', () => {
    expect(MIGRATIONLAR[BU_YOL]).toBeTruthy()
    expect(kapsam.map(([y]) => y)).toContain(BU_YOL)
  })

  it('kapsamdaki her migration temiz', () => {
    const bulgular = kapsam.flatMap(([yol, sql]) => initplanIhlalleri(sql).map((i) => `${yol}: ${i}`))
    expect(bulgular).toEqual([])
  })

  it('p_dsr_insert doğru biçimi taşır ve değer kapısı korunur', () => {
    const sql = yorumsuz(MIGRATIONLAR[BU_YOL] ?? '')
    expect(sql).toMatch(/alter policy p_dsr_insert on public\.data_subject_requests/)
    expect(sql).toContain("applicant_email = ((select auth.jwt()) ->> 'email')")
    for (const parca of [
      '(select public.is_admin_user())',
      'user_id = (select auth.uid())',
      "status = 'received'::text",
      "due_at = (received_at + '30 days'::interval)",
      'outcome is null',
      'completed_at is null',
      'identity_verified_at is null',
      'handled_by is null',
      'retained_data_note is null',
    ]) {
      expect(sql).toContain(parca)
    }
  })

  describe('sabotaj: kasıtlı bozuk kopyada kapı KIRMIZI', () => {
    const asil = MIGRATIONLAR[BU_YOL] ?? ''

    it("(select auth.jwt() ->> 'email') — advisor'un yakaladığı biçim", () => {
      // Yorumda da geçtiği için kalıp politika satırına bağlanır (ilk eşleşme yorumdaydı).
      const bozuk = asil.replace(
        "applicant_email = ((select auth.jwt()) ->> 'email')",
        "applicant_email = (select auth.jwt() ->> 'email')",
      )
      expect(bozuk).not.toBe(asil)
      expect(initplanIhlalleri(bozuk).join('\n')).toMatch(/tek başına olmayan/)
    })

    it("SABOTAJ: politika literalinde ';' ya da '--' çıplak çağrıyı gizlemez; rakamlı dollar etiketi soyulur", () => {
      const noktali = "alter policy p on public.t with check (x = 'a;b' and user_id = auth.uid());"
      expect(initplanIhlalleri(noktali).join('\n')).toMatch(/tek başına olmayan/)
      const tireli = "alter policy p on public.t with check (x = 'a--b' and user_id = auth.uid());"
      expect(initplanIhlalleri(tireli).join('\n')).toMatch(/tek başına olmayan/)
      const rakamli = 'create function public.f() returns uuid language sql as $f1$ select auth.uid() $f1$;'
      expect(initplanIhlalleri(rakamli)).toEqual([])
    })

    it('fonksiyon gövdesindeki çıplak auth.uid() bu kapının konusu değil, politikadaki çıplak çağrı kırmızı kalır', () => {
      const govdeli = `create or replace function public.f() returns uuid language sql as $$ select auth.uid() $$;`
      expect(initplanIhlalleri(govdeli)).toEqual([])
      const politikali = `${govdeli}\nalter policy p on public.t with check (user_id = auth.uid());`
      expect(initplanIhlalleri(politikali).join('\n')).toMatch(/tek başına olmayan/)
    })

    it('çıplak auth.uid()', () => {
      const bozuk = asil.replace('user_id = (select auth.uid())', 'user_id = auth.uid()')
      expect(bozuk).not.toBe(asil)
      expect(initplanIhlalleri(bozuk).join('\n')).toMatch(/tek başına olmayan/)
    })
  })
})
