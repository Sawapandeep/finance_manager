// @/app/dashboard/page.tsx
'use client';

import { useEffect, useState } from "react";
import { onAuthStateChanged, signOut } from "firebase/auth";
import { collection, onSnapshot, query, orderBy, addDoc } from "firebase/firestore";
import { auth, db } from "@/lib/firebase";
import type { Transaction } from "@/types";
import AuthGate from "@/app/Components/AuthGate";
import Spreadsheet from "@/app/Components/spreadsheet";
import LineGraph from "@/app/Components/linegraph";
import UploadPaste from "@/app/Components/uploadPaste";
import CustomCards from "@/app/Components/CustomCards";

export default function DashboardPage() {
  const [rows, setRows] = useState<Transaction[]>([]);
  const [uid, setUid] = useState<string | null>(null);
  const [userName, setUserName] = useState<string | null>(null);
  const [customTotal, setCustomTotal] = useState(0);

  useEffect(() => {
    let unsubscribe: (() => void) | undefined;

    const unsubAuth = onAuthStateChanged(auth, (user) => {
      if (user) {
        setUid(user.uid);
        setUserName(user.displayName?.split(" ")[0] || "there");

        const q = query(
          collection(db, "users", user.uid, "transactions"),
          orderBy("date", "asc")
        );

        unsubscribe = onSnapshot(q, (snapshot) => {
          const data = snapshot.docs.map((doc) => ({
            id: doc.id,
            ...doc.data(),
          })) as Transaction[];
          setRows(data);
        });
      } else {
        setRows([]);
        setUid(null);
        setUserName(null);
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
      const dataToSave: any = { ...rest, ...(savings !== undefined ? { savings } : {}) };
      await addDoc(collection(db, "users", uid, "transactions"), dataToSave);
    }
  }

  async function handleLogout() {
    await signOut(auth);
  }

  const total = rows.reduce((s, r) => {
    if (r.inOut === "COME") return s + (r.amount || 0);
    if (r.inOut === "GO") return s - (r.amount || 0);
    if (r.inOut === "SAVINGS-DEBIT") return s - (r.amount || 0);
    return s;
  }, 0);

  const totalSavings = rows.reduce((s, r) => {
    if (r.inOut === "COME" || r.inOut === "GO") return s + (r.savings || 0);
    if (r.inOut === "SAVINGS-DEBIT") return s - (r.amount || 0);
    return s;
  }, 0);

  const spendable = total - totalSavings;
  // const spendableAfterCustom = Math.max(spendable - customTotal, 0);
  const spendableAfterCustom = spendable - customTotal;

  return (
    <AuthGate>
      <div className="space-y-6 animate-fadeIn pb-16">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <p className="text-xs" style={{ color: 'var(--text-muted)' }}>Welcome back</p>
            <h1 className="text-lg font-medium">{userName ? `${userName}` : "Ledger"}</h1>
          </div>
          <button
            onClick={handleLogout}
            className="text-xs px-3 py-2 rounded-lg"
            style={{ background: 'var(--surface-2)', color: 'var(--text-muted)' }}
          >
            Sign out
          </button>
        </div>

        {/* Hero balance */}
        {/* <div
          className="rounded-2xl p-6"
          style={{ background: 'var(--surface)', border: '1px solid var(--border)' }}
        >
          <p className="text-xs mb-2" style={{ color: 'var(--text-muted)' }}>Net total</p>
          <p className="font-mono-nums text-4xl sm:text-5xl font-medium">
            ₹{total.toLocaleString()}
          </p>
        </div> */}
<div
  className="rounded-2xl p-6"
  style={{ background: 'var(--surface)', border: '1px solid var(--border)' }}
>
  <p className="text-xs mb-2" style={{ color: 'var(--text-muted)' }}>Net total</p>
  <p
    className="font-mono-nums text-4xl sm:text-5xl font-medium"
    style={{ color: total < 0 ? 'var(--debit)' : 'var(--text)' }}
  >
    {total < 0 ? '−' : ''}₹{Math.abs(total).toLocaleString()}
  </p>
</div>
        {/* Stat row */}
        <div className="grid grid-cols-2 gap-3">
          <StatCard label="Savings" value={totalSavings} color="var(--savings)" />
          <StatCard label="Spendable" value={spendableAfterCustom} color="var(--credit)" />
        </div>

        <CustomCards onTotalChange={setCustomTotal} spendable={spendable} />

        <LineGraph rows={rows} />

        <Spreadsheet rows={rows} setRows={setRows} uid={uid} />

        <UploadPaste onImport={handleImport} />
      </div>
    </AuthGate>
  );
}
function StatCard({ label, value, color }: { label: string; value: number; color: string }) {
  const isNegative = value < 0;
  return (
    <div
      className="rounded-2xl p-4"
      style={{ background: 'var(--surface)', border: '1px solid var(--border)' }}
    >
      <p className="text-xs mb-1" style={{ color: 'var(--text-muted)' }}>{label}</p>
      <p
        className="font-mono-nums text-xl font-medium"
        style={{ color: isNegative ? 'var(--debit)' : color }}
      >
        {isNegative ? '−' : ''}₹{Math.abs(value).toLocaleString()}
      </p>
    </div>
  );
}

// function StatCard({ label, value, color }: { label: string; value: number; color: string }) {
//   return (
//     <div
//       className="rounded-2xl p-4"
//       style={{ background: 'var(--surface)', border: '1px solid var(--border)' }}
//     >
//       <p className="text-xs mb-1" style={{ color: 'var(--text-muted)' }}>{label}</p>
//       <p className="font-mono-nums text-xl font-medium" style={{ color }}>
//         ₹{value.toLocaleString()}
//       </p>
//     </div>
//   );
// }

// //! app/dashboard/page.tsx
// 'use client';

// import { useEffect, useState } from "react";
// import { onAuthStateChanged, signOut } from "firebase/auth";
// import { collection, onSnapshot, query, orderBy, addDoc } from "firebase/firestore";
// import { auth, db } from "@/lib/firebase";
// import type { Transaction } from "@/types";
// import AuthGate from "@/app/Components/AuthGate";
// import Spreadsheet from "@/app/Components/spreadsheet";
// import LineGraph from "@/app/Components/linegraph";
// import UploadPaste from "@/app/Components/uploadPaste";
// import { useRouter } from "next/navigation";
// import CustomCards from "@/app/Components/CustomCards";

// export default function DashboardPage() {
//     const [rows, setRows] = useState<Transaction[]>([]);
//     const [uid, setUid] = useState<string | null>(null);
//     const [userName, setUserName] = useState<string | null>(null);
//     const [userEmail, setUserEmail] = useState<string | null>(null);
//     const [customTotal, setCustomTotal] = useState(0);
//     const router = useRouter();

//     useEffect(() => {
//         let unsubscribe: (() => void) | undefined;

//         const unsubAuth = onAuthStateChanged(auth, (user) => {
//             if (user) {
//                 setUid(user.uid);
//                 setUserName(user.displayName || "User");
//                 setUserEmail(user.email || "");

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
//                 setUserName(null);
//                 setUserEmail(null);
//             }
//         });

//         return () => {
//             unsubAuth();
//             if (unsubscribe) unsubscribe();
//         };
//     }, []);

//     async function handleImport(trans: Transaction[]) {
//         if (!uid) return;

//         for (const t of trans) {
//             const { id, savings, ...rest } = t;
//             const dataToSave: any = {
//                 ...rest,
//                 ...(savings !== undefined ? { savings } : {}),
//             };
//             await addDoc(collection(db, "users", uid, "transactions"), dataToSave);
//         }
//     }

//     // 🔴 Logout
//     async function handleLogout() {
//         await signOut(auth);
//         router.push("/");
//     }

//     // 💰 Core calculations
//     // const total = rows.reduce((s, r) => (r.inOut === "COME" ? s + (r.amount || 0) : s - (r.amount || 0)), 0);
//     // const totalSavings = rows.reduce((s, r) => s + (r.savings || 0), 0);
//     // const gurudwaraTotal = 0;
//     // const afterGurudwaraTotal = total - gurudwaraTotal;
//     // const spendable = afterGurudwaraTotal - totalSavings;
//     // const spendableAfterCustom = Math.max(spendable - customTotal, 0); // ✅ never negative

//     // 💰 Core calculations — unified with spreadsheet.tsx

//     // ✅ NET TOTAL
//     const total = rows.reduce((s, r) => {
//         if (r.inOut === "COME") return s + (r.amount || 0);
//         if (r.inOut === "GO") return s - (r.amount || 0);
//         if (r.inOut === "SAVINGS-DEBIT") return s - (r.amount || 0); // ✅ withdraw from savings
//         return s;
//     }, 0);

//     // ✅ TOTAL SAVINGS
//     const totalSavings = rows.reduce((s, r) => {
//         // Normal savings added monthly
//         if (r.inOut === "COME" || r.inOut === "GO") return s + (r.savings || 0);

//         // ✅ SAVINGS-DEBIT means money pulled out from savings (e.g. FD withdrawal)
//         if (r.inOut === "SAVINGS-DEBIT") return s - (r.amount || 0);

//         return s;
//     }, 0);

//     // ✅ SPENDABLE CALCULATION
//     const gurudwaraTotal = 0;
//     const afterGurudwaraTotal = total - gurudwaraTotal;
//     const spendable = afterGurudwaraTotal - totalSavings;
//     const spendableAfterCustom = Math.max(spendable - customTotal, 0); // never negative

//     return (
//         <AuthGate>
//             <div className="space-y-10 animate-fadeIn">
//                 {/* Header */}
//                 <div className="flex justify-between items-center">
//                     <h1 className="text-2xl font-bold text-slate-100">
//                         {userName ? `${userName}'s Dashboard` : "Dashboard"}
//                     </h1>
//                     <div className="flex items-center gap-4">
//                         <p className="text-slate-400 text-sm hidden md:block">{userEmail}</p>
//                         <button
//                             onClick={handleLogout}
//                             className="px-3 py-1 rounded-lg bg-red-600 hover:bg-red-700 text-white text-sm font-medium transition"
//                         >
//                             Logout
//                         </button>
//                     </div>
//                 </div>

//                 {/* 🟦 Main Cards Row */}
//                 <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
//                     <Card title="Net Total" value={`₹ ${total.toLocaleString()}`} color="blue" />
//                     <Card title="Savings" value={`₹ ${totalSavings.toLocaleString()}`} color="green" />
//                     <Card title="Spendable" value={`₹ ${spendableAfterCustom.toLocaleString()}`} color="orange" />

//                     {/* 🟣 Custom Cards Inline */}
//                     <CustomCards onTotalChange={setCustomTotal} spendable={spendable} />
//                 </div>

//                 {/* 📈 Graph */}
//                 <LineGraph rows={rows} />

//                 {/* 🧾 Spreadsheet + Upload */}
//                 <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mt-6">
//                     <div className="lg:col-span-2 flex flex-col gap-y-6">
//                         <Spreadsheet rows={rows} setRows={setRows} uid={uid} />
//                         <UploadPaste onImport={handleImport} />
//                     </div>
//                 </div>
//             </div>
//         </AuthGate>
//     );
// }

// function Card({ title, value, color }: { title: string; value: string; color: string }) {
//     const colorMap: Record<string, string> = {
//         blue: "text-blue-400",
//         green: "text-green-400",
//         purple: "text-purple-400",
//         orange: "text-orange-400",
//     };
//     return (
//         <div className="rounded-xl border border-slate-800 bg-[#0f0f0f] p-6 shadow-lg hover:shadow-xl transition-all">
//             <div className="text-sm text-slate-400">{title}</div>
//             <div className={`text-2xl font-bold mt-1 ${colorMap[color]}`}>{value}</div>
//         </div>
//     );
// }


// // 'use client';

// // import { useEffect, useState } from "react";
// // import { onAuthStateChanged, signOut } from "firebase/auth";
// // import { collection, onSnapshot, query, orderBy, addDoc } from "firebase/firestore";
// // import { auth, db } from "@/lib/firebase";
// // import type { Transaction } from "@/types";
// // import AuthGate from "@/app/Components/AuthGate";
// // import Spreadsheet from "@/app/Components/spreadsheet";
// // import LineGraph from "@/app/Components/linegraph";
// // import UploadPaste from "@/app/Components/uploadPaste";
// // import { useRouter } from "next/navigation";
// // import CustomCards from "@/app/Components/CustomCards";

// // export default function DashboardPage() {
// //     const [rows, setRows] = useState<Transaction[]>([]);
// //     const [uid, setUid] = useState<string | null>(null);
// //     const [userName, setUserName] = useState<string | null>(null);
// //     const [userEmail, setUserEmail] = useState<string | null>(null);
// //     const [customTotal, setCustomTotal] = useState(0);
// //     const router = useRouter();

// //     useEffect(() => {
// //         let unsubscribe: (() => void) | undefined;

// //         const unsubAuth = onAuthStateChanged(auth, (user) => {
// //             if (user) {
// //                 setUid(user.uid);
// //                 setUserName(user.displayName || "User");
// //                 setUserEmail(user.email || "");

// //                 const q = query(
// //                     collection(db, "users", user.uid, "transactions"),
// //                     orderBy("date", "asc")
// //                 );

// //                 unsubscribe = onSnapshot(q, (snapshot) => {
// //                     const data = snapshot.docs.map(doc => ({
// //                         id: doc.id,
// //                         ...doc.data(),
// //                     })) as Transaction[];
// //                     setRows(data);
// //                 });
// //             } else {
// //                 setRows([]);
// //                 setUid(null);
// //                 setUserName(null);
// //                 setUserEmail(null);
// //             }
// //         });

// //         return () => {
// //             unsubAuth();
// //             if (unsubscribe) unsubscribe();
// //         };
// //     }, []);

// //     async function handleImport(trans: Transaction[]) {
// //         if (!uid) return;

// //         for (const t of trans) {
// //             const { id, savings, ...rest } = t;
// //             const dataToSave: any = {
// //                 ...rest,
// //                 ...(savings !== undefined ? { savings } : {}),
// //             };
// //             await addDoc(collection(db, "users", uid, "transactions"), dataToSave);
// //         }
// //     }

// //     // Handle logout
// //     async function handleLogout() {
// //         await signOut(auth);
// //         router.push("/"); // redirect after logout
// //     }

// //     // Summary cards
// //     const total = rows.reduce((s, r) => (r.inOut === "COME" ? s + (r.amount || 0) : s - (r.amount || 0)), 0);
// //     const totalSavings = rows.reduce((s, r) => s + (r.savings || 0), 0);
// //     const gurudwaraTotal = 0;
// //     const afterGurudwaraTotal = total - gurudwaraTotal;
// //     const spendable = afterGurudwaraTotal - totalSavings;
// //     const spendableAfterCustom = spendable - customTotal;

// //     return (
// //         <AuthGate>
// //             <div className="space-y-10 animate-fadeIn">
// //                 {/* Username Header + Logout */}
// //                 <div className="flex justify-between items-center">
// //                     <h1 className="text-2xl font-bold text-slate-100">
// //                         {userName ? `${userName}'s Dashboard` : "Dashboard"}
// //                     </h1>
// //                     <div className="flex items-center gap-4">
// //                         <p className="text-slate-400 text-sm hidden md:block">{userEmail}</p>
// //                         <button
// //                             onClick={handleLogout}
// //                             className="px-3 py-1 rounded-lg bg-red-600 hover:bg-red-700 text-white text-sm font-medium transition"
// //                         >
// //                             Logout
// //                         </button>
// //                     </div>
// //                 </div>

// //                 {/* Top summary cards */}
// //                 <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
// //                     <Card title="Net Total" value={`₹ ${total.toLocaleString()}`} color="blue" />
// //                     <Card title="Savings" value={`₹ ${totalSavings.toLocaleString()}`} color="green" />
// //                     <Card title="Spendable" value={`₹ ${spendable.toLocaleString()}`} color="orange" />
// //                 </div>
// //                 <CustomCards onTotalChange={setCustomTotal} />
// //                 {/* Graph */}
// //                 <LineGraph rows={rows} />

// //                 {/* Table + Upload */}
// //                 <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mt-6 ">
// //                     <div className="lg:col-span-2 gap-y-6 flex flex-col">
// //                         <Spreadsheet rows={rows} setRows={setRows} uid={uid} />
// //                         <UploadPaste onImport={handleImport} />
// //                     </div>

// //                 </div>
// //             </div>
// //         </AuthGate>
// //     );
// // }

// // function Card({ title, value, color }: { title: string; value: string; color: string }) {
// //     const colorMap: Record<string, string> = {
// //         blue: "text-blue-400",
// //         green: "text-green-400",
// //         purple: "text-purple-400",
// //         orange: "text-orange-400",
// //     };
// //     return (
// //         <div className="rounded-xl border border-slate-800 bg-[#0f0f0f] p-6 shadow-lg hover:shadow-xl transition-all">
// //             <div className="text-sm text-slate-400">{title}</div>
// //             <div className={`text-2xl font-bold mt-1 ${colorMap[color]}`}>{value}</div>
// //         </div>
// //     );
// // }


// // 'use client';

// // import { useEffect, useState } from "react";
// // import { onAuthStateChanged } from "firebase/auth";
// // import { collection, onSnapshot, query, orderBy, addDoc } from "firebase/firestore";
// // import { auth, db } from "@/lib/firebase";
// // import type { Transaction } from "@/types";
// // import AuthGate from "@/app/Components/AuthGate";
// // import Spreadsheet from "@/app/Components/spreadsheet";
// // import LineGraph from "@/app/Components/linegraph";
// // import UploadPaste from "@/app/Components/uploadPaste";

// // export default function DashboardPage() {
// //     const [rows, setRows] = useState<Transaction[]>([]);
// //     const [uid, setUid] = useState<string | null>(null);
// //     const [userName, setUserName] = useState<string | null>(null);
// //     const [userEmail, setUserEmail] = useState<string | null>(null);

// //     useEffect(() => {
// //         let unsubscribe: (() => void) | undefined;

// //         const unsubAuth = onAuthStateChanged(auth, (user) => {
// //             if (user) {
// //                 setUid(user.uid);
// //                 setUserName(user.displayName || "User");
// //                 setUserEmail(user.email || "");

// //                 const q = query(
// //                     collection(db, "users", user.uid, "transactions"),
// //                     orderBy("date", "asc")
// //                 );

// //                 unsubscribe = onSnapshot(q, (snapshot) => {
// //                     const data = snapshot.docs.map(doc => ({
// //                         id: doc.id,
// //                         ...doc.data(),
// //                     })) as Transaction[];
// //                     setRows(data);
// //                 });
// //             } else {
// //                 setRows([]);
// //                 setUid(null);
// //                 setUserName(null);
// //                 setUserEmail(null);
// //             }
// //         });

// //         return () => {
// //             unsubAuth();
// //             if (unsubscribe) unsubscribe();
// //         };
// //     }, []);

// //     async function handleImport(trans: Transaction[]) {
// //         if (!uid) return;

// //         for (const t of trans) {
// //             const { id, savings, ...rest } = t;
// //             const dataToSave: any = {
// //                 ...rest,
// //                 ...(savings !== undefined ? { savings } : {}),
// //             };
// //             await addDoc(collection(db, "users", uid, "transactions"), dataToSave);
// //         }
// //     }

// //     // Summary cards
// //     const total = rows.reduce((s, r) => (r.inOut === "COME" ? s + (r.amount || 0) : s - (r.amount || 0)), 0);
// //     const totalSavings = rows.reduce((s, r) => s + (r.savings || 0), 0);
// //     const gurudwaraTotal = 0;
// //     const afterGurudwaraTotal = total - gurudwaraTotal;
// //     const spendable = afterGurudwaraTotal - totalSavings;

// //     return (
// //         <AuthGate>
// //             <div className="space-y-10 animate-fadeIn">
// //                 {/* Username Header */}
// //                 <div className="flex justify-between items-center">
// //                     <h1 className="text-2xl font-bold text-slate-100">
// //                         {userName ? `${userName}'s Dashboard` : "Dashboard"}
// //                     </h1>
// //                     {/* <p className="text-slate-400 text-sm">{userEmail}</p> */}
// //                 </div>

// //                 {/* Top summary cards */}
// //                 <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
// //                     <Card title="Net Total" value={`₹ ${total.toLocaleString()}`} color="blue" />
// //                     {/* <Card title="After Gurudwara" value={`₹ ${afterGurudwaraTotal.toLocaleString()}`} color="purple" /> */}
// //                     <Card title="Savings" value={`₹ ${totalSavings.toLocaleString()}`} color="green" />
// //                     <Card title="Spendable" value={`₹ ${spendable.toLocaleString()}`} color="orange" />
// //                 </div>

// //                 {/* Graph */}
// //                 <LineGraph rows={rows} />

// //                 {/* Table + Upload */}
// //                 <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 mt-6">
// //                     <div className="lg:col-span-2">
// //                         <Spreadsheet rows={rows} setRows={setRows} uid={uid} />
// //                     </div>
// //                     <UploadPaste onImport={handleImport} />
// //                 </div>
// //             </div>
// //         </AuthGate>
// //     );
// // }

// // function Card({ title, value, color }: { title: string; value: string; color: string }) {
// //     const colorMap: Record<string, string> = {
// //         blue: "text-blue-400",
// //         green: "text-green-400",
// //         purple: "text-purple-400",
// //         orange: "text-orange-400",
// //     };
// //     return (
// //         <div className="rounded-xl border border-slate-800 bg-[#0f0f0f] p-6 shadow-lg hover:shadow-xl transition-all">
// //             <div className="text-sm text-slate-400">{title}</div>
// //             <div className={`text-2xl font-bold mt-1 ${colorMap[color]}`}>{value}</div>
// //         </div>
// //     );
// // }
// //!^working
// // 'use client';

// // import { useEffect, useState } from "react";
// // import { onAuthStateChanged } from "firebase/auth";
// // import { collection, onSnapshot, query, orderBy, addDoc } from "firebase/firestore";
// // import { auth, db } from "@/lib/firebase";
// // import type { Transaction } from "@/types";
// // import AuthGate from "@/app/Components/AuthGate";
// // import Spreadsheet from "@/app/Components/spreadsheet";
// // import LineGraph from "@/app/Components/linegraph";
// // import UploadPaste from "@/app/Components/uploadPaste";

// // export default function DashboardPage() {
// //     const [rows, setRows] = useState<Transaction[]>([]);
// //     const [uid, setUid] = useState<string | null>(null);

// //     // Listen to auth state and set up Firestore snapshot
// //     useEffect(() => {
// //         let unsubscribe: (() => void) | undefined;

// //         const unsubAuth = onAuthStateChanged(auth, (user) => {
// //             if (user) {
// //                 setUid(user.uid);

// //                 const q = query(
// //                     collection(db, "users", user.uid, "transactions"),
// //                     orderBy("date", "asc")
// //                 );

// //                 unsubscribe = onSnapshot(q, (snapshot) => {
// //                     const data = snapshot.docs.map(doc => ({
// //                         id: doc.id,
// //                         ...doc.data(),
// //                     })) as Transaction[];
// //                     setRows(data);
// //                 });
// //             } else {
// //                 setRows([]);
// //                 setUid(null);
// //             }
// //         });

// //         return () => {
// //             unsubAuth();
// //             if (unsubscribe) unsubscribe();
// //         };
// //     }, []);

// //     // Handle new imported transactions
// //     async function handleImport(trans: Transaction[]) {
// //         if (!uid) return;

// //         for (const t of trans) {
// //             const { id, savings, ...rest } = t;
// //             const dataToSave: any = {
// //                 ...rest,
// //                 // only include savings if it's a number, else skip or set null
// //                 ...(savings !== undefined ? { savings } : {}),
// //             };

// //             await addDoc(collection(db, "users", uid, "transactions"), dataToSave);
// //         }
// //     }

// //     return (
// //         <AuthGate>
// //             <div className="bg-black space-y-6 p-6">
// //                 <h1 className="text-2xl font-bold mb-4">Dashboard</h1>
// //                 <LineGraph rows={rows} />
// //                 <Spreadsheet rows={rows} setRows={setRows} uid={uid} />
// //                 <UploadPaste onImport={handleImport} />
// //             </div>
// //         </AuthGate>
// //     );
// // }


// //!
// // 'use client';

// // import { useEffect, useState } from "react";
// // import { onAuthStateChanged } from "firebase/auth";
// // import { auth } from "@/lib/firebase";
// // import { fetchTransactions, addTransaction } from "@/lib/firestore";
// // import AuthGate from "@/app/Components/AuthGate";
// // import Spreadsheet from "@/app/Components/spreadsheet";
// // import LineGraph from "@/app/Components/linegraph";
// // import UploadPaste from "@/app/Components/uploadPaste";
// // import type { Transaction } from "@/types";

// // export default function DashboardPage() {
// //     const [rows, setRows] = useState<Transaction[]>([]);
// //     const [uid, setUid] = useState<string | null>(null);

// //     useEffect(() => {
// //         const unsub = onAuthStateChanged(auth, async (user) => {
// //             if (user) {
// //                 setUid(user.uid);
// //                 const data = await fetchTransactions(user.uid);
// //                 setRows(data);
// //             }
// //         });
// //         return () => unsub();
// //     }, []);

// //     async function handleImport(trans: Transaction[]) {
// //         if (!uid) return;
// //         for (const t of trans) {
// //             await addTransaction(uid, { ...t, id: undefined }); // Firestore will assign id
// //         }
// //         const data = await fetchTransactions(uid);
// //         setRows(data);
// //     }

// //     return (
// //         <AuthGate>
// //             <div className="bg-black space-y-6 p-6">
// //                 <h1 className="text-2xl font-bold mb-4">Dashboard</h1>
// //                 <LineGraph rows={rows} />
// //                 <Spreadsheet rows={rows} setRows={setRows} uid={uid} />
// //                 <UploadPaste onImport={handleImport} />
// //             </div>
// //         </AuthGate>
// //     );
// // }
// // /______________
// // 'use client';

// // import AuthGate from "@/app/Components/AuthGate";
// // import { useState } from "react";
// // import type { Transaction } from "@/types";
// // import UploadPaste from '@/app/Components/uploadPaste';
// // import Spreadsheet from '@/app/Components/spreadsheet';
// // import LineGraph from '@/app/Components/linegraph';
// // export default function DashboardPage() {
// //     const [rows, setRows] = useState<Transaction[]>([]);

// //     return (
// //         <AuthGate>
// //             <div className="bg-black space-y-6 p-6">
// //                 <h1 className="text-2xl font-bold mb-4">Dashboard</h1>
// //                 <LineGraph rows={rows} />
// //                 <Spreadsheet rows={rows} setRows={setRows} />
// //                 <UploadPaste onImport={(t) => setRows([...rows, ...t])} />

// //             </div>
// //         </AuthGate>
// //     );
// // }
