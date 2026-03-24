import {
  Radio,
  Wifi,
  Tv,
  Satellite,
  Signal,
  Shield,
  Store,
  Network,
  Plane,
  Megaphone,
  CircuitBoard,
  Globe,
  Antenna,
} from "lucide-react";
import { BOCRA_LICENCE_TYPES, type BocraLicenceType } from "@/lib/constants";

interface LicenceTypeStepProps {
  selectedType: BocraLicenceType | null;
  onSelect: (type: BocraLicenceType) => void;
}

const LICENCE_META: Record<string, { icon: React.ElementType; description: string; color: string }> = {
  "Aircraft Radio Licence": { icon: Plane, description: "Radio equipment installed on aircraft for aviation communications", color: "text-sky-600" },
  "Amateur Radio License": { icon: Radio, description: "Personal radio operation for hobby and experimental use", color: "text-violet-600" },
  "Broadcasting Licence": { icon: Tv, description: "Television and sound broadcasting services", color: "text-rose-600" },
  "Cellular Licence": { icon: Signal, description: "Cellular mobile telecommunications services", color: "text-green-600" },
  "Citizen Band Radio Licence": { icon: Megaphone, description: "Short-range personal and business radio communications", color: "text-amber-600" },
  "Point-to-Multipoint Licence": { icon: Network, description: "One-to-many wireless network infrastructure", color: "text-teal-600" },
  "Point-to-Point Licence": { icon: Wifi, description: "Dedicated wireless links between two fixed locations", color: "text-blue-600" },
  "Private Radio Communication Licence": { icon: Antenna, description: "Private radio networks for organizations and businesses", color: "text-indigo-600" },
  "Radio Dealers Licence": { icon: Store, description: "Licence to sell, import, or distribute radio equipment", color: "text-orange-600" },
  "Radio Frequency Licence": { icon: CircuitBoard, description: "Assignment of radio frequency spectrum for operations", color: "text-cyan-600" },
  "Satellite Service Licence": { icon: Satellite, description: "Earth station and satellite communication services", color: "text-purple-600" },
  "Type Approval Licence": { icon: Shield, description: "Approval for telecommunications and radio equipment", color: "text-emerald-600" },
  "VANS Licence": { icon: Globe, description: "Value Added Network Services provision", color: "text-pink-600" },
};

export default function LicenceTypeStep({ selectedType, onSelect }: LicenceTypeStepProps) {
  return (
    <div className="bg-white/40 backdrop-blur-sm rounded-2xl border border-white/60 shadow-lg p-6 space-y-6">
      <div>
        <h2 className="text-lg font-heading font-bold text-foreground">Select Licence Type</h2>
        <p className="text-sm text-muted-foreground mt-1">
          Choose the type of licence you want to apply for. This determines the information required.
        </p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
        {BOCRA_LICENCE_TYPES.map((type) => {
          const meta = LICENCE_META[type] || { icon: Radio, description: "", color: "text-primary" };
          const Icon = meta.icon;
          const isSelected = selectedType === type;

          return (
            <button
              key={type}
              type="button"
              onClick={() => onSelect(type)}
              className={`group relative text-left p-4 rounded-xl border-2 transition-all duration-200 ${
                isSelected
                  ? "border-primary bg-primary/10 shadow-md"
                  : "border-white/60 bg-white/20 hover:border-primary/40 hover:bg-white/40 hover:shadow-sm"
              }`}
            >
              <div className="flex items-start gap-3">
                <div
                  className={`shrink-0 w-9 h-9 rounded-lg flex items-center justify-center transition-colors ${
                    isSelected ? "bg-primary text-white" : `bg-white/50 ${meta.color}`
                  }`}
                >
                  <Icon className="h-4.5 w-4.5" />
                </div>
                <div className="min-w-0">
                  <p className={`text-sm font-semibold leading-tight ${isSelected ? "text-primary" : "text-foreground"}`}>
                    {type}
                  </p>
                  <p className="text-xs text-muted-foreground mt-1 line-clamp-2">
                    {meta.description}
                  </p>
                </div>
              </div>
            </button>
          );
        })}
      </div>
    </div>
  );
}
