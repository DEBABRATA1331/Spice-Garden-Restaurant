'use client';
import { useState, Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { authApi } from '@/lib/api';
import toast from 'react-hot-toast';
import Link from 'next/link';

function AdminLoginContent() {
    const router = useRouter();
    const searchParams = useSearchParams();
    const role = searchParams.get('role');
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [loading, setLoading] = useState(false);

    const handleLogin = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        try {
            const { data } = await authApi.adminLogin({ email, password });
            localStorage.setItem('adminToken', data.token);
            localStorage.setItem('adminRestaurant', JSON.stringify(data.restaurant));
            toast.success(`Welcome back, ${data.admin.name}!`);

            if (role === 'waiter') {
                router.push(`/admin/${data.restaurant.slug}/waiter`);
            } else {
                router.push(`/admin/${data.restaurant.slug}`);
            }
        } catch (e: any) {
            toast.error(e.response?.data?.error || 'Invalid credentials');
        } finally { setLoading(false); }
    };

    return (
        <div className="min-h-screen bg-[#0a0a0a] flex items-center justify-center px-4">
            <div className="w-full max-w-md">
                <div className="text-center mb-8">
                    <div className="w-16 h-16 bg-orange-500 rounded-2xl flex items-center justify-center text-3xl mx-auto mb-4">🍽️</div>
                    <h1 className="font-display text-3xl font-bold text-white">Admin Login</h1>
                    <p className="text-zinc-400 mt-2">Restaurant Management Dashboard</p>
                </div>
                <div className="card p-8">
                    <form onSubmit={handleLogin} className="space-y-4">
                        <div>
                            <label className="text-zinc-400 text-sm mb-2 block">Email</label>
                            <input className="input" type="email" placeholder="admin@restaurant.com" value={email} onChange={e => setEmail(e.target.value)} required />
                        </div>
                        <div>
                            <label className="text-zinc-400 text-sm mb-2 block">Password</label>
                            <input className="input" type="password" placeholder="••••••••" value={password} onChange={e => setPassword(e.target.value)} required />
                        </div>
                        <button type="submit" disabled={loading} className="btn-primary w-full py-4 text-base mt-2">
                            {loading ? '⏳ Logging in...' : 'Login to Dashboard'}
                        </button>
                    </form>
                    <div className="mt-6 p-4 bg-zinc-800/50 rounded-xl text-sm text-zinc-500">
                        <p className="font-medium text-zinc-400 mb-1">Demo Credentials:</p>
                        <p>Email: <span className="text-zinc-300">admin@spicegarden.com</span></p>
                        <p>Password: <span className="text-zinc-300">admin123</span></p>
                    </div>
                </div>
                <p className="text-center text-zinc-500 text-sm mt-6">
                    <Link href="/" className="text-orange-400 hover:text-orange-300">← Back to Home</Link>
                </p>
            </div>
        </div>
    );
}

export default function AdminLoginPage() {
    return (
        <Suspense fallback={
            <div className="min-h-screen bg-[#0a0a0a] flex items-center justify-center">
                <div className="text-orange-500 animate-pulse text-xl font-bold tracking-widest">LOADING Dashboard...</div>
            </div>
        }>
            <AdminLoginContent />
        </Suspense>
    );
}
