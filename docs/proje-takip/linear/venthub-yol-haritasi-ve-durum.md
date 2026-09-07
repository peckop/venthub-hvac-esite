# VentHub Yol Haritası ve Durum — AYNA (Linear belgesinin dışa aktarımı · 2026-09-06)

<!-- kaynak_id: 1e98e689-67a4-4527-b4ce-14221872780d · kaynak_updatedAt: 2026-09-06T11:19:25.963Z · kopya: 2026-09-06T14:30Z -->
<!-- Tazelik yalnız yukarıdaki damgayla ölçülür. Tek kopya: yol-haritasi-durum.md deftere gider, bu dosya gitmez (aynı içerik; YH-47 kanıtı). -->

> SSOT: docs/proje-takip/yol-haritasi.json → yol-haritasi-durum.md. Bu dosya Linear'daki AYNA belgesinin kopyasıdır; Linear ile repo çelişirse repo kazanır.

# VentHub Yol Haritası ve Durum — AYNA

**Bu belge üretilmiş bir aynadır; elle düzenlenmez.** Kaynak: repo `docs/proje-takip/yol-haritasi.json` → üretilen `docs/proje-takip/yol-haritasi-durum.md` (`scripts/nlm/yol_haritasi_dogrula.py`). OPS gün kapanışı ritüelinde yeniler; damga aşağıda. Çelişirse repo dosyası kazanır. Renk KANITTAN türer: YEŞİL = kanıtlar bekleneni verdi · KIRMIZI = belge çelişkisi ya da karar değişti · KANITSIZ = borç · YEŞİL* = bir kısmı ölçülemedi. "durum" sütunu beyandır, renk beyanın kanıtıdır.

