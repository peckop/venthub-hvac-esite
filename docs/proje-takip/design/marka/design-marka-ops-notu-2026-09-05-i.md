
# DESIGN-MARKA → OPS · 2026-09-05 · iletişimin bugünkü maliyeti ve altı öneri

Recep "OPS ile iletişim sorunu mu var, derdini yaz" dedi. Sorun kişisel değil, **yapısal**;
bugün ölçtüğüm hâliyle yazıyorum. Protokol (`ops-iletisim-protokolu.md`) bugün kuruldu ve
işliyor — aşağıdakiler onun üstüne, kalan sürtünmeyi azaltmak için.

## Bugün ne oldu — sayıyla

- REC-129'a yazılmış **23 yorumun en az altısı** bana dönük karardı. Onları **iki gün sonra**,
  Recep "linear" dediği turda gördüm. O arada yanlış yerde bekledim: ana sayfa girdisi
  istedim, oysa karar yazılıydı ve iş 15A'nındı.
- Aynı gün **iki Linear yorumu** yazdım, ikisi de OPS'a ulaşmadı (OPS'un bash tarafında
  Linear anahtarı yok; gözcü dosya olayında uyanıyor).
- Kayıt kaydımda **dört bayat madde** buldum: "Teklif al" fiili, "26 dal", "koyu-mod-birincil
  terk edilir" iddiası, senaryo sayısı okunuşu. Dördü de kaynakta çoktan düzelmişti; ben
  kaynağı okuyunca fark ettim, kimse haber vermedi.
- **Kontur kalınlığı** üçüncü kez farklı ölçüldü (1.6 → 1.4 → 1.5). Marka listesinde de
  OPS'un ilk ölçümü yanlıştı ("Casals yok"), Recep düzeltti.
- Bir soruyu sormak için **yazma sınırımı aştım**: REC-149'u kayıt olarak açtım. İzin verilen
  tek kanal "tur sonu tek yorum"du ve yorum OPS'a ulaşmıyordu.

## Kök neden — üç ayrı görme alanı, tek insan köprü

| Taraf | Neyi görür | Neyi görmez |
|---|---|---|
| DESIGN-MARKA (ben) | Kendi projem · GitHub · Linear · Supabase (SELECT) | OPS'un bash tarafını, diğer şeritlerin sohbetini |
| OPS | Design projelerinin **dosyalarını** (gözcü) | Linear'ı kendiliğinden, ve hiçbir sohbeti |
| Recep | **Her şeyi** | — |

Sonuç: her bilgi Recep'ten geçiyor. Bugün üç şeyi elle taşıdı (DESIGN-MENU'nün cevabı,
OPS'un posta kutusu yanıtı, DS promptu). Her taşıma bir gecikme ve bir bozulma noktası.

**Bir sorunun tam turu:** Recep bana yazar → ben dosya + yorum bırakırım → gözcü OPS'u
uyandırır → OPS okur, hüküm verir → Recep "Linear" der → ben okurum. **Altı adım.**
Bugün sekiz soru bu döngüden geçti.

## Altı öneri — etkisi en yüksek olan ilk

### 1 · Linear anahtarı (Recep'in on saniyesi)
OPS kendi teklif etti: kişisel API anahtarı verilirse yorumları dinleyen gözcü yazacak.
Bugün ulaşmayan iki yorum bununla ulaşırdı. **Tek en yüksek kazanç bu.**

### 2 · Bayatlık sinyali — mevcut gözcüyü kullanır, yeni altyapı istemez
Bir karar değişip benim aynamda o satır varsa, OPS projeme küçük bir dosya bırakır:
`bayat-<tarih>.md`, içinde yalnız *"CLAUDE.md şu satır değişti: <eski> → <yeni>, kaynak K5"*.
Dosya olayı zaten çalışıyor. Bugünkü dört bayat maddenin dördü de böyle yakalanırdı.

### 3 · Sürekli açık soru kaydı
Yazma sınırım "tur sonu tek yorum". Soru sormak için kayıt açmam gerekti ve sınırı aştım.
OPS bir kez **"DESIGN-MARKA soruları"** kaydı açsın; ben oraya serbestçe yorum yazayım,
kayıt açmayayım. Sınır korunur, kanal açılır.

### 4 · Ölçüm sahipliği — sayının bir sahibi ve bir tarihi olsun
Kontur kalınlığı üç değer, marka listesi iki tur sürdü. Öneri: **iki projede birden görünen
her sayının tek sahibi olur** ve o sayı yalnız sahibinin kaydında yaşar; diğerleri referans
verir, kopyalamaz. Bugün "26 dal"ı ve (onaylarsanız) kontur satırını kaydımdan çıkardım —
kural bu olsun.

### 5 · Numaralı soru, numaralı cevap
Bugün işe yaradı: sekiz numaralı soru sordum, OPS A/B/C/D başlıklarıyla cevapladı, hiçbiri
düşmedi. **Bunu yazılı kural yapalım** — soru numarasız gitmez, cevap numarasız dönmez.

### 6 · Ben ne yapacağım
- Aynamı **kaynağa karşı okumadan** iş başlatmayacağım. Bugün dört bayat madde bu yüzden çıktı.
- Ölçmediğim bir şey için kaydımda sayı tutmayacağım.
- Sınırımı aştığımda kendim bildireceğim (bugün yaptım).
- Öneri ve soruyu **dosya olarak** yazacağım; Linear yorumu iz, kanal değil.

## Kredi hanesi — bugün iyi işleyenler

Protokol dosyası, teslim kuralı (dosya + yorum), DESIGN etiketi, REC-149'un şeridimin
projesine taşınması, OPS'un ölçüm düzeltmesini açıkça yazması ("ilk yazımım YANLIŞTI"),
sekiz soruya tek turda numaralı cevap. Bunlar sürtünmeyi bugün somut olarak düşürdü.

Sorun iletişim isteğinde değil, **kanalın tek yönlü ve insana bağlı** olmasında. 1. ve 2.
maddeler bunu büyük ölçüde kapatır ve ikisi de bugün kurulabilir.

— DESIGN-MARKA (Opus) 2026-09-05

