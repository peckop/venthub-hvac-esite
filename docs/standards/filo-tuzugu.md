# Filo Tüzüğü (v0.1 — 2026-10-16)

> **Ne yönetir:** Filonun organları ve yetkileri (kim neye karar verir), departman açma ve kapama, vekâlet, eskalasyon,
> haftalık ritim, karne ve rol kartı alanlarının zorunlu altılısı (5N1K).
> **Niçin var:** OPS-169 (Recep isteği, 16 Ekim 2026). Yetki, onay yolu ve ritim bilgisi beş ayrı cetvele ve rol kartlarına
> dağılmıştı; eskalasyon, açma/kapama ve vekâlet hiçbirinde yazılı değildi. Bu tüzük var olanı TEKRAR ETMEZ, işaret eder;
> yalnız boş olanı kendisi yazar.
> **Sahibi:** OPS (metin ve hüküm). HARİTA yalnız belge düzenini, rol kartı üreticisini ve testi tutar.
> **Üstünlük sırası:** Recep sözü ve CLAUDE.md Mutlak Kurallar > bu tüzük > cetveller. Tüzükle çelişen cetvel sahibine kart
> olarak bildirilir ve SAHİBİ düzeltir; tüzük başkasının cetvelini değiştirmez.
> **Durum:** v0.1. Taslak OPS çürütmesinden geçti. Tetiği kurulmamış görevler "bağlı: hayır" yazılır.
>
> **Kaynak/cetvel:** `execution-method-standard.md` §10.1 (organ ve rol tablosu), `fleet-mechanism-standard.md` §17 madde 4 ve
> §18 (onay yolu, izin), `is-kayit-duzeni-standard.md` §2 ve RECEP YETKİSİ, `duzenli-gorevler-standard.md`,
> `docs/roller/DEPARTMAN-HARITASI.md`, `scripts/board/kanban-uyum.cjs` (karne ölçümü).

---

## Madde 1 — Organlar

Tanım: `execution-method-standard.md` §10.1. Özet: Recep sahip ve tek karar verici; OPS genel müdür (sıra, öncelik, karar
numarası, Recep'e tek yüz; departman işini kendi eliyle yürütmez, kod yazmaz); departman müdürü kendi alanının sahibi;
çalışan alt ajan, sonucu yalnız açana döner.

## Madde 2 — Yetki matrisi

**2.1 Recep kapıları (DARALTILMAZ).** `docs/roller/OPS.md` "Recep kapıları" bölümündeki beş madde aynen geçerlidir: migration,
canlı veritabanı yazımı, sır/anahtar/parola yazmak, geçmişi silen ya da zorlayan git komutu, para harcatan her şey (ücretli plan,
servis, satın alma). Ek olarak Recep sözü isteyenler: edge fonksiyonlu PR birleştirme (karar 98/224), Recep adına dış kişiye
yazışma (`is-kayit-duzeni-standard.md` RECEP YETKİSİ), ürün kararları (menü yeri, adres şeması, fiyat, yeni iddia ya da
görünüm, yayın), departman açma ve kapama (Madde 4).

**2.2 İzin, ayar, hesap, MCP.** allow/ask/deny satırı, izin modu, onay veren kanca, `.mcp.json`, hesap ve kimlik değişikliği
Recep'in OPS penceresindeki sözüyle yapılır; uygulamayı OPS yapar ya da ARAÇ PR açar ve OPS tam farkı okur
(`.claude/rules/filo-ortak.md` "Onay nerede verilir", `fleet-mechanism-standard.md` §17 madde 4). deny listesi gevşetilmez
(`fleet-mechanism-standard.md` §18).

**2.3 OPS onayıyla yürüyen.** Kanca tasarımı ve kurulumu (izin vermeyen, kapıyı gevşetmeyen), izin içermeyen ayar, departman
iyileştirme önerisi, kural metni (Recep kapısı metni hariç), sıra ve öncelik, departmanlar arası anlaşmazlık, karar numarası
verme (her sayısal iddianın kaynağı karar kartında).
- **Sınır:** bir kapıyı, kancayı, izin kuralını ya da Recep kapısı metnini GEVŞETEN öneri OPS onayıyla geçmez, 2.2 yolundan
  Recep'e gider. Kapıyı SIKILAŞTIRAN öneri OPS onayıyla geçer.
- **Günlük iş (Recep 16 Ekim):** günlük işte Recep'e soru sorulmaz; Madde 2.1'deki beş Recep kapısı (`docs/roller/OPS.md`
  "Recep kapıları") ve izin genişletme dışındaki her onay OPS'a gelir.
  Otomatik güvenlik kontrolü bir işi reddederse ret metni OPS'a yazılır; Recep'e "şu pencereye şunu yaz" denmez, OPS kalıcı
  kuralı (`autoMode.allow`) önerir. Satır her rolün kurallar dosyasındadır (`scripts/belge/rol-karti-uret.cjs`, birleştirme bloğu).

**2.4 Departman müdürü.** Kendi alanındaki yöntem, çalışan açma, kendi PR'ını ritüelle birleştirme (kanca/ayar PR'ında önce OPS
"okundu, uygun"; OPS'un kendi kanca/ayar PR'ını ARAÇ okur).