**Damga:** 2026-09-06T11:18:38Z · Satır 37/40 · YEŞİL 33 · KIRMIZI 3 · KANITSIZ 1 · ölçülmemiş kanıt 6 · canlı ÖLÇÜLMEDİ. (PR: ops/kapanis-2026-09-06, belge-only, Vercel kotası sonrası iner.)
**KIRMIZI 3 = bilinçli borç, gizlenmez:** YH-46 Kaynak Dizini cetvelde anılmıyor (Katalog, [REC-163](https://linear.app/receps-workspace/issue/REC-163/kaynak-dizini-tedarikci-pdfleri-bir-kez-deterministik-sayfatablo) artım 0) · YH-47 gün kapanışı tek komut henüz yok (OPS) · ayna dosyası repo'da yok. Yeşillenince bu satır değişir.

## Bugün eklenen satırlar (2026-09-06 akşam)

| id | renk | durum | yetenek | sorumlu | karar |
| -- | -- | -- | -- | -- | -- |
| YH-23 | YEŞİL | YAPILIYOR | Ürün Seçici A+C çalışan prototip (dinamik yöntem); gerçek veri JSON + kural dosyası tek kaynak + oturum kaydı; Claude API adımı YOK | DESIGN-MENU → URUN | K37 · K18 · K18-c |
| YH-24 | YEŞİL | PLANLI | Recep UI iyileştirmeleri: ekran 11 farkı göster · Bilgi Merkezi iç tasarımı · ekran 58 panel/sütun (karar Recep) | DESIGN-MENU · Recep | K37-a |
| YH-07 | YEŞİL | YAPILIYOR | Kartvizit yapılır; keşif raporu v1 kabul, 7 alan şema bekler (site_surveys); rapor kabuğu ikinci raporla | DESIGN-BELGE · OPS · Recep | K17-a · K17-b |
| YH-34 | YEŞİL | AÇIK | AVenS: kaynağı olmayan aileye satılabilir sayfa yazılmaz; sulu batarya yazılır; elektrikli ısıtıcı aksesuar | URUN-KATALOG | K7.10 |
| YH-46 | KIRMIZI | PLANLI | Kaynak Dizini cetvelde anılır (catalog-ingestion bölüm + CLAUDE.md + docs/README) | URUN-KATALOG | [REC-163](https://linear.app/receps-workspace/issue/REC-163/kaynak-dizini-tedarikci-pdfleri-bir-kez-deterministik-sayfatablo) |
| YH-47 | KIRMIZI | PLANLI | Gün kapanışı tek komut + açılış kapısı (damga >24 saat = KIRMIZI) | OPS | Recep 09-06 |

## 15A-F1

| id | renk | durum | yetenek | sorumlu | karar |
| -- | -- | -- | -- | -- | -- |
| YH-10 | YEŞİL | KAPALI-HAZIR | Yeni kabuk gezinmesi: header tek öğe Teklif + panel (#981 indi, bayrak kapalı, K16 önizleme) | URUN | K16 · [REC-129](https://linear.app/receps-workspace/issue/REC-129/kimlik-vitrin-yeniden-tasarimi-tek-dil-fazli-uretim-logopaletikon) |
| YH-11 | YEŞİL | KAPALI-HAZIR | Mobil alt sekme çubuğu 4 sekme; Design "Hesap" sekmesi önerisi Recep kararı bekliyor | URUN · Recep | K9 |
| YH-12 | YEŞİL | PLANLI | Mobil header: hesap sağ üst + akıllı dil çipi | URUN · Recep | K 09-04 16:50 |
| YH-13 | YEŞİL | KAPALI-HAZIR | 3D ürün görünümü müşteri yüzeyinde (teklif kipinde vaat edilmez) | URUN | K8 · [REC-94](https://linear.app/receps-workspace/issue/REC-94/ana-sayfa-yeniden-tasarimi-tam-kapsamli-tarama-tasarim-programi-faz-b) |
| YH-14 | YEŞİL | BEKLİYOR | Footer: marka logoları kalkar, "Markalar" metin bağlantısı kalır | DESIGN → URUN | K 09-04 |

## 15A-F2

| id | renk | durum | yetenek | sorumlu | karar |
| -- | -- | -- | -- | -- | -- |
| YH-15 | YEŞİL* | PLANLI | Kategori ağacı 7 kategori · 26 dal · Sığınak üst kategori · kısa slug (shelter-ventilation henüz level=1) | URUN | K3 |
| YH-16 | YEŞİL | PLANLI | Arama sonucu sayfası /tr/arama (ekran 08) | URUN | K14 |
| YH-17 | YEŞİL | YAPILIYOR | Ürün Seçici: tek sayfa A + rehberli C kabuğu, ilk kanal fanı; prototip = ölçüm aracı | DESIGN → URUN | K17 · K18 · K18-c |
| YH-19 | YEŞİL | PLANLI | Karşılaştırma sayfası /tr/karsilastir (ekran 11) | URUN | K10 |
| YH-21 | YEŞİL | PLANLI | Ürün Seçici girişi header'da kendi öğesi; /urun-secici tek giriş indi | DESIGN-MENU → URUN | K24 |
| YH-22 | YEŞİL | PLANLI | Renk tokenleri: turkuaz metin değil; cyan-ink + terracotta-deep; kod tarafı tokens.js'e girmedi | DESIGN-MARKA → URUN | K25 · K25-b · K26 |

## 15A-F3

| id | renk | durum | yetenek | sorumlu | karar |
| -- | -- | -- | -- | -- | -- |
| YH-18 | KANITSIZ | PLANLI | Liste sayfaları MATRİS görünümü (kart/tablo/seri) | URUN | K13 |

## GÜVENLİK

| id | renk | durum | yetenek | sorumlu | karar |
| -- | -- | -- | -- | -- | -- |
| YH-50 | YEŞİL | AÇIK | Design (15A) yalnız OKUR: Supabase SELECT, Linear'a tur sonu yorumu | OPS | K 09-04 13:45 |
| YH-51 | YEŞİL | AÇIK | Rol otoritesi user_profiles.role / app_metadata; raw_user_meta_data YASAK | ALTYAPI | auth-account A11 |

## KATALOG

| id | renk | durum | yetenek | sorumlu | karar |
| -- | -- | -- | -- | -- | -- |
| YH-20 | YEŞİL* | AÇIK | Katalog: 374 ürün / 32 aile / 5 marka prod'da; sayım tek kaynak betik | URUN | [REC-136](https://linear.app/receps-workspace/issue/REC-136/katalog-sayimi-tek-kaynak-sitenin-okudugu-yolla-sayan-betik-gunluk) |
| YH-32 | YEŞİL* | AÇIK | İç ingest notu müşteri yüzeyinde YOK: veri temizlendi + render muhafızı | URUN-KATALOG · URUN | K7 · [REC-155](https://linear.app/receps-workspace/issue/REC-155/canli-126375-urun-sayfasinda-urun-aciklamasi-altinda-ic-kademe-notu) |
| YH-33 | YEŞİL | PLANLI | Aile metnindeki sayı ailenin ürünlerinden türemiş ARALIK | URUN | K1 · K7.4 · [REC-157](https://linear.app/receps-workspace/issue/REC-157/konformans-kapisi-aile-aciklamasindaki-sayisal-deger-ailenin) |

## SÜREÇ

| id | renk | durum | yetenek | sorumlu | karar |
| -- | -- | -- | -- | -- | -- |
| YH-40 | YEŞİL | AÇIK | Migration içeren PR yalnız Recep onayıyla birleşir (merge = prod'a otomatik) | OPS | CLAUDE.md 13 |
| YH-41 | YEŞİL | AÇIK | İş takibi SSOT = Linear; registry salt arşiv | OPS | is-kayit-duzeni-standard |
| YH-42 | YEŞİL | AÇIK | Belgeler için kapı: hafıza sınavı (compact/resume dönüşü) | OPS | proje-takip-defteri-standard §5 |
| YH-43 | YEŞİL | AÇIK | Companion üretimi DONDURULDU; C4 bloklamaz | ALTYAPI | Kararlar-Altyapı K9 · [REC-142](https://linear.app/receps-workspace/issue/REC-142/companion-sistemi-uyku-kipi-tek-tasiyici-anahtari-tum-kapilar-say) |
| YH-44 | YEŞİL | AÇIK | Merge yalnız merge-ritueli.cjs --merge ile | ALTYAPI | fleet-mechanism §20.1-a |
| YH-45 | YEŞİL | YAPILIYOR | Gözcü yalnız Monitor; teslimat kanıtı başka oturumun jetonu + süre (09-06: kapı bağımsızlığı zorlayamıyor, yarın düzeltme) | ALTYAPI · OPS | Recep 09-06 |

## SaaS-F1 / SaaS-F2 (kiracı)

| id | renk | durum | yetenek | sorumlu | karar |
| -- | -- | -- | -- | -- | -- |
| YH-30 | YEŞİL | AÇIK | Çok kiracılı temel: tenant_id + RLS + tenantResolver (derleme anında sabit); kural 12 sürer | ALTYAPI | venthub_saas_master_roadmap · kural 12 |
| YH-31 | YEŞİL | PARK | White-label / kiracı ekle-çıkar / kiracıya göre tema; yeniden açılış Recep kararı | Recep | [REC-88](https://linear.app/receps-workspace/issue/REC-88/acik-kaynak-crmerp-taramasi-wacrm-incelemesi-karar-bekliyor) |
| — | — | BACKLOG | Lego + SSOT değerlendirmesi (şablon + veri ilkesi, SSOT-ihlal envanteri) — [REC-106](https://linear.app/receps-workspace/issue/REC-106/degerlendirme-sayfa-kompozisyon-mimarisi-lego-ssot-hedefine-mesafe-ve), 09-01'den beri başlamadı; 15A dışa aktarımı ve [REC-103](https://linear.app/receps-workspace/issue/REC-103/en-ana-sayfada-kategori-vitrini-tr-adlarla-kokten-cozum-ham-name)/104/105 kapanışına bağlı | OPS | [REC-106](https://linear.app/receps-workspace/issue/REC-106/degerlendirme-sayfa-kompozisyon-mimarisi-lego-ssot-hedefine-mesafe-ve) |

## TİCARİ

| id | renk | durum | yetenek | sorumlu | karar |
| -- | -- | -- | -- | -- | -- |
| YH-01 | YEŞİL | AÇIK | Teklif kipi: fiyat gizli, teklif akışı açık | Recep | K1 · K1a |
| YH-02 | YEŞİL | KAPALI-HAZIR | Satış kipi: sepet · ödeme · sipariş · fatura · iade · kargo — YOK değil KAPALI, tek anahtar | Recep (şirket kuruluşu) | K1a |
| YH-03 | YEŞİL* | PLANLI | Misafir teklif: üyelik zorunlu değil (anon INSERT RLS migration → Recep kapısı) | Teklif Akışı | [REC-117](https://linear.app/receps-workspace/issue/REC-117/misafir-teklif-akisi-teklif-icin-uyelik-zorunlulugu-kalkiyor-recep) |
| YH-04 | YEŞİL | PLANLI | Teklif listesi adresi /tr/teklif-listesi (/cart silinmez) | URUN | K 09-04 15:45 |
| YH-05 | YEŞİL* | AÇIK | Sipariş numarası günün sıra sayacı; #1032 indi, migration prod'da | URUN | [REC-156](https://linear.app/receps-workspace/issue/REC-156/siparis-numarasi-saatten-degil-gunluk-sayactan-uretilsin-generate) · kural 13 |
| YH-06 | YEŞİL | PLANLI | İade şeması: kalem/adet + refund_amount + return_no; satış kipi açılmadan; migration Recep | URUN · Recep | [REC-159](https://linear.app/receps-workspace/issue/REC-159/iade-semasi-dar-venthub-returnse-kalem-tablosu-refund-amount-return-no) · 153-7 |
