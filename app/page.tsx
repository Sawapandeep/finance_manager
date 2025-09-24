'use client';

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { onAuthStateChanged } from "firebase/auth";
import { auth } from "@/lib/firebase";
import { isAllowedUser } from "@/lib/auth";
import GoogleSignInButton from "./Components/GoogleSignInButton";
export default function HomePage() {
  const router = useRouter();

  useEffect(() => {
    const unsub = onAuthStateChanged(auth, (user) => {
      if (user && isAllowedUser(user)) {
        router.push("/dashboard");
      }
    });
    return () => unsub();
  }, [router]);

  return (
    <div className="flex flex-col items-center justify-center h-screen">
      <h1 className="mb-4 text-2xl font-bold">Welcome</h1>
      <GoogleSignInButton />
    </div>
  );
}

// 'use client';
// import React, { useState } from 'react';
// import type { Transaction } from '@/types';
// import UploadPaste from '@/app/Components/uploadPaste';
// import Spreadsheet from '@/app/Components/spreadsheet';
// import LineGraph from '@/app/Components/linegraph';

// export default function Home() {
//   const [rows, setRows] = useState<Transaction[]>([]);

//   return (
//     <main className=" bg-black space-y-6 p-6">
//       {/* Graph Section */}
//       <LineGraph rows={rows} />

//       {/* Upload & Paste Section */}
//       <UploadPaste onImport={(t) => setRows([...rows, ...t])} />

//       {/* Spreadsheet Section */}
//       <Spreadsheet rows={rows} setRows={setRows} />
//     </main>
//   );
// }

// 'use client';

// import { useState, useMemo } from 'react';
// import { LineChart, Line, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid } from 'recharts';
// import Spreadsheet from './Components/spreadsheet';
// import UploadPaste from './Components/uploadPaste';
// import type { Transaction } from '@/types';

// export default function Page() {
//   const [rows, setRows] = useState<Transaction[]>([]);

//   // ----- Totals -----
//   const total = useMemo(() => rows.reduce((sum, r) => {
//     if (r.inOut === 'COME') return sum + (r.amount || 0);
//     if (r.inOut === 'GO') return sum - (r.amount || 0);
//     return sum;
//   }, 0), [rows]);

//   const totalSavings = useMemo(() => rows.reduce((sum, r) => sum + (r.savings || 0), 0), [rows]);

//   const gurudwaraTotal = 11157;

//   const afterGurudwaraTotal = total - gurudwaraTotal;
//   const spendable = afterGurudwaraTotal - totalSavings;

//   const monthlyData = useMemo(() => {
//     const map = new Map<string, { value: number; savings: number }>();

//     rows.forEach(r => {
//       const month = r.date?.slice(0, 7); // yyyy-mm
//       if (!month) return;

//       const prev = map.get(month) || { value: 0, savings: 0 };

//       const newVal =
//         r.inOut === 'COME'
//           ? prev.value + r.amount
//           : prev.value - r.amount;

//       const newSavings = prev.savings + (r.savings || 0);

//       map.set(month, { value: newVal, savings: newSavings });
//     });

//     return Array.from(map.entries())
//       .sort(([a], [b]) => a.localeCompare(b))
//       .map(([month, { value, savings }]) => ({ month, value, savings }));
//   }, [rows]);

//   return (
//     <main className=" from-slate-950 via-slate-900 to-slate-950 text-slate-100 p-6 space-y-12">

