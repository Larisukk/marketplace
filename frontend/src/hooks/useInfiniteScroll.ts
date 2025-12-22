import { useEffect, useRef } from 'react'

export function useInfiniteScroll(onBottom: () => void) {
  const ref = useRef<HTMLDivElement | null>(null)

  useEffect(() => {
    const el = ref.current
    if (!el) return
    const handler = () => {
      const nearBottom = el.scrollTop + el.clientHeight >= el.scrollHeight - 24
      if (nearBottom) onBottom()
    }
    el.addEventListener('scroll', handler)
    return () => el.removeEventListener('scroll', handler)
  }, [onBottom])

  return ref
}
