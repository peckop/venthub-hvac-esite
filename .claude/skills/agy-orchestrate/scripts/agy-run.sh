#!/usr/bin/env bash
# agy-run.sh — TEK agy --print cagrisi calistir, ciktiyi ANSI'den temizle, bos gelirse 5 kez dene.
# Kullanim: agy-run.sh "PROMPT" "CALISMA_DIZINI" "CIKTI_DOSYASI"
#
# !!! ONEMLI TUZAK: winpty'yi ASLA ( ) subshell icine alma. Subshell konsol boyutunu (cols/rows)
#     kaybeder -> winpty assertion -> cikti BOS. Dogrudan cagir. (Bkz SKILL.md "Tuzaklar".)
#
# Neden winpty: agy --print ciktiyi bir terminal "text-drip" renderer ile yazar; TTY ister.
#     winpty sahte TTY saglar. -Xallow-non-tty boru hatti ortaminda calismaya zorlar.
prompt="$1"; dir="${2:-$PWD}"; out="${3:-/dev/stdout}"
cd "$dir" 2>/dev/null || { echo "[agy-run: dizin yok: $dir]" > "$out"; exit 1; }
raw="$(mktemp)"; err="$(mktemp)"
clean() { perl -pe 's/\e\][^\a]*\a//g; s/\e\[[0-9;?]*[ -\/]*[@-~]//g; s/\r//g' "$1"; }
ok=0
for attempt in 1 2 3 4 5; do
  winpty -Xallow-non-tty agy --print "$prompt" > "$raw" 2> "$err"
  [ -s "$raw" ] && { ok=1; break; }
  sleep 2
done
clean "$raw" > "$out"
[ "$ok" = 1 ] || echo "[agy-run: 5 denemede de bos cikti — winpty konsol alamiyor olabilir; INLINE dogrudan cagri ya da MOD B (dosya-cikti) dene]" >> "$out"
rm -f "$raw" "$err"
