import React, { useState, useEffect } from 'react';
import { Link, NavLink } from 'react-router-dom';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faCogs, faLayerGroup, faSignOutAlt, faCreditCard, faUser, faWallet, faBars, faTimes, faShoppingCart } from '@fortawesome/free-solid-svg-icons';
import { useStoreState } from 'easy-peasy';
import { ApplicationStore } from '@/state';
import tw, { styled } from 'twin.macro';
import http from '@/api/http';
import SpinnerOverlay from '@/components/elements/SpinnerOverlay';
import { useLocation } from 'react-router';

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
    const [mobileOpen, setMobileOpen] = useState(false);
    const location = useLocation();

    // Close sidebar on route change (mobile)
    useEffect(() => {
        setMobileOpen(false);
    }, [location.pathname]);

    // Prevent body scroll when mobile sidebar is open
    useEffect(() => {
        if (mobileOpen) {
            document.body.style.overflow = 'hidden';
        } else {
            document.body.style.overflow = '';
        }
        return () => { document.body.style.overflow = ''; };
    }, [mobileOpen]);

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

            {/* Mobile hamburger button */}
            <button
                onClick={() => setMobileOpen(!mobileOpen)}
                className="sidebar-mobile-toggle"
                style={{
                    position: 'fixed',
                    top: '14px',
                    left: '14px',
                    zIndex: 60,
                    width: '40px',
                    height: '40px',
                    borderRadius: '10px',
                    border: '1px solid rgba(255,255,255,0.1)',
                    background: 'rgba(15, 23, 42, 0.9)',
                    backdropFilter: 'blur(12px)',
                    color: '#e2e8f0',
                    fontSize: '16px',
                    cursor: 'pointer',
                    display: 'none', // hidden by default on desktop
                    alignItems: 'center',
                    justifyContent: 'center',
                    transition: 'all 0.2s ease',
                }}
            >
                <FontAwesomeIcon icon={mobileOpen ? faTimes : faBars} />
            </button>

            {/* Overlay backdrop for mobile */}
            {mobileOpen && (
                <div
                    onClick={() => setMobileOpen(false)}
                    style={{
                        position: 'fixed',
                        inset: 0,
                        zIndex: 49,
                        background: 'rgba(0,0,0,0.6)',
                        backdropFilter: 'blur(4px)',
                    }}
                    className="sidebar-overlay"
                />
            )}

            {/* Sidebar */}
            <div
                className={`sidebar-container ${mobileOpen ? 'sidebar-open' : ''}`}
                style={{
                    display: 'flex',
                    flexDirection: 'column' as const,
                    width: '256px',
                    height: '100vh',
                    position: 'fixed',
                    top: 0,
                    left: 0,
                    zIndex: 50,
                    boxShadow: '4px 0 24px rgba(0,0,0,0.3)',
                    background: 'linear-gradient(180deg, #0f172a 0%, #020617 100%)',
                    borderRight: '1px solid rgba(255, 255, 255, 0.05)',
                    transition: 'transform 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
                }}
            >
                <div
                    style={{
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        height: '64px',
                        width: '100%',
                        borderBottom: '1px solid rgba(255, 255, 255, 0.05)',
                    }}
                >
                    <Link
                        to={'/'}
                        className={
                            'text-xl font-header font-bold px-4 no-underline text-neutral-100 hover:text-white transition-colors duration-150 tracking-wide flex items-center'
                        }
                    >
                        <span className="text-indigo-500 mr-2">/</span>
                        {name}
                    </Link>
                </div>
                
                <div style={{ display: 'flex', flexDirection: 'column' as const, flex: 1, paddingTop: '24px', paddingBottom: '24px', gap: '8px', overflowY: 'auto' as const }}>
                    <NavItem>
                        <NavLink to={'/'} exact>
                            <FontAwesomeIcon icon={faLayerGroup} className="mr-3 text-lg w-5 text-center" />
                            <span className="font-medium text-sm tracking-wide">Dashboard</span>
                        </NavLink>
                    </NavItem>
                    <NavItem>
                        <NavLink to={'/store'} exact>
                            <FontAwesomeIcon icon={faShoppingCart} className="mr-3 text-lg w-5 text-center" />
                            <span className="font-medium text-sm tracking-wide">Store</span>
                        </NavLink>
                    </NavItem>

                    <NavItem>
                        <NavLink to={'/account'}>
                            <FontAwesomeIcon icon={faUser} className="mr-3 text-lg w-5 text-center" />
                            <span className="font-medium text-sm tracking-wide">Account Settings</span>
                        </NavLink>
                    </NavItem>
                    
                    {rootAdmin && (
                        <div className="mt-4 pt-4 border-t border-neutral-700/50">
                            <NavItem>
                                <a href={'/admin'} rel={'noreferrer'}>
                                    <FontAwesomeIcon icon={faCogs} className="mr-3 text-lg w-5 text-center" />
                                    <span className="font-medium text-sm tracking-wide">Admin Panel</span>
                                </a>
                            </NavItem>
                        </div>
                    )}
                </div>

                <div style={{ marginTop: 'auto', paddingBottom: '24px' }}>
                    <LogoutButton onClick={onTriggerLogout}>
                        <FontAwesomeIcon icon={faSignOutAlt} className="mr-3 text-lg w-5 text-center" />
                        <span className="font-medium text-sm tracking-wide">Sign Out</span>
                    </LogoutButton>
                </div>
            </div>

            {/* Global responsive styles */}
            <style>{`
                @media (max-width: 768px) {
                    .sidebar-mobile-toggle {
                        display: flex !important;
                    }
                    .sidebar-container {
                        transform: translateX(-100%);
                    }
                    .sidebar-container.sidebar-open {
                        transform: translateX(0);
                    }
                    .main-content-area {
                        margin-left: 0 !important;
                    }
                    .navbar-inner {
                        padding-left: 60px !important;
                    }
                }
            `}</style>
        </>
    );
};
