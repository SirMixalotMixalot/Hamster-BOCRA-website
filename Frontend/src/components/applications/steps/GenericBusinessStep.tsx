import type { StepProps } from "@/lib/applicationStepConfig";
import StepContainer from "../wizard/StepContainer";
import FormField from "../shared/FormField";
import FormSection from "../shared/FormSection";

export default function GenericBusinessStep({ data, onChange, licenceType, readOnly }: StepProps) {
  const update = (name: string, value: string) => onChange({ ...data, [name]: value });

  const isRadioDealer = licenceType === "Radio Dealers Licence";

  return (
    <StepContainer
      title="Business Details"
      description={isRadioDealer
        ? "Provide details about your radio equipment dealership."
        : "Provide details about the value added network services you intend to offer."
      }
    >
      <FormSection title="Business Information">
        <div className="space-y-4">
          <FormField
            label="Business Description"
            name="business_description"
            value={data.business_description || ""}
            onChange={update}
            type="textarea"
            readOnly={readOnly}
            placeholder={isRadioDealer
              ? "Describe the types of radio equipment you sell, import, or distribute..."
              : "Describe the value added network services you intend to provide..."
            }
          />
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <FormField label="Services Offered" name="services_offered" value={data.services_offered || ""} onChange={update} readOnly={readOnly} />
            <FormField label="Geographic Coverage Area" name="coverage_area" value={data.coverage_area || ""} onChange={update} readOnly={readOnly} />
            {isRadioDealer && (
              <>
                <FormField label="Radio Equipment Brands" name="equipment_brands" value={data.equipment_brands || ""} onChange={update} readOnly={readOnly} />
                <FormField label="Warehouse/Store Address" name="store_address" value={data.store_address || ""} onChange={update} readOnly={readOnly} />
              </>
            )}
            <FormField label="Number of Employees" name="employee_count" value={data.employee_count || ""} onChange={update} type="number" readOnly={readOnly} />
            <FormField label="Years in Operation" name="years_in_operation" value={data.years_in_operation || ""} onChange={update} type="number" readOnly={readOnly} />
          </div>
        </div>
      </FormSection>
    </StepContainer>
  );
}
