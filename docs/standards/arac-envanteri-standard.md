# Araç Envanteri Standardı (v1.0 — 2026-09-07)

> **Kapsam:** depoya konan her **araç**: Claude Code kancası (`.claude/hooks/*.cjs`), betik
> (`scripts/**` çalıştırılabilirleri), skill (`.claude/skills/*`, `.agent/skills/*`), git kancası
> (`.githooks/*`), CI iş akışı (`.github/workflows/*.yml`), cetvel (`docs/standards/*.md`).
> **Niçin ayrı cetvel:** araç yapmak kolay, izini tutmak zordur. 2026-09-07 sabahı ölçüldü:
> 119 betiğin 71'inin sahibi, 40'ının çağıranı yoktu; 67 cetvelin 14'ü ne haritada ne kapıdaydı;
> "27 kanca" denen şeyin 13'ü kanca değil açıklama dosyasıydı. Hiçbir kapı bunu görmüyordu.
> Recep'in sorusu (2026-09-07 01:00 TR): "oluşturup hatırlamadığın neler var acaba?" — cevap
> yoktu, çünkü envanter yoktu. Kayıt: REC-180.
> **SSOT:** bu dosya. Envanter belgesi: `docs/audits/arac-envanteri-<tarih>.md` (betikle üretilir).
> Kapı: `scripts/hijyen/arac-envanteri.cjs` + `src/__tests__/conformance/arac-envanteri.test.ts`
> (INV-ARAC-1..3). Defter demeti: `scripts/nlm/proje_takip_sync.py` manifestinde `arac-envanteri`.

## AXIOM 1 — Envantere yazılmayan araç YOKTUR

Bir kanca, betik, skill, CI iş akışı ya da cetvel, envanter belgesinde satırı olmadan **var
sayılmaz**: PR'a girmesi, diske yazılması, çalışması onu "var" yapmaz. Çünkü var olduğunu
yalnız yazan bilir; yazan unutunca araç yaşamaya devam eder ama kimse bilmez (ölü olabilir, canlı
ama sahipsiz olabilir; ikisi de aynı görünür).

**Sonuç:** yeni araç açan PR **aynı PR'da** envanter satırını taşır (üretilmiş-artefakt cetveli
AXIOM 2 ile aynı ilke: tarif ile ürün birlikte yolculuk eder).

## AXIOM 2 — Sahipsiz araç yoktur; sahipsiz kalan OPS'a yazılır

Her satırın bir **sahip şeridi** vardır (URUN · URUN-KATALOG · ALTYAPI · OPS). Pano claim
glob'u bir yolu kapsıyorsa sahip o şerittir. Hiçbir claim kapsamıyorsa sahip **OPS**'tur ve
OPS ilk fırsatta bir şeride devreder ya da ölü sayar. "Sahipsiz" envanterde geçerli bir değer
**değildir**; kapı bunu kırmızı yapar (INV-ARAC-2).

## AXIOM 3 — Kanıtsız araç ÖLÜ ADAYDIR; ölü aday karantinaya gider, silme Recep kapısıdır

Bir araç şu **dört** sorudan geçer; ilk "hayır" sınıfı belirler:

| # | Soru | Hayır ise |
|---|---|---|
| 1 | **Çağıranı var mı?** (package.json `scripts`, CI `run:`, kanca komutu, `.claude/settings.json`, başka betik, skill, cetvel, komut rehberi) | ÖLÜ ADAY |
| 2 | **Son 30 günde koşum izi var mı?** (CI run damgası, pano/log dosyası, ürettiği çıktının commit tarihi) | ÖLÜ ADAY |
| 3 | **Bir kapı ya da test onu sınıyor mu?** | KAL (kapısız) — kapı borcu satıra yazılır |
| 4 | **Ürettiği çıktı KABUL EDİLİYOR mu?** — yalnız çıktı üreten araçlar için (PR, öneri, rapor, ticket). Ölçüt **çıktı kabul oranı**: üretilenin kaçı merge/uygulandı. | ÇIKTISI REDDEDİLDİ |

### AXIOM 3'ün dördüncü sorusu niçin var (ölçüldü 2026-09-14, REC-333)

`ai-auto-repair.yml` ilk **üç** sorudan **geçiyordu**: çağıranı vardı (`ci.yml:201`), koşum
izi vardı, Jules'a fiilen görev gidiyor ve dal yaratıyordu. Ama ürettiği **10 PR'ın hepsi
CLOSED — 0/10 merge.**

