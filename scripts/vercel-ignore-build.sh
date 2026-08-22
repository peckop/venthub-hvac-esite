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
# KARŞILAŞTIRMA TABANI — ÖLÇÜLDÜ, TAHMİN EDİLMEDİ (2026-08-18, PR #664):
#
# v1 yalnız `VERCEL_GIT_PREVIOUS_SHA`'ya bakıyordu ve bu değişkenin DOLU GELECEĞİ
# VARSAYILMIŞTI. İlk canlı ölçüm bunu çürüttü — salt-Markdown bir PR'da dağıtım
# günlüğü aynen şunu yazdı:
#
#     Running "sh scripts/vercel-ignore-build.sh"
#     ignore-build: VERCEL_GIT_PREVIOUS_SHA yok (ilk dagitim?) -> BUILD
#
# Değişken **o dal için son BAŞARILI dağıtımın** SHA'sıdır; YENİ bir dalın İLK
# dağıtımında böyle bir şey yoktur, yani boş gelir. Bu depoda kural "bir-iş-bir-dal"
# olduğu için neredeyse HER önizleme dağıtımı bir dalın ilk dağıtımıdır → atlama
# fiilen HİÇ çalışmıyordu. Betik güvenli tarafa düştüğü için hiçbir kırmızı üretmedi;
# yani kusur SESSİZDİ ve ancak günlüğe bakınca görüldü. (Kapı da göremezdi: bekçi
# betiği dosya-listesi kipinde koşturuyor, taban çözümü o yoldan hiç geçmiyor.)
#
# TABAN ZİNCİRİ (ilk çözülen kazanır, hiçbiri çözülmezse BUILD):
#   1. `VERCEL_GIT_PREVIOUS_SHA` — en doğrusu: son başarılı dağıtımdan bu yana
#      biriken TÜM değişiklikler. Yalnız bu klonda GERÇEKTEN varsa kullanılır.
#   2. Varsayılan dalla ORTAK ATA (`git merge-base HEAD origin/<varsayılan>`) —
#      dalın TAMAMINI kapsar, yani dalın içindeki eski bir kaynak değişikliği de
#      görülür. (1) yoksa doğru taban budur.
#
# `HEAD^` HÂLÂ YASAK ve gerekçesi değişmedi: yalnız EN SON commit'e bakar; arka
# arkaya atlanmış commit'lerden sonra daha eski bir kaynak değişikliğini göremez →
# tam olarak "kod değişti, deploy olmadı", yani 2026-08-15 vitrin kazasının sınıfı.
# Zincirin 2. adımı bu tuzağa düşmez çünkü ortak ata, dalın tamamını kapsar.
#
# Zincirin HANGİ adımının kazandığı günlüğe YAZILIR — bir sonraki dağıtımın kaydı,
# bu düzeltmenin işe yarayıp yaramadığını tahmin ettirmez, GÖSTERİR.
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
  BASE=""

  # --- Zincir 1: son BASARILI dagitimin SHA'si ---
  if [ -n "${VERCEL_GIT_PREVIOUS_SHA:-}" ]; then
    if git cat-file -e "${VERCEL_GIT_PREVIOUS_SHA}^{commit}" 2>/dev/null; then
      BASE="$VERCEL_GIT_PREVIOUS_SHA"
      echo "ignore-build: taban = VERCEL_GIT_PREVIOUS_SHA ($BASE)"
    else
      # Degisken dolu ama commit bu klonda YOK (sig klon / force-push).
      # Sessizce gecme: hangi adimin nicin dustugunu gunluge yaz.
      echo "ignore-build: VERCEL_GIT_PREVIOUS_SHA klonda bulunamadi ($VERCEL_GIT_PREVIOUS_SHA) -> ortak ataya dusuyorum"
    fi
  else
    echo "ignore-build: VERCEL_GIT_PREVIOUS_SHA bos (dalin ilk dagitimi) -> ortak ataya dusuyorum"
  fi

  # --- Zincir 2: varsayilan dalla ORTAK ATA ---
  if [ -z "$BASE" ]; then
    DEFAULT_BRANCH="${VERCEL_GIT_REPO_DEFAULT_BRANCH:-master}"
    REMOTE_REF="origin/$DEFAULT_BRANCH"

    if ! git rev-parse --verify --quiet "$REMOTE_REF" >/dev/null 2>&1; then
      # Sig klon varsayilan dali tasimayabilir. Sinirli bir cekme DENENIR;
      # basarisiz olursa hata DEGIL, yalnizca taban cozulemez -> BUILD.
      git fetch --no-tags --depth=50 origin         "+refs/heads/$DEFAULT_BRANCH:refs/remotes/origin/$DEFAULT_BRANCH" >/dev/null 2>&1 || true
    fi

    if git rev-parse --verify --quiet "$REMOTE_REF" >/dev/null 2>&1; then
      MERGE_BASE=$(git merge-base HEAD "$REMOTE_REF" 2>/dev/null) || MERGE_BASE=""
      HEAD_SHA=$(git rev-parse HEAD 2>/dev/null) || HEAD_SHA=""
      if [ -z "$MERGE_BASE" ]; then
        echo "ignore-build: ortak ata bulunamadi ($REMOTE_REF) -> BUILD"
        exit 1
      fi
      if [ "$MERGE_BASE" = "$HEAD_SHA" ]; then
        # HEAD zaten varsayilan dalin ucu (uretim dagitimi). Kendisiyle
        # karsilastirmak BOS liste uretir ve bos liste ATLAMA gerekcesi DEGILDIR.
        echo "ignore-build: HEAD varsayilan dalin ucu, karsilastirilacak taban yok -> BUILD"
        exit 1
      fi
      BASE="$MERGE_BASE"
      echo "ignore-build: taban = $REMOTE_REF ile ortak ata ($BASE)"
    else
      echo "ignore-build: $REMOTE_REF bu klonda yok -> BUILD"
      exit 1
    fi
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
