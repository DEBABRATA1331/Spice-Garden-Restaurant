'use client';
import { useState, Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { authApi } from '@/lib/api';
import toast from 'react-hot-toast';
import Link from 'next/link';

function AdminLoginContent() {
    const router = useRouter();
    const searchParams = useSearchParams();
    const role = searchParams.get('role'); // 'waiter' or null (admin)
    const isWaiter = role === 'waiter';

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

            // If the logged-in user is a waiter (by role from DB), redirect to waiter page
            const userRole = data.admin?.role;
            toast.success(`Welcome, ${data.admin.name}!`);

            if (userRole === 'waiter' || isWaiter) {
                router.push(`/admin/${data.restaurant.slug}/waiter`);
            } else {
                router.push(`/admin/${data.restaurant.slug}`);
            }
        } catch (e: any) {
            toast.error(e.response?.data?.error || 'Invalid credentials');
        } finally { setLoading(false); }
    };

    const accentColor = isWaiter ? 'sky' : 'orange';
    const iconEmoji = isWaiter ? '🧑‍🍳' : '🍽️';
    const title = isWaiter ? 'Waiter Login' : 'Admin Login';
    const subtitle = isWaiter ? 'Access your order-taking interface' : 'Restaurant Management Dashboard';
    const demoEmail = isWaiter ? 'waiter@spicegarden.com' : 'admin@spicegarden.com';
    const demoPassword = isWaiter ? 'waiter123' : 'admin123';
    const bgAccent = isWaiter ? 'bg-sky-500' : 'bg-orange-500';
    const btnClass = isWaiter
        ? 'w-full py-4 text-base mt-2 bg-sky-500 hover:bg-sky-400 text-white font-bold rounded-xl transition-all'
        : 'btn-primary w-full py-4 text-base mt-2';

    return (
        <div className="min-h-screen bg-[#0a0a0a] flex items-center justify-center px-4">
            <div className="w-full max-w-md">
                <div className="text-center mb-8">
                    <div className={`w-16 h-16 ${bgAccent} rounded-2xl flex items-center justify-center text-3xl mx-auto mb-4`}>
                        {iconEmoji}
                    </div>
                    <h1 className="font-display text-3xl font-bold text-white">{title}</h1>
                    <p className="text-zinc-400 mt-2">{subtitle}</p>
                </div>
                <div className="card p-8">
                    <form onSubmit={handleLogin} className="space-y-4">
                        <div>
                            <label className="text-zinc-400 text-sm mb-2 block">Email</label>
                            <input
                                className="input"
                                type="email"
                                placeholder={demoEmail}
                                value={email}
                                onChange={e => setEmail(e.target.value)}
                                required
                            />
                        </div>
                        <div>
                            <label className="text-zinc-400 text-sm mb-2 block">Password</label>
                            <input
                                className="input"
                                type="password"
                                placeholder="••••••••"
                                value={password}
                                onChange={e => setPassword(e.target.value)}
                                required
                            />
                        </div>
                        <button type="submit" disabled={loading} className={btnClass}>
                            {loading ? '⏳ Logging in...' : isWaiter ? 'Login as Waiter' : 'Login to Dashboard'}
                        </button>
                    </form>
                    <div className="mt-6 p-4 bg-zinc-800/50 rounded-xl text-sm text-zinc-500">
                        <p className="font-medium text-zinc-400 mb-1">Demo Credentials:</p>
                        <p>Email: <span className="text-zinc-300">{demoEmail}</span></p>
                        <p>Password: <span className="text-zinc-300">{demoPassword}</span></p>
                    </div>
                </div>
                <div className="mt-4 flex items-center justify-between px-1">
                    <Link href="/" className="text-zinc-500 hover:text-zinc-300 text-sm transition-colors">← Back to Home</Link>
                    {isWaiter ? (
                        <Link href="/admin/login" className="text-orange-400 hover:text-orange-300 text-sm transition-colors">Admin Login →</Link>
                    ) : (
                        <Link href="/admin/login?role=waiter" className="text-sky-400 hover:text-sky-300 text-sm transition-colors">Waiter Login →</Link>
                    )}
                </div>
            </div>
        </div>
    );
}

export default function AdminLoginPage() {
    return (
        <Suspense fallback={
            <div className="min-h-screen bg-[#0a0a0a] flex items-center justify-center">
                <div className="text-orange-500 animate-pulse text-xl font-bold tracking-widest">LOADING...</div>
            </div>
        }>
            <AdminLoginContent />
        </Suspense>
    );
}
