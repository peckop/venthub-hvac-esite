#!/usr/bin/env sh
# =============================================================================
# T086 · Vercel "Ignored Build Step" — build GEREKTİRMEYEN değişiklikleri atla
# =============================================================================
#
# NİÇİN VAR (ölçüm, 2026-08-17): dağıtım tavanının %47'si israftı — altı adet
# SALT-MARKDOWN PR'ı tek başına günlük tavanın %12'sini yakmıştı. Tavan dolunca
# TÜM filo durur; yani doküman commit'i, kod PR'ının önünü kesiyordu.
#
# -----------------------------------------------------------------------------
# ⚠️ ÇIKIŞ KODU SEZGİYE TERSTİR — burada iki kez yazıyorum çünkü ters çevirmek
#    SESSİZCE HER BUILD'İ ATLAR ve kimse fark etmez:
#
#        exit 0  →  build ATLANIR   (ignore)
#        exit 1  →  build ÇALIŞIR   (continue)
#
#    Yani "başarı" (0) burada "yapma" demektir.
# -----------------------------------------------------------------------------
#
# TASARIM: POZİTİF MANTIK, VARSAYILAN "BUILD ET"
#
# Soru "hangi değişiklik build'i ATLAYABİLİR" değil, tersine kurulur:
# **"bu değişiklik build GEREKTİRİR Mİ?"** — ve cevabı bilmiyorsak GEREKTİRİR.
#
# Negatif liste (şunlar build'i tetiklemesin) yazsaydık, listeye eklemeyi
# unuttuğumuz HER YENİ dosya türü sessizce build'i atlardı. Bu, 2026-08-15'te
# yaşanan vitrin kazasının kardeşidir: veri/kod değişti, yüzey değişmedi, ve
# hiçbir kapı görmedi. Burada varsayılan güvenli tarafta: TANIMADIĞIM HER ŞEY
# BUILD'İ TETİKLER. Yalnız aşağıda ADIYLA sayılan sınıf atlanır.
#
# FAIL-SAFE DALLARI (hepsi build'e düşer, hiçbiri atlamaya):
#   · git komutu başarısız olursa            → BUILD
#   · karşılaştırma tabanı bilinmiyorsa      → BUILD
#   · değişen dosya listesi BOŞ çıkarsa      → BUILD   ⬅ vacuous-skip koruması
#
# Sonuncusu kritik: boş liste "hiçbir şey değişmedi" değil, "ölçemedim" demek
# olabilir. Boş kümede "her dosya güvenli" iddiası VACUOUS olarak doğrudur ve
# kapıyı sessizce açar — kapı yazarken tekrar tekrar karşımıza çıkan sınıf.
#
# NİÇİN `VERCEL_GIT_PREVIOUS_SHA`, `HEAD^` DEĞİL:
# Bu değişken **son BAŞARILI dağıtımın** SHA'sıdır (Vercel sistem değişkeni),
# önceki commit değil. Arka arkaya birkaç commit atlanmışsa, `HEAD^` yalnız EN SON
# commit'e bakar ve daha önceki ATLANMAMIŞ OLMASI GEREKEN bir kaynak değişikliğini
# göremez → "kod değişti, deploy olmadı". Son başarılı dağıtımdan bu yana biriken
# TÜM değişiklikler karşılaştırılmalı.
#
# TEST EDİLEBİLİRLİK: birinci argüman verilirse, değişen dosya listesi git yerine
# o dosyadan (satır başına bir yol) okunur. Bekçi (INV-BUILD-SKIP) betiği bu yolla
# gerçek girdilerle ÇALIŞTIRIR — statik tarama değil, davranış ölçümü.
#
# Cetvel: docs/standards/deploy-build-skip-standard.md
# =============================================================================

set -u

# --- Değişen dosya listesini üret ------------------------------------------

