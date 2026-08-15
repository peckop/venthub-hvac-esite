---
name: venthub-20-eksen-denetimi
description: VentHub'ı 20 bağımsız kalite/güvenlik ekseninde denetler ve tarihli bir KARNE üretir (ör. 3 PASS / 4 PARTIAL / 12 FAIL). Eksen başına paralel SALT-OKUMA ajanı koşar, sonra bir çürütme pası yanlış-pozitifleri eler, sonra her bulgu için "bunu geri gelmekten alıkoyacak test nedir" sorusunu cevaplar. Şunlarda KULLAN — "20 madde denetimi", "kalite denetimi koş", "güvenlik taraması yap", "nerede zayıfız", "lansman öncesi denetim", "hangi maddede FAIL'dayız", "karneyi güncelle"; ayrıca büyük bir katman değiştiğinde veya lansman öncesi kendiliğinden ÖNER. KOD YAZMAZ, KOD SİLMEZ, DEPLOY ETMEZ. Tek dosyalık bug avı, PR diff incelemesi (→ diff-review), vizyona-sadakat/karmaşıklık denetimi (→ prd-complexity-audit) ya da test koşturmak için KULLANMA.
---

# 20 Eksen Denetimi — denetle → düzelt → **kilitle**

Bu bir "periyodik rapor" aracı değildir. Periyodik rapor aynı hatayı altı ayda bir yeniden bulur.
Yöntemin değeri üçüncü adımdadır: **düzeltilen her FAIL, arkasında onu zorlayan bir test bırakır.**
Karne o kilidin göstergesidir; geri gidiş sayıyla görünür hale gelir.

Kaynak liste `references/axes.md`'de **birebir** korunur. Dışarıdan gelmesi kritiktir: kendi kör
noktamızı kendi cetvelimizle ölçemeyiz.

## Bu liste neden işe yarıyor — koşarken bu üçünü BOZMA

1. **Her eksen DAR.** "Yalnız kimliğin nasıl kurulduğunu denetle" der; yetkilendirmeye girmez.
   Eksenler örtüşürse aynı bulgu üç kez sayılır, karne şişer, öncelik bozulur.
2. **Kapsam raporu ZORUNLU.** "Temiz olan giriş noktalarını da listele." Bu, sessiz kısmi taramayı
   imkânsız kılar — 40 uçtan 12'sine bakıp "temiz" diyen bir ajan kapsam listesinde ele verir.
3. **Somut arıza şart.** "Hangi bozuk durum oluşur", "hangi sıralama bunu tetikler". Anlatı değil,
   üretilebilir hata. Bu olmadan bulgu doğrulanamaz, dolayısıyla çürütülemez de.

## Faz 0 — Kapsam seç (her koşuda 20 eksenin hepsi gerekmez)

| Durum | Eksenler |
|---|---|
| Lansman öncesi / üç aylık tam denetim | 1–19, sonra 20 |
| Bir katman komple değişti (edge, ödeme, fiyat) | O katmana dokunanlar + 18 + 20 |
| Belirli bir şüphe | İlgili 2–4 eksen + 20 |

**Eksen 20 HER KOŞUDA çalışır.** Çürütme pası olmadan çıktı bir bulgu listesi değil, bir iddia listesidir.

## Faz 1 — Paralel salt-okuma pasları

Eksen başına bir alt-ajan. Her ajana şunları ver:

- `references/axes.md`'den o eksenin **birebir metni** — özetleme; dar kapsam tam o metinden geliyor
- `references/venthub-haritasi.md`'den o eksenin VentHub karşılığı (hangi katman, hangi dosyalar,
  hangi projeye-özel tuzak) — ajanın keşifle token yakmasını engeller
- **Önceki koşunun kapanmış bulguları** (`references/kapanmis-bulgular.md`) — çözülmüşü yeniden raporlamasın

**Model katmanı (kota gerçeği):** mekanik eksenler (7, 9, 10, 15) → sonnet. Yargı eksenleri
(2, 3, 5, 12, 13, 18) → opus. Kalanı işin ağırlığına göre.

**Ajan kuralları:** SALT OKUMA — dosya değiştirme yok, durum değiştiren komut yok, deploy yok,
internet yok. Her iddia `dosya:satır` ile.

> ⚠️ **Alt-ajanlar korunan yollara YAZAMAZ.** `lane-guard` alt-ajanın kimliğini şerit sahibinden
> farklı görür ve engeller. Bu engeli **dolandırma** (scratchpad + `cp`, `tee`, `>` vb. dahil) —
> bir kez denendi ve güvenlik ihlali olarak işaretlendi. Doğrusu: ajan içeriği **raporunda** verir,
> şerit sahibi yerleştirir. Zaten doğru olan da budur: merkezî kapı tek elde kalır.

