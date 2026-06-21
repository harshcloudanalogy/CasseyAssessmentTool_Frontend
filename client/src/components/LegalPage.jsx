import React from "react";
import { Link, useLocation } from "react-router-dom";

export default function LegalPage() {
  const location = useLocation();
  let title = "Document";
  let content = "This is a dummy statement for development purposes.";

  if (location.pathname === "/privacy-policy") {
    title = "Privacy Policy";
    content = <p>This is a dummy privacy policy statement. Your data is secure and will only be used for validation purposes.</p>;
  } else if (location.pathname === "/ai-transparency") {
    title = "AI Transparency Statement";
    content = <p>This is a dummy AI transparency statement. Our AI processes documents locally in the Australian region without training on your data.</p>;
  } else if (location.pathname === "/terms-of-service") {
    title = "Terms of Service";
    content = <p>This is a dummy Terms of Service. By using EduValidate, you agree to these dummy terms.</p>;
  } else if (location.pathname === "/contact") {
    title = "Contact Us";
    content = (
      <div className="space-y-4">
        <p>We're here to help! If you have any questions, feedback, or need assistance with EduValidate, please don't hesitate to reach out.</p>
        <p className="text-xl mt-6">
          You can contact our support team directly at:{' '}
          <a href="mailto:helman.casey@gmail.com" className="font-bold text-[#00cfa7] hover:text-[#00bda0] transition-colors bg-[#00cfa7]/10 px-2 py-1 rounded">
            helman.casey@gmail.com
          </a>
        </p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-white flex flex-col">
      <nav className="p-6 border-b border-gray-100">
        <Link to="/" className="text-[#021B30] font-bold text-lg hover:underline">
          &larr; Back to Home
        </Link>
      </nav>
      <main className="flex-1 max-w-4xl mx-auto w-full p-8 md:p-16">
        <h1 className="text-4xl font-black text-[#021B30] mb-8">{title}</h1>
        <div className="prose prose-lg text-gray-700">
          {content}
        </div>
      </main>
      <footer className="p-6 text-center text-gray-500 border-t border-gray-100 text-sm">
        © 2026 EduValidate Pty Ltd
      </footer>
    </div>
  );
}
