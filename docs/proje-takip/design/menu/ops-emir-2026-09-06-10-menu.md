
# OPS EMRİ → DESIGN-MENU · 2026-09-06 · #10 · YENİ SOHBETİN TEK PAKETİ (K37 dinamik yöntem + U1/U2/U3 kayda girdi; API adımı YOK; #8 kapandı)

DEVIR.md okundu (§3b Recep yöntem kararı, U1–U3, D5). Eksik olan kayıt tamamlandı: **Kararlar 15A K37**. Bu emir #7 madde 1'in ve #9'un yerine geçen TEK paket; yeni sohbet buradan başlar.

## K37 · Yöntem: dinamik, statik değil (Recep 2026-09-06: "statik istemiyorum, dinamik istiyorum ki doğru şekilde analiz edebileyim")
Tasarım kararı çalıştırılarak verilir. Ürün Seçici A+C **çalışan prototip**; emir #7'nin bütün kuralları geçerli (kanonik girdi · kip anahtarı · üç hâlli grup sekmesi · K18a).

## Paket sırası (tek sohbet, tek teslim)
1. **Gerçek veri JSON** — `secim-veri-2026-09-06.json`: damga + üreten SQL dosya başında; uydurma sayı 0; her sayı `technical_specs`. (Kanal fanı ailesi + eğrili ürünler.)
2. **Kural motoru** — `secim-kurallari.json` TEK KAYNAK (kod tarafı aynı dosyadan uygular; kural HTML içine gömülmez). "Değerlendirilemedi" gizlenmez.
3. **Prototip** — mahal · alan · yükseklik · kişi · devir → gerçek eğriden hüküm; A ve C aynı sonuç bölgesi; `is_interactive`.
4. **Oturum kaydı** — localStorage: adım · dokunuş · vazgeçme; "kopyala" düğmesiyle notlara. `Ürün Seçici Karşılaştırma`'daki "A 6–7 · C 7–11" tahminleri bununla ölçüme döner.
5. **D5 tweak anahtarları** v17'ye: kip (teklif ↔ satış) · Hesap girişli/girişsiz · hareket.
**Claude API adımı YOK** (DEVIR §3b adım 4 SİLİNİR): Recep + OPS hemfikir; kare dış ağa çıkamaz, anahtar proje dosyasına giremez. C kipinin serbest metni: 10 örnek cümle → kanonik girdi EŞLEME TABLOSU (json), deterministik.

## Recep'in UI iyileştirmeleri — artık KAYITTA (K37-a), aynı sohbette, prototipten sonra
- **U1 · Ekran 11 karşılaştırma "farkı göster":** aynı satırlar katlanır, seçili model sabitlenir (sticky sütun). Ölçüm: fark satırı sayısı / toplam satır.
- **U2 · Bilgi Merkezi (ekran 14) iç tasarımı:** içindekiler · arama · ilgili makale · ürün bağı. Kaynak metin REC-146 aile anlatımı + mevcut bilgi merkezi rotaları; uydurma makale başlığı yok.
- **U3 · Ekran 58: panel mi kalıcı sütun mu** — Menü ÖNERİR (iki hâli tweak anahtarıyla tek karede), karar Recep'in (yapısal, tek başına sorulur); Kararlar'a Recep "karar" deyince girer.

## Kapananlar
- **Emir #8 KAPANDI:** yetenek envanteri zaten `kabuk-v2-notlar.md` "Yetenekler" bölümünde (19 yetenek, kullanım 0/19); ayrıca yazılmaz.
- Emir #7 madde 2 (hikâye sayfası v17'ye) ve madde 3 (6 ekran) bu paketten SONRA, statik.

## Ölçüm satırları (teslimde sayıyla)
uydurma sayı 0 · kural dosyası 1 · veri dosyasında damga+sorgu var · A ve C aynı sonuç bölgesi · "değerlendirilemedi" görünür · oturum kaydı alanları 3 · tweak anahtarı 3 · U1 fark satırı sayısı · U2 dört blok var · U3 iki hâl tek karede · ham hex 0 · kontrast ihlali (ölçülen kümede) 0.

Teslim: dosyalar → DEVIR.md güncelle → Vitrin 15A yorumu tam metin → `ready_for_verification`.

— OPS · 2026-09-06

