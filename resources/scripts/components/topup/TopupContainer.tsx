import React, { useState } from 'react';
import PageContentBlock from '@/components/elements/PageContentBlock';
import tw from 'twin.macro';
import http from '@/api/http';
import FlashMessageRender from '@/components/FlashMessageRender';
import useFlash from '@/plugins/useFlash';
import Button from '@/components/elements/Button';
import Input from '@/components/elements/Input';
import { faQrcode } from '@fortawesome/free-solid-svg-icons';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';

import { useStoreActions, useStoreState, Actions } from 'easy-peasy';
import { ApplicationStore } from '@/state';

declare global {
    interface Window {
        TransaksiKita: {
            pay: (paymentId: string, options: any) => void;
            close: () => void;
        };
    }
}

export default () => {
    const [amount, setAmount] = useState('');
    const [isSubmitting, setIsSubmitting] = useState(false);
    const { clearFlashes, addFlash } = useFlash();
    
    const updateUserData = useStoreActions((actions: Actions<ApplicationStore>) => actions.user.updateUserData);
    const currentBalance = useStoreState((state: ApplicationStore) => state.user.data?.balance || 0);

    const submit = (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault();
        e.stopPropagation();

        clearFlashes('topup');
        setIsSubmitting(true);
        const topupAmount = parseInt(amount, 10);

        http.post('/api/client/account/topup', { amount: topupAmount })
            .then(({ data }) => {
                if (window.TransaksiKita && data.data && data.data.paymentId) {
                    window.TransaksiKita.pay(data.data.paymentId, {
                        onSuccess: function() {
                            updateUserData({ balance: Number(currentBalance) + topupAmount });
                            addFlash({
                                key: 'topup',
                                type: 'success',
                                message: `Payment successful! Rp ${new Intl.NumberFormat('id-ID').format(topupAmount)} has been added to your balance.`,
                            });
                            setAmount('');
                        },
                        onExpired: function() {
                            addFlash({
                                key: 'topup',
                                type: 'error',
                                message: 'Payment expired. Please try again.',
                            });
                        },
                        onClose: function() {
                            console.log('Payment popup closed');
                        },
                        onError: function(err: any) {
                            addFlash({
                                key: 'topup',
                                type: 'error',
                                message: 'Payment Error: ' + err.message,
                            });
                        }
                    });
                } else {
                    addFlash({
                        key: 'topup',
                        type: 'error',
                        message: 'Payment gateway script not loaded properly.',
                    });
                }
            })
            .catch((error) => {
                console.error(error);
                addFlash({
                    key: 'topup',
                    type: 'error',
                    message: error.response?.data?.error || 'An error occurred while generating the payment.',
                });
            })
            .finally(() => {
                setIsSubmitting(false);
            });
    };

    return (
        <PageContentBlock title={'Top-up Balance'} showFlashKey={'topup'}>
            <div css={tw`flex flex-col md:flex-row justify-center mt-6`}>
                <div css={tw`w-full md:w-1/2`}>
                    <div css={tw`bg-neutral-700 p-6 rounded shadow-md`}>
                        <h2 css={tw`text-2xl font-bold mb-4 flex items-center`}>
                            <FontAwesomeIcon icon={faQrcode} css={tw`mr-3 text-primary-400`} />
                            Top-up Balance
                        </h2>
                        
                        <form onSubmit={submit}>
                            <div css={tw`mb-6`}>
                                <label css={tw`block text-neutral-300 text-sm font-bold mb-2`}>
                                    Amount (Minimum Rp 500)
                                </label>
                                <Input
                                    type={'number'}
                                    value={amount}
                                    onChange={(e) => setAmount(e.target.value)}
                                    placeholder={'50000'}
                                    min={500}
                                    required
                                />
                                <p css={tw`text-neutral-400 text-xs mt-2`}>
                                    Enter the amount you wish to add to your account balance.
                                </p>
                            </div>
                            <div css={tw`flex justify-end`}>
                                <Button type={'submit'} disabled={isSubmitting || parseInt(amount, 10) < 500}>
                                    {isSubmitting ? 'Processing...' : 'Pay with QRIS'}
                                </Button>
                            </div>
                        </form>
                    </div>
                </div>
            </div>
        </PageContentBlock>
    );
};
