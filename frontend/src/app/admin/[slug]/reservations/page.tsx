'use client';
import { useEffect, useState } from 'react';
import { reservationApi } from '@/lib/api';
import toast from 'react-hot-toast';

const STATUS_COLORS: Record<string, string> = {
    pending: 'bg-yellow-500/10 text-yellow-400 border-yellow-500/20',
    confirmed: 'bg-green-500/10 text-green-400 border-green-500/20',
    cancelled: 'bg-red-500/10 text-red-400 border-red-500/20',
    completed: 'bg-zinc-700 text-zinc-400 border-zinc-700',
};

export default function AdminReservationsPage() {
    const [reservations, setReservations] = useState<any[]>([]);
    const [filter, setFilter] = useState({ status: '', date: '' });
    const [loading, setLoading] = useState(true);

    const load = async () => {
        setLoading(true);
        try {
            const params: any = {};
            if (filter.status) params.status = filter.status;
            if (filter.date) params.date = filter.date;
            const { data } = await reservationApi.adminGetAll(params);
            setReservations(data);
        } finally { setLoading(false); }
    };

    useEffect(() => { load(); }, [filter]);

    const update = async (id: string, status: string, tableNumber?: string) => {
        try {
            await reservationApi.updateStatus(id, status, tableNumber);
            toast.success('Updated');
            setReservations(prev => prev.map(r => r.id === id ? { ...r, status, tableNumber } : r));
        } catch { toast.error('Failed'); }
    };

    const deleteRes = async (id: string) => {
        if (!confirm('Delete reservation?')) return;
        await reservationApi.delete(id);
        setReservations(prev => prev.filter(r => r.id !== id));
        toast.success('Deleted');
    };

    // Group by date for calendar view
    const grouped = reservations.reduce((acc: any, r: any) => {
        acc[r.date] = acc[r.date] || [];
        acc[r.date].push(r);
        return acc;
    }, {});

    return (
        <div>
            <div className="flex items-center justify-between mb-6">
                <h1 className="font-display text-3xl font-bold">Reservations <span className="text-zinc-500 text-xl font-normal">({reservations.length})</span></h1>
            </div>

            {/* Filters */}
            <div className="flex flex-wrap gap-3 mb-6">
                <select className="input w-auto" value={filter.status} onChange={e => setFilter({ ...filter, status: e.target.value })}>
                    <option value="">All Statuses</option>
                    <option value="pending">Pending</option>
                    <option value="confirmed">Confirmed</option>
                    <option value="cancelled">Cancelled</option>
                    <option value="completed">Completed</option>
                </select>
                <input type="date" className="input w-auto" value={filter.date} onChange={e => setFilter({ ...filter, date: e.target.value })} />
                <button onClick={() => setFilter({ status: '', date: '' })} className="px-4 py-3 rounded-xl bg-zinc-800 text-zinc-400 hover:text-white text-sm">Clear</button>
            </div>

            {loading ? (
                <div className="flex justify-center py-16"><div className="w-10 h-10 rounded-full border-4 border-orange-500 border-t-transparent animate-spin" /></div>
            ) : reservations.length === 0 ? (
                <div className="card p-12 text-center text-zinc-500">No reservations found</div>
            ) : (
                <div className="space-y-6">
                    {Object.keys(grouped).sort().map(date => (
                        <div key={date}>
                            <h2 className="font-semibold text-orange-400 mb-3 flex items-center gap-2">
                                📅 {new Date(date + 'T00:00:00').toLocaleDateString('en-IN', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}
                                <span className="text-zinc-500 text-sm font-normal">({grouped[date].length} bookings)</span>
                            </h2>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                {grouped[date].map((r: any) => (
                                    <div key={r.id} className="card p-4">
                                        <div className="flex items-start justify-between mb-3">
                                            <div>
                                                <p className="font-bold">{r.customerName}</p>
                                                <p className="text-zinc-500 text-sm">{r.customerPhone}</p>
                                            </div>
                                            <span className={`px-2 py-1 rounded-full text-xs font-medium border ${STATUS_COLORS[r.status]}`}>{r.status}</span>
                                        </div>
                                        <div className="flex gap-4 text-sm text-zinc-400 mb-3">
                                            <span>⏰ {r.time}</span>
                                            <span>👥 {r.guests} guests</span>
                                            {r.tableNumber && <span>🪑 Table {r.tableNumber}</span>}
                                        </div>
                                        {r.notes && <p className="text-zinc-500 text-xs mb-3 italic">"{r.notes}"</p>}
                                        <div className="flex flex-wrap gap-2">
                                            {r.status === 'pending' && <>
                                                <button onClick={() => { const table = prompt('Assign table number (optional):') || ''; update(r.id, 'confirmed', table); }} className="text-xs px-3 py-1.5 rounded-lg bg-green-500/10 text-green-400 hover:bg-green-500 hover:text-white transition-colors border border-green-500/20">✅ Confirm</button>
                                                <button onClick={() => update(r.id, 'cancelled')} className="text-xs px-3 py-1.5 rounded-lg bg-red-500/10 text-red-400 hover:bg-red-500 hover:text-white transition-colors border border-red-500/20">❌ Cancel</button>
                                            </>}
                                            {r.status === 'confirmed' && <button onClick={() => update(r.id, 'completed')} className="text-xs px-3 py-1.5 rounded-lg bg-zinc-700 text-zinc-300 hover:bg-zinc-600 transition-colors">Mark Complete</button>}
                                            <button onClick={() => deleteRes(r.id)} className="text-xs px-3 py-1.5 rounded-lg bg-red-500/10 text-red-400 hover:bg-red-500 hover:text-white transition-colors ml-auto">🗑️ Delete</button>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
}
