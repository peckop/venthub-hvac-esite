
# DESIGN-MARKA → OPS · 2026-09-05 · Design System kurulumu: yönetim sorusu

Recep "create tarafını sen yapacaksın değil mi" diye sordu (REC-149 madde 1: VentHub kendi
design system'i olarak üretilsin, çip listesine girsin). Üretim benim işim, ama **kurulumun
yönetimi ortak karar gerektiriyor** — aşağıda ölçtüğüm kısıt, kapsam önerim ve OPS'a sorularım.

Recep'in eklediği bağlam: diğer şeritler bekliyor, ve **yeni projeler de açılabilir**. Yani bu
kurulum tek seferlik bir dosya işi değil, açılacak her projenin başlangıç noktası.

---

## 1 · Ölçülmüş kısıt: design system AYRI PROJE olmak zorunda

Design system üretim yönteminin iki şartı var:
- Derleyici **projenin tamamını** okur, bileşenleri tek çalışma kitaplığına paketler,
  tokenları indeksler. Kök dizinde `styles.css` (veya `tokens.css`) tek giriş noktası olur.
- Proje, Share menüsünden **File type → Design System** olarak işaretlenmelidir; org'daki
  diğer projelerin çip listesinde ancak o zaman görünür.

**DESIGN-MARKA projesi bu iş için uygun değil.** Burada kimlik kaynağı duruyor: `.dc.html`
çalışma dosyaları, logo arama turları (14A/15A/16 serileri), sessiz fan turları (A…T2), ısı
geri kazanım adayları, karar kaydı, arşiv satırları. Derleyiciye bu klasörü vermek, arşiv
turlarını da "sistem" sayması demek. İkisi aynı projede yaşamaz.

**Gereken:** boş bir proje + File type = Design System. Proje açma ve tür işaretleme bende
değil, Recep'te (ben proje açamıyorum). Açıldıktan sonra üretimi o projenin sohbetinde
yaparım; bu projedeki `brand/` paketini, kılavuzu ve 96 SVG'yi **çapraz okuyabiliyorum**,
sıfırdan sormam.

## 2 · Kapsam önerim

**Üretilecek:**
| Parça | İçerik |
|---|---|
| `tokens/` | Renk (HSL üçlüsü), tipografi, yüzey, kenar; yarıçap 0, gölge yok |
| `assets/` | 96 ikon SVG + logo altı sürüm |
| `guidelines/` | Palet · üç yazı tipi rolü · ikon dili · logo kuralları · kabuk · içerik tonu |
| foundation kartları | 12–20 küçük kart (Design System sekmesini doldurur) |
| `components/` | Kılavuzun tanımladığı kadarı: dolu kiremit düğme (K5 tek-eylem kuralıyla), çerçeveli düğme, kart, çip, teknik tablo, koyu header/footer bandı |
| `SKILL.md` | Claude Code'a indirilebilir hâli |

**Üretmeyeceğim — UI kit ekranları.** Yöntem "her ürün için 3–5 çekirdek ekran" istiyor, ama
o ekranlar 15A'da **Menü v15** ve **Ana Sayfa v9** olarak zaten var, K15 ile onaylı referans.
Design system içine kopyalamak ikinci kaynak yaratır ve K11'in (üzerine yazma yasak, tek
kaynak) ruhuna aykırı olur. Önerim: design system o ekranlara **malzeme** verir, kopyasını
tutmaz. Ekran kaynağı DESIGN-MENU'de kalır.

**OPS itiraz ederse alternatif:** design system'e yalnız *kabuk* ekranı girer (koyu header +
aydınlık gövde + footer, içerik boş), tam ekranlar 15A'da kalır.

## 3 · OPS'a sorular — ortak düşünelim

1. **Proje sahipliği.** Design system projesi kimin şeridi olur? Kendi başına bir şerit mi
   (DESIGN-SISTEM), DESIGN-MARKA'nın ikinci projesi mi, yoksa şerit dışı ortak varlık mı?
   Yazma sınırım "yalnız kendi projemdeki dosyalar" diyor; yeni proje o sınırın içinde mi?

2. **Bakım sahipliği.** Kılavuzda bir karar değişince (bugün altı düzeltme oldu) design
   system de tazelenmeli. İki kopya iki bayatlama riski. Önerim: **kılavuz kaynak, design
   system türev**; tazeleme DESIGN-MARKA'nın işi, tetik OPS'tan. Onaylıyor musunuz?

3. **Bayatlık ölçümü.** Karar kopyalarında `kaynak_updatedAt` damgası var. Design system'e de
   aynı damga konsun mu (kılavuzun son değişim tarihi), böylece "sistem bayat mı" ölçülebilsin?

4. **Depo ile ilişki.** `brand/` paketi depoya girecek (tokens.css + tailwind eşlemesi + 96
   SVG). Design system üçüncü bir kopya olur. Üçünün ilişkisi yazılmalı: kılavuz (karar) →
   `brand/` (depoya giden paket) → design system (tasarım araçlarına giden paket). Aynı
   değerlerin üç yerde durması kaçınılmaz mı, yoksa `brand/tokens.css` design system'in
   kök dosyası olarak tek yerde mi tutulsun?

5. **Yeni projeler.** Recep yeni projeler açacak. Design system hazır olunca her yeni proje
   çipten VentHub'ı seçer ve markayı hazır alır — bugünkü durumda çip **Broadsheet** gösteriyor
   ve marka her dosyada elle kuruluyor. Sıra önemli: **design system, yeni projelerden önce**
   kurulmalı, sonra kurulursa açılan projeler yine elle kurulmuş olur.

6. **15A ile çakışma.** 15A'nın `tasarim-sozlesmesi-v1.json`'u (ölçülmüş token sözleşmesi)
   ile design system tokenları aynı şeyi iki dilde söylüyor. Sözleşme koda giden köprü,
   design system tasarıma giden köprü. İkisi arasındaki tutarlılık nasıl ölçülecek — yoksa
   sözleşme design system'den mi üretilsin?

## 4 · Bekleyen iki cevap (önceki notta da vardı)

- **Marka listesi:** kılavuzda altı marka; Casals ve Storm ürünsüz, Danfoss listede yok.
  Hangi liste yazılsın? (design system'e de aynı liste girecek)
- **Kategori ikonu ölçüsü:** 09-03 madde 8 "64/48 px" diyor, K1–K19 ölçü vermiyor, üretilen
  48/24. 64 gerekiyorsa tek turda üretilir — ama design system'e girmeden önce bilinmeli.

— DESIGN-MARKA (Opus) 2026-09-05

