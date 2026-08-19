#!/usr/bin/env bash
# retry-bounded.sh — bir komutu ZAMAN SINIRIYLA çalıştırır, düşerse tekrar dener.
#
#   kullanım: retry-bounded.sh <saniye> <deneme> -- komut [argüman...]
#   örnek   : retry-bounded.sh 300 3 -- pnpm exec playwright install-deps chromium
#
# NİÇİN ADIM `timeout-minutes` YETMİYOR
# -------------------------------------
# GitHub'ın adım düzeyindeki `timeout-minutes`'ı adımı ÖLDÜRÜR ve iş kırmızı yanar;
# TEKRAR DENEMEZ. Asılma geçici bir ağ/ayna arızasıysa (2026-08-19 ölçümünde tam
# olarak buydu) tek denemede ölmek, arızayı kalıcı kırmızıya çevirir. Bu betik
# tersini yapar: her deneme SINIRLI, sınır dolunca deneme DÜŞER ve yenisi başlar.
#
# `timeout-minutes` yine de iş akışında DURUYOR — o, bu betiğin kendisi bozulursa
# devreye giren ikinci kemer. Tek kemere güvenmiyoruz.
#
# ÇIKIŞ KODU: son denemenin çıkış kodu. 124 = zaman aşımı (coreutils `timeout`).
set -Eeuo pipefail

if [ "$#" -lt 4 ]; then
  echo "retry-bounded: kullanim: $0 <saniye> <deneme> -- komut [arguman...]" >&2
  exit 2
fi

SANIYE="$1"; shift
DENEME="$1"; shift
if [ "$1" != "--" ]; then
  echo "retry-bounded: ucuncu arguman '--' olmali (gelen: $1)" >&2
  exit 2
fi
shift

son_kod=0
for ((i = 1; i <= DENEME; i++)); do
  echo "retry-bounded: deneme $i/$DENEME (sinir ${SANIYE}sn): $*"
  baslangic=$SECONDS
  # ÇIKIŞ KODU AÇIKÇA YAKALANIR — `if cmd; then …; fi` sonrasında `$?` DEĞİL 0'dır
  # (POSIX: hiçbir dal koşmazsa `if` ifadesinin kendisi 0 döner). İlk sürüm tam
  # bunu yapıyordu ve davranış testinde yakalandı: üç deneme de düşerken betik 0
  # dönüyordu, yani adım YEŞİL kalıyordu — ölçmeyen bir kapının ta kendisi.
  kod=0
  timeout --signal=TERM --kill-after=30s "${SANIYE}s" "$@" || kod=$?
  if [ "$kod" -eq 0 ]; then
    echo "retry-bounded: deneme $i BASARILI ($((SECONDS - baslangic))sn)"
    exit 0
  fi
  son_kod=$kod
  if [ "$son_kod" -eq 124 ] || [ "$son_kod" -eq 137 ]; then
    echo "::warning title=retry-bounded::deneme $i ZAMAN ASIMI (${SANIYE}sn doldu) — komut: $*"
  else
    echo "::warning title=retry-bounded::deneme $i cikis kodu $son_kod ile dustu — komut: $*"
  fi
  # apt'nin yarım kalmış paket listeleri sonraki denemeyi de zehirleyebilir.
  if [ "${RETRY_APT_TEMIZLE:-0}" = "1" ]; then
    sudo rm -rf /var/lib/apt/lists/* || true
  fi
  sleep 10
done

echo "::error title=retry-bounded::$DENEME denemenin hepsi dustu (son kod $son_kod) — komut: $*"
# Sıfır ÇIKMAK yasak: buraya gelindiyse iş başarısızdır. Son kod bir şekilde 0 ise
# (kabuk sürprizi) yine de kırmızı yanılır — sessiz yeşil bu betiğin varlık sebebine aykırı.
[ "$son_kod" -ne 0 ] || son_kod=1
exit "$son_kod"
