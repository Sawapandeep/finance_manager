// app/dashboard/layout.tsx
'use client';
import React from "react";
import { User } from "firebase/auth";

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
    return (
        <div className="flex min-h-screen bg-[#0a0a0a] text-slate-100">
            {/* Sidebar */}
            {/* <aside className="w-60 bg-[#111] border-r border-slate-800 p-4 flex flex-col">
                <h1 className="text-xl font-bold text-emerald-500 mb-6">FinancePro</h1>
                <nav className="space-y-2 text-sm">
                    <a className="block px-3 py-2 rounded hover:bg-slate-800 cursor-pointer">Dashboard</a>
                    <a className="block px-3 py-2 rounded hover:bg-slate-800 cursor-pointer">Transactions</a>
                    <a className="block px-3 py-2 rounded hover:bg-slate-800 cursor-pointer">Reports</a>
                    <a className="block px-3 py-2 rounded hover:bg-slate-800 cursor-pointer">Settings</a>
                </nav>
            </aside> */}

            {/* Main */}
            <main className="flex-1 p-6 overflow-auto">{children}</main>
        </div>
    );
}
