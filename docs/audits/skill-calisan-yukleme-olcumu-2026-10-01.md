# YTN-8 — Çalışan tanımlarında `skills:` ön yüklemesi gerçekten çalışıyor mu (2026-10-01)

Soru (OPS, #1605'te "doğrulanmadı" kalan iki nokta + Haiku sorunu tek ölçümde):
(1) çalışan tanımındaki `skills:` satırında çıplak ad (proje skill'i) çözülüyor mu; (2) `context: fork`'lu skill ön yüklenebiliyor mu;
(3) SKILL_ATAMASI setleri gerçekten yükleniyor mu — Haiku çalışan açılınca ön yüklenen skill'in METNİ bağlamında var mı.
Cetvel: `docs/audits/skill-departman-setleri-2026-09-30.md` §8 (plan, koşulmamıştı) ve §9.2; `docs/standards/execution-method-standard.md` §10.
Bu ölçüm daha önce yapılmamıştı (envanter, `docs/audits` ve `docs/README.md` tarandı).

## Hüküm

| Soru | Cevap | Sayı |
|------|-------|------|
| (1) Çıplak adlı proje skill'i `skills:` ile yükleniyor mu | **Evet** | Haiku alt ajanı: 11 skill satırı yüklendi; Sonnet alt ajanı: 4 yüklendi; kanarya (rastgele belirteç): 2/2 model |
| (2) `context: fork`'lu skill ön yüklenebiliyor mu | **Evet** | Kanarya: Haiku ve Sonnet 2/2; gerçek: `urun-curutucu`'da `plan-challenger` (14,6 KB) ve `supabase-security` (14,4 KB) Haiku alt ajanında yüklü |
| (3) Setler gerçekten yükleniyor mu | **Bir kırık dışında evet** | 60 set / 50 üretilmiş tanım: setler JSON'u ile `skills:` satırları birebir aynı (fark 0). Canlıda 12 gerçek satırdan 11'i yüklendi; 1'i (`supabase-postgres-best-practices`, 2 SATIS çalışanında) **hiç yüklenmedi** — düzeltildi |
| Haiku: ön yükleme açığı kapatıyor mu | **Evet (ön yüklenen skill'ler için)** | Çözülebilen 11/11 satırda skill gövdesi Haiku alt ajanının bağlamında; canlıda ölçülen en büyük set 29,0 KB (`urun-curutucu`); kaynak en büyük set 32,0 KB (`urun-uygulayici`, canlı denenmedi) |

Not: bugün 52 tanımın hepsi `sonnet` (biri `opus`), **hiçbiri Haiku değil**. Haiku sorusu bu yüzden şimdilik varsayımsal; model kararı verilirse ölçüm hazır.
Ön yüklenmeyen skill'lerin Haiku alt ajanında listede adsız kalıp kalmadığına bu ölçümde BAKILMADI (§8 davranış deneyi ayrı iş).

## Yöntem (kanıt model beyanı değil, dosyadaki birebir metin)

- **Üretim yolu**: müdür çalışanı Agent aracıyla ALT AJAN olarak açar; ölçüm de böyle (ana oturum Sonnet 5.5, `--allowedTools Agent`, `claude -p`,
  `CLAUDE_CODE_ENTRYPOINT=sdk-cli`, oturum kalıcılığı kapalı, atılabilir dizin). Alt ajanın modeli tanımdaki `model:` alanından gelir (Haiku için `haiku`).
- **Araç kaçağı kapalı**: ölçülen çalışanın `disallowedTools` alanı Read, Grep, Glob, Skill, Bash, WebFetch, WebSearch dahil kapatıldı; çalışan skill metnini
  dosyadan okuyup ya da `Skill` aracıyla çekip "ön yükleme" taklidi yapamaz.
- **Kanarya düzeneği**: rastgele belirteçli (tahmin edilemez) sahte skill gövdeleri; belirteç YALNIZ gövdede, istemde ve açıklamada yok. Çalışan belirteci birebir söylerse gövde bağlamdadır.
- **Gerçek tanım düzeneği**: gerçek `.claude/agents/*.md` ve gerçek skill dosyaları atılabilir projeye kopyalandı (değişen yalnız ad soneki, model ve araç yasakları).
  Çalışandan her skill için "başlıktan sonraki ilk 12 kelime" (ve ilk turda "son 12 kelime") istendi; alıntının 5 kelimelik dizileri programla
  **o skill'in kendi dosyasıyla** karşılaştırıldı, başka skill'lerde de bulunan (ortak bitiş bloğu) diziler sayılmadı. Karar: kendi dosyasında ≥3 dizi ve ≥1 ayırt edici dizi.
- **Haiku** koşuları `model: haiku` ile (tanımın modeli bu ölçüm için değiştirildi), **Sonnet** koşuları gerçek `sonnet` ile.

## Düzenek bulguları (kanarya + sınırlar)

| Koşul | Haiku | Sonnet | Not |
|-------|-------|--------|-----|
| Alt ajan, çıplak adlı proje skill'i | yüklendi | yüklendi | belirteç birebir |
| Alt ajan, `context: fork`'lu skill | yüklendi | yüklendi | fork alanı ön yüklemeyi engellemiyor |
| Alt ajan, aynı ad hem kullanıcı hem proje düzeyinde (`scrape`) | **kullanıcı düzeyi geldi, proje gelmedi** | aynı | ad önceliği: kullanıcı > proje (ölçüldü) |
| Alt ajan, var olmayan skill adı | hata yok, sessizce atlandı | aynı | `YOK` cevabı; uyarı yok |
| `claude --agent <ad>` (ANA oturum olarak) | `skills:` ön yüklenmedi | ölçülmedi | tek koşu; üretim yolu değil |
| Tanım `disallowedTools`'a `ToolSearch` yazarsa | **hiç açılmadı**: istek ~329 bin jeton, limit 200 bin ("Prompt is too long") | açıldı ama ~330 bin jetonlu istekle | ertelenmiş araç listesi satır içine dökülüyor |

## Tek tablo: tanım × beklenen skill × yüklendi mi × kanıt

`Kaynak` = skill'in çözüldüğü yer. "Sınıf kanıtı" = aynı yol başka satırlarda canlı ölçüldü ve o satırda ayrıca koşulmadı (79 satırın 11'i canlı, kalanı sınıf kanıtı).
Çözülemeyen ya da belirsiz satır yok (kırık iki satır düzeltme sonrası tabloda yok, aşağıda).

| Tanım | Beklenen skill | Kaynak | KB | Yüklendi mi | Kanıt |
|---|---|---|---|---|---|
| admin-arastirmaci | codegraph | proje | 5.4 | EVET (sınıf kanıtı) | aynı yol: çıplak ad proje skill, kanarya + 9 canlı satır |
| admin-arastirmaci | venthub-architecture | proje | 6.5 | EVET (sınıf kanıtı) | aynı yol: çıplak ad proje skill, kanarya + 9 canlı satır |
| admin-curutucu | plan-challenger (fork) | proje | 14.6 | EVET (sınıf kanıtı) | kanarya-fork + urun-curutucu canlı |
| admin-curutucu | supabase-security | proje | 14.4 | EVET (sınıf kanıtı) | aynı yol: çıplak ad proje skill, kanarya + 9 canlı satır |
| admin-dogrulayici | verify-before-done | proje | 10.3 | EVET | canlı: Haiku alt ajanında gövde alıntılandı |
| admin-dogrulayici | web-design-guidelines | proje | 4.0 | EVET | canlı: Haiku alt ajanında gövde alıntılandı |
| admin-dogrulayici | webapp-testing | kullanıcı | - | EVET | canlı: Haiku alt ajanında gövde alıntılandı |
| admin-dogrulayici | accessibility | kullanıcı | - | EVET | canlı: Haiku alt ajanında gövde alıntılandı |
| admin-uygulayici | i18n-conventions | proje | 14.2 | EVET (sınıf kanıtı) | aynı yol: çıplak ad proje skill, kanarya + 9 canlı satır |
| admin-uygulayici | venthub-architecture | proje | 6.5 | EVET (sınıf kanıtı) | aynı yol: çıplak ad proje skill, kanarya + 9 canlı satır |
| admin-uygulayici | vercel-composition-patterns | proje | 4.8 | EVET (sınıf kanıtı) | aynı yol: çıplak ad proje skill, kanarya + 9 canlı satır |
| altyapi-arastirmaci | codegraph | proje | 5.4 | EVET (sınıf kanıtı) | aynı yol: çıplak ad proje skill, kanarya + 9 canlı satır |
| altyapi-arastirmaci | investigate | proje | 6.0 | EVET (sınıf kanıtı) | aynı yol: çıplak ad proje skill, kanarya + 9 canlı satır |
| altyapi-curutucu | plan-challenger (fork) | proje | 14.6 | EVET (sınıf kanıtı) | kanarya-fork + urun-curutucu canlı |
| altyapi-curutucu | supabase-security | proje | 14.4 | EVET (sınıf kanıtı) | aynı yol: çıplak ad proje skill, kanarya + 9 canlı satır |
| altyapi-dogrulayici | verify-before-done | proje | 10.3 | EVET | canlı: Haiku alt ajanında gövde alıntılandı |
| altyapi-uygulayici | create-migration | proje | 6.3 | EVET (sınıf kanıtı) | aynı yol: çıplak ad proje skill, kanarya + 9 canlı satır |
| arac-arastirmaci | codegraph | proje | 5.4 | EVET (sınıf kanıtı) | aynı yol: çıplak ad proje skill, kanarya + 9 canlı satır |
| arac-arastirmaci | investigate | proje | 6.0 | EVET (sınıf kanıtı) | aynı yol: çıplak ad proje skill, kanarya + 9 canlı satır |
| arac-curutucu | plan-challenger (fork) | proje | 14.6 | EVET (sınıf kanıtı) | kanarya-fork + urun-curutucu canlı |
| arac-dogrulayici | verify-before-done | proje | 10.3 | EVET (sınıf kanıtı) | aynı yol: çıplak ad proje skill, kanarya + 9 canlı satır |
| blog-curutucu | plan-challenger (fork) | proje | 14.6 | EVET (sınıf kanıtı) | kanarya-fork + urun-curutucu canlı |
| blog-dogrulayici | verify-before-done | proje | 10.3 | EVET (sınıf kanıtı) | aynı yol: çıplak ad proje skill, kanarya + 9 canlı satır |
| edge-arastirmaci | codegraph | proje | 5.4 | EVET (sınıf kanıtı) | aynı yol: çıplak ad proje skill, kanarya + 9 canlı satır |
| edge-arastirmaci | investigate | proje | 6.0 | EVET (sınıf kanıtı) | aynı yol: çıplak ad proje skill, kanarya + 9 canlı satır |
| edge-curutucu | plan-challenger (fork) | proje | 14.6 | EVET (sınıf kanıtı) | kanarya-fork + urun-curutucu canlı |
| edge-curutucu | supabase-security | proje | 14.4 | EVET (sınıf kanıtı) | aynı yol: çıplak ad proje skill, kanarya + 9 canlı satır |
| edge-dogrulayici | verify-before-done | proje | 10.3 | EVET (sınıf kanıtı) | aynı yol: çıplak ad proje skill, kanarya + 9 canlı satır |
| edge-uygulayici | create-migration | proje | 6.3 | EVET (sınıf kanıtı) | aynı yol: çıplak ad proje skill, kanarya + 9 canlı satır |
| geo-seo-arastirmaci | codegraph | proje | 5.4 | EVET (sınıf kanıtı) | aynı yol: çıplak ad proje skill, kanarya + 9 canlı satır |
| geo-seo-arastirmaci | search-console | kullanıcı | - | EVET (sınıf kanıtı) | kullanıcı düzeyi skill: webapp-testing + accessibility canlı |
| geo-seo-curutucu | plan-challenger (fork) | proje | 14.6 | EVET (sınıf kanıtı) | kanarya-fork + urun-curutucu canlı |
| geo-seo-dogrulayici | verify-before-done | proje | 10.3 | EVET (sınıf kanıtı) | aynı yol: çıplak ad proje skill, kanarya + 9 canlı satır |
| harita-arastirmaci | codegraph | proje | 5.4 | EVET (sınıf kanıtı) | aynı yol: çıplak ad proje skill, kanarya + 9 canlı satır |
| harita-curutucu | plan-challenger (fork) | proje | 14.6 | EVET (sınıf kanıtı) | kanarya-fork + urun-curutucu canlı |
| harita-dogrulayici | verify-before-done | proje | 10.3 | EVET (sınıf kanıtı) | aynı yol: çıplak ad proje skill, kanarya + 9 canlı satır |
| i18n-arastirmaci | codegraph | proje | 5.4 | EVET (sınıf kanıtı) | aynı yol: çıplak ad proje skill, kanarya + 9 canlı satır |
| i18n-curutucu | plan-challenger (fork) | proje | 14.6 | EVET (sınıf kanıtı) | kanarya-fork + urun-curutucu canlı |
| i18n-dogrulayici | verify-before-done | proje | 10.3 | EVET (sınıf kanıtı) | aynı yol: çıplak ad proje skill, kanarya + 9 canlı satır |
| i18n-dogrulayici | i18n-conventions | proje | 14.2 | EVET (sınıf kanıtı) | aynı yol: çıplak ad proje skill, kanarya + 9 canlı satır |
| i18n-uygulayici | i18n-conventions | proje | 14.2 | EVET (sınıf kanıtı) | aynı yol: çıplak ad proje skill, kanarya + 9 canlı satır |
| katalog-arastirmaci | codegraph | proje | 5.4 | EVET (sınıf kanıtı) | aynı yol: çıplak ad proje skill, kanarya + 9 canlı satır |
| katalog-curutucu | plan-challenger (fork) | proje | 14.6 | EVET (sınıf kanıtı) | kanarya-fork + urun-curutucu canlı |
| katalog-curutucu | supabase-security | proje | 14.4 | EVET (sınıf kanıtı) | aynı yol: çıplak ad proje skill, kanarya + 9 canlı satır |
| katalog-dogrulayici | verify-before-done | proje | 10.3 | EVET (sınıf kanıtı) | aynı yol: çıplak ad proje skill, kanarya + 9 canlı satır |
| mevzuat-arastirmaci | pdf | kullanıcı | - | EVET (sınıf kanıtı) | kullanıcı düzeyi skill: webapp-testing + accessibility canlı |
| mevzuat-curutucu | plan-challenger (fork) | proje | 14.6 | EVET (sınıf kanıtı) | kanarya-fork + urun-curutucu canlı |
| mevzuat-dogrulayici | verify-before-done | proje | 10.3 | EVET (sınıf kanıtı) | aynı yol: çıplak ad proje skill, kanarya + 9 canlı satır |
| ops-arastirmaci | codegraph | proje | 5.4 | EVET (sınıf kanıtı) | aynı yol: çıplak ad proje skill, kanarya + 9 canlı satır |
| ops-curutucu | plan-challenger (fork) | proje | 14.6 | EVET (sınıf kanıtı) | kanarya-fork + urun-curutucu canlı |
| ops-dogrulayici | verify-before-done | proje | 10.3 | EVET (sınıf kanıtı) | aynı yol: çıplak ad proje skill, kanarya + 9 canlı satır |
| satis-arastirmaci | codegraph | proje | 5.4 | EVET (sınıf kanıtı) | aynı yol: çıplak ad proje skill, kanarya + 9 canlı satır |
| satis-curutucu | plan-challenger (fork) | proje | 14.6 | EVET (sınıf kanıtı) | kanarya-fork + urun-curutucu canlı |
| satis-curutucu | supabase-security | proje | 14.4 | EVET (sınıf kanıtı) | aynı yol: çıplak ad proje skill, kanarya + 9 canlı satır |
| satis-dogrulayici | verify-before-done | proje | 10.3 | EVET (sınıf kanıtı) | aynı yol: çıplak ad proje skill, kanarya + 9 canlı satır |
| satis-dogrulayici | webapp-testing | kullanıcı | - | EVET (sınıf kanıtı) | kullanıcı düzeyi skill: webapp-testing + accessibility canlı |
| satis-uygulayici | create-migration | proje | 6.3 | EVET | canlı: Haiku+Sonnet alt ajanında gövde alıntılandı |
| tasarim-arastirmaci | venthub-tasarim-dili | proje | 11.4 | EVET (sınıf kanıtı) | aynı yol: çıplak ad proje skill, kanarya + 9 canlı satır |
| tasarim-curutucu | plan-challenger (fork) | proje | 14.6 | EVET (sınıf kanıtı) | kanarya-fork + urun-curutucu canlı |
| tasarim-curutucu | web-design-guidelines | proje | 4.0 | EVET (sınıf kanıtı) | aynı yol: çıplak ad proje skill, kanarya + 9 canlı satır |
| tasarim-dogrulayici | verify-before-done | proje | 10.3 | EVET (sınıf kanıtı) | aynı yol: çıplak ad proje skill, kanarya + 9 canlı satır |
| tasarim-dogrulayici | accessibility | kullanıcı | - | EVET (sınıf kanıtı) | kullanıcı düzeyi skill: webapp-testing + accessibility canlı |
| tasarim-dogrulayici | webapp-testing | kullanıcı | - | EVET (sınıf kanıtı) | kullanıcı düzeyi skill: webapp-testing + accessibility canlı |
| tasarim-uygulayici | typography | proje | 7.3 | EVET (sınıf kanıtı) | aynı yol: çıplak ad proje skill, kanarya + 9 canlı satır |
| tasarim-uygulayici | venthub-tasarim-dili | proje | 11.4 | EVET (sınıf kanıtı) | aynı yol: çıplak ad proje skill, kanarya + 9 canlı satır |
| urun-arastirmaci | codegraph | proje | 5.4 | EVET | canlı: Haiku+Sonnet alt ajanında gövde alıntılandı |
| urun-arastirmaci | investigate | proje | 6.0 | EVET | canlı: Haiku+Sonnet alt ajanında gövde alıntılandı |
| urun-arastirmaci | venthub-architecture | proje | 6.5 | EVET | canlı: Haiku+Sonnet alt ajanında gövde alıntılandı |
| urun-curutucu | plan-challenger (fork) | proje | 14.6 | EVET | canlı: Haiku alt ajanında gövde alıntılandı |
| urun-curutucu | supabase-security | proje | 14.4 | EVET | canlı: Haiku alt ajanında gövde alıntılandı |
| urun-dogrulayici | verify-before-done | proje | 10.3 | EVET (sınıf kanıtı) | aynı yol: çıplak ad proje skill, kanarya + 9 canlı satır |
| urun-dogrulayici | accessibility | kullanıcı | - | EVET (sınıf kanıtı) | kullanıcı düzeyi skill: webapp-testing + accessibility canlı |
| urun-dogrulayici | web-design-guidelines | proje | 4.0 | EVET (sınıf kanıtı) | aynı yol: çıplak ad proje skill, kanarya + 9 canlı satır |
| urun-dogrulayici | webapp-testing | kullanıcı | - | EVET (sınıf kanıtı) | kullanıcı düzeyi skill: webapp-testing + accessibility canlı |
| urun-uygulayici | i18n-conventions | proje | 14.2 | EVET (sınıf kanıtı) | aynı yol: çıplak ad proje skill, kanarya + 9 canlı satır |
| urun-uygulayici | venthub-tasarim-dili | proje | 11.4 | EVET (sınıf kanıtı) | aynı yol: çıplak ad proje skill, kanarya + 9 canlı satır |
| urun-uygulayici | venthub-architecture | proje | 6.5 | EVET (sınıf kanıtı) | aynı yol: çıplak ad proje skill, kanarya + 9 canlı satır |
| yetenek-curutucu | plan-challenger (fork) | proje | 14.6 | EVET (sınıf kanıtı) | kanarya-fork + urun-curutucu canlı |
| yetenek-dogrulayici | verify-before-done | proje | 10.3 | EVET (sınıf kanıtı) | aynı yol: çıplak ad proje skill, kanarya + 9 canlı satır |

## Kırık satır (bu PR'da düzeltildi)

| Tanım | Skill | Kaynak | Yüklendi mi | Kanıt |
|-------|-------|--------|-------------|-------|
| satis-arastirmaci | supabase-postgres-best-practices | eklenti (`supabase`) | **HAYIR** | Haiku ve Sonnet alt ajanı "YOK" dedi; aynı tanımdaki `create-migration` yüklendi (kontrol) |
| satis-uygulayici | supabase-postgres-best-practices | eklenti (`supabase`) | **HAYIR** | aynı |

**Neden**: skill `supabase` eklentisinin içinde (önbellekte `claude-plugins-official/supabase/0.1.15`, MIT); eklenti bu makinede **etkin değil**
(ayar dosyasında yok, ölçüm oturumunun eklenti listesinde yok). Tanım üreticisindeki elle yazılmış `KULLANICI_DUZEYI` listesi adı "bilinen kullanıcı düzeyi skill'i"
saymıştı; mevcut kapı yalnız bu BEYAN listesine bakıyordu, gerçek çözülmeye değil. Olmayan ad hata vermediği için kusur ölçüme kadar görünmedi.

**Düzeltme (OPS kararı, 10-01)**: ad iki SATIS setinden çıkarıldı (bekleyene, nedenle yazıldı), tanımlar üreticiyle yeniden üretildi (üretici betiğe dokunulmadı).
Alternatifler: skill'i projeye almak (MIT, 3,2 KB; skill yük bütçesinde 412 bayt boşluk var, sığmayabilir) ya da eklentiyi açmak (ayar dosyası: Recep).

## Kapı: INV-AJAN-SKILL-COZULUR-1 (`src/__tests__/conformance/ajan-skill-cozulur.test.ts`)

- **CI katmanı (makineden bağımsız)**: setlerde geçen ve projede olmayan her skill adı, test içindeki `DIS_BAGIMLILIK` tablosunda kaynağıyla beyan edilmiş olmalı
  (şimdi 8 ad, hepsi kullanıcı düzeyi). Yeni bir dış ad eklemek, önce makinede ölçüp tabloya yazmayı zorunlu kılar. Bayat beyan da kırmızı.
- **Yerel katman (`~/.claude` varsa)**: beyan edilen her ad bu makinede gerçekten çözülmeli (kullanıcı düzeyi ya da AYARDA ETKİN eklenti). CI'da test görünür biçimde ATLANIR.
- **Sınır (dürüstlük)**: CI'da kullanıcı düzeyi skill ve eklenti yok; "çözülüyor mu" ölçümü yalnız Recep'in makinesinde yerelde koşar. CI yalnız beyansız adı yakalar.
- **Sabotaj kanıtı**: düzeltmeden önceki setler JSON'u geri konunca iki katman da `supabase-postgres-best-practices` adıyla kırmızı verir. Çözüm işlevi geçici sahte ev dizininde sınanır:
  eklenti önbellekte var ama kapalı → çözülmedi; açık → eklenti; kullanıcı düzeyi → kullanıcı; hiçbiri → çözülmedi; `~/.claude` yok → ölçülemedi (kırmızı değil).

## Başka bulgular (üretici HARİTA'da, ona yazıldı)

1. **`ToolSearch` yasağı tuzağı**: çalışan tanımının `disallowedTools` alanına `ToolSearch` yazılırsa Haiku çalışan hiç açılmaz. Mevcut 52 tanımın hiçbirinde yok; üretici kuralına ve `INV-AJAN-TANIM-1`'e "ToolSearch yasaklanmaz" eklenmesi önerilir (HARİTA).
2. **`KULLANICI_DUZEYI` listesi** (`scripts/belge/ajan-tanimi-uret.cjs` sabiti) `supabase-postgres-best-practices`'i hâlâ içeriyor; artık hiçbir sette geçmediği için zararsız ama bayat (HARİTA kaldırır).
3. **Ad önceliği**: kullanıcı düzeyi proje düzeyini yener. Bugün projenin hiçbir skill adı kullanıcı düzeyiyle aynı değil (ölçüldü); kapının üçüncü CI-katmanı testi "çakışan ad ön yüklenirse kırmızı" kuralını yerelde denetler (CI'da ~/.claude yoktur, orada geçer).
4. **Kullanıcı düzeyi bağımlılığı**: 9 `skills:` satırı (webapp-testing 4, accessibility 3, search-console 1, pdf 1) ve 4 "adıyla çağır" adı repoda DEĞİL Recep'in `~/.claude/skills` klasöründe yaşıyor. Başka makinede çözülmezler.

## Sınırlar (ölçülmeyenler)

- Canlı koşu 12 gerçek satır × tek tekrar (n=1); 5 kelimelik dizi ölçütü kırpılmış alıntılarda oranı düşürür (0,1–0,9) ama ayırt edici dizi sayısı her yüklü satırda ≥4.
- Alt ajanın ham bağlamı akışta görünmez; kanıt modelin birebir alıntısıdır (belirteç/dosya metni), model beyanı değil. Skill'siz kontrol çalışanı iki kez zaman aşımına uğradı; negatif kontrol olarak `--agent` koşusunun "YOK" cevabı ve belirteçlerin başka hiçbir yerde görünmemesi kullanıldı.
- Davranış deneyi (ön yükleme çalışanın işini değiştiriyor mu, §8) KOŞULMADI.
- `search-console` ve `pdf` satırları canlı denenmedi (dosyaları kullanıcı düzeyinde var; aynı sınıf).
- Ham koşu kayıtları (jsonl) depoya konmadı (oturum geçici dizininde); yöntem yukarıda yeniden üretilecek kadar ayrıntılı.
