import React, { useEffect, useState } from 'react';
import { ServerContext } from '@/state/server';
import reinstallServer from '@/api/server/reinstallServer';
import { Actions, useStoreActions } from 'easy-peasy';
import { ApplicationStore } from '@/state';
import { httpErrorToHuman } from '@/api/http';
import tw from 'twin.macro';
import { Button } from '@/components/elements/button/index';
import { Dialog } from '@/components/elements/dialog';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faRedo, faExclamationTriangle } from '@fortawesome/free-solid-svg-icons';

export default () => {
    const uuid = ServerContext.useStoreState((state) => state.server.data!.uuid);
    const [modalVisible, setModalVisible] = useState(false);
    const { addFlash, clearFlashes } = useStoreActions((actions: Actions<ApplicationStore>) => actions.flashes);

    const reinstall = () => {
        clearFlashes('settings');
        reinstallServer(uuid)
            .then(() => {
                addFlash({
                    key: 'settings',
                    type: 'success',
                    message: 'Your server has begun the reinstallation process.',
                });
            })
            .catch((error) => {
                console.error(error);

                addFlash({ key: 'settings', type: 'error', message: httpErrorToHuman(error) });
            })
            .then(() => setModalVisible(false));
    };

    useEffect(() => {
        clearFlashes();
    }, []);

    return (
        <div css={tw`relative`}>
            <Dialog.Confirm
                open={modalVisible}
                title={'Confirm server reinstallation'}
                confirm={'Yes, reinstall server'}
                onClose={() => setModalVisible(false)}
                onConfirmed={reinstall}
            >
                Your server will be stopped and some files may be deleted or modified during this process, are you sure
                you wish to continue?
            </Dialog.Confirm>

            <div css={tw`flex items-start gap-4 mb-6 p-4 bg-yellow-50 border border-yellow-500 rounded-lg`}>
                <div css={tw`flex-shrink-0`}>
                    <FontAwesomeIcon icon={faExclamationTriangle} css={tw`text-yellow-500 text-xl`} />
                </div>
                <div>
                    <h4 css={tw`text-sm font-semibold text-yellow-600 mb-1`}>Warning</h4>
                    <p css={tw`text-sm text-yellow-700`}>
                        Reinstalling your server will stop it, and then re-run the installation script that initially set it
                        up. <strong css={tw`font-medium text-yellow-800`}>Some files may be deleted or modified during this process, please back up your data before continuing.</strong>
                    </p>
                </div>
            </div>

            <div css={tw`flex justify-end`}>
                <Button.Danger variant={Button.Variants.Secondary} onClick={() => setModalVisible(true)} css={tw`bg-red-600 hover:bg-red-500 border-red-500 shadow-lg transition-all duration-200`}>
                    <FontAwesomeIcon icon={faRedo} css={tw`mr-2`} />
                    Reinstall Server
                </Button.Danger>
            </div>
        </div>
    );
};
