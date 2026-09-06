# REC-162 — Vercel kolu kapıda nasıl sayılır: "ÖLÇÜLEMEZ" sınıfı + atlama kapsamı

> **KAYNAK/CETVEL:** `docs/standards/fleet-mechanism-standard.md` §20.1 (merge ritüeli madde 3) ·
> §21 (kabul edilen boşluk sessiz olamaz) · §31/§32 (ölçüt canlı kalır) ·
> CLAUDE.md kural 1. Ölçümler: bu belge §1.
> **YÖNTEM:** elle (tek betik + tek kapı dosyası) · ölçüm salt-okuma yapıldı (Vercel dağıtım
> geçmişi + GitHub status API) · **kod bu belgede YOK, yarın yazılır** (OPS hükmü: bugün plan).

## ⭐0. EMRİN ÖNCÜLÜ ÖLÇÜMLE DEĞİŞTİ — iş yeniden tanımlandı

Emir *"`vercel.json` `ignoreCommand` ile docs/md-only PR'larda önizleme derlemesi atlansın"*
diyordu. Ölçüm iki maddesini de düşürdü:

| emirdeki varsayım | ölçüm | sonuç |
|---|---|---|
| atlama **kurulacak** | `scripts/vercel-ignore-build.sh` **var** (15290 bayt, 2026-08-28) ve **bugün çalıştı**: belge-only bir PR *"Canceled by Ignored Build Step"* ile geçti | ⛔sıfırdan yazım YOK |
| yüzey `vercel.json` | depoda **`vercel.json` yok**; Ignored Build Step **Vercel panelinde** tanımlı | ⛔yanlış yüzey |

**Yeniden tanım:** iş *"atlama kur"* değil, **(a)** mevcut atlamanın **KAPSAMI** ve
**(b)** rate-limited kolun kapıda **nasıl sayılacağı**dır.

## 1. ÖLÇÜLENLER (2026-09-06, salt-okuma — kota harcanmadan)

1. **Vercel sonucu bir CHECK RUN değil, COMMIT STATUS'tür.**
   `commits/<sha>/check-runs` → Vercel adlı kol **yok**; `commits/<sha>/status` →
   `Vercel | failure | Deployment rate limited`. ⭐**Sonuç:** GitHub'ın `rerequest` ucu
   check-run içindir; **bu kol push'suz yeniden tetiklenemez.** "CI'ı yeniden koştur" bu kolda
   uygulanamaz bir talimattır.
2. **Limiter, atlama adımının ÖNÜNDEDİR.** Belge-only bir push (tek `.md`) yine
   `rate limited` aldı — `Ignored Build Step`e **hiç gelmedi**.
3. **Reddedilen istek dağıtım kaydı YARATMAZ.** O push için dağıtım listesinde **kayıt yok**
   → kotaya maliyeti **sıfır**. ⭐Yani *"belge-only ucuzdur"* **maliyet** olarak doğru,
   ama *"PR'ı yeşilleştirir"* anlamında **yanlış**.
4. ⚠**Limit o an hesap geneli DEĞİLDİ.** Aynı 20 dakikada başka şeritlerin push'ları
   dağıtıldı (biri **gerçek derleme**, biri production `BUILDING`), benimki reddedildi.
   **Sebep ÖLÇÜLMEDİ** — adaylar: dal/PR bazlı geri-çekilme, ardışık reddedilmiş denemeden
   sonra kilit, başka bir sınır türü. **Ad konmadı.**
5. **Hacim:** ~2 saatte **20 dağıtım** (~9/saat). **PR başına en az 2** (dal önizlemesi +
   merge sonrası master). Hızlı ardışık merge'lerde önceki master dağıtımı **CANCELED** olur.

## 2. YAPILACAK — üç kalem

### K1. Kapıda "ÖLÇÜLEMEZ" sınıfı (madde 3'ün dışı)

Merge ritüelinde Vercel kolu **rate-limited** mesajıyla düşerse `DUSEN` sayılmaz;
**ÖLÇÜLEMEZ** sayılır ve ekrana **adıyla** yazılır.

