---
name: notebooklm-sync
description: >
  Projedeki Markdown (.md) dosyalarını NotebookLM ile otonom olarak senkronize etmek (Hard Reset) için kullanın. TETİKLE: Kullanıcı "NLM'yi güncelle", "Senkronizasyon yap", "docs/ klasörünü eşitle", "Master MD'yi yenile", "NotebookLM'e aktar" dediğinde veya mimari bir dokümantasyon değişikliği sonrası "yenileme" istendiğinde. ASLA TETİKLEME: Kullanıcı NotebookLM'den sadece bir şey arıyorsa, yeni bir defter oluşturuyorsa, sadece bir Google Drive/yerel dosya eklemek istiyorsa veya NotebookLM sesli özet/podcast özelliklerini soruyorsa. Bu komut tüm projeyi sil baştan NotebookLM'e yükler.
---

# NotebookLM Otonom Senkronizasyon (NLM Sync)

Bu yetenek (Skill), projedeki Python kaynak kodundan Markdown dokümantasyon üretir, bunları tek bir Master MD'de birleştirir ve otonom olarak NotebookLM'e yükler.

## Kullanım Amacı

Projenin **Tek Doğru Kaynağı (SSOT)** koddur. Kodun meta-verisi `.md` dosyalarında yazar. Mimari değiştikçe NotebookLM hafızasının eskimesini önlemek için bu 3 adımlı pipeline tetiklenmelidir.

## Nasıl Kullanılır?

Senkronizasyonu başlatmak için aşağıdaki **iki komutu sırayla** `run_command` aracıyla çalıştırmanız yeterlidir:

### Adım 1 — Dokümantasyon Üretimi (migrator_lite)

Değişen `.py` dosyaları için `.md` belgelerini üret veya güncelle:

```bash
cc doc all --changed-only
```

> Eğer tüm dosyaları sıfırdan üretmek istiyorsan `--force` ekle:
> `cc doc all --force`

### Adım 2 — System Tree + Master MD + NLM Sync

Tree oluştur, master'ı birleştir ve NotebookLM'e yükle:

```bash
cc doc tree --nlm-sync --force-sync
```

> `--force-sync` bayrağı, Enterprise şablonuna (5N1K/AXIOM) uymayan `.md` dosyalarını atlayarak sync'in durmasını engeller.

## İşlem Akışı (Bilinmesi Gerekenler)

Bu iki komutu çalıştırdığınızda arka planda şunlar gerçekleşir:

1. **migrator_lite:** Tree-sitter ile `.py` dosyalarını tarar, LLM ile 5N1K formatında `.md` üretir.
2. **docs_tree linter:** `system_tree.md` oluşturur, sahipsiz/eksik dokümanları raporlar.
3. **Master MD birleştirme:** Kaynak dizinlerindeki (`corpus_callosum/`, `evals/`, `migrations/`, `memory-engine/`) tüm geçerli `.md` dosyaları `docs/corpus_callosum_master.md` içinde birleştirilir.
4. **NLM temizlik:** Eski master ve standalone kaynaklar `nlm source delete` ile silinir.
5. **NLM yükleme:** Yeni master + 5 standalone dosya ayrı ayrı yüklenir.

## NLM Kaynak Yapısı

NotebookLM defter bilgileri projenin `.cc_docs.yaml` dosyasından okunur. Her projede farklı olabilir.

### Defter ID Tespiti

1. Proje kökünde `.cc_docs.yaml` dosyasını bul
2. `notebook_id` alanını oku
3. Boşsa → yeni defter oluştur ve ID'yi `.cc_docs.yaml`'a kaydet

### Kaynak Yapısı

`standalone_files` listesi `.cc_docs.yaml`'dan okunur. Master MD dosya adı `master_md` alanından gelir.

| Alan | Kaynak | Açıklama |
|------|--------|---------|
| `notebook_id` | .cc_docs.yaml | Defter ID |
| `standalone_files` | .cc_docs.yaml | Ayrı yüklenecek dosyalar |
| `master_md` | .cc_docs.yaml | Master MD dosya adı |

**ÖNEMLİ:** Standalone dosyalar master'a DAHİL EDİLMEZ. Çift bilgi (duplicate) oluşmasını önlemek için bu ayrım korunmalıdır.

## Komut Çıktısının Doğrulanması

Komutu çalıştırdıktan sonra terminal çıktısında şu ifadeyi görmelisiniz:
> `NLM Sync completed successfully! NotebookLM is now 100% up-to-date with local architecture.`

Eğer bu mesajı alırsanız işlem başarılı demektir. Kullanıcıya "NotebookLM senkronizasyonu eksiksiz olarak tamamlandı" bilgisini verebilirsiniz.

**ÖNEMLİ KURAL (Authentication Expired Hatası):** Eğer komut "Authentication expired" hatası verirse, durumu kullanıcıya BİLDİRMEYİN veya ondan terminale komut girmesini İSTEMEYİN. Doğrudan otonom olarak `nlm login` komutunu çalıştırın. Kullanıcının sisteminde otomatik giriş (auto-login) aktiftir, dolayısıyla komutu çalıştırdığınız an kimlik doğrulama kendi kendine tamamlanacaktır. Ardından senkronizasyon komutunu tekrar tetikleyin.

## AXIOMS

- **A1:** Master MD'ye kök dosyalar (ARCHITECTURE, README, ROADMAP, CONTEXT, TRINITY) dahil edilmez.
- **A2:** NLM defterinde her zaman tam 6 kaynak olmalıdır. Fazlası çöp, eksiği eksiktir.
- **A3:** Sync öncesi mutlaka migrator_lite çalıştırılmalıdır — aksi halde eski `.md` NLM'e gider.