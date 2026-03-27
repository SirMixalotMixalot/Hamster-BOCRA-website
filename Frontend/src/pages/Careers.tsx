import Header from "@/components/Header";
import BottomBar from "@/components/BottomBar";
import { useNavigate } from "react-router-dom";
import { Briefcase, MapPin, Clock, ChevronRight } from "lucide-react";
import careersBg from "@/assets/styling/careers.avif";

export interface JobPosting {
  id: string;
  title: string;
  department: string;
  location: string;
  type: string;
  closingDate: string;
  summary: string;
  responsibilities: string[];
  requirements: { education: string; experience: string };
  howToApply: string;
}

export const sampleJobs: JobPosting[] = [
  {
    id: "legal-officer",
    title: "Legal Officer",
    department: "Legal Services",
    location: "Gaborone, Botswana",
    type: "Full-time",
    closingDate: "20 April 2026",
    summary:
      "To provide legal advisory services on administrative and regulatory matters to the Botswana Communications Regulatory Authority (BOCRA/the Authority) and the Universal Access and Service Fund Trust (UASF). To review and draft regulations, procedures, contracts and other legal documents consistent with the provisions and objectives of the Authority as well as other applicable/relevant legislation and Policies. To provide corporate governance support services to the Executive Management, the Board of Trustees of the UASF.",
    responsibilities: [
      "Undertake research and provide written and/or oral legal opinions to Management and departments of the Authority and advise on legal risks to inform decision making",
      "Undertake awareness initiatives of relevant new and existing laws to Board, Management, and staff of the Authority",
      "Coordination of legal instructions internally and externally as well as liaising with external counsel to do litigation management for suits involving the Authority and the UASF",
      "Comment on notifications of disputes and complaints and render necessary advice to departments",
      "Provision of support in ensuring compliance and monitoring for the Authority's regulated entities",
      "Assist in representing the Authority in legal actions where necessary",
      "Draft or review contracts and Memorandum of Understanding (lease, licenses, service provision agreements, financial contracts, guidelines, regulations, standards)",
      "Participate in negotiations leading to contract/agreements",
      "Review policy and legal documents affecting or related to regulatory matters",
      "Work with Procurement Unit to maintain and monitor a contract management database and MoU register",
      "Ensure accurate filing and records of the Legal Services Department and ensure the confidentiality, security, and integrity of legal documents",
      "Assist in the arrangement of meetings for the Executive Management Committee, scheduling meetings and determination of the Agenda",
      "Develop and disseminate meeting packs within set timelines",
      "Assist in the recording of true and accurate record or minutes of meetings for Executive Management Committee",
      "Assist with follow up and dissemination of information for implementation of Executive Management Committee resolutions as well as action items",
      "Assist in maintenance of accurate files and records of the Executive Management Committee meetings and ensure the confidentiality, security, and integrity of the documents",
      "Undertake research and monitor legal developments as well as corporate governance changes to advise on implementation to Board of the Authority and UASF Trustees",
      "Assist in implementation of the Environment, Social and Governance (ESG) strategic initiatives of the Authority",
    ],
    requirements: {
      education:
        "Bachelor of Laws (LLB) degree or equivalent and admitted to practice in the High Court of Botswana.",
      experience:
        "At least 2 years' experience in one or more of the following: Administrative law, corporate law, Communications, technology law, Media law or civil litigation. Previous experience in a regulatory environment will be an added advantage. The candidate should be a member of the Law Society of Botswana in good standing.",
    },
    howToApply:
      "Candidates who meet the requirements for the above-mentioned position should apply and attach their Curriculum Vitae and Certified Copies of educational certificates.",
  },
  {
    id: "senior-legal-officer",
    title: "Senior Legal Officer",
    department: "Legal Services",
    location: "Gaborone, Botswana",
    type: "Full-time",
    closingDate: "20 April 2026",
    summary:
      "To provide legal advisory on administrative and regulatory issues affecting the Authority (the Authority), the Universal Access and Service Fund Trust (UASF) and the Communication Regulators Association of Southern Africa (CRASA). To review and draft regulations, procedures, contracts and other legal documents consistent with the provisions and objectives of the Communications Regulatory Authority Act, the UASF Deed of Trust, Trust Property Control Act, CRASA Constitution and Procedure Manual and other applicable/relevant legislation and Policies. To provide corporate governance support services to the Board of the Authority, the UASF Board of Trustees and CRASA.",
    responsibilities: [
      "Undertake research and provide legal advice or opinion (written and or oral)",
      "Manage and monitor organisational compliance to ensure the Authority's compliance to own policies and statutory/regulatory requirements",
      "Provision of guidance on the Authority's legal risk exposure and management",
      "Oversee and manage the Authority's litigation portfolio",
      "Assist in representing the Authority in legal actions where necessary",
      "Provide legal advisory services for the Authority's regulatory obligations and acts as a regulatory liaison",
      "Draft and review contracts and Memorandums of Understanding on behalf of the Authority, UASF and CRASA",
      "Participate in negotiations leading to contract/agreements",
      "Undertake research and advise in review of regional and international model laws and legal documents affecting or related to the communications sector and emerging technologies",
      "Undertake research and provide guidance on regulated entities dispute management processes and assists in drafting/interpreting of rulings/directives for the sector",
      "Undertake research and monitor legal developments as well as technological regulatory landscapes to advise on applicability to the business of the Authority, UASF and CRASA",
      "Undertake research and assist in formulation of the Authority/Botswana position for regional and international obligations and decision making for the regulated sector",
      "Assist in the arrangement of meetings for the UASF Trustees, BOCRA Board and the Board Committees, including the preparation of the Board meeting calendar, determination of Agenda and preparation for the meetings",
      "Develop and disseminate meeting packs within set timelines",
      "Assist in the recording of true and accurate record or minutes of meetings for the Board and Trustees",
      "Assist with follow-up and dissemination of information for implementation of Board resolutions as well as action items",
      "Assist in the maintenance of accurate files and records of the Board and Committee meetings to ensure the confidentiality, security, and integrity of the documents",
      "Undertake research and monitor legal developments as well as corporate governance changes to advise on implementation to Board and Trustees",
      "Assist in implementation of the Environment, Social and Governance (ESG) strategic initiatives of the Authority",
    ],
    requirements: {
      education:
        "Bachelor of Laws (LLB) degree or equivalent and admitted to practice in the High Court of Botswana.",
      experience:
        "At least 3 years' experience in one or more of the following: Administrative law, Corporate law, Communications law, technology law, Media law or civil litigation. Previous experience in a regulatory environment will be an added advantage. The candidate should be a member of the Law Society of Botswana in good standing.",
    },
    howToApply:
      "Candidates who meet the requirements for the above-mentioned position should apply and attach their Curriculum Vitae and Certified Copies of educational certificates.",
  },
];

