---
status: backlog
type: P02-Core-Quality-Guardians
priority: medium
created_at: 2026-04-20
---

# T038: DTO Architecture Transition (Type-Safe Partial Selects)

## Bağlam ve Sorun
Performans optimizasyonu amacıyla devasa tablolar (product, category vb.) için `select('*')` ifadesi açık kolonlara (`select('id, name')`) çevrilmişti. Ancak bu işlem, TypeScript'teki tam row interfaceleri ile uyuşmazlığa (TypeScript Type Error) sebep oldu.

Performans kazanımını (Scope Creep yaratmadan) korumak için pragmatik bir geçici düzeltme yapıldı: Sorguya TS tarafından istenen `updated_at` gibi gereksiz kolonlar dahil edildi.

## Mimari Hedef (Nasıl Çözülmeli?)
Supabase'in sağladığı jenerik Type Helper'lar (örn. `QueryData<typeof query>`) kullanılarak veya spesifik DTO'lar (örn. `ProductListDto`) yaratılarak "Partial Select" işlemlerinin tip güvencesi altına alınması. 

Bu sayede sadece 2 kolona ihtiyaç duyan bir frontend bileşeni, TS kilitlenmesi yaşamadan o sorguyu saf haliyle yapabilecektir.

## Not
Bu dosya "Day-0 Enterprise" disiplinine bağlı kalınarak mimari bir borcu (Technical Debt) takip etmek için Corpus Callosum ve Orion V8 ile eşzamanlı olarak fiziksel dizinlere kazınmıştır.
