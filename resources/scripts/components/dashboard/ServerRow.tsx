import React, { memo, useEffect, useRef, useState } from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faEthernet, faHdd, faMemory, faMicrochip, faServer } from '@fortawesome/free-solid-svg-icons';
import { Link } from 'react-router-dom';
import { Server } from '@/api/server/getServer';
import getServerResourceUsage, { ServerPowerState, ServerStats } from '@/api/server/getServerResourceUsage';
import { bytesToString, ip, mbToBytes } from '@/lib/formatters';
import tw from 'twin.macro';
import GreyRowBox from '@/components/elements/GreyRowBox';
import Spinner from '@/components/elements/Spinner';
import styled from 'styled-components/macro';
import isEqual from 'react-fast-compare';

// Determines if the current value is in an alarm threshold so we can show it in red rather
// than the more faded default style.
const isAlarmState = (current: number, limit: number): boolean => limit > 0 && current / (limit * 1024 * 1024) >= 0.9;

const Icon = memo(
    styled(FontAwesomeIcon)<{ $alarm: boolean }>`
        ${(props) => (props.$alarm ? tw`text-red-400` : tw`text-neutral-500`)};
    `,
    isEqual
);

const IconDescription = styled.p<{ $alarm: boolean }>`
    ${tw`text-sm ml-2`};
    ${(props) => (props.$alarm ? tw`text-white` : tw`text-neutral-400`)};
`;

const ServerCard = styled(Link)<{ $status: ServerPowerState | undefined }>`
    ${tw`flex flex-col relative rounded-2xl bg-neutral-900/40 border border-neutral-800/50 shadow-lg overflow-hidden transition-all duration-300 backdrop-blur-md p-6`};

    &:hover {
        ${tw`bg-neutral-800/50 border-neutral-700/50`};
        transform: translateY(-4px);
        box-shadow: 0 20px 25px -5px rgba(0, 0, 0, 0.3), 0 10px 10px -5px rgba(0, 0, 0, 0.2);
    }

    & .status-indicator {
        ${tw`absolute top-5 right-5 w-3 h-3 rounded-full shadow-md`};
        ${({ $status }) =>
            !$status || $status === 'offline'
                ? tw`bg-red-500 shadow-red-500/50`
                : $status === 'running'
                ? tw`bg-green-500 shadow-green-500/50`
                : tw`bg-yellow-500 shadow-yellow-500/50`};
    }
`;

type Timer = ReturnType<typeof setInterval>;

