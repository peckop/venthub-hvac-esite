#!/usr/bin/env bash
# arka-plan.sh — uzun süren bir komutu ARKA PLANDA başlatır, sonucunu sonraki bir adımda toplar (ALT-38f).
#
#   kullanım: arka-plan.sh baslat <ad> -- komut [argüman...]
#             arka-plan.sh bekle  <ad> <toplam_saniye>
#   örnek   : arka-plan.sh baslat pw-deps -- bash scripts/ci/retry-bounded.sh 75 2 -- pnpm exec playwright install-deps chromium
#             arka-plan.sh bekle  pw-deps 240
#
# NİÇİN VAR (2026-10-07, 88 başarılı e2e-smoke koşusunda ölçüldü)
# ----------------------------------------------------------------
# `admin-smoke` işinde `playwright install-deps chromium` medyan 15 sn sürüyor ve Build'ten (medyan 166 sn) ÖNCE sırayla koşuyordu.
# 88 koşunun 3'ünde (%3,4) apt 187, 339 ve 341 sn sürdü (ilk deneme 300 sn sınırını doldurdu, ikinci deneme geçti): iş 640 sn'ye çıktı.
# Günlükte komutun kurduğu tek şey YAZI TİPLERİ: Chromium'un çalışma kütüphaneleri koşucu imajında zaten kurulu ("already the newest").
# Bu adım Build'i beklemek zorunda değil. Burada Build ile PARALEL koşar; sonucu Build'ten sonra `bekle` toplar. Gerçek kapı DEĞİŞMEDİ:
# `Tarayici gercekten aciliyor mu` probu `bekle`den SONRA koşar ve Chromium açılmıyorsa iş ADIYLA kırmızı olur (sessiz yeşil yok).
#
# SÖZLEŞME
#   baslat : komutu arka planda başlatır ve HEMEN döner (0). Komutun çıktısı günlük dosyasına gider; adımın kendi çıktı borusunu
#            TUTMAZ (tutsaydı runner adımı komut bitene kadar bitmiş saymazdı: Build ile paralellik kaybolurdu).
#   bekle  : komut bitene kadar bekler (en çok `baslat`tan itibaren <toplam_saniye>), günlüğü yazdırır ve çıkış koduyla döner:
#              0   komut başarılı
#              N   komutun KENDİ çıkış kodu (başarısız)
#              124 süre doldu, komut hâlâ sürüyor (ÖLDÜRÜLMEZ: komutun kendi sınırı var, bkz. retry-bounded.sh; kapıyı prob verir)
#              125 bu ad hiç başlatılmamış (adım sırası bozuk)
#              2   kullanım hatası
#            Komut sonuç yazmadan ÖLMÜŞSE (ör. runner arka plan işlemini öldürdüyse) uyarı verir ve komutu ÖN PLANDA yeniden koşar:
#            mekanizma bozulsa bile iş, eskisinin (sıralı) davranışına düşer; paralellik kaybolur, doğruluk kaybolmaz.
#
# DURUM DİZİNİ: ${ARKA_PLAN_DIZIN:-$RUNNER_TEMP/arka-plan} (çalışma ağacının DIŞI: depo tarayan testler görmez).
set -Eeuo pipefail

kullanim() {
  echo "arka-plan: kullanim: $0 baslat <ad> -- komut [arguman...]  |  $0 bekle <ad> <toplam_saniye>" >&2
  exit 2
}

[ "$#" -ge 2 ] || kullanim
KIP="$1"
AD="$2"
shift 2

# Ad dosya adına girer: yol ayracı ve kontrol karakteri alamaz.
[[ "$AD" =~ ^[a-z0-9][a-z0-9-]*$ ]] || { echo "arka-plan: gecersiz ad '$AD' (kucuk harf, rakam, tire)" >&2; exit 2; }

DIZIN="${ARKA_PLAN_DIZIN:-${RUNNER_TEMP:-${TMPDIR:-/tmp}}/arka-plan}"
ONEK="$DIZIN/$AD"

yazdir_gunluk() {
  echo "::group::arka-plan '$AD' gunlugu"
  cat "$ONEK.log" 2>/dev/null || echo "(gunluk dosyasi yok)"
  echo "::endgroup::"
}

