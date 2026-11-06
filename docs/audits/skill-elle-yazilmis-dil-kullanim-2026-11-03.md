# Elle yazılmış skill listesi ve açıklama dili × kullanım (YTN-30, 3 Kasım 2026)

> Ölçüm tarihi 3 Kasım 2026. Soru (OPS, Recep'ten): "Diğer skill'ler Türkçe tetik zayıf olduğu için mi az kullanılıyor; kullanılmama sebebi dil mi, ihtiyaç yok mu?"
> Cetvel: `docs/audits/skill-kullanim-sayimi-2026-11-01.md` (YTN-3 sayımı), `docs/audits/skills-eval-2026-11-03.json` (yönlendirme sınavı). Bu belge ölçüm raporudur, cetvel değildir.

## Hüküm

**Dil, kullanılmamanın ana sebebi değil.** Yerel olarak yazılmış 38 skill'in 36'sı bu ay hiç çağrılmadı; bunların 25'inin açıklaması Türkçe, 10'unun İngilizce. Türkçe olması çağrılmayı kurtarmıyor. En çok çağrılan skill'ler genel iş akışı skill'leridir (kod inceleme, kanban, rehber yayını, SEO yazımı); özel durum skill'leri (denetim, migration, CE dosyası, 3D) iş çıkmadığı için çağrılmıyor. Yani ana sebep **ihtiyaç**, ikincil olarak **tetik ölçütünün bilinmemesi**: 12 skill'in yönlendirme sınavı hiç yok, dolayısıyla Türkçe tetikleri ölçülmüş değil.

Çekince: sayım yalnız `Skill` aracı çağrılarını görür (166 çağrı, 1 ay, 73 skill). Model bir skill'i dosyadan okuyup uygulayabilir; o sayılmaz. Sayı kullanımın tabanıdır, tavanı değil.

## Dil × kaynak × kullanım

Kaynak: skill dosyasında `kaynak:` satırı olan = dış/uyarlama (WrongStack 1.1.0, vudovn, onvoyage vb.; YETENEK'in kendi yazdığı `calisma-kopyasi-sil` ve `ce-uygunluk-dosyasi` de bu sınıfa düşer, ayrıntı aşağıda); olmayan = yerel.

| Grup | Skill | Bu ay ≥1 çağrılan | Toplam çağrı |
|---|---|---|---|
| Türkçe açıklama, dış/uyarlama | 34 | 26 | 48 |
| Türkçe açıklama, yerel | 27 | 2 | 5 |
| İngilizce açıklama, yerel | 10 | 0 | 0 |
| Karışık açıklama, yerel | 1 | 0 | 0 |
| Karışık açıklama, dış/uyarlama | 1 | 0 | 0 |

Okuma: Türkçe açıklamalı yerel grup (2/27) İngilizce gruptan (0/10) pek ayrılmıyor; ikisi de neredeyse hiç çağrılmıyor. Çağrılanlar dış/uyarlama grubunda toplanıyor, çünkü onlar günlük iş akışı skill'leri. Dil farkı küçük, kaynak/iş türü farkı büyük.

## Elle yazılmış (yerel) 38 skill

Tarih = deponun `git log` ilk eklenme tarihi (dosya ilk bu tarihte girdi; yazarı ayırt edilemez, herkes aynı kimlikle commit atar). Çağrı = bu ay `Skill` çağrısı. Sınav = `evals/evals.json` var mı.

| Tarih | Skill | Açıklama dili | Çağrı | Sınav |
|---|---|---|---|---|
| 02 Şub | i18n-conventions | TR | 0 | var |
| 02 Şub | supabase-security | TR | 0 | var (sınavda düştü) |
| 02 Şub | venthub-architecture | TR | 0 | var (sınavda düştü) |
| 11 Mar | ui-ux-pro-max | TR | 0 | var |
| 13 Mar | venthub-auditor | TR | 0 | var |
| 01 Nis | diff-review | TR | 0 | var |
| 03 Nis | venthub-global-rontgen | TR | 0 | var |
| 19 Nis | venthub-enterprise-audit | TR | 0 | var |
| 24 May | notebooklm-sync, orion-cli | TR | 0 | var |
| 25 May | find-skills, git-commit, notebook-navigator, vercel-composition-patterns, vercel-react-best-practices | EN | 0 | var (vercel-react-best-practices sınavda düştü) |
| 25 May | supabase | karışık | 0 | var |
| 26 May | typography, web-design-guidelines | TR | 0 | var |
| 02 Haz | to-issues, to-prd | TR | 0 | var |
| 05 Haz | fallow | EN | 0 | var |
| 08 Haz | skills-creator | TR/EN karışık | 0 | var |
| 10 Haz | threejs-webgl-performance | TR | 0 | var |
| 11 Haz | codegraph | EN | 0 | var |
| 11 Haz | agy-orchestrate | EN | 0 | **yok** |
| 15 Haz | maestro | EN | 0 | **yok** |
| 15 Haz | prd-complexity-audit | TR | 0 | **yok** |
| 19 Haz | plan-challenger | TR | 0 | var (sınavda düştü) |
| 15 Ağu | venthub-20-eksen-denetimi | TR | 0 | **yok** |
| 26 Ağu | create-migration | TR | 3 | **yok** |
| 09 Eyl | llm-council, office-hours, qa, task-observer, video-kaynak | TR | 0 | **yok** |
| 12 Eyl | investigate | TR | 0 | var |
| 16 Eyl | graphify | EN | 0 | **yok** |
| 30 Eyl | mutasyon-testi | TR | 2 | **yok** |

Not: `venthub-tasarim-dili` yerel sayılmadı (dış kaynak satırı var) ama sınavda düştü; düşen 5 skill kartta ayrı izleniyor.

## Öneri: hangileri skill-creator'dan geçsin

Recep kuralı gereği skill yazma/değiştirme Anthropic skill-creator ilkeleriyle yapılır. Sıra önerisi:

1. **Sınavsız 12 skill'e Türkçe sınav ekle** (agy-orchestrate, maestro, prd-complexity-audit, venthub-20-eksen-denetimi, create-migration, llm-council, office-hours, qa, task-observer, video-kaynak, graphify, mutasyon-testi). Bunların ikisi (create-migration, mutasyon-testi) bu ay gerçekten çağrıldı, yani ihtiyaç var ve Türkçe tetikleri ölçülmeli. Önce bunlar, çünkü kullanılan ama ölçülmeyen skill en büyük kör nokta.
2. **Sınavda düşen 5 skill'in açıklamasını düzelt** (plan-challenger, supabase-security, venthub-architecture, venthub-tasarim-dili, vercel-react-best-practices). Bütçe payı 6 bayt: en az çağrılan başka bir skill'in açıklaması kısaltılarak denkleştirilir.
3. **Hiç çağrılmayan, sınavı geçen skill'lere dokunma.** Geçen sınav, tetiğin çalıştığını gösterir; çağrılmamaları ihtiyaç sorusudur. Bir ay daha izlenir, sonra emekliye ayırma önerisi ayrı kartla gelir.
4. **Tetik ölçütü**: Recep'in gerçek cümleleriyle ölçüm (bağlamlı, bağlamsız) iki skill için güvenilir sonuç vermedi (defterde asistan mesajı yok); kart Beklemede.

## Yöntem ve sınırlar

- Sayım ham verisi: `Skill` aracı çağrıları, 166 çağrı, 1 ay (YTN-3 ile aynı yöntem). Çağrı kimliği skill adıdır; eklenti skill'leri (ör. `claude-seo`) listeye alınmadı.
- Açıklama dili: açıklamada Türkçe harf ya da yaygın Türkçe kelime varsa TR; yalnız İngilizce kelime varsa EN; ikisi de varsa karışık. Elle kuralla sınıflandırıldı, sınır örneklerde yanılabilir.
- Dil ve ihtiyaç ayrımı için kesin kanıt: aynı iş için Türkçe ve İngilizce açıklamalı iki skill'in karşılaştırması yok. Bu tablo ilişkiyi gösterir, nedensellik kanıtlamaz.
