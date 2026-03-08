'use client';
import { useEffect, useRef, useState } from 'react';
import { menuApi } from '@/lib/api';
import toast from 'react-hot-toast';

export default function AdminMenuPage() {
    const [categories, setCategories] = useState<any[]>([]);
    const [items, setItems] = useState<any[]>([]);
    const [restaurant, setRestaurant] = useState<any>(null);
    const [modal, setModal] = useState<{ type: string; data?: any } | null>(null);
    const [form, setForm] = useState<any>({});
    const [activeTab, setActiveTab] = useState<'items' | 'categories'>('items');
    const [uploading, setUploading] = useState(false);
    const [imagePreview, setImagePreview] = useState<string>('');
    const fileRef = useRef<HTMLInputElement>(null);

    useEffect(() => {
        const r = JSON.parse(localStorage.getItem('adminRestaurant') || '{}');
        setRestaurant(r);
        if (r.id) load(r.id);
    }, []);

    const load = async (rid: string) => {
        const [cats, itms] = await Promise.all([menuApi.getCategories(rid), menuApi.getItems(rid)]);
        setCategories(cats.data);
        setItems(itms.data);
    };

    const openItem = (data?: any) => {
        const d = data || { isVeg: true, isAvailable: true, price: '', categoryId: categories[0]?.id || '' };
        setForm(d);
        setImagePreview(d.image || '');
        setModal({ type: 'item', data });
    };
    const openCat = (data?: any) => { setForm(data || { name: '' }); setModal({ type: 'cat', data }); };

    // Handle photo file selection + upload
    const handlePhotoChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (!file) return;

        // Show local preview instantly
        const localUrl = URL.createObjectURL(file);
        setImagePreview(localUrl);

        // Upload to server
        setUploading(true);
        try {
            const fd = new FormData();
            fd.append('image', file);
            const { data } = await menuApi.uploadImage(fd);
            const serverUrl = data.url || data.imageUrl || data.path;
            setForm((f: any) => ({ ...f, image: serverUrl }));
            toast.success('Photo uploaded ✅');
        } catch {
            toast.error('Photo upload failed. Check server.');
        } finally {
            setUploading(false);
        }
    };

    const saveItem = async () => {
        try {
            if (modal?.data?.id) { await menuApi.updateItem(modal.data.id, form); toast.success('Item updated'); }
            else { await menuApi.createItem({ ...form, restaurantId: restaurant.id }); toast.success('Item created'); }
            setModal(null);
            load(restaurant.id);
        } catch (e: any) { toast.error(e.response?.data?.error || 'Error'); }
    };

    const saveCat = async () => {
        try {
            if (modal?.data?.id) { await menuApi.updateCategory(modal.data.id, form); }
            else { await menuApi.createCategory({ ...form, restaurantId: restaurant.id }); }
            toast.success('Saved'); setModal(null); load(restaurant.id);
        } catch (e: any) { toast.error(e.response?.data?.error || 'Error'); }
    };

    const deleteItem = async (id: string) => { if (!confirm('Delete item?')) return; await menuApi.deleteItem(id); toast.success('Deleted'); load(restaurant?.id); };
    const deleteCat = async (id: string) => { if (!confirm('Delete category?')) return; await menuApi.deleteCategory(id); toast.success('Deleted'); load(restaurant?.id); };
    const toggle = async (id: string) => { await menuApi.toggleItem(id); load(restaurant?.id); };

    return (
        <div>
            <div className="flex items-center justify-between mb-6">
                <h1 className="font-display text-3xl font-bold">Menu Management</h1>
                <div className="flex gap-2">
                    <button onClick={() => openCat()} className="btn-outline text-sm py-2">+ Category</button>
                    <button onClick={() => openItem()} className="btn-primary text-sm py-2">+ Add Item</button>
                </div>
            </div>

            <div className="flex gap-2 mb-6">
                {(['items', 'categories'] as const).map(t => (
                    <button key={t} onClick={() => setActiveTab(t)} className={`px-4 py-2 rounded-xl text-sm font-medium capitalize transition-all ${activeTab === t ? 'bg-orange-500 text-white' : 'bg-zinc-800 text-zinc-400 hover:text-white'}`}>{t}</button>
                ))}
            </div>

            {activeTab === 'categories' && (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                    {categories.map(cat => (
                        <div key={cat.id} className="card p-4 flex items-center justify-between">
                            <div>
                                <p className="font-semibold">{cat.name}</p>
                                <p className="text-zinc-500 text-sm">{items.filter(i => i.categoryId === cat.id).length} items</p>
                            </div>
                            <div className="flex gap-2">
                                <button onClick={() => openCat(cat)} className="text-xs bg-zinc-800 hover:bg-zinc-700 px-3 py-1.5 rounded-lg">Edit</button>
                                <button onClick={() => deleteCat(cat.id)} className="text-xs bg-red-500/10 hover:bg-red-500 text-red-400 hover:text-white px-3 py-1.5 rounded-lg transition-colors">Del</button>
                            </div>
                        </div>
                    ))}
                </div>
            )}

            {activeTab === 'items' && (
                <div className="space-y-6">
                    {categories.map(cat => {
                        const catItems = items.filter(i => i.categoryId === cat.id);
                        if (!catItems.length) return null;
                        return (
                            <div key={cat.id}>
                                <h2 className="font-semibold text-orange-400 mb-3">{cat.name} <span className="text-zinc-600 text-xs font-normal">({catItems.length})</span></h2>
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                                    {catItems.map(item => (
                                        <div key={item.id} className={`card p-4 flex gap-3 transition-opacity ${!item.isAvailable ? 'opacity-40' : ''}`}>
                                            {/* Photo thumbnail */}
                                            <div className="w-16 h-16 rounded-xl overflow-hidden bg-zinc-800 shrink-0 flex items-center justify-center">
                                                {item.image
                                                    ? <img src={item.image.startsWith('http') ? item.image : `http://localhost:4000${item.image}`} alt={item.name} className="w-full h-full object-cover" />
                                                    : <span className="text-2xl">🍽️</span>}
                                            </div>
                                            <div className="flex-1 min-w-0">
                                                <div className="flex items-start justify-between gap-2">
                                                    <div className="min-w-0">
                                                        <div className="flex items-center gap-1.5 mb-0.5">
                                                            <span className={`w-2.5 h-2.5 rounded-sm border shrink-0 ${item.isVeg ? 'border-green-500' : 'border-red-500'}`} />
                                                            <p className="font-medium text-sm truncate">{item.name}</p>
                                                        </div>
                                                        <p className="text-orange-400 font-bold">₹{item.price}</p>
                                                        {item.tags && <p className="text-zinc-600 text-xs mt-0.5">{item.tags}</p>}
                                                    </div>
                                                    <div className="flex gap-1 shrink-0">
                                                        <button onClick={() => toggle(item.id)} title={item.isAvailable ? 'Mark Unavailable' : 'Mark Available'} className={`text-xs px-2 py-1 rounded-lg transition-colors ${item.isAvailable ? 'bg-green-500/10 text-green-400 hover:bg-green-500/20' : 'bg-zinc-700 text-zinc-500 hover:bg-zinc-600'}`}>{item.isAvailable ? 'ON' : 'OFF'}</button>
                                                        <button onClick={() => openItem(item)} className="text-xs bg-zinc-800 hover:bg-zinc-700 px-2 py-1 rounded-lg">Edit</button>
                                                        <button onClick={() => deleteItem(item.id)} className="text-xs bg-red-500/10 hover:bg-red-500 text-red-400 hover:text-white px-2 py-1 rounded-lg transition-colors">Del</button>
                                                    </div>
                                                </div>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        );
                    })}
                </div>
            )}

            {/* Modal */}
            {modal && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm">
                    <div className="bg-zinc-900 border border-zinc-800 rounded-2xl w-full max-w-md p-6 max-h-[92vh] overflow-y-auto">
                        <div className="flex items-center justify-between mb-5">
                            <h2 className="font-bold text-lg">{modal.data ? 'Edit' : 'Add'} {modal.type === 'item' ? 'Menu Item' : 'Category'}</h2>
                            <button onClick={() => setModal(null)} className="text-zinc-400 hover:text-white text-3xl leading-none">&times;</button>
                        </div>

                        {modal.type === 'cat' ? (
                            <div className="space-y-3">
                                <input className="input" placeholder="Category Name *" value={form.name || ''} onChange={e => setForm({ ...form, name: e.target.value })} />
                                <input className="input" placeholder="Description (optional)" value={form.description || ''} onChange={e => setForm({ ...form, description: e.target.value })} />
                                <button onClick={saveCat} className="btn-primary w-full">Save Category</button>
                            </div>
                        ) : (
                            <div className="space-y-4">
                                {/* ── PHOTO UPLOAD ── */}
                                <div>
                                    <p className="text-zinc-400 text-sm mb-2 font-medium">Dish Photo</p>
                                    <div
                                        className="relative w-full h-40 rounded-xl overflow-hidden bg-zinc-800 border-2 border-dashed border-zinc-700 hover:border-orange-500 transition-colors cursor-pointer group"
                                        onClick={() => fileRef.current?.click()}
                                    >
                                        {imagePreview ? (
                                            <>
                                                <img src={imagePreview} alt="Preview" className="w-full h-full object-cover" />
                                                <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                                                    <span className="text-white font-medium text-sm">📷 Change Photo</span>
                                                </div>
                                            </>
                                        ) : (
                                            <div className="flex flex-col items-center justify-center h-full gap-2 text-zinc-500 group-hover:text-zinc-300 transition-colors">
                                                <span className="text-4xl">📸</span>
                                                <span className="text-sm font-medium">Click to upload dish photo</span>
                                                <span className="text-xs">JPG, PNG, WEBP up to 5MB</span>
                                            </div>
                                        )}
                                        {uploading && (
                                            <div className="absolute inset-0 bg-black/60 flex items-center justify-center">
                                                <div className="w-8 h-8 border-3 border-orange-500 border-t-transparent rounded-full animate-spin" />
                                            </div>
                                        )}
                                    </div>
                                    <input ref={fileRef} type="file" accept="image/*" className="hidden" onChange={handlePhotoChange} />
                                    {/* Also allow URL input as fallback */}
                                    <input className="input mt-2 text-xs" placeholder="Or paste image URL" value={form.image || ''} onChange={e => { setForm({ ...form, image: e.target.value }); setImagePreview(e.target.value); }} />
                                </div>

                                <input className="input" placeholder="Item Name *" value={form.name || ''} onChange={e => setForm({ ...form, name: e.target.value })} />
                                <textarea className="input" rows={2} placeholder="Description (optional)" value={form.description || ''} onChange={e => setForm({ ...form, description: e.target.value })} />

                                <div className="grid grid-cols-2 gap-3">
                                    <div>
                                        <label className="text-zinc-500 text-xs mb-1 block">Price ₹ *</label>
                                        <input className="input" placeholder="e.g. 280" type="number" value={form.price || ''} onChange={e => setForm({ ...form, price: e.target.value })} />
                                    </div>
                                    <div>
                                        <label className="text-zinc-500 text-xs mb-1 block">Original ₹ (for strike)</label>
                                        <input className="input" placeholder="e.g. 350" type="number" value={form.originalPrice || ''} onChange={e => setForm({ ...form, originalPrice: e.target.value })} />
                                    </div>
                                </div>

                                <div>
                                    <label className="text-zinc-500 text-xs mb-1 block">Category *</label>
                                    <select className="input" value={form.categoryId || ''} onChange={e => setForm({ ...form, categoryId: e.target.value })}>
                                        {categories.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
                                    </select>
                                </div>

                                <div>
                                    <label className="text-zinc-500 text-xs mb-1 block">Tags (comma separated)</label>
                                    <input className="input" placeholder="popular, spicy, new, bestseller" value={form.tags || ''} onChange={e => setForm({ ...form, tags: e.target.value })} />
                                </div>

                                <div className="flex flex-wrap gap-4 pt-1">
                                    <label className="flex items-center gap-2 text-sm cursor-pointer select-none">
                                        <input type="checkbox" checked={!!form.isVeg} onChange={e => setForm({ ...form, isVeg: e.target.checked })} className="accent-green-500 w-4 h-4" />
                                        <span className="flex items-center gap-1"><span className="w-3 h-3 border border-green-500 rounded-sm inline-block" /> Veg</span>
                                    </label>
                                    <label className="flex items-center gap-2 text-sm cursor-pointer select-none">
                                        <input type="checkbox" checked={!!form.isFeatured} onChange={e => setForm({ ...form, isFeatured: e.target.checked })} className="accent-orange-500 w-4 h-4" />
                                        ⭐ Featured
                                    </label>
                                    <label className="flex items-center gap-2 text-sm cursor-pointer select-none">
                                        <input type="checkbox" checked={form.isAvailable !== false} onChange={e => setForm({ ...form, isAvailable: e.target.checked })} className="accent-blue-500 w-4 h-4" />
                                        Available
                                    </label>
                                </div>

                                <button onClick={saveItem} disabled={uploading} className="btn-primary w-full disabled:opacity-50">
                                    {uploading ? '⏳ Uploading photo...' : '💾 Save Item'}
                                </button>
                            </div>
                        )}
                    </div>
                </div>
            )}
        </div>
    );
}
