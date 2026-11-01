# Ön yükleme adayı bütçe ölçümü: bug-hunter ve security-scanner — 2026-11-01

Kart: YTN-25 (YETENEK panosu). Emir: OPS, 1 Kasım (YTN-3 sonucu). Yazan: YETENEK.

## KAYNAK / CETVEL

- Önceki ölçüm: `skill-kullanim-sayimi-2026-11-01.md` (YTN-3: bir ayda iki skill de 0 çağrı; 78 `security-reviewer`
  açılışı). Set verisi ve kural: `skill-departman-setleri-2026-09-30.json` (`kural.onYuklemeButceKB` = 35,
  `enFazlaOnYukle` = 8). Kapı: `src/__tests__/conformance/skill-bagli.test.ts` (kb diskle %20 içinde).
- Önceki iş: HRT-82 (#2123) `security-reviewer` ajanına 14-16. maddeleri ekledi.
- Tazelik: kb değerleri 1 Kasım'da diskten okundu (bug-hunter 16,0 KB, security-scanner 9,9 KB).

## 1. Bütçe: hangi sete sığar

Her çürütücü setine bug-hunter, her doğrulayıcı setine security-scanner eklendiğinde ön yükleme toplamı:

| Set türü | Sığan (≤ 35 KB) | Sığmayan |
|---|---|---|
| Çürütücü + bug-hunter (16,0) | BLOG, HARİTA, MEVZUAT, OPS, YETENEK, 3D (33,3) | ADMIN, ALTYAPI, EDGE, KATALOG, SATIŞ, ÜRÜN (47,7); ARAÇ, GEO-SEO, I18N (46,2); TASARIM (37,3) |
| Doğrulayıcı + security-scanner (9,9) | BLOG, HARİTA, MEVZUAT, OPS, YETENEK (22,4); 3D (34,8) | ADMIN, ÜRÜN (44,8); ALTYAPI, ARAÇ, EDGE, GEO-SEO, KATALOG (39,3); SATIŞ (43,2); TASARIM (40,8); I18N (36,6) |

**Sonuç:** iki skill de yalnız kod yazmayan departmanların setlerine sığıyor; kusur avı ve güvenlik taramasının asıl
gerektiği kod departmanlarının hepsinde bütçe aşılıyor. Sığdırmak için kod çürütücüsünden `supabase-security` (14,4 KB)
ya da `plan-challenger` (17,3 KB) çıkarmak gerekir; ikisi de o setlerin asıl işi, çıkarılmaları önerilmez.

## 2. Örtüşme: security-scanner ile security-reviewer

| Konu | security-scanner (skill) | security-reviewer (ajan, 78 açılış) |
|---|---|---|
| Webhook HMAC + replay guard | Var (VentHub ek kuralı 2) | Var (madde 3) |
| Tenant izolasyonu, RLS | Var (ek kural 2) | Var (madde 1, 2, 15) |
| Sır, public repo, maskeleme | Var (ek kural 1, 3) | Var (madde 7, 14) |
| Yanlış alarmı ayırma, kendi aleyhine okuma | Var (YTN-24 eki madde 1) | Var (madde 16) |
| Bağımlılık açığı, lockfile | Var (kural 5) | Var (madde 12) |
| Güven sınırı haritası | Var (kural 1) | Var (madde 9, STRIDE) |
| Doğrulanan kusurun ailesini depoda arama | Var (YTN-24 eki madde 2) | **Yok** |

**Sonuç:** security-reviewer, security-scanner'ın VentHub'a özel içeriğini neredeyse tamamen kapsıyor ve gerçekten
kullanılan kanal o. security-scanner'ı doğrulayıcıya ön yüklemek aynı kontrolü ikinci kez taşır. Tek fark "doğrulanan
kusurun aynı örüntüsünü depoda ara" maddesi.

## Öneri (karar OPS'ta)

1. **Ön yükleme değişikliği yok.** bug-hunter ve security-scanner kod departmanlarında adıyla çağır olarak kalır; ajan
   tanımı PR'ı açılmaz.
2. security-reviewer'a tek madde eklenmesi önerilir: doğrulanan kusurun kök nedenini tek cümleyle yaz, aynı örüntüyü
   depoda ara, kardeşleri ayrı bulgu yaz. Ajan tanımı HARİTA'nın alanı; metin OPS'a gider, OPS HARİTA'ya verir.
3. Sığan setlere (kod yazmayan departmanlar) eklemek bütçeye sığar ama iş getirmez: bu departmanlarda kusur avı ve
   güvenlik taraması gerektiren kod işi yok; eklenmez.
