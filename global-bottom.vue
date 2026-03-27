<template>
  <div></div>
</template>

<script setup lang="ts">
import { onMounted, onUnmounted, watch } from 'vue'
import { useRouter } from 'vue-router'

const router = useRouter()
let observer: MutationObserver | null = null

function isChordHiddenByFrontmatter(): boolean {
  try {
    const nav = ($slidev as any)?.nav
    if (!nav) return false
    const currentPage = nav.currentPage as number
    const slides = nav.slides as any[] | undefined
    if (!slides?.length || !currentPage) return false
    const currentIndex = currentPage - 1
    const current = slides[currentIndex]
    if (!current) return false
    // 找出同一個來源檔案（source.filepath）的第一張，只需在那張設定 hideChords
    const getFilepath = (s: any): string | null =>
      s?.meta?.slide?.filepath ?? s?.source?.filepath ?? s?.filepath ?? null
    const getStart = (s: any): number | null =>
      typeof s?.meta?.slide?.start === 'number'
        ? s.meta.slide.start
        : typeof s?.start === 'number'
          ? s.start
          : null
    const getFrontmatter = (s: any): any =>
      s?.meta?.slide?.frontmatter ?? s?.frontmatter
      
    const currentFilepath = getFilepath(current)
    let firstOfFile = currentFilepath
      ? slides.find((s: any) => getFilepath(s) === currentFilepath)
      : current

    // 在 production build（如 GitHub Pages）可能拿不到 filepath，改以 slide.start 反推同檔第一頁
    if (!currentFilepath) {
      for (let i = currentIndex; i >= 0; i--) {
        if (getStart(slides[i]) === 0) {
          firstOfFile = slides[i]
          break
        }
      }
    }
      
    return getFrontmatter(firstOfFile)?.hideChords === true
  } catch {
    return false
  }
}

function applyChordVisibilityFlag() {
  document.body.classList.toggle('hide-chords', isChordHiddenByFrontmatter())
}

function parseChords() {
  applyChordVisibilityFlag()
  if (isChordHiddenByFrontmatter()) return

  // 只針對還沒被解析過的 h1 標籤進行替換，大幅提升效能
  const h1s = document.querySelectorAll('.slidev-layout h1:not([data-chord-parsed])')
  if (!h1s.length) return
  
  h1s.forEach(h1 => {
    h1.setAttribute('data-chord-parsed', 'true')

    const walkContext = document.createTreeWalker(h1, NodeFilter.SHOW_TEXT, null)
    const nodesToReplace: { oldNode: Text, newNodes: Node[] }[] = []

    let currentNode = walkContext.nextNode()
    while (currentNode) {
      const text = currentNode.nodeValue || ''
      if (text.includes('[')) {
        const fragment = document.createDocumentFragment()
        
        const parts = text.split(/(\[[^\]]+\])/g)
        let hasMatch = false

        for (const part of parts) {
          if (!part) continue

          if (part.startsWith('[') && part.endsWith(']')) {
             hasMatch = true
             const chordText = part.slice(1, -1)
             
             const wrapper = document.createElement('span')
             wrapper.className = 'chord-pair'
             
             const chordSpan = document.createElement('span')
             chordSpan.className = 'chord'
             chordSpan.textContent = chordText
             wrapper.appendChild(chordSpan)
             
             fragment.appendChild(wrapper)
          } else {
             fragment.appendChild(document.createTextNode(part))
          }
        }
        
        if (hasMatch) {
          nodesToReplace.push({ oldNode: currentNode as Text, newNodes: Array.from(fragment.childNodes) })
        }
      }
      currentNode = walkContext.nextNode()
    }

    for (const { oldNode, newNodes } of nodesToReplace) {
      const parent = oldNode.parentNode
      if (parent) {
        for (const newNode of newNodes) {
          parent.insertBefore(newNode, oldNode)
        }
        parent.removeChild(oldNode)
      }
    }
  })
}

onMounted(() => {
  applyChordVisibilityFlag()
  setTimeout(parseChords, 100)
  setTimeout(parseChords, 500)
  
  watch(() => router.currentRoute.value.fullPath, () => {
    applyChordVisibilityFlag()
    setTimeout(parseChords, 100)
    setTimeout(parseChords, 500)
  })

  // 樂手模式是將所有頁面放在同一個大網格內，會隨著捲動動態載入元素 (Lazy Load)
  // 所以除了翻頁，我們也建立 MutationObserver 隨時監聽被塞進來的新投影片
  observer = new MutationObserver((mutations) => {
    let shouldParse = false
    for (const m of mutations) {
      if (m.addedNodes.length > 0) {
        shouldParse = true
        break
      }
    }
    if (shouldParse) {
      parseChords()
    }
  })

  observer.observe(document.body, {
    childList: true,
    subtree: true
  })
})

onUnmounted(() => {
  if (observer) {
    observer.disconnect()
  }
  document.body.classList.remove('hide-chords')
})
</script>

<style>
/* 為了讓這個置換不要干擾排版，只針對 .chord-pair 做綁定 */
.chord-pair {
  position: relative;
  display: inline-block; /* 綁定和弦與字 */
}

/* 浮動在字首正上方，或者在空格上方 */
.chord {
  position: absolute;
  top: -4em; /* 往上推大約一個巨型字體的高度 */
  left: 1.3em;
  width: 1em; /* 給和弦一個基礎寬度 */
  display: flex;
  justify-content: center; /* 讓和弦置中於這個點 */
  transform: translateX(-50%); /* 往回拉一半，確保以字元的起始點為中心 */
  color: #ff9800 !important;
  font-family: 'Cascadia Mono', 'Consolas', 'Courier New', monospace;
  font-size: 0.32em; /* 相對於 h1 的比例 */
  font-weight: 600;
  letter-spacing: 0;
  white-space: nowrap;
}

/* 樂手模式縮放修正 */
body.musician-mode .chord {
  font-size: 0.65em !important;
  text-shadow: 1px 1px 2px rgba(0, 0, 0, 0.8);
  top: -2.1em; /* 往上推大約一個巨型字體的高度 */
  left: 0.8em;
}

/* 以 frontmatter 控制暫時隱藏和弦 */
body.hide-chords .chord,
.slidev-layout.hide-chords .chord {
  display: none !important;
}
</style>
