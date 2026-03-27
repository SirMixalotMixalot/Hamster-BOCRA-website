import { Phone, Mail, MapPin, Facebook, Linkedin, Youtube } from "lucide-react";
import { useLanguage } from "@/i18n";

const BottomBar = () => {
  const { t } = useLanguage();
  return (
    <div className="bg-bocra-navy text-white/80 shrink-0">
      <div className="container flex flex-col md:flex-row items-center justify-between py-4 md:py-5 text-sm font-body gap-3 md:gap-5">
        {/* Contact */}
        <div className="flex items-center gap-3 flex-wrap justify-center">
          <a href="tel:+2673957755" className="flex items-center gap-1 hover:text-bocra-gold transition-colors">
            <Phone className="h-4 w-4" />
            <span>T: +267 395 7755</span>
          </a>
          <span className="text-white/30">|</span>
          <span className="flex items-center gap-1">
            <Phone className="h-4 w-4" />
            F: +267 395 7976
          </span>
          <span className="text-white/30">|</span>
          <a href="mailto:info@bocra.org.bw" className="flex items-center gap-1 hover:text-bocra-gold transition-colors">
            <Mail className="h-4 w-4" />
            <span>info@bocra.org.bw</span>
          </a>
          <span className="hidden md:inline text-white/30">|</span>
          <a href="https://maps.app.goo.gl/XZqHwegSw9n6mNzY7" target="_blank" rel="noopener noreferrer" className="hidden md:flex items-center gap-1 hover:text-bocra-gold transition-colors">
            <MapPin className="h-4 w-4" />
            Plot 50671, Independence Avenue, Gaborone, Botswana
          </a>
        </div>

        {/* Social Media */}
        <div className="flex items-center gap-4 mr-4">
          <a href="https://www.facebook.com/BTAbw" target="_blank" rel="noopener noreferrer" aria-label="Facebook" className="hover:text-bocra-gold transition-colors">
            <Facebook className="h-4.5 w-4.5" />
          </a>
          <a href="https://www.linkedin.com/company/bta_3/" target="_blank" rel="noopener noreferrer" aria-label="LinkedIn" className="hover:text-bocra-gold transition-colors">
            <Linkedin className="h-4.5 w-4.5" />
          </a>
          <a href="https://www.youtube.com/@bocra7629" target="_blank" rel="noopener noreferrer" aria-label="YouTube" className="hover:text-bocra-gold transition-colors">
            <Youtube className="h-4.5 w-4.5" />
          </a>
        </div>

        {/* Copyright */}
        <span className="text-xs text-white/50 whitespace-nowrap">
          {t("footer.copyright")}
        </span>
      </div>
    </div>
  );
};

export default BottomBar;
