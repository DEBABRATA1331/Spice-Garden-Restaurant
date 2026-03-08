'use client';
import { useEffect, useState } from 'react';
import { billingApi } from '@/lib/api';
import toast from 'react-hot-toast';

export default function AdminBillingPage() {
    const [invoices, setInvoices] = useState<any[]>([]);
    const [summary, setSummary] = useState<any>(null);
    const [loading, setLoading] = useState(true);

    const load = async () => {
        setLoading(true);
        const [inv, sum] = await Promise.all([billingApi.getAll(), billingApi.getDailySummary()]);
        setInvoices(inv.data.invoices || []);
        setSummary(sum.data);
        setLoading(false);
    };

    useEffect(() => { load(); }, []);

    const markPaid = async (id: string) => {
        await billingApi.markPaid(id);
        toast.success('Marked as paid');
        load();
    };

    return (
        <div>
            <h1 className="font-display text-3xl font-bold mb-6">Billing & POS</h1>

            {/* Daily Summary */}
            {summary && (
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
                    <div className="card p-5 text-center">
                        <p className="text-zinc-500 text-sm mb-1">Today's Orders</p>
                        <p className="text-2xl font-bold text-orange-400">{summary.totalOrders}</p>
                    </div>
                    <div className="card p-5 text-center">
                        <p className="text-zinc-500 text-sm mb-1">Total Revenue</p>
                        <p className="text-2xl font-bold text-green-400">₹{summary.totalRevenue?.toFixed(2)}</p>
                    </div>
                    <div className="card p-5 text-center">
                        <p className="text-zinc-500 text-sm mb-1">Collected</p>
                        <p className="text-2xl font-bold text-blue-400">₹{summary.paidRevenue?.toFixed(2)}</p>
                    </div>
                </div>
            )}

            {loading ? (
                <div className="flex justify-center py-12"><div className="w-10 h-10 rounded-full border-4 border-orange-500 border-t-transparent animate-spin" /></div>
            ) : (
                <div className="card overflow-hidden">
                    <div className="p-4 border-b border-zinc-800">
                        <h2 className="font-semibold">Invoices</h2>
                    </div>
                    <div className="overflow-x-auto">
                        <table className="w-full text-sm">
                            <thead>
                                <tr className="border-b border-zinc-800 text-zinc-500">
                                    <th className="text-left p-4">Invoice #</th>
                                    <th className="text-left p-4">Customer</th>
                                    <th className="text-left p-4">Amount</th>
                                    <th className="text-left p-4">Tax</th>
                                    <th className="text-left p-4">Status</th>
                                    <th className="text-left p-4">Date</th>
                                    <th className="text-left p-4">Action</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-zinc-800/50">
                                {invoices.length === 0 && <tr><td colSpan={7} className="text-center text-zinc-500 py-8">No invoices yet</td></tr>}
                                {invoices.map(inv => (
                                    <tr key={inv.id} className="hover:bg-zinc-800/30">
                                        <td className="p-4 font-mono text-xs text-zinc-400">{inv.invoiceNo}</td>
                                        <td className="p-4">{inv.order?.customerName}</td>
                                        <td className="p-4 font-bold text-orange-400">₹{inv.totalAmount}</td>
                                        <td className="p-4 text-zinc-400">₹{inv.taxAmount?.toFixed(2)}</td>
                                        <td className="p-4">
                                            <span className={`px-2 py-1 rounded-full text-xs font-medium ${inv.isPaid ? 'bg-green-500/10 text-green-400' : 'bg-yellow-500/10 text-yellow-400'}`}>{inv.isPaid ? '✅ Paid' : '⏳ Pending'}</span>
                                        </td>
                                        <td className="p-4 text-zinc-500 text-xs">{new Date(inv.createdAt).toLocaleDateString('en-IN')}</td>
                                        <td className="p-4">
                                            {!inv.isPaid && <button onClick={() => markPaid(inv.id)} className="text-xs bg-green-500/10 text-green-400 hover:bg-green-500 hover:text-white px-3 py-1.5 rounded-lg transition-colors">Mark Paid</button>}
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </div>
            )}
        </div>
    );
}
