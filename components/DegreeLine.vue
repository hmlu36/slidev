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
    .split(/[;,]/)
    .map((chunk) => chunk.trim())
    .filter(Boolean)
    .map(parsePointChunk)
})

function parsePointChunk(chunk: string): PointItem {
  // Readable syntax: "x=21 chord=4" (semicolon/comma separated between items)
  if (chunk.includes('=')) {
    const pairs = chunk
      .split(/\s+/)
      .map((part) => part.trim())
      .filter(Boolean)
      .reduce<Record<string, string>>((result, part) => {
        const [rawKey, ...rawValue] = part.split('=')
        const key = (rawKey ?? '').trim().toLowerCase()
        const value = rawValue.join('=').trim()
        if (key && value) result[key] = value
        return result
      }, {})

    const leftText = pairs.x ?? pairs.left ?? pairs.pos ?? pairs.position ?? ''
    const text = pairs.chord ?? pairs.text ?? pairs.label ?? pairs.degree ?? ''
    const left = Number.parseFloat(leftText)

    return {
      left: Number.isFinite(left) ? left : 50,
      text,
    }
  }

  // Legacy syntax: "21:4"
  const [leftText, text = ''] = chunk.split(':')
  const left = Number.parseFloat((leftText ?? '').trim())
  return {
    left: Number.isFinite(left) ? left : 50,
    text: text.trim(),
  }
}

const containerStyle = computed(() => {
  return props.width ? { '--pin-width': props.width } : undefined
})

function pointClass(left: number) {
  if (left <= 0) return 'edge-left'
  if (left >= 100) return 'edge-right'
  return ''
}
</script>
