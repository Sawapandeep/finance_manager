'use client';

import React, { useMemo, useState } from 'react';
import type { Transaction } from '@/types';
import { saveAs } from 'file-saver';
import { addTransaction, updateTransaction, deleteTransaction } from '@/lib/firestore';

export default function Spreadsheet({
    rows,
    setRows,
    uid,
}: {
    rows: Transaction[];
    setRows: (r: Transaction[]) => void;
    uid: string | null;
}) {
    const [editingId, setEditingId] = useState<string | null>(null);

    // Sort rows by date ascending
    const sorted = useMemo(() => {
        return [...rows].sort(
            (a, b) => new Date(a.date).getTime() - new Date(b.date).getTime()
        );
    }, [rows]);

    // Update existing row
    async function updateRow(id: string, patch: Partial<Transaction>) {
        if (!uid) return;
        const patched = rows.map(r => (r.id === id ? { ...r, ...patch } : r));
        setRows(patched);
        await updateTransaction(uid, id, patch);
    }

    // Add row
    async function addEmptyRow() {
        if (!uid) return;
        const now = new Date().toISOString().slice(0, 10);

        const newRow: Omit<Transaction, 'id'> = {
            date: now,
            amount: 0,
            inOut: 'COME',
            type: '',
            savings: 0,
        };

        const docId = await addTransaction(uid, newRow);
        setRows(rows.concat([{ ...newRow, id: docId }]));
    }

    // Delete row
    async function deleteRow(id: string) {
        if (!uid || !confirm('Delete this row?')) return;
        setRows(rows.filter(r => r.id !== id));
        await deleteTransaction(uid, id);
    }

    // Export CSV
    function exportCSV() {
        const header = ['date', 'amount', 'inOut', 'type', 'savings'];
        const csv = [
            header.join(','),
            ...rows.map(r =>
                [
                    r.date,
                    r.amount ?? 0,
                    r.inOut,
                    `"${(r.type || '').replace(/"/g, '""')}"`,
                    r.savings ?? 0,
                ].join(',')
            ),
        ].join('\n');

        const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
        saveAs(blob, 'transactions.csv');
    }

    // Totals
    const total = rows.reduce((s, r) => {
        if (r.inOut === 'COME') return s + (r.amount || 0);
        if (r.inOut === 'GO') return s - (r.amount || 0);
        return s;
    }, 0);

    const totalSavings = rows.reduce((s, r) => s + (r.savings || 0), 0);
    const gurudwaraTotal = 0;
    const afterGurudwaraTotal = total - gurudwaraTotal;
    const spendable = afterGurudwaraTotal - totalSavings;

    return (
        <div className="rounded border border-slate-700 p-4">
            <div className="flex items-center justify-between mb-3">
                <h3 className="text-lg font-medium">Transactions</h3>
            </div>

            <div className="overflow-auto">
                <table className="table-auto text-sm w-full">
                    <thead>
                        <tr className="text-left text-slate-300 border-b border-slate-700">
                            <th className="px-2 py-2 w-28">Date</th>
                            <th className="px-2 py-2 w-28">Amount</th>
                            <th className="px-2 py-2 w-20">In/Out</th>
                            <th className="px-2 py-2">Type</th>
                            <th className="px-2 py-2 w-24">Savings</th>
                            <th className="px-2 py-2 w-28">Actions</th>
                        </tr>
                    </thead>
                    <tbody>
                        {sorted.length > 0 ? (
                            sorted.map(row => (
                                <tr key={row.id} className="border-b border-slate-700">
                                    {/* Date */}
                                    <td className="px-2 py-2">
                                        <input
                                            type="date"
                                            value={row.date}
                                            onChange={(e) =>
                                                updateRow(row.id, { date: e.target.value })
                                            }
                                            className="bg-slate-900 text-slate-100 rounded px-2 py-1 border border-slate-700 w-full"
                                        />
                                    </td>

                                    {/* Amount */}
                                    <td className="px-2 py-2">
                                        <input
                                            type="number"
                                            value={row.amount ?? 0}
                                            onChange={(e) =>
                                                updateRow(row.id, {
                                                    amount: Number(e.target.value) || 0,
                                                })
                                            }
                                            className={`w-28 bg-slate-900 text-slate-100 rounded px-2 py-1 border border-slate-700 text-right appearance-none ${(row.amount ?? 0) < 0
                                                ? 'text-rose-400'
                                                : 'text-emerald-300'
                                                }`}
                                        />
                                    </td>

                                    {/* In/Out */}
                                    <td className="px-2 py-2">
                                        <select
                                            value={row.inOut}
                                            onChange={(e) =>
                                                updateRow(row.id, {
                                                    inOut: e.target.value as 'GO' | 'COME',
                                                })
                                            }
                                            className="bg-slate-900 text-slate-100 rounded px-2 py-1 border border-black md:w-full"
                                        >
                                            <option value="GO" className="bg-red-500 text-slate-100">GO</option>
                                            <option value="COME" className="bg-green-500 text-slate-100">COME</option>
                                        </select>
                                    </td>

                                    {/* Type */}
                                    <td className="px-2 py-2">
                                        <input
                                            value={row.type ?? ''}
                                            onChange={(e) =>
                                                updateRow(row.id, { type: e.target.value })
                                            }
                                            className="bg-slate-900 text-slate-100 rounded px-2 py-1 border border-slate-700 md:w-full"
                                        />
                                    </td>

                                    {/* Savings */}
                                    <td className="px-2 py-2">
                                        <input
                                            type="number"
                                            value={row.savings ?? 0}
                                            onChange={(e) =>
                                                updateRow(row.id, {
                                                    savings: Number(e.target.value) || 0,
                                                })
                                            }
                                            className="bg-slate-900 text-slate-100 rounded px-2 py-1 border border-slate-700 md:w-full appearance-none"
                                        />
                                    </td>

                                    {/* Actions */}
                                    <td className="px-2 py-2 w-28">
                                        <div className="flex">
                                            <button
                                                onClick={() => deleteRow(row.id)}
                                                className="px-2 py-1 bg-red-600 hover:bg-rose-700 rounded-lg text-white"
                                            >
                                                Delete
                                            </button>
                                        </div>
                                    </td>
                                </tr>
                            ))
                        ) : (
                            <tr>
                                <td colSpan={6} className="px-2 py-6 text-center text-slate-400">
                                    No transactions yet. Click{" "}
                                    <strong>+ Add row</strong> to get started.
                                </td>
                            </tr>
                        )}

                        {/* Add + Export */}
                        <tr>
                            <td colSpan={6} className="px-2 py-2 text-right font-semibold space-x-2">
                                <button
                                    onClick={addEmptyRow}
                                    className="px-3 py-1 bg-slate-700 hover:bg-slate-600 rounded text-slate-100"
                                >
                                    + Add row
                                </button>
                                <button
                                    onClick={exportCSV}
                                    className="px-3 py-1 bg-blue-600 hover:bg-blue-700 rounded text-white"
                                >
                                    Export CSV
                                </button>
                            </td>
                        </tr>

                        {/* Totals */}
                        {sorted.length > 0 && (
                            <>
                                <tr className="bg-slate-900 font-medium">
                                    <td className="px-2 py-2">Totals</td>
                                    <td className="px-2 py-2 font-mono">₹ {total.toLocaleString()}</td>
                                    <td colSpan={3}></td>
                                    <td className="px-2 py-2 font-mono">
                                        Savings: ₹ {totalSavings.toLocaleString()}
                                    </td>
                                </tr>
                                {/* <tr className="bg-slate-900 font-medium">
                                    <td className="px-2 py-2">After Gurudwara</td>
                                    <td className="px-2 py-2 font-mono">
                                        ₹ {afterGurudwaraTotal.toLocaleString()}
                                    </td>
                                    <td colSpan={4}></td>
                                </tr> */}
                                <tr className="bg-slate-900 font-semibold text-emerald-300">
                                    <td className="px-2 py-2">Spendable</td>
                                    <td className="px-2 py-2 font-mono">
                                        ₹ {spendable.toLocaleString()}
                                    </td>
                                    <td colSpan={4}></td>
                                </tr>
                            </>
                        )}
                    </tbody>
                </table>
            </div>
        </div>
    );
}

