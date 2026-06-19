import React, { useState } from 'react';
import PageContentBlock from '@/components/elements/PageContentBlock';
import http from '@/api/http';
import useFlash from '@/plugins/useFlash';
import { faWallet, faArrowUp, faShieldAlt, faBolt, faCheckCircle } from '@fortawesome/free-solid-svg-icons';
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

const quickAmounts = [10000, 25000, 50000, 100000, 250000, 500000];

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
            <div style={{ maxWidth: '960px', margin: '0 auto', padding: '0 16px' }}>
                
                {/* Balance Card */}
                <div style={{
                    background: 'linear-gradient(135deg, #6366f1 0%, #8b5cf6 50%, #a78bfa 100%)',
                    borderRadius: '20px',
                    padding: '32px 36px',
                    marginBottom: '28px',
                    position: 'relative',
                    overflow: 'hidden',
                    boxShadow: '0 20px 60px rgba(99, 102, 241, 0.3)',
                }}>
                    {/* Decorative circles */}
                    <div style={{
                        position: 'absolute',
                        top: '-40px',
                        right: '-40px',
                        width: '160px',
                        height: '160px',
                        borderRadius: '50%',
                        background: 'rgba(255,255,255,0.1)',
                    }} />
                    <div style={{
                        position: 'absolute',
                        bottom: '-30px',
                        right: '60px',
                        width: '100px',
                        height: '100px',
                        borderRadius: '50%',
                        background: 'rgba(255,255,255,0.07)',
                    }} />
                    
                    <div style={{ position: 'relative', zIndex: 1 }}>
                        <div style={{ display: 'flex', alignItems: 'center', marginBottom: '8px' }}>
                            <FontAwesomeIcon icon={faWallet} style={{ color: 'rgba(255,255,255,0.8)', marginRight: '10px', fontSize: '14px' }} />
                            <span style={{ color: 'rgba(255,255,255,0.8)', fontSize: '14px', fontWeight: 500, letterSpacing: '0.5px', textTransform: 'uppercase' as const }}>
                                Current Balance
                            </span>
                        </div>
                        <div style={{ fontSize: '36px', fontWeight: 700, color: '#fff', letterSpacing: '-0.5px' }}>
                            Rp {new Intl.NumberFormat('id-ID').format(Number(currentBalance))}
                        </div>
                    </div>
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: '1fr 340px', gap: '28px', alignItems: 'start' }}>
                    
                    {/* Top-up Form Card */}
                    <div style={{
                        background: 'rgba(30, 41, 59, 0.7)',
                        backdropFilter: 'blur(20px)',
                        WebkitBackdropFilter: 'blur(20px)',
                        border: '1px solid rgba(255,255,255,0.08)',
                        borderRadius: '16px',
                        padding: '28px',
                    }}>
                        <h2 style={{ 
                            fontSize: '20px', 
                            fontWeight: 600, 
                            color: '#f1f5f9', 
                            marginBottom: '24px',
                            display: 'flex',
                            alignItems: 'center',
                            gap: '10px',
                        }}>
                            <div style={{
                                width: '36px',
                                height: '36px',
                                borderRadius: '10px',
                                background: 'linear-gradient(135deg, #6366f1, #8b5cf6)',
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'center',
                            }}>
                                <FontAwesomeIcon icon={faArrowUp} style={{ color: '#fff', fontSize: '14px' }} />
                            </div>
                            Top-up Balance
                        </h2>
                        
                        {/* Quick Amount Buttons */}
                        <div style={{ marginBottom: '20px' }}>
                            <label style={{ 
                                display: 'block', 
                                color: '#94a3b8', 
                                fontSize: '13px', 
                                fontWeight: 500, 
                                marginBottom: '10px',
                                letterSpacing: '0.3px',
                            }}>
                                Quick Select
                            </label>
                            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '8px' }}>
                                {quickAmounts.map((qa) => (
                                    <button
                                        key={qa}
                                        type="button"
                                        onClick={() => setAmount(String(qa))}
                                        style={{
                                            padding: '10px 8px',
                                            borderRadius: '10px',
                                            border: amount === String(qa)
                                                ? '2px solid #6366f1'
                                                : '1px solid rgba(255,255,255,0.1)',
                                            background: amount === String(qa)
                                                ? 'rgba(99, 102, 241, 0.15)'
                                                : 'rgba(255,255,255,0.03)',
                                            color: amount === String(qa) ? '#a5b4fc' : '#cbd5e1',
                                            fontSize: '13px',
                                            fontWeight: 600,
                                            cursor: 'pointer',
                                            transition: 'all 0.2s ease',
                                        }}
                                    >
                                        Rp {new Intl.NumberFormat('id-ID').format(qa)}
                                    </button>
                                ))}
                            </div>
                        </div>

                        {/* Custom Amount */}
                        <form onSubmit={submit}>
                            <div style={{ marginBottom: '20px' }}>
                                <label style={{ 
                                    display: 'block', 
                                    color: '#94a3b8', 
                                    fontSize: '13px', 
                                    fontWeight: 500, 
                                    marginBottom: '8px',
                                    letterSpacing: '0.3px',
                                }}>
                                    Custom Amount
                                </label>
                                <div style={{ position: 'relative' }}>
                                    <span style={{
                                        position: 'absolute',
                                        left: '14px',
                                        top: '50%',
                                        transform: 'translateY(-50%)',
                                        color: '#64748b',
                                        fontSize: '14px',
                                        fontWeight: 600,
                                    }}>Rp</span>
                                    <input
                                        type="number"
                                        value={amount}
                                        onChange={(e) => setAmount(e.target.value)}
                                        placeholder="50000"
                                        min={500}
                                        required
                                        style={{
                                            width: '100%',
                                            padding: '12px 16px 12px 42px',
                                            borderRadius: '12px',
                                            border: '1px solid rgba(255,255,255,0.1)',
                                            background: 'rgba(15, 23, 42, 0.6)',
                                            color: '#f1f5f9',
                                            fontSize: '16px',
                                            fontWeight: 500,
                                            outline: 'none',
                                            transition: 'all 0.2s ease',
                                            boxSizing: 'border-box' as const,
                                        }}
                                        onFocus={(e) => {
                                            e.target.style.borderColor = '#6366f1';
                                            e.target.style.boxShadow = '0 0 0 3px rgba(99,102,241,0.2)';
                                        }}
                                        onBlur={(e) => {
                                            e.target.style.borderColor = 'rgba(255,255,255,0.1)';
                                            e.target.style.boxShadow = 'none';
                                        }}
                                    />
                                </div>
                                <p style={{ color: '#64748b', fontSize: '12px', marginTop: '6px' }}>
                                    Minimum top-up amount is Rp 500
                                </p>
                            </div>
                            
                            <button
                                type="submit"
                                disabled={isSubmitting || parseInt(amount, 10) < 500}
                                style={{
                                    width: '100%',
                                    padding: '14px 24px',
                                    borderRadius: '12px',
                                    border: 'none',
                                    background: (isSubmitting || parseInt(amount, 10) < 500)
                                        ? 'rgba(99, 102, 241, 0.3)'
                                        : 'linear-gradient(135deg, #6366f1, #8b5cf6)',
                                    color: '#fff',
                                    fontSize: '15px',
                                    fontWeight: 600,
                                    cursor: (isSubmitting || parseInt(amount, 10) < 500) ? 'not-allowed' : 'pointer',
                                    transition: 'all 0.3s ease',
                                    boxShadow: (isSubmitting || parseInt(amount, 10) < 500)
                                        ? 'none'
                                        : '0 8px 24px rgba(99, 102, 241, 0.35)',
                                    display: 'flex',
                                    alignItems: 'center',
                                    justifyContent: 'center',
                                    gap: '8px',
                                    letterSpacing: '0.3px',
                                }}
                            >
                                {isSubmitting ? (
                                    <>
                                        <div style={{
                                            width: '16px',
                                            height: '16px',
                                            border: '2px solid rgba(255,255,255,0.3)',
                                            borderTopColor: '#fff',
                                            borderRadius: '50%',
                                            animation: 'spin 0.8s linear infinite',
                                        }} />
                                        Processing...
                                    </>
                                ) : (
                                    <>
                                        <FontAwesomeIcon icon={faBolt} />
                                        Pay with QRIS
                                    </>
                                )}
                            </button>
                        </form>
                    </div>

                    {/* Info Sidebar */}
                    <div style={{ display: 'flex', flexDirection: 'column' as const, gap: '16px' }}>
                        
                        {/* How it works */}
                        <div style={{
                            background: 'rgba(30, 41, 59, 0.7)',
                            backdropFilter: 'blur(20px)',
                            border: '1px solid rgba(255,255,255,0.08)',
                            borderRadius: '16px',
                            padding: '24px',
                        }}>
                            <h3 style={{ fontSize: '15px', fontWeight: 600, color: '#f1f5f9', marginBottom: '16px' }}>
                                How it works
                            </h3>
                            <div style={{ display: 'flex', flexDirection: 'column' as const, gap: '14px' }}>
                                {[
                                    { step: '1', text: 'Enter amount or pick a quick option' },
                                    { step: '2', text: 'Click "Pay with QRIS" to open payment' },
                                    { step: '3', text: 'Scan QR code with any e-wallet app' },
                                    { step: '4', text: 'Balance updates instantly!' },
                                ].map((item) => (
                                    <div key={item.step} style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                                        <div style={{
                                            width: '28px',
                                            height: '28px',
                                            borderRadius: '8px',
                                            background: 'linear-gradient(135deg, rgba(99,102,241,0.2), rgba(139,92,246,0.2))',
                                            border: '1px solid rgba(99,102,241,0.3)',
                                            display: 'flex',
                                            alignItems: 'center',
                                            justifyContent: 'center',
                                            color: '#a5b4fc',
                                            fontSize: '12px',
                                            fontWeight: 700,
                                            flexShrink: 0,
                                        }}>
                                            {item.step}
                                        </div>
                                        <span style={{ color: '#94a3b8', fontSize: '13px', lineHeight: '1.4' }}>
                                            {item.text}
                                        </span>
                                    </div>
                                ))}
                            </div>
                        </div>

                        {/* Security Note */}
                        <div style={{
                            background: 'rgba(30, 41, 59, 0.7)',
                            backdropFilter: 'blur(20px)',
                            border: '1px solid rgba(255,255,255,0.08)',
                            borderRadius: '16px',
                            padding: '24px',
                        }}>
                            <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '12px' }}>
                                <FontAwesomeIcon icon={faShieldAlt} style={{ color: '#22c55e', fontSize: '14px' }} />
                                <h3 style={{ fontSize: '15px', fontWeight: 600, color: '#f1f5f9' }}>Secure Payment</h3>
                            </div>
                            <p style={{ color: '#64748b', fontSize: '13px', lineHeight: '1.6', margin: 0 }}>
                                All transactions are processed securely through TransaksiKita payment gateway with end-to-end encryption.
                            </p>
                        </div>

                        {/* Supported */}
                        <div style={{
                            background: 'rgba(30, 41, 59, 0.7)',
                            backdropFilter: 'blur(20px)',
                            border: '1px solid rgba(255,255,255,0.08)',
                            borderRadius: '16px',
                            padding: '24px',
                        }}>
                            <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '12px' }}>
                                <FontAwesomeIcon icon={faCheckCircle} style={{ color: '#6366f1', fontSize: '14px' }} />
                                <h3 style={{ fontSize: '15px', fontWeight: 600, color: '#f1f5f9' }}>Supported Payments</h3>
                            </div>
                            <p style={{ color: '#64748b', fontSize: '13px', lineHeight: '1.6', margin: 0 }}>
                                GoPay, OVO, Dana, ShopeePay, LinkAja, and all banks that support QRIS.
                            </p>
                        </div>
                    </div>
                </div>
            </div>

            {/* Spinner animation */}
            <style>{`
                @keyframes spin {
                    to { transform: rotate(360deg); }
                }
                @media (max-width: 768px) {
                    div[style*="grid-template-columns: 1fr 340px"] {
                        grid-template-columns: 1fr !important;
                    }
                }
            `}</style>
        </PageContentBlock>
    );
};
