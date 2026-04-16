import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useToast } from "@/hooks/use-toast";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useMutation } from "@tanstack/react-query";
import { ArrowLeft, Brain, Zap, Shield, FileCheck, Mail } from "lucide-react";
import logo from "./assets/Small 1.png";

const EduValidateLogo = () => (
  <div className="flex justify-center mb-6">
    <img src={logo} alt="EduValidate Logo" className="h-12 w-auto object-contain" />
  </div>
);

// Utility for email validation
const validateEmail = (email) => {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
};

export default function ForgotPassword() {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [email, setEmail] = useState("");
  const [error, setError] = useState("");
  const [isSubmitted, setIsSubmitted] = useState(false);

  const forgotPasswordMutation = useMutation({
    mutationFn: async (email) => {
      const response = await fetch(`${import.meta.env.VITE_API_BASE_URL}/forgot-password`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/x-www-form-urlencoded',
        },
        body: new URLSearchParams({ email_id: email }),
      });
      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.message || 'Failed to send reset link');
      }
      return response.json();
    },
    onSuccess: () => {
      toast({
        title: "Success",
        description: "A password reset link has been sent to your email.",
      });
      setIsSubmitted(true);
      // Removed automatic navigation to show the success message
    },
    onError: (err) => {
      setError(err.message || "Failed to send reset link. Please try again.");
    },
  });

  const handleEmailChange = (val) => {
    setEmail(val);
    if (error) setError("");
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!email.trim()) {
      setError("Email address is required.");
      return;
    }
    if (!validateEmail(email)) {
      setError("Please enter a valid email address.");
      return;
    }
    setError("");
    forgotPasswordMutation.mutate(email);
  };

  return (
    <div className="min-h-screen relative overflow-hidden bg-[#021B30]">
      <style>{`
        @keyframes float {
          0%, 100% { transform: translateY(0px) rotate(0deg); }
          50% { transform: translateY(-20px) rotate(180deg); }
        }
        @keyframes pulse-glow {
          0%, 100% { opacity: 0.4; transform: scale(1); }
          50% { opacity: 0.8; transform: scale(1.1); }
        }
        @keyframes slide-diagonal {
          0% { transform: translateX(-100px) translateY(-100px); opacity: 0; }
          50% { opacity: 0.6; }
          100% { transform: translateX(100vw) translateY(100vh); opacity: 0; }
        }
        .auth-bg-overlay {
          position: absolute;
          top: 0; left: 0; right: 0; bottom: 0;
          background: 
            radial-gradient(circle at 20% 80%, rgba(3, 46, 71, 0.4) 0%, transparent 50%),
            radial-gradient(circle at 80% 20%, rgba(255, 255, 255, 0.05) 0%, transparent 50%),
            radial-gradient(circle at 40% 40%, rgba(3, 46, 71, 0.3) 0%, transparent 50%);
          animation: pulse-glow 4s ease-in-out infinite;
        }
        .auth-floating-elements {
          position: absolute;
          width: 100%;
          height: 100%;
          overflow: hidden;
          pointer-events: none;
        }
        .auth-diagonal-line {
          position: absolute;
          width: 2px;
          height: 100px;
          background: linear-gradient(to bottom, transparent, rgba(255,255,255,0.1), transparent);
          animation: slide-diagonal 8s linear infinite;
        }
        .auth-diagonal-line:nth-child(1) { animation-delay: 0s; top: 10%; }
        .auth-diagonal-line:nth-child(2) { animation-delay: 2s; top: 30%; }
        .auth-diagonal-line:nth-child(3) { animation-delay: 4s; top: 50%; }
        .auth-diagonal-line:nth-child(4) { animation-delay: 6s; top: 70%; }
        .auth-floating-icon {
          position: absolute;
          opacity: 0.2;
          animation: float 6s ease-in-out infinite;
        }
      `}</style>

      {/* Animated Background */}
      <div className="absolute inset-0">
        <div className="auth-bg-overlay"></div>
        <div className="auth-floating-elements">
          <div className="auth-diagonal-line"></div>
          <div className="auth-diagonal-line"></div>
          <div className="auth-diagonal-line"></div>
          <div className="auth-diagonal-line"></div>
          
          <div className="auth-floating-icon top-20 left-20" style={{animationDelay: '0s'}}>
            <Brain className="w-12 h-12 text-blue-400" />
          </div>
          <div className="auth-floating-icon top-40 right-32" style={{animationDelay: '1s'}}>
            <FileCheck className="w-12 h-12 text-blue-400" />
          </div>
          <div className="auth-floating-icon bottom-32 left-16" style={{animationDelay: '2s'}}>
            <Zap className="w-12 h-12 text-blue-400" />
          </div>
          <div className="auth-floating-icon bottom-20 right-20" style={{animationDelay: '3s'}}>
            <Shield className="w-12 h-12 text-blue-400" />
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="relative z-10 min-h-screen flex items-center justify-center p-4">
        <div className="max-w-md w-full">
          <button
            onClick={() => navigate("/")}
            className="flex items-center gap-2 text-white hover:text-gray-300 mb-8 font-medium transition-colors"
          >
            <ArrowLeft className="w-5 h-5" />
            Back to Home
          </button>
          <div className="bg-white rounded-2xl shadow-2xl p-8 border border-gray-100">
            {!isSubmitted ? (
              <>
                <div className="text-center mb-8">
                  <EduValidateLogo />
                  <h2 className="text-2xl font-bold text-[#021B30] mb-2 mt-6">
                    Reset Your Password
                  </h2>
                  <p className="text-gray-500">
                    Enter your email address to receive a password reset link.
                  </p>
                </div>

                <form onSubmit={handleSubmit} className="space-y-6">
                  <div>
                    <Label className="block text-sm font-semibold text-[#021B30] mb-2">
                      Email Address
                    </Label>
                    <Input
                      type="email"
                      value={email}
                      onChange={(e) => handleEmailChange(e.target.value)}
                      className={`w-full px-4 py-3 border rounded-lg transition-colors focus:ring-2 focus:ring-[#021B30] focus:border-transparent outline-none text-gray-900 bg-gray-50/50 ${error ? 'border-red-500' : 'border-gray-200'}`}
                      data-testid="input-email"
                    />
                    {error && <span className="text-red-500 text-xs mt-1 block">{error}</span>}
                  </div>

                  <Button
                    type="submit"
                    className="w-full bg-gradient-to-r from-[#021B30] to-[#032E47] hover:shadow-lg hover:shadow-blue-900/20 text-white py-3 rounded-lg font-bold text-lg transition-all duration-300 transform hover:scale-[1.02]"
                    disabled={forgotPasswordMutation.isPending}
                    data-testid="button-reset-password"
                  >
                    {forgotPasswordMutation.isPending ? "Sending Reset Link..." : "Send Reset Link"}
                  </Button>
                </form>

                <div className="mt-6 text-center">
                  <button
                    onClick={() => navigate("/")}
                    className="flex items-center justify-center text-sm text-[#021B30] hover:text-[#032E47] font-semibold w-full"
                    data-testid="button-back-to-login"
                  >
                    <ArrowLeft className="w-4 h-4 mr-2" />
                    Back to Sign In
                  </button>
                </div>
              </>
            ) : (
              <div className="text-center animate-in fade-in zoom-in duration-300">
                <div className="flex justify-center mb-6">
                  <div className="bg-blue-50 p-4 rounded-full">
                    <Mail className="w-12 h-12 text-[#021B30]" />
                  </div>
                </div>
                <h2 className="text-2xl font-bold text-[#021B30] mb-4">
                  Check Your Inbox
                </h2>
                <p className="text-gray-600 mb-8 leading-relaxed">
                  If an account associated with <span className="font-semibold text-[#021B30]">{email}</span> exists, a password reset link has been sent. Please check your inbox and spam folder.
                </p>
                <Button
                  onClick={() => navigate("/")}
                  className="w-full bg-gradient-to-r from-[#021B30] to-[#032E47] hover:shadow-lg hover:shadow-blue-900/20 text-white py-3 rounded-lg font-bold text-lg transition-all duration-300 transform hover:scale-[1.02]"
                >
                  Back to Sign In
                </Button>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
