# PR Base Branch Drift Protokolü

> **Oluşturulma:** 2026-04-19 | **Kaynak:** Surgeon PR #262 deneyimi

## Sorun: Base Branch Drift (Phantom Files)

Jules ajanları bazen master'dan değil, **eski bir master snapshot'ından** branch açar.
Bu durumda PR, gerçek değişikliklere ek olarak aradaki tüm merge commit'lerini de
diff olarak taşır. Sonuç: 7 dosya için +109.000 satır, 1990 değişik dosya gibi
absürd rakamlar görünür.

### Tespit Kriteri

```
gh pr view <NUM> --json additions,deletions,changedFiles
```

Eğer `changedFiles > 50` veya `additions > 5000` iken PR açıklamasında çok daha az
dosya yazıyorsa → **Drift var.**

## Çözüm A — Rebase (TERCİH EDİLEN)

Agent'ın branch'ini master üzerine rebase edip PR'ı olduğu gibi merge et:

```powershell
# 1. Agent branch'ini al
gh pr checkout <NUM>

# 2. Master üzerine rebase et (phantom dosyaları temizle)
git rebase master

# 3. Force-push ile branch'i güncelle
git push --force-with-lease

# 4. PR artık temiz görünür, normal merge yap
gh pr merge <NUM> --merge --delete-branch
```

**Avantajı:** GitHub PR geçmişi temiz kalır, agent'ın branch'i yaşamaya devam eder.

## Çözüm B — Cherry-Pick (YEDEK)

Eğer rebase'de çatışma çıkarsa veya branch çok eski kalmışsa:

```powershell
# 1. Sadece agent'ın gerçek commit'ini tespit et
git log --oneline -5  # Surgeon'ın commit hash'ini bul

# 2. Master'a geç ve tek commit'i cherry-pick et
git switch master
git cherry-pick <COMMIT_HASH> --no-edit

# 3. CI'yı çalıştır
pnpm exec tsc --noEmit; pnpm test -- --run

# 4. Push ve PR'ı kapat (merge değil, close)
git push origin master
gh pr close <NUM> -c "Cherry-picked <HASH> to master due to base branch drift."
```

**Not:** Cherry-pick yaptıktan sonra PR close edilmeli (merge değil), yoksa
GitHub'ın merge butonu phantom dosyaları da master'a çeker.

## Genel Kural

| Durum | Aksiyon |
|---|---|
| `changedFiles < 50` | Normal `gh pr merge` |
| `changedFiles > 50` fakat PR açıklaması az dosya diyorsa | Önce `git show <commit> --stat` ile gerçek değişikliği kontrol et |
| Rebase çatışmasız başarılı | Rebase + normal merge |
| Rebase'de çatışma var | Cherry-pick + PR close |

## Mimari Not

Bu durum Jules'ün bir deficiency'si (eksikliği) değildir. Jules her göreve
başlarken master'ın o anki snapshot'ını alır. Eğer master birden fazla PR
merge'i geçirmişse ve Jules bitmemişse, PR'ı gönderdiğinde drift kaçınılmazdır.
Çözüm Jules'ta değil, Architect'in (Recep/AI) merge stratejisindedir.