//       {/* --- Chart Section --- */}
//       <section className="max-w-6xl mx-auto w-full">
//         <h1 className="text-3xl font-bold mb-6 text-center">Monthly Balance Overview</h1>
//         <div className="bg-slate-900 rounded-2xl shadow-lg p-6">
//           <ResponsiveContainer width="100%" height={300}>
//             <LineChart data={monthlyData}>
//               <CartesianGrid strokeDasharray="3 3" stroke="#475569" />
//               <XAxis dataKey="month" stroke="#cbd5e1" />
//               <YAxis stroke="#cbd5e1" />
//               <Tooltip contentStyle={{ background: '#1e293b', border: 'none' }} />
//               <Line
//                 type="monotone"
//                 dataKey="value"
//                 stroke="#38bdf8" // blue
//                 strokeWidth={2}
//                 dot={false}
//                 name="Balance"
//               />
//               <Line
//                 type="monotone"
//                 dataKey="savings"
//                 stroke="#22c55e" // green
//                 strokeWidth={2}
//                 dot={false}
//                 name="Savings"
//               />
//             </LineChart>
//           </ResponsiveContainer>


//         </div>
//       </section>

//       {/* --- Totals Section --- */}
//       <section className="max-w-6xl mx-auto grid grid-cols-1 md:grid-cols-2 gap-6 items-start">
//         {/* Left: Button + Upload */}
//         <div className="space-y-4">
//           <UploadPaste onImport={(incoming: Transaction[]) => setRows(prev => [...prev, ...incoming])} />
//           <button
//             onClick={() => setRows([...rows, {
//               id: crypto.randomUUID(),
//               date: new Date().toISOString().slice(0, 10),
//               amount: 0,
//               inOut: 'COME',
//               type: '',
//               savings: 0,
//             }])}
//             className="px-4 py-2 rounded-xl bg-sky-600 hover:bg-sky-700 font-medium"
//           >
//             Add New Row
//           </button>
//         </div>

//         {/* Right: Totals */}
//         <div className="bg-slate-900 rounded-2xl shadow-lg p-6 space-y-4">
//           <h2 className="text-xl font-semibold mb-2">Summary</h2>
//           <div className="space-y-2">
//             <p>Total: <span className="font-bold text-sky-400">{total}</span></p>
//             <p>sub Total: <span className="font-bold text-emerald-400">{afterGurudwaraTotal}</span></p>
//             <p>Spendable Total: <span className="font-bold text-pink-400">{spendable}</span></p>
//           </div>
//         </div>
//       </section>

//       {/* --- Table Section --- */}
//       <section className="max-w-6xl mx-auto">
//         <div className="bg-slate-900 rounded-2xl shadow-lg p-4 overflow-y-auto max-h-[400px]">
//           <Spreadsheet rows={rows} setRows={setRows} />
//         </div>
//       </section>
//     </main>
//   );
// }

// // 'use client';
// // import { useEffect, useState } from 'react';
// // import Spreadsheet from '@/app/Components/spreadsheet';
// // import UploadPaste from '@/app/Components/uploadPaste';
// // import type { Transaction } from '@/types';

// // export default function Page() {
// //   const [rows, setRows] = useState<Transaction[]>([]);

// //   useEffect(() => {
// //     const raw = localStorage.getItem('fm_transactions_v1');
// //     if (raw) {
// //       try { setRows(JSON.parse(raw)); } catch { setRows([]); }
// //     }
// //   }, []);

// //   useEffect(() => {
// //     localStorage.setItem('fm_transactions_v1', JSON.stringify(rows));
// //   }, [rows]);

// //   const handleImport = (incoming: Transaction[]) => {
// //     setRows(prev => [...prev, ...incoming].sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime()));
// //   };

// //   const handleClear = () => {
// //     if (!confirm('Clear all saved transactions?')) return;
// //     setRows([]);
// //   };

// //   return (
// //     <div className="space-y-6">
// //       <div className="grid md:grid-cols-3 gap-4">
// //         <div className="md:col-span-2">
// //           <UploadPaste onImport={handleImport} />
// //         </div>

// //         <div className="space-y-3 p-4 bg-slate-800 rounded border border-slate-700">
// //           <button
// //             onClick={handleClear}
// //             className="flex-1 bg-rose-600 hover:brightness-110 rounded px-3 py-2 text-white text-sm"
// //           >
// //             Clear all
// //           </button>
// //         </div>
// //       </div>

// //       <Spreadsheet rows={rows} setRows={setRows} />
// //     </div>
// //   );
// // }