baslat() {
  [ "${1:-}" = "--" ] || kullanim
  shift
  [ "$#" -ge 1 ] || kullanim
  mkdir -p "$DIZIN"
  # Aynı ad ikinci kez başlatılırsa ESKİ sonuç yeni koşuya karışmasın.
  rm -f "$ONEK.komut" "$ONEK.baslangic" "$ONEK.pid" "$ONEK.log" "$ONEK.cikis" "$ONEK.cikis.tmp"
  # Komut, `bekle`nin yedek koşusu için kabuk-güvenli biçimde saklanır.
  printf '%q ' "$@" > "$ONEK.komut"
  date +%s > "$ONEK.baslangic"
  (
    # Adım bitince gelebilecek SIGHUP komutu öldürmesin (yok sayılan sinyal exec'ten sonra da yok sayılır).
    trap '' HUP
    kod=0
    "$@" > "$ONEK.log" 2>&1 < /dev/null || kod=$?
    # Sonuç dosyası ATOMİK yazılır: `bekle` yarım dosya okumasın.
    printf '%s %s\n' "$kod" "$(date +%s)" > "$ONEK.cikis.tmp"
    mv "$ONEK.cikis.tmp" "$ONEK.cikis"
  ) > /dev/null 2>&1 < /dev/null &
  echo "$!" > "$ONEK.pid"
  echo "arka-plan: '$AD' baslatildi (pid $!): $*"
}

# Süreç yaşıyor mu? pid POZİTİF TAM SAYI olmalı: `kill -0 0` mevcut sürecin GRUBUNA sinyal verir ve HEP başarılıdır (pid dosyası yok ya da bozuksa
# "yaşıyor" sanılır, bekle süre dolana kadar boşuna bekler ve yedek koşu hiç devreye girmezdi).
yasiyor() {
  [[ "${1:-}" =~ ^[1-9][0-9]*$ ]] && kill -0 "$1" 2>/dev/null
}

yedek_kos() {
  echo "::warning title=arka-plan::'$AD' sonuc yazmadan OLDU (runner arka plan islemini oldurmus olabilir): komut ON PLANDA yeniden kosuyor"
  yazdir_gunluk
  local komut kod=0
  komut="$(cat "$ONEK.komut")"
  bash -c "$komut" || kod=$?
  echo "arka-plan: '$AD' yedek kosu cikis kodu $kod"
  return "$kod"
}

bekle() {
  local toplam="${1:-}"
  [[ "$toplam" =~ ^[0-9]+$ ]] || kullanim
  if [ ! -f "$ONEK.baslangic" ]; then
    echo "::warning title=arka-plan::'$AD' hic baslatilmamis (bu adim 'baslat' adimindan SONRA gelmeli)"
    return 125
  fi
  local bas pid son bekleme_bas
  bas="$(cat "$ONEK.baslangic")"
  pid="$(cat "$ONEK.pid" 2>/dev/null || true)"
  son=$((bas + toplam))
  bekleme_bas="$(date +%s)"
  while [ ! -f "$ONEK.cikis" ]; do
    if ! yasiyor "$pid"; then
      # Süreç yok: sonucu ölümden hemen önce yazmış olabilir (yarış). Dosya yoksa mekanizma bozulmuştur → yedek koşu.
      [ -f "$ONEK.cikis" ] && break
      local yedek_kodu=0
      yedek_kos || yedek_kodu=$?
      return "$yedek_kodu"
    fi
    if [ "$(date +%s)" -ge "$son" ]; then
      echo "::warning title=arka-plan::'$AD' ${toplam}sn icinde bitmedi (komut hala suruyor, OLDURULMEDI: kendi siniri var); kapiyi tarayici probu verir"
      yazdir_gunluk
      return 124
    fi
    sleep 1
  done
  local kod bitis simdi
  read -r kod bitis < "$ONEK.cikis"
  simdi="$(date +%s)"
  yazdir_gunluk
  echo "arka-plan: '$AD' cikis kodu $kod; komut $((bitis - bas))sn surdu, 'bekle' adiminda bekleme $((simdi - bekleme_bas))sn"
  return "$kod"
}

case "$KIP" in
  baslat) baslat "$@" ;;
  bekle) bekle "$@" ;;
  *) kullanim ;;
esac
