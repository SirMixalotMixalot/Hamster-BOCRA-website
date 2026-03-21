import { useState, useEffect } from "react";
import { Shield, User, ArrowLeft, Mail } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Separator } from "@/components/ui/separator";

type Step =
  | "role"
  | "admin-login"
  | "customer-choice"
  | "customer-login"
  | "customer-register";

const SignInModal = () => {
  const [open, setOpen] = useState(false);
  const [step, setStep] = useState<Step>("role");

  useEffect(() => {
    const handler = (e: Event) => {
      const detail = (e as CustomEvent).detail;
      setOpen(true);
      setStep(detail?.step || "role");
    };
    window.addEventListener("toggle-signin-modal", handler);
    return () => window.removeEventListener("toggle-signin-modal", handler);
  }, []);

  const handleClose = (isOpen: boolean) => {
    setOpen(isOpen);
    if (!isOpen) setStep("role");
  };

  const goBack = () => {
    switch (step) {
      case "admin-login":
        setStep("role");
        break;
      case "customer-choice":
        setStep("role");
        break;
      case "customer-login":
        setStep("customer-choice");
        break;
      case "customer-register":
        setStep("customer-choice");
        break;
      default:
        break;
    }
  };

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent className="sm:max-w-md">
        {/* Back button for non-root steps */}
        {step !== "role" && (
          <button
            onClick={goBack}
            className="absolute left-4 top-4 rounded-sm opacity-70 hover:opacity-100 transition-opacity"
          >
            <ArrowLeft className="h-4 w-4" />
            <span className="sr-only">Back</span>
          </button>
        )}

        {/* Step: Role Selection */}
        {step === "role" && (
          <>
            <DialogHeader className="text-center sm:text-center">
              <DialogTitle className="text-xl">Welcome to BOCRA</DialogTitle>
              <DialogDescription>
                Select how you would like to sign in
              </DialogDescription>
            </DialogHeader>
            <div className="grid grid-cols-2 gap-4 mt-2">
              <button
                onClick={() => setStep("admin-login")}
                className="flex flex-col items-center gap-3 p-6 rounded-xl border-2 border-border hover:border-primary hover:bg-primary/5 transition-all group"
              >
                <div className="w-14 h-14 rounded-full bg-bocra-navy/10 flex items-center justify-center group-hover:bg-bocra-navy/20 transition-colors">
                  <Shield className="h-7 w-7 text-bocra-navy" />
                </div>
                <div>
                  <div className="font-semibold text-foreground">Admin</div>
                  <div className="text-xs text-muted-foreground mt-0.5">
                    Staff portal
                  </div>
                </div>
              </button>
              <button
                onClick={() => setStep("customer-choice")}
                className="flex flex-col items-center gap-3 p-6 rounded-xl border-2 border-border hover:border-primary hover:bg-primary/5 transition-all group"
              >
                <div className="w-14 h-14 rounded-full bg-bocra-gold/10 flex items-center justify-center group-hover:bg-bocra-gold/20 transition-colors">
                  <User className="h-7 w-7 text-bocra-gold" />
                </div>
                <div>
                  <div className="font-semibold text-foreground">Customer</div>
                  <div className="text-xs text-muted-foreground mt-0.5">
                    Public access
                  </div>
                </div>
              </button>
            </div>
          </>
        )}

        {/* Step: Admin Login */}
        {step === "admin-login" && (
          <>
            <DialogHeader className="text-center sm:text-center pt-2">
              <DialogTitle className="text-xl">Admin Sign In</DialogTitle>
              <DialogDescription>
                Access the BOCRA staff portal
              </DialogDescription>
            </DialogHeader>
            <form
              onSubmit={(e) => e.preventDefault()}
              className="space-y-4 mt-2"
            >
              <div className="space-y-2">
                <Label htmlFor="admin-email">Email</Label>
                <Input
                  id="admin-email"
                  type="email"
                  placeholder="admin@bocra.org.bw"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="admin-password">Password</Label>
                <Input
                  id="admin-password"
                  type="password"
                  placeholder="Enter your password"
                />
              </div>
              <div className="flex items-center justify-end">
                <a
                  href="#"
                  className="text-xs text-primary hover:underline"
                >
                  Forgot password?
                </a>
              </div>
              <Button className="w-full bg-bocra-navy hover:bg-bocra-navy/90">
                Sign In
              </Button>
            </form>
          </>
        )}

        {/* Step: Customer Choice */}
        {step === "customer-choice" && (
          <>
            <DialogHeader className="text-center sm:text-center pt-2">
              <DialogTitle className="text-xl">Customer Portal</DialogTitle>
              <DialogDescription>
                Sign in to your account or create a new one
              </DialogDescription>
            </DialogHeader>
            <div className="space-y-3 mt-2">
              <button
                onClick={() => setStep("customer-login")}
                className="w-full flex items-center gap-4 p-4 rounded-xl border-2 border-border hover:border-primary hover:bg-primary/5 transition-all text-left group"
              >
                <div className="w-12 h-12 rounded-lg bg-primary/10 flex items-center justify-center shrink-0 group-hover:bg-primary/15 transition-colors">
                  <User className="h-6 w-6 text-primary" />
                </div>
                <div>
                  <div className="font-semibold text-foreground">Sign In</div>
                  <div className="text-xs text-muted-foreground mt-0.5">
                    Log in with your existing account
                  </div>
                </div>
              </button>
              <button
                onClick={() => setStep("customer-register")}
                className="w-full flex items-center gap-4 p-4 rounded-xl border-2 border-border hover:border-primary hover:bg-primary/5 transition-all text-left group"
              >
                <div className="w-12 h-12 rounded-lg bg-bocra-gold/10 flex items-center justify-center shrink-0 group-hover:bg-bocra-gold/15 transition-colors">
                  <Mail className="h-6 w-6 text-bocra-gold" />
                </div>
                <div>
                  <div className="font-semibold text-foreground">
                    Create Account
                  </div>
                  <div className="text-xs text-muted-foreground mt-0.5">
                    Register a new BOCRA account
                  </div>
                </div>
              </button>
            </div>
          </>
        )}

        {/* Step: Customer Login */}
        {step === "customer-login" && (
          <>
            <DialogHeader className="text-center sm:text-center pt-2">
              <DialogTitle className="text-xl">Customer Sign In</DialogTitle>
              <DialogDescription>
                Log in to your BOCRA account
              </DialogDescription>
            </DialogHeader>
            <form
              onSubmit={(e) => e.preventDefault()}
              className="space-y-4 mt-2"
            >
              <div className="space-y-2">
                <Label htmlFor="customer-email">Email</Label>
                <Input
                  id="customer-email"
                  type="email"
                  placeholder="you@example.com"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="customer-password">Password</Label>
                <Input
                  id="customer-password"
                  type="password"
                  placeholder="Enter your password"
                />
              </div>
              <div className="flex items-center justify-end">
                <a
                  href="#"
                  className="text-xs text-primary hover:underline"
                >
                  Forgot password?
                </a>
              </div>
              <Button className="w-full">Sign In</Button>
              <p className="text-center text-xs text-muted-foreground">
                Don't have an account?{" "}
                <button
                  type="button"
                  onClick={() => setStep("customer-register")}
                  className="text-primary hover:underline font-medium"
                >
                  Create one
                </button>
              </p>
            </form>
          </>
        )}

        {/* Step: Customer Register */}
        {step === "customer-register" && (
          <>
            <DialogHeader className="text-center sm:text-center pt-2">
              <DialogTitle className="text-xl">Create Account</DialogTitle>
              <DialogDescription>
                Register for a BOCRA customer account
              </DialogDescription>
            </DialogHeader>
            <div className="space-y-4 mt-2">
              {/* Google sign-up */}
              <Button
                variant="outline"
                className="w-full gap-2"
                onClick={(e) => e.preventDefault()}
              >
                <svg className="h-4 w-4" viewBox="0 0 24 24">
                  <path
                    d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92a5.06 5.06 0 0 1-2.2 3.32v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.1z"
                    fill="#4285F4"
                  />
                  <path
                    d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                    fill="#34A853"
                  />
                  <path
                    d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
                    fill="#FBBC05"
                  />
                  <path
                    d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
                    fill="#EA4335"
                  />
                </svg>
                Continue with Google
              </Button>

              {/* Divider */}
              <div className="relative">
                <Separator />
                <span className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 bg-background px-3 text-xs text-muted-foreground">
                  or
                </span>
              </div>

              {/* Registration form */}
              <form
                onSubmit={(e) => e.preventDefault()}
                className="space-y-3"
              >
                <div className="space-y-2">
                  <Label htmlFor="reg-name">Full Name</Label>
                  <Input
                    id="reg-name"
                    type="text"
                    placeholder="Enter your full name"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="reg-email">Email</Label>
                  <Input
                    id="reg-email"
                    type="email"
                    placeholder="you@example.com"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="reg-password">Password</Label>
                  <Input
                    id="reg-password"
                    type="password"
                    placeholder="Create a password"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="reg-confirm">Confirm Password</Label>
                  <Input
                    id="reg-confirm"
                    type="password"
                    placeholder="Confirm your password"
                  />
                </div>
                <Button className="w-full">Create Account</Button>
              </form>

              <p className="text-center text-xs text-muted-foreground">
                Already have an account?{" "}
                <button
                  type="button"
                  onClick={() => setStep("customer-login")}
                  className="text-primary hover:underline font-medium"
                >
                  Sign in
                </button>
              </p>
            </div>
          </>
        )}
      </DialogContent>
    </Dialog>
  );
};

export default SignInModal;
