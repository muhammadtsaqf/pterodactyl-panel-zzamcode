import React, { useEffect, useState } from 'react';
import PageContentBlock from '@/components/elements/PageContentBlock';
import tw, { styled } from 'twin.macro';
import http from '@/api/http';
import FlashMessageRender from '@/components/FlashMessageRender';
import useFlash from '@/plugins/useFlash';
import Button from '@/components/elements/Button';
import Spinner from '@/components/elements/Spinner';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faMicrochip, faMemory, faHdd, faDatabase, faArchive, faNetworkWired, faShoppingCart, faServer, faCalendarAlt, faPlus, faSyncAlt, faTag } from '@fortawesome/free-solid-svg-icons';
import Input from '@/components/elements/Input';
import useSWR from 'swr';
import getServers from '@/api/getServers';

declare global {
    interface Window {
        TransaksiKita: {
            pay: (paymentId: string, options: any) => void;
            close: () => void;
        };
    }
}

const Container = styled.div`
    ${tw`max-w-7xl mx-auto w-full`};
    padding: 2rem 1rem;
`;

const GlassCard = styled.div`
    background: rgba(15, 23, 42, 0.4);
    backdrop-filter: blur(12px);
    border: 1px solid rgba(255, 255, 255, 0.05);
    border-radius: 16px;
    padding: 2rem;
    box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06);
    position: relative;
    overflow: hidden;

    &::before {
        content: '';
        position: absolute;
        top: 0;
        left: 0;
        right: 0;
        height: 1px;
        background: linear-gradient(90deg, transparent, rgba(255, 255, 255, 0.1), transparent);
    }
`;

const Header = styled.h1`
    ${tw`text-3xl font-bold text-neutral-100 mb-2`};
    font-family: 'Inter', sans-serif;
`;

const Subtitle = styled.p`
    ${tw`text-neutral-400 mb-8`};
    font-family: 'Inter', sans-serif;
`;

const Grid = styled.div`
    ${tw`grid grid-cols-1 lg:grid-cols-3 gap-8`};
`;

const SliderGroup = styled.div`
    ${tw`mb-6`};
    
    label {
        ${tw`flex justify-between items-center mb-2 text-sm font-medium text-neutral-300`};
    }
    
    input[type="range"] {
        ${tw`w-full h-2 bg-neutral-700 rounded-lg appearance-none cursor-pointer`};
        accent-color: #6366f1;
    }
`;

const SelectBox = styled.select`
    ${tw`w-full bg-neutral-900 border border-neutral-700 text-neutral-200 rounded-lg px-4 py-3 focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none transition-all`};
`;

const TabButton = styled.button<{ $active: boolean }>`
    ${tw`flex-1 py-3 px-6 text-center font-medium rounded-lg transition-all duration-200 outline-none`};
    ${props => props.$active 
        ? tw`bg-indigo-600 text-white shadow-lg` 
        : tw`bg-neutral-800 text-neutral-400 hover:bg-neutral-700 hover:text-neutral-200`};
`;

interface StoreInfo {
    enabled: boolean;
    prices: {
        cpu: number;
        ram: number;
        disk: number;
        database: number;
        backup: number;
        port: number;
    };
    nests: {
        id: number;
        name: string;
        eggs: {
            id: number;
            name: string;
            description: string;
        }[];
    }[];
}