// 'use client';

// import React, { useMemo, useState } from 'react';
// import type { Transaction } from '@/types';
// import { saveAs } from 'file-saver';
// import { addTransaction, updateTransaction, deleteTransaction } from '@/lib/firestore';

// export default function Spreadsheet({
//     rows,
//     setRows,
//     uid,
// }: {
//     rows: Transaction[];
//     setRows: (r: Transaction[]) => void;
//     uid: string | null;
// }) {
//     const [editingId, setEditingId] = useState<string | null>(null);

//     // Sort rows by date ascending
//     const sorted = useMemo(() => {
//         return [...rows].sort(
//             (a, b) => new Date(a.date).getTime() - new Date(b.date).getTime()
//         );
//     }, [rows]);

//     // Update existing row
//     async function updateRow(id: string, patch: Partial<Transaction>) {
//         if (!uid) return;
//         const patched = rows.map(r => (r.id === id ? { ...r, ...patch } : r));
//         setRows(patched);
//         await updateTransaction(uid, id, patch);
//     }

//     // Add row
//     async function addEmptyRow() {
//         if (!uid) return;
//         const now = new Date().toISOString().slice(0, 10);

//         const newRow: Omit<Transaction, 'id'> = {
//             date: now,
//             amount: 0,
//             inOut: 'COME',
//             type: '',
//             savings: 0,
//         };

//         const docId = await addTransaction(uid, newRow);
//         setRows(rows.concat([{ ...newRow, id: docId }]));
//     }

//     // Delete row
//     async function deleteRow(id: string) {
//         if (!uid || !confirm('Delete this row?')) return;
//         setRows(rows.filter(r => r.id !== id));
//         await deleteTransaction(uid, id);
//     }

