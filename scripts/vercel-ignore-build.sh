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
      # Sig klon varsayilan dali tasimaz. Cekme DENENIR.
      #
      # ⭐2026-08-27 — BU BLOK SESSIZDI VE ATLAMAYI ON GUN BOYUNCA OLDURDU.
      # Onceki surum ciktiyi '>/dev/null 2>&1 || true' ile yutuyordu. Uretimde
      # cekme HER SEFERINDE basarisiz oluyordu ve gunluge 'origin/master bu
      # klonda yok -> BUILD' disinda hicbir sey dusmuyordu; yani NIYE olmadigi
      # HIC yazilmadi. Olcum (Vercel build gunlukleri, uc ayri dagitim:
      # d9f31989 TEMIZLIK companion · f4c5c25f ALTYAPI 18 companion ·
      # 304a1785 I18N varyant): UCUNDE DE ayni iki satir, yani pozitif sinif
      # listesi BIR KEZ BILE degerlendirilmedi. Salt-.md push'lar tam da bu
      # yuzden dagitim yakti — liste kusuru degil, TABAN kusuruydu.
      #
      # DERS: fail-safe dogru olabilir ama SESSIZ fail-safe olcumu oldurur.
      # Kapi da bunu goremezdi: "origin/master yoksa BUILD" kolu YESILDI —
      # dogru davranisi sinar ama o dalin URETIMDE TEK yol oldugunu sormaz.
      # Bu yuzden buradaki her deneme SEBEBIYLE birlikte gunluge yazilir.
      # ⭐GORUNURLUK ONARIMI ILK KOSUMDA CEVABI VERDI (dagitim 5cjXTJWY, 2026-08-27):
      #     ignore-build: refspec cekmesi basarisiz -> fatal: 'origin' does not appear to be a git repository
      # Yani sorun refspec bicimi ya da derinlik DEGIL: Vercel'in klonunda `origin`
      # UZAGI HIC YOK. Bu yuzden "origin"e yapilan HICBIR cekme tutamazdi ve on gun
      # boyunca tutmadi. Uzagi kendimiz kurariz — depo PUBLIC oldugu icin kimlik
      # gerekmez (CLAUDE.md: repo 2026-08-15'ten beri public).
      UZAK_URL=""
      if git remote get-url origin >/dev/null 2>&1; then
        UZAK_URL="origin"
      elif [ -n "${VERCEL_GIT_REPO_OWNER:-}" ] && [ -n "${VERCEL_GIT_REPO_SLUG:-}" ]; then
        UZAK_URL="https://github.com/${VERCEL_GIT_REPO_OWNER}/${VERCEL_GIT_REPO_SLUG}.git"
        echo "ignore-build: origin uzagi yok, URL ortamdan kuruldu ($UZAK_URL)"
      else
        echo "ignore-build: origin uzagi YOK ve VERCEL_GIT_REPO_OWNER/SLUG bos -> cekilemez"
      fi

      if [ -n "$UZAK_URL" ]; then
        CEKME_HATA=$(git fetch --no-tags --depth=50 "$UZAK_URL" \
          "+refs/heads/$DEFAULT_BRANCH:refs/remotes/origin/$DEFAULT_BRANCH" 2>&1) || {
          echo "ignore-build: refspec cekmesi basarisiz -> $(printf '%s' "$CEKME_HATA" | head -n 1)"
        }
      fi
    fi

    # Ikinci deneme: duz cekme + FETCH_HEAD. Refspec bicimi bazi sig klonlarda
    # reddedilebiliyor; ayni sonucu farkli yoldan istemek ucuz ve fail-safe.
    if ! git rev-parse --verify --quiet "$REMOTE_REF" >/dev/null 2>&1 && [ -n "${UZAK_URL:-}" ]; then
      CEKME_HATA=$(git fetch --no-tags --depth=50 "$UZAK_URL" "$DEFAULT_BRANCH" 2>&1) && {
        if git rev-parse --verify --quiet FETCH_HEAD >/dev/null 2>&1; then
          REMOTE_REF="FETCH_HEAD"
          echo "ignore-build: duz cekme tuttu, taban referansi = FETCH_HEAD"
        fi
      } || {
        echo "ignore-build: duz cekme de basarisiz -> $(printf '%s' "$CEKME_HATA" | head -n 1)"
      }
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
#  scripts/board/**→ Şerit panosu araçları. ÖLÇÜLDÜ (2026-08-26, taze master):
#                    package.json, next.config.mjs, vercel.json ve .github/workflows/*
#                    içinde "scripts/board" geçen TEK BİR referans yok. Derleme
#                    hattına hiçbir yerden girmiyor. Ölçüm pozitif kontrolle
#                    yapıldı: aynı komut "scripts/setup-hooks" için referans
#                    BULUYOR, yani arama gerçekten arıyordu.
#  .githooks/**    → Git kancalarının KENDİSİ (kancaları KURAN betik değil).
#                    Burada dürüst olmak gerek: bu sınıfın derleme hattıyla bir
#                    bağı VAR — package.json "prepare": "node scripts/setup-hooks.mjs"
#                    ve Vercel `pnpm install` koştuğu için prepare de koşar.
#                    Yine de atlanabilir, ÜÇ ölçülmüş sebeple:
#                      1. Koşan dosya `scripts/setup-hooks.mjs`, `.githooks/**`
#                         DEĞİL — o betik kancaları OKUR. Betiğin kendisi bu
#                         listede değil, yani ona dokunmak build'i TETİKLER.
#                      2. setup-hooks.mjs FAIL-SAFE: kancalar bozuk ya da yokken
#                         sessizce exit 0 veriyor (kaynakta catch → process.exit(0)).
#                         Yani bozuk bir kanca `pnpm install`i düşürmüyor.
#                      3. Kancalar `.git/hooks`a kopyalanır; DAĞITILAN ÇIKTIYA
#                         hiçbir şey yazmaz.
#                    ARTIK RİSK ve NEDEN KABUL EDİLEBİLİR: atlarsak, bir
#                    `.githooks` değişikliğinin Vercel'in install adımını bozup
#                    bozmadığını o dağıtımda ÖĞRENEMEYİZ. Bu boşluğu CI kapatıyor:
#                    `.github/workflows/ci.yml`de YOL FİLTRESİ YOK (ölçüldü), yani
#                    her PR'da `pnpm install` zaten koşuyor ve bozuk bir prepare
#                    orada kırmızı verir. Atlama CI kapılarını KÖRLEŞTİRMİYOR.
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
    # DİKKAT — kapsam DAR tutuldu: `scripts/*` DEĞİL `scripts/board/*`.
    # `scripts/vercel-ignore-build.sh` (bu betik) ve `scripts/setup-hooks.mjs`
    # derleme hattının parçası; onlara dokunmak build'i TETİKLEMELİ.
    # Sondaki `/` de kasıtlı: `scripts/board*` yazsaydık `scripts/boardfake.ts`
    # de sessizce atlanırdı.
    scripts/board/*) return 0 ;;
    # scripts/hijyen/** — TEMIZLIK seridinin agac-hijyeni araclari (kirli sayaci,
    # agac-silme kapisi). scripts/board/* ile ayni gerekce ve ayni olcum: derleme
    # hattinda (package.json, next.config.mjs, .github/workflows/*) "scripts/hijyen"
    # gecen TEK referans yok; pozitif kontrol olarak ayni arama "scripts/setup-hooks"
    # icin referans BULUYOR, yani arama gercekten ariyor. Sondaki '/' kasitli.
    scripts/hijyen/*) return 0 ;;
    .githooks/*)     return 0 ;;
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
