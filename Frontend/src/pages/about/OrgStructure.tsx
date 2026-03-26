import Header from "@/components/Header";
import BottomBar from "@/components/BottomBar";
import { useNavigate } from "react-router-dom";
import { ArrowLeft, User } from "lucide-react";

const boardMembers = [
  {
    name: "Dr Bokamoso Basutli, PhD",
    role: "Chairperson",
    image: "/board/basutli.png",
    bio: "Dr. Bokamoso Basutli is a Professional Engineer and Senior Member of the Institute of Electrical and Electronics Engineers (IEEE). He is currently the Head of the Department of Electrical and Communications Systems Engineering at the Botswana International University of Science and Technology (BIUST).",
  },
  {
    name: "Mr Moabi Pusumane",
    role: "Vice Chairperson",
    image: "/board/pusumane.png",
    bio: "He is a dynamic and results-driven executive with over 15 years of cross-functional experience in telecommunications, project management, market intelligence, route to market, and commercial leadership. Currently serving as Commercial Director at Coca-Cola Beverages Botswana.",
  },
  {
    name: "Ms Montle Phuthego",
    role: "Board Member",
    image: "/board/phuthego.png",
    bio: "Ms Montle Phuthego is a seasoned business development, trade and investment expert who holds a Master of Science Degree in Economics from the University of Warwick in the United Kingdom.",
  },
  {
    name: "Ms Atla Dimpho Seleka",
    role: "Board Member",
    image: "/board/seleka.png",
    bio: "Ms Atla Dimpho Seleka is a distinguished finance professional with over two decades of senior leadership in public financial management and fiscal governance. She is a Fellow of both the Association of Chartered Certified Accountants (FCCA-UK) and the Botswana Institute of Chartered Accountants (FCPA-BICA), and a member of the Chartered Institute of Public Finance and Accountancy (CIPFA-UK) as well as the Association of Accounting Technicians (AAT).",
  },
  {
    name: "Ms Lebogang George",
    role: "Board Member",
    image: "/board/george.png",
    bio: "Ms Lebogang George is a Partner at AJA/MCL, and an attorney admitted to the High Courts of Botswana. She has extensive experience in commercial law, procurement law, ICT law, IT governance, and data protection and privacy law in Botswana, South Africa, and the EU.",
  },
  {
    name: "Mr Ronald Kgafela, CODP",
    role: "Board Member",
    image: "/board/kgafela.png",
    bio: "Mr Ronald Kgafela is a seasoned Human Capital leader with over 20 years of experience spanning Human Resources, Organisational Development, Employment Relations, Change, and Transformation. He is a Certified Professional Business Coach (PBC), a Chartered Organisational Development Practitioner (CODP), and an Organisational Development Certified Consultant (ODCC) with GIODN.",
  },
  {
    name: "Dr Kennedy Ramojela",
    role: "Board Member",
    image: "/board/ramojela.png",
    bio: "Dr Kennedy Ramojela holds a PhD in Media and Communications from Royal Melbourne Institute of Technology (RMIT) University, Melbourne, Australia. He did Master of Philosophy in film and broadcasting from the University of Southampton, UK.",
  },
];

const executiveTeam = [
  { name: "Mr Martin Mokgware", title: "Chief Executive", image: "/executive/mokgware.png" },
  { name: "Mr Murphy Setshwane", title: "Director Business Development", image: "/executive/setshwane.png" },
  { name: "Mr Peter Tladinyane", title: "Director Corporate Services", image: "/executive/tladinyane.png" },
  { name: "Ms Bonny Mine", title: "Director Finance", image: "/executive/mine.png" },
  { name: "Mr Bathopi Luke", title: "Director Technical Services", image: "/executive/luke.png" },
  { name: "Ms Tebogo Mmoshe", title: "Director of Licensing", image: "/executive/mmoshe.png" },
  { name: "Ms Maitseo Ratladi", title: "Director Broadband and Universal Service", image: "/executive/ratladi.png" },
  { name: "Ms Joyce Isa Molwane", title: "Director Legal, Compliance and Board Secretary", image: "/executive/molwane.png" },
];

const OrgStructure = () => {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen flex flex-col bg-background">
      <Header />
      <main className="min-w-0 flex-1 py-12 md:py-16">
        <section className="container max-w-5xl mx-auto px-4">
          <div className="mb-8 md:mb-10">
            <button
              onClick={() => navigate("/")}
              className="inline-flex items-center gap-1.5 text-sm text-primary hover:text-primary/80 transition-colors mb-4"
            >
              <ArrowLeft className="h-4 w-4" />
              Back to Home
            </button>
            <h1 className="text-3xl md:text-4xl font-extrabold text-foreground">Organisational Structure</h1>
          </div>

          <div className="space-y-10">
            {/* Non-Executive Board */}
            <div>
              <h2 className="text-xl md:text-2xl font-bold text-foreground">Non-Executive Board of Directors</h2>
              <p className="mt-2 text-sm md:text-base leading-relaxed text-muted-foreground">
                The Botswana Communications Regulatory Authority is led by a team of seven (7) non-executive board of directors and one (1) Ex-Officio member being the Chief Executive. The Board is appointed by the Minister responsible for Communications in terms of Section 4 of the Communications Regulatory Authority Act, 2012. The Minister appointed the new Board with effect from 1 August 2025.
              </p>
              <div className="mt-6 space-y-8">
                {boardMembers.map((member) => (
                  <div key={member.name} className="flex flex-col sm:flex-row gap-5">
                    <div className="w-32 h-32 shrink-0 rounded-lg bg-muted overflow-hidden">
                      <img
                        src={member.image}
                        alt={member.name}
                        className="w-full h-full object-cover"
                        onError={(e) => {
                          e.currentTarget.style.display = "none";
                          e.currentTarget.nextElementSibling?.classList.remove("hidden");
                        }}
                      />
                      <div className="hidden w-full h-full flex items-center justify-center">
                        <User className="h-10 w-10 text-muted-foreground/40" />
                      </div>
                    </div>
                    <div>
                      <h3 className="text-base font-semibold text-foreground">{member.name}</h3>
                      <p className="text-sm text-primary font-medium">{member.role}</p>
                      <p className="mt-2 text-sm md:text-base leading-relaxed text-muted-foreground">{member.bio}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Executive Team */}
            <div>
              <h2 className="text-xl md:text-2xl font-bold text-foreground">Executive Management Team</h2>
              <div className="mt-6 space-y-8">
                {executiveTeam.map((member) => (
                  <div key={member.name} className="flex flex-col sm:flex-row gap-5">
                    <div className="w-32 h-32 shrink-0 rounded-lg bg-muted overflow-hidden">
                      <img
                        src={member.image}
                        alt={member.name}
                        className="w-full h-full object-cover"
                        onError={(e) => {
                          e.currentTarget.style.display = "none";
                          e.currentTarget.nextElementSibling?.classList.remove("hidden");
                        }}
                      />
                      <div className="hidden w-full h-full flex items-center justify-center">
                        <User className="h-10 w-10 text-muted-foreground/40" />
                      </div>
                    </div>
                    <div>
                      <h3 className="text-base font-semibold text-foreground">{member.name}</h3>
                      <p className="text-sm text-primary font-medium">{member.title}</p>
                    </div>
                  </div>
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

export default OrgStructure;
