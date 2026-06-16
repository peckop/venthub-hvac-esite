# EN Yasal Metin Çevirisi — Hukuki İnceleme Brief'i

> **Ne bu?** Legal sayfaların İngilizce versiyonlarının durumu + **avukatla çözülmesi gereken**
> soru + yapılacaklar. Karar girdisi: hukuk danışmanı.
> Oluşturma: 2026-06-16 · Sahibi: Recep · Durum: **AÇIK — avukat girdisi bekliyor**
> İlgili: `docs/audits/legal-i18n-scope-antigravity-2026-06-16.md` · roadmap §3

---

## 1. Durum (ne oldu)

Legal sayfalarının i18n yeniden yapılandırması sırasında (PR #364), TR yasal metinlerinin yanına
**İngilizce versiyonları eklendi ve prod'da CANLI.** Bu EN metinler **LLM (makine) çevirisi** —
profesyonel/avukat onayından geçmedi. (Kullanıcı teyidi 2026-06-16: "llm çevirisi".)

**Makine-çevirisi izi:** EN dosyalarının `react/jsx-no-literals` uyarı sayıları TR ile **birebir
simetrik** (paragraf yapısı 1:1 kopyalanmış):

| Belge | TR uyarı | EN uyarı |
|---|---|---|
| KVKK | 47 | 47 |
| Mesafeli Satış Sözleşmesi | 39 | 39 |
| Gizlilik Politikası | 33 | 33 |
| Ön Bilgilendirme Formu | 22 | 22 |
| Kullanım Koşulları | 20 | 20 |
| Çerez Politikası | 15 | 15 |

Dosyalar: `src/views/legal/components/{tr,en}/*.tsx`

## 2. Risk Değerlendirmesi

- **Bağlayıcı versiyon TR'dir** (Türk şirketi + Türk hukuku). EN bir **nezaket/anlama** çevirisi →
  risk küçük AMA sıfır değil.
- **LLM çevirisi** = gözden geçirilmemiş hukuki terim → yanlış çeviri = yanlış taahhüt riski.
- **En hassas nokta — checkout sözleşmeleri:** Mesafeli Satış Sözleşmesi + Ön Bilgilendirme Formu,
  kullanıcının **aktif "kabul ediyorum"** dediği yasal-zorunlu belgeler. EN'de kabul edilirse
  "neyi kabul etti" sorusu doğabilir.

## 3. Avukata Sorulacak (karar)

1. EN metinleri **"gayriresmî çeviri; bağlayıcı olan Türkçe versiyondur"** disclaimer'ı ile tutmak yeterli mi?
2. Yoksa **profesyonel/onaylı çeviri** mi gerekli (özellikle mesafeli satış + ön bilgilendirme + KVKK)?
3. Yoksa onaya kadar **EN yasal metinleri tamamen kaldıralım** mı?
4. Checkout onay kutusu hangi versiyona **bağlanmalı** (öneri: TR)?

## 4. Yapılacaklar (avukat cevabına göre)

**Ara önlem (avukat gerekmez, geri alınır — istenirse hemen uygulanır):**
- [ ] Her legal sayfaya disclaimer (chrome, sözlükte):
  - TR: *"Bu İngilizce metin resmî olmayan bir çeviridir; bağlayıcı olan Türkçe versiyondur."*
  - EN: *"This English text is an unofficial translation; the Turkish version prevails."*
- [ ] Checkout onay kutusunu açıkça **TR sözleşmeye** bağla (referans + bağlayıcılık notu).

**Avukat kararına göre (sonra):**
- [ ] (a) Disclaimer'la tut → mevcut metin + disclaimer kalır.
- [ ] (b) Profesyonel çeviri → EN prose değiştirilir (split-component yapısı aynı kalır).
- [ ] (c) Kaldır → EN legal route'ları geçici devre dışı, TR'ye yönlendir.

## 5. Teknik Notlar

- Disclaimer = **chrome** (sözlükte `t()` ile), prose'a dokunmaz → temiz i18n, ~30 dk iş.
- Prose **sözlüğe taşınmaz** (split-component tr/en kararı — `docs/standards/i18n-localization-standard.md`);
  EN değişikliği = yalnız `en/*.tsx` dosyalarında.
- RSC tuzağı: chrome `useI18n()` ister → ilgili sayfa `'use client'` olmalı, sadece `pnpm build` yakalar.

## 6. Durum

**AÇIK** — avukat girdisi bekliyor. Roadmap §3 "Açık Kararlar"da kayıtlı. Karar gelince §4 uygulanır.
