import React, { useState } from 'react';
import { Link, NavLink } from 'react-router-dom';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faCogs, faLayerGroup, faSignOutAlt, faCreditCard, faUser, faWallet } from '@fortawesome/free-solid-svg-icons';
import { useStoreState } from 'easy-peasy';
import { ApplicationStore } from '@/state';
import tw, { styled } from 'twin.macro';
import http from '@/api/http';
import SpinnerOverlay from '@/components/elements/SpinnerOverlay';

const SidebarContainer = styled.div`
    ${tw`flex flex-col w-64 h-screen fixed top-0 left-0 z-50 shadow-2xl`};
    background: linear-gradient(180deg, #0f172a 0%, #020617 100%);
    border-right: 1px solid rgba(255, 255, 255, 0.05);
`;

const SidebarHeader = styled.div`
    ${tw`flex items-center justify-center h-16 w-full`};
    border-bottom: 1px solid rgba(255, 255, 255, 0.05);
`;

const NavList = styled.div`
    ${tw`flex flex-col flex-1 py-6 space-y-2 overflow-y-auto`};
`;

const NavItem = styled.div`
    & > a, & > button {
        ${tw`flex items-center w-full px-6 py-3 text-neutral-300 transition-all duration-300 relative`};
        text-decoration: none;
        
        &:hover {
            ${tw`text-white`};
            background: rgba(255, 255, 255, 0.03);
            border-left: 3px solid transparent;
        }

        &.active {
            ${tw`text-white`};
            background: rgba(255, 255, 255, 0.05);
            border-left: 3px solid #6366f1;
        }

        & > svg {
            ${tw`w-5 mr-4 text-center transition-colors duration-300`};
        }

        &:hover > svg, &.active > svg {
            ${tw`text-indigo-400`};
            filter: drop-shadow(0 0 8px rgba(99, 102, 241, 0.5));
        }
    }
`;

const LogoutButton = styled.button`
    ${tw`flex items-center w-full px-6 py-4 text-red-400 transition-all duration-300 cursor-pointer`};
    border-top: 1px solid rgba(255, 255, 255, 0.05);
    background: transparent;
    border-bottom: none;
    border-left: none;
    border-right: none;
    
    &:hover {
        ${tw`text-red-300 bg-red-900/20`};
    }

    & > svg {
        ${tw`w-5 mr-4 text-center`};
    }
`;

export default () => {
    const name = useStoreState((state: ApplicationStore) => state.settings.data!.name);
    const rootAdmin = useStoreState((state: ApplicationStore) => state.user.data!.rootAdmin);
    const [isLoggingOut, setIsLoggingOut] = useState(false);

    const onTriggerLogout = () => {
        setIsLoggingOut(true);
        http.post('/auth/logout').finally(() => {
            // @ts-expect-error this is valid
            window.location = '/';
        });
    };

    return (
        <>
            <SpinnerOverlay visible={isLoggingOut} />
            <SidebarContainer>
                <SidebarHeader>
                    <Link
                        to={'/'}
                        className={
                            'text-xl font-header font-bold px-4 no-underline text-neutral-100 hover:text-white transition-colors duration-150 tracking-wide flex items-center'
                        }
                    >
                        <span className="text-indigo-500 mr-2">/</span>
                        {name}
                    </Link>
                </SidebarHeader>
                
                <NavList>
                    <NavItem>
                        <NavLink to={'/'} exact>
                            <FontAwesomeIcon icon={faLayerGroup} />
                            <span className="font-medium text-sm tracking-wide">Dashboard</span>
                        </NavLink>
                    </NavItem>
                    <NavItem>
                        <NavLink to={'/topup'} exact>
                            <FontAwesomeIcon icon={faWallet} />
                            <span className="font-medium text-sm tracking-wide">Top-up Balance</span>
                        </NavLink>
                    </NavItem>
                    <NavItem>
                        <NavLink to={'/account'}>
                            <FontAwesomeIcon icon={faUser} />
                            <span className="font-medium text-sm tracking-wide">Account Settings</span>
                        </NavLink>
                    </NavItem>
                    
                    {rootAdmin && (
                        <div className="mt-4 pt-4 border-t border-neutral-700/50">
                            <NavItem>
                                <a href={'/admin'} rel={'noreferrer'}>
                                    <FontAwesomeIcon icon={faCogs} />
                                    <span className="font-medium text-sm tracking-wide">Admin Panel</span>
                                </a>
                            </NavItem>
                        </div>
                    )}
                </NavList>

                <div className="mt-auto">
                    <LogoutButton onClick={onTriggerLogout}>
                        <FontAwesomeIcon icon={faSignOutAlt} />
                        <span className="font-medium text-sm tracking-wide">Sign Out</span>
                    </LogoutButton>
                </div>
            </SidebarContainer>
        </>
    );
};
