import React, { useEffect, useState } from 'react';
import { ActivityLogFilters, useActivityLogs } from '@/api/account/activity';
import { useFlashKey } from '@/plugins/useFlash';
import PageContentBlock from '@/components/elements/PageContentBlock';
import FlashMessageRender from '@/components/FlashMessageRender';
import { Link } from 'react-router-dom';
import PaginationFooter from '@/components/elements/table/PaginationFooter';
import { DesktopComputerIcon, XCircleIcon, ShieldCheckIcon, ClockIcon, GlobeAltIcon, ExclamationCircleIcon } from '@heroicons/react/solid';
import Spinner from '@/components/elements/Spinner';
import { styles as btnStyles } from '@/components/elements/button/index';
import classNames from 'classnames';
import ActivityLogEntry from '@/components/elements/activity/ActivityLogEntry';
import Tooltip from '@/components/elements/tooltip/Tooltip';
import useLocationHash from '@/plugins/useLocationHash';
import tw from 'twin.macro';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faShieldAlt, faClock, faGlobe, faExclamationTriangle, faCheckCircle, faLock, faSignInAlt, faUserEdit, faKey } from '@fortawesome/free-solid-svg-icons';

const getEventIcon = (event: string) => {
    if (event.includes('auth:login')) return faSignInAlt;
    if (event.includes('auth:logout')) return faLock;
    if (event.includes('user:updated')) return faUserEdit;
    if (event.includes('api-key')) return faKey;
    if (event.includes('error')) return faExclamationTriangle;
    if (event.includes('success')) return faCheckCircle;
    return faShieldAlt;
};

const getEventBadgeColor = (event: string) => {
    if (event.includes('auth:login') || event.includes('success')) return 'bg-green-500/20 text-green-400 border-green-500/30';
    if (event.includes('error') || event.includes('fail')) return 'bg-red-500/20 text-red-400 border-red-500/30';
    if (event.includes('auth:logout')) return 'bg-yellow-500/20 text-yellow-400 border-yellow-500/30';
    return 'bg-blue-500/20 text-blue-400 border-blue-500/30';
};

