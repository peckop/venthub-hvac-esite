import Link from 'next/link'

// ALT-114 SABOTAJ (geçici dal, birleşmez): hiçbir rota desenine uymayan 12 parçalı yol. typegen sonrası Type check KIRMIZI olmalı.
export function SabotajHrefAlt113() {
  return <Link href="/a/b/c/d/e/f/g/h/i/j/k/l/alt113-sabotaj">sabotaj</Link>
}
