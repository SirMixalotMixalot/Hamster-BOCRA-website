import { Phone, Mail, MapPin, Facebook, Twitter, Linkedin, Instagram, Youtube } from "lucide-react";

const BottomBar = () => {
  return (
    <div className="bg-bocra-navy text-white/80 shrink-0">
      <div className="container flex flex-col md:flex-row items-center justify-between py-2 text-xs font-body gap-2 md:gap-4">
        {/* Contact */}
        <div className="flex items-center gap-3 flex-wrap justify-center">
          <a href="tel:+2673957755" className="flex items-center gap-1 hover:text-bocra-gold transition-colors">
            <Phone className="h-3 w-3" />
            <span>T: +267 395 7755</span>
          </a>
          <span className="text-white/30">|</span>
          <span className="flex items-center gap-1">
            <Phone className="h-3 w-3" />
            F: +267 395 7976
          </span>
          <span className="text-white/30">|</span>
          <a href="mailto:info@bocra.org.bw" className="flex items-center gap-1 hover:text-bocra-gold transition-colors">
            <Mail className="h-3 w-3" />
            <span>info@bocra.org.bw</span>
          </a>
          <span className="hidden md:inline text-white/30">|</span>
          <span className="hidden md:flex items-center gap-1">
            <MapPin className="h-3 w-3" />
            Plot 50671, Independence Avenue, Gaborone, Botswana
          </span>
        </div>

        {/* Social Media */}
        <div className="flex items-center gap-3 mr-4">
          <a href="#" aria-label="Facebook" className="hover:text-bocra-gold transition-colors">
            <Facebook className="h-3.5 w-3.5" />
          </a>
          <a href="#" aria-label="X (Twitter)" className="hover:text-bocra-gold transition-colors">
            <Twitter className="h-3.5 w-3.5" />
          </a>
          <a href="#" aria-label="LinkedIn" className="hover:text-bocra-gold transition-colors">
            <Linkedin className="h-3.5 w-3.5" />
          </a>
          <a href="#" aria-label="Instagram" className="hover:text-bocra-gold transition-colors">
            <Instagram className="h-3.5 w-3.5" />
          </a>
          <a href="#" aria-label="YouTube" className="hover:text-bocra-gold transition-colors">
            <Youtube className="h-3.5 w-3.5" />
          </a>
        </div>

        {/* Copyright */}
        <span className="text-[10px] text-white/50 whitespace-nowrap">
          &copy; 2026 BOCRA. All rights reserved. Designed by HAMSTER
        </span>
      </div>
    </div>
  );
};

export default BottomBar;
