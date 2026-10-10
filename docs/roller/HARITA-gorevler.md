# DÜZENLİ GÖREVLER: HARITA

> Üretilmiştir (`scripts/belge/rol-karti-uret.cjs`, veri: `scripts/belge/rol-gorevleri.json`); elle düzenleme. Yöneten cetvel: `docs/standards/duzenli-gorevler-standard.md`. Rol kartı: `docs/roller/HARITA.md`.

## Amaç
Belge ve hafıza düzenini güncel, bulunabilir ve tutarlı tutar; bayat belge, kırık yol ya da cetvelsiz iş yüzünden bir ekibin yanlış bilgiyle çalışması önce mesaj satırında, sonra kartta görünür.

## Görevler
| Görev | Sıklık | Tetik | Bağlı mı | Çıktı | Eşik |
|---|---|---|---|---|---|
| Belge tazelik ölçümü: çekirdek belge yaşı (CLAUDE.md, docs/README.md), bu iki belgedeki kırık yol, kod haritası yaşı ve hafıza indeksi (MEMORY.md) boyutu (`scripts/belge/belge-tazelik.cjs`) | olay | istem satırı tazelik: .claude/hooks/belge-satiri.cjs her mesajda önbelleği okur, 6 saatten eskiyse ölçümü arka planda başlatır ve eşik aşılınca ⚠BELGE satırını basar (REC-400 D2; kanca kurulumu ARAÇ'ın) | evet | ⚠BELGE satırı her mesajda (eşik üstündeyse); bayat ya da kırık belge için HARİTA kartı | Çekirdek belge 14 gün, kod haritası 7 gün, kırık yol 1, hafıza indeksi 160 satır ya da 20.000 bayt (yumuşak), önbellek 24 saat (belge-yonetimi-standard.md eşik tablosu) |
| Rol kartları, kurallar dosyaları ve açılış özetinin üreticiyle birebir kalması ve bayt sınırlarının aşılmaması (`scripts/belge/rol-karti-uret.cjs`) | olay | Actions: scripts/ci/test-haritasi.json haritasıyla ci iş akışının Test adımı (.github/workflows/ci.yml) değişen dosyaya göre src/__tests__/conformance/rol-kartlari.test.ts'i seçer; test üreticiyi --kontrol ile koşar (INV-ROL-1) | evet | Kırmızı ci (PR birleşmez); düzeltmeyi HARİTA yapar | Üretici --kontrol çıkış 0; en büyük kart 6.255 bayt ya da altı (sert sınır 6.656); açılış özeti 2.048 bayt ya da altı; hiçbir kural kayıp değil (INV-ROL-1) |
| Kart plan kapısı: yeni kartın planı (amaç, önceki çalışma, adımlar, sor-noktaları) eksiksiz mi (`scripts/belge/kart-plan-kapisi.cjs`) | olay | kart kapısı: Kart açılırken ya da Review'a geçerken kendiliğinden çağıran bağ yok: kapı yalnız elle (kart sahibi) ve conformance testinde koşuyor (HARİTA ölçümü 10-09: iş akışı, kanca ve scripts/board içinde çağrı yok); kanca altyapısı gerekirse ARAÇ'ın | hayır (kuracak: HARITA) | Eksik alanların listesi kart sahibine; kurulunca planı eksik kart Review'a geçmez | GEÇTİ: plan iskeleti eksiksiz (docs/standards/kart-plani-standard.md) |

3 görev, tetiğe bağlı 2. Tetiğin kurulmasını bekleyen: HARITA 1.
