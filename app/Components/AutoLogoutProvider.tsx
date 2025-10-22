"use client";

import { createContext, useEffect } from "react";
import { signOut } from "firebase/auth";
import { auth } from "@/lib/firebase"; // your firebase init
import { useRouter } from "next/navigation";

export default function AutoLogoutProvider({ children }: { children: React.ReactNode }) {
    const router = useRouter();

    useEffect(() => {
        let timeout: NodeJS.Timeout;

        const resetTimer = () => {
            clearTimeout(timeout);
            timeout = setTimeout(async () => {
                await signOut(auth);
                router.push("/");
            }, 2_400_000); // ✅ 40 minutes = 2,400,000 ms
        };


        // List of events that count as "activity"
        const events = ["mousemove", "keydown", "mousedown", "touchstart"];

        events.forEach((event) => window.addEventListener(event, resetTimer));

        resetTimer(); // start timer immediately

        return () => {
            clearTimeout(timeout);
            events.forEach((event) => window.removeEventListener(event, resetTimer));
        };
    }, [router]);

    return <>{children}</>;
}
