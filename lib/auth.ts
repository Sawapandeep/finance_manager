// lib/auth.ts
import { User } from "firebase/auth";

const ALLOWED_EMAILS = ["ultronlegion@gmail.com", "singhsawapandeep2002@gmail.com", "priyanshup121@gmail.com"];
export function isAllowedUser(user: User | null): boolean {
  if (!user?.email) return false;
  return ALLOWED_EMAILS.includes(user.email);
}


