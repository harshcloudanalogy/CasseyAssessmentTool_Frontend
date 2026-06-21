// src/App.jsx
import { queryClient } from "./lib/queryClient";
import { QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import LandingPage from "@/components/LandingPage";
import AuthSection from "@/components/AuthSection";
import DocumentSelection from "@/components/DocumentSelection";
import ValidationReport from "@/components/ValidationReport";
import NotFound from "@/pages/not-found";
import ForgotPassword from "@/components/ForgotPassword";
import ResetPassword from "@/components/ResetPassword"; // ← NEW
import PaymentSuccess from "@/components/PaymentSuccess";
import PaymentCancel from "@/components/PaymentCancel";
import { useEffect } from "react";
import { Routes, Route } from "react-router-dom";
import AdminDashboard from "@/components/Index";
import OrgDashboardIndex from "@/components/OrgDashboardIndex";
import AdminLayout from "@/components/AdminLayout";
import OrgLogin from "@/components/OrgLogin";
import LegalPage from "@/components/LegalPage"; // ← NEW

function App() {
  useEffect(() => {
    if (typeof window !== "undefined") {
      import("aos").then((AOS) => {
        AOS.init({
          duration: 800,
          easing: "ease-out",
          once: true,
        });
      });
    }
  }, []);

  return (
    <QueryClientProvider client={queryClient}>
      <TooltipProvider>
        <Routes>
          <Route path="/" element={<LandingPage />} />
          <Route path="/login" element={<AuthSection />} />
          <Route path="/signup" element={<AuthSection />} />
          <Route path="/org-login" element={<OrgLogin />} />
          <Route path="/documents" element={<DocumentSelection />} />
          <Route path="/report-status" element={<DocumentSelection />} />
          <Route path="/report" element={<ValidationReport />} />

          {/* Legal routes */}
          <Route path="/privacy-policy" element={<LegalPage />} />
          <Route path="/ai-transparency" element={<LegalPage />} />
          <Route path="/terms-of-service" element={<LegalPage />} />
          <Route path="/contact" element={<LegalPage />} />

          {/* Forgot & Reset Password routes */}
          <Route path="/forgot-password" element={<ForgotPassword />} />
          <Route path="/reset-password" element={<ResetPassword />} /> {/* ← NEW */}

          {/* Payment Success & Cancel routes */}
          <Route path="/payment-success" element={<PaymentSuccess />} />
          <Route path="/payment-canceled" element={<PaymentCancel />} />

          {/* Admin Route with Layout */}
          <Route element={<AdminLayout />}>
            <Route path="/admin" element={<AdminDashboard />} />
          </Route>

          {/* Organization Route with Layout */}
          <Route element={<AdminLayout isOrg={true} />}>
            <Route path="/orgdashboard" element={<OrgDashboardIndex />} />
          </Route>

          <Route path="*" element={<NotFound />} />
        </Routes>
        <Toaster />
      </TooltipProvider>
    </QueryClientProvider>
  );
}

export default App;