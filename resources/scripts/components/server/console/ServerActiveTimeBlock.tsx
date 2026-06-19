import React, { useState, useEffect } from 'react';
import { ServerContext } from '@/state/server';
import tw from 'twin.macro';
import styled from 'styled-components/macro';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faClock } from '@fortawesome/free-solid-svg-icons';
import { differenceInDays, differenceInHours, differenceInMinutes, differenceInSeconds } from 'date-fns';

const Badge = styled.div<{ $isWarning?: boolean; $isDanger?: boolean }>`
    ${tw`flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-medium transition-colors duration-300 backdrop-blur-md border`};
    
    ${props => props.$isDanger 
        ? tw`bg-red-500/10 text-red-400 border-red-500/20` 
        : props.$isWarning 
        ? tw`bg-yellow-500/10 text-yellow-400 border-yellow-500/20` 
        : tw`bg-indigo-500/10 text-indigo-300 border-indigo-500/20`
    }
`;

export default () => {
    const storeExpiresAt = ServerContext.useStoreState(state => state.server.data!.storeExpiresAt);
    const [timeLeft, setTimeLeft] = useState<{ d: number; h: number; m: number; s: number } | null>(null);

    useEffect(() => {
        if (!storeExpiresAt) return;

        const updateTime = () => {
            const now = new Date();
            const expires = new Date(storeExpiresAt);
            
            if (now >= expires) {
                setTimeLeft({ d: 0, h: 0, m: 0, s: 0 });
                return;
            }

            const d = differenceInDays(expires, now);
            const h = differenceInHours(expires, now) % 24;
            const m = differenceInMinutes(expires, now) % 60;
            const s = differenceInSeconds(expires, now) % 60;

            setTimeLeft({ d, h, m, s });
        };

        updateTime();
        const interval = setInterval(updateTime, 1000);
        return () => clearInterval(interval);
    }, [storeExpiresAt]);

    if (!storeExpiresAt || !timeLeft) {
        return null;
    }

    const isDanger = timeLeft.d === 0 && timeLeft.h < 24;
    const isWarning = timeLeft.d > 0 && timeLeft.d <= 3;

    return (
        <Badge $isWarning={isWarning} $isDanger={isDanger}>
            <FontAwesomeIcon icon={faClock} css={tw`animate-pulse opacity-75`} />
            <span>
                Masa Aktif: <strong css={tw`text-white ml-1 font-semibold tracking-wide`}>
                    {timeLeft.d > 0 && `${timeLeft.d} Hari `}
                    {timeLeft.h > 0 && `${timeLeft.h} Jam `}
                    {timeLeft.m} Menit
                </strong>
            </span>
        </Badge>
    );
};
