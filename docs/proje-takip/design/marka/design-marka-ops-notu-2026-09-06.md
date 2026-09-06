
# DESIGN-MARKA → OPS · 2026-09-06 · yayın tazeleme: ölçüm DS readme'siyle çelişiyor

Recep DS'te varlık ve bileşen değiştikten sonra "tik zaten işaretli" dedi ve tazeliği ölçmemi
istedi. Ölçtüm; **iki kez yanlış çıkarım yaptım, ikisini de düzelttim.** Sonuç bir kural.

## Ölçüm — tik durması tazelemiyor, yeniden bağlama tazeliyor

DS'in 16:40 işi (2 soluk SVG + `Kart` üst kenar ve kapsam dışı düzeltmesi) **tik dururken üç
tüketici projeye de gitmedi.** Recep çip seçimini kaldırıp tekrar seçti; ondan sonra geldi:

| Gösterge | Yeniden bağlamadan önce | Sonra |
|---|---|---|
| Bağlı `readme.md` · soluk işaret | yok | **var** |
| Bağlı `readme.md` · `30 SVG` / `174 varlık` | yok | **var** |
| Bağlı `readme.md` · `Kart` kapsam dışı 6.47:1 | yok | **var** |
| Bundle · `kapsamDisi` zemin + `--text-body` | yok | **var** (alfa yok, K22 uyumlu) |
| Bundle · koşullu `borderTop` | yok | **var** |

**DS readme'sindeki damga satırı bu ölçümle çelişiyor:** *"Tik durduğu sürece bugünün varlık ve
bileşen değişiklikleri tüketici tarafına kendiliğinden gider; ek işlem gerekmez."* Ölçüm bunun
tersini gösteriyor. Düzeltilmesini öneriyorum — yoksa bir sonraki değişiklikte kimse yeniden
bağlamayı düşünmez ve tüketiciler sessizce eski bileşenle çalışır.

## Kendi iki hatam — kayda yazdım ki tekrarlanmasın

**1 · `assets/` bağlı kopyaya hiç girmiyor.** İlk turda "soluk SVG bağlı kopyada yok, demek
bayat" dedim. Yanlış: bağlı kopyada yalnız `tokens/`, `_ds_bundle.js`, `_ds_manifest.json`,
`readme.md`, `styles.css` var — varlık hiç taşınmıyor. Varlık yokluğu bayatlık kanıtı değil;
ikon ve logo `brand/` ya da DS projesinden alınır.

**2 · `kaynak_updatedAt` tazelik göstergesi değil.** Kılavuz dosyasının tarihini izliyor, yayın
saatini değil; kaynak değişmeyen turlarda sabit kalıyor (DS de öyle yazmış). 13:03:31Z görmek
"eski" demek değil. Doğru göstergeler: bağlı `readme.md` metni ve `_ds_bundle.js` içindeki
bileşen kodu.

Bir de küçük bir araç notu: başka projedeki dosyada arama bir kez **yanlış negatif** verdi
(damga aslında oradaydı, okuyunca göründü). Cross-project ölçümde arama tek başına yeterli
değil, dosyayı okumak gerekiyor. Recep'e o an düzeltmeyi söyledim.

## Kurala dönen kısım

`CLAUDE.md`'ye iki madde girdi: **bağlı kopya kendiliğinden tazelenmiyor, yöntem çipi kaldır-
tekrar seç**; ve **tazelik nasıl ölçülür** (readme metni + bundle kodu; damga ve varlık yokluğu
değil).

## Sırada

- DS readme'sindeki "ek işlem gerekmez" satırının düzeltilmesi (DS'in işi, ölçüm yukarıda).
- MENU ve BELGE tüketici projelerinde de yeniden bağlama gerekiyor — Recep bu projede yaptı;
  diğer ikisi ölçülmedi, sıra OPS'ta.

**Kullanılan `/` yeteneği:** bu turda yok (ölçüm ve kayıt).

— DESIGN-MARKA (Opus) 2026-09-06

