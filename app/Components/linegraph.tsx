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
        <div className=" rounded border border-white p-4 h-[40vh]">
            <h3 className="text-lg text-black font- mb-4">Monthly Overview</h3>
            <ResponsiveContainer >
                <LineChart data={data}>
                    <CartesianGrid strokeDasharray="2 2" stroke="#763abc" />
                    <XAxis dataKey="month" stroke="#fff" />
                    <YAxis stroke="#fff" />
                    <Tooltip />
                    <Legend />

                    {/* Blue line = Net Total */}
                    <Line type="monotone" dataKey="total" stroke="#3b82f6" name="Net Total" dot={false} />

                    {/* Green line = Savings */}
                    <Line type="monotone" dataKey="savings" stroke="#22c55e" name="Savings" dot={false} />

                    {/* Red line = Expenses */}
                    <Line type="monotone" dataKey="expenses" stroke="#ef4444" name="Expenses" dot={false} />
                </LineChart>
            </ResponsiveContainer>
        </div>
    );
}
