#!/usr/bin/env node
/**
 * KTL-98 / OPS-339 — Indirme Merkezi katalog PDF'lerini herkese acik Storage kovasina yukler.
 * CANLI YAZIM: Recep "yaz" sozuyle OPS penceresinde kosulur. Varsayilan KURU KOSU (hicbir sey yazmaz).
 *
 *   node scripts/icerik-hatti/katalog-pdf/yukle.mjs <ingestor-kok>                 # kuru kosu
 *   CANLI_YAZIM_ONAYI=evet node scripts/icerik-hatti/katalog-pdf/yukle.mjs <ingestor-kok> --yaz      # kova + yukleme + geri okuma
 *   CANLI_YAZIM_ONAYI=evet node scripts/icerik-hatti/katalog-pdf/yukle.mjs <ingestor-kok> --geri-al  # yalniz bu listedeki nesneleri siler
 *
 * <ingestor-kok> = venthub-pdf-ingestor/venthub klasoru (liste.json `yol` alani buna gore goreli).
 * Ortam: SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY (yalniz --yaz / --geri-al).
 *
 * Kova: `katalog-pdf` (public, yalniz application/pdf, dosya basina 50 MB). Kova Storage API ile
 * olusur; migration GEREKMEZ. Herkese acik okuma public bucket oldugu icin ek politika istemez.
 * Nesne anahtari: katalog/<marka>/<dosya> (Design katalog-dizini.json r[8] ile ayni).
 * Canlida kok adres: <SUPABASE_URL>/storage/v1/object/public/katalog-pdf  (Design `window.__vhPdfKok`).
 * Yukleme `x-upsert: false`: var olan nesne EZILMEZ (409 = zaten var, hata sayilmaz).
 * Kapi: tum yerel dosyalar var ve sha256'lari listedeki ile ayni olmadikca yazim BASLAMAZ.
 */
import { readFileSync, existsSync } from 'node:fs';
import { createHash } from 'node:crypto';
import { join, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';

const KLASOR = dirname(fileURLToPath(import.meta.url));
const { kova: KOVA, satirlar } = JSON.parse(readFileSync(join(KLASOR, 'liste.json'), 'utf8'));
const [kok, ...bayrak] = process.argv.slice(2);
const yaz = bayrak.includes('--yaz');
const geriAl = bayrak.includes('--geri-al');
if (!kok || (yaz && geriAl)) {
  console.error('kullanim: yukle.mjs <ingestor-kok> [--yaz | --geri-al]');
  process.exit(2);
}
const url = process.env.SUPABASE_URL;
const anahtar = process.env.SUPABASE_SERVICE_ROLE_KEY;
if (yaz || geriAl) {
  if (process.env.CANLI_YAZIM_ONAYI !== 'evet') {
    console.error('CANLI_YAZIM_ONAYI=evet yok: canli islem reddedildi');
    process.exit(2);
  }
  if (!url || !anahtar) {
    console.error('SUPABASE_URL / SUPABASE_SERVICE_ROLE_KEY tanimli degil');
    process.exit(2);
  }
}
const sha = (b) => createHash('sha256').update(b).digest('hex');

// 1) Kapi: yerel dosya var + sha256 tutuyor
let hata = 0;
const hazir = [];
for (const s of satirlar) {
  const yol = join(kok, s.yol);
  if (!existsSync(yol)) {
    console.error(`YOK: ${yol}`);
    hata++;
    continue;
  }
  const veri = readFileSync(yol);
  if (sha(veri) !== s.sha256) {
    console.error(`SHA256 FARKLI: ${s.anahtar}`);
    hata++;
    continue;
  }
  hazir.push({ ...s, veri });
}
if (hata) {
  console.error(`KIRMIZI: ${hata} dosya kapidan gecmedi, yazim yapilmadi`);
  process.exit(1);
}

if (!yaz && !geriAl) {
  for (const s of hazir) {
    console.log(`KURU: ${s.anahtar} (${(s.veri.length / 1e6).toFixed(1)} MB) -> ${KOVA}/${s.anahtar}`);
  }
  const toplam = hazir.reduce((t, s) => t + s.veri.length, 0);
  console.log(`KURU KOSU TAMAM: ${hazir.length} dosya, ${(toplam / 1e6).toFixed(1)} MB, kapi KIRMIZI 0`);
  process.exit(0);
}

const yetki = { Authorization: `Bearer ${anahtar}`, apikey: anahtar };

if (geriAl) {
  const r = await fetch(`${url}/storage/v1/object/${KOVA}`, {
    method: 'DELETE',
    headers: { ...yetki, 'Content-Type': 'application/json' },
    body: JSON.stringify({ prefixes: hazir.map((s) => s.anahtar) }),
  });
  console.log(`${r.ok ? 'SILINDI' : 'HATA ' + r.status}: ${hazir.length} nesne (kova ve diger nesneler korunur)`);
  process.exit(r.ok ? 0 : 1);
}

// 2) Kova (yoksa olustur; varsa dokunma)
const kovaVar = await fetch(`${url}/storage/v1/bucket/${KOVA}`, { headers: yetki });
if (kovaVar.ok) {
  console.log(`KOVA VAR: ${KOVA}`);
} else {
  const r = await fetch(`${url}/storage/v1/bucket`, {
    method: 'POST',
    headers: { ...yetki, 'Content-Type': 'application/json' },
    body: JSON.stringify({
      id: KOVA,
      name: KOVA,
      public: true,
      file_size_limit: 50 * 1024 * 1024,
      allowed_mime_types: ['application/pdf'],
    }),
  });
  console.log(`${r.ok ? 'KOVA OLUSTU' : 'KOVA HATA ' + r.status}: ${KOVA}`);
  if (!r.ok) process.exit(1);
}

// 3) Yukleme + canlidan geri okuma (sha256 + tur)
for (const s of hazir) {
  const hedef = `${KOVA}/${s.anahtar}`;
  const r = await fetch(`${url}/storage/v1/object/${hedef}`, {
    method: 'POST',
    headers: { ...yetki, 'Content-Type': 'application/pdf', 'x-upsert': 'false', 'cache-control': 'max-age=3600' },
    body: s.veri,
  });
  if (!r.ok && r.status !== 409 && r.status !== 400) {
    console.log(`HATA ${r.status}: ${hedef}`);
    hata++;
    continue;
  }
  const dur = r.ok ? 'YAZILDI' : 'ZATEN VAR';
  const g = await fetch(`${url}/storage/v1/object/public/${hedef}`);
  const gb = g.ok ? Buffer.from(await g.arrayBuffer()) : null;
  const tur = g.headers.get('content-type') ?? '';
  const tamam = gb && sha(gb) === s.sha256 && tur.startsWith('application/pdf');
  console.log(`${dur} ${tamam ? 'GERI OKUMA TAMAM' : 'GERI OKUMA KIRMIZI (' + g.status + ' ' + tur + ')'}: ${hedef}`);
  if (!tamam) hata++;
}
console.log(hata ? `KIRMIZI: ${hata} hata` : `TAMAM: ${hazir.length}/${hazir.length}; kok adres ${url}/storage/v1/object/public/${KOVA}`);
process.exit(hata ? 1 : 0);
