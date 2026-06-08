---
name: notebook-navigator
description: Use this skill to identify NotebookLM IDs and execute conceptual, architectural,
  RAG, or research queries requiring deep external domain knowledge. DO NOT use for
  local code changes, unit testing, git branching, formatting markdown tables, or
  styling fonts.
category: intelligence
metadata:
  triggers:
  - notebooklm query
  - ikizden sorgula
  - RAG query
  inputs:
  - query string
  outputs:
  - rag response text
  recovery:
    on_auth_expired: powershell -ExecutionPolicy Bypass -File .agent/scripts/nlm-clean-login.ps1
---


# NotebookLM Navigator (Ajanlar İçin Referans Rehberi)

Ajanlar, kompleks sistem kararları alırken veya spesifik domain bilgisine ihtiyaç duyduklarında
NotebookLM kütüphanesini kullanmalıdırlar.

## 1. Defter Dizini (Notebook Index)

Aşağıdaki tablodan sorulan sorunun kategorisine uygun defteri seçin.

### 🏗️ Proje Hafızaları
| Defter | ID | Kaynak |
|--------|----|--------|
| VentHub Proje Hafızası | `235043eb-970f-4a52-9f39-1d02b2621e9c` | 20 |
| Orion - Proje Hafızası | `f53e2849-22aa-4ae8-abd0-eba1d5809029` | 4 |
| Orion Cortex - Proje Hafızası | `7b74ec88-360b-49dd-acda-599229a7e8de` | 7 |
| Orion Registry - Proje Hafızası | `4998b7c0-ad03-458c-97e2-0ae461923032` | 9 |
| corpus-callosum - Proje Hafızası | `16c12752-af49-40ad-88ff-bb2539f9c787` | 15 |

### 🧠 Teknik Bilgi Bankaları
| Defter | ID | Kaynak | Kullanım |
|--------|----|--------|----------|
| 1. CORE AI ENGINEERING | `dff98310-9bc6-40c7-9c09-e1a71fa20100` | 15 | LLM, prompt mühendisliği, model fine-tuning |
| 2. AGENTS / RAG / MEMORY | `88750d28-acee-47f5-a289-f264281c8434` | 10 | RAG pipeline, memory yönetimi, agent mimarisi |
| 3. NEXT.JS / REACT / ENTERPRISE WEB APPS | `0b85ac75-f456-40bf-9b04-de3161ee13b0` | 10 | App Router, SSR, caching, Supabase entegrasyonu |
| 4. THREE.JS / WEBGPU / AI 3D | `f79adc50-c255-4686-b961-d706fa906bbb` | 8 | 3D rendering, WebGPU, Three.js optimizasyonu |
| 5. AI 3D / CAD / RECONSTRUCTION RESEARCH | `fa147b33-2b43-4bc4-8f42-2f07256dcba5` | 20 | 3D model reconstruct, Hunyuan3D, NeRF |
| 6. AUTOMATION / DEVOPS / ORCHESTRATION | `07be9fb3-8c54-4575-a4e3-35a487b476c4` | 4 | CI/CD, Docker, deployment |
| 7. RADAR NOTEBOOK | `f79dbb9c-4238-46c3-b29b-20a982fdf2bc` | 4 | Yeni teknoloji izleme |
| 8. VENTHUB DESIGN SYSTEM | `a1ca5476-c6c6-42aa-b5b8-3eb565b3f100` | 16 | Tasarım token'ları, typography, shadow/spacing standartları, bileşen stil envanteri |

