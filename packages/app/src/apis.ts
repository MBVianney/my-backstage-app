import {
  ScmIntegrationsApi,
  scmIntegrationsApiRef,
  ScmAuth,
} from '@backstage/integration-react';
import {
  AnyApiFactory,
  configApiRef,
  createApiFactory,
} from '@backstage/core-plugin-api';
import { createApiRef } from '@backstage/core-plugin-api';
import { CatalogApi } from '@backstage/catalog-client';



export const apis: AnyApiFactory[] = [
  createApiFactory({
    api: scmIntegrationsApiRef,
    deps: { configApi: configApiRef },
    factory: ({ configApi }) => ScmIntegrationsApi.fromConfig(configApi),
  }),
  ScmAuth.createDefaultApiFactory(),
];


/**
 * The API reference for the {@link @backstage/catalog-client#CatalogApi}.
 * @public
 */
export const catalogApiRef = createApiRef<CatalogApi>({
  id: 'plugin.catalog.service',
});
