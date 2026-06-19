import React, { useState } from 'react';
import { ServerContext } from '@/state/server';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faCreditCard, faCalendarAlt, faExclamationTriangle } from '@fortawesome/free-solid-svg-icons';
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
    
    const handleRenew = () => {
        clearFlashes('server:billing');
        setSubmitting(true);

        http.post(`/api/client/store/renew/${uuid}`, {
            duration: storeRenewalDuration || 1
        }).then(({ data }) => {
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
                            Rp {storeRenewalCost.toLocaleString()} <span className="text-xs font-normal text-neutral-500">/ {storeRenewalDuration} mo</span>
                        </p>
                    </div>
                    <Button 
                        color={isExpired ? 'red' : 'primary'} 
                        className="flex-1 md:flex-none py-3"
                        onClick={handleRenew}
                        disabled={submitting}
                    >
                        {submitting ? <Spinner size="small" /> : 'Renew Now'}
                    </Button>
                </div>
            </div>
        </div>
    );
};
