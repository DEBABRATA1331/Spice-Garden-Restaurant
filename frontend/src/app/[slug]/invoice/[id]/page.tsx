'use client';
import { useEffect, useState } from 'react';
import { useParams } from 'next/navigation';
import { billingApi } from '@/lib/api';
import { motion } from 'framer-motion';

export default function PublicInvoicePage() {
    const { id } = useParams<{ id: string }>();
    const [invoice, setInvoice] = useState<any>(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const load = async () => {
            try {
                const { data } = await billingApi.getById(id);
                setInvoice(data);
            } catch (e) {
                console.error(e);
            } finally {
                setLoading(false);
            }
        };
        load();
    }, [id]);

    if (loading) return (
        <div className="min-h-screen bg-[#050505] flex items-center justify-center">
            <div className="w-12 h-12 border-4 border-orange-500 border-t-transparent rounded-full animate-spin" />
        </div>
    );

    if (!invoice) return (
        <div className="min-h-screen bg-[#050505] flex items-center justify-center text-white">
            <div className="text-center">
                <h1 className="text-6xl mb-4">📭</h1>
                <p className="text-zinc-500">Invoice not found</p>
            </div>
        </div>
    );

    const { order, restaurant } = invoice;

    return (
        <div className="min-h-screen bg-[#050505] text-white p-4 md:p-8 font-sans selection:bg-orange-500/30">
            {/* Background elements */}
            <div className="fixed inset-0 overflow-hidden pointer-events-none">
                <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] bg-orange-600/10 blur-[120px] rounded-full" />
                <div className="absolute bottom-[-10%] right-[-10%] w-[40%] h-[40%] bg-blue-600/10 blur-[120px] rounded-full" />
            </div>

            <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="max-w-3xl mx-auto relative"
            >
                {/* Invoice Container */}
                <div className="bg-zinc-900/40 backdrop-blur-2xl border border-white/10 rounded-[2.5rem] overflow-hidden shadow-2xl">
                    {/* Top Header */}
                    <div className="p-8 md:p-12 border-b border-white/5 flex flex-col md:flex-row justify-between items-start gap-8">
                        <div>
                            <div className="flex items-center gap-4 mb-6 group">
                                <div className="relative w-14 h-14 rounded-2xl overflow-hidden bg-gradient-to-br from-orange-400 to-orange-600 flex items-center justify-center shadow-lg shadow-orange-500/20">
                                    <img
                                        src="/logo.png"
                                        alt="Logo"
                                        className="w-full h-full object-cover mix-blend-overlay opacity-90"
                                    />
                                    <div className="absolute inset-0 bg-gradient-to-tr from-white/0 via-white/40 to-white/0 -translate-x-full animate-[logoShine_3s_infinite_ease-in-out]" />
                                </div>
                                <h1 className="text-2xl font-bold tracking-tight">{restaurant.name}</h1>
                            </div>
                            <div className="space-y-1 text-zinc-400 text-sm">
                                <p>{restaurant.address}</p>
                                <p>{restaurant.phone}</p>
                                <p>{restaurant.email}</p>
                            </div>
                        </div>

                        <div className="text-left md:text-right">
                            <h2 className="text-zinc-500 uppercase tracking-widest text-[10px] font-bold mb-2">Invoice Details</h2>
                            <p className="text-xl font-mono text-orange-400 mb-1">{invoice.invoiceNo}</p>
                            <p className="text-zinc-400 text-sm">{new Date(invoice.createdAt).toLocaleDateString('en-IN', { dateStyle: 'long' })}</p>

                            <div className={`mt-4 inline-flex items-center gap-2 px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider ${invoice.isPaid ? 'bg-green-500/10 text-green-400' : 'bg-yellow-500/10 text-yellow-500'}`}>
                                <span className={`w-1.5 h-1.5 rounded-full ${invoice.isPaid ? 'bg-green-400' : 'bg-yellow-500'} animate-pulse`} />
                                {invoice.isPaid ? 'Paid' : 'Payment Pending'}
                            </div>
                        </div>
                    </div>

                    {/* Customer Info */}
                    <div className="p-8 md:px-12 py-6 bg-white/5 flex justify-between items-center">
                        <div>
                            <p className="text-zinc-500 text-[10px] uppercase font-bold tracking-widest mb-1">Billed To</p>
                            <p className="font-bold text-lg">{order.customerName}</p>
                            <p className="text-zinc-400 text-sm">{order.customerPhone}</p>
                        </div>
                        {order.tableNumber && (
                            <div className="text-right">
                                <p className="text-zinc-500 text-[10px] uppercase font-bold tracking-widest mb-1">Table</p>
                                <p className="font-bold text-2xl text-orange-400">{order.tableNumber}</p>
                            </div>
                        )}
                    </div>

                    {/* Items Table */}
                    <div className="p-8 md:p-12">
                        <table className="w-full text-left">
                            <thead>
                                <tr className="text-zinc-500 text-[10px] uppercase font-bold tracking-widest border-b border-white/5">
                                    <th className="pb-4 font-bold">Item Description</th>
                                    <th className="pb-4 text-center font-bold">Qty</th>
                                    <th className="pb-4 text-right font-bold">Price</th>
                                    <th className="pb-4 text-right font-bold">Amount</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-white/5">
                                {order.orderItems.map((item: any) => (
                                    <tr key={item.id} className="group">
                                        <td className="py-6">
                                            <p className="font-medium group-hover:text-orange-400 transition-colors">{item.name}</p>
                                            {item.notes && <p className="text-xs text-zinc-500 mt-1 italic">"{item.notes}"</p>}
                                        </td>
                                        <td className="py-6 text-center text-zinc-400">{item.quantity}</td>
                                        <td className="py-6 text-right text-zinc-400">₹{item.price}</td>
                                        <td className="py-6 text-right font-medium">₹{item.subtotal}</td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>

                        {/* Totals */}
                        <div className="mt-12 flex justify-end">
                            <div className="w-full md:w-64 space-y-3">
                                <div className="flex justify-between text-sm text-zinc-400">
                                    <span>Subtotal</span>
                                    <span>₹{invoice.subtotal}</span>
                                </div>
                                <div className="flex justify-between text-sm text-zinc-400">
                                    <span>Tax (5%)</span>
                                    <span>₹{invoice.taxAmount}</span>
                                </div>
                                {invoice.discountAmount > 0 && (
                                    <div className="flex justify-between text-sm text-green-400">
                                        <span>Discount</span>
                                        <span>-₹{invoice.discountAmount}</span>
                                    </div>
                                )}
                                <div className="pt-4 border-t border-white/10 flex justify-between items-end">
                                    <span className="font-bold text-lg">Total</span>
                                    <span className="text-3xl font-bold bg-gradient-to-r from-orange-400 to-orange-600 bg-clip-text text-transparent">₹{invoice.totalAmount}</span>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Footer / Call to action */}
                    <div className="p-8 md:p-12 bg-white/2 border-t border-white/5 text-center">
                        <p className="text-zinc-500 text-xs mb-8">This is a digitally generated invoice. No signature required.</p>
                        <div className="flex flex-wrap justify-center gap-4">
                            <button
                                onClick={() => window.print()}
                                className="px-6 py-3 bg-white/5 hover:bg-white/10 rounded-2xl text-sm font-bold transition-all border border-white/10"
                            >
                                🖨️ Print Invoice
                            </button>
                            {!invoice.isPaid && (
                                <button className="px-8 py-3 bg-orange-500 hover:bg-orange-600 rounded-2xl text-sm font-bold transition-all shadow-xl shadow-orange-500/20">
                                    💳 Pay Now
                                </button>
                            )}
                        </div>
                    </div>
                </div>

                {/* Footer Brand */}
                <div className="mt-8 text-center text-zinc-600 text-[10px] uppercase font-bold tracking-[0.2em]">
                    Powered by <span className="text-zinc-400">AmritTech Restaurant OS</span>
                </div>
            </motion.div>

            <style jsx global>{`
                @keyframes logoShine {
                    0%   { transform: translateX(-100%) skewX(-15deg); }
                    100% { transform: translateX(200%) skewX(-15deg); }
                }
                @media print {
                    body { background: white !important; color: black !important; }
                    .bg-[#050505], .bg-zinc-900/40 { background: white !important; }
                    .text-white, .text-zinc-400 { color: black !important; }
                    .border-white\/10 { border-color: #eee !important; }
                    button, .fixed { display: none !important; }
                    .max-w-3xl { max-width: 100% !important; margin: 0 !important; }
                    .shadow-2xl { shadow: none !important; }
                }
            `}</style>
        </div>
    );
}
