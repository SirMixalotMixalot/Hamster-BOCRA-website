import type { StepProps } from "@/lib/applicationStepConfig";
import StepContainer from "../wizard/StepContainer";
import FormSection from "../shared/FormSection";
import FileUploadZone from "../shared/FileUploadZone";
import DigitalSignatureCanvas from "../shared/DigitalSignatureCanvas";

export default function DocumentsSignatureStep({ data, onChange, readOnly }: StepProps) {
  const files = data.files || [];
  const signature = data.signature || "";

  return (
    <StepContainer
      title="Documents & Signature"
      description="Upload supporting documents and provide your digital signature."
    >
      <FormSection title="Supporting Documents">
        <p className="text-xs text-muted-foreground mb-3">
          Upload any required supporting documents such as company registration certificates,
          ID copies, or technical specifications.
        </p>
        <FileUploadZone
          files={files}
          onChange={(f) => onChange({ ...data, files: f })}
          readOnly={readOnly}
        />
      </FormSection>

      <FormSection title="Digital Signature">
        <p className="text-xs text-muted-foreground mb-3">
          I declare that all the details given in this application form are correct to the best of my knowledge.
        </p>
        <DigitalSignatureCanvas
          value={signature}
          onChange={(v) => onChange({ ...data, signature: v })}
          readOnly={readOnly}
        />
      </FormSection>
    </StepContainer>
  );
}
