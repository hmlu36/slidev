<!-- components/WeekDate.vue -->
<!--
  從 main.md 的 src 引入檔名（如 pages/2026/20260814.md）自動組出日期，
  並判斷星期幾：禮拜日顯示「主日敬拜」，其餘顯示「小組敬拜」。
  用法：在 main.md 標題處放 <WeekDate />，即可取代手寫的日期與敬拜類型。
-->
<script setup lang="ts">
import { computed } from 'vue'
import mainRaw from '../main.md?raw'

const srcDate = computed(() => {
  const m = mainRaw.match(/^src:\s*([^\s]+\.md)/m)
  if (!m) return null
  const dm = m[1].match(/(\d{4})(\d{2})(\d{2})\.md$/)
  if (!dm) return null
  return new Date(Number(dm[1]), Number(dm[2]) - 1, Number(dm[3]))
})

const dateText = computed(() => {
  const d = srcDate.value
  if (!d) return ''
  const p = n => String(n).padStart(2, '0')
  return `${d.getFullYear()}/${p(d.getMonth() + 1)}/${p(d.getDate())}`
})

const typeText = computed(() => srcDate.value?.getDay() === 0 ? '主日敬拜' : '小組敬拜')
</script>

<template>
  <!-- 用 <h1> 才能跟標題字體大小一致 -->
  <h1>{{ dateText }}</h1>
  <h1>{{ typeText }}</h1>
</template>
