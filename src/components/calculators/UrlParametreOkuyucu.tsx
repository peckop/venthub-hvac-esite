'use client'
import { useSearchParams } from 'next/navigation'
import React from 'react'

/**
 * URL SORGU PARAMETRELERİNİ OKUYAN UÇ BİLEŞEN (REC-150 PR-0, 2026-09-05).
 *
 * NİÇİN VAR — ÖLÇÜLMÜŞ CANLI KUSUR, hipotez değil:
 * `useSearchParams()` çağıran bir bileşen, Suspense sınırının ARKASINDA kalır ve o sınırın
 * kapsadığı ağaç sunucuda HİÇ render edilmez (CSR bailout). Bu depoda iki hesaplayıcı
 * rotası (`hrv`, `hava-perdesi`) Suspense'i **sayfanın tamamına** sarıyordu, dolayısıyla
 * bailout tüm sayfayı kapsıyordu.
 *
 * Bedeli canlıda ölçüldü (2026-09-05, `venthub.com.tr`):
 *   · `hesaplayicilar/hrv`   → sunucudan gelen görünür kelime **0**, `<h1>` **0**, 238 KB kabuk
 *   · `hesaplayicilar/kanal` → görünür kelime **422**, `<h1>` **1**, 254 KB
 * Üstelik bailout olan sayfalar kendi `<meta name="description">` değerlerini de
 * kaybediyor, yerine sitenin jenerik açıklaması çıkıyordu. Yani o iki sayfa arama
 * motoruna **içeriksiz** görünüyordu.
 *
 * ÇÖZÜM — SINIRI AŞAĞI İNDİRMEK: CLAUDE.md kural 5 "useSearchParams kullanan bileşen
 * Suspense ile sarılır" diyor. Lafız sağlanıyordu ama sarılan şey SAYFAYDI. Bu bileşen
 * o kuralın ruhudur: parametreyi okuyan **tek uç** burasıdır, Suspense yalnız BUNU sarar,
 * sayfanın geri kalanı sunucuda render edilmeye devam eder.
 *
 * ⚠HİÇBİR ŞEY ÇİZMEZ (`return null`) — bailout'un bedeli görünmez bir düğüme indirgenir.
 *
 * ⭐YETENEK KORUNUR: bu hesaplayıcılar girdileri URL'e yazıyor (`router.replace`), yani
 * "hesabımı paylaş" özelliği var. `useSearchParams`'ı tümden kaldırmak o özelliği
 * ÖLDÜRÜRDÜ — canlıdan yetenek düşüren bir düzeltme, düzeltme değildir. Burada okuma
 * korunur, yalnız KONUMU değişir: render sırasında değil, bağlanmadan sonra bir kez.
 *
 * ⚠ÇAĞIRANIN SORUMLULUĞU — SESSİZ VERİ KAYBI TEHLİKESİ: çağıran, URL'e geri yazan
 * effect'ini `onOku` çalışana kadar BEKLETMELİDİR. Aksi hâlde bileşen bağlandığı anda
 * varsayılan değerler URL'e yazılır ve gelen paylaşım bağlantısı OKUNMADAN silinir.
 * Bu, hiçbir testin görmediği türden bir kayıptır; `hazir` bayrağı bu yüzden vardır.
 */
export interface UrlParametreOkuyucuProps {
  /** Bağlanmadan sonra BİR KEZ çağrılır. Boş sorgu da geçerli bir cevaptır. */
  onOku: (parametreler: URLSearchParams) => void
}

const UrlParametreOkuyucu: React.FC<UrlParametreOkuyucuProps> = ({ onOku }) => {
  const searchParams = useSearchParams()
  const okundu = React.useRef(false)

  React.useEffect(() => {
    // BİR KEZ: `searchParams` kimliği geri-yazma sonrası değişir; koruma olmadan
    // kullanıcının girdiği değerler URL'den gelen ilk değerlerle sürekli ezilirdi.
    if (okundu.current) return
    okundu.current = true
    onOku(new URLSearchParams(searchParams?.toString() ?? ''))
  }, [searchParams, onOku])

  return null
}

export default UrlParametreOkuyucu
