# Oturum başı skill yükü — ölçüm (2026-09-12, REC-304)

**Soru:** her oturum açılışında skill'ler için ne ödüyoruz, ve eşik nereye konur?

**Cevap:** `.claude/skills` için **16.6 KB ≈ 4.3K jeton** (tahmin). Kayıtta hedef olarak yazılan
"≤5K" **zaten sağlanmış**. Kusur sayıda değil, ilk sayının **evreninde**ydi.

---

## 1. İki evren — ilk sayı hangisinden geldi

| evren | `.claude/skills` (36 skill) | `.agent/skills` (35 skill) |
|---|---|---|
| TAM frontmatter | 28.4 KB (~7.3K jeton) | 26.8 KB (~6.9K jeton) |
| oturuma giren (`name` + `description` [+ `argument-hint`]) | **16.6 KB (~4.3K jeton)** | 12.1 KB (~3.1K jeton) |
| fark (yalnız diskte) | 11.8 KB | 14.7 KB |

İlk ölçüm **7.4K jeton** demişti; tablodaki `.claude` TAM frontmatter satırı (~7.3K) ile aynı
yer. Yani o sayı "host frontmatter'ın tamamını okur" varsayımıyla çıkmış. Oturuma giren liste
`name` + `description` biçiminde; kalan anahtarlar o listede yok.

⚠**Jeton sayıları TAHMİN** (4 karakter ≈ 1 jeton). Bayt ölçüm, jeton dönüşümü tahmindir.

⚠**`.agent/skills` bütçeye SAYILMAZ:** o ağaç Antigravity işçisinin, Claude Code oturumuna
girmiyor (ayrı host). Ölçüldü, raporda duruyor, ama bizim oturum bedelimiz değil — sayılsaydı
başka bir ajanın maliyetini kendimize yazardık.

## 2. İkinci yanlış evren: "okunmayan 6 anahtar temizlenmeli"

Kayıt, host'un okumadığı anahtarların **temizlenmesini** öneriyordu. Ölçüm bunu çürüttü:
host okumuyor ama **bizim araçlarımız okuyor.**

| anahtar | kaç skill'de | okuyan bizim aracımız |
|---|---|---|
| `category` | 63 | `scripts/compile_skills.py:75` (manifest kategorisi) |
| `metadata` | 63 | `scripts/compile_skills.py` (manifest gövdesi) |
| `depends_on` | 56 | `scripts/skills-router.py:46`, `compile_skills.py:78` |
| `next_steps` | 56 | `scripts/skills-router.py:47` |
| `run_last` | 55 | `scripts/skills-router.py:48` |
| `exclusions` | 55 | `scripts/skills-router.py:49` |

Silinseler yönlendirici ve manifest bozulur. **Ölü yük değil, diskte yaşayan kendi verimiz** —
oturum bedeli sıfır olduğu için önceliği de düşük. Temizlik işi olarak da anlamsız.

## 3. Eşik nereye kondu ve niçin

Kapı: `src/__tests__/conformance/skill-yuku-butcesi.test.ts` (4 kol).

1. **Toplam bütçe 20 KB.** Bugün 16.6 KB → ~%20 baş payı. Eşiği bugünün sayısına yapıştırmak
   bir kelime eklenince kırmızı veren, yani bir süre sonra okunmayan kapı üretir; çok yüksek
   tutmak ise büyümeyi hiç göstermez. Baş payı **bir skill'in ortalama bedeli** mertebesinde.
2. **Yeni açıklama tavanı 300 karakter.** Her açıklama her oturumda okunuyor.
3. **Devralınan 18 uzun açıklama adıyla muaf** (en uzunu `maestro` 1157, en kısası
   `skills-creator` 301). Muafiyet **kaçış kapısı olmasın diye** dördüncü kol var: aşan skill
   sayısı bugünün üstüne **çıkamaz**. Kısaltma serbest, yeni muafiyet yasak.
4. **Ölçüm evreni kolu:** dizin boş okunursa kapı "bütçe içinde" diye yeşil verirdi —
   yokluk kanıtı değildir. Kol en az 30 skill okunduğunu doğruluyor.

## 4. Bu ölçüm sırasında kendi düştüğüm tuzak (kayda geçer)

Aşan açıklamaların listesini ilk yazdığımda **kırpılmış çıktıya** güvendim: ölçüm betiğim
listeyi `ilk 8` ile basıyordu, ben de o sekizi tam liste sandım ve muafiyet listesini iki ağacın
adlarını karıştırarak yazdım. **Kapı kendi listemi çürüttü** (1 kol kırmızı, 12 ad eksik/yanlış).
Sayı (18) doğruydu, adlar yanlıştı.

Ders: **kırpılmış çıktı, ölçüm sonucu değildir.** Liste üreten bir ölçümde `slice`/`head`
varsa, karara giden kopya kırpılmamış olanı olmalı.

## 5. Kapsam dışı, adıyla

- 18 uzun açıklamanın **kısaltılması** — içerik işi, ayrı kalem; kapı bugün onları görünür
  tutuyor, kısaltmıyor.
- `.agent/skills` tarafının bütçesi — başka host, başka sahip.
- `when_to_use` (4 skill) ve `license` (8 skill) anahtarlarının kime yaradığı ölçülmedi.
