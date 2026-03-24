import type { StepProps } from "@/lib/applicationStepConfig";
import StepContainer from "../wizard/StepContainer";
import FormField from "../shared/FormField";
import FormSection from "../shared/FormSection";

const TELECOM_APPROVALS = [
  { id: "test_report_conformity", label: "1. Approval based on test report and certificate of conformity" },
  { id: "test_report_no_conformity", label: "2. Approval based on test report without certificate of conformity" },
  { id: "declaration_conformity", label: "3. Approval based on declaration of conformity" },
  { id: "supplementary_registration", label: "4. Supplementary registration" },
];

const RADIO_APPROVALS = [
  { id: "radio_test_report", label: "5. Approval based on test report" },
  { id: "radio_certificate", label: "6. Approval based on certificate (harmonized standard)" },
  { id: "radio_variant", label: "7. Approval based on earlier approved equipment (variant)" },
];

const DOCUMENTS = [
  { id: "test_report", label: "Test report" },
  { id: "declaration_certificate", label: "Declaration of conformity/certificate" },
  { id: "circuit_diagram", label: "Circuit diagram" },
  { id: "technical_description", label: "Brief technical description (product sheet)" },
  { id: "copy_markings", label: "Copy of markings" },
  { id: "operating_instructions", label: "Operating instructions" },
  { id: "repair_description", label: "Description of repair service in Botswana" },
  { id: "payment_receipt", label: "Receipt on payment of application fee" },
];

export default function TypeApprovalDetailsStep({ data, onChange, readOnly }: StepProps) {
  const update = (name: string, value: string) => onChange({ ...data, [name]: value });

  const toggleApproval = (id: string) => {
    if (readOnly) return;
    onChange({ ...data, approval_type: id });
  };

  const toggleDoc = (id: string) => {
    if (readOnly) return;
    const docs = new Set<string>(data.enclosed_documents || []);
    if (docs.has(id)) docs.delete(id);
    else docs.add(id);
    onChange({ ...data, enclosed_documents: Array.from(docs) });
  };

  const enclosedDocs = new Set<string>(data.enclosed_documents || []);

  return (
    <StepContainer
      title="Requested Approval & Documentation"
      description="Select the type of approval being requested and indicate which documents are enclosed."
    >
      <FormSection title="D. Requested Approval">
        <p className="text-xs font-medium text-muted-foreground mb-2">Telecommunications Terminal Equipment</p>
        <div className="space-y-2 mb-4">
          {TELECOM_APPROVALS.map((a) => (
            <button key={a.id} type="button" disabled={readOnly} onClick={() => toggleApproval(a.id)}
              className={`w-full text-left px-4 py-3 rounded-xl border transition-colors text-sm ${data.approval_type === a.id ? "border-primary bg-primary/10 text-primary font-medium" : "border-white/60 bg-white/20 text-foreground hover:bg-white/40"}`}
            >{a.label}</button>
          ))}
        </div>

        {(data.approval_type === "test_report_conformity" || data.approval_type === "test_report_no_conformity") && (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4 pl-4">
            <FormField label="Test Report No." name="test_report_no" value={data.test_report_no || ""} onChange={update} readOnly={readOnly} />
            <FormField label="Carried out by" name="test_carried_by" value={data.test_carried_by || ""} onChange={update} readOnly={readOnly} />
          </div>
        )}
        {data.approval_type === "supplementary_registration" && (
          <div className="pl-4 mb-4">
            <FormField label="Reference to Approval No." name="reference_approval_no" value={data.reference_approval_no || ""} onChange={update} readOnly={readOnly} />
          </div>
        )}

        <p className="text-xs font-medium text-muted-foreground mb-2">Radio Equipment</p>
        <div className="space-y-2">
          {RADIO_APPROVALS.map((a) => (
            <button key={a.id} type="button" disabled={readOnly} onClick={() => toggleApproval(a.id)}
              className={`w-full text-left px-4 py-3 rounded-xl border transition-colors text-sm ${data.approval_type === a.id ? "border-primary bg-primary/10 text-primary font-medium" : "border-white/60 bg-white/20 text-foreground hover:bg-white/40"}`}
            >{a.label}</button>
          ))}
        </div>

        {data.approval_type === "radio_test_report" && (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-4 pl-4">
            <FormField label="Test Report No." name="radio_test_report_no" value={data.radio_test_report_no || ""} onChange={update} readOnly={readOnly} />
            <FormField label="Carried out by" name="radio_test_carried_by" value={data.radio_test_carried_by || ""} onChange={update} readOnly={readOnly} />
          </div>
        )}
        {data.approval_type === "radio_certificate" && (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-4 pl-4">
            <FormField label="Certificate No." name="radio_certificate_no" value={data.radio_certificate_no || ""} onChange={update} readOnly={readOnly} />
            <FormField label="Issued by" name="radio_issued_by" value={data.radio_issued_by || ""} onChange={update} readOnly={readOnly} />
          </div>
        )}
      </FormSection>

      <FormSection title="E. Documentation Enclosed">
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
          {DOCUMENTS.map((d) => (
            <button key={d.id} type="button" disabled={readOnly} onClick={() => toggleDoc(d.id)}
              className={`text-left px-4 py-2.5 rounded-xl border transition-colors text-sm ${enclosedDocs.has(d.id) ? "border-primary bg-primary/10 text-primary font-medium" : "border-white/60 bg-white/20 text-foreground hover:bg-white/40"}`}
            >
              <span className={`inline-block w-4 h-4 rounded border mr-2 text-xs text-center leading-4 ${enclosedDocs.has(d.id) ? "bg-primary border-primary text-white" : "border-muted-foreground/40"}`}>
                {enclosedDocs.has(d.id) ? "✓" : ""}
              </span>
              {d.label}
            </button>
          ))}
        </div>
      </FormSection>
    </StepContainer>
  );
}
