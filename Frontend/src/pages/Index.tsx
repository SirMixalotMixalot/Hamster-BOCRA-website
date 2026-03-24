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

const Index = () => {
  return (
    <div className="h-screen flex flex-col overflow-hidden bg-background">
      <Header />
      <main className="flex-1 relative">
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
    </div>
  );
};

export default Index;
