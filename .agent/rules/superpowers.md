# Superpowers Kuralları (Her Zaman Açık)

Bu kurallar, kullanıcı aksini belirtmedikçe TÜM çalışmalar için geçerlidir.

## 1) Karmaşık İşler İçin Planlama Kapısı (Plan Gate)
Görev küçük bir değişiklikten fazlasını içeriyorsa, ASLA doğrudan kod yazmaya başlama.
Şunları yapmalısın:
1) Kısaca beyin fırtınası yap (hedef, kısıtlamalar, riskler, kabul kriterleri)
2) Doğrulama adımlarını içeren adım adım bir plan yaz
3) Kullanıcıdan planı onaylamasını iste
Yalnızca onaydan sonra uygulamaya geçebilirsin.

### Plan Uygulama Kapısı (Execute-plan gate)
Kullanıcı planı onayladıktan sonra, uygulamaya otomatik olarak BAŞLAMA.
Durmalı ve kullanıcıya şu komutu çalıştırmasını söylemelisin: `/superpowers-execute-plan`

Uygulamaya yalnızca `/superpowers-execute-plan` çağrıldıktan sonra başla (kullanıcı aksini belirtmedikçe).

### Ne "küçük" sayılır?
- Tek dosyalık değişiklik
- Bariz düzenleme
- Düşük risk
Bu durumlarda bile: mini bir plan (3–5 adım) yap ve doğrulamayı dahil et.

## 2) Doğrulama Zorunludur
Uygulamadan sonra şunları sağlamalısın:
- Doğrulamak için tam komutlar (test/lint/run)
- Eğer çalıştırabildiysen sonuçlar

## 3) TDD / Regresyon Testleri Tercih Edilir
- Bir hata düzeltiliyorsa: pratikse bir regresyon testi ekle
- Yeni bir davranış ekleniyorsa: pratikse test ekle/düzenle
Testler mümkün değilse, somut bir alternatif doğrulama yolu sağla.

## 4) Gözden Geçirme Şartı
Final cevabından önce, bir gözden geçirme (review) yap ve sorunları önem derecesine göre listele:
- Blocker (Engelleyici) / Major (Kritik) / Minor (İkincil) / Nit (Küçük/Görsel)

## 5) Güvenlik
- Asla gizli bilgileri (secret) loglama
- API otomasyonları için zaman aşımı, deneme ve idempotency ekle
- Güvenli hata (Fail safe) uygula (sessiz veri kaybı olmasın)

## Kalıcılık (Zorunlu)
Herhangi bir beyin fırtınası, plan, inceleme veya bitiriş çıktısı şu dizin altına yazılmalıdır:
`artifacts/superpowers/`

Bunları sadece chat içinde veya IDE dokümanı olarak bırakma. Yazdıktan sonra dosyanın varlığını teyit et.

## Kalıcılık Zorunlaması
Bir iş akışı `artifacts/superpowers/` altına bir çıktı kaydedilmesini gerektiriyorsa, dosyanın diskte olduğundan emin olmalısın.
Tercih edilen yöntem: `python .agent/skills/superpowers-workflow/scripts/write_artifact.py --path <...>` kullanmaktır.
Komut çalıştıramıyorsan, kullanıcıya çıktıyı manuel kaydetmesi için talimat ver.
