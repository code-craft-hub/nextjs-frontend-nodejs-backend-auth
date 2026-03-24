import { type ClassValue, clsx } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function formatEmail(email: string) {
  const destinationEmail = decodeURIComponent(decodeURIComponent(email));
  return destinationEmail;
}
