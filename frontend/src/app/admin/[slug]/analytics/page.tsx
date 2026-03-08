'use client';
import { useEffect, useState } from 'react';
import { analyticsApi } from '@/lib/api';
import { AreaChart, Area, XAxis, YAxis, Tooltip, ResponsiveContainer, BarChart, Bar } from 'recharts';

export default function AdminAnalyticsPage() {
    const [data, setData] = useState<any>(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        analyticsApi.getDashboard().then(r => setData(r.data)).catch(() => { }).finally(() => setLoading(false));
    }, []);

    if (loading) return <div className="flex justify-center py-24"><div className="w-10 h-10 rounded-full border-4 border-orange-500 border-t-transparent animate-spin" /></div>;

    const kpis = [
        { label: 'Total Revenue', value: `₹${(data?.totalRevenue || 0).toFixed(0)}`, color: 'text-green-400', icon: '💰' },
        { label: "Today's Revenue", value: `₹${(data?.todayRevenue || 0).toFixed(0)}`, color: 'text-orange-400', icon: '📅' },
        { label: 'Total Orders', value: data?.totalOrders || 0, color: 'text-blue-400', icon: '📦' },
        { label: 'Total Customers', value: data?.totalCustomers || 0, color: 'text-purple-400', icon: '👥' },
    ];

    const popularDishesData = data?.popularDishes?.map((d: any) => ({ name: d.name.length > 12 ? d.name.slice(0, 12) + '…' : d.name, orders: d._sum.quantity })) || [];

    return (
        <div>
            <h1 className="font-display text-3xl font-bold mb-8">Analytics</h1>
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
                {kpis.map(k => (
                    <div key={k.label} className="card p-5 text-center">
                        <p className="text-2xl mb-2">{k.icon}</p>
                        <p className={`text-2xl font-bold ${k.color}`}>{k.value}</p>
                        <p className="text-zinc-500 text-sm mt-1">{k.label}</p>
                    </div>
                ))}
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {/* Popular Dishes */}
                <div className="card p-6">
                    <h2 className="font-bold mb-4">🔥 Popular Dishes (Last 30 days)</h2>
                    {popularDishesData.length ? (
                        <ResponsiveContainer width="100%" height={240}>
                            <BarChart data={popularDishesData} layout="vertical">
                                <XAxis type="number" tick={{ fill: '#71717a', fontSize: 11 }} />
                                <YAxis type="category" dataKey="name" tick={{ fill: '#a1a1aa', fontSize: 11 }} width={100} />
                                <Tooltip contentStyle={{ background: '#18181b', border: '1px solid #3f3f46', borderRadius: 8 }} formatter={(v) => [`${v} orders`]} />
                                <Bar dataKey="orders" fill="#e85d26" radius={[0, 4, 4, 0]} />
                            </BarChart>
                        </ResponsiveContainer>
                    ) : <p className="text-zinc-500 text-center py-8">No order data yet</p>}
                </div>

                {/* Order Status */}
                <div className="card p-6">
                    <h2 className="font-bold mb-4">📊 Order Status Breakdown</h2>
                    {data?.orderStatusBreakdown?.length ? (
                        <div className="space-y-3 mt-4">
                            {data.orderStatusBreakdown.map((s: any) => {
                                const colors: Record<string, string> = { delivered: 'bg-green-500', pending: 'bg-yellow-500', cancelled: 'bg-red-500', confirmed: 'bg-blue-500', preparing: 'bg-orange-500', ready: 'bg-purple-500' };
                                const max = Math.max(...data.orderStatusBreakdown.map((x: any) => x._count.status));
                                return (
                                    <div key={s.status}>
                                        <div className="flex justify-between text-sm mb-1">
                                            <span className="text-zinc-400 capitalize">{s.status}</span>
                                            <span className="font-bold">{s._count.status}</span>
                                        </div>
                                        <div className="h-2 bg-zinc-800 rounded-full overflow-hidden">
                                            <div className={`h-full rounded-full transition-all ${colors[s.status] || 'bg-zinc-600'}`} style={{ width: `${(s._count.status / max) * 100}%` }} />
                                        </div>
                                    </div>
                                );
                            })}
                        </div>
                    ) : <p className="text-zinc-500 text-center py-8">No data yet</p>}
                </div>
            </div>
        </div>
    );
}
