import React from 'react';
import 'antd/dist/antd.css';
import './index.css';
import { Layout as Alayout, Menu } from 'antd';
import type { RouteObject } from 'react-router-dom';
import { Outlet, Link, useRoutes, useLocation } from 'react-router-dom';
import { routes } from './routers';
const { Header, Content, Footer } = Alayout;

function Layout() {
  const location = useLocation();
  const selected = routes.findIndex((route) => route.path === location.pathname);
  return (
    <Alayout className="layout">
      <Header>
        <div className="logo" />
        <Menu
          theme="dark"
          mode="horizontal"
          selectedKeys={[`${selected === -1 ? 1 : selected + 1}`]}
          items={routes.map((route, index) => {
            const key = index + 1;
            return {
              key,
              label: <Link to={route.path}>{route.label}</Link>,
            };
          })}
        />
      </Header>
      <Content style={{ padding: '0 50px' }}>
        <Outlet></Outlet>
      </Content>
      <Footer style={{ textAlign: 'center' }}>examples ©2022 Created by rtweb</Footer>
    </Alayout>
  );
}

function NoMatch() {
  return (
    <div>
      <h2>It looks like you're lost...</h2>
      <p>
        <Link to="/">Go to the home page</Link>
      </p>
    </div>
  );
}

export default function App() {
  let route: RouteObject[] = [
    {
      path: '/',
      element: <Layout />,
      children: [{ index: true, element: routes[0].element }, ...routes, { path: '*', element: <NoMatch /> }],
    },
  ];

  let element = useRoutes(route);

  return <div>{element}</div>;
}
