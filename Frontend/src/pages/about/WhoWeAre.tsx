import Header from "@/components/Header";
import BottomBar from "@/components/BottomBar";
import { useNavigate } from "react-router-dom";
import { ArrowLeft } from "lucide-react";

const coreValues = [
  { title: "Excellence", description: "A commitment to being a world class leader through dedicated teamwork and superior customer service." },
  { title: "Proactiveness", description: "Maintaining a forward looking approach to stay ahead of rapidly evolving technological and industry trends." },
  { title: "Integrity", description: "Ensuring that all decisions are rooted in openness, honesty and professional accountability." },
  { title: "People", description: "Recognizing that internal talent is the primary driver of success and focusing on developing individual strengths to work as a unified force." },
];

const WhoWeAre = () => {
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
            <h1 className="text-3xl md:text-4xl font-extrabold text-foreground">Overview</h1>
          </div>

          <div className="space-y-6">
            <p className="text-sm md:text-base leading-relaxed text-muted-foreground">
              The Botswana Communications Regulatory Authority is the statutory body charged with overseeing the nation's dynamic communications landscape. Established on April 1, 2013, following the enactment of the Communications Regulatory Authority Act of 2012 (CRA Act), BOCRA was designed to function as a converged regulator.
            </p>
            <p className="text-sm md:text-base leading-relaxed text-muted-foreground">
              By replacing older, segmented legislation like the Broadcasting and Telecommunications Acts, it successfully integrated the oversight of four key sectors: telecommunications, broadcasting, postal services and the internet.
            </p>

            <div>
              <h2 className="text-base md:text-lg font-semibold text-foreground">Our Mission</h2>
              <p className="mt-2 text-sm md:text-base leading-relaxed text-muted-foreground">
                To regulate the communications sector in a way that promotes healthy competition, drives innovation, ensures robust consumer protection, and guarantees universal access for all citizens.
              </p>
            </div>

            <div>
              <h2 className="text-base md:text-lg font-semibold text-foreground">Our Vision</h2>
              <p className="mt-2 text-sm md:text-base leading-relaxed text-muted-foreground">
                A connected and digitally driven society.
              </p>
            </div>

            <div>
              <h2 className="text-base md:text-lg font-semibold text-foreground mb-3">Core Values</h2>
              <div className="space-y-4">
                {coreValues.map((value, index) => (
                  <div key={value.title} className="flex gap-1.5 text-sm md:text-base leading-relaxed text-muted-foreground">
                    <span className="font-semibold text-primary shrink-0">{index + 1}.</span>
                    <div>
                      <span className="text-foreground">{value.title}</span>
                      <p className="mt-1">{value.description}</p>
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

export default WhoWeAre;
