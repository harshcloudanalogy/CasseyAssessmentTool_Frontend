// src/components/ResetPassword.jsx
import { useState } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { useToast } from "@/hooks/use-toast";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useMutation } from "@tanstack/react-query";
import { ArrowLeft, Brain, Zap, Shield, FileCheck } from "lucide-react";
import logo from "./assets/Small 1.png";

const EduValidateLogo = () => (
  <div className="flex justify-center mb-6">
    <img src={logo} alt="EduValidate Logo" className="h-12 w-auto object-contain" />
  </div>
);

export default function ResetPassword() {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const { toast } = useToast();

  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [errors, setErrors] = useState({});

  const token = searchParams.get("token");

  const resetPasswordMutation = useMutation({
    mutationFn: async (newPassword) => {
      const formData = new FormData();
      formData.append("new_password", newPassword);
      formData.append("token", token); // Sending token in body

      const response = await fetch(`${import.meta.env.VITE_API_BASE_URL}/reset-password`, {
        method: 'POST',
        body: formData, // Sending as FormData
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.message || 'Failed to reset password');
      }
      return response.json();
    },
    onSuccess: () => {
      toast({
        title: "Success!",
        description: "Your password has been reset successfully.",
      });
      setTimeout(() => navigate("/"), 2000);
    },
    onError: (error) => {
      toast({
        title: "Error",
        description: error.message || "Failed to reset password. Link may be expired or invalid.",
        variant: "destructive",
      });
    },
  });

  const handlePasswordChange = (name, val) => {
    if (name === "password") setPassword(val);
    else setConfirmPassword(val);
    if (errors[name]) {
      setErrors(prev => {
        const newErrs = { ...prev };
        delete newErrs[name];
        return newErrs;
      });
    }
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    const newErrors = {};

    if (!token) {
      toast({
        title: "Invalid Link",
        description: "Reset token is missing. Please use a valid password reset link.",
        variant: "destructive",
      });
      return;
    }

    if (!password) {
      newErrors.password = "Password is required.";
    } else if (password.length < 8) {
      newErrors.password = "Password must be at least 8 characters long.";
    }

    if (!confirmPassword) {
      newErrors.confirmPassword = "Please confirm your password.";
    } else if (password !== confirmPassword) {
      newErrors.confirmPassword = "Passwords do not match.";
    }

    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      return;
    }

    resetPasswordMutation.mutate(password);
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

      {/* Main Content */}
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
            <div className="text-center mb-8">
              <EduValidateLogo />
              <h2 className="text-2xl font-bold text-[#021B30] mb-2 mt-6">
                Set New Password
              </h2>
              <p className="text-gray-500">
                Enter your new password below
              </p>
            </div>

            <form onSubmit={handleSubmit} className="space-y-6">
              <div>
                <Label className="block text-sm font-semibold text-[#021B30] mb-2">
                  New Password
                </Label>
                <Input
                  type="password"
                  placeholder="Enter new password"
                  value={password}
                  onChange={(e) => handlePasswordChange("password", e.target.value)}
                  className={`w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-[#021B30] focus:border-transparent outline-none transition-all text-gray-900 bg-gray-50/50 ${errors.password ? 'border-red-500' : 'border-gray-200'}`}
                />
                {errors.password && <span className="text-red-500 text-xs mt-1 block">{errors.password}</span>}
              </div>

              <div>
                <Label className="block text-sm font-semibold text-[#021B30] mb-2">
                  Confirm New Password
                </Label>
                <Input
                  type="password"
                  placeholder="Confirm new password"
                  value={confirmPassword}
                  onChange={(e) => handlePasswordChange("confirmPassword", e.target.value)}
                  className={`w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-[#021B30] focus:border-transparent outline-none transition-all text-gray-900 bg-gray-50/50 ${errors.confirmPassword ? 'border-red-500' : 'border-gray-200'}`}
                />
                {errors.confirmPassword && <span className="text-red-500 text-xs mt-1 block">{errors.confirmPassword}</span>}
              </div>

              <Button
                type="submit"
                className="w-full bg-gradient-to-r from-[#021B30] to-[#032E47] hover:shadow-lg hover:shadow-blue-900/20 text-white py-3 rounded-lg font-bold text-lg transition-all duration-300 transform hover:scale-[1.02]"
                disabled={resetPasswordMutation.isPending}
              >
                {resetPasswordMutation.isPending ? "Resetting Password..." : "Reset Password"}
              </Button>
            </form>

            <div className="mt-6 text-center">
              <button
                onClick={() => navigate("/")}
                className="flex items-center justify-center text-sm text-[#021B30] hover:text-[#032E47] font-semibold w-full"
              >
                <ArrowLeft className="w-4 h-4 mr-2" />
                Back to Sign In
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}