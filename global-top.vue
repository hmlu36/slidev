<template>
  <!-- 移除 @wheel/@click，避免攔截底層 <a> -->
  <div class="scroll-area absolute inset-0">
    <div v-if="isLyricSlide" class="lyric-nav absolute top-4 right-4 flex gap-2 z-10">
      <button @click.stop="goToSection('verse1')" class="nav-btn">V1</button>
      <button @click.stop="goToSection('chorus1')" class="nav-btn">C1</button>
      <button @click.stop="goToSection('bridge')"  class="nav-btn">Bridge</button>
      <button @click.stop="goToSection('chorus2')" class="nav-btn">C2</button>
      <span class="page-info">{{ $slidev.nav.currentPage }} / {{ $slidev.nav.total }}</span>
    </div>
  </div>
</template>

<script setup lang="ts">
import { onMounted, onBeforeUnmount, computed } from 'vue'

const isLyricSlide = computed(() => {
  return $slidev.nav.currentRoute?.path?.includes('lyrics')
})

function goToSection(sectionName: string) {
  // 直接用尾碼匹配，避免 slug 解析失敗
  const el = document.querySelector<HTMLElement>(`[id$="-${sectionName}"]`)
          || document.getElementById(sectionName)
  if (el) el.scrollIntoView({ behavior: 'smooth', block: 'start' })
}

function onWheel(e: WheelEvent) {
  if (e.deltaY > 0) $slidev.nav.next()
  else $slidev.nav.prev()
}

function onDocClick(e: MouseEvent) {
  const t = e.target as HTMLElement
  // 點到 <a>/<button>/導航區就放行；點空白才換頁
  if (t.closest('a, button, .lyric-nav')) return
  $slidev.nav.next()
}

// ----- QR helpers: find imgs[data-target], build absolute https URL, update QR and click handler -----
function updateQrImages(): void {
  try {
    // accept either data-target or class 'qr' (single attribute authoring)
    document.querySelectorAll<HTMLImageElement>('img[data-target], img.qr').forEach((img) => {
      // prefer explicit data-target
      let target = img.getAttribute('data-target') || ''

      // if no data-target, try to infer from a non-QR src (author used src as the target)
      if (!target) {
        const srcAttr = img.getAttribute('src') || ''
        if (srcAttr && !srcAttr.includes('api.qrserver.com')) {
          target = srcAttr
          // remember original target in data-original for later
          img.dataset.original = target
        }
      }

      if (!target) return

      let abs = target
      try { abs = new URL(target, window.location.href).href } catch (e) { abs = target }
      if (location.protocol === 'https:' && abs.indexOf('http:') === 0) abs = abs.replace(/^http:/, 'https:')

      const qr = 'https://api.qrserver.com/v1/create-qr-code/?size=96x96&data=' + encodeURIComponent(abs)
      img.src = qr
      img.style.cursor = 'pointer'

      // bind click only once
      if (!img.dataset.bound) {
        img.addEventListener('click', () => { window.open(abs, '_blank') })
        img.dataset.bound = '1'
      }
    })
  } catch (e) {
    // fail silently
  }
}

let qrObserver: MutationObserver | null = null

onMounted(() => {
  window.addEventListener('wheel', onWheel, { passive: true })
  document.addEventListener('click', onDocClick, true) // capture 階段較穩

  // Run once on mount
  updateQrImages()

  // Observe DOM changes (slides may be re-rendered)
  try {
    qrObserver = new MutationObserver((mutations) => {
      // quick heuristic: if nodes added, re-run update
      for (const m of mutations) {
        if (m.addedNodes && m.addedNodes.length) { updateQrImages(); break }
      }
    })
    qrObserver.observe(document.body, { childList: true, subtree: true })
  } catch (e) { /* noop */ }
})

onBeforeUnmount(() => {
  window.removeEventListener('wheel', onWheel)
  document.removeEventListener('click', onDocClick, true)
  if (qrObserver) { qrObserver.disconnect(); qrObserver = null }
})
</script>

<style scoped>
.scroll-area {
  width: 100%;
  height: 100vh;
  pointer-events: none; /* 讓事件穿透到底層內容 */
}
.lyric-nav {
  pointer-events: auto; /* 導航按鈕仍可點 */
  background-color: rgba(0, 0, 0, 0.7);
  border-radius: 8px;
  padding: 8px 12px;
}
.nav-btn {
  padding: 4px 8px;
  background-color: #4CAF50;
  color: white;
  border: none;
  border-radius: 4px;
  cursor: pointer;
  font-size: 0.8rem;
}
.nav-btn:hover { background-color: #45a049; }
.page-info {
  color: #fff; font-size: 0.8rem; display: flex; align-items: center; padding: 0 5px;
}
</style>
