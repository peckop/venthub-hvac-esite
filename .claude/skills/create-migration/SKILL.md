---
name: create-migration
description: VentHub'da yeni Supabase migration dosyası oluşturmanın güvenli yolu — adlandırma, kural-13 zinciri, plan-challenger zorunluluğu ve migration-safety kontrol listesiyle. Migration/DB şema değişikliği istendiğinde kullan.
---

# /create-migration — güvenli migration oluşturma

Bu depoda migration yazmak PROD'a dokunmaktır: migration içeren dal master'a merge edilince
`supabase-migrate.yml` prod DB'ye **OTOMATİK uygular** (Kural 13). Bu beceri o zincirin
başındaki adımları standartlaştırır.

## Akış (sırayla, atlama yok)

1. **Cetvel:** `docs/standards/migration-safety-standard.md` oku — plan bu cetvele atıf verir.
2. **Plan + plan-challenger:** migration/veri göçü için plan-challenger ZORUNLUDUR
   (execution-method-standard). Önce plan yaz, `/plan-challenger` ile çürüttür, sonra dosya.
3. **Adlandırma:** `supabase/migrations/YYYYMMDDHHMMSS_kisa_aciklama.sql` — damga **14 hane** (UTC tarih+saat;
   8 haneli `YYYYMMDD_` INV-MIGRATION-2 kapısında KIRMIZI verir, CLAUDE.md). Açıklama
   snake_case, Türkçe/İngilizce, kısa.
4. **İçerik kontrol listesi:**
   - İdempotent mi? (`IF NOT EXISTS` / `IF EXISTS`, tekrar koşulabilir)
   - RLS: yeni tabloya policy + **kolon grant'leri** birlikte (satır kapısı yetmez)
   - Mevcut satırları doğrulayan kısıt ekliyorsan: önce mevcut veriyi ÖLÇ (constraint
     mevcut satırlara da uygulanır — canlıda patlar)
   - Sır/duz-metin anahtar YOK (Vault kullan); repo PUBLIC
   - Geri alma notu: bu migration nasıl geri alınır, dosyanın başına yorum olarak yaz
   - **Şemanın GÖRÜNEN yüzü değişiyorsa (yeni tablo/kolon/görünüm kolonu/fonksiyon imzası) tip
     dosyası:** `src/types/database.types.ts` (URUN alanı) merge ile AYNI SAATTE güncellenir ve
     sahibine merge'ten ÖNCE haber verilir. Canlı şema değişip tip dosyası değişmezse INV-TIP-DRIFT-1
     bütün şeritlerin PR'larında kırmızıya döner (2026-09-24, REC-140 Faz 1: filo-geneli kırmızı).
     Tip dosyası migration inmeden canlıdan üretilemez → sıra: sahibine haber → merge → uygulama
     yeşil → sahibi `pnpm supabase:gen` PR'ı hemen. Ayrıca HER migration sonrası şema tabanı
     (`sema-tabani-uret.yml`) aynı gün yenilenir, yoksa INV-TABAN-TAZE-1 filoda kırmızı
     (migration-safety-standard, tip/taban maddesi).
   - **Her yeni fonksiyonda açık `REVOKE`:** Supabase varsayılan yetkileri yeni fonksiyona `anon`
     dahil EXECUTE verir. `revoke all on function … from public, anon;` yazılmazsa ziyaretçi
     çağırabilir. Yalnız tetik/iç yardımcıysa `authenticated`'dan da kaldır; oturumlu RPC ise
     `grant execute … to authenticated` AÇIKÇA yaz. Bekçi: INV-AUTH-DEFINER-ANON-1
     (`anon-definer-yetki.test.ts`) — yeni DEFINER fonksiyonu oraya kol olarak ekle (REC-384).
   - **CHECK kısıtı ekleme kalıbı (squawk, INV-MIGRATION-3):** `NOT VALID`'siz ekleme KIRMIZI;
     `NOT VALID` ile `VALIDATE` aynı işlemde de KIRMIZI. Emsal `20260923083021_url_takma_adlari.sql`:
     ekleme `do $$ … add constraint … not valid; end $$;` bloğunda, `validate constraint` bloğun
     DIŞINDA. Dürüst yorum yaz: aynı migration işleminde kilit kazancı yoktur; tablonun satır
     sayısını salt-okuma ile ölç ve yoruma yaz. Squawk yerelde kurulu değil — ilk sinyal CI'dır.
5. **Yerel doğrulama:** mümkünse `supabase db diff` ile beklenen fark; testler
   (`pnpm test -- --run`) yeşil. **Davranışı olan migration (tetik, DEFINER, sayaç, kısıt) gölge
   DB'de kolla koşulur:** `node scripts/db/golge-kur.mjs --ad <ad>` (taban + sonraki migration'lar).
   Gölgenin eksikleri (2026-09-25 ölçüldü): `net.http_post` sahte (0 döner; değiştirmek için ÖNCE
   `drop function`, sonra `create` — `create or replace` parametre varsayılanı yüzünden düşer),
   `vault` şeması YOK, `auth.uid()` NULL. Betiği `-v ON_ERROR_STOP=1` ile koş; yoksa kurulum
   sessizce düşer, ölçüm hiçbir şey ölçmez. Tetiğin yazdığını okuyan sorgu AYRI ifade olmalı
   (aynı ifadede eski anlık görüntüyü okur). Başka şeridin `golge_*` DB'sine dokunma;
   `supabase db reset` YASAK.
6. **PR ve kapanış uyarısı:** PR açıklamasına şu satır AYNEN girer:
   `⚠ MIGRATION İÇERİR — merge = prod'a otomatik uygulama. Yalnız Recep onayıyla merge.`
   PR'ı ASLA kendi kapınla merge etme; "sadece komutla uygulanacaksa" merge ETME.

## Hatırlatma

- `sensitive-path-guard` hook'u migration yazımında onay isteyecektir — bu beklenen davranış.
- İki defter vakası (T073): `supabase db push` YASAK — uygulama yalnız CI workflow'undan.

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
