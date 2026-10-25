/* Katalog okuyucu (önizleme ve şablon örnek verisi için; parça değil, pakete girmez).
 * Kural (Recep 10-24): ürün grubu, ürün türü ve seri adı YALNIZ katalogdan (assets/veri/katalog-2026-10-04.json · DESIGN-MENU birebir); sözlük yalnız arayüz sözcükleri.
 * TR ad = kayıt.ad, EN ad = kayıt.en (yoksa null → çağıran ⟦…⟧ çizer). Model sayısı katalogdaki n. Fotoğraf katalogdaki g. */
(() => {
  const B = 'https://tnofewwkwlyjsqgwjjga.supabase.co/storage/v1/object/public/product-images/d3b07384-d113-495f-a558-8c38634e0000/';
  const kok = (document.currentScript && document.currentScript.src.replace(/[^/]*$/, '')) || '';
  let kt = null, mk = null, et = null;
  const etAl = () => { if (!et) { et = {}; try { const x = new XMLHttpRequest(); x.open('GET', kok + '../../assets/veri/seri-uygulama-etiket.json', false); x.send(); if (x.status < 300) et = JSON.parse(x.responseText).seri || {}; } catch (e) {} } return et; };
  /* Marka görünen adı katalogda yok (yalnız kimlik); DESIGN-MENU kart-dili-veri'deki seri.marka'dan okunur. */
  const markaAd = (f, m) => { if (!mk) { mk = {}; const x = new XMLHttpRequest(); x.open('GET', kok + '../../assets/veri/kart-dili-veri-2026-10-23.json', false); x.send(); if (x.status < 300) JSON.parse(x.responseText).kok.forEach((k) => k.dal.forEach((d) => (d.seri || []).forEach((s) => { mk[s.f] = s.marka; mk['ad:' + s.f] = s.ad; mk['en:' + s.f] = s.en ?? null; mk['kisa:' + s.f] = s.kisa ?? null; mk['kisaEn:' + s.f] = s.kisaEn ?? null; }))); } return mk[f] || m; };
  /* Seri adı markasız: kart-dili-veri seri.ad (TR) / seri.en (EN) — Kombin kaynağı; yoksa null → çağıran ⟦…⟧ çizer. */
  const seriAd = (f, a, dil) => { markaAd(f, a.m); return String(dil).toUpperCase() === 'EN' ? (mk['en:' + f] ?? null) : (mk['ad:' + f] ?? null); };
  const al = () => { if (kt) return kt; const x = new XMLHttpRequest(); x.open('GET', kok + '../../assets/veri/katalog-2026-10-04.json', false); x.send(); kt = x.status < 300 ? JSON.parse(x.responseText) : { kok: [], dal: {}, aile: {} }; ad6(kt); isit(); return kt; };
  /* §6 adlar (DESIGN-MENU CLAUDE.md, Recep 10-25 · karar 409 10-26): katalog anlık görüntüsü (10-04) eski adı taşıyor; DB yazımı gelene kadar görünen ad buradan. EN ve adresler değişmez (Elektrik Aksesuarları dışında EN de §6'da). 
   * Karar 409: 'Kontrol ve Sürücüler' → 'Elektrik Aksesuarları' › Frekans Konvertörleri (İnvertör) · Hız Anahtarları · Sensörler ve Koruma (yalnız SEAT PTC; Aksesuarlar'daki 'Yedek Parça ve Sensörler' dalından taşınır). BVU-LS Aksesuarlar'da kalır. */
  const AD6 = { kok: { fanlar: ['Fanlar', null], kontrol: ['Elektrik Aksesuarları', 'Electrical Accessories'], igk: ['Isı Geri Kazanım', null], siginak: ['Sığınak Havalandırma', null], aksesuar: ['Aksesuarlar', null] }, dal: { 'frequency-converters': ['Frekans Konvertörleri (İnvertör)', 'Frequency Converters'], 'speed-controllers': ['Hız Anahtarları', 'Speed Controllers'], 'water-coil-duct-heaters': ['Sulu Bataryalı Kanal Isıtıcıları', null], 'ducted-central-hrv': ['Kanallı Isı Geri Kazanım Cihazları', null], 'single-room-hrv': ['Oda Tipi Isı Geri Kazanım Cihazları', null], 'shelter-ventilation': ['Sığınak Havalandırma Üniteleri', null] } };
  const SENSOR = { id: 'sensors-protection', ad: 'Sensörler ve Koruma', en: 'Sensors and Protection', kok: 'kontrol', eski: 'spare-parts-sensors', aile: ['seat-atex-ptc-sensor'] };
  const ad6 = (K) => {
    (K.kok || []).forEach((g) => { const y = AD6.kok[g.id]; if (y) { g.ad = y[0]; if (y[1]) g.en = y[1]; } });
    Object.keys(AD6.dal).forEach((d) => { const y = AD6.dal[d], D = K.dal[d]; if (D) { D.ad = y[0]; if (y[1]) D.en = y[1]; } });
    const E = K.dal[SENSOR.eski]; if (!E || K.dal[SENSOR.id]) return;
    const tas = SENSOR.aile.filter((f) => (E.aile || []).includes(f)); if (!tas.length) return;
    let n = 0, g = null; Object.keys(K.urun || {}).forEach((s) => { const u = K.urun[s]; if (tas.includes(u.f)) { u.d = SENSOR.id; u.k = SENSOR.kok; n++; if (!g && u.g) g = Array.isArray(u.g) ? u.g[0] : u.g; } });
    tas.forEach((f) => { const A = K.aile[f]; if (A) { A.d = SENSOR.id; A.k = SENSOR.kok; if (A.g) g = A.g; } });
    E.aile = E.aile.filter((f) => !tas.includes(f)); E.n = Math.max(0, (E.n || 0) - n);
    K.dal[SENSOR.id] = { ad: SENSOR.ad, en: SENSOR.en, k: SENSOR.kok, slug: [null, null], kaynak: '§6 karar 409 (DB yazımı bekliyor)', n, aile: tas, g, so: 0 };
    (K.kok || []).forEach((r) => { if (r.id === SENSOR.kok && !(r.dal || []).includes(SENSOR.id)) r.dal = (r.dal || []).concat(SENSOR.id); if (r.id === E.k && typeof r.n === 'number') r.n = Math.max(0, r.n - n); if (r.id === SENSOR.kok && typeof r.n === 'number') r.n += n; });
  };
  const md6 = (M) => { const E = M && M.dal && M.dal[SENSOR.eski]; if (!E || M.dal[SENSOR.id]) return; const Y = {}; SENSOR.aile.forEach((f) => { if (E[f]) { Y[f] = E[f]; delete E[f]; } }); if (Object.keys(Y).length) M.dal[SENSOR.id] = Y; };
  /* #18 D (ölçüm 10-25): ilk arama tuşu soğukta ~186 ms (marka adı + model verisi ilk kez yükleniyor). Katalog yüklenince boşta: iki veri dosyası önce zaman uyumsuz çekilir (tarayıcı önbelleği ısınır), sonra bir kez arama çekirdeği çalıştırılır; ilk tuş sıcak yoldan gelir. */
  let isindi = false;
  const bos_i = (f) => (window.requestIdleCallback ? window.requestIdleCallback(f, { timeout: 3000 }) : setTimeout(f, 1200));
  const isit = () => { if (isindi) return; isindi = true; bos_i(() => { Promise.all(['../../assets/veri/kart-dili-veri-2026-10-23.json', '../../assets/veri/kart-dili-modeller-2026-10-23.json'].map((u) => fetch(kok + u).catch(() => null))).then(() => bos_i(() => { try { araCekirdek('kanal', (document.documentElement.lang || 'tr').toUpperCase() === 'EN' ? 'EN' : 'TR', null, null, null); } catch (e) {} })); }); };
  const ad = (r, dil) => (r ? (String(dil).toUpperCase() === 'EN' ? (r.en ?? null) : r.ad) : null);
  const foto = (g) => (g ? B + g : null);
  const seri = (f, dil) => { const a = al().aile[f]; if (!a) return null; const m2 = markaAd(f, a.m), sa = seriAd(f, a, dil), ka = (String(dil).toUpperCase() === 'EN' ? mk['kisaEn:' + f] : mk['kisa:' + f]) ?? sa; return { slug: f, ad: sa, adTam: sa == null ? null : (m2 ? m2 + ' ' : '') + sa, kisa: ka, konumAd: ka == null ? null : (m2 ? m2 + ' ' : '') + ka, marka: m2, modelSayisi: a.n || 0, foto: foto(a.g), tur: a.d }; };
  const tur = (id, dil) => { const d = al().dal[id]; if (!d) return null; return { id, ad: ad(d, dil), model: d.n || 0, foto: foto(d.g), seri: (d.aile || []).map((f) => seri(f, dil)).filter(Boolean) }; };
  const grup = (k, dil) => { const turler = (k.dal || []).map((id) => tur(id, dil)).filter(Boolean); return { id: k.id, ad: ad(k, dil), model: turler.reduce((a, t) => a + t.model, 0), foto: foto(k.g), turler }; };
  let md = null;
  const mdAl = () => { if (md) return md; const x = new XMLHttpRequest(); x.open('GET', kok + '../../assets/veri/kart-dili-modeller-2026-10-23.json', false); x.send(); md = x.status < 300 ? JSON.parse(x.responseText) : { dal: {} }; md6(md); return md; };
  /* Kart/kapak temsil fotoğrafı: katalog görseli yazılı ya da ürünü göstermiyorsa (DESIGN-MENU kombin-veri.js temsil, birebir). */
  const TEMSIL = { 'acid-resistant-fans': '4fa78dea-793b-44e3-9202-41b45fa5c332/00.webp', 'bathroom-toilet-fans': '1d7b8758-4f37-47e1-a761-a373c4d79816/00.webp', 'axial-industrial-fans': '49d777d3-9352-45f6-b08d-f29b802ece74/00.webp' };
  const fmt = (v, yerel) => (v == null || v === '' ? null : typeof v === 'number' ? v.toLocaleString(yerel) : String(v));

  /* Arama (iş emri #16 A–B, kural kurallar/arama.md). Normalleştirme: sayfa diliyle küçült → ı/ş/ğ/ç/ö/ü sadeleştir → harf/rakam dışı boşluk; sözcük sonu çoğul/iyelik eki atılır; boşluksuz biçim kod eşleşmesi için.
   * Sıra: tam (0) → baştan (1) → her sorgu sözcüğü bir ad sözcüğünün başı (2) → içinde geçer (3). Eşitte kısa ad, sonra alfabe. */
  const EKLER = ['larinin', 'lerinin', 'larini', 'lerini', 'lari', 'leri', 'lar', 'ler', 'inin', 'unun', 'nin', 'nun', 'si', 'su', 'i', 'u'];
  const ekAt = (w) => { for (const e of EKLER) if (w.length - e.length >= 3 && w.endsWith(e)) return w.slice(0, -e.length); return w; };
  const norm = (s, dil) => String(s || '').toLocaleLowerCase(String(dil).toUpperCase() === 'EN' ? 'en' : 'tr-TR').replace(/ı/g, 'i').replace(/ş/g, 's').replace(/ğ/g, 'g').replace(/ç/g, 'c').replace(/ö/g, 'o').replace(/ü/g, 'u').replace(/[âàá]/g, 'a').replace(/[îí]/g, 'i').replace(/[ûú]/g, 'u').replace(/[^a-z0-9]+/g, ' ').trim();
  const DOLGU = { tr: ['tipi', 've', 'ile'], en: ['type', 'and', 'with'] }; /* ad içindeki dolgu sözcükleri eşleşmede yok sayılır ("kanal fanı" = "Kanal Tipi Fanlar") */
  const soz = (s, dil) => norm(s, dil).split(' ').filter((w) => w && !DOLGU[String(dil).toUpperCase() === 'EN' ? 'en' : 'tr'].includes(w)).map((w) => (String(dil).toUpperCase() === 'EN' ? w.replace(/(s|es)$/, (m) => (w.length > 4 ? '' : m)) : ekAt(w)));
  const puan = (ad, Q, dil) => { const n = soz(ad, dil).join(' '), q = Q.s.join(' '); if (!q) return null; if (n === q) return 0; if (n.startsWith(q)) return 1; const ns = n.split(' '); if (Q.s.every((w) => ns.some((x) => x.startsWith(w)))) return 2; const nb = n.replace(/ /g, ''), qb = q.replace(/ /g, ''); if (n.includes(q) || (qb.length >= 3 && nb.includes(qb))) return 3; return null; };
  const sirala = (L, dil) => L.sort((a, b) => a.p - b.p || String(a.ad).length - String(b.ad).length || String(a.ad).localeCompare(String(b.ad), String(dil).toUpperCase() === 'EN' ? 'en' : 'tr'));
  /* #16 E: eş anlam yalnız veriden (assets/veri/arama-es-anlam.json); kodda liste yok. Eşleşme: sadeleşmiş sorgu = sözcük, ya da sorgu sözcükle başlıyor ("ec fan 500"). */
  const esBul = (Q, dil, esVeri) => { const e = String(dil).toUpperCase() === 'EN' ? 'en' : 'tr', q = Q.s.join(' '); const out = []; ((esVeri && esVeri[e]) || []).forEach((r) => { if ((r.s || []).some((w) => { const n = soz(w, dil).join(' '); return n && (n === q || q.startsWith(n + ' ')); })) out.push(r); }); return out; };
  const parcaOf = (not, q) => { const P = []; const m = String(not || '').match(/(?:süzgeç|filter):\s*(\w+)\s*=\s*([\w-]+)/i); if (m) P.push(m[1].toLowerCase() + '=' + m[2].toLowerCase()); const s = String(not || '').match(/(?:sıralama|sort):\s*(\w+)/i); if (s) P.push('sira=' + norm(s[1], 'TR')); const d = String(q || '').match(/(\d[\d.]*)\s*(m3\/h|m³\/h|m3h|cmh|m3\/saat)/i); if (d) P.push('debi=' + d[1].replace(/\./g, '') + '-'); return P.length ? '#' + P.join('&') : ''; };
  const araCekirdek = (q, dil, sayfaVeri, esVeri, G) => {
    const Q = { s: soz(q, dil), ham: norm(q, dil) }; const kt = al(), e = String(dil).toUpperCase() === 'EN' ? 'en' : 'tr', rakam = /\d/.test(q);
    if (Q.ham.replace(/ /g, '').length < 2 && !(G && G.suz)) return { dogrudan: null, grup: [], tur: [], model: [], seri: [], sayfa: [], marka: [], rakam };
    const gr = [], tu = [], se = [], mo = [];
    (kt.kok || []).forEach((k) => { const G = grup(k, dil); const p = puan(G.ad, Q, dil); if (p != null && G.model > 0) gr.push({ p, id: G.id, ad: G.ad, model: G.model, foto: G.foto }); G.turler.forEach((t) => { const pt = puan(t.ad, Q, dil); if (pt != null && t.model > 0) tu.push({ p: pt, id: t.id, ad: t.ad, model: t.model, foto: t.foto, grup: G.ad, seri: t.seri.filter((s) => s.modelSayisi > 0) }); t.seri.forEach((s) => { if (!(s.modelSayisi > 0)) return; const ps = Math.min(...[s.adTam, s.konumAd, s.ad].filter(Boolean).map((x) => { const r = puan(x, Q, dil); return r == null ? 9 : r; })); if (ps < 9 && !se.find((y) => y.slug === s.slug)) se.push({ p: ps, slug: s.slug, ad: s.konumAd || s.adTam || s.ad, model: s.modelSayisi, foto: s.foto, tur: t.ad }); }); }); });
    Object.keys(kt.urun || {}).forEach((sku) => { const u = kt.urun[sku], ad = (e === 'en' ? u.e : u.a) || u.a; let p = puan(ad, Q, dil); const pk = puan(sku, Q, dil); if (pk != null) p = p == null ? pk : Math.min(p, pk); if (p == null) return; const g = Array.isArray(u.g) ? u.g[0] : u.g; const S = u.f ? seri(u.f, dil) : null; mo.push({ p, sku, ad, foto: g ? B + g : null, seri: S ? S.konumAd || S.ad : '' }); });
    if (G && G.suz) { const ok = (sku) => { const t = (kt.urun[sku] || {}).t || {}; return (!G.suz.cap || Number(t.diameter_mm) === G.suz.cap) && (!G.suz.ip || String(t.ip_rating || '').replace(/\s/g, '').toUpperCase().includes('IP' + G.suz.ip)) && (!G.suz.atex || !!(t.atex_zone || t.atex_marking)); }; for (let i = mo.length - 1; i >= 0; i--) if (!ok(mo[i].sku)) mo.splice(i, 1); if (!Q.s.length || Q.ham === '') { Object.keys(kt.urun).forEach((sku) => { if (ok(sku) && !mo.find((x) => x.sku === sku)) { const u = kt.urun[sku], g = Array.isArray(u.g) ? u.g[0] : u.g, S = u.f ? seri(u.f, dil) : null; mo.push({ p: 2, sku, ad: (e === 'en' ? u.e : u.a) || u.a, foto: g ? B + g : null, seri: S ? S.konumAd || S.ad : '' }); } }); } }
    sirala(gr, dil); sirala(tu, dil); sirala(se, dil); sirala(mo, dil);
    /* #16 E-1: eş anlam hedefleri. esit/eski → doğrudan git; genis/ihtiyac → hedefler grup/tür listesinin başında; yazim → hedef satırı en üstte. E-2/3: not süzgeci ve birimli sayı # parçası. */
    let esD = null; const parca0 = parcaOf('', q) || (G && G.parca) || ''; const markaL = [];
    Object.keys(MARKA).forEach((id) => { const p = puan(MARKA[id][0], Q, dil); if (p != null && p <= 1 && !markaL.find((x) => x.id === id)) markaL.push({ id, ad: MARKA[id][0], logo: MARKA[id][1] }); });
    esBul(Q, dil, esVeri).forEach((r) => { const parca = parcaOf(r.not, q); (r.hedef || []).forEach((h, hi) => { const [tip, id] = String(h).split(':');
      if (tip === 'dal') { const T = tur(id, dil); if (!T || !(T.model > 0)) return; const G = (kt.kok || []).find((x) => (x.dal || []).includes(id)), gad = G ? grup(G, dil).ad : ''; const sat = { p: -1, id, ad: T.ad, model: T.model, foto: T.foto, grup: gad, seri: T.seri.filter((s) => s.modelSayisi > 0), parca };
        if ((r.tur === 'esit' || r.tur === 'eski' || r.tur === 'yazim') && hi === 0 && !esD) esD = sat; else if (!tu.find((x) => x.id === id)) tu.unshift(sat); else { const x = tu.find((y) => y.id === id); x.p = -1; x.parca = parca; } }
      else if (tip === 'kok') { const K = (kt.kok || []).find((x) => x.id === id); if (!K) return; const G = grup(K, dil); if (!gr.find((x) => x.id === id)) gr.unshift({ p: -1, id, ad: G.ad, model: G.model, foto: G.foto, parca }); }
      else if (tip === 'marka') { if (!markaL.find((x) => x.id === id) && MARKA[id]) markaL.push({ id, ad: MARKA[id][0], logo: MARKA[id][1] }); }
      else if (tip === 'aile') { const S = seri(id, dil); if (!S || !(S.modelSayisi > 0)) return; const t0 = tur(S.tur, dil); const i = se.findIndex((x) => x.slug === id); if (i >= 0) se.splice(i, 1); se.unshift({ p: -1, slug: id, ad: S.konumAd || S.adTam || S.ad, model: S.modelSayisi, foto: S.foto, tur: t0 ? t0.ad : '', parca }); }
    }); });
    sirala(gr, dil); sirala(tu, dil);
    if (parca0) tu.forEach((t) => { if (!t.parca) t.parca = parca0; });
    const d0 = esD || (tu[0] && tu[0].p >= 0 && tu[0].p <= 1 ? tu[0] : null); /* genis/ihtiyac (p −1) doğrudan git olmaz */
    const dogrudan = d0 ? { ...d0, parca: d0.parca || parca0, seriler: d0.seri.slice().sort((a, b) => b.modelSayisi - a.modelSayisi).slice(0, 4) } : null;
    const sayfa = ((sayfaVeri && sayfaVeri[e]) || []).filter((S) => (S.s || []).some((w) => { const n = soz(w, dil).join(' '), qq = Q.s.join(' '); return n && (n === qq || qq.startsWith(n + ' ') || (qq.length >= 3 && n.startsWith(qq))); })).map((S) => ({ id: S.adres, anahtar: S.anahtar, adres: S.adres })); /* veri/arama-sayfa.json (DESIGN-MENU, 7 sayfa) */
    return { marka: markaL.slice(0, 3), dogrudan, grup: gr.slice(0, 2), tur: (d0 ? tu.filter((x) => x !== d0 && x.id !== d0.id) : tu).slice(0, 3), model: mo.slice(0, 4), seri: se.slice(0, 3), sayfa, rakam };
  };
  /* Marka adı (§8 yazımı) ve logo (assets/marka-logolari, DESIGN-MENU). #16 Durum-3: "Markalar" grubu, adres /tr/markalar/<marka>. */
  const MARKA = { vortice: ['Vortice', 'vortice-yatay.png'], seat: ['SEAT', 'seat.png'], avens: ['AVenS', 'avens.svg'], 'nicotra-gebhardt': ['Nicotra Gebhardt', 'nicotra-gebhardt.webp'], danfoss: ['Danfoss', 'danfoss.svg'], casals: ['Casals', 'casals.png'], flexiva: ['Flexiva', 'flexiva.png'] };
  /* #16 G-1: sayı + birim/simge → süzgeç (katalog alanı: diameter_mm, ip_rating, atex_*); sorgudan çıkarılır. */
  const gCoz = (q) => { let s = ' ' + String(q || '').toLocaleLowerCase('tr-TR') + ' '; const suz = {}, P = []; s = s.replace(/(?:ø|⌀|\bd)\s*(\d{2,4})\b/g, (m, n) => { suz.cap = +n; return ' '; }).replace(/\b(\d{2,4})\s*mm\b/g, (m, n) => { suz.cap = +n; return ' '; }).replace(/\bip\s*(\d{2})\b/g, (m, n) => { suz.ip = n; return ' '; }).replace(/\batex\b/g, () => { suz.atex = 1; return ' '; }); if (suz.cap) P.push('cap=' + suz.cap); if (suz.ip) P.push('ip=' + suz.ip); if (suz.atex) P.push('atex=1'); return { q: s.trim(), suz: P.length ? suz : null, parca: P.length ? '#' + P.join('&') : '' }; };
  const bos_ = (r) => !(r.dogrudan || r.grup.length || r.tur.length || r.model.length || r.seri.length || r.sayfa.length || r.marka.length);
  /* #16 F: sonuçsuzsa önce en yakın katalog adı ("Bunu mu…"), alan terimleri düzeltilmez; yoksa sözcük bırakarak gevşetme. Önerilen yalnız sonuçlu kayıt. */
  const KORU = ['plug', 'avens', 'seat', 'es', 'ec', 'ac', 'atex', 'erp'];
  const lev = (a, b) => { const m = a.length, n = b.length; if (Math.abs(m - n) > 2) return 9; const d = Array.from({ length: m + 1 }, (_, i) => [i]); for (let j = 1; j <= n; j++) d[0][j] = j; for (let i = 1; i <= m; i++) for (let j = 1; j <= n; j++) d[i][j] = Math.min(d[i - 1][j] + 1, d[i][j - 1] + 1, d[i - 1][j - 1] + (a[i - 1] === b[j - 1] ? 0 : 1)); return d[m][n]; };
  let SOZLUK = null; const sozluk = (dil) => { if (SOZLUK && SOZLUK.dil === dil) return SOZLUK.L; const kt = al(), set = new Set(); (kt.kok || []).forEach((kk) => { const G = grup(kk, dil); soz(G.ad, dil).forEach((w) => set.add(w)); G.turler.forEach((t) => { soz(t.ad, dil).forEach((w) => set.add(w)); t.seri.forEach((s) => soz(s.konumAd || s.ad || '', dil).forEach((w) => set.add(w))); }); }); Object.values(MARKA).forEach((m) => soz(m[0], dil).forEach((w) => set.add(w))); SOZLUK = { dil, L: [...set].filter((w) => w.length >= 3 && !/\d/.test(w)) }; return SOZLUK.L; };
  const ara = (q, dil, sayfaVeri, esVeri) => {
    let Gc = gCoz(q); const uyum = Gc.q.split(/\s+(?:için|icin|for)\s+/); let uyumModel = null;
    if (uyum.length === 2 && uyum[0] && uyum[1]) { const L = araCekirdek(uyum[0], dil, null, null, null); uyumModel = L.model[0] || null; Gc = { ...Gc, q: uyum[1] }; } /* G-2: "<model> için <tür>" → tür; uyum alanı katalogda yok, model yalnız not olarak döner (§8 hesap yok) */
    const r = araCekirdek(Gc.q, dil, sayfaVeri, esVeri, Gc); r.uyumModel = uyumModel;
    if (!bos_(r) || !String(Gc.q).trim()) return r;
    const Q = soz(Gc.q, dil), V = sozluk(dil); let degisti = false;
    const Q2 = Q.map((w) => { if (KORU.includes(w) || /\d/.test(w) || w.length < 4) return w; let en = null, eb = 9; V.forEach((v) => { const dd = lev(w, v); if (dd < eb) { eb = dd; en = v; } }); if (en && eb <= (w.length >= 7 ? 2 : 1) && en !== w) { degisti = true; return en; } return w; });
    if (degisti) { const r2 = araCekirdek(Q2.join(' '), dil, sayfaVeri, esVeri, Gc); if (!bos_(r2)) { const ad = (r2.marka[0] && r2.marka[0].ad) || (r2.dogrudan && r2.dogrudan.ad) || (r2.seri[0] && r2.seri[0].ad) || (r2.tur[0] && r2.tur[0].ad) || (r2.model[0] && r2.model[0].ad) || (r2.grup[0] && r2.grup[0].ad) || (r2.marka[0] && r2.marka[0].ad); return { ...r, bunuMu: { ad, q: Q2.join(' ') } }; } }
    const sira = Q.map((w, i) => i).sort((a, b) => (/\d/.test(Q[b]) ? 1 : 0) - (/\d/.test(Q[a]) ? 1 : 0) || b - a);
    for (const i of sira) { if (Q.length < 2) break; const q2 = Q.filter((_, j) => j !== i).join(' '); if (!q2.split(' ').some((w) => w.length >= 3 && !/\d/.test(w))) continue; /* yalnız sayı kalırsa gevşetme yok */ const r3 = araCekirdek(q2, dil, sayfaVeri, esVeri, Gc); if (!bos_(r3)) return { ...r3, gevsek: { q: String(q).trim(), q2 } }; }
    return r;
  };
  window.VHKatalog = {
    ara, aramaNorm: norm,
    /* #17 A: kararlı sıra — her sıralamada ikinci anahtar SKU (artan); aynı değerdeki modeller sayfa değişince yer değiştirmez. deger: (m) => sayı | null (null en sona). */
    sirala: (list, deger, yon = 1) => list.slice().sort((a, b) => { const x = deger(a), y = deger(b); if (x == null && y != null) return 1; if (y == null && x != null) return -1; if (x != null && y != null && x !== y) return (x - y) * yon; return String(a.sku).localeCompare(String(b.sku), 'en', { numeric: true }); }),
    temsil: (dalId) => (TEMSIL[dalId] ? B + TEMSIL[dalId] : null),
    /* Model satırları (ModelRow verisi): model adı ve değerler kart-dili-modeller'den, seri adı katalogdan. Satır: [ad, sku, foto, …, çap(6), motor(7), fiyat(8), değerler(9)]. */
    modeller: (dalId, anahtar, kip, dil) => { const yerel = String(dil).toUpperCase() === 'EN' ? 'en-GB' : 'tr-TR'; const T = tur(dalId, dil); if (!T) return []; const m = mdAl().dal[dalId] || {}; const out = []; T.seri.forEach((s) => (m[s.slug] || []).forEach((r) => { const d = r[9] || {}; out.push({ sku: r[1], ad: r[0], kod: r[1], marka: s.marka, motor: r[7] || undefined, seri: s.ad, degerler: anahtar.map((k) => (d[k] ? { v: fmt(d[k][0], yerel), birim: d[k][1] } : { v: null })), gorseller: r[2] ? [B + r[2]] : [], fiyat: kip === 'satis' ? r[8] : null, suz: { tur: dalId, seri: s.slug, marka: s.marka || '', motor: r[7] || '', cap: r[6] || '' } }); })); return out; },
    /* Ham model satırları (aralık hesabı için): kart-dili-modeller, türün katalogdaki serileri. */
    ham: (dalId, f) => { const T = tur(dalId, 'TR'); if (!T) return []; const m = mdAl().dal[dalId] || {}; const out = []; T.seri.forEach((s) => { if (!f || s.slug === f) (m[s.slug] || []).forEach((r) => out.push(r)); }); return out; },
    aralik: (list, i, on, son, dil) => { const yerel = String(dil).toUpperCase() === 'EN' ? 'en-GB' : 'tr-TR'; const v = list.filter((x) => typeof x[i] === 'number').map((x) => x[i]); if (!v.length) return null; const a = Math.min(...v), b = Math.max(...v); return (on || '') + (a === b ? fmt(a, yerel) : fmt(a, yerel) + '–' + fmt(b, yerel)) + (son ? ' ' + son : ''); },
    tanim: (dalId, dil) => { const d = al().dal[dalId]; const a = d && d.ac; return a ? (typeof a === 'string' ? a : a[String(dil).toLowerCase() === 'en' ? 'en' : 'tr'] ?? null) : null; },
    /* Model bul: sku → { r (ham satır), dal (tür id), f (seri slug) } */
    bul: (sku) => { const m = mdAl().dal; for (const d in m) for (const f in m[d]) for (const r of m[d][f]) if (r[1] === sku) return { r, dal: d, f }; return null; },
    /* Ürün galerisi: katalog urun[sku].g (bütün görseller); yoksa model verisindeki tek görsel. */
    gorseller: (sku, yedek) => { const u = (al().urun || {})[sku]; const g = u && u.g; const L = Array.isArray(g) ? g : g ? [g] : []; return L.length ? L.map((x) => B + x) : yedek ? [B + yedek] : []; },
    seriSatirlari: (dalId, f) => (mdAl().dal[dalId] || {})[f] || [],
    foto: (g) => (g ? B + g : null),
    secenek: (list, k) => { const set = {}; list.forEach((u) => { const v = u.suz[k]; if (v !== '' && v != null) set[v] = (set[v] || 0) + 1; }); return Object.keys(set).sort((a, b) => (isNaN(a) || isNaN(b) ? a.localeCompare(b, 'tr') : a - b)).map((v) => ({ deger: isNaN(v) ? v : +v, ad: k === 'cap' ? 'Ø' + v : v, n: set[v] })); },
    katalog: al,
    gruplar: (dil) => al().kok.map((k) => grup(k, dil)),
    grup: (id, dil) => { const k = al().kok.find((x) => x.id === id); return k ? grup(k, dil) : null; },
    tur, seri,
    /* Uygulama alanı: alan = veri/uygulama-alani.json alanlar[i]. icerik 'tur' → türün bütün serileri, 'tur:seri' → yalnız o seri. Ürünsüz bölüm düşer. */
    /* Uygulama alanı (iş emri #14 A-2, tek yer): bölüm serisi = seri etiketi (assets/veri/seri-uygulama-etiket.json) kural.etiket'i taşır VE ürün türü kural.tur içinde.
     * icerik = kuralın elle karşılığı + istisna ekleme (kuralda olmayan icerik serisi eklenir); cikar = istisna çıkarma ('seri' ya da 'tür:seri'). Model 0 seri çizilmez (K7); çoktan aza.
     * Dönüş bölümünde fark = kural ile icerik arasındaki seri farkı (ölçüm). Ad ve sayı katalogdan; alan/bölüm adı veriden. */
    alan: (alan, dil) => {
      const e = String(dil).toUpperCase() === 'EN' ? 'en' : 'tr', ET = etAl();
      const icSet = (b) => { const o = []; (b.icerik || []).forEach((x) => { const [t, f] = String(x).split(':'); const T = tur(t, dil); if (!T) return; (f ? T.seri.filter((s) => s.slug === f) : T.seri).forEach((s) => o.push(s)); }); return o; };
      const kuSet = (b) => { const K = b.kural; if (!K || !K.etiket) return null; const o = []; (K.tur || []).forEach((t) => { const T = tur(t, dil); if (T) T.seri.forEach((s) => { if ((ET[s.slug] || []).includes(K.etiket)) o.push(s); }); }); return o; };
      const bolumler = (alan.bolumler || []).map((b) => {
        const I = icSet(b), K = kuSet(b), cik = new Set((b.cikar || []).map((x) => String(x).split(':').pop()));
        const iS = new Set(I.map((s) => s.slug)), kS = K ? new Set(K.map((s) => s.slug)) : iS;
        const fark = K ? [...iS].filter((x) => !kS.has(x)).length + [...kS].filter((x) => !iS.has(x)).length : 0;
        const hepsi = []; [...(K || []), ...I].forEach((s) => { if (!cik.has(s.slug) && s.modelSayisi > 0 && !hepsi.find((y) => y.slug === s.slug)) hepsi.push(s); });
        hepsi.sort((p, q) => q.modelSayisi - p.modelSayisi);
        const turIds = [...new Set(hepsi.map((s) => s.tur))];
        return { id: b.id, ad: b.ad ? b.ad[e] ?? null : null, anaSayfa: !!b.anaSayfa, turler: turIds.map((t) => (tur(t, dil) || {}).ad).filter(Boolean), turIds, seriler: hepsi, fark };
      }).filter((b) => b.seriler.length);
      return { id: alan.id, ad: alan.ad ? alan.ad[e] ?? null : null, adres: alan.yol ? alan.yol[e] ?? null : null, bolumler };
    },
    /* 9 alan, veri sırası; sira verilmişse ona göre (Konut 9.). */
    alanlar: (veri) => ((veri && veri.alanlar) || []).map((x, i) => ({ x, s: x.sira ?? i + 1 })).sort((p, q) => p.s - q.s).map((y) => y.x)
  };
})();
