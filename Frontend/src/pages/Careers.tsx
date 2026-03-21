import { Briefcase } from "lucide-react";

const Careers = () => {
  return (
    <div className="min-h-screen bg-gray-100">
      {/* Header band */}
      <div className="bg-bocra-navy text-white py-12">
        <div className="container text-center">
          <h1 className="text-3xl font-heading font-bold">Careers at BOCRA</h1>
          <p className="text-white/70 mt-2 text-sm">Join our team and help shape Botswana's communications landscape</p>
        </div>
      </div>

      {/* Content */}
      <div className="container py-12 max-w-3xl">
        <div className="bg-white rounded-xl border border-gray-200 p-12 text-center">
          <Briefcase className="h-12 w-12 text-muted-foreground/30 mx-auto" />
          <h2 className="text-lg font-heading font-semibold text-foreground mt-4">No New Openings</h2>
          <p className="text-sm text-muted-foreground mt-2 max-w-md mx-auto">
            There are currently no open positions. Please check back regularly for new opportunities at BOCRA.
          </p>
        </div>
      </div>
    </div>
  );
};

export default Careers;