//     // Export CSV
//     function exportCSV() {
//         const header = ['date', 'amount', 'inOut', 'type', 'savings'];
//         const csv = [
//             header.join(','),
//             ...rows.map(r =>
//                 [
//                     r.date,
//                     r.amount ?? 0,
//                     r.inOut,
//                     `"${(r.type || '').replace(/"/g, '""')}"`,
//                     r.savings ?? 0,
//                 ].join(',')
//             ),
//         ].join('\n');

//         const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
//         saveAs(blob, 'transactions.csv');
//     }

//     // Totals
//     const total = rows.reduce((s, r) => {
//         if (r.inOut === 'COME') return s + (r.amount || 0);
//         if (r.inOut === 'GO') return s - (r.amount || 0);
//         return s;
//     }, 0);

//     const totalSavings = rows.reduce((s, r) => s + (r.savings || 0), 0);
//     const gurudwaraTotal = 0;
//     const afterGurudwaraTotal = total - gurudwaraTotal;
//     const spendable = afterGurudwaraTotal - totalSavings;

//     return (
//         <div className="rounded border border-slate-700 p-4">
//             <div className="flex items-center justify-between mb-3">
//                 <h3 className="text-lg font-medium">Transactions</h3>
//             </div>

//             <div className="overflow-auto">
//                 <table className=" table-auto text-sm">
//                     <thead>
//                         <tr className="text-left text-slate-300 border-b border-slate-700">
//                             <th className="px-2 py-2 w-28">Date</th>
//                             <th className="px-2 py-2 w-28">Amount</th>
//                             <th className="px-2 py-2 w-20">In/Out</th>
//                             <th className="px-2 py-2">Type</th>
//                             <th className="px-2 py-2 w-24">Savings</th>
//                             <th className="px-2 py-2 w-28">Actions</th>
//                         </tr>
//                     </thead>
//                     <tbody>
//                         {sorted.map(row => (
//                             <tr key={row.id} className="border-b border-slate-700">
//                                 {/* Date */}
//                                 <td className="px-2 py-2">
//                                     <input
//                                         type="date"
//                                         value={row.date}
//                                         onChange={(e) =>
//                                             updateRow(row.id, { date: e.target.value })
//                                         }
//                                         className="bg-slate-900 text-slate-100 rounded px-2 py-1 border border-slate-700 w-full"
//                                     />
//                                 </td>

//                                 {/* Amount */}
//                                 <td className="px-2 py-2">
//                                     <input
//                                         type="number"
//                                         value={row.amount ?? 0}
//                                         onChange={(e) =>
//                                             updateRow(row.id, {
//                                                 amount: Number(e.target.value) || 0,
//                                             })
//                                         }
//                                         className={`w-28 bg-slate-900 text-slate-100 rounded px-2 py-1 border border-slate-700 text-right ${(row.amount ?? 0) < 0
//                                             ? 'text-rose-400'
//                                             : 'text-emerald-300'
//                                             }`}
//                                     />
//                                 </td>

//                                 {/* In/Out */}
//                                 <td className="px-2 py-2">
//                                     <select
//                                         value={row.inOut}
//                                         onChange={(e) =>
//                                             updateRow(row.id, {
//                                                 inOut: e.target.value as 'GO' | 'COME',
//                                             })
//                                         }
//                                         className="bg-slate-900 text-slate-100 rounded px-2 py-1 border border-black md:w-full"
//                                     >
//                                         <option value="GO" className="bg-red-500 text-slate-100">GO</option>
//                                         <option value="COME" className="bg-green-500 text-slate-100">COME</option>
//                                     </select>
//                                 </td>

//                                 {/* Type */}
//                                 <td className="px-2 py-2">
//                                     <input
//                                         value={row.type ?? ''}
//                                         onChange={(e) =>
//                                             updateRow(row.id, { type: e.target.value })
//                                         }
//                                         className="bg-slate-900 text-slate-100 rounded px-2 py-1 border border-slate-700 md:w-full "
//                                     />
//                                 </td>

//                                 {/* Savings */}
//                                 <td className="px-2 py-2">
//                                     <input
//                                         type="number"
//                                         value={row.savings ?? 0}
//                                         onChange={(e) =>
//                                             updateRow(row.id, {
//                                                 savings: Number(e.target.value) || 0,
//                                             })
//                                         }
//                                         className="bg-slate-900 text-slate-100 rounded px-2 py-1 border border-slate-700 md:w-ful appearance-none"
//                                     />
//                                 </td>

//                                 {/* Actions */}
//                                 <td className="px-2 py-2 w-28">
//                                     <div className="flex ">
//                                         {/* <button
//                                             onClick={() => {
//                                                 navigator.clipboard?.writeText(
//                                                     JSON.stringify(row)
//                                                 );
//                                                 alert('Copied row JSON');
//                                             }}
//                                             className="px-2 py-1 bg-slate-700 hover:bg-slate-600 rounded-lg text-slate-100 "
//                                         >
//                                             Copy
//                                         </button> */}
//                                         <button
//                                             onClick={() => deleteRow(row.id)}
//                                             className="px-2 py-1 bg-red-600 hover:bg-rose-700 rounded-lg text-white "
//                                         >
//                                             Delete
//                                         </button>
//                                     </div>
//                                 </td>
//                             </tr>
//                         ))}

