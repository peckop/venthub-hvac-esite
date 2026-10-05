import veri from '@/config/rotaDili.veri.json'
import {
  adresDiliOku,
  rotaDiliCevir,
  rotaDiliTablosuDogrula,
  rotaDiliYolu,
} from '@/config/rotaDiliCekirdek.mjs'

/**
 * ROTA DİLİ — TS erişimcisi (OPS-52 PR-C0). Middleware (Edge) ve istemci tarafı (`routes.ts`) için.
 *
 * NİÇİN BU DOSYA: `config/rotaDili.mjs` tabloyu `node:fs` ile okur; Edge ve tarayıcı onu yükleyemez.
 * Burada tablo `rotaDili.veri.json`'dan JSON içe aktarımıyla gelir (derleyici gömer, diske dokunulmaz) ve
 * mantık FS'siz çekirdekten (`rotaDiliCekirdek.mjs`) çağrılır. Tek veri kaynağı değişmez: ikisi de aynı
 * JSON'u okur (test: rotaDiliCekirdek.test.ts, derin eşitlik).
 *
 * ANAHTAR: `process.env.NEXT_PUBLIC_ADRES_DILI` LİTERAL yazılır; Next derlemede bu ifadeyi değerle değiştirir
 * (dinamik `process.env[ad]` erişimi istemci paketinde boş kalırdı). Yalnız tam `1` açar; yok/bozuk = kapalı.
 *
 * ⛔BU PR'DA HİÇBİR ÜRETİM DOSYASINA BAĞLI DEĞİL (routes.ts / middleware.ts sonraki PR'larda). Canlıya etkisi sıfır.
 */

type Dil = 'tr' | 'en'

/** Yüklemede doğrulanmış tablo; bozuksa modül yüklenirken ATAR (sessiz yutma yok). */
export const ROTA_DILI_TABLO = rotaDiliTablosuDogrula(veri)

/** Rota dili anahtarı (derleme anında sabitlenir). */
export const ADRES_DILI_ACIK: boolean = adresDiliOku(process.env.NEXT_PUBLIC_ADRES_DILI)

/**
 * Dilsiz klasör yolunu `dil`'deki görünen yola çevirir; sorgu/parça korunur. Anahtar kapalıysa ya da
 * eşleşme yoksa girdiyi aynen döndürür.
 */
export function rotaDiliYoluOku(url: string, dil: Dil): string {
  return rotaDiliYolu(url, dil, ROTA_DILI_TABLO, ADRES_DILI_ACIK)
}

/**
 * Dil değiştirirken: `eskiDil`'de görünen dilsiz yolu `yeniDil`'deki görünen yola çevirir. Anahtar kapalıysa
 * ya da eşleşme yoksa girdiyi aynen döndürür.
 */
export function rotaDiliCevirOku(yol: string, eskiDil: Dil, yeniDil: Dil): string {
  return rotaDiliCevir(yol, eskiDil, yeniDil, ROTA_DILI_TABLO, ADRES_DILI_ACIK)
}