export default () => {
    const { hash } = useLocationHash();
    const { clearAndAddHttpError } = useFlashKey('account');
    const [filters, setFilters] = useState<ActivityLogFilters>({ page: 1, sorts: { timestamp: -1 } });
    const { data, isValidating, error } = useActivityLogs(filters, {
        revalidateOnMount: true,
        revalidateOnFocus: false,
    });

    useEffect(() => {
        setFilters((value) => ({ ...value, filters: { ip: hash.ip, event: hash.event } }));
    }, [hash]);

    useEffect(() => {
        clearAndAddHttpError(error);
    }, [error]);

    const totalItems = data?.pagination?.total || 0;
    const hasFilters = filters.filters?.event || filters.filters?.ip;

    return (
        <PageContentBlock title={'Activity Log'}>
            <FlashMessageRender byKey={'account'} />

            {/* Hero Header */}
            <div css={tw`relative overflow-hidden rounded-xl bg-gradient-to-r from-neutral-800 to-neutral-900 p-6 mb-6 border border-neutral-700 shadow-2xl`}>
                <div css={tw`absolute top-0 right-0 -mt-4 -mr-4 w-32 h-32 bg-blue-500/10 rounded-full blur-3xl`}></div>
                <div css={tw`relative z-10 flex items-center justify-between`}>
                    <div css={tw`flex items-center gap-4`}>
                        <div css={tw`bg-blue-500/20 p-3 rounded-lg border border-blue-500/30`}>
                            <FontAwesomeIcon icon={faShieldAlt} css={tw`text-blue-400 text-2xl`} />
                        </div>
                        <div>
                            <h2 css={tw`text-xl font-bold text-white tracking-tight`}>Activity Log</h2>
                            <p css={tw`text-neutral-400 text-sm mt-1`}>
                                Pantau semua aktivitas akun Anda secara real-time
                            </p>
                        </div>
                    </div>
                    <div css={tw`hidden md:flex items-center gap-2 px-4 py-2 bg-neutral-700/50 rounded-lg border border-neutral-600`}>
                        <ClockIcon css={tw`text-neutral-400 w-5 h-5`} />
                        <span css={tw`text-neutral-300 text-sm font-medium`}>{totalItems} Events</span>
                    </div>
                </div>
            </div>

            {/* Filter Bar */}
            {hasFilters && (
                <div css={tw`flex justify-end mb-4`}>
                    <Link
                        to={'#'}
                        className={classNames(btnStyles.button, btnStyles.text, 'w-full sm:w-auto bg-red-500/10 border-red-500/30 text-red-400 hover:bg-red-500/20')}
                        onClick={() => setFilters((value) => ({ ...value, filters: {} }))}
                    >
                        <XCircleIcon css={tw`w-4 h-4 mr-2`} />
                        Clear Filters
                    </Link>
                </div>
            )}

            {/* Content */}
            {!data && isValidating ? (
                <div css={tw`flex items-center justify-center py-20`}>
                    <Spinner centered />
                </div>
            ) : !data?.items.length ? (
                <div css={tw`flex flex-col items-center justify-center py-20 bg-neutral-800/30 rounded-xl border border-dashed border-neutral-700`}>
                    <FontAwesomeIcon icon={faCheckCircle} css={tw`text-neutral-600 text-5xl mb-4`} />
                    <p css={tw`text-lg text-neutral-400 font-medium`}>Belum ada aktivitas</p>
                    <p css={tw`text-sm text-neutral-500 mt-1`}>Aktivitas akun Anda akan muncul di sini</p>
                </div>
            ) : (
                <>
                    <div css={tw`grid grid-cols-1 gap-3`}>
                        {data.items.map((activity) => (
                            <div
                                key={activity.id}
                                css={tw`bg-neutral-800/60 backdrop-blur-sm border border-neutral-700/60 rounded-lg p-4 transition-all duration-200 hover:border-blue-500/40 hover:bg-neutral-700/60 hover:shadow-lg hover:-translate-y-0.5`}
                            >
                                <div css={tw`flex items-start gap-4`}>
                                    {/* Icon */}
                                    <div css={tw`flex-shrink-0 w-10 h-10 rounded-lg bg-neutral-700/50 flex items-center justify-center border border-neutral-600`}>
                                        <FontAwesomeIcon
                                            icon={getEventIcon(activity.event)}
                                            css={tw`text-neutral-300`}
                                        />
                                    </div>

                                    {/* Content */}
                                    <div css={tw`flex-1 min-w-0`}>
                                        <div css={tw`flex items-start justify-between gap-2 flex-wrap`}>
                                            <div>
                                                <span css={tw`text-sm font-medium text-white block mb-1`}>
                                                    {activity.description || activity.event}
                                                </span>
                                                <div css={tw`flex items-center gap-2 flex-wrap`}>
                                                    <span css={tw`text-xs text-neutral-500 flex items-center gap-1`}>
                                                        <ClockIcon css={tw`w-3 h-3`} />
                                                        {new Date(activity.timestamp).toLocaleString('id-ID', {
                                                            dateStyle: 'medium',
                                                            timeStyle: 'short'
                                                        })}
                                                    </span>
                                                    {activity.properties?.ip && (
                                                        <span css={tw`text-xs text-neutral-500 flex items-center gap-1`}>
                                                            <GlobeAltIcon css={tw`w-3 h-3`} />
                                                            {activity.properties.ip}
                                                        </span>
                                                    )}
                                                </div>
                                            </div>
                                            <span
                                                css={tw`px-2 py-1 rounded text-xs font-mono border`}
                                                className={getEventBadgeColor(activity.event)}
                                            >
                                                {activity.event.split(':').pop()}
                                            </span>
                                        </div>
                                    </div>

                                    {/* User Agent Icon */}
                                    {typeof activity.properties?.useragent === 'string' && (
                                        <Tooltip content={activity.properties.useragent} placement={'top'}>
                                            <div css={tw`flex-shrink-0 text-neutral-500 hover:text-neutral-300 transition-colors`}>
                                                <DesktopComputerIcon css={tw`w-5 h-5`} />
                                            </div>
                                        </Tooltip>
                                    )}
                                </div>
                            </div>
                        ))}
                    </div>

                    <PaginationFooter
                        pagination={data.pagination}
                        onPageSelect={(page) => setFilters((value) => ({ ...value, page }))}
                    />
                </>
            )}
        </PageContentBlock>
    );
};
