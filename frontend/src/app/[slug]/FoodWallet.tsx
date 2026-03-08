'use client';
import { useState } from 'react';
import { motion } from 'framer-motion';
import Link from 'next/link';

interface FoodCardData {
    id: string;
    name: string;
    price: string;
    tag: string;
    emoji: string;
    gradient: string;
    accentColor: string;
    textColor: string;
}

const FOOD_CARDS: FoodCardData[] = [
    {
        id: '1',
        name: 'Royal Biryani',
        price: '₹350',
        tag: '🏆 Bestseller',
        emoji: '🍛',
        gradient: 'linear-gradient(135deg, #D4AC4A 0%, #A67C2A 40%, #7C5A14 100%)',
        accentColor: '#F5C842',
        textColor: '#3D2800',
    },
    {
        id: '2',
        name: 'Paneer Tikka',
        price: '₹280',
        tag: '🌿 Veg Special',
        emoji: '🧀',
        gradient: 'linear-gradient(135deg, #C8C8C8 0%, #8E8E8E 40%, #5A5A5A 100%)',
        accentColor: '#E8E8E8',
        textColor: '#1A1A1A',
    },
    {
        id: '3',
        name: 'Butter Chicken',
        price: '₹320',
        tag: '🔥 Chef\'s Pick',
        emoji: '🍗',
        gradient: 'linear-gradient(135deg, #E8925A 0%, #B85E28 40%, #7C3610 100%)',
        accentColor: '#F5A623',
        textColor: '#2A0E00',
    },
];

function FoodCard({
    data,
    index,
    isActive,
    isHovered,
    onClick,
    totalCards,
}: {
    data: FoodCardData;
    index: number;
    isActive: boolean;
    isHovered: boolean;
    onClick: () => void;
    totalCards: number;
}) {
    // Y offset logic: resting → peek → fan → active (fully up)
    const restY = index * 16;
    const hoverY = -140 + index * 55;
    const activeY = 40;

    const yOffset = isActive ? activeY : isHovered ? hoverY : restY;
    const zIndex = isActive ? 50 : isHovered ? 30 - index : 10 + index;
    const scale = isActive ? 1.06 : 1 - (totalCards - 1 - index) * 0.04;
    const brightness = isActive ? 1.1 : isHovered ? 1 : 0.55 + index * 0.15;

    return (
        <motion.div
            onClick={(e) => { e.stopPropagation(); onClick(); }}
            initial={false}
            animate={{
                y: yOffset,
                scale,
                zIndex,
                filter: `brightness(${brightness})`,
            }}
            transition={{ type: 'spring', stiffness: 260, damping: 22, mass: 0.8 }}
            className="absolute left-0 w-full cursor-pointer"
            style={{
                top: '-40px',
                height: '190px',
                borderRadius: '16px',
                background: data.gradient,
                border: '1px solid rgba(255,255,255,0.15)',
                boxShadow: isActive
                    ? `0 30px 80px rgba(0,0,0,0.8), 0 0 0 1px rgba(255,255,255,0.15), inset 0 1px 0 rgba(255,255,255,0.3)`
                    : `0 15px 40px rgba(0,0,0,0.6), inset 0 1px 0 rgba(255,255,255,0.2)`,
                overflow: 'hidden',
                transformOrigin: 'bottom center',
            }}
        >
            {/* Metallic noise texture */}
            <div style={{
                position: 'absolute', inset: 0, opacity: 0.3,
                backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 256 256' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noise'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noise)' opacity='1'/%3E%3C/svg%3E")`,
                mixBlendMode: 'overlay',
            }} />

            {/* Shine sweep */}
            <div style={{
                position: 'absolute', inset: 0,
                background: 'linear-gradient(135deg, transparent 30%, rgba(255,255,255,0.25) 50%, transparent 70%)',
                pointerEvents: 'none',
            }} />

            <div style={{ position: 'relative', padding: '16px 18px', height: '100%', display: 'flex', flexDirection: 'column', justifyContent: 'space-between', fontFamily: 'monospace' }}>
                {/* Top row */}
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                    {/* Chip simulation */}
                    <div style={{
                        width: '38px', height: '28px', borderRadius: '5px',
                        background: 'rgba(0,0,0,0.2)', border: '1px solid rgba(0,0,0,0.25)',
                        display: 'flex', alignItems: 'center', justifyContent: 'center',
                    }}>
                        <div style={{ width: '28px', height: '18px', border: '1px solid rgba(0,0,0,0.3)', borderRadius: '3px' }} />
                    </div>
                    <span style={{ fontSize: '28px' }}>{data.emoji}</span>
                </div>

                {/* Bottom content */}
                <div>
                    {/* Tag pill */}
                    <div style={{
                        display: 'inline-block', fontSize: '9px', padding: '3px 8px',
                        borderRadius: '20px', background: 'rgba(0,0,0,0.2)', color: data.textColor,
                        marginBottom: '6px', fontWeight: 700, letterSpacing: '0.05em',
                    }}>
                        {data.tag}
                    </div>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end' }}>
                        <div>
                            <div style={{ fontSize: '8px', color: data.textColor, opacity: 0.65, textTransform: 'uppercase', letterSpacing: '0.15em', marginBottom: '3px' }}>Dish Name</div>
                            <div style={{ fontSize: '14px', fontWeight: 800, color: data.textColor, letterSpacing: '0.04em', textTransform: 'uppercase' }}>{data.name}</div>
                        </div>
                        <div style={{ textAlign: 'right' }}>
                            <div style={{ fontSize: '8px', color: data.textColor, opacity: 0.65, textTransform: 'uppercase', letterSpacing: '0.15em', marginBottom: '3px' }}>Price</div>
                            <div style={{ fontSize: '16px', fontWeight: 900, color: data.textColor }}>{data.price}</div>
                        </div>
                    </div>
                </div>
            </div>
        </motion.div>
    );
}

