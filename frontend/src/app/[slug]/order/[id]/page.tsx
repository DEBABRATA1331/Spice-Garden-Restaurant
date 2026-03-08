'use client';
import { useEffect, useState } from 'react';
import { useParams } from 'next/navigation';
import { orderApi } from '@/lib/api';
import Link from 'next/link';

const STATUS_STEPS = ['pending', 'confirmed', 'preparing', 'ready', 'delivered'];
const STATUS_LABELS: Record<string, string> = {
    pending: '⏳ Order Received', confirmed: '✅ Confirmed', preparing: '👨‍🍳 Being Prepared',
    ready: '📦 Ready for Pickup', delivered: '🎉 Delivered', cancelled: '❌ Cancelled'
};

export default function OrderTrackingPage() {
    const { slug, id } = useParams<{ slug: string; id: string }>();
    const [order, setOrder] = useState<any>(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const load = () => orderApi.getById(id).then(r => setOrder(r.data)).catch(() => { }).finally(() => setLoading(false));
        load();
        const interval = setInterval(load, 5000); // Live sync polling every 5s
        return () => clearInterval(interval);
    }, [id]);

    if (loading) return <div className="min-h-screen flex items-center justify-center"><div className="w-12 h-12 rounded-full border-4 border-orange-500 border-t-transparent animate-spin" /></div>;
    if (!order) return <div className="min-h-screen flex items-center justify-center text-zinc-400">Order not found</div>;

    const currentStep = STATUS_STEPS.indexOf(order.status);
    const isCancelled = order.status === 'cancelled';

    return (
        <div className="min-h-screen bg-[#0a0a0a] text-white py-8 px-4">
            <div className="max-w-2xl mx-auto">
                <Link href={`/${slug}/menu`} className="text-zinc-400 hover:text-white text-sm mb-6 inline-block">← Back to Menu</Link>
                <div className="card p-6 mb-6">
                    <div className="flex items-center justify-between mb-2">
                        <h1 className="font-display text-2xl font-bold">Order Tracking</h1>
                        <span className="text-xs text-zinc-500">#{order.id.slice(-8).toUpperCase()}</span>
                    </div>
                    <p className="text-zinc-400 text-sm">Ordered from {order.restaurant?.name}</p>
                    <div className="mt-4 inline-flex items-center gap-2 text-sm font-medium">
                        <span className={`w-2 h-2 rounded-full ${isCancelled ? 'bg-red-500' : 'bg-green-500 animate-pulse'}`} />
                        <span className={isCancelled ? 'text-red-400' : 'text-green-400'}>{STATUS_LABELS[order.status]}</span>
                    </div>
                </div>

                {!isCancelled && (
                    <div className="card p-6 mb-6">
                        <h2 className="font-semibold mb-6">Order Progress</h2>
                        <div className="relative">
                            <div className="absolute top-4 left-4 right-4 h-0.5 bg-zinc-700">
                                <div className="h-full bg-orange-500 transition-all duration-700" style={{ width: `${currentStep / (STATUS_STEPS.length - 1) * 100}%` }} />
                            </div>
                            <div className="flex justify-between relative z-10">
                                {STATUS_STEPS.map((step, idx) => (
                                    <div key={step} className="flex flex-col items-center gap-2">
                                        <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm transition-all ${idx <= currentStep ? 'bg-orange-500' : 'bg-zinc-700'}`}>
                                            {idx < currentStep ? '✓' : idx + 1}
                                        </div>
                                        <span className="text-xs text-zinc-500 text-center w-16 leading-tight capitalize">{step}</span>
                                    </div>
                                ))}
                            </div>
                        </div>
                    </div>
                )}

                <div className="card p-6 mb-6">
                    <h2 className="font-semibold mb-4">Order Items</h2>
                    <div className="space-y-3">
                        {order.orderItems?.map((item: any) => (
                            <div key={item.id} className="flex justify-between text-sm">
                                <span className="text-zinc-300">{item.name} × {item.quantity}</span>
                                <span className="font-medium">₹{item.subtotal}</span>
                            </div>
                        ))}
                    </div>
                    <div className="border-t border-zinc-800 mt-4 pt-4 space-y-1 text-sm">
                        <div className="flex justify-between text-zinc-400"><span>Subtotal</span><span>₹{order.subtotal}</span></div>
                        <div className="flex justify-between text-zinc-400"><span>Tax</span><span>₹{order.taxAmount?.toFixed(2)}</span></div>
                        {order.discountAmount > 0 && <div className="flex justify-between text-green-400"><span>Discount</span><span>-₹{order.discountAmount?.toFixed(2)}</span></div>}
                        <div className="flex justify-between font-bold text-base pt-2 border-t border-zinc-800">
                            <span>Total</span><span className="text-orange-400">₹{order.totalAmount}</span>
                        </div>
                    </div>
                </div>

                <div className="grid grid-cols-2 gap-4 text-sm">
                    <div className="card p-4">
                        <p className="text-zinc-500 mb-1">Payment</p>
                        <p className={`font-medium ${order.paymentStatus === 'paid' ? 'text-green-400' : 'text-yellow-400'}`}>{order.paymentStatus === 'paid' ? '✅ Paid' : '⏳ Pending'}</p>
                    </div>
                    <div className="card p-4">
                        <p className="text-zinc-500 mb-1">Order Type</p>
                        <p className="font-medium capitalize">{order.orderType}</p>
                    </div>
                    {order.loyaltyPointsEarned > 0 && (
                        <div className="card p-4 col-span-2">
                            <p className="text-zinc-500 mb-1">Loyalty Points</p>
                            <p className="font-medium text-orange-400">+{order.loyaltyPointsEarned} points earned</p>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}
