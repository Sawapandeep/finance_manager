// lib/transactions.ts
import { db, auth } from "./firebase";
import {
  collection,
  addDoc,
  onSnapshot,
  deleteDoc,
  doc,
  updateDoc,
} from "firebase/firestore";
import type { Transaction } from "@/types";

// Save a transaction
export async function saveTransaction(transaction: Transaction) {
  if (!auth.currentUser) throw new Error("Not logged in");

  const ref = collection(db, "users", auth.currentUser.uid, "transactions");
  await addDoc(ref, transaction);
}

// Listen for all user transactions in real-time
export function subscribeTransactions(callback: (rows: Transaction[]) => void) {
  if (!auth.currentUser) return () => {};

  const ref = collection(db, "users", auth.currentUser.uid, "transactions");
  return onSnapshot(ref, (snapshot) => {
    const data = snapshot.docs.map((doc) => ({
      id: doc.id,
      ...doc.data(),
    })) as Transaction[];
    callback(data);
  });
}

// Update a transaction
export async function updateTransaction(id: string, patch: Partial<Transaction>) {
  if (!auth.currentUser) throw new Error("Not logged in");

  const ref = doc(db, "users", auth.currentUser.uid, "transactions", id);
  await updateDoc(ref, patch);
}

// Delete a transaction
export async function deleteTransaction(id: string) {
  if (!auth.currentUser) throw new Error("Not logged in");

  const ref = doc(db, "users", auth.currentUser.uid, "transactions", id);
  await deleteDoc(ref);
}
