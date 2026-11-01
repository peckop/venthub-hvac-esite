# WrongStack skill'lerinin kullanım sayımı — 2026-11-01

Kart: YTN-3 (YETENEK panosu). Emir: OPS, 1 Kasım (arşiv kararı geri alındı, sayım yapılsın). Yazan: YETENEK.
Betik: `docs/audits/skill-kullanim-sayimi.cjs` (salt okuma; aynı komut yeniden koşulabilir).

## KAYNAK / CETVEL

- Önceki ölçüm (üstüne kuruldu): `skill-departman-dagitimi-2026-10-26.md` (YTN-19: 13 Ekim sonrası **departman başına**
  Skill aracı toplamı; skill başına sayı vermedi), `skill-wrongstack-1-1-0-tasima-2026-10-12.md` (YTN-18, taşıma),
  `skill-departman-setleri-2026-09-30.json` (çalışan setleri: `onYukle`, `adiylaCagir`, `mudurCekirdegi`).
- Yöntem: `docs/standards/execution-method-standard.md` (betik + elle yorum).
- Tazelik: 1 Ekim – 1 Kasım 2026 dökümleri; yeni skill ya da yeni ajan tanımı gelince bayatlar.

## Yöntem

`~/.claude/projects/**/*.jsonl` altında 1 Ekim'den sonra değişen **3016 döküm** (alt ajan dökümleri dahil) satır satır
okundu. Yalnız yapılandırılmış `tool_use` blokları sayıldı, döküm metni değil. Üç tür iz:

| İz | Ne demek |
|---|---|
| Skill çağrısı | Model `Skill` aracıyla skill'i kendisi açtı |
| SKILL.md okuması | Model skill dosyasını `Read` ile elle okudu |
| Ön yükleme maruziyeti | Ajan tanımı skill'i `skills:` alanıyla baştan yüklüyor; o ajan türünün kaç kez açıldığı sayıldı |

Ayıklanan: 12 Ekim'de YETENEK'in taşıma testi (YTN-18, oturum `ffc159b2`), 23 skill'i birer kez açıp doğruladı; bu
çağrılar kullanım sayılmadı, tabloda "test" sütununda ayrı durur.

## Sonuç tablosu (28 skill)

| Skill | Skill çağrısı | SKILL.md okuması | Ön yükleme (ajan açılışı) | Test | Hüküm |
|---|---|---|---|---|---|
| verify-before-done | 0 | 6 | 16 doğrulayıcıda; 603 açılış | 2 | Çalışıyor (ön yükle) |
| testing | 0 | 1 | 4 uygulayıcıda; 335 açılış (altyapi) | 1 | Çalışıyor (ön yükle) |
| code-review | 0 | 1 | 6 doğrulayıcıda; 99 açılış | 4 | Çalışıyor (ön yükle) |
| research-web | 2 (Haiku, KATALOG alt ajanı) | 0 | 3 araştırmacıda; 91 açılış | 1 | Çalışıyor |
| chimera | 0 | 1 | 3 çürütücüde; 13 açılış | 1 | Az, ön yükle |
| react-modern | 0 | 1 | tasarim-uygulayici; 7 açılış | 1 | Az, ön yükle |
| web-performance | 0 | 1 | 2 ajanda; 0 açılış | 0 | İş çıkmadı |
| wrongstack-kanban | 5 | 16 | müdür çekirdeği | 5 | Çalışıyor (müdür) |
| codebase-navigation | 2 (Haiku, alt ajan) | 0 | — (10 sette adıyla) | 1 | Az |
| tech-stack | 0 | 4 | — | 0 | Yalnız elle okundu |
| sdd | 0 | 3 | müdür çekirdeği | 1 | Yalnız elle okundu |
| git-flow | 0 | 4 | müdür çekirdeği | 1 | Yalnız YETENEK okudu |
| multi-agent | 0 | 4 | müdür çekirdeği | 1 | Yalnız YETENEK okudu |
| refactor-planner | 0 | 2 | müdür çekirdeği | 1 | Yalnız YETENEK okudu |
| wrongstack-mailbox-mcp | 0 | 4 | müdür çekirdeği | 5 | Yalnız YETENEK okudu |
| api-design, debugging, observability | 0 | 1'er (OPS) | — (adıyla) | 1'er | İş çıkmadı |
| payments-webhooks | 0 | 1 | — (adıyla) | 0 | İş çıkmadı |
| bug-hunter, data-governance, security-scanner, typescript-strict, web-platform-baseline | 0 | 0 | — (adıyla) | 1'er | Hiç kullanılmadı |
| database-migrations | 0 | 0 | — (adıyla) | 0 | Hiç (1 Kasım'da genişletildi) |
| mnemosyne, prompt-engineering, node-modern | 0 | 0 | müdür çekirdeği / 2 sette adıyla | 1'er | Hiç kullanılmadı |

Ön yükleme sütunu **üst sınırdır**: ajan tanımlarının `skills:` alanı 19 Ekim'den (HRT-61) sonra üretildi, 1-19 Ekim
açılışları da sayımda. Skill'in gövdesinin işte ne kadar uygulandığı dökümden ölçülemez; yalnız yüklendiği ölçülür.

## Okuma

1. **Model skill'i kendiliğinden açmıyor.** 28 skill'de bir ayda gerçek Skill çağrısı yalnız 9 (wrongstack-kanban 5,
   research-web 2, codebase-navigation 2). YTN-19'un departman toplamıyla aynı hüküm.
2. **Skill işe ön yükleme ile ulaşıyor.** En çok iş gören dört skill (verify-before-done, testing, code-review,
   research-web) ajan tanımına baştan yüklenenler. Adıyla çağır listesindeki skill'lerin hepsi 0 ya da 1.
3. **Haiku görüyor.** Kart "Haiku görmüyor" olasılığını sormuştu: dört Skill çağrısı Haiku alt ajanından geldi, engel yok.
4. **Hiç çağrılmayanların sebebi:** "iş çıkmadı" (api-design, payments-webhooks, database-migrations: o ay ilgili kod
   işi azdı) ile "açıklama tetiklemiyor ve ön yüklü değil" (bug-hunter, security-scanner, typescript-strict) ayrışıyor.
   İkinci grupta işler vardı (78 security-reviewer açılışı), skill yerine yerleşik ajan kullanıldı.

## Öneri (karar OPS'ta)

- Kapatma önerisi **yok**: adıyla listede duran skill'in maliyeti yalnız adıdır (YTN-19 `name-only`).
- Ön yüklemeye aday iki skill: `bug-hunter` (çürütücülere) ve `security-scanner` (güvenlik doğrulayıcısına); ikisi de
  bütçe kararı ister (çalışan set sınırı 35 KB). Ayrı kart açılır, bu kartta uygulanmaz.
- Müdür çekirdeğindeki `mnemosyne`, `prompt-engineering` bir ayda hiç açılmadı; çekirdekten adıyla listeye inmeleri
  sonraki cuma çürütmesinde değerlendirilir.
