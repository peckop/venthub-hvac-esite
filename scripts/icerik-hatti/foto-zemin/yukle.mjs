#!/usr/bin/env node
/**
 * KTL-64 — dort urun fotografini AYNI ADLA depoya yazar (adres degismez).
 * CANLI YAZIM: Recep "yaz" sozuyle OPS penceresinde kosulur. Varsayilan KURU KOSU.
 *
 *   node scripts/icerik-hatti/foto-zemin/yukle.mjs <sonra-klasoru> <yedek-klasoru>          # kuru kosu
 *   node scripts/icerik-hatti/foto-zemin/yukle.mjs <sonra-klasoru> <yedek-klasoru> --yaz    # yazar
 *   node scripts/icerik-hatti/foto-zemin/yukle.mjs <sonra-klasoru> <yedek-klasoru> --geri-al # yedegi geri yazar
 *
 * Ortam: SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY (OPS penceresinde zaten tanimli).
 * Dosya adi = urun kimliginin ilk 8 hanesi + .webp; asagidaki tablo tam yolu verir.
 */
import { readFileSync, existsSync } from 'node:fs';
import { join } from 'node:path';

const TENANT = 'd3b07384-d113-495f-a558-8c38634e0000';
const HEDEFLER = {
  '561be29e': '561be29e-a3b1-4da7-a29f-21958e3b46af/00.webp',
  a3707a3a: 'a3707a3a-87ff-400e-8b91-a2134ca55bdc/foto.webp',
  '45d3f204': '45d3f204-5b7c-4bd4-b723-8b3584d53677/foto.webp',
  b2735646: 'b2735646-fdc4-4bbf-8f89-b4932e54b85b/foto.webp',
};

const [kaynakKlasor, yedekKlasor, ...bayrak] = process.argv.slice(2);
const yaz = bayrak.includes('--yaz');
const geriAl = bayrak.includes('--geri-al');
if (!kaynakKlasor || !yedekKlasor) {
  console.error('kullanim: yukle.mjs <sonra-klasoru> <yedek-klasoru> [--yaz|--geri-al]');
  process.exit(2);
}
const klasor = geriAl ? yedekKlasor : kaynakKlasor;
const url = process.env.SUPABASE_URL;
const anahtar = process.env.SUPABASE_SERVICE_ROLE_KEY;
if ((yaz || geriAl) && (!url || !anahtar)) {
  console.error('SUPABASE_URL / SUPABASE_SERVICE_ROLE_KEY tanimli degil');
  process.exit(2);
}

let hata = 0;
for (const [ad, yol] of Object.entries(HEDEFLER)) {
  const dosya = join(klasor, `${ad}.webp`);
  if (!existsSync(dosya)) {
    console.error(`YOK: ${dosya}`);
    hata++;
    continue;
  }
  const veri = readFileSync(dosya);
  const hedef = `product-images/${TENANT}/${yol}`;
  if (!yaz && !geriAl) {
    console.log(`KURU: ${dosya} (${veri.length} bayt) -> ${hedef}`);
    continue;
  }
  const r = await fetch(`${url}/storage/v1/object/${hedef}`, {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${anahtar}`,
      'Content-Type': 'image/webp',
      'x-upsert': 'true',
      'cache-control': 'max-age=3600',
    },
    body: veri,
  });
  console.log(`${r.ok ? 'YAZILDI' : 'HATA ' + r.status}: ${hedef}`);
  if (!r.ok) hata++;
}
process.exit(hata ? 1 : 0);
