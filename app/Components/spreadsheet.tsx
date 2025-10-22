'use client';

import React, { useMemo, useState } from 'react';
import type { Transaction } from '@/types';
import { saveAs } from 'file-saver';
import {
    addTransaction,
    updateTransaction,
    deleteTransaction,
} from '@/lib/firestore';

export default function Spreadsheet({
    rows,
    setRows,
    uid,
}: {
    rows: Transaction[];
    setRows: (r: Transaction[]) => void;
    uid: string | null;
}) {
    const [confirmDelete, setConfirmDelete] = useState<Transaction | null>(null);
    const [editingId, setEditingId] = useState<string | null>(null);
    const [errorMsg, setErrorMsg] = useState<string | null>(null);

    // Sort rows by date ascending
    const sorted = useMemo(() => {
        return [...rows].sort(
            (a, b) => new Date(a.date).getTime() - new Date(b.date).getTime()
        );
    }, [rows]);

    // Update existing row (only if editable)
    async function updateRow(id: string, patch: Partial<Transaction>) {
        if (!uid) return;
        const patched = rows.map((r) => (r.id === id ? { ...r, ...patch } : r));
        setRows(patched);
    }

    function getLocalDateString() {
        const now = new Date();
        const year = now.getFullYear();
        const month = String(now.getMonth() + 1).padStart(2, '0');
        const day = String(now.getDate()).padStart(2, '0');
        return `${year}-${month}-${day}`;
    }

    // Add a new blank editable row
    async function addEmptyRow() {
        if (!uid) return;

        const now = getLocalDateString();

        const newRow: Transaction = {
            id: `temp-${Date.now()}`, // temporary id until saved
            date: now,
            amount: undefined as unknown as number, // leave blank
            inOut: 'COME',
            type: '',
            savings: undefined as unknown as number,
        };

        setRows([...rows, newRow]);
        setEditingId(newRow.id);
    }

    // Save row after editing (validation)
    async function saveRow(row: Transaction) {
        if (!uid) return;

        // Validate required fields
        if (!row.date || row.amount === undefined || row.inOut === 'COME' || row.savings === undefined) {
            setErrorMsg('Please fill in all required fields (Date, Amount, In/Out, Savings).');
            setTimeout(() => setErrorMsg(null), 3000);
            return;
        }

        if (row.id.startsWith('temp-')) {
            const newRow = { ...row };
            const docId = await addTransaction(uid, newRow);
            newRow.id = docId;
            setRows(rows.map((r) => (r.id === row.id ? newRow : r)));
        } else {
            await updateTransaction(uid, row.id, row);
        }

        setEditingId(null);
        setErrorMsg(null);
    }

    // Delete row after confirmation
    async function confirmDeleteRow() {
        if (!uid || !confirmDelete) return;
        const id = confirmDelete.id;
        setRows(rows.filter((r) => r.id !== id));
        await deleteTransaction(uid, id);
        setConfirmDelete(null);
    }

    // Export CSV
    function exportCSV() {
        const header = ['date', 'amount', 'inOut', 'type', 'savings'];
        const csv = [
            header.join(','),
            ...rows.map((r) =>
                [
                    r.date,
                    r.amount ?? '',
                    r.inOut,
                    `"${(r.type || '').replace(/"/g, '""')}"`,
                    r.savings ?? '',
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
    const afterGurudwaraTotal = total;
    const spendable = afterGurudwaraTotal - totalSavings;

    return (
        <div className="relative">
            {/* ❗ Error Toast */}
            {errorMsg && (
                <div className="fixed top-6 right-6 bg-red-600 text-white px-4 py-2 rounded-lg shadow-lg z-50">
                    {errorMsg}
                </div>
            )}

            {/* 🔥 Delete Confirmation Modal */}
            {confirmDelete && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-md">
                    <div className="bg-slate-800/80 backdrop-blur-xl rounded-xl p-6 w-full max-w-md border border-slate-600 text-white shadow-lg">
                        <h2 className="text-lg font-semibold mb-3 text-center text-red-400">
                            Confirm Deletion
                        </h2>
                        <p className="text-sm text-slate-300 mb-4 text-center">
                            Are you sure you want to delete this transaction?
                        </p>

                        <div className="bg-slate-900/50 rounded-lg p-4 text-sm mb-4 border border-slate-700">
                            <p><strong>Date:</strong> {confirmDelete.date}</p>
                            <p><strong>Amount:</strong> ₹ {confirmDelete.amount}</p>
                            <p><strong>Description:</strong> {confirmDelete.type || '—'}</p>
                            <p>
                                <strong>Transaction:</strong>{' '}
                                {confirmDelete.inOut === 'COME' ? 'CREDIT' : 'DEBIT'}
                            </p>
                        </div>

                        <div className="flex justify-center gap-4">
                            <button
                                onClick={confirmDeleteRow}
                                className="px-4 py-2 bg-red-600 hover:bg-red-700 rounded-lg text-white font-medium"
                            >
                                Delete
                            </button>
                            <button
                                onClick={() => setConfirmDelete(null)}
                                className="px-4 py-2 bg-slate-600 hover:bg-slate-500 rounded-lg text-white font-medium"
                            >
                                Cancel
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {/* Main Table */}
            <div
                className={`rounded border border-slate-700 p-4 ${confirmDelete ? 'blur-sm pointer-events-none' : ''
                    }`}
            >
                <div className="flex items-center justify-between mb-3">
                    <h3 className="text-lg font-medium">Transactions</h3>
                </div>

                <div className="overflow-auto">
                    <table className="table-auto text-sm w-full">
                        <thead>
                            <tr className="text-left text-slate-300 border-b border-slate-700">
                                <th className="px-2 py-2 w-28">Date</th>
                                <th className="px-2 py-2 w-28">Amount</th>
                                <th className="px-2 py-2 w-30">DEBIT / CREDIT</th>
                                <th className="px-2 py-2">Description</th>
                                <th className="px-2 py-2 w-24">Savings</th>
                                <th className="px-2 py-2 w-28">Actions</th>
                            </tr>
                        </thead>
                        <tbody>
                            {sorted.length > 0 ? (
                                sorted.map((row) => {
                                    const isEditing = editingId === row.id;
                                    return (
                                        <tr key={row.id} className="border-b border-slate-700">
                                            {/* Date */}
                                            <td className="px-2 py-2">
                                                <input
                                                    type="date"
                                                    value={row.date}
                                                    onChange={(e) =>
                                                        updateRow(row.id, { date: e.target.value })
                                                    }
                                                    disabled={!isEditing}
                                                    className={`bg-slate-900 text-slate-100 rounded px-2 py-1 border border-slate-700 w-full ${!isEditing ? 'opacity-50 cursor-not-allowed' : ''
                                                        }`}
                                                />
                                            </td>

                                            {/* Amount */}
                                            <td className="px-2 py-2">
                                                <input
                                                    type="number"
                                                    value={row.amount ?? ''}
                                                    onChange={(e) =>
                                                        updateRow(row.id, {
                                                            amount: e.target.value
                                                                ? Number(e.target.value)
                                                                : undefined,
                                                        })
                                                    }
                                                    disabled={!isEditing}
                                                    className={`w-28 bg-slate-900 text-slate-100 rounded px-2 py-1 border border-slate-700 text-right appearance-none ${!isEditing
                                                        ? 'opacity-50 cursor-not-allowed'
                                                        : (row.amount ?? 0) < 0
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
                                                    disabled={!isEditing}
                                                    className={`bg-slate-900 text-slate-100 rounded px-2 py-1 border border-black md:w-full ${!isEditing ? 'opacity-50 cursor-not-allowed' : ''
                                                        }`}
                                                >
                                                    <option value="GO">DEBIT</option>
                                                    <option value="COME">CREDIT</option>
                                                </select>
                                            </td>

                                            {/* Type */}
                                            <td className="px-2 py-2">
                                                <input
                                                    value={row.type ?? ''}
                                                    onChange={(e) =>
                                                        updateRow(row.id, { type: e.target.value })
                                                    }
                                                    disabled={!isEditing}
                                                    className={`bg-slate-900 text-slate-100 rounded px-2 py-1 border border-slate-700 md:w-full ${!isEditing ? 'opacity-50 cursor-not-allowed' : ''
                                                        }`}
                                                />
                                            </td>

                                            {/* Savings */}
                                            <td className="px-2 py-2">
                                                <input
                                                    type="number"
                                                    value={row.savings ?? ''}
                                                    onChange={(e) =>
                                                        updateRow(row.id, {
                                                            savings: e.target.value
                                                                ? Number(e.target.value)
                                                                : undefined,
                                                        })
                                                    }
                                                    disabled={!isEditing}
                                                    className={`bg-slate-900 text-slate-100 rounded px-2 py-1 border border-slate-700 md:w-full appearance-none ${!isEditing ? 'opacity-50 cursor-not-allowed' : ''
                                                        }`}
                                                />
                                            </td>

                                            {/* Actions */}
                                            <td className="px-2 py-2 w-28">
                                                <div className="flex gap-2">
                                                    {isEditing ? (
                                                        <button
                                                            onClick={() => saveRow(row)}
                                                            className="px-2 py-1 bg-green-600 hover:bg-green-700 rounded-lg text-white"
                                                        >
                                                            Save
                                                        </button>
                                                    ) : (
                                                        <button
                                                            onClick={() => setEditingId(row.id)}
                                                            className="px-2 py-1 bg-yellow-600 hover:bg-yellow-700 rounded-lg text-white"
                                                        >
                                                            Edit
                                                        </button>
                                                    )}
                                                    <button
                                                        onClick={() => setConfirmDelete(row)}
                                                        className="px-2 py-1 bg-red-600 hover:bg-rose-700 rounded-lg text-white"
                                                    >
                                                        Delete
                                                    </button>
                                                </div>
                                            </td>
                                        </tr>
                                    );
                                })
                            ) : (
                                <tr>
                                    <td
                                        colSpan={6}
                                        className="px-2 py-6 text-center text-slate-400"
                                    >
                                        No transactions yet. Click <strong>+ Add row</strong> to get
                                        started.
                                    </td>
                                </tr>
                            )}

                            {/* Add + Export */}
                            <tr>
                                <td
                                    colSpan={6}
                                    className="px-2 py-2 text-right font-semibold space-x-2"
                                >
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
                                        <td className="px-2 py-2 font-mono">
                                            ₹ {total.toLocaleString()}
                                        </td>
                                        <td colSpan={3}></td>
                                        <td className="px-2 py-2 font-mono">
                                            Savings: ₹ {totalSavings.toLocaleString()}
                                        </td>
                                    </tr>

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
//     const [confirmDelete, setConfirmDelete] = useState<Transaction | null>(null);
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

//     // Local date helper
//     function getLocalDateString() {
//         const now = new Date();
//         const year = now.getFullYear();
//         const month = String(now.getMonth() + 1).padStart(2, '0');
//         const day = String(now.getDate()).padStart(2, '0');
//         return `${year}-${month}-${day}`;
//     }

//     // Add row
//     async function addEmptyRow() {
//         if (!uid) return;

//         const now = getLocalDateString();

//         // ✅ Amount = null (not 0)
//         const newRow: Omit<Transaction, 'id'> = {
//             date: now,
//             amount: undefined as unknown as number, // blank field
//             inOut: 'COME',
//             type: '',
//             savings: undefined as unknown as number,
//         };

//         const docId = await addTransaction(uid, newRow);
//         setRows([...rows, { ...newRow, id: docId }]);
//         setEditingId(docId); // auto enable edit mode for new row
//     }

//     // Delete row
//     async function confirmDeleteRow() {
//         if (!uid || !confirmDelete) return;
//         const id = confirmDelete.id;
//         setRows(rows.filter(r => r.id !== id));
//         await deleteTransaction(uid, id);
//         setConfirmDelete(null);
//     }

//     // Export CSV
//     function exportCSV() {
//         const header = ['date', 'amount', 'inOut', 'type', 'savings'];
//         const csv = [
//             header.join(','),
//             ...rows.map(r =>
//                 [
//                     r.date,
//                     r.amount ?? '',
//                     r.inOut,
//                     `"${(r.type || '').replace(/"/g, '""')}"`,
//                     r.savings ?? '',
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
//     const spendable = total - totalSavings;

//     return (
//         <div className="relative">
//             {/* 🔥 Delete Confirmation Modal */}
//             {confirmDelete && (
//                 <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-md">
//                     <div className="bg-slate-800/80 backdrop-blur-xl rounded-xl p-6 w-full max-w-md border border-slate-600 text-white shadow-lg">
//                         <h2 className="text-lg font-semibold mb-3 text-center text-red-400">
//                             Confirm Deletion
//                         </h2>
//                         <p className="text-sm text-slate-300 mb-4 text-center">
//                             Are you sure you want to delete this transaction?
//                         </p>

//                         <div className="bg-slate-900/50 rounded-lg p-4 text-sm mb-4 border border-slate-700">
//                             <p><strong>Date:</strong> {confirmDelete.date}</p>
//                             <p><strong>Amount:</strong> ₹ {confirmDelete.amount}</p>
//                             <p><strong>Description:</strong> {confirmDelete.type || '—'}</p>
//                             <p>
//                                 <strong>Transaction:</strong>{' '}
//                                 {confirmDelete.inOut === 'COME'
//                                     ? 'CREDIT'
//                                     : 'DEBIT'}
//                             </p>
//                         </div>

//                         <div className="flex justify-center gap-4">
//                             <button
//                                 onClick={confirmDeleteRow}
//                                 className="px-4 py-2 bg-red-600 hover:bg-red-700 rounded-lg text-white font-medium"
//                             >
//                                 Delete
//                             </button>
//                             <button
//                                 onClick={() => setConfirmDelete(null)}
//                                 className="px-4 py-2 bg-slate-600 hover:bg-slate-500 rounded-lg text-white font-medium"
//                             >
//                                 Cancel
//                             </button>
//                         </div>
//                     </div>
//                 </div>
//             )}

//             {/* Main Table */}
//             <div className={`rounded border border-slate-700 p-4 ${confirmDelete ? 'blur-sm pointer-events-none' : ''}`}>
//                 <div className="flex items-center justify-between mb-3">
//                     <h3 className="text-lg font-medium">Transactions</h3>
//                 </div>

//                 <div className="overflow-auto">
//                     <table className="table-auto text-sm w-full">
//                         <thead>
//                             <tr className="text-left text-slate-300 border-b border-slate-700">
//                                 <th className="px-2 py-2 w-28">Date</th>
//                                 <th className="px-2 py-2 w-28">Amount</th>
//                                 <th className="px-2 py-2 w-30">DEBIT / CREDIT</th>
//                                 <th className="px-2 py-2">Description</th>
//                                 <th className="px-2 py-2 w-24">Savings</th>
//                                 <th className="px-2 py-2 w-36">Actions</th>
//                             </tr>
//                         </thead>
//                         <tbody>
//                             {sorted.length > 0 ? (
//                                 sorted.map(row => {
//                                     const isEditing = editingId === row.id;

//                                     return (
//                                         <tr key={row.id} className="border-b border-slate-700">
//                                             {/* Date */}
//                                             <td className="px-2 py-2">
//                                                 <input
//                                                     type="date"
//                                                     value={row.date}
//                                                     onChange={(e) =>
//                                                         updateRow(row.id, { date: e.target.value })
//                                                     }
//                                                     disabled={!isEditing}
//                                                     className={`bg-slate-900 text-slate-100 rounded px-2 py-1 border border-slate-700 w-full ${!isEditing && 'opacity-50 cursor-not-allowed'}`}
//                                                 />
//                                             </td>

//                                             {/* Amount */}
//                                             <td className="px-2 py-2">
//                                                 <input
//                                                     type="number"
//                                                     value={row.amount ?? ''}
//                                                     onChange={(e) =>
//                                                         updateRow(row.id, {
//                                                             amount: e.target.value === '' ? undefined : Number(e.target.value),
//                                                         })
//                                                     }
//                                                     disabled={!isEditing}
//                                                     className={`w-28 bg-slate-900 text-slate-100 rounded px-2 py-1 border border-slate-700 text-right appearance-none ${!isEditing ? 'opacity-50 cursor-not-allowed' : ''} ${(row.amount ?? 0) < 0
//                                                         ? 'text-rose-400'
//                                                         : 'text-emerald-300'
//                                                         }`}
//                                                 />
//                                             </td>

//                                             {/* In/Out */}
//                                             <td className="px-2 py-2">
//                                                 <select
//                                                     value={row.inOut}
//                                                     onChange={(e) =>
//                                                         updateRow(row.id, {
//                                                             inOut: e.target.value as 'GO' | 'COME',
//                                                         })
//                                                     }
//                                                     disabled={!isEditing}
//                                                     className={`bg-slate-900 text-slate-100 rounded px-2 py-1 border border-black md:w-full ${!isEditing && 'opacity-50 cursor-not-allowed'}`}
//                                                 >
//                                                     <option value="GO" className="bg-red-500 text-slate-100">DEBIT</option>
//                                                     <option value="COME" className="bg-green-500 text-slate-100">CREDIT</option>
//                                                 </select>
//                                             </td>

//                                             {/* Type */}
//                                             <td className="px-2 py-2">
//                                                 <input
//                                                     value={row.type ?? ''}
//                                                     onChange={(e) =>
//                                                         updateRow(row.id, { type: e.target.value })
//                                                     }
//                                                     disabled={!isEditing}
//                                                     className={`bg-slate-900 text-slate-100 rounded px-2 py-1 border border-slate-700 md:w-full ${!isEditing && 'opacity-50 cursor-not-allowed'}`}
//                                                 />
//                                             </td>

//                                             {/* Savings */}
//                                             <td className="px-2 py-2">
//                                                 <input
//                                                     type="number"
//                                                     value={row.savings ?? ''}
//                                                     onChange={(e) =>
//                                                         updateRow(row.id, {
//                                                             savings: e.target.value === '' ? undefined : Number(e.target.value),
//                                                         })
//                                                     }
//                                                     disabled={!isEditing}
//                                                     className={`bg-slate-900 text-slate-100 rounded px-2 py-1 border border-slate-700 md:w-full appearance-none ${!isEditing && 'opacity-50 cursor-not-allowed'}`}
//                                                 />
//                                             </td>

//                                             {/* Actions */}
//                                             <td className="px-2 py-2 w-36 flex gap-2">
//                                                 {!isEditing ? (
//                                                     <button
//                                                         onClick={() => setEditingId(row.id)}
//                                                         className="px-2 py-1 bg-yellow-500 hover:bg-yellow-600 rounded-lg text-black font-medium"
//                                                     >
//                                                         Edit
//                                                     </button>
//                                                 ) : (
//                                                     <button
//                                                         onClick={() => setEditingId(null)}
//                                                         className="px-2 py-1 bg-green-600 hover:bg-green-700 rounded-lg text-white font-medium"
//                                                     >
//                                                         Save
//                                                     </button>
//                                                 )}
//                                                 <button
//                                                     onClick={() => setConfirmDelete(row)}
//                                                     className="px-2 py-1 bg-red-600 hover:bg-rose-700 rounded-lg text-white"
//                                                 >
//                                                     Delete
//                                                 </button>
//                                             </td>
//                                         </tr>
//                                     );
//                                 })
//                             ) : (
//                                 <tr>
//                                     <td colSpan={6} className="px-2 py-6 text-center text-slate-400">
//                                         No transactions yet. Click{" "}
//                                         <strong>+ Add row</strong> to get started.
//                                     </td>
//                                 </tr>
//                             )}

//                             {/* Add + Export */}
//                             <tr>
//                                 <td colSpan={6} className="px-2 py-2 text-right font-semibold space-x-2">
//                                     <button
//                                         onClick={addEmptyRow}
//                                         className="px-3 py-1 bg-slate-700 hover:bg-slate-600 rounded text-slate-100"
//                                     >
//                                         + Add row
//                                     </button>
//                                     <button
//                                         onClick={exportCSV}
//                                         className="px-3 py-1 bg-blue-600 hover:bg-blue-700 rounded text-white"
//                                     >
//                                         Export CSV
//                                     </button>
//                                 </td>
//                             </tr>

//                             {/* Totals */}
//                             {sorted.length > 0 && (
//                                 <>
//                                     <tr className="bg-slate-900 font-medium">
//                                         <td className="px-2 py-2">Totals</td>
//                                         <td className="px-2 py-2 font-mono">₹ {total.toLocaleString()}</td>
//                                         <td colSpan={3}></td>
//                                         <td className="px-2 py-2 font-mono">
//                                             Savings: ₹ {totalSavings.toLocaleString()}
//                                         </td>
//                                     </tr>

//                                     <tr className="bg-slate-900 font-semibold text-emerald-300">
//                                         <td className="px-2 py-2">Spendable</td>
//                                         <td className="px-2 py-2 font-mono">
//                                             ₹ {spendable.toLocaleString()}
//                                         </td>
//                                         <td colSpan={4}></td>
//                                     </tr>
//                                 </>
//                             )}
//                         </tbody>
//                     </table>
//                 </div>
//             </div>
//         </div>
//     );
// }