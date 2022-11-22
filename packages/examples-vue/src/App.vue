<template>
  <a-layout>
    <a-layout-header class="header">
      <a-menu v-model:selectedKeys="selectedLinkKeys" theme="dark" mode="horizontal" :style="{ lineHeight: '64px' }">
        <a-menu-item v-for="route in routeLinks" :key="route.name"
          ><router-link :to="route.path">{{ route.name }}</router-link></a-menu-item
        >
      </a-menu>
    </a-layout-header>
    <a-layout-content style="padding: 0 50px">
      <a-layout style="padding: 24px 0; background: #fff">
        <a-layout-content :style="{ padding: '0 24px', minHeight: '280px' }"> <router-view /> </a-layout-content>
      </a-layout>
    </a-layout-content>
    <a-layout-footer style="text-align: center"> examples ©2022 Created by vistjs </a-layout-footer>
  </a-layout>
</template>

<script lang="ts" setup>
import { useRoute } from 'vue-router';
import routes from '~/routers';
const currentRoute = useRoute();
const routeLinks = routes.filter((item) => !item.hideInMenu);
const selectedLinkKeys = ref<string[]>(['form']);
watch(
  () => currentRoute.name,
  async (newName) => {
    selectedLinkKeys.value = [routeLinks.find((route) => route.name === newName)?.name || ''];
  }
);
</script>
<style>
#components-layout-demo-top-side .logo {
  float: left;
  width: 120px;
  height: 31px;
  margin: 16px 24px 16px 0;
  background: rgba(255, 255, 255, 0.3);
}

.ant-row-rtl #components-layout-demo-top-side .logo {
  float: right;
  margin: 16px 0 16px 24px;
}

.site-layout-background {
  background: #fff;
}
</style>
