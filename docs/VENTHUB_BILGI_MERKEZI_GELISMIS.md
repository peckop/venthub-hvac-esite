# VentHub Bilgi ve Kılavuz Merkezi — Gelişmiş Mimari ve Hesaplayıcı Planı (EU/US Referanslı)

Amaç
- Kullanıcıyı (tüketici + teknik) kafasında soru bırakmadan doğru ürüne yönlendirmek.
- Bilimsel gerçekliğe uygun, sahada kullanılan “ön-boyutlandırma (v1)” + “mühendislik (v2)” hesaplayıcıları.
- VentHub e‑ticaret mimarisi (bkz. WARP.md) ile tam uyum: bilgi → hesapla/seç → filtreli ürün listesi → ürün → teklif.

1) Bilgi Mimarisi (hub‑and‑spoke)
- Hub: /destek/merkez
  - Özet kartlar (Hava Perdesi, Jet Fan, HRV) → konu sayfaları
  - E‑ticaret SSS kısaltmaları, İndirme Merkezi, Sözlük (ileride)
- Konu sayfaları: /destek/konular/{slug}
  - Şablon: Kısa cevap (tüketici), 3 adımda seçim, teknik özet (mühendis), örnek senaryo, mikro SSS, Çift CTA
- Hesaplayıcılar: /destek/hesaplayicilar/{slug} (v1→v2 evrimi)
- Ürün Seçici (wizard): /destek/secici (v2)
- E‑ticaret SSS: /destek/sss
- İndirme Merkezi & Sözlük: /destek/indir, /destek/sozluk (v3)

2) Bölge Profili ve Standart Eşleşmesi
- Profil seçimi: EU / US (kullanıcı seçimi veya geoloc) → varsayılan katsayılar ve sınırlar o profile göre gelir.
- EU/UK başlıca referanslar
  - EN 16798‑1 (IAQ/OA debileri), EN 308 (HRV eşanjör test), EN 13053 (AHU), ISO 12759 (FEI/enerji), EN ISO 5801 (fan test), ISO 5136 (ses), ISO 27327 (air curtain), BS 7346‑7 (otopark jet fan), EN 12101 (duman).
- US başlıca referanslar
  - ASHRAE 62.1 (OA), AHRI 1060 + ANSI/ASHRAE 84 (ERV/HRV derecelendirme/test), AMCA 210/ASHRAE 51 (fan), ANSI/AMCA 208 (FEI), AMCA 300 (ses), NFPA 88A/92 (otopark/duman), AMCA 220 (air curtain).

3) Hesaplayıcılar (v1 → v2)
3.1 HRV/ERV — Debi ve Isı Geri Kazanımı
- v1 (ön‑boyutlandırma)
  - Girdiler: Kişi sayısı/alan, kişi başı OA (25–40 m³/h·kişi), T_dış/T_iç, verim η (%), SFP, HSP hedef.
  - Çıktılar:
    - Debi Q [m³/h]; ısı geri kazanım Q_th [kW] ≈ η · ρ · c_p · (Q[m³/s]) · ΔT / 1000
    - Tahmini elektrik P_el ≈ SFP · Q[l/s]
  - Standart notu: EU→EN 16798‑1, EN 308; US→ASHRAE 62.1, AHRI 1060/ASHRAE 84
  - Uyarı: “Ön boyutlandırmadır; proje doğrulaması gerekir.”
- v2 (mühendislik)
  - Psikrometri (kuru/yaş termometre, mutlak nem), duyulur/gizli ısı ayrıştırma
  - Eşanjör tipine göre etkinlik (ε‑NTU yaklaşımı, üretici verisi)
  - Akustik/filtre sınıfı etkisi (özet)
  - FEI/etiket kıyası (ISO 12759 / AMCA 208)

3.2 Hava Perdesi — Hız/Debi/Isıtma
- v1
  - Girdiler: W (genişlik), H (yükseklik), v_nozül hedef (7–9 m/s), zeminde 2–3 m/s hedef, ΔT (opsiyonel)
  - Çıktılar: Q ≈ v_nozül · W · a_nozül (nozül açıklığına göre), P_ısı ≈ ρ·c_p·Q·ΔT
  - Standart notu: EU→ISO 27327; US→AMCA 220
- v2
  - Kapı rüzgârı/termal çekiş etkisi için güvenlik katsayısı
  - Giriş holü/döner kapı özel durumları
  - Enerji karşılaştırması (kapı açık/kapı+perde)

3.3 Jet Fan — Otopark Ön‑Boyutlandırma (Debi ve Yerleşim)
- v1
  - Girdiler: L×W×H, V, ACH hedef (6–10 tipik), egzoz/temiz hava noktaları
  - Çıktılar: Q_total = V · ACH, zon/aks önerisi, fan adedi yaklaşımı (kapsama esası), sensör örnek yerleşimi
  - Standart notu: EU/UK→BS 7346‑7, EN 12101; US→NFPA 88A, NFPA 92
