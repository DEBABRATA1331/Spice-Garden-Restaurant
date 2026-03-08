'use client';
import { useState } from 'react';

interface LuminousCardProps {
    icon?: string;       // emoji or custom svg string
    title: string;
    subtitle: string;
    description: string;
    toggleLabel?: string;
}

export default function LuminousCard({
    icon = '🍛',
    title,
    subtitle,
    description,
    toggleLabel = 'Illuminate',
}: LuminousCardProps) {
    const [active, setActive] = useState(false);

    return (
        <>
            <div className={`lumen-card${active ? ' lumen-active' : ''}`}>
                {/* ═══ LIGHT LAYER ═══ */}
                <div className="lumen-light-layer">
                    <div className="lumen-slit" />
                    <div className="lumen-lumen">
                        <div className="lumen-min" />
                        <div className="lumen-mid" />
                        <div className="lumen-hi" />
                    </div>
                    <div className="lumen-darken">
                        <div className="lumen-sl" />
                        <div className="lumen-ll" />
                        <div className="lumen-slt" />
                        <div className="lumen-srt" />
                    </div>
                </div>

                {/* ═══ CONTENT ═══ */}
                <div className="lumen-content">
                    {/* Icon */}
                    <div className="lumen-icon">
                        <span style={{ fontSize: '3.2rem', display: 'block', filter: 'drop-shadow(0 -1.2rem 1px transparent)', transition: 'filter 0.4s ease-in-out' }}>
                            {icon}
                        </span>
                    </div>

                    {/* Bottom text + toggle */}
                    <div className="lumen-bottom">
                        <h4>{title}</h4>
                        <p>{subtitle}<br />{description}</p>
                        <div
                            className={`lumen-toggle${active ? ' lumen-toggle-active' : ''}`}
                            onClick={() => setActive(v => !v)}
                        >
                            <div className="lumen-handle" />
                            <span>{toggleLabel}</span>
                        </div>
                    </div>
                </div>
            </div>

            <style>{`
                /* ─── Luminous Card ─────────────────────────────── */
                .lumen-card {
                    position: relative;
                    background: radial-gradient(circle at 50% 0%, #3a3a3a 0%, #1a1a1a 64%);
                    box-shadow:
                        inset 0 1.01rem 0.2rem -1rem #fff0,
                        inset 0 -1.01rem 0.2rem -1rem #0000,
                        0 -1.02rem 0.2rem -1rem #fff0,
                        0 1rem 0.2rem -1rem #0000,
                        0 0 0 1px #fff3,
                        0 4px 4px 0 #0004,
                        0 0 0 1px #333;
                    width: 18rem;
                    height: 24rem;
                    border-radius: 1.8rem;
                    color: #fff;
                    padding: 1rem;
                    display: flex;
                    flex-direction: column;
                    justify-content: flex-end;
                    transition: all 0.4s ease-in-out, translate 0.4s ease-out;
                    font-family: 'Outfit', 'Inter', sans-serif;
                }

                .lumen-card::before {
                    content: '';
                    display: block;
                    --offset: 1rem;
                    width: calc(100% + 2 * var(--offset));
                    height: calc(100% + 2 * var(--offset));
                    position: absolute;
                    left: calc(-1 * var(--offset));
                    top: calc(-1 * var(--offset));
                    margin: auto;
                    box-shadow: inset 0 0 0px 0.06rem #fff2;
                    border-radius: 2.6rem;
                    --ax: 4rem;
                    clip-path: polygon(
                        var(--ax) 0, 0 0, 0 var(--ax),
                        var(--ax) var(--ax), var(--ax) calc(100% - var(--ax)),
                        0 calc(100% - var(--ax)), 0 100%, var(--ax) 100%,
                        var(--ax) calc(100% - var(--ax)),
                        calc(100% - var(--ax)) calc(100% - var(--ax)),
                        calc(100% - var(--ax)) 100%, 100% 100%,
                        100% calc(100% - var(--ax)),
                        calc(100% - var(--ax)) calc(100% - var(--ax)),
                        calc(100% - var(--ax)) var(--ax), 100% var(--ax),
                        100% 0, calc(100% - var(--ax)) 0,
                        calc(100% - var(--ax)) var(--ax), var(--ax) var(--ax)
                    );
                    transition: all 0.4s ease-in-out;
                }

                .lumen-card:hover {
                    translate: 0 -0.2rem;
                }

                .lumen-card:hover::before {
                    --offset: 0.5rem;
                    --ax: 8rem;
                    border-radius: 2.2rem;
                    box-shadow: inset 0 0 0 0.08rem #fff1;
                }

                /* Active (lumen ON) */
                .lumen-active {
                    box-shadow:
                        inset 0 1.01rem 0.1rem -1rem #fffa,
                        inset 0 -4rem 3rem -3rem #000a,
                        0 -1.02rem 0.2rem -1rem #fffa,
                        0 1rem 0.2rem -1rem #000,
                        0 0 0 1px #fff2,
                        0 4px 4px 0 #0004,
                        0 0 0 1px #333;
                }

                /* ─── Light Layer ─── */
                .lumen-light-layer {
                    position: absolute;
                    left: 0; top: 0;
                    height: 100%; width: 100%;
                    transform-style: preserve-3d;
                    perspective: 400px;
                }

                .lumen-slit {
                    position: absolute;
                    left: 0; right: 0; top: 0; bottom: 0;
                    margin: auto;
                    width: 64%;
                    height: 1.2rem;
                    transform: rotateX(-76deg);
                    background: #121212;
                    box-shadow: 0 0 4px 0 #fff0;
                    transition: all 0.4s ease-in-out;
                }
                .lumen-active .lumen-slit {
                    background: #fff;
                    box-shadow: 0 0 4px 0 #fff;
                }

                .lumen-lumen {
                    position: absolute;
                    left: 0; right: 0; top: 0; bottom: 0;
                    margin: auto;
                    width: 100%; height: 100%;
                    pointer-events: none;
                    perspective: 400px;
                    opacity: 0;
                    transition: opacity 0.4s ease-in-out;
                }
                .lumen-active .lumen-lumen { opacity: 0.5; }

                .lumen-min {
                    width: 70%; height: 3rem;
                    background: linear-gradient(#fff0, #fffa);
                    position: absolute;
                    left: 0; right: 0; top: 0; bottom: 2.5rem;
                    margin: auto;
                    transform: rotateX(-42deg);
                    opacity: 0.4;
                }
                .lumen-mid {
                    width: 74%; height: 13rem;
                    background: linear-gradient(#fff0, #fffa);
                    position: absolute;
                    left: 0; right: 0; top: 0; bottom: 10em;
                    margin: auto;
                    transform: rotateX(-42deg);
                    filter: blur(1rem);
                    opacity: 0.8;
                    border-radius: 100% 100% 0 0;
                }
                .lumen-hi {
                    width: 50%; height: 13rem;
                    background: linear-gradient(#fff0, #fffa);
                    position: absolute;
                    left: 0; right: 0; top: 0; bottom: 12em;
                    margin: auto;
                    transform: rotateX(22deg);
                    filter: blur(1rem);
                    opacity: 0.6;
                    border-radius: 100% 100% 0 0;
                }

                .lumen-darken {
                    position: absolute;
                    left: 0; right: 0; top: 0; bottom: 0;
                    margin: auto; width: 100%; height: 100%;
                    pointer-events: none;
                    perspective: 400px;
                    transition: opacity 0.4s ease-in-out;
                    opacity: 0.5;
                }
                .lumen-darken > * { transition: opacity 0.4s ease-in-out; }
                .lumen-active .lumen-darken { opacity: 0.8; }

                .lumen-sl {
                    width: 64%; height: 10rem;
                    background: linear-gradient(#000, #0000);
                    position: absolute; left: 0; right: 0;
                    top: 9.6em; bottom: 0; margin: auto;
                    filter: blur(0.2rem); opacity: 0.1;
                    border-radius: 0 0 100% 100%;
                    transform: rotateX(-22deg);
                }
                .lumen-active .lumen-sl { opacity: 0.2; }

                .lumen-ll {
                    width: 62%; height: 10rem;
                    background: linear-gradient(#000a, #0000);
                    position: absolute; left: 0; right: 0;
                    top: 11em; bottom: 0; margin: auto;
                    filter: blur(0.8rem); opacity: 0.4;
                    border-radius: 0 0 100% 100%;
                    transform: rotateX(22deg);
                }
                .lumen-active .lumen-ll { opacity: 1; }

                .lumen-slt {
                    width: 0.5rem; height: 4rem;
                    background: linear-gradient(#0005, #0000);
                    position: absolute;
                    left: 0; right: 11.5rem; top: 3.9em; bottom: 0;
                    margin: auto; opacity: 0.6;
                    border-radius: 0 0 100% 100%;
                    transform: skewY(42deg);
                }
                .lumen-active .lumen-slt { opacity: 1; }

                .lumen-srt {
                    width: 0.5rem; height: 4rem;
                    background: linear-gradient(#0005, #0000);
                    position: absolute;
                    right: 0; left: 11.5rem; top: 3.9em; bottom: 0;
                    margin: auto; opacity: 0.6;
                    border-radius: 0 0 100% 100%;
                    transform: skewY(-42deg);
                }
                .lumen-active .lumen-srt { opacity: 1; }

                /* ─── Content ─── */
                .lumen-content { position: relative; }

                .lumen-icon {
                    position: absolute;
                    top: -13rem; left: 0; right: 0; margin: auto;
                    width: fit-content;
                    filter: drop-shadow(0 -1.2rem 1px transparent);
                    transition: filter 0.4s ease-in-out;
                }
                .lumen-active .lumen-icon {
                    filter: drop-shadow(0 -1.2rem 2px #0003) brightness(1.64);
                }

                .lumen-bottom { position: relative; }

                .lumen-bottom h4 {
                    margin: 0 0 0.8rem;
                    font-size: 1.1rem;
                    font-weight: 700;
                    color: #ccc;
                    letter-spacing: -0.01em;
                }
                .lumen-bottom p {
                    margin: 0;
                    padding-bottom: 0.6rem;
                    color: #fff4;
                    font-size: 0.62rem;
                    font-weight: 300;
                    border-bottom: 1px solid #fff1;
                    max-width: 68%;
                    line-height: 1.5;
                }

                /* ─── Toggle ─── */
                .lumen-toggle {
                    position: absolute;
                    right: 0; bottom: 0;
                    height: 2rem; width: 4.8rem;
                    border-radius: 0.6rem;
                    background: #000;
                    box-shadow:
                        inset 0 -8px 8px 0.3rem #0004,
                        inset 0 0 1px 0.3rem #ddd,
                        inset 0 -2px 1px 0.3rem #fff,
                        inset 0 1px 2px 0.3rem #0006,
                        inset 0 0 1px 0.8rem #aaa;
                    cursor: pointer;
                    transition: all 0.4s ease-in-out;
                    user-select: none;
                }
                .lumen-toggle::before {
                    content: '';
                    display: block;
                    position: absolute;
                    left: 0; right: 0; top: 0; bottom: 0;
                    margin: auto;
                    width: 3.4rem; height: 0.68rem;
                    border-radius: 0.2rem;
                    background: #000;
                    transition: all 0.4s ease-in-out;
                }
                .lumen-toggle-active::before {
                    background: #fffc;
                    box-shadow: 0 0 0.3rem 0.2rem #fff7;
                }

                .lumen-handle {
                    position: absolute;
                    top: 0; bottom: 0.04rem;
                    margin: auto; left: 0.68rem;
                    width: 40%; height: 30%;
                    background: #aaa;
                    border-radius: 0.2rem;
                    box-shadow:
                        inset 0 1px 4px 0 #fff,
                        inset 0 -1px 1px 0 #000a,
                        0 0 1px 1px #0003,
                        1px 3px 6px 1px #000a;
                    transition: all 0.4s ease-in-out;
                }
                .lumen-toggle-active .lumen-handle {
                    transform: translateX(1.58rem);
                    box-shadow:
                        inset 0 1px 12px 0 #fff,
                        inset 0 -1px 1px 0 #fffa,
                        0 0 2px 1px #4443,
                        1px 3px 6px 1px #0004;
                }
                .lumen-toggle:not(.lumen-toggle-active):hover .lumen-handle {
                    transform: translateX(0.2rem);
                }

                .lumen-toggle span {
                    pointer-events: none;
                    text-align: center;
                    position: absolute;
                    left: 0; right: 0; margin: auto;
                    bottom: calc(100% + 0.4rem);
                    font-size: 0.55rem;
                    font-weight: 300;
                    color: #555;
                    opacity: 0;
                    transition: opacity 0.4s ease-in-out;
                    white-space: nowrap;
                }
                .lumen-toggle:hover span { opacity: 1; }
            `}</style>
        </>
    );
}
