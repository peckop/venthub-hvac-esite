# Filo ortak kurallar

Bu dosyada `paths` alanı yoktur; bu yüzden her açılışta yüklenir. Belgeye göre `paths`'siz kurallar compact sonrası da diskten yeniden yüklenir (compact sonrası yükleme henüz ölçülmedi). Ayrıntı: docs/roller/*-kurallar.md, docs/standards/is-kayit-duzeni-standard.md, docs/standards/execution-method-standard.md ve docs/standards/fleet-mechanism-standard.md.

## Compact

- "COMPACT YAKIN" uyarısında her cevabın sonuna üç parça koy: üç maddelik liste (durum dosyası güncel mi ve saat, yarım iş var mı, hüküm), altında tek kod bloğunda kopyalanabilir `/compact ...` satırı, en altta iki aşamalı compact cümlesi.
- Üç parçadan biri eksikse cevap eksiktir; uyarı her geldiğinde üçünü birlikte yaz.
- Compact öncesi ayrıntıyı durum dosyasına yaz, yalnız bağlamda bırakma. Durum dosyasının sonuna tek satır yaz: `Yarım iş: yok — <kısa>` ya da `Yarım iş: var — <ne>, <ne zaman güvenli>`.
- `/compact` metni yalnız kendi pencerene aittir; başka pencerenin dökümünü yapma.
- Compact dönüşünde ilk tool çağrısı durum dosyasını okumaktır; ilk görünür satır "bana ulaşan son girdin: <özet>" olur.
- İkinci "COMPACT YAKIN" uyarısı JEV'in iki aşamalı çalışmasından gelir; Recep'e tek cümleyle açıkla, uzatma.
- Konuşmada verilen her kalıcı söz kalıcı yere yazılır; yazılmamışsa verilmemiş sayılır.

## İş ve kart

- Her iş bir Kanban kartıdır; numara `<KISA AD>-<sayı>` biçimindedir. Kartsız iş başlatma.
- Emri alan müdür kartı kendi panosunda aynı turda aç ve kart numarasını emri verene dön; numarasız emri kabul edilmiş sayma.
- Her emirde `YÖNTEM:` satırını (önerilen yöntem ve bir cümle gerekçe) ve `KAYNAK/CETVEL:` satırını oku; ikisi yoksa emri eksik say.
- Yöntemi değiştirirsen işbaşı notuna `YÖNTEM: X yerine Y, çünkü ...` yaz; yazılmamış sapma hatadır.
- Çok dosyalı işten önce şerit al (`node scripts/board/board.cjs claim ...`); ana dizinde ölçüm koşma, kendi worktree'nde çalış.
- Planı karta yaz; `ÖNCEKİ ÇALIŞMA:` satırını beş yeri (Kanban, git geçmişi, docs/plans ve docs/audits, sage, Linear arşivi) arayarak doldur; ifadesiz "yok" yazma.
- Done'ı yalnız kanıtla ver: komut çıktısı ya da `gh pr checks` çıktısı. Ölçmediğin şeyi olgu diye yazma.
- PR gövdesine yalnız `Kanban: <numara>` satırını yaz; Linear numarasını (REC-nn) PR'a koyma.
- Migration içeren PR'ı yalnız Recep onayıyla birleştir; onay yoksa birleştirme.
- Kanca ve ayar etkili PR'ı (.claude/hooks, scripts/board, settings.json) OPS tam diff okumadan birleştirme; yazar bunu PR'a not etsin.
- Salt-okuma alt ajanı (araştırmacı, çürütücü, doğrulayıcı) `name` vermeden aç; yazan uygulayıcıyı `name` ile aç.
- Alt ajanın görev metnine "bu dala push yok" yaz; açık bir PR dalına push ettirme.
- Kalıcı ders ve hata anında `wrongstack-sage remember` ile kaydet.

## Recep ile iletişim

