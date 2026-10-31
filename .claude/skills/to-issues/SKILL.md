---
name: to-issues
description: Breaks a plan or PRD into tracer-bullet tickets (Kanban cards, aka to-tickets).
  Trigger for creating issues (issue oluştur), dividing plans (planı böl), tasks to issues.
  Do NOT use for general git operations, styling fonts, or running unit tests.
category: utils
metadata:
  triggers:
  - issue oluştur
  - planı böl
  - tasks to issues
  - kartlara böl
  inputs:
  - approved implementation plan
  outputs:
  - Kanban cards with blocking edges
depends_on:
- to-prd
next_steps: []
run_last: false
exclusions: []
---

# To Issues (to-tickets)

Planı, spec'i ya da konuşmayı **bilet**lere böl: her biri izleyici mermi (tracer bullet) niteliğinde dikey dilim, her biri kendisini **engelleyen** biletleri bildirir. Bizde bilet = Kanban kartı (Linear iş kaydı olarak emekli, karar 324; Linear'a kart yazılmaz).

## Process

### 1. Bağlamı topla
Konuşmada zaten olandan çalış. Kullanıcı bir kaynak verdiyse (spec yolu, kart numarası) tam gövdesini ve notlarını oku. Kanban'da aynı konuda açık kart var mı ara (`search_tasks`) ve var olanı çoğaltma.

### 2. Kod tabanını keşfet (gerekirse)
Bilet başlık ve açıklamaları dokunulan alanın dilini kullanır (`docs/README.md` haritası, ilgili cetvel); o alandaki karar belgelerine uyulur. İşi kolaylaştıracak ön düzenleme (prefactor) varsa ilk bilet odur: "önce değişikliği kolaylaştır, sonra kolay değişikliği yap".

### 3. Dikey dilimleri çiz
<vertical-slice-rules>

- Her dilim ilgili bütün katmanlardan (şema, servis, arayüz, test) dar ama TAM bir yol keser: dikey, tek katmanın yatay dilimi DEĞİL.
- Biten dilim tek başına gösterilebilir ya da doğrulanabilir.
- Her dilim tek bir taze bağlam penceresine sığacak boyutta.
- Ön düzenleme önce yapılır.
- **Migration içeren dilim ayrı bilettir** ve kartında "migration: yalnız Recep onayıyla birleştirilir" yazar (kural 13: master'a birleşince prod'a otomatik uygulanır). Migration'ı başka dilimin içine gömme.
- Kural 14: test ve hata yolları (ağ yok, veri boş, yetki yok) dilimin içindedir, "sonraki bilet"e bırakılmaz.
</vertical-slice-rules>

Her biletin **engelleyen biletleri** yazılır; engelleyeni olmayan hemen başlayabilir.

**Geniş yeniden düzenleme dikey dilimin istisnasıdır.** Tek bir mekanik değişikliğin (kolon adı değiştirmek, ortak sembolü yeniden tiplemek) etki alanı tüm kod tabanına yayılıyorsa ve tek düzenleme binlerce çağrı noktasını kırıyorsa hiçbir dikey dilim yeşil inemez. Bunu izleyici mermiye zorlama; **genişlet–daralt (expand–contract)** sırala: önce eski yanında yeni biçimi ekle (hiçbir şey kırılmaz), sonra çağıranları etki alanına göre boyutlanmış gruplarla (paket başına, dizin başına) taşı (her grup kendi bileti, genişletme biletine bağlı, eski biçim durduğu için CI yeşil kalır), en sonda çağıran kalmayınca eski biçimi sil (bütün taşıma biletlerine bağlı bilet). Gruplar tek başına yeşil kalamıyorsa sırayı koru ama hepsi son bir "birleştir ve doğrula" biletine bağlanan ortak bir entegrasyon dalını paylaşsın; yeşil sözü yalnız orada verilir. Veritabanı kolon değişikliği bunun tipik örneğidir: `database-migrations` skill'inin genişlet/doldur/doğrula/daralt sırası ile birlikte okunur.

### 4. Kullanıcıya sor
Önerilen dökümü numaralı liste olarak göster. Her bilet için: **Başlık**, **Engelleyen** biletler, **Neyi teslim ediyor** (uçtan uca davranış). Sonra **tek soruyla, tek öneriyle** sor (bir turda bir soru): önce ayrıntı düzeyi (çok kaba / çok ince), onay gelince engelleme kenarları, sonra birleştirme/bölme. Recep'e giden soru tek önerili ve numaralıdır; döküm onaylanana kadar yinele.

