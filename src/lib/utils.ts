import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export const orThrow = <T>(message: string): Exclude<T, null | undefined> => {
  throw new Error(message);
};
