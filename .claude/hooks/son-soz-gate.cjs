#!/usr/bin/env node
// son-soz-gate — Stop kapısı (2026-08-26, Recep'in 10+ kez tekrarlanan şikâyeti üzerine)
//
// KURAL: Turda gerçek bir KULLANICI mesajı varsa, tur SON SÖZ KULLANICIYA yazılmış bir
// metin bloğuyla bitmek ZORUNDADIR — araç çağrısıyla değil. Cevabın araç çıktıları
// arasına gömülmesi ("satır arası not") bu kapıyla mekanik olarak imkânsızlaşır.
// Not bir mekanizma değildir; bu dosya o notun mekanizmasıdır.
const fs = require('fs');

let raw = '';
process.stdin.on('data', (c) => { raw += c; });
process.stdin.on('end', () => {
  let input;
  try { input = JSON.parse(raw); } catch { process.exit(0); }
  if (input.stop_hook_active) process.exit(0); // döngü koruması: kapı zaten devrede
  const tp = input.transcript_path;
  if (!tp || !fs.existsSync(tp)) process.exit(0);

  // Transkriptin kuyruğunu oku (son ~400 satır yeter: bir turun içi)
  const satirlar = fs.readFileSync(tp, 'utf8').trim().split('\n').slice(-400);
  const kayitlar = [];
  for (const s of satirlar) { try { kayitlar.push(JSON.parse(s)); } catch { /* yut */ } }

  const insanMesaji = (k) => {
    if (k.type !== 'user' || k.isMeta) return false;
    const c = k.message && k.message.content;
    if (typeof c === 'string') return !c.startsWith('<local-command-caveat>') && !c.includes('[SYSTEM NOTIFICATION');
    if (Array.isArray(c)) return c.some((b) => b.type === 'text') && !c.some((b) => b.type === 'tool_result');
    return false;
  };

  // Son insan mesajının konumu; yoksa (salt bildirim/cron turu) kapı karışmaz.
  let sonInsan = -1;
  kayitlar.forEach((k, i) => { if (insanMesaji(k)) sonInsan = i; });
  if (sonInsan === -1) process.exit(0);

  // Son insan mesajından SONRAKİ son asistan kaydını bul.
  let sonAsistan = null;
  for (let i = kayitlar.length - 1; i > sonInsan; i--) {
    if (kayitlar[i].type === 'assistant') { sonAsistan = kayitlar[i]; break; }
  }
  if (!sonAsistan) process.exit(0); // hiç asistan çıkışı yok — karışma (harness zaten üretir)

  const icerik = (sonAsistan.message && sonAsistan.message.content) || [];
  const sonBlok = Array.isArray(icerik) ? icerik[icerik.length - 1] : null;
  const metinle_bitti = sonBlok && sonBlok.type === 'text' && String(sonBlok.text || '').trim().length >= 50;

  if (!metinle_bitti) {
    console.error(
      '[son-soz-gate] KIRMIZI — turda kullanıcı mesajı var ama tur ona yazılmış metinle ' +
      'BİTMİYOR (son blok: ' + (sonBlok ? sonBlok.type : 'yok') + '). Kural: SON SÖZ ' +
      'KULLANICIYA. Şimdi, bu turdaki kullanıcı mesajlarını numaralayıp birebir kapatan, ' +
      'kendi başına eksiksiz bir kapanış cevabı yaz ve turu öyle bitir.'
    );
    process.exit(2); // Stop'u blokla → ajan devam edip cevabı yazmak zorunda
  }
  process.exit(0);
});
