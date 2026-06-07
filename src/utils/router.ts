import { NextRequest, NextResponse } from 'next/server'

const AES_ALGORITHM = 'AES-GCM'

/**
 * Derives a cryptographic AES key from a string secret using SHA-256.
 * Edge-compatible Web Crypto API wrapper.
 */
async function getCryptoKey(secret: string): Promise<CryptoKey> {
  const encoder = new TextEncoder()
  const secretBytes = encoder.encode(secret)
  
  // Deterministically hash the secret to get a 256-bit value
  const hash = await crypto.subtle.digest('SHA-256', secretBytes)
  
  return crypto.subtle.importKey(
    'raw',
    hash,
    { name: AES_ALGORITHM },
    false,
    ['encrypt', 'decrypt']
  )
}

/**
 * Encrypts a claims object using AES-GCM.
 * Combines 12-byte IV with ciphertext and encodes to Base64URL.
 */
export async function encryptClaims(claims: Record<string, unknown>, secret: string): Promise<string> {
  const key = await getCryptoKey(secret)
  const encoder = new TextEncoder()
  const dataBytes = encoder.encode(JSON.stringify(claims))
  
  // Generate a random 12-byte Initialization Vector (standard for AES-GCM)
  const iv = crypto.getRandomValues(new Uint8Array(12))
  
  const encryptedBuffer = await crypto.subtle.encrypt(
    { name: AES_ALGORITHM, iv },
    key,
    dataBytes
  )
  
  // Combine IV and ciphertext into a single byte array
  const combined = new Uint8Array(iv.length + encryptedBuffer.byteLength)
  combined.set(iv)
  combined.set(new Uint8Array(encryptedBuffer), iv.length)
  
  // Convert to Base64URL
  return btoa(String.fromCharCode(...combined))
    .replace(/=/g, '')
    .replace(/\+/g, '-')
    .replace(/\//g, '_')
}

/**
 * Decrypts a Base64URL encoded AES-GCM token into a claims object.
 * Returns null if decryption fails (e.g. invalid signature, tampering, or expired/changed secret).
 */
export async function decryptClaims(cookieValue: string, secret: string): Promise<Record<string, unknown> | null> {
  try {
    const key = await getCryptoKey(secret)
    
    // Decode Base64URL to Uint8Array
    let base64 = cookieValue.replace(/-/g, '+').replace(/_/g, '/')
    while (base64.length % 4) {
      base64 += '='
    }
    const binary = atob(base64)
    const bytes = new Uint8Array(binary.length)
    for (let i = 0; i < binary.length; i++) {
      bytes[i] = binary.charCodeAt(i)
    }
    
    if (bytes.length < 12) {
      return null
    }
    
    // Extract IV (first 12 bytes) and ciphertext
    const iv = bytes.slice(0, 12)
    const encryptedData = bytes.slice(12)
    
    const decryptedBuffer = await crypto.subtle.decrypt(
      { name: AES_ALGORITHM, iv },
      key,
      encryptedData
    )
    
    const decryptedStr = new TextDecoder().decode(decryptedBuffer)
    return JSON.parse(decryptedStr) as Record<string, unknown>
  } catch (error) {
    console.error('[Router] Claims cache decryption failed:', error)
    return null
  }
}

/**
 * Scopes claims validation: returns cached claims if valid, otherwise queries Supabase client
 * and updates the cache cookie in the response.
 */
export async function resolveUserClaims(
  request: NextRequest,
  response: NextResponse,
  supabase: { auth: { getClaims: () => Promise<{ data: { claims: Record<string, unknown> | null } | null; error: unknown }> } },
  secret: string
): Promise<{ claims: Record<string, unknown> | null; error: unknown; source: 'cache' | 'client' }> {
  // 1. Attempt Cache Lookup
  const cachedCookie = request.cookies.get('sb-claims-cache')?.value
  if (cachedCookie) {
    const claims = await decryptClaims(cachedCookie, secret)
    if (claims && claims.user_role) {
      return { claims, error: null, source: 'cache' }
    }
  }

  // 2. Cache Miss: Retrieve via Supabase Client
  try {
    const { data, error } = await supabase.auth.getClaims()
    if (error || !data?.claims) {
      return { claims: null, error: error || new Error('No claims found'), source: 'client' }
    }
    
    const claims = data.claims
    
    // 3. Encrypt and set cache cookie (expiring in 15 minutes to balance freshness and security)
    const encrypted = await encryptClaims(claims, secret)
    setClaimsCacheCookie(response, encrypted, 900)
    
    return { claims, error: null, source: 'client' }
  } catch (err) {
    return { claims: null, error: err, source: 'client' }
  }
}

/**
 * Sets a cryptographically secure HTTP-only cache cookie.
 */
export function setClaimsCacheCookie(
  response: NextResponse,
  cookieValue: string,
  maxAgeSeconds: number = 900 // Default to 15 minutes
) {
  response.cookies.set('sb-claims-cache', cookieValue, {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'lax',
    path: '/',
    maxAge: maxAgeSeconds,
  })
}

/**
 * Clears the claims cache cookie. Must be called on logouts.
 */
export function clearClaimsCacheCookie(response: NextResponse) {
  response.cookies.set('sb-claims-cache', '', {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'lax',
    path: '/',
    maxAge: 0, // Deletes cookie immediately
  })
}

/**
 * Creates a redirect response that copies all headers and cookies from an existing response.
 * This prevents auth or tenant cookie deletion when performing redirects in middleware.
 */
export function createRedirectResponse(
  request: NextRequest,
  targetUrl: string | URL,
  responseToCopyFrom: NextResponse,
  status: number = 302
): NextResponse {
  const redirectRes = NextResponse.redirect(targetUrl, status)
  
  // Copy all cookies
  responseToCopyFrom.cookies.getAll().forEach(({ name, value, ...options }) => {
    redirectRes.cookies.set(name, value, options)
  })
  
  // Copy all headers
  responseToCopyFrom.headers.forEach((value, key) => {
    redirectRes.headers.set(key, value)
  })
  
  return redirectRes
}
