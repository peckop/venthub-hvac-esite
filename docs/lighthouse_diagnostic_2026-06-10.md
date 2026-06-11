# VentHub Lighthouse Performance Diagnostic — 2026-06-10

## Scores
| Platform | Performance | A11y | Best Practices | SEO |
|----------|-------------|------|----------------|-----|
| Desktop | 37 | 96 | 100 | 100 |
| Mobile | ~30 | - | - | - |

## Critical Metrics
| Metric | Value | Target | Status |
|--------|-------|--------|--------|
| FCP | 0.4s | <1.8s | OK |
| LCP | 0.6s | <2.5s | OK |
| TBT | 13,680ms | <200ms | CRITICAL |
| CLS | 0.656 | <0.1 | CRITICAL |
| SI | 7.9s | <1.3s | CRITICAL |

## Root Causes

### 1. TBT 13,680ms — Three.js Main Thread Block
One JS chunk (d7b70992) uses 28,094ms CPU. Three.js/R3F loads synchronously.

### 2. CLS 0.656 — Footer Layout Shift
Footer element shifts 0.599. Products grid shifts 0.028x2.

### 3. 1.5MB HDR File
potsdamer_platz_1k.hdr from raw.githubusercontent.com (1,505 KiB)

### 4. 274KB Unused JavaScript
Multiple chunks loaded but not used on initial page.

### 5. Legacy Polyfills (13KB)
Array.prototype.at, flat, flatMap, Object.fromEntries etc.

### 6. Forced Reflows (86ms)
From layout JS chunk.
