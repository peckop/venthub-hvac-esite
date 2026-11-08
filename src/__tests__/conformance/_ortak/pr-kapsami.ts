import { createRequire } from 'node:module'
import { resolve } from 'node:path'

/**
 * PR KAPSAMI · ortak yardımcı (ALT-38i parça 2). Test DEĞİLDİR (vitest yalnız `*.test.ts` toplar).
 *
 * Soru: "bu PR hangi dosyalara dokundu ve bir test yalnız onları mı taramalı?" Dosya başına çalışan bir kuralın ihlali
 * yalnız o dosyanın içeriğinden doğar; PR kapısında yalnız PR'ın DEĞİŞTİRDİĞİ dosyalar taranır, tam tarama dünya durumu
 * koluna (master push + zamanlı koşu, `scripts/ci/dunya-durumu-testleri.json`) gider. Bu dosya yalnız o genel işi yapar:
 * değişen listeyi okur ve verilen kümeyi ona göre daraltır. Hangi dosyaların taranacağı, kontrolün KENDİ kodu değişince
 * ne olacağı gibi teste özgü kararlar çağıranındır (örnek: `standard-section-integrity.yardimci.ts`).
 *
 * FAIL-CLOSED: değişen liste okunamazsa (`null`) daraltma YAPILMAZ, küme aynen döner ve `tam: true` olur. Boş küme yalnız
 * "liste okundu ve hiçbir hedefe dokunulmadı" iken olur; "ölçemedim" asla boş kümeye çevrilmez.
 */

const require_ = createRequire(import.meta.url)

/**
 * PR'ın değişen dosyaları: kanonik, POSIX, köke göreli yollar; okunamadıysa `null`.
 * Tek okuyucu `scripts/ci/dunya-durumu.cjs` `degisenYollariniOku`dur (CI'da `git diff --name-only -z --no-renames HEAD^1 HEAD`;
 * yerel kullanım ve testler `VENTHUB_DUNYA_DEGISEN_DOSYALAR=<dosya yolu>` ile elle verir; doluyken okunamıyorsa git'e DÜŞÜLMEZ).
 * Okuyucunun kendisi yüklenemese ya da fırlatsa da bu işlev FIRLATMAZ, `null` döner (yani çağıran TAM taramaya düşer).
 * ⚠Yerelde commit sonrası `HEAD^1..HEAD` yalnız SON commit'tir; çok commitli yerel dalda PR'ın tamamı için liste elle verilir.
 */
export function prDegisenleri(oku: () => unknown = gercekOkuyucu): string[] | null {
  try {
    const d = oku()
    return Array.isArray(d) ? (d as string[]) : null
  } catch {
    return null
  }
}

function gercekOkuyucu(): string[] | null {
  const modul = require_(resolve(__dirname, '../../../../scripts/ci/dunya-durumu.cjs')) as {
    degisenYollariniOku: () => string[] | null
  }
  return modul.degisenYollariniOku()
}

/**
 * `tumu` kümesini PR'ın değişen dosyalarına göre daraltır.
 * @param tumu     tam küme (taranabilecek her hedef)
 * @param anahtar  bir hedefin değişen listedeki yol karşılığı (kanonik, POSIX, köke göreli; ör. `(y) => y`)
 * @param degisen  testler için enjeksiyon; verilmezse `prDegisenleri()` okunur. Açık `null` = "okunamadı" (varsayılan DEVREYE GİRMEZ).
 * @returns `degisen` okunamadıysa `{ liste: tumu (aynen), tam: true }`; okunduysa `{ liste: tumu ∩ değişen (tumu sırasında), tam: false }`
 */
export function kapsamla<T>(
  tumu: T[],
  anahtar: (x: T) => string,
  degisen: string[] | null = prDegisenleri(),
): { liste: T[]; tam: boolean } {
  if (!Array.isArray(degisen)) return { liste: tumu, tam: true }
  const kume = new Set(degisen)
  return { liste: tumu.filter((x) => kume.has(anahtar(x))), tam: false }
}
