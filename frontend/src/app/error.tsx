'use client';

import { useEffect } from 'react';

export default function Error({
    error,
    reset,
}: {
    error: Error & { digest?: string };
    reset: () => void;
}) {
    useEffect(() => {
        console.error("APP ERROR:", error);
    }, [error]);

    return (
        <div className="min-h-screen bg-black flex flex-col items-center justify-center text-white p-8">
            <div className="max-w-4xl w-full border-2 border-red-500 bg-red-950/30 rounded-xl p-8 shadow-2xl shadow-red-500/20">
                <h2 className="text-3xl font-bold mb-4 text-red-400 flex items-center gap-3">
                    <span className="text-4xl">🚨</span> Client-Side Exception Caught
                </h2>
                <div className="bg-black/80 p-6 rounded-lg font-mono text-sm border border-red-900/50 mb-6 overflow-x-auto">
                    <p className="font-bold text-red-400 mb-2">Message:</p>
                    <p className="text-zinc-300 mb-4 whitespace-pre-wrap">{error.message}</p>

                    <p className="font-bold text-red-500 mb-2">Stack Trace:</p>
                    <p className="text-zinc-500 whitespace-pre-wrap">{error.stack}</p>
                </div>
                <button
                    className="bg-red-500 hover:bg-red-600 text-white font-bold py-3 px-8 rounded-lg transition-colors"
                    onClick={() => reset()}
                >
                    Attempt Recovery
                </button>
            </div>
        </div>
    );
}
