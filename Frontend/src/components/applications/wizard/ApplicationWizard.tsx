import { useState, useCallback } from "react";
import { toast } from "sonner";
import type { BocraLicenceType } from "@/lib/constants";
import { getWizardConfig, type StepConfig, type StepProps } from "@/lib/applicationStepConfig";
import { createApplication, submitApplication } from "@/lib/applications";
import WizardStepper from "./WizardStepper";
import WizardNavigation from "./WizardNavigation";

// Step components (eagerly imported)
import LicenceTypeStep from "../steps/LicenceTypeStep";
import ApplicantParticularsStep from "../steps/ApplicantParticularsStep";
import RadioStationDetailsStep from "../steps/RadioStationDetailsStep";
import RadioEquipmentAntennaStep from "../steps/RadioEquipmentAntennaStep";
import NetworkSiteDetailsStep from "../steps/NetworkSiteDetailsStep";
import NetworkEquipmentStep from "../steps/NetworkEquipmentStep";
import BroadcastStationStep from "../steps/BroadcastStationStep";
import BroadcastEquipmentStep from "../steps/BroadcastEquipmentStep";
import SatelliteSiteStep from "../steps/SatelliteSiteStep";
import SatelliteEquipmentStep from "../steps/SatelliteEquipmentStep";
import FrequencyTechnicalStep from "../steps/FrequencyTechnicalStep";
import TypeApprovalApplicantStep from "../steps/TypeApprovalApplicantStep";
import TypeApprovalDetailsStep from "../steps/TypeApprovalDetailsStep";
import TypeApprovalEquipmentStep from "../steps/TypeApprovalEquipmentStep";
import GenericBusinessStep from "../steps/GenericBusinessStep";
import DocumentsSignatureStep from "../steps/DocumentsSignatureStep";
import ReviewSubmitStep from "../steps/ReviewSubmitStep";

// Component registry
const STEP_COMPONENTS: Record<string, React.ComponentType<StepProps>> = {
  ApplicantParticularsStep,
  RadioStationDetailsStep,
  RadioEquipmentAntennaStep,
  NetworkSiteDetailsStep,
  NetworkEquipmentStep,
  BroadcastStationStep,
  BroadcastEquipmentStep,
  SatelliteSiteStep,
  SatelliteEquipmentStep,
  FrequencyTechnicalStep,
  TypeApprovalApplicantStep,
  TypeApprovalDetailsStep,
  TypeApprovalEquipmentStep,
  GenericBusinessStep,
  DocumentsSignatureStep,
  ReviewSubmitStep,
};

interface FormData {
  form_data_a: Record<string, any>;
  form_data_b: Record<string, any>;
  form_data_c: Record<string, any>;
  form_data_d: Record<string, any>;
}

const EMPTY_FORM_DATA: FormData = {
  form_data_a: {},
  form_data_b: {},
  form_data_c: {},
  form_data_d: {},
};

export default function ApplicationWizard() {
  const [licenceType, setLicenceType] = useState<BocraLicenceType | null>(null);
  const [currentStep, setCurrentStep] = useState(0);
  const [formData, setFormData] = useState<FormData>({ ...EMPTY_FORM_DATA });
  const [completedSteps, setCompletedSteps] = useState<Set<number>>(new Set());
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Steps only exist after licence type is selected
  const config = licenceType ? getWizardConfig(licenceType) : null;
  const steps: StepConfig[] = config ? config.steps : [];
  const currentStepConfig = steps[currentStep] ?? null;

  const handleLicenceTypeSelect = (type: BocraLicenceType) => {
    setLicenceType(type);
    setFormData({ ...EMPTY_FORM_DATA });
    setCompletedSteps(new Set());
    setCurrentStep(0); // Step 0 is now the first real form step
  };

  const handleStepDataChange = useCallback(
    (data: Record<string, any>) => {
      if (!currentStepConfig?.formDataKey) return;
      const key = `form_data_${currentStepConfig.formDataKey}` as keyof FormData;
      setFormData((prev) => ({
        ...prev,
        [key]: { ...prev[key], ...data },
      }));
    },
    [currentStepConfig],
  );

  const handleNext = () => {
    // Mark current step as completed
    setCompletedSteps((prev) => new Set([...prev, currentStep]));
    if (currentStep < steps.length - 1) {
      setCurrentStep(currentStep + 1);
      window.scrollTo({ top: 0, behavior: "smooth" });
    }
  };

  const handleBack = () => {
    if (currentStep > 0) {
      setCurrentStep(currentStep - 1);
      window.scrollTo({ top: 0, behavior: "smooth" });
    }
  };

  const handleSaveDraft = () => {
    toast.success("Draft saved", {
      description: "Your application progress has been saved. You can continue later.",
    });
  };

  const handleSubmit = async () => {
    if (!licenceType) {
      return;
    }
    if (isSubmitting) {
      return;
    }
    setIsSubmitting(true);
    setCompletedSteps((prev) => new Set([...prev, currentStep]));
    try {
      const created = await createApplication({
        licence_type: licenceType,
        form_data_a: formData.form_data_a,
        form_data_b: formData.form_data_b,
        form_data_c: formData.form_data_c,
        form_data_d: formData.form_data_d,
      });
      const submitted = await submitApplication(created.id);
      toast.success("Application submitted", {
        description: `Acknowledged. Application number: ${submitted.reference_number}`,
      });
    } catch (error) {
      toast.error("Submission failed", {
        description: error instanceof Error ? error.message : "Could not submit application. Please try again.",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  // Resolve the current step component
  const renderStep = () => {
    if (!currentStepConfig) return null;

    // Review step needs all form data
    if (currentStepConfig.id === "review") {
      return (
        <ReviewSubmitStep
          data={formData}
          onChange={() => {}}
          licenceType={licenceType!}
          errors={{}}
          readOnly
          allFormData={formData}
          steps={steps}
        />
      );
    }

    // Standard step
    const Component = STEP_COMPONENTS[currentStepConfig.componentName];
    if (!Component) {
      return <div className="p-8 text-center text-muted-foreground">Step component not found: {currentStepConfig.componentName}</div>;
    }

    const dataKey = currentStepConfig.formDataKey
      ? (`form_data_${currentStepConfig.formDataKey}` as keyof FormData)
      : null;

    return (
      <Component
        data={dataKey ? formData[dataKey] : {}}
        onChange={handleStepDataChange}
        licenceType={licenceType!}
        errors={{}}
      />
    );
  };

  // No licence type selected yet — show the selection screen
  if (!licenceType) {
    return (
      <LicenceTypeStep
        selectedType={licenceType}
        onSelect={handleLicenceTypeSelect}
      />
    );
  }

  const isReviewStep = currentStepConfig?.id === "review";

  return (
    <div className="flex flex-col lg:flex-row gap-6 max-w-6xl">
      <WizardStepper
        steps={steps}
        currentStep={currentStep}
        completedSteps={completedSteps}
      />

      <div className="flex-1 min-w-0 space-y-4">
        {renderStep()}

        <WizardNavigation
          currentStep={currentStep}
          totalSteps={steps.length}
          onBack={handleBack}
          onNext={handleNext}
          onSaveDraft={handleSaveDraft}
          onSubmit={handleSubmit}
          isFirstStep={currentStep === 0}
          isLastStep={isReviewStep}
          submitting={isSubmitting}
        />
      </div>
    </div>
  );
}
