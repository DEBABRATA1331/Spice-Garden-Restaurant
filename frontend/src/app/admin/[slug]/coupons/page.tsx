'use client';
import { useEffect, useState } from 'react';
import { couponApi } from '@/lib/api';
import toast from 'react-hot-toast';

export default function AdminCouponsPage() {
    const [coupons, setCoupons] = useState<any[]>([]);
    const [restaurant, setRestaurant] = useState<any>(null);
    const [modal, setModal] = useState(false);
    const [form, setForm] = useState<any>({ type: 'percent', value: '', minOrder: '0', isActive: true });

    useEffect(() => {
        const r = JSON.parse(localStorage.getItem('adminRestaurant') || '{}');
        setRestaurant(r);
        couponApi.getAll().then(r => setCoupons(r.data)).catch(() => { });
    }, []);

    const save = async () => {
        try {
            await couponApi.create({ ...form, restaurantId: restaurant.id });
            toast.success('Coupon created!');
            setModal(false);
            const r = await couponApi.getAll();
            setCoupons(r.data);
        } catch (e: any) { toast.error(e.response?.data?.error || 'Error'); }
    };

    const toggle = async (id: string, isActive: boolean) => {
        await couponApi.update(id, { isActive: !isActive });
        setCoupons(prev => prev.map(c => c.id === id ? { ...c, isActive: !isActive } : c));
    };

    const del = async (id: string) => {
        if (!confirm('Delete coupon?')) return;
        await couponApi.delete(id);
        setCoupons(prev => prev.filter(c => c.id !== id));
        toast.success('Deleted');
    };

    return (
        <div>
            <div className="flex items-center justify-between mb-6">
                <h1 className="font-display text-3xl font-bold">Coupons & Offers</h1>
                <button onClick={() => { setForm({ type: 'percent', value: '', minOrder: '0', isActive: true }); setModal(true); }} className="btn-primary">+ Create Coupon</button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {coupons.length === 0 && <div className="card p-8 text-center text-zinc-500 col-span-3">No coupons yet. Create your first one!</div>}
                {coupons.map(c => (
                    <div key={c.id} className={`card p-5 ${!c.isActive ? 'opacity-50' : ''}`}>
                        <div className="flex items-center justify-between mb-2">
                            <code className="font-bold text-lg text-orange-400 bg-orange-500/10 px-2 py-0.5 rounded">{c.code}</code>
                            <span className={`text-xs px-2 py-1 rounded-full ${c.isActive ? 'bg-green-500/10 text-green-400' : 'bg-zinc-700 text-zinc-500'}`}>{c.isActive ? 'Active' : 'Inactive'}</span>
                        </div>
                        {c.description && <p className="text-zinc-400 text-sm mb-2">{c.description}</p>}
                        <div className="space-y-1 text-sm text-zinc-500 mb-4">
                            <p>Discount: <span className="text-white">{c.type === 'percent' ? `${c.value}%` : `₹${c.value}`} off</span></p>
                            <p>Min Order: <span className="text-white">₹{c.minOrder}</span></p>
                            <p>Used: <span className="text-white">{c.usedCount}{c.usageLimit ? `/${c.usageLimit}` : '∞'}</span></p>
                            {c.expiresAt && <p>Expires: <span className="text-white">{new Date(c.expiresAt).toLocaleDateString('en-IN')}</span></p>}
                        </div>
                        <div className="flex gap-2">
                            <button onClick={() => toggle(c.id, c.isActive)} className="text-xs px-3 py-1.5 rounded-lg bg-zinc-800 hover:bg-zinc-700 text-zinc-400 hover:text-white flex-1">{c.isActive ? 'Deactivate' : 'Activate'}</button>
                            <button onClick={() => del(c.id)} className="text-xs px-3 py-1.5 rounded-lg bg-red-500/10 text-red-400 hover:bg-red-500 hover:text-white transition-colors">Del</button>
                        </div>
                    </div>
                ))}
            </div>

            {modal && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm">
                    <div className="bg-zinc-900 border border-zinc-800 rounded-2xl w-full max-w-md p-6">
                        <div className="flex items-center justify-between mb-4">
                            <h2 className="font-bold text-lg">Create Coupon</h2>
                            <button onClick={() => setModal(false)} className="text-zinc-400 hover:text-white text-2xl">&times;</button>
                        </div>
                        <div className="space-y-3">
                            <input className="input" placeholder="Coupon Code (e.g. SAVE10)" value={form.code || ''} onChange={e => setForm({ ...form, code: e.target.value.toUpperCase() })} />
                            <input className="input" placeholder="Description" value={form.description || ''} onChange={e => setForm({ ...form, description: e.target.value })} />
                            <div className="grid grid-cols-2 gap-3">
                                <select className="input" value={form.type} onChange={e => setForm({ ...form, type: e.target.value })}>
                                    <option value="percent">Percentage (%)</option>
                                    <option value="fixed">Fixed Amount (₹)</option>
                                </select>
                                <input className="input" placeholder={form.type === 'percent' ? '% value' : '₹ value'} type="number" value={form.value || ''} onChange={e => setForm({ ...form, value: e.target.value })} />
                            </div>
                            <div className="grid grid-cols-2 gap-3">
                                <input className="input" placeholder="Min Order ₹" type="number" value={form.minOrder || ''} onChange={e => setForm({ ...form, minOrder: e.target.value })} />
                                <input className="input" placeholder="Max Discount ₹" type="number" value={form.maxDiscount || ''} onChange={e => setForm({ ...form, maxDiscount: e.target.value })} />
                            </div>
                            <div className="grid grid-cols-2 gap-3">
                                <input className="input" placeholder="Usage Limit" type="number" value={form.usageLimit || ''} onChange={e => setForm({ ...form, usageLimit: e.target.value })} />
                                <input className="input" type="date" value={form.expiresAt || ''} onChange={e => setForm({ ...form, expiresAt: e.target.value })} />
                            </div>
                            <button onClick={save} className="btn-primary w-full">Create Coupon</button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}
