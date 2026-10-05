/**
 * IndexNow anahtarı (REC-405).
 *
 * ⚠BU BİR SIR DEĞİL. IndexNow protokolü anahtarın sahipliğini, sitenin kökünde herkese açık
 * duran `https://<site>/<anahtar>.txt` dosyasıyla kanıtlatır; yani anahtar tasarımı gereği
 * kamuya açıktır ve her bildirimde `keyLocation` ile birlikte düz metin gönderilir. Bu yüzden
 * depoda (public repo) durmasının hiçbir sızıntı etkisi yoktur — sır taraması onu yakalarsa
 * yanlış alarm olarak kapatılır.
 *
 * NİÇİN ORTAM DEĞİŞKENİ DEĞİL DE SABİT: doğrulama dosyası `public/<anahtar>.txt` depoda
 * duruyor; anahtar başka bir yerde (Vercel ortamı) yaşarsa ikisi sessizce ayrışabilir ve
 * IndexNow 403 döner. Aynı değer tek yerde, dosya ile birlikte, kapı altında
 * (INV-INDEXNOW-1: dosya adı ve içeriği birebir bu sabit). `INDEXNOW_KEY` ortam değişkeni
 * yalnız geçersiz kılma içindir; tanımlıysa onun da dosyası yayında olmalıdır.
 *
 * YAYIN KOŞULU (Recep kararı K4, 2026-09-03): "Bing'i değişecek adreslerle beslemeyelim."
 * Anahtar artık var, ama K3-b adres şeması (`ADRES_SEMASI_K3B`) açılana kadar değişecek
 * adresler (ürün/kategori/marka) bildirimden SÜZÜLÜR — süzgeç `src/lib/seo/indexnow.ts`.
 *
 * DEĞİŞTİRME: yeni anahtar üretilirse `public/<eski>.txt` silinir, `public/<yeni>.txt`
 * satır sonu OLMADAN yazılır; kapı ikisini birlikte ölçer.
 */
export const INDEXNOW_ANAHTARI = 'e4468e39c3131f38c51ffc73fab38c99'
