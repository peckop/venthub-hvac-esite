# Mockup Geliştirme Hattı Standardı

**Sahip:** OPS-AUDIT · **Kaynak karar:** Recep, 2026-08-25 ("bir geliştirme hattı lazım bize:
ne vardı, ne eklendi, ne konulmadı — hem süreci takip ederiz hem canlı için formatı belirlemiş oluruz")
**Doğuran kusur (ölçüldü):** v3'te ses/varyant/teknik-tablo sessizce düştü; v4'te Lineo ürün
kimliği uydurma "VH KF" adlarıyla değişti ve sepete-ekle düğmesi durumla etiket değiştirdiği
için "kaldırılmış" algısı yarattı. Üçü de aynı sınıf: **sürümler arası sessiz kayıp.**

## 1. Sürüm Defteri (zorunlu)

Her mockup yayını bir sürüm defteri satırı taşır: **özellik envanteri** biçiminde
`ÖZELLİK → YENİ / VAR / DEĞİŞTİ(gerekçe) / DÜŞTÜ(gerekçe + onay)`.

- Defter iki yerde yaşar: (a) mockup sayfasının altında görünür blok (Recep süreci sayfadan
  izler), (b) ilgili Linear kaydında (kalıcı iz).
- **Hiçbir özellik sessizce düşmez.** Düşürme ancak gerekçe + Recep onayı ile olur; "yalın
  konsept kanıtı" gibi amaç daraltmaları bile defterde "DÜŞTÜ (bilinçli, geri gelecek)" satırı ister.
- Yeni sürüm çizilirken önceki sürümün envanteri **ölçülerek** (dosyadan grep/inceleme,
  hatırdan DEĞİL) devralınır — kayıp iddiası da, tamlık iddiası da ölçümle yapılır.

## 2. Yayın öncesi kapılar (her sürümde)

1. **Syntax:** betikler `new Function` ile derlenir (akıllı-tırnak sınıfı ölümleri yakalar).
2. **Referans bütünlüğü:** her `getElementById` kimliği sayfada mevcut olmalı.
3. **Tema:** üç durum (açık / koyu / sistem) token düzeyinde tanımlı.
4. **Gerçek ürün kimliği:** model adları katalogdan (ör. Vortice Lineo Q); uydurma model adı
   YASAK. Değerler katalogtan değilse rozette açıkça "temsilî" yazar.
5. **Standart rozeti:** her hesap bloğu dayandığı standardı gösterir (EN 16798-1, ISO 5801,
   ISO 27327-1...); kaynağı olmayan sabit ekranda görünmez.
6. **Kalıcı eylemler sabit görünür:** sepete ekle / teklife çevir gibi ana eylemler durumla
   ETİKET değiştirmez; kilitli durum ipucu metni + görsel kilitle anlatılır.

## 3. Süreç döngüsü

fikir → taslak → **Recep turu** → geri bildirim envantere işlenir → v+1.
Recep'in her geri bildirim kalemi ya uygulanır ya da gerekçeli "yapılmadı" satırı alır —
açık uçlu kalem bırakılmaz (her girdiye kapanış).

## 4. Canlıya geçiş

Onaylanan son sürümün envanteri = canlı sayfanın **kabul listesi** (format sözleşmesi).
Canlı uygulama PR'ı bu listeyi referans verir; listedeki her özellik ya canlıda vardır ya da
gerekçeli sapma satırı taşır. Böylece mockup hattı, tasarımdan canlıya ölçülebilir tek çizgidir.

## Ek: v1→v5 envanteri (ilk uygulama, 2026-08-25 ölçümü)

| Sürüm | Yeni | Düşen/Kusur |
|---|---|---|
| v1 Konuşan Ürün Sayfası | Lineo Q kimliği, oda yeterlilik hesabı, varyantlar, teknik özellikler | — |
| v2 Canlı Ürün Sayfası | mekan kartları, ihtiyaç çizgisi, devir/fan kanunları, hüküm kutusu, ses dinleme | — |
| v3 Tek Şablon | kompakt grup seçici, iki giriş yolu, standart rozetleri, hükümlü sepet, kapı modülü | DÜŞTÜ (kusur): ses, varyant, teknik tablo |
| v4 | ses A/B, varyant, teknik tablo geri; kişi başı taze hava; perde pro derinliği | KUSUR: Lineo→"VH KF" kimlik kaybı; sepete-ekle etiketi durumla değişti |
| v5 | Lineo kimliği geri; ana eylemler sabit; sürüm defteri sayfada | — |