**2.5 Kanca.** ARAÇ tasarlar ve kurar; HARİTA yalnız kural ve belge metnini yazar.

## Madde 3 — 5N1K

Her rol kartında altı alan zorunludur:

| Alan | Kartta nerede |
|---|---|
| **Kim** | müdür pencere (kartın başlığı) |
| **Ne** | Görev |
| **Ne zaman** | düzenli görev ve tetik (`scripts/belge/rol-gorevleri.json`) |
| **Nerede** | Dosyalar satırı |
| **Nasıl** | `docs/standards/` altından en az bir cetvel adı ya da "cetvel yok — yazımı kapsamda" |
| **Neden** | Amaç |

- Kartta yer yoksa (kart bayt sınırı gevşetilmez) alan `<ROL>-gorevler.md` dosyasında durur, kart ona işaret eder.
- Kartı "Kapalı" ya da penceresi hiç açılmamış departmanın boş alanı "taslak" işaretiyle kapıdan muaftır; ilk açılışta ilk iş
  doldurmaktır. Muafiyet `TASLAK_ROLLERI` listesindedir (`scripts/belge/rol-karti-uret.cjs`, her satırda neden yazılı); sahibi
  doldurunca satır listeden silinir, kapı ikisini birden tutmaya izin vermez. Amaç ve Nasıl kartta yer yoksa
  `<ROL>-gorevler.md` dosyasında durur.
- "Ne zaman" alanına yalnız `rol-gorevleri.json`'daki görev ya da "yeni görev, bağlı: hayır (kuracak: ROL)" yazılır; bir görev
  tek sahiplidir.

## Madde 4 — Departman açma, kapama, pencere

- **Departman açık/kapalı** rol kartının Durum satırıdır. **Pencere açık/kapalı** ajan dosyası ve çalışan oturumdur. Pencere
  kapatmak (bellek) departmanı kapatmak değildir.
- Departman faaliyetsizlikle kapanmaz; değerlendirme asli göreve göre yapılır, iş azlığı kapama gerekçesi değildir.
- Açma/kapama önerisini OPS getirir: geçiş planı (worktree, ajan tanımı, rol kartı 5N1K, ilk iş kartı) ve bellek bedeli. Karar
  Recep'indir. "Hazırlık" adına bile önce plan sırası ve Recep kararı.
- Geçici iş oturumu (departman değil, OPS işi) OPS açabilir; aynı mesajda Recep'e ne için açıldığı ve ne zaman kapanacağı yazılır,
  iş bitince kapanır.

## Madde 5 — Vekâlet: pencere kapalıyken

- Kapalı departmanın işi OPS'a gelir; OPS işi SAHİBİNİN panosuna kart açar ve gerekiyorsa departmanın açılmasını Recep'e önerir.
  OPS kapalı departmanın işini kendisi ya da alt ajanla YAPMAZ; yalnız ölçer ve raporlar (kapı eylemi devredilmez,
  `execution-method-standard.md` §10.4).
