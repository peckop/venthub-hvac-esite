# MCP Server Kurulum Rehberi

Aşağıdaki yapılandırma, sağladığınız tüm sunucu ayarlarını (GitHub, Supabase, Context7) ve Sequential Thinking sunucusunu içerir.

Bu içeriği `C:\Users\alize\AppData\Roaming\Claude\claude_desktop_config.json` dosyanıza yapıştırın.

## Tam Yapılandırma (claude_desktop_config.json)

```json
{
  "mcpServers": {
    "github": {
      "command": "C:\\Program Files\\nodejs\\npx.cmd",
      "args": [
        "-y",
        "@modelcontextprotocol/server-github"
      ],
      "env": {
        "GITHUB_PERSONAL_ACCESS_TOKEN": "YOUR_GITHUB_TOKEN_HERE"
      }
    },
    "supabase": {
      "command": "cmd",
      "args": [
        "/c",
        "npx",
        "-y",
        "@supabase/mcp-server-supabase@latest",
        "--project-ref=tnofewwkwlyjsqgwjjga"
      ],
      "env": {
        "SUPABASE_ACCESS_TOKEN": "YOUR_SUPABASE_TOKEN_HERE"
      }
    },
    "Context7 Live": {
      "command": "npx.cmd",
      "args": [
        "-y",
        "@upstash/context7-mcp@latest"
      ],
      "env": {},
      "working_directory": "C:\\Users\\alize\\venthub-hvac"
    },
    "sequential-thinking": {
      "command": "npx.cmd",
      "args": [
        "-y",
        "@modelcontextprotocol/server-sequential-thinking"
      ]
    }
  }
}
```

## Kurulum ve Kontrol
1. **Dosyayı Düzenleyin:** `C:\Users\alize\AppData\Roaming\Claude\claude_desktop_config.json` dosyasını açın.
2. **Yapıştırın:** Mevcut içeriği yukarıdaki JSON ile değiştirin (veya `mcpServers` kısmını birleştirin).
3. **Yeniden Başlatın:** Claude Desktop uygulamasını tamamen kapatıp yeniden açın.
4. **Kontrol:** Claude arayüzünde "bağlantı" simgesine tıklayarak sunucuların yeşil (aktif) olup olmadığını kontrol edin.

> **Not:** Context7 için `working_directory` ayarını ekledim. Eğer Claude bu ayarı tanımazsa veya hata verirse, bu satırı kaldırıp tekrar deneyebilirsiniz.
