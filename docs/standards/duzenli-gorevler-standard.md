# Düzenli Görevler Standardı (v0.1 TASLAK — 2026-10-03)

> **Ne yönetir:** Her rol kartının "Amaç" ve "Düzenli görevler" bölümleri: hangi iş hangi sıklıkta, neyle
> tetiklenir, ne çıktı verir, hangi eşikle geçer; ve tetiğin gerçekten kurulu olup olmadığının nasıl yazıldığı.
> **Niçin var:** OPS-27 (Recep isteği, 2026-10-03). Kartlarda "Görev" tek cümleydi; Amaç ve düzenli görev
> bölümü 16 kartın 15'inde yoktu (OPS ölçümü) ve departmanlar asli görevini kendiliğinden koşmuyordu. İlk
> örnek GEO-SEO: dört düzenli görevin dördünün de tetiği kurulu değil (HARİTA ölçümü, 2026-10-03: `.github/workflows`
> altında `scripts/seo` betiği çağıran dosya yok; cetvel `yayin-gorunurluk-denetim-standard.md` Y2 "workflow ALTYAPI
> tarafından eklenecek" diyordu, eklenmemişti).
> **Sahibi:** HARİTA (şema, üretici, test). Görev satırlarının içeriği rolün kendisinindir; tetiği kurmak tabloda
> "kuracak" diye yazılı roldür.
> **Durum:** v0.1 TASLAK. OPS örneği (GEO-SEO) onaylayana kadar yalnız GEO-SEO verisi var; diğer 15 rolün taslağını
> OPS departmanlara yazdırır, zorunluluk (eksik veri = kırmızı) onaydan sonra açılır.
> **Son doğrulama:** 2026-10-03 (HARİTA: GEO-SEO verisi `yayin-gorunurluk-denetim-standard.md` Y2/Y3'e ve `.github/workflows` taramasına karşı ölçüldü).
> **Kayıt:** HRT-24 (OPS-27). **İlgili:** `docs/roller/<ROL>-gorevler.md` (üretilmiş tablo), `scripts/belge/rol-gorevleri.json`
> (veri), `scripts/belge/rol-karti-uret.cjs` (üretici ve doğrulama), INV-ROL-1 (test).

## Kural

1. **Amaç** TEK cümledir (OPS kararı 10-03: kart bayt payı dar), etki diliyle yazılır (bu iş ne işe yarar, bozulursa kime ne olur); en çok 260 karakter,
   tek paragraf. Kartta "Yönetim" bölümünün altında durur.
2. **Düzenli görev**, tekrarlanan iştir. Tek seferlik iş Kanban kartıdır, bu tabloya girmez.
3. Her görev aşağıdaki altı alanı taşır; hiçbiri boş bırakılmaz.
4. **"Bağlı mı" bir olgudur, niyet değil.** `evet` yalnız tetik dosyası depoda varsa ve görevin komutunu gerçekten
   çağırıyorsa yazılır; test dosyayı okuyup doğrular. Bağlı olmayan görev tablodan silinmez, `hayır (kuracak: ROL)`
   yazılır: boşluk görünür kalır, kuracak rol belli olur.
5. **Bayat kayıt yakalanır:** bir iş akışı görevin komutunu çağırmaya başlamışsa ama kayıt hâlâ `hayır` diyorsa test
   kırmızı verir ("bağlı: evet yazılmalı").
6. **Eşiği cetvelde olmayan görevin eşiği uydurulmaz:** `TASLAK:` ile başlar, rolün kendisi teyit eder (HARİTA
   başkasının eşiğini yazmaz).
7. **Veri tek yerdedir** (`scripts/belge/rol-gorevleri.json`); kart bölümü ve tablo dosyası üretilir, elle düzenlenmez
   (disk = üretici testi). Tablo kartta değil `docs/roller/<ROL>-gorevler.md` dosyasında durur: kartın bayt payı
   sınırlıdır (en büyük kart SATIS 6171 / 6656 bayt, 2026-10-03).

## Alanlar

| Alan | Değerler | Anlamı |
|---|---|---|
| Görev | tek cümle | Ne yapılır; komut varsa parantezde betik yolu |
| Sıklık | her dağıtım · haftalık · aylık · olay | Ne zaman koşar; "olay" = belli bir iş türü başlayınca |
| Tetik | Actions · istem satırı tazelik · kart kapısı | Kendiliğinden kim başlatır (aşağıdaki tablo) |
| Bağlı mı | evet · hayır (kuracak: ROL) | Tetik bugün kurulu mu |
| Çıktı | metin | Ne üretir ve nereye gider (Kanban kartı, kusur sahibi, cetvel PR'ı) |
| Eşik | metin | Geçti/kaldı ölçütü; cetvelde yoksa `TASLAK:` |

## Tetik türleri

| Tür | Ne demek | "Bağlı: evet" kanıtı | Kuran |
|---|---|---|---|
| Actions | `.github/workflows` altında `workflow_run`, `schedule` ya da `push` ile koşan iş akışı | İş akışı dosyası var ve komutu çağırıyor | ALTYAPI |
| İstem satırı tazelik | Her mesajda görünen uyarı satırı (`⚠BELGE` gibi): son koşu kaydı süreyi aşınca görevi hatırlatır | Tazelik betiği var ve görevin komutunu ya da kaydını anıyor | HARİTA (satır tasarımı); kanca altyapısı gerekirse ARAÇ |
| Kart kapısı | Kart açılırken ya da Review'a geçerken koşan kapı | Kapı betiği var ve görevin komutunu anıyor | HARİTA |

## Örnek

`docs/roller/GEO-SEO-gorevler.md` (üretilmiş): dört görev (dağıtım sonrası canlı kapı, haftalık veri incelemesi, aylık resmi
belge incelemesi, yayın öncesi liste), tetiğe bağlı 0. Aylık ve haftalık görevin eşiği `TASLAK` işaretlidir; GEO-SEO teyit eder.

## Sıradaki adımlar

1. OPS örneği onaylar (HRT-24 Review).
2. OPS her departmana kendi amaç ve görev taslağını yazdırır (rol başına ayrı kart); satırlar `rol-gorevleri.json`'a girer.
3. 16 rol doluyken kart bayt payı yeniden ölçülür (en büyük kartta ~400 bayt pay kalıyor).
4. Eksik veri kırmızı sayılır (şimdilik `gorevEksikRoller()` yalnız sayar).
5. "Kuracak" rollerin kartları açılır: önce ALTYAPI'nın canlı kapı iş akışı (REC-502), sonra tazelik satırları ve kart kapısı.
