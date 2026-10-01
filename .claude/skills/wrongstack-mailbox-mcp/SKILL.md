---
name: wrongstack-mailbox-mcp
description: "Pencereler arası posta kutusu (kapalı pencereye mesaj): okunmamışları okuma, gönderme, yanıtlama, onaylama, geçmiş sorgulama. Tetik: posta kutusu, kapalı pencereye mesaj, mailbox. Açık pencereye doğrudan mesaj SendMessage ile gider. WrongStack 1.0.26 uyarlaması."
category: coordination
metadata:
  kaynak: "WrongStack @wrongstack/core 1.0.26 skills/wrongstack-mailbox-mcp/SKILL.md (MIT lisansı, telif WrongStack)"
  uyarlama: "ARAÇ 2026-09-28 (karar 165 W3) - araç eşlemesi ve VentHub ek kuralları eklendi, kaynak gövde değiştirilmedi"
---

> **Kaynak:** WrongStack `@wrongstack/core` 1.0.26, `skills/wrongstack-mailbox-mcp/SKILL.md`, MIT lisansı. Aşağıdaki
> "Araç eşlemesi" ve "VentHub ek kuralları" bölümleri bize aittir; ondan sonraki gövde **değiştirilmeden** kopyalandı.

## Araç eşlemesi (kaynak metindeki adlar bizde neye karşılık gelir)

| Kaynak metin | Bizde |
|---|---|
| `mcp_use` köprüsü | Doğrudan MCP: `mcp__wrongstack-mailbox__mailbox_read` / `mailbox_manage` / `mailbox_watch` |
| Açık pencere | Doğrudan mesaj **SendMessage** (posta kutusu değil) |
| `mailbox_admin` | KAPALI (kural 3) |

## VentHub ek kuralları (kaynak metinden ÖNCE okunur; çelişirse bunlar kazanır)

1. **Kimlik** yalnız `tools/wrongstack-mcp/posta-kutusu.cjs` sarmalayıcısından gelir. `.mcp.json`'a `--actor` ya da `${...}` yer tutucusu yazılmaz (genişlemiyor, bütün pencereler aynı kimliğe düşüyor).
2. **Posta alıcısı** daima TAM oturum kimliğidir (36 karakter). 8 haneli kısa kimliğe giden mesaj hata vermeden kaybolur.
3. `--admin` ve `--destructive` bayrakları KAPALI kalır; kaynak metindeki örnek yapılandırmalar bizde uygulanmaz. **Gövdedeki örnek yapılandırma bloğu `--admin` içerir: aynen KOPYALANMAZ**; `.mcp.json` yalnız `posta-kutusu.cjs` sarmalayıcısını çağırır (kural 1).
4. Kutuya ve karta **sır** (anahtar, parola, token) ve **Recep onayı** yazılmaz. Onay yalnız Recep'in kendi penceresinde verilir. Tek ayrı yol (karar 224): canlı DIŞI işte OPS, Recep'in OPS'ta verdiği evetin sözünü ve saatini OPS panosundaki onay kartına yazar; onayı orada doğrularsın. Canlı iş (migration'lı PR, sır/anahtar/parola, geçmişi silen git, canlı veritabanı yazımı, para harcatan her şey) bunun dışındadır: onay yine yalnız Recep'ten gelir.
5. `*_watch` çağrısı kanıt değildir; durum `mailbox_read` / `kanban_read` ile okunarak doğrulanır.
6. Pano (kanban) Linear'ın YANINDA pilottur. İş emrinin tek kaynağı **Linear**'dır; karttaki bilgi Linear'ı geçersiz kılmaz.
7. "Bitti" doğrulayıcı komutu `gh` ile sınırlıdır ve sır içermez.
8. Kanban yaması `cli.js` + `index.js` dosyalarında (`tools/wrongstack-mcp/yamalar/`). Sürüm yükselince yamanın hâlâ tuttuğu yeniden ölçülür.
9. `mailbox-bridge` kullanılmaz (HTTP köprüsü; bizde kapalı).
10. Ops'a rapor dört alanlı etiketle gider (NE · DURUM · KANIT · KİMDE). Kaynak metindeki `<nextsteps>` biçimi bunun ekidir, yerine geçmez.
11. **İzin bilgisi** (kim neye yetki verdi) pencere mesajından hafızaya ya da durum dosyasına KOPYALANMAZ. Tek kaynak `~/.claude/settings.json`; en fazla "bkz. settings.json autoMode, <tarih>" yazılır.
12. **Pencereler arası mesaj ≤800 karakter.** Mesaj yalnız ADRES (dosya/Linear) + hüküm + istek taşır; ayrıntı dosyada ya da Linear'dadır. Recep'e giden metin bu sınırın DIŞINDADIR (tam cümle kuralı).