## Faz 2 — Çürütme pası (eksen 20)

Girdi: tüm bulgular + kod. Kurallar sert ve pazarlıksız:

- Atıf tutmuyorsa → **REJECTED** (yerini bulamıyorsan)
- Mevcut bir guard / tip kısıtı / framework davranışı zaten engelliyorsa → **REJECTED**, çürüten yeri göstererek
- Görülmeyen koda bağlıysa → **UNVERIFIED**, gereken dosyalar adıyla
- **YENİ BULGU EKLEYEMEZ**
- Şiddet muhafazakâr yeniden puanlanır: CRITICAL yalnız somut arızayı kendin anlatabiliyorsan

Bunu **tek bir opus ajanına** ver; paralelleştirme — birleştirme ve şiddet kararı tek elde olmalı.

## Faz 3 — Karne + kilit önerisi

Çıktı: `docs/audits/<YYYY-MM-DD>-20-eksen.md` — **commit edilir.** (Önceki koşu 182 satırdı ve git'e
hiç girmedi; tek `git clean` ile uçacaktı. Bu, yöntemin ilk somut kusuruydu.)

İçerik sırası:

1. **Şiddet çerçevesi** — en başa. "Lansman-engeli mi, canlı-kesinti mi, hijyen mi" ayrımı
   yapılmazsa 12 FAIL paniğe dönüşür ve öncelik kaybolur.
2. **Kök neden bölümü** — bulguların çoğu tek kökten geliyorsa onu öne çıkar. *(2026-08-13 koşusunda
   12 FAIL'in ~%70'i tek kökten geliyordu. Görülmeseydi 12 ayrı iş açılırdı; görülünce tek iş açıldı.)*
3. CONFIRMED / UNVERIFIED / REJECTED
4. **KARNE** — 20 satır: madde · verdict · baş kanıt
5. **KİLİT ÖNERİSİ** — yöntemi kalıcı yapan bölüm. Her CONFIRMED için:
   *"bu düzeltilince onu geri gelmekten alıkoyacak conformance testi nedir?"*
   Testi yazılabilir olan her madde bir INV adayıdır; yazılamayanı açıkça "yazılamaz" diye işaretle.
6. Registry eşlemesi — hangi bulgu hangi iş emrine

## Faz 4 — Ratchet

Düzeltilen bulgu `references/kapanmis-bulgular.md`'ye **adıyla ve onu kilitleyen testin yoluyla**
işlenir. Sonraki koşu bunu ajanlara verir → yeniden raporlanmaz.

**Kilitleyen testi olmayan "düzeltildi" kaydı KABUL EDİLMEZ.** O bir yamadır, geri gelir.

## Kanıtlanmış örnek — 2026-08-13 koşusu

**3 PASS · 4 PARTIAL · 12 FAIL.** Baş bulgu bir maddenin *içinde* değil, maddeler *arasındaydı*:
edge fonksiyon kaynakları otomatik bir "kalite temizliği" ile bozulup prod'a gitmişti; tsc/lint/build
hiçbiri göremiyordu çünkü `tsconfig` `supabase/`'i hariç tutuyor.

Ondan çıkan zincir: deno-check kapısı → deploy sapması denetimi → 19 fonksiyonun onarımı ve deploy'u
→ **4 canlı kimlik-doğrulamasız açığın kapanması** → `auth.getUser()` kök sebebinin 16 fonksiyonda
bulunması → oturum açmış kullanıcının checkout doğrulamasının prod'da kırık olduğunun ortaya çıkması.

Tek koşu bunların hepsini başlattı. Yöntemin değeri budur — tek tek bug avlamak değil, **kökü bulmak.**

## Sınırlar (dürüstçe)

- **Canlı veriyi görmez.** RLS'in gerçekte ne döndürdüğü, prod env'inde neyin set olduğu → UNVERIFIED.
  Gerekiyorsa Supabase MCP ile ayrıca doğrula.
- **Repo ≠ prod.** Edge fonksiyonlarında bu ikisi 11 ay ayrıştı. Bir şeyin "prod'da kırık" olduğunu
  iddia etmeden önce **deploy edilmiş** kaynağı çek.
- **Kapsam ≠ gerçek.** Repoyu taramak evreni taramak değildir — bir kez prod'da repoda olmayan
  14 yetim fonksiyon çıktı, biri kimlik-doğrulamasız hesap açma ucuydu.
- Bu skill **kod yazmaz.** Düzeltme ayrı iştir, kilit testi ayrı iştir.

İlgili: `docs/standards/` (cetveller) · `src/__tests__/conformance/` (kilitlerin yaşadığı yer) ·
`prd-complexity-audit` (farklı eksen: vizyona sadakat) · `diff-review` (farklı kapsam: tek PR)
