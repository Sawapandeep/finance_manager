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

    // Listen to auth state and set up Firestore snapshot
    useEffect(() => {
        let unsubscribe: (() => void) | undefined;

        const unsubAuth = onAuthStateChanged(auth, (user) => {
            if (user) {
                setUid(user.uid);

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
            }
        });

        return () => {
            unsubAuth();
            if (unsubscribe) unsubscribe();
        };
    }, []);

    // Handle new imported transactions
    async function handleImport(trans: Transaction[]) {
        if (!uid) return;

        for (const t of trans) {
            const { id, savings, ...rest } = t;
            const dataToSave: any = {
                ...rest,
                // only include savings if it's a number, else skip or set null
                ...(savings !== undefined ? { savings } : {}),
            };

            await addDoc(collection(db, "users", uid, "transactions"), dataToSave);
        }
    }

    return (
        <AuthGate>
            <div className="bg-black space-y-6 p-6">
                <h1 className="text-2xl font-bold mb-4">Dashboard</h1>
                <LineGraph rows={rows} />
                <Spreadsheet rows={rows} setRows={setRows} uid={uid} />
                <UploadPaste onImport={handleImport} />
            </div>
        </AuthGate>
    );
}


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
