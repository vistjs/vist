import { createApp } from 'vue';
import { createRouter, createWebHistory } from 'vue-router';
// import routes from 'virtual:generated-pages';
import App from './App.vue';
import 'bootstrap/dist/css/bootstrap.min.css';
import Antd from 'ant-design-vue';
import 'ant-design-vue/dist/antd.css';
import routes from '~/routers';
import './styles/main.css';
import 'uno.css';
import Rtweb from 'rtweb';

new Rtweb({ remoteUrl: 'http://127.0.0.1:3000', pid: 1, requestMock: ['63459b8739ca915a6903c126.mockapi.io/**'] });

const app = createApp(App);
const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes,
});
app.use(router);
app.use(Antd);
app.mount('#app');
