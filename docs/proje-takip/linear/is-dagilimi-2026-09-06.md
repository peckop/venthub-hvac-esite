<!-- uretilmis: Linear MCP disa aktarimi · damga 2026-09-06T11:46:36Z · elle duzenlenmez; yenileme: gun kapanisi ritueli -->
# Linear İş Dağılımı — Şantiye Durumu (2026-09-06)

**Damga:** 2026-09-06T11:46:36Z (UTC, `date -u` ile ölçüldü) · **Kaynak:** Linear MCP `list_issues` (takım: Recep's Workspace) · **Toplam iş:** 167 (REC-1…REC-167, boşluk yok) · **Ham veri:** `is-dagilimi-2026-09-06.json`

> Okuma kılavuzu (AVM benzetmesi): her proje bir kat, her kilometre taşı bir dükkân sırası, her iş bir dükkân. **% bitti = Done / (Toplam − Canceled)**. "Sorumlu etiket" = şerit (OPS / URUN / ALTYAPI / DESIGN…); Linear'da atanan kişi alanı yalnız Recep'te dolu (68/167), o yüzden şerit etiketi sorumluluk göstergesi olarak kullanılır.

Durum dağılımı (ham): Done 57 · In Progress 41 · Backlog 34 · Todo 33 · Canceled 2

## §1 ÖZET — proje başına

| Proje | Toplam | Done | In Progress/Review | Todo/Backlog | Canceled | % bitti |
|---|---:|---:|---:|---:|---:|---:|
| Altyapı, Kapılar ve Belge Hattı · _In Progress_ | 47 | 15 | 18 | 13 | 1 | 33% |
| Vitrin 15A Yeniden Tasarım (DESIGN-MENU) · _In Progress_ | 35 | 14 | 10 | 11 | 0 | 40% |
| Teklif Akışı ve Müşteri Paneli · _Planned_ | 22 | 4 | 3 | 15 | 0 | 18% |
| Katalog ve Ürün Verisi · _In Progress_ | 20 | 1 | 9 | 10 | 0 | 5% |
| SEO ve Yayın · _In Progress_ | 6 | 3 | 1 | 1 | 1 | 60% |
| Marka Kılavuzu (DESIGN-MARKA) · _Backlog_ | 2 | 0 | 0 | 2 | 0 | 0% |
| Kurumsal Belgeler (DESIGN-BELGE) · _Backlog_ | 1 | 0 | 0 | 1 | 0 | 0% |
| Q-Validator · _Backlog_ | 28 | 20 | 0 | 8 | 0 | 71% |
| (projesiz) | 6 | 0 | 0 | 6 | 0 | 0% |
| **GENEL TOPLAM** | **167** | **57** | **41** | **67** | **2** | **35%** |

Proje durumu (Linear proje alanı): Altyapı, Kapılar ve Belge Hattı = In Progress · Vitrin 15A Yeniden Tasarım (DESIGN-MENU) = In Progress · Teklif Akışı ve Müşteri Paneli = Planned · Katalog ve Ürün Verisi = In Progress · SEO ve Yayın = In Progress · Marka Kılavuzu (DESIGN-MARKA) = Backlog · Kurumsal Belgeler (DESIGN-BELGE) = Backlog · ARŞİV — VentHub HVAC (düz yapı, 2026-09-03'e kadar) = Completed · Q-Validator = Backlog

## §2 ŞERİT / ETİKET başına

| Şerit/Etiket | Toplam | Done | In Progress/Review | Todo/Backlog | Canceled | % bitti |
|---|---:|---:|---:|---:|---:|---:|
| OPS | 29 | 4 | 10 | 14 | 1 | 14% |
| URUN | 62 | 19 | 16 | 26 | 1 | 31% |
| ALTYAPI | 34 | 14 | 10 | 10 | 0 | 41% |
| DESIGN | 4 | 0 | 0 | 4 | 0 | 0% |
| Recep kapısı | 3 | 1 | 0 | 1 | 1 | 50% |
| P01-Data | 4 | 3 | 0 | 1 | 0 | 75% |
| P02-Constraint | 6 | 6 | 0 | 0 | 0 | 100% |
| P03-API | 3 | 0 | 0 | 3 | 0 | 0% |
| P04-Research | 3 | 3 | 0 | 0 | 0 | 100% |
| (etiketsiz) | 26 | 8 | 5 | 13 | 0 | 31% |
| **GENEL TOPLAM** | **174** | **58** | **41** | **72** | **3** | **34%** |

_Not: bir iş birden çok etiket taşıyabilir; etiket satırları toplamı (174) iş sayısından (167) farklı olabilir. Etiketsiz iş: 26._

## §3 Proje → kilometre taşı → iş (açık işler)

Her kilometre taşı altında yalnız **açık** işler listelenir; Done olanlar §3b'de.

### Altyapı, Kapılar ve Belge Hattı — 47 iş · Done 15 · %33 bitti

#### ▸ Kolsuz cetveller — 1 iş · Done 0 · %0
| ID | Durum | Başlık | Sorumlu etiket | Öncelik | Son güncelleme |
|---|---|---|---|---|---|
| REC-120 | In Progress | INV-CETVEL-YAPI iki kapsam kusuru: HÜKÜM başlığı dosya-çapında tekil sanılıyo… | ALTYAPI | No priority | 2026-09-03 |

#### ▸ Kapı kör kolları — 13 iş · Done 3 · %25
| ID | Durum | Başlık | Sorumlu etiket | Öncelik | Son güncelleme |
|---|---|---|---|---|---|
| REC-51 | Canceled | Supabase "leaked password protection" AÇ | Recep kapısı, OPS | High | 2026-09-04 |
| REC-52 | In Progress | whsec_ webhook secret rotasyonu (repo PUBLIC) | ALTYAPI | High | 2026-09-06 |
| REC-58 | Todo | Onaysız tehlikeli butonlar: tekil iade + tekil rol değişikliği | ALTYAPI | Urgent | 2026-09-03 |
| REC-74 | In Progress | Güvenlik açık işleri (registry taşıması) | OPS | No priority | 2026-09-03 |
| REC-119 | Todo | Sistematik ölü kod temizliği: knip 30 dosya + 67 export — CodeGraph çapraz do… | ALTYAPI | Medium | 2026-09-03 |
| REC-121 | Todo | Tip-drift kapısı: migration inince database.types.ts canlı şemayla senkron mu… | ALTYAPI | No priority | 2026-09-03 |
| REC-130 | In Progress | Ölçüm komutları çalışma dizinini beyan eder; oturum dizini şerit ağacından ay… | ALTYAPI | High | 2026-09-03 |
| REC-133 | In Progress | Ölü anahtar kapısı: bileşene devredilen sözlük alt ağacı (dictionary={dict.ho… | URUN | Low | 2026-09-05 |
| REC-137 | Backlog | İLAN EDİLMEMİŞ KAYNAK hiçbir kapının evreninde değil — REC-132 bu pencereyi U… | ALTYAPI | Medium | 2026-09-03 |
| REC-138 | In Progress | SSR duman kilidi PR KAPISI olarak: CI kendi sunucusunu kaldırır — ama gerçek … | ALTYAPI | Medium | 2026-09-06 |

#### ▸ Belge hattı — 10 iş · Done 4 · %40
| ID | Durum | Başlık | Sorumlu etiket | Öncelik | Son güncelleme |
|---|---|---|---|---|---|
| REC-64 | Todo | İkiz taraması: 20 aday eksik — koda karşı doğrula, haritaya işle | OPS | Medium | 2026-09-03 |
| REC-67 | In Progress | Companion üreteci taşıyıcısı — mimo üyeliği iptal, 28'inden sonra Haiku masada | OPS | Medium | 2026-09-05 |
| REC-69 | In Progress | T021 — Üretilen belge tazelik kapıları, venthub ayağı (Kapı A + Kapı C + cetvel) | ALTYAPI | No priority | 2026-09-05 |
| REC-84 | In Progress | Belge Tazeleme — companion + master MD + NLM ikizi, SIFIRLANANA KADAR | OPS | No priority | 2026-09-05 |
| REC-102 | In Progress | Orion companion üreteci: 3 kalem — çıkış kodu dürüstlüğü, defter/batch yolu, … | ALTYAPI | Medium | 2026-09-04 |
| REC-132 | In Progress | Üretilmiş toplamalar (master md + manifest) özellik PR'larında yol almasın; m… | ALTYAPI | High | 2026-09-05 |

#### ▸ Orion köprüsü ve filo mekanizması — 16 iş · Done 8 · %50
| ID | Durum | Başlık | Sorumlu etiket | Öncelik | Son güncelleme |
|---|---|---|---|---|---|
| REC-70 | Todo | T019 — 21 zaman-aşımısız dış çağrıya bütçe + AST konformans kapısı | ALTYAPI | No priority | 2026-09-03 |
| REC-71 | Todo | T018 — Köprü içe alma açıklığı: 129 raporlandı / 126 oluştu | ALTYAPI | No priority | 2026-09-03 |
| REC-76 | In Progress | Altyapı & Araç açık işleri (registry taşıması) | OPS | No priority | 2026-09-03 |
| REC-78 | Todo | Sayaç üçlüsü: atılan ölçümleri yakala (T018 ardılı) | ALTYAPI | No priority | 2026-09-03 |
| REC-82 | Backlog | Pano v2: adresli görünürlük — yetkisiz oturum panonun tamamını görmez | ALTYAPI | High | 2026-09-03 |
| REC-86 | In Progress | Ajan hafıza sistemi — araştırma, karar ve Faz 1 (PreCompact kapısı) | OPS | High | 2026-09-03 |
| REC-107 | Backlog | Hijyen: ortak depoda 36 worktree + 83 stash birikti — envanter ve bilinçli te… | OPS | Low | 2026-09-05 |
| REC-126 | Todo | Jules Darwin/Bolt önerileri — kapatılan #879/#878'in fikir kaydı (atama değil… | OPS | No priority | 2026-09-03 |

#### ▸ (kilometre taşı yok) — 7 iş · Done 0 · %0
| ID | Durum | Başlık | Sorumlu etiket | Öncelik | Son güncelleme |
|---|---|---|---|---|---|
| REC-141 | In Progress | (OPS) Belge çelişki temizliği paketi — 2026-09-04 taraması (13 kalem, sahipli) | — | Medium | 2026-09-06 |
| REC-142 | In Progress | Companion sistemi UYKU KİPİ — tek taşıyıcı anahtarı, tüm kapılar say-raporla,… | — | Urgent | 2026-09-05 |
| REC-144 | In Progress | INV-DOC-3 v2 — küme master TAZELİK paritesi (ad paritesi yerine); bloklamaz, … | ALTYAPI | Medium | 2026-09-05 |
| REC-158 | In Progress | Föy PDF'i ile vitrin AYNI biçimlendiriciyi kullansın (INV-FOY-PARITE-1) — önc… | ALTYAPI | Medium | 2026-09-06 |
| REC-160 | Backlog | Satınalma belge kimlikleri: purchase_orders.po_no + goods_receipts.grn_no (K1… | ALTYAPI | Low | 2026-09-06 |
| REC-162 | In Progress | Vercel günlük derleme sınırı: kapıda "rate limited" kolu = ÖLÇÜLEMEZ (madde 3… | ALTYAPI | High | 2026-09-06 |
| REC-167 | Backlog | KVKK başvuru kaydı şeması: başvuru no (K19 önek KV), talep metni, ad soyad, t… | ALTYAPI | Low | 2026-09-06 |

### Vitrin 15A Yeniden Tasarım (DESIGN-MENU) — 35 iş · Done 14 · %40 bitti

#### ▸ Tasarım Onayı — 1 iş · Done 0 · %0
| ID | Durum | Başlık | Sorumlu etiket | Öncelik | Son güncelleme |
|---|---|---|---|---|---|
| REC-129 | In Progress | Kimlik + vitrin yeniden tasarımı — tek dil, fazlı üretim (logo/palet/ikon KAP… | OPS | High | 2026-09-05 |

#### ▸ Faz 1 — Kabuk — 3 iş · Done 1 · %33
| ID | Durum | Başlık | Sorumlu etiket | Öncelik | Son güncelleme |
|---|---|---|---|---|---|
| REC-89 | In Progress | Mobil vitrin kusurları: hero buton metinleri görünmüyor + PDP scroll'da görse… | URUN | No priority | 2026-09-03 |
| REC-125 | In Progress | Consul bot bulguları: hardcoded TR literal → sözlük — SecurityRibbon, OrderSu… | URUN | No priority | 2026-09-05 |

#### ▸ Faz 2 — Ana Sayfa, Menü ve Adresler — 22 iş · Done 12 · %55
| ID | Durum | Başlık | Sorumlu etiket | Öncelik | Son güncelleme |
|---|---|---|---|---|---|
| REC-59 | In Progress | SSG/ISR Dalga-2: 4 ana rota gerçekten statik olsun + SSR kapısı CI'a | URUN | High | 2026-09-04 |
| REC-61 | Todo | Sayfa görselleri Gemini üretim hattı — hava perdesi şablonundaki gibi | URUN | Medium | 2026-09-03 |
| REC-72 | In Progress | Vitrin & Ürün açık işleri (registry taşıması) | OPS | No priority | 2026-09-03 |
| REC-92 | Backlog | Ana sayfa ticari blokları veri-dayanaksız: "Çok Satanlar" uydurma dilim + gör… | URUN | High | 2026-09-03 |
| REC-93 | Backlog | Site geneli dekoratif görsel–başlık uyum envanteri (ürün görselleri HARİÇ) | URUN | Medium | 2026-09-03 |
| REC-94 | In Progress | Ana sayfa yeniden tasarımı — tam kapsamlı tarama + tasarım programı (Faz B yü… | URUN | High | 2026-09-03 |
| REC-99 | Backlog | Sayfa iki aşamada yükleniyor: sunucu kategoriyi göremiyor, arayüz açıldıktan … | URUN | No priority | 2026-09-03 |
| REC-106 | Backlog | DEĞERLENDİRME: Sayfa kompozisyon mimarisi — "Lego + SSOT" hedefine mesafe ve … | OPS | High | 2026-09-05 |
| REC-123 | Todo | Arama/filtre eşleşmesi ham TR ad üzerinden — EN yazan müşteri eşleşmez (iki i… | URUN | No priority | 2026-09-03 |
| REC-128 | Todo | Ana sayfa /tr ve /en DİNAMİK render: Cache-Control no-store + X-Vercel-Cache … | URUN | No priority | 2026-09-03 |

#### ▸ Faz 3 — Ürün Sayfası ve Kartlar — 3 iş · Done 1 · %33
| ID | Durum | Başlık | Sorumlu etiket | Öncelik | Son güncelleme |
|---|---|---|---|---|---|
| REC-65 | Todo | Ürün kartı + PDP fiyat/teknik özellik düzeni revizyonu | URUN | High | 2026-09-03 |
| REC-95 | Backlog | Ürün özelliği katmanı: ATEX / mini aksiyel / asit dayanımlı kategori DEĞİL — … | URUN | Medium | 2026-09-03 |

#### ▸ Faz 4 — Teklif Listesi ve Hesap — 1 iş · Done 0 · %0
| ID | Durum | Başlık | Sorumlu etiket | Öncelik | Son güncelleme |
|---|---|---|---|---|---|
| REC-116 | Todo | Kayıt sayfası revizyonu: Google-ile-kayıt YOK (girişte var, kayıtta yok) + ta… | URUN | Medium | 2026-09-03 |

#### ▸ (kilometre taşı yok) — 5 iş · Done 0 · %0
| ID | Durum | Başlık | Sorumlu etiket | Öncelik | Son güncelleme |
|---|---|---|---|---|---|
| REC-147 | In Progress | DEĞERLENDİRME: Tasarım yetenek (skill) envanteri — 31 dış yetenek kuruldu, bi… | OPS | Medium | 2026-09-06 |
| REC-148 | In Progress | Vitrin vaat envanteri ve mükerrer girişler — ölçülmüş bulgu listesi | — | Medium | 2026-09-05 |
| REC-150 | In Progress | Çift title: Seo bileşeni ile App Router metadata tek yazıcıya iner (generateM… | — | High | 2026-09-05 |
| REC-152 | Backlog | Sorular — DESIGN-MENU (sürekli açık soru/öneri kaydı) | DESIGN, OPS | No priority | 2026-09-05 |
| REC-165 | In Progress | Tasarım→Kod Faz 2+3: DS token köprüsü (57 token → index.css türev + tailwind … | URUN | High | 2026-09-06 |

### Teklif Akışı ve Müşteri Paneli — 22 iş · Done 4 · %18 bitti

#### ▸ Teklif kipi — 2 iş · Done 1 · %50
| ID | Durum | Başlık | Sorumlu etiket | Öncelik | Son güncelleme |
|---|---|---|---|---|---|
| REC-117 | Todo | Misafir teklif akışı: teklif için üyelik zorunluluğu kalkıyor (Recep kararı) … | URUN | High | 2026-09-04 |

#### ▸ Proje ve panel — 3 iş · Done 1 · %33
| ID | Durum | Başlık | Sorumlu etiket | Öncelik | Son güncelleme |
|---|---|---|---|---|---|
| REC-43 | Todo | KVKK: hesap silme/anonimleştirme + veri sahibi talep akışı | URUN | Medium | 2026-09-03 |
| REC-77 | Todo | applicationEmail + kepAddress hâlâ yer tutucu — kanal olmadan KVKK defteri ça… | OPS | Low | 2026-09-03 |

#### ▸ Bayi ve segment — 4 iş · Done 0 · %0
| ID | Durum | Başlık | Sorumlu etiket | Öncelik | Son güncelleme |
|---|---|---|---|---|---|
| REC-45 | Backlog | Teklif→Sipariş dönüşüm köprüsü | URUN | Medium | 2026-09-03 |
| REC-46 | Backlog | Bayi segment-atama ekranı | URUN | Medium | 2026-09-03 |
| REC-62 | Todo | ERP çalışma alanı + CRM nesne katmanı — cetveller yazılı, kod sıfır | OPS | High | 2026-09-03 |
| REC-88 | Todo | Açık kaynak CRM/ERP taraması + wacrm incelemesi — karar bekliyor | OPS | No priority | 2026-09-04 |

#### ▸ Satış kipi (şirket sonrası) — 9 iş · Done 2 · %22
| ID | Durum | Başlık | Sorumlu etiket | Öncelik | Son güncelleme |
|---|---|---|---|---|---|
| REC-47 | Todo | Kargo ücreti: sepet+checkout sabit "Ücretsiz" | URUN | High | 2026-09-03 |
| REC-48 | Todo | Fatura belgesi üretilmiyor (e-arşiv taahhüdü açıkta) | URUN | High | 2026-09-03 |
| REC-49 | Backlog | Admin UX elden geçirme — kalan fazlar | URUN | Medium | 2026-09-03 |
| REC-55 | Todo | Satınalma modülü — v1 tamam, karne + v2 kalemleri açık | OPS | Medium | 2026-09-03 |
| REC-57 | Todo | LANSMAN ENGELİ: iyzico-refund müşteri self-iadesi | URUN | Urgent | 2026-09-03 |
| REC-73 | Todo | Ödeme & Finans açık işleri (registry taşıması) | OPS | No priority | 2026-09-03 |
| REC-75 | In Progress | ERP & Admin açık işleri (registry taşıması) | OPS | No priority | 2026-09-03 |

#### ▸ (kilometre taşı yok) — 4 iş · Done 0 · %0
| ID | Durum | Başlık | Sorumlu etiket | Öncelik | Son güncelleme |
|---|---|---|---|---|---|
| REC-143 | Backlog | Teklif kalemine seçim kaynağı (tür · girdiler · dayanak) kolonu + quote_no'nu… | — | Medium | 2026-09-05 |
| REC-154 | In Progress | E-posta şablonu kod tarafı: sipariş no biçimi e-postada kırpık (#000318 ≠ 202… | URUN | Medium | 2026-09-06 |
| REC-156 | In Progress | Sipariş numarası saatten değil günlük sayaçtan üretilsin — generate_order_num… | URUN | High | 2026-09-06 |
| REC-159 | Backlog | İade şeması dar: venthub_returns'e kalem tablosu + refund_amount + return_no … | URUN | Medium | 2026-09-06 |

### Katalog ve Ürün Verisi — 20 iş · Done 1 · %5 bitti

#### ▸ Vortice tam — 1 iş · Done 1 · %100
_Açık iş yok._

#### ▸ İkinci çıkarım turu — SEAT, Nicotra, AVenS — 7 iş · Done 0 · %0
| ID | Durum | Başlık | Sorumlu etiket | Öncelik | Son güncelleme |
|---|---|---|---|---|---|
| REC-56 | In Progress | Ürün-katalog hattı — cetveller indi, içerik/derinlik işleri açık | OPS | High | 2026-09-03 |
| REC-60 | Todo | Kapsama: ~210 eksik kod + sürekli sayım kapısı | URUN | High | 2026-09-03 |
| REC-109 | Todo | 16 ailenin EN adı eksik/sahte (9 hiç yok + 7 en==tr) — çeviri üretimi + Recep… | URUN | High | 2026-09-03 |
| REC-122 | Todo | EN marka şeridinde "Frekans Konvertörü" marka olarak listeleniyor + 6 marka 3… | URUN | No priority | 2026-09-06 |
| REC-124 | In Progress | Katalog veri kusurları paketi: "Frenkans"/"Inventoru" yazımları CANLIDA + DAN… | URUN | No priority | 2026-09-04 |
| REC-135 | In Progress | Kategori ağacı boşlukları: 10 dalsız ürün + 7 boş alt dal (365/375 zaten dalı… | URUN | High | 2026-09-05 |
| REC-136 | In Progress | Katalog sayımı TEK KAYNAK: sitenin okuduğu yolla sayan betik + günlük tablo; … | URUN | High | 2026-09-06 |

#### ▸ Görsel tamamlama — 3 iş · Done 0 · %0
| ID | Durum | Başlık | Sorumlu etiket | Öncelik | Son güncelleme |
|---|---|---|---|---|---|
| REC-44 | Todo | Ürün görseli edinme hattı — 35 ürün kaldı (339/374 tamam) | URUN | High | 2026-09-03 |
| REC-91 | Todo | Görsel hattı gerçek çözümü: ön-üretilmiş boyutlar + bağımsız yedek yol (402 k… | URUN | High | 2026-09-03 |
| REC-96 | Backlog | ADMIN: depo adresi elle kurulan iki kopya — kategori-görsel tek-kaynak deseni… | URUN | Low | 2026-09-03 |

#### ▸ (kilometre taşı yok) — 9 iş · Done 0 · %0
| ID | Durum | Başlık | Sorumlu etiket | Öncelik | Son güncelleme |
|---|---|---|---|---|---|
| REC-139 | Backlog | Katalog metin hijyeni ingest kapısı: aynı sınıf kusur temizlenip GERİ GELİYOR… | URUN | Low | 2026-09-04 |
| REC-145 | Backlog | Belge deposu: ürün/aile teknik belgeleri (katalog PDF · veri sayfası · kılavu… | — | High | 2026-09-06 |
| REC-146 | In Progress | İçerik hattı: 40 aile anlatımı + yapısal altı blok (Gövde·Çark·Motor·Koruma·K… | — | Medium | 2026-09-06 |
| REC-155 | In Progress | CANLI: 126/375 ürün sayfasında "Ürün Açıklaması" altında iç kademe notu görün… | URUN | Urgent | 2026-09-05 |
| REC-157 | In Progress | Konformans kapısı: aile açıklamasındaki sayısal değer, ailenin ürünlerinden t… | URUN | High | 2026-09-06 |
| REC-161 | In Progress | Kategori açıklaması i18n yolu: metadata.description_i18n {tr,en} + getCategor… | URUN | High | 2026-09-06 |
| REC-163 | In Progress | KAYNAK DİZİNİ: tedarikçi PDF'leri bir kez, deterministik, sayfa+tablo düzeyin… | URUN | Urgent | 2026-09-06 |
| REC-164 | Backlog | Aile sayfasında altı yapısal blok (Gövde · Çark · Motor · Koruma · Kontrol · … | URUN | High | 2026-09-06 |
| REC-166 | Backlog | Admin kategori formu description_i18n {tr,en} yazamıyor — kategori paragrafla… | — | Low | 2026-09-06 |

### SEO ve Yayın — 6 iş · Done 3 · %60 bitti

#### ▸ Bing kökü ve hreflang — 6 iş · Done 3 · %60
| ID | Durum | Başlık | Sorumlu etiket | Öncelik | Son güncelleme |
|---|---|---|---|---|---|
| REC-50 | Todo | venthub.com.tr DNS + kanonik SITE_URL | Recep kapısı, OPS | High | 2026-09-03 |
| REC-105 | Canceled | Sitemap /tr/destek ve /en/destek ilan ediyor — ikisi de canlıda 404 | URUN | Medium | 2026-09-03 |
| REC-127 | In Progress | Bing kökü dizinleyemiyor: / → /tr 307 GEÇİCİ yönlendirme + hreflang x-default… | URUN | High | 2026-09-03 |

### Marka Kılavuzu (DESIGN-MARKA) — 2 iş · Done 0 · %0 bitti

#### ▸ (kilometre taşı yok) — 2 iş · Done 0 · %0
| ID | Durum | Başlık | Sorumlu etiket | Öncelik | Son güncelleme |
|---|---|---|---|---|---|
| REC-149 | Backlog | Projeler arası tasarım ayarı eşitleme — VentHub design system olarak üretilsi… | OPS, DESIGN | High | 2026-09-06 |
| REC-151 | Backlog | Sorular — DESIGN-MARKA (sürekli açık soru/öneri kaydı) | DESIGN, OPS | No priority | 2026-09-05 |

### Kurumsal Belgeler (DESIGN-BELGE) — 1 iş · Done 0 · %0 bitti

#### ▸ (kilometre taşı yok) — 1 iş · Done 0 · %0
| ID | Durum | Başlık | Sorumlu etiket | Öncelik | Son güncelleme |
|---|---|---|---|---|---|
| REC-153 | Backlog | Sorular — DESIGN-BELGE (sürekli açık soru/öneri kaydı) | DESIGN, OPS | No priority | 2026-09-06 |

### Q-Validator — 28 iş · Done 20 · %71 bitti

#### ▸ P01-Data-Foundation — 5 iş · Done 5 · %100
_Açık iş yok._

#### ▸ (kilometre taşı yok) — 23 iş · Done 15 · %65
| ID | Durum | Başlık | Sorumlu etiket | Öncelik | Son güncelleme |
|---|---|---|---|---|---|
| REC-19 | Backlog | 001: Hypothesis Engine Scoring API | P03-API | No priority | 2026-03-28 |
| REC-20 | Backlog | 002: Root Profiler API | P03-API | No priority | 2026-03-28 |
| REC-21 | Backlog | 003: Hypothesis Test API | P03-API | No priority | 2026-03-28 |
| REC-23 | Backlog | 004: Populate Technical Function Flags | P01-Data | Medium | 2026-03-29 |
| REC-28 | Backlog | Implement Remaining 5 Constraint Engines (Phase 1 / V1) | — | No priority | 2026-03-31 |
| REC-29 | Backlog | Enforce Principle 4: Semantic Void and Randomness Check (Opposition Constraint) | — | No priority | 2026-03-31 |
| REC-30 | Backlog | Research & Implement Adaptive Alpha (Distance Decay) for Higher Orbits | — | No priority | 2026-03-31 |
| REC-31 | Backlog | Topological Network Visualization (API & Next.js Bridge) | — | No priority | 2026-03-31 |

### (projesiz) — 6 iş · Done 0 · %0 bitti

#### ▸ (kilometre taşı yok) — 6 iş · Done 0 · %0
| ID | Durum | Başlık | Sorumlu etiket | Öncelik | Son güncelleme |
|---|---|---|---|---|---|
| REC-1 | Todo | Get familiar with Linear | — | No priority | 2026-03-11 |
| REC-2 | Todo | Set up your teams | — | No priority | 2026-03-11 |
| REC-3 | Todo | Connect your tools | — | No priority | 2026-03-11 |
| REC-4 | Todo | Import your data | — | No priority | 2026-03-11 |
| REC-33 | Backlog | P07-Enterprise-Search: Faz 0 - Envanter ve Zemin Etüdü | — | No priority | 2026-04-05 |
| REC-140 | Backlog | (ALTYAPI) anon rolüne tablo düzeyinde yazma GRANT'ları — derinlik savunması y… | — | Medium | 2026-09-06 |

### §3b Tamamlanan işler (Done) — proje › kilometre taşı

- **Altyapı, Kapılar ve Belge Hattı › Kapı kör kolları:** REC-118 (2026-09-05), REC-131 (2026-09-06), REC-134 (2026-09-06)
- **Altyapı, Kapılar ve Belge Hattı › Belge hattı:** REC-41 (2026-08-25), REC-66 (2026-08-25), REC-68 (2026-08-25), REC-83 (2026-08-28)
- **Altyapı, Kapılar ve Belge Hattı › Orion köprüsü ve filo mekanizması:** REC-34 (2026-08-27), REC-35 (2026-08-27), REC-37 (2026-08-27), REC-38 (2026-08-27), REC-42 (2026-08-26), REC-53 (2026-08-26), REC-63 (2026-08-24), REC-87 (2026-08-30)
- **Vitrin 15A Yeniden Tasarım (DESIGN-MENU) › Faz 1 — Kabuk:** REC-104 (2026-09-01)
- **Vitrin 15A Yeniden Tasarım (DESIGN-MENU) › Faz 2 — Ana Sayfa, Menü ve Adresler:** REC-79 (2026-08-27), REC-80 (2026-08-27), REC-81 (2026-08-26), REC-85 (2026-08-28), REC-98 (2026-09-02), REC-101 (2026-08-31), REC-103 (2026-09-01), REC-108 (2026-09-01), REC-110 (2026-09-02), REC-113 (2026-09-01), REC-114 (2026-09-01), REC-115 (2026-09-02)
- **Vitrin 15A Yeniden Tasarım (DESIGN-MENU) › Faz 3 — Ürün Sayfası ve Kartlar:** REC-97 (2026-09-02)
- **Teklif Akışı ve Müşteri Paneli › Teklif kipi:** REC-54 (2026-08-28)
- **Teklif Akışı ve Müşteri Paneli › Proje ve panel:** REC-112 (2026-09-01)
- **Teklif Akışı ve Müşteri Paneli › Satış kipi (şirket sonrası):** REC-36 (2026-08-27), REC-40 (2026-08-27)
- **Katalog ve Ürün Verisi › Vortice tam:** REC-39 (2026-08-27)
- **SEO ve Yayın › Bing kökü ve hreflang:** REC-90 (2026-08-30), REC-100 (2026-08-31), REC-111 (2026-09-01)
- **Q-Validator › P01-Data-Foundation:** REC-5 (2026-03-27), REC-6 (2026-03-27), REC-7 (2026-03-27), REC-8 (2026-03-27), REC-9 (2026-03-27)
- **Q-Validator › (kilometre taşı yok):** REC-10 (2026-03-28), REC-11 (2026-03-28), REC-12 (2026-03-28), REC-13 (2026-03-28), REC-14 (2026-03-28), REC-15 (2026-03-28), REC-16 (2026-03-28), REC-17 (2026-03-28), REC-18 (2026-03-28), REC-22 (2026-03-29), REC-24 (2026-03-29), REC-25 (2026-03-28), REC-26 (2026-03-31), REC-27 (2026-03-31), REC-32 (2026-03-31)

## §4 BAYAT AÇIK İŞLER (7 günden eski güncelleme)

Ölçüt: statusType ∈ {started, unstarted} (In Progress/In Review/Todo) **ve** updatedAt < 2026-08-30T11:46:36Z (damga − 7 gün). Backlog bu ölçütün dışında (statusType=backlog).
Sayı: **4** / 74 açık iş.

| ID | Durum | Başlık | Proje | Etiket | Son güncelleme | Yaş (gün) |
|---|---|---|---|---|---|---:|
| REC-1 | Todo | Get familiar with Linear | — | — | 2026-03-11 | 179 |
| REC-2 | Todo | Set up your teams | — | — | 2026-03-11 | 179 |
| REC-3 | Todo | Connect your tools | — | — | 2026-03-11 | 179 |
| REC-4 | Todo | Import your data | — | — | 2026-03-11 | 179 |

## §5 Ölçüm satırı

- MCP çağrı sayısı: **3** (`list_issues` ×1 — limit 250, includeArchived=false, durum filtresi yok, `hasNextPage=false` → sayfalama gerekmedi; `list_projects` ×1 — 10 proje, kilometre taşları dahil; `list_issue_statuses` ×1 — 7 durum: Backlog/Todo/In Progress/In Review/Done/Canceled/Duplicate).
- Toplam kayıt: **167** iş · **9** proje kovası (Linear'da 10 proje kaydı var; ikisi aynı adla 'Q-Validator', biri boş; 6 iş projesiz).
- Alan eksikleri (MCP döndürmedi = null): assignee 99/167 boş · projectMilestone 57/167 boş · project 6/167 boş · label 26/167 boş.
- Not: 'In Review' durumu da statusType=started sayıldığından 'In Progress/Review' sütununda birleşik; bu dışa aktarımda In Review'da iş sayısı: 0.

