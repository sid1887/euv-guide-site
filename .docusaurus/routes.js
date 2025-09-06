import React from 'react';
import ComponentCreator from '@docusaurus/ComponentCreator';

export default [
  {
    path: '/__docusaurus/debug',
    component: ComponentCreator('/__docusaurus/debug', '5ff'),
    exact: true
  },
  {
    path: '/__docusaurus/debug/config',
    component: ComponentCreator('/__docusaurus/debug/config', '5ba'),
    exact: true
  },
  {
    path: '/__docusaurus/debug/content',
    component: ComponentCreator('/__docusaurus/debug/content', 'a2b'),
    exact: true
  },
  {
    path: '/__docusaurus/debug/globalData',
    component: ComponentCreator('/__docusaurus/debug/globalData', 'c3c'),
    exact: true
  },
  {
    path: '/__docusaurus/debug/metadata',
    component: ComponentCreator('/__docusaurus/debug/metadata', '156'),
    exact: true
  },
  {
    path: '/__docusaurus/debug/registry',
    component: ComponentCreator('/__docusaurus/debug/registry', '88c'),
    exact: true
  },
  {
    path: '/__docusaurus/debug/routes',
    component: ComponentCreator('/__docusaurus/debug/routes', '000'),
    exact: true
  },
  {
    path: '/search',
    component: ComponentCreator('/search', '822'),
    exact: true
  },
  {
    path: '/docs',
    component: ComponentCreator('/docs', '6b9'),
    routes: [
      {
        path: '/docs',
        component: ComponentCreator('/docs', '8c5'),
        routes: [
          {
            path: '/docs',
            component: ComponentCreator('/docs', '2e2'),
            routes: [
              {
                path: '/docs/chapters/intro',
                component: ComponentCreator('/docs/chapters/intro', 'e8b'),
                exact: true,
                sidebar: "tutorialSidebar"
              },
              {
                path: '/docs/chapters/photolithography-basics',
                component: ComponentCreator('/docs/chapters/photolithography-basics', '88e'),
                exact: true,
                sidebar: "tutorialSidebar"
              },
              {
                path: '/docs/chapters/why-euv-rayleigh',
                component: ComponentCreator('/docs/chapters/why-euv-rayleigh', 'f4b'),
                exact: true,
                sidebar: "tutorialSidebar"
              },
              {
                path: '/docs/intro',
                component: ComponentCreator('/docs/intro', '89a'),
                exact: true,
                sidebar: "tutorialSidebar"
              }
            ]
          }
        ]
      }
    ]
  },
  {
    path: '/',
    component: ComponentCreator('/', '2e1'),
    exact: true
  },
  {
    path: '*',
    component: ComponentCreator('*'),
  },
];