- v2
  - Fan eğrisi + sistem eğrisi kesişimi (Δp = k·Q²), itme kuvveti (N) → üretici eğrisi
  - Yangın senaryosunda yön/sürükleme kontrolü, BMS entegrasyonu

3.4 Kanal — Hız ve Tahmini Basınç Kaybı
- v1
  - Girdiler: Q (m³/h), kanal tipi/ebadı/uzunluğu, hedef hız aralığı
  - Çıktılar: v = Q/A; Δp ≈ f · (L/D) · (ρ·v²/2) + yerel kayıplar (muhafazakâr katsayılı)
  - Standart notu: ASHRAE Fundamentals / CIBSE rehberleri (yaklaşım)
- v2
  - Friction factor (Moody), fitting K değerleri; sistem eğrisi k katsayısı çıkarımı
  - Gürültü/akustik özet

3.5 (v2) Fan Eğrisi Motoru
- Girdi: Üretici CSV/JSON (Q–Δp–η–P), hız/kademeler
- Sistem eğrisi: Δp = k·Q² (tasarım noktasından k), hız değişimlerinde fan affinities (Q∝N, Δp∝N², P∝N³)
- Kesişim çözümü: bisection/newton; çıktı: Q, Δp, η, P, uyarılar (NPSH/akustik)
- Standart notu: EN ISO 5801/AMCA 210 (test), ISO 12759/AMCA 208 (FEI)

4) Arayüz (React) ve Deneyim
- Her hesaplayıcı: “Hızlı” (tüketici) / “Gelişmiş” (teknik) sekmeleri
- Sonuç kartı: birimler net, kısa formül görünümü, “Standart referansı” (2–3 madde), “Ürünleri göster” (filtreli URL), “Teklif Al”
- Paylaşılabilir link (girdiler querystring); i18n (TR/EN); erişilebilirlik; analytics (calc_start, calc_result, to_products, to_quote)
- Görsel/etkileşim: hafif motion (framer‑motion), reduced‑motion’a saygı; hesap sonuçlarına “öneri çipi” (ör. “HRV 400–600 m³/h”)

5) E‑ticaret ile Eşleme (WARP.md uyumu)
- Ürün listesi filtre eşlemeleri (örnek)
  - HRV: airflow_min≤Q≤airflow_max, recovery_type, efficiency_class, HSP
  - Hava Perdesi: width≈W, heating=none/electrical/water, nozzle_velocity class
  - Jet Fan: thrust≥N, reversible=true/false, voltage, protection
  - Kanal fanı: airflow, Δp/HSP aralığı
- URL örneği: /products?application=jet-fan&thrust_min=50&reversible=true
- CTA her zaman çift: “İlgili ürünlere git” ve “Teklif Al”
- Uygulama: PDP ve Kategori sayfalarında konuya bağlanan “İlgili Rehber” linkleri canlıdır (slug eşleme ile).

6) Birimler ve Varsayımlar
- ρ=1.2 kg/m³, c_p=1.005 kJ/kg·K (varsayılan); profil ve psikrometri ile güncellenebilir
- ΔT, ACH, verim aralıkları profil ve konuya göre hazır setlerden seçilir
- Tüm hesaplayıcıların altında “Varsayımlar ve sınırlar” kısa bloğu

7) Kabul Kriterleri (v1)
- Hesap girdileri validasyonlu (boş/negatif yok, aralık ipuçları)
- EU/US profili değiştiğinde varsayılanlar güncellenir; sonuç farkı anlaşılır
- Sonuçtan ürün listesine geçişte doğru filtre uygulanır (en az 1 isabet kontrolü)
- Standart referansları görünür (2–3 madde), dipnotta “ön boyutlandırma” uyarısı
- Analytics event’leri tetiklenir; link paylaşımı girdileri geri yükler

8) Yol Haritası
- Sprint 1: Hub + 3 konu sayfası (Hava Perdesi, Jet Fan, HRV) + v1 hesaplayıcılar + ürün filtre eşlemeleri
- Sprint 2: Ürün Seçici (wizard) + konu sayfalarına bağlama
- Sprint 3: Fan Eğrisi Motoru (v2) + sistem eğrisi + kesişim + FEI görünümü
- Sprint 4: İndirme Merkezi, Sözlük, ek konu sayfaları

9) Risk ve Azaltım
- Aşırı basitleştirme → v2 ile derinleştirme; hesaplayıcı altında varsayım şeffaflığı
- Ürün datası eksikliği → minimum alan seti ile filtre (airflow, thrust, type), eksiklerde “yakın eşleşme” etiketi
- Mobil deneyim → tek sütun, sticky sonuç kartı, input ipuçları

10) Kısa Referans Listesi
- EU/UK: EN 16798‑1, EN 308, EN 13053, EN ISO 5801, ISO 12759, ISO 5136, ISO 27327, BS 7346‑7, EN 12101
- US: ASHRAE 62.1, AHRI 1060, ANSI/ASHRAE 84, AMCA 210/ASHRAE 51, ANSI/AMCA 208, AMCA 300, NFPA 88A/92, AMCA 220

