# VentHub Multi-Agent Blackboard Architecture (Otonom Ajan Fabrikası)

*Bu doküman, projede ihtiyaçlar (ve hatalar) sonucunda evrimleşerek ortaya çıkan "Merkeziyetsiz Otonom Ajan" altyapısının nihai vizyonunu belgeler.*

## 1. Sistemin Doğuş Sebebi (Zorunluluk)
VentHub gibi devasa bir projenin tek bir chat penceresinde (IDE) yönetilmesi mimari olarak imkansızdır. Bağlam (context) kaybolur, dosyalar üzerine yazılır ve ajan halüsinasyonları artar. 
Bu Registry sistemi baştan tasarlanmış bir lüks değil; projeyi parçalara bölüp, bu parçaları unutmadan işleyebilmek için doğmuş bir **hayatta kalma mekanizmasıdır**.

## 2. Mimari Bileşenler (Kara Tahta Modeli)

Sistem, yapay zeka klonlarının (CLI Session'ları) birbiriyle doğrudan konuşmadan, ortak bir veritabanı (Dosya Sistemi) üzerinden haberleştiği "Blackboard" (Kara Tahta) mantığına dayanır.

*   **Şef Mimar (IDE Ajanı):** İnsan (Kullanıcı) ile etkileşime girer. Projeyi modüllere böler ve iş paketlerini (JSON) oluşturup panoya (Registry) asar. Kod yazmaz, orkestrasyon yapar.
*   **Kara Tahta (Registry/PXX/*.json):** Sistemdeki tek gerçeklik kaynağıdır. Hangi işin kimde olduğunu, nelerin `pending`, nelerin `done` olduğunu tutar. İşler `cli_session_ids` ile belirli ajan hafızalarına zimmetlenir.
*   **İşçi Uçbeyleri (CLI - `gemini --resume`):** Arka planda terminalde çalışan LLM kopyalarıdır. Sadece kendilerine atanan `in-progress` JSON görevlerini görürler. İşleri bittiğinde tahtaya "bitirdim" yazarlar.

## 3. Otonomi Köprüsü: Tetikleyiciler ve Kalite Kapıları

Bu sistemin kör bir kaosa dönüşmemesi için fiziksel güvenlik kuralları tesis edilmiştir:

1.  **NO-PLAN-NO-CODE (pre-commit hook):** Bir ajan tahtaya plan asılmadan koda dokunamaz.
2.  **Scope Police:** Mimarın belirlediği klasör sınırları (`allowed_paths`) ve dosya bütçesi aşılamaz. Ajan sınır dışına çıkarsa `git commit` fiziksel olarak reddedilir.
3.  **Fiziksel Mühür (.git/pre-commit.stamp):** Ajanın yazdığı kod standartlara uyuyorsa sistem bu mührü basar.
4.  **Watcher (Gelecek Vizyonu):** Arka planda çalışan zamanlanmış bir zeka (`auto_dream.py`), sadece üzerinde mühür olan ve `done` yazan işleri kabul eder. Bunları görünce, zincirdeki bir sonraki görev için otomatik olarak yeni bir İşçi Ajan ateşler.

---

## 4. Google Jules AI ile Venthub Blackboard Karşılaştırması

Google'ın geliştirdiği **Jules (Autonomous AI Coding Agent)** yapısı, VentHub'da kurduğumuz bu yerel mimarinin "Bulut ve Enterprise" yansımasıdır. İki sistemin %100 benzer bir zihniyetle çalıştığını görmek, kurduğumuz altyapının doğruluğunu kanıtlar:

| Özellik | Google Jules AI (Github Entegrasyonu) | VentHub Local Blackboard Sistemi |
| :--- | :--- | :--- |
| **Kara Tahta (State)** | GitHub Issues & Pull Requests | `registry/` klasörü altındaki JSON dosyaları |
| **Tetikleyici (Event Loop)** | GitHub Actions (`jules-action`) / Webhooks | `auto_dream.py` / Yerel Watcher betikleri |
| **İşçi (Worker)** | Google Cloud üzerindeki izole Sanal Makineler | İnsanın bilgisayarındaki Terminal (`gemini --resume`) |
| **Kalite Kapısı (Gate)** | CI/CD Testleri (Github Actions Tests passed) | `pre_commit_scope.py` ve `pre-commit.stamp` |
| **Orkestrasyon** | Jules Tools CLI (npm) | `engine.py` ve `manage_registry.py` |

### Sistemin Hedefi
Jules, nasıl bir Github Issue'yu alıp, sanal makinesinde çözüp, testlerden geçirip PR atıyorsa; VentHub Blackboard sistemi de yereldeki JSON görevini alıp, CLI ajanıyla çözüp, pre-commit testlerinden geçirip bir sonraki JSON görevini tetikleyecek şekilde tasarlanmıştır.

Bu altyapı, standart bir kod asistanını tekil bir ChatBot olmaktan çıkarıp, **Merkeziyetsiz bir Yazılım Geliştirme Departmanına** dönüştürür.
