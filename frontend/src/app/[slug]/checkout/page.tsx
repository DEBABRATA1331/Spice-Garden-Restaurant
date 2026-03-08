'use client';
import { useState, useEffect, Suspense } from 'react';
import { useParams, useSearchParams, useRouter } from 'next/navigation';
import toast from 'react-hot-toast';
import { authApi, orderApi, couponApi, paymentApi, restaurantApi } from '@/lib/api';
import { useCart } from '@/lib/cartStore';
import Link from 'next/link';

declare const Razorpay: any;

function CheckoutContent() {
    const { slug } = useParams<{ slug: string }>();
    const params = useSearchParams();
    const tableNo = params.get('table');
    const router = useRouter();
    const { items, subtotal, clearCart, restaurantId } = useCart();

    // Auto-load customer profile if logged in
    const [userLoaded, setUserLoaded] = useState(false);
    useEffect(() => {
        if (localStorage.getItem('customerToken')) {
            authApi.getMe().then(res => {
                setForm(f => ({ ...f, name: res.data.name, phone: res.data.phone || '', email: res.data.email || '' }));
            }).catch(() => localStorage.removeItem('customerToken')).finally(() => setUserLoaded(true));
        } else {
            setUserLoaded(true);
        }
    }, [restaurantId]); // Added restaurantId as dependency if needed

    const [form, setForm] = useState({
        name: '',
        phone: '',
        email: '',
        orderType: 'dine-in',
        notes: '',
    });
    const [paymentMethod, setPaymentMethod] = useState<'online' | 'cash'>('online');
    const [coupon, setCoupon] = useState('');
    const [couponResult, setCouponResult] = useState<any>(null);
    const [loading, setLoading] = useState(false);

    const tax = subtotal() * 0.05;
    const discount = couponResult?.discount || 0;
    const total = subtotal() + tax - discount;

    const validateCoupon = async () => {
        try {
            const r = await couponApi.validate(coupon, restaurantId!, subtotal());
            setCouponResult(r.data);
            toast.success(`Coupon applied! You save ₹${r.data.discount.toFixed(2)}`);
        } catch (e: any) {
            toast.error(e.response?.data?.error || 'Invalid coupon');
        }
    };

    const loadRazorpay = () => new Promise<void>((res) => {
        if (typeof Razorpay !== 'undefined') { res(); return; }
        const s = document.createElement('script');
        s.src = 'https://checkout.razorpay.com/v1/checkout.js';
        s.onload = () => res();
        document.body.appendChild(s);
    });

    const handlePlace = async () => {
        if (!form.name || !form.phone) return toast.error('Name and phone are required');
        if (items.length === 0) return toast.error('Cart is empty');
        setLoading(true);

        try {
            const { data: order } = await orderApi.create({
                restaurantId,
                customerName: form.name,
                customerPhone: form.phone,
                customerEmail: form.email,
                orderType: form.orderType,
                items: items.map(i => ({ menuItemId: i.menuItemId, quantity: i.quantity })),
                couponCode: couponResult ? coupon : undefined,
                tableNumber: tableNo,
                notes: form.notes,
                paymentMethod: paymentMethod === 'cash' ? 'cash' : 'razorpay',
            });

            if (paymentMethod === 'cash') {
                clearCart();
                toast.success('Order placed! Please pay at the counter. 🎉');
                router.push(`/${slug}/order/${order.id}`);
                return;
            }

            await loadRazorpay();
            const { data: rz } = await paymentApi.createOrder({
                amount: total,
                orderId: order.id,
                restaurantId,
            });

            const rzInstance = new Razorpay({
                key: rz.keyId || process.env.NEXT_PUBLIC_RAZORPAY_KEY_ID,
                amount: Math.round(total * 100),
                currency: 'INR',
                name: 'Restaurant Order',
                description: `Order #${order.id.slice(-6)}`,
                order_id: rz.razorpayOrderId,
                handler: async (response: any) => {
                    await paymentApi.verify({ ...response, orderId: order.id, restaurantId });
                    clearCart();
                    toast.success('Order placed & payment confirmed! 🎉');
                    router.push(`/${slug}/order/${order.id}`);
                },
                prefill: { name: form.name, contact: form.phone, email: form.email },
                theme: { color: '#e85d26' },
            });
            rzInstance.open();
        } catch (e: any) {
            toast.error(e.response?.data?.error || 'Order failed. Please try again.');
        } finally {
            setLoading(false);
        }
    };

    if (items.length === 0) return (
        <div className="min-h-screen bg-[#0a0a0a] flex items-center justify-center text-center px-4">
            <div>
                <p className="text-6xl mb-4">🛒</p>
                <h2 className="text-2xl font-bold mb-2 text-white">Your cart is empty</h2>
                <Link href={`/${slug}/menu`} className="btn-primary mt-4 inline-block">Browse Menu</Link>
            </div>
        </div>
    );

    return (
        <div className="min-h-screen bg-[#0a0a0a] text-white py-8 px-4">
            <div className="max-w-4xl mx-auto">
                <Link href={`/${slug}/menu`} className="text-zinc-400 hover:text-white text-sm mb-6 inline-block">← Back to Menu</Link>
                <h1 className="font-display text-3xl font-bold mb-8">Checkout</h1>

                <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                    {/* LEFT: Form */}
                    <div className="space-y-6">
                        {/* Customer Details */}
                        <div className="card p-6 space-y-4">
                            <h2 className="font-semibold text-lg">Your Details</h2>
                            <input className="input" placeholder="Full Name *" value={form.name} onChange={e => setForm({ ...form, name: e.target.value })} />
                            <input className="input" placeholder="Phone Number *" value={form.phone} onChange={e => setForm({ ...form, phone: e.target.value })} />
                            <input className="input" placeholder="Email (optional)" value={form.email} onChange={e => setForm({ ...form, email: e.target.value })} />
                        </div>

                        {/* Order Type */}
                        <div className="card p-6 space-y-4">
                            <h2 className="font-semibold text-lg">Order Type</h2>
                            <div className="grid grid-cols-2 gap-3">
                                {[
                                    { id: 'dine-in', emoji: '🪑', label: 'Dine In', desc: 'Eat at the restaurant' },
                                    { id: 'takeaway', emoji: '🥡', label: 'Takeaway', desc: 'Pick up your order' },
                                ].map(type => (
                                    <button
                                        key={type.id}
                                        onClick={() => setForm({ ...form, orderType: type.id })}
                                        className={`p-4 rounded-xl border-2 text-left transition-all ${form.orderType === type.id ? 'border-orange-500 bg-orange-500/10' : 'border-zinc-700 bg-zinc-800/50 hover:border-zinc-600'}`}
                                    >
                                        <div className="text-2xl mb-1">{type.emoji}</div>
                                        <div className="font-semibold">{type.label}</div>
                                        <div className="text-xs text-zinc-500 mt-0.5">{type.desc}</div>
                                    </button>
                                ))}
                            </div>
                            {tableNo && (
                                <div className="flex items-center gap-2 text-sm bg-orange-500/10 border border-orange-500/20 rounded-xl px-4 py-2">
                                    <span>🪑</span>
                                    <span className="text-orange-400">Table {tableNo} — auto-assigned</span>
                                </div>
                            )}
                            <textarea className="input" rows={2} placeholder="Special notes / allergies (optional)" value={form.notes} onChange={e => setForm({ ...form, notes: e.target.value })} />
                        </div>

                        {/* Payment Method */}
                        <div className="card p-6 space-y-4">
                            <h2 className="font-semibold text-lg">Payment Method</h2>
                            <div className="grid grid-cols-2 gap-3">
                                <button
                                    onClick={() => setPaymentMethod('online')}
                                    className={`p-4 rounded-xl border-2 text-left transition-all ${paymentMethod === 'online' ? 'border-orange-500 bg-orange-500/10' : 'border-zinc-700 bg-zinc-800/50 hover:border-zinc-600'}`}
                                >
                                    <div className="text-2xl mb-1">💳</div>
                                    <div className="font-semibold">Pay Online</div>
                                    <div className="text-xs text-zinc-500 mt-0.5">UPI, Card, Netbanking</div>
                                </button>
                                <button
                                    onClick={() => setPaymentMethod('cash')}
                                    className={`p-4 rounded-xl border-2 text-left transition-all ${paymentMethod === 'cash' ? 'border-green-500 bg-green-500/10' : 'border-zinc-700 bg-zinc-800/50 hover:border-zinc-600'}`}
                                >
                                    <div className="text-2xl mb-1">💵</div>
                                    <div className="font-semibold">Pay at Counter</div>
                                    <div className="text-xs text-zinc-500 mt-0.5">Cash after eating</div>
                                </button>
                            </div>
                            {paymentMethod === 'cash' && (
                                <div className="bg-green-500/10 border border-green-500/20 rounded-xl px-4 py-3 text-sm text-green-400">
                                    ✅ Your order will go to the kitchen immediately. Pay cash at the counter when done.
                                </div>
                            )}
                            {paymentMethod === 'online' && (
                                <div className="bg-blue-500/10 border border-blue-500/20 rounded-xl px-4 py-3 text-sm text-blue-400">
                                    🔒 Secured by Razorpay. Pay via UPI, Card, or Netbanking.
                                </div>
                            )}
                        </div>

                        {/* Coupon */}
                        <div className="card p-6 space-y-3">
                            <h2 className="font-semibold text-lg">Coupon Code</h2>
                            <div className="flex gap-2">
                                <input className="input flex-1" placeholder="Enter coupon code" value={coupon} onChange={e => setCoupon(e.target.value.toUpperCase())} />
                                <button onClick={validateCoupon} className="btn-outline py-3 px-4 text-sm">Apply</button>
                            </div>
                            {couponResult && <p className="text-green-400 text-sm">✅ Saved ₹{couponResult.discount.toFixed(2)}</p>}
                        </div>
                    </div>

                    {/* RIGHT: Order Summary */}
                    <div className="space-y-4">
                        <div className="card p-6 sticky top-6">
                            <h2 className="font-semibold text-lg mb-4">Order Summary</h2>
                            <div className="space-y-3 mb-4">
                                {items.map(item => (
                                    <div key={item.menuItemId} className="flex justify-between text-sm">
                                        <span className="text-zinc-300">{item.name} × {item.quantity}</span>
                                        <span className="font-medium">₹{(item.price * item.quantity).toFixed(2)}</span>
                                    </div>
                                ))}
                            </div>
                            <div className="border-t border-zinc-800 pt-4 space-y-2 text-sm">
                                <div className="flex justify-between text-zinc-400"><span>Subtotal</span><span>₹{subtotal().toFixed(2)}</span></div>
                                <div className="flex justify-between text-zinc-400"><span>GST (5%)</span><span>₹{tax.toFixed(2)}</span></div>
                                {discount > 0 && <div className="flex justify-between text-green-400"><span>Discount</span><span>-₹{discount.toFixed(2)}</span></div>}
                                <div className="flex justify-between font-bold text-lg pt-2 border-t border-zinc-800">
                                    <span>Total</span>
                                    <span className="text-orange-400">₹{total.toFixed(2)}</span>
                                </div>
                            </div>

                            <div className="mt-4 p-3 bg-zinc-800/50 rounded-xl flex gap-3 text-sm">
                                <span>{form.orderType === 'dine-in' ? '🪑' : '🥡'}</span>
                                <span className="text-zinc-400">
                                    <span className="text-white capitalize">{form.orderType === 'dine-in' ? 'Dine In' : 'Takeaway'}</span>
                                    {' · '}
                                    <span className={paymentMethod === 'cash' ? 'text-green-400' : 'text-blue-400'}>
                                        {paymentMethod === 'cash' ? 'Pay at Counter' : 'Pay Online'}
                                    </span>
                                </span>
                            </div>

                            <button
                                onClick={handlePlace}
                                disabled={loading}
                                className={`w-full text-lg py-4 font-semibold rounded-xl mt-4 transition-all disabled:opacity-50 ${paymentMethod === 'cash' ? 'bg-green-600 hover:bg-green-700 text-white' : 'bg-orange-500 hover:bg-orange-600 text-white'}`}
                            >
                                {loading
                                    ? '⏳ Placing order...'
                                    : paymentMethod === 'cash'
                                        ? `✅ Place Order — Pay ₹${total.toFixed(2)} at Counter`
                                        : `💳 Pay ₹${total.toFixed(2)} with Razorpay`}
                            </button>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}

export default function CheckoutPage() {
    return (
        <Suspense fallback={
            <div className="min-h-screen bg-[#0a0a0a] flex items-center justify-center">
                <div className="w-12 h-12 rounded-full border-4 border-orange-500 border-t-transparent animate-spin" />
            </div>
        }>
            <CheckoutContent />
        </Suspense>
    );
}
