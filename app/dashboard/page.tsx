// app/dashboard/page.tsx
'use client';

import { useEffect, useState } from "react";
import { onAuthStateChanged } from "firebase/auth";
import { collection, onSnapshot, query, orderBy, addDoc } from "firebase/firestore";
import { auth, db } from "@/lib/firebase";
import type { Transaction } from "@/types";
import AuthGate from "@/app/Components/AuthGate";
import Spreadsheet from "@/app/Components/spreadsheet";
import LineGraph from "@/app/Components/linegraph";
import UploadPaste from "@/app/Components/uploadPaste";

export default function DashboardPage() {
    const [rows, setRows] = useState<Transaction[]>([]);
    const [uid, setUid] = useState<string | null>(null);
    const [userName, setUserName] = useState<string | null>(null);
    const [userEmail, setUserEmail] = useState<string | null>(null);

    useEffect(() => {
        let unsubscribe: (() => void) | undefined;

        const unsubAuth = onAuthStateChanged(auth, (user) => {
            if (user) {
                setUid(user.uid);
                setUserName(user.displayName || "User");
                setUserEmail(user.email || "");

                const q = query(
                    collection(db, "users", user.uid, "transactions"),
                    orderBy("date", "asc")
                );

                unsubscribe = onSnapshot(q, (snapshot) => {
                    const data = snapshot.docs.map(doc => ({
                        id: doc.id,
                        ...doc.data(),
                    })) as Transaction[];
                    setRows(data);
                });
            } else {
                setRows([]);
                setUid(null);
                setUserName(null);
                setUserEmail(null);
            }
        });

        return () => {
            unsubAuth();
            if (unsubscribe) unsubscribe();
        };
    }, []);

    async function handleImport(trans: Transaction[]) {
        if (!uid) return;

        for (const t of trans) {
            const { id, savings, ...rest } = t;
            const dataToSave: any = {
                ...rest,
                ...(savings !== undefined ? { savings } : {}),
            };
            await addDoc(collection(db, "users", uid, "transactions"), dataToSave);
        }
    }

    // Summary cards
    const total = rows.reduce((s, r) => (r.inOut === "COME" ? s + (r.amount || 0) : s - (r.amount || 0)), 0);
    const totalSavings = rows.reduce((s, r) => s + (r.savings || 0), 0);
    const gurudwaraTotal = 11157;
    const afterGurudwaraTotal = total - gurudwaraTotal;
    const spendable = afterGurudwaraTotal - totalSavings;

    return (
        <AuthGate>
            <div className="space-y-10 animate-fadeIn">
                {/* Username Header */}
                <div className="flex justify-between items-center">
                    <h1 className="text-2xl font-bold text-slate-100">
                        {userName ? `${userName}'s Dashboard` : "Dashboard"}
                    </h1>
                    <p className="text-slate-400 text-sm">{userEmail}</p>
                </div>

                {/* Top summary cards */}
                <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
                    <Card title="Net Total" value={`₹ ${total.toLocaleString()}`} color="blue" />
                    {/* <Card title="After Gurudwara" value={`₹ ${afterGurudwaraTotal.toLocaleString()}`} color="purple" /> */}
                    <Card title="Savings" value={`₹ ${totalSavings.toLocaleString()}`} color="green" />
                    <Card title="Spendable" value={`₹ ${spendable.toLocaleString()}`} color="orange" />
                </div>

                {/* Graph */}
                <LineGraph rows={rows} />

                {/* Table + Upload */}
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 mt-6">
                    <div className="lg:col-span-2">
                        <Spreadsheet rows={rows} setRows={setRows} uid={uid} />
                    </div>
                    <UploadPaste onImport={handleImport} />
                </div>
            </div>
        </AuthGate>
    );
}

function Card({ title, value, color }: { title: string; value: string; color: string }) {
    const colorMap: Record<string, string> = {
        blue: "text-blue-400",
        green: "text-green-400",
        purple: "text-purple-400",
        orange: "text-orange-400",
    };
    return (
        <div className="rounded-xl border border-slate-800 bg-[#0f0f0f] p-6 shadow-lg hover:shadow-xl transition-all">
            <div className="text-sm text-slate-400">{title}</div>
            <div className={`text-2xl font-bold mt-1 ${colorMap[color]}`}>{value}</div>
        </div>
    );
}

// 'use client';

// import { useEffect, useState } from "react";
// import { onAuthStateChanged } from "firebase/auth";
// import { collection, onSnapshot, query, orderBy, addDoc } from "firebase/firestore";
// import { auth, db } from "@/lib/firebase";
// import type { Transaction } from "@/types";
// import AuthGate from "@/app/Components/AuthGate";
// import Spreadsheet from "@/app/Components/spreadsheet";
// import LineGraph from "@/app/Components/linegraph";
// import UploadPaste from "@/app/Components/uploadPaste";

