import json

try:
    with open('.reports/lighthouse-latest.json', 'r', encoding='utf-8') as f:
        data = json.load(f)

    with open('lighthouse-clean-summary.txt', 'w', encoding='utf-8') as out:
        categories = data.get('categories', {})
        out.write("--- KATEGORI SKORLARI ---\n")
        for cat_id, cat_data in categories.items():
            score = cat_data.get('score')
            score_pct = int(score * 100) if score is not None else "N/A"
            out.write(f"- {cat_data.get('title')}: {score_pct}\n")

        audits = data.get('audits', {})
        metrics = [
            'first-contentful-paint',
            'largest-contentful-paint',
            'total-blocking-time',
            'cumulative-layout-shift',
            'speed-index'
        ]
        out.write("\n--- ONEMLI METRIKLER ---\n")
        for m in metrics:
            audit = audits.get(m, {})
            title = audit.get('title')
            display = audit.get('displayValue', 'N/A')
            out.write(f"- {title}: {display}\n")
except Exception as e:
    print("Hata:", e)
