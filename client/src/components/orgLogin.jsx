import { useState } from "react";
import { ArrowLeft, CheckCircle2 } from "lucide-react";
import { useNavigate } from "react-router-dom";
import logo from "./assets/Small 1.png";

const EduValidateLogo = () => (
  <div className="flex justify-center mb-6">
    <img src={logo} alt="EduValidate Logo" className="h-12 w-auto object-contain" />
  </div>
);

export default function OrgLogin() {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [submitted, setSubmitted] = useState(false); // New state for success screen
  const [error, setError] = useState("");
  const [fieldErrors, setFieldErrors] = useState({});

  const [formData, setFormData] = useState({
    name: "",
    email: "",
    contact_person: "",
    phone: "",
    website: "",
    description: "",
    address: "",
    org_type: "small",
  });

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
    if (fieldErrors[e.target.name]) {
      setFieldErrors(prev => {
        const newErrors = { ...prev };
        delete newErrors[e.target.name];
        return newErrors;
      });
    }
  };

  const validateForm = () => {
    const errors = {};

    // Organization Name: max 100 chars, no special characters (letters, numbers, spaces, hyphens, underscores allowed)
    if (!formData.name.trim()) errors.name = "Organization Name is required.";
    else if (formData.name.length > 100) errors.name = "Organization Name must be less than 100 characters.";
    else if (!/^[a-zA-Z0-9\s\-_]+$/.test(formData.name)) {
      errors.name = "Organization Name cannot contain special characters.";
    }

    // Contact Email: basic format
    if (!formData.email.trim()) errors.email = "Contact Email is required.";
    else {
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!emailRegex.test(formData.email)) errors.email = "Please enter a valid email address.";
    }

    // Contact Person: max 50 chars, cannot be numeric only
    if (!formData.contact_person.trim()) errors.contact_person = "Contact Person is required.";
    else if (formData.contact_person.length > 50) errors.contact_person = "Contact Person must be less than 50 characters.";
    else if (/^\d+$/.test(formData.contact_person)) errors.contact_person = "Contact Person cannot contain only numbers.";

    // Phone: optional but if provided must be numeric only, min 7, max 15
    if (formData.phone.trim()) {
      if (!/^\d+$/.test(formData.phone)) errors.phone = "Phone number must contain only numbers.";
      else if (formData.phone.length < 7 || formData.phone.length > 15) {
        errors.phone = "Phone number must be between 7 and 15 digits.";
      }
    }

    // Website: optional but if provided must contain a dot
    if (formData.website.trim()) {
      if (!formData.website.includes(".")) {
        errors.website = "Please enter a valid website URL containing an extension (e.g., .com).";
      }
    }

    // Address: max 200 chars
    if (formData.address.trim() && formData.address.length > 200) {
      errors.address = "Address must be less than 200 characters.";
    }

    // Description: max 900 chars
    if (formData.description.trim() && formData.description.length > 900) {
      errors.description = "Description must be less than 900 characters.";
    }

    return Object.keys(errors).length > 0 ? errors : null; // Return errors object or null
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setFieldErrors({});

    const validationErrors = validateForm();
    if (validationErrors) {
      setFieldErrors(validationErrors);
      return;
    }

    setLoading(true);

    const form = new FormData();
    Object.keys(formData).forEach((key) => {
      form.append(key, formData[key]);
    });

    try {
      const response = await fetch(`${import.meta.env.VITE_API_BASE_URL}/organizations/request`, {
        method: "POST",
        body: form,
      });

      const result = await response.json();

      if (response.ok) {
        setSubmitted(true); // Switch to success screen
      } else {
        // Use message from API if available
        const msg = result.message || result.error || result.detail || "Something went wrong. Please try again.";
        
        // Handle specific email existence patterns if they aren't already formatted exactly as expected
        const lowerMsg = msg.toLowerCase();
        if (lowerMsg.includes("under approval")) {
          setError("The email/account is under approval. Please login when approved.");
        } else if (lowerMsg.includes("email already exists") || lowerMsg.includes("email id already exists")) {
          setError("Email already exists.");
          setFieldErrors(prev => ({
            ...prev,
            email: "Email already exists."
          }));
        } else {
          setError(msg);
        }
      }
    } catch (err) {
      setError("Network error. Please check your connection and try again.");
    } finally {
      setLoading(false);
    }
  };

  // Success Screen
  if (submitted) {
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
        `}</style>

        <div className="auth-bg-overlay"></div>

        <div className="relative z-10 min-h-screen flex items-center justify-center p-4">
          <div className="max-w-md w-full text-center">
            {/* Back to Home */}
            <button
              onClick={() => navigate("/")}
              className="flex items-center gap-2 text-white hover:text-gray-300 mb-12 font-medium transition-colors mx-auto"
            >
              <ArrowLeft className="w-5 h-5" />
              Back to Home
            </button>

            <div className="bg-white rounded-2xl shadow-2xl p-12 border border-gray-100">
              <div className="flex justify-center mb-8">
                <div className="w-24 h-24 bg-green-100 rounded-full flex items-center justify-center">
                  <CheckCircle2 className="w-16 h-16 text-green-600" />
                </div>
              </div>

              

              <h2 className="text-3xl font-black text-[#021B30] mb-4">
                Thank You!
              </h2>

              <p className="text-lg text-gray-700 mb-6 leading-relaxed">
                Your organization request has been submitted successfully.
              </p>

              <p className="text-gray-600 font-medium">
                We will contact you via email once your account is reviewed and activated.
              </p>

              <div className="mt-10">
                <button
                  onClick={() => navigate("/")}
                  className="px-8 py-3 bg-gradient-to-r from-[#021B30] to-[#032E47] text-white rounded-lg font-bold hover:shadow-lg hover:shadow-blue-900/20 transition-all duration-300 transform hover:scale-105"
                >
                  Return to Home
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // Original Form Screen
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
      `}</style>

      <div className="auth-bg-overlay"></div>

      <div className="relative z-10 min-h-screen flex items-center justify-center p-4">
        <div className="max-w-2xl w-full">
          <div className="flex items-center justify-between mb-8">
            <button
              onClick={() => navigate("/")}
              className="flex items-center gap-2 text-white hover:text-gray-300 font-medium transition-colors"
            >
              <ArrowLeft className="w-5 h-5" />
              Back to Home
            </button>
            <div className="flex items-center gap-2 px-4 py-1.5 bg-white/10 rounded-full border border-white/20 backdrop-blur-md shadow-inner group transition-all hover:bg-white/15">
                <span className="text-[10px] uppercase tracking-[0.2em] text-blue-300 font-black">org</span>
                <div className="w-px h-3 bg-white/20"></div>
                <span className="text-sm font-bold text-white truncate max-w-[200px] drop-shadow-sm">
                  {formData.name || "New Organization"}
                </span>
            </div>
          </div>

          <div className="bg-white rounded-2xl shadow-2xl p-8 border border-gray-100">
            <div className="text-center mb-8">
              <EduValidateLogo />
              <h2 className="text-2xl font-bold text-[#021B30] mb-2 mt-6">
                Organization Signup Request
              </h2>
              <p className="text-gray-500">
                Request access for your training organization. We'll review and activate your account soon.
              </p>
            </div>

            {error && (
              <div className="mb-6 p-4 bg-red-50 border border-red-200 text-red-700 rounded-lg text-center">
                {error}
              </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-5">
              <div className="grid md:grid-cols-2 gap-5">
                <div>
                  <label className="block text-sm font-semibold text-[#021B30] mb-2">
                    Organization Name <span className="text-red-500">*</span>
                  </label>
                   <input
                    type="text"
                    name="name"
                    value={formData.name}
                    onChange={handleChange}
                    className={`w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-[#021B30] focus:border-transparent transition ${fieldErrors.name ? 'border-red-500 focus:ring-red-500' : 'border-gray-200'}`}
                  />
                  {fieldErrors.name && <span className="text-red-500 text-xs mt-1 block">{fieldErrors.name}</span>}
                </div>

                <div>
                  <label className="block text-sm font-semibold text-[#021B30] mb-2">
                    Contact Email <span className="text-red-500">*</span>
                  </label>
                   <input
                    type="email"
                    name="email"
                    value={formData.email}
                    onChange={handleChange}
                    className={`w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-[#021B30] focus:border-transparent transition ${fieldErrors.email ? 'border-red-500 focus:ring-red-500' : 'border-gray-200'}`}
                  />
                  {fieldErrors.email && <span className="text-red-500 text-xs mt-1 block">{fieldErrors.email}</span>}
                </div>

                <div>
                  <label className="block text-sm font-semibold text-[#021B30] mb-2">
                    Contact Person <span className="text-red-500">*</span>
                  </label>
                   <input
                    type="text"
                    name="contact_person"
                    value={formData.contact_person}
                    onChange={handleChange}
                    className={`w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-[#021B30] focus:border-transparent transition ${fieldErrors.contact_person ? 'border-red-500 focus:ring-red-500' : 'border-gray-200'}`}
                  />
                  {fieldErrors.contact_person && <span className="text-red-500 text-xs mt-1 block">{fieldErrors.contact_person}</span>}
                </div>

                <div>
                  <label className="block text-sm font-semibold text-[#021B30] mb-2">
                    Phone
                  </label>
                   <input
                    type="text"
                    name="phone"
                    value={formData.phone}
                    onChange={handleChange}
                    className={`w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-[#021B30] focus:border-transparent transition ${fieldErrors.phone ? 'border-red-500 focus:ring-red-500' : 'border-gray-200'}`}
                  />
                  {fieldErrors.phone && <span className="text-red-500 text-xs mt-1 block">{fieldErrors.phone}</span>}
                </div>

                <div>
                  <label className="block text-sm font-semibold text-[#021B30] mb-2">
                    Website
                  </label>
                   <input
                    type="text"
                    name="website"
                    placeholder="https://example.com"
                    value={formData.website}
                    onChange={handleChange}
                    className={`w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-[#021B30] focus:border-transparent transition ${fieldErrors.website ? 'border-red-500 focus:ring-red-500' : 'border-gray-200'}`}
                  />
                  {fieldErrors.website && <span className="text-red-500 text-xs mt-1 block">{fieldErrors.website}</span>}
                </div>

                <div>
                  <label className="block text-sm font-semibold text-[#021B30] mb-2">
                    Organization Type
                  </label>
                  <select
                    name="org_type"
                    value={formData.org_type}
                    onChange={handleChange}
                    className="w-full px-4 py-3 border border-gray-200 rounded-lg focus:ring-2 focus:ring-[#021B30] focus:border-transparent transition"
                  >
                    <option value="small">Small</option>
                    <option value="medium">Medium</option>
                    <option value="large">Large</option>
                    <option value="enterprise">Enterprise</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-sm font-semibold text-[#021B30] mb-2">
                  Address
                </label>
                 <input
                  type="text"
                  name="address"
                  value={formData.address}
                  onChange={handleChange}
                  className={`w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-[#021B30] focus:border-transparent transition ${fieldErrors.address ? 'border-red-500 focus:ring-red-500' : 'border-gray-200'}`}
                />
                {fieldErrors.address && <span className="text-red-500 text-xs mt-1 block">{fieldErrors.address}</span>}
              </div>

              <div>
                <label className="block text-sm font-semibold text-[#021B30] mb-2">
                  Description
                </label>
                 <textarea
                  name="description"
                  rows="4"
                  value={formData.description}
                  onChange={handleChange}
                  className={`w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-[#021B30] focus:border-transparent transition resize-none ${fieldErrors.description ? 'border-red-500 focus:ring-red-500' : 'border-gray-200'}`}
                />
                {fieldErrors.description && <span className="text-red-500 text-xs mt-1 block">{fieldErrors.description}</span>}
              </div>

              <button
                type="submit"
                disabled={loading}
                className="w-full bg-gradient-to-r from-[#021B30] to-[#032E47] hover:shadow-lg hover:shadow-blue-900/20 text-white py-3 rounded-lg font-bold text-lg transition-all duration-300 transform hover:scale-[1.02] disabled:opacity-70 disabled:cursor-not-allowed"
              >
                {loading ? "Submitting Request..." : "Request"}
              </button>
            </form>

            <div className="mt-6 text-center">
              <p className="text-sm text-gray-500">
                Already have access?{" "}
                <button
                  onClick={() => navigate("/login")}
                  className="text-[#021B30] hover:text-[#032E47] font-bold"
                >
                  Sign In
                </button>
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}