
import React from 'react';
import { AdministrationLayout } from '../AdministrationLayout/AdministrationLayout';
import { FileUploader } from './FileUploader';
import { configApiRef, useApi } from '@backstage/core-plugin-api';


export const AdminPanelPage = () => {
    const backendBaseUrl = useApi(configApiRef).getString('backend.baseUrl')

    const importUrlPrefix = `${backendBaseUrl}/api/mbv-api-data/tasks/imports`;
    return (
        <AdministrationLayout title="Administration MBV">
             <AdministrationLayout.Route path='/' title='Admin Panel'>
             <fieldset>
                <legend>Data Upload</legend>
                <FileUploader importUrlPrefix={importUrlPrefix} />
             </fieldset>
             </AdministrationLayout.Route>
        </AdministrationLayout>
    );
};
