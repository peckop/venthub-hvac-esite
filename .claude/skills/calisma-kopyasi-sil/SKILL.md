---
name: calisma-kopyasi-sil
description: 'Çalışma kopyalarını (worktree, C:/tmp/vh-*) silmeden önce kapıdan geçirir, ilan eder, güvenli sırayla siler. Tetik: "worktree sil", "kopyaları temizle", "C:/tmp temizliği".'
category: guards
metadata:
  kaynak: "ALTYAPI bilgi paketi (ALT-147, 3 Kasım 2026); OPS emri, YTN-27"
  sahibi: "ALTYAPI (cetvel ve betikler), YETENEK (yetenek metni)"
---

# Çalışma kopyası silme

> Bu skill **akışı sıralar, kuralı yeniden yazmaz.** Karar, ölçüt ve eşik değerleri aşağıdaki tek kaynaklardadır; burada
> çelişen bir rakam görürsen kaynak kazanır. Silme izni **listeye değil kapıdan geçene** verilir: "kopyaları temizle"
> onayı silmeye izindir, elle çıkarılmış listeye değil.

## Ne zaman

"Eski kopyaları temizle", "worktree sil", "C:/tmp temizliği", "disk dolu", "makine yavaş, eski ağaçlar" denince; yani
`git worktree list`te kayıtlı bir ağacı ya da `C:/tmp/vh-*` altındaki bir klasörü silmeden önce.

## Ne zaman DEĞİL

- Uzak ya da yerel **dal** silmek: ayrı iştir (cetvel madde 30), bu skill'in dışında.
- **Başka departmanın** kopyası: silinmez, liste olarak OPS'a gider.
- Tek seferlik kendi bitmiş ağacın da kapıdan ve ilandan geçer; istisna yok.

## Tek kaynaklar

| Ne | Nerede |
|---|---|
| Karar üreten kapı (silmez) | `scripts/hijyen/agac-silme-kapisi.cjs` (kipler: `--agac a,b --json`, `--ilan a,b`, `--sahiplik <ad>`), açıklaması `scripts/hijyen/agac-silme-kapisi.md` |
| Kapının testi | `src/__tests__/conformance/agac-silme-kapisi.test.ts` (INV-AGAC-SILME-1) |
| Cetvel (sahibi ALTYAPI) | `docs/standards/fleet-mechanism-standard.md` özet tablo, madde 30 |
| Silen araçlar (kuru koşum varsayılan) | `tools/worktree-temizle.cjs` (kayıtlı ağaç), `tools/worktree-artik-sil.cjs` (git kaydı gitmiş artık klasör) |
| Junction kuralı | `CLAUDE.md` "Worktree `node_modules` (karar 88)" notu |

## Akış

1. **Envanter.** `git worktree list --porcelain` ve `C:/tmp/vh-*`. Kayıtlı ağaç ile git'siz düz klasörü ayrı sınıfla.
2. **Sahiplik.** Yalnız kendi departmanının kopyası. Ölçüt: dokunulan dosya kümesi ∩ şerit claim'i (`--sahiplik`). `git log` yazar alanı **kullanılmaz**: herkes aynı kimlikle commit atar.
3. **Açık işi ele.** Açık PR'lı dal, bugün değişmiş klasör, panoda claim'li ağaç listeden çıkar.
4. **Kapı.** `agac-silme-kapisi.cjs --agac <liste> --json`. Engelli ağaç bu turda silinmez; sayıyı kapının çıktısından al, elle sayma.
5. **İlan.** Kapıdan geçenler için `--ilan` ve `board.cjs note --to herkes`. Dosya tek başına ilan değildir; itiraz penceresinin süresi betikte yazılı.
6. **Pencere kapanınca kapıyı yeniden koş.** Yalnız karar `SILINEBILIR` olanlar kalır.
7. **Sil, her ağaç için satır basarak.** Kapıdan `SILINEBILIR` çıkan liste `tools/worktree-temizle.cjs --liste` biçimine (`{yol, dal, head}`) çevrilir; önce kuru koşum, gerçek koşum `--gercek --geri-alinamaz-onayladim`. **Elle silme betiği yazılmaz; araç yoksa ya da hata verirse dur.** Araçlar `node_modules` bağlantılarına girmez. Ana depodaki `node_modules/.bin` sayısı değişirse **dur**. Sonda `git worktree prune`; ana `.bin` sayısı önce = sonra.
8. **Git kaydı olmayan klasör.** `tools/worktree-artik-sil.cjs` ile kuru koşulur; araç yerel-özgün dosya bulursa klasör **atlanır** ve ayrı karara gider. Silme kapısı bu klasörleri görmez.
9. **Push edilmemiş commit'li ağaç.** Önce commit'ler `yedek/<ad>-<tarih>` dalına itilir (başkasının dal ucu oynatılmaz), sonra kapı yeniden.
10. **Rapor.** Silinen, atlanan (sebebiyle), ana `.bin` önce ve sonra. Recep'e sayı kapının çıktısından gider.

## Tuzaklar (sahada yenenler)

- `Permission denied` ya da `Directory not empty` açık dosya demektir, biri kullanıyor olabilir: **dur**, zorlama.
- Taze sıfır-commit dal "birleşmiş" görünür; squash akışında bitmiş dal "birleşmemiş" görünür. PR durumu birleşme sonrası eklenen commit'i görmez.
- Kimlik dosyası ağacın değil **oturumun** izidir; yokluğu sahipsizlik kanıtı sayılmaz.
- `git status --porcelain` tek başına izlenmeyen dizini tek satıra katlar; kapı `-uall` ile bakar.
- Windows'ta `test -e` kilitli dosyada yanlış negatif verebilir; silme kanıtı dizin listesidir.
- `rm -rf` ve `rmdir /s` bir `node_modules` bağlantısından geçerse ana deponun paketlerini siler (23 Eylül olayı): bağlantıya yalnız araçlar dokunur.
- İzin denetimi bekleyip kendiliğinden silen arka plan komutunu reddedebilir; silme ön planda koşulur ve **ret dolanılmaz**.

## Doğrulama

Yeni bir silme turundan önce adım 1-6 kuru koşulur ve kapı çıktısı elle çıkarılmış listeyle karşılaştırılır; fark varsa
kapı haklıdır. Gerçek silme yalnız kapıdan geçen listeyle, ön planda koşar.

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
