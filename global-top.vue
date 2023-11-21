<template>
  <div class="scroll-area absolute bottom-0 left-0 right-0 p-2"  @wheel="scrollPage" @click="$slidev.nav.next"></div>
</template>

<script setup lang="ts">


const scrollPage = (e: { deltaY: number }) => {
  if (e.deltaY > 0) {
    $slidev.nav.next();
  } else {
    $slidev.nav.prev();
  }
}

</script>

<style scoped>

.scroll-area {
  width: 100%;
  height: 100vh;
}

</style>