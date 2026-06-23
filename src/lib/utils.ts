import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

// Normalize text that may have been stored in ALL CAPS in the DB
// Converts "KENNEL CLUB OF BHOPAL" → "Kennel Club of Bhopal"
export function toTitleCase(str: string | null | undefined): string {
  if (!str) return '';
  
  // Clean multiple spaces and trim
  const cleanStr = str.replace(/\s+/g, ' ').trim();
  
  // Only convert if the entire string is uppercase (legacy DB data)
  if (cleanStr === cleanStr.toUpperCase() && /[A-Z]/.test(cleanStr)) {
    // Small words that shouldn't be capitalized in the middle of a title
    const minors = new Set(['of', 'the', 'and', 'in', 'at', 'for', 'a', 'an', 'to', 'by', 'or']);
    return cleanStr
      .toLowerCase()
      .split(' ')
      .map((word, i) =>
        i === 0 || !minors.has(word)
          ? word.charAt(0).toUpperCase() + word.slice(1)
          : word
      )
      .join(' ');
  }
  return cleanStr;
}

export function formatTitle(text: string | null | undefined): string {
  if (!text) return '';
  return text
    .toLowerCase()
    .replace(/\b\w/g, char => char.toUpperCase());
}