const Careers = () => {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen flex flex-col bg-background">
      <Header />

      {/* Hero Banner */}
      <section className="relative flex items-center justify-center -mt-16 py-20 pt-[calc(4rem+5rem)] md:-mt-[72px] md:py-28 md:pt-[calc(4.5rem+7rem)] lg:-mt-[5.75rem] lg:pt-[calc(5.75rem+7rem)]">
        <div className="absolute inset-x-0 -top-1 bottom-0 overflow-hidden">
          <img src={careersBg} alt="" className="h-[calc(100%+4px)] min-h-full w-full -translate-y-px object-cover object-[center_70%]" />
          <div className="absolute inset-0 bg-black/50" />
        </div>
        <div className="relative z-10 container max-w-6xl mx-auto px-4 text-center">
          <h1 className="text-4xl md:text-5xl font-extrabold text-white mb-4">Careers</h1>
          <p className="text-lg text-white/80 max-w-3xl mx-auto">
            Join BOCRA and be part of Botswana's fast-moving communications sector.
          </p>
        </div>
      </section>

      <main className="min-w-0 flex-1 py-12 md:py-16">
        <section className="container max-w-5xl mx-auto px-4">

          <div className="space-y-8">
            <p className="text-sm md:text-base leading-relaxed text-muted-foreground">
              Botswana Communications Regulatory Authority (BOCRA) is the regulator of the Botswana communications sector, with responsibilities over telecommunications, broadcasting, postal and radio communication services. Technology is fast changing every aspect of our economy and telecommunications regulation is fast changing to keep pace with all these changes in the industry. This is an exciting time to be at the heart of this fast-moving sector and you can be part of it!
            </p>

            {/* Vacancies */}
            <div>
              <h2 className="text-xl md:text-2xl font-bold text-foreground">Vacancies</h2>
              <p className="mt-2 text-sm md:text-base leading-relaxed text-muted-foreground">
                The Authority seeks to appoint qualified, enthusiastic and results oriented citizen of Botswana in the following position(s):
              </p>

              <div className="mt-6 space-y-4">
                {sampleJobs.map((job) => (
                  <button
                    key={job.id}
                    onClick={() => navigate(`/careers/${job.id}`)}
                    className="w-full text-left bg-white rounded-lg border border-border p-5 hover:border-primary/40 hover:shadow-sm transition-all group"
                  >
                    <div className="flex items-start justify-between gap-4">
                      <div className="space-y-2 flex-1">
                        <h3 className="text-base md:text-lg font-semibold text-foreground group-hover:text-primary transition-colors">
                          {job.title}
                        </h3>
                        <div className="flex flex-wrap gap-x-4 gap-y-1 text-xs md:text-sm text-muted-foreground">
                          <span className="inline-flex items-center gap-1">
                            <Briefcase className="h-3.5 w-3.5" />
                            {job.department}
                          </span>
                          <span className="inline-flex items-center gap-1">
                            <MapPin className="h-3.5 w-3.5" />
                            {job.location}
                          </span>
                          <span className="inline-flex items-center gap-1">
                            <Clock className="h-3.5 w-3.5" />
                            Closing: {job.closingDate}
                          </span>
                        </div>
                        <p className="text-sm text-muted-foreground line-clamp-2">
                          {job.summary}
                        </p>
                      </div>
                      <ChevronRight className="h-5 w-5 text-muted-foreground/40 group-hover:text-primary shrink-0 mt-1 transition-colors" />
                    </div>
                  </button>
                ))}
              </div>
            </div>
          </div>
        </section>
      </main>
      <BottomBar />
    </div>
  );
};

export default Careers;
