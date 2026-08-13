<!-- components/WeekDate.vue -->
<!--
  從 main.md 的 src 引入檔名（如 pages/2026/20260814.md）自動組出日期。
  用法：在 main.md 標題處放 <WeekDate />，即可取代手寫的 # 2026/08/14。
  （利用 Vite `?raw` import，建置時即打包，dev 與 production 皆可用）
-->
<script setup lang="ts">
import { computed } from 'vue'
import mainRaw from '../main.md?raw'

const dateText = computed(() => {
  const m = mainRaw.match(/^src:\s*([^\s]+\.md)/m)
  if (!m) return ''
  const dm = m[1].match(/(\d{4})(\d{2})(\d{2})\.md$/)
  return dm ? `${dm[1]}/${dm[2]}/${dm[3]}` : ''
})
</script>

<template>
  <!-- 用 <h1> 才能跟底下 # 小組敬拜 標題字體大小一致 -->
  <h1>{{ dateText }}</h1>
</template>