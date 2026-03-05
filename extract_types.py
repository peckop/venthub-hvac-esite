
import json
import os

with open(r'C:\Users\alize\.gemini\antigravity\brain\e3293d8b-500b-4e0b-ab8e-ff6ffdbf8b63\.system_generated\steps\7129\output.txt', 'r', encoding='utf-8') as f:
    data = json.load(f)

with open(r'c:\Users\alize\venthub-hvac\src\types\database.types.ts', 'w', encoding='utf-8') as f:
    f.write(data['types'])