---


# WrongStack Mailbox MCP

Use MCP as the only Mailbox boundary. Never open or edit `_mailbox.sqlite`, legacy JSONL,
credential files, bridge locks, or token files directly.

## Connect

Expect an MCP server named `wrongstack-mailbox`. For full authorized access configure:

```json
{
  "mcpServers": {
    "wrongstack-mailbox": {
      "command": "wstack-mailbox-mcp",
      "args": [
        "--project-root",
        "/absolute/project/path",
        "--actor",
        "external-agent",
        "--admin"
      ]
    }
  }
}
```

Use a stable, honest actor id. The server fixes sender, receipt, deletion, registration, and
heartbeat identity to `--actor`; tool arguments cannot impersonate another actor.

## Coordinate

1. Call `mcp_use` for the remote `mailbox_manage` operation with `register_self`. Include a stable name and role when known.
2. Call `mcp_use` for the remote `mailbox_read` operation with `unread`, then `query`. Prefer `unreadBy` plus `incompleteOnly` when
   looking for actionable work.
3. Call `mcp_use` for remote `mailbox_read` with `online_agents` before routing a time-sensitive direct message.
4. Call `mcp_use` for remote `mailbox_manage` with `send`. Set an explicit recipient and message type:
   - `ask` for a blocking question;
   - `assign` for delegated work;
   - `steer` for changed direction;
   - `review` for review requests;
   - `result` for a completed outcome;
   - `broadcast` only when every relevant agent should receive it.
5. Set `replyTo` when continuing a thread. Do not create an unrelated message that loses context.
6. Call `mcp_use` for the remote `ack` or `ack_many` operation after reading or completing messages. Record a truthful outcome when
   marking work completed.
7. Send `heartbeat_self` during long work and `deregister_self` on a clean shutdown.

Runtime-only `control` messages are deliberately unavailable. Call `mcp_use` for the remote `steer` operation for normal external
direction; never bypass the restriction through another channel.

## Observe changes

Call `mcp_use` for remote `mailbox_watch` with an optional event type and timeout no greater than 25 seconds. Treat the
result as a wake-up hint. After every event or timeout, reconcile through remote `mailbox_read`; watch events
contain identifiers and metadata, not the authoritative message snapshot.

## Manage and administer

- `mailbox_read` provides query, unread counts, agent/client discovery, and daemon status.
- `mailbox_manage` provides send, receipt/completion acknowledgement, soft-delete/restore, and
  self-presence. It requires `--writable` or `--admin`.
- `mailbox_admin` provides clear, purge, compaction, and credential issue/verify/revoke/rotate/list
  operations. It requires `--admin`, which implies writable mode.

## Out of scope

- **Don't read or edit Mailbox files directly.** No `_mailbox.sqlite`, no legacy JSONL, no bridge locks, no token files. MCP is the only boundary; bypassing it through any of those channels breaks trust and audit.
- **Don't impersonate another actor.** The server fixes sender, receipt, deletion, registration, and heartbeat identity to `--actor`. Tool arguments cannot override that. Use the actor id you were given, honestly.
- **Don't reach for `steer` on routine direction.** Steer is for changed direction mid-task. For normal coordination, `ask`, `assign`, or `result` are the right types.
- **Don't broadcast when direct addressing is correct.** Broadcast reaches every relevant agent; most messages don't.
- **Don't run admin operations to bypass routing, identity, or authorization errors.** If a call is denied for one of those reasons, the call is wrong. Re-read state, ask, or stop. Admin paths are for explicitly authorized administration, not workarounds.
- **Don't skip `register_self`.** Without registration, the runtime can't reconcile heartbeats or surface the agent in the workbench.
- **Don't treat `mailbox_watch` events as authoritative.** Watch is a wake-up hint, not a snapshot. After every event, reconcile through `mailbox_read`.

