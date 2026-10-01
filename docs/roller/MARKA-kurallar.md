# KURALLAR: MARKA

> Üretilmiştir (`scripts/belge/rol-karti-uret.cjs`); elle düzenleme. Rol kartı: `docs/roller/MARKA.md`. K = tam listedeki madde no; gerekçeli tam metin: `docs/standards/gelistirme-kurallari-tam-liste.md`.

- K1 Plan önce: Değişiklikten önce plan çıkar, onay al; plan kendisini hangi cetvelin yönettiğini söyler (dosya adı ya da açıkça "cetvel yok").
- K10 Design token: Arbitrary Tailwind değeri yasak; değerler `tokens.js`'ten, renk HEX değil CSS custom property (HSL).
- K12 focus-visible: Etkileşimli elemanlarda `focus:` değil `focus-visible:`.
- K13 Typography prose: Yasal ve bilgi merkezi metin sayfalarında `prose dark:prose-invert max-w-prose` sarmalayıcısı.

## Recep'e mesaj kuralları (ayrıntı; yöneten metin `~/.claude/output-styles/recep.md`)
- Durum mesajı TEK TABLO: `| No: Kanban numarası · karar no | İş | Durum | Önerim | Sorumlu | Sırada |`; onay bekleyenler en üst satırlardır, ayrı tablo yok. Recep'e giden durum cevabı tek tablodur.
- (OPS hariç) tabloya yalnız KENDİ kartların girer; çok departmanlı genel resmi OPS verir; çok elzemse tablo dışında tek cümle hatırlat.
- (OPS hariç) Başka pencereden (OPS dahil) gelen mesajla açılan turda cevap o pencereye SendMessage ile gider, Recep'e ANLATILMAZ; Recep'e görünen metin tek cümle, yalnız kendi kartın (değişen yoksa tablo yok). OPS Recep'e filo durumunu konsolide tabloyla kendisi verir.
- (OPS hariç) Değişen yoksa tablo yok: Recep "devam et" dediğinde ya da durum sorduğunda son rapordan beri kartında değişen yoksa cevap TEK cümledir; bekleyen kartlar her cevapta yeniden dökülmez, tabloya yalnız durumu değişen ya da Recep'in adıyla sorduğu kart girer. İşi kalmayan departman bunu Recep'e değil OPS'a yazar. Recep başka bir departmanı ya da genel durumu sorarsa cevap tek cümle: "Bunu OPS'a iletiyorum, OPS sana toplu durumu verecek".
- İşin başkasını bekliyorsa yalnız "başka bir departmanın işini bekliyor" yaz (adı/işi/sırası yok); Sorumlu = "ben" (OPS hariç).
- Durum sütunu yalnız şu yedi kelimeden biri: Kırmızı · Onayında · Sürüyor · Sırada · Başlamadı · Beklemede · Bitti. "Bitti" yalnız ölçülmüş işe; "Onayında" yalnız Recep kararı bekleyen iştir (OPS onayı verilmiş, kontrol bekleyen iş "Sürüyor"). Kaydı olmayan iş satıra yazılmaz, önce Kanban kartı açılır.
- Elzem hatırlatma: canlıyı etkileyen ya da Recep'in hemen bilmesi gereken çok elzem durumda tablonun DIŞINDA tek cümle yazılır, ayrıntı karttadır. Tur sonunda "devam edeyim mi" sorma, sırası belli işe geç; tıkanırsan OPS'a yaz.
- 2+ kalem madde işaretli liste olur (tablo dışında, cümle içinde (a) (b) şık dizilmez).
- Compact hazırlığı ("COMPACT YAKIN" uyarısında, compact yapılana kadar her cevapta): cevabın sonuna 3 maddelik liste (durum dosyam güncel mi + dosya adı/saat, yarım iş var mı, hüküm "Şimdi compact yapabilirsin" ya da "X bitince söyleyeceğim"); altına tek kod bloğunda kopyalanabilir `/compact Recep'in son sözlerini aynen koru. Şunları koru: <numara (durum)>, ..., yarım işler (<kısa adlar>). Ayrıntı durum dosyamda. Araç çıktılarını ve eski ölçüm ayrıntılarını at.` satırı.
