<script setup lang="ts">
import type { ClicksContext, SlideRoute } from '@slidev/types'
import { useHead } from '@unhead/vue'
import { useWindowSize } from '@vueuse/core'
import { computed, nextTick, reactive, shallowRef, watch } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { createFixedClicks } from '@slidev/client/composables/useClicks.ts'
import { slidesTitle } from '@slidev/client/env.ts'
import SlideWrapper from '@slidev/client/internals/SlideWrapper.vue'
import { getSlidePath } from '@slidev/client/logic/slides.ts'
import { CLICKS_MAX } from '@slidev/client/constants.ts'
import { slides } from '#slidev/slides'

useHead({ title: `Musician - ${slidesTitle}` })

const route = useRoute()
const router = useRouter()
const windowSize = useWindowSize()

const blocks: Map<number, HTMLElement> = reactive(new Map())
const activeSlide = shallowRef<number | null>(null)
const clicksContextMap = new WeakMap<SlideRoute, ClicksContext>()

const lyricSlides = computed(() => {
  return slides.value.filter((slide) => {
    const filepath = slide.meta?.slide?.filepath ?? ''
    return filepath.includes('/pages/lyrics/')
  })
})

const viewScope = computed<'song' | 'all'>(() => {
  const rawScope = route.query.scope
  if (rawScope != null) {
    const normalized = String(rawScope).trim().toLowerCase()
    return normalized === 'song' ? 'song' : 'all'
  }

  // 當網址有指定 slide/from 時，預設用單首模式（例如 /3?musician）
  const hasTargetSlide = route.query.slide != null || route.query.from != null
  return hasTargetSlide ? 'song' : 'all'
})

const initialSlideNo = computed(() => {
  const queryValue = route.query.slide ?? route.query.from
  const parsed = Number.parseInt(String(queryValue ?? ''), 10)
  return Number.isFinite(parsed) ? parsed : lyricSlides.value[0]?.no ?? 1
})

const targetSongFilepath = computed(() => {
  const targetSlide = slides.value.find(slide => slide.no === initialSlideNo.value)
  const filepath = targetSlide?.meta?.slide?.filepath ?? ''
  return filepath.includes('/pages/lyrics/') ? filepath : ''
})

const visibleSlides = computed(() => {
  if (viewScope.value !== 'song' || !targetSongFilepath.value)
    return lyricSlides.value

  return lyricSlides.value.filter(slide => (slide.meta?.slide?.filepath ?? '') === targetSongFilepath.value)
})

const activeSongTitle = computed(() => {
  return targetSongFilepath.value ? getSongLabel(targetSongFilepath.value) : ''
})

const songLinks = computed(() => {
  const items: Array<{ label: string, no: number }> = []
  const seen = new Set<string>()
  const sourceSlides = viewScope.value === 'song' ? visibleSlides.value : lyricSlides.value

  sourceSlides.forEach((slide) => {
    const filepath = slide.meta?.slide?.filepath ?? ''
    if (!filepath || seen.has(filepath))
      return

    seen.add(filepath)
    items.push({
      label: getSongLabel(filepath),
      no: slide.no,
    })
  })

  return items
})

function getClicksContext(slide: SlideRoute) {
  if (!clicksContextMap.has(slide))
    clicksContextMap.set(slide, createFixedClicks(slide, CLICKS_MAX))
  return clicksContextMap.get(slide)!
}

function getSongLabel(filepath: string) {
  return filepath
    .split('/')
    .pop()
    ?.replace(/\.md$/i, '') ?? filepath
}

function scrollToSlide(no: number, behavior: ScrollBehavior = 'smooth') {
  const el = blocks.get(no)
  if (!el)
    return

  activeSlide.value = no
  el.scrollIntoView({ behavior, block: 'start' })
}

function jumpToSong(no: number) {
  router.replace({
    path: '/musician',
    query: {
      ...route.query,
      musician: '1',
      slide: String(no),
      scope: 'song',
    },
  })
  scrollToSlide(no)
}

function switchScope(scope: 'song' | 'all') {
  const query = {
    ...route.query,
    musician: '1',
    scope,
    slide: scope === 'song'
      ? String(initialSlideNo.value)
      : undefined,
  }

  router.replace({
    path: '/musician',
    query,
  })
}

function backToSlides() {
  const query = { ...route.query }
  delete query.musician
  delete query.slide
  delete query.from
  delete query.scope

  router.push({
    path: getSlidePath(initialSlideNo.value, false),
    query,
  })
}

function openSingleSlide(no: number) {
  const query = { ...route.query }
  delete query.musician
  delete query.slide
  delete query.from
  delete query.scope

  router.push({
    path: getSlidePath(no, false),
    query,
  })
}

watch(
  () => [route.query.slide, route.query.scope, visibleSlides.value.length],
  async () => {
    await nextTick()
    const first = visibleSlides.value[0]?.no ?? initialSlideNo.value
    scrollToSlide(first, 'auto')
  },
  { immediate: true },
)
</script>

