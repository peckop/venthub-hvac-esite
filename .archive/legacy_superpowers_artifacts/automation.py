import datetime
import time
import os

def main():
    os.makedirs('docs', exist_ok=True)
    
    start_time = datetime.datetime.now().strftime('%H:%M:%S')
    with open('docs/START_A.txt', 'w') as f:
        f.write(start_time)
    print(f'Started at {start_time}')
    
    time.sleep(10)
    
    finish_time = datetime.datetime.now().strftime('%H:%M:%S')
    with open('docs/FINISH_A.txt', 'w') as f:
        f.write(finish_time)
    print(f'Finished at {finish_time}')

if __name__ == '__main__':
    main()
