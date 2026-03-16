import json

try:
    with open('.reports/lighthouse-latest.json', 'r', encoding='utf-8') as f:
        data = json.load(f)

    categories = data.get('categories', {})
    print("--- LIGHTHOUSE KATEGORİ SKORLARI ---")
    for cat_id, cat_data in categories.items():
        score = cat_data.get('score')
        score_pct = int(score * 100) if score is not None else "N/A"
        print(f"- {cat_data.get('title')}: {score_pct}")

    audits = data.get('audits', {})
    metrics = [
        'first-contentful-paint',
        'largest-contentful-paint',
        'total-blocking-time',
        'cumulative-layout-shift',
        'speed-index'
    ]
    print("\n--- ÖNEMLİ METRİKLER (CORE WEB VITALS) ---")
    for m in metrics:
        audit = audits.get(m, {})
        title = audit.get('title')
        display = audit.get('displayValue', 'N/A')
        print(f"- {title}: {display}")
except Exception as e:
    print("Hata:", e)