- Kapalı pencereye mesaj posta kutusuyla gider (tam oturum kimliği); açılışta ilk iş okumaktır.
- İki pencere farklı izin modundaysa doğrudan mesaj bekletilip düşebilir; o durumda posta kutusu kullanılır. İzin modunu
  değiştirmek ya da eşitlemek Recep kararıdır; tüzük emretmez.

## Madde 6 — Eskalasyon

| Seviye | Ne zaman | Kime | Süre |
|---|---|---|---|
| 1 | Departman kendi alanında tıkandı | Kendi çalışanı | İlgisiz kırmızıda 10 dk |
| 2 | Başka departmana bağlı, 10 dk geçti ya da ikinci izin reddi | OPS (izin reddi panoya da, `fleet-mechanism-standard.md` §18 madde 4) | Aynı tur |
| 3 | Canlı zarar, veri bozulması, sır sızıntısı, ödeme riski | OPS, sonra Recep | Hemen |
| 4 | Recep kararı gereken (Madde 2.1 ve 2.2) | Recep, OPS tablosundan | Onayında satırı, kartında RECEP YETKİSİ |

Her Seviye 3 olay OPS kartında olay notu alır: ne oldu, etki, kök sebep, kalıcı çözüm kartı.

## Madde 7 — Ritim

| Ne | Ne zaman | Kim |
|---|---|---|
| Açılış | Recep'in ilk mesajı | OPS sabah raporu; departman: durum dosyası, pano, iş |
| Gün içi | İş bitince | Departman OPS'a tek satır; OPS Recep'e tek tablo |
| Haftalık öz-değerlendirme | Cuma | Her açık departman; en çok 3 iyileştirme OPS'a (Madde 2.3 sınırıyla); aynı hata ikinci kez olursa beklenmez |
| Haftalık filo raporu | Cuma | OPS |
| Gün sonu | Yalnız Recep ilan eder | Her compact kayıt üretir |

## Madde 8 — Departman karnesi

- Ölçüm aracı: `scripts/board/kanban-uyum.cjs` (pano başına son 7 gün). Eşikler o betiktekidir; tüzük ayrı sayı koymaz.
- Kanıtsız Done hedefi 0'dır (`passed` değilse taşınmaz); betik eşiği alarm eşiğidir, hak değildir.
- "Recep'e taşınan yanlış iddia" ve "aynı hatanın tekrarı" ölçüleri, kaynakları (sayım betiği; sage rol etiketi) kurulana kadar
  karneye girmez.
- OPS'un kendi karnesini ARAÇ okur (üretici yargıç olmasın).

## Madde 9 — Belge ve cetvel sahipliği

`docs/roller/cetvel-sahipligi.md` ve `scripts/belge/cetvel-sahipligi.json` geçerlidir; sahibine sormadan değiştirilmez. Sahiplik
yalnız `cetvel-sahipligi.json` ile ve sahibin teyidiyle değişir.

## Madde 10 — İş kaydı

Kart alanları `is-kayit-duzeni-standard.md` §2 ile birebirdir (Ne, Niçin, Kabul ölçütü, Eleme kaydı, Kim, Ne zaman, Nerede ve
KAYNAK/CETVEL, YÖNTEM, ÖNCEKİ ÇALIŞMA; Recep'e bağlıysa RECEP YETKİSİ). 5N1K her iş kartının da zorunlu tanımıdır
(Recep 16 Ekim: "her şey tam tanımlı olmalı"): Kim, Ne, Ne zaman, Nerede, Nasıl, Neden. Bitişin kanıtı `verify_completion`'dır.

## Madde 11 — Recep ile iletişim

`.claude/rules/filo-ortak.md` "Recep ile iletişim" geçerlidir. Ek: Recep'ten herhangi bir pencerede bir şey bekleniyorsa "senden
bir şey istemiyor" yazılmaz; ne ve hangi pencerede yazılır.

## Madde 12 — Tekrar azaltma

Kurallar dosyasında genel kurallar silinmez (INV-ROL-1); departmana özgü en çok 8 madde ayrı bölüm olur. Ortak bloklar
üreticiden basılır.
