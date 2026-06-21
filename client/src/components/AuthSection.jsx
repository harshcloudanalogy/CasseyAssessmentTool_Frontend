import { useState } from "react";
import { ArrowLeft, CheckCircle2, Eye, EyeOff, Brain, Zap, Shield, FileCheck } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import { useToast } from "@/hooks/use-toast";
import { useMutation } from "@tanstack/react-query";
import logo from "./assets/Small 1.png";
import { useNavigate, Link, useLocation } from "react-router-dom";
import { parseJwt } from "@/lib/auth";
import ForgotPassword from "./ForgotPassword";

const EduValidateLogo = () => (
  <div className="flex justify-center mb-6">
    <Link to="/">
      <img src={logo} alt="EduValidate Logo" className="h-12 w-auto object-contain cursor-pointer hover:opacity-90 transition-opacity" />
    </Link>
  </div>
);


// Utility to check if token is expired by JWT exp claim
const isTokenExpired = (token) => {
  const decoded = parseJwt(token);
  if (decoded && decoded.exp) {
    return decoded.exp * 1000 < Date.now();
  }
  return true;
};

// Utility to check if token is expired by time (24 hours)
const isTokenExpiredByTime = () => {
  const timestamp = sessionStorage.getItem('token_timestamp');
  if (!timestamp) return true;
  const timeDiff = Date.now() - parseInt(timestamp);
  const twentyFourHours = 24 * 60 * 60 * 1000;
  return timeDiff > twentyFourHours;
};

// Validation utilities
const validateEmail = (email) => {
  return /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/.test(email);
};

