# Belge Numaralandırma Cetveli (Document Numbering Standard)

> **SSOT.** Müşteriye verilen her belge numarasının (sipariş, teklif, proforma, iade)
> nasıl ÜRETİLECEĞİ ve nasıl GÖSTERİLECEĞİ. v1.0 · 2026-09-06 — REC-156 ölçümü sonrası.
> Zorlayan kapı: `src/__tests__/conformance/siparis-no-tek-bicim.test.ts` (INV-SIPARIS-NO-1).

---

## 1. Niçin bu cetvel var — ölçülmüş olay

`generate_order_number()` numaranın son dört hanesini şöyle üretiyordu:

```sql
LPAD((EXTRACT(EPOCH FROM NOW())::BIGINT % 10000)::TEXT, 4, '0')
```

Bu bir **sayaç değil, saattir**: 10000 saniyede (2sa 46dk 40sn) başa döner.

**Kanıt (prod, salt-okuma, 2026-09-06):** aynı ifadede üç çağrı →
`VH-20260906-9343` · `VH-20260906-9343` · `VH-20260906-9343` — **üçü de aynı**.

`venthub_orders_order_number_key` UNIQUE olduğundan çakışma mükerrer kayıt değil
**INSERT hatası** üretirdi: **müşterinin siparişi patlardı**.

Risk matematiği (gün içine ~düzgün dağılım, doğum-günü yaklaşımı `P ≈ 1 − exp(−N²/20000)`):

| Günlük sipariş | En az bir çakışma olasılığı |
|---|---|
| 50 | **%12** |
| 100 | **%39** |
| 200 | **%86** |

Kusur bugüne dek görünmedi çünkü toplam **5** sipariş var ve **satış kipi kapalı** —
yani tam da satış açıldığı gün, en pahalı anda ortaya çıkacaktı.

Aynı gün ikinci bir kusur ölçüldü: numara **14 çağrı yerinde elle kesiliyordu**, iki
çelişen yöntemle. `split('-')[1]` **tarihi** basıyordu (`#20260818` — aynı gün herkes
aynı), `split('-').pop()` sıra parçasını. Bir dosyada **ikisi birden** vardı.

---

## 2. ÜRETİM kuralı (İHLAL ETME)

**Biçim:** `<ÖNEK>-YYYYMMDD-NNNN`

| Alan | Kural |
|---|---|
| `ÖNEK` | Belge türü: **SİPARİŞ = `VH`** · Teklif = `TK` · Proforma = `PF` · İade = `IA` (ileriye dönük ayrılmıştır) |
| `YYYYMMDD` | Belgenin **iş günü**, `Europe/Istanbul`. UTC **değil** — 00:00–03:00 arası bir belge yanlış güne düşmemeli |
| `NNNN` | **O GÜNÜN SIRA SAYACI**: 0001, 0002 … Sayaç, saat/rastgele/hash **DEĞİLDİR** |

**Sayaç nasıl artar:** tek ifadede, çağıranın **işlemi içinde**:

```sql
INSERT INTO public.order_number_counters AS c (gun, son_no)
     VALUES (bugun, 1)
ON CONFLICT (gun) DO UPDATE SET son_no = c.son_no + 1
  RETURNING c.son_no INTO sira;
```

- **Yarış-güvenli:** eşzamanlı iki çağrı satır kilidinde sıraya girer, ikisi de FARKLI değer alır.
- **Boşluksuz:** belge geri alınırsa sayaç da geri alınır — muhasebede atlanan numara olmaz.
- ⚖**Bedeli adıyla:** kilit işlem sonuna kadar tutulur → aynı günün eşzamanlı belgeleri bu
  satırda **serileşir**. Bugünkü hacimde ölçülebilir maliyet değil. Hacim büyürse alternatif,
  **boşluk kabul eden** `sequence`'tır; o karar verilirse bu bölüm güncellenir.

**Zorunlu emniyet kemerleri:**
1. Kolonda **UNIQUE** kısıt — mantık bozulursa sessizce mükerrer üretmek yerine gürültüyle dur.
2. **Taşma adıyla:** `NNNN > 9999` ise `RAISE EXCEPTION`. Sessizce 5 haneye taşma ya da
   başa dönme **YASAK** — biçim genişletme kararı insana aittir.
3. Sayaç tablosu **RLS açık, politika yok**; erişim yalnız `SECURITY DEFINER` üretici fonksiyondan.

**Eski üretici SİLİNMEZ:** adıyla saklanır (`…_saat_tabanli_YYYYMMDD`) ki geri dönüş tek adım olsun.

---

## 3. GÖSTERİM kuralı (İHLAL ETME)

- Müşteri yüzeyinde **TAM NUMARA** gösterilir: `VH-20260818-4215`.
- ❌ **Parçalama yasak** — `split('-')[1]`, `.pop()`, `slice()` vb. Numaranın parçası
  numara değildir; kimliği yok eder ve destek iki müşteriyi ayırt edemez.
- ❌ **`#` öneki yasak** — numara zaten harf önekiyle başlar; `#VH-2026…` diye okunur.
  Sözlükte `#` gömülü anahtar bırakma.
- Vitrin tarafında tek kaynak: **`src/utils/siparisNo.ts` → `siparisNoGoster()`**.
- Edge Function'lar (Deno) `src/` içinden **import edemez**; kopya kaçınılmazdır. Bu yüzden
  kapı, dört işlevin **aynı biçimi** taşıdığını ölçer — biri sessizce geride kalamaz.

**Yedek yol:** numara yoksa kimliğin son 8 hanesi gösterilir (boş etiket basmaktansa).
Kolon NOT NULL olduğu için buraya normalde düşülmez; savunma amaçlıdır.

---

## 4. Zorlama katmanları

| Katman | Ne ölçer | Ne ölçmez |
|---|---|---|
| **INV-SIPARIS-NO-1** (statik kapı) | Kodda kesme kalmadığını, yardımcının tam numara döndürdüğünü, sözlükte `#` kalmadığını, dört Edge işlevinin aynı biçimde olduğunu | **Üretimin tekilliğini** — o çalışma zamanıdır |
| **SQL kanıtı** (migration uygulandıktan sonra) | Aynı ifadede üç çağrı → üç FARKLI numara; eşzamanlı iki oturum → çakışma yok; ROLLBACK → boşluk yok | Uzun vadeli davranışı |
| **UNIQUE kısıt** (DB) | Son savunma: mükerrer numara yazılamaz | Kusuru önlemez, yalnız gürültüyle durdurur |

⚠**"Kapı yeşil" ≠ "numaralar tekil".** İki katman ayrıdır ve birbirinin yerine geçmez.

---

## 5. Kapsam dışı (adıyla)

`src/views/admin/**` bu cetvelin kapsamında **değildir** — ADMIN şeridinin kendi cetveli var.
Ölçüldü: `ReturnsTableBody.tsx` aynı kesme kusurunu taşıyor (`split('-')[1]`), OPS kayda aldı,
ADMIN şeridi açılınca emre girer. Bu cetvel oraya hüküm vermez.