- Recep'e mekanik iş verme: kopyala-yapıştır, dışa aktarma, canlı yazım ya da pencere değiştirme adımı yazma. Canlı yazım onayı OPS penceresinde alınır; betiği hazırlayan pencere koşmaz, OPS koşar.
- Canlı dışı her onayı ve ayar değişikliğini OPS penceresine yaz; başka pencereye yalnız canlı işlem için git.
- Karar sorarken beş başlık kullan: ne bu (tarihçesiyle), hiç çalıştı mı, işimize yarar mı ve neden, aktif etmezsek ne olur, önerim. Bağlamsız "onaylar mısın" sorusu sorma.
- Durum mesajı tek tablodur: `| No: Kanban numarası · karar no | İş | Durum | Önerim | Sorumlu | Sırada |`. Durum sütununa yalnız Kırmızı, Onayında, Sürüyor, Sırada, Başlamadı, Beklemede veya Bitti yaz.
- "Bitti" yalnız ölçülmüş işe; "Onayında" yalnız Recep kararı bekleyen işe yazılır.
- Tabloya yalnız kendi kartlarını koy; filo geneli tabloyu yalnız OPS verir.
- Başka pencereden gelen mesajın cevabını o pencereye yaz; Recep'e tek cümle yaz.
- Değişen yoksa tablo yazma; "devam edeyim mi" diye sorma, sırası belli işe geç.
- Recep'e akan cümleyle yaz: kısa paragraflar, her biri 2-3 cümle. Madde gerekirse her madde ayrı satırda tam cümle olur; `(a)` `(b)` gibi satır içi etiket ve telgraf kısaltması kullanma.
- Erteleme dili kullanma; "yarın" yerine tarih ya da gün yaz. Recep kararı bekleyen işi "Recep'te: <tek satır soru>" diye yaz, tarih verme.
- Ölçmediysen "bilmiyorum, bakıyorum" de. Niyeti anlamadıysan ölçmeden önce tek netleştirme sorusu sor; veride ya da kodda olan şeyi sorma, araştır.
- Kategori, ürün ya da "görünmüyor" iddiasını canlı sayfa ölçülmeden Recep'e taşıma; ham veritabanı alanı tek başına kanıt değildir.
- Vitrin, föy ya da metinde marka, adres, sertifika ve performans sayısını resmi kaynaktan doğrula; kaynakta birebir yoksa yazma.
- Depoya (commit, PR, dosya) Recep'in sözlerini tırnakla yazma; ölçülmüş gerçeği ve kaynağı yaz.
- Gün sonunu yalnız Recep ilan eder; her compact bir kayıt üretir.

## Test ve bellek

- Tam test, tam type-check ve build aynı anda koşturulmaz; birini bitirmeden diğerini başlatma.
- Yerelde yalnız `pnpm vitest related <değişen dosyalar> --run` ve değişen test dosyalarını koş; tam paket ve build CI'da koşar.
- PR açtıktan sonra CI'ı bekleme (`gh pr checks`, `gh pr watch`, döngü yok); sonuç bildirimle gelir.
- Site koduyla ilgisiz kırmızı testte en çok 10 dakika uğraş, sonra OPS'a yaz.
- Boş bellek düşükse ağır komut başlatma; durumu OPS'a yaz.

## Bilgi sırası ve açılış

- Bilgi için önce docs/README.md'ye bak; kod için CodeGraph; iş durumu için Kanban panosu.
- Plan hangi cetvelin yönettiğini yazar: dosya adı ya da açıkça "cetvel yok". Başkasının cetvelini sahibine sormadan değiştirme.
- Açılışta sırayı tut: hafıza ve durum dosyası, Kanban panosu, sonra iş.
- Veri bozulması, sır sızıntısı ya da ödeme riski bugün zarar sayılır; bunu hemen OPS'a yaz.
- Commit ve PR'da sır, anahtar ya da kişisel veri yazma; depo herkese açıktır.
