# Kanca satırları istem önbelleğini bozuyor mu — ölçüm (ARC-133)

Sahibi: ARAÇ · Kart: ARC-133 (OPS emri 14 Ekim, karar 363 sırası madde 6) · Ölçüm: 2026-11-07, salt okuma (arac-arastirmaci, oturum kayıtları taraması) · Hüküm: **bozmuyor (bu veride)**.

## 1. Soru

Her kullanıcı mesajında UserPromptSubmit kancaları bağlama satır ekler (BAGLAM sayısı, saat, hafıza yedeği gibi her turda değişen metin; 7 Kasım 17:28'den beri ayrıca sabit "SÖZ KURALI" satırı). Bu satırlar Claude Code'un istem önbelleğini (cache) bozup her mesajda önekin yeniden ödenmesine yol açıyor mu?

## 2. Yöntem ve kapsam

- Kaynak: `C:\Users\alize\.claude\projects` altında son 7 günün 5-300 MB arası üst düzey oturum kayıtları: **14 dosya**, 30.787 assistant çağrısı (`message.id` ile tekilleştirildi), 30.692 ardışık çift.
- Ölçü: ardışık iki çağrıda `r = cache_read(B) / (cache_read(A) + cache_creation(A))`. `r ≈ 1` önek korunmuş, düşük `r` önbellek kaçırmış demektir.
- Sınıflama: boşluk süresi (5 dk altı, 5 dk-1 saat, 1 saat üstü), compact sonrası, model değişimi, kullanıcı istemi ilk çağrısı ve kancanın o turda varlığı.
- Sınır: `usage` alanları sunucu önbelleğini **dolaylı** gösterir; bu belge korelasyon verir, nedensellik iddia etmez.

## 3. Sonuçlar

| Ölçü | Değer |
|---|---|
| Medyan r | **1,0000** |
| r < 0,9 olan çift | 499 (%1,6) |
| r < 0,9, boşluk < 5 dk | 9 / 29.561 (%0,03) |
| r < 0,9, compact sonrası | 243 / 245 (medyan r 0,097) |
| r < 0,9, boşluk > 1 saat | 159 / 161 (medyan r 0,086) |
| r < 0,9, model değişimi | 76 / 76 (cache_read 0) |
| r < 0,9, boşluk 5 dk-1 saat | 12 / 649 (%1,8, sınıflanmadı) |
| Kullanıcı istemi ilk çağrısı, 5 dk altı, **kanca VAR** | 1 / 916 düşük (%0,1) |
| Aynısı, **kanca YOK** | 0 / 121 düşük |
| Araç sonucu sonrası çağrılar (5 dk altı) | 5 / 26.437 düşük |

**Okuma:** önbellek kaçırmaların 499'unun 402'si compact sonrası ve 1 saatten uzun boşluklarda (TTL aşımı); 76'sı model değişimi. Kanca satırı taşıyan turların ilk çağrısında kırılma görülmedi (916 çağrıda 1).

## 4. Kanca baytları

- 7.880 kullanıcı isteminin 5.211'inde (%66) kanca çıktısı var. Tur başına medyan **1.169 bayt** (UTF-8).
- Kayıtta iki tür var: `hook_additional_context` (9.806 kayıt) ve `hook_success` (10.156 kayıt). İkisi **ayrı** metin taşıyor (örn. karar defteri satırı yalnız `hook_success`'te). Toplamın modele tam girdiği kayıttan kesin değil; sayı **üst sınır** olarak okunmalı.
- Yeni içerik payı: kanca olan istem turlarında medyan `cache_creation` 1.500 (yeni içerik 1.177), kanca olmayanlarda 702 (510). Fark kanca etkisi mi tur bileşimi mi **ayrıştırılamadı**.

## 5. SÖZ KURALI satırı (ARC-58)

- Yalnız arac-pencere oturumunda 10 `hook_success` kaydı; ilk 17:28, son 18:14 (İstanbul). Satır 174 bayt ölçüldü (belge ve envanterde 175 yazıyor, 1 bayt fark).
- Öncesi/sonrası oran karşılaştırması için veri **yetersiz** (sonrası kanca+istem çifti 14, satırı taşıyan tur 1 çift). **Ölçülemedi.**

## 6. Hüküm ve öneri

- **Kanca satırları önbelleği bozuyor mu: HAYIR (bu veride).** Bozulma compact ve 1 saatten uzun boşluk sonrasında yoğunlaşıyor; kanca varlığıyla ilişkili kırılma görülmedi.
- Önbellek için kanca değişikliği **gerekmiyor**.
- Asıl maliyet kaynağı compact ve uzun boşluklar. Bu bir karar konusudur (ör. compact eşiği, boşluk davranışı); ayrı karta alınmadan uygulanmaz.
- Kanca baytının **token** karşılığı ölçülmedi (token sayımı yok).

## 7. Yeniden ölçme tetikleyicisi

SÖZ KURALI satırı için ≥1 haftalık veri birikince öncesi/sonrası oranı tekrar ölçülür; yeni bir UserPromptSubmit kancası eklenirse ya da tur başına kanca baytı 2.000'i aşarsa; Claude Code sürümü değişirse.