//                         {/* Add + Export */}
//                         <tr>
//                             <td colSpan={6} className="px-2 py-2 text-right font-semibold space-x-2">
//                                 <button
//                                     onClick={addEmptyRow}
//                                     className="px-3 py-1 bg-slate-700 hover:bg-slate-600 rounded text-slate-100"
//                                 >
//                                     + Add row
//                                 </button>
//                                 <button
//                                     onClick={exportCSV}
//                                     className="px-3 py-1 bg-blue-600 hover:bg-blue-700 rounded text-white"
//                                 >
//                                     Export CSV
//                                 </button>
//                             </td>
//                         </tr>

//                         {/* Totals */}
//                         <tr className="bg-slate-900 font-medium">
//                             <td className="px-2 py-2">Totals</td>
//                             <td className="px-2 py-2 font-mono">₹ {total.toLocaleString()}</td>
//                             <td colSpan={3}></td>
//                             <td className="px-2 py-2 font-mono">
//                                 Savings: ₹ {totalSavings.toLocaleString()}
//                             </td>
//                         </tr>
//                         <tr className="bg-slate-900 font-medium">
//                             <td className="px-2 py-2">After Gurudwara</td>
//                             <td className="px-2 py-2 font-mono">
//                                 ₹ {afterGurudwaraTotal.toLocaleString()}
//                             </td>
//                             <td colSpan={4}></td>
//                         </tr>
//                         <tr className="bg-slate-900 font-semibold text-emerald-300">
//                             <td className="px-2 py-2">Spendable</td>
//                             <td className="px-2 py-2 font-mono">
//                                 ₹ {spendable.toLocaleString()}
//                             </td>
//                             <td colSpan={4}></td>
//                         </tr>
//                     </tbody>
//                 </table>
//             </div>
//         </div>
//     );
// }

// 'use client';

// import React, { useMemo, useState } from 'react';
// import type { Transaction } from '@/types';
// import { saveAs } from 'file-saver';
// import { addTransaction, updateTransaction, deleteTransaction } from '@/lib/firestore';

// export default function Spreadsheet({
//     rows,
//     setRows,
//     uid,
// }: {
//     rows: Transaction[];
//     setRows: (r: Transaction[]) => void;
//     uid: string | null;
// }) {
//     const [editingId, setEditingId] = useState<string | null>(null);

//     // Sort rows by date ascending
//     const sorted = useMemo(() => {
//         return [...rows].sort(
//             (a, b) => new Date(a.date).getTime() - new Date(b.date).getTime()
//         );
//     }, [rows]);

//     // Update existing row in Firestore and local state
//     async function updateRow(id: string, patch: Partial<Transaction>) {
//         if (!uid) return;
//         const patched = rows.map(r => (r.id === id ? { ...r, ...patch } : r));
//         setRows(patched);
//         await updateTransaction(uid, id, patch);
//     }

//     // Add a new empty row with defaults
//     async function addEmptyRow() {
//         if (!uid) return;
//         const now = new Date().toISOString().slice(0, 10);

//         const newRow: Omit<Transaction, 'id'> = {
//             date: now,
//             amount: 0,
//             inOut: 'COME',
//             type: '',
//             savings: 0,
//         };

//         const docId = await addTransaction(uid, newRow);
//         setRows(rows.concat([{ ...newRow, id: docId }]));
//     }

//     // Delete row
//     async function deleteRow(id: string) {
//         if (!uid || !confirm('Delete this row?')) return;
//         setRows(rows.filter(r => r.id !== id));
//         await deleteTransaction(uid, id);
//     }

//     // Export CSV
//     function exportCSV() {
//         const header = ['date', 'amount', 'inOut', 'type', 'savings'];
//         const csv = [
//             header.join(','),
//             ...rows.map(r =>
//                 [
//                     r.date,
//                     r.amount ?? 0,
//                     r.inOut,
//                     `"${(r.type || '').replace(/"/g, '""')}"`,
//                     r.savings ?? 0,
//                 ].join(',')
//             ),
//         ].join('\n');

//         const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
//         saveAs(blob, 'transactions.csv');
//     }

//     // Totals
//     const total = rows.reduce((s, r) => {
//         if (r.inOut === 'COME') return s + (r.amount || 0);
//         if (r.inOut === 'GO') return s - (r.amount || 0);
//         return s;
//     }, 0);

//     const totalSavings = rows.reduce((s, r) => s + (r.savings || 0), 0);
//     const gurudwaraTotal = 11157;
//     const afterGurudwaraTotal = total - gurudwaraTotal;
//     const spendable = afterGurudwaraTotal - totalSavings;

//     return (
//         <div className="rounded border border-slate-700 p-4">
//             <div className="flex items-center justify-between mb-3">
//                 <h3 className="text-lg font-medium">Transactions</h3>
//                 {/* <div className="flex gap-2">
//                     <button
//                         onClick={addEmptyRow}
//                         className="px-3 py-1 bg-slate-700 rounded text-slate-100"
//                     >
//                         + Add row
//                     </button>
//                     <button
//                         onClick={exportCSV}
//                         className="px-3 py-1 bg-emerald-600 rounded text-white"
//                     >
//                         Export CSV
//                     </button>
//                 </div> */}
//             </div>