### 🏭 Vortice Ürün Katalogları
| Defter | ID | Kaynak |
|--------|----|--------|
| Vortice \| 00 - Full Catalog | `0e5d2a83-e94f-433a-90e2-4c45b1e3730a` | 35 |
| Vortice \| 01 - Commercial Ventilation | `469037fb-4ed0-4f79-a059-b6e6d499433e` | 10 |
| Vortice \| 02 - Residential Ventilation | `8639a15b-c214-43bd-9561-f7ab38a50fe4` | 4 |
| Vortice \| 03 - Industrial Ventilation | `3cfb3d9d-05a5-4309-951b-52ec43b2abe9` | 3 |
| Vortice \| 04 - CMV & Heat Recovery | `6849eeb3-bb2c-4f48-877d-37feee8134b8` | 8 |
| Vortice \| 05 - Summer Ventilation | `7d8b6de6-e0df-455f-94df-c45055f12287` | 4 |
| Vortice \| 06 - Air Treatment | `3708638b-89d0-4834-add6-f6702d00a724` | 6 |
| Vortice \| 07 - TR Distribütör (Avensair) | `e3b18fa3-6310-4067-9873-2deb847d15a8` | 20 |

### 🔬 Araştırma & Analiz
| Defter | ID | Kaynak |
|--------|----|--------|
| Understand-Anything | `77de8378-5489-492e-8fed-5ccd5adfeb42` | 122 |
| Understand-Anything - Code Analysis v4 | `f9b9ae23-1a96-47cb-bc2d-ebe01c0621f7` | 20 |
| Hunyuan3D & 3D AI Research | `05065847-ea0a-4c13-b1e3-80769a641107` | 28 |
| 3D Model Factory - Proje Hafizasi | `79a2f638-002b-4591-a969-3df0ca2e6ec3` | 15 |
| Orion Monorepo Analizi — 3 Proje Birleştirme | `92e45024-a709-4881-9a4a-1dc5f2881b7e` | 24 |
| CC Birleşik Plan Sentezi — Tüm Fazlar | `0854a526-c416-4b99-b5fe-2b4bb04f1adf` | 30 |
| Trinity Birleşim Laboratuvarı | `fa050316-ef02-4e27-b93f-df809c6501d9` | 3 |

### 🛠️ Rehberler & İlham
| Defter | ID | Kaynak |
|--------|----|--------|
| Prompt Mühendisliği - NotebookLM Yöntemi | `b879c4fc-2655-4827-9bf4-760b1b714f9a` | 1 |
| NotebookLM ile Özel Prompt Mühendisi Sistemi Kurulumu | `d18fcf7f-d64d-4860-9844-43f6da2b9ed1` | 15 |
| Kapsamlı Modern UI Kütüphaneleri Rehberi | `52e4723e-0cfd-46f2-944a-9606c6ea5a29` | 1 |
| MotionSites.ai Yapay Zeka Web Tasarım Komut Kütüphanesi | `d0c81302-47ba-44e0-ab37-3fd7259bcce1` | 1 |
| Claude Code ve Agentik İş Akışları Rehberi | `7657c31f-4e5e-406b-893e-221bcd28e6a1` | 1 |
| Antigravity: 1400+ Ajan Yeteneği Kütüphanesi | `fe83b525-4562-461d-b73f-b3f03edc2fa0` | 1 |
| Spontane Araştırma | `d4b8a52a-2bd4-41c5-9d98-83878007b81a` | 3 |

### 📦 Arşiv
| Defter | ID | Kaynak |
|--------|----|--------|
| Agent Skills Arşivi — Orkestrasyon & CLI | `c7c29d37-e284-49ca-a411-70a8758433f1` | 2 |

## 2. Notebook Nasıl Sorgulanır?

ID'yi tespit ettikten sonra, MCP aracını kullanarak defter içindeki kaynaklara soru sorun:

```
notebook_query(notebook_id="<ID>", query="<soru>")
```

**Örnek:** Kullanıcı "Next.js ile Supabase cache nasıl yönetilmeli?" diye sordu:
1. Tablo → `3. NEXT.JS / REACT / ENTERPRISE WEB APPS` (ID: `0b85ac75-f456-40bf-9b04-de3161ee13b0`)
2. Sorgu: `notebook_query(notebook_id="0b85ac75-...", query="Next.js app router'da Supabase ile data caching best practice'leri nelerdir?")`

**Ürün sorusu:** "Vortice Vort HRI 350 teknik özellikleri?" → Önce `00 - Full Catalog`, bulamazsa ilgili kategori defteri.

