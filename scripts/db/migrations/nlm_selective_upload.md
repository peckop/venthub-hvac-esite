---
domain: general
source_type: doc
namespace_type: module
source_path: C:\tmp\wt-supurme\scripts\db\migrations\nlm_selective_upload.py
skeleton_hash: fbb05e5143dd5357
entity_hashes:
  func:main: 13e84e65efd12aa3
  overview: 10996723820bc53c
generated_at: 2026-08-25T07:23:20Z
---

## Genel Bakış

Bu modül, `db/migrations` dizini altında yer alan bir veritabanı migrasyon betiğidir. Modülde yalnızca `main` fonksiyonu tanımlıdır; bu fonksiyon betiğin ana giriş noktasını oluşturur. Modülün adı olan `nlm_selective_upload`, seçici bir yükleme işlemi gerçekleştirildiğini ima eder ancak fonksiyonun içeriğine dair ayrıntı verilen kaynakta yer almamaktadır.

## Fonksiyon Grupları

### Ana Giriş Noktası
Modülün çalıştırılabilir betik olarak tetiklenmesini sağlayan tek fonksiyondur. Başka bir fonksiyon çağrısı veya alt modül bağımlılığı bu kaynakta belirtilmemiştir.
- `main`

## Notlar

- Modülde yalnızca bir fonksiyon bulunduğu için fonksiyonlar arası ilişki veya iç bağımlılık analizi yapılamamaktadır.
- Dış bağımlılıklar, dinamik/lazy yüklenen modüller ve mimari önem hakkında verilen kaynakta bilgi bulunmamaktadır.

---

## AXIOMS – Mimari Varsayımlar

Bu modül için özel aksiyom tanımlanmamıştır.

**Gerekçe:** Fonksiyon gövdesi sağlanmadığından, modülün doğru çalışması için gerekli koşullar belirlenememektedir. Yalnızca `def main()` imzası mevcut olup, gövde içeriği bilinmemektedir.

---

## FONKSİYON DETAYLARI

### main
**Ne yapar**: Belirli bir notebook'a (notebook ID: `235043eb-970f-4a52-9f39-1d02b2621e9c`) önceden tanımlı bir dosya listesini seçici olarak yükler. Her dosya için `notebooklm` CLI aracını kullanarak yükleme komutu çalıştırır ve sonuçları konsola raporlar.

**Nasıl yapar**: Fonksiyon önce `Path(__file__).resolve().parents[3]` ifadesiyle betiğin üç üst dizinine çıkarak repo kök dizinini belirler. Ardından `uploads` adlı bir listede tanımlı yedi dosya-yükseklik çiftini sırayla işler. Her dosya için öncelikle `filepath.exists()` kontrolü yapar; dosya mevcut değilse `SKIP` mesajı yazdırarak bir sonraki dosyaya geçer. Dosya mevcutsa `subprocess.run` ile `notebooklm source add` komutunu çalıştırır. Komutun argümanları şunlardır: dosya yolu (pozisyonel), `-n` ile notebook ID'si, `--type file` ve `--title` ile dosya başlığı. Komutun dönüş kodu sıfır değilse hata mesajı (`stderr`, yoksa `stdout`) yazdırılır; sıfırsa "SUCCESS (kuyruğa alındı)" mesajı yazdırılır. Yorumda belirtildiği üzere bu SUCCESS durumu dosyanın indekslendiği anlamına gelmez, yalnızca kuyruğa alındığı anlamına gelir. Fonksiyon sonunda "Selective upload complete!" mesajı basılır.

**Parametreler**:
- Fonksiyon parametre almaz.

**Dönüş**: Dönüş tipi belirtilmemiştir. Fonksiyon açıkça bir değer döndürmez; yalnızca yan etki olarak konsola çıktı basar ve harici `notebooklm` süreçlerini başlatır.

---

## İTHALATLAR (IMPORTS)
- import: pathlib::Path
- import: subprocess

---

## AST POINTERS

### [N1_NASIL] AST Pointer: scripts/db/migrations/nlm_selective_upload.py::main
- **params**: (parametre yok)
- **ic_degiskenler**:
  - `repo_root` — `Path(__file__).resolve().parents[3]` ile hesaplanan, projenin kök dizini (3 üst dizin yukarı)
  - `notebook_id` — `"235043eb-970f-4a52-9f39-1d02b2621e9c"` sabit string, hedef notebook kimliği
  - `uploads` — sözlük listesi; her elemanda `"file"` (göreceli dosya yolu) ve `"title"` (yükleme başlığı) anahtarları bulunur; 7 elemanlı sabit liste
  - `total` — `len(uploads)` ile hesaplanan, yüklenecek toplam dosya sayısı
  - `idx` — `enumerate(uploads, 1)` ile üretilen sayaç, 1'den başlar
  - `item` — `uploads` listesindeki her bir sözlük elemanı (döngü değişkeni)
  - `filepath` — `repo_root / item["file"]` ile oluşturulan tam dosya yolu (`Path` nesnesi)
  - `title` — `item["title"]` ile alınan dosya başlığı stringi
  - `cmd` — `subprocess.run`'a gönderilecek komut listesi; `"notebooklm"`, `"source"`, `"add"`, dosya yolu, `"-n"`, notebook_id, `"--type"`, `"file"`, `"--title"`, title elemanlarını içerir
  - `result` — `subprocess.run(cmd, capture_output=True, text=True, cwd=str(repo_root))` çağrısının dönüşü (`CompletedProcess` nesnesi)
  - `result.returncode` — subprocess sonucunun dönüş kodu; 0 ise başarılı, 0 değilse hata
  - `result.stderr` — subprocess hata çıktısı; yoksa `result.stdout` kullanılır
  - `result.stdout` — subprocess standart çıktısı
- **Dönüş**: yok (None); yan etki olarak konsola `print()` ile ilerleme/hata mesajları basar ve `notebooklm source add` komutuyla dosyaları notebook'a yükler

---

## NODE ID STANDARD

  file: nlm_selective_upload.py
  function: nlm_selective_upload.py::main

---

## DISA AKTARILANLAR (EXPORTS)
  export: main