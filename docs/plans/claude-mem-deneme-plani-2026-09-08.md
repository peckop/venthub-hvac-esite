# claude-mem deneme planı — tek şerit, iki hafta, ölçümle karar

> **Durum:** PLAN (Recep "önerdiklerini de yap" dedi, 2026-09-08). Kurulum Recep'in
> makinesinde yapılır; bu belge kurulum şartlarını, ölçüm kriterini ve geri alma yolunu sabitler.
> **KAYNAK/CETVEL:** `execution-method-standard.md` (tekil araç denemesi) ·
> `collaboration-protocol.md` (şerit izolasyonu) · **cetvel yok** "üçüncü-taraf hook katmanı
> kabul ölçütü" için — bu plan o ölçütün ilk taslağıdır. **YÖNTEM:** elle, tek şerit.
>
> **KAYNAK:** thedotmack/claude-mem (46k★, README 2026-09-08 okundu). **ALINAN:** hiçbir şey
> henüz — deneme. **BİZDEN:** kabul/red ölçütü, izolasyon, gizlilik şartı.

## Ne yapıyor, bizde ne var

claude-mem beş yaşam-döngüsü hook'u (SessionStart, UserPromptSubmit, PostToolUse, Stop,
SessionEnd) ile her araç çağrısını yakalar, Agent SDK ile sıkıştırır, yerel SQLite + Chroma'ya
yazar, sonraki oturuma "ilgili bağlam" enjekte eder. Bun + uv + yerel worker servisi ister.

Bizim hafıza katmanı **küratörlü**: NotebookLM ikizi (milestone sync), `docs/` cetveller,
Kararlar defteri (REC-*), eylem defteri hook'u, `hafiza-sorusu-yonlendirme` hook'u. Boşluk:
**oturum-içi "ne denedim, ne çıktı"** bilgisi compact'la kayboluyor; defter elle yazılıyor ve
bayatlıyor (`defter-bayatlik-olcumu` bugün 9 saat ölçtü).

## Riskler (denemeden önce bilinen)

1. **Hook çakışması:** aynı beş olayda bizim 8 hook'umuz var (session-board, board-brief,
   hafiza-sorusu-yonlendirme, eylem-defteri, precompact-durum-kapisi, son-soz-gate…). Sıra ve
   süre etkisi ölçülmeli; `statusMessage` gecikmesi 3 sn'yi geçerse red.
2. **"Kod kazanır" bulanıklığı:** enjekte edilen özet CLAUDE.md/cetvelle çelişirse ajan hangisine
   inanır? Kural: enjekte bağlam **ipucu**, cetvel **kanıt**. Bunu CLAUDE.md'ye yazmadan deneme
   yapılmaz (tek satır, Recep onayı).
3. **Gizlilik:** kurulum varsayılanı **hosted "claude-mem observer"** (e-posta ile giriş, 30 gün
   ücretsiz). Repo public ama oturumlar iş verisi (fiyat, bayi, sipariş) içerir. **Şart:**
   `npx claude-mem install --provider host` ya da `CLAUDE_MEM_ONLINE_OPTIN=false` — veri
   makineden çıkmaz. Hosted mod **yasak**.
4. **Maliyet:** her araç çağrısı Agent SDK ile sıkıştırma = token. Plan kotasından düşer
   (`--provider host`). Haftalık kota etkisi ölçülür.
5. **Windows:** README Windows notu var (npm PATH); Bun/uv otomatik kurulum. Recep'in makinesi
   Windows — ilk gün "kuruldu mu" ölçümü.

## Deneme düzeni

- **Tek şerit:** yalnız Recep'in ana oturumu (ya da OPS). Diğer şeritler kurmaz — yanlış-pozitif
  hook etkileşimi tek yerde görülsün.
- **Süre:** 14 gün (2026-09-09 → 09-23).
- **Sıfır noktası (kurulumdan önce ölç):** `defter-bayatlik` ortalaması (saat) · haftada kaç
  "bunu konuşmuş muyduk" sorusu bağlamdan (ölçmeden) cevaplandı (`hafiza-sorusu-yonlendirme`
  log'u) · oturum başına compact sayısı · 7 günlük kota kullanımı.

## Kabul ölçütü (14. gün, OPS ölçer)

| Ölçüt | Kabul | Red |
|---|---|---|
| Hook gecikmesi (UserPromptSubmit toplam) | < 2 sn | ≥ 3 sn |
| "Hafıza sorusu" isabet: enjekte bağlam doğru kararı gösterdi | ≥ 3 ölçülmüş vaka | 0-1 |
| Yanlış enjeksiyon: cetvelle çelişen özet ajanı yanılttı | 0 | ≥ 1 (kanıtlı) |
| Kota | +%15'ten az | +%15'ten çok |
| Veri dışarı çıktı mı (`~/.claude-mem/settings.json` provider) | host | başka |

Üç "kabul" + sıfır "red" → tüm şeritlere yayılır (cetvel yazılır). Aksi → kaldırılır:
`/plugin uninstall claude-mem`, `~/.claude-mem/` silinir, hook girdileri temizlenir; sonuç
`docs/audits/claude-mem-deneme-2026-09-23.md`.

## Recep'in yapacağı (kurulum günü)

```powershell
# varsayılan hosted DEĞİL — yerel sağlayıcı zorunlu
npx claude-mem install --provider host
# sonra Claude Code'u yeniden başlat; ~/.claude-mem/settings.json'da provider'ı doğrula
```

Kurulumdan sonra OPS'a "kuruldu, sıfır noktası şu" notu; 14. günde ölçüm OPS'ta.
