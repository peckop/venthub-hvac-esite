import json, os, sys, urllib.request

ENV = os.path.expanduser("~/.claude/.env.global")
key = os.environ.get("LINEAR_API_KEY", "").strip()
if not key and os.path.exists(ENV):
    for l in open(ENV, encoding="utf-8"):
        if l.startswith("LINEAR_API_KEY="):
            key = l.strip().split("=", 1)[1].strip().strip('"')
if not key:
    print("LINEAR_API_KEY yok"); sys.exit(2)

def gql(q, v=None):
    req = urllib.request.Request("https://api.linear.app/graphql",
        data=json.dumps({"query": q, "variables": v or {}}).encode(),
        headers={"Authorization": key, "Content-Type": "application/json"})
    with urllib.request.urlopen(req) as r:
        d = json.loads(r.read())
    if d.get("errors"):
        raise SystemExit("HATA: " + json.dumps(d["errors"])[:300])
    return d["data"]

mode = sys.argv[1] if len(sys.argv) > 1 else "kim"
if mode == "kim":
    print("viewer:", gql("{ viewer { name email } }")["viewer"]["name"])
elif mode == "arsivle":
    # argv[2..] = REC numaralari (yalniz sayi) ya da 'done' / 'canceled'
    sel = sys.argv[2:]
    ids = []
    if sel and sel[0] in ("done", "canceled"):
        typ = "completed" if sel[0] == "done" else "canceled"
        after = None
        while True:
            d = gql("""query($after:String,$t:String!){ issues(first:100, after:$after,
                filter:{ state:{ type:{ eq:$t } }, archivedAt:{ null:true } }){
                nodes{ id identifier } pageInfo{ hasNextPage endCursor } } }""",
                {"after": after, "t": typ})["issues"]
            ids += [(n["id"], n["identifier"]) for n in d["nodes"]]
            if not d["pageInfo"]["hasNextPage"]: break
            after = d["pageInfo"]["endCursor"]
    else:
        for n in sel:
            d = gql("query($n:Float!){ issues(filter:{ number:{ eq:$n } }){ nodes{ id identifier } } }", {"n": float(n)})["issues"]["nodes"]
            ids += [(x["id"], x["identifier"]) for x in d]
    ok = 0
    for iid, ident in ids:
        r = gql("mutation($id:String!){ issueArchive(id:$id){ success } }", {"id": iid})
        ok += 1 if r["issueArchive"]["success"] else 0
    print(f"arsivlendi {ok}/{len(ids)}:", " ".join(i for _, i in ids)[:600])
elif mode == "say":
    d = gql("{ a: issues(filter:{archivedAt:{null:true}}, first:1){ pageInfo{ hasNextPage } } }")
    # sayim: sayfalayarak
    after=None; n=0
    while True:
        d = gql("query($after:String){ issues(first:100, after:$after, filter:{archivedAt:{null:true}}){ nodes{ id } pageInfo{ hasNextPage endCursor } } }", {"after": after})["issues"]
        n += len(d["nodes"])
        if not d["pageInfo"]["hasNextPage"]: break
        after = d["pageInfo"]["endCursor"]
    print("arsivlenmemis kayit:", n)
