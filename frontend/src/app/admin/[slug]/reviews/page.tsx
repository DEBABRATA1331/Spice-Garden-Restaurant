'use client';
import { useEffect, useState } from 'react';
import { reviewApi } from '@/lib/api';
import toast from 'react-hot-toast';

export default function AdminReviewsPage() {
    const [reviews, setReviews] = useState<any[]>([]);

    useEffect(() => {
        reviewApi.adminGetAll().then(r => setReviews(r.data)).catch(() => { });
    }, []);

    const approve = async (id: string, val: boolean) => {
        await reviewApi.approve(id, val);
        setReviews(prev => prev.map(r => r.id === id ? { ...r, isApproved: val } : r));
        toast.success(val ? 'Approved' : 'Hidden');
    };

    const del = async (id: string) => {
        if (!confirm('Delete?')) return;
        await reviewApi.delete(id);
        setReviews(prev => prev.filter(r => r.id !== id));
        toast.success('Deleted');
    };

    return (
        <div>
            <h1 className="font-display text-3xl font-bold mb-6">Reviews & Ratings</h1>
            <div className="space-y-4">
                {reviews.length === 0 && <div className="card p-8 text-center text-zinc-500">No reviews yet</div>}
                {reviews.map(r => (
                    <div key={r.id} className="card p-5">
                        <div className="flex items-start justify-between flex-wrap gap-4">
                            <div className="flex-1">
                                <div className="flex items-center gap-2 mb-1">
                                    <p className="font-semibold">{r.customerName}</p>
                                    <span className={`text-xs px-2 py-0.5 rounded-full ${r.isApproved ? 'bg-green-500/10 text-green-400' : 'bg-yellow-500/10 text-yellow-400'}`}>{r.isApproved ? 'Approved' : 'Pending'}</span>
                                </div>
                                <div className="flex gap-0.5 mb-2">
                                    {[1, 2, 3, 4, 5].map(s => <span key={s} className={`text-base ${s <= r.rating ? 'text-yellow-400' : 'text-zinc-700'}`}>★</span>)}
                                </div>
                                {r.comment && <p className="text-zinc-300 text-sm">{r.comment}</p>}
                                <p className="text-zinc-600 text-xs mt-2">{new Date(r.createdAt).toLocaleDateString('en-IN')}</p>
                            </div>
                            <div className="flex gap-2 shrink-0">
                                <button onClick={() => approve(r.id, !r.isApproved)} className={`text-xs px-3 py-1.5 rounded-lg transition-colors border ${r.isApproved ? 'border-yellow-500/20 text-yellow-400 hover:bg-yellow-500/20' : 'border-green-500/20 text-green-400 hover:bg-green-500/20'}`}>{r.isApproved ? 'Hide' : 'Approve'}</button>
                                <button onClick={() => del(r.id)} className="text-xs px-3 py-1.5 rounded-lg bg-red-500/10 text-red-400 hover:bg-red-500 hover:text-white transition-colors">Delete</button>
                            </div>
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
}
