<script setup lang="ts">
import { onMounted, ref } from "vue";
import { useSlideContext } from "@slidev/client"; // 取得 $nav[11]

const props = defineProps<{
  anchors: Array<{ id: string; label: string }>;
}>();

const { $nav } = useSlideContext();
const anchorMap = ref<Record<string, number>>({});

onMounted(async () => {
  try {
    const res = await fetch("/anchor-map.json", { cache: "no-store" });
    anchorMap.value = await res.json();
    console.log("anchorMap loaded:", JSON.stringify(anchorMap.value));
    console.log("$nav:", $nav); // 印出 $nav 資訊
  } catch (e) {
    console.error("load anchor-map.json failed", e);
  }
});

function goTo(id: string) {
  const page = anchorMap.value[id];
  if (!page) {
    console.warn("找不到對應頁碼", id);
    return;
  }
  if (typeof $nav.navTo === "function") {
    $nav.navTo(page);
  } else {
    console.error("$nav.navTo 不是函式，請檢查 slidev API");
  }
  setTimeout(() => {
    document.getElementById(id)?.scrollIntoView({ behavior: "smooth", block: "start" });
  }, 100);
}
</script>

<template>
  <div class="flex gap-2">
    <button
      v-for="a in anchors"
      :key="a.id"
      class="px-3 py-1 rounded bg-blue hover:bg-blue-300"
      @click="goTo(a.id)"
    >
      {{ a.label }}
    </button>
  </div>
</template>
