import Header from "@/components/Header";
import BottomBar from "@/components/BottomBar";
import { useNavigate } from "react-router-dom";
import { useState } from "react";
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

type FlipCardMember = {
  name: string;
  role: string;
  image: string;
  about: string;
};

const boardChair = boardMembers.find((member) => member.role === "Chairperson");
const boardViceChair = boardMembers.find((member) => member.role === "Vice Chairperson");
const boardOtherMembers = boardMembers.filter(
  (member) => member.role !== "Chairperson" && member.role !== "Vice Chairperson",
);

const boardPyramidRows: FlipCardMember[][] = [
  boardChair
    ? [
        {
          name: boardChair.name,
          role: boardChair.role,
          image: boardChair.image,
          about: boardChair.bio,
        },
      ]
    : [],
  [
    ...(boardViceChair
      ? [
          {
            name: boardViceChair.name,
            role: boardViceChair.role,
            image: boardViceChair.image,
            about: boardViceChair.bio,
          },
        ]
      : []),
    ...boardOtherMembers.slice(0, 2).map((member) => ({
      name: member.name,
      role: member.role,
      image: member.image,
      about: member.bio,
    })),
  ],
  boardOtherMembers.slice(2).map((member) => ({
    name: member.name,
    role: member.role,
    image: member.image,
    about: member.bio,
  })),
].filter((row) => row.length > 0);

const executivePyramidRows: FlipCardMember[][] = [
  executiveTeam.slice(0, 1).map((member) => ({
    name: member.name,
    role: member.title,
    image: member.image,
    about: `${member.name} serves as ${member.title} in BOCRA's executive management team.`,
  })),
  executiveTeam.slice(1, 4).map((member) => ({
    name: member.name,
    role: member.title,
    image: member.image,
    about: `${member.name} serves as ${member.title} in BOCRA's executive management team.`,
  })),
  executiveTeam.slice(4).map((member) => ({
    name: member.name,
    role: member.title,
    image: member.image,
    about: `${member.name} serves as ${member.title} in BOCRA's executive management team.`,
  })),
];

function FlipMemberCard({ member, featured = false }: { member: FlipCardMember; featured?: boolean }) {
  const [imageFailed, setImageFailed] = useState(false);

  return (
    <article className={`group w-full ${featured ? "max-w-[300px]" : "max-w-[230px]"}`}>
      <div className={`relative w-full [perspective:1200px] ${featured ? "h-[370px]" : "h-[310px]"}`}>
        <div className="relative h-full w-full rounded-xl border border-border bg-card shadow-sm transition-transform duration-500 [transform-style:preserve-3d] group-hover:[transform:rotateY(180deg)]">
          <div className="absolute inset-0 rounded-xl [backface-visibility:hidden]">
            <div className="flex h-full flex-col p-3">
              <div className={`rounded-lg bg-muted overflow-hidden ${featured ? "h-52" : "h-44"}`}>
                {!imageFailed ? (
                  <img
                    src={member.image}
                    alt={member.name}
                    className="h-full w-full object-cover object-top"
                    onError={() => setImageFailed(true)}
                  />
                ) : (
                  <div className="flex h-full w-full items-center justify-center">
                    <User className="h-10 w-10 text-muted-foreground/40" />
                  </div>
                )}
              </div>
              <div className="mt-3">
                <h3 className={`${featured ? "text-base" : "text-sm"} font-semibold text-foreground line-clamp-2`}>{member.name}</h3>
                <p className={`${featured ? "text-sm" : "text-xs"} mt-1 text-primary font-medium`}>{member.role}</p>
              </div>
              <p className="mt-auto text-[11px] text-muted-foreground">Hover to view About</p>
            </div>
          </div>
          <div className="absolute inset-0 rounded-xl bg-card p-3 [backface-visibility:hidden] [transform:rotateY(180deg)]">
            <p className="text-xs font-semibold uppercase tracking-wide text-primary">About</p>
            <p className="mt-2 text-sm text-foreground font-semibold line-clamp-2">{member.name}</p>
            <p className="mt-1 text-xs text-muted-foreground font-medium">{member.role}</p>
            <p className="mt-3 text-xs leading-relaxed text-muted-foreground line-clamp-[11]">{member.about}</p>
          </div>
        </div>
      </div>
    </article>
  );
}

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
              <div className="mt-6 space-y-6">
                {boardPyramidRows.map((row, rowIndex) => (
                  <div key={`board-row-${rowIndex}`} className="flex flex-wrap justify-center gap-4 md:gap-6">
                    {row.map((member) => (
                      <FlipMemberCard key={member.name} member={member} featured={rowIndex === 0} />
                    ))}
                  </div>
                ))}
              </div>
            </div>

            {/* Executive Team */}
            <div>
              <h2 className="text-xl md:text-2xl font-bold text-foreground">Executive Management Team</h2>
              <p className="mt-2 text-sm md:text-base leading-relaxed text-muted-foreground">
                BOCRA&apos;s Executive Management Team is responsible for translating board-approved strategy into day-to-day regulatory operations across licensing, technical standards, finance, legal compliance, and corporate services. Working under the Chief Executive, the team coordinates planning, service delivery, stakeholder engagement, and institutional performance to ensure that the Authority remains effective, accountable, and responsive to developments in communications and digital markets.
              </p>
              <div className="mt-6 space-y-6">
                {executivePyramidRows.map((row, rowIndex) => (
                  <div key={`executive-row-${rowIndex}`} className="flex flex-wrap justify-center gap-4 md:gap-6">
                    {row.map((member) => (
                      <FlipMemberCard key={member.name} member={member} featured={rowIndex === 0} />
                    ))}
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
