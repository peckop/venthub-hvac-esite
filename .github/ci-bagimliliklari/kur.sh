#!/usr/bin/env bash
# CI yardimci bagimliligini KILIT DOSYASINDAN, kok package.json'dan BAGIMSIZ kurar.
#
# Kullanim: bash .github/ci-bagimliliklari/kur.sh <paket-dizini>   (or. pg-surucu)
#
# NIYE: kok dizinde `npm install --no-save <paket>` kok package.json'daki TUM bagimliliklari
# kilitsiz cozer (depo pnpm ile kilitli, npm o kilidi okumaz). 2026-09-23'te bu, yayin
# yarisina (ETARGET) dusup veriyle ilgisiz kirmizi uretti. Burada yalniz <paket-dizini>'nin
# package-lock.json'u `npm ci` ile kurulur: surumler her kosumda AYNI.
#
# ESM `import 'pg'` NODE_PATH'i okumaz; bu yuzden kokte `node_modules` -> kurulum baglantisi
# acilir. Kokte zaten node_modules varsa (baska bir kurulum) DURULUR: ustune yazmak o kurulumu
# bozar, sessizce gecmek hangi surumun kullanildigini belirsiz birakir.
set -Eeuo pipefail

ad="${1:?kullanim: kur.sh <paket-dizini>}"
kaynak=".github/ci-bagimliliklari/${ad}"
[ -f "${kaynak}/package.json" ] || { echo "kur.sh: ${kaynak}/package.json yok" >&2; exit 2; }
[ -f "${kaynak}/package-lock.json" ] || { echo "kur.sh: ${kaynak}/package-lock.json yok (kilitsiz kurulum YASAK)" >&2; exit 2; }

hedef="${RUNNER_TEMP:?RUNNER_TEMP tanimsiz}/ci-bagimlilik-${ad}"
mkdir -p "${hedef}"
cp "${kaynak}/package.json" "${kaynak}/package-lock.json" "${hedef}/"
npm ci --prefix "${hedef}" --ignore-scripts --no-audit --no-fund

if [ -e node_modules ] || [ -L node_modules ]; then
  echo "kur.sh: kokte node_modules ZATEN var — baglanti acilmadi (bu isin baska kurulumu var mi?)" >&2
  exit 3
fi
ln -s "${hedef}/node_modules" node_modules
echo "kur.sh: ${ad} kuruldu (kilitli): $(ls "${hedef}/node_modules" | wc -l) paket → node_modules baglantisi"
