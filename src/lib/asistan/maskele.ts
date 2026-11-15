/**
 * ÜRÜN ASİSTANI — MODELE GİTMEDEN ÖNCE KİŞİSEL VERİ MASKELEME (URN-171, adım 1).
 *
 * Cetvel: docs/plans/urun-asistani-kapsam-guvenlik-notu-2026-11-15.md §4 madde 10 (KVKK).
 *
 * Kullanıcının serbest metni ad, telefon ya da e-posta içerebilir ve her istekte yurt dışındaki işleyiciye
 * (model sağlayıcısı) gider: kayıt tutulmasa bile bu bir aktarımdır. Bu işlev, metin modele verilmeden önce
 * DETERMİNİSTİK olarak şunları yer tutucuyla değiştirir: e-posta, Türkiye telefon numaraları (+90 / 0090 / 0 ile,
 * boşluklu, tireli, noktalı, parantezli; cep ve sabit hat) ve 11 haneli TC kimlik no benzeri sayılar.
 *
 * ÜRÜN DEĞERLERİNE DOKUNMAZ: "2000 m³/h", "125 mm", "IP55", "380 V", "2,2 kW", "94/9/CE" maskelenmez (testle gösterilir).
 * Telefon deseni ONLU YAPI ister (alan kodu + 3 + 2 + 2 hane); araya yalnız tek boşluk, nokta ya da tire girebilir.
 *
 * KAPSAM DIŞI (bilinçli): ad ve firma adı. Bunlar deterministik kalıpla güvenilir yakalanamaz; yanlış güvenlik
 * hissi vermemek için bu işlev onları yakaladığını İDDİA ETMEZ. Aydınlatma metni ve hukuki değerlendirme MEVZUAT
 * işidir. IBAN ve adres de kapsam dışıdır. Yer tutucular modele giden ASCII belirteçlerdir, kullanıcıya gösterilmez.
 */

export type MaskeSayilari = Readonly<{ eposta: number; telefon: number; kimlikNo: number }>
export type MaskeSonucu = Readonly<{ metin: string; maskelenen: MaskeSayilari }>

export const EPOSTA_YER_TUTUCU = '[EPOSTA]'
export const TELEFON_YER_TUTUCU = '[TELEFON]'
export const KIMLIK_NO_YER_TUTUCU = '[KIMLIK_NO]'

const TR_HARF = 'A-Za-z0-9ÇĞİÖŞÜçğıöşüÂâÎîÛû'
/** yerel kısım @ alan adı (en az bir nokta, son parça en az 2 harf). */
const EPOSTA_DESENI = new RegExp(`[${TR_HARF}._%+-]+@[${TR_HARF}-]+(?:\\.[${TR_HARF}-]+)*\\.[A-Za-zÇĞİÖŞÜçğıöşü]{2,}`, 'g')
/**
 * (başlangıç ya da rakam olmayan karakter) + [+90 / 0090 öneki] + [0] + 3 haneli alan kodu (2-5 ile başlar) + 3 + 2 + 2 hane.
 * Önceki karakter eşleşmeye alınıp geri yazılır: arama-geri-bakışı kullanılmaz (eski hedeflerde derleme hatası verir).
 */
const TELEFON_DESENI =
  /(^|[^\d])((?:(?:\+|00)\s?90[\s.-]?)?\(?(?:0[\s.-]?)?\(?[2-5]\d{2}\)?[\s.-]?\d{3}[\s.-]?\d{2}[\s.-]?\d{2})(?!\d)/g
/** Başı sıfır olmayan, öncesi ve sonrası rakam olmayan 11 hane (TC kimlik no biçimi; sağlama toplamı DENETLENMEZ: benzeri de maskelenir). */
const KIMLIK_NO_DESENI = /(^|[^\d])([1-9]\d{10})(?!\d)/g

/** Metindeki kişisel veri kalıplarını yer tutucuyla değiştirir; hangi türden kaç kalıp değiştiği `maskelenen`de döner. */
export function maskele(metin: string): MaskeSonucu {
  let eposta = 0
  let telefon = 0
  let kimlikNo = 0
  const adim1 = metin.replace(EPOSTA_DESENI, () => {
    eposta++
    return EPOSTA_YER_TUTUCU
  })
  const adim2 = adim1.replace(TELEFON_DESENI, (_tam, onceki: string) => {
    telefon++
    return `${onceki}${TELEFON_YER_TUTUCU}`
  })
  const adim3 = adim2.replace(KIMLIK_NO_DESENI, (_tam, onceki: string) => {
    kimlikNo++
    return `${onceki}${KIMLIK_NO_YER_TUTUCU}`
  })
  return { metin: adim3, maskelenen: { eposta, telefon, kimlikNo } }
}
