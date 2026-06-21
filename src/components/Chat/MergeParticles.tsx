import React, { useEffect, useRef } from 'react'

interface Props {
  anchorEl: HTMLElement | null
  count: number
  onDone: () => void
}

const COLORS = ['#7c5cff', '#4ade80', '#3a76f0', '#ffffff', '#f472b6']

export function MergeParticles({ anchorEl, count, onDone }: Props) {
  const containerRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    if (!anchorEl || !containerRef.current) return
    const rect = anchorEl.getBoundingClientRect()
    const cx = rect.left + rect.width / 2
    const cy = rect.top + rect.height / 2
    const particleCount = Math.min(10 + (count - 2) * 2, 18)
    const container = containerRef.current

    for (let i = 0; i < particleCount; i++) {
      const el = document.createElement('div')
      const angle = (Math.random() * 360 * Math.PI) / 180
      const dist = 30 + Math.random() * 55
      const size = 2.5 + Math.random() * 2.5
      const color = COLORS[Math.floor(Math.random() * COLORS.length)]
      const delay = Math.random() * 60

      el.style.cssText = `
        position: fixed;
        left: ${cx}px;
        top: ${cy}px;
        width: ${size}px;
        height: ${size}px;
        border-radius: 50%;
        background: ${color};
        pointer-events: none;
        transform: translate(-50%, -50%);
        animation: mergeParticle 380ms ease-out ${delay}ms forwards;
        --tx: ${Math.cos(angle) * dist}px;
        --ty: ${Math.sin(angle) * dist}px;
      `
      container.appendChild(el)
    }

    const timer = setTimeout(() => {
      onDone()
    }, 500)

    return () => clearTimeout(timer)
  }, [])

  return (
    <div
      ref={containerRef}
      style={{ position: 'fixed', inset: 0, pointerEvents: 'none', zIndex: 9999 }}
    />
  )
}
