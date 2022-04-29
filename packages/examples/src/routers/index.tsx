import React from 'react';
import Form from '../pages/form';
import Drag from '../pages/drag';
import DnD from '../pages/dnd';

export const routes = [
  {
    path: '/form',
    label: 'form',
    element: <Form />,
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
