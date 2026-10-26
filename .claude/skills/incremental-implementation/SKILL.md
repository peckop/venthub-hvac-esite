---
name: incremental-implementation
description: "Çok dosyalı işi ince, test edilen dilimlerle uygular; kapsam disiplini, bayrak. Tetik: \"dilimle\", \"adım adım uygula\", 100+ satır öncesi."
category: execution
license: MIT
metadata:
  kaynak: "addyosmani/agent-skills incremental-implementation @f3400940f6961e68fa56bdb6214d0183d8d8ae49 (MIT), VentHub'a uyarlandı"
  uyarlama: "YETENEK 2026-10-26 (YTN-21, karar 416, alım listesi madde 6): commit, test ve görev listesi kuralları bizim düzene çevrildi; yeni skill"
---

> **Kaynak:** addyosmani/agent-skills `incremental-implementation` @f3400940f6961e68fa56bdb6214d0183d8d8ae49 (MIT).
> Aşağıdaki "VentHub ek kuralları" bize aittir ve kaynak metinden ÖNCE okunur; çelişirse onlar kazanır.

## VentHub ek kuralları

1. **Commit yalnız istenince atılır.** Kaynaktaki "her dilimde commit" bizde "her dilimde dur, kanıtı göster; commit/PR istenince tek commit" olur (`git-flow`, `git-commit`). Dilimler geri alınabilir kalır ama ayrı commit olmak zorunda değil.
2. **Test yerelde `pnpm test:ilgili`**, değişen test dosyası `pnpm exec vitest run <göreli test yolu>`; tam paket, tam type-check ve `next build` yerelde koşturulmaz, CI koşar (filo-ortak "Test ve bellek"). Kaynaktaki "tüm testleri çalıştır" maddeleri bu şekilde okunur.
3. **Görev listesi Kanban kartıdır.** Dilim = alt kart ya da kartın planındaki adım (`docs/standards/kart-plani-standard.md`); `tasks/todo.md` açılmaz. "Fark ettim ama dokunmuyorum" listesi karta not ya da ayrı kart olur (kural 14: ilgisiz iş ayrı kayıt, numarası raporda).
4. **Sadelik ile tam iş birlikte.** "En basit çalışan şey" kapsamı küçültür, hata yollarını (ağ yok, veri boş, yetki yok) ve testi küçültmez. İki çözümün farkı yalnız satır sayısıysa tam olanı seç (kural 14).
5. **Migration'lı dilim = Recep onayı.** Şema değişikliği içeren dilim master'a birleşince prod'a otomatik uygulanır (kural 13): `create-migration` + `database-migrations` + `plan-challenger`; onay işi koşan pencerede alınır, dilimler arası taşınmaz.
6. **Bayrak.** Tamamlanmamış özellik kullanıcıya görünmeyecekse bayrak kapalı birleşir (örn. adres şeması bayrağı); ortam değişkeni değişikliği ve canlı yazım OPS'tadır. Geri alma yolu karta yazılır.
7. **Kapsam sınırı.** Kapsam şeridiyle (`board claim`) ve kartla belirlenir; sınırın dışındaki dosyaya dokunma. Genel bileşen yazmadan önce olgun kütüphane ara (karar 181).

## Dilim döngüsü

Uygula → Test et → Doğrula → (istenince commit) → sonraki dilim. Her dilim sistemi çalışır ve test edilebilir bırakır.

1. **Uygula**: en küçük tam parça.
2. **Test**: ilgili test (yoksa yaz).
3. **Doğrula**: test geçti, tip hatası yok, gerekirse elle kontrol (görsel işte canlı sayfa ölçümü).
4. **Kanıt**: ne yapıldığı ve ne koştuğu karta/rapora tek satır.
5. **Sonraki dilime geç**, baştan başlama.

## Dilimleme biçimleri

