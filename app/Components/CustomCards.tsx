'use client';

import { useEffect, useState } from "react";
import { auth } from "@/lib/firebase";
import {
    fetchCustomExpenses,
    addCustomExpense,
    deleteCustomExpense,
    CustomExpense,
} from "@/lib/firestore";

export default function CustomCards({
    onTotalChange,
    spendable,
}: {
    onTotalChange: (total: number) => void;
    spendable: number;
}) {
    const [customCards, setCustomCards] = useState<CustomExpense[]>([]);
    const [title, setTitle] = useState("");
    const [amount, setAmount] = useState<number | string>("");
    const [color, setColor] = useState("purple");
    const [error, setError] = useState<string | null>(null);

    // 🟢 Load user’s saved cards
    useEffect(() => {
        const uid = auth.currentUser?.uid;
        if (!uid) return;

        fetchCustomExpenses(uid).then((data) => {
            setCustomCards(data);
            onTotalChange(data.reduce((sum, c) => sum + c.amount, 0));
        });
    }, []);

    // 🟡 Add new card
    const handleAddCard = async () => {
        const uid = auth.currentUser?.uid;
        if (!uid || !title || !amount) return;
        const amt = Number(amount);

        const totalWithNew = customCards.reduce((sum, c) => sum + c.amount, 0) + amt;
        if (totalWithNew > spendable) {
            setError("Total custom card amount cannot exceed spendable balance.");
            return;
        }

        const id = await addCustomExpense(uid, { title, amount: amt, color });
        const newCards = [...customCards, { id, title, amount: amt, color }];
        setCustomCards(newCards);
        setTitle("");
        setAmount("");
        setError(null);
        onTotalChange(newCards.reduce((sum, c) => sum + c.amount, 0));
    };

    // 🔴 Delete card
    const handleDelete = async (id?: string) => {
        const uid = auth.currentUser?.uid;
        if (!uid || !id) return;
        await deleteCustomExpense(uid, id);
        const newCards = customCards.filter((c) => c.id !== id);
        setCustomCards(newCards);
        onTotalChange(newCards.reduce((sum, c) => sum + c.amount, 0));
    };

    return (
        <div className="col-span-1 md:col-span-4 mt-2">
            {/* Input Row */}
            <div className="flex items-center gap-3 mb-3 flex-wrap">
                <input
                    type="text"
                    placeholder="Card title (e.g., Rent)"
                    value={title}
                    onChange={(e) => setTitle(e.target.value)}
                    className="border px-3 py-2 rounded-md bg-[#121212] text-white"
                />
                <input
                    type="number"
                    placeholder="Amount"
                    value={amount}
                    onChange={(e) => setAmount(e.target.value)}
                    className="border px-3 py-2 rounded-md bg-[#121212] text-white w-28"
                />
                <button
                    onClick={handleAddCard}
                    className="bg-blue-500 text-white px-4 py-2 rounded-md hover:bg-blue-600"
                >
                    Add
                </button>
                {error && <p className="text-red-400 text-sm">{error}</p>}
            </div>

            {/* Cards Grid */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
                {customCards.map((card) => (
                    <div
                        key={card.id}
                        className={`rounded-xl p-4 text-white shadow-md relative border border-slate-800 bg-[#0f0f0f]`}
                    >
                        <button
                            onClick={() => handleDelete(card.id)}
                            className="absolute top-2 right-2 bg-white text-black rounded-full px-2 py-1 text-xs hover:bg-gray-200"
                        >
                            ✕
                        </button>
                        <h3 className="text-lg font-semibold text-purple-400">{card.title}</h3>
                        <p className="text-2xl mt-2 font-bold">₹ {card.amount.toLocaleString()}</p>
                    </div>
                ))}
            </div>
        </div>
    );
}

// "use client";
// import { useEffect, useState } from "react";
// import { auth } from "@/lib/firebase";
// import {
//     fetchCustomExpenses,
//     addCustomExpense,
//     deleteCustomExpense,
//     CustomExpense,
// } from "@/lib/firestore";

// export default function CustomCards({ onTotalChange }: { onTotalChange: (total: number) => void }) {
//     const [customCards, setCustomCards] = useState<CustomExpense[]>([]);
//     const [title, setTitle] = useState("");
//     const [amount, setAmount] = useState<number | string>("");
//     const [color, setColor] = useState("purple");

//     // 🟢 Load user’s cards
//     useEffect(() => {
//         const uid = auth.currentUser?.uid;
//         if (!uid) return;

//         fetchCustomExpenses(uid).then((data) => {
//             setCustomCards(data);
//             onTotalChange(data.reduce((sum, c) => sum + c.amount, 0));
//         });
//     }, []);

//     // 🟡 Add card
//     const handleAddCard = async () => {
//         const uid = auth.currentUser?.uid;
//         if (!uid || !title || !amount) return;
//         const amt = Number(amount);
//         const id = await addCustomExpense(uid, { title, amount: amt, color });
//         setCustomCards((prev) => [...prev, { id, title, amount: amt, color }]);
//         setTitle("");
//         setAmount("");
//         // onTotalChange((prev) => prev + amt);
//         onTotalChange(
//             [...customCards, { id, title, amount: amt, color }].reduce((sum, c) => sum + c.amount, 0)
//         );

//     };

//     // 🔴 Delete card
//     const handleDelete = async (id?: string) => {
//         const uid = auth.currentUser?.uid;
//         if (!uid || !id) return;
//         await deleteCustomExpense(uid, id);
//         setCustomCards((prev) => prev.filter((c) => c.id !== id));
//     };

//     return (
//         <div className="mt-6">
//             <div className="flex items-center gap-3 mb-4 flex-wrap">
//                 <input
//                     type="text"
//                     placeholder="Card title (e.g., Clothes)"
//                     value={title}
//                     onChange={(e) => setTitle(e.target.value)}
//                     className="border px-3 py-2 rounded-md"
//                 />
//                 <input
//                     type="number"
//                     placeholder="Amount"
//                     value={amount}
//                     onChange={(e) => setAmount(e.target.value)}
//                     className="border px-3 py-2 rounded-md w-28"
//                 />
//                 <button
//                     onClick={handleAddCard}
//                     className="bg-blue-500 text-white px-4 py-2 rounded-md hover:bg-blue-600"
//                 >
//                     Add
//                 </button>
//             </div>

//             <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
//                 {customCards.map((card) => (
//                     <div
//                         key={card.id}
//                         className={`rounded-xl p-4 text-white bg-${card.color}-500 shadow-md relative`}
//                     >
//                         <button
//                             onClick={() => handleDelete(card.id)}
//                             className="absolute top-2 right-2 bg-white text-black rounded-full px-2 py-1 text-xs hover:bg-gray-200"
//                         >
//                             ✕
//                         </button>
//                         <h3 className="text-lg font-semibold">{card.title}</h3>
//                         <p className="text-2xl mt-2 font-bold">₹ {card.amount.toLocaleString()}</p>
//                     </div>
//                 ))}
//             </div>
//         </div>
//     );
// }


// "use client";

// import { useState } from "react";

// interface CustomCard {
//     title: string;
//     amount: number;
//     color: string;
// }

// export default function CustomCards({ onTotalChange }: { onTotalChange: (total: number) => void }) {
//     const [customCards, setCustomCards] = useState<CustomCard[]>([]);
//     const [title, setTitle] = useState("");
//     const [amount, setAmount] = useState<number | string>("");
//     const [color, setColor] = useState("purple");

//     const handleAddCard = () => {
//         if (!title || !amount) return;
//         const amt = Number(amount);
//         const newCard = { title, amount: amt, color };
//         const updatedCards = [...customCards, newCard];
//         setCustomCards(updatedCards);
//         setTitle("");
//         setAmount("");
//         onTotalChange(updatedCards.reduce((sum, c) => sum + c.amount, 0));
//     };

//     return (
//         <div className="mt-4">
//             <div className="flex items-center gap-3 mb-3">
//                 <input
//                     type="text"
//                     placeholder="Card title (e.g., Clothes)"
//                     value={title}
//                     onChange={(e) => setTitle(e.target.value)}
//                     className="border px-3 py-2 rounded-md"
//                 />
//                 <input
//                     type="number"
//                     placeholder="Amount"
//                     value={amount}
//                     onChange={(e) => setAmount(e.target.value)}
//                     className="border px-3 py-2 rounded-md w-28"
//                 />
//                 <select
//                     value={color}
//                     onChange={(e) => setColor(e.target.value)}
//                     className="border px-2 py-2 rounded-md"
//                 >
//                     <option value="purple">Purple</option>
//                     <option value="pink">Pink</option>
//                     <option value="teal">Teal</option>
//                     <option value="red">Red</option>
//                 </select>
//                 <button
//                     onClick={handleAddCard}
//                     className="bg-blue-500 text-white px-4 py-2 rounded-md hover:bg-blue-600"
//                 >
//                     Add Card
//                 </button>
//             </div>

//             <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
//                 {customCards.map((card, i) => (
//                     <div
//                         key={i}
//                         className={`rounded-xl p-4 text-black bg-${card.color}-500 shadow-md`}
//                     >
//                         <h3 className="text-lg font-semibold">{card.title}</h3>
//                         <p className="text-2xl mt-2 font-bold">₹ {card.amount.toLocaleString()}</p>
//                     </div>
//                 ))}
//             </div>
//         </div>
//     );
// }
