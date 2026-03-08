'use client';
import { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { analyticsApi } from '@/lib/api';
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, PieChart, Pie, Cell } from 'recharts';

const COLORS = ['#e85d26', '#f5a623', '#22c55e', '#3b82f6', '#a855f7'];

export default function AdminDashboard() {
    const { slug } = useParams<{ slug: string }>();
    const router = useRouter();
    const [data, setData] = useState<any>(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const token = localStorage.getItem('adminToken');
        if (!token) { router.push('/admin/login'); return; }
        analyticsApi.getDashboard().then(r => setData(r.data)).catch(() => { }).finally(() => setLoading(false));
    }, []);

    if (loading) return <div className="flex items-center justify-center h-64"><div className="w-10 h-10 rounded-full border-4 border-orange-500 border-t-transparent animate-spin" /></div>;

    const kpis = [
        { label: "Today's Orders", value: data?.todayOrders || 0, icon: '📦', color: 'text-orange-400' },
        { label: "Today's Revenue", value: `₹${(data?.todayRevenue || 0).toFixed(0)}`, icon: '💰', color: 'text-green-400' },
        { label: 'Pending Orders', value: data?.pendingOrders || 0, icon: '⏳', color: 'text-yellow-400' },
        { label: 'Total Customers', value: data?.totalCustomers || 0, icon: '👥', color: 'text-blue-400' },
        { label: 'Total Orders', value: data?.totalOrders || 0, icon: '📊', color: 'text-purple-400' },
        { label: 'Total Revenue', value: `₹${(data?.totalRevenue || 0).toFixed(0)}`, icon: '🏦', color: 'text-pink-400' },
    ];

    const statusData = data?.orderStatusBreakdown?.map((s: any) => ({ name: s.status, value: s._count.status })) || [];

    return (
        <div>
            <h1 className="font-display text-3xl font-bold mb-8">Dashboard Overview</h1>
            {/* KPI Cards */}
            <div className="grid grid-cols-2 lg:grid-cols-3 gap-4 mb-8">
                {kpis.map(k => (
                    <div key={k.label} className="card p-5">
                        <div className="flex items-center justify-between mb-2">
                            <span className="text-2xl">{k.icon}</span>
                            <span className={`text-2xl font-bold ${k.color}`}>{k.value}</span>
                        </div>
                        <p className="text-zinc-500 text-sm">{k.label}</p>
                    </div>
                ))}
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
                {/* Popular Dishes */}
                <div className="card p-6">
                    <h2 className="font-bold mb-4">🔥 Popular Dishes (30 days)</h2>
                    {data?.popularDishes?.length > 0 ? (
                        <ResponsiveContainer width="100%" height={200}>
                            <BarChart data={data.popularDishes.map((d: any) => ({ name: d.name.slice(0, 15), qty: d._sum.quantity }))}>
                                <XAxis dataKey="name" tick={{ fill: '#71717a', fontSize: 11 }} />
                                <YAxis tick={{ fill: '#71717a', fontSize: 11 }} />
                                <Tooltip contentStyle={{ background: '#18181b', border: '1px solid #3f3f46', borderRadius: 8 }} />
                                <Bar dataKey="qty" fill="#e85d26" radius={[4, 4, 0, 0]} />
                            </BarChart>
                        </ResponsiveContainer>
                    ) : <p className="text-zinc-600 text-sm py-8 text-center">No order data yet</p>}
                </div>

                {/* Order Status Breakdown */}
                <div className="card p-6">
                    <h2 className="font-bold mb-4">📊 Order Status (30 days)</h2>
                    {statusData.length > 0 ? (
                        <div className="flex items-center gap-6">
                            <ResponsiveContainer width="50%" height={180}>
                                <PieChart>
                                    <Pie data={statusData} dataKey="value" nameKey="name" cx="50%" cy="50%" outerRadius={70}>
                                        {statusData.map((_: any, i: number) => <Cell key={i} fill={COLORS[i % COLORS.length]} />)}
                                    </Pie>
                                    <Tooltip contentStyle={{ background: '#18181b', border: '1px solid #3f3f46', borderRadius: 8 }} />
                                </PieChart>
                            </ResponsiveContainer>
                            <div className="space-y-2">
                                {statusData.map((s: any, i: number) => (
                                    <div key={s.name} className="flex items-center gap-2 text-sm">
                                        <div className="w-3 h-3 rounded-full" style={{ background: COLORS[i % COLORS.length] }} />
                                        <span className="text-zinc-400 capitalize">{s.name}</span>
                                        <span className="font-bold ml-auto">{s.value}</span>
                                    </div>
                                ))}
                            </div>
                        </div>
                    ) : <p className="text-zinc-600 text-sm py-8 text-center">No data yet</p>}
                </div>
            </div>

            {/* Recent Orders */}
            <div className="card p-6">
                <div className="flex items-center justify-between mb-4">
                    <h2 className="font-bold">Recent Orders</h2>
                    <button onClick={() => router.push(`/admin/${slug}/orders`)} className="text-orange-400 text-sm hover:text-orange-300">View all →</button>
                </div>
                {data?.recentOrders?.length > 0 ? (
                    <div className="overflow-x-auto">
                        <table className="w-full text-sm">
                            <thead>
                                <tr className="text-zinc-500 border-b border-zinc-800">
                                    <th className="text-left py-2 pr-4">Order ID</th>
                                    <th className="text-left py-2 pr-4">Customer</th>
                                    <th className="text-left py-2 pr-4">Amount</th>
                                    <th className="text-left py-2 pr-4">Status</th>
                                    <th className="text-left py-2">Date</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-zinc-800/50">
                                {data.recentOrders.slice(0, 5).map((order: any) => (
                                    <tr key={order.id} className="hover:bg-zinc-800/30">
                                        <td className="py-3 pr-4 font-mono text-xs text-zinc-400">#{order.id.slice(-8).toUpperCase()}</td>
                                        <td className="py-3 pr-4">{order.customerName}</td>
                                        <td className="py-3 pr-4 text-orange-400">₹{order.totalAmount}</td>
                                        <td className="py-3 pr-4"><span className={`px-2 py-1 rounded-full text-xs font-medium ${order.status === 'delivered' ? 'bg-green-500/10 text-green-400' : order.status === 'cancelled' ? 'bg-red-500/10 text-red-400' : 'bg-yellow-500/10 text-yellow-400'}`}>{order.status}</span></td>
                                        <td className="py-3 text-zinc-500">{new Date(order.createdAt).toLocaleDateString('en-IN')}</td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                ) : <p className="text-zinc-600 text-sm py-4 text-center">No orders yet</p>}
            </div>
        </div>
    );
}
