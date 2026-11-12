# ARAÇ panosu kapanış ölçümü (ARC-84, 2026-11-12)

Kart: ARC-84 (pano kapanışı, vade 14 Kasım, Recep onaylı). Kaynak/cetvel: `docs/standards/is-kayit-duzeni-standard.md` (Done yalnız kanıtla). Önceki tablo: ARC-84 kartının 4 Kasım notu (65 kart). Bu belge Backlog'un 51 kartını `origin/master` 6837737d0'a ve mods deposuna (`~/mods`, uzak yok) karşı yeniden ölçer. Yöntem: salt okuma araştırmacı (kart no ile `git log --grep`, kanıt dosyasının `git grep` ile varlığı; "yok" hükmü en az iki yöntemle). Kapatma kararı ve Kanban yazımı müdürdür.

Sayım: 51 kart · TESLİM 6 · AÇIK-GEÇERLİ 44 · ÖLÇÜLEMEDİ 1 · BAYAT 0. Panoda önce: Backlog 51, To Do 11, Done 237 (12 Kasım sabahı); sonra bu belgenin altındaki "Uygulanan" bölümü.

## Teslim edilmiş (6)

| Kart | Kanıt | Kapanış yolu |
|---|---|---|
| ARC-105 | `.claude/skills/wrongstack-mailbox-mcp/SKILL.md:37` boş başlama belgeli (e85565bd2) | KAPANDI: `file_matches` geçti |
| ARC-39 | mods `281b078`, `615cfdc` (Aktif/Pasif anahtarı) | depo dışı kanıt: OPS `kanit-muaf` |
| ARC-100 | mods `3251c01` (ops-kokpit 0.8.0) | depo dışı kanıt: OPS `kanit-muaf` |
| ARC-116 | `de0a86968` (ARC-273), `4a2de0b5e` (ARC-241): konu başka numarayla kapandı | OPS `kanit-muaf` |
| ARC-159 | `rol-gorevleri.json`: 48 görev, tetiksiz 0 (10-16 ölçümü eskidi) | OPS `kanit-muaf` |
| ARC-160 | hatırlatma kolu `rol-gorevleri.json:89-92` var; zamanlayıcı kararı (karar 53) açık, kartın `haftalik-oz-degerlendirme.cjs` ölçütü yok | KISMEN: açık kalır |

## Rafta (başka tarafa bağlı ya da dayanağı eskidi)

| Kart | Sebep |
|---|---|
| ARC-123 | Kapı WrongStack tarafında; depoda değişiklik gerektirmiyor |
| ARC-168 | WrongStack 1.1.x etkinleştirme planı; kurulu 1.3.0, son 1.5.6 (dayanak eskidi) |
| ARC-233 | "1.1.4 değer hükmü"; aynı sebep |

## Ölçülemedi

REC-413 (canlı DB parolası; sır okunmaz).

## Açık ve geçerli (44), sıra önerisiyle

Vadesi yakın ya da etkisi yüksek olanlar önce.

1. ARC-298 (bash-write-guard yanlış red, tam komut yok), ARC-247 (kartsız kapı hâlâ "Recep'ten istenen" der; karar OPS'a yönleniyor), ARC-162 (alt ajan dal doğrulaması kanca olarak yok), ARC-166, ARC-174, ARC-256, ARC-257: kanca işleri.
2. ARC-22 (AD_KALIBI ders dosyasını durum sanıyor), ARC-28, ARC-102, ARC-113, ARC-115, ARC-163, ARC-164, ARC-197: kanca ve ölçüm düzeltmeleri.
3. Mod (kokpit, hafta) kartları, kısmen teslim: ARC-31, ARC-33, ARC-37, ARC-49, ARC-50, ARC-53, ARC-54, ARC-55, ARC-57, ARC-97 (kod `arac/arc97-kaldigi-yer` dalında, master'da değil), ARC-126, ARC-153, ARC-134 (mods depo yedeği, uzak yok).
4. Ölçüm ve deneme: ARC-64, ARC-89, ARC-90 (context-mode), ARC-91 (caveman; karar Recep'te), ARC-117, ARC-158, ARC-250, ARC-253, ARC-260, ARC-284, ARC-286, ARC-19, REC-500.

Ayrıntı (kart başına tek satır kanıt) araştırmacı raporunda; kartların kendi notlarına işlenir, bu belge sınıflama ve sırayı tutar.

## Uygulanan (12 Kasım)

ARC-105 Done (kanıtlı). ARC-25 Done (başka yoldan teslim, `kart-plan-baglantisi.cjs`). Rafta etiketi ve `kanit-muaf` istekleri OPS'a gitti.
