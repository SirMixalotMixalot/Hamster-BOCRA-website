import Header from "@/components/Header";
import BottomBar from "@/components/BottomBar";
import aboutBg from "@/assets/styling/about.jpg";

const coreValues = [
  { title: "Excellence", description: "A commitment to being a world class leader through dedicated teamwork and superior customer service." },
  { title: "Proactiveness", description: "Maintaining a forward looking approach to stay ahead of rapidly evolving technological and industry trends." },
  { title: "Integrity", description: "Ensuring that all decisions are rooted in openness, honesty and professional accountability." },
  { title: "People", description: "Recognizing that internal talent is the primary driver of success and focusing on developing individual strengths to work as a unified force." },
];

const WhoWeAre = () => {
  return (
    <div className="min-h-screen flex flex-col bg-background">
      <Header />

      {/* Hero Banner */}
      <section className="relative flex items-center justify-center -mt-16 py-20 pt-[calc(4rem+5rem)] md:-mt-[72px] md:py-28 md:pt-[calc(4.5rem+7rem)] lg:-mt-[5.75rem] lg:pt-[calc(5.75rem+7rem)]">
        <div className="absolute inset-x-0 -top-1 bottom-0 overflow-hidden">
          <img src={aboutBg} alt="" className="h-[calc(100%+4px)] min-h-full w-full -translate-y-px object-cover" />
          <div className="absolute inset-0 bg-black/50" />
        </div>
        <div className="relative z-10 container max-w-6xl mx-auto px-4 text-center">
          <h1 className="text-4xl md:text-5xl font-extrabold text-white mb-4">About Us</h1>
          <p className="text-lg text-white/80 max-w-3xl mx-auto">
            Learn about BOCRA's role in regulating Botswana's communications landscape.
          </p>
        </div>
      </section>

      <main className="min-w-0 flex-1 py-12 md:py-16">
        <section className="container max-w-5xl mx-auto px-4">

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
