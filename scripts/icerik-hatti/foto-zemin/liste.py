"""tara.py ciktisindan (galeri-tarama.json) kabul disi gorsel listesini CSV yazar.
kullanim: python -I liste.py <galeri-tarama.json> <cikti.csv>"""
import sys, json, csv

r = json.load(open(sys.argv[1], encoding="utf-8"))
kot = sorted([x for x in r if x.get("serit", 100) < 85], key=lambda x: x["serit"])
with open(sys.argv[2], "w", encoding="utf-8", newline="") as f:
    w = csv.writer(f)
    w.writerow(["path", "genislik", "yukseklik", "serit_beyaz_saydam_yuzde"])
    for x in kot:
        w.writerow([x["path"], x["w"], x["h"], x["serit"]])
print(len(kot), "satir")