if [ "$#" -ge 1 ] && [ -n "${1:-}" ]; then
  # Test kipi: dosyadan oku
  [ -f "$1" ] || { echo "ignore-build: liste dosyasi yok: $1 -> BUILD"; exit 1; }
  CHANGED=$(cat "$1")
else
  BASE="${VERCEL_GIT_PREVIOUS_SHA:-}"
  if [ -z "$BASE" ]; then
    # İlk dağıtım ya da değişken yok: karşılaştıracak taban yok → BUILD.
    echo "ignore-build: VERCEL_GIT_PREVIOUS_SHA yok (ilk dagitim?) -> BUILD"
    exit 1
  fi
  if ! git cat-file -e "${BASE}^{commit}" 2>/dev/null; then
    # Taban bu klonda yok (sığ klon / force-push sonrası) → ölçemiyoruz → BUILD.
    echo "ignore-build: taban commit bulunamadi ($BASE) -> BUILD"
    exit 1
  fi
  CHANGED=$(git diff --name-only "$BASE" HEAD 2>/dev/null) || {
    echo "ignore-build: git diff basarisiz -> BUILD"
    exit 1
  }
fi

# --- Vacuous-skip koruması --------------------------------------------------

if [ -z "$(printf '%s' "$CHANGED" | tr -d '[:space:]')" ]; then
  echo "ignore-build: degisen dosya listesi BOS -> BUILD (olcemedim, atlamiyorum)"
  exit 1
fi

# --- Build GEREKTİRMEYEN sınıf (POZİTİF liste, her biri gerekçeli) ----------
#
#  *.md            → Ölçüldü (2026-08-18): depoda hiçbir kod `.md` import ETMİYOR
#                    ve `next.config.mjs`'te MDX/remark yok. Companion doküman
#                    üretimi de `.md` yazar; bu israfın ana kaynağıydı.
#  docs/**         → Salt doküman ağacı.
#  .claude/** .agent/**
#                  → Ajan yetenek ağaçları; uygulama derlemesine girmez.
#  .github/**      → CI yapılandırması; Vercel çıktısını etkilemez.
#  registry/**     → İş emri kayıtları.
#  LICENSE         → Metin.
#
#  BİLEREK DIŞARIDA (yani build TETİKLER): supabase/migrations/** — build'i
#  doğrudan etkilemez ama önizleme dağıtımı, migration'ın vitrine yansımasını
#  görmenin TEK yoludur; bu depoda migration merge'i prod'a otomatik uygulanır.
#  Ayrıca `.gitignore`, `package.json`, her türlü yapılandırma ve elbette `src/**`.

is_build_irrelevant() {
  case "$1" in
    *.md)            return 0 ;;
    docs/*)          return 0 ;;
    .claude/*)       return 0 ;;
    .agent/*)        return 0 ;;
    .github/*)       return 0 ;;
    registry/*)      return 0 ;;
    LICENSE)         return 0 ;;
    *)               return 1 ;;
  esac
}

# --- Karar: TEK BİR ilgili dosya bile varsa BUILD ---------------------------

# NOT: `printf | while` KULLANILMIYOR — boru hattı `while`'ı alt kabukta koşturur,
# oradaki `exit`/değişken ana kabuğa taşınmaz ve karar sessizce kaybolur. Böyle bir
# hata burada "her şeyi atla" ya da "hiçbir şeyi atlama" olarak geri döner; ikisi de
# sessizdir. IFS'i satır sonuna sabitleyip düz `for` ile yürüyoruz.

NEED_BUILD=0
OLD_IFS=$IFS
IFS='
'
for f in $CHANGED; do
  [ -n "$f" ] || continue
  if ! is_build_irrelevant "$f"; then
    echo "ignore-build: build GEREKTIREN degisiklik: $f -> BUILD"
    NEED_BUILD=1
    break
  fi
done
IFS=$OLD_IFS

if [ "$NEED_BUILD" -eq 1 ]; then
  exit 1
fi

echo "ignore-build: tum degisiklikler build-disi sinifta -> ATLA"
exit 0
