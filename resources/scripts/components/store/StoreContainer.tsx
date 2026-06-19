import React, { useEffect, useState } from 'react';
import PageContentBlock from '@/components/elements/PageContentBlock';
import tw, { styled } from 'twin.macro';
import http from '@/api/http';
import FlashMessageRender from '@/components/FlashMessageRender';
import useFlash from '@/plugins/useFlash';
import { useStoreState } from 'easy-peasy';
import { ApplicationStore } from '@/state';
import Button from '@/components/elements/Button';
import Spinner from '@/components/elements/Spinner';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faMicrochip, faMemory, faHdd, faDatabase, faArchive, faNetworkWired, faShoppingCart, faServer } from '@fortawesome/free-solid-svg-icons';

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
    const balance = useStoreState((state: ApplicationStore) => state.user.data!.balance);
    const [loading, setLoading] = useState(true);
    const [submitting, setSubmitting] = useState(false);
    const [info, setInfo] = useState<StoreInfo | null>(null);

    const [cpu, setCpu] = useState(100);
    const [ram, setRam] = useState(1024);
    const [disk, setDisk] = useState(1024);
    const [databases, setDatabases] = useState(1);
    const [backups, setBackups] = useState(1);
    const [ports, setPorts] = useState(1);
    const [eggId, setEggId] = useState(0);

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

    const calculateTotal = () => {
        let total = 0;
        total += (cpu / 10) * info.prices.cpu;
        total += (ram / 1024) * info.prices.ram;
        total += (disk / 1024) * info.prices.disk;
        total += databases * info.prices.database;
        total += backups * info.prices.backup;
        total += ports * info.prices.port;
        return total;
    };

    const totalCost = calculateTotal();

    const handlePurchase = () => {
        if (eggId === 0) {
            addFlash({ type: 'error', key: 'store', message: 'Please select a server type (Egg).' });
            return;
        }

        if (balance < totalCost) {
            addFlash({ type: 'error', key: 'store', message: 'Insufficient balance to purchase this server.' });
            return;
        }

        clearFlashes('store');
        setSubmitting(true);

        http.post('/api/client/store/purchase', {
            egg_id: eggId,
            cpu,
            ram,
            disk,
            databases,
            backups,
            ports,
        }).then(({ data }) => {
            addFlash({ type: 'success', key: 'store', message: 'Server deployed successfully! It will appear in your dashboard shortly.' });
            setTimeout(() => {
                window.location.href = '/';
            }, 2000);
        }).catch(error => {
            setSubmitting(false);
            addFlash({
                type: 'error',
                key: 'store',
                message: error.response?.data?.error || 'An error occurred while deploying the server.',
            });
        });
    };

    return (
        <PageContentBlock title="Store">
            <Container>
                <Header>Server Store</Header>
                <Subtitle>Customize and deploy your new server instantly using your account balance.</Subtitle>
                
                <FlashMessageRender byKey="store" className="mb-6" />

                <Grid>
                    {/* Left Column: Resource Sliders */}
                    <div className="lg:col-span-2 space-y-6">
                        <GlassCard>
                            <h3 className="text-xl font-semibold mb-6 text-neutral-200 border-b border-neutral-700 pb-2">
                                <FontAwesomeIcon icon={faServer} className="mr-2 text-indigo-400" /> Resource Configuration
                            </h3>
                            
                            <SliderGroup>
                                <label>
                                    <span><FontAwesomeIcon icon={faMicrochip} className="mr-2 text-blue-400"/> CPU Limit</span>
                                    <span className="text-indigo-400 font-bold">{cpu}%</span>
                                </label>
                                <input type="range" min="10" max="800" step="10" value={cpu} onChange={(e) => setCpu(Number(e.target.value))} />
                                <div className="text-xs text-neutral-500 mt-1">Price: {info.prices.cpu.toLocaleString()} per 10%</div>
                            </SliderGroup>

                            <SliderGroup>
                                <label>
                                    <span><FontAwesomeIcon icon={faMemory} className="mr-2 text-purple-400"/> Memory (RAM)</span>
                                    <span className="text-indigo-400 font-bold">{ram} MB</span>
                                </label>
                                <input type="range" min="512" max="16384" step="512" value={ram} onChange={(e) => setRam(Number(e.target.value))} />
                                <div className="text-xs text-neutral-500 mt-1">Price: {info.prices.ram.toLocaleString()} per 1024 MB</div>
                            </SliderGroup>

                            <SliderGroup>
                                <label>
                                    <span><FontAwesomeIcon icon={faHdd} className="mr-2 text-emerald-400"/> Disk Space</span>
                                    <span className="text-indigo-400 font-bold">{disk} MB</span>
                                </label>
                                <input type="range" min="512" max="51200" step="512" value={disk} onChange={(e) => setDisk(Number(e.target.value))} />
                                <div className="text-xs text-neutral-500 mt-1">Price: {info.prices.disk.toLocaleString()} per 1024 MB</div>
                            </SliderGroup>
                        </GlassCard>

                        <GlassCard>
                            <h3 className="text-xl font-semibold mb-6 text-neutral-200 border-b border-neutral-700 pb-2">
                                <FontAwesomeIcon icon={faArchive} className="mr-2 text-orange-400" /> Additional Allocations
                            </h3>
                            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                                <SliderGroup>
                                    <label>
                                        <span><FontAwesomeIcon icon={faDatabase} className="mr-2 text-red-400"/> Databases</span>
                                        <span className="text-indigo-400 font-bold">{databases}</span>
                                    </label>
                                    <input type="range" min="0" max="10" step="1" value={databases} onChange={(e) => setDatabases(Number(e.target.value))} />
                                </SliderGroup>
                                <SliderGroup>
                                    <label>
                                        <span><FontAwesomeIcon icon={faArchive} className="mr-2 text-yellow-400"/> Backups</span>
                                        <span className="text-indigo-400 font-bold">{backups}</span>
                                    </label>
                                    <input type="range" min="0" max="10" step="1" value={backups} onChange={(e) => setBackups(Number(e.target.value))} />
                                </SliderGroup>
                                <SliderGroup>
                                    <label>
                                        <span><FontAwesomeIcon icon={faNetworkWired} className="mr-2 text-cyan-400"/> Extra Ports</span>
                                        <span className="text-indigo-400 font-bold">{ports}</span>
                                    </label>
                                    <input type="range" min="0" max="5" step="1" value={ports} onChange={(e) => setPorts(Number(e.target.value))} />
                                </SliderGroup>
                            </div>
                        </GlassCard>

                        <GlassCard>
                            <h3 className="text-xl font-semibold mb-6 text-neutral-200 border-b border-neutral-700 pb-2">
                                Software Type
                            </h3>
                            <SelectBox value={eggId} onChange={(e) => setEggId(Number(e.target.value))}>
                                <option value={0} disabled>Select a software...</option>
                                {info.nests.map(nest => (
                                    <optgroup key={nest.id} label={nest.name}>
                                        {nest.eggs.map(egg => (
                                            <option key={egg.id} value={egg.id}>{egg.name}</option>
                                        ))}
                                    </optgroup>
                                ))}
                            </SelectBox>
                            <p className="text-xs text-neutral-500 mt-2">
                                {eggId !== 0 && info.nests.flatMap(n => n.eggs).find(e => e.id === eggId)?.description}
                            </p>
                        </GlassCard>
                    </div>

                    {/* Right Column: Order Summary */}
                    <div>
                        <div className="sticky top-24">
                            <GlassCard style={{ background: 'linear-gradient(145deg, rgba(30, 41, 59, 0.7), rgba(15, 23, 42, 0.8))' }}>
                                <h3 className="text-xl font-semibold mb-6 text-neutral-200">Order Summary</h3>
                                
                                <div className="space-y-3 mb-6 text-sm text-neutral-300">
                                    <div className="flex justify-between">
                                        <span>CPU ({cpu}%)</span>
                                        <span>{((cpu / 10) * info.prices.cpu).toLocaleString()}</span>
                                    </div>
                                    <div className="flex justify-between">
                                        <span>RAM ({ram} MB)</span>
                                        <span>{((ram / 1024) * info.prices.ram).toLocaleString()}</span>
                                    </div>
                                    <div className="flex justify-between">
                                        <span>Disk ({disk} MB)</span>
                                        <span>{((disk / 1024) * info.prices.disk).toLocaleString()}</span>
                                    </div>
                                    {databases > 0 && (
                                        <div className="flex justify-between">
                                            <span>Databases ({databases})</span>
                                            <span>{(databases * info.prices.database).toLocaleString()}</span>
                                        </div>
                                    )}
                                    {backups > 0 && (
                                        <div className="flex justify-between">
                                            <span>Backups ({backups})</span>
                                            <span>{(backups * info.prices.backup).toLocaleString()}</span>
                                        </div>
                                    )}
                                    {ports > 0 && (
                                        <div className="flex justify-between">
                                            <span>Extra Ports ({ports})</span>
                                            <span>{(ports * info.prices.port).toLocaleString()}</span>
                                        </div>
                                    )}
                                </div>
                                
                                <div className="border-t border-neutral-700 pt-4 mb-6">
                                    <div className="flex justify-between items-end">
                                        <span className="text-neutral-400 uppercase tracking-wider text-xs font-bold">Total Cost</span>
                                        <span className="text-3xl font-bold text-indigo-400">{totalCost.toLocaleString()}</span>
                                    </div>
                                    <div className="flex justify-between items-center mt-2 text-xs">
                                        <span className="text-neutral-500">Your Balance</span>
                                        <span className={`font-bold ${balance < totalCost ? 'text-red-400' : 'text-emerald-400'}`}>
                                            {balance.toLocaleString()}
                                        </span>
                                    </div>
                                </div>

                                <Button 
                                    className="w-full py-4 text-lg font-bold shadow-lg" 
                                    color="primary" 
                                    disabled={submitting || balance < totalCost || eggId === 0}
                                    onClick={handlePurchase}
                                >
                                    {submitting ? <Spinner size="small" /> : 'Deploy Server'}
                                </Button>
                                {balance < totalCost && (
                                    <p className="text-red-400 text-xs text-center mt-3">You don't have enough balance.</p>
                                )}
                            </GlassCard>
                        </div>
                    </div>
                </Grid>
            </Container>
        </PageContentBlock>
    );
};
