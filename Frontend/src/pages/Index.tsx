import Header from "@/components/Header";
import HeroSection from "@/components/HeroSection";
import AIChatbot from "@/components/AIChatbot";
import BottomBar from "@/components/BottomBar";
import ContactModal from "@/components/ContactModal";
import TelecomStatsModal from "@/components/TelecomStatsModal";
import TypeApprovalModal from "@/components/TypeApprovalModal";

const Index = () => {
  return (
    <div className="min-h-screen flex flex-col bg-background">
      <Header />
      <main className="min-w-0 flex-1">
        <HeroSection />
      </main>
      <BottomBar />
      <AIChatbot />
      <ContactModal />
      <TelecomStatsModal />
      <TypeApprovalModal />
    </div>
  );
};

export default Index;
