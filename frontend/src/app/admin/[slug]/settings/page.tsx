'use client';
import { useEffect, useState } from 'react';
import { restaurantApi, qrApi } from '@/lib/api';
import toast from 'react-hot-toast';

export default function AdminSettingsPage() {
    const [restaurant, setRestaurant] = useState<any>(null);
    const [form, setForm] = useState<any>({});
    const [qrCode, setQrCode] = useState('');
    const [loading, setLoading] = useState(false);

    useEffect(() => {
        const r = JSON.parse(localStorage.getItem('adminRestaurant') || '{}');
        setRestaurant(r);
        setForm({ name: r.name, description: r.description, address: r.address, phone: r.phone, email: r.email, website: r.website, mapLink: r.mapLink, logo: r.logo, coverImage: r.coverImage });
    }, []);

    const save = async () => {
        setLoading(true);
        try {
            const { data } = await restaurantApi.update(restaurant.id, form);
            localStorage.setItem('adminRestaurant', JSON.stringify(data));
            toast.success('Settings saved!');
        } catch { toast.error('Save failed'); } finally { setLoading(false); }
    };

    const generateQR = async () => {
        try {
            const { data } = await qrApi.getMenuQR(restaurant.slug);
            setQrCode(data.qrCode);
        } catch { toast.error('QR generation failed'); }
    };

    return (
        <div className="max-w-2xl">
            <h1 className="font-display text-3xl font-bold mb-8">Restaurant Settings</h1>
            <div className="space-y-6">
                <div className="card p-6 space-y-4">
                    <h2 className="font-semibold text-lg">Basic Information</h2>
                    <input className="input" placeholder="Restaurant Name" value={form.name || ''} onChange={e => setForm({ ...form, name: e.target.value })} />
                    <textarea className="input" rows={3} placeholder="Description" value={form.description || ''} onChange={e => setForm({ ...form, description: e.target.value })} />
                    <input className="input" placeholder="Address" value={form.address || ''} onChange={e => setForm({ ...form, address: e.target.value })} />
                    <div className="grid grid-cols-2 gap-4">
                        <input className="input" placeholder="Phone" value={form.phone || ''} onChange={e => setForm({ ...form, phone: e.target.value })} />
                        <input className="input" placeholder="Email" value={form.email || ''} onChange={e => setForm({ ...form, email: e.target.value })} />
                    </div>
                    <input className="input" placeholder="Website URL" value={form.website || ''} onChange={e => setForm({ ...form, website: e.target.value })} />
                    <input className="input" placeholder="Google Maps Link" value={form.mapLink || ''} onChange={e => setForm({ ...form, mapLink: e.target.value })} />
                </div>

                <div className="card p-6 space-y-4">
                    <h2 className="font-semibold text-lg">Images</h2>
                    <input className="input" placeholder="Logo URL" value={form.logo || ''} onChange={e => setForm({ ...form, logo: e.target.value })} />
                    {form.logo && <img src={form.logo} alt="Logo Preview" className="w-16 h-16 rounded-xl object-cover" />}
                    <input className="input" placeholder="Cover Image URL" value={form.coverImage || ''} onChange={e => setForm({ ...form, coverImage: e.target.value })} />
                    {form.coverImage && <img src={form.coverImage} alt="Cover Preview" className="w-full h-32 rounded-xl object-cover" />}
                </div>

                <button onClick={save} disabled={loading} className="btn-primary w-full py-4">
                    {loading ? '⏳ Saving...' : '💾 Save Settings'}
                </button>

                {/* QR Code */}
                <div className="card p-6">
                    <h2 className="font-semibold text-lg mb-4">QR Code Menu</h2>
                    <p className="text-zinc-500 text-sm mb-4">Generate a QR code for your menu. Customers scan it to order directly from their phone.</p>
                    <button onClick={generateQR} className="btn-outline mb-4">📱 Generate QR Code</button>
                    {qrCode && (
                        <div className="flex flex-col items-center gap-3">
                            <img src={qrCode} alt="QR Code" className="w-48 h-48 bg-white rounded-xl p-2" />
                            <a href={qrCode} download="menu-qr.png" className="text-sm text-orange-400 hover:text-orange-300">⬇️ Download QR Code</a>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}
