// app/dashboard/layout.tsx
'use client';

import React from "react";
import { Poppins } from "next/font/google";

const PoppinSans = Poppins({
    variable: "--font-poppins",
    subsets: ["latin"],
    weight: ["100", "200", "300", "400", "500", "600", "700", "800", "900"],
});

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
    return (
        <div className={`${PoppinSans.variable} min-h-screen bg-[#0a0a0a] text-slate-100`}>
            <main className="max-w-7xl mx-auto px-6 py-10">{children}</main>
        </div>
    );
}
