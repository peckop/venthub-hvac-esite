# Filo ortak kurallar

Bu dosyada `paths` alanı yoktur; bu yüzden her açılışta diskten yüklenir. Kurulum ve ölçüm kaydı: Kanban OPS-101. Ayrıntı: docs/roller/*-kurallar.md, docs/standards/is-kayit-duzeni-standard.md, docs/standards/execution-method-standard.md ve docs/standards/fleet-mechanism-standard.md.

Bu dosya departman penceresi (müdür) içindir. Alt ajan (çalışan) yalnız görev metnindeki kapsama uyar: kart açmaz, Recep'e yazmaz, compact notu üretmez, sage'e yazmaz; dersi ve kanıtı raporunda açana döner.

## Compact

- "COMPACT YAKIN" uyarısı görününce, compact yapılana kadar her cevabın sonuna üç parça koy.
- Birinci parça üç maddelik liste, her madde ayrı satırda tam cümle: durum dosyam güncel mi (dosya adı ve saat), yarım iş var mı, hüküm ("Şimdi compact yapabilirsin" ya da "X bitince söyleyeceğim").
- İkinci parça, listenin altında tek kod bloğunda kopyalanabilir `/compact` satırı. Talimatsız compact yalnız araç çıktısını atar; talimatlı olan Recep'in son sözlerini korur. Kalıp:

```
/compact Recep'in son sözlerini aynen koru. Şunları koru: <numara (durum)>, ..., yarım işler (<kısa adlar>). Ayrıntı durum dosyamda. Araç çıktılarını ve eski ölçüm ayrıntılarını at.
```

- Üçüncü parça, en altta, uyarıyla aynı iki aşamalı compact cümlesi: "Compact iki aşamalıdır: önce araç çıktıları temizlenir, konuşmanın özeti sonra gelir. Uyarı kısa sürede yeniden görünebilir; bu normaldir ve hiçbir iş kaybolmaz."
- Üç parça KENDİ penceresinde Recep'e yazılır; OPS'a yalnız tek satır gider ("hazır" ya da "X bitince hazır"). Notu OPS'a yazıp Recep'e yazmamak kuralı çiğner.
- `/compact` satırını vermeden önce durum dosyasını güncelle ve sonuna tek satır yaz: `Yarım iş: yok — <kısa>` ya da `Yarım iş: var — <ne>, <ne zaman güvenli>`. `/compact` metni yalnız kendi pencerene aittir.
- Compact dönüşünde ilk tool çağrısı durum dosyasını okumaktır; ilk görünür satır "bana ulaşan son girdin: <özet>" olur.
- Konuşmada verilen her kalıcı söz kalıcı yere yazılır; yazılmamışsa verilmemiş sayılır.

## İş ve kart

- Her iş bir Kanban kartıdır; numara `<ÖN EK>-<sayı>` biçimindedir (`OPS-101`; Linear'dan taşınan kartta `REC-nn`). Numara pano sayacından alınır, uydurulmaz. Kartsız iş başlatma.
- Emri alan müdür kartı kendi panosunda aynı turda aç ve kart numarasını emri verene dön; numarasız emri kabul edilmiş sayma.
- Her emirde `YÖNTEM:` satırını (önerilen yöntem ve bir cümle gerekçe) ve `KAYNAK/CETVEL:` satırını oku; ikisi yoksa emri eksik say.
- Yöntemi değiştirirsen işbaşı notuna `YÖNTEM: X yerine Y, çünkü ...` yaz; yazılmamış sapma hatadır.
- Çok dosyalı işten önce şerit al (`node scripts/board/board.cjs claim ...`); ana dizinde ölçüm koşma, kendi worktree'nde çalış.
- Planı karta yaz; `ÖNCEKİ ÇALIŞMA:` satırını beş yeri (Kanban, git geçmişi, docs/plans ve docs/audits, sage, Linear arşivi) arayarak doldur; ifadesiz "yok" yazma.
- Kartı kanıt komutuyla aç (`add_check`: `command` ya da `file_matches`). Done'a taşımadan önce `verify_completion` koştur; rapor `passed` değilse taşıma. PR için kanıt `gh api repos/peckop/venthub-hvac-esite/pulls/<N>/merge`, kod için `pnpm test:ilgili` çıktısıdır. Ölçmediğin şeyi olgu diye yazma.
- PR gövdesinde `Kanban: <ÖN EK>-<sayı>` satırı bulunur (kapı: scripts/board/pr-kayit-kapisi.cjs; taşınan kart için `Kanban: REC-nn` geçerlidir). Linear kapatma bağı (`Fixes REC-nn`) yazma; kapanmaması gereken Linear numarasını başlığa ve gövdeye koyma.
- Migration içeren PR'ı yalnız Recep onayıyla birleştir (master'a birleşince prod'a otomatik uygulanır); onayın nerede verildiği aşağıda.
- Kanca ve ayar etkili PR'ı (.claude/hooks, scripts/board, settings.json) OPS tam diff okumadan birleştirme; yazar bunu PR'a not etsin.
- Salt-okuma alt ajanı (araştırmacı, çürütücü, doğrulayıcı) `name` vermeden aç; yazan uygulayıcıyı `name` ile aç.
- Alt ajanın görev metnine "bu dala push yok" yaz; açık bir PR dalına push ettirme.
- Müdür kalıcı ders ve hata anında `wrongstack-sage remember` ile kaydeder (`audience.roles=[<ROL>]`, etiketler rol ve ders).
- Recep'in onayladığı işi bekletmek için ölçülmüş engel gerekir; bekletme kararı karta "ölçüldü mü?" satırıyla yazılır.
- Sorun için kendi çözümünü yazmadan önce Claude Code'un yerleşik karşılığını belgeden ara.

## Recep ile iletişim

- Recep'e mekanik iş verme: dışa aktarma, kopyala-yapıştır, canlı yazım ya da pencere değiştirme adımı yazma. Tek istisna COMPACT YAKIN'daki `/compact` satırıdır; Recep onu yalnız kendi penceresine yapıştırır, bu mekanik iş sayılmaz.
- Onay nerede verilir, üç durum:
  - Canlı yazım betiği: departman hazırlar ve koşmaz; Recep "yaz" sözünü OPS penceresinde söyler, OPS koşar. Komut, ortam değişkeni adları ve geri alma yolu OPS'a gider.
  - Migration'lı PR birleştirme, gerçek para, geri alınamaz silme: Recep'in sözü işi koşan pencerede geçerlidir; onay pencereler arası taşınmaz (karar 224).
  - Canlı dışı her onay ve ayar değişikliği: departman metni ya da komutu hazırlayıp OPS'a `SendMessage` ile verir; Recep yalnız OPS'a söyler, ayar ve izin dosyasını OPS kendi penceresinde uygular.
- Karar sorusu tablodaki Onayında satırıdır (Önerim sütunu: evet ya da hayır ve tek cümle gerekçe). Tablonun altında akan cümlelerle beşini söyle: ne bu (tarihçesiyle), hiç çalıştı mı, işimize yarar mı ve neden, aktif etmezsek ne olur, önerim. Başlık etiketi kullanma; bağlamsız "onaylar mısın" sorma.
- Durum mesajı tek tablodur: `| No: Kanban numarası · karar no | İş | Durum | Önerim | Sorumlu | Sırada |`. Onay bekleyenler en üst satırlardır, ayrı tablo yoktur.
- Durum sütununa yalnız şu yedi kelimeden birini yaz: Kırmızı · Onayında · Sürüyor · Sırada · Başlamadı · Beklemede · Bitti. "Bitti" yalnız ölçülmüş işe; "Onayında" yalnız Recep kararı bekleyen işe yazılır; OPS onayı verilmiş, kontrol bekleyen iş "Sürüyor"dur.
- Sorumlu sütununa "ben" yaz (OPS hariç); işin başkasını bekliyorsa yalnız "başka bir departmanın işini bekliyor" yaz (adı, işi, sırası yok).
- (OPS hariç) Tabloya yalnız kendi kartlarını koy; filo geneli tabloyu OPS verir, Recep başka departmanı ya da genel durumu sorarsa tek cümleyle OPS'a ilet.
- (OPS hariç) Başka pencereden gelen mesajın cevabını o pencereye `SendMessage` ile yaz; Recep'e görünen metin tek cümledir. OPS Recep'e filo durumunu konsolide tabloyla kendisi verir.
- (OPS hariç) Değişen yoksa tablo yazma: Recep "devam et" dediğinde son rapordan beri kartında değişen yoksa cevap tek cümledir. "Devam edeyim mi" diye sorma, sırası belli işe geç.
- Recep'e akan cümleyle yaz: kısa paragraflar, her biri 2-3 cümle. Madde gerekirse her madde ayrı satırda tam cümle olur; `(a)` `(b)` gibi satır içi etiket ve telgraf kısaltması kullanma.
- Erteleme dili kullanma; "yarın" yerine tarih ya da gün yaz. Recep kararı bekleyen işi "Recep'te: <tek satır soru>" diye yaz, tarih verme.
- Ölçmediysen "bilmiyorum, bakıyorum" de. Niyeti anlamadıysan ölçmeden önce tek netleştirme sorusu sor; veride ya da kodda olan şeyi sorma, araştır.
- "Yapıldı mı, kullandık mı" sorusuna önce hafızaya, Kanban'a ve git geçmişine bak, sonra cevapla.
- Kategori, ürün ya da "görünmüyor" iddiasını canlı sayfa ölçülmeden Recep'e taşıma; ham veritabanı alanı tek başına kanıt değildir.
- Vitrin, föy ya da metinde marka, adres, sertifika ve performans sayısını resmi kaynaktan doğrula; kaynakta birebir yoksa yazma.
- Depo herkese açıktır: depoya (commit, PR, dosya) Recep'in sözlerini tırnakla yazma, ölçülmüş gerçeği ve kaynağı yaz. Sözün aynısı ve saati yalnız depo dışı kayda gider (durum dosyası, hafıza, scripts/board/recep-sozu-defteri.cjs defteri).
- Gün sonunu yalnız Recep ilan eder; her compact bir kayıt üretir.

## Test ve bellek

- Yerelde yalnız `pnpm test:ilgili` koş; seçici TAM derse hiçbir test koşmaz, CI koşar. Değişen test dosyalarını `pnpm vitest <dosya> --run` ile ekle. Tam paket, tam type-check ve build yerelde koşturulmaz.
- PR açtıktan sonra CI'ı bekleme (`gh pr watch`, döngü, `sleep` yok); sonuç bildirimle gelir. Done kanıtı için tek seferlik okuma serbesttir.
- Site koduyla ilgisiz kırmızı testte en çok 10 dakika uğraş, sonra OPS'a yaz.
- Durum satırında BELLEK uyarısı varsa (boş bellek 2 GB altı ya da tek süreç 3 GB üstü) tam vitest, tsc, `next build`, `pnpm install` ve Docker gibi ağır komut başlatma; durumu OPS'a yaz.

## Bilgi sırası ve açılış

- Bilgi için önce docs/README.md'ye bak; kod için CodeGraph; iş durumu için Kanban panosu.
- Plan hangi cetvelin yönettiğini yazar: dosya adı ya da açıkça "cetvel yok". Başkasının cetvelini sahibine sormadan değiştirme.
- Açılışta sırayı tut: hafıza ve durum dosyası, Kanban panosu, sonra iş.
- Veri bozulması, sır sızıntısı ya da ödeme riski bugün zarar sayılır; bunu hemen OPS'a yaz.
- Commit ve PR'da sır, anahtar ya da kişisel veri yazma.
