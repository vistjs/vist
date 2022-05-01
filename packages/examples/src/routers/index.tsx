import React from 'react';
import Antd from '../pages/antd';
import Drag from '../pages/drag';
import DnD from '../pages/dnd';

export const routes = [
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
