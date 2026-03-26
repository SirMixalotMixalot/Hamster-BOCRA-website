import { useState, useCallback, useEffect } from "react";
import { toast } from "sonner";
import type { BocraLicenceType } from "@/lib/constants";
import { getWizardConfig, type StepConfig, type StepProps } from "@/lib/applicationStepConfig";
import { createApplication, getApplication, listApplications, submitApplication, updateApplication } from "@/lib/applications";
import { uploadDocument } from "@/lib/documents";
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

interface PersistedFileMeta {
  name: string;
  type: string;
  size: number;
  last_modified: number;
}

const EMPTY_FORM_DATA: FormData = {
  form_data_a: {},
  form_data_b: {},
  form_data_c: {},
  form_data_d: {},
};

const DRAFT_ID_STORAGE_KEY = "bocra_draft_application_id";

const serializeValue = (value: unknown): unknown => {
  if (value instanceof File) {
    return {
      name: value.name,
      type: value.type,
      size: value.size,
      last_modified: value.lastModified,
    } as PersistedFileMeta;
  }

  if (Array.isArray(value)) {
    return value.map((entry) => serializeValue(entry));
  }

  if (value && typeof value === "object") {
    return Object.fromEntries(
      Object.entries(value as Record<string, unknown>).map(([key, entry]) => [key, serializeValue(entry)]),
    );
  }

  return value;
};

const buildPersistableFormData = (formData: FormData): FormData => ({
  form_data_a: (serializeValue(formData.form_data_a) as Record<string, any>) || {},
  form_data_b: (serializeValue(formData.form_data_b) as Record<string, any>) || {},
  form_data_c: (serializeValue(formData.form_data_c) as Record<string, any>) || {},
  form_data_d: (serializeValue(formData.form_data_d) as Record<string, any>) || {},
});

export default function ApplicationWizard() {
  const [licenceType, setLicenceType] = useState<BocraLicenceType | null>(null);
  const [currentStep, setCurrentStep] = useState(0);
  const [formData, setFormData] = useState<FormData>({ ...EMPTY_FORM_DATA });
  const [completedSteps, setCompletedSteps] = useState<Set<number>>(new Set());
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSavingDraft, setIsSavingDraft] = useState(false);
  const [isLoadingDraft, setIsLoadingDraft] = useState(false);
  const [draftApplicationId, setDraftApplicationId] = useState<string | null>(null);

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

  useEffect(() => {
    if (!licenceType) return;

    let cancelled = false;

    const loadDraft = async () => {
      setIsLoadingDraft(true);
      try {
        const rememberedDraftId = localStorage.getItem(`${DRAFT_ID_STORAGE_KEY}:${licenceType}`);
        if (rememberedDraftId) {
          const remembered = await getApplication(rememberedDraftId);
          if (
            !cancelled
            && remembered.status === "draft"
            && remembered.licence_type === licenceType
          ) {
            setDraftApplicationId(remembered.id);
            setFormData({
              form_data_a: (remembered.form_data_a as Record<string, any>) || {},
              form_data_b: (remembered.form_data_b as Record<string, any>) || {},
              form_data_c: (remembered.form_data_c as Record<string, any>) || {},
              form_data_d: (remembered.form_data_d as Record<string, any>) || {},
            });
            toast.info("Draft loaded", {
              description: "We restored your previously saved draft for this licence type.",
            });
            return;
          }
        }

        const apps = await listApplications();
        const latestDraft = apps.find((app) => app.status === "draft" && app.licence_type === licenceType);
        if (!latestDraft || cancelled) return;

        const draft = await getApplication(latestDraft.id);
        if (cancelled || draft.status !== "draft") return;

        localStorage.setItem(`${DRAFT_ID_STORAGE_KEY}:${licenceType}`, draft.id);
        setDraftApplicationId(draft.id);
        setFormData({
          form_data_a: (draft.form_data_a as Record<string, any>) || {},
          form_data_b: (draft.form_data_b as Record<string, any>) || {},
          form_data_c: (draft.form_data_c as Record<string, any>) || {},
          form_data_d: (draft.form_data_d as Record<string, any>) || {},
        });
        toast.info("Draft loaded", {
          description: "We found an existing draft for this licence type.",
        });
      } catch {
        // Ignore draft load failures and allow a fresh start.
      } finally {
        if (!cancelled) setIsLoadingDraft(false);
      }
    };

    void loadDraft();

    return () => {
      cancelled = true;
    };
  }, [licenceType]);

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

  const handleSaveDraft = async () => {
    if (!licenceType || isSavingDraft || isSubmitting) {
      return;
    }

    setIsSavingDraft(true);
    try {
      const persistable = buildPersistableFormData(formData);

      let draftId = draftApplicationId;
      if (!draftId) {
        const created = await createApplication({
          licence_type: licenceType,
          form_data_a: persistable.form_data_a,
          form_data_b: persistable.form_data_b,
          form_data_c: persistable.form_data_c,
          form_data_d: persistable.form_data_d,
        });
        draftId = created.id;
        setDraftApplicationId(draftId);
      } else {
        await updateApplication(draftId, {
          licence_type: licenceType,
          form_data_a: persistable.form_data_a,
          form_data_b: persistable.form_data_b,
          form_data_c: persistable.form_data_c,
          form_data_d: persistable.form_data_d,
        });
      }

      localStorage.setItem(`${DRAFT_ID_STORAGE_KEY}:${licenceType}`, draftId);

      toast.success("Draft saved", {
        description: "Your application progress has been saved. You can continue later.",
      });
    } catch (error) {
      toast.error("Could not save draft", {
        description: error instanceof Error ? error.message : "Please try again.",
      });
    } finally {
      setIsSavingDraft(false);
    }
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
      const persistable = buildPersistableFormData(formData);

      let applicationId = draftApplicationId;
      if (!applicationId) {
        const created = await createApplication({
          licence_type: licenceType,
          form_data_a: persistable.form_data_a,
          form_data_b: persistable.form_data_b,
          form_data_c: persistable.form_data_c,
          form_data_d: persistable.form_data_d,
        });
        applicationId = created.id;
        setDraftApplicationId(created.id);
      } else {
        await updateApplication(applicationId, {
          licence_type: licenceType,
          form_data_a: persistable.form_data_a,
          form_data_b: persistable.form_data_b,
          form_data_c: persistable.form_data_c,
          form_data_d: persistable.form_data_d,
        });
      }

      const files = (formData.form_data_d.files || []) as File[];
      const uploadedDocuments = [] as Array<{
        id: string;
        file_name: string;
        file_type: string;
        file_size: number;
        category: string;
        created_at: string;
      }>;
      for (const file of files) {
        const uploaded = await uploadDocument({
          file,
          category: "application",
          applicationId,
        });
        uploadedDocuments.push(uploaded);
      }

      if (applicationId) {
        await updateApplication(applicationId, {
          form_data_d: {
            ...persistable.form_data_d,
            files: (persistable.form_data_d.files as unknown[]) || [],
            uploaded_documents: uploadedDocuments,
          },
        });
      }

      const submitted = await submitApplication(applicationId);
      localStorage.removeItem(`${DRAFT_ID_STORAGE_KEY}:${licenceType}`);
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
  const isBusy = isSubmitting || isSavingDraft || isLoadingDraft;

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
          submitting={isBusy}
        />
      </div>
    </div>
  );
}