// export default function DashboardPage() {
//     const [rows, setRows] = useState<Transaction[]>([]);
//     const [uid, setUid] = useState<string | null>(null);

//     // Listen to auth state and set up Firestore snapshot
//     useEffect(() => {
//         let unsubscribe: (() => void) | undefined;

//         const unsubAuth = onAuthStateChanged(auth, (user) => {
//             if (user) {
//                 setUid(user.uid);

//                 const q = query(
//                     collection(db, "users", user.uid, "transactions"),
//                     orderBy("date", "asc")
//                 );

//                 unsubscribe = onSnapshot(q, (snapshot) => {
//                     const data = snapshot.docs.map(doc => ({
//                         id: doc.id,
//                         ...doc.data(),
//                     })) as Transaction[];
//                     setRows(data);
//                 });
//             } else {
//                 setRows([]);
//                 setUid(null);
//             }
//         });

//         return () => {
//             unsubAuth();
//             if (unsubscribe) unsubscribe();
//         };
//     }, []);

//     // Handle new imported transactions
//     async function handleImport(trans: Transaction[]) {
//         if (!uid) return;

//         for (const t of trans) {
//             const { id, savings, ...rest } = t;
//             const dataToSave: any = {
//                 ...rest,
//                 // only include savings if it's a number, else skip or set null
//                 ...(savings !== undefined ? { savings } : {}),
//             };

//             await addDoc(collection(db, "users", uid, "transactions"), dataToSave);
//         }
//     }

//     return (
//         <AuthGate>
//             <div className="bg-black space-y-6 p-6">
//                 <h1 className="text-2xl font-bold mb-4">Dashboard</h1>
//                 <LineGraph rows={rows} />
//                 <Spreadsheet rows={rows} setRows={setRows} uid={uid} />
//                 <UploadPaste onImport={handleImport} />
//             </div>
//         </AuthGate>
//     );
// }


//!
// 'use client';

// import { useEffect, useState } from "react";
// import { onAuthStateChanged } from "firebase/auth";
// import { auth } from "@/lib/firebase";
// import { fetchTransactions, addTransaction } from "@/lib/firestore";
// import AuthGate from "@/app/Components/AuthGate";
// import Spreadsheet from "@/app/Components/spreadsheet";
// import LineGraph from "@/app/Components/linegraph";
// import UploadPaste from "@/app/Components/uploadPaste";
// import type { Transaction } from "@/types";

// export default function DashboardPage() {
//     const [rows, setRows] = useState<Transaction[]>([]);
//     const [uid, setUid] = useState<string | null>(null);

//     useEffect(() => {
//         const unsub = onAuthStateChanged(auth, async (user) => {
//             if (user) {
//                 setUid(user.uid);
//                 const data = await fetchTransactions(user.uid);
//                 setRows(data);
//             }
//         });
//         return () => unsub();
//     }, []);

//     async function handleImport(trans: Transaction[]) {
//         if (!uid) return;
//         for (const t of trans) {
//             await addTransaction(uid, { ...t, id: undefined }); // Firestore will assign id
//         }
//         const data = await fetchTransactions(uid);
//         setRows(data);
//     }

//     return (
//         <AuthGate>
//             <div className="bg-black space-y-6 p-6">
//                 <h1 className="text-2xl font-bold mb-4">Dashboard</h1>
//                 <LineGraph rows={rows} />
//                 <Spreadsheet rows={rows} setRows={setRows} uid={uid} />
//                 <UploadPaste onImport={handleImport} />
//             </div>
//         </AuthGate>
//     );
// }
// /______________
// 'use client';

// import AuthGate from "@/app/Components/AuthGate";
// import { useState } from "react";
// import type { Transaction } from "@/types";
// import UploadPaste from '@/app/Components/uploadPaste';
// import Spreadsheet from '@/app/Components/spreadsheet';
// import LineGraph from '@/app/Components/linegraph';
// export default function DashboardPage() {
//     const [rows, setRows] = useState<Transaction[]>([]);

//     return (
//         <AuthGate>
//             <div className="bg-black space-y-6 p-6">
//                 <h1 className="text-2xl font-bold mb-4">Dashboard</h1>
//                 <LineGraph rows={rows} />
//                 <Spreadsheet rows={rows} setRows={setRows} />
//                 <UploadPaste onImport={(t) => setRows([...rows, ...t])} />

//             </div>
//         </AuthGate>
//     );
// }
