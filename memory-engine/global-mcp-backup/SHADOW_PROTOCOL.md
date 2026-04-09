# 🌑 SHADOW PROTOCOL (Gölge Hafıza Kullanım Rehberi)

Ajan bağlamı dolduğunda veya session değiştiğinde eski görev/konuşma verisine kayıpsız ama "gürültüsüz" ulaşabilmek için geliştirilen 3 katmanlı Gölge Hafıza mekanizmasının kullanım kurallarıdır.

## Mimari Bakış

1. **Katman 1 (Ucuz Gölge - `shadow_search.py`):** 
   - `overview.txt` dosyaları üzerinde lokal, strings-based arama yapar.
   - Maliyet: Yok. API çağırmaz.
2. **Katman 2 (Akıllı Gölge - `session_shadow` Domain'i):**
   - Corpus Callosum (CC) veritabanında geçici olarak barınan, son derece kritik kararları içeren DB düğümleridir.
   - Sadece kalıcı olmaması ama mutlaka bir süre "el altında" bulunması gereken notlar için kullanılır.
3. **Katman 3 (Ayna - `checkpoint_mirror.py`):**
   - Sistem check-point aldığında o anki durum özetini, ilerleyen zamanlarda/başka oturumlarda hatırda tutabilmek için `session_shadow` domain'ine (Katman 2'ye) aynalar.

---

## Eylem Tablosu ve Kurallar

| Durum / Olay | Ajan Ne Yapmalı? | Kullanılacak Komut / Yöntem |
| :--- | :--- | :--- |
| **Mimari Karar Alındı** (Şifre değişti, x kütüphanesi iptal edildi vb.) | Anında Gölgeye Yazılmalı | `cc_remember(content="...", domain="session_shadow", source_type="log")` |
| **Kritik Hata Çözüldü** | Kısa bir özet halinde Gölgeye Yazılmalı | `cc_remember(content="Fix...", domain="session_shadow", ...) ` |
| **Geçici Debug / Log Analizi Notu** | **YAZILMAMALI.** Geçici veriler gürültü oluşturur. | - |
| **Geçmişe Dair Kelime Arama Lazım** | İlk olarak Katman 1 (Grep) kullanılmalı | `python <path>/shadow_search.py --query "aranacak_kelime" --project <project_name>` |
| **Session Bitti, İçerik Artık KALICI Bir Kural Olmalı** | Shadow Node'u "Planning" domainine terfi ettirmeli (Promote) | `python <path>/shadow_search.py --promote <NODE_ID> --project <project_name>` |
| **Session Bitti, İçerikler Gereksiz Kaldı** | Bir şey yapmaya gerek yok. Katman 2, 7 gün sonra sessizce silinir. | - |
| **Manuel Temizlik İhtiyacı Doğdu** | Eski kayıtlar arşivlenir | `python <path>/shadow_search.py --cleanup --older-than 7 --project <project_name>` |

---

## Proje İzolasyonu

VentHub ve QVALIDATOR gibi yan yana ilerleyen projelerin shadow verileri BİRBİRİNE KARIŞAMAZ. 

* **`shadow_search.py --init --workspace <path>`**:
  Ajanlar bir projeye girince her ihtimale karşı bu komut tetiklenir veya sistem `cc_set_project` esnasında meta dosyasını atarak isolation zone (izole alan) kurar.
* Arama ve Temizlik yaparken her zaman `--project` bayrağı zorunludur:
  `python shadow_search.py --cleanup --older-than 7 --project venthub`

---

## Kotalar & Sınırlar

* **Session Başına Manuel CC Kaydı:** Max 15 kayıt atılabilir. 
* Gereksiz/Keyfi not almak, `session_shadow` şişkinliği yaratacağı ve `--promote` yükünü zorlaştıracağı için Linter hataları kadar ciddiyetle ele alınmalıdır. 
