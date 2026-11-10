#!/usr/bin/env node
/**
 * TARAYICI PARÇACIK SETİ (Kanban SEO-98, OPS-256 2. dalga)
 *
 * Gerçek Chrome'da (claude-in-chrome `javascript_tool`) koşan, sahada çalışmış üç parçacığın tek kaynağı:
 *   gsc    → Search Console "URL denetimi" sayfasında adresi inceleyip "Dizine eklenmesini iste"ye basar
 *            (window.__iste(adres, ilk)); sonuç {url, durum, sonuc: ISTENDI | HATA: … | ZAMAN ASIMI}.
 *   bing   → Bing SERP sayfasında organik sonuç alan adlarını sırayla verir (ifade; sonuç dizi).
 *   google → Google SERP için window.serp(sorgu) tanımlar; {siralama: [alanAdi…]} ya da {captcha: true}.
 *
 * Kullanım: node scripts/seo/tarayici-parcaciklari.mjs <gsc|bing|google>   → parçacık metni stdout'a.
 * Sınırlar: robot doğrulaması (captcha) atlatılmaz, yalnız bildirilir; çıktıya sorgu dizesi (query string) konmaz
 * (javascript_tool "[BLOCKED: Cookie/query string data]" verir); Yandex elle formu 10 Kasım SEO-105 ile geri geldi (günde 10, form elle;
 * dizin-sistemleri-standard D7 madde 11). Her istekten sonra `dizin-takip.mjs --kaydet` çalıştırılır.
 */
import { pathToFileURL } from 'node:url'

export const GSC_ISTEK_PARCACIGI = `window.__iste = async function(url, ilk){
  if(!ilk){
    const inp=[...document.querySelectorAll('input')].find(i=>/inceleyin/i.test(i.getAttribute('aria-label')||'')||/inceleyin/i.test(i.placeholder||''));
    if(!inp) return {url, durum:'GIRIS YOK'};
    inp.focus();
    const set=Object.getOwnPropertyDescriptor(HTMLInputElement.prototype,'value').set;
    set.call(inp,url);
    inp.dispatchEvent(new Event('input',{bubbles:true}));
    await new Promise(r=>setTimeout(r,300));
    for (const t of ['keydown','keypress','keyup']) inp.dispatchEvent(new KeyboardEvent(t,{key:'Enter',code:'Enter',keyCode:13,which:13,bubbles:true}));
  }
  let s;
  for(let i=0;i<30;i++){
    await new Promise(r=>setTimeout(r,2000));
    s=[...document.querySelectorAll('span')].find(e=>e.children.length===0 && /dizine eklenmesini iste/i.test(e.textContent||''));
    if(s && document.body.innerText.includes(url)) break;
  }
  if(!s) return {url, durum:'DUGME YOK'};
  const once=document.body.innerText; const i0=once.indexOf('URL Denetimi');
  const durum=once.slice(i0+30,i0+130).replace(/\\n/g,' ');
  s.scrollIntoView({block:'center'});
  await new Promise(r=>setTimeout(r,400));
  (s.closest('[role=button],button,[jsaction]')||s).click();
  let sonuc='ZAMAN ASIMI';
  for(let i=0;i<30;i++){
    await new Promise(r=>setTimeout(r,4000));
    const t=document.body.innerText; const k=t.slice(t.indexOf('URL Denetimi'));
    if(/Dizine eklenmesi istendi/.test(k)){sonuc='ISTENDI';break}
    if(/kota|Kota|günlük sınır|Bir hata/.test(k)){sonuc='HATA: '+k.slice(-300).replace(/\\n/g,' ');break}
  }
  return {url, durum, sonuc};
};`

export const BING_SERP_PARCACIGI = `[...document.querySelectorAll('li.b_algo h2 a')].map(a=>{let u=a.href;if(u.includes('/ck/a')){try{u=atob((new URL(u).searchParams.get('u')||'').slice(2).replace(/-/g,'+').replace(/_/g,'/'))}catch(e){}}try{return new URL(u).hostname.replace(/^www\\./,'')}catch(e){return '?'}})`

export const GOOGLE_SERP_PARCACIGI = `window.serp = async function(q){
  const r = await fetch('/search?q='+encodeURIComponent(q)+'&hl=tr&gl=tr&num=10&pws=0&filter=0');
  const html = await r.text();
  if(/unusual traffic|captcha|sorry/i.test(html) || /\\/sorry\\//.test(r.url)) return {captcha:true};
  const doc = new DOMParser().parseFromString(html,'text/html');
  const siralama=[];
  for(const a of doc.querySelectorAll('a[href]')){
    if(!a.querySelector('h3')) continue;
    let u=a.getAttribute('href')||'';
    if(u.startsWith('/url?')){ try{ u=new URL(u,'https://www.google.com').searchParams.get('q')||u }catch(e){} }
    try{
      const h=new URL(u).hostname.replace(/^www\\./,'');
      if(!/(^|\\.)google\\./.test(h) && !siralama.includes(h)) siralama.push(h);
    }catch(e){}
  }
  return {siralama};
};`

export const PARCACIKLAR = { gsc: GSC_ISTEK_PARCACIGI, bing: BING_SERP_PARCACIGI, google: GOOGLE_SERP_PARCACIGI }

if (process.argv[1] && import.meta.url === pathToFileURL(process.argv[1]).href) {
  const ad = process.argv[2]
  if (!ad || !Object.hasOwn(PARCACIKLAR, ad)) {
    console.error('Kullanım: tarayici-parcaciklari.mjs <gsc|bing|google>')
    process.exit(2)
  }
  process.stdout.write(PARCACIKLAR[ad] + '\n')
}
