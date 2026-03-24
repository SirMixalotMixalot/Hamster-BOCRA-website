/**
 * Shared constants for BOCRA applications.
 * Source of truth for application license types and other canonical values.
 */

// Canonical BOCRA application license types
// These are the exact values that should be used throughout the system
export const BOCRA_LICENCE_TYPES = [
  "Aircraft Radio Licence",
  "Amateur Radio License",  // Note: intentionally "License" not "Licence"
  "Broadcasting Licence",
  "Cellular Licence",
  "Citizen Band Radio Licence",
  "Point-to-Multipoint Licence",
  "Point-to-Point Licence",
  "Private Radio Communication Licence",
  "Radio Dealers Licence",
  "Radio Frequency Licence",
  "Satellite Service Licence",
  "Type Approval Licence",
  "VANS Licence",
] as const;

export type BocraLicenceType = (typeof BOCRA_LICENCE_TYPES)[number];

// Mapping from legacy shorthand to canonical names (for backward compatibility/migration)
export const LEGACY_TO_CANONICAL_LICENCE_TYPES: Record<string, BocraLicenceType> = {
  telecom: "Cellular Licence",  // General telecom → most common cellular
  broadcasting: "Broadcasting Licence",
  postal: "VANS Licence",  // Postal/Value-Added Services → VANS
  internet: "Point-to-Point Licence",  // ISP/Internet → P2P/backbone
  spectrum_license: "Radio Frequency Licence",
  dealer: "Radio Dealers Licence",
  type_approval: "Type Approval Licence",
};
