// components/linegraph.tsx
'use client';

import React from 'react';
import {
    LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer
} from 'recharts';
import type { Transaction } from '@/types';

export default function LineGraph({ rows }: { rows: Transaction[] }) {
    // Group by month
    const monthly = rows.reduce((acc, r) => {
        const month = new Date(r.date).toLocaleString('default', { month: 'short', year: 'numeric' });
        if (!acc[month]) acc[month] = { month, total: 0, expenses: 0, savings: 0 };

        if (r.inOut === 'COME') {
            acc[month].total += r.amount;
        } else {
            acc[month].total -= r.amount;
            acc[month].expenses += r.amount; // store expenses separately
        }

        acc[month].savings += r.savings || 0;
        return acc;
    }, {} as Record<string, { month: string; total: number; expenses: number; savings: number }>);

    const data = Object.values(monthly);

    return (
        <div className="rounded-xl border border-slate-800 bg-[#0f0f0f] p-6 shadow-lg animate-fadeIn">
            <h3 className="text-xl font-semibold text-slate-200 mb-2">Monthly Overview</h3>
            <p className="text-sm text-slate-400 mb-4">Track income, expenses, and savings over time</p>
            <ResponsiveContainer height={350}>
                <LineChart data={data}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#333" />
                    <XAxis dataKey="month" stroke="#aaa" />
                    <YAxis stroke="#aaa" />
                    <Tooltip contentStyle={{ backgroundColor: "#1a1a1a", borderRadius: "8px", border: "1px solid #333" }} />
                    <Legend />
                    <Line type="monotone" dataKey="total" stroke="#3b82f6" strokeWidth={2} name="Net Total" dot={false} />
                    <Line type="monotone" dataKey="savings" stroke="#22c55e" strokeWidth={2} name="Savings" dot={false} />
                    <Line type="monotone" dataKey="expenses" stroke="#ef4444" strokeWidth={2} name="Expenses" dot={false} />
                </LineChart>
            </ResponsiveContainer>
        </div>
    );

}