<template>
  <div class="musician-page">
    <header class="musician-toolbar">
      <div class="musician-toolbar-title">
        <strong>Musician Mode</strong>
        <span v-if="viewScope === 'song'">
          單首模式: {{ activeSongTitle || '未命中歌詞頁' }} ({{ visibleSlides.length }} 頁)
        </span>
        <span v-else>
          全歌單模式: {{ visibleSlides.length }} 個歌詞頁
        </span>
      </div>

      <div class="musician-song-list">
        <button
          v-for="song in songLinks"
          :key="song.no"
          class="song-chip"
          :class="activeSlide === song.no ? 'is-active' : ''"
          @click="jumpToSong(song.no)"
        >
          {{ song.label }}
        </button>
      </div>

      <button class="exit-btn" @click="backToSlides()">回投影片模式</button>
    </header>

    <main class="musician-main musician-doc-mode">
      <div v-if="!visibleSlides.length" class="empty-state">
        這份投影片沒有找到歌詞頁。
      </div>

      <section
        v-for="slide in visibleSlides"
        :key="slide.no"
        :ref="(el) => {
          if (el) blocks.set(slide.no, el as HTMLElement)
          else blocks.delete(slide.no)
        }"
        class="musician-slide"
      >
        <SlideWrapper
          :route="slide"
          :clicks-context="getClicksContext(slide)"
          render-context="overview"
          class="musician-raw-slide"
        />
      </section>
    </main>

    <div class="scope-switcher" role="group" aria-label="musician scope switcher">
      <button
        class="scope-btn"
        :class="viewScope === 'song' ? 'is-active' : ''"
        @click="switchScope('song')"
      >
        單首
      </button>
      <button
        class="scope-btn"
        :class="viewScope === 'all' ? 'is-active' : ''"
        @click="switchScope('all')"
      >
        全歌單
      </button>
    </div>
  </div>
</template>

<style scoped>
.musician-page {
  min-height: 100vh;
  background: linear-gradient(180deg, #111827 0%, #030712 100%);
  color: #f8fafc;
}

.musician-toolbar {
  position: sticky;
  top: 0;
  z-index: 30;
  display: grid;
  grid-template-columns: auto 1fr auto;
  gap: 1rem;
  align-items: center;
  padding: 0.9rem 1rem;
  background: rgba(3, 7, 18, 0.92);
  backdrop-filter: blur(14px);
  border-bottom: 1px solid rgba(148, 163, 184, 0.2);
}

.musician-toolbar-title {
  display: flex;
  flex-direction: column;
  gap: 0.15rem;
  white-space: nowrap;
}

.musician-toolbar-title strong {
  font-size: 0.95rem;
  letter-spacing: 0.04em;
}

.musician-toolbar-title span {
  font-size: 0.78rem;
  color: #cbd5e1;
}

.musician-song-list {
  display: flex;
  gap: 0.55rem;
  overflow-x: auto;
  padding-bottom: 0.15rem;
}

.song-chip,
.exit-btn,
.open-slide-btn {
  border: 1px solid rgba(148, 163, 184, 0.25);
  background: rgba(15, 23, 42, 0.85);
  color: inherit;
  border-radius: 999px;
  cursor: pointer;
  transition: 0.2s ease;
}

.song-chip {
  padding: 0.45rem 0.8rem;
  font-size: 0.84rem;
  white-space: nowrap;
}

.song-chip:hover,
.exit-btn:hover,
.open-slide-btn:hover,
.song-chip.is-active {
  background: #ffd166;
  color: #111827;
  border-color: #ffd166;
}

.exit-btn,
.open-slide-btn {
  padding: 0.45rem 0.85rem;
  font-size: 0.82rem;
  font-weight: 700;
}

.musician-main {
  display: flex;
  flex-direction: column;
  gap: 1.25rem;
  padding: 1.2rem 1rem 2rem;
}

.musician-slide {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 0.65rem;
}

.slide-toolbar {
  width: min(100%, 1280px);
  display: flex;
  align-items: center;
  gap: 0.75rem;
  color: #cbd5e1;
  font-size: 0.82rem;
}

.slide-no {
  font-weight: 700;
  color: #ffd166;
}

.slide-file {
  flex: 1;
  min-width: 0;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.musician-slide-container {
  filter: drop-shadow(0 20px 40px rgba(0, 0, 0, 0.28));
}

.musician-slide-container :deep(.slidev-slide-content) {
  border-radius: 20px;
  overflow: hidden;
}

.empty-state {
  padding: 4rem 1rem;
  text-align: center;
  color: #cbd5e1;
}

.scope-switcher {
  position: fixed;
  left: 1rem;
  bottom: 1rem;
  z-index: 40;
  display: flex;
  gap: 0.45rem;
  padding: 0.45rem;
  border-radius: 999px;
  background: rgba(2, 6, 23, 0.85);
  border: 1px solid rgba(148, 163, 184, 0.25);
  backdrop-filter: blur(8px);
}

.scope-btn {
  border: 1px solid rgba(148, 163, 184, 0.3);
  background: rgba(15, 23, 42, 0.92);
  color: #e2e8f0;
  border-radius: 999px;
  cursor: pointer;
  padding: 0.4rem 0.85rem;
  font-size: 0.8rem;
  font-weight: 700;
  transition: 0.2s ease;
}

.scope-btn:hover,
.scope-btn.is-active {
  background: #ffd166;
  color: #111827;
  border-color: #ffd166;
}

@media (max-width: 900px) {
  .musician-toolbar {
    grid-template-columns: 1fr;
  }

  .exit-btn {
    justify-self: start;
  }

  .slide-toolbar {
    flex-wrap: wrap;
  }

  .scope-switcher {
    left: 0.6rem;
    right: 0.6rem;
    bottom: 0.6rem;
    justify-content: center;
  }
}
</style>