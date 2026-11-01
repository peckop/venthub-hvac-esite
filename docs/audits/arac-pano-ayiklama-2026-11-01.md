# ARAÇ panosu ayıklaması, 1 Kasım 2026 (ARC-84, OPS emri sıra 3)

Kaynak: ARAÇ panosunun 117 açık kartı (Backlog 100, To Do 11, Review 6). Yöntem: salt-okuma yardımcı ajan, her kart numarası `git log origin/master` konu ve gövdesinde ve kart notlarında arandı (3672 commit). Cetvel: `docs/standards/is-kayit-duzeni-standard.md`.

**Sınırlar (dürüstlük):** "bitti" kanıtı commit konusudur; `gh api .../merge` ile PR doğrulaması kart kapatılırken ayrıca yapılır, ajan yapmadı. Commit'in master'da olması kartın TÜM kapsamının bittiği demek değildir; kapatma kartın kendi BİTİŞ maddesine bakılarak yapılır. Mod kartları depo dışı (`~/mods`) olduğu için master'dan doğrulanamaz.

## Sayım

| Hüküm | Kart |
|---|---|
| bitti | 33 |
| geçersiz | 5 (ARC-75, 109, 114, 144, 154) |
| yeni-site (karar 412) | 0 (ARAÇ alanında yok) |
| yapılacak | 50 |
| belirsiz | 29 (13 depo dışı mod kartı + 14 komşu işle örtüşen + ARC-117, ARC-84) |

## Bitti (kanıtlı Done'a alınacak)

ARC-23 (5d82ca6dc), ARC-26 (361768a2c, #2108), ARC-43 (fba094bf3, #1725), ARC-51 (df6e4dc55, #1870), ARC-60 (35224a3c5), ARC-68 (rol kartı Amaç ve Düzenli görevler), ARC-87 (b978e4318), ARC-92 (ac6ac19d5), ARC-94 (792b7fedc), ARC-95 (47ee14fb5), ARC-96 (1b0fa7e9d), ARC-98 (72a0c2916, #1877), ARC-99 (6a88b9c07), ARC-110 (17212fba1), ARC-111 (06c3ce9f2), ARC-125 (018d8f0fe, #1932; sayaç 0 ölçümü kalmış), ARC-132 (1ca0852ec, #2016), ARC-190 (2711cb2b1, #2020), ARC-191 (974376fed, #2023), ARC-196 (fddbbf76a), ARC-198 (pano ayarı), ARC-200 (6f78ace1a), ARC-201 (364978b3e, #2026), ARC-202 (25f068b93, #2028), ARC-203 (aad0aa1e2), ARC-204 (7cd6d84a1), ARC-205 (1dd56d485), ARC-206 (949c926c3, #2057), ARC-207 (717e110e4), ARC-208 (fddbbf76a), ARC-214 (531406293, #2094), ARC-215 (93505f803, #2095), ARC-221 (OPS 27 Ekim notu).

## Geçersiz (arşiv)

ARC-75 (sürüm notu 3 hafta geçti), ARC-109 ve ARC-144 (ARC-233'e birleşti), ARC-114 (NotebookLM emekli, karar 419), ARC-154 (sayaç ARC-204'te kalibre edildi).

## Yapılacak (öncelik 1 en yüksek; hedef gün öneridir, OPS sırayı verir)

| Hedef | Kart | Not |
|---|---|---|
| 2 Kasım | ARC-199 | WrongStack 1.1.11, kapatma anı Recep sözüyle |
| 2 Kasım | ARC-219, ARC-218 | ponytail deneme hükmü (süre doluyor); claude-seo görünürlük ölçümü |
| 3 Kasım | ARC-193 + ARC-120 (birleşik), ARC-194, ARC-195, ARC-192 | Claude Code kalan maddeleri (OPS-176) |
| 4 Kasım | ARC-171, ARC-233 | git push kancası; WrongStack özellik hükmü |
| 5 Kasım | ARC-58, ARC-59, ARC-102 | söz bekçisi, dış veri taraması, üç mekanik kapı |
| 6 Kasım | ARC-86, ARC-112, ARC-113, ARC-166 | kabul ölçümü, kaynaksız hüküm uyarısı, claim yenileme, Stop çelişkisi |
| 9 Kasım | ARC-123, ARC-133, ARC-164, ARC-170 | doğrulayıcı komut kapısı, token ölçümü, sage rol etiketi, yeşil PR tarayıcı |
| sonrası (öncelik 4-5) | REC-552, 536, 465, 464, 462, 500, 413; ARC-19, 22, 31, 33, 64, 85, 88, 89, 90, 91, 101, 115, 116, 121, 134, 153, 158, 159, 162, 163, 172, 173 | tek tek karar gerekirse OPS'a |

## Belirsiz (OPS ya da kart sahibi kanıtı gerekir)

- Depo dışı mod kartları: ARC-36, 37, 39, 49, 50, 53, 54, 55, 56, 57, 97, 100, 126.
- Komşu işle örtüşen, kapsam ölçülmedi: ARC-3, 4, 25, 27, 28, 77, 105, 156, 160, 161, 167, 168, 174, 197.
- Ayar dosyasında doğrulanır: ARC-117. Bu tablo ARC-84'ün tek tablo işini karşılar; kapatma OPS'ta.

## Bu ölçümde çıkan iki bulgu

- ARC-191 (kayıt kancası) #2023 ile master'da; emirdeki "açık PR, tazele" bilgisi bayattı.
- Aynı kalıp kök sebebin göstergesidir: kartlar PR birleşince kendiliğinden kapanmıyor (ARC-235).
