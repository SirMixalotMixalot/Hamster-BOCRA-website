import { useEffect, useState } from "react";
import { Phone, Mail, Sparkles } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";

const ContactModal = () => {
  const [open, setOpen] = useState(false);

  useEffect(() => {
    const handler = () => setOpen(true);
    window.addEventListener("toggle-contact-modal", handler);
    return () => window.removeEventListener("toggle-contact-modal", handler);
  }, []);

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogContent className="sm:max-w-sm">
        <DialogHeader className="text-center sm:text-center">
          <DialogTitle className="text-xl">Contact Us</DialogTitle>
          <DialogDescription>
            Get in touch with BOCRA
          </DialogDescription>
        </DialogHeader>
        <div className="space-y-3 mt-2">
          <a
            href="tel:+2673957755"
            className="flex items-center gap-4 p-4 rounded-xl border-2 border-border hover:border-primary hover:bg-primary/5 transition-all group"
          >
            <div className="w-12 h-12 rounded-lg bg-bocra-navy/10 flex items-center justify-center shrink-0 group-hover:bg-bocra-navy/15 transition-colors">
              <Phone className="h-6 w-6 text-bocra-navy" />
            </div>
            <div>
              <div className="font-semibold text-foreground">Call Us</div>
              <div className="text-sm text-muted-foreground">+267 395 7755</div>
            </div>
          </a>
          <a
            href="mailto:info@bocra.org.bw"
            className="flex items-center gap-4 p-4 rounded-xl border-2 border-border hover:border-primary hover:bg-primary/5 transition-all group"
          >
            <div className="w-12 h-12 rounded-lg bg-bocra-blue/10 flex items-center justify-center shrink-0 group-hover:bg-bocra-blue/15 transition-colors">
              <Mail className="h-6 w-6 text-bocra-blue" />
            </div>
            <div>
              <div className="font-semibold text-foreground">Email Us</div>
              <div className="text-sm text-muted-foreground">info@bocra.org.bw</div>
            </div>
          </a>
          <button
            onClick={() => {
              setOpen(false);
              window.dispatchEvent(new CustomEvent("toggle-ai-chatbot"));
            }}
            className="w-full flex items-center gap-4 p-4 rounded-xl border-2 border-border hover:border-bocra-gold hover:bg-bocra-gold/5 transition-all group"
          >
            <div className="w-12 h-12 rounded-lg bg-bocra-gold/10 flex items-center justify-center shrink-0 group-hover:bg-bocra-gold/15 transition-colors">
              <Sparkles className="h-6 w-6 text-bocra-gold" />
            </div>
            <div className="text-left">
              <div className="font-semibold text-foreground">AI Assistant</div>
              <div className="text-sm text-muted-foreground">Chat with our virtual assistant</div>
            </div>
          </button>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default ContactModal;
