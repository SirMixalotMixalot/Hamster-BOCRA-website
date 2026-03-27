import Header from "@/components/Header";
import BottomBar from "@/components/BottomBar";
import { useNavigate, useParams } from "react-router-dom";
import { ArrowLeft, Briefcase, MapPin, Clock } from "lucide-react";
import { sampleJobs } from "@/pages/Careers";

const benefits = [
  "Pension allowance",
  "25 days holiday",
  "Private Medical Insurance",
  "Life Assurance",
];

const developmentPoints = [
  "A comprehensive set of internal training courses",
  "Investment to attend appropriate external courses",
  "Sponsorships for professional or academic qualifications",
  "Memberships of professional bodies",
];

const JobDetail = () => {
  const navigate = useNavigate();
  const { jobId } = useParams<{ jobId: string }>();
  const job = sampleJobs.find((j) => j.id === jobId);

  if (!job) {
    return (
      <div className="min-h-screen flex flex-col bg-background">
        <Header />
        <main className="min-w-0 flex-1 py-12 md:py-16">
          <section className="container max-w-5xl mx-auto px-4">
            <button
              onClick={() => navigate("/careers")}
              className="inline-flex items-center gap-1.5 text-sm text-primary hover:text-primary/80 transition-colors mb-4"
            >
              <ArrowLeft className="h-4 w-4" />
              Back to Careers
            </button>
            <h1 className="text-2xl font-bold text-foreground">Position Not Found</h1>
            <p className="mt-2 text-sm text-muted-foreground">
              The job posting you are looking for does not exist or has been removed.
            </p>
          </section>
        </main>
        <BottomBar />
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col bg-background">
      <Header />
      <main className="min-w-0 flex-1 py-12 md:py-16">
        <section className="container max-w-5xl mx-auto px-4">
          <div className="mb-8 md:mb-10">
            <button
              onClick={() => navigate("/careers")}
              className="inline-flex items-center gap-1.5 text-sm text-primary hover:text-primary/80 transition-colors mb-4"
            >
              <ArrowLeft className="h-4 w-4" />
              Back to Careers
            </button>
            <h1 className="text-3xl md:text-4xl font-extrabold text-foreground">{job.title}</h1>
            <div className="flex flex-wrap gap-x-4 gap-y-1 mt-3 text-xs md:text-sm text-muted-foreground">
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
          </div>

          <div className="space-y-8">
            {/* Summary */}
            <p className="text-sm md:text-base leading-relaxed text-muted-foreground">
              {job.summary}
            </p>

            {/* Key Responsibilities */}
            <div>
              <h2 className="text-base md:text-lg font-semibold text-foreground">Key Responsibilities</h2>
              <ul className="mt-3 space-y-2">
                {job.responsibilities.map((item, i) => (
                  <li key={i} className="flex gap-1.5 text-sm md:text-base leading-relaxed text-muted-foreground">
                    <span className="font-semibold text-primary shrink-0">{i + 1}.</span>
                    <span>{item}</span>
                  </li>
                ))}
              </ul>
            </div>

            {/* Requirements */}
            <div>
              <h2 className="text-base md:text-lg font-semibold text-foreground">Requirements</h2>
              <div className="mt-3 space-y-3">
                <div>
                  <h3 className="text-sm font-medium text-foreground">Education</h3>
                  <p className="mt-1 text-sm md:text-base leading-relaxed text-muted-foreground">
                    {job.requirements.education}
                  </p>
                </div>
                <div>
                  <h3 className="text-sm font-medium text-foreground">Experience</h3>
                  <p className="mt-1 text-sm md:text-base leading-relaxed text-muted-foreground">
                    {job.requirements.experience}
                  </p>
                </div>
              </div>
            </div>

            {/* How to Apply */}
            <div>
              <h2 className="text-base md:text-lg font-semibold text-foreground">How to Apply</h2>
              <p className="mt-2 text-sm md:text-base leading-relaxed text-muted-foreground">
                {job.howToApply}
              </p>
              <p className="mt-1 text-sm text-muted-foreground">
                Closing date: {job.closingDate}
              </p>
            </div>

            {/* Apply Button */}
            <div className="pt-4">
              <button
                onClick={() => navigate(`/careers/${job.id}/apply`)}
                className="inline-flex items-center gap-2 px-6 py-3 bg-primary text-white font-semibold rounded-lg hover:bg-primary/90 transition-colors"
              >
                Apply for this Position
              </button>
            </div>

            {/* Life at BOCRA */}
            <div className="pt-6 border-t border-border space-y-6">
              <div>
                <h2 className="text-base md:text-lg font-semibold text-foreground">Life At BOCRA</h2>
                <p className="mt-2 text-sm md:text-base leading-relaxed text-muted-foreground">
                  BOCRA is an organisation in which talented people work together, thrive and develop. We are committed to investing and supporting our Colleagues.
                </p>
              </div>

              <div>
                <h2 className="text-base md:text-lg font-semibold text-foreground">What We Can Offer You</h2>
                <p className="mt-2 text-sm md:text-base leading-relaxed text-muted-foreground">
                  We believe that the reward package at BOCRA is based on much more than just salary. Our aim is to empower colleagues to undertake interesting and important work and we are committed to investing and supporting people to achieve their full potential.
                </p>
              </div>

              <div>
                <h2 className="text-base md:text-lg font-semibold text-foreground">Professional Development</h2>
                <p className="mt-2 text-sm md:text-base leading-relaxed text-muted-foreground">
                  At BOCRA, people are our greatest asset, so developing our people is a fundamental part of our ethos. We take professional development very seriously, and encourage colleagues to seek out continuous development to improve their performance in their roles. As such, we provide a variety of opportunities for colleagues to meet those needs, including but not limited to:
                </p>
                <ul className="mt-3 space-y-1.5">
                  {developmentPoints.map((point, i) => (
                    <li key={i} className="flex gap-1.5 text-sm md:text-base leading-relaxed text-muted-foreground">
                      <span className="font-semibold text-primary shrink-0">{String.fromCharCode(97 + i)})</span>
                      <span>{point}</span>
                    </li>
                  ))}
                </ul>
                <p className="mt-3 text-sm md:text-base leading-relaxed text-muted-foreground">
                  We believe that our colleagues are best-placed to choose the benefits that are of most value to them, so we have a flexible benefits package to suit each individual's needs.
                </p>
              </div>

              <div>
                <h2 className="text-base md:text-lg font-semibold text-foreground">Benefits</h2>
                <p className="mt-2 text-sm md:text-base leading-relaxed text-muted-foreground">
                  Our standard benefits include:
                </p>
                <ul className="mt-3 space-y-1.5">
                  {benefits.map((benefit, i) => (
                    <li key={i} className="flex gap-1.5 text-sm md:text-base leading-relaxed text-muted-foreground">
                      <span className="font-semibold text-primary shrink-0">&#8226;</span>
                      <span>{benefit}</span>
                    </li>
                  ))}
                </ul>
                <p className="mt-3 text-sm md:text-base leading-relaxed text-muted-foreground">
                  You can also choose from a wider range of flexible benefits, including the option to purchase additional annual leave, travel insurance, private medical cover for your family and so much more!
                </p>
              </div>
            </div>
          </div>
        </section>
      </main>
      <BottomBar />
    </div>
  );
};

export default JobDetail;
