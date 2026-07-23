import React, { useEffect } from 'react';
import { httpErrorToHuman } from '@/api/http';
import { CSSTransition } from 'react-transition-group';
import Spinner from '@/components/elements/Spinner';
import FileObjectRow from '@/components/server/files/FileObjectRow';
import RecycleBinRow from '@/components/server/files/RecycleBinRow';
import FileManagerBreadcrumbs from '@/components/server/files/FileManagerBreadcrumbs';
import { FileObject } from '@/api/server/files/loadDirectory';
import NewDirectoryButton from '@/components/server/files/NewDirectoryButton';
import { NavLink, useLocation } from 'react-router-dom';
import Can from '@/components/elements/Can';
import { ServerError } from '@/components/elements/ScreenBlock';
import tw from 'twin.macro';
import { Button } from '@/components/elements/button/index';
import { ServerContext } from '@/state/server';
import useFileManagerSwr from '@/plugins/useFileManagerSwr';
import FileManagerStatus from '@/components/server/files/FileManagerStatus';
import MassActionsBar from '@/components/server/files/MassActionsBar';
import UploadButton from '@/components/server/files/UploadButton';
import ServerContentBlock from '@/components/elements/ServerContentBlock';
import { useStoreActions } from '@/state/hooks';
import ErrorBoundary from '@/components/elements/ErrorBoundary';
import { FileActionCheckbox } from '@/components/server/files/SelectFileCheckbox';
import { hashToPath } from '@/helpers';
import style from './style.module.css';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faFolderOpen, faFileCode, faServer } from '@fortawesome/free-solid-svg-icons';

const sortFiles = (files: FileObject[]): FileObject[] => {
    const sortedFiles: FileObject[] = files
        .sort((a, b) => {
            if (a.name === '.RecycleBin') return -1;
            if (b.name === '.RecycleBin') return 1;
            return a.name.localeCompare(b.name);
        })
        .sort((a, b) => {
            if (a.name === '.RecycleBin') return -1;
            if (b.name === '.RecycleBin') return 1;
            return a.isFile === b.isFile ? 0 : a.isFile ? 1 : -1;
        });
    return sortedFiles.filter((file, index) => index === 0 || file.name !== sortedFiles[index - 1].name);
};

