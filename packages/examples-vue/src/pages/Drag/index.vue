<template>
  <div class="drag-page">
    <Box :card="index === 1" :index="1" :moveCard="moveCard.bind(null, 1)"></Box>
    <Box :card="index === 2" :index="2" :moveCard="moveCard.bind(null, 2)"></Box>
    <Box :card="index === 3" :index="3" :moveCard="moveCard.bind(null, 3)"></Box>
  </div>
</template>

<script lang="ts" setup>
import Box from './Box.vue';
const index = ref<number>(1);
function moveCard(i: any) {
  index.value = i;
}
</script>

<style>
.drag-page {
  display: flex;
  margin: 20px;
  margin-left: 50px;
}
</style>
