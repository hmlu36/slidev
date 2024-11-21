<template>
  <div class="scroll-area absolute bottom-0 left-0 right-0 p-2"></div>
</template>

<script setup lang="ts">
import { onMounted, onUnmounted } from 'vue';

const scrollPage = (e: { deltaY: number }) => {
  if (e.deltaY > 0) {
    $slidev.nav.next();
  } else {
    $slidev.nav.prev();
  }
}

const handleMouseClick = (e: MouseEvent) => {
  e.preventDefault(); // Prevent default behavior
  if (e.button === 0) { // Left mouse button
    $slidev.nav.next();
  } else if (e.button === 2) { // Right mouse button
    $slidev.nav.prev();
  }
}


const handleMouseMove = (e: MouseEvent) => {
  const target = e.target as HTMLElement;
  if (target.closest('a')) {
    document.body.style.cursor = 'pointer';
  } else {
    document.body.style.cursor = 'default';
  }
}

onMounted(() => {
  window.addEventListener('wheel', scrollPage);
  window.addEventListener('mousedown', handleMouseClick);
  window.addEventListener('mousemove', handleMouseMove);
});

onUnmounted(() => {
  window.removeEventListener('wheel', scrollPage);
  window.removeEventListener('mousedown', handleMouseClick);
  window.removeEventListener('mousemove', handleMouseMove);
});
</script>

<style scoped>
.scroll-area {
  width: 100%;
  height: 100vh;
}


.a {
  cursor: pointer; /* Change cursor to pointer when hovering over the link */
}
</style>