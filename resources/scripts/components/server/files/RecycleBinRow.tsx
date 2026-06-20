import React, { useState } from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faTrashAlt, faBroom } from '@fortawesome/free-solid-svg-icons';
import { NavLink, useRouteMatch } from 'react-router-dom';
import tw from 'twin.macro';
import { ServerContext } from '@/state/server';
import { Button } from '@/components/elements/button/index';
import deleteFiles from '@/api/server/files/deleteFiles';
import useFlash from '@/plugins/useFlash';
import useFileManagerSwr from '@/plugins/useFileManagerSwr';
import SpinnerOverlay from '@/components/elements/SpinnerOverlay';
import { Dialog } from '@/components/elements/dialog';
import styles from './style.module.css';

const RecycleBinRow = () => {
    const match = useRouteMatch();
    const uuid = ServerContext.useStoreState((state) => state.server.data!.uuid);
    const directory = ServerContext.useStoreState((state) => state.files.directory);
    const { mutate } = useFileManagerSwr();
    const { clearAndAddHttpError, clearFlashes } = useFlash();
    
    const [loading, setLoading] = useState(false);
    const [showConfirm, setShowConfirm] = useState(false);

    const emptyTrash = () => {
        setLoading(true);
        setShowConfirm(false);
        clearFlashes('files');

        // To empty trash, we delete the .RecycleBin folder itself.
        deleteFiles(uuid, directory, ['.RecycleBin'])
            .then(() => {
                mutate((files) => files.filter((f) => f.name !== '.RecycleBin'), false);
            })
            .catch((error) => {
                mutate();
                clearAndAddHttpError({ key: 'files', error });
            })
            .finally(() => setLoading(false));
    };

    return (
        <>
            <Dialog.Confirm
                title={'Empty Recycle Bin'}
                open={showConfirm}
                confirm={'Empty Trash'}
                onClose={() => setShowConfirm(false)}
                onConfirmed={emptyTrash}
            >
                <p className={'mb-2'}>
                    Are you sure you want to empty the Recycle Bin? All files inside will be <strong>permanently deleted</strong> and cannot be recovered.
                </p>
            </Dialog.Confirm>
            
            <div className={`${styles.file_row} relative`} css={tw`bg-neutral-800/80 border-l-4 border-red-500`}>
                <SpinnerOverlay visible={loading} size={'small'} />
                
                <div css={tw`w-12`}></div> {/* Spacer for checkbox area */}
                
                <NavLink
                    className={styles.details}
                    to={`${match.url}#/.RecycleBin`}
                    css={tw`!text-red-400 hover:!text-red-300`}
                >
                    <div css={tw`flex-none text-red-500 ml-2 mr-4 text-lg pl-3`}>
                        <FontAwesomeIcon icon={faTrashAlt} />
                    </div>
                    <div css={tw`flex-1 font-bold`}>.RecycleBin</div>
                </NavLink>

                <div css={tw`pr-4`}>
                    <Button.Danger 
                        size={Button.Sizes.Small} 
                        onClick={(e) => {
                            e.preventDefault();
                            e.stopPropagation();
                            setShowConfirm(true);
                        }}
                    >
                        <FontAwesomeIcon icon={faBroom} css={tw`mr-2`} />
                        EMPTY TRASH
                    </Button.Danger>
                </div>
            </div>
        </>
    );
};

export default RecycleBinRow;
