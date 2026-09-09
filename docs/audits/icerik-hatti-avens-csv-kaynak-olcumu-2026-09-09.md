# AVenS fiyat CSV'si ↔ kaynak PDF ölçümü (2026-09-09, URUN-KATALOG)

**Soru (OPS emri, adım 2):** `avensair-fiyat.csv` kaynağa göre eksik mi, ne kadar?

**Niçin soruldu:** ingestor CI'ı 5/5 kırmızı. Kapı "çıktı bayat" diyordu; sebebin bir kısmı
sahteydi (bkz. `uretim-recetesi.json`, 2026-09-09 notu), **bir kısmı gerçek çıktı.**

---

## Ölçülen evren

| ne | değer |
|---|---|
| kaynak | `kaynak-dizini/sayfalar.jsonl` → `avens_fiyat_listesi_2026_HQ.pdf` |
| sayfa | 74 |
| tablo | 148 |
| **taramaya giren tablo** | **74** (başlığında hem `KOD` hem `FİYAT/EURO` olanlar) |
| ⛔**taramanın DIŞINDA kalan** | **74** (başlık satırı BOŞ olan tablolar) |

Sütunlar **başlıktan** bulundu, konum varsayımı yapılmadı. Kod olmayan 14 hücre (tabloya
sızmış açıklama paragrafları) elendi.

---

## Sonuç

| ölçüt | kaynak (başlıklı tablolar) | CSV | fark |
|---|---|---|---|
| tekil ürün kodu | 444 | 484 | −40 |
| ⭐**alfanümerik kod** | **35** | **0** | **+35** |
| kaynakta var, CSV'de yok | **59** (35'i alfanümerik) | — | — |
| CSV'de var, kaynakta yok | — | **99** | — |

### ✅ SAĞLAM BULGU — tek yönlü, evren tanımından bağımsız
**CSV'de alfanümerik ürün kodu SIFIR.** Kaynağın yalnızca taradığım yarısında bile **35 tane** var.
Sıfır, hiçbir evren genişletmesiyle açıklanamaz: CSV bu kodları **sistematik olarak dışlamış.**

Bu tam olarak `SKILL.md`'nin 2026-08-20'de (e7e5f7b) düzelttiği kusurdur — kural şöyle der:
*"`model_code` biçimine varsayım koyma — uzunluk/biçim kısıtı YOK. Salt sayısal (`11313`),
alfanümerik (`NS311280`), boşluklu (`ENKEC 155`) hepsi geçerlidir."*
CSV o düzeltmeden **önce** (2026-06-22) üretilmiştir. **Kapı haklı: çıktı gerçekten bayat.**

Canlı veri de aynı yönü gösteriyor: **107 aktif AVenS ürününün 39'u alfanümerik kodlu** —
yani CSV'nin hiç tanımadığı biçimde.

### ⛔SAĞLAM OLMAYAN — kesin sayı VERİLEMEZ
*"Toplam kaç ürün eksik"* sorusuna bu ölçüm **cevap veremez**, ve bunu gizlemiyorum:

- Taramam tabloların **yarısını** (başlıksız 74 tablo) görmüyor.
- Bunun kanıtı ölçümün kendi içinde: **CSV'de olup kaynakta bulamadığım 99 kod** var
  (ör. `M 100/4" PUNTO` s.13, ısı geri kazanım cihazları s.68). Bunlar gerçek ürün; kaynakta
  **varlar**, benim başlık ölçütüm onları **eledi**.
- Yani `59` sayısı bir **alt sınır bile değil**, dar bir evrenin sayısıdır.

**Alt sınır olarak söylenebilecek tek şey: en az 35 alfanümerik kodlu ürün CSV'de yok.**

---

## Hüküm

1. **CSV bayat ve eksik** — kanıt: alfanümerik kod 0/35.
2. **Kaynak dizini bu konuda EKSİK DEĞİL** — fiyat listesi PDF'i dizinde, 74 sayfa.
   *(2026-09-09'da önce "dizinde YOK" demiştim; yanlıştı — dizinde `avens` arayıp 90 kaydın
   yalnız ilkine bakmıştım. Düzeltildi.)*
3. **Onarım = CSV'nin yeniden üretimi**, ve bu ayrı/büyük bir iştir: görsel çoklu-ajan çıkarımı
   (SKILL, T119'da 25 alt-ajan). **Plan yazılacak, plan-challenger'dan geçecek, sonra koşulacak.**
4. **İngestor CI o zamana kadar KIRMIZI kalır ve bu DOĞRUDUR** — kapı gerçek bir borcu gösteriyor.
   Susturulmadı.

## Yöntem notu — bu ölçümün kendi sınırı ölçüldü
Bu belgedeki iki numaralı bulgu, ölçütün **ayırt ettiğini** kanıtlamak için konuldu: aynı tarama
CSV'de 99 kod "bulamıyorsa" tarama eksiktir, ve bu, `59` sayısını hüküm olmaktan çıkarır.
Bugünün tekrar eden hata sınıfı buydu (*ölçüt keskin, evren yanlış*); burada evreni ölçüp yazdım.
