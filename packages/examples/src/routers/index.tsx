import React from 'react';
import Antd from '../pages/antd';
import Drag from '../pages/drag';
import DnD from '../pages/dnd';
import Form from '../pages/form';

export const routes = [
  {
    path: '/form',
    label: 'form',
    element: <Form />,
  },
  {
    path: '/antd',
    label: 'antd',
    element: <Antd />,
  },
  {
    path: '/drag',
    label: 'drag',
    element: <Drag />,
  },
  {
    path: '/dnd',
    label: 'dnd',
    element: <DnD />,
  },
];
