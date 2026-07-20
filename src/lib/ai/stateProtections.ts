/**
 * Static reference table of US state-level patient protections for surprise billing,
 * external review rights, and balance billing.
 *
 * Sources: CMS state surprise billing profiles, NAIC model acts, state legislation.
 * TODO: Replace with a regularly updated dataset or API feed.
 */

export interface StateProtection {
  state: string;
  name: string;
  surpriseBilling: "comprehensive" | "limited" | "none";
  externalReview: "mandatory" | "voluntary" | "none";
  balanceBilling: "banned" | "restricted" | "allowed";
  appealDeadlineDays: number;
}

export const STATE_PROTECTIONS: Record<string, StateProtection> = {
  CA: { state: "CA", name: "California", surpriseBilling: "comprehensive", externalReview: "mandatory", balanceBilling: "banned", appealDeadlineDays: 180 },
  NY: { state: "NY", name: "New York", surpriseBilling: "comprehensive", externalReview: "mandatory", balanceBilling: "banned", appealDeadlineDays: 180 },
  TX: { state: "TX", name: "Texas", surpriseBilling: "comprehensive", externalReview: "mandatory", balanceBilling: "restricted", appealDeadlineDays: 180 },
  FL: { state: "FL", name: "Florida", surpriseBilling: "comprehensive", externalReview: "mandatory", balanceBilling: "restricted", appealDeadlineDays: 180 },
  IL: { state: "IL", name: "Illinois", surpriseBilling: "comprehensive", externalReview: "mandatory", balanceBilling: "banned", appealDeadlineDays: 180 },
  PA: { state: "PA", name: "Pennsylvania", surpriseBilling: "comprehensive", externalReview: "mandatory", balanceBilling: "restricted", appealDeadlineDays: 180 },
  OH: { state: "OH", name: "Ohio", surpriseBilling: "limited", externalReview: "mandatory", balanceBilling: "restricted", appealDeadlineDays: 180 },
  GA: { state: "GA", name: "Georgia", surpriseBilling: "limited", externalReview: "mandatory", balanceBilling: "allowed", appealDeadlineDays: 60 },
  NC: { state: "NC", name: "North Carolina", surpriseBilling: "comprehensive", externalReview: "mandatory", balanceBilling: "restricted", appealDeadlineDays: 60 },
  MI: { state: "MI", name: "Michigan", surpriseBilling: "comprehensive", externalReview: "mandatory", balanceBilling: "restricted", appealDeadlineDays: 60 },
  NJ: { state: "NJ", name: "New Jersey", surpriseBilling: "comprehensive", externalReview: "mandatory", balanceBilling: "banned", appealDeadlineDays: 180 },
  VA: { state: "VA", name: "Virginia", surpriseBilling: "comprehensive", externalReview: "mandatory", balanceBilling: "restricted", appealDeadlineDays: 180 },
  WA: { state: "WA", name: "Washington", surpriseBilling: "comprehensive", externalReview: "mandatory", balanceBilling: "banned", appealDeadlineDays: 180 },
  CO: { state: "CO", name: "Colorado", surpriseBilling: "comprehensive", externalReview: "mandatory", balanceBilling: "banned", appealDeadlineDays: 180 },
  MA: { state: "MA", name: "Massachusetts", surpriseBilling: "comprehensive", externalReview: "mandatory", balanceBilling: "banned", appealDeadlineDays: 120 },
  OR: { state: "OR", name: "Oregon", surpriseBilling: "comprehensive", externalReview: "mandatory", balanceBilling: "banned", appealDeadlineDays: 180 },
  MD: { state: "MD", name: "Maryland", surpriseBilling: "comprehensive", externalReview: "mandatory", balanceBilling: "banned", appealDeadlineDays: 180 },
  CT: { state: "CT", name: "Connecticut", surpriseBilling: "comprehensive", externalReview: "mandatory", balanceBilling: "banned", appealDeadlineDays: 180 },
  MN: { state: "MN", name: "Minnesota", surpriseBilling: "limited", externalReview: "mandatory", balanceBilling: "restricted", appealDeadlineDays: 120 },
  AZ: { state: "AZ", name: "Arizona", surpriseBilling: "limited", externalReview: "mandatory", balanceBilling: "restricted", appealDeadlineDays: 60 },
};

export function getStateProtection(stateAbbr: string | null | undefined): StateProtection | null {
  if (!stateAbbr) return null;
  return STATE_PROTECTIONS[stateAbbr.toUpperCase()] ?? null;
}

export function getStateName(stateAbbr: string | null | undefined): string | null {
  if (!stateAbbr) return null;
  return STATE_PROTECTIONS[stateAbbr.toUpperCase()]?.name ?? null;
}
