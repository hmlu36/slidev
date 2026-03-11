<template>
  <!-- 移除 @wheel/@click，避免攔截底層 <a> -->
  <div class="scroll-area absolute inset-0">
    <div v-if="isLyricSlide && !isMusicianMode" class="lyric-nav absolute top-4 right-4 flex gap-2 z-10">
      <button @click.stop="goToSection('verse1')" class="nav-btn">V1</button>
      <button @click.stop="goToSection('chorus1')" class="nav-btn">C1</button>
      <button @click.stop="goToSection('bridge')"  class="nav-btn">Bridge</button>
      <button @click.stop="goToSection('chorus2')" class="nav-btn">C2</button>
      <span class="page-info">{{ $slidev.nav.currentPage }} / {{ $slidev.nav.total }}</span>
    </div>
  </div>
</template>

<script setup lang="ts">
import { onMounted, onBeforeUnmount, computed, watchEffect } from 'vue'
import { useQrImages } from './src/composables/useQr'

const isLyricSlide = computed(() => {
  return $slidev.nav.currentRoute?.path?.includes('lyrics')
})
const isMusicianMode = computed(() => {
  const pathname = window.location.pathname.replace(/\/+$/, '')
  const tail = pathname.split('/').pop()
  const query = new URLSearchParams(window.location.search)
  return tail === 'musician' || query.has('musician')
})

function getMusicianScale() {
  const w = window.innerWidth
  const h = window.innerHeight
  
  // 決定目前顯示欄數 (對齊 CSS @media 斷點)
  const cols = w >= 1024 ? 3 : (w >= 640 ? 2 : 1)
  
  // 目標寬度約為視窗寬度除以欄數 (扣除間距與內距 padding)
  const targetW = (w - (cols * 20)) / cols 
  const scaleW = targetW / 980 // 投影片基準寬度 980px
  
  // 決定最佳顯示列數 (Rows)
  // 如果是直立手機(1欄)，我們希望他上下能看清楚一點，不硬卡 2 排高度
  // 如果是橫向或平板(2~3欄)，盡量符合 1首歌 約可顯示 4~6 張 (大概 2~3 排)
  const roughRows = cols === 1 ? h / (targetW * 0.56) : 2.2 
  const targetH = (h - 60) / roughRows
  const scaleH = targetH / 552 // 投影片基準高度 552px
  
  // 綜合考量，手機直立模式寬度優先，不被高度過度壓縮
  if (cols === 1) {
    return Math.min(scaleW, 0.9)
  }
  
  // 橫向與多欄佈局：同時考量寬度與高度，避免某一張太大被切邊
  return Math.min(scaleW, scaleH, 0.45) 
}

function applyMusicianVars() {
  if (!isMusicianMode.value) {
    document.documentElement.style.removeProperty('--musician-scale')
    return
  }
  document.documentElement.style.setProperty('--musician-scale', String(getMusicianScale()))
}

function goToSection(sectionName: string) {
  // 直接用尾碼匹配，避免 slug 解析失敗
  const el = document.querySelector<HTMLElement>(`[id$="-${sectionName}"]`)
          || document.getElementById(sectionName)
  if (el) el.scrollIntoView({ behavior: 'smooth', block: 'start' })
}

function onWheel(e: WheelEvent) {
  if (isMusicianMode.value) return
  if (e.deltaY > 0) $slidev.nav.next()
  else $slidev.nav.prev()
}

function onDocClick(e: MouseEvent) {
  if (isMusicianMode.value) return
  const t = e.target as HTMLElement
  // 點到 <a>/<button>/導航區就放行；點空白才換頁
  if (t.closest('a, button, .lyric-nav')) return
  $slidev.nav.next()
}

const { update: updateQrImages, start: startQrObserver, stop: stopQrObserver } = useQrImages()

onMounted(() => {
  window.addEventListener('wheel', onWheel, { passive: false })
  document.addEventListener('click', onDocClick, true) // capture 階段較穩
  window.addEventListener('resize', applyMusicianVars)

  // Initialize QR handling (update + observe)
  startQrObserver()
  updateQrImages()
  applyMusicianVars()
})

watchEffect(() => {
  document.body.classList.toggle('musician-mode', isMusicianMode.value)
  applyMusicianVars()
})

onBeforeUnmount(() => {
  window.removeEventListener('wheel', onWheel)
  document.removeEventListener('click', onDocClick, true)
  window.removeEventListener('resize', applyMusicianVars)
  stopQrObserver()
  document.body.classList.remove('musician-mode')
  document.documentElement.style.removeProperty('--musician-scale')
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
