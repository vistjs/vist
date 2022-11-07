<template>
  <div
    class="box"
    :style="{ backgroundColor: backgroundColor }"
    @dragover="handleDragOver"
    @drop="handleDrop"
    @dragleave="handleDragLeave"
  >
    <Card v-if="card" />
    <span v-else>Box</span>
  </div>
</template>

<script lang="ts" setup>
import Card from './Card.vue';

interface Props {
  card: boolean;
  moveCard: Function;
  index: number;
}
const { card, index, moveCard } = defineProps<Props>();

const isOver = ref<boolean>(false);
const backgroundColor = isOver.value ? '#bbf' : 'rgba(0,0,0,.12)';

function handleDragOver(e: any) {
  console.log(`${index},handleDragOver`, e.dataTransfer.types[0]);
  if (e.dataTransfer.types[0] === 'text/plain') {
    isOver.value = true;
    e.preventDefault();
  }
}

function handleDrop(e: any) {
  const dataJSON = e.dataTransfer.getData('text/plain');
  console.log(`${index},handleDrop`);
  let data;
  try {
    data = JSON.parse(dataJSON);
  } catch {}
  if (data && data.type === 'card') {
    moveCard();
  }
}

function handleDragLeave(e: any) {
  isOver.value = false;
  console.log(`${index},handleDragLeave`, e);
}
</script>

<style scoped>
.box {
  width: 300px;
  height: 300px;
  display: flex;
  justify-content: center;
  align-items: center;
  background-color: rgba(0, 0, 0, 0.12);
  border: 2px solid rgba(0, 0, 0, 0.24);
  margin-right: 20px;
  border-radius: 10px;
}
</style>
