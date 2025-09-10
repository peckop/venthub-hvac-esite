export async function sha1Hex(input: string): Promise<string> {
  const enc = new TextEncoder()
  const data = enc.encode(input)
  const hashBuf = await crypto.subtle.digest('SHA-1', data)
  const hashArray = Array.from(new Uint8Array(hashBuf))
  const hashHex = hashArray.map(b => b.toString(16).padStart(2, '0')).join('')
  return hashHex.toUpperCase()
}

/**
 * HIBP k-Anonymity kontrolü. Parola düz metin gönderilmez; ilk 5 hex prefix kullanılır.
 * Dönüş: sızıntı eşleşme sayısı (>=0). Ağ/CORS hatasında -1 döner.
 */
export async function hibpPwnedCount(password: string): Promise<number> {
  try {
    const hash = await sha1Hex(password)
    const prefix = hash.slice(0, 5)
    const suffix = hash.slice(5)
    const resp = await fetch(`https://api.pwnedpasswords.com/range/${prefix}`, {
      method: 'GET',
      headers: { 'Add-Padding': 'true' },
    })
    if (!resp.ok) return -1
    const text = await resp.text()
    const lines = text.split('\n')
    for (const line of lines) {
      const [suf, countStr] = line.trim().split(':')
      if (!suf) continue
      if (suf.toUpperCase() === suffix) {
        const n = parseInt(countStr || '0', 10)
        return Number.isFinite(n) ? n : 0
      }
    }
    return 0
  } catch {
    return -1
  }
}

