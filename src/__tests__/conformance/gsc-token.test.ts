/**
 * INV-GSC-TOKEN-1: Search Console hizmet hesabı jetonu — imza doğru, kapsam salt okuma, anahtar depo dışında.
 * (2026-09-23: OAuth "Testing" kipindeki yenileme jetonu 7 günde düştü → kalıcı yol hizmet hesabı.)
 */
import crypto from 'node:crypto'
import { createRequire } from 'node:module'
import path from 'node:path'

import { describe, expect, it } from 'vitest'

const require = createRequire(import.meta.url)
const { jwtOlustur, depoIcindeMi, KAPSAM } = require('../../../scripts/gsc/gsc-token.cjs') as {
  jwtOlustur: (a: { client_email: string; private_key: string }, sn?: number) => string
  depoIcindeMi: (f: string) => boolean
  KAPSAM: string
}

describe('INV-GSC-TOKEN-1', () => {
  const { privateKey, publicKey } = crypto.generateKeyPairSync('rsa', { modulusLength: 2048 })
  const anahtar = { client_email: 'gsc@deneme.iam.gserviceaccount.com', private_key: privateKey.export({ type: 'pkcs8', format: 'pem' }).toString() }

  it('RS256 imzası açık anahtarla doğrulanır; iss/aud/exp doğru; kapsam SALT OKUMA', () => {
    const jwt = jwtOlustur(anahtar, 1_000_000)
    const [bas, govde, imza] = jwt.split('.')
    const gecerli = crypto.createVerify('RSA-SHA256').update(`${bas}.${govde}`).verify(publicKey, Buffer.from(imza, 'base64url'))
    expect(gecerli).toBe(true)
    const g = JSON.parse(Buffer.from(govde, 'base64url').toString())
    expect(g).toMatchObject({ iss: anahtar.client_email, aud: 'https://oauth2.googleapis.com/token', iat: 1_000_000, exp: 1_003_600 })
    expect(KAPSAM).toBe('https://www.googleapis.com/auth/webmasters.readonly')
    // sabotaj: gövde değişirse imza tutmaz
    expect(crypto.createVerify('RSA-SHA256').update(`${bas}.${govde}x`).verify(publicKey, Buffer.from(imza, 'base64url'))).toBe(false)
  })

  it('hizmet hesabı olmayan JSON reddedilir; depo içindeki anahtar dosyası reddedilir', () => {
    expect(() => jwtOlustur({ client_email: '', private_key: '' })).toThrow(/hizmet hesabi/)
    expect(depoIcindeMi(path.resolve(__dirname, 'anahtar.json'))).toBe(true)
  })
})