Yani ne **KAL** (bir gün işe yarar) ne **ONAR** (zincir kırık) doğruydu: **araç çalışıyordu,
çıktısı kabul edilmiyordu.** Bu, atıl araçtan **ayrı bir sınıftır**: atıl araç
**çağrılmaz**; bu araç **çağrılıyor ama çıktısı kabul edilmiyor.** Üç soru bu sınıfa kör
olduğu için dördüncüsü eklendi.

⚠**Sınırı:** soru yalnız **çıktı üreten** araçlara sorulur. Bir kapının ya da ölçüm
betiğinin "çıktısı" onun kırmızı/yeşil hükmüdür; orada kabul oranı anlamsızdır ve alan
`yok` yazılır. Ayrıca kabul oranı **ölçülmeden** yazılmaz: sayıyı veren kaynak (örneğin
`gh pr list --search ...` çıktısı) satırın kanıtına eklenir.

⚠**`CIKTISI-REDDEDILDI` durumunun kapı tarafı boştur:** `INV-ARAC-3` yalnız `OLU-ADAY`
satırlarının bayatlığını ölçer, bu durumu ölçmez. Yani bu hüküm bugün **insan
hükmüdür** ve mekanik bir tazelik kapısı yoktur — bu, bilinen ve yazılı bir kapı borcudur.

### ⚠AXIOM 3'ün SINIRI — üretilen satırın `durum` sütunu insan metni TUTMAZ

**Ölçüldü 2026-09-14 (#1185'te sessizce kaybedildi, #1188'de yeniden ölçüldü):**
"üretilen dosya elle düzenlenmez, yalnız insan hükmü kolonları elle yazılır" izni
**mevcut ve YENİ satırlar** içindir.

Üreticinin **KAYIP** işaretlediği bir satırın `durum` sütunu **üreticinin malıdır**:
konformansın `YAZMA KIPI IDEMPOTENT` kolu kendi içinde `--yaz` koşar ve o sütunu kanonik
hâline **geri yazar.** #1185'te o sütuna elle yazılan hüküm **commit'ten önce silinmişti**
ve "yazıldı" diye rapor edilmişti; master'da olmadığı sonradan ölçüldü.

→ **Kural:** hüküm **üretilmeyen yere** yazılır — anlatı satırına, denetim belgesine, PR
gövdesine. Mevcut bir satırın insan kolonları (`kanit`, `kapi`, `durum`) gerçekten
insanındır ve üretici onlara dokunmaz; bu 2026-09-14'te ölçüldü (26 satıra elle sınav
kanıtı yazıldı, `--yaz` sonrası fark **0 bayt**).

- **ÖLÜ ADAY** hükmü tek taramayla verilmez: ikinci bir göz (bağımsız ajan ya da başka şerit)
  çağıran kanallarını yeniden arar ve **ÖLÜ DOĞRULANDI / CANLI / ÖLÇÜLEMEDİ** yazar.
  (2026-09-07: ilk taramanın 40 ölü adayının bir kısmı ikinci gözde canlı çıktı; tek göz yetmez.)
