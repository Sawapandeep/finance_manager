// @/app/Components/linegraph.tsx
'use client';

import React from 'react';
import {
  LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
} from 'recharts';
import type { Transaction } from '@/types';

export default function LineGraph({ rows }: { rows: Transaction[] }) {
  const monthly = rows.reduce((acc, r) => {
    const month = new Date(r.date).toLocaleString('default', { month: 'short', year: '2-digit' });
    if (!acc[month]) acc[month] = { month, total: 0, savings: 0 };
    if (r.inOut === 'COME') acc[month].total += r.amount;
    else acc[month].total -= r.amount;
    acc[month].savings += r.savings || 0;
    return acc;
  }, {} as Record<string, { month: string; total: number; savings: number }>);

  const data = Object.values(monthly);

  if (data.length === 0) return null;

  return (
    <div
      className="rounded-2xl p-4 sm:p-5"
      style={{ background: 'var(--surface)', border: '1px solid var(--border)' }}
    >
      <p className="text-sm font-medium mb-4" style={{ color: 'var(--text-muted)' }}>
        Monthly overview
      </p>
      <ResponsiveContainer height={220}>
        <LineChart data={data} margin={{ left: -20 }}>
          <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" vertical={false} />
          <XAxis dataKey="month" stroke="var(--text-muted)" fontSize={12} tickLine={false} axisLine={false} />
          <YAxis stroke="var(--text-muted)" fontSize={12} tickLine={false} axisLine={false} />
          <Tooltip
            contentStyle={{
              backgroundColor: 'var(--surface-2)',
              borderRadius: 8,
              border: '1px solid var(--border)',
              fontSize: 12,
            }}
          />
          <Line type="monotone" dataKey="total" stroke="var(--credit)" strokeWidth={2} dot={false} name="Net" />
          <Line type="monotone" dataKey="savings" stroke="var(--savings)" strokeWidth={2} dot={false} name="Savings" />
        </LineChart>
      </ResponsiveContainer>
    </div>
  );
}
// // components/linegraph.tsx
// 'use client';

// import React from 'react';
// import {
//     LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer
// } from 'recharts';
// import type { Transaction } from '@/types';

// export default function LineGraph({ rows }: { rows: Transaction[] }) {
//     // Group by month
//     const monthly = rows.reduce((acc, r) => {
//         const month = new Date(r.date).toLocaleString('default', { month: 'short', year: 'numeric' });
//         if (!acc[month]) acc[month] = { month, total: 0, expenses: 0, savings: 0 };

//         if (r.inOut === 'COME') {
//             acc[month].total += r.amount;
//         } else {
//             acc[month].total -= r.amount;
//             acc[month].expenses += r.amount; // store expenses separately
//         }

//         acc[month].savings += r.savings || 0;
//         return acc;
//     }, {} as Record<string, { month: string; total: number; expenses: number; savings: number }>);

//     const data = Object.values(monthly);

//     return (
//         <div className="rounded-xl border border-slate-800 bg-[#0f0f0f] p-6 shadow-lg animate-fadeIn">
//             <h3 className="text-xl font-semibold text-slate-200 mb-2">Monthly Overview</h3>
//             <p className="text-sm text-slate-400 mb-4">Track income, expenses, and savings over time</p>
//             <ResponsiveContainer height={350}>
//                 <LineChart data={data}>
//                     <CartesianGrid strokeDasharray="3 3" stroke="#333" />
//                     <XAxis dataKey="month" stroke="#aaa" />
//                     <YAxis stroke="#aaa" />
//                     <Tooltip contentStyle={{ backgroundColor: "#1a1a1a", borderRadius: "8px", border: "1px solid #333" }} />
//                     <Legend />
//                     <Line type="monotone" dataKey="total" stroke="#3b82f6" strokeWidth={2} name="Net Total" dot={false} />
//                     <Line type="monotone" dataKey="savings" stroke="#22c55e" strokeWidth={2} name="Savings" dot={false} />
//                     <Line type="monotone" dataKey="expenses" stroke="#ef4444" strokeWidth={2} name="Expenses" dot={false} />
//                 </LineChart>
//             </ResponsiveContainer>
//         </div>
//     );

// }
