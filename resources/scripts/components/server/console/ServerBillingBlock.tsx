import React, { useState } from 'react';
import { ServerContext } from '@/state/server';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faCreditCard, faCalendarAlt, faExclamationTriangle } from '@fortawesome/free-solid-svg-icons';
import Input from '@/components/elements/Input';
import Button from '@/components/elements/Button';
import http from '@/api/http';
import useFlash from '@/plugins/useFlash';
import FlashMessageRender from '@/components/FlashMessageRender';
import { formatDistanceToNow, isPast } from 'date-fns';
import Spinner from '@/components/elements/Spinner';

export default () => {
    const { addFlash, clearFlashes } = useFlash();
    const [submitting, setSubmitting] = useState(false);
    
    const uuid = ServerContext.useStoreState(state => state.server.data!.uuid);
    const storeRenewalCost = ServerContext.useStoreState(state => state.server.data!.storeRenewalCost);
    const storeRenewalDuration = ServerContext.useStoreState(state => state.server.data!.storeRenewalDuration);
    const storeExpiresAt = ServerContext.useStoreState(state => state.server.data!.storeExpiresAt);

    if (!storeRenewalCost || !storeExpiresAt) {
        return null; // Not a store server
    }

    const isExpired = isPast(storeExpiresAt);

    const [discountCode, setDiscountCode] = useState('');
    const [appliedDiscount, setAppliedDiscount] = useState<{code: string, percent: number} | null>(null);
    const [validatingDiscount, setValidatingDiscount] = useState(false);

    const validateDiscount = () => {
        if (!discountCode.trim()) return;
        setValidatingDiscount(true);
        clearFlashes('server:billing');

        http.post('/api/client/store/discounts/validate', { code: discountCode })
            .then(({ data }) => {
                setAppliedDiscount({ code: discountCode, percent: data.discount_percent });
                addFlash({ type: 'success', key: 'server:billing', message: `Discount code applied! ${data.discount_percent}% off.` });
            })
            .catch(err => {
                setAppliedDiscount(null);
                addFlash({ type: 'error', key: 'server:billing', message: err.response?.data?.error || 'Invalid discount code.' });
            })
            .finally(() => setValidatingDiscount(false));
    };
    
    const handleRenew = () => {
        clearFlashes('server:billing');
        setSubmitting(true);

        http.post(`/api/client/store/renew/${uuid}`, {
            duration: storeRenewalDuration || 1,
            discount_code: appliedDiscount?.code
        }).then(({ data }) => {
            if (data.data && data.data.paymentId === 'FREE') {
                addFlash({
                    key: 'server:billing',
                    type: 'success',
                    message: 'Renewal successful! Your server active period has been extended.',
                });
                setTimeout(() => {
                    window.location.reload();
                }, 2000);
                return;
            }

            if (window.TransaksiKita && data.data && data.data.paymentId) {
                window.TransaksiKita.pay(data.data.paymentId, {
                    onSuccess: function() {
                        addFlash({
                            key: 'server:billing',
                            type: 'success',
                            message: 'Renewal successful! Your server active period has been extended.',
                        });
                        setTimeout(() => {
                            window.location.reload();
                        }, 2000);
                    },
                    onExpired: function() {
                        addFlash({
                            key: 'server:billing',
                            type: 'error',
                            message: 'Payment expired. Please try again.',
                        });
                        setSubmitting(false);
                    },
                    onClose: function() {
                        setSubmitting(false);
                    },
                    onError: function(err: any) {
                        addFlash({
                            key: 'server:billing',
                            type: 'error',
                            message: 'Payment Error: ' + err.message,
                        });
                        setSubmitting(false);
                    }
                });
            } else {
                addFlash({
                    key: 'server:billing',
                    type: 'error',
                    message: 'Payment gateway script not loaded properly.',
                });
                setSubmitting(false);
            }
        }).catch(error => {
            setSubmitting(false);
            addFlash({
                key: 'server:billing',
                type: 'error',
                message: error.response?.data?.error || 'Failed to generate renewal checkout.',
            });
        });
    };

    return (
        <div className="bg-neutral-900 border border-neutral-800 rounded p-4 mb-4">
            <FlashMessageRender byKey="server:billing" className="mb-4" />
            <div className="flex flex-col md:flex-row justify-between items-center">
                <div className="flex items-center space-x-4 mb-4 md:mb-0">
                    <div className="p-3 bg-indigo-500/10 rounded-full">
                        <FontAwesomeIcon icon={faCreditCard} className="text-indigo-400 text-xl" />
                    </div>
                    <div>
                        <h3 className="text-neutral-200 font-semibold text-lg">Server Billing</h3>
                        <p className="text-sm text-neutral-400">
                            <FontAwesomeIcon icon={faCalendarAlt} className="mr-1" />
                            {isExpired ? (
                                <span className="text-red-400">
                                    <FontAwesomeIcon icon={faExclamationTriangle} className="mr-1" />
                                    Expired {formatDistanceToNow(storeExpiresAt, { addSuffix: true })}
                                </span>
                            ) : (
                                <span>Expires in {formatDistanceToNow(storeExpiresAt)}</span>
                            )}
                        </p>
                    </div>
                </div>
                
                <div className="flex items-center space-x-4 w-full md:w-auto">
                    <div className="text-right hidden sm:block">
                        <p className="text-sm text-neutral-400">Renewal Cost</p>
                        <p className="text-indigo-300 font-bold">
                            {appliedDiscount ? (
                                <>
                                    <span className="line-through text-neutral-500 text-sm mr-2">Rp {storeRenewalCost.toLocaleString()}</span>
                                    Rp {(storeRenewalCost - (storeRenewalCost * (appliedDiscount.percent / 100))).toLocaleString()}
                                </>
                            ) : (
                                <>Rp {storeRenewalCost.toLocaleString()}</>
                            )}
                            <span className="text-xs font-normal text-neutral-500"> / {storeRenewalDuration} mo</span>
                        </p>
                    </div>
                    <Button 
                        color={isExpired ? 'red' : 'primary'} 
                        className="flex-1 md:flex-none py-3 h-12"
                        onClick={handleRenew}
                        disabled={submitting}
                    >
                        {submitting ? <Spinner size="small" /> : 'Renew Now'}
                    </Button>
                </div>
            </div>
            
            <div className="mt-4 pt-4 border-t border-neutral-800 flex flex-col sm:flex-row items-center justify-between gap-4">
                <div className="text-sm text-neutral-400">
                    Punya kode diskon untuk perpanjangan?
                </div>
                <div className="flex gap-2 w-full sm:w-auto">
                    <Input 
                        value={discountCode} 
                        onChange={e => setDiscountCode(e.target.value)} 
                        placeholder="Masukkan kode promo" 
                        className="flex-1 sm:w-64"
                        disabled={appliedDiscount !== null}
                    />
                    {appliedDiscount ? (
                        <Button color="red" onClick={() => setAppliedDiscount(null)}>Hapus</Button>
                    ) : (
                        <Button onClick={validateDiscount} disabled={validatingDiscount || !discountCode}>Apply</Button>
                    )}
                </div>
            </div>
        </div>
    );
};
