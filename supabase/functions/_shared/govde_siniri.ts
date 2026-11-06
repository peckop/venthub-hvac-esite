// İSTEK GÖVDESİ BOYUT SINIRI — gövdeyi okumadan ÖNCE ve okurken bayt sayar.
//
// NİÇİN (güvenlik incelemesi 2026-11-03 takibi, OPS-213): `log-client-error` gövdeyi `req.json()` ile
// sınırsız okuyordu. Maskeleme bütçesi (`nesneyiMaskele`) ayrıştırmadan SONRA devreye girer; megabaytlık
// bir gövde ondan önce JSON ayrıştırıcısında bellek ve CPU harcıyordu. `Content-Length` başlığı yalan
// söyleyebilir ya da hiç olmayabilir (chunked), bu yüzden akış da sayılır ve sınır aşılınca kesilir.
//
// Bu dosya SAF: Deno/ağ yok, vitest'ten içe aktarılır. Cetvel: `docs/standards/cikti-kodlama-maske-standard.md` K7.

export type GovdeSonucu = { ok: true; metin: string } | { ok: false; sebep: 'cok_buyuk' | 'okunamadi' }

/** Gövdeyi en çok `sinirBayt` bayt okuyarak metne çevirir; aşılırsa `cok_buyuk` döner ve akışı iptal eder. */
export async function govdeyiSinirliOku(req: Request, sinirBayt: number): Promise<GovdeSonucu> {
  const beyan = Number(req.headers.get('content-length') ?? '')
  if (Number.isFinite(beyan) && beyan > sinirBayt) return { ok: false, sebep: 'cok_buyuk' }
  if (!req.body) return { ok: true, metin: '' }
  const okuyucu = req.body.getReader()
  const parcalar: Uint8Array[] = []
  let toplam = 0
  try {
    for (;;) {
      const { done, value } = await okuyucu.read()
      if (done) break
      toplam += value.byteLength
      if (toplam > sinirBayt) {
        await okuyucu.cancel().catch(() => undefined)
        return { ok: false, sebep: 'cok_buyuk' }
      }
      parcalar.push(value)
    }
  } catch {
    return { ok: false, sebep: 'okunamadi' }
  }
  const birlesik = new Uint8Array(toplam)
  let konum = 0
  for (const p of parcalar) {
    birlesik.set(p, konum)
    konum += p.byteLength
  }
  return { ok: true, metin: new TextDecoder().decode(birlesik) }
}
