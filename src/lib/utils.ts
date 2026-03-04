import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

/** Konum metninin arayüzde gösterilmeye uygun olup olmadığını kontrol eder (Kiril vb. istenmeyen içerik). */
export function isDisplayableLocation(text: string | null | undefined): boolean {
  if (!text || !text.trim()) return false
  const cyrillic = /\p{Script=Cyrillic}/u
  const greek = /\p{Script=Greek}/u
  const arabic = /\p{Script=Arabic}/u
  return !cyrillic.test(text) && !greek.test(text) && !arabic.test(text)
}

/** Konum için gösterilecek kısa metin: okunabilir değilse "Konum girildi" döner. */
export function getLocationDisplayText(location: string | null | undefined): string | null {
  if (!location || !location.trim()) return null
  return isDisplayableLocation(location) ? location : "Konum girildi"
}
