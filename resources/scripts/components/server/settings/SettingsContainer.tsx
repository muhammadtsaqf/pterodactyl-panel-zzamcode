import React from 'react';
import { ServerContext } from '@/state/server';
import { useStoreState } from 'easy-peasy';
import RenameServerBox from '@/components/server/settings/RenameServerBox';
import FlashMessageRender from '@/components/FlashMessageRender';
import Can from '@/components/elements/Can';
import ReinstallServerBox from '@/components/server/settings/ReinstallServerBox';
import tw from 'twin.macro';
import Input from '@/components/elements/Input';
import Label from '@/components/elements/Label';
import ServerContentBlock from '@/components/elements/ServerContentBlock';
import isEqual from 'react-fast-compare';
import CopyOnClick from '@/components/elements/CopyOnClick';
import { ip } from '@/lib/formatters';
import { Button } from '@/components/elements/button/index';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faCog, faNetworkWired, faUser, faKey, faExternalLinkAlt, faServer, faFingerprint, faTerminal } from '@fortawesome/free-solid-svg-icons';

export default () => {
    const username = useStoreState((state) => state.user.data!.username);
    const id = ServerContext.useStoreState((state) => state.server.data!.id);
    const uuid = ServerContext.useStoreState((state) => state.server.data!.uuid);
    const node = ServerContext.useStoreState((state) => state.server.data!.node);
    const sftp = ServerContext.useStoreState((state) => state.server.data!.sftpDetails, isEqual);

    return (
        <ServerContentBlock title={'Settings'}>
            <FlashMessageRender byKey={'settings'} css={tw`mb-4`} />

            <div css={tw`grid grid-cols-1 lg:grid-cols-2 gap-6`}>
                {/* SFTP Details Card */}
                <Can action={'file.sftp'}>
                    <div css={tw`bg-neutral-800/60 backdrop-blur-sm border border-neutral-700/60 rounded-xl p-6 shadow-lg transition-all duration-200 hover:border-blue-500/40 hover:shadow-xl`}>
                        <div css={tw`flex items-center gap-3 mb-6`}>
                            <div css={tw`bg-blue-500/20 p-2 rounded-lg`}>
                                <FontAwesomeIcon icon={faNetworkWired} css={tw`text-blue-400`} />
                            </div>
                            <h3 css={tw`text-lg font-bold text-white`}>SFTP Connection</h3>
                        </div>

                        <div css={tw`space-y-5`}>
                            <div>
                                <Label css={tw`text-xs text-neutral-400 uppercase tracking-wider mb-2 block`}>Server Address</Label>
                                <CopyOnClick text={`sftp://${ip(sftp.ip)}:${sftp.port}`}>
                                    <div css={tw`group relative`}>
                                        <Input type={'text'} value={`sftp://${ip(sftp.ip)}:${sftp.port}`} readOnly css={tw`pr-10 cursor-pointer`} />
                                        <div css={tw`absolute right-3 top-1/2 -translate-y-1/2 text-neutral-500 group-hover:text-blue-400 transition-colors`}>
                                            <FontAwesomeIcon icon={faKey} />
                                        </div>
                                    </div>
                                </CopyOnClick>
                            </div>

                            <div>
                                <Label css={tw`text-xs text-neutral-400 uppercase tracking-wider mb-2 block`}>Username</Label>
                                <CopyOnClick text={`${username}.${id}`}>
                                    <div css={tw`group relative`}>
                                        <Input type={'text'} value={`${username}.${id}`} readOnly css={tw`pr-10 cursor-pointer`} />
                                        <div css={tw`absolute right-3 top-1/2 -translate-y-1/2 text-neutral-500 group-hover:text-blue-400 transition-colors`}>
                                            <FontAwesomeIcon icon={faUser} />
                                        </div>
                                    </div>
                                </CopyOnClick>
                            </div>

                            <div css={tw`pt-4 border-t border-neutral-700/50`}>
                                <div css={tw`flex items-start gap-3`}>
                                    <div css={tw`flex-shrink-0 w-8 h-8 rounded-full bg-amber-500/20 flex items-center justify-center border border-amber-500/30`}>
                                        <FontAwesomeIcon icon={faTerminal} css={tw`text-amber-400 text-sm`} />
                                    </div>
                                    <div css={tw`flex-1`}>
                                        <p css={tw`text-sm text-neutral-300`}>
                                            Password SFTP Anda sama dengan password yang digunakan untuk masuk ke panel ini.
                                        </p>
                                    </div>
                                </div>
                                <div css={tw`mt-4 flex justify-end`}>
                                    <a href={`sftp://${username}.${id}@${ip(sftp.ip)}:${sftp.port}`} css={tw`inline-flex`}>
                                        <Button.Text variant={Button.Variants.Secondary} css={tw`bg-neutral-700 hover:bg-neutral-600 border-neutral-600`}>
                                            <FontAwesomeIcon icon={faExternalLinkAlt} css={tw`mr-2`} />
                                            Launch SFTP
                                        </Button.Text>
                                    </a>
                                </div>
                            </div>
                        </div>
                    </div>
                </Can>

                {/* Debug Information Card */}
                <div css={tw`bg-neutral-800/60 backdrop-blur-sm border border-neutral-700/60 rounded-xl p-6 shadow-lg transition-all duration-200 hover:border-blue-500/40 hover:shadow-xl`}>
                    <div css={tw`flex items-center gap-3 mb-6`}>
                        <div css={tw`bg-purple-500/20 p-2 rounded-lg`}>
                            <FontAwesomeIcon icon={faFingerprint} css={tw`text-purple-400`} />
                        </div>
                        <h3 css={tw`text-lg font-bold text-white`}>Debug Information</h3>
                    </div>

                    <div css={tw`space-y-4`}>
                        <div css={tw`flex items-center justify-between p-3 bg-neutral-900/50 rounded-lg border border-neutral-700/50`}>
                            <div>
                                <Label css={tw`text-xs text-neutral-400 uppercase tracking-wider mb-1 block`}>Node</Label>
                                <p css={tw`text-sm font-medium text-white`}>{node}</p>
                            </div>
                            <div css={tw`w-8 h-8 rounded bg-neutral-800 flex items-center justify-center`}>
                                <FontAwesomeIcon icon={faServer} css={tw`text-neutral-500`} />
                            </div>
                        </div>

                        <CopyOnClick text={uuid}>
                            <div css={tw`flex items-center justify-between p-3 bg-neutral-900/50 rounded-lg border border-neutral-700/50 cursor-pointer hover:border-blue-500/40 transition-colors`}>
                                <div>
                                    <Label css={tw`text-xs text-neutral-400 uppercase tracking-wider mb-1 block`}>Server ID</Label>
                                    <p css={tw`text-sm font-mono font-medium text-white truncate max-w-[200px]`}>{uuid}</p>
                                </div>
                                <div css={tw`w-8 h-8 rounded bg-neutral-800 flex items-center justify-center`}>
                                    <FontAwesomeIcon icon={faCog} css={tw`text-neutral-500`} />
                                </div>
                            </div>
                        </CopyOnClick>
                    </div>
                </div>

                {/* Rename Server Card */}
                <Can action={'settings.rename'}>
                    <div css={tw`bg-neutral-800/60 backdrop-blur-sm border border-neutral-700/60 rounded-xl p-6 shadow-lg transition-all duration-200 hover:border-blue-500/40 hover:shadow-xl`}>
                        <div css={tw`flex items-center gap-3 mb-6`}>
                            <div css={tw`bg-green-500/20 p-2 rounded-lg`}>
                                <FontAwesomeIcon icon={faUser} css={tw`text-green-400`} />
                            </div>
                            <h3 css={tw`text-lg font-bold text-white`}>Rename Server</h3>
                        </div>
                        <RenameServerBox />
                    </div>
                </Can>

                {/* Reinstall Card */}
                <Can action={'settings.reinstall'}>
                    <div css={tw`bg-neutral-800/60 backdrop-blur-sm border border-neutral-700/60 rounded-xl p-6 shadow-lg transition-all duration-200 hover:border-red-500/40 hover:shadow-xl`}>
                        <div css={tw`flex items-center gap-3 mb-6`}>
                            <div css={tw`bg-red-500/20 p-2 rounded-lg`}>
                                <FontAwesomeIcon icon={faCog} css={tw`text-red-400`} />
                            </div>
                            <h3 css={tw`text-lg font-bold text-white`}>Reinstall Server</h3>
                        </div>
                        <ReinstallServerBox />
                    </div>
                </Can>
            </div>
        </ServerContentBlock>
    );
};
