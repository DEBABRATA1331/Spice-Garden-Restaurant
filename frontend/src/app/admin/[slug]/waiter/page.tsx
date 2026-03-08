'use client';
import { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { orderApi, restaurantApi } from '@/lib/api';
import toast from 'react-hot-toast';

const STATUS_COLORS: Record<string, string> = {
    pending: 'bg-yellow-500 text-black',
    confirmed: 'bg-blue-500 text-white',
    preparing: 'bg-orange-500 text-white',
    ready: 'bg-purple-500 text-white',
    delivered: 'bg-green-500 text-white',
};

// Simulated Tables for the Dashboard
const TABLES = [
    { id: 'T1', capacity: 2 }, { id: 'T2', capacity: 2 }, { id: 'T3', capacity: 4 },
    { id: 'T4', capacity: 4 }, { id: 'T5', capacity: 6 }, { id: 'T6', capacity: 6 },
    { id: 'T7', capacity: 8 }, { id: 'T8', capacity: 8 }
];

export default function WaiterDashboard() {
    const { slug } = useParams<{ slug: string }>();
    const router = useRouter();
    const [orders, setOrders] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);

    const loadOrders = async (silent = false) => {
        if (!silent) setLoading(true);
        try {
            // Load only active dine-in orders
            const { data } = await orderApi.adminGetAll({ status: 'pending,confirmed,preparing,ready' });
            // Filter strictly to dine-in locally if needed
            const activeDineIn = data.orders.filter((o: any) => o.orderType === 'dine-in' && o.status !== 'cancelled' && o.status !== 'delivered');
            setOrders(activeDineIn);
        } catch (e: any) {
            if (!silent) toast.error('Failed to load active orders');
        } finally {
            if (!silent) setLoading(false);
        }
    };

    useEffect(() => {
        loadOrders();
        // 5 second rolling updates to sync with kitchen
        const interval = setInterval(() => loadOrders(true), 5000);
        return () => clearInterval(interval);
    }, []);

    // Helper: Find active order for a table
    const getOrderForTable = (tableId: string) => {
        return orders.find(o => o.tableNumber === tableId);
    };

    const handleGenerateBill = async (orderId: string) => {
        try {
            const { data } = await orderApi.generateInvoice(orderId);
            toast.success('Bill generated! 📄');
            // Refresh to show invoice status
            loadOrders(true);
            return data;
        } catch (e) {
            toast.error('Failed to generate bill');
        }
    };

    const handleWhatsAppShare = async (order: any) => {
        if (!order.customerPhone) return toast.error('No phone number provide');

        let invId = order.invoice?.id;

        // If no invoice, generate one first
        if (!invId) {
            const inv = await handleGenerateBill(order.id);
            if (!inv) return;
            invId = inv.id;
        }

        const invoiceUrl = `${window.location.origin}/${slug}/invoice/${invId}`;
        const message = `*Dine-In Bill Generated*%0A%0AHello ${order.customerName}, your digital bill for Table ${order.tableNumber} is ready.%0A%0AView Invoice: ${invoiceUrl}%0A%0AThank you!`;

        const phone = order.customerPhone.startsWith('+') ? order.customerPhone : `+91${order.customerPhone}`;
        window.open(`https://wa.me/${phone.replace(/\D/g, '')}?text=${message}`, '_blank');
    };

    if (loading) return <div className="min-h-screen flex items-center justify-center"><div className="w-10 h-10 rounded-full border-4 border-orange-500 border-t-transparent animate-spin" /></div>;

    return (
        <div className="p-6 max-w-7xl mx-auto min-h-screen">
            <div className="flex items-center justify-between mb-8">
                <div>
                    <h1 className="font-display text-3xl font-bold">Waiter Dashboard</h1>
                    <p className="text-zinc-400">Manage tables and active orders</p>
                </div>
                <div className="flex gap-4">
                    <div className="flex items-center gap-2 px-4 py-2 bg-zinc-800 rounded-full font-bold">
                        <span className="w-2 h-2 rounded-full bg-green-500 animate-pulse" /> Live Sync
                    </div>
                </div>
            </div>

            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
                {TABLES.map(table => {
                    const activeOrder = getOrderForTable(table.id);
                    const isOccupied = !!activeOrder;

                    return (
                        <div
                            key={table.id}
                            onClick={() => {
                                if (isOccupied) {
                                    // Could open a modal, or navigate to edit order
                                    toast('Waiters modifying live orders is coming soon!');
                                } else {
                                    // Go to menu on behalf of new customer at table
                                    router.push(`/${slug}/menu?table=${table.id}`);
                                }
                            }}
                            className={`relative cursor-pointer transition-all duration-300 rounded-2xl p-6 border-2 
                            ${isOccupied
                                    ? 'border-orange-500/50 bg-orange-500/10 shadow-[0_0_20px_rgba(249,115,22,0.1)]'
                                    : 'border-zinc-800 bg-zinc-900/50 hover:border-zinc-600'}`
                            }
                        >
                            <div className="flex justify-between items-start mb-4">
                                <div>
                                    <h2 className="text-2xl font-bold font-display">{table.id}</h2>
                                    <p className="text-xs text-zinc-500">{table.capacity} Seats</p>
                                </div>

                                {isOccupied ? (
                                    <div className="w-10 h-10 rounded-full bg-orange-500/20 text-orange-500 flex items-center justify-center font-bold">
                                        🧑‍🍳
                                    </div>
                                ) : (
                                    <div className="w-10 h-10 rounded-full bg-zinc-800 text-zinc-500 flex items-center justify-center">
                                        🪑
                                    </div>
                                )}
                            </div>

                            {isOccupied && activeOrder ? (
                                <div className="space-y-3 mt-6">
                                    <div className="flex gap-2 items-center mb-1">
                                        <div className={`text-[10px] font-bold px-2 py-0.5 rounded inline-block capitalize ${STATUS_COLORS[activeOrder.status] || 'bg-zinc-700 text-white'}`}>
                                            {activeOrder.status}
                                        </div>
                                        {activeOrder.invoice && (
                                            <div className="text-[10px] font-bold px-2 py-0.5 rounded bg-orange-500/20 text-orange-400 border border-orange-500/30 animate-pulse">
                                                📜 Invoiced
                                            </div>
                                        )}
                                    </div>
                                    <div>
                                        <p className="font-bold text-sm truncate">{activeOrder.customerName}</p>
                                        <p className="text-zinc-500 text-xs">{activeOrder.orderItems?.length || 0} Items • ₹{activeOrder.totalAmount}</p>
                                    </div>
                                    <div className="grid grid-cols-2 gap-2">
                                        <button
                                            onClick={(e) => { e.stopPropagation(); handleGenerateBill(activeOrder.id); }}
                                            className="text-[10px] bg-zinc-800 hover:bg-zinc-700 text-white py-2 rounded-lg font-bold transition-colors"
                                        >
                                            📄 Generate Bill
                                        </button>
                                        <button
                                            onClick={(e) => { e.stopPropagation(); handleWhatsAppShare(activeOrder); }}
                                            className="text-[10px] bg-green-600/20 hover:bg-green-600/30 text-green-500 py-2 rounded-lg font-bold transition-colors border border-green-600/30"
                                        >
                                            💬 WhatsApp
                                        </button>
                                    </div>
                                    <button className="w-full mt-2 text-xs bg-orange-500 hover:bg-orange-600 text-white py-2 rounded-lg font-bold transition-colors">
                                        View Details
                                    </button>
                                </div>
                            ) : (
                                <div className="mt-8">
                                    <button className="w-full text-xs text-zinc-400 border border-zinc-700 hover:text-white hover:border-zinc-500 py-3 rounded-lg font-bold transition-colors">
                                        + Place New Order
                                    </button>
                                </div>
                            )}
                        </div>
                    );
                })}
            </div>
        </div>
    );
}
