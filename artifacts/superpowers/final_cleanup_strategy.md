## Goal
Vite, Vitest ve react-router-dom kal?nt?lar?n? tamamen temizleyip %100 Next.js 14 mimarisine ge?mek.

## Constraints
- Build Integrity (Next build hatas?z olmal?).
- App Router Exclusive (src/pages silinmeli).

## Risks
1. Testlerin (react-router-dom ba??ml?l??? y?z?nden) k?r?lmas?.
2. Alias/Config ?ak??malar?.

## Recommendation
Se?enek 1 (Surgical Cleanup). Dosyalar? imha et, testleri modernize et, lockfile'? yenile.

## Acceptance criteria
1. src/pages silindi.
2. vite.* ve vitest.* dosyalar? silindi.
3. react-router-dom importu kalmad?.
4. Build ba?ar?l?.
