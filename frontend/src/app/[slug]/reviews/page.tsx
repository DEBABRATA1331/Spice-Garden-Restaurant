'use client';
import { useEffect, useState } from 'react';
import { useParams } from 'next/navigation';
import { reviewApi, restaurantApi } from '@/lib/api';
import toast from 'react-hot-toast';
import Link from 'next/link';

export default function ReviewsPage() {
    const { slug } = useParams<{ slug: string }>();
    const [reviews, setReviews] = useState<any[]>([]);
    const [restaurant, setRestaurant] = useState<any>(null);
    const [form, setForm] = useState({ restaurantId: '', customerName: '', rating: 5, comment: '' });
    const [loading, setLoading] = useState(false);

    useEffect(() => {
        restaurantApi.getBySlug(slug).then(r => {
            setRestaurant(r.data);
            setForm(f => ({ ...f, restaurantId: r.data.id }));
            return reviewApi.getByRestaurant(r.data.id);
        }).then(r => setReviews(r.data)).catch(() => { });
    }, [slug]);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!form.customerName) return toast.error('Please enter your name');
        setLoading(true);
        try {
            await reviewApi.create(form);
            toast.success('Review submitted for moderation!');
            setForm(f => ({ ...f, customerName: '', comment: '', rating: 5 }));
        } catch { toast.error('Failed to submit review'); } finally { setLoading(false); }
    };

    const avgRating = reviews.length ? (reviews.reduce((s, r) => s + r.rating, 0) / reviews.length).toFixed(1) : null;

    return (
        <div className="min-h-screen bg-[#0a0a0a] text-white py-8 px-4">
            <div className="max-w-3xl mx-auto">
                <Link href={`/${slug}`} className="text-zinc-400 hover:text-white text-sm mb-6 inline-block">← Back to {restaurant?.name}</Link>
                <div className="flex items-center justify-between mb-8">
                    <h1 className="font-display text-4xl font-bold">Reviews</h1>
                    {avgRating && (
                        <div className="text-center">
                            <p className="text-4xl font-bold text-orange-400">{avgRating}</p>
                            <p className="text-zinc-500 text-sm">{reviews.length} reviews</p>
                        </div>
                    )}
                </div>

                {/* Reviews list */}
                <div className="space-y-4 mb-12">
                    {reviews.length === 0 && <p className="text-zinc-500 text-center py-8">No reviews yet. Be the first!</p>}
                    {reviews.map(review => (
                        <div key={review.id} className="card p-5">
                            <div className="flex items-start justify-between mb-2">
                                <div>
                                    <p className="font-semibold">{review.customerName}</p>
                                    <p className="text-zinc-500 text-xs">{new Date(review.createdAt).toLocaleDateString('en-IN')}</p>
                                </div>
                                <div className="flex gap-0.5">
                                    {[1, 2, 3, 4, 5].map(s => <span key={s} className={`text-lg ${s <= review.rating ? 'text-yellow-400' : 'text-zinc-700'}`}>★</span>)}
                                </div>
                            </div>
                            {review.comment && <p className="text-zinc-300 text-sm">{review.comment}</p>}
                        </div>
                    ))}
                </div>

                {/* Add review form */}
                <div className="card p-6">
                    <h2 className="font-bold text-xl mb-4">Write a Review</h2>
                    <form onSubmit={handleSubmit} className="space-y-4">
                        <input className="input" placeholder="Your Name *" value={form.customerName} onChange={e => setForm({ ...form, customerName: e.target.value })} />
                        <div>
                            <p className="text-zinc-400 text-sm mb-2">Rating</p>
                            <div className="flex gap-2">
                                {[1, 2, 3, 4, 5].map(s => (
                                    <button type="button" key={s} onClick={() => setForm({ ...form, rating: s })} className={`text-3xl transition-transform hover:scale-110 ${s <= form.rating ? 'text-yellow-400' : 'text-zinc-700'}`}>★</button>
                                ))}
                            </div>
                        </div>
                        <textarea className="input" rows={3} placeholder="Tell us about your experience..." value={form.comment} onChange={e => setForm({ ...form, comment: e.target.value })} />
                        <button type="submit" disabled={loading} className="btn-primary w-full">{loading ? 'Submitting...' : 'Submit Review'}</button>
                    </form>
                </div>
            </div>
        </div>
    );
}
