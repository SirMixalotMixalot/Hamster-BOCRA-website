import { useState, useEffect } from "react";
import { ArrowLeft } from "lucide-react";
import { useNavigate } from "react-router-dom";
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
import { useToast } from "@/hooks/use-toast";
import { getMe, login, logout, signInWithGoogle, signup } from "@/lib/auth";

type Step = "sign-in" | "sign-up" | "admin-login";

const SignInModal = () => {
  const navigate = useNavigate();
  const { toast } = useToast();

  const [open, setOpen] = useState(false);
  const [step, setStep] = useState<Step>("sign-in");
  const [loading, setLoading] = useState(false);

  const [signInEmail, setSignInEmail] = useState("");
  const [signInPassword, setSignInPassword] = useState("");

  const [signUpEmail, setSignUpEmail] = useState("");
  const [signUpPassword, setSignUpPassword] = useState("");
  const [signUpConfirm, setSignUpConfirm] = useState("");

  const [adminEmail, setAdminEmail] = useState("");
  const [adminPassword, setAdminPassword] = useState("");

  useEffect(() => {
    const handler = (e: Event) => {
      const detail = (e as CustomEvent).detail;
      const rawStep = detail?.step;
      // Backward-compatible mapping from old step names
      const stepMap: Record<string, Step> = {
        "role": "sign-in",
        "customer-choice": "sign-in",
        "customer-login": "sign-in",
        "customer-register": "sign-up",
      };
      setOpen(true);
      setStep(stepMap[rawStep] || rawStep || "sign-in");
    };
    window.addEventListener("toggle-signin-modal", handler);
    return () => window.removeEventListener("toggle-signin-modal", handler);
  }, []);

  const handleClose = (isOpen: boolean) => {
    setOpen(isOpen);
    if (!isOpen) setStep("sign-in");
  };

  const goBack = () => {
    setStep("sign-in");
  };

  const handleCustomerLogin = async () => {
    setLoading(true);
    try {
      await login({ email: signInEmail, password: signInPassword });
      const me = await getMe();
      setOpen(false);
      setStep("sign-in");
      navigate(me.profile.role === "admin" ? "/admin/dashboard" : "/customer/dashboard");
    } catch (error) {
      toast({
        title: "Sign in failed",
        description: error instanceof Error ? error.message : "Please check your credentials and try again.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleCustomerRegister = async () => {
    if (signUpPassword !== signUpConfirm) {
      toast({
        title: "Password mismatch",
        description: "Password and confirm password must match.",
        variant: "destructive",
      });
      return;
    }

    setLoading(true);
    try {
      const response = await signup({
        email: signUpEmail,
        password: signUpPassword,
      });

      if (response.session?.access_token) {
        const me = await getMe();
        setOpen(false);
        setStep("sign-in");
        navigate(me.profile.role === "admin" ? "/admin/dashboard" : "/customer/dashboard");
        return;
      }

      toast({
        title: "Account created",
        description: "Registration successful. Please check your email if confirmation is required.",
      });
      setStep("sign-in");
    } catch (error) {
      toast({
        title: "Registration failed",
        description: error instanceof Error ? error.message : "Unable to create account.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleAdminLogin = async () => {
    setLoading(true);
    try {
      await login({ email: adminEmail, password: adminPassword });
      const me = await getMe();

      if (me.profile.role !== "admin") {
        await logout();
        toast({
          title: "Access denied",
          description: "This account does not have admin access.",
          variant: "destructive",
        });
        return;
      }

      setOpen(false);
      setStep("sign-in");
      navigate("/admin/dashboard");
    } catch (error) {
      toast({
        title: "Admin sign in failed",
        description: error instanceof Error ? error.message : "Unable to sign in.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleGoogleOAuth = async () => {
    setLoading(true);
    try {
      await signInWithGoogle();
    } catch (error) {
      setLoading(false);
      toast({
        title: "Google sign-in failed",
        description: error instanceof Error ? error.message : "Unable to start Google sign-in.",
        variant: "destructive",
      });
    }
  };

  const inputClasses = "bg-white/10 border-white/20 text-white placeholder:text-gray-400 rounded-full";
  const socialBtnClasses = "w-full gap-2 bg-white/10 border-white/20 text-white hover:bg-white/20 hover:text-white rounded-full";

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent className="sm:max-w-md bg-gray-900/70 backdrop-blur-xl border border-white/10 shadow-2xl [&>button]:text-white">
        {/* Back button only for admin-login */}
        {step === "admin-login" && (
          <button
            onClick={goBack}
            className="absolute left-4 top-4 rounded-sm text-white opacity-70 hover:opacity-100 transition-opacity"
          >
            <ArrowLeft className="h-4 w-4" />
            <span className="sr-only">Back</span>
          </button>
        )}

        {/* View: Sign In */}
        {step === "sign-in" && (
          <>
            <DialogHeader className="text-center sm:text-center">
              <DialogTitle className="text-xl text-white">Sign In</DialogTitle>
              <DialogDescription className="text-gray-300">
                Log in to your BOCRA account
              </DialogDescription>
            </DialogHeader>
            <form
              onSubmit={async (e) => {
                e.preventDefault();
                await handleCustomerLogin();
              }}
              className="space-y-4 mt-2"
            >
              <div className="space-y-2">
                <Label htmlFor="signin-email" className="text-gray-200">Email</Label>
                <Input
                  id="signin-email"
                  type="email"
                  placeholder="you@example.com"
                  value={signInEmail}
                  onChange={(e) => setSignInEmail(e.target.value)}
                  className={inputClasses}
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="signin-password" className="text-gray-200">Password</Label>
                <Input
                  id="signin-password"
                  type="password"
                  placeholder="Enter your password"
                  value={signInPassword}
                  onChange={(e) => setSignInPassword(e.target.value)}
                  className={inputClasses}
                  required
                />
              </div>
              <div className="flex items-center justify-end">
                <a
                  href="#"
                  className="text-xs text-blue-400 hover:underline"
                >
                  Forgot password?
                </a>
              </div>
              <Button type="submit" className="w-full rounded-full" disabled={loading}>
                {loading ? "Signing In..." : "Sign In"}
              </Button>
            </form>

            {/* Divider */}
            <div className="relative">
              <Separator className="bg-white/20" />
              <span className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 bg-gray-900/70 px-3 text-xs text-gray-400">
                or
              </span>
            </div>

            {/* Social sign-in buttons */}
            <div className="flex gap-3">
              <Button
                variant="outline"
                className={socialBtnClasses}
                onClick={(e) => {
                  e.preventDefault();
                  void handleGoogleOAuth();
                }}
                disabled={loading}
              >
                <svg className="h-5 w-5" viewBox="0 0 24 24">
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
                Google
              </Button>
              <Button
                variant="outline"
                className={socialBtnClasses}
                onClick={(e) => e.preventDefault()}
                disabled={loading}
              >
                <svg className="h-5 w-5" viewBox="0 0 24 24" fill="currentColor">
                  <path d="M17.05 20.28c-.98.95-2.05.88-3.08.4-1.09-.5-2.08-.48-3.24 0-1.44.62-2.2.44-3.06-.4C2.79 15.25 3.51 7.59 9.05 7.31c1.35.07 2.29.74 3.08.8 1.18-.24 2.31-.93 3.57-.84 1.51.12 2.65.72 3.4 1.8-3.12 1.87-2.38 5.98.48 7.13-.57 1.5-1.31 2.99-2.54 4.09zM12.03 7.25c-.15-2.23 1.66-4.07 3.74-4.25.29 2.58-2.34 4.5-3.74 4.25z" />
                </svg>
                Apple
              </Button>
            </div>

            {/* Footer links */}
            <div className="space-y-2 text-center">
              <p className="text-xs text-gray-400">
                Don't have an account?{" "}
                <button
                  type="button"
                  onClick={() => setStep("sign-up")}
                  className="text-blue-400 hover:underline font-medium"
                >
                  Sign up
                </button>
              </p>
              <p className="text-xs text-gray-400">
                <button
                  type="button"
                  onClick={() => setStep("admin-login")}
                  className="text-blue-400 hover:underline font-medium"
                >
                  Admin portal
                </button>
              </p>
            </div>
          </>
        )}

        {/* View: Sign Up */}
        {step === "sign-up" && (
          <>
            <DialogHeader className="text-center sm:text-center">
              <DialogTitle className="text-xl text-white">Create Account</DialogTitle>
              <DialogDescription className="text-gray-300">
                Register for a BOCRA account
              </DialogDescription>
            </DialogHeader>
            <form
              onSubmit={async (e) => {
                e.preventDefault();
                await handleCustomerRegister();
              }}
              className="space-y-4 mt-2"
            >
              <div className="space-y-2">
                <Label htmlFor="reg-email" className="text-gray-200">Email</Label>
                <Input
                  id="reg-email"
                  type="email"
                  placeholder="you@example.com"
                  value={signUpEmail}
                  onChange={(e) => setSignUpEmail(e.target.value)}
                  className={inputClasses}
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="reg-password" className="text-gray-200">Password</Label>
                <Input
                  id="reg-password"
                  type="password"
                  placeholder="Create a password"
                  value={signUpPassword}
                  onChange={(e) => setSignUpPassword(e.target.value)}
                  className={inputClasses}
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="reg-confirm" className="text-gray-200">Confirm Password</Label>
                <Input
                  id="reg-confirm"
                  type="password"
                  placeholder="Confirm your password"
                  value={signUpConfirm}
                  onChange={(e) => setSignUpConfirm(e.target.value)}
                  className={inputClasses}
                  required
                />
              </div>
              <Button type="submit" className="w-full rounded-full" disabled={loading}>
                {loading ? "Creating Account..." : "Create Account"}
              </Button>
            </form>

            {/* Divider */}
            <div className="relative">
              <Separator className="bg-white/20" />
              <span className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 bg-gray-900/70 px-3 text-xs text-gray-400">
                or
              </span>
            </div>

            {/* Social sign-up buttons */}
            <div className="flex gap-3">
              <Button
                variant="outline"
                className={socialBtnClasses}
                onClick={(e) => {
                  e.preventDefault();
                  void handleGoogleOAuth();
                }}
                disabled={loading}
              >
                <svg className="h-5 w-5" viewBox="0 0 24 24">
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
                Google
              </Button>
              <Button
                variant="outline"
                className={socialBtnClasses}
                onClick={(e) => e.preventDefault()}
                disabled={loading}
              >
                <svg className="h-5 w-5" viewBox="0 0 24 24" fill="currentColor">
                  <path d="M17.05 20.28c-.98.95-2.05.88-3.08.4-1.09-.5-2.08-.48-3.24 0-1.44.62-2.2.44-3.06-.4C2.79 15.25 3.51 7.59 9.05 7.31c1.35.07 2.29.74 3.08.8 1.18-.24 2.31-.93 3.57-.84 1.51.12 2.65.72 3.4 1.8-3.12 1.87-2.38 5.98.48 7.13-.57 1.5-1.31 2.99-2.54 4.09zM12.03 7.25c-.15-2.23 1.66-4.07 3.74-4.25.29 2.58-2.34 4.5-3.74 4.25z" />
                </svg>
                Apple
              </Button>
            </div>

            <p className="text-center text-xs text-gray-400">
              Already have an account?{" "}
              <button
                type="button"
                onClick={() => setStep("sign-in")}
                className="text-blue-400 hover:underline font-medium"
              >
                Sign in
              </button>
            </p>
          </>
        )}

        {/* View: Admin Login */}
        {step === "admin-login" && (
          <>
            <DialogHeader className="text-center sm:text-center pt-2">
              <DialogTitle className="text-xl text-white">Admin Sign In</DialogTitle>
              <DialogDescription className="text-gray-300">
                Access the BOCRA staff portal
              </DialogDescription>
            </DialogHeader>
            <form
              onSubmit={async (e) => {
                e.preventDefault();
                await handleAdminLogin();
              }}
              className="space-y-4 mt-2"
            >
              <div className="space-y-2">
                <Label htmlFor="admin-email" className="text-gray-200">Email</Label>
                <Input
                  id="admin-email"
                  type="email"
                  placeholder="admin@bocra.org.bw"
                  value={adminEmail}
                  onChange={(e) => setAdminEmail(e.target.value)}
                  className={inputClasses}
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="admin-password" className="text-gray-200">Password</Label>
                <Input
                  id="admin-password"
                  type="password"
                  placeholder="Enter your password"
                  value={adminPassword}
                  onChange={(e) => setAdminPassword(e.target.value)}
                  className={inputClasses}
                  required
                />
              </div>
              <div className="flex items-center justify-end">
                <a
                  href="#"
                  className="text-xs text-blue-400 hover:underline"
                >
                  Forgot password?
                </a>
              </div>
              <Button type="submit" className="w-full rounded-full bg-bocra-navy hover:bg-bocra-navy/90" disabled={loading}>
                {loading ? "Signing In..." : "Sign In"}
              </Button>
            </form>
          </>
        )}
      </DialogContent>
    </Dialog>
  );
};

export default SignInModal;
