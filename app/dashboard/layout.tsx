

// app / dashboard / layout.tsx
'use client';
import React from "react";
import { Poppins } from "next/font/google";
import { User } from "firebase/auth";
const PoppinSans = Poppins({
    variable: "--font-poppins",
    subsets: ["latin"],
    weight: ["100", "200", "300", "400", "500", "600", "700", "800", "900"],
});
export default function DashboardLayout({ children }: { children: React.ReactNode }) {
    return (
        <div className="  ">

            <main className={`${PoppinSans.variable} flex-1  overflow-auto`}>{children}</main>
        </div>
    );
}
