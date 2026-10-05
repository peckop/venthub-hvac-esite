import NotFoundView from '../views/NotFoundView'

/**
 * Uygulamanın tek 404 sınırı: eşleşmeyen adresler + `[lang]` altındaki `notFound()` çağrıları.
 * `<title>` ÇİZMEZ (bkz. NotFoundView notu) — sayfada tek başlık kalır. Kapı:
 * src/views/__tests__/NotFoundView.test.tsx.
 */
export default function NotFound() {
  return <NotFoundView />
}
