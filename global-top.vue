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
import { useQrImages } from './src/composables/useQr'

// 根據執行環境決定要載入的字型：本機用 TTF，部署用 WOFF2
// - 本機 (localhost / file://) => './fonts/toolkit/CWTEX-K.ttf'
// - 部署 (GitHub Pages 等)  => './fonts/CWTEX-K.subset.woff2'
const _injectCwtexFont = () => {
  try {
    const host = location.hostname || ''
    const isLocal = host === 'localhost' || host === '127.0.0.1' || host === '0.0.0.0' || location.protocol === 'file:'
    // 只替換 font URL / format，其他屬性保留一致（避免重複 CSS）
    const fontUrl = isLocal ? './fonts/toolkit/CWTEX-K.ttf' : './fonts/CWTEX-K.subset.woff2'
    const fontFormat = isLocal ? 'truetype' : 'woff2'
    const css = `@font-face{font-family:\'CWTEX-K\';src:url(\'${fontUrl}\') format(\'${fontFormat}\');font-display:swap;}`
    const s = document.createElement('style')
    s.setAttribute('data-injected', 'cwtex-env')
    s.textContent = css
    document.head.appendChild(s)
  } catch (e) {
    /* noop */
  }
}

_injectCwtexFont();

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

const { update: updateQrImages, start: startQrObserver, stop: stopQrObserver } = useQrImages()

onMounted(() => {
  window.addEventListener('wheel', onWheel, { passive: true })
  document.addEventListener('click', onDocClick, true) // capture 階段較穩

  // Initialize QR handling (update + observe)
  startQrObserver()
  updateQrImages()
})

onBeforeUnmount(() => {
  window.removeEventListener('wheel', onWheel)
  document.removeEventListener('click', onDocClick, true)
  stopQrObserver()
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
