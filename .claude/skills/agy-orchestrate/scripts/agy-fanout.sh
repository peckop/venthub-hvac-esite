#!/usr/bin/env bash
# agy-fanout.sh — MOD A: birden cok ekseni agy'ye SIRALI fan-out et (her eksen ayri rapor dosyasi).
# Kullanim:  agy-fanout.sh REPO_DIR OUT_DIR  < eksenler.tsv
#   eksenler.tsv: her satir  ->  EKSEN_ADI <TAB> PROMPT
# Cikti: OUT_DIR/<EKSEN_ADI>.md  (ANSI temiz). Bos gelen ekseni 3 kez dener.
#
# !!! TUZAK: winpty dogrudan cagrilir (subshell YOK). for-dongusu sorun degil; ( ) sorun.
#     stdout yakalama yine de araliklidir -> kritik isler icin MOD B (dosya-cikti) tercih et.
repo="$1"; outdir="${2:-/c/tmp/agy-fanout}"
mkdir -p "$outdir"
cd "$repo" 2>/dev/null || { echo "repo yok: $repo" >&2; exit 1; }
clean() { perl -pe 's/\e\][^\a]*\a//g; s/\e\[[0-9;?]*[ -\/]*[@-~]//g; s/\r//g'; }
while IFS=$'\t' read -r name prompt; do
  [ -z "$name" ] && continue
  raw="$(mktemp)"
  for a in 1 2 3; do
    winpty -Xallow-non-tty agy --print "$prompt" > "$raw" 2>/dev/null
    [ -s "$raw" ] && break
    sleep 2
  done
  clean < "$raw" > "$outdir/$name.md"
  echo "$name -> $(wc -c < "$outdir/$name.md") bayt"
  rm -f "$raw"
done
echo "=== fan-out bitti: $outdir ==="
