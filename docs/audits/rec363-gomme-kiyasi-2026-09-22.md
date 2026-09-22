# REC-363 · Çapalı hafızada Türkçe anlamca arama — taşıyıcı kıyası (2026-09-22)

> **Sahip:** ALTYAPI (ölçüm) · **Hüküm:** OPS · **Betik:** `scripts/hafiza/gomme-kiyasi.mjs`
> **Fikstür ve sınav:** OPS, Linear REC-363 yorum `b2a66181` (20 ders, 8 olumlu + 2 olumsuz soru; sorular
> dosya adındaki kelimeleri bilerek kullanmıyor). Güvenlik etiketli ders fikstürde yok.

## 1 · Düzenek

| Kol | Ne | Nerede koşar | Veri dışarı çıkar mı |
|---|---|---|---|
| C0 | `Xenova/all-MiniLM-L6-v2` — `@wrongstack/vector-memory`'nin **varsayılan** modeli (İngilizce) | yerel ONNX | hayır |
| C1 | `Xenova/multilingual-e5-small` (çok dilli, `query:`/`passage:` önekli) | yerel ONNX | hayır |
| C2 | `Xenova/paraphrase-multilingual-MiniLM-L12-v2` (çok dilli) | yerel ONNX | hayır |
| B1 | NVIDIA `nvidia/nemotron-3-embed-1b` | NVIDIA ücretsiz uç | **evet** (yalnız iç kullanım şartı) |
| A | başsız Haiku (`claude -p --model haiku`), 20 dersin ilk 400 karakterini okuyup puanlar | Anthropic | evet |
| H | **hibrit:** C1 en yakın 10 dersi seçer → Haiku yalnız o 10'u puanlar | yerel + Anthropic | evet (10 ders) |

Ders metni = frontmatter `description` + gövde, `[[bağ]]`lar ve dosya adı çıkarılmış, ilk 1500 karakter
(bütün kollara aynı kesim). Her soru **3 kez** soruldu (toplam olumlu deneme 8 × 3 = 24).

**Adaylardan düşenler (ölçüldü):** REC-363'ün adadığı `nvidia/llama-3.2-nv-embedqa-1b-v2` ve `baai/bge-m3`
**410 GONE** — NVIDIA ikisini kaldırmış (EOL 2026-05-18 ve 2026-08-25). Model listesindeki
`llama-3.2-nv-embedqa-1b-v1` ve `nv-embedqa-mistral-7b-v2` **bu hesaba 404**. Hesaptan erişilebilen tek
güncel çok dilli gömme modeli `nemotron-3-embed-1b` → B kolu tek modelle koştu.

## 2 · Sonuç

| Kol | Doğru ders 1. sırada | İlk 3'te | İlk 10'da | Olumlu sorularda en düşük 1. puan | Olumsuz sorularda en yüksek puan | Sorgu süresi | Soru başına bedel |
|---|---|---|---|---|---|---|---|
| C0 İngilizce yerel | 9/24 | 18/24 | 18/24 | 0,481 | **0,556** (olumludan yüksek) | 9 ms | 0 |
| **C1 e5-small yerel** | 12/24 | **21/24** | **24/24** | 0,838 | 0,816 | 14 ms | 0 |
| C2 MiniLM çok dilli | 6/24 | 18/24 | 24/24 | 0,092 | 0,125 | 8 ms | 0 |
| B1 NVIDIA nemotron | 12/24 | 15/24 | 21/24 | 0,235 | 0,260 | 137 ms | 0 |
| A Haiku | 23/24 | 24/24 | 24/24 | 0,850 | 0,150 | ~20 sn | $0,023 |
| **H hibrit C1 → Haiku** | **24/24** | **24/24** | 24/24 | 0,880 | 0,500 | ~20 sn | **$0,015** |

Gömme kollarının (C0-C2, B1) sıralaması 3 turda **birebir aynı** (10/10 tutarlı). Haiku'nun 1. sırası 3 turda
23/24 aynı kaldı; 2. ve 3. sıralar tur tur değişiyor (puanlar 0,85-0,98 arasında yakın).

**OPS'un 10 soruluk sınavı (ilk 3 ölçütü + olumsuzlar eşiğin altında), ilk tur:**

