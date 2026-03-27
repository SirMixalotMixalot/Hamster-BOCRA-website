import { useState, useCallback, useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { toast } from "sonner";
import type { BocraLicenceType } from "@/lib/constants";
import { LoadingDots } from "@/components/ui/loading-dots";
import { getWizardConfig, type StepConfig, type StepProps } from "@/lib/applicationStepConfig";
import { createApplication, getApplication, listApplications, submitApplication, updateApplication, type ApplicationDetail, type ApplicationStatus } from "@/lib/applications";
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
const REDIRECT_STATUSES = new Set<ApplicationStatus>(["submitted", "under_review", "waiting_for_payment", "approved", "rejected", "requires_action"]);

const getDraftStorageKey = (type: BocraLicenceType) => `${DRAFT_ID_STORAGE_KEY}:${type}`;
const isRedirectStatus = (status: ApplicationStatus) => REDIRECT_STATUSES.has(status);

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
  const navigate = useNavigate();
  const [licenceType, setLicenceType] = useState<BocraLicenceType | null>(null);
  const [currentStep, setCurrentStep] = useState(0);
  const [formData, setFormData] = useState<FormData>({ ...EMPTY_FORM_DATA });
  const [completedSteps, setCompletedSteps] = useState<Set<number>>(new Set());
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSavingDraft, setIsSavingDraft] = useState(false);
  const [isLoadingDraft, setIsLoadingDraft] = useState(false);
  const [draftApplicationId, setDraftApplicationId] = useState<string | null>(null);
  const submitInFlightRef = useRef(false);

  // Steps only exist after licence type is selected
  const config = licenceType ? getWizardConfig(licenceType) : null;
  const steps: StepConfig[] = config ? config.steps : [];
  const currentStepConfig = steps[currentStep] ?? null;

  const resetWizardState = useCallback(() => {
    setLicenceType(null);
    setCurrentStep(0);
    setFormData({ ...EMPTY_FORM_DATA });
    setCompletedSteps(new Set());
    setDraftApplicationId(null);
  }, []);

  const clearDraftState = useCallback((type?: BocraLicenceType | null) => {
    if (type) {
      localStorage.removeItem(getDraftStorageKey(type));
    }
    resetWizardState();
  }, [resetWizardState]);

  const redirectToSafeDestination = useCallback((application?: Pick<ApplicationDetail, "id" | "reference_number"> | null, state?: Record<string, unknown>) => {
    const search = application?.reference_number
      ? `?ref=${encodeURIComponent(application.reference_number)}`
      : "";

    navigate(`/customer/applications${search}`, {
      replace: true,
      state: application
        ? {
            ...state,
            applicationId: application.id,
            justSubmitted: Boolean(state?.justSubmitted),
            referenceNumber: application.reference_number,
          }
        : state,
    });
  }, [navigate]);

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
        const rememberedDraftId = localStorage.getItem(getDraftStorageKey(licenceType));
        if (rememberedDraftId) {
          const remembered = await getApplication(rememberedDraftId);
          if (cancelled) return;

          if (remembered.licence_type === licenceType && isRedirectStatus(remembered.status)) {
            clearDraftState(licenceType);
            redirectToSafeDestination(remembered);
            return;
          }

          if (remembered.status === "draft" && remembered.licence_type === licenceType) {
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

        localStorage.setItem(getDraftStorageKey(licenceType), draft.id);
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
  }, [clearDraftState, licenceType, redirectToSafeDestination]);

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

      localStorage.setItem(getDraftStorageKey(licenceType), draftId);

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
    if (isSubmitting || submitInFlightRef.current) {
      return;
    }
    submitInFlightRef.current = true;
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
      clearDraftState(licenceType);
      redirectToSafeDestination(submitted, {
        justSubmitted: true,
      });
    } catch (error) {
      const message = error instanceof Error ? error.message : "Could not submit application. Please try again.";
      const shouldCheckCurrentStatus = Boolean(draftApplicationId) && /draft applications|current status|already submitted/i.test(message);

      if (shouldCheckCurrentStatus && draftApplicationId) {
        try {
          const currentApplication = await getApplication(draftApplicationId);
          if (isRedirectStatus(currentApplication.status)) {
            clearDraftState(licenceType);
            redirectToSafeDestination(currentApplication, {
              redirectReason: "not_draft",
            });
            return;
          }
        } catch {
          // Fall back to the original error toast below.
        }
      }

      toast.error("Submission failed", {
        description: message,
      });
    } finally {
      submitInFlightRef.current = false;
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

  if (isLoadingDraft) {
    return (
      <div className="glass rounded-2xl p-8 text-center">
        <LoadingDots label="Loading your application draft..." />
      </div>
    );
  }

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