### 5. Kartları aç
Onaylanan biletleri **kendi departman panonda, engelleyenler önce** olacak sırayla Kanban kartı olarak aç. Numara pano sayacından gelir, uydurulmaz (`<ÖN EK>-<sayı>`). Her kartın açıklaması `docs/standards/is-kayit-duzeni-standard.md` ve `filo-ortak.md` "İş ve kart" kurallarındaki PLAN biçimindedir:

- **KAYNAK/CETVEL:** yöneten cetvel dosya adı, yoksa "cetvel yok, yazımı bu işin kapsamında".
- **ÖNCEKİ ÇALIŞMA:** Kanban, git geçmişi, `docs/plans` ve `docs/audits`, sage, Linear arşivi aranarak; ifadesiz "yok" yazma.
- **YÖNTEM:** önerilen yöntem ve tek cümle gerekçe.
- **PLAN** ve **BİTİŞ ÖLÇÜTÜ:** kanıt komutuyla açılır (`add_check`: `command` ya da `file_matches`; PR için `gh api repos/peckop/venthub-hvac-esite/pulls/<N>/merge`, kod için `pnpm exec vitest run <göreli test yolu>`).
- **Engelleyenler:** kartın `dependsOn` alanı (ya da `add_dependency`); metne yalnız referans yazma.
- Kabul ölçütleri kutu listesi; dosya yolu ve kod parçası yazılmaz (bayatlar). İstisna: prototip, düz yazıdan daha kesin bir kararı (durum makinesi, şema, tip şekli) kodluyorsa karar zengin kısmı kırpılıp eklenir ve prototipten geldiği not edilir.

Üst (parent) kartı kapatma ya da değiştirme. Sınır: **frontier** çalış, yani engelleyenleri biten bilet; doğrusal zincirde yukarıdan aşağıya.

Kaynak: mattpocock/skills to-tickets @5beb35b0 (MIT); bizde ad `to-issues` olarak kalır (taşıma gerekçesi PR gövdesinde).

<!-- ORTAK-BITIS-BASLANGIC (kaynak: .claude/skills/_ortak/bitis-durumu.md) -->
## Bitiş Durumu, Karışıklık ve Kanıtsız Kısıt

**Bitiş durumu — son satırda `DURUM: <kelime>` biçiminde söylenir.** Kelime **yalnız şu dörtten
biri** olabilir: `BITTI` (istenen yapıldı ve ölçüldü) · `CEKINCELI` (yapıldı ama adı konmuş bir
çekince var) · `ENGELLI` (dışarıdan bir şey bekliyor) · `BAGLAM-EKSIK` (soru cevaplanmadan devam
edilemez).

⚠**Beşinci kelime uydurulmaz.** "BEKLEMEDE", "KISMEN", "DEVAM EDIYOR" gibi kelimeler bu listede
yoktur; beklemek `ENGELLI`dir, yarım kalmak `CEKINCELI`dir. Kapalı liste bilinçli: kelime serbest
kalırsa her çağrı kendi sözlüğünü yazar ve durum makine tarafından okunamaz hâle gelir.

`BITTI` dışındaki her durum şu üçünü de yazar: **SEBEP** (tek cümle) · **DENENEN** (ne denendi,
sonucu ne oldu) · **ÖNERİ** (bir sonraki somut adım, kimde).

**Karışıklık:** yüksek riskli bir belirsizlikte tahminle devam edilmez — **DURULUR**, iki üç
seçenek gerekçesiyle yazılır ve biri önerilir. Yüksek risk: geri alınması pahalı olan, prod'a
dokunan, başka şeridin dosyasını değiştiren, para veya sır ilgilendiren iş.

**Kanıtsız kısıt yoktur:** *"olmuyor / erişemiyorum / araç desteklemiyor"* tek başına sonuç
değildir. Kısıt iddiası **birebir hata metni**, **belgeden alıntı** ya da **canlı ölçüm** ile
gelir. Kanıt yoksa doğru cümle *"ölçemedim"*dir, *"yapılamaz"* değil.

⚠**Ölçemedim ile ihlal ayrı sonuçlardır.** İkisini aynı kovaya koymak, bozuk bir ölçümü
gerçek bir kusur gibi raporlar.
<!-- ORTAK-BITIS-SON -->
