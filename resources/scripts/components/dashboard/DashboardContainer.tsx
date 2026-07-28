import React, { useEffect, useState, useMemo } from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faClock, faServer, faShieldAlt, faBolt, faUserShield } from '@fortawesome/free-solid-svg-icons';
import { Server } from '@/api/server/getServer';
import getServers from '@/api/getServers';
import ServerRow from '@/components/dashboard/ServerRow';
import Spinner from '@/components/elements/Spinner';
import PageContentBlock from '@/components/elements/PageContentBlock';
import useFlash from '@/plugins/useFlash';
import { useStoreState } from 'easy-peasy';
import { usePersistedState } from '@/plugins/usePersistedState';
import Switch from '@/components/elements/Switch';
import tw from 'twin.macro';
import useSWR from 'swr';
import { PaginatedResult } from '@/api/http';
import Pagination from '@/components/elements/Pagination';
import { useLocation } from 'react-router-dom';

const getGreeting = (): string => {
    const h = new Date().getHours();
    if (h < 11) return 'Selamat pagi';
    if (h < 15) return 'Selamat siang';
    if (h < 19) return 'Selamat sore';
    return 'Selamat malam';
};

const formatDateId = (date: Date): string => {
    return date.toLocaleDateString('id-ID', {
        weekday: 'long',
        day: 'numeric',
        month: 'long',
        year: 'numeric',
    });
};

const formatTime = (date: Date): string => {
    return date.toLocaleTimeString('id-ID', {
        hour: '2-digit',
        minute: '2-digit',
    });
};

