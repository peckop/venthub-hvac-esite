---
name: task-observer
description: >-
  Her çok-adımlı iş oturumunda ARKA PLANDA açık kalan gözlemci: Recep'in düzeltmelerini
  ("çöp dedin, dayanağın ne?"), tekrarlayan akışları, bir skill'in çiğnenen kuralını, işe yarayan
  ama hiçbir skill'de olmayan yöntemi yakalar ve `docs/skill-gozlemleri/` altına TEK DOSYALIK
  gözlem olarak yazar; haftalık incelemede hangisi yeni skill / hangisi mevcut skill'e kural olur
  karar verilir. Tetikleyiciler: oturum başında ilk araç çağrısından önce (sessizce), "gözlem
  yaz", "bunu not al, skill olsun", "skill gözlemleri", "haftalık skill incelemesi", bir
  düzeltmeden sonra "bir daha olmasın". Yeni skill YAZMAZ (→ skills-creator); kod yazmaz. Sıradan
  sohbet ve araçsız tek-olgu sorularında pasif.
---

# Task Observer — sürekli skill keşfi ve iyileştirmesi

> **KAYNAK:** Eoghan Henn / rebelytics, "One Skill to Rule Them All" — CC BY 4.0,
> github.com/rebelytics/one-skill-to-rule-them-all (2026-09-08 okundu: SKILL.md + signals.md).
> **ALINAN:** "sürtünmeyi iş sırasında not al, sonra incele" yöntemi; gözlem = ayrı dosya +
> frontmatter; "logla / loglama" sinyal kataloğunun özü; haftalık inceleme fikri; aynı-tur
> yazma kuralı. **BİZDEN:** depo-içi konum (`docs/skill-gozlemleri/`), OPS gün-kapanışı bağı,
> Kararlar-defteri ve CLAUDE.md-kuralı ile ilişki, Türkçe alanlar, referans dosyaları YOK
> (tek dosya). Kaynağın `~/.claude/projects` anchor'ı, `PENDING.md` staging'i, migration ve
> starter-principles katmanları alınmadı.

## Niçin var

CLAUDE.md'deki her kural bir arızadan doğdu ve **hepsi elle yazıldı** — biri hatırladığı için.
Bugün (2026-09-08) iki örnek: "ölçmeden 'çöp' dedin" düzeltmesi ve "içeriği mi alıyorsun, bizden
mi, ayırt edemiyorum" sorusu. İkisi de genelleşen kural; ikisi de bir yere yazılmasa oturum
compact'ında kaybolacaktı. `skills-creator` skill *yazar* ama tetiği insan; eylem defteri
*eylemi* kaydeder, *dersi* değil. Bu skill dersi yakalar.

## Ne gözlem DEĞİLDİR

Tek seferlik, genelleşmeyen düzeltme · zaten bir skill/cetvelde yazılı tercih · yöntemle ilgisi
olmayan araç hatası · müşteri/iş sırrı gerektiren şey. **Genelleşme testi:** başka projede, aynı
skill'le başka işte hâlâ anlamlı mı? Eksik bir kural/adım/ilke mi adlandırıyor, yoksa bu işi mi
düzeltiyor? Tekrar eder mi? Çoğu "hayır" → gözlem değil, iş bağlamı.

## Ne yakalanır

- **Yeni skill adayı:** tekrar eden çok-adımlı akış; Recep'in "ben hep şöyle yaparım" dediği
  yöntem; hiçbir skill'in kapsamadığı iş tipi.
- **Mevcut skill'e kural:** ajan skill'in yazılı kuralını çiğnedi (kural değil **zorlama**
  eksik) · Recep'in düzeltmesi eksik kuralı/uç durumu gösterdi · daha iyi bir teknik çıktı ·
  yanlış varsayım · yeni araç bir adımı gereksiz kıldı.
- **Sadeleştirme:** çok oturumda hiç kullanılmayan bölüm · tek gözleme dayanan doğrulanmamış
  kural · çelişen kurallar · ajanın sürekli çiğnediği kural (yapısal zorlamaya çevir ya da sil).
- **Çözülmemiş kusur, sınırlı noktada:** teslimatın kendisi olmayan bir arıza oturumu yutuyorsa
  ikinci hipotezden ÖNCE dur; belirti + elenenler + en ucuz sonraki test'i gözlem olarak yaz,
  teslimata dön.

## Oturum protokolü

1. **Başlangıç (sessiz):** `docs/skill-gozlemleri/` var mı (yoksa oluştur: `acik/`, `arsiv/`,
   `son-inceleme.txt` = `hic`). `acik/*.md` dosyalarının yalnız frontmatter'ını tara (gövde
   değil) — farkındalık için, konuşmaya sokma. `son-inceleme.txt` `hic` ya da 7 günden eskiyse ve
   açık gözlem varsa **tek satırla** incelemeyi öner; Recep'in işini bekletme.
2. **İş sırasında:** sinyal göründüğü **aynı turda** yaz (sonraya bırakılan gözlem yazılmaz).
   Dosya: `docs/skill-gozlemleri/acik/YYYY-MM-DD-<kisa-slug>.md`. Yazmadan önce `skill:` alanı
   gerçekten var olan bir skill mi kontrol et; yoksa `onerilen_skill:` kullan.
3. **Bitiş:** oturumda yazılan gözlem sayısını kapanış özetine bir satırla ekle.

## Gözlem dosyası

```markdown
---
baslik: Ölçmeden hüküm verme ("çöp" vakası)
durum: acik            # acik | kabul | red | uygulandi
tur: kural             # yeni-skill | kural | sadelestirme | kusur
skill: office-hours    # var olan skill; yoksa onerilen_skill: <ad>
tetik: recep-duzeltme  # recep-duzeltme | tekrar | kural-ihlali | daha-iyi-yol | varsayim
oturum: 0df102e3 · 2026-09-08
---
**Ne oldu:** Repo köküne düşen pano dosyalarına bakmadan "çöp" dedim; Recep dayanak sordu.
**Genelleşen ders:** Bir şeyi sınıflandırmadan önce OKU; "hüküm = ölçüm + dosya:satır".
**Önerilen değişiklik:** office-hours "Öncül çürütme" başına: "Adlandırmadan önce ölç" satırı;
CLAUDE.md'ye girmesi Recep kararı.
**Kanıt:** oturum 0df102e3, 2026-09-08 sabah; PR #1116 tartışması.
```

## Haftalık inceleme (OPS gün kapanışına bağlı)

OPS-AUDIT şeridi haftada bir (ya da Recep "skill incelemesi" deyince) `acik/` klasörünü okur:
her gözlem için **kabul / red / birleştir** kararı; kabul edilen `kural` → ilgili SKILL.md'ye
satır (PR), `yeni-skill` → `skills-creator` emri (KAYNAK/CETVEL bloğuyla), CLAUDE.md'ye
girecek olan → Recep onayı (REC-*). Karar verilen dosya `arsiv/`e taşınır, `durum` güncellenir,
`son-inceleme.txt`'e tarih yazılır. **Red de kayıttır** — aynı gözlem tekrar açılmasın.

## Kesin kurallar

Aynı turda yaz · gövde değil frontmatter tara · skill adını yazmadan önce doğrula · yeni skill
YAZMA (öner) · CLAUDE.md'ye kendi başına kural ekleme · gözlem müşteri verisi içermez (repo
public) · red edilen gözlem silinmez, arşivlenir.
