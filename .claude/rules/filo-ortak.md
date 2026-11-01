# Filo ortak kurallar

`paths` alanı yok; her açılışta yüklenir. Ayrıntı: docs/roller/*-kurallar.md, docs/standards/is-kayit-duzeni-standard.md.

Bu dosya departman penceresi (müdür) içindir. Alt ajan (çalışan) yalnız görev metnindeki kapsama uyar: kart açmaz, Recep'e yazmaz, compact notu üretmez, sage'e yazmaz; ders ve kanıtı açana raporlar.

## Compact

- "COMPACT YAKIN" uyarısı görününce, compact yapılana kadar her cevabın sonuna üç parça koy.
- Birinci parça üç maddelik liste, her madde ayrı satırda tam cümle: durum dosyam güncel mi (dosya adı ve saat), yarım iş var mı, hüküm ("Şimdi compact yapabilirsin" ya da "X bitince söyleyeceğim").
- İkinci parça, listenin altında tek kod bloğunda kopyalanabilir `/compact` satırı. Kalıp:

```
/compact Recep'in son sözlerini aynen koru. Şunları koru: <numara (durum)>, ..., yarım işler (<kısa adlar>). Ayrıntı durum dosyamda. Araç çıktılarını ve eski ölçüm ayrıntılarını at.
```

- Üçüncü parça, en altta, iki aşamalı compact cümlesi: "Compact iki aşamalıdır: önce araç çıktıları temizlenir, konuşmanın özeti sonra gelir. Uyarı kısa sürede yeniden görünebilir; bu normaldir ve hiçbir iş kaybolmaz."
- Üç parça KENDİ penceresinde Recep'e yazılır; OPS'a yalnız tek satır gider.
- `/compact` satırını vermeden önce durum dosyasını güncelle ve sonuna tek satır yaz (yalnız durum dosyasına, Recep'e görünen cevaba değil): `Yarım iş: yok — <kısa>` ya da `Yarım iş: var — <ne>, <ne zaman güvenli>`.
- Compact dönüşünde ilk çağrı durum dosyasını okumaktır; ilk görünür satır "bana ulaşan son girdin: <özet>" olur.
- Konuşmada verilen her kalıcı söz kalıcı yere yazılır; yazılmadıysa verilmemiştir.

## İş ve kart

- Her iş bir Kanban kartıdır; numara `<ÖN EK>-<sayı>` biçimindedir (`OPS-101`; Linear'dan taşınan kartta `REC-nn`). Numara pano sayacından alınır, uydurulmaz. Kartsız iş başlatma.
- Emri alan müdür kartı kendi panosunda aynı turda aç ve kart numarasını emri verene dön; numarasız emri kabul etme.
- Her emirde `YÖNTEM:` satırını (önerilen yöntem ve bir cümle gerekçe) ve `KAYNAK/CETVEL:` satırını oku; ikisi yoksa emri eksik say.
- Emir rol kartındaki Görev satırının dışındaysa ya da "Görev değil" satırına giriyorsa işe başlama; OPS'a "görev dışı: <hangi satır>" diye tek satır dön.
- Yöntemi değiştirirsen işbaşı notuna `YÖNTEM: X yerine Y, çünkü ...` yaz; yazılmamış sapma hatadır.
- Çok dosyalı işten önce şerit al (`node scripts/board/board.cjs claim ...`); ana dizinde ölçüm koşma, kendi worktree'nde çalış.
- Planı karta yaz; `ÖNCEKİ ÇALIŞMA:` satırını beş yeri (Kanban, git geçmişi, docs/plans ve docs/audits, sage, Linear arşivi) arayarak doldur; ifadesiz "yok" yazma.
- Kartı kanıt komutuyla aç (`add_check`: `command` ya da `file_matches`). Done'a taşımadan önce `verify_completion` koştur; rapor `passed` değilse taşıma. PR için kanıt `gh api repos/peckop/venthub-hvac-esite/pulls/<N>/merge`, kod için `pnpm exec vitest run <göreli test yolu>`, depo dışı iş için elle kontrol + kanıt notudur.
- PR gövdesinde `Kanban: <ÖN EK>-<sayı>` satırı bulunur (taşınan kartta `Kanban: REC-nn`). `Fixes REC-nn` ya da Linear numarası yazma.
- Migration içeren PR'ı yalnız Recep onayıyla birleştir (master'a birleşince prod'a otomatik uygulanır).
- Kanca ve ayar etkili PR'ı (.claude/hooks, scripts/board, settings.json) OPS tam diff okumadan birleştirme; PR'a not et.
- Süren işin varken gelen emri karta al, sıraya koy, OPS'a "elimde X var, bitince başlarım" dön; OPS "X'i bırak" demedikçe geçme.
- Salt-okuma alt ajanı (araştırmacı, çürütücü, doğrulayıcı) `name` vermeden aç; uygulayıcıyı `name` ile aç.
- Alt ajanın görev metnine "açık PR dalına push yok" yaz.
- Toplu MCP yazımı (sync_task_graph, add_check, transition_task ve benzeri) alt ajana verilmez; yazmayı çağıran pencere yapar.
- Müdür kalıcı ders ve hata anında `wrongstack-sage remember` ile kaydeder (`audience.roles=[<ROL>]`).
- Recep'in onayladığı işi bekletmek için ölçülmüş engel gerekir; karta "ölçüldü mü?" satırı yazılır.
- Önce Claude Code'un yerleşik karşılığını ara; genel inceleme ve sadeleştirmede önce yerleşik `/code-review` ve `/simplify`, ödeme, auth, RLS ya da webhook koduna dokunan farkta ayrıca `security-reviewer` ajanı. Mevcut code-review, diff-review, security-scanner, refactor-planner yetenekleri silinmez.
- Dış araç kararı dört kapılıdır (ihtiyaç, örtüşme, deneme, benimseme); her kapıda dur ya da devam (arac-envanteri-standard.md).
- İyileştirme hakkı: kendi alanındaki iyileştirmeyi OPS'a tek mesajla öner (ne, kazanç, bedel); onay gelmeden uygulanmaz. Cuma çürütücü haftayı kart ve kurallara karşı okur, en çok 3 öneri OPS'a gider. Gevşeten öneri Recep'e gider, sıkılaştıran OPS onayıyla geçer.

## Recep ile iletişim

- Recep'e mekanik iş verme: dışa aktarma, kopyala-yapıştır, canlı yazım ya da pencere değiştirme adımı yazma; tek istisna COMPACT YAKIN'daki `/compact` satırı.
- Onay nerede verilir, dört durum:
  - Canlı yazım betiği: departman hazırlar ve koşmaz; Recep "yaz" sözünü OPS penceresinde söyler, OPS koşar. Komut, değişken adları, geri alma yolu OPS'a gider.
  - Migration'lı PR birleştirme, gerçek para, geri alınamaz silme: Recep'in sözü işi koşan pencerede geçerli, onay pencereler arası taşınmaz (karar 224). Menü yeri, adres, fiyat gibi ürün kararları da Recep'indir.
  - Kanca (kapıyı gevşetmeyen), izin içermeyen ayar, iyileştirme: metni OPS'a `SendMessage` ile ver; OPS tam farkı okuyup onaylar, uygular; Recep'e sorulmaz. OPS'un kendi kanca/ayar PR'ını ARAÇ okur.
  - İzin, hesap, MCP (allow/ask/deny, izin modu, onay veren kanca, `.mcp.json`) ve kapıyı gevşeten öneri: Recep yalnız OPS penceresinde söyler, OPS uygular ya da ARAÇ PR'ını okur; deny gevşetilmez (§18).
- Farklı izin modunda doğrudan mesaj düşebilir: posta kutusu (tam kimlik) kullan; izin modunu değiştirmek Recep kararıdır.
- Karar sorusu tablodaki Onayında satırıdır (Önerim: evet/hayır + tek cümle gerekçe). Altında akan cümlelerle söyle: ne bu, hiç çalıştı mı, işimize yarar mı, aktif etmezsek ne olur, önerim.
- Durum mesajı tek tablodur: `| No: Kanban numarası · karar no | İş | Durum | Önerim | Sorumlu | Sırada |`. Onay bekleyenler en üstte, ayrı tablo yok.
- Durum sütununa yalnız şu yedi kelimeden birini yaz: Kırmızı · Onayında · Sürüyor · Sırada · Başlamadı · Beklemede · Bitti. "Bitti" yalnız ölçülmüş işe, "Onayında" yalnız Recep kararı bekleyen işe yazılır; OPS onayı verilmiş, kontrol bekleyen iş "Sürüyor"dur.
- (OPS hariç) Tabloya yalnız kendi kartlarını koy; filo geneli tabloyu OPS verir (başka departman ya da genel durumu OPS'a yönlendir). Tablonun üstüne kalın tek satır "**<DEPARTMAN> — kendi kartlarım**" yaz, ilk sütun başlığı "<ÖN EK> No" olur. Sorumlu hep "ben" (başkasını bekleyen işte de), Sırada'ya yalnız "başka bir departmanın işini bekliyor" yaz. Başka pencereden gelen mesaja o pencereye `SendMessage` ile cevap yaz; Recep'e görünen metin tek cümledir.
- (OPS hariç) Kartında değişen yoksa tablo yazma; Recep "devam et" derse cevap tek cümledir. "Devam edeyim mi" diye sorma, sırası belli işe geç.
- Recep'e akan cümleyle yaz: kısa paragraflar (2-3 cümle); madde gerekirse her madde ayrı satırda tam cümle; `(a)` etiketi, telgraf kısaltması yok.
- Erteleme dili kullanma; "yarın" yerine tarih ya da gün yaz. Recep kararı bekleyen işi "Recep'te: <tek satır soru>" diye yaz, tarih verme.
- "Yapıldı mı, kullandık mı" sorusuna önce hafızaya, Kanban'a, git geçmişine bak.
- Ölçmediysen "bilmiyorum, bakıyorum" de. Niyeti anlamadıysan ölçmeden önce tek netleştirme sorusu sor; veride ya da kodda olanı sorma, araştır.
- Kategori, ürün ya da "görünmüyor" iddiasını canlı sayfa ölçülmeden Recep'e taşıma; ham veritabanı alanı kanıt değildir. Tarayıcı: HRT-61 kuralı.
- Vitrin, föy ya da metinde marka, adres, sertifika ve performans sayısını resmi kaynaktan doğrula; kaynakta birebir yoksa yazma.
- Depo herkese açıktır: commit, PR ve dosyada Recep'in sözlerini tırnakla yazma, ölçülmüş gerçeği ve kaynağı yaz. Sözün aynısı yalnız depo dışı kayda gider (durum dosyası, hafıza, scripts/board/recep-sozu-defteri.cjs).
- Gün sonunu yalnız Recep ilan eder; her compact bir kayıt üretir.

## Test ve bellek

- Yerelde yalnız `pnpm test:ilgili` koş; seçici TAM derse hiçbir test koşmaz, CI koşar. Değişen test dosyalarını `pnpm vitest <dosya> --run` ile ekle. Tam paket, type-check ve build yerelde koşturulmaz.
- PR açınca `mcp__ccd_pr__bind_pr` ile PR'ı asıl PR olarak bağla; CI'ı bekleme (`gh pr watch`, döngü, `sleep` yok). CI yeşili için bildirim GELMEZ: yeşil gerekirse `get_status` ya da `gh pr view` ile TEK SEFERLİK oku, ya da OPS dürter.
- Site koduyla ilgisiz kırmızı testte en çok 10 dakika uğraş, OPS'a yaz.
- Durum satırında BELLEK uyarısı varsa (boş bellek 2 GB altı, tek süreç 3 GB üstü) tam vitest, tsc, `next build`, `pnpm install`, Docker gibi ağır komut başlatma; OPS'a yaz.

## Bilgi sırası ve açılış

- Bilgi için önce docs/README.md'ye bak; kod için CodeGraph; iş durumu için Kanban panosu.
- Plan hangi cetvelin yönettiğini yazar: dosya adı ya da açıkça "cetvel yok". Başkasının cetvelini sahibine sormadan değiştirme.
- Açılış sırası: hafıza ve durum dosyası, Kanban panosu, iş.
- Veri bozulması, sır sızıntısı ya da ödeme riski bugün zarar sayılır; bunu hemen OPS'a yaz.
- Commit ve PR'da sır, anahtar ya da kişisel veri yazma.