## Before returning

- [ ] MCP server reached via `mcp_use`; never opened Mailbox files directly
- [ ] Actor id stable and honest; no impersonation of `hq@...` or other agents
- [ ] `register_self` called with stable name and role before any other traffic
- [ ] `mailbox_read` with `unreadBy` + `incompleteOnly` used to find actionable work
- [ ] `online_agents` checked before time-sensitive direct sends
- [ ] `send` carries an explicit recipient and the right message type
- [ ] `replyTo` set on threaded replies; no orphan context
- [ ] `ack` / `ack_many` called with truthful `outcome` after work
- [ ] `heartbeat_self` running during long work; `deregister_self` on clean shutdown
- [ ] Admin operations (`clear_all`, purge, credential issue/revoke) only when explicitly requested

## Skills in scope

- `mailbox-bridge` — for the WrongStack-internal HTTP façade this MCP server mirrors
- `wrongstack-mailbox` — for the external-facing counterpart used by Claude Code / Aider / scripts
- `security-scanner` — for confirming the MCP server's authn/authz surface matches project security conventions
- `output-standards` — for the `<nextsteps>` shape when reporting mailbox activity to the user

<!-- ORTAK-BITIS-BASLANGIC (kaynak: .claude/skills/_ortak/bitis-durumu.md) -->
## Bitiş Durumu, Karışıklık ve Kanıtsız Kısıt

**Bitiş durumu — son satırda `DURUM: <kelime>` biçiminde söylenir.** Kelime **yalnız şu dörtten
biri** olabilir: `BITTI` (istenen yapıldı ve ölçüldü) · `CEKINCELI` (yapıldı ama adı konmuş bir
çekince var) · `ENGELLI` (dışarıdan bir şey bekliyor) · `BAGLAM-EKSIK` (soru cevaplanmadan devam
edilemez).

⚠**Beşinci kelime uydurulmaz.** "BEKLEMEDE", "KISMEN", "DEVAM EDIYOR" gibi kelimeler bu listede
yoktur; beklemek `ENGELLI`dir, yarım kalmak `CEKINCELI`dir. Kapalı liste bilinçli: kelime serbest
kalırsa her çağrı kendi sözlüğünü yazar ve durum makine tarafından okunamaz hâle gelir.

`BITTI` dışındaki her durum şu üçünü de yazar: **SEBEP** (tek cümle) · **DENENEN** (ne denendi,
sonucu ne oldu) · **ÖNERİ** (bir sonraki somut adım, kimde).

**Karışıklık:** yüksek riskli bir belirsizlikte tahminle devam edilmez — **DURULUR**, iki üç
seçenek gerekçesiyle yazılır ve biri önerilir. Yüksek risk: geri alınması pahalı olan, prod'a
dokunan, başka şeridin dosyasını değiştiren, para veya sır ilgilendiren iş.

**Kanıtsız kısıt yoktur:** *"olmuyor / erişemiyorum / araç desteklemiyor"* tek başına sonuç
değildir. Kısıt iddiası **birebir hata metni**, **belgeden alıntı** ya da **canlı ölçüm** ile
gelir. Kanıt yoksa doğru cümle *"ölçemedim"*dir, *"yapılamaz"* değil.

⚠**Ölçemedim ile ihlal ayrı sonuçlardır.** İkisini aynı kovaya koymak, bozuk bir ölçümü
gerçek bir kusur gibi raporlar.
<!-- ORTAK-BITIS-SON -->
