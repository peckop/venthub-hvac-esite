---
name: llm-council
description: >-
  ZOR ve TEK-CEVAPLI-OLMAYAN bir soruyu (mimari seçim, "A mı B mi", riskli karar, karmaşık kök
  sebep, bir planın doğruluğu) tek modelin görüşüne bırakmak yerine bir KONSEY'e sormak için
  KULLAN: N bağımsız üye (farklı mercek, farklı model/efor) ayrı ayrı cevaplar → her üye
  diğerlerinin ANONİM cevaplarını puanlar ve çürütür → başkan tek bir sentez + muhalefet şerhi
  üretir. Tetikleyiciler: "konseye sor", "council", "ikinci görüş al", "çok modelli değerlendir",
  "emin olamıyorum, oylatalım", "bu kararı çürüttürelim". Workflow aracıyla koşar — emirde
  "workflow kullan" yazmalı (cetvel §2). Basit soru, tek dosyalık düzeltme, ölçülebilir olgu
  ("kaç test var") ya da zaten yazılmış bir planın red-team'i (→ plan-challenger) için KULLANMA.
---

# LLM Council — anonim çapraz puanlamalı konsey

> Kaynak: karpathy/llm-council fikri (MIT; OpenRouter'lı web uygulaması) VentHub'a uyarlandı,
> 2026-09-08. Ürün alınmadı; **fikrin üç aşaması** bizim Workflow altyapısına yazıldı. Fark:
> üyeler Claude alt-ajanları (mercek + efor çeşitliliği) ve isteğe bağlı bir Gemini koltuğu (agy);
> anonimleştirme koddadır, modele bırakılmaz.

## Niçin var

Workflow'da "fan-out → çürütme → sentez" zaten var (20-eksen, prd-complexity). Eksik olan tek
parça **anonim karşılıklı puanlama**: üyeler birbirinin cevabını kimin yazdığını bilmeden
sıralar. Bu, "büyük modelin cevabı doğrudur" ve "kendi cevabımı yüksek puanlarım" önyargısını
keser. Recep'in sık sorduğu "bu iki yoldan hangisi?" sorusu için tek modelin tek cevabından daha
dayanıklı bir karar üretir.

## Ne zaman KULLANILMAZ

- Cevap ölçülebilir olgu ise (grep/CodeGraph/DB sayımı) — ölç, konsey kurma.
- Karar zaten Kararlar defterinde verilmişse (REC-*) — yeniden açma.
- Plan yazılmışsa ve "doğru mu" soruluyorsa → `plan-challenger` (kod-kanıtlı red-team).
- Sorunun tek sahibi Recep ise (ürün kapsamı, fiyat politikası) — konsey **öneri** üretir,
  karar vermez; bunu çıktıda açıkça yaz.

## Kurulum

| Parametre | Varsayılan | Not |
|---|---|---|
| Üye sayısı | 4 | 3-6 arası; 3'ün altı puanlama anlamsız |
| Mercekler | risk-önce · en-basit · uzun-vade · kullanıcı/işletmeci | Soruya göre değiştir; her üyeye FARKLI mercek ver |
| Model/efor | inherit; bir üye `effort:'high'`, bir üye `model:'sonnet'` | Çeşitlilik = bağımsızlık |
| Gemini koltuğu | kapalı | `agy` kuruluysa `--gemini`: `bash .claude/skills/agy-orchestrate/scripts/agy-run.sh` ile bir cevap alınır ve konseye ANONİM katılır |
| Başkan | ayrı ajan, `effort:'high'` | Üyelerden biri DEĞİL (kendi cevabını kayırmasın) |

Üyeler kod tabanını okuyabilir (CodeGraph, Read, Grep); "kod kazanır" kuralı her cevaba
uygulanır: kanıtsız iddia puanlamada düşer.

## Üç aşama

1. **İlk görüşler** — soru + bağlam (ilgili cetvel adları, dosyalar) her üyeye ayrı verilir.
   Üye kendi merceğinden cevaplar: **öneri + gerekçe + kanıt (dosya:satır) + risk + "beni ne
   çürütür"**. Üyeler birbirini görmez.
2. **Anonim inceleme** — her üye, diğerlerinin cevaplarını **A/B/C** etiketiyle, üyeye göre
   **döndürülmüş sırayla** alır (kimlik yok, sıra ipucu yok). Her cevabı 1-10 puanlar, en güçlü
   itirazını yazar, sıralar. Kendi cevabı listede YOKTUR.
3. **Başkan sentezi** — başkan tüm cevapları, puan matrisini ve itirazları görür; **tek öneri**
   + **niçin** + **muhalefet şerhi** (en yüksek puanlı karşı görüş, gömülmez) + **kanıt boşluğu**
   (hangi iddia ölçülmedi) + **Recep'e soru** (varsa) üretir.

## Workflow betiği (şablon — soruyu ve mercekleri doldur)

```js
export const meta = {
  name: 'llm-council',
  description: 'N bagimsiz uye → anonim capraz puanlama → baskan sentezi',
  phases: [{ title: 'Ilk gorusler' }, { title: 'Anonim inceleme' }, { title: 'Baskan sentezi' }],
}
const Q = args.question           // zorunlu
const CTX = args.context || ''    // cetvel adlari, dosyalar, kisitlar
const SEATS = args.seats || [
  { lens: 'risk-once: neyin kirilacagini, geri alinamaz adimi, RLS/odeme/webhook riskini one al', opts: { effort: 'high' } },
  { lens: 'en-basit: en az dosya, en az yeni mekanizma; mevcut kodu yeniden kullan', opts: {} },
  { lens: 'uzun-vade: 3 yil sonra hangi secim daha az bakim ister; cetvellerle uyum', opts: {} },
  { lens: 'isletmeci: Recep tek operator; gunluk isi, hatasi, egitim yuku', opts: { model: 'sonnet' } },
]
const ANSWER = { type: 'object', required: ['oneri', 'gerekce', 'kanit', 'risk', 'curutur'], properties: {
  oneri: { type: 'string' }, gerekce: { type: 'string' }, kanit: { type: 'array', items: { type: 'string' } },
  risk: { type: 'string' }, curutur: { type: 'string' } } }
const REVIEW = { type: 'object', required: ['puanlar'], properties: { puanlar: { type: 'array', items: {
  type: 'object', required: ['etiket', 'puan', 'itiraz'], properties: {
    etiket: { type: 'string' }, puan: { type: 'integer', minimum: 1, maximum: 10 }, itiraz: { type: 'string' } } } } } }

phase('Ilk gorusler')
const answers = (await parallel(SEATS.map((s, i) => () =>
  agent(`SORU: ${Q}\nBAGLAM: ${CTX}\nMERCEK: ${s.lens}\nKurallar: kanitsiz iddia yazma (dosya:satir ver); `
      + `Kararlar defterinde kapanmis bir konuysa soyle; "beni ne curutur" alanini doldur.`,
    { label: `uye-${i + 1}`, phase: 'Ilk gorusler', schema: ANSWER, ...s.opts })
))).map((a, i) => a && { ...a, seat: i })
const live = answers.filter(Boolean)
if (live.length < 3) { log(`yalniz ${live.length} uye cevapladi — konsey gecersiz`); return { gecersiz: true, live } }

phase('Anonim inceleme')
const LBL = 'ABCDEFGH'
const reviews = await parallel(live.map((me, ri) => () => {
  const others = live.filter(a => a.seat !== me.seat)
  const rotated = others.map((_, k) => others[(k + ri) % others.length])   // uyeye gore dondurulmus sira
  const packet = rotated.map((a, k) => `[${LBL[k]}] ONERI: ${a.oneri}\nGEREKCE: ${a.gerekce}\nKANIT: ${a.kanit.join('; ')}\nRISK: ${a.risk}`).join('\n\n')
  const key = rotated.map((a, k) => [LBL[k], a.seat])
  return agent(`SORU: ${Q}\nAsagidaki ANONIM cevaplari 1-10 puanla; her birine EN GUCLU itirazini yaz. `
      + `Kimin yazdigini tahmin etme, sira ipucu yok. Kanitsiz iddia dusuk puan alir.\n\n${packet}`,
    { label: `inceleme-${ri + 1}`, phase: 'Anonim inceleme', schema: REVIEW, ...SEATS[me.seat].opts })
    .then(r => r && { by: me.seat, key, puanlar: r.puanlar })
}))
const matrix = {}
for (const r of reviews.filter(Boolean)) for (const p of r.puanlar) {
  const seat = (r.key.find(([l]) => l === p.etiket) || [])[1]
  if (seat === undefined) continue
  ;(matrix[seat] ||= []).push({ by: r.by, puan: p.puan, itiraz: p.itiraz })
}
const avg = Object.fromEntries(Object.entries(matrix).map(([s, v]) => [s, v.reduce((a, b) => a + b.puan, 0) / v.length]))
log('ortalama puanlar: ' + JSON.stringify(avg))

phase('Baskan sentezi')
const final = await agent(`SORU: ${Q}\nBAGLAM: ${CTX}\n\nUYE CEVAPLARI:\n${JSON.stringify(live, null, 1)}\n\n`
    + `PUAN MATRISI (seat → [puan, itiraz]):\n${JSON.stringify(matrix, null, 1)}\nORTALAMA: ${JSON.stringify(avg)}\n\n`
    + `Baskan olarak TEK oneri yaz: oneri · nicin · MUHALEFET SERHI (en yuksek puanli karsi gorus, gomme) · `
    + `KANIT BOSLUGU (olculmemis iddialar) · Recep'e soru (varsa). Karar Recep'indir; konsey oneri uretir.`,
  { label: 'baskan', phase: 'Baskan sentezi', effort: 'high' })
return { final, avg, matrix, live }
```

Çağrı: `Workflow({ script, args: { question: '...', context: '...' } })`. Gemini koltuğu: betikten
önce `agy-run.sh` ile cevabı al, `args.seats`'e `{ lens: 'gemini', pre: <cevap> }` diye ekle ve
aşama 1'de `pre` varsa ajan açmadan onu kullan (şablonda basitlik için gösterilmedi).

## Çıktı ve kayıt

- Sonuç `docs/audits/council-<konu>-YYYY-MM-DD.md`: soru · üye cevapları (kısa) · puan matrisi ·
  başkan sentezi · **muhalefet şerhi** · kanıt boşluğu. Muhalefet asla silinmez; Recep karşı
  görüşü görmeden karar vermemeli.
- Karar Recep'ten çıkınca Kararlar defterine REC-* olarak işlenir; konsey raporu kaynak olarak
  bağlanır. Konsey **karar defteri değildir**.
- Maliyet: 4 üye + 4 inceleme + 1 başkan = 9 ajan. Emirde `YÖNTEM: Workflow (llm-council, 9 ajan)`
  yazılır; "workflow kullan" ibaresi olmadan araç açılmaz.

## Kesin kurallar

Üyeler birbirini görmez · inceleme anonim ve döndürülmüş sıralı · başkan üye değil · kanıtsız
iddia düşük puan · muhalefet şerhi zorunlu · konsey karar vermez, önerir · 3'ten az üye = geçersiz.
