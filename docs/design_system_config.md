# VentHub Design System Konfigürasyonu

Bu dosya `tailwind.config.js`, `src/design-system/tokens.js` ve `src/index.css`'in NLM-uyumlu MD karşılığıdır.

---

## Renk Sistemi (CSS Custom Properties — index.css)

### Dark Mode (:root)
| Token | HSL Değeri | Kullanım |
|-------|-----------|----------|
| `--surface-deep` | `224 52% 8%` | Ana arka plan |
| `--surface-darker` | `224 71% 4%` | Daha koyu arka plan |
| `--surface-darkest` | `216 33% 3%` | En koyu zemin |
| `--surface-midnight` | `228 49% 10%` | Gece modu panel |
| `--surface-navy` | `216 60% 10%` | Navy panel |
| `--surface-navy-mid` | `216 62% 16%` | Navy orta ton |
| `--brand-cyan` | `189 78% 53%` | Marka rengi (cyan) |
| `--vortice-green` | `149 100% 29%` | Vortice yeşili |
| `--italian-red` | `355 66% 49%` | İtalyan kırmızısı |
| `--primary-navy` | `226 71% 40%` | Birincil lacivert |
| `--secondary-blue` | `201 98% 39%` | İkincil mavi |
| `--industrial-gray` | `215 19% 27%` | Endüstriyel gri |
| `--steel-gray` | `220 9% 46%` | Çelik grisi |
| `--light-gray` | `220 14% 96%` | Açık gri |
| `--air-blue` | `202 100% 96%` | Hava mavisi |
| `--clean-white` | `0 0% 100%` | Temiz beyaz |

### Light Mode (.light)
| Token | HSL Değeri |
|-------|-----------|
| `--surface-deep` | `210 40% 96%` |
| `--surface-darker` | `215 28% 93%` |
| `--surface-darkest` | `220 20% 90%` |
| `--surface-midnight` | `220 25% 95%` |
| `--surface-navy` | `215 20% 93%` |
| `--surface-navy-mid` | `215 22% 88%` |
| `--brand-cyan` | `189 78% 40%` |

### Sabit Renkler (tema bağımsız)
| Token | HEX | Kullanım |
|-------|-----|----------|
| `success-green` | `#10B981` | Başarı durumu |
| `warning-orange` | `#F59E0B` | Uyarı durumu |
| `gold-accent` | `#D97706` | Altın vurgu |
| `silver-accent` | `#9CA3AF` | Gümüş vurgu |

---

## Tailwind Config Token'ları (tailwind.config.js)

### Renk Eşlemeleri
Tüm CSS token renkleri `<alpha-value>` uyumlu:
```
bg-surface-deep → hsl(var(--surface-deep) / <alpha-value>)
text-brand-cyan → hsl(var(--brand-cyan) / <alpha-value>)
```
Opacity modifier destekli: `bg-surface-deep/40`, `text-brand-cyan/80`

### Font Family
- `font-sans`: Inter, system-ui, sans-serif

### Font Size
- `text-display`: `clamp(2.5rem, 1rem + 5vw, 5.5rem)` / line-height: 1.1

### Border Radius
| Token | Değer |
|-------|-------|
| `rounded-hvac-sm` | `0.375rem` (6px) |
| `rounded-hvac-md` | `1rem` (16px) |
| `rounded-hvac-lg` | `1.5rem` (24px) |
| `rounded-hvac-xl` | `2rem` (32px) |
| `rounded-hvac-2xl` | `2.5rem` (40px) |
| `rounded-hvac-3xl` | `3rem` (48px) |

### Z-Index Scale
| Token | Değer | Kullanım |
|-------|-------|----------|
| `z-raised` | `10` | Yükseltilmiş eleman |
| `z-dropdown` | `50` | Açılır menü |
| `z-sticky` | `90` | Yapışkan header |
| `z-modal` | `100` | Modal/dialog |
| `z-toast` | `9999` | Toast bildirim |

### Max Width
| Token | Değer |
|-------|-------|
| `max-w-page` | `100rem` (1600px) |
| `max-w-content` | `56.25rem` (900px) |
| `max-w-modal` | `26.25rem` (420px) |

### Box Shadow
| Token | Değer | Kullanım |
|-------|-------|----------|
| `shadow-hvac` | `0 4px 6px -1px rgba(30,64,175,0.1)` | Standart kart |
| `shadow-hvac-lg` | `0 10px 15px -3px rgba(30,64,175,0.1)` | Büyük kart |
| `shadow-glass` | `0 8px 32px 0 rgba(31,38,135,0.37)` | Glass efekt |
| `shadow-glow-cyan-xs` | `0 0 10px rgba(34,211,238,0.3)` | Küçük glow |
| `shadow-glow-cyan-sm` | `0 0 20px rgba(34,211,238,0.3)` | Orta glow |
| `shadow-glow-cyan-md` | `0 0 20px rgba(34,211,238,0.4)` | Büyük glow |
| `shadow-glow-cyan-lg` | `0 0 15px rgba(34,211,238,0.5)` | Hero glow |
| `shadow-glow-cyan` | `0 0 10px #22D3EE` | Saf cyan glow |
| `shadow-depth-heavy` | `0 20px 50px rgba(0,0,0,0.5)` | Ağır derinlik |
| `shadow-glow-white` | `0 0 40px rgba(255,255,255,0.2)` | Beyaz glow |
| `shadow-elevation-xl` | `0 40px 80px -20px rgba(0,0,0,0.08)` | XL yükseklik |
| `shadow-ring` | `0 0 0 2px` | Focus ring |

### Letter Spacing
| Token | Değer | Kullanım |
|-------|-------|----------|
| `tracking-hvac-tight` | `0.1em` | Sıkı caps |
| `tracking-hvac-snug` | `0.15em` | Dar etiket |
| `tracking-hvac-normal` | `0.2em` | Normal etiket |
| `tracking-hvac-relaxed` | `0.3em` | Rahat spacing |
| `tracking-hvac-wide` | `0.4em` | Geniş |
| `tracking-hvac-wider` | `0.5em` | Çok geniş |

### Line Height
| Token | Değer |
|-------|-------|
| `leading-hvac-tight` | `1.1` |
| `leading-hvac-snug` | `1.2` |

### Height
| Token | Değer |
|-------|-------|
| `h-hvac-hero` | `600px` |
| `h-hvac-section` | `500px` |
| `h-hvac-card` | `300px` |
| `h-hvac-panel` | `400px` |
| `h-hvac-input` | `42px` |

### Scale (hover/active)
| Token | Değer |
|-------|-------|
| `scale-98` | `0.98` |
| `scale-102` | `1.02` |

### Transition Property
| Token | Değer |
|-------|-------|
| `transition-opacity-transform` | `opacity, transform` |
| `transition-opacity-only` | `opacity` |

### Blur
| Token | Değer |
|-------|-------|
| `blur-100` | `100px` |
| `blur-120` | `120px` |
| `backdrop-blur-xs` | `2px` |

### Opacity (micro)
| Token | Değer |
|-------|-------|
| `opacity-1` | `0.01` |
| `opacity-2` | `0.02` |
| `opacity-3` | `0.03` |
| `opacity-5` | `0.05` |
