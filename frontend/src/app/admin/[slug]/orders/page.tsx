'use client';
import { useEffect, useState } from 'react';
import { useParams } from 'next/navigation';
import { orderApi } from '@/lib/api';
import toast from 'react-hot-toast';

const STATUS_OPTIONS = ['pending', 'confirmed', 'preparing', 'ready', 'delivered', 'cancelled'];
const STATUS_COLORS: Record<string, string> = {
    pending: 'bg-yellow-500/10 text-yellow-400',
    confirmed: 'bg-blue-500/10 text-blue-400',
    preparing: 'bg-orange-500/10 text-orange-400',
    ready: 'bg-purple-500/10 text-purple-400',
    delivered: 'bg-green-500/10 text-green-400',
    cancelled: 'bg-red-500/10 text-red-400',
};

export default function AdminOrdersPage() {
    const { slug } = useParams<{ slug: string }>();
    const [orders, setOrders] = useState<any[]>([]);
    const [total, setTotal] = useState(0);
    const [filter, setFilter] = useState({ status: '', date: '' });
    const [loading, setLoading] = useState(true);

    const load = async (silent = false) => {
        if (!silent) setLoading(true);
        try {
            const params: any = {};
            if (filter.status) params.status = filter.status;
            if (filter.date) params.date = filter.date;
            const { data } = await orderApi.adminGetAll(params);
            setOrders(data.orders);
            setTotal(data.total);
        } finally {
            if (!silent) setLoading(false);
        }
    };

    useEffect(() => {
        load();
        const interval = setInterval(() => load(true), 5000); // 5 second polling sync
        return () => clearInterval(interval);
    }, [filter]);

    const updateStatus = async (orderId: string, status: string) => {
        try {
            await orderApi.updateStatus(orderId, status);
            toast.success('Status updated');
            setOrders(prev => prev.map(o => o.id === orderId ? { ...o, status } : o));
        } catch { toast.error('Failed to update'); }
    };

    const markPaid = async (orderId: string) => {
        try {
            await orderApi.updatePayment(orderId, { paymentStatus: 'paid' });
            toast.success('Marked as paid ✅');
            setOrders(prev => prev.map(o => o.id === orderId ? { ...o, paymentStatus: 'paid' } : o));
        } catch { toast.error('Failed'); }
    };

    const handleGenerateBill = async (orderId: string) => {
        try {
            const { data } = await orderApi.generateInvoice(orderId);
            toast.success('Bill generated 📄');
            load(true);
            return data;
        } catch { toast.error('Failed to generate bill'); }
    };

    const handleWhatsAppShare = async (order: any) => {
        let invId = order.invoice?.id;
        if (!invId) {
            const inv = await handleGenerateBill(order.id);
            if (!inv) return;
            invId = inv.id;
        }

        const invoiceUrl = `${window.location.origin}/${slug}/invoice/${invId}`;
        const message = `*Digital Bill Generated*%0A%0AHello ${order.customerName}, your bill is ready.%0A%0AView Invoice: ${invoiceUrl}%0A%0AThank you!`;
        const phone = order.customerPhone.startsWith('+') ? order.customerPhone : `+91${order.customerPhone}`;
        window.open(`https://wa.me/${phone.replace(/\D/g, '')}?text=${message}`, '_blank');
    };

    return (
        <div>
            <div className="flex items-center justify-between mb-6">
                <h1 className="font-display text-3xl font-bold">
                    Orders <span className="text-zinc-500 text-xl font-normal">({total})</span>
                </h1>
                {/* Live indicator */}
                <div className="flex items-center gap-2 text-xs text-zinc-500">
                    <span className="w-2 h-2 bg-green-500 rounded-full animate-pulse" />
                    Live
                </div>
            </div>

            {/* Filters */}
            <div className="flex flex-wrap gap-3 mb-6">
                <select className="input w-auto" value={filter.status} onChange={e => setFilter({ ...filter, status: e.target.value })}>
                    <option value="">All Statuses</option>
                    {STATUS_OPTIONS.map(s => <option key={s} value={s}>{s}</option>)}
                </select>
                <input type="date" className="input w-auto" value={filter.date} onChange={e => setFilter({ ...filter, date: e.target.value })} />
                <button onClick={() => setFilter({ status: '', date: '' })} className="px-4 py-3 rounded-xl bg-zinc-800 text-zinc-400 hover:text-white text-sm">Clear</button>
                <button onClick={() => load(false)} className="px-4 py-3 rounded-xl bg-zinc-800 text-zinc-400 hover:text-white text-sm">🔄 Refresh</button>
            </div>

            {loading ? (
                <div className="flex justify-center py-16">
                    <div className="w-10 h-10 rounded-full border-4 border-orange-500 border-t-transparent animate-spin" />
                </div>
            ) : (
                <div className="space-y-4">
                    {orders.length === 0 && (
                        <div className="card p-8 text-center text-zinc-500">No orders found</div>
                    )}
                    {orders.map(order => (
                        <div key={order.id} className="card p-5">
                            {/* Header Row */}
                            <div className="flex flex-wrap items-start justify-between gap-4 mb-4">
                                <div>
                                    <div className="flex items-center gap-2 flex-wrap mb-1">
                                        <span className="font-mono text-xs text-zinc-500">#{order.id.slice(-8).toUpperCase()}</span>
                                        {/* Order Status */}
                                        <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${STATUS_COLORS[order.status]}`}>
                                            {order.status}
                                        </span>
                                        {/* Invoiced Status */}
                                        {order.invoice && (
                                            <span className="px-2 py-0.5 rounded-full text-xs font-bold bg-orange-500/20 text-orange-400 border border-orange-500/30 animate-pulse">
                                                📜 Invoiced
                                            </span>
                                        )}
                                        {/* Order Type Badge */}
                                        <span className={`px-2 py-0.5 rounded-full text-xs font-medium border ${order.orderType === 'dine-in' ? 'bg-purple-500/10 text-purple-400 border-purple-500/20' : 'bg-sky-500/10 text-sky-400 border-sky-500/20'}`}>
                                            {order.orderType === 'dine-in' ? '🪑 Dine In' : '🥡 Takeaway'}
                                        </span>
                                        {/* Payment method badge */}
                                        <span className={`px-2 py-0.5 rounded-full text-xs font-medium border ${order.paymentMethod === 'cash' ? 'bg-green-500/10 text-green-400 border-green-500/20' : 'bg-blue-500/10 text-blue-400 border-blue-500/20'}`}>
                                            {order.paymentMethod === 'cash' ? '💵 Cash' : '💳 Online'}
                                        </span>
                                        {/* Payment Status */}
                                        <span className={`px-2 py-0.5 rounded-full text-xs ${order.paymentStatus === 'paid' ? 'bg-green-500/10 text-green-400' : 'bg-yellow-500/10 text-yellow-400'}`}>
                                            {order.paymentStatus === 'paid' ? '✅ Paid' : '⏳ Payment Pending'}
                                        </span>
                                    </div>
                                    <p className="font-bold text-lg">{order.customerName}</p>
                                    <p className="text-zinc-500 text-sm">{order.customerPhone}</p>
                                    {order.tableNumber && <p className="text-zinc-500 text-sm">🪑 Table {order.tableNumber}</p>}
                                </div>
                                <div className="text-right shrink-0">
                                    <p className="font-bold text-2xl text-orange-400">₹{order.totalAmount}</p>
                                    <p className="text-zinc-500 text-xs mt-1">{new Date(order.createdAt).toLocaleString('en-IN')}</p>
                                </div>
                            </div>

                            {/* Items */}
                            <div className="bg-zinc-800/50 rounded-xl p-3 mb-4 space-y-1">
                                {order.orderItems?.map((item: any) => (
                                    <div key={item.id} className="flex justify-between text-sm">
                                        <span className="text-zinc-300">{item.name} × {item.quantity}</span>
                                        <span className="text-zinc-400">₹{item.subtotal}</span>
                                    </div>
                                ))}
                            </div>

                            {order.notes && <p className="text-zinc-500 text-sm mb-3">📝 {order.notes}</p>}

                            {/* Action Buttons Row */}
                            <div className="flex flex-wrap gap-2 items-center">
                                {/* Status buttons */}
                                {STATUS_OPTIONS.filter(s => s !== order.status).map(s => (
                                    <button
                                        key={s}
                                        onClick={() => updateStatus(order.id, s)}
                                        className={`text-xs px-3 py-1.5 rounded-lg font-medium transition-all capitalize border
                      ${s === 'delivered' ? 'border-green-500/30 text-green-400 hover:bg-green-500 hover:text-white hover:border-green-500'
                                                : s === 'cancelled' ? 'border-red-500/30 text-red-400 hover:bg-red-500 hover:text-white hover:border-red-500'
                                                    : s === 'preparing' ? 'border-orange-500/30 text-orange-400 hover:bg-orange-500 hover:text-white hover:border-orange-500'
                                                        : 'border-zinc-700 text-zinc-400 hover:bg-zinc-700 hover:text-white'}`}
                                    >
                                        → {s}
                                    </button>
                                ))}

                                {order.paymentMethod === 'cash' && order.paymentStatus !== 'paid' && (
                                    <div className="flex gap-2 ml-auto">
                                        <button
                                            onClick={() => handleGenerateBill(order.id)}
                                            className="text-xs px-3 py-2 rounded-lg font-bold bg-zinc-800 hover:bg-zinc-700 text-white transition-colors border border-zinc-700"
                                        >
                                            📄 Bill
                                        </button>
                                        <button
                                            onClick={() => handleWhatsAppShare(order)}
                                            className="text-xs px-3 py-2 rounded-lg font-bold bg-green-600/10 hover:bg-green-600/20 text-green-500 transition-colors border border-green-600/30"
                                        >
                                            💬 WhatsApp
                                        </button>
                                        <button
                                            onClick={() => markPaid(order.id)}
                                            className="text-xs px-4 py-2 rounded-lg font-bold bg-green-500 hover:bg-green-600 text-white transition-colors shadow-lg shadow-green-500/20 flex items-center gap-1.5"
                                        >
                                            💵 Collect Cash & Mark Paid
                                        </button>
                                    </div>
                                )}
                                {!(order.paymentMethod === 'cash' && order.paymentStatus !== 'paid') && (
                                    <div className="ml-auto flex gap-2">
                                        <button
                                            onClick={() => handleGenerateBill(order.id)}
                                            className="text-xs px-3 py-2 rounded-lg font-bold bg-zinc-800 hover:bg-zinc-700 text-white transition-colors border border-zinc-700"
                                        >
                                            📄 Bill
                                        </button>
                                        <button
                                            onClick={() => handleWhatsAppShare(order)}
                                            className="text-xs px-3 py-2 rounded-lg font-bold bg-green-600/10 hover:bg-green-600/20 text-green-500 transition-colors border border-green-600/30"
                                        >
                                            💬 WhatsApp
                                        </button>
                                    </div>
                                )}
                            </div>
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
}
