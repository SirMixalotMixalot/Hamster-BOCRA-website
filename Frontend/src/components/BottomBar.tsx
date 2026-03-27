import { Phone, Mail, MapPin, Facebook, Linkedin, Youtube, Twitter } from "lucide-react";
import { useLanguage } from "@/i18n";
import bocraLogo from "@/assets/bocra-logo.png";

const BottomBar = () => {
  const { t } = useLanguage();

  return (
    <footer className="bg-bocra-navy text-white/80 shrink-0 font-body">
      {/* Main footer content */}
      <div className="container py-12 px-6 md:px-8">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-10 lg:gap-12">
          {/* Column 1 – Logo & Description */}
          <div className="space-y-5">
            <a
              href="#"
              onClick={(e) => {
                e.preventDefault();
                window.scrollTo({ top: 0, behavior: "smooth" });
              }}
              aria-label="Back to top"
            >
              <img
                src={bocraLogo}
                alt="BOCRA"
                className="h-20 w-auto object-contain brightness-200 cursor-pointer"
              />
            </a>
            <p className="text-sm leading-relaxed text-white/70">
              {t("footer.description")}
            </p>
            {/* Social Media Icons */}
            <div className="flex items-center gap-3 pt-2">
              <a
                href="https://www.facebook.com/BTAbw"
                target="_blank"
                rel="noopener noreferrer"
                aria-label="Facebook"
                className="w-9 h-9 rounded-full border border-white/30 flex items-center justify-center hover:bg-white/10 hover:border-bocra-gold hover:text-bocra-gold transition-colors"
              >
                <Facebook className="h-4 w-4" />
              </a>
              <a
                href="https://www.linkedin.com/company/bta_3/"
                target="_blank"
                rel="noopener noreferrer"
                aria-label="LinkedIn"
                className="w-9 h-9 rounded-full border border-white/30 flex items-center justify-center hover:bg-white/10 hover:border-bocra-gold hover:text-bocra-gold transition-colors"
              >
                <Linkedin className="h-4 w-4" />
              </a>
              <a
                href="https://www.youtube.com/@bocra7629"
                target="_blank"
                rel="noopener noreferrer"
                aria-label="YouTube"
                className="w-9 h-9 rounded-full border border-white/30 flex items-center justify-center hover:bg-white/10 hover:border-bocra-gold hover:text-bocra-gold transition-colors"
              >
                <Youtube className="h-4 w-4" />
              </a>
              <a
                href="#"
                aria-label="Twitter"
                className="w-9 h-9 rounded-full border border-white/30 flex items-center justify-center hover:bg-white/10 hover:border-bocra-gold hover:text-bocra-gold transition-colors"
              >
                <Twitter className="h-4 w-4" />
              </a>
            </div>
          </div>

          {/* Column 2 – Quick Links */}
          <div>
            <h3 className="text-white text-lg font-semibold mb-5">
              {t("footer.quickLinks")}
            </h3>
            <ul className="space-y-3">
              <li>
                <a href="/" className="text-sm text-white/70 hover:text-bocra-gold transition-colors">
                  {t("footer.home")}
                </a>
              </li>
              <li>
                <a href="/about/who-we-are" className="text-sm text-white/70 hover:text-bocra-gold transition-colors">
                  {t("footer.aboutUs")}
                </a>
              </li>
              <li>
                <a href="/resources/news" className="text-sm text-white/70 hover:text-bocra-gold transition-colors">
                  {t("footer.news")}
                </a>
              </li>
            </ul>
          </div>

          {/* Column 3 – Services */}
          <div>
            <h3 className="text-white text-lg font-semibold mb-5">
              {t("footer.servicesTitle")}
            </h3>
            <ul className="space-y-3">
              <li>
                <a href="/licensing/how-it-works" className="text-sm text-white/70 hover:text-bocra-gold transition-colors">
                  {t("footer.licensing")}
                </a>
              </li>
              <li>
                <a href="/resources/publications" className="text-sm text-white/70 hover:text-bocra-gold transition-colors">
                  {t("footer.publications")}
                </a>
              </li>
              <li>
                <a href="/faqs" className="text-sm text-white/70 hover:text-bocra-gold transition-colors">
                  {t("footer.faqs")}
                </a>
              </li>
              <li>
                <a href="/careers" className="text-sm text-white/70 hover:text-bocra-gold transition-colors">
                  {t("footer.careers")}
                </a>
              </li>
            </ul>
          </div>

          {/* Column 4 – Contact */}
          <div>
            <h3 className="text-white text-lg font-semibold mb-5">
              {t("footer.contact")}
            </h3>
            <ul className="space-y-4">
              <li>
                <a
                  href="https://maps.app.goo.gl/XZqHwegSw9n6mNzY7"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-start gap-3 text-sm text-white/70 hover:text-bocra-gold transition-colors"
                >
                  <MapPin className="h-5 w-5 text-bocra-gold shrink-0 mt-0.5" />
                  <span>
                    Plot 50671 Independence Avenue
                    <br />
                    Gaborone, Botswana
                  </span>
                </a>
              </li>
              <li>
                <a
                  href="tel:+2673957755"
                  className="flex items-center gap-3 text-sm text-white/70 hover:text-bocra-gold transition-colors"
                >
                  <Phone className="h-5 w-5 text-bocra-gold shrink-0" />
                  <span>{t("footer.phone")}</span>
                </a>
              </li>
              <li>
                <a
                  href="mailto:info@bocra.org.bw"
                  className="flex items-center gap-3 text-sm text-white/70 hover:text-bocra-gold transition-colors"
                >
                  <Mail className="h-5 w-5 text-bocra-gold shrink-0" />
                  <span>{t("footer.email")}</span>
                </a>
              </li>
            </ul>
          </div>
        </div>
      </div>

      {/* Bottom bar with copyright */}
      <div className="border-t border-white/15">
        <div className="container flex flex-col sm:flex-row items-center justify-between py-4 px-6 md:px-8 gap-2">
          <span className="text-xs text-white/50">
            {t("footer.copyright")}
          </span>
          <span className="text-xs text-white/50 text-center sm:text-right">
            {t("footer.tagline")}
          </span>
        </div>
      </div>
    </footer>
  );
};

export default BottomBar;
