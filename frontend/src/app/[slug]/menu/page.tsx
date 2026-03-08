'use client';
import { useEffect, useState, useCallback } from 'react';
import { useParams, useSearchParams } from 'next/navigation';
import Link from 'next/link';
import toast from 'react-hot-toast';
import { menuApi, restaurantApi, couponApi, authApi } from '@/lib/api';
import { useCart } from '@/lib/cartStore';

export default function MenuPage() {
    const { slug } = useParams<{ slug: string }>();
    const searchParams = useSearchParams();
    const tableNo = searchParams.get('table');
    const [restaurant, setRestaurant] = useState<any>(null);
    const [categories, setCategories] = useState<any[]>([]);
    const [items, setItems] = useState<any[]>([]);
    const [activeCategory, setActiveCategory] = useState<string>('all');
    const [search, setSearch] = useState('');
    const [vegOnly, setVegOnly] = useState(false);
    const [loading, setLoading] = useState(true);
    const { items: cartItems, addItem, updateQuantity, subtotal, totalItems, removeItem } = useCart();
    const [showCart, setShowCart] = useState(false);
    const [user, setUser] = useState<any>(null);

    const load = useCallback(async () => {
        try {
            const r = await restaurantApi.getBySlug(slug);
            setRestaurant(r.data);
            const [cats, itms] = await Promise.all([
                menuApi.getCategories(r.data.id),
                menuApi.getItems(r.data.id, { available: 'true' })
            ]);
            setCategories(cats.data);
            setItems(itms.data);

            // Try to load user if token exists
            if (localStorage.getItem('customerToken')) {
                authApi.getMe().then(res => setUser(res.data)).catch(() => localStorage.removeItem('customerToken'));
            }
        } finally { setLoading(false); }
    }, [slug]);

    useEffect(() => { load(); }, [load]);

    if (loading) return <div className="min-h-screen flex items-center justify-center"><div className="w-12 h-12 rounded-full border-4 border-orange-500 border-t-transparent animate-spin" /></div>;

    const filtered = items.filter(item => {
        if (activeCategory !== 'all' && item.categoryId !== activeCategory) return false;
        if (vegOnly && !item.isVeg) return false;
        if (search && !item.name.toLowerCase().includes(search.toLowerCase())) return false;
        return true;
    });

    const grouped = categories.reduce((acc: any, cat: any) => {
        acc[cat.id] = filtered.filter(i => i.categoryId === cat.id);
        return acc;
    }, {});

    const inCart = (id: string) => cartItems.find(i => i.menuItemId === id);

    return (
        <div className="min-h-screen bg-[#0a0a0a] text-white pb-32">
            {/* Navbar */}
            <nav className="sticky top-0 z-40 glass border-b border-zinc-800/50 px-4 py-4">
                <div className="max-w-7xl mx-auto flex items-center justify-between">
                    <Link href={`/${slug}`} className="font-bold text-lg text-orange-400">← {restaurant?.name}</Link>
                    <div className="flex items-center gap-4">
                        {tableNo && <span className="text-sm bg-orange-500/20 text-orange-400 border border-orange-500/30 rounded-full px-3 py-1 hidden sm:inline-block">Table {tableNo}</span>}

                        {user ? (
                            <div className="text-sm border border-zinc-800 bg-zinc-900 rounded-full px-3 py-1.5 flex items-center gap-2">
                                <span className="text-zinc-400">{user.name.split(' ')[0]}</span>
                                <span className="text-orange-400 font-bold bg-orange-500/10 px-2 py-0.5 rounded-full text-xs">{user.loyaltyPoints} pts</span>
                            </div>
                        ) : (
                            <Link href={`/${slug}/login?returnUrl=/${slug}/menu${tableNo ? `?table=${tableNo}` : ''}`} className="text-sm hover:text-orange-400 transition-colors">Log In</Link>
                        )}

                        <button onClick={() => setShowCart(!showCart)} className="relative btn-primary py-2 px-4 text-sm">
                            🛒 Cart {totalItems() > 0 && <span className="ml-2 bg-white text-orange-600 text-xs font-bold rounded-full px-2">{totalItems()}</span>}
                        </button>
                    </div>
                </div>
            </nav>

            <div className="max-w-7xl mx-auto px-4 py-6 flex gap-6">
                {/* Sidebar categories */}
                <aside className="hidden lg:block w-52 shrink-0 sticky top-24 h-fit">
                    <div className="card p-4 space-y-1">
                        <button onClick={() => setActiveCategory('all')} className={`w-full text-left px-3 py-2 rounded-lg text-sm transition-colors ${activeCategory === 'all' ? 'bg-orange-500 text-white' : 'text-zinc-400 hover:text-white hover:bg-zinc-800'}`}>All Items</button>
                        {categories.map(cat => (
                            <button key={cat.id} onClick={() => setActiveCategory(cat.id)} className={`w-full text-left px-3 py-2 rounded-lg text-sm transition-colors ${activeCategory === cat.id ? 'bg-orange-500 text-white' : 'text-zinc-400 hover:text-white hover:bg-zinc-800'}`}>{cat.name}</button>
                        ))}
                    </div>
                </aside>

                {/* Main content */}
                <main className="flex-1">
                    {/* Search & Filter */}
                    <div className="flex flex-col sm:flex-row gap-3 mb-6">
                        <input className="input flex-1" placeholder="🔍 Search dishes..." value={search} onChange={e => setSearch(e.target.value)} />
                        <button onClick={() => setVegOnly(!vegOnly)} className={`px-4 py-3 rounded-xl border text-sm font-medium transition-all ${vegOnly ? 'bg-green-500 border-green-500 text-white' : 'border-zinc-700 text-zinc-400 hover:border-green-500 hover:text-green-400'}`}>
                            🟢 Veg Only
                        </button>
                    </div>

                    {/* Mobile category scroll */}
                    <div className="lg:hidden flex gap-2 overflow-x-auto pb-3 mb-4 scrollbar-hide">
                        {['all', ...categories.map(c => c.id)].map((id) => (
                            <button key={id} onClick={() => setActiveCategory(id)} className={`shrink-0 px-4 py-2 rounded-full text-sm transition-colors ${activeCategory === id ? 'bg-orange-500 text-white' : 'bg-zinc-800 text-zinc-400'}`}>
                                {id === 'all' ? 'All' : categories.find(c => c.id === id)?.name}
                            </button>
                        ))}
                    </div>

                    {/* Items */}
                    {(activeCategory === 'all' ? categories : categories.filter(c => c.id === activeCategory)).map(cat => {
                        const catItems = grouped[cat.id] || [];
                        if (!catItems.length) return null;
                        return (
                            <div key={cat.id} className="mb-10">
                                <h2 className="font-display text-2xl font-bold mb-4 text-orange-400">{cat.name}</h2>
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                    {catItems.map((item: any) => {
                                        const ci = inCart(item.id);
                                        return (
                                            <div key={item.id} className="card p-4 flex gap-4 hover:border-zinc-700 transition-colors">
                                                {item.image && <img src={item.image} alt={item.name} className="w-24 h-24 rounded-xl object-cover shrink-0" />}
                                                <div className="flex-1 min-w-0">
                                                    <div className="flex items-start justify-between gap-2">
                                                        <div>
                                                            <div className="flex items-center gap-2 mb-1">
                                                                <span className={`w-3 h-3 rounded-sm border-2 ${item.isVeg ? 'border-green-500' : 'border-red-500'}`} />
                                                                {item.tags?.includes('popular') && <span className="text-xs bg-orange-500/10 text-orange-400 px-2 rounded-full border border-orange-500/20">Popular</span>}
                                                            </div>
                                                            <h3 className="font-semibold">{item.name}</h3>
                                                            {item.description && <p className="text-zinc-500 text-xs mt-1 line-clamp-2">{item.description}</p>}
                                                        </div>
                                                        <div className="text-right shrink-0">
                                                            <div className="font-bold text-orange-400">₹{item.price}</div>
                                                            {item.originalPrice && <div className="text-zinc-600 text-xs line-through">₹{item.originalPrice}</div>}
                                                        </div>
                                                    </div>
                                                    <div className="mt-3">
                                                        {ci ? (
                                                            <div className="flex items-center gap-3">
                                                                <button onClick={() => updateQuantity(item.id, ci.quantity - 1)} className="w-8 h-8 rounded-full bg-orange-500 text-white font-bold hover:bg-orange-600 flex items-center justify-center">-</button>
                                                                <span className="font-bold">{ci.quantity}</span>
                                                                <button onClick={() => updateQuantity(item.id, ci.quantity + 1)} className="w-8 h-8 rounded-full bg-orange-500 text-white font-bold hover:bg-orange-600 flex items-center justify-center">+</button>
                                                            </div>
                                                        ) : (
                                                            <button onClick={() => { addItem({ menuItemId: item.id, name: item.name, price: item.price, quantity: 1, image: item.image }, restaurant.id); toast.success('Added to cart!'); }} className="text-sm bg-orange-500/10 hover:bg-orange-500 text-orange-400 hover:text-white border border-orange-500/30 hover:border-orange-500 px-4 py-2 rounded-lg transition-all">+ Add</button>
                                                        )}
                                                    </div>
                                                </div>
                                            </div>
                                        );
                                    })}
                                </div>
                            </div>
                        );
                    })}
                </main>
            </div>

            {/* Cart Sidebar */}
            {showCart && (
                <div className="fixed inset-0 z-50 flex">
                    <div className="flex-1 bg-black/60 backdrop-blur-sm" onClick={() => setShowCart(false)} />
                    <div className="w-full max-w-sm bg-zinc-900 border-l border-zinc-800 flex flex-col overflow-y-auto">
                        <div className="p-4 border-b border-zinc-800 flex items-center justify-between">
                            <h2 className="font-bold text-lg">Your Cart</h2>
                            <button onClick={() => setShowCart(false)} className="text-zinc-400 hover:text-white text-2xl">&times;</button>
                        </div>
                        {cartItems.length === 0 ? (
                            <div className="flex-1 flex items-center justify-center text-zinc-500">Your cart is empty</div>
                        ) : (
                            <>
                                <div className="flex-1 p-4 space-y-3">
                                    {cartItems.map(item => (
                                        <div key={item.menuItemId} className="flex items-center gap-3 bg-zinc-800 rounded-xl p-3">
                                            <div className="flex-1 min-w-0">
                                                <p className="font-medium text-sm truncate">{item.name}</p>
                                                <p className="text-orange-400 text-sm">₹{item.price}</p>
                                            </div>
                                            <div className="flex items-center gap-2">
                                                <button onClick={() => updateQuantity(item.menuItemId, item.quantity - 1)} className="w-7 h-7 rounded-full bg-orange-500 text-white text-xs font-bold hover:bg-orange-600">-</button>
                                                <span className="text-sm font-bold w-4 text-center">{item.quantity}</span>
                                                <button onClick={() => updateQuantity(item.menuItemId, item.quantity + 1)} className="w-7 h-7 rounded-full bg-orange-500 text-white text-xs font-bold hover:bg-orange-600">+</button>
                                            </div>
                                            <p className="text-sm font-bold w-16 text-right">₹{item.price * item.quantity}</p>
                                        </div>
                                    ))}
                                </div>
                                <div className="p-4 border-t border-zinc-800">
                                    <div className="flex justify-between mb-4 font-bold text-lg">
                                        <span>Subtotal</span><span className="text-orange-400">₹{subtotal()}</span>
                                    </div>
                                    <Link href={`/${slug}/checkout${tableNo ? `?table=${tableNo}` : ''}`} onClick={() => setShowCart(false)} className="btn-primary w-full text-center block">Proceed to Checkout →</Link>
                                </div>
                            </>
                        )}
                    </div>
                </div>
            )}

            {/* Sticky Cart Button */}
            {totalItems() > 0 && !showCart && (
                <div className="fixed bottom-6 left-4 right-4 z-40 max-w-7xl mx-auto">
                    <button onClick={() => setShowCart(true)} className="w-full bg-orange-500 hover:bg-orange-600 text-white font-bold py-4 rounded-2xl shadow-2xl shadow-orange-500/40 flex items-center justify-between px-6 transition-all">
                        <span className="bg-white/20 rounded-full w-8 h-8 flex items-center justify-center text-sm">{totalItems()}</span>
                        <span>View Cart</span>
                        <span>₹{subtotal()}</span>
                    </button>
                </div>
            )}
        </div>
    );
}