- **Dikey dilim (tercih)**: kullanıcının göreceği bir yol; şema + servis (DI) + uç + UI. Örn. önce "teklif oluştur", sonra "listele", sonra "düzenle".
- **Sözleşme önce**: arka uç ve ön uç paralel gidecekse önce tipler/uç sözleşmesi, sonra iki taraf, sonra entegrasyon.
- **Risk önce**: en belirsiz parçayı önce kanıtla (örn. webhook imza doğrulaması), başarısızsa geri kalanına yatırım yapılmaz.

## Kurallar

- **Bir dilim bir şey değiştirir.** Yeni bileşen + başka bileşenin refactor'u + yapılandırma değişikliği aynı dilimde olmaz.
- **Derlenebilir kal.** Her dilimden sonra proje derlenir (CI'da) ve mevcut testler geçer.
- **Güvenli varsayılan.** Yeni kod kapalı/muhafazakâr varsayılanla gelir (bildirim kapalı, yeni davranış bayrakta).
- **Geri alınabilirlik.** Eklemeler kolay geri alınır; mevcut kodda değişiklik küçük ve odaklı; bir şeyi silip aynı dilimde yerine yenisini koyma, ayır.
- **Kapsam disiplini.** Yalnız görevin gerektirdiğine dokun: yan koddaki "temizlik", ilgisiz içe aktarma düzeltmesi, anlamadığın yorumu silmek, spec'te olmayan "faydalı" özellik yok. Fark edileni yaz, düzeltme (bkz. kural 3).

```
FARK ETTİM AMA DOKUNMUYORUM:
- src/utils/format.ts içinde kullanılmayan içe aktarma (ilgisiz)
→ Ayrı kart açılsın mı? (numara raporda)
```

## Ajana dilim verirken

Alt ajana dilimi tek cümleyle sınırlı ver: "Plandaki 3. adım: yalnız şema değişikliği ve uç. UI'a dokunma. Bitince `pnpm exec vitest run <yol>` çıktısını getir." Açık PR dalına push yok, kapsam dışı dosya yok (execution-method-standard §10).

## Dilim kontrol listesi

- [ ] Değişiklik tek şey yapıyor ve eksiksiz yapıyor
- [ ] İlgili testler geçiyor (`pnpm test:ilgili` / `pnpm exec vitest run <yol>`)
- [ ] Tip ve lint temiz (CI'da; yerelde yalnız değişen dosya)
- [ ] Yeni davranış beklendiği gibi çalışıyor (kanıt: test ya da canlı ölçüm)
- [ ] Hata yolları (boş veri, yetkisiz, ağ yok) kodla birlikte yazıldı
- [ ] Kart notuna kanıt yazıldı

Aynı doğrulama komutunu kod değişmeden ikinci kez koşma; bilgi eklemez.

## Bahaneler ve gerçekler

| Bahane | Gerçek |
|---|---|
| "Hepsini sonda test ederim" | Hata birikir; 1. dilimdeki hata 2-5'i yanlış yapar. |
| "Hepsini birden yapmak daha hızlı" | Bozulana kadar; hangi 500 satırın bozduğunu bulamazsın. |
| "Bayrağı sonra eklerim" | Özellik bitmediyse görünmemeli; bayrak şimdi. |
| "Bu refactor küçük, buraya katayım" | Özellikle karışan refactor ikisini de inceleme ve hata ayıklamada zorlaştırır; ayır. |
| "Tek satır, ilgisiz ama düzelteyim" | Kapsam dışı, ayrı kart (kural 14). |

## Kırmızı bayraklar

- Test koşmadan 100+ satır yazıldı
- Bir dilimde birbiriyle ilgisiz değişiklikler
- "Şunu da hızlıca ekleyeyim" kapsam genişlemesi
- Doğrulama adımı hız için atlandı
- Dilimler arasında derleme ya da test kırık
- Üçüncü kullanım gelmeden soyutlama kurmak
- Görevin dışındaki dosyaya "madem buradayım" dokunuşu

Kaynak: addyosmani/agent-skills incremental-implementation @f3400940f6961e68fa56bdb6214d0183d8d8ae49 (MIT)

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
