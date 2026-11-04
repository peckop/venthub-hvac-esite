"""skill-creator run_eval.py için Windows yaması (YTN-34).

Sorun: run_eval.py boruyu select.select ile bekler; Windows'ta select yalnız soket kabul eder,
boru verilince WinError 10038 atar ve sınav sahte "0 tetik" döner.
Yama: Windows'ta select.select hazır sayar; ardından gelen os.read boruda veri gelene ya da
süreç kapanana kadar bekler. Eklentiyi değiştirmez (eklenti güncellenince kaybolmasın diye).
sitecustomize olarak yüklenir; ProcessPoolExecutor'ın alt süreçleri PYTHONPATH'i miras alır,
bu yüzden tek bir ortam değişkeni hepsini kapsar.

Kullanım (skill-creator klasöründen):
  PYTHONUTF8=1 PYTHONPATH=<bu klasör> python -m scripts.run_eval --eval-set ... --skill-path ...
Bilinen sınır: okuma bloklayıcı olduğundan zaman aşımı yalnız alt süreç kapanınca işler.
"""
import select
import sys

if sys.platform == "win32":
    _gercek = select.select

    def _select(okunacak, yazilacak, istisna, zaman_asimi=None):
        return (list(okunacak), [], [])

    select.select = _select
    select._gercek_select = _gercek
