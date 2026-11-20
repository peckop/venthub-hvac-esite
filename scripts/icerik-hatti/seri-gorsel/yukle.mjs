#!/usr/bin/env node
/**
 * KTL-98 / OPS-339 — 56 serinin urun fotograflarini (UnoPIM depolamasi) herkese acik Storage kovasina yukler.
 * CANLI YAZIM: Recep "yaz" sozuyle OPS penceresinde kosulur. Varsayilan KURU KOSU (hicbir sey yazmaz).
 *
 *   node scripts/icerik-hatti/seri-gorsel/yukle.mjs <kaynak-kok>                                  # kuru kosu
 *   CANLI_YAZIM_ONAYI=evet node scripts/icerik-hatti/seri-gorsel/yukle.mjs <kaynak-kok> --yaz     # kova + yukleme + geri okuma
 *   CANLI_YAZIM_ONAYI=evet node scripts/icerik-hatti/seri-gorsel/yukle.mjs <kaynak-kok> --geri-al # yalniz bu listedeki nesneleri siler
 *
 * <kaynak-kok> = UnoPIM `storage/app/public` icinden `product/` klasorunu iceren dizin
 *   (docker cp pim-unopim-unopim-1:/var/www/html/storage/app/public/product <kok>/ ile alinir; UnoPIM'e yazilmaz).
 * Ortam: SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY (yalniz --yaz / --geri-al).
 *
 * Kova: `katalog-gorsel` (public, png/jpeg/webp, dosya basina 5 MB). Kova Storage API ile olusur; migration GEREKMEZ.
 * Nesne anahtari: <seri-kimligi>/<sku>.<uzanti>; herkese acik adres:
 *   <SUPABASE_URL>/storage/v1/object/public/katalog-gorsel/<seri-kimligi>/<sku>.<uzanti>
 * Yukleme `x-upsert: false`: var olan nesne EZILMEZ. Yazim sonrasi her nesne canlidan geri okunur (sha256 + tur).
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
  console.error('kullanim: yukle.mjs <kaynak-kok> [--yaz | --geri-al]');
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
  const yol = join(kok, s.kaynak);
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
  const toplam = hazir.reduce((t, s) => t + s.veri.length, 0);
  console.log(`KURU: ilk 3 ornek: ${hazir.slice(0, 3).map((s) => s.anahtar).join(', ')}`);
  console.log(`KURU KOSU TAMAM: ${hazir.length} gorsel, ${(toplam / 1e6).toFixed(1)} MB, kapi KIRMIZI 0`);
  process.exit(0);
}

const yetki = { Authorization: `Bearer ${anahtar}`, apikey: anahtar };

if (geriAl) {
  let silinen = 0;
  for (let i = 0; i < hazir.length; i += 100) {
    const dilim = hazir.slice(i, i + 100);
    const r = await fetch(`${url}/storage/v1/object/${KOVA}`, {
      method: 'DELETE',
      headers: { ...yetki, 'Content-Type': 'application/json' },
      body: JSON.stringify({ prefixes: dilim.map((s) => s.anahtar) }),
    });
    if (!r.ok) {
      console.log(`HATA ${r.status}: silme dilimi ${i}`);
      process.exit(1);
    }
    silinen += dilim.length;
  }
  console.log(`SILINDI: ${silinen} nesne (kova ve diger nesneler korunur)`);
  process.exit(0);
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
      file_size_limit: 5 * 1024 * 1024,
      allowed_mime_types: ['image/png', 'image/jpeg', 'image/webp'],
    }),
  });
  console.log(`${r.ok ? 'KOVA OLUSTU' : 'KOVA HATA ' + r.status}: ${KOVA}`);
  if (!r.ok) process.exit(1);
}

// 3) Yukleme + canlidan geri okuma (sha256 + tur), 6'li paralel
async function yukle(s) {
  const hedef = `${KOVA}/${s.anahtar}`;
  const r = await fetch(`${url}/storage/v1/object/${hedef}`, {
    method: 'POST',
    headers: { ...yetki, 'Content-Type': s.tur, 'x-upsert': 'false', 'cache-control': 'max-age=3600' },
    body: s.veri,
  });
  if (!r.ok && r.status !== 409 && r.status !== 400) return { s, dur: `HATA ${r.status}`, tamam: false };
  const g = await fetch(`${url}/storage/v1/object/public/${hedef}`);
  const gb = g.ok ? Buffer.from(await g.arrayBuffer()) : null;
  const tur = g.headers.get('content-type') ?? '';
  const tamam = Boolean(gb) && sha(gb) === s.sha256 && tur.startsWith(s.tur);
  return { s, dur: r.ok ? 'YAZILDI' : 'ZATEN VAR', tamam };
}
let yazilan = 0;
let zatenVar = 0;
const kuyruk = [...hazir];
await Promise.all(
  Array.from({ length: 6 }, async () => {
    for (let s = kuyruk.shift(); s; s = kuyruk.shift()) {
      const sonuc = await yukle(s);
      if (!sonuc.tamam) {
        console.log(`KIRMIZI ${sonuc.dur}: ${s.anahtar}`);
        hata++;
      } else if (sonuc.dur === 'YAZILDI') yazilan++;
      else zatenVar++;
    }
  }),
);
console.log(
  hata
    ? `KIRMIZI: ${hata} hata (yazilan ${yazilan}, zaten var ${zatenVar})`
    : `TAMAM: ${hazir.length}/${hazir.length} geri okuma sha256 tutuyor (yazilan ${yazilan}, zaten var ${zatenVar}); kok adres ${url}/storage/v1/object/public/${KOVA}`,
);
process.exit(hata ? 1 : 0);
