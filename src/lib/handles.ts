import { MAX_HANDLE_LENGTH, MIN_HANDLE_LENGTH, isReservedHandle } from "@/config/reserved";

/**
 * Handle rules, shared by onboarding and settings. Pure so it can live outside
 * a "use server" module — those may only export async functions.
 */
export function validateHandle(slug: string): string | null {
  if (slug.length < MIN_HANDLE_LENGTH) {
    return `Use at least ${MIN_HANDLE_LENGTH} characters — letters, numbers and dashes.`;
  }
  if (slug.length > MAX_HANDLE_LENGTH) {
    return `Keep it under ${MAX_HANDLE_LENGTH} characters.`;
  }
  if (isReservedHandle(slug)) return "That address is reserved. Try another.";
  return null;
}
