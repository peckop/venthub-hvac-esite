'use client'

import { useEffect } from 'react'

export const ScrollObserver: React.FC = () => {
  useEffect(() => {
    if (typeof window === 'undefined') return;

    // IntersectionObserver instance - triggers only once per element
    const observer = new IntersectionObserver(
      (entries, obs) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            entry.target.setAttribute('data-in-view', 'true')
            // Once visible, stop tracking to save CPU
            obs.unobserve(entry.target)
          }
        })
      },
      {
        root: null,
        rootMargin: '0px 0px -50px 0px', // Trigger slighly before visible
        threshold: 0.1,
      }
    )

    // Helper to find and observe unobserved targets
    const observeNodes = () => {
      document.querySelectorAll('[data-observe]:not([data-in-view]):not([data-is-observed])').forEach((el) => {
        observer.observe(el)
        el.setAttribute('data-is-observed', 'true')
      })
    }

    // Initial check
    observeNodes();

    // Listen for dynamically added elements (like Suspense chunks) safely
    const mutObserver = new MutationObserver(() => {
      observeNodes()
    })
    
    mutObserver.observe(document.body, { childList: true, subtree: true })

    return () => {
      observer.disconnect()
      mutObserver.disconnect()
    }
  }, [])

  return null
}
