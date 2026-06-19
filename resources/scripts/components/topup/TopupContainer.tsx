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

interface PaymentResponse {
    qrisUrl: string;
    checkoutUrl: string;
    referenceId: string;
}

export default () => {
    const [amount, setAmount] = useState('');
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [paymentData, setPaymentData] = useState<PaymentResponse | null>(null);
    const { clearFlashes, addFlash } = useFlash();

    const submit = (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault();
        e.stopPropagation();

        clearFlashes('topup');
        setIsSubmitting(true);

        http.post('/api/client/account/topup', { amount: parseInt(amount, 10) })
            .then(({ data }) => {
                setPaymentData(data.data);
                addFlash({
                    key: 'topup',
                    type: 'success',
                    message: 'Payment generated successfully. Please scan the QR code to complete your top-up.',
                });
            })
            .catch((error) => {
                console.error(error);
                addFlash({
                    key: 'topup',
                    type: 'error',
                    message: error.response?.data?.error || 'An error occurred while generating the payment.',
                });
            })
            .then(() => setIsSubmitting(false));
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
                        
                        {!paymentData ? (
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
                                        {isSubmitting ? 'Generating...' : 'Generate QRIS'}
                                    </Button>
                                </div>
                            </form>
                        ) : (
                            <div css={tw`text-center`}>
                                <p css={tw`mb-4 text-neutral-300`}>
                                    Please scan the QR code below using your favorite e-wallet or banking app.
                                </p>
                                <div css={tw`bg-white p-4 inline-block rounded-lg mb-4`}>
                                    <img src={paymentData.qrisUrl} alt="QRIS Code" css={tw`w-64 h-64 object-contain`} />
                                </div>
                                <p css={tw`text-sm text-neutral-400 mb-6`}>
                                    Reference ID: <span css={tw`font-mono`}>{paymentData.referenceId}</span>
                                </p>
                                <div css={tw`flex justify-center space-x-4`}>
                                    <Button onClick={() => window.open(paymentData.checkoutUrl, '_blank')} color={'primary'}>
                                        Open Checkout Page
                                    </Button>
                                    <Button onClick={() => setPaymentData(null)} color={'secondary'}>
                                        Top-up Again
                                    </Button>
                                </div>
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </PageContentBlock>
    );
};
