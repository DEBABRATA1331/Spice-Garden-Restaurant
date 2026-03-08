'use client';
import { useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { reservationApi, restaurantApi } from '@/lib/api';
import toast from 'react-hot-toast';
import Link from 'next/link';
import { motion, AnimatePresence } from 'framer-motion';
import TableMap from './TableMap';

const TIME_SLOTS = ['11:00', '11:30', '12:00', '12:30', '13:00', '13:30', '14:00', '14:30', '18:00', '18:30', '19:00', '19:30', '20:00', '20:30', '21:00', '21:30'];

export default function ReservePage() {
    const { slug } = useParams<{ slug: string }>();
    const router = useRouter();

    // Form and Selection State
    const [form, setForm] = useState({ customerName: '', customerPhone: '', customerEmail: '', date: '', time: '', guests: '2', notes: '' });
    const [selectedTableId, setSelectedTableId] = useState<string | null>(null);
    const [loading, setLoading] = useState(false);
    const [success, setSuccess] = useState<any>(null);

    const today = new Date().toISOString().split('T')[0];

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!form.date || !form.time) return toast.error('Please select date and time');
        if (!selectedTableId) return toast.error('Please select a table from the map');

        setLoading(true);
        try {
            const restaurant = await restaurantApi.getBySlug(slug);
            // Append selected table to notes so admin sees it, backend currently expects basic form
            const finalNotes = selectedTableId ? `[Table Preference: ${selectedTableId}] ${form.notes}` : form.notes;

            const { data } = await reservationApi.create({
                ...form,
                notes: finalNotes,
                restaurantId: restaurant.data.id
            });
            setSuccess(data);
            toast.success('Reservation requested! We\'ll confirm shortly.');
        } catch (e: any) {
            toast.error(e.response?.data?.error || 'Failed to book');
        } finally { setLoading(false); }
    };

    if (success) return (
        <div className="min-h-screen bg-[#0a0a0a] flex items-center justify-center px-4 text-white">
            <motion.div
                initial={{ scale: 0.9, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                className="max-w-md w-full card p-8 text-center border-orange-500/20 shadow-[0_0_40px_rgba(249,115,22,0.1)]"
            >
                <div className="text-6xl mb-4 animate-bounce">🎉</div>
                <h2 className="font-display text-2xl font-bold mb-2 text-orange-400">Reservation Confirmed!</h2>
                <p className="text-zinc-400 mb-6">Your table is locked in. We'll send a reminder soon.</p>

                <div className="bg-[#111] rounded-xl p-5 text-left space-y-3 mb-6 border border-white/5">
                    <div className="flex justify-between"><span className="text-zinc-500">Name</span><span className="font-medium">{success.customerName}</span></div>
                    <div className="flex justify-between"><span className="text-zinc-500">Date</span><span className="font-medium">{success.date}</span></div>
                    <div className="flex justify-between"><span className="text-zinc-500">Time</span><span className="font-medium">{success.time}</span></div>
                    <div className="flex justify-between"><span className="text-zinc-500">Guests</span><span className="font-medium">{success.guests}</span></div>
                    {selectedTableId && <div className="flex justify-between"><span className="text-zinc-500">Table</span><span className="text-orange-400 font-bold">{selectedTableId}</span></div>}
                    <div className="flex justify-between pt-2 border-t border-white/10 mt-2"><span className="text-zinc-500">Status</span><span className="text-yellow-400 font-bold capitalize">{success.status}</span></div>
                </div>

                <Link href={`/${slug}`} className="btn-primary w-full block">Return Home</Link>
            </motion.div>
        </div>
    );

    const isMissingDateTime = !form.date || !form.time;

    return (
        <div className="min-h-screen bg-[#0a0a0a] text-white py-8 px-4 font-['Inter',sans-serif]">
            <div className="max-w-6xl mx-auto">
                <Link href={`/${slug}`} className="text-zinc-400 hover:text-white text-sm mb-6 inline-flex items-center gap-2 transition-colors">
                    <span className="text-orange-400">←</span> Back to Restaurant
                </Link>

                <div className="mb-10">
                    <h1 className="font-display text-4xl md:text-5xl font-bold mb-3 tracking-tight">Reserve a Table</h1>
                    <p className="text-zinc-400 text-lg">Select your party size and choose your perfect spot from the map.</p>
                </div>

                <form onSubmit={handleSubmit} className="grid grid-cols-1 lg:grid-cols-12 gap-8">

                    {/* LEFT COLUMN: Booking Details */}
                    <div className="lg:col-span-5 flex flex-col gap-6">

                        {/* Step 1: Time & Guests */}
                        <div className="card p-6 border-zinc-800 shadow-xl bg-[#111]">
                            <div className="flex items-center gap-3 mb-6">
                                <span className="bg-orange-500 text-black w-6 h-6 rounded-full flex items-center justify-center font-bold text-sm">1</span>
                                <h2 className="font-bold text-lg">When & Who</h2>
                            </div>

                            <div className="space-y-5">
                                <div className="grid grid-cols-2 gap-4">
                                    <div>
                                        <label className="text-zinc-400 text-xs font-semibold uppercase tracking-wider mb-2 block">Date</label>
                                        <input className="input bg-[#1a1a1a]" type="date" min={today} required value={form.date} onChange={e => setForm({ ...form, date: e.target.value })} />
                                    </div>
                                    <div>
                                        <label className="text-zinc-400 text-xs font-semibold uppercase tracking-wider mb-2 block">Party Size</label>
                                        <select
                                            className="input bg-[#1a1a1a]"
                                            value={form.guests}
                                            onChange={e => {
                                                setForm({ ...form, guests: e.target.value });
                                                setSelectedTableId(null); // Reset table selection on guest change
                                            }}
                                        >
                                            {[1, 2, 3, 4, 5, 6, 7, 8].map(n => <option key={n} value={n}>{n} {n === 1 ? 'Guest' : 'Guests'}</option>)}
                                        </select>
                                    </div>
                                </div>

                                <div>
                                    <label className="text-zinc-400 text-xs font-semibold uppercase tracking-wider mb-2 block">Preferred Time</label>
                                    <div className="grid grid-cols-4 gap-2">
                                        {TIME_SLOTS.map(t => (
                                            <button
                                                type="button"
                                                key={t}
                                                onClick={() => setForm({ ...form, time: t })}
                                                className={`py-2 rounded-lg text-sm transition-all font-medium border ${form.time === t
                                                        ? 'bg-orange-500 text-white border-orange-400 shadow-[0_0_15px_rgba(249,115,22,0.4)]'
                                                        : 'bg-[#1a1a1a] text-zinc-400 border-transparent hover:border-zinc-700 hover:text-white'
                                                    }`}
                                            >
                                                {t}
                                            </button>
                                        ))}
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* Step 3: Contact Details (Unlocks after table selected) */}
                        <div className={`card p-6 border-zinc-800 transition-all duration-500 ${selectedTableId ? 'bg-[#111] shadow-xl border-orange-500/20' : 'bg-[#0a0a0a]/50 border-dashed opacity-50'}`}>
                            <div className="flex items-center gap-3 mb-6">
                                <span className={`${selectedTableId ? 'bg-orange-500 text-black' : 'bg-zinc-800 text-zinc-500'} w-6 h-6 rounded-full flex items-center justify-center font-bold text-sm transition-colors`}>3</span>
                                <h2 className="font-bold text-lg">Your Details</h2>
                            </div>

                            <fieldset disabled={!selectedTableId} className="space-y-4">
                                <input className="input bg-[#1a1a1a]" placeholder="Ex: James Bond" required value={form.customerName} onChange={e => setForm({ ...form, customerName: e.target.value })} />
                                <input className="input bg-[#1a1a1a]" placeholder="Phone Number" type="tel" required value={form.customerPhone} onChange={e => setForm({ ...form, customerPhone: e.target.value })} />
                                <input className="input bg-[#1a1a1a]" placeholder="Email (optional)" type="email" value={form.customerEmail} onChange={e => setForm({ ...form, customerEmail: e.target.value })} />
                                <textarea className="input bg-[#1a1a1a]" rows={2} placeholder="Any special requests or allergies?" value={form.notes} onChange={e => setForm({ ...form, notes: e.target.value })} />

                                <button
                                    type="submit"
                                    disabled={loading || !selectedTableId}
                                    className={`w-full py-4 rounded-xl font-bold text-lg transition-all ${selectedTableId && !loading
                                            ? 'bg-orange-500 hover:bg-orange-600 text-white shadow-[0_10px_30px_rgba(249,115,22,0.3)]'
                                            : 'bg-zinc-800 text-zinc-500 cursor-not-allowed'
                                        }`}
                                >
                                    {loading ? '⏳ Processing...' : '📅 Confirm Reservation'}
                                </button>
                            </fieldset>
                        </div>
                    </div>

                    {/* RIGHT COLUMN: Table Map */}
                    <div className="lg:col-span-7 h-[650px] lg:h-auto flex flex-col relative">
                        {/* Overlay to block map if Date/Time not selected */}
                        <AnimatePresence>
                            {isMissingDateTime && (
                                <motion.div
                                    initial={{ opacity: 0 }}
                                    animate={{ opacity: 1 }}
                                    exit={{ opacity: 0 }}
                                    className="absolute inset-0 z-20 flex flex-col items-center justify-center bg-black/60 backdrop-blur-md rounded-2xl border border-zinc-800/50"
                                >
                                    <div className="bg-zinc-900 border border-zinc-800 rounded-full px-6 py-3 text-sm font-medium flex items-center gap-3">
                                        <span className="w-2 h-2 rounded-full bg-orange-500 animate-pulse" />
                                        Please select a Date & Time first
                                    </div>
                                </motion.div>
                            )}
                        </AnimatePresence>

                        <div className="flex items-center gap-3 mb-4 pl-1 z-30">
                            <span className={`${!isMissingDateTime ? 'bg-orange-500 text-black' : 'bg-zinc-800 text-zinc-500'} w-6 h-6 rounded-full flex items-center justify-center font-bold text-sm transition-colors`}>2</span>
                            <h2 className="font-bold text-lg">Choose your Table</h2>
                        </div>

                        <div className={`transition-opacity duration-300 flex-1 ${isMissingDateTime ? 'opacity-30' : 'opacity-100'}`}>
                            <TableMap
                                guests={parseInt(form.guests)}
                                selectedTableId={selectedTableId}
                                onSelectTable={setSelectedTableId}
                            />
                        </div>
                    </div>
                </form>
            </div>
        </div>
    );
}
