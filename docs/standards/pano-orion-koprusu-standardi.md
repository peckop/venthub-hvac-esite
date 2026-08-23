# Pano ↔ Orion Köprüsü Cetveli (RFC-1)

> **Karar:** AYRI TUT + KÖPRÜLE — 2026-08-23, Recep onayı.
> RFC-1 süreci: OPS önerisi → 3 şerit görüşü (I18N, AUTH, ORION — üçü de ölçümlü) → oybirliği → onay.
> Bu cetvel, panonun ve Orion'un **niçin birleştirilmediğini** ve köprünün **nasıl kurulacağını** yönetir.

## 1. Tez ve gerekçe

**Pano** (C:/tmp/venthub-board, append-only JSONL) = filonun **sinir sistemi**: claim/nabız/not,
saniyeler-saatler ömürlü, sıfır bağımlılık. **Orion** (registry, CLI+MCP) = **arşiv + kokpit**:
görev/faz/karar, günler-aylar ömürlü, sorgulanabilir.

Birleştirilmez, çünkü (hepsi 2026-08-23'te ölçüldü):

1. **Canlılık rehin verilmez.** Oturum ölümlerinde/MCP çöküşlerinde ayakta kalan tek katman
   pano oldu; aynı gün Orion MCP bayat çalışma-ağacı koşuyordu (commit'siz `_MIGRATIONS`
   satırı canlı registry'ye düştü — ölçüldü). Koordinasyon hattı, koordine ettiği her şeyden
   **aptal ve sağlam** olmalı; AUTH formülü: *"koordine ettiği şeyden daha az hareketli parça."*
2. **Eşzamanlılık modeli farklı.** Pano oturum-başına append-only dosya = 7 eşzamanlı yazar
   çatışmasız; Orion tek SQLite dosyası = kilit/yarış riski.
3. **Bayatlık kanıtı:** Orion'da venthub-hvac'ın son görev güncellemesi 08-18'de kalmıştı;
   o 5 günde filo 5 büyük işi prod'a soktu. Pano=an, Orion=tarih ayrımı gözlemseldir.

**Dürüst maliyet (I18N):** ayrılık kaydı parçalar — bir günün işi pano + hafıza + docs/audits'te
yaşar. Bu faturayı köprü öder; ödemiyorsa köprü eksiktir.

## 2. Köprü — üç faz

### Faz 0 — Pano sertleştirme (önkoşul; sahip: ALTYAPI)
- **sid-RET:** `--sid` UUID biçiminde değilse yazma **REDDEDİLİR** (uyarı değil). Hayalet
  `events.<çöp>.jsonl` sınıfı kapanır. Köprü yalnız canlı claim listesindeki sid'leri kabul eder;
  ret sayısı görünür tutulur (sessiz düşürme = yeni sahte-yeşil sınıfı).
- **PARK durumu:** claim'e `park + gerekçe + açan merci`. Park ≠ sahipsiz; pano bugün ikisini
  ayırt edemiyor ve bu bilgi kaybı değil **yanlış bilgi** üretiyor.
- **Rotasyon/limit:** events dosyalarına günlük rotasyon (biri ~600KB ölçüldü). MEMORY.md dersi:
  limit sessizce ısırır ve **önce en taze kayıt** görünmez olur. Köprü yazmadan önce limiti ölçer.
- **Claim-DELTA:** claim değişimi (kim, hangi glob, ne zaman, aldı/bıraktı) **olay** olarak
  yazılır. Union-blob gerçek sanılmaz; kısmi-release arşiv seviyesinde bedavaya gelir.

### Faz 1 — TEK YÖN: pano → Orion (sahip: ORION; K2 sonrası)
- **Taşıyıcı:** oturum-DIŞI cron, **stabil kurulu kopyadan** (K2). MCP değil — MCP çalışma
  ağacını koşar; senkronun kod sürümü şeride göre değişemez. Oturum-bağlı cron da değil —
  oturum ölümünde taşıyıcı ölür (ölçüldü) ve bu arıza değil tasarımdır.
- **Okuma:** pano **JSONL dosyalarından** okunur; `who` insan-çıktısı **asla kazınmaz**
  (köşeli-parantez ayrıştırma körlüğü üç biçimde ölçüldü). Kapsam: son N gün.
- **Taşınan olaylar** (bugün "git arkeolojisi gerektiren" sınıf): claim-delta ·
  merge-indi (PR → SHA + dokunulan globlar) · kapı-kırmızı (hangi kapı, hangi commit) ·
  öncül-düzeltmesi / karar geri alma · GO kayıtları (kim, neye, hangi kapsamla).

### Faz 2 — Ters yön: Orion → pano (Faz 1 bir hafta sorunsuz koştuktan sonra)
- **Yalnız dört olay:** görev BLOCKED (+bloke eden) · kapı açıldı/kapandı · faz tamamlandı
  (sıradaki hazır) · karar `active` oldu.
- **Ölçüt (ORION):** *"Bu olayı görmeyen bir şerit yanlış iş yapar mı? Hayırsa panoya düşmez."*
  `task created/updated/completed` panoya düşmez — günde onlarca olur, kimsenin o anki kararını
  değiştirmez, panonun sıfır-bağımlılık özelliğini yer.
- İki yön açıkken **çatışma çözümü:** "şu an kim sahip" için PANO otorite; "ne oldu" için
  ORION otorite. Çelişirse canlı karar panoya, tarih Orion'a göre yazılır.

## 3. Bilgi katmanları (aynı mimarinin parçası)

| Bilgi | Evi | Ömür |
|---|---|---|
| Anlık koordinasyon (claim/nabız/not/kuyruk) | **Pano** | saniyeler–saatler |
| İş kaydı (görev/faz/karar/ilerleme) | **Orion** | günler–aylar |
| Kalıcı dersler (feedback/kural) | hafıza dosyaları + MEMORY.md indeksi | kalıcı |
| Oturum/compact durumu | şerit-başı `*-state.md` + `lane-day-states-index.md` | oturumlar arası |

Compact hazırlığı MEMORY.md'ye **durum yazmaz** (24KB kırpma vakası: en taze girdiler
sessizce düşer). Hafızaya yazan, girdi saymaz **bayt ölçer**.

## 4. Sınavlar (köprü kodu yazılırken zorunlu)

1. **Ayakta-kalma:** Orion süreci öldürülür → pano yazma/okuma etkilenmez (KIRMIZI olursa
   köprü bağımlılık sızdırmış demektir).
2. **Hayalet-ret:** canlı olmayan sid'li olay köprüye verilir → REDDEDİLİR ve ret sayacı artar.
3. **Kazıma yasağı:** köprü kaynağında `who` çıktısı ayrıştırma yok; `[lang]` içeren glob'lu
   claim birebir taşınır (pozitif kontrol: bilinen glob çıktıda AYNEN var).
4. **Gürültü kapağı:** Faz 2'de dört olay dışında hiçbir Orion olayı panoya düşmez
   (sabotaj: task-completed yayını eklenir → sınav KIRMIZI).

## 4.5 Nöbetçi — oturum-dışı sessizlik dedektörü (AUTH fikri, 2026-08-23)

**Yapısal boşluk (üç şeritte aynı gün ölçüldü):** üçlü mekanizmanın üç ayağı da oturuma
bağlı; oturum ölünce üçü birden gider ve **"oturumun kendisi öldü" olayını görebilen hiçbir
katman yok** — bugün bunu sistem değil Recep fark etti.

**Çözüm — iki adım, ucuz olan önce:**
- **Adım 1 (NÖBETÇİ):** Windows Görev Zamanlayıcı'ya bağlı, diske kayıtlı küçük betik.
  YALNIZ ÖLÇER ve HABER VERİR: panoyu okur, "X şeridi N dakikadır atış yapmıyor VE claim'i
  PARK değil" gerçeğini panoya yazar / Recep'e bildirir. Oturum başlatmaz, kota yakmaz,
  geri alınamaz hiçbir şey yapmaz. **Önkoşul: Faz 0'ın PARK durumu** — nöbetçi "sessiz ama
  park" ile "sessiz ve sahipsiz"i ancak pano bu durumu taşıyorsa ayırt eder.
- **Adım 2 (UYANDIRICI, varsayılan KAPALI):** başsız oturum başlatma (`claude -p`).
  **Doğrulanmamış varsayım** — kurulmadan önce bir kez gerçekten koşulup kanıtlanır;
  ayrıca dışarıdan oturum başlatmak görünmez kota yakar → **yalnız Recep açıkça isterse.**
- **Nöbetçinin kendi canlılık kanıtı:** kendi nabzını panoya yazar; N dakikadır yazmıyorsa
  o da sinyaldir ("her şey öldüğünde çalışan" bileşen sessizce ölürse kimse fark etmez).

## 5. Uygulama sırası

T011 (faz kapısı, ORION) → **K2** (MCP stabil kopya + restart, OPS) → venthub roadmap
kurulumu (OPS) → **Faz 1 köprü** (ORION iş emri) → **Faz 0** pano işleri (ALTYAPI, uyanınca)
→ **Nöbetçi Adım 1** (Faz 0 sonrası; sahip ALTYAPI/OPS) → bir hafta gözlem → **Faz 2**.
