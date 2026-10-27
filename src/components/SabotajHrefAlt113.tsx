import Link from 'next/link'

// ALT-113 SABOTAJ (geçici dal, birleşmez): olmayan bir rota. typedRoutes açıkken `next build`in tip aşaması bunu reddetmeli;
// soru: ci'nin Build'den ÖNCEKİ `Type check` adımı da reddediyor mu?
export function SabotajHrefAlt113() {
  return <Link href="/bu-rota-yok-alt113-sabotaj">sabotaj</Link>
}
