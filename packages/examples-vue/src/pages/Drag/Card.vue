<template>
  <div
    class="card"
    :style="{
      backgroundColor: backgroundColor,
    }"
    draggable="true"
    @dragstart="handleDragStart"
    @dragend="handleDragEnd"
  >
    Card
  </div>
</template>

<script lang="ts" setup>
const isDragging = ref<boolean>(false);
const backgroundColor = isDragging.value ? '#fbb' : 'palegoldenrod';
function handleDragStart(e: any) {
  isDragging.value = true;
  const data = JSON.stringify({ type: 'card' });
  e.dataTransfer.setData('text/plain', data);
}
function handleDragEnd(e: any) {
  isDragging.value = false;
  e.dataTransfer.clearData();
}
</script>

<style scoped>
.card {
  width: 100%;
  height: 100%;
  display: flex;
  justify-content: center;
  align-items: center;
  background-color: palegoldenrod;
  border-radius: 10px;
}
</style>