//             <div className="overflow-auto">
//                 <table className="min-w-full table-auto text-sm">
//                     <thead>
//                         <tr className="text-left text-slate-300 border-b border-slate-700">
//                             <th className="px-2 py-2 w-28">Date</th>
//                             <th className="px-2 py-2 w-28">Amount</th>
//                             <th className="px-2 py-2 w-20">In/Out</th>
//                             <th className="px-2 py-2">Type</th>
//                             <th className="px-2 py-2 w-24">Savings</th>
//                             <th className="px-2 py-2 w-28">Actions</th>
//                         </tr>
//                     </thead>
//                     <tbody>
//                         {sorted.map(row => (
//                             <tr key={row.id} className="border-b border-slate-700">
//                                 {/* Date */}
//                                 <td className="px-2 py-2">
//                                     <input
//                                         type="date"
//                                         value={row.date}
//                                         onChange={(e) =>
//                                             updateRow(row.id, { date: e.target.value })
//                                         }
//                                         className="bg-slate-900 text-slate-100 rounded px-2 py-1 border border-slate-700"
//                                     />
//                                 </td>

//                                 {/* Amount */}
//                                 <td className="px-2 py-2">
//                                     <input
//                                         type="number"
//                                         value={row.amount ?? 0}
//                                         onChange={(e) =>
//                                             updateRow(row.id, {
//                                                 amount: Number(e.target.value) || 0,
//                                             })
//                                         }
//                                         className={`w-28 bg-slate-900 text-slate-100 rounded px-2 py-1 border border-slate-700 text-right ${(row.amount ?? 0) < 0
//                                             ? 'text-rose-400'
//                                             : 'text-emerald-300'
//                                             }`}
//                                     />
//                                 </td>

//                                 {/* In/Out */}
//                                 <td className="px-2 py-2">
//                                     <select
//                                         value={row.inOut}
//                                         onChange={(e) =>
//                                             updateRow(row.id, {
//                                                 inOut: e.target.value as 'GO' | 'COME',
//                                             })
//                                         }
//                                         className="bg-slate-900 text-slate-100 rounded px-2 py-1 border border-slate-700 w-full"
//                                     >
//                                         <option value="GO" className='bg-red-500'>GO</option>
//                                         <option value="COME" className='bg-green-500'>COME</option>

//                                     </select>
//                                 </td>

//                                 {/* Type */}
//                                 <td className="px-2 py-2">
//                                     <input
//                                         value={row.type ?? ''}
//                                         onChange={(e) =>
//                                             updateRow(row.id, { type: e.target.value })
//                                         }
//                                         className="bg-slate-900 text-slate-100 rounded px-2 py-1 border border-slate-700 w-full"
//                                     />
//                                 </td>

//                                 {/* Savings */}
//                                 <td className="px-2 py-2">
//                                     <input
//                                         type="number"
//                                         value={row.savings ?? 0}
//                                         onChange={(e) =>
//                                             updateRow(row.id, {
//                                                 savings: Number(e.target.value) || 0,
//                                             })
//                                         }
//                                         className="bg-slate-900 text-slate-100 rounded px-2 py-1 border border-slate-700 w-full"
//                                     />
//                                 </td>

//                                 {/* Actions */}
//                                 <th className="px-2 py-2 w-28">
//                                     <div className="flex gap-2">
//                                         <button
//                                             onClick={() => {
//                                                 navigator.clipboard?.writeText(
//                                                     JSON.stringify(row)
//                                                 );
//                                                 alert('Copied row JSON');
//                                             }}
//                                             className="px-2 py-1 bg-slate-700 rounded text-slate-300 text-xs"
//                                         >
//                                             Copy
//                                         </button>
//                                         <button
//                                             onClick={() => deleteRow(row.id)}
//                                             className="px-2 py-1  bg-rose-600 rounded text-white text-xs"
//                                         >
//                                             Delete
//                                         </button>
//                                     </div>
//                                 </th>
//                             </tr>
//                         ))}

//                         <tr>
//                             <td colSpan={5} className="px-2 py-2 text-right font-semibold space-x-2">
//                                 <button
//                                     onClick={addEmptyRow}
//                                     className="px-3 py-1 bg-slate-700 rounded text-slate-100"
//                                 >
//                                     + Add row
//                                 </button>
//                                 <button
//                                     onClick={exportCSV}
//                                     className="px-3 py-1 bg-blue-600 rounded text-white"
//                                 >
//                                     Export CSV
//                                 </button>
//                             </td>
//                         </tr>

