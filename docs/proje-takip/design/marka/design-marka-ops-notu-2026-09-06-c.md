
# DESIGN-MARKA → OPS · 2026-09-06 · süreç hatası: değer emri DS'e verildi, kaynak atlandı

Recep süreci netleştirdi ve kök nedeni buldu: **OPS emir sırasını Recep'e verdi, Recep de onu
DS'e yönlendirdi** ("Linear oku"). DS emri okudu, sayıları ölçtü, iki tokeni üretti — ama
kaynağa değil kendi tarafına yazdı. Kaynak `brand/tokens.css` boş kaldı; ben bugün doldurdum.

Hata DS'in değil. **Emir yanlış kapıya gitti.**

## Doğru sıra

```
karar (OPS/Recep → Linear, SSOT)
  → KAYNAK: DESIGN-MARKA · CLAUDE.md (niçin) + brand/tokens.css (değer) + kılavuz (çizim)
    → TÜREV: DS · brand/ kopyası → tokens/ + bileşen
      → TÜKETİCİ: MENU · BELGE · MARKA (çip)
```

Tek yön: MARKA → DS. Kılavuz kaynak, DS türev — bu kuruluş hükmüydü, bugün ilk kez sınandı ve
tutmadı.

## Kuralın işletim biçimi — öneri

| Emrin konusu | Kimin kapısı |
|---|---|
| Renk, ölçü, yazım, kural, **token değeri** | **DESIGN-MARKA** (kaynak). DS'e yazılmaz |
| Bileşen, kart, ekran, şablon, derleme | **DS** |
| Ekran ve bilgi mimarisi | DESIGN-MENU (K11) |
| Belge şablonu | DESIGN-BELGE |

Sınav sorusu tek: **çıktı bir DEĞER mi, bir BİLEŞEN mi?** Değerse önce kaynağa yazılır, sonra
DS türetir. Bugün ters oldu, o yüzden kaynak bir tur boyunca eski kaldı ve tüketiciler
kaynakta olmayan bir değeri gördü.

Öneri: **değer emri DS'e verilmez.** Verilmesi gerekiyorsa (DS'in ölçüm yeteneği gerekiyorsa)
emirde açıkça yazılır: *"ölç ve DESIGN-MARKA'ya bildir, kaynağa o yazar."*

## Bugün kaynağa yazılanlar

`brand/tokens.css` · `brand/tailwind-brand.js` · `brand/README.md` · `CLAUDE.md` (K25-b):
`--brand-cyan-ink` **#00708F** (193 100% 28%) · `--action-terracotta-deep` **#BF5309**
(24 91% 39%) · `--text-muted` kapsam kuralı.

Yedi oran bağımsız ölçüldü, DS'in sayıları doğru. **Yeni sınır:** cyan-ink koyu zeminde de
kullanılmaz (#1A2B4A 2.50 · #0F1723 3.18) — ham turkuazdan daha kötü.

Kılavuzun kendi iki ihlali de düzeltildi: 10 yerde ham kiremit metin zemini → #BF5309 ·
12 yerde "Teklif al" → "Teklif iste" (K5, kalan 0).

## DS tarafında kalan iş

DS'in `brand/` kopyası artık kaynaktan **geride**: bugün kaynağa girenler orada yok —
`tailwind-brand.js` eşlemesi, `README.md` palet tablosu ve kural paragrafı, cyan-ink'in koyu
zemin sınırı, ham renklerin "zemin/kenar rengi" yorum satırları.

Ayrıca DS'in `tokens/renk.css`'i doğru değerleri taşıyor ama **kaynak damgası eski** —
`kaynak_updatedAt` bugünkü kılavuz değişikliğini görmüyor.

Sıra: **DS `brand/` kopyasını kaynaktan tazeler → sonra Recep üç projede çipi yeniden seçer.**
Şimdi çip çevrilirse tüketiciler yarım hâli alır.

## Raporlanması istenen

Recep bu süreç hatasının raporlanmasını istedi. İki sorum var:

1. Bundan sonra değer emirleri DESIGN-MARKA'ya mı gelecek? Yukarıdaki kapı tablosu onaylanıyor
   mu, Kararlar'a yazılacak mı?
2. Bugünkü ters akış başka değer üretti mi — yalnız bu iki token mu, yoksa DS'e verilmiş başka
   ölçüm emri var mı? Varsa kaynağa alırım.

**Kullanılan `/` yeteneği:** bu turda yok (süreç raporu).

— DESIGN-MARKA (Opus) 2026-09-06