⛔**Sınır — gevşetme DEĞİL:**
- **K8 kapsamındaki PR** (müşteriye görünen değişiklik, önizleme şart) → **KIRMIZI kalır.**
  Önizlemesi olmayan bir görsel değişiklik onaylanamaz.
- **Belge-only PR** (yalnız `docs/**` ve `*.md`) → **ÖLÇÜLEMEZ, merge serbest.**
- Rate-limited **dışındaki** her Vercel hatası (gerçek build hatası) → **eskisi gibi KIRMIZI.**
- Sınıf **yalnız** Vercel'in kendi `rate limited` metnine bağlanır; genel "Vercel kırmızıysa
  affet" **yasak**.

### K2. Atlama betiğinin KAPSAMI (mevcut betik, sıfırdan değil)

Bugün: `docs/**` + `*.md` atlanıyor; `scripts/**` **atlanmıyor** (ölçüldü: `scripts/` içeren
PR gerçekten derlendi). Karar gerektiren soru: **`scripts/`, `.github/`, `registry/` eklensin mi?**
⚠**Hüküm önerisi:** `.github/**` ve `scripts/hijyen/**` **eklenmeli** (siteyi üretmezler);
`scripts/**` **toptan eklenmemeli** — `scripts/generate/generate-next-routes.js` gibi
**çıktısı siteye giren** betikler var, toptan atlama onları görünmez kılar.
⭐Bu ayrım ölçülmeden yazılmaz: **hangi betiğin çıktısı build'e giriyor** sayılacak.

### K3. Cetvel satırı — "iş bitti ≠ erişilebilir"in yeni yüzü

`fleet-mechanism-standard.md`'ye: **merge sonrası canlı doğrulama, merge SHA'sı ile değil
son `READY` master dağıtımının SHA'sı ile yapılır.** Hızlı ardışık merge'lerde önceki master
dağıtımı iptal olur; "merge oldu" ile "canlıda o sürüm var" aynı şey değildir.

## 3. KAPILAR (üç sabotaj kolu — K1 için)

| # | sabotaj | beklenen |
|---|---|---|
| S1 | Vercel `rate limited` **düşük**, PR **belge-only** | ÖLÇÜLEMEZ → merge serbest, ekranda adıyla |
| S2 | Vercel `rate limited` **düşük**, PR **K8 kapsamında** | **KIRMIZI** — sınıf uygulanmaz |
| S3 | Vercel **gerçek build hatası** ile düşük (metin farklı) | **KIRMIZI** — sınıf metne bağlı, duruma değil |

⭐Ayrıca **boş-koşum koruması**: sınıfın hiç tetiklenmediği bir koşumda kol "geçti" demez.

## 4. SINIRLAR — dürüstçe

- Madde 4'teki **sebep bilinmiyor**; K1 sebebe değil **Vercel'in yazdığı metne** bağlanır.
  Metin değişirse sınıf sessizce ölür → bu yüzden **metnin kendisi de bir kola bağlanır**
  (metin bulunamazsa ÖLÇÜLEMEZ sınıfı **kapanır**, fail-closed).
- Rate limit'in penceresi/kuralı **ölçülmedi**; "24 saat" **Vercel mesajından okunmuştu ve
  ölçümle düştü** — plana sayı yazılmıyor.
- ⛔**Ücretli plan seçeneği bu planın kapsamı dışıdır ve önerilmez** (Recep'in yazılı kararı).

## KABUL ÖLÇÜTÜ

- Üç sabotaj kolu da **adıyla** düşüyor/geçiyor (pass/fail özeti değil, **alınan değer**).
- K8 PR'ında sınıf **uygulanmıyor** (S2 kırmızı).
- Atlama kapsamı değişiyorsa: **hangi betiğin çıktısı build'e giriyor** sayımı belgede.
- Cetvel satırı (K3) yazılı ve merge sonrası doğrulama o SHA ile tarif edilmiş.

İlgili: REC-162
