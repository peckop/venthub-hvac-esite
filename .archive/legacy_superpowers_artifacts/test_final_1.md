# VentHub Python Otomasyon Standartları (Test Final 1)

Bu doküman, VentHub projesi kapsamındaki Python tabanlı REST API otomasyonları için belirlenen standartları ve mimariyi özetler. `superpowers-python-automation` yetkinliği çerçevesinde hazırlanmıştır.

## 1. Mimari Yapı (Reference Architecture)

Otomasyon projelerinde ölçeklenebilirlik ve bakım kolaylığı için aşağıdaki modüler yapı tercih edilmelidir:

- **`client.py`**: API istemci sarmalayıcısı. Kimlik doğrulama, başlık yönetimi, yeniden deneme (retry) ve sayfalama (pagination) burada yönetilir.
- **`models.py`**: Pydantic veya dataclass kullanılarak oluşturulmuş veri modelleri. Payload ve response yapılarını tanımlar.
- **`sync.py`**: İş mantığı (orchestration). Veriyi çekme, dönüştürme ve hedef sisteme (örn. Supabase) yükleme adımlarını içerir.
- **`main.py`**: CLI giriş noktası. Parametre yönetimi ve loglama başlatma işlemlerini yapar.

## 2. HTTP ve Güvenlik Kuralları

- **Timeout:** Hiçbir istek sınırsız beklememelidir. Varsayılan olarak `connect: 5s`, `read: 10s` kullanılmalıdır.
- **Retry Politikası:**
    - Ağ hataları, timeoutlar ve 5xx (Sunucu) hataları için üstel geri çekilme (exponential backoff) uygulanır.
    - 429 (Too Many Requests) hatalarında `Retry-After` başlığına riayet edilir.
    - 4xx (İstemci) hataları (408/409 hariç) genelde mantıksal hata olduğu için yeniden denenmez.
- **Hassas Veri:** `Authorization` başlıkları, API anahtarları veya kişisel veriler asla loglanmamalıdır.

## 3. Sayfalama (Pagination) Örnek Yapısı

```python
def fetch_all_items(client, base_url):
    items = []
    next_url = base_url
    while next_url and len(items) < MAX_ITEMS_LIMIT:
        response = client.get(next_url)
        data = response.json()
        items.extend(data.get('results', []))
        next_url = data.get('next') # Cursor veya URL tabanlı
    return items
```

## 4. Gözlemlenebilirlik (Observability)

Her çalışma sonunda aşağıdaki özet loglanmalıdır:
- `run_id`: Çalışma kimliği.
- `processed_count`: İşlenen toplam kayıt.
- `created_count`: Yeni oluşturulanlar.
- `failed_count`: Hata alınanlar.
- `elapsed_ms`: Toplam geçen süre.

## 5. Doğrulama Gereksinimleri

- **Unit Tests:** Dönüşüm mantığı (mapping) için `pytest` testleri zorunludur.
- **Mocking:** API etkileşimleri için `respx` veya `pytest-mock` kullanılmalıdır.
- **Dry-Run:** `--dry-run` bayrağı ile veritabanına yazmadan yapılacak işlemlerin simülasyonu desteklenmelidir.

---
*Bu dosya VentHub otomasyon süreçlerinin disiplinli ve deterministik bir şekilde yürütülmesi için oluşturulmuştur.*