//                         {/* Totals */}
//                         <tr className="bg-slate-900 font-medium">
//                             <td className="px-2 py-2">Totals</td>
//                             <td className="px-2 py-2 font-mono">₹ {total.toLocaleString()}</td>
//                             <td colSpan={3}></td>
//                             <td className="px-2 py-2 font-mono">
//                                 Savings: ₹ {totalSavings.toLocaleString()}
//                             </td>
//                         </tr>
//                         <tr className="bg-slate-900 font-medium">
//                             <td className="px-2 py-2">After Gurudwara</td>
//                             <td className="px-2 py-2 font-mono">
//                                 ₹ {afterGurudwaraTotal.toLocaleString()}
//                             </td>
//                             <td colSpan={4}></td>
//                         </tr>
//                         <tr className="bg-slate-900 font-semibold text-emerald-300">
//                             <td className="px-2 py-2">Spendable</td>
//                             <td className="px-2 py-2 font-mono">
//                                 ₹ {spendable.toLocaleString()}
//                             </td>
//                             <td colSpan={4}></td>
//                         </tr>
//                     </tbody>
//                 </table>
//             </div>
//         </div>
//     );
// }
//!!!!---------------
// 'use client';
// import React, { useMemo, useState } from 'react';
// import type { Transaction } from '@/types';
// import { saveAs } from 'file-saver';
// import { addTransaction, updateTransaction, deleteTransaction } from '@/lib/firestore';

// export default function Spreadsheet({
//     rows,
//     setRows,
//     uid,
// }: {
//     rows: Transaction[];
//     setRows: (r: Transaction[]) => void;
//     uid: string | null;
// }) {
//     const [editingId, setEditingId] = useState<string | null>(null);

//     const sorted = useMemo(() => {
//         return [...rows].sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());
//     }, [rows]);

//     async function updateRow(id: string, patch: Partial<Transaction>) {
//         if (!uid) return;
//         setRows(rows.map(r => (r.id === id ? { ...r, ...patch } : r)));
//         await updateTransaction(uid, id, patch);
//     }

//     async function addEmptyRow() {
//         if (!uid) return;
//         const now = new Date().toISOString().slice(0, 10);
//         const newRow: Omit<Transaction, "id"> = {
//             date: now,
//             amount: 0,
//             inOut: 'COME',
//             type: '',
//             savings: 0,
//         };
//         await addTransaction(uid, newRow);
//         // reload from Firestore
//         const refreshed = rows.concat([{ ...newRow, id: Math.random().toString(36) }]); // quick local append
//         setRows(refreshed);
//     }

//     async function deleteRow(id: string) {
//         if (!uid || !confirm('Delete this row?')) return;
//         setRows(rows.filter(r => r.id !== id));
//         await deleteTransaction(uid, id);
//     }

//     function exportCSV() {
//         const header = ['date', 'amount', 'inOut', 'type', 'savings'];
//         const csv = [
//             header.join(','),
//             ...rows.map(r =>
//                 [
//                     r.date,
//                     r.amount,
//                     r.inOut,
//                     `"${(r.type || '').replace(/"/g, '""')}"`,
//                     r.savings ?? '',
//                 ].join(',')
//             )
//         ].join('\n');
//         const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
//         saveAs(blob, 'transactions.csv');
//     }

//     const total = rows.reduce((s, r) => {
//         if (r.inOut === 'COME') return s + (r.amount || 0);
//         if (r.inOut === 'GO') return s - (r.amount || 0);
//         return s;
//     }, 0);

//     const totalSavings = rows.reduce((s, r) => s + (r.savings || 0), 0);
//     const gurudwaraTotal = 11157;
//     const afterGurudwaraTotal = total - gurudwaraTotal;
//     const spendable = afterGurudwaraTotal - totalSavings;

//     return (
//         <div className=" rounded border border-slate-700 p-4">
//             <div className="flex items-center justify-between mb-3">
//                 <h3 className="text-lg font-medium">Transactions</h3>
//                 <div className="flex gap-2">
//                     <button onClick={addEmptyRow} className="px-3 py-1 bg-slate-700 rounded text-slate-100">
//                         + Add row
//                     </button>
//                     <button onClick={exportCSV} className="px-3 py-1 bg-emerald-600 rounded text-white">
//                         Export CSV
//                     </button>
//                 </div>
//             </div>

//             <div className="overflow-auto">
//                 <table className="min-w-full table-auto text-sm">
//                     <thead>
//                         <tr className="text-left text-slate-300 border-b border-slate-700">
//                             <th className="px-2 py-2 w-28">Date</th>
//                             <th className="px-2 py-2 w-28">Amount</th>
//                             <th className="px-2 py-2 w-20">In/Out</th>
//                             <th className="px-2 py-2">Type</th>
//                             <th className="px-2 py-2 w-24">Savings</th>
//                             <th className="px-2 py-2 w-28">Actions</th>
//                         </tr>
//                     </thead>
//                     <tbody>
//                         {sorted.map(row => (
//                             <tr key={row.id} className="border-b border-slate-700">
//                                 <td className="px-2 py-2">
//                                     <input
//                                         type="date"
//                                         value={row.date}
//                                         onChange={(e) => updateRow(row.id, { date: e.target.value })}
//                                         className="bg-slate-900 text-slate-100 rounded px-2 py-1 border border-slate-700"
//                                     />
//                                 </td>

//                                 <td className="px-2 py-2">
//                                     <input
//                                         type="number"
//                                         value={row.amount}
//                                         onChange={(e) => updateRow(row.id, { amount: Number(e.target.value) })}
//                                         className={`w-28 bg-slate-900 text-slate-100 rounded px-2 py-1 border border-slate-700 text-right ${row.amount < 0 ? 'text-rose-400' : 'text-emerald-300'}`}
//                                     />
//                                 </td>

