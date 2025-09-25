// components/uploadPaste.tsx
'use client';
import React, { useRef, useState } from 'react';
import type { Transaction } from '@/types';
import { parseFile, parseCSVText } from '@/lib/parse';

export default function UploadPaste({ onImport }: { onImport: (t: Transaction[]) => void }) {
    const fileRef = useRef<HTMLInputElement | null>(null);
    const [loading, setLoading] = useState(false);
    const [pasteText, setPasteText] = useState('');

    async function handleFile(e: React.ChangeEvent<HTMLInputElement>) {
        const f = e.currentTarget.files?.[0];
        if (!f) return;
        setLoading(true);
        try {
            const parsed = await parseFile(f);
            onImport(parsed);
        } catch (err) {
            alert('Failed to parse file: ' + (err as Error).message);
        } finally {
            setLoading(false);
            e.currentTarget.value = '';
        }
    }

    function handlePasteImport() {
        if (!pasteText.trim()) return alert('Paste CSV or tabular text first.');
        try {
            const parsed = parseCSVText(pasteText);
            onImport(parsed);
            setPasteText('');
        } catch (err) {
            alert('Failed to parse pasted text: ' + (err as Error).message);
        }
    }

    return (
        // <div className="p-4  rounded border border-slate-700">
        //     <div className="flex items-center justify-between">
        //         <h2 className="text-lg font-medium">Import / Paste data</h2>
        //         <div className="text-sm text-slate-400">Supports .csv or paste Excel text</div>
        //     </div>

        //     <div className="mt-3 space-y-3">
        //         <div className="flex gap-2">
        //             <label className="bg-emerald-600 text-white px-3 py-2 rounded cursor-pointer">
        //                 {loading ? 'Loading...' : 'Upload file'}
        //                 <input
        //                     ref={fileRef}
        //                     onChange={handleFile}
        //                     accept=".csv,text/csv"
        //                     type="file"
        //                     className="hidden"
        //                 />
        //             </label>
        //             <button
        //                 onClick={() => fileRef.current?.click()}
        //                 className="px-3 py-2 bg-slate-700 text-slate-200 rounded border border-slate-600"
        //             >
        //                 Choose file
        //             </button>
        //         </div>

        //         <div>
        //             <label className="text-sm text-slate-300">Paste CSV / tabular text</label>
        //             <textarea
        //                 value={pasteText}
        //                 onChange={e => setPasteText(e.target.value)}
        //                 rows={6}
        //                 className="w-full mt-2 bg-slate-900 border border-slate-700 rounded p-2 text-slate-100 placeholder:text-slate-500 text-sm"
        //                 placeholder="date, total, in/out, description, savings"
        //             />
        //             <div className="flex gap-2 mt-2">
        //                 <button onClick={handlePasteImport} className="bg-emerald-600 px-3 py-2 rounded text-white">
        //                     Import pasted
        //                 </button>
        //                 <button onClick={() => setPasteText('')} className="bg-slate-700 px-3 py-2 rounded text-slate-200">
        //                     Clear
        //                 </button>
        //             </div>
        //         </div>
        //     </div>
        // </div>
        <div className="rounded-xl border border-slate-800 bg-[#0f0f0f] shadow-lg p-6 space-y-4 animate-fadeIn">
            <h2 className="text-xl font-semibold text-slate-200">Import Data</h2>
            <p className="text-sm text-slate-400">Upload a CSV or paste table data</p>

            {/* Upload buttons */}
            <div className="flex gap-3">
                <label className="cursor-pointer px-4 py-2 bg-emerald-600 hover:bg-emerald-500 rounded-md text-white transition">
                    {loading ? "Loading..." : "Upload File"}
                    <input type="file" ref={fileRef} onChange={handleFile} accept=".csv,text/csv" className="hidden" />
                </label>
                <button
                    onClick={() => fileRef.current?.click()}
                    className="px-4 py-2 bg-slate-700 hover:bg-slate-600 rounded-md text-slate-200 transition"
                >
                    Choose File
                </button>
            </div>

            {/* Paste box */}
            <textarea
                value={pasteText}
                onChange={(e) => setPasteText(e.target.value)}
                rows={6}
                className="w-full mt-2 bg-[#1a1a1a] border border-slate-700 rounded-lg p-3 text-slate-100 placeholder:text-slate-500 text-sm"
                placeholder="date, total, in/out, description, savings"
            />
            <div className="flex gap-3">
                <button onClick={handlePasteImport} className="px-4 py-2 bg-emerald-600 hover:bg-emerald-500 rounded-md text-white transition">
                    Import
                </button>
                <button onClick={() => setPasteText('')} className="px-4 py-2 bg-slate-700 hover:bg-slate-600 rounded-md text-slate-200 transition">
                    Clear
                </button>
            </div>
        </div>

    );
}
