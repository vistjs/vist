import Form from '~/pages/Form.vue';
import Antd from '~/pages/Antd.vue';
import Drag from '~/pages/Drag/index.vue';
import Draggable from '~/pages/Draggable/index.vue';
import page404 from '~/pages/404.vue';

const routes = [
  { path: '/', name: 'home', component: Form, hideInMenu: true },
  { path: '/form', name: 'form', component: Form },
  { path: '/antd', name: 'antd', component: Antd },
  { path: '/drag', name: 'drag', component: Drag },
  { path: '/draggable', name: 'draggable', component: Draggable },
  { path: '/:pathMatch(.*)*', name: 'page404', component: page404, hideInMenu: true },
];

export default routes;
