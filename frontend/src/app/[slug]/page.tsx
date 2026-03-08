'use client';
import { useEffect, useRef, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import { motion, AnimatePresence } from 'framer-motion';
import { restaurantApi } from '@/lib/api';
import FoodWallet from './FoodWallet';
import LuminousCard from './LuminousCard';

const STATS = [
    { value: '500+', label: 'Daily Orders' },
    { value: '4.9★', label: 'Avg Rating' },
    { value: '15+', label: 'Years Serving' },
    { value: '50+', label: 'Menu Items' },
];

const LUMEN_CARDS = [
    {
        icon: '🍛',
        title: "Chef's Signature",
        subtitle: 'Royal Saffron Biryani',
        description: 'Slow-cooked with aged basmati & secret masala blend',
        toggleLabel: 'Illuminate',
    },
    {
        icon: '🧀',
        title: 'Veg Excellence',
        subtitle: 'Paneer Tikka Royale',
        description: 'Marinated overnight, grilled in tandoor to perfection',
        toggleLabel: 'Illuminate',
    },
    {
        icon: '🍗',
        title: "Today's Special",
        subtitle: 'Butter Chicken Classic',
        description: 'Rich tomato gravy, fresh cream & hand-ground spices',
        toggleLabel: 'Illuminate',
    },
];

// Stagger animation container
const container = {
    hidden: {},
    show: { transition: { staggerChildren: 0.12, delayChildren: 0.1 } },
};
const fadeUp = {
    hidden: { opacity: 0, y: 28 },
    show: { opacity: 1, y: 0, transition: { type: 'spring', stiffness: 180, damping: 22 } },
};

export default function RestaurantHomePage() {
    const { slug } = useParams<{ slug: string }>();
    const router = useRouter();
    const [restaurant, setRestaurant] = useState<any>(null);
    const [mousePos, setMousePos] = useState({ x: 0, y: 0 });
    const heroRef = useRef<HTMLDivElement>(null);
    const [mounted, setMounted] = useState(false);

    useEffect(() => {
        setMounted(true);
        restaurantApi.getBySlug(slug).then(r => setRestaurant(r.data)).catch(() => { });
    }, [slug]);

    // 3D parallax on mouse
    useEffect(() => {
        const hero = heroRef.current;
        if (!hero) return;
        const handleMouse = (e: MouseEvent) => {
            const rect = hero.getBoundingClientRect();
            const cx = rect.left + rect.width / 2;
            const cy = rect.top + rect.height / 2;
            setMousePos({ x: (e.clientX - cx) / rect.width, y: (e.clientY - cy) / rect.height });
        };
        hero.addEventListener('mousemove', handleMouse);
        return () => hero.removeEventListener('mousemove', handleMouse);
    }, []);

    return (
        <div className="bg-[#060608] min-h-screen text-white overflow-x-hidden">

            {/* ─── NAVBAR ────────────────────────────────────────────── */}
            <nav
                className="fixed top-0 left-0 right-0 z-50 flex items-center justify-between px-6 py-4"
                style={{
                    background: 'linear-gradient(to bottom, rgba(6,6,8,0.97) 0%, transparent 100%)',
                    backdropFilter: 'blur(10px)',
                    mixBlendMode: 'normal',
                }}
            >
                <div className="flex items-center gap-3">
                    {restaurant?.logo && <img src={restaurant.logo} alt="" className="w-10 h-10 rounded-xl object-cover" />}
                    <div>
                        <p className="font-display font-bold text-lg leading-tight">{restaurant?.name || 'Restaurant'}</p>
                        <p className="text-orange-400 text-xs">{restaurant?.tagline || 'Fine Dining Experience'}</p>
                    </div>
                    {/* Live dot */}
                    <span className="w-2 h-2 bg-red-500 rounded-full animate-pulse ml-1" title="Open now" />
                </div>

                <div className="hidden md:flex items-center gap-6 text-sm">
                    {[['Menu', `/${slug}/menu`], ['Reserve', `/${slug}/reserve`], ['Reviews', `/${slug}/reviews`]].map(([label, href]) => (
                        <Link key={label} href={href} className="text-zinc-400 hover:text-white transition-colors font-medium" style={{ transition: 'color 0.2s' }}>
                            {label}
                        </Link>
                    ))}
                </div>

                <Link href={`/${slug}/menu`} className="btn-primary text-sm py-2.5 px-5" style={{ fontFamily: "'Outfit', sans-serif", fontWeight: 700 }}>
                    Order Now 🍽️
                </Link>
            </nav>

            {/* ─── 3D HERO SECTION ───────────────────────────────────── */}
            <section ref={heroRef} className="relative min-h-screen flex items-center justify-center overflow-hidden" style={{ perspective: '1200px' }}>

                {/* Cinematic gradient bg */}
                <div className="absolute inset-0" style={{
                    background: 'radial-gradient(ellipse 90% 70% at 50% -5%, rgba(232,93,38,0.22) 0%, transparent 65%), radial-gradient(ellipse 60% 80% at 80% 80%, rgba(245,166,35,0.12) 0%, transparent 55%), #060608',
                }} />

                {/* Large background typography (cinematic) */}
                <div className="absolute inset-0 flex items-center justify-center pointer-events-none overflow-hidden select-none">
                    <span style={{
                        fontFamily: "'Outfit', sans-serif", fontWeight: 900,
                        fontSize: 'clamp(8rem, 22vw, 22rem)',
                        color: 'rgba(255,255,255,0.025)',
                        letterSpacing: '-0.04em', lineHeight: 1,
                        userSelect: 'none', whiteSpace: 'nowrap',
                    }}>
                        DINE
                    </span>
                </div>

                {/* Subtle grid */}
                <div className="absolute inset-0 opacity-[0.04]" style={{
                    backgroundImage: 'linear-gradient(rgba(255,255,255,0.5) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.5) 1px, transparent 1px)',
                    backgroundSize: '80px 80px',
                }} />

                {/* Floating orbs */}
                <div className="absolute w-[500px] h-[500px] rounded-full pointer-events-none" style={{
                    background: 'radial-gradient(circle, rgba(232,93,38,0.18) 0%, transparent 70%)',
                    top: '5%', left: '-10%',
                    animation: 'floatOrb 7s ease-in-out infinite',
                    filter: 'blur(50px)',
                }} />
                <div className="absolute w-80 h-80 rounded-full pointer-events-none" style={{
                    background: 'radial-gradient(circle, rgba(245,166,35,0.12) 0%, transparent 70%)',
                    bottom: '10%', right: '-5%',
                    animation: 'floatOrb 9s ease-in-out infinite reverse',
                    filter: 'blur(35px)',
                }} />

                {/* Hero content */}
                <div className="relative z-10 max-w-7xl mx-auto px-6 grid grid-cols-1 lg:grid-cols-2 gap-16 items-center pt-24 pb-16 w-full">

                    {/* ─ Left: CINEMATIC TEXT ─ */}
                    <motion.div
                        variants={container}
                        initial="hidden"
                        animate={mounted ? "show" : "hidden"}
                        style={{ transform: `translate(${mousePos.x * -10}px, ${mousePos.y * -10}px)`, transition: 'transform 0.18s ease-out' }}
                    >
                        {/* Live badge */}
                        <motion.div variants={fadeUp} className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full border border-orange-500/30 bg-orange-500/10 text-orange-400 text-xs font-medium mb-6"
                            style={{ fontFamily: "'Outfit', sans-serif", letterSpacing: '0.08em' }}>
                            <span className="w-1.5 h-1.5 bg-orange-400 rounded-full animate-pulse" />
                            Open Now · Accepting Orders
                        </motion.div>

                        {/* Cinematic H1 */}
                        <motion.h1
                            variants={fadeUp}
                            className="mb-6 leading-none"
                            style={{
                                fontFamily: "'Outfit', sans-serif",
                                fontSize: 'clamp(3.2rem, 8vw, 6.5rem)',
                                fontWeight: 900,
                                letterSpacing: '-0.04em',
                                lineHeight: 0.95,
                            }}
                        >
                            {restaurant?.name?.split(' ').map((word: string, i: number) => (
                                <span key={i} className={i % 2 !== 0 ? 'text-gradient' : ''}>{word}{' '}</span>
                            )) || (
                                    <>
                                        <span>Spice</span>{' '}
                                        <span className="text-gradient">Garden</span>
                                    </>
                                )}
                        </motion.h1>

                        <motion.p variants={fadeUp} className="text-zinc-400 text-xl leading-relaxed mb-8 max-w-lg" style={{ fontWeight: 300 }}>
                            {restaurant?.description || "Authentic flavors, royal recipes. Every dish tells the story of India's rich culinary heritage crafted with love."}
                        </motion.p>

                        <motion.div variants={fadeUp} className="flex flex-wrap gap-4">
                            <Link href={`/${slug}/menu`} className="btn-primary text-base px-8 py-4 flex items-center gap-2"
                                style={{ fontFamily: "'Outfit', sans-serif", fontWeight: 700 }}>
                                🍽️ Explore Menu <span className="text-orange-200 text-sm">→</span>
                            </Link>
                            <Link href={`/${slug}/reserve`} className="btn-outline text-base px-8 py-4"
                                style={{ fontFamily: "'Outfit', sans-serif", fontWeight: 600 }}>
                                📅 Book Table
                            </Link>
                        </motion.div>

                        {/* Stats */}
                        <motion.div variants={fadeUp} className="grid grid-cols-4 gap-4 mt-12 pt-8 border-t border-zinc-800/60">
                            {STATS.map(s => (
                                <div key={s.label} className="text-center">
                                    <p className="text-2xl font-bold text-gradient" style={{ fontFamily: "'Outfit', sans-serif", fontWeight: 900 }}>{s.value}</p>
                                    <p className="text-zinc-500 text-xs mt-1">{s.label}</p>
                                </div>
                            ))}
                        </motion.div>
                    </motion.div>

                    {/* ─ Right: FOOD WALLET ─ */}
                    <motion.div
                        initial={{ opacity: 0, x: 60, rotateY: -15 }}
                        animate={mounted ? { opacity: 1, x: 0, rotateY: 0 } : {}}
                        transition={{ type: 'spring', stiffness: 120, damping: 20, delay: 0.3 }}
                        className="relative h-[540px] flex items-center justify-center"
                        style={{
                            transform: `rotateY(${mousePos.x * 6}deg) rotateX(${-mousePos.y * 4}deg)`,
                            transition: 'transform 0.18s ease-out',
                            perspective: '1200px',
                        }}
                    >
                        <FoodWallet slug={slug} restaurantName={restaurant?.name} />
                    </motion.div>
                </div>

                {/* Scroll indicator */}
                <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ delay: 1.4 }}
                    className="absolute bottom-8 left-1/2 -translate-x-1/2 flex flex-col items-center gap-2 text-zinc-600 text-xs"
                >
                    <span style={{ letterSpacing: '0.15em', fontFamily: "'Outfit', sans-serif", fontWeight: 300 }}>SCROLL TO EXPLORE</span>
                    <div className="w-5 h-8 border border-zinc-700 rounded-full flex justify-center pt-1">
                        <div className="w-1 h-2 bg-orange-500 rounded-full" style={{ animation: 'scrollDot 1.5s ease-in-out infinite' }} />
                    </div>
                </motion.div>
            </section>

            {/* ─── OFFERS TICKER ─────────────────────────────────────── */}
            {restaurant?.offers && (
                <section className="py-5 px-4" style={{
                    background: 'linear-gradient(135deg, rgba(232,93,38,0.15) 0%, rgba(245,166,35,0.1) 100%)',
                    borderTop: '1px solid rgba(232,93,38,0.2)',
                    borderBottom: '1px solid rgba(232,93,38,0.2)',
                }}>
                    <div className="max-w-7xl mx-auto text-center">
                        <p className="text-orange-300 font-semibold text-sm tracking-wider" style={{ fontFamily: "'Outfit', sans-serif" }}>🎁 {restaurant.offers}</p>
                    </div>
                </section>
            )}

            {/* ─── LUMINOUS CHEF'S SPECIAL SECTION ──────────────────── */}
            <section className="py-24 px-6 relative overflow-hidden">
                {/* Section BG */}
                <div className="absolute inset-0" style={{
                    background: 'radial-gradient(ellipse 70% 50% at 50% 50%, rgba(30,20,10,0.8) 0%, #060608 70%)',
                }} />

                <div className="relative z-10 max-w-7xl mx-auto">
                    {/* Cinematic section header */}
                    <motion.div
                        initial={{ opacity: 0, y: 30 }}
                        whileInView={{ opacity: 1, y: 0 }}
                        viewport={{ once: true, margin: '-80px' }}
                        transition={{ type: 'spring', stiffness: 150, damping: 20 }}
                        className="text-center mb-16"
                    >
                        <p className="text-orange-400 text-xs font-bold tracking-[0.3em] uppercase mb-4"
                            style={{ fontFamily: "'Outfit', sans-serif" }}>
                            ✦ Culinary Highlights ✦
                        </p>
                        <h2 style={{
                            fontFamily: "'Outfit', sans-serif",
                            fontSize: 'clamp(2.8rem, 7vw, 6rem)',
                            fontWeight: 900,
                            letterSpacing: '-0.04em',
                            lineHeight: 1,
                            marginBottom: '1rem',
                        }}>
                            Chef's <span className="text-gradient">Spotlight</span>
                        </h2>
                        <p className="text-zinc-500 max-w-lg mx-auto" style={{ fontWeight: 300 }}>
                            Hover over a card. Toggle the light. Discover the craftsmanship behind each dish.
                        </p>
                    </motion.div>

                    {/* Luminous cards grid */}
                    <div className="flex flex-wrap justify-center gap-8">
                        {LUMEN_CARDS.map((card, i) => (
                            <motion.div
                                key={i}
                                initial={{ opacity: 0, y: 40, scale: 0.95 }}
                                whileInView={{ opacity: 1, y: 0, scale: 1 }}
                                viewport={{ once: true, margin: '-60px' }}
                                transition={{ type: 'spring', stiffness: 160, damping: 22, delay: i * 0.15 }}
                            >
                                <LuminousCard {...card} />
                            </motion.div>
                        ))}
                    </div>
                </div>
            </section>

            {/* ─── FEATURED MENU TEASER ──────────────────────────────── */}
            <section className="py-24 px-6">
                <div className="max-w-7xl mx-auto">
                    <motion.div
                        initial={{ opacity: 0, y: 30 }}
                        whileInView={{ opacity: 1, y: 0 }}
                        viewport={{ once: true }}
                        transition={{ type: 'spring', stiffness: 150, damping: 20 }}
                        className="text-center mb-14"
                    >
                        <p className="text-orange-400 text-xs font-bold tracking-[0.3em] uppercase mb-4"
                            style={{ fontFamily: "'Outfit', sans-serif" }}>
                            Our Signature
                        </p>
                        <h2 style={{
                            fontFamily: "'Outfit', sans-serif",
                            fontSize: 'clamp(2.4rem, 6vw, 5rem)',
                            fontWeight: 900,
                            letterSpacing: '-0.03em',
                            marginBottom: '1rem',
                        }}>
                            Crafted with <span className="text-gradient">Passion</span>
                        </h2>
                        <p className="text-zinc-500 max-w-xl mx-auto" style={{ fontWeight: 300 }}>
                            Every dish is a masterpiece, made from the finest ingredients with time-honoured recipes.
                        </p>
                    </motion.div>

                    {/* Menu cards grid – adapted from original */}
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-6 mb-10">
                        {[
                            { img: '/food-biryani.png', name: 'Royal Biryani', price: '₹350', tag: '🏆 Bestseller' },
                            { img: '/food-paneer.png', name: 'Paneer Tikka', price: '₹280', tag: '🌿 Veg' },
                            { img: '/food-butter-chicken.png', name: 'Butter Chicken', price: '₹320', tag: '🔥 Spicy' },
                            { img: '/food-naan.png', name: 'Garlic Naan', price: '₹80', tag: '🥖 Fresh' },
                        ].map((card, i) => (
                            <motion.div
                                key={i}
                                initial={{ opacity: 0, y: 30 }}
                                whileInView={{ opacity: 1, y: 0 }}
                                viewport={{ once: true }}
                                transition={{ type: 'spring', stiffness: 160, damping: 22, delay: i * 0.1 }}
                                className="group cursor-pointer"
                                onClick={() => router.push(`/${slug}/menu`)}
                            >
                                <div className="relative rounded-2xl overflow-hidden mb-3" style={{ height: '200px', boxShadow: '0 20px 50px rgba(0,0,0,0.5)' }}>
                                    <img src={card.img} alt={card.name} className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110" />
                                    <div className="absolute inset-0 transition-opacity duration-300" style={{ background: 'linear-gradient(to top, rgba(6,6,8,0.85) 0%, transparent 60%)' }} />
                                    <div className="absolute top-3 right-3">
                                        <span className="px-2 py-1 rounded-full text-xs font-medium" style={{ background: 'rgba(232,93,38,0.92)', backdropFilter: 'blur(4px)', fontFamily: "'Outfit', sans-serif" }}>
                                            {card.tag}
                                        </span>
                                    </div>
                                    <div className="absolute bottom-3 left-3">
                                        <p className="font-bold text-sm" style={{ fontFamily: "'Outfit', sans-serif" }}>{card.name}</p>
                                        <p className="text-orange-400 text-sm font-bold">{card.price}</p>
                                    </div>
                                </div>
                            </motion.div>
                        ))}
                    </div>

                    <div className="text-center">
                        <Link href={`/${slug}/menu`} className="btn-primary text-base px-10 py-4"
                            style={{ fontFamily: "'Outfit', sans-serif", fontWeight: 700 }}>
                            View Full Menu →
                        </Link>
                    </div>
                </div>
            </section>

            {/* ─── EXPERIENCE SECTION ────────────────────────────────── */}
            <section className="py-32 px-6 relative overflow-hidden bg-[#0a0a0a]">
                {/* Subtle animated background grid */}
                <div className="absolute inset-0 opacity-[0.03]" style={{
                    backgroundImage: 'linear-gradient(rgba(255,255,255,1) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,1) 1px, transparent 1px)',
                    backgroundSize: '40px 40px',
                    maskImage: 'radial-gradient(ellipse at center, black 40%, transparent 80%)',
                    WebkitMaskImage: 'radial-gradient(ellipse at center, black 40%, transparent 80%)'
                }} />

                <div className="max-w-7xl mx-auto relative z-10">
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        whileInView={{ opacity: 1, y: 0 }}
                        viewport={{ once: true }}
                        className="text-center mb-20"
                    >
                        <h2 className="font-display text-4xl md:text-5xl mb-6 font-bold text-transparent bg-clip-text bg-gradient-to-r from-white via-zinc-200 to-zinc-500 tracking-tight">The Experience</h2>
                        <p className="text-zinc-400 max-w-2xl mx-auto text-lg font-light">Discover what makes dining with us an unforgettable journey of taste and ambiance.</p>
                    </motion.div>

                    <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                        {[
                            { icon: '🫕', title: 'Authentic Recipes', desc: "Made with traditional spices sourced directly from India's finest farms. Every bite is a journey." },
                            { icon: '👨‍🍳', title: 'Expert Chefs', desc: 'Our seasoned chefs bring 20+ years of culinary artistry to each dish, every single day.' },
                            { icon: '🚀', title: 'Quick Service', desc: 'From kitchen to table in minutes. We respect your time as much as we respect our craft.' },
                        ].map((item, i) => (
                            <motion.div
                                key={i}
                                initial={{ opacity: 0, y: 40 }}
                                whileInView={{ opacity: 1, y: 0 }}
                                viewport={{ once: true, margin: "-50px" }}
                                transition={{ type: 'spring', stiffness: 100, damping: 20, delay: i * 0.15 }}
                                whileHover={{ y: -8, scale: 1.02 }}
                                className="relative group rounded-3xl p-[1px] overflow-hidden bg-zinc-900/50"
                            >
                                {/* Animated border gradient using Framer Motion */}
                                <motion.div
                                    animate={{ backgroundPosition: ['0% 50%', '100% 50%', '0% 50%'] }}
                                    transition={{ duration: 3, ease: 'linear', repeat: Infinity }}
                                    className="absolute inset-0 bg-[length:200%_200%] bg-gradient-to-r from-transparent via-orange-500/50 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-700"
                                />

                                {/* Inner Card backdrop */}
                                <div className="relative h-full bg-[#0a0a0a]/90 backdrop-blur-2xl rounded-[23px] p-8 lg:p-10 border border-white/5 group-hover:border-transparent transition-colors duration-300 z-10 overflow-hidden flex flex-col">

                                    {/* Inner spotlight glow */}
                                    <div className="absolute -top-32 -right-32 w-64 h-64 bg-orange-500/10 rounded-full blur-[60px] group-hover:bg-orange-500/20 group-hover:scale-150 transition-all duration-700 ease-out" />

                                    {/* Interactive Icon */}
                                    <div className="text-6xl mb-8 filter drop-shadow-[0_0_15px_rgba(255,255,255,0.1)] transform-gpu origin-bottom transition-transform duration-500 group-hover:scale-110 group-hover:-rotate-12">
                                        {item.icon}
                                    </div>

                                    <h3 className="font-bold text-2xl mb-4 font-display text-white relative z-10">{item.title}</h3>
                                    <p className="text-zinc-400 group-hover:text-zinc-300 leading-relaxed text-sm relative z-10 transition-colors duration-300 flex-1">{item.desc}</p>

                                    {/* Bottom glowing line on hover */}
                                    <div className="absolute bottom-0 left-10 right-10 h-px bg-gradient-to-r from-transparent via-orange-500/50 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-700" />
                                </div>
                            </motion.div>
                        ))}
                    </div>
                </div>
            </section>

            {/* ─── LOCATION ──────────────────────────────────────────── */}
            <section className="py-16 px-6">
                <div className="max-w-5xl mx-auto text-center">
                    <h2 className="font-bold text-4xl mb-4" style={{ fontFamily: "'Outfit', sans-serif" }}>Find Us</h2>
                    <p className="text-zinc-500 mb-8">{restaurant?.address || 'Visit us for an unforgettable dining experience'}</p>
                    {restaurant?.mapLink && (
                        <a href={restaurant.mapLink} target="_blank" rel="noopener noreferrer"
                            className="inline-flex items-center gap-2 px-8 py-3 rounded-xl border border-zinc-700 hover:border-orange-500 transition-colors text-zinc-400 hover:text-white">
                            📍 Open in Google Maps
                        </a>
                    )}
                </div>
            </section>

            {/* ─── FOOTER ────────────────────────────────────────────── */}
            <footer style={{ background: 'linear-gradient(to bottom, #0a0a0f 0%, #060608 100%)', borderTop: '1px solid rgba(255,255,255,0.05)' }}>
                <div className="max-w-7xl mx-auto px-6 py-16">
                    <div className="grid grid-cols-1 md:grid-cols-4 gap-10 mb-12">
                        <div className="md:col-span-1">
                            <div className="flex items-center gap-3 mb-4 group">
                                <div className="relative w-12 h-12 rounded-2xl overflow-hidden bg-gradient-to-br from-orange-400 to-orange-600 flex items-center justify-center shadow-lg shadow-orange-500/20 group-hover:rotate-[360deg] transition-transform duration-1000">
                                    <img
                                        src="/logo.png"
                                        alt="Logo"
                                        className="w-full h-full object-cover mix-blend-overlay opacity-90"
                                    />
                                    <div className="absolute inset-0 bg-gradient-to-tr from-white/0 via-white/30 to-white/0 -translate-x-full group-hover:animate-[logoShine_1s_infinite]" />
                                </div>
                                <div>
                                    <p className="font-bold text-lg" style={{ fontFamily: "'Outfit', sans-serif" }}>{restaurant?.name || 'Restaurant'}</p>
                                    <p className="text-orange-400 text-xs tracking-widest uppercase font-bold">Premium Dining</p>
                                </div>
                            </div>
                            <p className="text-zinc-500 text-sm leading-relaxed mb-5">
                                {restaurant?.description?.slice(0, 100) || 'Authentic flavors crafted with passion and tradition.'}
                            </p>
                            <div className="flex gap-3">
                                {[{ icon: '📘', label: 'Facebook' }, { icon: '📸', label: 'Instagram' }, { icon: '🐦', label: 'Twitter' }, { icon: '▶️', label: 'YouTube' }].map(s => (
                                    <a key={s.label} href="#" aria-label={s.label} className="w-10 h-10 rounded-xl flex items-center justify-center text-lg transition-all hover:scale-110"
                                        style={{ background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.08)' }}>
                                        {s.icon}
                                    </a>
                                ))}
                            </div>
                        </div>

                        <div>
                            <p className="font-bold text-white mb-5 text-sm tracking-wide uppercase" style={{ fontFamily: "'Outfit', sans-serif" }}>Quick Links</p>
                            <ul className="space-y-3">
                                {[['🍽️ Menu', `/${slug}/menu`], ['📅 Reserve a Table', `/${slug}/reserve`], ['📦 Track Order', '#'], ['⭐ Reviews', `/${slug}/reviews`]].map(([label, href]) => (
                                    <li key={label}><Link href={href} className="text-zinc-500 hover:text-orange-400 text-sm transition-colors">{label}</Link></li>
                                ))}
                            </ul>
                        </div>

                        <div>
                            <p className="font-bold text-white mb-5 text-sm tracking-wide uppercase" style={{ fontFamily: "'Outfit', sans-serif" }}>Contact Us</p>
                            <ul className="space-y-3 text-sm">
                                {restaurant?.phone && <li className="flex items-start gap-2 text-zinc-500">📞 <a href={`tel:${restaurant.phone}`} className="hover:text-orange-400">{restaurant.phone}</a></li>}
                                {restaurant?.email && <li className="flex items-start gap-2 text-zinc-500">📧 <a href={`mailto:${restaurant.email}`} className="hover:text-orange-400">{restaurant.email}</a></li>}
                                {restaurant?.address && <li className="flex items-start gap-2 text-zinc-500">📍 <span>{restaurant.address}</span></li>}
                            </ul>
                        </div>

                        <div>
                            <p className="font-bold text-white mb-5 text-sm tracking-wide uppercase" style={{ fontFamily: "'Outfit', sans-serif" }}>Hours & More</p>
                            <ul className="space-y-2 text-sm text-zinc-500 mb-6">
                                <li className="flex justify-between"><span>Mon – Fri</span><span className="text-zinc-400">11 AM – 11 PM</span></li>
                                <li className="flex justify-between"><span>Sat – Sun</span><span className="text-zinc-400">10 AM – 12 AM</span></li>
                            </ul>
                            <div className="p-4 rounded-xl border border-dashed border-zinc-800 text-center bg-zinc-900/30">
                                <p className="text-zinc-600 text-[10px] font-bold uppercase tracking-widest mb-3">Staff Access</p>
                                <div className="space-y-2">
                                    <Link href="/admin/login" className="w-full text-orange-400 hover:text-orange-300 text-sm font-medium transition-colors flex items-center justify-center gap-2 bg-orange-500/10 hover:bg-orange-500/20 py-2 rounded-lg">
                                        🔐 Admin Portal
                                    </Link>
                                    <Link href="/admin/login?role=waiter" className="w-full text-zinc-400 hover:text-white text-sm font-medium transition-colors flex items-center justify-center gap-2 bg-zinc-800/50 hover:bg-zinc-700 py-2 rounded-lg">
                                        🧑‍🍳 Waiter Login
                                    </Link>
                                </div>
                            </div>
                        </div>
                    </div>

                    <div className="border-t border-zinc-800/50 pt-8 flex flex-col md:flex-row items-center justify-between gap-4 text-xs text-zinc-600">
                        <p>© {new Date().getFullYear()} {restaurant?.name || 'Restaurant'}. All rights reserved.</p>
                        <p>Powered by <span className="text-orange-400 font-medium">RestaurantOS</span> · Built with ❤️</p>
                    </div>
                </div>
            </footer>

            {/* ─── GLOBAL KEYFRAMES ──────────────────────────────────── */}
            <style>{`
                @keyframes logoShine {
                    0%   { transform: translateX(-100%) skewX(-15deg); }
                    100% { transform: translateX(200%) skewX(-15deg); }
                }
                @keyframes floatOrb {
                    0%, 100% { transform: translateY(0px) scale(1); }
                    50%       { transform: translateY(-24px) scale(1.04); }
                }
                @keyframes scrollDot {
                    0%   { transform: translateY(0); opacity: 1; }
                    100% { transform: translateY(14px); opacity: 0; }
                }
                @keyframes spin {
                    from { transform: rotate(0deg); }
                    to   { transform: rotate(360deg); }
                }
            `}</style>
        </div>
    );
}