export default () => {
    const id = ServerContext.useStoreState((state) => state.server.data!.id);
    const { hash } = useLocation();
    const { data: files, error, mutate } = useFileManagerSwr();
    const directory = ServerContext.useStoreState((state) => state.files.directory);
    const clearFlashes = useStoreActions((actions) => actions.flashes.clearFlashes);
    const setDirectory = ServerContext.useStoreActions((actions) => actions.files.setDirectory);

    const setSelectedFiles = ServerContext.useStoreActions((actions) => actions.files.setSelectedFiles);
    const selectedFilesLength = ServerContext.useStoreState((state) => state.files.selectedFiles.length);

    useEffect(() => {
        clearFlashes('files');
        setSelectedFiles([]);
        setDirectory(hashToPath(hash));
    }, [hash]);

    useEffect(() => {
        mutate();
    }, [directory]);

    const onSelectAllClick = (e: React.ChangeEvent<HTMLInputElement>) => {
        setSelectedFiles(
            e.currentTarget.checked
                ? files?.filter((file) => file.name !== '.RecycleBin').map((file) => file.name) || []
                : []
        );
    };

    if (error) {
        return <ServerError message={httpErrorToHuman(error)} onRetry={() => mutate()} />;
    }

    return (
        <ServerContentBlock title={'File Manager'} showFlashKey={'files'}>
            <ErrorBoundary>
                {/* Hero Header Section */}
                <div css={tw`relative overflow-hidden rounded-xl bg-gradient-to-r from-neutral-800 to-neutral-900 p-6 mb-6 border border-neutral-700 shadow-2xl`}>
                    <div css={tw`absolute top-0 right-0 -mt-4 -mr-4 w-32 h-32 bg-blue-500/10 rounded-full blur-3xl`}></div>
                    <div css={tw`relative z-10 flex items-center justify-between`}>
                        <div css={tw`flex items-center gap-4`}>
                            <div css={tw`bg-blue-500/20 p-3 rounded-lg border border-blue-500/30`}>
                                <FontAwesomeIcon icon={faFolderOpen} css={tw`text-blue-400 text-2xl`} />
                            </div>
                            <div>
                                <h2 css={tw`text-xl font-bold text-white tracking-tight`}>File Manager</h2>
                                <p css={tw`text-neutral-400 text-sm mt-1`}>
                                    Kelola file server Anda dengan mudah dan aman
                                </p>
                            </div>
                        </div>
                        <div css={tw`hidden md:block`}>
                            <span css={tw`px-3 py-1 rounded-full bg-neutral-700/50 text-neutral-300 text-xs border border-neutral-600`}>
                                {files ? `${files.length} items` : 'Loading...'}
                            </span>
                        </div>
                    </div>
                </div>

                {/* Modern Toolbar */}
                <div css={tw`sticky top-2 z-10 bg-neutral-800/90 backdrop-blur-md border border-neutral-700/50 rounded-lg p-3 mb-4 shadow-lg`}>
                    <div className={'flex flex-wrap-reverse md:flex-nowrap items-center justify-between gap-3'}>
                        <div className={'flex items-center gap-2 flex-1'}>
                            <FileActionCheckbox
                                type={'checkbox'}
                                css={tw`mx-2`}
                                checked={
                                    selectedFilesLength ===
                                    (files?.filter((f) => f.name !== '.RecycleBin').length === 0
                                        ? -1
                                        : files?.filter((f) => f.name !== '.RecycleBin').length)
                                }
                                onChange={onSelectAllClick}
                            />
                            <FileManagerBreadcrumbs />
                        </div>
                        <Can action={'file.create'}>
                            <div className={style.manager_actions}>
                                <FileManagerStatus />
                                <NewDirectoryButton />
                                <UploadButton />
                                <NavLink to={`/server/${id}/files/new${window.location.hash}`}>
                                    <Button css={tw`bg-blue-600 hover:bg-blue-500 text-white border-none shadow-lg transition-all duration-200`}>
                                        <FontAwesomeIcon icon={faFileCode} css={tw`mr-2`} />
                                        New File
                                    </Button>
                                </NavLink>
                            </div>
                        </Can>
                    </div>
                </div>
            </ErrorBoundary>
            {!files ? (
                <div css={tw`flex items-center justify-center py-20`}>
                    <Spinner size={'large'} centered />
                </div>
            ) : (
                <>
                    {!files.length ? (
                        <div css={tw`flex flex-col items-center justify-center py-20 bg-neutral-800/30 rounded-xl border border-dashed border-neutral-700`}>
                            <FontAwesomeIcon icon={faServer} css={tw`text-neutral-600 text-5xl mb-4`} />
                            <p css={tw`text-lg text-neutral-400 font-medium`}>Direktori ini kosong</p>
                            <p css={tw`text-sm text-neutral-500 mt-1`}>Mulai dengan mengunggah file atau membuat direktori baru</p>
                        </div>
                    ) : (
                        <CSSTransition classNames={'fade'} timeout={150} appear in>
                            <div css={tw`grid grid-cols-1 gap-2`}>
                                {files.length > 250 && (
                                    <div css={tw`rounded-lg bg-amber-500/10 border border-amber-500/20 p-4 mb-2 flex items-center gap-3`}>
                                        <FontAwesomeIcon icon={faServer} css={tw`text-amber-500 text-xl`} />
                                        <p css={tw`text-amber-200 text-sm`}>
                                            Direktori terlalu besar untuk ditampilkan sepenuhnya. Menampilkan 250 file pertama.
                                        </p>
                                    </div>
                                )}
                                <div css={tw`grid grid-cols-1 gap-2`}>
                                    {sortFiles(files.slice(0, 250)).map((file) => (
                                        file.name === '.RecycleBin' ? (
                                            <RecycleBinRow key={file.key} />
                                        ) : (
                                            <FileObjectRow key={file.key} file={file} />
                                        )
                                    ))}
                                </div>
                                <MassActionsBar />
                            </div>
                        </CSSTransition>
                    )}
                </>
            )}
        </ServerContentBlock>
    );
};
