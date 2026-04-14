'use client'

import { useEffect } from 'react'

export const ScrollObserver: React.FC = () => {
  useEffect(() => {
    if (typeof window === 'undefined') return;

    // IntersectionObserver: her element için sadece bir kez tetiklenir
    const observer = new IntersectionObserver(
      (entries, obs) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            entry.target.setAttribute('data-in-view', 'true')
            // Görünür olduktan sonra izlemeyi durdur — CPU tasarrufu
            obs.unobserve(entry.target)
          }
        })
      },
      {
        root: null,
        rootMargin: '0px 0px -50px 0px',
        threshold: 0.1,
      }
    )

    // data-observe elementlerini bul ve IntersectionObserver'a kaydet
    const observeNodes = () => {
      document.querySelectorAll('[data-observe]:not([data-in-view]):not([data-is-observed])').forEach((el) => {
        observer.observe(el)
        el.setAttribute('data-is-observed', 'true')
      })
    }

    // Hydration tamamlandıktan sonra ilk tarama.
    // 100ms beklemek: React'in DOM'u tamamen flush etmesini garantiler.
    const timerId = setTimeout(observeNodes, 100)

    // NOT: MutationObserver kaldırıldı.
    // HomePage'deki tüm bileşenler statik import (Suspense/lazy yok).
    // subtree:true ile document.body izlemek Hydration süresinde
    // yüzlerce observeNodes() tetikleyerek Main Thread'i kilitliyordu.
    // Gelecekte lazy bileşen eklenirse buraya debounce'lu MutationObserver eklenebilir.

    return () => {
      clearTimeout(timerId)
      observer.disconnect()
    }
  }, [])

  return null
}
