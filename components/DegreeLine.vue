<template>
  <div class="degree-line pin" :style="containerStyle">
    <span
      v-for="(item, index) in parsedItems"
      :key="index"
      :class="pointClass(item.left)"
      :style="{ left: `${item.left}%` }"
    >
      {{ item.text }}
    </span>
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue'

const props = defineProps<{
  points: string
  width?: string
}>()

type PointItem = {
  left: number
  text: string
}

const parsedItems = computed<PointItem[]>(() => {
  return props.points
    .split(',')
    .map((chunk) => chunk.trim())
    .filter(Boolean)
    .map((chunk) => {
      const [leftText, text = ''] = chunk.split(':')
      const left = Number.parseFloat((leftText ?? '').trim())
      return {
        left: Number.isFinite(left) ? left : 50,
        text: text.trim(),
      }
    })
})

const containerStyle = computed(() => {
  return props.width ? { '--pin-width': props.width } : undefined
})

function pointClass(left: number) {
  if (left <= 0) return 'edge-left'
  if (left >= 100) return 'edge-right'
  return ''
}
</script>
