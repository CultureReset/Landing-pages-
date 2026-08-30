/** Credit bundles offered on the billing screen. */
export const CREDIT_BUNDLES = [25, 100, 250] as const;
export type CreditBundle = (typeof CREDIT_BUNDLES)[number];

export function isCreditBundle(amount: number): boolean {
  return (CREDIT_BUNDLES as readonly number[]).includes(amount);
}
