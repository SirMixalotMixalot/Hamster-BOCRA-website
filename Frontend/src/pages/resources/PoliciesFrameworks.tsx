import Header from "@/components/Header";
import BottomBar from "@/components/BottomBar";

const PoliciesFrameworks = () => {
  return (
    <div className="min-h-screen flex flex-col bg-background">
      <Header />
      <main className="min-w-0 flex-1">
        <div className="bg-bocra-navy text-white py-12">
          <div className="container text-center">
            <h1 className="text-3xl md:text-4xl font-heading font-extrabold">Policies & Frameworks</h1>
            <p className="text-white/70 mt-2 text-sm max-w-2xl mx-auto">
              Regulatory frameworks, guidelines and policy documents governing Botswana's communications sector.
            </p>
          </div>
        </div>

        <section className="container max-w-4xl mx-auto px-4 py-16 text-center">
          <p className="text-muted-foreground">Content coming soon.</p>
        </section>
      </main>
      <BottomBar />
    </div>
  );
};

export default PoliciesFrameworks;