| Kol | Olumlu (ilk 3) | Olumsuz ayrışıyor mu | Sınav |
|---|---|---|---|
| C0 | 6/8 | hayır (olumsuz puan olumlulardan yüksek) | 6/10 |
| C1 | 7/8 | evet ama **kıl payı** — eşik 0,82-0,83 arası (fark 0,02) | 9/10 |
| B1 | 5/8 | hayır (0,260 > 0,235) | 5/10 |
| A | 8/8 | evet, geniş (0,15 ↔ 0,85) | 10/10 |
| H | 8/8 | evet (0,50 ↔ 0,88; 3 turun en kötüsü) | 10/10 |

## 3 · Anlam

1. **"Türkçe gömme modeli şart" doğrulandı.** vector-memory'nin varsayılan İngilizce modeli (C0) olumsuz
   soruya olumlulardan yüksek puan veriyor — "bulunamadı" diyemiyor. Paketi olduğu gibi takmak işe yaramaz.
2. **C1 tek başına yerel, bedava ve anında; ama tek başına yeterince keskin değil.** İlk 3'te 21/24,
   ilk 10'da **24/24** — yani doğru ders her zaman ilk 10'un içinde. Olumsuz ayrımı 0,02 farkla tutuyor;
   bu fark 20 derslik fikstürde bile dar, 500 hafızada tutacağı ölçülmedi.
3. **B1 (NVIDIA) hiçbir satırda C1'i geçmiyor**, veriyi dışarı çıkarıyor, ücretsiz ucun şartı iç kullanımla
   sınırlı ve iki aday model bir yıl içinde kaldırılmış. Taşıyıcı olarak **elenir**.
4. **H en doğru ve A'dan ucuz** — ama sorgu başına ~20 saniye. Bu sürenin neredeyse tamamı `claude -p`'nin
   açılışı (Haiku'nun kendisi değil). Hafıza aramasında her sorguya değil, **"emin değilim" durumuna**
   yakışır.
5. **Ölçeklenme:** A her soruda bütün hafızayı okur (20 ders ≈ 8 bin karakter; 500 hafızada bedel ~25 kat).
   H'de Haiku'ya giden hep 10 ders — bedel hafıza büyüdükçe **sabit** kalır.

## 4 · Öneri (hüküm OPS'un)

**C1'i sage'e anlamca arama sağlayıcısı olarak takmak; Haiku'yu yalnız ikinci basamak yapmak (H).**
Somut olarak: `@wrongstack/vector-memory` + `multilingual-e5-small` sağlayıcısı, `materializeVectorOnly`
açık (kelime aramasının bulmadığı dersi de getirsin — 09-18'deki 6/10'un sebebi tam buydu). Haiku
yeniden sıralaması isteğe bağlı bir bayrak; varsayılan yolda bedel 0, veri makineden çıkmaz — güvenlik
etiketli ders kısıtı kendiliğinden çözülür.

Bağlamadan önce kapatılması gereken iki şey: (a) wrongstack ailesi 1.0.19 → vector-memory 1.0.24 sürüm farkı
(INV-WRONGSTACK-MCP-1 aynı sürüm kuralı; ya aile yükseltmesi ya ince yerel sarmalayıcı), (b) C1'in ilk 10
başarısı **tüm hafıza (~500 dosya)** üzerinde yeniden ölçülür — 20 derslik fikstür bunu söyleyemez.

## 5 · Ölçülmeyenler ve sınırlar

- Fikstür tek hakemli (OPS); "beklenen ders" eşlemeleri bağımsız hakemle doğrulanmadı.
- 20 ders küçük evren. Özellikle `yama-degil-profesyonel-arac` (12) C1'de bir "mıknatıs": onu beklemeyen 5 sorunun
  (biri olumsuz) ilk 3'ünde çıkıyor. Büyük evrende bu tür derslerin etkisi bilinmiyor.
- Haiku'nun süresi `claude -p` üzerinden ölçüldü. Doğrudan API çağrısı çok daha hızlı olur ama bu makinede
  API anahtarı yok (oturum OAuth ile); `--bare` kipi OAuth'u kapattığı için kullanılamadı.
- **Yan bulgu:** bayraksız `claude -p` bu makinede **hiç cevap vermiyor** — eklenti, MCP ve skill tanımları
  bağlamı ~257 bin jetona çıkarıyor ("Prompt is too long"). Başsız her kullanım
  `--strict-mcp-config --mcp-config '{"mcpServers":{}}' --disable-slash-commands --setting-sources ""
  --system-prompt …` ister (betikte yazılı). Bu, compact'ta başsız model kullanma adayını (REC-363 "aday ek")
  doğrudan etkiler.
- C1'in ilk yüklemesi 63 sn (model indirme, bir kez); sonraki yüklemeler ~4 sn.
