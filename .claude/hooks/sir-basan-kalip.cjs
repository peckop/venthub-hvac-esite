/**
 * sir-basan-kalip — bir Bash komutunun SIR DEĞERİNİ EKRANA BASIP BASMADIĞINI ölçer.
 *
 * NİÇİN VAR (olay: 2026-09-04, ALTYAPI — kendi hatam):
 * Nöbetçinin fail-closed yolunu ölçerken "bu env tanımlı mı" diye şunu yazdım:
 *     ${VAR:+VAR (uzunluk ${#VAR})}${VAR:-YOK}
 * İkinci yarı, değişken DOLU olduğunda "YOK" basmaz — DEĞERİN KENDİSİNİ basar. Yani
 * boş/dolu ölçmek isterken prod veritabanı bağlantı dizesinin tamamı (parola dahil)
 * komut çıktısına ve oturum transkriptine düştü. Repo'ya yazılmadı, commit'lenmedi;
 * ama yerel transkriptte durdu. OPS ölçtü: benim oturumumda 2, iki ESKİ oturumda 37
 * eşleşme — yani sınıf bugünden eski, tek seferlik bir dikkatsizlik değil.
 * Recep kararı: parola döndürülmedi (kendi makinesi, kabul edilen risk), yerel
 * transkriptler temizlendi. Kapı bu yüzden var: bir daha olmasın.
 *
 * ⭐AYIRT EDİCİ OLAN, DEĞİŞKENİN ADI DEĞİL KULLANIM BİÇİMİ. Aynı değişken güvenli de
 * kullanılır, tehlikeli de:
 *     GÜVENLİ:  [ -z "${SIR:-}" ]        (boş varsayılan — değer basılmaz)
 *     GÜVENLİ:  ${#SIR}                  (yalnız uzunluk)
 *     GÜVENLİ:  ${SIR:+VAR}              (yalnız varlık bildirir)
 *     TEHLİKELİ: ${SIR:-YOK}             (dolu ise DEĞERİ basar — olayın kendisi)
 *     TEHLİKELİ: echo "$SIR"             (doğrudan basar)
 * Bu yüzden kapı adı değil KALIBI ölçer; yoksa "sır adı geçiyor" diye her satırı
 * reddeden, kısa sürede kapatılan bir bekçi olurdu.
 */
'use strict'

/**
 * Sır TAŞIYAN değişken adı desenleri.
 *
 * `NEXT_PUBLIC_` ön eki MUAF: tanımı gereği istemci paketine gömülür ve tarayıcıdan
 * okunabilir (ölçüldü 2026-09-04: anon key prod bundle'ında açık). Onu basmak yeni bir
 * sızıntı üretmez; muafiyet olmasa kapı meşru komutları reddederdi.
 */
const SIR_ADI = /\b((?!NEXT_PUBLIC_)[A-Z0-9_]*(SECRET|TOKEN|PASSWORD|PASSWD|API_KEY|ANON_KEY|SERVICE_ROLE|DB_URL|DATABASE_URL|CONNECTION_STRING)[A-Z0-9_]*)\b/

/** Bir değişken adı sır taşıyor mu? */
function sirMi(ad) {
  return SIR_ADI.test(ad)
}

/**
 * Komuttaki tehlikeli kalıpları döndürür.
 *
 * ÇIKTI: `[{ kalip, ad, neden }]` — boş dizi = temiz.
 */
function sirBasanKaliplar(komut) {
  const metin = String(komut || '')
  const bulgular = []

  /**
   * 1) `${AD:-varsayilan}` / `${AD-varsayilan}` — varsayılan BOŞ DEĞİLSE tehlikeli.
   *
   * Olayın kendisi bu kalıptı. `${AD:-}` (boş varsayılan) yaygın ve GÜVENLİ bir
   * "tanımsızsa boş say" deyimidir; onu reddetmek kapıyı kullanılmaz yapardı.
   */
  const varsayilan = /\$\{([A-Za-z_][A-Za-z0-9_]*)(:?-)([^}]*)\}/g
  let m
  while ((m = varsayilan.exec(metin)) !== null) {
    const [tam, ad, , deger] = m
    if (!sirMi(ad)) continue
    if (deger.trim() === '') continue // ${AD:-} → güvenli
    bulgular.push({
      kalip: tam,
      ad,
      neden:
        'varsayilan-deger kalibi: degisken DOLU oldugunda varsayilan DEGIL DEGERIN KENDISI basilir. ' +
        'Bos/dolu olcmek icin ${#' + ad + '} (uzunluk) ya da [ -z "${' + ad + ':-}" ] kullan.',
    })
  }

  /**
   * 2) `echo`/`printf` ile doğrudan basma: `$AD` ya da `${AD}`.
   *
   * `${#AD}` bilinçli olarak dışarıda: uzunluk basmak ölçüm için meşru ve sır sızdırmaz.
   */
  const basma = /\b(echo|printf)\b[^\n;|&]*/g
  while ((m = basma.exec(metin)) !== null) {
    const parca = m[0]
    const ref = /\$\{?([A-Za-z_][A-Za-z0-9_]*)\}?/g
    let r
    while ((r = ref.exec(parca)) !== null) {
      const ad = r[1]
      if (!sirMi(ad)) continue
      /**
       * ⭐GÜVENLİ BİÇİMLER MUAF — bu kapı ilk koşumunda kendi testini yanlış yakaladı.
       *
       * Ölçüldü (kapıyı yazdıktan hemen sonra): `echo "${SIR:+VAR}"` vakası TEHLİKELİ
       * sayıldı, oysa `:+` yalnız "tanımlı mı" bilgisini basar, değeri basmaz. Sebep,
       * `echo` taramasının süslü parantez İÇİNDEKİ biçimi hiç ayırt etmemesiydi — ad
       * eşleşiyor diye bulgu yazıyordu. Bir kapının ilk işi, meşru kullanımı serbest
       * bırakmaktır; yoksa kısa sürede kapatılır ve hiçbir şey ölçmez.
       *
       * Muaf biçimler: `${#AD}` (uzunluk) ve `${AD:+...}` / `${AD+...}` (varlık) —
       * ikincisinde varsayılan metnin İÇİNDE `$AD` geçiyorsa muafiyet DÜŞER, çünkü o
       * hâlde değer yine basılır.
       */
      if (parca.includes('${#' + ad + '}')) continue
      const varlikKalibi = new RegExp('\\$\\{' + ad + ':?\\+([^}]*)\\}')
      const vm = parca.match(varlikKalibi)
      if (vm && !new RegExp('\\$\\{?' + ad + '\\b').test(vm[1])) continue
      bulgular.push({
        kalip: parca.trim().slice(0, 120),
        ad,
        neden:
          'sir degiskeni dogrudan basiliyor. Olcum gerekiyorsa DEGERI degil OLGUYU bas: ' +
          '${#' + ad + '} (uzunluk) ya da "tanimli/tanimsiz" bilgisi.',
      })
    }
  }

  return bulgular
}

module.exports = { sirBasanKaliplar, sirMi, SIR_ADI }
