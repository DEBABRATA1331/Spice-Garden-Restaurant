'use client';
import { motion } from 'framer-motion';

// Mock table layout data
const TABLES = [
    { id: 'T1', type: 'circle', seats: 2, top: '20%', left: '15%', size: 40 },
    { id: 'T2', type: 'circle', seats: 2, top: '20%', left: '35%', size: 40 },
    { id: 'T3', type: 'rect', seats: 4, top: '20%', left: '60%', size: 60, width: 80 },
    { id: 'T4', type: 'rect', seats: 4, top: '45%', left: '15%', size: 60, width: 80 },
    { id: 'T5', type: 'circle', seats: 6, top: '50%', left: '50%', size: 70 },
    { id: 'T6', type: 'booth', seats: 6, top: '75%', left: '20%', size: 80, width: 120 },
    { id: 'T7', type: 'booth', seats: 8, top: '75%', left: '60%', size: 80, width: 140 },
];

interface TableMapProps {
    guests: number;
    selectedTableId: string | null;
    onSelectTable: (id: string | null) => void;
}

export default function TableMap({ guests, selectedTableId, onSelectTable }: TableMapProps) {
    return (
        <div className="card p-6 flex flex-col h-full bg-[#111] overflow-hidden relative">
            <h2 className="font-semibold text-lg mb-2">Select a Table</h2>
            <p className="text-zinc-400 text-sm mb-6">
                Interactive floor plan. Showing tables for <span className="text-orange-400 font-bold">{guests}</span> guests.
            </p>

            {/* The Restaurant Floor */}
            <div className="relative w-full flex-1 min-h-[400px] bg-[#0A0A0A] rounded-xl border border-zinc-800/50 shadow-inner overflow-hidden">
                {/* Decorative Floor details */}
                <div className="absolute inset-x-0 top-0 h-4 bg-zinc-800/20 border-b border-zinc-800/30" />
                <div className="absolute top-4 left-6 text-[10px] text-zinc-600 font-mono tracking-widest uppercase">Entrance ↑</div>
                <div className="absolute top-4 right-6 text-[10px] text-zinc-600 font-mono tracking-widest uppercase">Bar Area →</div>

                {/* Grid lines for CAD feel */}
                <div className="absolute inset-0 opacity-[0.03]" style={{
                    backgroundImage: 'linear-gradient(rgba(255,255,255,0.5) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.5) 1px, transparent 1px)',
                    backgroundSize: '20px 20px',
                }} />

                {/* Render Tables */}
                {TABLES.map(table => {
                    const isValid = table.seats >= guests;
                    const isSelected = selectedTableId === table.id;

                    return (
                        <motion.button
                            key={table.id}
                            type="button"
                            disabled={!isValid}
                            onClick={() => onSelectTable(isSelected ? null : table.id)}
                            className="absolute flex items-center justify-center font-mono text-xs font-bold transition-colors shadow-2xl"
                            animate={{
                                scale: isSelected ? 1.05 : isValid ? 1 : 0.95,
                                opacity: isValid ? 1 : 0.3,
                                borderColor: isSelected ? 'rgba(249, 115, 22, 1)' : isValid ? 'rgba(255, 255, 255, 0.15)' : 'rgba(255, 255, 255, 0.05)',
                                backgroundColor: isSelected ? 'rgba(249, 115, 22, 0.15)' : isValid ? 'rgba(30,30,35,0.8)' : 'rgba(20,20,20,0.5)',
                                boxShadow: isSelected
                                    ? '0 0 20px rgba(249, 115, 22, 0.3), inset 0 0 10px rgba(249, 115, 22, 0.2)'
                                    : isValid
                                        ? '0 10px 20px rgba(0,0,0,0.4)'
                                        : 'none',
                            }}
                            transition={{ type: 'spring', stiffness: 300, damping: 20 }}
                            style={{
                                top: table.top,
                                left: table.left,
                                width: table.width || table.size,
                                height: table.size,
                                borderRadius: table.type === 'circle' ? '50%' : table.type === 'booth' ? '12px' : '8px',
                                borderStyle: 'solid',
                                borderWidth: isSelected ? '2px' : '1px',
                                cursor: isValid ? 'pointer' : 'not-allowed',
                                zIndex: isSelected ? 10 : 1,
                            }}
                        >
                            <div className="flex flex-col items-center">
                                <span className={isSelected ? 'text-orange-400' : isValid ? 'text-zinc-300' : 'text-zinc-600'}>
                                    {table.id}
                                </span>
                                <div className={`flex gap-0.5 mt-1 opacity-60 ${isSelected ? 'text-orange-400' : 'text-zinc-500'}`}>
                                    {Array.from({ length: Math.min(table.seats, 4) }).map((_, i) => (
                                        <div key={i} className="w-1.5 h-1.5 rounded-full bg-current" />
                                    ))}
                                    {table.seats > 4 && <span className="text-[8px] leading-[6px] ml-0.5">+{table.seats - 4}</span>}
                                </div>
                            </div>

                            {/* Selection Ring Glow */}
                            {isSelected && (
                                <motion.div
                                    layoutId="table-selection-ring"
                                    className="absolute -inset-[6px] rounded-[inherit] border border-orange-500/50 pointer-events-none"
                                    initial={{ opacity: 0, scale: 0.8 }}
                                    animate={{ opacity: 1, scale: 1 }}
                                    transition={{ type: 'spring', bounce: 0.2, duration: 0.6 }}
                                />
                            )}
                        </motion.button>
                    );
                })}
            </div>

            {/* Legend */}
            <div className="flex gap-4 mt-4 text-xs text-zinc-500 justify-center">
                <div className="flex items-center gap-1.5"><div className="w-3 h-3 rounded bg-orange-500/20 border border-orange-500" /> Selected</div>
                <div className="flex items-center gap-1.5"><div className="w-3 h-3 rounded bg-[#1e1e23] border border-white/15" /> Available</div>
                <div className="flex items-center gap-1.5"><div className="w-3 h-3 rounded bg-[#141414] border border-white/5 opacity-40" /> Too Small</div>
            </div>
        </div>
    );
}