- **ÖLÜ DOĞRULANDI** → OPS karantinaya taşır (`C:/tmp/<karantina-dizini-tarih>`, geri alma `mv`);
  karantina eylemi aynı turda durum dosyasına yazılır (hafıza: onaylı eylem aynı turda state'e).
- **Silme** yalnız Recep onayıyla; envanter satırı "SİLİNDİ <tarih> <PR>" olarak kalır (tarihçe).
- **ÖLÇÜLEMEDİ** ölü de canlı da değildir; satırda sebep yazar, 7 gün içinde yeniden ölçülür.

## 1 · Envanter satırının zorunlu alanları

| Alan | Değer | Kural |
|---|---|---|
| `yol` | depo köküne göre | tek satır tek araç |
| `tur` | hook · betik · skill · githook · ci · cetvel | başka değer yok |
| `ne_yapar` | bir cümle | aracın kendi başlık/frontmatter satırından; boş bırakılmaz |
| `sahip` | URUN · URUN-KATALOG · ALTYAPI · OPS | "sahipsiz" geçersiz (AXIOM 2) |
| `tetik` | nereden çağrılır | `package.json:<script>` · `ci:<dosya>` · `hook:<olay>` · `githook:<ad>` · `skill:<ad>` · `elle` · `cagiran-yok` |
| `kanit` | son koşum izi | damga + kaynak (`ci-run 2026-09-06T20:44Z` · `pano .bash-audit 2026-09-07` · `cikti docs/x.md 2026-09-05`) ya da `yok` |
| `kapi` | sınayan test/betik | dosya adı ya da `yok` |
| `durum` | KAL · KAL-KAPISIZ · OLU-ADAY · OLU-DOGRULANDI · CIKTISI-REDDEDILDI · KARANTINA · SILINDI · OLCULEMEDI | AXIOM 3 |

⚠**`cikti_kabul` bugün AYRI BİR KOLON DEĞİL, `kanit` içine yazılır** — biçim
`cikti-kabul <kabul>/<uretilen> (<kaynak>)`, örnek `cikti-kabul 0/10 (gh pr list)`.
Çıktı üretmeyen araçlarda hiç yazılmaz.

Niçin kolon değil: envanter tablosu **üretilen** bir artefakttır ve yeni bir kolon
üreticinin başlık okuma/hücre doldurma mantığını değiştirmeyi gerektirir. Cetvele
uygulanamayan bir alan yazmak, belgenin kendi cetvelini ihlal etmesi olurdu. **Ayrı kolon
bilinen bir borçtur** ve üretici o kolonu doldurabildiği gün açılır; o güne kadar ölçüt
`kanit` içindeki damgadır.

Companion `.md` dosyaları (`*.cjs` yanındaki açıklama), `__pycache__`, `README.md` **araç
değildir**; envantere girmez (2026-09-07 dersi: 13 companion "kanca" sayıldı, evren yanlıştı).

## 2 · Kapı (INV-ARAC-1..3)

Envanter **elle yazılmaz**; `scripts/hijyen/arac-envanteri.cjs` dosya sistemini tarar, mevcut
satırların elle doldurulan alanlarını (`ne_yapar`, `sahip`, `durum` gerekçesi) korur, yeni
dosyaları `durum=YENI` ile ekler, kayıp dosyaları `durum=KAYIP` yapar. Konformans testi:

- **INV-ARAC-1 — Evren eşitliği:** dosya sistemindeki araç kümesi ↔ envanter satırları farkı
  **0**. Yeni betik eklenip envantere yazılmazsa PR **düşer**. Sabotaj: geçici `scripts/x.mjs`
  ekle → kırmızı görülmeli.
- **INV-ARAC-2 — Sahip zorunlu:** `sahip` alanı boş/"sahipsiz" olan satır 0.
- **INV-ARAC-3 — Ölü aday tazeliği:** `OLU-ADAY` durumundaki satır 14 günden eski olamaz (ya
  ÖLÜ DOĞRULANDI/CANLI hükmü alır ya da OLCULEMEDI + sebep). Takvimle kızaran kapı riski
  bilinir (hafıza: takvimle-kirmiziya-donen-kapi); bu yüzden eşik gün, saat değil, ve mesaj
  "hüküm ver" der, "sil" demez.

Kapı fail-closed: envanter dosyası yoksa ya da ayrıştırılamıyorsa **KIRMIZI** (hafıza:
fail-open-kapi-kapi-degildir).

## 3 · Defter demeti

Envanter belgesi `docs/audits/arac-envanteri-<tarih>.md` manifest demeti `04-olcumler-audits`
ile, bu cetvel `02-cetveller-standards` ile defterde bulunur (ölçüldü 2026-09-07: `manifest.json`
14 demet, ikisi de glob'la kapsıyor; ayrı demet açılmaz, aynı dosya iki demete girmez —
mükerrer yükleme yasağı). Gün kapanışı `esitle` ile taşınır. Defter "bu betik ne yapar, kimin,
canlı mı" sorusuna envanter satırıyla cevap verir; cevap veremiyorsa envanter eşitlenmemiştir
(AXIOM 1 defter tarafında ihlal).

## 4 · İşleyiş

1. **Yeni araç:** PR'da araç + envanter satırı + (varsa) kapı. Satır yoksa INV-ARAC-1 düşürür.
2. **Aylık tarama (OPS):** betik koşulur, YENI/KAYIP satırlar hükme bağlanır, ölü adaylar ikinci
   göze gönderilir, sonuç Recep'e tek sayfa (kaç araç · kaçı canlı · kaçı ölü aday · kaçı
   karantinada).
3. **Karantina/silme:** AXIOM 3.
4. **Şerit devri:** claim değişince envanterdeki `sahip` aynı PR'da değişir.

## 5 · Neden bu biçim (kısa)

- **Betik üretir, insan hükmeder:** sayım elle yapılınca evren kayıyor (27 vs 14 kanca).
- **Tek göz yetmez:** ölü hükmü pahalıdır (silinen araç geri gelmez); ikinci göz zorunlu.
- **Kapı hatırlamaya bağlı değil:** cetvel tek başına "hatırlarsam uygularım"dır; INV-ARAC-1
  unutmayı mekanik olarak yakalar.
