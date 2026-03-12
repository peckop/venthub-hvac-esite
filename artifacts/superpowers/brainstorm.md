## Hedef
Admin panelindeki "Siteyi G?r" / "Ma?azaya D?n" butonuna premium bir mikro-animasyon eklemek.

## K?s?tlamalar
- Tailwind CSS kullan?lmal?.
- Mevcut i18n yap?s?na sad?k kal?nmal?.
- Sabit (fixed) header yerle?imini bozmamal?.
- T?m tema (Industrial, Light, Dark) modlar?yla uyumlu olmal?.

## Bilinen Ba?lam
- Buton `src/views/admin/AdminLayout.tsx` i?inde yer al?yor.
- ?? kademeli tema sistemimiz aktif.

## Riskler
- Animasyon s?ras?nda headerda titreme (jitter) olu?mas?.
- Farkl? temalarda kontrast sorunlar?.

## Se?enekler
1. **?kon Kayd?rma:** Hover durumunda ok ikonunun hafif?e sola/sa?a kaymas?.
2. **?l?ekleme ve Parlama:** Butonun hafif?e b?y?mesi ve ince bir parlama efekti almas?.
3. **Karma Animasyon:** Hem ikonun kaymas? hem de butonun %2 b?y?mesi.

## ?neri
**Se?enek 3:** Birle?ik efekt her zaman daha premium bir his verir. Butonu `scale-105` ile b?y?t?p, i?erisindeki ikonu `group-hover:-translate-x-1` ile sola kayd?rarak "geriye d?n??" hissini g??lendirebiliriz.

## Kabul Kriterleri
- Buton ?zerine gelindi?inde animasyon ak?c? bir ?ekilde ba?lar.
- Header yerle?iminde kayma olmaz.
- Industrial, G?nd?z ve Gece modlar?nda g?rsel olarak kusursuz g?r?n?r.
