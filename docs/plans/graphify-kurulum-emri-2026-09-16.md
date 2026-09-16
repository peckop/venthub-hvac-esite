# graphify kurulum emri — ALTYAPI'ya, ölçülmüş ve tahminsiz

**Tarih:** 2026-09-16 · **Yazan:** URUN · **Koşacak:** ALTYAPI
**Recep onayı (aynen):** *"tam olarak graphify kur hayata geçir."* → sonra: *"tamam gerekeni
ver altyapı yapsın."*
**Cetvel:** `docs/standards/hukum-kaynak-standard.md` (bu belgedeki her satır A sınıfı — kaynak
kodu bugün okundu, dosya:satır verildi)
**YÖNTEM:** elle, tek komut. Şerit devri sebebi: hedef dosyalar (`.claude/**`, `CLAUDE.md`)
ALTYAPI şeridinde; URUN oraya yazmaz.

---

## 0 · KOŞULACAK KOMUT — tam olarak bu

```bash
cd <ana depo ya da worktree kökü>
graphify extract . --code-only      # ÖN ŞART, aşağıda niçin
graphify install --project --platform claude
```

⛔**`--strict` VERİLMEYECEK.** Gerekçesi §3'te, Recep'e sunuldu ve kabul edildi.

---

## 1 · ÖN ŞART — grafik olmadan kurulum ÖLÜ gelir

Kancalar grafik dosyası yoksa **hiçbir şey yapmaz** (`cli.py:814-832`, fail-open: hata ya da
eşleşmeyen çağrı = çıktı yok, exit 0). Yani `install` tek başına koşarsa araç kurulu görünür
ama hiç çalışmaz — bugün konuştuğumuz "atıl araç" durumunun aynısı doğar.

`graphify extract . --code-only` ölçülmüş maliyeti (REC-313, 2026-09-13): **56,3 sn**,
16 işçi paralel AST, **0 model çağrısı**, 9.002 düğüm, 17.885 kenar, kenarların
**%100'ü** `_origin: ast` (LLM payı sıfır).

Çıktı dizini `graphify-out/` **zaten `.gitignore` satır 144'te** — commitlenmiyor, üretilmiş
artefakt sayılıyor. Yani grafiği **her makinede bir kez** üretmek gerekir; CI'da üretilmediği
için kancalar CI'da sessiz kalır (fail-open, zarar yok).

---

## 2 · KURULUMUN ÜÇ ETKİSİ — üçü de kaynak kodundan okundu

### 2.1 · Skill dosyası

`.claude/skills/graphify/SKILL.md` + `references/` kopyalanır (`install.py:1624`,
`_copy_skill_file`). Sonuç: `/graphify` komutu kullanılabilir hâle gelir.

### 2.2 · `CLAUDE.md`'ye marker'lı bölüm — ⚠ **kök CLAUDE.md**

`install.py:1778-1794` (`claude_install`): hedef `project_dir / "CLAUDE.md"`, yani **proje kök
kural dosyamız.** Yazım şekli `_replace_or_append_section(content, _CLAUDE_MD_MARKER, …)` —
marker'lı bir bölüm, varsa **değiştirilir**, yoksa **sonuna eklenir.** İçerik
(`_skill_registration`, `install.py:352-359`) üç satır:

```
# graphify
- **graphify** (`<skill yolu>`) - any input to knowledge graph. Trigger: `/graphify`
When the user types `/graphify`, use the installed graphify skill or instructions before doing anything else.
```

⭐**Bu dosya bizim en hassas dosyamız** ve normalde akran isteğiyle düzenlenmez. Buradaki
yetki **akrandan değil, Recep'in açık onayından** geliyor (yukarıda aynen alıntılı).
İçerik değişmemişse araç *"already configured … (no change)"* basıp dosyaya dokunmuyor.

### 2.3 · `.claude/settings.json`'a iki `PreToolUse` kancası

`install.py:1806-1830` (`_install_claude_hook`) + `install.py:324-352`
(`_claude_pretooluse_hooks`):

| matcher | komut | davranış |
|---|---|---|
| `Bash\|Grep` | `graphify hook-guard search` | yumuşak dürtme |
| `Read\|Glob` | `graphify hook-guard read` | yumuşak dürtme |

