'use client';
import { useState, useEffect } from 'react';
import { useParams, useRouter, useSearchParams } from 'next/navigation';
import { authApi, restaurantApi } from '@/lib/api';
import toast from 'react-hot-toast';
import Link from 'next/link';
import { motion } from 'framer-motion';

export default function SimpleLoginPage() {
    const { slug } = useParams<{ slug: string }>();
    const router = useRouter();
    const searchParams = useSearchParams();
    const returnUrl = searchParams.get('returnUrl') || `/${slug}/menu`;

    const [form, setForm] = useState({ name: '', phone: '' });
    const [loading, setLoading] = useState(false);
    const [restaurantName, setRestaurantName] = useState('Loading...');

    useEffect(() => {
        restaurantApi.getBySlug(slug).then(r => setRestaurantName(r.data.name)).catch(() => { });
    }, [slug]);

    const handleLogin = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!form.name || !form.phone) return toast.error('Both fields are required');

        setLoading(true);
        try {
            const r = await restaurantApi.getBySlug(slug);
            const { data } = await authApi.loginSimple({ ...form, restaurantId: r.data.id });

            // Save token
            localStorage.setItem('customerToken', data.token);

            toast.success(`Welcome back, ${data.customer.name.split(' ')[0]}!`);
            router.push(returnUrl);
        } catch (e: any) {
            toast.error(e.response?.data?.error || 'Login failed');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="min-h-screen bg-[#060608] flex items-center justify-center p-4 relative overflow-hidden">
            {/* Cinematic Background Elements */}
            <div className="absolute inset-0 z-0">
                <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-orange-500/10 rounded-full blur-[120px]" />
                <div className="absolute top-0 right-0 w-[400px] h-[400px] bg-cyan-500/5 rounded-full blur-[100px]" />
            </div>

            <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="w-full max-w-md card p-8 relative z-10 border border-white/10 shadow-[0_0_50px_rgba(0,0,0,0.5)] backdrop-blur-xl bg-[#0a0a0a]/80"
            >
                <div className="text-center mb-8">
                    <Link href={`/${slug}`} className="inline-block text-zinc-500 hover:text-white mb-6 text-sm transition-colors">← Back to {restaurantName}</Link>
                    <h1 className="font-display text-4xl font-bold mb-2">Quick Access</h1>
                    <p className="text-zinc-400">Enter your details to track orders & earn loyalty points instantly. No password required.</p>
                </div>

                <form onSubmit={handleLogin} className="space-y-6">
                    <div className="space-y-2">
                        <label className="text-xs font-bold text-zinc-500 uppercase tracking-wider pl-1">Name</label>
                        <input
                            className="input bg-[#111] border-zinc-800 text-lg py-3 focus:border-orange-500/50"
                            placeholder="e.g. James Bond"
                            required
                            value={form.name}
                            onChange={e => setForm({ ...form, name: e.target.value })}
                        />
                    </div>

                    <div className="space-y-2">
                        <label className="text-xs font-bold text-zinc-500 uppercase tracking-wider pl-1">Phone Number</label>
                        <input
                            className="input bg-[#111] border-zinc-800 text-lg py-3 focus:border-orange-500/50 outline-none"
                            placeholder="Mobile number"
                            type="tel"
                            required
                            value={form.phone}
                            onChange={e => setForm({ ...form, phone: e.target.value })}
                        />
                    </div>

                    <button
                        type="submit"
                        disabled={loading}
                        className="w-full btn-primary text-lg py-4 mt-4 shadow-[0_0_20px_rgba(249,115,22,0.2)]"
                    >
                        {loading ? 'Authenticating...' : 'Enter Doorway →'}
                    </button>
                </form>

                <div className="mt-8 text-center text-xs text-zinc-600">
                    By entering, you agree to the restaurant's policies.
                </div>
            </motion.div>
        </div>
    );
}