export default () => {
    const { search } = useLocation();
    const defaultPage = Number(new URLSearchParams(search).get('page') || '1');

    const [page, setPage] = useState(!isNaN(defaultPage) && defaultPage > 0 ? defaultPage : 1);
    const [now, setNow] = useState(new Date());
    const { clearFlashes, clearAndAddHttpError } = useFlash();
    const uuid = useStoreState((state) => state.user.data!.uuid);
    const rootAdmin = useStoreState((state) => state.user.data!.rootAdmin);
    const username = useStoreState((state) => state.user.data!.username);
    const email = useStoreState((state) => state.user.data!.email);
    const [showOnlyAdmin, setShowOnlyAdmin] = usePersistedState(`${uuid}:show_all_servers`, false);

    const { data: servers, error } = useSWR<PaginatedResult<Server>>(
        ['/api/client/servers', showOnlyAdmin && rootAdmin, page],
        () => getServers({ page, type: showOnlyAdmin && rootAdmin ? 'admin' : undefined })
    );

    useEffect(() => {
        const t = setInterval(() => setNow(new Date()), 30000);
        return () => clearInterval(t);
    }, []);

    useEffect(() => {
        setPage(1);
    }, [showOnlyAdmin]);

    useEffect(() => {
        if (!servers) return;
        if (servers.pagination.currentPage > 1 && !servers.items.length) {
            setPage(1);
        }
    }, [servers?.pagination.currentPage]);

    useEffect(() => {
        // Don't use react-router to handle changing this part of the URL, otherwise it
        // triggers a needless re-render. We just want to track this in the URL incase the
        // user refreshes the page.
        window.history.replaceState(null, document.title, `/${page <= 1 ? '' : `?page=${page}`}`);
    }, [page]);

    useEffect(() => {
        if (error) clearAndAddHttpError({ key: 'dashboard', error });
        if (!error) clearFlashes('dashboard');
    }, [error]);

    const totalServers = servers?.pagination?.totalCount ?? 0;
    const greeting = useMemo(() => getGreeting(), []);

    return (
        <PageContentBlock title={'Dashboard'} showFlashKey={'dashboard'}>
            {/* Hero Header */}
            <div className="relative overflow-hidden rounded-2xl mb-8 border border-neutral-800/50 shadow-2xl">
                <div
                    className="absolute inset-0"
                    style={{
                        background:
                            'linear-gradient(135deg, rgba(88, 28, 135, 0.25) 0%, rgba(30, 58, 138, 0.30) 50%, rgba(15, 23, 42, 0.60) 100%)',
                    }}
                />
                <div
                    className="absolute inset-0 opacity-30"
                    style={{
                        backgroundImage:
                            'radial-gradient(circle at 20% 20%, rgba(139, 92, 246, 0.25) 0%, transparent 40%), radial-gradient(circle at 80% 60%, rgba(59, 130, 246, 0.20) 0%, transparent 45%)',
                    }}
                />
                <div className="relative px-6 py-8 sm:px-10 sm:py-10">
                    <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-6">
                        <div>
                            <div className="flex items-center gap-2 text-xs uppercase tracking-widest text-purple-300/80 font-semibold mb-2">
                                <FontAwesomeIcon icon={faShieldAlt} className="text-purple-400" />
                                <span>zzamcode panel</span>
                            </div>
                            <h1 className="text-3xl sm:text-4xl font-bold text-white mb-2 tracking-tight">
                                {greeting}, <span className="text-purple-300">{username}</span>
                            </h1>
                            <p className="text-neutral-400 text-sm sm:text-base max-w-xl">
                                Kelola semua server Anda di satu tempat. Pantau resource, akses file, dan kontrol panel dengan mudah.
                            </p>
                        </div>
                        <div className="flex flex-col gap-2 lg:items-end">
                            <div className="flex items-center gap-2 text-neutral-300 text-sm bg-neutral-900/40 backdrop-blur-sm border border-neutral-700/50 rounded-lg px-4 py-2">
                                <FontAwesomeIcon icon={faClock} className="text-blue-400" />
                                <span className="font-mono">{formatTime(now)}</span>
                                <span className="text-neutral-500">•</span>
                                <span className="text-neutral-400">{formatDateId(now)}</span>
                            </div>
                            <div className="flex items-center gap-2 text-xs text-neutral-400 bg-neutral-900/40 backdrop-blur-sm border border-neutral-700/50 rounded-lg px-4 py-2">
                                <FontAwesomeIcon icon={faUserShield} className="text-green-400" />
                                <span className="truncate max-w-[200px]" title={email}>{email}</span>
                            </div>
                        </div>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 mt-8">
                        <div className="bg-neutral-900/50 backdrop-blur-sm border border-neutral-700/50 rounded-xl p-4 flex items-center gap-4">
                            <div className="w-12 h-12 rounded-xl bg-blue-500/15 border border-blue-500/30 flex items-center justify-center shrink-0">
                                <FontAwesomeIcon icon={faServer} className="text-blue-400 text-lg" />
                            </div>
                            <div className="min-w-0">
                                <p className="text-2xl font-bold text-white leading-none">{totalServers}</p>
                                <p className="text-xs text-neutral-400 uppercase tracking-wider mt-1">Total Server</p>
                            </div>
                        </div>
                        <div className="bg-neutral-900/50 backdrop-blur-sm border border-neutral-700/50 rounded-xl p-4 flex items-center gap-4">
                            <div className="w-12 h-12 rounded-xl bg-green-500/15 border border-green-500/30 flex items-center justify-center shrink-0">
                                <FontAwesomeIcon icon={faBolt} className="text-green-400 text-lg" />
                            </div>
                            <div className="min-w-0">
                                <p className="text-2xl font-bold text-white leading-none">Online</p>
                                <p className="text-xs text-neutral-400 uppercase tracking-wider mt-1">Status Sistem</p>
                            </div>
                        </div>
                        <div className="bg-neutral-900/50 backdrop-blur-sm border border-neutral-700/50 rounded-xl p-4 flex items-center gap-4">
                            <div className="w-12 h-12 rounded-xl bg-purple-500/15 border border-purple-500/30 flex items-center justify-center shrink-0">
                                <FontAwesomeIcon icon={faShieldAlt} className="text-purple-400 text-lg" />
                            </div>
                            <div className="min-w-0">
                                <p className="text-2xl font-bold text-white leading-none">{rootAdmin ? 'Admin' : 'User'}</p>
                                <p className="text-xs text-neutral-400 uppercase tracking-wider mt-1">Level Akses</p>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            <div className="flex items-center justify-between mb-4">
                <div>
                    <h2 className="text-xl font-semibold text-neutral-100">Server Anda</h2>
                    <p className="text-xs text-neutral-500 mt-1">Pilih server untuk membuka console & mengelola resource.</p>
                </div>
                {rootAdmin && (
                    <div css={tw`flex items-center`}>
                        <p css={tw`uppercase text-xs text-neutral-400 mr-3 tracking-wide`}>
                            {showOnlyAdmin ? "Server orang lain" : 'Server Anda'}
                        </p>
                        <Switch
                            name={'show_all_servers'}
                            defaultChecked={showOnlyAdmin}
                            onChange={() => setShowOnlyAdmin((s) => !s)}
                        />
                    </div>
                )}
            </div>

            {!servers ? (
                <div className="flex flex-col items-center justify-center py-24">
                    <Spinner centered size={'large'} />
                </div>
            ) : (
                <Pagination data={servers} onPageSelect={setPage}>
                    {({ items }) =>
                        items.length > 0 ? (
                            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mt-2">
                                {items.map((server) => (
                                    <ServerRow key={server.uuid} server={server} />
                                ))}
                            </div>
                        ) : (
                            <div className="flex flex-col items-center justify-center py-20 text-center mt-6 rounded-2xl bg-neutral-900 bg-opacity-50 border border-neutral-800 border-opacity-50 shadow-inner backdrop-blur-sm">
                                <div className="w-32 h-32 mb-6 opacity-30 drop-shadow-lg">
                                    <img src={'/assets/svgs/pterodactyl.svg'} alt="No servers" className="w-full h-full object-contain filter grayscale" />
                                </div>
                                <h3 className="text-2xl font-semibold text-neutral-200 mb-2 tracking-wide">
                                    {showOnlyAdmin ? 'Tidak ada server lain' : 'Belum ada server'}
                                </h3>
                                <p className="text-neutral-400 max-w-md text-sm leading-relaxed">
                                    {showOnlyAdmin
                                        ? 'Saat ini tidak ada server lain yang dapat ditampilkan di sistem.'
                                        : 'Sepertinya Anda belum memiliki server yang terhubung dengan akun ini. Hubungi administrator jika ini adalah sebuah kesalahan.'}
                                </p>
                            </div>
                        )
                    }
                </Pagination>
            )}
        </PageContentBlock>
    );
};
