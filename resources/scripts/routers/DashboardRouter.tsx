import React from 'react';
import { NavLink, Route, Switch } from 'react-router-dom';
import NavigationBar from '@/components/NavigationBar';
import DashboardContainer from '@/components/dashboard/DashboardContainer';
import { NotFound } from '@/components/elements/ScreenBlock';
import TransitionRouter from '@/TransitionRouter';
import SubNavigation from '@/components/elements/SubNavigation';
import { useLocation } from 'react-router';
import Spinner from '@/components/elements/Spinner';
import routes from '@/routers/routes';

import StoreContainer from '@/components/store/StoreContainer';
import SideBar from '@/components/SideBar';

export default () => {
    const location = useLocation();

    return (
        <div 
            className={'min-h-screen relative w-full flex flex-row'}
            style={{ 
                background: 'linear-gradient(135deg, #0f172a 0%, #020617 100%)',
                color: '#e2e8f0'
            }}
        >
            {/* Abstract Background Elements */}
            <div className="fixed top-[-10%] left-[-10%] w-[40%] h-[40%] rounded-full bg-blue-600/10 blur-[120px] pointer-events-none" />
            <div className="fixed bottom-[-10%] right-[-10%] w-[40%] h-[40%] rounded-full bg-indigo-600/10 blur-[120px] pointer-events-none" />
            
            <SideBar />
            
            <div className="main-content-area relative z-10 flex flex-col flex-1 h-full lg:ml-64 overflow-x-hidden">
                <NavigationBar />

                <TransitionRouter>
                    <React.Suspense fallback={<Spinner centered />}>
                        <Switch location={location}>
                            <Route path={'/'} exact>
                                <DashboardContainer />
                            </Route>

                            <Route path={'/store'} exact>
                                <StoreContainer />
                            </Route>
                            {routes.account.map(({ path, component: Component }) => (
                                <Route key={path} path={`/account/${path}`.replace('//', '/')} exact>
                                    <Component />
                                </Route>
                            ))}
                            <Route path={'*'}>
                                <NotFound />
                            </Route>
                        </Switch>
                    </React.Suspense>
                </TransitionRouter>
            </div>
        </div>
    );
};
