#!/usr/bin/env node
/**
 * ALT-188 — geçici salt-okunur giriş rolü (Supabase Yönetim API'si, `supabase db dump`un kullandığı yol).
 *
 * Neden ayrı dosya: `canli-db-yedek.cjs` eşzamanlı (spawnSync) çalışır; HTTP isteği zaman uyumsuzdur. Bu betik
 * çocuk süreç olarak koşar, çıktısını (JSON: role, password, ttl_seconds) YALNIZ üst sürecin borusuna yazar;
 * üst süreç parolayı hiçbir yere yazmaz, günlük süzgecine ekler.
 *
 * Girdi (ortam): SUPABASE_ACCESS_TOKEN (kişisel erişim belirteci, yalnız process.env), CANLI_YEDEK_PROJE_REF.
 * Veritabanı parolasını SIFIRLAMAZ, tahmin etmez; yalnız `POST /v1/projects/{ref}/cli/login-role` (read_only) çağırır.
 * Çıkış kodları: 0 tamam · 1 hata · 3 ölçülemedi (belirteç/ref yok).
 */
'use strict'
const https = require('https')

const ref = process.env.CANLI_YEDEK_PROJE_REF || ''
const token = process.env.SUPABASE_ACCESS_TOKEN || ''
if (!/^[a-z0-9]{20}$/.test(ref)) {
  console.error('CANLI_YEDEK_PROJE_REF eksik ya da biçimi geçersiz (20 karakter küçük harf/rakam)')
  process.exit(3)
}
if (!token) {
  console.error('SUPABASE_ACCESS_TOKEN tanımlı değil: ölçülemedi')
  process.exit(3)
}
// Salt-okunur rol `auth`/`storage`/`vault` şemalarına erişemez (ölçüldü 15 Kasım 2026: "permission denied for schema auth";
// kullanılabilir şema yalnız net, public). Varsayılan `cli_login_postgres` (supabase CLI'nin kendi yolu; `postgres` rolüne
// SET ROLE ile tüm şemalara erişir, ölçüldü). pg_dump zaten READ ONLY işlemde koşar. Daraltmak için CANLI_YEDEK_ROL=salt-okunur.
const govde = JSON.stringify({ read_only: process.env.CANLI_YEDEK_ROL === 'salt-okunur' })
const istek = https.request(
  {
    method: 'POST',
    host: process.env.CANLI_YEDEK_API_HOST || 'api.supabase.com',
    path: `/v1/projects/${ref}/cli/login-role`,
    headers: { Authorization: `Bearer ${token}`, 'Content-Type': 'application/json', 'Content-Length': Buffer.byteLength(govde) },
    timeout: 30000,
  },
  (yanit) => {
    let s = ''
    yanit.on('data', (d) => (s += d))
    yanit.on('end', () => {
      if (yanit.statusCode !== 201 && yanit.statusCode !== 200) {
        console.error(`giriş rolü alınamadı: HTTP ${yanit.statusCode}`)
        process.exit(1)
      }
      try {
        const j = JSON.parse(s)
        if (typeof j.role !== 'string' || typeof j.password !== 'string' || !j.role || !j.password) throw new Error('alanlar eksik')
        process.stdout.write(JSON.stringify({ role: j.role, password: j.password, ttl_seconds: j.ttl_seconds }))
      } catch {
        console.error('giriş rolü yanıtı çözümlenemedi (içerik güvenlik için gösterilmez)')
        process.exit(1)
      }
    })
  },
)
istek.on('timeout', () => {
  istek.destroy()
  console.error('giriş rolü isteği zaman aşımına uğradı')
  process.exit(1)
})
istek.on('error', (e) => {
  console.error(`giriş rolü isteği ağ hatası: ${e.code || 'bilinmiyor'}`)
  process.exit(1)
})
istek.write(govde)
istek.end()
