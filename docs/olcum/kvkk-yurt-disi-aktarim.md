# Ölçüm defteri: KVKK yurt dışı aktarım ve veri yerleşimi

Sahibi: OPS · Son doğrulama: 2026-11-25 · Kart: OPS-394
Son ölçüm: 2026-11-25 (OPS araştırmacısı; resmî sayfalar ham indirildi). Hukuki son söz avukat/mali müşavir.

## Kural (KVKK m.9, 7499 s. Kanun)
| Konu | Bulgu |
|---|---|
| Yürürlük | m.9 01.06.2024; eski rızalı aktarım 01.09.2024'te bitti. Yönetmelik RG 10.07.2024 (32598) |
| Yeterlilik kararı | Yok (AB/Almanya dahil), kvkk.gov.tr 2026-11-25 |
| Sürekli aktarım | Standart sözleşme (4 tür), metin değiştirilemez, Türkçe, imzadan sonra 5 iş günü içinde Kurum'a bildirim; BCR ve taahhütname Kurul izinli |
| Arızi/rıza | Yalnız düzensiz, tek-birkaç sefer; sürekli barındırma arızi sayılmaz |
| Bulut | Rehber No:48 (Ocak 2025): yurt dışı bulutta depolama aktarımdır |
| Ceza (2026) | Bildirimsizlik 90.308–1.806.177 TL; veri güvenliği 256.357–17.092.242 TL |
Kaynak: kvkk.gov.tr/Icerik/2053, /8170, /8043, /8145; resmigazete 20240710-2; mevzuat.gov.tr 1.5.6698.

## Sağlayıcılar (DPA, 2026-11-25)
Supabase (DPA 1 Ağu 2026), DigitalOcean (14 Eki 2026), Cloudflare (6.4, 3 Nis 2026): yalnız AB SCC/UK/DPF; Türkiye/KVKK anılmıyor. İmzalayıp imzalamayacakları yazılı sorulmadı.

## Dış servisler (depo okuması)
Supabase (tüm müşteri verisi, Frankfurt) · DO+Coolify (Frankfurt) · Cloudflare (DNS, gelen e-posta, R2 yalnız ürün görseli) · Resend (e-posta, ad, adres, sipariş; ABD) · Twilio (telefon, mesaj; ABD, doğrulanmadı) · Sentry (bölge ölçülmedi) · iyzico (Türk, doğrulanmadı) · GA4 (rızalı) · Google Drive (şifreli DB yedeği) · Anthropic (uygulamada çağrı yok).

## Türkiye'de barındırma (fiyat 2026-11-25)
Natro XCloud TR 8 GB ₺1.518/ay (indirimli) · Turhost VDS TR 8 GB $24,99 → $72,79 (İstanbul) · Radore Cloud 8 GB $29,5 (İstanbul) · Turkcell/TT/Bulutistan teklifle. Supabase self-host: en az 4 GB, önerilen 8 GB+. Tuzak: Natro "Sanal Sunucu" ve Turhost "VPS Plus" Hollanda'da. Docker/KVM satıştan teyit edilmeli.

## Hüküm (2026-11-25, Recep kararı bekliyor)
Seçenek A: yurt dışında kal, her işleyenle standart sözleşme + bildirim (sağlayıcılar imzalamayabilir). Seçenek B: veri Türkiye'de (self-host Supabase + Coolify), e-posta/SMS için Türk sağlayıcı ya da sözleşme. OPS önerisi B, Design canlı taşımasıyla birlikte.
## Ölçülmedi
Sağlayıcı imza kararları; Sentry bölgesi; Twilio/iyzico konumu; e-fatura/e-defter yurt içi saklama (VUK 509 resmî metni); aydınlatma metni.
## Yeniden ölçme tetikleyicisi
Kurul yeterlilik kararı; sağlayıcı cevabı; barındırma kararı.
