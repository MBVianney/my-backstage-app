import {
  // configApiRef,
  // createApiFactory,
  createPlugin,
  createRoutableExtension,
  // identityApiRef,
} from '@backstage/core-plugin-api';

import { rootRouteRef } from './routes';

export const mbvAdministrationPlugin = createPlugin({
  id: 'mbv-administration',
  routes: {
    root: rootRouteRef,
  },
  // apis: [
  //   createApiFactory({
  //     api: audienceApiRef,
  //     deps: {
  //       configApi: configApiRef,
  //       identityApi: identityApiRef
  //     },
  //     factory: ({ configApi, identityApi }) => new AudienceApiClient({ configApi, identityApi })
  //   })
  // ]
});

export const MbvAdministrationPage = mbvAdministrationPlugin.provide(
  createRoutableExtension({
    name: 'MbvAdministrationPage',
    component: () =>
      import('./components/AdminPanelPage').then(m => m.AdminPanelPage),
    mountPoint: rootRouteRef,
  }),
);
