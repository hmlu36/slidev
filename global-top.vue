<template>
  <div class="scroll-area absolute bottom-0 left-0 right-0 p-2"></div>
</template>

<script setup lang="ts">
import { onMounted, onUnmounted } from "vue";

const scrollPage = (e: { deltaY: number }) => {
  if (e.deltaY > 0) {
    $slidev.nav.next();
  } else {
    $slidev.nav.prev();
  }
};

const handleMouseClick = (e: MouseEvent) => {
  const target = e.target as HTMLElement;

  // 檢查是否點擊到按鈕或其子元素
  const button = target.closest("button");
  if (button) {
    return; // 讓按鈕的點擊事件正常執行
  }

  // 檢查是否點擊到錨點連結或其子元素
  const anchorLink = target.closest('a[href^="#"]') as HTMLAnchorElement;
  if (anchorLink) {
    return;
  }

  // 檢查是否點擊到任何連結
  const anyLink = target.closest("a") as HTMLAnchorElement;
  if (anyLink) {
    return;
  }

  e.preventDefault();
  if (e.button === 0) {
    $slidev.nav.next();
  } else if (e.button === 2) {
    $slidev.nav.prev();
  }
};

onMounted(() => {
  window.addEventListener("wheel", scrollPage);
  // 使用 capture 階段監聽，但優先級較低
  document.addEventListener("mousedown", handleMouseClick, true);
});

onUnmounted(() => {
  window.removeEventListener("wheel", scrollPage);
  document.removeEventListener("mousedown", handleMouseClick, true);
});
</script>

<style scoped>
.scroll-area {
  width: 100%;
  height: 100vh;
  pointer-events: none; /* 關鍵：讓此 div 不攔截點擊事件 */
}
</style>
