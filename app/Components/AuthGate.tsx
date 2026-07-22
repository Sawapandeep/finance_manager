// @/app/Components/AuthGate.tsx
'use client';

import { ReactNode, useEffect, useState } from "react";
import { onAuthStateChanged, signOut, User } from "firebase/auth";
import { auth } from "@/lib/firebase";
import { isAllowedUser } from "@/lib/auth";
import GoogleSignInButton from "./GoogleSignInButton";

export default function AuthGate({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const unsub = onAuthStateChanged(auth, (u) => {
      setUser(u);
      setLoading(false);
    });
    return () => unsub();
  }, []);

  if (loading) {
    return (
      <div className="flex items-center justify-center h-screen text-sm" style={{ color: 'var(--text-muted)' }}>
        Loading…
      </div>
    );
  }

  if (!user) {
    return (
      <div className="flex flex-col items-center justify-center h-screen gap-4 px-6 text-center">
        <h1 className="text-lg font-medium">Please sign in</h1>
        <GoogleSignInButton />
      </div>
    );
  }

  if (!isAllowedUser(user)) {
    return (
      <div className="flex flex-col items-center justify-center h-screen gap-4 px-6 text-center">
        <h1 className="text-lg font-medium" style={{ color: 'var(--debit)' }}>Access denied</h1>
        <p className="text-sm" style={{ color: 'var(--text-muted)' }}>
          This ledger isn't shared with this account.
        </p>
        <button
          onClick={() => signOut(auth)}
          className="px-4 py-2 rounded-lg text-sm"
          style={{ background: 'var(--surface-2)' }}
        >
          Sign out
        </button>
      </div>
    );
  }

  return <>{children}</>;
}
// 'use client';

// import { ReactNode, useEffect, useState } from "react";
// import { onAuthStateChanged, signOut, User } from "firebase/auth";
// import { auth } from "@/lib/firebase";
// import { isAllowedUser } from "@/lib/auth";
// import GoogleSignInButton from "./GoogleSignInButton";

// export default function AuthGate({ children }: { children: ReactNode }) {
//     const [user, setUser] = useState<User | null>(null);
//     const [loading, setLoading] = useState(true);

//     useEffect(() => {
//         const unsub = onAuthStateChanged(auth, (u) => {
//             setUser(u);
//             setLoading(false);
//         });
//         return () => unsub();
//     }, []);

//     if (loading) return <p>Loading...</p>;

//     if (!user) {
//         return (
//             <div className="flex flex-col items-center justify-center h-screen">
//                 <h1 className="mb-4 text-xl">Please sign in</h1>
//                 <GoogleSignInButton />
//             </div>
//         );
//     }

//     if (!isAllowedUser(user)) {
//         return (
//             <div className="flex flex-col items-center justify-center h-screen">
//                 <h1 className="text-red-600">Access Denied</h1>
//                 <button
//                     onClick={() => signOut(auth)}
//                     className="mt-4 px-4 py-2 rounded bg-gray-700 text-white"
//                 >
//                     Sign Out
//                 </button>
//             </div>
//         );
//     }

//     return <>{children}</>;
// }