## 3. NotebookLM'i İkinci Beyin Olarak Kullanma Kılavuzu (LLM Cognitive Extension)

NotebookLM sadece statik bir doküman arşivi değil, kod tabanının ve mimarinin tamamını saniyeler içinde analiz edebilen dinamik bir **Baş Danışmandır**. Yapay zeka ajanları (LLM) geliştirme yaparken ve kararlar alırken aşağıdaki bilişsel yönergeleri izlemelidir:

### A. Etki Analizi (Impact Analysis)
*   **Kural:** Kod tabanında veya veritabanı şemasında (özellikle RLS politikaları, middleware veya kritik SaaS bileşenlerinde) değişiklik yapmadan önce NotebookLM'e danışın.
*   **Sorgu Kalıbı:** *"X dosyasında/tablosunda yapacağım [değişiklik detayı] değişikliği sistem genelinde hangi bileşenleri, API'leri, ödeme geçitlerini (İyzico vb.) veya Edge Function'ları etkileyebilir? Risk analizini çıkar."*

### B. Proje İlerlemesinin Ölçülmesi (Progress & Complete Evaluation)
*   **Kural:** SaaS Faz 1 (veya aktif faz) hedeflerinin ne kadarının tamamlandığını, geride kalan güvenlik ve mimari açıkları ölçmek için NotebookLM'i bir denetçi olarak kullanın.
*   **Sorgu Kalıbı:** *"CONTEXT.md, README.md ve güncel master dokümanlarına göre SaaS Faz 1 Foundation hedeflerinden hangileri tamamlandı? Eksik kalan veya risk teşkil eden entegrasyonlar nelerdir?"*

### C. Geliştirme Danışmanlığı ve Mimari Arama (Architectural Consulting)
*   **Kural:** Yeni bir kod yazmaya başlamadan önce, projenin geçmişte alınmış kararlarını (Enterprise Design Decisions), i18n kurallarını veya Supabase güvenlik aksiyomlarını NotebookLM'den sorgulayın.
*   **Sorgu Kalıbı:** *"Bu projede RLS politikaları yazılırken veya JWT claims entegrasyonu yapılırken uyulması gereken zorunlu aksiyomlar ve tasarım desenleri nelerdir?"*

### D. Hızlı Kod ve Mantık Keşfi (Dynamic Code Search)
*   **Kural:** Kod tabanı büyüdükçe yüzlerce dosyayı yerel grep/read araçlarıyla tek tek taramak yerine, hedeflenen mantıksal yapıyı ve dosya isimlerini bulmak için önce NotebookLM'i sorgulayın. Bu hem bağlam penceresini (context window) korur hem de aramayı nokta atışı hale getirir.
*   **Sorgu Kalıbı:** *"HVAC fiziksel hesaplamalarını yapan veya tenant context'ini yöneten ana kod blokları ve bunların bağlı olduğu yardımcı sınıflar hangi dosyalarda yer alıyor?"*

## 4. Katı Kurallar

- Kullanıcıya "Şu notebook'ta arayabilirim, ister misin?" diye **sormayın**. Gerekli görüyorsanız otonom olarak sorguyu yapıp sonucu entegre ederek cevap verin.
- Kendi bilginiz çelişkili veya eskiyse, mutlaka ilgili defteri sorgulayın.
- Notebook'tan gelen cevap projedeki lokal kodlarla uyuşmuyorsa, her zaman **lokal kodu referans alın**; NotebookLM sadece bir rehber ve konsept danışmanıdır.
- **Authentication Expired Hatası:** Durumu kullanıcıya BİLDİRMEYİN. Otomatik giriş ve temiz tarayıcı tüneli aktiftir. Windows üzerinde kimlik doğrulama oturumunu yenilemek için doğrudan şu PowerShell tünel scriptini bypass politikasıyla çalıştırın:
  ```bash
  powershell -ExecutionPolicy Bypass -File .agent/scripts/nlm-clean-login.ps1
  ```
  Giriş işlemi tamamlandıktan sonra başarısız olan sorguyu otonom olarak tekrar tetikleyin.