export default ({ server, className }: { server: Server; className?: string }) => {
    const interval = useRef<Timer>(null) as React.MutableRefObject<Timer>;
    const [isSuspended, setIsSuspended] = useState(server.status === 'suspended');
    const [stats, setStats] = useState<ServerStats | null>(null);

    const getStats = () =>
        getServerResourceUsage(server.uuid)
            .then((data) => setStats(data))
            .catch((error) => console.error(error));

    useEffect(() => {
        setIsSuspended(stats?.isSuspended || server.status === 'suspended');
    }, [stats?.isSuspended, server.status]);

    useEffect(() => {
        if (isSuspended || server.isNodeUnderMaintenance) return;

        getStats().then(() => {
            interval.current = setInterval(() => getStats(), 30000);
        });

        return () => {
            interval.current && clearInterval(interval.current);
        };
    }, [isSuspended, server.isNodeUnderMaintenance]);

    const alarms = { cpu: false, memory: false, disk: false };
    if (stats) {
        alarms.cpu = server.limits.cpu === 0 ? false : stats.cpuUsagePercent >= server.limits.cpu * 0.9;
        alarms.memory = isAlarmState(stats.memoryUsageInBytes, server.limits.memory);
        alarms.disk = server.limits.disk === 0 ? false : isAlarmState(stats.diskUsageInBytes, server.limits.disk);
    }

    const diskLimit = server.limits.disk !== 0 ? bytesToString(mbToBytes(server.limits.disk)) : 'Unlimited';
    const memoryLimit = server.limits.memory !== 0 ? bytesToString(mbToBytes(server.limits.memory)) : 'Unlimited';
    const cpuLimit = server.limits.cpu !== 0 ? server.limits.cpu + ' %' : 'Unlimited';

    return (
        <ServerCard to={`/server/${server.id}`} className={className} $status={stats?.status}>
            <div className={'status-indicator'} />
            
            <div css={tw`flex items-start mb-6`}>
                <div css={tw`w-12 h-12 rounded-xl bg-blue-600/20 flex items-center justify-center mr-4 text-blue-400 shadow-inner`}>
                    <FontAwesomeIcon icon={faServer} size="lg" />
                </div>
                <div css={tw`flex-1 min-w-0`}>
                    <p css={tw`text-lg font-semibold text-neutral-100 truncate`}>{server.name}</p>
                    <div css={tw`flex items-center mt-1 text-xs text-neutral-400 truncate`}>
                        <FontAwesomeIcon icon={faEthernet} css={tw`mr-2 text-neutral-500`} />
                        {server.allocations
                            .filter((alloc) => alloc.isDefault)
                            .map((allocation) => (
                                <span key={allocation.ip + allocation.port.toString()}>
                                    {allocation.alias || ip(allocation.ip)}:{allocation.port}
                                </span>
                            ))}
                    </div>
                </div>
            </div>

            {!!server.description && (
                <p css={tw`text-sm text-neutral-400 mb-6 line-clamp-2`}>{server.description}</p>
            )}

            <div css={tw`mt-auto`}>
                {!stats || isSuspended || server.isNodeUnderMaintenance ? (
                    isSuspended ? (
                        <div css={tw`flex items-center justify-center py-4 bg-red-500/10 rounded-xl border border-red-500/20`}>
                            <span css={tw`text-red-400 text-sm font-medium`}>
                                {server.status === 'suspended' ? 'Suspended' : 'Connection Error'}
                            </span>
                        </div>
                    ) : server.isNodeUnderMaintenance ? (
                        <div css={tw`flex items-center justify-center py-4 bg-yellow-500/10 rounded-xl border border-yellow-500/20`}>
                            <span css={tw`text-yellow-400 text-sm font-medium`}>Under Maintenance</span>
                        </div>
                    ) : server.isTransferring || server.status ? (
                        <div css={tw`flex items-center justify-center py-4 bg-neutral-500/10 rounded-xl border border-neutral-500/20`}>
                            <span css={tw`text-neutral-400 text-sm font-medium`}>
                                {server.isTransferring
                                    ? 'Transferring'
                                    : server.status === 'installing'
                                    ? 'Installing'
                                    : server.status === 'restoring_backup'
                                    ? 'Restoring Backup'
                                    : 'Unavailable'}
                            </span>
                        </div>
                    ) : (
                        <div css={tw`flex justify-center py-4`}>
                            <Spinner size={'small'} />
                        </div>
                    )
                ) : (
                    <div css={tw`grid grid-cols-3 gap-4 pt-4 border-t border-neutral-800/50`}>
                        <div css={tw`flex flex-col items-center justify-center`}>
                            <div css={tw`flex items-center mb-1`}>
                                <Icon icon={faMicrochip} $alarm={alarms.cpu} />
                                <IconDescription $alarm={alarms.cpu}>
                                    {stats.cpuUsagePercent.toFixed(1)}%
                                </IconDescription>
                            </div>
                            <span css={tw`text-[10px] text-neutral-500 uppercase tracking-wider`}>CPU</span>
                        </div>
                        <div css={tw`flex flex-col items-center justify-center border-l border-r border-neutral-800/50`}>
                            <div css={tw`flex items-center mb-1`}>
                                <Icon icon={faMemory} $alarm={alarms.memory} />
                                <IconDescription $alarm={alarms.memory}>
                                    {bytesToString(stats.memoryUsageInBytes)}
                                </IconDescription>
                            </div>
                            <span css={tw`text-[10px] text-neutral-500 uppercase tracking-wider`}>RAM</span>
                        </div>
                        <div css={tw`flex flex-col items-center justify-center`}>
                            <div css={tw`flex items-center mb-1`}>
                                <Icon icon={faHdd} $alarm={alarms.disk} />
                                <IconDescription $alarm={alarms.disk}>
                                    {bytesToString(stats.diskUsageInBytes)}
                                </IconDescription>
                            </div>
                            <span css={tw`text-[10px] text-neutral-500 uppercase tracking-wider`}>Disk</span>
                        </div>
                    </div>
                )}
            </div>
        </ServerCard>
    );
};
