import { MapPin, Phone, Mail, ExternalLink, Globe2 } from "lucide-react";
import bocraLogo from "@/assets/bocra-logo.png";

const quickLinks = [
  { label: "About BOCRA", href: "#about" },
  { label: "Apply for Licence", href: "#licence" },
  { label: "File a Complaint", href: "#complaint" },
  { label: "Type Approval", href: "#" },
  { label: "Telecom Statistics", href: "#statistics" },
  { label: "Documents & Legislation", href: "#" },
];

const externalPortals = [
  { label: "Licensing Portal", href: "#" },
  { label: ".bw Domain Registration", href: "#" },
  { label: "QoS Monitoring", href: "#" },
  { label: "Type Approval System", href: "#" },
  { label: "Spectrum Management", href: "#" },
];

const Footer = () => {
  return (
    <footer className="bg-foreground text-primary-foreground" id="footer">
      <div className="container py-12 md:py-16">
        <div className="grid md:grid-cols-4 gap-10">
          {/* Brand */}
          <div className="md:col-span-1">
            <div className="flex items-center gap-2 mb-4">
              <img src={bocraLogo} alt="BOCRA" className="h-10 w-10 object-contain brightness-200" />
              <div>
                <div className="font-heading font-bold text-sm">BOCRA</div>
                <div className="text-[10px] text-primary-foreground/60">Communications Regulatory Authority</div>
              </div>
            </div>
            <p className="text-sm text-primary-foreground/70 leading-relaxed">
              Regulating Botswana's communications sector to promote competition, protect consumers, and ensure universal access.
            </p>
          </div>

          {/* Quick Links */}
          <div>
            <h4 className="font-heading font-semibold text-sm mb-4">Quick Links</h4>
            <ul className="space-y-2">
              {quickLinks.map((link) => (
                <li key={link.label}>
                  <a href={link.href} className="text-sm text-primary-foreground/70 hover:text-accent transition-colors">{link.label}</a>
                </li>
              ))}
            </ul>
          </div>

          {/* External Portals */}
          <div>
            <h4 className="font-heading font-semibold text-sm mb-4">Tools & Portals</h4>
            <ul className="space-y-2">
              {externalPortals.map((portal) => (
                <li key={portal.label}>
                  <a href={portal.href} target="_blank" rel="noopener noreferrer" className="flex items-center gap-1 text-sm text-primary-foreground/70 hover:text-accent transition-colors">
                    {portal.label}
                    <ExternalLink className="h-3 w-3" />
                  </a>
                </li>
              ))}
            </ul>
          </div>

          {/* Contact */}
          <div>
            <h4 className="font-heading font-semibold text-sm mb-4">Contact Us</h4>
            <div className="space-y-3">
              <a href="#" className="flex items-start gap-2 text-sm text-primary-foreground/70 hover:text-accent transition-colors">
                <MapPin className="h-4 w-4 mt-0.5 shrink-0" />
                <span>Plot 206/207, Independence Avenue, Gaborone, Botswana</span>
              </a>
              <a href="tel:+2673957755" className="flex items-center gap-2 text-sm text-primary-foreground/70 hover:text-accent transition-colors">
                <Phone className="h-4 w-4 shrink-0" />
                <span>+267 395 7755</span>
              </a>
              <a href="mailto:info@bocra.org.bw" className="flex items-center gap-2 text-sm text-primary-foreground/70 hover:text-accent transition-colors">
                <Mail className="h-4 w-4 shrink-0" />
                <span>info@bocra.org.bw</span>
              </a>
              <a href="https://www.bocra.org.bw" target="_blank" rel="noopener noreferrer" className="flex items-center gap-2 text-sm text-primary-foreground/70 hover:text-accent transition-colors">
                <Globe2 className="h-4 w-4 shrink-0" />
                <span>www.bocra.org.bw</span>
              </a>
            </div>
          </div>
        </div>

        {/* Bottom */}
        <div className="mt-10 pt-6 border-t border-primary-foreground/10 flex flex-col md:flex-row items-center justify-between gap-4">
          <p className="text-xs text-primary-foreground/50">
            © {new Date().getFullYear()} Botswana Communications Regulatory Authority. All rights reserved.
          </p>
          <div className="flex items-center gap-4 text-xs text-primary-foreground/50">
            <a href="#" className="hover:text-primary-foreground/80 transition-colors">Privacy Policy</a>
            <a href="#" className="hover:text-primary-foreground/80 transition-colors">Terms of Use</a>
            <a href="#" className="hover:text-primary-foreground/80 transition-colors">Accessibility</a>
            <a href="#" className="hover:text-primary-foreground/80 transition-colors">Sitemap</a>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
