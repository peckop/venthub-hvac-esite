import time
from datetime import datetime
import os
import sys

def run_automation():
    try:
        # Ensure docs directory exists just in case
        os.makedirs('docs', exist_ok=True)
        
        # START_B.txt
        start_time = datetime.now().strftime("%H:%M:%S")
        start_path = 'docs/START_B.txt'
        with open(start_path, 'w', encoding='utf-8') as f:
            f.write(f"Baslangic zamani: {start_time}")
        print(f"Created {start_path} at {start_time}")
        
        # Wait 10 seconds
        time.sleep(10)
        
        # FINISH_B.txt
        finish_time = datetime.now().strftime("%H:%M:%S")
        finish_path = 'docs/FINISH_B.txt'
        with open(finish_path, 'w', encoding='utf-8') as f:
            f.write(f"Bitis zamani: {finish_time}")
        print(f"Created {finish_path} at {finish_time}")
        
    except Exception as e:
        print(f"Error: {e}")
        sys.exit(1)

if __name__ == '__main__':
    run_automation()
