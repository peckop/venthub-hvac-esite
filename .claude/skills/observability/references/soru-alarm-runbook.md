# Observability: soru-önce, giriş noktası, alarm, runbook, doğrulama (YTN-21)

> Kaynak: addyosmani/agent-skills observability-and-instrumentation @f3400940f6961e68fa56bdb6214d0183d8d8ae49 (MIT); VentHub'a uyarlandı, 26 Ekim 2026, YTN-21.
> Gözlem yığınımız **Sentry + Vercel logları**; OpenTelemetry, Express ara katmanı ya da Prometheus istemcisi
> eklenmez. KVKK gereği kişisel veri (e-posta, telefon, adres, kart) log ve Sentry olayına girmez; alan
> izin listesiyle yazılır, bütün istek gövdesi loglanmaz.

**1. Önce soru, sonra ölçüm.** Bir özelliğe telemetri eklemeden önce nöbetçinin soracağı 2-4 soruyu yaz:

```
ÖZELLİK: İyzico ödeme tekrar denemesi
NÖBETÇİ ŞUNLARI SORAR:
1. Ödeme ilk denemede mi, tekrarda mı geçiyor?
2. Kalıcı başarısızlıkta sebep ne (sağlayıcı hatası, zaman aşımı, doğrulama)?
3. Sağlayıcı bugün her zamankinden yavaş mı?
→ Eklenen her sinyal bu sorulardan birine cevap verir.
```

Soruyu adlandıramıyorsan henüz ölçüm eklemeye hazır değilsin: her şeyi loglarsın, hiçbir şey öğrenmezsin.

**2. Giriş noktasını adlandır.** Aynı iş birden çok yoldan başlıyorsa (zamanlanmış cron, webhook, Edge Function,
yönetici elle tetiklemesi) bir log satırı hangi yoldan geldiğini söylemez; satırı sahiplenmek için sonradan
zamanlayıcı geçmişi ve dağıtım kaydı karşılaştırmak gerekir ve o kayıtlar her zaman durmaz. Koşunun başladığı yerde
korelasyon kimliğinin yanına `entryPoint` alanı (ör. `cron`, `webhook`, `edge`, `admin`) yaz ve kimlikle aynı
sınırlardan geçir (kuyruk/HTTP başlığı). Yalnızca giriş noktasıyla ilişkili görünen bir alan kanıt değil ipucudur.

**3. Alarm kuralları.** Kullanıcının hissettiği **belirtiye** alarm kur, nedene değil (hata oranı, gecikme, sipariş/webhook
kuyruğunun yaşı; CPU yüzdesi değil). Her alarm: (a) eyleme dönüktür; "kendiliğinden geçer" ise sil, (b) runbook'a bağlanır,
(c) eşiği ve süresi SLO ya da geçmiş veriyle gerekçelidir, tahminle değil, (d) yalnız iki şiddet: **sayfa** (kullanıcıyı
etkiliyor, hemen) ve **kart** (bozulma, bu hafta). Üçüncü seviye gürültüdür.

**4. Runbook asgarisi (üç satır).** Alarmın adıyla dosya; konumu mevcut bir runbook dizini yoksa kart planında karar verilir
(yeni dizin açmak ayrı karar).

```markdown
# Runbook: /api/... yüksek hata oranı
**Anlamı:** DB bağlantı havuzu dolmuş olabilir ya da kötü bir dağıtım.
**İlk bakılacak:** <tek sorgu ya da Sentry sorgusu>
**Yükselt:** <kime>
```

Adım eklemek yalnız ilk kontrol karar vermeye yetmiyorsa gerekir; üç yaygın nedeni kapsayan beş adım, her kenarı sayan
yirmi adımdan iyidir. Runbook, kullanıldığı olayın kapanışında güncellenir; bayat runbook yanlış güven üretir.

**5. Telemetrinin kendisini doğrula.** Ölçüm de koddur ve yanlış olabilir. "Bitti" demeden yolları tetikle ve gerçek çıktıya bak:
bilinçli bir hata üret ve Sentry/Vercel logunda `requestId` ile bul (alanlar yapılandırılmış mı, `[object Object]` değil mi);
yeni alarmı bir kez ateşle (eşiği geçici düşürerek) ve doğru kanala ulaştığını, runbook bağlantısının açıldığını gör.
Kişisel veri sızmadığını aynı bakışta kontrol et. Canlı kanala yazan bir tetikleme gerekiyorsa önce Recep'in sözü gerekir.