`--project` verildiği için komut **çıplak** yazılır (`graphify …`, mutlak yol değil) — kodun
kendi gerekçesi: bu yapılandırma commitlenir ve kuran makinenin yolu başkasında yanlış olur
(#3129). Bu bizim mutlak-yol alışkanlığımızla çelişir ama burada **doğru olan çıplak ad**.

### ⭐2.4 · MEVCUT KANCALARIMIZ GÜVENDE — ölçüldü, varsayılmadı

Araç yalnız şu koşulu sağlayan girdileri siler (`install.py:1824`): matcher'ı
`Glob|Grep` · `Bash` · `Bash|Grep` · `Read|Glob` **olan** VE içinde `graphify` kelimesi
**geçen** girdiler.

Bugün `.claude/settings.json`'daki `PreToolUse` girdileri sayıldı: **2 tane.**

| matcher | içinde "graphify" | sonuç |
|---|---|---|
| `Edit\|Write\|MultiEdit` | yok | **korunur** |
| `Bash` | yok | **korunur** |

İkisi de silme koşulunu sağlamıyor. ⚠Yine de araç `_write_settings_with_backup` ile
**yedek alıyor** (`install.py:1830`); koşumdan sonra iki girdinin yerinde olduğu
**tekrar ölçülmeli** — "kod böyle yazıyor" ile "dosyada böyle oldu" ayrı şeylerdir.

---

## 3 · `--strict` NİÇİN VERİLMİYOR

`--strict` ne yapar (`cli.py:55-70`, `cli.py:814-840`, `cli.py:934`): `Read` kancasına
`--strict` eklenir; oturumun **ilk** ham dosya okuması `permissionDecision: deny` ile
engellenir ve *"önce `graphify query` koş"* denir.

Sınırları kodda yazılı ve dar: oturum başına **en fazla bir kez**
(`_mark_session_denied`) · yalnız `Read` (Bash ve Glob dürtme-only kalır, çünkü bileşik
kabuk komutunun tek ayrıştırılabilir hedefi yok ve dosya listelemeyi bloklamak gezinmeyi
kilitler) · yalnız **proje içi** + grafikte **indeksli** + **taze** dosya · grafik o dosya
için bayatsa bloklamıyor, yumuşak dürtmeye düşüyor · kodun kendi yorumu:
*"can never strand the agent."*

**Yani `--strict` tehlikeli değil.** Verilmemesinin sebebi risk değil, **fayda yokluğu:**

> graphify **yalnız kodu** görüyor. REC-313 ölçümü: **252 SQL dosyasını hiç görmedi.**

2026-09-16'da URUN'un beş geri alınan hükmünün hepsi ya **veritabanı şeması** ya **belge**
okumamaktan çıktı — ikisi de graphify'ın kapsamı dışında. `--strict` o beş hatanın
**hiçbirini** engellemezdi; yalnız her oturumda kod okumaya bir tur ek yükleyecekti.

Çevrim içi anahtar var: `GRAPHIFY_HOOK_STRICT=1` ile yeniden kurulum yapmadan açılabilir
(`cli.py:675-680`). Yani karar geri alınabilir, kalıcı değil.

---

## 4 · BENİMSENMEYECEKLER (REC-313 hükmü, geçerli)

| Kalem | Sebep |
|---|---|
| `query` | Beş soruda **0 isabet** (3 yanlış, 2 eksik); başlangıç düğümünü kelime eşlemesiyle seçiyor ve Türkçe yorumlara çarpıyor |
| `--strict` | §3 — fayda yok, kapsam dışı |
| `--postgres` | Prod DB'ye dokunuyor; bu şeritte prod yazma yasak |

**Kullanılacak üç komut:** `affected <ad>()` (ikinci, bağımsız "nereye dokunur" görüşü;
ölçüldü **0,7 sn** ve **DOĞRU**) · `god-nodes` (paylaşılan-primitif riski, bizde karşılığı
yok) · `diagnose multigraph` (grafik sağlığı).

⚠`affected` **parantez gerektiriyor**: `productRoute` → *"No unique node match"*,
`productRoute()` → doğru cevap. Bu kullanım bilgisi hiçbir belgede yazılı değil, ölçümle
bulundu — skill dosyasına eklenmeye değer.

**codegraph'ın yerine değil YANINA.** Sebep tercih değil ölçüm: codegraph birebir kaynak ve
gerekçe döndürüyor, graphify düğüm adı döndürüyor.

---

## 5 · KOŞUMDAN SONRA YAPILACAKLAR

1. **Ölç, varsayma:** `.claude/settings.json`'da `PreToolUse` girdi sayısı **4** olmalı
   (bizim 2 + graphify 2) ve `Edit|Write|MultiEdit` ile `Bash` girdileri **yerinde** olmalı.
2. **`CLAUDE.md` diff'ini gözden geçir** — eklenen bölüm üç satır olmalı, fazlası varsa dur.
3. **Araç envanteri:** `node scripts/hijyen/arac-envanteri.cjs --yaz`, sonra yeni satırın
   durum/sahip alanlarını elle doldur (AXIOM 3). Yoksa `INV-ARAC-1` CI'da kırmızı verir.
4. **Aynı envanter borcu PR #1213'te de var:** `docs/standards/hukum-kaynak-standard.md`
   ilan edilmemiş; `commit-uyari` kancası söyledi, URUN asmadı ve yazmadı.
5. **Geri alma yolu hazır:** `graphify uninstall --project` — `CLAUDE.md` bölümünü,
   skill dosyasını ve kancaları kaldırıyor; `settings.local.json`'ı da temizliyor
   (`install.py:1832-1845`).

---

## 6 · BU EMRİN SINIRLARI (adıyla)

1. **Kurulum KOŞULMADI.** Buradaki her satır kaynak kodu okumasıdır, koşum sonucu değil.
   Dosyalarda ne olduğu ancak §5.1 ölçümüyle bilinir.
2. **`extract` süresi başka makinenin ölçümü** (REC-313, 56,3 sn). Bu makinede yeniden
   ölçülmedi — B sınıfı kaynak.
3. **Ağ trafiği dinlenmedi.** REC-313 telemetri taramasını *statik okuma* olarak yaptı ve
   sınırını adıyla yazdı; bu emir o sınırı devralır.
4. **`query`'nin 0 isabeti tek koşumluk.** Beş soru, her biri bir kez. Eğilim değil.

İlgili: REC-313 · REC-310
