'use client';

import React, { useEffect, useState } from "react";
import { Poppins } from "next/font/google";

const PoppinSans = Poppins({
    variable: "--font-poppins",
    subsets: ["latin"],
    weight: ["100", "200", "300", "400", "500", "600", "700", "800", "900"],
});

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
    const [showPopup, setShowPopup] = useState(false);

    useEffect(() => {
        function checkOrientation() {
            const isMobile = window.innerWidth <= 768;
            const portrait = window.innerHeight > window.innerWidth;
            if (isMobile && portrait) {
                setShowPopup(true);
            } else {
                setShowPopup(false);
            }
        }

        checkOrientation();

        window.addEventListener("resize", checkOrientation);
        window.addEventListener("orientationchange", checkOrientation);

        return () => {
            window.removeEventListener("resize", checkOrientation);
            window.removeEventListener("orientationchange", checkOrientation);
        };
    }, []);

    return (
        <div className={`${PoppinSans.variable} min-h-screen bg-[#0a0a0a] text-slate-100`}>
            {/* Small popup for portrait warning */}
            {showPopup && (
                <div className="fixed bottom-4 left-1/2 transform -translate-x-1/2 z-50 bg-slate-800 border border-slate-700 text-white px-4 py-3 rounded-lg shadow-lg max-w-sm text-center">
                    <p className="font-medium">Rotate your device</p>
                    <p className="text-sm text-slate-300">
                        Landscape mode is recommended for the best experience.
                    </p>
                    <button
                        onClick={() => setShowPopup(false)}
                        className="mt-2 text-xs bg-slate-600 hover:bg-slate-500 px-3 py-1 rounded transition"
                    >
                        Dismiss
                    </button>
                </div>
            )}

            <main className="max-w-7xl mx-auto px-6 py-10">{children}</main>
        </div>
    );
}

// // app/dashboard/layout.tsx
// 'use client';

// import React from "react";
// import { Poppins } from "next/font/google";

// const PoppinSans = Poppins({
//     variable: "--font-poppins",
//     subsets: ["latin"],
//     weight: ["100", "200", "300", "400", "500", "600", "700", "800", "900"],
// });

// export default function DashboardLayout({ children }: { children: React.ReactNode }) {
//     return (
//         <div className={`${PoppinSans.variable} min-h-screen bg-[#0a0a0a] text-slate-100`}>
//             <main className="max-w-7xl mx-auto px-6 py-10">{children}</main>
//         </div>
//     );
// }
