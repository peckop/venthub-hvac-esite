# Arama takılması ölçümü (karar 59) — 2026-09-22

Recep'in "aramada bazen dönen yuvarlak bir saniyeden uzun kalıyor" tespitinin ölçümü. Karar 59
(Vercel Pro + Supabase Pro) bu ölçüme bağlandı. Kayıt: REC-340 yorumları (2026-09-22).

## Düzenekler

Üçü de canlıya **ziyaretçi (anon)** olarak bakar. Yalnız sonuç döndüren sorgular kullanılır;
sıfır sonuç arama günlüğüne yazılır (arama cetveli K10.1), o yüzden sorgu listesi sabittir.
Anahtar `.env.local`'dan okunur ve ekrana basılmaz.

| Betik | Ne ölçer | Koşum |
|---|---|---|
| `karar59-olcum.cjs` | Sıcak evre (150 arama, 2 sn arayla) + soğuk evre (20 deneme, 45 sn boşlukla) | `node karar59-olcum.cjs .env.local cikti.log` (~20 dk) |
| `karar59-karisik.cjs` | Ayırıcı: aynı dönemde 45 sn boşluk → probe → 8 sıcak istek, 10 tur | `node karar59-karisik.cjs .env.local cikti.log` (~10 dk) |
| `pencere-ic.cjs` | Arama penceresinin açılışı, sayfa içinden (DOM click + MutationObserver) | `node pencere-ic.cjs https://venthub.com.tr <playwright-yolu> 8` |

"Sunucu süresi" = `x-envoy-upstream-service-time` (PostgREST + veritabanı). Her aramada fts ve öneri
paralel gider (tarayıcıdaki gibi); kaydedilen, ikisinin **yavaşı**dır — ekranda beklenen süre odur.

⚠**Ölçüm sırasında canlıya başka arama trafiği gönderilmez** (bağlantı havuzunu ısıtır, soğuk evreyi bozar).

## Sonuç (2026-09-22, 08:50–09:27 UTC)

| Deney | n | p50 | p95 | ≥1 sn |
|---|---|---|---|---|
| Sıcak, 2 sn arayla | 150 | 30 ms | 186 ms | 1 |
| Soğuk, 45 sn boşluk sonrası ilk | 20 | 530 ms | 10.890 ms | 5 |
| Soğuk + 0,3 sn ikinci | 20 | 615 ms | 4.394 ms | 9 |
| Ayırıcı probe (45 sn boşluk) | 10 | 249 ms | 2.145 ms | 1 |
| Ayırıcı, aynı turda sıcak | 80 | 47 ms | 1.172 ms | 4 |

**Hüküm:** ≥1 sn takılmaların çoğu Nano (Free) makinenin **dönemsel duraklamasından** gelir: yavaş
turlarda ısınmış, normalde 20 ms'lik istekler de 0,4–2,7 sn sürdü (işin büyüklüğüyle orantısız).
Boşta kalma bedeli küçüktür (+0,1–0,2 sn). Supabase belgesi: "Compute sizes up to Medium run on shared
CPU, while Large and above run on dedicated vCPUs" → Micro da paylaşımlı işlemcidir.

**Ölçüm tuzağı (ders):** Supabase MCP `execute_sql` her çağrıda yeni oturum açar; plpgsql plan önbelleği
soğuk olduğundan EXPLAIN planlama maliyetini de sayar. Aynı fonksiyon soğuk oturumda 3104 blok / 34–130 ms,
6 ısıtmadan sonra **644 blok / 9 ms**. Fonksiyon ölçerken önce aynı oturumda ısıt.

**Ölçülmeyen:** Micro'da davranış, gece/gündüz farkı, gerçek kullanıcı dağılımı.

## Onarım sonrası

Aynı iki betik aynı saat dilimine yakın koşulur ve bu tabloya "sonra" satırları eklenir.
