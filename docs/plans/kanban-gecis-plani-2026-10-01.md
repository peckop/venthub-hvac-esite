# Linear → Kanban geçişi: tarama ve değişiklik planı

> **Durum: ONAYLANDI (OPS, 2026-10-01); PR 1 yürütülüyor (Kanban kartı HRT-2).** Plan metni onay anındaki hâliyle korunur; sonradan gelen kararlar (karar 220 ön ek, kısa adlar) aşağıdaki NUMARA BİÇİMİ satırında ve §4'te işlenmiştir. Yöneten cetvel: `docs/standards/is-kayit-duzeni-standard.md` (sahibi OPS; §6.1 yeniden yazılır).
> **Dayanak:** karar 219 (Recep, 2026-10-01, aynen): "bugünden itibaren kanban wrongstack tam kapasite kullanıma geçiriliyor her yerdeki kuralları değiştir. şayet beğenirsek linear devre dışı".
> **OPS çerçevesi:** tüm iş takibi Kanban'da; Linear DONUK (yeni kayıt açılmaz, mevcutlar silinmez/arşivlenmez); deneme 1 hafta (10-08); numara = taşınan kart REC-nn'ini korur, yeni kart <DEPARTMAN>-<sayı>; PR gövdesi `Kanban: <numara>`; kart Done = tek komutluk kanıt; panolar: ortak "Bekleyenler" + departman başına.
> **YÖNTEM (kartta "elle + Haiku işçileri" yazıydı; SAPMA):** tarama `rg` ile elle yapıldı; arama deterministik ve sayılar kesin, işçi ajanı gerekmedi. Okuma bağımsız okuyucuyla PR öncesi yapılır.
> **Ölçüm tarihi:** 2026-10-01, master `5028c4f7d`. Sayılar `rg -c -i linear` çıktısıdır; sahte eşleşmeler aşağıda ayrıldı.
> **NUMARA BİÇİMİ (tek tanım, karar 220, Recep 2026-10-01 "evet"):** `<KISA AD>-<sayı>`; kısa ad departmanın sessiz harflerinden oluşur (Recep 10-01: "kod isimleri sessiz harflerden oluşsun, daha kısa olur"); sayaç pano başına; numara kartın doğduğu departmanda kalır, devredilince DEĞİŞMEZ; Linear'dan gelen kart `REC-nn`'ini korur. **Kısa ad tablosu yalnız `is-kayit-duzeni-standard.md` §1'dedir;** bu belge ve diğer cetveller tabloya atıf yapar, ön eki kopyalamaz. Kartlarım: HRT-1 (stil), HRT-2 (bu plan), HRT-3 (santiye betiği).
> **OPS KARARLARI (1-5, hepsi KABUL):** (1) Linear yalnız İŞ KAYDI için donuk; Design proje yorumları deneme boyunca açık, cetvele AÇIK İSTİSNA olarak yazılır. (2) `Fixes REC-nn` penceresi 10-08'e kadar. (3) Kararlar belgeleri dokunulmaz (karar defteri REC-554'te ayrı). (4) Hafıza dosyaları REC-538 ile. (5) PR şablonuna `Kanban:` satırı PR 1'e girer. PR 0 sırası ARAÇ'ın (#1598 → REC-554 → PR 0).

## 1. Sınıflandırma — Linear'ı anan her yer, 8 sınıf

| Sınıf | Ne | Dosyalar (satır) | Karar | Sahibi |
|---|---|---|---|---|
| **A. Üretici (tek nokta)** | Rol kartı üreticisi 15 kartı üretir; iki sabit cümle HEPSİNDE aynı | `scripts/belge/rol-karti-uret.cjs` 168, 172 (+ OPS 185-189, MARKA 259, I18N 304); çıktı `docs/roller/*.md` 15 kart × 2 satır (48, 52); test `rol-kartlari.test.ts:334` | DEĞİŞİR; üreticiyi düzelt, `--yaz` ile 15 kart yenilenir | HARİTA |
| **B. Cetveller** | İş durumu / emir / kayıt kuralını yazan belgeler | `CLAUDE.md` 65-72, 119, 127; `docs/README.md` 18, 21, 71, 85, 92; `is-kayit-duzeni-standard.md` 14, 28-33, 53, 75-113, 125-132, 175, 184; `work-tracking-ssot-standard.md` 1, 23-83; `fleet-mechanism-standard.md` 12, 78-105; `session-loop-ritual.md` 11, 14, 17; `belge-yonetimi-standard.md` 55; `pazar-olcum-standard.md` 44, 100-108; `proje-takip-defteri-standard.md` 17, 21, 47 (yalnız "iş durumu" cümleleri) | DEĞİŞİR | HARİTA (is-kayit-duzeni: OPS onaylar) |
| **C. Kapı (kod)** | PR gövdesinde kayıt arar, Linear'dan çeker, Linear'a arşivler | `.github/workflows/ci.yml` 123-136 + `scripts/board/pr-kayit-kapisi.cjs` (18) + `pr-kayit-kapisi.test.ts` (11) + `ci-pr-kayit-kapisi.test.ts`; `kartsiz-kayit.cjs` (10) + test; `linear-arsiv.cjs` (21) + `linear-arsiv.test.ts` (27) + `session-board.cjs` 138-145 | DEĞİŞİR / DURDURULUR (aşağıda) | ARAÇ |
| **D. Kanca metni** | SessionStart ve brifing metinleri | `session-board.cjs` 502-522 ("Emir = Linear kaydi"); `hafiza-sorusu-yonlendirme.cjs` 178, 205-208; `mechanism-setup.cjs` 9 | DEĞİŞİR | ARAÇ |
| **E. Design yüzeyi** | Claude Design kararlarını Linear PROJE yorumlarına yazar; sayaç kancası bunu okur | `board-brief.cjs` 88-129 (REC-329 sayacı) + `linear-yeni-yorum.cjs` (16) + `linear-okundu.cjs` (14) + `fleet-mechanism-integrity.test.ts` 246-278; `docs/proje-takip/design/*/CLAUDE.md` + `ops-iletisim-protokolu.md` (13 × 4 ağaç); `venthub-tasarim-dili/SKILL.md` (5, çift ağaç); MARKA kartı 259; `erisim-envanteri.md` 51 | **KARAR GEREK** (§4, madde 1) | OPS + ARAÇ |
| **F. Skill metni** | WrongStack skill'lerinde "Pano Linear'ın yanında pilottur" ve "mesaj yalnız ADRES (dosya/Linear)" | `wrongstack-kanban`, `multi-agent`, `verify-before-done`, `wrongstack-mailbox-mcp` (madde 6 ve 12); `sdd`, `qa` (1'er) — hepsi `.claude/skills` ve `.agent/skills` çift ağaçta | DEĞİŞİR (iki ağaç) | YETENEK |
| **G. Kullanıcı düzeyi** | Çıktı stili | `~/.claude/output-styles/recep.md` 7, 64, 68, 92 (No sütunu "Linear bağlantısı") | DEĞİŞİR, **Recep sözüyle** | stil kartı |
| **H. Veri/tarihçe** | Linear dışa aktarımları, gün kapanışı, üretilmiş master'lar, arşiv, çekici betikler | `docs/proje-takip/**` (is-dagilimi, kararlar-*, gun-kapanisi-*, state/manifest/yol-haritasi JSON), `docs/*_master.md`, `docs/archive/**`, `scripts/nlm/{gun_kapanisi,kararlar_disa_aktar,yol_haritasi_ayna,linear_disa_aktar,santiye}.py`, `karar-kayit-bagi.test.ts`, `defter-tazelik-satiri.cjs` | **DOKUNMA**: dondurulmuş veridir; "Kararlar" belgeleri Linear'da kalıyor (REC-554 dosyaya geçirene kadar) | — |
| *(Sahte eşleşme)* | "linear" = CSS gradyanı, grafik ölçeği ya da ürün adı | `src/index.css`, `tailwind.config.js`, `SalesChart.tsx`, `AdminInventoryReportPage.tsx`, `admin-standard.md` (⌘K örneği "Linear" ürünü), `admin-design-standard.md`, `scripts/seo/canli-kapi.mjs`, ui-ux CSV'leri | DOKUNMA | — |

Kapı testlerinin hepsi kodla birlikte değişir; "cetvel + kapı birlikte" kuralı (kural 14) geçerlidir.

## 2. Bugünkü cümle → yeni cümle (öne çıkan satırlar)

| Dosya:satır | Bugünkü | Yeni |
|---|---|---|
| `CLAUDE.md:65` | "Linear'da açılan her görevin açıklamasında zorunlu **KAYNAK/CETVEL bloğu** bulunur" | "Kanban'da açılan her kartın açıklamasında zorunlu **KAYNAK/CETVEL bloğu** bulunur (Linear 10-01'den beri donuktur, karar 219)" |
| `CLAUDE.md:119` | "iş durumu → Linear" | "iş durumu → Kanban; geçmiş karar → NotebookLM + Linear Kararlar (REC-554'e kadar)" |
| `docs/README.md:21` | "**Linear** (iş kaydının tek kaynağı)" | "**Kanban** (iş kaydının tek kaynağı; Linear donuk)" |
| `docs/README.md:92` | "İş durumu için tek kaynak **Linear projeleri**" | "İş durumu için tek kaynak **Kanban panoları**" |
| `is-kayit-duzeni-standard.md:14` | "Linear: Canlı işlerin tek listesi … çelişkide Linear kazanır" | "Kanban: canlı işlerin tek listesi … çelişkide Kanban kazanır; Linear donuk arşivdir" |
| `is-kayit-duzeni-standard.md:33` | "## 2. Kayıt AÇMA şablonu (Linear)" | "## 2. Kart AÇMA şablonu (Kanban)" |
| `is-kayit-duzeni-standard.md:75-95` | "`Fixes REC-nn` … Linear'ın GitHub entegrasyonu durumu otomatik …" | "PR gövdesi `Kanban: <numara>`; durumu kart üzerinde kanıt komutuyla Done'a çekilir (otomatik kapanış YOK)" |
| `is-kayit-duzeni-standard.md:103` | "Linear free tavanı (250) için periyodik arşivleme rutini OPS'ta" | **Kalkar** (Linear'a kayıt girmiyor) |
| `is-kayit-duzeni-standard.md:130` | "## 6.1 PİLOT — iş kartı panosu" | "## 6.1 Kanban tam kullanım" (pilotun ölçülmüş tuzak tablosu korunur) |
| `work-tracking-ssot-standard.md:1` | "SSOT = Linear" | "SSOT = Kanban (karar 219)" |
| `work-tracking-ssot-standard.md:77` | "Durum değişikliği panoya yazılmaz, Linear'da YAPILIR" | "Durum değişikliği Kanban'da YAPILIR; claim panosu yalnız dosya sahipliğidir" |
| `fleet-mechanism-standard.md:12` | "Emir \| **Linear kaydı**" | "Emir \| **Kanban kartı**" |
| `fleet-mechanism-standard.md:105` | "ilgili Linear numarası yaz" | "ilgili Kanban numarası yaz" |
| `rol-karti-uret.cjs:168` | "Her iş: Linear kaydı (REC-nn) + panoda kart + … Linear'da yeni kayıt açılamıyorsa üst kayda 'ALT İŞ' yorumu yaz." | "Her iş: Kanban kartı (<KISA AD>-<sayı>; Linear'dan taşınan REC-nn korunur) + emirde YÖNTEM satırı + KAYNAK/CETVEL bloğu." |
| `rol-karti-uret.cjs:172` | "iş durumu için Linear + pano" | "iş durumu için Kanban; kim hangi dosyada için claim panosu" |
| `session-board.cjs:520` | "Emir = Linear kaydi" | "Emir = Kanban karti" |
| `ci.yml:123` / `pr-kayit-kapisi.cjs` | "her PR bir Linear kaydına bağlanır: `Fixes REC-nn` ya da `Kayıtsız: <sebep>`" | "her PR bir Kanban kartına bağlanır: `Kanban: <KISA AD>-<sayı>` ya da `Kanban: REC-nn`; geçiş penceresinde `Fixes REC-nn` de kabul" |
| 4 WrongStack skill, madde 6 | "Pano (kanban) Linear'ın YANINDA pilottur. İş emrinin tek kaynağı **Linear**'dır" | "Kanban iş emrinin tek kaynağıdır (karar 219); Linear donuk" |
| 4 WrongStack skill, madde 12 | "mesaj yalnız ADRES (dosya/Linear)" | "mesaj yalnız ADRES (dosya/Kanban numarası)" |
| `recep.md:68` | "No: … Linear kaydına tıklanabilir bağlantı" | "No: işin Kanban numarası (<KISA AD>-<sayı> ya da taşınan REC-nn)" |

## 3. Geçiş planı — PARÇALI, 5 PR, bu sırayla

**Neden tek PR değil:** her şerit yalnız kendi dosyasına yazabilir (şerit kapısı); tek PR HARİTA + ARAÇ + YETENEK dosyalarını karıştırır ve kapıdan geçemez. Asıl sebep sıradır: cetvel "PR gövdesine `Kanban: …` yaz" der; kapı bunu henüz tanımıyorsa o günden sonra açılan her PR kırmızı olur.

| Sıra | PR | Ne | Sahibi | Neden bu sırada |
|---|---|---|---|---|
| 0 | Kapı çift yollu | `pr-kayit-kapisi.cjs` + test + `ci.yml`: `Kanban: <numara>` KABUL, `Fixes REC-nn` ve `Kayıtsız` hâlâ kabul (geçiş penceresi) | ARAÇ | Hiçbir cetvel değişmeden kapı iki dili de bilmeli; açık PR'lar (#1605 vb.) etkilenmez |
| 1 | Cetvel + üretici + 15 kart | Sınıf A ve B: CLAUDE.md, README, is-kayit-duzeni (§6.1 → "Kanban tam kullanım"), work-tracking-ssot, fleet-mechanism, session-loop, belge-yonetimi, pazar-olcum, `rol-karti-uret.cjs` + 15 kart + `rol-kartlari.test.ts:334` | HARİTA (OPS onaylar) | Kapı 0 birleşmeden `Kanban:` yazan PR kırmızı verirdi |
| 2 | Kanca ve betikler | Sınıf C ve D: session-board metni, hafiza-sorusu sırası, `kartsiz-kayit` Kanban kaynağı, `linear-arsiv` durdurma, kapı SADELEŞTİRME (penceresi bitince `Fixes` kalkar) | ARAÇ | PR 1 yeni dili kurar, kancalar ona uyar |
| 3 | Skill metinleri | Sınıf F, iki ağaç | YETENEK | Kural belgesi oturduktan sonra |
| 4 | Çıktı stili | Sınıf G (stil kartı) | HARİTA, Recep sözüyle | Kullanıcı düzeyi dosya; PR değil, doğrudan dosya |
| — | Design yüzeyi (E) | Karara göre | OPS + ARAÇ | §4 madde 1 cevabı gelmeden dokunulmaz |

**Kapılar kırılmasın diye:** PR 0'dan önce hiçbir cetvel satırı değişmez. Açık PR'lar (#1605, #1607, #1598, #1597) mevcut kuralla (`Fixes REC-nn`) kapanır; geçiş onların üstüne bindirilmez. Her PR öncesi ritüel + bağımsız okuyucu.

**"Tabloya iş yazmadan önce numara" ölçümü (OPS isteği):** Recep'e giden asistan mesajında başlığında `No` sütunu olan bir tablonun satırlarından hücresi boş, `—` ya da yalnız tire olanların sayısı. Sıfır değilse uyarı. Yer: Stop kancası (REC-554 ile birlikte, ARAÇ). Bugün yalnız bir disiplin; bugün iki pencere (HARİTA, OPS) aynı hatayı yaptı.

## 4. OPS'tan karar gereken sorular

1. **Design yüzeyi (E):** Claude Design Kanban'a yazamıyor; erişim envanterine göre Linear'ı okur ve yazar. Linear tamamen donarsa tasarım kanalı kopar. **Önerim:** "Linear DONUK" yalnız İŞ KAYDI için geçerli olsun; Design'ın proje yorumu yüzeyi deneme boyunca AÇIK kalsın (sayaç kancası ve `ops-iletisim-protokolu.md` yerinde). Beğenilip Linear emekli edilirken Design için ayrı yol (Kanban kartına dosya ya da panoya yorum) kurulur.
2. **Geçiş penceresi:** `Fixes REC-nn` kapıda ne zamana kadar kabul? **Önerim:** deneme bitişi (10-08); beğenilirse PR 2'de kalkar, beğenilmezse kalıcı olur.
3. **Kararlar belgeleri:** Linear'da kalıyor (REC-554 sonrası dosya). `defter-tazelik-satiri.cjs`, `kararlar_disa_aktar.py`, `karar-kayit-bagi.test.ts` Linear kopyasına bakmaya devam eder; DOKUNULMAZ. Onay?
4. **Hafıza dosyaları** (`memory/*.md`, durum dosyaları): "Linear" geçenler ölçülmedi; sayısı ve sınıfı ayrı iş. **Önerim:** geçiş PR'larının dışında, hafıza geçişi (REC-538) sırasında ele alınsın.
5. **PR şablonu:** `.github/pull_request_template.md` Linear'dan hiç söz etmiyor (ROADMAP satırları eski). Şablona `Kanban: <numara>` satırı eklenmesi PR 1'e girsin mi? **Önerim:** evet. **OPS kararı: evet (PR 1'e girdi).**
6. **PR 1'de ölçüm sırasında çıkan, planda olmayan sorular (OPS'a):**
   - `multi-session-coordination-standard.md` (iş durumu Linear'da yazıyordu) planın sınıf B listesinde yoktu; ikinci geçişte (`rg "REC-\d+"`) bulundu ve PR 1'e eklendi. Benzer bir kaçak bırakmamak için PR sonrası `rg -i linear docs/standards` sayımı tekrar edilir.
   - Üç cetvel Linear'ı veri/ek yeri olarak anıyor: `geo-olcum-standard.md` (ham cevap ve aylık özet "Linear kaydına ek"), `rehber-yazisi-standard.md` (REC-369 eki), `yayin-gorunurluk-denetim-standard.md` (kalıcı kopya "Linear kaydına ek"). Bunlar iş durumu değil ölçüm saklama yeridir; Linear donukken yeni ek eklenir mi, Kanban kartına mı gider? **Sahipleri GEO-SEO, BLOG, ALTYAPI; PR 1'e DAHİL DEĞİL.** **KARAR (OPS):** ek = ilgili Kanban kartına bağlantı/not, dosya depoda ya da `docs/olcum/` altında; cümlelerin düzeltilmesi HRT-4 kartında.
   - Kısa ad tablosunda BLOG, EDGE, GEO-SEO, I18N, MARKA, MEVZUAT, SATIS, TASARIM satırı yok; OPS ataması bekleniyor (is-kayit-duzeni §1). **ÇÖZÜLDÜ (OPS, a1e643c91):** BLG, EDG, SEO, DIL, MRK, MVZ, STS, TSR.
   - OPS kartının görev cümlesindeki "Recep'in her talimatını REC-425 altına kaydeder" (talimat defteri Linear'da) donuk Linear ile çelişiyor; PR 1'de DOKUNULMADI. Talimat defteri nereye taşınacak: OPS. **ÇÖZÜLDÜ (OPS):** Recep talimatı OPS panosundaki REC-425 kartına not olarak yazılır; üretici ve OPS kartı düzeltildi.
   - `scripts/nlm/santiye.py` ve `work-tracking-ssot-standard.md` §8'in Linear'dan okuyan iş dağılımı üreticisi: HRT-3 kartında.

## 5. Bu belge neyi ölçmedi (adıyla)

- `docs/olcum/erisim-envanteri.md` Linear satırı (18) ve Claude Design satırı (51): "Linear: Var, okuma ve yazma" doğru kalıyor; donukluk notu eklenir, satır silinmez.
- `.mcp.json` ve Linear eklentisi: silinmez (geri dönüş yolu).
- Kullanıcı düzeyi `~/.claude/CLAUDE.md` ve diğer kullanıcı ayarları: taranmadı.
- Sayımlar yalnız `rg -c -i linear`; "Linear" yerine "REC-nn" ya da "lineer" yazan cümleler (örn. `Fixes REC-nn` geçen ama Linear adı geçmeyen yerler) ayrıca taranmalı: PR 1'de `rg "REC-\\d+"` ile ikinci geçiş yapılacak.
