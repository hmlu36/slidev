<!-- components/JumpToById.vue -->
<template>
  <button type="button" class="jump-link" @click="jump"><slot>→ 跳轉</slot></button>
</template>

<script setup lang="ts">
import { nextTick } from 'vue'

const props = defineProps<{ target: string }>() // 例如 'holy-forever-chorus1'

// 全域快取：ID -> 頁碼（若誤命中會自動刪除重建）
const cache = (window as any).__jumpIdCache ||= new Map<string, number>()
let busy = false
const sleep = (ms=80)=>new Promise(r=>setTimeout(r, ms))
const hasId = (id:string)=>{
  const el = document.getElementById(id)
  if (!el) return false
  const rect = el.getBoundingClientRect()
  // 在 viewport 範圍內就視為可見；必要時可改成更嚴格的判定
  return rect.bottom > 0 && rect.top < window.innerHeight
}

async function goAndWait(p: number) {
  if ($slidev.nav.currentPage !== p) $slidev.nav.go(p)
  await nextTick(); await sleep() // 視轉場效果可調 60~120ms
}

async function resolvePage(id: string) {
  // 先用快取，但要驗證；驗證失敗就刪快取
  if (cache.has(id)) {
    const p = cache.get(id)!
    await goAndWait(p)
    if (hasId(id)) return p
    cache.delete(id)
  }
  const base = $slidev.nav.currentPage
  const total = $slidev.nav.total

  // 先檢查當前頁
  if (hasId(id)) { cache.set(id, base); return base }

  // 先向後、再向前掃描
  for (const dir of [1, -1]) {
    for (let step = 1; step <= total; step++) {
      const p = base + dir * step
      if (p < 1 || p > total) continue
      await goAndWait(p)
      if (hasId(id)) { cache.set(id, p); return p }
    }
  }
  return -1
}
async function jump(e: MouseEvent) {
  if (busy) return
  busy = true
  e.preventDefault()
  e.stopPropagation()

  // 先標記，讓 global click/mousedown handler 在這段時間內忽略換頁
  document.body.classList.add('jumping')
  setTimeout(()=>document.body.classList.remove('jumping'), 350)

  const id = props.target

  // 同頁直接滾動
  if (hasId(id)) {
    document.getElementById(id)!.scrollIntoView({ behavior: 'smooth', block: 'start' })
    busy = false
    return
  }

  // 解析頁碼並導過去
  const found = await resolvePage(id)
  if (found > 0) {
    await goAndWait(found)

    // 驗證；若仍未找到，嘗試 ±1 容錯（處理偶發轉場/延遲）
    let el = document.getElementById(id)
    if (!el) {
      for (const p of [found + 1, found - 1]) {
        if (p >= 1 && p <= $slidev.nav.total) {
          await goAndWait(p)
          if (hasId(id)) { cache.set(id, p); el = document.getElementById(id)!; break }
        }
      }
    }

    if (el) el.scrollIntoView({ behavior: 'smooth', block: 'start' })
    else console.warn('找不到目標 ID：', id, '已清除快取並待下次重試')
  } else {
    console.warn('找不到目標 ID：', id)
  }

  busy = false
}
</script>

<style scoped>
.jump-link {
  appearance: none; background: none; border: 0; padding: 0;
  color: #3b82f6; text-decoration: underline; cursor: pointer;

  
  /* 改為 block，會自動換行 */
  display: block;
  margin: 0.25rem 0;
}
</style>
