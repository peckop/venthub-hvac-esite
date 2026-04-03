# VentHub İş Süreci ve Otonom Yönetim Stratejisi (WORKFLOW_STRATEGY)

Bu döküman, VentHub projesindeki iş akışının, disiplinin ve teknik hedeflerin "Kalıcı Hafızası"dır. 

## 1. Registry Disiplini ve Otonom İşleyiş (V8 + JSON Schema + Superpowers)
Bir AI asistanı göreve başladığında şu otonom akışı izler:
0. **Hafıza Kontrolü (Recall — her oturumun ilk komutu):** `python registry/engine.py recall` — duraklatılmış görev varsa önce onu bitir.
1. **Dashboard Tarama:** `registry/PULSE.md` üzerinden genel durumu anlar.
2. **Görev Seçimi:** `registry/PXX-Project/active/` altındaki ilgili klasöre girer.
3. **Superpowers Döngüsü (Zorunlu — JSON Tabanlı):**
   - `/superpowers-brainstorm` → `brainstorm.json` oluştur, doğrula: `python registry/engine.py validate registry/PXX/YYY/brainstorm.json`
   - `/superpowers-write-plan` → `plan.json` oluştur, çapraz kontrol: `python registry/engine.py cross-validate registry/PXX/YYY`
   - **Implement:** Kodu yaz. Karmaşık değişimlerde `superpowers-tdd` skill'ini kullan.
   - `/superpowers-review` → `review.json` oluştur, doğrula: `python registry/engine.py validate registry/PXX/YYY/review.json`
   - `/bitir` → Dörtlü Mühür (Lint + TSC + Build) + `python registry/engine.py finalize-task registry/PXX/YYY`
4. **Gatekeeper (V8 Engine):** Pipeline durumu için `python registry/engine.py pipeline status registry/PXX/YYY` komutu kullanılır. Eksik veya geçersiz artifact varsa süreç ilerleyemez.

## 2. Nihai Hedefler ve Mimari Felsefe (Soket Mantığı)
VentHub sıradan bir e-ticaret sitesi değil, otonom çalışan modüllerden oluşan **merkezi bir mühendislik platformudur**. Bütün geliştirmeler, yerel (sayfa bazlı) manuel çözümler yerine "soket" mantığıyla çalışan iki ana motor etrafında şekillenir:

1. **Visual Page Builder (Görsel İçerik Motoru - P01 & P04):** Kategori ve ürün sayfalarını kod bağımlılığından kurtarmak, parçalanabilir dinamik bloklar (Master Prototype, Unified Category Shell) inşa etmek.
2. **Autonomous SEO & Performance Engine (Otonom SEO Motoru - P00/031 & P05):** Yüzlerce sayfa için manuel ayar yapmak yerine; veritabanından okuduğu veriyle otomatik JSON-LD (Product, Breadcrumb vb.) üreten fabrikalar, merkezi i18n Alt-Tag fallback sistemleri ve Next.js 15 Suspense/PPR ile çalışan CLS (kayma) engelleyici global skeleton mimarileri kurmak.

Her yeni görev bu iki motorun bir "soket eklentisi" olacak şekilde global tasarlanmalıdır. Lokal ve tekrar eden çözümler Mimari Anayasa'ya aykırıdır.
## 3. Kodlama ve Tip Güvenliği
- Tüm işlemler `src/types/database.types.ts` merkezli yürütülür.
- `any` kullanımı kesinlikle yasaktır (Anayasa kuralı).
- Tüm dinamik rotalar Next.js 15 Async Params protokolüne uygun şekilde `await` edilmelidir.

## 4. 🌐 Linear + Registry Sinerji Stratejisi
- **Linear (Bulut):** Milestone, Roadmap ve üst düzey görev takibi.
- **Registry (Yerel Sentinel):** Ajan otonom yönetimi, kriptografik dosya güvenlik imzalama (Anti-Forgery) ve tam otonom işleyiş.
- İki sistem birbirini tamamlar, ikisi de tek başına yeterli değildir. Her görevin sonunda Linear statüsü `mcp_linear_save_issue` (VENT-XXX ID'leri ile) güncellenmelidir.

---
*Bu strateji, projenin "Kimseye Bağımlı Kalmadan" pürüzsüz büyümesini sağlar.*
