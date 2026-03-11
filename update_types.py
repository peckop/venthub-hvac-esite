import json
import os

temp_file = r'C:\Users\alize\.gemini\antigravity\brain\88ba7e9e-d436-431a-a919-2133706e0c98\.system_generated\steps\605\output.txt'
target_file = r'c:\Users\alize\venthub-hvac\src\types\database.types.ts'

with open(temp_file, 'r', encoding='utf-8') as f:
    data = json.load(f)

with open(target_file, 'w', encoding='utf-8') as f:
    f.write(data['types'])

print(f"Successfully updated {target_file}")
