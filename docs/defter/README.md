# Departman defteri — "bu alanda ne yaptık, elimizde ne var, sırada ne var?" sorusunun cevabı

Sahibi: HARİTA (biçim); her defterin içeriğinin sahibi o departmandır · Son doğrulama: 2026-11-08 · Kaynak: OPS-254 (Recep isteği, 8 Kasım)

Kanban işin durumunu tutar; Kanban'da yaşamayan şeyi, yani bir departmanın **alanının haritasını**, bu defter tutar. Her
departman için tek dosya: `docs/defter/<departman>.md` (küçük harf: `blog.md`, `katalog.md`, `geo-seo.md`). Hafif tutulur:
kanca ya da kapı yoktur, kural aşağıdaki iki cümledir. Ölçüm defterleriyle (`docs/olcum/README.md`, "bu konu ölçüldü mü")
karıştırılmaz: oradaki konu başına tek ölçümdür, buradaki departman başına alan haritasıdır.

## Kural

1. **Kart Done olurken defter güncellenir:** işin bir satırı (1) bölümüne gider, envanteri değiştiyse (2) bölümü, açtığı
   yeni iş ya da kapattığı madde (3) bölümünü, bir karar çıktıysa (4) bölümünü günceller. Kartın kapanış notu "defter
   güncellendi" der.
2. **Yeni iş ya da emir önce deftere bakar:** emrin `ÖNCEKİ ÇALIŞMA:` satırı defteri anar (ne kapsıyor, ne kalıyor).
   Defterde olan şey yeniden kurulmaz; defter bayatsa önce o düzeltilir.

## Biçim (dört sabit bölüm, bu sırayla)

| Bölüm | İçerik |
|---|---|
| 1. Ne yaptık | Geriye dönük: iş, neden, sonuç, kart no. Yeni satır en üste. |
| 2. Envanter | Departmanın alanı, bir tablo ya da liste. Sütunları departman seçer (Blog: yazı × konu × mevzuat kalemleri × ürün ailesi × arama/sıra). Her satırda son doğrulama tarihi. |
| 3. Sırada ve yapılabilecekler | Her madde: gerekçe + öncelik (yüksek/orta/düşük) + varsa kart no. Karta dönüşen madde kart no alır, yapılan madde (1)'e taşınır. |
| 4. Kararlar | Tarih + karar no + tek cümle. Karar sahibi Recep ya da OPS olduğunda kimin verdiği yazılır; söz tırnaklanmaz (depo herkese açık). |

Başlığın altına `Sahibi:` ve `Son doğrulama:` satırı konur; 14 günü aşan "Son doğrulama" belge-tazelik ölçümüne düşer.
Arama verisi (sorgu, sıra, tıklama) deftere yazılmaz; ölçümün durduğu yere işaret edilir.

## Defterler

| Defter | Durum |
|---|---|
| blog.md | Boş şablon; pilot içeriği BLOG dolduracak |