//                                 <td className="px-2 py-2">
//                                     <select
//                                         value={row.inOut}
//                                         onChange={e => updateRow(row.id, { inOut: e.target.value as 'COME' | 'GO' })}
//                                         className="bg-slate-900 text-slate-100 rounded px-2 py-1 border border-slate-700 w-full"
//                                     >
//                                         <option value="COME">COME</option>
//                                         <option value="GO">GO</option>
//                                     </select>
//                                 </td>

//                                 <td className="px-2 py-2">
//                                     <input
//                                         value={row.type ?? ''}
//                                         onChange={(e) => updateRow(row.id, { type: e.target.value })}
//                                         className="bg-slate-900 text-slate-100 rounded px-2 py-1 border border-slate-700 w-full"
//                                     />
//                                 </td>

//                                 <td className="px-2 py-2">

//                                     <input
//                                         type="number"
//                                         value={row.savings !== undefined && !isNaN(row.savings) ? row.savings : ''}
//                                         onChange={(e) =>
//                                             updateRow(row.id, {
//                                                 savings: e.target.value !== '' ? Number(e.target.value) : undefined,
//                                             })
//                                         }
//                                         className="bg-slate-900 text-slate-100 rounded px-2 py-1 border border-slate-700 w-full"
//                                     />

//                                 </td>

//                                 <td className="px-2 py-2">
//                                     <div className="flex gap-2">
//                                         <button onClick={() => { navigator.clipboard?.writeText(JSON.stringify(row)); alert('Copied row JSON'); }} className="px-2 py-1 bg-slate-700 rounded text-slate-200 text-xs">Copy</button>
//                                         <button onClick={() => deleteRow(row.id)} className="px-2 py-1 bg-rose-600 rounded text-white text-xs">Delete</button>
//                                     </div>
//                                 </td>
//                             </tr>
//                         ))}

//                         <tr className="bg-slate-900 font-medium">
//                             <td className="px-2 py-2">Totals</td>
//                             <td className="px-2 py-2 font-mono">₹ {total.toLocaleString()}</td>
//                             <td colSpan={3}></td>
//                             <td className="px-2 py-2 font-mono">Savings: ₹ {totalSavings.toLocaleString()}</td>
//                         </tr>
//                         <tr className="bg-slate-900 font-medium">
//                             <td className="px-2 py-2">After Gurudwara</td>
//                             <td className="px-2 py-2 font-mono">₹ {afterGurudwaraTotal.toLocaleString()}</td>
//                             <td colSpan={4}></td>
//                         </tr>
//                         <tr className="bg-slate-900 font-semibold text-emerald-300">
//                             <td className="px-2 py-2">Spendable</td>
//                             <td className="px-2 py-2 font-mono">₹ {spendable.toLocaleString()}</td>
//                             <td colSpan={4}></td>
//                         </tr>
//                     </tbody>
//                 </table>
//             </div>
//         </div>
//     );
// }

// // components/spreadsheet.tsx
// 'use client';
// import React, { useMemo, useState } from 'react';
// import type { Transaction } from '@/types';
// import { saveAs } from 'file-saver';

// export default function Spreadsheet({
//     rows,
//     setRows,
// }: {
//     rows: Transaction[];
//     setRows: (r: Transaction[]) => void;
// }) {
//     const [editingId, setEditingId] = useState<string | null>(null);

//     const sorted = useMemo(() => {
//         return [...rows].sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());
//     }, [rows]);

//     function updateRow(id: string, patch: Partial<Transaction>) {
//         setRows(rows.map(r => (r.id === id ? { ...r, ...patch } : r)));
//     }

//     function addEmptyRow() {
//         const now = new Date().toISOString().slice(0, 10);
//         const newRow: Transaction = {
//             id: `${now}-${Math.random().toString(36).slice(2, 9)}`,
//             date: now,
//             amount: 0,
//             inOut: 'COME',
//             type: '',
//         };
//         setRows([...rows, newRow]);
//         setEditingId(newRow.id);
//     }

//     function deleteRow(id: string) {
//         if (!confirm('Delete this row?')) return;
//         setRows(rows.filter(r => r.id !== id));
//     }

//     function exportCSV() {
//         const header = ['date', 'amount', 'inOut', 'type', 'savings'];
//         const csv = [
//             header.join(','),
//             ...rows.map(r =>
//                 [
//                     r.date,
//                     r.amount,
//                     r.inOut,
//                     `"${(r.type || '').replace(/"/g, '""')}"`,
//                     r.savings ?? '',
//                 ].join(',')
//             )
//         ].join('\n');
//         const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
//         saveAs(blob, 'transactions.csv');
//     }

//     const total = rows.reduce((s, r) => {
//         if (r.inOut === 'COME') return s + (r.amount || 0);
//         if (r.inOut === 'GO') return s - (r.amount || 0);
//         return s;
//     }, 0);