const validateName = (name) => {
  return /^[a-zA-Z\s'-]+$/.test(name);
};

const validatePassword = (password) => {
  return password.length >= 4 && password.length <= 100 && !/\s/.test(password);
};

export default function AuthSection() {
  const navigate = useNavigate();
  const { toast } = useToast();
  const location = useLocation();
  const isSignUp = location.pathname === '/signup'; 
  const [showPassword, setShowPassword] = useState(false);
  const [formData, setFormData] = useState({
    email: "",
    password: "",
    firstName: "",
    lastName: "",
    organisationName: "",
    organisationKey: "",  // REQUIRED FIELD
    emailId: "",
    confirmPassword: "",
    rememberMe: false
  });
  const [errors, setErrors] = useState({});

  const loginMutation = useMutation({
    mutationFn: async (credentials) => {
      let token = sessionStorage.getItem('access_token');
      if (token && (isTokenExpired(token) || isTokenExpiredByTime())) {
        sessionStorage.removeItem('access_token');
        sessionStorage.removeItem('token_timestamp');
        token = null;
      }
      const response = await fetch(`${import.meta.env.VITE_API_BASE_URL}/login`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/x-www-form-urlencoded',
          'Authorization': `Bearer ${token || ''}`
        },
        body: new URLSearchParams({
          username: credentials.email,
          password: credentials.password
        })
      });
      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.detail || errorData.message || 'Login failed', { cause: response.status });
      }
      const data = await response.json();
      if (data.access_token) {
        sessionStorage.setItem('access_token', data.access_token);
        sessionStorage.setItem('token_timestamp', Date.now().toString());
      }
      return data;
    },
    onSuccess: (data) => {
  // console.log("🔐 [Login] Login successful!");
  // console.log("🔐 [Login] Access token:", data.access_token);
  
  const decoded = parseJwt(data.access_token);
  // console.log("🔐 [Login] Decoded JWT payload:", decoded);
  // console.log("🔐 [Login] Available fields:", Object.keys(decoded || {}));
  // console.log("🔐 [Login] Role:", decoded?.role);
  // console.log("🔐 [Login] Organization ID (organization_id):", decoded?.organization_id);
  // console.log("🔐 [Login] Organization ID (org_id):", decoded?.org_id);
  // console.log("🔐 [Login] ID:", decoded?.id);
  
  const role = decoded?.role;

  toast({
    title: "Success",
    description: "Login successful! Redirecting...",
  });

  setTimeout(() => {
    if (role === 0) {
      // console.log("🔐 [Login] Redirecting to /admin (Super Admin)");
      navigate("/admin");
    } else if (role === 1 || role === 2) {
      // console.log(`🔐 [Login] Redirecting to /orgdashboard (Role: ${role})`);
      navigate("/orgdashboard");
    } else {
      // console.log("🔐 [Login] Redirecting to /documents (Fallback)");
      navigate("/documents");
    }
  }, 1000);
},

    onError: (error) => {
        toast({
          title: "Login Failed",
          description: error.message || "Invalid credentials. Please try again.",
          variant: "destructive",
        });
    }
  });

  const signUpMutation = useMutation({
    mutationFn: async (userData) => {
      let token = sessionStorage.getItem('access_token');
      if (token && (isTokenExpired(token) || isTokenExpiredByTime())) {
        sessionStorage.removeItem('access_token');
        sessionStorage.removeItem('token_timestamp');
        token = null;
      }
      const body = new URLSearchParams();
      body.append('first_name', userData.firstName);
      body.append('last_name', userData.lastName);
      if (userData.organisationName) {
        body.append('organisation_name', userData.organisationName);
      }

      // REQUIRED FIELD NOW
      body.append('organisation_key', userData.organisationKey);

      body.append('email_id', userData.emailId);
      body.append('password', userData.password);

      const response = await fetch(`${import.meta.env.VITE_API_BASE_URL}/signup`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/x-www-form-urlencoded',
          'Authorization': `Bearer ${token || ''}`
        },
        body: body
      });
      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.detail || errorData.message || 'Signup failed', { cause: response.status });
      }
      const data = await response.json();
      if (data.access_token) {
        sessionStorage.setItem('access_token', data.access_token);
        sessionStorage.setItem('token_timestamp', Date.now().toString());
      }
      return data;
    },
    onSuccess: () => {
      toast({
        title: "Account Created",
        description: "Your account has been created successfully! Please sign in.",
      });
      navigate('/login');
      setFormData({
        email: "",
        password: "",
        firstName: "",
        lastName: "",
        organisationName: "",
        organisationKey: "",
        emailId: "",
        confirmPassword: "",
        rememberMe: false
      });
    },
    onError: (error) => {
        if (error.message.toLowerCase().includes("email id already exists") || error.message.toLowerCase().includes("email already exists")) {
            setErrors(prev => ({
                ...prev,
                emailId: "Email already exists."
            }));
            toast({
                title: "Duplicate Email",
                description: "Email already exists.",
                variant: "destructive",
            });
        } else {
            toast({
              title: "Sign Up Failed",
              description: error.message || "Failed to create account. Please try again.",
              variant: "destructive",
            });
        }
    }
  });

  const handleSubmit = (e) => {
    e.preventDefault();
    const newErrors = {};
    
    if (isSignUp) {
      if (!formData.firstName.trim()) {
        newErrors.firstName = "First name is required.";
      } else if (!validateName(formData.firstName)) {
        newErrors.firstName = "First name should only contain letters, spaces, hyphens and apostrophes.";
      }

      if (!formData.lastName.trim()) {
        newErrors.lastName = "Last name is required.";
      } else if (!validateName(formData.lastName)) {
        newErrors.lastName = "Last name should only contain letters, spaces, hyphens and apostrophes.";
      }

      if (!formData.organisationKey.trim()) {
        newErrors.organisationKey = "Organisation Key is required.";
      }

      if (!formData.emailId.trim()) {
        newErrors.emailId = "Email address is required.";
      } else if (formData.emailId.toLowerCase().startsWith('mailto:')) {
        newErrors.emailId = "Email address should not start with 'mailto:'.";
      } else if (!validateEmail(formData.emailId)) {
        newErrors.emailId = "Please enter a valid email address.";
      }

      if (!formData.password) {
        newErrors.password = "Password is required.";
      } else if (!validatePassword(formData.password)) {
        if (/\s/.test(formData.password)) {
          newErrors.password = "Password should not contain spaces.";
        } else if (formData.password.length < 4) {
          newErrors.password = "Password must be at least 4 characters long.";
        } else if (formData.password.length > 100) {
          newErrors.password = "Password cannot exceed 100 characters.";
        }
      }

      if (!formData.confirmPassword) {
        newErrors.confirmPassword = "Please confirm your password.";
      } else if (formData.password !== formData.confirmPassword) {
        newErrors.confirmPassword = "Passwords do not match.";
      }
      
      if (Object.keys(newErrors).length > 0) {
        setErrors(newErrors);
        return;
      }

      signUpMutation.mutate({
        firstName: formData.firstName,
        lastName: formData.lastName,
        organisationName: formData.organisationName,
        organisationKey: formData.organisationKey,
        emailId: formData.emailId,
        password: formData.password
      });
    } else {
      if (!formData.email.trim()) {
        newErrors.email = "Email address is required.";
      } else if (formData.email.toLowerCase().startsWith('mailto:')) {
        newErrors.email = "Email address should not start with 'mailto:'.";
      } else if (!validateEmail(formData.email)) {
        newErrors.email = "Please enter a valid email address.";
      }

      if (!formData.password) {
        newErrors.password = "Password is required.";
      }

      if (Object.keys(newErrors).length > 0) {
        setErrors(newErrors);
        return;
      }

      loginMutation.mutate({
        email: formData.email,
        password: formData.password
      });
    }
  };

  const handleInputChange = (field, value) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
    if (errors[field]) {
      setErrors(prev => ({ ...prev, [field]: "" }));
    }
  };

  const toggleMode = () => {
    navigate(isSignUp ? '/login' : '/signup');
    setErrors({});
    setFormData(prev => ({
      ...prev,
      email: "",
      password: "",
      firstName: "",
      lastName: "",
      organisationName: "",
      organisationKey: "",
      emailId: "",
      confirmPassword: "",
      rememberMe: false
    }));
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
            <div className="text-center mb-8">
              <EduValidateLogo />
              <h2 className="text-2xl font-bold text-[#021B30] mb-2 mt-6">
                {isSignUp ? "Create Account" : "Welcome Back"}
              </h2>
              <p className="text-gray-500">
                {isSignUp 
                  ? "Join EduValidate and start validating assessments with AI" 
                  : "Sign in to your EduValidate account"
                }
              </p>
            </div>

            <form onSubmit={handleSubmit} className="space-y-5">
              
              {/* -------- LOGIN SECTION -------- */}
              {!isSignUp && (
                <>
                  <div>
                    <Label className="block text-sm font-semibold text-[#021B30] mb-2">
                      Email Address
                    </Label>
                    <Input
                      type="email"
                      value={formData.email}
                      onChange={(e) => handleInputChange("email", e.target.value)}
                      className={`w-full px-4 py-3 border rounded-lg transition-colors ${errors.email ? 'border-red-500 focus-visible:ring-red-500' : 'border-gray-200'}`}
                    />
                    {errors.email && <span className="text-red-500 text-xs mt-1 block">{errors.email}</span>}
                  </div>
                  
                  <div>
                    <Label className="block text-sm font-semibold text-[#021B30] mb-2">
                      Password
                    </Label>
                    <div className="relative">
                      <Input
                        type={showPassword ? "text" : "password"}
                        value={formData.password}
                        onChange={(e) => handleInputChange("password", e.target.value)}
                        className={`w-full px-4 py-3 pr-12 border rounded-lg transition-colors ${errors.password ? 'border-red-500 focus-visible:ring-red-500' : 'border-gray-200'}`}
                      />
                      <button
                        type="button"
                        onClick={() => setShowPassword(!showPassword)}
                        className="absolute right-4 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-[#021B30]"
                      >
                        {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                      </button>
                    </div>
                    {errors.password && <span className="text-red-500 text-xs mt-1 block">{errors.password}</span>}
                  </div>
                </>
              )}

              {/* Forgot Password */}
              {!isSignUp && (
                <div className="flex items-center justify-end">
                  <Link
                    to="/forgot-password"
                    className="text-sm text-[#021B30] hover:text-[#032E47] font-medium underline-offset-4 hover:underline transition-colors"
                  >
                    Forgot password?
                  </Link>
                </div>
              )}

              {/* -------- SIGN UP SECTION -------- */}
              {isSignUp && (
                <>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <Label className="block text-sm font-semibold text-[#021B30] mb-2">
                        First Name <span className="text-red-500">*</span>
                      </Label>
                      <Input
                        type="text"
                        value={formData.firstName}
                        onChange={(e) => handleInputChange("firstName", e.target.value)}
                        className={`w-full px-4 py-3 border rounded-lg transition-colors ${errors.firstName ? 'border-red-500 focus-visible:ring-red-500' : 'border-gray-200'}`}
                      />
                      {errors.firstName && <span className="text-red-500 text-xs mt-1 block">{errors.firstName}</span>}
                    </div>
                    <div>
                      <Label className="block text-sm font-semibold text-[#021B30] mb-2">
                        Last Name <span className="text-red-500">*</span>
                      </Label>
                      <Input
                        type="text"
                        value={formData.lastName}
                        onChange={(e) => handleInputChange("lastName", e.target.value)}
                        className={`w-full px-4 py-3 border rounded-lg transition-colors ${errors.lastName ? 'border-red-500 focus-visible:ring-red-500' : 'border-gray-200'}`}
                      />
                      {errors.lastName && <span className="text-red-500 text-xs mt-1 block">{errors.lastName}</span>}
                    </div>
                  </div>

                  <div>
                    <Label className="block text-sm font-semibold text-[#021B30] mb-2">
                      Organisation Name <span className="text-gray-400 text-xs">(optional)</span>
                    </Label>
                    <Input
                      type="text"
                      value={formData.organisationName}
                      onChange={(e) => handleInputChange("organisationName", e.target.value)}
                      className="w-full px-4 py-3 border border-gray-200 rounded-lg"
                    />
                  </div>

                  {/* REQUIRED FIELD */}
                  <div>
                    <Label className="block text-sm font-semibold text-[#021B30] mb-2">
                      Organisation Key <span className="text-red-500">*</span>
                    </Label>
                    <Input
                      type="text"
                      value={formData.organisationKey}
                      onChange={(e) => handleInputChange("organisationKey", e.target.value)}
                      className={`w-full px-4 py-3 border rounded-lg transition-colors ${errors.organisationKey ? 'border-red-500 focus-visible:ring-red-500' : 'border-gray-200'}`}
                    />
                    {errors.organisationKey && <span className="text-red-500 text-xs mt-1 block">{errors.organisationKey}</span>}
                  </div>

                  <div>
                    <Label className="block text-sm font-semibold text-[#021B30] mb-2">
                      Email Address <span className="text-red-500">*</span>
                    </Label>
                    <Input
                      type="email"
                      value={formData.emailId}
                      onChange={(e) => handleInputChange("emailId", e.target.value)}
                      className={`w-full px-4 py-3 border rounded-lg transition-colors ${errors.emailId ? 'border-red-500 focus-visible:ring-red-500' : 'border-gray-200'}`}
                    />
                    {errors.emailId && <span className="text-red-500 text-xs mt-1 block">{errors.emailId}</span>}
                  </div>

                  <div>
                    <Label className="block text-sm font-semibold text-[#021B30] mb-2">
                      Password <span className="text-red-500">*</span>
                    </Label>
                    <div className="relative">
                      <Input
                        type={showPassword ? "text" : "password"}
                        value={formData.password}
                        onChange={(e) => handleInputChange("password", e.target.value)}
                        className="w-full px-4 py-3 pr-12 border border-gray-200 rounded-lg"
                        required
                      />
                      <button
                        type="button"
                        onClick={() => setShowPassword(!showPassword)}
                        className="absolute right-4 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-[#021B30]"
                      >
                        {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                      </button>
                    </div>
                  </div>

                  <div>
                    <Label className="block text-sm font-semibold text-[#021B30] mb-2">
                      Confirm Password <span className="text-red-500">*</span>
                    </Label>
                    <Input
                      type="password"
                      value={formData.confirmPassword}
                      onChange={(e) => handleInputChange("confirmPassword", e.target.value)}
                      className={`w-full px-4 py-3 border rounded-lg transition-colors ${errors.confirmPassword ? 'border-red-500 focus-visible:ring-red-500' : 'border-gray-200'}`}
                    />
                    {errors.confirmPassword && <span className="text-red-500 text-xs mt-1 block">{errors.confirmPassword}</span>}
                  </div>
                </>
              )}
              
              <Button 
                type="submit" 
                className="w-full bg-gradient-to-r from-[#021B30] to-[#032E47] hover:shadow-lg hover:shadow-blue-900/20 text-white py-3 rounded-lg font-bold text-lg transition-all duration-300 transform hover:scale-[1.02]"
                disabled={loginMutation.isPending || signUpMutation.isPending}
              >
                {(loginMutation.isPending || signUpMutation.isPending) ? (
                  isSignUp ? "Creating Account..." : "Signing in..."
                ) : (
                  isSignUp ? "Create Account" : "Sign In"
                )}
              </Button>
            </form>

            <div className="mt-6 text-center">
              <p className="text-sm text-gray-500">
                {isSignUp ? "Already have an account?" : "Don't have an account?"}{" "}
                <button 
                  type="button"
                  onClick={toggleMode}
                  className="text-[#021B30] hover:text-[#032E47] font-bold"
                >
                  {isSignUp ? "Sign in" : "Sign up"}
                </button>
              </p>
            </div>

          </div>
        </div>
      </div>
    </div>
  );
}
