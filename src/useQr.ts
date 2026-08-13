export function useQrImages() {
  const isBrowser = typeof window !== 'undefined' && typeof document !== 'undefined'
  let observer: MutationObserver | null = null

  function resolveAbsolute(target: string) {
    if (!isBrowser) return target
    try {
      // Special handling for leading-slash targets on GitHub Pages project sites
      if (target && target.startsWith('/') && location.hostname.endsWith('github.io')) {
        const parts = location.pathname.split('/').filter(Boolean)
        if (parts.length > 0) {
          const repoBase = location.origin + '/' + parts[0]
          return (repoBase + target).replace(/([^:])\/\//g, '$1/')
        }
        return new URL(target, window.location.origin).href
      }
      return new URL(target, document.baseURI || window.location.href).href
    } catch (e) {
      return target
    }
  }

  function update() {
    if (!isBrowser) return
    try {
      document.querySelectorAll<HTMLImageElement>('img[data-target], img.qr').forEach((img) => {
        let target = img.getAttribute('data-target') || ''

        if (!target) {
          const srcAttr = img.getAttribute('src') || ''
          if (srcAttr && !srcAttr.includes('api.qrserver.com')) {
            target = srcAttr
            img.dataset.original = target
          }
        }

        if (!target) return

        let abs = resolveAbsolute(target)
        if (location.protocol === 'https:' && abs.indexOf('http:') === 0) abs = abs.replace(/^http:/, 'https:')

        const qr = 'https://api.qrserver.com/v1/create-qr-code/?size=96x96&data=' + encodeURIComponent(abs)
        img.src = qr
        img.style.cursor = 'pointer'
        if (!img.dataset.bound) {
          img.addEventListener('click', () => { window.open(abs, '_blank') })
          img.dataset.bound = '1'
        }
      })
    } catch (e) {
      // silent
    }
  }

  function start() {
    if (!isBrowser) return
    update()
    try {
      if (!observer) {
        observer = new MutationObserver((mutations) => {
          for (const m of mutations) {
            if (m.addedNodes && m.addedNodes.length) { update(); break }
          }
        })
        observer.observe(document.body, { childList: true, subtree: true })
      }
    } catch (e) {
      // silent
    }
  }

  function stop() {
    if (observer) { observer.disconnect(); observer = null }
  }

  return { update, start, stop }
}
