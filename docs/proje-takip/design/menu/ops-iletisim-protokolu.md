
# OPS ↔ Design iletişim protokolü — üç projede aynı (DESIGN-MENU · DESIGN-MARKA · DESIGN-BELGE)

Yazan: OPS · 2026-09-05 · Kaynak: bugün yaşanan boşluk (bir öneri yalnız sohbette söylendi, OPS'a hiç ulaşmadı).

## OPS'un seni nasıl gördüğü — mekanizma
- OPS bu projenin **dosyalarını** izler: yeni ya da değişen `.md` dosyası OPS'u anında uyandırır.
- OPS **Linear yorumlarını okur** ama yorum yazıldığında uyanmaz; dosya olayı gelince Linear'a bakar.
- OPS **sohbeti göremez.** Recep ile aranızda geçen hiçbir şey OPS'a ulaşmaz, Recep elle taşımazsa.

## Kural: her çıktı = DOSYA + LİNEAR YORUMU (ikisi birden)
| Çıktı türü | Dosya (projede) | Linear (proje yorumu) |
|---|---|---|
| Teslim (çizim, JSON, rapor) | `.dc.html` / `.json` + **`<ad>-notlar.md`** | tur sonu yorumu: ne teslim edildi, ne ölçüldü, sıradaki |
| Öneri / görüş | `<konu>-onerisi-<tarih>.md` | aynı metnin özeti + "dosya: <ad>" |
| Soru (OPS'a ya da Recep'e) | `sorular-<tarih>.md` ya da öneri dosyasının "Sorular" bölümü | yorumda **numaralı** liste |
| Düzeltme / öz-eleştiri | notlar dosyasına ek | yorum |
Dosya = OPS'un tetikleyicisi. Yorum = kayıt ve tarihçe. Biri eksikse çıktı **yarım** sayılır.

## Recep'in rolü
- Recep sana yalnız **"Linear"** der. Bu, "OPS'un son yorumunu oku, oradan devam et" demektir. Sen Linear'da bu projenin
  yorumlarını en yeniden eskiye okur, OPS imzalı son yorumu emir sayarsın.
- Recep'e ayrıntı taşıtma; ona yalnız **karar sorusu** gider (yapısal ya da ticari). Mekanik soru OPS'a.
- Recep'in sohbette söylediği bir şeyi karar sayma; karar **Kararlar belgesine** (Linear) OPS yazınca karar olur.

## Biçim kuralları
- İmza: `— DESIGN-MENU (Fable) tarih` / `— DESIGN-MARKA (…) tarih` / `— DESIGN-BELGE (Opus) tarih`. Deney projelerinde model adı **yazılmaz**.
- Yoruma **saat yazma**; Linear damgası geçerlidir (elle yazılan saat bugün iki kez yanlış çıktı).
- Sayı yalnız ölçülenden; ölçülemeyen alan **boş bırakılır**, "veri yok" satırı çizilmez, "yakında" yazılmaz.
- Başka Design projesinin dosyasını **oku, yazma**; oraya yazım OPS üzerinden.
- Bir başka projeyi ilgilendiren bulgu (ör. Marka → Menü) kendi projenin yorumuna yazılır, OPS taşır.

## Şablon, çip ve `/` yetenekleri — hangi projede hangisi (OPS hükmü, 2026-09-05; Recep ekranındaki listeden)
Design ajanı yetenekleri işin türüne göre kendi çağırır; **hangisini çağırdığını tur sonu yorumuna yazar** ("kullanılan: Interactive prototype").
Listede olmayan bir yeteneği kullanmak istiyorsa önce yorumda gerekçe.

| Proje | Çip | Şablon | Kullanılacak `/` yetenekleri | KULLANILMAZ |
|---|---|---|---|---|
| **DESIGN-MENU** (vitrin) | VentHub (DS hazır olunca; o güne kadar Broadsheet elle ezilir) | Blank · UI mockups (ekranlar) · Wireframe (ucuz alternatif kurgusu) | **Interactive prototype** (Kabuk v2 sonrası menü/sekme/yaprak akışı tıklanabilir; Recep akışı gezer) · Make tweakable (kipler, iki hâl) · Web research (rakip ölçümü, Systemair gibi) · Save as standalone HTML (Recep incelemesi) · **Handoff to Claude Code** (15A kodlaması başlarken, dosya olarak) | Animated video · 3D object (ürün 3D'si kodda R3F) · Maps · Slides |
| **DESIGN-MARKA** (kimlik) | VentHub | Blank | **Create design system** (DS projesinde) · Handoff to Claude Code (brand/ paketi) · Save as PDF (kılavuzun basılı hâli) · Make a deck (marka sunumu, Recep isterse) | Color + type pairing (palet karar verildi, yeniden seçilmez) · Frontend design (kod tarafı URUN'un) |
| **VentHub Design System** | (kendisi) | — | Create design system · Make tweakable (kabuk ekranı) | UI kit tam ekranları (K11: ekran kaynağı DESIGN-MENU) |
| **DESIGN-BELGE** (basılı) | VentHub | **Document** (A4, akan belge) · Blank | **Save as PDF** (her teslimde baskı provası + tek renk) · Make tweakable (`alanAdlari`, `kapaliEtiket`) · **HTML email** (e-posta şablonları turu için) | Slides · Wireframe · Interactive prototype |
| **DENEY-MARKA-1/2/3** | VentHub | Blank | hiçbiri (kör deney; yetenek kullanımı sonucu etkiler) | tümü |

Genel: **Claude API in prototypes** şimdi hiçbir projede kullanılmaz (Ürün Seçici C kipi için ileride değerlendirilir, K18 Faz 3).
**Web research** yalnız ölçüm amaçlı; bulgular "rakip böyle yapıyor" olarak yazılır, karar değil.

## Bayatlık sinyali (v1.2, 2026-09-05 — DESIGN-MARKA önerisi, OPS kabul)
OPS bir Kararlar belgesine (15A · Belgeler · REC-149 hükümleri) yazınca, **aynı turda** ilgili Design projelerine `bayat-<tarih>.md`
bırakır: tablo halinde *karar · ne değişti · kimi ilgilendirir* + kaynak `updatedAt` damgası + ayna durumu. Design "Linear" turunun
**ilk işi** o günün bayat dosyasını okumaktır; aynasında karşılığı olan satırı düzeltir, düzelttiğini tur sonu yorumuna yazar.
Tam ayna (`kararlar-*.md` kopyası) OPS dışa aktarımıyla yenilenir; bayat dosyası ile ayna çelişirse Linear kazanır.

## Ölçüm sahipliği (v1.2)
İki projede birden görünen her **sayı** tek sahibe aittir ve yalnız sahibinin kaydında yaşar; diğerleri referans verir, kopyalamaz.
Sahipler: token/kontur/boşluk/yazı ölçeği → **DESIGN-MENU sözleşmesi** · palet hex, logo, ikon seti, marka listesi → **DESIGN-MARKA CLAUDE.md**
· belge ölçüleri (A4, pt, kapalı-bekler etiketi) → **DESIGN-BELGE Kararlar** · katalog/ürün sayıları → **kod/DB** (OPS ölçer). Sahipsiz sayı kural olmaz.

## Numaralı soru, numaralı cevap (v1.2)
Design'ın sorusu numarasız gitmez; OPS'un cevabı aynı numarayla döner. Cevapsız numara "açık" olarak bir sonraki yorumda tekrar sayılır.

## Sürekli soru kaydı (v1.2)
Her Design şeridinin Linear'da **"Sorular — DESIGN-X"** kaydı vardır (DESIGN etiketli, kendi projesinde). Design soru/öneriyi oraya
yorum olarak yazar (dosya + yorum kuralı sürer); yeni kayıt açmaz. OPS cevabı aynı kayda numaralı yazar.

## ⭐ Emir yüzeyi — TEK yer + DOSYA (v1.3, 2026-09-05 akşam; Recep: "iletişim kronik, çöz")
Bugün iki kez aynı hata: OPS emri Design'ın okumadığı yüzeye yazdı (Marka kaydı yerine proje yorumu; Menü proje yorumu
yerine REC-129 kaydı). Kural değişti, iki katmanlı:
1. **Emir DOSYA olarak projeye düşer:** OPS her emri `ops-emir-<tarih>-<sıra>.md` adıyla **senin projene** yazar. "Linear"
   turunun İLK işi: projedeki en yeni `ops-emir-*.md` + `bayat-*.md` dosyalarını okumak. **Dosya kazanır**; Linear yorumu izdir.
   Dosya yoksa ve Linear'da da OPS yorumu yoksa "emir yok, bekliyorum" yazıp durursun — başka iş uydurma.
2. **Linear yüzeyi şerit başına TEK:** MENU → Vitrin 15A **proje yorumu** · BELGE → Kurumsal Belgeler **proje yorumu** ·
   MARKA ve DS → **REC-149** kaydı yorumu. OPS başka yere yazarsa geçersizdir; Design başka yeri taramak zorunda değildir.
Cevap yolu değişmedi: Design → dosya + kendi yüzeyine yorum. Sorular → Sorular kaydı (REC-151/152/153).

## DS tazeleme (v1.4, 2026-09-06; DESIGN-MARKA ölçümü)
Published tiki dururken DS değişikliği tüketici projelere **kendiliğinden gitmez**. DS'te varlık/bileşen/token değişince: DS tur sonu
yorumuna "yeniden bağlama gerekir" yazar → OPS Recep'e söyler → **Recep her tüketici projede çipi kaldırıp yeniden seçer** (MENU · BELGE ·
MARKA). Tazelik ölçütü: bağlı `readme.md` metni + `_ds_bundle.js` bileşen kodu. `kaynak_updatedAt` yayın tazeliği göstermez; `assets/`
bağlı kopyaya hiç girmez (ikon/logo `brand/` ya da DS projesinden türev kopya, damgalı). Çapraz proje ölçümünde arama tek başına yetmez,
dosya okunur.

## ⭐ Recep'in okuduğu yüzey = PROJE YORUMU, tam metin (v1.5, 2026-09-06 sabah; Recep: "yazdıklarını neden göremiyorum")
v1.2'nin "Sorular kaydı" kuralı (soru/cevap REC-151/152/153'te) Recep'i kör bıraktı: Recep projeyi okur, kayıt sayfasını değil; proje
yorumunda yalnız "iz" görünce "cevap yok" sandı. Kural değişti:
1. **OPS'un her cevabı ve hükmü TAM METİNLE proje yorumuna yazılır** (MENU → Vitrin 15A · BELGE → Kurumsal Belgeler · MARKA/DS → REC-149 kaydı
   proje yorumu sayılır). Emir dosyası yine kazanır; yorum onun okunur kopyasıdır.
2. **Sorular kaydına (REC-151/152/153) yalnız İZ düşer:** "cevap proje yorumunda + dosya adı". Numaralı soru düzeni kalır, numaralar proje yorumunda cevaplanır.
3. Design de aynı: teslim ve soru özeti proje yorumuna tam, kayda iz.
Ölçüt: Recep proje sayfasını en yeniden eskiye okuduğunda her açık sorunun cevabını orada görür; görmüyorsa protokol ihlalidir.

## Kim ne yapar
- **OPS:** okur, hüküm verir, Kararlar'a yazar, projeler arası taşır, Recep'e karar sorusunu götürür.
- **Design:** çizer, ölçer, dosya + yorum bırakır, kendi işini eleştirir (bugün üçünüz de bunu iyi yaptı).
- **Recep:** karar verir, "Linear" der, oturumu açar.

— OPS · 2026-09-05

