import type { ComponentType } from "react";
import type { BocraLicenceType } from "./constants";

export interface StepProps {
  data: Record<string, any>;
  onChange: (data: Record<string, any>) => void;
  licenceType: BocraLicenceType;
  errors: Record<string, string>;
  readOnly?: boolean;
}

export interface StepConfig {
  id: string;
  label: string;
  formDataKey: "a" | "b" | "c" | "d" | null; // null for licence-type selection & review
  componentName: string; // lazy-loaded component name
}

export interface WizardConfig {
  licenceType: BocraLicenceType;
  group: "A" | "B" | "C" | "D" | "E" | "F" | "generic";
  steps: StepConfig[];
}

// Shared steps used across multiple configs
const APPLICANT_STEP: StepConfig = {
  id: "applicant",
  label: "Applicant Particulars",
  formDataKey: "a",
  componentName: "ApplicantParticularsStep",
};

const DOCUMENTS_STEP: StepConfig = {
  id: "documents",
  label: "Documents & Signature",
  formDataKey: "d",
  componentName: "DocumentsSignatureStep",
};

const REVIEW_STEP: StepConfig = {
  id: "review",
  label: "Review & Submit",
  formDataKey: null,
  componentName: "ReviewSubmitStep",
};

// Group A — Radio Station Licences
const GROUP_A_STEPS: StepConfig[] = [
  
  APPLICANT_STEP,
  {
    id: "station-details",
    label: "Station Details",
    formDataKey: "b",
    componentName: "RadioStationDetailsStep",
  },
  {
    id: "equipment-antenna",
    label: "Equipment & Antenna",
    formDataKey: "c",
    componentName: "RadioEquipmentAntennaStep",
  },
  DOCUMENTS_STEP,
  REVIEW_STEP,
];

// Group B — Network/Infrastructure
const GROUP_B_STEPS: StepConfig[] = [
  
  APPLICANT_STEP,
  {
    id: "site-details",
    label: "Operational Site Details",
    formDataKey: "b",
    componentName: "NetworkSiteDetailsStep",
  },
  {
    id: "equipment-links",
    label: "Equipment & Links",
    formDataKey: "c",
    componentName: "NetworkEquipmentStep",
  },
  DOCUMENTS_STEP,
  REVIEW_STEP,
];

// Group C — Broadcasting
const GROUP_C_STEPS: StepConfig[] = [
  
  APPLICANT_STEP,
  {
    id: "broadcast-station",
    label: "Station & Site Details",
    formDataKey: "b",
    componentName: "BroadcastStationStep",
  },
  {
    id: "broadcast-equipment",
    label: "Equipment & Antenna",
    formDataKey: "c",
    componentName: "BroadcastEquipmentStep",
  },
  DOCUMENTS_STEP,
  REVIEW_STEP,
];

// Group D — Satellite
const GROUP_D_STEPS: StepConfig[] = [
  
  APPLICANT_STEP,
  {
    id: "satellite-site",
    label: "Satellite Site Details",
    formDataKey: "b",
    componentName: "SatelliteSiteStep",
  },
  {
    id: "satellite-equipment",
    label: "Equipment & Antenna",
    formDataKey: "c",
    componentName: "SatelliteEquipmentStep",
  },
  DOCUMENTS_STEP,
  REVIEW_STEP,
];

// Group E — Radio Frequency (simpler)
const GROUP_E_STEPS: StepConfig[] = [
  
  APPLICANT_STEP,
  {
    id: "frequency-technical",
    label: "Technical Characteristics",
    formDataKey: "b",
    componentName: "FrequencyTechnicalStep",
  },
  DOCUMENTS_STEP,
  REVIEW_STEP,
];

// Group F — Type Approval (completely different)
const GROUP_F_STEPS: StepConfig[] = [
  
  {
    id: "type-approval-applicant",
    label: "Applicant & Manufacturer",
    formDataKey: "a",
    componentName: "TypeApprovalApplicantStep",
  },
  {
    id: "type-approval-details",
    label: "Approval Type & Docs",
    formDataKey: "b",
    componentName: "TypeApprovalDetailsStep",
  },
  {
    id: "type-approval-equipment",
    label: "Equipment Description",
    formDataKey: "c",
    componentName: "TypeApprovalEquipmentStep",
  },
  DOCUMENTS_STEP,
  REVIEW_STEP,
];

// Generic — Radio Dealers, VANS (no PDF available)
const GENERIC_STEPS: StepConfig[] = [
  
  APPLICANT_STEP,
  {
    id: "business-details",
    label: "Business Details",
    formDataKey: "b",
    componentName: "GenericBusinessStep",
  },
  DOCUMENTS_STEP,
  REVIEW_STEP,
];

export const WIZARD_CONFIGS: Record<BocraLicenceType, WizardConfig> = {
  "Aircraft Radio Licence": { licenceType: "Aircraft Radio Licence", group: "A", steps: GROUP_A_STEPS },
  "Amateur Radio License": { licenceType: "Amateur Radio License", group: "A", steps: GROUP_A_STEPS },
  "Citizen Band Radio Licence": { licenceType: "Citizen Band Radio Licence", group: "A", steps: GROUP_A_STEPS },
  "Private Radio Communication Licence": { licenceType: "Private Radio Communication Licence", group: "A", steps: GROUP_A_STEPS },
  "Cellular Licence": { licenceType: "Cellular Licence", group: "B", steps: GROUP_B_STEPS },
  "Point-to-Point Licence": { licenceType: "Point-to-Point Licence", group: "B", steps: GROUP_B_STEPS },
  "Point-to-Multipoint Licence": { licenceType: "Point-to-Multipoint Licence", group: "B", steps: GROUP_B_STEPS },
  "Broadcasting Licence": { licenceType: "Broadcasting Licence", group: "C", steps: GROUP_C_STEPS },
  "Satellite Service Licence": { licenceType: "Satellite Service Licence", group: "D", steps: GROUP_D_STEPS },
  "Radio Frequency Licence": { licenceType: "Radio Frequency Licence", group: "E", steps: GROUP_E_STEPS },
  "Type Approval Licence": { licenceType: "Type Approval Licence", group: "F", steps: GROUP_F_STEPS },
  "Radio Dealers Licence": { licenceType: "Radio Dealers Licence", group: "generic", steps: GENERIC_STEPS },
  "VANS Licence": { licenceType: "VANS Licence", group: "generic", steps: GENERIC_STEPS },
};

export function getWizardConfig(licenceType: BocraLicenceType): WizardConfig {
  return WIZARD_CONFIGS[licenceType];
}

/** Get the steps for a licence type (excluding the licence-type selection step for editing) */
export function getEditableSteps(licenceType: BocraLicenceType): StepConfig[] {
  return WIZARD_CONFIGS[licenceType].steps.filter((s) => s.id !== "licence-type");
}