export default function FoodWallet({ slug, restaurantName }: { slug: string; restaurantName?: string }) {
    const [activeCardId, setActiveCardId] = useState<string | null>(null);
    const [isHovered, setIsHovered] = useState(false);

    const activeCard = FOOD_CARDS.find(c => c.id === activeCardId);

    return (
        <div
            className="relative w-full h-full flex flex-col items-center justify-center"
            onClick={() => setActiveCardId(null)}
        >
            {/* Ambient glow */}
            <div style={{
                position: 'absolute', top: '10%', left: '50%', transform: 'translateX(-50%)',
                width: '340px', height: '340px', borderRadius: '50%',
                background: 'radial-gradient(circle, rgba(232,93,38,0.2) 0%, transparent 70%)',
                filter: 'blur(40px)', pointerEvents: 'none',
            }} />

            <div className="relative" style={{ width: '320px' }}>
                {/* ── CARD STACK AREA ─────────────────────────────── */}
                <div
                    className="relative"
                    style={{ height: '260px' }}
                    onMouseEnter={() => setIsHovered(true)}
                    onMouseLeave={() => setIsHovered(false)}
                >
                    {/* Card slot shadow at top of wallet */}
                    <div style={{
                        position: 'absolute', top: 0, left: '12px', right: '12px', height: '4px',
                        background: 'rgba(0,0,0,0.6)', borderRadius: '0 0 4px 4px',
                        filter: 'blur(2px)', zIndex: 31,
                    }} />

                    {/* Stacked food cards */}
                    <div style={{ position: 'absolute', inset: '0 12px', top: 0 }}>
                        {FOOD_CARDS.map((card, index) => (
                            <FoodCard
                                key={card.id}
                                data={card}
                                index={index}
                                isActive={activeCardId === card.id}
                                isHovered={isHovered && !activeCardId}
                                onClick={() => setActiveCardId(activeCardId === card.id ? null : card.id)}
                                totalCards={FOOD_CARDS.length}
                            />
                        ))}
                    </div>

                    {/* ── THE WALLET BODY ─────────────────────────── */}
                    <motion.div
                        style={{
                            position: 'absolute', inset: 0, top: '80px',
                            borderRadius: '22px',
                            background: 'radial-gradient(circle at 50% 0%, #2a2a2a 0%, #141414 60%)',
                            border: '1px solid rgba(255,255,255,0.07)',
                            boxShadow: '0 30px 80px rgba(0,0,0,0.9), inset 0 1px 0 rgba(255,255,255,0.06)',
                            zIndex: 30, overflow: 'hidden', display: 'flex', flexDirection: 'column',
                            alignItems: 'center', justifyContent: 'center',
                        }}
                        animate={{
                            rotateX: isHovered || activeCardId ? 4 : 0,
                            y: isHovered ? 4 : 0,
                        }}
                        transition={{ type: 'spring', stiffness: 200, damping: 22 }}
                    >
                        {/* Leather texture */}
                        <div style={{
                            position: 'absolute', inset: 0, opacity: 0.5,
                            backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 200 200' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.75' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23n)' opacity='1'/%3E%3C/svg%3E")`,
                            mixBlendMode: 'multiply',
                        }} />
                        {/* Top gradient sheen */}
                        <div style={{ position: 'absolute', inset: 0, background: 'linear-gradient(to bottom, rgba(255,255,255,0.04) 0%, transparent 40%)', pointerEvents: 'none' }} />
                        {/* Stitching border */}
                        <div style={{ position: 'absolute', inset: '10px', border: '1px dashed rgba(255,255,255,0.07)', borderRadius: '14px', pointerEvents: 'none' }} />
                        {/* Card slot line */}
                        <div style={{ position: 'absolute', top: 0, left: '15%', right: '15%', height: '2px', background: 'rgba(0,0,0,0.5)', borderRadius: '0 0 3px 3px', filter: 'blur(0.5px)' }} />

                        {/* Balance content */}
                        <div style={{ textAlign: 'center', position: 'relative', zIndex: 2 }}>
                            <div style={{ fontSize: '10px', letterSpacing: '0.25em', color: '#5a7060', fontWeight: 700, textTransform: 'uppercase', marginBottom: '6px', fontFamily: 'monospace' }}>
                                {activeCard ? 'Selected Dish' : restaurantName || "Today's Menu"}
                            </div>
                            <motion.div
                                key={activeCardId || 'default'}
                                initial={{ opacity: 0, y: 6 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ duration: 0.3 }}
                                style={{
                                    fontSize: '22px', fontWeight: 900, color: '#e8e0d0',
                                    letterSpacing: '-0.02em', fontFamily: "'Outfit', 'Inter', sans-serif",
                                    textShadow: '0 2px 8px rgba(0,0,0,0.6)',
                                }}
                            >
                                {activeCard ? activeCard.name : '3 Signature Dishes'}
                            </motion.div>
                            {activeCard && (
                                <motion.div
                                    initial={{ opacity: 0 }}
                                    animate={{ opacity: 1 }}
                                    style={{ fontSize: '18px', fontWeight: 800, color: '#f5a623', marginTop: '4px' }}
                                >
                                    {activeCard.price}
                                </motion.div>
                            )}
                        </div>
                    </motion.div>

                    {/* Wallet back depth layer */}
                    <div style={{
                        position: 'absolute', inset: 0, top: '83px',
                        background: '#080808', borderRadius: '22px', zIndex: 29,
                        transform: 'translateY(6px) scaleX(0.97)',
                    }} />
                </div>

                {/* Hint text */}
                <motion.div
                    animate={{ opacity: isHovered || activeCardId ? 1 : 0.4 }}
                    transition={{ duration: 0.3 }}
                    style={{
                        textAlign: 'center', marginTop: '20px', fontSize: '10px',
                        color: 'rgba(136,160,150,0.6)', letterSpacing: '0.2em',
                        textTransform: 'uppercase', fontFamily: 'monospace',
                        display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '6px',
                    }}
                >
                    <span style={{ animation: isHovered ? 'bounceY 1s ease infinite' : 'none', display:'inline-block' }}>↑</span>
                    {activeCardId ? 'Click background to close' : 'Hover & select a dish'}
                </motion.div>

                {/* Order CTA – appears when card active */}
                {activeCardId && (
                    <motion.div
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0 }}
                        style={{ textAlign: 'center', marginTop: '10px' }}
                        onClick={e => e.stopPropagation()}
                    >
                        <Link
                            href={`/${slug}/menu`}
                            style={{
                                display: 'inline-flex', alignItems: 'center', gap: '6px',
                                padding: '10px 24px', borderRadius: '12px', fontSize: '13px',
                                fontWeight: 700, color: '#fff', textDecoration: 'none',
                                background: 'linear-gradient(135deg, #e85d26, #f5a623)',
                                boxShadow: '0 8px 24px rgba(232,93,38,0.4)',
                            }}
                        >
                            🍽️ Order Now →
                        </Link>
                    </motion.div>
                )}
            </div>

            <style>{`
                @keyframes bounceY {
                    0%, 100% { transform: translateY(0); }
                    50% { transform: translateY(-4px); }
                }
            `}</style>
        </div>
    );
}
