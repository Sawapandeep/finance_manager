// lib/firestore.ts
import {
  collection,
  addDoc,
  updateDoc,
  deleteDoc,
  doc,
  getDocs,
  query,
  orderBy,
} from "firebase/firestore";
import { db } from "./firebase";
import { Transaction } from "@/types";

export async function fetchTransactions(uid: string): Promise<Transaction[]> {
  const q = query(
    collection(db, "users", uid, "transactions"),
    orderBy("date", "asc")
  );
  const snap = await getDocs(q);
  return snap.docs.map((d) => ({ id: d.id, ...d.data() } as Transaction));
}

// 🔥 FIX: return document ID
export async function addTransaction(
  uid: string,
  data: Omit<Transaction, "id">
): Promise<string> {
  const ref = collection(db, "users", uid, "transactions");
  const docRef = await addDoc(ref, data);
  return docRef.id; // ✅ return string doc id
}

export async function updateTransaction(
  uid: string,
  id: string,
  patch: Partial<Transaction>
) {
  const ref = doc(db, "users", uid, "transactions", id);
  await updateDoc(ref, patch);
}

export async function deleteTransaction(uid: string, id: string) {
  const ref = doc(db, "users", uid, "transactions", id);
  await deleteDoc(ref);
}

// // lib/firestore.ts
// import {
//   collection,
//   addDoc,
//   updateDoc,
//   deleteDoc,
//   doc,
//   getDocs,
//   query,
//   orderBy,
// } from "firebase/firestore";
// import { db } from "./firebase";
// import { Transaction } from "@/types";

// export async function fetchTransactions(uid: string): Promise<Transaction[]> {
//   const q = query(
//     collection(db, "users", uid, "transactions"),
//     orderBy("date", "asc")
//   );
//   const snap = await getDocs(q);
//   return snap.docs.map((d) => ({ id: d.id, ...d.data() } as Transaction));
// }

// export async function addTransaction(uid: string, data: Omit<Transaction, "id">) {
//   const ref = collection(db, "users", uid, "transactions");
//   await addDoc(ref, data);
// }

// export async function updateTransaction(uid: string, id: string, patch: Partial<Transaction>) {
//   const ref = doc(db, "users", uid, "transactions", id);
//   await updateDoc(ref, patch);
// }

// export async function deleteTransaction(uid: string, id: string) {
//   const ref = doc(db, "users", uid, "transactions", id);
//   await deleteDoc(ref);
// }
