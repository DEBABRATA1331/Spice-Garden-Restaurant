'use client';
import Link from 'next/link';

export default function HomePage() {
  return (
    <main className="min-h-screen bg-[#0a0a0a] text-white">
      {/* Hero */}
      <section className="relative min-h-screen flex items-center justify-center overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-orange-900/30 via-black to-black" />
        <div className="absolute inset-0 bg-[url('https://images.unsplash.com/photo-1517248135467-4c7edcad34c4?w=1920')] bg-cover bg-center opacity-10" />
        <div className="relative z-10 text-center px-4 max-w-5xl mx-auto">
          <div className="inline-flex items-center gap-2 bg-orange-500/10 border border-orange-500/20 rounded-full px-4 py-2 mb-6 text-orange-400 text-sm font-medium">
            🍽️ Complete Restaurant Management Platform
          </div>
          <h1 className="font-display text-5xl md:text-7xl font-bold mb-6 leading-tight">
            Your Restaurant,<br />
            <span className="text-gradient">Digitally Transformed</span>
          </h1>
          <p className="text-zinc-400 text-xl mb-10 max-w-2xl mx-auto">
            Online ordering, table reservations, admin dashboard, POS, analytics — everything your restaurant needs in one platform.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link href="/demo" className="btn-primary text-lg">
              🚀 View Demo Restaurant
            </Link>
            <Link href="/admin/login" className="btn-outline text-lg">
              Admin Dashboard →
            </Link>
          </div>
        </div>
      </section>

      {/* Features */}
      <section className="py-24 px-4 max-w-7xl mx-auto">
        <h2 className="font-display text-4xl font-bold text-center mb-4">Everything You Need</h2>
        <p className="text-zinc-400 text-center mb-16">A complete ecosystem for your restaurant business</p>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {features.map((f) => (
            <div key={f.title} className="card p-6 hover:border-orange-500/40 transition-colors group">
              <div className="text-4xl mb-4">{f.emoji}</div>
              <h3 className="font-semibold text-lg mb-2">{f.title}</h3>
              <p className="text-zinc-500 text-sm">{f.desc}</p>
            </div>
          ))}
        </div>
      </section>

      {/* CTA */}
      <section className="py-24 px-4">
        <div className="max-w-3xl mx-auto text-center glass rounded-3xl p-12">
          <h2 className="font-display text-4xl font-bold mb-4">Ready to Get Started?</h2>
          <p className="text-zinc-400 mb-8">Try our fully functional demo restaurant to see how it all works.</p>
          <Link href="/demo" className="btn-primary text-lg">
            Explore Demo Restaurant →
          </Link>
        </div>
      </section>
    </main>
  );
}

const features = [
  { emoji: '🛒', title: 'Online Ordering', desc: 'Full cart and checkout with Razorpay payment integration' },
  { emoji: '📅', title: 'Table Reservations', desc: 'Customers can book tables with date, time, and guest count' },
  { emoji: '📊', title: 'Admin Dashboard', desc: 'Manage orders, menu, billing, and view analytics' },
  { emoji: '💳', title: 'POS & Billing', desc: 'Generate invoices, track payments, daily sales summary' },
  { emoji: '🎁', title: 'Coupons & Loyalty', desc: 'Run promotions and reward repeat customers with points' },
  { emoji: '📱', title: 'QR Menu Ordering', desc: 'Customers scan QR code at table to order instantly' },
  { emoji: '⭐', title: 'Reviews & Ratings', desc: 'Collect and moderate customer feedback' },
  { emoji: '📈', title: 'Analytics', desc: 'Revenue charts, popular dishes, order statistics' },
  { emoji: '🔔', title: 'Real-time Updates', desc: 'Live order status tracking for customers' },
];
