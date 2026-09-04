# Proje Takip Defteri Cetveli — v1.0

Durum: v1.0 · 2026-09-04 · Sahip: OPS (orkestratör) · Karar: Recep, 2026-09-04 akşam ("madem inat ediyorsun, seni
zorluyorum: NLM'e proje yürütme md'lerinin tamamını yükle, koddan üretilenleri asla; deterministik olsun, betik yazılır").

## 0. Niçin var — ölçülmüş olay
2026-09-04 akşamı aynı gün içinde üç kez "bunu konuşmuştuk" sorusuna yanlış ya da eksik cevap verildi (sepet/satış kipi,
multitenant/kiracı, admin aç-kapa). Sebep: proje yürütme bilgisi DÖRT yerde yaşıyordu (Linear · docs/ · orkestratör
hafıza notları · oturum kayıtları) ve hiçbirinde "geçmişte ne konuştuk" sorusuna doğal dille cevap veren bir katman yoktu.
NotebookLM ikizi (VentHub Proje Hafızası) koddan üretilmiş master'larla besleniyordu; kararların çoğu orada değildi.
Recep'in "hangi md ne, bunu bilmen lazım; bu çalışma bile kaynakları ne kadar dağınık yönettiğinin ispatı" eleştirisi
bu cetvelin doğuş sebebidir.

## 1. Tek kaynak ayrımı (değişmez)
| Soru | SSOT | Defterin rolü |
|---|---|---|
| Ne karar verildi / iş durumu ne | **Linear** (Kararlar belgeleri + iş kayıtları) | kopya (dışa aktarım), aranabilir hafıza |
| Kural / cetvel / plan / ölçüm | **depo `docs/`** | kopya |
| Orkestratör dersleri | **hafıza notları** | kopya |
| "Bunu konuşmuş muyduk, neden böyle" | **NotebookLM "Venthub Proje Takip"** | ilk sorulan yer; cevap Linear/docs ile DOĞRULANIR |
Çelişkide sıra: kod > Linear > docs > defter. Defter karar üretmez, hatırlatır.

## 2. Kapsam — manifest tek listedir
`docs/proje-takip/manifest.json` hangi dosyaların "proje yürütme kaynağı" olduğunu söyler. Listede olmayan şey deftere
girmez. **Asla girmez:** koddan/araçtan üretilmiş md'ler (`docs/*_master.md`, `system_tree.md`, `design_system_config.md`,
kod yanı companion `src/**/*.md`, `*.config.md`), `artefakt_manifest.json`. Sebep: üretilmiş belge kod fotoğrafıdır;
deftere girerse NLM cevapları o fotoğrafa bağlanır ve kod ilerledikçe sessizce yanlışlar (2026-08-16 örneği: NLM ikizi
"tetik/webhook yok" dedi, canlıda vardı).

Linear MCP betikten çağrılamaz; bu yüzden Linear belgeleri `docs/proje-takip/linear/` altına DIŞA AKTARIM olarak konur
(dosya başında kopya tarihi). Kararlar belgesi değişince OPS aynı gün kopyayı yeniler. Design brief'leri ve Design'ın
bulgu dosyaları `docs/proje-takip/design-15a/` altında yaşar (önceden yalnız scratch/C:\tmp'de duruyordu — kırılgandı).

## 3. Eşitleme — deterministik, betikle
`python scripts/nlm/proje_takip_sync.py olc | esitle | taban | listele`
- Demetleme deterministiktir: dosyalar yol adına göre sıralı, içerik olduğu gibi, zaman damgası yok → aynı girdi aynı
  sha256. `state.json` son eşitlenen hash'leri tutar ve depoya girer.
- `olc`: derle + karşılaştır, deftere yazmaz; çıkış 3 = değişen var. `esitle`: yalnız değişen demeti yeniler (aynı
  başlıklı kaynağı siler, yenisini ekler). `taban`: defter elle yüklenmişse hash'leri "eşitlenmiş" sayar (ilk kurulum).
- Kanıt betiğin çıkış kodu değil, `notebooklm source list -n <defter>` çıktısıdır (kanıt = ölçüm, beyan değil).
- Ne zaman koşar: manifest kapsamındaki bir dosya master'a merge olduğunda (OPS, aynı gün); Linear karar belgesi
  değişince (kopya yenilenir, sonra `esitle`). Otomatik kanca YOK (v1): NLM oturumu tarayıcı girişi ister, CI'da koşamaz.

## 4. Defterin doğru kullanımı
- Sorular SERİ sorulur (aynı konuşma, tek tek); paralel soru bağlamı bozar (Recep, 09-04).
- Defter çıktısı her zaman "aday bulgu"dur: tarih ve belge adıyla gelir, ama çözülmüş eski bulguları da getirir.
  İş açmadan önce kod/Linear ile doğrulanır; doğrulanmamış bulgu Linear'a girmez.
- Çelişki/mükerrerlik taraması alan alan yapılır (ticari model · katalog · vitrin · iş yönetimi · güvenlik · yol
  haritası); çıktı `docs/proje-takip/celiski-mukerrerlik-analizi-<tarih>.md` olarak depoya girer ve deftere yüklenir.

## 5. Kapı (v1: yok; v1.1 adayı)
Bugün kapı yok; `olc` çıkış 3 iken merge'i durduran bir CI kolu NLM girişi olmadan kurulamaz. Aday: manifest kapsamındaki
dosya değişen PR'da `state.json` da değişmemişse UYARI (kırmızı değil) — "eşitleme borcu" görünür kılınır.

## 7. Terim kuralı: "Faz" tek başına yazılmaz (ilk taramanın kök bulgusu, D8)
Belgelerde "Faz" dört ayrı katmanı anlatıyor ve okuyan hangisi olduğunu bilemiyor: SaaS dönüşümü (Faz 1 Foundation …
Faz 4 Marketplace), 15A vitrin üretimi (Faz 1 kabuk … Faz 4), admin DataTableKit göçü (Faz 0-6), bayi modülü (R0-R5,
B1-B2). CLAUDE.md'deki "Faz 1 bitti, Faz 2 PARK" SaaS fazıdır; aynı gün brief'lerdeki "Faz 1 kabuk" üretim fazıdır.
**Kural (yeni yazımda zorunlu):** faz adı kapsam belirteciyle yazılır — `SaaS-F2`, `15A-F2`, `ADMIN-F3`, `BAYİ-R4`.
Mevcut belgelere geriye dönük dokunulmaz; kapı yok, tarama sırasında görünür kılınır.

## 6. Değişiklik kaydı
v1.0 (2026-09-04) — ilk sürüm; defter `Venthub Proje Takip` (a5f382a4) 13 demetle kuruldu, ilk çelişki taraması başladı.
