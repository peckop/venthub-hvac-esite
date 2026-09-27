# İş-Kayıt Düzeni Standardı

> **Durum:** v1 · 2026-08-26 · Sahip: OPS
> **Kaynak:** Recep'in 08-26 ilkeleri + ORION çürütmesi (`C:/tmp/orion-kayit-duzeni-curutme.md`, 7 bölüm)
> + REC-53 triyaj ölçümleri (`docs/audits/registry-triyaj-2026-08-26.md`).
> **Niçin var:** 2026-08-26'da "açık" görünen 120 kaydın 54'ü ZATEN YAPILMIŞTI, 19'u
> tanımlanamayacak kadar kötü açılmıştı, 5 kimlik çakışıyordu. Sistem geçmişini bilmiyordu;
> aynı iş yeniden öne sürülebiliyordu. Bu cetvel o sınıfı kapatır.

## 1. Katman haritası — hangi soru nereye

| Katman | Rolü | SSOT olduğu alan |
|---|---|---|
| **Linear** | Canlı işlerin tek listesi; açılış ve kapanış burada | **Açık/süren iş** — çelişkide Linear kazanır |
| **orion registry** | Donmuş arşiv defteri (görev takibinden 08-26'da emekli) | **Tarihçe** — "bu iş geçmişte var mıydı/ne oldu" sorusunda registry kazanır |
| **git / PR** | Kanıt | Kodun ve kapanış kanıtının kendisi |
| **Pano (C:/tmp/venthub-board)** | Ajanlar arası anlık telsiz; TTL'li | Hiçbir şeyin SSOT'u DEĞİL — iş kaydı tutulamaz |
| **NLM ikizi** | Doğal dilde aranabilir hafıza | "Niçin/hangi karar/hangi desen" soruları |

Katı kurallar (ORION §5, ampirik sınırlarla):
- **Sayım/enümerasyon/"şu an" sorusu ikize SORULMAZ** (RAG eksik liste verir, snapshot bayattır).
  Kapanış kararı asla ikizden doğrulanmaz.
- **Registry gerekçe METNİ tutmaz, gerekçeye İŞARET tutar** (PR/dosya referansı). Kopyalanan
  anlatı bayatlar; işaret bayatlamaz.
- Beşinci bir katman EKLENMEZ (Notion/Jira/ayrı dashboard/ayrı cron servisi — 08-26 araştırma
  raporu: mevcut dört katman + GitHub Actions cron'ları yeterli; yeni katman SSOT'u böler).

**ORION §4'ten sapma, gerekçesiyle:** ORION "registry SSOT, Linear ayna" önerdi. Sapıyoruz
çünkü Recep 08-26'da registry'yi görev takibinden emekli etti — canlı iş artık yalnız
Linear'da yaşar ve orada yönetilir; registry'nin otoritesi kapanmış tarihçeyle sınırlıdır.
Alan ayrımı yazıldığı için "hangisi doğru" belirsizliği (ORION'un asıl endişesi) doğmaz.

## 2. Kayıt AÇMA şablonu (Linear)

Zorunlu dört alan — dördü de açılış anında **dürüstçe** doldurulabilir olanlardır
(ORION §2: açılışta zorunlu kanıt alanı uydurma üretir — `required-field-pressures-fabrication`):

1. **Ne** — iş tanımı.
2. **Niçin** — değer cümlesi (satan platforma / SaaS hedefine / ekip verimine katkı).
3. **Kabul ölçütü** — "bittiğini nereden anlayacağız." Kapanışı ölçülebilir kılan asıl alan.
4. **Eleme kaydı** — mükerrer adayları ve eleme gerekçeleri (§3).

`Kanıt-Referans` açılışta ZORUNLU DEĞİL (varsa yazılır); **kapanışta zorunludur** (§4).

Kimlik: taşınan kayıtlar eski registry kimliğini (`Txxx-VH` vb.) gövdede taşır.
Başlık konvansiyonu: kimlik kodu baştaki köşeli parantezin İÇİNDE (`[ŞERİT · Txxx-VH]`).

## 3. Mükerrer önleme — aramanın EYLEMİ değil SONUCU

"Arandı, yok" satırı BEYANDIR ve beyan 08-26'da iki kez düştü (ORION §1). Kural:

- Kayıt açan (insan ya da ajan) açmadan önce üç yüzeyde arar: **triyaj/audit belgeleri +
  registry + Linear**. Ama kayda yazılan şey "aradım" değil, **aday listesi + eleme**dir:
  en yakın adaylar ve her birinin tek-cümle eleme gerekçesi "Eleme kaydı" alanına girer.
- Aday yoksa "aday çıkmadı (aranan kelimeler: ...)" yazılır — aranan kelimeler yazılır ki
  yanlış-kelime hatası sonradan teşhis edilebilsin.
- Bu kapı **BLOKLAMAZ** (aday listesi kesin değildir; bloklayan mükerrer-kapısı ilk
  yanlış-kırmızıda atlatılır — T033). Ölçülen şey atlatma oranıdır: elenen bir adayın
  sonradan mükerrer çıkması arama iyileştirme sinyalidir.
- **Kapı adayı (v2):** kayıt açma komutunun aramayı kendisinin koşup adayları ekrana
  basması (araç arar, insan eler). v1'de disiplin + eleme kaydı; v2'de araç.

## 4. Kayıt KAPAMA kuralları

- **Kanıt-Referans zorunlu:** dosya yolu / commit / PR / ölçüm satırı olmadan "bitti" yazılamaz.
- **Kapanış sebebi kapalı sözlükten** (ORION §3 — serbest metin sayılamaz, sayılamayan
  alan üzerinde kapı kurulamaz):
  `yapildi` · `gereksiz-mukerrer` · `gereksiz-kapsam-disi` · `vazgecildi` ·
  `belirsiz-insana-soruldu` · `kurtarilamaz-kayit`
  Son ikisi meşru hükümlerdir: "anlamadık" canlı işle aynı görünürse bir sonraki triyajda
  yine vekil ölçü (tarih!) icat edilir — REC-53 vetosunun kökü buydu.
- Kapanan iş bir sonraki işi doğuruyorsa (T063 örneği: mekanizma bitti, kanal Recep'te),
  **önce ardıl kayıt açılır, sonra eski kayıt ona işaret ederek kapanır** (ORION §6).
- PR gövdesinde `Fixes REC-nn` satırı zorunlu — Linear'ın GitHub entegrasyonu durumu
  otomatik akıtır (08-26 araştırması: free planda dahil; ayrı Action gerekmez).

## 5. Arşiv ve silme

- **Silme YOK.** Kayıt statüyle kapanır, gövdesi ve tarihi arşivde kalır
  (Recep 08-26: "arşiv olmazsa geçmişimizi kaybediyoruz").
- Registry'ye yazma yalnız CLI/engine yolundan (elle SQL yasak).
- Linear free tavanı (250 arşivlenmemiş kayıt) için periyodik arşivleme rutini OPS'ta.
- Toplu kapanış koşumları: önce yedek + kuru koşum + log; "tarihsizlik = ölülük" gibi
  **zaman-vekilli ölçüler YASAK** — bayatlık değişimle ölçülür.

## 6. Şerit reaktivasyon ritüeli

Duraklatılmış bir şerit yeniden açılırken:
1. Dal master'a rebase edilir (yaş ≠ bayatlık; çelişki varsa değişimden ölçülür).
2. İşin Linear kaydı yoksa §2 şablonuyla açılır; varsa durum güncellenir.
3. Triyaj/audit belgelerinde işin geçmişi kontrol edilir (yapılmış kısmı tekrar yapılmaz).
4. Şerit, kapanışlarını `Fixes REC-nn` ile Linear'a bağlar.

## 6.1 PİLOT — iş kartı panosu (karar 46, Recep onayı 2026-09-18)

**Kapsam:** ~~bundan sonraki her **yeni ALTYAPI işi** için bir kart açılır~~ → **karar 144
(2026-09-27) ile TÜM şeritlere genişledi; güncel kural §6.2'dedir.** Aşağıdaki ölçülmüş tuzaklar
ve kanıt komutu kuralı §6.2 için de geçerlidir. Linear **aynen yaşar**; pano onun yerine geçmez.

**Kart biçimi:** başlığın ilk satırı `REC-nn` ile başlar (numara defterden alınır, uydurulmaz).
Kartın **Done**'a geçmesi için kanıt zorunludur: `gh pr checks <PR>` çıktısı ya da eşdeğeri.
"Bitti", "tamam", "çalışıyor" gibi tek kelimelik özet **reddedilir** (aracın kendi belirsizlik
süzgeci de bunları eliyor — ölçüldü).

**Ölçülmüş tuzaklar ve karşılıkları:**

| Tuzak | Ölçüm | Karşılık |
|---|---|---|
| İçe aktarılan pano **yönetilen değildir** | Done kanıtsız geçer | Kart panoda **doğrudan** açılır, dışarıdan aktarılmaz |
| Doğrulayıcının izin listesi **çok dar** | varsayılan `["pwd","true","false","test"]` | `WRONGSTACK_KANBAN_VERIFIER_COMMANDS=+gh` (yalnız `gh`; `+` ekler, yasak listesi her hâlde üstün) |
| Silme yüzeyi | `--destructive` silme/birleştirme/devretme açar | Pilotta **kapalı**; kayıt yalnız gerekçeyle küçülür |
| Alt süreç `process.env` **kalıtır** | sırlar çocuk sürece geçer | Doğrulayıcı komutları `gh` ile sınırlı; `curl/wget/npm/node` **yasak listesinde**. Yine de bu bir **azaltma**, sıfırlama değil — kart açıklamasına sır yazılmaz |
| Proje kimliği **sürücü harfine duyarlı** | `c:\…` → `7e017f`, `C:\…` → `1088d5` | Pano küçük harfli kökle açılır ve kimlik **ölçülür** |

**Mesaj kutusu (mailbox) — GÜNCEL NOT (2026-09-27):** karar 54 ile `.mcp.json`'a pencere başına
kimlikle (`${CLAUDE_CODE_SESSION_ID}`) kaydedildi ve kullanılıyor; pilot ölçümü REC-401'de (ARAÇ).
Aşağıdaki paragraf 09-18 tarihli kayıt öncesi durumu anlatır, tarihçe olarak durur.

~~**Mesaj kutusu (mailbox) pilotun parçası DEĞİL — ölçüm bekliyor:**~~ paket kurulu, ama kayıt
yapılmadı. Sebep: sunucu zorunlu `--actor <id>` istiyor ve `.mcp.json` üç pencerenin paylaştığı
tek dosyadır; sabit bir actor yazılırsa üç pencere aynı kimlikle konuşur ve mesajlar yanlış
pencereye düşer. Kayıt, kimlik ölçümünden sonra ayrı adımdır (`INV-WRONGSTACK-MCP-1` bu
"kayıtlı DEĞİL" hükmünü kolla tutar).

**⭐KART KANIT KOMUTU — TEK KOMUT, BORU YOK (2026-09-21, ölçüldü):** doğrulayıcının güvenlik
kapısı `|` `&&` `||` `;` `>` `<` `` ` `` `$()` içeren komutu **hiç koşmaz**: *"Command contains shell
operators … which are not permitted in the verifier."* Hüküm `needs_human`a düşer ve kart
kapanmaz. İlk gerçek atamada (kart `2e5fb1ce`, OPS'un yazdığı `gh pr view … | grep -qx MERGED`)
tam bu oldu. Kural:
1. Kanıt komutu **tek komuttur**; boru, yönlendirme, zincir yok.
2. Komut **çıkış koduyla** konuşur — çıktının metnine bakan bir `grep` gerekiyorsa komut yanlış
   seçilmiştir.
3. Yazmadan önce **bir olumlu bir olumsuz** örnekte ayırt ediciliği ölçülür.

Standart kalıp — "PR birleşti mi": `gh api repos/peckop/venthub-hvac-esite/pulls/<N>/merge`
(GitHub 204 → çıkış 0; 404 → çıkış 1). Ölçüldü: birleşmiş #1276'da 0, açık #1270'te 1.

**Bedel (2026-09-21, ölçüldü):** her yazma çağrısı panonun **tamamını** geri döndürüyor —
`start_task` 13.171 bayt, `update_check` 13.706, `verify_completion` 18.992 ve 18.048 bayt;
tek kart kapatmak ~64 KB bağlam. Tek `get_task` ~4 KB. Bu, pano değerlendirmesinin en ağır
eksisidir; toplu giriş tek çağrıyla (`create_from_graph`) yapılır.

**Bedel — GÜNCEL (2026-09-27, ölçüldü):** yukarıdaki "her yazma panonun tamamını döndürür"
bulgusu yama ile kapandı (ARAÇ #1437 + onarım #1440 — yama sunucunun GERÇEKTEN çalıştırdığı
`dist/cli.js`'e de uygulanır; ilk yama yalnız `index.js`'teydi ve canlıda etkisizdi). Yeni ölçüm:
`add_task` 1.278 B (kart dahil), `add_note` 2.043 B (etkilenen kart dahil). Okuma eylemleri
yamasızdır: `search_tasks` limit 5 ~2 KB · `get_task` ~1,5 KB · `workbench` limit 5 ~6 KB ·
`ready_tasks` limit 5 ~13 KB · **`get_board` ~60 KB · `snapshot` ~133 KB → yalnız pano denetiminde.**

**Pilotun kendi ölçütü:** iki hafta sonra üç sayı karşılaştırılır — (a) kart açılmadan kalan iş
sayısı, (b) Done'a kanıtsız geçme denemesi sayısı, (c) Linear ile pano arasındaki sapma. Pilot
"iyi hissettirdi" diye sürdürülmez.

## 6.2 İŞ KARTI — TÜM ŞERİTLER (karar 144, Recep onayı 2026-09-27)

**Kapsam:** her şerit (ALTYAPI, ARAÇ, HARİTA, ÜRÜN, KATALOG, BLOG, GEO-SEO, MEVZUAT, TASARIM ve
sonradan açılan her şerit) **elindeki her iş için** kart tutar. Kartı olmayan iş kalmaz.
**Deneme:** 2026-09-28 → 2026-10-04; sonunda §6.1'deki üç sayı + kartsız kayıt sayacı Recep'e.

**Linear ↔ kart bölüşümü:** Linear = ana kayıt, karar, gerekçe, Design bağı, kapanış yorumu
(`Fixes REC-nn` yalnız işi bitirene). Kart = şeridin o işteki küçük adımları, sıradaki adım,
kanıt komutu. Linear'da kaydı olmayan iş için kart açılmaz → önce kayıt (OPS açar; Linear'ın
250 arşivsiz kayıt sınırı yüzünden şeritler kendi başına yeni kayıt AÇMAZ, OPS'a yazar).

**Kurallar:**
1. **Kart işin BAŞINDA açılır**, sonunda değil. Başlığın ilk kelimesi `REC-nn`.
2. **Açmadan önce ara:** `kanban_read search_tasks query="REC-nn" limit 5` — varsa yenisi açılmaz.
3. **Açılış ölçümü:** yeni pencerede ilk `add_task` dönüşü ~1-3 KB olmalı. 10 KB'ı aşıyorsa o
   pencerenin MCP süreci yamadan önce başlamıştır → dur, OPS'a yaz; Recep o pencerede `/mcp` ile
   `wrongstack-kanban`'ı yeniden bağlar. Yama sonrası (ana ağaçta `tools/wrongstack-mcp/yamalar`
   değişince) açık pencerelerin hepsi yeniden bağlanır.
4. **Done yalnız kanıtla:** `verify_completion` (tek komut, boru yok — §6.1 kuralı) + `move_task`.
   `transition_task` KULLANILMAZ (yönetilmeyen panoda reddediliyor, ölçüldü).
5. **Ağır okumadan kaçın:** `get_board` / `snapshot` yalnız pano denetiminde; tek kart `get_task`.
6. **Kartsız kayıt sayacı:** `node scripts/board/kartsiz-kayit.cjs` — Linear'da açık olup kartı
   olmayan kayıtları sayar; OPS deneme boyunca günlük raporlar.
7. **OPS yoklaması:** OPS her şeritten "elindeki işler: REC · Linear durumu · gerçek durum ·
   kart var mı" beyanı ister; şerit kartsız işine aynı kodla kart açar. Karşılaştırmayı şerit
   kendisi yapar, OPS toplar.

---

## 7. Bu cetvelin kendi kapıları (uygulama sırası)

| Kapı | Soru | Durum |
|---|---|---|
| Ayna-parite | Taşınan her açık registry kaydının Linear kimliği var mı? | ORION kuyruğunda |
| NULL-id | Registry'de id'si boş kayıt var mı? (kök: PK NOT NULL garantisi vermiyor — ORION §7) | ORION kuyruğunda (şema onarımıyla) |
| Sözlük | Kapanış sebebi sözlük dışı mı? | Sözlük sütunuyla birlikte |