//     const totalSavings = rows.reduce((s, r) => s + (r.savings || 0), 0);
//     const gurudwaraTotal = 11157;
//     const afterGurudwaraTotal = total - gurudwaraTotal;
//     const spendable = afterGurudwaraTotal - totalSavings;

//     return (
//         <div className=" rounded border border-slate-700 p-4">
//             <div className="flex items-center justify-between mb-3">
//                 <h3 className="text-lg font-medium">Transactions</h3>
//                 <div className="flex gap-2">
//                     <button onClick={addEmptyRow} className="px-3 py-1 bg-slate-700 rounded text-slate-100">
//                         + Add row
//                     </button>
//                     <button onClick={exportCSV} className="px-3 py-1 bg-emerald-600 rounded text-white">
//                         Export CSV
//                     </button>
//                 </div>
//             </div>

//             <div className="overflow-auto">
//                 <table className="min-w-full table-auto text-sm">
//                     <thead>
//                         <tr className="text-left text-slate-300 border-b border-slate-700">
//                             <th className="px-2 py-2 w-28">Date</th>
//                             <th className="px-2 py-2 w-28">Amount</th>
//                             <th className="px-2 py-2 w-20">In/Out</th>
//                             <th className="px-2 py-2">Type</th>
//                             <th className="px-2 py-2 w-24">Savings</th>
//                             <th className="px-2 py-2 w-28">Actions</th>
//                         </tr>
//                     </thead>
//                     <tbody>
//                         {sorted.map(row => (
//                             <tr key={row.id} className="border-b border-slate-700">
//                                 <td className="px-2 py-2">
//                                     <input
//                                         type="date"
//                                         value={row.date}
//                                         onChange={(e) => updateRow(row.id, { date: e.target.value })}
//                                         className="bg-slate-900 text-slate-100 rounded px-2 py-1 border border-slate-700"
//                                     />
//                                 </td>

//                                 <td className="px-2 py-2">
//                                     <input
//                                         type="number"
//                                         value={row.amount}
//                                         onChange={(e) => updateRow(row.id, { amount: Number(e.target.value) })}
//                                         className={`w-28 bg-slate-900 text-slate-100 rounded px-2 py-1 border border-slate-700 text-right ${row.amount < 0 ? 'text-rose-400' : 'text-emerald-300'}`}
//                                     />
//                                 </td>

//                                 <td className="px-2 py-2">
//                                     <select
//                                         value={row.inOut}
//                                         onChange={e => updateRow(row.id, { inOut: e.target.value as 'COME' | 'GO' })}
//                                         className="bg-slate-900 text-slate-100 rounded px-2 py-1 border border-slate-700 w-full"
//                                     >
//                                         <option value="COME">COME</option>
//                                         <option value="GO">GO</option>
//                                     </select>
//                                 </td>

//                                 <td className="px-2 py-2">
//                                     <input
//                                         value={row.type ?? ''}
//                                         onChange={(e) => updateRow(row.id, { type: e.target.value })}
//                                         className="bg-slate-900 text-slate-100 rounded px-2 py-1 border border-slate-700 w-full"
//                                     />
//                                 </td>

//                                 <td className="px-2 py-2">

//                                     <input
//                                         type="number"
//                                         value={row.savings !== undefined && !isNaN(row.savings) ? row.savings : ''}
//                                         onChange={(e) =>
//                                             updateRow(row.id, {
//                                                 savings: e.target.value !== '' ? Number(e.target.value) : undefined,
//                                             })
//                                         }
//                                         className="bg-slate-900 text-slate-100 rounded px-2 py-1 border border-slate-700 w-full"
//                                     />

//                                 </td>

//                                 <td className="px-2 py-2">
//                                     <div className="flex gap-2">
//                                         <button onClick={() => { navigator.clipboard?.writeText(JSON.stringify(row)); alert('Copied row JSON'); }} className="px-2 py-1 bg-slate-700 rounded text-slate-200 text-xs">Copy</button>
//                                         <button onClick={() => deleteRow(row.id)} className="px-2 py-1 bg-rose-600 rounded text-white text-xs">Delete</button>
//                                     </div>
//                                 </td>
//                             </tr>
//                         ))}

//                         <tr className="bg-slate-900 font-medium">
//                             <td className="px-2 py-2">Totals</td>
//                             <td className="px-2 py-2 font-mono">₹ {total.toLocaleString()}</td>
//                             <td colSpan={3}></td>
//                             <td className="px-2 py-2 font-mono">Savings: ₹ {totalSavings.toLocaleString()}</td>
//                         </tr>
//                         <tr className="bg-slate-900 font-medium">
//                             <td className="px-2 py-2">After Gurudwara</td>
//                             <td className="px-2 py-2 font-mono">₹ {afterGurudwaraTotal.toLocaleString()}</td>
//                             <td colSpan={4}></td>
//                         </tr>
//                         <tr className="bg-slate-900 font-semibold text-emerald-300">
//                             <td className="px-2 py-2">Spendable</td>
//                             <td className="px-2 py-2 font-mono">₹ {spendable.toLocaleString()}</td>
//                             <td colSpan={4}></td>
//                         </tr>
//                     </tbody>
//                 </table>
//             </div>
//         </div>
//     );
// }