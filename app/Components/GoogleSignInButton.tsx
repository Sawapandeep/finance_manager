'use client';

import { signInWithPopup } from "firebase/auth";
import { auth, provider } from "@/lib/firebase";

export default function GoogleSignInButton() {
    const handleSignIn = async () => {
        try {
            await signInWithPopup(auth, provider);
        } catch (err) {
            console.error("Login failed:", err);
        }
    };

    return (
        <button
            onClick={handleSignIn}
            className="px-4 py-2 rounded bg-blue-600 text-white"
        >
            Sign in with Google
        </button>
    );
}
