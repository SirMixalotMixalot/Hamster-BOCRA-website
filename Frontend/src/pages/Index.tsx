import Header from "@/components/Header";
import HeroSection from "@/components/HeroSection";
import AIChatbot from "@/components/AIChatbot";
import BottomBar from "@/components/BottomBar";
import SignInModal from "@/components/SignInModal";
import ContactModal from "@/components/ContactModal";
import ComplaintModal from "@/components/ComplaintModal";
import VerifyLicenceModal from "@/components/VerifyLicenceModal";
import TelecomStatsModal from "@/components/TelecomStatsModal";
import TypeApprovalModal from "@/components/TypeApprovalModal";
import TrackComplaintModal from "@/components/TrackComplaintModal";

const Index = () => {
  return (
    <div className="min-h-screen flex flex-col bg-background">
      <Header />
      <main className="min-w-0 flex-1">
        <HeroSection />
      </main>
      <BottomBar />
      <AIChatbot />
      <SignInModal />
      <ContactModal />
      <ComplaintModal />
      <VerifyLicenceModal />
      <TelecomStatsModal />
      <TypeApprovalModal />
      <TrackComplaintModal />
    </div>
  );
};

export default Index;
