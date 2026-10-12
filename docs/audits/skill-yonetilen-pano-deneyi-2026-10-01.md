# YTN-4 — Yönetilen pano deneyi (2026-10-01)

Soru (OPS): Kanban'ın "Done = kanıt komutu" kuralını araç kendisi zorlayabiliyor mu?
Yöntem: atılabilir deney panosu (`58682ab9…`), `adopt_managed_lifecycle` ile yönetilen kipe alındı;
gerçek iş kartı konmadı. Karşılaştırma: YETENEK panosu (yönetilmeyen).

## Sonuç tablosu

| # | Soru | Yönetilmeyen pano (YETENEK) | Yönetilen pano (deney) |
|---|------|------------------------------|-------------------------|
| 1 | Kanıtsız kartı Done'a taşımak | `move_task` geçirir (kanıt koşmamış olsa bile) | `move_task` REFUSED (`transition-skipped`); tek yol `mark_assignment` |
| 2 | `transition_task` | Her durumda REFUSED (`managed-policy-invalid lifecycle.mode`) | Çalışır; tek aşama, kanıt ve `transitionAction` ister |
| 3 | Kanıt komutu kırmızı (`false`) | `verify_completion` failed der, ama `move_task` yine Done'a alır | `mark_assignment(completed)` kartı REVIEW'da bırakır ("manuel kabul"); `transition_task done` REFUSED (`acceptance-criteria-incomplete`) |
| 4 | Kanıt yeşil (`true`) | Elle `verify_completion` + `move_task` | `mark_assignment(completed)` kanıtı kendisi koşturur, geçerse Done'a OTOMATİK alır |
| 5 | Kiralama (lease) süresi dolunca | **E6 (temiz, kurtarma çağrısı yok):** bitişten 2 dk sonra kart hâlâ running, deneme 1 (kendiliğinden kurtarma YOK). Önceki "6 dk" ölçümü geçersiz (kiralama henüz dolmamıştı) | **İki gözlem ayırt edilemiyor:** (a) alt ajan: bitişten ~73 sn sonra `kanban-supervisor` kartı To Do'ya aldı, deneme 1→2; (b) ben aynı saniyede (09:19:49) `recover_stale` elle çağırdım ve "Recovered 1" döndü. Hipotez: otomatik kurtarma yalnız yönetilen kipte çalışıyor (E6 yönetilmeyen panoda çalışmadı). Doğrulanmadı: yeniden adopt, arşivlenen deney kartları yüzünden REFUSED (`stage-mismatch`). Pilot panosunda "bayat kalan kart" sayacıyla ölçülecek (YTN-6) |
| 10 | `release_managed_lifecycle` (geri dönüş) | — | "Sıkı kapılar kalktı": kırmızı kanıtlı E3 kartı `move_task` ile Done'a GEÇTİ. Pano kaydında `completionGate: strict` yazısı kalsa da etkisiz; geri dönüş = kapının tamamen kalkması |
| 6 | Başlık-only kart açmak | Açılır | REFUSED (`task-detail-missing`): açıklama şart |
| 7 | Kanıtsız `todo` aşaması | Serbest | `add_check` ister (todo bile) |
| 8 | Başka kimlik, çalışan kartı alabilir mi | — | `claim_task` başka kimlikle running kartı ALAMADI |
| 9 | Kiralama kimliği (`expectedLeaseId`) olmadan yazma | — | Kabul edildi: çit zorunlu değil |

## Hüküm

- **Yönetilen pano kapıyı gerçekten zorluyor.** Yönetilmeyen panoda Done'u kanıt değil, `move_task` çağıran kişinin
  dürüstlüğü koruyor.
- Kırmızı kanıtı "geçti" yapmak ya da kanıtı silmek aracın önerdiği çıkış yolu; gerçek işte yasak, denenmedi.
- Bedeli: her kart açıklama + kanıt + `start_task` + `mark_assignment` ister; çıktılar büyük (yazma başına 7–20 KB).
- Yönetilmeyen panoda kiralama kendiliğinden temizlenmez (E6 ölçüldü): çalışan çökerse kart "running" kalır.
  Yönetilen panoda otomatik kurtarma var mı sorusu **açık** (satır 5); pilot ölçecek, o zamana dek oturum açılışında
  bir kez `recover_stale` (OPS kararı).
- Geri dönüş tek yönlü gevşetmedir: `release_managed_lifecycle` gerçek panoda çağrılmamalı.

## Ek bulgular (alt ajan a4692de3, ayrı gözlem)

- `claim_task` başka kimlikle, `todo` kartı kiralama olmadan aldı (sahiplik devri); yalnız `running` kart alınamadı.
- `update_task status=archived` kartı `done` sütununa taşıyor; arşivlenmiş deney kartları panonun yeniden
  `adopt_managed_lifecycle` çağrısını kilitliyor (`stage-mismatch`, REFUSED): deney panosu tek kullanımlık.
- `update_task` içindeki `note` parametresi not olarak kaydedilmedi; not için `add_note` gerekir.
- Release sonrası açıklamasız kart açılıyor ve `move_task` kanıtsız Done'a alıyor (satır 10 ile tutarlı);
  `lifecycle` ile `status`/sütun ayrışabiliyor.
- Her yazma çağrısı 12–17 KB (tüm pano) döndürüyor.
- Alt ajan, release'i "başka aktör" sandı; E3/E5 benim (YETENEK) eylemlerimdi, B ve C ölçümleri bu nedenle
  iki gözlemcinin birleşimidir.

## Araç sağlığı (ARC-9 için)

- `file_exists` kanıtı `C:/tmp/…` ve `C:\tmp\…` biçimlerinin ikisinde de "dosya yok" dedi; dosya vardı (proje dışı yol).
- `verify_completion` iki kez `domainCall timed out` verdi, ikinci denemede koştu.

## Skill'e giren kurallar (wrongstack-kanban)

- Done kapısını araç ancak yönetilen panoda zorlar; yönetilmeyen panoda kural, çağıranın dürüstlüğüdür.
- Kırmızı kanıtı "geçti" yapmak ya da kanıtı silmek yasak (araç da bunu yazıyor).
- `release_managed_lifecycle` gerçek panoda çağrılmaz.
- Yönetilen panoda kart: açıklama + kanıt + `start_task` + `mark_assignment`; Done'u `mark_assignment` verir.

## Açık kalanlar

- Yönetilen panoda otomatik kiralama kurtarma (satır 5): pilotta (YTN-6) ölçülecek.
- Deney panosu `58682ab9…` artık tek kullanımlıktır; E6 kartı (`b2bfa04f`) arşivlenecek.
