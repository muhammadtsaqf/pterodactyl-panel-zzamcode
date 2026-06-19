import * as React from 'react';
import { useState } from 'react';
import { Link, NavLink } from 'react-router-dom';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faCogs, faLayerGroup, faSignOutAlt, faCreditCard, faWallet } from '@fortawesome/free-solid-svg-icons';
import { useStoreState } from 'easy-peasy';
import { ApplicationStore } from '@/state';
import SearchContainer from '@/components/dashboard/search/SearchContainer';
import tw, { theme } from 'twin.macro';
import styled from 'styled-components/macro';
import http from '@/api/http';
import SpinnerOverlay from '@/components/elements/SpinnerOverlay';
import Tooltip from '@/components/elements/tooltip/Tooltip';
import Avatar from '@/components/Avatar';

const RightNavigation = styled.div`
    & > a,
    & > button,
    & > .navigation-link {
        ${tw`flex items-center h-full no-underline text-neutral-300 px-6 cursor-pointer transition-all duration-300 relative`};

        &:hover {
            ${tw`text-white`};
            background: rgba(255, 255, 255, 0.03);
        }

        &:active,
        &.active {
            ${tw`text-white`};
            background: rgba(255, 255, 255, 0.05);
        }
        
        &::after {
            content: '';
            position: absolute;
            bottom: 0;
            left: 0;
            right: 0;
            height: 3px;
            background: linear-gradient(90deg, #3b82f6, #6366f1);
            opacity: 0;
            transition: opacity 0.3s ease;
            box-shadow: 0 -2px 10px rgba(59, 130, 246, 0.5);
        }

        &:hover::after,
        &.active::after {
            opacity: 1;
        }
    }
`;

export default () => {
    const balance = useStoreState((state: ApplicationStore) => state.user.data?.balance || 0);

    return (
        <div 
            className={'w-full sticky top-0 z-50 shadow-sm'}
            style={{ 
                background: 'rgba(15, 23, 42, 0.7)', 
                backdropFilter: 'blur(16px)', 
                WebkitBackdropFilter: 'blur(16px)',
                borderBottom: '1px solid rgba(255, 255, 255, 0.05)'
            }}
        >
            <div className={'navbar-inner mx-auto w-full flex items-center h-[4rem] px-8'}>
                <div className={'flex-1'}>
                    {/* Empty space where logo used to be */}
                </div>
                <RightNavigation className={'flex h-full items-center justify-center'}>
                    <SearchContainer />
                    
                    <div className={'flex items-center px-6 h-full text-neutral-300 font-medium'}>
                        <FontAwesomeIcon icon={faWallet} className={'mr-2 text-indigo-400'} />
                        <span>Rp {new Intl.NumberFormat('id-ID').format(balance)}</span>
                    </div>

                    <Tooltip placement={'bottom'} content={'Account Settings'}>
                        <NavLink to={'/account'}>
                            <span className={'flex items-center w-6 h-6 rounded-full overflow-hidden shadow-md'}>
                                <Avatar.User />
                            </span>
                        </NavLink>
                    </Tooltip>
                </RightNavigation>
            </div>
        </div>
    );
};