export default () => {
    const { clearFlashes, addFlash } = useFlash();
    const [loading, setLoading] = useState(true);
    const [submitting, setSubmitting] = useState(false);
    const [info, setInfo] = useState<StoreInfo | null>(null);
    const [activeTab, setActiveTab] = useState<'new' | 'renew'>('new');

    // New Order State
    const [serverName, setServerName] = useState('');
    const [cpu, setCpu] = useState(100);
    const [ram, setRam] = useState(1024);
    const [disk, setDisk] = useState(1024);
    const [databases, setDatabases] = useState(1);
    const [backups, setBackups] = useState(1);
    const [ports, setPorts] = useState(1);
    const [eggId, setEggId] = useState(0);
    const [duration, setDuration] = useState(1);

    // Renew State
    const [selectedServerId, setSelectedServerId] = useState<string>('');
    const { data: serversData } = useSWR(['/api/client/servers', false, 1], () => getServers({ page: 1 }));

    // Discount State
    const [discountCode, setDiscountCode] = useState('');
    const [appliedDiscount, setAppliedDiscount] = useState<{code: string, percent: number} | null>(null);
    const [validatingDiscount, setValidatingDiscount] = useState(false);

    useEffect(() => {
        clearFlashes('store');
        http.get('/api/client/store/info')
            .then(({ data }) => {
                setInfo(data);
                if (data.nests.length > 0 && data.nests[0].eggs.length > 0) {
                    setEggId(data.nests[0].eggs[0].id);
                }
                setLoading(false);
            })
            .catch(error => {
                addFlash({
                    type: 'error',
                    key: 'store',
                    message: 'Failed to load store information.',
                });
                setLoading(false);
            });
    }, []);

    const validateDiscount = () => {
        if (!discountCode.trim()) return;
        setValidatingDiscount(true);
        clearFlashes('store');

        http.post('/api/client/store/discounts/validate', { code: discountCode })
            .then(({ data }) => {
                setAppliedDiscount({ code: discountCode, percent: data.discount_percent });
                addFlash({ type: 'success', key: 'store', message: `Discount code applied! ${data.discount_percent}% off.` });
            })
            .catch(err => {
                setAppliedDiscount(null);
                addFlash({ type: 'error', key: 'store', message: err.response?.data?.error || 'Invalid discount code.' });
            })
            .finally(() => setValidatingDiscount(false));
    };

    if (loading || !info) {
        return (
            <PageContentBlock title="Store">
                <div className="flex justify-center items-center h-64">
                    <Spinner size="large" />
                </div>
            </PageContentBlock>
        );
    }

    if (!info.enabled) {
        return (
            <PageContentBlock title="Store">
                <Container>
                    <GlassCard className="text-center py-12">
                        <FontAwesomeIcon icon={faShoppingCart} className="text-5xl text-neutral-500 mb-4" />
                        <h2 className="text-2xl font-bold text-neutral-300">Store is Disabled</h2>
                        <p className="text-neutral-500 mt-2">The administrator has temporarily disabled the store.</p>
                    </GlassCard>
                </Container>
            </PageContentBlock>
        );
    }

    const calculateNewTotal = () => {
        let total = 0;
        total += (cpu / 10) * info.prices.cpu;
        total += (ram / 1024) * info.prices.ram;
        total += (disk / 1024) * info.prices.disk;
        total += databases * info.prices.database;
        total += backups * info.prices.backup;
        total += ports * info.prices.port;
        
        return total * duration;
    };

    const calculateRenewTotal = () => {
        if (!selectedServerId || !serversData) return 0;
        const server = serversData.items.find(s => s.uuid === selectedServerId);
        if (!server || !server.storeRenewalCost || !server.storeRenewalDuration) return 0;
        
        const originalMonthlyCost = server.storeRenewalCost / server.storeRenewalDuration;
        return originalMonthlyCost * duration;
    };

    const rawTotalCost = activeTab === 'new' ? calculateNewTotal() : calculateRenewTotal();
    const finalTotalCost = appliedDiscount 
        ? Math.max(0, rawTotalCost - (rawTotalCost * (appliedDiscount.percent / 100))) 
        : rawTotalCost;

    const handleCheckout = () => {
        clearFlashes('store');
        setSubmitting(true);

        const endpoint = activeTab === 'new' ? '/api/client/store/purchase' : `/api/client/store/renew/${selectedServerId}`;
        const payload = activeTab === 'new' ? {
            name: serverName || 'My Server',
            egg_id: eggId,
            cpu,
            ram,
            disk,
            databases,
            backups,
            ports,
            duration,
            discount_code: appliedDiscount?.code
        } : {
            duration,
            discount_code: appliedDiscount?.code
        };

        if (activeTab === 'new' && (!serverName || serverName.length < 3)) {
            addFlash({ type: 'error', key: 'store', message: 'Please enter a valid server name.' });
            setSubmitting(false);
            return;
        }

        if (activeTab === 'renew' && !selectedServerId) {
            addFlash({ type: 'error', key: 'store', message: 'Please select a server to renew.' });
            setSubmitting(false);
            return;
        }

        http.post(endpoint, payload).then(({ data }) => {
            if (window.TransaksiKita && data.data && data.data.paymentId) {
                window.TransaksiKita.pay(data.data.paymentId, {
                    onSuccess: function() {
                        addFlash({
                            key: 'store',
                            type: 'success',
                            message: 'Payment successful! Your order is being processed.',
                        });
                        setTimeout(() => {
                            window.location.href = '/';
                        }, 2500);
                    },
                    onExpired: function() {
                        addFlash({
                            key: 'store',
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
                            key: 'store',
                            type: 'error',
                            message: 'Payment Error: ' + err.message,
                        });
                        setSubmitting(false);
                    }
                });
            } else {
                addFlash({
                    key: 'store',
                    type: 'error',
                    message: 'Payment gateway script not loaded properly.',
                });
                setSubmitting(false);
            }
        }).catch(error => {
            setSubmitting(false);
            addFlash({
                type: 'error',
                key: 'store',
                message: error.response?.data?.error || 'An error occurred while generating checkout.',
            });
        });
    };

    const storeServers = serversData?.items.filter(s => s.storeRenewalCost) || [];

    return (
        <PageContentBlock title="Store">
            <Container>
                <Header>Server Store</Header>
                <Subtitle>Sistem Prepaid / Bayar sebelum aktif. Langsung deploy atau perpanjang server Anda.</Subtitle>
                
                <FlashMessageRender byKey="store" className="mb-6" />

                <div className="flex p-1 bg-neutral-800/50 rounded-lg mb-8 max-w-md mx-auto lg:mx-0">
                    <TabButton $active={activeTab === 'new'} onClick={() => setActiveTab('new')}>
                        <FontAwesomeIcon icon={faPlus} className="mr-2" /> Order Baru
                    </TabButton>
                    <TabButton $active={activeTab === 'renew'} onClick={() => setActiveTab('renew')}>
                        <FontAwesomeIcon icon={faSyncAlt} className="mr-2" /> Perpanjang Server
                    </TabButton>
                </div>

                <Grid>
                    {/* Left Column */}
                    <div className="lg:col-span-2 space-y-6">
                        {activeTab === 'new' ? (
                            <>
                                <GlassCard>
                                    <h3 className="text-xl font-semibold mb-6 text-neutral-200 border-b border-neutral-700 pb-2">
                                        <FontAwesomeIcon icon={faServer} className="mr-2 text-indigo-400" /> Detail Server
                                    </h3>
                                    <div className="mb-6">
                                        <label className="block mb-2 text-sm font-medium text-neutral-300">Nama Server</label>
                                        <Input 
                                            value={serverName} 
                                            onChange={e => setServerName(e.target.value)} 
                                            placeholder="Contoh: SMP Server" 
                                            className="w-full"
                                        />
                                    </div>
                                    <div className="mb-6">
                                        <label className="block mb-2 text-sm font-medium text-neutral-300">Server Type</label>
                                        <SelectBox value={eggId} onChange={(e) => setEggId(Number(e.target.value))}>
                                            {info.nests.map(nest => (
                                                <optgroup key={nest.id} label={nest.name}>
                                                    {nest.eggs.map(egg => (
                                                        <option key={egg.id} value={egg.id}>{egg.name}</option>
                                                    ))}
                                                </optgroup>
                                            ))}
                                        </SelectBox>
                                    </div>
                                </GlassCard>

                                <GlassCard>
                                    <h3 className="text-xl font-semibold mb-6 text-neutral-200 border-b border-neutral-700 pb-2">
                                        <FontAwesomeIcon icon={faMicrochip} className="mr-2 text-blue-400" /> Resource Configuration
                                    </h3>
                                    
                                    <SliderGroup>
                                        <label>
                                            <span>CPU Limit</span>
                                            <span className="text-indigo-400 font-bold">{cpu}%</span>
                                        </label>
                                        <input type="range" min="10" max="800" step="10" value={cpu} onChange={(e) => setCpu(Number(e.target.value))} />
                                    </SliderGroup>

                                    <SliderGroup>
                                        <label>
                                            <span>Memory (RAM)</span>
                                            <span className="text-indigo-400 font-bold">{ram} MB</span>
                                        </label>
                                        <input type="range" min="512" max="16384" step="512" value={ram} onChange={(e) => setRam(Number(e.target.value))} />
                                    </SliderGroup>

                                    <SliderGroup>
                                        <label>
                                            <span>Disk Space</span>
                                            <span className="text-indigo-400 font-bold">{disk} MB</span>
                                        </label>
                                        <input type="range" min="512" max="51200" step="512" value={disk} onChange={(e) => setDisk(Number(e.target.value))} />
                                    </SliderGroup>
                                </GlassCard>

                                <GlassCard>
                                    <h3 className="text-xl font-semibold mb-6 text-neutral-200 border-b border-neutral-700 pb-2">
                                        <FontAwesomeIcon icon={faArchive} className="mr-2 text-orange-400" /> Additional Allocations
                                    </h3>
                                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                                        <SliderGroup>
                                            <label>
                                                <span>Databases</span>
                                                <span className="text-indigo-400 font-bold">{databases}</span>
                                            </label>
                                            <input type="range" min="0" max="10" step="1" value={databases} onChange={(e) => setDatabases(Number(e.target.value))} />
                                        </SliderGroup>

                                        <SliderGroup>
                                            <label>
                                                <span>Backups</span>
                                                <span className="text-indigo-400 font-bold">{backups}</span>
                                            </label>
                                            <input type="range" min="0" max="10" step="1" value={backups} onChange={(e) => setBackups(Number(e.target.value))} />
                                        </SliderGroup>

                                        <SliderGroup>
                                            <label>
                                                <span>Extra Ports</span>
                                                <span className="text-indigo-400 font-bold">{ports}</span>
                                            </label>
                                            <input type="range" min="0" max="5" step="1" value={ports} onChange={(e) => setPorts(Number(e.target.value))} />
                                        </SliderGroup>
                                    </div>
                                </GlassCard>
                            </>
                        ) : (
                            <GlassCard>
                                <h3 className="text-xl font-semibold mb-6 text-neutral-200 border-b border-neutral-700 pb-2">
                                    <FontAwesomeIcon icon={faServer} className="mr-2 text-indigo-400" /> Pilih Server
                                </h3>
                                {storeServers.length > 0 ? (
                                    <SelectBox value={selectedServerId} onChange={(e) => setSelectedServerId(e.target.value)}>
                                        <option value="" disabled>-- Pilih Server untuk diperpanjang --</option>
                                        {storeServers.map(server => (
                                            <option key={server.uuid} value={server.uuid}>{server.name} ({server.uuid.split('-')[0]})</option>
                                        ))}
                                    </SelectBox>
                                ) : (
                                    <div className="p-4 bg-neutral-800 rounded border border-neutral-700 text-neutral-400">
                                        Anda belum memiliki server yang dibeli melalui Store.
                                    </div>
                                )}
                            </GlassCard>
                        )}
                    </div>

                    {/* Right Column: Checkout & Summary */}
                    <div className="space-y-6">
                        <GlassCard>
                            <h3 className="text-xl font-semibold mb-4 text-neutral-200 border-b border-neutral-700 pb-2">
                                <FontAwesomeIcon icon={faCalendarAlt} className="mr-2 text-pink-400" /> Billing Cycle
                            </h3>
                            <SelectBox value={duration} onChange={(e) => setDuration(Number(e.target.value))}>
                                <option value={1}>1 Bulan</option>
                                <option value={3}>3 Bulan</option>
                                <option value={12}>1 Tahun (12 Bulan)</option>
                            </SelectBox>
                        </GlassCard>

                        <GlassCard>
                            <h3 className="text-xl font-semibold mb-4 text-neutral-200 border-b border-neutral-700 pb-2">
                                <FontAwesomeIcon icon={faTag} className="mr-2 text-green-400" /> Kode Diskon
                            </h3>
                            <div className="flex gap-2">
                                <Input 
                                    value={discountCode} 
                                    onChange={e => setDiscountCode(e.target.value)} 
                                    placeholder="Masukkan kode promo" 
                                    className="flex-1"
                                    disabled={appliedDiscount !== null}
                                />
                                {appliedDiscount ? (
                                    <Button color="red" onClick={() => setAppliedDiscount(null)}>Remove</Button>
                                ) : (
                                    <Button onClick={validateDiscount} disabled={validatingDiscount || !discountCode}>Apply</Button>
                                )}
                            </div>
                        </GlassCard>

                        <GlassCard className="border-indigo-500/30">
                            <h3 className="text-xl font-semibold mb-4 text-neutral-200 border-b border-neutral-700 pb-2">
                                Order Summary
                            </h3>
                            
                            <div className="space-y-3 mb-6">
                                <div className="flex justify-between text-sm text-neutral-300">
                                    <span>Harga Normal ({duration} Bulan)</span>
                                    <span>Rp {rawTotalCost.toLocaleString()}</span>
                                </div>
                                {appliedDiscount && (
                                    <div className="flex justify-between text-sm text-green-400 font-medium">
                                        <span>Diskon ({appliedDiscount.percent}%)</span>
                                        <span>- Rp {(rawTotalCost * (appliedDiscount.percent / 100)).toLocaleString()}</span>
                                    </div>
                                )}
                                <div className="border-t border-neutral-700 pt-3 flex justify-between items-center">
                                    <span className="font-semibold text-neutral-200">Total Tagihan</span>
                                    <span className="text-2xl font-bold text-indigo-400">
                                        Rp {finalTotalCost.toLocaleString()}
                                    </span>
                                </div>
                            </div>

                            <Button 
                                size="large" 
                                className="w-full flex items-center justify-center py-4 text-lg bg-gradient-to-r from-indigo-600 to-purple-600 border-0 hover:from-indigo-500 hover:to-purple-500 shadow-lg"
                                onClick={handleCheckout}
                                disabled={submitting || finalTotalCost <= 0 || (activeTab === 'renew' && !selectedServerId) || (activeTab === 'new' && !serverName)}
                            >
                                {submitting ? <Spinner size="small" /> : 'Checkout & Pay'}
                            </Button>
                        </GlassCard>
                    </div>
                </Grid>
            </Container>
        </PageContentBlock>
    );
};
