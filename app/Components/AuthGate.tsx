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

    if (loading) return <p>Loading...</p>;

    if (!user) {
        return (
            <div className="flex flex-col items-center justify-center h-screen">
                <h1 className="mb-4 text-xl">Please sign in</h1>
                <GoogleSignInButton />
            </div>
        );
    }

    if (!isAllowedUser(user)) {
        return (
            <div className="flex flex-col items-center justify-center h-screen">
                <h1 className="text-red-600">Access Denied</h1>
                <button
                    onClick={() => signOut(auth)}
                    className="mt-4 px-4 py-2 rounded bg-gray-700 text-white"
                >
                    Sign Out
                </button>
            </div>
        );
    }

    return <>{children}</>;
}
