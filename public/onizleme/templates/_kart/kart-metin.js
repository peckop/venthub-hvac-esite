/* Kart önizlemesi için metin yükleyici (ds-kural-metin 10-24). Parça değil; yalnız @dsCard kartları yükler. templates/_kart/ altında durur ki _ds_bundle.js'e girmesin.
 * window.KART_DIL ('TR' | 'EN'): ?dil=EN ya da sağ üstteki düğme (localStorage 'vh-kart-dil').
 * window.METIN: assets/ornek/sozluk-s5.<dil>.json (DESIGN-MENU veri/sozluk-s5, birebir kopya) — parçalara `metin` olarak verilir (null = eksik; parça ⟦anahtar⟧ çizer).
 * window.LINEO: assets/ornek/lineo.<dil>.json — eksik (null) alanlar ⟦yol⟧ olarak doldurulur, TR'ye düşülmez.
 * window.A(anahtar, degiskenler): kartın kendi arayüz sözcükleri için aynı kural (sözlük).
 * window.K(anahtar): kart örnek yazısı — assets/ornek/kart.<dil>.json. Kart başlıkları (.e etiketleri: "Masaüstü 1240" gibi) tasarım notudur, ürün metni değil; TR kalır. */
(() => {
  const kok = document.currentScript.src.replace(/[^/]*$/, '') + '../../assets/ornek/'; /* yükleyici templates/_kart/ altında: paket derlemesine girmesin (ds-cevap 10-24h madde 2) */
  const q = new URLSearchParams(location.search).get('dil');
  let dil = (q || localStorage.getItem('vh-kart-dil') || 'TR').toUpperCase() === 'EN' ? 'EN' : 'TR';
  const yukle = (ad) => { const x = new XMLHttpRequest(); x.open('GET', kok + ad + '.' + dil.toLowerCase() + '.json', false); x.send(); return x.status < 300 ? JSON.parse(x.responseText) : {}; };
  const isaretle = (o, yol) => {
    if (o === null) return '\u27E6' + yol + '\u27E7';
    if (Array.isArray(o)) return o.map((v, i) => isaretle(v, yol + '[' + i + ']'));
    if (o && typeof o === 'object') { const r = {}; for (const k in o) r[k] = isaretle(o[k], yol ? yol + '.' + k : k); return r; }
    return o;
  };
  window.KART_DIL = dil;
  { const x = new XMLHttpRequest(); x.open('GET', document.currentScript.src.replace(/[^/]*$/, '') + 'katalog.js', false); x.send(); if (x.status < 300) (0, eval)(x.responseText.replace("(document.currentScript && document.currentScript.src.replace(/[^/]*$/, ''))", JSON.stringify(document.currentScript.src.replace(/[^/]*$/, '')))); } /* window.VHKatalog: ürün adları yalnız katalogdan */
  document.documentElement.lang = dil.toLowerCase(); /* büyük harf dönüşümü (İ/I) dile göre */
  window.METIN = Object.assign({}, yukle('sozluk-s5'), yukle('sozluk-ek')); /* sözlük = veri/sozluk-s5 + paket-B/sozluk-ek (iş emri #7) */
  window.LINEO = isaretle(yukle('lineo'), 'lineo');
  { const kt = isaretle(yukle('lineo-katalog'), 'lineo.katalog'); window.LINEO.katalog.sayfalar = (kt.sayfalar || []).map((p) => ({ ...p, zemin: kok + p.zemin })); }
  window.KART = yukle('kart');
  window.ORNEK = (ad) => isaretle(yukle(ad), ad); /* sahne, konut, urunler: assets/ornek/<ad>.<dil>.json; null → ⟦yol⟧ */
  window.K = (a, v) => { let s = window.KART[a]; if (s == null) return '\u27E6kart.' + a + '\u27E7'; if (v) for (const x in v) s = s.split('{' + x + '}').join(v[x]); return s; };
  window.ORNEK_KOK = kok;
  window.A = (k, v) => { let s = window.METIN[k]; if (s == null) return '\u27E6' + k + '\u27E7'; if (v) for (const x in v) s = s.split('{' + x + '}').join(v[x]); return s; };
  window.D = (s, v) => { if (v) for (const x in v) s = String(s).split('{' + x + '}').join(v[x]); return s; };
  const koy = () => {
    const b = document.createElement('div');
    b.style.cssText = 'position:fixed;top:8px;right:8px;z-index:999;display:flex;gap:4px;font:600 12px/1 var(--font-sans,sans-serif)';
    ['TR', 'EN'].forEach((d) => {
      const e = document.createElement('button'); e.type = 'button'; e.textContent = d;
      e.style.cssText = 'height:28px;padding:0 10px;border-radius:14px;cursor:pointer;border:1px solid hsl(var(--primary-navy));' + (d === dil ? 'background:hsl(var(--primary-navy));color:#fff' : 'background:#fff;color:hsl(var(--primary-navy))');
      e.onclick = () => { localStorage.setItem('vh-kart-dil', d); location.reload(); };
      b.appendChild(e);
    });
    document.body.appendChild(b);
  };
  if (document.body) koy(); else addEventListener('DOMContentLoaded', koy);
})();
