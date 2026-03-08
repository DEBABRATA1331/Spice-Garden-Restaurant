'use client';
import { useEffect, useState } from 'react';
import { useParams, useRouter, usePathname } from 'next/navigation';
import Link from 'next/link';

const NAV = [
    { icon: '📊', label: 'Dashboard', path: '' },
    { icon: '📦', label: 'Orders', path: '/orders' },
    { icon: '🍽️', label: 'Menu', path: '/menu' },
    { icon: '📅', label: 'Reservations', path: '/reservations' },
    { icon: '💳', label: 'Billing', path: '/billing' },
    { icon: '📈', label: 'Analytics', path: '/analytics' },
    { icon: '🎁', label: 'Coupons', path: '/coupons' },
    { icon: '⭐', label: 'Reviews', path: '/reviews' },
    { icon: '⚙️', label: 'Settings', path: '/settings' },
];

export default function AdminLayout({ children }: { children: React.ReactNode }) {
    const { slug } = useParams<{ slug: string }>();
    const router = useRouter();
    const pathname = usePathname();
    const [restaurant, setRestaurant] = useState<any>(null);
    const [sidebarOpen, setSidebarOpen] = useState(false);

    useEffect(() => {
        const data = localStorage.getItem('adminRestaurant');
        if (!data) { router.push('/admin/login'); return; }
        setRestaurant(JSON.parse(data));
    }, []);

    const logout = () => {
        localStorage.removeItem('adminToken');
        localStorage.removeItem('adminRestaurant');
        router.push('/admin/login');
    };

    return (
        <div className="min-h-screen bg-[#0a0a0a] text-white flex">
            {/* Sidebar overlay (mobile) */}
            {sidebarOpen && <div className="fixed inset-0 bg-black/60 z-30 lg:hidden" onClick={() => setSidebarOpen(false)} />}

            {/* Sidebar */}
            <aside className={`fixed top-0 left-0 bottom-0 z-40 w-64 bg-zinc-900 border-r border-zinc-800 flex flex-col transition-transform duration-300 ${sidebarOpen ? 'translate-x-0' : '-translate-x-full'} lg:translate-x-0 lg:static lg:block`}>
                <div className="p-4 border-b border-zinc-800">
                    <div className="flex items-center gap-3">
                        <div className="w-10 h-10 bg-orange-500 rounded-xl flex items-center justify-center font-bold text-lg">
                            {restaurant?.name?.[0] || 'R'}
                        </div>
                        <div className="min-w-0">
                            <p className="font-bold text-sm truncate">{restaurant?.name || 'Restaurant'}</p>
                            <p className="text-zinc-500 text-xs">Admin Panel</p>
                        </div>
                    </div>
                </div>
                <nav className="flex-1 p-3 space-y-1 overflow-y-auto">
                    {NAV.map(item => {
                        const href = `/admin/${slug}${item.path}`;
                        const active = pathname === href || (item.path !== '' && pathname.startsWith(href));
                        return (
                            <Link key={item.path} href={href} onClick={() => setSidebarOpen(false)} className={`flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm transition-colors ${active ? 'bg-orange-500 text-white font-medium' : 'text-zinc-400 hover:text-white hover:bg-zinc-800'}`}>
                                <span>{item.icon}</span>
                                {item.label}
                            </Link>
                        );
                    })}
                </nav>
                <div className="p-3 border-t border-zinc-800 space-y-2">
                    <Link href={`/${slug}`} target="_blank" className="flex items-center gap-3 px-3 py-2 rounded-xl text-sm text-zinc-400 hover:text-white hover:bg-zinc-800 transition-colors">
                        🌐 View Restaurant Site
                    </Link>
                    <button onClick={logout} className="w-full flex items-center gap-3 px-3 py-2 rounded-xl text-sm text-zinc-400 hover:text-red-400 hover:bg-red-500/10 transition-colors">
                        🚪 Logout
                    </button>
                </div>
            </aside>

            {/* Main content */}
            <div className="flex-1 flex flex-col min-w-0">
                {/* Top bar */}
                <header className="sticky top-0 z-20 glass border-b border-zinc-800/50 px-4 py-3 flex items-center gap-4">
                    <button className="lg:hidden text-zinc-400 hover:text-white" onClick={() => setSidebarOpen(true)}>
                        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" /></svg>
                    </button>
                    <h2 className="font-semibold capitalize">{pathname.split('/').pop() || 'Dashboard'}</h2>
                    <div className="ml-auto flex items-center gap-2 text-sm text-zinc-500">
                        <span className="w-2 h-2 bg-green-500 rounded-full animate-pulse" />
                        Live
                    </div>
                </header>
                <main className="flex-1 p-6 overflow-auto">
                    {children}
                </main>
            </div>
        </div>
    );
}
