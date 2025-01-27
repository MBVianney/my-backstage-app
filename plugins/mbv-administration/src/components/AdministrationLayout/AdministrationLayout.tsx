import React from "react";
import { TabProps } from "@material-ui/core";
import { Header, Page, RoutedTabs, useSidebarPinState } from "@backstage/core-components";
import { attachComponentData, useElementFilter } from "@backstage/core-plugin-api";

export type AdministrationLayoutRouteProps = {
    path: string;
    title: string;
    children: JSX.Element;
    tabProps?: TabProps<React.ElementType, { component?: React.ElementType }>;
  };

export const LAYOUT_DATA_KEY = 'settingsLayout';
export const LAYOUT_ROUTE_DATA_KEY = 'settingsLayoutRoute';

const Route: (props: AdministrationLayoutRouteProps) => null = () => null;
attachComponentData(Route, LAYOUT_ROUTE_DATA_KEY, true);
attachComponentData(Route, 'core.gatherMountPoints', true);

export type AdministrationLayoutProps = {
    title: string;
    children: JSX.Element;
};

export const AdministrationLayout = (props: AdministrationLayoutProps) => {
    const { title, children } = props;
    const { isMobile } = useSidebarPinState();

    const routes = useElementFilter(children, elements =>
        elements.selectByComponentData({
            key: LAYOUT_ROUTE_DATA_KEY,
            withStrictError:
            'Child of AdministrationLayout must be an AdministrationLayout.Route',
        }).getElements<AdministrationLayoutRouteProps>().map(child => child.props),
    );
    
    return (
        <Page themeId="home">
            {!isMobile && <Header title={title?? 'Administration'}/>}
            <RoutedTabs routes={routes} />
        </Page>
    );
};

attachComponentData( AdministrationLayout, LAYOUT_DATA_KEY, true);
AdministrationLayout.Route = Route;