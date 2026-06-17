# Çok-Ajan İşbirliği Protokolü

> **Bu dosya nedir?** Bu repoda birden fazla LLM/ajan aynı anda çalışıyor
> (**Claude Code = Controller**; **Antigravity CLI + diğer LLM'ler = Worker**). Bu dosya
> hepsinin uyduğu **ortak kural setidir** — ki herkes aynı doğrultuda çalışsın.
> **Brief'ler bu kuralları TEKRAR ETMEZ, buraya REFERANS verir.**
>
> İlgili: `CLAUDE.md` (VentHub mutlak kuralları) · `docs/DURUM-TAKIP.md` (canlı "neredeyiz" panosu).

---

## 0. Roller

| Rol | Kim | Yetki |
|---|---|---|
| **Controller** | Claude Code | Brief yazar · deterministik kapıyı **kendi** vurur · commit/PR/**merge** · **tek "içeri alma" yetkisi** |
| **Worker** | Antigravity CLI / diğer LLM | İşi/brief'i uygular · **kendi dalında** üretir · push eder · **DURUR** · master'a merge **ETMEZ** |
| **Human** | Recep | Ajanlar arası relay + onay · **production'a uygulama yalnız onun açık komutuyla** |

---

## 1. Bir-İş-Bir-Dal (ZORUNLU)

- Her iş **master'dan TAZE dal** açar. İsim: `feat/<konu>` (kod) · `docs/<konu>` (yalnız doküman) · `fix/<konu>`.
- Bir ajan **SADECE kendi işine** dokunur. **Başka ajanın dosyasına DOKUNMA** — paylaşılan working-tree'de çakışma = felaket. Yalnız kendi dosyalarını stage'le/commit'le.
- İki ajan aynı anda = **iki AYRI dal**. Yığma yasak (hızlı producer controller'ı geçse bile her bağımsız iş master'dan taze dala → tangled mega-PR yok).
- **Master'a yalnız Controller**, kapı yeşilse merge eder.

---

## 2. İş Akışı (değişmez sıra)

```
iş/brief → Worker üretir → push → DURUR
        → Controller: deterministik kapı + ilgili cetvel → diff'ten DOĞRULA
        → yeşilse: commit + PR + master'a merge
```

- **"Worker geçti dedi" ≠ güven.** Controller her zaman diff + kapıyı **kendi** doğrular.
- Kırmızıysa → aynı dala düzeltme commit'i; **merge YOK**.

---

## 3. Deterministik Kapı (Controller vurur)

- **Kod:** `pnpm type-check` 0 · `pnpm lint` 0 · `pnpm test -- --run` geçer · `pnpm build` yeşil (RSC/prerender sınırı) · axe 0
- **+ İşin cetveli:** admin sayfası → `admin-standard.md §8` · admin shell → `§10.4` · (yeni domain → kendi standardı)
- Cetvel eşiği **brief'te yazılı** (ör. §10.4 ≥ 15/17). Brief = ilgili standardın uygulama izdüşümü.

---

## 4. Standart-Önce (No-Standard-No-Code)

- **Cetvel olmadan kod yok.** Cetvel **gerçek kaynaktan** üretilir (provenance tablosu), Claude'un/Worker'ın uydurması değil.
- Yeni domain → önce `docs/standards/*` standardı → ölç (`docs/audits/*`) → uygula.
- Kontrol = **cetvel (docs/standards) + onu zorlayan conformance testi** (INV-*). Page-crash sınıfı bulgular INV testine terfi eder.

---

## 5. Mükerrerlik Yasağı

- Eklemeden önce **"bu zaten var mı?"** → CodeGraph/grep ile kontrol et. Var olanı **SAR**, kopya sorgu/komponent yazma.
- Yeni dosya = **dağınıklığı toplama / eksik doldurma**; mevcut bir şeyin kopyası DEĞİL.

---

## 6. Doküman Kuralları (MD üreten HER ajan için — özellikle doküman Worker'ları)

- **Her konunun TEK SSOT'u var** (drift önlemi). Diğer dosyalar **referans** verir, içeriği tekrar etmez.

| Konu | SSOT |
|---|---|
| Admin **NASIL** kurulur (yapısal cetvel) | `docs/standards/admin-standard.md` |
| Admin **NE** olmalı (yetenek/enterprise açık) | `docs/standards/admin-capabilities.md` |
| Bayi domain / blueprint | `docs/standards/dealer-network-standard.md` · `dealer-module-blueprint.md` |
| Müşteri-hesap UX (yazılacak) | `docs/standards/customer-account-standard.md` |
| Canlı durum ("neredeyiz") | `docs/DURUM-TAKIP.md` |
| **İşbirliği kuralları (bu dosya)** | `docs/standards/collaboration-protocol.md` |
| Uçtan-uca kapsamlı referans | `CONTEXT.md` (**NotebookLM üretir — elle yeniden yazma**) |

- **Gereksiz dosya yasak.** Yeni MD açmadan önce: konunun SSOT'u **var mı?** Varsa oraya **bölüm ekle**, yeni dosya açma.
- İş bitince **`DURUM-TAKIP.md` güncellenir** (tek "neredeyiz" panosu).
- Türkçe birincil, İngilizce ikincil. Commit mesajı **konvansiyonel + Türkçe** (`docs(...)`, `feat(...)`, `fix(...)`).
- **NLM twin sync = MILESTONE** (her commit değil): auth tazele → sync → `notebook_query` ile **DOĞRULA**. Yeni önemli standart/audit `.cc_docs.yaml` `standalone_files`'a eklenmeli, yoksa twin görmez.

---

## 7. VentHub Mutlak Kuralları (her ajan için bağlayıcı)

- `CLAUDE.md` #1–12: **No-Plan-No-Code · DI** (servisler ilk param `supabase`) **· no-`any`** · RSC-öncelik · PPR/Suspense · i18n (metin sözlükten, URL `useLocalizedRoutes`) · **design-token** (arbitrary Tailwind/HEX yasak) · 3D = R3F+Drei · **RLS/tenant-scope** · webhook HMAC + monoton durum · admin `admin_audit_log`. **İhlal = ret.**

---

## 8. Branch Hijyeni

- post-commit `docs/system_tree.md` churn'ü **commit'e ALINMAZ** (`git checkout -- docs/system_tree.md`).
- Bir iş bitmeden ikincisine başlama; **dallar karışmasın**.
- `.agent/skills/` (Antigravity) ile `.claude/skills/` (Claude Code) **ayrı ve kasıtlı** — birini diğerine dokundurma/birleştirme.

---

*SSOT: bu dosya. Controller = Claude Code · Worker = Antigravity CLI / diğer LLM · onay & relay = Recep.*
