# 🚨 FEDERATIF TELEMEM PRO MAX: TAHLİYE VE KURTARMA PLANI

Bu klasör (`global-mcp-backup`), bilgisayar değiştirdiğinde veya Antigravity/Gemini sistemini sıfırladığında **Global Hafızanı** (Corpus Callosum) kaybetmemen için oluşturulmuş bir can yeleğidir.

## Klasörde Ne Var? Neden Dosyalar "Eksik" Görünüyor Olabilir?
Eğer `.gemini` gizli klasöründe olan "mcp-env" (Python sanal ortamı) klasörünün neden burada olmadığını merak ediyorsan; Python sanal ortamları bilgisayardaki mevcut konuma özel donanım ve dizinleri içine "hard-coded" olarak kaydeder. Bir sanal ortamı kopyala-yapıştır ile başka PC'ye taşırsan **çalışmaz**.
Bunun yerine bir `requirements.txt` dosyası koyduk. Yeni bilgisayarda sadece bağımlılıkları temiz bir şekilde kuracağız!

---

## 🛠️ YENİ BİLGİSAYARDA SİSTEMİ AYAĞA KALDIRMA (KURTARMA) ADIMLARI

### ADIM 1: Köprüyü İstenilen Yere Yerleştir
1. Bu klasörü (`global-mcp-backup`) olduğu gibi asıl çalışacağı global bir klasöre kopyala. Örneğin: `C:\Kullanicilar\alize\.gemini\antigravity\memory-engine\` gibi bir konum oluşturup içindeki `mcp_server.py`, `federation.py` ve `data` klasörünü oraya bırak. (Not: Nereye koyduğun önemli değil, sadece yerini bil yeter).

### ADIM 2: Motorun Yakıtını (Python Çevresini) Kur
Sistemin sıfır bilgisayarda çalışabilmesi için kütüphanelere ihtiyacı var. Komut satırını aç ve sunucuyu taşıdığın yere girip şunları çalıştır:
```bash
# Sanal ortam oluştur
python -m venv mcp-env

# İçine gir (Windows için)
.\mcp-env\Scripts\activate

# Çantadan çıkan bağımlılıkları teker teker temizce kur:
pip install -r requirements.txt
```

### ADIM 3: IDE'ye Prizden Elektrik Ver (MCP Bağlantısı)
Antigravity, Cursor, Windsurf veya hangi AI tabanlı editörü kullanıyorsan, onun MCP ayarlarına gir (genelde `mcp.json` gibi bir dosyadır veya arayüzden yapılır). JSON dosyana şu bloğu yapıştır:

```json
"corpus-callosum": {
  "command": "C:\\[SENIN-YOLUN]\\mcp-env\\Scripts\\python.exe",
  "args": [
    "C:\\[SENIN-YOLUN]\\mcp_server.py"
  ],
  "env": {
    "TELEMEM_ACTIVE_PROJECT": "venthub"
  }
}
```
*(Yukarıdaki yolları sunucuyu koyduğun bilgisayardaki güncel konumlara göre değiştir).*

### ADIM 4: Antigravity'e Adresini Söyle (Tekrar Kayıt)
`data/registry.json` içinde eski bilgisayarının dosya yolları kalacağı için veritabanını bulamayacaktır. Bunu manuel düzeltmek yerine, IDE'ye gir ve prompt olarak asistanından sadece şunu iste:

**"Federasyona yeni klasör yollarımı kaydet. telemem_register komutunu çalıştır: project_name=venthub, db_path=C:\Yeni\Yol\venthub\memory-engine\data\memory.db, workspace_root=C:\Yeni\Yol\venthub, env_file=C:\Yeni\Yol\venthub\.env.local"**

Ve bitti! Hafıza sıfırlanmadı, indeksleri kaybetmedin. Zekan yeni bilgisayarında yaşamaya devam ediyor.
